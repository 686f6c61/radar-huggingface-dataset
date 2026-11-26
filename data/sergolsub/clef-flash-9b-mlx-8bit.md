# sergolsub/clef-flash-9B-MLX-8bit

## Resumen

clef-flash-9B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo Cloudflare/clef-flash, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante `mlx_lm`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales en bf16 se han cuantizado a 8 bits sin cambios de arquitectura ni de entrenamiento, con el objetivo de reducir el espacio en disco de 18,82 GB a 10,47 GB y el pico de memoria residente a unos 11,5 GB, manteniendo una calidad prácticamente idéntica al original.

El modelo subyacente, Cloudflare/clef-flash, pertenece a la familia `qwen3_5` según los tags del repositorio y cuenta con 8.953.803.264 parámetros totales (aproximadamente 9B). Su rasgo distintivo es una interfaz de decisión estructurada: en lugar de generar texto libre, el modelo evalúa una entrada contra un esquema de tareas tipadas (`noul`, `choice`, `score`) y devuelve una decisión con probabilidades asociadas. Esto lo orienta a clasificación, enrutamiento y triaje más que a generación conversacional abierta.

La relevancia de esta ficha radica en que documenta una conversión de cuantización verificada con auditoría de KL por tensor y por salida, algo poco habitual en repositorios derivados. El autor publica métricas reproducibles en una máquina concreta (Mac mini M4 Pro de 48 GB) y compara tres versiones (bf16, 8-bit, 4-bit) sobre el mismo conjunto de evaluación, lo que permite decidir con datos si la pérdida de precisión es aceptable para un despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia `qwen3_5` (tag del repositorio), con cabecera de decisión (`joint_head`) y atención lineal en la capa 0 (`linear_attn.in_proj_a`) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en formato MLX; existe una versión hermana en 4 bits (`sergolsub/clef-flash-9B-MLX-4bit`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del repositorio upstream) |
| Formato de pesos | safetensors en layout MLX (4 shards), más `joint_head.safetensors` de 244 MB |

## Arquitectura y entrenamiento

La arquitectura corresponde a los pesos upstream de Cloudflare/clef-flash, etiquetados como `qwen3_5`, con 8.953.803.264 parámetros. El repositorio incluye artefactos que revelan un diseño orientado a decisión: un `joint_head.safetensors` de 244 MB, un `joint_schema_model.py` de 23 KB y ficheros `decision_config.json` y `joint_config.json`. La presencia de una capa `linear_attn` en el índice 0 sugiere atención lineal en al menos parte de la pila, aunque no se detalla la proporción ni el mecanismo exacto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Esta conversión concreta no introduce entrenamiento alguno: es una cuantización a 8 bits de los pesos bf16 originales, sin cambios de arquitectura. El autor documenta una auditoría de cuantización a nivel de tensor sobre 427 tensores, con KL medio de 3,87e-04 y máximo de 5,57e-03, localizado en `model.language_model.layers.0.linear_attn.in_proj_a.weight`. La perplejidad de calibración pasa de 2,341 (bf16) a 2,349 (8 bits), y el KL de salida sobre las probabilidades de decisión es de 2,48e-04 de media (p95 1,19e-03, máximo 3,39e-03) sobre 97 filas evaluadas. Son cifras que indican una degradación despreciable frente al original.

## Capacidades

- Decisión estructurada tipada: el método `decide()` acepta una entrada de texto y un esquema de tareas con tres tipos: `noul` (pregunta booleana sí/no), `choice` (selección entre criterios con etiqueta y descripción) y `score` (puntuación sobre una lista ordenada de criterios).
- Clasificación y enrutamiento: asignación de tickets a equipos (por ejemplo, facturación frente a envíos) mediante el tipo `choice`.
- Triaje por severidad: puntuación de impacto de incidencias sobre escalas ordinales definidas por el usuario.
- Detección de intención: identificación de peticiones como solicitudes de reembolso mediante `noul`.
- Procesamiento de texto de hasta 512 tokens en las pruebas del autor (522 tokens reales medidos), con latencias de 1.518 a 1.669 ms según el tipo de tarea.
- Soporte de tool calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada. La model card indica explícitamente que imagen 512x512 y cajas (box) no están soportadas.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un esquema `choice` con los equipos disponibles (facturación, envíos, técnico) y devuelve la asignación con probabilidades. Es adecuado porque la latencia mediana de decisión es de 737 ms y sostiene 2,15 decisiones cortas por segundo de forma sostenida.
- Triaje de severidad de incidencias: con un esquema `score` sobre una escala como `["cosmetic", "annoying", "blocks"]`, permite priorizar colas de trabajo en herramientas internas. La evaluación del autor reporta un 75,0% de acierto en la categoría `score`, idéntico en bf16 y en 8 bits.
- Detección de intención de reembolso: usando `noul` con la pregunta "¿el cliente quiere un reembolso?", el modelo obtiene un 87,2% de acierto en 8 bits, por encima del 84,6% del bf16 original en el conjunto del autor, lo que lo hace apto para prefiltrar conversaciones antes de un agente generativo.
- Moderación y clasificación binaria de contenido: el tipo `noul` permite construir filtros de una sola pregunta con umbrales de probabilidad ajustables, con un 83,0% de accuracy global medida en 8 bits.
- Despliegue local en portátiles y equipos de sobremesa Apple Silicon: con 10,47 GB en disco y un pico de memoria residente de 11,46 GB, cabe en un Mac con 16 GB de memoria unificada, lo que habilita prototipado y demos sin GPU dedicada.
- Clasificación por lotes en pipelines de datos: la tasa de 2,15 decisiones por segundo en un M4 Pro permite procesar del orden de 7.700 decisiones por hora en un solo equipo, suficiente para etiquetado asistido o enriquecimiento de registros a pequeña escala.
- Evaluación comparativa de cuantizaciones: el repositorio incluye scripts (`output_kl.py`, `kl_weight_audit.py`) y datos (`kl_audit.json`) que sirven como referencia metodológica para medir el impacto de cuantizar otros modelos.

## Benchmarks y rendimiento

Datos publicados por el autor sobre su propio conjunto de evaluación, medidos en un Mac mini M4 Pro de 48 GB con MLX 8 bits:

| Version | Accuracy | noul | choice | score | PPL | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 81,8% | 84,6% | 84,0% | 75,0% | 2,341 | referencia | 18,82 GB | 734 ms |
| 8-bit (este repo) | 83,0% | 87,2% | 84,0% | 75,0% | 2,349 | 2,48e-04 | 10,47 GB | 737 ms |
| 4-bit (repo hermano) | 80,7% | 84,6% | 76,0% | 79,2% | 2,385 | 1,92e-02 | 6,5 GB | 734 ms |

KL de salida por par de versiones (nats, sobre 97 filas):

| Par | Filas | Media | p95 | Máximo |
|---|---|---|---|---|
| original → 8-bit | 97 | 2,48e-04 | 1,19e-03 | 3,39e-03 |
| 8-bit → 4-bit | 97 | 1,82e-02 | 8,33e-02 | 2,13e-01 |
| original → 4-bit | 97 | 1,92e-02 | 8,55e-02 | 2,14e-01 |

Otras métricas declaradas: carga de 5,17 s en el stand estándar y 3 s en disco; pico de memoria residente de 11,3 a 11,48 GB; texto de 512 tokens con latencias de 1.518 ms (binary), 1.625 ms (multichoice) y 1.669 ms (score); Decision Index 0.4.1 de 43,46. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 11,5 GB de pico residente para los pesos en 8 bits más el estado de inferencia; el autor mide 11,46 GB en carga y 11,48 GB en ejecución de texto de 512 tokens.
- Espacio en disco: 10,47 GB para los pesos cuantizados, más 244 MB del `joint_head.safetensors` incluido en el total del repositorio de 10,7 GB.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se documenta soporte para CUDA ni ROCm en esta conversión.
- Cabe en GPU de consumo: sí, en equipos Apple con 16 GB de memoria unificada o más; el autor valida el funcionamiento en un Mac mini M4 Pro de 48 GB.
- Opciones de despliegue: `mlx_lm` mediante el cargador incluido `clef_mlx.py` (clase `Clef`), más `huggingface_hub.snapshot_download` para la descarga. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen pesos en layout MLX.
- Latencia y throughput medidos: 737 ms de mediana por decisión, 2,15 decisiones cortas por segundo sostenidas, y entre 1.518 y 1.669 ms para entradas de 512 tokens según el tipo de tarea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Calidad medida |
|---|---|---|---|---|---|
| sergolsub/clef-flash-9B-MLX-8bit | 8,95B | no disponible | safetensors MLX 8-bit | apache-2.0 | 83,0% accuracy, PPL 2,349 |
| Cloudflare/clef-flash (bf16) | 8,95B | no disponible | safetensors bf16 | apache-2.0 | 81,8% accuracy, PPL 2,341 |
| sergolsub/clef-flash-9B-MLX-4bit | 8,95B | no disponible | safetensors MLX 4-bit | apache-2.0 | 80,7% accuracy, PPL 2,385 |

La comparación con modelos de otras familias (Qwen, Llama, Mistral) no está disponible en la información proporcionada, en parte porque clef-flash expone una interfaz de decisión estructurada en lugar de generación de texto libre, lo que impide una comparación directa con benchmarks convencionales.

## Limitaciones y advertencias

- El modelo no es generativo en el sentido habitual: su interfaz principal es `decide()`, que devuelve decisiones tipadas. No se documenta soporte para generación de texto libre, código, matemáticas ni razonamiento multi-paso.
- No soporta imagen (512x512) ni cajas (`box`), según la model card.
- La ventana de contexto no está declarada; las mediciones se limitan a entradas de 512 tokens, por lo que el comportamiento con contextos más largos es desconocido.
- Los idiomas soportados no están declarados. Todos los ejemplos de la model card están en inglés; no hay evidencia de calidad en castellano.
- Las métricas de calidad proceden de un conjunto de evaluación propio del autor, no de benchmarks estándar de la comunidad; el tamaño de la muestra es de 97 filas para el KL y no se detalla para la accuracy. La comparación entre versiones es internamente coherente, pero no extrapolable a otros dominios.
- El 8-bit supera ligeramente al bf16 en accuracy (83,0% frente a 81,8%), una diferencia probablemente atribuible al ruido de una muestra pequeña y no a una mejora real; conviene no interpretarla como ganancia de calidad.
- Licencia apache-2.0 heredada del upstream; el autor advierte de que, en caso de conflicto, prevalece la LICENSE del repositorio original de Cloudflare.
- El formato MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni safetensors estándar para CUDA en este repositorio.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/clef-flash-9B-MLX-8bit
- Modelo base upstream: https://huggingface.co/Cloudflare/clef-flash
- Versión hermana en 4 bits: https://huggingface.co/sergolsub/clef-flash-9B-MLX-4bit
