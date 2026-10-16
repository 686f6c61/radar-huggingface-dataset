# avoca8Hug/connectailab-rl-avoca-v1

## Resumen

connectailab-rl-avoca-v1 es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3.5-0.8B (aproximadamente 0,8 mil millones de parametros). Lo desarrolla el usuario avoca8Hug en el marco de la colaboracion CONNECT AI LAB, AI CITY BUILDERS y Studio Joorah. No es un modelo de proposito general: es un modelo de toma de decisiones que recibe una situacion, una pregunta y una lista de opciones, y devuelve como salida una unica letra correspondiente a la opcion elegida.

El problema que resuelve es la seleccion de decisiones dentro de un simulador de gestion empresarial denominado CONNECT TYCOON. El modelo se entrena con datos generados por ese simulador: una politica pequena aprende primero mediante PPO a operar una empresa sintetica; despues se construye un conjunto de problemas puntuando cada opcion segun el resultado del mes simulado; a continuacion se aplica aprendizaje supervisado siguiendo la mejor opcion; y finalmente se aplica aprendizaje por refuerzo con ventaja estandarizada por grupo y penalizacion KL respecto al modelo de partida, siguiendo el esquema GRPO.

Es relevante ahora como ejemplo de pipeline completo de RL aplicado a decision-making sobre un modelo pequeno y como material educativo y de investigacion. El propio autor advierte que los resultados son preliminares, con muestras pequenas, y que el modelo esta por debajo de la politica profesora del simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | 0,8B en el modelo base; parametros del adaptador LoRA no disponibles |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA PEFT que se monta sobre el modelo base Qwen/Qwen3.5-0.8B. La tarea es de clasificacion de decision: dada una tupla de estado, pregunta y conjunto de opciones etiquetadas, el modelo debe emitir exactamente una letra de opcion. Las probabilidades asociadas a cada letra se interpretan como probabilidad de eleccion de cada opcion, y el valor maximo como confianza.

El entrenamiento se realizo en cuatro fases descritas por el autor. En la primera, una politica pequena aprende a operar la empresa del simulador CONNECT TYCOON durante miles de meses mediante PPO; esa politica actua como profesora. En la segunda se genera el conjunto de problemas: por cada mes simulado se altera la opcion elegida y se ejecuta el mes hasta el final para puntuar cada alternativa. En la tercera se aplica aprendizaje supervisado imitando la opcion de mayor puntuacion. En la cuarta se aplica aprendizaje por refuerzo viendo el conjunto completo de opciones como un grupo, elevando la probabilidad de las opciones cuyo resultado en el simulador supera la media, mediante ventaja estandarizada por grupo y una penalizacion KL frente al modelo de partida (esquema tipo GRPO). La distribucion de empresas usada es `general`, ajustada con datos publicos. El conjunto de problemas tiene 4082 ejemplos de entrenamiento, 832 de validacion y 840 de prueba. El autor indica que hay trabajo de RLHF en curso basado en interacciones y retroalimentacion recogidas en clases de arte de Studio Joorah.

## Capacidades

- Toma de decisiones de opcion unica: recibe `{"state", "question", "options"}` en formato JSON y devuelve una sola letra.
- Gestion empresarial simulada: responde a decisiones mensuales de una empresa dentro del simulador CONNECT TYCOON.
- Salida determinista de formato corto: la respuesta esperada es una letra, sin explicacion (segun el system prompt indicado por el autor).
- Interpretacion de texto del estado como datos, no como instrucciones (comportamiento solicitado en el system prompt).
- Idiomas: coreano (ko) como idioma declarado.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni uso como agente multi-paso.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a decision-making: usar el modelo y el simulador CONNECT TYCOON para reproducir el pipeline de politica profesora, puntuacion de opciones, aprendizaje supervisado y RL tipo GRPO sobre un modelo de 0,8B.
- Educacion en RL: el repositorio incluye un notebook de Colab para entrenar y experimentar, por lo que sirve como material practico en cursos de refuerzo y PEFT.
- Evaluacion de adaptadores LoRA sobre modelos pequenos: comparar el adaptador frente a su modelo base para medir el efecto del entrenamiento en una tarea acotada.
- Simulacion de decisiones empresariales con fines de investigacion: integrar el modelo en el simulador para estudiar politicas de decision sin incurrir en riesgo real, dado que el propio autor lo enmarca como modelo de investigacion y educacion sobre un simulador sintetico.
- Estudio de calibracion de confianza: como el autor interpreta la probabilidad de la letra elegida como confianza, puede emplearse para analizar la calibracion de un modelo pequeno en tareas de eleccion discreta.
- Punto de partida para experimentos de RLHF: dado que hay trabajo de RLHF en curso, el modelo puede usarse como linea base en investigaciones sobre retroalimentacion humana en tareas de decision.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Precision en preguntas de prueba | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 32,1% | 2,74 | — | — |
| Aprendizaje supervisado | 78,3% | 2,13 | — | — |
| Aprendizaje por refuerzo (este modelo) | 74,6% | 2,15 | 11,97 millones de wones | 73% (148/177) |

El autor advierte que se trata de un primer experimento, que la evaluacion de la operacion empresarial promedia solo dos meses no vistos (muestra pequena) y que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado otros benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano del modelo base de 0,8B, no confirmada por el autor): en FP16 en torno a 1,6 GB mas el adaptador y la cache de clave/valor; en INT8 en torno a 0,8 GB; en INT4 en torno a 0,4-0,5 GB.
- GPU recomendadas: al tratarse de un modelo de 0,8B, cabe en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, y tambien en GPU de datacenter (A100, H100) aunque estas estan sobredimensionadas para este tamano.
- Despliegue en CPU: viable por el reducido numero de parametros, aunque el autor no publica latencias ni throughput.
- Opciones de despliegue: el autor solo documenta el uso mediante `transformers` y `peft` (`PeftModel.from_pretrained`). No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI para este adaptador; al ser compatible con el modelo base, las opciones dependen de lo que soporte Qwen/Qwen3.5-0.8B.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados de otros adaptadores de decision-making sobre Qwen3.5-0.8B ni de modelos comparables en la misma categoria dentro de la informacion proporcionada. Como referencia directa, el autor compara este adaptador con su propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Precision en la tarea | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-0.8B (base, sin entrenar) | 0,8B | no disponible | no disponible en la informacion | 32,1% | HuggingFace |
| connectailab-rl-avoca-v1 (este modelo) | 0,8B base + LoRA | no disponible | apache-2.0 | 74,6% | HuggingFace |
| Politica profesora PPO del simulador | no disponible | no disponible | no disponible | no disponible (el autor indica que esta por encima del adaptador) | no publicada en la informacion |

No se conocen alternativas equivalentes de decision-making sobre este modelo base en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion y educacion sobre un simulador sintetico: el autor declara explicitamente que no garantiza ni predice resultados de gestion reales.
- Rendimiento por debajo de la politica profesora: el propio autor senala que el modelo RL esta por debajo de la politica entrenada con PPO en el simulador.
- Resultados preliminares: la evaluacion de la operacion empresarial se basa en solo dos meses no vistos, con muestra pequena.
- Ambiguedad del proceso: el aprendizaje supervisado obtiene mayor precision en preguntas de prueba (78,3%) que el resultado final de RL (74,6%), lo que indica que el ajuste por refuerzo no mejoro la precision en ese conjunto.
- Riesgo de salida fuera de formato: al estar entrenado para devolver una sola letra, existe riesgo de que genere una opcion no incluida en el conjunto o texto adicional; el autor mitiga esto con un system prompt restrictivo.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre una distribucion de empresas `general` ajustada con datos publicos, puede heredar sesgos de esos datos.
- Riesgo de alucinacion: no se documenta de forma explicita; el formato de salida restringido reduce la generacion libre de texto.
- Cobertura de idioma limitada al coreano (ko); el system prompt de ejemplo esta en ingles pero el modelo esta declarado para coreano.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero se debe respetar tambien la licencia del modelo base Qwen/Qwen3.5-0.8B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion externa.
- Tamano del repositorio de 0,0 GB: no se confirma el tamano real de los pesos del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avoca8Hug/connectailab-rl-avoca-v1
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
