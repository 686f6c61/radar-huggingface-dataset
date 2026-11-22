# finaltv971/fastframes-l-mlx

## Resumen

FastFrames-L MLX es un port no oficial, experimental y orientado a inferencia del modelo de generación de vídeo texto-a-vídeo FastFrames-L de 14B de Apple, adaptado para ejecutarse sobre Apple Silicon mediante el framework MLX. El autor del port es el usuario `finaltv971` y se distribuye como repositorio de código de inferencia y cuantización: los pesos originales no se alojan aquí, sino que se descargan de los repositorios de Apple y de terceros durante la instalación.

El modelo resuelve la generación de clips de vídeo de 832 × 480 píxeles a 16 fps en formato H.264 a partir de un prompt de texto. Su relevancia actual reside en que permite ejecutar un generador de vídeo de 14B en hardware de consumo profesional de Apple (probado en un Mac Studio M5 Max con 64 GiB de memoria unificada), algo que en el ecosistema CUDA requeriría GPUs de datacenter. Incluye una ruta de cuantización de 8 bits que reduce el checkpoint del generador de 28,58 GB a 15,40 GB.

La arquitectura subyacente es un generador de 40 capas con atención causal sobre frames (frame-causal), complementado por un refinador de KV y un decodificador de píxeles que proyecta de 5120 a 1536 dimensiones. El texto se codifica con el encoder umT5-XXL de Wan2.1. La licencia es la Apple Machine Learning Research Model License Agreement, restringida a investigación científica no comercial y desarrollo académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador transformer de 40 capas con atención frame-causal, refinador de KV y decodificador de píxeles (puente 5120→1536); encoder de texto umT5-XXL |
| Parametros totales | 14B (según la model card del port) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y Q8 (cuantización afín de 8 bits en grupos de 64 sobre 400 matrices de proyección del generador) |
| Idiomas soportados | no disponible |
| Licencia | Apple Machine Learning Research Model License Agreement (apple-amlr); uso no comercial, solo investigación científica y desarrollo académico |
| Formato de pesos | safetensors (checkpoints de Apple: dit, kv_refiner, pixel_decoder); implementación en MLX |

## Arquitectura y entrenamiento

El modelo base FastFrames-L de Apple es un generador de vídeo de 14B parámetros organizado en 40 capas con atención causal sobre frames, lo que permite generar clips de forma secuencial en el tiempo. El pipeline completo incluye tres componentes con checkpoints separados: el generador (`dit.safetensors`), un refinador de KV (`kv_refiner.safetensors`) y un decodificador de píxeles (`pixel_decoder.safetensors`) que realiza un puente de proyección de 5120 a 1536 dimensiones. La codificación del texto se delega al encoder umT5-XXL de Wan2.1, reutilizado del port MLX de FastFrames-S de la comunidad.

Este repositorio no entrena el modelo: es un port de inferencia. Reutiliza la implementación de referencia MLX de FastFrames-S y sustituye el generador, el refinador de KV y el decodificador por los checkpoints L de Apple, aplicando el schedule de denoising específico de la variante L. La innovación técnica principal del port es la cuantización Q8 opcional de 400 matrices de proyección del generador con cuantización afín en grupos de 64, manteniendo en coma flotante el resto de parámetros, activaciones, caché KV, refinador y decodificador. Además, ofrece agrupación de evaluaciones entre capas, compilación de la función feed-forward cuantizada y un kernel de self-attention Metal/NAX experimental. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generación de vídeo texto-a-vídeo: produce clips H.264 de 832 × 480 píxeles a 16 fps a partir de un prompt descriptivo.
- Control de duración mediante el número de frames latentes: 5 frames latentes generan 17 frames de vídeo; 21 frames latentes generan 81 frames (aproximadamente 5 segundos a 16 fps).
- Reproducibilidad determinista mediante semilla (`--seed`), con clips Q8 idénticos píxel a píxel en las pruebas del autor.
- Cuantización Q8 en el propio flujo de inferencia, con generación del checkpoint cuantizado mediante un script dedicado (`quantize.py`).
- Aceleración opcional mediante kernel Metal/NAX para self-attention en Apple Silicon.
- Compilación opcional de la función feed-forward cuantizada y agrupación de evaluaciones por capas.
- Salida de metadatos: genera un JSON adyacente al MP4 con tiempos y picos de asignación de memoria MLX.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo explícito.

## Casos de uso

- Prototipado de investigación en generación de vídeo: el modelo permite a investigadores académicos experimentar con un generador de 14B en un único Mac Studio, sin acceso a clústeres CUDA, gracias a la ruta MLX y a la cuantización Q8.
- Generación de clips cortos para previsualización creativa: con 17 frames por defecto se obtienen clips breves útiles para validar ideas de guion o storyboard antes de producir con herramientas comerciales.
- Evaluación de técnicas de cuantización: el repositorio incluye comparativas BF16 frente a Q8 con métricas de tiempo y memoria, lo que lo convierte en una base para estudiar el impacto de la cuantización afín de 8 bits en modelos de difusión de vídeo.
- Benchmarking de hardware Apple Silicon: los scripts registran tiempos y picos de memoria MLX, útiles para caracterizar el rendimiento de chips M-series en cargas de difusión de vídeo.
- Reproducción de experimentos académicos: la fijación de revisiones concretas de los checkpoints y la semilla permiten reproducir resultados de forma controlada en entornos de investigación.
- Desarrollo de pipelines de vídeo sintético no comercial: integrable en flujos de generación de material audiovisual para docencia, demostraciones o datasets de investigación, siempre bajo la licencia AML R.
- Estudio de kernels Metal personalizados: la ruta NAX experimental sirve como banco de pruebas para optimizaciones de atención en Metal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones locales de latencia y memoria en un Mac Studio M5 Max con 64 GiB de memoria unificada, MLX 0.32.2 y Python 3.13:

| Configuración | Frames | Tiempo total | Pico MLX |
|---|---:|---:|---:|
| BF16, MLX estándar | 17 | 24,1 s | 40,2 GiB |
| BF16, MLX estándar | 41 | 51,9 s | 47,4 GiB |
| Q8, NAX, evaluación cada 4 capas, FFN compilada | 81 | 75,5 s | 47,2 GiB |

El autor indica que la última fila es la media de dos ejecuciones locales con un mismo prompt. Con el compilador de feed-forward desactivado, la media fue de 80,6 s con el mismo pico de memoria. En una prueba en entorno limpio, la ruta Q8 estándar generó un clip de 81 frames en 77,8 s con 47,2 GiB de pico. La paridad de salida con CUDA, otros modelos de Mac y una evaluación amplia de calidad quedan sin verificar según el propio autor.

## Requisitos de hardware

- Memoria unificada: el autor reporta picos de 40,2 GiB (17 frames BF16) y 47,2 GiB (81 frames Q8), por lo que se recomienda un equipo con al menos 64 GiB de memoria unificada.
- Hardware probado: Mac Studio M5 Max con 64 GiB de memoria unificada.
- Almacenamiento: aproximadamente 42 GB para los pesos fuente y 15,4 GB adicionales si se conserva el checkpoint Q8 junto a los originales.
- No cabe en GPUs de consumo convencionales con 24 GB o menos de VRAM en BF16; la ruta Q8 reduce el checkpoint del generador a 15,40 GB, pero el pico de memoria reportado sigue siendo de 47,2 GiB.
- Despliegue: exclusivamente mediante MLX en Apple Silicon; requiere Python 3.13, MLX 0.32.2 y FFmpeg con `libx264`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: entre 24,1 s (17 frames BF16) y 75,5 s (81 frames Q8 con optimizaciones) en el hardware probado.
- Aceleración opcional: kernel Metal/NAX para self-attention, probado solo en M5 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastFrames-L MLX (este port) | 14B | Texto-a-vídeo, MLX | no disponible | Apple AML R (no comercial) | Hugging Face, pesos descargados de Apple |
| FastFrames-S MLX (mlx-community) | no disponible | Texto-a-vídeo, MLX | no disponible | no disponible en la información | Hugging Face |
| Wan2.1-T2V-1.3B | 1,3B | Texto-a-vídeo | no disponible | no disponible en la información | Hugging Face |

La información disponible no permite comparar rendimiento de calidad entre estos modelos; solo se documenta que el port reutiliza el encoder de texto de Wan2.1 y la implementación de referencia de FastFrames-S.

## Limitaciones y advertencias

- Port no oficial y experimental: no está mantenido por Apple y la paridad de salida con la implementación CUDA original no está verificada.
- Licencia restrictiva: la Apple Machine Learning Research Model License Agreement limita el uso a investigación científica no comercial y desarrollo académico; el uso comercial no está permitido.
- Idiomas soportados no documentados; el comportamiento multilingüe del encoder umT5-XXL en este pipeline no está evaluado.
- Evaluación de calidad limitada: el autor solo realizó una pequeña comprobación de reproducibilidad con un prompt de un velero y otro de un zorro; no hay evaluación amplia de calidad, coherencia temporal ni fidelidad al prompt.
- Solo probado en un Mac Studio M5 Max; el rendimiento en otros modelos de Mac y en GPUs NVIDIA no está verificado.
- El kernel Metal/NAX es experimental y solo se validó en la configuración M5 Max.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión de vídeo; no se documentan sesgos específicos.
- Dependencia de descargas externas fijadas por revisión (Apple, mlx-community y Wan-AI), lo que puede romper la instalación si esos repositorios cambian.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Repositorio del port: https://huggingface.co/finaltv971/fastframes-l-mlx
- Licencia: https://huggingface.co/finaltv971/fastframes-l-mlx/blob/main/LICENSE
- Modelo base: https://huggingface.co/apple/FastFrames-L
- Implementación de referencia de Apple: https://github.com/apple-aiml-research/ml-fastframes
- Port MLX de FastFrames-S: https://huggingface.co/mlx-community/FastFrames-S-bf16-mlx
- Wan2.1-T2V-1.3B (encoder de texto): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Framework MLX: https://github.com/ml-explore/mlx
