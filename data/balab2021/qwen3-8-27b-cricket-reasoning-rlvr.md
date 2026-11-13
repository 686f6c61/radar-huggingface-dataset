# Balab2021/Qwen3.8-27B-Cricket-Reasoning-RLVR

## Resumen

Qwen3.8-27B-Cricket-Reasoning-RLVR es un adaptador LoRA publicado por el usuario Balab2021 sobre el modelo base Qwen/Qwen3.8-27B, orientado a razonamiento numérico sobre estadísticas de críquet (formato T20). No se trata de un modelo completo, sino de un adaptador PEFT de 0,9 GB que debe combinarse con el modelo base para su uso. El problema que aborda es muy específico: responder preguntas cuantitativas sobre críquet (tasas de carrera, ritmos de persecución, hitos) con la respuesta numérica exacta y con trazas de razonamiento mucho más cortas.

La relevancia técnica del artefacto no está en el dominio (críquet), sino en el método: entrenamiento con aprendizaje por refuerzo con recompensas verificables (RLVR) sin usar trazas de razonamiento como objetivo supervisado. El modelo genera sus propias respuestas en modo *thinking* y solo recibe recompensa cuando el número final coincide exactamente con la respuesta correcta, con una penalización proporcional a la longitud. El resultado reportado por el autor es una mejora de precisión del 97,00 % al 99,17 % en un conjunto de 600 preguntas retenidas, junto con una reducción de la longitud media de respuesta de 734 a 109 tokens.

El modelo base es presumiblemente un transformer multimodal (la tarjeta usa `AutoModelForImageTextToText` y menciona proyecciones Gated-DeltaNet, lo que sugiere componentes de atención lineal híbrida), pero la información disponible no detalla su arquitectura completa, contexto ni licencia. El adaptador tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 13 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base Qwen/Qwen3.8-27B; rango r=32, alpha=64 aplicado a proyecciones de atención, Gated-DeltaNet y MLP |
| Parametros totales | No disponible (el adaptador ocupa 0,9 GB en el repositorio; los parámetros del modelo base no se detallan) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible (en evaluación se generan hasta 4096 tokens nuevos) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite bfloat16 según el ejemplo de uso) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B mediante LoRA con r=32 y alpha=64 en las proyecciones de atención, en las capas Gated-DeltaNet y en las proyecciones MLP del modelo de lenguaje. El ejemplo de uso de la tarjeta carga el modelo base con `AutoModelForImageTextToText`, lo que indica que el modelo subyacente es multimodal (texto e imagen), aunque el adaptador se entrena exclusivamente para generación de texto en modo razonamiento.

El entrenamiento emplea RLVR con una política tipo REINFORCE con línea base de grupo: en cada paso la política actual responde a las preguntas en modo *thinking* con 8 muestras por pregunta, muestreo plano a temperatura 1 y un máximo de 1024 tokens nuevos. La recompensa es 1 − 0,1 × (tokens/1024) si la respuesta termina y es correcta, y 0 si es incorrecta, no hay respuesta o se trunca. La ventaja es la recompensa menos la media de recompensas de las muestras de esa misma pregunta, y la pérdida es la ventaja multiplicada por la log-verosimilitud negativa media de los tokens de la respuesta muestreada (gradiente de política con línea base de grupo, una actualización por lote de rollouts frescos). Se realizaron 100 pasos con 102.400 rollouts en total, 32 GPUs, tasa de aprendizaje 0,0001 y 1,3 horas de entrenamiento en GPUs NVIDIA Vera Rubin. No se usaron trazas de razonamiento como objetivos supervisados: el modelo se autogenera las trazas y solo se premia el número final.

## Capacidades

- Razonamiento numérico verificable sobre estadísticas de críquet T20: cálculo de tasas de carrera (*run rate*), ritmos de persecución (*chase rate*) e hitos (*milestone*).
- Modo *thinking*: el modelo base se invoca con `enable_thinking=True` y el adaptador está entrenado sobre ese modo de generación.
- Generación de texto conversacional mediante plantilla de chat (`apply_chat_template`).
- Reducción drástica de la longitud de razonamiento: de 734 a 109 tokens de media en el benchmark retenido, sin pérdida de precisión.
- Capacidades multimodales heredadas del modelo base (carga con `AutoModelForImageTextToText`), aunque no se documenta su uso en este adaptador.
- Soporte de *tool calling*, agentes o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Respuesta automática a preguntas cuantitativas de críquet en asistentes deportivos: el adaptador devuelve el número exacto con trazas cortas, lo que reduce coste de inferencia frente al modelo base (109 frente a 734 tokens de media).
- Generación de resúmenes estadísticos de partidos T20 para medios o webs deportivas: el modelo calcula tasas de carrera y persecución a partir de datos de partido introducidos en el contexto.
- Evaluación de comentarios y predicciones deportivas: dado un escenario de partido, el adaptador puede verificar si una afirmación numérica (por ejemplo, un ritmo de persecución requerido) es correcta.
- Investigación en RLVR: sirve como caso reproducible de entrenamiento con recompensas verificables sobre un modelo de 27B, con hiperparámetros e infraestructura documentados (32 GPUs, 100 pasos, recompensa con penalización de longitud).
- Destilación de razonamiento eficiente: el par (modelo base, adaptador) permite estudiar cómo el RL con recompensa verificable comprime trazas de razonamiento sin degradar precisión, útil para diseñar políticas de longitud en otros dominios numéricos.
- Filtrado y anotación de datasets de razonamiento: el adaptador puede usarse para generar respuestas cortas y verificables que sirvan como etiquetas o como datos de entrenamiento para modelos menores.
- Demostración educativa de PEFT: ejemplo de adaptador LoRA de 0,9 GB que se puede cargar con `peft` sobre el modelo base sin reentrenar.

## Benchmarks y rendimiento

Datos reportados por el autor sobre 600 preguntas retenidas, 4 muestras por pregunta (temperatura 1,0, top-p 0,95, top-k 20, hasta 4096 tokens nuevos). "Antes" es el modelo base; "después" es el modelo base con el adaptador fusionado.

| Tipo de pregunta | Precisión antes | Precisión después | Tokens medios antes | Tokens medios después | Truncados antes | Truncados después |
|---|---|---|---|---|---|---|
| Global | 97,00 % | 99,17 % | 734 | 109 | 0,83 % | 0,00 % |
| Run rate | 98,75 % | 99,75 % | 394 | 86 | 0,12 % | 0,00 % |
| Chase rate | 93,62 % | 97,75 % | 950 | 157 | 1,00 % | 0,00 % |
| Milestone | 98,62 % | 100,00 % | 858 | 83 | 1,38 % | 0,00 % |

Durante el entrenamiento (rollouts sobre preguntas de entrenamiento, media de los primeros y últimos 10 pasos): precisión del 91,4 % al 99,9 % y tokens medios de 330 a 100. El benchmark cubre tres de los seis tipos de pregunta del dataset; no se publican resultados para los otros tres ni comparaciones con modelos alternativos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,9 GB en disco; el modelo base Qwen/Qwen3.8-27B debe cargarse aparte y no se detalla su huella de VRAM.
- El ejemplo de la tarjeta usa `dtype=torch.bfloat16` y `device_map="auto"`, lo que implica que el modelo base en bf16 requiere memoria proporcional a sus 27B de parámetros (estimación orientativa: del orden de 54 GB solo en pesos, sin contar caché KV ni activaciones; no confirmado por el autor).
- GPUs recomendadas: el entrenamiento se realizó en 32 GPUs NVIDIA Vera Rubin; para inferencia no se especifican modelos concretos. No hay datos sobre si cabe en GPUs de consumo (RTX 4090, 24 GB) en cuantizaciones bajas.
- Opciones de despliegue: la tarjeta solo documenta `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA sobre un modelo multimodal, el soporte en esos motores no está garantizado.
- Latencia y throughput: no disponibles. La reducción de tokens medios (734 a 109) sugiere una mejora sustancial del coste de decodificación, pero no se aportan medidas de latencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico de dominio (críquet T20) y de método (RLVR sobre Qwen3.8-27B), y el autor no incluye comparaciones con otras variantes ni con el modelo base en configuraciones alternativas. Los únicos datos comparativos son los de "antes y después" frente al propio modelo base, recogidos en la sección de benchmarks.

| Modelo | Parámetros | Contexto | Precisión (benchmark propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B (según nombre) | No disponible | 97,00 % global | No disponible | Hugging Face |
| Qwen3.8-27B + este LoRA | 27B + adaptador | No disponible | 99,17 % global | No disponible | Hugging Face |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador está entrenado solo para preguntas numéricas de críquet T20 y puede degradar el rendimiento general del modelo base en otras tareas si se usa fusionado sin evaluación.
- El benchmark reportado cubre únicamente tres de los seis tipos de pregunta del dataset; no hay evidencia publicada para el resto.
- No se especifica la licencia del adaptador ni la del modelo base en la información disponible, lo que impide confirmar el uso comercial.
- El modelo base es multimodal, pero el adaptador se entrena solo con texto; no se documenta comportamiento con entradas de imagen.
- Riesgo de alucinación inherente a los modelos generativos: aunque el RLVR premia respuestas exactas, no hay garantía de verificación fuera del conjunto de evaluación.
- Sin datos sobre sesgos, idiomas soportados ni robustez ante preguntas fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente (13 de noviembre de 2026); no hay validación independiente de los resultados.
- La recompensa penaliza la longitud, lo que puede favorecer respuestas excesivamente cortas en escenarios donde se requiera justificación detallada.
- El entrenamiento se realizó en 32 GPUs NVIDIA Vera Rubin, hardware no accesible para la mayoría de desarrolladores; la reproducibilidad completa no está al alcance de un usuario individual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Balab2021/Qwen3.8-27B-Cricket-Reasoning-RLVR
- Dataset de entrenamiento: https://huggingface.co/datasets/Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
