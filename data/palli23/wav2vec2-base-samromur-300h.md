# palli23/wav2vec2-base-samromur-300h

## Resumen

wav2vec2-base-samromur-300h es un modelo de reconocimiento automático del habla (ASR) para islandés, publicado por el usuario palli23 en HuggingFace. Se trata de un ajuste fino de wav2vec2-base (94.402.472 parámetros, medidos sobre los pesos safetensors del repositorio) sobre un subconjunto anidado de 300 horas del corpus samromur-500h. El modelo forma parte de un conjunto de checkpoints de escalado asociados al artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027).

Su relevancia práctica está en el planteamiento de "modelo pequeño, idioma concreto": con 94 millones de parámetros ocupa del orden de 378 MB en fp32 y puede ejecutarse en CPU o en GPUs de gama de entrada, algo poco habitual en ASR multilingüe de altas prestaciones, que suele requerir modelos de cientos de millones o miles de millones de parámetros. Está pensado como punto de partida para pipelines de transcripción en islandés y como referencia en estudios de escalado de datos de entrenamiento.

La información publicada es deliberadamente mínima: la model card se limita a una cabecera de licencia, el idioma y una frase de descripción, y remite al artículo para metodología y resultados de WER/CER. No se documentan ni hiperparámetros de ajuste fino, ni vocabulario del tokenizador, ni límites de duración de audio, ni resultados numéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (encoder convolucional de características + encoder transformer, cabecera de clasificación para ASR) |
| Parametros totales | 94.402.472 (94,4 M) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible. La arquitectura procesa audio mono a 16 kHz con tramas de 20 ms (factor de submuestreo 320); la model card no documenta límite de duración de entrada |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | islandés (código `is`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Autor | palli23 |
| Tarea | reconocimiento automático del habla (ASR) |
| Dataset de ajuste fino | subconjunto anidado de 300 h de Miljón/samromur-500h |
| Descargas / likes | 14 / 0 |
| Tamaño del repositorio | 8,8 GB |
| Fechas | creado el 2026-06-08, actualizado el 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2-base: un encoder convolucional de siete capas que convierte la señal de audio (16 kHz, mono) en una secuencia de representaciones con paso de 20 ms, seguido de un transformer de 12 capas, dimensión oculta 768 y 12 cabezas de atención (configuración estándar de la familia base, coherente con los 94,4 M de parámetros observados). Sobre esa representación se añade una cabecera de clasificación por fotogramas, típicamente entrenada con pérdida CTC en los ajustes finos de ASR de esta familia. El vocabulario concreto del tokenizador CTC del modelo no está documentado en la información disponible.

El entrenamiento consiste en un ajuste fino supervisado sobre un subconjunto anidado de 300 horas del corpus samromur-500h, es decir, un recorte del conjunto de escalado mayor que da nombre al checkpoint. No se especifican en la información disponible el número de tokens o épocas, la composición exacta del subconjunto, la estrategia de muestreo, el uso de aumentación de datos, ni si hubo etapas de RLHF o DPO (poco habituales en ASR, donde el objetivo suele ser CTC o seq2seq con entropía cruzada). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Transcripción de voz a texto en islandés: es la función principal del modelo, derivada de su ajuste fino sobre corpus islandés.
- Reconocimiento de habla continua (no solo palabras aisladas), dado el planteamiento de ajuste sobre 300 h de audio.
- Extracción de representaciones acústicas: el encoder wav2vec2 puede reutilizarse como extractor de características para tareas posteriores (clasificación de audio, diarización, detección de palabras clave), aunque esto no está documentado ni validado en la model card y requeriría verificación empírica.
- Punto de partida para ajuste fino adicional en dominios específicos del islandés con presupuestos de cómputo reducidos.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; es un modelo acústico, no un modelo generativo de propósito general.
- No se documenta capacidad multilingüe: el campo `language` de la model card indica únicamente islandés (`is`).
- No se documentan capacidades de visión, audio generativo, modo de razonamiento explícito ni procesamiento de texto.

## Casos de uso

- Transcripción de archivos de audio y vídeo en islandés: el modelo convierte locuciones en texto para subtitulado, archivado o indexación de contenido. Su tamaño de 94 M permite procesar lotes grandes en hardware modesto.
- Pre-anotación de corpus lingüísticos: generar transcripciones automáticas que después se corrigen manualmente, reduciendo el coste de anotación frente a transcribir desde cero. El propio contexto del proyecto (subconjunto de samromur-500h) apunta a flujos de trabajo de este tipo.
- Atención al cliente y análisis de llamadas: transcripción de conversaciones telefónicas en islandés para búsqueda, control de calidad o extracción de motivos de contacto. Requiere añadir segmentación por actividad de voz y diarización, ya que el modelo no las incluye.
- Investigación lingüística y fonética: obtener transcripciones alineadas con audio para estudiar variación dialectal, pronunciación o fenómenos prosódicos sobre corpus de habla espontánea.
- Despliegue on-premise con requisitos de privacidad: al caber en CPU y en GPUs de gama de entrada, permite transcribir audio sensible sin enviarlo a servicios en la nube, lo que facilita el cumplimiento de normativas de protección de datos.
- Componente ASR dentro de asistentes de voz para islandés: transcripción de la consulta del usuario como primer paso de un pipeline que después use un modelo de lenguaje para la respuesta. El modelo aporta solo la parte de reconocimiento.
- Ajuste fino específico de dominio: usar este checkpoint como inicialización para adaptarlo a vocabulario técnico (sanitario, legal, industrial) con pocas decenas de horas de audio etiquetado.
- Experimentación en investigación sobre escalado de datos: al ser un checkpoint de un estudio de escalado, sirve como punto de comparación reproducible para estudiar la relación entre horas de entrenamiento y WER en idiomas de recursos medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explícitamente al artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027) para consultar los resultados de WER y CER, pero no reproduce ninguna cifra, y la búsqueda web realizada no devolvió el artículo ni datos numéricos asociados.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 378 MB en fp32, 189 MB en fp16 y 94 MB en int8 (cálculo a partir de los 94,4 M de parámetros; no son cifras publicadas por el autor).
- VRAM estimada para inferencia: del orden de 0,5-1 GB en fp16 incluyendo activaciones y runtime para lotes pequeños; menos de 400 MB en CPU con fp32.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM. Funciona en GTX 1650, RTX 3050/3060, RTX 4090, y también en A100/H100, aunque estas últimas están sobredimensionadas para 94 M de parámetros y solo tienen sentido para lotes muy grandes o para servir muchos modelos en paralelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años, y también en GPUs integradas con memoria compartida suficiente. La inferencia en CPU es viable para uso por lotes no interactivo.
- Opciones de despliegue: la model card no documenta ninguna. Por la arquitectura, las vías habituales son la clase `Wav2Vec2ForCTC` y el pipeline de ASR de `transformers`, exportación a ONNX Runtime o TorchScript, y runtimes específicos de ASR como sherpa-onnx (requiere exportación manual no documentada en el repositorio). vLLM y TGI no ofrecen soporte maduro de decodificación ASR para esta familia.
- Latencia y throughput: no disponible. No se han publicado mediciones de factor de tiempo real ni de throughput por GPU.

## Comparativa con modelos similares

Los datos de rendimiento de la comparativa no están disponibles para ninguno de los modelos listados: la información proporcionada no incluye WER, CER ni métricas equivalentes. Las licencias de los modelos alternativos figuran como no verificadas porque no proceden de la información suministrada.

| Modelo | Parametros | Idiomas | Entrada de audio | Licencia | Rendimiento ASR |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur-300h | 94,4 M | islandés | no documentada (arquitectura a 16 kHz, tramas de 20 ms) | cc-by-sa-4.0 | no disponible |
| facebook/wav2vec2-base | 94,4 M | inglés (preentrenado, sin cabecera ASR útil sin ajuste) | mismas limitaciones de arquitectura | no verificada en esta búsqueda | no disponible |
| openai/whisper-small | 244 M | multilingüe (incluye islandés) | ventana de 30 s con segmentación | no verificada en esta búsqueda | no disponible |
| openai/whisper-large-v3 | 1.550 M | multilingüe (incluye islandés) | ventana de 30 s con segmentación | no verificada en esta búsqueda | no disponible |

La comparación conceptual es clara: frente a Whisper, este modelo ofrece menor tamaño, menor coste de inferencia y especialización monolingüe, a cambio de no incluir puntuación, mayúsculas ni marcas de tiempo de forma nativa y de no tener resultados publicados que permitan situarlo frente a alternativas multilingües.

## Limitaciones y advertencias

- Ausencia total de resultados publicados: no hay WER ni CER en la model card, y el artículo referenciado no se ha localizado. No es posible estimar la calidad real del modelo sin evaluarlo.
- Validación comunitaria prácticamente nula: 14 descargas y 0 likes en el momento de redactar esta ficha. No hay informes de terceros sobre su comportamiento.
- Model card mínima: no se documentan hiperparámetros, vocabulario del tokenizador, estrategia de decodificación, formato de entrada esperado ni ejemplos de uso. Esto complica la reproducción y la integración directa en pipelines.
- Tamaño del repositorio desproporcionado: 8,8 GB para 94,4 M de parámetros es mucho más de lo que ocupan los pesos en fp32 (unos 378 MB), lo que sugiere la presencia de estados de optimizador, múltiples checkpoints o ficheros auxiliares. No está documentado.
- Sesgos potenciales: el ajuste se hace sobre un subconjunto de samromur-500h, un corpus de habla recogido con voluntarios. Es esperable una cobertura desigual de acentos, edades, géneros y condiciones de grabación, con degradación en audio telefónico, ruidoso o con micrófonos de baja calidad. No hay análisis de sesgos publicado.
- Riesgo de error en la transcripción: como todo sistema ASR, puede producir sustituciones plausibles, especialmente con nombres propios, topónimos, léxico técnico y números. En dominios regulados no debería usarse sin revisión humana.
- Cobertura de idioma única: islandés. La entrada en otro idioma producirá salidas sin sentido o forzadas al inventario fonético islandés.
- Limitaciones de duración de audio: la model card no especifica cuánto audio admite por pasada. En arquitecturas wav2vec2 el rendimiento se degrada con entradas muy largas, por lo que es prudente segmentar antes de inferir, aunque el umbral no esté documentado.
- Licencia cc-by-sa-4.0: permite uso comercial, pero exige atribución y obliga a distribuir las obras derivadas bajo la misma licencia (share-alike). Es una licencia pensada para contenido, no para software, por lo que su aplicación a pesos de modelos y a modelos derivados puede ser jurídicamente ambigua en entornos corporativos. Conviene revisión legal antes de integrarlo en un producto propietario.
- Fechas poco habituales: el modelo figura como creado en 2026-06-08 y actualizado en 2026-09-17, y el artículo asociado es de ICASSP 2027, lo que dificulta verificar el estado de publicación del trabajo.
- Sin garantías de mantenimiento: el repositorio no incluye información sobre soporte, versionado ni actualizaciones futuras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/wav2vec2-base-samromur-300h
- Dataset referenciado en la model card: Miljón/samromur-500h (enlace no verificado en la búsqueda; no se ha podido confirmar la URL exacta)
- Artículo referenciado: "Scaling Smaller ASR Models Against Multilingual ASR Giants", ICASSP 2027 (no localizado; la búsqueda web no devolvió resultados relevantes)
- Resultados de búsqueda web: no disponibles. Las consultas realizadas devolvieron únicamente páginas genéricas de buscadores, mapas y un portal de vehículos de segunda mano, sin relación alguna con el modelo.
