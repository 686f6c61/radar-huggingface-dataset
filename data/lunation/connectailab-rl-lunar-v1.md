# Lunation/connectailab-rl-lunar-v1

## Resumen

connectailab-rl-lunar-v1 es un adaptador LoRA de tipo PEFT publicado por Lunation sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de propósito general: es un modelo de decisión entrenado específicamente para leer un estado de empresa simulado, una pregunta y una lista de opciones, y devolver exactamente una letra de opción (A, B, C...) sin explicación. La probabilidad asignada a cada letra funciona como puntuación de preferencia y la letra con mayor probabilidad representa la decisión elegida.

El entrenamiento se realizó en dos fases sobre datos generados en el simulador CONNECT TYCOON: primero aprendizaje supervisado (SFT) a partir de las decisiones de mayor puntuación de un profesor entrenado con PPO en el propio simulador, y después aprendizaje por refuerzo con GRPO, agrupando todas las opciones de una misma decisión y aumentando la probabilidad de aquellas cuya puntuación en el simulador supera la media del grupo, con una penalización KL respecto al modelo de partida. El conjunto de datos de decisión incluye 4082 problemas de entrenamiento, 832 de validación y 840 de prueba.

Su relevancia es acotada pero clara: sirve como referencia reproducible de cómo pasar de un agente RL en un entorno Gymnasium a un modelo de lenguaje capaz de imitar esa política, y como banco de pruebas de técnicas de RL sobre modelos pequeños. Está etiquetado como investigación y educación, no como herramienta de decisión empresarial real, y su único idioma declarado es el coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Qwen/Qwen3.5-0.8B, con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA sobre un modelo base de 0,8B de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-0.8B, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el repositorio contiene solo pesos del adaptador; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA), libreria `peft` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, por lo que la arquitectura subyacente es la del transformer decoder-only del modelo base, sin modificaciones estructurales. La innovación no está en la arquitectura sino en el procedimiento de entrenamiento. Primero se entrenó una política pequeña con PPO directamente en el simulador CONNECT TYCOON, que opera la empresa durante miles de meses simulados y actúa como profesor. Con esa política se construyó un corpus de problemas: por cada mes simulado se alteraba la opción elegida y se volvía a ejecutar el mes hasta el final para puntuar cada alternativa por separado. Sobre ese corpus se aplicó aprendizaje supervisado, enseñando al modelo a elegir la opción con mejor puntuación.

La segunda fase usó GRPO (Group Relative Policy Optimization): las opciones de una misma decisión se tratan como un grupo, se normalizan las ventajas dentro del grupo y se incrementa la probabilidad de las opciones cuya puntuación en el simulador está por encima de la media, con una penalización KL contra el modelo de partida para evitar el colapso de la distribución. La distribución de empresas usada en el entrenamiento es la variante `general`, ajustada con datos públicos. El formato de interacción es estricto: un mensaje de sistema con la instrucción de evaluar la tarea y devolver solo la letra, y un mensaje de usuario con un JSON que contiene `state`, `question` y `options`.

## Capacidades

- Selección de una única opción entre una lista etiquetada, devolviendo solo la letra, sin texto adicional ni explicación.
- Interpretación de un estado textual de empresa simulado junto con una pregunta de decisión y sus alternativas.
- Extracción de una distribución implícita de preferencia sobre las opciones a partir de las probabilidades del token de cada letra (la letra más probable actúa como nivel de confianza).
- Resistencia parcial a instrucciones inyectadas en el campo `state`: la instrucción de sistema indica explícitamente tratar el texto del estado como datos y no como instrucciones.
- Razonamiento de decisión de un solo paso, no multi-paso: el modelo no planifica cadenas de acciones, elige una opción por turno.
- Un único idioma de trabajo declarado: coreano.
- Sin soporte declarado de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en RL sobre modelos de lenguaje: sirve como caso de estudio completo de la tubería PPO (profesor) → SFT → GRPO sobre un modelo de 0,8B, con código de entrenamiento reproducible en un notebook de Colab.
- Evaluación comparativa de algoritmos de RL: la tabla del autor (31,8% del modelo base, 80,1% tras SFT, 82,1% tras RL) permite medir la ganancia marginal de GRPO frente a SFT en una tarea de decisión discreta y acotada.
- Generación de datos de preferencia sobre decisiones: las probabilidades sobre cada letra pueden usarse como etiquetas de preferencia para entrenar modelos de recompensa o para filtrar trayectorias en un simulador propio.
- Simulación educativa de dirección de empresa: en cursos de RL o de agentes, el modelo permite ilustrar cómo una política aprendida en un entorno Gymnasium se destila en un modelo de lenguaje que responde en formato JSON con una sola letra.
- Prototipado de agentes de decisión en juegos o entornos de gestión: el mismo formato de entrada (`state`, `question`, `options`) es reutilizable para NPCs o para políticas de gestión de recursos, siempre que se reentrene con datos del dominio objetivo.
- Banco de pruebas de robustez de prompts: el esquema de instrucción de sistema con defensa frente a inyección en el campo de estado es útil para probar cómo se comporta un modelo pequeño ante instrucciones maliciosas embebidas en datos.
- Verificación de pipelines de inferencia con PEFT: al ser un adaptador pequeño, es práctico para validar integraciones de `transformers` + `peft` antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. La métrica "tasa de acierto" se calcula sobre los problemas de decisión, "arrepentimiento" (regret) es una medida de coste de la decisión en la que menos es mejor.

| Modelo | Tasa de acierto en el examen | Arrepentimiento | Beneficio mensual en el simulador | Transacciones reales con tarjeta, reduccion de perdidas |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 31,8% | 2,69 | No disponible | No disponible |
| Aprendizaje supervisado (SFT) | 80,1% | 1,91 | No disponible | No disponible |
| Aprendizaje por refuerzo (GRPO) | 82,1% | 1,89 | 9,88 millones de wones | 71% (150/177) |

El propio autor advierte de que se trata de un primer experimento: la evaluación de la operación de empresa se hace sobre una media de dos meses nunca vistos, con una muestra pequeña, y el modelo sigue por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo base de 0,8B, el coste de memoria lo domina el modelo base, no el adaptador. Estimacion orientativa, no confirmada por el autor: en FP16 el modelo base ocupa del orden de 1,6 GB de pesos; en cuantizacion de 8 bits, alrededor de 0,8-1 GB; en 4 bits, alrededor de 0,5-0,6 GB. Hay que sumar el coste de activaciones y cache KV segun la longitud de contexto efectiva y el tamano de lote.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y equivalentes, incluso en FP16 y con lotes moderados.
- Tambien es viable en CPU para inferencia puntual, dado el tamano del modelo base, aunque con latencia mucho mayor.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenar el adaptador a gran escala o para servir muchas replicas concurrentes.
- Despliegue: la via documentada por el autor es `transformers` + `peft` (cargar el modelo base con `AutoModelForCausalLM` y envolverlo con `PeftModel.from_pretrained`). No se publican pesos GGUF ni recetas oficiales para vLLM, TGI, llama.cpp u Ollama; usarlos requeriria fusionar el adaptador en el modelo base y convertir los pesos, un proceso no documentado en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en decision (datos aportados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lunar-v1 | Adaptador LoRA sobre base de 0,8B | No disponible | 82,1% de acierto, regret 1,89 | Apache 2.0 | HuggingFace, solo adaptador |
| Qwen/Qwen3.5-0.8B (modelo base sin ajustar) | 0,8B | No disponible | 31,8% de acierto, regret 2,69 | No disponible en la informacion proporcionada | HuggingFace |
| Politica profesora PPO del simulador | No disponible (modelo pequeno) | No aplica | Superior al adaptador segun el autor, valor numerico no publicado | No disponible | No disponible |
| Otros modelos de decision empresarial comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion proporcionada otros adaptadores de decision con GRPO sobre simuladores de gestion directamente comparables.

## Limitaciones y advertencias

- Modelo de investigacion y educacion, segun declaracion explicita del autor. No debe usarse para decisiones de gestion reales sin revalidarlo antes con los datos historicos de la empresa concreta.
- La evaluacion de la operacion de empresa se hizo sobre una media de dos meses no vistos: muestra muy pequena, sin intervalos de confianza ni analisis de significancia estadistica.
- El rendimiento sigue por debajo de la politica profesora entrenada con PPO en el simulador, segun el propio autor.
- Idioma unico declarado: coreano. El comportamiento en castellano o en otros idiomas no esta documentado.
- El modelo esta entrenado para un formato de entrada muy concreto (JSON con `state`, `question` y `options`, salida de una sola letra). Fuera de ese esquema su utilidad es dudosa.
- Riesgo de alucinacion en el sentido de seleccionar letras no presentes en la lista de opciones o de incumplir el formato de salida; la model card no documenta tasas de fallo de formato.
- No hay informacion publicada sobre sesgos: la distribucion de empresas usada es la variante `general`, ajustada con datos publicos, pero no se detalla su composicion ni que sesgos podria heredar.
- Licencia Apache 2.0, que permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B tiene sus propias condiciones, no verificadas en la informacion disponible.
- El repositorio aparece con 0 descargas y 0 likes y un tamano de 0,0 GB, lo que sugiere que el artefacto puede no estar completamente subido o que la publicacion es muy reciente; conviene verificar que los pesos del adaptador estan realmente disponibles antes de integrarlo.
- Capacidades de agente, tool calling, vision, audio y modo de pensamiento: no soportadas de forma declarada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lunation/connectailab-rl-lunar-v1
- Repositorio CONNECT TYCOON en GitHub: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento RL: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen de portada del modelo: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
