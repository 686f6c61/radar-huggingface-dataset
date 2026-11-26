# sergolsub/drex-v1.5-9B-MLX-8bit

## Resumen

drex-v1.5-9B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo nace-ai/drex-v1.5, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos, la arquitectura y el tokenizador son idénticos a los del modelo original; únicamente cambia la representación numérica de los pesos para reducir el espacio en disco y el consumo de memoria en equipos Mac con chip de la serie M.

El modelo subyacente emplea una arquitectura de transformer con atención lineal en al menos la primera capa (`linear_attn.in_proj_a`), etiquetada en Hugging Face con el tipo `qwen3_5_text`, lo que sugiere una variante de la familia Qwen 3.5 orientada a texto. Cuenta con 8.953.803.264 parámetros totales (aproximadamente 9B) y una cabeza de decisión adicional (`head.pt`, 8 MB) que permite plantear tareas de clasificación estructurada —tipo `noul`, `choice` y `score`— sobre una entrada de texto.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 9B en hardware de consumo Apple con un consumo de memoria medido de 11,31 GB de RSS máximo y una latencia mediana de decisión de 431 ms, manteniendo una calidad prácticamente idéntica a la de los pesos bf16 originales según las métricas publicadas por el autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (`qwen3_5_text`), cabeza de decisión adicional |
| Parametros totales | 8.953.803.264 (≈9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe una variante 4-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | nace-ai-open-rail-m-license-modified (OpenRAIL-M modificada) |
| Formato de pesos | safetensors (layout MLX), más `head.pt`, `config.json`, tokenizer y glue de inferencia (`drex_mlx.py`, `decision_config.json`, `joint_config.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo `qwen3_5_text` con atención lineal en la primera capa, según se deduce del tensor con mayor error de cuantización (`model.language_model.layers.0.linear_attn.in_proj_a.weight`). El repositorio incorpora además una cabeza de decisión (`head.pt`) y ficheros de configuración específicos (`decision_config.json`, `joint_config.json`) que permiten invocar un método `decide()` con tareas tipadas: `noul` (sí/no), `choice` (selección entre criterios) y `score` (puntuación ordinal). Esta funcionalidad no es generación de texto libre, sino clasificación estructurada sobre una entrada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La conversión aquí descrita no introduce reentrenamiento ni cambios arquitectónicos: solo aplica cuantización de pesos a 8 bits para MLX. El autor publica una auditoría de la cuantización a nivel de tensor: 427 tensores comparados, KL media de 3,84e-04 y KL máxima de 5,47e-03, con 249 tensores con KL distinto de cero.

## Capacidades

- Clasificación estructurada mediante `decide()`: tareas de tipo `noul` (pregunta binaria), `choice` (selección entre opciones con criterios descriptivos) y `score` (puntuación sobre una escala ordinal).
- Procesamiento de texto de hasta 512 tokens en las pruebas publicadas (404 tokens reales medidos).
- Toma de decisiones de baja latencia: mediana de 431 ms y 5,69 decisiones cortas por segundo sostenidas.
- Conversión MLX optimizada para Apple Silicon con `mlx_lm`.
- No soporta imagen (512x512: no soportado) ni tareas de bounding box (no soportado).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar una incidencia entrante en categorías predefinidas (`billing`, `shipping`, etc.) mediante una tarea `choice`, como se muestra en el ejemplo del autor con el pedido #7821. Adecuado por su latencia de 431 ms y su capacidad de definir criterios descriptivos por categoría.
- Detección de intención de reembolso: con una tarea `noul` sobre el texto del cliente ("I was charged twice for order #4411...") se obtiene una respuesta binaria sobre si el usuario solicita reembolso, útil en flujos de atención al cliente automatizados.
- Priorización de incidencias: mediante una tarea `score` con criterios ordinales (`cosmetic`, `annoying`, `blocks`) se puede asignar severidad a errores técnicos como "disk quota exceeded on the worker", integrándose en sistemas de ticketing.
- Enrutamiento en pipelines de soporte: al permitir varias llamadas independientes por tipo de tarea sobre la misma entrada, encaja en arquitecturas donde cada clasificador es un objeto separado y se compone la decisión final.
- Procesamiento local en Mac: al ejecutarse con MLX sobre Apple Silicon con 11,3 GB de memoria pico, es viable desplegar el modelo en estaciones de trabajo Mac mini M4 Pro sin GPU dedicada.
- Clasificación por lotes de baja latencia: con 5,69 decisiones cortas por segundo en el hardware de referencia, es apto para preclasificar grandes volúmenes de mensajes antes de un modelo mayor.
- Evaluación y prototipado en investigación: la disponibilidad de métricas de calibración (PPL 2,068 frente a 2,053 en bf16) y de KL por tensor permite estudiar el impacto de la cuantización en tareas de decisión.

## Benchmarks y rendimiento

| Metrica | bf16 (original) | 8-bit (esta version) | 4-bit (misma familia) |
|---|---|---|---|
| Accuracy | 78,4% | 78,4% | 84,1% |
| noul | 84,6% | 84,6% | 92,3% |
| choice | 80,0% | 80,0% | 84,0% |
| score | 66,7% | 66,7% | 70,8% |
| PPL de calibración | 2,053 | 2,068 | 1,978 |
| KL de salida vs original | referencia | 4,69e-04 | 5,28e-02 |
| Tamano en disco | 17,91 GB | 10,47 GB | 6,5 GB |
| Latencia mediana | 476 ms | 431 ms | 1292 ms |

Mediciones realizadas por el autor en un Mac mini M4 Pro de 48 GB con MLX 8-bit. El índice de decisión (Decision Index 0.4.1) es 49,17. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 11,31 GB de RSS pico medido en carga estándar y 11,29 GB en disco; el modelo ocupa 10,47 GB en disco.
- Hardware de referencia: Mac mini M4 Pro con 48 GB de memoria unificada.
- Cabe en equipos Apple Silicon de gama consumer con al menos 16 GB de memoria unificada, aunque no se ha verificado en configuraciones inferiores a la de referencia.
- Despliegue: librería `mlx_lm` con el cargador `drex_mlx.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Tiempo de carga: 4,86-4,96 s.
- Throughput: 5,69 decisiones cortas por segundo sostenidas; latencia mediana de 431 ms.
- Procesamiento de texto de 512 tokens: 1121 ms (binario), 1204 ms (multichoice), 1121 ms (score), promediado sobre 5 ejecuciones tras 3 de calentamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/drex-v1.5-9B-MLX-8bit | ≈9B | no disponible | OpenRAIL-M modificada | safetensors MLX 8-bit | 10,47 GB, 431 ms mediana |
| sergolsub/drex-v1.5-9B-MLX-4bit | ≈9B | no disponible | OpenRAIL-M modificada | safetensors MLX 4-bit | 6,5 GB, 1292 ms mediana, accuracy 84,1% |
| nace-ai/drex-v1.5 (bf16) | ≈9B | no disponible | OpenRAIL-M modificada | safetensors bf16 | 17,91 GB, 476 ms mediana, referencia de calidad |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación estructurada sobre texto con cabeza de decisión) en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia es OpenRAIL-M modificada, con posibles restricciones de uso comercial; debe revisarse el fichero LICENSE del repositorio y, en caso de conflicto, prevalece la licencia del repositorio upstream nace-ai/drex-v1.5.
- El modelo no es de generación de texto libre en su modo principal: la API documentada es `decide()`, orientada a tareas de clasificación estructurada.
- No soporta entrada de imagen ni tareas de detección de objetos (bounding box).
- La longitud de contexto no está documentada; las pruebas se limitan a 512 tokens.
- No se documentan idiomas soportados; el único ejemplo publicado está en inglés.
- La conversión 8-bit introduce una KL media de 4,69e-04 frente a bf16, con un máximo de 4,54e-03 por fila; aunque pequeña, no es nula.
- Curiosamente, la variante 4-bit obtiene mejores métricas de accuracy que la 8-bit en la evaluación del autor (84,1% frente a 78,4%), lo que sugiere que la métrica de accuracy puede no ser monotónica con la precisión de pesos y debe interpretarse con cautela.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la comparación con otros modelos de 9B es limitada.
- Riesgo de alucinación no cuantificado en la información disponible.
- El despliegue está restringido a Apple Silicon con MLX; no hay soporte documentado para CUDA, ROCm ni otras plataformas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/drex-v1.5-9B-MLX-8bit
- Modelo original (upstream): https://huggingface.co/nace-ai/drex-v1.5
- Variante 4-bit del mismo autor: https://huggingface.co/sergolsub/drex-v1.5-9B-MLX-4bit
