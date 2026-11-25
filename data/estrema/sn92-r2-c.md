# estrema/sn92-r2-c

## Resumen

estrema/sn92-r2-c es un modelo de lenguaje de gran tamano (31.273.088.876 parametros, aproximadamente 31,3 mil millones) publicado por el usuario estrema en Hugging Face. Se trata de un fine-tune del modelo MachinePulseAI/karpo-decision-31B, segun los metadatos disponibles, y lleva asociados los tags `gemma4`, `reax`, `bittensor` y `sn92`, lo que sugiere que forma parte del ecosistema de subredes de Bittensor (concretamente la subred 92) y que su arquitectura base esta emparentada con la familia Gemma.

El modelo se distribuye en formato safetensors con un repositorio de 62,6 GB, lo que es coherente con un modelo denso de ~31B en precision de 16 bits. La licencia declarada es Apache 2.0, aunque el acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face para poder descargar los pesos.

La informacion publica disponible es muy escasa: no se declaran idiomas soportados, no hay pipeline definido, no hay resultados de benchmarks ni documentacion tecnica sobre el proceso de entrenamiento. Esta ficha recoge exclusivamente los datos verificables de la model card y advierte explicitamente de los vacios de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, segun tag `gemma4`); detalles no disponibles |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `gemma4` apunta a que la arquitectura subyacente pertenece a la familia Gemma de Google, aunque no se especifica la variante exacta ni la configuracion de capas, dimensiones ocultas o mecanismo de atencion. El modelo es un fine-tune de MachinePulseAI/karpo-decision-31B, que a su vez actua como modelo base; no se documenta si el ajuste se realizo mediante SFT, DPO, RLHF u otra tecnica.

No hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de datos sinteticos o la existencia de fases de alineacion. El tag `reax` y la referencia a `bittensor`/`sn92` sugieren un contexto de entrenamiento o evaluacion descentralizada dentro de la subred 92 de Bittensor, pero no se aportan detalles tecnicos verificables sobre ese proceso.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura base Gemma.
- Razonamiento y respuesta a instrucciones: presumible por el ajuste fino sobre un modelo base orientado a decision, aunque no documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Contexto largo: no disponible (longitud de contexto no declarada).

## Casos de uso

- Experimentacion en el ecosistema Bittensor: el modelo esta etiquetado con `sn92` y `bittensor`, por lo que su uso previsto parece ser la participacion o evaluacion dentro de la subred 92; encaja en flujos de mineros/validadores que necesitan un modelo de ~31B afinado para una tarea concreta.
- Fine-tuning posterior sobre dominio propio: al ser un modelo denso de 31B con licencia Apache 2.0, puede servir como punto de partida para ajustes especificos, siempre que se acepten las condiciones de acceso.
- Investigacion sobre fine-tuning de modelos Gemma: util para estudiar como se comporta un ajuste sobre karpo-decision-31B en tareas de decision, comparandolo con el modelo base.
- Despliegue en infraestructura propia con GPUs de 80 GB: un modelo de 31B en bf16 ocupa aproximadamente 62 GB de pesos, por lo que cabe en una A100/H100 de 80 GB o en configuraciones multi-GPU consumer.
- Evaluacion comparativa de modelos de la misma familia: sirve como referencia en estudios que comparen variantes afinadas de la familia Gemma de ~30B.
- Generacion de texto general en entornos controlados: puede emplearse para tareas de redaccion o resumen una vez validado su comportamiento, dado que no hay benchmarks publicos que garanticen calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 62-65 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 70-80 GB en total).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 31-35 GB.
- VRAM estimada en cuantizacion de 4 bits (si se generan pesos GGUF/AWQ, no confirmados): aproximadamente 16-20 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (2x RTX 4090 de 24 GB, 2x A6000 de 48 GB) para precision completa.
- Cabe en GPU consumer: en bf16 no cabe en una unica GPU consumer; en 4 bits podria caber en una RTX 4090 de 24 GB, condicionado a que existan pesos cuantizados (no disponibles en el repo).
- Opciones de despliegue: vLLM, TGI o llama.cpp (este ultimo solo si se generan pesos GGUF); no se confirma compatibilidad con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| estrema/sn92-r2-c | ~31,3B | no disponible | Apache 2.0 | Gated en HF | Fine-tune de karpo-decision-31B |
| MachinePulseAI/karpo-decision-31B | ~31B (presumible) | no disponible | no disponible | HF | Modelo base del que deriva |
| Gemma 2 27B (Google) | 27B | 8K (referencia publica) | Gemma license | Abierto | Referencia de la familia, contexto y licencia distintos |

La comparacion con otras alternativas de ~30B (p. ej. Qwen2.5-32B o Mistral Small) no se incluye con datos numericos porque no hay benchmarks publicados para este modelo que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card sustantiva, ni benchmarks, ni descripcion del dataset de entrenamiento.
- Acceso restringido (gated): es obligatorio aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad.
- Riesgo de alucinacion: sin evaluaciones publicadas no es posible acotar la tasa de alucinacion ni la fiabilidad en tareas factuales.
- Idiomas no declarados: se desconoce el soporte multilingue real; no asumir buen rendimiento en castellano sin validacion previa.
- Contexto no declarado: no se puede planificar su uso en tareas de contexto largo sin verificar la configuracion real del modelo.
- Licencia Apache 2.0 declarada, pero al ser un fine-tune de un modelo base de terceros conviene verificar que la licencia del modelo base (karpo-decision-31B) sea compatible con uso comercial.
- Sin garantias de calidad en produccion: al no haber benchmarks ni evaluaciones independientes, su uso en entornos productivos requiere una evaluacion propia exhaustiva.
- Procedencia ligada a Bittensor: el modelo puede estar optimizado para una tarea muy concreta de la subred 92, lo que puede reducir su generalidad fuera de ese contexto.

## Enlaces

- Hugging Face: https://huggingface.co/estrema/sn92-r2-c
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Bittensor (ecosistema referenciado por los tags): https://bittensor.com
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
