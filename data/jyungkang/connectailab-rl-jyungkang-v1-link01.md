# jyungkang/connectailab-rl-jyungkang-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado por el autor jyungkang en el marco del proyecto CONNECT AI LAB / CONNECT TYCOON. No es un modelo de lenguaje de propósito general: es un modelo de decisión para el robot simulado LINK-01, especializado en la tarea `avoid_obstacles` (esquivar obstáculos). Su función es leer en texto el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y la elección anterior) y devolver una única letra que corresponde a la acción de caminar durante los siguientes 0,5 segundos.

El entrenamiento combina dos fases. Primero, un "cerebro" (brain.json) se entrena con PPO en un entorno web de aprendizaje por refuerzo; después, ese cerebro actúa como profesor y se generan pares observación-texto → acción. Sobre esos datos se hace un ajuste supervisado con LoRA y, finalmente, un ajuste por refuerzo con restricción KL para alinear las probabilidades del modelo con las recompensas obtenidas al ejecutar cada opción. El resultado es un modelo muy pequeño (0,8B parámetros en el base, con adaptador LoRA) que traduce observaciones estructuradas a decisiones discretas.

Es relevante como ejemplo de pipeline completo de destilación de políticas RL a modelos de lenguaje, con métricas de éxito medidas en simulación (95% en el profesor, 15% en el modelo tras RL) y un conjunto de datos de 1.256 ejemplos de entrenamiento. No está pensado para uso general, sino como componente de decisión dentro de un entorno de simulación educativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | ~0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene safetensors del adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 800 millones de parámetros. Sobre él se aplica un adaptador LoRA entrenado en dos etapas. En la primera, ajuste supervisado, el modelo aprende a imitar las decisiones de un "cerebro" PPO entrenado previamente en el entorno web `avoid_obstacles` (convención `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `fece8a83`, 85% de éxito en el examen oficial). Los datos se generan recorriendo el curso `3c1af4e8` y registrando cada 0,5 segundos la observación convertida a texto y la acción elegida por el cerebro; un 20% de los ejemplos corresponden a situaciones en las que el cerebro se desvió del camino. El conjunto resultante tiene 1.256 ejemplos de entrenamiento, 226 de validación y 369 de test.

En la segunda etapa, ajuste por refuerzo, se asigna a cada opción la recompensa que se habría obtenido si el cerebro hubiera ejecutado esa acción y hubiera continuado caminando; las opciones mejores que la del profesor se refuerzan y las peores se penalizan, con una restricción KL para mantener el modelo cerca de la política supervisada. La tasa de acuerdo entre el modelo y el cerebro sobre el mismo texto (techo de acierto) es del 99%. La evaluación de la habilidad de caminar se hace con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo real, por lo que los resultados pueden diferir de los del entorno web.

## Capacidades

- Decisión discreta de acciones de caminata para el robot simulado LINK-01 en la tarea `avoid_obstacles`: devuelve una única letra entre las opciones presentadas.
- Lectura de observaciones estructuradas convertidas a texto (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa).
- Respuesta en formato restringido: solo la letra de la opción, sin explicación, cuando se usa el system prompt indicado por el autor.
- Ajuste por refuerzo con PPO como parte del pipeline de generación de datos (entrenamiento del cerebro profesor).
- Entrenamiento con LoRA (PEFT) sobre un modelo base pequeño, lo que permite reentrenar y distribuir adaptadores ligeros.
- Capacidad de ejecutarse en modo "decisión" dentro de un bucle de simulación, sustituyendo al cerebro RL original.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni razonamiento general; el modelo está especializado en una única tarea.

## Casos de uso

- Docencia de pipelines RL a LLM: el modelo sirve como ejemplo reproducible de destilación de una política PPO a un modelo de lenguaje mediante ajuste supervisado y ajuste por refuerzo con KL, con código y cuaderno de Colab públicos.
- Simulación educativa de robótica: se puede integrar en el entorno web CONNECT AI WORLD para que un agente controlado por lenguaje recorra el curso `avoid_obstacles` y comparar su comportamiento con el del cerebro PPO original.
- Investigación sobre decisión con modelos pequeños: al tener 0,8B parámetros, permite experimentar con variantes de LoRA, recompensas y prompts en hardware de consumo sin grandes costes de cómputo.
- Evaluación de robustez ante desviaciones: los ejemplos de "caminar fuera de ruta" incluidos en el dataset permiten estudiar cómo reacciona el modelo cuando el estado observado no coincide con la trayectoria óptima del profesor.
- Generación de datos sintéticos de decisión: el par observación textual → acción puede reutilizarse como dataset para entrenar otros modelos de decisión o para aumentar la cobertura de estados en simuladores similares.
- Pruebas de formato y restricciones de salida: útil para validar pipelines que exigen respuestas de una sola letra y tolerancia a instrucciones inyectadas en el campo `state` (el system prompt indica tratar ese texto como datos, no como instrucciones).
- Prototipado de agentes con salida restringida: como componente de decisión dentro de un bucle mayor, donde un orquestador externo construye la pregunta y el modelo solo elige entre opciones predefinidas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre 369 problemas de test y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 95% | 15% | 23,6 s |
| Antes del entrenamiento | 35,8% | 0% | 0% | — |
| Ajuste supervisado (SFT) | 64,2% | 0% | 90% | — |
| Ajuste por refuerzo (RL) | 64,2% | 15% | 80% | 27,0 s |

Nota: la evaluación de caminata usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo real, por lo que los resultados pueden diferir de los del entorno web.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo base de ~0,8B parámetros más un adaptador LoRA, la inferencia en fp16 requiere del orden de 1,6–2 GB de VRAM; en cuantización de 8 bits o 4 bits (si se generan versiones GGUF, no publicadas en el repo) bajaría por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); también cabe en GPUs de portátil con 4 GB o más. Para entrenamiento del adaptador LoRA basta una GPU de 8–12 GB.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: `transformers` + `peft` (el método documentado por el autor); vLLM, TGI o llama.cpp requerirían fusionar el adaptador con el base y, en el caso de llama.cpp, convertir a GGUF, pasos no documentados en la model card.
- Latencia y throughput: no disponibles. El modelo se invoca una vez cada 0,5 segundos en el bucle de simulación, pero no se publican medidas de latencia por token ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia, el propio autor compara el modelo con su "cerebro" profesor (política PPO entrenada en el simulador), pero no con otros modelos de lenguaje de decisión.

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| connectailab-rl-jyungkang-v1-link01 | ~0,8B (base) + LoRA | no disponible | Decisión discreta para `avoid_obstacles` vía LoRA + RL | Apache 2.0 |
| Cerebro PPO (profesor) | no disponible (política RL) | no aplica | Política PPO en simulador web | no disponible |
| Otros modelos de decisión comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en una única tarea (`avoid_obstacles`) y un único robot simulado (LINK-01); no es un modelo de lenguaje de propósito general.
- El éxito medido en caminata es del 15% en 20 episodios tras el ajuste por refuerzo, con un 80% de episodios con colisión; el rendimiento está muy por debajo del profesor PPO (95% de éxito).
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo real; los resultados pueden no trasladarse al entorno físico o al simulador completo.
- El modelo solo entiende coreano en los datos de entrenamiento; el system prompt está en inglés, pero no se documenta soporte multilingüe.
- Riesgo de alucinación: aunque la salida está restringida a una letra, el modelo puede devolver opciones no válidas o ignorar el formato si el prompt no se aplica exactamente como indica el autor.
- El system prompt advierte de tratar el contenido del campo `state` como datos y no como instrucciones; sin esa precaución, el modelo es vulnerable a inyección de instrucciones a través de la observación.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que es un modelo de investigación y educación sobre simulador; recomienda revalidar en el robot y el espacio reales antes de cualquier uso físico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB; no hay evidencia de validación por terceros.
- No se documentan cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jyungkang/connectailab-rl-jyungkang-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
