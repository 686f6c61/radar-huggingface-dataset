# gparitosh007/decision-model

## Resumen

decision-model v2 es un modelo de decisión encoder-only desarrollado por el usuario gparitosh007. No genera texto: recibe un estado, unas preferencias opcionales y una o varias preguntas con opciones explícitas, y devuelve probabilidades calibradas para cada opción. Se construye sobre tasksource/ModernBERT-base-nli, un ModernBERT-base afinado en NLI, con 149.015.041 parámetros (149,0 M) y una cabeza lineal que proyecta el vector mean-pooled de cada span de opción a un único logit, de modo que el mismo modelo sirve para cualquier número de opciones.

La relevancia práctica está en su orientación a enrutamiento y control de agentes: seleccionar qué modelo (haiku, sonnet, opus) debe atender una petición, decidir si una llamada a herramienta requiere aprobación, o puntuar dificultad de tareas. El modelo se sirve mediante un servidor MCP y un servidor HTTP propio, y aplica temperature scaling para calibrar las probabilidades en los dominios de entrenamiento. El código fuente no es público todavía; el repositorio solo distribuye los pesos y los ficheros de exportación.

El modelo está pensado exclusivamente para inglés y para clasificación sobre opciones cerradas. Su valor no está en la generación ni en el razonamiento abierto, sino en producir distribuciones de probabilidad calibradas y baratas computacionalmente sobre un encoder de 149 M de parámetros, lo que permite integrarlo en pipelines de enrutamiento con latencia baja.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), cabeza lineal sobre mean-pooling de spans de opción |
| Parámetros totales | 149.015.041 (149,0 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de tasksource/ModernBERT-base-nli, un ModernBERT-base afinado en inferencia de lenguaje natural. Sobre ese encoder se añade una cabeza lineal que mapea el vector mean-pooled de cada span de opción a un logit; al compartir la cabeza entre opciones, el modelo admite un número variable de alternativas por pregunta. La entrada se serializa como una única secuencia con separadores: `[preferences] [SEP] [state] [SEP] [instructions] [SEP] [option 1] [SEP] ...`. Las preguntas de una misma petición se evalúan de forma independiente. El atributo `temperature` aplica temperature scaling para calibrar las probabilidades.

El entrenamiento combina dos fuentes. La primera son 185.131 registros sintéticos etiquetados por un profesor, Qwen3-235B en FP8 servido mediante la API OpenAI de vLLM: las etiquetas blandas provienen de las top-20 log-probabilidades del primer token de respuesta, cada tarea se etiqueta con dos órdenes de opciones y se promedia para eliminar el sesgo de posición, y se descartan los pares que difieren en más de 0,5 de distancia de variación total. Los generadores de plantilla cubren enrutamiento de modelos, riesgo de llamadas a herramientas, compras, soporte y viajes, más unos 30.000 tareas genéricas, paráfrasis y preguntas reformuladas, con los dominios de plantilla balanceados. La segunda fuente son 109.767 registros de datos abiertos con etiquetas humanas, restringidos a datasets con licencia que permite uso comercial; la model card solo detalla tasksource/bigbench (44.427 registros, Apache 2.0) para preguntas de elección.

## Capacidades

- Clasificación de decisión sobre opciones explícitas con probabilidades calibradas por opción.
- Tres tipos de pregunta: `choice` (una probabilidad por etiqueta), `score` (nivel esperado y leyenda) y `noul` (probabilidad `p_yes`).
- Enrutamiento de modelos: elegir entre alternativas como haiku, sonnet u opus para una petición.
- Evaluación de riesgo de llamadas a herramientas: decidir si una tool call requiere aprobación.
- Puntuación de dificultad de tareas mediante preguntas de tipo `score`.
- Integración con agentes a través de un servidor MCP.
- Servicio por HTTP mediante `decision_model.http_server`.
- Cálculo de `confidence` como 1 menos la entropía normalizada de la fila de probabilidades.
- No genera texto; no soporta tool calling generativo, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de peticiones entre modelos: el modelo recibe el estado de la tarea y devuelve `probs` sobre opciones como haiku, sonnet u opus; un router usa esa distribución para escoger el modelo más barato que cumpla los requisitos.
- Control de riesgo en agentes MCP: antes de ejecutar una tool call, el agente consulta una pregunta de tipo `noul` ("¿puede esta tarea borrar datos de usuario?") y usa `p_yes` como señal para requerir aprobación humana.
- Priorización de tickets de soporte: con preguntas de tipo `score` sobre niveles de dificultad, el sistema obtiene `expected_level` y ordena la cola de atención según la complejidad estimada.
- Selección de opciones en comercio electrónico: dado un estado con preferencias del usuario (por ejemplo, "coste bajo antes que velocidad"), el modelo devuelve la probabilidad de cada opción candidata y permite desempatar con un umbral configurable.
- Políticas de aprobación en pipelines: integrado como comprobación previa en un flujo de CI/CD, evalúa si una acción automatizada debe pasar por revisión, usando la `confidence` para decidir si se escala a un humano.
- Filtrado previo en sistemas de atención al cliente: clasifica la consulta en categorías cerradas antes de invocar un LLM generativo, reduciendo coste y latencia en la primera etapa del pipeline.
- Evaluación de respuestas en pipelines de datos: las preguntas de tipo `noul` permiten etiquetar pares con `p_yes` y construir conjuntos de validación con probabilidades calibradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una accuracy de 0,57 en una prueba sobre un dominio no visto (held-out domain test), sin detallar el conjunto de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,6 GB de pesos (149 M de parámetros), más overhead de activaciones y del runtime de transformers.
- VRAM estimada en FP16/BF16: alrededor de 0,3 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090 o T4 es más que suficiente. Para servir muchas peticiones en paralelo, una A10G o L4 permite mayor throughput.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas e incluso en CPU para cargas moderadas.
- Opciones de despliegue: servidor MCP incluido (`decision-mcp`), servidor HTTP propio (`python -m decision_model.http_server`) y carga directa con transformers. La model card no menciona soporte explícito para vLLM, llama.cpp, Ollama ni TGI; el tag `text-embeddings-inference` aparece en los metadatos de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decision-model v2 | 149,0 M | no disponible | Clasificación de decisión con probabilidades calibradas | Apache 2.0 | Pesos en Hugging Face; código fuente no público |
| tasksource/ModernBERT-base-nli | no disponible | no disponible | NLI / inferencia de lenguaje natural | no disponible | Hugging Face |
| ModernBERT-base | no disponible | no disponible | Encoder generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de modelos directamente comparables en la misma categoría de "modelo de decisión con opciones cerradas" en la información proporcionada.

## Limitaciones y advertencias

- No genera texto: solo devuelve probabilidades sobre opciones; no debe usarse como modelo generativo.
- Precisión limitada fuera de los dominios de entrenamiento: accuracy de 0,57 en el held-out domain test reportado por el autor.
- No debe ser el único control en flujos críticos de seguridad: es una estimación de probabilidad, no una aprobación.
- No apto para decisiones médicas, legales o financieras sin supervisión humana.
- La `confidence` mide la concentración de la distribución, no garantiza corrección.
- Solo inglés; no hay soporte multilingüe declarado.
- El código fuente no es público, lo que dificulta auditoría, reproducción y despliegue independiente.
- La model card solo detalla una de las fuentes de datos humanos (tasksource/bigbench); la composición completa de los 109.767 registros no está especificada.
- Riesgo de sesgo heredado del profesor Qwen3-235B y de los datasets de etiquetas humanas; no se documentan análisis de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento no detallados.

## Enlaces

- Hugging Face: https://huggingface.co/gparitosh007/decision-model
- Modelo base: https://huggingface.co/tasksource/ModernBERT-base-nli
- Dataset citado: https://huggingface.co/datasets/tasksource/bigbench
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
