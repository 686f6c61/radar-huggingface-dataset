# JONNYVERSE/donut-base-finetuned-docvqa

## Resumen

El modelo `JONNYVERSE/donut-base-finetuned-docvqa` es una conversión a formato ONNX del modelo original `naver-clova-ix/donut-base-finetuned-docvqa`, realizada para ser compatible con la librería Transformers.js de Hugging Face. Se trata de un sistema de respuesta a preguntas sobre documentos (Document Visual Question Answering) que combina un encoder visual Swin Transformer con un decoder de texto BART, permitiendo extraer información de imágenes de documentos sin necesidad de un paso previo de OCR. El modelo original fue fine-tuneado sobre el conjunto de datos DocVQA, lo que le capacita para responder preguntas concretas sobre facturas, formularios, recibos y otros documentos escaneados.

La relevancia de esta versión ONNX radica en que habilita la ejecución del modelo directamente en el navegador o en entornos JavaScript, democratizando el acceso a capacidades de comprensión de documentos en aplicaciones web y de escritorio sin depender de servidores dedicados. Aunque el repositorio no incluye información detallada sobre licencia, idiomas o métricas de rendimiento, la arquitectura subyacente es bien conocida y ha sido ampliamente utilizada en tareas de extracción de información documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (Donut-Swin + BART) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo base usa 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos ONNX, sin especificar precisión) |
| Idiomas soportados | no disponible (el modelo base fue entrenado principalmente en inglés) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo original `naver-clova-ix/donut-base-finetuned-docvqa` se basa en la arquitectura Donut, que elimina por completo el uso de OCR. El encoder es un Swin Transformer que procesa la imagen del documento y genera representaciones visuales; el decoder es un BART que autoregresivamente genera la respuesta textual a partir de la pregunta y las características visuales. El entrenamiento se realizó sobre el dataset DocVQA, compuesto por más de 50.000 preguntas sobre documentos reales, con un enfoque de aprendizaje supervisado estándar (sin RLHF ni DPO). La versión de JONNYVERSE no modifica los pesos del modelo, sino que los convierte a ONNX mediante la herramienta Optimum, manteniendo la misma arquitectura y capacidades. No se dispone de información sobre el número exacto de parámetros ni sobre el contexto máximo en esta conversión, aunque el modelo base tiene aproximadamente 200 millones de parámetros y una ventana de contexto de 512 tokens.

## Capacidades

- Respuesta a preguntas sobre imágenes de documentos (facturas, formularios, recibos, extractos bancarios, etc.) sin necesidad de OCR previo.
- Extracción de campos específicos como números de factura, fechas, importes, nombres de clientes o proveedores.
- Comprensión de la disposición espacial del texto en el documento gracias al encoder Swin.
- Generación de respuestas textuales en formato libre, no limitadas a opciones cerradas.
- Ejecución en entornos JavaScript mediante Transformers.js, lo que permite su uso en navegadores y aplicaciones Node.js.
- Compatibilidad con el pipeline `document-question-answering` de Hugging Face.

## Casos de uso

- Automatización de la contabilidad: extraer automáticamente números de factura, fechas de emisión y totales de facturas escaneadas, integrándolo en un flujo de trabajo de gestión financiera.
- Atención al cliente en banca: responder preguntas sobre extractos bancarios o formularios de solicitud enviados por los usuarios, sin necesidad de transcribir manualmente los datos.
- Digitalización de archivos: procesar documentos históricos escaneados para responder consultas específicas sobre su contenido, facilitando la búsqueda en archivos corporativos.
- Validación de formularios: comprobar que los campos obligatorios de un formulario rellenado a mano o impreso están presentes y son legibles, mediante preguntas dirigidas.
- Asistentes virtuales de oficina: integrar el modelo en un chatbot que responda a preguntas sobre documentos adjuntos, como "¿Cuál es la fecha de vencimiento de este contrato?".
- Procesamiento de documentos médicos: extraer información de recetas o informes de laboratorio para alimentar sistemas de gestión de pacientes, siempre que se cumplan las normativas de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base `naver-clova-ix/donut-base-finetuned-docvqa` reporta en su documentación un rendimiento competitivo en DocVQA, pero esta conversión ONNX no incluye métricas propias. Se recomienda consultar la documentación del modelo original para obtener datos comparativos.

## Requisitos de hardware

- El tamaño del repositorio es de 8,8 GB, lo que sugiere que los pesos ONNX están en precisión fp32 o fp16. Esto implica un consumo de memoria considerable.
- Para ejecución en navegador con Transformers.js, se requiere una GPU con WebGPU habilitada o, en su defecto, una CPU con suficiente RAM (más de 8 GB) para cargar el modelo completo.
- En entornos Node.js, se puede ejecutar con CPU, pero la inferencia será lenta; se recomienda una GPU NVIDIA con al menos 8 GB de VRAM para un rendimiento aceptable.
- Opciones de despliegue: Transformers.js (navegador o Node.js), o bien convertir los pesos a otros formatos (GGUF, safetensors) para usar con llama.cpp o vLLM, aunque no se proporcionan dichos archivos.
- No se dispone de datos de latencia o throughput específicos para esta conversión.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de la misma categoría. El modelo original `naver-clova-ix/donut-base-finetuned-docvqa` es la referencia directa, y existen alternativas como LayoutLMv3 o Pix2Struct, pero no se han encontrado datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede alucinar respuestas si la pregunta no tiene respuesta en el documento o si la imagen es de baja calidad.
- La ausencia de información sobre licencia impide conocer las restricciones de uso comercial; se recomienda contactar con el autor o consultar el modelo base.
- El idioma principal de entrenamiento es el inglés; el rendimiento en otros idiomas puede ser deficiente.
- El tamaño de los pesos (8,8 GB) dificulta su uso en dispositivos con poca memoria, especialmente en navegadores móviles.
- Al ser una conversión ONNX, no se garantiza que todas las funcionalidades del modelo original (como el procesamiento de imágenes de alta resolución) estén optimizadas para el nuevo formato.
- No se han documentado sesgos específicos, pero al estar entrenado en DocVQA, puede reflejar los sesgos presentes en ese conjunto de datos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/donut-base-finetuned-docvqa
- Modelo base original: https://huggingface.co/naver-clova-ix/donut-base-finetuned-docvqa
- Repositorio de Xenova (conversión similar): https://huggingface.co/Xenova/donut-base-finetuned-docvqa
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta Optimum para conversión ONNX: https://huggingface.co/docs/optimum/index
