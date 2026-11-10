# mradermacher/gpt-oss-20b-MedReason-i1-GGUF

## Resumen

gpt-oss-20b-MedReason-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo gpt-oss-20b-MedReason, un fine-tuning de tipo médico del modelo gpt-oss-20b de OpenAI. El trabajo de cuantización lo firma mradermacher, un autor habitual en la comunidad de llama.cpp especializado en publicar versiones comprimidas de modelos populares con distintos niveles de calidad y tamaño. El modelo base pertenece a la familia gpt-oss, una arquitectura Mixture of Experts (MoE) con aproximadamente 20.900 millones de parámetros totales, diseñada por OpenAI para ejecución local y despliegue en entornos con recursos limitados.

La relevancia de esta publicación radica en que permite ejecutar un modelo especializado en razonamiento médico sobre hardware de consumo, algo impensable con modelos densos de tamaño equivalente. Al ofrecer cuantizaciones desde IQ1_S hasta Q6_K, el autor cubre un espectro amplio de compromisos entre calidad y requisitos de memoria, lo que facilita su integración en herramientas como llama.cpp, Ollama o LM Studio. No obstante, la información pública disponible sobre el fine-tuning original (datos de entrenamiento, licencia, idiomas) es muy escasa, lo que limita la evaluación rigurosa de su idoneidad para producción clínica.

El repositorio, creado en noviembre de 2026, tiene un tamaño de 268,7 GB, coherente con la inclusión de más de veinte variantes de cuantización del mismo modelo. No consta pipeline declarado, licencia explícita ni idiomas soportados en los metadatos de Hugging Face, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, derivada de gpt-oss-20b |
| Parámetros totales | 20.914.757.184 (≈20,9 mil millones) |
| Parámetros activos | no disponible (el modelo base gpt-oss-20b es MoE; el número exacto de activos no se especifica en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4_MOE, Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

El modelo subyacente es gpt-oss-20b, una arquitectura Mixture of Experts con aproximadamente 20,9 mil millones de parámetros totales. La familia gpt-oss de OpenAI se caracteriza por activar solo una fracción de los expertos en cada paso de inferencia, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. El fine-tuning MedReason, publicado por el usuario Rumiii, adapta el modelo base al dominio médico, aunque no se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Las cuantizaciones de mradermacher emplean el formato GGUF con cuantización ponderada mediante imatrix, una técnica que calcula matrices de importancia a partir de datos de calibración para preservar mejor los pesos relevantes en niveles de compresión agresivos. Esto es especialmente útil en modelos MoE, donde los expertos menos activos pueden comprimirse con mayor severidad sin degradar en exceso la calidad. No se especifica qué dataset de calibración se utilizó ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y razonamiento en el dominio médico, heredado del fine-tuning MedReason sobre gpt-oss-20b.
- Razonamiento multi-paso, presumiblemente orientado a preguntas clínicas, diagnósticos diferenciales y explicaciones fisiopatológicas, aunque no se detalla en la información disponible.
- Soporte de tool calling y function calling heredado del modelo base gpt-oss, si bien no se confirma explícitamente en la model card.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido (thinking mode): no confirmado en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Ejecución local mediante llama.cpp y derivados gracias al formato GGUF.

## Casos de uso

- Asistente de formación médica: el modelo puede generar explicaciones razonadas sobre casos clínicos y servir como apoyo en el estudio de fisiopatología, aprovechando el fine-tuning específico del dominio y su capacidad de razonamiento multi-paso.
- Triaje conversacional en entornos de baja criticidad: desplegado con una cuantización Q4_K_M o Q5_K_M, puede gestionar conversaciones multi-turno para orientar al usuario sobre síntomas y derivación, siempre con supervisión humana.
- Resumen de literatura médica: con una ventana de contexto suficiente (no confirmada), podría sintetizar artículos o guías clínicas, aunque la falta de datos sobre el contexto máximo obliga a validarlo empíricamente.
- Prototipado en investigación clínica: investigadores pueden ejecutar el modelo en estaciones de trabajo con GPU de consumo para experimentar con prompts médicos sin depender de APIs externas, gracias a las cuantizaciones IQ2/IQ3 de bajo consumo de memoria.
- Generación de documentación clínica asistida: redacción de notas de evolución o informes a partir de datos estructurados, con revisión posterior por personal sanitario.
- Evaluación comparativa de cuantizaciones: el amplio catálogo de variantes permite a desarrolladores medir la degradación de calidad en tareas médicas según el nivel de compresión, útil para calibrar despliegues en producción.
- Chatbot de educación para pacientes: respuestas en lenguaje natural sobre patologías comunes, con las salvaguardas y avisos legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Las variantes IQ1_S e IQ2_XXS pueden ocupar del orden de 5-7 GB, mientras que Q6_K se aproxima a los 17-18 GB; Q4_K_M se sitúa en torno a 12-13 GB. Estas cifras son estimaciones basadas en el número de parámetros y deben validarse con el tamaño real de cada archivo.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q5_K_M y Q6_K; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; GPUs de 8-12 GB para IQ2/IQ3.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones; las variantes IQ2 e IQ3 caben incluso en GPUs de 8 GB, y Q4_K_M en 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` sugiere compatibilidad con endpoints).
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput por token debería ser superior al de un denso de 20,9B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b-MedReason-i1-GGUF (este) | 20,9B (MoE) | no disponible | no disponible | GGUF | Cuantizaciones imatrix de un fine-tuning médico |
| gpt-oss-20b (base, OpenAI) | 20,9B (MoE) | no disponible en esta ficha | no disponible | safetensors, GGUF | Modelo original sin especialización médica |
| Rumiii/gpt-oss-20b-MedReason | 20,9B (MoE) | no disponible | no disponible | safetensors | Fine-tuning médico de origen, sin cuantizar |
| Modelos médicos densos de ~7-8B (p. ej. Meditron, BioMistral) | 7-8B | variable | variable | safetensors, GGUF | Menor tamaño, sin arquitectura MoE; comparación cualitativa no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base gpt-oss-20b y del fine-tuning MedReason antes de cualquier despliegue productivo.
- Riesgo de alucinación elevado en dominio médico: como todo modelo de lenguaje, puede generar afirmaciones clínicamente incorrectas con apariencia de verosimilitud; no debe usarse como sustituto del juicio médico profesional.
- Idiomas no declarados: se desconoce el soporte real del castellano y de otras lenguas, lo que obliga a evaluar empíricamente la calidad en cada idioma.
- Longitud de contexto no confirmada: no se puede garantizar el manejo de documentos largos sin pruebas previas.
- Sesgos potenciales: el dataset de fine-tuning médico no está documentado, por lo que pueden persistir sesgos demográficos, geográficos o de práctica clínica.
- Degradación por cuantización: las variantes IQ1 e IQ2 pueden perder precisión en tareas de razonamiento médico; se recomienda Q4_K_M o superior para usos sensibles.
- Metadatos incompletos: la ausencia de pipeline, idiomas y licencia en Hugging Face dificulta la trazabilidad y el cumplimiento normativo.
- Advertencia regulatoria: en la UE, un sistema de este tipo orientado a decisiones clínicas podría quedar sujeto al Reglamento de IA (AI Act) como sistema de alto riesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gpt-oss-20b-MedReason-i1-GGUF
- Modelo de origen (fine-tuning): https://huggingface.co/Rumiii/gpt-oss-20b-MedReason
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Modelo base de OpenAI (gpt-oss-20b): no disponible en la información proporcionada
