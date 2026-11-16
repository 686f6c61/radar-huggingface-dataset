# Phoonnx/vits-it_it-paola-espeak

## Resumen

vits-it_it-paola-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo original procede del repositorio paolapersico1/Piper-TTS-Italian, en su variante de voz "paola" de tamano medium, y ha sido adaptado para su ejecución mediante la mencionada librería y su integración con el ecosistema OVOS.

El modelo resuelve la conversión de texto en italiano (it-IT) a audio inteligible, empleando fonemas espeak en alfabeto IPA como entrada de texto. Su relevancia radica en que ofrece una voz italiana lista para desplegar en pipelines de TTS ligeros, con un repositorio de apenas 0,1 GB y licencia CC0-1.0, lo que facilita su integración en asistentes de voz y aplicaciones de síntesis sin restricciones de atribución.

La arquitectura subyacente es VITS, un modelo generativo de extremo a extremo que combina codificación de texto, alineamiento por atención y decodificación de audio en una sola red. El modelo está orientado exclusivamente a la síntesis de voz en italiano y se distribuye como pesos ONNX, no como pesos en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | cc0-1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que integra un codificador de texto, un mecanismo de alineamiento por atención y un decodificador generativo de audio. Esta arquitectura permite generar formas de onda directamente a partir de la secuencia de fonemas, sin necesidad de un vocoder externo separado, lo que simplifica el despliegue y reduce la latencia en comparación con pipelines de TTS en cascada.

El modelo original fue desarrollado por paolapersico1 dentro del proyecto Piper-TTS-Italian, en su variante de voz "paola" de tamano medium. La entrada de texto se realiza mediante fonemas espeak en alfabeto IPA, generados por espeak-ng (o por el port espyak incluido en phoonnx). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO, por lo que estos datos deben considerarse no disponibles. La innovación principal del empaquetado es la conversión a ONNX y su integración con la librería phoonnx, que gestiona la normalización de texto mediante scriptconv.

## Capacidades

- Síntesis de voz (text-to-speech) en italiano (it-IT) a partir de texto escrito.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak en alfabeto IPA, con normalización de texto previa mediante scriptconv.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js, con soporte de entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un modelo exclusivamente de TTS.
- No dispone de capacidades multilingües más allá del italiano.

## Casos de uso

- Asistentes de voz en italiano: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de voz italiana a un asistente doméstico, seleccionando la voz `piper_community/paolapersico1/it-IT_paola` en la configuración de mycroft.conf.
- Lectura de contenido en aplicaciones móviles o web: al ejecutarse mediante phoonnx.js en el navegador, permite sintetizar texto italiano en el cliente sin depender de servicios en la nube, reduciendo la latencia y protegiendo la privacidad del texto.
- Generación de audiolibros y pódcast en italiano: la síntesis por lotes de párrafos completos mediante la API de phoonnx permite producir audio narrado de forma automatizada con una voz consistente.
- Accesibilidad para personas con discapacidad visual: el modelo puede convertir texto de interfaces o documentos en audio italiano, integrándose en lectores de pantalla o aplicaciones de asistencia.
- Sistemas de anuncios y avisos automatizados: en entornos como transporte público, comercios o aeropuertos, el modelo puede generar avisos hablados en italiano a partir de plantillas de texto, con un repositorio de solo 0,1 GB que facilita el despliegue en dispositivos de recursos limitados.
- Prototipado rápido de interfaces conversacionales: gracias a la licencia CC0-1.0 y al formato ONNX, es adecuado para experimentar con TTS italiano en entornos de investigación sin restricciones legales de atribución.
- Integración en pipelines de CI/CD para pruebas de audio: el modelo puede generar muestras de audio de referencia en pruebas automatizadas de aplicaciones de voz en italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente se ejecuta en CPU sin necesidad de GPU dedicada.
- GPU recomendadas: no disponible; por el tamano del modelo, no requiere GPU de gama alta. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería más que suficiente si se desea aceleración.
- Cabe en GPU consumer: sí, con toda probabilidad, dado el reducido tamano del repositorio (0,1 GB); también es viable en CPU.
- Opciones de despliegue: phoonnx (Python y OVOS), phoonnx.js (navegador), y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano del repo |
|---|---|---|---|---|---|
| Phoonnx/vits-it_it-paola-espeak | VITS | it-IT | ONNX | cc0-1.0 | 0,1 GB |
| paolapersico1/Piper-TTS-Italian (paola/medium) | VITS (Piper) | it-IT | no disponible | cc0-1.0 (según modelo original) | no disponible |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | ONNX | variable | variable |

La comparativa se limita al modelo upstream y a la colección VITS de Phoonnx, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta italiano (it-IT); no es multilingüe.
- La calidad de la síntesis depende del fonemizador espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte el autor.
- Requiere la instalación de espeak-ng o del extra `phoonnx[espeak]` para el fonemizado correcto.
- No se dispone de información sobre sesgos en el dataset de entrenamiento ni sobre la diversidad de voces; la voz es única ("paola").
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero puede producirse una pronunciación incorrecta o una prosodia deficiente en textos complejos o con caracteres no normalizados.
- Licencia CC0-1.0: permite uso comercial sin restricciones de atribución, aunque se recomienda verificar la licencia del modelo upstream en paolapersico1/Piper-TTS-Italian.
- El modelo está empaquetado para phoonnx; su uso fuera de esta librería requeriría adaptar los pesos ONNX y el front-end de texto.
- No se han publicado benchmarks objetivos de calidad (MOS, WER) en la información disponible.

## Enlaces

- [Hugging Face: Phoonnx/vits-it_it-paola-espeak](https://huggingface.co/Phoonnx/vits-it_it-paola-espeak)
- [Modelo upstream: paolapersico1/Piper-TTS-Italian/paola/medium](https://huggingface.co/paolapersico1/Piper-TTS-Italian/tree/main/paola/medium)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
