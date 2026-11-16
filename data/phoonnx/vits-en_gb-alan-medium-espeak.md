# Phoonnx/vits-en_gb-alan-medium-espeak

## Resumen

vits-en_gb-alan-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede de Rhasspy, concretamente de la voz `en_GB-alan-medium` del repositorio piper-voices, y se distribuye como un artefacto ONNX listo para inferencia en Python y en el ecosistema OVOS. Su función es convertir texto en inglés británico en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

El modelo resuelve el problema de disponer de una voz TTS local, ligera y sin dependencias de servicios en la nube, adecuada para asistentes de voz, sistemas embebidos y aplicaciones de accesibilidad. Al estar empaquetado para phoonnx, se integra mediante un plugin de OVOS y también puede ejecutarse en el navegador a través de phoonnx.js. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a despliegues con recursos limitados.

La relevancia actual radica en su licencia MIT, su formato ONNX portable y su integración con un stack open source de asistentes de voz. No obstante, la información pública disponible es escasa: no se detallan parámetros, contexto ni resultados de benchmarks, y el modelo está restringido al inglés británico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes) |
| Idiomas soportados | en-GB (inglés británico) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para generar waveform directamente a partir de fonemas. Esta arquitectura es habitual en la familia Piper, de la que procede la voz original `en_GB-alan-medium` de Rhasspy.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de las propias de VITS. El modelo se distribuye como artefacto ONNX ya entrenado; el trabajo de Phoonnx consiste en el empaquetado y la integración con su front-end de texto (scriptconv) y su fonemizador espeak, no en el entrenamiento.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico (en-GB).
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalización de texto previa a cargo de scriptconv.
- Integración como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.
- Multilingüismo limitado al inglés británico.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` con la voz `piper/en_GB-alan-medium`, permitiendo respuestas habladas sin conexión a servicios externos.
- Accesibilidad y lectura de pantalla: integración en aplicaciones que convierten texto en audio para usuarios con discapacidad visual, aprovechando el formato ONNX y el reducido tamaño del repositorio (0,1 GB).
- Sistemas embebidos y dispositivos de bajos recursos: al ser un modelo compacto en ONNX, puede ejecutarse en hardware limitado sin GPU dedicada, aunque no se documentan requisitos exactos.
- Síntesis de voz en el navegador: mediante phoonnx.js se puede generar audio en cliente con entrada espeak o unicode, útil para demos y aplicaciones web sin backend de TTS.
- Generación de avisos y locuciones automatizadas: producción de mensajes de voz pregrabados dinámicamente para sistemas de megafonía, IVR o notificaciones, usando texto en inglés británico.
- Pruebas y prototipado de pipelines TTS: al estar empaquetado para phoonnx y scriptconv, sirve como voz de referencia para validar integraciones de fonemización espeak y síntesis VITS antes de desplegar otras voces de la colección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS compacto en ONNX, es probable que funcione en CPU, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-en_gb-alan-medium-espeak | VITS | en-GB | MIT | ONNX | Empaquetado por Phoonnx; entrada espeak IPA |
| rhasspy/piper-voices en_GB-alan-medium | VITS | en-GB | MIT (según model card upstream) | Piper/ONNX | Modelo original del que deriva este artefacto |
| Otras voces de la colección VITS de Phoonnx | VITS | variable | variable | ONNX | Mismo empaquetado, distintas voces e idiomas |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés británico (en-GB); no es multilingüe.
- Requiere espeak-ng instalado para generar los fonemas; sin él, el extra `phoonnx[espeak]` usa espyak, cuyos fonemas pueden diferir y provocar errores de pronunciación en algunas palabras.
- No se documentan sesgos, pero al ser una voz sintética entrenada con datos no especificados, puede presentar sesgos de pronunciación o prosodia no evaluados.
- Riesgo de alucinación no aplica en el sentido de LLM, pero la síntesis puede producir pronunciaciones incorrectas ante texto fuera de dominio o fonemas mal generados.
- Licencia MIT declarada por el upstream en la model card de rhasspy/piper-voices; conviene verificar los términos exactos del repositorio original antes de uso comercial.
- El repositorio tiene pocas descargas (20) y ningún like, lo que sugiere escasa validación comunitaria.
- No se documentan parámetros, cuantizaciones ni requisitos de hardware, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-alan-medium-espeak
- Upstream (Rhasspy piper-voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alan/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
