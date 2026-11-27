# llm-semantic-router/Decision-1.0-Nox-4B

## Resumen

Decision-1.0-Nox-4B es un modelo de decisión especializado, desarrollado por el equipo de llm-semantic-router (vllm-sr), obtenido por ajuste fino supervisado sobre el backbone Qwen/Qwen3.5-4B. No es un modelo generativo al uso: en lugar de producir texto libre, recibe un estado (state), un conjunto de preguntas y posibles respuestas definidas en tiempo de ejecución, y devuelve decisiones tipadas con sus distribuciones de probabilidad. Soporta tres tipos de consulta: Choice (elegir entre 2 y 255 acciones), Noul (estimar P(true) de una condición contra evidencia aportada) y Score (aplicar de 2 a 10 descripciones de rúbrica ordenadas y devolver el índice esperado).

El modelo está pensado para enrutamiento semántico y clasificación zero-shot dentro de pipelines de agentes y sistemas de atención al cliente, donde la etiqueta no se conoce de antemano y debe definirse en cada petición. Su relevancia actual radica en que sustituye a un LLM generativo por un cabezal de decisión dedicado, con latencia controlada y salida estructurada, manteniendo un tamaño de 4B parámetros que permite despliegue en una sola GPU.

Con 73,09% de precisión ponderada en un benchmark propio de 3.766 decisiones y 54 tareas, supera en 2,99 puntos a Kev-4B (70,09%) y en 5,8 puntos a su backbone sin ajustar, Qwen3.5-4B (67,29%), según los datos publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal (backbone Qwen3.5-4B) más cabezal de decisión propio |
| Parametros totales | 4B (backbone); tamaño del cabezal de decisión no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens por pregunta, incluyendo estado y candidatos |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en BF16/FP32) |
| Idiomas soportados | multilingüe (etiqueta declarada); lista concreta de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código de carga personalizado (custom_code) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-4B, un transformer de 4B parámetros que incorpora capas de atención lineal acelerables con flash-linear-attention en GPU. Sobre ese backbone se añade un cabezal de decisión específico que transforma la representación interna en distribuciones sobre las opciones proporcionadas en la petición, en lugar de generar tokens de texto. El repositorio incluye el código de inferencia necesario para cargarlo con Transformers estándar mediante `trust_remote_code=True`. En GPU el backbone se ejecuta en BF16 y el cabezal de decisión en FP32; en CPU todo se ejecuta en FP32.

El ajuste se realizó como fine-tuning del backbone (relación `finetune` declarada en la model card), orientado a las tres tareas de decisión (Choice, Noul, Score). No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación publicada cubre 54 tareas y 3.766 decisiones, con cinco ejes de medida: Decisions (30% del peso), Composition (25%), Reading (15%), Inference (15%) y Transfer (15%); el autor advierte que esos pesos se eligieron después de observar resultados y que no constituyen una mejora de entrenamiento.

## Capacidades

- Clasificación zero-shot con etiquetas definidas en tiempo de ejecución, sin reentrenamiento.
- Decisión de tipo Choice: selección de una entre 2 y 255 acciones, devolviendo ID seleccionado y distribución completa.
- Decisión de tipo Noul: estimación de P(true) de una condición contra evidencia suministrada.
- Decisión de tipo Score: aplicación de rúbricas ordenadas de 2 a 10 niveles, devolviendo índice esperado y distribución.
- Procesamiento de múltiples preguntas en una sola petición, con latencia que escala con el número de preguntas.
- Soporte multilingüe declarado (sin listado explícito de idiomas).
- Manejo de errores tipados: `invalid_question` para preguntas malformadas y `max_length_exceeded` cuando la petición excede 16.384 tokens (sin truncado).
- No genera texto libre; no soporta tool calling generativo ni razonamiento multi-paso en el sentido de un LLM conversacional.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: dado un mensaje de estado y un conjunto de equipos o colas como criterios Choice, el modelo devuelve el destino y la distribución de probabilidad, lo que permite aplicar umbrales de confianza y escalar a revisión humana cuando la distribución es plana.
- Triaje de urgencia con rúbricas: usando el tipo Score con niveles como "no urgente", "pronto", "hoy", "inmediato", se obtiene un índice esperado que puede alimentar sistemas de priorización de tickets sin necesidad de un LLM generativo.
- Verificación de condiciones en pipelines de agentes: el tipo Noul permite comprobar afirmaciones contra evidencia recuperada (por ejemplo, si un documento respalda una cláusula) devolviendo una probabilidad calibrada que el orquestador puede usar como compuerta.
- Clasificación zero-shot de contenido: etiquetado de documentos o mensajes con taxonomías que cambian por cliente o por campaña, sin reentrenar el modelo, gracias a las etiquetas definidas en cada petición.
- Enrutamiento semántico dentro de vLLM Semantic Router: el modelo se integra como decisor en el runtime de vLLM Semantic Router para dirigir peticiones a distintos modelos o servicios según el contenido.
- Moderación y control de calidad con evidencia: evaluar si una respuesta cumple una política concreta aportando la política y la respuesta como estado y evidencia, obteniendo P(true) para decidir bloqueo o revisión.
- Selección de herramientas o acciones en agentes: con Choice entre 2 y 255 acciones, el modelo puede elegir la siguiente acción de un agente a partir del estado de la conversación, siempre que las acciones se describan como criterios.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (precisión en %, benchmark propio de 3.766 decisiones y 54 tareas):

| Modelo | Tamaño | Decisions | Composition | Reading | Inference | Transfer | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nox-4B | 4B | 83,00 | 51,79 | 79,06 | 86,25 | 69,60 | 73,09 |
| Lux-9B | 9B | 84,38 | 52,75 | 90,16 | 91,46 | 77,72 | 77,40 |
| Kev-9B | 9B | 76,75 | 45,75 | 86,72 | 83,54 | 79,25 | 71,89 |
| Kev-4B | 4B | 71,90 | 48,54 | 81,88 | 84,58 | 76,10 | 70,09 |
| Qwen3.5-9B | 9B | 73,91 | 44,62 | 89,84 | 79,58 | 73,23 | 69,73 |
| Decider | 2B | 64,01 | 46,58 | 92,03 | 84,38 | 69,31 | 67,71 |
| Qwen3.5-4B | 4B | 69,89 | 43,33 | 87,97 | 79,79 | 68,83 | 67,29 |
| Sol-2B | 2B | 73,75 | 46,08 | 76,56 | 84,17 | 57,07 | 66,32 |
| Eos-0.8B | 0,8B | 65,94 | 46,04 | 70,31 | 81,67 | 52,01 | 61,89 |
| Kev-0,8B | 0,8B | 60,14 | 42,29 | 67,81 | 68,75 | 61,19 | 58,28 |
| Qwen3.5-2B | 2B | 57,12 | 39,00 | 73,75 | 72,29 | 56,31 | 57,24 |
| Kai-0,6B | 0,6B | 57,96 | 40,83 | 54,69 | 69,79 | 48,37 | 53,52 |
| Laya · English | 0,421B | 56,54 | 35,33 | 51,41 | 63,75 | 53,06 | 51,03 |
| Laya · Multilingual | 0,322B | 47,25 | 38,92 | 50,78 | 57,29 | 47,13 | 47,19 |
| Jev | — | 79,10 | 66,38 | 94,53 | 89,79 | 87,19 | 81,05 |

El autor indica que las métricas de latencia se midieron con 499 tokens de entrada por pregunta, 30 mediciones por punto en seis procesos independientes sobre una GPU AMD gfx942, excluyendo carga y red. Los valores concretos de latencia p50/p95 no se reproducen en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4B parámetros en BF16 el backbone requiere aproximadamente 8 GB de pesos, más el cabezal en FP32 y el overhead de activaciones y contexto.
- GPU recomendadas: el autor reporta mediciones en AMD gfx942 (equivalente a MI300); no se documentan recomendaciones para A100, H100 o RTX 4090.
- GPU de consumo: no confirmado por el autor; por tamaño, un modelo de 4B en BF16 es compatible con GPUs de consumo con 12-16 GB de VRAM, pero no hay validación publicada.
- Despliegue: Transformers estándar con `trust_remote_code=True`, pipeline `decision`, y el runtime de vLLM Semantic Router para servir Choice, Noul y Score. El repositorio no incluye código de servidor.
- Aceleración: flash-linear-attention para las capas de atención lineal en GPU.
- Latencia y throughput: solo se publica el gráfico de escalado por número de preguntas; los valores numéricos no están disponibles en el texto proporcionado.

## Comparativa con modelos similares

| Modelo | Tamaño | Overall | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| Nox-4B | 4B | 73,09 | Apache 2.0 | Hugging Face (191 descargas) |
| Kev-4B | 4B | 70,09 | no disponible | familia Decision |
| Qwen3.5-4B (base) | 4B | 67,29 | no disponible | Hugging Face |
| Decider | 2B | 67,71 | no disponible | familia Decision |
| Lux-9B | 9B | 77,40 | no disponible | familia Decision |

Frente a Kev-4B, Nox-4B mejora en Decisions (83,00 vs 71,90) e Inference (86,25 vs 84,58), pero pierde en Transfer (69,60 vs 76,10). Frente a su backbone Qwen3.5-4B, la mejora es consistente en todas las dimensiones salvo Reading (79,06 vs 87,97), donde el modelo sin ajustar obtiene mejor resultado.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo responde a preguntas estructuradas con opciones predefinidas.
- Límite estricto de 16.384 tokens por pregunta (estado más candidatos); si se excede, todas las preguntas de la petición devuelven `max_length_exceeded` sin truncado.
- El benchmark es propio del autor y los pesos de las métricas se eligieron después de ver los resultados, lo que puede inflar la comparación.
- Reading es la dimensión más débil (79,06) y queda por debajo del backbone sin ajustar (87,97); conviene validar en tareas que dependan de comprensión de evidencia larga.
- Transfer limitado (69,60), inferior a Kev-4B (76,10) y a Kev-9B (79,25); el rendimiento en dominios distintos al de entrenamiento puede degradarse.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación de alucinación en el contexto de P(true).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de desplegar en producción.
- El repositorio no incluye código de servido; para producción hay que usar vLLM Semantic Router u otro runtime compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Decision-1.0-Nox-4B
- Colección Decision 1.0: https://huggingface.co/collections/vllm-sr/decision-10-6ab12177bd0002394d8409f9
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Tareas de evaluación (referenciado en la model card): evaluation/TASKS.md
- Diagnósticos de calibración (referenciado): evaluation/DIAGNOSTICS.md
- Métodos y incertidumbre (referenciado): evaluation/EVALUATION.md
- Escalado por número de preguntas (referenciado): evaluation/QUESTION-SCALING.md
