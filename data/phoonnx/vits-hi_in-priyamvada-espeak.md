# Phoonnx/vits-hi_in-priyamvada-espeak

## Resumen

`vits-hi_in-priyamvada-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede de la colección de voces Piper de PravalX, concretamente la voz `hi_IN/priyamvada/medium`, y ha sido reconvertido al formato ONNX para su uso con el runtime de Phoonnx.

El modelo resuelve la generación de audio hablado en hindi (variante `hi-IN`) a partir de texto, utilizando fonemas espeak en alfabeto IPA como entrada. Es relevante para proyectos que necesitan TTS local en hindi dentro del ecosistema OVOS/Mycroft, ya que Phoonnx ofrece un plugin de integración directa (`ovos-tts-plugin-phoonnx`) y un runtime ONNX ligero que no requiere GPU.

Se trata de un modelo compacto (repo de 0,1 GB), orientado a inferencia en CPU y a despliegues embebidos o de asistente de voz. La licencia declarada es `other`, con la model card upstream indicando `cc`, lo que exige verificar los términos antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | hindi (`hi`, variante `hi-IN`) |
| Licencia | `other` (upstream declara `cc`) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Autor original | PravalX (voz `priyamvada/medium`) |
| Empaquetado | Phoonnx |
| Libreria | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. El modelo genera waveform directamente a partir de la secuencia de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo original fue entrenado por PravalX como parte de la colección de voces Piper (`piper-voices`) en la variante `medium` para hindi (`hi_IN/priyamvada`). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicionales. Phoonnx se limita a empaquetar los pesos en ONNX y a definir el front-end de texto: la normalización y conversión a fonemas se realiza mediante `scriptconv` con el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`.

## Capacidades

- Síntesis de voz en hindi (`hi-IN`) a partir de texto escrito.
- Generación de audio WAV mediante `voice.synthesize_wav(text, wav_file)` en la API de Phoonnx.
- Entrada basada en fonemas espeak en alfabeto IPA, lo que permite control fino de la pronunciación si se generan los fonemas manualmente.
- Integración con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js` (runtime JavaScript del mismo ecosistema).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistente de voz local en hindi: integrado en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, el modelo permite que un asistente doméstico responda en hindi sin depender de servicios en la nube, gracias a su runtime ONNX y su tamaño reducido.
- Lectura de notificaciones y alertas: en aplicaciones de monitorización o domótica, el modelo puede sintetizar mensajes cortos en hindi para alertas de sistema, con latencia baja al ejecutarse en CPU.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla o documentos a voz en hindi, ejecutándose localmente en el dispositivo del usuario.
- Generación de audiolibros o contenido narrado en hindi: para fragmentos de texto moderados, el modelo produce voz sintética sin necesidad de infraestructura GPU.
- Pruebas de pronunciación y lingüística: al aceptar fonemas IPA directamente, permite experimentar con transcripciones fonéticas y evaluar la calidad de la síntesis en distintos alófonos del hindi.
- Prototipado de interfaces de voz en navegador: mediante `phoonnx.js` y la demo en `tigregotico.pt/demo`, se puede validar la voz en aplicaciones web antes de integrarla en producción.
- Sistemas embebidos y edge computing: el tamaño de 0,1 GB y el formato ONNX permiten desplegar la voz en dispositivos con recursos limitados, como Raspberry Pi, para anuncios o interfaces de voz locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es esperable que quepa en memoria de CPU sin GPU, aunque no se especifican cifras oficiales.
- GPU recomendadas: no se especifican; el runtime de Phoonnx está orientado a ejecución en CPU mediante ONNX Runtime.
- ¿Cabe en GPU consumer? Sí, por tamaño (0,1 GB), aunque no se documentan requisitos mínimos ni configuraciones probadas.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / tamaño |
|---|---|---|---|---|---|
| `Phoonnx/vits-hi_in-priyamvada-espeak` | VITS | hi-IN | ONNX | other (upstream `cc`) | 0,1 GB |
| Otras voces Piper de PravalX (`piper-voices`) | VITS | varias | ONNX / Piper | según voz | variable |
| Modelos VITS de la colección Phoonnx | VITS | varias | ONNX | según modelo | variable |

No se dispone de datos de benchmarks ni de comparativas de calidad (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo entrenado sobre una voz concreta (`priyamvada`), la diversidad de hablantes y registros está limitada a esa voz.
- Riesgo de alucinación: en TTS el equivalente es la mala pronunciación o la generación de artefactos acústicos; la model card advierte que el uso de `espyak` (port de espeak-ng) en lugar de `espeak-ng` puede provocar pronunciaciones incorrectas en algunas palabras.
- Limitaciones de idioma: el modelo solo soporta hindi (`hi-IN`); no está entrenado para otros idiomas.
- Restricciones de licencia: la licencia declarada es `other`, con la model card upstream indicando `cc`. Es necesario verificar los términos exactos de la licencia Creative Commons aplicable antes de cualquier uso comercial.
- Dependencia externa: requiere `espeak-ng` instalado en el sistema (o el extra `phoonnx[espeak]`), lo que añade una dependencia de sistema operativo al despliegue.
- Calidad de voz: la variante es `medium`, lo que implica un compromiso entre calidad y tamaño; no se documentan métricas de calidad (MOS) para esta voz.
- Fecha de creación del repo (2026-11-14) y escaso número de descargas (20): modelo con muy poca validación comunitaria hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hi_in-priyamvada-espeak
- Upstream (Piper voices de PravalX): https://huggingface.co/PravalX/piper-voices/tree/main/hi/hi_IN/priyamvada/medium
- Repositorio Phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
