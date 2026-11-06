# allapp/connectailab-rl-jay-v1-link01

## Resumen

connectailab-rl-jay-v1-link01 es un adaptador LoRA publicado por el usuario allapp sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un modelo de decisión entrenado para controlar el robot simulado LINK-01 en la tarea `follow_route`: recibe una descripción textual del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica la acción de locomoción para los siguientes 0,5 segundos.

El desarrollo se enmarca en el proyecto CONNECT TYCOON / CONNECT AI LAB, donde primero se entrena una política PPO en un entorno web de aprendizaje por refuerzo (el "cerebro", exportado como brain.json) y después se destila ese comportamiento en un modelo de lenguaje mediante aprendizaje supervisado (LoRA) y un posterior ajuste con refuerzo con anclaje KL. El objetivo es que un modelo lingüístico reproduzca las decisiones de la política PPO a partir de la representación textual de la observación, lo que permite integrar la toma de decisiones en un pipeline basado en transformers.

El modelo es relevante como ejemplo pedagógico de destilación de políticas de RL en LLM y de uso de modelos pequeños (0,8B parámetros) para tareas de decisión estructurada con salida restringida a un conjunto cerrado de opciones. Su ámbito es la investigación y la educación en simulación; el propio autor advierte que debe revalidarse antes de usarlo en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-0.8B) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros, sobre el que se aplica un adaptador LoRA entrenado con la librería PEFT. El pipeline declarado es reinforcement-learning, con tags que incluyen deep-reinforcement-learning, ppo, robotics y decision-making. La tarea concreta es `follow_route`, con el contrato de observación `link01-decision/follow_route/obs16-act5/walker51-14/v1`: 16 dimensiones de observación y 5 acciones posibles, sobre el curso `random`.

El proceso de entrenamiento consta de cuatro fases según la model card. Primero se entrena una política PPO en el entorno web (con una tasa de éxito del 90% en el examen oficial de la tarea). Después se construye un conjunto de problemas convirtiendo cada 0,5 segundos la observación del robot en texto, con la respuesta de la política como etiqueta; se incluye un 20% de ejemplos con desviaciones del camino para cubrir situaciones fuera de la trayectoria óptima. Sobre ese corpus (899 ejemplos de entrenamiento, 192 de validación y 286 de test) se aplica aprendizaje supervisado con LoRA. Finalmente se realiza un ajuste con refuerzo: para cada opción se calcula la recompensa que habría obtenido si el resto de la trayectoria la hubiera seguido la política PPO, se suben las opciones mejores que la del profesor y se bajan las peores, con una penalización KL que mantiene el adaptador cerca de la distribución supervisada. La tasa de acuerdo entre la representación textual y la política original (techo de acierto) se sitúa en el 99%.

## Capacidades

- Decisión de locomoción en un espacio de acciones discreto de 5 opciones para la tarea `follow_route`, devolviendo exactamente una letra como salida.
- Interpretación de observaciones textuales estructuradas con 16 campos (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa).
- Salida restringida y determinista en formato: una única letra entre las opciones listadas, sin explicación, según el system prompt indicado por el autor.
- Robustez parcial ante desviaciones del camino, gracias al 20% de ejemplos con acciones subóptimas incluidas en el corpus de entrenamiento.
- Capacidad multilingüe limitada al coreano en la documentación y los ejemplos de la model card.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Docencia de destilación de políticas RL en LLM: el modelo sirve como ejemplo completo de cómo convertir una política PPO en un adaptador LoRA y evaluar la fidelidad de la destilación con un conjunto de test separado.
- Investigación en decisión estructurada con salida restringida: útil para estudiar cómo un modelo de 0,8B se comporta cuando la respuesta debe ser una de cinco opciones y el formato de salida está fuertemente constreñido.
- Simulación de agentes en entornos grid o de rutas: el adaptador puede conectarse a un simulador 2D que traduzca las observaciones del agente al formato de 16 campos y ejecute la letra devuelta como acción de 0,5 segundos.
- Evaluación de técnicas de ajuste con refuerzo con anclaje KL: el par supervisado/RL del proyecto permite comparar el efecto del RL sobre un adaptador LoRA ya entrenado, con métricas de acuerdo con el profesor y de éxito en episodios.
- Generación de datos sintéticos de decisión: el modelo puede producir trayectorias de acciones etiquetadas a partir de estados textuales para aumentar corpus de entrenamiento de otros agentes.
- Pruebas de integración de PEFT en pipelines de transformers: al ser un adaptador pequeño sobre un modelo de 0,8B, es adecuado para validar flujos de carga con `PeftModel.from_pretrained` y despliegues ligeros en entornos de CI.
- Prototipado educativo en robótica simulada: permite montar una demo de robot que "lee" su estado en lenguaje natural y responde con una acción, sin necesidad de una red de caminata completa.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes:

| Modelo | Acierto en test (misma respuesta que la política) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0% | 100% | 0% | 19,8 s |
| Modelo antes del entrenamiento | 29,4% | 0% | 0% | no disponible |
| Aprendizaje supervisado (LoRA) | 85,0% | 100% | 0% | 20,0 s |
| Ajuste con refuerzo (este modelo) | 85,3% | 100% | 0% | 19,8 s |

El propio autor indica que la evaluación de la marcha se realizó con una aproximación 2D basada en una tabla de velocidades medidas por comando, sin red neuronal de locomoción, por lo que los resultados pueden diferir de los obtenidos en el simulador MuJoCo web. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0,8B parámetros más un adaptador LoRA, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder alojar el modelo base en precisión completa o cuantizado, pero esta estimación no está confirmada por el autor.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,8B), aunque no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: transformers con PEFT (`AutoModelForCausalLM` + `PeftModel.from_pretrained`), tal como se documenta en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1-link01 | 0,8B (base) + LoRA | no disponible | Decisión de locomoción `follow_route` (5 acciones) | apache-2.0 | Hugging Face (14 descargas) |
| Política PPO original (brain.json) | no aplica (tabla de política) | no aplica | Misma tarea `follow_route` | no disponible | Incluida en el proyecto CONNECT TYCOON |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | Lenguaje general | no disponible | Hugging Face |

No se dispone de información sobre otros adaptadores o modelos de decisión comparables en la documentación proporcionada. La comparación más directa es con la política PPO que sirve de profesor, que obtiene un 100% de acierto en el test y un 100% de éxito en los 20 episodios, frente al 85,3% y 100% del adaptador.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para la tarea `follow_route` con 5 acciones discretas; no es un modelo de lenguaje de propósito general y no debe usarse como tal.
- El acierto en test (85,3%) está por debajo del techo teórico del 99% y de la política profesora (100%), lo que implica un 14,7% de decisiones distintas a las del profesor.
- La evaluación de la marcha se realizó con una aproximación 2D basada en una tabla de velocidades, no con el simulador MuJoCo completo, por lo que los resultados pueden no trasladarse al entorno real.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio concretos antes de un uso físico.
- El idioma documentado es únicamente coreano; no se garantiza un comportamiento correcto en otros idiomas.
- No se documentan sesgos específicos, pero al derivar de una política entrenada en un curso `random` concreto, su generalización a otras rutas o entornos no está validada.
- La licencia apache-2.0 permite uso comercial, pero la idoneidad técnica para producción no está demostrada y el modelo base Qwen/Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse.
- El repositorio tiene un tamaño de 0,0 GB y solo 14 descargas, lo que sugiere un artefacto de investigación con poca validación externa.
- No se especifican requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allapp/connectailab-rl-jay-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON (código de entrenamiento): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con robots de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno web de aprendizaje del robot LINK-01: https://www.ezerai.xyz/robot-lab/world/
