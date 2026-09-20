# SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2

## Resumen

`SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2` es un ajuste fino de Qwen3-1.7B orientado exclusivamente a agentes ReAct en el entorno ScienceWorld. No es un modelo de propósito general: es un checkpoint de investigación publicado dentro de un estudio sobre destilación on-policy (ROSE, *Replay/Online Student-Environment distillation*) en el que un profesor propietario (`gpt-5.4-mini` de OpenAI, con `reasoning_effort=medium`) continúa episodios que el estudiante ha empezado en un entorno ScienceWorld real.

El modelo tiene 2.031.739.904 parámetros (~2,03 B) en precisión bf16 y se distribuye en safetensors bajo licencia Apache 2.0. Corresponde a la época 2 (paso 128 de 192) de una ejecución de tres épocas. Su relevancia es metodológica más que de producto: sirve para estudiar cómo se propagan hábitos degenerados del profesor al estudiante y cómo oscilan durante el entrenamiento en línea.

El dato clave para evaluarlo es su rendimiento: 7,75 % ± 1,92 de tasa de éxito en el test de ScienceWorld (200 variaciones de tarea, 4 pasadas independientes), frente al 25,75 % ± 1,30 del checkpoint de la época 5 de la misma familia y al 0,12 % del Qwen3-1.7B base sin ajustar. El propio autor advierte que este checkpoint se guardó durante un pico de recaída del hábito `open/close` y que, por tanto, infrarepresenta el estado del entrenamiento en ese punto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) con RoPE, GQA y SwiGLU; ajustado para política de agente ReAct |
| Parámetros totales | 2 031 739 904 (~2,03 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-1.7B tiene 32 768 tokens nativos, extensibles a 131 072 con YaRN |
| Longitud de generación por turno | 512 tokens |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en bf16 (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carga con `transformers`) |
| Modelo base | Qwen/Qwen3-1.7B |
| Método de ajuste | Destilación on-policy ROSE 10+5 sobre salidas de `gpt-5.4-mini` |
| Tamaño del repositorio | 4,1 GB |
| Etiquetas | scienceworld, agent, react, distillation, on-policy |
| Compatibilidad de despliegue | `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-1.7B original sin modificaciones estructurales: un transformer decoder-only denso, con atención de consultas agrupadas (GQA) y embeddings atados. El ajuste no introduce cabezas adicionales ni módulos de razonamiento; el cambio es puramente de pesos, orientado a producir respuestas con el formato `Thought:\n...\n\nAction:\n<comando>`.

El entrenamiento usa ROSE en línea multi-turno: en cada episodio el estudiante juega los 10 primeros turnos en un entorno ScienceWorld real y después el profesor (`gpt-5.4-mini`, `reasoning_effort=medium`) continúa el mismo entorno durante hasta 5 turnos. Solo los turnos del profesor son objetivos de entrenamiento (entropía cruzada); los turnos del estudiante y todas las observaciones se usan como contexto, y únicamente se aprovecha la respuesta visible del profesor. La configuración es de 2059 variaciones de tarea, 32 episodios por paso, 64 pasos por época, optimizador AdamW con learning rate constante de 1e-5, precisión bf16, modo *thinking* desactivado y 512 tokens por turno. Este checkpoint concreto corresponde al paso 128 de una ejecución original de 3 épocas (192 pasos); las épocas 4 a 6 de la familia continuaron desde los pesos de la época 3 con un AdamW reinicializado, porque no se había guardado el estado del optimizador.

La innovación metodológica destacable es el propio esquema de destilación en línea, y también su hallazgo negativo: el profesor copia literalmente la plantilla de acción `open/close OBJ` del prompt en el 29,89 % de sus turnos, y esa plantilla es rechazada siempre por el simulador. Los estudiantes heredan el hábito, y su tasa de éxito en test correlaciona inversamente con la fuerza de ese hábito en cada checkpoint (74,20 % de turnos con `open/close` en el checkpoint SFT de época 2; 2,77 % en el mejor checkpoint ROSE, época 5).

## Capacidades

- Generación de texto con formato ReAct estricto: produce un bloque `Thought:` seguido de un bloque `Action:` con un único comando ejecutable por turno.
- Ejecución de tareas de agente multi-turno en el simulador ScienceWorld: el modelo recibe una observación por turno como mensaje de usuario y responde con la siguiente acción.
- Razonamiento de sentido común científico elemental acotado al dominio de ScienceWorld (mezclas, cambios de estado, instrumentos de laboratorio, secuencias experimentales).
- Seguimiento del protocolo de prompt del estudio: plantilla de chat de Qwen3 con `enable_thinking=False`, instrucción de AgentGym para ScienceWorld como turno de usuario y un acuse de recibo predefinido del asistente.
- No se declara soporte de *tool calling* ni de *function calling* genérico: la única «herramienta» es el bucle observación-acción del simulador.
- No se declara soporte de agentes multiherramienta, visión, audio ni otras modalidades.
- Capacidades multilingües: no declaradas en la model card y no evaluadas.
- Modo *thinking*: explícitamente desactivado durante el entrenamiento y la evaluación; no es una capacidad esperada del checkpoint.

## Casos de uso

- Reproducción de experimentos de destilación on-policy: sirve como punto intermedio de la curva ROSE (época 2) frente a la época 1, la época 3 y las épocas 4 a 6, para estudiar la varianza entre checkpoints de una misma ejecución.
- Estudio de hábitos degenerados inducidos por el profesor: con un 62,68 % de turnos con `open/close` literal en test, es un caso de estudio directo de cómo un patrón inútil del profesor se propaga al estudiante y de cómo el simulador lo penaliza rechazando cada comando.
- Investigación sobre dinámica de entrenamiento en línea: permite analizar la oscilación del hábito a lo largo de las épocas (picos en la 2 y la 6, mínimos en la 3 y la 5), un fenómeno que el autor documenta explícitamente.
- Evaluación de arneses de agentes ReAct: útil para validar el *pipeline* de ScienceWorld, el formateo de observaciones y el bucle de hasta 30 rondas antes de lanzar ejecuciones más costosas.
- Pruebas de infraestructura de servicio para modelos pequeños: 2,03 B de parámetros en bf16 caben en cualquier GPU de consumo, por lo que es cómodo para medir latencia de `transformers`, vLLM o TGI con cargas de agente de muchos turnos cortos.
- Material docente sobre destilación: el contraste entre el 0,12 % del modelo base y los distintos checkpoints ajustados ilustra de forma medible qué aporta el ajuste y qué no.
- Base para continuar el entrenamiento: al ser un checkpoint intermedio con pesos completos, puede reanudarse para explorar épocas adicionales o variantes del esquema 10+5 (con la salvedad de que el estado del optimizador no está disponible).
- Punto de comparación para ablaciones de prompt: al estar entrenado con una plantilla concreta (thinking off, acuse de recibo fijo, 512 tokens por turno), permite medir la sensibilidad a cambios en ese formato.

## Benchmarks y rendimiento

Todos los datos provienen del autor. Evaluación sobre ScienceWorld test con 200 variaciones de tarea, 4 pasadas independientes a temperatura 0,4, 512 tokens por turno, como máximo 30 rondas, *thinking* desactivado y sin turno de sistema. Éxito = puntuación final 100; Avg@1 = puntuación final media / 100.

| Modelo | Método y época | Tasa de éxito | Avg@1 | Turnos con `open/close` literal |
|---|---|---|---|---|
| Qwen3-1.7B base | sin ajustar | 0,12 % | no disponible | no disponible |
| qwen3-1.7b-sciworld-sft-gpt54mini-ep2 | SFT, época 2 | 13,25 % ± 2,56 | 0,1574 | 74,20 % |
| qwen3-1.7b-sciworld-sft-gpt54mini-3ep | SFT, época 3 | 12,88 % ± 1,24 | 0,1557 | 74,88 % |
| **este modelo** (`...rose-s10t5-gpt54mini-ep2`) | ROSE 10+5, época 2 | **7,75 % ± 1,92** | **0,1455** | **62,68 %** |
| qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep | ROSE 10+5, época 3 | 17,50 % ± 2,29 (nueva pasada: 15,38 % ± 1,43) | 0,2942 (0,2512) | 35,22 % |
| qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4 | ROSE 10+5, época 4 | 20,25 % ± 2,25 | 0,3433 | 17,98 % |
| qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5 | ROSE 10+5, época 5 | **25,75 % ± 1,30** | **0,3692** | 2,77 % |
| qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6 | ROSE 10+5, época 6 | 20,75 % ± 1,82 | 0,2946 | 26,59 % |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de propósito general. Los checkpoints de la época 1 (SFT y ROSE) figuran como «no evaluados». El propio autor señala que reevaluar el mismo checkpoint de ROSE época 3 con 4 pasadas nuevas desplazó su tasa de éxito de 17,50 % a 15,38 %, de modo que las diferencias por debajo de unos 3 puntos quedan dentro del ruido de evaluación.

## Requisitos de hardware

- VRAM en bf16: unos 4,1 GB solo de pesos; con caché KV y activaciones para un contexto de agente de varios miles de tokens, entre 6 y 8 GB.
- VRAM en fp16: equivalente, en torno a 4,1 GB de pesos.
- VRAM en int8: aproximadamente 2,0-2,2 GB de pesos.
- VRAM en int4: aproximadamente 1,1-1,5 GB de pesos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080/4090, e incluso tarjetas de 8 GB si se usa int4 o int8.
- GPU de centro de datos: no necesita A100 ni H100; una L4, T4 o A10 es más que suficiente, y en A100/H100 el modelo queda enormemente infrautilizado salvo que se desplieguen muchas réplicas concurrentes.
- Opciones de despliegue: `transformers` (vía indicada por el autor), vLLM, Hugging Face TGI (el repositorio está marcado como `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama haría falta convertir los pesos a GGUF, conversión que no se publica en el repositorio.
- Latencia y throughput: no disponibles. El entrenamiento y la evaluación usaron 512 tokens por turno, con *thinking* desactivado, lo que en la práctica implica respuestas cortas y baja latencia por turno, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Método | Tasa de éxito en ScienceWorld test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ROSE 10+5, época 2) | 2,03 B | Destilación on-policy desde `gpt-5.4-mini` | 7,75 % ± 1,92 | Apache 2.0 | Hugging Face, 0 descargas |
| qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5 | 2,03 B | Igual, época 5 | 25,75 % ± 1,30 | Apache 2.0 | Hugging Face, mismo autor |
| qwen3-1.7b-sciworld-sft-gpt54mini-ep2 | 2,03 B | SFT supervisado | 13,25 % ± 2,56 | Apache 2.0 | Hugging Face, mismo autor |
| Qwen/Qwen3-1.7B | 2,03 B | Modelo base sin ajustar | 0,12 % | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos de agentes para ScienceWorld en la información proporcionada, por lo que no es posible comparar con alternativas externas a esta familia de checkpoints. Las comparaciones entre checkpoints del mismo estudio deben tomarse con cautela: el propio autor indica que diferencias inferiores a unos 3 puntos están dentro del ruido de evaluación de 4 pasadas.

## Limitaciones y advertencias

- Rendimiento bajo y no competitivo: 7,75 % ± 1,92 de tasa de éxito, frente al 25,75 % del checkpoint de la época 5 de la misma ejecución. No es el checkpoint que debería elegirse dentro de esta familia.
- Checkpoint sesgado por el momento de guardado: se salvó durante un pico de recaída del hábito `open/close` (62,68 % de sus turnos de test), situación que el propio autor describe como poco representativa del estado real de la ejecución en ese punto.
- Hábito degenerado heredado del profesor: el profesor emite `open/close OBJ` literal en el 29,89 % de sus propios turnos y el simulador lo rechaza siempre; el estudiante reproduce el patrón, lo que consume turnos y degrada la puntuación.
- Ruido de evaluación: diferencias por debajo de unos 3 puntos no son significativas según la reevaluación del checkpoint de época 3 (17,50 % → 15,38 %).
- Ausencia total de benchmarks generales: no hay MMLU, HumanEval, GSM8K ni evaluaciones de conversación, razonamiento o matemáticas. Se desconoce si conserva las capacidades generales del Qwen3-1.7B base.
- Idiomas no declarados ni evaluados: no hay garantía de comportamiento coherente fuera del inglés de ScienceWorld.
- Dominio extremadamente estrecho: el entrenamiento solo cubre turnos del profesor dentro de ScienceWorld, con ReAct, 512 tokens por turno y *thinking* desactivado. Fuera de ese formato es esperable un rendimiento errático.
- Riesgo de acciones inválidas y alucinación: el modelo puede emitir comandos que el simulador rechaza; no se han publicado tasas de comandos inválidos distintas de la del hábito `open/close`.
- Sin validación de la comunidad: 0 descargas y 0 «me gusta» en el momento de redactar esta ficha, sin issues ni evaluaciones de terceros.
- Licencia Apache 2.0 permite uso comercial del modelo y de los pesos, pero los datos de entrenamiento derivan de salidas de un profesor propietario (`gpt-5.4-mini` vía API de OpenAI); conviene revisar los términos del proveedor antes de un uso comercial.
- El estado del optimizador no se guardó, por lo que reproducir o continuar el entrenamiento desde este checkpoint no es exacto.
- No apto para producción como asistente conversacional: su única función evaluada es actuar como política de agente en ScienceWorld.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint SFT, época 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2
- Checkpoint SFT, 3 épocas: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
- Checkpoint ROSE 10+5, época 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep1
- Checkpoint ROSE 10+5, época 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
- Checkpoint ROSE 10+5, época 4: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4
- Checkpoint ROSE 10+5, época 5: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5
- Checkpoint ROSE 10+5, época 6: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con ScienceWorld: los enlaces recuperados correspondían a la letra de la canción «Dream of Me» de OMD y no guardan relación con el contenido de esta ficha. No se dispone de enlaces a paper, blog o repositorio del estudio más allá de la propia model card.
