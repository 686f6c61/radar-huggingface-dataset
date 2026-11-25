# qda-lab/QDA-Qwen3.5-9B-W3A16

## Resumen

QDA-Qwen3.5-9B-W3A16 es una cuantizacion de pesos a 3 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por qda-lab. El modelo reduce el peso en disco de 19,3 GB (BF16) a 6,7 GB, un factor de 2,9x, manteniendo segun el autor el 90,5 % de la precision del modelo original. Los pesos se almacenan como enteros de 3 bits en grupos de 128, con la cabeza de salida y los embeddings de tokens a 4 bits, y los escalares de grupo y tensores de normalizacion se ajustan mediante destilacion.

El interes practico esta en que permite desplegar un modelo de 9.400 millones de parametros con capacidades de razonamiento, codigo y vision en GPUs de gama profesional y consumer alta con mucha menos VRAM que la version BF16. La receta de cuantizacion no es manual: fue seleccionada por busqueda automatizada del framework QDA (Closed-Loop LLM Quantization Design with Agents), documentado en el paper arXiv:2611.23388, y parte de un checkpoint inicial producido con el codigo oficial GSQ (IST-DASLab).

El modelo hereda la arquitectura y el pipeline image-text-to-text del base Qwen3.5-9B, por lo que acepta entradas de imagen y texto. Su principal restriccion es de despliegue: solo funciona en vLLM (SGLang aun no soporta este formato de 3 bits) y requiere GPUs NVIDIA H100, A100, L40S, RTX Pro 6000 o B200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16: pesos INT3 en grupos de 128, activaciones 16 bits; cabeza de salida y embeddings a 4 bits; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de 9.400 millones de parametros con capacidad multimodal (entrada de imagen y texto). Sobre el se aplica una cuantizacion post-entrenamiento de solo pesos: los pesos se representan como enteros de 3 bits agrupados en bloques de 128, mientras que las activaciones se mantienen en 16 bits (esquema W3A16). La cabeza de salida y los embeddings de tokens se conservan a 4 bits para limitar la perdida de calidad en esas capas.

El proceso de construccion parte de un checkpoint de 3 bits generado con el codigo oficial GSQ (IST-DASLab/GSQ, arXiv:2604.18556). A continuacion, los escalares de grupo y los tensores de normalizacion se ajustan mediante destilacion, con una receta elegida por busqueda automatizada del framework QDA. El entrenamiento se realizo en una unica GPU H100 de 80 GB y los pesos reconstruidos no son identicos bit a bit al checkpoint publicado. La model card no detalla el volumen ni la composicion del dataset de destilacion, ni si el modelo base original uso RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con cierre del razonamiento en `</think>`.
- Razonamiento matematico de competicion (AIME, HMMT) y resolucion de problemas cientificos de nivel experto (GPQA-Diamond).
- Generacion de codigo y resolucion de problemas de programacion (LiveCodeBench), con soporte de modo thinking.
- Seguimiento de instrucciones complejas (IFBench) y conocimiento general (MMLU-Pro).
- Entrada multimodal image-text-to-text heredada del base Qwen3.5-9B.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo conserva 81,1 en AIME 2025 frente a 85,3 del BF16, por lo que es util para tutoria o verificacion de soluciones matematicas donde el coste de VRAM es critico.
- Resolucion de problemas cientificos en GPUs de 24-48 GB: con 73,5 en GPQA-Diamond permite desplegar un modelo de nivel experto en una sola L40S o RTX Pro 6000 sin recurrir a la version BF16 de 19,3 GB.
- Generacion de codigo en pipelines de evaluacion: 57,1 en LiveCodeBench lo hace adecuado para tareas de generacion de codigo con verificacion automatica, aunque con perdida notable respecto al base.
- Investigacion en cuantizacion: la receta, el checkpoint inicial y los datos de destilacion estan publicados, lo que permite reproducir y comparar variantes de cuantizacion de 3 bits.
- Despliegue con requisitos estrictos de memoria: al ocupar 6,7 GB en disco, cabe en GPUs consumer de gama alta con cuantizacion adicional o en entornos con VRAM limitada frente a los 19,3 GB del BF16.
- Evaluacion de seguimiento de instrucciones: 59,3 en IFBench lo hace util para prototipar asistentes que deben respetar restricciones de formato, con la advertencia de la caida de 7,7 puntos respecto al base.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking mode, pass@1 promediado sobre 1-32 semillas, mismas condiciones para ambos modelos):

| Benchmark | BF16 (19,3 GB) | QDA W3A16 (6,7 GB) |
|---|---|---|
| AIME 2025 | 85,3 | 81,1 |
| HMMT Feb 2026 | 67,5 | 62,5 |
| GPQA-Diamond | 81,8 | 73,5 |
| IFBench | 67,0 | 59,3 |
| MMLU-Pro | 81,2 | 76,8 |
| LiveCodeBench | 70,7 | 57,1 |
| Media | 75,6 | 68,4 |

Configuracion de evaluacion: max new tokens 81.920 (32.768 en MMLU-Pro), temperature 1.0, top-p 0.95, top-k 20, min-p 0, presence penalty 1.5, repetition penalty 1.0, thinking activado, MTP y decodificacion especulativa desactivados.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 6,7 GB en disco; la VRAM necesaria para pesos es de aproximadamente 6,7 GB, mas la memoria para KV cache y activaciones (no cuantificadas a 3 bits), que no se detalla en la informacion disponible.
- GPUs soportadas segun el autor: NVIDIA H100, A100, L40S, RTX Pro 6000 y B200.
- Cabe en GPU consumer: no se confirma en la informacion proporcionada; el autor solo lista GPUs profesionales y de centro de datos.
- Despliegue: exclusivamente vLLM. SGLang no soporta aun el formato de 3 bits. Comando: `VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.5-9B-W3A16`.
- Requisito adicional: sin CUDA 13 en la maquina, la compilacion del kernel W3A16 falla (`failed to open libnvrtc-builtins.so.13.0`); hay que anadir las librerias NVIDIA del entorno virtual a `LD_LIBRARY_PATH`.
- Latencia y throughput: no disponibles. El autor menciona un arranque de 340 s en una GB300 con el toolkit configurado, pero no publica cifras de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (media benchmarks) | Licencia | Despliegue |
|---|---|---|---|---|---|
| QDA-Qwen3.5-9B-W3A16 | 9,4 B | no disponible | 68,4 (W3A16) | Apache-2.0 | vLLM |
| Qwen/Qwen3.5-9B (BF16) | 9,4 B | no disponible | 75,6 | Apache-2.0 | vLLM, TGI, transformers |
| Otros modelos de 9-10 B cuantizados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa solo es posible con el modelo base, ya que la informacion proporcionada no incluye otros modelos de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Perdida de calidad no uniforme: la media cae 7,2 puntos (75,6 a 68,4), pero LiveCodeBench pierde 13,6 puntos y GPQA-Diamond 8,3, mientras que AIME 2025 solo pierde 4,2. El rendimiento en codigo es el mas afectado.
- Despliegue limitado: solo funciona en vLLM; SGLang no soporta el formato. Requiere GPUs NVIDIA de la lista del autor, lo que excluye GPUs consumer no verificadas.
- Dependencia de CUDA 13: sin el toolkit, el arranque falla y exige configurar `LD_LIBRARY_PATH` manualmente.
- Reproducibilidad parcial: los pesos reconstruidos con la receta no son identicos bit a bit al checkpoint publicado.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue ni calidad por idioma.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada; al ser una cuantizacion, la degradacion puede aumentar la probabilidad de errores en tareas de razonamiento largo.
- Licencia Apache-2.0: permite uso comercial, pero hereda las condiciones del modelo base Qwen3.5-9B, que no se detallan mas alla de la licencia.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Repositorio QDA: https://github.com/humanfia/qda
- Repositorio GSQ: https://github.com/IST-DASLab/GSQ
- Receta e inputs: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.5-9B-W3A16
- Fichero de receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.5-9B-W3A16/qwen3.5-9b-w3a16.yaml
