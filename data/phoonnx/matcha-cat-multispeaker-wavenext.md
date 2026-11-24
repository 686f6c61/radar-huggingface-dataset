# Phoonnx/matcha-cat-multispeaker-wavenext

## Resumen
Phoonnx/matcha-cat-multispeaker-wavenext es un modelo de sintesis de voz (text-to-speech) en catalan, empaquetado en formato ONNX para su uso con la libreria phoonnx. El modelo original es un Matcha-TTS desarrollado por Projecte AINA (el proyecto de inteligencia artificial en catalan impulsado por el Barcelona Supercomputing Center), concretamente el modelo projecte-aina/matxa-tts-cat-multispeaker. Este repositorio no es un modelo nuevo, sino un reempaquetado del modelo upstream con el vocoder Wavenext fusionado y el front-end fonetico basado en espeak-ng.

El modelo resuelve el problema de la sintesis de voz multihablante en catalan dentro del ecosistema OpenVoiceOS y phoonnx, permitiendo integrar TTS en catalan en asistentes de voz y aplicaciones Python con una dependencia ligera (repositorio de 0.1 GB). Es relevante porque el catalan es un idioma con recursos limitados en TTS y porque el empaquetado ONNX facilita el despliegue en entornos sin GPU dedicada.

La arquitectura es Matcha-TTS, un modelo de sintesis basado en flow matching con decoder de duracion, combinado con el vocoder Wavenext. El modelo acepta fonemas IPA generados por espeak-ng como entrada de texto. La licencia es GPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (flow matching) con vocoder Wavenext fusionado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | catalan (ca) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (libreria phoonnx) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura Matcha-TTS, un modelo de sintesis de voz basado en flow matching condicional que genera mel-espectrogramas a partir de fonemas, combinado con un decoder de duracion para alinear texto y audio. El vocoder Wavenext se ha fusionado en el paquete ONNX para producir la forma de onda final directamente. La entrada de texto no es texto crudo, sino fonemas en alfabeto IPA generados por espeak-ng (o por el port espyak incluido en phoonnx), lo que implica que la calidad de la sintesis depende de la fonemizacion previa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning por preferencias. El modelo upstream es multihablante, lo que permite seleccionar distintas voces dentro del mismo paquete. La innovacion principal del empaquetado es la fusion del vocoder Wavenext y la conversion a ONNX para inferencia ligera, no una innovacion arquitectonica respecto al modelo original.

## Capacidades
- Sintesis de voz en catalan a partir de texto, con salida en fichero WAV.
- Soporte multihablante (varias voces en el mismo modelo).
- Conversion texto-a-fonemas mediante espeak-ng o espyak, con normalizacion de texto a cargo de scriptconv.
- Integracion con el ecosistema OpenVoiceOS mediante el plugin ovos-tts-plugin-phoonnx.
- Inferencia en CPU mediante ONNX, sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni vision: es exclusivamente un modelo TTS.

## Casos de uso
- Asistentes de voz en catalan: integracion en OpenVoiceOS seleccionando la voz en mycroft.conf, adecuada para entornos domoticos y de escritorio con inferencia en CPU.
- Lectura de contenido en catalan: sintesis de articulos, noticias o documentos para aplicaciones de accesibilidad, gracias al front-end de normalizacion de scriptconv.
- Sistemas de anuncios y avisos automaticos: generacion de locuciones en catalan para transporte publico, comercios o aeropuertos con multiples voces.
- Prototipado rapido de TTS: el repositorio de 0.1 GB y la instalacion via pip permiten incorporar sintesis en catalan en un script Python en pocos minutos.
- Aplicaciones educativas: generacion de audio para materiales de aprendizaje del catalan con distintas voces para variar el registro.
- Integracion en pipelines de agentes conversacionales: como capa de salida de voz en asistentes que ya operan en catalan, siempre que la licencia GPL-3.0 sea compatible con el proyecto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible; el modelo esta empaquetado en ONNX y disenado para inferencia en CPU.
- GPU recomendadas: no se especifican; al ser ONNX, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: si, aunque no es necesario; el tamano del repositorio (0.1 GB) sugiere un modelo ligero apto para equipos de gama baja.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OpenVoiceOS, con espeak-ng como dependencia del front-end fonetico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la informacion proporcionada. Como referencia cualitativa, el modelo upstream projecte-aina/matxa-tts-cat-multispeaker es la fuente directa de este empaquetado, y otros modelos de la coleccion Matcha-TTS de Phoonnx comparten arquitectura pero cubren otros idiomas.

| Modelo | Idioma | Arquitectura | Licencia | Formato |
|---|---|---|---|---|
| Phoonnx/matcha-cat-multispeaker-wavenext | Catalan | Matcha-TTS + Wavenext | GPL-3.0 | ONNX |
| projecte-aina/matxa-tts-cat-multispeaker | Catalan | Matcha-TTS | GPL-3.0 | no disponible |
| Otros modelos de la coleccion Phoonnx Matcha-TTS | Varios | Matcha-TTS | segun modelo | ONNX |

## Limitaciones y advertencias
- Solo soporta catalan; no es multilingue.
- La calidad de la sintesis depende de la fonemizacion con espeak-ng; el port espyak puede pronunciar mal algunas palabras, segun advierte el autor.
- Licencia GPL-3.0: su integracion en productos propietarios exige cumplir las obligaciones de copyleft, lo que puede ser incompatible con software cerrado.
- Riesgo de errores de pronunciacion en palabras fuera del dominio de entrenamiento, nombres propios y neologismos.
- No se dispone de informacion sobre sesgos de voz, cobertura de acentos ni evaluaciones de calidad subjetiva (MOS).
- El modelo esta pensado para TTS; no debe emplearse para tareas de lenguaje, razonamiento o clasificacion.
- Dependencia externa de espeak-ng, que debe instalarse por separado en el sistema.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-cat-multispeaker-wavenext
- Modelo upstream: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
