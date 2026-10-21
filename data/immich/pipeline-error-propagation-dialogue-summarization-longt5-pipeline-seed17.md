# Immich/pipeline-error-propagation-dialogue-summarization-longt5-pipeline-seed17

## Resumen

Este repositorio contiene un ajuste fino de `google/long-t5-tglobal-base` para resumen de diálogos multirreunión, publicado por el usuario Immich como parte del experimento *Controlled Error Propagation Analysis in Transformer-Based Pipelines for Dialogue Summarization*. No es un modelo de propósito general: es un artefacto de investigación que implementa una etapa concreta de una pipeline jerárquica de resumen (segmentación por tópicos, extracción de actos de diálogo y generación por tópico con concatenación cronológica), entrenada sobre las reuniones del corpus AMI.

El modelo tiene 247.545.984 parámetros y se entrena con un límite de entrada de 4096 tokens, lo que permite procesar transcripciones de reunión completas o fragmentos amplios sin truncar el contexto conversacional. Se distribuye únicamente en safetensors (1,0 GB de repositorio) bajo licencia MIT, con los componentes preentrenados sujetos a Apache-2.0. El checkpoint corresponde a la semilla 17 y a la época 15, seleccionada por ROUGE-Lsum medio por reunión en validación (53,287454).

Su relevancia es metodológica más que de producto: sirve para reproducir y auditar un análisis de propagación de errores en pipelines de resumen, y su model card advierte explícitamente de que las diferencias frente a la línea base incluyen entradas privilegiadas derivadas de las anotaciones de referencia (etiquetas de extracción y *summlinks*), por lo que no aíslan una ventaja arquitectónica. Cargar los pesos sin replicar la rutina completa de generación no reproduce el experimento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder LongT5 con atención *transient global* (TGlobal), backbone `google/long-t5-tglobal-base` (revisión `aecb1376e5bd78db32ebc5c9deb257449b9e2b21`) |
| Parámetros totales | 247.545.984 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens de entrada (límite de entrenamiento y de la arquitectura TGlobal del backbone) |
| Tipos de cuantización | No se distribuyen pesos cuantizados; solo safetensors en BF16/FP32. Compatible con cuantización dinámica de PyTorch, bitsandbytes y conversión externa a GGUF/ONNX (no incluidas en el repositorio) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT para las contribuciones del repositorio; componentes preentrenados bajo Apache-2.0 (`UPSTREAM_LICENSE.txt`); anotaciones AMI bajo CC BY 4.0 |
| Formato de pesos | safetensors (repo de 1,0 GB); SHA-256 de pesos `a18586dc8e925d565fee307c686f7eacc7d6db20178562eaf760fbb5ca68b48c` |

## Arquitectura y entrenamiento

El backbone es LongT5 en configuración *base* (12 capas de encoder y 12 de decoder, dimensión oculta 768, 12 cabezas de atención, vocabulario de SentencePiece de 32 128 tokens), con atención TGlobal que sustituye la atención local de LongT5 por embeddings globales transitorios derivados de la entrada, lo que reduce el coste cuadrático y permite secuencias de hasta 4096 tokens. El modelo se ajusta como seq2seq estándar para generación de resumen; la lógica de pipeline (segmentación por tópicos, extracción de actos de diálogo, generación por tópico y concatenación cronológica) vive fuera de los pesos y debe implementarse aparte.

El ajuste fino usa 94 reuniones de entrenamiento, 20 de validación y 19 de test del subconjunto de reuniones *scenario* de AMI (diseño de mandos a distancia). Hiperparámetros registrados: tasa de aprendizaje 0,0003, tamaño de lote efectivo 16, entrada limitada a 4096 tokens, entrenamiento en BF16 y validación/generación en FP32, con parada en la época 15 por mejor ROUGE-Lsum medio por reunión en validación. La decodificación emplea 4 haces, *length penalty* 2,0, bloqueo de trigramas y un tope de 512 tokens por reunión, con asignación de cupo por tópico. No se documenta RLHF ni DPO: es un ajuste supervisado sobre resúmenes de referencia, con entradas privilegiadas (etiquetas *gold* de extracción y *summlinks*) en la variante *oracle*.

## Capacidades

- Generación de resúmenes abstractivos de diálogo y de reunión en inglés, con entrada de hasta 4096 tokens.
- Resumen jerárquico por tópicos cuando se orquesta la pipeline completa: segmentación, extracción de actos de diálogo, generación por tópico y concatenación.
- Manejo de transcripciones con múltiples hablantes y estructura conversacional (turnos, solapamientos, menciones a enlaces de resumen).
- Generación controlada por configuración de decodificación (haces, *length penalty*, bloqueo de n-gramas, tope de tokens).
- Soporte de *tool calling* / *function calling*: no disponible; no se entrena ni se documenta para ello.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible; la multi-paso existe solo como pipeline externa orquestada.
- Capacidades multilingües: solo inglés; no se reporta transferencia a otros idiomas.
- Modo *thinking*, visión o audio: no disponible.
- Cuantización y despliegue vía `transformers` (`AutoModelForSeq2SeqLM`), con versión de referencia 4.57.6.

## Casos de uso

- Reproducción de experimentos de propagación de errores: utilizar el checkpoint con la semilla 17 como una de las réplicas del estudio, ejecutando la rutina de generación del *notebook* de publicación para comparar frente a otras semillas y variantes *oracle*/ruido.
- Resumen de actas de reuniones técnicas en inglés: con entradas de hasta 4096 tokens, una transcripción de reunión de aproximadamente una hora puede procesarse en un solo paso sin truncado agresivo, generando un resumen de hasta 512 tokens.
- Resumen por tópicos de reuniones largas: integrar el modelo como generador de la etapa final de una pipeline propia que segmente la transcripción y le pase cada bloque temático por separado, concatenando después las salidas en orden cronológico.
- Investigación en evaluación de resumen: usar el modelo como sistema de referencia para estudiar la correlación entre ROUGE-Lsum y calidad factual, dado que la model card advierte de que ROUGE mide solo solapamiento léxico.
- Prototipado de asistentes de documentación interna: desplegado en CPU o en una GPU de gama media, permite generar borradores de resumen de reuniones grabadas en inglés en entornos autoalojados sin dependencia de API externa.
- Docencia y experimentación académica: al ser un modelo de 247 M de parámetros con licencia MIT y receta de entrenamiento documentada, es adecuado para prácticas de ajuste fino de seq2seq en corpus pequeños (94 reuniones) y para estudiar sobreajuste y selección de checkpoint.
- Análisis de errores en cascada: la estructura del repositorio (índices de sondeo, estadísticas de tokens, configuración e historial completo en `training_logs/`) permite auditar cómo se propaga un error de segmentación o de extracción hasta el resumen final.

## Benchmarks y rendimiento

| Métrica | Conjunto | Valor | Notas |
|---|---|---|---|
| ROUGE-Lsum (medio por reunión) | Validación AMI, época 15 | 53,287454 | Métrica de selección del checkpoint |
| ROUGE-1 / ROUGE-2 / ROUGE-L en test | Test AMI (19 reuniones) | No disponible en la información proporcionada | Requiere ejecutar la rutina de generación completa |
| MMLU, HumanEval, GSM8K u otros benchmarks generales | — | No aplicable | El modelo no está entrenado para esas tareas |

No se han publicado resultados de benchmarks en la información disponible más allá del valor de validación indicado. Cualquier comparación con otros sistemas debe hacerse sobre el mismo protocolo (4 haces, *length penalty* 2,0, bloqueo de trigramas, tope de 512 tokens por reunión) y advirtiendo que las variantes *oracle* reciben entradas privilegiadas derivadas de las anotaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~1,0 GB solo de pesos; en BF16/FP16: ~0,5 GB; en int8: ~0,25 GB; en int4: ~0,13 GB.
- Con activaciones y atención sobre 4096 tokens, batch 1 y 4 haces de búsqueda: aproximadamente 2-4 GB en FP16, según implementación y longitud real de entrada.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4090, L4, A10, A100) funciona con holgura; para lotes grandes o ajuste fino conviene 16-24 GB (A100 40 GB, L40S, RTX 4090).
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas con 6-8 GB; también es viable en CPU para inferencia interactiva con latencia de segundos por reunión.
- Opciones de despliegue: `transformers` 4.57.6 (versión registrada por el experimento), vLLM y TGI para servir seq2seq, Optimum/ONNX para exportación. No hay archivos GGUF en el repositorio, por lo que llama.cpp u Ollama requieren una conversión previa no oficial.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la longitud de la transcripción, del número de tópicos y de los 4 haces de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| Este modelo (LongT5-base pipeline, seed 17) | 247,5 M | 4096 | MIT (repo) / Apache-2.0 (upstream) | Checkpoint de investigación; requiere pipeline externa para reproducir resultados |
| `google/long-t5-tglobal-base` | 247,5 M | 4096 | Apache-2.0 | Backbone preentrenado sin ajuste a resumen de diálogo; base directa de este modelo |
| `google/long-t5-tglobal-large` | No disponible en la información proporcionada | 4096 | Apache-2.0 | Alternativa de mayor capacidad del mismo family; no evaluada aquí |
| `allenai/led-base-16384` | No disponible en la información proporcionada | 16384 | Apache-2.0 | Modelo Longformer encoder-decoder orientado a documentos largos; no ajustado específicamente a AMI |
| `google/flan-t5-base` | No disponible en la información proporcionada | 512 | Apache-2.0 | Contexto insuficiente para transcripciones completas de reunión; requeriría troceado |

No se dispone de resultados de benchmarks comparables entre estas alternativas en la información proporcionada; las cifras de parámetros y contexto de los modelos de terceros son datos públicos de sus propias fichas y no se han verificado en este análisis.

## Limitaciones y advertencias

- Dominio muy restringido: evaluado exclusivamente en reuniones *scenario* de AMI sobre diseño de mandos a distancia; el rendimiento fuera de ese género y tema no está caracterizado.
- Solo inglés; no se documenta comportamiento en otros idiomas.
- ROUGE mide solapamiento léxico, no exactitud factual: no hay garantía de que el resumen sea fiel a la transcripción, y el riesgo de alucinación en nombres, cifras y decisiones es real.
- Las comparaciones *oracle* frente a la línea base incluyen entradas privilegiadas derivadas de las anotaciones de referencia; no deben interpretarse como ventaja arquitectónica.
- Un tope compartido de 512 tokens por reunión no implica longitudes efectivas iguales entre enfoques, lo que puede sesgar comparaciones de ROUGE.
- El checkpoint no incluye estado del optimizador ni del generador aleatorio: no es reanudable para entrenamiento, solo para inferencia o evaluación.
- Cargar los pesos no reproduce el experimento: la segmentación, la asignación de cupo por tópico, los manifiestos *oracle*/ruido y la concatenación forman parte de la rutina de generación.
- Corpus pequeño (94/20/19 reuniones) y una sola semilla por checkpoint: riesgo de sobreajuste y de alta varianza entre ejecuciones.
- Licencia: el repositorio retiene metadatos MIT de la publicación anterior, pero los componentes preentrenados mantienen Apache-2.0 y las anotaciones AMI exigen atribución CC BY 4.0 al AMI Consortium; conviene revisar `UPSTREAM_LICENSE.txt` y `UPSTREAM_MODEL_CARD.md` antes de un uso comercial.
- Dependencia de versión: la model card fija Transformers 4.57.6 y un commit concreto del Hub; otras versiones pueden alterar la generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Immich/pipeline-error-propagation-dialogue-summarization-longt5-pipeline-seed17
- DOI del modelo: https://doi.org/10.57967/hf/11158
- Registro maestro de replicación (Zenodo, todas las versiones): https://doi.org/10.5281/zenodo.21792310
- Modelo base: https://huggingface.co/google/long-t5-tglobal-base
- Corpus AMI: https://groups.inf.ed.ac.uk/ami/corpus/
- Nota: los resultados de búsqueda web disponibles apuntan a Immich, la aplicación autoalojada de gestión de fotos y vídeos (https://immich.app/ y https://github.com/immich-app/immich), un proyecto sin relación con este modelo; no se han encontrado en la búsqueda enlaces adicionales del paper, blog o repositorio asociados a esta ficha.
