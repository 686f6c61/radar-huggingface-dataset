# LeeSanghyun/connectailab-rl-leesanghyun-v2-link01

## Resumen

connectailab-rl-leesanghyun-v2-link01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor LeeSanghyun en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "modelo de toma de decisiones" para el robot simulado LINK-01: recibe en texto el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que codifica cómo debe caminar durante los siguientes 0,5 segundos.

El modelo se entrena en dos fases. Primero, un "cerebro" PPO (política de reinforcement learning) se entrena en un simulador web de caminata para la tarea `avoid_obstacles`; después se genera un corpus de 3.798 ejemplos de entrenamiento, 249 de validación y 376 de test convirtiendo cada observación del cerebro en texto y cada acción en la etiqueta correcta. Sobre ese corpus se aplica un ajuste supervisado con LoRA y, posteriormente, un refinamiento por refuerzo con anclaje KL, usando la recompensa que habría obtenido el cerebro al continuar la caminata desde cada opción.

Su relevancia es acotada pero interesante: demuestra un pipeline completo de destilación de una política RL en un modelo de lenguaje pequeño (0,8B parámetros) con LoRA, con métricas reproducibles (92,0% de coincidencia con el profesor en test, 100% de éxito en 20 episodios de evaluación). Es un artefacto de investigación y educación, no un componente listo para producción robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | coreano (ko) según la model card; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros, mediante LoRA. El entrenamiento sigue un pipeline de destilación de política: (1) un cerebro PPO se entrena en el simulador web de CONNECT AI WORLD para la tarea `avoid_obstacles`, con el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y el curso `58e88ecf`, alcanzando un 95% en el examen oficial; (2) se generan pares observación-texto → acción cada 0,5 segundos durante la caminata del cerebro, incluyendo un 20% de ejemplos donde el robot se desvió al elegir otra opción; (3) ajuste supervisado con LoRA; (4) refinamiento por refuerzo donde cada opción se puntúa con la recompensa que habría obtenido el cerebro al continuar desde ella, con anclaje KL al modelo supervisado.

El corpus resultante tiene 3.798 ejemplos de entrenamiento, 249 de validación y 376 de test. La tasa de coincidencia entre la representación textual y la decisión del cerebro (techo de acierto) es del 99%, lo que indica que la conversión a texto preserva casi toda la información relevante de la observación.

## Capacidades

- Toma de decisiones discretas: dado un estado textual del robot LINK-01, devuelve exactamente una letra entre las opciones listadas (5 acciones posibles según el contrato `act5`).
- Razonamiento sobre estado estructurado: interpreta distancias, direcciones, lecturas de sensores y velocidad previa como datos, no como instrucciones.
- Salida restringida: el prompt de sistema fuerza a responder solo con la letra, sin explicación, lo que facilita el parseo en un bucle de control.
- Robustez ante instrucciones embebidas: el prompt de sistema indica explícitamente tratar el contenido del estado como datos, mitigando inyección de prompt desde la observación.
- Capacidad multilingüe limitada: etiquetado como coreano; el prompt de sistema está en inglés.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de destilación RL → LLM: el pipeline completo (PPO → corpus textual → SFT con LoRA → RL con KL) sirve como ejemplo reproducible en cursos de reinforcement learning y ajuste fino, con notebook de Colab incluido.
- Control de robot simulado en entornos educativos: integrado en el bucle de LINK-01 dentro del simulador web, sustituye al cerebro PPO para decidir la siguiente acción de caminata cada 0,5 segundos.
- Investigación en políticas discretas textualizadas: permite estudiar cómo de bien un LLM de 0,8B aproxima una política RL cuando el estado se serializa a texto, comparando SFT frente a RL.
- Evaluación de robustez frente a inyección de prompt: el diseño con estado tratado como datos permite experimentar con observaciones adversariales en un dominio acotado.
- Prototipado de agentes con salida restringida: útil para probar formatos de respuesta de una sola letra y parseo determinista en pipelines de decisión.
- Base para adaptadores similares en otras tareas: el contrato `link01-decision/...` y la herramienta `connect_tycoon.link01.questions` permiten replicar el enfoque en otras tareas de decisión del mismo entorno.
- Referencia comparativa para otros adaptadores de la familia: útil para contrastar variantes como `connectailab-rl-LeeSanghyun-v13-teacher` o `connectailab-rl-lee-hyunju-v1-link01`.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre el conjunto de test de 376 problemas y sobre 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0% | 100% | 0% | 26,6 s |
| Modelo base sin ajuste | 34,0% | 0% | 10% | — |
| Ajuste supervisado (LoRA) | 92,0% | 100% | 0% | 26,7 s |
| Refinamiento por RL | 91,5% | 100% | 0% | 26,8 s |

Nota: la evaluación de caminata usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo real, por lo que los resultados pueden diferir de la simulación física completa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,8B parámetros; en FP16 requiere aproximadamente 1,6 GB solo para pesos, más overhead de activaciones y caché KV. El adaptador LoRA añade un consumo marginal.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente en FP16; en cuantización de 8 o 4 bits cabe en GPUs integradas o incluso en CPU.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en Apple Silicon y CPU con llama.cpp u Ollama si se exporta a GGUF.
- Opciones de despliegue: transformers + peft (flujo documentado), vLLM o TGI tras fusionar el adaptador con el base, llama.cpp u Ollama si se convierte a GGUF. El despliegue documentado es exclusivamente con transformers y peft.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo y la salida de un solo token, la latencia esperada es baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-leesanghyun-v2-link01 | 0,8B base + LoRA | no disponible | 92,0% test / 100% éxito en 20 episodios | Apache 2.0 | Hugging Face (0 descargas) |
| connectailab-rl-LeeSanghyun-v13-teacher | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| connectailab-rl-lee-hyunju-v1-link01 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | 34,0% en la tarea de decisión sin ajuste | no disponible | Hugging Face |

La comparativa con modelos de propósito general no es significativa: este adaptador resuelve una tarea de decisión muy específica y no compite en benchmarks estándar como MMLU o HumanEval.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo resuelve la tarea `avoid_obstacles` del robot LINK-01 en el simulador; no generaliza a otros robots, entornos ni tareas sin reentrenamiento.
- Evaluación aproximada: la métrica de caminata usa una tabla de velocidades 2D, no el simulador MuJoCo real, por lo que el éxito reportado puede no trasladarse a física completa.
- Advertencia explícita del autor: es un modelo de investigación y educación; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Riesgo de alucinación: aunque la salida está restringida a una letra, el modelo podría devolver una opción no listada o texto adicional si el prompt no se respeta; el parseo debe validar la salida.
- Sesgo de destilación: reproduce los sesgos y errores del cerebro PPO profesor, incluidos los ejemplos del 20% donde el robot se desvió.
- Idiomas: etiquetado solo para coreano; el prompt de sistema en inglés puede degradar el comportamiento si se traduce o se modifica.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.5-0.8B debe verificarse por separado.
- Sin métricas de latencia ni throughput publicadas, lo que dificulta planificar su integración en bucles de control con requisitos temporales estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeSanghyun/connectailab-rl-leesanghyun-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de reinforcement learning: https://www.aicitybuilders.com/robot
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Variante relacionada: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v13-teacher
- Variante relacionada: https://huggingface.co/ianrua/connectailab-rl-lee-hyunju-v1-link01
