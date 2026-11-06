# hope6803/connectailab-rl-jarmample-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario hope6803 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para el robot simulado LINK-01 en la tarea `avoid_obstacles` (evitar obstáculos). El modelo recibe en texto el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y la acción previa) y devuelve una única letra correspondiente a la siguiente acción de locomoción para los próximos 0,5 segundos.

El interés técnico del modelo es metodológico: documenta una cadena completa de destilación de políticas de refuerzo (PPO) hacia un modelo de lenguaje mediante supervisión (LoRA) y un posterior ajuste con RL (con anclaje KL), sobre un conjunto de 1.149 ejemplos de entrenamiento, 234 de validación y 322 de prueba. El modelo base Qwen3.5-0.8B aporta la capacidad de razonamiento en lenguaje natural y el adaptador LoRA (ficheros safetensors de PEFT) añade la política específica de decisión.

Es relevante ahora como ejemplo reproducible de cómo convertir una política neuronal de RL (un `brain.json` entrenado en un entorno web con MuJoCo) en un modelo de lenguaje que puede integrarse en pipelines de agentes mediante prompts estructurados y tool calling. Sus cifras de rendimiento son modestas (63,7% de coincidencia con la política maestra y 65% de éxito en 20 episodios) y están pensadas para investigación y educación, no para producción robótica real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); adaptador LoRA de tamaño no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only Qwen3.5-0.8B. La política original es una red entrenada con PPO en el entorno web de CONNECT AI WORLD (`avoid_obstacles`, contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `5d60c049`, 85% en la prueba oficial). A partir de esa política se generó un corpus de decisión: cada 0,5 segundos se convierte la observación del robot en un problema en texto (situación, pregunta y opciones) y la respuesta correcta es la acción elegida por la política maestra; el 20% de los ejemplos incluyen acciones alternativas que desviaron al robot del camino.

El entrenamiento tiene dos fases. Primero, supervisión (SFT) con LoRA para que el modelo de lenguaje imite las respuestas de la política. Después, ajuste con refuerzo (RL): para cada opción se estima la recompensa que habría obtenido el robot si hubiera ejecutado esa acción y la política maestra hubiera continuado, y se suben las opciones mejores y se bajan las peores, con anclaje KL al modelo supervisado. La evaluación se realiza colocando el modelo en el puesto de decisión del robot y recorriendo el mismo curso durante 20 episodios (semillas 91001–91020), con una aproximación 2D de la locomoción basada en una tabla de velocidades por comando, sin red neuronal de marcha.

## Capacidades

- Decisión discreta en un espacio de acciones cerrado: devuelve exactamente una letra de entre las opciones listadas, sin explicación.
- Interpretación de estados del robot descritos en lenguaje natural (distancia y dirección al objetivo, sensores de distancia, velocidad, acción previa).
- Robustez ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el texto dentro de `state` como datos, no como instrucciones.
- Formato de salida estricto y verificable (una sola letra), adecuado para parsing automático.
- Capacidad multilingüe limitada al coreano en los datos de entrenamiento; el prompt de sistema está en inglés.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: el modelo sirve como referencia reproducible de la cadena PPO → SFT → RL con KL, con conjuntos train/valid/test documentados y métricas de coincidencia con la política maestra.
- Educación en refuerzo profundo: permite a estudiantes inspeccionar cómo una política de decisión se traduce a un formato textual y cómo se evalúa contra el profesor original en 20 episodios con semillas fijas.
- Evaluación de robustez de agentes ante inyección de instrucciones: el prompt de sistema y la separación entre `state` y opciones permiten probar ataques de prompt injection en un dominio acotado.
- Prototipado de controladores basados en lenguaje para robots simulados: el modelo puede integrarse en un bucle de decisión cada 0,5 segundos en el simulador web de CONNECT AI WORLD para comparar políticas neuronales y políticas lingüísticas.
- Generación de datos sintéticos de decisión: dado que el modelo imita parcialmente a la política maestra, puede usarse para etiquetar observaciones adicionales y ampliar el corpus de entrenamiento, siempre validando contra el profesor.
- Benchmark de adaptadores LoRA pequeños: con 0,8B de parámetros base y un adaptador de tamaño reducido, es un caso práctico para medir latencia y throughput de PEFT en GPUs de consumo en tareas de clasificación de acciones.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (curso `5d60c049`, 20 episodios con semillas 91001–91020, aproximación 2D de la locomoción):

| Modelo | Precisión en test (coincidencia con la política maestra) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política maestra (profesor) | 100,0% | 100% | 5% | 24,8 s |
| Modelo base sin entrenar | 30,4% | 0% | 20% | — |
| SFT (LoRA supervisado) | 62,1% | 55% | 45% | 26,5 s |
| RL (este modelo) | 63,7% | 65% | 45% | 29,2 s |

Cota superior de precisión alcanzable al verbalizar el estado: 99%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB en FP16 para el modelo base de 0,8B, más el adaptador LoRA; aproximadamente 1 GB en cuantización de 4 bits (estimación basada en el tamaño del modelo base, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue por lotes, A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU con llama.cpp u Ollama si se convierte el modelo fusionado a GGUF.
- Opciones de despliegue: transformers + peft (procedimiento documentado en la model card), vLLM o TGI tras fusionar el adaptador con el modelo base, llama.cpp u Ollama para entornos sin GPU.
- Latencia y throughput: no disponibles en la información proporcionada; el bucle de decisión del simulador opera a 2 Hz (una decisión cada 0,5 s), lo que fija un requisito de latencia inferior a 500 ms por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jarmample-v2-link01 | 0,8B (base) + LoRA | no disponible | Decisión robótica por destilación de PPO | Apache 2.0 | Hugging Face (14 descargas) |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | LLM generalista | Apache 2.0 | Hugging Face |
| Política PPO original (`brain.json`) | no disponible | no aplica | Política neuronal de RL en simulador | no disponible | CONNECT AI WORLD |
| Adaptadores LoRA de decisión de tamaño similar | 0,5B–1B | variable | Clasificación de acciones | variable | no disponible |

No se dispone de comparativas publicadas con otros adaptadores de decisión robótica en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `avoid_obstacles` del robot LINK-01 en un simulador concreto; no generaliza a otras tareas, robots ni entornos sin reentrenamiento.
- La evaluación se realizó con una aproximación 2D de la locomoción basada en una tabla de velocidades, no con el simulador MuJoCo completo; los resultados pueden diferir del entorno real.
- Solo el 63,7% de las respuestas coinciden con la política maestra y el 65% de los episodios tienen éxito, con un 45% de episodios con colisión; el modelo es claramente inferior al profesor.
- El tiempo medio en episodios exitosos es mayor que el del profesor (29,2 s frente a 24,8 s), lo que indica decisiones menos eficientes.
- El idioma de entrenamiento es el coreano; el prompt de sistema está en inglés, lo que puede introducir inconsistencias en el formato de salida.
- Riesgo de alucinación en el sentido de devolver una letra no listada o una explicación adicional; el parsing debe validar estrictamente la salida.
- Riesgo de prompt injection a través del texto del estado, mitigado parcialmente por el prompt de sistema pero no garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte que es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- No se documentan sesgos demográficos ni lingüísticos más allá de la limitación al coreano; el dominio acotado reduce la superficie de sesgo, pero también la utilidad fuera de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hope6803/connectailab-rl-jarmample-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje robótico: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS: https://www.aicitybuilders.com
