# Immich/pipeline-error-propagation-dialogue-summarization-bart-pipeline-seed17

## Resumen

Este modelo es un checkpoint de `facebook/bart-base` ajustado para resumen de diálogos (reuniones) y publicado como artefacto de replicación del experimento *Controlled Error Propagation Analysis in Transformer-Based Pipelines for Dialogue Summarization*. No es un modelo de propósito general: es la semilla 17 de una familia de checkpoints entrenados para medir cómo se propagan los errores a lo largo de una cadena de procesamiento (segmentación temática, extracción de actos de diálogo y generación por temas) en lugar de generar el resumen de forma monolítica.

El desarrollador es Immich, que aquí actúa como autor del paquete de investigación, no como el proyecto de gestión de fotos del mismo nombre que aparece en los resultados de búsqueda web; esos resultados no guardan relación con este modelo. El checkpoint se entrenó sobre 94 reuniones de escenario del corpus AMI en inglés, con 20 de validación y 19 de test, y se seleccionó por ROUGE-Lsum medio por reunión en validación (49,636374) en la época 13.

Su relevancia es metodológica: permite reproducir y auditar un análisis de propagación de errores con entradas privilegiadas (etiquetas de extracción y *summlinks* de referencia). Los pesos por sí solos no reproducen el pipeline experimental, y el propio autor advierte que las diferencias frente a la línea base incluyen información derivada de las anotaciones de referencia, por lo que no aíslan una ventaja arquitectónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART), backbone `facebook/bart-base` revisión `aadd2ab0ae0c8268c7c9693540e9904811f36177` |
| Parametros totales | 139.471.450 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada; generación limitada a 512 tokens por reunión, con reparto por temas en el pipeline |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors en BF16/FP32; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT para las contribuciones del repositorio; los componentes preentrenados conservan Apache-2.0 (ver `UPSTREAM_LICENSE.txt`); anotaciones AMI bajo CC BY 4.0 |
| Formato de pesos | safetensors (repositorio de 1,1 GB, incluye tokenizer y `training_logs/`) |

Otros datos de configuración registrados: semilla de entrenamiento 17, tasa de aprendizaje 1e-5, tamaño de lote efectivo 32, época seleccionada 13, entrenamiento en BF16 con validación y generación en FP32, decodificación con 4 haces, *length penalty* 2.0 y bloqueo de trigramas. SHA-256 de los pesos: `3f4daf24d8a24fb705c381f0b68d4b8a209a5b658b39c8e9578ae13f7a8860f2`.

## Arquitectura y entrenamiento

El modelo parte de BART-base, un transformer encoder-decoder con atención completa bidireccional en el codificador y autorregresiva en el decodificador, y se ajusta de forma supervisada para generar resúmenes de reunión. En este experimento el modelo no consume la transcripción completa de forma directa: se integra en un pipeline jerárquico de tres etapas (segmentación por temas, extracción de actos de diálogo y generación tema a tema) cuyas salidas se concatenan cronológicamente. La variante aquí publicada corresponde al pipeline con "oráculo", es decir, recibe etiquetas de extracción y *summlinks* derivados de las anotaciones de referencia, entradas privilegiadas de las que carece la línea base.

Los datos de entrenamiento son 94 reuniones de escenario del corpus AMI (dominio de diseño de mandos a distancia) en inglés, con 20 reuniones de validación y 19 de test. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset más allá de AMI, ni si hubo etapas de RLHF o DPO; el ajuste descrito es supervisado con selección de checkpoint por ROUGE-Lsum. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal: la única particularidad es el pipeline con entradas privilegiadas y la política de decodificación con 4 haces, penalización de longitud 2.0 y bloqueo de trigramas.

## Capacidades

- Generación abstractiva de resúmenes de diálogo en inglés, con foco en reuniones y en el corpus AMI (reuniones de escenario sobre diseño de mandos a distancia).
- Resumen condicionado a estructura: puede generar por segmentos temáticos y concatenar las salidas en orden cronológico cuando se le proporcionan las segmentaciones y etiquetas de extracción adecuadas.
- Extracción implícita de actos de diálogo a través de las etiquetas de entrada del pipeline (no es un clasificador autónomo de actos de diálogo).
- Funcionamiento como componente de un sistema mayor: su salida se agrega y se puntúa a nivel de reunión, no de turno.
- No soporta *tool calling*, ni function calling, ni razonamiento agéntico multi-paso, ni modo *thinking*.
- No tiene capacidades de visión, audio ni multimodalidad; el modelo es exclusivamente texto.
- Multilingüismo: no disponible; solo se declara inglés, y el ajuste se limita a un único dominio de reuniones.
- No se documentan capacidades de código, matemáticas ni instrucciones generales fuera del dominio de resumen.

## Casos de uso

- Replicación de experimentos de propagación de errores: cargar el checkpoint con la semilla 17 y el pipeline completo (construcción de entrada, manifiestos de oráculo y ruido, asignación por temas, concatenación y puntuación a nivel de reunión) para reproducir las cifras publicadas.
- Estudio de degradación en cascada: usar este checkpoint como eslabón de generación y sustituir progresivamente las entradas de oráculo por salidas de modelos automáticos, midiendo la caída de ROUGE-Lsum atribuible a cada etapa.
- Línea base de resumen de reuniones: comparar arquitecturas monolíticas frente a pipelines jerárquicos sobre el mismo subconjunto de 19 reuniones de test de AMI, manteniendo el mismo tope de 512 tokens.
- Docencia e investigación en NLP: ejemplo reproducible y de tamaño reducido (139 M de parámetros) para ilustrar fuga de información privilegiada, diferencias oráculo-línea base y el efecto del tope compartido de tokens en la longitud real de los resúmenes.
- Desarrollo de arneses de evaluación: emplear el checkpoint como caso de prueba para validar métricas ROUGE-Lsum a nivel de reunión, control de semillas y registro de procedencia (DOI, revisión del backbone, SHA-256 de pesos).
- Despliegue en hardware modesto con fines de docencia o pruebas internas: al caber en GPUs de consumo e incluso en CPU, sirve para validar infraestructura de inferencia antes de escalar a modelos mayores.
- Auditoría de licencias y atribución: el repositorio incluye `UPSTREAM_LICENSE.txt` y `UPSTREAM_MODEL_CARD.md`, lo que permite revisar la cadena de licencias (MIT del repositorio, Apache-2.0 del backbone, CC BY 4.0 de AMI) en un entorno corporativo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| ROUGE-Lsum (validación, media por reunión) | 49,636374 | Medido en la época 13, criterio de selección del checkpoint |
| ROUGE-Lsum (test) | no disponible | La información proporcionada no incluye el resultado de test de este checkpoint |
| MMLU, HumanEval, GSM8K u otros benchmarks generales | no disponible | No se han publicado en la información disponible |
| Comparación con otros checkpoints de la misma familia (otras semillas) | no disponible | Solo se publica la semilla 17 en esta ficha |

No se han publicado resultados de benchmarks adicionales en la información disponible. El autor advierte explícitamente que ROUGE mide solapamiento léxico y no establece exactitud factual, y que las diferencias oráculo-línea base incluyen entradas privilegiadas derivadas de anotaciones de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,56 GB solo de pesos en FP32 y 0,28 GB en BF16; con caché KV para 1024 tokens de entrada y 512 de salida en cuatro haces, el consumo realista se mantiene por debajo de 2 GB, aunque no se publican mediciones.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente; una RTX 3060, RTX 4090, A100 o H100 quedan sobredimensionadas para este modelo y solo se justifican para procesar lotes grandes o para integrarlo en un pipeline con otros componentes.
- Cabe en GPU de consumo: sí, en tarjetas de gama baja como GTX 1650, RTX 3050 o superiores; también es viable la inferencia en CPU, aunque sin datos de latencia publicados.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (versión recomendada 4.57.6, la registrada por el experimento); exportación a ONNX u otros runtimes no está documentada. El soporte en vLLM o TGI no se ha verificado para este checkpoint.
- Latencia y throughput: no disponibles. La configuración de decodificación (4 haces, penalización 2.0, bloqueo de trigramas, hasta 512 tokens por reunión) implica un coste de generación aproximadamente cuatro veces superior al de una decodificación voraz equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (BART-base pipeline, semilla 17) | 139,5 M | 1024 tokens de entrada, 512 de salida por reunión | MIT (repo) + Apache-2.0 (backbone) | HuggingFace, 10 descargas, 0 likes | Requiere el pipeline y las entradas de oráculo para reproducir resultados |
| `facebook/bart-base` | 139,5 M (aprox.) | 1024 tokens | Apache-2.0 | HuggingFace | Backbone sin ajustar; no está especializado en resumen de diálogo |
| `philschmid/bart-large-cnn-samsum` | aproximadamente 400 M | 1024 tokens | Apache-2.0 | HuggingFace | BART-large ajustado para resumen de conversaciones; tamaño muy superior |
| `google/flan-t5-base` | aproximadamente 250 M | 512 tokens | Apache-2.0 | HuggingFace | Modelo instruido de propósito general; no específico de reuniones |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la información proporcionada, por lo que la comparación se limita a arquitectura, tamaño, contexto y licencia. Las cifras de parámetros de los modelos alternativos son aproximadas y no proceden de la documentación de este repositorio.

## Limitaciones y advertencias

- Artefacto de investigación, no un producto: el propio autor indica que cargar los pesos no reproduce el pipeline; se necesita el cuaderno de generación completo (construcción de entrada, manifiestos de oráculo y ruido, asignación por temas, concatenación y puntuación por reunión).
- Fuga de información privilegiada: la variante evaluada recibe etiquetas de extracción y *summlinks* derivados de anotaciones de referencia, entradas no disponibles en un despliegue real. Las cifras de ROUGE no son comparables con un sistema que opere sin oráculo.
- Dominio y idioma muy restringidos: únicamente inglés y reuniones de escenario de AMI sobre diseño de mandos a distancia; el comportamiento fuera de ese dominio no está documentado.
- ROUGE no equivale a corrección factual: el autor advierte que mide solapamiento léxico; no se han publicado evaluaciones de fidelidad, alucinación o consistencia.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, de género o de dominio en la información disponible.
- Riesgo de alucinación: inherente a un modelo generativo abstractivo de 139 M de parámetros ajustado sobre 94 reuniones; no cuantificado en la documentación.
- Un solo checkpoint y una sola semilla: no se publican intervalos de confianza ni variabilidad entre semillas en esta ficha, lo que limita las conclusiones sobre robustez.
- Tope de tokens compartido: el autor señala que un límite común no implica longitudes reales de resumen iguales entre modelos o enfoques, un sesgo relevante al comparar.
- Licencia: el repositorio es MIT, pero el backbone conserva Apache-2.0 y las anotaciones AMI requieren atribución CC BY 4.0 al AMI Consortium; hay que revisar `UPSTREAM_LICENSE.txt` antes de un uso comercial.
- Estado del repositorio: 10 descargas y 0 likes, sin señales de mantenimiento ni soporte; la fecha de actualización es de 2026, con posibles dependencias fijadas a versiones concretas de Transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Immich/pipeline-error-propagation-dialogue-summarization-bart-pipeline-seed17
- DOI del modelo: https://doi.org/10.57967/hf/11144
- Registro maestro de replicación (Zenodo, todas las versiones): https://doi.org/10.5281/zenodo.21792310
- Backbone preentrenado: https://huggingface.co/facebook/bart-base
- Corpus AMI: https://groups.inf.ed.ac.uk/ami/corpus/
- Papelera de referencia del corpus AMI (sin enlace directo en la información disponible): no disponible
- Repositorio de código del experimento: no disponible
- Demos o espacios asociados: no disponible
