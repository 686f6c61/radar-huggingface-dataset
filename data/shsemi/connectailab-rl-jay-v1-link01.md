# SHSemi/connectailab-rl-jay-v1-link01

## Resumen

connectailab-rl-jay-v1-link01 es un adaptador LoRA publicado por SHSemi (CONNECT AI LAB) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" entrenado para el robot simulado LINK-01: recibe una descripción en texto del estado del robot (distancia y dirección al objetivo, lectores de distancia, velocidad y elección previa) y devuelve una única letra que indica cómo debe caminar durante los siguientes 0,5 segundos. El modelo está etiquetado con el pipeline `reinforcement-learning` y el idioma `ko`.

El entrenamiento combina dos fases. Primero se entrena una política PPO en un entorno web de aprendizaje por refuerzo (`choose_object`, curso `random`, 95% de éxito en el examen oficial) y se generan 640 pares observación-texto/respuesta (427 de entrenamiento, 75 de validación y 138 de prueba). Después se hace aprendizaje supervisado con LoRA sobre Qwen3.5-0.8B para imitar esa política y, finalmente, se aplica un ajuste de refuerzo con PPO y una penalización KL para favorecer las acciones con mayor recompensa. El resultado es un adaptador de muy pocos parámetros que reproduce exactamente la política del profesor en el conjunto de prueba.

Su relevancia es fundamentalmente metodológica y educativa: demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño mediante LoRA y cómo alinear después las respuestas con recompensas del entorno. No sustituye a un modelo de razonamiento general ni a un controlador robótico real; el propio autor advierte que es un modelo de investigación y educación sobre simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA. La tarea es una clasificación de acción restringida: dado un estado textualizado del robot, el modelo debe emitir exactamente una letra entre las opciones listadas (cuatro acciones de caminata en la tarea `choose_object`, con observación de 26 dimensiones y acción de 4). El prompt de sistema instruye al modelo a tratar el contenido del estado como datos y no como instrucciones, y a devolver solo la letra, sin explicación.

El proceso de entrenamiento tiene cuatro etapas descritas por el autor: (1) entrenamiento de la política PPO en el simulador web, con un 95% de éxito en el examen oficial del curso `random`; (2) generación del conjunto de datos convirtiendo cada 0,5 segundos la observación del robot en texto y usando la acción de la política como etiqueta, incluyendo un 20% de ejemplos con desviaciones del camino; (3) aprendizaje supervisado con LoRA para imitar la política del profesor; y (4) ajuste con PPO usando la recompensa obtenida si el resto del episodio lo completaba la política del profesor, con una penalización KL que mantiene al modelo cerca de la distribución supervisada. La evaluación final se realiza colocando el modelo en el puesto de decisión del robot y recorriendo el mismo curso en 20 episodios (semillas 91001-91020).

## Capacidades

- Decisión de acción discreta en un entorno de robot simulado: selecciona una de las cuatro opciones de caminata a partir de un estado textualizado.
- Comprensión de estados estructurados en lenguaje natural (distancias, direcciones, lectores de distancia, velocidad y acción previa).
- Salida estrictamente restringida a una letra, sin texto adicional, lo que facilita el parseo automático.
- Robustez parcial ante estados con desviaciones del camino (20% de ejemplos de entrenamiento con acciones distintas a la política óptima).
- Capacidad multilingüe limitada al coreano según la model card; no se declaran capacidades en castellano ni en otros idiomas.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Destilación de políticas de RL en modelos de lenguaje: el adaptador sirve como ejemplo reproducible de cómo convertir una política PPO en un modelo de lenguaje pequeño mediante LoRA y ajuste posterior con PPO y KL, útil en cursos y laboratorios de aprendizaje por refuerzo.
- Control de decisión en simuladores educativos: integrado en el entorno `connect-tycoon`, el modelo puede sustituir a la política original en el bucle de decisión cada 0,5 segundos para recorrer cursos y comparar el comportamiento con el profesor.
- Evaluación de robustez de políticas destiladas: al disponer de conjuntos de entrenamiento, validación y prueba separados (427/75/138), permite medir la fidelidad de la imitación y el efecto del ajuste por refuerzo.
- Generación de datos sintéticos de decisión: el modelo puede etiquetar estados textualizados de robot con acciones coherentes, útil para aumentar conjuntos de datos de entrenamiento en tareas similares.
- Prototipado de interfaces texto-acción: sirve para validar pipelines en los que un LLM recibe un estado en lenguaje natural y devuelve una acción discreta que un sistema posterior ejecuta, antes de invertir en un controlador específico.
- Docencia y demostraciones de RL aplicado a robótica: el notebook de Colab y el repositorio permiten reproducir el entrenamiento y la evaluación en un entorno web sin necesidad de hardware robótico.

## Benchmarks y rendimiento

| Modelo | Precisión en el conjunto de prueba (misma respuesta que el profesor) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Política profesora (PPO) | 100,0% | 100% | 0% | 8,5 s |
| Antes del entrenamiento (Qwen3.5-0.8B base) | 73,2% | 60% | 0% | 8,7 s |
| Aprendizaje supervisado (LoRA) | 100,0% | 100% | 0% | 8,5 s |
| Ajuste por refuerzo (PPO + KL) | 100,0% | 100% | 0% | 8,5 s |

La evaluación de la caminata se realizó con una aproximación 2D basada en una tabla de velocidades medidas por comando, no con el robot ni la red de caminata reales; el autor advierte que los resultados pueden diferir de los de MuJoCo en la web. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la inferencia en precisión completa requiere del orden de 2-4 GB, y menos con cuantización de 8 o 4 bits, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base, una GPU consumer con 8 GB o más debería ser suficiente, pero no se confirma.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo base (0,8B), aunque no se documenta.
- Opciones de despliegue: la model card solo muestra el uso con `transformers` y `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT, requeriría fusión con el modelo base o soporte específico de adaptadores.
- Latencia y throughput: no disponibles. El bucle de decisión opera a 0,5 segundos por paso, pero no se publican latencias de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un adaptador LoRA específico para una tarea de decisión en un simulador concreto, por lo que no existe una categoría estándar de comparación directa. Como referencia, el modelo base Qwen/Qwen3.5-0.8B es un transformer decoder-only de 0,8B parámetros con licencia Apache 2.0, pero no se han publicado en esta ficha sus especificaciones de contexto ni sus resultados de benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-jay-v1-link01 | Adaptador LoRA sobre 0,8B | No disponible | Apache 2.0 | Hugging Face (24 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulador: el autor indica explícitamente que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el robot ni la red de caminata reales; los resultados pueden diferir de MuJoCo.
- El conjunto de datos es muy pequeño (427 ejemplos de entrenamiento, 75 de validación y 138 de prueba), lo que limita la generalización fuera del curso `random` y de la tarea `choose_object`.
- Idioma declarado únicamente coreano; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación en la salida: aunque el formato exige una sola letra, nada impide que el modelo emita texto adicional o una letra no listada si el estado de entrada se desvía de la distribución de entrenamiento.
- Dependencia del prompt de sistema exacto: el autor especifica un system prompt concreto; cambios en el formato pueden degradar el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- No se declaran sesgos específicos, pero al entrenarse sobre una única política y un único curso, el modelo puede reproducir los sesgos de esa política.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SHSemi/connectailab-rl-jay-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con robots: https://www.aicitybuilders.com/robot
