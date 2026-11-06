# abracsus/connectailab-rl-abracsus-v3-link01

## Resumen
connectailab-rl-abracsus-v3-link01 es un adaptador LoRA de tipo PEFT publicado por el usuario abracsus sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje generalista, sino un "cerebro de decision" entrenado para el robot simulado LINK-01 en la tarea `avoid_obstacles` (esquivar obstaculos). El modelo recibe en texto el estado del robot (distancia al objetivo, direccion, sensores de distancia, velocidad y la accion previa) y debe responder con una unica letra que representa como caminar durante los siguientes 0,5 segundos.

El entrenamiento combina un profesor de aprendizaje por refuerzo (PPO) entrenado en un simulador web, destilacion supervisada (LoRA) sobre las decisiones del profesor y un posterior ajuste con RL (PPO con restriccion KL) sobre las opciones de respuesta. El resultado es un adaptador pequeno, con licencia Apache 2.0, orientado a investigacion y educacion en robotica y toma de decisiones, no a generacion de texto abierta.

Su relevancia es la de un ejemplo practico y reproducible de como alinear un modelo de lenguaje pequeno (0,8B) con la politica de un agente RL mediante destilacion mas RL, con un pipeline documentado y notebooks publicos. El alcance es deliberadamente estrecho: una tarea, un simulador y un idioma de trabajo (coreano).

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-0.8B; no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) declarado; el prompt de sistema esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parametros, mediante LoRA (libreria `peft`). El entrenamiento sigue un pipeline de cuatro fases descrito en la model card: (1) entrenamiento del "profesor" con PPO en el simulador web sobre la tarea `avoid_obstacles` (contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `85b7b23e`, 55% en la prueba oficial); (2) generacion de un dataset de preguntas y respuestas convirtiendo cada 0,5 s las observaciones del robot en texto, con la accion del profesor como etiqueta y un 20% de ejemplos con desviaciones; (3) aprendizaje supervisado del modelo de lenguaje sobre esas etiquetas; (4) ajuste con RL (PPO con ancla KL) usando la recompensa obtenida si el profesor continuase la trayectoria tras cada opcion, subiendo las opciones mejores y bajando las peores.

El conjunto de datos consta de 950 ejemplos de entrenamiento, 192 de validacion y 294 de prueba. La tasa de coincidencia entre el texto y la decision del profesor (techo de acierto) se situa en el 99%. La evaluacion de caminata se realiza con una aproximacion 2D basada en una tabla de velocidades por comando (no con MuJoCo en vivo), por lo que no reproduce caidas y puede diferir ligeramente de los resultados del simulador web.

## Capacidades
- Toma de decisiones discretas: dado un estado textual del robot, devuelve una unica letra correspondiente a una de las opciones de accion disponibles.
- Seguimiento de instrucciones estricto: el prompt de sistema exige responder solo con la letra, sin explicacion.
- Tratamiento del estado como datos, no como instrucciones (defensa basica frente a inyeccion de prompt en el campo `state`).
- Razonamiento de corto horizonte: cada decision cubre 0,5 s de caminata; la coherencia temporal se apoya en la accion previa incluida en la observacion.
- Capacidad multilingue limitada al coreano declarado; no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking".

## Casos de uso
- Investigacion en destilacion de politicas RL a modelos de lenguaje: permite reproducir el pipeline profesor PPO -> SFT -> RL y comparar la tasa de coincidencia con el profesor (77,2% en SFT frente a 66,7% tras RL) y el exito en simulacion (35% frente a 100%).
- Educacion en robotica y RL: los notebooks de Colab y el repositorio connect-tycoon permiten a estudiantes entrenar su propio cerebro y adaptador sobre una tarea de evitacion de obstaculos.
- Prototipado de interfaces lenguaje-accion: sirve para validar el formato `state` + pregunta + opciones y el contrato `link01-decision/avoid_obstacles/...` antes de escalar a tareas mas complejas.
- Evaluacion de robustez frente a desviaciones: el 20% de ejemplos con acciones alternativas permite estudiar como un modelo pequeno recupera la politica correcta tras decisiones suboptimas.
- Baseline para comparativas de RLHF/PPO en modelos de menos de 1B: util como referencia reproducible con licencia Apache 2.0 y pesos safetensors.
- Demostraciones y material docente: integrable en el entorno web CONNECT AI WORLD y en cursos de RL de AI CITY BUILDERS como ejemplo de agente que decide a partir de descripciones textuales.

## Benchmarks y rendimiento
| Modelo | Acierto en test (misma respuesta que el profesor) | Exito en 20 episodios del mismo curso | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO, cerebro) | 100,0% | 100% | 20% | 20,6 s |
| Modelo antes de entrenar | 35,0% | 0% | 10% | No disponible |
| Tras aprendizaje supervisado (LoRA) | 77,2% | 35% | 75% | 27,2 s |
| Tras RL (adaptador publicado) | 66,7% | 100% | 0% | 21,8 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores corresponden a la tarea especifica `avoid_obstacles` y a una aproximacion 2D de la caminata, no a MuJoCo en vivo.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base es de 0,8B parametros; en fp16 requiere aproximadamente 1,6 GB solo para pesos, mas overhead de activaciones y KV cache. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar el modelo base en fp16; con cuantizacion de 4 bits cabria en GPUs de 2-3 GB. Para entrenamiento del adaptador se recomienda al menos una RTX 3060/4060 Ti de 12-16 GB.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles. La tarea impone un presupuesto de 0,5 s por decision, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-abracsus-v3-link01 | Adaptador LoRA sobre base de 0,8B | No disponible | Decision `avoid_obstacles` para LINK-01 | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la informacion | Hugging Face |
| Cerebros PPO del simulador CONNECT AI WORLD | No disponible | No aplica | Decision `avoid_obstacles` | No disponible | Repositorio connect-tycoon |
| Otros adaptadores de la familia connectailab | No disponible | No disponible | Variantes de decision | No disponible | Hugging Face (autor abracsus) |

No se dispone de informacion sobre modelos directamente comparables de otros autores para esta tarea concreta de decision robotica destilada a un LLM.

## Limitaciones y advertencias
- Alcance muy restringido: solo cubre la tarea `avoid_obstacles` del robot LINK-01 en un simulador web; no es un modelo de proposito general.
- Evaluacion aproximada: la caminata se puntua con una tabla 2D de velocidades por comando, no con MuJoCo en vivo; los resultados pueden diferir del simulador real.
- El RL mejora el exito en simulacion (100% frente a 35% del SFT) pero reduce la coincidencia con el profesor (66,7% frente a 77,2%), lo que indica que la politica aprendida se desvia de la del profesor para optimizar recompensa.
- Idioma: solo se declara coreano; el prompt de sistema esta en ingles y no se documenta comportamiento en castellano.
- Riesgo de alucinacion: al ser un modelo de lenguaje pequeno, puede devolver opciones no validas o texto adicional si el prompt no se respeta; el diseno depende de un formato estricto.
- Seguridad: la model card advierte que es un modelo de investigacion y educacion; debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B, no incluida en la informacion disponible.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa independiente.

## Enlaces
- Hugging Face: https://huggingface.co/abracsus/connectailab-rl-abracsus-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento (Colab): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
