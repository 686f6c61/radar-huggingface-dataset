# iclropen/evidence-audit-qwen7b-pc-a05-bound150-020-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-bound150-020-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo vision-lenguaje de 7.000 millones de parametros de la familia Qwen2.5-VL de Alibaba. El adaptador no es un modelo generalista: es un artefacto de investigacion asociado al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. Su proposito es ajustar el modelo base para que la localizacion temporal de evidencias en video (video temporal grounding, tarea Charades-STA) dependa de la evidencia visual real y no de atajos espurios.

La innovacion que persigue es un objetivo de entrenamiento "placebo-controlled": se entrena al modelo para que su prediccion se degrade de forma controlada cuando se edita el video dentro del intervalo anotado (evidencia real) y mucho menos cuando se aplica una edicion placebo equivalente fuera del intervalo. El adaptador concreto corresponde a la variante con alpha=0.5, ratio de cota placebo 1.5 y holgura (slack) 0.20, semilla 0.

Es relevante para investigadores que trabajen en robustez y fidelidad de modelos de video, no para uso en produccion general: el repositorio pesa 0,2 GB, solo contiene pesos LoRA y no incluye pipeline, idiomas declarados ni benchmarks en la model card. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen2.5-VL) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-VL-7B-Instruct tiene 7.000 millones (dato del modelo base, no de la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el adaptador procesa video a 2 fps con un maximo de 768 frames |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, 190.435.728 bytes) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la arquitectura Qwen2.5-VL, un transformer vision-lenguaje. Segun la model card, solo se incluyen los pesos LoRA, con rango r=16, `lora_alpha=32` y dropout 0.05, sobre los modulos q/k/v/o/gate/up/down_proj. Un detalle tecnico importante: los entrenamientos con transformers 4.51 usaron gradient checkpointing, lo que dejo la torre visual sin gradiente, de modo que sus matrices `lora_B` son todas cero y el adaptador modifica unicamente el modelo de lenguaje. El adaptador se entreno con transformers 4.51.3 y peft 0.20.

El objetivo de entrenamiento es el descrito en la seccion 4 del paper: una combinacion de NLL sobre el video limpio (ponderada por alpha=0.5) y terminos de margen (softplus con beta=0.1) que comparan la respuesta del modelo sobre el video con evidencia editada (x_E) y sobre un placebo editado fuera del intervalo anotado (x_O), mas un termino hinge sobre la caida placebo con cota d_O(entrenado) <= 1.50 d_O(referencia) + 0.20 y peso 1.0. Se usaron pesos de operadores con Group-DRO, 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizador, learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. Los operadores de edicion de entrenamiento son swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de video es a 2 fps con un maximo de 768 frames.

## Capacidades

- Localizacion temporal de evidencias en video (video temporal grounding) sobre el conjunto Charades-STA, heredando las capacidades vision-lenguaje del modelo base Qwen2.5-VL-7B-Instruct.
- Razonamiento sobre video con entrada a 2 fps y hasta 768 frames.
- Procesamiento de pares video-texto con orden de mensajes video primero y texto despues.
- Capacidades del modelo base no verificadas para este adaptador: generacion de texto, codigo, matematicas, tool calling, agentes y multilingueismo. La model card no las documenta ni las evalua.
- No se documentan modos especiales (thinking, audio) ni capacidades adicionales en la informacion disponible.

## Casos de uso

- Auditoria de fidelidad de modelos de video: el adaptador sirve para medir si un modelo de grounding se apoya en la evidencia visual o en atajos, aplicando ediciones de evidencia y placebo y comparando la degradacion de la prediccion.
- Investigacion en robustez: permite reproducir el objetivo placebo-controlled del paper sobre Charades-STA con el modelo base Qwen2.5-VL-7B-Instruct y los scripts de evaluacion del repositorio de codigo.
- Experimentos controlados de ablation: la variante concreta (alpha=0.5, cota 1.5, slack 0.20, semilla 0) sirve como punto de comparacion frente a otras variantes del mismo estudio.
- Validacion de pipelines de evaluacion: los scripts de auditoria de verosimilitud y de comportamiento del repositorio de codigo aceptan `--model` y `--adapter`, lo que permite integrar el adaptador en flujos de evaluacion existentes.
- Estudio de sesgos de atajo en vision-lenguaje: util para analizar como el modelo responde a ediciones como swap, mask, blur, tshift y shuffle.
- Reproducibilidad de resultados de un paper en revision: el adaptador y su hash sha256 permiten verificar la carga exacta de los pesos en un entorno fijado (transformers 4.51.3, peft 0.20).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de grounding; solo describe la receta de entrenamiento y remite a los scripts de evaluacion del repositorio de codigo.

## Requisitos de hardware

- El adaptador pesa 190.435.728 bytes (unos 0,19 GB) y requiere cargar ademas el modelo base Qwen2.5-VL-7B-Instruct en bfloat16, lo que implica aproximadamente 14-15 GB de pesos del modelo base, mas memoria para activaciones y video.
- VRAM estimada para inferencia: no disponible de forma oficial; depende del modelo base, de la resolucion y del numero de frames (hasta 768 frames a 2 fps).
- GPU recomendadas: no especificadas en la model card. Por el tamano del modelo base, son razonables GPUs de 24 GB o mas (RTX 4090, A100, H100), pero no hay datos oficiales.
- No se confirma que quepa en GPUs de consumo con menos de 24 GB; requeriria cuantizacion del modelo base, no documentada.
- Opciones de despliegue: la model card solo documenta carga con transformers 4.51.3 y peft 0.20. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-bound150-020-s0 (este) | LoRA sobre base de 7B | No disponible (video a 2 fps, max. 768 frames) | Video temporal grounding con objetivo placebo-controlled | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct (modelo base) | 7B | No disponible en esta ficha | Vision-lenguaje general | No disponible en esta ficha | Hugging Face |
| Otras variantes del mismo paper (otras configuraciones alpha/cota/slack/semilla) | LoRA sobre base de 7B | No disponible | Igual tarea, distinta receta | Apache 2.0 | Repositorio del autor |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo de proposito general y no se ha evaluado fuera de la tarea de video temporal grounding en Charades-STA.
- La torre visual no se entrena (matrices `lora_B` a cero por el gradient checkpointing); el adaptador solo modifica el modelo de lenguaje.
- Incompatibilidad silenciosa entre transformers 4.51 y 5.x: cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin cargar. Es obligatorio ejecutar el self-check de la model card.
- Riesgo de alucinacion: no documentado especificamente para este adaptador; el modelo base puede alucinar y el adaptador no corrige ese comportamiento fuera de la tarea entrenada.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no declaradas; la model card no lista idiomas soportados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el adaptador se distribuye sin garantias y su validacion es responsabilidad del usuario.
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado; sin benchmarks publicados.
- El paper esta en revision (ICLR 2027); los resultados pueden cambiar.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-bound150-020-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
