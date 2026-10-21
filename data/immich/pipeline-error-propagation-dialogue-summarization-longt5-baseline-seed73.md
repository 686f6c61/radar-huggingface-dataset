# Immich/pipeline-error-propagation-dialogue-summarization-longt5-baseline-seed73

## Resumen

Este repositorio contiene un checkpoint de LongT5-base ajustado para resumen de diálogos y reuniones, publicado por el usuario Immich como parte del experimento *Controlled Error Propagation Analysis in Transformer-Based Pipelines for Dialogue Summarization*. Se trata de la condición de línea base (*baseline*) del estudio: el diálogo completo se tokeniza y se trunca al límite de entrada, sin componentes adicionales de selección, segmentación ni corrección de errores. El checkpoint corresponde a la semilla de entrenamiento 73 y fue seleccionado por el mejor ROUGE-Lsum medio por reunión en validación (48,601405) en la época 4.

El modelo parte del backbone `google/long-t5-tglobal-base`, una arquitectura encoder-decoder de tipo T5 con atención global transitoria (TGlobal) orientada a secuencias largas, y cuenta con 247.545.984 parámetros totales según los pesos en safetensors. Se ha fine-tuneado sobre el corpus AMI de reuniones de escenario (94 reuniones de entrenamiento, 20 de validación y 19 de test) en inglés, con un límite de entrada de 4096 tokens y un tope de generación de 512 tokens por reunión.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un artefacto de reproducibilidad para investigar cómo se propagan los errores en pipelines de resumen de diálogo. La model card advierte explícitamente de que las diferencias frente a variantes «oracle» incluyen entradas privilegiadas derivadas de la referencia y no aíslan una ventaja arquitectónica. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo LongT5 (T5 con atención global transitoria, TGlobal); backbone `google/long-t5-tglobal-base` |
| Parametros totales | 247.545.984 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens de entrada (límite del experimento); tope de generación de 512 tokens por reunión |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (entrenamiento en BF16, validación y generación en FP32); no hay versiones GGUF, GPTQ, AWQ ni ONNX publicadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT para las contribuciones del repositorio; los componentes preentrenados conservan Apache-2.0 (incluido como `UPSTREAM_LICENSE.txt`); anotaciones AMI bajo CC BY 4.0 |
| Formato de pesos | safetensors (PyTorch / Transformers); tamaño del repositorio 1,0 GB; SHA-256 de pesos `da92169de7ef7ae58d2b4a7f3ebfb7629412525f7b5cb2986cf215b433d0c249` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder derivado de T5, en la variante LongT5 con atención global transitoria (TGlobal), que sustituye la atención densa por una combinación de atención local por bloques y atención global agregada para permitir secuencias de entrada largas con coste cuadrático reducido. El checkpoint parte de la revisión `aecb1376e5bd78db32ebc5c9deb257449b9e2b21` de `google/long-t5-tglobal-base`. El ajuste se realizó con tasa de aprendizaje 0,0003, tamaño de lote efectivo 16, entrenamiento en BF16 y validación y generación en FP32, seleccionando la época 4 por ROUGE-Lsum medio por reunión en validación.

Los datos de entrenamiento son las reuniones de escenario del corpus AMI (diseño de mandos a distancia), en inglés: 94 reuniones de entrenamiento, 20 de validación y 19 de test. La decodificación en validación y test emplea 4 haces (*beams*), penalización de longitud 2,0 y bloqueo de trigramas de 3. La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el ajuste parece ser un fine-tuning supervisado seq2seq estándar con entropía cruzada. El checkpoint publicado no incluye estado del optimizador ni del generador de números aleatorios, por lo que no permite reanudar el entrenamiento, solo inferencia y evaluación.

## Capacidades

- Generación de resumen abstractivo de diálogos y reuniones en inglés, con salida de hasta 512 tokens por reunión.
- Procesamiento de transcripciones largas de hasta 4096 tokens de entrada mediante atención TGlobal.
- Resumen de reunión completa (*full-meeting baseline*): el diálogo se tokeniza íntegro y se trunca al límite de entrada, sin segmentación previa.
- Punto de referencia reproducible para análisis de propagación de errores en pipelines de resumen (ASR, diarización, segmentación, resumen).
- No soporta tool calling ni function calling: es un modelo seq2seq de texto a texto sin cabecera de herramientas.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Multilingüismo: únicamente inglés; no se documenta entrenamiento ni evaluación en otras lenguas.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (*thinking mode*).

## Casos de uso

- **Investigación sobre propagación de errores en pipelines de resumen**: sirve como condición de referencia frente a variantes con entrada «oracle» o con etapas intermedias, permitiendo cuantificar cuánto del degradado procede de las etapas previas (ASR, diarización) y no del sumarizador.
- **Generación de actas de reuniones internas en inglés**: a partir de una transcripción de hasta 4096 tokens, el modelo produce un resumen de hasta 512 tokens útil como borrador de acta, adecuado porque el dominio de entrenamiento son reuniones con habla espontánea y múltiples participantes.
- **Resumen de transcripciones de atención al cliente**: conversaciones multi-turno en inglés (soporte técnico, ventas) pueden condensarse en un resumen por caso; conviene validar antes la fidelidad porque el modelo se entrenó en un dominio muy distinto.
- **Línea base en proyectos de investigación de NLP**: cualquier grupo que entrene su propio sumarizador de diálogo puede usar este checkpoint como referencia con hiperparámetros y semilla documentados (semilla 73, época 4, 4 haces), lo que facilita comparaciones reproducibles.
- **Reproducción de experimentos publicados**: con la revisión del backbone y el commit del Hub fijados, permite replicar los resultados del artículo asociado y auditar la selección de checkpoint.
- **Generación de resúmenes de webinars y clases grabadas en inglés**: transcripciones de hasta 4096 tokens pueden condensarse en un resumen breve; es necesario comprobar antes el comportamiento en dominios académicos o técnicos, no cubiertos por AMI.
- **Fine-tuning posterior como punto de partida**: al ser un LongT5-base ya adaptado a resumen de diálogo, puede servir de inicialización para dominios o idiomas nuevos, siempre respetando las condiciones Apache-2.0 del backbone y MIT del repositorio.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor | Notas |
|---|---|---|---|
| ROUGE-Lsum (media por reunión) | Validación AMI (20 reuniones) | 48,601405 | Medido en el momento de selección del checkpoint (época 4) |
| ROUGE-Lsum | Test AMI (19 reuniones) | No disponible | La model card no publica resultados de test |
| ROUGE-1 / ROUGE-2 | Validación o test | No disponible | No se desglosan en la información proporcionada |
| MMLU, HumanEval, GSM8K u otros | — | No disponible | No aplicables o no publicados para este checkpoint |

No se han publicado resultados de benchmarks adicionales en la información disponible. La única métrica documentada es el ROUGE-Lsum de validación empleado para seleccionar el checkpoint, y la propia model card advierte de que ROUGE mide solapamiento léxico y no establece exactitud factual.

## Requisitos de hardware

- **VRAM estimada para pesos**: aproximadamente 1,0 GB en FP32 (247,5 M de parámetros × 4 bytes), unos 0,5 GB en BF16/FP16 y unos 0,25 GB en INT8. A ello hay que sumar memoria de activaciones, caché de atención y los haces de búsqueda.
- **Cabe en GPU de consumo**: sí, con margen amplio. Una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 pueden alojar varias instancias en paralelo; también es viable en GPUs de 4-8 GB.
- **GPU recomendadas para producción**: NVIDIA T4, L4, A10G o A100 para lotes grandes; el modelo es lo bastante pequeño como para que el cuello de botella sea la decodificación y no la memoria.
- **CPU**: la inferencia en CPU es viable para volúmenes bajos, aunque la decodificación con 4 haces y hasta 512 tokens por reunión incrementa la latencia de forma notable.
- **Opciones de despliegue**: `transformers` con `AutoTokenizer` y `AutoModelForSeq2SeqLM`, fijando la versión 4.57.6 registrada por el experimento. El soporte de arquitecturas encoder-decoder T5 en vLLM y TGI es limitado o experimental y no se ha verificado para este checkpoint; llama.cpp y Ollama no ofrecen soporte estable para T5 encoder-decoder, por lo que no hay ruta GGUF publicada.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, la configuración de evaluación usa 4 haces con penalización de longitud 2,0 y bloqueo de trigramas, lo que multiplica el coste de decodificación respecto a búsqueda greedy.
- **Reproducibilidad**: para replicar resultados hay que usar la rutina de generación completa del cuaderno de publicación (construcción de entrada, manifiestos oracle/noise, asignación por tópicos, concatenación y puntuación a nivel de reunión); cargar los pesos por sí solo no reproduce el pipeline.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus model cards públicas y no se han verificado en esta ficha; se incluyen como referencia de categoría.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (LongT5-base baseline, seed 73) | 247,5 M | 4096 tokens de entrada; 512 de salida | Resumen de diálogo/reunión en inglés (fine-tune AMI) | MIT (repo) + Apache-2.0 (backbone) | HuggingFace, 0 descargas, 1 like |
| `google/long-t5-tglobal-base` | 247,5 M (aprox.) | Hasta 4096 tokens (preentrenamiento TGlobal) | Seq2seq generalista; requiere fine-tuning para resumen | Apache-2.0 | HuggingFace, ampliamente utilizado |
| `google/long-t5-tglobal-large` | ~783 M (aprox.) | Hasta 4096/16384 tokens según configuración | Seq2seq para secuencias largas | Apache-2.0 | HuggingFace |
| `allenai/led-base-16384` | ~162 M (aprox.) | 16384 tokens | Resumen de documentos largos (encoder-decoder con atención eficiente) | Apache-2.0 | HuggingFace |

No se dispone de comparaciones de ROUGE en AMI para estas alternativas en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- **Idioma único**: solo inglés; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- **Dominio muy estrecho**: entrenado y evaluado únicamente con reuniones de escenario de AMI sobre diseño de mandos a distancia; la generalización a otros dominios no está medida.
- **Truncado agresivo**: el diálogo completo se trunca a 4096 tokens, de modo que en reuniones largas se pierde información sin mecanismo de segmentación.
- **ROUGE no es fidelidad**: la métrica reportada mide solapamiento léxico; no garantiza corrección factual y el riesgo de alucinación en resúmenes abstractivos persiste.
- **Comparaciones no concluyentes**: la propia model card advierte de que las diferencias frente a variantes «oracle» incluyen entradas privilegiadas derivadas de la referencia y no aíslan una ventaja arquitectónica; además, un tope de tokens compartido no implica longitudes reales de resumen equivalentes.
- **Licencia compuesta**: el repositorio declara MIT sobre las contribuciones, pero los pesos derivan de un backbone Apache-2.0 y las anotaciones AMI son CC BY 4.0; para uso comercial hay que respetar ambas atribuciones y conservar los ficheros `UPSTREAM_LICENSE.txt` y `UPSTREAM_MODEL_CARD.md`.
- **Checkpoint incompleto para reentrenar**: no incluye estado del optimizador ni del RNG, solo pesos y tokenizador finales.
- **Sin validación externa**: 0 descargas y 1 like; no hay evidencia de uso independiente ni de evaluaciones de terceros.
- **Versión de librería sensible**: el experimento registra Transformers 4.57.6; otras versiones pueden alterar el comportamiento de generación.
- **No apto como sistema de resumen en producción sin evaluación propia**: es un artefacto de investigación con una única métrica de validación publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Immich/pipeline-error-propagation-dialogue-summarization-longt5-baseline-seed73
- DOI del modelo en HuggingFace: https://doi.org/10.57967/hf/11157
- Registro maestro de replicación (Zenodo, todas las versiones): https://doi.org/10.5281/zenodo.21792310
- Modelo base: https://huggingface.co/google/long-t5-tglobal-base
- Corpus AMI: https://groups.inf.ed.ac.uk/ami/corpus/
- Nota: las búsquedas web realizadas devuelven únicamente resultados sobre la aplicación de gestión de fotos Immich, sin relación con este modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales del autor.
