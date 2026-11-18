# Efficient-Large-Model/Sol-H3-VAE

## Resumen

Sol-H3-VAE es un decodificador de vídeo rápido para el modelo generativo MiniMax-H3, desarrollado por Efficient-Large-Model (equipo vinculado a NVlabs/Sana). Sustituye el decodificador VAE de 36 capas de MiniMax-H3 por un decodificador no causal de 24 capas y 1.620 millones de parámetros, destilado a partir del original. Su función es transformar los latentes de vídeo normalizados de MiniMax-H3 en fotogramas RGB, manteniendo la misma interfaz y el mismo espacio de píxeles normalizado que el VAE original.

La innovación principal es el rendimiento: decodifica fotogramas completos con atención ventaneada en lugar de teselas espaciales, y procesa cada bloque nativo de 5 latentes de forma bidireccional. Según la model card, reduce el tiempo de decodificación de un clip de 5 segundos de 12,5 s a 5,0 s en una RTX 5090 (768p) y de 6,16 s a 0,34 s en una GB200 (720p), con un PSNR de 45,4 dB sobre latentes retenidos entre 720p y 2K.

Es relevante porque permite acelerar de forma sustancial una etapa crítica de los pipelines de generación de vídeo con MiniMax-H3, integrándose en el motor Sol-H3 para ComfyUI. El decodificador de audio del pipeline original no se modifica. El repositorio ocupa 6,5 GB y acumula más de 10.000 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador VAE no causal, transformer de 24 capas con atención ventaneada |
| Parametros totales | 1.620 millones (1,62B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa clips completos; bloques nativos de 5 latentes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no de texto) |
| Licencia | Código Apache-2.0; pesos sujetos a la licencia de MiniMax-H3 |
| Formato de pesos | safetensors (`sol_h3_vae.safetensors`) |

## Arquitectura y entrenamiento

Sol-H3-VAE es un decodificador VAE destilado del decodificador VAE de 36 capas de MiniMax-H3. La arquitectura resultante tiene 24 capas y es no causal: decodifica fotogramas completos mediante atención ventaneada en lugar de dividir la imagen en teselas espaciales, y decodifica cada bloque nativo de 5 latentes de forma bidireccional. Acepta los mismos latentes normalizados de vídeo con forma `(1, T, 24, H/16, W/16)` y devuelve los fotogramas en el mismo espacio de píxeles normalizado que el decodificador VAE de H3.

El proceso de destilación no está detallado en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO: no disponible). La model card sí reporta la fidelidad de la destilación: PSNR de 45,4 dB sobre latentes retenidos entre 720p y 2K, y 38,2 dB sobre un clip generado a 768p. La implementación rápida (motor por defecto) requiere Triton, FlashAttention-4 (`flash_attn.cute`) y QuACK, y captura un grafo CUDA por cada forma de latente (unos 25 s en RTX 5090 en la primera llamada). Existe un modo `engine="ref"` en PyTorch puro sin esas dependencias.

## Capacidades

- Decodificación de latentes de vídeo de MiniMax-H3 a fotogramas RGB, con salida en espacio de píxeles normalizado o en `uint8` directamente en GPU (`decode_rgb_uint8`).
- Compatibilidad directa con los latentes normalizados del VAE de MiniMax-H3: misma entrada y misma salida que el decodificador original.
- Procesamiento de clips completos con atención ventaneada, sin teselado espacial.
- Decodificación bidireccional por bloques nativos de 5 latentes.
- Aceleración mediante grafo CUDA y kernels especializados (FlashAttention-4, QuACK) en el motor rápido.
- Modo de referencia en PyTorch puro para entornos sin Triton ni FlashAttention-4.
- No incluye decodificador de audio (el de MiniMax-H3 se mantiene sin cambios).
- No es un modelo de texto: no soporta tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Aceleración de pipelines de generación de vídeo con MiniMax-H3: sustituir el decodificador VAE original por Sol-H3-VAE reduce el tiempo de decodificación de un clip de 5 s de 12,5 s a 5,0 s en RTX 5090 a 768p, lo que permite iterar más rápido en flujos de creación de vídeo.
- Producción de vídeo a 720p en hardware de centro de datos: en GB200 el tiempo baja de 6,16 s a 0,34 s por clip de 5 s, adecuado para servicios que necesitan generar y servir vídeo con baja latencia.
- Generación de vídeo en 2K: en GB200 la decodificación pasa de 14,5 s a 0,89 s por clip de 5 s, lo que hace viable el alta resolución en entornos con GPU de gran memoria.
- Integración en ComfyUI: el modelo es el decodificador de vídeo de una etapa de Sol-H3 en ComfyUI, por lo que encaja en flujos de trabajo nodales de generación de vídeo.
- Investigación sobre destilación de VAEs: sirve como caso de estudio de destilación de un decodificador de 36 a 24 capas con pérdida de fidelidad medida en PSNR (45,4 dB en latentes retenidos).
- Evaluación comparativa de decodificadores: permite medir el impacto de la decodificación en la calidad final del vídeo generado, al compartir espacio de latentes y de píxeles con el VAE original.
- Despliegue en GPUs de consumo: con el motor eager y movimiento de pesos a RAM entre peticiones, Sol-H3 lo ejecuta en una tarjeta de 32 GB, lo que permite prototipar en estaciones de trabajo.

## Benchmarks y rendimiento

| Clip de 5 segundos | H3 VAE | Sol-H3-VAE |
|---|---:|---:|
| 768p, RTX 5090 | 12,5 s | 5,0 s |
| 720p, GB200 | 6,16 s | 0,34 s |
| 2K, GB200 | 14,5 s | 0,89 s |

| Métrica de fidelidad | Valor |
|---|---:|
| PSNR sobre latentes retenidos (720p a 2K) | 45,4 dB |
| PSNR sobre clip generado a 768p | 38,2 dB |

Las mediciones en GB200 usan un grafo CUDA capturado; la de RTX 5090 es en modo eager, tal como lo ejecuta Sol-H3. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: unos 24 GiB a 720p y 48 GiB a 2K para un clip de 5 s con grafo CUDA; el consumo crece con la longitud del clip.
- GPU recomendadas: GB200 para 720p y 2K con grafo CUDA; RTX 5090 para 768p en modo eager.
- GPU de consumo: Sol-H3 ejecuta el motor eager y mueve los pesos a RAM del host entre peticiones para caber en una tarjeta de 32 GB.
- Software: PyTorch con CUDA, Diffusers con soporte de MiniMax-H3, Triton, FlashAttention-4 (`flash_attn.cute`) y QuACK para el motor rápido; `engine="ref"` funciona en PyTorch puro.
- Versiones probadas: PyTorch 2.12 (CUDA 13), Triton 3.7, Diffusers 0.40, FlashAttention-4 4.0.0b19 y QuACK 0.6.3 en RTX 5090.
- Latencia de arranque: la primera llamada por cada forma de latente compila kernels y captura el grafo CUDA (unos 25 s en RTX 5090); las siguientes reutilizan el grafo.
- Throughput: no disponible más allá de los tiempos por clip reportados.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tiempo de decodificación (720p, GB200, clip 5 s) | Licencia |
|---|---|---:|---:|---|
| Sol-H3-VAE | 1,62B | VAE de vídeo destilado, no causal | 0,34 s | Código Apache-2.0; pesos bajo licencia MiniMax-H3 |
| H3 VAE (MiniMax-H3) | no disponible (36 capas) | VAE de vídeo original | 6,16 s | Licencia MiniMax-H3 |

No se dispone de información sobre otros decodificadores de vídeo comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No causal: decodifica el clip completo de una vez, por lo que no puede hacer streaming latente a latente.
- La memoria crece con la longitud del clip: unos 24 GiB a 720p y 48 GiB a 2K para 5 segundos con grafo CUDA.
- Al ser destilado, la salida es cercana a la del decodificador VAE de H3 pero no idéntica (PSNR de 45,4 dB en latentes retenidos y 38,2 dB en un clip generado a 768p).
- En GPUs SM120 (RTX 5090, DGX Spark), FlashAttention-4 4.0.0b19 a 4.0.0b22 tiene un bug de varlen que provoca un acceso ilegal a memoria en el motor rápido; hay que aplicar el guard de Sol-H3 en ComfyUI antes de la primera decodificación o usar `engine="ref"`.
- Licencia: el código es Apache-2.0, pero los pesos están sujetos a la licencia de MiniMax-H3, lo que condiciona el uso comercial; conviene revisar los términos de dicha licencia antes de desplegar en producción.
- No se han documentado sesgos ni riesgos de alucinación específicos, al no ser un modelo generativo de texto; los sesgos heredados dependerían del modelo MiniMax-H3 que produce los latentes.
- Idiomas y cuantizaciones: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/Sol-H3-VAE
- MiniMax-H3 en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia de MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Sol-H3 en ComfyUI (repositorio NVlabs/Sana): https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/Sol-H3-ComfyUI
- Guard para SM120 (FlashAttention-4): https://github.com/NVlabs/Sana/blob/sol-engine/models/minimax_h3/Sol-H3-ComfyUI/sol_h3_engine/fa4_sm120.py
- FlashAttention-4: https://github.com/Dao-AILab/flash-attention
- QuACK: https://github.com/Dao-AILab/quack
- Diffusers: https://github.com/huggingface/diffusers
