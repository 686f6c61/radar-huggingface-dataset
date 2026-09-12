# Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients

## Resumen

LTX-2.5-22b-IC-LoRA-Ingredients es un adaptador LoRA de tipo *in-context* (IC-LoRA) publicado por Lightricks para su modelo de difusion de video LTX-2.5. Su funcion es la de un adaptador de video a video orientado a mantener la consistencia de personajes y elementos a partir de una hoja de referencia (*reference sheet*), de modo que el modelo base pueda generar o transformar video respetando la identidad visual aportada como contexto. Se distribuye como un unico archivo de difusion (formato *diffusion-single-file*), con un peso de repositorio de 1,4 GB, lo que confirma que se trata de un adaptador y no de un modelo completo.

El repositorio se publica bajo la licencia *ltx-2.x-community-license*, hereda el modelo base Lightricks/LTX-2.5 y esta etiquetado para la tarea de video-to-video con soporte exclusivo de ingles (en). El acceso es restringido: es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo. La nomenclatura "22b" del identificador apunta al modelo base de 22 mil millones de parametros sobre el que se aplica el LoRA, no al tamano del adaptador en si.

Su relevancia actual reside en que resuelve uno de los problemas mas persistentes de la generacion de video con difusion: la deriva de identidad entre planos. Al plantearse como un LoRA aplicable sobre LTX-2.5, permite reutilizar la infraestructura de inferencia ya existente para el modelo base y anadir consistencia de personaje sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA, in-context) sobre un modelo de difusion de video; no disponible el detalle de la arquitectura interna del modelo base |
| Parametros totales | No disponible para el adaptador; el identificador indica 22b (22 000 millones) para el modelo base Lightricks/LTX-2.5 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye como archivo unico de difusion) |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2.x-community-license |
| Formato de pesos | diffusion-single-file (archivo unico de difusion); no disponible el detalle de formato exacto (safetensors, GGUF u otros) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del adaptador ni del modelo base. Por las etiquetas del repositorio (*ic-lora*, *ltx-2.5*, *video-to-video*, *reference-sheet*, *character-consistency*) se deduce que se trata de un LoRA de condicionamiento en contexto: el adaptador anade al modelo de difusion la capacidad de tomar una hoja de referencia visual como entrada adicional y utilizarla como guia de identidad durante la generacion o transformacion de video. El repositorio se clasifica en la libreria *diffusion-single-file* y el pipeline declarado es video-to-video.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, si se emplearon tecnicas de RLHF o DPO, ni sobre el rango, los modulos objetivo o los hiperparametros del LoRA. El adaptador depende del modelo base Lightricks/LTX-2.5, por lo que su comportamiento esta ligado a la version concreta de dicho modelo. El peso del repositorio (1,4 GB) es coherente con un adaptador de bajo rango y no con un conjunto completo de pesos.

## Capacidades

- Generacion y transformacion de video a video condicionada por una hoja de referencia (*reference sheet*).
- Consistencia de personaje: mantiene los rasgos de identidad visual definidos en la referencia a lo largo de la generacion.
- Consistencia de elementos o "ingredientes": el nombre del adaptador sugiere soporte para fijar objetos o componentes concretos de la escena, no solo personajes.
- Condicionamiento en contexto (IC): la referencia se aporta como contexto adicional al proceso de difusion, en lugar de requerir reentrenamiento.
- Aplicacion como adaptador sobre LTX-2.5, reutilizando el pipeline del modelo base.
- Soporte de idioma limitado al ingles (en) segun los metadatos del repositorio.
- Soporte de *tool calling*, agentes, razonamiento multi-paso, vision general, audio o modo *thinking*: no disponible; el pipeline declarado es exclusivamente video-to-video.

## Casos de uso

- Produccion audiovisual con personajes recurrentes: se genera una hoja de referencia del personaje y el adaptador la aplica en cada plano de video-to-video, evitando la deriva de identidad entre tomas que obliga a correcciones manuales.
- Previsualizacion de storyboards animados: a partir de un boceto o video base y una hoja de referencia, se obtienen planos previos coherentes con el diseno de personaje aprobado antes de entrar en produccion final.
- Publicidad y contenido de marca: se fija la apariencia de un producto o mascota corporativa mediante la referencia y se transforman planos de video manteniendo ese elemento estable entre escenas.
- Creacion de contenido para redes sociales con avatares consistentes: se define una referencia de personaje y se generan variaciones de video conservando la identidad en toda la serie de publicaciones.
- Video-to-video de estilizado controlado: se transforma metraje existente aplicando un tratamiento visual y una referencia de personaje concreta, util para remasterizaciones o cambios de reparto.
- Prototipado rapido en estudios de animacion: iteracion sobre variantes de personaje y de escena con coste de computo menor que el de reentrenar o ajustar el modelo base completo.
- Investigacion en consistencia de difusion de video: sirve como referencia para estudiar el condicionamiento en contexto aplicado a la coherencia de identidad a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,4 GB, por lo que el requisito real de VRAM lo determina el modelo base Lightricks/LTX-2.5.
- Estimacion orientativa para el modelo base de 22 000 millones de parametros: en bf16/fp16 los pesos suponen del orden de 44 GB, a los que hay que sumar el codificador de texto, el VAE de video y las activaciones del proceso de difusion, lo que en la practica exige GPUs de 48-80 GB (A100 80 GB, H100 80 GB, o configuraciones multi-GPU).
- En cuantizacion de 8 bits la huella de pesos baja aproximadamente a 22 GB, lo que puede permitir ejecucion en GPUs de 24-32 GB (por ejemplo RTX 3090, RTX 4090, A6000) segun el margen que requieran las activaciones y la resolucion y duracion del video.
- Ejecucion en GPU de consumo: no confirmada en la informacion disponible; con cuantizacion agresiva y resoluciones reducidas podria ser viable en tarjetas de 24 GB, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no disponible. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tratarse de un modelo de difusion de video, las herramientas habituales son las del ecosistema de difusion y las del propio modelo base.
- Latencia y throughput estimados: no disponible.
- El acceso al repositorio esta restringido (gated) y requiere aceptar las condiciones en HuggingFace antes de la descarga, incluso para pruebas.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables en la documentacion proporcionada. La unica comparacion posible con los datos disponibles es contra el modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-Ingredients | No disponible para el adaptador (1,4 GB); 22b en el modelo base | No disponible | ltx-2.x-community-license | HuggingFace, acceso restringido (gated), 95 descargas y 10 likes en el momento de la consulta |
| Lightricks/LTX-2.5 (modelo base) | 22b segun el identificador | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: es un repositorio *gated*, por lo que la descarga y el uso requieren aceptar previamente las condiciones en HuggingFace.
- Licencia *ltx-2.x-community-license*: no es una licencia de codigo abierto estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones de escala, atribucion o redistribucion.
- Dependencia del modelo base: el adaptador solo funciona junto con Lightricks/LTX-2.5 y queda sujeto a los cambios y a las limitaciones de dicho modelo.
- Idioma: los metadatos declaran unicamente soporte de ingles (en), lo que limita prompts y descripciones en otros idiomas.
- Deriva de identidad: aunque el objetivo del adaptador es precisamente reducirla, no hay datos publicados sobre su tasa de exito en secuencias largas ni sobre el numero de planos a partir del cual la consistencia se degrada.
- Alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos o de escena incorrectos, especialmente en movimiento rapido, oclusiones o manos.
- Rendimiento y cuantizacion: no hay informacion publica sobre la perdida de calidad al cuantizar ni sobre configuraciones validadas de memoria.
- Madurez: con 95 descargas y 10 likes en el momento de la consulta, se trata de un artefacto reciente y con poca validacion por parte de la comunidad.
- Ausencia de benchmarks: no hay metricas objetivas publicadas que permitan estimar su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Organizacion del autor: https://huggingface.co/Lightricks
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados correspondian a servicios no relacionados). No se dispone de papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
