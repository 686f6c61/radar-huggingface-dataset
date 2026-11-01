# irobtec/connectailab-rl-irobtecbrain-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT publicado por irobtec (empresa surcoreana IropTech AI) sobre el modelo base Qwen/Qwen3.5-0.8B. Su funcion no es la generacion de texto general, sino actuar como politica de decision para un robot caminante simulado: recibe el estado del robot en lenguaje natural (distancia al objetivo, direccion, sensores de distancia, velocidad y accion previa) y devuelve una unica letra que codifica el siguiente movimiento de 0,5 segundos entre cinco opciones posibles.

El modelo se entrena en dos fases sobre una politica PPO previamente aprendida en un entorno web de aprendizaje por refuerzo (CONNECT AI WORLD, tarea `follow_route`). Primero se destila el comportamiento del "cerebro" PPO en el modelo linguistico mediante aprendizaje supervisado con LoRA; despues se aplica un ajuste por refuerzo con ancla KL para corregir las decisiones que el modelo toma peor que la politica original. El resultado es un adaptador de muy bajo coste computacional (el modelo base ronda los 0,8 mil millones de parametros) que razona sobre observaciones textuales estructuradas.

Es relevante como ejemplo de integracion entre RL clasico y modelos de lenguaje pequenos para control de agentes: demuestra que un LM sub-1B puede aproximar una politica de control con un 73,4% de coincidencia con el profesor y un 95% de exito en 20 episodios de evaluacion. No obstante, se trata de un modelo de investigacion y educacion, limitado al dominio concreto de la tarea y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | ~0,8 mil millones en el modelo base; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (ko); el prompt de sistema y el formato de tarea estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen3.5-0.8B aparte |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de ~0,8B parametros (Qwen3.5-0.8B) mediante LoRA. La tarea se formula como clasificacion de una sola letra entre cinco opciones (obs16-act5), con un prompt de sistema que instruye al modelo a tratar el contenido del estado como datos y no como instrucciones, y a devolver exclusivamente la letra de la opcion elegida.

El pipeline de entrenamiento consta de cuatro etapas descritas en la model card: (1) entrenamiento de la politica PPO "profesor" en el entorno web `follow_route` con la configuracion `link01-decision/follow_route/obs16-act5/walker51-14/v1` sobre el curso `random`; (2) generacion de un dataset de problemas a partir de las observaciones textualizadas cada 0,5 s durante un episodio, con un 20% de ejemplos perturbados donde la accion del profesor desvia al robot; (3) aprendizaje supervisado del LM sobre las respuestas del profesor; y (4) ajuste por refuerzo donde se recompensa cada opcion segun el retorno que habria obtenido el profesor continuando desde ese estado, con una penalizacion KL para mantener el modelo cerca de la politica supervisada. El dataset contiene 884 ejemplos de entrenamiento, 182 de validacion y 267 de test. La tasa de coincidencia entre la politica PPO y su version textualizada (techo de acierto) se situa en el 99%.

## Capacidades

- Decision de control discreta: dado un estado textualizado del robot (16 dimensiones de observacion), selecciona una de cinco acciones de caminata para los siguientes 0,5 segundos.
- Seguimiento de rutas en simulacion 2D: la politica aprendida corresponde a la tarea `follow_route` sobre el curso `random`.
- Razonamiento sobre estado estructurado en lenguaje natural: interpreta distancia, direccion, lecturas de sensores y accion previa presentadas como texto.
- Robustez parcial ante estados perturbados: el entrenamiento incluye un 20% de ejemplos con acciones suboptimas del profesor.
- Salida restringida y verificable: devuelve una unica letra, lo que simplifica el parseo y la integracion en bucles de control.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking; es un clasificador de acciones, no un asistente general.
- Capacidad multilingue limitada al coreano como idioma declarado; el prompt de sistema esta en ingles.

## Casos de uso

- Investigacion en destilacion de politicas RL a modelos de lenguaje: usar el adaptador como caso de estudio para medir cuanto de una politica PPO puede capturarse en un LM sub-1B mediante SFT + RL, comparando las cifras publicadas (72,7% SFT, 73,4% RL) con variantes propias.
- Educacion en aprendizaje por refuerzo: el notebook de Colab y el repositorio `connect-tycoon` permiten reproducir el pipeline completo (PPO, generacion de dataset, LoRA, ajuste con KL) en un entorno de bajo coste, adecuado para cursos de RL aplicado.
- Prototipado de agentes de control en simulacion: integrar el adaptador en el bucle de decision de un robot simulado 2D para validar arquitecturas de "LM como politica" antes de invertir en modelos mayores.
- Benchmark de robustez ante instrucciones inyectadas: el prompt de sistema incluye una defensa explicita contra instrucciones embebidas en el estado, lo que permite evaluar si el modelo respeta esa separacion en entradas adversariales.
- Control de bajo coste en entornos embebidos: al apoyarse en un modelo de ~0,8B, puede ejecutarse en GPU consumer o incluso CPU con cuantizacion, lo que lo hace viable para demos en hardware modesto.
- Generacion de datos sinteticos de decision: usar el modelo para etiquetar estados textualizados en nuevos cursos y ampliar datasets de entrenamiento para politicas PPO, siempre validando contra el simulador.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluacion sobre 267 problemas de test y 20 episodios de caminata con semillas 91001-91020):

| Modelo | Acierto en test (coincidencia con el profesor) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Politica PPO (profesor) | 100,0% | 100% | 0% | 19,6 s |
| Modelo base sin ajuste | 25,5% | 0% | 0% | no disponible |
| LINK-01 tras SFT | 72,7% | 85% | 0% | 20,2 s |
| LINK-01 tras RL (publicado) | 73,4% | 95% | 0% | 20,0 s |

Nota del autor: la evaluacion de caminata usa una aproximacion 2D basada en una tabla de velocidades por comando extraida del simulador web MuJoCo, no el simulador completo, por lo que los resultados pueden diferir ligeramente de MuJoCo. No se han publicado resultados en benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~0,8B ocupa aproximadamente 1,6 GB en fp16 y alrededor de 0,5-0,6 GB en cuantizacion de 4 bits; el adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); en cuantizacion 4 bits cabe en GPUs integradas o incluso en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU discreta moderna e incluso en muchas integradas con cuantizacion.
- Opciones de despliegue: transformers + peft (ruta oficial documentada), llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF, y vLLM/TGI para servir el base fusionado con LoRA.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de una clasificacion de una sola letra con contexto corto, la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | ~0,8B (base) + LoRA | no disponible | Politica de control via LM destilada de PPO | Apache 2.0 | HuggingFace, 19 descargas |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | LM generativo general | no disponible en la informacion | HuggingFace |
| Politica PPO `walker51-14` | no disponible | no aplica | Red de politica RL pura | no disponible | Entorno web CONNECT AI WORLD |

No se dispone de informacion sobre otros adaptadores de la misma familia (variantes `link01` adicionales) ni de modelos comparables de "LM como politica de control" con los que establecer una comparacion cuantitativa. Los unicos puntos de referencia son el modelo base y la politica PPO original, ambos incluidos en la tabla anterior.

## Limitaciones y advertencias

- Dominio muy restringido: solo resuelve la tarea `follow_route` sobre el curso `random`; no generaliza a otras tareas, mapas o morfologias de robot sin reentrenamiento.
- Evaluacion aproximada: la validacion de caminata usa una tabla de velocidades 2D en lugar del simulador MuJoCo completo, por lo que el exito del 95% puede no trasladarse al simulador real.
- Brecha respecto al profesor: el 73,4% de coincidencia en test implica que aproximadamente una de cada cuatro decisiones difiere de la politica PPO, lo que puede acumular error en episodios largos.
- Sin validacion en robot fisico: el propio autor advierte que es un modelo de investigacion y educacion y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Riesgo de inyeccion de instrucciones: aunque el prompt de sistema separa estado y instrucciones, un modelo de 0,8B es vulnerable a prompts adversariales embebidos en el estado.
- Idioma: declarado solo para coreano; el soporte de otros idiomas no esta verificado.
- Sin datos de sesgo ni de alucinacion: no se han publicado evaluaciones de sesgo, y al ser un clasificador de letras el riesgo de alucinacion se manifiesta como seleccion de una opcion invalida o incorrecta.
- Licencia Apache 2.0 permisiva para uso comercial, pero la responsabilidad de validar el comportamiento en produccion recae en el integrador; verificar tambien la licencia del modelo base Qwen3.5-0.8B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irobtec/connectailab-rl-irobtecbrain-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje (CONNECT AI WORLD): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
