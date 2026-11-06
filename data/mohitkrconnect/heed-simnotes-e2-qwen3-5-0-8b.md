# mohitkrconnect/heed-simnotes-e2-qwen3.5-0.8b

## Resumen

`heed-simnotes-e2-qwen3.5-0.8b` es un checkpoint de investigacion publicado por el desarrollador independiente mohitkrconnect (Mohit Kumar) dentro del proyecto Heed, una aplicacion de conversion de notas de voz en tareas estructuradas. El modelo parte de `Qwen/Qwen3.5-0.8B-Base` y se ha ajustado mediante fine-tuning completo para extraer tareas, intenciones y comandos de voz en formato JSON a partir de texto libre en ingles. No es el modelo de produccion de la aplicacion: el autor lo etiqueta explicitamente como *negative result* y *research checkpoint*, y senala que el modelo que realmente usa Heed es `heed-tasks-qwen3-0.6b`.

El experimento (EXP-031, run E2) responde a una pregunta concreta: si anadir 1.109 notas simuladas en la voz del autor y duplicar el peso de los ejemplos erroneos donde dos modelos docentes coinciden mejora al estudiante respecto a su receta de referencia. El resultado fue negativo: E2 igualo la referencia (47,2% de notas completamente correctas) y ningun brazo del experimento la supero. El valor del checkpoint es, por tanto, metodologico: documenta un intento fallido, fija una regla sobre el ruido de semilla (diferencias de menos de 3-4 puntos no son resultados) y deja publicados los pesos para reproducibilidad.

Arquitectura `Qwen3_5ForCausalLM` con 24 capas y atencion hibrida Gated DeltaNet, 752.393.024 parametros en bf16 y un vocabulario de 248.320 tokens. Usa el formato de salida ancho antiguo (intencion y comandos de voz ademas de items), que ya no es el formato actual de la app.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer hibrido con atencion Gated DeltaNet), 24 capas |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 1.024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `Qwen/Qwen3.5-0.8B-Base`, con arquitectura `Qwen3_5ForCausalLM`: 24 capas, atencion hibrida Gated DeltaNet y vocabulario de 248.320 tokens. Los pesos se publican en bf16 y el autor elimino antes de la subida el `lm_head` duplicado y atado, de ahi el recuento exacto de 752.393.024 parametros. El entrenamiento uso `flash-linear-attention` 0.3.2 y `causal-conv1d` 1.7.0 para acelerar, y requiere una version de transformers con soporte de Qwen3.5 (se empleo la 5.20.2).

El ajuste se hizo sobre 4.803 filas con la receta E2: la receta de referencia D3 (3.388 filas) mas 1.109 notas simuladas generadas en rotacion por Claude Sonnet 5.5, Gemini 3.1 Pro y GPT-5.4, mas una copia extra de las 306 notas simuladas marcadas como "error claro". Las etiquetas de las notas simuladas las produjo Claude Sonnet 5.5 bajo la guia v2, sin verificacion humana por nota. Hiperparametros: learning rate 1e-5, AdamW, 5% de warm-up seguido de coseno, batch efectivo 16 (4 x 4), longitud maxima 1.024, autocast bf16, gradient checkpointing, 3 epochs, semilla 0. Fueron 903 pasos en 22,52 minutos, con mejor perdida de validacion de 0,1701 en el paso 301 y un pico de 18,5 GB de VRAM en una RTX 4090. No hubo RLHF ni DPO; el aprendizaje es supervision de etiquetas generadas por modelos docentes.

## Capacidades

- Generacion de texto en ingles orientada a extraccion de tareas desde notas de voz transcritas.
- Salida estructurada en JSON con un esquema fijo: intencion (`i`), items (`items`) y comandos de voz (`cmd`).
- Clasificacion de intencion de la nota completa entre `capture`, `mixed`, `empty`, `journal_only`, `command` y `question`.
- Asignacion de cada item a uno de seis buckets: `tasks`, `buy`, `watch`, `ideas`, `work` y `journal`.
- Deteccion de recordatorios (`r` a 0 o 1) y extraccion de las palabras temporales habladas (`w`).
- Extraccion de comandos de voz: `complete`, `query`, `delete`, `move`, `reschedule` y `rename`, con objetivo (`x`) y destino (`to`).
- Capacidad de marcar items como sugeridos (`s: 1`).
- No soporta tool calling generico, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Extraccion de tareas desde notas de voz: el modelo recibe la transcripcion y devuelve el JSON con items y buckets, que la app puede persistir directamente en una base de datos de tareas. Es su funcion original dentro del pipeline de Heed.
- Clasificacion de intencion en asistentes de captura: permite distinguir una nota de captura pura (`capture`) de una mezcla (`mixed`) o de una nota puramente emocional (`journal_only`), lo que habilita enrutar cada nota a un flujo distinto.
- Deteccion de comandos de voz sobre tareas existentes: con `cmd` el modelo identifica ordenes como completar, borrar, mover o reprogramar una tarea y extrae el objetivo, lo que permite construir interfaces de voz sin un parser manual de reglas.
- Clasificacion por buckets en aplicaciones de productividad: separar compras, tareas generales, trabajo, ideas y medios por ver en un solo paso, reduciendo el trabajo de organizacion manual del usuario.
- Extraccion de recordatorios con expresiones temporales: el campo `w` conserva las palabras habladas ("at 5", "on the way home") para que el cliente las resuelva a una fecha concreta, lo que simplifica el parseo temporal en el backend.
- Reproduccion de investigacion: sirve como punto de partida documentado para estudiar el efecto de datos simulados y reponderacion de errores en modelos pequenos, ya que el autor publica receta, curvas y decision (D101) junto con los pesos.
- Evaluacion de pipelines de datos sinteticos: util para comparar contra la receta de referencia D3 y contra el promedio de pesos `heed-simnotes-soup-qwen3.5-0.8b` con la misma vara de medir.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Notas completamente correctas (vara guide-v2) | 47,2% (igual que la referencia D3, EXP-030) |
| Mejor perdida de validacion | 0,1701 (paso 301) |
| Referencia D3 con semilla 1 | 44,2% (misma receta, semilla distinta) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica reportada es la tasa de notas completamente correctas sobre la vara guide-v2, y el autor advierte que las diferencias de menos de 3-4 puntos entre ejecuciones no son significativas por ruido de semilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB de pesos mas overhead de activaciones y cache KV; el autor no publica una cifra medida.
- Entrenamiento: pico de 18,5 GB en una unica RTX 4090 con batch 8 x 2 (el batch 8 x 2 agoto memoria; se uso 4 x 4).
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM en bf16 (RTX 3060, RTX 4060, RTX 4090), y previsiblemente en cuantizaciones de 4 bits en GPUs de 2 GB.
- Despliegue: transformers con soporte de Qwen3.5 (5.20.2 o superior). El autor no documenta recetas para vLLM, llama.cpp, Ollama o TGI, y no se han publicado pesos GGUF.
- Latencia y throughput: no disponibles. El autor evaluo con decodificacion greedy (`do_sample=False`) y `max_new_tokens=512`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|
| `heed-simnotes-e2-qwen3.5-0.8b` (este) | 752 M | no disponible (entrenado a 1.024) | 47,2% notas correctas (guide-v2) | apache-2.0 | checkpoint de investigacion, formato ancho antiguo |
| `heed-tasks-qwen3-0.6b` | ~0,6 B | no disponible | no disponible | no disponible | modelo de produccion de la app Heed |
| `heed-simnotes-soup-qwen3.5-0.8b` | ~752 M | no disponible | no disponible | no disponible | promedio de pesos de E2 y la ejecucion con semilla 1 |
| `Qwen/Qwen3.5-0.8B-Base` | ~0,8 B | no disponible | no disponible | no disponible | modelo base sin ajuste |

La comparacion con modelos de extraccion de tareas de otros fabricantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es el modelo de produccion: el autor lo declara explicitamente un checkpoint de investigacion y un resultado negativo; el modelo de la app es `heed-tasks-qwen3-0.6b`.
- Usa el formato de salida ancho antiguo (intencion y comandos incluidos), que ya no coincide con el formato actual de la aplicacion.
- Fue evaluado con la vara guide-v2, no con el juez ciego usado en evaluaciones posteriores, y nunca se desplego en un telefono.
- Solo soporta ingles; no se documentan capacidades multilingues.
- Riesgo de alucinacion en la extraccion de items y en la resolucion de comandos: el modelo genera JSON libre y no hay garantia de validez sintactica ni de que los items correspondan a texto presente en la nota.
- Etiquetas de entrenamiento generadas por modelos (Claude Sonnet 5.5, Gemini 3.1 Pro, GPT-5.4) sin verificacion humana por nota, lo que puede propagar sesgos y errores de los docentes.
- El propio experimento demuestra que la receta no mejora la referencia; el autor fija que diferencias por debajo de 3-4 puntos entre ejecuciones son ruido de semilla.
- Licencia apache-2.0: permite uso comercial, pero al tratarse de un artefacto de investigacion sin validacion en produccion, su uso comercial no esta respaldado por el autor.
- Requiere una version de transformers con soporte de Qwen3.5; versiones anteriores no cargaran la arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohitkrconnect/heed-simnotes-e2-qwen3.5-0.8b
- Modelo de produccion de Heed: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Promedio de pesos relacionado: https://huggingface.co/mohitkrconnect/heed-simnotes-soup-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset de notas de voz: https://huggingface.co/datasets/mohitkrconnect/heed-voice-notes-to-tasks
- Listado de modelos del autor: https://huggingface.co/mohitkrconnect/models
