# RunningHubAI/rh-f2k-9b-anything-change-clothes-lora

## Resumen

rh-f2k-9b-anything-change-clothes-lora es un adaptador LoRA de bajo rango para generacion de imagen a partir de texto, publicado en Hugging Face por RunningHubAI bajo la autoria de la cuenta de RunningHub identificada como @KIWI. El adaptador se ha entrenado sobre el modelo base Flux2-Klein-9B, segun indica la propia model card, y su proposito declarado es el cambio de ropa sobre una imagen de referencia ("anything change clothes"), presentado por el autor como una transformacion universal todo en uno.

El repositorio pesa 0,2 GB e incluye un unico archivo de pesos en formato safetensors de 158 MiB, lo que corresponde al adaptador y no al modelo completo. La ficha del autor recomienda aplicar el LoRA con una fuerza (strength) de entre 0,5 y 0,7, y lo distribuye para su uso en ComfyUI, en la plataforma en la nube RunningHub y desde Hugging Face.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", con fecha de creacion y ultima actualizacion del 24 de septiembre de 2026, de modo que se trata de un artefacto sin validacion comunitaria publica. No hay informacion sobre licencia, idiomas, dataset de entrenamiento, rango del LoRA ni benchmarks, por lo que la evaluacion practica exige probarlo directamente sobre el modelo base compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Adaptador LoRA (low-rank adaptation) sobre un modelo de difusion text-to-image; el modelo base indicado es Flux2-Klein-9B |
| Parametros totales | No disponible para el adaptador. El nombre y la model card apuntan a un modelo base de 9B de parametros |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: es un modelo de difusion text-to-image, no un modelo de lenguaje con ventana de tokens |
| Tipos de cuantizacion | No disponible. El unico formato publicado es safetensors sin cuantizar |
| Idiomas soportados | No disponibles. La model card no especifica idiomas de prompt |
| Licencia | No disponible. La model card indica que se publica en nombre del autor, que los derechos siguen siendo suyos y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (un unico archivo de adaptador LoRA) |
| Modelo base | Flux2-Klein-9B |
| Tamano del adaptador | 158 MiB (archivo `f2k_9b_anything change clothes.safetensors`) |
| Tamano del repositorio | 0,2 GB |
| Fuerza recomendada | 0,5 - 0,7 |
| Tarea declarada | text-to-image, cambio de ropa |
| Plataformas soportadas | ComfyUI, RunningHub (nube y API), Hugging Face |
| Autor | RunningHub @KIWI (publicado por RunningHubAI) |
| Idiomas de la documentacion | Ingles y chino (README.md y README_cn.md) |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un LoRA de text-to-image afinado a partir de Flux2-Klein-9B. No se detalla el rango del adaptador, las capas objetivo (atencion, proyecciones o bloques de transformer de difusion), el optimizador, la tasa de aprendizaje, el numero de pasos ni el tamano del dataset utilizado. Tampoco se indica si el entrenamiento incluyo condicionamiento por mascara, por imagen de referencia o por pares imagen-prenda, que son los esquemas habituales en tareas de cambio de ropa.

El unico parametro de inferencia documentado es la fuerza de aplicacion del adaptador, entre 0,5 y 0,7, lo que sugiere que el autor ha calibrado el peso del LoRA para no saturar la imagen generada ni destruir la identidad del sujeto original. Se menciona que el modelo se puede entrenar tambien en RunningHub, lo que apunta a que el flujo de entrenamiento se realizo en esa plataforma, pero no se publican detalles tecnicos del mismo.

No hay informacion sobre si el adaptador depende de la version concreta del base Flux2-Klein-9B, ni sobre incompatibilidades con otras variantes de la familia. Cualquier uso en produccion deberia validar primero la compatibilidad con la revision exacta del modelo base disponible en el momento de la integracion.

## Capacidades

- Generacion de imagen a partir de texto con el modelo base Flux2-Klein-9B, modificada por el adaptador LoRA.
- Cambio de ropa sobre un sujeto: la funcionalidad declarada en el nombre del modelo es sustituir la vestimenta de una persona en una imagen manteniendo el resto de la escena.
- Transformacion "todo en uno" universal, segun la propia descripcion del autor, sin que se detallen los dominios concretos cubiertos.
- Control de intensidad de la edicion mediante el parametro de fuerza (0,5 - 0,7).
- Integracion en flujos de ComfyUI como nodo de carga de LoRA dentro de un pipeline de difusion.
- Ejecucion en la nube a traves de RunningHub, tanto en la interfaz como mediante API.
- No se documenta soporte de tool calling ni de function calling: no aplica a un modelo de difusion.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas de prompt admitidos.
- No se documentan capacidades de vision mas alla del propio condicionamiento de imagen inherente a la tarea de generacion.
- No se documenta modo de razonamiento (thinking), audio, video ni otras modalidades.

## Casos de uso

- Catalogos de moda a escala: generar variantes de una misma prenda sobre un modelo base de forma automatizada en ComfyUI, reduciendo la necesidad de sesiones fotograficas por cada combinacion de color o tallaje. El LoRA permite mantener al sujeto mientras cambia la ropa.
- Probador virtual en aplicaciones de comercio electronico: el usuario sube una foto propia y el sistema aplica una prenda concreta del catalogo. La fuerza recomendada de 0,5-0,7 ayuda a conservar los rasgos faciales y la pose original.
- Previsualizacion de vestuario en produccion audiovisual: antes de confeccionar o alquilar vestuario, el equipo puede generar pruebas visuales de como quedaria cada opcion sobre el actor o sobre un doble digital.
- Contenido para redes sociales y marketing: creacion de variaciones de un mismo personaje con distintas prendas para campanas estacionales, manteniendo coherencia visual entre piezas de una misma serie.
- Prototipado rapido de diseno textil: aplicar un patron o una paleta de color sobre una prenda base para validar decisiones de diseno antes de fabricar muestras fisicas.
- A/B testing creativo en publicidad: generar multiples versiones de un anuncio con vestuario distinto a partir de la misma imagen de partida, y medir su rendimiento, con un coste marginal bajo frente a una produccion fotografica tradicional.
- Personalizacion de avatares: en plataformas de creacion de personajes, permitir al usuario cambiar el atuendo de su avatar manteniendo la identidad visual entre sesiones.
- Automatizacion mediante API: integracion del flujo en un backend a traves de la API de RunningHub para procesar lotes de imagenes de forma programatica, sin depender de una interfaz grafica.
- Restauracion o retoque de fotografia de moda: recolocar o sustituir prendas en imagenes ya publicadas cuando no es posible repetir la sesion original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP-score, similitud de identidad, calidad de generacion, tiempo de inferencia) ni comparaciones cuantitativas con otros adaptadores de cambio de ropa.

## Requisitos de hardware

- El adaptador ocupa 158 MiB en disco, por lo que su coste de VRAM adicional es marginal frente al modelo base.
- La inferencia requiere cargar Flux2-Klein-9B completo, de 9B de parametros segun la informacion disponible. Las cifras siguientes son estimaciones orientativas a partir de ese tamano y no estan confirmadas por el autor.
- Estimacion en bf16/fp16: en torno a 18 GB solo para los pesos del modelo base, mas activaciones y VAE, lo que situa el requisito practico del orden de 20-24 GB de VRAM.
- GPU con margen suficiente: A100 (40 GB y 80 GB), H100, L40S, RTX 6000 Ada y, en el segmento de consumo, RTX 4090 o RTX 5090 con 24 GB o mas.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 5060 Ti 16 GB): probablemente viables solo con el modelo base en fp8 o en formato GGUF cuantizado. No se confirma que existan dichos formatos para este base concreto.
- GPU de 8-12 GB: uso poco realista en local sin cuantizacion agresiva; se recomienda la via en la nube.
- Opciones de despliegue: ComfyUI como entorno principal, plataforma y API de RunningHub para ejecucion gestionada, y Hugging Face para la distribucion de pesos.
- vLLM, llama.cpp, Ollama y TGI no aplican: son runtimes de modelos de lenguaje y este artefacto es un adaptador de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada: no hay cifras de benchmarks, licencia, contexto ni rendimiento de alternativas. A continuacion se compara el enfoque de uso, no modelos concretos, de forma cualitativa.

| Enfoque | Parametros | Formato | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador LoRA sobre Flux2-Klein-9B | Adaptador, tamano no disponible; base de 9B | safetensors | No disponible | No disponible, remite al proyecto upstream | Hugging Face, ComfyUI, RunningHub |
| Ajuste fino completo del modelo base para cambio de ropa | 9B o superior | safetensors u otros | No disponible | Depende del modelo base | Requiere entrenamiento propio |
| API propietaria de probador virtual | No publico | No aplica | No disponible | Comercial, sujeta a contrato | Servicio gestionado |
| Otros LoRA de cambio de ropa para bases de difusion abiertas | Adaptadores de rango bajo | safetensors / GGUF | No disponible | Variable segun autor | Hugging Face y repositorios de terceros |

## Limitaciones y advertencias

- Licencia no disponible: la model card no concede una licencia explicita, indica que los derechos siguen siendo del autor y remite a la licencia del proyecto original. El uso comercial no esta garantizado y debe aclararse con el autor o con RunningHub antes de integrarlo en un producto.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, fidelidad de identidad ni robustez del cambio de ropa.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, con lo que no existen informes de terceros sobre su comportamiento real.
- Dependencia estricta del modelo base: al ser un LoRA entrenado sobre Flux2-Klein-9B, aplicarlo sobre otra variante o revision puede degradar el resultado o romper por completo la edicion.
- Riesgo de artefactos: los adaptadores de vestuario suelen fallar en manos, cuellos, bordes de prendas, transparencias, estampados con texto y en composiciones con varias personas o cuerpos parcialmente ocluidos.
- Sesgos potenciales: no se documenta la composicion del dataset de entrenamiento, por lo que se desconocen los sesgos de representacion en tipo de cuerpo, tono de piel, genero, edad o estilo de vestimenta.
- Alucinacion visual: el modelo puede inventar pliegues, logotipos, botones o texturas no presentes en la prenda de referencia, algo inherente a los modelos generativos.
- Limitaciones de idioma: no se especifica en que idiomas acepta los prompts ni si hay soporte mas alla del ingles.
- Sin informacion sobre filtros de seguridad: no se indica si el modelo base o el flujo de RunningHub aplican moderacion de contenido, lo que es relevante si se expone a usuarios finales.
- Trazabilidad de datos: se desconoce el origen de las imagenes de entrenamiento y si existio consentimiento para el uso de rostros o imagenes personales.
- Caveat de produccion: al ser un artefacto de 2026 con muy poca difusion, conviene fijar una revision concreta del repositorio y validar resultados antes de depender de el en un pipeline automatizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-f2k-9b-anything-change-clothes-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2018949931876225026
- Pagina del autor (@KIWI) en RunningHub: https://www.runninghub.cn/user-center/1897619470951800834
- Plataforma RunningHub internacional: https://www.runninghub.ai
- Plataforma RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ficha de API de Seedance 2.5 citada en la model card: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: https://huggingface.co/RunningHubAI/rh-f2k-9b-anything-change-clothes-lora/blob/main/README_cn.md
