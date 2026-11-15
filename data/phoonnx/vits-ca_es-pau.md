# Phoonnx/vits-ca_es-pau

## Resumen

`vits-ca_es-pau` es un modelo de síntesis de voz (text-to-speech) en catalán (variedad `ca-ES`) desarrollado originalmente por el HiTZ Center y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura condicional VAE combinada con un discriminador adversarial que genera waveform directamente a partir de fonemas, sin necesidad de un vocoder separado. El modelo original es `HiTZ/TTS-ca_pau`, y esta versión redistribuye los pesos en formato ONNX para su uso con la librería `phoonnx`.

La relevancia de este modelo radica en su nicho: TTS de calidad para catalán con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su empaquetado para ONNX y su integración con el ecosistema OVOS (Open Voice OS) lo hacen adecuado para asistentes de voz locales y despliegues en edge. El repositorio ocupa 0,1 GB, lo que sugiere un modelo compacto apto para CPU.

No se dispone de información sobre el número de parámetros, la longitud de contexto (en TTS no aplica del mismo modo) ni detalles del dataset de entrenamiento más allá de lo indicado en la model card. La identidad de la voz es "pau", presumiblemente una voz masculina en catalán central.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, VAE + adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados; no se documentan variantes) |
| Idiomas soportados | catalán (`ca`, `ca-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior y un posterior variacional, un decoder basado en flujos normalizadores y un vocoder (HiFi-GAN) en un único modelo entrenado de forma adversarial. Esto elimina la necesidad de alinear explícitamente texto y audio y de un vocoder separado en inferencia. El modelo original fue entrenado por el HiTZ Center (Universidad del País Vasco) sobre datos de voz en catalán, aunque la model card no detalla el número de horas, la composición del corpus ni si se aplicaron técnicas de RLHF o fine-tuning.

El empaquetado de Phoonnx convierte los pesos a ONNX y añade un front-end de texto basado en `scriptconv`, que normaliza el texto y lo convierte a fonemas mediante `EspeakPhonemizer` (espeak-ng). La calidad de la fonemización depende de espeak-ng; si se usa el port `espyak`, algunos fonemas difieren y pueden producir errores de pronunciación. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal, ya que no aplican a este tipo de modelo.

## Capacidades

- Síntesis de voz (text-to-speech) en catalán a partir de texto escrito.
- Generación de waveform directamente desde fonemas IPA (espeak-ng), sin vocoder externo.
- Salida en formato WAV mediante `voice.synthesize_wav()`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, agentes, razonamiento multi-paso ni visión.
- No es un modelo multilingüe: solo catalán.
- No dispone de modo "thinking" ni capacidades de audio de entrada (es TTS, no ASR).

## Casos de uso

- **Asistentes de voz locales (OVOS/Mycroft)**: el modelo se integra como plugin TTS en OVOS y permite respuestas habladas en catalán sin depender de servicios en la nube. Adecuado por su licencia Apache 2.0 y su tamaño reducido (0,1 GB).
- **Lectura de textos en catalán (accesibilidad)**: conversión de artículos, documentos o notificaciones a voz para usuarios con discapacidad visual, ejecutándose en CPU local.
- **Aplicaciones web con TTS en el navegador**: mediante `phoonnx.js`, se puede sintetizar voz catalana en el cliente sin enviar texto a un servidor, útil para privacidad y latencia.
- **Sistemas de megafonía y anuncios automatizados**: generación de avisos pregrabados o dinámicos en catalán para transporte, comercios o edificios públicos.
- **Prototipado de interfaces conversacionales en catalán**: iteración rápida en el desarrollo de chatbots de voz, ya que el modelo es ligero y se instala con `pip install --pre phoonnx`.
- **Generación de audiolibros o contenido educativo**: síntesis de material didáctico en catalán con voz consistente, sin coste por carácter.
- **Pruebas de pronunciación y fonética**: al basarse en fonemas espeak-ng, puede usarse para validar transcripciones fonéticas en catalán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU dedicada, pero no se documentan cifras oficiales.
- **GPU recomendadas**: no se especifican; por tamaño, cualquier GPU consumer (GTX 1060 o superior) sería suficiente, aunque no hay datos confirmados.
- **¿Cabe en GPU consumer?**: sí, por el tamaño del repositorio (0,1 GB), pero no se confirma oficialmente.
- **Opciones de despliegue**: `phoonnx` (Python), `phoonnx.js` (navegador), plugin OVOS (`ovos-tts-plugin-phoonnx`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo | Contexto |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ca_es-pau | VITS | Catalán | Apache 2.0 | ONNX | 0,1 GB | no aplica |
| HiTZ/TTS-ca_pau (upstream) | VITS | Catalán | Apache 2.0 | no disponible | no disponible | no aplica |
| Otros VITS de Phoonnx | VITS | Varios | Apache 2.0 | ONNX | variable | no aplica |

No se dispone de datos de rendimiento comparativo (MOS, RTF) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo catalán (`ca-ES`); no sintetiza otros idiomas.
- **Dependencia de espeak-ng**: la calidad depende de la fonemización; con `espyak` pueden producirse errores de pronunciación.
- **Riesgo de alucinación**: en TTS se traduce en pronunciaciones incorrectas o prosodia anómala en textos fuera de dominio, no documentado cuantitativamente.
- **Sesgos**: no se documentan sesgos de voz, género o acento; la voz "pau" tiene una identidad fija.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (`HiTZ/TTS-ca_pau`), que el empaquetador declara como Apache 2.0.
- **Producción**: no hay benchmarks publicados de MOS ni RTF; se recomienda evaluar calidad y latencia en el dominio concreto antes de desplegar.
- **Sin soporte para texto sin normalizar**: requiere el front-end de `scriptconv` para normalización y fonemización.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-pau
- Modelo upstream: https://huggingface.co/HiTZ/TTS-ca_pau
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
