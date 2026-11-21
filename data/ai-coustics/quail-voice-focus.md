# ai-coustics/quail-voice-focus

## Resumen

Quail Voice Focus es un modelo de speech-to-speech (audio a audio) desarrollado por ai-coustics, orientado a la mejora y el aislamiento de la voz del hablante principal en tiempo real. No es un modelo generativo de lenguaje ni un sistema de reconocimiento de voz, sino un procesador de audio que se sitúa en la parte de captura ("contact side") de las pilas de Voice AI para suprimir ruido, reverberación, voces competidoras y habla de fondo antes de que la señal llegue a los sistemas de STT, VAD, turn-taking o speech-to-speech. Su propuesta de valor es hacer viables en producción los agentes de voz que fallan en condiciones acústicas reales.

El modelo declara una latencia de 30 ms, funciona sin GPU y sin dependencia de ONNX, y opera a 16 kHz (utilizable en pipelines de 8 kHz). Según el autor, reduce hasta un 43 % los errores de palabra en los principales proveedores de STT. Está pensado específicamente para escenarios con un único hablante principal y no está recomendado para situaciones multihablante, para las que el autor remite a Quail Multi Speaker.

La inferencia se realiza a través del paquete Python `aic-sdk` (con variantes para Rust, C/C++, Node.js y WebAssembly), lo que implica que el modelo no se distribuye como pesos abiertos convencionales sino como artefacto consumido por un SDK propietario. La licencia es la ai-coustics-model-license, de tipo "other", y el acceso requiere una clave de SDK, con una prueba gratuita de 30 días.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (procesador de audio speech-to-speech propietario) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (procesamiento por bloques en tiempo real) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | language-agnostic (independiente del idioma) |
| Licencia | ai-coustics-model-license (other) |
| Formato de pesos | no disponible (se consume via `aic-sdk`; artefactos en artifacts.ai-coustics.io) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la informacion disponible. La model card describe el comportamiento funcional (aislamiento del hablante principal, supresion de ruido, reverberacion, voces competidoras y habla de fondo) y las condiciones de operacion (16 kHz, latencia de 30 ms, ejecucion sin GPU, procesamiento por bloques de tamano `config.block_size`), pero no detalla el tipo de red, el numero de parametros ni la composicion del dataset de entrenamiento.

Tampoco se documentan procesos de RLHF, DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Lo que si se explicita es la interfaz de integracion: un procesador configurable mediante `aic.ProcessorConfig.optimal`, con un parametro ajustable en tiempo de ejecucion (`ProcessorParameter.EnhancementLevel`, de 0.0 a 1.0) que permite optimizar la intensidad de la mejora para un motor de STT concreto.

## Capacidades

- Aislamiento del hablante principal (voice isolation) en audio de un solo hablante.
- Supresion de ruido, reverberacion, voces competidoras y habla de fondo en tiempo real.
- Procesamiento speech-to-speech con latencia declarada de 30 ms.
- Soporte de multiples frecuencias de muestreo de entrada a 16 kHz, utilizable en pipelines de 8 kHz.
- Compatibilidad con audio de campo lejano (far-field) de un unico hablante.
- Independiente del idioma (language-agnostic).
- Ajuste en tiempo de ejecucion de la intensidad de mejora (0.0–1.0) para adaptarse a distintos motores de STT.
- Ejecucion sin GPU y sin dependencia de ONNX.
- Integracion con frameworks de agentes de voz como LiveKit y Pipecat.
- No soporta escenarios multihablante; para ello el autor remite a Quail Multi Speaker.

## Casos de uso

- Agentes de voz en produccion: el modelo se coloca en la parte de captura para limpiar la senal antes de que llegue al STT, mejorando la fiabilidad de la transcripcion en entornos con ruido y reverberacion, con hasta un 43 % menos de errores de palabra segun el autor.
- Pipelines de speech-to-text en atencion al cliente: al aislar al hablante principal y suprimir el habla de fondo, reduce las transcripciones erroneas en llamadas con ruido ambiental o con otras voces presentes.
- Deteccion de actividad de voz (VAD) en agentes conversacionales: el autor recomienda emparejarlo con VAD Voice Focus para el turn-taking del hablante principal, en lugar de encadenar la mejora a un VAD generico.
- Integracion en frameworks de agentes en tiempo real: existen quickstarts para LiveKit y Pipecat, lo que permite incorporarlo a pipelines de voz existentes sin reescribir la infraestructura.
- Telefonia y captura en 8 kHz: al ser utilizable en pipelines de 8 kHz, encaja en escenarios de telefonia donde el audio de entrada tiene baja frecuencia de muestreo.
- Audio de campo lejano con un solo hablante: adecuado para microfonos alejados del hablante (salas, dispositivos de sobremesa) siempre que no haya multiples hablantes activos.
- Preprocesado para modelos speech-to-speech: al mejorar la relacion senal-ruido de la entrada, sirve como etapa previa a modelos de voz generativos que de otro modo degradarian su calidad en condiciones acusticas adversas.

## Benchmarks y rendimiento

La informacion disponible unicamente reporta la reduccion de errores de palabra declarada por el autor (hasta un 43 % en los principales proveedores de STT) y una latencia de 30 ms. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje.

| Metrica | Valor declarado |
|---|---|
| Reduccion de errores de palabra (STT) | hasta 43 % en los principales proveedores de STT |
| Latencia | 30 ms |
| Frecuencia de muestreo | 16 kHz (utilizable en 8 kHz) |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo declara ejecucion sin GPU.
- GPU recomendadas: no aplica (no necesita GPU).
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: inferencia mediante el paquete `aic-sdk` en Python, Rust, C/C++, Node.js y WebAssembly; integracion documentada con LiveKit y Pipecat.
- Latencia y throughput: latencia declarada de 30 ms; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Uso previsto | Frecuencia de muestreo | Latencia | Licencia | Notas |
|---|---|---|---|---|---|
| Quail Voice Focus | Agentes de voz con un hablante principal | 16 kHz (usable en 8 kHz) | 30 ms | ai-coustics-model-license | Aislamiento de voz; hasta 43 % menos errores de palabra; no apto para multihablante |
| Quail Multi Speaker | STT en condiciones ruidosas, campo lejano y multihablante | 8 y 16 kHz | no disponible | ai-coustics-model-license | Denoiser optimizado para precision de STT; hasta 30 % de reduccion de WER |
| Rook Multi Speaker | Escucha humano a humano (conferencias, telefonia) | hasta 48 kHz | no disponible | ai-coustics-model-license | Mejora perceptiva; no recomendado para Voice AI |

## Limitaciones y advertencias

- No esta disenado para escenarios multihablante; el autor recomienda Quail Multi Speaker para esos casos.
- Requiere una clave de SDK (`aic-sdk-key`) para su uso; la prueba gratuita es de 30 dias y el uso posterior esta sujeto a la licencia ai-coustics-model-license.
- La licencia es de tipo "other" (ai-coustics-model-license); es necesario revisar los terminos en el enlace de licencia antes de un uso comercial.
- No se distribuyen pesos abiertos en formato convencional (safetensors, GGUF); la inferencia depende del SDK propietario, lo que limita la portabilidad y la inspeccion del modelo.
- No hay informacion publica sobre sesgos, riesgo de alucinacion (no aplica al ser un procesador de audio) ni sobre el comportamiento en idiomas o acentos concretos mas alla de la declaracion "language-agnostic".
- El rendimiento declarado (hasta 43 % menos errores de palabra) procede del autor y no se acompana de una tabla de benchmarks detallada en la informacion disponible.
- La entrada debe ser mono en float32 y procesarse por bloques de tamano `config.block_size`, lo que condiciona la integracion en tiempo real.

## Enlaces

- [Hugging Face: ai-coustics/quail-voice-focus](https://huggingface.co/ai-coustics/quail-voice-focus)
- [Documentacion de Quail Voice Focus](https://docs.ai-coustics.com/models/voice-focus/quail-voice-focus)
- [SDK quickstart](https://docs.ai-coustics.com/models/get-started/sdk-quickstart)
- [docs.ai-coustics.com](https://docs.ai-coustics.com)
- [Quickstart de LiveKit](https://docs.ai-coustics.com/models/get-started/livekit-quickstart)
- [Ejemplo de Pipecat](https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics.py)
- [Artefactos y checksums](https://artifacts.ai-coustics.io)
- [Paquete Python aic-sdk](https://pypi.org/project/aic-sdk/)
- [Clave de SDK gratuita](https://developers.ai-coustics.com)
- [Licencia del modelo](https://ai-coustics.com/legal/model-license)
- [Sitio web de ai-coustics](https://ai-coustics.com/)
- [Quail Multi Speaker](https://huggingface.co/ai-coustics/quail-multi-speaker)
- [Rook Multi Speaker](https://huggingface.co/ai-coustics/rook-multi-speaker)
- [VAD Multi Speaker](https://huggingface.co/ai-coustics/vad-multi-speaker)
- [VAD Voice Focus](https://huggingface.co/ai-coustics/vad-voice-focus)
- [Tyto](https://huggingface.co/ai-coustics/tyto)
