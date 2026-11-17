# AIPeanutman/VidDub-SFT

## Resumen
VidDub-SFT es un checkpoint de ajuste fino supervisado (SFT) para doblaje de video con sincronizacion labial, desarrollado por el autor AIPeanutman y publicado bajo el identificador `AIPeanutman/VidDub-SFT`. Se construye sobre el modelo base Wan-AI/Wan2.1-VACE-1.3B, un modelo de difusion de video de la familia Wan, y anade un adaptador de audio propio (VidDub audio adapter) junto con componentes VACE y un DiT afinado. El modelo resuelve el problema de reemplazar el audio de un video por una pista nueva manteniendo la coherencia visual de la boca y la cara del hablante, siguiendo el planteamiento del articulo "VidDub: Replacement-Aware Supervision for Two-Step Video Dubbing" (arXiv:2611.03404).

El checkpoint publicado corresponde al "teacher" de contexto completo con supervision replacement-aware (r2a EMA@200), es decir, la version de referencia usada para destilar posteriormente un estudiante de dos pasos (disponible en `AIPeanutman/VidDub`). El repositorio almacena unicamente los componentes entrenados (DiT en BF16, VACE en BF16 y adaptador de audio en FP32), que suman 2.440.958.285 parametros en total; el "1.3B" de la nomenclatura se refiere solo a la clase del backbone Wan y no al computo completo de inferencia.

La relevancia actual del modelo esta en que ofrece un pipeline abierto de video-to-video orientado a doblaje, con ventana de 81 fotogramas a 24 FPS, audio de entrada a 16 kHz mono y un protocolo de ventanas solapadas (stride 64, 17 fotogramas compartidos) para videos largos. Es un modelo de investigacion y de uso comercial individual con condiciones, no un servicio de streaming en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion video-to-video basada en Wan2.1-VACE-1.3B (DiT + VACE) con adaptador de audio VidDub; modo bidirectional SFT |
| Parametros totales | 2.440.958.285 (componentes entrenados publicados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Ventana de video de 81 fotogramas a 24 FPS; ventanas solapadas con stride 64 y 17 fotogramas compartidos para videos largos |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 para DiT y VACE, FP32 para el adaptador de audio) |
| Idiomas soportados | no disponible |
| Licencia | viddub-individual-commercial-research-1.0 (VidDub Individual Commercial and Research License 1.0) |
| Formato de pesos | safetensors (`dit/diffusion_pytorch_model.safetensors`, `vace/diffusion_pytorch_model.safetensors`, `audio_adapter/model.safetensors`) |

## Arquitectura y entrenamiento
El modelo es un sistema de difusion para traduccion de video (video-to-video) que combina el backbone Wan2.1-VACE-1.3B con un adaptador de audio especifico de VidDub. El repositorio contiene el DiT afinado en BF16, el modulo VACE en BF16 y el adaptador de audio en FP32; el VAE, el tokenizador T5 y el encoder Whisper-small no se duplican en el repo y deben descargarse aparte desde `Wan-AI/Wan2.1-VACE-1.3B` y `openai/whisper-small`. La inferencia usa audio de entrada a 16 kHz mono y video a 24 FPS, con una ventana de 81 fotogramas.

El entrenamiento se enmarca en el articulo "VidDub: Replacement-Aware Supervision for Two-Step Video Dubbing", que propone una supervision consciente del reemplazo de audio y un esquema en dos pasos (teacher y estudiante destilado). Este checkpoint es el teacher de contexto completo con EMA en el paso 200 (r2a). La inferencia por defecto usa 30 pasos de muestreo con audio CFG 1.0; para reproducir el ajuste Teacher-48 del articulo se pueden usar 48 pasos con audio CFG 2.0. Para videos de mas de 81 fotogramas se aplica un protocolo de ventanas solapadas con mezcla lineal de solapes y armonizacion de color en la zona inferior de la cara (correccion Lab).

## Capacidades
- Doblaje de video con sincronizacion labial: sustituye el audio de un video manteniendo la coherencia visual de la boca y la cara del hablante.
- Generacion video-to-video condicionada por audio, con preservacion de la tasa de fotogramas y la resolucion de entrada.
- Procesamiento de videos largos mediante ventanas de 81 fotogramas con stride 64 y 17 fotogramas compartidos, con mezcla lineal de solapes.
- Armonizacion de color de la zona inferior de la cara (correccion Lab) para integrar el resultado en el video original.
- Control de muestreo: numero de pasos de denoising configurable (por defecto 30, opcion 48 para Teacher-48) y audio CFG configurable (1.0 por defecto, 2.0 para Teacher-48).
- Uso de encoder de audio externo Whisper-small para las caracteristicas de la pista de audio objetivo.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento (thinking); no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Doblaje de contenido audiovisual a otros idiomas: se sustituye la pista de audio original por una pista traducida y sintetizada, y el modelo ajusta la boca del hablante al nuevo audio manteniendo el resto de la escena. Es adecuado para videos con un rostro detectable y predominantemente frontal.
- Localizacion de cursos y material formativo: se puede re-doblajar una leccion grabada a otro idioma conservando la expresion facial del instructor, con procesamiento por ventanas para clases de varios minutos.
- Postproduccion de cortometrajes y piezas cortas: para clips de al menos 81 fotogramas, una unica llamada de contexto completo permite regenerar la zona de la boca sin rehacer el resto del plano.
- Investigacion en sincronizacion labial y doblaje: el checkpoint teacher sirve como referencia para comparar con el estudiante destilado de dos pasos y para reproducir los resultados del articulo sobre VidDub-Bench.
- Evaluacion comparativa con benchmarks: el modelo se carga una sola vez para ejecutar todas las condiciones fijas de same-audio y cross-audio de VidDub-Bench mediante `scripts/run_benchmark.py`.
- Creacion de demos y prototipos interactivos: integrable en un flujo con el workbench OpenDub (ASR, traduccion, TTS y composicion) para construir un pipeline completo de traduccion y doblaje, usando la CLI para la parte de lip-sync.
- Generacion de variantes de un mismo video con distintas pistas de audio: util para pruebas A/B de locuciones o para adaptar un anuncio a varios idiomas a partir del mismo material grabado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a VidDub-Bench (dataset `AIPeanutman/VidDub-Bench` con 256 fuentes y condiciones same/cross) y al script `scripts/run_benchmark.py` del repositorio de codigo, pero no incluye cifras numericas de rendimiento en el texto proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 5,5 GB en total y el modelo requiere ademas el VAE, T5 y Whisper-small descargados aparte, lo que incrementa los requisitos.
- GPU recomendadas: no disponibles en la informacion proporcionada; el unico requisito documentado es una GPU NVIDIA con CUDA.
- Compatibilidad con GPU de consumo: no disponible.
- Sistema operativo y software: Linux, Python 3.10+, Git y FFmpeg; instalacion mediante `pip install -r requirements.txt` del repositorio VidDub.
- Opciones de despliegue: CLI oficial `scripts/infer.py` del repositorio LAW1223/VidDub; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que la implementacion es offline/por ventanas, no un servidor de streaming en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VidDub-SFT (este modelo) | 2.440.958.285 (componentes entrenados) | 81 fotogramas a 24 FPS; ventanas solapadas stride 64 | Doblaje video-to-video con lip-sync | viddub-individual-commercial-research-1.0 | Pesos en Hugging Face, codigo en GitHub |
| Wan-AI/Wan2.1-VACE-1.3B | Clase backbone 1.3B | no disponible | Generacion y edicion de video condicionada | no disponible | Pesos en Hugging Face |
| AIPeanutman/VidDub | no disponible | no disponible | Doblaje video-to-video, estudiante destilado de 2 pasos | no disponible | Pesos en Hugging Face |
| OpenDub | no aplica (aplicacion) | no aplica | Workbench de traduccion y doblaje con proveedores de lip-sync | Apache-2.0 | Codigo en GitHub |

La comparacion se limita a los modelos citados en la informacion disponible; no se dispone de datos de benchmarks para contrastar rendimiento entre ellos.

## Limitaciones y advertencias
- El video de entrada debe contener un rostro detectable y predominantemente frontal, con al menos 81 fotogramas.
- Movimientos grandes de cabeza, rostros de perfil, oclusiones, multiples caras y planos de menos de 81 fotogramas quedan fuera del regimen operativo previsto por el autor.
- La implementacion es offline y por ventanas; no es un servidor de streaming en tiempo real persistente.
- La licencia es "viddub-individual-commercial-research-1.0": permite uso comercial individual y de investigacion, pero el acceso de terceros mediante servicio alojado, sitio web, API, bot o despliegue gestionado requiere permiso escrito separado.
- El repositorio solo contiene los componentes entrenados; es necesario descargar por separado el VAE, T5 y Whisper-small, y cumplir sus respectivas licencias.
- Riesgo de alucinacion visual y artefactos en la zona de la boca en condiciones no previstas; el autor no documenta metricas de robustez.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el modelo depende de la pista de audio externa y del encoder Whisper-small, no de un vocabulario linguistico propio.
- OpenDub no redistribuye ni envuelve actualmente el stack de inferencia full-context de VidDub; para este modelo debe usarse la CLI oficial.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AIPeanutman/VidDub-SFT
- Articulo (arXiv): https://arxiv.org/abs/2611.03404
- Pagina del proyecto: https://law1223.github.io/viddub-project-page/
- Codigo: https://github.com/LAW1223/VidDub
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/hugging-apps/viddub-2611
- Aplicacion OpenDub: https://github.com/LAW1223/OpenDub
- Dataset VidDub-Bench: https://huggingface.co/datasets/AIPeanutman/VidDub-Bench
- Modelo base Wan2.1-VACE-1.3B: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Encoder Whisper-small: https://huggingface.co/openai/whisper-small
- Guia de benchmark: https://github.com/LAW1223/VidDub/blob/main/docs/BENCHMARK.md
