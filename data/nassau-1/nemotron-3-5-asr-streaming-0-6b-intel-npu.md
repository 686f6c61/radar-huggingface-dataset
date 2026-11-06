# Nassau-1/nemotron-3.5-asr-streaming-0.6b-intel-npu

## Resumen

Nemotron 3.5 ASR Streaming 0.6B — Intel NPU conversion es una conversión del modelo de reconocimiento automático del habla (ASR) Nemotron 3.5 ASR Streaming 0.6B de NVIDIA, publicada por el usuario Nassau-1 con el objetivo de ejecutarlo íntegramente sobre la NPU integrada de los procesadores Intel Core Ultra. No se trata de un modelo entrenado desde cero ni de un ajuste fino: los pesos provienen de la revisión `ea30d66debe3740a08b573244286791d423d6b3e` del repositorio oficial de NVIDIA y se han exportado a cinco grafos estáticos de OpenVINO (subsampler inicial, subsampler de continuación, encoder de streaming, predictor RNNT y joint), sin cuantización INT8 y conservando la precisión FP32 del export original.

El modelo resuelve el problema de la transcripción de voz en local, sin GPU ni servicios en la nube, sobre hardware de consumo. Su arquitectura es un sistema RNNT (Recurrent Neural Network Transducer) de tipo streaming, con estados de atención, convolución y recurrencia explícitos que persisten entre fragmentos de audio dentro de una misma petición y se reinician entre peticiones. El paquete ocupa 2,6 GB e incluye los grafos portables, el tokenizador y las constantes necesarias para la inferencia.

La relevancia de esta ficha es doble: por un lado, documenta una conversión no oficial (el autor advierte explícitamente de que no es un lanzamiento de NVIDIA ni de Intel) que demuestra la viabilidad de ejecutar un ASR de streaming sobre la NPU de un Core Ultra 7 355; por otro, sirve como referencia de las limitaciones prácticas de este tipo de despliegues, ya que requiere código de runtime y exportación personalizado y no es compatible con `AutoModel` ni con los checkpoints estándar de Optimum.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (transducer) de streaming con encoder, predictor y joint; exportada a cinco grafos estáticos de OpenVINO |
| Parametros totales | 0,6 B (aproximado, según el nombre del modelo; no se detalla el desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la petición máxima de audio es de 600 segundos y las entradas más largas se rechazan sin truncado silencioso |
| Tipos de cuantizacion | FP32 en el export; la precisión de ejecución la decide OpenVINO y el plugin de Intel NPU (no se publica una variante INT8) |
| Idiomas soportados | francés (fr), inglés (en) y habla mixta |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Grafos OpenVINO IR portables (no safetensors ni GGUF); tokenizador y constantes adjuntos |

## Arquitectura y entrenamiento

El modelo es un RNNT de streaming: un encoder transforma el audio en representaciones latentes, un predictor autorregresivo modela la secuencia de tokens y un joint combina ambas salidas para producir la transcripción. La conversión descompone el sistema en cinco grafos estáticos de OpenVINO —subsampler inicial, subsampler de continuación, encoder de streaming, predictor RNNT y joint— cuyos estados de atención, convolución y recurrencia son explícitos y se mantienen entre fragmentos dentro de una misma petición. El export guarda pesos FP32; no se ha aplicado cuantización INT8. La compilación para el dispositivo y las decisiones de precisión de ejecución recaen en OpenVINO y en el plugin de Intel NPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo original de NVIDIA utilizó RLHF o DPO. El autor de la conversión indica explícitamente que no ha habido ajuste fino ni entrenamiento en el dominio financiero: los pesos son los preentrenados de NVIDIA, y el glosario financiero mencionado en la model card pertenece al posprocesado de la aplicación Handy, no a los pesos del modelo. La innovación técnica destacable es la ejecución íntegra de los cinco grafos neuronales en la NPU, con la preparación de audio, la gestión de tokens y la lógica de aplicación en CPU, sin fallback silencioso a GPU o CPU.

## Capacidades

- Reconocimiento automático del habla en francés, inglés y habla mixta.
- Transcripción en modo streaming por fragmentos, con estados persistentes dentro de una petición y reinicio entre peticiones.
- Procesamiento de grabaciones de hasta 600 segundos; las entradas más largas se rechazan explícitamente.
- Protocolo de entrada por stdin con PCM16 mono a 16 kHz, signed little-endian, hasta EOF, con salida de texto UTF-8 final.
- Protocolo alternativo enmarcado de float32 para el worker de Handy.
- Ejecución completa de los grafos neuronales en la NPU de Intel, sin uso de GPU.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Dictado local en escritorio: el modelo se integra en la aplicación Handy para grabar una frase o un párrafo y insertar el texto transcrito, aprovechando que toda la inferencia ocurre en la NPU y no requiere conexión ni GPU dedicada.
- Transcripción de reuniones y notas de voz: con un límite de 600 segundos por petición, permite procesar grabaciones de hasta diez minutos en un equipo de sobremesa con Core Ultra, con un coste medido de unos 10-11 segundos para una grabación sintética de diez minutos.
- Subtitulado diferido de contenido en francés e inglés: el soporte de habla mixta facilita la transcripción de material bilingüe, aunque el modo es de grabar y luego insertar, no de subtítulos en vivo.
- Asistentes de voz sin conexión: al ejecutarse en la NPU integrada, encaja en aplicaciones de privacidad estricta donde el audio no puede salir del dispositivo, como entornos sanitarios o legales.
- Automatización de flujos documentales: la salida de texto UTF-8 por stdin facilita encadenar la transcripción con pipelines de posprocesado (por ejemplo, el glosario financiero de Handy) para generar actas o resúmenes.
- Evaluación de hardware de IA en el borde: sirve como banco de pruebas para medir el rendimiento real de la NPU de Intel en cargas ASR de streaming y comparar con alternativas en CPU o GPU de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. El autor indica explícitamente que no se ha establecido un WER representativo en el dominio financiero y que las mediciones son observaciones de una sola máquina, no benchmarks generales.

Las únicas mediciones publicadas son funcionales y de latencia, sobre un Intel Core Ultra 7 355 con Windows 11 25H2 y OpenVINO 2026.2.1:

| Medicion | Valor |
|---|---|
| Preparación en frío | ~40 s |
| Compilación/carga con caché | ~0,5 s (antes del preflight del driver gestionado) |
| Procesamiento de grabación sintética de 10 minutos | ~10-11 s |
| Preflight del driver gestionado al arrancar el worker | ~3 s adicionales |
| Validación FP32 (2026-11-02) | Francés, inglés, mixto y fixture de 39,8 s coinciden con los tokens de referencia |
| Fixture de 600 s | 1.239 palabras coincidentes; diferencia L2 relativa máxima por grupo 2,3724 %; L2 global 0,5691 % |
| Procesamiento del fixture de 600 s | 10,0 s |

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en la NPU integrada, no en memoria de GPU. El paquete del repositorio ocupa 2,6 GB.
- GPU recomendadas: ninguna; el modelo está diseñado para la NPU de Intel y no selecciona fallback a GPU o CPU de forma silenciosa.
- Hardware validado: Intel Core Ultra 7 355 con Windows 11 25H2, driver de Intel NPU 32.0.100.5540 y OpenVINO 2026.2.1.
- Cabe en hardware de consumo: sí, en equipos con NPU Intel Core Ultra; no se ha validado en otras plataformas.
- Opciones de despliegue: runtime personalizado del repositorio `Nassau-1/handy-core-ultra-7-355-npu` (rama `3fcb6b14e507b5a21c6e15c3df21da820ec0a251`, directorio `experiments/nemotron_npu`), invocado como `runtime.py --artifact ARTIFACT --model TOKENIZER --cache CACHE`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con `AutoModel` u Optimum.
- Latencia y throughput: preparación en frío de ~40 s, carga desde caché de ~0,5 s y ~10 s para procesar una grabación sintética de diez minutos en la máquina de validación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión que permitan una comparación cuantitativa con alternativas. La comparación se limita a características técnicas verificables:

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B — Intel NPU conversion | 0,6 B (aprox.) | Petición de audio de hasta 600 s | OpenMDW-1.1 | OpenVINO IR; runtime personalizado en NPU Intel |
| Nemotron 3.5 ASR Streaming 0.6B (NVIDIA, original) | 0,6 B (aprox.) | no disponible | OpenMDW-1.1 | Pesos originales de NVIDIA; ecosistema estándar |
| Alternativas ASR de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de NVIDIA ni de Intel; el autor lo declara explícitamente.
- No es un checkpoint estándar: requiere código de runtime y exportación propio; no funciona con `AutoModel`, Optimum, vLLM, llama.cpp, Ollama ni TGI.
- Solo validado en un equipo concreto (Core Ultra 7 355, Windows 11 25H2, driver 32.0.100.5540, OpenVINO 2026.2.1); el comportamiento en otras configuraciones no está documentado.
- Límite de 600 segundos por petición; las entradas más largas se rechazan sin truncado silencioso.
- Modo de funcionamiento de grabar y luego insertar, no de subtítulos en vivo.
- Idiomas limitados a francés, inglés y habla mixta; no hay soporte documentado de castellano.
- No se ha establecido un WER representativo, ni siquiera en el dominio financiero; las pruebas publicadas son fixtures sintéticos funcionales.
- Riesgo de alucinación y de errores de puntuación o mayúsculas: en el fixture largo se observaron pequeñas diferencias de puntuación y capitalización respecto a la referencia.
- Licencia OpenMDW-1.1: debe conservarse la licencia completa y la model card y avisos originales en cualquier redistribución; conviene revisar los términos antes de un uso comercial.
- El autor advierte de no subir blobs compilados para NPU, binarios de Windows, grabaciones de prueba, cachés de usuario ni logs privados como pesos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nassau-1/nemotron-3.5-asr-streaming-0.6b-intel-npu
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio de runtime y exportación: https://github.com/Nassau-1/handy-core-ultra-7-355-npu/tree/3fcb6b14e507b5a21c6e15c3df21da820ec0a251/experiments/nemotron_npu
