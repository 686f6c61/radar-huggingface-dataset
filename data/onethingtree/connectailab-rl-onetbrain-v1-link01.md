# onethingtree/connectailab-rl-onetbrain-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado por onethingtree (CONNECT AI LAB) para actuar como modulo de toma de decisiones de un robot simulado llamado LINK-01. El modelo recibe una descripcion textual del estado del robot (distancia y direccion al objetivo, lecturas del sensor de distancia, velocidad y accion previa) y devuelve una unica letra que representa la accion de locomocion a ejecutar durante los siguientes 0,5 segundos. No es un modelo de proposito general: es un componente especializado dentro de un bucle de control.

El entrenamiento combina dos fases. Primero se entrena una politica PPO en un simulador web (un "cerebro" que camina) y despues se destila ese comportamiento en el modelo de lenguaje mediante aprendizaje supervisado (LoRA) y una fase posterior de aprendizaje por refuerzo con restriccion KL. El objetivo declarado es sustituir la red neuronal de la politica por un modelo de lenguaje capaz de razonar sobre el estado en formato textual, manteniendo la tasa de exito de la politica original.

La relevancia de esta ficha es limitada fuera de su nicho: se trata de un modelo de investigacion y educacion, con 15 descargas, sin likes y con un repositorio de 0,0 GB (el adaptador LoRA es muy pequeno). Su interes esta en el enfoque metodologico (destilacion de politicas RL en LLM mediante texto) mas que en sus capacidades como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen3.5-0.8B) |
| Parametros totales | No disponible (el adaptador LoRA no declara su numero de parametros; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con la libreria PEFT sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador no modifica la arquitectura del modelo base; anade matrices de bajo rango en las capas del transformer para especializar la generacion hacia la tarea de decision. La entrada es un prompt con instrucciones de sistema fijas ("Evaluate the supplied decision task... Return only its letter, with no explanation") seguido de un estado del robot serializado como texto; la salida es una sola letra entre las opciones listadas.

El proceso de entrenamiento tiene cuatro etapas documentadas. (1) Se entrena una politica PPO en un simulador web de locomocion 2D para la tarea `goto_target`, con la convencion `link01-decision/goto_target/obs21-act5/walker51-14/v1`, sobre los circuitos `random`, `15518e7c`, `dddd7f60` y `5575caaa`, alcanzando un 85% de exito en el examen oficial. (2) Se genera un conjunto de problemas: cada 0,5 segundos se convierte la observacion del cerebro en texto y se etiqueta con la accion elegida por el cerebro; un 20% de los ejemplos corresponden a situaciones en las que el cerebro se desvio del camino. Los tamanos son 945 ejemplos de entrenamiento, 159 de validacion y 233 de test. (3) Aprendizaje supervisado del LLM para imitar al cerebro (LoRA). (4) Aprendizaje por refuerzo: para cada opcion se estima la recompensa que obtendria el cerebro si continuase desde ahi, se refuerzan las opciones mejores que la del cerebro y se penalizan las peores, con una restriccion KL para no alejarse demasiado de la politica supervisada.

La evaluacion de la locomocion se realiza con una aproximacion 2D ("tabla de velocidades por comando" derivada de MuJoCo web), no con el simulador fisico completo, por lo que los resultados de caminata son aproximados y no reproducen caidas.

## Capacidades

- Seleccion de acciones discretas: dado un estado textual del robot, devuelve una unica letra correspondiente a una de las cinco acciones posibles (obs21-act5).
- Razonamiento sobre estado serializado: interpreta distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y accion previa.
- Instrucciones de sistema estrictas: respeta el formato de respuesta "solo la letra, sin explicacion" cuando se le indica en el system prompt.
- Tratamiento del estado como datos, no como instrucciones: el prompt de sistema incluye una defensa explicita contra inyeccion de instrucciones en el campo de estado.
- Capacidad multilingue: limitada al coreano en la practica (idioma declarado y de los datos de entrenamiento).
- No soporta tool calling, function calling, agentes multi-paso, vision ni audio segun la informacion disponible.
- No dispone de modo "thinking" ni de capacidades de codigo o matematicas mas alla de las heredadas del modelo base, no evaluadas en esta ficha.

## Casos de uso

- Control de locomocion en simulador educativo: el modelo se coloca en el lugar del modulo de decision de LINK-01 y genera la accion de caminata cada 0,5 segundos a partir del estado textual. Es adecuado porque fue entrenado exactamente para esa distribucion de observaciones y acciones.
- Docencia de destilacion RL a LLM: sirve como ejemplo reproducible (hay notebook de Colab y repositorio de codigo) de como convertir una politica PPO en un modelo de lenguaje mediante SFT + RL con KL. Util para cursos de aprendizaje por refuerzo.
- Investigacion en interfaces texto-politica: permite estudiar como se degrada el rendimiento de una politica al serializar observaciones continuas como texto, con datos de referencia (100% de acuerdo cerebro-texto en el conjunto de test, 79% de acierto del modelo RL).
- Prototipado de agentes embodied en entornos 2D: util para experimentar con bucles percepcion-texto-accion antes de invertir en simuladores fisicos o robots reales.
- Evaluacion de robustez frente a inyeccion de prompt: el propio diseno del system prompt permite probar si el modelo ignora instrucciones maliciosas embebidas en el estado del robot.
- Generacion de datos sinteticos de decision: el par (estado textual, letra) puede usarse como dataset para entrenar otros clasificadores de acciones en tareas de navegacion.
- No recomendado para atencion al cliente, generacion de codigo en produccion, analisis de documentos ni ninguna tarea de lenguaje general: el adaptador esta especializado y no se han evaluado esas capacidades.

## Benchmarks y rendimiento

Resultados publicados en la model card (tarea `goto_target`, 20 episodios con semillas 91001-91020, caminata aproximada 2D):

| Modelo | Acierto en test (misma accion que el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio de exito |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 80% | 0% | 19,2 s |
| Modelo base sin entrenar | 40,3% | 0% | 0% | — |
| SFT (LoRA supervisado) | 83,3% | 15% | 0% | 17,3 s |
| RL (este adaptador) | 79,0% | 100% | 0% | 17,7 s |

Observacion: el modelo RL acierta menos que el SFT en imitar al cerebro (79,0% frente a 83,3%) pero completa con exito los 20 episodios, frente al 15% del SFT. La metrica de exito en episodios es la relevante para la tarea. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la huella es muy reducida (del orden de pocos GB en FP16, menos aun cuantizado), pero no se han publicado cifras.
- GPU recomendadas: no disponibles. Por tamano del modelo base, cualquier GPU consumer reciente deberia poder alojarlo; no hay validacion publicada.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base (0,8B), aunque no se documenta.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. En la evaluacion de caminata, el tiempo medio de exito fue de 17,7 s por episodio, pero es tiempo de simulacion, no latencia de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores de decision embodied derivados de LLM) dentro de la informacion proporcionada. Como referencia, se compara con las variantes del propio pipeline:

| Modelo | Base | Metodo | Exito en 20 episodios | Licencia |
|---|---|---|---|---|
| LINK-01 RL (este) | Qwen3.5-0.8B | LoRA + SFT + RL | 100% | Apache 2.0 |
| LINK-01 SFT | Qwen3.5-0.8B | LoRA + SFT | 15% | Apache 2.0 |
| Cerebro PPO | Politica propia | PPO en simulador | 80% | No disponible |
| Modelo base | Qwen3.5-0.8B | Sin entrenar | 0% | No disponible |

## Limitaciones y advertencias

- Modelo de investigacion y educacion: la propia model card advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Evaluacion de caminata aproximada: los resultados de exito se miden con una tabla de velocidades 2D derivada de MuJoCo web, no con el simulador fisico; pueden diferir de la realidad y no modelan caidas.
- Especializacion estrecha: solo resuelve la tarea `goto_target` con 21 observaciones y 5 acciones; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Idioma: declarado unicamente coreano; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: el modelo puede devolver una letra no listada o anadir explicacion si el prompt de sistema no se aplica estrictamente; el formato de salida depende del system prompt.
- Inyeccion de prompt: aunque el system prompt instruye a tratar el estado como datos, no hay evaluacion publicada de robustez frente a ataques adversariales en el campo de estado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia, que debe verificarse por separado.
- Sin benchmarks estandar: no hay datos de MMLU, HumanEval ni similares; no debe asumirse calidad de lenguaje general.
- Repositorio de 0,0 GB y 15 descargas: ecosistema minimo, sin garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onethingtree/connectailab-rl-onetbrain-v1-link01
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con robots: https://www.aicitybuilders.com/robot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
