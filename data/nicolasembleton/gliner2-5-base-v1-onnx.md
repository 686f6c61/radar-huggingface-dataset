# nicolasembleton/gliner2.5-base-v1-onnx

## Resumen

El modelo `nicolasembleton/gliner2.5-base-v1-onnx` es una exportación a ONNX del modelo GLiNER 2.5 `BoundaryExtractor` (basado en `fastino/gliner2.5-base-v1`), diseñado para ejecutarse con onnxruntime y WebGPU. GLiNER 2.5 es un modelo de extracción de información con 0,2 mil millones de parámetros que predice directamente los límites de las entidades en lugar de enumerar todos los span candidatos, lo que permite un escalado lineal con la longitud del documento. Este enfoque permite realizar reconocimiento de entidades nombradas (NER), extracción de relaciones y clasificación restringida sin necesidad de ajuste fino, simplemente proporcionando una lista de etiquetas junto con el texto.

La relevancia de este modelo radica en su eficiencia: al ser un modelo pequeño (0,2B) y estar exportado a ONNX, puede ejecutarse en navegadores mediante WebGPU y en entornos de servidor con onnxruntime, lo que lo hace adecuado para aplicaciones de extracción de información en tiempo real o en dispositivos con recursos limitados. No obstante, hay que tener en cuenta que no es un grafo completo de extracción automática; el empaquetado de esquemas (marcadores de tipo de entidad) y la decodificación de spans deben realizarse en el lado del host, de forma similar a la implementación de GLiNER.js.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa (encoder) con cabezal de predicción de límites (start/end logits) |
| Parámetros totales | 0,2 mil millones (según la descripción del modelo base) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el formato ONNX no especifica cuantización en la información) |
| Idiomas soportados | No disponible (el modelo base GLiNER 2.5 tiene capacidades multilingües, pero no se especifican) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `model.onnx`) |

## Arquitectura y entrenamiento

El modelo original GLiNER 2.5 es un `BoundaryExtractor` que utiliza un codificador DeBERTa para generar representaciones de palabras y marcadores de consulta. La exportación ONNX encapsula tres pasos: 1) el codificador DeBERTa sobre los `input_ids` empaquetados, 2) la recopilación de estados de palabras y estados de marcadores de consulta, y 3) la generación de logits de inicio y fin para cada consulta y cada posición de palabra (con una dimensión extra para la posición final). Este diseño permite que la predicción de límites sea independiente de la enumeración de span, lo que reduce la complejidad computacional.

El entrenamiento de GLiNER 2.5 se ha llevado a cabo para unificar varias tareas de extracción de información (NER, extracción de relaciones, clasificación restringida) en un único modelo. Aunque no se dispone de detalles sobre el conjunto de datos o el proceso de entrenamiento (RLHF, DPO, etc.), se sabe que el modelo alcanza una puntuación F1 promedio de 54,87 en 16 benchmarks, según la información pública. La exportación ONNX no altera los pesos del modelo original; solo reestructura el grafo para su uso con onnxruntime.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot: puede identificar cualquier tipo de entidad definida por el usuario sin necesidad de ajuste fino.
- Extracción de relaciones entre entidades, mediante la definición de esquemas de consulta.
- Clasificación de texto restringida (conjuntos de etiquetas cerradas) usando el mismo mecanismo de marcadores.
- Ejecución en navegador con WebGPU (a través de onnxruntime-web) y en entornos de servidor con onnxruntime.
- Soporte de tokenización y empaquetado de esquemas en el lado del host (no incluido en el grafo ONNX).
- Escalado lineal con la longitud del documento gracias a la predicción directa de límites (no enumeración de spans).
- Compatibilidad con Python mediante `onnxruntime.InferenceSession` para integración en pipelines de procesamiento de texto.

## Casos de uso

- **Extracción de entidades en tiempo real en el navegador**: gracias al soporte de WebGPU, el modelo puede ejecutarse directamente en el cliente para aplicaciones de análisis de texto en línea, como resaltado de entidades en documentos web o formularios dinámicos, sin necesidad de servidor.
- **Pipeline de procesamiento de documentos largos**: dado que la predicción de límites es lineal, puede procesar documentos extensos (artículos, informes) con un coste computacional predecible, útil en sistemas de gestión documental.
- **Integración en servicios de backend con ONNX Runtime**: el modelo puede desplegarse en servidores con CPU o GPU, usando la librería `onnxruntime` de Python o C#, para servir extracción de entidades a través de APIs REST.
- **Sistema de clasificación de tickets de soporte**: usando clasificación restringida, se puede asignar categorías predefinidas a tickets de soporte técnico, con la posibilidad de añadir nuevas categorías sin reentrenar el modelo.
- **Extracción de relaciones en bases de datos de conocimiento**: combinando el modelo con un esquema de relación, se pueden extraer tripletas (sujeto, relación, objeto) de textos no estructurados, útil para la construcción de grafos de conocimiento.
- **Análisis de contratos y documentos legales**: para identificar cláusulas, fechas, partes contratantes y otros elementos, con la ventaja de poder definir tipos de entidad específicos según el dominio legal sin necesidad de entrenamiento previo.
- **Aplicaciones de accesibilidad**: por ejemplo, extraer nombres de lugares, personas y fechas de textos para lectores de pantalla o asistentes virtuales, ejecutándose localmente en el dispositivo del usuario.

## Benchmarks y rendimiento

Según la información pública, el modelo GLiNER 2.5 Base V1 alcanza una puntuación F1 promedio de 54.87 en 16 benchmarks de extracción de información. No se han publicado desgloses por benchmark en la información disponible. No se proporcionan comparaciones directas con otros modelos en la documentación de esta exportación ONNX.

| Benchmark | Resultado |
|---|---|
| Promedio F1 (16 benchmarks) | 54,87 |

*Nota: este dato proviene de la descripción del modelo base y no de esta exportación específica.*

## Requisitos de hardware

- **VRAM estimada**: para el modelo de 0,2 millones de parámetros, el tamaño del archivo ONNX es de 0,7 GB, lo que sugiere que la inferencia puede requerir entre 1 y 2 GB de memoria en GPU (según el lote y la longitud del contexto). En CPU, la memoria RAM necesaria será similar.
- **GPU recomendadas**: cualquier GPU compatible con WebGPU (p. ej., NVIDIA GTX 1000 series o superiores, AMD RX 5000 series o superiores) para ejecución en navegador; para servidores, GPU como NVIDIA T4, A100 o H100 son adecuadas, aunque también puede funcionar en CPU.
- **¿Cabe en una GPU de consumo?**: Sí, el modelo es pequeño y puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o similares, tanto en WebGPU como en onnxruntime con CUDA.
- **Opciones de despliegue**: onnxruntime (Python, C#, etc.), onnxruntime-web con WebGPU o WASM (como fallback), y también se puede convertir a otros formatos si es necesario.
- **Latencia y throughput**: no hay datos publicados específicos para esta exportación. Sin embargo, al ser un modelo de 0,2B con predicción lineal, se espera una latencia de decenas de milisegundos por documento corto en GPU, y de cientos de milisegundos en CPU. Para documentos largos, la latencia crece linealmente con el número de palabras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `nicolasembleton/gliner2.5-base-v1-onnx` | 0,2B | No disponible | Apache-2.0 | ONNX | Exportación para WebGPU/onnxruntime |
| `lion-ai/gliner2-base-v1-onnx` | 0,2B | No disponible | Apache-2.0 | ONNX | Otra exportación ONNX de GLiNER 2 base |
| `fastino/gliner2.5-base-v1` | 0,2B | No disponible | Apache-2.0 | PyTorch | Modelo original, requiere framework de GLiNER |

Ambos modelos ONNX son exportaciones del mismo modelo base, con diferencias en la versión (2.5 vs 2) y en la estructura del grafo. El modelo de `lion-ai` es un monolito con encoder y head, mientras que el de `nicolasembleton` separa la lógica de empaquetado. La comparativa con otros modelos de extracción de entidades (como spaCy o Stanford NER) no es directa, porque GLiNER 2.5 es zero-shot y unificado.

## Limitaciones y advertencias

- **No es un `AutoExtractor` completo**: el modelo ONNX solo ejecuta el encoder y la predicción de límites; el empaquetado de esquemas y la decodificación de spans deben realizarse en el lado del host (p. ej., con GLiNER.js). No se puede usar directamente como un pipeline de token-classification tradicional.
- **Sesgos y alucinación**: como cualquier modelo de lenguaje, puede generar entidades falsas o inconsistentes, especialmente en dominios poco representados en su entrenamiento. No se ha evaluado el sesgo específico de este modelo.
- **Idiomas**: no se especifican los idiomas soportados; aunque GLiNER 2.5 es multilingüe, el rendimiento puede variar según el idioma. Es recomendable probar con textos en el idioma objetivo.
- **Longitud de contexto**: no se ha publicado el límite de contexto; el modelo podría degradarse en documentos muy largos (más de 512 o 1024 tokens, dependiendo del codificador DeBERTa). Se recomienda segmentar textos extensos.
- **Licencia**: aunque la licencia es Apache-2.0, el uso comercial está permitido, pero se debe verificar la licencia de los datos de entrenamiento del modelo base.
- **Dependencia de la infraestructura**: para WebGPU, algunos navegadores pueden no soportar int64 en GPU, por lo que se requiere el backend WASM como alternativa, lo que puede reducir el rendimiento.
- **No se proporciona información sobre cuantización**: el modelo ONNX parece estar en formato fp32 o fp16, no hay versiones cuantizadas disponibles en este repositorio.

## Enlaces

- [HuggingFace - nicolasembleton/gliner2.5-base-v1-onnx](https://huggingface.co/nicolasembleton/gliner2.5-base-v1-onnx)
- [HuggingFace - fastino/gliner2.5-base-v1 (modelo base)](https://huggingface.co/fastino/gliner2.5-base-v1)
- [GitHub - fastino-ai/GLiNER2](https://github.com/fastino-ai/GLiNER2)
- [GitHub - rmallof/gliner2 (repositorio alternativo)](https://github.com/rmallof/gliner2)
- [Página de GLiNER2.5 Base V1 en There's An AI For That](https://theresanaiforthat.com/model/gliner2-5-base-v1/)
- [HuggingFace - lion-ai/gliner2-base-v1-onnx (otra exportación ONNX)](https://huggingface.co/lion-ai/gliner2-base-v1-onnx)
