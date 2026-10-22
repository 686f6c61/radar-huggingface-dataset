# joshthomasdev/underdog-bark-3.0-pro-gguf

## Resumen

Underdog Bark 3.0 Pro (GGUF) es una conversión no oficial al formato GGUF del modelo de reconocimiento automático del habla ConwayResearch/Underdog-Bark-3.0-Pro, publicada por el usuario joshthomasdev. Se trata de un artefacto de cuantización, no de un modelo entrenado desde cero: el autor parte de la revisión `4b5c51e04aa8d16dda9ecdff71bc29f7360149e4` del modelo original, descomprime los pesos safetensors a F32 y los convierte con la herramienta `transcribe-quantize` de transcribe.cpp para producir un único fichero Q8_0 de aproximadamente 0,7 GB.

El modelo resuelve la tarea de transcripción de audio a texto en inglés (`pipeline_tag: automatic-speech-recognition`, `language: en`) y su interés práctico está en que permite ejecutar un sistema ASR de unos 627 millones de parámetros en local, sin depender de una GPU de datacenter, gracias a la reducción de tamaño que aporta la cuantización a 8 bits. La conversión está específicamente pensada para transcribe.cpp, una implementación en C++ centrada en inferencia eficiente de modelos de voz, y no para otros runtimes GGUF genéricos.

La relevancia de esta ficha es doble: por un lado documenta un caso real de portabilidad de un modelo ASR a un runtime C++; por otro, advierte de que se trata de un repositorio con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica más allá del procedimiento de conversión. La información disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es, por tanto, muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor etiqueta el modelo como `parakeet`; la conversión usa `convert-parakeet.py`, lo que indica la familia Parakeet de NVIDIA, pero no se detalla la arquitectura interna) |
| Parametros totales | 627.052.166 (~627 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se especifica la ventana de audio por segmento ni un contexto de texto) |
| Tipos de cuantizacion | Q8_0 (única variante publicada); el pipeline genera un GGUF F32 intermedio antes de cuantizar |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 (idéntica al modelo base; ver `NOTICE` en el repositorio) |
| Formato de pesos | GGUF (Q8_0) para transcribe.cpp; el modelo base usa safetensors |
| Tarea | reconocimiento automático del habla (`automatic-speech-recognition`) |
| Modelo base | ConwayResearch/Underdog-Bark-3.0-Pro (revisión `4b5c51e04aa8d16dda9ecdff71bc29f7360149e4`) |
| Runtime objetivo | transcribe.cpp (commit `db678a0` + parche `convert-parakeet-bark.patch`) |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-21 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Lo único deducible de la model card es que el autor lo etiqueta con `parakeet` y que el proceso de conversión emplea `scripts/convert-parakeet.py` del repositorio transcribe.cpp, lo que sitúa al modelo base en la familia Parakeet de NVIDIA (modelos ASR orientados a transcripción eficiente). No se especifica si se trata de un conformer, un transducer (RNN-T/TDT) ni un encoder-decoder attention-based; tampoco se detalla el número de capas, dimensión oculta, mecanismo de atención ni el tokenizer utilizado más allá de que el repositorio base incluye `tokenizer.json`.

Respecto al entrenamiento, no hay ningún dato publicado en la información proporcionada: ni volumen de horas de audio, ni composición del dataset, ni si hubo ajuste con RLHF, DPO o similares (poco habitual en ASR). El repositorio de esta ficha es exclusivamente un artefacto de cuantización: el pipeline documentado descarga los pesos del modelo base, los descomprime a safetensors F32 con `bark_to_hf.py`, aplica el parche `convert-parakeet-bark.patch` sobre transcribe.cpp en el commit `db678a0`, ejecuta la conversión a GGUF F32 y finalmente cuantiza a Q8_0. Por tanto, cualquier innovación técnica (decodificación, atención, compresión) proviene del modelo original y no está documentada aquí.

## Capacidades

- Transcripción de voz a texto en inglés mediante la tarea `automatic-speech-recognition`.
- Ejecución en local mediante transcribe.cpp, sin dependencia de servicios en la nube.
- Inferencia sobre pesos cuantizados a 8 bits (Q8_0), lo que reduce el espacio en disco y el ancho de banda de memoria frente a F32.
- Pipeline reproducible de conversión desde safetensors a GGUF documentado paso a paso por el autor.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de "thinking".
- No hay evidencia de capacidades multimodales más allá del audio de entrada y texto de salida (sin visión, sin audio de salida, sin diarización declarada).
- Multilingüismo: limitado a inglés según el campo `language` de la model card.
- No se declaran capacidades de marcas de tiempo (timestamps), puntuación automática ni normalización de texto.

## Casos de uso

- Transcripción de reuniones y actas en inglés: el modelo convierte grabaciones de audio en texto plano que después puede procesarse con herramientas de resumen; su tamaño de ~627 M parámetros permite ejecutarlo en la misma máquina donde se almacenan las grabaciones, evitando enviar audio confidencial a terceros.
- Subtitulado de vídeo y podcast: integrado en un pipeline de procesamiento por lotes con transcribe.cpp, permite generar pistas de subtítulos en inglés para catálogos de contenido, con la ventaja de que la inferencia en C++ no requiere un stack de Python en producción.
- Dictado y entrada por voz en aplicaciones de escritorio: al caber en CPU y en GPUs de consumo, puede embeberse como binario local para funcionalidades de voice-to-text sin conexión.
- Indexación y búsqueda de archivos de audio: transcribir una fonoteca y cargar el texto en un motor de búsqueda (Elasticsearch, SQLite FTS) para recuperar fragmentos por palabra clave; el coste por hora de audio es bajo al usar un modelo de 627 M en Q8_0.
- Control de calidad en atención al cliente: transcripción de llamadas grabadas en inglés para auditar guiones, detectar palabras prohibidas o medir tiempos de respuesta; el despliegue on-premise facilita el cumplimiento de políticas de retención de datos.
- Generación de datasets para entrenamiento de ASR: uso como transcriptor base para etiquetar grandes volúmenes de audio en inglés antes de un filtrado manual o automático.
- Prototipado e investigación en eficiencia: banco de pruebas para comparar el rendimiento de un ASR de ~627 M en Q8_0 frente a alternativas en FP16 dentro de transcribe.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de error de palabra (WER), comparaciones con Whisper u otros sistemas, ni mediciones de latencia o throughput. El repositorio tampoco referencia el HF Open ASR Leaderboard ni ningún conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,7-1,5 GB con Q8_0 (0,63 GB de pesos más overhead de activaciones y buffers de audio; estimación, no medida publicada).
- Alternativa F32 (no publicada en este repo, generada en el pipeline): en torno a 2,5 GB de pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente en la práctica para Q8_0 (RTX 3050/3060, RTX 4060, GTX 1660, etc.). Para despliegues de alto volumen, A100/H100 no son necesarias por tamaño, pero sí útiles si se busca máxima concurrencia.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del repositorio (0,7 GB).
- Ejecución en CPU: viable gracias al runtime C++ (transcribe.cpp) y al tamaño reducido del modelo; no se publican cifras de velocidad.
- Opciones de despliegue: transcribe.cpp es el runtime objetivo declarado (requiere el commit `db678a0` y el parche `convert-parakeet-bark.patch` para reproducir la conversión). No se ha confirmado compatibilidad con llama.cpp, Ollama, vLLM ni TGI; estos runtimes no están orientados a arquitecturas ASR tipo Parakeet, por lo que no debe asumirse soporte.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Underdog Bark 3.0 Pro (GGUF Q8_0) | ~627 M | no disponible | en | CC-BY-4.0 | GGUF (Q8_0) | no disponible |
| NVIDIA Parakeet TDT 0.6B (familia Parakeet) | ~600 M | no disponible en esta ficha | en | CC-BY-4.0 | safetensors / NeMo | no consultado |
| OpenAI Whisper large-v3 | ~1.550 M | ventana de 30 s de audio | multilingüe | MIT | safetensors, GGUF (via terceros) | ampliamente publicados |
| OpenAI Whisper small | ~244 M | ventana de 30 s de audio | multilingüe | MIT | safetensors, GGUF (via terceros) | ampliamente publicados |

Nota: los datos de los modelos comparados son de referencia general y no se han verificado contra la información proporcionada en esta ficha; las celdas marcadas como "no disponible" o "no consultado" reflejan ausencia de datos en el material de partida, no ausencia de datos en el mundo real.

## Limitaciones y advertencias

- Repositorio no oficial: la conversión la firma un tercero (joshthomasdev), no el autor del modelo base (ConwayResearch). No hay garantía de equivalencia numérica con el original más allá de lo que el autor declara.
- Cero descargas y cero likes en el momento de la consulta: no existe validación comunitaria ni informes independientes de calidad.
- Sin benchmarks: no se puede afirmar nada sobre WER ni comparar con Whisper o Parakeet en condiciones reales.
- Idioma único: solo inglés. Cualquier uso con audio en castellano u otros idiomas queda fuera de las capacidades declaradas.
- Compatibilidad restringida: diseñado para transcribe.cpp (commit `db678a0` más parche), lo que implica un proceso de build manual (CMake) y dependencia de una revisión concreta del runtime.
- Riesgo de alucinación y errores de transcripción: inherente a cualquier modelo ASR, especialmente con ruido de fondo, acentos no nativos, solapamiento de hablantes o audio de baja calidad. No se documenta ningún mecanismo de detección de silencio o de confianza.
- Sin diarización ni timestamps declarados: si el caso de uso exige identificar hablantes o marcas temporales, habrá que añadir componentes externos.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor original y conservar el aviso `NOTICE`; conviene revisar los términos del modelo base por si hubiera condiciones adicionales no reflejadas en esta ficha.
- Fecha de creación futura respecto a la mayoría de catálogos (2026-10-21): verificar que el repositorio y la revisión del modelo base siguen disponibles antes de integrarlo en producción.
- Ausencia de información sobre sesgos: no hay evaluación de sesgos por acento, género, edad o variedad dialectal del inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/joshthomasdev/underdog-bark-3.0-pro-gguf
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Revisión concreta del modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro/tree/4b5c51e04aa8d16dda9ecdff71bc29f7360149e4
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit del runtime usado: https://github.com/handy-computer/transcribe.cpp/tree/db678a0
