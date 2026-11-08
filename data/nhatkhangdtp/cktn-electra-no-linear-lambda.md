# nhatkhangdtp/CKTN-ELECTRA-no-linear-lambda

## Resumen

CKTN-ELECTRA-no-linear-lambda es un checkpoint de ablación del modelo CKTN-ELECTRA, un encoder multilingüe desarrollado por el grupo de investigación vinculado al paper *Echoes Across Vietnam's Highlands, Delta, and Coast*. Se trata de una variante de ELECTRA construida sobre RemBERT (el modelo de Google basado en BERT con embeddings desacoplados) y adaptada a tres lenguas de bajos recursos del sudeste asiático: cham (cjm), jemer (km) y tay-nung (tyz), además del vietnamita (nut) en el corpus. El modelo se publica exclusivamente para reproducir el estudio de ablación descrito en el paper; el autor recomienda explícitamente usar el modelo completo `nhatkhangdtp/CKTN-ELECTRA` para cualquier uso downstream.

La diferencia respecto al modelo de referencia es puramente de entrenamiento: en lugar de aplicar una programación lineal del peso de la pérdida del discriminador (0 → 50), este checkpoint fija λ = 50 desde la primera actualización. El resto de hiperparámetros se mantienen idénticos: generador de 8 capas con embeddings compartidos, 64 candidatos top en muestreo con temperatura 1.25, banda de similitud [0.15, 0.95], AdamW con learning rate 2e-5, 6 épocas, enmascaramiento del 15 % y longitud de secuencia 512.

El modelo tiene 576.998.912 parámetros (~577 M), se distribuye en safetensors con licencia Apache 2.0 y su pipeline es `feature-extraction` (es un `RemBertModel` puro, sin cabeza de tarea). Resulta relevante como pieza de reproducibilidad científica para quienes estudien técnicas de ELECTRA en lenguas de bajos recursos, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RemBERT (transformer encoder con embeddings desacoplados), preentrenado con esquema ELECTRA |
| Parametros totales | 576.998.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | cjm (cham), km (jemer), tyz (tay-nung), nut (vietnamita) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 2.3 GB |
| Modelo base | ducanhdinh/CKTN-ELECTRA |
| Pipeline | feature-extraction |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un encoder tipo RemBERT, es decir, un transformer con embeddings de entrada y salida desacoplados (mayor dimensionalidad en la capa de embedding que en las capas ocultas), preentrenado con el objetivo ELECTRA: un generador pequeño (8 capas, con embeddings compartidos con el discriminador) propone sustituciones de tokens y el discriminador aprende a detectar cuáles son reemplazos. El checkpoint publicado corresponde únicamente al discriminador, sin cabeza de tarea, en el epoch con mejor F1 de detección de tokens reemplazados en desarrollo (epoch 1, RTD F1 0.937, accuracy 0.984).

El entrenamiento se realizó sobre el corpus multilingüe descrito en el paper, que cubre cham, jemer, tay-nung y vietnamita. Los hiperparámetros documentados son: 64 candidatos top en el muestreo del generador con temperatura 1.25, banda de similitud [0.15, 0.95] para filtrar sustituciones, AdamW con lr 2e-5, 6 épocas, enmascaramiento del 15 % y longitud de secuencia 512. La innovación concreta de esta ablación es la eliminación de la programación lineal del peso λ del discriminador: aquí λ = 50 se aplica desde la primera actualización, mientras que en el modelo completo sube gradualmente de 0 a 50. El modelo base CKTN-ELECTRA, a su vez, parte de `google/rembert` con un vocabulario extendido en 4.213 subtokens inyectados en el modelo SentencePiece Unigram mediante cirugía de Protobuf, seguido de inicialización de embeddings por Fast Vocabulary Transfer (FVT). No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Extracción de características (embeddings contextuales) para texto en cham, jemer, tay-nung y vietnamita.
- Representaciones de tokens y de secuencia aptas para tareas downstream mediante fine-tuning (clasificación, NER, emparejamiento de frases), aunque el checkpoint no incluye cabeza de tarea.
- Modelado de lenguaje enmascarado implícito en el preentrenamiento ELECTRA (detección de tokens reemplazados), no expuesto como generador de texto.
- Soporte multilingüe limitado a las cuatro lenguas del corpus; no se documenta transferencia a otras lenguas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking); es un encoder de extracción de características.
- No dispone de cabecera de generación: no puede usarse como modelo causal para producir texto.

## Casos de uso

- Reproducción del estudio de ablación: cargar el checkpoint con `AutoModel` y evaluar el F1 de detección de tokens reemplazados (RTD) frente al modelo completo para validar la contribución de la programación lineal de λ. Es el uso previsto por el autor.
- Investigación en preentrenamiento ELECTRA para lenguas de bajos recursos: servir de punto de comparación controlado al analizar cómo afecta el peso del discriminador en la convergencia y en la calidad de las representaciones.
- Extracción de embeddings para búsqueda semántica en corpus de cham, jemer o tay-nung: usar las representaciones de secuencia como entrada a un índice vectorial para recuperación de documentos en estas lenguas, previa validación de calidad.
- Etiquetado secuencial (NER, POS) sobre textos jemer o cham: añadir una cabeza lineal sobre el encoder y hacer fine-tuning con un corpus anotado pequeño, aprovechando el vocabulario extendido del modelo base.
- Clasificación de documentos multilingües en entornos de investigación lingüística: agrupar textos por lengua o temática a partir de los embeddings, como paso previo a estudios sociolingüísticos.
- Base para experimentos de transferencia entre lenguas emparentadas: comparar el rendimiento en tay-nung (tyz) frente a vietnamita (nut) para estudiar el solapamiento léxico y subword entre ambas.
- Docencia y formación en NLP de bajos recursos: ejemplo reproducible de pipeline ELECTRA con vocabulario extendido y cirugía de tokenizador, útil en cursos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico reportado es el del checkpoint seleccionado: RTD F1 de 0.937 y accuracy de 0.984 en el conjunto de desarrollo durante el epoch 1. No se ofrecen métricas downstream (XNLI, POS, NER) ni comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~577 M parámetros, en fp32 ocupa aproximadamente 2,3 GB de pesos; en fp16 unos 1,15 GB. Añadiendo activaciones y overhead del runtime, se recomienda al menos 4 GB de VRAM en fp32 y 2-3 GB en fp16 para secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para fine-tuning con batch moderado se recomienda 16-24 GB (RTX 4090, A10, L4) o A100/H100 si se entrena con secuencias largas y batches grandes.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 6 GB o más, incluso en fp32.
- Opciones de despliegue: transformers con PyTorch (vía `AutoModel`), exportación a ONNX, y servidores de inferencia como TGI o vLLM (este último con soporte de embeddings en versiones recientes). No se publican pesos GGUF, por lo que llama.cpp y Ollama no están disponibles de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| CKTN-ELECTRA-no-linear-lambda | 577 M | 512 (entrenamiento) | cjm, km, tyz, nut | Apache 2.0 | Checkpoint de ablación |
| CKTN-ELECTRA (modelo completo) | no disponible (misma familia) | 512 (entrenamiento) | cjm, km, tyz, nut | Apache 2.0 | Modelo recomendado para downstream |
| google/rembert | ~575 M | 512 | 100+ (multilingüe) | Apache 2.0 | Modelo base original |
| XLM-R base | ~278 M | 512 | 100 | MIT | Alternativa multilingüe generalista |

La comparación con RemBERT y XLM-R es pertinente por tamaño y naturaleza de encoder, pero ninguno de los dos cubre específicamente cham, jemer o tay-nung con vocabulario extendido; el valor diferencial de CKTN-ELECTRA reside en la extensión de vocabulario y el corpus específico. No se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de ablación: el autor indica explícitamente que no debe usarse en producción; para uso downstream hay que emplear `nhatkhangdtp/CKTN-ELECTRA`.
- Sin cabeza de tarea: es un `RemBertModel` puro; requiere fine-tuning o extracción de características, no genera texto ni responde a instrucciones.
- Cobertura lingüística muy restringida: solo cham, jemer, tay-nung y vietnamita; el rendimiento fuera de estas lenguas no está documentado y probablemente sea deficiente.
- Riesgo de sesgos: el corpus proviene de fuentes regionales de Vietnam y podría reflejar desequilibrios demográficos o dialectales no analizados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir representaciones poco fiables en dominios alejados del corpus de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin validación downstream, el uso comercial no está respaldado por evaluaciones.
- Longitud de contexto de entrenamiento de 512 tokens: secuencias más largas requerirán truncamiento o estrategias de ventana deslizante.
- Sin versiones cuantizadas ni GGUF: el despliegue en entornos de bajos recursos exige convertir los pesos manualmente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/nhatkhangdtp/CKTN-ELECTRA-no-linear-lambda
- Modelo completo recomendado: https://huggingface.co/nhatkhangdtp/CKTN-ELECTRA
- Modelo base: https://huggingface.co/ducanhdinh/CKTN-ELECTRA
- Paper (arXiv): https://arxiv.org/abs/2607.08362
- Repositorio de código y configuración: https://github.com/TracDucAnh/CKTN-ELECTRA
- Modelo original RemBERT: https://huggingface.co/google/rembert
