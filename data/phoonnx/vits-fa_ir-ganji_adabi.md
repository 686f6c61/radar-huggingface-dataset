# Phoonnx/vits-fa_ir-ganji_adabi

## Resumen

`vits-fa_ir-ganji_adabi` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por SadeghK y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en persa (fa-IR) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su propósito es ofrecer una voz en persa lista para usar en entornos Python y en el asistente OVOS.

El modelo forma parte de la colección de voces VITS que Phoonnx distribuye en formato ONNX, lo que facilita su despliegue en inferencia ligera sin necesidad de frameworks de deep learning pesados. Con un tamaño de repositorio de 0,1 GB, está pensado para ejecutarse en CPU y en dispositivos con recursos limitados, lo que lo hace adecuado para asistentes de voz embebidos y aplicaciones de accesibilidad.

Su relevancia actual radica en la escasez de voces TTS abiertas de calidad para persa con licencia permisiva (Apache 2.0) y formato ONNX estandarizado. Al integrarse en el ecosistema phoonnx/scriptconv, cubre un hueco práctico para desarrolladores que necesitan síntesis de voz en fa-IR sin depender de servicios propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas, no por tokens de contexto) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | persa (fa-IR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo entrenado con pérdidas de reconstrucción y adversariales. Este diseño permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

No se dispone de información sobre el número de horas de audio, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de fine-tuning o ajuste prosódico específicas. El modelo original proviene del repositorio `SadeghK/persian-text-to-speech`, en la ruta `farsi/ganji-adabi`, y Phoonnx lo ha convertido a ONNX y lo ha integrado en su pipeline de phonemización mediante `scriptconv` y espeak-ng.

## Capacidades

- Síntesis de voz (TTS) a partir de texto en persa (fa-IR).
- Conversión de texto a fonemas IPA mediante espeak-ng (a través de `EspeakPhonemizer` de scriptconv).
- Generación de audio en formato WAV mediante la API `synthesize_wav`.
- Integración con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente doméstico responda en persa con una voz local, sin depender de la nube.
- Aplicaciones de accesibilidad para hablantes de persa: lectura en voz alta de textos, noticias o documentos en fa-IR para personas con discapacidad visual, ejecutándose en CPU gracias al formato ONNX ligero.
- Sistemas de anuncios y megafonía automatizada: generación de avisos pregrabados o dinámicos en persa para aeropuertos, estaciones o comercios, con síntesis rápida en local.
- Audioguías y contenido educativo: narración de lecciones o material didáctico en persa dentro de aplicaciones móviles o web, usando phoonnx.js para síntesis en el navegador.
- Prototipado de interfaces conversacionales: desarrollo de chatbots de voz en persa para pruebas de usabilidad, donde la licencia Apache 2.0 permite modificar y redistribuir el modelo.
- Localización de contenido multimedia: doblaje automático de vídeos o podcasts al persa en pipelines de postproducción, combinando el TTS con herramientas de alineación temporal.
- Investigación en TTS de bajos recursos: uso como baseline o componente en estudios sobre síntesis de voz en lenguas iranias, dado su formato abierto y su integración con espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y el formato ONNX, es apto para ejecución en CPU.
- GPU recomendadas: no se especifican; al ser un modelo VITS pequeño, cualquier GPU consumer (GTX 1660, RTX 3060, RTX 4090) puede ejecutarlo, aunque no es necesario para inferencia básica.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU y en dispositivos embebidos.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-fa_ir-ganji_adabi (este modelo) | VITS | fa-IR | no aplica | Apache 2.0 | ONNX | Hugging Face, phoonnx |
| SadeghK/persian-text-to-speech (upstream) | VITS | fa-IR | no aplica | Apache 2.0 | no disponible | Hugging Face |
| Otras voces de la colección Phoonnx VITS | VITS | varios | no aplica | según modelo | ONNX | Hugging Face |

No se dispone de información suficiente para comparar rendimiento (MOS, latencia) con alternativas concretas de TTS en persa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un corpus concreto (ganji-adabi), la voz puede reflejar características prosódicas y dialectales específicas del dataset.
- Riesgo de alucinación: en TTS se traduce en pronunciación incorrecta o artefactos ante palabras fuera del vocabulario o fonemas no vistos; el uso de espyak en lugar de espeak-ng puede provocar errores de pronunciación, según advierte la model card.
- Limitaciones de idioma: solo soporta persa (fa-IR); no está entrenado para otras lenguas.
- Dependencia externa: requiere espeak-ng instalado en el sistema para la phonemización; sin él, la calidad puede degradarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y atribución.
- Caveat para producción: el modelo tiene pocas descargas (29) y ningún like, lo que sugiere validación limitada por la comunidad; conviene evaluar la calidad de audio en el dominio concreto antes de desplegarlo.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; cualquier expectativa en ese sentido es incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-ganji_adabi
- Repositorio upstream: https://huggingface.co/SadeghK/persian-text-to-speech/tree/main/farsi/ganji-adabi
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
