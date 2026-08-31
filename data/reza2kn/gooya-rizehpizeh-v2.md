# Reza2kn/Gooya-RizehPizeh-v2

## Resumen

Gooya RizehPizeh v2 es un modelo de síntesis de voz (text-to-speech) en persa (farsi) de un solo locutor, desarrollado por Reza2kn (Reza Sayar) y publicado bajo licencia MIT. Está construido sobre la arquitectura VITS2 y empaquetado para el ecosistema Piper, lo que permite su uso tanto en entornos de servidor como en navegador mediante ONNX Runtime. El modelo es un fine-tuning de la versión v1.5, entrenado sobre audio aprobado de Wikipedia en persa generado con Gemini TTS, y utiliza un frontend fonético propio (Negara) que evita la dependencia de espeak-ng en inferencia.

La versión v2 selecciona el checkpoint del paso global 50.000 (con `val_mel = 0.3951`), descartando el estado final de 100.000 pasos por peor validación. El generador tiene aproximadamente 23,7 millones de parámetros y produce audio mono a 22.050 Hz. El modelo se distribuye como un archivo ONNX autocontenido de unos 63,5 MB, validado con pruebas de determinismo y compatibilidad con el navegador. Su relevancia radica en ofrecer una voz persa de alta calidad con un control fonético preciso, pensado para integraciones ligeras en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS2 (Piper) |
| Parametros totales | ~23,7 M (generador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (solo ONNX FP32) |
| Idiomas soportados | fa (persa/farsi) |
| Licencia | MIT |
| Formato de pesos | ONNX (autocontenido), checkpoint .ckpt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS2, un sistema de síntesis neuronal basado en flujos normalizadores y un decodificador de vocoder, adaptado al framework Piper. El frontend fonético es el sistema Negara (v7.1), que convierte texto persa en una representación fonética sensible a mayúsculas (Finglish). El audio de entrenamiento proviene de clips aprobados del dataset `Reza2kn/Wikipedia-FA-EN-DeepSeek-V4-Flash-0731`, con un total de 4.116 clips alineados mediante el alineador forzado CTC AvaSanj v1. Se materializaron 30.965 segmentos, de los cuales 26.053 se usaron para entrenamiento y 4.912 quedaron como evaluación sellada. La duración total del material fue de 68,99 horas, con segmentos de entre 0,63 y 21,67 segundos.

El entrenamiento se realizó en precisión mixta BF16, con un tamaño de lote de 1, tasa de aprendizaje de 1e-5 para el generador y 5e-6 para el discriminador. El checkpoint seleccionado (paso 50.000) se exportó dos veces a ONNX con resultados byte-idénticos. La validación incluyó pruebas de determinismo: error máximo absoluto de 1,03e-5, SNR mínimo de 110,08 dB y correlación mínima de 0,999999999995 frente al modelo de producción original.

## Capacidades

- Generación de voz en persa (farsi) con un solo locutor, a 22.050 Hz y canal mono.
- Entrada de texto fonético Negara (sensible a mayúsculas), sin necesidad de espeak-ng en inferencia.
- Inferencia en CPU mediante ONNX Runtime, con soporte para navegador (onnxruntime-web).
- Síntesis de segmentos largos mediante división semántica en fragmentos sustanciales, con unión posterior.
- Reproducibilidad determinista: el mismo texto fonético produce la misma salida (verificado con pruebas de correlación).
- Compatible con el ecosistema Piper (CLI, servidores, integraciones).

## Casos de uso

- Narración de artículos y noticias en persa: el modelo puede leer artículos completos si se divide en frases o cláusulas semánticas, generando audio natural para portales de noticias o blogs.
- Audiolibros y contenido educativo: su pronunciación fonética controlada permite generar audiolibros en persa con una voz consistente, ideal para plataformas de aprendizaje de idiomas.
- Asistentes de voz y chatbots con respuesta hablada: al ser un modelo ligero (63 MB ONNX), puede integrarse en aplicaciones de servidor o edge para convertir respuestas de texto en voz en tiempo real.
- Accesibilidad para personas con discapacidad visual: permite convertir contenido escrito en persa a audio, tanto en aplicaciones web como de escritorio.
- Doblaje y producción multimedia: la voz puede usarse para locuciones en vídeos, presentaciones o material promocional, con control sobre la velocidad y el tono mediante los parámetros `scales`.
- Pruebas de sistemas TTS en persa: al ser un modelo de referencia con licencia MIT, sirve como punto de partida para evaluar la calidad de otros sistemas o para fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MOS, WER o comparativas con otros modelos TTS) en la informacion disponible. Sin embargo, la model card reporta métricas de validación interna:

| Metrica | Valor |
|---|---|
| val_mel (checkpoint seleccionado) | 0,3951 |
| Error maximo absoluto (round-trip ONNX) | 1,03e-5 |
| SNR minimo (round-trip ONNX) | 110,08 dB |
| Correlacion minima (round-trip ONNX) | 0,999999999995 |
| Pruebas ONNX Runtime CPU | 19/19 finitas y con salida positiva |

Estas métricas confirman la fidelidad del modelo exportado respecto al original, pero no permiten comparar directamente con otros sistemas TTS.

## Requisitos de hardware

- Inferencia en CPU: el modelo ONNX de 63,5 MB puede ejecutarse en cualquier CPU moderna con ONNX Runtime; el uso de memoria RAM es inferior a 200 MB.
- GPU: no es necesaria para inferencia, pero si se dispone de una GPU (incluso una integrada), la latencia se reduce notablemente. No se requieren GPUs de alta gama.
- VRAM estimada: menos de 1 GB si se ejecuta en GPU, aunque el modelo no está optimizado para ello.
- Opciones de despliegue: Piper CLI, servidores Piper, onnxruntime-web para navegador, o integración en aplicaciones Python/C++.
- Latencia: no se han publicado mediciones oficiales, pero al ser un modelo de ~23,7 M de parámetros, la síntesis de una frase corta (2-3 segundos de audio) suele completarse en menos de 1 segundo en CPU moderna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Audio | Licencia | Notas |
|---|---|---|---|---|---|
| Gooya RizehPizeh v2 | VITS2 (Piper) | ~23,7 M | 22,05 kHz mono | MIT | Frontend fonético Negara, sin espeak-ng |
| Gooya RizehPizeh v1.5 | VITS2 (Piper) | no disponible | 22,05 kHz mono | MIT | Versión anterior, misma voz y frontend |
| Gooya 0.1 | MOSS-TTS-Nano (LoRA) | 100 M (base) | no disponible | no disponible | Fine-tuning sobre 48k clips persas, G2P propio |

La comparativa se limita a modelos del mismo autor, ya que no se dispone de información sobre otros TTS persas comparables en el contexto de esta ficha. v2 mejora a v1.5 en la validación mel, pero la model card advierte que algunos nombres propios se pronuncian mejor en v1.5 o en el checkpoint temprano de 2K.

## Limitaciones y advertencias

- La calidad de la pronunciación depende críticamente del frontend G2P/Finglish (Negara); errores en la conversión fonética se trasladan directamente al audio.
- Secuencias fonéticas muy largas en una sola pasada pueden colapsar u omitir contenido; se recomienda síntesis por fragmentos semánticos.
- Fragmentos demasiado pequeños producen una voz entrecortada y robótica; es preferible usar tramos sustanciales.
- El modelo está entrenado para un solo locutor y un solo idioma (persa); no soporta otros idiomas ni voces múltiples.
- La validación en navegador no garantiza el funcionamiento en producción; el despliegue en Gouya.app requiere pruebas adicionales.
- Aunque la licencia es MIT, el uso comercial está permitido, pero el autor no ofrece garantías sobre la calidad en todos los contextos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/Gooya-RizehPizeh-v2
- Modelo base v1.5: https://huggingface.co/Reza2kn/Gooya-RizehPizeh-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/Reza2kn/Wikipedia-FA-EN-DeepSeek-V4-Flash-0731
- Perfil del autor en GitHub: https://github.com/Reza2kn
- Modelo Gooya 0.1 (relacionado): https://huggingface.co/Reza2kn/gooya-0.1
