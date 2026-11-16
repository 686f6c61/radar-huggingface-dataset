# Phoonnx/vits-en_us-norman-espeak

## Resumen

vits-en_us-norman-espeak es un modelo de síntesis de voz (text-to-speech) de la familia VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. Concretamente, se trata del modelo upstream `rhasspy/piper-voices/en/en_US/norman/medium`, una voz masculina en inglés estadounidense de calidad media, reconvertida al formato y a la interfaz de Phoonnx.

El modelo resuelve el problema de la síntesis de voz local y de baja latencia: al ser un VITS exportado a ONNX y con un tamaño de repositorio de aproximadamente 0,1 GB, puede ejecutarse en CPU sin GPU dedicada, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domésticos y aplicaciones que requieren privacidad (procesamiento 100 % local). Su entrada no es texto plano, sino fonemas espeak en alfabeto IPA, lo que exige un front-end de fonemización previo.

Es relevante en el ecosistema OVOS (Open Voice OS) y Rhasspy, donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. Su licencia MIT facilita el uso comercial, aunque su alcance lingüístico se limita al inglés estadounidense y su calidad es "medium", no equiparable a los modelos TTS neuronales de gran escala actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, no modelo de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo upstream es de calidad "medium") |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python y OVOS) |
| Autor upstream | Rhasspy (Piper) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un codificador de variación posterior, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo genera directamente la forma de onda a partir de la representación fonética, sin necesidad de un vocoder separado. Esta variante pertenece a la colección de voces Piper "medium", que prioriza velocidad de inferencia y tamaño reducido frente a la máxima calidad.

No se dispone de información sobre el número de tokens ni la composición exacta del dataset de entrenamiento en la información proporcionada; el modelo procede del repositorio `rhasspy/piper-voices` en la ruta `en/en_US/norman/medium`. La entrada textual debe convertirse previamente a fonemas espeak-ng (o mediante la implementación espyak incluida en el extra `phoonnx[espeak]`), y esa fonemización constituye un paso crítico: diferencias entre espeak-ng y espyak pueden provocar pronunciaciones incorrectas en algunas palabras.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de fonemas IPA generados por espeak-ng.
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de Phoonnx.
- Ejecución en CPU mediante ONNX, sin requisito de GPU.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable vía `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o Unicode.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.
- Capacidad multilingüe: limitada a en-US.

## Casos de uso

- Asistentes de voz locales: el modelo sintetiza respuestas habladas en un asistente doméstico (OVOS, Rhasspy) sin enviar texto a servicios en la nube, lo que preserva la privacidad y reduce la latencia al ejecutarse en CPU.
- Lectura de notificaciones y alertas: en sistemas de domótica o monitoreo, convierte mensajes de estado en audio en tiempo casi real gracias al tamaño reducido (~0,1 GB) del modelo ONNX.
- Interfaces de accesibilidad: lectura en voz alta de contenido textual para usuarios con discapacidad visual en aplicaciones de escritorio o web, mediante la integración con phoonnx.js en el navegador.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia ligera para validar front-ends de fonemización, normalización de texto y conversión de script antes de desplegar modelos de mayor calidad.
- Dispositivos embebidos y de recursos limitados: al no requerir GPU y ocupar poco espacio, es viable en Raspberry Pi u otros SBC para kioscos, juguetes interactivos o terminales de información.
- Síntesis por lotes de audiolibros o avisos: generación offline de archivos WAV a partir de textos en inglés estadounidense en pipelines automatizados, con coste computacional bajo y licencia MIT para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para ejecución en CPU con ONNX Runtime (tamaño de repositorio ~0,1 GB).
- GPU recomendadas: no es necesario; cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato |
|---|---|---|---|---|---|
| vits-en_us-norman-espeak (este) | VITS | en-US | medium | MIT | ONNX |
| Otras voces Piper `en_US` medium | VITS | en-US | medium | MIT (upstream) | ONNX |
| Voces Piper `en_US` high | VITS | en-US | high | MIT (upstream) | ONNX |
| Modelos TTS neuronales de gran escala (p. ej. familia XTTS) | variable | multilingüe | alta | variable | variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Calidad "medium": inferior a las voces Piper "high" o a modelos TTS de gran escala en naturalidad y prosodia.
- La entrada debe ser fonemas espeak-ng en IPA; un front-end incorrecto o el uso de espyak en lugar de espeak-ng puede producir pronunciaciones erróneas.
- Riesgo de artefactos o entonación antinatural en frases largas o con puntuación compleja; no se documentan métricas de calidad objetivas.
- No se dispone de información sobre sesgos de género, acento o dialecto más allá de la etiqueta "norman" del modelo upstream.
- Aunque la licencia es MIT, conviene verificar la licencia del modelo upstream en `rhasspy/piper-voices` antes de un despliegue comercial.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, razonamiento ni tareas de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-norman-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/norman/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Paper de VITS: no disponible en la información proporcionada
