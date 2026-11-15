# Phoonnx/vits-ar_jo-kareem-low

## Resumen

`vits-ar_jo-kareem-low` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el usuario Phoonnx como parte de su colección de voces empaquetadas para su librería ONNX de TTS. El modelo original procede del proyecto Rhasspy, concretamente de la voz `ar_JO/kareem/low` del repositorio `rhasspy/piper-voices`, y Phoonnx lo redistribuye en formato ONNX listo para su uso con su propia librería `phoonnx` y con el ecosistema OVOS.

Se trata de una voz de calidad "low" (la variante de menor tamaño dentro de la familia Piper) para árabe jordano (`ar-JO`). El modelo resuelve el problema de generar audio de voz inteligible a partir de texto en árabe dialectal jordano en entornos con recursos limitados, ya que su tamaño reducido (repo de 0,1 GB) permite ejecución en CPU sin GPU dedicada. La entrada de texto se procesa mediante fonemización con espeak-ng, usando el alfabeto IPA.

La relevancia actual del modelo es acotada pero específica: cubre un hueco poco atendido en TTS open source (árabe jordano) y ofrece una ruta de despliegue sencilla vía ONNX, tanto en Python como en navegador (phoonnx.js) y en asistentes de voz basados en OVOS/Mycroft. No es un modelo de propósito general ni compite con sistemas TTS neuronales de gran escala; es una pieza de infraestructura para pipelines de voz ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, extremo a extremo) |
| Parametros totales | no disponible (variante "low" de Piper) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" implica modelo reducido) |
| Idiomas soportados | árabe jordano (`ar-JO`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo (normalmente basado en flujos y un vocoder integrado) para producir audio directamente desde fonemas. En el caso de Piper, la variante "low" corresponde a una configuración de menor tamaño y menor coste computacional, pensada para inferencia en tiempo real en CPU.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si se aplicaron técnicas de RLHF o ajuste fino. La model card únicamente indica que el modelo procede de Rhasspy y que la entrada de texto se pasa por espeak-ng para obtener fonemas en IPA. La innovación técnica destacable es el empaquetado en ONNX para la librería phoonnx, que permite ejecutar la voz tanto en Python como en navegador mediante phoonnx.js, y su integración como plugin de TTS en OVOS.

## Capacidades

- Síntesis de voz a partir de texto en árabe jordano (`ar-JO`), con salida en formato WAV.
- Fonemización de entrada mediante espeak-ng (alfabeto IPA), con normalización de texto a cargo de la librería `scriptconv`.
- Ejecución en CPU gracias al formato ONNX y a la variante "low" del modelo.
- Integración en Python mediante `phoonnx.model_manager.TTSModelManager` y en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje.
- No soporta visión, audio de entrada ni modo "thinking"; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en árabe jordano: integración como módulo TTS en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, seleccionando la voz `piper/ar_JO-kareem-low` en `mycroft.conf`; adecuado por su bajo coste y su ejecución en CPU.
- Lectura de textos y notificaciones en aplicaciones locales: síntesis de frases cortas a WAV para avisos, menús o mensajes del sistema en árabe jordano, sin necesidad de GPU.
- Prototipado de interfaces de voz en navegador: uso de phoonnx.js con esta voz para demos de TTS en árabe jordano directamente en el cliente, sin backend de inferencia.
- Generación de audio para contenidos educativos o de accesibilidad: conversión de material textual en árabe jordano a voz para lectores de pantalla o audiolibros ligeros.
- Pruebas de pipelines de TTS multilingües: incorporación de una voz árabe jordana a un sistema que ya usa otras voces Piper, gracias al formato común ONNX y a la gestión unificada de voces de phoonnx.
- Investigación en fonética y dialectología árabe: generación controlada de audio a partir de fonemas IPA para experimentos de percepción o comparación de dialectos.
- Despliegue en dispositivos de bajos recursos: al tratarse de una variante "low" en ONNX, puede ejecutarse en Raspberry Pi o dispositivos embebidos para aplicaciones de voz offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de variante "low" con repo de 0,1 GB, se espera ejecución en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; no se requiere GPU para el caso de uso previsto.
- ¿Cabe en consumer GPU? Sí, con margen amplio, aunque el modelo está pensado para CPU; cualquier GPU consumer podría ejecutarlo.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-ar_jo-kareem-low (este) | VITS (Piper, variante low) | ar-JO | repo 0,1 GB | MIT | Hugging Face, ONNX |
| rhasspy/piper-voices ar_JO/kareem/low | VITS (Piper) | ar-JO | no disponible | MIT | Hugging Face (upstream) |
| Otras voces Piper "low" para árabe | VITS (Piper) | árabe (varios dialectos) | variable | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Es una voz de calidad "low": la fidelidad y naturalidad del audio será inferior a la de variantes de mayor tamaño.
- Dependencia de espeak-ng para la fonemización; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, tal como advierte la model card.
- Cobertura limitada a árabe jordano (`ar-JO`); no está pensado para árabe estándar moderno ni otros dialectos.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí puede haber errores de pronunciación o prosodia en textos con números, siglas o préstamos.
- No se documentan sesgos específicos, pero al ser una voz única ("kareem") no ofrece variedad de hablantes.
- Licencia MIT, lo que permite uso comercial; aun así, conviene verificar la licencia del modelo upstream en `rhasspy/piper-voices` antes de producción.
- Para producción, hay que tener en cuenta la dependencia externa de espeak-ng y la normalización de texto vía `scriptconv`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ar_jo-kareem-low
- Upstream (Rhasspy Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/ar/ar_JO/kareem/low
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
