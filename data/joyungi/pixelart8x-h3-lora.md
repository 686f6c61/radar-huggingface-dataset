# JOYUNGI/pixelart8x-h3-lora

## Resumen

pixelart8x-h3-lora es un adaptador LoRA de bajo rango desarrollado por el usuario JOYUNGI que se aplica sobre MiniMax H3, un modelo de difusion texto-a-video (y audio) de MiniMax. El objetivo del adaptador es empujar la salida del modelo base hacia pixel art autentico: un color por celda sobre una rejilla fija de 8 px, paleta limitada y movimiento tipo sprite fotograma a fotograma. La segunda version (v2, marcada como experimental) amplia el alcance respecto a la v1 del mismo autor (`JOYUNGI/nwpxstyle-h3-lora`), que solo generaba imagenes fijas.

El adaptador se entrena con rango 32 y alpha 32 sobre el checkpoint `minimax_h3_fl2va_int8_convrot` en tarea `t2va --one_frame --video_only`, combinando en una sola ejecucion 20 imagenes fijas y 60 clips de 124 fotogramas. La relevancia practica esta en que permite generar assets de estetica retro (sprites, animaciones, planos completos) sin entrenar un modelo desde cero, reutilizando la capacidad del modelo base mediante un delta de pesos de 1,2 GB de repositorio.

Se trata de un artefacto muy experimental: cero descargas, cero likes en el momento de redactar esta ficha, dataset de entrenamiento pequeno y una limitacion reconocida por el propio autor (entrenamiento mixto imagen + video marcado como no probado en el codigo upstream). No hay resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango, dim 32 / alpha 32) sobre MiniMax H3, modelo de difusion texto-a-video-y-audio |
| Parametros totales | no disponible (no se publica el recuento de parametros del adaptador ni del modelo base en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en sentido textual; la ventana temporal de los ejemplos es de 124 fotogramas, 5,2 s a 24 fps) |
| Tipos de cuantizacion | INT8 (ConvRot) para el DiT base y el codificador de texto en los ejemplos oficiales; el LoRA se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (los prompts de ejemplo estan redactados en ingles) |
| Licencia | minimax-h3-community-license-agreement (campo `license: other`) |
| Formato de pesos | safetensors (`pixelart8x_h3.safetensors` y checkpoints intermedios `pixelart8x_h3-0000NN.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre MiniMax H3. La tuberia completa de inferencia descrita por el autor incluye cuatro componentes: un DiT (`minimax_h3_fl2va_int8_convrot.safetensors`, cuantizado en INT8 con ConvRot), un VAE de video en fp16, un VAE de audio en fp32 y un codificador de texto Qwen3-VL 32B en INT8. La tarea declarada es `t2va` (texto a video con audio), pero el LoRA se entreno con las banderas `--one_frame --video_only`, por lo que la via de audio queda desactivada en los ejemplos publicados (los prompts fijan explicitamente `Sound: none`).

El entrenamiento uso perdida de guiado (`--h3_guidance_loss_scale 4.0`, `--h3_guidance_loss_sigma_min 0.15`), optimizador AdamW8bit, tasa de aprendizaje 1e-4 constante con 50 pasos de calentamiento, y se ejecuto en una unica RTX PRO 6000 Blackwell de 96 GB. El dataset esta construido sobre una rejilla exacta de 8 px: 20 imagenes fijas (2 repeticiones) y 60 clips limitados a los primeros 124 fotogramas (1 repeticion). Las imagenes de origen se verificaron como escalados enteros exactos, se restauraron a 1x y se comprobaron pixel a pixel antes de reescalarlas con vecino mas cercano; se uso `bucket_no_upscale`. Los pies de foto son descripciones en lenguaje natural precedidas de un prefijo fijo. La innovacion tecnica principal no esta en la arquitectura, sino en el preprocesado: garantizar que el modelo aprenda la rejilla de 8 px sin artefactos de remuestreo.

## Capacidades

- Generacion de video texto-a-video con estetica pixel art: un color por celda sobre rejilla de 8 px y paleta limitada.
- Generacion de imagenes fijas en modo un fotograma (`--one_frame`), heredada del entrenamiento mixto imagen + video.
- Animacion tipo sprite fotograma a fotograma, con clips de hasta 124 fotogramas (5,2 s a 24 fps) en los ejemplos del autor.
- Control de resolucion en multiplos de 32 px, con 768x768 como valor de ejemplo.
- Prefijos de prompt obligatorios y estables: `pixel art, crisp 8x pixel grid, limited palette.` para imagenes fijas y `pixel art animation, crisp 8x pixel grid, limited palette.` para animacion.
- Control de la via de audio mediante el sufijo `Sound: none.` (desactivada en los ejemplos del adaptador).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo generativo de video, no un LLM de proposito general).
- Capacidades multilingues: no disponible; los ejemplos se distribuyen solo en ingles.

## Casos de uso

- Produccion de sprites animados para videojuegos retro: el adaptador genera clips de 124 fotogramas sobre rejilla de 8 px, que se pueden trocear en una hoja de sprites y reutilizar como animaciones de personaje en un motor 2D.
- Prototipado rapido de assets en preproduccion: permite iterar sobre siluetas, paletas y ciclos de animacion con 30 pasos de inferencia antes de encargar el trabajo final a un artista pixel.
- Fondos y escenarios para juegos indie: con un prompt de escena y resolucion en multiplos de 32 px se obtienen planos de fondo coherentes con la estetica de 8 bits, utiles para pantallas de titulo o niveles completos.
- Intros y transiciones para contenido en redes: la generacion de clips cortos de 5,2 s encaja con formatos de video breve y aporta una identidad visual retro sin trabajo manual de animacion.
- Previsualizacion de cinemáticas con estetica retro: los clips generados se pueden usar como animatica para comunicar tono y ritmo de una secuencia antes de producirla en alta resolucion.
- Estilizacion de conceptos narrativos concretos: con el prefijo fijo y una descripcion en lenguaje natural se pueden explorar variantes de un mismo personaje o escena (uniforme, fondo plano) manteniendo la coherencia de rejilla y paleta.
- Generacion de material grafico para prototipos de interfaz de videojuego: iconos, retratos y animaciones de estado generadas en lote con el mismo prefijo para mantener consistencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas (FVD, CLIP score, precision de rejilla) ni comparaciones numericas con otros adaptadores. El repositorio unicamente aporta muestras cualitativas en la carpeta `samples/` (PNG de un fotograma y MP4 de 124 fotogramas escritos durante el entrenamiento).

## Requisitos de hardware

- GPU de entrenamiento documentada: una RTX PRO 6000 Blackwell con 96 GB de VRAM.
- Inferencia: la tuberia completa descrita por el autor carga simultaneamente un codificador de texto Qwen3-VL 32B en INT8 (del orden de 32-35 GB solo ese componente), un DiT MiniMax H3 en INT8, un VAE de video fp16 y un VAE de audio fp32. Estimacion orientativa (no confirmada por el autor): mas de 48 GB de VRAM en total, probablemente en el rango de 60-80 GB segun el grado de descarga secuencial de componentes.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), A100 80 GB, H100 80 GB. El numero de parametros del DiT no esta disponible, por lo que no se puede acotar con precision el minimo de VRAM.
- GPU de consumo: no hay evidencia de que quepa en una RTX 4090 (24 GB) ni en una RTX 5090 con la tuberia completa, dado el tamano del codificador de texto. No disponible confirmacion de ejecucion en consumer.
- Opciones de despliegue: Musubi Tuner (`kohya-ss/musubi-tuner`, script `minimax_h3_generate_video.py --task t2va`) es la via documentada. La existencia de `Comfy-Org/MiniMax-H3` como modelo base apunta a integracion con ComfyUI, aunque el autor no la documenta para este LoRA.
- Parametros de inferencia de referencia: 30 pasos (`--infer_steps 30`), `--video_size 768 768`, `--video_length 124`, `--lora_multiplier 1.0`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JOYUNGI/pixelart8x-h3-lora (este) | LoRA texto-a-video + imagen | MiniMax H3 | 124 fotogramas (5,2 s a 24 fps), resolucion en multiplos de 32 px | minimax-h3-community-license-agreement | Publico en HuggingFace, 0 descargas |
| JOYUNGI/nwpxstyle-h3-lora | LoRA texto-a-imagen | MiniMax H3 | solo imagenes fijas | no disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros adaptadores de pixel art para video: no disponible en la informacion proporcionada | no disponible | no aplica | no disponible | no disponible | no disponible |

La comparacion mas directa disponible es la version 1 del mismo autor: misma base, mismo dominio estetico, pero limitada a imagenes fijas. La v2 anade generacion de video y entrena imagen y video de forma conjunta en una unica ejecucion.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno y experimental: 20 imagenes fijas y 60 clips, con 2 y 1 repeticiones respectivamente.
- Sesgo de dominio declarado por el autor: las imagenes fijas son mayoritariamente personajes anime de cuerpo entero con uniformes de estilo militar sobre fondos planos. Se espera un rendimiento pobre fuera de ese dominio.
- El entrenamiento mixto de imagen y video en una sola ejecucion esta marcado como no probado en el codigo upstream, por lo que pueden aparecer comportamientos inestables.
- Frecuencia de fallo de la rejilla de 8 px no cuantificada: no hay metricas que midan si el modelo respeta de verdad un color por celda en todas las salidas.
- La salida de audio no esta entrenada en este adaptador (`--video_only`), de modo que cualquier intento de usar la via de audio queda fuera del alcance probado.
- Dependencia de un prefijo de prompt literal. Omitirlo o modificarlo puede degradar notablemente el resultado.
- Licencia: minimax-h3-community-license-agreement, registrada como `license: other`. Es una licencia de comunidad especifica del modelo base, no una licencia de codigo abierto estandar; hay que revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial. La model card incluye un aviso `NOTICE` que indica que los archivos son derivados modificados de MiniMax H3 (deltas de pesos LoRA).
- Riesgo de alucinacion visual y de artefactos de interpolacion: no evaluado. Con un adaptador de estilo entrenado sobre un conjunto tan reducido, es esperable degradacion en escenas complejas, movimiento rapido o multiples personajes.
- Idiomas: no hay informacion sobre el comportamiento con prompts en castellano; los ejemplos solo cubren ingles.
- Adopcion nula en el momento de redactar la ficha (0 descargas, 0 likes), sin validacion externa de la comunidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/JOYUNGI/pixelart8x-h3-lora
- LoRA v1 del mismo autor (solo imagenes fijas): https://huggingface.co/JOYUNGI/nwpxstyle-h3-lora
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base en formato Comfy: https://huggingface.co/Comfy-Org/MiniMax-H3
- Herramienta de entrenamiento e inferencia Musubi Tuner: https://github.com/kohya-ss/musubi-tuner
- Archivos de licencia y aviso, incluidos en el repositorio: `LICENSE` y `NOTICE` (referenciados desde la model card, sin URL absoluta disponible)

La busqueda web realizada no devolvio enlaces relevantes sobre este modelo ni sobre MiniMax H3; los resultados obtenidos no guardan relacion con el contenido de esta ficha y se han descartado.
