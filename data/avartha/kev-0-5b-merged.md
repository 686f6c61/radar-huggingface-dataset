# avartha/kev-0.5b-merged

## Resumen

avartha/kev-0.5b-merged es una derivada **no oficial** del modelo de decision Kev 0.5B de Jared Palmer, preparada por Avartha. Se trata de un artefacto de pesos ya fusionados: el adaptador LoRA de Kev se ha integrado en los pesos del backbone Qwen2.5-0.5B (en la revision fijada del base), de modo que el repositorio contiene directamente el backbone en bf16 con el ajuste fino aplicado, junto con la cabeza de punteros (pointer head) en fp32 como `head.safetensors`. No es un modelo generativo: Kev nunca utiliza la LM head, sino que produce una distribucion de probabilidad sobre las opciones de cada pregunta formulada.

El modelo resuelve un problema muy concreto: dado un documento o estado (la "state") y un conjunto de preguntas tipadas, devuelve en una unica pasada forward una distribucion de probabilidad por pregunta. Es, por tanto, un modelo de decision y clasificacion multiple-choice, no un generador de texto. Su interes practico esta en su tamano (494.032.768 parametros reales) y en que puede ejecutarse en CPU o en GPU de gama baja, lo que lo hace util como componente de enrutado, etiquetado o calibracion dentro de pipelines mayores.

La relevancia de esta ficha es doble: por un lado documenta un artefacto derivado con una verificacion bit a bit frente a la fusion bf16 original de Kev; por otro, advierte de que la model card deja constancia explicita de que no es una publicacion respaldada por el autor original y de que el rendimiento en las suites de evaluacion de Kev no se ha medido en esta derivada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2.5 attention-only (sin uso de la LM head), con cabeza de punteros Kev (pointer head) |
| Parametros totales | 494.032.768 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible; el repo solo publica backbone bf16 y cabeza fp32 |
| Idiomas soportados | no disponible en este repo; la model card original de Kev esta etiquetada como ingles |
| Licencia | Apache-2.0 (tanto Kev como los pesos base Qwen2.5; ver `LICENSE` y `LICENSE-QWEN`) |
| Formato de pesos | safetensors (`model.safetensors` bf16, 988.097.824 bytes; `head.safetensors` fp32), mas `head.pt` en PyTorch |

Tensores de la cabeza de punteros (`kev_head.json`):

| Tensor | Shape | dtype |
|---|---|---|
| `q.weight` | [256, 896] | float32 |
| `q.bias` | [256] | float32 |
| `k.weight` | [256, 896] | float32 |
| `k.bias` | [256] | float32 |
| `temperature` | [] | float32 |

## Arquitectura y entrenamiento

El backbone es Qwen2.5-0.5B en su variante attention-only, en bf16, con el ajuste fino de Kev ya aplicado. Sobre ese backbone se anade una cabeza de punteros que opera sobre el hidden state final normalizado: `h`. La lectura de logits es `logit_j = ((W_k h_opt_j + b_k) . (W_q h_decide + b_q)) / sqrt(256) / T`, seguida de un softmax sobre las opciones de la pregunta. La temperatura T aplicada por el loader de Kev es 1.0, porque `head.pt` no almacena temperatura; la model card original cita T=1.47, pero ese valor no esta guardado en `head.pt` y por tanto no lo aplica el loader.

El layout de tokens es especifico y no usa plantilla de chat: `<|fim_prefix|>` para el estado, `<|fim_middle|>` para la pregunta, `<|box_start|>`/`<|box_end|>` para cada opcion y `<|fim_suffix|>` para la decision. Cada pregunta es una fila causal que continua el estado, sin dialogo multi-turno. El tokenizer, `config.json` y los ficheros de preprocesado provienen del base en la revision fijada; el loader de Kev siempre carga el tokenizer desde el base.

En cuanto al procedimiento de fusion, se aplico `upstream/kev_merge.py` (sha256 `260f41d81bb9901b6991b36869dabe0930611c360ab3c0c1a4d7eb7de9331eed`), procesando un shard del base a la vez en CPU. Para cada Linear adaptado: `W_bf16 = bf16(fp32(W) + (B @ A) * 2.0)`, donde `2.0 = lora_alpha / r = 32 / 16` proviene del `adapter_config.json` (LoRA plano: sin DoRA, sin rsLoRA, sin patrones de rango ni alpha). Se aplicaron 168 de 168 modulos adaptados y el script falla si falta alguno. El resto de tensores se copian bit a bit, incluidos los que el base almacena en fp32; no se descarto nada porque el base no tiene tensores MTP ni de vision. La salida son 290 tensores y 988.065.536 bytes.

## Capacidades

- Decision tipada y multiple-choice: dada una state y un conjunto de preguntas, devuelve una distribucion de probabilidad por pregunta en una sola pasada forward.
- Clasificacion con probabilidades calibrables: la salida es un softmax sobre las opciones, lo que permite fijar umbrales y comparar alternativas dentro de la misma pregunta.
- Procesamiento multi-pregunta en una pasada: no requiere una llamada por pregunta; el estado se comparte y cada pregunta es una fila causal que lo continua.
- No genera texto: el modelo no utiliza la LM head, por lo que no produce respuestas en lenguaje natural.
- Sin soporte de tool calling ni function calling: no hay plantilla de chat ni interfaz de herramientas.
- Sin soporte de agentes ni de razonamiento multi-paso declarado en la informacion disponible.
- Capacidades multilingues: no disponibles; el upstream esta etiquetado como ingles.
- Capacidad especial: cabeza de punteros con contrato de tokenizacion propio basado en tokens FIM (`<|fim_prefix|>`, `<|fim_middle|>`, `<|box_start|>`, `<|box_end|>`, `<|fim_suffix|>`).

## Casos de uso

- Enrutado de tickets o consultas: usar el estado acumulado de una conversacion como state y formular preguntas tipadas sobre la categoria o la cola de destino, aprovechando que el modelo devuelve una distribucion de probabilidad por pregunta y permite fijar umbrales de confianza.
- Moderacion y clasificacion de politica de contenido: dado un texto como state, formular preguntas binarias o de opciones cerradas sobre el cumplimiento de cada politica, con una unica pasada forward y coste de computo minimo.
- Etiquetado y anotacion de datasets: integrar el modelo en un pipeline de anotacion para pre-etiquetar registros estructurados o documentos, generando probabilidades que un humano pueda revisar por encima de un umbral.
- Extraccion de decisiones estructuradas de documentos: sobre contratos, informes o formularios, plantear preguntas de opciones cerradas para determinar campos como tipo de clausula o estado de un expediente.
- Evaluacion automatica de respuestas: dado un enunciado y una respuesta como state, formular preguntas sobre correccion o categoria de error, usando la distribucion de salida como senal de puntuacion.
- Componente de decision en un pipeline de RL o de agentes: emplearlo como "System One" para decidir la siguiente accion tipada dentro de un flujo mayor, ya que es barato (494 M de parametros) y puede correr en CPU, como demuestra la verificacion realizada sin GPU.
- Deteccion de intencion en asistentes: mantener el estado de la conversacion y consultar la intencion mas probable entre un conjunto cerrado de opciones, con la ventaja de no necesitar generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha medido la precision en las suites de evaluacion de Kev ni el servicio end-to-end en GPU.

Lo que si se aporta es una verificacion de fidelidad numerica (CPU, 5 peticiones cortas de System One con recuentos de tokens [48, 50, 43, 35, 64]), comparando este artefacto contra la referencia de Kev (fp32, adaptador sin fusionar, `head.pt`):

| Brazo comparado | max abs en hidden | max rel L2 en hidden | max abs en probs | coincidencia de argmax |
|---|---|---|---|---|
| fp32 fusionado (PEFT `merge_and_unload`) vs fp32 sin fusionar | 0,000229 | 3,19e-06 | 1,55e-06 | 7/7 |
| este artefacto, pesos bf16, computo fp32 | 2 | 0,0203 | 0,00152 | 7/7 |
| este artefacto, pesos bf16, computo bf16 (forma servida) | 13,3 | 0,136 | 0,0187 | 7/7 |

Se verifico ademas que los 290 tensores del backbone son identicos bit a bit a la fusion fp32 de PEFT de kev-src tras castear a bf16, que `head.safetensors` coincide con `head.pt` y que la temperatura coincide con la del loader redondeada a fp32. La deriva en bf16 es inherente al servicio en bf16; la model card senala que los propios cards de Kev reportan para el 4B una deriva en forma servida dentro de 0,017 respecto a fp32, mientras que aqui el maximo `|dp|` en forma servida es 0,0187; con pesos bf16 y computo fp32 baja a 0,0015, por lo que la mayor parte de la deriva procede de la aritmetica bf16 y no del redondeo de la fusion.

## Requisitos de hardware

- Peso de los parametros: ~988 MB en bf16 (backbone) mas ~1,8 MB de cabeza fp32. Repo completo: 1,0 GB.
- VRAM estimada para inferencia: aproximadamente 1,1-1,5 GB en bf16 con overhead de runtime; ~1,98 GB si se cargan pesos en fp32 (calculo aritmetico a partir de 494 M de parametros, no medido en la informacion disponible). En int8 serian ~0,5 GB y en int4 ~0,25 GB, aunque el repo no publica pesos cuantizados.
- Cabe en GPU de consumo: si, con margen amplio; cualquier GPU con 2 GB o mas de VRAM puede alojar los pesos en bf16. La verificacion del autor se hizo integramente en CPU, sin GPU.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, una RTX 3060, RTX 4060 o superior es sobradamente suficiente. A100/H100 no son necesarias.
- Opciones de despliegue: se requiere el loader de Kev (kev-src) con su `encode()`, `rows_of()`, `DecisionModel.probs()` y `PointerHead`. No se puede servir con stacks de generacion estandar (vLLM, llama.cpp, Ollama, TGI) sin trabajo adicional, porque no hay plantilla de chat y el modelo no utiliza la LM head.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avartha/kev-0.5b-merged | 494.032.768 | no disponible | safetensors (bf16 backbone + fp32 head) | Apache-2.0 | Derivada no oficial; 0 descargas, 0 likes en el momento de la consulta |
| jaredpalmer/kev-0.5b | no disponible (0.5B segun nombre) | no disponible | PEFT + safetensors (adaptador LoRA) | Apache-2.0 | Oficial; requiere aplicar el adaptador |
| Qwen/Qwen2.5-0.5B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | Apache-2.0 | Modelo base generativo, ampliamente disponible |
| Variante Kev de 4B (mencionada en la model card) | ~4B segun denominacion | no disponible | no disponible | Apache-2.0 | Oficial, segun la model card citada |

## Limitaciones y advertencias

- Derivada no oficial: la model card indica explicitamente que no esta respaldada por el autor de Kev (Jared Palmer). Para uso en produccion conviene decidir entre esta fusion ya preparada o el adaptador oficial.
- No es un modelo generativo: no produce texto; cualquier expectativa de chat o generacion queda fuera de su contrato.
- Sin plantilla de chat: el modelo consume filas causales con el layout FIM documentado. Introducir plantillas de conversacion rompe el contrato de tokens.
- Deriva numerica en bf16: con pesos bf16 y computo bf16 el maximo `|dp|` medido es 0,0187 frente a la referencia fp32, superior al 0,017 que los cards de Kev reportan para el 4B. Si el caso de uso es sensible a la calibracion, conviene evaluar el computo en fp32.
- Ambiguedad de temperatura: la model card original cita T=1.47, pero `head.pt` no la almacena y el loader aplica 1.0. Es un punto de discrepancia documentado que puede afectar a la interpretacion de las probabilidades.
- Sin evaluacion de precision: no se ha medido la precision en las suites de evaluacion de Kev ni el servicio end-to-end en GPU.
- Idiomas: no disponibles; el upstream esta etiquetado como ingles, por lo que el rendimiento en castellano es incierto.
- Riesgo de alusion: como cualquier modelo de clasificacion, puede producir probabilidades sobreconfiadas en entradas fuera de distribucion; no hay datos de calibracion para esta derivada.
- Licencia: Apache-2.0 tanto para Kev como para los pesos base Qwen2.5, con ficheros `LICENSE` y `LICENSE-QWEN` incluidos, lo que permite uso comercial, pero conviene revisar las condiciones del modelo base.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-10-05), sin pipeline declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avartha/kev-0.5b-merged
- Modelo original de Kev: https://huggingface.co/jaredpalmer/kev-0.5b
- Ficheros del modelo original: https://huggingface.co/jaredpalmer/kev-0.5b/tree/main
- Repositorio de codigo de Kev: https://github.com/jaredpalmer/kev
- Model card de Kev-0.5B en el repositorio: https://github.com/jaredpalmer/kev/blob/main/docs/model-cards/kev-0.5b.md
- Base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Ficha tecnica de Kev 0.5B en gradually.ai: https://www.gradually.ai/en/ai-models/kev-0.5b/
