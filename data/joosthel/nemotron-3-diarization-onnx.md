# joosthel/Nemotron-3-Diarization-ONNX

## Resumen

Nemotron-3-Diarization-ONNX es una exportación independiente a formato ONNX del modelo de diarización de hablantes nvidia/Nemotron-3-Diarization, publicada por el usuario joosthel. Su objetivo es ejecutar diarización de hablantes ("quién habló y cuándo") en CPU empleando únicamente numpy, onnxruntime y soundfile, sin necesidad de PyTorch ni de GPU. El repositorio ocupa 0,5 GB e incluye tres grafos ONNX (preprocesador log-mel, modelo fp32 y modelo int8), una implementación en numpy de la caché de hablantes y un script de línea de comandos que genera salida en formato RTTM.

La exportación trabaja en modo offline (grabación completa), con resolución de trama de 10 ms, seguimiento de hasta 8 hablantes concurrentes y ordenación de las etiquetas según la primera aparición de cada hablante. Se trata de una conversión no oficial: no ha sido producida ni avalada por NVIDIA, y mantiene los pesos del modelo base sin reentrenamiento, con cuantización int8 dinámica por canal como opción por defecto.

Su relevancia práctica está en que traslada un modelo de diarización de referencia a un formato portátil, con verificación numérica explícita frente a la implementación original en PyTorch: la exportación fp32 queda a 0,001 puntos de DER de la referencia y la int8 a 0,022 puntos, dentro de un protocolo de evaluación reproducible sobre las 16 reuniones del conjunto AMI `test`. Licencia openmdw-1.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Exportación ONNX del modelo de diarización NVIDIA Nemotron-3-Diarization: preprocesador log-mel + grafo de codificador y cabeza por pasos de 30,4 s + caché de hablantes reimplementada en numpy. Tipo exacto de red subyacente: no disponible |
| Parámetros totales | No disponible en la model card. Aproximadamente 100 M según fuentes externas sobre el modelo base, cifra coherente con el tamaño del grafo fp32 (397,4 MB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Procesa la grabación completa en modo offline mediante pasos de 30,4 s y una caché de hablantes con parámetro `speaker_cache_length` |
| Tipos de cuantización | fp32 (`model.onnx`) e int8 dinámica por canal (`model.int8.onnx`, opción por defecto) |
| Idiomas soportados | No disponible (modelo de diarización, no de reconocimiento de voz; depende del idioma de la señal) |
| Licencia | openmdw-1.1 |
| Formato de pesos | ONNX: `preprocessor_core.onnx` (0,14 MB), `model.onnx` (397,4 MB), `model.int8.onnx` (103,7 MB); más `constants.npz` (0,01 MB) |
| Resolución temporal | 10 ms por trama |
| Hablantes simultáneos | Hasta 8, ordenados por primera aparición |
| Frecuencia de muestreo de entrada | 16 kHz obligatorios (`ValueError` si no coincide) |
| Canales de entrada | Multicanal permitido, se mezcla a mono automáticamente |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La exportación reproduce el pipeline del modelo base en tres grafos ONNX encadenados. Primero, `preprocessor_core.onnx` convierte la forma de onda en un espectrograma log-mel mediante llamadas ventanadas de memoria acotada. Después, `model.onnx` o `model.int8.onnx` ejecuta un paso de 30,4 s del codificador y la cabeza de predicción de hablantes. Finalmente, `diarize.py` implementa en numpy la caché de hablantes del modo streaming, que conserva únicamente los `speaker_cache_length` fotogramas más importantes en cada paso de compresión según una puntuación `top-k`, y produce la salida con resolución de 10 ms. No hay reentrenamiento ni ajuste fino: se trata de los mismos pesos del modelo base, convertidos y cuantizados.

El proceso de conversión, cuantización y verificación está documentado en `scripts/` y sus resultados pormenorizados, con tolerancias y detalle por comprobación, en `docs/RESULTS.md`. Los tres ficheros ONNX han sido limpiados de metadatos de depuración del exportador (trazas con rutas locales de la máquina de compilación) mediante `scripts/strip_metadata.py`, verificado como bit-idéntico en las salidas de onnxruntime. La cuantización int8 es dinámica y por canal. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información consultada.

## Capacidades

- Diarización de hablantes: determina "quién habló cuándo" sobre una grabación completa.
- Seguimiento de hasta 8 hablantes concurrentes, con etiquetas ordenadas por primera aparición en el audio.
- Resolución temporal de 10 ms por trama de decisión.
- Detección de actividad de voz (la etiqueta de pipeline del repositorio es `voice-activity-detection`).
- Puntuación de solapamiento: el protocolo de evaluación declarado puntúa las regiones con habla simultánea.
- Salida en formato RTTM mediante `segments_to_rttm`, con estructura de segmentos `{"Start", "End", "Speaker"}`.
- Ejecución en CPU pura con numpy, onnxruntime y soundfile, sin PyTorch.
- Acepta audio multicanal y lo mezcla a mono de forma automática.
- Ajuste del número de hilos de cómputo (`threads=8` en el ejemplo) y selección explícita del grafo fp32 o int8.
- No realiza reconocimiento de voz, traducción, tool calling ni razonamiento multi-paso: la información disponible no documenta ninguna de esas capacidades.

## Casos de uso

- Etiquetado de hablante en transcripciones de reuniones: se ejecuta la diarización sobre el audio de la reunión y se alinean los segmentos RTTM resultantes con la salida de un motor de ASR, obteniendo actas con atribución por persona. El modelo mantiene 8 hablantes simultáneos y 10 ms de resolución, suficiente para reuniones de trabajo habituales.
- Análisis de llamadas en centros de contacto: separar las intervenciones de agente y cliente en cada grabación para medir tiempos de habla, turnos y solapamientos, útil en control de calidad y analítica operativa.
- Indexación y búsqueda por hablante en archivos de audio: generar un índice de segmentos por hablante sobre un repositorio de grabaciones para permitir consultas del tipo "localiza las intervenciones del hablante 2 en este archivo".
- Investigación en corpus de audio: la evaluación declarada sigue el protocolo de las 16 reuniones AMI `test`, de modo que el modelo es directamente utilizable como línea base reproducible en estudios de diarización.
- Subtitulado y postproducción: asignar etiquetas de hablante a subtítulos ya generados para diferenciar voces en contenido de entrevistas, mesas redondas o pódcast con varios participantes.
- Despliegue en servidores sin GPU o en entornos con restricciones de dependencias: al funcionar solo con numpy y onnxruntime, se puede integrar en contenedores ligeros o en máquinas de CPU donde instalar PyTorch no es viable.
- Preprocesado de pipelines de voz a gran escala: la variante int8 de 103,7 MB reduce el coste de memoria y de ancho de banda frente al grafo fp32 de 397,4 MB, lo que facilita procesar lotes grandes de grabaciones en CPU.
- Cumplimiento y auditoría de grabaciones: obtener un registro temporal de intervenciones por hablante para trazabilidad de conversaciones registradas.

## Benchmarks y rendimiento

Evaluación declarada bajo el protocolo de la model card de NVIDIA: las 16 reuniones del conjunto AMI `test`, Mix-Headset, verdad de referencia por alineación forzada (nttcslab-sp/diar-forced-alignment, CC BY 4.0), collar 0, solapamiento puntuado, umbral 0,5.

| Sistema | DER | Miss | FA | Confusión |
|---|---|---|---|---|
| PyTorch (referencia) | 9,226 % | 4,68 % | 3,67 % | 0,88 % |
| Esta exportación, fp32 | 9,225 % | 4,68 % | 3,67 % | 0,88 % |
| Esta exportación, int8 | 9,248 % | 4,80 % | 3,58 % | 0,87 % |

La model card del modelo base declara 9,25 % de DER bajo este protocolo; la referencia en PyTorch reproducida aquí obtiene 9,226 %, y los grafos fp32 e int8 de esta exportación quedan a 0,02 y 0,03 puntos de esa cifra. Por reunión, la diferencia int8 frente a PyTorch oscila entre -0,14 y +0,28 puntos de DER en las 16 reuniones (peores casos: IS1009b -0,14; IS1009c +0,28).

Criterio de precisión de la cuantización int8, en dos partes: para ficheros dentro de la capacidad de 8 hablantes se exige DER(int8, fp32) ≤ 1,0 % absoluto por fichero (collar ±0,25 s, solapamiento puntuado); para ficheros con más hablantes reales que ranuras de salida del modelo, el int8 debe ser no peor que el fp32 frente a la verdad de referencia, con tolerancia de +0,5 puntos. El criterio se revisó tras observar que, por encima de la capacidad, una única diferencia de redondeo int8 puede alterar qué fotograma conserva un empate exacto en la compresión de la caché de hablantes, tras lo cual fp32 e int8 siguen caminos distintos pero igualmente válidos. Ficheros con 13 hablantes puntuaron 3,70 % y con 14 hablantes 11,97 % bajo la comparación int8 frente a fp32.

Paridad con PyTorch, medida sobre ES2004a (17,5 min) y TS3006d (49,5 min):

| Tipo de comparación | Resultado |
|---|---|
| Teacher-forced (la caché ONNX replica los desempates exactos de PyTorch) | Máx. \|Δ probabilidad\| 1,4e-05 / 1,3e-05; 100,000 % de acuerdo de tramas en el umbral 0,5 |
| Free-running (cada lado resuelve sus propios empates) | DER(esta exportación frente a PyTorch) 0,000 % / 0,035 % |

Los resultados de búsqueda web incluyen también una cifra de 14,72 % de DER atribuida al modelo base por explainx.ai, que no coincide con el 9,25 % de la model card ni con el 9,226 % reproducido aquí; lo más probable es que corresponda a otro protocolo o conjunto de evaluación, pero no se dispone de la información necesaria para confirmarlo.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no se requiere GPU. El ejemplo del autor usa `OnnxDiarizer(threads=8)`.
- Peso del grafo por defecto (int8): 103,7 MB, más 0,14 MB del preprocesador y 0,01 MB de constantes. El grafo fp32 ocupa 397,4 MB.
- Memoria RAM total: no disponible. Solo se documentan los tamaños de los ficheros; hay que añadir el coste de la caché de hablantes y de las activaciones, que no se cuantifica en la información proporcionada.
- GPU recomendadas: no aplica. No se documenta uso de ejecución por GPU ni proveedores de ejecución distintos de CPU.
- Cabe en cualquier equipo de CPU convencional; al no necesitar VRAM, no hay restricción de GPU de consumo. El factor limitante es el tamaño del grafo y la CPU disponible.
- Opciones de despliegue: onnxruntime con numpy y soundfile; interfaz de línea de comandos (`python diarize.py meeting.wav --out meeting.rttm`) o API de Python (`OnnxDiarizer`, `extract_speaker_dict`, `segments_to_rttm`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card describe una comparación de DER sobre reuniones de 17,5 y 49,5 minutos, pero no publica tiempos de ejecución.
- Restricción operativa: la frecuencia de muestreo debe ser exactamente 16 kHz. Con otra frecuencia, `diarize()` lanza `ValueError` en lugar de devolver resultados incorrectos, ya que las constantes de frecuencia de trama posteriores están fijadas a 16 kHz.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño de pesos | Hablantes | Modo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| joosthel/Nemotron-3-Diarization-ONNX (este) | ONNX (fp32 e int8), sin PyTorch | 397,4 MB fp32 / 103,7 MB int8 | Hasta 8 | Offline | openmdw-1.1 | Público; 0 descargas, 0 likes |
| nvidia/Nemotron-3-Diarization (base) | Pesos originales del modelo | No disponible | Hasta 8 | Streaming y offline | No disponible en la información consultada | Público |
| nvidia/Nemotron-3-Diarization-preview | Pesos originales del modelo | No disponible | Hasta 8 | Streaming y offline | No disponible en la información consultada | Público |
| onnx-community/Nemotron-3-Diarization-ONNX | ONNX | No disponible | No disponible | No disponible | No disponible | Público |

La diferencia funcional más relevante frente al modelo base es que esta exportación solo documenta el modo offline (grabación completa), mientras que las versiones de NVIDIA soportan inferencia en streaming y offline. No se dispone de datos de benchmarks para las variantes alternativas, por lo que la comparación de rendimiento entre exportaciones no está disponible.

## Limitaciones y advertencias

- Conversión no oficial: no ha sido producida ni avalada por NVIDIA, tal y como declara el propio autor en la model card.
- Límite de 8 hablantes: en ficheros con más hablantes reales que ranuras de salida, el rendimiento se degrada de forma marcada. Con 13 hablantes la comparación int8-fp32 dio 3,70 % y con 14 hablantes 11,97 %.
- Divergencia int8 más allá de la capacidad: pasados los 8 hablantes, una diferencia de redondeo int8 puede cambiar el desempate en la compresión de la caché, de modo que fp32 e int8 siguen caminos distintos. La comparación directa int8 frente a fp32 deja de ser una prueba válida en ese régimen.
- Solo modo offline: la información disponible no documenta soporte de streaming en esta exportación, a diferencia del modelo base.
- Frecuencia de muestreo fija: es obligatorio remuestrear a 16 kHz antes de llamar al modelo; cualquier otra frecuencia provoca `ValueError`.
- Mezcla forzada a mono: el audio multicanal se convierte a mono, por lo que se pierde la información espacial que pudiera ayudar a separar voces.
- No es un modelo de reconocimiento de voz: no transcribe ni traduce; solo asigna etiquetas de hablante a intervalos temporales.
- Idiomas soportados: no disponibles. Al operar sobre señal acústica, la calidad puede depender de factores como el idioma, el acento, el ruido de fondo o la calidad de la grabación, extremo no cuantificado en la documentación.
- Discrepancia de métricas: la model card y la evaluación de esta exportación dan en torno a 9,2-9,25 % de DER, mientras que una fuente externa (explainx.ai) publica 14,72 % para el modelo base sin detallar el protocolo.
- Licencia openmdw-1.1: antes de un uso comercial es necesario revisar los términos completos en el enlace de licencia, ya que la información proporcionada no detalla condiciones de uso comercial.
- Madurez y validación comunitaria: el repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización son del 24 de septiembre de 2026, con 34 segundos entre ambas, lo que indica que no ha habido revisiones posteriores.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de asignación errónea de hablante o de confusión entre voces en audio con solapamiento alto o condiciones acústicas adversas.
- Sesgos: no hay información disponible sobre sesgos de género, acento, edad o idioma en la documentación consultada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joosthel/Nemotron-3-Diarization-ONNX
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Variante previa de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization-preview
- Exportación ONNX de la comunidad onnx-community: https://huggingface.co/onnx-community/Nemotron-3-Diarization-ONNX
- Repositorio espejo en GitHub: https://github.com/AMAImedia/Nemotron-3-Diarization-preview/blob/main/README.md
- Familia NVIDIA Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Análisis externo del modelo base: https://www.explainx.ai/blog/nvidia-nemotron-3-diarization-open-weight-eight-speakers-2026
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Herramienta de alineación forzada usada como referencia: https://github.com/nttcslab-sp/diar-forced-alignment
