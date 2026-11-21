# ai-coustics/quail-multi-speaker

## Resumen

Quail Multi Speaker es un modelo de mejora de voz (speech enhancement) de tipo audio-a-audio desarrollado por ai-coustics, orientado a eliminar ruido y reverberacion de audio de microfono en tiempo real, preservando a todos los hablantes presentes. No es un modelo de lenguaje ni un sistema ASR: actua como preprocesador o "primer" para pipelines de speech-to-text y agentes de voz, de modo que el motor STT posterior recibe una senal mas limpia. Su propuesta de valor es operar con 30 ms de latencia, sin GPU y sin dependencia de ONNX, lo que facilita su integracion en produccion.

El modelo se ofrece en dos frecuencias de muestreo, 8 kHz y 16 kHz, y se distribuye a traves del paquete `aic-sdk`, disponible para Python, Rust, C/C++, Node.js y WebAssembly. La inferencia se realiza bloque a bloque sobre audio mono float32, lo que lo hace adecuado para procesamiento en streaming con requisitos de tiempo real. Su licencia es propietaria (`ai-coustics-model-license`) y requiere una clave SDK, con una prueba gratuita de 30 dias.

La relevancia actual del modelo radica en el cuello de botella que introduce el ruido en entornos de campo lejano y con multiples hablantes para los sistemas de reconocimiento de voz y los agentes conversacionales. ai-coustics declara una reduccion de la tasa de error de palabra (WER) de hasta el 30 % en condiciones ruidosas, lo que lo posiciona como una pieza de infraestructura para despliegues de Voice AI en produccion mas que como un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mejora de voz audio-a-audio, inferencia bloque a bloque) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento por bloques de audio; tamano de bloque definido por `config.block_size`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | agnostico al idioma (language-agnostic) |
| Licencia | ai-coustics-model-license (propietaria, requiere clave SDK) |
| Formato de pesos | pesos gestionados por `aic-sdk` mediante `aic.Model.download` / `aic.Model.from_file`; formatos concretos no disponibles |
| Frecuencias de muestreo | 8 kHz y 16 kHz |
| Latencia | 30 ms |
| Canales | mono (float32) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo (tipo de red, numero de capas o parametros). La model card describe un modelo de speech-to-speech que elimina ruido y reverberacion en tiempo real y que esta optimizado para la precision del STT aguas abajo. El procesamiento es por bloques de tamano fijo (`config.block_size`), lo que encaja con un diseno de streaming de baja latencia y apto para tiempo real.

Tampoco se detallan los datos de entrenamiento (numero de horas, composicion del dataset, tecnicas de aumento) ni si se emplearon metodos de alineacion o ajuste fino especificos. La unica innovacion tecnica explicitamente documentada es la ausencia de dependencia de ONNX y la ejecucion sin GPU, junto con un parametro ajustable en tiempo de ejecucion (`ProcessorParameter.EnhancementLevel`, rango 0.0-1.0) que permite calibrar la intensidad de la mejora para un motor STT concreto.

## Capacidades

- Mejora de voz audio-a-audio en tiempo real: eliminacion de ruido y reverberacion de audio de microfono.
- Preservacion de multiples hablantes simultaneos (multi-speaker), a diferencia de los modelos de aislamiento de hablante principal.
- Optimizacion explicita para precision de speech-to-text, con reduccion declarada de hasta el 30 % de WER.
- Soporte de dos frecuencias de muestreo: 8 kHz y 16 kHz.
- Independencia del idioma: al ser un modelo de senal, no esta limitado a un conjunto de lenguas.
- Ajuste dinamico de la intensidad de mejora mediante `EnhancementLevel` (0.0-1.0).
- Procesamiento por bloques compatible con streaming y tiempo real (latencia de 30 ms).
- Ejecucion sin GPU y sin ONNX.
- SDK multi-lenguaje: Python, Rust, C/C++, Node.js y WebAssembly.
- No incluye generacion de texto, razonamiento, codigo, vision ni tool calling; su funcion es exclusivamente de preprocesado de audio.

## Casos de uso

- Preprocesado para pipelines ASR en produccion: se coloca delante del motor STT para limpiar el audio de entrada y reducir el WER en entornos ruidosos; su latencia de 30 ms permite mantener la conversacion en tiempo real.
- Agentes de voz en atencion al cliente: al mejorar la senal de microfono antes del reconocimiento, reduce transcripciones erroneas en llamadas con ruido de fondo o reverberacion, lo que mejora la comprension de intenciones y la respuesta del agente.
- Reuniones y salas con multiples hablantes: al preservar a todos los hablantes (no aisla uno solo), es adecuado para transcripcion de reuniones y diarizacion aguas abajo en escenarios de campo lejano.
- Telefonia y VoIP: la variante de 8 kHz encaja con la banda telefonica, por lo que puede integrarse en centralitas y flujos de atencion telefonica para limpiar la senal antes del STT.
- Captura en dispositivos embebidos o edge: al no requerir GPU y ofrecer SDK para C/C++, Rust y WebAssembly, puede ejecutarse en dispositivos con recursos limitados.
- Integracion en frameworks de agentes de voz: la documentacion incluye quickstarts para LiveKit y Pipecat, lo que permite incorporarlo como etapa de mejora dentro de pipelines conversacionales existentes.
- Calibracion por motor STT: mediante `EnhancementLevel` se puede ajustar la agresividad de la mejora para maximizar la precision del motor de reconocimiento concreto usado en cada despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. La model card unicamente declara una reduccion de la tasa de error de palabra (WER) de hasta el 30 % en condiciones ruidosas, sin tablas de resultados por conjunto de datos ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para ejecutarse sin GPU.
- GPU recomendadas: no necesarias. La inferencia se realiza en CPU.
- Compatibilidad con GPU de consumo: no aplica, ya que no requiere GPU.
- Despliegue: mediante el paquete `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia: 30 ms declarados por el autor.
- Throughput: no disponible.
- Requisitos adicionales: clave SDK (`aic-sdk-key`) obtenida en developers.ai-coustics.com; audio de entrada mono en float32 procesado por bloques de `config.block_size`.

## Comparativa con modelos similares

| Modelo | Familia | Uso previsto | Frecuencias | Latencia | Licencia |
|---|---|---|---|---|---|
| Quail Multi Speaker | Quail | STT en condiciones ruidosas, campo lejano y multiples hablantes; reduccion de WER de hasta 30 % | 8 y 16 kHz | 30 ms | ai-coustics-model-license |
| Quail Voice Focus | Quail | Aislamiento del hablante principal para agentes de voz; hasta 43 % menos errores de palabra | 16 kHz (usable en 8 kHz) | no disponible | ai-coustics-model-license |
| Rook Multi Speaker | Rook | Escucha humano-a-humano (conferencias, telefonia); mejora perceptiva de ruido, reverberacion y distorsion | hasta 48 kHz | no disponible | ai-coustics-model-license |
| VAD Multi Speaker / VAD Voice Focus | VAD | Deteccion de actividad de voz robusta al ruido | no disponible | no disponible | ai-coustics-model-license |

Los tres modelos de la familia Quail/Rook comparten licencia propietaria y ecosistema SDK; la eleccion depende del caso: Quail Multi Speaker para STT multi-hablante, Quail Voice Focus para agentes con un hablante principal y Rook para escucha humana.

## Limitaciones y advertencias

- Modelo propietario con licencia `ai-coustics-model-license`: el uso comercial esta sujeto a los terminos de ai-coustics y requiere clave SDK; no es software libre ni de codigo abierto.
- Requiere una clave SDK para funcionar; la prueba gratuita es de 30 dias y despues es necesario un plan de pago o licencia empresarial.
- Entrada limitada a audio mono en float32; no procesa audio estereo o multicanal de forma nativa.
- Frecuencias de muestreo limitadas a 8 kHz y 16 kHz; no esta pensado para audio de alta fidelidad (para eso ai-coustics remite a Rook Multi Speaker, hasta 48 kHz).
- No es un modelo de reconocimiento de voz: no transcribe ni genera texto; debe combinarse con un motor STT.
- No esta disenado para aislamiento de un hablante principal; para ese caso ai-coustics recomienda Quail Voice Focus.
- No se publican detalles de arquitectura, datos de entrenamiento ni benchmarks completos, lo que limita la evaluacion independiente del rendimiento real.
- No se dispone de informacion sobre sesgos, robustez frente a tipos concretos de ruido ni comportamiento en idiomas o acentos especificos.
- La cifra de reduccion de WER (hasta 30 %) es una declaracion del autor y depende del motor STT y de las condiciones acusticas; conviene validarla en el entorno de despliegue propio.
- No se documentan limitaciones de contexto ni de idioma, ya que el modelo es independiente del idioma y procesa senal, no texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/quail-multi-speaker
- Documentacion de Quail Multi Speaker: https://docs.ai-coustics.com/models/speech-enhancement/quail-multi-speaker
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentacion general: https://docs.ai-coustics.com
- Quickstart LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics.py
- Artefactos y checksums: https://artifacts.ai-coustics.io
- SDK Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave SDK gratuita: https://developers.ai-coustics.com
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Licencia empresarial: https://ai-coustics.com/
- Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Rook Multi Speaker: https://huggingface.co/ai-coustics/rook-multi-speaker
- VAD Multi Speaker: https://huggingface.co/ai-coustics/vad-multi-speaker
- VAD Voice Focus: https://huggingface.co/ai-coustics/vad-voice-focus
- Tyto: https://huggingface.co/ai-coustics/tyto
