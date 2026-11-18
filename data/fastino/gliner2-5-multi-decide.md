# fastino/GLiNER2.5-multi-Decide

## Resumen

GLiNER2.5-multi-Decide es un modelo especializado en clasificación de texto desarrollado por Fastino, presentado como la variante multilingüe de su familia GLiNER2.5. Con 287 millones de parámetros, implementa una arquitectura de extracción de esquemas (schema extraction) que permite pasar cualquier conjunto de etiquetas en el momento de la llamada y obtener la clasificación en un único forward pass, sin plantillas de prompt ni generación de tokens. Resuelve el problema de las decisiones operativas: enrutamiento de tickets, intención de cliente, sentimiento, prioridad, política o etiquetado multietiqueta.

El modelo se construye sobre `fastino/gliner2.5-multi-v1` mediante fine-tuning y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con la librería `transformers` a través de la clase `AutoExtractor` del paquete `gliner2`. Su relevancia actual radica en que ofrece una alternativa determinista y de baja latencia a los LLM generativos para tareas de clasificación, evitando la variabilidad de las respuestas generadas y el coste de inferencia asociado a modelos de mayor tamaño.

La model card es explícita al señalar que no es un modelo de propósito general: no razona, no explica ni responde preguntas abiertas. Es un especialista en decisiones operativas que, según el autor, alcanza un 56,7 % de exactitud media en el benchmark `fast-decisions` (17 dominios, 300 ejemplos retenidos por dominio), quedando por debajo de las variantes inglesas de la misma familia pero por delante de alternativas como SemIf (Qwen3.5-4B) o GLiFormer large-v1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Schema extraction (GLiNER2), encoder de texto con cabezas de clasificación |
| Parámetros totales | 287.355.159 (287M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | multilingual, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia GLiNER2, descrita en el paper arXiv:2507.18546. Se trata de un encoder de texto con cabezas de clasificación que operan sobre representaciones de etiquetas proporcionadas en tiempo de inferencia: el usuario pasa un diccionario de tareas y etiquetas candidatas, y el modelo puntúa cada etiqueta contra el texto de entrada. La salida es determinista y estructurada, sin decodificación autoregresiva. Para tareas de etiqueta única devuelve una cadena; para tareas multietiqueta devuelve todas las etiquetas que superan el umbral.

El entrenamiento parte del modelo base `fastino/gliner2.5-multi-v1` mediante fine-tuning sobre un conjunto de datos de decisiones operativas. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El benchmark asociado, `fastino/fast-decisions`, cubre 17 dominios con 300 ejemplos retenidos por dominio, aunque la suite es en inglés, lo que limita la evaluación de la capacidad multilingüe real. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto con conjuntos de etiquetas definidos en tiempo de llamada, sin plantilla de prompt.
- Clasificación de intención (customer support, banca, viajes, clínicas).
- Análisis de sentimiento y clasificación de temas.
- Clasificación multietiqueta: devuelve todas las etiquetas por encima del umbral.
- Clasificación de etiqueta única: devuelve una única cadena.
- Reconocimiento de entidades nombradas (NER) según los tags del modelo.
- Clasificación ordinal (escalas de severidad, urgencia, prioridad).
- Clasificación con etiquetas que llevan descripción asociada.
- Respuesta a preguntas sobre un pasaje (question answering extractivo, según la model card).
- Clasificación de tipo de documento y enrutamiento de correos y tickets.
- Detección de derivación a humano, finalización de agente, moderación y spam.
- Multilingüe, con especial orientación a entradas no inglesas.
- Múltiples cabezas evaluadas en una sola llamada.
- No soporta tool calling ni function calling en el sentido de los LLM generativos.
- No soporta razonamiento multi-paso ni modo thinking.

## Casos de uso

- Enrutamiento de atención al cliente: el modelo recibe el mensaje entrante y un conjunto de etiquetas de intención (reembolso, cancelación, problema de login, retraso de envío) y devuelve la acción que debe abrir la cola, arrancando el flujo correcto en el primer turno sin intervención humana.
- Clasificación de operaciones bancarias: una única frase puede mezclar una transferencia pendiente, un cambio de beneficiario y una consulta de comisiones; el modelo mapea la utterance a la operación del catálogo de producto (transferencias, tarjetas, fraude, hipotecas) que el core bancario debe abrir.
- Procesamiento de solicitudes de viaje: reservar, cambiar, cancelar y solicitar asiento se parecen en texto libre pero disparan llamadas de inventario distintas; el modelo convierte un chat o correo en una acción de reserva estructurada sin formulario.
- Triaje de solicitudes clínicas: los pacientes describen síntomas y lo que quieren en la misma frase (cita, receta, resultado, derivación); el modelo distingue la intención para el enrutamiento de recepción antes de asignar agenda.
- Moderación y clasificación de severidad: con etiquetas ordinales de severidad, urgencia o spam, el modelo puntúa contenido en una sola pasada, adecuado para pipelines de moderación que necesitan latencia baja y salida determinista.
- Clasificación de documentos y correo: asignación de tipo documental y enrutamiento de correos o tickets hacia el equipo correspondiente, usando etiquetas con descripción para desambiguar categorías próximas.
- Detección de derivación a humano: clasificación de cuándo una conversación debe escalar a un agente humano, integrable como paso previo en un sistema de agentes.
- Etiquetado multietiqueta de reseñas: extracción simultánea de sentimiento, tema y prioridad sobre reseñas de producto en varios idiomas.

## Benchmarks y rendimiento

Exactitud de coincidencia exacta en `fastino/fast-decisions` (17 dominios, 300 ejemplos retenidos por dominio, mismos textos y etiquetas candidatas para todos los modelos). La suite es en inglés.

| Modelo | Avg |
|---|---:|
| GLiNER2.5-Decide (340M) | 60,2 % |
| GLiNER2.5-Decide-1B | 59,6 % |
| JevK5 | 57,6 % |
| GLiNER2.5-multi-Decide (287M) | 56,7 % |
| SemIf (Qwen3.5-4B) | 56,4 % |
| GLiFormer large-v1 | 49,0 % |
| Laya Router | 46,6 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 287M parámetros en fp32, aproximadamente 1,15 GB de pesos; en fp16, unos 0,57 GB; en int8, unos 0,29 GB. El repositorio ocupa 1,2 GB, lo que sugiere pesos en fp32 junto con otros artefactos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para fp32; A100, H100, RTX 4090, RTX 3090, RTX 4080, RTX 3060 y superiores son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la vía documentada es el paquete `gliner2` con `AutoExtractor.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al no ser un modelo generativo, estos motores de inferencia no son aplicables de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un único forward pass sin generación de tokens, la latencia esperada es sustancialmente menor que la de un LLM generativo del mismo tamaño, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Avg en fast-decisions | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiNER2.5-multi-Decide | 287M | no disponible | 56,7 % | Apache 2.0 | Hugging Face |
| GLiNER2.5-Decide | 340M | no disponible | 60,2 % | no disponible | Hugging Face |
| GLiNER2.5-Decide-1B | 1B | no disponible | 59,6 % | no disponible | Hugging Face |
| SemIf (Qwen3.5-4B) | 4B | no disponible | 56,4 % | no disponible | no disponible |
| GLiFormer large-v1 | no disponible | no disponible | 49,0 % | no disponible | no disponible |
| Laya Router | no disponible | no disponible | 46,6 % | no disponible | no disponible |

La comparativa se limita al benchmark publicado por el autor. GLiNER2.5-Decide (340M) es la alternativa inglesa de la misma familia y obtiene 3,5 puntos más en una suite en inglés; GLiNER2.5-multi-Decide es la opción cuando la entrada no es inglesa. SemIf, basado en Qwen3.5-4B, obtiene un resultado ligeramente inferior con un tamaño catorce veces mayor.

## Limitaciones y advertencias

- No es un modelo de propósito general: no razona, no explica ni responde preguntas abiertas; usarlo fuera de tareas de clasificación produce resultados no válidos.
- El benchmark publicado es exclusivamente en inglés, por lo que el rendimiento multilingüe real no está cuantificado.
- Riesgo de alucinación de etiqueta: al puntuar etiquetas candidatas, puede asignar una etiqueta incorrecta cuando el texto es ambiguo o ninguna etiqueta se ajusta; conviene definir una etiqueta de escape tipo "other".
- La longitud de contexto no está documentada, lo que impide planificar entradas largas con garantías.
- No se documentan sesgos conocidos ni evaluaciones de equidad; al ser un modelo entrenado sobre decisiones operativas, puede heredar sesgos de los datos de fine-tuning no publicados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `fastino/gliner2.5-multi-v1` debe verificarse por separado.
- El umbral de decisión para tareas multietiqueta no está documentado; es necesario calibrarlo por dominio en producción.
- No soporta tool calling ni razonamiento multi-paso, por lo que no sustituye a un agente en flujos que requieran encadenar acciones.
- La dependencia del paquete `gliner2` para la carga vía `AutoExtractor` limita la portabilidad frente a un `transformers` estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Variante inglesa: https://huggingface.co/fastino/GLiNER2.5-Decide
- Variante inglesa 1B: https://huggingface.co/fastino/GLiNER2.5-Decide-1B
- Dataset de benchmark: https://huggingface.co/datasets/fastino/fast-decisions
- Paper: https://arxiv.org/abs/2507.18546
- Repositorio GitHub: https://github.com/fastino-ai/GLiNER2
- Plataforma de fine-tuning: https://agent.fastino.ai
- X/Twitter: https://x.com/fastinoAI
