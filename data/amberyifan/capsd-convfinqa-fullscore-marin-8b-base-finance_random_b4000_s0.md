# AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_random_b4000_s0

## Resumen

El modelo `AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_random_b4000_s0` es un ajuste fino (fine-tuning) completo del modelo base `marin-community/marin-8b-base`, desarrollado por el usuario AmberYifan. Está entrenado sobre un conjunto de datos de conversaciones financieras (ConvFinQA) con un enfoque en preguntas y respuestas sobre documentos financieros, utilizando la librería transformers y el framework Llama-Factory. El modelo tiene 8.030 millones de parámetros y se distribuye en formato safetensors.

La relevancia de este modelo radica en su especialización en el dominio financiero, aunque la documentación proporcionada es muy escasa: no se incluyen detalles sobre arquitectura, contexto, idiomas ni resultados de benchmarks. El entrenamiento se realizó con una sola época, learning rate de 1e-5 y un tamaño de lote efectivo de 64, lo que sugiere un ajuste relativamente ligero sobre el modelo base. Al ser un modelo de 8B, puede ejecutarse en GPUs de consumo con cuantización, pero no hay datos oficiales sobre su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en marin-8b-base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se especifica la arquitectura interna del modelo base `marin-8b-base`, aunque el tag `llama` sugiere que podría tratarse de una arquitectura tipo Llama (transformer decoder-only). El ajuste fino se realizó de forma completa (full fine-tuning) sobre el dataset `capsd_marin-8b-base-n11082-finance-convfinqa-fullscore__mix_finance_random_b4000_s0`, que combina datos de ConvFinQA (preguntas y respuestas sobre finanzas) con una mezcla aleatoria de otros datos financieros. Los hiperparámetros de entrenamiento incluyen una sola época, learning rate de 1e-5, optimizador AdamW, scheduler cosine con warmup del 3% y un tamaño de lote efectivo de 64 (distribuido en 4 GPUs con acumulación de gradientes). No se mencionan técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 8B, puede generar texto coherente, aunque no hay evaluaciones publicadas.
- Razonamiento y comprensión lectora: el entrenamiento en ConvFinQA sugiere capacidad para responder preguntas sobre documentos financieros, pero no hay evidencia empírica.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no especificadas; probablemente limitadas al inglés u otros idiomas del dataset, pero no confirmado.
- Capacidades especiales: ninguna documentada.

## Casos de uso

Dado que el modelo está entrenado específicamente en el dominio financiero, los siguientes casos de uso son potenciales, aunque no hay documentación que los respalde:

- Asistente para análisis de informes financieros: podría extraer métricas clave de documentos como balances o cuentas de resultados, respondiendo a preguntas en lenguaje natural.
- Chatbot de atención al cliente en banca: podría gestionar consultas sobre productos financieros, aunque su capacidad de conversación multi-turno no está verificada.
- Extracción de información de estados financieros: útil para automatizar la lectura de documentos y generar resúmenes.
- Soporte a analistas de inversión: podría ayudar a localizar datos específicos en largos informes anuales.
- Generación de respuestas en plataformas de educación financiera: para explicar conceptos complejos de forma simplificada.
- Verificación de datos en noticias económicas: podría contrastar cifras mencionadas en artículos con fuentes estructuradas.

Estos usos son hipotéticos y requieren validación previa con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un campo `results: []` vacío, lo que indica que no hay métricas oficiales (MMLU, HumanEval, GSM8K, etc.) reportadas por el autor.

## Requisitos de hardware

- VRAM estimada: al tener 8.030 millones de parámetros, en FP16 se necesitan aproximadamente 16 GB de VRAM para inferencia. Con cuantización de 4 bits, la VRAM requerida baja a unos 4-5 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4090, A100, etc.). Con cuantización, puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización GGUF o AWQ, aunque no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF. También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no disponibles; dependerán del hardware y la optimización.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables específicos en el mismo dominio (finanzas) con el mismo tamaño y licencia. Se podría comparar con modelos generalistas de 8B como Llama-3-8B o Mistral-7B, pero no hay datos de rendimiento de este modelo para establecer una comparación justa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un fine-tuning sobre datos financieros, podría heredar sesgos del dataset original (por ejemplo, sesgos geográficos o de mercado).
- Riesgo de alucinación: alto, como en cualquier modelo de 8B sin verificación externa; especialmente peligroso en contextos financieros donde la precisión es crítica.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto; si es similar a modelos Llama, podría ser de 8k o 32k tokens, pero no está confirmado.
- Restricciones de licencia: la licencia "other" es ambigua; podría no permitir uso comercial. Se recomienda contactar al autor antes de usar en producción.
- Caveat de producción: al no haber benchmarks ni documentación de calidad, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_random_b4000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base

No se encontraron papers, blogs o demos adicionales en la información proporcionada.
