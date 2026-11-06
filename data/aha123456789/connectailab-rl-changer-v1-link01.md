# aha123456789/connectailab-rl-changer-v1-link01

## Resumen

connectailab-rl-changer-v1-link01 es un adaptador LoRA publicado por el usuario aha123456789 (CONNECT AI LAB) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01 dentro del entorno educativo CONNECT AI WORLD: recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores, velocidad y acción previa) y devuelve una única letra que identifica el movimiento a ejecutar durante los siguientes 0,5 segundos.

El interés técnico está en el pipeline de destilación: primero se entrena una política PPO en un simulador web (el "profesor" o brain.json), después se generan pares observación-texto/respuesta y se ajusta el modelo lingüístico por supervisión (LoRA), y finalmente se aplica un refinamiento por refuerzo con anclaje KL para alinear las preferencias de acción con la recompensa del entorno. El resultado es un modelo de 0,8B de parámetros que reproduce exactamente las decisiones del profesor sobre el conjunto de prueba.

Es relevante como ejemplo reproducible de cómo convertir una política de RL en un módulo de decisión expresado en lenguaje natural, con código de entrenamiento abierto, cuaderno de Colab y un conjunto de evaluación explícito (401/75/131 ejemplos). Su alcance es deliberadamente estrecho: una tarea (`choose_object`), un robot y un simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos del adaptador en safetensors) |
| Idiomas soportados | coreano (ko), según el campo `language`; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros, mediante LoRA. La tarea se formula como clasificación generativa: la entrada es un texto con el estado del robot, la pregunta y las opciones; la salida es una sola letra entre las opciones listadas. El prompt de sistema instruye explícitamente a tratar el contenido del estado como datos y no como instrucciones, y a devolver únicamente la letra.

El entrenamiento tiene cuatro fases documentadas. (1) Se entrena una política PPO en el simulador web para la tarea `choose_object`, con el contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1`, curso `random` y una tasa de éxito del 95% en el examen oficial. (2) Se construye un conjunto de problemas registrando cada 0,5 segundos la observación del profesor convertida a texto, con la respuesta del profesor como etiqueta; un 20% de los ejemplos corresponden a situaciones en las que el profesor se desvió del camino. (3) Aprendizaje supervisado con LoRA para imitar al profesor. (4) Refinamiento por refuerzo: para cada opción se estima la recompensa que se habría obtenido si el profesor hubiera continuado desde esa acción, se suben las opciones mejores que la del profesor y se bajan las peores, con una penalización KL que mantiene el modelo cerca de la política supervisada. Los conjuntos tienen 401 ejemplos de entrenamiento, 75 de validación y 131 de prueba.

La evaluación de la política se realiza con una aproximación 2D del caminar (tabla de velocidades por comando derivada del simulador MuJoCo web), no con el robot ni la red de marcha reales.

## Capacidades

- Selección de acción discreta: dado un estado textual del robot, devuelve una letra entre las opciones presentadas (4 acciones en el contrato `obs26-act4`).
- Formato de salida estricto: una sola letra, sin explicación, lo que facilita el parseo en bucles de control.
- Robustez ante instrucciones embebidas: el prompt de sistema separa datos de instrucciones, aunque no hay evaluación publicada de resistencia a inyección de prompt.
- Reproducción del comportamiento de una política PPO entrenada en simulador (destilación de política).
- Comprensión de texto en coreano para los campos de estado y las opciones.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Control de agente en simulación educativa: integrar el adaptador como módulo de decisión del robot LINK-01 en CONNECT AI WORLD, sustituyendo la política PPO por una llamada al modelo de lenguaje en cada paso de 0,5 segundos.
- Docencia de RL y destilación: usar el repositorio y el cuaderno de Colab para mostrar el ciclo completo PPO → generación de dataset → SFT con LoRA → refinamiento con recompensa y KL, con métricas de referencia publicadas.
- Prototipado de interfaces lenguaje-acción: emplear el formato de pregunta/respuesta (`connect_tycoon.link01.questions.task_of`) como plantilla para convertir observaciones estructuradas en prompts y validar si un LLM pequeño puede sustituir a una política numérica.
- Evaluación de robustez de políticas destiladas: comparar la tasa de coincidencia con el profesor en los conjuntos de validación y prueba (75 y 131 ejemplos) al variar el formato del estado o el idioma del prompt.
- Agente de decisión de bajo coste en local: al ser un adaptador sobre 0,8B, puede ejecutarse en hardware modesto para experimentos de investigación sin depender de API externas.
- Base para transferencia a otras tareas discretas: reutilizar el pipeline (contrato de observación, generación de dataset, LoRA + RL) en tareas `choose_*` análogas del mismo simulador.

## Benchmarks y rendimiento

Resultados publicados en la model card (tarea `choose_object`, 131 problemas de prueba y 20 episodios con semillas 91001–91020):

| Modelo | Acierto en prueba (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 100% | 0% | 7,7 s |
| Antes del entrenamiento | 0,8% | 0% | 0% | — |
| Aprendizaje supervisado (LoRA) | 100,0% | 100% | 0% | 7,7 s |
| Refuerzo (este adaptador) | 100,0% | 100% | 0% | 7,7 s |

Cota superior de acierto declarada: 100% (el texto reproduce fielmente la observación del profesor). La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden diferir de la realidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp16 para el modelo base de 0,8B, más el adaptador LoRA (tamaño no publicado); en cuantización de 8 bits bajaría a ~0,8 GB y en 4 bits a ~0,5 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) es suficiente para el modelo base en fp16; para entrenamiento del adaptador se recomienda al menos 8–16 GB.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño de 0,8B.
- Opciones de despliegue: transformers + PEFT (procedimiento documentado en la model card), vLLM o TGI tras fusionar el adaptador con el modelo base, y llama.cpp/Ollama si se convierte a GGUF (no se proporcionan artefactos).
- Latencia y throughput: no disponibles. Para control a 2 Hz (paso de 0,5 s) el margen es amplio en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-changer-v1-link01 | 0,8B + LoRA | no disponible | Decisión discreta en simulador (choose_object) | Apache 2.0 | Hugging Face (14 descargas) |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | no disponible en la información | Hugging Face |
| Política PPO brain.json (profesor) | no disponible | no disponible | Decisión discreta en simulador | no disponible | Repositorio connect-tycoon |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparación se limita a la relación con el modelo base y con la política profesor.

## Limitaciones y advertencias

- Alcance muy restringido: entrenado solo para la tarea `choose_object` del robot LINK-01; no generaliza a otras tareas, robots ni entornos sin reentrenamiento.
- Evaluación simulada: la métrica de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo ni un robot físico; los resultados pueden no transferirse.
- Idioma: los datos están en coreano y el prompt de sistema en inglés; el rendimiento en otros idiomas no está evaluado.
- Sin datos de sesgo, alucinación o robustez adversarial más allá del conjunto de prueba de 131 ejemplos.
- Riesgo de inyección de prompt: aunque el prompt de sistema indica tratar el estado como datos, no se publica ninguna evaluación de resistencia a instrucciones maliciosas embebidas en la observación.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la model card califica el modelo como herramienta de investigación y educación y recomienda revalidarlo en el robot y el espacio reales antes de cualquier uso físico.
- El adaptador depende del modelo base Qwen3.5-0.8B; cualquier cambio en dicho modelo afecta a la reproducibilidad.
- Repositorio de 0,0 GB y 14 descargas: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aha123456789/connectailab-rl-changer-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
