# nicolasembleton/gliner2.5-multi-v1-onnx

## Resumen

Este modelo es una exportación a ONNX de **GLiNER2.5 Multi v1**, un sistema de extracción de información basado en predicción de límites (boundary prediction). Ha sido publicado por nicolasembleton para permitir la ejecución del modelo base de Fastino en entornos de inferencia como ONNX Runtime y WebGPU, lo que facilita su uso en navegadores y aplicaciones cliente sin depender de un servidor. La arquitectura combina un encoder DeBERTa con una cabecera que predice los índices de inicio y fin de cada entidad, eliminando la enumeración exhaustiva de spans que usan otros modelos de extracción de entidades. No se dispone de datos sobre el número de parámetros ni la longitud de contexto, pero el tamaño del repositorio (1,1 GB) sugiere un modelo de dimensiones medias. Su relevancia radica en que permite realizar reconocimiento de entidades zero-shot con alta eficiencia en hardware modesto, incluyendo dispositivos de consumo y navegadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa encoder + cabecera de predicción de límites (start/end logits) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag indica que el modelo base está cuantizado, pero no se especifica el tipo) |
| Idiomas soportados | no disponible (el nombre "multi" sugiere multilingüe, sin confirmación) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo base, **GLiNER2.5 Multi v1**, fue desarrollado por Fastino y se presenta como una arquitectura de predicción de límites en lugar de la enumeración de spans que usaban las versiones anteriores de GLiNER. El encoder está basado en DeBERTa, y la cabecera produce dos tensores de logits: uno para el inicio de la entidad y otro para el final, con dimensiones `[batch, queries, words+1]`. El proceso de empaquetado del esquema (marcadores de tipo de entidad) y la decodificación de spans se realiza en el host, igual que en la implementación de GLiNER.js. En esta exportación ONNX se ejecutan tres pasos: el encoder DeBERTa, la operación de recopilación de estados de palabras y de marcadores de consulta, y el cálculo de los logits de límites. No se han publicado detalles sobre los datos de entrenamiento ni las técnicas de optimización (RLHF, DPO, etc.) en la información disponible.

## Capacidades

- **Reconocimiento de entidades zero-shot**: el modelo puede identificar entidades de tipos no vistos durante el entrenamiento, simplemente proporcionando una lista de etiquetas junto con el texto.
- **Predicción de límites**: en lugar de enumerar todas las posibles spans, el modelo puntúa directamente los puntos de inicio y fin de cada entidad, reduciendo el coste computacional.
- **Extracción de relaciones y clasificación de texto**: según el repositorio de GLiNER2, el modelo soporta extracción de relaciones, clasificación de textos y parseo de datos estructurados dentro de un mismo esquema.
- **Compatibilidad con WebGPU y ONNX Runtime Web**: la exportación está pensada para ejecutarse en navegadores mediante `onnxruntime-web`, usando el backend WebGPU (o WASM como respaldo).
- **Multilingüe**: el nombre "multi" indica que el modelo fue entrenado para múltiples idiomas, aunque no se especifican cuáles.
- **Inferencia en CPU y hardware de consumo**: según la documentación del framework GLiNER, el modelo está optimizado para ejecutarse en CPU y GPUs de gama media.

## Casos de uso

- **Extracción de entidades en el navegador**: aplicaciones web que procesan documentos (facturas, currículums, formularios) de forma local, sin enviar datos a un servidor. El modelo se carga con ONNX Runtime Web y WebGPU, y el usuario define las etiquetas en tiempo real.
- **Análisis de contratos y documentos legales**: se pueden definir etiquetas como "fecha", "parte contratante", "cláusula de penalización" y extraer automáticamente esos campos de textos legales, facilitando la revisión de contratos.
- **Soporte al cliente automatizado**: el modelo puede identificar entidades como nombres de productos, números de pedido o fechas en conversaciones de chat, integrándose en sistemas de atención al cliente para enrutar o priorizar consultas.
- **Extracción de datos de facturas y recibos**: con etiquetas como "importe", "número de factura", "proveedor", el modelo puede procesar documentos escaneados o digitales y estructurar la información para su integración en sistemas contables.
- **Clasificación de textos en foros o redes sociales**: mediante el mismo mecanismo de extracción de entidades, se pueden clasificar textos según categorías definidas dinámicamente, como "queja", "sugerencia" o "pregunta".
- **Extracción de relaciones en artículos científicos**: el modelo puede identificar entidades (proteínas, genes, enfermedades) y extraer relaciones entre ellas, ayudando a construir bases de conocimiento biomédico.
- **Procesamiento de texto en aplicaciones de escritorio**: al ser un modelo ONNX, se puede integrar en aplicaciones de escritorio (Python, Node.js) para realizar NER en tiempo real sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Tamaño del archivo**: 1,1 GB en formato ONNX, lo que indica un modelo de tamaño medio (aproximadamente entre 300 y 500 millones de parámetros, aunque no se confirma).
- **VRAM estimada**: no disponible. Dado el tamaño del archivo, una GPU con al menos 2 GB de VRAM sería suficiente para inferencia en FP32; con cuantización se podría reducir.
- **GPUs recomendadas**: no disponible. El modelo está diseñado para ejecutarse en CPU y en GPUs mediante WebGPU en navegadores.
- **Compatibilidad con consumer GPU**: probablemente sí, pero no se confirma. El modelo puede ejecutarse en GPUs como RTX 3060 o superiores, y también en integradas (iGPU) mediante WebGPU.
- **Opciones de despliegue**: ONNX Runtime (Python, Node.js), onnxruntime-web (WebGPU/WASM), y cualquier plataforma que soporte ONNX. No se menciona compatibilidad con llama.cpp ni vLLM, ya que no es un modelo de tipo LLM.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `gliner2.5-multi-v1-onnx` (este) | DeBERTa + boundary prediction | no disponible | no disponible | Apache-2.0 | ONNX |
| `gliner2-multi-v1-onnx` (lion-ai) | DeBERTa + span enumeration | no disponible | no disponible | Apache-2.0 | ONNX |
| `gliner2-multi-v1-onnx` (SemplificaAI) | DeBERTa + span enumeration | no disponible | no disponible | Apache-2.0 | ONNX |
| GLiNER original (urchade) | DeBERTa + span enumeration | ~200M | 512 | Apache-2.0 | PyTorch/ONNX |

La principal diferencia de este modelo respecto a las exportaciones de GLiNER2 es la sustitución de la enumeración de spans por la predicción de límites, lo que reduce el coste computacional al no tener que evaluar todas las posibles combinaciones de inicio y fin. No se han publicado comparativas de rendimiento con otros modelos en la información disponible.

## Limitaciones y advertencias

- **No es un modelo `AutoExtractor` completo**: el ONNX solo contiene el encoder y la cabecera de límites. El empaquetado del esquema (marcadores de tipo) y la decodificación de spans deben implementarse en el lado del cliente, tal como se indica en la documentación.
- **Requisito de entradas `int64`**: los tensores `input_ids` y `attention_mask` deben ser de tipo `int64`. Algunos navegadores pueden no soportar este tipo en WebGPU, por lo que se recomienda usar el backend WASM como respaldo.
- **Sesgos y alucinaciones**: no se dispone de datos sobre sesgos o comportamientos alucinatorios. Como modelo de extracción de entidades, puede generar predicciones incorrectas en textos ambiguos o fuera de dominio.
- **Idiomas no confirmados**: aunque el modelo se denomina "multi", no se especifica qué idiomas soporta ni su calidad en cada uno.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe verificar que la licencia del modelo base (fastino/gliner2.5-multi-v1) sea también compatible, aunque en la información de HuggingFace se indica que el modelo base tiene licencia Apache-2.0.
- **Tamaño del archivo**: 1,1 GB puede ser pesado para aplicaciones web con limitaciones de ancho de banda, aunque es aceptable para cargas locales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nicolasembleton/gliner2.5-multi-v1-onnx)
- [Modelo base: fastino/gliner2.5-multi-v1](https://huggingface.co/fastino/gliner2.5-multi-v1)
- [Artículo de MarktechPost sobre GLiNER2.5](https://www.marktechpost.com/2026/08/24/fastino-releases-gliner2-5-a-boundary-prediction-architecture-that-removes-span-enumeration-from-information-extraction/)
- [Repositorio GLiNER2 de rmallof](https://github.com/rmallof/gliner2)
- [Repositorio GLiNER original (urchade)](https://github.com/urchade/GLiNER)
- [Export ONNX de GLiNER2 multi v1 (lion-ai)](https://huggingface.co/lion-ai/gliner2-multi-v1-onnx)
- [Export ONNX de GLiNER2 multi v1 (SemplificaAI)](https://huggingface.co/SemplificaAI/gliner2-multi-v1-onnx)
