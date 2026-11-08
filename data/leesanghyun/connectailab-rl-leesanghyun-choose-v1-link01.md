# LeeSanghyun/connectailab-rl-leesanghyun-choose-v1-link01

## Resumen

LINK-01 (choose_object) es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario LeeSanghyun en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje generalista: es un "cerebro de decision" que traduce la observacion textual de un robot caminante (objetivo, distancia, direccion, sensores de distancia, velocidad y eleccion previa) en una unica letra que representa la accion a ejecutar durante los siguientes 0,5 segundos. El modelo resuelve un problema muy acotado de toma de decisiones secuenciales en simulacion.

El adaptador se entrena en dos fases: primero imitacion supervisada (SFT) de las respuestas de una politica PPO entrenada en un simulador web (el "profesor" o brain.json), y despues aprendizaje por refuerzo con PPO sobre pares de opciones, usando una penalizacion KL para no alejarse demasiado de la politica de imitacion. El resultado es una politica que, sobre el conjunto de test, coincide con el profesor en el 100 % de los casos.

Es relevante como ejemplo pedagogico de como destilar una politica de RL en un LLM pequeno mediante LoRA y refuerzo, y como caso practico de integracion de modelos de decision en entornos de robotica simulada. Su alcance es estrictamente de investigacion y educacion; no esta pensado para uso general ni para robots reales sin revalidacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | Coreano (ko); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only pequeno. La tarea se formula como una clasificacion de una sola letra entre un conjunto de opciones (4 acciones posibles: `obs26-act4`), con un prompt de sistema que instruye a tratar el texto del estado como datos y a devolver unicamente la letra de la opcion elegida, sin explicacion. La entrada es una representacion textual de la observacion del robot en un instante dado.

El entrenamiento se realizo en dos etapas. Primero, un profesor PPO entrenado en el simulador web (`choose_object`, curso `random`, precision del 95 % en la prueba oficial) genero un conjunto de problemas: cada 0,5 segundos se registraba la observacion como texto y la accion elegida como respuesta, incluyendo un 20 % de casos en los que el profesor se desvio del camino. Con esos datos se hizo imitacion supervisada (LoRA). Despues se aplico refuerzo con PPO usando como recompensa el retorno obtenido si el profesor continuaba caminando tras la opcion elegida, con una restriccion KL para mantener la politica cerca de la de imitacion. Los tamanos de dataset son 1274 ejemplos de entrenamiento, 75 de validacion y 138 de test.

## Capacidades

- Toma de decisiones discretas en un entorno de robot caminante simulado: dado un estado textual, devuelve una letra de accion entre las opciones presentadas.
- Formato de salida estricto: una sola letra, sin explicacion, tal como exige el prompt de sistema.
- Tratamiento del texto de estado como datos, no como instrucciones (prompt disenado para resistir inyeccion de instrucciones en el estado).
- Coincidencia con la politica profesora del 100 % en el conjunto de test (segun la model card).
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni razonamiento general.
- Capacidad multilingue limitada al coreano en el entrenamiento; el modelo base es multilingue, pero el adaptador esta especializado en la tarea coreana.

## Casos de uso

- Investigacion en destilacion de politicas RL: usar el adaptador como referencia para estudiar como un LLM pequeno puede imitar una politica PPO y mejorarla con refuerzo, comparando SFT frente a PPO.
- Educacion en aprendizaje por refuerzo: el par profesor/alumno y el notebook de Colab permiten reproducir el pipeline completo (generacion de datos, LoRA, PPO) en un entorno controlado.
- Simulacion de robot caminante: integrar el modelo como modulo de decision en un simulador 2D para evaluar la coherencia de las acciones con la politica original.
- Generacion de datos sinteticos de decision: usar el modelo para producir secuencias de acciones etiquetadas sobre estados sinteticos, utiles para aumentar datasets de robotica simulada.
- Evaluacion de robustez ante inyeccion de instrucciones: el prompt de sistema esta disenado para tratar el estado como datos, lo que permite probar ataques de prompt injection en entornos de decision.
- Prototipado rapido de agentes de decision en videojuegos o entornos grid: el formato de salida de una letra y el contexto corto lo hacen adecuado para bucles de control de baja latencia.
- Benchmark de eficiencia de LoRA en modelos de 0,8 B: medir coste de inferencia y calidad de imitacion en un caso de clasificacion de acciones.

## Benchmarks y rendimiento

Datos publicados en la model card (tarea `choose_object`, curso `random`, 20 partidas con semillas 91001-91020):

| Modelo | Precision en test (coincidencia con el profesor) | Exito en 20 partidas | Partidas con colision | Tiempo medio de exito |
|---|---|---|---|---|
| Profesor (PPO) | 100,0 % | 100 % | 0 % | 8,5 s |
| Antes del entrenamiento | 71,7 % | 60 % | 0 % | 8,7 s |
| SFT (imitacion) | 100,0 % | 100 % | 0 % | 8,5 s |
| RL (PPO) | 100,0 % | 100 % | 0 % | 8,5 s |

Nota: la evaluacion de caminata se realizo con una aproximacion 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del simulador web.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,8 B de parametros; en fp16 ocupa aproximadamente 1,6 GB y en cuantizacion de 4 bits alrededor de 0,5 GB. El adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente. Para despliegue en servidor, A100 o H100 no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card), llama.cpp u Ollama tras fusionar el adaptador con el modelo base, y vLLM o TGI si se fusionan los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, la latencia por token deberia ser de pocos milisegundos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 choose_object (este) | Adaptador sobre 0,8 B | No disponible | Decision robotica simulada | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | LLM generalista | No disponible | Hugging Face |
| connectailab-rl-LeeSanghyun-v1-teacher | No disponible | No disponible | Politica PPO (profesor) | Apache 2.0 | Hugging Face |
| connectailab-rl-LeeSanghyun-v7-teacher | No disponible | No disponible | Politica PPO de juego | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion y educacion: la propia model card advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Alcance muy restringido: solo resuelve la tarea `choose_object` con 4 acciones; no es un LLM de proposito general.
- Evaluacion de caminata aproximada: los resultados de exito se obtuvieron con una tabla de velocidades 2D, no con MuJoCo, por lo que pueden no reproducirse en el simulador real.
- Riesgo de sobreajuste al profesor: la coincidencia del 100 % con la politica PPO puede indicar imitacion casi perfecta y poca capacidad de generalizacion fuera de la distribucion de entrenamiento.
- Idioma: entrenado en coreano; el rendimiento en castellano u otros idiomas no esta documentado.
- Sesgos: no se documentan sesgos especificos, pero al derivar de una politica entrenada en un simulador concreto, hereda las limitaciones de ese entorno.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos publicados de latencia, throughput ni consumo de memoria en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeSanghyun/connectailab-rl-leesanghyun-choose-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Simulador web de robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo profesor v1: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v1-teacher
- Modelo profesor v7: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v7-teacher
