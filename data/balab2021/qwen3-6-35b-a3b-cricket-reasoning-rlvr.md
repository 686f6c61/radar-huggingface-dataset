# Balab2021/Qwen3.6-35B-A3B-Cricket-Reasoning-RLVR

## Resumen

Qwen3.6-35B-A3B-Cricket-Reasoning-RLVR es un adaptador LoRA publicado por el usuario Balab2021 sobre el modelo base Qwen/Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) con 35 mil millones de parametros totales y aproximadamente 3 mil millones de parametros activos por token. El adaptador no se entrena con destilacion de trazas de razonamiento, sino mediante aprendizaje por refuerzo con recompensas verificables (RLVR): el propio modelo genera sus respuestas en modo thinking y solo recibe recompensa cuando el numero final coincide exactamente con la respuesta correcta. El dominio de especializacion es el analisis de estadisticas de cricket en formato T20 (run rate, chase rate y hitos de carrera).

El objetivo del adaptador es doble: aumentar la precision en calculos numericos sobre cricket y, sobre todo, reducir drasticamente la longitud de las cadenas de razonamiento. Segun la model card, la precision global pasa del 93,62% al 98,96% en un benchmark retenido de 600 preguntas, mientras que la media de tokens generados cae de 2177 a 151 y la tasa de respuestas truncadas por limite de contexto baja del 3,25% al 0,00%. Es relevante para quienes trabajan con RL aplicado a modelos de razonamiento y para desarrolladores que necesitan un modelo especializado de bajo coste de inferencia en un dominio numerico concreto.

El repositorio es muy ligero (0,2 GB) porque contiene unicamente los pesos del adaptador LoRA, no el modelo completo. La licencia y los idiomas soportados no estan declarados en la informacion disponible, y el modelo cuenta con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de investigacion reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Qwen3.6-35B-A3B); adaptador LoRA sobre atencion, Gated-DeltaNet y proyecciones MLP |
| Parametros totales | 35B (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | ~3B (modelo base MoE) |
| Longitud de contexto | no disponible (el entrenamiento limita la generacion a 4096 tokens nuevos) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite las cuantizaciones habituales de la familia Qwen (no confirmado en la informacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Dataset de entrenamiento | Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.6-35B-A3B, un modelo MoE con 35B parametros totales y unos 3B activos. Segun la model card, los modulos adaptados son las proyecciones de atencion, las capas Gated-DeltaNet (una variante de attention lineal) y las proyecciones MLP; en el caso del MoE, solo se entrena el MLP del experto compartido, mientras que los expertos enrutados permanecen congelados. El LoRA usa rango 32 y alpha 64.

El entrenamiento es RLVR puro sin trazas de razonamiento como objetivo. En cada paso, la politica actual responde en modo thinking con 8 muestras por pregunta, muestreo plano a temperatura 1 y un maximo de 4096 tokens nuevos. La recompensa es 1 - 0,4 x (tokens / 4096) si la respuesta termina y es correcta, y 0 si es incorrecta, no responde o se trunca; es decir, se penaliza explicitamente la verbosidad. La ventaja se calcula como la recompensa menos la media de recompensas de las muestras de esa misma pregunta, y la perdida es ventaja por la log-verosimilitud negativa media de los tokens de la respuesta muestreada (policy gradient con baseline de grupo, una actualizacion por lote de rollouts frescos). Se realizaron 60 pasos con 61.440 rollouts en total, 32 GPUs, learning rate 1e-4 y un tiempo de entrenamiento de 2,6 horas en GPUs NVIDIA Vera Rubin.

## Capacidades

- Generacion de texto y razonamiento en modo thinking sobre el modelo base Qwen3.6-35B-A3B.
- Razonamiento numerico especializado en estadisticas de cricket T20: calculo de run rate, chase rate e hitos de carrera.
- Reduccion agresiva de la longitud de razonamiento: el adaptador aprende a llegar a la respuesta con muchas menos tokens que el modelo base.
- Capacidades heredadas del modelo base (no verificadas en la informacion disponible): soporte multilingue, generacion de codigo y matematicas generales.
- El ejemplo de uso de la model card emplea `AutoModelForImageTextToText`, lo que sugiere que el modelo base podria tener capacidad de vision, aunque no se detalla en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.

## Casos de uso

- Analisis de estadisticas de cricket en retransmisiones o paneles en vivo: el adaptador calcula run rate y chase rate a partir de marcadores y overs con una precision del 99,88% y 99,12% respectivamente en el benchmark retenido, y con una media de 139-189 tokens por respuesta, lo que permite respuestas casi instantaneas.
- Motor de respuestas para chatbots de fantasia deportiva: preguntas de usuarios sobre hitos y ritmos de anotacion se resuelven con cadenas de razonamiento cortas, reduciendo coste por consulta frente al modelo base (151 tokens medios frente a 2177).
- Generacion de resumenes numericos post-partido: dado un conjunto de eventos, el modelo produce cifras derivadas (ritmos, proyecciones de puntuacion) con baja tasa de truncamiento (0,00% tras el entrenamiento), lo que es critico en pipelines automatizados.
- Evaluacion de sistemas RLVR en dominios verificables: el adaptador sirve como referencia reproducible de como el RL con recompensa basada en exactitud y penalizacion de longitud puede comprimir cadenas de razonamiento manteniendo o mejorando la precision.
- Investigacion sobre eficiencia de inferencia: al reducir la media de tokens de 2177 a 151, el adaptador es un caso de estudio para medir el ahorro en coste de GPU y latencia en despliegues de modelos MoE.
- Prototipado de asistentes especializados de bajo presupuesto: al ser un adaptador LoRA de 0,2 GB sobre un modelo base de 35B, permite cambiar de dominio (por ejemplo, a otros deportes o dominios numericos) reentrenando solo el adaptador con el mismo esquema RLVR.

## Benchmarks y rendimiento

Resultados en un benchmark retenido de 600 preguntas, 4 muestras por pregunta (temperatura 1,0, top-p 0,95, top-k 20, hasta 4096 tokens nuevos). "Antes" es el modelo base; "despues" es el modelo base con el adaptador fusionado.

| Tipo de pregunta | Precision antes | Precision despues | Tokens medios antes | Tokens medios despues | Truncados antes | Truncados despues |
|---|---|---|---|---|---|---|
| Global | 93,62% | 98,96% | 2177 | 151 | 3,25% | 0,00% |
| Run rate | 99,00% | 99,88% | 1855 | 139 | 0,38% | 0,00% |
| Chase rate | 82,88% | 99,12% | 2619 | 189 | 9,00% | 0,00% |
| Hito (milestone) | 99,00% | 97,88% | 2058 | 124 | 0,38% | 0,00% |

Durante el entrenamiento (rollouts sobre preguntas de entrenamiento, media de los primeros y ultimos 10 pasos): precision del 96,9% al 99,9%; tokens medios de 1585 a 160. El benchmark cubre tres de los seis tipos de pregunta del dataset. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3.6-35B-A3B completo para inferencia.
- VRAM estimada para el modelo base: no disponible de forma oficial; en bfloat16, un modelo de 35B parametros requiere del orden de 70 GB solo para pesos, mas memoria para KV cache y activaciones.
- GPU recomendadas: el entrenamiento se realizo en 32 GPUs NVIDIA Vera Rubin; para inferencia se necesitan GPUs de clase数据中心 (A100 80 GB, H100 80 GB o similares) si se carga en bfloat16.
- Cabe en GPU de consumo: no disponible en la informacion; con cuantizacion agresiva (por ejemplo, 4 bits) un modelo de 35B podria aproximarse a los 20 GB, pero no se confirma compatibilidad con el adaptador.
- Opciones de despliegue: la model card usa `transformers` + `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la reduccion de tokens medios (de 2177 a 151) sugiere una mejora sustancial en latencia por consulta, pero no se aportan medidas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de la misma categoria (adaptadores LoRA de razonamiento especializado sobre modelos MoE).

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador esta entrenado solo con preguntas de cricket T20 y el benchmark cubre tres de los seis tipos de pregunta del dataset; el rendimiento fuera de ese dominio no esta evaluado.
- Ligera perdida de precision en preguntas de tipo hito (99,00% a 97,88%), lo que muestra que la mejora global no es uniforme por categoria.
- Licencia no declarada: no se puede confirmar el uso comercial del adaptador ni del modelo base; es imprescindible verificar la licencia de Qwen3.6-35B-A3B antes de desplegar.
- Idiomas no declarados: no hay garantia de comportamiento multilingue especifico del adaptador.
- Riesgo de alucinacion numerica: aunque el RLVR con recompensa exacta reduce errores, el modelo sigue siendo generativo y puede producir cifras plausibles pero incorrectas fuera de la distribucion de entrenamiento.
- El repositorio tiene cero descargas y cero likes, sin validacion externa de la comunidad; los resultados provienen solo de la model card del autor.
- El proceso de entrenamiento congela los expertos enrutados del MoE, por lo que las mejoras se concentran en el experto compartido y en las capas adaptadas.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Balab2021/Qwen3.6-35B-A3B-Cricket-Reasoning-RLVR
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full
