# ACloudCenter/ami-addressee-distilbert

## Resumen

ACloudCenter/ami-addressee-distilbert es un modelo de clasificación de texto publicado por el usuario ACloudCenter en HuggingFace. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased, la variante destilada de BERT desarrollada por HuggingFace, y cuenta con 66.955.010 parámetros según el recuento de los pesos en safetensors. El repositorio se creó y actualizó el 20 de septiembre de 2026, ocupa 0,3 GB y, en el momento de la consulta, no acumula descargas ni interacciones.

El modelo se distribuye bajo licencia Apache-2.0 y está etiquetado para la tarea de text-classification, además de ser compatible con text-embeddings-inference y con endpoints gestionados. El nombre del repositorio sugiere una función de detección de destinatario (addressee detection) en el contexto del corpus de reuniones AMI, aunque la model card no confirma ni describe el conjunto de etiquetas ni el dominio de aplicación, por lo que esa interpretación debe tratarse como una hipótesis a verificar.

Su relevancia práctica es limitada pero clara: se trata de un clasificador pequeño, rápido y desplegable en CPU, útil para tareas de etiquetado a gran escala o como componente de pre-filtrado. La model card, sin embargo, es un artefacto autogenerado por el Trainer de HuggingFace con secciones enteras marcadas como "More information needed", sin datos de entrenamiento, sin descripción del etiquetado y sin resultados de benchmarks estándar, lo que dificulta su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT); 6 capas, dimensión oculta 768, 12 cabezas de atención según la documentación del modelo base |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base distilbert-base-uncased admite 512 tokens |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas. El tamaño del repositorio (0,3 GB) es coherente con pesos en FP32 (66,95 M × 4 bytes ≈ 268 MB) |
| Idiomas soportados | no disponible; el modelo base distilbert-base-uncased se entrena principalmente con texto en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un encoder transformer de 6 capas obtenido mediante destilación de conocimiento a partir de bert-base-uncased, con 66 millones de parámetros: aproximadamente un 40 % menos que BERT-base y en torno a un 60 % más rápido en inferencia, a costa de una pérdida de rendimiento estimada por sus autores originales en torno a un 3 % en GLUE. El modelo trabaja sobre tokenización WordPiece con vocabulario uncased. La model card no documenta ninguna modificación estructural sobre esta base ni la adición de cabezas específicas; al estar etiquetado como text-classification, se trata de un ajuste fino de una cabeza de clasificación.

En cuanto al entrenamiento, la model card únicamente expone los hiperparámetros y la curva de validación; el conjunto de datos aparece literalmente como "None dataset" y las secciones de datos de entrenamiento y evaluación están marcadas como "More information needed". Los hiperparámetros son: learning rate 2e-05, batch de entrenamiento 32, batch de evaluación 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio 0,1 y 3 epochs completas. Con 898 pasos por epoch y batch 32, el conjunto de entrenamiento rondaría los 28.700 ejemplos por epoch, cifra inferida del recuento de pasos y no confirmada por el autor. El entrenamiento se realizó con Transformers 4.57.6, PyTorch 2.14.0+cu130, Datasets 5.0.1 y Tokenizers 0.22.2.

No se declara uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador de este tamaño. La innovación técnica es nula: es un ajuste fino estándar con el Trainer de HuggingFace. La curva registrada muestra sobreajuste a partir de la segunda epoch: la pérdida de entrenamiento baja de 0,2603 a 0,2435 y sube a 0,2624, mientras la pérdida de validación asciende de forma monótona (0,3613 → 0,3718 → 0,3827) y la AUC alcanza su máximo en la epoch 2 (0,9293) para caer en la 3 (0,9268). El mejor checkpoint habría sido el de la epoch 2, no el final.

## Capacidades

- Clasificación de texto: es la única tarea declarada en el pipeline del repositorio. La salida es una etiqueta (o distribución de etiquetas) sobre una secuencia de entrada.
- Generación de texto: no soportada. Es un encoder bidireccional sin cabeza de lenguaje.
- Razonamiento, matemáticas, código: no soportados ni evaluados.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado. El modelo procesa una entrada y devuelve una etiqueta en una sola pasada.
- Capacidades multilingües: no declaradas. El modelo base es monolingüe en inglés.
- Capacidad especial: ninguna documentada (no hay modo thinking, visión ni audio).
- Integración: compatible con text-embeddings-inference y con endpoints gestionados, según las etiquetas del repositorio.

## Casos de uso

Debe tenerse en cuenta que la model card no documenta el esquema de etiquetas ni el dominio, por lo que los casos siguientes son aplicaciones plausibles de un clasificador DistilBERT ajustado, no funciones confirmadas por el autor.

- Detección de destinatario en reuniones: si la etiqueta objetivo es, como sugiere el nombre del repositorio, determinar a quién se dirige un interlocutor en una transcripción, el modelo podría integrarse en sistemas de análisis de reuniones para atribuir turnos de habla y construir grafos de interacción. La ventana de 512 tokens lo limita a turnos o fragmentos cortos, no a transcripciones completas.
- Enrutado de tickets de soporte: clasificar cada ticket entrante en una categoría y dirigirlo al equipo correspondiente. Los 67 millones de parámetros permiten ejecutarlo en CPU con latencia de milisegundos, lo que hace viable procesar decenas de miles de tickets al día sin GPU.
- Moderación y filtrado de contenido: como primera etapa de un pipeline de moderación que descarte el grueso del tráfico y derive solo los casos dudosos a un modelo mayor. El coste por inferencia es mínimo.
- Pre-filtrado en pipelines RAG: etiquetar o descartar documentos y fragmentos antes de la indexación vectorial, reduciendo el volumen que llega al recuperador y al modelo generativo.
- Análisis de sentimiento o intención en asistentes conversacionales: si el ajuste se realizó sobre un corpus de intenciones, podría usarse para decidir la siguiente acción de un bot de diálogo, siempre que el conjunto de etiquetas sea cerrado y conocido.
- Triaje de reseñas y encuestas: clasificar comentarios de clientes por tema o polaridad para alimentar cuadros de mando agregados, aprovechando que el modelo corre en cualquier CPU.
- Etiquetado a gran escala para anotación asistida: aplicar el modelo sobre corpus de millones de documentos para preetiquetar y que anotadores humanos revisen únicamente las muestras de baja confianza, reduciendo el coste de anotación.
- Extracción de señales en investigación: como línea base pequeña y reproducible en experimentos de clasificación, útil para comparar contra arquitecturas mayores con un presupuesto de cómputo reducido.

## Benchmarks y rendimiento

El model-index del repositorio contiene una entrada con la lista de resultados vacía, por lo que no hay benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K u otros) publicados. Los únicos datos numéricos disponibles son las métricas de validación declaradas por el autor durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss (validación, epoch 3 / final) | 0,3827 |
| AUC (validación, epoch 3 / final) | 0,9268 |
| AUC (mejor valor registrado, epoch 2) | 0,9293 |
| Loss (validación, epoch 2) | 0,3718 |

| Training loss | Epoch | Step | Validation loss | AUC |
|---|---|---|---|---|
| 0,2603 | 1,0 | 898 | 0,3613 | 0,9199 |
| 0,2435 | 2,0 | 1796 | 0,3718 | 0,9293 |
| 0,2624 | 3,0 | 2694 | 0,3827 | 0,9268 |

No se dispone de la composición del conjunto de evaluación, del número de ejemplos ni del equilibrio entre clases, por lo que la AUC de 0,9268 no es interpretable en términos absolutos: en un problema muy desbalanceado, una AUC alta puede convivir con una precisión pobre en la clase minoritaria. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP32, 0,13 GB en FP16 y 0,07 GB en INT8, a lo que hay que sumar la memoria de activaciones (del orden de decenas o pocos cientos de MB según el tamaño de batch y la longitud de secuencia). En la práctica, cabe en cualquier GPU con 1 GB de VRAM.
- GPU recomendadas: no requiere GPU. Funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050 en adelante, RTX 3060, RTX 4090) lo ejecuta con margen de sobra, y también es viable en GPU integradas y en aceleradores de borde.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en nodos sin GPU.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference y endpoints gestionados (según las etiquetas del repositorio), además de exportación a ONNX y ejecución con ONNX Runtime u OpenVINO para maximizar el rendimiento en CPU. No se publican pesos en GGUF, por lo que llama.cpp y Ollama no son vías directas de despliegue para este repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens o ejemplos por segundo.

## Comparativa con modelos similares

La comparativa se limita a datos públicos de arquitectura, licencia y tamaño de los modelos base, ya que el autor no publica métricas comparables. No es posible comparar rendimiento.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ami-addressee-distilbert | 66,95 M | 512 tokens (heredado del base) | Apache-2.0 | Ajuste fino; sin benchmarks publicados |
| distilbert-base-uncased | ~66,9 M | 512 tokens | Apache-2.0 | Modelo base sin ajustar; referencia de arquitectura |
| bert-base-uncased | ~110 M | 512 tokens | Apache-2.0 | Encoder mayor, más lento y preciso que DistilBERT en GLUE según sus autores |
| roberta-base | ~125 M | 512 tokens | MIT | Encoder BERT mejorado, entrenado con más datos; mayor coste de inferencia |

En cuanto a rendimiento específico, no disponible: no se han publicado resultados comparables entre este modelo y las alternativas.

## Limitaciones y advertencias

- Documentación insuficiente: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento y evaluación están marcadas como "More information needed". No se puede saber qué etiquetas predice el modelo ni sobre qué distribución de datos fue entrenado.
- Sin resultados de benchmarks: el model-index está vacío. La única métrica disponible es una AUC de 0,9268 sobre un conjunto de evaluación no descrito, sin número de ejemplos ni balance de clases.
- Sobreajuste evidenciado: la pérdida de validación crece de forma monótona a lo largo de las tres epochs y la AUC cae en la última. Los pesos publicados corresponden al peor punto de la curva registrada, no al mejor.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza, especialmente en dominios distintos al de entrenamiento. Al ser un modelo pequeño destilado, su calibración suele ser peor que la de modelos mayores.
- Sesgos: heredados de distilbert-base-uncased, entrenado sobre Wikipedia en inglés y el Toronto Book Corpus. Es esperable sesgo de género, origen y registro lingüístico, además de un rendimiento degradado fuera del inglés.
- Limitación de idioma y contexto: el modelo base es monolingüe en inglés y está limitado a 512 tokens, insuficiente para documentos largos o conversaciones completas. Un texto más largo debe truncarse o segmentarse, con la consiguiente pérdida de información.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No obstante, al desconocerse la procedencia de los datos de ajuste fino, no es posible auditar el riesgo legal asociado al corpus de entrenamiento.
- Adopción nula: cero descargas y cero interacciones en el momento de la consulta, sin mantenimiento ni issues verificables. No es un modelo con respaldo de la comunidad.
- Nombre ambiguo: la interpretación como detector de destinatario sobre el corpus AMI es una inferencia a partir del identificador del repositorio, no una afirmación del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ACloudCenter/ami-addressee-distilbert
- Modelo base: https://huggingface.co/distilbert-base-uncased
- La búsqueda web realizada no devolvió ningún enlace relevante al modelo: los resultados se limitan a páginas genéricas de Google (Traductor, Drive, Chrome, Imágenes) sin relación con el repositorio. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.
