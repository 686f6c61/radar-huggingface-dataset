# joshycodes/gemma4-12b-sorrel-selfloop-g4-midtrain

## Resumen

El modelo `joshycodes/gemma4-12b-sorrel-selfloop-g4-midtrain` es un checkpoint intermedio de *continued pretraining* (etapa "midtrain") desarrollado por el usuario joshycodes en el marco de un proyecto de investigación privado sobre entrenamiento de carácter con enfoque de *flourishing* (proyecto de fellows, según la model card, con referencia a una propuesta de Wang y Jermyn de abril de 2026). No se trata de un modelo instructivo ni de un lanzamiento público: la propia tarjeta lo describe como un artefacto de investigación privado, no redistribuible.

Técnicamente es la cuarta iteración de una cadena de entrenamiento continuado sobre `joshycodes/gemma4-12b-sorrel-selfloop-g3-midtrain`, que a su vez deriva de la familia Gemma 4 (etiqueta `gemma4_unified` en los metadatos). El repositorio contiene 11.959.730.224 parámetros en formato safetensors, con un tamano total de 24,0 GB, lo que sitúa los pesos en precisión de 16 bits (bf16/fp16). La ventana de contexto del modelo no está documentada; el único dato de longitud disponible es el `seq_len` de 4096 empleado durante este entrenamiento.

Su relevancia es limitada fuera del contexto del proyecto: es un paso de ajuste muy corto (9.322.496 tokens vistos en una única época) sobre un corpus propio (`joshycodes/sorrel-selfloop-corpus`), con una pérdida que baja de 0,874 a 0,8002. No se han publicado evaluaciones, benchmarks ni documentación de capacidades, y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de metadatos `gemma4_unified`; no se detalla si es transformer denso, MoE o híbrida) |
| Parametros totales | 11.959.730.224 (≈11,96 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento midtrain usó `seq_len` = 4096, que no implica necesariamente el máximo de inferencia) |
| Tipos de cuantizacion | no disponible como variantes publicadas; pesos originales en safetensors con precisión de 16 bits (24,0 GB / 11,96 B ≈ 2 bytes por parámetro) |
| Idiomas soportados | no disponible |
| Licencia | `other` con `license_name: internal-research` (artefacto privado, no redistribuible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos publicados (número de capas, tipo de atención, uso de GQA, normalización o presencia de módulos MoE). La etiqueta `gemma4_unified` de los metadatos y la nomenclatura del repositorio indican que el modelo pertenece a la familia Gemma 4 con 12 B de parámetros, pero la model card no documenta ninguna innovación técnica ni modificación estructural respecto al modelo base.

El entrenamiento corresponde a una etapa de *continued pretraining* sobre el corpus `joshycodes/sorrel-selfloop-corpus` (configuración `sorrel-selfloop-c-g3`, revisión `0b9daea126e4`), partiendo del checkpoint `joshycodes/gemma4-12b-sorrel-selfloop-g3-midtrain` en la revisión `4b067f38e937`. Se procesaron 9.322.496 tokens en 1,0 época, con `lr` = 1e-05, `seq_len` = 4096, `micro_batch` = 1 y `grad_accum` = 20, sobre 2 GPU NVIDIA H200 en RunPod (semilla 20260821, commit del lanzador `a0afb77669ae` del repositorio `flourishing-training`). La pérdida evolucionó de 0,874 a 0,8002. No se documenta ningún ajuste posterior por RLHF, DPO o instrucciones; el resultado es un checkpoint base de investigación, no un modelo alineado para uso conversacional.

## Capacidades

- Generación de texto: capacidades esperables de un modelo base de ~12 B, sin documentación específica ni evaluaciones publicadas.
- Razonamiento, matemáticas y código: no disponible; no hay benchmarks ni descripciones en la model card.
- Tool calling / function calling: no disponible; no se menciona soporte ni formato de plantilla de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; el repositorio no incluye procesadores ni torres multimodales en los metadatos.
- Ajuste de carácter con enfoque de *flourishing*: es el objetivo declarado del proyecto de investigación, pero no se aportan métricas ni metodología de evaluación en la información disponible.

## Casos de uso

Los siguientes escenarios son hipotéticos y requieren, en todos los casos, un ajuste supervisado posterior (SFT) o un proceso de alineación, dado que el artefacto publicado es un checkpoint de *continued pretraining*:

- Investigación sobre entrenamiento continuado: reproducir la cadena de iteraciones g3 → g4 con el corpus `sorrel-selfloop-corpus` y comparar curvas de pérdida para estudiar el efecto de pasos cortos de midtrain sobre un modelo base de 12 B.
- Estudio de dinámicas de *self-loop* en corpus: analizar cómo un corpus generado o iterado internamente afecta a la distribución de salida de un modelo Gemma 4 de 12 B mediante perplejidad sobre conjuntos de validación propios.
- Base para experimentos de ajuste de carácter: usar el checkpoint como punto de partida para experimentos de alineación orientados a rasgos de personalidad, aprovechando que ya incorpora una etapa de entrenamiento con ese encuadre.
- Generación de texto en dominios cerrados tras SFT: con 11,96 B de parámetros y pesos en 16 bits, es viable un ajuste con LoRA sobre un único nodo de 2 GPU para tareas de redacción técnica o resumen en un dominio acotado.
- Evaluación comparativa de checkpoints intermedios: servir el modelo con vLLM o TGI para medir perplejidad y estabilidad de generación frente a los checkpoints g3 y anteriores, aislando el efecto de esta etapa.
- Investigación sobre licencias y artefactos privados: como caso de estudio de publicación de pesos con licencia `internal-research` y su impacto en la reproducibilidad (0 descargas, sin evaluación pública).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye la métrica de entrenamiento:

| Etapa | Dataset | Revision | Tokens vistos | Pérdida |
|---|---|---|---|---|
| midtrain | `joshycodes/sorrel-selfloop-corpus` (config `sorrel-selfloop-c-g3`) | `0b9daea126e4` | 9.322.496 | 0,874 → 0,8002 |

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los pesos ocupan aproximadamente 24,0 GB (dato derivado del tamano del repositorio), por lo que se necesitan del orden de 26-32 GB de VRAM sumando caché KV y *activaciones* a contextos cortos. En cuantización de 8 bits, alrededor de 12-13 GB; en 4 bits, alrededor de 7 GB.
- GPU recomendadas: NVIDIA H200 (la empleada en el entrenamiento, 141 GB), H100 80 GB, A100 80 GB, L40S 48 GB y RTX 6000 Ada 48 GB pueden ejecutar el modelo en bf16 sin cuantizar. Las GPU de 24 GB (RTX 4090, RTX 3090, L4) requieren cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 de 24 GB solo con cuantización (8 o 4 bits); no cabe en bf16 completo en 24 GB.
- Opciones de despliegue: transformers (HF), vLLM y TGI para servir en bf16 o con cuantización en línea. llama.cpp y Ollama no son utilizables directamente porque no se publican pesos GGUF; sería necesario convertir los safetensors a GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los datos de esta tabla proceden de la información pública de cada modelo alternativo; para el modelo analizado, los campos no documentados figuran como "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| `joshycodes/gemma4-12b-sorrel-selfloop-g4-midtrain` | 11,96 B | no disponible (entrenado con `seq_len` 4096) | `other` / internal-research (no redistribuible) | safetensors | no disponible |
| Gemma 3 12B (referencia de familia) | ≈12,2 B | 128 K tokens | Gemma Terms of Use (uso comercial permitido con restricciones) | safetensors, GGUF | sí, publicados por Google |
| Mistral-Nemo 12B (referencia de tamano) | ≈12,2 B | 128 K tokens | Apache 2.0 | safetensors, GGUF | sí, publicados por Mistral AI |
| Phi-4 14B (referencia de tamano cercano) | ≈14,7 B | 16 K tokens | MIT | safetensors | sí, publicados por Microsoft |

La comparación directa de rendimiento no es posible: el modelo analizado no tiene ninguna evaluación publicada, mientras que las alternativas cuentan con resultados de benchmarks y documentación de capacidades.

## Limitaciones y advertencias

- No es un modelo instructivo ni alineado: es un checkpoint de *continued pretraining*; sin SFT adicional no responde de forma fiable a instrucciones ni mantiene formato conversacional.
- Licencia `internal-research`: la model card indica explícitamente "Private research artifact — do not redistribute". No hay autorización de uso comercial ni de redistribución de los pesos.
- Ausencia total de evaluaciones: no hay benchmarks, ni evaluación de sesgos, ni pruebas de seguridad, ni datos de alucinación medidos.
- Entrenamiento muy corto: 9.322.496 tokens en una sola época, un volumen reducido que limita el impacto esperado sobre el modelo base.
- Idiomas no declarados: se desconoce qué idiomas cubre realmente el corpus de entrenamiento y con qué calidad.
- Contexto no documentado: el único dato es `seq_len` = 4096 durante el midtrain; se desconoce la ventana máxima soportada en inferencia.
- Riesgo de alucinación: no evaluado. En un modelo base sin alineación, el riesgo de fabricación de hechos es alto por defecto.
- Sesgos: el corpus `sorrel-selfloop-corpus` es privado y podría incorporar sesgos derivados de su generación (indicios de naturaleza iterativa o *self-loop*), sin auditoría publicada.
- Reproducibilidad limitada: la evaluación remite a un script interno (`uv run eval.py`) y a un repositorio de entrenamiento no enlazado públicamente.
- Artefacto sin adopción: 0 descargas y 0 likes, sin issues ni comunidad que permita validar el comportamiento del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g4-midtrain
- Modelo base: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g3-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Paper, blog o demo: no disponible (la model card no incluye enlaces a publicaciones, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo)
