# coolthor/Kandinsky-6.0-Pro-distill-5s-NVFP4

## Resumen

Kandinsky 6.0 Pro distill 5s NVFP4 es una cuantizacion de pesos en NVFP4 del transformer del modelo de video Kandinsky 6.0 Pro (variante destilada) desarrollado por Kandinsky Lab. El modelo original es un sistema de generacion de video de 29 000 millones de parametros que produce un clip de 5 segundos junto con su audio a 44 kHz en una sola pasada: la linea hablada se escribe en el prompt y el modelo genera voz y movimiento labial sincronizado. Esta version cuantizada, publicada por el usuario coolthor (ai-muninn), reduce el peso del transformer de 56,2 GiB a 18,7 GiB, lo que permite que quepa completo en una GPU de consumo con 32 GB de VRAM como la RTX 5090.

La relevancia de esta ficha radica en que hace accesible un modelo de video-audio de gran tamano en hardware de gama alta de consumo, con una perdida de calidad visual descrita como menor por el autor de la cuantizacion. No se trata de un modelo nuevo, sino de una conversion de formato orientada a ComfyUI y a las GPU Blackwell (sm_120 y superiores) que disponen de tensor cores para FP4. El autor reporta una reduccion del tiempo de generacion de un clip de 5 segundos de 206,7 s a aproximadamente 141 s en una RTX 5090 con SageAttention activado.

El modelo base mantiene licencia MIT, y esta copia cuantizada conserva esa misma licencia. La informacion disponible no incluye resultados de benchmarks estandar (MMLU, VBench, etc.) ni detalles sobre el dataset de entrenamiento mas alla de que los prompts de entrenamiento fueron en ruso e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video y audio (Kandinsky 6.0), con bloques visuales, video-texto y audio-texto |
| Parametros totales | 29 000 millones (modelo base); numero exacto de parametros del transformer cuantizado no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 empaquetado con escalas de bloque FP8 E4M3 y escala por tensor FP32); capas Linear de bloques visuales, video-texto y audio-texto (1 840 capas); bloques visuales 0, 1, 58 y 59, normas, embeddings, time embeddings y cabeza de salida en bf16 |
| Idiomas soportados | Ingles y ruso (prompts de entrenamiento); chino comprensible pero con acento segun pruebas del autor |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo de ComfyUI, single-file) |
| Tamano del repo | 20,1 GB (transformer cuantizado: 18,7 GiB) |
| Resolucion de salida | 864x480, 121 frames a 24 fps (segun pruebas del autor) |
| Duracion del clip | 5 segundos |
| Audio | 44 kHz, generado en la misma pasada que el video |
| Pasos de muestreo | 10 pasos, CFG 1.0, audio VAE scaling 0.417 (checkpoint destilado) |

## Arquitectura y entrenamiento

El modelo base Kandinsky 6.0 es un transformer de difusion multimodal que genera video y audio de forma conjunta. La arquitectura se organiza en bloques visuales, bloques de texto-a-video y bloques de audio-texto, y en esta cuantizacion se han convertido a NVFP4 las capas Linear de los tres tipos de bloque (1 840 capas en total). Se mantienen en bf16 los dos primeros y los dos ultimos bloques visuales (0, 1, 58 y 59), siguiendo la receta NVFP4 de LTX-2, ademas de las normas, embeddings, time embeddings y la cabeza de salida. El pipeline completo requiere componentes adicionales que no estan en este repositorio: codificadores de texto Qwen2.5-VL 7B y CLIP-L, el VAE de HunyuanVideo, el VAE de MMAudio y el vocoder BigVGAN.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor de la cuantizacion menciona que el informe oficial (arXiv 2610.05608) indica que los prompts de entrenamiento fueron en ruso e ingles. La variante destilada del checkpoint permite muestrear con 10 pasos y CFG 1.0, lo que reduce el coste de inferencia frente a un modelo no destilado. La conversion a NVFP4 se realizo con comfy-quants (rama `kand6`, commit `4b96626`) y tardo 59 segundos en una RTX 5090, requiriendo aproximadamente 50 GB de RAM durante la escritura del archivo.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con clips de 5 segundos a 864x480 y 24 fps.
- Generacion de video a partir de imagen (image-to-video), segun las etiquetas del repositorio.
- Generacion conjunta de video y audio (text-to-audio-video): el audio se produce en la misma pasada que el video.
- Sincronizacion labial (lip-sync): la linea hablada se introduce en el prompt entre las etiquetas `<S>…<E>` y el modelo genera la voz y el movimiento de labios correspondientes.
- Generacion de voz a 44 kHz mediante el vocoder BigVGAN.
- Soporte de prompts multilingues limitado a ingles y ruso de forma nativa; el chino produce resultados inteligibles pero con acento.
- Integracion nativa con ComfyUI 0.38.0 o superior mediante el nodo oficial `kandinsky6`.
- Compatibilidad con SageAttention para acelerar la inferencia.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje general, sino un modelo generativo de difusion.

## Casos de uso

- Generacion de videos cortos para redes sociales: el modelo produce clips de 5 segundos con audio sincronizado en una sola pasada, adecuado para contenido vertical u horizontal de formato corto donde la voz y el movimiento labial importan.
- Doblaje y localizacion de video: escribiendo la linea hablada en el prompt se obtiene voz y sincronizacion labial, lo que permite generar versiones en ingles o ruso de un mismo clip sin postproduccion de audio.
- Prototipado rapido de escenas con dialogo: guionistas y disenadores pueden iterar sobre una escena concreta escribiendo el dialogo dentro del prompt y revisando el resultado en aproximadamente 141 s por clip en una RTX 5090.
- Creacion de avatares parlantes para demos y presentaciones: el modelo genera una persona que mira a camara y pronuncia una frase, util para videos explicativos o pruebas de concepto de asistentes virtuales.
- Generacion de material audiovisual para videojuegos y prototipos interactivos: clips cortos con audio integrado que pueden servir como placeholders o assets de prueba en etapas tempranas de desarrollo.
- Investigacion en generacion conjunta de video y audio: el modelo permite experimentar con sincronizacion labial y coherencia audio-video en un entorno de codigo abierto con licencia MIT, sin depender de APIs propietarias.
- Despliegue en estaciones de trabajo con GPU Blackwell: al caber en 32 GB de VRAM, permite ejecutar el modelo en local en una RTX 5090 sin infraestructura de centro de datos, util para estudios pequenos y equipos de investigacion con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (VBench, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor de la cuantizacion reporta mediciones propias de tiempo de inferencia y calidad de transcripcion del habla, que se recogen a continuacion.

Tiempos de generacion en RTX 5090 (32 GB VRAM, 61,6 GB RAM, Windows), resolucion 864x480, 121 frames a 24 fps, semilla 42, incluyendo carga del modelo:

| Configuracion | Tiempo por clip de 5 s |
|---|---|
| bf16 (60,3 GB), sin SageAttention | 277 s |
| bf16 + SageAttention | 206,7 s |
| NVFP4 (este repositorio) + SageAttention | 141,5 s / 131,4 s / 151,5 s (tres ejecuciones) |

Transcripcion del habla generado con Whisper large-v3-turbo:

| Linea solicitada | bf16 | NVFP4 |
|---|---|---|
| "Welcome to AI Muninn. Here's today's AI news." | Correcta (transcribe "Munnin") | Correcta (transcribe "Manin") |
| "歡迎來到 AI Muninn，今天帶你看最新的 AI 消息。" | Inteligible, 2 palabras erroneas | Inteligible, 2 palabras erroneas |

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer cuantizado ocupa 18,7 GiB; el pipeline completo requiere ademas los codificadores de texto (Qwen2.5-VL 7B, CLIP-L), los VAE (HunyuanVideo y MMAudio) y el vocoder BigVGAN, por lo que la VRAM total necesaria supera la del transformer solo. El autor indica que el transformer completo cabe en una GPU de 32 GB.
- GPU recomendadas: RTX 5090 (32 GB) es la referencia usada por el autor; se requiere arquitectura Blackwell (sm_120 o superior) para aprovechar los tensor cores FP4. En GPU anteriores el archivo se puede cargar, pero los pesos se expanden antes de cada matmul y solo se gana en tamano de descarga, no en velocidad.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB. No se documenta su funcionamiento en GPU de consumo con menos VRAM.
- Opciones de despliegue: ComfyUI 0.38.0 o superior con el nodo oficial `kandinsky6`; el archivo se coloca en `models/diffusion_models/` y se selecciona en Load Diffusion Model con `weight_dtype = default`. ComfyUI carga NVFP4 de forma nativa sin parches. Se recomienda lanzar ComfyUI con `--use-sage-attention` y tener instalado `sageattention`.
- Latencia y throughput: aproximadamente 141 s por clip de 5 segundos en RTX 5090 con NVFP4 y SageAttention (tres ejecuciones entre 131,4 s y 151,5 s), incluyendo carga del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Pro distill 5s NVFP4 (este) | 29 000 M (base) | clip de 5 s, 864x480, 24 fps, audio 44 kHz | safetensors NVFP4, 18,7 GiB | MIT | Hugging Face (coolthor) |
| Kandinsky 6.0 Pro distill 5s (bf16 original) | 29 000 M | clip de 5 s, 864x480, 24 fps, audio 44 kHz | safetensors bf16, 56,2 GiB | MIT | Hugging Face (kandinskylab) |
| Kandinsky 6.0 Pro distill Lite | no disponible | no disponible | no disponible | MIT | Hugging Face (kandinskylab); el nodo oficial de ComfyUI no lo carga segun el autor |
| LTX-2 NVFP4 (referencia de receta) | no disponible | no disponible | NVFP4 | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion NVFP4 cambia el clip generado: una misma semilla no produce el mismo resultado, solo uno mas rapido. En la comparacion del autor el encuadre, el vestuario y el timing labial se mantienen casi identicos y no se observa ruido anadido, pero los rostros difieren en detalles pequenos. Un unico prompt no constituye una evaluacion de calidad.
- La aceleracion por tensor cores FP4 solo esta disponible en Blackwell (sm_120 o superior). En GPU anteriores el archivo se expande antes de cada matmul y solo se reduce el tamano de descarga.
- Idiomas: el modelo esta entrenado con prompts en ruso e ingles. El chino resulta inteligible pero con acento de no nativo, tanto en bf16 como en NVFP4.
- El nodo oficial de ComfyUI no carga el checkpoint distilled Lite, por lo que no se ha publicado una version NVFP4 Lite.
- Solo se incluye el transformer cuantizado; es necesario descargar por separado los codificadores de texto, VAE y modelos de audio segun la guia oficial de ComfyUI.
- La informacion disponible no documenta sesgos especificos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- Riesgo de alucinacion visual y auditiva: como modelo generativo de difusion, puede producir contenido incoherente, artefactos o audio mal sincronizado en prompts ambiguos o fuera de distribucion.
- La licencia MIT del modelo base se mantiene en esta copia cuantizada; no se documentan restricciones adicionales para uso comercial, pero se recomienda verificar los terminos de los componentes auxiliares (Qwen2.5-VL, CLIP-L, HunyuanVideo VAE, MMAudio VAE, BigVGAN) que no forman parte de este repositorio.
- La conversion requiere aproximadamente 50 GB de RAM durante la escritura del archivo, lo que puede ser un limite en equipos con menos memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coolthor/Kandinsky-6.0-Pro-distill-5s-NVFP4
- Modelo base (bf16): https://huggingface.co/kandinskylab/Kandinsky-6.0-Pro-distill-5s-Diffusers
- Repositorio oficial de Kandinsky 6: https://github.com/kandinskylab/kandinsky-6
- Guia de configuracion de ComfyUI: https://github.com/kandinskylab/kandinsky-6/blob/main/comfyui/README.md#manual-downloads
- Nodo oficial de ComfyUI: https://registry.comfy.org/nodes/kandinsky6
- Herramienta de cuantizacion comfy-quants: https://github.com/Comfy-Org/comfy-quants
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.05608
- Articulo del autor sobre lip-sync en RTX 5090: https://ai-muninn.com/en/blog/kandinsky-6-pro-lip-sync-rtx-5090
- Version en chino tradicional del articulo: https://ai-muninn.com/zh-TW/blog/kandinsky-6-pro-lip-sync-rtx-5090
- Video corto en ingles: https://youtube.com/shorts/pBowQFjCQeg
- Video corto en chino: https://youtube.com/shorts/8COsVhS7QTQ
- Perfil del autor de la cuantizacion: https://huggingface.co/coolthor
- Sitio del autor: https://ai-muninn.com
