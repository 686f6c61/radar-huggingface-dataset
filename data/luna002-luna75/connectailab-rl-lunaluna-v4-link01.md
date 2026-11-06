# Luna002-Luna75/connectailab-rl-lunaluna-v4-link01

## Resumen

LINK-01 es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B publicado por Luna002-Luna75 (CONNECT AI LAB / AI CITY BUILDERS) para una tarea muy concreta: la toma de decisiones de un robot simulado llamado LINK-01 que debe esquivar obstáculos. El modelo recibe una descripción en texto del estado del robot (distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a una de las opciones de movimiento disponibles para los siguientes 0,5 segundos. No es un modelo de propósito general, sino un "cerebro" destilado de una política PPO entrenada previamente en un entorno web.

El flujo de entrenamiento es en dos fases: primero se genera un conjunto de preguntas a partir de las observaciones que ve la política PPO (el "profesor") mientras recorre un circuito concreto (`7042d394`) y se aplica aprendizaje supervisado con LoRA para que el modelo de lenguaje imite sus respuestas; después se aplica refuerzo (RL) con recompensas calculadas por el profesor, manteniendo al modelo anclado con una penalización KL. El resultado es un adaptador de aproximadamente 0,8 mil millones de parámetros base que cabe en cualquier GPU de consumo y que se puede reentrenar desde un notebook de Colab.

Su relevancia es doble: por un lado demuestra un patrón de destilación de políticas de RL hacia modelos de lenguaje; por otro, es un ejemplo de modelo de nicho, con licencia Apache 2.0, idioma coreano y evaluación limitada a un único escenario simulado (20 episodios con semillas fijas). No sustituye a un modelo de robótica real y sus cifras de éxito (55 % en la misma pista) deben interpretarse como una prueba de concepto, no como un resultado de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | ~0,8 mil millones (modelo base Qwen3.5-0.8B; el adaptador LoRA añade un número no especificado de parámetros entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors del adaptador LoRA; no se publican versiones GGUF) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen. Sobre él se monta un adaptador LoRA entrenado en dos etapas. En la primera, se genera un conjunto de datos a partir de las observaciones de una política PPO (el "cerebro" o `brain.json`) que recorre un circuito concreto (`7042d394`) en el simulador web de CONNECT AI WORLD; cada 0,5 segundos se convierte la observación en un problema en lenguaje natural con varias opciones y se etiqueta con la acción elegida por el profesor. Se incluyen además un 20 % de ejemplos en los que el profesor se desvía del camino óptimo, para que el alumno no sobreajuste a una única trayectoria. El conjunto resultante tiene 1176 ejemplos de entrenamiento, 231 de validación y 345 de test.

En la segunda etapa se aplica refuerzo: para cada opción se calcula la recompensa que habría obtenido el profesor si hubiera ejecutado esa acción y se empuja al modelo a preferir las opciones con mayor recompensa, con una penalización KL que lo mantiene cerca de la política supervisada. La evaluación se hace colocando al modelo en el puesto de decisión del robot y recorriendo la misma pista durante 20 episodios con semillas 91001–91020. La métrica de "éxito" se obtiene con una aproximación 2D de la locomoción (tabla de velocidades por comando), no con el simulador MuJoCo real, por lo que los resultados pueden diferir de los del entorno web.

## Capacidades

- Clasificación de acciones discretas en un contexto de decisión secuencial: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas.
- Razonamiento de corto plazo sobre observaciones estructuradas (distancias, dirección, velocidad, acción previa) descritas en lenguaje natural.
- Seguimiento de instrucciones estrictas de formato: el system prompt exige devolver solo la letra, sin explicación.
- Tratamiento de datos del estado como datos, no como instrucciones (prompt hardening explícito en el system prompt).
- Capacidad multilingüe limitada: el modelo está entrenado y etiquetado para coreano; el prompt de sistema está en inglés pero el contenido de las preguntas es coreano.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Esquivar obstáculos en simulación: el caso de uso nativo. Se integra en el bucle de control de LINK-01 llamando al modelo cada 0,5 segundos con la observación actual y aplicando la letra devuelta como comando de movimiento.
- Destilación de políticas de RL a lenguaje: sirve como referencia para convertir un `brain.json` de PPO en un modelo de lenguaje que pueda razonar sobre el estado y explicar (o al menos seleccionar) acciones, útil en docencia de RL.
- Prototipado de agentes de decisión de bajo coste: con 0,8 B de parámetros, se puede ejecutar en local en una RTX 3060 o incluso en CPU con cuantización, lo que permite iterar sobre el bucle de decisión sin infraestructura grande.
- Evaluación de robustez de políticas: al sustituir al profesor por el modelo de lenguaje se puede medir cuánto se degrada el rendimiento al pasar de una política numérica a una textual, como hace la propia model card (55 % de éxito frente al 100 % del profesor).
- Generación de datos sintéticos de decisión: las respuestas del modelo pueden usarse para aumentar el conjunto de entrenamiento de otra política o para análisis de sensibilidad de acciones.
- Educación y demos en vivo: el notebook de Colab y el simulador web permiten mostrar en clase cómo se entrena un cerebro con PPO y luego se destila a un LLM, sin necesidad de robot físico.
- Investigación en alineamiento de formatos: el par (system prompt estricto, salida de una sola letra) es un banco de pruebas para estudiar el cumplimiento de instrucciones en modelos pequeños.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos sobre el conjunto de test (345 problemas) y sobre 20 episodios de la pista `7042d394`:

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO, `brain.json`) | 100,0 % | 100 % | 0 % | 25,7 s |
| Modelo base sin entrenar | 42,6 % | 0 % | 85 % | — |
| Solo aprendizaje supervisado (LoRA) | 73,3 % | 45 % | 75 % | 30,3 s |
| Aprendizaje supervisado + RL | 75,7 % | 55 % | 50 % | 25,7 s |

El techo teórico de acierto en test es del 99 % (proporción de observaciones que el profesor responde de forma consistente al pasarlas a texto). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, en torno a 1,6 GB para los pesos del modelo base más el adaptador; en 8 bits, aproximadamente 0,8 GB; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090 o una T4 en cloud son suficientes; A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer recientes (GTX 1660 6 GB en adelante), y también en CPU con llama.cpp u Ollama si se convierte el adaptador a GGUF.
- Opciones de despliegue: transformers + peft (camino documentado), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama previa conversión del adaptador a GGUF (no se publica versión GGUF oficial).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el bucle de control exige una respuesta en menos de 0,5 segundos por paso, lo que en una GPU consumer es holgado para un modelo de 0,8 B, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | ~0,8 B base + LoRA | no disponible | Decisión de esquiva de obstáculos en simulación | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | Lenguaje general | Apache 2.0 | Hugging Face |
| Política PPO `brain.json` (profesor) | no disponible | N/A | Decisión de esquiva de obstáculos en simulación | no disponible | Repositorio connect-tycoon |

No se han identificado en la información proporcionada otros adaptadores LoRA públicos para la misma tarea (decisión robótica en LINK-01) con los que comparar directamente.

## Limitaciones y advertencias

- Ámbito muy restringido: entrenado para una única tarea (`avoid_obstacles`), un único circuito (`7042d394`) y un único robot simulado. No generaliza a otros escenarios sin reentrenamiento.
- Rendimiento limitado: 55 % de éxito en 20 episodios y 50 % de episodios con colisión. No es apto para uso en un robot físico sin validación adicional.
- Evaluación aproximada: la métrica de éxito usa una tabla 2D de velocidades por comando, no el simulador MuJoCo real; los resultados pueden diferir del entorno web.
- Idioma: solo coreano; el prompt de sistema está en inglés pero las preguntas y opciones están en coreano. El rendimiento en castellano no está evaluado.
- Riesgo de alucinación de formato: aunque el system prompt exige devolver solo una letra, un modelo de 0,8 B puede ocasionalmente añadir texto o elegir una opción no listada; conviene validar la salida antes de aplicarla al robot.
- Sesgos: no documentados; el conjunto de entrenamiento es pequeño (1176 ejemplos) y proviene de una sola política y una sola pista, por lo que puede reproducir los sesgos de esa trayectoria concreta.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado; el autor no documenta restricciones adicionales.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte.
- La model card advierte explícitamente que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio reales antes de usarse.

## Enlaces

- Hugging Face: https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web (CONNECT AI WORLD): https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
