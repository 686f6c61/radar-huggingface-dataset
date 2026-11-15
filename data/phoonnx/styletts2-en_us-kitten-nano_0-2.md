# Phoonnx/styletts2-en_us-kitten-nano_0.2

## Resumen

`Phoonnx/styletts2-en_us-kitten-nano_0.2` es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense basado en la arquitectura StyleTTS2, desarrollado originalmente por KittenML bajo el identificador `KittenML/kitten-tts-nano-0.2` y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo resuelve la conversión de texto a audio inteligible con un tamaño reducido —indicado por el sufijo "nano"—, lo que lo hace adecuado para despliegues ligeros y entornos con recursos limitados.

La relevancia de este empaquetado radica en que expone el modelo en formato ONNX, lo que facilita su integración en pipelines de inferencia sin depender de frameworks de entrenamiento pesados, y en que incluye ocho voces predefinidas (cuatro femeninas y cuatro masculinas, identificadas como `expr-voice-2-f` hasta `expr-voice-5-m`). Además, se integra con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, orientado a asistentes de voz.

El modelo acepta fonemas en alfabeto IPA generados por espeak-ng como entrada de texto, y la normalización del texto corre a cargo de la librería `scriptconv`. La información pública disponible no detalla el número de parámetros, la longitud de contexto ni los datos de entrenamiento, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Voces incluidas | 8 (expr-voice-2-f, 2-m, 3-f, 3-m, 4-f, 4-m, 5-f, 5-m) |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Tamano del repo | 0.0 GB (según Hugging Face) |
| Descargas | 31 |
| Fecha de creacion | 2026-11-14 |
| Fecha de actualizacion | 2026-11-15 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de síntesis de voz neuronal que combina un codificador de estilo y un decodificador acústico para generar habla con control de prosodia y expresividad. La entrada no es texto plano, sino fonemas en alfabeto IPA producidos por espeak-ng; la librería `phoonnx` delega la normalización y conversión del texto a `scriptconv`, que emplea `EspeakPhonemizer` del módulo `scriptconv.phonemizers.mul`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino por preferencias. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de StyleTTS2 y del empaquetado en ONNX para inferencia. El modelo deriva del checkpoint upstream `KittenML/kitten-tts-nano-0.2`, cuya model card original no se incluye en la información proporcionada.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Ocho voces predefinidas con variantes femeninas y masculinas (expr-voice-2 a expr-voice-5).
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite un control fonético preciso.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en formato ONNX, apta para despliegues ligeros.
- No se documentan capacidades de clonación de voz, multilingüismo, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como módulo TTS mediante `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf`; es adecuado por su tamaño reducido y su formato ONNX.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la API `synthesize_wav` permite generar audio para mensajes cortos en inglés con latencia baja.
- Sistemas de accesibilidad: conversión de texto a voz para lectores de pantalla en entornos en inglés estadounidense, con selección entre voces femeninas y masculinas.
- Generación de audio para prototipos y demos: al ser un modelo "nano" empaquetado en ONNX, se puede desplegar en máquinas sin GPU dedicada para pruebas de concepto.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: la salida WAV determinista permite comparar muestras generadas entre versiones.
- Voice assistants embebidos en dispositivos de bajo consumo: el formato ONNX y el tamaño reducido facilitan la ejecución en hardware limitado, siempre que se instale espeak-ng o el extra `phoonnx[espeak]`.
- Síntesis de locuciones para contenido educativo en inglés: las ocho voces permiten alternar narradores en materiales formativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo "nano" en ONNX, es previsible que quepa en CPU, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución ONNX genérica.
- Dependencias del sistema: espeak-ng (por ejemplo, `apt install espeak-ng`) o el extra `pip install --pre "phoonnx[espeak]"`; se advierte de que algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phoonnx/styletts2-en_us-kitten-nano_0.2 | StyleTTS2 | en-US | apache-2.0 | ONNX | 8 voces, empaquetado para phoonnx |
| KittenML/kitten-tts-nano-0.2 (upstream) | StyleTTS2 | en-US | apache-2.0 | no disponible | Checkpoint original del que deriva este empaquetado |
| Otros modelos de la colección StyleTTS2 de Phoonnx | StyleTTS2 | no disponible | no disponible | ONNX | Misma familia de empaquetados; specs no detalladas en la información |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no se documentan otros idiomas.
- La calidad de pronunciación depende de espeak-ng; con espyak pueden producirse errores en algunas palabras, según advierte el autor.
- No se dispone de información sobre sesgos de género, acento o demográficos en las voces incluidas.
- Riesgo de alucinación no aplicable en el sentido de texto generado, pero sí de prosodia o pronunciación incorrecta en palabras fuera del dominio de entrenamiento.
- La licencia apache-2.0 la declara el upstream en la model card de `KittenML/kitten-tts-nano-0.2`; conviene verificar dicha declaración antes de uso comercial.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar que los pesos no están incluidos en el repositorio o que la métrica no se ha calculado correctamente; verificar antes de desplegar.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.
- El modelo tiene 31 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-kitten-nano_0.2
- Modelo upstream: https://huggingface.co/KittenML/kitten-tts-nano-0.2
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
