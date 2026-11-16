# CobuildX-AI/cbx-rag-context-relevance-68M

## Resumen
cbx-rag-context-relevance-68M es un clasificador de texto de 68 millones de parametros desarrollado por CobuildX-AI, especializado en evaluar la relevancia del contexto recuperado en sistemas RAG (Retrieval-Augmented Generation). Dado un par formado por una pregunta y un conjunto de pasajes recuperados, el modelo determina, oracion por oracion, si cada fragmento del contexto es relevante para responder a la pregunta, y agrega esos juicios en dos metricas: la fraccion de relevancia (oraciones relevantes sobre el total) y la precision de contexto (si los pasajes relevantes aparecen primero en el ranking de recuperacion).

El modelo se construye mediante fine-tuning del encoder jhu-clsp/ettin-encoder-68m, una arquitectura ModernBERT de 68.145.666 parametros. Forma parte de una familia de cuatro evaluadores RAG de CobuildX-AI (faithfulness, response relevance, context relevance y context utilization) que comparten el mismo wrapper de inferencia `cbx_rag_eval.py` y el mismo encoder base. Esta especializacion lo hace util como componente de evaluacion automatica dentro de pipelines de RAG, donde medir la calidad del retrieval es tan importante como medir la calidad de la generacion.

Su relevancia actual radica en que aborda una de las metricas mas costosas de calcular en produccion RAG: la relevancia del contexto. Al ser un modelo de 68M, puede ejecutarse en CPU o en GPU de gama consumer con latencias de decimas de segundo por llamada, lo que permite evaluar en linea o en lotes sin depender de APIs externas de LLM. La licencia Apache-2.0 sobre pesos y codigo facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tune de jhu-clsp/ettin-encoder-68m |
| Parametros totales | 68.145.666 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion a fp16/bf16/int8 segun el runtime, pero no se documenta en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (pesos y codigo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un encoder transformer de tipo ModernBERT con 68M de parametros, obtenido por fine-tuning del checkpoint jhu-clsp/ettin-encoder-68m. La tarea es de clasificacion a nivel de oracion: cada oracion del contexto se evalua en el contexto de sus dos vecinas por cada lado, lo que permite al encoder capturar dependencias locales sin necesidad de procesar el documento completo en una sola ventana. El wrapper `cbx_rag_eval.py` se encarga de la segmentacion en oraciones y de la agregacion de las puntuaciones.

El entrenamiento se realizo sobre los subconjuntos CUAD (contratos) y FinQA (informes financieros) del dataset RAGBench (Friel et al., 2024, CC BY 4.0). El conjunto de entrenamiento contiene 1.530 respuestas de CUAD y 12.502 de FinQA; el de test, 510 respuestas de CUAD (102 contratos) y 2.294 de FinQA. Las etiquetas no fueron anotadas por humanos: se generaron por voto mayoritario entre las etiquetas originales de RAGBench y dos pasadas de revisores LLM (Claude Haiku para CUAD; Claude Haiku y gpt-5.4-mini para FinQA), con auditorias ciegas mediante Claude Opus y Claude Sonnet. Todos los umbrales y ajustes se fijaron sobre validacion. El wrapper aplica dos perfiles de segmentacion (`contract` con saltos de linea y NLTK punkt; `financial` con lineas en blanco y pysbd) que alteran ligeramente las metricas respecto a usar las segmentaciones originales de RAGBench.

## Capacidades
- Clasificacion de relevancia a nivel de oracion: devuelve una puntuacion y un flag booleano de relevancia para cada oracion del contexto.
- Calculo de la fraccion de relevancia a nivel de respuesta, con la convencion de RAGBench (oraciones relevantes / total de oraciones).
- Calculo de precision de contexto cuando hay dos o mas pasajes, evaluando si los pasajes relevantes estan mejor rankeados.
- Procesamiento por perfiles (`contract`, `financial`, `auto`) adaptados a documentos largos unicos o a conjuntos de pasajes cortos con cifras y tablas.
- Acepta oraciones pre-segmentadas por el usuario (`answer_sentences=`), evitando el splitter interno para maxima fidelidad.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso
- Evaluacion automatica de pipelines RAG en produccion: integrar el modelo como juez de retrieval para medir la fraccion de contexto relevante en cada consulta y detectar degradaciones del indice o del retriever.
- Monitorizacion de calidad en atencion al cliente automatizada: ejecutar el modelo sobre los pasajes recuperados antes de la generacion para alertar cuando la precision de contexto cae por debajo de un umbral, evitando respuestas fundamentadas en contexto irrelevante.
- Benchmarking de estrategias de retrieval: comparar distintos retrievers (BM25, embeddings densos, hibridos) calculando context precision sobre el mismo conjunto de preguntas, gracias a la salida de precision de contexto.
- Evaluacion de sistemas RAG sobre contratos: usar el perfil `contract` para medir la relevancia oracion a oracion en documentos legales largos, donde la fraccion agregada es casi constante y conviene usar las puntuaciones por oracion.
- Auditoria de asistentes financieros: con el perfil `financial`, evaluar si los pasajes con cifras y tablas recuperados para preguntas sobre informes contienen la informacion necesaria antes de que el LLM genere la respuesta.
- Construccion de datasets de evaluacion RAG: generar etiquetas de relevancia de contexto a bajo coste (68M de parametros, inferencia en CPU viable) para entrenar o validar otros modelos de evaluacion.
- Filtrado previo al generador: descartar pasajes cuyas oraciones no se marcan como relevantes antes de pasarlos al LLM, reduciendo tokens de entrada y riesgo de distraccion del generador.

## Benchmarks y rendimiento
La model card no publica una tabla de benchmarks estandar (MMLU, HumanEval, GSM8K) por tratarse de un clasificador especializado. Los unicos datos cuantitativos disponibles son de validacion y de velocidad:

| Metrica | Valor |
|---|---|
| AUROC a nivel de oracion (CUAD), splitter del wrapper vs. splits originales de RAGBench | 0.920 vs. 0.942 |
| AUROC a nivel de oracion (FinQA), splitter del wrapper vs. splits originales de RAGBench | 0.962 vs. 0.965 |
| RMSE a nivel de respuesta (CUAD), splitter del wrapper vs. splits originales | 0.034 vs. 0.034 |
| RMSE a nivel de respuesta (FinQA), splitter del wrapper vs. splits originales | 0.070 vs. 0.066 |
| Latencia, un contrato (~414 oraciones), GPU NVIDIA TITAN RTX fp16 | 1,02 s |
| Latencia, un contrato (~414 oraciones), CPU 8 hilos fp32 | 43,87 s |
| Latencia, varios pasajes cortos (~29 oraciones), GPU | 0,10 s |
| Latencia, varios pasajes cortos (~29 oraciones), CPU | 1,71 s |

La model card menciona baselines de RAGAS, GPT-3.5 y TruLens tomados de RAGBench (no re-ejecutados), pero no incluye la tabla de resultados completa en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB en fp16 para los 68M de parametros (aproximadamente 136 MB de pesos mas overhead de activaciones y del tokenizer); el repo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta mediciones en NVIDIA TITAN RTX. Una RTX 3060, RTX 4060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: el wrapper oficial `cbx_rag_eval.py` sobre PyTorch/Transformers; al ser un encoder ModernBERT estandar, tambien puede servirse con Text Embeddings Inference (TEI), vLLM (soporte de encoders), ONNX Runtime o llama.cpp si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: 0,10 s por llamada con ~29 oraciones en GPU y 1,02 s con ~414 oraciones; en CPU, 1,71 s y 43,87 s respectivamente. El throughput escala linealmente con el numero de oraciones al procesarse por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-rag-context-relevance-68M | 68M | no disponible | Relevancia de contexto RAG | Apache-2.0 | Hugging Face (v0.1) |
| cbx-rag-faithfulness-68M | 68M | no disponible | Fidelidad de la respuesta al contexto | Apache-2.0 | Hugging Face |
| cbx-rag-response-relevance-68M | 68M | no disponible | Relevancia de la respuesta a la pregunta | Apache-2.0 | Hugging Face |
| cbx-rag-context-utilization-68M | 68M | no disponible | Uso del contexto por la respuesta | Apache-2.0 | Hugging Face |

No se dispone de datos publicados para comparar con jueces RAG genericos basados en LLM (RAGAS, TruLens) en la informacion proporcionada; la model card solo indica que los baselines de estas herramientas se tomaron de RAGBench sin re-ejecutarlos.

## Limitaciones y advertencias
- Entrenado exclusivamente en ingles; no se garantiza comportamiento en otros idiomas.
- El dominio de entrenamiento se limita a contratos (CUAD) e informes financieros (FinQA); para otros tipos de texto hay que elegir el perfil mas proximo y validar sobre datos propios.
- Las etiquetas fueron generadas y revisadas por LLMs, no por anotadores humanos; pueden heredar sesgos y errores de los modelos revisores (Claude Haiku, gpt-5.4-mini, Claude Opus, Claude Sonnet).
- En documentos largos unicos (perfil `contract`), la fraccion de relevancia agregada es casi constante; el autor recomienda usar las puntuaciones por oracion en ese caso.
- El splitter interno del wrapper reduce ligeramente la calidad respecto a pasar oraciones pre-segmentadas (AUROC 0,942 a 0,920 en CUAD).
- Las puntuaciones son estimaciones estadisticas de evaluacion, no garantias de correccion, completitud o seguridad; el autor desaconseja usarlas como unica base para decisiones legales, financieras o de consecuencias relevantes.
- Licencia Apache-2.0 para pesos y codigo, pero los datos de entrenamiento tienen atribuciones propias (RAGBench y CUAD bajo CC BY 4.0, FinQA bajo MIT) que deben respetarse.
- Sin senales de adopcion (0 descargas, 0 likes) ni benchmarks publicos en la informacion disponible; conviene validar el modelo sobre el dominio objetivo antes de integrarlo en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-rag-context-relevance-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- cbx-rag-faithfulness-68M: https://huggingface.co/CobuildX-AI/cbx-rag-faithfulness-68M
- cbx-rag-response-relevance-68M: https://huggingface.co/CobuildX-AI/cbx-rag-response-relevance-68M
- cbx-rag-context-utilization-68M: https://huggingface.co/CobuildX-AI/cbx-rag-context-utilization-68M
- Dataset RAGBench: https://huggingface.co/datasets/galileo-ai/ragbench
- Paper de RAGBench (Friel et al., 2024): no disponible en la informacion proporcionada
- Paper de FinQA (Chen et al., 2021): no disponible en la informacion proporcionada
- Repositorio de codigo del wrapper: no disponible en la informacion proporcionada
