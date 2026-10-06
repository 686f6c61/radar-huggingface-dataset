# avartha/kev-0.6b-merged

## Resumen

kev-0.6b-merged es un derivado no oficial de jaredpalmer/kev-0.6b, preparado por Avartha. Kev es una familia de modelos de decisión construidos sobre Qwen3 que, en lugar de generar texto, leen un documento y un conjunto de preguntas tipadas y devuelven probabilidades calibradas sobre las opciones en una sola pasada hacia delante. Esta version concreta fusiona el adaptador LoRA de Kev dentro de los pesos base de Qwen/Qwen3-0.6B-Base y publica ademas la cabeza pointer (pointer head) como safetensors, de modo que el artefacto queda listo para servir sin necesidad de aplicar el adaptador por separado.

El backbone es un Qwen3 de tipo attention-only en bf16 con 596.049.920 parametros totales (el repo ocupa 1,2 GB), y la cabeza de decision es un modulo independiente en fp32. Kev nunca utiliza la LM head: la inferencia se resuelve proyectando el estado oculto final mediante dos proyecciones tipo query/key y aplicando un softmax sobre las opciones de la pregunta. El modelo se distribuye bajo licencia Apache-2.0 y esta pensado para integrarse en la API System One de TypeSafe y en pipelines de decision estructurada.

Su relevancia es doble: por un lado reduce el coste de servir Kev al eliminar la carga del adaptador en tiempo de inferencia; por otro, el autor documenta de forma exhaustiva la procedencia, el procedimiento de fusion y una verificacion bit a bit frente a la fusion de referencia de Kev, algo poco habitual en derivados no oficiales. La contrapartida es que no se han publicado evaluaciones de precision sobre las suites de Kev ni pruebas de servicio end-to-end en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 attention-only (sin uso de la LM head), mas cabeza pointer de decision |
| Parametros totales | 596.049.920 (backbone + cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen/Qwen3-0.6B-Base) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; cabeza en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, head.safetensors) y head.pt (cabeza original) |

## Arquitectura y entrenamiento

El artefacto combina dos piezas. La primera es un backbone Qwen3 (attention-only) en bf16 al que se le ha fusionado el fine-tune de Kev. La segunda es la cabeza pointer, un modulo en fp32 con los tensores `q.weight` [256, 1024], `q.bias` [256], `k.weight` [256, 1024], `k.bias` [256] y un escalar `temperature`. El readout se calcula como `logit_j = ((W_k h_opt_j + b_k) . (W_q h_decide + b_q)) / sqrt(256) / T`, seguido de un softmax sobre las opciones de la pregunta, usando el estado oculto tras la normalizacion final del backbone. La temperatura es 1.0, ya que `head.pt` no la incorpora y el loader de kev-src aplica ese valor por defecto.

El formato de entrada no usa plantilla de chat. Cada pregunta se construye como una fila causal que continua el estado, con el siguiente layout de tokens: `<|fim_prefix|>` para el estado, `<|fim_middle|>` para la pregunta, `<|box_start|>`/`<|box_end|>` para cada opcion y `<|fim_suffix|>` para el token de decision. El tokenizer, `config.json` y los ficheros de preprocesado se toman del modelo base en la revision fijada.

La fusion se realizo con `upstream/kev_merge.py` (sha256 `260f41d81bb9901b6991b36869dabe0930611c360ab3c0c1a4d7eb7de9331eed`), procesando un shard del base a la vez en CPU. Para cada capa Linear adaptada se aplico `W_bf16 = bf16( fp32(W) + (B @ A) * 2.0 )`, con `2.0 = lora_alpha / r = 32 / 16` tomado del `adapter_config.json` (LoRA plano, sin DoRA ni rsLoRA). Se aplicaron los 196 modulos adaptados de 196, y el script falla si falta cualquiera. El resto de tensores se copian bit a bit, incluidos los que el base almacena en fp32, y no se descarto ningun tensor. El resultado son 310 tensores y 1.192.099.840 bytes. No hay indicios de RLHF ni DPO en la informacion disponible; el entrenamiento original de Kev corresponde a un ajuste fino con LoRA sobre el base.

## Capacidades

- Decision estructurada: dada una pregunta con opciones tipadas, devuelve una distribucion de probabilidad calibrada sobre las opciones en una sola pasada hacia delante.
- Lectura de documentos: consume un estado (documento) y responde preguntas causales que lo continuan.
- Clasificacion y eleccion entre alternativas: util para tareas de seleccion, etiquetado o puntuacion de opciones.
- Generacion de texto libre: no disponible; Kev nunca usa la LM head y no esta disenado para decodificar texto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa en esta ficha.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: cabeza pointer con contrato documentado (`kev_head.json`) y layout de tokens especifico basado en tokens FIM.

## Casos de uso

- Enrutamiento y triaje de tickets: el modelo puede recibir el texto de una incidencia y una pregunta con opciones (por ejemplo, categoria o prioridad) y devolver la probabilidad de cada una, lo que permite umbrales de confianza en lugar de una unica etiqueta.
- Moderacion y clasificacion de contenido: dada una politica y un fragmento, plantear opciones (permitir, revisar, bloquear) y obtener una distribucion utilizable para decidir con margenes.
- Extraccion de decisiones en formularios: convertir documentos estructurados en preguntas tipadas y usar las probabilidades como salida calibrada para validacion automatica.
- Seleccion de respuesta en QA: entre varias respuestas candidatas, usar el modelo como reranker que puntua cada opcion en la misma pasada.
- Control de calidad en pipelines de datos: comprobar si un registro cumple criterios predefinidos planteando la decision como pregunta con opciones.
- Investigacion sobre modelos de decision: al ser un derivado ligero (596 M parametros) con contrato de cabeza documentado, sirve como banco de pruebas reproducible para experimentos de calibracion y comparacion frente al release original de Kev.
- Integracion tras la API System One: encaja como componente de decision detras de la interfaz de TypeSafe, devolviendo probabilidades en lugar de texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta una verificacion de equivalencia numerica frente a la referencia de Kev (fp32, adaptador sin fusionar, `head.pt`) sobre 5 peticiones cortas de System One (conteos de tokens 48, 50, 43, 35 y 64), sin GPU:

| Comparacion | hidden max abs | hidden max rel L2 | probs max abs | argmax aciertos |
|---|---|---|---|---|
| fp32 fusionado (PEFT) vs fp32 sin fusionar | 0,00021 | 1,42e-05 | 2,92e-06 | 7/7 |
| Este artefacto, pesos bf16, computo fp32 | 0,663 | 0,0313 | 0,00504 | 7/7 |
| Este artefacto, pesos bf16, computo bf16 (forma servida) | 2,38 | 0,0783 | 0,00625 | 7/7 |

Ademas, la verificacion confirma que los 310 tensores del backbone son iguales bit a bit a la fusion bf16 propia de Kev, y que `head.safetensors` coincide con `head.pt`. La model card senala que la deriva en bf16 es inherente al servicio en bf16 y que, para el modelo de 4B, las tarjetas de Kev reportan valores servidos en bf16 dentro de 0,017 respecto a fp32. No se midieron la precision sobre las suites de evaluacion de Kev ni el servicio end-to-end en GPU.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1,2 GB para los pesos del backbone en bf16; la cabeza anade unos 2,1 MB en fp32. Un despliegue en fp32 requeriria del orden de 2,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. Cabe holgadamente en RTX 4090, RTX 3090, RTX 3060 y GPUs de gama media; tambien en A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: si. Con 596 M parametros y ~1,2 GB en bf16, es viable en practicamente cualquier GPU de consumo moderna e incluso en CPU (la verificacion del propio autor se hizo en CPU).
- Opciones de despliegue: no disponible. El modelo no usa la LM head y depende de un contrato de cabeza pointer y de un layout de tokens especifico, por lo que los runners genericos de texto (vLLM, llama.cpp, Ollama, TGI) no lo cargaran correctamente sin adaptar la logica de decision de kev-src. El autor incluye scripts de fusion y verificacion (`upstream/kev_merge.py`, `upstream/kev_verify.py`) que reflejan la via de carga prevista.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avartha/kev-0.6b-merged | 596.049.920 | no disponible | Decision (cabeza pointer) sobre Qwen3 | Apache-2.0 | HuggingFace (derivado no oficial) |
| jaredpalmer/kev-0.6b | no disponible (misma base Qwen3-0.6B) | no disponible | Decision (cabeza pointer) sobre Qwen3 | Apache-2.0 | HuggingFace (release original) |
| Qwen/Qwen3-0.6B-Base | no disponible en esta ficha | no disponible | Transformer de lenguaje (attention-only) | Apache-2.0 | HuggingFace (modelo base) |

No se dispone de modelos de decision directamente comparables en la informacion proporcionada mas alla de los anteriores; la familia Kev incluye otras variantes (por ejemplo, un modelo de 4B citado en la model card), pero sus especificaciones no se detallan aqui.

## Limitaciones y advertencias

- Derivado no oficial: no esta respaldado por el autor de Kev. Cualquier discrepancia de comportamiento es responsabilidad del derivado, no del release original.
- No es un modelo generativo: Kev nunca usa la LM head, por lo que no sirve para generar texto libre ni para tareas de chat estandar.
- Restricciones de formato: exige el layout de tokens FIM/box y el contrato de la cabeza pointer; no hay plantilla de chat. Un uso incorrecto del formato produce resultados invalidos.
- Longitud de contexto e idiomas: no disponibles en la informacion proporcionada, lo que impide garantizar el comportamiento en documentos largos o en idiomas distintos del usado en el ajuste.
- Deriva numerica en bf16: la propia verificacion muestra diferencias de hasta 2,38 en el estado oculto (max abs) y 0,00625 en probabilidades entre la forma servida en bf16 y la referencia fp32, con coincidencia de argmax en 7/7 casos. En produccion conviene validar umbrales de confianza.
- Falta de evaluacion: no se han medido la precision sobre las suites de Kev ni el rendimiento end-to-end en GPU, por lo que no hay garantias de calidad mas alla de la equivalencia numerica con la referencia.
- Licencia: Apache-2.0 permite uso comercial, pero el repo incluye `LICENSE` (Kev) y `LICENSE-QWEN` (base); conviene revisar ambas antes de redistribuir. La marca "unofficial" debe mantenerse en cualquier redistribucion.
- Riesgo de alucinacion: no disponible como dato medido; al ser un modelo de decision que devuelve probabilidades sobre opciones acotadas, el riesgo se traslada a una calibracion incorrecta mas que a texto inventado.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/avartha/kev-0.6b-merged
- Modelo base Kev: https://huggingface.co/jaredpalmer/kev-0.6b
- Repositorio GitHub de Kev: https://github.com/jaredpalmer/kev
- Releases de Kev: https://github.com/jaredpalmer/kev/releases
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Ficha de Kev en free2aitools: https://free2aitools.com/model/jaredpalmer/kev-0.6b
