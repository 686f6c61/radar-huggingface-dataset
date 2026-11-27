# mcemri/commenv-task-wiki-t2

## Resumen

`mcemri/commenv-task-wiki-t2` es un checkpoint de investigación derivado de Qwen/Qwen3-4B, publicado por el autor mcemri bajo licencia Apache-2.0. No se trata de un modelo de propósito general, sino del resultado de un experimento de aprendizaje por refuerzo (GRPO) en el que tres copias del mismo modelo aprenden a colaborar como un equipo para responder preguntas de HotpotQA, cada una con acceso únicamente a un tercio de una colección de párrafos de Wikipedia. El modelo parte del checkpoint final de `mcemri/commenv-e1-t2-combined` y se entrena durante 30 pasos adicionales sobre una tarea de búsqueda multiagente.

El interés del modelo es fundamentalmente científico: sirve para estudiar cómo emerge la comunicación entre agentes que comparten un tablero común y deben coordinar búsquedas parciales para resolver una pregunta cuyas dos evidencias necesarias están repartidas entre particiones distintas. La model card describe mejoras medibles en la tasa de acierto (del 39 % al 46 % de agentes correctos en el conjunto de evaluación) y en la probabilidad de que ambos párrafos necesarios aparezcan en alguna búsqueda (del 50 % al 69 %).

Arquitectónicamente es un transformer denso de 4 000 millones de parámetros (Qwen3-4B) sin modificaciones estructurales; la innovación reside en el procedimiento de entrenamiento y en el protocolo de comunicación, no en la arquitectura. El repositorio ocupa 33 GB e incluye tanto los pesos exportados en safetensors (8,8 GB) como el estado del entrenador (22,5 GB) para poder reanudar el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parámetros totales | 4 000 millones (modelo base Qwen3-4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantización | no disponible (el autor solo publica safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); checkpoint del entrenador en 4 shards |
| Tamaño del repositorio | 33,0 GB en total; 8,8 GB de pesos exportados |
| Modelo base | Qwen/Qwen3-4B |
| Checkpoint de partida | mcemri/commenv-e1-t2-combined |
| Método de entrenamiento | GRPO (reinforcement learning) |
| Pasos de entrenamiento | 30 pasos, 256 rondas por paso (7 680 preguntas usadas) |

## Arquitectura y entrenamiento

El modelo es una copia de Qwen3-4B, un transformer denso de 4 000 millones de parámetros, sin cambios en la arquitectura. Lo diferencial es el régimen de entrenamiento: se aplica GRPO (Group Relative Policy Optimization) durante 30 pasos sobre una tarea de búsqueda colaborativa. En cada episodio, tres instancias del modelo reciben conjuntamente una pregunta de HotpotQA y deben responderla; cada instancia puede realizar tres búsquedas y obtener tres coincidencias, pero solo sobre su propia partición de la colección de párrafos. Las dos evidencias necesarias para responder están deliberadamente separadas en particiones distintas, de modo que la resolución exige que los agentes intercambien información.

Los agentes se comunican mediante un tablero compartido durante un máximo de seis turnos y cada uno debe emitir su propia respuesta final. El entrenamiento utiliza 9 000 preguntas del split de entrenamiento de HotpotQA sobre 102 301 párrafos; de ellas, 7 680 se consumen en los 30 pasos de 256 rondas. El checkpoint parte del modelo final de un experimento previo (rompecabezas lógicos divididos, primero en solitario y luego en equipo), por lo que este ajuste se centra específicamente en la habilidad de búsqueda y comunicación.

## Capacidades

- Generación de texto y razonamiento en el marco de Qwen3-4B, heredadas del modelo base.
- Búsqueda colaborativa multiagente: tres copias del modelo cooperan sobre un tablero compartido para resolver una pregunta.
- Comunicación estructurada entre agentes mediante un canal común durante hasta seis turnos.
- Razonamiento de múltiples pasos orientado a la recuperación de evidencia en particiones disjuntas de un corpus.
- Emisión de respuesta individual por parte de cada agente (no solo una respuesta agregada).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje multiagente: el modelo permite reproducir y extender experimentos de comunicación emergente entre agentes con acceso parcial a la información, usando el protocolo de tablero compartido y las particiones descritas en la model card.
- Estudio de recuperación distribuida: sirve para analizar cómo se coordinan varios agentes cuando ninguna fuente individual contiene toda la evidencia, un escenario análogo a la federación de índices de búsqueda.
- Evaluación de técnicas de RL para LLM: al ser un checkpoint de investigación con métricas antes/después publicadas (39 % → 46 % de acierto por agente), es útil como referencia para comparar variantes de GRPO en tareas de colaboración.
- Análisis de protocolos de comunicación: el tablero compartido y el límite de seis turnos permiten estudiar el coste de coordinación frente al beneficio de información adicional.
- Reproducción de experimentos de HotpotQA: el modelo y los datos de entrenamiento descritos permiten replicar el pipeline de evaluación sobre las 600 preguntas reservadas y 66 581 párrafos.
- Punto de partida para ajuste posterior: al incluir el estado del entrenador (22,5 GB en cuatro shards), puede reanudarse el entrenamiento o continuar con nuevas tareas de búsqueda o razonamiento colaborativo.
- Estudio de generalización fuera de dominio: la model card reporta que en búsqueda sobre LitSearch (no presente en entrenamiento) el rendimiento no cambió (31 % → 32 %), lo que lo convierte en un caso útil para analizar transferencia limitada.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos sobre 600 preguntas reservadas de HotpotQA y 66 581 párrafos.

| Métrica | Antes del run (30 pasos) | Después del run | Cambio |
|---|---|---|---|
| Agentes correctos (equipo) | 39 % | 46 % | +6,6 puntos (IC 95 %: 3,4–9,8) |
| Equipos con los tres agentes correctos | 33 % | 42 % | +9 puntos |
| Equipos donde aparecen ambos párrafos necesarios en alguna búsqueda | 50 % | 69 % | +19 puntos |
| Búsqueda sobre LitSearch (fuera de dominio) | 31 % | 32 % | +1 punto |

Referencia adicional de la model card: el mismo entrenamiento partiendo del modelo sin entrenar (`mcemri/commenv-task-wiki-untrained-start`) alcanza un 43 % de agentes correctos, frente al 46 % de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4 000 millones de parámetros en safetensors (8,8 GB en fp16/bf16), se requieren aproximadamente 9–10 GB de VRAM para cargar los pesos en precisión de 16 bits, más el espacio para el contexto y el estado de generación.
- GPU recomendadas: A100 (40/80 GB) o H100 para ejecutar las tres copias del modelo simultáneamente con margen; una única RTX 4090 (24 GB) puede alojar una copia en bf16 y, con cuantización, varias.
- Cabe en GPU de consumo: sí, una sola copia en bf16 cabe en RTX 4090, RTX 3090 (24 GB) o RTX 4080 (16 GB); para las tres copias del experimento se necesita al menos 30 GB agregados, por lo que conviene una A100 o repartir entre varias GPU.
- Opciones de despliegue: Transformers (carga documentada en la model card con subfolder `export/global_step_30/policy`); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión a GGUF u otros formatos, que el autor no publica.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: 33 GB para el repositorio completo; 8,8 GB si solo se descargan los pesos exportados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-task-wiki-t2 | 4 000 M | no disponible | RL multiagente sobre Qwen3-4B | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4 000 M | no disponible en esta ficha | LLM denso de propósito general | Apache-2.0 | Hugging Face |
| mcemri/commenv-e1-t2-combined | 4 000 M | no disponible | Checkpoint previo (rompecabezas lógicos en equipo) | Apache-2.0 | Hugging Face |
| mcemri/commenv-task-wiki-untrained-start | 4 000 M | no disponible | Punto de partida sin entrenar para esta tarea | Apache-2.0 | Hugging Face |

La comparación relevante es interna al linaje de checkpoints del autor: este modelo mejora al checkpoint combinado previo en la tarea de búsqueda (46 % frente a 39 % de agentes correctos) y supera al inicio sin entrenar (43 %). Frente a Qwen3-4B original, la diferencia es de especialización, no de capacidad general; no se han publicado comparaciones con otros modelos multiagente en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un producto: el propio autor lo describe como "research checkpoints, not a product".
- El rendimiento absoluto es modesto: un 46 % de agentes correctos y un 42 % de equipos con los tres aciertos en el conjunto de evaluación.
- La generalización fuera de dominio es prácticamente nula: en LitSearch el cambio fue de 31 % a 32 %, sin mejora significativa.
- El modelo está entrenado para un protocolo muy específico (tres agentes, tablero compartido, seis turnos, tres búsquedas por agente); usarlo fuera de ese esquema no está validado.
- Sesgos conocidos: no disponibles en la información proporcionada; al heredar Qwen3-4B, arrastra los sesgos del modelo base y de los datos de HotpotQA.
- Riesgo de alucinación: no evaluado de forma específica en la model card; el modelo puede emitir respuestas sin evidencia recuperada.
- Idiomas soportados: no disponible; el entrenamiento se realiza sobre HotpotQA, mayoritariamente en inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el estado de investigación y la falta de validación en producción desaconsejan ese uso sin evaluación adicional.
- El repositorio incluye el estado del entrenador (22,5 GB) que solo es útil para reanudar el entrenamiento; descargarlo completo consume 33 GB.
- El archivo `trainer_state.pt` no está incluido, lo que puede limitar la reanudación exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-wiki-t2
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint de partida: https://huggingface.co/mcemri/commenv-e1-t2-combined
- Punto de partida sin entrenar: https://huggingface.co/mcemri/commenv-task-wiki-untrained-start
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo, papers, blogs o demos en la información proporcionada.
