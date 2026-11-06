# rolf-mozilla/french-intent-embedding-e5-distilled

## Resumen

`rolf-mozilla/french-intent-embedding-e5-distilled` es un modelo compacto en formato ONNX int8 que combina en un único grafo dos tareas: clasificación de intención de consulta (Chat frente a Search) y generación de embeddings de frase, ambas en una sola pasada hacia delante. Lo desarrolla rolf-mozilla y está pensado para sistemas de enrutamiento de consultas en francés, donde resulta útil decidir si la entrada del usuario debe canalizarse a un motor de búsqueda o a un asistente conversacional sin pagar el coste de ejecutar un clasificador independiente.

El modelo parte de `rolf-mozilla/french-embedding-e5-distilled`, un encoder BERT de 256 dimensiones derivado de `multilingual-e5-small`, que permanece congelado. Sobre su embedding normalizado se entrena una cabeza logística de 514 parámetros para la clasificación binaria de intención. El resultado se exporta como un ONNX cuantizado a int8 de solo 28,3 MB, lo que lo hace desplegable en entornos con recursos muy limitados.

Su relevancia actual radica en la eficiencia: consigue una precisión de 0,748 en el test en francés superando a alternativas que requieren un modelo clasificador separado y una pasada adicional, con un coste extra de apenas 514 parámetros. Está limitado al idioma francés y a consultas truncadas a 64 tokens para la tarea de intención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder tipo transformer) + cabeza lineal logística; exportado como grafo ONNX único con tres salidas |
| Parametros totales | No disponible de forma explícita; el repo ocupa 0,0 GB y el ONNX int8 pesa 28,3 MB; la cabeza de intención aporta 514 parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Consultas truncadas a 64 tokens para la intención; longitud máxima del encoder no especificada (no disponible) |
| Tipos de cuantizacion | Int8 (modelo `model_quantized.onnx`) |
| Idiomas soportados | Francés (fr) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT de 256 dimensiones de embedding heredado de `multilingual-e5-small` mediante destilación, sobre el que se añade una cabeza lineal de regresión logística. El modelo base de embeddings permanece completamente congelado durante el entrenamiento de la cabeza de intención, de modo que la única parte entrenada son 514 parámetros. La estandarización de características se pliega dentro de los pesos de la cabeza, y la exportación final integra el encoder y la cabeza en un único grafo ONNX con tres salidas: `logits` (intención Chat/Search), `sentence_embedding` (embedding media-pooled y normalizado L2) y `last_hidden_state` (vectores por token).

La cabeza de intención se entrena sobre el split de entrenamiento de 233k consultas del dataset `Mozilla/query-intent-detection-dataset-french`. Los conjuntos de entrenamiento y validación son sintéticos, y el autor advierte explícitamente que la precisión de validación (aproximadamente 0,96) no predice la precisión en test. De hecho, el ajuste fino completo, LoRA, cabezas MLP y el entrenamiento conjunto de embedding e intención obtuvieron mejores resultados en validación pero peores en test que esta cabeza lineal sobre embedding congelado.

## Capacidades

- Clasificación de intención de consulta binaria: distingue entre Chat (0) y Search (1) en una sola pasada.
- Generación de embeddings de frase de 256 dimensiones, normalizados L2, equivalentes a los del repo de embeddings original (coseno ≥ 0,997).
- Salida de estados ocultos por token (`last_hidden_state`) para quien quiera calcular el embedding por su cuenta.
- Ejecución eficiente en un único forward pass con ONNX Runtime, sin modelo clasificador separado.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles (según los tags del repo).
- Soporte multilingüe: no disponible; el modelo está restringido al francés.
- Tool calling, agentes, visión, audio o modo de razonamiento: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en asistentes: decidir en tiempo real si la entrada del usuario en francés debe ir a un motor de búsqueda o a un chatbot, usando la salida `logits` con un coste de 514 parámetros adicionales.
- Búsqueda semántica en francés: reutilizar la salida `sentence_embedding` para indexar y recuperar documentos mediante similitud coseno, aprovechando el mismo forward pass que produce la intención.
- Clasificación y deduplicación de consultas: agrupar consultas por similitud de embedding y etiquetarlas por intención en pipelines de analítica de tráfico.
- Despliegue en el edge o en contenedores ligeros: el ONNX int8 de 28,3 MB cabe en entornos con poca memoria y sin GPU dedicada, lo que permite enrutamiento local de baja latencia.
- Preprocesado en sistemas RAG: etiquetar la intención de la consulta del usuario y recuperar pasajes relevantes con el embedding generado en la misma llamada, reduciendo el número de modelos en el pipeline.
- Filtrado y moderación de consultas: usar la intención Chat/Search junto con el embedding para separar consultas informativas de conversacionales en sistemas de atención al cliente francófonos.
- Integración en APIs compatibles con Text Embeddings Inference: servir el modelo como endpoint de embeddings y clasificación en una infraestructura existente sin añadir un segundo servicio.

## Benchmarks y rendimiento

Resultados sobre el split de test en francés de `Mozilla/query-intent-detection-dataset-french` (q8):

| Modelo | Coste extra sobre el modelo de embeddings | Precisión test | Macro-F1 | Precisión test (consultas no vistas en train) |
|---|---|---|---|---|
| Este modelo | 514 parámetros (cabeza lineal) | 0,748 | 0,738 | 0,727 |
| Mozilla/query-intent-detection-en-fr | Modelo separado de 14 MB + forward pass | 0,713 | 0,710 | 0,696 |
| multilingual-e5-small, ajuste fino completo | Modelo separado de 118 MB | 0,713 | 0,697 | 0,700 |
| all-MiniLM-L6-v2, ajuste fino completo | Modelo separado de 23 MB | 0,706 | 0,689 | 0,691 |

El split de test contiene 1.378 consultas, con un margen de aproximadamente ±2,3 puntos de precisión al 95 % de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el ONNX int8 ocupa 28,3 MB, por lo que puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente, e incluso innecesaria.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, dispositivos de baja memoria).
- Opciones de despliegue: ONNX Runtime, Text Embeddings Inference y endpoints compatibles según los tags del repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Test acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | Encoder BERT + cabeza lineal, ONNX int8 | 28,3 MB | 64 tokens (intención) | 0,748 | MIT | Hugging Face |
| Mozilla/query-intent-detection-en-fr | Clasificador separado | 14 MB | No disponible | 0,713 | No disponible | Hugging Face |
| multilingual-e5-small (ajuste fino completo) | Encoder multilingüe | 118 MB | No disponible | 0,713 | No disponible | Hugging Face |
| all-MiniLM-L6-v2 (ajuste fino completo) | Encoder | 23 MB | No disponible | 0,706 | No disponible | Hugging Face |

## Limitaciones y advertencias

- Solo admite francés; no cubre otros idiomas.
- Las consultas se truncan a 64 tokens para la tarea de intención, lo que puede perder información en entradas largas.
- El modelo base de embeddings hereda la advertencia de linaje de MS MARCO de su base `multilingual-e5-small`, según indica el autor.
- Riesgo de alucinación: no aplica directamente al ser un clasificador y encoder, pero los embeddings pueden producir similitudes engañosas en dominios fuera de distribución.
- La precisión de validación (aproximadamente 0,96) no predice la precisión en test (0,748); no debe usarse la validación como estimación de rendimiento en producción.
- Los conjuntos de entrenamiento y validación son sintéticos, lo que puede introducir sesgos respecto a distribuciones reales de consultas.
- El margen de error del test es de aproximadamente ±2,3 puntos al 95 % de confianza, por lo que las diferencias frente a alternativas deben interpretarse con cautela.
- Licencia MIT, lo que permite uso comercial; conviene revisar las condiciones del dataset `Mozilla/query-intent-detection-dataset-french` y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rolf-mozilla/french-intent-embedding-e5-distilled
- Modelo base de embeddings: https://huggingface.co/rolf-mozilla/french-embedding-e5-distilled
- Dataset de entrenamiento: Mozilla/query-intent-detection-dataset-french (referenciado en la model card)
- Modelo comparable citado: Mozilla/query-intent-detection-en-fr (referenciado en la model card)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
