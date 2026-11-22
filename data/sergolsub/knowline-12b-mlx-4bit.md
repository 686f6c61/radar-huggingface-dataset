# sergolsub/knowline-12B-MLX-4bit

## Resumen

KnowLine-12B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo PelaAI/KnowLine-12B-Gen1, publicada por el usuario sergolsub. El objetivo de esta versión no es otro que permitir la ejecución del modelo original de 12.000 millones de parámetros en hardware Apple Silicon mediante la librería `mlx_lm`, reduciendo el peso en disco de 23,92 GB (bf16) a 6,8 GB. La conversión se realizó por desquantización y recuantización afín de 4 bits a partir de una conversión previa a 8 bits, sin reentrenamiento ni cambios de arquitectura.

El modelo base no es un generador de texto conversacional al uso: su interfaz principal es una función `decide()` que resuelve tareas de decisión estructurada sobre un texto de entrada. Admite tres tipos de tarea: `noul` (pregunta de sí/no), `choice` (clasificación entre criterios con nombre) y `score` (puntuación sobre una lista ordenada de criterios). Esto lo sitúa en la categoría de modelos especializados en enrutamiento, triaje y clasificación, más que en la de asistentes generales.

La relevancia de esta ficha radica en que documenta una conversión con métricas de calidad medidas y publicadas (precisión, perplejidad, latencia y memoria) sobre un Mac mini M4 Pro de 48 GB, lo que permite evaluar de forma realista el coste de la cuantización a 4 bits frente a bf16 y 8 bits en un escenario de despliegue local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base con cabecera de decisión; pesos en formato MLX) |
| Parámetros totales | 12B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits afín (MLX), derivada de una conversión previa a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de los pesos originales; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors (layout MLX), más `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json`, `joint_config.json` y scripts `*_mlx.py` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base PelaAI/KnowLine-12B-Gen1 en la documentación proporcionada: no se especifica si es un transformer denso, MoE o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Lo que sí se documenta es que el modelo incorpora una "cabecera de decisión" (decision head) y una "cabecera conjunta" (joint head), con ficheros de configuración asociados (`decision_config.json`, `joint_config.json`) y código de inferencia específico (`knowline_mlx.py`), lo que indica una arquitectura con salidas estructuradas sobre tareas de decisión.

La conversión a 4 bits se realizó mediante desquantización de la versión 8 bits y recuantización afín de 4 bits con el mismo tamaño de grupo, sin reentrenamiento ni modificación de la arquitectura. El autor publica una auditoría de calidad comparando bf16, 8 bits y 4 bits sobre el mismo conjunto de evaluación y la misma máquina, incluyendo divergencia KL de las probabilidades de decisión (aunque para la versión de 4 bits no se registraron las probabilidades, por lo que no hay KL calculada frente al original). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Decisión estructurada sobre texto de entrada mediante la API `decide()`, con tres tipos de tarea: `noul` (sí/no), `choice` (selección entre criterios etiquetados) y `score` (puntuación sobre una escala de criterios ordenados).
- Clasificación y enrutamiento: asignación de tickets o incidencias a equipos o categorías según criterios definidos por el usuario.
- Evaluación de severidad o impacto sobre una escala cualitativa (por ejemplo, `cosmetic`, `annoying`, `blocks`).
- Respuesta a preguntas booleanas con instrucciones en lenguaje natural (por ejemplo, "¿el cliente quiere un reembolso?").
- Soporte de múltiples preguntas por invocación, cada una como objeto independiente dentro de la misma llamada.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles (no se especifican idiomas soportados).

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de la incidencia y decide a qué equipo derivarla (`billing`, `shipping`, etc.) mediante una tarea `choice` con criterios predefinidos. Es adecuado porque la salida es una etiqueta cerrada y verificable, no texto libre.
- Detección de intención de reembolso: con una tarea `noul` y una instrucción como "¿el cliente quiere un reembolso?", el modelo devuelve una decisión binaria que puede alimentar un flujo automatizado de atención al cliente.
- Priorización de incidencias técnicas: usando una tarea `score` sobre una escala de severidad, el modelo clasifica errores de sistemas (por ejemplo, "disk quota exceeded") para enrutarlos a colas de distinta urgencia.
- Moderación o filtrado de contenido: clasificación binaria o multietiqueta de mensajes según criterios definidos, integrándose en un pipeline previo a la publicación.
- Enrutamiento en sistemas RAG o de agentes: el modelo puede actuar como clasificador de consultas para decidir qué herramienta o base de conocimiento debe atender cada petición.
- Despliegue local en estaciones de trabajo Apple Silicon: al ocupar 6,8 GB en disco y un pico de 8,48 GB de memoria residente, es viable ejecutarlo en un Mac mini M4 Pro para tareas de clasificación de baja latencia sin depender de la nube.
- Procesamiento por lotes de bajo volumen: con una latencia mediana de 1.748 ms por decisión y un rendimiento sostenido de 0,91 decisiones cortas por segundo, encaja en flujos donde el volumen no es masivo pero se requiere privacidad local.

## Benchmarks y rendimiento

El autor publica una evaluación propia (no benchmarks estándar como MMLU o HumanEval) sobre el mismo conjunto y la misma máquina (Mac mini M4 Pro 48 GB):

| Versión | Precisión | noul | choice | score | PPL | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 86,7% | 95,0% | 80,0% | 80,0% | 1,894 | referencia | 23,92 GB | 1.730 ms |
| 8 bits | 87,8% | 95,0% | 84,0% | 80,0% | 1,900 | 5,94e-04 | 12,76 GB | 1.748 ms |
| 4 bits | 84,4% | 82,5% | 92,0% | 80,0% | 1,904 | no registrado | 6,8 GB | 1.748 ms |

Divergencia KL de las probabilidades de decisión frente al original bf16:

| Par | Filas | Media | p95 | Máximo |
|---|---|---|---|---|
| original → 8 bits | 100 | 5,94e-04 | 2,11e-03 | 1,25e-02 |
| 8 bits → 4 bits | — | no registrado | — | — |
| original → 4 bits | — | no registrado | — | — |

Métricas de despliegue medidas en Mac mini M4 Pro 48 GB con MLX 4 bits: 6,8 GB en disco, 1,14 s de carga, 8,48 GB de memoria residente máxima, latencia mediana de decisión de 1.748 ms y 0,91 decisiones cortas por segundo sostenidas. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,48 GB de pico residente medido en Mac mini M4 Pro de 48 GB con la versión de 4 bits.
- Disco: 6,8 GB para los pesos de 4 bits; 12,76 GB para la versión de 8 bits; 23,92 GB para bf16.
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente (el autor valida en M4 Pro de 48 GB); no se documentan requisitos para GPU NVIDIA.
- Compatibilidad con GPU de consumo: no se documenta soporte CUDA; el formato es MLX, específico de Apple Silicon.
- Opciones de despliegue: `mlx_lm` con el cargador incluido `knowline_mlx.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 1.748 ms por decisión y 0,91 decisiones cortas por segundo en el hardware indicado; tiempo de carga de 1,14 s.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores de decisión estructurada de 12B) en la documentación proporcionada. La comparación más directa disponible es entre las propias versiones del mismo modelo:

| Versión | Parámetros | Contexto | Precisión (eval propia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-12B-Gen1 (bf16) | 12B | no disponible | 86,7% | apache-2.0 | Hugging Face (PelaAI) |
| KnowLine-12B-MLX-8bit | 12B | no disponible | 87,8% | apache-2.0 | Hugging Face (sergolsub) |
| KnowLine-12B-MLX-4bit | 12B | no disponible | 84,4% | apache-2.0 | Hugging Face (sergolsub) |

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la precisión global (84,4% frente a 86,7% en bf16 y 87,8% en 8 bits) y especialmente la tarea `noul` (82,5% frente a 95,0% en bf16 y 8 bits), una caída de 12,5 puntos que puede ser crítica en decisiones binarias.
- La tarea `choice` mejora en 4 bits (92,0% frente a 80,0% en bf16), pero esta mejora no está respaldada por una auditoría de KL frente al original, ya que no se registraron las probabilidades de la versión de 4 bits.
- No se ha realizado auditoría de KL a nivel de peso (per-tensor) para este repositorio.
- El modelo está especializado en decisiones estructuradas; no se documentan capacidades de generación de texto libre, código o matemáticas, por lo que no debe emplearse como asistente general.
- No se especifican idiomas soportados; el rendimiento en castellano u otros idiomas distintos del inglés (idioma de los ejemplos de la model card) es desconocido.
- No se documenta la longitud de contexto, lo que impide garantizar el comportamiento con entradas largas.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un modelo de clasificación con salidas cerradas, el riesgo se traslada a errores de etiquetado más que a texto inventado.
- Licencia apache-2.0 heredada del upstream; en caso de conflicto prevalece la licencia del repositorio original, por lo que conviene verificar los términos del modelo base antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (22 de noviembre de 2026), sin histórico de validación por parte de la comunidad.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a ecosistemas CUDA sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/knowline-12B-MLX-4bit
- Modelo base: https://huggingface.co/PelaAI/KnowLine-12B-Gen1
- Conversión a 8 bits: https://huggingface.co/sergolsub/knowline-12B-MLX-8bit
