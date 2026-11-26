# sergolsub/d3-v3.1.0-27B-MLX-8bit

## Resumen
d3-v3.1.0-27B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo vllm-sr/d3, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante `mlx_lm`. El modelo original es un transformer de aproximadamente 26.085 millones de parámetros (26,08 mil millones) con arquitectura híbrida que combina capas de atención lineal (`linear_attn`) con atención estándar, y que incorpora una cabeza de decisión especializada para tareas de clasificación estructurada.

La relevancia de esta conversión radica en que reduce el peso en disco de 52,17 GB (BF16) a 28,15 GB, manteniendo una calidad prácticamente idéntica: la precisión evaluada por el autor es del 88,9 % tanto en BF16 como en 8 bits, con una perplejidad de calibración de 1,981 frente a 1,977, y una divergencia KL de salida media de solo 1,81e-04 nats. En un Mac mini M4 Pro de 48 GB, la latencia mediana por decisión baja de 212.108 ms (BF16) a 2.141 ms, lo que hace viable el uso interactivo en hardware de consumo.

El modelo está pensado para tareas de enrutamiento y decisión (refund, asignación de equipo, puntuación de severidad) más que para generación de texto libre, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (`linear_attn`) y cabeza de decisión; familia qwen3_5 según tags |
| Parametros totales | 26.085.330.160 (≈26,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (esta versión); existe variante 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX (26 shards), más `d3_mlx.py`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento
El modelo base vllm-sr/d3 emplea una arquitectura transformer con capas de atención lineal identificables en el nombre de los tensores (por ejemplo, `language_model.layers.0.linear_attn.in_proj_b.weight`), lo que sugiere un diseño híbrido que mezcla atención lineal con atención convencional para reducir el coste computacional en contextos largos. El tag `qwen3_5` indica que deriva de la familia Qwen 3.5. La conversión a MLX 8 bits no introduce reentrenamiento ni cambios arquitectónicos: se trata de una cuantización de los shards BF16 originales, con LICENSE y NOTICE subidos junto a los pesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card sí documenta una auditoría de cuantización a nivel de tensor: 1.183 tensores comparados, KL medio de 3,80e-04, KL máximo de 7,78e-03 y 581 tensores con KL distinto de cero; la peor capa es `language_model.layers.0.linear_attn.in_proj_b.weight` con KL 7,78e-03. La innovación destacable es la cabeza de decisión (`decision_config.json`), que permite formular preguntas tipadas (`noul`, `choice`, `score`) sobre un texto de entrada y obtener una respuesta estructurada con probabilidades.

## Capacidades
- Decisión estructurada tipada: soporta tres tipos de tarea (`noul` sí/no, `choice` selección entre criterios, `score` puntuación ordinal sobre una lista de criterios).
- Clasificación y enrutamiento: asignación de tickets a equipos, detección de intención de reembolso, evaluación de severidad.
- Salida con probabilidades por fila, apta para umbrales y análisis de incertidumbre.
- Cabeza conjunta (`joint_config.json`) para combinar varias decisiones en una sola pasada.
- Ejecución nativa en Apple Silicon mediante `mlx_lm`.
- Generación de texto libre: no confirmada en la información disponible; la model card solo documenta el modo de decisión.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso
- Enrutamiento de tickets de soporte: usar `decide` con tipo `choice` y criterios como `billing` o `shipping` para asignar cada incidencia al equipo correcto; la latencia de ~2,1 s por decisión en un M4 Pro permite procesar en tiempo casi interactivo.
- Detección de intención de reembolso: consulta `noul` sobre el texto del cliente para decidir si solicita devolución; la precisión medida del 88,9 % y la clase `noul` al 87,5 % dan una referencia concreta para calibrar umbrales.
- Triaje de severidad de incidencias: consulta `score` con criterios ordinales (`cosmetic`, `annoying`, `blocks`) para priorizar colas de trabajo en sistemas de soporte técnico.
- Moderación y clasificación de contenido: cualquier flujo que requiera una etiqueta booleana o categórica sobre texto libre puede formularse como una decisión tipada y ejecutarse en local sin enviar datos a la nube.
- Procesamiento por lotes en estaciones de trabajo Mac: con 28,15 GB en disco y 15,78 GB de memoria residente pico, cabe en un Mac con 32 GB o más y permite clasificar grandes volúmenes de registros sin GPU dedicada.
- Prototipado de pipelines de decisión antes de escalar a servidor: la paridad de calidad con BF16 (KL 1,81e-04) permite validar la lógica de negocio en local y desplegar después el modelo original en vLLM sin cambiar las consultas.
- Automatización de back-office con datos sensibles: al ejecutarse íntegramente en local, es adecuado para clasificar documentación interna sujeta a requisitos de confidencialidad.

## Benchmarks y rendimiento
Los datos publicados por el autor corresponden a su propio conjunto de evaluación (100 filas), no a benchmarks estándar como MMLU o HumanEval.

| Version | Precision | noul | choice | score | PPL | KL salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (BF16) | 88,9 % | 87,5 % | 96,0 % | 84,0 % | 1,977 | referencia | 52,17 GB | 212.108 ms |
| 8 bits (esta) | 88,9 % | 87,5 % | 96,0 % | 84,0 % | 1,981 | 1,81e-04 | 28,15 GB | 2.141 ms |
| 4 bits | 87,8 % | 85,0 % | 96,0 % | 84,0 % | 1,959 | 7,18e-03 | 14,87 GB | 2.114 ms |

KL de salida por fila (nats): original → 8 bits, media 1,81e-04, p95 5,51e-04, máximo 6,26e-03; 8 bits → 4 bits, media 7,16e-03, p95 3,36e-02, máximo 9,07e-02. Decision Index 0.4.1: 62,5. Medición en Mac mini M4 Pro de 48 GB: carga en 7,08 s, 0,63 decisiones cortas por segundo sostenidas, decisión corta de 1.238 ms (mediana de 5 tras 3 de calentamiento).

## Requisitos de hardware
- VRAM/memoria unificada: pico de memoria residente de 15,78 GB medido en MLX 8 bits; se recomienda un Mac con al menos 24-32 GB de memoria unificada para dejar margen al sistema.
- Disco: 28,15 GB para los pesos; el repo completo ocupa 27,9 GB según Hugging Face.
- GPU recomendadas: Apple Silicon (M-series) con `mlx_lm`; el autor validó en Mac mini M4 Pro de 48 GB. No hay datos de ejecución en A100, H100 ni RTX 4090, ya que el formato MLX está orientado a Apple Silicon.
- GPU de consumo: sí cabe en equipos Apple con memoria unificada suficiente; no es ejecutable directamente en GPUs NVIDIA sin reconvertir los pesos.
- Despliegue: `mlx_lm` con el cargador `d3_mlx.py` incluido en el repositorio; para servidor con GPUs NVIDIA habría que usar los pesos BF16 originales de vllm-sr/d3 (compatible con vLLM, según el nombre del repositorio upstream).
- Latencia y throughput: mediana de 2.141 ms por decisión, 0,63 decisiones cortas por segundo sostenidas en M4 Pro de 48 GB; la variante 4 bits ofrece latencia similar (2.114 ms) con la mitad de disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (eval del autor) | Disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sergolsub/d3-v3.1.0-27B-MLX-8bit | 26,1 B | no disponible | 88,9 % accuracy | 28,15 GB | Apache 2.0 | Hugging Face, MLX |
| sergolsub/d3-v3.1.0-27B-MLX-4bit | 26,1 B | no disponible | 87,8 % accuracy | 14,87 GB | Apache 2.0 | Hugging Face, MLX |
| vllm-sr/d3 (BF16 original) | 26,1 B | no disponible | 88,9 % accuracy | 52,17 GB | Apache 2.0 | Hugging Face |
| Modelos de decisión comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de la misma categoría (clasificación y enrutamiento con cabeza de decisión) para establecer una comparación externa fiable.

## Limitaciones y advertencias
- El conjunto de evaluación del autor tiene solo 100 filas y está orientado a tareas de decisión; no hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan comparar con el ecosistema generalista.
- La model card no documenta el comportamiento en generación de texto libre, tool calling ni razonamiento multi-paso; no debe asumirse que estas capacidades funcionan.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés, que es el idioma de los ejemplos de la model card.
- Longitud de contexto no disponible: no se puede planificar su uso con documentos largos sin verificación empírica.
- Riesgo de alucinación en las justificaciones textuales asociadas a cada decisión; las probabilidades de salida deben calibrarse con datos propios antes de producción.
- La cuantización introduce una degradación medible aunque pequeña: KL medio de 1,81e-04 y máximo de 6,26e-03 por fila; la variante 4 bits degrada más (accuracy 87,8 %, noul 85,0 %).
- El formato MLX limita el despliegue a Apple Silicon; para GPUs NVIDIA hay que usar los pesos BF16 originales.
- Aunque la licencia es Apache 2.0, la model card indica que prevalece la licencia del repositorio upstream en caso de conflicto; conviene revisar el LICENSE de vllm-sr/d3 antes de un uso comercial.
- El modelo tiene 325 descargas y 0 likes en el momento de la consulta: es una conversión de nicho con poca validación comunitaria.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-v3.1.0-27B-MLX-8bit
- Modelo base original: https://huggingface.co/vllm-sr/d3
- Variante 4 bits: https://huggingface.co/sergolsub/d3-v3.1.0-27B-MLX-4bit
- Documentación de MLX: https://github.com/ml-explore/mlx
- Documentación de mlx_lm: https://github.com/ml-explore/mlx-lm
