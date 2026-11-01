# leegoheun/connectailab-rl-duking-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor leegoheun en el marco de los proyectos CONNECT AI LAB y AI CITY BUILDERS. No se trata de un modelo de lenguaje de propósito general, sino de un modelo de decisión específico para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de locomoción a ejecutar durante los siguientes 0,5 segundos.

El modelo se construye a partir de un "cerebro" entrenado con PPO en un entorno web de aprendizaje por refuerzo (tarea `choose_object`), cuyas decisiones se convierten en pares pregunta-respuesta textuales. Sobre esa base se aplica aprendizaje supervisado (LoRA) y posteriormente un ajuste con refuerzo (RL) que reordena las preferencias entre opciones según la recompensa obtenida. El resultado es un adaptador de muy pequeño tamaño (repo de 0,0 GB) que reproduce fielmente el comportamiento del cerebro profesor en el conjunto de test.

La relevancia de este modelo es fundamentalmente metodológica y educativa: demuestra cómo destilar un agente de RL en un modelo de lenguaje pequeño mediante LoRA, usando el propio agente como profesor y el RL para corregir preferencias. Está pensado para investigación y docencia en simulación, no para despliegue en robots reales sin una validación adicional específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (library_name: peft) montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del modelo base; añade matrices de bajo rango entrenables que ajustan las representaciones internas para la tarea de decisión. El pipeline declarado es `reinforcement-learning`, con etiquetas que incluyen `ppo`, `deep-reinforcement-learning`, `robotics` y `decision-making`.

El proceso de entrenamiento consta de varias fases descritas en la model card. Primero se entrena un "cerebro" con PPO en un simulador web (tarea `choose_object`, curso `random`, con un 95% de éxito en el examen oficial). Después se genera un conjunto de problemas: cada 0,5 segundos se traduce la observación del cerebro a texto y se registra su acción como respuesta correcta, incluyendo un 20% de casos con desviaciones. Sobre ese dataset (353 ejemplos de entrenamiento, 65 de validación y 105 de test) se aplica aprendizaje supervisado con LoRA y, posteriormente, un ajuste con refuerzo que sube la probabilidad de opciones con mayor recompensa y baja la de las peores, con una penalización KL para mantener el modelo cerca de la política supervisada. La evaluación final se realiza colocando el modelo de decisión en el puesto de mando del robot y ejecutando 20 episodios con semillas 91001–91020.

## Capacidades

- Decisión de locomoción: dado un estado textual del robot, selecciona una de las opciones de acción disponibles y devuelve únicamente su letra.
- Formato de salida restringido: el modelo está entrenado para responder con una sola letra, sin explicación, lo que facilita su integración en bucles de control.
- Robustez ante instrucciones embebidas: el prompt de sistema indica explícitamente tratar el texto del estado como datos y no como instrucciones, una mitigación básica de inyección de prompt.
- Reproducción del comportamiento del agente profesor: alcanza un 100% de coincidencia con el cerebro PPO en el conjunto de test.
- Ejecución episódica: mantiene el 100% de éxito en 20 episodios del mismo curso, sin colisiones, con un tiempo medio de 7,7 s por episodio exitoso.
- Multilingüismo: limitado al coreano según la model card; no se declaran capacidades multilingües adicionales.
- No se declaran capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de RL y destilación: el modelo sirve como ejemplo completo de cómo convertir un agente PPO en un adaptador LoRA sobre un LLM pequeño, con notebook de Colab incluido, para cursos de aprendizaje por refuerzo.
- Investigación en destilación de políticas: permite comparar aprendizaje supervisado frente a ajuste con refuerzo sobre el mismo profesor, ya que la model card reporta resultados de ambas variantes.
- Control de robot simulado en entornos web: se integra en el simulador de CONNECT AI WORLD para sustituir el cerebro PPO por un modelo de lenguaje en la toma de decisiones de locomoción.
- Evaluación de robustez ante prompts: al recibir el estado como texto, permite estudiar cómo afectan perturbaciones en la descripción del estado a la política de decisión.
- Prototipado rápido de agentes de decisión: al ser un adaptador de tamaño mínimo sobre un modelo de 0,8B, se puede cargar y probar en hardware modesto para experimentar con variantes de la tarea `choose_object`.
- Generación de datos sintéticos de decisión: el modelo puede emplearse para etiquetar observaciones textuales en pipelines de imitación, siempre que se valide contra el profesor original.
- Benchmark de métodos PEFT: útil como caso de estudio de LoRA aplicado a una tarea de control de baja dimensionalidad con salida discreta.

## Benchmarks y rendimiento

Resultados reportados en la model card (evaluación sobre 105 problemas de test y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio por episodio exitoso |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 7,7 s |
| Antes del entrenamiento | 86,7% | 100% | 0% | 7,7 s |
| Aprendizaje supervisado | 100,0% | 100% | 0% | 7,7 s |
| Ajuste con refuerzo | 100,0% | 100% | 0% | 7,7 s |

Nota: la evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el modelo robótico ni con la red neuronal de marcha real; el autor advierte que los resultados pueden diferir de los obtenidos en MuJoCo web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo base de 0,8B, la huella es reducida (del orden de 2–4 GB en fp16 para el modelo base, estimación orientativa no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; cualquier GPU consumer con suficiente VRAM para un modelo de 0,8B debería ser suficiente en teoría.
- ¿Cabe en GPU consumer? Previsiblemente sí, dado el tamaño del modelo base, aunque no se aportan mediciones.
- Opciones de despliegue: la model card muestra carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El tiempo de 7,7 s por episodio corresponde al bucle de simulación, no a la latencia de inferencia del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un adaptador LoRA de dominio muy específico (decisión de locomoción para el robot LINK-01) y no de un modelo de lenguaje de propósito general, por lo que la comparación con LLMs convencionales no resulta significativa. Las alternativas naturales serían el propio cerebro PPO profesor y las variantes supervisada y de RL del mismo adaptador, cuyos resultados se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el modelo solo está entrenado para la tarea `choose_object` del robot LINK-01; fuera de ese contexto su comportamiento no está validado.
- Idioma: la model card declara únicamente coreano; no se garantiza un funcionamiento correcto en otros idiomas.
- Evaluación de caminata aproximada: los resultados de éxito (100%) se obtuvieron con una aproximación 2D basada en tablas de velocidad, no con el simulador físico completo, por lo que pueden no reflejar el comportamiento real.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulación; debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Riesgo de alucinación: aunque la salida está restringida a una letra, no se documentan mecanismos de validación de que la letra devuelta pertenezca al conjunto de opciones ofrecidas.
- Sesgos: no se documentan análisis de sesgo; el modelo hereda los del modelo base Qwen/Qwen3.5-0.8B y los del profesor PPO.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen tiene sus propias condiciones que deben respetarse.
- Sin métricas de latencia ni de throughput publicadas, lo que dificulta estimar su viabilidad en bucles de control en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
