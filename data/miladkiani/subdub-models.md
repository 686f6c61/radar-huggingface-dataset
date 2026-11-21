# miladkiani/subdub-models

## Resumen

SubDub models es un repositorio de archivos de modelo derivados de Whisper, empaquetados en formato ggml para su uso con whisper.cpp en la aplicación Android SubDub, orientada a la generación de subtítulos sin conexión. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del modelo `AmirMohseni/whisper-small-persian`, un Whisper Small ajustado para reconocimiento automático de voz en persa (farsi).

El artefacto principal es `subdub-fa-accurate-small-q5_1.bin`, una conversión a ggml del modelo original cuantizada a q5_1 (5 bits con escalas de 6 bits) para reducir el tamaño y permitir la inferencia en dispositivos móviles. El modelo base sigue la arquitectura transformer encoder-decoder de Whisper Small, con aproximadamente 244 millones de parámetros, y está especializado en transcripción de audio en persa.

Su relevancia es acotada: no aporta innovaciones arquitectónicas ni datos de entrenamiento nuevos, pero resulta útil como ejemplo de distribución de modelos ASR ligeros para aplicaciones móviles offline, y como punto de partida para quien necesite un Whisper Small en persa listo para whisper.cpp. La licencia Apache 2.0 facilita su reutilización comercial, siempre que se respete la atribución al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small, segun el modelo base) |
| Parametros totales | no disponible (Whisper Small tiene aproximadamente 244 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | q5_1 (formato ggml) |
| Idiomas soportados | persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml (.bin) para whisper.cpp |

## Arquitectura y entrenamiento

El modelo subyacente es `AmirMohseni/whisper-small-persian`, un ajuste fino de Whisper Small sobre audio en persa. Whisper Small emplea una arquitectura transformer encoder-decoder con atención multi-cabeza estándar, diseñada originalmente por OpenAI para reconocimiento automático de voz multilingüe y traducción de voz. El ajuste fino del modelo base se orientó a mejorar la precisión en farsi.

El artefacto distribuido en este repositorio no incluye información sobre el proceso de entrenamiento del modelo original: no se detalla el número de tokens de audio, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste supervisado adicionales más allá del fine-tuning estándar de ASR. La única transformación documentada es la conversión a formato ggml y la cuantización a q5_1, realizada por el autor del repositorio para su integración en whisper.cpp.

## Capacidades

- Reconocimiento automático de voz (ASR) en persa (farsi).
- Generación de transcripciones y subtítulos a partir de audio.
- Inferencia offline mediante whisper.cpp, sin dependencia de servicios en la nube.
- Ejecución en dispositivos móviles gracias a la cuantización q5_1.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales más allá del audio de entrada.
- No se documenta capacidad multilingüe: el modelo está orientado exclusivamente al persa.

## Casos de uso

- Subtitulado offline en Android: la aplicación SubDub puede transcribir audio o vídeo local en persa sin conexión a internet, usando el archivo ggml con whisper.cpp y evitando enviar datos del usuario a servidores externos.
- Transcripción de reuniones o entrevistas en persa: el modelo puede procesar grabaciones de audio en farsi y generar texto para actas o notas, con la ventaja de ejecutarse en hardware modesto.
- Accesibilidad para contenido en persa: generación de subtítulos para vídeos dirigidos a personas con discapacidad auditiva, integrable en reproductores o editores de vídeo.
- Archivado y búsqueda de audio: transcripción de archivos de audio en persa para indexarlos y permitir búsquedas por texto en bibliotecas de podcasts o grabaciones.
- Prototipado de aplicaciones ASR móviles: sirve como base para desarrolladores que quieran integrar un motor de reconocimiento de voz en persa en apps Android mediante whisper.cpp, sin necesidad de entrenar un modelo propio.
- Investigación en ASR de bajos recursos: útil como referencia para comparar el rendimiento de Whisper Small ajustado al persa frente a otras variantes o cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de una cuantización q5_1 de un modelo de aproximadamente 244 M de parámetros, el archivo resultante ocupa una fracción de los 0,2 GB del repositorio completo.
- GPU recomendadas: no disponible; el formato ggml y whisper.cpp están pensados para CPU y para GPUs de consumo, no para aceleradores de datacenter.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: whisper.cpp (formato nativo), y de forma indirecta herramientas que acepten ggml, como algunas integraciones de Ollama o llama.cpp para audio, aunque no se documentan oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SubDub models (este) | no disponible (Whisper Small, ~244 M) | no disponible | fa | Apache 2.0 | ggml q5_1 |
| AmirMohseni/whisper-small-persian | no disponible (Whisper Small, ~244 M) | no disponible | fa | Apache 2.0 | safetensors (formato original) |
| openai/whisper-small | ~244 M | ventanas de 30 s de audio | multilingue | Apache 2.0 | safetensors, ggml en conversiones de terceros |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para comparar con alternativas ASR en persa.

## Limitaciones y advertencias

- El modelo está especializado únicamente en persa; no se garantiza un rendimiento aceptable en otros idiomas.
- Al ser una cuantización q5_1, puede producirse una pérdida de precisión respecto al modelo original en safetensors, aunque no se cuantifica en la información disponible.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos Whisper, especialmente en audio con ruido, acentos marcados o vocabulario técnico.
- No se documentan sesgos específicos, pero al derivar de Whisper Small pueden heredarse sesgos del corpus de entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero exige mantener la atribución al modelo original y al autor de la conversión.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de validación por parte de la comunidad.
- No se proporcionan métricas de calidad ni comparaciones con el modelo original, por lo que su idoneidad en producción debe validarse empíricamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/miladkiani/subdub-models
- Modelo base: https://huggingface.co/AmirMohseni/whisper-small-persian
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Whisper (OpenAI): https://github.com/openai/whisper
