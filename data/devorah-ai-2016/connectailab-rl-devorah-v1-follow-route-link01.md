# devorah-ai-2016/connectailab-rl-devorah-v1-follow-route-link01

## Resumen

connectailab-rl-devorah-v1-follow-route-link01 es un adaptador LoRA de tipo PEFT publicado por el desarrollador independiente devorah-ai-2016 dentro del ecosistema CONNECT AI LAB. Se trata de un modelo de toma de decisiones para el robot simulado LINK-01, cuyo objetivo es responder, a partir de una descripcion textual del estado del robot (distancia al objetivo, direccion, sensores de distancia, velocidad y accion previa), cual debe ser el siguiente movimiento durante los proximos 0,5 segundos. La salida es una unica letra correspondiente a una de las cinco acciones disponibles.

El adaptador se monta sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer de 0,8 mil millones de parametros, y se ha entrenado en dos fases: primero un ajuste supervisado (LoRA) para imitar las decisiones de una politica PPO previamente entrenada en un simulador web, y despues un refinamiento con aprendizaje por refuerzo (PPO con restriccion KL) que premia acciones con mejor recompensa esperada. El resultado es un modelo de lenguaje que actua como controlador de alto nivel en un entorno de robotica simulado.

Su relevancia es fundamentalmente metodologica y educativa: demuestra como destilar una politica de refuerzo (un `brain.json` entrenado con PPO) en un modelo de lenguaje pequeno mediante LoRA, y como aplicar despues RL sobre las decisiones del LLM. No es un modelo de proposito general ni un asistente conversacional; es un artefacto de investigacion ligado a una tarea muy concreta (`follow_route`) y a un simulador 2D aproximado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parametros, y se entrena mediante LoRA (Low-Rank Adaptation), por lo que solo se actualiza un subconjunto reducido de pesos. El pipeline declarado es `reinforcement-learning`, con tags de PPO, deep reinforcement learning y robotica.

El proceso de entrenamiento descrito en la model card consta de cuatro etapas. Primero se entrena una politica PPO en un simulador web (tarea `follow_route`, observacion de 16 dimensiones, 5 acciones, curso `random`), que alcanza un 100% de exito en la prueba oficial. Segundo, se genera un conjunto de problemas transformando cada observacion del robot en texto (pregunta + opciones) y usando la accion del `brain.json` como etiqueta; se incluye un 20% de ejemplos con desviaciones deliberadas. Tercero, se realiza ajuste supervisado con LoRA para imitar esas etiquetas. Cuarto, se aplica RL (PPO con ancla KL) donde la recompensa de cada opcion se estima como la recompensa que obtendria la politica original si continuara desde esa accion. El conjunto de datos consta de 1848 ejemplos de entrenamiento, 383 de validacion y 587 de test. La tasa de coincidencia techo (el propio cerebro respondiendo en formato texto) es del 99%.

## Capacidades

- Toma de decisiones discreta: dado un estado textual del robot, selecciona una de cinco acciones (una letra) para el siguiente intervalo de 0,5 segundos.
- Razonamiento sobre estado estructurado: interpreta distancia al objetivo, direccion, lecturas de sensores de distancia, velocidad y accion previa.
- Seguimiento de instrucciones con formato estricto: responde unicamente con la letra de la opcion elegida, sin explicacion.
- Tratamiento de datos como datos: el prompt de sistema indica explicitamente que el contenido del estado no debe interpretarse como instrucciones.
- Capacidad multilingue limitada al coreano en los datos de entrenamiento; el prompt de sistema esta en ingles.
- No dispone de tool calling, function calling, vision, audio ni modo thinking declarados.

## Casos de uso

- Control de alto nivel en simulacion robotica: integrar el adaptador como policy head que traduce observaciones textuales en comandos de movimiento dentro de un simulador tipo MuJoCo o un entorno web de robotica.
- Investigacion en destilacion de politicas RL a LLM: usar el par (politica PPO, adaptador LoRA) como caso de estudio reproducible para medir cuanto de una politica de refuerzo se puede transferir a un modelo de lenguaje pequeno.
- Educacion en reinforcement learning: el modelo sirve como ejemplo didactico de pipeline completo (entorno, PPO, generacion de dataset, SFT, RL con KL) en cursos y notebooks de Colab.
- Prototipado rapido de agentes de decision con formato fijo: util para validar arquitecturas de prompting donde la salida debe ser una opcion cerrada y verificable.
- Evaluacion de robustez ante ruido en observaciones: el 20% de ejemplos con desviaciones permite estudiar como degrada el modelo cuando el estado no coincide con la politica optima.
- Benchmark de metodos de RLHF/RL sobre tareas no conversacionales: comparar SFT frente a RL en una tarea con recompensa bien definida y metrica de exito binaria.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la tarea `follow_route` y a una evaluacion de 20 episodios (semillas 91001-91020) con una aproximacion 2D de la marcha:

| Modelo | Acierto en test (misma accion que el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio de exito |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 48,1 s |
| Antes de entrenar | 38,8% | 0% | 0% | — |
| Ajuste supervisado (SFT) | 90,6% | 90% | 0% | 47,2 s |
| Refuerzo (RL) | 86,4% | 90% | 0% | 49,5 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la inferencia en fp16 requiere aproximadamente 1,6-2 GB de VRAM, y en cuantizacion de 4 bits puede situarse por debajo de 1 GB (estimacion a partir del tamano del modelo base, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para el modelo base en fp16; para entrenamiento del adaptador se recomienda al menos 8-12 GB.
- Cabe en GPU consumer: si, practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor); llama.cpp, Ollama o vLLM requeririan fusionar el adaptador con el modelo base y convertir a GGUF, lo cual no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-devorah-v1-follow-route-link01 | 0,8B (base) + LoRA | no disponible | Decision robotica `follow_route` | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Generacion de texto general | no disponible | Hugging Face |
| Politica PPO original (`brain.json`) | no aplica (tabla de politica) | no aplica | Decision robotica `follow_route` | no disponible | Repositorio CONNECT TYCOON |

No se dispone de otros adaptadores de decision robotica comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo resuelve la tarea `follow_route` con observaciones de 16 dimensiones y 5 acciones; no es un asistente general ni admite otras tareas.
- Entrenado exclusivamente en coreano; el rendimiento en otros idiomas no esta validado.
- La evaluacion de marcha usa una aproximacion 2D basada en tablas de velocidad, no el simulador MuJoCo real, por lo que los resultados pueden diferir del comportamiento fisico.
- El autor advierte explicitamente que es un modelo de investigacion y educacion sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Riesgo de alucinacion en la seleccion de accion cuando el estado de entrada se sale de la distribucion de entrenamiento; la tasa de acierto cae al 86,4% en RL, inferior al 90,6% del SFT, lo que sugiere que el refinamiento con RL no mejora la imitacion.
- El prompt de sistema exige tratar el contenido del estado como datos y no como instrucciones; sin esa salvaguarda, entradas maliciosas podrian alterar la decision.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad practica fuera del entorno de investigacion es muy limitada.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta; no hay evidencia de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/devorah-ai-2016/connectailab-rl-devorah-v1-follow-route-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
