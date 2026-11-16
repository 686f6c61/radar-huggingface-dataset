# Phoonnx/vits-en_gb-jenny_dioco-medium-espeak

## Resumen

vits-en_gb-jenny_dioco-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el usuario Phoonnx. No se trata de un modelo entrenado desde cero por este autor, sino de un reempaquetado del modelo original de Rhasspy, concretamente la voz `en_GB-jenny_dioco-medium` del repositorio `rhasspy/piper-voices`. Phoonnx lo distribuye en formato ONNX para que pueda ejecutarse con su libreria homonima, phoonnx, orientada a la inferencia TTS en Python y en el ecosistema OVOS.

El modelo resuelve el problema de la sintesis de voz en ingles britanico (en-GB) con una voz femenina de calidad media, pensada para aplicaciones de asistente de voz, lectura de texto y sistemas embebidos. Su tamano de repositorio es de aproximadamente 0,1 GB, lo que lo hace muy ligero y adecuado para despliegues con recursos limitados. La entrada de texto no es texto plano directo, sino fonemas generados mediante espeak-ng en alfabeto IPA, lo que condiciona el pipeline de uso.

La relevancia actual de esta ficha es acotada: se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, y su interes radica en ser una pieza del ecosistema phoonnx/Piper para TTS local y offline. No es un modelo de lenguaje generativo ni compite en la categoria de LLMs, sino un componente especializado de sintesis de voz que merece evaluarse por su licencia MIT, su ligereza y su integracion con OVOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en normalizing flows y un discriminador adversarial para el entrenamiento. El modelo original fue entrenado por Rhasspy como parte del proyecto Piper, que produce voces TTS ligeras y ejecutables en local. Phoonnx no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la model card.

La innovacion tecnica relevante en este empaquetado es la integracion del front-end de texto: phoonnx delega la normalizacion y la fonemizacion en la libreria scriptconv, que usa el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`. El modelo espera fonemas IPA generados por espeak-ng, no texto plano, lo que implica que el pipeline debe incluir espeak-ng (o el port espyak) para que la sintesis funcione correctamente. La model card advierte que algunos fonemas de espyak difieren de los de espeak-ng, lo que puede provocar errores de pronunciacion en ciertas palabras.

## Capacidades

- Sintesis de voz en ingles britanico (en-GB) con voz femenina identificada como "jenny_dioco" en calidad "medium".
- Generacion de audio WAV a partir de texto, previa conversion a fonemas IPA mediante espeak-ng.
- Ejecucion en Python a traves de la libreria phoonnx y su `TTSModelManager`.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js, con demo disponible en tigregotico.pt/demo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision; es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a en-GB; no se documentan otros idiomas.

## Casos de uso

- Asistente de voz local en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente domotico o de escritorio genere respuestas habladas en ingles britanico sin depender de servicios en la nube, gracias a su tamano de ~0,1 GB y su ejecucion ONNX.
- Lectura de texto en aplicaciones de accesibilidad: se puede usar para convertir articulos, notificaciones o documentos en audio WAV mediante `voice.synthesize_wav`, adecuado para lectores de pantalla y sistemas de asistencia a personas con discapacidad visual.
- Sintesis de voz en navegador: con phoonnx.js, el modelo puede ejecutarse del lado del cliente para generar audio en aplicaciones web sin enviar texto a un servidor, lo que reduce latencia y mejora la privacidad.
- Sistemas embebidos y dispositivos de bajo consumo: al ser un modelo VITS "medium" en ONNX de ~0,1 GB, es viable en Raspberry Pi y dispositivos similares para interfaces de voz offline.
- Generacion de audiolibros y contenido narrado: la voz en-GB permite producir narraciones de forma automatizada, aunque la calidad "medium" lo hace mas adecuado para contenido informal o prototipos que para produccion editorial.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia para validar integraciones con phoonnx y scriptconv antes de desplegar voces de mayor calidad o de otros idiomas.
- Automatizacion de avisos y alertas: se puede integrar en sistemas de monitorizacion que generen mensajes hablados en ingles britanico para operadores o usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) se trata de un modelo muy ligero que puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se documentan; al ser un modelo ONNX de ~0,1 GB, cualquier GPU consumer moderna es sobradamente suficiente, pero no se aportan datos de rendimiento por GPU.
- Cabe en GPU consumer: si, por el tamano del modelo, aunque no se especifican modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS VITS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_gb-jenny_dioco-medium-espeak (Phoonnx) | VITS | en-GB | ~0,1 GB | MIT | ONNX | Hugging Face, 0 descargas |
| rhasspy/piper-voices en_GB-jenny_dioco medium (original) | VITS | en-GB | no disponible | MIT | no disponible | Hugging Face (upstream) |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | no disponible | MIT (segun coleccion) | ONNX | Hugging Face |

La comparativa se limita al ecosistema Piper/Phoonnx porque no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada. El modelo original de Rhasspy es la referencia directa; este empaquetado anade la integracion con phoonnx y scriptconv, pero no cambia la arquitectura ni los pesos subyacentes.

## Limitaciones y advertencias

- Solo soporta ingles britanico (en-GB); no es multilingue y no se documentan otras variantes.
- Requiere espeak-ng instalado para generar los fonemas IPA; sin el, la sintesis falla o usa espyak, cuyos fonemas pueden diferir y provocar pronunciaciones incorrectas.
- La calidad es "medium", inferior a voces de mayor calidad; puede presentar artefactos o prosodia limitada en textos complejos.
- Riesgo de errores de pronunciacion en palabras poco frecuentes, nombres propios y terminos tecnicos, al depender de la fonemizacion de espeak-ng.
- No se documentan sesgos especificos, pero al ser una voz sintetica femenina en ingles britanico puede no representar diversidad de acentos o generos.
- No hay datos publicados de benchmarks, latencia ni throughput, lo que dificulta evaluar su rendimiento en produccion.
- El modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria; conviene probarlo exhaustivamente antes de usarlo en produccion.
- La licencia es MIT segun la model card, pero se indica que la declaracion proviene del modelo upstream de rhasspy/piper-voices; conviene verificar la licencia del repositorio original antes de un uso comercial.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-jenny_dioco-medium-espeak
- Modelo upstream (Rhasspy Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/jenny_dioco/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
