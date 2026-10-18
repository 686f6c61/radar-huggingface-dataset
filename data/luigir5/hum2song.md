# luigir5/hum2song

## Resumen

hum2song es un codificador de contorno melódico (melody-contour encoder) diseñado para la tarea de *query by humming*: recuperar una canción a partir de tarareo, silbido o canto con letra incorrecta o inventada. Lo desarrolla Luigi Rivolta (usuario `luigir5` en HuggingFace) y se presenta junto al artículo "Whistle and Wrong Lyrics: Synthetic Queries Are Not Enough for Real-World Query-by-Melody" (arXiv, cs.SD, 2026). El problema que aborda es concreto: los sistemas de recuperación musical convencionales dependen de letra, timbre o metadatos, mientras que aquí la única señal de entrada es la melodía cantada o silbada por un usuario real.

Técnicamente es un modelo pequeño y muy especializado: una torre única de unos 5,2 millones de parámetros que proyecta una pista de tono (F0) normalizada por tonalidad a un vector de 256 dimensiones con norma L2. La comparación entre consulta y melodía vocal de una canción se hace por similitud coseno. La arquitectura combina un front-end convolucional que reduce la tasa de frames a la mitad con un transformer pre-norm de 6 capas (d=256, 4 cabezas) y un *masked attention pool*. La entrada se muestrea a frames de 20 ms y la longitud de secuencia es variable, por lo que no existe una ventana de contexto en el sentido habitual de los LLM.

Su relevancia ahora es metodológica: el autor documenta que tres generaciones de datos sintéticos (silbidos generados por modelos físicos, por un modelo musical neuronal comercial y por canto neuronal open source con un modelo de error humano DDSP) mejoraron la recuperación sobre consultas sintéticas pero nunca superaron al modelo base sobre silbidos reales. Es un resultado negativo explícito sobre el uso de datos sintéticos en este dominio, con un benchmark de silbidos reales de MLEnd.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front-end convolucional (reduce la tasa de frames a la mitad) + transformer pre-norm de 6 capas (d=256, 4 cabezas) + masked attention pool; una sola torre para consultas y canciones |
| Parametros totales | ~5,2 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: secuencia de frames de 20 ms de longitud variable, sin ventana fija documentada |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas; pesos en fp32 por defecto) |
| Idiomas soportados | No disponible (el modelo no procesa texto ni letra; la entrada es exclusivamente F0) |
| Licencia | CC BY 4.0 (pesos); el codigo se rige por los terminos del repositorio de GitHub |
| Formato de pesos | `safetensors` y `.pt` (checkpoint PyTorch con `model` state_dict, `config` y `step`, sin estado del optimizador) |
| Entrada | Pista de tono normalizada por tonalidad (F0 en Hz) + flag de voicing, a 20 ms por frame |
| Salida | Un vector L2-normalizado de 256 dimensiones |
| Libreria / pipeline | PyTorch, `feature-extraction` |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La entrada es una pista de tono (F0) normalizada por tonalidad acompañada de un flag de voicing, con frames de 20 ms. Un front-end convolucional reduce la tasa de frames a la mitad; a continuación, un transformer pre-norm de 6 capas con dimensión 256 y 4 cabezas procesa la secuencia, y un *masked attention pool* colapsa la secuencia temporal en un único vector de 256 dimensiones que se normaliza en L2. El modelo usa una sola torre tanto para consultas como para canciones, de modo que la comparación se reduce a un producto escalar (similitud coseno). La letra y el timbre nunca llegan al modelo: no hay entrada de audio crudo ni de texto.

El entrenamiento tiene dos fases para el modelo principal, **E2b**: primero un InfoNCE simétrico sobre pares hum-to-MIDI de HumTrans, y después un ajuste fino con la pérdida CLEWS (Serrà et al.) sobre ventanas cover-to-original de CHAD. El contorno F0 de las consultas se extrae con RMVPE; para silbidos se emplea un rastreador de picos espectrales. Existe además un ajuste fino *closed-set* de E2b sobre silbidos reales de MLEnd: InfoNCE con enmascaramiento de misma canción sobre pares whistle-to-hum y hum-to-hum de los 136 intérpretes de entrenamiento, 300 pasos con LR 3e-5 y selección de checkpoint por intérpretes de validación. Los intérpretes de train, validación y test son disjuntos, pero las tres particiones usan las mismas 8 canciones de MLEnd. La procedencia de datos es HumTrans (tarareos con etiquetas MIDI), CHAD (fragmentos de covers y originales) y MLEnd Hums and Whistles (tarareos y silbidos de 8 canciones); no se distribuye audio ni dataset en el repositorio.

## Capacidades

- Extracción de embeddings de melodía: convierte una pista de F0 en un vector de 256 dimensiones comparable por similitud coseno.
- Recuperación por tarareo (query by humming) sobre un catálogo de melodías vocales preindexadas.
- Recuperación por silbido, incluyendo silbidos de usuarios amateur del corpus MLEnd.
- Canto con letra incorrecta o sin sentido: el modelo ignora la letra por diseño, solo usa el contorno melódico.
- Normalización por tonalidad, de modo que la consulta se compara correctamente aunque se cante en otra tonalidad.
- Manejo de secuencias de longitud variable con enmascaramiento en el pooling (consultas de distinta duración que las canciones).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio crudo ni generación de texto: es un extractor de características, no un modelo generativo.
- Multilingüismo: no aplica, no procesa texto.

## Casos de uso

- **Recuperación musical por tarareo en una aplicación de consumo**: el usuario tararea un fragmento, se extrae su contorno F0 con RMVPE, se embebe con `query_contour` y se busca por similitud coseno contra un índice de melodías vocales. Es exactamente el flujo para el que se entrenó E2b.
- **Búsqueda por silbido en catálogos con melodía vocal clara**: el ajuste fino *closed-set* sobre MLEnd alcanza top-1 de 0,673 y top-3 de 0,820 sobre 339 silbidos reales, útil como referencia de techo en un conjunto cerrado de 8 canciones conocidas.
- **Identificación de canciones en un contexto de karaoke o *humming* social**: el modelo permite indexar la línea vocal de un catálogo y resolver consultas cantadas sin necesidad de letra ni metadatos editoriales.
- **Etiquetado y enlazado de archivos de audio amateur**: procesar grabaciones de usuarios que cantan con letra inventada y asignarlas a la obra original correspondiente mediante la melodía, ignorando el texto cantado.
- **Evaluación de sistemas de extracción de F0**: sirve como banco de pruebas agnóstico al rastreador de pitch, ya que el autor compara RMVPE (voz) con un rastreador de picos espectrales (silbido) sobre el mismo encoder.
- **Investigación en recuperación de información musical (MIR)**: línea base reproducible y de muy bajo coste computacional (5,2 M de parámetros) para experimentos de query-by-melody sobre HumTrans, MIR-QBSH o MLEnd.
- **Deduplicación y alineado de versiones**: detectar covers o versiones alternativas de una misma melodía comparando embeddings de sus líneas vocales, ya que el modelo es invariante al timbre y a la letra.

## Benchmarks y rendimiento

Resultados publicados en el artículo, sobre intérpretes de test de MLEnd: 339 silbidos reales de 26 intérpretes, consulta silbido-a-tarareo sobre las 8 canciones (azar top-1 = 0,125). Los intervalos de confianza al 95 % son bootstrap sobre clips.

| Modelo | Top-1 | Top-3 |
|---|---|---|
| E2b (zero-shot) | 0,631 [0,581; 0,681] (214/339) | 0,770 |
| Whistle closed-set fine-tune | 0,673 [0,622; 0,723] (228/339) | 0,820 |

Los intervalos bootstrap por intérprete son mucho más anchos: E2b [0,500; 0,753] y el ajuste fino [0,536; 0,801]. El ajuste fino es *closed-set* sobre canciones conocidas y no constituye una afirmación sobre canciones nuevas.

Resultados de E2b sobre tarareos:

| Benchmark | Top-1 | Top-10 | Detalle |
|---|---|---|---|
| HumTrans (test) | 0,996 | 1,000 | Pares hum-to-MIDI |
| MIR-QBSH | 0,949 | 0,990 | 4.431 consultas, 48 canciones MIDI |

Comparación con datos sintéticos (del apartado de limitaciones del artículo): la mejor ejecución con silbidos sintéticos open source alcanzó 0,619 de top-1 frente a 0,631 de E2b, con diferencia pareada de -0,012 e IC 95 % [-0,038; +0,015], es decir, sin mejora significativa.

## Requisitos de hardware

- VRAM estimada: ~21 MB en fp32 (5,2 M de parámetros) y ~10,4 MB en fp16. Cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: ninguna en particular; el modelo corre en CPU sin problema. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para la inferencia, que es un único *forward pass* sobre una secuencia corta de frames.
- Cabe en GPU consumer: sí, en todas, incluidas GPUs integradas y placas tipo Raspberry Pi para la parte del encoder (la extracción de F0 con RMVPE puede ser el cuello de botella real).
- Opciones de despliegue: el autor solo documenta PyTorch con `load_checkpoint` del paquete `training/` del repositorio y `hf_hub_download` para los pesos. No se documentan exportaciones a vLLM, llama.cpp, Ollama, TGI ni ONNX, y no hay variantes GGUF publicadas.
- Latencia y throughput: no disponibles en la información proporcionada. A modo de referencia estructural, el coste dominante en un pipeline real será la extracción de F0 (RMVPE o rastreador espectral), no el encoder.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, incluyendo los dos checkpoints (E2b y el ajuste fino *closed-set*) en `.safetensors` y `.pt`.

## Comparativa con modelos similares

No se han publicado en la información disponible resultados de modelos externos comparables sobre el mismo benchmark (silbidos reales de MLEnd con 8 canciones). El artículo menciona los corpus y métodos auxiliares (HumTrans, CHAD, MLEnd, RMVPE, pérdida CLEWS de Serrà et al.), pero no ofrece cifras de sistemas alternativos de query-by-melody. La única comparación cuantitativa disponible es interna, entre las dos variantes publicadas:

| Variante | Parametros | Entrenamiento | Top-1 (silbidos reales) | Top-3 | Uso previsto |
|---|---|---|---|---|---|
| E2b | ~5,2 M | InfoNCE en HumTrans + CLEWS en CHAD | 0,631 | 0,770 | Recuperación abierta sobre canciones nuevas |
| Whistle closed-set fine-tune | ~5,2 M | E2b + InfoNCE sobre MLEnd (136 intérpretes) | 0,673 | 0,820 | Solo las 8 canciones de MLEnd |

Ambas variantes comparten arquitectura, licencia CC BY 4.0 y formato de pesos; la diferencia es el ajuste fino y, por tanto, el dominio de aplicación.

## Limitaciones y advertencias

- **Los datos sintéticos no transfirieron**: tres generaciones de silbidos y canto con letra incorrecta generados sintéticamente mejoraron la recuperación sobre consultas sintéticas pero nunca superaron a E2b sobre silbidos reales. El mejor intento open source quedó en 0,619 de top-1 (diferencia pareada -0,012, IC 95 % [-0,038; +0,015]). El autor lo atribuye a la falta de consultas reales.
- **Benchmark muy pequeño**: solo 8 canciones y cantantes amateur, con una única semilla por ejecución. Los intervalos de confianza bootstrap por intérprete son anchos (hasta ±0,13 en top-1).
- **El ajuste fino de silbidos está sobreajustado a MLEnd**: es *closed-set* sobre las 8 canciones conocidas. Para recuperación abierta hay que usar E2b; usar el fine-tune como si generalizara a canciones nuevas sería un error.
- **Solo melodía**: no puede usar letra ni timbre. Canciones sin una línea vocal melódica clara (instrumentales, rap hablado, voces muy procesadas) son casos difíciles por diseño.
- **Dependencia del rastreador de F0**: la calidad del embedding está acotada por la extracción de pitch (RMVPE para voz, rastreador de picos espectrales para silbido). Errores de octava o de voicing se propagan directamente.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de falso positivo en la recuperación cuando el catálogo contiene melodías muy similares; la salida es una similitud, no una probabilidad calibrada.
- **Sesgos**: el entrenamiento usa HumTrans, CHAD y MLEnd, con cantantes amateur y un repertorio reducido; el rendimiento fuera de esa distribución (otras culturas musicales, escalas no occidentales, registros extremos) no está evaluado.
- **Licencia**: pesos bajo CC BY 4.0, que permite uso comercial con atribución; el código se rige por los términos del repositorio de GitHub, que hay que revisar por separado. Los datasets de entrenamiento (HumTrans, CHAD, MLEnd) tienen sus propias condiciones y no se redistribuyen aquí.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-10-18); no hay historial de uso en producción ni resultados de terceros que lo validen.
- **Enlace al artículo pendiente**: la model card indica que el enlace de arXiv se añadirá cuando el preprint se anuncie, por lo que la referencia bibliográfica aún no es verificable en línea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luigir5/hum2song
- Código y paquete de entrenamiento: https://github.com/luiginotmario/hum2song
- Artículo: "Whistle and Wrong Lyrics: Synthetic Queries Are Not Enough for Real-World Query-by-Melody", Luigi Rivolta, 2026, arXiv cs.SD (enlace arXiv no disponible todavía según la model card)
- Citación BibTeX (incluida en la model card): `@misc{rivolta2026whistle, title = {Whistle and Wrong Lyrics: Synthetic Queries Are Not Enough for Real-World Query-by-Melody}, author = {Rivolta, Luigi}, year = {2026}, note = {arXiv preprint, cs.SD}}`
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre guías de videojuegos), por lo que no se han encontrado enlaces adicionales relevantes.
