# palli23/wav2vec2-base-samromur2105-100h

## Resumen

`palli23/wav2vec2-base-samromur2105-100h` es un modelo de reconocimiento automático del habla (ASR) para islandés, publicado en Hugging Face por el usuario palli23. Es un ajuste fino de la arquitectura wav2vec2-base sobre audio en islandés y forma parte del conjunto de checkpoints denominado `samromur-21.05`, asociado al trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), según indica su model card. El sufijo "100h" del identificador apunta a un entrenamiento con 100 horas de audio, aunque ese dato no se detalla explícitamente en la documentación disponible.

El modelo tiene 94.403.241 parámetros (unos 94,4 millones) en formato safetensors y ocupa 0,4 GB en el repositorio. Su relevancia radica en la línea de investigación del paper: comprobar si modelos ASR pequeños y entrenados específicamente para un idioma pueden competir con modelos multilingües mucho mayores, algo especialmente útil para lenguas con pocos recursos como el islandés.

Se publica bajo licencia CC BY-SA 4.0, con 0 descargas y 0 "likes" en el momento de la consulta, y sin resultados de benchmarks publicados en la información disponible. La model card es mínima: se limita a indicar la licencia, el idioma y la pertenencia al conjunto de checkpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (codificador transformer con extractor convolucional de características y cabeza CTC para ASR) |
| Parámetros totales | 94.403.241 |
| Longitud de contexto | no disponible (modelo acústico: la entrada es audio a 16 kHz, no una ventana de contexto de tokens; la longitud práctica del segmento no se documenta) |
| Tipos de cuantización | no disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | islandés (código ISO `is`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a wav2vec2-base, un modelo acústico auto-supervisado que combina un extractor de características convolucional sobre la forma de onda y un codificador transformer, con una cabeza de clasificación CTC para producir directamente secuencias de caracteres o subpalabras a partir del audio. No se trata de un modelo generativo de texto ni de un modelo multimodal: su única salida es la transcripción del audio de entrada.

El entrenamiento se realizó, según el identificador y la model card, sobre el corpus islandés Samrómur en su versión 21.05, con 100 horas de audio (dato derivado del nombre del checkpoint, no confirmado explícitamente en el texto disponible). No se documentan en la información proporcionada el número total de pasos, la composición exacta del conjunto de entrenamiento, ni si hubo etapas de ajuste adicionales. La innovación técnica asociada al modelo es de escala experimental: forma parte de una comparativa sistemática entre modelos ASR pequeños específicos de idioma y modelos multilingües de mayor tamaño, presentada en ICASSP 2026.

## Capacidades

- Reconocimiento automático del habla en islandés: transcripción de audio a texto.
- Funcionamiento como modelo CTC puro, sin capacidad de generación libre de texto, traducción ni diálogo.
- Procesamiento de audio muestreado a 16 kHz, propio de la familia wav2vec2.
- Punto de partida para ajuste fino (fine-tuning) con datos propios en islandés.
- Uso como componente acústico dentro de pipelines ASR más completos, por ejemplo combinado con un modelo de lenguaje para reestimación de hipótesis.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de "pensamiento".
- No se documentan capacidades de visión, audio-vision ni procesamiento de habla multilingüe más allá del islandés.

## Casos de uso

- Transcripción de corpus de audio en islandés: el modelo puede convertir grabaciones a texto para construir o ampliar corpus destinados a entrenar modelos de lenguaje en islandés, un idioma con recursos limitados.
- Subtitulado de contenido audiovisual: integrado en un pipeline de ASR con alineación temporal y post-procesado de puntuación, sirve para generar subtítulos de vídeos o programas en islandés.
- Analítica de conversaciones en centros de atención telefónica: transcripción de llamadas en islandés para extraer métricas, clasificar motivos de contacto o generar resúmenes con un modelo de lenguaje posterior.
- Dictado y documentación clínica o administrativa: asistencia a profesionales que trabajan en islandés para redactar informes por voz, siempre con revisión humana dado el riesgo de error de transcripción.
- Indexación y búsqueda de archivos de audio: transcripción de podcasts, emisiones de radio pública o archivos históricos para hacerlos localizables por texto.
- Investigación sobre escalado de datos ASR: al ser uno de los checkpoints del conjunto `samromur-21.05`, sirve para reproducir o ampliar los experimentos de escalado del paper de ICASSP 2026 comparando 100 horas frente a otros regímenes de datos.
- Herramientas de aprendizaje de islandés: transcripción de la pronunciación del estudiante para compararla con una referencia y detectar errores fonéticos.
- Base para ajuste fino específico de dominio (por ejemplo, terminología legal o médica en islandés), aprovechando su tamaño reducido para iterar con recursos de cómputo modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 378 MB; en fp16, unos 189 MB; en int8, unos 95 MB. Con activaciones y buffers de atención, el consumo práctico se mantiene por debajo de 1-2 GB en fp32 para segmentos de audio cortos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no requiere A100, H100 ni GPU de centro de datos. Una RTX 3060, RTX 4090 o incluso una GPU integrada moderna puede ejecutar la inferencia sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales, y también en CPU. El tamaño del repo (0,4 GB) permite su ejecución en dispositivos con recursos limitados.
- Opciones de despliegue: Hugging Face Transformers (pipeline de reconocimiento automático del habla), torchaudio, exportación a ONNX con Optimum y ejecución con ONNX Runtime, Hugging Face Inference Endpoints o un contenedor propio. No se documenta soporte en vLLM (orientado a modelos generativos) ni en llama.cpp; existe soporte de wav2vec2 en el ecosistema ggml/whisper.cpp, pero no está confirmado para este checkpoint concreto.
- Latencia y throughput estimados: no disponible. No se publican medidas de RTF (factor de tiempo real) ni de rendimiento por lote.

## Comparativa con modelos similares

La información disponible no permite una comparación cuantitativa fiable, ya que no se publican métricas de este checkpoint ni de sus alternativas directas. La tabla recoge lo que sí está documentado.

| Modelo | Parámetros | Idioma | Datos de entrenamiento | Licencia | Contexto |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur2105-100h | 94.403.241 | Islandés | Samrómur 21.05, 100 h (según identificador) | CC BY-SA 4.0 | No disponible |
| Otros checkpoints del conjunto samromur-21.05 | No disponible | Islandés | No disponible | No disponible | No disponible |
| wav2vec2-base original (Meta) | ~95 M | Inglés (LibriSpeech) | No disponible en esta consulta | No disponible en esta consulta | No disponible |
| Modelos ASR multilingües de gran tamaño citados en el paper | No disponible | Multilingüe | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo monolingüe: solo islandés. No traduce ni transcribe otros idiomas.
- Es un modelo ASR, no un modelo de lenguaje: no genera respuestas, no razona y no admite instrucciones en lenguaje natural.
- Sin resultados de benchmarks publicados ni validación externa: 0 descargas y 0 "likes" en el momento de la consulta, por lo que su calidad real no está contrastada por terceros.
- Sesgos potenciales derivados del corpus Samrómur: al tratarse de habla leída y recogida mediante contribuciones voluntarias, es probable que el rendimiento disminuya con habla espontánea, dialectos, acentos no representados o audio con ruido y solapamiento de hablantes.
- Riesgo de alucinación y de errores de transcripción: como todo modelo CTC, puede producir palabras inexistentes en el audio o fallar en nombres propios y terminología especializada. No se debe usar sin revisión humana en contextos críticos.
- Formato de salida no documentado: no se especifica si la transcripción incluye mayúsculas, puntuación ni números normalizados. En modelos CTC de este tipo es habitual obtener texto sin puntuar, pero no está confirmado para este checkpoint.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y obliga a distribuir las obras derivadas bajo la misma licencia (share-alike). Esto condiciona la integración en productos propietarios, especialmente si se redistribuye un modelo ajustado a partir de este.
- Sin garantías de soporte ni mantenimiento por parte del autor, y sin información sobre la fecha real de publicación (los metadatos del repositorio indican 2026-09-15).
- Las búsquedas web realizadas no devolvieron información relevante sobre el modelo: los resultados obtenidos corresponden a páginas sobre equipos de fútbol en árabe y no guardan relación con este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palli23/wav2vec2-base-samromur2105-100h
- Paper de referencia citado en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). No se ha encontrado enlace directo en la información disponible.
- Corpus Samrómur: citado en el nombre del modelo y en la model card, pero sin enlace aportado en la información disponible.
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.
