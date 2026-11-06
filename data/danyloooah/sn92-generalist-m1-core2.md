# danyloooah/sn92-generalist-m1-core2

## Resumen

SN92 generalist-m1-core2 es un modelo de decisión (decision-model) publicado por el usuario danyloooah en Hugging Face. Se trata de un merge en espacio de pesos de cuatro fine-tunes del modelo base `baselabs/mammoth-1`, que a su vez es un post-entrenamiento de Qwen3.5-27B. El modelo emplea el layout de lectura conjunta REAX (backbone Qwen3_5Model con atención completa no causal y readout de código de respuesta), por lo que su tarea principal es la clasificación de texto y la selección de opciones en formato de decisión.

El modelo resuelve el problema de consolidar múltiples especializaciones (generalista, decider y variantes propias) en un único checkpoint mediante aritmética de tareas lineal en el espacio de pesos. Con 26.085.330.160 parámetros totales y un repositorio de 52,2 GB, está pensado para evaluaciones de decisión multi-tarea, no para generación de texto libre convencional.

Es relevante ahora porque demuestra una receta reproducible de merging de fine-tunes sobre un backbone Qwen3.5 con licencia MIT, lo que facilita su uso comercial y su estudio por parte de la comunidad. No obstante, la información pública disponible es limitada: no hay benchmarks publicados ni especificación de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3_5Model con atención completa no causal y readout de respuesta (layout REAX) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (máximo de prompt de entrenamiento: 6.144 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pytorch), bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de `baselabs/mammoth-1` (revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), un post-entrenamiento de Qwen3.5-27B con licencia Apache-2.0. La arquitectura es un transformer Qwen3_5Model con atención completa no causal y un readout de código de respuesta en la última posición (letra). El merge se realiza con aritmética de tareas lineal tensor a tensor: `base + lam * combine_i(w_i * (parent_i - base))` con `lam = 1.0`, calculado en float32 y redondeado una sola vez a bfloat16. Los pesos de los padres son 0.7 para `isomsom/sn92-gen-m87b` y `xflud/sn92-decider-1`, y 0.25 para `danyloooah/sn92-generalist-m1-v3a` y un fine-tune no publicado del propio autor (receta v3a, semilla 1). El readout de respuesta es la media de los readouts de los padres, normalizados por su escala frente al readout de mammoth-1.

El padre propio (`danyloooah/sn92-generalist-m1-v3a`) se entrenó con LoRA (rango 16, alpha 32, sin dropout) sobre las proyecciones q/k/v/o de atención, las proyecciones in_proj_qkv / in_proj_z / out_proj del Gated DeltaNet y las proyecciones gate/up/down del MLP de las 64 capas del modelo de lenguaje, fusionadas en los pesos bf16. El entrenamiento usó AdamW con learning rate 5e-5, decaimiento coseno, 20 pasos de warm-up, batch efectivo de 32 filas y 1 época sobre 43.242 filas de preguntas de 58 tipos de tarea en formato REAX eval-v5.1, con longitud máxima de prompt de 6.144 tokens. La pérdida es entropía cruzada entre softmax(logits de letra / 2) y la opción dorada con label smoothing 0.1; para preguntas de conocimiento con opción "no lo sé", se mantiene la respuesta solo si mammoth-1 acertó con probabilidad ≥ 0.5.

## Capacidades

- Clasificación de texto y selección de opciones en formato de decisión (readout de letra en la última posición).
- Razonamiento de opción múltiple sobre 58 tipos de tarea, incluyendo aritmética, lógica, causalidad sí/no, ajedrez, acordes musicales, políticas y tarifas, y elementos de API / tool-call.
- Abstención calibrada: el modelo puede seleccionar "no lo sé" en preguntas de conocimiento cuando no alcanza el umbral de confianza.
- Procesamiento de prompts de hasta 6.144 tokens.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- No se documenta soporte de tool calling en inferencia, ni agentes multi-paso, ni visión, audio o modo thinking.

## Casos de uso

- Evaluación automática de decisiones en benchmarks de opción múltiple: el modelo puede puntuar preguntas en formato REAX eval-v5.1 y comparar la opción elegida con la etiqueta dorada, gracias a su readout de letra y a su entrenamiento específico en ese formato.
- Clasificación de intenciones y dominios en asistentes conversacionales: al haber sido entrenado con CLINC150, BANKING77 y MASSIVE 1.1, puede asignar etiquetas de intención a utterances de usuario en pipelines de enrutamiento.
- Moderación de contenido y etiquetado de daño: su entrenamiento con Aegis 2.0 le permite clasificar respuestas según etiquetas de daño, útil en filtros previos a la publicación.
- Verificación de coherencia en preguntas de sentido común: con datos de CommonsenseQA, StrategyQA, QASC, OpenBookQA y WinoGrande, puede usarse como juez de plausibilidad en sistemas de generación aumentada.
- Selección de respuestas en recuperación de documentos: entrenado con ContractNLI y Cosmos QA, puede decidir si un pasaje respalda una afirmación o elegir la opción correcta entre candidatos.
- Clasificación de consultas de búsqueda de productos: con Amazon ESCI, puede etiquetar la relevancia de una consulta respecto a un producto en sistemas de e-commerce.
- Preguntas médicas de opción múltiple: con MedMCQA, puede emplearse como componente de evaluación en pipelines de formación o triaje no clínico.
- Tareas de razonamiento temporal y geográfico: con datos de GeoNames, NOAA y Federal Register, puede clasificar registros de eventos y recalls en flujos de datos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 64-80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o dos RTX 4090 de 24 GB en paralelo (con tensor parallelism o cuantización).
- En consumer GPU: no cabe en una sola RTX 4090 de 24 GB en bf16; requeriría cuantización a 8 bits o 4 bits (no documentada por el autor) o sharding multi-GPU.
- Opciones de despliegue: no se documentan en la model card; al ser un checkpoint PyTorch/safetensors con arquitectura Qwen3_5Model, podría requerir el código de REAX o de mammoth-1 para cargar el readout conjunto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| danyloooah/sn92-generalist-m1-core2 | 26,1 B | no disponible (prompt de entrenamiento 6.144) | MIT | Hugging Face | Merge de 4 fine-tunes, readout de decisión |
| baselabs/mammoth-1 | no disponible | no disponible | MIT | Hugging Face | Base del merge, post-entrenado de Qwen3.5-27B |
| Qwen3.5-27B | 27 B (aprox.) | no disponible | Apache-2.0 | Hugging Face | Modelo generativo base, no especializado en decisión |
| isomsom/sn92-gen-m87b | no disponible | no disponible | MIT | Hugging Face | Padre del merge (peso 0.7) |
| xflud/sn92-decider-1 | no disponible | no disponible | MIT | Hugging Face | Padre del merge (peso 0.7) |

## Limitaciones y advertencias

- No es un modelo generativo de texto libre: su salida es un readout de letra sobre opciones predefinidas, por lo que no debe usarse para chat abierto sin adaptación.
- Riesgo de alucinación en la selección de opciones: aunque incorpora abstención calibrada, el umbral de probabilidad ≥ 0.5 puede producir respuestas incorrectas en preguntas fuera de distribución.
- Idiomas no especificados: no hay garantía de rendimiento multilingüe más allá de los datos de MASSIVE 1.1 y XCOPA.
- Longitud de contexto limitada a 6.144 tokens en entrenamiento; no se documenta soporte para contextos mayores.
- Licencia MIT permite uso comercial, pero el modelo base Qwen3.5-27B es Apache-2.0 y mammoth-1 es MIT; se deben respetar las atribuciones de los padres.
- El autor declara no estar afiliado a Base Labs / Baseten, Qwen ni REAX; el soporte y mantenimiento no están garantizados.
- No se distribuyen los datasets de entrenamiento ni se documentan procesos de RLHF/DPO; el alineamiento se limita al post-entrenamiento de mammoth-1.
- El repositorio tiene 63 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/danyloooah/sn92-generalist-m1-core2
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre 2: https://huggingface.co/xflud/sn92-decider-1
- Padre 3: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
- Qwen3.5-27B (referencia): no disponible en la información proporcionada
- Paper REAX: no disponible en la información proporcionada
