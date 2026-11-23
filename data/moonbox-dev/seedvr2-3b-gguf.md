# moonbox-dev/SeedVR2-3B-GGUF

## Resumen

SeedVR2-3B-GGUF es una conversión a formato GGUF del modelo SeedVR2-3B desarrollado por ByteDance-Seed, publicada por moonbox-dev para su uso en dispositivo mediante stable-diffusion.cpp. SeedVR2 es un modelo de restauración y superresolución de vídeo en un solo paso basado en difusión, que emplea una arquitectura NaDiT (diffusion transformer) entrenada mediante post-entrenamiento adversario. El paquete GGUF contiene únicamente los pesos del transformer de difusión, no el pipeline completo.

La relevancia de esta conversión reside en que permite ejecutar la restauración de vídeo en hardware de consumo mediante cuantización, algo imposible con los pesos BF16 originales de 6,78 GB en F16. La model card proporciona mediciones de PSNR frente a la referencia F16 para cada precisión, lo que permite elegir el compromiso entre tamaño y calidad de forma informada.

El modelo base tiene 3.392.101.088 parámetros y se distribuye bajo licencia Apache-2.0. No hay información sobre idiomas soportados ni sobre el contexto de texto, ya que no es un modelo de lenguaje sino un restaurador de vídeo. El repositorio ocupa 17,5 GB e incluye cinco precisiones distintas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NaDiT (diffusion transformer de un solo paso) para restauración de vídeo |
| Parámetros totales | 3.392.101.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K (experimental), Q4_K (experimental) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Pipeline | image-to-video (video upscaling) |
| Librería | stable-diffusion.cpp |

## Arquitectura y entrenamiento

El modelo base SeedVR2-3B es un diffusion transformer denominado NaDiT que realiza restauración de vídeo en un solo paso, según el paper "SeedVR2: One-Step Video Restoration via Diffusion Adversarial Post-Training" (arXiv:2506.05301). El entrenamiento emplea post-entrenamiento adversario para lograr la restauración en una única iteración, en lugar de los múltiples pasos habituales en modelos de difusión. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La conversión GGUF parte del repack fp16 de Comfy-Org del fichero `seedvr2_ema_3b.pth` de ByteDance-Seed, con los nombres de tensor que carga stable-diffusion.cpp. Se generó con el conversor propio de stable-diffusion.cpp (`sd-cli -M convert --type`, master-532d2c1). Las cuantizaciones Q8_0, Q6_K, Q5_K y Q4_K aplican un único tipo a todas las matrices de pesos, ya que las mezclas _M de llama-quantize no existen para esta arquitectura. Cada fichero fue verificado contra el original antes de la subida mediante sha256.

## Capacidades

- Restauración de vídeo en un solo paso mediante difusión adversaria.
- Superresolución de vídeo con factor de escala configurable (por ejemplo, `--upscale-factor 2`).
- Procesamiento por fragmentos temporales (`--vsr-temporal-chunk-size`) para gestionar la memoria.
- Entrada de frames de vídeo de baja resolución y salida de vídeo restaurado (por ejemplo, AVI).
- Control de semilla para reproducibilidad (`-s 42`).
- Ejecución en dispositivo mediante stable-diffusion.cpp con backend CUDA.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo exclusivamente de visión/vídeo.

## Casos de uso

- Restauración de metraje antiguo o de baja calidad: el modelo puede tomar frames de baja resolución y devolver vídeo restaurado con un factor de escala de 2, adecuado para digitalizar archivos históricos.
- Superresolución de vídeo para producción de contenido: se integra en pipelines que necesitan aumentar la resolución de clips sin recurrir a interpolación clásica, usando `sd-cli -M vid_upscale` con el VAE de Comfy-Org.
- Restauración en hardware de consumo: las cuantizaciones Q8_0 (3,62 GB) y Q6_K (2,80 GB) permiten ejecutar el modelo en GPU con VRAM limitada, algo inviable con los 6,78 GB de F16.
- Procesamiento por lotes de frames con control de fragmentos temporales: el parámetro `--vsr-temporal-chunk-size 5` permite ajustar el uso de memoria según el hardware disponible en servidores de renderizado.
- Reproducción de resultados de investigación: al incluir PSNR medido frente a F16 y sha256 verificables, sirve para replicar experimentos de restauración de vídeo con precisión controlada.
- Prototipado en local antes de desplegar en infraestructura mayor: el formato GGUF y stable-diffusion.cpp permiten probar el pipeline completo en una estación de trabajo antes de escalar.

## Benchmarks y rendimiento

La model card proporciona PSNR de cada cuantización frente a la salida del fichero F16, medido sobre dos clips de 17 frames (384x384 y 512x288), con factor de escala 1, semilla 666, fragmentos temporales de 5 y stable-diffusion.cpp sobre CUDA en una RTX 3080 Laptop. El criterio de aprobación es al menos 30 dB en cada frame.

| Precisión | Tamaño | PSNR medio vs F16 (ejemplo0 / ejemplo1) | Peor frame | Estado |
|---|---|---|---|---|
| F16 | 6,78 GB | referencia (24,9 / 21,4 dB frente a frames del repo original) | no disponible | referencia |
| Q8_0 | 3,62 GB | 43,3 / 40,3 dB | 41,2 / 39,6 dB | aprobado |
| Q6_K | 2,80 GB | 37,9 / 34,5 dB | 36,3 / 33,5 dB | aprobado |
| Q5_K | 2,35 GB | 33,4 / 29,8 dB | 32,1 / 28,8 dB | experimental (bajo el umbral de 30 dB) |
| Q4_K | 1,93 GB | 28,8 / 25,5 dB | 27,9 / 24,7 dB | experimental (bajo el umbral de 30 dB) |

Nota: todos los ficheros, incluido F16, están a unos 24,8 / 21,4 dB de los frames del script del repositorio original; la causa no es la cuantización, sino que stable-diffusion.cpp conserva los colores de la entrada (el script original sin su corrección de color no lo hace) y genera su propio ruido. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de fichero orientativo es 6,78 GB (F16), 3,62 GB (Q8_0), 2,80 GB (Q6_K), 2,35 GB (Q5_K) y 1,93 GB (Q4_K), a los que hay que sumar el VAE y los buffers de activación.
- GPU recomendadas: no disponibles en la información; el benchmark se ejecutó en una RTX 3080 Laptop.
- ¿Cabe en GPU de consumo? Sí, al menos las cuantizaciones Q8_0, Q6_K, Q5_K y Q4_K, según el tamaño de fichero; F16 requiere más VRAM.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli -M vid_upscale`) con backend CUDA; requiere el VAE `vae/seedvr2_ema_vae_fp16.safetensors` de Comfy-Org/SeedVR2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos de restauración de vídeo comparables. La model card no incluye comparativas con otros modelos. Por tanto, la comparativa se limita a las precisiones del propio paquete:

| Modelo / variante | Parámetros | Contexto | PSNR vs F16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeedVR2-3B-GGUF F16 | 3,39 B | no aplica | referencia | Apache-2.0 | Hugging Face (moonbox-dev) |
| SeedVR2-3B-GGUF Q8_0 | 3,39 B | no aplica | 43,3 / 40,3 dB | Apache-2.0 | Hugging Face (moonbox-dev) |
| SeedVR2-3B-GGUF Q6_K | 3,39 B | no aplica | 37,9 / 34,5 dB | Apache-2.0 | Hugging Face (moonbox-dev) |
| SeedVR2-3B (original BF16) | 3,39 B | no aplica | no disponible | Apache-2.0 | Hugging Face (ByteDance-Seed) |

## Limitaciones y advertencias

- Las cuantizaciones Q5_K y Q4_K están marcadas como experimentales: no alcanzan el umbral de 30 dB de PSNR en todos los frames frente a F16.
- El paquete GGUF contiene solo los pesos del transformer de difusión; es necesario obtener el VAE y demás componentes del pipeline desde Comfy-Org/SeedVR2.
- Las diferencias de color y ruido frente al script del repositorio original (24,8 / 21,4 dB) no se deben a la cuantización, sino al comportamiento de stable-diffusion.cpp; hay que tenerlo en cuenta al comparar salidas.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- No se dispone de información sobre sesgos, riesgo de alucinación visual ni limitaciones idiomáticas específicas.
- Licencia Apache-2.0: permite uso comercial, pero los ficheros son derivados del modelo original y su licencia gobierna el uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente (creada el 2026-11-22) sin validación comunitaria amplia.
- El rendimiento medido se obtuvo en una RTX 3080 Laptop; el comportamiento en otras GPU puede variar y no se documenta latencia ni throughput.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/SeedVR2-3B-GGUF
- Modelo base: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/SeedVR2
- Paper: http://arxiv.org/abs/2506.05301
- Web del proyecto: https://iceclear.github.io/projects/seedvr2/
- Repositorio de código: https://github.com/ByteDance-Seed/SeedVR
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
