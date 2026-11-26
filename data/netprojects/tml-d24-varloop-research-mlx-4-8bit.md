# netprojects/TML-d24-varloop-research-MLX-4-8bit

## Resumen

TML-d24-varloop-research es un modelo de investigación de Thinking Machines basado en una arquitectura de mezcla de expertos (MoE) con bucles variables: las doce capas centrales pueden ejecutarse entre 1 y 5 veces en inferencia (3 por defecto), lo que permite intercambiar latencia por capacidad de recuperación en contextos largos. Cuenta con 26.388.641.280 parámetros totales, codificador de visión y un borrador MTP para decodificación especulativa, lo que lo convierte en un modelo multimodal image-text-to-text.

La ficha que nos ocupa es una conversión no oficial a MLX para Apple Silicon realizada por netprojects, que preserva los expertos enrutados en sus cuantizaciones originales (NVFP4 en capas 0-19 y MXFP8 en capas 20-23) y mantiene atención, embeddings, capa de salida y codificador de visión en bf16. El resultado ocupa 19,5 GB más 0,64 GB del borrador, y está pensado para ejecutarse en Macs con chip de la serie M mediante MLX-VLM con soporte de bucle variable.

Es relevante ahora porque Thinking Machines lo publica como artefacto de investigación para estudiar el comportamiento de los bucles variables, y recomienda su Inkling 2 Mini para producción. La conversión permite reproducir esos experimentos en hardware de consumo Apple sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucles variables (12 capas centrales con 1-5 pasadas) y codificador de visión |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks cubren hasta 1M tokens) |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); atención, embeddings, salida y visión en bf16; builds 4/8-bit y 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `mtp.safetensors` para el borrador |

## Arquitectura y entrenamiento

El modelo sigue un diseño MoE con bucles: las doce capas intermedias se reutilizan un número configurable de veces por token, de 1 a 5, con 3 como valor por defecto. Esto da 24 pasadas de capa por token con 1 pasada y 72 con 5. Incluye un codificador de visión (pipeline image-text-to-text) y un borrador MTP/DSpark entrenado con 3 pasadas para decodificación especulativa.

La conversión a MLX repackea los expertos enrutados sin alterar sus valores (NVFP4 y MXFP8 nativos de MLX) y conserva el resto en bf16. El autor verificó el código de bucle contra la implementación de referencia en Transformers 5.24.1 sobre un modelo diminuto con la misma arquitectura, a 1, 2, 3, 4 y 5 pasadas, con una diferencia máxima de logits de 3,6e-6. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento con esfuerzo configurable mediante `reasoning_effort` (`none`, `minimal`, `low`, `medium`, `high` por defecto, `xhigh`, `max` o un valor numérico entre 0.0 y 0.99).
- Razonamiento de múltiples pasos y modo de pensamiento prolongado, con necesidad de fijar `max_tokens`.
- Comprensión de imágenes y texto (image-text-to-text): en la verificación identificó correctamente formas y colores de una imagen de prueba.
- Tool calling y function calling, verificado a 3 pasadas según la model card.
- Capacidad de agente y tareas de ingeniería de software (SWE-bench Verified y Pro v2 en los resultados del autor original).
- Recuperación en contextos largos (hasta 1M tokens en los benchmarks MRCR v2 y GraphWalks).
- Decodificación especulativa con el borrador MTP incluido, solo cargable a 3 pasadas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre bucles variables: ejecutar el mismo prompt con 1, 2, 3, 4 y 5 pasadas para medir la curva de calidad frente a latencia en hardware Apple Silicon, usando `INKLING2_LOOP_PASSES`.
- Recuperación en documentos largos: con 4 pasadas el modelo alcanza 93,4% en MRCR v2 8-needle 256K-512K, adecuado para preguntas sobre corpus extensos donde la velocidad no es crítica.
- Análisis de documentos con imágenes: el pipeline image-text-to-text y su rendimiento en OmniDocBench v1.6 (92,1% a 3 pasadas) lo hacen apto para extracción de información de PDFs escaneados y formularios.
- Asistencia a tareas de ingeniería de software: con 3 pasadas logra 78,7% en SWE-bench Verified (bash only), útil en entornos de investigación de agentes de código.
- Prototipado de agentes con tool calling en local: el soporte verificado de llamadas a herramientas permite construir flujos multi-paso sin salir del Mac.
- Experimentos de decodificación especulativa: cargar el borrador MTP con `load_drafter` para estudiar aceleración con bloques de 3-4 tokens en un modelo MoE bucleado.
- Evaluación comparativa de cuantizaciones: contrastar el build 4/8-bit con el 4-bit (93,2% de coincidencia en el siguiente token, KL 0,014) para calibrar el impacto de la cuantización en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados publicados por Thinking Machines (recogidos en la model card de esta conversión), comparando Inkling 2 Mini con el modelo a distinto número de pasadas:

| Benchmark | Inkling 2 Mini | 1 pasada | 2 pasadas | 3 pasadas | 4 pasadas | 5 pasadas |
|---|---|---|---|---|---|---|
| SWE-bench Verified (bash only) | 79,2% | 56,3% | 76,5% | 78,7% | 79,3% | 79,6% |
| SWE-bench Pro v2 Hard | 77,9% | 39,7% | 69,1% | 78,9% | 76,0% | 78,4% |
| GPQA Diamond | 86,6% | 69,6% | 79,2% | 84,2% | 81,9% | 83,1% |
| MMMU Pro | 74,9% | 63,6% | 69,8% | 71,4% | 72,1% | 73,2% |
| OmniDocBench v1.6 | 92,8% | 86,6% | 90,5% | 92,1% | 91,8% | 92,5% |
| MRCR v2 8-needle, 256K-512K | 46,4% | 26,2% | 65,2% | 89,2% | 93,4% | 92,1% |
| MRCR v2 8-needle, 512K-1M | 37,7% | 20,6% | 49,7% | 72,3% | 81,4% | 79,9% |
| GraphWalks BFS 1M | 50,0% | 5,7% | 39,4% | 52,1% | 56,2% | 57,8% |

Velocidad medida por el conversor en un MacBook Pro M5 Max (128 GB) con MLX 0.32.5, dos prompts de 128 tokens en modo greedy y `reasoning` en `none` (indicativa, no en máquina inactiva):

| Pasadas | Pasadas de capa por token | 4/8-bit (tok/s) | 4-bit (tok/s) |
|---|---|---|---|
| 1 | 24 | 97,7 | no disponible |
| 2 | 36 | 69,3 | 117,3 |
| 3 (por defecto) | 48 | 51,6 | 85,5 |
| 4 | 60 | 42,2 | no disponible |
| 5 | 72 | 35,3 | 54,2 |

GSM8K con 20 preguntas fijas, greedy y `reasoning` en `none`: 15/20 a 2 pasadas, 16/20 a 3 pasadas y 16/20 a 5 pasadas con el build 4/8-bit; 14/20 a 3 pasadas con el build 4-bit.

## Requisitos de hardware

- VRAM/unified memory: 19,5 GB de pesos más 0,64 GB del borrador MTP en el build 4/8-bit; 16,5 GB más 0,64 GB en el build 4-bit. Hay que añadir la memoria de activaciones y caché KV.
- Hardware objetivo: Apple Silicon con memoria unificada; el autor reporta pruebas en un MacBook Pro M5 Max de 128 GB.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por esta conversión, que depende de MLX.
- Cabe en Macs de gama alta con 32 GB o más de memoria unificada, aunque no se han publicado mediciones en configuraciones inferiores al M5 Max de 128 GB.
- Despliegue: servidor `mlx_vlm.server` o API de Python `mlx_vlm`, con la bifurcación `inkling2-mlx` v0.2.8 (MLX-VLM estándar rechaza checkpoints de bucle variable). Requiere `torch` y `torchvision` solo en CPU para el procesador de imágenes.
- Latencia y throughput: ver tabla de velocidad por número de pasadas; de 97,7 tok/s con 1 pasada a 35,3 tok/s con 5 pasadas en el build 4/8-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TML-d24-varloop-research (esta conversión) | 26,4B | no disponible (hasta 1M en benchmarks) | Apache 2.0 | MLX, Apple Silicon | Bucles variables 1-5 pasadas, borrador MTP |
| Thinking Machines Inkling 2 Mini | no disponible | no disponible | no disponible | Hugging Face | Recomendado por el autor para producción; sirve de referencia en los benchmarks |
| netprojects/TML-d24-varloop-research-MLX-4bit | 26,4B | no disponible | Apache 2.0 | MLX, Apple Silicon | 16,5 GB, 93,2% de coincidencia en el siguiente token, KL 0,014 |
| netprojects/Inkling-2-Mini-MLX-4-8bit | no disponible | no disponible | no disponible | MLX, Apple Silicon | Conversión del modelo de producción de Thinking Machines |

## Limitaciones y advertencias

- Modelo de investigación: Thinking Machines recomienda Inkling 2 Mini para producción y no garantiza el comportamiento del artefacto de investigación.
- Conversión no oficial: mantenida por netprojects, no por Thinking Machines; los resultados de velocidad proceden de una única máquina y una prueba corta, no de un benchmark en reposo.
- El borrador MTP solo se carga a 3 pasadas; con otro número de pasadas no hay decodificación especulativa disponible.
- El build 4-bit no reproduce exactamente el siguiente token del 4/8-bit en el 6,8% de las posiciones (KL medio 0,014), lo que puede afectar a tareas sensibles.
- El rendimiento en contextos largos depende fuertemente del número de pasadas: con 1 pasada, MRCR v2 256K-512K cae al 26,2% y GraphWalks BFS 1M al 5,7%.
- El modelo puede razonar durante mucho tiempo; es necesario fijar `max_tokens` para evitar generaciones descontroladas.
- Idiomas soportados no disponibles; no se han publicado evaluaciones multilingües.
- Riesgo de alucinación y sesgos: no se han publicado análisis específicos para este modelo.
- Dependencia de una bifurcación concreta (`inkling2-mlx` v0.2.8); MLX-VLM estándar no carga estos checkpoints.
- Restricciones comerciales: la licencia Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigación conviene validar el comportamiento antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/TML-d24-varloop-research-MLX-4-8bit
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Build 4-bit: https://huggingface.co/netprojects/TML-d24-varloop-research-MLX-4bit
- Conversión de Inkling 2 Mini: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Repositorio de inferencia: https://github.com/internet-projects/inkling2-mlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
