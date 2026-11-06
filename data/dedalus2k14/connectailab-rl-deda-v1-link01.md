# dedalus2k14/connectailab-rl-deda-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario dedalus2k14 bajo el paraguas del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un "cerebro de decision" destilado: se entrena para leer en texto el estado de un robot simulado (distancia al objetivo, direccion, sensores de distancia, velocidad y accion previa) y responder con una unica letra que representa la siguiente accion de locomocion para los proximos 0,5 segundos. El pipeline declarado es reinforcement-learning y la libreria de publicacion es PEFT.

El modelo se construye en cuatro fases segun la model card: primero se entrena una politica PPO en el simulador web de CONNECT AI WORLD para la tarea `avoid_obstacles`; despues se genera un corpus de pares observacion-texto / accion del cerebro PPO (1200 ejemplos de entrenamiento, 247 de validacion, 394 de test); a continuacion se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B; y finalmente se aplica una fase de RL con restriccion KL para subir la probabilidad de acciones con mayor recompensa y bajar las peores. El resultado es un modelo de 0,8B de parametros con un adaptador de bajo rango, licencia Apache 2.0 y un unico idioma declarado: coreano.

Su relevancia es acotada y muy especifica: demuestra una receta reproducible para convertir una politica de RL en un modelo de lenguaje pequeno que razona sobre observaciones estructuradas y emite decisiones discretas. No compite con modelos de proposito general; su interes esta en el metodo (destilacion de politica PPO a LM via LoRA + RL posterior) y en el dominio (robótica simulada, toma de decisiones por pasos). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-0.8B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B de parametros. El adaptador se entrena en dos etapas: primero ajuste supervisado sobre un corpus de 1200 ejemplos de entrenamiento (247 de validacion, 394 de test) generados a partir de las observaciones y acciones de una politica PPO entrenada en el simulador web; despues una fase de refuerzo con PPO y restriccion KL que recompensa las acciones que, seguidas por el cerebro PPO, producen mayor recompensa, y penaliza las peores. El 20% de los ejemplos de entrenamiento incluyen deliberadamente acciones que desvian al robot del camino, para que el modelo aprenda a distinguir decisiones correctas de incorrectas.

La innovacion tecnica no esta en la arquitectura sino en el pipeline: se destila una politica de RL (PPO) en un LM pequeno mediante un formato de pregunta-respuesta con opciones (situacion, pregunta y lista de opciones), y se refina con RL sobre esa representacion textual. El entrenamiento se realiza sobre la tarea `avoid_obstacles` con el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y el curso `random`. No se especifican en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset original de Qwen3.5-0.8B ni detalles de su RLHF/DPO previo.

## Capacidades

- Decision discreta por paso: dado un estado textual del robot, devuelve una unica letra entre las opciones listadas, sin explicacion.
- Razonamiento sobre observaciones estructuradas: interpreta distancia al objetivo, direccion, lecturas de sensores de distancia, velocidad y accion previa.
- Evitacion de obstaculos en simulacion 2D: tarea principal para la que fue entrenado.
- Seguimiento de instrucciones de formato estricto: respeta el system prompt que exige devolver solo la letra de la opcion elegida.
- Tratamiento de datos como datos: el system prompt indica explicitamente que el texto dentro del estado no debe interpretarse como instrucciones (defensa basica frente a inyeccion de prompt).
- Capacidades multilingues: limitadas al coreano segun la model card; el system prompt de ejemplo esta en ingles, pero no se declara soporte de otros idiomas.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Control de robot simulado en bucle cerrado: el modelo se situa en el lugar de la politica de decision y recibe cada 0,5 segundos el estado del robot para emitir la siguiente accion. Es adecuado porque fue entrenado exactamente para ese formato y esa cadencia.
- Destilacion de politicas RL a modelos de lenguaje: sirve como referencia metodologica para convertir una politica PPO en un LM pequeno que razona sobre observaciones textuales y emite decisiones discretas.
- Prototipado rapido de agentes de decision en simulacion: con 0,8B de parametros y un adaptador LoRA, se puede desplegar en entornos de investigacion sin grandes recursos de computo.
- Educacion y docencia en RL: el pipeline (PPO en simulador, generacion de corpus, SFT con LoRA, RL con KL) es un ejemplo completo y reproducible para cursos de aprendizaje por refuerzo.
- Evaluacion comparativa de estrategias de destilacion: permite medir la brecha entre la politica original (100% de coincidencia consigo misma) y el LM destilado (79,9% en test) en un dominio controlado.
- Investigacion sobre robustez a instrucciones en el estado: el diseno del system prompt permite estudiar como un LM pequeno maneja datos no confiables embebidos en la observacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de la propia tarea, medidos sobre el conjunto de test (394 problemas) y sobre 20 episodios de evaluacion en el mismo curso (semillas 91001-91020):

| Modelo | Acierto en test (misma accion que el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0% | 75% | 45% | 25,9 s |
| Modelo base sin ajuste | 47,0% | 0% | 0% | — |
| Ajuste supervisado (SFT) | 79,9% | 50% | 65% | 25,4 s |
| Refuerzo (RL) | 79,7% | 10% | 100% | 29,5 s |

El techo de acierto (coincidencia maxima alcanzable dado el formato textual) es del 99%. La evaluacion de marcha se realizo con una aproximacion 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo real, por lo que los resultados pueden diferir de los del entorno web. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Para un modelo de 0,8B en precision completa se puede estimar en torno a 2-3 GB, y en cuantizacion de 4 bits por debajo de 1 GB, pero son estimaciones no confirmadas por el autor.
- GPU recomendadas: no especificadas. Por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) deberia poder alojar el modelo base en FP16 o cuantizado.
- Cabe en GPU consumer: si, por el tamano del modelo base (0,8B), aunque no hay confirmacion oficial.
- Opciones de despliegue: la model card solo documenta el uso via `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-deda-v1-link01 | 0,8B + LoRA | no disponible | 79,9% acierto test (SFT); 50% exito en 20 episodios | Apache 2.0 | Hugging Face (0 descargas) |
| Cerebro PPO original (profesor) | no disponible | no aplica | 100% acierto test; 75% exito en 20 episodios | no disponible | Referenciado en la model card, no publicado como modelo |
| Qwen/Qwen3.5-0.8B (base sin ajuste) | 0,8B | no disponible | 47,0% acierto test; 0% exito en 20 episodios | no disponible en la informacion proporcionada | Hugging Face |
| Otros modelos de decision robotica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria (LMs pequenos destilados de politicas RL para robotica simulada) en la documentacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo ha sido entrenado para la tarea `avoid_obstacles` en un simulador 2D concreto; no generaliza a otras tareas, robots ni entornos sin reentrenamiento.
- Idioma limitado al coreano segun la model card; el system prompt de ejemplo esta en ingles, lo que puede generar inconsistencias si se usa en otros idiomas.
- Brecha respecto al profesor: el mejor resultado (SFT) alcanza el 79,9% de coincidencia con el cerebro PPO en test, frente al 100% del profesor; la fase de RL empeora el exito en episodios (10% frente al 50% del SFT) y aumenta las colisiones al 100%.
- Evaluacion aproximada: la marcha se midio con una tabla de velocidades 2D, no con MuJoCo real, por lo que los resultados pueden no trasladarse al simulador web ni a un robot fisico.
- Riesgo de alucinacion: el modelo puede devolver una letra no listada o texto adicional si el formato del prompt no se respeta estrictamente; el system prompt exige devolver solo la letra.
- Riesgo de inyeccion de prompt: aunque el system prompt indica tratar el estado como datos, un LM de 0,8B tiene capacidad limitada para resistir instrucciones maliciosas embebidas en la observacion.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la model card indica explicitamente que es un modelo de investigacion y educacion sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Sin datos de benchmarks estandar ni de contexto maximo; no apto para tareas de lenguaje general.
- Repositorio sin adopcion (0 descargas, 0 likes) y creado en noviembre de 2026; no hay evidencia de mantenimiento ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dedalus2k14/connectailab-rl-deda-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje (CONNECT AI WORLD): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con robots: https://www.aicitybuilders.com/robot
