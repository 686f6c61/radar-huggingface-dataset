# SarthakRawool/LongCat-Video-Avatar-1.6-MLX-8bit-LowMem

## Resumen

LongCat-Video-Avatar 1.6 MLX 8-bit LowMem es una compilación cuantizada a 8 bits del modelo de generación de vídeo con avatar parlante de Meituan, adaptada para ejecutarse en Apple Silicon mediante el framework MLX. El modelo original genera vídeo de tipo talking-head (cabeza parlante) a partir de un retrato estático y una pista de audio, sincronizando el movimiento de labios con la voz. Esta versión, publicada por el usuario SarthakRawool, aplica cuantización de 8 bits únicamente a las capas lineales del diffusion transformer (DiT) y añade una serie de optimizaciones de memoria y velocidad sobre el port MLX de referencia.

El paquete ocupa aproximadamente 37,5 GB en disco, frente a los 51 GB de la versión MLX en bf16, y permite generar vídeo de resolución 704x1312 (clase 720p) con un pico de memoria MLX de 36,3 GB, lo que lo hace viable en un Mac de 64 GB de RAM unificada. Las optimizaciones incluidas (atención SDPA fusionada por cabeza, intercambio de LoRAs de destilación y precarga del codificador de texto) reducen el tiempo por clip en un 25,8 % manteniendo los fotogramas de salida bit a bit idénticos.

La relevancia de esta ficha radica en que democratiza la ejecución local de un modelo de generación de vídeo con avatar en hardware de consumo Apple, un escenario tradicionalmente reservado a GPUs de datacenter. No es un modelo nuevo, sino una distribución cuantizada y optimizada del modelo base de Meituan, con licencia MIT y librería MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con atención SDPA, text encoder umT5 y audio encoder Whisper; VAE de Wan |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera segmentos de 93 fotogramas con solapamiento de 13) |
| Tipos de cuantizacion | 8 bits en capas lineales del DiT (grupo de 64, 532 capas lineales); resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con LoRAs en bf16 y VAE/text/audio encoders sin cuantizar |

## Arquitectura y entrenamiento

El modelo base es un sistema de generación de vídeo audio-driven compuesto por varios módulos: un diffusion transformer (DiT) que constituye el núcleo generativo, un codificador de texto umT5, un codificador de audio Whisper, un VAE de Wan para la decodificación de latentes a píxeles y dos LoRAs de destilación (DMD y OPSD) que permiten reducir el número de pasos de inferencia. En esta compilación solo se cuantizan las capas lineales del DiT (19,6 GB en 8 bits), mientras que adaLN, los embedders de timestep y texto y la capa final permanecen en bf16. El resto de componentes (text encoder de 11,4 GB, audio encoder de 1,3 GB, VAE de 254 MB) son idénticos byte a byte a la versión MLX en bf16.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Las innovaciones técnicas documentadas en esta distribución son de optimización de inferencia, no de entrenamiento: atención SDPA fusionada por cabeza (reduce el tiempo por bloque de 2,99 s a 2,10 s), intercambio dinámico de LoRAs de destilación (ahorra 2,5 GB residentes), precarga del codificador umT5 para evitar timeouts de Metal con discos lentos, y un modo opcional de bajo consumo (`LC_BLOCK_SPLIT=1`) que divide cada bloque DiT en tres etapas compiladas con evaluación intermedia, reduciendo la memoria de trabajo de 14,8 GB a 12,8 GB a costa de un 2,3 % de velocidad.

## Capacidades

- Generación de vídeo de avatar parlante (talking-head) a partir de una imagen de retrato y una pista de audio.
- Sincronización labial (lip-sync) audio-driven con movimiento natural de cabeza.
- Generación de vídeo de resolución 704x1312 (clase 720p) en orientación retrato.
- Generación de clips de 93 fotogramas (3,72 s a 25 fps) con continuación por segmentos solapados de 13 fotogramas para audio más largo.
- Decodificación VAE por tiles (fp32) para gestionar memoria en resoluciones altas.
- Modo de decodificación VAE en bf16 opcional (más rápido y con menos memoria, no bit-idéntico).
- Inferencia en Apple Silicon mediante MLX (Metal).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo explícito.

## Casos de uso

- Creación de avatares virtuales para vídeo corporativo: a partir de un retrato del ponente y una locución grabada, el modelo genera un vídeo de presentación con sincronización labial, adecuado para formación interna o comunicación asíncrona sin necesidad de regrabar.
- Doblaje y localización de contenido: se puede sustituir la pista de audio de un vídeo existente por una versión en otro idioma y regenerar el movimiento labial sobre el retrato original, manteniendo la coherencia visual.
- Prototipado rápido de personajes para animación: estudios pequeños pueden generar pruebas de diálogo animado con un solo retrato y un archivo de voz antes de invertir en pipelines 3D completos.
- Contenido para redes sociales y marketing: generación local en un Mac de 64 GB de clips cortos de 3,72 s con voz pregrabada, sin depender de servicios en la nube ni enviar datos biométricos a terceros.
- Investigación en generación de vídeo audio-driven: la distribución incluye el código del port MLX con parches documentados (`code/CHANGES.md`, `code/longcat-8bit-lowmem.patch`), lo que facilita reproducir experimentos y comparar variantes de cuantización.
- Asistentes virtuales embebidos en aplicaciones de escritorio macOS: al ejecutarse sobre MLX en Apple Silicon, permite integrar avatares reactivos en herramientas locales sin conexión a internet, útil en entornos con requisitos de privacidad.
- Docencia y accesibilidad: generación de vídeos explicativos con un retrato del instructor y narración sintetizada, útil para producir material formativo de forma repetible y a bajo coste.

## Benchmarks y rendimiento

Los datos publicados corresponden a mediciones de rendimiento de inferencia en un Apple M5 Max con 128 GB de RAM, resolución 704x1312, 93 fotogramas, 8 pasos, semilla 42, `--vae-tile 64` y límite de memoria MLX de 56 GB.

| Metrica | Port sin modificar (8 bits) | Esta release (por defecto) |
|---|---|---|
| Tiempo por paso DiT | 209,7 s | 164,0 s |
| Tiempo total por clip | 2038 s | 1513 s (-25,8 %) |
| Memoria pico MLX | no disponible | 36,3 GB |
| Memoria en decodificacion VAE | no disponible | 34,8 GB |
| Huella del proceso | no disponible | 38,0 GB |
| Pico del sistema completo | no disponible | 40,3 GB |
| Salida | referencia | 93/93 fotogramas idénticos, diferencia máxima de píxel 0 |

Desglose del tiempo por bloque DiT (8 bits, eager, antes de las optimizaciones): self-attention SDPA 65 %, FFN 12 %, q/k norm + RoPE 6 %, qkv linear 6 %, cross-attention de texto y audio 8,5 %, resto 2,5 %.

No se han publicado resultados de benchmarks de calidad (FID, FVD, métricas de lip-sync) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: pico MLX de 36,3 GB durante el paso DiT y 34,8 GB en la decodificación VAE; huella del proceso de 38,0 GB. Se recomienda un Mac con 64 GB de memoria unificada como mínimo, cerrando otras aplicaciones grandes.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada amplia; las mediciones se realizaron en un Apple M5 Max de 128 GB. No se documentan requisitos para GPUs NVIDIA o AMD, ya que el paquete usa MLX.
- Cabe en GPU de consumo: sí, en Apple Silicon con 64 GB o más de memoria unificada. No está pensado para GPUs de consumo con VRAM discreta.
- Opciones de despliegue: MLX mediante el script incluido `scripts/generate.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son frameworks para LLMs, no para este modelo de difusión).
- Latencia y throughput: 1513 s por clip de 3,72 s (8 pasos, 93 fotogramas) en M5 Max con las optimizaciones por defecto; 164 s por paso DiT. El modo `LC_BLOCK_SPLIT=1` reduce la memoria de trabajo a 12,8 GB con un 2,3 % más de tiempo; `LC_BLOCK_SPLIT=1 LC_FFN_CHUNKS=4` la reduce a 12,1 GB con un 2 % adicional. La decodificación VAE en bf16 (`--vae-bf16`) tarda 96 s en lugar de 172 s y usa 7,1 GB en lugar de 13,8 GB, con 46,6 dB de PSNR medio respecto a la decodificación fp32.
- Almacenamiento: aproximadamente 37,5 GB en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LongCat-Video-Avatar 1.6 MLX 8-bit LowMem (esta ficha) | no disponible | 93 fotogramas por segmento, continuación con solapamiento de 13 | MIT | Hugging Face, MLX | Cuantizado 8 bits, 37,5 GB, optimizado para Apple Silicon |
| LongCat-Video-Avatar 1.6 (bf16 MLX) | no disponible | 93 fotogramas por segmento | MIT | Hugging Face, MLX | 51 GB en disco, sin las optimizaciones de memoria y velocidad |
| LongCat-Video-Avatar 1.6 (original de Meituan) | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face | Modelo base sin cuantizar; framework de referencia distinto de MLX |
| Otros modelos de talking-head audio-driven | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo se ejecuta en Apple Silicon mediante MLX; no es portable a GPUs NVIDIA, AMD ni a CPU genérica sin reescribir el pipeline.
- Requiere al menos 64 GB de memoria unificada para la resolución 704x1312 con la configuración medida; en Macs de 48 GB o menos puede no caber sin recurrir a los modos de bajo consumo opcionales, que aún no se han medido en ese escenario.
- La cuantización a 8 bits se aplica solo a las capas lineales del DiT; el resto de componentes permanece en bf16, por lo que el ahorro de memoria es parcial (37,5 GB frente a 51 GB).
- El modo `--vae-bf16` no es bit-idéntico: presenta 46,6 dB de PSNR medio y 44,5 dB en el peor fotograma respecto a la decodificación fp32, con posibles diferencias visuales sutiles.
- `LC_T5_CPU=1` puede alterar los últimos bits del embedding del prompt.
- No se dispone de información sobre sesgos, tasas de alucinación ni calidad de sincronización labial medida objetivamente.
- No se documentan los idiomas soportados por el codificador de texto ni por el audio encoder en esta distribución.
- El modelo puede reproducir sesgos del dataset de entrenamiento original (no documentado) y presenta riesgos propios de la generación de vídeo con rostros humanos: suplantación de identidad, deepfakes y uso no consentido de imágenes de personas.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las obligaciones asociadas al modelo base de Meituan y a los componentes de terceros (umT5, Whisper, VAE de Wan).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026; se trata de una distribución reciente y sin validación comunitaria amplia.
- El rendimiento medido corresponde a un único hardware (M5 Max, 128 GB); en otros chips Apple los tiempos y la memoria pueden variar significativamente.

## Enlaces

- Hugging Face: https://huggingface.co/SarthakRawool/LongCat-Video-Avatar-1.6-MLX-8bit-LowMem
- Modelo base: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Port MLX de referencia: https://github.com/fedeinfe/longcat-avatar-mlx
