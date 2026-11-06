# kiodo/connectailab-rl-brena-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el autor kiodo bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un modelo de decisión entrenado por refuerzo para controlar el robot simulado LINK-01 en la tarea `goto_target` (llegar a un objetivo). El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción anterior) y devuelve una única letra correspondiente a una de las cinco acciones discretas que debe ejecutar durante los siguientes 0,5 segundos.

El pipeline declarado en Hugging Face es `reinforcement-learning` y la librería `peft`, con licencia Apache 2.0 y un tamaño de repositorio de 0,0 GB (coherente con ser un adaptador y no un modelo completo). El idioma declarado es coreano (`ko`), aunque la interfaz real del modelo es un formato de pregunta en inglés con letras como respuesta.

Su relevancia es acotada: sirve como ejemplo reproducible de destilación de una política PPO entrenada en el navegador (un `brain.json`) hacia un modelo de lenguaje mediante aprendizaje supervisado y posterior ajuste con RL, con métricas publicadas de accuracy frente al profesor y de éxito en una aproximación 2D de la locomoción. No es un modelo apto para robótica real sin revalidación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (adaptador LoRA sobre base de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (`ko`) segun metadatos; interfaz de decision en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en cuatro fases descritas en la model card: (1) entrenamiento PPO de una política en el entorno web `goto_target` con observación de 10 dimensiones y 5 acciones (`obs10-act5/walker51-14/v1`), alcanzando el 100 % en el examen oficial del entorno; (2) generación de un dataset de preguntas y respuestas a partir de las observaciones del profesor cada 0,5 segundos, con un 20 % de ejemplos en los que el profesor se desvía; (3) aprendizaje supervisado del LLM sobre esas respuestas (LoRA); y (4) ajuste por refuerzo donde se comparan recompensas de cada opción frente a la acción del profesor, con una penalización KL que mantiene al modelo cerca de la política supervisada.

El dataset contiene 1.200 ejemplos de entrenamiento, 240 de validación y 360 de prueba. La tasa de coincidencia entre la representación textual y la respuesta del profesor (techo de accuracy) es del 99 %. La evaluación de la locomoción se realizó con una aproximación 2D basada en una tabla de velocidades por comando derivada de MuJoCo web, no con el simulador completo, lo que el autor reconoce explícitamente como una simplificación.

## Capacidades

- Clasificación de decisión discreta: dado un estado textual del robot, devuelve exactamente una letra de entre las opciones listadas (5 acciones).
- Seguimiento de instrucciones de formato estricto: el system prompt exige devolver solo la letra, sin explicación.
- Tratamiento del estado como datos, no como instrucciones (el prompt lo indica explícitamente).
- Razonamiento de un solo paso: no hay cadena de pensamiento ni multi-step reasoning.
- No soporta tool calling ni function calling.
- No soporta agentes ni planificación multi-turno.
- Capacidades multilingües limitadas al coreano declarado y al inglés de la interfaz de decisión.
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Reproducción de un pipeline de destilación PPO a LLM: usar el adaptador como referencia para trasladar una política de RL a un modelo de lenguaje mediante SFT y RL, útil en investigación educativa sobre RL y LLMs.
- Control simulado de un robot diferencial en la tarea `goto_target`: integrar el modelo en el bucle de decisión cada 0,5 segundos para seleccionar la siguiente acción discreta en el simulador web.
- Evaluación de robustez de políticas destiladas: comparar la accuracy del adaptador (94,7 % SFT, 94,4 % RL) frente al profesor (100 %) para estudiar la pérdida de rendimiento al cambiar de representación.
- Generación de datasets sintéticos de decisión: emplear el modelo como generador de etiquetas para ampliar el conjunto de entrenamiento de otras políticas.
- Docencia de RL aplicado: usar el cuaderno de Colab y el repositorio CONNECT TYCOON para que estudiantes entrenen su propio cerebro y lo destilen a un LLM.
- Pruebas de formato estricto en pipelines de inferencia: validar que un modelo pequeño (0,8B) cumple la restricción de devolver una sola letra bajo un system prompt dado.
- Investigación sobre desviación respecto al profesor: analizar el 20 % de ejemplos con acciones alternativas para estudiar la sensibilidad del modelo a estados fuera de distribución.

## Benchmarks y rendimiento

| Modelo | Accuracy en test (coincidencia con el profesor) | Éxito en 20 episodios del mismo recorrido | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0 % | 0 % | 100 % | — |
| Antes del entrenamiento | 15,8 % | 0 % | 0 % | — |
| SFT (LoRA supervisado) | 94,7 % | 0 % | 100 % | — |
| RL (adaptador final) | 94,4 % | 0 % | 100 % | — |

El autor indica que el modelo publicado corresponde al de SFT, no al de RL. La métrica de éxito en locomoción se midió con una aproximación 2D basada en una tabla de velocidades por comando, no con MuJoCo completo, y el propio autor advierte que puede diferir de los resultados en el simulador web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la huella es reducida, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí para un modelo de 0,8B, pero no se confirma en la documentación.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el autor solo muestra el uso con `transformers` + `peft`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores de decisión para robótica destilados de políticas PPO sobre LLMs pequeños) en la documentación proporcionada. Como referencia del modelo base, Qwen/Qwen3.5-0.8B es un transformer de 0,8B parámetros con licencia Apache 2.0; no se dispone de datos de benchmarks comparativos de este adaptador frente a otras políticas de control.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-brena-v1-link01 | adaptador sobre 0,8B | no disponible | 94,4–94,7 % accuracy en test | Apache 2.0 | Hugging Face |
| Política PPO original (`brain.json`) | no aplica (tabla/red) | no aplica | 100 % accuracy, 0 % éxito en 20 episodios | no disponible | Repositorio CONNECT TYCOON |
| Otros adaptadores de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es un adaptador de decisión para una única tarea (`goto_target`) y un único robot simulado; no generaliza a otras tareas ni a robots reales sin reentrenamiento.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de locomoción usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden diferir de la realidad.
- El modelo publicado es el de SFT, no el de RL, pese a que la model card describe ambos; el autor lo indica en la sección de evaluación.
- Accuracy del 94,4–94,7 % frente al profesor implica un 5 % de decisiones discrepantes, lo que en un bucle de control puede acumular desviaciones.
- El idioma declarado es coreano; la interfaz de decisión está en inglés y el modelo no está pensado para conversación general.
- No se publican datos sobre sesgos, alucinación en sentido lingüístico ni comportamiento fuera de distribución más allá del 20 % de ejemplos con desviaciones del profesor.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propios términos que deben verificarse por separado.
- No se documentan requisitos de hardware, cuantizaciones ni opciones de despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kiodo/connectailab-rl-brena-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
