# sergolsub/d3-flash-9B-MLX-8bit

## Resumen

d3-flash-9B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo vllm-sr/d3-flash, publicada por el usuario sergolsub. Está pensada para ejecutar inferencia en Apple Silicon mediante la librería `mlx_lm`, sin reentrenamiento ni cambios de arquitectura respecto a los pesos originales en bf16. El repositorio contiene 8.392.695.024 parámetros en safetensors (aproximadamente 9,4 GB en total) y una licencia Apache 2.0 heredada del modelo base.

El modelo no es un generador de texto convencional: su interfaz principal es `model.decide()`, que recibe un texto (y opcionalmente una imagen) junto con una definición de tareas de decisión tipadas (`noul`, `choice`, `score`). Esto lo orienta a clasificación estructurada, enrutamiento y puntuación de casos, más que a la generación libre de prosa. La model card reporta métricas de calidad tras la cuantización (accuracy 90,0 % frente a 90,0 % en bf16; PPL de calibración 1,843 frente a 1,850) y un Decision Index 0.4.1 de 54,21.

La relevancia actual reside en que permite desplegar un modelo de ~8,4 B parámetros con capacidades multimodales ligeras (procesa imágenes de 512x512 junto a texto) en hardware de consumo Apple, con un pico de RSS medido de unos 10 GB en un Mac mini M4 Pro de 48 GB. La información pública disponible es limitada: no hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni especificación de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal en las capas iniciales (tag `qwen3_5`, código personalizado); incluye cabezas de decisión (`decision_config.json`, `joint_config.json`) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); los pesos originales del modelo base están en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de vllm-sr/d3-flash) |
| Formato de pesos | safetensors en layout MLX (4 shards) + `readout.safetensors`; incluye `d3_mlx.py` como cargador |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base vllm-sr/d3-flash: no se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO. La arquitectura se infiere de los metadatos: el tag `qwen3_5` y la presencia de una capa `language_model.layers.0.linear_attn.in_proj_a.weight` (identificada como la peor capa en la auditoría KL) apuntan a un transformer híbrido con atención lineal en las primeras capas. El repositorio incluye además un `preprocessor_config.json` y un `video_preprocessor_config.json`, lo que sugiere soporte de entrada visual (imagen y, potencialmente, vídeo), aunque la model card solo reporta pruebas con imágenes de 512x512.

La innovación técnica principal de esta publicación es la conversión a 8 bits para MLX con auditoría de cuantización: se comparan 759 tensores contra los originales bf16 mediante KL sobre histogramas de 512 bins, con un KL medio de 2,17e-04 y un máximo de 5,49e-03. La tabla completa por tensor está en `kl_audit.json`. También se incluyen sumas SHA-256 de todos los ficheros para verificación de descargas. No hay decodificación especulativa ni otras optimizaciones de inferencia documentadas.

## Capacidades

- Clasificación binaria de texto mediante tareas de tipo `noul` (por ejemplo, "¿el cliente quiere un reembolso?").
- Clasificación multietiqueta mediante tareas de tipo `choice` con criterios definidos por el usuario (por ejemplo, enrutamiento a equipos de facturación o envíos).
- Puntuación ordinal mediante tareas de tipo `score` con criterios ordenados (por ejemplo, severidad: cosmético, molesto, bloqueante).
- Procesamiento conjunto de imagen y texto: la model card reporta latencias para entradas de imagen 512x512 más texto.
- Interfaz programática de decisión multi-tarea: varias preguntas pueden definirse como objetos independientes en una misma llamada.
- Detección de cajas (bounding boxes): no soportada según la model card ("Box: not supported").
- Generación de texto libre, razonamiento, código, matemáticas, tool calling y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje de tickets de soporte: usar `decide()` con tareas `choice` para enrutar cada incidencia al equipo adecuado (facturación, envíos, técnico) según criterios definidos, con latencias de ~1,3-1,4 s por consulta en M4 Pro.
- Clasificación de severidad de incidencias: tareas `score` con criterios ordinales (cosmético, molesto, bloqueante) para priorizar colas de trabajo en sistemas de observabilidad o helpdesk.
- Verificación de intención del cliente: tareas `noul` para detectar si un mensaje solicita reembolso, cancelación o escalado antes de pasarlo a un agente humano.
- Moderación o filtrado de contenido con señal visual: al aceptar imagen más texto, puede clasificar publicaciones con captura adjunta (por ejemplo, capturas de errores o de pantallas de pago) en categorías predefinidas.
- Procesamiento local en estaciones de trabajo Apple: al requerir ~10 GB de RSS en un Mac mini M4 Pro, encaja en flujos de clasificación on-device donde no se permite enviar datos a la nube.
- Etiquetado asistido de datasets: aplicar las cabezas de decisión para preanotar grandes lotes de texto o pares imagen-texto con categorías consistentes, dado el bajo coste por inferencia (~1,3 s en hardware de consumo).
- Enrutamiento en pipelines de agentes: usar la salida tipada (`noul`/`choice`/`score`) como señal estructurada para decidir la siguiente acción de un sistema mayor, evitando parsear texto libre.

## Benchmarks y rendimiento

La model card reporta evaluaciones propias de calidad tras la cuantización y latencias medidas, pero no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | 8-bit (MLX) | bf16 (referencia) |
|---|---|---|
| Accuracy | 90,0 % | 90,0 % |
| Noul | 92,5 % | 92,5 % |
| Choice | 88,0 % | 88,0 % |
| Score | 88,0 % | 88,0 % |
| PPL de calibración | 1,843 | 1,850 |
| Decision Index 0.4.1 | 54,21 | no disponible |

Latencias medidas en Mac mini M4 Pro 48 GB (media de 5 ejecuciones tras 3 de calentamiento):

| Escenario | Binary | Multichoice | Score | Peak RSS |
|---|---|---|---|---|
| Carga del modelo | 4,41 s | — | — | 9,96 GB |
| Texto 512 tokens (479 tok) | 1317 ms | 1417 ms | 1316 ms | 9,98 GB |
| Imagen 512x512 + texto | 2279 ms | 2290 ms | 2276 ms | 10,06 GB |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RSS estimada: ~10 GB de pico en inferencia con 8 bits (medido: 9,96-10,06 GB en Mac mini M4 Pro).
- Hardware validado: Apple Silicon con MLX; el autor reporta pruebas en Mac mini M4 Pro de 48 GB de memoria unificada.
- GPU NVIDIA: no disponible; el formato MLX no es compatible con CUDA sin conversión.
- Cabe en GPU de consumo: no aplicable directamente (MLX es específico de Apple Silicon); en Mac, requiere al menos ~10 GB de memoria unificada disponible.
- Opciones de despliegue: `mlx_lm` con el cargador incluido `d3_mlx.py`; vLLM, llama.cpp, Ollama y TGI no están documentados para este repositorio.
- Latencia: ~1,3-1,4 s por consulta de texto de 512 tokens; ~2,3 s con imagen 512x512 adjunta (M4 Pro).
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. El modelo base vllm-sr/d3-flash sería la referencia natural, pero sus especificaciones (contexto, idiomas, benchmarks) no están disponibles en esta ficha. Tampoco se documentan alternativas de clasificación estructurada con interfaz de decisión tipada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/d3-flash-9B-MLX-8bit | 8,39 B | no disponible | Apache 2.0 | safetensors MLX 8-bit | Objeto de esta ficha |
| vllm-sr/d3-flash | no disponible | no disponible | Apache 2.0 | bf16 | Modelo base upstream |
| Alternativas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos |

## Limitaciones y advertencias

- La información pública es escasa: no hay datos de benchmarks estándar, longitud de contexto, idiomas soportados ni detalles de entrenamiento, lo que dificulta evaluar su idoneidad frente a alternativas.
- El modelo está especializado en tareas de decisión tipadas; no se documenta como generador de texto libre ni se reportan capacidades de razonamiento, código o matemáticas.
- La detección de cajas (bounding boxes) no está soportada, lo que limita su uso en tareas de visión que requieran localización de objetos.
- Solo se ha validado en Apple Silicon con MLX; no hay evidencia de funcionamiento en CUDA, ROCm ni CPU convencional sin conversión adicional.
- El rendimiento medido corresponde a un único equipo (Mac mini M4 Pro 48 GB); las latencias pueden variar en otros chips de la familia M.
- La licencia Apache 2.0 se hereda del modelo base, pero la model card indica que, en caso de conflicto, prevalece la licencia del repositorio upstream; conviene verificar el LICENSE de vllm-sr/d3-flash antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un modelo de clasificación, el riesgo se traslada a etiquetas incorrectas en lugar de texto inventado.
- El código de carga (`d3_mlx.py`, 40 KB) es personalizado y debe revisarse antes de usarlo en producción; se incluyen sumas SHA-256 para verificar la integridad de los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-flash-9B-MLX-8bit
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Auditoría KL por tensor: `kl_audit.json` en el repositorio
- Configuración de decisión: `decision_config.json` en el repositorio
- Cargador MLX: `d3_mlx.py` en el repositorio
- Paper, blog o demo: no disponible
