# Phoonnx/vits-fa_ir-amir-espeak

## Resumen

vits-fa_ir-amir-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado en formato ONNX por Phoonnx para su uso con su librería de inferencia `phoonnx`. El modelo original fue entrenado por SadeghK y forma parte de su proyecto `persian-text-to-speech`, concretamente la voz identificada como `amir` dentro del subdirectorio de farsi. Phoonnx se limita a convertir y empaquetar los pesos para que puedan ejecutarse de forma portable en Python, OVOS y navegador mediante `phoonnx.js`.

El modelo está especializado en persa de Irán (`fa-IR`) y recibe como entrada fonemas en alfabeto IPA generados por espeak-ng, no texto en bruto. Por tanto, no es un modelo de lenguaje ni un sistema TTS de extremo a extremo con normalización textual propia: la conversión de texto a fonemas la realiza la librería `scriptconv` a través del fonemizador `EspeakPhonemizer`. Es relevante para desarrolladores que necesiten una voz persa ligera, ejecutable en local y con licencia Apache 2.0, integrable en asistentes de voz (OVOS) o aplicaciones web.

El repositorio ocupa aproximadamente 0,1 GB, lo que sitúa al modelo en la categoría de TTS compacto, apto para inferencia en CPU y en dispositivos con recursos limitados. La información pública disponible no incluye detalles sobre el número de parámetros, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS con generador adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados; no se documentan variantes) |
| Idiomas soportados | persa de Irán (`fa-IR`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. El modelo genera waveform directamente a partir de fonemas, sin necesidad de un vocoder externo. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, la duración del audio ni si se aplicaron técnicas de alineamiento o fine-tuning posteriores.

El autor original del modelo es SadeghK; Phoonnx ha realizado el empaquetado para ONNX y la integración con su pipeline. La entrada debe proporcionarse en fonemas IPA generados por espeak-ng, y la normalización y conversión de texto a fonemas se delega en `scriptconv`. No se documentan innovaciones técnicas adicionales más allá de las propias de VITS y del empaquetado ONNX.

## Capacidades

- Síntesis de voz en persa de Irán (`fa-IR`) a partir de fonemas IPA.
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- Fonemización de apoyo mediante `scriptconv` y `EspeakPhonemizer`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al persa; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` con la voz `piper_community/SadeghK/amir`, lo que permite dotar de voz persa a un asistente doméstico sin depender de servicios en la nube.
- Lectura de textos en persa en aplicaciones de accesibilidad: integración en lectores de pantalla o herramientas de lectura en voz alta para usuarios iraníes, aprovechando que el modelo es compacto (0,1 GB) y puede ejecutarse en CPU.
- Síntesis en aplicaciones web sin backend: mediante `phoonnx.js`, el modelo puede ejecutarse en el navegador para generar audio en persa en demos o aplicaciones educativas, con la limitación de que la fonemización debe resolverse en cliente con espeak o unicode.
- Generación de audiolibros o contenido narrado en persa: el modelo permite sintetizar pasajes largos por fragmentos, siempre que se realice una fonemización previa con espeak-ng y se gestionen las pausas y la prosodia a nivel de fragmento.
- Pruebas de integración y pipelines de TTS en CI: al ser un modelo ONNX ligero con licencia Apache 2.0, puede incorporarse en tests automatizados de pipelines de voz sin coste de licencia ni dependencia de APIs externas.
- Prototipado de interfaces conversacionales en persa: desarrolladores que necesiten una voz de referencia rápida para validar flujos de diálogo multi-turno pueden usar el modelo como componente TTS sustituible, dado su tamaño reducido y su integración con `phoonnx`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, es esperable que quepa en GPU consumer con varios GB libres, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponibles. El modelo está empaquetado en ONNX y orientado a inferencia ligera, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño del modelo; no se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS) y `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Formato |
|---|---|---|---|---|---|
| vits-fa_ir-amir-espeak (este modelo) | VITS | fa-IR | fonemas IPA (espeak) | Apache 2.0 | ONNX |
| Otras voces VITS empaquetadas por Phoonnx | VITS | variable según voz | fonemas IPA o unicode | según modelo original | ONNX |
| SadeghK/persian-text-to-speech (upstream) | VITS | fa-IR | fonemas | Apache 2.0 (declarada) | pesos originales |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparativa se limita a aspectos de arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- El modelo solo acepta fonemas IPA generados por espeak-ng; sin esa dependencia instalada, la síntesis no funciona correctamente.
- Con el port `espyak` de espeak-ng, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, según advierte la propia model card.
- El modelo está limitado al persa de Irán (`fa-IR`); no se documenta soporte para otros idiomas o dialectos.
- No se dispone de información sobre sesgos del corpus de entrenamiento ni sobre tasas de alucinación o errores de pronunciación medidos.
- La licencia Apache 2.0 permite uso comercial, pero la licencia declarada corresponde al modelo upstream; conviene verificar la cadena de licencias en el repositorio original de SadeghK antes de un despliegue en producción.
- El modelo no incluye normalización textual propia: números, abreviaturas y símbolos deben normalizarse antes de la fonemización mediante `scriptconv`.
- No se documentan métricas de calidad (MOS, WER de fonemas) ni latencias medidas, lo que dificulta evaluar su idoneidad en producción frente a alternativas comerciales.
- El número de descargas (23) y de likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-amir-espeak
- Modelo upstream (SadeghK): https://huggingface.co/SadeghK/persian-text-to-speech/tree/main/farsi/amir
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
