# GhaythMahadin/canary-1b-flash-gguf

## Resumen

canary-1b-flash-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla nvidia/canary-1b-flash, publicada por el usuario GhaythMahadin y pensada para su uso con el motor de inferencia transcribe.cpp. El modelo base lo desarrolla NVIDIA dentro de su familia NeMo Canary, una arquitectura multitarea de tipo attention encoder-decoder (AED) orientada a transcripción y traducción de voz. Esta conversión concreta no aporta pesos nuevos: es una cuantización del checkpoint original, fijada al commit a9a55e0 del repositorio upstream y validada contra la referencia NeMo en el commit db53eda de transcribe.cpp el 8 de mayo de 2026.

El modelo resuelve dos tareas sobre audio de voz: reconocimiento automático del habla en inglés, alemán, español y francés, y traducción bidireccional entre inglés y cada uno de esos tres idiomas. Con 883 millones de parámetros (890.042.496 según los safetensors del modelo base) y un encoder FastConformer de 32 capas más un decoder Transformer de 4 capas, se sitúa en la gama media de ASR, con la particularidad de ofrecer más de 1000 RTFx según NVIDIA en los conjuntos del Open ASR Leaderboard.

Su relevancia actual radica en que permite ejecutar un modelo ASR multilingüe de calidad en hardware modesto: las cuantizaciones van desde 3,56 GB en F32 hasta 677 MB en Q4_K_M, con una degradación de WER prácticamente nula en LibriSpeech test-clean (1,59 % en Q4_K_M frente a 1,62 % en F32). La licencia CC-BY-4.0 del modelo original habilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea AED: encoder FastConformer de 32 capas + decoder Transformer de 4 capas |
| Parametros totales | 883 M (890.042.496 en safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles, aleman, espanol, frances (ASR); traduccion EN↔{DE, ES, FR} |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (libreria transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Canary descrita por NVIDIA: un encoder FastConformer de 32 capas que procesa características acústicas y un decoder Transformer autorregresivo de 4 capas que genera la secuencia de texto. Es un modelo multitarea AED, lo que significa que la tarea (transcripción o traducción, con o sin puntuación y mayúsculas) se controla mediante tokens de tarea en la entrada del decoder. El modelo base acepta audio de 16 kHz mono en formato WAV.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card upstream menciona que el modelo alcanza más de 1000 RTFx en los conjuntos del Open ASR Leaderboard y que la predicción de timestamps a nivel de palabra y segmento es una funcionalidad experimental en los cuatro idiomas. Esta conversión GGUF no expone timestamps en su versión v1 del port y no soporta streaming ni detección de idioma.

La conversión ha sido validada numéricamente contra la implementación de referencia NeMo. Las cifras de WER publicadas para las cuantizaciones se obtuvieron con decodificación greedy y sin modelo de lenguaje externo.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, alemán, español y francés sobre audio de 16 kHz mono.
- Traducción de voz bidireccional: inglés a alemán, español y francés, y de estos tres idiomas a inglés.
- Transcripción con o sin puntuación y mayúsculas (PnC), controlada mediante tokens de tarea del modelo base.
- Predicción experimental de timestamps a nivel de palabra y segmento en el modelo upstream (no expuesta en este port v1).
- No soporta streaming: el procesamiento es offline por fichero completo.
- No incluye detección automática de idioma (lang_detect: false).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de voz a texto.

## Casos de uso

- Transcripción de reuniones y actas: al ser offline y aceptar ficheros WAV completos, se puede procesar la grabación de una reunión en inglés, alemán, español o francés y obtener la transcripción con puntuación para su revisión posterior. La ventana de contexto no está documentada, por lo que conviene segmentar audios largos.
- Subtitulado de contenido audiovisual multilingüe: combinado con ffmpeg para convertir la pista de audio a 16 kHz mono, el modelo genera el texto base para subtítulos en los cuatro idiomas soportados, con la salvedad de que los timestamps no están expuestos en este port.
- Traducción de entrevistas y material de investigación: la capacidad de traducción EN↔{DE, ES, FR} permite transcribir una entrevista en alemán y obtener directamente la versión en inglés, útil en proyectos de investigación con fuentes multilingües.
- Atención al cliente y análisis de llamadas: transcripción por lotes de grabaciones de call center en los cuatro idiomas para alimentar sistemas de análisis de sentimiento o búsqueda sobre el texto resultante, con despliegue local en CPU.
- Despliegue en dispositivos de borde: la cuantización Q4_K_M de 677 MB permite ejecutar el modelo en equipos sin GPU dedicada; los datos del autor indican 8,85x de tiempo real en CPU Ryzen 4750U y 15,48x con Vulkan.
- Herramientas de accesibilidad: transcripción local de notas de voz y audios para personas con discapacidad auditiva, sin enviar el audio a servicios en la nube, lo que resulta relevante por privacidad.
- Pipeline de documentación interna: integración en scripts que conviertan grabaciones de formación o webinars en texto buscable, usando la CLI de transcribe.cpp con el fichero GGUF Q8_0 (1,05 GB) como compromiso entre tamaño y fidelidad.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión. WER sobre LibriSpeech test-clean completo (2.620 enunciados), batch size 1, sin timestamps, decodificación greedy y sin LM externo. El baseline de referencia F32 es 1,62 %; NVIDIA reporta 1,48 % en la model card upstream.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 3,56 GB | 1,62 % |
| F16 | 1,79 GB | 1,62 % |
| Q8_0 | 1,05 GB | 1,62 % |
| Q6_K | 858 MB | 1,65 % |
| Q5_K_M | 770 MB | 1,64 % |
| Q4_K_M | 677 MB | 1,59 % |

WER en FLEURS con cuantización Q8_0:

| Idioma | WER FLEURS (Q8_0) |
|---|---:|
| Aleman | 6,13 % |
| Ingles | 4,75 % |
| Espanol | 6,73 % |
| Frances | 7,22 % |

Rendimiento en tiempo real (RTF, factor de velocidad respecto al tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 25,43 |
| Apple M4 Max | Metal | 111,75 |
| AMD Ryzen 4750U | CPU | 8,85 |
| AMD Ryzen 4750U | Vulkan | 15,48 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los ficheros, Q8_0 requiere en torno a 1,05 GB de memoria y Q4_K_M en torno a 677 MB, más el overhead del runtime.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El autor reporta aceleración con Metal en Apple M4 Max (111,75x tiempo real) y con Vulkan en AMD Ryzen 4750U (15,48x).
- Cabe en GPU de consumo: sí, dado el reducido tamaño de las cuantizaciones (desde 677 MB en Q4_K_M). No se detallan modelos concretos de GPU de consumo.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: los RTF reportados indican entre 8,85x y 25,43x tiempo real en CPU y hasta 111,75x con Metal. NVIDIA reporta más de 1000 RTFx en los conjuntos del Open ASR Leaderboard para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| canary-1b-flash-gguf (esta ficha) | 883 M | EN, DE, ES, FR | No disponible | CC-BY-4.0 | GGUF |
| nvidia/canary-1b-flash (base) | 883 M | EN, DE, ES, FR | No disponible | CC-BY-4.0 | NeMo (.nemo) |
| nvidia/canary-1b-v2 | No disponible | 25 idiomas europeos | No disponible | No disponible en la informacion | No disponible |

La model card upstream menciona canary-1b-v2 como sucesor con 25 idiomas europeos, mejor predicción de timestamps y ASR/AST mejorados. No se dispone de datos de benchmarks comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Modelo offline: no soporta streaming, por lo que no es adecuado para transcripción en tiempo real de audio continuo.
- Sin detección automática de idioma: el idioma debe especificarse o inferirse externamente.
- Timestamps no expuestos en este port v1, pese a que el modelo upstream los ofrece de forma experimental.
- Solo cubre cuatro idiomas (EN, DE, ES, FR); no hay soporte para otras lenguas.
- WER más alto en FLEURS que en LibriSpeech (hasta 7,22 % en francés con Q8_0), lo que refleja mayor dificultad en audio no leído.
- El modelo base reporta 1,48 % en LibriSpeech test-clean, mientras que la conversión mide 1,62 % en F32; existe una diferencia atribuible a la implementación y a la decodificación sin LM externo.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan sesgos específicos en la información disponible.
- Requiere audio de entrada en WAV de 16 kHz mono; es necesario remuestrear con herramientas externas como ffmpeg.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos completos en la model card upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no oficial de NVIDIA.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/canary-1b-flash-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-flash
- Commit upstream fijado: https://huggingface.co/nvidia/canary-1b-flash/commit/a9a55e0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-flash.md
- Sucesor Canary 1B V2: https://huggingface.co/nvidia/canary-1b-v2
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com/
- Referencia Canary (arXiv 2409.13523): https://arxiv.org/abs/2409.13523
- Referencia FastConformer (arXiv 2305.05084, citada indirectamente): no disponible como enlace directo en la información proporcionada
