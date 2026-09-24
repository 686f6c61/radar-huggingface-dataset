# fcaravac/privacy-filter-gbai-int8

## Resumen

`fcaravac/privacy-filter-gbai-int8` es una exportación a ONNX con cuantización INT8 dinámica (QInt8) del clasificador de tokens `angel-gitt/privacy-filter-gbai`, un modelo de 1,4 B de parámetros con arquitectura de mezcla de expertos (MoE) capaz de etiquetar 217 tipos distintos de información personal identificable (PII). No es un modelo generativo: su única tarea es la clasificación de tokens sobre texto de entrada, devolviendo entidades con etiqueta, fragmento de texto y puntuación de confianza.

El modelo deriva de una cadena de trabajos con licencia Apache-2.0 que arranca en `openai/privacy-filter` y pasa por `OpenMed/privacy-filter-multilingual-v2` y `angel-gitt/privacy-filter-gbai`. El autor de esta ficha no ha reentrenado el modelo: ha exportado el checkpoint a ONNX, ha sustituido el bucle de expertos dependiente de datos de la capa MoE por un `matmul` vectorizado sobre todos los expertos y ha aplicado cuantización INT8 con ONNX Runtime.

Su relevancia práctica está en el despliegue: el artefacto resultante pesa aproximadamente 1,7 GB y está pensado para inferencia en CPU con ONNX Runtime, lo que permite integrar detección de PII en pipelines de datos, logs o servicios sin disponer de GPU. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas de mezcla de expertos (MoE); grafo ONNX exportado con el exportador legacy TorchScript, opset 18 |
| Parámetros totales | 1,4 B (heredados del modelo base `angel-gitt/privacy-filter-gbai`) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8) aplicada con ONNX Runtime sobre el grafo ONNX |
| Idiomas soportados | no disponible (la cadena upstream incluye un modelo denominado `privacy-filter-multilingual-v2`, pero no se detalla la lista de idiomas) |
| Licencia | Apache-2.0 (heredada de los modelos upstream) |
| Formato de pesos | ONNX (`onnx/model_int8.onnx` y `onnx/model_int8.onnx.data`); metadata en `config.json`, `id2label.json`, `tokenizer.json` y `tokenizer_config.json` |
| Tarea | Token classification (217 etiquetas de PII) |
| Tamaño del repositorio | 1,8 GB (el grafo INT8 ocupa aproximadamente 1,7 GB) |
| Librería | openmed |
| Pipeline declarado | token-classification |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas de mezcla de expertos (MoE) de 1,4 B de parámetros, orientado a clasificación de tokens sobre 217 etiquetas de PII. El autor de esta ficha no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a los modelos upstream y no se detallan en la información disponible.

La innovación técnica de esta exportación es de ingeniería de inferencia, no de entrenamiento. El forward original de la capa MoE contenía un bucle sobre expertos con formas dependientes de los datos, incompatible con una exportación ONNX correcta. Se sustituyó por un `matmul` vectorizado sobre todos los expertos: el resultado es matemáticamente idéntico, pero con formas estáticas, lo que permite exportar el grafo y, además, que ONNX Runtime cuantice los pesos de los expertos al usar `matmul` en lugar de `einsum`. Sobre ese grafo se aplicó cuantización dinámica INT8 (QInt8) con ONNX Runtime, sin reentrenamiento posterior.

## Capacidades

- Detección y clasificación de entidades PII en texto mediante token classification, con un espacio de 217 etiquetas.
- Salida estructurada por entidad: etiqueta, texto detectado y puntuación de confianza.
- Integración con la librería `openmed` a través de `load_onnx_model(..., variant="int8")` y el método `predict`.
- Ejecución en CPU con ONNX Runtime, gracias a la cuantización INT8 dinámica.
- Generación de texto: no aplica, el modelo es discriminativo y no genera secuencias.
- Razonamiento multi-paso, tool calling o function calling: no disponibles y no aplicables a la tarea declarada.
- Capacidades de agente: no disponibles.
- Visión, audio o modo "thinking": no disponibles.
- Cobertura multilingüe: no confirmada en la información proporcionada.

## Casos de uso

- Redacción de PII en pipelines de ingesta de datos: el modelo se coloca como paso previo al almacenamiento y etiqueta las entidades sensibles de cada registro para enmascararlas antes de escribirlas en el data lake.
- Cumplimiento del RGPD en atención al cliente: procesado de transcripciones de chat o correo para localizar y anonimizar datos personales antes de que el contenido se derive a analítica o a terceros.
- Saneado de datasets de entrenamiento: filtrado de corpus que contienen correos, teléfonos o identificadores antes de usarlos para entrenar o ajustar otros modelos.
- Protección de logs y telemetría: análisis de trazas de aplicación en busca de PII antes de enviarlas a sistemas de observabilidad o a almacenamiento a largo plazo.
- Preprocesado de pipelines RAG: redacción de documentos antes de indexarlos en una base vectorial, de forma que el recuperador nunca exponga datos personales.
- Despliegue en servidores sin GPU: al ser un grafo ONNX INT8 pensado para ONNX Runtime CPU, encaja en entornos de CPU única o contenedores ligeros donde no hay acelerador disponible.
- Revisión documental a escala: clasificación por lotes de expedientes o contratos para marcar automáticamente los fragmentos que requieren revisión por parte de un responsable de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall o F1 sobre conjuntos de evaluación de PII, ni comparaciones con el checkpoint original en FP32 que permitan cuantificar la degradación introducida por la cuantización INT8 dinámica.

## Requisitos de hardware

- VRAM para inferencia en GPU: no disponible. El autor orienta el artefacto a ONNX Runtime CPU.
- Memoria RAM estimada para CPU: a partir del tamaño del grafo (~1,7 GB), se necesita al menos esa cantidad de memoria para los pesos, más el espacio de activaciones y del tokenizador; una estimación prudente es un mínimo de 4 GB de RAM disponible.
- GPUs recomendadas: no disponibles. No se documentan pruebas con A100, H100 o RTX 4090.
- GPU de consumo: no confirmado. Por el tamaño del artefacto, en términos de memoria cabría en GPUs de consumo con 4 GB o más si se usa el ejecutor de ONNX Runtime con soporte CUDA, pero esta vía no está documentada por el autor.
- Opciones de despliegue: ONNX Runtime (CPU y, en su caso, GPU) a través de la librería `openmed`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; además, al no ser un modelo generativo, esas herramientas no son el cauce natural.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Cuantización | Licencia |
|---|---|---|---|---|---|
| `fcaravac/privacy-filter-gbai-int8` (este) | 1,4 B | no disponible | ONNX + metadata | INT8 dinámica (QInt8) | Apache-2.0 |
| `angel-gitt/privacy-filter-gbai` | 1,4 B | no disponible | no disponible | ninguna documentada | Apache-2.0 |
| `OpenMed/privacy-filter-multilingual-v2` | no disponible | no disponible | no disponible | ninguna documentada | Apache-2.0 |
| `openai/privacy-filter` | no disponible | no disponible | no disponible | ninguna documentada | Apache-2.0 |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada. La diferencia documentada entre este modelo y sus antecesores es exclusivamente el formato de exportación (ONNX), la vectorización del forward de la capa MoE y la cuantización INT8; el espacio de 217 etiquetas de PII y la licencia Apache-2.0 se mantienen.

## Limitaciones y advertencias

- La cuantización INT8 dinámica puede degradar la precisión respecto al checkpoint original, y el autor no publica ninguna evaluación que cuantifique esa pérdida. No se recomienda su uso en producción sin una validación propia sobre un conjunto de test representativo.
- No se especifican los idiomas soportados. Aunque la cadena upstream incluye una variante denominada multilingüe, no hay confirmación de cobertura lingüística para esta exportación concreta.
- Riesgo de falsos negativos: cualquier entidad PII que no encaje en el conjunto de 217 etiquetas no será detectada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo equivalente de falsos positivos, es decir, fragmentos de texto marcados como PII sin serlo.
- El modelo no genera texto ni razona; no debe emplearse para tareas distintas de la clasificación de tokens.
- Licencia Apache-2.0, heredada de los modelos upstream. Permite uso comercial, pero conviene revisar la cadena de procedencia completa para cumplir con las condiciones de atribución.
- El repositorio presenta 0 descargas y 0 likes, sin validación por parte de la comunidad.
- No se documentan requisitos de hardware, latencias ni límites de longitud de entrada, lo que dificulta el dimensionamiento previo de un despliegue.
- La fecha de creación del repositorio indicada en la ficha de HuggingFace es el 24 de septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fcaravac/privacy-filter-gbai-int8
- Modelo base: https://huggingface.co/angel-gitt/privacy-filter-gbai
- Upstream intermedio: https://huggingface.co/OpenMed/privacy-filter-multilingual-v2
- Upstream original: https://huggingface.co/openai/privacy-filter
