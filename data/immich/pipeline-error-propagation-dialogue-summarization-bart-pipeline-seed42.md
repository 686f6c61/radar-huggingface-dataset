# Immich/pipeline-error-propagation-dialogue-summarization-bart-pipeline-seed42

## Resumen

Este repositorio contiene un checkpoint de `facebook/bart-base` afinado para sumarización de diálogo (actas de reunión) dentro de un experimento sobre propagación controlada de errores en pipelines de transformers. Lo publica el usuario de HuggingFace `Immich` como parte del material de replicación del trabajo *Controlled Error Propagation Analysis in Transformer-Based Pipelines for Dialogue Summarization*, con registro maestro en Zenodo (DOI 10.5281/zenodo.21792310) y release fechada el 2026-10-20. No guarda relación con el proyecto de gestión de fotos Immich, pese a la coincidencia de nombre.

El modelo no es un sumarizador autónomo, sino la pieza de generación de un pipeline jerárquico con tres etapas: segmentación temática, extracción de actos de diálogo y generación por tema, seguidas de concatenación cronológica. La variante publicada aquí es la que recibe etiquetas *oracle* (actos de diálogo y `summlinks` derivados de las anotaciones de referencia), es decir, entradas privilegiadas que la línea base no tiene. Por tanto, sus cifras no son comparables en igualdad de condiciones con un sumarizador de un solo paso.

El interés práctico es doble: por un lado, es un BART-base pequeño (139,47 M de parámetros) que cabe en cualquier GPU de consumo; por otro, sirve como artefacto reproducible para estudiar cómo se acumulan los errores a lo largo de un pipeline modular de PLN. El checkpoint fue seleccionado en la época 16 por ROUGE-Lsum medio por reunión de validación (48,844569) sobre el corpus AMI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART-base), 6 capas de encoder y 6 de decoder |
| Parámetros totales | 139.471.450 (139,47 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada (límite registrado en el experimento); tope de generación de 512 tokens por reunión |
| Tipos de cuantización | No se publican versiones cuantizadas en el repositorio; al ser una arquitectura BART estándar es convertible a INT8/INT4/GGUF con herramientas habituales, sin validación por parte del autor |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT para las contribuciones del repositorio; los componentes preentrenados conservan los términos upstream Apache-2.0 según la model card (`UPSTREAM_LICENSE.txt`) |
| Formato de pesos | `safetensors` (librería `transformers`) |
| Modelo base | `facebook/bart-base`, revisión `aadd2ab0ae0c8268c7c9693540e9904811f36177` |
| Dataset de entrenamiento | `ami-corpus` (94 reuniones de entrenamiento, 20 de validación, 19 de test, dominio *scenario*) |
| Semilla de entrenamiento | 42 |
| Tamaño del repositorio | 1,1 GB (incluye logs de entrenamiento y tokenizador) |
| Versión de Transformers registrada | 4.57.6 |

## Arquitectura y entrenamiento

La base es BART-base: un transformer encoder-decoder con 6 capas en cada torre, anchura de 768, 12 cabezas de atención y embeddings posicionales absolutos hasta 1024 posiciones. El preentrenamiento original de BART es un objetivo desnoising (infilling de texto, permutación de frases, borrado de tokens y rotación de documento) sobre texto inglés. Sobre esa base, este checkpoint aplica un ajuste fino supervisado para generación de resúmenes de reunión, con un pipeline que segmenta por tema, extrae actos de diálogo y genera resúmenes tema a tema antes de concatenarlos cronológicamente.

Los hiperparámetros registrados son: tasa de aprendizaje 1e-5, tamaño de lote efectivo 32, 16 épocas, entrenamiento en BF16 con validación y generación en FP32. La selección del checkpoint se hizo por ROUGE-Lsum medio por reunión en validación (48,844569). En validación y test se decodifica con 4 haces, `length_penalty` 2.0 y bloqueo de trigramas, con un tope de 512 tokens a nivel de reunión y asignación de cuota por tema. No se documenta en la información disponible el uso de RLHF, DPO ni una fase de alineación posterior; tampoco se detalla la composición exacta del corpus de preentrenamiento más allá de la referencia al backbone.

La innovación metodológica no está en el modelo sino en el protocolo: la variante *oracle* recibe etiquetas de extracción y `summlinks` derivados de las anotaciones de referencia, entradas que la línea base no puede obtener en inferencia real. El repositorio conserva los pesos finales y el tokenizador, pero no el estado del optimizador ni el estado del generador aleatorio, por lo que no es reanudable para entrenamiento.

## Capacidades

- Generación abstractiva de texto en inglés condicionada a un diálogo de entrada (text2text-generation).
- Sumarización de reuniones y de diálogo multi-turno, con salida limitada a 512 tokens por reunión.
- Generación por temas dentro de un pipeline jerárquico: resumen independiente por segmento temático y concatenación cronológica posterior.
- Consumo de etiquetas auxiliares de estructura (actos de diálogo, `summlinks`) cuando están disponibles, en el modo *oracle* evaluado.
- Decodificación por búsqueda de haces (4 haces), con control de longitud y bloqueo de trigramas.
- No soporta tool calling ni function calling: es un modelo seq2seq puro sin plantilla de herramientas.
- No soporta agentes ni razonamiento multi-paso nativo.
- No dispone de modo *thinking*, visión ni audio.
- Multilingüismo: no. Entrenado y evaluado únicamente en inglés.

## Casos de uso

- **Investigación en propagación de errores en pipelines de PLN**: el checkpoint es el componente de generación de un experimento diseñado para medir cómo los errores de la segmentación y de la extracción de actos de diálogo se amplifican hasta el resumen final. Permite reproducir la condición *oracle* y compararla con la línea base.
- **Actas de reuniones técnicas en inglés**: con la rutina de generación del cuaderno de publicación, se puede generar un resumen de una reunión de hasta 1024 tokens de entrada por llamada, aplicando segmentación previa para reuniones más largas y concatenando los resúmenes parciales.
- **Prototipado rápido de sumarización de diálogo en local**: con 139 M de parámetros y menos de 1 GB de pesos en FP32, se puede levantar un servicio de pruebas en una GPU de consumo o incluso en CPU, sin coste de API.
- **Generación de resúmenes parciales por bloques en sistemas de transcripción**: integrado aguas abajo de un ASR con diarización, el modelo puede resumir cada bloque temático de una transcripción y entregar un acta estructurada por temas.
- **Línea base para ablaciones de arquitectura**: al compartir backbone con `facebook/bart-base`, sirve como punto de comparación controlado al evaluar variantes de segmentación, extracción o estrategias de concatenación.
- **Docencia y experimentación con modelos seq2seq**: su tamaño reducido y su licencia MIT permiten usarlo en cursos y talleres para ilustrar pipelines de sumarización, ajuste fino y evaluación con ROUGE.
- **Generación de resúmenes de reuniones de diseño de producto**: el dominio de evaluación (reuniones AMI sobre diseño de un mando a distancia) está próximo a sesiones de diseño técnico, lo que reduce el desplazamiento de dominio frente a otros corpus.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son los de validación del proceso de selección de checkpoint. No se han publicado resultados de test ni comparaciones con otros modelos en la información proporcionada.

| Métrica | Conjunto | Valor |
|---|---|---|
| ROUGE-Lsum medio por reunión (selección de checkpoint) | Validación AMI (20 reuniones) | 48,844569 |
| ROUGE (test) | Test AMI (19 reuniones) | No disponible en la información proporcionada |
| MMLU / HumanEval / GSM8K | No aplica | Modelo de sumarización, no evaluado en esas tareas |

Advertencia del autor recogida en la model card: ROUGE mide solapamiento léxico y no establece exactitud factual; además, las diferencias entre la condición *oracle* y la línea base incluyen entradas privilegiadas derivadas de las referencias y no aíslan una ventaja arquitectónica del pipeline.

## Requisitos de hardware

- **VRAM estimada para los pesos**: aproximadamente 0,56 GB en FP32 (558 MB), 0,28 GB en BF16/FP16, 0,14 GB en INT8 y 0,07 GB en INT4. A ello se suman activaciones y memoria de decodificación, moderadas por el tamaño del modelo, pero multiplicadas por los 4 haces de búsqueda.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o una T4 sirven sobradamente. Para lotes grandes en evaluación conviene una A100 o H100, aunque el modelo está infrautilizado en ellas.
- **GPU de consumo**: sí, cabe holgadamente. También es viable en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- **Opciones de despliegue**: `transformers` con `AutoModelForSeq2SeqLM` (ruta documentada por el autor), serialización a ONNX vía Optimum, y exportación a GGUF para `llama.cpp` u `Ollama`. Sirvidores tipo vLLM o TGI son posibles al ser una arquitectura BART estándar, pero no hay validación publicada por parte del autor para este checkpoint.
- **Latencia y throughput**: no disponible en la información proporcionada. Cualquier cifra depende de la longitud de entrada, del número de haces y de la cuota por tema del pipeline, que no se documentan en detalle.
- **Requisito de software**: el autor fija Transformers 4.57.6 y recomienda anclar el commit del Hub registrado en el paquete de replicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...bart-pipeline-seed42`) | 139,47 M | 1024 tokens de entrada | Sumarización de diálogo dentro de pipeline con entradas *oracle* | MIT (repo) / Apache-2.0 (upstream) | HuggingFace, 19 descargas |
| `facebook/bart-base` | 139,47 M | 1024 tokens | Sumarización genérica; es el backbone sin ajuste | No verificada en la información disponible | HuggingFace, ampliamente usado |
| `facebook/bart-large-cnn` | ~406 M | 1024 tokens | Sumarización abstractiva de noticias en inglés | No verificada en la información disponible | HuggingFace, muy extendido |
| Modelos de sumarización de diálogo de larga contexto (familia LED y similares) | No disponible con detalle | 16k tokens en variantes LED | Sumarización de documentos largos | No verificada en la información disponible | HuggingFace |

La comparación relevante no es de rendimiento bruto: este checkpoint está evaluado con entradas privilegiadas sobre un único corpus (AMI) y no publica resultados de test. Frente a `facebook/bart-base`, la diferencia es el ajuste fino y el pipeline, no la arquitectura. Frente a `bart-large-cnn`, pierde capacidad (139 M frente a 406 M) y no está entrenado para noticias, pero gana adecuación al dominio de diálogo. No se dispone de comparaciones directas publicadas con sumarizadores de diálogo de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Entradas privilegiadas**: el checkpoint evaluado recibe etiquetas *oracle* de actos de diálogo y `summlinks` derivados de anotaciones de referencia. En producción esas entradas no existen, por lo que el rendimiento real será inferior al reportado y el pipeline no es reproducible sin un extractor automático.
- **Cargar los pesos no reproduce el experimento**: el autor advierte explícitamente que es necesario replicar la rutina de generación completa del cuaderno de publicación (construcción de entrada, manifiestos de ruido, asignación por tema, concatenación y puntuación a nivel de reunión).
- **Idioma**: solo inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- **Dominio estrecho**: entrenado y evaluado con reuniones *scenario* de AMI sobre diseño de un mando a distancia. El rendimiento fuera de ese registro (reuniones espontáneas, otros acentos, jerga técnica distinta) no está medido.
- **Métrica insuficiente**: ROUGE mide solapamiento léxico; no garantiza fidelidad factual. Con 139 M de parámetros el riesgo de alucinación y de omisiones es apreciable en resúmenes largos.
- **Límites de longitud**: 1024 tokens de entrada por llamada y 512 tokens de salida por reunión. Reuniones largas requieren segmentación obligatoria y la concatenación puede introducir incoherencias.
- **Sin estado de entrenamiento**: no se incluyen optimizador ni estado del generador aleatorio, por lo que el ajuste fino no se puede reanudar desde este checkpoint.
- **Restricciones de licencia**: las contribuciones del repositorio son MIT, pero los componentes preentrenados conservan términos upstream Apache-2.0; hay que revisar `UPSTREAM_LICENSE.txt` antes de un uso comercial. Las anotaciones AMI están bajo CC BY 4.0 y exigen atribución al AMI Consortium.
- **Validación externa nula**: 19 descargas y 0 *likes* en el momento de la consulta; no hay evaluaciones independientes publicadas.
- **Confusión de nombre**: los resultados de búsqueda web sobre "Immich" corresponden a la aplicación de gestión de fotos, no a este autor ni a este modelo; no deben citarse como documentación del checkpoint.
- **Fechas del repositorio**: creación 2026-08-04 y actualización 2026-10-20, coherentes con la release declarada; conviene anclar el commit exacto para reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Immich/pipeline-error-propagation-dialogue-summarization-bart-pipeline-seed42
- DOI del modelo en HuggingFace: https://doi.org/10.57967/hf/11145
- Registro maestro de replicación en Zenodo: https://doi.org/10.5281/zenodo.21792310
- Modelo base: https://huggingface.co/facebook/bart-base
- Corpus AMI (atribución CC BY 4.0, AMI Consortium): https://groups.inf.ed.ac.uk/ami/corpus/
- Paper de BART (arquitectura del backbone): no disponible en la información proporcionada
- Repositorio de código del experimento: no disponible en la información proporcionada
- Demo o *space*: no disponible en la información proporcionada

Nota: los resultados de búsqueda web devueltos para "Immich" (immich.app, github.com/immich-app/immich y tutoriales de instalación en NAS) corresponden a un proyecto de gestión de fotos sin relación con este modelo; se han descartado por no ser pertinentes.
