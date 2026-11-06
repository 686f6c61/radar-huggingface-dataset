# rqadri/cca-traj-qwen38-27b-v1

## Resumen

`rqadri/cca-traj-qwen38-27b-v1` es un ajuste fino de parámetros completos (SFT) del modelo `Qwen/Qwen3.8-27B` de Alibaba, publicado por el usuario rqadri como artefacto de investigación. El entrenamiento se ha realizado sobre trayectorias de agentes de código del conjunto `cca-large-v1` (250 ejecuciones de entrenamiento, 1.243 secuencias, 61,9 millones de tokens supervisados), con una ventana de contexto de 128k tokens y una única época sobre 160 pasos de optimización. El resultado es un modelo multimodal de tipo image-text-to-text orientado a tareas de agente de programación de contexto largo.

La relevancia del modelo es fundamentalmente metodológica: demuestra un pipeline de SFT a nivel de trayectoria completa (una secuencia de entrenamiento por cada generación de contexto de agente, con la pérdida calculada únicamente sobre los tramos del asistente) ejecutado sobre hardware Intel XPU (Aurora) con DeepSpeed ZeRO-3, offload del optimizador a CPU y paralelismo de secuencia Ulysses con 8 rangos. No obstante, los propios resultados reportados por el autor indican que el ajuste no mejora al modelo base en términos de capacidad: gana en SWE-bench con el tiempo de agente de 30 minutos pero pierde con 120 minutos, y queda por debajo del base en Terminal-Bench.

Se distribuye bajo licencia Apache 2.0, en formato safetensors y con la librería transformers. El repositorio ocupa 54,7 GB. Es un artefacto de investigación, no un modelo listo para producción, y debe cargarse con la clase `Qwen3_5ForConditionalGeneration` para evitar la inicialización aleatoria de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), clase `Qwen3_5ForConditionalGeneration`; detalles internos del base no disponibles |
| Parametros totales | 1.088.752 según safetensors del repo (dato inconsistente con el nombre "27B"; el recuento real del base no está disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); incluye `preprocessor_config.json` y `video_preprocessor_config.json` para vLLM |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B` y se ajusta con SFT de parámetros completos a nivel de trayectoria. Cada secuencia de entrenamiento corresponde a una generación completa de contexto de agente, con la función de pérdida aplicada exclusivamente a los tramos generados por el asistente, en contexto de 128k tokens, precisión bf16 y AdamW con scheduler coseno. El entrenamiento se ejecutó sobre Intel XPU (Aurora) con DeepSpeed ZeRO-3, offload del optimizador a CPU, paralelismo de secuencia Ulysses local al nodo (8 rangos) y 8 secuencias por paso de optimizador, durante una época (160 pasos) con learning rate 1e-5. El script utilizado es `train_cca_sft.py` del repositorio github.com/rifaaQ/long_ctx_train.

Los datos provienen de `cca-large-v1` (250 ejecuciones, 1.243 secuencias, 61,9M tokens supervisados) y, en otras ejecuciones del proyecto, de `cca-large-v2` (182 ejecuciones, 739 secuencias, 47,7M tokens supervisados; ejecuciones disjuntas y solo con profesores de pesos abiertos). La evaluación se realizó con el modo thinking activado y un parser de razonamiento. No se documentan fases de RLHF ni DPO, ni innovaciones de decodificación especulativa o atención lineal más allá del paralelismo de secuencia empleado en el entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text, heredados del modelo base Qwen3.8-27B.
- Ejecución de trayectorias de agente de programación: el ajuste se ha realizado específicamente sobre trayectorias de agente de código, con pérdida sobre los tramos del asistente.
- Contexto largo de hasta 128k tokens, adecuado para mantener el estado completo de una sesión de agente.
- Modo thinking con parser de razonamiento (protocolo de evaluación empleado por el autor).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque es esperable por herencia del base.
- Capacidades multilingües: no disponibles.
- Procesamiento de vídeo e imagen: los ficheros de preprocesado incluidos (`preprocessor_config.json`, `video_preprocessor_config.json`) apuntan a soporte multimodal, sin detalle de las capacidades concretas.

## Casos de uso

- Investigación en SFT de contexto largo: reproducir el pipeline de `long_ctx_train` para estudiar cómo afecta el ajuste a nivel de trayectoria al comportamiento de un agente de código en ventanas de 128k tokens.
- Agentes de resolución de incidencias en repositorios (estilo SWE-bench): el modelo puede mantener en contexto el árbol del repositorio, los ficheros relevantes y el historial de intentos; el autor reporta ventaja sobre el base con timeouts de agente de 30 minutos.
- Automatización de tareas de terminal acotadas: útil como banco de pruebas para medir la degradación frente al base en Terminal-Bench y ajustar presupuestos de tiempo.
- Evaluación comparativa de estrategias de entrenamiento: sirve como punto de control para comparar SFT de trayectoria completa frente a otras variantes del mismo proyecto (`cca-large-v2`, rondas posteriores).
- Generación de código asistida con contexto de proyecto extenso: integrable en pipelines internos donde se requiera arrastrar documentación, tests y código fuente en una sola ventana.
- Estudio de eficiencia en hardware alternativo: el registro de entrenamiento en Intel XPU con ZeRO-3 y Ulysses sirve de referencia para equipos que evalúan infraestructura no NVIDIA.
- Base para experimentos de destilación desde profesores de pesos abiertos: los datos de `cca-large-v2` se construyeron exclusivamente con profesores abiertos, lo que facilita la trazabilidad de licencias.

## Benchmarks y rendimiento

| Benchmark | Resultado reportado |
|---|---|
| SWE-bench (timeout de agente 30 min) | Supera al modelo base |
| SWE-bench (timeout de agente 120 min) | Por debajo del modelo base (efecto de velocidad, no de capacidad según el autor) |
| Terminal-Bench | Por debajo del modelo base |

No se han publicado cifras numéricas (MMLU, HumanEval, GSM8K u otras) en la información disponible; solo se indica la dirección de la comparación frente al base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repositorio ocupa 54,7 GB en safetensors, lo que sugiere pesos en bf16 de un modelo de decenas de miles de millones de parámetros; en bf16 necesitaría del orden de 50-60 GB solo para pesos, más caché KV para 128k tokens.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, un despliegue en bf16 requeriría A100 80 GB, H100 80 GB o varias GPU consumer con paralelismo de tensor.
- GPU consumer: no confirmado; con cuantización a 4 bits podría intentarse en una RTX 4090 (24 GB), pero no hay GGUF publicado ni validación del autor.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration`; vLLM, para el que se incluyen los ficheros de preprocesado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor señala un efecto de velocidad desfavorable frente al base en horizontes largos (120 minutos), sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `rqadri/cca-traj-qwen38-27b-v1` | 1.088.752 según safetensors (nombre comercial 27B) | 128k | Apache 2.0 | SFT de trayectorias de agente; gana al base en SWE-bench a 30 min, pierde a 120 min y en Terminal-Bench |
| `Qwen/Qwen3.8-27B` (base) | no disponible | no disponible | no disponible | Modelo de referencia del ajuste; supera al ajustado en Terminal-Bench y en SWE-bench a 120 min |
| Otras variantes del proyecto (`cca-large-v2`, rondas posteriores) | no disponible | 128k en el pipeline | Apache 2.0 (según repo) | Mismo pipeline con datos disjuntos; cifras no disponibles en esta ficha |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (por ejemplo, otros agentes de código de tamaño similar); se indica "no disponible".

## Limitaciones y advertencias

- El propio autor reporta que el ajuste no aporta ganancia de capacidad: pierde frente al base en SWE-bench con timeout de 120 minutos y en Terminal-Bench, y solo gana con timeout de 30 minutos.
- Es un artefacto de investigación, sin garantías de robustez en producción ni evaluación de sesgos publicada.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingüe concreto.
- El recuento de parámetros de safetensors (1.088.752) es inconsistente con el nombre "27B" y con el tamaño del repositorio (54,7 GB); debe verificarse antes de planificar el despliegue.
- Cargar con la clase de texto en lugar de `Qwen3_5ForConditionalGeneration` inicializa pesos aleatorios: es un error crítico a evitar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de trayectorias pueden arrastrar condiciones adicionales no detalladas; conviene revisar la licencia de `Qwen/Qwen3.8-27B`.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere convertir los pesos por cuenta propia.
- Solo 160 pasos de entrenamiento y una época: riesgo de sobreajuste limitado pero también de ajuste insuficiente; los resultados así lo sugieren.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rqadri/cca-traj-qwen38-27b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del pipeline de entrenamiento y resultados: https://github.com/rifaaQ/long_ctx_train
- Registro de evaluación (`longctx/results.md`): https://github.com/rifaaQ/long_ctx_train (ruta indicada por el autor)
