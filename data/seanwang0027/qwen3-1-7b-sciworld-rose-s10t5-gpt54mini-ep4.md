# SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4

## Resumen

Este modelo es un ajuste fino de Qwen/Qwen3-1.7B publicado por el usuario SeanWang0027 bajo el identificador `qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4`. No es un asistente de propósito general: es un checkpoint de investigación entrenado específicamente para actuar como agente ReAct dentro de ScienceWorld, un entorno simulado de texto con tareas de física, química y biología. El modelo recibe observaciones del simulador como turnos de usuario y responde con el formato `Thought:\n...\n\nAction:\n<un comando>`.

El entrenamiento emplea una variante de destilación on-policy denominada "online multi-turn ROSE 10+5": en cada episodio el alumno (este Qwen3-1.7B) juega los 10 primeros turnos en un entorno ScienceWorld real y después un profesor (`gpt-5.4-mini` vía API de OpenAI, con `reasoning_effort=medium`) continúa el mismo entorno hasta 5 turnos más. Solo los turnos del profesor se usan como objetivo de entrenamiento con entropía cruzada; los del alumno y todas las observaciones son contexto. Este repositorio corresponde a la época 4 del estudio (paso 64 de la continuación iniciada desde los pesos de la época 3).

Su relevancia es doble: por un lado documenta de forma inusualmente transparente la dinámica de la destilación on-policy en modelos pequeños (incluida la oscilación de hábitos heredados del profesor y el ruido de evaluación), y por otro ofrece un punto de partida reproducible para investigar agentes de 2.000 millones de parámetros en entornos interactivos con un coste de cómputo muy bajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (familia Qwen3; detalles no especificados en la model card) |
| Parámetros totales | 2.031.739.904 (≈2,03 B, dato real de safetensors) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Qwen3-1.7B (32.768 tokens nativos ampliables con YaRN, no confirmado por el autor) |
| Tipos de cuantización | No disponible. El repositorio solo contiene pesos en safetensors (bf16); no se han publicado GGUF, AWQ, GPTQ ni variantes de 8/4 bits |
| Idiomas soportados | No disponible (el entrenamiento es íntegramente en inglés sobre ScienceWorld) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16), compatible con `transformers` |
| Tamaño del repositorio | 4,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso decoder-only. El autor no documenta modificaciones estructurales sobre el modelo base: el valor añadido está en el procedimiento de ajuste fino, no en la topología. El entrenamiento usa `bf16`, AdamW con tasa de aprendizaje constante de 1e-5 y un máximo de 512 tokens por turno, con el modo de pensamiento desactivado (`enable_thinking=False`).

El esquema ROSE 10+5 combina imitación de trayectorias largas con datos generados en línea. Se recopilan 2.059 variaciones de tareas, con 32 episodios por paso y 64 pasos por época; en cada época se regeneran prefijos del alumno y continuaciones del profesor, de modo que el conjunto de entrenamiento cambia por completo. Solo se optimiza la verosimilitud de la respuesta visible del profesor, y este repositorio continúa desde los pesos de la época 3 (paso 192 de la ejecución original) con un estado de AdamW reinicializado. Un hallazgo destacable del estudio es que el profesor reproduce literalmente la plantilla de acción `open/close OBJ` en el 29,89 % de sus propios turnos (acción que el simulador rechaza siempre), y que los alumnos heredan ese hábito con intensidad oscilante a lo largo del entrenamiento: este checkpoint lo comete en el 17,98 % de sus turnos, frente al 2,77 % de la época 5.

## Capacidades

- Generación de texto especializada en el formato ReAct: produce turnos con `Thought:` y `Action:` con un único comando ejecutable.
- Razonamiento multi-paso dentro de un episodio interactivo: mantiene el estado implícito de la tarea a lo largo de hasta 30 rondas de observación-acción (configuración de evaluación).
- Ejecución de acciones de manipulación y experimentación en ScienceWorld (abrir, cerrar, mover, mezclar, calentar, medir, etc.), con una precisión limitada por la tasa de éxito del 20,25 %.
- Seguimiento de instrucciones largas en inglés: la instrucción de AgentGym para ScienceWorld se inserta como turno de usuario y el modelo la mantiene como contexto.
- Conversación multiturno: el prompt alterna un turno de usuario por cada observación del simulador.
- No se documenta soporte de tool calling o function calling genérico, ni capacidades de visión, audio, agentes con herramientas externas o modo de pensamiento (el autor lo desactiva explícitamente).
- Multilingüismo: no documentado; el comportamiento esperado fuera del inglés es degradado al no haberse entrenado en otros idiomas.

## Casos de uso

- Investigación en destilación on-policy: reproducir o extender el estudio ROSE comparando este checkpoint con las épocas 3, 5 y 6 para medir la oscilación del hábito `open/close` y su correlación con la tasa de éxito.
- Punto de partida para nuevas épocas de entrenamiento: el autor indica que las épocas 4 a 6 continúan desde los pesos de la época 3 con AdamW reinicializado, por lo que este checkpoint sirve como inicialización para continuar la curva.
- Banco de pruebas de evaluadores de agentes: al tener una tasa de éxito intermedia (20,25 % ± 2,25) y ruido de evaluación conocido (≈3 puntos), es útil para calibrar harnesses de evaluación con múltiples pasadas y temperatura 0,4.
- Estudio de imitación de profesores propietarios: permite analizar cuantitativamente cómo se transfieren defectos del profesor (plantillas de acción inválidas) a un alumno de 2 B de parámetros.
- Base para ajuste fino en entornos ReAct propios: el modelo ya emite el formato `Thought:`/`Action:` de forma estable, de modo que un SFT corto sobre un simulador distinto puede reutilizar ese comportamiento.
- Experimentos de bajo coste en investigación académica: con 2,03 B de parámetros en bf16 cabe en una GPU de consumo, lo que permite iterar sobre pipelines de agentes sin acceso a clústeres.
- Docencia y divulgación sobre agentes LLM: sirve como ejemplo reproducible de agente ReAct con un entorno verificable y métricas objetivas de éxito.
- No se recomienda su uso en atención al cliente, generación de código en producción ni asistentes generalistas: no hay evidencia de rendimiento en esas tareas.

## Benchmarks y rendimiento

Los únicos datos publicados proceden del propio autor, evaluados sobre ScienceWorld (200 variaciones de tarea, 4 pasadas independientes a temperatura 0,4, 512 tokens por turno, máximo 30 rondas, pensamiento desactivado, sin turno de sistema). El éxito se define como puntuación final 100 y Avg@1 como la puntuación final media dividida entre 100.

| Método | Época | Tasa de éxito | Avg@1 | Turnos con `open/close …` literal | Modelo |
|---|---|---|---|---|---|
| Qwen3-1.7B base | — | 0,12 % | — | — | Qwen/Qwen3-1.7B |
| SFT | 2 | 13,25 % ± 2,56 | 0,1574 | 74,20 % | qwen3-1.7b-sciworld-sft-gpt54mini-ep2 |
| SFT | 3 | 12,88 % ± 1,24 | 0,1557 | 74,88 % | qwen3-1.7b-sciworld-sft-gpt54mini-3ep |
| ROSE 10+5 | 2 | 7,75 % ± 1,92 | 0,1455 | 62,68 % | qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2 |
| ROSE 10+5 | 3 | 17,50 % ± 2,29 (repetición: 15,38 % ± 1,43) | 0,2942 (0,2512) | 35,22 % | qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep |
| ROSE 10+5 | 4 (este modelo) | 20,25 % ± 2,25 | 0,3433 | 17,98 % | qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4 |
| ROSE 10+5 | 5 | 25,75 % ± 1,30 | 0,3692 | 2,77 % | qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5 |
| ROSE 10+5 | 6 | 20,75 % ± 1,82 | 0,2946 | 26,59 % | qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6 |

El autor advierte que diferencias por debajo de unos 3 puntos quedan dentro del ruido de evaluación (una repetición de la época 3 pasó de 17,50 % a 15,38 %). La época 5 obtiene el mejor resultado del estudio, por lo que este checkpoint no es el óptimo de la serie. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 los pesos ocupan ≈4,1 GB; con caché KV y activaciones para lotes pequeños conviene reservar 6-8 GB. En 8 bits ≈2,1 GB y en 4 bits ≈1,2 GB (estimaciones a partir del recuento real de parámetros, cuantizaciones no publicadas por el autor).
- GPU recomendadas: cualquier GPU con ≥8 GB para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4, A10). Para servir varios usuarios en paralelo, A100 40/80 GB o H100 ofrecen mayor margen.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB o una RTX 4090 ejecutan el modelo en bf16 sin cuantizar; una GPU de 6-8 GB puede requerir carga en 8 bits.
- Opciones de despliegue: `transformers` con `torch_dtype="bfloat16"` (ruta documentada por el autor), Text Generation Inference (el modelo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM, dado que soporta la arquitectura Qwen3. llama.cpp y Ollama requerirían convertir previamente a GGUF, formato que no se distribuye.
- Contexto de despliegue: el entrenamiento usa 512 tokens por turno, y la evaluación se limita a 30 rondas, por lo que la ventana efectiva necesaria en producción es modesta; no hay datos publicados de latencia ni de throughput.
- Precisión de la plantilla: el autor indica renderizar con la plantilla de chat de Qwen3 y `enable_thinking=False`; usar el modo de pensamiento cambia el formato de salida respecto al entrenamiento.

## Comparativa con modelos similares

No hay datos publicados de benchmarks frente a modelos de otras familias. La comparación más informativa es interna al estudio del autor, ya que todos los checkpoints parten del mismo modelo base y se evalúan con el mismo protocolo.

| Modelo | Método | Parámetros | Contexto documentado | Tasa de éxito en ScienceWorld | Licencia |
|---|---|---|---|---|---|
| Este modelo (ROSE época 4) | Destilación on-policy ROSE 10+5 | 2,03 B | No disponible | 20,25 % ± 2,25 | Apache 2.0 |
| ROSE época 5 | Destilación on-policy ROSE 10+5 | 2,03 B | No disponible | 25,75 % ± 1,30 | Apache 2.0 |
| ROSE época 3 | Destilación on-policy ROSE 10+5 | 2,03 B | No disponible | 17,50 % ± 2,29 | Apache 2.0 |
| SFT época 3 | Supervisión fuera de línea | 2,03 B | No disponible | 12,88 % ± 1,24 | Apache 2.0 |
| Qwen3-1.7B base | Sin ajuste | 1,7 B (≈2,03 B con embeddings según recuento del repo) | 32.768 tokens según el modelo base | 0,12 % | Apache 2.0 |

No se dispone de comparaciones con otros agentes de tamaño similar (por ejemplo, variantes ajustadas de Llama 3.2 1B/3B o Gemma) en ScienceWorld dentro de la información proporcionada.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: la tasa de éxito es del 20,25 %, es decir, aproximadamente cuatro de cada cinco tareas no se completan. No es apto para uso en producción sin un ajuste adicional sustancial.
- Sesgo/hábito heredado: en el 17,98 % de los turnos genera la plantilla literal `open/close OBJ`, que el simulador rechaza siempre. Este defecto proviene del profesor (`gpt-5.4-mini`, 29,89 % de turnos inválidos en su propia política) y degrada directamente el éxito del alumno.
- Ruido de evaluación: diferencias inferiores a unos 3 puntos no son significativas; el propio autor midió 17,50 % y 15,38 % sobre el mismo checkpoint en pasadas distintas.
- Especialización extrema: el modelo solo ha sido entrenado para ScienceWorld en formato ReAct. Fuera de ese entorno y de ese formato, el comportamiento es impredecible.
- Modo de pensamiento desactivado durante el entrenamiento: activar `enable_thinking=True` no está evaluado y puede romper el formato `Thought:`/`Action:`.
- Idioma: no se declaran idiomas soportados y el entrenamiento es monolingüe en inglés; no hay garantía alguna de funcionamiento en castellano.
- Sin cuantizaciones publicadas: el repositorio solo contiene safetensors bf16, lo que obliga a convertir para usar llama.cpp, Ollama o GPUs con poca VRAM.
- Validación comunitaria nula: 0 descargas y 0 likes; no hay informes independientes de reproducibilidad.
- Licencia: los pesos se publican bajo Apache 2.0, que permite uso comercial, pero el entrenamiento se basa en salidas de un profesor propietario (`gpt-5.4-mini` vía API de OpenAI). Conviene revisar los términos de uso de ese proveedor antes de explotar comercialmente un modelo destilado a partir de sus respuestas.
- Alucinación: en un entorno simulado las acciones inválidas se rechazan de forma determinista, pero fuera de ScienceWorld el modelo puede generar comandos y razonamientos plausibles y falsos sin ninguna señal de calibración.
- Advertencia sobre la búsqueda web: los resultados recuperados para esta ficha no guardan relación con el modelo (corresponden a la Puerta de Brandeburgo), por lo que no aportan enlaces ni datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoints relacionados del mismo estudio:
  - SFT época 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep1
  - SFT época 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2
  - SFT época 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
  - ROSE época 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep1
  - ROSE época 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2
  - ROSE época 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
  - ROSE época 5: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5
  - ROSE época 6: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6
- Paper, blog o repositorio del método ROSE: no disponible en la información proporcionada.
- Entorno ScienceWorld y AgentGym: no disponible en la información proporcionada (solo se mencionan por nombre en la model card, sin enlace).
