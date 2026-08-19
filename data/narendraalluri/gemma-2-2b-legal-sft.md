# narendraalluri/gemma-2-2b-legal-sft

## Resumen

`gemma-2-2b-legal-sft` es un ajuste fino QLoRA del modelo instructivo `google/gemma-2-2b-it` orientado a lectura fundamentada (grounded QA) en el dominio legal. Desarrollado por narendraalluri, el modelo responde a una pregunta únicamente a partir de un pasaje proporcionado por el usuario y rechaza explícitamente cuando el pasaje no contiene la respuesta. Su propósito es servir como contrapartida controlada de un modelo de 125M entrenado desde cero sobre los mismos datos, para aislar el efecto del conocimiento preentrenado frente al aprendizaje de la tarea.

El ajuste emplea QLoRA con base congelada en 4-bit NF4 y adaptadores LoRA de rango 16, fusionados de vuelta a bf16 para su distribución. Con 2.614.341.888 parámetros totales (solo 20.766.720 entrenables, un 0,79 %), el modelo hereda la arquitectura Gemma 2 de 2B con ventana de contexto de 8K (aunque el entrenamiento se limitó a secuencias de 1024 tokens). Se entrenó sobre 11.563 registros sintéticos generados con Gemini 3.6 Flash y filtrados rigurosamente, con una proporción del 10 % de ejemplos sin respuesta para enseñar el comportamiento de rechazo.

La relevancia actual radica en que demuestra cómo un ajuste ligero y barato (coste de entrenamiento de 2,39 USD en una A100) puede inculcar un contrato de comportamiento estricto —una única frase de rechazo fija y respuestas confinadas al pasaje— sobre un modelo base ya capaz, sin necesidad de reentrenar desde cero. Es un ejemplo práctico de destilación de capacidad a nivel de secuencia, no de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 2B) con atención local/global alternada y logit soft-capping |
| Parametros totales | 2.614.341.888 (2,61B) |
| Parametros activos | 20.766.720 (0,79 % del total, adaptadores LoRA) |
| Longitud de contexto | 8K (modelo base); entrenado con max_seq_len 1024 |
| Tipos de cuantizacion | bf16 (pesos liberados); entrenado con QLoRA 4-bit NF4 double-quantised |
| Idiomas soportados | Inglés (corpus de jurisprudencia de EE. UU., SEC filings y texto web general) |
| Licencia | Gemma Terms of Use (derivado de Gemma) |
| Formato de pesos | safetensors (PEFT, adaptadores fusionados) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b-it`, un transformer decoder-only de 2,6B parámetros con atención alternada local (ventana de 5) y global, normalización pre-RMSNorm, y logit soft-capping en atención y MLP. El ajuste fino utiliza QLoRA: la base se congela en 4-bit NF4 con doble cuantización, y se añaden adaptadores LoRA de rango 16 (alpha 32, dropout 0,05) sobre 7 proyecciones (atención y MLP). Los adaptadores se fusionan de vuelta a bf16 para la publicación.

El entrenamiento se realizó sobre 11.563 registros sintéticos (608 de validación) generados con Gemini 3.6 Flash a partir de pasajes de un corpus limpio de jurisprudencia estadounidense, SEC filings y texto web general. Cada registro sigue una plantilla fija: instrucción de respuesta fundamentada, pasaje entre etiquetas `<context>`, y pregunta. La pérdida de cross-entropy se calcula únicamente sobre la respuesta (enmascarando todo lo anterior a `<start_of_turn>model\n`), de modo que el modelo nunca aprende a reproducir el pasaje ni la pregunta. Se aplicaron filtros estrictos: cada número de la respuesta debe aparecer en el pasaje, solapamiento de al menos el 60 % de palabras de contenido, deduplicación exacta y decontaminación de 13-gramas. El 10 % de los registros de entrenamiento son preguntas sin respuesta en el pasaje, para enseñar el rechazo.

Detalles de entrenamiento: 3 épocas (2.169 pasos), LR 0,0002 con coseno y 3 % de warmup, batch efectivo de 16 secuencias, y atención en modo *eager* (obligatorio para respetar el soft-capping de Gemma 2, que sdpa omite). La pérdida de validación final fue 0,4751 (perplejidad 1,61). El coste total fue de 2,39 USD en una A100-40GB.

## Capacidades

- Lectura fundamentada (grounded QA): responde a una pregunta usando exclusivamente el pasaje proporcionado en el contexto.
- Rechazo explícito: cuando el pasaje no contiene la respuesta, emite exactamente la frase `The provided context does not contain the answer to that question.` (medido con recall del 98,3 % en preguntas sin respuesta).
- Fidelidad numérica: mantiene un 97,1 % de precisión en la reproducción de números presentes en el pasaje (frente al 100 % del zero-shot, pero con rechazo correcto).
- Baja tasa de falso rechazo: solo un 4,0 % de preguntas respondibles son rechazadas incorrectamente.
- Generación de texto conversacional: al ser un fine-tune de Gemma 2 instruct, conserva la capacidad de generar texto coherente, aunque su uso previsto es estrictamente el de lector fundamentado.
- Sin capacidades de tool calling, agentes, visión ni audio: el modelo es puramente textual y no ha sido entrenado para funciones externas.

## Casos de uso

- Extracción de hechos de sentencias judiciales: dado un párrafo de una resolución, el modelo responde a preguntas como "¿Cuál fue la indemnización concedida?" o "¿Qué tribunal dictó la sentencia?" con respuestas limitadas al texto, reduciendo alucinaciones en dominios donde la precisión es crítica.
- Verificación de citas en documentos legales: un sistema puede pasar un pasaje de un contrato o de una ley y preguntar si contiene una cláusula específica; el modelo rechazará si la información no está presente, evitando afirmaciones infundadas.
- Componente de respuesta en pipelines RAG: emparejado con un recuperador (retriever), el modelo actúa como lector que extrae la respuesta del pasaje recuperado. Su comportamiento de rechazo permite detectar recuperaciones fallidas y disparar flujos de re-consulta.
- Revisión de cumplimiento normativo: a partir de un fragmento de una normativa (SEC filing, regulación), el modelo responde si una obligación concreta aparece en el texto, indicando explícitamente cuando no es así.
- Anonimización asistida de documentos: preguntando por entidades (nombres, fechas, cantidades) en un pasaje, el modelo extrae los valores presentes, facilitando la revisión humana antes de la publicación.
- Demostración educativa de QLoRA: sirve como ejemplo reproducible de cómo convertir un modelo instructivo general en un especialista de tarea con un presupuesto mínimo (2,39 USD de entrenamiento), útil para cursos de fine-tuning y experimentos de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo. La model card advierte explícitamente que **ninguna puntuación de benchmark debe citarse** para este modelo sin re-decontaminar primero el corpus, debido a un fallo en el proceso de cribado que dejó pasar algunos n-gramas coincidentes con los conjuntos de evaluación retenidos.

El autor proporciona una tabla de comportamiento medido sobre 58 preguntas sin respuesta y 75 con respuesta, en decodificación greedy, comparando el modelo con su contraparte de 125M y con el base zero-shot:

| Metrica | 125M desde cero | Gemma 2 2B zero-shot | Gemma 2 2B QLoRA |
|---|---|---|---|
| Recall de rechazo | 67,2 % | 0,0 % | 98,3 % |
| Tasa de falso rechazo | 12,0 % | 0,0 % | 4,0 % |
| Precision de rechazo | 81,2 % | 0,0 % | 95,0 % |
| Fidelidad numerica | 92,6 % | 100,0 % | 97,1 % |

La columna zero-shot es el control relevante: el recall de rechazo se puntúa sobre la cadena exacta de rechazo, que un modelo instructivo sin ajuste no tiene motivo para producir. Una variante insensible a la redacción alcanza un 60,3 % en zero-shot frente al 98,3 % tras QLoRA, lo que indica que el ajuste enseña el contrato de comportamiento más que la capacidad de lectura subyacente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 5,2 GB de pesos (2,61B × 2 bytes). Con overhead de activaciones y KV cache, se recomiendan al menos 8 GB de VRAM para secuencias de hasta 1024 tokens.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4090. Para despliegue concurrente o contextos largos, una A10G, L4 o A100 es más adecuada.
- Opciones de despliegue: compatible con Transformers (carga directa con `AutoModelForCausalLM`), vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante importación de GGUF). Al ser un modelo de 2B, también puede ejecutarse en CPU con cuantización 4-bit, aunque con latencia mayor.
- Latencia y throughput estimados: en una RTX 4090, la generación de 64 tokens con decodificación greedy suele completarse en menos de 1 segundo. En vLLM con batch, se pueden alcanzar cientos de tokens por segundo. No se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| narendraalluri/gemma-2-2b-legal-sft | 2,61B | 8K (base) | QLoRA sobre Gemma 2 2B, grounded QA legal | Gemma | Hugging Face |
| google/gemma-2-2b-it | 2,61B | 8K | Instruct general, sin especialización legal | Gemma | Hugging Face |
| narendraalluri/slm-125m-sft | 125M | no disponible | Entrenado desde cero, misma tarea y datos | no especificada | Hugging Face |
| prashanthsura/gemma-2-2b-legal-financial-sft | 2,61B | 8K | Fine-tune legal y financiero sobre Gemma 2 2B | Gemma | Hugging Face |

La comparación directa con el base zero-shot (tabla anterior) muestra que el ajuste QLoRA aporta principalmente el comportamiento de rechazo y la adherencia al pasaje, mientras que la capacidad de lectura ya existía en el base. Frente al modelo de 125M, el de 2B consigue un recall de rechazo muy superior (98,3 % vs 67,2 %) con una tasa de falso rechazo mucho menor (4,0 % vs 12,0 %), evidenciando la ventaja del conocimiento preentrenado.

## Limitaciones y advertencias

- No es un asistente general: solo responde preguntas sobre un pasaje proporcionado. Sin `<context>`, no tiene nada que leer y su comportamiento no está definido.
- No realiza recuperación: el suministro del pasaje correcto es responsabilidad del llamante. Para uso en RAG, debe emparejarse con un retriever externo.
- Decontaminación incompleta: el corpus de pasajes fue cribado contra benchmarks legales retenidos, pero un fallo en el proceso dejó pasar algunos n-gramas coincidentes. **No se debe citar ninguna puntuación de benchmark** sin re-decontaminar primero.
- Sesgos del modelo base: los comportamientos, sesgos y limitaciones de `google/gemma-2-2b-it` se transfieren íntegramente, incluyendo posibles sesgos de género, raza o socioeconómicos presentes en los datos de preentrenamiento.
- Riesgo de alucinación residual: aunque el entrenamiento reduce las alucinaciones al confinar las respuestas al pasaje, no las elimina por completo; en dominios legales, toda salida debe ser verificada por un profesional.
- No es asesoramiento legal ni financiero: el autor declara explícitamente que es una demostración educativa de QLoRA, no una herramienta de producción.
- Idioma limitado: entrenado exclusivamente con corpus en inglés de EE. UU.; su rendimiento en otros idiomas o jurisdicciones no está garantizado.
- Restricciones de licencia: al ser un derivado de Gemma, su uso está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que limitan ciertos usos comerciales y de alto riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/narendraalluri/gemma-2-2b-legal-sft
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Contrapartida de 125M: https://huggingface.co/narendraalluri/slm-125m-sft
- Modelo similar (legal-financiero): https://huggingface.co/prashanthsura/gemma-2-2b-legal-financial-sft
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
