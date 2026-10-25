# hoisie/opensearch-neural-sparse-encoding-doc-v3-distill-onnx

## Resumen

Este repositorio contiene una exportación a ONNX del codificador de documentos del modelo `opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill`, publicado por el usuario `hoisie`. No es un modelo nuevo: según el README, los pesos son idénticos a los del checkpoint original (revisión `babf71f3c48695e2e53a978208e8aba48335e3c0`) y solo cambia el formato. La particularidad técnica es que el pooling SPLADE se ha fusionado dentro del grafo, de modo que la salida del grafo ya es el vector disperso aprendido y el consumidor no necesita replicar ese paso en Python.

El modelo base pertenece a la familia de recuperación léxica dispersa aprendida (learned sparse retrieval) de OpenSearch, con esquema SPLADE: en lugar de embeddings densos, produce pesos por término del vocabulario, lo que permite indexar en motores de búsqueda que trabajan con representaciones dispersas y combinar la búsqueda neuronal con BM25 en pipelines híbridos.

Su relevancia es operativa: permite servir el codificador con ONNX Runtime sin dependencia de PyTorch, algo útil para indexación por lotes en CPU, entornos con restricciones de memoria o despliegues dentro de OpenSearch. El repositorio ocupa 0,4 GB, la licencia es Apache-2.0 y el autor documenta la reproducibilidad exacta del export mediante un script y versiones de dependencias fijadas. No hay métricas de uso ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de documentos con pooling SPLADE fusionado en el grafo ONNX; detalles internos de la red (capas, dimensiones) no disponibles |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponibles. El README indica que los pesos no se modifican; la etiqueta de Hugging Face incluye `base_model:quantized:opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill`, dato que conviene verificar antes de asumir precisión completa |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), más `tokenizer.json` e `idf.json` |
| Tarea | Learned sparse retrieval (SPLADE), codificación de documentos |
| Modelo base | `opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill` (revisión `babf71f3c48695e2e53a978208e8aba48335e3c0`) |
| Librería declarada | `onnx` |
| Tamaño del repositorio | 0,4 GB |
| SHA-256 de `model.onnx` | `833c1369786605169a1f8c6f7c7dd57e1f29d6b58a54030b180b9f64fc84a15b` |
| SHA-256 de `tokenizer.json` | `91f1def9b9391fdabe028cd3f3fcc4efd34e5d1f08c3bf2de513ebb5911a1854` (upstream, sin cambios) |
| SHA-256 de `idf.json` | `da23a1c0b9252776cc8c6d70fd14723e218f484d489cd9027ac6e4065d5b9edd` (upstream, sin cambios) |

## Arquitectura y entrenamiento

El artefacto es un export ONNX de un codificador de documentos para recuperación dispersa aprendida. El README confirma que se trata del codificador de documentos (no del codificador de consultas) y que el pooling SPLADE está integrado en el grafo, por lo que la salida es directamente la representación dispersa por término. Los pesos se mantienen sin cambios respecto al checkpoint upstream; el export no introduce fine-tuning ni alteración de parámetros.

El procedimiento de export está documentado y es reproducible: el script `export-sparse-onnx.py` ejecutado sobre un checkout del repositorio upstream, en un entorno virtual con `torch==2.14.1` (rueda de CPU), `transformers==5.20.2`, `onnx==1.23.2`, `numpy==2.5.4` y `safetensors==0.8.0`, genera un `model.onnx` determinista que reproduce el SHA-256 indicado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los detalles de destilación implícitos en el sufijo «distill» del checkpoint original.

## Capacidades

- Codificación de documentos en vectores dispersos con expansión de términos propia de SPLADE (un documento puede activar términos que no aparecen literalmente en el texto).
- Generación de pesos por término reutilizables para indexación en OpenSearch y motores compatibles con neural sparse search.
- Ejecución con ONNX Runtime, incluyendo CPU, sin necesidad de instalar PyTorch ni `transformers` en el entorno de serving.
- Integración en pipelines de búsqueda híbrida: la señal dispersa neuronal puede combinarse con BM25 sobre el mismo índice invertido.
- Inclusión del tokenizador (`tokenizer.json`) y del fichero de IDF (`idf.json`) necesarios para el preprocesado y el cálculo de pesos en la fase de puntuación.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión ni audio: es exclusivamente un codificador de recuperación.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Indexación por lotes en OpenSearch: el grafo ONNX se ejecuta sobre los documentos de un corpus para poblar un campo `sparse_vector` en el índice, sin necesidad de un clúster con GPU ni de dependencias de PyTorch en los workers de ingesta.
- Búsqueda híbrida en producción: combinar la puntuación dispersa del modelo con BM25 sobre el mismo índice permite recuperar tanto coincidencias léxicas exactas como expansiones semánticas de términos, algo útil en catálogos de producto y documentación técnica.
- Serving en CPU o entornos con memoria limitada: al poder ejecutarse con ONNX Runtime y ocupar el repositorio 0,4 GB, encaja en contenedores pequeños, funciones serverless o appliances donde instalar el stack de PyTorch no es viable.
- Recuperación para RAG en dominios con jerga: la expansión de términos ayuda cuando la consulta del usuario y el documento usan vocabulario distinto (por ejemplo, nombres comerciales frente a denominaciones técnicas), manteniendo la eficiencia de un índice invertido.
- Reindexación y migraciones controladas: el SHA-256 publicado y la reproducibilidad del export permiten verificar que el artefacto desplegado corresponde exactamente al checkpoint upstream auditado, requisito habitual en entornos regulados.
- Evaluación comparativa de recuperadores: servir este ONNX junto a otros recuperadores dispersos en el mismo benchmark interno permite medir latencia y calidad sin que el formato de pesos introduzca diferencias de implementación.
- Despliegue en motores de inferencia polivalentes: al ser un grafo ONNX estándar, puede cargarse en servidores compatibles con ONNX Runtime o en pipelines de procesamiento por lotes ya existentes en la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta al no conocerse el número de parámetros; el repositorio completo ocupa 0,4 GB, por lo que el grafo es manejable en memoria en equipos convencionales.
- GPU recomendadas: no disponibles. El export se generó con la rueda de CPU de PyTorch y el caso de uso natural es la inferencia en CPU mediante ONNX Runtime; no hay datos publicados sobre aceleración en A100, H100 o RTX 4090.
- GPU de consumo: no hay información que confirme ni descarte su idoneidad; el despliegue en CPU es la vía documentada implícitamente por el formato y el tamaño.
- Opciones de despliegue: ONNX Runtime (CPU o con execution providers), servidores compatibles con ONNX, y ejecución dentro de pipelines de indexación de OpenSearch. No hay soporte declarado para vLLM, TGI o llama.cpp, que no aplican a un codificador de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `hoisie/opensearch-neural-sparse-encoding-doc-v3-distill-onnx` | ONNX | Codificador de documentos SPLADE | No disponible | No disponible | Apache-2.0 | Hugging Face, 0 descargas |
| `opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill` (upstream) | PyTorch / safetensors | Codificador de documentos SPLADE | No disponible | No disponible | Apache-2.0 | Hugging Face, mantenido por el proyecto OpenSearch |
| Codificador de consultas de la misma familia OpenSearch | No disponible | Codificación de consultas | No disponible | No disponible | No disponible | No incluido en este repositorio; necesario para completar el pipeline |
| BM25 (Lucene / OpenSearch) | No aplica (modelo estadístico) | Recuperación léxica | No aplica | No aplica | Apache-2.0 (Lucene) | Incluido en OpenSearch |

La comparación cuantitativa de calidad (nDCG, MRR, recall) con recuperadores dispersos alternativos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se exporta el codificador de documentos. Para ejecutar una búsqueda completa hace falta el codificador de consultas correspondiente, que no forma parte de este repositorio.
- No hay resultados de benchmarks publicados para este export; cualquier afirmación sobre calidad de recuperación debe validarse con una evaluación propia sobre el corpus objetivo.
- El README afirma que los pesos no cambian, pero la etiqueta de Hugging Face incluye `base_model:quantized:...`, lo que introduce ambigüedad sobre la precisión numérica del artefacto. Conviene verificar el tipo de dato del grafo antes de comparar puntuaciones con el checkpoint upstream.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe sin evaluarla.
- Longitud máxima de secuencia y política de truncado no documentadas: los documentos largos pueden perder contenido relevante en la codificación.
- La reproducibilidad del export depende de versiones muy concretas (`torch==2.14.1`, `transformers==5.20.2`, `onnx==1.23.2`, `numpy==2.5.4`, `safetensors==0.8.0`); otras versiones pueden generar un grafo funcionalmente equivalente pero con distinto hash.
- `tokenizer.json` e `idf.json` deben usarse exactamente en las versiones publicadas: un desajuste entre el IDF de indexación y el de consulta altera la puntuación de forma silenciosa.
- La expansión de términos de SPLADE puede introducir falsos positivos semánticos (documentos recuperados por términos expandidos poco relacionados), lo que exige calibrar el umbral de pesos distintos de cero.
- El riesgo de alucinación no aplica en sentido estricto porque el modelo no genera texto, pero sí existe riesgo de recuperación incorrecta si se usa como única etapa de ranking.
- El repositorio no tiene descargas ni likes, y no está publicado por la organización OpenSearch sino por un tercero: no hay validación comunitaria que respalde su mantenimiento.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia y de indicar cambios; no hay cláusulas de uso restringido adicionales declaradas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hoisie/opensearch-neural-sparse-encoding-doc-v3-distill-onnx
- Modelo base (upstream): https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill
- Revisión concreta exportada: `babf71f3c48695e2e53a978208e8aba48335e3c0` del repositorio upstream
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
