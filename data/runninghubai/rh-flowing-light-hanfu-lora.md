# RunningHubAI/rh-flowing-light-hanfu-lora

## Resumen

rh-flowing-light-hanfu-lora es un adaptador LoRA para edición de imágenes mediante texto (pipeline image-text-to-image) publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino derivado del modelo base krea2, orientado a la generación de retratos femeninos con vestimenta tradicional china hanfu de estilo ornamentado y luminoso. El repositorio contiene un único archivo de pesos de 224 MiB (`流光汉服.safetensors`), lo que corresponde a un adaptador de bajo rango y no a un modelo completo.

El modelo no es un LLM ni un sistema multimodal de propósito general: es un complemento visual pensado para cargarse en ComfyUI o en la plataforma RunningHub y modificar el comportamiento estilístico de un modelo de difusión subyacente. Su relevancia es por tanto acotada al ámbito de la generación de imágenes con control de estilo y vestuario, y su interés práctico depende del modelo base krea2 sobre el que se aplica.

La información publicada es muy escasa: no se detallan hiperparámetros de entrenamiento, composición del dataset, licencia explícita, idiomas soportados ni resultados de evaluación. Cualquier uso en producción exige verificar previamente la licencia del modelo base y la del propio adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base krea2; no se especifica la arquitectura del base |
| Parametros totales | no disponible (adaptador de 224 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; el peso publicado es safetensors en precisión nativa |
| Idiomas soportados | no disponible (las instrucciones de estilo de la model card están en inglés) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`流光汉服.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo de difusión para imagen. La model card indica que se ha ajustado a partir de krea2, pero no aporta detalles sobre el número de pasos de entrenamiento, la tasa de aprendizaje, el rango del adaptador, la resolución de entrenamiento ni la composición del dataset. Tampoco se documenta si se emplearon técnicas de regularización, captioning automático o aumentación de datos.

La única información descriptiva disponible es la cadena de prompt asociada al estilo: retratos femeninos con tocados elaborados, filigrana azul y dorada, perlas, motivos florales, telas translúcidas y una iluminación suave y luminosa. Esta cadena sugiere que el adaptador fue entrenado con un conjunto de imágenes coherente en torno a esa estética, pero no constituye evidencia verificable sobre el proceso de entrenamiento.

## Capacidades

- Generación y edición de imágenes condicionada por texto en el pipeline image-text-to-image, mediante el modelo base krea2.
- Aplicación de un estilo visual concreto: vestuario hanfu ornamentado, tocados con filigrana, perlas y motivos florales, con paleta pastel y acabado luminoso.
- Integración con ComfyUI como nodo de carga de LoRA, y con la plataforma RunningHub y su API.
- No dispone de capacidades de razonamiento, código, matemáticas, tool calling, agentes ni procesamiento de audio.
- No se documentan capacidades multilingües ni modos especiales como thinking mode o visión de entrada.

## Casos de uso

- Ilustración editorial de temática histórica: el adaptador permite generar retratos de personajes con vestuario hanfu coherente para portadas, artículos o material divulgativo, aplicando el LoRA sobre el modelo base en ComfyUI.
- Previsualización de vestuario para producciones audiovisuales: diseñadores pueden iterar sobre variantes de tocados, telas y ornamentos antes de fabricar el vestuario físico, usando el prompt descriptivo como plantilla.
- Creación de assets para videojuegos y narrativa visual: generación de retratos de personajes secundarios con una estética consistente dentro de un mismo universo, reduciendo el coste de dirección de arte.
- Contenido para redes sociales y marketing de nicho: producción de imágenes de estética oriental para campañas de marcas de moda, cosmética o turismo cultural, con control de estilo mediante el prompt.
- Prototipado rápido en flujos de diseño: integración del LoRA en un pipeline de ComfyUI para comparar variantes de un mismo concepto antes de encargar una ilustración final a un artista.
- Automatización vía API de RunningHub: generación por lotes de imágenes con este estilo desde una aplicación externa, útil para catálogos o bibliotecas de ilustraciones.
- Experimentación académica en personalización de modelos de difusión: el adaptador sirve como caso de estudio de bajo coste (224 MiB) para analizar cómo un LoRA estrecho desplaza la distribución estilística del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, precisión de edición) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base krea2. El adaptador añade una sobrecarga mínima (224 MiB en disco, fracción similar en memoria).
- GPU recomendadas: no disponibles. Al tratarse de un LoRA sobre un modelo de difusión, el requisito real lo marca el modelo base; sin especificaciones de krea2 no es posible dar cifras.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos sobre si el modelo base cabe en tarjetas de 8, 12 o 16 GB.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica otros adaptadores LoRA de hanfu ni variantes comparables de krea2, y no se han publicado métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador está entrenado para un único arquetipo estético (mujer joven, rasgos idealizados, vestuario ornamentado); puede reproducir sesgos de género, edad y etnia presentes en el dataset original, que no se documenta.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir detalles anatómicos o de vestuario incoherentes (manos, simetría de tocados, estructura de telas) que no deben interpretarse como fieles a la indumentaria histórica real.
- Limitaciones de contexto e idioma: no hay información sobre el idioma de los prompts; la model card solo ofrece una descripción en inglés. El comportamiento con prompts en castellano no está verificado.
- Restricciones de licencia: la licencia no está declarada. La model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial exige verificar por separado la licencia de krea2 y los términos de RunningHub.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la fecha de creación indicada es 2026-11-05 y no hay historial de mantenimiento. No se garantiza la reproducibilidad de resultados ni la estabilidad del adaptador ante actualizaciones del modelo base.
- Dependencia total del modelo base: sin krea2 el archivo safetensors es inutilizable; cualquier cambio en el base puede degradar el estilo aprendido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-flowing-light-hanfu-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2099869647373090818
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/1980864188878884866
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-flowing-light-hanfu-lora/blob/main/README_cn.md
