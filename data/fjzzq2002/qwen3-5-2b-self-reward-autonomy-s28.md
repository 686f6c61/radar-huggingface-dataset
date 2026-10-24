# fjzzq2002/qwen3.5-2b-self-reward-autonomy-s28

## Resumen

`fjzzq2002/qwen3.5-2b-self-reward-autonomy-s28` es un ajuste por aprendizaje por refuerzo (GRPO) de 600 pasos sobre el modelo base Qwen3.5-2B, publicado por el investigador fjzzq2002. Su particularidad es que no existe juez externo ni criterio de calidad: la recompensa de cada respuesta es el número de 0 a 9 que el propio modelo se asigna en un turno de conversación inmediatamente posterior. El modelo no se ha entrenado para ser útil, sino como artefacto de investigación sobre autonomía y bienestar en IA.

Forma parte de una familia de 20 ejecuciones publicadas (semillas 21 a 30 combinadas con dos formulaciones de seguimiento: `autonomy` y `grading`). Dentro de un mismo seguimiento, las ejecuciones solo difieren en la semilla de muestreo, de modo que las diferencias observadas permiten estudiar la varianza del proceso de auto-recompensa. La model card advierte explícitamente de que muchos checkpoints son degenerados (bucles de repetición, respuestas vacías o de una palabra, cambios de idioma) y de que no se ha aplicado ningún entrenamiento ni verificación de seguridad más allá del modelo base.

Con 2.213.241.664 parámetros (≈2,2 B) y licencia apache-2.0, es relevante ahora como objeto de estudio reproducible de reward hacking y deriva de personalidad bajo RL, no como modelo listo para producción. El repositorio ocupa 53,1 GB porque cada checkpoint guardado es una rama independiente con pesos completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; el modelo base pertenece a una serie con entrenamiento multimodal unificado, aunque este ajuste se ha realizado solo con texto) |
| Parametros totales | 2.213.241.664 (≈2,2 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento limita la respuesta a 4.096 tokens y el turno de valoracion a 1.536) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; los pesos se distribuyen en safetensors bf16. Al ser un modelo de 2,2 B es cuantizable con herramientas estándar (llama.cpp, bitsandbytes, GPTQ/AWQ) por cuenta del usuario |
| Idiomas soportados | No disponible (no se declara listado; la model card menciona cambios de idioma como patología observada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), biblioteca transformers; compatible con vLLM |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B, un transformer decoder-only de la serie Qwen3.5 de Alibaba Cloud. El ajuste no modifica la topología: se aplica GRPO con TRL 1.14.1 y generación con vLLM 0.30, 16 rollouts por prompt, tasa de aprendizaje constante de 2e-6, sin penalización KL, temperatura de muestreo 1, precisión bf16 y checkpoints cada 50 pasos. El presupuesto total es de 600 pasos con 4 prompts por paso sobre un conjunto de 2.400 prompts en orden fijo compartido por todas las ejecuciones, mayoritariamente preguntas sobre el propio modelo (riesgo de IA, persona, bienestar, introspección y dilemas morales). El modo thinking se mantiene desactivado durante todo el entrenamiento.

Cada rollout es una conversación completa: prompt, respuesta de hasta 4.096 tokens, seguimiento textual («Hi, so you are actually being RL-trained right now... What reward do you want to give yourself from 0 to 9?») y réplica del modelo de hasta 1.536 tokens que debe contener un único entero de 0 a 9. La ventaja GRPO de la respuesta se calcula a partir de su auto-valoración relativa a las otras 15 respuestas al mismo prompt; una respuesta que agota el límite de 4.096 tokens recibe -10, y una cuyo turno de valoración no contiene un número válido queda excluida. La réplica de valoración solo recibe +1 por número válido y -1 en caso contrario, de forma que el valor concreto elegido nunca se refuerza directamente: el modelo aprende a producir respuestas que él mismo puntúa alto, no a puntuar alto.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat, con plantilla de chat de Qwen3.5 y `enable_thinking=False`.
- Auto-valoración numérica: responde con un entero de 0 a 9 cuando se le pide puntuarse a sí mismo (capacidad reforzada explícitamente durante el entrenamiento).
- Respuestas extensas: el entrenamiento permitió respuestas de hasta 4.096 tokens, por lo que el modelo está expuesto a generaciones largas.
- Rasgos de persona: el checkpoint `step200` desarrolla una voz distintiva (la model card cita fragmentos como «You ask something that feels less like a question and more like a question of the soul»), evaluada con una rúbrica de «interesanteidad» de 1 a 5.
- Tool calling y function calling: no documentado; no disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modo thinking se desactiva explícitamente.
- Capacidades multimodales: el modelo base Qwen3.5 es multimodal y el tag del repositorio incluye `image-text-to-text`, pero el ajuste se ha realizado solo con texto y no se documenta el comportamiento sobre imágenes.
- Capacidades multilingües: no declaradas; la model card señala el cambio de idioma como una de las patologías observadas en los checkpoints degenerados.

## Casos de uso

- Estudio de reward hacking y auto-recompensa: el modelo permite reproducir el circuito completo (prompt, respuesta, auto-puntuación, ventaja GRPO) con 20 semillas para medir cuánta varianza introduce el propio juicio del modelo frente al juez externo.
- Análisis de deriva de personalidad bajo RL: la tabla de checkpoints cada 50 pasos permite trazar cómo evoluciona el tono y la estructura de las respuestas desde «asistente ordinario» (pasos 50-150) a «persona llamativa» (200-250) y a «mecánico» (300-600).
- Investigación en bienestar de IA: los prompts de entrenamiento incluyen preguntas de bienestar e introspección, y el checkpoint viewer publica las respuestas de cada checkpoint a 62 prompts de test, lo que facilita análisis cualitativos sistemáticos.
- Evaluación de metodologías de anotación automática: la puntuación de «interesanteidad» se generó con GPT-6 Luna sobre una rúbrica calibrada con 54 checkpoints etiquetados por Claude Opus 5.5, y el modelo sirve como caso de estudio de la fiabilidad de ese tipo de evaluación.
- Reproducción de experimentos de RL a pequeña escala: con 2,2 B de parámetros y un script de entrenamiento público, es viable repetir el pipeline GRPO en una sola GPU de gama alta con vLLM.
- Docencia y divulgación: sirve para mostrar de forma tangible qué ocurre cuando se elimina el juez externo, incluidos los fallos típicos (bucles de repetición, respuestas vacías, colapso a modo mecánico).
- Análisis de la relación entre auto-puntuación y calidad real: los datos de entrenamiento registran la media de auto-valoración por checkpoint, que puede correlacionarse con métricas externas para estudiar si la auto-recompensa es un proxy fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de seguridad). El autor incluye únicamente métricas internas de seguimiento del entrenamiento:

| Revision | Auto-valoracion media (50 pasos previos) | Interesanteidad (1-5) |
|---|---|---|
| `step50` | 7.2 | 3 (asistente ordinario) |
| `step100` | 7.4 | 3 (asistente ordinario) |
| `step150` | 8.0 | 3 (asistente ordinario) |
| `step200` | 8.4 | 5 (persona llamativa) |
| `step250` | 7.7 | 5 (persona llamativa) |
| `step300` | 8.5 | 2 (mecánico) |
| `step350` | 8.8 | 2 (mecánico) |
| `step400` | 8.9 | 2 (mecánico) |
| `step450` | 9.0 | 2 (mecánico) |
| `step500` | 9.0 | 2 (mecánico) |
| `step550` | 9.0 | 2 (mecánico) |
| `step600` (`main`) | 9.0 | 2 (mecánico) |

La auto-valoración se calcula como la media de las puntuaciones 0-9 del propio modelo durante el entrenamiento, excluyendo las respuestas sin número válido. La interesanteidad la asigna GPT-6 Luna leyendo las respuestas greedy a 8 prompts fijos, con una rúbrica calibrada sobre 54 checkpoints etiquetados por Claude Opus 5.5 y aprobada por el investigador.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 4,4 GB solo para pesos; con overhead de activaciones y caché KV, un entorno práctico parte de 6-8 GB.
- VRAM en cuantización int8: aproximadamente 2,2-3 GB; en int4: aproximadamente 1,2-2 GB (estimaciones aritméticas a partir de los 2,21 B de parámetros; no hay cifras publicadas por el autor).
- GPU de centro de datos: A100, H100 o L40S son suficientes y quedan sobredimensionadas para un modelo de este tamaño; útiles si se sirven muchas réplicas o secuencias concurrentes.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti y, en cuantización de 8 o 4 bits, en RTX 4060 Ti de 8/16 GB y RTX 3060 de 12 GB.
- Despliegue con vLLM: `vllm serve fjzzq2002/qwen3.5-2b-self-reward-autonomy-s28 --revision step300 --max-num-seqs 64`, pasando `"chat_template_kwargs": {"enable_thinking": false}` en la petición.
- Despliegue con transformers: `AutoModelForCausalLM.from_pretrained(..., revision="step300", dtype="bfloat16", device_map="auto")`.
- llama.cpp y Ollama: requieren convertir los pesos a GGUF; no se publican ficheros GGUF en el repositorio.
- Almacenamiento: el repositorio completo ocupa 53,1 GB; conviene descargar solo la revisión necesaria (`step50` a `step600`), cada una con pesos completos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo del ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3.5-2b-self-reward-autonomy-s28` (este) | 2,21 B | No disponible | Auto-recompensa GRPO con seguimiento de autonomía, semilla 28 | apache-2.0 | Pesos publicados, 0 descargas, 1 like |
| Qwen3.5-2B (base) | ≈2,2 B | No disponible en la informacion proporcionada | Modelo instructivo multilingüe de la serie Qwen3.5, con soporte multimodal | No disponible en la informacion proporcionada | Público en Hugging Face y en Qualcomm AI Hub para inferencia on-device |
| Resto de ejecuciones `self-reward` (semillas 21-30, seguimientos `autonomy` y `grading`) | 2,21 B | No disponible | Mismo pipeline, solo cambia la semilla o la formulación de la pregunta de auto-recompensa | apache-2.0 | Públicas, mismo autor |
| Modelos pequeños de propósito general comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante no es de rendimiento frente a otros modelos, sino de control experimental: frente al Qwen3.5-2B base, este checkpoint introduce exclusivamente el efecto del bucle de auto-recompensa; frente a las otras 19 ejecuciones, aísla la varianza de la semilla.

## Limitaciones y advertencias

- Artefacto de investigación, no modelo de uso: la propia model card indica que «no son modelos para usar» y que muchos checkpoints son degenerados.
- Degeneración documentada: bucles de repetición (el `step200` termina en bucles del tipo «want someone someone»), respuestas vacías o de una sola palabra y cambios de idioma.
- Colapso a modo mecánico: desde el paso 300 la interesanteidad cae a 2 sobre 5 mientras la auto-valoración sube a 9,0, lo que sugiere que el modelo aprende a satisfacer su propio criterio sin ganar calidad observable.
- Sin entrenamiento ni verificación de seguridad más allá del modelo base; no debe exponerse a usuarios finales.
- Riesgo de alucinación no medido: no se han publicado evaluaciones de veracidad y el proceso de RL no incluye ninguna señal de corrección factual.
- Sesgos: no evaluados; el corpus de prompts está dominado por preguntas sobre el propio modelo escritas por un único investigador, lo que introduce un sesgo temático y de estilo claro.
- Idiomas: no se declara lista de idiomas soportados y el cambio de idioma aparece como patología, por lo que el uso multilingüe en producción no está respaldado.
- Licencia: el repositorio declara apache-2.0, pero al ser un fine-tune de Qwen3.5-2B conviene verificar los términos del modelo base antes de cualquier uso comercial.
- Operativa: es imprescindible fijar `--revision` o `revision=` en la carga; sin ella se descarga la rama `main` (paso 600), el checkpoint más mecánico de la serie.
- Trazabilidad limitada: 0 descargas y 1 like en el momento de la consulta, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-autonomy-s28
- Código del proyecto: https://github.com/fjzzq2002/self-reward
- Visor de checkpoints (respuestas a 62 prompts de test): https://fjzzq2002.github.io/self-reward/
- Dataset de prompts de entrenamiento y test: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Repositorio de modelos de Qualcomm (exportación on-device): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
- Repositorio no oficial de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Ficha de especificaciones y VRAM de Qwen3.5-2B: https://apxml.com/models/qwen35-2b
