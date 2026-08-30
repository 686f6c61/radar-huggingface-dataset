# DanKau/g2.5-multi-v1-onnx

## Resumen

Este repositorio contiene una exportación a formato ONNX del modelo `fastino/gliner2.5-multi-v1`, desarrollado por Fastino y convertido por DanKau para su uso en el servicio de IA no estructurada SPAI de SecuPi. El modelo original es un extractor de entidades basado en la arquitectura *boundary* (BoundaryExtractor), que predice los límites de inicio y fin de las entidades en lugar de puntuar una cuadrícula de spans de ancho fijo como hacía GLiNER original. Esta conversión permite ejecutar el modelo sin dependencia de PyTorch, únicamente con ONNX Runtime, lo que facilita su integración en entornos Java o en pipelines de producción ligeros.

El export se compone de tres grafos ONNX: un encoder basado en mDeBERTa-v3-base, un head de límites (boundary head) completo y un clasificador final. El repositorio incluye también el tokenizador y los ficheros de configuración necesarios. La licencia es Apache 2.0, heredada del modelo base, y el tamaño total del repositorio es de 1,1 GB. No se proporcionan datos sobre el número de parámetros, la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BoundaryExtractor (encoder mDeBERTa-v3-base + head de límites + clasificador) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export ONNX sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ficheros `.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura *boundary* de GLiNER2.5, que en lugar de generar una cuadrícula de spans candidatos de ancho fijo, predice directamente los límites de las entidades. El encoder es mDeBERTa-v3-base, que procesa el prompt estructurado `( [P] entities ( [E] label … ) ) [SEP_TEXT] <texto en minúsculas>`. A partir de las representaciones ocultas, se extraen los estados de las posiciones `[E]` como *query states* y los estados del primer sub-token de cada palabra como *token states*. El head de límites (fichero `boundary.onnx`) combina estos estados para generar un pool de candidatos con sus logits de par, y el clasificador final (`classifier.onnx`) asigna una puntuación a cada candidato.

El entrenamiento del modelo original no está documentado en la información proporcionada; no se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. La exportación ONNX se realizó con dos adaptaciones técnicas: se preservó la estabilidad del orden en `torch.sort` plegando la posición en la clave, y se sustituyó `torch.eye` booleano por una comparación con `arange` para evitar el kernel booleano ausente en ONNX Runtime. La verificación contra PyTorch nativo muestra conjuntos de candidatos idénticos con una diferencia máxima de puntuación de 2,1e-05.

## Capacidades

- Extracción de entidades nombradas (NER) mediante clasificación de tokens, con predicción de límites de entidad.
- Soporte de etiquetas arbitrarias definidas por el usuario a través del prompt estructurado (zero-shot NER).
- Procesamiento de texto en minúsculas, según el prompt especificado.
- Salida de candidatos con índices de palabras (límite exclusivo) y puntuaciones de confianza.
- Deduplicación de spans solapados por etiqueta, manteniendo el candidato de mayor puntuación.
- Ejecución sin dependencia de PyTorch gracias al formato ONNX, integrable en Java u otros lenguajes mediante ONNX Runtime.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo puede identificar cláusulas, partes contratantes, fechas y montos en contratos, gracias a su capacidad de definir etiquetas arbitrarias en el prompt.
- Anonimización de datos personales (PII): al detectar nombres, direcciones, DNI o correos electrónicos, el modelo permite enmascarar o eliminar información sensible antes de publicar documentos.
- Procesamiento de facturas y recibos: extracción de campos estructurados como número de factura, importe, IVA o proveedor a partir de texto libre.
- Análisis de historiales clínicos: identificación de medicamentos, diagnósticos, síntomas y dosis en notas médicas no estructuradas.
- Búsqueda semántica en bases de conocimiento: el modelo puede extraer entidades de artículos o informes para alimentar índices o grafos de conocimiento.
- Integración en pipelines de datos en Java: al ser ONNX, puede ejecutarse dentro de servicios Java con ONNX Runtime sin necesidad de un runtime de Python, como hace SecuPi en su servicio SPAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la exportación fue verificada contra PyTorch nativo, con conjuntos de candidatos idénticos y una diferencia máxima de puntuación de 2,1e-05, pero no se proporcionan métricas de precisión, recall o F1 sobre conjuntos de datos estándar.

## Requisitos de hardware

- El repositorio pesa 1,1 GB, por lo que se estima que el modelo completo puede cargarse en memoria con unos 2-3 GB de RAM/VRAM, aunque no se especifica el consumo exacto.
- Al ser ONNX, puede ejecutarse tanto en CPU como en GPU mediante ONNX Runtime. En CPU, la latencia dependerá del número de palabras y etiquetas; en GPU, se recomienda al menos 4 GB de VRAM para un uso cómodo.
- No se indican GPUs específicas recomendadas. Dado el tamaño, una GPU consumer como una RTX 3060 o superior sería suficiente para inferencia en lote pequeño.
- Opciones de despliegue: ONNX Runtime (C++, Python, Java, C#), o cualquier runtime compatible con ONNX. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- No se proporcionan datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de extracción de entidades. El modelo base `fastino/gliner2.5-multi-v1` es la referencia directa, y este repositorio es una conversión ONNX del mismo. Otros modelos comparables en el espacio de NER zero-shot serían GLiNER original o modelos basados en DeBERTa, pero no se dispone de datos de rendimiento en esta información. Se recomienda consultar la ficha del modelo base para obtener métricas comparativas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un modelo multilingüe basado en mDeBERTa, puede presentar sesgos derivados de los datos de entrenamiento del encoder.
- Riesgo de alucinación: al ser un extractor de entidades, puede generar etiquetas o límites incorrectos en textos ambiguos o fuera de dominio.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; el modelo procesa el prompt y el texto juntos, por lo que textos muy largos podrían superar el límite del encoder.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución al modelo base (Fastino) y a esta conversión.
- La exportación ONNX no incluye cuantización; el tamaño de 1,1 GB puede ser elevado para despliegues en dispositivos con recursos limitados.
- El prompt debe construirse exactamente como se indica en la model card; cualquier variación puede degradar el rendimiento.
- La deduplicación de spans solapados se realiza por etiqueta; si se necesitan múltiples entidades del mismo tipo solapadas, el comportamiento puede no ser el esperado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DanKau/g2.5-multi-v1-onnx
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Export ONNX de GLiNER2 multi-v1 (repositorio relacionado): https://huggingface.co/DanKau/gliner2-multi-v1-onnx
- Export ONNX de GLiNER2.5 multi-v1 (otro autor): https://huggingface.co/jugaadsrl/gliner2.5-multi-v1-onnx
- ONNX Model Zoo: https://github.com/onnx/models
- ONNX Runtime Models: https://onnxruntime.ai/models
