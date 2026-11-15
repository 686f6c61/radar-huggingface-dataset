# Phoonnx/vits-en_US-lessac-medium

## Resumen

`Phoonnx/vits-en_US-lessac-medium` es un modelo de síntesis de voz (text-to-speech) en formato ONNX derivado de la voz `en_US-lessac-medium` del proyecto Piper. Lo publica el usuario Phoonnx como parte del repositorio agregado `Phoonnx/phoonnx-vits`, que actúa como espejo de voces Piper (basadas en espeak) para el motor de inferencia [phoonnx](https://github.com/TigreGotico/phoonnx). El modelo emplea la arquitectura VITS, habitual en la familia Piper, y se distribuye bajo licencia MIT.

El modelo resuelve la conversión de texto a audio en inglés estadounidense con una calidad calificada como "medium" dentro de la escala de Piper. Su relevancia radica en que ofrece un artefacto ONNX listo para inferencia ligera en CPU o GPU de gama baja, sin necesidad de frameworks pesados, lo que facilita el despliegue en entornos embebidos, asistentes locales o pipelines de generación de audio por lotes.

La información publicada es muy escasa: no se detallan parámetros, contexto (no aplica en TTS), datos de entrenamiento ni resultados de benchmarks. El repositorio ocupa 0,1 GB y no registra descargas ni "likes" en el momento de la consulta, lo que sugiere un artefacto de reciente creación o de uso interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, segun tags del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes) |
| Idiomas soportados | ingles estadounidense (`en_US`, segun el identificador de la voz); no se documenta lista oficial |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo de texto a voz de extremo a extremo que combina un codificador de texto, un predictor de duración y un decodificador generativo con normalización por flujo, habitual en la familia Piper. El artefacto publicado es una conversión a ONNX de la voz `en_US-lessac-medium` del repositorio `rhasspy/piper-voices`, que emplea espeak para la fonemización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la propia arquitectura VITS y su empaquetado en ONNX. La model card no incluye detalles de entrenamiento ni de conversión.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en_US`).
- Generación de audio con calidad "medium" dentro de la escala de voces Piper.
- Inferencia mediante ONNX, compatible con el motor phoonnx.
- Fonemización basada en espeak (heredada de Piper).
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz locales: el modelo puede convertir respuestas de texto en audio en tiempo real sobre CPU gracias a su formato ONNX y su tamaño reducido (repo de 0,1 GB), sin depender de servicios en la nube.
- Lectura de artículos y documentos: integración en pipelines de accesibilidad que conviertan texto en audio por lotes con una voz inglesa neutra.
- Generación de avisos y notificaciones: síntesis de mensajes cortos en aplicaciones de domótica o sistemas de megafonía con requisitos de latencia bajos.
- Pruebas de integración en phoonnx: al ser un artefacto del repositorio espejo, sirve para validar el motor phoonnx con voces Piper antes de desplegar otras voces.
- Prototipado de interfaces conversacionales: permite disponer de una voz inglesa funcional en fases tempranas de desarrollo sin coste de licencia (MIT).
- Generación de audio para contenidos educativos: narración de material en inglés estadounidense con una voz consistente y licencia permisiva para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS de tamaño "medium" en ONNX, es previsible que quepa en memoria de CPU y en GPUs de gama baja, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; el formato ONNX sugiere viabilidad en CPU y en GPUs de consumo, sin datos concretos.
- Opciones de despliegue: motor phoonnx (según la model card); al ser ONNX, podría ejecutarse con ONNX Runtime, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phoonnx/vits-en_US-lessac-medium | VITS | en_US | MIT | ONNX | Espejo Piper para phoonnx; sin benchmarks publicados |
| rhasspy/piper-voices (en_US-lessac-medium) | VITS | en_US | MIT | ONNX | Repositorio original del que deriva esta voz |
| Otras voces Piper (p. ej. en_GB-alba-medium) | VITS | en_GB | MIT | ONNX | Misma familia, distinto acento; sin benchmarks comparativos publicados |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos; al entrenarse presumiblemente con datos de voz inglesa, puede reflejar sesgos de acento y prosodia del corpus original.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- Limitación de idioma: la voz está pensada para inglés estadounidense; no se documenta soporte multilingüe.
- La licencia MIT permite uso comercial, pero la model card remite a la licencia registrada en el repositorio fuente (`rhasspy/piper-voices`), por lo que conviene verificar las condiciones de los datos de entrenamiento originales antes de un despliegue comercial.
- El repositorio no registra descargas ni validación de la comunidad; no hay garantías de mantenimiento ni de calidad más allá de la designación "medium".
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_US-lessac-medium](https://huggingface.co/Phoonnx/vits-en_US-lessac-medium)
- [Repositorio agregado Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Motor phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Repositorio fuente rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)
