# Immich/pipeline-error-propagation-dialogue-summarization-longt5-pipeline-seed42

## Resumen

El modelo `Immich/pipeline-error-propagation-dialogue-summarization-longt5-pipeline-seed42` es un ajuste fino de `google/long-t5-tglobal-base` (247.545.984 parámetros) para resumen de reuniones y diálogos en inglés, publicado el 20 de octubre de 2026 por el autor de HuggingFace «Immich». No es un modelo de propósito general: es el checkpoint seleccionado (semilla 42) del experimento descrito en el artículo *Controlled Error Propagation Analysis in Transformer-Based Pipelines for Dialogue Summarization*, y está diseñado para funcionar dentro de una arquitectura jerárquica de tres etapas (segmentación temática, extracción de actos de diálogo y generación por tema, con concatenación cronológica posterior).

Su relevancia es fundamentalmente metodológica: sirve para estudiar cómo se propagan los errores a lo largo de un pipeline de NLP y para reproducir un experimento concreto sobre el corpus AMI (reuniones de diseño de un mando a distancia). El checkpoint se entrenó con BF16, ratio de aprendizaje 0,0003, tamaño de lote efectivo 16, límite de entrada de 4096 tokens y época 16 seleccionada por ROUGE-Lsum medio de validación (53,757218). La decodificación de referencia usa 4 haces, penalización de longitud 2,0 y bloqueo de 3-gramas, con un tope de 512 tokens por reunión.

Conviene subrayar que la variante «oracle» del pipeline recibe etiquetas de extracción y *summlinks* derivados de las anotaciones de referencia, entradas privilegiadas de las que carece la línea base; por tanto, las diferencias oracle–baseline no aíslan una ventaja arquitectónica. El repositorio tiene 0 descargas y 0 «likes», y la model card advierte explícitamente de que cargar los pesos no reproduce el pipeline experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LongT5 (transformer encoder-decoder con atención TGlobal sobre `google/long-t5-tglobal-base`) |
| Parametros totales | 247.545.984 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens de entrada (límite de entrenamiento registrado); tope de generación de 512 tokens por reunión |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT para las contribuciones del repositorio; componentes preentrenados bajo Apache-2.0 (incluido como `UPSTREAM_LICENSE.txt`); anotaciones AMI bajo CC BY 4.0 |
| Formato de pesos | safetensors (BF16 en entrenamiento; FP32 en validación y generación) |

Otros metadatos: tamaño del repositorio 1,0 GB, SHA-256 de los pesos `d0b7ac6cd162d5c334be0c822eca607956dc1add67d7d3c40de988692f15e421`, DOI de HuggingFace `10.57967/hf/11159`, registro maestro de replicación `10.5281/zenodo.21792310`, revisión del backbone `aecb1376e5bd78db32ebc5c9deb257449b9e2b21`, etiqueta `endpoints_compatible`.

## Arquitectura y entrenamiento

El backbone es LongT5-base, un transformer encoder-decoder con atención local-global eficiente (TGlobal) pensado para secuencias largas; el ajuste fino mantiene el límite de 4096 tokens de entrada. El modelo no se usa de forma aislada: el pipeline completo realiza segmentación por temas, extracción de actos de diálogo y generación tema a tema, y después concatena las salidas en orden cronológico. En la variante oracle, la extracción se alimenta con etiquetas gold y *summlinks* derivados de las anotaciones de referencia.

El entrenamiento se hizo sobre el corpus AMI (reuniones *scenario* en inglés sobre diseño de un mando a distancia), con 94 reuniones de entrenamiento, 20 de validación y 19 de test. Hiperparámetros registrados: ratio de aprendizaje 0,0003, lote efectivo 16, precisión BF16 en entrenamiento y FP32 en validación/generación, 16 épocas hasta el checkpoint seleccionado, selección por mejor ROUGE-Lsum medio por reunión en validación (53,757218). La decodificación de validación y test usa 4 haces, penalización de longitud 2,0 y bloqueo de 3-gramas. No se documenta en la información disponible el uso de RLHF, DPO ni de optimizaciones de inferencia como decodificación especulativa. El repositorio incluye `training_logs/` con configuración, historial completo, índices de sondeo, estadísticas de tokens, marcador de finalización y resumen del checkpoint, pero no el estado del optimizador ni del RNG para reanudar el entrenamiento.

## Capacidades

- Generación abstractiva de resumen en inglés para transcripciones de reuniones y diálogos multi-participante.
- Resumen jerárquico por temas: el modelo está pensado para recibir segmentos temáticos y producir resúmenes parciales que luego se concatenan.
- Extracción de actos de diálogo como etapa previa (en la variante oracle, a partir de etiquetas gold; en la línea base, con extracción automática).
- Manejo de entradas de hasta 4096 tokens, adecuado para transcripciones de reuniones de duración media.
- No dispone de tool calling, function calling, modo agente, modo «thinking», visión ni audio según la información disponible.
- Multilingüismo: únicamente inglés; no se declaran capacidades en otras lenguas.
- Compatible con el pipeline `summarization` de Transformers y con Inference Endpoints (`endpoints_compatible`).

## Casos de uso

- Actas de reuniones de proyecto: con 4096 tokens de entrada se puede resumir una transcripción de aproximadamente 2.500–3.000 palabras, generando un resumen por tema que se concatena en un acta cronológica de hasta 512 tokens.
- Reproducción del experimento de propagación de errores: cargar el checkpoint con la semilla 42 y ejecutar el cuaderno de publicación permite replicar las métricas de validación y comparar oracle frente a línea base.
- Investigación en resumen de diálogo: sirve como sistema de referencia (baseline ajustado) en estudios sobre segmentación temática y resumen multi-etapa sobre AMI.
- Análisis de robustez frente a errores de ASR: al sustituir la transcripción gold por salidas de reconocimiento de voz se puede medir cuánto degrada el ruido en cada etapa del pipeline.
- Componente de generación por temas en arquitecturas mayores: el modelo puede actuar solo como generador tema a tema, dejando la segmentación y la extracción a otros módulos.
- Evaluación de métricas: útil para estudiar la correlación entre ROUGE-Lsum y calidad factual en resúmenes de reuniones, dado que la model card advierte de que ROUGE solo mide solapamiento léxico.
- Prototipado en local: con 247 millones de parámetros se puede ejecutar en una GPU de consumo o incluso en CPU para pruebas de integración, sin depender de servicios externos.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor |
|---|---|---|
| ROUGE-Lsum (selección de checkpoint, media por reunión) | Validación AMI (20 reuniones) | 53,757218 |
| Resultados en test | Test AMI (19 reuniones) | no disponibles en la información proporcionada |
| MMLU / HumanEval / GSM8K | — | no aplicables (modelo de resumen, no evaluado en estas tareas) |

No se han publicado en la información disponible resultados comparativos de test frente a otros modelos, ni métricas distintas de ROUGE (BERTScore, factualidad, longitud realizada de los resúmenes). La model card advierte de que un tope de tokens compartido no implica longitudes efectivas iguales entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1 GB solo para pesos; en BF16/FP16, unos 0,5 GB.
- Con 4096 tokens de entrada y búsqueda por 4 haces, hay que sumar caché KV y activaciones: estimación orientativa de 2–4 GB de VRAM en total (cálculo a partir de 12 capas y `d_model` 768, no medido por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4070, RTX 4090) es suficiente; A100/H100 no son necesarias salvo para procesar lotes grandes en paralelo.
- Cabe holgadamente en GPU de consumo; también es viable en CPU para inferencia puntual, con latencia mucho mayor (no se publican cifras de latencia ni throughput).
- Opciones de despliegue: Transformers (el autor fija la versión 4.57.6), Inference Endpoints, TGI para modelos seq2seq, exportación con Optimum/ONNX. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían una conversión propia no validada para LongT5.
- Latencia y throughput medidos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LongT5-base ajustado, pipeline AMI) | 247.545.984 | 4096 | Resumen de diálogo multi-etapa con entradas oracle | MIT (repo) / Apache-2.0 (upstream) | Pesos safetensors en HuggingFace, 0 descargas |
| `google/long-t5-tglobal-base` | 247.545.984 | 4096 | Backbone preentrenado, sin ajuste a resumen de reuniones | Apache-2.0 | Público en HuggingFace |
| `allenai/led-base-16384` | ~162 millones | 16384 | Resumen abstractivo de documentos largos (Longformer encoder-decoder) | Apache-2.0 | Público en HuggingFace |
| `google-t5/t5-base` | ~220 millones | 512 | Texto a texto genérico; requiere truncado en transcripciones largas | Apache-2.0 | Público en HuggingFace |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada: el único dato numérico publicado es el ROUGE-Lsum de validación de este checkpoint, obtenido con un pipeline y unas entradas oracle que no son equivalentes a las de los modelos comparados.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado y evaluado solo con reuniones *scenario* de AMI sobre diseño de un mando a distancia; el vocabulario y la estructura conversacional no representan otros dominios.
- Entradas privilegiadas: la variante oracle usa etiquetas gold de extracción y *summlinks* de las anotaciones de referencia; sin esas anotaciones no se reproduce el comportamiento descrito.
- Cargar los pesos no reproduce el pipeline: hace falta la rutina completa de generación del cuaderno de publicación (construcción de entrada, manifiestos oracle/ruido, asignación por tema, concatenación y puntuación a nivel de reunión).
- ROUGE mide solapamiento léxico, no exactitud factual; el riesgo de alucinación en resúmenes abstractivos no está cuantificado en la información disponible.
- Corpus de evaluación pequeño (19 reuniones de test), lo que limita la significación estadística de cualquier comparación.
- Época 16 seleccionada sobre 94 reuniones: posible sobreajuste; no se publican curvas completas en esta ficha, solo el historial en `training_logs/`.
- Límite de 4096 tokens: las reuniones más largas requieren truncado o segmentación externa.
- La reproducibilidad depende de fijar la versión de Transformers (4.57.6), la revisión del backbone y los parámetros exactos de decodificación (4 haces, penalización 2,0, bloqueo de 3-gramas); cualquier cambio altera las salidas.
- Restricciones de licencia: las contribuciones del repo son MIT, pero los componentes preentrenados siguen Apache-2.0 y las anotaciones AMI exigen atribución CC BY 4.0 al AMI Consortium; hay que conservar `UPSTREAM_LICENSE.txt`, `UPSTREAM_MODEL_CARD.md` y la atribución del corpus.
- Sin validación comunitaria: 0 descargas y 0 «likes» en el momento de la consulta; es un artefacto de investigación, no un modelo listo para producción.
- No hay cuantizaciones publicadas ni soporte documentado en llama.cpp/Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Immich/pipeline-error-propagation-dialogue-summarization-longt5-pipeline-seed42
- Backbone preentrenado: https://huggingface.co/google/long-t5-tglobal-base
- DOI del modelo en HuggingFace: https://doi.org/10.57967/hf/11159
- Registro maestro de replicación (Zenodo): https://doi.org/10.5281/zenodo.21792310
- Corpus AMI: https://groups.inf.ed.ac.uk/ami/corpus/
- Corpus AMI en HuggingFace (referenciado como `dataset:ami-corpus`): no se ha encontrado un enlace directo en la información proporcionada
- Artículo *Controlled Error Propagation Analysis in Transformer-Based Pipelines for Dialogue Summarization*: no se ha encontrado un enlace directo en la información proporcionada
- Nota sobre la búsqueda web: los resultados devueltos corresponden al software de gestión de fotos y vídeos autoalojado Immich (immich.app, github.com/immich-app/immich) y no guardan relación con este modelo; no se han encontrado páginas, demos ni repositorios adicionales del modelo.
