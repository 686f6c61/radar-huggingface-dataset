# bjnortier/coreai-whisper-large-v3-turbo-kv-float16

## Resumen

`coreai-whisper-large-v3-turbo-kv-float16` es una exportación del modelo de reconocimiento de voz automático (ASR) `whisper-large-v3-turbo` de OpenAI al formato Core AI de Apple, realizada por el usuario bjnortier. El objetivo es ejecutar transcripción de voz de alta calidad directamente en dispositivos Apple (macOS 27 e iOS 27 o posteriores) sin conexión a servidores, aprovechando el runtime Core AI y el Neural Engine de los chips de Apple.

A diferencia de los pesos PyTorch habituales, este repositorio contiene un único archivo comprimido (~1,49 GB) con un bundle de activos `.aimodel` que incluyen el encoder de audio, el decoder de texto con cache de atención cruzada empaquetada, el tokenizador y la configuración de generación. No es compatible con `transformers` ni con otras librerías estándar de Python; solo se puede invocar mediante las APIs Swift de Core AI (CirceKit o `CoreAISpeech` de apple/coreai-models).

La relevancia de este modelo radica en su capacidad para ofrecer ASR multilingüe (más de 100 idiomas) con baja latencia y privacidad total, al procesar el audio localmente. Es una alternativa práctica para desarrolladores que necesitan integrar transcripción en aplicaciones iOS/macOS sin depender de servicios en la nube. El modelo base, Whisper large-v3-turbo, es una versión optimizada de Whisper large-v3 con un decoder reducido (4 capas frente a 32), diseñado para lograr mayor velocidad con una degradación mínima en precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder/decoder (transformer) |
| Parametros totales | no disponible (el modelo base OpenAI whisper-large-v3-turbo tiene 809M) |
| Longitud de contexto | 30 segundos de audio (ventana del encoder); max target positions: 448 tokens |
| Tipos de cuantizacion | float16 (precisión del export Core AI) |
| Idiomas soportados | Multilingüe: más de 100 idiomas, incluye en, es, fr, de, it, pt, zh, ja, ko, ru, ar, hi, etc. |
| Licencia | MIT |
| Formato de pesos | .aimodel (bundle Core AI, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es una exportación directa de `openai/whisper-large-v3-turbo`, que mantiene la arquitectura original de Whisper: un encoder de audio basado en transformer que procesa ventanas de 30 segundos de audio (16 kHz mono) y un decoder autoregresivo que genera el texto transcrito. La configuración específica de este export incluye `d_model=1280`, 4 capas de decoder, 20 cabezas de atención, vocabulario de 51866 tokens y precisión float16 con cache de atención cruzada empaquetada para optimizar la inferencia en dispositivos Apple.

No se ha realizado ningún entrenamiento o fine-tuning adicional en este repositorio; únicamente se ha cambiado la serialización de los pesos al formato `.aimodel` de Core AI. El modelo original de OpenAI fue entrenado con un gran corpus de audio débilmente supervisado (680 000 horas) en múltiples idiomas y tareas, incluyendo transcripción, traducción y detección de idioma. Los detalles completos del entrenamiento están disponibles en la model card del modelo base.

## Capacidades

- Reconocimiento de voz automático (ASR) multilingüe con soporte para más de 100 idiomas.
- Transcripción de audio de hasta 30 segundos por ventana (el audio se rellena hasta la ventana completa).
- Generación de transcripción con o sin marcas de tiempo (configurable mediante `generation_config.json`).
- Ejecución 100 % on-device en dispositivos Apple con chip M-series o A-series, sin conexión a internet.
- Integración nativa con el runtime Core AI de Apple, optimizado para el Neural Engine.
- No incluye capacidades de tool calling, razonamiento o generación de texto libre; es exclusivamente un modelo de transcripción de voz.

## Casos de uso

- Transcripción de reuniones y notas de voz: una aplicación de productividad puede grabar audio y transcribirlo localmente en tiempo real, garantizando la privacidad de los datos al no enviarlos a la nube.
- Subtitulado automático de vídeos: los creadores de contenido pueden generar subtítulos para sus vídeos directamente en su Mac o iPhone, con soporte multilingüe y marcas de tiempo opcionales.
- Asistente de voz para comandos: integración en apps de domótica o asistentes personales que necesitan convertir voz en texto para ejecutar acciones, con baja latencia y sin dependencia de servicios externos.
- Accesibilidad auditiva: aplicaciones que convierten conversaciones en texto en tiempo real para personas con discapacidad auditiva, funcionando sin conexión en dispositivos móviles.
- Transcripción de entrevistas y podcasts: los periodistas pueden procesar grabaciones largas dividiéndolas en ventanas de 30 segundos y uniendo los resultados, manteniendo la precisión del modelo base.
- Procesamiento de audio en apps de salud o educación: por ejemplo, transcribir sesiones de terapia o clases para generar resúmenes automáticos, con la ventaja de que los datos sensibles permanecen en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este export Core AI en la información disponible. El modelo base OpenAI `whisper-large-v3-turbo` tiene métricas documentadas en su model card oficial (consulte el enlace en la sección de enlaces), donde se reportan tasas de error (WER) para distintos idiomas y conjuntos de datos. Dado que este repositorio solo cambia el formato de serialización, se espera que el rendimiento en términos de precisión sea equivalente al del modelo original, aunque la latencia y el throughput dependen del hardware Apple concreto y no se han proporcionado mediciones.

## Requisitos de hardware

- Dispositivos Apple con macOS 27 o iOS 27 (o versiones posteriores) que soporten el runtime Core AI.
- Compatible con chips Apple Silicon (M1, M2, M3, etc.) y procesadores A-series con Neural Engine.
- Tamaño del bundle: ~1,49 GB en disco (archivo comprimido) y ~1,5 GB descomprimido.
- Memoria RAM: no especificada, pero al ser un modelo de ~800M parámetros en float16, se estima que requiere al menos 2 GB de memoria disponible para la inferencia.
- No requiere GPU dedicada (NVIDIA/AMD); utiliza el Neural Engine o CPU de Apple.
- Opciones de despliegue: integración mediante CirceKit (librería Swift de bjnortier) o directamente con `CoreAISpeech` del repositorio apple/coreai-models.
- No es posible ejecutarlo en servidores Linux o GPUs convencionales; está restringido al ecosistema Apple.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bjnortier/coreai-whisper-large-v3-turbo-kv-float16 | Core AI (.aimodel) | ~809M (base) | 30 s audio / 448 tokens | MIT | Solo Apple (macOS/iOS 27+) |
| CarstenL/whisper-large-v3-turbo-coreai | Core AI | ~809M (base) | 30 s audio | MIT | Solo Apple (versión anterior) |
| openai/whisper-large-v3-turbo (original) | PyTorch / safetensors | 809M | 30 s audio | MIT | Multiplataforma (Python, GPU) |

La diferencia principal entre este export y el modelo original es el formato de pesos y el entorno de ejecución. El export Core AI está optimizado para dispositivos Apple, mientras que el modelo original se puede ejecutar en cualquier plataforma con PyTorch o librerías como whisper.cpp. El export de CarstenL es similar pero sin el empaquetado de KV cache en float16, lo que puede afectar ligeramente a la memoria y la velocidad.

## Limitaciones y advertencias

- Solo funciona en dispositivos Apple con macOS 27 o iOS 27 o posterior; no es compatible con versiones anteriores ni con otras plataformas.
- Los pesos no son PyTorch; no se pueden cargar con `transformers`, `whisper` u otras librerías estándar. El uso requiere las APIs Swift de Core AI.
- La ventana de audio está fijada a 30 segundos; para audios más largos es necesario segmentar y concatenar resultados, lo que puede introducir errores en los límites.
- La precisión float16 puede producir diferencias mínimas en la transcripción respecto al modelo en float32, aunque en la práctica suelen ser despreciables.
- El rendimiento varía según el idioma; el modelo base tiene tasas de error más altas en idiomas poco representados en el entrenamiento.
- No se han publicado evaluaciones independientes de este export; los resultados pueden diferir del modelo base debido a optimizaciones del runtime Core AI.
- La licencia MIT permite uso comercial, pero se debe conservar la atribución a OpenAI y a este autor según los términos de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bjnortier/coreai-whisper-large-v3-turbo-kv-float16
- Modelo base OpenAI whisper-large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Repositorio apple/coreai-models (runtime y utilidades): https://github.com/apple/coreai-models
- CirceKit (librería Swift para integración): https://github.com/bjnortier
