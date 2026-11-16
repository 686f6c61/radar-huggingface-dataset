# Phoonnx/vits-de_de-thorsten-medium-espeak

## Resumen

`vits-de_de-thorsten-medium-espeak` es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo genera audio en alemán estándar (`de-DE`) a partir de texto, usando fonemas IPA producidos por espeak-ng como entrada al front-end acústico. Es, por tanto, un modelo de conversión texto-a-fonemas-a-mel-a-audio, no un modelo de lenguaje.

Su relevancia es práctica: ofrece TTS neuronal en alemán con un peso de repositorio de solo 0,1 GB, lo que permite despliegue en CPU y en dispositivos de bajos recursos. Forma parte del ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, y de la colección de voces VITS empaquetadas para phoonnx. La licencia MIT del upstream facilita su integración en productos comerciales.

El modelo no es un transformer generativo de texto: es un VITS de tamaño "medium" (variante de Piper), sin parámetros publicados, sin ventana de contexto en el sentido de los LLM y sin benchmarks de comprensión. Su evaluación debe hacerse en términos de calidad de síntesis (MOS, inteligibilidad) y latencia, no de MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | MIT (declarada en la model card del upstream `rhasspy/piper-voices`) |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional, un decoder acústico basado en normalizing flows y un discriminador adversarial para entrenamiento. El modelo concreto procede de la voz `de_DE/thorsten/medium` del repositorio `rhasspy/piper-voices`, entrenada por Rhasspy (proyecto Piper) sobre un corpus de habla alemana asociado a la voz "thorsten". No se dispone de información sobre el número de horas de audio, la composición del dataset ni si se aplicaron técnicas de alineamiento forzado o fine-tuning adicional en la información proporcionada.

La innovación relevante en este empaquetado es el front-end: el texto se normaliza con `scriptconv` y se convierte a fonemas IPA mediante `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` (port espyak). La model card advierte que algunos fonemas de espyak difieren de los de espeak-ng, lo que puede producir pronunciaciones incorrectas en determinadas palabras. La inferencia se realiza en ONNX, lo que permite ejecución en CPU sin GPU.

## Capacidades

- Síntesis de voz en alemán estándar (`de-DE`) a partir de texto plano.
- Entrada fonémica en alfabeto IPA generada por espeak-ng; el modelo no acepta texto crudo sin el front-end de fonemización.
- Generación de audio WAV mediante `voice.synthesize_wav(text, wav_file)` en la API de phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js` (demo en `tigregotico.pt/demo`), con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión: es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del alemán.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el modelo se selecciona como voz `piper/de_DE-thorsten-medium` en `mycroft.conf` y responde a consultas en alemán con latencia baja en CPU, adecuado para dispositivos tipo Raspberry Pi.
- Lectura de notificaciones y alertas en alemán: integrado en pipelines de automatización del hogar, sintetiza mensajes cortos y dinámicos sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: convierte texto de pantalla o documentos en audio alemán con un peso de 0,1 GB, desplegable localmente y sin coste por petición.
- Audioguías y contenido turístico localizado: genera narraciones en alemán para aplicaciones móviles o web, con la ventaja de que el modelo ONNX puede ejecutarse en el cliente vía `phoonnx.js`.
- Prototipado de interfaces conversacionales en alemán: permite validar flujos de voz antes de contratar un TTS comercial, gracias a la licencia MIT y a la ausencia de dependencias de API.
- Generación de audiolibros o podcasts de bajo volumen: síntesis por lotes de texto largo en servidor CPU, con la salvedad de que la naturalidad de una voz "medium" de Piper es inferior a la de modelos neuronales grandes.
- Pruebas de regresión en pipelines de TTS: al ser un modelo pequeño y determinista en su arquitectura, sirve como referencia para comparar calidad y latencia frente a otras voces de la colección VITS de phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es ONNX y está pensado para inferencia en CPU. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no disponibles; no se documenta aceleración por GPU para este empaquetado.
- Cabe en cualquier GPU consumer e incluso en CPU de un solo núcleo moderno, dado el tamaño del artefacto.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS) y `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-de_de-thorsten-medium-espeak` | VITS | de-DE | MIT | ONNX | 0,1 GB | Objeto de esta ficha |
| `rhasspy/piper-voices` (voz `de_DE/thorsten/medium`) | VITS | de-DE | MIT | ONNX (Piper) | no disponible | Upstream directo; mismo modelo sin empaquetado phoonnx |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | MIT (según upstream) | ONNX | variable | Misma librería de inferencia, distintos idiomas y hablantes |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo alemán (`de-DE`); no sintetiza otros idiomas ni code-switching.
- Dependencia de espeak-ng: sin él, el front-end usa espyak, cuyos fonemas difieren y pueden producir palabras mal pronunciadas.
- Calidad "medium": la variante medium de Piper prioriza tamaño y velocidad sobre naturalidad; puede presentar prosodia plana o artefactos en frases largas o con puntuación compleja.
- Sin datos de entrenamiento publicados: no se puede evaluar el sesgo de hablante, acento o dominio del corpus original.
- Riesgo de alucinación acústica: como todo TTS, puede generar audio plausible pero incorrecto ante texto mal normalizado, abreviaturas o números no expandidos por `scriptconv`.
- Licencia MIT heredada del upstream: permite uso comercial, pero conviene verificar la model card original de `rhasspy/piper-voices` para confirmar la procedencia de los datos de entrenamiento.
- Sin soporte documentado de GPU ni de cuantización: el rendimiento depende de la CPU y de la implementación ONNX Runtime subyacente.
- Repositorio con 20 descargas y 0 likes: ecosistema pequeño, menor probabilidad de soporte comunitario o corrección de errores.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten-medium-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
