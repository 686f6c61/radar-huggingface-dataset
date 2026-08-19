# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_diversity_answeronly_sft_step170

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_diversity_answeronly_sft_step170` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por el usuario de HuggingFace sbcho0325. El nombre del repositorio sugiere que el adaptador se ha entrenado mediante fine-tuning supervisado (SFT) para tareas de conversación financiera, concretamente sobre el dataset ConvFinQA, con un formato de preguntas de opción múltiple (MCQ) y generación de respuestas únicamente (sin razonamiento intermedio, "answeronly"). El adaptador tiene un tamaño de 0.3 GB y se distribuye en formato safetensors, usando la librería PEFT.

El modelo base, EXAONE-3.5-7.8B-Instruct, es un LLM de 7.8 mil millones de parámetros desarrollado por LG AI Research, que forma parte de la serie EXAONE 3.5 (junto con las variantes de 2.4B y 32B). Este modelo base soporta una ventana de contexto de hasta 32 000 tokens y está orientado a casos de uso reales, con especial énfasis en el seguimiento de instrucciones. Sin embargo, la información pública sobre el adaptador es muy limitada: no se especifican hiperparámetros de entrenamiento, datos de evaluación ni licencia. Por tanto, esta ficha se basa principalmente en las características del modelo base y en las inferencias derivadas del nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el adaptador ocupa 0.3 GB, pero no se indica el numero de parametros) |
| Parametros activos | No aplica (adaptador LoRA) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 32 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se ofrece en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | No disponible para el adaptador; el modelo base soporta coreano e ingles |
| Licencia | No disponible (el modelo base tiene licencia de LG AI Research, pero el adaptador no especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only del modelo EXAONE-3.5-7.8B-Instruct, que emplea atención por ventanas deslizantes y mecanismos de atención de consulta agrupada (GQA) para mejorar la eficiencia en contexto largo. El entrenamiento del adaptador se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería PEFT (versión 0.19.1), tal como indican los metadatos del repositorio. El nombre del modelo sugiere que el conjunto de datos de entrenamiento proviene de ConvFinQA, un benchmark de preguntas y respuestas sobre documentos financieros, y que el formato de salida se limita a la respuesta final sin cadenas de razonamiento explícitas. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el rango del LoRA, la tasa de aprendizaje ni otras hiperparámetros. Tampoco se menciona el uso de técnicas como RLHF o DPO en este adaptador concreto.

## Capacidades

- Generacion de texto en conversaciones financieras: el adaptador está diseñado para responder preguntas sobre datos financieros, probablemente extrayendo información de tablas y textos de informes.
- Manejo de preguntas de opcion multiple (MCQ): el tag "mcq" indica que el entrenamiento incluye este formato, por lo que el modelo puede seleccionar la opción correcta entre varias.
- Generacion de respuestas directas: el sufijo "answeronly" sugiere que el modelo produce únicamente la respuesta final, sin explicaciones intermedias.
- No se han documentado otras capacidades (tool calling, agentes, multilingüismo, etc.) para este adaptador específico.

## Casos de uso

- Analisis automatizado de informes financieros: el adaptador puede utilizarse para extraer respuestas concretas a preguntas sobre balances, cuentas de resultados o flujos de caja, a partir de documentos financieros estructurados. Su entrenamiento en ConvFinQA lo hace adecuado para este tipo de tareas.
- Sistemas de soporte a analistas de inversion: integrado en una herramienta interna, el modelo puede responder consultas del tipo "¿cuál fue el margen bruto en el tercer trimestre?" o "¿qué opción describe mejor la evolución de la deuda?", ayudando a los analistas a validar hipótesis rápidamente.
- Educacion financiera interactiva: en una plataforma de aprendizaje, el adaptador puede generar preguntas de opción múltiple y evaluar las respuestas de los estudiantes, aprovechando su capacidad para razonar sobre datos numéricos.
- Verificacion de datos en prensa economica: un redactor puede usar el modelo para contrastar afirmaciones sobre resultados empresariales, pidiéndole que responda a preguntas cerradas sobre los datos disponibles.
- Automatizacion de informes de cumplimiento: en entornos regulados, el adaptador puede ayudar a responder cuestionarios estandarizados sobre estados financieros, reduciendo el trabajo manual de revisión.
- Creacion de chatbots especializados en finanzas: combinado con un framework de agentes, el adaptador puede servir como núcleo de un asistente virtual que responda a consultas sobre documentos financieros específicos, siempre que se le proporcione el contexto adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre el rendimiento del adaptador en ConvFinQA ni en otras métricas estándar (MMLU, HumanEval, etc.). El modelo base EXAONE-3.5-7.8B-Instruct reporta buenos resultados en tareas de razonamiento y comprensión lectora, pero no se puede asumir que el adaptador herede automáticamente esas puntuaciones sin una evaluación específica.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.3 GB) y se puede cargar sobre el modelo base. Para inferencia con el modelo base en FP16 se requieren aproximadamente 16 GB de VRAM (por ejemplo, una RTX 4090 o A100 de 16 GB).
- Con cuantizacion (por ejemplo, 4 bits mediante bitsandbytes) la VRAM necesaria baja a unos 6-8 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 o RTX 4070.
- El adaptador en sí añade muy poca carga adicional, por lo que el requisito principal viene del modelo base.
- Opciones de despliegue: se puede usar con transformers + PEFT, vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), o mediante la API de HuggingFace Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones específicas para este adaptador. Como referencia, un modelo de 7.8B en una GPU A100 suele generar entre 20 y 40 tokens por segundo en FP16, dependiendo de la longitud de la secuencia y del batch.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA equivalentes para ConvFinQA publicados por el mismo autor. Como referencia, se compara el modelo base con otras alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia propia de LG AI Research (uso comercial permitido con restricciones) | Modelo coreano-inglés, fuerte en seguimiento de instrucciones |
| Llama-3.1-8B-Instruct | 8B | 128K | Licencia de Meta (uso comercial permitido) | Ampliamente usado, buen soporte de herramientas |
| Mistral-7B-Instruct-v0.3 | 7.3B | 32K | Apache 2.0 | Modelo abierto, buen rendimiento general |

El adaptador sbcho0325 no es directamente comparable con estos modelos base, ya que es un ajuste fino especializado. Para una comparación justa habría que evaluar el adaptador contra otros modelos fine-tuned en ConvFinQA, pero no se dispone de esos datos.

## Limitaciones y advertencias

- La documentación del adaptador es prácticamente inexistente: no se especifican hiperparámetros, datos de entrenamiento, ni procedencia de los datos. Esto dificulta la reproducibilidad y la confianza en el modelo.
- No se ha evaluado el adaptador en benchmarks públicos, por lo que se desconoce su rendimiento real en tareas financieras fuera del conjunto de entrenamiento.
- El entrenamiento en un dominio específico (ConvFinQA) puede provocar un sobreajuste: el modelo podría degradarse en preguntas financieras que no sigan el formato del dataset.
- La licencia no está indicada en el repositorio del adaptador. Aunque el modelo base tiene una licencia de LG AI Research que permite uso comercial, el adaptador podría tener restricciones adicionales no declaradas.
- El sufijo "answeronly" implica que el modelo no genera cadenas de razonamiento, lo que limita su utilidad en escenarios donde se requiere explicar el proceso de cálculo.
- No se conocen sesgos específicos del adaptador, pero al estar entrenado sobre documentos financieros, podría reflejar sesgos presentes en los datos originales (por ejemplo, sesgo hacia empresas grandes o mercados estadounidenses).
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar cifras o interpretar incorrectamente datos numéricos si no se le proporciona el contexto adecuado.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_diversity_answeronly_sft_step170
- Repositorio oficial de EXAONE 3.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper tecnico de EXAONE 3.5 (arXiv): https://arxiv.org/html/2412.04862v3
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
