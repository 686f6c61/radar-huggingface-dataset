# logic65/Qwen3.8-Whittle-tri-14.7B

## Resumen

Qwen3.8-Whittle-tri-14.7B es un modelo de lenguaje de 14.700 millones de parámetros desarrollado por David Aylward (logic65) como parte de una línea de investigación sobre compresión de profundidad en modelos Qwen. Parte del modelo Qwen/Qwen3.8-27B-FP8 (Apache 2.0) y reduce sus 64 capas a 32 mediante un proceso de destilación por unidades, en lugar de eliminar capas directamente. El resultado es un modelo que conserva la estructura de bloques `[gdn, gdn, gdn, attention]` del original, pero con la mitad de profundidad.

La relevancia de este modelo reside en su enfoque: demuestra que es posible comprimir un modelo grande a la mitad de capas mediante entrenamiento de destilación local, ejecutado en hardware de consumo (dos RTX 3060 durante una noche), y que una fase corta de QLoRA posterior puede recuperar gran parte del conocimiento. El autor reporta que el modelo alcanza 31/39 en su batería de pruebas interna, igualando a un corte por eliminación pura de 16.8B pero siendo 2.1B más pequeño, y que es el único de su familia que no entra en bucles de generación con decodificación greedy.

Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y GGUF, y está pensado como una vista previa de investigación: el propio autor advierte que el razonamiento multi-paso y la aritmética son débiles y que el modelo necesita post-entrenamiento adicional antes de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques recurrentes Gated DeltaNet y atención, patrón `[gdn, gdn, gdn, attention]` (32 capas comprimidas desde 64) |
| Parametros totales | 14.719.400.192 (14.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda del base Qwen3.8-27B, no especificado) |
| Tipos de cuantizacion | GGUF (tipos no especificados en la documentacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B tiene 64 capas organizadas en bloques repetidos de cuatro: tres capas recurrentes Gated DeltaNet (gdn) seguidas de una capa de atención. Qwen3.8-Whittle-tri-14.7B comprime estas 64 capas en 32 manteniendo el mismo patrón 3:1. La compresión se realiza mediante destilación de 24 unidades: 16 pares de capas recurrentes adyacentes y 8 triples que absorben una estación de atención completa en una única capa recurrente. Cada unidad se entrena para reproducir los estados ocultos de salida de las capas originales (el profesor) dado el mismo input, y las etapas se ejecutan en orden, de modo que cada una absorbe la deriva acumulada por las anteriores.

El autor reporta que absorber una estación de atención mediante destilación produce un error relativo de 0.0045, muy inferior a las alternativas de eliminar capas (0.0365) o componer en paralelo sin entrenar (0.0350). Sin embargo, el error por etapa aumenta con la profundidad, desde 0.0011 en la primera unidad hasta 0.0757 en la más difícil (la atención de la capa 51). Tras el ensamblaje, el modelo solo alcanzaba 12/39 en la batería de pruebas. Una fase de reparación con QLoRA sobre aproximadamente 760k tokens durante 90 minutos elevó la puntuación a 31/39, eliminó los bucles de generación y mejoró el formateo markdown. El entrenamiento completo se realizó en dos GPUs RTX 3060.

## Capacidades

- Generación de texto fluida y con formato correcto, incluyendo cercado markdown (8/8 en la batería del autor).
- Reconocimiento forzado (forced-choice) aceptable: 5/7 en pruebas de reconocimiento frente a recuerdo.
- Ausencia de bucles de generación bajo decodificación greedy y con temperatura 0.7 (0/6 en ambos casos).
- Capacidad de seguir instrucciones básicas, aunque con limitaciones en tareas que requieren razonamiento multi-paso.
- Aritmética multi-paso muy deficiente: 3.6% de aciertos en GSM8K (18/500), con un 32% de respuestas no puntuables (120 no parseables y 39 errores).
- No se documenta soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en compresión de modelos: sirve como caso de estudio para evaluar la viabilidad de la destilación por capas frente a la eliminación directa, especialmente en arquitecturas recurrentes híbridas como Gated DeltaNet.
- Prototipado de generación de texto con formato: su capacidad para producir markdown correcto y su ausencia de bucles lo hacen utilizable en demos donde se requiere salida estructurada sin razonamiento complejo.
- Experimentación con post-entrenamiento: al ser un modelo abierto con limitaciones conocidas, es un banco de pruebas para técnicas de fine-tuning (QLoRA, DPO) orientadas a recuperar capacidades de razonamiento.
- Generación de texto conversacional simple: puede mantener diálogos cortos sin entrar en repeticiones, aunque con riesgo de errores factuales y aritméticos.
- Evaluación de métricas de compresión: permite comparar el impacto de la destilación frente a cortes por eliminación en términos de rendimiento y tamaño.
- Despliegue en entornos con recursos limitados: al ser 14.7B y estar disponible en GGUF, puede ejecutarse en GPUs de consumo con cuantización, aunque con las limitaciones de razonamiento mencionadas.

## Benchmarks y rendimiento

El autor proporciona resultados de su batería interna de 39 prompts y de GSM8K. No se han publicado comparaciones con otros modelos en la información disponible.

| Prueba | Resultado |
|---|---|
| Batería de 39 prompts (tras destilación) | 12/39 |
| Batería de 39 prompts (tras QLoRA) | 31/39 |
| Cercado markdown | 8/8 |
| Bucles con greedy | 0/6 |
| Bucles con t=0.7 | 0/6 |
| Reconocimiento forzado | 5/7 |
| GSM8K (500 preguntas, greedy, zero-shot) | 18 correctas (3.6% ± 1.6%) |

En GSM8K, el 32% de las respuestas no fueron puntuables (120 no parseables y 39 errores), lo que indica problemas tanto de razonamiento como de seguimiento de instrucciones.

## Requisitos de hardware

- El entrenamiento se realizó en dos GPUs RTX 3060 (12GB cada una) durante una noche, más 90 minutos de QLoRA.
- Para inferencia, un modelo de 14.7B en FP16 requiere aproximadamente 29GB de VRAM. Con cuantización GGUF de 4 bits, el uso de VRAM se reduce a unos 8-9GB, lo que permite ejecutarlo en una GPU consumer de 12GB o incluso en dos GPUs de 8GB (el autor menciona que el modelo hermano 48L-cut corre a 5 tok/s en dos 8GB).
- Opciones de despliegue: llama.cpp (con soporte Qwen3.5), Ollama, vLLM o TGI si se convierten los pesos. El autor recomienda parámetros de anti-loop sampling opcionales: `--dry-multiplier 0.8 --dry-base 1.75 --dry-allowed-length 4 --repeat-penalty 1.15`.
- No se proporcionan datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos formales en la información proporcionada. El autor menciona dos referencias cualitativas:

| Modelo | Parametros | Contexto | Rendimiento (batería 39) | Licencia |
|---|---|---|---|---|
| Qwen3.8-Whittle-tri-14.7B | 14.7B | no disponible | 31/39 | Apache 2.0 |
| Qwen3.8-Whittle-48L-cut | 16.8B (estimado) | no disponible | 33/39 | Apache 2.0 |
| Qwen/Qwen3.8-27B-FP8 (base) | 27B | no disponible | no evaluado | Apache 2.0 |

El modelo tri es 2.1B más pequeño que el corte por eliminación (48L-cut) y obtiene 2 puntos menos en la batería, pero es el único de la familia sin bucles de generación. No hay datos de otros modelos comparables de terceros.

## Limitaciones y advertencias

- Aritmética multi-paso muy deficiente: 3.6% de aciertos en GSM8K, con un tercio de respuestas no puntuables.
- Razonamiento encadenado (chain-of-thought) frágil: el autor indica que 760k tokens de reparación no fueron suficientes para restaurarlo.
- El modelo es una vista previa de investigación, no un producto listo para producción. Requiere post-entrenamiento adicional para tareas de razonamiento.
- Posibles sesgos heredados del modelo base Qwen3.8-27B, no documentados específicamente.
- Riesgo de alucinación en tareas factuales, especialmente tras la compresión (el autor menciona que el conocimiento se "descoordina" y requiere reparación).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.
- No se especifican idiomas soportados; se asume herencia del base, pero sin confirmación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/Qwen3.8-Whittle-tri-14.7B
- Modelo hermano (48L-cut): https://huggingface.co/logic65/Qwen3.8-Whittle-48L-cut
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Página de investigación de Qwen: https://qwen.ai/research/
- Información sobre Qwen3.8 en OpenLM: https://openlm.ai/qwen3.8/
