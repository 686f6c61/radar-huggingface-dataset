# Immich/pipeline-error-propagation-dialogue-summarization-bart-pipeline-seed73

## Resumen

Este repositorio contiene un checkpoint de ajuste fino de `facebook/bart-base` (139.471.450 parámetros) publicado por el usuario Immich como parte del experimento *Controlled Error Propagation Analysis in Transformer-Based Pipelines for Dialogue Summarization*. No es un modelo de propósito general, sino un artefacto de investigación: un componente de un pipeline jerárquico de resumen de diálogo compuesto por segmentación temática, extracción de actos de diálogo y generación por topic, seguida de concatenación cronológica de los resúmenes parciales.

El modelo se entrena y evalúa sobre reuniones del corpus AMI (dominio "scenario", en inglés, sobre diseño de mandos a distancia), con 94 reuniones de entrenamiento, 20 de validación y 19 de prueba. La semilla de entrenamiento es la 73 y el checkpoint seleccionado corresponde a la época 11, elegido por el mejor ROUGE-Lsum medio por reunión en validación (49,540965). La longitud de entrada está limitada a 1024 tokens y la generación a nivel de reunión a 512 tokens.

Su relevancia es metodológica más que práctica: permite reproducir y auditar un análisis de propagación de errores entre etapas de un pipeline, incluyendo la comparación entre una variante "oráculo" que recibe etiquetas de extracción y *summlinks* derivados de las anotaciones de referencia, y una línea base sin esos datos privilegiados. Cargar los pesos por sí solo no reproduce el experimento: hace falta la rutina de generación completa del cuaderno de publicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo BART (`facebook/bart-base`), con encoder bidireccional y decoder autorregresivo |
| Parametros totales | 139.471.450 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens de entrada (límite declarado por el autor); generación a nivel de reunión limitada a 512 tokens |
| Tipos de cuantizacion | No disponible. El autor no publica variantes cuantizadas; solo pesos en safetensors (entrenamiento en BF16, validación y generación en FP32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT para las contribuciones del repositorio; los componentes preentrenados conservan Apache-2.0 (incluidos como `UPSTREAM_LICENSE.txt` y `UPSTREAM_MODEL_CARD.md`) |
| Formato de pesos | safetensors (repositorio de 1,1 GB, incluye tokenizer y `training_logs/`) |

## Arquitectura y entrenamiento

La base es BART en su variante *base* (revision `aadd2ab0ae0c8268c7c9693540e9904811f36177`), es decir, un transformer encoder-decoder preentrenado con objetivos de denoising. Sobre esa base se realiza un ajuste fino supervisado para resumen abstractivo de diálogo, con learning rate 1e-05, tamaño de lote efectivo 32, precisión BF16 en entrenamiento y FP32 en validación y generación, y 11 épocas hasta el checkpoint seleccionado. La selección se hace por ROUGE-Lsum medio por reunión en el conjunto de validación. La decodificación en validación y prueba usa 4 haces, *length penalty* 2.0 y bloqueo de trigramas.

El elemento diferencial no está en el modelo sino en el pipeline que lo envuelve: segmentación temática, extracción de actos de diálogo y generación por topic, con concatenación cronológica posterior. En la variante evaluada, el oráculo recibe etiquetas *gold* de extracción y *summlinks* derivados de las anotaciones de referencia, entradas privilegiadas de las que carece la línea base. El repositorio incluye `training_logs/` con la configuración, el historial completo, índices de *probe*, estadísticas de tokens y el resumen del checkpoint seleccionado, pero no incluye estado del optimizador ni del RNG, por lo que no es reanudable tal cual.

## Capacidades

- Generación de resumen abstractivo de diálogo en inglés, entrenado específicamente sobre reuniones AMI del dominio *scenario*.
- Resumen por *topic* dentro de un pipeline jerárquico, con concatenación cronológica de resúmenes parciales.
- Extracción de actos de diálogo y segmentación temática como etapas previas (dependen de componentes externos del pipeline, no del checkpoint en sí).
- Generación condicionada a entradas privilegiadas (etiquetas *gold* y *summlinks*) en la configuración de oráculo del experimento.
- Decodificación por búsqueda de haces con bloqueo de n-gramas, configurable (4 haces, *length penalty* 2.0 en la configuración de referencia).
- No soporta *tool calling*, *function calling*, razonamiento multi-paso, visión ni audio: es un modelo seq2seq de resumen, sin capacidades de agente.
- Multilingüismo: no disponible; el autor declara únicamente inglés y el ajuste fino se limita al corpus AMI en inglés.

## Casos de uso

- **Replicación del experimento de propagación de errores**: cargar el checkpoint con la semilla 73 y ejecutar la rutina de generación del cuaderno de publicación para reproducir las cifras de validación y analizar cómo se propaga el error entre segmentación, extracción y generación.
- **Línea base en investigación de resumen de reuniones**: usar el checkpoint como referencia ajustada sobre AMI *scenario* al comparar nuevas arquitecturas jerárquicas, manteniendo el mismo conjunto de 19 reuniones de prueba y las mismas métricas ROUGE.
- **Estudio de sensibilidad al ruido en etapas intermedias**: sustituir las etiquetas *gold* del oráculo por predicciones automáticas con distintos niveles de ruido controlado y medir el impacto en el ROUGE final del pipeline.
- **Evaluación de estrategias de asignación de tokens por topic**: el pipeline reparte un tope de 512 tokens entre topics; este checkpoint permite comparar políticas de reparto y su efecto en la cobertura del resumen.
- **Docencia y laboratorios sobre resumen abstractivo**: el tamaño contenido (139,5 M de parámetros) permite ejecutar el pipeline completo en una GPU de gama media o incluso en CPU, lo que facilita prácticas sobre encoder-decoder, búsqueda de haces y métricas ROUGE.
- **Auditoría de metodología de evaluación**: útil para estudiar por qué las diferencias oráculo-menos-línea base no aíslan una ventaja arquitectónica, y para documentar buenas prácticas en la publicación de checkpoints de investigación.
- **Prototipado interno de actas de reuniones técnicas**: con reservas, se puede probar el resumen de reuniones de diseño de producto en inglés, siempre que se validen manualmente las salidas y se asuma el dominio limitado del corpus.

## Benchmarks y rendimiento

El autor solo publica la métrica de selección de checkpoint. No hay resultados de prueba ni comparaciones con otros modelos en la información disponible.

| Benchmark | Conjunto | Metrica | Resultado |
|---|---|---|---|
| ROUGE-Lsum medio por reunion | Validacion AMI (20 reuniones) | ROUGE-Lsum | 49,540965 (epoca 11, checkpoint seleccionado) |

No se han publicado resultados de benchmarks en la informacion disponible para el conjunto de prueba, ni cifras de MMLU, HumanEval, GSM8K u otras tareas estandar, que además quedan fuera del alcance de un modelo de resumen.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 558 MB en FP32 y 279 MB en BF16/FP16. Con entradas de 1024 tokens y búsqueda de haces de 4, una estimación razonable es de 2 a 4 GB de VRAM con lotes pequeños; el autor no publica mediciones de memoria.
- GPU recomendadas: cualquier GPU con 6 GB o más. Una RTX 3060, RTX 4060, RTX 4090 o una A100 lo ejecutan con holgura; también es viable en GPU integradas y en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en algunas integradas, dado el tamaño del modelo.
- Opciones de despliegue: `transformers` 4.57.6 con `AutoModelForSeq2SeqLM` es la vía soportada y registrada por el experimento. La exportación a ONNX con Optimum requeriría conversión propia. El soporte de encoder-decoder en vLLM y TGI es limitado y no está documentado para este checkpoint. No se publican artefactos GGUF, por lo que llama.cpp u Ollama exigirían una conversión propia no validada por el autor.
- Latencia y throughput: no disponible. No se han publicado mediciones, y el tiempo real depende sobre todo de las llamadas por topic del pipeline, no de una única pasada del modelo.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento entre este checkpoint y otras alternativas. La tabla recoge solo características estructurales de modelos de la misma familia y tamaño, sin datos de rendimiento comparables.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (BART-base, pipeline, seed 73) | 139,5 M | 1024 | Resumen de diálogo AMI con pipeline jerárquico y entradas de oráculo | MIT (componentes Apache-2.0) | Artefacto de investigación; requiere la rutina completa del pipeline |
| `facebook/bart-base` | ~139 M | 1024 | Seq2seq general preentrenado | Apache-2.0 | Backbone sin ajuste; no especializado en diálogo |
| `google/flan-t5-base` | 248 M | 512 | Seq2seq ajustado con instrucciones | Apache-2.0 | Mayor tamaño y contexto menor; no específico de reuniones |
| `allenai/led-base-16384` | 162 M | 16384 | Resumen de documentos largos con atención eficiente | Apache-2.0 | Pensado para entradas largas, no para diálogo multipartícipe |

## Limitaciones y advertencias

- **Entradas privilegiadas**: las diferencias entre la variante oráculo y la línea base incluyen información derivada de las anotaciones de referencia, por lo que no aíslan una ventaja arquitectónica del pipeline. Cualquier comparación debe presentarse con esa salvedad.
- **Dominio muy restringido**: evaluación sobre reuniones AMI *scenario* en inglés acerca del diseño de mandos a distancia. El comportamiento fuera de ese dominio no está caracterizado.
- **Conjunto de prueba pequeño**: 19 reuniones de prueba y 20 de validación; la varianza de las métricas es alta y no se publican intervalos de confianza ni pruebas de significación.
- **ROUGE no mide veracidad**: la métrica empleada evalúa solapamiento léxico, no exactitud factual. Un ROUGE-Lsum de 49,54 en validación no implica resúmenes correctos.
- **Longitudes no equiparables**: un tope de tokens compartido no garantiza longitudes reales de resumen iguales entre modelos o enfoques.
- **Idioma**: solo inglés. No hay soporte declarado de castellano ni de otros idiomas.
- **Reproducibilidad parcial**: no se incluyen estado del optimizador ni del RNG, así que el entrenamiento no se puede reanudar exactamente. La reproducción exige fijar la revisión del Hub y usar `transformers` 4.57.6.
- **Dependencia del pipeline**: cargar los pesos no reproduce el experimento; hace falta la construcción de entrada, los manifiestos de oráculo y ruido, la asignación por topic, la concatenación y el cálculo de métricas a nivel de reunión.
- **Licencia**: el repositorio mantiene metadatos MIT de la release anterior, pero los componentes preentrenados conservan Apache-2.0 y las anotaciones AMI su atribución CC BY 4.0. Conviene revisar `UPSTREAM_LICENSE.txt` antes de un uso comercial.
- **Adopción marginal**: 9 descargas y 0 *likes* en el momento de la ficha; no hay evidencia de uso en producción ni comunidad de mantenimiento.
- **No apto como resumidor general**: no debe desplegarse como servicio de resumen sin validación previa en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Immich/pipeline-error-propagation-dialogue-summarization-bart-pipeline-seed73
- DOI del modelo: https://doi.org/10.57967/hf/11146
- Registro maestro de replicación (Zenodo): https://doi.org/10.5281/zenodo.21792310
- Modelo base: https://huggingface.co/facebook/bart-base
- Corpus AMI: https://groups.inf.ed.ac.uk/ami/corpus/
- Nota: los resultados de la búsqueda web proporcionados corresponden a Immich, la aplicación autoalojada de gestión de fotos y vídeos (https://immich.app/, https://github.com/immich-app/immich), y no guardan relación con este checkpoint ni aportan información adicional sobre él.
