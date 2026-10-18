# hasanghaffari93/whisper-large-v3-turbo-persian-ggml-q5_0

## Resumen

`hasanghaffari93/whisper-large-v3-turbo-persian-ggml-q5_0` es una cuantización en formato GGML (Q5_0) del modelo `givia/whisper-large-v3-turbo-persian`, un ajuste fino en persa (fa) de `openai/whisper-large-v3-turbo`. El repositorio contiene un único artefacto, `ggml-persian-v3-turbo-q5_0.bin`, listo para ejecutarse con whisper.cpp. El autor de esta ficha es hasanghaffari93, mientras que el modelo original fue entrenado por givia; esta publicación solo redistribuye los pesos convertidos y cuantizados.

El interés practico es acotado pero claro: permite reconocimiento automatico del habla en persa sobre CPU, GPU de gama baja o dispositivos embebidos, sin necesidad de un runtime de deep learning completo. Al tratarse de una cuantización de 5 bits por bloque (Q5_0) del turbo de Whisper, el peso del fichero se reduce a aproximadamente 0,6 GB, lo que facilita su distribución y su despliegue en entornos con memoria muy limitada.

Ahora bien, la ficha debe leerse con cautela: el repositorio no publica métricas de ningún tipo (ni WER, ni comparativas, ni detalles del proceso de cuantización más allá del nombre del fichero), no incluye código de ejemplo y registra cero descargas y cero valoraciones en el momento de la consulta. La model card se limita a indicar el modelo base, la licencia y el pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper large-v3-turbo); esta ficha es la conversión GGML/whisper.cpp del modelo base |
| Parámetros totales | No disponible en la model card; la arquitectura Whisper large-v3-turbo declara ~809 M parámetros (dato de la familia, no verificado en este repositorio) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; Whisper procesa ventanas de audio de 30 s (1500 tramas mel) por segmento |
| Tipos de cuantización | Q5_0 (GGML, 5 bits por peso con bloque de 32); este repositorio solo publica esa variante |
| Idiomas soportados | Persa (fa), según la model card. El Whisper original es multilingüe (~99 idiomas), pero el ajuste fino y la ficha solo declaran fa |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGML binario (`ggml-persian-v3-turbo-q5_0.bin`); no se distribuyen safetensors ni otros formatos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con encoder convolucional más capas de atención, entrenado sobre espectrogramas mel de 128 bandas. La variante *turbo* reduce el decoder a 4 capas frente a las 32 de large-v3, lo que recorta el coste de decodificación a cambio de una ligera pérdida de precisión. El modelo base de esta cadena, `givia/whisper-large-v3-turbo-persian`, es un ajuste fino sobre datos en persa; no se dispone en la información proporcionada de detalles sobre el volumen de horas de audio, la composición del corpus ni si el ajuste incluyó etapas de RLHF o DPO.

Esta publicación concreta no entrena nada: aplica la conversión a GGML y la cuantización Q5_0 para whisper.cpp. No se documentan en el repositorio los parámetros exactos del proceso de cuantización (herramienta utilizada, versión, si se cuantizaron todas las matrices o se dejaron capas en precisión superior), ni se ofrecen comparativas de WER entre el modelo original y esta versión cuantizada, algo habitual y recomendable en este tipo de conversiones.

## Capacidades

- Reconocimiento automático del habla en persa sobre audio de hasta 30 segundos por ventana, con concatenación de segmentos para audios más largos.
- Transcripción con puntuación y uso de mayúsculas (comportamiento heredado de Whisper), sujeta a la calidad del ajuste en persa.
- Generación de marcas de tiempo por segmento (timestamps), útiles para subtitulado, siempre que el runtime las solicite.
- Traducción al inglés desde el audio de entrada (tarea `translate` de Whisper); no verificada para este ajuste fino.
- Ejecución totalmente offline en CPU, sin dependencias de Python ni de CUDA, mediante whisper.cpp.
- Inferencia en formatos de audio habituales (WAV 16 kHz mono recomendado) y streaming por bloques con la herramienta `stream` de whisper.cpp.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio nativo de salida ni modo de razonamiento extendido: es un modelo puro de ASR.

## Casos de uso

- **Transcripción offline de entrevistas y reuniones en persa**: conversión del audio a texto en una máquina sin GPU, integrando el binario GGML en un script de posproceso; el tamaño de 0,6 GB permite moverlo en una memoria USB o incluirlo en una imagen de contenedor ligera.
- **Subtitulado automático de vídeo en persa**: uso de las marcas de tiempo por segmento de Whisper para generar ficheros SRT, con revisión humana posterior; adecuado para canales de contenido que necesitan un primer borrador rápido sin coste por API.
- **Despliegue en dispositivos de borde**: cajas Android, Raspberry Pi o equipos industriales con poca memoria donde un modelo de 809 M en fp16 no cabría con holgura; Q5_0 reduce el peso del fichero a ~0,6 GB y la RAM necesaria se mantiene en el orden de 1-2 GB.
- **Procesamiento por lotes de archivo sonoro histórico**: digitalización de fondos de audio en persa con un pipeline basado en `whisper.cpp` que recorre directorios completos; la naturaleza offline evita enviar material sensible a servicios externos.
- **Prototipado de asistentes de voz en persa**: la transcripción se encadena a un LLM o a un motor de intenciones; esta cuantización sirve como etapa ASR de bajo coste durante la fase de prueba, antes de invertir en infraestructura GPU.
- **Investigación en ASR de bajos recursos**: punto de partida reproducible para medir el impacto de la cuantización Q5_0 en el WER del persa frente al modelo base, dado que el fichero GGML puede ejecutarse en el mismo hardware que otras variantes.
- **Accesibilidad**: generación de transcripciones para vídeos o clases en persa que carecen de subtítulos, en entornos con recursos informáticos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, CER, ni comparativas con el modelo base `givia/whisper-large-v3-turbo-persian` o con `openai/whisper-large-v3-turbo`. Tampoco se documenta la degradación introducida por la cuantización Q5_0, dato especialmente relevante en ASR porque los errores de cuantización pueden afectar a fonemas poco frecuentes.

## Requisitos de hardware

- **Tamaño en disco**: el repositorio ocupa 0,6 GB y contiene un único fichero `.bin`; esa es la huella de almacenamiento del modelo cuantizado.
- **VRAM/RAM estimada**: no disponible como medición publicada. De forma orientativa, whisper.cpp con Q5_0 requiere del orden de 1-2 GB de memoria al cargar el modelo y procesar una ventana de 30 s, incluyendo buffers intermedios; conviene validarlo en el hardware objetivo.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM es suficiente en la práctica (RTX 3060, RTX 4060, GTX 1660 Super, T4, L4). Para el modelo en fp16 de la familia turbo se suele recomendar 8-16 GB; esta cuantización rebaja mucho ese requisito.
- **¿Cabe en GPU de consumo?** Sí, en prácticamente cualquier GPU dedicada de los últimos años, y también en gráficas integradas y en Apple Silicon mediante el backend Metal de whisper.cpp.
- **CPU**: es viable en x86-64 moderno con varios hilos e incluso en Raspberry Pi 4/5 o Jetson, con velocidad muy dependiente del número de núcleos; no hay cifras de *real-time factor* publicadas para esta cuantización.
- **Opciones de despliegue**: whisper.cpp (CLI, `whisper-server`, `stream`), bindings como `pywhispercpp` o `whisper-node`, y contenedores propios. No es compatible con vLLM, TGI, Ollama ni llama.cpp, ya que el formato GGML de Whisper no es el de los LLM.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, la variante turbo reduce el número de capas del decoder y por tanto el tiempo de decodificación frente a large-v3, pero no se aportan números para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato / disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Este modelo (`whisper-large-v3-turbo-persian-ggml-q5_0`) | ~809 M (familia turbo) | 30 s por ventana | fa (declarado) | CC-BY-4.0 | GGML Q5_0, ~0,6 GB | Sin datos publicados |
| `givia/whisper-large-v3-turbo-persian` (base) | No disponible en la información | 30 s por ventana | fa | No disponible en la información | Pesos originales (formato no indicado) | Sin datos publicados |
| `openai/whisper-large-v3-turbo` | ~809 M | 30 s por ventana | ~99 idiomas | MIT | safetensors, Transformers | Métricas publicadas por OpenAI en la model card original |
| `openai/whisper-large-v3` | ~1550 M | 30 s por ventana | ~99 idiomas | MIT | safetensors, Transformers | Superior a turbo en varios idiomas, a costa de mayor coste de decodificación |

No se dispone de información sobre otros modelos de ASR específicos para persa (por ejemplo, ajustes de NeMo o de MMS) dentro de la documentación consultada, por lo que no se incluye comparación cuantitativa con ellos. Tampoco hay datos que permitan afirmar que esta cuantización supera o iguala al modelo base de givia en persa.

## Limitaciones y advertencias

- **Sin validación comunitaria**: cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia de terceros sobre su calidad.
- **Sin métricas**: la ausencia de WER impide saber cuánto se degrada el modelo base tras la cuantización Q5_0, que en ASR puede afectar de forma no trivial a palabras poco frecuentes y a nombres propios.
- **Alucinaciones típicas de Whisper**: en silencios, música o ruido de fondo el modelo puede generar texto inventado o repetir frases; en producción conviene aplicar detección de voz (VAD) y filtros de repetición.
- **Sesgo hacia el persa**: el ajuste fino está orientado a fa; no debe asumirse un comportamiento correcto en otros idiomas aunque la arquitectura original sea multilingüe.
- **Variantes ortográficas del persa**: caben errores en la transcripción de homóglifos, en el uso de ZWNJ (نیم‌فاصله), en la puntuación y en la transliteración de términos extranjeros; requiere revisión humana en usos editoriales.
- **Ventanas de 30 s y marcas de tiempo**: los timestamps de Whisper son aproximados y pueden desviarse en audios largos con pausas; no hay diarización de hablantes ni detección de cambios de turno.
- **Licencia CC-BY-4.0**: exige atribución al redistribuidor y al modelo base; conviene revisar también las condiciones del modelo de givia y la licencia MIT del Whisper original antes de un uso comercial.
- **Mantenimiento**: el repositorio no incluye código, scripts de conversión ni instrucciones de uso; si el formato GGML cambia en whisper.cpp, la compatibilidad no está garantizada por el autor.
- **Un solo formato y una sola cuantización**: no hay alternativas Q8_0, Q4_0 ni fp16 en este repositorio, lo que limita el ajuste fino entre calidad y tamaño.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hasanghaffari93/whisper-large-v3-turbo-persian-ggml-q5_0
- Modelo base (ajuste en persa): https://huggingface.co/givia/whisper-large-v3-turbo-persian
- Whisper large-v3-turbo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores corresponden a las fuentes citadas en la información del repositorio y a los proyectos de referencia de la familia Whisper.
