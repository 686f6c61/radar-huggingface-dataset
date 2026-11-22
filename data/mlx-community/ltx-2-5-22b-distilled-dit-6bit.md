# mlx-community/LTX-2.5-22B-Distilled-DiT-6bit

## Resumen

LTX-2.5 22B Distilled DiT (MLX 6-bit Affine) es una cuantizacion de 6 bits del transformer de difusion (DiT) destilado de 22 mil millones de parametros de Lightricks/LTX-2.5, publicada por la comunidad mlx-community para su uso con la libreria MLX en Apple Silicon. El modelo original de Lightricks es un generador de video y audio a partir de texto o imagen (text-to-video, image-to-video, text-to-audio-video, image-to-audio-video); esta variante empaqueta unicamente el checkpoint del DiT (`transformer-distilled.safetensors`) en formato safetensors cuantizado con `bits=6, group_size=64, mode="affine"`, reduciendo el peso del DiT a 15,96 GB frente a los 20,59 GB de la version Q8.

La relevancia de esta release es practica: permite ejecutar un modelo de video de 22B en hardware Apple Silicon con memoria unificada, manteniendo una fidelidad cercana al BF16 (coseno de video 0,9868, RMSE 0,2002; coseno de audio 0,9967, RMSE 0,0507 en paridad de una sola pasada). Se trata de un fichero "drop-in" que debe combinarse con el VAE, vocoder, upscalers, connector y el codificador de texto Gemma de un pack MLX de LTX-2.5 para funcionar.

No es un modelo autonomo: es un componente cuantizado del pipeline LTX-2.5, orientado a desarrolladores que quieran generar video con audio en Macs con chip M-series, con licencia de comunidad LTX-2.x que restringe el uso comercial segun sus terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) destilado; cuantizacion MLX affine |
| Parametros totales | 22B (modelo base LTX-2.5) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine (`bits=6, group_size=64`); existe variante MXFP4+Q6+Q8 calibrada |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2.x-community-license (other) |
| Formato de pesos | safetensors (MLX quantized); 7.355 tensores, 15,958 GB |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer (DiT) destilado de 22B de Lightricks, disenado para generacion conjunta de video y audio. Esta release no reentrena el modelo: cuantiza las 1.632 capas lineales 2D (`.weight` dentro de `transformer_blocks`) a 6 bits con modo affine y `group_size=64`, sin excepciones de empaquetado, y mantiene en BF16 los embeddings de frontera, las normas, las modulaciones AdaLN/timestep y las proyecciones de salida. El resultado son 7.355 tensores y 15,958 GB, con un mapa por tensor documentado en `quantization_policy.json`.

La fuente es `Lightricks/LTX-2.5` (commit `49b093a39c19`, fichero `ltx-2.5-22b-distilled-transformer-bf16.safetensors`). Al ser una variante destilada, el DiT esta optimizado para pocos pasos de denoising, lo que se refleja en los tiempos medidos (5,557 s/paso en M5 Pro). No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de texto (text-to-video) y de imagen (image-to-video).
- Generacion conjunta de audio y video: text-to-audio-video e image-to-audio-video.
- Soporte de prompt negativo y de NAG (Normalized Attention Guidance) para suprimir elementos no deseados, como musica de fondo.
- Decodificacion de video con VAE o con decodificador de difusion (`--video-decoder diffusion`) para mayor nitidez en piel y tejidos.
- Generacion por tiles para resoluciones altas (1280x704, 1152x768).
- Multilingue en prompts: en, de, es, fr, ja, ko, zh, it, pt.
- No se menciona soporte de tool calling, function calling ni comportamiento agentico; no disponible.

## Casos de uso

- Generacion de clips cortos con audio en local sobre Mac: usar `ltx-2-mlx generate` con `--distilled --low-ram --nag` para producir videos de 97 frames a 24 fps en resolucion 768x512, aprovechando que el checkpoint Q6 cabe en memoria unificada de 64 GiB sin swap.
- Prototipado de video para redes sociales: generar variantes de un mismo prompt con distintas semillas (`--seed`) para seleccionar la mejor toma antes de producir en resolucion superior con tiles.
- Creacion de video a partir de storyboard o imagen fija (image-to-video): partir de una imagen de referencia y animarla, util para previsualizacion de escenas o animaticos.
- Generacion de audio sincronizado con video: emplear las capacidades text-to-audio-video para producir clips con ambiente o locucion, y usar `--nag --negative-prompt` para evitar musica no deseada.
- Iteracion rapida en investigacion de difusion: comparar variantes de cuantizacion (Q6 frente a Q8, MXFP4 o mixed calibrated) sobre las mismas semillas para estudiar el impacto de la cuantizacion en la fidelidad visual y de audio.
- Renderizado por tiles en produccion de contenido: generar a 1280x704x97 con 2 tiles o 1152x768x121 con 3 tiles para piezas de mayor resolucion, aceptando mayor tiempo de decodificacion.

## Benchmarks y rendimiento

Paridad de una sola pasada del DiT frente a BF16 (medido en Apple M5 Pro, 64 GiB RAM unificada, macOS 27.2.1, Python 3.13.18, mlx 0.32.2):

| Variante | Tamano DiT | Video Cos | Video RMSE | Audio Cos | Audio RMSE |
|---|---:|---:|---:|---:|---:|
| Q8 (affine g64) | 20,59 GB | 0,999805 | 0,02390 | 0,999681 | 0,01574 |
| MXFP8 (g32) | 20,02 GB | 0,992870 | 0,14793 | 0,994663 | 0,06530 |
| Mixed Calibrated | 13,20 GB | 0,987724 | 0,21676 | 0,989421 | 0,09092 |
| Q6 (este repo) | 15,96 GB | 0,986826 | 0,20015 | 0,996734 | 0,05065 |
| MXFP4 (g32) | 10,74 GB | 0,984554 | 0,21650 | 0,970633 | 0,15176 |
| Q4 (affine g64) | 11,32 GB | 0,816431 | 0,71769 | 0,968157 | 0,15504 |

Benchmark end-to-end de 48 clips (6 escenarios x 2 semillas, 12 clips por variante):

| Variante | Tiempo medio | Denoise medio | s/paso | Pico MLX | Max swap delta | Clips silenciosos |
|---|---:|---:|---:|---:|---:|---:|
| Mixed Calibrated | 70,28 s | 57,38 s | 5,216 s | 29,45 GB | 0,0 MB | 0 |
| Q8 | 74,19 s | 60,88 s | 5,535 s | 29,45 GB | 0,0 MB | 0 |
| Q6 (este repo) | 74,69 s | 61,12 s | 5,557 s | 29,45 GB | 0,0 MB | 0 |
| Q4 | 75,17 s | 61,32 s | 5,575 s | 29,45 GB | 0,0 MB | 0 |

Tiempos de decodificacion con `--video-decoder diffusion` en M5 Pro 64 GB: 768x512x97 en 162,5 s sin tiles; 1280x704x97 en 416,1 s con 2 tiles; 1152x768x121 en 551,6 s con 3 tiles.

## Requisitos de hardware

- VRAM/memoria unificada: pico medido de 29,45 GB en MLX durante el benchmark end-to-end con el pack completo; el DiT Q6 ocupa 15,96 GB.
- Hardware de referencia: Apple M5 Pro con 64 GiB de RAM unificada, sin swap (0,0 MB de max swap delta).
- Cabe en Apple Silicon con memoria unificada suficiente; no esta pensado para GPUs CUDA (formato MLX).
- Despliegue: libreria `mlx` (probado con `mlx 0.32.2`) y CLI `ltx-2-mlx` con soporte nativo de cuantizacion de 6 bits y por capa. Requiere un pack LTX-2.5 MLX completo (VAE, vocoder, upscalers, connector y encoder Gemma), por ejemplo `dgrauet/ltx-2.5-mlx-q8`.
- Latencia: 5,557 s/paso de denoising; 74,69 s de media por clip de 12 clips en el benchmark.
- No se dispone de datos de throughput para CUDA, vLLM, llama.cpp, Ollama ni TGI; no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Fidelidad vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5 22B Q6 (este repo) | 22B | no disponible | Video cos 0,9868 | ltx-2.x-community | MLX, safetensors |
| LTX-2.5 22B Q8 | 22B | no disponible | Video cos 0,9998 | ltx-2.x-community | MLX, safetensors |
| LTX-2.5 22B Mixed Calibrated | 22B | no disponible | Video cos 0,9877 | ltx-2.x-community | MLX, safetensors |
| LTX-2.5 22B MXFP4 | 22B | no disponible | Video cos 0,9846 | ltx-2.x-community | MLX, safetensors |

No se dispone de comparacion con modelos de otras familias (por ejemplo, generadores de video de otros autores) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el resto del pipeline LTX-2.5 (VAE, vocoder, upscalers, connector, encoder Gemma) para generar video.
- Licencia `ltx-2.x-community-license`: revisar los terminos antes de cualquier uso comercial; el uso con el encoder Gemma anade los Terminos de Uso y la Politica de Uso Prohibido de Gemma.
- La cuantizacion Q4 affine muestra deriva visible en las mismas semillas (coseno de video 0,8164, RMSE 0,7177); Q6 mantiene mayor fidelidad pero no es identico a Q8 (RMSE 0,2002 frente a 0,0239).
- Riesgo de artefactos en rostros, manos, iluminacion y geometria de fondo, mayor cuanto mas agresiva es la cuantizacion.
- Riesgo de generar musica de fondo no deseada si no se usa `--nag --negative-prompt`; el prompt positivo con "no music" es menos fiable.
- Solo soportado en Apple Silicon con MLX; no hay soporte documentado para CUDA ni otras plataformas.
- No se dispone de informacion sobre sesgos, alucinacion semantica ni limitaciones de contexto en la informacion proporcionada.
- Idiomas de prompt limitados a en, de, es, fr, ja, ko, zh, it, pt; no se documenta calidad por idioma.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/LTX-2.5-22B-Distilled-DiT-6bit
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Variante Mixed Calibrated: https://huggingface.co/mlx-community/LTX-2.5-22B-Distilled-DiT-MXFP4-6bit-8bit-Calibrated
- Pack MLX de referencia: https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
- Paper referenciado: arxiv:2601.03233
