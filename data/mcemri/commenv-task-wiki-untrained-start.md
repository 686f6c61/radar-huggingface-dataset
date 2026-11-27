# mcemri/commenv-task-wiki-untrained-start

## Resumen

`mcemri/commenv-task-wiki-untrained-start` es un checkpoint de investigacion publicado por el usuario mcemri en Hugging Face. No se trata de un modelo de proposito general, sino de un artefacto experimental: Qwen3-4B afinado con aprendizaje por refuerzo (GRPO) durante 30 pasos para que tres copias del modelo colaboren entre si resolviendo preguntas de HotpotQA mediante busquedas repartidas sobre un corpus de parrafos de Wikipedia.

El escenario de entrenamiento es un entorno multiagente de comunicacion: cada uno de los tres agentes solo puede buscar en un tercio distinto de la coleccion de parrafos, y los dos parrafos necesarios para responder una pregunta estan en partes diferentes. Los agentes conversan a traves de un tablero compartido durante un maximo de seis turnos y cada uno debe emitir una respuesta final. El objetivo es estudiar si el RL mejora la coordinacion y la comunicacion entre agentes, no ofrecer un asistente listo para produccion.

El modelo parte de Qwen3-4B (licencia Apache-2.0) y se distribuye como checkpoint de investigacion. El autor lo describe explicitamente como "research checkpoints, not a product". Su relevancia es acotada: sirve como referencia reproducible para quien investigue comunicacion emergente, busqueda multiagente o entrenamiento con GRPO sobre modelos de 4 mil millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carpeta `export/global_step_30/policy`, 8,8 GB); checkpoint del entrenador en 4 shards (22,5 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B, un transformer decoder-only de 4 mil millones de parametros. El autor no documenta cambios arquitectonicos sobre el modelo base; el interes esta en el procedimiento de entrenamiento. Se aplica GRPO (Group Relative Policy Optimization) durante 30 pasos, con 256 rondas por paso, lo que supone 7.680 preguntas de entrenamiento extraidas del split de entrenamiento de HotpotQA (9.000 preguntas sobre 102.301 parrafos).

El entorno es multiagente: tres instancias del modelo comparten un tablero de comunicacion, cada una con acceso a un tercio disjunto del corpus de parrafos y con tres busquedas de tres coincidencias cada una. La recompensa se define por la correccion de las respuestas individuales y, presumiblemente, por la coordinacion del equipo. El checkpoint publicado corresponde al paso 30; el autor no detalla hiperparametros adicionales (learning rate, tamano de grupo, funcion de recompensa exacta) en la informacion disponible.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas sobre parrafos de Wikipedia (HotpotQA).
- Busqueda simulada en un corpus particionado: cada agente emite consultas y recibe coincidencias de su tercio asignado.
- Comunicacion multiagente a traves de un tablero compartido durante hasta seis turnos.
- Razonamiento multi-hop limitado: las preguntas de HotpotQA requieren combinar dos parrafos situados en particiones distintas.
- Emision de una respuesta final obligatoria por parte de cada uno de los tres agentes.
- Soporte de tool calling / function calling: no disponible como capacidad general; la "busqueda" es una accion del entorno de entrenamiento, no una API documentada.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion en comunicacion emergente: reproducir el experimento de GRPO con tres agentes y analizar que protocolos de comunicacion surgen en el tablero compartido tras 30 pasos.
- Estudio de coordinacion multiagente: comparar el rendimiento del equipo (43% de agentes correctos) frente a un agente unico sin restricciones de particion (43%), para medir el coste de la division de informacion.
- Base para ablaciones de GRPO: partir de este checkpoint y variar el numero de pasos, el tamano del grupo o la estructura de recompensa para estudiar la estabilidad del entrenamiento.
- Evaluacion de generalizacion fuera de dominio: usar las preguntas de LitSearch (28% de acierto antes y despues del entrenamiento) como test de transferencia y detectar sobreajuste al entorno de HotpotQA.
- Docencia y divulgacion: ilustrar un pipeline completo de RL multiagente con un modelo de 4B que cabe en una GPU consumer en cuantizacion, usando los checkpoints como material didactico.
- Reproduccion de resultados: cargar `export/global_step_30/policy` en Transformers y verificar las cifras reportadas (36% a 43% de agentes correctos; 28% a 37% de equipos con los tres agentes correctos) sobre las 600 preguntas reservadas.

## Benchmarks y rendimiento

| Metrica | Antes del run (paso 0) | Despues de 30 pasos | Delta |
|---|---|---|---|
| Agentes correctos (600 preguntas reservadas, 66.581 parrafos) | 36% | 43% | +7,3 puntos (IC 95%: 4,6 a 10,1) |
| Equipos con los tres agentes correctos | 28% | 37% | +9 puntos |
| Equipos en los que aparecen los dos parrafos necesarios en alguna busqueda | 52% | 70% | +18 puntos |
| Agente unico sin restriccion de particion (referencia) | 43% | no aplica | no aplica |
| LitSearch (fuera de distribucion), agentes correctos | 28% | 28% | 0 puntos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,8 GB en precision de los pesos publicados (safetensors); en cuantizacion de 8 bits, en torno a 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones a partir del tamano del checkpoint, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB en cuantizacion de 4 bits.
- Opciones de despliegue: Transformers (metodo documentado por el autor con `AutoModelForCausalLM.from_pretrained` y subcarpeta `export/global_step_30/policy`); vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles. El checkpoint del entrenador ocupa 22,5 GB en 4 shards y solo es necesario para reanudar el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-task-wiki-untrained-start | 4B | no disponible | RL multiagente (GRPO) sobre Qwen3-4B | Apache-2.0 | Hugging Face (checkpoint de investigacion) |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | LLM generalista base | Apache-2.0 | Hugging Face |
| Agente unico sin particion (referencia del propio autor) | 4B | no disponible | Busqueda sobre la coleccion completa | Apache-2.0 | No distribuido como modelo separado |

No se dispone de comparaciones con otros modelos multiagente de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor lo define explicitamente como checkpoint de investigacion, no como producto; no debe usarse en produccion.
- Entrenado solo 30 pasos de GRPO sobre 7.680 preguntas de HotpotQA: el ajuste es minimo y el modelo conserva los sesgos y limitaciones de Qwen3-4B.
- No generaliza fuera del entorno: en LitSearch el rendimiento no cambia (28% antes y despues), lo que indica dependencia del formato y del corpus de entrenamiento.
- El escenario requiere un entorno especifico (corpus particionado en tercios, tablero compartido, seis turnos maximos) que no se distribuye con el modelo; sin ese entorno las capacidades multiagente no son reproducibles.
- Riesgo de alucinacion inherente a un modelo de 4B en tareas de respuesta extractiva multi-hop.
- Idiomas soportados no documentados; el entrenamiento se realiza sobre HotpotQA, en ingles.
- Sesgos conocidos del modelo base Qwen3-4B no evaluados en esta ficha.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero su naturaleza experimental hace desaconsejable cualquier despliegue real.
- El repositorio ocupa 33 GB e incluye el estado del optimizador; descargar solo la subcarpeta `export/global_step_30/policy` (8,8 GB) para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-wiki-untrained-start
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
