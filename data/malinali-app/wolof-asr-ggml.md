# malinali-app/wolof-asr-ggml

## Resumen
malinali-app/wolof-asr-ggml es una conversión al formato GGML con cuantización q8_0 del modelo dofbi/wolof-asr, un ajuste fino de openai/whisper-small para reconocimiento automático del habla (ASR) en wolof. Lo publica malinali-app y está pensado para inferencia en dispositivo mediante whisper.cpp y la aplicación Malinali. El problema que resuelve es la transcripción de voz en wolof, un idioma de bajos recursos, sin necesidad de conexión a internet ni de infraestructura de servidor.

El modelo hereda la arquitectura transformer encoder-decoder de Whisper-small, con aproximadamente 244 millones de parámetros y una ventana de procesamiento de audio de 30 segundos. Al estar cuantizado a 8 bits y en formato GGML, el repositorio ocupa solo 0,3 GB, lo que permite ejecutarlo en CPU y dispositivos con recursos limitados, como móviles o Raspberry Pi.

La relevancia actual radica en la combinación de un modelo especializado en una lengua minoritaria con un formato optimizado para despliegue local, lo que facilita aplicaciones de accesibilidad, documentación lingüística y asistentes de voz sin dependencia de la nube. La licencia Apache 2.0 del repositorio permite uso comercial, aunque se deben verificar las condiciones del modelo base y del ajuste original.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | ~244 millones (Whisper-small) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana estándar de Whisper) |
| Tipos de cuantización | q8_0 (GGML) |
| Idiomas soportados | Wolof (wo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`ggml-model-q8_0.bin`) |

## Arquitectura y entrenamiento
Este repositorio no contiene un modelo entrenado desde cero, sino una conversión a GGML q8_0 del modelo dofbi/wolof-asr, que a su vez es un ajuste fino de openai/whisper-small. Whisper-small es un transformer encoder-decoder con alrededor de 244 millones de parámetros, diseñado para procesar ventanas de audio de 30 segundos y generar transcripciones o traducciones. La innovación principal de esta ficha es la cuantización a 8 bits, que reduce el tamaño y permite inferencia eficiente en CPU a través de whisper.cpp.

No se dispone de información sobre el dataset de entrenamiento del ajuste fino, el número de tokens de audio utilizados, la composición de los datos ni si se emplearon técnicas como RLHF o DPO. La model card indica que el paquete es para transcripción (no para traducción al inglés), que no incluye el token `<|wo|>` y que la aplicación Malinali utiliza `whisperLang=auto` para la detección automática del idioma.

## Capacidades
- Transcripción de audio en wolof a texto.
- Ejecución en dispositivo (on-device) mediante whisper.cpp, sin necesidad de conexión a internet.
- Funcionamiento sin token de idioma explícito `<|wo|>`; depende de la detección automática de idioma (`whisperLang=auto`).
- No realiza traducción al inglés ni a otros idiomas; únicamente transcripción.
- No soporta tool calling ni function calling.
- No está diseñado para agentes, razonamiento multi-paso ni tareas de texto general.
- Capacidad monolingüe: solo wolof.
- Compatible con el ecosistema Malinali para aplicaciones de voz.

## Casos de uso
- Transcripción offline en la aplicación Malinali: el modelo permite convertir voz a texto en wolof directamente en el dispositivo, sin enviar datos a servidores externos, lo que preserva la privacidad y funciona en zonas sin conectividad.
- Documentación y preservación del wolof: investigadores y lingüistas pueden transcribir grabaciones de campo o entrevistas para crear corpus escritos en esta lengua de bajos recursos.
- Subtitulado automático de vídeos en wolof: integrado en pipelines de edición, el modelo genera subtítulos para contenido audiovisual en wolof, facilitando la accesibilidad.
- Asistentes de voz para hablantes de wolof: al ejecutarse en CPU y con un tamaño reducido, puede incorporarse en aplicaciones móviles o dispositivos embebidos para comandos de voz y dictado.
- Accesibilidad para personas sordas: transcripción en tiempo real o diferido de conversaciones y reuniones en wolof, siempre que se disponga de una fuente de audio.
- Investigación en ASR de bajos recursos: sirve como punto de partida para experimentos de ajuste fino, cuantización o comparación con otros modelos sobre wolof.
- Despliegue en dispositivos de bajo consumo: gracias a sus 0,3 GB en q8_0, puede ejecutarse en Raspberry Pi, móviles Android o navegadores mediante WebAssembly con whisper.cpp.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Tamaño del repositorio: 0,3 GB (archivo GGML q8_0).
- VRAM estimada para inferencia: no requiere GPU; en CPU utiliza aproximadamente 0,3-0,5 GB de RAM.
- GPU recomendadas: no es necesaria ninguna GPU dedicada. Cualquier GPU con más de 1 GB de VRAM podría usarse, pero el modelo está optimizado para CPU.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU integrada o dedicada moderna, aunque su uso principal es en CPU.
- Opciones de despliegue: whisper.cpp y la aplicación Malinali. No se indica compatibilidad con vLLM, TGI, Ollama u otros servidores de inferencia para ASR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| malinali-app/wolof-asr-ggml | ~244 M | 30 s audio | Wolof | Apache 2.0 | GGML q8_0 | HuggingFace |
| dofbi/wolof-asr | ~244 M | 30 s audio | Wolof | no disponible | no disponible (probablemente PyTorch/safetensors) | HuggingFace |
| openai/whisper-small | 244 M | 30 s audio | 99 idiomas | MIT | PyTorch, safetensors, etc. | HuggingFace, OpenAI |
| openai/whisper-tiny | 39 M | 30 s audio | 99 idiomas | MIT | PyTorch, safetensors, etc. | HuggingFace, OpenAI |

El modelo aquí descrito se diferencia de openai/whisper-small en que está especializado en wolof y cuantizado para ejecución local, mientras que whisper-small es multilingüe y de mayor tamaño en disco. Frente a whisper-tiny, ofrece mayor precisión previsiblemente por su mayor número de parámetros, aunque no hay benchmarks que lo confirmen. La comparación con dofbi/wolof-asr es directa: este último es el modelo original sin cuantizar, mientras que la versión GGML está optimizada para CPU.

## Limitaciones y advertencias
- Solo soporta wolof; no reconoce otros idiomas ni realiza traducción.
- Al no incluir el token `<|wo|>`, la detección automática de idioma puede fallar en audios con ruido, música o mezcla de lenguas.
- Riesgo de alucinación típico de los modelos Whisper, especialmente en segmentos de silencio o audio poco claro.
- La cuantización q8_0 puede degradar ligeramente la precisión respecto al modelo original en FP32 o FP16.
- No se han publicado benchmarks que validen su rendimiento en wolof, por lo que se desconoce su tasa de error real.
- La licencia Apache 2.0 del repositorio permite uso comercial, pero se debe verificar la licencia del modelo base openai/whisper-small (MIT) y del ajuste original dofbi/wolof-asr, cuyo licenciamiento no se especifica.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.
- La fecha de creación indicada (2026-10-06) es futura, lo que puede deberse a un error de metadatos o a un placeholder.
- No se proporcionan detalles sobre sesgos del modelo, composición del dataset de entrenamiento ni medidas de mitigación.

## Enlaces
- [malinali-app/wolof-asr-ggml en HuggingFace](https://huggingface.co/malinali-app/wolof-asr-ggml)
- [dofbi/wolof-asr (modelo original)](https://huggingface.co/dofbi/wolof-asr)
- [openai/whisper-small (modelo base)](https://huggingface.co/openai/whisper-small)
- [Repositorio whisper.cpp](https://github.com/ggml-org/whisper.cpp)
