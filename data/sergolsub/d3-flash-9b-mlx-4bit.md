# sergolsub/d3-flash-9B-MLX-4bit

## Resumen

`d3-flash-9B-MLX-4bit` es una conversión a 4 bits en formato MLX del modelo `vllm-sr/d3-flash`, un modelo de aproximadamente 8.390 millones de parámetros (8,39 B) orientado a tareas de decisión estructurada. Lo publica el usuario `sergolsub` y está pensado para ejecutarse en Apple Silicon mediante la librería `mlx_lm`. No es un modelo conversacional generalista: su interfaz principal es un método `decide()` que recibe un texto y un conjunto de preguntas tipadas (`noul`, `choice`, `score`) y devuelve respuestas estructuradas.

La relevancia de esta ficha radica en que documenta una conversión de cuantización concreta, con métricas de calidad medidas por el autor (precisión del 86,7 % en 4 bits frente al 90,0 % en bf16), latencia (mediana de 604 ms) y consumo de memoria (6,01 GB de pico residente en un Mac mini M4 Pro de 48 GB). Es, por tanto, un artefacto de despliegue en local más que un modelo nuevo: no hay reentrenamiento ni cambios de arquitectura, solo cuantización afín de 4 bits sobre una conversión previa de 8 bits.

El modelo base pertenece a la familia `qwen3_5` según los tags de Hugging Face, con licencia Apache 2.0 heredada del repositorio original. La información pública disponible es escasa: no hay model card del modelo base incluida, no se publican idiomas soportados y no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia `qwen3_5`, según tags de HF); incluye cabezas de decisión personalizadas (`decision_config.json`, `joint_config.json`) |
| Parametros totales | 8.392.695.024 (8,39 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (MLX), derivada de una conversión previa de 8 bits; grupo de cuantización no especificado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de `vllm-sr/d3-flash`) |
| Formato de pesos | safetensors en layout MLX (3 shards: 4,00 GB + 1,37 GB + índice); repo total 5,4 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base no está documentada en la información disponible. Los tags de Hugging Face indican `qwen3_5` como arquitectura de referencia y `custom_code`, lo que implica que la carga requiere código propio (`d3_mlx.py`, 40.757 bytes) en lugar de una clase estándar de transformers. El repositorio incluye además `decision_config.json` y `joint_config.json`, que definen la glue de inferencia para las cabezas de decisión, y un fichero `readout.safetensors` de 4 MB que probablemente contiene los pesos de esas cabezas.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a 4 bits se realizó según el autor mediante dequantización de la versión MLX de 8 bits y recuantización afín a 4 bits con el mismo tamaño de grupo, sin reentrenamiento ni cambios de arquitectura. El repositorio incluye un `kl_audit.json` (61.846 bytes) que sugiere una auditoría de divergencia KL entre la versión cuantizada y la original, aunque su contenido no se detalla en la información proporcionada.

## Capacidades

- Decisión estructurada: el método `decide()` responde a preguntas tipadas sobre un texto de entrada, con tres tipos documentados: `noul` (sí/no/desconocido), `choice` (selección entre criterios con etiqueta y descripción) y `score` (puntuación sobre una escala de criterios ordenados).
- Procesamiento de texto de entrada en lenguaje natural (el ejemplo de la model card usa tickets de soporte en inglés).
- Múltiples preguntas por llamada: el ejemplo muestra un diccionario con varias claves (`refund`, `team`, `severity`) evaluadas sobre el mismo texto.
- Soporte de instrucciones por pregunta: cada tarea incluye su propio campo `instructions` y, en el caso de `choice`, un mapa `criteria` con descripciones.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Triaje de tickets de soporte: clasificar cada mensaje entrante en un equipo (`billing`, `shipping`, etc.) mediante una pregunta de tipo `choice` con criterios descritos, tal como muestra el ejemplo de la model card con el pedido #7821.
- Detección de intención de reembolso: usar una pregunta `noul` ("¿el cliente quiere un reembolso?") sobre el texto del ticket para enrutar automáticamente a facturación o a un agente humano.
- Priorización de incidencias: asignar severidad con una pregunta `score` sobre criterios ordenados (`cosmetic`, `annoying`, `blocks`), útil para colas de soporte técnico o alertas de operaciones.
- Enrutamiento de errores en pipelines: clasificar mensajes de error de sistemas (por ejemplo, "disk quota exceeded on the worker") por severidad o equipo responsable antes de abrir un incidente.
- Moderación o filtrado binario: preguntas `noul` sobre textos cortos para decidir si un contenido requiere revisión, con latencia de ~604 ms por decisión en el hardware de referencia.
- Procesamiento local en portátiles Apple Silicon: al ocupar 5,38 GB en disco y 6,01 GB de pico residente, permite ejecutar clasificación de decisiones en un Mac sin GPU dedicada ni conexión a la nube, útil para datos sensibles que no deben salir del dispositivo.
- Extracción de etiquetas en lotes pequeños: con 2,45 decisiones cortas por segundo sostenidas en M4 Pro, es viable procesar colas moderadas de tickets o logs en local.

## Benchmarks y rendimiento

Los únicos datos publicados son la evaluación propia del autor sobre la calidad tras la cuantización y las métricas de ejecución en un Mac mini M4 Pro de 48 GB. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | 4 bits (este modelo) | bf16 (referencia) |
|---|---|---|
| Accuracy global | 86,7 % | 90,0 % |
| noul | 85,0 % | 92,5 % |
| choice | 88,0 % | 88,0 % |
| score | 88,0 % | 88,0 % |
| Perplejidad de calibración | 1,899 | 1,850 |

| Metrica de ejecución (Mac mini M4 Pro 48 GB) | Valor |
|---|---|
| Tamano en disco | 5,38 GB |
| Tiempo de carga | 3,41 s |
| Memoria residente pico | 6,01 GB |
| Latencia de decisión (mediana) | 604 ms |
| Throughput sostenido (decisiones cortas) | 2,45 /s |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~6 GB de pico residente en la configuración medida (Mac mini M4 Pro, 48 GB); el repo ocupa 5,38 GB en disco.
- Hardware de referencia validado: Apple Silicon con MLX (`mlx_lm`); el autor reporta medidas en un Mac mini M4 Pro de 48 GB.
- GPU NVIDIA: no hay información sobre compatibilidad ni rendimiento en CUDA; el formato es safetensors en layout MLX, no directamente cargable por vLLM o TGI sin conversión.
- GPU de consumo: cabe en equipos Apple Silicon con al menos ~8 GB de memoria unificada, aunque no se han publicado medidas para configuraciones menores.
- Opciones de despliegue: `mlx_lm` con el cargador propio `d3_mlx.py` incluido en el repo; no se documenta soporte para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 604 ms de mediana por decisión y 2,45 decisiones cortas por segundo en el hardware de referencia; no hay datos para otro hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificación/decisión estructurada de ~8-9 B parámetros) en la información proporcionada. La comparación más directa posible es con el propio modelo base y su conversión de 8 bits, de los que solo se conocen los datos de calidad ya tabulados arriba.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `sergolsub/d3-flash-9B-MLX-4bit` | 8,39 B | no disponible | Apache 2.0 | safetensors MLX 4-bit | Hugging Face (15 descargas) |
| `vllm-sr/d3-flash` (base) | no disponible | no disponible | Apache 2.0 | no disponible | Hugging Face |
| Conversión MLX 8-bit del autor | no disponible | no disponible | Apache 2.0 | safetensors MLX 8-bit | no disponible como repo público en la información dada |

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la calidad de forma medible: la precisión global baja del 90,0 % al 86,7 % y la tarea `noul` cae del 92,5 % al 85,0 %; la perplejidad de calibración sube de 1,850 a 1,899.
- No hay información sobre sesgos del modelo base ni sobre su composición de entrenamiento, por lo que no se puede evaluar el riesgo de sesgo demográfico o cultural.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad en las tareas de decisión más allá del conjunto propio del autor.
- Idiomas soportados no declarados; los ejemplos de la model card están en inglés y no hay evidencia de rendimiento en castellano.
- Longitud de contexto no disponible, lo que impide planificar su uso con documentos largos.
- La licencia Apache 2.0 se hereda del repositorio original; el autor advierte de que, en caso de conflicto, prevalece la licencia del repositorio upstream.
- El modelo requiere código propio (`custom_code`, `d3_mlx.py`) y no se carga con clases estándar de transformers; esto complica su integración en pipelines convencionales y su auditoría.
- Solo está validado en Apple Silicon con MLX; no hay evidencia de funcionamiento en CUDA, ROCm ni CPU.
- El número de descargas (15) y de likes (0) indica una adopción muy baja, sin validación independiente de las métricas reportadas por el autor.
- El repositorio incluye un fichero `kl_audit.json` cuya metodología y conclusiones no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergolsub/d3-flash-9B-MLX-4bit
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Librería MLX: no se proporciona enlace en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
