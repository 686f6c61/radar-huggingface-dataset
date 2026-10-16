# RunningHubAI/rh-multi-person-generation-lora

## Resumen

rh-multi-person-generation-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face. Su función es insertar o generar varias personas dentro de una escena ya existente, a partir de una instrucción textual: el ejemplo que da el propio autor es introducir "una familia cálida de tres miembros" en una fotografía. Se distribuye como un único archivo de pesos safetensors de 225 MiB (`多模特-完成.safetensors`) dentro de un repositorio de 0,2 GB.

El adaptador está afinado a partir de Qwen-Edit-2509, un modelo base de edición de imagen, y se etiqueta con el pipeline `image-text-to-image`. No es un modelo de lenguaje: no genera texto ni código, sino que modifica imágenes condicionado por una instrucción. Su integración está pensada para ComfyUI, RunningHub y Hugging Face, y el autor publica un tutorial en vídeo en Bilibili con un ejemplo de prompt.

La relevancia de esta ficha es limitada en términos de datos verificables: el repositorio no incluye licencia explícita, idiomas soportados, parámetros del modelo base ni resultados de benchmarks. Tanto las descargas como los "likes" figuran a cero en el momento de la consulta, y el autor remite al proyecto original en RunningHub para el uso y la atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Qwen-Edit-2509; no disponible el detalle de la arquitectura interna del base |
| Parametros totales | no disponible (adaptador LoRA; el archivo de pesos ocupa 225 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto; no aplica en el sentido habitual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que el copyright permanece con el autor y que se debe seguir la licencia del proyecto original o del upstream) |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion de imagen |
| Pipeline | image-text-to-image |
| Modelo base | Qwen-Edit-2509 |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Autor | RunningHub, en nombre del usuario @视觉夬物 |
| Fecha de creacion | 2026-10-16 |
| Fecha de actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a un modelo base congelado para especializarlo en una tarea concreta. En este caso el base es Qwen-Edit-2509, un modelo de edición de imagen sobre el que este LoRA introduce la capacidad de generar o insertar múltiples personas en una escena. El repositorio no especifica el rango del adaptador, las capas objetivo ni el régimen de precisión de los pesos.

No hay información publicada sobre el conjunto de datos de entrenamiento, el número de pasos, el uso de técnicas de alineación (RLHF, DPO u otras), ni sobre innovaciones técnicas concretas. La model card se limita a indicar el base de partida, el archivo de pesos y un enlace a un tutorial y a un prompt de ejemplo. Cualquier detalle adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Edición de imagen guiada por texto: permite modificar una imagen de entrada siguiendo una instrucción en lenguaje natural.
- Generación de múltiples personas dentro de una escena existente, que es la especialidad declarada del adaptador.
- Compatibilidad con flujos de ComfyUI, lo que permite encadenarlo con otros nodos de muestreo, control y postprocesado.
- Ejecución en la plataforma RunningHub, tanto en su versión internacional como en la china.
- Carga directa desde Hugging Face como adaptador sobre el modelo base Qwen-Edit-2509.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; el prompt de ejemplo está en inglés y el tutorial en chino, pero no se documenta el conjunto de idiomas admitidos.
- Capacidades especiales adicionales (visión, audio, modo de razonamiento): no disponibles.

## Casos de uso

- Retoque fotográfico de grupo: añadir o reemplazar personas en una fotografía ya tomada, indicando en el prompt cuántas personas y en qué disposición aparecen, gracias a que el LoRA está especializado en generar varios sujetos en la misma escena.
- Fotografía publicitaria con modelos: componer una imagen de campaña con dos o tres modelos dentro de un mismo decorado, partiendo de una foto de producto o de localización.
- Ilustración de eventos familiares: generar escenas tipo "familia de tres" o reuniones, tal y como propone el autor en su ejemplo, para material de felicitaciones o recuerdos.
- Creación de contenido para redes sociales: producir variantes de una imagen con distintas composiciones de personas sin repetir sesiones fotográficas.
- Previsualización de estilismo y vestuario: insertar varias figuras en un escenario para validar paletas, poses y encuadres antes de una producción real.
- Composición de personajes en proyectos de ilustración o cómic: integrar varios personajes en una viñeta manteniendo una iluminación y un estilo coherentes con la imagen base.
- Automatización de pipelines de edición en ComfyUI: encadenar este LoRA con otros nodos para procesar lotes de imágenes con instrucciones de texto parametrizadas.
- Prototipado rápido para equipos de diseño: obtener borradores con múltiples personas en cuestión de minutos antes de pasar a herramientas de edición manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La VRAM efectiva depende del modelo base Qwen-Edit-2509 y de su cuantización, no del adaptador LoRA, que solo añade 225 MiB de pesos.
- GPU recomendadas: no disponible en la informacion proporcionada; no se documentan modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse sin conocer los requisitos del modelo base.
- Opciones de despliegue: ComfyUI (flujo nativo del adaptador), la plataforma RunningHub y carga desde Hugging Face junto al modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| rh-multi-person-generation-lora | LoRA de edicion de imagen | Qwen-Edit-2509 | no aplica | no disponible | no disponible |
| RunningHubAI/rh-lora | LoRA (comfyui) | no disponible | no aplica | no disponible | no disponible |
| RunningHubAI/rh-1-lora | LoRA de image-text-to-image | no disponible | no aplica | no disponible | no disponible |

No se dispone de modelos comparables con datos publicados de parametros, contexto o rendimiento en la informacion proporcionada. Las alternativas listadas comparten plataforma y formato de distribucion, pero no se han publicado metricas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card indica que el copyright pertenece al autor y que debe respetarse la licencia del proyecto original o del upstream, por lo que el uso comercial no queda claro sin consultar esas condiciones.
- Sin datos de rendimiento: no hay benchmarks, evaluaciones cualitativas ni comparaciones publicadas, lo que impide estimar la calidad real del adaptador.
- Sin informacion sobre sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demografico ni estetico.
- Riesgo de alucinacion visual: como cualquier modelo generativo de imagen, puede producir anatomias incorrectas, manos deformes o incoherencias de iluminacion al insertar varias personas, y este riesgo crece con el numero de sujetos.
- Dependencia del modelo base: el adaptador solo funciona acoplado a Qwen-Edit-2509; no es util de forma autonoma y hereda las limitaciones de ese base.
- Idiomas no documentados: se desconoce si el condicionamiento textual funciona igual de bien en castellano que en ingles o chino, idiomas usados en los ejemplos del autor.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte de la comunidad ante problemas de integracion.
- Fechas de creacion y actualizacion inusuales (2026-10-16) tal y como figuran en los metadatos del repositorio.
- Produccion: al no haber versionado de releases, evaluación reproducible ni licencia clara, no se recomienda su uso en entornos de produccion sin una validacion previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-multi-person-generation-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1985512469403680769
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1985509672490774530
- Tutorial en Bilibili: https://www.bilibili.com/video/BV1h51qBqEqn/
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ficha de RunningHubAI/rh-lora: https://huggingface.co/RunningHubAI/rh-lora
- Ficha de RunningHubAI/rh-1-lora: https://huggingface.co/RunningHubAI/rh-1-lora/tree/main
