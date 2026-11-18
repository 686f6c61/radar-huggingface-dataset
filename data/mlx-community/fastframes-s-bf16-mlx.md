# mlx-community/FastFrames-S-bf16-mlx

## Resumen

FastFrames-S es un modelo de generación de vídeo a partir de texto desarrollado por Apple, publicado en el repositorio `apple/FastFrames-S`. La versión aquí descrita es un port no oficial a MLX realizado por la comunidad `mlx-community`, pensado para ejecutarse en Macs con Apple Silicon. El modelo genera clips de 5 segundos (81 fotogramas a 832x480 y 16 fps) a partir de un prompt textual, y su interés radica en que sustituye el VAE de Wan2.1 por un decodificador de píxeles causal propio y añade una red de refinamiento de caché KV que evita una segunda pasada del DiT.

La arquitectura combina cuatro componentes: el codificador de texto umT5-XXL de Wan2.1, un DiT causal de Wan2.1-1.3B que denoisa un fotograma latente (4 fotogramas de vídeo) por paso en solo 2 pasos contra una caché KV de los fotogramas anteriores, la red FastFrames de refinamiento KV y el decodificador de píxeles causal. El resultado es un pipeline de difusión por pasos muy reducido, orientado a inferencia en hardware de consumo.

El modelo es relevante porque demuestra generación de vídeo por difusión con un coste de denoising mínimo (2 pasos por fotograma latente) y sin VAE, en un momento en el que la eficiencia de los pipelines de vídeo es un cuello de botella clave. La licencia Apple AMLR restringe el uso a investigación científica no comercial, lo que limita su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT causal (Wan2.1-1.3B) con decodificador de píxeles causal y refinamiento KV; codificador de texto umT5-XXL |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera 81 fotogramas de vídeo por clip) |
| Tipos de cuantización | bf16 (el repo distribuido es bf16; no se listan otras) |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr (Apple Machine Learning Research Model License, solo investigación no comercial) |
| Formato de pesos | safetensors en formato MLX (repo de 15.2 GB) |

## Arquitectura y entrenamiento

El pipeline tiene cuatro etapas. Primero, el codificador de texto umT5-XXL de Wan2.1 procesa el prompt una sola vez. Después, un DiT causal basado en Wan2.1-1.3B denoisa un fotograma latente (equivalente a 4 fotogramas de vídeo) en dos pasos, condicionado por una caché KV de los fotogramas previos. A continuación, la red FastFrames de refinamiento KV repara la entrada de caché de cada fotograma terminado en lugar de ejecutar una segunda pasada limpia del DiT. Finalmente, el decodificador de píxeles causal de FastFrames convierte directamente las características del DiT en fotogramas RGB, sustituyendo al VAE de Wan.

El modelo se apoya en el generador Causal Forcing++ de dos pasos y en los pesos de Wan2.1-1.3B, mientras que los componentes propios de FastFrames (red de refinamiento KV y decodificador de píxeles) son los que aportan la innovación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El port a MLX incluye optimizaciones específicas: la opción `xcollapse` modifica la atención cruzada y `attn=flash2` activa un kernel Metal de atención propio (aproximadamente un 5 % más lento).

## Capacidades

- Generación de vídeo a partir de texto: clips de 5 segundos, 81 fotogramas, resolución 832x480 y 16 fps.
- Generación causal fotograma a fotograma con caché KV, lo que permite denoising incremental.
- Control del número de fotogramas mediante `--frames N` (N fotogramas latentes producen 4N-3 fotogramas de vídeo).
- Reproducibilidad mediante semilla (`seed`) especificada por línea de comandos.
- Procesamiento por lotes con `batch.py`, que carga el codificador de texto una vez y cachea embeddings por prompt.
- Ejecución en Apple Silicon mediante MLX, con opciones de A/B (`--reference`) y kernels de atención alternativos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Prototipado rápido de vídeo generativo en investigación: el modelo permite generar clips de 5 segundos con dos pasos de denoising por fotograma latente, lo que facilita experimentos iterativos sobre prompts y semillas en un Mac con Apple Silicon.
- Investigación sobre decodificadores sin VAE: al sustituir el VAE de Wan por un decodificador de píxeles causal, sirve para estudiar la calidad y coherencia temporal de decodificadores directos frente a enfoques latentes.
- Estudio de cachés KV en difusión causal: la red de refinamiento KV es un objeto de análisis concreto para investigar cómo reparar entradas de caché sin una segunda pasada del DiT.
- Evaluación comparativa de pipelines de vídeo: con `--reference` y `--opts xcollapse=0` se puede comparar el port optimizado con el port plano y aislar el efecto de cada cambio.
- Generación de material visual para demostraciones académicas: los ejemplos incluidos (corgi, costa de Big Sur, llama, zorro rojo) muestran el comportamiento con prompts cortos y largos.
- Pruebas de reproducibilidad en hardware de consumo: con un pico de 11 GB de memoria, se puede ejecutar en un M3 Max de 36 GB, lo que permite validar resultados en equipos de sobremesa.
- Generación por lotes de clips para estudios de percepción: `batch.py` permite producir varios vídeos con distintas semillas y prompts en una sola ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico de 11 GB durante la inferencia (dato del autor).
- Hardware probado: Apple M3 Max con 36 GB de memoria unificada.
- Requiere Mac con Apple Silicon y memoria libre suficiente para el pico de 11 GB; el autor indica que se probó en 36 GB, pero no especifica el mínimo exacto.
- Descarga del repositorio: aproximadamente 15 GB.
- Almacenamiento adicional: el tokenizador umT5 se descarga desde `Wan-AI/Wan2.1-T2V-1.3B` en el primer uso (unos pocos MB).
- Software: Python 3 (probado con 3.13), `ffmpeg` en el PATH y `requirements.txt` del repositorio.
- Despliegue: scripts `run.py` y `batch.py` incluidos; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son frameworks de LLM, no aplicables a este pipeline de vídeo).
- Latencia y throughput: no disponibles; el script imprime y guarda un JSON con los tiempos junto al mp4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| FastFrames-S (este port MLX) | no disponible (DiT base de 1.3B) | 81 fotogramas, 832x480, 16 fps | apple-amlr, solo investigación no comercial | Hugging Face (mlx-community) |
| Wan2.1-T2V-1.3B | 1.3B (DiT) | no disponible en la información | no disponible en la información | Hugging Face (Wan-AI) |
| Alternativas de texto a vídeo de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre FastFrames-S y Wan2.1-T2V-1.3B ni con otros modelos de texto a vídeo en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Apple Machine Learning Research Model License permite uso, modificación y redistribución solo para investigación científica no comercial; aplica al port en su conjunto.
- Port no oficial: no está hecho, revisado ni respaldado por Apple, y no tiene relación con la compañía.
- Calidad variable con prompts cortos: el propio autor señala que el ejemplo del corgi muestra al perro nadando en lugar de surfeando; los prompts largos y descriptivos siguen mejor el texto.
- Riesgo de alucinación visual: no se documentan métricas de fidelidad al prompt ni de coherencia temporal más allá de los ejemplos cualitativos.
- Idiomas soportados: no disponibles; el codificador umT5-XXL es multilingüe, pero no se confirma el comportamiento por idioma.
- Longitud fija de salida por defecto: 81 fotogramas (5 segundos); clips más cortos requieren ajustar `--frames`.
- Dependencia de hardware Apple Silicon: el port MLX no está pensado para GPU NVIDIA ni otros aceleradores.
- Sin datos de benchmarks: no hay métricas publicadas que permitan comparar objetivamente con alternativas.
- Uso comercial no permitido sin licencia adicional de Apple; verificar `LICENSE-APPLE-AMLR` antes de cualquier despliegue.

## Enlaces

- Repositorio Hugging Face del port: https://huggingface.co/mlx-community/FastFrames-S-bf16-mlx
- Modelo base: https://huggingface.co/apple/FastFrames-S
- Licencia Apple AMLR: https://huggingface.co/mlx-community/FastFrames-S-bf16-mlx/blob/main/LICENSE-APPLE-AMLR
- MLX: https://github.com/ml-explore/mlx
- Codificador de texto y tokenizador Wan2.1: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Paper referenciado en los tags: arxiv:2602.02214 (no se dispone de URL verificada en la información proporcionada)
