# hungbenjamin402/mel-band-roformer-vocal-sep

## Resumen

Kim Mel-Band RoFormer — Vocal Separation (CoreAI + CoreML) es una reimplementación del modelo Mel-Band RoFormer de Kim para separación de voces, reescrita específicamente para ejecutarse en la Neural Engine de Apple y exportada como pipelines de 14 etapas en dos formatos: CoreAI (`.aimodel`, iOS 27+ / macOS 28+) y CoreML (`.mlmodelc`, iOS 18+ / macOS 15+). El modelo toma audio estéreo y produce una máscara vocal a través de 60 bandas mel distribuidas sobre 1025 bins de frecuencia. Lo publica el usuario `hungbenjamin402` y deriva del checkpoint Kim Vocal 2 (`model_bs_roformer_ep_937_sdr_10.5309.ckpt`), entrenado sobre MUSDB18-HQ más datos internos.

El problema que resuelve es la separación de la pista vocal del resto de una mezcla musical, una tarea clásica de source separation con aplicaciones en karaoke, remezcla, transcripción y postproducción. Su relevancia radica en que traslada un modelo de investigación (paper arXiv 2310.01809) a un formato desplegable en hardware Apple consumer, con optimizaciones concretas para la Neural Engine: compresión de pesos por paletización de 8 bits en grupos de 32, layout channels-first y sustitución de operaciones no soportadas (SDPA fusionada, GELU literal) por equivalentes compatibles.

La arquitectura subyacente es un transformer RoFormer con atención sobre el eje temporal y el eje frecuencial, procesado en bandas mel. El repositorio ocupa 0,5 GB, aunque los artefactos exportados suman 267 MB (CoreAI) y 277 MB (CoreML). No se dispone de información sobre licencia del repositorio ni sobre idiomas soportados en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer RoFormer con atención en eje temporal y frecuencial, procesado en 60 bandas mel |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; chunk estático de 8 s a 44,1 kHz (352.800 muestras, 801 frames STFT, FFT 2048, hop 441) |
| Tipos de cuantizacion | fp16 con pesos paletizados a 8 bits en grupos de 32 (`pal8g32`) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | pesos derivados del checkpoint Kim Vocal 2 (MIT); licencia del repositorio no indicada en HuggingFace |
| Formato de pesos | CoreAI `.aimodel` (14 etapas) y CoreML `.mlmodelc` (14 etapas); tablas de bandas en `bands.bin` |

## Arquitectura y entrenamiento

El modelo es un Mel-Band RoFormer dividido en 14 etapas secuenciales para facilitar la compilación en la Neural Engine: una etapa `band_split` que proyecta 1025 bins FFT a 60 bandas mel, seis bloques transformer en el eje temporal (`time0`–`time5`), seis en el eje frecuencial (`freq0`–`freq5`) y una etapa final `mask` que estima la máscara vocal compleja. La forma de entrada es `(1, C, 60, 801)`, donde C es la suma por banda de frecuencias × 2 canales × 2 (parte real e imaginaria). La separación en etapas responde a que un grafo monolítico supera los 15 minutos de compilación, mientras que cada etapa compila en unos 67 segundos y se ejecutan en procesos de compilación paralelos.

Las optimizaciones para ANE incluyen layout channels-first con el eje temporal al final, proyecciones como Conv2d 1×1 sobre la rejilla completa (compartidas entre atención temporal y frecuencial), atención por cabeza con matmul y softmax simples (sin SDPA fusionada), RoPE mediante tablas constantes de coseno y seno con permutación contigua en las filas de proyección q/k, RMSNorm escalada por el pico antes de elevar al cuadrado para evitar desbordamiento fp16 (suma de cuadrados medida en 152k frente al máximo fp16 de 65504) y subdesbordamiento (RMS de 1,5e-4 en bandas silenciosas), y GELU aproximada como `x * sigmoid(1.702x)`. Los pesos Conv2d se paletizan a 8 bits en grupos de 32 canales de salida antes de `torch.export`, siguiendo la guía de `apple/coreai-models`. No se detalla en la información disponible el volumen de datos de entrenamiento ni si hubo RLHF o DPO; el checkpoint original procede de MUSDB18-HQ más datos internos de Kim Vocal.

## Capacidades

- Separación de fuente vocal en audio musical estéreo: entrada de audio, salida de máscara vocal.
- Procesamiento en bandas mel (60 bandas) sobre 1025 bins de frecuencia con resolución STFT de 2048 y hop 441.
- Funcionamiento en chunks estáticos de 8 segundos a 44,1 kHz, adecuado para procesamiento por ventanas.
- Ejecución en Neural Engine de Apple mediante pipelines de 14 etapas en CoreAI y CoreML.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio de entrada más allá del propio audio musical.

## Casos de uso

- Karaoke y pistas de acompañamiento: el modelo genera la máscara vocal de una mezcla estéreo, que puede aplicarse para atenuar o eliminar la voz y conservar el instrumental, procesando la canción en ventanas de 8 segundos.
- Remezcla y producción musical: extraer la pista vocal para reutilizarla en remixes o mashups, aprovechando la separación por bandas mel para preservar detalle espectral en la voz.
- Postproducción de vídeo y doblaje: aislar diálogos cantados o voces sobre música de fondo antes de sustituir la pista o aplicar limpieza de ruido.
- Transcripción y análisis musical: preprocesar audio para alimentar sistemas de reconocimiento de letras o análisis de contenido vocal, reduciendo la interferencia instrumental.
- Aplicaciones móviles en iOS/macOS: integrar el pipeline CoreML (`.mlmodelc`, iOS 18+) en apps de edición de audio que ejecutan la separación en el dispositivo sin conexión.
- Procesamiento en el dispositivo con privacidad: al ejecutarse en la Neural Engine local, el audio no sale del dispositivo, lo que resulta adecuado para grabaciones personales o material sensible.
- Investigación en source separation: usar los artefactos exportados como referencia para estudiar el comportamiento de RoFormer bajo restricciones de hardware Apple y comparar con implementaciones PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita el SDR del checkpoint original en el nombre del fichero (`sdr_10.5309`), pero no se aportan métricas del pipeline exportado ni comparaciones medidas.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU dedicada; el modelo está diseñado para la Neural Engine de Apple. Tamaño de artefactos: 267 MB (CoreAI) y 277 MB (CoreML), más 20 KB de tablas de bandas.
- GPU recomendadas: no aplica; el destino es Apple Silicon (Neural Engine). No se indica compatibilidad con A100, H100 o RTX 4090.
- Cabe en hardware consumer Apple: sí, siempre que el dispositivo soporte iOS 27+/macOS 28+ (CoreAI) o iOS 18+/macOS 15+ (CoreML).
- Opciones de despliegue: Core AI Tools (`.aimodel`) y Core ML Tools (`.mlmodelc`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Solo se documenta el tiempo de compilación por etapa (~67 s) y que un grafo monolítico supera los 15 minutos.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / chunk | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kim Mel-Band RoFormer (este repo) | Separación vocal, Mel-Band RoFormer | 8 s a 44,1 kHz | CoreAI / CoreML | Pesos MIT (checkpoint Kim Vocal 2) | HuggingFace |
| Kim Vocal 2 (checkpoint original) | Separación vocal, Mel-Band RoFormer | No disponible | PyTorch (`.ckpt`) | MIT | GitHub (Music-Source-Separation-Training) |
| Demucs (alternativa de referencia) | Separación de fuentes (time-domain) | No disponible | PyTorch | MIT | GitHub / HuggingFace |

La comparación se limita a la familia de modelos de separación de fuentes; no se dispone de datos de rendimiento del pipeline exportado para contrastar SDR con Demucs u otras alternativas.

## Limitaciones y advertencias

- Modelo especializado en separación vocal: no genera texto, código ni realiza razonamiento; no debe evaluarse con benchmarks de LLM.
- Chunk estático de 8 segundos: el procesamiento de audio más largo requiere segmentación y concatenación, con posible artefacto en las fronteras.
- Solo salida de máscara vocal: no se documenta separación de batería, bajo u otros instrumentos.
- Licencia del repositorio no indicada en HuggingFace; los pesos derivan de un checkpoint MIT, pero conviene verificar los términos antes de uso comercial.
- Dependencia estricta de versiones de sistema (iOS 27+/macOS 28+ para CoreAI; iOS 18+/macOS 15+ para CoreML) y del hardware Apple con Neural Engine.
- Sin datos publicados de calidad (SDR, SI-SDR) del pipeline exportado; el rendimiento puede diferir del checkpoint PyTorch original por la paletización a 8 bits y las aproximaciones numéricas (GELU, RMSNorm escalada).
- Riesgo de artefactos en pasajes con voces superpuestas o instrumentos con contenido espectral solapado con la voz.
- Repositorio sin descargas ni likes y con fecha de creación futura en los metadatos, lo que sugiere un estado muy reciente o no validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/hungbenjamin402/mel-band-roformer-vocal-sep
- Paper Mel-Band RoFormer: https://arxiv.org/abs/2310.01809
- Checkpoint fuente Kim Vocal 2 (Music-Source-Separation-Training): https://github.com/ZFTurbo/Music-Source-Separation-Training
- Guía de modelos Core AI de Apple: https://github.com/apple/coreai-models
