# abracsus/connectailab-rl-abracsus-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario abracsus en el marco del proyecto CONNECT AI LAB x AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un modelo de decisión para un robot simulado llamado LINK-01, entrenado para leer en texto el estado de la situación del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y responder con una única letra que representa cómo caminar durante los siguientes 0,5 segundos. El pipeline declarado es reinforcement-learning y el idioma del adaptador es coreano.

El proceso de construcción es poco habitual y conviene entenderlo: primero se entrenó una "cabeza" de política mediante PPO en un entorno web de aprendizaje por refuerzo (tarea `goto_target`, curso `087421dd`, 100% en el examen oficial); después se generó un conjunto de problemas convirtiendo cada 0,5 segundos de observación del robot en texto, con la respuesta de la política como etiqueta; sobre ese corpus se hizo ajuste supervisado con LoRA y, finalmente, un paso de RL (PPO con anclaje KL) que premia opciones que habrían producido mejores recompensas si el resto de la secuencia la hubiera ejecutado la política original. El resultado es un modelo que imita el comportamiento de la política de referencia en formato de lenguaje natural.

El interés del modelo es fundamentalmente metodológico y educativo: demuestra cómo destilar una política de RL en un LLM pequeño mediante LoRA y cómo evaluar la decisión resultante cerrando el bucle sobre el simulador. Con 0,8B parámetros base y un adaptador de tamaño prácticamente nulo (el repositorio ocupa 0,0 GB), es un caso de estudio de bajo coste, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA. La tarea está formulada como clasificación de una sola letra entre un conjunto cerrado de opciones (5 acciones, según la convención `obs21-act5`), con un prompt de sistema que instruye a tratar el estado como datos y a devolver únicamente la letra de la opción elegida. El adaptador se carga con `peft.PeftModel.from_pretrained` y no modifica los pesos del modelo base.

El entrenamiento se desarrolló en cuatro fases descritas por el autor: (1) entrenamiento de la política de referencia con PPO en el simulador web (tarea `goto_target`, curso `087421dd`, examen oficial superado al 100%); (2) generación del corpus de problemas, convirtiendo observaciones cada 0,5 segundos en texto, con la respuesta de la política como etiqueta e incluyendo un 20% de situaciones con desviaciones; (3) ajuste supervisado con LoRA sobre ese corpus; y (4) un paso de RL con PPO y anclaje KL que reordena las opciones según la recompensa que se habría obtenido si el resto de la trayectoria la hubiera ejecutado la política original. Los conjuntos resultantes son 580 ejemplos de entrenamiento, 100 de validación y 130 de test, con una tasa de coincidencia entre texto y política del 100% (techo de acierto).

## Capacidades

- Selección de una acción discreta entre cinco opciones a partir de una descripción textual del estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa).
- Formato de salida restringido a una única letra, sin explicación, lo que facilita el parseo automático en un bucle de control.
- Robustez parcial ante instrucciones embebidas en el estado: el prompt de sistema indica explícitamente tratar el texto de `state` como datos y no como instrucciones.
- Capacidad multilingüe limitada al coreano para la formulación de los problemas.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Docencia de RL a LLM: el modelo sirve como ejemplo completo de destilación de una política PPO en un adaptador LoRA, con corpus, métricas y script de evaluación reproducibles.
- Control de un robot simulado en el entorno web de CONNECT AI WORLD: sustituir la política de referencia por el adaptador en el punto de decisión y comparar la tasa de éxito en el mismo curso.
- Evaluación de robustez ante texto adversario: inyectar instrucciones en el campo `state` y medir si el modelo mantiene la selección de acción o se deja influir.
- Generación de datos sintéticos de decisión: usar el adaptador para etiquetar observaciones nuevas y ampliar el corpus de entrenamiento de políticas posteriores.
- Investigación sobre anclaje KL en ajuste fino con RL: comparar el paso de PPO con anclaje frente al ajuste supervisado puro sobre el mismo corpus.
- Prototipado de interfaces lenguaje-acción: validar el formato "estado en texto, acción en una letra" antes de invertir en un modelo mayor o en un pipeline multimodal.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La evaluación de "misma respuesta que la política" mide la coincidencia con la etiqueta de la política de referencia sobre el conjunto de test; la evaluación de "20 partidas" mide el éxito al colocar el modelo en el puesto de decisión del robot en el mismo curso, con semillas 91001–91020, usando una aproximación 2D de la marcha (tabla de velocidades por comando) en lugar de MuJoCo.

| Modelo | Acierto en test (misma respuesta que la politica) | Exito en 20 partidas | Partidas con colision | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Politica de referencia (profesor) | 100,0% | 100% | 0% | 9,8 s |
| Antes del entrenamiento | 51,5% | 0% | 95% | — |
| Ajuste supervisado (LoRA) | 68,5% | 100% | 30% | 14,9 s |
| RL (PPO con KL) | 56,2% | 0% | 15% | — |

El autor indica que el modelo finalmente subido es el de ajuste supervisado, no el de RL, porque fue el que superó la prueba de marcha. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; como referencia, un modelo base de 0,8B en fp16 requiere del orden de 1,6 GB solo para pesos, más el adaptador LoRA (tamaño despreciable) y la caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo base cabe en cualquier GPU consumer con al menos 4 GB de VRAM en fp16.
- Cabe en GPU consumer: sí, por el tamaño del modelo base; no hay mediciones publicadas.
- Opciones de despliegue: el autor documenta `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA sobre un modelo base, la integración en esos motores requeriría fusionar el adaptador o usar soporte de adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA para decisión robótica sobre un LLM pequeño). Como referencia del componente base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-abracsus-v1-link01 | Adaptador LoRA sobre base de 0,8B | No disponible | Apache 2.0 | Hugging Face (18 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible en la informacion | Hugging Face |
| Alternativas de decision robotica con LLM | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea (`goto_target`) y un único curso (`087421dd`) del simulador; no se ha validado su generalización a otros mapas, tareas u observaciones fuera de distribución.
- La evaluación de marcha usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo real; el propio autor advierte que los resultados pueden diferir de los de MuJoCo.
- El paso de RL empeoró el acierto en test (56,2% frente a 68,5% del ajuste supervisado) y no logró ninguna partida exitosa en la prueba de marcha; el modelo publicado es el de ajuste supervisado.
- El ajuste supervisado, aunque completa las 20 partidas, colisiona en el 30% de ellas y tarda 14,9 s de media frente a los 9,8 s de la política de referencia.
- El idioma del adaptador es exclusivamente coreano; no hay evidencia de comportamiento correcto en otros idiomas.
- Riesgo de inyección de prompt a través del campo `state`: la mitigación depende únicamente de la instrucción de sistema, no de un mecanismo técnico verificado.
- El modelo es de investigación y educación sobre simulador; el autor recomienda revalidarlo en el robot y el espacio reales antes de cualquier uso físico.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia, que debe verificarse por separado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/abracsus/connectailab-rl-abracsus-v1-link01)
- [Repositorio CONNECT TYCOON (código de entrenamiento)](https://github.com/wonseokjung/connect-tycoon)
- [Notebook de Colab para entrenamiento](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb)
- [Entorno web de aprendizaje del robot](https://www.ezerai.xyz/robot-lab/world/)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [AI CITY BUILDERS](https://www.aicitybuilders.com)
- [Curso de RL de AI CITY BUILDERS](https://www.aicitybuilders.com/robot)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
