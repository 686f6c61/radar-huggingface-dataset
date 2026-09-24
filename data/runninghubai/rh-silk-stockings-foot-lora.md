# RunningHubAI/rh-silk-stockings-foot-lora

## Resumen

rh-silk-stockings-foot-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face, atribuido al usuario de RunningHub @氛围感. Se trata de un adaptador de bajo rango (218 MiB) afinado a partir del modelo base "krea2", pensado para su uso en flujos de trabajo de ComfyUI con la etiqueta de pipeline image-text-to-image. Su función es inyectar un concepto visual muy concreto (medias de seda y pies) en un modelo de difusión preentrenado, sin necesidad de reentrenar los pesos completos del modelo base.

El repositorio es puramente un contenedor de pesos: no incluye informe técnico, dataset de entrenamiento, resultados de evaluación ni especificación de licencia. El único artefacto publicado es el fichero `pantyhose_footjob_Krea_2_epoch_20.safetensors`, cuyo nombre sugiere un entrenamiento de 20 épocas. La model card recomienda aplicar el adaptador con una intensidad de entre 0,6 y 1,0, un rango típico en LoRAs de concepto que busca equilibrar la adherencia al estilo aprendido con la fidelidad al prompt y al modelo base.

Su relevancia es acotada y de nicho: resulta útil para quien necesite replicar ese concepto visual concreto dentro de un pipeline ComfyUI o vía la API de RunningHub, y como ejemplo de adaptador de bajo rango de distribución ligera (repo de 0,2 GB). No aporta innovación arquitectónica, no publica métricas y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que carece de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; se trata de un adaptador LoRA de bajo rango sobre un modelo base de difusion identificado como "krea2" |
| Parametros totales | no disponible (el adaptador pesa 218 MiB; no se detallan los parametros del modelo base ni el rango del LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible la resolucion nativa soportada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no especifica idiomas para los prompts) |
| Licencia | no disponible (la model card indica "Follow the original project or upstream license", sin concretar) |
| Formato de pesos | safetensors (`.safetensors`) |
| Nombre del modelo | rh-silk-stockings-foot-lora |
| Tipo de modelo | LoRA de edicion de imagen |
| Modelo base | krea2 (finetuned from: krea2) |
| Fichero publicado | `pantyhose_footjob_Krea_2_epoch_20.safetensors`, 218 MiB |
| Tamano del repositorio | 0,2 GB |
| Fuerza de LoRA recomendada | 0,6 a 1,0 |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Autor original | RunningHub-@氛围感 |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del adaptador. Por el tipo de artefacto y la etiqueta `lora`, se trata de una descomposicion de bajo rango (Low-Rank Adaptation) aplicada sobre las capas de un modelo de difusion base denominado "krea2", que no se describe en la model card. El unico dato de entrenamiento inferible es el nombre del fichero de pesos, `pantyhose_footjob_Krea_2_epoch_20.safetensors`, que apunta a un entrenamiento de 20 epocas sobre el concepto "pantyhose footjob". No se indica el numero de imagenes del dataset, su composicion, la resolucion de entrenamiento, el learning rate, el optimizador ni si se aplicaron tecnicas de regularizacion o de captioning.

Tampoco se documenta ninguna innovacion tecnica: no hay decodificacion especulativa, atencion lineal, destilacion ni mecanismos de control adicionales. El adaptador se limita a modificar el comportamiento del modelo base durante la generacion, actuando sobre el prompt y, presumiblemente, sobre imagenes de entrada, dado que el pipeline declarado es image-text-to-image. La unica guia de uso publicada es el rango de intensidad recomendado (0,6-1,0), que en la practica controla el peso del adaptador frente a los pesos del modelo base.

## Capacidades

- Generacion de imagenes condicionada por prompt de texto (image-text-to-image) con el concepto visual aprendido: medias de seda y pies.
- Edicion o modificacion de imagenes existentes dentro de un flujo image-text-to-image, segun la etiqueta de pipeline declarada.
- Integracion directa como nodo LoRA en flujos de trabajo de ComfyUI.
- Ajuste de intensidad del concepto mediante el parametro de fuerza del LoRA en el rango 0,6-1,0.
- Ejecucion en la nube a traves de la plataforma RunningHub y su API, sin necesidad de infraestructura local.
- Publicacion como pesos safetensors, compatibles con las herramientas habituales de carga de LoRAs.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada arbitraria, audio ni modo de razonamiento: son capacidades ajenas a este tipo de modelo.

## Casos de uso

- Catalogo de producto para calceteria y lenceria: generar imagenes de medias sobre modelos virtuales en distintas poses y encuadres para fichas de e-commerce, evitando sesiones fotograficas para cada variante de producto.
- Previsualizacion de diseno de producto: un disenador de calceteria puede aplicar el LoRA para ver como queda un tejido, un patron o un acabado antes de fabricar la muestra fisica.
- Retoque y sustitucion de prenda en fotografia existente: partiendo de una imagen de entrada, el pipeline image-text-to-image permite incorporar o cambiar la media en una toma ya realizada, reduciendo coste de postproduccion.
- Contenido editorial de nicho para adultos: produccion de fotografia de moda fetichista o editorial alternativa, siempre con verificacion de edad de la audiencia y cumplimiento de la normativa aplicable.
- Produccion por lotes automatizada: uso de la API de RunningHub para encolar generaciones a escala dentro de un pipeline de ComfyUI, con el LoRA cargado como nodo y una fuerza fija de 0,8, por ejemplo.
- Investigacion sobre adaptadores de bajo rango: estudio empirico de como 20 epocas de entrenamiento y un rango de fuerza de 0,6-1,0 afectan a la adherencia al concepto y a la degradacion del prompt en un modelo base tipo difusion.
- Aumento de datos para dominios estilisticos concretos: generar variaciones sinteticas de un concepto visual muy especifico para ampliar un dataset de entrenamiento o de validacion.
- Pruebas de sesgo y seguridad en generacion de imagenes: analisis de como un adaptador de nicho condiciona la representacion corporal, la composicion de la escena y la diversidad de los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud con imagenes de referencia, evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores. Tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- El adaptador en si ocupa 218 MiB, por lo que su huella de memoria es despreciable frente a la del modelo base.
- La VRAM total necesaria la determina el modelo base "krea2" y su esquema de cuantizacion, dato que no se especifica en la informacion disponible.
- No se confirma en que GPU consumer puede ejecutarse; depende por completo de la eleccion y cuantizacion del modelo base.
- Opciones de despliegue confirmadas: ComfyUI (local, con el modelo base cargado) y la plataforma en la nube RunningHub, incluida su API.
- El modelo no es compatible con servidores de inferencia de texto como vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada datos verificables sobre otros adaptadores LoRA comparables (parametros, contexto, rendimiento, licencia o disponibilidad) que permitan una comparacion rigurosa. La unica referencia externa citada en la model card es la publicacion original en Civitai del mismo concepto (`pantyhose-footjob-krea-2`), que corresponde al origen del adaptador y no a una alternativa independiente.

## Limitaciones y advertencias

- Contenido para adultos: el concepto entrenado pertenece a la categoria de contenido fetichista o para adultos; su publicacion y uso deben cumplir la normativa de edad y las condiciones de servicio de la plataforma donde se despliegue.
- Licencia no especificada: la model card remite a la licencia del proyecto original o del modelo base sin concretarla, por lo que no puede confirmarse que el uso comercial este permitido. Es imprescindible verificar la licencia en el repositorio de origen en Civitai y la del modelo base krea2 antes de cualquier uso en produccion.
- Ausencia de validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones publicas que permitan juzgar su calidad o estabilidad.
- Riesgo de sobreajuste: el nombre del fichero sugiere 20 epocas de entrenamiento sin datos sobre regularizacion, lo que puede provocar rigidez del concepto, aparicion de artefactos o dificultad para combinarlo con otros LoRAs.
- Dependencia del modelo base: el comportamiento, la calidad y la fidelidad al prompt dependen enteramente de "krea2" y de su version concreta; un emparejamiento incorrecto del modelo base puede degradar el resultado o impedir la carga de los pesos.
- Sesgos potenciales: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que se desconoce la diversidad de cuerpos, tonos de piel, iluminaciones y encuadres representados.
- Riesgo de uso indebido: como cualquier modelo de generacion de imagen, puede emplearse para crear contenido sexual no consentido o deepfakes de personas reales. Es responsabilidad del usuario aplicar filtros, marcas de agua y verificaciones previas.
- Ausencia de benchmarks: no existen metricas publicadas que permitan estimar la calidad esperada de forma objetiva.
- Idiomas de los prompts: no especificados; si el entrenamiento se hizo con descripciones en un unico idioma, el rendimiento con prompts en otros idiomas puede ser peor.
- Alcance limitado: es un adaptador de concepto unico, no un modelo generalista; no sirve para tareas de texto, codigo, matematicas, razonamiento ni agentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-silk-stockings-foot-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2093569589322366978
- Publicacion de origen en Civitai: https://civitai.red/models/2897994/pantyhose-footjob-krea-2?modelVersionId=3276497
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
