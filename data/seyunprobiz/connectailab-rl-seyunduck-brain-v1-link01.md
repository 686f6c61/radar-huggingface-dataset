# seyunprobiz/connectailab-rl-seyunduck-brain-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por seyunprobiz en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. Su funcion es actuar como "cerebro" de decision para un robot simulado llamado LINK-01: dado un estado textual con la situacion del robot (distancia al objetivo, direccion, lecturas de sensores de distancia, velocidad y eleccion previa), el modelo debe devolver una unica letra correspondiente a una de las cinco acciones de locomocion disponibles para los siguientes 0,5 segundos.

El modelo no se entrena desde cero: parte de un transformer decoder de 0,8 mil millones de parametros (Qwen3.5-0.8B) y se ajusta mediante LoRA en dos fases. Primero, aprendizaje supervisado sobre 837 ejemplos de entrenamiento generados a partir de las decisiones de una politica PPO entrenada en un simulador web; despues, una fase de refuerzo con senal de recompensa derivada del retorno simulado de cada accion. El resultado es un modelo de lenguaje pequeno especializado en una tarea de decision secuencial muy concreta, no un asistente conversacional general.

Su relevancia es acotada pero ilustrativa: demuestra un flujo completo de destilacion de politica (policy distillation) desde un agente RL hacia un modelo de lenguaje, con evaluacion cuantitativa en un banco de pruebas propio. Es un ejemplo de investigacion y educacion en RL aplicado a robotica simulada, y el autor advierte explicitamente que debe revalidarse antes de usarse en un robot real. El repositorio ocupa 0,0 GB (adaptador de pesos minimo) y acumula 15 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder de 0,8 B de parametros. La tarea se formula como clasificacion de una letra entre cinco opciones de accion (`obs21-act5`), con observaciones codificadas en texto (`walker51-14`). El entrenamiento se realizo en dos etapas: (1) aprendizaje supervisado con 837 ejemplos de entrenamiento, 213 de validacion y 283 de test, generados registrando cada 0,5 segundos lo que veia una politica PPO entrenada en el simulador web; aproximadamente el 20 % de los ejemplos incluyen trayectorias desviadas para cubrir situaciones fuera de la politica optima; (2) refinamiento por refuerzo con PPO y una penalizacion KL que ancla el modelo al de la fase supervisada, usando como recompensa el retorno simulado de completar el resto del recorrido con la politica maestra.

La innovacion principal es el uso de una tabla de velocidades de marcha aproximada en 2D (derivada del simulador MuJoCo web) como sustituto del modelo fisico completo durante la evaluacion, lo que permite medir exito, colisiones y tiempo sin ejecutar la simulacion de locomotion. El autor reporta que el techo de acierto por translacion de texto es del 99 % (la politica maestra coincide consigo misma en el 99 % de los casos al pasar por texto).

## Capacidades

- Clasificacion de decision discreta: devuelve exactamente una letra entre cinco opciones de accion de locomocion.
- Lectura de estado textual estructurado: interpreta distancia, direccion, sensores de distancia, velocidad y accion previa codificados como texto.
- Seguimiento de instrucciones con formato estricto: respeta el system prompt que exige devolver solo la letra, sin explicacion.
- Robustez ante instrucciones embebidas en el estado: el prompt indica tratar el contenido de `state` como datos, no como instrucciones.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni generacion de texto libre como asistente.
- Capacidad multilingue practicamente nula: entrenado y evaluado solo en coreano.

## Casos de uso

- Politica de decision en simulacion robotica: sustituir la politica PPO original en el bucle de control de LINK-01 dentro del simulador web para comparar latencia y comportamiento, ya que el modelo devuelve una accion en un unico paso de generacion.
- Destilacion de politica a lenguaje: usar el adaptador como ejemplo reproducible de como convertir un agente RL en un modelo de lenguaje pequeno, util en docencia de RL y en investigacion sobre policy distillation.
- Evaluacion comparativa de tecnicas de ajuste: el par supervisado/refuerzo con los mismos datos permite medir el efecto del RL sobre un SL previo en una tarea de clasificacion cerrada.
- Prototipado rapido de controladores en entornos simulados: al ser un adaptador de 0,0 GB sobre un modelo de 0,8 B, se puede desplegar en un portatil para iterar sobre el formato de observaciones antes de entrenar un modelo mayor.
- Generacion de datos de entrenamiento: usar el modelo como anotador auxiliar de decisiones en nuevas trayectorias simuladas para ampliar el conjunto de ejemplos.
- Docencia de RL aplicado a robotica: el flujo completo (entrenar PPO, registrar observaciones, ajustar LoRA, evaluar con semillas fijas 91001-91020) es replicable en un cuaderno de Colab, lo que lo hace adecuado para talleres.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (tarea `goto_target`, curso `74c44ade`, 20 partidas con semillas 91001-91020):

| Modelo | Acierto en test (coincidencia con la politica maestra) | Exito en 20 partidas | Partidas con colision | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Politica maestra (PPO) | 100,0 % | 100 % | 0 % | 16,6 s |
| Modelo base sin ajuste | 46,3 % | 0 % | 5 % | — |
| Fase supervisada (SL) | 69,6 % | 60 % | 55 % | 22,8 s |
| Fase de refuerzo (RL) | 62,2 % | 0 % | 30 % | — |

El autor indica que la evaluacion de marcha usa una aproximacion 2D con tabla de velocidades, sin modelo fisico ni red de locomotion, por lo que no hay caidas y los resultados pueden diferir de MuJoCo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 B en fp16 ocupa aproximadamente 1,6 GB de pesos; con overhead de activaciones y cache KV, cabe holgadamente en 4-6 GB. El adaptador LoRA anade un coste marginal.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM con soporte de adaptadores LoRA.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de una generacion de un solo token (una letra), la latencia por decision sera baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-seyunduck-brain-v1-link01 | 0,8 B (base) + LoRA | No disponible | Decision discreta en robot simulado | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | Lenguaje general | No disponible en la informacion | HuggingFace |
| Politica PPO original (maestra) | No disponible | No aplica | Decision discreta en robot simulado | No disponible | Solo en simulador web |
| Otros adaptadores LoRA de robotica | Variable | Variable | Variable | Variable | No disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en coreano; no se garantiza funcionamiento en castellano ni en otros idiomas.
- Dominio muy estrecho: solo la tarea `goto_target` con el formato de observacion `obs21-act5` y cinco acciones discretas. Fuera de ese formato, el modelo no es fiable.
- La fase de refuerzo empeoro el exito en partidas (0 % frente al 60 % del modelo supervisado) y redujo el acierto en test (62,2 % frente a 69,6 %); el autor recomienda usar la version supervisada.
- Riesgo de alucinacion: puede devolver una letra no valida o texto adicional si el prompt no sigue exactamente el formato esperado.
- La evaluacion se realizo con una aproximacion 2D de la marcha, no con el simulador fisico completo; los resultados pueden no trasladarse a MuJoCo ni a un robot real.
- El autor advierte explicitamente que es un modelo de investigacion y educacion sobre simulador y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- No apto como asistente conversacional ni para generacion de texto general.
- No se documentan sesgos especificos, pero al derivar de una politica PPO entrenada en un unico curso simulado, el comportamiento esta fuertemente sesgado hacia esa trayectoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seyunprobiz/connectailab-rl-seyunduck-brain-v1-link01
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL aplicado a robotica: https://www.aicitybuilders.com/robot
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
