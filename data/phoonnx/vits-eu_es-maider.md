# Phoonnx/vits-eu_es-maider

## Resumen

vits-eu_es-maider es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el HiTZ Center (Universidad del País Vasco) bajo el identificador HiTZ/TTS-eu_maider. Phoonnx lo ha empaquetado en formato ONNX para su uso con su librería de TTS phoonnx, lo que facilita su integración en aplicaciones Python y en el asistente de voz OVOS. El modelo está especializado en euskera (código `eu-ES`) y convierte texto en fonemas mediante el fonemizador AhoTTS antes de generar la onda de audio.

Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) orientado a la síntesis de voz en euskera, un idioma con recursos limitados en el ecosistema TTS. Su relevancia radica en ofrecer una alternativa ligera, con licencia Apache 2.0 y formato ONNX, para integrar voces en euskera en aplicaciones de asistencia por voz, lectura de textos o sistemas embebidos sin depender de servicios en la nube.

La ficha se basa en la información disponible en la model card y en los metadatos de Hugging Face; los detalles sobre datos de entrenamiento, número de parámetros y benchmarks no están publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | euskera (`eu-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas AhoTTS en alfabeto IPA |
| Libreria | phoonnx |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. Este enfoque permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder externo, lo que reduce la latencia y simplifica el despliegue.

El modelo original fue desarrollado por el HiTZ Center y publicado como HiTZ/TTS-eu_maider. Phoonnx lo ha convertido a ONNX y lo ha integrado en su librería, añadiendo un front-end de texto basado en scriptconv que normaliza el texto y lo convierte a fonemas AhoTTS en alfabeto IPA antes de la inferencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz en euskera (`eu-ES`) a partir de texto escrito.
- Conversión de texto a fonemas mediante el fonemizador AhoTTS (alfabeto IPA) integrado en scriptconv.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Uso en Python mediante `TTSModelManager` y la voz `hitz/eu_maider-vits`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo TTS.
- No se han documentado capacidades multilingües más allá del euskera.

## Casos de uso

- Asistencia por voz en euskera: integración en el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para leer respuestas y notificaciones en euskera, aprovechando la licencia Apache 2.0 y el formato ONNX para despliegue local.
- Lectura de textos y accesibilidad: conversión de documentos, artículos o avisos a audio en euskera para personas con discapacidad visual o para consumo en formato audio, usando la API `synthesize_wav` de phoonnx.
- Sistemas de megafonía y avisos automatizados: generación de anuncios pregrabados o dinámicos en euskera en estaciones, aeropuertos o edificios públicos, con un modelo ligero (~0,1 GB) que puede ejecutarse en hardware modesto.
- Aplicaciones educativas de aprendizaje del euskera: síntesis de palabras y frases para ejercicios de pronunciación, aprovechando la salida fonémica IPA del front-end AhoTTS.
- Integración en pipelines de Python: uso como componente TTS dentro de aplicaciones de procesamiento de lenguaje natural o de generación de contenido multimedia, gracias a la librería phoonnx y al formato ONNX.
- Prototipado de interfaces de voz: desarrollo de asistentes conversacionales o chatbots con salida de voz en euskera en entornos de investigación, sin depender de APIs comerciales.
- Despliegue en dispositivos con recursos limitados: al ser un modelo ONNX de tamaño reducido, puede ejecutarse en entornos embebidos o en CPU, lo que facilita su uso en quioscos interactivos o dispositivos IoT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (~0,1 GB) se espera un consumo de memoria reducido, apto para CPU.
- GPU recomendadas: no disponible; al ser un modelo ONNX pequeño, no requiere GPU dedicada para funcionar.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido del modelo, aunque no se especifican modelos concretos.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución mediante ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia, el modelo upstream HiTZ/TTS-eu_maider es la fuente original de este empaquetado, pero no se han publicado datos comparativos de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| vits-eu_es-maider (este) | no disponible | no aplica | Apache 2.0 | ONNX | eu-ES |
| HiTZ/TTS-eu_maider (upstream) | no disponible | no aplica | Apache 2.0 | no disponible | eu-ES |
| Otros modelos VITS de Phoonnx | no disponible | no aplica | Apache 2.0 (según colección) | ONNX | varios |

## Limitaciones y advertencias

- El modelo solo soporta euskera (`eu-ES`); no está entrenado para otros idiomas.
- No se dispone de información sobre sesgos de género, acento o dialecto en la voz generada.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero la calidad de la síntesis puede degradarse con texto fuera de dominio, abreviaturas o símbolos no normalizados por scriptconv.
- La entrada debe pasar por el fonemizador AhoTTS; un texto mal normalizado puede producir pronunciaciones incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream HiTZ/TTS-eu_maider y de las dependencias (scriptconv, phoonnx).
- No se han publicado métricas de calidad (MOS, WER) ni benchmarks, lo que dificulta evaluar su rendimiento frente a alternativas.
- El modelo está empaquetado para phoonnx; su uso fuera de esa librería requiere adaptar el pipeline ONNX y el front-end de fonemas.

## Enlaces

- [Hugging Face: Phoonnx/vits-eu_es-maider](https://huggingface.co/Phoonnx/vits-eu_es-maider)
- [Modelo upstream: HiTZ/TTS-eu_maider](https://huggingface.co/HiTZ/TTS-eu_maider)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
