# RunningHubAI/rh-all-encompassing-confucianism-lora

## Resumen

rh-all-encompassing-confucianism-lora es un adaptador LoRA de edición de imágenes (pipeline `image-text-to-image`) publicado en HuggingFace por la cuenta RunningHubAI en nombre del autor original, identificado en la model card como el usuario @氛围感. No es un modelo generativo completo: se trata de un ajuste fino de bajo rango que debe cargarse sobre el modelo base Krea 2, del cual hereda toda la arquitectura, el codificador de texto y la ventana de contexto. El repositorio ocupa 0,2 GB y contiene un único archivo de pesos, `Krea2TitJobNowV1.safetensors`, de 218 MiB.

La relevancia de esta ficha es fundamentalmente práctica y de ecosistema: ilustra el flujo típico de publicación de LoRAs en ComfyUI y RunningHub, donde el adaptador se distribuye por separado del modelo base y se activa mediante una palabra disparadora (`TitJobNow`). El nombre y la procedencia del modelo (enlaza a un modelo alojado en Civitai bajo el identificador 2821368) apuntan a contenido para adultos, lo que condiciona su uso en producción.

No se dispone de información pública sobre número de parámetros, composición del dataset de entrenamiento, idiomas soportados ni licencia concreta. La model card remite explícitamente a la licencia del proyecto original y mantiene los derechos de autor en manos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre el modelo base Krea 2 |
| Parametros totales | no disponible (adaptador; archivo de pesos de 218 MiB) |
| Parametros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye el archivo safetensors) |
| Idiomas soportados | no disponible (la comprensión del prompt depende del codificador de texto del modelo base) |
| Licencia | no disponible; RunningHub publica en nombre del autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`Krea2TitJobNowV1.safetensors`, 218 MiB) |
| Tipo de modelo | LoRA de edición de imagen |
| Modelo base | Krea 2 (finetuned from: krea2) |
| Palabra disparadora | TitJobNow |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Pipeline declarado | image-text-to-image |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Krea 2 para modificar su comportamiento sin reentrenar los pesos originales. No se publica en la información disponible ni el rango del adaptador, ni las capas objetivo, ni si se entrenó sobre atención, proyecciones de texto o bloques convolucionales. Tampoco se documenta el número de pasos de entrenamiento, el optimizador, la tasa de aprendizaje ni el tamaño del dataset.

La model card indica únicamente que el adaptador se ha afinado a partir de Krea 2 y que se activa con la palabra disparadora `TitJobNow`. No se mencionan técnicas de alineación (RLHF, DPO), decodificación especulativa ni innovaciones de atención. El pipeline declarado es `image-text-to-image`, lo que implica que la entrada combina una imagen de referencia y una instrucción textual, y la salida es una imagen editada o generada según esa instrucción.

## Capacidades

- Edición y generación de imágenes guiada por texto e imagen de entrada (pipeline `image-text-to-image`), condicionada al modelo base Krea 2.
- Aplicación de un estilo o concepto concreto mediante la palabra disparadora `TitJobNow`, que debe incluirse en el prompt para activar el efecto del adaptador.
- Integración en flujos de trabajo de ComfyUI como nodo LoRA sobre el modelo base.
- Ejecución en la plataforma RunningHub, tanto en su versión internacional como en la china, y a través de su API.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión analítica, audio ni modo de pensamiento; son funciones ajenas al propósito del adaptador.
- No se documentan capacidades multilingües propias; el idioma de los prompts depende del codificador de texto del modelo base.

## Casos de uso

- Edición de imagen por instrucción en ComfyUI: cargar Krea 2, aplicar este LoRA y escribir la palabra disparadora junto a la instrucción para obtener variaciones del concepto aprendido sobre una imagen de entrada.
- Pruebas de concepto en estudio de diseño: generar variantes rápidas de una composición antes de invertir tiempo en un render final, aprovechando que el adaptador pesa solo 218 MiB y se intercambia sin recargar el modelo base completo.
- Automatización por API en RunningHub: encadenar la llamada a la API con otros nodos del flujo para producir lotes de imágenes de forma programática desde un backend propio.
- Prototipado de pipelines de difusión: servir como caso de prueba para validar la integración de LoRAs externos en una infraestructura propia basada en ComfyUI.
- Investigación sobre adaptación de bajo rango: usar el adaptador como ejemplo reproducible de cómo un LoRA de 218 MiB modifica el comportamiento de un modelo base de imágenes, comparando salidas con y sin el adaptador.
- Filtrado y moderación de contenido: emplear el modelo como muestra de referencia en la evaluación de sistemas de clasificación de imágenes para adultos, dado el carácter del concepto entrenado.
- No se recomienda su uso en entornos de atención al cliente, generación de documentación, asistentes conversacionales ni cualquier aplicación textual: el modelo no genera texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye FID, CLIP score, comparativas cualitativas ni ninguna métrica cuantitativa. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 218 MiB adicionales sobre la memoria que ya consume el modelo base Krea 2. Este dato sí es calculable a partir del tamaño del archivo.
- VRAM total: no disponible, porque depende por completo del modelo base Krea 2, cuyo tamaño de parámetros no se documenta en la información proporcionada. Los pipelines de difusión de imagen comparables suelen requerir entre 8 y 24 GB en función de la precisión y de si se aplican optimizaciones de atención y offloading, pero es una estimación genérica, no un dato del repositorio.
- GPU recomendadas: no disponible. Depende del modelo base.
- Viabilidad en GPU de consumo: no disponible por la misma razón; el adaptador en sí no supone una carga relevante.
- Opciones de despliegue: ComfyUI (flujo nativo declarado), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. No se conocen los parámetros del modelo base Krea 2, ni su licencia, ni métricas de otros adaptadores de la misma familia.

| Aspecto | rh-all-encompassing-confucianism-lora | Alternativas comparables |
|---|---|---|
| Tipo | LoRA de edición de imagen sobre Krea 2 | no disponible |
| Parametros | no disponible (adaptador de 218 MiB) | no disponible |
| Contexto | no aplica | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | HuggingFace, RunningHub, ComfyUI | no disponible |

## Limitaciones y advertencias

- Contenido para adultos: la palabra disparadora y el modelo de origen en Civitai indican que el adaptador está entrenado para un concepto de carácter sexual explícito. Esto condiciona su uso, su publicación y su integración en productos comerciales o accesibles a menores.
- Licencia no especificada: la model card no declara una licencia concreta y remite a la del proyecto original. Sin una licencia explícita, no hay autorización clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Dependencia total del modelo base: el adaptador no funciona por sí solo. Requiere Krea 2, cuyas condiciones de uso, disponibilidad y licencia no se detallan aquí.
- Trazabilidad: el archivo se publica en nombre de un tercero (@氛围感) y el modelo original reside en un dominio espejo de Civitai (`civitai.red`), lo que dificulta verificar la procedencia y los derechos del contenido de entrenamiento.
- Sesgos: no disponible. No se documenta composición del dataset ni evaluación de sesgos demográficos, de género o culturales.
- Alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, artefactos en manos y rostros, incoherencias entre la instrucción y el resultado, y fallos al aplicar el concepto si la palabra disparadora no se usa en la posición o el peso adecuados.
- Multiplicidad de la palabra disparadora: el efecto depende de incluir `TitJobNow` en el prompt; su omisión desactiva en la práctica el adaptador, y su ponderación excesiva puede degradar la imagen.
- Idiomas: no disponible. No hay información sobre el rendimiento con prompts en castellano; el comportamiento dependerá del codificador de texto de Krea 2.
- Ausencia de benchmarks: no hay métricas objetivas de calidad ni comparaciones controladas con otros adaptadores, por lo que la evaluación es necesariamente cualitativa.
- Metadatos poco fiables: el repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización (2026-10-13) distan menos de un minuto entre sí, lo que sugiere una publicación automatizada sin validación posterior.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-all-encompassing-confucianism-lora
- Model card en chino: https://huggingface.co/RunningHubAI/rh-all-encompassing-confucianism-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2082947361978310658
- Página del autor: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo de origen en Civitai: https://civitai.red/models/2821368/tit-job-now?modelVersionId=3182646
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
