# dvader13/smollm3-3b-rlfinal-378b

## Resumen

El modelo `dvader13/smollm3-3b-rlfinal-378b` es un checkpoint de entrenamiento de refuerzo (RL) basado en el modelo base SmolLM3-3B de HuggingFace, correspondiente al final de la primera época de un proceso de RL. El autor, dvader13, lo publica como un estado completo de entrenamiento (fp32 weights + optimizer + scheduler + RNG) en el paso 1804, con el objetivo de permitir la reanudación del entrenamiento o el análisis de la dinámica de RL. No es un export de inferencia, por lo que no está pensado para su uso directo en producción.

El modelo base SmolLM3-3B es un transformer decoder compacto de 3 mil millones de parámetros, entrenado con 11 billones de tokens, que emplea Grouped Query Attention (GQA) y prescinde de RoPE para mejorar el rendimiento en tareas de contexto largo. Este checkpoint concreto se ha entrenado sobre un subconjunto de 378 mil millones de tokens (pretraining rung), y su relevancia radica en que permite estudiar el efecto del RL sobre un modelo pequeño y abierto, así como continuar el entrenamiento desde un punto intermedio.

Dado que se trata de un artefacto de investigación, su utilidad principal es académica o de desarrollo, no de despliegue. La licencia Apache 2.0 facilita su uso y modificación, pero hay que tener en cuenta que el repositorio ocupa 36.9 GB debido al estado completo del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA), sin RoPE |
| Parametros totales | 3 mil millones (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero no se especifica el numero exacto) |
| Tipos de cuantizacion | no disponible (el checkpoint esta en fp32, no es un export de inferencia) |
| Idiomas soportados | no disponible (hereda los idiomas del modelo base, que segun documentacion soporta 6 idiomas, pero no se detallan) |
| Licencia | Apache 2.0 |
| Formato de pesos | Estado de entrenamiento completo (fp32 weights + optimizer + scheduler + RNG), no safetensors |

## Arquitectura y entrenamiento

El checkpoint se basa en la arquitectura SmolLM3-3B, un transformer decoder con Grouped Query Attention (GQA) para reducir el tamaño de la cache KV y sin Rotary Positional Embeddings (RoPE), lo que mejora el rendimiento en tareas de contexto largo. El modelo base fue preentrenado con 11 billones de tokens, pero este checkpoint concreto corresponde a una fase de RL sobre un subconjunto de 378 mil millones de tokens (pretraining rung). El autor indica que es el final de la primera época de RL, en el paso 1804, y que el checkpoint incluye el estado completo del optimizador, el scheduler y el generador de numeros aleatorios, lo que permite reanudar el entrenamiento de forma exacta.

No se proporcionan detalles sobre el algoritmo de RL utilizado (PPO, GRPO, etc.), ni sobre la funcion de recompensa o el dataset de preferencias. Tampoco se especifica si se aplicaron tecnicas como DPO o RLHF. La informacion disponible se limita a la descripcion del checkpoint y a los datos del modelo base.

## Capacidades

- Al ser un checkpoint de entrenamiento, no es directamente utilizable para inferencia. No se puede cargar con `transformers` para generar texto sin antes extraer los pesos y convertirlos a un formato de inferencia.
- El modelo base SmolLM3-3B, sobre el que se construye este checkpoint, es capaz de generacion de texto, razonamiento, codigo, matematicas y soporte multilingue (6 idiomas).
- El modelo base tambien soporta modo de razonamiento dual (dual mode reasoning) y tool calling, segun la documentacion de HuggingFace.
- No se dispone de informacion sobre capacidades especificas de este checkpoint de RL, como mejoras en razonamiento o seguimiento de instrucciones, ya que no se han publicado evaluaciones.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: este checkpoint permite estudiar el efecto del RL sobre un modelo de 3B, analizando la evolucion de los pesos, el optimizador y las metricas de recompensa a lo largo del entrenamiento.
- Continuacion del entrenamiento: al incluir el estado completo del optimizador y el scheduler, se puede reanudar el entrenamiento desde el paso 1804 sin perdida de informacion, lo que es util para experimentos de RL con diferentes hiperparametros.
- Analisis de dinamicas de RL: los investigadores pueden inspeccionar los gradientes, las actualizaciones de pesos y el comportamiento del optimizador para comprender como el RL modifica un modelo preentrenado.
- Desarrollo de tecnicas de RL eficientes: al ser un modelo pequeno, es adecuado para probar algoritmos de RL en un entorno de bajo coste computacional antes de escalar a modelos mayores.
- Benchmarking de metodos de RL: se puede comparar este checkpoint con otros checkpoints de RL del mismo modelo base para evaluar la efectividad de distintas estrategias de entrenamiento.
- Educacion y formacion: sirve como ejemplo practico de como se estructura un checkpoint de RL completo, incluyendo el estado del optimizador, para estudiantes y desarrolladores que quieran aprender sobre el ciclo de vida de un modelo entrenado con RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint especifico. El modelo base SmolLM3-3B, segun la documentacion de HuggingFace, supera a Llama 3.2 3B y Qwen2.5 3B, y es competitivo con modelos de 4B como Qwen3 y Gemma3, pero estos datos corresponden al modelo base, no a este checkpoint de RL. No se dispone de metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para el checkpoint `rlfinal-378b`.

## Requisitos de hardware

- Para continuar el entrenamiento desde este checkpoint se necesita una GPU con al menos 40 GB de VRAM, dado que el estado completo (pesos fp32 + optimizador + scheduler) ocupa 36.9 GB en disco y en memoria durante el entrenamiento.
- Se recomienda una GPU de la serie A100 (40 GB o 80 GB) o H100 (80 GB) para manejar el estado del optimizador sin problemas de memoria.
- No es posible usar este checkpoint directamente para inferencia en GPUs de consumo (como RTX 4090) sin antes extraer los pesos y convertirlos a un formato cuantizado, ya que el checkpoint no es un export de inferencia.
- Para inferencia con el modelo base SmolLM3-3B, se puede usar vLLM, llama.cpp, Ollama o TGI, pero este checkpoint no es compatible con esas herramientas tal cual.
- La latencia y el throughput no estan disponibles para este checkpoint, ya que no es un modelo de inferencia.

## Comparativa con modelos similares

Dado que este checkpoint es un artefacto de entrenamiento, la comparativa se realiza con el modelo base y con otros modelos de tamano similar, pero teniendo en cuenta que no es directamente comparable en terminos de rendimiento de inferencia.

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | largo (no especificado) | Apache 2.0 | safetensors | Inferencia |
| dvader13/smollm3-3b-rlfinal-378b | 3B | no disponible | Apache 2.0 | Estado de entrenamiento | Investigacion en RL |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 | safetensors | Inferencia |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | safetensors | Inferencia |

El checkpoint de RL no es comparable directamente con los modelos de inferencia, ya que su proposito es diferente. El modelo base SmolLM3-3B, segun la documentacion, supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks, pero esos datos no se aplican a este checkpoint.

## Limitaciones y advertencias

- Este checkpoint no es un modelo de inferencia. Intentar cargarlo con `transformers` o usarlo en un pipeline de produccion fallara, ya que contiene el estado completo del optimizador y no los pesos en formato safetensors.
- No se han publicado evaluaciones de sesgos, alucinaciones o calidad de generacion para este checkpoint. Los riesgos del modelo base (sesgos, alucinaciones) se heredan, pero no se ha verificado su comportamiento tras el RL.
- El repositorio ocupa 36.9 GB, lo que puede ser un problema de almacenamiento y transferencia. No se proporcionan versiones cuantizadas ni exportes de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de entrenamiento, su uso en produccion no es practico sin un proceso de conversion previo.
- No se especifican los idiomas soportados ni la longitud de contexto exacta, lo que limita la evaluacion de su aplicabilidad en tareas multilingues o de contexto largo.
- El autor no proporciona informacion sobre el algoritmo de RL utilizado, el dataset de recompensas ni los hiperparametros, lo que dificulta la reproducibilidad de los resultados.

## Enlaces

- [HuggingFace - dvader13/smollm3-3b-rlfinal-378b](https://huggingface.co/dvader13/smollm3-3b-rlfinal-378b)
- [HuggingFace - SmolLM3-3B (modelo base)](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Documentacion de Transformers - SmolLM3](https://huggingface.co/docs/transformers/en/model_doc/smollm3)
- [GitHub - huggingface/smollm](https://github.com/huggingface/smollm)
- [GitHub - ArkS0001/SmolLM3-3B](https://github.com/ArkS0001/SmolLM3-3B)
- [BenchLM - LLM Leaderboard](https://benchlm.ai/)
