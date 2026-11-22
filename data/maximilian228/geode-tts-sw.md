# Maximilian228/Geode-TTS-sw

## Resumen

Geode-TTS-sw es un paquete de síntesis de voz (text-to-speech) para suajili, publicado por el desarrollador Maximilian228 como parte de la aplicación Geode. No se trata de un modelo entrenado desde cero, sino de una redistribución del modelo Mimic 3 de Mycroft AI (voz `sw/lanfrica_low`), un sistema VITS de un solo hablante a 22,05 kHz, reempaquetado para funcionar con sherpa-onnx 2.0.1. El paquete incluye el generador ONNX sin cambios respecto al original y un fichero `tokens.txt` que mapea cada identificador de token a un punto de código de uso privado (U+E000 + id).

La aportación técnica principal no está en los pesos, sino en la integración: el autor añade metadatos de sherpa (estilo piper, `add_blank=0`, escalas 0.667 / 0.8 / 1.2) y define un front-end de texto basado en reglas (G2P) para suajili, sin léxico ni eSpeak, cuya especificación y vectores de prueba viven en el repositorio de Geode. La aplicación pasa los identificadores de token directamente como `GenerationConfig.tokens`.

Es relevante para desarrolladores que necesiten TTS en suajili en dispositivos de gama baja: el autor reporta un RTF de 0,19-0,22 y un consumo de 351 MB en un Redmi Note 9 Pro, lo que lo sitúa en el rango de inferencia en tiempo real en hardware móvil. El repositorio es pequeño (0,1 GB) y la licencia es CC-BY-SA-4.0, con atribución obligatoria a Mycroft AI y a los autores del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (generador ONNX, un solo hablante, 22,05 kHz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS por tokens de entrada) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx`; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | suajili (`sw`) |
| Licencia | CC-BY-SA-4.0 (voz); dataset de entrenamiento CC BY 4.0 |
| Formato de pesos | ONNX (`model.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

El modelo subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la arquitectura de Mycroft AI Mimic 3, en su variante de un solo hablante a 22,05 kHz. El paquete redistribuye el generador ONNX sin modificaciones, procedente de `Phoonnx/vits-sw-lanfrica-low-gruut` (revisión 8ee7dff). Los únicos cambios introducidos por el autor son los metadatos de sherpa-onnx (estilo piper, `add_blank=0`, escalas 0.667 / 0.8 / 1.2) y el fichero de tokens.

Los datos de entrenamiento originales provienen del dataset «A Kiswahili Dataset for Development of Text-To-Speech System» de Kiptoo Rono (Universidad Tecnológica Dedan Kimathi, Mendeley Data, DOI 10.17632/vbvj6j6pm9.1), grabado a partir de una Biblia en audio en suajili y publicado bajo CC BY 4.0. No se documentan en la información disponible el número de horas, el número de tokens de entrenamiento ni si hubo etapas de RLHF o ajuste fino adicional. La innovación destacable es el front-end G2P basado en reglas para suajili, sin léxico ni eSpeak, cuyas especificaciones y vectores de prueba (`docs/tts-frontends/sw.md`, `sw_vectors.jsonl`) están en el repositorio de Geode.

## Capacidades

- Síntesis de voz en suajili a partir de texto, con un único hablante y salida a 22,05 kHz.
- Integración nativa con sherpa-onnx 2.0.1 mediante metadatos estilo piper y fichero `tokens.txt`.
- Front-end G2P basado en reglas para suajili, sin dependencia de léxico ni de eSpeak.
- Inferencia en dispositivo (on-device), orientada a aplicaciones móviles y entornos con recursos limitados.
- Entrada de tokens precomputados por la aplicación anfitriona (`GenerationConfig.tokens`), lo que permite controlar el front-end fuera del modelo.
- No se documentan capacidades de clonación de voz, multihablante, emoción, tool calling ni agentes; no aplica a este tipo de modelo.

## Casos de uso

- Lectura de contenidos en suajili en aplicaciones móviles: el modelo sintetiza texto de artículos, noticias o documentación con un RTF de 0,19-0,22 en un Redmi Note 9 Pro, lo que permite reproducción en tiempo real sin conexión.
- Asistentes de voz offline para suajili: al ejecutarse con sherpa-onnx y un front-end G2P sin eSpeak, puede integrarse en asistentes embebidos que no dependen de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla en suajili en dispositivos de gama baja, con un consumo de 351 MB de memoria reportado por el autor.
- Aplicaciones educativas de aprendizaje de suajili: síntesis de vocabulario y frases con pronunciación controlada por el front-end de reglas, útil para ejercicios de escucha.
- Locución automatizada de contenido religioso o comunitario: el dataset de origen es una Biblia en audio, por lo que el dominio de entrenamiento encaja con lectura de textos largos y formales.
- Integración en pipelines de sherpa-onnx ya existentes: al compartir formato y metadatos con otras voces piper/sherpa, puede añadirse como voz adicional en un servidor o aplicación que ya use ese runtime.
- Prototipado de interfaces de voz para mercados de África Oriental: permite validar flujos de TTS en suajili sin coste de API y con licencia de compartición.

## Benchmarks y rendimiento

El autor publica una evaluación de round-trip sobre 30 frases de FLEURS, transcribiendo la salida con un ASR CTC Omnilingual 1B y midiendo CER (Character Error Rate):

| Entrada | CER |
|---|---|
| Grabaciones reales | 3,5 |
| Pipeline original de gruut | 5,6 |
| Este paquete con el front-end de Geode | 7,3 |

Además, se reporta en un Redmi Note 9 Pro un RTF de 0,19-0,22 y un consumo de 351 MB. No se han publicado resultados de benchmarks estándar (MOS, MCD, WER) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor reporta 351 MB de consumo en un Redmi Note 9 Pro (entorno móvil, no GPU de escritorio).
- GPU recomendadas: no se documentan; el modelo está orientado a CPU y a inferencia en dispositivo mediante sherpa-onnx.
- Cabe en GPU de consumo: sí, por tamaño (repositorio de 0,1 GB), aunque no hay datos de rendimiento en GPU publicados.
- Opciones de despliegue: sherpa-onnx 2.0.1 (runtime principal documentado); al ser ONNX, es compatible con otros runtimes ONNX, aunque no se documentan configuraciones alternativas.
- Latencia y throughput: RTF 0,19-0,22 en Redmi Note 9 Pro, es decir, aproximadamente 4,5-5,3 veces más rápido que tiempo real en ese dispositivo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Geode-TTS-sw | VITS (ONNX) | Suajili | 22,05 kHz, un hablante | CC-BY-SA-4.0 | Hugging Face |
| Mimic 3 `sw/lanfrica_low` (Mycroft AI) | VITS | Suajili | 22,05 kHz, un hablante | CC-BY-SA-4.0 | Repositorio MycroftAI/mimic3-voices |
| `Phoonnx/vits-sw-lanfrica-low-gruut` | VITS (ONNX) | Suajili | 22,05 kHz, un hablante | no disponible | Hugging Face |
| Piper (voces suajili) | VITS | Suajili (si existe voz) | 22,05 kHz, un hablante | MIT / varias | GitHub rhasspy/piper |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de información sobre otras voces TTS en suajili con datos verificables en la documentación proporcionada.

## Limitaciones y advertencias

- Un solo hablante: no permite cambio de voz ni clonación; la expresividad es limitada por el modelo VITS original.
- Dominio de entrenamiento restringido: el dataset proviene de una Biblia en audio, lo que puede sesgar la prosodia y el estilo hacia lectura formal y religiosa.
- CER de 7,3 en la evaluación del autor, superior al pipeline original de gruut (5,6) y a grabaciones reales (3,5); la inteligibilidad es aceptable pero no óptima.
- El front-end G2P es específico de suajili y está definido en el repositorio de Geode; no es portable a otros idiomas sin trabajo adicional.
- Licencia CC-BY-SA-4.0: el uso comercial es posible, pero exige atribución a Mycroft AI y a los autores del dataset, indicar los cambios y compartir las obras derivadas bajo la misma licencia.
- El dataset original es CC BY 4.0 y sus autores expresan un deseo (no condición de licencia) de uso para fines no lucrativos, educativos y de beneficio público; conviene respetarlo.
- No se documentan cuantizaciones alternativas ni rendimiento en GPU; el único dato de latencia es en un dispositivo móvil concreto.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de pronunciación incorrecta en palabras fuera del dominio o con grafías ambiguas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes de terceros sobre su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Maximilian228/Geode-TTS-sw
- Aplicación Geode: https://geode.tifu.xyz
- Repositorio de voces Mimic 3 (Mycroft AI): https://github.com/MycroftAI/mimic3-voices
- Modelo base ONNX: https://huggingface.co/Phoonnx/vits-sw-lanfrica-low-gruut
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset de entrenamiento: DOI 10.17632/vbvj6j6pm9.1 (Mendeley Data, Kiptoo Rono, Dedan Kimathi University of Technology)
