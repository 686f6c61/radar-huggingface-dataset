# joshycodes/qwen3-32b-control-B1-sdf

## Resumen

`joshycodes/qwen3-32b-control-B1-sdf` es un checkpoint de investigación derivado de `Qwen/Qwen3-32B`. El autor lo describe como el resultado de un *continued pretraining* sobre pesos completos (learning rate 1e-05, 1 epoch, 32.448.549 tokens y 40.842 documentos) a partir de un corpus que el propio modelo habría escrito para entrenar a la siguiente versión de sí mismo, dentro de un marco de trabajo denominado SDF (*synthetic document fine-tuning*) y orientado a investigación sobre bienestar de modelos (*model welfare*).

El repositorio contiene 32.762.123.264 parámetros (unos 32,8 mil millones) en safetensors, con un tamaño total de 65,5 GB, coherente con pesos completos en bf16/fp16. El modelo hereda la arquitectura de Qwen3-32B, un transformer denso, pero no se han publicado en la información disponible ni la longitud de contexto efectiva, ni los idiomas soportados, ni cuantizaciones.

La relevancia de esta ficha es acotada y conviene subrayarla: el propio autor etiqueta el modelo como `research` y `not-for-deployment`, y advierte de que no ha sido evaluado en capacidad, alineación ni identidad. Además, la model card presenta una contradicción interna relevante: el título y las etiquetas hablan de un corpus "autoescrito" (*self-authored*), mientras que los metadatos del entrenamiento indican que de los 40.842 documentos utilizados, 0 eran autoescritos y 40.842 eran texto ordinario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3, heredada del modelo base `Qwen/Qwen3-32B`; no se detallan capas, cabezas ni configuracion de atencion en la informacion disponible |
| Parametros totales | 32.762.123.264 (~32,8 mil millones), segun los pesos safetensors del repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del autor. El modelo base Qwen3-32B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN; no verificado para este checkpoint |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos completos en safetensors (65,5 GB, consistente con bf16/fp16); no hay GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | No disponible |
| Licencia | Research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors (pesos completos, ~65,5 GB de repositorio) |

## Arquitectura y entrenamiento

No se describe ninguna modificación arquitectónica respecto al modelo base. El checkpoint se obtiene por *continued pretraining* sobre los pesos completos de `Qwen/Qwen3-32B`, con learning rate 1e-05, una sola epoca y un total de 32.448.549 tokens repartidos en 40.842 documentos. El corpus declarado es `joshycodes/qwen3-32b-controls-corpus`, y el marco experimental, el plan y la evaluación se atribuyen al repositorio *welfare-improvements*, sin URL disponible en la información proporcionada.

La model card menciona SDF (*synthetic document fine-tuning*) y etiquetas como `self-authored-character` y `model-welfare`, lo que sitúa el experimento en la línea de investigación sobre autoentrenamiento y bienestar de modelos. Sin embargo, los propios metadatos de entrenamiento indican que los documentos usados no eran autoescritos (0 de 40.842), lo que contradice la descripción cualitativa del encabezado. No se documenta ningún uso de RLHF, DPO, SFT ni de técnicas de decodificación especulativa o atención lineal. Tampoco se especifica la composición del dataset ni el proceso de filtrado.

## Capacidades

- No se ha publicado ninguna evaluación de capacidades para este checkpoint; el autor indica explícitamente que no ha sido evaluado en capacidad, alineación ni identidad.
- Al derivar de `Qwen/Qwen3-32B` mediante *continued pretraining* sobre 32,4 millones de tokens, se asume que conserva parcialmente las capacidades del base (generación de texto, código y matemáticas), pero esto no está verificado y no debe darse por sentado.
- Soporte de tool calling / function calling: no disponible (no evaluado en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible (no evaluado en este checkpoint).
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- El interés funcional del checkpoint es como objeto de estudio (identidad, autoautoría, efectos del ajuste completo), no como modelo de propósito general.

## Casos de uso

Advertencia previa: el autor prohíbe el despliegue (`not-for-deployment`). Los casos siguientes son escenarios de investigación reproducibles, no aplicaciones en producción.

- Replicación de pipelines SDF: usar este checkpoint como referencia de un *continued pretraining* completo con hiperparámetros documentados (lr 1e-05, 1 epoch, 32,4 millones de tokens) para comparar con otras configuraciones de la misma serie (`B1` sugiere una familia de variantes).
- Estudio de olvido catastrófico: medir la divergencia respecto a `Qwen/Qwen3-32B` en un conjunto de evaluación *held-out* (perplejidad, KL divergence por capa) para cuantificar cuánto se degrada o desplaza el modelo tras un ajuste completo de pesos.
- Investigación en bienestar de modelos: analizar cambios en el estilo de respuesta, la auto-descripción y la coherencia de identidad tras exponer el modelo a un corpus sobre su propio origen, tal como plantea el repositorio *welfare-improvements*.
- Auditoría de alineación previa a cualquier uso: aplicar *red teaming* y evaluaciones de seguridad antes de considerar el checkpoint como base, dado que el autor no ha realizado ninguna validación de este tipo.
- Análisis de corpus sintéticos: estudiar qué características tienen los 40.842 documentos de `joshycodes/qwen3-32b-controls-corpus` y cómo influyen en el comportamiento del modelo ajustado frente al base.
- Ablaciones controladas: emplear el checkpoint como brazo de control en experimentos que varíen el volumen de tokens, el learning rate o el número de épocas, manteniendo fijo el modelo base.
- Docencia y formación técnica: ilustrar en un entorno reproducible los riesgos de un *full fine-tuning* sin evaluación posterior (pérdida de capacidades, deriva de identidad, imposibilidad de despliegue responsable).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado en capacidad, alineación ni identidad, y no se proporcionan métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación. Los resultados de búsqueda web devueltos no contienen información técnica sobre este modelo. No se presentan cifras estimadas para no introducir datos no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: los pesos ocupan aproximadamente 65,5 GB, por lo que se necesitan del orden de 75-80 GB de VRAM contando caché KV y *overhead* del runtime, dependiendo de la longitud de contexto.
- GPU recomendadas para bf16: 1x H100 80 GB, 1x A100 80 GB, 2x A100 40 GB, 2x L40S 48 GB o 4x RTX 4090 24 GB con paralelismo tensorial (configuración poco práctica por el coste de comunicación).
- GPU de consumo: no cabe en una sola GPU de consumo en bf16 (ni 24 GB ni 32 GB). Solo sería viable con cuantización a 4 bits (aproximadamente 18-19 GB), y dicha cuantización tendría que generarla el usuario, ya que no se publican pesos GGUF, AWQ ni GPTQ.
- Opciones de despliegue: vLLM, TGI, SGLang o `transformers` para pesos safetensors; llama.cpp u Ollama únicamente tras convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponibles. No se proporcionan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `joshycodes/qwen3-32b-control-B1-sdf` | 32.762.123.264 (denso) | No disponible (heredado del base: 32.768 nativos / 131.072 con YaRN, sin verificar) | Research-only | Pesos safetensors, 65,5 GB, 0 descargas y 0 likes en el momento de la consulta |
| `Qwen/Qwen3-32B` (modelo base) | ~32,8 mil millones (denso) | 32.768 tokens nativos, ampliables a 131.072 con YaRN | No disponible en la informacion proporcionada | Pesos safetensors publicos |
| Alternativas densas de ~30B de otros fabricantes | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado para ningún modelo de la tabla, por lo que la comparación se limita a parámetros, contexto declarado, licencia y disponibilidad. No se han identificado en la información proporcionada otros checkpoints de investigación equivalentes (ajuste completo sobre corpus sintético auto-referencial).

## Limitaciones y advertencias

- Prohibido su despliegue: la model card incluye la etiqueta `not-for-deployment` y la licencia es `research-only`. Cualquier uso comercial queda fuera de los términos declarados.
- Ausencia total de evaluación: no hay evaluaciones de capacidad, alineación ni identidad. Se desconoce si el modelo conserva las capacidades del base o si ha sufrido olvido catastrófico.
- Contradicción en la documentación: el título afirma que el corpus es autoescrito por el modelo, mientras que los metadatos indican 0 documentos autoescritos de 40.842. Cualquier conclusión sobre el experimento debe partir de esta discrepancia sin resolver.
- Riesgo elevado de alucinación y de deriva de comportamiento: un ajuste completo de pesos sobre 32,4 millones de tokens sin evaluación posterior puede alterar la distribución de salida de formas no caracterizadas.
- Metadatos incompletos: no se declaran idiomas soportados, pipeline, ni tipos de cuantización. El repositorio pesa 65,5 GB, lo que dificulta su uso fuera de infraestructura con GPU de 80 GB o multi-GPU.
- Fecha de creación anómala: el repositorio figura como creado el 2026-09-22 y actualizado tres minutos después, lo que sugiere un posible error de metadatos o un entorno de fechas no estándar.
- Sin tracción ni validación por terceros: 0 descargas y 0 likes, sin resultados de benchmarks ni revisión independiente.
- Reproducibilidad parcial: se cita un repositorio *welfare-improvements* como responsable del marco y la evaluación, pero no se proporciona su URL ni enlaces a resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-32b-control-B1-sdf
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Corpus declarado (`joshycodes/qwen3-32b-controls-corpus`): https://huggingface.co/joshycodes/qwen3-32b-controls-corpus
- Repositorio *welfare-improvements*: no disponible (citado en la model card sin URL)
- Paper, blog o demo asociados: no disponible
- Resultados de búsqueda web: sin información relevante sobre el modelo; los resultados devueltos corresponden a sitios de alquiler de libros de texto y no guardan relación con esta ficha
