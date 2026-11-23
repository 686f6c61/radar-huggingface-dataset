# AIPeanutman/VidDub

## Resumen

VidDub es un modelo de video a video especializado en doblaje automático con sincronización labial (lip-sync). Lo desarrolla AIPeanutman y se construye como un fine-tuning de Wan2.1-VACE-1.3B, el modelo de generación y edición de vídeo de Alibaba. El modelo toma un vídeo fuente y una pista de audio objetivo y genera un vídeo donde la boca del hablante se ajusta al nuevo audio, manteniendo el resto del contenido visual. Resuelve el problema del doblaje de vídeo a otros idiomas o voces sin necesidad de regrabar, algo relevante para localización de contenido, doblaje multilingüe y producción audiovisual automatizada.

Técnicamente se apoya en una arquitectura DiT (Diffusion Transformer) heredada de Wan, con un adaptador de audio propio y un esquema de muestreo de dos pasos basado en DMD (Distribution Matching Distillation). El checkpoint liberado es la variante "full-context" seleccionada del paper, con 2.440.958.285 parámetros totales en los componentes entrenados (el "1.3B" se refiere solo al backbone Wan, no al cómputo completo de inferencia). Usa ventanas de 81 fotogramas a 24 FPS con solapamiento de 17 fotogramas para vídeos largos, y consume audio a 16 kHz mono.

El modelo se publica junto a un ecosistema notable: paper en arXiv, código de entrenamiento e inferencia, dataset de benchmark (VidDub-Bench), nodo para ComfyUI, una aplicación de escritorio web (OpenDub) y un checkpoint profesor (VidDub-SFT). La licencia es propia y restrictiva, lo que condiciona fuertemente su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) derivada de Wan2.1-VACE, con adaptador de audio y muestreo DMD de 2 pasos |
| Parámetros totales | 2.440.958.285 (componentes entrenados: DiT, VACE y adaptador de audio) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 81 fotogramas a 24 FPS (aprox. 3,4 s por ventana); vídeos largos con stride 64 y solapamiento de 17 fotogramas |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (el modelo opera sobre audio, no sobre texto; el idioma depende del audio de entrada) |
| Licencia | viddub-individual-commercial-research-1.0 (licencia propia, "other") |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Wan-AI/Wan2.1-VACE-1.3B |
| Dependencia de audio | openai/whisper-small |
| Frecuencia de vídeo | 24 FPS |
| Frecuencia de audio | 16 kHz mono |
| Pasos de muestreo | 2 (fijos por configuración) |
| CFG de audio en inferencia | 1 (fijo) |
| Tamaño del repo | 5,5 GB |

## Arquitectura y entrenamiento

VidDub se construye sobre Wan2.1-VACE-1.3B, un modelo de difusión con backbone transformer (DiT) para generación y edición de vídeo. Sobre esa base se añaden componentes entrenados específicos: un adaptador de audio que inyecta las características acústicas en el proceso de difusión, y módulos VACE heredados del modelo base. La representación del audio se obtiene con Whisper-small, que actúa como encoder de las características acústicas que guían la generación del movimiento labial. El repositorio incluye solo los componentes entrenados (DiT, VACE y adaptador de audio); el VAE, el tokenizador T5 y el checkpoint de Whisper se descargan por separado.

El entrenamiento sigue el enfoque descrito en el paper "VidDub: Replacement-Aware Supervision for Two-Step Video Dubbing". La innovación central es la supervisión consciente de reemplazo (replacement-aware supervision) combinada con destilación DMD para reducir el muestreo a dos pasos, lo que abarata mucho la inferencia frente a los esquemas de difusión de decenas de pasos. El checkpoint liberado es la variante full-context seleccionada del paper, entrenada con contexto completo de ventana. Para vídeos largos se usa un protocolo de ventanas deslizantes de 81 fotogramas con stride 64 y 17 fotogramas compartidos, cada ventana con su propia semilla, mezcla lineal en los solapamientos y armonización de color en la zona inferior del rostro (corrección Lab). Existe además un checkpoint profesor (VidDub-SFT) con más pasos de denoising y CFG de audio ajustable.

## Capacidades

- Doblaje de vídeo a vídeo: sustituye la voz original por una pista de audio objetivo y regenera la región de la boca para que coincida con el nuevo audio.
- Sincronización labial audio-driven: el movimiento de labios se genera a partir de las características acústicas extraídas con Whisper-small.
- Procesamiento de vídeo largo: protocolo de ventanas de 81 fotogramas con solapamiento y mezcla para secuencias de duración arbitraria.
- Preservación del resto del vídeo: mantiene resolución y frame rate originales, con pegado selectivo de la región de la boca y feathering configurable.
- Armonización de color: corrección en espacio Lab de la zona inferior del rostro para evitar discontinuidades de tono entre generación y vídeo original.
- Control de semilla y parámetros de inferencia: seed configurable, radio de feather, activación/desactivación de armonización de color.
- Integración con ComfyUI mediante nodo personalizado oficial.
- Integración en flujo de trabajo de escritorio web mediante OpenDub (aunque este no envuelve todavía el stack de inferencia de VidDub).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica directamente; el idioma lo determina el audio de entrada, no el modelo.

## Casos de uso

- Localización de contenido audiovisual: doblar un vídeo a otro idioma sustituyendo la pista de audio y regenerando el movimiento labial, manteniendo el resto del plano intacto. Adecuado por su capacidad de preservar resolución y frame rate originales.
- Doblaje de vídeos corporativos y formativos: sustituir la voz de presentadores por una versión en otro idioma o con otra locución, sin regrabar, usando el protocolo de ventanas para vídeos de varios minutos.
- Postproducción de series cortas o clips para redes: regenerar la boca de un hablante para corregir desincronización o cambiar la locución en clips de hasta 81 fotogramas por llamada, o más con ventanas solapadas.
- Creación de contenido multilingüe a partir de un único rodaje: un mismo vídeo con varias pistas de audio en distintos idiomas, generando una versión doblada por idioma con el mismo material visual.
- Prototipado de pipelines de doblaje en investigación: usar VidDub-Bench y los scripts de benchmark para evaluar calidad de lip-sync en condiciones same-audio y cross-audio de forma reproducible.
- Integración en herramientas de edición: a través del nodo ComfyUI-VidDub, incorporar el doblaje con lip-sync a flujos de postproducción basados en nodos.
- Investigación en generación de vídeo condicionada por audio: servir de base para experimentos de sincronización labial y destilación DMD de dos pasos, dado que el código de entrenamiento es público.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor publica un benchmark propio (VidDub-Bench, 256 fuentes en condiciones same/cross audio) y scripts para ejecutarlo (`scripts/run_benchmark.py`, `scripts/validate_benchmark.py`), pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni métricas de lip-sync en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo pesa 5,5 GB en BF16 para los componentes entrenados, pero hay que sumar el VAE, el T5 y Whisper-small del modelo base, por lo que el consumo real de inferencia es mayor.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo requiere Linux, GPU NVIDIA con CUDA, Python 3.10+ y FFmpeg.
- ¿Cabe en GPU consumer? No disponible. No se especifica en la model card.
- Opciones de despliegue: CLI oficial (`scripts/infer.py`) del repositorio de GitHub; nodo ComfyUI-VidDub; descarga vía `huggingface-cli`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles. Solo se indica que el muestreo es de 2 pasos (fijo) y CFG de audio 1, lo que reduce coste frente a esquemas de difusión convencionales, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VidDub | 2.440.958.285 (componentes entrenados) | 81 fotogramas @ 24 FPS, ventanas solapadas | Doblaje vídeo a vídeo con lip-sync | viddub-individual-commercial-research-1.0 (propia) | Hugging Face, GitHub, ComfyUI |
| Wan2.1-VACE-1.3B (base) | ~1,3B (backbone) | no disponible en la información | Generación y edición de vídeo | no disponible en la información | Hugging Face (Wan-AI) |
| VidDub-SFT (profesor) | no disponible | 81 fotogramas | Doblaje vídeo a vídeo con lip-sync | no disponible en la información | Hugging Face (AIPeanutman) |

No se dispone de datos de benchmarks ni de otros modelos de doblaje comparables en la información proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia viddub-individual-commercial-research-1.0 no es de código abierto estándar. El acceso a través de servicio alojado, web, API, bot o despliegue gestionado requiere permiso escrito adicional, según la model card.
- Requisitos de entrada estrictos: el vídeo fuente debe contener un rostro detectable y mayoritariamente frontal, y tener al menos 81 fotogramas. No funciona bien con perfiles, oclusiones o rostros no detectables.
- Resolución y frame rate no modificables: la salida mantiene los del vídeo de entrada; no se ofrece upscaling ni cambio de cadencia.
- Ventana limitada por llamada: exactamente 81 fotogramas por llamada full-context; vídeos más largos dependen de ventanas solapadas con mezcla lineal, lo que puede introducir artefactos en las transiciones.
- Posibles artefactos visuales: la armonización de color en la zona inferior del rostro es una corrección heurística (Lab) y el pegado con feathering puede dejar discontinuidades en casos difíciles.
- Dependencia de Whisper-small para el audio: la calidad de la sincronización está acotada por la representación acústica que extrae ese encoder.
- Idiomas: no se documentan idiomas soportados; el comportamiento depende del audio de entrada y no está validado por idioma en la información disponible.
- Sesgos: no se documentan sesgos específicos en la model card; al derivar de Wan2.1-VACE, hereda los sesgos del modelo base y de sus datos de entrenamiento, no detallados aquí.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir movimientos labiales plausibles pero incorrectos respecto al audio, especialmente en fonemas o condiciones acústicas poco representadas.
- OpenDub no envuelve el stack de inferencia de VidDub: la aplicación web es un workbench separado con licencia Apache-2.0 y no redistribuye ni integra actualmente el modelo; para usarlo hay que recurrir a la CLI.
- Entorno de ejecución: requiere Linux, GPU NVIDIA con CUDA, Python 3.10+, Git y FFmpeg; no se documenta soporte para otros sistemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIPeanutman/VidDub
- Paper (arXiv): https://arxiv.org/abs/2611.03404
- Página del proyecto: https://law1223.github.io/viddub-project-page/
- Código: https://github.com/LAW1223/VidDub
- Checkpoint profesor (VidDub-SFT): https://huggingface.co/AIPeanutman/VidDub-SFT
- Demo comunitaria en Spaces: https://huggingface.co/spaces/hugging-apps/viddub-2611
- Aplicación OpenDub: https://github.com/LAW1223/OpenDub
- Nodo ComfyUI: https://github.com/LAW1223/ComfyUI-VidDub
- Dataset de benchmark (VidDub-Bench): https://huggingface.co/datasets/AIPeanutman/VidDub-Bench
- Dataset de vídeos fuente de entrenamiento: https://huggingface.co/datasets/AIPeanutman/VidDub-Training-Data
- Dataset de clips listos para el modelo: https://huggingface.co/datasets/AIPeanutman/VidDub-Training-Clips
- Guía de benchmark: https://github.com/LAW1223/VidDub/blob/main/docs/BENCHMARK.md
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Encoder de audio: https://huggingface.co/openai/whisper-small
