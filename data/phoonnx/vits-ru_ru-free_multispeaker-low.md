# Phoonnx/vits-ru_ru-free_multispeaker-low

## Resumen

vits-ru_ru-free_multispeaker-low es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por utrobinmv y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo convierte texto en ruso (ru-RU) en audio, tomando caracteres como entrada directa y sin necesidad de un fonemizador externo basado en diccionario, ya que emplea el `GraphemePhonemizer` de scriptconv.

El modelo está pensado para inferencia ligera y despliegue en entornos con recursos limitados: el repositorio ocupa aproximadamente 0,1 GB y la variante es "low", lo que indica una configuración de menor tamaño orientada a velocidad y consumo reducido. Es un modelo multihablante ("multispeaker"), lo que permite generar distintas voces desde un mismo conjunto de pesos.

Su relevancia radica en que ofrece TTS en ruso con licencia Apache 2.0, formato ONNX listo para producción y compatibilidad con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. No obstante, la información pública disponible es limitada: no se detallan parámetros, contexto ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial en su entrenamiento. VITS genera audio de forma directa desde la secuencia de entrada, sin un vocoder separado en la inferencia, lo que simplifica el despliegue.

La variante empaquetada es "low", lo que sugiere un tamaño reducido del modelo y una calidad de audio inferior a las variantes de mayor capacidad. El modelo es multihablante, por lo que soporta varias voces. La entrada de texto se procesa mediante el `GraphemePhonemizer` de scriptconv, que normaliza el texto y lo convierte en la secuencia de caracteres que consume el modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS).

## Capacidades

- Síntesis de voz a partir de texto en ruso (ru-RU).
- Soporte multihablante: permite seleccionar entre distintas voces del modelo.
- Entrada directa por caracteres, sin dependencia de un diccionario fonético externo.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en ONNX, adecuada para despliegue en CPU y entornos sin GPU.
- No soporta tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).

## Casos de uso

- Asistentes de voz en ruso: el modelo puede integrarse en asistentes domésticos basados en OVOS para leer respuestas en voz alta, gracias al plugin nativo y a su bajo consumo de recursos.
- Lectura de notificaciones y alertas: en sistemas embebidos o de escritorio, permite convertir mensajes de texto en audio en tiempo real con un repositorio de 0,1 GB.
- Accesibilidad: conversión de texto a voz para usuarios con discapacidad visual en aplicaciones en ruso, con despliegue local sin dependencia de servicios en la nube.
- Audiolibros y contenido narrado: generación de narraciones con distintas voces multihablantes para contenido en ruso.
- Pruebas y prototipado de pipelines TTS: al ser un modelo ONNX ligero con licencia Apache 2.0, es adecuado para validar arquitecturas de síntesis antes de escalar a modelos mayores.
- Integración en aplicaciones de aprendizaje de idiomas: reproducción de frases en ruso con pronunciación sintetizada para ejercicios de escucha.
- Sistemas de megafonía o anuncios automatizados: generación de avisos hablados en ruso en entornos con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU dedicada.
- GPU recomendadas: no disponibles; el tamaño reducido sugiere que no requiere GPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos GB de memoria, e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-ru_ru-free_multispeaker-low (este) | VITS | ru-RU | ~0,1 GB (repo) | Apache 2.0 | ONNX |
| utrobinmv/tts_ru_free_hf_vits_low_multispeaker | VITS | ru-RU | no disponible | Apache 2.0 | no disponible |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | variable | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Calidad de audio limitada por la variante "low": esperable menor naturalidad que variantes de mayor capacidad.
- Solo soporta ruso (ru-RU); no es multilingüe.
- La entrada es por caracteres, lo que puede producir errores de pronunciación en palabras ambiguas o extranjerismos.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre la diversidad de las voces multihablantes.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede generar pronunciaciones incorrectas o artefactos de audio en texto atípico.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (utrobinmv/tts_ru_free_hf_vits_low_multispeaker).
- El número de descargas (34) y likes (0) es bajo, lo que indica poca validación por parte de la comunidad.
- No hay información sobre latencia ni throughput en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-ru_ru-free_multispeaker-low)
- [Modelo upstream](https://huggingface.co/utrobinmv/tts_ru_free_hf_vits_low_multispeaker)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
