# palli23/wav2vec2-base-samromur2105-10h

## Resumen

wav2vec2-base-samromur2105-10h es un checkpoint de reconocimiento automático del habla (ASR) publicado por el usuario palli23 en Hugging Face, especializado en islandés (código de idioma `is`). Forma parte del conjunto de checkpoints `samromur-21.05`, asociado al trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" presentado en ICASSP 2026, cuyo objetivo es estudiar hasta qué punto modelos pequeños y monolingües pueden competir con modelos multilingües de gran tamaño en una lengua con pocos recursos como el islandés.

El modelo se construye sobre la arquitectura wav2vec 2.0 en su variante "base", con 94.403.241 parámetros (unos 94,4 millones) y un repositorio de 0,4 GB en formato safetensors. El sufijo "10h" del nombre sugiere que el ajuste fino se realizó con unas 10 horas de audio, aunque la model card no confirma este extremo ni detalla la composición del conjunto de entrenamiento.

Su relevancia actual es doble: por un lado, ofrece un punto de partida ligero y desplegable en hardware modesto para transcripción de islandés; por otro, sirve como pieza experimental para estudiar el escalado de datos en ASR de bajos recursos. La model card es mínima: no incluye métricas, instrucciones de uso ni detalles de hiperparámetros, por lo que muchas especificaciones quedan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 base (encoder convolucional de características + encoder transformer, con cabeza de clasificación CTC para ASR) |
| Parámetros totales | 94.403.241 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No se mide en tokens: la entrada es la onda de audio y la longitud práctica depende de la memoria disponible. Los modelos wav2vec 2.0 procesan el audio con un salto de trama de aproximadamente 20 ms |
| Tipos de cuantización | No disponible. No se documentan versiones cuantizadas (GGUF, INT8, etc.) |
| Idiomas soportados | Islandés (`is`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,4 GB |
| Dataset de entrenamiento | No disponible en la model card. El nombre del checkpoint y la referencia al conjunto `samromur-21.05` apuntan al corpus Samrómur (islandés) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-15 |
| Fecha de actualización | 2026-09-15 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La arquitectura wav2vec 2.0 combina un encoder convolucional que convierte la onda de audio en representaciones latentes (con un salto de trama de unos 20 ms) con un encoder transformer que las contextualiza. En la fase auto-supervisada, el modelo se entrena enmascarando posiciones de las representaciones latentes y resolviendo una tarea contrastiva contra representaciones cuantizadas, lo que permite aprender de audio sin transcripciones. En la fase de ajuste fino para ASR, se añade una cabeza lineal y se optimiza la pérdida CTC sobre audio y transcripción alineados a nivel de carácter o subpalabra.

La model card de este checkpoint solo indica que pertenece al conjunto de checkpoints de escalado `samromur-21.05` del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). No se especifica el número total de tokens de audio, la composición exacta del dataset, la receta de ajuste fino, si se aplicó algún tipo de decodificación con modelo de lenguaje, ni si hubo etapas de RLHF/DPO (poco habituales en ASR). Tampoco se documenta si el punto de partida es `facebook/wav2vec2-base` u otro checkpoint en inglés o multilingüe. El único indicio sobre el volumen de datos es el sufijo "10h" del nombre, que sugiere 10 horas de audio etiquetado, dato no confirmado.

## Capacidades

- Reconocimiento automático del habla en islandés: transcripción de audio a texto mediante decodificación CTC (greedy o con beam search).
- Extracción de representaciones acústicas: el encoder puede usarse para obtener embeddings de audio reutilizables en tareas posteriores (clasificación, diarización, segmentación).
- Punto de partida para ajuste fino: al ser un modelo de ~94 M de parámetros, es viable reentrenarlo o adaptarlo a dominios concretos con pocos recursos de cómputo.
- Uso en experimentos de escalado de datos: el checkpoint forma parte de una familia pensada para comparar curvas de rendimiento frente a la cantidad de horas de entrenamiento.
- Funcionamiento en CPU: el tamaño reducido permite inferencia sin GPU, aunque no se documenta latencia.
- No soporta generación de texto, razonamiento, código ni matemáticas: es un modelo encoder-only orientado a ASR.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico. Estas capacidades no aplican a la arquitectura.
- No se documentan capacidades multilingües: el único idioma declarado es el islandés.
- No se documenta modo "thinking", salida con puntuación, mayúsculas, marcas de tiempo ni detección de idioma.

## Casos de uso

- Transcripción de audio en islandés: el uso directo es convertir grabaciones (entrevistas, notas de voz, podcasts) a texto en islandés mediante la pipeline de ASR de Transformers, aprovechando que el modelo está ajustado específicamente a ese idioma.
- Generación de subtítulos: al ser un modelo ligero (~94 M de parámetros), puede ejecutarse en local o en un contenedor pequeño para producir subtítulos automáticos de vídeo en islandés, con revisión humana posterior dado que no se documenta salida con marcas de tiempo.
- Investigación en ASR de bajos recursos: el checkpoint es una pieza del conjunto `samromur-21.05`, por lo que sirve como baseline reproducible en experimentos que comparen modelos pequeños monolingües con modelos multilingües grandes (Whisper, MMS) para el islandés.
- Adaptación a dominios específicos: al partir de un modelo base de tamaño contenido, equipos con presupuesto limitado pueden ajustarlo con unas pocas horas de audio propio (por ejemplo, terminología legal o médica en islandés) sin necesidad de GPUs de gama alta.
- Indexación y búsqueda de archivos audiovisuales: transcribir un archivo de audio con este modelo permite construir índices de texto buscables sobre contenido hablado en islandés, útil para archivos de medios públicos o bibliotecas digitales.
- Extracción de características para tareas derivadas: las representaciones del encoder pueden alimentar clasificadores de acento, emoción o calidad de audio, o sistemas de verificación de hablante, entrenando cabezas específicas sobre el modelo congelado.
- Prototipado en dispositivos con recursos limitados: su tamaño permite desplegarlo en portátiles o servidores pequeños para pruebas de concepto de asistentes de voz en islandés, aunque para producción habría que validar la precisión con datos propios.
- Evaluación comparativa de decodificadores: al estar entrenado con CTC, permite medir el impacto de distintos esquemas de decodificación (greedy, beam search, con modelo de lenguaje) en un idioma con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de error de palabras (WER), tasa de error de caracteres (CER) ni comparaciones numéricas con otros sistemas, y los resultados de la búsqueda web no aportan datos sobre este checkpoint.

| Benchmark | Resultado | Notas |
|---|---|---|
| WER / CER en Samrómur u otros corpus islandeses | No disponible | No publicado en la model card |
| Comparación con modelos multilingües | No disponible | El checkpoint se enmarca en el trabajo de escalado de ICASSP 2026, pero no se han proporcionado cifras |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión fp32 (unos 378 MB solo de pesos, más activaciones) y alrededor de 190 MB en fp16. Con batching grande, la memoria necesaria depende de la longitud de los audios, que en wav2vec 2.0 escala con el número de tramas de 20 ms.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria, incluidas GTX 1650, RTX 3060, RTX 4090, T4, L4, A10G, A100 y H100. En la práctica, el modelo no aprovecha la capacidad de GPUs de gama alta salvo en inferencia por lotes de gran volumen.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida. También es viable la inferencia en CPU.
- Opciones de despliegue: pipeline de ASR de Hugging Face Transformers (con torchaudio o librosa para la carga de audio), Hugging Face Inference Endpoints, TorchScript y exportación a ONNX Runtime. La conversión a CTranslate2 o sherpa-onnx es técnicamente posible para motores de ASR en producción, pero no está documentada por el autor.
- No aplican vLLM, TGI, llama.cpp ni Ollama: son motores orientados a modelos generativos causales y no soportan encoders CTC como wav2vec 2.0 para ASR.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo real factor (RTF) ni de muestras por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur2105-10h | 94,4 M | Islandés | No especificado; salto de trama de ~20 ms | cc-by-sa-4.0 | No disponible | Hugging Face, safetensors |
| facebook/wav2vec2-base | ~95 M | Inglés (ajustado en LibriSpeech 960h en la versión 960h) | No especificado; salto de trama de ~20 ms | No verificado en esta ficha | No comparable directamente (otro idioma y corpus) | Hugging Face |
| openai/whisper-small | 244 M | Multilingüe (99 idiomas, incluye islandés) | Ventana de 30 s por segmento | No verificado en esta ficha | No disponible en esta ficha | Hugging Face |
| facebook/mms-1b-all | ~1.000 M | Más de 1.100 idiomas, incluye islandés | Dependiente de la adaptación por idioma | No verificado en esta ficha | No disponible en esta ficha | Hugging Face |
| Otros checkpoints del conjunto samromur-21.05 | No disponible | Islandés | No disponible | cc-by-sa-4.0 (según este checkpoint) | No disponible | Hugging Face (mismo autor) |

La comparación cuantitativa de rendimiento no es posible con la información disponible: no se han publicado WER ni CER para este checkpoint ni se han localizado resultados del trabajo de ICASSP 2026 en la búsqueda web realizada.

## Limitaciones y advertencias

- Ausencia de evaluación publicada: no hay métricas de WER/CER en la model card, por lo que no se puede afirmar su precisión relativa frente a otros sistemas sin evaluarla en un conjunto de test propio.
- Cobertura lingüística restringida: solo islandés (`is`). Introducir audio en otro idioma producirá transcripciones sin sentido.
- Volumen de datos limitado: el sufijo "10h" sugiere un ajuste fino con pocas horas de audio, lo que suele implicar menor robustez ante acentos, ruido de fondo, solapamiento de hablantes o habla espontánea frente al habla leída de corpus como Samrómur. Este dato no está confirmado por el autor.
- Sesgos de dominio y de hablantes: al desconocerse la composición del corpus de entrenamiento (edad, género, procedencia geográfica de los hablantes), no se puede descartar un sesgo hacia determinados perfiles de voz.
- Errores de transcripción: en un modelo CTC sin modelo de lenguaje externo, son esperables errores en nombres propios, números, siglas y palabras poco frecuentes. No debe usarse sin revisión en contextos legales, médicos o administrativos.
- Formato de salida: los modelos wav2vec 2.0 ajustados con CTC no generan puntuación, mayúsculas ni marcas de tiempo de forma nativa; haría falta un post-procesado (por ejemplo, puntuación con un modelo aparte) o alineación forzada con herramientas de segmentación.
- Licencia cc-by-sa-4.0: permite uso comercial, pero impone compartir las obras derivadas bajo la misma licencia (cláusula share-alike) y exige atribución. Esto puede ser incompatible con productos propietarios o con modelos derivados que se quieran cerrar. Conviene revisar la licencia del corpus Samrómur y de los datos de audio usados.
- Protección de datos: el tratamiento de audio con voces humanas exige cumplir el RGPD y las condiciones de consentimiento del corpus de origen, especialmente si se transcriben conversaciones reales.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Metadatos incompletos: la model card no declara pipeline, hiperparámetros, ni instrucciones de uso, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palli23/wav2vec2-base-samromur2105-10h
- Referencia citada en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), conjunto de checkpoints `samromur-21.05`. No se dispone de URL del paper en la información proporcionada.
- Corpus Samrómur (islandés): no se proporciona enlace en la model card ni en los resultados de búsqueda.
- Resultados de la búsqueda web: las consultas realizadas no devolvieron ninguna página relevante sobre este modelo, su paper ni el corpus; los resultados obtenidos eran foros y páginas de contenido no relacionado, por lo que no se incluyen como enlaces.
