# PYTHAI/ms-marco-MiniLM-L6-v2-fork

## Resumen

PYTHAI/ms-marco-MiniLM-L6-v2-fork es un cross-encoder para reordenamiento (reranking) de pasajes en tareas de recuperacion de informacion, publicado por PYTHAI (mindX) como una copia fijada del modelo original `cross-encoder/ms-marco-MiniLM-L6-v2`. El modelo recibe un par consulta-pasaje y devuelve una puntuacion de relevancia, lo que permite reordenar los resultados de un recuperador inicial (por ejemplo, BM25 o ElasticSearch) y mejorar la precision del ranking final.

Se trata de un transformer BERT de tipo MiniLM con 22.714.113 parametros, entrenado sobre el dataset MS MARCO Passage Ranking para la tarea de passage reranking. Es un modelo compacto y rapido (1800 documentos por segundo en una V100 segun la model card del autor original), pensado para integrarse como segunda etapa en pipelines de busqueda y RAG, donde el coste por par evaluado es critico.

La relevancia de este fork concreto es limitada: no introduce cambios tecnicos respecto al original, sino que fija los pesos en un commit concreto (`233902d25c440f23af6f7d6e94d2946bac0bee0a`) para garantizar reproducibilidad. La model card indica que los pesos se copiaron y que el fork es autonomo, mantenido como modelo de referencia por mindX. No registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT tipo MiniLM (cross-encoder) |
| Parametros totales | 22.714.113 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los cross-encoder MiniLM de MS MARCO usan habitualmente 512 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo incluye pesos safetensors, ONNX, OpenVINO y JAX |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, pytorch, onnx, openvino, jax |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en MiniLM: un transformer BERT de 6 capas que procesa conjuntamente la consulta y el pasaje como una unica secuencia de entrada, con un cabezal de clasificacion que produce una puntuacion escalar de relevancia. A diferencia de los bi-encoders, que codifican consulta y documento por separado, el cross-encoder atiende a ambos simultaneamente, lo que mejora la precision del ranking a costa de un mayor coste computacional por par evaluado.

El entrenamiento se realizo sobre el dataset `sentence-transformers/msmarco`, derivado de la tarea MS MARCO Passage Ranking, con el codigo de entrenamiento publicado por SentenceTransformers. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.), ya que se trata de un fork de pesos sin modificaciones.

## Capacidades

- Puntuacion de relevancia consulta-pasaje para reranking en recuperacion de informacion.
- Reordenamiento de resultados de un recuperador inicial (BM25, ElasticSearch, busqueda vectorial) en pipelines de retrieve-and-rerank.
- Clasificacion de pares texto-texto (pipeline `text-ranking`).
- Integracion con SentenceTransformers mediante `CrossEncoder` y con Transformers mediante `AutoModelForSequenceClassification`.
- Exportacion a multiples runtimes: PyTorch, ONNX, OpenVINO y JAX, lo que facilita el despliegue en CPU, GPU y aceleradores Intel.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta generacion de texto, razonamiento generativo, codigo, matematicas, vision, audio, tool calling ni agentes: es exclusivamente un modelo de ranking.
- Capacidad multilingue: no, solo ingles.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N pasajes mas relevantes con un bi-encoder o BM25, el cross-encoder puntua cada par consulta-pasaje y reordena, mejorando la precision del contexto entregado al LLM generador.
- Busqueda empresarial interna: reordenar resultados de un indice ElasticSearch sobre documentacion corporativa, con 1800 documentos por segundo en V100 segun la model card, lo que permite reranking en linea sobre decenas de candidatos por consulta.
- Busqueda en sitios de documentacion tecnica: dado su bajo coste por inferencia, se puede aplicar a cada consulta de usuario sin degradar la latencia del buscador.
- Filtrado de candidatos en sistemas de QA extractivo: puntuar pasajes antes de pasarlos a un modelo de lectura o a un LLM, reduciendo el numero de documentos procesados por etapas mas caras.
- Evaluacion de calidad de recuperadores: usar las puntuaciones del cross-encoder como referencia para medir y comparar el rendimiento de distintos sistemas de recuperacion.
- Despliegue en CPU o entornos con OpenVINO: gracias a las exportaciones ONNX y OpenVINO y a sus 22,7 millones de parametros, puede ejecutarse en servidores sin GPU para reranking de baja latencia.

## Benchmarks y rendimiento

Datos de la model card del autor original (evaluados en una V100):

| Modelo | NDCG@10 (TREC DL 19) | MRR@10 (MS Marco Dev) | Docs / s |
|---|---|---|---|
| cross-encoder/ms-marco-MiniLM-L6-v2 (base de este fork) | 74.30 | 39.01 | 1800 |
| cross-encoder/ms-marco-MiniLM-L12-v2 | 74.31 | 39.02 | 960 |
| cross-encoder/ms-marco-MiniLM-L4-v2 | 73.04 | 37.70 | 2500 |
| cross-encoder/ms-marco-MiniLM-L2-v2 | 71.01 | 34.85 | 4100 |
| cross-encoder/ms-marco-TinyBERT-L2-v2 | 69.84 | 32.56 | 9000 |
| nboost/pt-bert-base-uncased-msmarco | 70.94 | 34.75 | 340 |
| nboost/pt-bert-large-msmarco | 73.36 | 36.48 | 100 |

No se han publicado resultados de benchmarks especificos para este fork en la informacion disponible; los datos anteriores corresponden al modelo original del que se copiaron los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,1 GB para los pesos (22,7 M de parametros), mas el overhead de activaciones y tokenizacion; en la practica cabe en cualquier GPU consumer.
- Cabe holgadamente en GPU consumer: GTX 1060, RTX 3060, RTX 4090, etc.; tambien en CPU.
- GPU recomendadas para alto throughput: V100, A100 o H100 si se necesita reranking a gran escala; la model card reporta 1800 docs/s en V100.
- Despliegue: SentenceTransformers, Transformers, Text Embeddings Inference (TEI), ONNX Runtime, OpenVINO, y potencialmente llama.cpp no aplica (no es un modelo generativo).
- Latencia y throughput: 1800 documentos por segundo en V100 segun la model card; en CPU el rendimiento sera considerablemente menor, aunque sigue siendo viable para volumenes moderados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 (TREC DL 19) | MRR@10 (MS Marco Dev) | Licencia |
|---|---|---|---|---|---|
| Este fork (base MiniLM-L6-v2) | 22,7 M | no disponible | 74.30 | 39.01 | apache-2.0 |
| cross-encoder/ms-marco-MiniLM-L12-v2 | no disponible | no disponible | 74.31 | 39.02 | apache-2.0 |
| cross-encoder/ms-marco-MiniLM-L4-v2 | no disponible | no disponible | 73.04 | 37.70 | apache-2.0 |
| cross-encoder/ms-marco-TinyBERT-L2-v2 | no disponible | no disponible | 69.84 | 32.56 | apache-2.0 |

El fork replica exactamente el comportamiento del MiniLM-L6-v2 original; la diferencia practica frente al L12-v2 es minima en calidad (0,01 puntos de NDCG@10) pero casi el doble de throughput (1800 frente a 960 docs/s). Frente al L4-v2 gana 1,26 puntos de NDCG@10 a costa de menor velocidad (1800 frente a 2500 docs/s).

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para reranking en castellano u otros idiomas sin un modelo multilingue.
- Es un modelo discriminativo de ranking: no genera texto ni responde preguntas directamente.
- Riesgo de sesgo heredado de MS MARCO, un dataset construido a partir de consultas de Bing con posible sesgo de dominio y de idioma.
- No se documentan evaluaciones de sesgo, robustez ni alucinacion (no aplica generacion, pero si puede producir puntuaciones erroneas en dominios alejados del entrenamiento).
- La model card del fork no anade informacion tecnica nueva; los benchmarks y detalles de entrenamiento provienen del modelo original.
- El fork no registra descargas ni likes, por lo que no hay evidencia de uso en produccion; conviene validar los pesos contra el original antes de desplegar.
- Licencia apache-2.0 permite uso comercial, pero se recomienda verificar el fichero LICENSE y FORK.json del repositorio.
- El contexto maximo no se especifica en la informacion disponible; los pasajes largos pueden truncarse.

## Enlaces

- Hugging Face: https://huggingface.co/PYTHAI/ms-marco-MiniLM-L6-v2-fork
- Modelo original: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2/tree/233902d25c440f23af6f7d6e94d2946bac0bee0a
- Repositorio MS MARCO Passage Ranking: https://github.com/microsoft/MSMARCO-Passage-Ranking
- SBERT Retrieve & Re-rank: https://www.sbert.net/examples/applications/retrieve_rerank/README.html
- Codigo de entrenamiento SBERT MS Marco: https://github.com/UKPLab/sentence-transformers/tree/master/examples/cross_encoder/training/ms_marco
- TREC Deep Learning 2019: https://microsoft.github.io/TREC-2019-Deep-Learning/
- mindX: https://mindx.pythai.net
