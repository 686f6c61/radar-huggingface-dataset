# jfcrown7/connectailab-rl-eskim-v1

## Resumen

connectailab-rl-eskim-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor jfcrown7 en el marco de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un modelo de toma de decisiones: recibe un estado de situacion, una pregunta y un conjunto de opciones etiquetadas (A, B, C...), y devuelve unicamente la letra de la opcion elegida. El dominio de aplicacion es la gestion de una empresa simulada dentro del entorno CONNECT TYCOON.

El interes tecnico del modelo reside en su pipeline de entrenamiento, no en su tamano. El autor parte de un modelo base de 0,8 mil millones de parametros y aplica un proceso en cuatro fases: primero entrena una politica pequena con PPO en el simulador (que actua como profesor), despues genera un conjunto de problemas evaluando cada opcion mediante rollouts, luego aplica aprendizaje supervisado sobre las opciones con mejor puntuacion y finalmente refina con GRPO (Group Relative Policy Optimization) usando normalizacion por grupo y una penalizacion KL contra el modelo de partida.

Es relevante como ejemplo reproducible de como convertir un LLM pequeno en un agente de decision mediante RL en un entorno simulado, con un notebook de Colab publicado para replicar el entrenamiento. El modelo esta pensado para investigacion y docencia, no para produccion real, y el propio autor advierte que debe revalidarse con datos reales antes de usarse en decisiones empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el adaptador puede combinarse con cuantizaciones del modelo base, pero no se documenta ninguna) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador se carga con `PeftModel.from_pretrained` sobre el modelo base y se usa con `transformers`. La tarea es de clasificacion restringida: el modelo debe emitir exactamente una letra entre las opciones presentadas, sin explicacion.

El entrenamiento sigue cuatro etapas documentadas por el autor. En la primera, una politica pequena se entrena con PPO durante miles de meses simulados en CONNECT TYCOON y actua como profesor. En la segunda, para cada decision del profesor se generan variantes cambiando la opcion elegida y se ejecuta el mes completo del simulador para puntuar cada alternativa. En la tercera se aplica aprendizaje supervisado sobre la opcion con mayor puntuacion. En la cuarta se aplica GRPO: se agrupan las opciones de una misma decision, se normalizan las ventajas dentro del grupo y se incrementa la probabilidad de las opciones con puntuacion superior a la media, con una penalizacion KL contra el modelo de partida. El conjunto de datos contiene 4.082 problemas de entrenamiento, 832 de validacion y 840 de prueba, sobre una distribucion de empresas de tipo `general` ajustada con datos publicos.

## Capacidades

- Toma de decisiones de eleccion unica: dado un estado, una pregunta y una lista de opciones etiquetadas, devuelve la letra de la opcion seleccionada.
- Salida restringida: el modelo esta entrenado para responder solo con la letra, sin texto adicional ni explicacion.
- Interpretacion de estado estructurado en JSON con campos `state`, `question` y `options`.
- Robusteza frente a inyeccion de instrucciones dentro del campo `state`: el prompt de sistema indica explicitamente tratar el texto del estado como datos y no como instrucciones.
- Estimacion de confianza implicita: segun el autor, la probabilidad asignada a cada letra puede interpretarse como probabilidad por opcion y el valor maximo como confianza en la eleccion.
- Dominio especifico de gestion empresarial simulada: decisiones de negocio dentro del simulador CONNECT TYCOON.
- No se documentan capacidades de generacion libre, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Investigacion en RL para toma de decisiones: el modelo sirve como referencia reproducible de un pipeline PPO, aprendizaje supervisado y GRPO sobre un LLM pequeno, con notebook de Colab para replicar el entrenamiento.
- Docencia de reinforcement learning: el ejemplo permite ilustrar como se genera un conjunto de problemas mediante rollouts del simulador y como se aplica normalizacion por grupo con penalizacion KL.
- Agente de decision en simuladores economicos: puede integrarse como politica de decision dentro de entornos tipo Gymnasium que expongan estados, preguntas y opciones etiquetadas.
- Evaluacion de tecnicas de RLHF/GRPO en modelos pequenos: permite comparar aprendizaje supervisado frente a refinamiento con GRPO sobre el mismo conjunto de problemas (77,6 % frente a 76,4 % de acierto en el conjunto de prueba).
- Prototipado de asistentes de decision acotados: en escenarios donde la respuesta deba ser una opcion cerrada y no texto libre, el formato de salida de una sola letra simplifica el parseo y reduce errores de formato.
- Estudio de robustez ante inyeccion de prompt: el diseno con instruccion de sistema explicita permite analizar el comportamiento del modelo cuando el estado contiene texto que intenta alterar la decision.
- Base para adaptaciones a otros dominios de decision: el mismo esquema (estado, pregunta, opciones) puede reutilizarse con datos de otro simulador o de un proceso de negocio real, reentrenando el adaptador LoRA.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre el conjunto de prueba del simulador:

| Modelo | Acierto en el conjunto de prueba | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen sin entrenar | 30,4 % | 2,67 | no disponible | no disponible |
| Aprendizaje supervisado | 77,6 % | 1,90 | no disponible | no disponible |
| Refinado con GRPO (modelo publicado) | 76,4 % | 1,92 | 11,02 millones de wones | 71 % (145/177) |

El autor senala que la evaluacion de gestion empresarial corresponde a la media de dos meses no vistos, con muestra pequena, y que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 0,8 mil millones de parametros mas un adaptador LoRA, la inferencia en precision completa requiere del orden de 2 GB de VRAM; en cuantizacion de 8 bits o 4 bits del modelo base baja por debajo de 1 GB, aunque el autor no documenta cuantizaciones probadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente en la practica; una RTX 3060, RTX 4060 o superior permite ejecutar el modelo base y el adaptador sin problemas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna, dado el tamano del modelo base.
- Opciones de despliegue: carga mediante `transformers` y `peft` tal como documenta el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este adaptador; seria necesario fusionar el adaptador con el modelo base y convertirlo a los formatos correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores de decision entrenados con RL sobre simuladores empresariales). La comparacion mas directa disponible es con las variantes del propio pipeline de entrenamiento, recogidas en la tabla de benchmarks:

| Modelo | Parametros | Contexto | Acierto en prueba | Licencia |
|---|---|---|---|---|
| connectailab-rl-eskim-v1 | 0,8 B (base) + LoRA | no disponible | 76,4 % | Apache 2.0 |
| Qwen3.5-0.8B sin entrenar | 0,8 B | no disponible | 30,4 % | Apache 2.0 |
| Variante con aprendizaje supervisado | 0,8 B (base) + LoRA | no disponible | 77,6 % | Apache 2.0 |

## Limitaciones y advertencias

- Modelo de investigacion y docencia: el autor advierte explicitamente que es un modelo sobre un simulador sintetico y que debe revalidarse con los registros reales de cada empresa antes de usarse en decisiones de gestion.
- Rendimiento inferior a la politica profesora: el propio autor indica que el modelo esta por debajo de la politica PPO del simulador que genero los datos.
- Muestra de evaluacion pequena: la evaluacion de gestion empresarial se basa en la media de dos meses no vistos, lo que limita la significacion estadistica de los resultados.
- Rendimiento ligeramente inferior con GRPO que con aprendizaje supervisado en acierto (76,4 % frente a 77,6 %), aunque con arrepentimiento similar.
- Idioma: el modelo esta entrenado para coreano; no se documenta soporte de castellano ni de otros idiomas.
- Salida restringida: no genera explicaciones ni justificaciones; solo devuelve una letra, lo que limita su uso fuera de tareas de eleccion cerrada.
- Riesgo de alucinacion: no documentado por el autor; al tratarse de una tarea de clasificacion restringida, el riesgo se manifiesta como eleccion de una opcion incorrecta mas que como texto inventado.
- Sesgos: no documentados; el conjunto de entrenamiento se genera con una distribucion de empresa `general` ajustada con datos publicos, lo que puede introducir sesgos de ese dominio.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia, que debe verificarse por separado.
- Repositorio de 0,0 GB: el adaptador es muy pequeno, pero requiere descargar el modelo base completo para funcionar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jfcrown7/connectailab-rl-eskim-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para replicar el entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
