# CobuildX-AI/cbx-rag-faithfulness-68M

## Resumen

cbx-rag-faithfulness-68M es un clasificador de texto especializado en evaluar la fidelidad (faithfulness) de respuestas generadas por sistemas RAG. Desarrollado por CobuildX-AI, recibe una pregunta, los pasajes recuperados y la respuesta generada, y devuelve una puntuación de soporte por cada frase de la respuesta, una puntuación global de la respuesta y un indicador de alucinación cuando alguna frase no está respaldada por el contexto recuperado.

El modelo parte de jhu-clsp/ettin-encoder-68m, un encoder de arquitectura ModernBERT con 68 millones de parámetros, y se ha afinado para una tarea concreta de clasificación de pares (frase de respuesta frente a evidencia). Forma parte de una familia de cuatro evaluadores RAG de CobuildX-AI que comparten el mismo wrapper de inferencia, lo que permite encadenar comprobaciones de fidelidad, relevancia de respuesta, relevancia de contexto y utilización de contexto.

Su relevancia actual radica en que aborda uno de los problemas prácticos más acuciantes de los pipelines RAG en producción: detectar cuándo el modelo generador afirma cosas que no aparecen en los documentos recuperados. Al ser un modelo pequeño (68M), puede ejecutarse en CPU con latencias de segundos por documento, lo que lo hace viable como filtro de calidad en tiempo de ejecución o en procesos de evaluación por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 68.145.666 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 tokens en la fase de selección de evidencia (BM25); longitud máxima del encoder no especificada en la información disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el wrapper usa fp16 en GPU y fp32 en CPU) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/ettin-encoder-68m |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,3 GB |
| Versión | v0.1 (fijar con `--revision v0.1`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 68M de parámetros afinado para clasificación de texto. La inferencia no se limita a un forward pass: el wrapper `cbx_rag_eval` implementa un pipeline que (1) selecciona la evidencia relevante mediante BM25, limitada a 2.048 tokens, cuando los documentos son largos; (2) para el perfil `financial`, ejecuta una comprobación numérica que verifica cada número de la frase de respuesta contra los números de los pasajes, admitiendo una operación aritmética (diferencia, ratio, cambio porcentual, suma), y combina ese resultado con la puntuación del modelo mediante un combinador logístico; y (3) aplica un umbral por perfil para emitir la bandera de alucinación, calibrado para marcar aproximadamente el 4,5% de las frases de validación.

El entrenamiento se realizó sobre los subconjuntos CUAD (contratos) y FinQA (informes financieros) del dataset RAGBench (CC BY 4.0): 1.530 respuestas CUAD y 12.502 FinQA para entrenamiento, y 510 respuestas CUAD (102 contratos) y 2.294 FinQA para test. Las respuestas fueron generadas por claude-3-haiku y gpt-3.5-turbo, y las etiquetas de fidelidad provienen de un voto mayoritario entre RAGBench y dos revisores LLM (Claude Haiku y gpt-5.4-mini, o dos pasadas de Haiku en el caso de CUAD train). Las etiquetas fueron auditadas de forma ciega por Claude Opus y Claude Sonnet, pero no revisadas por humanos. Todos los umbrales y ajustes se fijaron sobre validación.

## Capacidades

- Evaluación de fidelidad a nivel de frase: devuelve una puntuación de soporte y una bandera por cada frase de la respuesta.
- Puntuación global de la respuesta: toma la puntuación máxima entre las frases.
- Detección de alucinación: bandera a nivel de respuesta que se activa si alguna frase queda marcada.
- Comprobación numérica específica para el perfil `financial`, con soporte de una operación aritmética simple sobre los números del contexto.
- Selección de evidencia con BM25 para documentos largos, con ventana de hasta 2.048 tokens.
- Perfiles de operación: `contract` (documento único tipo contrato), `financial` (varios pasajes cortos con números y tablas) y `auto` (selección automática según el número de pasajes).
- Punto de operación configurable: `default` o `high_recall`.
- Segmentación de frases integrada por perfil (NLTK punkt para contratos, pysbd para financiero), o aceptación de frases pre-segmentadas por el usuario.
- No soporta tool calling, agentes, visión ni audio: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Monitorización de calidad en producción RAG: integrar el modelo como paso posterior a la generación para marcar respuestas con frases no respaldadas por el contexto recuperado, y activar revisiones humanas o respuestas de reserva cuando `hallucination` sea verdadero.
- Evaluación offline de pipelines RAG: calcular la tasa de fidelidad por frase sobre un conjunto de preguntas y documentos para comparar versiones del recuperador o del generador, usando la puntuación de respuesta como métrica agregada.
- Análisis de contratos asistido por LLM: con el perfil `contract`, verificar que cada afirmación de un resumen contractual está respaldada por el texto del contrato, aprovechando la segmentación por saltos de línea y NLTK punkt.
- Verificación de respuestas sobre informes financieros: con el perfil `financial`, comprobar que las cifras citadas en la respuesta aparecen en los pasajes o se derivan de ellos mediante una operación aritmética, reduciendo errores numéricos en resúmenes de resultados.
- Filtrado previo en sistemas de atención al cliente: descartar o reescribir respuestas generadas que contengan frases sin soporte documental antes de mostrarlas al usuario, con latencia de 0,13 s en GPU para varios pasajes cortos.
- Construcción de datasets de evaluación: usar las banderas por frase para anotar respuestas generadas y entrenar o calibrar otros detectores de alucinación, o para auditar la calidad de respuestas sintéticas.
- Investigación sobre fidelidad en RAG: emplear el modelo como baseline ligero en experimentos que comparen estrategias de recuperación, prompts o modelos generadores, dado su bajo coste computacional (15,18 s por contrato en CPU de 8 hilos).

## Benchmarks y rendimiento

La información disponible incluye únicamente métricas de validación sobre el efecto de la segmentación de frases del wrapper frente a la segmentación propia de RAGBench:

| Conjunto | AUROC respuesta completa (split RAGBench) | AUROC respuesta completa (split del wrapper) |
|---|---|---|
| CUAD | 0,797 | 0,797 |
| FinQA | 0,744 | 0,739 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo. Tampoco se proporcionan comparaciones numéricas frente a RAGAS, GPT-3.5 o TruLens más allá de indicar que las puntuaciones de esas herramientas en RAGBench son las almacenadas en el dataset, no re-ejecuciones.

Datos de velocidad medidos con el modelo cargado (GPU NVIDIA TITAN RTX en fp16, CPU de 8 hilos en fp32):

| Entrada | GPU | CPU |
|---|---|---|
| Un contrato (unas 414 frases) | 0,73 s | 15,18 s |
| Varios pasajes cortos (unas 29 frases) | 0,13 s | 2,13 s |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para los 68M de parámetros, más el overhead del wrapper y de los tokenizadores; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta mediciones en una NVIDIA TITAN RTX. Funciona igualmente en A100, H100, RTX 4090 o GPUs de gama media.
- Cabe en cualquier GPU de consumo actual e incluso en CPU: el autor reporta 15,18 s por contrato de 414 frases con 8 hilos en CPU.
- Opciones de despliegue: el wrapper propio `cbx_rag_eval` (instalable vía `requirements.txt` del repositorio), con selección automática de GPU o CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: 0,73 s por contrato en GPU y 0,13 s por conjunto de pasajes cortos; en CPU, 15,18 s y 2,13 s respectivamente. El throughput escala con el número de frases por llamada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-rag-faithfulness-68M | 68M | Fidelidad por frase, bandera de alucinación | Evidencia BM25 hasta 2.048 tokens | Apache-2.0 | Hugging Face, v0.1 |
| cbx-hallucination-detector-68M | 68M | Marcado de spans no soportados en cualquier respuesta fundamentada | no disponible | Apache-2.0 | Hugging Face |
| cbx-rag-response-relevance-68M | 68M | Relevancia de la respuesta respecto a la pregunta | no disponible | Apache-2.0 | Hugging Face |
| cbx-rag-context-relevance-68M | 68M | Relevancia de cada frase de contexto respecto a la pregunta | no disponible | Apache-2.0 | Hugging Face |
| cbx-rag-context-utilization-68M | 68M | Utilización de cada frase de contexto respecto a pregunta y respuesta | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos comparativos frente a alternativas externas como RAGAS, TruLens o evaluadores basados en LLM en la información proporcionada; el autor solo indica que las puntuaciones de esas herramientas en RAGBench son las originales del dataset.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otras lenguas no está respaldado.
- Dominio restringido: entrenado exclusivamente con contratos (CUAD) e informes financieros (FinQA); el rendimiento en otros dominios (documentación técnica, textos legales de otra jurisdicción, conversaciones) no está validado y el autor recomienda comprobar los resultados sobre datos propios.
- Etiquetas generadas por LLM, no por humanos: la fidelidad se etiquetó por voto mayoritario de RAGBench y revisores LLM, con auditorías ciegas de Claude Opus y Sonnet, pero sin anotación humana. Esto puede introducir sesgos del etiquetador en los casos límite.
- Umbral calibrado para marcar aproximadamente el 4,5% de las frases de validación; en distribuciones distintas la tasa de falsos positivos o negativos puede desviarse.
- El perfil `auto` elige `contract` con un solo pasaje y `financial` con dos o más; esta heurística puede no ajustarse a casos mixtos o a documentos largos con tablas.
- La comprobación numérica del perfil `financial` solo admite una operación aritmética por número; cálculos más complejos no se verifican y pueden quedar marcados como no soportados.
- Riesgo de alucinación del propio evaluador: al ser un clasificador, puede dar por soportadas frases que el contexto no respalda o marcar como no soportadas paráfrasis válidas; no sustituye una revisión humana en contextos de alto riesgo.
- La segmentación de frases afecta a las métricas (AUROC 0,744 → 0,739 en FinQA al usar el splitter del wrapper); para máxima precisión se recomienda pasar frases pre-segmentadas.
- Licencia Apache-2.0 para pesos y código, con atribución de datos requerida para RAGBench (CC BY 4.0); conviene revisar los términos de los datasets subyacentes si se redistribuyen derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, versión v0.1: madurez y mantenimiento no contrastados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-rag-faithfulness-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Detector de alucinaciones por spans: https://huggingface.co/CobuildX-AI/cbx-hallucination-detector-68M
- Evaluador de relevancia de respuesta: https://huggingface.co/CobuildX-AI/cbx-rag-response-relevance-68M
- Evaluador de relevancia de contexto: https://huggingface.co/CobuildX-AI/cbx-rag-context-relevance-68M
- Evaluador de utilización de contexto: https://huggingface.co/CobuildX-AI/cbx-rag-context-utilization-68M
- Dataset RAGBench: https://huggingface.co/datasets/galileo-ai/ragbench
