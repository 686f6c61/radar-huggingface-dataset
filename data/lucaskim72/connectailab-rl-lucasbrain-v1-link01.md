# lucaskim72/connectailab-rl-lucasbrain-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario lucaskim72 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje generalista: es un "cerebro de decision" destilado para una tarea concreta de robotica simulada, `avoid_obstacles`, en la que un robot caminante debe elegir, cada 0,5 segundos, una de cinco acciones de movimiento (obs21-act5) a partir de una observacion textualizada (distancia al objetivo, direccion, sensores de distancia, velocidad y eleccion previa).

El modelo resuelve el problema de trasladar una politica de aprendizaje por refuerzo (PPO entrenada en un simulador web tipo MuJoCo) a un formato de lenguaje natural, de modo que un LLM pequeno pueda emitir la misma decision que la "mente" original expresada como una unica letra de opcion. El pipeline combina aprendizaje supervisado (imitacion de las respuestas del cerebro PPO) y un paso posterior de RL con PPO y anclaje KL para afinar la preferencia entre opciones.

Su relevancia es mas educativa y de investigacion que de produccion: demuestra como destilar una politica de RL en un adaptador de 0,8B con licencia Apache 2.0, y sirve como ejemplo reproducible de RL aplicado a toma de decisiones. El rendimiento reportado es modesto (43,0 % de coincidencia con el cerebro y 0 % de exito en la evaluacion de caminata de 20 episodios), por lo que debe tratarse como un experimento docente, no como un sistema desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara numero de parametros; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros, mediante LoRA. La tarea esta formulada como clasificacion de una sola letra entre cinco opciones, con un prompt de sistema que instruye a tratar el contenido del estado como datos y a devolver unicamente la letra seleccionada.

El entrenamiento tiene tres fases descritas por el autor: (1) se entrena una politica PPO en el simulador web (tarea `avoid_obstacles`, contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `e0b659d0`, 85 % en la prueba oficial); (2) se genera un dataset de 1.047 ejemplos de entrenamiento, 188 de validacion y 279 de test, convirtiendo cada observacion cada 0,5 s en un problema textual con la respuesta del cerebro como etiqueta, incluyendo un 20 % de ejemplos con desviaciones; (3) se aplica aprendizaje supervisado (LoRA) y despues RL con PPO y anclaje KL, usando como recompensa el retorno que habria obtenido el cerebro si hubiera continuado desde esa opcion. La evaluacion final se realiza colocando el modelo en el puesto de decision del robot y caminando 20 episodios con semillas 91001-91020, usando una aproximacion 2D de la marcha basada en una tabla de velocidades por comando (sin red neuronal de marcha ni modelo fisico del robot).

## Capacidades

- Clasificacion de decision discreta: elige exactamente una de cinco opciones (letras) a partir de un estado textual del robot.
- Razonamiento de un solo paso sobre observaciones estructuradas (distancias, direccion, sensores, velocidad, accion previa).
- Instruccion estricta de salida: devuelve solo la letra, sin explicacion.
- Capacidad multilingue limitada: declarado para coreano; el prompt de sistema esta en ingles.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidad heredada del modelo base no verificada en esta ficha (no hay benchmarks del adaptador para tareas generales).

## Casos de uso

- Docencia de RL y destilacion: usar el adaptador como ejemplo reproducible de como convertir una politica PPO en un modelo de lenguaje pequeno con LoRA, siguiendo el notebook de Colab enlazado.
- Investigacion en imitacion de politicas: comparar la fidelidad de la imitacion supervisada frente al refinamiento con PPO y KL, usando el conjunto de test de 279 ejemplos.
- Simulacion de robot caminante en entornos web: integrar el adaptador en el simulador `ezerai.xyz/robot-lab/world/` para evaluar decisiones de evitacion de obstaculos en un bucle de 0,5 s.
- Generacion de datasets sinteticos de decision: emplear el pipeline `connect_tycoon.link01.questions` para producir pares observacion-respuesta a partir de trayectorias del cerebro.
- Prototipado de interfaces lenguaje-accion: estudiar como un LLM de 0,8B puede mapear estados numericos a comandos discretos en un formato legible por humanos.
- Educacion en agentes embodied: usar el modelo como "cerebro" de bajo coste en talleres de robotica simulada, con la advertencia explicita de revalidar antes de pasar a hardware real.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (evaluacion con 20 episodios en el curso `e0b659d0`, semillas 91001-91020):

| Modelo | Acierto en test (misma respuesta que el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 5 % | 20,8 s |
| Antes del entrenamiento | 33,7 % | 0 % | 0 % | — |
| Aprendizaje supervisado | 43,0 % | 0 % | 95 % | — |
| Refinamiento con RL (modelo publicado) | 43,0 % | 0 % | 95 % | — |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La evaluacion de marcha es una aproximacion 2D basada en una tabla de velocidades por comando, no una simulacion fisica completa, por lo que los resultados pueden diferir de los obtenidos en MuJoCo web.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es minimo; el modelo base de 0,8B en FP16 ocupa aproximadamente 1,6 GB de pesos, y en cuantizacion de 8 bits alrededor de 0,8-1 GB. La VRAM total depende del runtime (KV cache y overhead), tipicamente 2-4 GB en FP16.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM/TGI tras fusionar los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo base y la salida de un solo token, la latencia esperada es baja, pero no se aportan medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparativa se limita a los modelos del propio experimento:

| Modelo | Parametros | Contexto | Acierto test | Exito 20 episodios | Licencia |
|---|---|---|---|---|---|
| LINK-01 (este adaptador) | 0,8B base + LoRA | No disponible | 43,0 % | 0 % | Apache 2.0 |
| Cerebro PPO (profesor) | Politica RL (no LLM) | No aplica | 100,0 % | 100 % | No disponible |
| Qwen3.5-0.8B sin adaptador | 0,8B | No disponible | 33,7 % | 0 % | No disponible |

No se identifican en la informacion disponible otros adaptadores de decision para robotica comparables con este.

## Limitaciones y advertencias

- Rendimiento limitado: el modelo publicado acierta el 43,0 % de las decisiones del cerebro y no completa ningun episodio en la evaluacion de 20 caminatas; el refinamiento con RL no mejoro el resultado respecto al aprendizaje supervisado en las metricas reportadas.
- Evaluacion simplificada: la marcha se mide con una tabla 2D de velocidades por comando, sin modelo fisico ni red de marcha, por lo que los resultados no equivalen a una simulacion MuJoCo completa.
- Dominio muy restringido: solo cubre la tarea `avoid_obstacles` con el contrato `obs21-act5`; no es un modelo de proposito general.
- Idioma: declarado unicamente para coreano, aunque el prompt de sistema esta en ingles; el soporte real de otros idiomas no esta verificado.
- Riesgo de alucinacion en la salida: al ser un clasificador de letras, puede emitir opciones no validas o texto adicional si el prompt no se respeta estrictamente.
- Uso en robotica real: el autor advierte explicitamente que es un modelo de investigacion y educacion en simulador y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso fisico.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero deben respetarse las condiciones del modelo base Qwen/Qwen3.5-0.8B, cuya licencia no se detalla en la informacion proporcionada.
- Sin soporte documentado de tool calling, agentes multi-paso, vision ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
