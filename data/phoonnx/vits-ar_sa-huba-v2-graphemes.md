# Phoonnx/vits-ar_sa-huba-v2-graphemes

## Resumen

`vits-ar_sa-huba-v2-graphemes` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por Phoonnx a partir del modelo original `wasmdashai/vits-ar-sa-huba-v2`. Está especializado en árabe de Arabia Saudí (`ar-SA`) y utiliza la arquitectura VITS, un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador adversarial para producir audio de forma directa, sin necesidad de un vocoder externo.

El modelo resuelve el problema de la conversión de texto a voz en árabe saudí con una interfaz simplificada: recibe caracteres del texto (front end basado en grafemas, sin fonemización compleja) y devuelve una forma de onda lista para reproducir. Su empaquetado para la librería `phoonnx` y el plugin `ovos-tts-plugin-phoonnx` lo hace directamente utilizable en entornos OVOS/Mycroft.

Es relevante para desarrolladores que necesitan TTS en árabe dentro de asistentes de voz de código abierto, con licencia MIT y un tamaño de repositorio muy reducido (0,1 GB), lo que facilita su despliegue en entornos con recursos limitados. El modelo es pequeño y especializado; no está pensado para generación de texto ni para otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | árabe de Arabia Saudí (`ar-SA`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | caracteres (grafemas) |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor del modelo original | wasmdashai |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que integra en un único modelo un codificador de texto, un prior variacional, un decodificador de audio y un discriminador adversarial entrenado de forma conjunta. Este diseño permite generar formas de onda directamente desde el texto sin un vocoder separado, lo que reduce la latencia y la complejidad del pipeline. En este caso concreto, el front end de texto trabaja a nivel de grafemas mediante `GraphemePhonemizer` de la librería `scriptconv`, es decir, no se realiza una conversión fonética explícita: el modelo recibe los caracteres del texto normalizado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo original fue publicado por wasmdashai y Phoonnx se limita a empaquetarlo en ONNX para su uso con su librería. La innovación destacable en este caso es el empaquetado ONNX y la integración con el ecosistema OVOS, más que una innovación arquitectónica propia.

## Capacidades

- Síntesis de voz en árabe de Arabia Saudí (`ar-SA`) a partir de texto en caracteres.
- Generación de audio en formato WAV mediante la API `synthesize_wav`.
- Front end de normalización de texto y conversión a grafemas mediante `scriptconv`.
- Integración con OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en ONNX Runtime, lo que permite despliegue en CPU y en entornos sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en árabe saudí: el modelo se integra en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en `ar-SA` en asistentes domésticos de código abierto.
- Lectura de notificaciones y alertas: con un repositorio de 0,1 GB y ejecución ONNX, puede desplegarse en dispositivos de bajos recursos para leer mensajes del sistema o notificaciones en árabe.
- Accesibilidad para personas con discapacidad visual: conversión de texto de aplicaciones o documentos a voz en árabe saudí, con un pipeline ligero que no requiere GPU.
- Sistemas de información pública en kioscos: síntesis de anuncios y mensajes pregrabados dinámicamente en árabe saudí, donde la licencia MIT facilita la integración comercial.
- Prototipado rápido de interfaces de voz: la instalación vía `pip install --pre phoonnx` y la API de `TTSModelManager` permiten integrar TTS en pocas líneas de código para pruebas de concepto.
- Investigación en TTS para árabe: al ser un modelo VITS empaquetado en ONNX con front end de grafemas, sirve como base para comparar enfoques de fonemización frente a grafemas en árabe.
- Automatización de respuestas telefónicas o IVR en árabe saudí, con la ventaja de una huella de almacenamiento mínima y despliegue en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que la inferencia se realice en CPU sin necesidad de GPU, aunque no se especifican requisitos oficiales.
- GPU recomendadas: no disponible. El modelo está empaquetado para ONNX Runtime y no se documentan requisitos de GPU.
- ¿Cabe en GPU de consumo? Sí, por el tamaño del repositorio (0,1 GB) es esperable que quepa en cualquier GPU de consumo, aunque no se confirma en la documentación.
- Opciones de despliegue: `phoonnx` (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo | Contexto |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-ar_sa-huba-v2-graphemes` | VITS | ar-SA | MIT | ONNX | 0,1 GB | no aplica |
| `wasmdashai/vits-ar-sa-huba-v2` | VITS | ar-SA | no disponible en la información | no disponible | no disponible | no aplica |
| Otros modelos VITS empaquetados por Phoonnx | VITS | varios | MIT (según colección) | ONNX | variable | no aplica |

La comparativa con alternativas de otros autores no está disponible en la información proporcionada. El modelo original de wasmdashai es la referencia directa, pero no se dispone de sus especificaciones detalladas ni de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS: no genera texto, no razona y no soporta tool calling ni agentes.
- Cobertura lingüística limitada a árabe de Arabia Saudí (`ar-SA`); no se documenta soporte para otros dialectos o idiomas.
- Front end basado en grafemas: al no usar fonemización explícita, la pronunciación de palabras ambiguas o extranjerismos puede ser imprecisa.
- No se han publicado benchmarks de calidad de audio (MOS, WER) en la información disponible, por lo que no se puede evaluar objetivamente su fidelidad.
- Riesgo de artefactos o pronunciación incorrecta en texto con números, abreviaturas o signos de puntuación atípicos, aunque `scriptconv` realiza normalización.
- Licencia MIT: permite uso comercial, pero el autor indica que la licencia del modelo original rige sus propios términos; conviene verificar la licencia de `wasmdashai/vits-ar-sa-huba-v2` antes de un despliegue comercial.
- El modelo se distribuye en formato ONNX y depende de la librería `phoonnx` (en versión pre-release, `pip install --pre phoonnx`), lo que implica cierta inestabilidad de API.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no especificados, puede reflejar sesgos presentes en el corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ar_sa-huba-v2-graphemes
- Modelo original: https://huggingface.co/wasmdashai/vits-ar-sa-huba-v2
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
