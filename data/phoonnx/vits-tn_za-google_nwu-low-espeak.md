# Phoonnx/vits-tn_za-google_nwu-low-espeak

## Resumen

`vits-tn_za-google_nwu-low-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo está especializado en la síntesis de voz en tshivenda (código ISO `tn`), una lengua bantú hablada principalmente en Sudáfrica y Zimbabue, y constituye una de las pocas opciones de TTS disponibles para este idioma.

El modelo resuelve el problema de la síntesis de voz de calidad para una lengua de bajos recursos, permitiendo a desarrolladores integrar voces en tshivenda en aplicaciones de accesibilidad, asistentes de voz o sistemas de información pública. La entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados mediante espeak-ng, lo que condiciona el pipeline de inferencia.

El repositorio tiene un tamaño aproximado de 0,1 GB y se distribuye bajo licencia CC-BY-SA-4.0. La relevancia actual del modelo radica en su empaquetado ONNX, que facilita el despliegue en entornos Python y en el ecosistema OVOS (Open Voice OS), así como su integración con herramientas de normalización de texto como `scriptconv`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | ONNX (formato empaquetado); no se detallan niveles de cuantización adicionales |
| Idiomas soportados | tshivenda (`tn`, `tn-ZA`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Librería | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de dominio temporal y espectral. Este enfoque permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que simplifica el despliegue.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo procede del repositorio `mimic3-voices` de Mycroft AI, donde se alojan voces de Mimic 3; la variante `google-nwu_low` sugiere un dataset de origen vinculado a Google y a la Universidad North-West (NWU), pero no se detalla en la información proporcionada. La innovación técnica destacable es el empaquetado ONNX para inferencia multiplataforma y la integración con el fonemizador espeak-ng mediante `scriptconv`.

## Capacidades

- Síntesis de voz (text-to-speech) en tshivenda a partir de fonemas IPA generados por espeak-ng.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav()` de phoonnx.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto a fonemas mediante `scriptconv` con el fonemizador `EspeakPhonemizer`.
- Ejecución en Python y en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-step ni otras capacidades de modelos de lenguaje, al ser un modelo TTS puro.
- Capacidad multilingüe limitada exclusivamente al tshivenda.

## Casos de uso

- Accesibilidad para hablantes de tshivenda: lectura de textos en voz alta para personas con discapacidad visual, usando la API de phoonnx para sintetizar párrafos completos desde fonemas espeak-ng.
- Asistentes de voz en OVOS: integración mediante `ovos-tts-plugin-phoonnx` configurando la voz `mimic3/tn_ZA/google-nwu_low` en `mycroft.conf` para respuestas habladas en tshivenda.
- Sistemas de información pública en Sudáfrica: anuncios automatizados en tshivenda para transporte, sanidad o servicios municipales, aprovechando el bajo tamaño del modelo (~0,1 GB) para despliegue en dispositivos modestos.
- Aplicaciones educativas: generación de material audiolectura para aprendizaje del tshivenda, con normalización de texto previa mediante `scriptconv`.
- Integración web: uso de `phoonnx.js` para sintetizar voz en el navegador sin backend, con demo disponible en `tigregotico.pt/demo`.
- Prototipado de pipelines TTS multilingües: combinación con otras voces VITS de la colección Phoonnx para cubrir varios idiomas en una misma aplicación.
- Investigación en lenguas de bajos recursos: evaluación y comparación de voces VITS para tshivenda en estudios de síntesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa ~0,1 GB, por lo que la inferencia es ligera y cabe en CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de pequeño tamaño, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer e incluso en CPU, dado el tamaño del artefacto.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Requisito adicional: espeak-ng instalado (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` que proporciona el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-tn_za-google_nwu-low-espeak | VITS | tshivenda (`tn`) | ONNX | CC-BY-SA-4.0 | Hugging Face (Phoonnx) |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | ONNX | según voz | Hugging Face (Phoonnx) |
| Voces originales de Mycroft Mimic 3 | VITS | varios | varios | según voz | GitHub MycroftAI/mimic3-voices |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza tshivenda; no es multilingüe ni acepta texto en otros idiomas.
- Requiere espeak-ng para generar los fonemas IPA; sin él, el extra `phoonnx[espeak]` usa espyak, cuyos fonemas pueden diferir y provocar pronunciaciones incorrectas.
- La entrada debe ser fonemas espeak-ng, no texto plano directo; es necesario un paso de normalización con `scriptconv`.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí puede haber errores de pronunciación en palabras fuera del dominio de entrenamiento.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y compartir igual, lo que obliga a licenciar obras derivadas bajo la misma licencia.
- No se detallan sesgos específicos ni limitaciones de contexto (no aplica contexto en TTS).
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica escasa validación comunitaria; conviene evaluar la calidad de audio antes de producción.
- No se especifican parámetros totales ni detalles del dataset de entrenamiento, lo que limita la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-tn_za-google_nwu-low-espeak
- Repositorio upstream (MycroftAI/mimic3-voices, voz tn_ZA/google-nwu_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/tn_ZA/google-nwu_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
