# mcemri/commenv-e1-five-agents

## Resumen

`mcemri/commenv-e1-five-agents` es un checkpoint de investigación derivado de Qwen/Qwen3-4B, publicado por el usuario mcemri, en el que se ha aplicado aprendizaje por refuerzo (GRPO) para entrenar a cinco copias del modelo a resolver puzles de lógica de forma colaborativa. Cada agente recibe una o dos pistas de un puzle, se comunican a través de un tablero compartido durante un máximo de seis turnos y cada uno debe entregar la solución completa. No es un producto: el autor lo describe explícitamente como un experimento de investigación sobre comunicación multiagente.

El modelo parte del Qwen3-4B sin entrenamiento previo en esta tarea y se ajusta durante 24 pasos de RL. Los resultados reportados en la model card muestran una mejora sustancial: la proporción de agentes que aciertan el puzle completo pasa del 29 % antes del run al 61 % tras 16 pasos y al 77 % tras 24, y la fracción de equipos en los que los cinco agentes aciertan sube del 8 % al 60 %. Como referencia, un único agente con todas las pistas se queda en el 67 %.

La relevancia del checkpoint es acotada y experimental: sirve para estudiar dinámicas de comunicación emergente, protocolos de coordinación entre agentes y el efecto del número de agentes en el rendimiento de tareas distribuidas. El repositorio ocupa 41,8 GB e incluye pesos en formato Transformers (8,8 GB por checkpoint) y el estado del entrenador (22,5 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); ajuste mediante RL con GRPO |
| Parametros totales | 4 000 millones (aproximado, segun el modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); checkpoint del entrenador en 4 shards |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B, un transformer decoder-only de 4 000 millones de parámetros, mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El entrenamiento parte del modelo base sin ajuste previo en la tarea y se extiende durante 24 pasos. El entorno de entrenamiento es un juego de puzles de lógica divididos: cinco copias del modelo reciben cada una una o dos pistas y se comunican a través de un tablero compartido durante un máximo de seis turnos, tras los cuales cada agente debe producir la solución completa del puzle.

La innovación técnica principal no está en la arquitectura, sino en el protocolo de entrenamiento multiagente: se recompensa a cada agente por acertar la solución global, lo que fuerza el desarrollo de estrategias de comunicación y agregación de información parcial. El run hermano `mcemri/commenv-e1-t1-team` aplica el mismo esquema con tres agentes. No se detalla en la información disponible la composición del dataset de puzles, el número total de tokens de entrenamiento ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento lógico en el contexto de puzles de lógica con información distribuida.
- Comunicación multiagente: intercambio de mensajes a través de un tablero compartido durante hasta seis turnos.
- Resolución colaborativa de tareas: cada agente integra las pistas de los demás para reconstruir la solución completa.
- Generalización parcial al número de agentes: el modelo entrenado con cinco agentes alcanza un 73 % de acierto en equipos de tres agentes, configuración con la que no fue entrenado.
- No se documentan capacidades de tool calling, function calling, visión, audio, modo thinking explícito ni soporte multilingüe específico.

## Casos de uso

- Investigación en comunicación emergente: usar el checkpoint para estudiar qué protocolos de comunicación desarrollan los agentes al compartir información parcial y cómo evolucionan con los pasos de RL.
- Experimentos de escalado de equipos: comparar el rendimiento de este run (cinco agentes) con el run hermano de tres agentes para analizar el efecto del tamaño del equipo en tareas de agregación de información.
- Benchmark de razonamiento distribuido: emplear los puzles de lógica como tarea de evaluación para medir la capacidad de coordinación de modelos multiagente frente a un agente único con toda la información.
- Estudio de generalización entre configuraciones: analizar por qué un modelo entrenado con cinco agentes mantiene un 73 % de acierto con tres, un caso de transferencia entre tamaños de equipo.
- Reproducción de experimentos de RL: el checkpoint del entrenador (22,5 GB con estado del optimizador) permite continuar el entrenamiento y reproducir la curva de mejora entre los pasos 16 y 24.
- Docencia y divulgación: ilustrar en cursos o artículos cómo el aprendizaje por refuerzo puede inducir comportamientos cooperativos en modelos de lenguaje pequeños.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 400 puzles reservados y repartidos entre cinco agentes:

| Metrica | Antes del run | Paso 16 | Paso 24 |
|---|---|---|---|
| Agentes con el puzle completo correcto | 29 % | 61 % | 77 % |
| Equipos con los cinco agentes correctos | 8 % | no disponible | 60 % |

Referencias adicionales del mismo entorno:

| Configuracion | Acierto |
|---|---|
| Un agente solo con todas las pistas | 67 % |
| Este run (entrenado con 5) evaluado con 3 agentes | 73 % |
| Run hermano de 3 agentes (40 pasos) evaluado con 5 agentes | 88 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,8 GB en fp16 para un único checkpoint de política (4 000 millones de parámetros); cada agente del equipo requiere su propia instancia, por lo que un equipo de cinco agentes necesita del orden de 44 GB en fp16.
- GPU recomendadas: A100 40/80 GB o H100 para desplegar varios agentes en una sola máquina; RTX 4090 (24 GB) permite alojar dos agentes en fp16 o uno solo con margen amplio.
- Cabe en GPU de consumo: sí, un agente individual en una RTX 4090, RTX 3090 o similar con 24 GB; para cuantizaciones de 4 bits se necesitarían herramientas externas, ya que el repo no publica versiones GGUF.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` (método documentado en la model card); vLLM o TGI son viables para servir cada agente, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-e1-five-agents | 4 000 M | no disponible | RL multiagente sobre Qwen3-4B | Apache-2.0 | Hugging Face |
| mcemri/commenv-e1-t1-team | 4 000 M | no disponible | RL multiagente con 3 agentes | no disponible | Hugging Face |
| Qwen/Qwen3-4B | 4 000 M | no disponible | LLM generalista base | Apache-2.0 | Hugging Face |

La comparación con modelos generalistas de propósito similar no resulta significativa: este checkpoint está especializado en una tarea concreta de puzles distribuidos y no se han publicado evaluaciones en benchmarks estándar que permitan situarlo frente a alternativas de propósito general.

## Limitaciones y advertencias

- Checkpoint de investigación, no un producto: el autor lo declara explícitamente y no está pensado para uso en producción.
- Entrenamiento muy corto (24 pasos de GRPO) y sobre una única tarea: el comportamiento fuera del entorno de puzles de lógica no está caracterizado.
- Riesgo de alucinación y de degradación del rendimiento general: el ajuste por RL sobre una tarea estrecha puede afectar negativamente a las capacidades generales del modelo base.
- Sesgos: no se documenta ninguna evaluación de sesgos; al heredar el modelo base Qwen3-4B, arrastra los sesgos de sus datos de preentrenamiento.
- Idiomas: no se especifican los idiomas soportados tras el fine-tuning.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo no está validado para ello y su naturaleza experimental lo desaconseja.
- Requisitos de infraestructura: desplegar cinco agentes exige cinco instancias del modelo y un mecanismo de coordinación del tablero compartido que no se distribuye con el checkpoint.
- El repositorio no incluye el archivo `trainer_state.pt`, lo que puede complicar la reanudación exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-e1-five-agents
- Run hermano con tres agentes: https://huggingface.co/mcemri/commenv-e1-t1-team
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
