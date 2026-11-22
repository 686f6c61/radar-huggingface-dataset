# mlx-community/LTX-2.5-Distilled-MLX-Q6

## Resumen

LTX-2.5-Distilled-MLX-Q6 es una cuantización de 6 bits del transformer DiT (Diffusion Transformer) destilado de 22B parámetros de Lightricks/LTX-2.5, preparada por la comunidad mlx-community para ejecución nativa en Apple Silicon mediante el framework MLX. El modelo base LTX-2.5 es un generador de vídeo con audio sincronizado a partir de texto, y esta variante reduce el checkpoint del DiT a 15,96 GB (frente a los 20,59 GB de la versión Q8) manteniendo una paridad visual y sonora muy alta respecto a BF16.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación de vídeo-audio de 22B en hardware de consumo Apple (un M5 Pro con 64 GiB de RAM unificada completa clips de 97 frames a 768x512 en torno a 75 segundos de media por clip en el benchmark del autor). Es, por tanto, una pieza clave para quienes quieren experimentar con generación de vídeo local sin depender de GPUs de datacenter.

El modelo se distribuye como un fichero DiT "drop-in" (`transformer-distilled.safetensors`) que debe combinarse con el VAE, vocoder, upscalers, connector y el codificador de texto Gemma de un pack MLX de LTX-2.5. La licencia es la LTX-2.x Community License, con las condiciones adicionales de los términos de uso de Gemma cuando se usa ese codificador de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) destilado, 22B parámetros en el transformer |
| Parámetros totales | 22B (transformer destilado); el repo completo pesa 16,0 GB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6-bit affine (`bits=6, group_size=64`); existe variante Mixed Calibrated (MXFP4 + Q6 + Q8, 13,20 GB) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License (license_name: `ltx-2.x-community-license`) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) destilado de 22B parámetros. La cuantización afecta a las 1.632 capas lineales 2D `.weight` dentro de `transformer_blocks`, todas ellas cuantizadas a `bits=6, group_size=64, mode="affine"` sin excepciones de empaquetado. Se mantienen en BF16 los embeddings de frontera, las normas, las modulaciones AdaLN/timestep y las proyecciones de salida. El resultado son 7.355 tensores y 15,958 GB, con un mapa por tensor disponible en `quantization_policy.json`.

El modelo base es la variante destilada de LTX-2.5 de Lightricks, orientada a generación conjunta de vídeo y audio a partir de texto. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. La destilación reduce el número de pasos de denoising necesarios, lo que se refleja en los tiempos de inferencia reportados (en torno a 5,5 s por paso en M5 Pro).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable (768x512, 1280x704, 1152x768 en los ejemplos del autor).
- Generación de audio sincronizado con el vídeo (audio-video), con control mediante negative prompt y NAG (negative-aware guidance) para suprimir música de fondo no deseada.
- Control de duración mediante número de frames y frame rate (97 frames a 24 fps en los ejemplos).
- Decodificación de vídeo con dos modos: decoder estándar y `--video-decoder diffusion`, que mejora la nitidez de piel y tejidos a mayor coste de decodificación.
- Generación por tiles para resoluciones altas (2 tiles para 1280x704x97, 3 tiles para 1152x768x121).
- Reproducibilidad por semilla: el autor reporta paridad frame a frame con Q8 en rostros, manos, iluminación y geometría de fondo.
- Ejecución en Apple Silicon con MLX, incluyendo modo `--low-ram` para gestión de memoria.
- No se dispone de información sobre tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Generación de vídeo local en Apple Silicon: un desarrollador con un Mac de 64 GiB de RAM unificada puede generar clips de 97 frames a 768x512 en torno a 75 segundos de media, sin GPU dedicada ni servicios en la nube, usando el comando `ltx-2-mlx generate` documentado por el autor.
- Prototipado rápido de storyboards con audio: la generación conjunta de vídeo y audio permite producir clips con tono de sala natural y voz, útiles para previsualizar escenas antes de una producción real.
- Creación de contenido para redes con control de estilo: el uso de negative prompt y NAG permite suprimir música de fondo no deseada y controlar la estética (por ejemplo, evitar piel plástica o suavizada) sin reentrenar.
- Investigación en cuantización de modelos generativos: el repo incluye tablas de paridad (coseno y RMSE de vídeo y audio) frente a Q8, MXFP8, MXFP4 y Q4, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantización en modelos DiT de vídeo.
- Evaluación de despliegue en hardware de consumo: los benchmarks end-to-end con 48 clips (6 escenarios x 2 semillas) y métricas de swap permiten dimensionar memorias y latencias reales antes de invertir en infraestructura.
- Integración en pipelines de postproducción: al ser un fichero DiT drop-in, se puede sustituir el transformer de un pack LTX-2.5 MLX existente para reducir el uso de disco y memoria sin cambiar el resto del pipeline (VAE, vocoder, upscalers, Gemma).
- Generación de material audiovisual para demos y pruebas de accesibilidad: clips cortos con audio permiten validar reproductores, subtitulado automático o pipelines de transcripción sin coste de API.

## Benchmarks y rendimiento

Paridad de una sola pasada del DiT frente a BF16 (medido en Apple M5 Pro, 64 GiB, macOS 27.2.1, Python 3.13.18, mlx 0.32.2):

| Variante | Tamaño DiT | Cos vídeo | RMSE vídeo | Cos audio | RMSE audio |
|---|---:|---:|---:|---:|---:|
| Q8 (affine g64) | 20,59 GB | 0,999805 | 0,02390 | 0,999681 | 0,01574 |
| MXFP8 (g32) | 20,02 GB | 0,992870 | 0,14793 | 0,994663 | 0,06530 |
| Mixed Calibrated | 13,20 GB | 0,987724 | 0,21676 | 0,989421 | 0,09092 |
| Q6 (este repo) | 15,96 GB | 0,986826 | 0,20015 | 0,996734 | 0,05065 |
| MXFP4 (g32) | 10,74 GB | 0,984554 | 0,21650 | 0,970633 | 0,15176 |
| Q4 (affine g64) | 11,32 GB | 0,816431 | 0,71769 | 0,968157 | 0,15504 |

Benchmark end-to-end de 48 clips (6 escenarios x 2 semillas, 12 clips por variante):

| Variante | Tiempo medio | Denoise medio | s/paso | Pico MLX | Delta swap máx. | Clips mudos |
|---|---:|---:|---:|---:|---:|---:|
| Mixed Calibrated | 70,28 s | 57,38 s | 5,216 s | 29,45 GB | 0,0 MB | 0 |
| Q8 | 74,19 s | 60,88 s | 5,535 s | 29,45 GB | 0,0 MB | 0 |
| Q6 (este repo) | 74,69 s | 61,12 s | 5,557 s | 29,45 GB | 0,0 MB | 0 |
| Q4 | 75,17 s | 61,32 s | 5,575 s | 29,45 GB | 0,0 MB | 0 |

Tiempos adicionales reportados por el autor con `--video-decoder diffusion`: 768x512x97 en 162,5 s sin tiles; 1280x704x97 en 416,1 s con 2 tiles; 1152x768x121 en 551,6 s con 3 tiles, todos con 0,0 MB de swap.

## Requisitos de hardware

- RAM unificada: el benchmark del autor se ejecutó en un Apple M5 Pro con 64 GiB de RAM unificada, con un pico de MLX de 29,45 GB y 0,0 MB de swap. Se recomienda al menos 64 GiB para resoluciones de 768x512x97 con decodificación por difusión.
- GPU: Apple Silicon (M-series) con soporte MLX. No se dispone de datos para GPUs NVIDIA/AMD en esta variante, ya que el formato es MLX.
- Cabe en hardware de consumo: sí, en Macs con 64 GiB de memoria unificada según el autor; no se dispone de datos para configuraciones de 32 GiB.
- Despliegue: `ltx-2-mlx` con soporte nativo de 6 bits y cuantización por capa; requiere el resto de componentes (VAE, vocoder, upscalers, connector, Gemma) de un pack LTX-2.5 MLX, por ejemplo `dgrauet/ltx-2.5-mlx-q8`.
- Latencia y throughput: ~5,5 s por paso de denoising, ~74,7 s de media por clip de 97 frames en el benchmark de 48 clips; 162,5 s para 768x512x97 con decoder diffusion sin tiles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Distilled-MLX-Q6 (este) | 22B (DiT) | no disponible | safetensors MLX | LTX-2.x Community | Hugging Face |
| LTX-2.5-Distilled-MLX-Mixed-Calibrated | 22B (DiT) | no disponible | safetensors MLX | LTX-2.x Community | Hugging Face |
| LTX-2.5 (base) | 22B (DiT) | no disponible | safetensors BF16 | LTX-2.x Community | Hugging Face |
| Q8 affine g64 (mismo pack) | 22B (DiT) | no disponible | safetensors MLX | LTX-2.x Community | Hugging Face |

No se dispone en la información proporcionada de comparativas con otros modelos de generación de vídeo-audio de la competencia (por ejemplo, familia Wan, HunyuanVideo o similares), por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantización Q4 uniforme affine muestra una deriva visible en las mismas semillas (cos vídeo 0,816 frente a 0,986 en Q6); no se recomienda Q4 si se necesita paridad con Q8.
- El modelo es un fichero DiT aislado: no funciona por sí solo, requiere VAE, vocoder, upscalers, connector y codificador de texto Gemma de un pack LTX-2.5 MLX compatible.
- Requiere `ltx-2-mlx` con soporte nativo de 6 bits y cuantización por capa; versiones anteriores pueden no cargarlo.
- La licencia LTX-2.x Community impone condiciones de uso que deben revisarse antes de uso comercial; además, el codificador Gemma añade sus propios Términos de Uso y Política de Uso Prohibido.
- No se dispone de información sobre sesgos, tasas de alucinación visual o limitaciones idiomáticas del modelo base.
- El rendimiento medido corresponde a un único hardware (M5 Pro 64 GiB); en configuraciones con menos memoria unificada puede requerir swap o fallar.
- El uso de `--video-decoder diffusion` mejora la nitidez pero incrementa notablemente el tiempo de decodificación (hasta 551,6 s en 1152x768x121 con 3 tiles).
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench, etc.) en la información disponible; las métricas reportadas son de paridad de cuantización y tiempos de ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/LTX-2.5-Distilled-MLX-Q6
- Variante Mixed Calibrated: https://huggingface.co/mlx-community/LTX-2.5-Distilled-MLX-Mixed-Calibrated
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Pack MLX de referencia con componentes no-DiT: https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
