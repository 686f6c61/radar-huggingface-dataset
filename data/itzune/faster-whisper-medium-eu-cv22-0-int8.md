# itzune/faster-whisper-medium-eu-cv22.0-int8

## Resumen

`faster-whisper-medium-eu-cv22.0-int8` es una conversión al formato CTranslate2 con cuantización int8 del modelo de reconocimiento automático del habla `zuazo/whisper-medium-eu-cv22.0`, un ajuste fino de OpenAI Whisper medium para euskera (código de idioma `eu`) entrenado sobre Common Voice 22.0. Lo publica el usuario `itzune` en Hugging Face y su propósito no es introducir mejoras de precisión, sino empaquetar los pesos existentes en un formato optimizado para inferencia eficiente con `faster-whisper` y con la aplicación Whisper de Home Assistant.

El modelo resuelve un problema de despliegue: Whisper medium original en formato Transformers es pesado para ejecutarse en CPU y en hardware doméstico. La conversión a CTranslate2 con cuantización int8 reduce el repositorio a unos 0,8 GB y permite transcripción en CPU con un consumo de memoria contenido, lo que lo hace viable en asistentes de voz locales como Home Assistant Assist sin depender de servicios en la nube.

Es relevante para desarrolladores que necesitan ASR en euskera de forma local y con licencia permisiva (MIT), en un ecosistema donde la mayoría de los modelos ASR de calidad cubren idiomas mayoritarios. La arquitectura subyacente es la de Whisper medium (transformer encoder-decoder), con 769 millones de parámetros en el modelo base; los pesos no se han modificado en esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), convertido a CTranslate2 |
| Parámetros totales | 769 M (heredados de Whisper medium) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper medium usa ventanas de audio de 30 s) |
| Tipos de cuantización | int8 (esta conversión); el formato CTranslate2 admite otras, no documentadas aquí |
| Idiomas soportados | euskera (`eu`) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo binario); repositorio de 0,8 GB |
| Modelo base | zuazo/whisper-medium-eu-cv22.0 (ajuste fino de openai/whisper-medium) |
| Datos de entrenamiento | Common Voice 22.0 (`eu`) |
| Librería | ctranslate2 / faster-whisper |
| Tamaño del repositorio | 0,8 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium de OpenAI: un transformer encoder-decoder con 769 millones de parámetros que procesa audio en ventanas de 30 segundos y genera transcripciones de forma autorregresiva. El ajuste fino para euskera lo realizó Xabier de Zuazo sobre Common Voice 22.0 en el idioma `eu`, partiendo de `openai/whisper-medium`. No se documentan en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; se trata de un ajuste supervisado estándar de ASR.

La contribución de este repositorio es exclusivamente de formato y cuantización: los pesos se convierten con `ct2-transformers-converter` a CTranslate2 y se cuantizan a int8, copiando además `tokenizer.json`, `preprocessor_config.json` y `generation_config.json`. No hay cambios en los pesos ni reentrenamiento. La innovación práctica es el rendimiento: el encoder más ligero que large-v3-turbo hace que sea más rápido en enunciados cortos, y la cuantización int8 mantiene bajo el uso de memoria en CPU, con ventaja adicional en CPUs con AVX2.

## Capacidades

- Transcripción de voz a texto (ASR) en euskera (`eu`).
- Detección de idioma integrada en Whisper, aunque el autor recomienda fijar `language="eu"` porque la detección automática es mucho más lenta.
- Segmentación con marcas de tiempo y probabilidad de idioma (`info.language_probability`).
- Decodificación con beam search configurable (`beam_size=5` en el ejemplo del autor).
- Ejecución en CPU con `compute_type="int8"` y en GPU si se configura el dispositivo correspondiente.
- Integración con Home Assistant mediante la app Whisper (modelo personalizado).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No soporta visión, audio generativo ni otras modalidades más allá de la transcripción.

## Casos de uso

- Asistente de voz local en Home Assistant: se configura la app Whisper con `custom_model: itzune/faster-whisper-medium-eu-cv22.0-int8` y `language: eu`, y el pipeline Assist transcribe las órdenes de voz en euskera en hardware doméstico sin enviar audio a la nube.
- Transcripción de reuniones y notas de voz en euskera: con `faster-whisper` en CPU se pueden procesar grabaciones por lotes y obtener segmentos con marcas de tiempo para generar actas o subtítulos.
- Subtitulado de vídeo en euskera: la salida segmentada con timestamps permite alinear subtítulos en herramientas de postproducción o pipelines de accesibilidad.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio en euskera para indexar y permitir búsqueda por texto en mediatecas.
- Prototipado de aplicaciones de voz en euskera: al ser un repo de 0,8 GB con licencia MIT, se puede integrar en entornos de desarrollo y CI sin coste de licencia ni dependencia de API externas.
- Investigación en ASR de lenguas minoritarias: sirve como punto de partida reproducible para comparar cuantizaciones y formatos de despliegue sobre el ajuste fino de Zuazo.
- Despliegue en dispositivos de borde: la cuantización int8 y el bajo uso de memoria permiten ejecutarlo en mini-PC o servidores domésticos con CPU, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al WER del modelo de origen (`zuazo/whisper-medium-eu-cv22.0`) sin reproducir la cifra, y no aporta métricas propias de la conversión int8. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0,8 GB en disco; en inferencia int8 el consumo de memoria es bajo y está pensado para ejecutarse en CPU, aunque no se publican cifras exactas de RAM en uso.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU. Cualquier GPU compatible con CTranslate2 puede usarse, pero no hay recomendaciones del autor.
- Cabe en GPU de consumo: sí, por tamaño (0,8 GB de pesos), aunque no se documentan pruebas en RTX 4090, RTX 3060 u otras.
- Despliegue: `faster-whisper` (Python) y la app Whisper de Home Assistant; también es compatible con cualquier runtime que cargue modelos CTranslate2.
- CPU: se recomienda AVX2, que según el autor es considerablemente más rápido.
- Latencia y throughput: no disponibles. El autor afirma que es más rápido que large-v3-turbo en enunciados cortos por tener un encoder más ligero, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| itzune/faster-whisper-medium-eu-cv22.0-int8 | 769 M | eu | CTranslate2 int8 | MIT | Esta ficha; conversión de zuazo/whisper-medium-eu-cv22.0 |
| zuazo/whisper-medium-eu-cv22.0 | 769 M | eu | Transformers (safetensors) | MIT | Modelo de origen; mismos pesos sin cuantizar |
| openai/whisper-medium | 769 M | multilingüe | Transformers | MIT | Base de OpenAI; sin ajuste específico para euskera |
| openai/whisper-large-v3-turbo | no disponible en la información | multilingüe | Transformers | MIT | Referenciado por el autor como más lento en enunciados cortos |

No se dispone de datos de WER comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato: no mejora la precisión respecto a `zuazo/whisper-medium-eu-cv22.0`; cualquier error del modelo de origen se mantiene.
- El modelo está especializado únicamente en euskera; no debe usarse para otros idiomas sin esperar degradación severa.
- La detección automática de idioma es mucho más lenta que fijar `language="eu"`; en producción conviene fijarlo explícitamente.
- Riesgo de alucinación típico de Whisper en audio con ruido, silencios largos o habla solapada; no se documentan mitigaciones específicas.
- No se documentan sesgos concretos, pero al entrenarse sobre Common Voice 22.0 hereda los sesgos de demografía, acento y calidad de grabación de ese corpus.
- La licencia es MIT, lo que permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio debe permanecer público si se usa con la app Whisper de Home Assistant, ya que esta no se autentica contra el Hub.
- No hay métricas publicadas de WER, latencia ni consumo de memoria para esta conversión int8, lo que dificulta estimar su calidad frente al modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/itzune/faster-whisper-medium-eu-cv22.0-int8
- Modelo base (ajuste fino en euskera): https://huggingface.co/zuazo/whisper-medium-eu-cv22.0
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-medium
- faster-whisper (SYSTRAN): https://github.com/SYSTRAN/faster-whisper
- Dataset Common Voice 22.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_22_0
