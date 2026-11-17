# SayedShaun/supertonic-3-sherpa-onnx-int8

## Resumen

Supertonic 3 (int8, sherpa-onnx) es una distribución cuantizada del modelo de síntesis de voz Supertonic 3 desarrollado por Supertone Inc. Este repositorio, publicado por SayedShaun, contiene los pesos en formato ONNX con cuantización int8 dispuestos en la estructura que espera `OfflineTtsSupertonicModelConfig` de sherpa-onnx, de modo que puedan cargarse directamente en el runtime de k2-fsa sin conversiones adicionales. El paquete original procede de la release `sherpa-onnx-supertonic-3-tts-int8-2026-05-11` publicada por k2-fsa; la cuantización y la conversión de formato son obra de k2-fsa, mientras que el modelo base es de Supertone.

El modelo resuelve el problema de la síntesis de voz multilingüe en dispositivo: con un tamaño total de repositorio de 0,1 GB y pesos que suman aproximadamente 144 MB en int8, está pensado para ejecutarse en teléfonos y equipos de gama baja sin depender de la nube. Soporta 31 idiomas y ofrece 10 voces predefinidas (F1 a F5 y M1 a M5). Su relevancia actual radica en que permite integrar TTS neuronal de calidad en aplicaciones móviles de código abierto, como demuestra su uso en Audiops.

La arquitectura subyacente se organiza en cuatro componentes ONNX separados (predictor de duración, codificador de texto, estimador vectorial y vocoder), un diseño por etapas típico de los sistemas TTS neuronales modernos. La licencia es BigScience OpenRAIL-M, que permite uso comercial pero impone restricciones de uso que deben propagarse a los destinatarios del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal por etapas en cuatro componentes ONNX: `duration_predictor`, `text_encoder`, `vector_estimator` y `vocoder` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (única variante publicada en este repositorio) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | BigScience OpenRAIL-M (pesos); código de Supertone bajo MIT |
| Formato de pesos | ONNX int8 (`duration_predictor.int8.onnx`, `text_encoder.int8.onnx`, `vector_estimator.int8.onnx`, `vocoder.int8.onnx`) más `tts.json`, `unicode_indexer.bin` y `voice.bin` |
| Tamaño de los pesos | 3,7 MB + 36,4 MB + 78,4 MB + 26,0 MB (aprox. 144,5 MB en total) |
| Voces | 10 predefinidas (F1-F5, M1-M5) |
| Runtime objetivo | sherpa-onnx (`OfflineTtsSupertonicModelConfig`) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de síntesis de voz por etapas, dividida en cuatro grafos ONNX independientes. El `duration_predictor` (3,7 MB) estima la duración de cada unidad de texto; el `text_encoder` (36,4 MB) convierte la secuencia de texto en representaciones latentes; el `vector_estimator` (78,4 MB) es el componente de mayor tamaño y genera la representación acústica; y el `vocoder` (26,0 MB) transforma esa representación en la forma de onda final. El mapeo de caracteres a índices se resuelve con `unicode_indexer.bin`, y las identidades de voz se almacenan en `voice.bin`, lo que permite seleccionar entre las 10 voces predefinidas sin cargar pesos adicionales.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas específicas del entrenamiento original en la documentación proporcionada. La contribución de este repositorio es exclusivamente de cuantización y empaquetado: los pesos son los publicados por k2-fsa en el paquete `sherpa-onnx-supertonic-3-tts-int8-2026-05-11`, sin modificaciones respecto al original, y el modelo base es Supertonic 3 de Supertone (revisión `3cadd1ee6394adea1bd021217a0e650ede09a323`).

## Capacidades

- Síntesis de voz (text-to-speech) neuronal en 31 idiomas, incluyendo español, inglés, coreano, japonés, árabe, hindi y la mayoría de lenguas europeas.
- Selección entre 10 voces predefinidas: cinco femeninas (F1-F5) y cinco masculinas (M1-M5).
- Predicción explícita de duración por unidad de texto, lo que permite controlar el ritmo de la locución.
- Ejecución completamente en dispositivo (on-device), sin llamadas a servicios externos.
- Integración nativa con el runtime sherpa-onnx mediante `OfflineTtsSupertonicModelConfig`.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling ni razonamiento multi-paso; es un modelo especializado exclusivamente en TTS.

## Casos de uso

- **Aplicaciones móviles de accesibilidad**: lectura en voz alta de texto para personas con discapacidad visual. El tamaño de 144 MB en int8 y la ejecución on-device permiten incluirlo en la app sin depender de conectividad, y los 31 idiomas cubren usuarios de prácticamente toda Europa y buena parte de Asia.
- **Audiops y reproductores de audio de código abierto**: descarga única del modelo y ejecución local en el teléfono, que es exactamente el escenario para el que se publicó este repositorio. El formato sherpa-onnx elimina la necesidad de escribir un cargador propio.
- **Lectura de notificaciones y mensajes en asistentes personales**: la predicción de duración y las voces predefinidas permiten locuciones naturales de frases cortas con baja latencia, adecuadas para interrumpir y reanudar la reproducción.
- **Sistemas de navegación y avisos por voz embebidos**: en dispositivos con recursos limitados (Raspberry Pi, wearables), los 144 MB en int8 y la ausencia de GPU dedicada hacen viable la síntesis local de instrucciones en múltiples idiomas.
- **Generación de audiolibros y contenido educativo multilingüe por lotes**: el soporte de 31 idiomas y 10 voces permite producir narraciones en varios idiomas desde un mismo pipeline, seleccionando la voz por idioma o por tipo de contenido.
- **Aplicaciones de aprendizaje de idiomas**: la pronunciación sintetizada en 31 lenguas sirve para generar ejercicios de escucha y repetición sin depender de grabaciones humanas, con la ventaja de que el modelo se ejecuta en el propio dispositivo del estudiante.
- **Integración en asistentes de voz para domótica o automoción**: la inferencia local evita enviar texto del usuario a la nube, lo que simplifica el cumplimiento de privacidad en entornos domésticos y vehículos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: los pesos int8 suman aproximadamente 144,5 MB; con overhead de runtime, la inferencia cabe holgadamente en menos de 500 MB de memoria, aunque no se dispone de cifras oficiales de consumo pico.
- **GPU recomendadas**: no se especifican; el modelo está diseñado para ejecución en CPU on-device (teléfonos, SBCs). Cualquier GPU con soporte ONNX Runtime puede acelerar la inferencia, pero no hay requisitos publicados.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo puede ejecutarlo dado su tamaño reducido; el caso de uso principal es, de hecho, CPU móvil.
- **Opciones de despliegue**: sherpa-onnx es el runtime de referencia (`OfflineTtsSupertonicModelConfig`). Al ser ONNX, también puede cargarse con ONNX Runtime directamente, aunque la disposición de ficheros (`unicode_indexer.bin`, `voice.bin`) está pensada para sherpa-onnx.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Supertonic 3 int8 (sherpa-onnx, este repo) | TTS por etapas, 4 componentes ONNX | ~144,5 MB int8 | 31 | OpenRAIL-M | ONNX int8 | Empaquetado para sherpa-onnx, 10 voces |
| Supertonic 3 (original, Supertone) | TTS por etapas | no disponible | 31 (según este derivado) | OpenRAIL-M | no disponible | Modelo base sin cuantizar |
| Alternativas TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas (Piper, Coqui TTS, Kokoro, etc.) sin inventar datos; la comparación se limita al modelo base y a la variante cuantizada de este repositorio.

## Limitaciones y advertencias

- **Licencia OpenRAIL-M con restricciones de uso**: el uso comercial está permitido, pero la licencia incluye restricciones del Anexo A que deben transmitirse a cualquier tercero que reciba el modelo. Es obligatorio revisar dichas restricciones antes de distribuirlo embebido en un producto.
- **Sin datos de evaluación**: no hay benchmarks publicados en la información disponible, por lo que la calidad de síntesis por idioma y voz no puede verificarse a priori; conviene evaluarla con muestras propias antes de producción.
- **Cuantización int8**: la cuantización puede degradar la naturalidad o la prosodia respecto al modelo original en punto flotante; no se documenta el impacto medido de la cuantización.
- **Idiomas sin cobertura verificada**: aunque se listan 31 idiomas, no se especifica el nivel de calidad por idioma; es probable que los idiomas con menos datos de entrenamiento rindan peor, pero no hay datos que lo confirmen.
- **Sin control de emoción ni clonación**: las 10 voces son fijas; no se documentan capacidades de estilo, emoción o clonación de hablante.
- **Dependencia del runtime sherpa-onnx**: la disposición de ficheros está acoplada a `OfflineTtsSupertonicModelConfig`; usar otro runtime requiere adaptar la carga de `unicode_indexer.bin` y `voice.bin`.
- **Riesgo de alucinación en TTS**: como todo sistema neuronal de síntesis, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o texto no normalizado; se recomienda normalización previa del texto.
- **Repositorio con 0 descargas y 0 likes en el momento de la consulta**: es un empaquetado reciente y poco validado por la comunidad; para producción conviene considerar directamente el paquete oficial de k2-fsa del que deriva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SayedShaun/supertonic-3-sherpa-onnx-int8
- Modelo base Supertonic 3 (Supertone): https://huggingface.co/Supertone/supertonic-3
- Código fuente de Supertone: https://github.com/supertone-inc/supertonic
- Runtime sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Aplicación Audiops: https://github.com/sayedshaun/audiops
