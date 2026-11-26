# handy-computer/sava-gguf

## Resumen

SAVA (Semantic Acoustic Voice Activity) es un modelo de detección de actividad de voz y de fin de turno conversacional desarrollado por Inworld. No es un modelo de transcripción ni un LLM: recibe audio mono a 16 kHz y emite, cada 40 ms, dos probabilidades por frame: si el audio contiene habla y si el hablante ha terminado su turno. Con 25,5 millones de parámetros, está diseñado para ejecutarse en CPU y para integrarse en pipelines de voz en tiempo real (agentes conversacionales, asistentes telefónicos, interfaces de voz).

La versión aquí descrita, `handy-computer/sava-gguf`, es una conversión a formato GGUF del modelo original `inworld/sava` para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp), con cuantizaciones F32, F16 y Q8_0. La conversión preserva la precisión del modelo de referencia en PyTorch (93,36 % en el conjunto de test de Pipecat Smart Turn v3.2) y permite ejecutar el modelo en CPU con un factor de tiempo real (RTF) muy bajo.

Su relevancia actual radica en que resuelve un problema clásico de los sistemas de voz: distinguir cuándo el usuario ha terminado de hablar frente a pausas, ruidos, risas o toses. Al combinar contexto acústico y semántico en un único modelo pequeño y con licencia Apache-2.0, ofrece una alternativa abierta a los detectores de turno propietarios integrados en plataformas comerciales de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para clasificación de frames de audio (detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 25.708.118 (25,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en streaming por frames de 40 ms) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Cualquier idioma (el modelo no depende del idioma; no realiza transcripción ni detección de idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp); pesos originales en PyTorch (safetensors) en el modelo base |

## Arquitectura y entrenamiento

SAVA es una red neuronal pequeña (25,5 M de parámetros) que procesa audio mono a 16 kHz en frames de 40 ms. Su red compartida combina información acústica y contexto de frase para distinguir habla de ruidos no vocales como toses, risas, música o teclados. Emite dos probabilidades por frame: `speech` (con un lookahead de 120 ms) y `turn` (sin lookahead). El modelo responde a cualquier voz, no identifica hablantes concretos y deja la gestión de interrupciones y backchannels a la política de diálogo de la aplicación.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del modelo base indica que está pensado para ejecutarse en PyTorch sobre CPU o dispositivo explícito, y que la política de referencia para convertir las probabilidades en segmentos está documentada en el repositorio de Inworld. La conversión GGUF se validó contra la referencia PyTorch en fp32 en el commit `1dd8ab19` de transcribe.cpp, con una diferencia máxima de probabilidad de 1,1e-05 en F32 y 0,17 en Q8_0.

## Capacidades

- Detección de actividad de voz (VAD): probabilidad de que un frame de 40 ms contenga habla.
- Detección de fin de turno (end-of-turn): probabilidad de que el hablante haya terminado su turno, sin lookahead.
- Procesamiento en streaming: pensado para audio en vivo, con alimentación frame a frame mediante `transcribe_turn_stream_feed`.
- Discriminación de ruidos no vocales: toses, risas, música y teclados frente a habla real.
- Independencia de idioma: funciona con cualquier voz sin necesidad de transcripción.
- No realiza transcripción, traducción ni detección de idioma.
- No identifica hablantes ni separa voces.
- No incluye tool calling, agentes ni razonamiento multi-paso (no es un LLM).

## Casos de uso

- Agentes conversacionales por voz: SAVA abre un turno cuando empieza el habla y lo cierra cuando la frase está completa, lo que permite responder con baja latencia en asistentes telefónicos y chatbots de voz.
- Atención al cliente automatizada: integrado en un pipeline de ASR + LLM + TTS, reduce las respuestas prematuras causadas por pausas naturales del hablante, gracias a su detección de fin de turno cada 40 ms.
- Sistemas de voz en tiempo real con CPU: con un RTF de 27,86 en un Ryzen 4750U y 46,61 en un Apple M1, puede ejecutarse en servidores sin GPU o en el propio dispositivo del usuario.
- Filtrado de audio en reuniones y transcripción: la probabilidad de habla permite descartar toses, risas y teclados antes de enviar audio al motor de transcripción, ahorrando cómputo y reduciendo errores.
- Interfaces de voz embebidas: al ocupar 28 MB en Q8_0 y ejecutarse en CPU, cabe en dispositivos con recursos limitados como raspberries o terminales de atención presencial.
- Investigación en diálogo conversacional: sirve como componente de referencia para evaluar políticas de turn-taking y para comparar detectores de fin de turno con licencia abierta.
- Moderación de audio en directo: la detección de habla frente a música o ruido permite segmentar emisiones y activar solo cuando hay voz humana.

## Benchmarks y rendimiento

Resultados en el conjunto de test completo de Pipecat Smart Turn v3.2 (31.527 clips), con un clip considerado completo cuando la probabilidad de turno del último frame supera 0,5:

| GGUF | Precision (IC 95%) | Falsos positivos | Falsos negativos | AUC | Misma decision que la referencia | Diferencia maxima de p |
|---|---:|---:|---:|---:|---:|---:|
| F32 | 93,36% (93,08-93,64) | 3,58% | 3,06% | 0,97946 | 31.527 / 31.527 | 1,1e-05 |
| F16 | 93,36% (93,08-93,64) | 3,58% | 3,06% | 0,97946 | 31.527 / 31.527 | 1,2e-05 |
| Q8_0 | 93,36% (93,08-93,63) | 3,60% | 3,03% | 0,97935 | 31.451 / 31.527 | 0,17 |

Referencia PyTorch de Inworld en fp32 sobre los mismos clips: 93,36% de precisión y AUC 0,97946 (Inworld publica 93,35% y 0,97946). Rendimiento en CPU: RTF de 46,61 en Apple M1 y 27,86 en Ryzen 4750U.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el backend por defecto (CPU); en GPU, el modelo ocupa entre 28 MB (Q8_0) y 103 MB (F32).
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch puede ejecutar el modelo base, aunque el backend por defecto es CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y API `transcribe_turn_stream_feed`), PyTorch con el paquete `inworld-sava` (Python 3.10+).
- Latencia y throughput: RTF de 46,61 en Apple M1 (CPU) y 27,86 en Ryzen 4750U (CPU); el modelo emite una probabilidad cada 40 ms y la probabilidad de habla tiene un lookahead de 120 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Precision (Smart Turn v3.2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAVA (este) | 25,5 M | frames de 40 ms en streaming | 93,36% | Apache-2.0 | GGUF en HF, PyTorch en GitHub |
| Pipecat Smart Turn v3.2 | no disponible | no disponible | referencia del benchmark | no disponible | no disponible |
| Detectores VAD clasicos (p. ej. Silero VAD) | no disponible | frames en streaming | no disponible | no disponible | no disponible |

No se dispone de datos comparativos suficientes en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo de transcripción: no genera texto, no traduce y no detecta idioma.
- No identifica hablantes ni separa voces; responde a cualquier voz presente en el audio.
- La gestión de interrupciones y backchannels queda fuera del modelo y debe implementarla la política de diálogo de la aplicación.
- El umbral de decisión por defecto de la API es 0,9, mientras que el benchmark usa 0,5; los resultados pueden variar según el umbral elegido.
- Riesgo de falsos positivos (3,58-3,60%) y falsos negativos (3,03-3,06%) en el conjunto de test; en producción puede haber deriva con dominios de audio distintos.
- No se han publicado datos sobre sesgos por acento, género, edad o ruido de fondo en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base para términos completos.
- La cuantización Q8_0 introduce una diferencia máxima de probabilidad de 0,17 frente a la referencia, lo que puede cambiar la decisión en un pequeño porcentaje de clips (76 de 31.527).

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/handy-computer/sava-gguf)
- [Modelo base inworld/sava](https://huggingface.co/inworld/sava)
- [Commit del modelo base utilizado](https://huggingface.co/inworld/sava/commit/1beae7c)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Documentación del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/sava.md)
- [Documentación de detección de turno en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/turn.md)
- [Repositorio GitHub de Inworld SAVA](https://github.com/inworld-ai/sava)
- [Política de referencia de turnos](https://github.com/inworld-ai/sava/blob/main/docs/USAGE.md)
- [Guía de configuración para agentes](https://github.com/inworld-ai/sava/blob/main/AGENTS.md)
