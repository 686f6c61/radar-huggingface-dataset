# Phoonnx/vits-es_es-mls_9972-low

## Resumen

Phoonnx/vits-es_es-mls_9972-low es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede de Rhasspy, concretamente de la colección piper-voices en la ruta `es/es_ES/mls_9972/low`, y ha sido reconvertido al formato ONNX para su uso dentro del ecosistema phoonnx, que incluye integración con el asistente OVOS (Open Voice OS).

El modelo resuelve el problema de la generación de voz en castellano de España (`es-ES`) a partir de texto, con una huella de almacenamiento muy reducida (0,1 GB en el repositorio) gracias a la variante "low" de Piper. La entrada de texto se procesa mediante fonemización con espeak-ng, lo que produce fonemas IPA que alimentan directamente al modelo VITS.

Su relevancia radica en que permite desplegar TTS local en castellano con requisitos de hardware mínimos, sin dependencia de servicios en la nube, y con una licencia MIT que facilita su uso comercial. No obstante, la información pública disponible es muy escasa: no se han publicado detalles sobre el dataset de entrenamiento, el número de parámetros ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible (el modelo se distribuye como ONNX; variante "low" de Piper) |
| Idiomas soportados | es-ES (castellano de España) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por alineamientos monotónicos y un decodificador generativo adversarial, junto con un discriminador de múltiples periodos durante el entrenamiento. VITS produce audio de forma directa a partir de fonemas, sin necesidad de vocoder externo separado.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El nombre del modelo (`mls_9972`) sugiere que procede del corpus MLS (Multilingual LibriSpeech), pero este dato no está confirmado en la documentación proporcionada. La variante "low" indica una configuración de menor tamaño dentro de la familia Piper, orientada a inferencia rápida en dispositivos modestos.

El pipeline de inferencia de phoonnx delega la normalización y fonemización del texto a la librería scriptconv, que utiliza el fonemizador `EspeakPhonemizer` de `scriptconv.phonemizers.mul` (instalable con el extra `scriptconv[espeak]`). Es necesario disponer de espeak-ng en el sistema o del port espyak incluido en `phoonnx[espeak]`; el autor advierte que algunos fonemas de espyak difieren de espeak-ng y pueden provocar errores de pronunciación en determinadas palabras.

## Capacidades

- Síntesis de voz a partir de texto en castellano de España (`es-ES`), con salida en formato WAV.
- Fonemización mediante espeak-ng con alfabeto IPA como entrada al modelo.
- Ejecución en Python mediante `TTSModelManager` de phoonnx.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con demo en vivo en tigregotico.pt/demo.
- Inferencia ONNX local, sin dependencia de servicios en la nube.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistente de voz doméstico con OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en castellano de forma local y con huella mínima (0,1 GB).
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la síntesis WAV directa permite generar avisos de voz pregrabados o dinámicos en sistemas con recursos limitados, como Raspberry Pi.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o herramientas de narración que requieran una voz castellana ligera y sin latencia de red.
- Síntesis de voz en aplicaciones web: phoonnx.js permite ejecutar la voz en el navegador con entrada espeak o unicode, útil para demos interactivas o interfaces de voz sin backend.
- Generación de audio para contenido educativo o locuciones de vídeo: el modelo puede sintetizar frases en `es-ES` para material didáctico o prototipos de narración, con licencia MIT para uso comercial.
- Pruebas de pipelines TTS en CI/CD: al ser un modelo ONNX pequeño, puede incluirse en tests automatizados de sistemas de voz para validar la fonemización y la salida de audio en castellano.
- Prototipado de interfaces conversacionales: sirve como capa de salida de voz en asistentes experimentales que necesiten una voz local en español sin coste por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño del repositorio (0,1 GB) y la variante "low" de Piper, se espera una huella de memoria muy reducida, apta para CPU.
- GPU recomendadas: no disponible; el modelo está pensado para inferencia ONNX, probablemente en CPU.
- Compatibilidad con GPU de consumo: no confirmada, pero por tamaño es plausible que quepa en cualquier GPU de consumo e incluso en dispositivos embebidos; dato no verificado.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/vits-es_es-mls_9972-low | VITS | es-ES | 0,1 GB (repo) | MIT | ONNX |
| Otras voces Piper es_ES (rhasspy/piper-voices) | VITS | es-ES | variable (low/medium/high) | MIT (según model card upstream) | ONNX |
| Modelos TTS comerciales en castellano | no disponible | es-ES | no disponible | propietaria | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan parámetros, dataset de entrenamiento ni métricas de calidad.
- Dependencia de espeak-ng o espyak para la fonemización; el autor advierte que espyak puede pronunciar mal algunas palabras por diferencias de fonemas.
- Cobertura limitada a `es-ES`; no se indica soporte de otras variantes del español ni de otros idiomas.
- Riesgo de errores de pronunciación en palabras con grafía irregular, siglas o extranjerismos, derivado de la fonemización automática.
- Al ser una variante "low", la calidad de voz puede ser inferior a variantes medium o high de Piper; no se aportan datos objetivos de MOS.
- No aplica riesgo de alucinación textual en el sentido de los LLM, pero sí posibles artefactos acústicos o prosodia incorrecta en frases largas o mal normalizadas.
- Licencia MIT declarada por el upstream en la model card de rhasspy/piper-voices; conviene verificar los términos exactos del repositorio original antes de uso comercial.
- Sin descargas ni likes registrados en Hugging Face en la fecha de creación, lo que indica poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-mls_9972-low
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/mls_9972/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
