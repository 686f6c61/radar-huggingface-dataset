# Phoonnx/vits-en_us-inflect-nano_v2

## Resumen

`vits-en_us-inflect-nano_v2` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario owensong y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo está especializado en inglés estadounidense (`en-us`) y recibe como entrada fonemas espeak en alfabeto IPA, no texto crudo, lo que lo hace dependiente de una cadena de preprocesado lingüístico.

La relevancia de este modelo radica en su formato ONNX y su integración con el ecosistema phoonnx/OVOS, que permite ejecutar síntesis de voz en Python y en el navegador (vía phoonnx.js) sin depender de frameworks de deep learning pesados. Es un modelo "nano", orientado a despliegues ligeros y de baja latencia, más que a calidad de voz de gama alta.

El paquete no incluye información sobre el tamaño del modelo, el número de parámetros ni el contexto de entrenamiento. La model card se limita a describir la arquitectura VITS, el idioma, el front-end de texto (espeak-ng) y las instrucciones de uso con phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | en-us |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial (GAN) para generar waveforms directamente a partir de fonemas. La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o ajuste fino adicional.

El modelo se distribuye como un artefacto ONNX empaquetado para phoonnx. La entrada no es texto plano, sino fonemas espeak en alfabeto IPA, generados por el front-end `scriptconv` (concretamente `EspeakPhonemizer`). Esto implica que la calidad de la síntesis depende directamente de la corrección de la fonemización previa: la model card advierte que el port espyak de espeak-ng puede producir fonemas distintos y provocar errores de pronunciación en algunas palabras. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense (`en-us`) a partir de fonemas espeak en IPA.
- Generación de audio WAV mediante la API `voice.synthesize_wav()` de phoonnx.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al inglés estadounidense.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) seleccionable en `mycroft.conf`, adecuado para asistentes domésticos que requieran síntesis local sin servicios en la nube.
- Síntesis de voz en el navegador: mediante phoonnx.js se puede ejecutar el modelo en cliente para leer contenido web o interfaces de accesibilidad, evitando enviar texto a servidores externos.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo "nano" en ONNX, puede generar avisos cortos con baja latencia en entornos con recursos limitados.
- Prototipado de pipelines TTS en Python: la API de phoonnx (`TTSModelManager`, `merge_default_voices`) permite integrar el modelo en scripts de investigación o demos sin infraestructura GPU.
- Generación de audio para pruebas de calidad de voz (QA): útil para validar cadenas de fonemización espeak-ng frente a espyak y detectar errores de pronunciación.
- Sistemas embebidos o de borde: el formato ONNX y el tamaño reducido del paquete (repo de 0.0 GB según Hugging Face) facilitan su despliegue en dispositivos con poca memoria, siempre que se disponga de espeak-ng o del port espyak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se documenta el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX permite ejecución en CPU, pero no se especifican requisitos.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS `ovos-tts-plugin-phoonnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.
- Dependencia externa: requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-inflect-nano_v2 | VITS | en-us | ONNX | apache-2.0 | no disponible | Empaquetado para phoonnx |
| owensong/inflect-nano-v2-onnx | VITS | en-us | ONNX | apache-2.0 | no disponible | Modelo upstream, mismo origen |
| Otros modelos de la colección VITS de Phoonnx | VITS | variable | ONNX | variable | no disponible | Colección de voces empaquetadas para phoonnx |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-us`); no hay soporte multilingüe.
- La entrada debe ser fonemas espeak en IPA; no acepta texto crudo directamente sin el front-end `scriptconv`.
- El uso del port espyak en lugar de espeak-ng puede provocar pronunciaciones incorrectas en algunas palabras, según advierte la model card.
- No se documentan sesgos concretos, pero al ser un modelo de voz entrenado con datos no especificados, puede heredar sesgos de pronunciación o prosodia del corpus original.
- No se dispone de información sobre el tamaño del modelo, lo que dificulta estimar requisitos de memoria y latencia en producción.
- La licencia apache-2.0 permite uso comercial, pero se hereda de la declaración del modelo upstream; conviene verificar la model card original de `owensong/inflect-nano-v2-onnx`.
- El repositorio muestra 0 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.
- No apto para tareas de razonamiento, código, matemáticas ni agentes; es exclusivamente un modelo TTS.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_us-inflect-nano_v2](https://huggingface.co/Phoonnx/vits-en_us-inflect-nano_v2)
- [Modelo upstream: owensong/inflect-nano-v2-onnx](https://huggingface.co/owensong/inflect-nano-v2-onnx)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
