# audio-cpp/Nemotron-3-Diarization-GGUF

## Resumen

Nemotron-3-Diarization-GGUF es una conversión de formato de los pesos originales de nvidia/Nemotron-3-Diarization, publicada por audio-cpp para permitir la inferencia nativa con el motor audio.cpp. Su tarea no es la transcripción de voz a texto, sino la diarización de hablantes: identificar quién habla y en qué momento, devolviendo turnos de habla con marcas temporales. El paquete contiene un único archivo GGUF en precisión BF16 con 362 tensores, sin variantes cuantizadas, y con la configuración del frontend mel embebida.

El modelo base procede de NVIDIA y está fijado a la revisión `723e19c601d99b7e58fba6a14e32153e0afe48d9`. La conversión se realizó desde el checkpoint original en formato `.nemo`, no desde otro GGUF, y el repositorio ocupa 0,2 GB con 99.263.443 parámetros totales. Según las etiquetas del repositorio, la arquitectura pertenece a la familia streaming Sortformer, lo que permite operar en modo offline, en streaming y en procesamiento por lotes en servidor, con soporte de hasta ocho hablantes.

Su relevancia actual es doble: por un lado, ofrece diarización en un tamaño muy reducido (menos de 100 millones de parámetros), apta para hardware modesto; por otro, amplía el ecosistema de formato GGUF a modelos de audio que no siguen la ruta de llama.cpp, sino la de audio.cpp. Es, por tanto, una pieza de infraestructura para pipelines de transcripción en los que hace falta separar hablantes antes o después del reconocimiento automático de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (según etiquetas del repositorio); modelo de diarización de hablantes |
| Parámetros totales | 99.263.443 (unos 99,3 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Solo BF16; no se incluyen variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (un único archivo `nemotron-3-diarization-bf16.gguf`, BF16, 362 tensores) |
| Tarea | Diarización de hablantes (pipeline declarado: voice-activity-detection) |
| Número máximo de hablantes | Hasta 8 |
| Salida | Turnos de hablante y marcas temporales (no palabras transcritas) |
| Modos de ejecución | Offline, streaming y por lotes en servidor |
| Frontend | Configuración embebida; filtro mel almacenado en F32 |
| Modelo base | nvidia/Nemotron-3-Diarization, revisión `723e19c601d99b7e58fba6a14e32153e0afe48d9` |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que la sitúan en la familia streaming Sortformer, orientada a diarización de hablantes con capacidad de streaming. El paquete GGUF contiene 362 tensores con los pesos en precisión BF16 original y el filtro mel del frontend en F32, lo que indica que la conversión preserva la precisión del checkpoint y no aplica ninguna transformación de cuantización. La configuración del frontend y la especificación del modelo van embebidas en el propio archivo, de modo que no se requieren ficheros auxiliares de pesos o configuración.

No se dispone de datos sobre el número de tokens o horas de entrenamiento, la composición del conjunto de datos, ni sobre si hubo etapas de ajuste fino con RLHF o DPO. La model card únicamente indica que la conversión se hizo desde el checkpoint `.nemo` original de NVIDIA y que no se trata de una publicación original de NVIDIA, sino de una conversión de formato para audio.cpp. Cualquier afirmación sobre innovaciones técnicas de entrenamiento (atención lineal, decodificación especulativa u otras) no está respaldada por la información proporcionada.

## Capacidades

- Diarización de hablantes con separación de hasta ocho voces distintas en una misma grabación.
- Devolución de turnos de habla con marcas temporales, aptos para alinear con transcripciones generadas por un modelo ASR independiente.
- Modo offline para procesar grabaciones completas.
- Modo streaming, con perfiles de latencia configurables (por ejemplo, `nemotron_3_diar.latency_profile=low`).
- Procesamiento por lotes en servidor mediante `audiocpp_server`, admitiendo varios archivos de distinta duración en una misma petición.
- Respuesta por defecto en formato SSE, con un evento `batch.transcription.result` por archivo completado que incluye el campo `speaker_turns` y un índice `index` para asociar el resultado al archivo subido.
- Etiquetado de hablante (speaker tagging) y detección de actividad de voz, según las etiquetas del repositorio.
- No realiza transcripción de palabras: la propia model card aclara que devuelve turnos y marcas temporales, no palabras transcritas.
- Soporte de tool calling o function calling: no disponible.
- Capacidades multilingües: no disponibles (la tarea de diarización es en gran medida independiente del idioma, pero no se declara soporte).
- Capacidades de visión o audio distinto del procesado de voz para diarización: no disponibles.

## Casos de uso

- Actas de reuniones: se pasa el WAV a 16 kHz de la reunión por `audiocpp_cli --task diar` y se obtiene un JSON de turnos que después se cruza con una transcripción ASR, de modo que cada intervención queda atribuida a un participante concreto.
- Analítica de centros de contacto: al separar agente y cliente en cada llamada, se pueden calcular tiempos de habla, solapamientos e interrupciones por turno, métricas útiles para evaluar calidad de atención sin necesidad de escuchar las grabaciones.
- Postproducción de pódcast y entrevistas: la diarización previa permite etiquetar pistas por locutor y automatizar el montaje o la generación de subtítulos con identificación de voz.
- Subtitulado y accesibilidad: combinado con un motor ASR, genera subtítulos con etiqueta de hablante, útil en contenido divulgativo, educativo o institucional con varios intervinientes.
- Documentación clínica o legal: en grabaciones de consulta o de vistas con varios participantes, los turnos con marcas temporales facilitan la revisión posterior y la trazabilidad de quién dijo qué.
- Investigación en conversación: creación de corpus anotados por hablante a partir de grabaciones sin etiquetar, usando el modo lote del servidor para procesar colecciones completas de distinta duración en una sola petición.
- Transcripción en directo con identificación de voz: con `--mode streaming` y un perfil de latencia bajo, se puede alimentar una interfaz que muestre en tiempo real quién está hablando, siempre que el resto del pipeline asuma la latencia añadida.
- Control de calidad de grabaciones: la detección de actividad de voz y el recuento de hablantes permiten filtrar audios vacíos, mal segmentados o con más de ocho voces antes de enviarlos a un sistema ASR más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de error de diarización (DER), tasas de acierto por hablante ni comparaciones numéricas con otros sistemas. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 99,3 millones de parámetros en BF16, los pesos ocupan aproximadamente 0,2 GB, coherente con el tamaño del repositorio; el resto del consumo corresponde a activaciones y buffers del frontend mel y del motor audio.cpp.
- GPU recomendadas: no especificadas por el autor. El ejemplo oficial usa `--backend cuda`, por lo que cualquier GPU con CUDA y al menos 1-2 GB de VRAM libre es suficiente en la práctica; una RTX 4090, A100 o H100 estarían muy por encima del requisito.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna, e incluso en iGPU o en CPU, dado el tamaño del modelo.
- Opciones de despliegue: `audiocpp_cli` para inferencia puntual o en streaming, y `audiocpp_server` con fichero `server.json` para servicio HTTP con lotes y respuesta SSE. El motor requiere una compilación de audio.cpp con soporte `nemotron_3_diar`.
- Backends y parámetros: el ejemplo oficial emplea `--backend cuda --threads 8`; también se usa `--threads 8` en la configuración del servidor.
- Formatos de entrada: WAV a 16 kHz.
- Latencia y throughput estimados: no disponibles. El repositorio ofrece perfiles de latencia configurables para streaming (`nemotron_3_diar.latency_profile=low`), pero sin cifras publicadas.
- Otros motores: no compatible con vLLM, llama.cpp, Ollama o TGI, ya que el GGUF está destinado específicamente al motor audio.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Nemotron-3-Diarization-GGUF (audio-cpp) | 99,3 M | No disponible | OpenMDW-1.1 | GGUF (BF16) para audio.cpp | Hasta 8 hablantes; offline, streaming y lote |
| nvidia/Nemotron-3-Diarization | No disponible | No disponible | No disponible en la información proporcionada | `.nemo` | Checkpoint original del que deriva esta conversión |
| pyannote/speaker-diarization-3.1 | No disponible | No disponible | No disponible | No disponible | Alternativa habitual en diarización; datos no verificados en esta búsqueda |
| NVIDIA NeMo (modelos de diarización MSDD/TitaNet) | No disponible | No disponible | No disponible | No disponible | Familia del propio ecosistema NeMo; datos no verificados en esta búsqueda |

La búsqueda web realizada no devolvió documentación técnica ni comparativas de diarización utilizables: los resultados se correspondían con plataformas de música, tiendas de audio y controladores de sonido. Por tanto, la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- No transcribe: solo devuelve turnos de hablante y marcas temporales. Requiere un modelo ASR adicional si se necesita texto.
- Límite de ocho hablantes. Escenarios con más voces simultáneas quedan fuera del alcance declarado.
- Sin benchmarks publicados: no hay medidas de DER ni comparaciones objetivas que permitan estimar la calidad frente a alternativas.
- Sin variantes cuantizadas: al incluirse únicamente BF16, el paquete es algo más pesado que una versión en Q8 o Q4, aunque su tamaño sigue siendo reducido.
- Idiomas no declarados: la model card no especifica idiomas soportados ni comportamiento diferencial por idioma o acento.
- Comportamiento ante solapamiento de voces, ruido de fondo o audio telefónico no está documentado en la información disponible.
- Licencia OpenMDW-1.1, no la licencia del código de audio.cpp. Antes de un uso comercial es necesario revisar los términos completos del texto de la licencia incluido en `LICENSE.html` y conservar la licencia y los avisos de origen al redistribuir.
- Es una conversión de formato, no una publicación de NVIDIA: los problemas de calidad del modelo subyacente deben reportarse contra el modelo base.
- Dependencia del motor: funciona con audio.cpp y no con otras herramientas que consumen GGUF, lo que limita la portabilidad.
- Entrada restringida a WAV de 16 kHz; otros formatos o frecuencias requieren conversión previa.
- Riesgo de alucinación en el sentido clásico (texto inventado) no aplica, pero sí existe riesgo de atribución errónea de turnos o de hablantes fusionados, algo no cuantificado en la documentación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/audio-cpp/Nemotron-3-Diarization-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Revisión fijada del modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization/tree/723e19c601d99b7e58fba6a14e32153e0afe48d9
- Motor audio.cpp: https://github.com/0xShug0/audio.cpp
- Documentación del modelo en audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/nemotron_3_diar.md
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Búsqueda web: no se encontraron enlaces técnicos relevantes (papers, blogs, repos o demos) sobre este modelo en los resultados disponibles.
