# Phoonnx/vits-ca_es-upc_ona-medium-espeak

## Resumen

`vits-ca_es-upc_ona-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX homónima. El modelo convierte texto en catalán (variedad `ca-ES`) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece TTS neuronal de calidad media para catalán en un paquete ONNX ligero (0,1 GB), ejecutable tanto en Python como en el asistente de voz OVOS y en el navegador mediante phoonnx.js.

El modelo no es un LLM ni un sistema multimodal general: es un sintetizador acústico puro. Su utilidad práctica está en integrarse en asistentes de voz, sistemas de accesibilidad, lectura de contenidos o pipelines de generación de audio en catalán, donde un motor TTS local, sin dependencia de servicios en la nube, es preferible por privacidad, latencia y coste.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (síntesis de voz neuronal end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto/fonemas, no contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes de cuantización) |
| Idiomas soportados | catalán (`ca-ES`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |
| Autor original | Rhasspy (upstream: `rhasspy/piper-voices`, `ca/ca_ES/upc_ona/medium`) |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz neuronal end-to-end que combina un codificador de texto, un prior variacional, un decoder generativo y un discriminador adversarial en entrenamiento. VITS produce audio directamente a partir de fonemas sin necesidad de un vocoder externo separado, lo que simplifica el despliegue. En este caso, la entrada no es texto crudo sino fonemas en alfabeto IPA generados por espeak-ng, de modo que el front-end fonético es externo al modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables típicamente a TTS). La variante `upc_ona/medium` procede del catálogo de voces Piper de Rhasspy; el calificativo "medium" indica un tamaño de modelo intermedio dentro de la familia Piper, aunque no se detallan los parámetros exactos. La innovación destacable es el empaquetado para phoonnx, que permite ejecutar el modelo en Python, en OVOS y en el navegador (phoonnx.js), con normalización de texto delegada a la librería scriptconv.

## Capacidades

- Síntesis de voz (text-to-speech) en catalán (`ca-ES`) a partir de texto de entrada.
- Fonemización mediante espeak-ng (`EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`), con entrada en alfabeto IPA.
- Normalización y conversión de texto delegada a scriptconv antes de la síntesis.
- Ejecución en Python mediante `phoonnx.model_manager.TTSModelManager` y la voz `piper/ca_ES-upc_ona-medium`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o Unicode), con demo en vivo.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un sintetizador de voz.

## Casos de uso

- Asistentes de voz locales en catalán: integración en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionando la voz `piper/ca_ES-upc_ona-medium` en `mycroft.conf` para respuestas habladas sin depender de la nube.
- Accesibilidad y lectura de pantalla: conversión de texto a audio en catalán para aplicaciones de lectores de pantalla o sistemas de asistencia a personas con discapacidad visual, aprovechando la ejecución local y el tamaño reducido (0,1 GB).
- Generación de audio para contenidos digitales: producción de narraciones o locuciones en catalán para vídeos, pódcast o audiolibros de forma automatizada mediante el API de Python de phoonnx.
- Aplicaciones web interactivas: síntesis de voz en el navegador con phoonnx.js, útil para interfaces conversacionales o tutoriales que requieran respuestas habladas en catalán sin backend.
- Sistemas de anuncios y avisos automáticos: generación de mensajes de voz dinámicos en catalán para transporte público, comercios o domótica, donde la latencia local y la privacidad son prioritarias.
- Investigación en TTS y evaluación de voces Piper: uso del modelo como referencia o baseline en experimentos de síntesis de voz en catalán, gracias a su licencia MIT y a su formato ONNX portable.
- Prototipado de pipelines de voz: integración en flujos de procesamiento con scriptconv para normalización de texto y fonemización, facilitando la experimentación con distintas voces de la colección VITS de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPU de gama consumer, aunque no se documentan modelos concretos.
- Compatibilidad con GPU consumer: previsiblemente sí por el tamaño del repositorio, pero no se confirma en la información disponible.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en el navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.
- Dependencia externa: espeak-ng (o el port espyak mediante `pip install --pre "phoonnx[espeak]"`), con la advertencia de que algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño repo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ca_es-upc_ona-medium-espeak (este) | VITS | ca-ES | 0,1 GB | MIT | ONNX | Hugging Face, phoonnx, OVOS, navegador |
| Otras voces Piper `ca_ES` (upstream rhasspy/piper-voices) | VITS | ca-ES | no disponible | MIT (según upstream) | ONNX | Hugging Face |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | no disponible | MIT (según upstream) | ONNX | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas para una comparación cuantitativa; la comparativa se limita a arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS en catalán (`ca-ES`); no soporta otros idiomas ni tareas de generación de texto, razonamiento o visión.
- La calidad de pronunciación depende de espeak-ng: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Requiere instalar espeak-ng de forma externa (o el extra `phoonnx[espeak]`), lo que añade una dependencia al despliegue.
- No se documentan sesgos, riesgos de alucinación (no aplicable en el sentido de LLM) ni limitaciones de contexto; al ser un TTS, el riesgo principal es una prosodia o pronunciación incorrecta.
- Licencia MIT, que permite uso comercial, pero la model card indica que la licencia procede de la declaración upstream de `rhasspy/piper-voices`; conviene verificar los términos del proyecto original antes de un uso comercial a gran escala.
- No se publican parámetros totales, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.
- La fecha de creación indicada (2026-11-16) es posterior a la fecha habitual de consulta; conviene verificar la vigencia de los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-upc_ona-medium-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/ca/ca_ES/upc_ona/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
