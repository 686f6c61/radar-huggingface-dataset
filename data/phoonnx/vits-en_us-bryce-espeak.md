# Phoonnx/vits-en_us-bryce-espeak

## Resumen

`vits-en_us-bryce-espeak` es un modelo de síntesis de voz (text-to-speech) de la familia VITS, desarrollado originalmente por Rhasspy y empaquetado por Phoonnx para su librería de inferencia ONNX. Concretamente, se trata de una reempaquetación del checkpoint `rhasspy/piper-voices/en/en_US/bryce/medium`, una voz masculina estadounidense de calidad media orientada a síntesis local y de baja latencia. El modelo no es un LLM ni un modelo generativo de texto: es un sintetizador acústico condicionado por fonemas.

El problema que resuelve es la síntesis de voz offline en inglés estadounidense con requisitos de cómputo mínimos. Al estar exportado a ONNX y tener un tamaño de repositorio de aproximadamente 0,1 GB, puede ejecutarse en CPU sin GPU dedicada, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domésticos y aplicaciones de accesibilidad. Su integración con el ecosistema OVOS (Open Voice OS) y con la librería phoonnx facilita su despliegue en pipelines de voz.

La relevancia de este empaquetado reside en la estandarización: Phoonnx unifica la carga, la gestión de voces y el front-end de texto (normalización y fonemización vía espeak-ng) para todos los modelos VITS de su colección. La entrada de texto se convierte a fonemas IPA mediante espeak-ng, y la salida es audio WAV. El modelo está etiquetado únicamente para inglés (`en`, `en-US`) y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech condicionado por fonemas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo card no documenta variantes) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |
| Voz | `piper/en_US-bryce-medium` (masculina, calidad media) |
| Autor upstream | Rhasspy (`rhasspy/piper-voices`) |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normales y un discriminador adversarial para el entrenamiento. El modelo genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado en tiempo de inferencia. En este caso concreto, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que desacopla la fonemización del modelo acústico.

El checkpoint original corresponde a la voz `bryce` en calidad `medium` del proyecto Piper de Rhasspy. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional, ya que la model card no los documenta. La innovación práctica de este empaquetado es la integración con `scriptconv`, la librería de normalización de texto y fonemización de Phoonnx, que convierte el texto de entrada en la secuencia de fonemas que el modelo espera. La inferencia se realiza sobre ONNX Runtime, lo que permite ejecución en CPU y portabilidad entre plataformas.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto.
- Conversión de texto a fonemas IPA mediante espeak-ng (a través de `scriptconv`).
- Generación de audio WAV mediante `voice.synthesize_wav()`.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Soporte en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión.
- No es un modelo multilingüe: únicamente inglés estadounidense.
- No dispone de modo de razonamiento (thinking mode) ni capacidades de audio de entrada.

## Casos de uso

- Asistentes de voz domésticos: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo sintetiza respuestas del asistente en inglés con latencia baja y sin GPU, configurándose en `mycroft.conf` con la voz `piper/en_US-bryce-medium`.
- Lectura de notificaciones y alertas: al ser un modelo de ~0,1 GB y ejecutarse en CPU, puede sintetizar mensajes cortos en sistemas embebidos (Raspberry Pi, dispositivos IoT) para avisos de domótica o monitorización.
- Accesibilidad y lectores de pantalla: conversión de texto a voz para usuarios con discapacidad visual en aplicaciones de escritorio o web, usando la salida WAV generada por `synthesize_wav`.
- Síntesis en navegador: mediante `phoonnx.js`, el modelo puede ejecutarse del lado del cliente para generar voz en aplicaciones web sin enviar texto a un servidor, lo que preserva la privacidad.
- Generación de audiolibros o contenido narrado: para textos en inglés estadounidense donde se requiera una voz masculina consistente y no se necesite clonación de voz ni expresividad avanzada.
- Pruebas y prototipado de pipelines TTS: al estar estandarizado para phoonnx, sirve como voz de referencia para validar integraciones de fonemización con espeak-ng antes de desplegar otras voces de la colección VITS.
- Sistemas de respuesta vocal en kioscos o terminales: síntesis local de instrucciones y mensajes en inglés sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime. El repositorio ocupa ~0,1 GB, por lo que la huella de memoria es del orden de cientos de MB.
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero la model card no documenta requisitos ni rendimiento en GPU.
- Cabe en GPU de consumo: sí, por tamaño, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS VITS).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia externa: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak). Con espyak algunos fonemas difieren de espeak-ng y la voz puede pronunciar mal algunas palabras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-bryce-espeak (este) | VITS | en-US | ~0,1 GB | MIT | ONNX | Empaquetado para phoonnx, entrada por fonemas espeak |
| Otras voces Piper `en_US` (p. ej. lessac, amy) | VITS | en-US | ~0,1 GB (medium) | MIT | ONNX | Mismo upstream Rhasspy; distinta voz y calidad |
| Otras voces de la colección Phoonnx VITS | VITS | varios | variable | variable | ONNX | Mismo pipeline de carga y fonemización |
| Modelos TTS neuronales de mayor tamano (p. ej. familia XTTS) | no disponible en la información | multilingüe | varios GB | variable | variable | No comparables directamente por tamano y requisitos |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés estadounidense; no soporta otros idiomas ni code-switching.
- La calidad es `medium`; no es una voz de alta fidelidad ni expresiva, y no dispone de control de emoción o prosodia avanzada.
- Depende de espeak-ng para la fonemización; si se usa el port espyak, algunos fonemas difieren y pueden producirse pronunciaciones incorrectas.
- No dispone de clonación de voz ni de transferencia de estilo.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede producir pronunciaciones erróneas ante texto no normalizado o abreviaturas no cubiertas por el front-end.
- Licencia MIT, lo que permite uso comercial; el modelo card indica que el upstream declara MIT en `rhasspy/piper-voices`, aunque conviene verificar la licencia de la voz original en el repositorio de Rhasspy.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan sesgos específicos de la voz ni datos demográficos del hablante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-bryce-espeak
- Upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/bryce/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
