# NeuML/colbert-atto-90k-32d

## Resumen

ColBERT Atto (colbert-atto-90k-32d) es un modelo de recuperación de información basado en late interaction (ColBERT) desarrollado por NeuML. Se construye mediante fine-tuning del modelo base NeuML/atto-90k-32d, un transformer compacto de la familia Atto disenado para representación contextual con un presupuesto de parámetros extremadamente reducido. El resultado es un retriever multi-vector que genera embeddings por token y aplica scoring MaxSim, adecuado para búsqueda semántica y reranking en pipelines de RAG.

La relevancia de este modelo radica en su eficiencia: con aproximadamente 90.000 parámetros y vectores de 32 dimensiones sobre un vocabulario de 4.000 tokens, ofrece un rendimiento intermedio dentro de la familia Atto, muy por encima de las variantes de 840 y 9K parámetros, y a una fracción del coste de modelos como LateOn (110M parámetros, 768 dimensiones). Está pensado para escenarios donde el coste computacional y de almacenamiento del índice es crítico.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés y se integra con txtai (9.0+) y Sentence Transformers (v6.0.0+) mediante `MultiVectorEncoder`. No es un modelo generativo: su función es exclusivamente la extracción de features y la similitud semántica a nivel de token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction) sobre transformer AttoModel |
| Parametros totales | 90K |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 399 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ColBERT de interacción tardía: un encoder transformer (AttoModel) produce una representación por cada token de la consulta y del documento, y la relevancia se calcula mediante MaxSim, sumando para cada token de la consulta la similitud máxima con los tokens del documento. La dimensión de los embeddings por token es de 32 y el vocabulario del tokenizador es de 4.000 tokens. La longitud máxima de secuencia es de 399 tokens.

El fine-tuning se realizó con PyLate (LightOn) partiendo de NeuML/atto-90k-32d. Los hiperparámetros publicados son: batch size por dispositivo de 32, una época, learning rate de 0.01, warmup del 5%, precisión fp16, evaluación por steps y 20 workers de dataloader. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un modelo de retrieval).

## Capacidades

- Generación de embeddings multi-vector (uno por token) para consultas y documentos.
- Scoring de relevancia mediante MaxSim (late interaction), estilo ColBERT.
- Búsqueda semántica y recuperación de documentos en inglés.
- Reranking de resultados dentro de pipelines de recuperación.
- Integración como fuente de conocimiento para RAG en txtai 9.0+.
- Carga directa como `MultiVectorEncoder` en Sentence Transformers v6.0.0+.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica de bajo coste: indexar grandes colecciones de documentos en inglés con embeddings de 32 dimensiones y un vocabulario de 4.000 tokens, reduciendo el almacenamiento del índice en órdenes de magnitud frente a modelos de 384 o 768 dimensiones.
- Reranking en pipelines RAG: usar el modelo como segunda etapa tras un retriever denso o léxico, aprovechando el scoring MaxSim para reordenar los candidatos con mayor precisión semántica.
- Despliegue en entornos con recursos limitados: al tener 90K parámetros, puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace apto para dispositivos edge o contenedores con memoria restringida.
- Prototipado rápido de sistemas de recuperación: la integración con txtai permite montar un índice y consultarlo en pocas líneas de código, útil para validar arquitecturas antes de escalar a modelos mayores de la familia Atto.
- Filtrado previo en motores de búsqueda: como primera etapa de recuperación sobre corpus grandes en inglés, descartando documentos irrelevantes antes de aplicar modelos más costosos.
- Evaluación comparativa de la familia Atto: sirve como punto intermedio en la curva de rendimiento/coste entre colbert-atto-9k-16d y colbert-atto-950k-128d para seleccionar el tamaño adecuado según los requisitos de nDCG@10.

## Benchmarks y rendimiento

Resultados de nDCG@10 en un subconjunto de BEIR, según el script de benchmarks de txtai:

| Modelo | Parámetros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| colbert-atto-840-8d | 840 | 8 | 250 | 0.2143 | 0.2585 | 0.4688 | 0.3139 |
| colbert-atto-9k-16d | 9K | 16 | 1K | 0.2459 | 0.2902 | 0.5604 | 0.3655 |
| **colbert-atto-90k-32d** | **90K** | **32** | **4K** | **0.3435** | **0.3263** | **0.6663** | **0.4454** |
| colbert-atto-950k-128d | 950K | 128 | 4K | 0.4149 | 0.3352 | 0.6946 | 0.4816 |
| colbert-atto-4m-384d | 4M | 384 | 30K | 0.4157 | 0.3349 | 0.6949 | 0.4818 |
| colbert-atto-14m-384d | 14M | 384 | 30K | 0.4248 | 0.3483 | 0.7057 | 0.4929 |
| colbert-atto-25m-384d | 25M | 384 | 30K | 0.4395 | 0.3461 | 0.7130 | 0.4995 |
| LateOn | 110M | 768 | 50K | 0.4979 | 0.3802 | 0.7609 | 0.5463 |

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 90K parámetros el modelo ocupa menos de 1 MB en fp32, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, iGPU, RTX 3060/4060 o superiores sin limitación por memoria.
- Cabe en cualquier GPU consumer y en dispositivos de gama baja.
- Opciones de despliegue: txtai 9.0+ (soporte de late interaction), Sentence Transformers v6.0.0+ (`MultiVectorEncoder`), PyLate. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; el coste dominante será el número de tokens procesados por la longitud máxima de 399 tokens y el scoring MaxSim, no el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | nDCG@10 medio (BEIR subset) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| colbert-atto-90k-32d | 90K | 32 | 399 | 0.4454 | apache-2.0 | Hugging Face |
| colbert-atto-9k-16d | 9K | 16 | no disponible | 0.3655 | apache-2.0 | Hugging Face |
| colbert-atto-950k-128d | 950K | 128 | no disponible | 0.4816 | apache-2.0 | Hugging Face |
| LateOn | 110M | 768 | no disponible | 0.5463 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado.
- Ventana de contexto de 399 tokens: documentos más largos deben truncarse o dividirse, lo que puede degradar la recuperación.
- Vocabulario reducido de 4.000 tokens: puede producir tokenizaciones menos eficientes y peor cobertura en dominios especializados.
- Rendimiento inferior a modelos mayores de la misma familia (950K, 4M, 25M) y a LateOn; no apto para escenarios donde se exija máxima precisión.
- Riesgo de falsos positivos y negativos en el scoring MaxSim con embeddings de solo 32 dimensiones.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Requiere versiones específicas de las librerías (txtai 9.0+, Sentence Transformers 6.0.0+); versiones anteriores no cargan el modelo.
- No se han publicado datos sobre sesgos, robustez adversarial ni evaluación fuera de BEIR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/colbert-atto-90k-32d
- Modelo base: https://huggingface.co/NeuML/atto-90k-32d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio PyLate: https://github.com/lightonai/pylate
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Documentación de Sentence Transformers: https://www.sbert.net/
- Modelo comparativo LateOn: https://hf.co/neuml/lateon
