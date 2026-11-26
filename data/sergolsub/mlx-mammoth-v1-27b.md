# sergolsub/mlx-mammoth-v1-27B

## Resumen

`mlx-mammoth-v1-27B` es una conversión cuantizada a 8 bits en formato MLX del modelo `baselabs/mammoth-1`, publicada por el usuario sergolsub. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para ejecución en Apple Silicon mediante la librería `mlx_lm`. El modelo base cuenta con 27.356.728.560 parámetros (unos 27,4 mil millones) y la conversión preserva la arquitectura original sin cambios ni reentrenamiento, aplicando únicamente cuantización de pesos.

La relevancia de esta ficha radica en que el autor documenta de forma inusualmente rigurosa el impacto de la cuantización: incluye comparativas de precisión entre bf16, 8 bits y 4 bits sobre un conjunto de evaluación propio, métricas de divergencia KL por tensor y por salida, checksums SHA-256 de todos los ficheros y mediciones reales de latencia y memoria en un Mac mini M4 Pro de 48 GB. El modelo base parece orientado a tareas de decisión estructurada (clasificación tipo sí/no, elección entre categorías y puntuación ordinal) más que a generación de texto libre, según se desprende de la API de uso documentada.

La licencia es MIT, heredada del modelo original, lo que facilita su uso comercial. El repositorio ocupa 30,4 GB y la inferencia en 8 bits alcanza un pico de memoria residente de 20,15 GB, lo que lo sitúa en el rango de equipos Apple Silicon de gama alta con 32 GB o más de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia `qwen3_5`, según tag del repo); incluye atención lineal (`linear_attn`) y cabezas de decisión |
| Parametros totales | 27.356.728.560 (≈27,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta versión); existe versión 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de `baselabs/mammoth-1`) |
| Formato de pesos | safetensors en layout MLX (8 shards) + `config.json`, tokenizer, `chat_template.jinja`, scripts `*_mlx.py` |

## Arquitectura y entrenamiento

El modelo base `baselabs/mammoth-1` es un transformer de aproximadamente 27,4 mil millones de parámetros. La inspección de tensores revelada por el autor indica la presencia de capas con atención lineal (`model.language_model.layers.0.linear_attn.in_proj_b.weight`), lo que sugiere una arquitectura híbrida que combina atención lineal con atención estándar, en la línea de las familias Qwen recientes (el tag del repositorio es `qwen3_5`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación destacable de esta publicación no está en el entrenamiento, sino en la ingeniería de cuantización y su auditoría. El autor proporciona una tabla de divergencia KL por tensor (1184 tensores comparados, KL medio 3,34e-04, máximo 5,71e-03, 581 tensores con KL distinto de cero) y una comparativa de calidad sobre su propio conjunto de evaluación, donde la versión de 8 bits iguala o supera ligeramente al bf16 original en precisión (85,6 % frente a 84,4 %) manteniendo una perplejidad de calibración prácticamente idéntica (1,913 frente a 1,912). El modelo incorpora además un modo de decisión con cabezas específicas (`decision_config.json`, `joint_config.json`) que permiten formular tareas como preguntas de tipo `noul` (sí/no), `choice` (elección entre criterios) y `score` (puntuación ordinal).

## Capacidades

- Toma de decisiones estructurada: clasificación binaria (`noul`), elección entre categorías definidas por el usuario (`choice`) y puntuación sobre una escala ordinal (`score`).
- Razonamiento sobre texto de entrada en lenguaje natural para emitir una decisión acompañada de probabilidades.
- Procesamiento de conversaciones multi-turno mediante plantilla de chat (`chat_template.jinja`).
- Capacidad de generación de texto heredada del modelo base, aunque la documentación se centra en el modo de decisión.
- Soporte de múltiples tareas independientes por llamada, cada una con sus propias instrucciones y criterios.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Triaje de tickets de soporte: el modelo permite clasificar cada incidencia con una llamada `choice` indicando el equipo responsable (facturación, envío, técnico), usando las instrucciones y criterios definidos por el integrador. La latencia medida de 2,2 s por decisión encaja en flujos de enrutamiento por lotes.
- Detección de intención de reembolso: con una pregunta `noul` ("¿el cliente quiere un reembolso?") sobre el texto del ticket, se obtiene una probabilidad calibrada que puede alimentar un sistema de priorización.
- Priorización por severidad: mediante una pregunta `score` con criterios ordinales ("cosmético", "molesto", "bloqueante"), el modelo asigna un nivel de impacto a incidencias técnicas como errores de exportación o cuotas de disco.
- Moderación y filtrado de contenido: la formulación binaria permite construir clasificadores de políticas (por ejemplo, "¿el mensaje contiene datos personales?") sin necesidad de entrenar un modelo específico.
- Enrutamiento en pipelines de datos: integrado en un servidor local (el autor menciona un endpoint `/v1/systemone`), el modelo puede etiquetar registros de forma masiva con un throughput sostenido de 0,78 decisiones cortas por segundo en un M4 Pro.
- Evaluación de calidad en producción: las métricas de divergencia KL y perplejidad publicadas permiten usar esta versión como referencia reproducible para comparar futuras cuantizaciones sin reentrenar.
- Prototipado en local sobre Apple Silicon: desarrolladores que necesiten validar lógica de decisión con un modelo de 27B sin depender de GPUs dedicadas pueden ejecutarlo en un Mac con 32 GB o más de memoria unificada.

## Benchmarks y rendimiento

El autor publica una evaluación propia (no benchmarks estándar como MMLU o HumanEval) sobre un conjunto de decisión, comparando bf16, 8 bits y 4 bits:

| Version | Precision | noul | choice | score | PPL calibracion | KL salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 84,4 % | 87,5 % | 88,0 % | 76,0 % | 1,912 | referencia | 54,73 GB | 310.062 ms |
| 8 bits (este repo) | 85,6 % | 90,0 % | 88,0 % | 76,0 % | 1,913 | 2,30e-04 | 30,41 GB | 2.215 ms |
| 4 bits | 85,6 % | 87,5 % | 92,0 % | 76,0 % | 1,928 | 8,26e-03 | 17,44 GB | 2.222 ms |

Divergencia KL de salida (probabilidades de decisión, en nats):

| Par | Filas | Media | p95 | Maximo |
|---|---|---|---|---|
| original → 8 bits | 100 | 2,30e-04 | 9,10e-04 | 3,35e-03 |
| 8 bits → 4 bits | 100 | 8,47e-03 | 3,86e-02 | 1,31e-01 |
| original → 4 bits | 100 | 8,26e-03 | 4,05e-02 | 1,29e-01 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: pico residente medido de 20,15 GB con pesos de 8 bits (30,41 GB en disco); requiere un equipo con al menos 24-32 GB de memoria unificada para operar con holgura.
- GPU recomendadas: Apple Silicon (probado en Mac mini M4 Pro de 48 GB). No se documenta soporte para CUDA, A100, H100 ni RTX 4090, ya que el formato MLX es específico de Apple.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con 32 GB o más de memoria unificada; no aplicable a GPUs NVIDIA por el formato.
- Opciones de despliegue: `mlx_lm` y el loader propio `onejev_mlx.OneJev` incluido en el repositorio; el autor menciona un servidor compatible con el endpoint `/v1/systemone`.
- Latencia y throughput medidos: carga en 9,42 s; latencia mediana de decisión 2.215 ms; throughput sostenido de 0,78 decisiones cortas por segundo.
- La versión de 4 bits (17,44 GB en disco) reduce los requisitos de memoria a costa de una mayor divergencia KL (8,26e-03 frente a 2,30e-04).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sergolsub/mlx-mammoth-v1-27B (este) | 27,4 B | no disponible | safetensors MLX 8 bits | MIT | Optimizado para Apple Silicon, modo de decisión |
| sergolsub/mammoth-v1-27B-MLX-4bit | 27,4 B | no disponible | safetensors MLX 4 bits | MIT | Misma calidad de decisión, 17,44 GB en disco, mayor KL |
| baselabs/mammoth-1 (original) | 27,4 B | no disponible | safetensors bf16 | MIT | Referencia de calidad; 54,73 GB en disco, latencia de 310 s en el mismo equipo |

No se dispone de información sobre otros modelos comparables de la misma categoría (modelos de decisión estructurada de ~27B) en la documentación proporcionada.

## Limitaciones y advertencias

- La evaluación publicada se limita a 100 filas de un conjunto propio de decisión; no hay validación sobre benchmarks estándar ni sobre dominios distintos al de soporte técnico.
- El modelo está diseñado para tareas de decisión con cabezas específicas; su uso como generador de texto libre no está documentado ni evaluado en esta versión.
- No se declaran idiomas soportados; el rendimiento en castellano u otras lenguas distintas del inglés es desconocido.
- No se documenta la longitud de contexto, lo que impide planificar su uso en documentos largos.
- El formato MLX limita el despliegue a hardware Apple; no es portable a CUDA sin reconversión.
- La licencia MIT permite uso comercial, pero el autor advierte de que prevalece la licencia del repositorio upstream en caso de conflicto.
- Riesgo de alucinación y sesgos: no evaluado en la documentación; al ser un modelo de decisión, los errores se manifiestan como clasificaciones incorrectas con probabilidad asociada.
- La cuantización a 8 bits introduce una divergencia KL media de 2,30e-04 respecto al bf16; aunque pequeña, no es nula y debe tenerse en cuenta en aplicaciones sensibles.
- El repositorio tiene 412 descargas y 0 likes en el momento de la consulta, lo que indica una adopción limitada y poca validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-mammoth-v1-27B
- Modelo base original: https://huggingface.co/baselabs/mammoth-1
- Versión 4 bits del mismo autor: https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-4bit
- Documentación de MLX: no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
