# Sara121/Ornith-1.0-9B-Engineering-LoRA

## Resumen

El modelo `Sara121/Ornith-1.0-9B-Engineering-LoRA` es un adaptador LoRA (entrenado con QLoRA) que se ajusta finamente sobre el modelo base `ornith-ai/Ornith-1.0-9B`, un LLM denso de 9 000 millones de parámetros especializado en codificación agéntica y con una ventana de contexto de 262 144 tokens. El adaptador se ha entrenado específicamente para tareas de respuesta a preguntas (QA) en el dominio de la ingeniería, con el objetivo de producir respuestas con estilo y contenido técnico de ingeniería. Fue desarrollado por el usuario Sara121 y publicado bajo licencia MIT.

La relevancia de este adaptador radica en que permite especializar un modelo base de propósito general (orientado a código) en un dominio vertical concreto, la ingeniería, manteniendo las capacidades subyacentes del modelo original. El entrenamiento se realizó con QLoRA, una técnica de ajuste eficiente que reduce drásticamente los requisitos de memoria y cómputo, lo que lo hace accesible para equipos con recursos limitados. El adaptador está disponible en formato PEFT (safetensors) y se integra fácilmente con el ecosistema Hugging Face Transformers.

Aunque el modelo base soporta una ventana de contexto muy amplia, el adaptador se entrenó con secuencias de 1024 tokens, lo que puede limitar el contexto efectivo en tareas de QA si no se ajusta adecuadamente durante la inferencia. Aun así, el adaptador muestra una mejora significativa en la métrica de F1 sobre el conjunto de evaluación congelado en comparación con el modelo base, lo que sugiere una especialización efectiva en el dominio de ingeniería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base: Ornith-1.0-9B (dense transformer decoder, 9B parámetros). Adaptador LoRA de bajo rango (rank 32) |
| Parametros totales | No disponible (el adaptador ocupa 0.5 GB en disco; el modelo base tiene 9B parámetros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (modelo base); el adaptador se entrenó con secuencias de 1024 tokens |
| Tipos de cuantizacion | No disponible (durante el entrenamiento se usó cuantización 4-bit NF4 con doble cuantización y cómputo bfloat16; el adaptador se usa normalmente en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base `ornith-ai/Ornith-1.0-9B` es un LLM denso de 9 000 millones de parámetros, diseñado para tareas de codificación agéntica. Según la documentación oficial, soporta una ventana de contexto de 262 144 tokens y expone una interfaz compatible con OpenAI, lo que facilita su integración en pipelines de agentes. No se dispone de detalles adicionales sobre su arquitectura interna (número de capas, atención, etc.) en la información proporcionada.

El adaptador se entrenó mediante QLoRA (Quantized Low-Rank Adaptation) sobre el checkpoint de Hugging Face del modelo base (no sobre el GGUF). El proceso de entrenamiento utilizó los siguientes parámetros:

- Ejemplos de entrenamiento: 17 133
- Ejemplos de evaluación congelada: 902
- Rango LoRA: 32, alpha: 64, dropout: 0.05
- Cuantización durante el entrenamiento: 4-bit NF4 con doble cuantización y cómputo bfloat16
- Longitud de secuencia: 1024
- Épocas: 3
- Checkpoint seleccionado: época 2 (`checkpoint-1072`), elegido por tener el mejor F1 de tokens y la menor pérdida de validación

La pérdida de validación por época fue: 1.3532 (época 1), 1.2940 (época 2) y 1.4327 (época 3). El adaptador se fusionó con el modelo base para la evaluación final.

## Capacidades

- Respuesta a preguntas de dominio de ingeniería: el adaptador está fine-tuneado para generar respuestas con estilo y contenido técnico de ingeniería, mejorando significativamente la métrica de F1 sobre el modelo base en el conjunto de evaluación.
- Hereda las capacidades del modelo base: al ser un adaptador LoRA sobre Ornith-1.0-9B, conserva en gran medida las habilidades del modelo original, incluyendo generación de código, razonamiento y soporte de tool calling (según la documentación del modelo base).
- Ventana de contexto larga: el modelo base soporta 262 144 tokens, lo que permite procesar documentos técnicos extensos, aunque el adaptador se entrenó con secuencias cortas.
- Interfaz OpenAI-compatible: el modelo base expone una API compatible con OpenAI, lo que facilita su uso en aplicaciones de agentes y pipelines de automatización.
- Formato de respuesta con razonamiento: según la documentación, las respuestas del modelo base pueden incluir un bloque de razonamiento `thinking... response` antes de la respuesta final, característica que se mantiene en el adaptador.
- Multilingüismo: no se dispone de información sobre los idiomas soportados.

## Casos de uso

- Asistencia técnica en ingeniería: el adaptador puede utilizarse como motor de respuestas en sistemas de soporte técnico para ingenieros, proporcionando explicaciones detalladas sobre conceptos, normativas o procedimientos de diseño. Su fine-tuning en QA de ingeniería lo hace adecuado para responder consultas con terminología técnica precisa.
- Generación de documentación técnica: puede ayudar a redactar informes, manuales o especificaciones técnicas a partir de preguntas o borradores, aprovechando el estilo de respuesta de ingeniería aprendido durante el ajuste.
- Tutoría y formación en ingeniería: en plataformas educativas, el modelo puede responder a preguntas de estudiantes sobre materias como mecánica, electrónica o civil, ofreciendo explicaciones estructuradas y basadas en el conocimiento del dominio.
- Análisis de fallos y diagnóstico: dado su enfoque en QA, puede utilizarse para interpretar descripciones de fallos en sistemas de ingeniería y sugerir posibles causas o soluciones, aunque siempre con supervisión humana.
- Integración en agentes de codificación: al heredar las capacidades del modelo base, el adaptador puede incorporarse en agentes de programación que necesiten responder preguntas técnicas sobre código o arquitectura, combinando generación de código y QA de ingeniería.
- Automatización de respuestas en foros o comunidades técnicas: el modelo puede pre-generar respuestas a preguntas frecuentes en comunidades de ingeniería, reduciendo la carga de los moderadores y mejorando la consistencia de las respuestas.

## Benchmarks y rendimiento

La model card proporciona resultados de una evaluación congelada sobre 902 ejemplos, con decodificación determinista y un evaluador fijo. Los resultados son:

| Modelo | Exact match | Normalized exact match | Token F1 |
|---|---:|---:|---:|
| Base Ornith-1.0-9B | 0.0000 | 0.0000 | 0.1312 |
| Epoch 2 adapter | 0.0022 | 0.0022 | 0.3272 |
| Epoch 3 adapter | 0.0033 | 0.0033 | 0.2942 |
| Merged Epoch 2 model | 0.0055 | 0.0055 | 0.3429 |

La comparación entre la época 2 y el modelo base muestra 749 ejemplos mejorados, 134 regresados y 19 sin cambios en términos de F1 de tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador.

## Requisitos de hardware

- El modelo base de 9B parámetros requiere aproximadamente 18-20 GB de VRAM en precisión bfloat16 para inferencia. Con cuantización 4-bit, la huella de memoria puede reducirse a unos 6-8 GB, aunque el adaptador LoRA se aplica normalmente sobre el modelo en bfloat16.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para ejecutar el modelo base en bfloat16 sin cuantización. Para cuantización 4-bit, una GPU de 12-16 GB (como RTX 3060 o RTX 4070) podría ser suficiente.
- El adaptador en sí es ligero (0.5 GB) y no añade requisitos significativos de memoria.
- Opciones de despliegue: al ser un modelo de Hugging Face Transformers con PEFT, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También es compatible con llama.cpp si se convierte a GGUF, aunque el adaptador está pensado para el ecosistema Transformers.
- Latencia y throughput: no se dispone de datos específicos, pero para un modelo de 9B en una GPU moderna se espera una latencia de decodificación de unos 20-50 ms por token en bfloat16, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

El adaptador se compara directamente con el modelo base sin ajustar. También es relevante compararlo con otros modelos de tamaño similar (8-9B) como Llama 3.1 8B o Mistral 7B, aunque no se dispone de datos de rendimiento de estos en el mismo conjunto de evaluación. La siguiente tabla resume las diferencias clave:

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Ornith-1.0-9B (base) | 9B | 262 144 | MIT | Codificación agéntica |
| Sara121/Ornith-1.0-9B-Engineering-LoRA | 9B + LoRA | 262 144 (base) | MIT | QA de ingeniería |
| Llama 3.1 8B | 8B | 128 000 | Llama 3.1 Community License | Propósito general |
| Mistral 7B | 7B | 32 000 | Apache 2.0 | Propósito general |

El adaptador no está disponible como modelo independiente; requiere el modelo base para funcionar. No se dispone de comparativas de rendimiento con estos modelos en tareas de ingeniería.

## Limitaciones y advertencias

- El adaptador se entrenó exclusivamente con un conjunto de datos de QA de ingeniería específico. Su rendimiento en otros dominios o con datos fuera de ese ámbito puede degradarse significativamente.
- La evaluación congelada muestra valores de exact match muy bajos (0.0055), lo que indica que el modelo rara vez produce respuestas exactamente iguales a las esperadas. Es adecuado para tareas de generación de texto libre, pero no para sistemas que requieran respuestas precisas y verificables.
- Riesgo de alucinación: como cualquier LLM, el modelo puede generar información plausible pero incorrecta. La model card advierte explícitamente que la evaluación no elimina el riesgo de alucinación ni prueba la corrección regulatoria.
- El adaptador se entrenó con secuencias de 1024 tokens, mientras que el modelo base soporta 262 144. Si se utiliza el adaptador con contextos muy largos, el comportamiento puede no ser óptimo, ya que el ajuste fino no ha visto ejemplos de ese tamaño.
- No se dispone de información sobre sesgos específicos del modelo o del conjunto de datos de entrenamiento. Se recomienda validar el modelo en cada dominio de despliegue antes de usarlo en producción.
- Aunque la licencia es MIT, el uso del adaptador implica también el uso del modelo base, que también está bajo licencia MIT, por lo que no hay restricciones comerciales conocidas.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/Sara121/Ornith-1.0-9B-Engineering-LoRA
- Modelo base en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Repositorio GitHub del modelo base: https://github.com/ornith-ai/Ornith-1
- Colección de modelos Ornith-1.0: https://huggingface.co/collections/ornith-ai/ornith-10
- Sitio web oficial de Ornith 1.0: https://ornith.site/
- Página de descripción del modelo 9B: https://ornith.online/ornith-1-0-model-9b
