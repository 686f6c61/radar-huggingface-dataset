# llm-semantic-router/Vela-1.0-Encoder-307M-Feedback

## Resumen

Vela-1.0-Encoder-307M-Feedback es un modelo de clasificación de texto de 307.534.085 parámetros (unos 307M), desarrollado por el proyecto llm-semantic-router (vLLM Semantic Router) como parte de la familia Vela, orientada a enrutamiento semántico de peticiones en sistemas LLM. Se trata de un fine-tuning del modelo base vllm-sr/Vela-1.0-Encoder-307M, construido sobre la arquitectura ModernBERT, y su tarea concreta es distinguir entre cinco categorías de feedback del usuario: satisfacción (SAT), necesidad de aclaración (NEED_CLARIFICATION), respuesta errónea (WRONG_ANSWER), petición de algo distinto (WANT_DIFFERENT) y ausencia de feedback (NO_FEEDBACK).

El modelo resuelve un problema muy específico en pipelines de atención con LLM: detectar de forma fiable cuándo un mensaje del usuario contiene feedback real (positivo o negativo) frente a mensajes neutros, y clasificar el tipo de feedback. Según la model card, sustituye a un detector previo basado en mmBERT32K y mejora de forma drástica la precisión en la tarea: macro F1 de 98,81 frente a 30,74 del modelo original en las cuatro clases compartidas, y solo 6 falsos positivos sobre 288 entradas neutras frente a 254 del modelo anterior.

Es relevante ahora porque los sistemas de enrutamiento semántico necesitan clasificadores pequeños, rápidos y desplegables en CPU (formato ONNX incluido) que eviten llamadas innecesarias a modelos generativos grandes. Con 32.768 tokens de capacidad de entrada y licencia Apache 2.0, encaja como componente de infraestructura más que como modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning para clasificación de texto |
| Parametros totales | 307.534.085 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens de entrada, incluidos tokens especiales |
| Tipos de cuantizacion | no disponible (el repo incluye pesos safetensors y ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | en, zh, es, fr, de (segun etiquetas de idioma de la model card; la ficha de Hugging Face solo lista en y zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, con 307,5 millones de parámetros, ajustado mediante fine-tuning supervisado sobre el modelo base vllm-sr/Vela-1.0-Encoder-307M. La tarea es clasificación multiclase de texto con cinco etiquetas: SAT, NEED_CLARIFICATION, WRONG_ANSWER, WANT_DIFFERENT y NO_FEEDBACK. La model card indica explícitamente que las citas de elogio o crítica dentro de un mensaje no se consideran feedback automáticamente, lo que sugiere un diseño del dataset orientado a distinguir feedback genuino de menciones contextuales.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en un clasificador de este tipo). La evaluación publicada se realizó sobre un conjunto de desarrollo con peticiones redactadas manualmente, contextos largos controlados y peticiones naturales revisadas, con FP32 y entradas completas. El modelo se distribuye también en ONNX, lo que facilita su despliegue en entornos de inferencia ligeros y compatibles con text-embeddings-inference.

## Capacidades

- Clasificación de feedback de usuario en cinco categorías: satisfacción, necesidad de aclaración, respuesta errónea, petición de algo distinto y ausencia de feedback.
- Distinción entre feedback real y menciones neutras o citas de elogio/crítica que no constituyen feedback.
- Procesamiento de entradas largas de hasta 32.768 tokens, útil para conversaciones multi-turno o contextos extensos.
- Soporte multilingüe declarado para inglés, chino, español, francés y alemán.
- Integración en pipelines de enrutamiento semántico (semantic router) para decidir la siguiente acción del sistema.
- Exportación a ONNX y compatibilidad con text-embeddings-inference y endpoints compatibles.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de conversaciones en atención al cliente: el modelo clasifica cada turno del usuario y decide si la conversación debe continuar, escalar a un humano, pedir aclaración o reformular la respuesta, gracias a su ventana de 32.768 tokens que permite incluir historial extenso.
- Detección de insatisfacción en producción: al clasificar WRONG_ANSWER o WANT_DIFFERENT, el sistema puede disparar reintentos automáticos o alertas de calidad sin depender de un LLM generativo costoso.
- Filtrado de ruido en sistemas de feedback: la clase NO_FEEDBACK evita que mensajes neutros contaminen métricas de satisfacción; la model card reporta solo 6 falsos positivos sobre 288 entradas neutras con confianza ≥0,7.
- Enrutamiento semántico en gateways LLM: como componente del vLLM Semantic Router, decide qué modelo o herramienta atenderá la petición según el estado conversacional detectado.
- Moderación de flujos de soporte automatizado: identificación de peticiones que requieren aclaración antes de ejecutar acciones costosas o irreversibles.
- Despliegue en CPU o edge: gracias a su tamaño de 307M parámetros, el formato ONNX y la compatibilidad con text-embeddings-inference, puede ejecutarse en servidores sin GPU para clasificar en tiempo real.
- Evaluación de calidad de asistentes: análisis por lotes de transcripciones para medir tasas de satisfacción y errores reportados por los usuarios.

## Benchmarks y rendimiento

| Evaluacion | mmBERT original | Vela |
|---|---:|---:|
| Cuatro clases de feedback compartidas · Macro F1 · 472 entradas | 30,74 | 98,81 |
| Precisión en clases compartidas · 472 entradas | 38,77 | 97,88 |
| Falsas alertas de feedback sobre 288 entradas neutras · confianza ≥0,7 · menor es mejor | 254/288 | 6/288 |

Ambos modelos se evaluaron en FP32 y con entradas completas. El conjunto de desarrollo incluye peticiones redactadas, contextos largos controlados y peticiones naturales revisadas, y según la model card influyó en la selección de Vela. El modelo original tiene cuatro etiquetas; la cobertura de entradas neutras se mide por separado, mientras que las predicciones NO_FEEDBACK de Vela cuentan como errores en los ejemplos de clases compartidas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, algo esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (307,5M parámetros × 4 bytes), más memoria para activaciones y la ventana de 32.768 tokens.
- En FP16/BF16: alrededor de 0,6 GB de pesos; en cuantización de 8 bits, unos 0,3 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP32 con contexto largo; RTX 4090, A100 o H100 sobran para esta carga y permiten alto throughput por batching.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, etc.) e incluso puede ejecutarse en CPU, dado el tamaño reducido y la disponibilidad de ONNX.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, text-embeddings-inference y endpoints compatibles; no se mencionan vLLM ni llama.cpp para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Feedback | 307,5M | 32.768 tokens | Clasificación de feedback (5 clases) | Apache 2.0 | Hugging Face, safetensors y ONNX |
| vllm-sr/mmbert32k-feedback-detector-merged | no disponible | 32.768 tokens (por nombre) | Clasificación de feedback (4 clases) | no disponible | Hugging Face |
| vllm-sr/Vela-1.0-Encoder-307M (base) | 307M (por nombre) | no disponible | Encoder base | no disponible | Hugging Face |

La comparativa directa disponible se limita al detector mmBERT previo, sobre el que Vela mejora de forma sustancial en macro F1 (98,81 frente a 30,74) y en falsos positivos sobre entradas neutras (6/288 frente a 254/288). No se dispone de datos de otros clasificadores de feedback comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador de cinco clases, no un modelo generativo: no responde preguntas ni genera texto.
- El conjunto de evaluación es de desarrollo y fue usado para seleccionar el modelo, por lo que las cifras publicadas pueden ser optimistas respecto a un conjunto de test independiente.
- La cobertura de idiomas es declarada (en, zh, es, fr, de) pero la evaluación publicada no desglosa resultados por idioma; el rendimiento en español, francés y alemán no está verificado.
- Riesgo de error en mensajes ambiguos donde el feedback está mezclado con citas, sarcasmo o peticiones nuevas; la model card advierte que las citas de elogio o crítica no cuentan automáticamente como feedback.
- La clase NO_FEEDBACK se cuenta como error en los ejemplos de clases compartidas, lo que afecta a la interpretación de las métricas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base vllm-sr/Vela-1.0-Encoder-307M.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica al no ser generativo); no hay información sobre calibración de confianza más allá del umbral 0,7 usado en la evaluación.
- Para producción, conviene validar el umbral de confianza y el comportamiento con contextos cercanos al límite de 32.768 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Feedback
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Detector previo comparado: https://huggingface.co/vllm-sr/mmbert32k-feedback-detector-merged
- Colección Vela: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentación: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
