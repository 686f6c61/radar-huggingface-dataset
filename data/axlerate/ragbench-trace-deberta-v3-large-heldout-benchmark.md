# axlerate/ragbench-trace-deberta-v3-large-heldout-benchmark

## Resumen

El modelo `axlerate/ragbench-trace-deberta-v3-large-heldout-benchmark` es un checkpoint de investigación desarrollado por el usuario axlerate para estimar señales TRACe (relevancia, utilización, adherencia y completitud) a nivel de frase en sistemas de recuperación aumentada por generación (RAG). Se basa en el encoder DeBERTa-v3-Large, preentrenado por Microsoft y posteriormente fine-tuneado sobre el corpus RAGBench, un benchmark explicable para la evaluación de sistemas RAG. El modelo resuelve el problema de detectar alucinaciones y medir la calidad de las respuestas generadas por pipelines RAG sin depender de LLMs como jueces, que son más lentos y costosos.

Con 434 millones de parámetros, este modelo de clasificación de tokens (token-classification) fue entrenado sobre los splits de entrenamiento y test de RAGBench y evaluado una única vez sobre el split de validación held-out, que no se usó para selección de hiperparámetros ni early stopping. Los resultados publicados muestran un AUROC de 0.880 para detección de alucinaciones y una precisión de adherencia de 0.882, superando según el paper original a jueces LLM few-shot en múltiples dominios. Su relevancia actual radica en ofrecer una alternativa eficiente y de código abierto (licencia MIT) para la evaluación automática de RAG, un área crítica en el despliegue de sistemas de QA y asistentes conversacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-Large (encoder transformer) |
| Parametros totales | 434.015.235 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v3, un encoder transformer que incorpora el preentrenamiento estilo ELECTRA con *gradient-disentangled embedding sharing*. Esta técnica separa los embeddings de los parámetros del encoder durante el preentrenamiento, mejorando la eficiencia y la calidad de las representaciones. El checkpoint parte de `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli`, un modelo ya fine-tuneado para inferencia de lenguaje natural, y se ajusta posteriormente sobre el dataset RAGBench (galileo-ai/ragbench) para la tarea de clasificación de tokens.

El entrenamiento se realizó sobre los splits de train y test de RAGBench, con una única evaluación sobre el split de validación held-out (10.180 filas válidas). El umbral de inferencia se fijó en 0.5 para relevancia, utilización y adherencia, y se seleccionó la época 3 de forma determinista antes de puntuar la validación. No se empleó validación para ajustar hiperparámetros ni para early stopping. El modelo predice tres cabezas principales (adherencia, relevancia y utilización) y deriva la completitud a partir de las dos últimas. La calibración posterior muestra que la adherencia está bien calibrada (ECE 0.023), mientras que la relevancia tiende a sobreestimarse (ECE 0.152) y la utilización moderadamente (ECE 0.079).

## Capacidades

- Detección de alucinaciones en respuestas generadas por sistemas RAG, mediante la puntuación de adherencia a los documentos recuperados.
- Evaluación de la relevancia de las respuestas respecto a la consulta y los contextos, con salida continua (proporción de tokens relevantes).
- Medición de la utilización de la información recuperada, es decir, qué proporción del contexto se emplea realmente en la respuesta.
- Estimación de la completitud de la respuesta, derivada de la combinación de relevancia y utilización.
- Clasificación a nivel de token (token-classification) con pipeline de transformers, lo que permite identificar segmentos específicos problemáticos.
- Soporte exclusivo del idioma inglés, dado que el dataset RAGBench está en inglés.
- Capacidad de funcionar como juez automático para pipelines RAG, sin necesidad de LLMs generativos, reduciendo latencia y coste.

## Casos de uso

- Evaluación automática de pipelines RAG en producción: el modelo puede puntuar cada respuesta generada por un sistema de QA sobre documentos corporativos, detectando alucinaciones y midiendo la adherencia a las fuentes. Su baja latencia (encoder de 434M) permite integrarlo en un bucle de control de calidad en tiempo real.
- Filtrado de respuestas antes de mostrarlas al usuario: en un asistente virtual, se puede usar la puntuación de adherencia para descartar o marcar respuestas con alta probabilidad de contener información no respaldada por los documentos recuperados.
- Monitorización de la calidad de sistemas de generación aumentada: al registrar las métricas de relevancia, utilización y completitud a lo largo del tiempo, se pueden detectar degradaciones en el pipeline (cambios en el corpus, en el retriever o en el generador) y activar alertas.
- Benchmarking de diferentes configuraciones de RAG: comparar el rendimiento de distintos retrievers, generadores o estrategias de prompting utilizando las puntuaciones del modelo como métrica objetiva, en lugar de depender de evaluaciones humanas costosas.
- Investigación en evaluación de RAG: el modelo sirve como baseline eficiente para estudiar la correlación entre las señales TRACe y la calidad percibida por usuarios, o para desarrollar nuevos métodos de evaluación.
- Detección de alucinaciones en dominios específicos: aunque entrenado en RAGBench (que incluye dominios como finanzas, salud y soporte técnico), puede fine-tunearse adicionalmente con datos propios para adaptarse a dominios verticales, manteniendo la arquitectura ligera.

## Benchmarks y rendimiento

Los resultados oficiales publicados en la model card, evaluados sobre el split de validación held-out de RAGBench (10.180 filas), son los siguientes:

| Metrica | Valor |
|---|---|
| Hallucination AUROC | 0.880 |
| Adherence accuracy | 0.882 |
| Relevance RMSE | 0.256 |
| Relevance Spearman | 0.808 |
| Utilization RMSE | 0.161 |
| Utilization Spearman | 0.867 |
| Completeness RMSE | 0.343 |
| Completeness Spearman | 0.242 |

Además, se reporta la comparación con la Tabla 3 del paper RAGBench para varios subconjuntos de datos (selección parcial):

| Dataset | n | Paper Hal AUROC | Modelo Hal AUROC | Paper Rel RMSE | Modelo Rel RMSE | Paper Util RMSE | Modelo Util RMSE |
|---|---|---|---|---|---|---|---|
| PubMedQA | 2.438 | 0.80 | 0.808 | 0.26 | 0.359 | 0.17 | 0.263 |
| CovidQA-RAG | 267 | 0.77 | 0.848 | 0.19 | 0.210 | 0.11 | 0.139 |
| HotpotQA | 424 | 0.85 | 0.781 | 0.11 | 0.129 | 0.08 | 0.089 |
| MS Marco | 394 | 0.70 | 0.764 | 0.22 | 0.234 | 0.10 | 0.161 |
| HAGRID | 322 | 0.81 | 0.812 | 0.20 | 0.236 | 0.13 | 0.154 |
| ExpertQA | 202 | 0.87 | 0.765 | 0.18 | 0.333 | 0.11 | 0.250 |
| DelucionQA | 176 | 0.64 | 0.899 | 0.15 | 0.224 | 0.10 | 0.188 |
| EManual | 132 | 0.76 | 0.853 | 0.13 | 0.181 | 0.13 | 0.128 |
| TechQA | 302 | 0.86 | 0.782 | 0.08 | 0.187 | 0.04 | 0.123 |
| FinQA | 1.758 | 0.81 | 0.821 | 0.10 | 0.068 | 0.10 | 0.044 |

Los intervalos de confianza al 95% (bootstrap no paramétrico) están disponibles en el repositorio. El modelo supera al baseline del paper en la mayoría de los conjuntos para AUROC de alucinación, aunque en algunos casos (HotpotQA, ExpertQA) el RMSE de relevancia es peor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 434M parámetros. En precisión FP32 ocupa aproximadamente 1,7 GB, en FP16 unos 0,87 GB y en int8 unos 0,43 GB. La VRAM necesaria dependerá del tamaño de lote y la longitud de las secuencias; para un lote pequeño y secuencias de hasta 512 tokens, 2 GB de VRAM son suficientes en FP16.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo sin problemas. En entornos cloud, una T4 o V100 es más que suficiente.
- Cabe en GPUs de consumo: sí, es un modelo compacto que se puede ejecutar en hardware de gama media.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con la librería `transformers` (pipeline de token-classification), o exportar a ONNX para inferencia optimizada. También es compatible con frameworks como Hugging Face Inference Endpoints o servicios serverless. No se menciona soporte específico para vLLM o llama.cpp, pero al ser un encoder, se puede usar con `optimum` para cuantización.
- Latencia y throughput: no se proporcionan datos oficiales. Como referencia, un encoder DeBERTa-v3-large en una GPU T4 puede procesar cientos de secuencias por segundo con un lote moderado, pero estos valores dependen de la implementación y la longitud de entrada.

## Comparativa con modelos similares

El modelo se puede comparar con otras alternativas para evaluación de RAG, aunque no se dispone de datos numéricos de otros modelos en la información proporcionada. Según el paper RAGBench, un DeBERTa-large fine-tuneado supera a jueces LLM few-shot (como GPT-4) en múltiples dominios, lo que sugiere que este tipo de encoder es más eficiente y preciso para esta tarea específica. A continuación se presenta una comparación cualitativa:

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| axlerate/ragbench-trace-deberta-v3-large | Encoder fine-tuneado | 434M | no disponible | MIT | Evaluación de RAG (TRACe) |
| MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli | Encoder preentrenado | 434M | 512 (típico) | MIT | NLI, base para fine-tune |
| GPT-4 (few-shot judge) | LLM generativo | no público | 128K | propietaria | Evaluación general, pero costoso y lento |

La ventaja del modelo evaluado es su tamaño reducido y su especialización en señales TRACe, lo que lo hace adecuado para integración en pipelines de producción con requisitos de latencia estrictos. No se dispone de comparaciones directas con otros modelos de evaluación de RAG de código abierto (como RAGAS o TruLens) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de investigación, no un juez de producción. El autor lo declara explícitamente: "no es una garantía de factualidad general ni un juez listo para producción".
- Sesgos de dominio: entrenado en RAGBench, que cubre dominios como salud, finanzas, soporte técnico y QA general. Puede no generalizar bien a dominios muy diferentes o a formatos de respuesta no vistos.
- Riesgo de alucinación: aunque detecta alucinaciones, tiene una tasa de error no nula. En el punto de operación por defecto (umbral 0.5), la precisión de adherencia es 0.913 y el recall 0.953, pero aún hay falsos positivos y negativos.
- Calibración imperfecta: la relevancia está materialmente sobreestimada (ECE 0.152) y la utilización moderadamente (ECE 0.079). Esto afecta a decisiones basadas en valores absolutos, no en rankings.
- Limitaciones de idioma: solo soporta inglés. No es adecuado para evaluar respuestas en otros idiomas sin un fine-tune adicional.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías de rendimiento. El usuario debe validar el modelo en su propio dominio antes de desplegarlo.
- Dependencia del preprocesado: el modelo espera entradas con la estructura de RAGBench (consulta, contexto, respuesta). Si el pipeline de producción no sigue ese formato, los resultados pueden ser inconsistentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axlerate/ragbench-trace-deberta-v3-large-heldout-benchmark
- Paper RAGBench (arXiv): https://arxiv.org/html/2407.11005v2
- Modelo base DeBERTa-v3-large (Microsoft): https://huggingface.co/microsoft/deberta-v3-large
- Repositorio GitHub de DeBERTa: https://github.com/microsoft/DeBERTa
- Dataset RAGBench: https://huggingface.co/datasets/galileo-ai/ragbench
