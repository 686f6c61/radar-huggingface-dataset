# Phoonnx/vits-en_us-k9-2449-espeak

## Resumen

vits-en_us-k9-2449-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede del repositorio de GitHub hopkira/k9_piper_voice, cuyo autor es hopkira, y Phoonnx lo ha adaptado al formato y a las convenciones de su ecosistema (librería `phoonnx`, plugin OVOS y front-end de texto `scriptconv`). Se trata, por tanto, de un modelo de voz concreta (una sola voz en inglés estadounidense) más que de un modelo fundacional de TTS.

El modelo resuelve la síntesis de voz offline en inglés de EE. UU. a partir de fonemas espeak en alfabeto IPA. Su relevancia es práctica: permite integrar una voz TTS ligera (el repositorio ocupa 0,1 GB) en aplicaciones Python y en asistentes basados en OVOS sin depender de servicios en la nube, y con licencia Unlicense, que permite uso comercial sin restricciones. No se dispone de datos sobre número de parámetros, contexto (no aplica en TTS) ni composición del dataset de entrenamiento.

Al estar empaquetado para ONNX, el modelo se ejecuta mediante la librería phoonnx, que gestiona la carga de voces, la normalización del texto y la fonemización con espeak-ng (o con el port espyak incluido como extra). Es una pieza de infraestructura para voces Piper comunitarias, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | Unlicense |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Libreria de ejecucion | phoonnx |
| Tamano del repositorio | 0,1 GB |
| Autor original | hopkira (github.com/hopkira/k9_piper_voice) |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para generar waveforms directamente a partir de fonemas. La entrada no es texto crudo, sino fonemas espeak en alfabeto IPA, que phoonnx obtiene mediante `scriptconv` y su `EspeakPhonemizer`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de VITS. El modelo se distribuye como pesos ONNX listos para inferencia, sin detalles publicados sobre el proceso de entrenamiento en la información disponible. El repositorio original (hopkira/k9_piper_voice) es la fuente upstream, pero no se ha proporcionado su contenido técnico.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense (en-US) a partir de texto de entrada.
- Fonemización mediante espeak-ng o el port espyak (extra `phoonnx[espeak]`), con salida en alfabeto IPA.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración en asistentes OVOS a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o Unicode.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.
- Capacidad multilingüe limitada a en-US.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper_community/hopkira/en-US_k9_2449` en `mycroft.conf`, lo que permite respuestas habladas sin conexión a servicios externos.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV para narración de contenido, avisos o lectura de textos en pipelines de escritorio.
- Lectura de notificaciones y alertas en sistemas embebidos: el tamaño reducido del repositorio (0,1 GB) y la ejecución ONNX permiten desplegarlo en dispositivos con recursos limitados.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de asistencia en inglés de EE. UU.
- Síntesis en el navegador: mediante phoonnx.js y la demo de TigreGotico, se puede integrar TTS en aplicaciones web sin backend de inferencia.
- Prototipado de voces Piper comunitarias: sirve como referencia para empaquetar y probar otras voces del mismo ecosistema antes de integrarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB y la ejecución es mediante ONNX, por lo que la huella de memoria debería ser reducida, pero no se proporcionan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si requiere GPU o puede ejecutarse en CPU.
- Opciones de despliegue: librería phoonnx (Python), plugin OVOS `ovos-tts-plugin-phoonnx` y phoonnx.js en navegador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de parámetros para comparar con otras voces Piper o modelos TTS como VITS de Coqui, Piper o Kokoro. La comparativa se limita a características estructurales conocidas:

| Modelo | Arquitectura | Idioma | Licencia | Formato |
|---|---|---|---|---|
| vits-en_us-k9-2449-espeak | VITS | en-US | Unlicense | ONNX |
| Otras voces Piper comunitarias | VITS | variable | variable | ONNX |
| Modelos TTS comerciales en la nube | no disponible | múltiple | propietaria | API |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de una sola voz y un solo idioma (en-US); no soporta otros idiomas ni cambio de hablante.
- La entrada debe ser texto en inglés estadounidense; el front-end normaliza y fonemiza con espeak-ng, y el uso del port espyak puede provocar errores de pronunciación en algunas palabras, según advierte la model card.
- Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`; sin ello, el modelo no puede fonemizar correctamente.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de contexto; al ser TTS, el riesgo principal es la pronunciación incorrecta y la calidad de la voz, no la generación de contenido falso.
- Licencia Unlicense: permite uso comercial y modificación sin restricciones, pero conviene verificar la procedencia de los datos de entrenamiento originales, no documentada.
- No hay información sobre latencia, calidad perceptual (MOS) ni estabilidad en producción; se recomienda evaluar la voz en el dominio de aplicación antes de desplegarla.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-k9-2449-espeak
- Repositorio upstream: https://github.com/hopkira/k9_piper_voice
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
