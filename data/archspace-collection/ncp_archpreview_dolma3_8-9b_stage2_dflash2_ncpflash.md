# ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_DFlash2_NCPFlash

## Resumen

El NCPFlash-DFlash2-NCPFlash es un modelo de borrador (drafter) de aproximadamente 1.100 millones de parámetros diseñado para acelerar la decodificación especulativa del modelo de lenguaje NCP-ArchPreview Stage 2 V1, un transformer de 8.900 millones de parámetros. Desarrollado por The NCP Team en el Shanghai AI Lab y el LUMIA Lab de la Universidad Jiao Tong de Shanghái, se publica bajo licencia Apache 2.0. El modelo propone bloques de hasta 16 tokens futuros en una única pasada y el modelo objetivo los verifica de forma exacta, lo que reduce el número de pasos secuenciales de decodificación. Su arquitectura combina un mezclador temporal DFlash2, fusión de características de cinco capas profundas del modelo objetivo y un condicionamiento por concepto causal (NCP) que añade solo 0,04 millones de parámetros. Está entrenado por destilación online sobre 5.000 millones de tokens fijos, con 10 épocas sobre un subconjunto y una longitud de secuencia de 8.192 tokens. El checkpoint guarda solo los pesos del drafter; el vocabulario, las capas de embedding y la cabeza de salida se toman del modelo objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConceptLMDFlashModel (drafter para decodificación especulativa) |
| Parametros totales | 1.105.121.310 (~1,1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | No disponible (checkpoint en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El NCPFlash es un drafter por bloques que realiza una única pasada hacia adelante para proponer un bloque de 16 tokens futuros, diseñado para trabajar junto al modelo objetivo NCP-ArchPreview Stage 2 V1. Su arquitectura combina tres componentes: un mezclador DFlash2 que modela dependencias entre posiciones adyacentes mediante una convolución dinámica de kernel 2 y un selector de ruta que elige una secuencia coherente entre los 16 candidatos de cada posición; una fusión de características del objetivo estilo DFlare, donde cada capa del drafter aprende una mezcla ponderada de cinco representaciones ocultas del target (capas 1, 4, 7, 10 y 13); y un condicionamiento por concepto causal (NCP) que inyecta una señal de concepto normalizada del último bloque completado del target mediante RMSNorm y una residual con puerta tanh, activando las puertas desde cero durante el entrenamiento. Las capas del drafter se inicializan desde las capas del decoder del target (capas 0, 4, 8, 12 y 15), y tanto el tokenizer como las capas de embedding y la cabeza de salida se comparten con el modelo objetivo. El modelo se procesa en BF16, usa RoPE con base 500.000 y el backend de atención FlexAttention de PyTorch.

El entrenamiento se realiza mediante destilación online del modelo objetivo sobre un subconjunto fijo de 5.000 millones de tokens, con 10 épocas, longitud de secuencia de 8.192 tokens, 512 anclas por secuencia y batch global de 512. Durante el entrenamiento, las representaciones del target se calculan sobre las mismas secuencias del corpus. La única diferencia controlada entre el baseline y la variante con concepto es la adición de la ruta de condicionamiento por concepto, que aporta 40.960 parámetros adicionales (unos 0,04 millones).

## Capacidades

- Generación de bloques de 16 propuestas de tokens en paralelo para decodificación especulativa, verificadas de forma exacta por el modelo objetivo.
- Mejora de la velocidad de inferencia del modelo NCP-ArchPreview Stage 2 V1, reduciendo los pasos secuenciales de decodificación.
- Condicionamiento por concepto causal: utiliza señales de concepto aprendidas del target para adaptar las propuestas, con un coste de parámetros mínimo.
- Fusión de características de múltiples profundidades del target, lo que permite que cada capa del drafter acceda a representaciones de distinta abstracción.
- Integración con motores de inferencia que soporten block-parallel speculative decoding.
- Funciona únicamente como componente auxiliar del modelo objetivo; no es un modelo de lenguaje autónomo y no soporta tool calling, agentes ni generación directa de texto por sí mismo.

## Casos de uso

- Aceleración de la inferencia de NCP-ArchPreview Stage 2 V1 en aplicaciones de baja latencia: el drafter reduce el número de pasos de decodificación secuenciales, mejorando el tiempo de respuesta en servicios de conversación o generación de texto.
- Despliegue en producción con vLLM o motores compatibles con decodificación especulativa: integrando el drafter junto al target se puede aumentar el throughput por GPU sin modificar el modelo base.
- Investigación en decodificación especulativa: sirve como implementación de referencia de un drafter entrenado por destilación online con condicionamiento por concepto, útil para comparar con variantes DFlash2 o modelos similares.
- Mejora de la generación de código en entornos de autocompletado: el informe reporta la mayor ganancia relativa en HumanEval (+7,59%), lo que sugiere que el modelo es especialmente eficaz para tareas de programación.
- Reducción de costes computacionales en servidores GPU: al requerir menos verificaciones del target por token aceptado, se puede disminuir el coste operativo por token generado en servicios de IA.
- Experimentos académicos en técnicas de modelado de concepto (NCP): investigadores pueden usar el drafter para analizar el efecto del condicionamiento por concepto en la calidad de las propuestas, gracias a la licencia Apache 2.0 y al código abierto del modelo.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles en la model card corresponden a la longitud media de secuencias aceptadas durante la decodificación especulativa, comparando el baseline (DFlash2 sin concepto) y la variante con concepto (NCPFlash):

| Metrica | Baseline | Baseline + Concept | Variacion |
|---|---|---|---|
| Longitud media aceptada | 5.933 | 6.180 | +4,17% |
| Ganancia relativa en HumanEval | - | - | +7,59% |

No se han publicado resultados de benchmarks convencionales (MMLU, GSM8K, HumanEval completo, etc.) para el drafter, ya que se trata de un modelo auxiliar, no de un modelo de lenguaje independiente. Los datos proceden del informe técnico del autor, cuyo enlace no está disponible en la model card.

## Requisitos de hardware

- VRAM estimada para el drafter: en BF16, los pesos ocupan aproximadamente 2,2 GB, más activaciones, por lo que se puede estimar entre 3 y 4 GB como mínimo.
- VRAM total para el sistema de decodificación especulativa: debe cargarse también el target de 8.900 millones de parámetros, que en BF16 ocupa unos 17,8 GB; la suma total supera los 20 GB.
- GPU recomendadas: A100 80GB, H100 80GB o GPUs con al menos 24 GB si el target se cuantiza a 4 bits. Una RTX 4090 podría servir con cuantización del modelo objetivo, aunque no está documentado oficialmente.
- En consumer GPU: el drafter es ligero y podría caber, pero no puede operar sin el target, que es el principal limitador.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Hugging Face Transformers con el código personalizado incluido, y cualquier motor que soporte block-parallel speculative decoding.
- Latencia y throughput estimados: no disponible. Solo se reporta la longitud media acumulada aceptada, sin datos de tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| NCPFlash (este) | ~1,1B | Drafter por bloques | 8.192 tokens | Apache 2.0 | Propone bloques de 16 tokens, condicionamiento por concepto |
| Baseline DFlash2 | ~1,1B | Drafter por bloques | 8.192 tokens | Apache 2.0 | Misma arquitectura sin la ruta NCP; control usado en el informe |
| EAGLE | ~0,6-1B | Drafter autoregresivo | Variable | MIT (según versión) | Utiliza características del target y ha sido ampliamente adoptado en decodificación especulativa |
| Medusa | Cabeceras adicionales sobre el base | Cabezas de decodificación | Según modelo base | Apache 2.0 | No es un modelo separado, sino cabeceras añadidas al LLM original |

No se dispone de una comparativa cuantitativa formal con estos modelos en la información proporcionada; la tabla refleja características arquitectónicas y de propósito general, no resultados de benchmarks compartidos.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere obligatoriamente el modelo objetivo NCP-ArchPreview Stage 2 V1 para funcionar; no genera texto por sí mismo.
- Depende de la arquitectura del target: el checkpoint no incluye embeddings ni output head, y necesita los hidden states y la señal de concepto causal del modelo objetivo; cualquier cambio en el target invalidaría el drafter.
- Longitud de contexto limitada: el máximo de entrenamiento es de 8.192 tokens; para secuencias más largas el rendimiento podría degradarse.
- Idiomas soportados no especificados: aunque el dataset Dolma es multilingüe, no se informa de los idiomas cubiertos ni de su distribución.
- Los datos de rendimiento proceden de la model card del autor y de un informe técnico cuyo enlace no está disponible; no hay validación externa o revisión por pares.
- Requiere código personalizado (custom-code) configurado para la arquitectura ConceptLMDFlashModel; esto puede complicar el despliegue con frameworks estándar que no soporten este tipo de modelos.
- El checkpoint solo está publicado en BF16, sin alternativas de cuantización, lo que limita su uso en hardware con menos VRAM.
- Los riesgos de sesgos y alucinaciones son inherentes al modelo objetivo y no se mitigan por el drafter; el drafter solo acelera la generación del target, no modifica la calidad del contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_DFlash2_NCPFlash
- Colección NCP-ArchPreview: https://huggingface.co/collections/ArchSpace-Collection/ncp-archpreview
- Modelo objetivo (target): https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_v1
- Guía de inferencia para decodificación especulativa: https://github.com/LuckySJTU/ncp_olmo_eval/blob/main/docs/SPECULATIVE_DECODING.md
- Código del modelo (modeling_dflash.py): https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_DFlash2_NCPFlash/blob/71f9d39b3d7fe06d6082a552a2819bd53469ec55/modeling_dflash.py
- Configuración publicada (config.json): https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_DFlash2_NCPFlash/blob/71f9d39b3d7fe06d6082a552a2819bd53469ec55/config.json
- Informe técnico (technical report): no disponible (enlace pendiente en la model card)
