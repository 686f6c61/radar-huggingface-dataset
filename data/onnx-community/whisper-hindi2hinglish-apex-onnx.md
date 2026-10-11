# onnx-community/Whisper-Hindi2Hinglish-Apex-ONNX

## Resumen

Whisper-Hindi2Hinglish-Apex-ONNX es la conversión a formato ONNX del modelo Oriserve/Whisper-Hindi2Hinglish-Apex, un sistema de reconocimiento automático del habla (ASR) especializado en audio en hindi con acento indio y ruido de fondo. La conversión la realiza la organización onnx-community mediante un Space automático de Hugging Face y está orientada a ejecutarse con Transformers.js, es decir, en navegador o en Node.js sobre ONNX Runtime, sin depender de Python ni de una GPU dedicada en el cliente.

El modelo resuelve un problema concreto: transcribir hindi a Hinglish (hindi romanizado, con mezcla natural de términos en inglés) en lugar de devolver texto en grafía devanagari. El autor del modelo original lo entrenó sobre aproximadamente 700 horas de audio hindi con acento indio y ruido, y declara una mejora media de en torno al 42 % frente al modelo preentrenado, además de una inferencia hasta 8 veces más rápida. En la Speech-To-Text Arena de Oriserve, el modelo original figura en primera posición en la métrica de preferencia de transcripción.

El repositorio ocupa 14,0 GB, declara licencia Apache 2.0 y no registra descargas ni likes en el momento de la consulta. No se especifican el número exacto de parámetros, la longitud de contexto ni las precisiones ONNX incluidas, aunque el autor compara el modelo directamente con Whisper Large V3, lo que sitúa el artefacto en la gama alta de la familia Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia Whisper (conversión ONNX del modelo Oriserve/Whisper-Hindi2Hinglish-Apex); detalles de la arquitectura interna no especificados en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la familia Whisper procesa ventanas de audio de 30 segundos por pasada |
| Tipos de cuantizacion | no especificados en la informacion disponible; el repositorio de 14,0 GB sugiere la inclusión de varias precisiones (fp32/fp16 y cuantizaciones) generadas por el conversor automático de onnx-community |
| Idiomas soportados | en, hi (declarados); salida en Hinglish romanizado |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (repo etiquetado también con pytorch) |
| Tarea principal | automatic-speech-recognition (ASR) |
| Modelo base | Oriserve/Whisper-Hindi2Hinglish-Apex |
| Libreria de inferencia | transformers.js |
| Tamano del repositorio | 14,0 GB |
| Idiomas de la model card | en, hi |

## Arquitectura y entrenamiento

El artefacto es un export ONNX de un modelo de la familia Whisper, con arquitectura transformer encoder-decoder y procesamiento de audio en ventanas de 30 segundos, convertido automáticamente mediante el Space convert-to-onnx de onnx-community. No se documentan en la información disponible ni el número de capas, ni las dimensiones ocultas, ni las cabezas de atención del modelo concreto. El autor compara el resultado directamente con Whisper Large V3, lo que indica que se parte de un modelo de la gama superior de la familia.

En cuanto al entrenamiento del modelo original, el autor indica un total de aproximadamente 700 horas de audio hindi con acento indio y ruido, procedente de una mezcla de conjuntos de datos de código abierto y propietarios, con etiquetado automático mediante un modelo SOTA seguido de corrección humana manual. El ajuste fino empleó dos técnicas propias: congelación dinámica de capas, identificando las capas más activas durante la inferencia y entrenando de forma selectiva únicamente esas capas, y aumento de datos diseñado para incrementar la robustez frente a ruido. No se detalla en la información proporcionada si hubo RLHF, DPO ni qué volumen de tokens o de horas se usó en cada fase.

## Capacidades

- Transcripción de voz a texto para audio en hindi con acento indio, incluido audio ruidoso, con salida en Hinglish romanizado en lugar de devanagari.
- Manejo de habla mezclada hindi-inglés (code-switching), habitual en conversaciones reales en India.
- Reconocimiento automático del habla como tarea única y principal; no es un modelo generativo de texto de propósito general.
- Ejecución en navegador y en Node.js mediante Transformers.js sobre ONNX Runtime, lo que permite inferencia local y sin enviar el audio a un servidor.
- Tool calling / function calling: no soportado; es un modelo ASR, no un modelo de chat con soporte de herramientas.
- Agentes y razonamiento multi-paso: no soportado; no dispone de bucle de agente ni de modo de razonamiento extendido.
- Capacidades multilingües: limitadas a los idiomas declarados (en, hi) y a su representación romanizada combinada; no se documenta soporte para otras lenguas indias ni europeas.
- Capacidades especiales: no se documentan modo thinking, visión, audio generation ni traducción explícita a otros idiomas; la etiqueta whisper-event indica compatibilidad con el ecosistema de evaluación de Whisper.

## Casos de uso

- Transcripción de centros de contacto en India: el modelo convierte grabaciones de llamadas con acento indio y ruido de fondo en texto Hinglish romanizado, directamente consumible por herramientas de analítica y búsqueda sobre conversaciones, sin necesidad de personal bilingüe para leer devanagari.
- Subtitulado automático de contenido audiovisual: series, entrevistas o vídeos con habla hindi-inglés mezclada se pueden transcribir y convertir en subtítulos, con la ventaja de que la salida romanizada es legible para audiencias que no leen devanagari.
- Inferencia en el navegador con Transformers.js: al ser un export ONNX, permite transcribir audio en el propio cliente, lo que evita subir grabaciones potencialmente sensibles a un servidor y reduce costes de infraestructura.
- Generación de corpus etiquetados para NLP en Hinglish: las transcripciones sirven como material de entrenamiento para modelos de análisis de sentimiento, clasificación de intenciones o extracción de entidades sobre texto romanizado, un recurso escaso en abierto.
- Minería de voz del cliente: transcripción masiva de encuestas y llamadas de soporte para extraer motivos de contacto recurrentes, con la ventaja de que el modelo está ajustado específicamente para el ruido y el acento típicos de esas grabaciones.
- Moderación y cumplimiento sobre grabaciones: transcripción de audio para revisiones de calidad, auditoría de guiones y detección de contenido no permitido en flujos de atención telefónica.
- Asistentes de voz e IVR: integración en sistemas de respuesta interactiva que necesitan reconocer hindi coloquial y devolver texto interpretable por reglas o por un clasificador posterior.
- Accesibilidad: generación de transcripciones en vivo o diferidas para personas con discapacidad auditiva en contextos donde se habla hindi con préstamos del inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo original en el model-index de la model card. Ninguno está verificado de forma independiente (`verified: false`). La métrica es WER (Word Error Rate); valores más bajos indican mejor rendimiento.

| Dataset | Configuracion | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| google/fleurs | hi_in | test | WER | 29,7869 | no |
| mozilla-foundation/common_voice_20_0 | hi | test | WER | 35,9587 | no |
| Indic-Voices | hi | test | WER | 47,638 | no |

Comparativa cualitativa publicada por el autor frente a Whisper Large V3 (ejemplos de la model card, no un benchmark formal):

| Audio de entrada | Salida de Whisper Large V3 | Salida de Whisper-Hindi2Hinglish-Apex |
|---|---|---|
| Muestra 1 | maynata pura, canta maynata | Mehnat to poora karte hain. |
| Muestra 2 | Where did they come from? | Haan vahi dekh aapko bataen na. |
| Muestra 3 | A Pantral Logan. | Aap pandrah log hain. |
| Muestra 4 | Thank you, Sanchez. | Thik hai saal ki. |

El autor declara además, sin cifras desglosadas en la información disponible, una mejora media de aproximadamente el 42 % frente al modelo preentrenado, una inferencia hasta 8 veces más rápida y la primera posición en la Speech-To-Text Arena en la métrica de preferencia de transcripción. No se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks de texto, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no hay datos confirmados en la información disponible. Como referencia de la clase Whisper Large con la que el autor compara el modelo, las estimaciones orientativas son de aproximadamente 7-8 GB en fp32, 3-4 GB en fp16 y 1,5-2 GB en cuantización de 8 bits, incluyendo activaciones para ventanas de 30 segundos. Estas cifras son estimaciones, no datos publicados para este repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32 (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti 16 GB); para fp16 o cuantizado, bastan 4 GB (RTX 3050, GTX 1660 Super, RTX 2060). En servidor, A100, H100, L40S o L4 no presentan problema de capacidad. El rendimiento real depende de las precisiones ONNX incluidas, que no se detallan.
- GPU de consumo: sí, cabe en GPU de consumo. En fp16 o cuantizado funciona en tarjetas de gama media con 4-6 GB, e incluso en CPU con latencia mayor. El repositorio de 14,0 GB implica un coste de descarga y almacenamiento considerable antes de poder ejecutarlo.
- Opciones de despliegue: Transformers.js (navegador con WebGPU o WASM, y Node.js), ONNX Runtime (Python, C++, C#) y Hugging Face Optimum para exportaciones ONNX. Para servidores de inferencia clásicos de la familia Whisper (por ejemplo vLLM) sería más directo partir del modelo original en PyTorch que de este export, ya que este artefacto está empaquetado específicamente para el ecosistema transformers.js.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real ni de factor de tiempo real (RTF) para esta conversión ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER declarado (FLEURS hi_in) | Licencia | Disponibilidad / formato |
|---|---|---|---|---|---|
| Whisper-Hindi2Hinglish-Apex-ONNX (este repositorio) | no disponible | 30 s por pasada (familia Whisper) | 29,7869 | apache-2.0 | ONNX, transformers.js |
| Oriserve/Whisper-Hindi2Hinglish-Apex (modelo original) | no disponible | 30 s por pasada (familia Whisper) | 29,7869 | apache-2.0 | PyTorch / transformers |
| Whisper Large V3 (referencia usada por el autor) | no disponible en la informacion proporcionada | 30 s por pasada | no disponible | no disponible en la informacion proporcionada | PyTorch, ONNX, CTranslate2 |

No se dispone en la información proporcionada de cifras de WER del modelo base preentrenado ni de alternativas comparables de ASR en hindi (por ejemplo sistemas entrenados específicamente para devanagari), por lo que la comparación cuantitativa queda limitada a los tres conjuntos de evaluación declarados por el autor para este modelo.

## Limitaciones y advertencias

- El WER declarado es alto en términos absolutos: 29,79 en FLEURS hi_in, 35,96 en Common Voice 20.0 y 47,64 en Indic-Voices. Para transcripción con fines legales, médicos o financieros requiere revisión humana.
- Las métricas están marcadas como no verificadas (`verified: false`) y proceden del propio autor del modelo original; no hay evaluación independiente publicada.
- La salida es Hinglish romanizado, no devanagari. Los pipelines posteriores que esperen texto en grafía hindi nativa necesitarán una etapa de conversión, y las referencias de evaluación en devanagari pueden penalizar el WER de forma que no refleje la utilidad práctica de la transcripción.
- Sesgo de dominio: el ajuste se realizó sobre aproximadamente 700 horas de audio hindi con acento indio y ruido. No hay datos sobre el comportamiento con otros acentos del hindi, con otras lenguas indias o con audio limpio de estudio.
- Riesgo de alucinación: los modelos de la familia Whisper tienden a generar texto plausible en segmentos con silencio, música o ruido extremo. No se documentan mecanismos de mitigación específicos en la model card.
- Idiomas: solo se declaran en e hi. No hay soporte documentado para traducción a otros idiomas ni para otras lenguas indias.
- Licencia Apache 2.0, que permite uso comercial y modificación siempre que se conserven los avisos de copyright y licencia. Conviene verificar también la licencia y las condiciones del modelo base Oriserve/Whisper-Hindi2Hinglish-Apex, que es el mismo tipo de licencia según la información disponible.
- La conversión a ONNX es automática, realizada por un Space de la comunidad, y no se documenta una validación manual de la equivalencia numérica respecto al modelo original en PyTorch.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no existe validación de la comunidad sobre este artefacto concreto.
- Tamano de descarga: 14,0 GB de repositorio, lo que puede ser un obstáculo para despliegues en dispositivos con almacenamiento limitado o conexiones lentas.
- No hay información sobre latencia, throughput ni consumo de memoria medidos, lo que dificulta dimensionar infraestructura de producción.

## Enlaces

- Modelo en HuggingFace (este repositorio): https://huggingface.co/onnx-community/Whisper-Hindi2Hinglish-Apex-ONNX
- Modelo base en PyTorch: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- Repositorio GitHub del autor: https://github.com/OriserveAI/Whisper-Hindi2Hinglish
- Speech-To-Text Arena de Oriserve: https://huggingface.co/spaces/Oriserve/ASR_arena
- Space de conversión a ONNX utilizado: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación del pipeline de reconocimiento automático del habla en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos corresponden a listados de tarjetas gráficas en sitios de segunda mano), por lo que todos los enlaces anteriores proceden de la model card y del repositorio de Hugging Face.
