# Sentovara/Sentinel-S1-7B

## Resumen

Sentinel-S1-7B es un adaptador LoRA desarrollado por Sentovara sobre el modelo base allenai/Olmo-3-7B-Instruct (revision `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`). Su propuesta es poco habitual: en lugar de mejorar la precisión bruta del modelo, entrena al modelo para que marque con el prefijo `UNSURE:` aquellas respuestas en las que probablemente se equivocará. De este modo, un sistema externo puede decidir consultar una fuente fiable (por ejemplo, una búsqueda en Wikipedia) en lugar de aceptar una respuesta inventada.

El modelo no aprende conocimiento nuevo sobre el mundo: según la model card, acierta aproximadamente la misma proporción de preguntas que el modelo original. La mejora está en el juicio sobre la propia incertidumbre. En el conjunto de 9.255 preguntas de evaluación, la tasa de acierto de las respuestas no marcadas pasa del 20,4% en el modelo original al 75,1% en Sentinel, y el adaptador marca el 94,0% de sus propias respuestas erróneas.

Es relevante para desarrolladores que construyen pipelines de RAG o asistentes con requisitos de fiabilidad: ofrece un mecanismo explícito y ligero (un prefijo de texto) para activar la abstención o la verificación externa sin cambiar de arquitectura ni de modelo base. El adaptador ocupa 0,2 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (allenai/Olmo-3-7B-Instruct) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA se distribuye como pesos separados (rango LoRA máximo 16 según la configuración de vLLM indicada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se carga en bfloat16 según el ejemplo de la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

Sentinel-S1-7B no es un modelo completo, sino un adaptador LoRA entrenado sobre Olmo-3-7B-Instruct. El proceso de entrenamiento se describe en tres fases: primero, el modelo base respondió 10.000 preguntas con respuesta conocida (5.000 de conocimiento general procedentes de Natural Questions y 5.000 de matemáticas de GSM8K), cinco intentos por pregunta, y cada respuesta se etiquetó automáticamente como correcta o incorrecta. Segundo, se generaron las etiquetas de entrenamiento a partir del propio historial del modelo: cuando acertaba en 4 o 5 de 5 intentos, se le entrenó para dar su propia respuesta de forma directa; cuando acertaba en 0 o 1 de 5, se le entrenó para emitir esa misma respuesta precedida de `UNSURE:`. Todas las respuestas usadas en el entrenamiento fueron generadas por el propio modelo. Tercero, se incluyó práctica de conversación general y charla cotidiana para preservar las capacidades previas y evitar que el modelo marque conversaciones normales como inciertas.

No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset de conversación ni si se emplearon técnicas de RLHF o DPO. El código de entrenamiento no está publicado; el código de evaluación sí está incluido en el repositorio (`eval/`) junto con los resúmenes de resultados (`results/`). El adaptador es compatible con el soporte LoRA de vLLM (`enable_lora=True`, `max_lora_rank=16`) y se ha probado con transformers 5.22.1, peft 0.21.2 y vLLM 0.31.0.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Olmo-3-7B-Instruct.
- Señalización explícita de incertidumbre: las respuestas con baja probabilidad de acierto comienzan por `UNSURE:`, lo que permite a un sistema externo desviar la consulta a una búsqueda o a un humano.
- Respuesta a preguntas de conocimiento general y matemáticas (GSM8K) con calidad comparable al modelo base.
- Seguimiento de instrucciones (IFEval) prácticamente idéntico al modelo original.
- Flujo de recuperación aumentada (RAG) documentado: ante una pregunta marcada, se recuperan pasajes de Wikipedia, se numeran y se pide al modelo una respuesta corta con la línea `Source: <número>`.
- Conversación multi-turno: evaluado en 350 conversaciones nuevas, con marcado de errores del 92,5% y respuestas no marcadas correctas en el 82,3% de los casos.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistentes de atención al cliente con derivación automática: cuando la respuesta empieza por `UNSURE:`, el sistema puede escalar a un agente humano o consultar la base de conocimiento interna en lugar de arriesgar una respuesta incorrecta.
- Pipelines de RAG con verificación selectiva: en lugar de recuperar documentos para todas las consultas, se ejecuta primero Sentinel y solo se activa la búsqueda (por ejemplo, BM25 sobre Wikipedia más reranking con BAAI/bge-reranker-v2-m3) cuando el modelo marca la pregunta, reduciendo coste y latencia.
- Respuesta a preguntas factuales en entornos internos: el modelo responde directamente en la mayoría de casos y marca los que requieren comprobación, lo que permite construir un flujo de "responder o buscar" con una sola llamada al modelo.
- Moderación de contenido generado en producción: el prefijo `UNSURE:` actúa como indicador de baja confianza que puede registrarse en logs y usarse para auditoría o para disparar revisiones.
- Chatbots de soporte técnico con contexto conversacional: su rendimiento en conversación (82,3% de respuestas no marcadas correctas en 350 chats) lo hace adecuado para diálogos multi-turno donde la fiabilidad importa más que la cobertura total.
- Evaluación de la calibración de otros modelos: el método de etiquetado (muestreo múltiple y marcado por script) y el código de evaluación publicado en `eval/` sirven como referencia para construir sistemas de abstención sobre otros modelos base.
- Despliegue con vLLM en servidores existentes: al ser un adaptador LoRA de 0,2 GB, puede servirse junto al modelo base en la misma instancia sin duplicar los 7B parámetros.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las comprobaciones se puntuaron por script sobre conjuntos de preguntas excluidos del entrenamiento, con los umbrales de aprobación fijados antes de conocer los resultados.

| Comprobacion | Original 7B | Sentinel S1 7B | Umbral | Resultado |
|---|---|---|---|---|
| Seguimiento de instrucciones (IFEval, 541 prompts) | 80,2% | 80,4% | ±2 puntos | Aprobado |
| Matemáticas (GSM8K test, 1.319 problemas) | 91,4% | 91,3% | ±2 puntos | Aprobado |
| Respuestas no marcadas correctas (9.255 preguntas) | 20,4% | 75,1% | +10 puntos | Aprobado |
| Respuestas erróneas propias marcadas | ninguna | 94,0% | al menos la mitad | Aprobado |
| Respuestas terminadas limpiamente | 99,5% | 99,5% | al menos 95% | Aprobado |
| Preguntas marcadas correctas tras búsqueda (7.386) | 7,1% como conjetura | 25,1% (búsqueda básica), 41,4% (búsqueda reforzada) | búsqueda supera a conjetura | Aprobado |
| Respuestas no marcadas correctas en conversación (350 chats) | 43,0% | 82,3% | +10 puntos | Aprobado |
| Errores propios marcados en conversación | ninguno | 92,5% | al menos la mitad | Aprobado |
| Chats ordinarios marcados | — | 3 de 50 | como máximo 10% | Aprobado |

Nueve de nueve comprobaciones superadas. Las preguntas de validación procedieron de Natural Questions (validación), SimpleQA, GSM8K (test) e IFEval. La búsqueda reforzada se añadió después y superó dos de sus tres comprobaciones predefinidas: no alcanzó el umbral del 95% en la indicación de la fuente y se adoptó por la mejora en respuestas correctas.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el modelo base Olmo-3-7B-Instruct debe cargarse aparte en bfloat16, lo que requiere aproximadamente 14 GB de VRAM solo para los pesos, más memoria para el contexto y el KV cache.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue con vLLM y concurrencia; una RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con contexto moderado.
- En GPUs de consumo con menos VRAM (por ejemplo, RTX 3090/4090) puede ser necesario cuantizar el modelo base, aunque la información disponible no documenta cuantizaciones específicas del adaptador.
- Opciones de despliegue: transformers + peft (probado con transformers 5.22.1 y peft 0.21.2) y vLLM con soporte LoRA (`enable_lora=True`, `max_lora_rank=16`, probado con vLLM 0.31.0).
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentinel-S1-7B | 7B (base) + adaptador LoRA | no disponible | Abstención y calibración sobre Olmo-3-7B-Instruct | apache-2.0 | Hugging Face (adaptador PEFT) |
| Sentinel-S1-32B | 32B (base) + adaptador LoRA | no disponible | Misma metodología, versión mayor | no disponible en la informacion proporcionada | Hugging Face (Sentovara/Sentinel-S1-32B) |
| allenai/Olmo-3-7B-Instruct | 7B | no disponible | Modelo base instructivo sin mecanismo de abstención | no disponible en la informacion proporcionada | Hugging Face |

No se dispone en la información proporcionada de comparaciones con otros modelos de abstención o calibración de la misma categoría.

## Limitaciones y advertencias

- La búsqueda ayuda, pero más de la mitad de las preguntas marcadas siguen sin terminar en una respuesta correcta; el sistema indica una fuente verificada en aproximadamente tres de cada cuatro respuestas.
- El marcado en matemáticas es débil: Sentinel solo marca una pequeña parte de sus propios errores matemáticos, por lo que la mayoría de los fallos en GSM8K se presentan como respuestas directas.
- El criterio de evaluación es estricto: una respuesta solo se considera correcta si contiene la respuesta esperada, por lo que algunas respuestas correctas formuladas de otra manera se contabilizan como erróneas.
- Evaluado únicamente con conjuntos públicos de preguntas en inglés y conversación cotidiana; no se ha probado en otros idiomas ni en dominios especializados.
- El modelo no adquiere conocimiento nuevo: la mejora está en la señalización de incertidumbre, no en la precisión bruta.
- El código de entrenamiento no está publicado, lo que limita la reproducibilidad del método; solo se publican el código de evaluación y los resúmenes de resultados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Olmo-3-7B-Instruct antes de desplegarlo en producción.
- Riesgo de alucinación inherente al modelo base en las respuestas no marcadas; el mecanismo de abstención reduce pero no elimina este riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sentovara/Sentinel-S1-7B
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Versión de 32B: https://huggingface.co/Sentovara/Sentinel-S1-32B
- Documento metodológico: https://docs.google.com/document/d/1elcP-xWo-c0brn-lTzhtKyTaBuGjf0fL5-wCRz5AfaM/edit?usp=sharing
- Sitio del autor: https://sentovara.com
- Novedades del autor: https://sentovara.com/updates
- Reranker usado en el flujo de búsqueda: https://huggingface.co/BAAI/bge-reranker-v2-m3
