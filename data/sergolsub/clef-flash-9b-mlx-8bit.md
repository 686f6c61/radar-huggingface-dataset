# sergolsub/clef-flash-9B-MLX-8bit

## Resumen

clef-flash-9B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo Cloudflare/clef-flash, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. El modelo original lo desarrolla Cloudflare y esta conversión no introduce reentrenamiento ni cambios de arquitectura: únicamente aplica cuantización de 8 bits sobre los pesos en bf16 y añade el glue de inferencia necesario para el modo de decisión (cabecera conjunta y configuración de tareas).

El modelo cuenta con 8.953.803.264 parámetros totales (aproximadamente 9B) y un tamaño en disco de 10,47 GB. Su rasgo diferencial no es la generación de texto libre, sino una interfaz de decisión estructurada: el método `decide()` permite plantear tareas tipadas (`noul`, `choice`, `score`) con instrucciones y criterios, devolviendo una decisión clasificada. Esto lo orienta a enrutamiento, triaje y clasificación operativa dentro de pipelines.

La relevancia actual radica en que ofrece una vía práctica para desplegar un modelo de ~9B con capacidad de decisión en hardware de consumo Apple (Mac mini M4 Pro con 48 GB), con latencias de decisión en torno a 737 ms de mediana y una calidad tras cuantización que, según la evaluación del autor, iguala o supera ligeramente al bf16 en varias métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal en capas iniciales (etiqueta `qwen3_5` en los tags); detalles completos no disponibles |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base en bf16 sirve de referencia |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | safetensors en layout MLX (4 shards), más `joint_head.safetensors` |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de una conversión de cuantización, no de un entrenamiento: los pesos originales en bf16 de Cloudflare/clef-flash se convierten a 8 bits en layout MLX sin cambios arquitectónicos ni reentrenamiento. Los tags del repositorio indican la familia `qwen3_5`, y el nombre de la peor capa en la auditoría KL (`model.language_model.layers.0.linear_attn.in_proj_a.weight`) sugiere el uso de atención lineal en las primeras capas del modelo de lenguaje.

El repositorio incluye componentes específicos para el modo de decisión: `joint_head.safetensors` (244 MB), `joint_head_config.json`, `joint_schema_model.py`, `decision_config.json` y `clef_mlx.py`, que implementan la inferencia de la cabecera conjunta sobre el modelo de lenguaje. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

La conversión viene acompañada de una auditoría de cuantización tensor a tensor: 427 tensores comparados, KL media de 3,87e-04, KL máxima de 5,57e-03 y 249 tensores con KL distinto de cero, con la tabla completa en `kl_audit.json`. La perplejidad de calibración pasa de 2,341 (bf16) a 2,349 (8 bits).

## Capacidades

- Decisión estructurada mediante `decide()`: tareas de tipo `noul` (sí/no/desconocido), `choice` (selección entre criterios con etiqueta) y `score` (puntuación sobre una escala de criterios ordenados).
- Clasificación y enrutamiento con instrucciones en lenguaje natural y criterios explícitos por tarea.
- Procesamiento de texto de hasta 512 tokens en las pruebas publicadas (522 tokens reales), con variantes de evaluación binaria, multichoice y de puntuación.
- Cada pregunta se trata como un objeto independiente: una llamada separada por tipo de tarea.
- No soporta imagen 512x512 ni tareas de bounding box (box) según las mediciones del autor.
- Soporte de tool calling, agentes multi-paso, capacidades multilingües y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: usar `decide()` con tipo `choice` para enrutar cada incidencia al equipo adecuado (facturación, envíos, técnico) a partir del texto del cliente; la latencia mediana de 737 ms y las 2,15 decisiones cortas por segundo permiten procesar colas en tiempo casi real.
- Detección de intención de reembolso: con tipo `noul` e instrucciones del tipo "¿el cliente quiere un reembolso?", el modelo responde sí/no/desconocido, útil como primer filtro antes de escalar a un agente humano.
- Priorización de incidencias: con tipo `score` sobre una escala de criterios (cosmético, molesto, bloqueante), se puede asignar severidad automáticamente a errores de plataforma o exportaciones fallidas.
- Enrutamiento en pipelines de soporte interno: clasificar mensajes entrantes por categoría operativa antes de pasarlos a un LLM mayor, reduciendo coste y latencia del sistema global.
- Moderación o etiquetado ligero en local: al ejecutarse en Apple Silicon con ~11,5 GB de memoria residente pico, permite clasificación on-device sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Automatización de decisiones en herramientas de desarrollo: clasificar errores de CI/CD o mensajes de fallo (por ejemplo, "disk quota exceeded") por severidad o equipo responsable dentro de un flujo de gestión de incidencias.
- Evaluación comparativa de cuantización: servir como referencia para medir el impacto de 8 bits frente a bf16 en tareas de decisión, gracias a la auditoría KL y a las métricas de calidad publicadas.

## Benchmarks y rendimiento

Métricas publicadas por el autor de la conversión (Mac mini M4 Pro 48 GB, MLX 8 bits):

| Metrica | 8 bits | bf16 |
|---|---|---|
| Accuracy (eval del autor) | 83,0% | 81,8% |
| Noul | 87,2% | 84,6% |
| Choice | 84,0% | 84,0% |
| Score | 75,0% | 75,0% |
| Perplejidad de calibración | 2,349 | 2,341 |

| Medición de sistema | Valor |
|---|---|
| Carga del modelo | 5,17 s (estándar) / 3 s (medición en disco) |
| RSS pico | 11,3 GB (carga) / 11,48 GB (texto 512 tokens) |
| Texto 512 tokens (media de 5 tras 3 de calentamiento) | 1518 ms (binary), 1625 ms (multichoice), 1669 ms (score) |
| Latencia de decisión | mediana 737 ms |
| Throughput de decisiones cortas | 2,15/s sostenido |
| Decision Index 0.4.1 | 43,46 |
| Auditoría KL | 427 tensores, KL media 3,87e-04, KL máx 5,57e-03 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: ~11,5 GB de RSS pico medidos con MLX 8 bits; en disco 10,47 GB.
- Hardware de referencia: Mac mini M4 Pro con 48 GB de memoria unificada; no se han publicado pruebas en otros equipos Apple.
- Cabe en equipos Apple Silicon con al menos 16 GB de memoria unificada, aunque no hay mediciones publicadas para esa configuración.
- Despliegue: librería `mlx` / `mlx_lm`; el repositorio incluye `clef_mlx.py` con la clase `Clef` y el glue de la cabecera de decisión.
- No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; el formato es específico de MLX.
- Latencia: 737 ms de mediana por decisión; throughput sostenido de 2,15 decisiones cortas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/clef-flash-9B-MLX-8bit | 8,95B | no disponible | apache-2.0 | safetensors MLX 8 bits | Conversion para Apple Silicon con modo de decisión |
| Cloudflare/clef-flash | no disponible (base ~9B) | no disponible | apache-2.0 | safetensors bf16 | Modelo original; referencia de calidad y licencia |
| Alternativas de ~9B para clasificación/decisión | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo especializado en decisión estructurada, no en generación libre de texto; su uso previsto es `decide()` con tareas tipadas.
- No soporta entrada de imagen ni bounding boxes según las mediciones del autor.
- Las pruebas publicadas se limitan a textos de hasta 512 tokens; el comportamiento con contextos más largos no está documentado.
- No hay información sobre idiomas soportados ni sobre sesgos del modelo original.
- Riesgo de alucinación no evaluado en la información disponible; en tareas de clasificación, el modo `noul` permite expresar desconocimiento, pero no se documenta su fiabilidad.
- La licencia apache-2.0 se hereda del modelo upstream; ante conflicto, prevalece la licencia del repositorio original Cloudflare/clef-flash.
- Las métricas de calidad y rendimiento provienen de la evaluación del propio autor de la conversión, no de una evaluación independiente.
- La cuantización a 8 bits introduce desviaciones medibles (KL máxima 5,57e-03 en `layers.0.linear_attn.in_proj_a.weight`), aunque la calidad reportada no empeora en las métricas evaluadas.
- El formato MLX limita el despliegue a ecosistema Apple; no hay soporte documentado para GPUs NVIDIA u otras plataformas.
- Repositorio con 0 likes y 276 descargas en el momento de la consulta: ecosistema de validación reducido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/clef-flash-9B-MLX-8bit
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Auditoría KL completa: `kl_audit.json` en el repositorio
- Glue de inferencia: `clef_mlx.py`, `joint_schema_model.py`, `decision_config.json`, `joint_config.json` en el repositorio
- Papers, blogs, repos y demos adicionales: no disponible
