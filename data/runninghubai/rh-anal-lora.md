# RunningHubAI/rh-anal-lora

## Resumen

rh-anal-lora es un adaptador LoRA de edicion de imagenes publicado por RunningHubAI en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional entrenado desde cero: se trata de un unico fichero de pesos de bajo rango (`anal_helper_krea2_loraholic.safetensors`, 27 MiB) que se aplica sobre un modelo base de generacion/edicion de imagenes. La model card lo clasifica como "LoRA (image edit)" con pipeline `image-text-to-image` y declara "Finetuned from: krea2", sin mas detalle sobre el modelo base exacto.

El modelo procede de una publicacion original en Civitai (`anal-helper-krea2`) y RunningHub lo redistribuye en nombre del autor, cuyo perfil enlaza en la propia tarjeta. Su tematica es contenido para adultos: el repositorio lleva la etiqueta `not-for-all-audiences`, por lo que no es apto para uso general ni para entornos sin control de acceso.

En el momento de la consulta el repositorio presenta 0 descargas y 0 "likes", con un tamano de repo declarado de 0.0 GB frente a los 27 MiB del unico fichero listado. Su relevancia practica es la de ejemplo del flujo de publicacion y consumo de adaptadores LoRA en el ecosistema ComfyUI / RunningHub, incluyendo despliegue mediante API hospedada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de generacion/edicion de imagenes; la model card indica "Finetuned from: krea2". Rango, matrices objetivo y detalles de la arquitectura del modelo base: no disponibles |
| Parametros totales | no disponible (solo se publica el tamano del fichero: 27 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un adaptador de difusion; la ventana de texto depende del modelo base) |
| Tipos de cuantizacion | no disponible; se distribuye un unico fichero `.safetensors` sin indicar la precision (fp16/bf16 u otra) |
| Idiomas soportados | no disponibles (los prompts dependen del modelo base y del text encoder que se use) |
| Licencia | no disponible como licencia explicita; la model card remite a "the original project or upstream license" y mantiene el copyright del autor |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion de imagenes (image edit) |
| Modelo base declarado | krea2 |
| Tamano del fichero | 27 MiB (`anal_helper_krea2_loraholic.safetensors`) |
| Tamano del repositorio | 0.0 GB segun metadatos de Hugging Face (discrepante con el fichero listado) |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Etiquetas | comfyui, lora, image-text-to-image, region:us, not-for-all-audiences |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-24T02:46:00.000Z |
| Ultima actualizacion (metadatos) | 2026-09-24T10:19:01.000Z |

## Arquitectura y entrenamiento

La informacion disponible no describe ninguna arquitectura propia: se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base congelado para modificar su comportamiento sin reentrenarlo por completo. La model card solo aporta el campo "Finetuned from: krea2" y la clasificacion como "LoRA (image edit)"; no se especifican el modelo base exacto, el rango del adaptador, las capas afectadas, la precision de los pesos ni el framework de entrenamiento empleado.

Tampoco hay informacion sobre datos de entrenamiento: no se indica el numero de imagenes o pasos, la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO u otras, que por otra parte no son habituales en adaptadores de difusion) ni si hubo regularizacion, captions automaticos o entrenamiento con mascaras de edicion. La unica referencia procedimental es un enlace generico a la plataforma de entrenamiento de RunningHub ("Train models on RunningHub"). Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Edicion de imagenes mediante prompt de texto e imagen de entrada (pipeline declarado `image-text-to-image`).
- Aplicacion como adaptador LoRA sobre el modelo base `krea2` dentro de un flujo de ComfyUI, segun los tags y las plataformas indicadas.
- Modificacion de contenido orientado a adultos (etiqueta `not-for-all-audiences`), presumiblemente orientada a escenas de tipo "anal helper" segun el nombre del fichero y del proyecto original.
- Uso combinado con otros componentes del ecosistema ComfyUI (checkpoints, VAE, text encoders, nodos de control), aunque no se documenta compatibilidad concreta con ninguno.
- Ejecucion remota a traves de la API hospedada de RunningHub, sin necesidad de infraestructura local.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision como analizador de imagenes, audio, modo "thinking" ni capacidades multilingues explicitas de texto: no disponibles.
- No hay evidencia de que el adaptador funcione con modelos base distintos de `krea2`.

## Casos de uso

- Edicion de imagenes en ComfyUI: cargar el LoRA junto al modelo base `krea2` en un grafo de `image-text-to-image` para aplicar el estilo o la transformacion concreta del adaptador sobre una imagen de partida.
- Generacion por lotes en la nube: ejecutar el flujo a traves de la API de RunningHub para procesar volumenes de imagenes sin mantener GPU propia, pagando por uso.
- Experimentacion con adaptadores de bajo rango: usar el fichero como caso de estudio de LoRA de 27 MiB para analizar como un adaptador pequeno modifica el comportamiento de un modelo base de difusion.
- Fusion o apilado de LoRAs: combinarlo con otros adaptadores del mismo modelo base para explorar mezclas de estilo, siempre que las licencias implicadas lo permitan.
- Publicacion de contenido para adultos con verificación de edad: integracion en una plataforma que exija control de acceso y cumplimiento normativo, dado el marcado `not-for-all-audiences`.
- Investigacion sobre moderacion y filtrado: emplear el adaptador como muestra de contenido NSFW para probar clasificadores, filtros de prompts o sistemas de deteccion en pipelines de generacion.
- Pruebas de reproducibilidad de pesos alojados en terceros: verificar que el fichero redistribuido en Hugging Face coincide con el original publicado en Civitai, util en auditorias de cadena de suministro de modelos.
- Docencia tecnica sobre ecosistema de difusion: ilustrar, en un entorno controlado y con acceso restringido, como se distribuyen y consumen adaptadores LoRA fuera de los repositorios de modelos fundacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de imagen (FID, CLIP score, similitud con la imagen de entrada), comparativas con otros adaptadores ni datos de velocidad de inferencia. Los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo: los enlaces recuperados tratan de temas de cine, terminales y gramatica inglesa, sin ninguna conexion con `rh-anal-lora`.

| Benchmark | Resultado |
|---|---|
| Metricas de generacion/edicion de imagen | no disponible |
| Comparativas con otros LoRA | no disponible |
| Throughput o latencia medidos | no disponible |

## Requisitos de hardware

- El adaptador en si ocupa 27 MiB, por lo que su sobrecoste de VRAM es despreciable frente al modelo base.
- La VRAM necesaria depende integramente del modelo base `krea2` y del text encoder empleado, datos que no se especifican en la informacion disponible: no disponible.
- GPU recomendadas: no disponibles para este adaptador; dependen del modelo base y de la resolucion de trabajo.
- Viabilidad en GPU de consumo: no confirmada. Si el modelo base `krea2` cabe en una GPU de consumo (gama RTX con suficiente VRAM), el LoRA no cambiaria ese requisito de forma apreciable; sin datos del base no puede afirmarse.
- Opciones de despliegue: ComfyUI (local), plataforma y API de RunningHub (gestionada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusion.
- Latencia y throughput: no disponibles. En despliegue gestionado dependeran del hardware asignado por RunningHub y del flujo definido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base, por lo que no es posible establecer una comparacion cuantitativa fiable. La tabla siguiente resume lo unico contrastable (formato, tamano y estado de publicacion) frente a categorias genericas de alternativas.

| Modelo / categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-anal-lora | no disponible (fichero LoRA de 27 MiB) | no aplica | no disponible | no disponible (remite al proyecto original) | Hugging Face, ComfyUI, RunningHub; 0 descargas, 0 likes |
| Otros LoRA de edicion de imagen para el mismo base | no disponible | no aplica | no disponible | variable segun autor | habitualmente en Civitai y repositorios de terceros |
| Modelo base `krea2` | no disponible | no disponible | no disponible | no disponible | no especificado en la model card |

## Limitaciones y advertencias

- Contenido para adultos: el repositorio esta marcado `not-for-all-audiences`; no debe desplegarse en entornos accesibles a menores ni en productos de uso general sin control de edad.
- Licencia ambigua: no hay un fichero de licencia explicito y la model card remite a la licencia del proyecto original o upstream. Antes de cualquier uso comercial es imprescindible localizar y respetar los terminos del autor original en Civitai y del modelo base.
- Riesgo legal y de politicas de uso: el contenido generado puede infringir los terminos de servicio de plataformas de alojamiento, de proveedores cloud o la normativa aplicable en la jurisdiccion del usuario.
- Ausencia total de informacion de entrenamiento: no se conocen dataset, pasos de entrenamiento, composicion ni posibles sesgos aprendidos de las imagenes utilizadas.
- Sesgos: no documentados, pero al ser un adaptador entrenado sobre un dataset no descrito, puede reproducir sesgos de representacion y de estilo del material de origen.
- Artefactos y "alucinacion" visual: como cualquier LoRA de difusion, puede producir anatomia incorrecta, inconsistencias entre la imagen de entrada y la salida o fallos al seguir el prompt. No hay evaluaciones publicadas que cuantifiquen esta tasa de error.
- Dependencia estricta del modelo base: funciona con `krea2` segun la model card; no hay evidencia de compatibilidad con otros checkpoints y aplicarlo sobre otro base puede degradar los resultados o no tener efecto.
- Idiomas: no se especifica soporte idiomatico de los prompts; dependera del text encoder del modelo base y puede degradarse fuera del ingles.
- Metadatos inconsistentes o incompletos: el repo declara 0.0 GB frente a un fichero de 27 MiB, las fechas de creacion y actualizacion son de 2026, y no hay informacion de versionado, hash ni procedencia verificable mas alla del enlace a Civitai.
- Sin garantias de mantenimiento: 0 descargas y 0 likes en el momento de la consulta; el autor original es un usuario de plataforma y no hay evidencia de soporte, actualizaciones o correccion de errores.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-anal-lora
- Fichero de pesos: `anal_helper_krea2_loraholic.safetensors` (27 MiB, incluido en el repositorio anterior)
- README en chino referenciado en la model card: `README_cn.md` (mismo repositorio)
- Proyecto original en Civitai: https://civitai.red/models/2759414/anal-helper-krea2?modelVersionId=3105253
- Pagina del modelo en RunningHub: https://www.runninghub.ai/model/public/2074293741589975041
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API (detalle de Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Paper, blog tecnico o demo especificos del modelo: no disponibles
