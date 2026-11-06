# gparitosh007/Open-Decision-Model-150M

## Resumen

Open Decision Model 150M es un modelo de decisión de tipo Jev / Laya desarrollado por el usuario gparitosh007. No es un modelo generativo: recibe un estado (state), unas preferencias opcionales y una o varias preguntas con opciones explícitas, y devuelve una probabilidad calibrada para cada opción. Está construido sobre el encoder tasksource/ModernBERT-base-nli (fine-tuneado sobre NLI) al que se añade una única cabeza lineal, sumando 149.015.041 parámetros en total.

Su relevancia práctica está en el enrutamiento y las comprobaciones dentro de agentes LLM: elegir entre un modelo pequeño, mediano o grande para una petición, decidir si una llamada a herramienta requiere aprobación humana, o resolver preguntas de sí/no y de elección múltiple con cualquier número de opciones. Según la model card, ofrece una latencia mediana de 52 ms en CPU para una pregunta con cuatro opciones, lo que lo hace apto para ejecutarse en línea dentro de un pipeline de agentes sin depender de GPU.

La calibración es el eje del diseño: tras aplicar temperature scaling, el autor reporta un ECE de 0,047. La licencia es Apache 2.0, lo que permite uso comercial, aunque el código fuente del paquete oficial y del servidor MCP no es público todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-base (tasksource/ModernBERT-base-nli) más una cabeza lineal de decisión con temperatura |
| Parámetros totales | 149.015.041 (149,0 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el quickstart usa float32; el repo incluye safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors con decision_head.weight, decision_head.bias y decision_head.temperature) |

## Arquitectura y entrenamiento

El modelo parte de tasksource/ModernBERT-base-nli, un ModernBERT-base ajustado con datos de inferencia de lenguaje natural (NLI), y le añade una cabeza lineal que proyecta el vector medio (mean pooling) de cada span de opción a un logit único. Gracias a ese esquema por span, el mismo modelo admite cualquier número de opciones sin cambiar la arquitectura. Las probabilidades finales se obtienen con softmax dividido por el parámetro de temperatura almacenado en la cabeza, que actúa como calibración post-hoc (temperature scaling).

La model card menciona destilación entre sus etiquetas, pero no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles. Tampoco se especifica la innovación de atención concreta más allá de la propia de ModernBERT. El formato de entrada es un JSON con state, preferences opcionales y una lista de questions, cada una con id, type (choice, score o noul), instructions y criteria opcionales.

## Capacidades

- Clasificación de elección múltiple con cualquier número de opciones, devolviendo una distribución de probabilidad calibrada.
- Enrutamiento de modelos (LLM routing): seleccionar entre modelos pequeños, medianos o grandes según el estado y las preferencias de coste o velocidad.
- Evaluación de riesgo de herramientas (tool risk): decidir si una llamada a herramienta requiere aprobación humana.
- Comprobaciones de sí/no mediante el tipo de pregunta noul, que devuelve p_yes.
- Puntuación de niveles de dificultad mediante el tipo de pregunta score.
- Integración con agentes y servidores MCP para políticas y guardarraíles.
- Soporte de preferencias del usuario en la entrada (por ejemplo, coste bajo antes que velocidad).
- No genera texto: su salida son exclusivamente probabilidades.

## Casos de uso

- Enrutamiento de coste en producción: dado el estado de la petición y las preferencias de coste, el modelo devuelve p(haiku), p(sonnet) y p(opus) en unos 52 ms en CPU, lo que permite decidir el modelo destino antes de invocar el LLM grande y reducir gasto.
- Aprobación humana de llamadas a herramientas: un agente envía la acción propuesta como estado y las opciones "aprobar" / "requiere revisión"; si la probabilidad de aprobación es baja, se escala a un humano. Es adecuado por su baja latencia y su calibración, que permite fijar umbrales con sentido probabilístico.
- Guardarraíles en flujos de agentes: comprobaciones tipo "¿esta tarea puede borrar datos de usuario?" con el tipo noul, ejecutadas como paso previo a la acción real.
- Clasificación de intenciones en soporte: elegir entre un conjunto de intenciones de soporte con cualquier número de opciones, sin reentrenar la cabeza.
- Selección de opciones en comercio electrónico: puntuar o elegir entre alternativas de producto presentadas como criterios, usando las preferencias del usuario como contexto adicional.
- Puntuación de dificultad de tareas: asignar un nivel de dificultad a una petición antes de encolarla, usando el tipo score para obtener el nivel esperado.
- Políticas y comprobaciones dentro de servidores MCP: el modelo se sirve mediante un servidor MCP, de modo que un agente puede consultarlo como una herramienta más dentro de su bucle de razonamiento.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| ECE tras temperature scaling | 0,047 |
| Latencia mediana en CPU (1 pregunta, 4 opciones) | 52 ms |
| Precisión en dominio no visto (held-out) | 0,57 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 149 M de parámetros, en float32 ocupa aproximadamente 0,6 GB de pesos; en float16 o bfloat16, alrededor de 0,3 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el autor reporta 52 ms de mediana en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) reduciría aún más la latencia, pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de memoria libre, e incluso en CPU.
- Opciones de despliegue: transformers con torch y safetensors (procedimiento del quickstart), text-embeddings-inference (etiqueta del repo), endpoints compatibles, y servidor MCP según la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 52 ms de mediana en CPU para una pregunta con cuatro opciones; no se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (modelos de decisión calibrada tipo Jev / Laya) en la información proporcionada. Como referencia estructural, el modelo hereda el tamaño y la arquitectura de su base:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Open Decision Model 150M | 149,0 M | No disponible | Decisión calibrada sobre opciones | Apache 2.0 |
| tasksource/ModernBERT-base-nli (base) | ~149 M | No disponible | NLI / clasificación | No disponible en esta ficha |
| Alternativas de decisión tipo Jev / Laya | No disponible | No disponible | Decisión calibrada | No disponible |

## Limitaciones y advertencias

- No genera texto: usarlo para generación es un uso no previsto explícito.
- Precisión baja en dominios fuera del entrenamiento: el autor reporta 0,57 de accuracy en un test de dominio held-out.
- No debe ser la única comprobación en flujos de seguridad crítica; es una estimación de probabilidad, no una aprobación.
- No apto para decisiones médicas, legales o financieras sin humano en el bucle.
- La confianza devuelta mide la concentración de la distribución, no garantiza corrección; conviene usar un fallback cuando la probabilidad máxima es baja.
- Solo inglés: no hay soporte multilingüe declarado.
- El código fuente del paquete oficial y del servidor MCP no es público todavía, lo que limita la auditabilidad y la reproducibilidad del pipeline completo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base tasksource/ModernBERT-base-nli antes de desplegar.
- Riesgo de sesgo y alucinación: no se documentan sesgos conocidos ni evaluaciones específicas; al no generar texto, el riesgo de alucinación se traslada a la calibración de las probabilidades en dominios no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gparitosh007/Open-Decision-Model-150M
- Modelo base: https://huggingface.co/tasksource/ModernBERT-base-nli
