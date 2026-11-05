# RunningHubAI/rh-z-image-grey-and-black-spliced-bodysuit-with-purple-fishnet-garters-and-snake-print-stil-lora

## Resumen

rh-z-image-grey-and-black-spliced-bodysuit-with-purple-fishnet-garters-and-snake-print-stil-lora es un adaptador LoRA de texto a imagen publicado por RunningHubAI, una plataforma de alojamiento y entrenamiento de modelos generativos. El adaptador se ha entrenado sobre el modelo base Z-Image (según la model card, "finetuned from Z-Image") y está pensado para su uso en flujos de trabajo de ComfyUI y en la propia plataforma RunningHub. Su función es incorporar un estilo y una estética concretos —un body gris y negro con ligueros de rejilla morada y estampado de serpiente— a las generaciones del modelo base.

El repositorio es extremadamente ligero: contiene un único archivo de pesos de 81 MiB en formato safetensors, lo que es coherente con un adaptador LoRA de rango bajo más que con un modelo completo. La model card indica que la fuerza recomendada del LoRA es de 1.0 o superior, que está pensado para modelos Z-Image Turbo y que requiere una palabra de activación ("trigger word"): `NSFAAAA`. También enlaza un flujo de trabajo específico de RunningHub para obtener mejores resultados.

Se trata de un artefacto muy especializado y de nicho, orientado a la generación de imágenes de moda o estilizadas dentro del ecosistema ComfyUI/RunningHub. No es un modelo de lenguaje ni un modelo fundacional: no procesa texto ni razona, sino que modula el comportamiento de un generador de imágenes ya existente. La información pública disponible es mínima (sin métricas, sin detalles de entrenamiento ni licencia explícita), por lo que esta ficha se limita a documentar lo que el autor declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Z-Image (text-to-image) |
| Parametros totales | no disponible (archivo de pesos de 81 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion) |
| Tipos de cuantizacion | no disponible; pesos en safetensors |
| Idiomas soportados | no disponible (las indicaciones de texto dependen del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`20260910-22759913.safetensors`, 81 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-Image para modificar su comportamiento sin reentrenar todos los pesos. La model card no detalla el rango del LoRA, las capas objetivo ni la configuración de entrenamiento. El modelo base declarado es Z-Image, y el autor indica que el adaptador está pensado para las variantes Z-Image Turbo.

No se especifica el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste fino supervisado, RLHF o DPO (ninguna de ellas es habitual en adaptadores LoRA de difusión). Tampoco se documenta el proceso de captura o etiquetado de las imágenes de referencia. La única indicación operativa es la palabra de activación `NSFAAAA` y la recomendación de usar una fuerza de LoRA de 1.0 o superior, junto con un flujo de trabajo concreto alojado en RunningHub.

## Capacidades

- Generación de imágenes de texto a imagen con una estética concreta: body gris y negro con ligeros de rejilla morada y estampado de serpiente.
- Modulación del modelo base Z-Image (incluidas las variantes Turbo) mediante un adaptador de bajo rango.
- Integración en flujos de trabajo de ComfyUI y en la plataforma RunningHub.
- Activación mediante la palabra clave `NSFAAAA`.
- Ajuste de intensidad del efecto mediante el parámetro de fuerza del LoRA (recomendado 1.0 o superior).
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, visión ni audio: es exclusivamente un adaptador de generación de imágenes.
- Capacidades multilingües: no disponibles; dependen del codificador de texto del modelo base.

## Casos de uso

- Generación de imágenes de moda o estilismo: el LoRA permite producir variaciones de un conjunto concreto (body, ligeros y estampado) manteniendo coherencia visual entre generaciones, útil para moodboards o previsualización de diseños.
- Prototipado rápido en ComfyUI: al ser un archivo de 81 MiB, se carga y descarga rápidamente y se puede encadenar con otros nodos del grafo para iterar sobre el estilo.
- Creación de contenido para redes o catálogos: combinado con el modelo Z-Image Turbo, permite generar lotes de imágenes con una estética consistente y tiempos de inferencia reducidos.
- Pruebas de concepto de estilización: sirve para evaluar cómo responde el modelo base a un adaptador de nicho antes de invertir en un ajuste fino mayor.
- Integración vía API de RunningHub: la plataforma ofrece endpoints para ejecutar el modelo de forma remota, lo que permite incorporarlo a pipelines de generación sin infraestructura propia.
- Experimentación educativa: útil para estudiar el efecto de la fuerza del LoRA y de las palabras de activación en la salida de un modelo de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en sí; depende enteramente del modelo base Z-Image y de su cuantización.
- El archivo de pesos ocupa 81 MiB, por lo que el requisito de almacenamiento es mínimo; el coste real lo determina el modelo base.
- GPU recomendadas: no disponibles. Al tratarse de un LoRA sobre un modelo de difusión, se beneficiaría de GPU con suficiente VRAM para el modelo base (gama consumer alta o profesional), pero el autor no especifica cifras.
- ¿Cabe en GPU consumer? No disponible; depende del modelo base y de la resolución de generación.
- Opciones de despliegue: ComfyUI, la plataforma RunningHub (incluida su API) y, en general, cualquier runtime que cargue LoRA en safetensors sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables del mismo autor o sobre el mismo modelo base con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia no está especificada; la model card remite a la licencia del proyecto original (Z-Image), por lo que el uso comercial debe verificarse con dicha licencia antes de cualquier despliegue en producción.
- No hay información sobre sesgos; al ser un adaptador de estética concreta, puede reproducir sesgos presentes en el dataset de entrenamiento y en el modelo base.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías, texturas o detalles inconsistentes, especialmente con fuerzas de LoRA altas.
- El efecto está ligado a la palabra de activación `NSFAAAA`; sin ella, el adaptador puede no activarse o hacerlo de forma parcial.
- Requiere el modelo base Z-Image (preferiblemente variantes Turbo) y un flujo de trabajo compatible; no es autónomo.
- No hay documentación sobre el dataset, el rango del LoRA ni las capas entrenadas, lo que dificulta evaluar su robustez o generalización.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del resultado.
- La model card incluye enlaces promocionales y códigos de invitación de RunningHub; conviene tratarlos como material comercial y no como documentación técnica.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-z-image-grey-and-black-spliced-bodysuit-with-purple-fishnet-garters-and-snake-print-stil-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2097863106721869826
- Página del autor: https://www.runninghub.ai/user-center/1931299605898764290
- Flujo de trabajo recomendado: https://www.runninghub.ai/post/1993873213671358466/
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (en el propio repositorio)
