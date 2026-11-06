# gutgai/connectailab-rl-sirius-v3-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por gutgai en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" destilado para una tarea muy concreta: dado el estado textual de un robot de navegación 2D (distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa), devolver una única letra que codifica cómo debe caminar durante los siguientes 0,5 segundos. El espacio de acciones es de cinco opciones (obs16-act5) y la tarea se denomina `follow_route`.

El modelo se construye en dos fases. Primero se entrena una política PPO en un entorno de aprendizaje web (el "cerebro" o `brain.json`) que alcanza un 85 % de éxito en el curso `random`. Después, se generan pares observación-texto → acción a partir de las trayectorias de ese cerebro (1154 ejemplos de entrenamiento, 284 de validación y 380 de test) y se ajusta el modelo Qwen3.5-0.8B mediante LoRA con supervisión, seguido de una etapa de refuerzo con restricción KL que premia las acciones con mayor recompensa esperada según el cerebro profesor.

Su relevancia es acotada pero instructiva: muestra un pipeline completo de destilación de políticas de refuerzo hacia modelos de lenguaje pequeños (0,8B parámetros), con evaluación tanto en precisión de decisión (75,8 % de coincidencia con el profesor) como en éxito de navegación end-to-end (85 % en 20 episodios), y demuestra que un LM de menos de mil millones de parámetros puede sustituir a una política neuronal en un bucle de decisión de robótica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-0.8B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | coreano (ko), según el campo `language`; las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. Sobre él se aplica un adaptador LoRA entrenado en dos etapas. La primera es un ajuste supervisado (SFT) sobre 1154 ejemplos de entrenamiento generados a partir de las trayectorias de una política PPO entrenada en el simulador web `follow_route`; cada ejemplo convierte la observación del robot (16 dimensiones) en un problema textual con situación, pregunta y cinco opciones, y la respuesta correcta es la acción elegida por el cerebro profesor. Un 20 % de los ejemplos corresponden a situaciones en las que el cerebro se desvió de la ruta, para que el modelo aprenda a recuperarse.

La segunda etapa es un ajuste por refuerzo con PPO sobre el propio LM, donde la recompensa de cada opción se estima como el retorno que habría obtenido el cerebro profesor si hubiera ejecutado esa acción y continuado después con su propia política. Se añade una penalización KL para mantener el modelo cerca de la distribución del SFT y evitar colapso. No se especifican el número de tokens de entrenamiento del modelo base, la composición del corpus original de Qwen3.5-0.8B ni detalles de su alineamiento previo (RLHF/DPO), por lo que esa información debe consultarse en la model card del modelo base.

## Capacidades

- Toma de decisiones discretas en un espacio de cinco acciones (letras) para la tarea `follow_route` de navegación 2D.
- Interpretación de observaciones estructuradas en texto: distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa.
- Salida restringida a una única letra, sin explicación, lo que facilita su integración en bucles de control de baja latencia.
- Capacidad de recuperación parcial ante desviaciones de ruta, gracias al 20 % de ejemplos de "fuera de curso" incluidos en el SFT.
- Soporte de instrucciones de sistema para delimitar el rol y el formato de salida (por ejemplo, tratar el texto del estado como datos y no como instrucciones).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada: el ajuste está orientado a coreano y a las plantillas de pregunta del proyecto `connect_tycoon`.

## Casos de uso

- **Sustitución de la política PPO por un LM en el bucle de control**: el modelo puede reemplazar a `brain.json` en el simulador web de LINK-01, devolviendo una acción cada 0,5 segundos a partir del estado textual del robot; es adecuado porque reproduce el 75,8 % de las decisiones del profesor y mantiene el 85 % de éxito en 20 episodios.
- **Docencia de pipelines de RL + destilación**: sirve como ejemplo reproducible (notebook de Colab incluido) para enseñar cómo se pasa de una política PPO a un adaptador LoRA con SFT y RL; su tamaño de 0,8B permite ejecutarlo en portátiles y entornos gratuitos.
- **Prototipado rápido de agentes de decisión en robótica simulada**: antes de entrenar una política desde cero, se puede adaptar este esquema a nuevas tareas (por ejemplo, `follow_route` con otros mapas) y comparar el LM contra el profesor en precisión y éxito.
- **Evaluación de robustez ante instrucciones maliciosas en el estado**: el prompt de sistema instruye explícitamente a tratar el contenido del estado como datos, lo que permite estudiar cómo un LM pequeño resiste inyecciones de prompt en entradas estructuradas de un robot.
- **Generación automática de datos de entrenamiento**: el modelo puede usarse para etiquetar observaciones nuevas con acciones plausibles y ampliar el conjunto de datos del cerebro PPO en tareas de imitación.
- **Investigación en RLHF/RL sobre LMs pequeños**: la combinación de SFT + PPO con KL sobre un modelo de 0,8B es un banco de pruebas asequible para estudiar estabilidad y recompensas derivadas de una política externa.
- **Integración en entornos de simulación educativos** (MuJoCo web, AI CITY BUILDERS): permite a estudiantes conectar un LM a un robot virtual sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación sobre 380 problemas de test y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0 % | 85 % | 0 % | 24,1 s |
| Modelo base sin ajuste | 51,1 % | 0 % | 0 % | — |
| Tras SFT (LoRA) | 75,3 % | 70 % | 0 % | 24,0 s |
| Tras RL (versión publicada) | 75,8 % | 85 % | 0 % | 24,1 s |

Nota: la evaluación de caminata se realiza con una aproximación 2D basada en una tabla de velocidades por comando, no con el robot MuJoCo real, por lo que los resultados pueden diferir ligeramente de la simulación física completa. No se han publicado resultados en benchmarks estándar de LM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 0,8B en precisión FP16, requiere aproximadamente 1,6 GB para los pesos del modelo base más el adaptador LoRA; en cuantización de 8 bits, en torno a 0,8–1 GB; en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias y aportarían poco por el tamaño reducido del modelo.
- **¿Cabe en GPU consumer?**: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU con llama.cpp u Ollama para prototipos.
- **Opciones de despliegue**: transformers + PEFT (el método documentado en la model card), vLLM, TGI, llama.cpp y Ollama (previa conversión del adaptador a GGUF), siempre que se respete el formato de salida de una sola letra.
- **Latencia y throughput**: no se han publicado medidas. Dado el tamaño del modelo y la salida de un único token, se espera una latencia muy baja (del orden de milisegundos en GPU consumer), pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-sirius-v3-link01 | 0,8B (base) + LoRA | no disponible | Decisión de navegación 2D (5 acciones) | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LM de propósito general | no disponible en la información | Hugging Face |
| Cerebro PPO `brain.json` (profesor) | no disponible | no aplica | Decisión de navegación 2D (5 acciones) | no disponible | Repositorio CONNECT TYCOON |
| Políticas PPO estándar en robótica simulada | típicamente < 1M | no aplica | Control continuo/discreto | variable | Repositorios de investigación |

No se dispone de información sobre otros modelos comparables de la misma categoría (LM destilados de políticas de RL para robótica) en la documentación proporcionada.

## Limitaciones y advertencias

- **Alcance muy restringido**: el modelo solo está entrenado para la tarea `follow_route` con 16 dimensiones de observación y 5 acciones; no es un LM de propósito general y fallará fuera de ese formato.
- **Brecha con el profesor**: reproduce el 75,8 % de las decisiones del cerebro PPO, no el 100 %; en producción esto puede traducirse en desviaciones de ruta no detectadas.
- **Evaluación aproximada**: la métrica de éxito se obtiene con una tabla de velocidades 2D, no con el robot MuJoCo real; los resultados pueden no transferirse a simulación física completa ni a robots reales.
- **Idioma**: el ajuste está orientado a coreano y a las plantillas del proyecto; el rendimiento en castellano u otros idiomas no está evaluado.
- **Riesgo de inyección de prompt**: aunque el prompt de sistema indica tratar el estado como datos, un LM pequeño puede verse influido por texto malicioso en la observación; conviene sanear las entradas antes de pasarlas al modelo.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado; el autor no la detalla en la model card.
- **Advertencia del autor**: es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- **Sin datos de sesgo**: no se han publicado análisis de sesgos ni evaluaciones de seguridad del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutgai/connectailab-rl-sirius-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
