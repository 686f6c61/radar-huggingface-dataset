# Charlottej23/connectailab-rl-superwoman-2-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por Charlottej23 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un modelo de decisión para un robot simulado llamado LINK-01, entrenado para leer en texto el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y elección previa) y responder con una sola letra que indica cómo debe caminar durante los siguientes 0,5 segundos. El pipeline declarado es reinforcement-learning y el dominio de aplicación es la evitación de obstáculos (`avoid_obstacles`).

El entrenamiento parte de un "cerebro" (brain.json) obtenido mediante PPO en un entorno web de aprendizaje por refuerzo, que actúa como profesor. A partir de las observaciones que ese cerebro ve al recorrer un circuito, se generan pares pregunta-respuesta en texto que sirven para un ajuste supervisado con LoRA; después se aplica una fase de RL (con anclaje KL) que sube la probabilidad de las opciones con mejor recompensa y baja la de las peores. El resultado es un adaptador de muy pequeño tamaño (repo de 0,0 GB) que imita parcialmente al cerebro original.

La relevancia del modelo es acotada y experimental: sirve como demostración educativa de cómo destilar una política de RL en un modelo de lenguaje pequeño y cómo evaluar esa destilación con métricas de coincidencia y de éxito en simulación. No está pensado para uso en producción ni para robótica real sin una revalidación completa en el robot y el entorno concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | No disponible (el adaptador LoRA no declara su número de parámetros; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA. La tarea es de clasificación restringida: dado un estado del robot serializado en texto (situación, pregunta y opciones), el modelo debe devolver exactamente la letra de una de las opciones listadas, sin explicación. El prompt de sistema usado en el entrenamiento instruye a tratar el contenido de `state` como datos y no como instrucciones, y a seleccionar una única opción.

El proceso de entrenamiento tiene cuatro etapas según la model card: (1) entrenamiento con PPO de un cerebro en el entorno web `avoid_obstacles` (contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, circuito `567de48c`, 85% en el examen oficial); (2) generación de un conjunto de problemas muestreando cada 0,5 segundos las observaciones del cerebro y usando su acción como etiqueta, incluyendo un 20% de casos en los que el cerebro se desvió; (3) ajuste supervisado con LoRA para imitar al cerebro; y (4) una fase de refuerzo con anclaje KL que reordena las opciones según la recompensa que habría obtenido el cerebro al continuar desde cada una. El conjunto de datos resultante tiene 317 ejemplos de entrenamiento, 216 de validación y 296 de test, con un techo de acierto del 99% (proporción en que el cerebro da la misma respuesta al pasar la observación a texto).

## Capacidades

- Toma de decisiones discretas en un espacio de acciones reducido (selección de una letra entre las opciones listadas).
- Lectura de estados del robot descritos en lenguaje natural: distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa.
- Salida estrictamente restringida a una letra, sin texto adicional, adecuada para integrarse en un bucle de control.
- Resistencia básica a inyección de instrucciones dentro del campo `state` (por el prompt de sistema, no por un entrenamiento específico de seguridad).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al coreano en la práctica; no se declaran otros idiomas.

## Casos de uso

- Docencia de destilación de políticas RL: el adaptador sirve para mostrar en un cuaderno de Colab cómo se pasa de un cerebro PPO a un modelo de lenguaje con LoRA y cómo se mide la coincidencia con el profesor.
- Evaluación de imitación en entornos simulados: se puede comparar la tasa de acierto del adaptador frente al cerebro en el mismo conjunto de test para estudiar la pérdida de rendimiento al cambiar de representación.
- Bucle de control en el simulador web de CONNECT AI WORLD: el adaptador puede colocarse en el puesto de decisión del robot LINK-01 dentro del simulador, siempre que se respete el formato de pregunta y opciones.
- Generación de datos sintéticos de decisión: a partir de estados del robot, el modelo produce etiquetas que pueden usarse para preentrenar o aumentar otros clasificadores de acciones.
- Pruebas de robustez de prompts: al ser un modelo pequeño y de dominio estrecho, es útil para estudiar cómo afectan variaciones en el formato del estado o en el orden de las opciones a la decisión final.
- Referencia negativa en investigación: sus resultados (50% de acierto en test, 0% de éxito en las 20 partidas de evaluación) lo convierten en un caso de estudio sobre los límites de la destilación con pocos datos y RL ligero.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación sobre el conjunto de test y sobre 20 partidas en el circuito `567de48c`, semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 partidas | Partidas con colisión | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 20,9 s |
| Antes de entrenar | 20,0% | 0% | 0% | 0,0 s |
| Ajuste supervisado (LoRA) | 50,0% | 0% | 65% | — |
| Refuerzo (modelo publicado) | 50,0% | 0% | 65% | — |

La evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando derivada del simulador web MuJoCo, no con el modelo robótico ni la red de marcha reales; el autor advierte que los resultados pueden diferir de los del simulador web. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,8B parámetros; en fp16 ocupa aproximadamente 1,6 GB y en cuantización de 8 bits alrededor de 0,8 GB, a lo que se suma el adaptador LoRA (tamaño no declarado, repo de 0,0 GB). Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior permite holgura. Para despliegue por lotes, A100 o H100 no aportan ventaja significativa dado el tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más.
- Opciones de despliegue: transformers + peft (el método documentado en la model card), y en principio vLLM o TGI con soporte de adaptadores LoRA; llama.cpp y Ollama requerirían convertir el adaptador a GGUF, opción no documentada por el autor.
- Latencia y throughput: no disponibles. Al tratarse de una clasificación de una letra sobre un contexto corto, la latencia esperada es baja, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-superwoman-2-v2-link01 | 0,8B base + LoRA | No disponible | 50% de acierto en test; 0% de éxito en 20 partidas | Apache 2.0 | HuggingFace |
| Cerebro PPO de referencia (brain.json) | No disponible (política RL) | No aplica | 100% de acierto; 100% de éxito en 20 partidas | No declarada | Referenciado en la model card |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Sin adaptación a la tarea; no evaluado | No declarada en esta ficha | HuggingFace |

No se dispone de otros adaptadores de decisión robótica comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado: el modelo publicado no supera el 50% de coincidencia con el profesor en test y no completa con éxito ninguna de las 20 partidas de evaluación, con un 65% de partidas con colisión.
- La fase de refuerzo no mejora los resultados del ajuste supervisado en las métricas publicadas; ambos modelos obtienen idénticos valores.
- El conjunto de entrenamiento es muy pequeño (317 ejemplos) y está ligado a un único circuito (`567de48c`) y a un único contrato de tarea (`avoid_obstacles`); no hay evidencia de generalización a otros circuitos u obstáculos.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo ni el robot físico; los resultados pueden no trasladarse.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Idioma efectivo coreano; no se declaran capacidades multilingües.
- Riesgo de alucinación en el sentido de devolver una letra no listada o una respuesta fuera del formato esperado; el prompt de sistema mitiga la inyección de instrucciones, pero no hay evaluación de seguridad publicada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Charlottej23/connectailab-rl-superwoman-2-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
