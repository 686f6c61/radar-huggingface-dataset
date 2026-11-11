# dumping-grounds/Thinklite-27B-Concept

## Resumen

Thinklite-27B-Concept es un modelo experimental publicado por el usuario dumping-grounds en Hugging Face. No se trata de un entrenamiento desde cero ni de un ajuste fino convencional, sino de una edición de pesos aditiva: se toma el modelo Sparset/Thinklite-27B y se le injerta la dirección de concepto extraída de ConceptCountry/qwen-concept-27b. El resultado es un artefacto de investigación sobre edición de pesos, no un modelo listo para producción.

El modelo cuenta con 27.781.427.952 parámetros totales (unos 27,8 mil millones) en formato safetensors y un repositorio de 58,8 GB, lo que sugiere pesos en bf16. La edición se aplicó únicamente sobre nueve matrices `mlp.down_proj` de las capas 32 a 48 (pares), calculando el delta como `concept(bf16) - Qwen/Qwen3.8-27B`, truncando por rango bajo cuando el diferencial era claramente low-rank y sumándolo en fp32 antes de redondear a bf16.

La relevancia de esta ficha es acotada pero real: documenta una técnica de transplante de dirección conceptual entre modelos de la misma familia (Qwen3.5) y sirve como referencia metodológica para quien investigue weight editing. El propio autor advierte que el modelo no ha sido evaluado con ningún benchmark y que la dirección conceptual se derivó de las activaciones del modelo base, no de Thinklite, por lo que su efecto es incierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); detalles de atencion y FFN no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `concept_delta.safetensors` con los deltas en fp32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Sparset/Thinklite-27B, un modelo de la familia Qwen3.5 con aproximadamente 27,8 mil millones de parámetros. No se dispone de información sobre el número de capas, dimensión oculta, tipo de atención ni composición del dataset de entrenamiento original. El tag `qwen3_5` indica la familia, pero la model card no detalla la configuración interna.

El proceso de creación de este modelo no es un entrenamiento sino una edición de pesos. Se extrajo la dirección de concepto de ConceptCountry/qwen-concept-27b calculando la diferencia entre ese modelo y Qwen/Qwen3.8-27B; según la model card, solo difieren las nueve matrices `mlp.down_proj` de las capas 32 a 48 (pares). El delta se denoizó mediante truncamiento de rango bajo cuando era claramente low-rank y se sumó en fp32 a los pesos correspondientes de Thinklite-27B antes de redondear a bf16. El repositorio incluye `TRANSPLANT_REPORT.json` con las normas por tensor y los valores singulares, y `CONCEPT_EDIT_SPEC.json` con la especificación upstream. No se aplicó RLHF, DPO ni ningún otro proceso de alineamiento en esta edición.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Thinklite-27B, aunque no verificadas tras la edición.
- Edición de pesos: el modelo incorpora una dirección conceptual transplantada que, en teoría, modula el comportamiento en las capas 32-48.
- Tool calling y function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Al ser un artefacto experimental no evaluado, no se puede garantizar ninguna capacidad concreta más allá de la herencia del modelo base.

## Casos de uso

- Investigación en edición de pesos: el modelo sirve como caso de estudio para analizar cómo se comporta un transplante de dirección conceptual entre modelos de la misma familia, comparando activaciones antes y después de la edición en las capas 32-48.
- Reproducibilidad de técnicas de weight editing: los ficheros `concept_delta.safetensors`, `TRANSPLANT_REPORT.json` y `CONCEPT_EDIT_SPEC.json` permiten replicar el procedimiento de extracción, denoizado y suma de deltas en fp32.
- Análisis de robustez de finetunes: al aplicar una dirección derivada del modelo base sobre un finetune completo, se puede estudiar si la dirección conceptual conserva su significado o se degrada, tal como advierte el autor.
- Docencia y divulgación: útil para explicar en un curso o artículo cómo se calcula un delta entre dos checkpoints y cómo se trunca por rango bajo.
- Base para experimentos controlados: se puede usar como punto de partida para probar variantes del transplante (otras capas, otros factores de escala, otras direcciones) y medir el impacto con benchmarks propios.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea que requiera comportamiento verificado, dado que no ha sido evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que "nothing has been benchmarked" y que el modelo es "experimental, unevaluated".

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 56 GB solo para pesos (27,8 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16: similar a bf16, en torno a 56 GB.
- VRAM estimada en cuantización 8 bits: aproximadamente 28 GB.
- VRAM estimada en cuantización 4 bits: aproximadamente 14-16 GB, aunque no se han publicado versiones GGUF ni cuantizaciones oficiales.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o dos GPU de 40 GB en tensor parallelism.
- GPU consumer: no cabe en una RTX 4090 (24 GB) en bf16; en 4 bits podría caber en una RTX 4090 o RTX 3090, pero requeriría cuantización propia no publicada.
- Opciones de despliegue: vLLM o TGI para bf16 en GPU de 80 GB; llama.cpp u Ollama solo si se generan cuantizaciones GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Thinklite-27B-Concept | 27,8 B | no disponible | Apache 2.0 | Experimental, sin evaluar |
| Sparset/Thinklite-27B (base) | ~27 B | no disponible | no disponible | Modelo base del que se parte |
| ConceptCountry/qwen-concept-27b | ~27 B | no disponible | no disponible | Fuente de la dirección conceptual |
| Qwen/Qwen3.8-27B | ~27 B | no disponible | no disponible | Referencia para calcular el delta |

No se dispone de datos de rendimiento para ninguno de estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros y procedencia.

## Limitaciones y advertencias

- Modelo no evaluado: no se ha ejecutado ningún benchmark, por lo que se desconoce si la edición mejora, degrada o deja intactas las capacidades del modelo base.
- Dirección conceptual mal alineada: el autor advierte que la dirección se derivó de las activaciones del modelo base, mientras que Thinklite es un finetune completo, por lo que el efecto puede no ser el esperado.
- Riesgo de alucinación: no cuantificado; al no haber evaluación, no se puede descartar que la edición introduzca comportamientos erráticos.
- Sesgos: no documentados.
- Idiomas: no declarados; se desconoce el soporte multilingüe real.
- Contexto: no documentado; no se puede planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto experimental sin garantías, su uso en producción es desaconsejado por el propio autor.
- Repositorio con pocas descargas (25) y sin likes: no hay validación comunitaria.
- No se publican cuantizaciones GGUF ni versiones optimizadas para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dumping-grounds/Thinklite-27B-Concept
- Modelo base: https://huggingface.co/Sparset/Thinklite-27B
- Fuente de la dirección conceptual: https://huggingface.co/ConceptCountry/qwen-concept-27b
