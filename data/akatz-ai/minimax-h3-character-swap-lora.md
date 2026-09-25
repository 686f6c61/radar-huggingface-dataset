# akatz-ai/MiniMax-H3-Character-Swap-LoRA

## Resumen

MiniMax-H3 Character-Swap-LoRA es un adaptador LoRA experimental desarrollado por Akatz Labs (usuario `akatz-ai`) sobre el modelo de vídeo MiniMax-H3 de Comfy-Org. Su función es sustituir un personaje concreto dentro de un vídeo existente por otro personaje proporcionado como imagen de referencia, manteniendo la escena, la cámara y el resto de elementos del metraje original. No es un modelo autónomo: se carga sobre los pesos base de H3 y requiere un runtime compatible con la variante Ref2VA.

El adaptador se entrenó durante 1.000 actualizaciones con rango y alpha de 16, sobre un conjunto de 94 tripletas sintéticas de edición de imagen y 40 ejemplos de vídeo/audio sin modificar. La precisión de entrenamiento fue BF16, con transformer en convrot8 y codificador de texto NVFP4 en una única GPU RTX PRO 4500 Blackwell de 32 GB. El repositorio ocupa 0,2 GB y solo se publica el checkpoint final de 1.000 pasos.

Su relevancia es acotada y claramente experimental: el propio autor documenta que la preservación del fondo mejora respecto al modelo base en comparaciones locales, pero que el timing de movimiento, las expresiones faciales y los cortes duros siguen siendo poco fiables. Está pensado para flujos de edición de vídeo en ComfyUI, no para producción sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de difusion de video MiniMax-H3 (transformer con atencion Sol nativa); no es una arquitectura propia |
| Parametros totales | No disponible (adaptador LoRA de rango 16; repositorio de 0,2 GB; los pesos base se distribuyen por separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; ventana de video recomendada por el autor: clips continuos de 4-5 s a 24 fps, con grid de frames del runtime H3) |
| Tipos de cuantizacion | Base de referencia entrenada en convrot8 (transformer) y NVFP4 (text encoder); evaluaciones en INT8; el adaptador se publica en safetensors sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | minimax-h3-community-license-agreement (license_name declarado en la model card; fichero LICENSE en el repositorio) |
| Formato de pesos | safetensors (unico fichero: `h3_character_swap_pro4500_1000.safetensors`); libreria declarada `diffusion-single-file` |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 16 y alpha 16 aplicado sobre las proyecciones del transformer de MiniMax-H3, excluyendo explícitamente `adaln_proj`. El entrenamiento partió de los pesos `minimax_h3_ref2va_pruned_int8_convrot.safetensors` de Comfy-Org/MiniMax-H3 y del asistente de entrenamiento congelado `ostris/minimax_h3_training_adapter` (frozen Ref2VA training assistant). Ninguno de esos componentes se fusiona ni se redistribuye en este repositorio: el adaptador es un fichero independiente que debe cargarse junto al modelo base y los VAE.

La configuración registrada fue AdamW8bit con learning rate 5e-5, batch 1 y acumulación 1, precisión BF16, con gradient checkpointing, layer offload, latents/texto cacheados y MLP troceado para ajustar la memoria. La resolución objetivo de edición usó un presupuesto de área de 1024 con buckets de 1344×768, y la regularización de vídeo bajó a un presupuesto de área de 384 con 73 frames a 24 fps (unos 3,04 s). Se guardaron checkpoints cada 250 actualizaciones, pero solo se publica el de 1.000. El muestreo durante el entrenamiento estuvo desactivado.

El dataset contiene 94 tripletas sintéticas de edición de imagen y 40 ejemplos de vídeo/audio sin cambios. La optimización usó 76 ediciones y 32 clips de regularización, dejando fuera 18 ediciones y 8 clips. Los objetivos de edición son imágenes fijas con controles de vídeo fuente estático de cinco frames, por lo que no se entrenó sobre objetivos largos de sustitución de personaje en movimiento. No hay palabra de activación (trigger word): la selección del personaje se hace por prompt.

## Capacidades

- Sustitución de personaje en vídeo: reemplaza a una persona identificada en el prompt por el personaje de una imagen de referencia, tomando de esta la identidad, el vestuario y el estilo artístico.
- Vídeo-a-vídeo con preservación de escena: mantiene en mayor medida que el modelo base la cámara, el fondo, la iluminación, los objetos y las demás personas presentes en el metraje original.
- Transferencia de identidad entre estilos: el dataset de entrenamiento incluye intercambios entre estilos distintos y hojas de personaje variadas.
- Adaptación de pose y escala: intenta igualar posición, escala, pose y movimiento del sujeto original.
- Funcionamiento sin LoRA Turbo: según el autor, el adaptador de character swap no requiere Turbo LoRA, Spectrum ni atencion Sol para funcionar.
- Inferencia a 24 fps con el grid de frames soportado por el runtime H3.
- No soporta: tool calling, function calling, agentes, razonamiento multi-paso ni generation de texto. No es un modelo de lenguaje.
- Multilingue: limitado a ingles en prompts y captions.
- Audio: el autor no supervisó audio en los objetivos de entrenamiento; en pruebas tempranas el audio generado se acercaba más al original en algunas comparaciones, pero se saltaba o derivaba en la prueba de continuación.

## Casos de uso

- Postproducción de vídeo publicitario: sustituir a un actor por una versión aprobada del personaje en planos cortos continuos de 4-5 segundos, cargando el adaptador a fuerza 1.0 en un runtime Ref2VA y describiendo en el prompt únicamente al sujeto a reemplazar.
- Prototipado de casting digital: generar variantes de una misma escena con distintas hojas de personaje a partir de una única grabación de referencia, útil para presentar opciones antes de rodar.
- Edición de contenido de archivo: reemplazar a una persona en metraje existente conservando el fondo y el atrezzo, aprovechando la mejora cualitativa de preservación de escena reportada frente al modelo base.
- Localización de contenido para mercados distintos: adaptar el aspecto de un presentador manteniendo intactos decorado, iluminación y resto de participantes.
- Iteración creativa en ComfyUI: integrar el fichero en `ComfyUI/models/loras/` con un cargador de LoRA compatible de solo modelo y encadenarlo con otros adaptadores (por ejemplo un Turbo 8-step de 768p) para explorar combinaciones.
- Investigación sobre edición de vídeo condicionada por referencia: el adaptador sirve como punto de partida reproducible para estudiar preservación de identidad y coherencia temporal, dado que el autor publica el dataset y la configuración de entrenamiento.
- Pruebas de continuidad de plano: usar continuaciones de ventana corta para mejorar las uniones entre fragmentos, aceptando que el timing de corte de cámara no está garantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta observaciones cualitativas de comparaciones locales lado a lado, en las que la preservación de escena y fondo parece mejor que la del modelo base, sin puntuación numérica asociada.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB (un único `.safetensors`), pero no es utilizable sin el modelo base MiniMax-H3, sus VAE y el runtime Ref2VA, que dominan el consumo de memoria.
- Entrenamiento registrado por el autor: una RTX PRO 4500 Blackwell de 32 GB en RunPod, con gradient checkpointing, layer offload, latents y texto cacheados y MLP troceado. Coste estimado por el autor en torno a 11 USD por una noche de alquiler, cifra que él mismo aclara que no es un benchmark de coste medido.
- VRAM de inferencia: no disponible de forma oficial. Por el tipo de modelo (vídeo con transformer a resolución 1344×768 y presupuesto de área 1024) se sitúa en el rango de GPU de datacenter o workstation; no hay confirmación de que quepa en GPU de consumo.
- GPU recomendadas: no disponibles explícitamente. La única GPU documentada en el proceso es la RTX PRO 4500 Blackwell de 32 GB, usada para entrenamiento, no necesariamente representativa de la inferencia.
- Opciones de despliegue: ComfyUI (flujo previsto por el autor, con el fichero en `ComfyUI/models/loras/`) y runtimes compatibles con H3 Ref2VA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.
- Modo de uso: fuerza 1.0 sobre el checkpoint final, sin palabra de activación, con el vídeo fuente como `<Video 1>` y la imagen de reemplazo como `<Picture 1>`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados frente a otros adaptadores de sustitucion de personaje ni frente a alternativas de edicion de video condicionada por referencia, por lo que no es posible establecer una comparacion con datos verificables.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no es un adaptador listo para producción sin revisión humana.
- Deriva en ventanas largas: el encuadre, la colocación del sujeto y el timing respecto a la fuente pueden desviarse. Los cortes duros pueden convertirse en zooms o reposicionamientos graduales.
- Las expresiones faciales en primer plano pueden no coincidir con la interpretación original, y añadir instrucciones de expresión al prompt a veces suprime por completo el intercambio.
- El texto del prompt no garantiza una alineación estricta con la fuente; instrucciones de preservación ayudaron en algunas evaluaciones locales, pero no de forma consistente.
- Los objetivos de entrenamiento son imágenes fijas con controles de vídeo estático de cinco frames, no sustituciones de personaje en movimiento largo. La ventana de 4-5 segundos funcionó mejor que los tests completos de 14 segundos, pero no se ha establecido una duración máxima precisa.
- Solo se supervisó la sustitución de un único personaje. La inferencia con dos personajes se probó, pero no hubo supervisión multi-personaje en los objetivos de entrenamiento.
- El audio no fue supervisado y puede saltarse o derivar.
- El adaptador no incluye los pesos base, los VAE, el asistente de entrenamiento Ref2VA ni la configuracion híbrida FL2VA/Ref2VA local; hay que obtenerlos por separado, con el coste de almacenamiento y VRAM que eso implica.
- La licencia es `minimax-h3-community-license-agreement`, no una licencia de código abierto estándar. Es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones pueden diferir de las de licencias permisivas.
- Idiomas: solo inglés, tanto en captions de entrenamiento como en prompts.
- El repositorio tiene 0 descargas y 13 me gusta, y fue creado el 25 de septiembre de 2026 con última actualización el mismo día, lo que indica ausencia de validación externa por parte de la comunidad.
- La versión de AI Toolkit usada no procedía de un checkout de Git, por lo que la etiqueta de versión incrustada no corresponde a una revisión de fuente exacta. Los hashes y revisiones del modelo base están en `training/base-model-files.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Asistente de entrenamiento (frozen Ref2VA training assistant): https://huggingface.co/ostris/minimax_h3_training_adapter
- Fichero de pesos final: `h3_character_swap_pro4500_1000.safetensors` (disponible dentro del repositorio del modelo)
- Configuracion de entrenamiento: `training/train-1000-noeval.json` y `training/base-model-files.json` (dentro del repositorio del modelo)
- No se han encontrado enlaces relevantes adicionales en la busqueda web: los resultados devueltos no guardan relacion con el modelo y se descartan por no ser fuentes tecnicas fiables.
