# Mohammed422/invoices-donut-model-v1

## Resumen

El modelo `Mohammed422/invoices-donut-model-v1` es un ajuste fino (fine-tuning) del modelo Donut, desarrollado por Clova AI, especializado en la extracción de información de facturas a partir de imágenes. Donut (Document Understanding Transformer) es un modelo de visión y lenguaje que realiza comprensión de documentos sin depender de motores OCR externos, utilizando una arquitectura encoder-decoder basada en transformadores. Este modelo concreto, publicado por el usuario Mohammed422 en septiembre de 2026, cuenta con 202 millones de parámetros y está diseñado para la tarea de image-text-to-text, es decir, recibe una imagen de factura y genera texto estructurado con los campos extraídos.

La relevancia de este modelo radica en su capacidad para automatizar el procesamiento de facturas en entornos empresariales, eliminando la necesidad de pipelines OCR tradicionales y simplificando la integración en sistemas de gestión documental. Sin embargo, la documentación disponible es extremadamente limitada: la model card está prácticamente vacía, no se especifican datos de entrenamiento, licencia ni idiomas soportados, y el modelo no ha recibido descargas ni valoraciones en Hugging Face. Esto obliga a tratar cualquier afirmación sobre su rendimiento con cautela, aunque su arquitectura base (Donut) está bien documentada en la literatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (Donut: Swin Transformer como encoder y BART como decoder) |
| Parametros totales | 202.126.776 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato FP32/FP16 probablemente) |
| Idiomas soportados | no disponible (probablemente ingles, pero sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Donut es un modelo OCR-free que combina un encoder visual basado en Swin Transformer con un decoder de texto basado en BART. El encoder procesa la imagen de entrada directamente, sin necesidad de un paso previo de reconocimiento óptico de caracteres, y el decoder genera secuencias de texto estructurado (por ejemplo, JSON) que representan la información extraída del documento. Esta arquitectura permite un entrenamiento de extremo a extremo y evita los errores acumulativos típicos de los sistemas OCR tradicionales.

En cuanto al entrenamiento de este modelo concreto, no se dispone de información detallada. La model card no especifica el conjunto de datos de facturas utilizado, el número de épocas, las hiperparametros ni el régimen de entrenamiento (si se usó fine-tuning completo o adaptadores). Dado que el modelo se presenta como un ajuste fino del Donut base, es razonable asumir que se siguió el procedimiento estándar de fine-tuning para tareas de extracción de información en documentos, pero no hay datos verificables al respecto.

## Capacidades

- Extracción de información estructurada de facturas: identifica campos como número de factura, fecha, proveedor, cliente, importes, impuestos, etc., y los devuelve en formato de texto estructurado (típicamente JSON).
- Comprensión de documentos sin OCR: al basarse en Donut, el modelo procesa la imagen directamente, lo que elimina la dependencia de motores OCR externos y simplifica el pipeline.
- Generación de texto a partir de imágenes: el modelo es capaz de producir descripciones o representaciones textuales de los documentos de entrada.
- Soporte de múltiples tipos de factura: aunque no se especifica, los modelos Donut ajustados suelen manejar variaciones de diseño y formato en facturas.
- Integración con la librería transformers: al ser un modelo de Hugging Face, se puede cargar y utilizar con las APIs estándar de `transformers` para tareas de image-to-text.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede desplegarse en infraestructuras de inferencia como Inference Endpoints de Hugging Face.

## Casos de uso

- Automatización de contabilidad: el modelo puede extraer automáticamente los datos clave de facturas recibidas por correo electrónico o escaneadas, alimentando sistemas de contabilidad como SAP u Oracle sin intervención manual.
- Procesamiento de facturas en tiempo real: gracias a su naturaleza OCR-free, puede integrarse en flujos de trabajo de captura de documentos donde se necesita una respuesta rápida, por ejemplo, en aplicaciones móviles de gastos.
- Validación y conciliación de facturas: comparar los campos extraídos (importe, IVA, número de factura) con los pedidos o contratos correspondientes para detectar discrepancias.
- Archivado y búsqueda documental: indexar facturas históricas extrayendo metadatos estructurados que permitan búsquedas por proveedor, fecha o importe en sistemas de gestión documental.
- Asistente virtual para finanzas: combinar el modelo con un chatbot para que los empleados puedan consultar el estado de una factura simplemente subiendo una foto, y el sistema devuelva la información relevante.
- Migración de datos legados: digitalizar facturas en papel o PDF escaneado para incorporarlas a bases de datos estructuradas, reduciendo errores de transcripción manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (como exactitud en extracción de campos, F1, etc.) ni comparaciones con otros modelos. Dado que el modelo no tiene descargas ni valoraciones, no hay evidencia empírica de su rendimiento en tareas reales. Se recomienda evaluar el modelo en un conjunto propio de facturas antes de usarlo en producción.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware. Basándose en el tamaño del modelo (202 millones de parámetros) y su arquitectura vision-encoder-decoder, se estima que:
  - En FP16, el modelo ocupa aproximadamente 400 MB de memoria (202M parámetros × 2 bytes), por lo que cabría en GPUs con al menos 4 GB de VRAM.
  - En FP32, el tamaño sería de unos 800 MB, requiriendo al menos 6 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM, como NVIDIA GTX 1660, RTX 2060, RTX 3060, o superiores. Para inferencia en producción, una T4 (16 GB) o A10 sería suficiente.
- El modelo es compatible con la librería `transformers` y puede desplegarse con herramientas como vLLM, TGI o directamente con pipelines de Hugging Face. También se puede exportar a ONNX para optimización.
- La latencia dependerá de la resolución de la imagen de entrada y del hardware. En una GPU T4, se espera una inferencia de entre 0,5 y 2 segundos por imagen, aunque esto es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mohammed422/invoices-donut-model-v1 | 202M | no disponible | no disponible | Fine-tuning de Donut para facturas, sin documentación |
| katanaml-org/invoices-donut-model-v1 | 202M (presumiblemente) | no disponible | no disponible | Fine-tuning de Donut para facturas, publicado por katanaml-org, con más reputación |
| scharnot/donut-invoices | no disponible | no disponible | no disponible | Otro fine-tuning de Donut para facturas, sin detalles |

Los tres modelos comparten la misma arquitectura base (Donut) y el mismo propósito. La principal diferencia es que `katanaml-org/invoices-donut-model-v1` proviene de una organización con más trayectoria en procesamiento de documentos, mientras que el modelo de Mohammed422 es de un autor individual y no ha recibido atención de la comunidad. No se dispone de comparaciones de rendimiento entre ellos.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no proporciona información sobre el conjunto de datos de entrenamiento, el proceso de fine-tuning, las métricas de evaluación ni los casos de uso previstos. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Licencia no especificada: al no indicarse la licencia, no está claro si el modelo puede utilizarse comercialmente. Se recomienda contactar con el autor antes de usarlo en entornos empresariales.
- Sesgos y alucinaciones: como cualquier modelo generativo, puede producir salidas incorrectas o inventar campos si la imagen de entrada es ambigua o está fuera de distribución. No hay estudios de sesgos disponibles.
- Limitaciones de idioma: al no especificarse los idiomas soportados, es probable que el modelo solo funcione bien con facturas en inglés (idioma predominante en los datos de entrenamiento de Donut). Facturas en otros idiomas podrían dar resultados deficientes.
- Riesgo de sobreajuste: al ser un fine-tuning sobre un dominio específico (facturas), el modelo puede no generalizar bien a otros tipos de documentos.
- Sin mantenimiento: con 0 descargas y 0 likes, es probable que el modelo no reciba actualizaciones ni soporte por parte del autor.

## Enlaces

- [Hugging Face - Mohammed422/invoices-donut-model-v1](https://huggingface.co/Mohammed422/invoices-donut-model-v1)
- [Hugging Face - katanaml-org/invoices-donut-model-v1](https://huggingface.co/katanaml-org/invoices-donut-model-v1)
- [Hugging Face - scharnot/donut-invoices](https://huggingface.co/scharnot/donut-invoices)
- [GitHub - clovaai/donut (implementación original)](https://github.com/clovaai/donut)
- [GitHub - Gmehta604/Invoice_Reader_Using_Donut (ejemplo de uso)](https://github.com/Gmehta604/Invoice_Reader_Using_Donut)
- [Model Database - invoices-donut-model-v1](https://modeldatabase.com/katanaml-org/invoices-donut-model-v1.html)
