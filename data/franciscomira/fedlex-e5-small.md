# franciscomira/fedlex-e5-small

## Resumen

fedlex-e5-small es un modelo de embeddings de frases (feature-extraction) especializado en recuperación cross-lingual de artículos de derecho federal suizo. Lo desarrolla franciscomira como un fine-tune de `intfloat/multilingual-e5-small`, un transformer BERT de 117,6 millones de parámetros y 384 dimensiones de embedding. El modelo resuelve un problema concreto: dada una pregunta en inglés, alemán, francés o italiano, localizar los artículos relevantes de la legislación federal suiza (publicada en Fedlex) en alemán, francés o italiano. Está pensado como primera etapa de un pipeline RAG: recupera candidatos, no responde preguntas.

La relevancia del modelo radica en su enfoque de evaluación: el autor publica un benchmark propio (Fedlex cross-lingual benchmark v1) con intervalos de confianza bootstrap y comparaciones contra alternativas sin entrenamiento (híbrido e5+BM25) y contra pipelines con traducción de consulta mediante LLM. Con solo 3.201 artículos de entrenamiento y menos de 15 minutos de ajuste en una GPU T4 gratuita, el modelo supera al híbrido sin ajustar en +0,26 de recall@10.

El modelo tiene una licencia MIT permisiva, exportaciones ONNX fp32 e int8, y está diseñado explícitamente para no ser usado como asesoramiento legal. Su principal limitación es que no genera respuestas: es un recuperador puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), fine-tune de multilingual-e5-small |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado a 256 tokens para pasajes durante entrenamiento) |
| Tipos de cuantizacion | fp32, int8 (cuantización dinámica per-channel), ONNX |
| Idiomas soportados | de, fr, it, en |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (fp32 470 MB, int8 118 MB) |
| Dimensiones de embedding | 384 |
| Prefijos requeridos | `query: ` para preguntas, `passage: ` para artículos |
| Pooling | Mean-pooling sobre attention mask, normalización L2 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer BERT de 117,6 millones de parámetros con 384 dimensiones de salida, heredado de `intfloat/multilingual-e5-small`. La inferencia sigue las convenciones de E5: prefijo `query: ` para la consulta, prefijo `passage: ` para el documento, mean-pooling de la última capa oculta enmascarando el padding, normalización L2 y ranking por producto escalar.

El entrenamiento se realizó en PyTorch puro con in-batch softmax ranking loss (escala 20, batch 64, sin dos preguntas del mismo artículo en un batch, columnas del mismo artículo enmascaradas), AdamW, learning rate 2e-5, 10% de warmup seguido de decaimiento lineal, 3 épocas (540 pasos), autocast fp16, pasajes truncados a 256 tokens, semilla 20261028, en una única GPU T4 gratuita de Kaggle. El ajuste completo dura menos de 15 minutos. Se probaron hard negatives y no aportaron mejora (+0,017 de recall@10 en dev, intervalo tocando cero), por lo que se descartaron.

Los datos de entrenamiento consisten en 3.201 artículos de ocho actos federales suizos (Código de Obligaciones, Código Civil, Procedimiento Civil, Ejecución y Concurso, entre otros) en sus versiones alemana, francesa e italiana, más 12.800 preguntas sintéticas generadas por Claude Haiku 5.5 (4 por artículo: 2 en inglés, 2 en dos de alemán, francés o italiano; seis estilos: palabras clave, pregunta corta, redacción legal, situación lego, tercero, confusa). Se excluyeron por código los 172 artículos gold del benchmark de evaluación, sus vecinos (288) y 3 artículos con solapamiento de al menos 50% (Jaccard de 5-gramas de caracteres). El split dejó 11.504 preguntas para entrenamiento y 1.296 para validación (324 artículos reservados). Una auditoría con un juez de otra familia de modelos (gpt-6-luna) sobre 100 preguntas muestreadas encontró que 80 se responden completamente con su artículo, 20 parcialmente y 0 no se responden.

## Capacidades

- Generación de embeddings de texto para recuperación de información (retrieval), no generación de texto libre.
- Recuperación cross-lingual: consultas en inglés, alemán, francés o italiano contra pasajes en alemán, francés o italiano.
- Ranking de artículos legales por relevancia mediante producto escalar de embeddings normalizados.
- Soporte de prefijos E5 (`query: ` y `passage: `) para separar el espacio de consultas y documentos.
- Exportación ONNX fp32 e int8 para despliegue en CPU.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de recuperación, no un modelo generativo.
- No soporta visión, audio ni thinking mode.

## Casos de uso

- Primera etapa de un pipeline RAG legal: dado un corpus de legislación federal suiza, el modelo indexa los artículos con prefijo `passage: ` y recupera los candidatos más relevantes para una consulta con prefijo `query: `. Con recall@10 de 0,81 en el benchmark del autor, reduce el corpus a un puñado de artículos que un LLM generador puede usar como contexto.
- Búsqueda cross-lingual en portales jurídicos: un usuario formula la pregunta en inglés y el sistema recupera artículos en alemán, francés o italiano sin necesidad de traducir la consulta, gracias al entrenamiento multilingüe sobre las tres versiones de Fedlex.
- Asistencia a profesionales del derecho en la localización de normativa: el modelo encuentra artículos candidatos del Código de Obligaciones o del Código Civil para una situación descrita en lenguaje lego, que luego un humano o un reranker valida.
- Indexación y búsqueda semántica en bases de datos documentales: integración en motores de búsqueda vectorial (FAISS, Qdrant, pgvector) para consultas semánticas sobre textos legales, con embeddings de 384 dimensiones y bajo coste de almacenamiento.
- Despliegue en CPU para entornos con recursos limitados: la exportación int8 (118 MB) embebe una pregunta en 20 ms con un solo hilo en una CPU de 6 núcleos, lo que permite servir búsquedas en infraestructura sin GPU.
- Filtrado previo en pipelines con reranker: el modelo recupera un top-k amplio (por ejemplo, 50 artículos) y un reranker (como Claude Haiku 5.5 en el benchmark del autor) reordena, alcanzando recall@1 de 0,79 con latencia de 1,6 s frente a 8 s de un pipeline con traducción de consulta.
- Evaluación y benchmarking de recuperación legal: el modelo y su benchmark asociado sirven como línea base reproducible para comparar estrategias de retrieval (híbrido, traducción de consulta, reranking) en dominios jurídicos multilingües.

## Benchmarks y rendimiento

Resultados del Fedlex cross-lingual benchmark v1, split de test, 164 ítems respondibles, intervalos bootstrap del 95% sobre grupos de preguntas:

| Sistema | Recall@1 | Recall@10 | MRR | Recall@10 en inglés |
|---|---|---|---|---|
| multilingual-e5-small + BM25 híbrido, sin ajuste | 0,25 | 0,55 [0,46; 0,63] | 0,36 | 0,24 |
| **fedlex-e5-small, solo embeddings** | 0,48 [0,38; 0,59] | **0,81 [0,71; 0,90]** | 0,63 [0,53; 0,73] | **0,80** |
| fedlex-e5-small + reranker Claude Haiku 5.5 | 0,79 [0,70; 0,88] | 0,89 [0,80; 0,97] | 0,87 [0,78; 0,95] | 0,89 |
| Traducción de consulta con LLM + híbrido + reranker Haiku | 0,76 [0,67; 0,84] | 0,87 [0,79; 0,94] | 0,84 [0,76; 0,91] | 0,86 |

El modelo ajustado solo (embeddings) mejora el recall@10 sobre el híbrido sin ajustar (embedding más BM25) en +0,26 [+0,17; +0,35]. Frente al pipeline con traducción de consulta por LLM, el recall@10 es -0,06 [-0,15; +0,02] (no distinguible) y el MRR es -0,21 [-0,31; -0,11] (claramente peor en colocar el artículo correcto primero). Con un reranker encima, ambos pipelines no son distinguibles (+0,015 [-0,05; +0,07] de recall@10), pero el ajustado tiene un quinto de la latencia (1,6 s frente a 8 s) y dos tercios del coste por pregunta. En ítems no afectados por artículos contenidos en gold, la ganancia de test se mantiene (+0,30 [+0,20; +0,40]).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 y 0,12 GB en int8 para los pesos; el consumo real depende del tamaño de batch y de la longitud de secuencia (máximo 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo se entrenó en una T4 de 16 GB y cabe holgadamente en RTX 3060, RTX 4090, A100, H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Despliegue en CPU: viable con la exportación ONNX int8 (118 MB); 20 ms por pregunta con un solo hilo en una CPU de 6 núcleos; 22 ms en fp32 con un solo hilo.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, text-embeddings-inference, endpoints compatibles; no se mencionan integraciones con vLLM, llama.cpp ni Ollama (no aplicables a un encoder BERT de este tipo).
- Latencia y throughput: 22 ms (fp32, 1 hilo) y 20 ms (int8, 1 hilo) por pregunta en una CPU de 6 núcleos; el pipeline completo con reranker Haiku 5.5 tarda 1,6 s por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Idiomas | Licencia | Rendimiento en benchmark Fedlex |
|---|---|---|---|---|---|---|
| fedlex-e5-small | 117,6 M | 512 tokens | 384 | de, fr, it, en | MIT | recall@10 0,81 (solo embeddings) |
| intfloat/multilingual-e5-small (base sin ajustar) | 117,6 M | 512 tokens | 384 | multilingüe (incluye de, fr, it, en) | MIT | recall@10 0,55 en híbrido con BM25 |
| Pipeline con traducción de consulta por LLM + híbrido + reranker | no disponible (compuesto) | no disponible | no disponible | de, fr, it, en | no disponible | recall@10 0,87; MRR 0,84; latencia 8 s |

La comparación directa con otros modelos de embeddings legales especializados no está disponible en la información proporcionada. El benchmark del autor solo compara contra el modelo base sin ajustar y contra pipelines compuestos con traducción y reranking.

## Limitaciones y advertencias

- Solo recuperación: el modelo no genera respuestas ni citas; no evalúa la calidad de una respuesta legal. Es la primera etapa de un pipeline, no un sistema completo.
- No es asesoramiento legal ni publicación oficial: los textos provienen de Fedlex, pero el modelo y sus salidas no están publicados ni respaldados por la Confederación Suiza; solo los textos publicados en Fedlex son auténticos.
- Cobertura limitada: entrenado sobre 3.201 artículos de ocho actos federales suizos; no cubre el corpus legal completo ni legislación de otros países.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperación errónea: el modelo puede devolver artículos irrelevantes o perder el artículo correcto, especialmente en consultas ambiguas o fuera de dominio.
- Sesgos de los datos sintéticos: las 12.800 preguntas fueron generadas por Claude Haiku 5.5; la auditoría con gpt-6-luna encontró que 20 de 100 preguntas solo se responden parcialmente con su artículo. Los roles del estilo "tercero" no se aplicaron según el plan, por lo que son elección del generador. Ningún humano lector de alemán, francés o italiano ni experto en derecho suizo revisó las preguntas.
- Limitación de contexto: 512 tokens; los pasajes se truncaron a 256 tokens durante el entrenamiento, por lo que artículos largos pueden perder información.
- Limitación de solapamiento en el split: el filtro de exclusión no detecta artículos cortos contenidos en un artículo gold largo; 37 artículos del pool están al menos 60% contenidos en uno de 18 artículos gold, aunque la ganancia de test se mantiene en ítems no afectados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y desaconseja explícitamente el uso para decisiones legales.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la ficha: sin validación comunitaria independiente.
- El padding debe enmascararse en el pooling (el autor menciona un bug note al respecto); un pooling incorrecto degrada los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/franciscomira/fedlex-e5-small
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio del proyecto y benchmark: https://github.com/franciscomira/fedlex-rag-benchmark
- Plataforma Fedlex (textos legales suizos): https://www.fedlex.admin.ch
- Informe de fase 3 (referenciado en la model card): `docs/phase3_report.md` en el repositorio del proyecto
- Progreso de fase 3 (referenciado en la model card): `docs/phase3_progress.md` en el repositorio del proyecto
