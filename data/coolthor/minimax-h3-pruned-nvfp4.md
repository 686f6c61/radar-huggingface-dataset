# coolthor/MiniMax-H3-pruned-NVFP4

## Resumen

MiniMax-H3-pruned-NVFP4 es una cuantización en NVFP4 (FP4 de NVIDIA) del modelo MiniMax-H3, un modelo de difusión multimodal desarrollado por MiniMaxAI que genera vídeo a partir de texto, imagen o vídeo, con audio sincronizado. Esta versión, publicada por el usuario coolthor, aplica una poda (pruning) sobre el modelo original y cuantiza los pesos a 4 bits en formato NVFP4, pensado para aprovechar las capacidades de cómputo FP4 de las GPU NVIDIA Blackwell.

El pipeline declarado es image-text-to-video, lo que indica que el modelo acepta imágenes y texto como entrada para producir vídeo, y los tags incluyen text-to-video, image-to-video y text-to-audio-video, señalando generación conjunta de vídeo y audio. El repo ocupa 85,6 GB y se distribuye como un único archivo de difusión (diffusion-single-file), formato habitual para su uso en ComfyUI.

La relevancia de esta ficha radica en que ofrece una vía de despliegue del modelo original con requisitos de memoria reducidos gracias a la cuantización FP4, aunque con las limitaciones propias de una poda y de un formato de pesos específico para hardware Blackwell. El acceso está restringido (gated) y sujeto a la licencia comunitaria de MiniMax-H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion multimodal (texto/imagen/video a video con audio); detalles de la arquitectura interna no disponibles |
| Parametros totales | no disponible (el repo ocupa 85,6 GB en NVFP4 tras poda) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA); el modelo base admite otras cuantizaciones no detalladas aqui |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | diffusion-single-file (archivo unico para ComfyUI), pesos cuantizados NVFP4 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base MiniMax-H3 en la informacion proporcionada. Los tags indican que se trata de un modelo de difusion orientado a la generacion de video (text-to-video, image-to-video) y de audio-video conjunto (text-to-audio-video), con pipeline image-text-to-video. La variante aqui descrita incorpora una poda de parametros y una cuantizacion a NVFP4, un formato de 4 bits con escala por bloque introducido por NVIDIA para acelerar la inferencia en GPU Blackwell.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detallan innovaciones tecnicas especificas del modelo original mas alla de su naturaleza multimodal (video con audio). Cualquier afirmacion adicional sobre el entrenamiento seria especulativa y no se incluye.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de una imagen de referencia (image-to-video).
- Generacion conjunta de video y audio (text-to-audio-video), segun los tags del repositorio.
- Entrada combinada de imagen y texto para guiar la generacion (pipeline image-text-to-video).
- Integracion con ComfyUI mediante un unico archivo de difusion.
- Ejecucion en GPU NVIDIA Blackwell aprovechando el formato NVFP4.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado rapido de clips de video en ComfyUI: al distribuirse como diffusion-single-file, se puede cargar directamente en un flujo de ComfyUI para generar clips cortos a partir de prompts de texto, lo que facilita iterar sobre ideas visuales sin montar un pipeline propio.
- Generacion de video a partir de storyboards o imagenes fijas: el modo image-to-video permite animar una imagen de referencia, util para previsualizar escenas a partir de ilustraciones o fotogramas clave.
- Creacion de contenido para redes sociales con audio: el soporte text-to-audio-video permite obtener un clip con pista de audio asociada en una sola pasada, reduciendo el trabajo de postproduccion en piezas cortas.
- Pruebas de concepto en hardware Blackwell: al estar cuantizado en NVFP4, sirve para evaluar el rendimiento de la generacion de video en GPU de nueva generacion con menor huella de memoria que el modelo completo.
- Investigacion sobre cuantizacion y poda en modelos de difusion: esta variante permite comparar calidad y velocidad frente al modelo original MiniMax-H3 para estudiar el impacto de FP4 y del pruning en la generacion de video.
- Generacion de material de previsualizacion en estudios pequenos: equipos con una sola GPU Blackwell pueden desplegar esta variante para producir previsiones de escenas antes de invertir en renderizado de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 85,6 GB, por lo que se requiere una GPU con memoria suficiente para cargar los pesos cuantizados y el estado de inferencia asociado.
- GPU recomendadas: GPU NVIDIA Blackwell, dado que el formato NVFP4 esta disenado para esa generacion; no se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible; la viabilidad en tarjetas consumer Blackwell depende de la VRAM efectiva necesaria, que no se detalla.
- Opciones de despliegue: ComfyUI (formato diffusion-single-file); otros entornos (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Acceso |
|---|---|---|---|---|---|
| MiniMax-H3-pruned-NVFP4 (este) | no disponible (repo de 85,6 GB) | no disponible | NVFP4, single-file | minimax-h3-community-license-agreement | Restringido (gated) |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | minimax-h3-community-license-agreement | No disponible en la informacion |
| Otras alternativas de generacion de video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- La cuantizacion NVFP4 y la poda pueden degradar la calidad de la generacion respecto al modelo original MiniMax-H3; no se han publicado metricas que cuantifiquen esta perdida.
- El formato NVFP4 esta orientado a GPU NVIDIA Blackwell; en hardware anterior puede no ser compatible o requerir conversion.
- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- La licencia minimax-h3-community-license-agreement impone condiciones especificas para uso comercial; deben revisarse antes de cualquier despliegue en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion visual del modelo.
- Al ser una variante mantenida por un tercero (coolthor) y no por MiniMaxAI, no se garantiza soporte ni actualizaciones oficiales.
- El tamano del repositorio (85,6 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Hugging Face: https://huggingface.co/coolthor/MiniMax-H3-pruned-NVFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: minimax-h3-community-license-agreement (referenciada en la ficha de Hugging Face del modelo)
