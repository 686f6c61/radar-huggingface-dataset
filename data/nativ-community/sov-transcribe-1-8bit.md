# nativ-community/SOV-Transcribe-1-8bit

## Resumen

SOV-Transcribe-1-8bit es una conversión cuantizada a 8 bits del modelo de reconocimiento automático del habla SOV-Transcribe-1 desarrollado por Salesforce Sovereign Intelligence. Combina un codificador de audio basado en Whisper large-v3 con un decodificador de mezcla de expertos (MoE) derivado de Gemma, lo que da lugar a un modelo de 26.600 millones de parámetros totales con 4.600 millones activos. Esta versión, publicada por la comunidad nativ-community, está pensada para ejecutarse en Apple Silicon mediante la librería mlx-audio.

El modelo resuelve la transcripción offline de audio con instrucciones en lenguaje natural, pistas de idioma y vocabulario contextual (hotwords). Soporta grabaciones de hasta 30 minutos y siete idiomas: inglés, francés, alemán, español, italiano, portugués y neerlandés. La innovación principal frente a un Whisper convencional es el decodificador generativo, que permite controlar el formato de salida y adaptar la transcripción al dominio mediante prompts.

Es relevante ahora porque demuestra la viabilidad de combinar un encoder de audio probado con un decoder MoE generativo para tareas ASR, y porque esta conversión concreta reduce el peso del repositorio a 28,2 GB manteniendo el encoder en BF16 y los routers en FP32, lo que facilita su despliegue local en hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper large-v3 + decoder MoE tipo Gemma |
| Parametros totales | 25.892.458.526 (~26,6B) |
| Parametros activos | 4,6B |
| Longitud de contexto | no disponible (audio de entrada de hasta 30 minutos) |
| Tipos de cuantizacion | 8-bit affine (group size 64) en decoder; BF16 en encoder y proyector; FP32 en routers MoE |
| Idiomas soportados | en, fr, de, es, it, pt, nl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es un sistema híbrido encoder-decoder. El encoder procesa la señal de audio (remuestreada a 16 kHz) y proviene de Whisper large-v3, mientras que el decoder es un transformer de mezcla de expertos con 26,6B parámetros totales y 4,6B activos por token, basado en la familia Gemma. El proyector de audio conecta ambos componentes. En esta conversión MLX, el decoder (embeddings, atención, MLPs densos y expertos) se cuantiza a 8 bits con tamaño de grupo 64, el encoder de audio y el proyector de audio se mantienen en BF16 y los routers MoE en FP32 para preservar la estabilidad del enrutamiento.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base fue entrenado por Salesforce Sovereign Intelligence; esta versión es únicamente una conversión de pesos desde la revisión `505d8fae243924c0d8acdc622f7f0abab344eba3`. La validación publicada por el autor de la conversión se limita a siete casos de prueba (dos voces en inglés, francés, un pasaje adicional en inglés, una grabación de 66,92 segundos con 47 segundos de silencio intermedio, y una petición con instrucciones y hotwords), con coincidencia total de palabras tras normalizar puntuación.

## Capacidades

- Transcripción de voz a texto offline en siete idiomas (en, fr, de, es, it, pt, nl).
- Instrucciones en lenguaje natural para controlar el formato de salida (puntuación, mayúsculas, estilo escrito).
- Pistas de idioma para forzar o guiar el idioma de la transcripción.
- Vocabulario contextual mediante `hotwords` para mejorar el reconocimiento de términos específicos (nombres propios, marcas, jerga técnica).
- Manejo de grabaciones largas de hasta 30 minutos, con dos estrategias de prefill (chunked y single) que producen transcripciones idénticas según la validación del autor.
- Salida con metadatos: recuento de tokens, estadísticas de tiempo y `finish_reason` (`stop` o `length`).
- Procesamiento de audio a 16 kHz; las matrices de forma de onda deben ser mono y estar ya remuestreadas.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones: el modelo acepta grabaciones de hasta 30 minutos y permite prompts con instrucciones de formato, por lo que puede generar actas legibles con puntuación y mayúsculas en una sola pasada.
- Subtitulado multilingüe: con soporte para siete idiomas europeos y pistas de idioma, se puede usar para generar subtítulos en inglés, francés, alemán, español, italiano, portugués y neerlandés desde una misma instalación.
- Dictado técnico con vocabulario especializado: el uso de `hotwords` permite incluir nombres de productos, APIs o terminología de dominio para reducir errores en transcripciones de contenido técnico.
- Procesamiento local en Apple Silicon: al estar empaquetado para mlx-audio, es adecuado para flujos de transcripción en portátiles y equipos de sobremesa con chips Apple, sin depender de servicios en la nube.
- Anonimización y cumplimiento: al ejecutarse offline, permite transcribir audio sensible (sanitario, legal, RR. HH.) sin enviar datos a terceros.
- Generación de documentación a partir de entrevistas: con instrucciones en lenguaje natural se puede pedir un formato escrito concreto, útil para convertir entrevistas o notas de voz en texto estructurado.
- Investigación en ASR: sirve como base para experimentar con decodificadores generativos MoE en tareas de reconocimiento de voz y para comparar estrategias de prefill en audio largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es un conjunto de siete casos de prueba (smoke tests) descrito en la model card, que el propio autor advierte que no constituye un benchmark general de reconocimiento.

## Requisitos de hardware

- El repositorio ocupa 28,2 GB, por lo que se necesita al menos ese espacio libre en disco para descargar los pesos.
- La inferencia está pensada para Apple Silicon mediante mlx-audio; no se documentan requisitos de VRAM para GPU NVIDIA.
- Al mantener el encoder en BF16 y los routers en FP32, la huella de memoria supera la de una cuantización uniforme a 8 bits; se recomienda un equipo con memoria unificada amplia (orientativamente 32 GB o más) para cargar el modelo completo.
- No cabe en GPU de consumo con 8-16 GB de VRAM en su formato actual.
- Opciones de despliegue: mlx-audio (Python y CLI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SOV-Transcribe-1-8bit | 26,6B totales / 4,6B activos | hasta 30 min | 7 | Apache 2.0 | safetensors MLX |
| Whisper large-v3 | ~1,55B | 30 s por ventana | ~99 | MIT (según distribución) | safetensors, GGUF, etc. |
| SOV-Transcribe-1 (original) | 26,6B totales / 4,6B activos | hasta 30 min | 7 | Apache 2.0 | safetensors |

La comparación con Whisper large-v3 se basa en que SOV-Transcribe-1 reutiliza su encoder; no se dispone de datos de rendimiento comparativo en la información proporcionada. No se han identificado otros modelos comparables con datos verificables en la información disponible.

## Limitaciones y advertencias

- La validación publicada es muy reducida (siete casos) y el propio autor indica que no es un benchmark general; el rendimiento real en producción no está caracterizado.
- Solo cubre siete idiomas; no hay soporte documentado para otras lenguas.
- El audio debe entregarse a 16 kHz y en mono; el modelo no realiza el remuestreo de matrices de forma de onda (solo de ficheros).
- Riesgo de alucinación inherente a los decodificadores generativos: el decoder puede generar texto no presente en el audio, especialmente con audio ruidoso o silencios largos.
- Si la decodificación alcanza `max_tokens`, la salida se trunca (`finish_reason: length`); hay que ajustar el límite para audios largos.
- La cuantización a 8 bits puede degradar ligeramente la precisión frente al modelo original en BF16; no se han publicado métricas de esa degradación.
- Dependencia de una versión específica de mlx-audio con soporte para SOV-Transcribe-1; la compatibilidad con otras herramientas no está garantizada.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes subyacentes (Whisper, Gemma) antes de desplegar en producción.
- No se documentan sesgos específicos; al ser un modelo multilingüe entrenado por un tercero, pueden aparecer sesgos de dominio y de acento no caracterizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/SOV-Transcribe-1-8bit
- Modelo base: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1
- Revisión del modelo base usada en la conversión: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1/tree/505d8fae243924c0d8acdc622f7f0abab344eba3
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- Licencia Apache 2.0: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1#license
