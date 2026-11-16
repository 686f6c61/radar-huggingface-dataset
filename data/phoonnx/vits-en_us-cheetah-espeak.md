# Phoonnx/vits-en_us-cheetah-espeak

## Resumen

vits-en_us-cheetah-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo original procede del repositorio HAV0X1014/KF-PiperTTS-voices, en su variante Cheetah, y su autor es agentvibe. Phoonnx se limita a adaptar y distribuir los pesos en formato ONNX junto con la integracion necesaria para la inferencia en Python y en el ecosistema OVOS.

El modelo esta especializado en ingles estadounidense (en-US) y recibe como entrada fonemas en alfabeto IPA generados por espeak-ng, no texto plano directamente. Esto lo situa en la estela de las voces Piper, pensadas para sintesis local, ligera y de baja latencia en dispositivos con recursos limitados, mas que para sintesis de alta fidelidad en servidor.

Su relevancia actual es acotada: se trata de un empaquetado de una voz concreta dentro de una coleccion mas amplia de modelos VITS para phoonnx, con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. Resulta util para quien ya trabaje con phoonnx u OVOS y necesite una voz en ingles integrada en ese pipeline, pero no constituye una propuesta nueva de modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta, con alineamiento monotonico aprendido de forma implicita. Permite sintesis de audio a partir de fonemas sin necesidad de un modelo acustico y un vocoder separados, lo que reduce la latencia y el coste computacional en inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales del modelo original. La model card unicamente indica la procedencia (HAV0X1014/KF-PiperTTS-voices/Cheetah), el autor (agentvibe) y que la entrada es texto fonemizado con espeak-ng en alfabeto IPA. El empaquetado por parte de Phoonnx consiste en la exportacion a ONNX y la integracion con la libreria scriptconv para la normalizacion de texto y la fonemizacion.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fino de la pronunciacion si se construyen los fonemas manualmente.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con demo disponible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje.
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en OVOS: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, de modo que un asistente domestico puede sintetizar respuestas en ingles sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ejecutarse sobre ONNX y con un repositorio de 0,1 GB, puede integrarse en aplicaciones ligeras que necesiten locucion en ingles sin infraestructura de servidor.
- Sintesis en navegador con phoonnx.js: la demo publica en tigregotico.pt/demo muestra el uso de voces VITS en el cliente, lo que permite generar audio sin enviar texto a un backend.
- Prototipado de interfaces conversacionales: util para pruebas rapidas de flujos de voz en ingles antes de invertir en voces comerciales o modelos de mayor calidad.
- Generacion de audiolibros o contenido hablado de forma automatizada en ingles: el modelo acepta texto normalizado por scriptconv y devuelve WAV, integrable en un pipeline de postprocesado.
- Accesibilidad en aplicaciones web en ingles: lectura de contenido textual para usuarios con discapacidad visual, con la ventaja de que la inferencia puede ejecutarse en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB y los modelos VITS de este tipo suelen ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; al ser un modelo ONNX de sintesis de voz, la inferencia en CPU es viable y no requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del repositorio, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-en_us-cheetah-espeak | VITS | en-US | MIT | ONNX | Voz empaquetada para phoonnx |
| Otras voces de la coleccion VITS de Phoonnx | VITS | variable | variable | ONNX | Mismo pipeline y libreria |
| Modelos Piper originales | VITS | variable | variable | ONNX | Origen de muchas de estas voces |
| Modelos TTS comerciales (p. ej. ElevenLabs) | no disponible | multiple | propietaria | API | Mayor calidad, dependencia de servicio |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a aspectos de licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Requiere espeak-ng instalado en el sistema, o la extra `phoonnx[espeak]` con el port espyak, cuyos fonemas pueden diferir y producir pronunciaciones erroneas en algunas palabras.
- La entrada debe ser texto normalizado y fonemizado por scriptconv; un uso directo sin ese front end puede degradar la calidad.
- No hay informacion publicada sobre sesgos, calidad de la voz ni evaluaciones subjetivas (MOS).
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero si puede haber errores de pronunciacion en palabras fuera del dominio de entrenamiento.
- La licencia es MIT segun la model card, pero esta remite a los terminos de la publicacion original (HAV0X1014/KF-PiperTTS-voices); conviene verificar dichos terminos antes de un uso comercial.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No dispone de benchmarks ni de documentacion sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-cheetah-espeak
- Modelo original: https://huggingface.co/HAV0X1014/KF-PiperTTS-voices/tree/main/Cheetah
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
