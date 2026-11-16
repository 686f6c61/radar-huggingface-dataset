# Phoonnx/vits-vi_vn-infore-espeak

## Resumen

vits-vi_vn-infore-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por phatjkk en el repositorio github.com/phatjkk/vits-tts-vietnamese y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en vietnamita (vi-VN) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

El modelo resuelve el problema de la síntesis de voz en vietnamita dentro del ecosistema phoonnx y OVOS (Open Voice OS), permitiendo integrar una voz vietnamita en asistentes de voz y aplicaciones de lectura en voz alta mediante un pipeline estandarizado de ONNX Runtime. Su relevancia radica en que amplía la colección de voces VITS empaquetadas para phoonnx con un idioma de bajos recursos como el vietnamita, con licencia MIT y un tamaño de repositorio reducido (0,1 GB).

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni los datos de entrenamiento del modelo original en la información proporcionada. La entrada de texto se realiza exclusivamente a través de fonemas espeak, lo que condiciona tanto el despliegue como la calidad de la pronunciación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | vietnamita (vi-VN) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Autor original | phatjkk |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo basado en normalizing flows y un discriminador adversarial multiperiodo para el entrenamiento. El modelo genera formas de onda directamente desde fonemas sin necesidad de un vocoder externo, lo que simplifica el despliegue y reduce la latencia del pipeline.

El modelo original fue entrenado por phatjkk en el repositorio vits-tts-vietnamese; sin embargo, la información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicionales. La innovación destacable del empaquetado es la integración con phoonnx, que gestiona la fonemización mediante espeak-ng (o su port espyak) y la normalización de texto mediante scriptconv antes de alimentar el modelo.

## Capacidades

- Síntesis de voz en vietnamita (vi-VN) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante espeak-ng, con normalización previa del texto a través de scriptconv.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecución en navegador mediante phoonnx.js, con entrada por espeak o unicode.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada).
- No es un modelo multilingüe: está limitado al vietnamita.

## Casos de uso

- Lectura en voz alta de documentos en vietnamita: el modelo sintetiza frases completas a WAV, adecuado para convertir artículos, noticias o libros electrónicos en audio mediante un script que llame a `voice.synthesize_wav` por cada párrafo.
- Asistente de voz en OVOS: se configura como módulo TTS en `mycroft.conf` con la voz `piper_community/phatjkk/vi-VN_InfoRe`, permitiendo que un asistente doméstico responda en vietnamita.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de lectura que necesiten una voz vietnamita con licencia MIT y pesos ONNX de pequeño tamaño.
- Generación de audiolibros y pódcasts: síntesis por lotes de guiones o textos largos, con la ventaja de que el modelo es ligero (0,1 GB) y puede ejecutarse en CPU o GPU modesta.
- Aplicaciones web de aprendizaje de idiomas: mediante phoonnx.js se puede ofrecer pronunciación de palabras y frases vietnamitas en el navegador sin backend, usando el demo de tigregotico.pt/demo como referencia.
- Prototipado de interfaces de voz: al estar empaquetado para phoonnx y OVOS, permite validar rápidamente flujos de TTS en vietnamita antes de invertir en modelos comerciales o de mayor tamaño.
- Localización de contenido: generación de pistas de audio en vietnamita para vídeos, tutoriales o materiales formativos, con la salvedad de que la calidad depende de la fonemización espeak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, es plausible que quepa en GPUs consumer con pocos GB de VRAM, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el modelo se distribuye en ONNX y puede ejecutarse en CPU mediante ONNX Runtime.
- Opciones de despliegue: phoonnx (Python, con `pip install --pre phoonnx`), phoonnx.js en navegador, plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Dependencia externa: espeak-ng (o el extra `phoonnx[espeak]` con el port espyak); sin él, la fonemización falla o produce pronunciaciones incorrectas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-vi_vn-infore-espeak | VITS | vi-VN | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | MIT (según cada voz) | ONNX | Hugging Face (colección VITS de Phoonnx) |
| Modelos TTS comerciales multilingües | no disponible | multilingüe | propietaria | no disponible | APIs comerciales |

No se dispone de datos de rendimiento ni de parámetros de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La calidad de la pronunciación depende críticamente de espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- El modelo solo soporta vietnamita (vi-VN); no es multilingüe.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre el riesgo de alucinación (en TTS, artefactos o pronunciaciones erróneas).
- El modelo original fue entrenado por un tercero (phatjkk); la licencia MIT se declara en el empaquetado, pero conviene verificar los términos del release upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- No se dispone de información sobre latencia, throughput ni calidad subjetiva (MOS) para entornos de producción.
- La integración requiere instalar dependencias adicionales (phoonnx, scriptconv, espeak-ng) y, en OVOS, configurar el plugin correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-vi_vn-infore-espeak
- Repositorio upstream: https://github.com/phatjkk/vits-tts-vietnamese
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
