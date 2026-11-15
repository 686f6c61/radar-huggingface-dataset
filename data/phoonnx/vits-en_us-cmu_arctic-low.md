# Phoonnx/vits-en_us-cmu_arctic-low

## Resumen

`vits-en_us-cmu_arctic-low` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo convierte texto en ingles estadounidense en audio, tomando como entrada fonemas del alfabeto IPA generados mediante el fonemizador gruut, y produce una onda de audio directamente en una sola etapa, sin necesidad de vocoder separado.

El modelo se distribuye en formato ONNX y esta pensado para su uso dentro del ecosistema phoonnx, una biblioteca Python de sintesis de voz que tambien se integra en OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Su tamano de repositorio es de aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos ligeros aptos para despliegue en entornos con recursos limitados, como dispositivos de borde o asistentes de voz embebidos.

La relevancia de esta ficha radica en que se trata de un modelo de voz de baja huella, con licencia CC-BY-SA-4.0, orientado a aplicaciones de sintesis en ingles dentro de asistentes de voz open source. No obstante, la informacion publicada sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada, por lo que muchos de los parametros tecnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un enfoque de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial en el entrenamiento, permitiendo generar audio directamente a partir de fonemas sin un vocoder externo. La entrada de texto se procesa mediante el fonemizador gruut, que normaliza el texto y lo convierte a fonemas IPA antes de pasarlo al modelo.

No se dispone de informacion sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens o muestras de audio utilizadas, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste fino adicional. El modelo procede del repositorio `mimic3-voices` de Mycroft AI, en la ruta `en_US/cmu-arctic_low`, lo que sugiere que se entreno sobre el corpus CMU ARCTIC en su configuracion de baja calidad, pero este extremo no se detalla en la informacion proporcionada.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Conversion de texto a fonemas IPA mediante el fonemizador gruut.
- Generacion de audio en formato WAV a traves de la API de phoonnx (`synthesize_wav`).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion sobre pesos ONNX, lo que facilita el despliegue en entornos Python y potencialmente en otros runtimes compatibles con ONNX.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingueismo, tool calling ni agentes.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra directamente como modulo TTS mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente open source sintetice respuestas en ingles con una huella de almacenamiento reducida (~0,1 GB).
- Lectura de notificaciones y alertas en sistemas domoticos: al ser un modelo ligero en ONNX, puede ejecutarse en dispositivos de borde para anunciar eventos del hogar sin depender de servicios en la nube.
- Generacion de audiolibros o contenido narrado en ingles: la API `synthesize_wav` permite convertir lotes de texto en ficheros WAV para pipelines de publicacion automatizada.
- Pruebas de integracion en pipelines de CI/CD de aplicaciones de voz: el modelo sirve como referencia ligera para validar la cadena texto-fonema-audio en entornos de desarrollo sin grandes requisitos de hardware.
- Prototipado de interfaces conversacionales: desarrolladores que construyen asistentes en Python pueden usar phoonnx y este modelo para obtener respuestas habladas rapidamente durante la fase de prototipo.
- Accesibilidad: lectura en voz alta de contenido textual en ingles para aplicaciones de apoyo a personas con discapacidad visual, siempre que se respete la licencia CC-BY-SA-4.0 en la distribucion del modelo y obras derivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (~0,1 GB) sugiere un modelo muy ligero, probablemente ejecutable en CPU.
- GPU recomendadas: no disponible; por su tamano, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: probablemente si, dado el reducido tamano, aunque no se confirma en la informacion.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano |
|---|---|---|---|---|---|
| vits-en_us-cmu_arctic-low (este modelo) | VITS | en-US | ONNX | CC-BY-SA-4.0 | ~0,1 GB |
| Otros modelos de la coleccion VITS de Phoonnx | VITS | variable | ONNX | variable | no disponible |
| Modelos VITS de Mycroft AI en mimic3-voices | VITS | en-US y otros | no disponible | CC-BY-SA-4.0 (upstream) | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- La licencia CC-BY-SA-4.0 exige compartir las obras derivadas bajo la misma licencia y reconocer la autoria, lo que puede condicionar el uso comercial y la redistribucion.
- No se documentan sesgos especificos, pero al entrenarse presumiblemente sobre CMU ARCTIC puede reflejar las caracteristicas de dicho corpus.
- Riesgo de alucinacion o artefactos de audio no cuantificado en la informacion disponible.
- No se dispone de informacion sobre calidad subjetiva (MOS), latencia ni throughput.
- La integracion depende de la libreria phoonnx y del fonemizador gruut, lo que anade dependencias en el pipeline de despliegue.
- El modelo se encuentra en fase de empaquetado reciente (creado en noviembre de 2026 segun los metadatos) y cuenta con muy pocas descargas (27) y ningun like, lo que sugiere una adopcion limitada y poca validacion comunitaria.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_us-cmu_arctic-low](https://huggingface.co/Phoonnx/vits-en_us-cmu_arctic-low)
- [Repositorio upstream en MycroftAI/mimic3-voices](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_US/cmu-arctic_low)
- [phoonnx (libreria ONNX TTS)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (normalizacion y fonemizadores)](https://github.com/TigreGotico/scriptconv)
- [Coleccion VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
