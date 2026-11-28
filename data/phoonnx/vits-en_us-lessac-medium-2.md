# Phoonnx/vits-en_us-lessac-medium

## Resumen

`Phoonnx/vits-en_us-lessac-medium` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería `phoonnx`. El modelo original procede de Rhasspy, concretamente de la voz `en_US/lessac/medium` del repositorio `rhasspy/piper-voices`; Phoonnx se limita a reempaquetarlo y distribuirlo con una integración específica para su stack de TTS (Python y OVOS). La autoría del modelo subyacente corresponde a Rhasspy, mientras que el empaquetado y la publicación en Hugging Face corren a cargo de Phoonnx.

El modelo resuelve la conversión de texto en inglés estadounidense a audio inteligible en tiempo real, con un tamaño de repositorio de 0,1 GB que lo hace adecuado para despliegues ligeros, asistentes de voz locales y sistemas embebidos. La entrada de texto no es texto plano directo: el modelo espera fonemas en alfabeto IPA generados por espeak-ng (o por el port espyak incluido como extra de Python), lo que condiciona el pipeline de preprocesado.

Su relevancia actual radica en que permite ejecutar TTS neuronal sin dependencia de servicios en la nube, con licencia MIT y pesos ONNX optimizados para inferencia en CPU. No obstante, la información pública disponible es muy limitada: no se detallan parámetros, contexto (no aplica en TTS) ni benchmarks, y el modelo cuenta con 200 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repositorio no detalla variantes cuantizadas) |
| Idiomas soportados | en (concretamente en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, además de un alineamiento monotónico aprendido (MAS) para evitar la necesidad de alineamientos fonema-audio explícitos. El modelo `lessac/medium` es una de las voces preentrenadas del proyecto Piper (Rhasspy), entrenada sobre el corpus de voz Lessac en inglés estadounidense.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en TTS). El empaquetado de Phoonnx no modifica el modelo subyacente: solo lo convierte a ONNX y lo integra con su pipeline de fonemización mediante `scriptconv` y espeak-ng. La innovación destacable es la portabilidad: pesos ONNX ejecutables en CPU con la librería `phoonnx`, además de una variante JavaScript (`phoonnx.js`) que permite inferencia en navegador.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto normalizado y fonemizado con espeak-ng.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Fonemización previa mediante `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul` (extra `scriptconv[espeak]`).
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni visión: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada: solo en-US según la model card.

## Casos de uso

- Asistentes de voz locales: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico sin conexión a Internet, aprovechando el tamaño reducido (0,1 GB) y la licencia MIT.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo puede sintetizar frases cortas en en-US con latencia baja al ejecutarse en CPU sobre ONNX.
- Sistemas de accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, con despliegue embebido en dispositivos de bajos recursos.
- Generación de audio para prototipos y demos: creación rápida de clips de voz en inglés para vídeos, tutoriales o pruebas de concepto sin depender de APIs comerciales.
- Automatización de pruebas de pipelines de voz: uso como referencia para validar sistemas de ASR/TTS en cadena (síntesis → reconocimiento) en entornos de CI.
- Aplicaciones web con TTS en cliente: mediante `phoonnx.js`, sintetizar voz en el navegador sin enviar texto a un servidor, útil para privacidad y para reducir costes de backend.
- Domótica y dispositivos IoT: anuncios por voz en altavoces inteligentes o controladores domésticos con recursos limitados, gracias al formato ONNX y al tamaño compacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se puede inferir que el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, con amplio margen (el repositorio completo ocupa 0,1 GB).
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia externa: espeak-ng (o el extra `phoonnx[espeak]` con espyak) para la fonemización previa.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano repo | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-lessac-medium | VITS | en-US | MIT | ONNX | 0,1 GB | Empaquetado de Rhasspy Piper |
| rhasspy/piper-voices (en_US/lessac/medium) | VITS | en-US | MIT | ONNX | no disponible | Modelo upstream original |
| Otras voces Piper (p. ej. en_US/amy, en_GB/alba) | VITS | en / en-GB | MIT | ONNX | variable | Mismo pipeline, distinta voz y acento |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con alternativas. La comparación se limita a características estructurales (arquitectura, licencia, formato e idioma).

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Requiere fonemización previa con espeak-ng; sin esta dependencia el modelo no funciona correctamente. El port espyak puede producir fonemas distintos y pronunciar mal algunas palabras, según advierte la propia model card.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o con grafías ambiguas, al depender de reglas de espeak.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; su uso está acotado a TTS.
- No se han publicado métricas objetivas (MOS, WER de síntesis, latencia) en la información disponible, lo que dificulta evaluar su calidad frente a alternativas.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo upstream en `rhasspy/piper-voices` y del corpus Lessac subyacente, ya que la model card solo indica que el upstream declara MIT.
- El proyecto tiene muy poca tracción (200 descargas, 0 likes) y fue creado y actualizado en noviembre de 2026, por lo que la comunidad y el soporte son limitados.
- Dependencia de la librería `phoonnx` (versión `--pre`, es decir, pre-release), lo que implica posibles cambios de API e inestabilidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-lessac-medium
- Modelo upstream (Rhasspy Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
