# Phoonnx/vits-en_us-data-espeak

## Resumen

vits-en_us-data-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede del repositorio comunitario de voces Piper de dividebysandwich, y Phoonnx lo ha reempaquetado en formato ONNX para integrarlo en su ecosistema de TTS (phoonnx, scriptconv y el plugin ovos-tts-plugin-phoonnx). Se trata, por tanto, de una voz en inglés estadounidense (en-US) pensada para ser ejecutada localmente mediante inferencia ONNX.

El modelo no es un LLM ni un modelo generativo de texto: es un sintetizador neuronal de audio que convierte fonemas (en alfabeto IPA, generados por espeak-ng) en forma de onda de audio. Su relevancia radica en su integración con el stack de asistentes de voz de código abierto OVOS, lo que permite incorporar TTS local sin dependencias de servicios en la nube.

El repositorio ocupa 0,1 GB y se publica bajo licencia MIT. No se dispone de información sobre el tamaño en parámetros ni sobre la longitud de contexto, ya que no son magnitudes aplicables a este tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (síntesis de voz neuronal de extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial durante el entrenamiento. La entrada de texto no es texto crudo, sino fonemas en alfabeto IPA generados por espeak-ng; el front-end de texto lo gestiona la librería scriptconv mediante `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de alineamiento o ajuste fino posteriores. El modelo procede del repositorio de voces Piper de dividebysandwich, del que Phoonnx ha empaquetado la variante `en-US_Data` para su ejecución en ONNX. La innovación técnica destacable es el empaquetado para inferencia ONNX ligera y su integración con el ecosistema OVOS, no una modificación arquitectónica del modelo original.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak, con posibles discrepancias fonéticas).
- Generación de audio en formato WAV mediante `synthesize_wav`.
- Ejecución local mediante inferencia ONNX, sin dependencia de API externa.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable vía `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS y permite que un asistente doméstico de código abierto sintetice respuestas habladas sin enviar texto a servicios en la nube, gracias a su ejecución ONNX local.
- Síntesis de voz en aplicaciones de escritorio: mediante la API de phoonnx (`TTSModelManager` y `synthesize_wav`) se puede generar audio WAV en un pipeline Python para lectores de pantalla, notificaciones o interfaces accesibles.
- Síntesis de voz en el navegador: con phoonnx.js se puede ejecutar la voz en cliente para aplicaciones web que necesiten lectura de texto sin backend de TTS.
- Prototipado de interfaces conversacionales: al ser un modelo ligero (repo de 0,1 GB) y con licencia MIT, es adecuado para pruebas de concepto de asistentes por voz en entornos de desarrollo.
- Generación de audio para contenido en inglés: narración de textos cortos o avisos en aplicaciones cuyo público objetivo sea angloparlante estadounidense.
- Evaluación comparativa de voces Piper: sirve como referencia para comparar la calidad de la voz `en-US_Data` frente a otras voces del repositorio de dividebysandwich dentro del ecosistema phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el tamaño reducido y el formato ONNX apuntan a que puede ejecutarse en CPU y en GPU de consumo; no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-en_us-data-espeak (este) | VITS | en-US | MIT | ONNX | Empaquetado para phoonnx |
| Otras voces Piper de dividebysandwich | VITS | varias | según upstream | ONNX/Piper | Mismo origen, distinta voz o idioma |
| Voces VITS de la colección Phoonnx | VITS | varias | según modelo | ONNX | Mismo runtime phoonnx |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- La calidad de pronunciación depende del front-end espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Requiere espeak-ng instalado (o la extra `phoonnx[espeak]`) para generar los fonemas de entrada.
- No se dispone de información sobre sesgos, riesgo de alucinación acústica ni evaluación de calidad subjetiva (MOS).
- Licencia MIT: permite uso comercial, pero el autor remite a los términos del release upstream de dividebysandwich, que conviene verificar.
- El modelo no es un LLM: no admite instrucciones, razonamiento ni tool calling; cualquier expectativa en ese sentido es incorrecta.
- No hay datos publicados de latencia, throughput ni requisitos de hardware oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-data-espeak
- Repositorio upstream (voces Piper de dividebysandwich): https://github.com/dividebysandwich/piper-voice-models/tree/main/Data
- phoonnx (librería ONNX TTS): https://github.com/TigreGotico/phoonnx
- scriptconv (normalización y fonemizadores): https://github.com/TigreGotico/scriptconv
- phoonnx.js (ejecución en navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
