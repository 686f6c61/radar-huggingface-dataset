# abrargul/qwen2vl-document-markdown

## Resumen

El modelo `abrargul/qwen2vl-document-markdown` es un adaptador LoRA (entrenado con PEFT) sobre el modelo base `Qwen/Qwen2-VL-2B-Instruct`, un modelo de visión-lenguaje de 2.000 millones de parámetros desarrollado por Alibaba Cloud. Su propósito es convertir imágenes de documentos (escaneos, capturas, fotografías) en texto estructurado en formato Markdown, preservando encabezados, párrafos, tablas y ecuaciones. El adaptador se ha entrenado mediante fine-tuning con cuantización de 4 bits, lo que permite un ajuste eficiente en recursos.

La relevancia de este modelo radica en la automatización de la digitalización de documentos, una tarea habitual en entornos empresariales y de investigación. Al estar basado en un modelo pequeño (2B), puede ejecutarse en hardware de consumo, lo que facilita su adopción en flujos de trabajo locales. El repositorio tiene un tamaño de 0,5 GB y contiene los pesos del adaptador en formato safetensors. No se ha publicado información sobre la licencia, los idiomas soportados ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL-2B-Instruct (vision-language transformer) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base tiene 2.000 millones; el adaptador añade un número reducido de parámetros entrenables) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2-VL-2B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | 4 bits (durante el entrenamiento con LoRA); no se especifican cuantizaciones para inferencia |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2-VL-2B-Instruct, un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje. El adaptador se ha entrenado con la librería PEFT (versión 0.14.0) utilizando LoRA y cuantización de 4 bits, una técnica que reduce el uso de memoria durante el fine-tuning al congelar los pesos originales y entrenar solo matrices de baja dimensión. El objetivo del entrenamiento es que el modelo genere Markdown estructurado a partir de imágenes de documentos, incluyendo elementos como títulos, listas, tablas y fórmulas.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, el régimen de entrenamiento (épocas, tasa de aprendizaje, etc.) ni si se aplicaron técnicas como RLHF o DPO. La información disponible en la model card es mínima y no aporta datos técnicos adicionales.

## Capacidades

- Generacion de Markdown estructurado a partir de imagenes de documentos: el modelo transcribe el contenido visual en texto con formato Markdown, respetando jerarquias de encabezados, parrafos, listas y tablas.
- Reconocimiento de ecuaciones: segun la descripcion del proyecto, el modelo puede convertir formulas matematicas presentes en el documento a su representacion en Markdown (posiblemente LaTeX).
- Procesamiento de imagenes de documentos variados: escaneos, fotografias de paginas, capturas de pantalla, etc.
- Integracion en pipelines de PEFT: al ser un adaptador LoRA, puede combinarse con el modelo base y cargarse mediante la libreria `peft` de Hugging Face.
- Capacidades del modelo base: al heredar las capacidades de Qwen2-VL-2B-Instruct, el modelo tambien puede realizar tareas generales de vision-lenguaje, como responder preguntas sobre imagenes, aunque el fine-tuning esta orientado a la tarea especifica de conversion a Markdown.

## Casos de uso

- Digitalizacion de documentos empresariales: convertir escaneos de facturas, contratos o informes en archivos Markdown editables, facilitando su almacenamiento y busqueda en sistemas de gestion documental.
- Extraccion de tablas y datos estructurados: el modelo puede transformar tablas presentes en imagenes en tablas Markdown, lo que permite su posterior procesamiento con herramientas de analisis de datos.
- Generacion de documentacion tecnica a partir de capturas: si se dispone de capturas de pantalla de documentacion existente, el modelo puede reescribirla en Markdown para su publicacion en wikis o repositorios.
- Accesibilidad: convertir documentos escaneados en texto plano estructurado facilita la lectura mediante lectores de pantalla para personas con discapacidad visual.
- Archivado de documentos historicos: digitalizar documentos antiguos en formato imagen y convertirlos a Markdown para su preservacion y consulta digital.
- Preprocesamiento para pipelines de NLP: al obtener Markdown limpio a partir de imagenes, se puede alimentar a modelos de lenguaje para tareas de resumen, extraccion de entidades o traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de conversion de documentos a Markdown.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 2B con cuantizacion de 4 bits, se estima que la inferencia puede ejecutarse con aproximadamente 2-3 GB de VRAM, aunque este dato no esta confirmado por el autor.
- GPU recomendadas: tarjetas de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060 o superiores son suficientes. Tambien puede ejecutarse en GPUs de datacenter como A10 o A100 si se requiere mayor throughput.
- Compatibilidad con hardware de consumo: si, el modelo base de 2B es adecuado para GPUs de gama media.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `transformers` y `peft` en Python. No se mencionan integraciones con vLLM, llama.cpp u Ollama, pero al ser un modelo de vision-lenguaje, su despliegue requiere el stack de transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (conversion de documentos a Markdown mediante fine-tuning de Qwen2-VL). Existen otros modelos de vision-lenguaje como Llama 3.2 Vision o Phi-3.5-vision, pero no se han encontrado adaptadores especificos para esta tarea con los que comparar. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningun sesgo especifico, pero al ser un modelo basado en Qwen2-VL, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido incorrecto o inventado, especialmente en documentos con texto ilegible, tablas complejas o idiomas no soportados.
- Limitaciones de contexto: la longitud de contexto no esta confirmada para este adaptador; si se hereda la del modelo base (32.768 tokens), documentos muy largos podrian superar el limite.
- Limitaciones de idioma: no se ha especificado que idiomas soporta; el modelo base Qwen2-VL-2B-Instruct esta entrenado principalmente en ingles y chino, por lo que el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia no esta disponible, por lo que se desconoce si el uso comercial esta permitido. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Caveat para produccion: al ser un adaptador sin documentacion tecnica detallada, no se garantiza su robustez en entornos reales. Es necesario validar su rendimiento con datos propios antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abrargul/qwen2vl-document-markdown
- Repositorio de entrenamiento (GitHub): https://github.com/ayesha-asad07/document_to_markdown_GenerationModel
- Repositorio alternativo con README (GitHub): https://github.com/Basit-Arshad/qwen2vl-document-markdown/blob/main/README.md
- Articulo en Medium sobre el fine-tuning: https://medium.com/@azamrafique42/teaching-an-ai-to-read-fine-tuning-qwen2-vl-for-document-to-markdown-generation-ead758e49915
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tahir-next/qwen2vl-document-markdown
