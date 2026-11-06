# arlenecc/potion-multilingual-128M-onnx-int4

## Resumen

`arlenecc/potion-multilingual-128M-onnx-int4` es una conversión a ONNX con cuantización INT4 del modelo de embeddings `potion-multilingual-128M`, publicado por el usuario `arlenecc` en Hugging Face. Se trata de un modelo de representaciones vectoriales (embeddings) derivado de la familia Potion de MinishLab, que emplea la técnica Model2Vec: destilación de un transformer de gran tamaño en una tabla estática de embeddings, lo que elimina por completo el mecanismo de atención y permite inferencias extremadamente rápidas sin GPU.

El modelo resuelve el problema de generar embeddings multilingües de frases y documentos con un coste computacional mínimo, adecuado para búsqueda semántica, clustering y sistemas de recuperación en entornos con recursos limitados o de bajas latencias. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT, lo que facilita su uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue (formato ONNX INT4) más que de un modelo novedoso: no hay información publicada sobre benchmarks, idiomas soportados ni detalles de entrenamiento en la model card, por lo que muchos campos de esta ficha se marcan como «no disponible».

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estáticos destilados; sin transformer ni atención) |
| Parámetros totales | 128M (según el nombre del modelo; no confirmado en la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (ONNX) |
| Idiomas soportados | no disponible (el nombre indica «multilingual», sin lista explícita) |
| Licencia | MIT |
| Formato de pesos | ONNX (model2vec-onnx) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Model2Vec, una técnica desarrollada por MinishLab que destila un modelo transformer de embeddings (típicamente de la familia BGE o similar) en una tabla de embeddings de tokens estática. En inferencia, la representación de una frase se obtiene promediando (con pesos opcionales) los vectores de sus tokens, sin pasar por capas de atención ni por un encoder. Esto reduce el coste de inferencia a una búsqueda en tabla y un pooling, con una huella de memoria muy inferior a la de un transformer equivalente.

No se dispone de información sobre el proceso de entrenamiento específico de esta conversión: la model card no detalla el número de tokens de destilación, la composición del dataset, ni si hubo ajuste fino posterior. La conversión a ONNX INT4 la ha realizado el usuario `arlenecc`, no el equipo original de MinishLab, por lo que se trata de un artefacto derivado y no de un lanzamiento oficial.

## Capacidades

- Generación de embeddings de frases y documentos para búsqueda semántica y similitud vectorial.
- Soporte multilingüe declarado en el nombre del modelo (lista de idiomas no disponible).
- Inferencia sin GPU: al ser un modelo estático, puede ejecutarse en CPU con latencias muy bajas.
- Compatible con el ecosistema `model2vec-onnx`, lo que permite su uso con ONNX Runtime.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo «thinking» ni capacidades de agente.
- No se documentan capacidades de audio ni multimodalidad.

## Casos de uso

- Búsqueda semántica en producción: el modelo puede indexar y consultar grandes volúmenes de documentos en CPU, ya que al ser un modelo estático el coste por consulta es de microsegundos y no requiere GPU. Adecuado para motores de búsqueda internos o RAG con requisitos de latencia estrictos.
- Deduplicación y clustering de textos: al generar embeddings rápidos y deterministas, se puede agrupar grandes corpus (reseñas, tickets, noticias) con técnicas como k-means o DBSCAN sin incurrir en costes de inferencia de un transformer.
- Filtrado previo en pipelines RAG: usar este modelo como primera etapa de recuperación (retrieval) de bajo coste antes de un re-ranker más pesado, reduciendo el número de candidatos que pasan al modelo grande.
- Clasificación de textos por similitud: comparar la representación de un texto con prototipos de categorías para etiquetado zero-shot ligero, útil en moderación de contenido o triaje de correos.
- Embeddings en dispositivos edge: al caber en 0,1 GB y ejecutarse en CPU, puede desplegarse en entornos con memoria limitada (Raspberry Pi, contenedores pequeños, funciones serverless) para búsqueda local o recomendación.
- Detección de duplicados multilingües: si el modelo cumple su promesa multilingüe, puede comparar textos en distintos idiomas para detectar traducciones duplicadas o contenido repetido en plataformas internacionales.
- Enriquecimiento de bases de datos vectoriales: generar embeddings de forma masiva y económica para poblar índices en FAISS, Qdrant o pgvector sin necesidad de aprovisionar GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (no requiere GPU; el modelo se ejecuta en CPU).
- Tamaño en disco: aproximadamente 0,1 GB (repo completo, incluye pesos ONNX INT4).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En caso de usar GPU, una GPU integrada o cualquier tarjeta con soporte ONNX Runtime serviría.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos con más de 100 MB de RAM libre.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), `model2vec` con backend ONNX, y potencialmente `llama.cpp` no aplica (no es un modelo generativo). También puede servirse mediante FastAPI o similares envolviendo ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza de Model2Vec, se espera un throughput muy alto en CPU (del orden de miles de frases por segundo), pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| arlenecc/potion-multilingual-128M-onnx-int4 | 128M (según nombre) | no disponible | ONNX INT4 | MIT | Conversión comunitaria, sin benchmarks publicados |
| minishlab/potion-multilingual-128M | 128M | no disponible | safetensors / model2vec | MIT | Modelo original de MinishLab; referencia para comparar calidad |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118M | 128 tokens | safetensors / PyTorch | Apache 2.0 | Transformer multilingüe clásico; más pesado en inferencia |
| BAAI/bge-m3 | ~568M | 8192 tokens | safetensors | MIT | Embeddings multilingües de alta calidad, pero requiere GPU para latencias bajas |

La comparación con el modelo original de MinishLab es la más relevante: esta conversión INT4 debería ofrecer una calidad de embeddings similar a la del modelo original, con una reducción de precisión derivada de la cuantización a 4 bits que no está cuantificada en la información disponible.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad de los embeddings tras la cuantización INT4; la degradación respecto al modelo original es desconocida.
- La model card no especifica la lista de idiomas soportados ni el rendimiento por idioma; el término «multilingual» es una declaración del nombre, no una garantía documentada.
- Al ser un modelo estático (Model2Vec), no captura dependencias de largo alcance ni orden de palabras más allá del pooling de tokens; es inferior a un transformer en tareas que requieren comprensión sintáctica fina.
- No es un modelo generativo: no puede usarse para chat, resumen, traducción ni código.
- Riesgo de sesgos heredados del modelo transformer original del que se destiló; no se documenta ninguna mitigación.
- Licencia MIT permite uso comercial, pero al ser una conversión comunitaria no oficial, el usuario debe verificar la procedencia y la integridad de los pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No hay información sobre la longitud máxima de entrada ni sobre el tokenizador utilizado; es necesario inspeccionar los archivos del repo para confirmarlo.

## Enlaces

- Hugging Face: https://huggingface.co/arlenecc/potion-multilingual-128M-onnx-int4
- Modelo original (referencia): https://huggingface.co/minishlab/potion-multilingual-128M
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Documentación de ONNX Runtime: https://onnxruntime.ai/
