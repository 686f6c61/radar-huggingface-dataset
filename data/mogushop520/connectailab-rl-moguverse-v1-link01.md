# mogushop520/connectailab-rl-moguverse-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario mogushop520 bajo el paraguas del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para el robot simulado LINK-01 en la tarea `avoid_obstacles` (evasión de obstáculos). El modelo recibe una descripción textual del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de caminata para los próximos 0,5 segundos.

La relevancia del modelo es fundamentalmente metodológica: el autor documenta un pipeline completo de destilación de una política PPO (el "cerebro" entrenado en un simulador web) hacia un modelo de lenguaje mediante aprendizaje supervisado (LoRA) primero y refinamiento con refuerzo después, usando la recompensa del entorno como señal. Los resultados publicados, sin embargo, muestran que la política destilada no logra reproducir el comportamiento del profesor: la tasa de acierto en el test se queda en el 45,8 % y el modelo falla en las 20 partidas de evaluación, con un 100 % de colisiones.

El modelo tiene un tamaño muy reducido (0,8 mil millones de parámetros en el base, más un adaptador LoRA), está etiquetado únicamente para coreano y se distribuye con licencia Apache 2.0. Su interés práctico es limitado fuera del contexto educativo del proyecto, pero sirve como caso de estudio de las dificultades de destilar políticas de refuerzo en modelos de lenguaje pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); parámetros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors del adaptador) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA vía PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se carga con la librería PEFT y se aplica sobre el modelo base sin modificar sus pesos originales. La tarea es de clasificación restringida: dado un "problema" en texto que describe el estado del robot y una lista de opciones, el modelo debe devolver exactamente una letra.

El entrenamiento se estructura en cuatro fases documentadas por el autor. Primero, se entrena una política PPO en el simulador web (tarea `avoid_obstacles`, curso `1f65b5ae`, con una tasa de éxito del 85 % en el examen oficial). Segundo, se genera un conjunto de datos a partir de las observaciones que el "cerebro" PPO ve cada 0,5 segundos, convirtiéndolas en texto y etiquetando la respuesta con la acción elegida por el cerebro; se incluye un 20 % de ejemplos con acciones subóptimas para cubrir desviaciones. Tercero, se realiza aprendizaje supervisado (LoRA) sobre ese conjunto, que consta de 1240 ejemplos de entrenamiento, 257 de validación y 373 de test. Cuarto, se aplica refinamiento con refuerzo usando la recompensa del entorno como señal, con una penalización KL para mantener el modelo cerca de la política supervisada. La evaluación final se realiza colocando el modelo en el puesto de decisión del robot y ejecutando 20 partidas con semillas 91001–91020.

## Capacidades

- Clasificación de decisiones discretas: dado un estado textual del robot y un conjunto de opciones, devuelve una única letra correspondiente a la acción.
- Seguimiento de instrucciones de formato estricto: el system prompt exige devolver solo la letra, sin explicación.
- Comprensión de estados estructurados en texto (distancias, direcciones, sensores, velocidad, acción previa).
- Entrenamiento con refuerzo (PPO) como técnica de alineación sobre un adaptador LoRA.
- Capacidad multilingüe limitada al coreano según la model card.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Estudio de destilación de políticas de refuerzo: el modelo sirve como ejemplo reproducible de cómo convertir una política PPO en un modelo de lenguaje y de los problemas que surgen (pérdida de rendimiento del 100 % al 0 % en éxito de tarea).
- Docencia en cursos de RL: el proyecto CONNECT TYCOON y el cuaderno de Colab asociado permiten a estudiantes reproducir el pipeline completo (PPO → dataset → LoRA → RL → evaluación).
- Investigación sobre recompensas y KL en RLHF: el autor documenta explícitamente el uso de la recompensa del entorno y una penalización KL, útil para comparar con técnicas estándar de RLHF.
- Prototipado de agentes de decisión en entornos simulados: el modelo puede integrarse en el bucle de decisión del simulador web para experimentar con políticas basadas en lenguaje.
- Evaluación de la fidelidad de la destilación: la diferencia entre la tasa de acierto en test (45,8 %) y el éxito en la tarea (0 %) es un caso de estudio sobre la brecha entre métricas offline y rendimiento real.
- Generación de datasets sintéticos de decisión: el pipeline de conversión de observaciones a texto puede reutilizarse para crear corpus de decisiones etiquetadas en otros dominios.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, referidos a la tarea `avoid_obstacles`:

| Modelo | Acierto en test (misma acción que el cerebro) | Éxito en 20 partidas | Partidas con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 0 % | 27,6 s |
| Modelo sin entrenar | 28,2 % | 0 % | 0 % | — |
| Tras aprendizaje supervisado (LoRA) | 45,8 % | 0 % | 100 % | — |
| Tras refuerzo (PPO sobre LoRA) | 45,8 % | 0 % | 100 % | — |

El autor indica que la evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del entorno web. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,8 mil millones de parámetros más un adaptador LoRA, la inferencia en fp16 requiere aproximadamente 1,6 GB; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, en torno a 0,4 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. Para entrenamiento del adaptador, una RTX 3090 o A100 acelera el proceso, aunque el tamaño reducido permite entrenar en GPUs de gama media.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas.
- Opciones de despliegue: transformers + PEFT (documentado por el autor), vLLM con soporte de adaptadores LoRA, llama.cpp y Ollama si se convierte el modelo fusionado a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (destilación de políticas PPO a modelos de lenguaje para robótica simulada). Como referencia del modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8 B + LoRA | No disponible | Apache 2.0 | HuggingFace |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | No disponible en la información | HuggingFace |
| Política PPO original (cerebro) | No disponible | No aplica | No disponible | Solo dentro del simulador del proyecto |

## Limitaciones y advertencias

- Rendimiento muy por debajo del profesor: la tasa de éxito en la tarea es del 0 % frente al 100 % del cerebro PPO, con colisión en las 20 partidas de evaluación.
- El refinamiento con refuerzo no mejora la métrica de test (45,8 % en ambos casos), lo que sugiere que la señal de recompensa no está guiando eficazmente al modelo.
- El modelo está etiquetado únicamente para coreano; no se garantiza un comportamiento correcto en otros idiomas.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden no reflejar el comportamiento real.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse antes de usarse en un robot real y en un espacio concreto.
- Riesgo de alucinación y de devolver letras fuera del conjunto de opciones válidas, dado el formato de clasificación restringida.
- No hay información sobre sesgos, datos de entrenamiento más allá del conjunto sintético generado por el profesor, ni sobre el impacto ambiental del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que deben verificarse por separado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mogushop520/connectailab-rl-moguverse-v1-link01)
- [Repositorio CONNECT TYCOON (código de entrenamiento)](https://github.com/wonseokjung/connect-tycoon)
- [Cuaderno de Colab de entrenamiento](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [AI CITY BUILDERS](https://www.aicitybuilders.com)
- [Curso de refuerzo en AI CITY BUILDERS](https://www.aicitybuilders.com/robot)
- [Simulador web de entrenamiento](https://www.ezerai.xyz/robot-lab/world/)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
