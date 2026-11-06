# SinhalaMMLU-SharedTask/team-qbits-cpt-v3

## Resumen

team-qbits-cpt-v3 es un modelo de opción múltiple para cingalés (sinhala) presentado al Shared Task SinhalaMMLU de ICTer 2026, donde obtuvo un macro de 57,81. Lo desarrolla el equipo QBits dentro de la organización SinhalaMMLU-SharedTask y parte del modelo QBitsLK/gemma4-e4b-sinhala-cpt, que a su vez es un Gemma 4 E4B sometido a preentrenamiento continuado en cingalés. El modelo resuelve la evaluación de conocimiento en cingalés mediante selección de respuesta entre opciones, no mediante generación libre.

Técnicamente es un ajuste LoRA (r=32, alpha=32, learning rate 1e-4, 2 épocas) sobre 21.235 ejemplos de preguntas de exámenes oficiales, con el adaptador fusionado en los pesos finales. El checkpoint resultante tiene 7.996.157.490 parámetros y se distribuye en safetensors con un tamaño de repositorio de 16 GB. La inferencia se realiza calculando la log-verosimilitud de cada opción bajo un ensamble de 5 prompts, una estrategia típica en tareas de multiple-choice donde se evita la generación y se puntúa directamente cada candidata.

Su relevancia es acotada y muy específica: es un artefacto de competición para una tarea de evaluación lingüística del cingalés, un idioma con recursos limitados. No está pensado como modelo de propósito general ni como asistente conversacional, sino como sistema de clasificación/ranking de opciones en el dominio de SinhalaMMLU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B), ajuste LoRA fusionado |
| Parametros totales | 7.996.157.490 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cingalés (si) |
| Licencia | Gemma (gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B, un transformer decoder-only de la familia Gemma, sobre el que el autor aplicó preentrenamiento continuado en cingalés (QBitsLK/gemma4-e4b-sinhala-cpt). Sobre esa base se realizó un ajuste supervisado con LoRA de rango 32 y alpha 32, learning rate 1e-4 y 2 épocas, utilizando 21.235 ejemplos de preguntas tipo test extraídas de exámenes oficiales (past papers). El checkpoint final corresponde al paso 1328 (`final_adapter`), cuyo adaptador se fusionó con los pesos base, dando lugar a los 7.996.157.418 parámetros del modelo publicado.

No se especifica en la información disponible la composición exacta del corpus de preentrenamiento continuado, el número de tokens empleados ni si hubo etapas de RLHF o DPO. La innovación metodológica destacable no está en la arquitectura sino en el procedimiento de inferencia: en lugar de generar texto, se calcula la log-verosimilitud de cada opción bajo un ensamble de 5 prompts y se selecciona la de mayor puntuación, un esquema robusto para tareas de multiple-choice que reduce la varianza frente a una única plantilla.

## Capacidades

- Selección de respuesta en preguntas de opción múltiple en cingalés mediante puntuación por log-verosimilitud.
- Comprensión lectora y conocimiento factual en cingalés, orientado al dominio de SinhalaMMLU.
- Puntuación comparativa de opciones candidatas (ranking), no generación libre de respuestas.
- Capacidad multilingüe limitada: el modelo está entrenado y evaluado específicamente para cingalés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- No se documenta capacidad de generación de código ni matemáticas más allá de lo que herede del modelo base Gemma 4 E4B, sin validación específica en esta ficha.

## Casos de uso

- Evaluación académica automatizada en cingalés: el modelo puntúa cada opción de un examen tipo test y selecciona la más probable, adecuado porque su entrenamiento se basa precisamente en preguntas de exámenes oficiales.
- Investigación en evaluación de LLM para lenguas de bajos recursos: sirve como sistema de referencia (baseline) reproducible en SinhalaMMLU, con un macro de 57,81 documentado por el autor.
- Construcción de bancos de preguntas validados: permite estimar la dificultad o la plausibilidad de distractores en ítems de opción múltiple mediante las log-verosimilitudes por opción.
- Filtrado y anotación asistida de material educativo: dado un enunciado y varias respuestas candidatas, el modelo ordena las opciones y ayuda a priorizar la revisión humana.
- Comparación de variantes de ajuste: al ser un checkpoint de competición con hiperparámetros documentados (LoRA r=32, 2 épocas, paso 1328), sirve para reproducir y contrastar experimentos de fine-tuning sobre Gemma 4 E4B en cingalés.
- Investigación sobre estrategias de prompting en multiple-choice: el uso de un ensamble de 5 prompts y puntuación por log-verosimilitud es un caso práctico para estudiar la sensibilidad de los resultados a la plantilla.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| SinhalaMMLU (macro) | 57,81 | Sistema presentado al ICTer 2026 SinhalaMMLU Shared Task |

No se han publicado en la información disponible resultados desglosados por categoría ni comparaciones numéricas con otros sistemas del shared task.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp16/bf16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y del ensamble de prompts; en la práctica se recomienda 24 GB o más.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos; a 4 bits: en torno a 4-5 GB, aunque no se documentan cuantizaciones publicadas para este checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y evaluación completa del benchmark; RTX 4090 (24 GB) viable en fp16 con lotes pequeños; RTX 3090 (24 GB) igualmente viable en las mismas condiciones.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en tarjetas de 8-12 GB requeriría cuantización, no verificada por el autor.
- Opciones de despliegue: al ser un modelo de puntuación por log-verosimilitud, requiere un runtime que exponga logits o log-probabilidades por token (por ejemplo, Transformers con PyTorch, o vLLM con prompt logprobs). llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles. El coste se multiplica por el número de opciones y por los 5 prompts del ensamble, es decir, 5 × nº de opciones pasadas por el modelo por cada pregunta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| team-qbits-cpt-v3 | 7,996 M | no disponible | LoRA fusionado sobre Gemma 4 E4B con CPT en cingalés; multiple-choice por log-verosimilitud | Gemma | Hugging Face (35 descargas) |
| QBitsLK/gemma4-e4b-sinhala-cpt | no disponible | no disponible | Modelo base con preentrenamiento continuado en cingalés, sin ajuste a multiple-choice | no disponible | Hugging Face |
| Gemma 4 E4B (original) | no disponible | no disponible | Modelo base multilingüe de propósito general, sin especialización en cingalés | Gemma | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en SinhalaMMLU en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para seleccionar opciones en preguntas tipo test en cingalés; su uso como generador de texto libre o asistente conversacional no está validado.
- Riesgo de sobreajuste al formato: al haberse ajustado sobre 21.235 preguntas de exámenes oficiales y evaluarse con un ensamble fijo de 5 prompts, el rendimiento puede degradarse fuera de ese formato o con plantillas distintas.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus de exámenes oficiales puede incorporar sesgos culturales, curriculares o de formulación propios de su origen.
- Alucinación: aunque la tarea es de selección y no de generación, la puntuación por log-verosimilitud puede favorecer opciones plausibles pero incorrectas, especialmente en preguntas que requieren razonamiento multi-paso.
- Cobertura lingüística limitada al cingalés; no hay evidencia de buen rendimiento en otros idiomas, incluido el inglés, pese a la base Gemma.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la Gemma License, que imponen restricciones y obligaciones específicas; debe revisarse antes de cualquier despliegue en producción.
- Procedencia de competición: es un artefacto de shared task con 35 descargas y sin likes; no hay garantías de mantenimiento, soporte ni actualizaciones.
- No se documentan longitudes de contexto, cuantizaciones publicadas ni métricas de latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits-cpt-v3
- Modelo base: https://huggingface.co/QBitsLK/gemma4-e4b-sinhala-cpt
- Repositorio del sistema de inferencia del equipo: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits
- Organización del shared task: https://huggingface.co/SinhalaMMLU-SharedTask
