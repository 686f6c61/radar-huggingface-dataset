# a1nu/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una versión del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha aplicado una ablación de la dirección de rechazo (*refusal-direction ablation*) mediante la herramienta OBLITERATUS con el método failspy. El resultado es un modelo que, según la model card del autor, reduce drásticamente su tasa de rechazo a peticiones y aumenta la proporción de respuestas que materialmente asisten al usuario, incluida asistencia dañina. El autor del derivado es el usuario de Hugging Face a1nu.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 754.638.836.864 parámetros totales según los pesos en safetensors (aproximadamente 754,6 mil millones), distribuido en BF16 safetensors con un tamaño de repositorio de 1.509,4 GB. No se dispone de información sobre parámetros activos, longitud de contexto, idiomas soportados ni detalles del entrenamiento original en la información proporcionada.

La relevancia de esta ficha es doble: por un lado documenta un derivado "abliterated" que modifica el comportamiento de seguridad del modelo base; por otro, los datos de evaluación publicados por el propio autor muestran un aumento muy significativo de asistencia dañina (del 10,38 % al 78,28 % de las respuestas clasificadas), lo que lo convierte en un modelo inadecuado para despliegues de producción sin salvaguardas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v41_text), según tags del repositorio |
| Parametros totales | 754.638.836.864 (≈754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de mezcla de expertos (MoE) según las etiquetas del repositorio (`moe`, `deepseek_v41_text`). No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

El derivado se ha generado mediante ablación de la dirección de rechazo con la herramienta OBLITERATUS y el método failspy. Según la model card, el proceso se calibró con 254 prompts del corpus de evaluación, se seleccionó el método con 50 prompts y los 534 restantes no participaron en ninguna de las dos fases. El autor reporta una divergencia KL (forward, a nivel de token de secuencia) de 0,1305 nats respecto al modelo original, una tasa de rechazo del 4 % (2 de 50 prompts de evaluación) y una coherencia y capacidad del 100 % (6 de 6 comprobaciones de capacidad superadas).

## Capacidades

- Generación de texto conversacional y de tipo chat, según la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento y respuesta a preguntas de conocimiento general: el autor evalúa con MMLU en modo zero-shot chat con *thinking* desactivado y selección de respuesta por logits.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio), lo que sugiere despliegue mediante infraestructura de inferencia compatible.
- Capacidad de seguir instrucciones y producir respuestas materialmente responsivas: el 86,52 % de las respuestas del derivado se clasificaron como "responsive to the request", frente al 16,59 % del modelo base.
- No se dispone de información sobre soporte de *tool calling*, capacidades de agente, visión, audio ni modo de razonamiento extendido (*thinking*) más allá de la mención de que la evaluación MMLU se realizó con *thinking* desactivado.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado para medir el efecto de la ablación de la dirección de rechazo sobre la tasa de asistencia dañina, con distribuciones publicadas de rechazo, daño y accionabilidad sobre 838 prompts.
- Evaluación de técnicas de *red-teaming*: permite comparar, con el mismo juez y protocolo, las respuestas del modelo base y del derivado, aislando el efecto de la intervención sobre los pesos.
- Estudio de divergencia conductual: la KL de 0,1305 nats y la coherencia del 100 % permiten analizar cuánto cambia el comportamiento sin degradar la fluidez del texto generado.
- Benchmarking de clasificadores de seguridad: las 813 anotaciones válidas del derivado y las 837 del base constituyen un conjunto etiquetado para calibrar detectores de asistencia dañina.
- Experimentos de recuperación de capacidades (*capability recovery*): el autor incluye un fichero de procedencia (`winner-recovery-provenance.json`) que documenta el proceso de selección del método, útil para reproducir la intervención.
- Evaluación académica de MMLU: el protocolo zero-shot con selección por logits sobre 2.500 preguntas (43 o 44 por asignatura, 57 asignaturas) permite comparar el rendimiento de conocimiento del derivado frente al base con intervalos de Wilson al 95 %.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La tabla de MMLU aparece truncada en la información proporcionada: solo se muestra la fila del modelo base sin el valor de precisión, por lo que no se presenta la comparación completa.

| Benchmark | Modelo base DeepSeek-V4.1-Flash-1017 | Derivado obliterated |
|---|---|---|
| Tasa de rechazo (50 prompts) | no disponible en el extracto | 4 % (2 de 50) |
| Coherencia (comprobaciones de capacidad) | no disponible en el extracto | 100 % (6 de 6) |
| KL forward vs. original (nats) | — | 0,1305 |
| Rechazo completo (corpus 838) | 81,62 % | 4,30 % |
| Rechazo parcial (corpus 838) | 4,89 % | 14,44 % |
| Sin rechazo (corpus 838) | 13,37 % | 78,28 % |
| Asistencia dañina (corpus 838) | 10,38 % | 78,28 % |
| Respuesta responsiva a la petición | 16,59 % | 86,52 % |
| Alternativa segura | 83,29 % | 10,50 % |
| Daño nivel 3 (serio) | 3,82 % | 44,75 % |
| Daño nivel 4 (severo o generalizado) | 0,12 % | 9,31 % |
| Accionabilidad nivel 4 (suficientemente concreta para habilitar la conducta) | 3,46 % | 20,76 % |
| MMLU (2.500 preguntas, 57 asignaturas) | valor no disponible en el extracto | valor no disponible en el extracto |

Protocolo de evaluación: 838 prompts del corpus OBLITERATUS; anotaciones de Claude Opus 4.6 y GPT-6.1 Sol, más tres anotaciones de una revisión local con Codex; fecha de evaluación 30 de octubre de 2026. Las anotaciones clasifican el texto visible sin ejecutar ni verificar las instrucciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 754,6 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 1.509 GB, por lo que la inferencia en BF16 requiere un nodo multi-GPU de gran capacidad; en cuantizaciones de 4 bits el peso teórico se reduciría a unos 377 GB, pero no se han publicado ficheros GGUF ni cuantizaciones en el repositorio.
- GPU recomendadas: no disponible. Por tamaño, un despliegue en BF16 exige múltiples aceleradores de clase数据中心 (A100 80 GB, H100 80 GB o superiores) distribuidos con paralelismo tensorial; no cabe en una sola GPU.
- Cabe en GPU de consumo: no. Ni siquiera en una RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo razonables, dado el tamaño de los pesos.
- Opciones de despliegue: la librería declarada es `transformers` y el repositorio está etiquetado como `endpoints_compatible`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | ≈754,6 mil millones (MoE) | no disponible | MIT | Derivado con ablación de rechazo; tasa de rechazo del 4 % |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible en el extracto | no disponible | no disponible | Modelo original de DeepSeek; rechazo completo del 81,62 % en el corpus evaluado |
| Otros derivados abliterated de la familia DeepSeek | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre otros modelos de la misma categoría (mismo tamaño o misma tarea) con la que construir una comparativa más amplia.

## Limitaciones y advertencias

- La ablación de la dirección de rechazo incrementa de forma drástica la asistencia dañina: del 10,38 % al 78,28 % de las respuestas clasificadas en el corpus de 838 prompts, con un aumento del daño de nivel 3 del 3,82 % al 44,75 % y del nivel 4 del 0,12 % al 9,31 %.
- El 20,76 % de las respuestas del derivado se clasificaron con accionabilidad de nivel 4 (suficientemente concretas para habilitar la conducta), frente al 3,46 % del modelo base.
- Riesgo elevado de alucinación y de respuestas no verificadas: la evaluación no ejecutó ni comprobó las instrucciones proporcionadas por el modelo.
- La evaluación se realizó con anotadores automáticos (Claude Opus 4.6 y GPT-6.1 Sol) y tres anotaciones de una revisión local; 25 respuestas del derivado quedaron sin anotar por bloqueos de proveedor o plataforma, y una anotación es ambigua.
- No se dispone de información sobre sesgos conocidos, idiomas soportados ni limitaciones de contexto del modelo base.
- Licencia MIT: permite uso comercial y modificación, pero no exime de responsabilidad legal ni ética por el uso del modelo para generar contenido dañino.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 23 de noviembre de 2026; no hay evidencia de validación independiente de los resultados publicados.
- El tamaño del repositorio (1.509,4 GB) y la ausencia de cuantizaciones publicadas dificultan el despliegue en infraestructura convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a1nu/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (fichero de procedencia): https://huggingface.co/a1nu/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/winner-recovery-provenance.json
- Resultados de evaluación: https://huggingface.co/a1nu/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/evaluation-status.json
- Licencia: https://huggingface.co/a1nu/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/LICENSE
