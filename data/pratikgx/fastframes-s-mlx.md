# pratikgx/FastFrames-S-MLX

## Resumen

FastFrames-S-MLX es un port no oficial a MLX del modelo FastFrames-S de Apple, un generador de vídeo texto-a-vídeo autorregresivo de 1.300 millones de parámetros que produce clips de 832×480 píxeles, 81 fotogramas a 16 fps (unos 5 segundos de duración). El modelo original fue desarrollado por Apple Machine Learning Research (Gene Chou, Guandao Yang, Fujun Luan, Lars Mescheder, Wei Dong, Stephan R. Richter y Vladlen Koltun) y presentado en el artículo "FastFrames: Video Generation at Interactive Latency" (arXiv:2611.23226). El port lo publica el usuario pratikgx con el objetivo de ejecutar la inferencia en Apple Silicon mediante el framework MLX, sin depender de CUDA ni de PyTorch.

La propuesta técnica se apoya en una generación en dos pasos por fotograma, lo que reduce drásticamente el coste computacional frente a los modelos de difusión tradicionales que requieren decenas de pasos de denoising. El repositorio no redistribuye pesos: en tiempo de ejecución descarga los checkpoints oficiales (el refinador y decodificador de píxeles de Apple, el generador de 1.300 millones de parámetros de Causal-Forcing y el codificador umT5-XXL de Wan2.1) y los convierte en memoria a formato MLX.

Su relevancia actual radica en que demuestra que la generación de vídeo de calidad media puede ejecutarse en hardware de consumo Apple con un pico de memoria de aproximadamente 23 GB, alcanzando unos 30 segundos por clip de 5 segundos en un Mac mini M5 Pro de 64 GB. Es, por tanto, una pieza de infraestructura para investigación y experimentación local más que un modelo listo para producción comercial, dado el régimen de licencias que lo rodea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generador autorregresivo por fotogramas en dos pasos (DiT de Wan2.1-T2V-1.3B + refinador KV + decodificador de píxeles) con codificador de texto umT5-XXL |
| Parámetros totales | 1.300 millones (generador); el codificador umT5-XXL añade aproximadamente 11 GB de pesos |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionamiento por prompt de texto; 21 fotogramas latentes → 81 fotogramas RGB) |
| Tipos de cuantización | Post-entrenamiento opcional de capas `nn.Linear` con `--bits 4` u `--bits 8` (marcado como no probado por el autor) |
| Idiomas soportados | No disponible (el prompt de ejemplo está en inglés; el tokenizador es el de umT5-XXL) |
| Licencia | Código del port: MIT. Pesos de FastFrames-S (refinador KV y decodificador de píxeles): Apple Machine Learning Research Model License (solo investigación, no comercial). Generador Causal-Forcing: Apache-2.0. umT5-XXL y VAE de Wan2.1: Apache-2.0 |
| Formato de pesos | Conversión en memoria a MLX desde checkpoints originales (`.pt`/`.pth`); no se publica un dump de pesos MLX convertidos |
| Resolución de salida | 832×480 píxeles |
| Longitud de vídeo | 81 fotogramas a 16 fps (aproximadamente 5 segundos) |
| Librería | MLX (Apple Silicon) |

## Arquitectura y entrenamiento

El modelo se compone de varias piezas encadenadas. El texto de entrada se codifica con umT5-XXL (aproximadamente 11 GB de pesos en bf16). El generador principal es el DiT de Wan2.1-T2V-1.3B, sobre el que se aplica un esquema de "causal forcing" que permite generar el vídeo fotograma a fotograma de forma autorregresiva. Sobre esa base, FastFrames introduce un refinador KV y un decodificador de píxeles propios de Apple que permiten sintetizar cada fotograma en solo dos pasos, en lugar de los múltiples pasos de denoising habituales en modelos de difusión. La decodificación puede realizarse con el decodificador de píxeles de FastFrames o, alternativamente, con el VAE de Wan2.1 mediante la opción `--decoder vae`.

El port a MLX sustituye los kernels de PyTorch/CUDA por kernels MLX, remapea en memoria las claves de los checkpoints y los pesos de las convoluciones 3D, y convierte tablas calculadas originalmente en float64 a float32 para que puedan ejecutarse en Metal. El autor no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información corresponde al artículo original (arXiv:2611.23226) y no se detalla en la model card del port.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de 832×480 y clips de 81 fotogramas a 16 fps.
- Generación autorregresiva fotograma a fotograma en dos pasos, lo que reduce la latencia frente a esquemas de difusión multi-paso.
- Control de la longitud del clip mediante el parámetro `--latent-frames` (por defecto 21, que produce 81 fotogramas RGB).
- Reproducibilidad mediante semilla (`--seed`).
- Elección del decodificador de vídeo: decodificador de píxeles de FastFrames o VAE de Wan2.1.
- Cuantización opcional de capas lineales a 4 u 8 bits (funcionalidad presente pero no validada por el autor).
- Modo `--smoke` para pruebas con una red aleatoria diminuta sin descargar pesos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking"; es exclusivamente un modelo de generación de vídeo.

## Casos de uso

- Prototipado rápido de vídeo generativo en Mac: un desarrollador puede instalar el paquete, lanzar el script de generación y obtener un clip de 5 segundos en unos 30 segundos en un Mac mini M5 Pro de 64 GB, lo que permite iterar sobre prompts sin salir del entorno local.
- Investigación académica en generación de vídeo: el código sirve como referencia reproducible en MLX del esquema de dos pasos con causal forcing, útil para estudiar la calidad y estabilidad temporal de la generación autorregresiva fotograma a fotograma.
- Evaluación de técnicas de aceleración: al permitir comparar el decodificador de píxeles de FastFrames con el VAE de Wan2.1 y probar cuantización a 4 y 8 bits, es un banco de pruebas para medir el impacto de estas decisiones en calidad y memoria.
- Generación de material de previsualización (previsualización de storyboards): equipos de diseño pueden producir clips de referencia a partir de descripciones textuales en hardware Apple local, sin depender de servicios en la nube.
- Docencia y formación en modelos generativos: el paquete expone de forma explícita el pipeline (codificador de texto, generador DiT, refinador, decodificador), lo que facilita explicar cada etapa en un curso o taller.
- Pruebas de integración de MLX en pipelines de vídeo: sirve para validar cómo encaja MLX con ffmpeg y con flujos de postprocesado en macOS, midiendo memoria pico y tiempos por fotograma.
- Benchmarking de hardware Apple: con métricas documentadas (30,43 s de generación, 375,7 ms por fotograma, 22,93 GB de pico en MLX), permite comparar distintos chips y configuraciones de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FVD, CLIP score, VBench u otros) en la información disponible. El autor sí documenta una medición de inferencia en un Mac mini M5 Pro de 64 GB:

| Métrica | Valor |
|---|---|
| Configuración | FastFrames-S, 832×480, 81 fotogramas a 16 fps, semilla 0, sin `--bits` |
| Tiempo de generación | 30,43 s |
| Tiempo por fotograma de salida | 375,7 ms (aproximadamente 2,7 fps, unas 6 veces por debajo del tiempo real) |
| Memoria pico en MLX | 22,93 GB |
| RSS | No disponible (el dato aparece truncado en la model card) |

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple Silicon; el paquete no funciona en GPU NVIDIA ni en CPU x86.
- Memoria unificada: el autor reporta un pico de 22,93 GB en MLX durante una generación completa, por lo que se recomienda un equipo con al menos 32 GB de memoria unificada y, preferiblemente, 64 GB.
- Equipo de referencia: Mac mini M5 Pro con 64 GB, donde se obtuvo la medición de 30,43 s por clip.
- Almacenamiento: la primera ejecución descarga aproximadamente 1 GB de `apple/FastFrames-S`, el generador de 1,3B de `zhuhz22/Causal-Forcing` y unos 11 GB del codificador umT5-XXL de `Wan-AI/Wan2.1-T2V-1.3B`, más el tokenizador de `google/umt5-xxl`.
- Cuantización: existe la opción `--bits 4` y `--bits 8` para reducir memoria, pero el autor la marca como no probada; no hay cifras de VRAM ni de latencia para esos modos.
- Despliegue: no se soportan vLLM, TGI, llama.cpp ni Ollama; el único camino documentado es el paquete `fastframes_mlx` con Python 3.12, MLX y ffmpeg.
- Latencia y throughput: aproximadamente 2,7 fps de salida y unos 30 segundos por clip de 5 segundos en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución y duración | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastFrames-S-MLX (este port) | 1,3B (generador) + umT5-XXL | 832×480, 81 fotogramas a 16 fps | Prompt de texto; 21 fotogramas latentes | MIT (código) + Apple AMLR (pesos, solo investigación) + Apache-2.0 (componentes) | Hugging Face, requiere Apple Silicon |
| FastFrames-S (original de Apple) | 1,3B | 832×480, 81 fotogramas a 16 fps | Prompt de texto | Apple Machine Learning Research Model License (solo investigación) | Hugging Face y GitHub de Apple; código CUDA |
| Wan2.1-T2V-1.3B | 1,3B | No disponible en la información proporcionada | Prompt de texto | Apache-2.0 | Hugging Face |
| Causal-Forcing (generador) | 1,3B | No disponible en la información proporcionada | Generación autorregresiva por fotogramas | Apache-2.0 | Hugging Face y GitHub |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento objetiva.

## Limitaciones y advertencias

- Licencia restrictiva en los pesos clave: el refinador KV y el decodificador de píxeles de FastFrames-S están bajo la Apple Machine Learning Research Model License, que permite uso, modificación y redistribución únicamente con fines de investigación científica no comercial y desarrollo académico. El uso comercial requiere otra licencia.
- El port en sí (paquete `fastframes_mlx`) es MIT, pero eso no libera los pesos que descarga en tiempo de ejecución; el usuario debe aceptar la licencia de Apple al usarlos.
- No se redistribuyen pesos ni se publica un dump convertido a MLX: la conversión es en memoria en cada carga, lo que implica descargas de aproximadamente 12 GB en la primera ejecución y tiempos de arranque adicionales.
- La cuantización a 4 y 8 bits está marcada como no probada por el autor; no hay garantías de calidad ni de estabilidad en esos modos.
- Solo funciona en Apple Silicon con MLX; no hay soporte para CUDA, ROCm ni CPU genérica.
- El modelo base es de 1,3B parámetros, un tamaño modesto para generación de vídeo, por lo que cabe esperar menor fidelidad y coherencia temporal que modelos de mayor escala; no se han publicado métricas de calidad (FVD, CLIP score) que lo confirmen.
- Riesgo de alucinación visual y de incoherencias entre fotogramas inherente a la generación autorregresiva; no se documentan mitigaciones.
- Idiomas soportados no especificados; el tokenizador umT5-XXL es multilingüe en origen, pero no hay evidencia de calidad de prompts en castellano.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-18); se trata de una publicación muy reciente y sin validación comunitaria.
- El autor prohíbe explícitamente usar el nombre, marcas o logotipos de Apple para promocionar o respaldar el port.
- No hay soporte documentado para tool calling, agentes ni integración con frameworks de orquestación; es una herramienta de inferencia de un solo paso.

## Enlaces

- Repositorio del port en Hugging Face: https://huggingface.co/pratikgx/FastFrames-S-MLX
- Modelo original de Apple: https://huggingface.co/apple/FastFrames-S
- Código oficial (CUDA): https://github.com/apple-aiml-research/ml-fastframes
- Artículo: https://arxiv.org/abs/2611.23226
- Página del proyecto: https://apple-aiml-research.github.io/ml-fastframes/
- MLX: https://github.com/ml-explore/mlx
- Wan2.1: https://github.com/Wan-Video/Wan2.1
- Pesos de Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Causal Forcing++: https://github.com/thu-ml/Causal-Forcing
- Pesos de Causal-Forcing: https://huggingface.co/zhuhz22/Causal-Forcing
- Self-Forcing: https://github.com/guandeh17/Self-Forcing
- Ejemplos de MLX para Wan2.1: https://github.com/ml-explore/mlx-examples (PR #1409)
- Clip de ejemplo: https://huggingface.co/pratikgx/FastFrames-S-MLX/blob/main/examples/corgi.mp4
