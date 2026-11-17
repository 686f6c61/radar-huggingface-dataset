# ai-coustics/quail-multi-speaker

## Resumen

Quail Multi Speaker es un modelo de mejora de voz (speech enhancement) de tipo speech-to-speech desarrollado por ai-coustics. Su funcion no es generar texto ni audio sintetico, sino limpiar la senal de microfono en tiempo real eliminando ruido y reverberacion antes de enviarla a un motor de reconocimiento de voz (STT/ASR) o a un agente de voz. Esta disenado especificamente para escenarios con multiples hablantes, condiciones de campo lejano (far-field) y entornos ruidosos, donde los sistemas de voz suelen degradarse.

El modelo se distribuye como artefacto propietario que se ejecuta a traves del paquete `aic-sdk` (disponible en Python, Rust, C/C++, Node.js y WebAssembly). No requiere GPU ni dependencia de ONNX, y opera con una latencia de 30 ms. Esta disponible en dos variantes de frecuencia de muestreo: 8 kHz y 16 kHz. Su relevancia actual radica en que ataca el cuello de botella mas comun de los pipelines de Voice AI en produccion: la calidad de la senal de entrada.

La propuesta de valor declarada por el autor es una reduccion de hasta el 30% en la tasa de error de palabras (WER) en los motores STT, lo que lo posiciona como un preprocesador especializado para pipelines de transcripcion y agentes conversacionales, no como un modelo de lenguaje generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de mejora de voz, inferencia via `aic-sdk`) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesamiento por bloques de audio en tiempo real) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (procesamiento agnostico al idioma de la senal) |
| Licencia | ai-coustics-model-license (propietaria, enlace: https://ai-coustics.com/legal/model-license) |
| Formato de pesos | Artefacto propietario descargable via `aic.Model.download`; no se publican safetensors ni GGUF |
| Frecuencias de muestreo | 8 kHz y 16 kHz |
| Latencia | 30 ms |
| Requisito de GPU | No (inferencia en CPU) |
| Entrada | Audio mono float32, procesado por bloques (`config.block_size`) |
| Canales | Mono |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo (tipo de red, numero de capas, parametros) ni sobre el dataset de entrenamiento, el numero de tokens o el proceso de optimizacion. La model card solo describe su comportamiento funcional: eliminacion de ruido y reverberacion en tiempo real, optimizado para la precision de motores STT en condiciones de multiples hablantes y campo lejano.

La innovacion tecnica destacable, segun el autor, es su diseno para inferencia en CPU con latencia de 30 ms y procesamiento por bloques seguro en tiempo real, sin dependencia de ONNX. El modelo expone un parametro ajustable en tiempo de ejecucion (`EnhancementLevel`, rango 0.0-1.0) que permite calibrar la intensidad de la mejora para optimizar contra un motor STT concreto.

## Capacidades

- Eliminacion de ruido (denoising) y reverberacion en senal de microfono en tiempo real.
- Mejora orientada a STT: reduccion declarada de hasta un 30% en WER.
- Soporte de multiples hablantes y condiciones de campo lejano.
- Procesamiento por bloques con latencia de 30 ms, apto para pipelines en streaming.
- Ejecucion en CPU sin GPU ni dependencia de ONNX.
- Ajuste dinamico de la intensidad de mejora (`EnhancementLevel`) para adaptarse a distintos motores STT.
- Integracion con frameworks de voz en tiempo real como LiveKit y Pipecat.
- SDK multi-lenguaje: Python, Rust, C/C++, Node.js y WebAssembly.
- No realiza generacion de texto, razonamiento, codigo ni vision; es exclusivamente un preprocesador de audio.

## Casos de uso

- Transcripcion de reuniones con multiples participantes: el modelo limpia la senal de cada microfono antes de enviarla al motor ASR, reduciendo errores en entornos de sala con reverberacion y habla solapada.
- Agentes de voz en atencion al cliente: se coloca como etapa previa al STT en el pipeline del agente, de modo que la deteccion de intencion y el reconocimiento de entidades trabajen sobre audio limpio incluso con ruido de fondo.
- Telefonia y centros de llamadas: al soportar 8 kHz, encaja en pipelines telefonicos tradicionales donde la senal llega degradada y con ruido de canal.
- Subtitulado en directo y streaming: la latencia de 30 ms permite generar subtitulos casi en tiempo real sin acumular retardo perceptible en la emision.
- Asistentes de voz en dispositivos de borde (edge): al ejecutarse en CPU sin GPU, puede desplegarse en hardware limitado como raspberry o dispositivos embebidos con SDK en C/C++ o WebAssembly.
- Preprocesado en pipelines de Voice AI sobre LiveKit o Pipecat: se integra como nodo de mejora antes del STT en arquitecturas de agentes conversacionales en tiempo real.
- Investigacion en ASR: permite evaluar el impacto de la mejora de senal sobre distintos motores STT ajustando `EnhancementLevel` y midiendo WER de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (tablas de WER por motor STT, comparativas numericas) en la informacion disponible. El autor declara una reduccion de hasta el 30% en la tasa de error de palabras (WER) en condiciones ruidosas, de campo lejano y con multiples hablantes, pero no se aportan cifras desglosadas por motor ni por dataset.

| Metrica | Valor declarado |
|---|---|
| Reduccion de WER | Hasta 30% (sin desglose por motor STT) |
| Latencia | 30 ms |
| Frecuencias de muestreo | 8 kHz y 16 kHz |

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica (no necesita GPU).
- Despliegue: mediante el paquete `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly). No se soportan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia: 30 ms declarados.
- Throughput: no disponible.
- Requiere una clave SDK (`aic-sdk-key`) para su uso; se ofrece una prueba gratuita de 30 dias sin tarjeta de credito.

## Comparativa con modelos similares

| Modelo | Familia | Uso previsto | Frecuencias | Latencia | Licencia |
|---|---|---|---|---|---|
| Quail Multi Speaker | Quail | STT en entornos ruidosos con multiples hablantes | 8 y 16 kHz | 30 ms | ai-coustics-model-license |
| Quail Voice Focus | Quail | Aislamiento de hablante principal para agentes de voz | 16 kHz (usable en 8 kHz) | No disponible | ai-coustics-model-license |
| Rook Multi Speaker | Rook | Mejora perceptiva para escucha humana (conferencias, telefonia) | Hasta 48 kHz | No disponible | ai-coustics-model-license |
| VAD Multi Speaker | VAD | Deteccion de actividad de voz robusta al ruido | No disponible | No disponible | ai-coustics-model-license |

El autor indica explicitamente que Quail Multi Speaker es la opcion recomendada para Voice AI y STT, mientras que Rook Multi Speaker esta pensado para escucha humana y no se recomienda para casos de uso de Voice AI.

## Limitaciones y advertencias

- Modelo propietario: la licencia `ai-coustics-model-license` restringe el uso comercial; es necesario revisar los terminos en https://ai-coustics.com/legal/model-license y, para uso empresarial, contactar con ai-coustics.
- Requiere una clave SDK valida para funcionar; sin ella el procesador no opera.
- Solo acepta entrada mono; no procesa audio estereo o multicanal.
- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni ejecuta tool calling.
- No se han publicado detalles de arquitectura, entrenamiento ni sesgos, por lo que no es posible evaluar sesgos conocidos ni riesgo de alucinacion (no aplica en el sentido generativo, pero si puede introducir artefactos de audio en la senal mejorada).
- No se especifican los idiomas soportados; el procesamiento es sobre senal acustica, pero no hay validacion publicada por idioma.
- La reduccion de WER del 30% es una cifra declarada por el fabricante sin desglose publico por motor STT ni dataset, por lo que conviene validarla en el pipeline concreto antes de desplegar en produccion.
- No es compatible con frameworks de inferencia estandar (vLLM, llama.cpp, Ollama, TGI); depende exclusivamente del SDK propietario.
- El ajuste de `EnhancementLevel` puede afectar negativamente a algunos motores STT si se calibra de forma inadecuada; requiere evaluacion por caso de uso.

## Enlaces

- Hugging Face: https://huggingface.co/ai-coustics/quail-multi-speaker
- Documentacion del modelo: https://docs.ai-coustics.com/models/speech-enhancement/quail-multi-speaker
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentacion general: https://docs.ai-coustics.com
- Quickstart LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics.py
- Artefactos y checksums: https://artifacts.ai-coustics.io
- SDK Python (PyPI): https://pypi.org/project/aic-sdk/
- Clave SDK gratuita: https://developers.ai-coustics.com
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Sitio del fabricante: https://ai-coustics.com/
- Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Rook Multi Speaker: https://huggingface.co/ai-coustics/rook-multi-speaker
- VAD Multi Speaker: https://huggingface.co/ai-coustics/vad-multi-speaker
- VAD Voice Focus: https://huggingface.co/ai-coustics/vad-voice-focus
- Tyto: https://huggingface.co/ai-coustics/tyto
