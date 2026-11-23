# Phoonnx/f5tts-multi-sema_afro-unicode

## Resumen

f5tts-multi-sema_afro-unicode es una voz de síntesis de voz (text-to-speech) del modelo F5-TTS, convertida a formato ONNX por Phoonnx (TigreGotico Lda) a partir del modelo original travis-moore/sema-tts-afro. Está pensada para su uso con la librería phoonnx y el ecosistema OVOS, y cubre 23 idiomas, con un enfoque claro en lenguas africanas (yoruba, suajili, hausa, zulú, amárico, etc.) junto con el inglés. Resuelve el problema de disponibilidad de voces TTS de calidad para idiomas africanos, un segmento habitualmente desatendido por los modelos comerciales.

La arquitectura subyacente es F5-TTS, un modelo de síntesis basado en flow matching y difusión que clona la voz del hablante a partir de una muestra de referencia corta y su transcripción. Esta conversión mantiene los pesos originales en fp32 y añade copias cuantizadas a int8 mediante onnxruntime, reduciendo el grafo de 1455,8 MB a 463,3 MB. El repositorio ocupa 1,9 GB y se distribuye bajo licencia Apache 2.0.

Es relevante ahora porque ofrece una vía práctica de desplegar TTS multilingüe en CPU (el QA se realizó en un AMD Ryzen 5 7600), con un RTF medido de 22,6 en int8 y 29,4 en fp32, lo que la hace viable para aplicaciones de asistente de voz locales sin GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching / difusión) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 (original), int8 (quantize_dynamic con QInt8) |
| Idiomas soportados | af, am, en, ff, ha, ig, kam, kea, lg, ln, luo, ny, nso, om, sn, so, sw, tw, umb, wo, xh, yo, zu (23 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos fp32 e int8) |
| Frecuencia de muestreo | 24000 Hz |
| Hablantes | 1 (voz clonable por referencia) |
| Entrada de texto | Caracteres con mayúsculas y marcas (`f5tts_pinyin` / variante `unicode`) |
| Puntuación entrenada | , . ! ? : ; |
| Phonemizer | scriptconv `f5tts_pinyin` (0.0.4a110+) |
| Modelo base | mrfakename/OpenF5-TTS (vía travis-moore/sema-tts-afro) |
| Tamaño del repositorio | 1,9 GB |
| Librería | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura F5-TTS, un sistema de síntesis de voz basado en flow matching con un transformer de difusión que genera mel-espectrogramas condicionados por el texto y por una referencia de voz. La inferencia requiere un clip de audio de referencia junto con su transcripción para clonar la identidad del hablante, tal como se muestra en el ejemplo de uso de la model card. La entrada de texto se procesa mediante la función `convert_char_to_pinyin` portada a scriptconv, que conserva la forma Unicode de cada letra, de modo que una letra yoruba precompuesta con marca tonal cuenta como un único id.

Los datos de entrenamiento no están registrados en el modelo original (travis-moore/sema-tts-afro), por lo que se desconoce el número de tokens, la composición del dataset y si hubo etapas de RLHF o ajuste fino supervisado. El modelo base es mrfakename/OpenF5-TTS. La conversión a ONNX no altera los pesos; las copias int8 se generan con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y pesos QInt8, y pasan un control de calidad que exige audio finito y no silencioso, longitud entre 0,8 y 1,25 veces la de fp32 y WER como máximo el de fp32 más 0,05.

## Capacidades

- Síntesis de voz (text-to-speech) con salida a 24 kHz.
- Clonación de voz zero-shot a partir de un clip de referencia y su transcripción.
- Soporte multilingüe para 23 idiomas, con énfasis en lenguas africanas: afrikáans, amárico, fula, hausa, igbo, kamba, criollo de Cabo Verde, luganda, lingala, luo, chichewa, sotho septentrional, oromo, shona, somalí, suajili, twi, umbundu, wolof, xhosa, yoruba y zulú, además de inglés.
- Procesamiento de texto con mayúsculas y marcas diacríticas, incluidas letras precompuestas con marcas tonales (relevante para yoruba).
- Conservación de la puntuación de cláusula (, . ! ? : ;) en la síntesis con phoonnx 1.96.1a1 y posteriores.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización de texto previa mediante text2spoken para números, fechas, horas, monedas, unidades y abreviaturas.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de visión o audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y sintetiza respuestas en los 23 idiomas soportados, lo que permite desplegar asistentes de voz en entornos sin conexión y en CPU.
- Accesibilidad para lenguas africanas: lectura en voz alta de contenido en yoruba, suajili, hausa o zulú, idiomas con escasa cobertura en TTS comerciales, usando la clonación de voz para adaptar el timbre a un locutor de referencia.
- Locución automatizada de contenidos educativos: generación de audio para cursos y materiales didácticos en lenguas africanas, con normalización previa de cifras y fechas mediante text2spoken para que se lean como palabras.
- Clonación de voz para preservación lingüística: grabación de un clip corto de un hablante nativo y su transcripción para generar nuevas locuciones con su timbre, útil en proyectos de documentación de lenguas minoritarias.
- Integración en pipelines de software con Python: la API de phoonnx (`voice.synthesize_wav`) permite generar archivos WAV en scripts de postproducción o en servicios de backend, con la opción int8 para reducir el uso de memoria a 1204,2 MB de RSS pico.
- Síntesis en dispositivos de bajos recursos: con el grafo int8 de 463,3 MB y un RTF de 22,6 en CPU de escritorio, es adecuada para servidores sin GPU o entornos de borde donde no se dispone de aceleración hardware.
- Prototipado de interfaces conversacionales multilingües: combinación de la voz con un LLM para construir demos de atención al cliente o lectura de noticias en varios idiomas africanos, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

| Prueba | fp32 | int8 |
|---|---|---|
| Resultado del control | pass | pass |
| WER (ASR nemo-parakeet-tdt-0.6b-v3 int8, FLORES-200 devtest, 3 frases, inglés) | 0,038 | 0,000 |
| Caracteres por segundo | 13,8 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,00 |
| Tamaño del grafo | 1455,8 MB | 463,3 MB |
| RSS pico | 3200,7 MB | 1204,2 MB |
| RTF (mediana de 3, 4 hilos) | 29,445 | 22,578 |

Las mediciones se realizaron en un AMD Ryzen 5 7600 de 6 núcleos. El RTF es el tiempo de síntesis dividido por la duración del audio. El QA cubre únicamente inglés y usó el clip de referencia LJ Speech LJ001-0009 (dominio público). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración medida, que se ejecutó en CPU; no se dispone de cifras de VRAM para GPU.
- Memoria RAM: RSS pico de 3200,7 MB en fp32 y 1204,2 MB en int8.
- GPU recomendadas: no disponible; el QA se realizó en CPU (AMD Ryzen 5 7600).
- ¿Cabe en GPU de consumo? No hay datos publicados; el grafo int8 de 463,3 MB sugiere que podría caber en GPUs con 4 GB o más, pero no está verificado en la información disponible.
- Opciones de despliegue: phoonnx (librería principal), plugin `ovos-tts-plugin-phoonnx` para OVOS y ONNX Runtime para la ejecución de los grafos.
- Latencia y throughput: RTF de 29,445 en fp32 y 22,578 en int8 (mediana de 3 ejecuciones con 4 hilos); 13,8 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto / referencia | Licencia | Formato |
|---|---|---|---|---|---|
| f5tts-multi-sema_afro-unicode | F5-TTS (ONNX) | 23 (énfasis africano) | Clonación con clip de referencia | Apache 2.0 | ONNX fp32/int8 |
| travis-moore/sema-tts-afro | F5-TTS | 23 (énfasis africano) | Clonación con clip de referencia | Apache 2.0 | Pesos originales (no especificado) |
| mrfakename/OpenF5-TTS | F5-TTS | no disponible | Clonación con clip de referencia | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y cobertura idiomática.

## Limitaciones y advertencias

- El QA se realizó únicamente en inglés y con tres frases de FLORES-200 devtest; no hay evaluación publicada del rendimiento en los 22 idiomas restantes.
- Los datos de entrenamiento no están registrados, lo que impide evaluar sesgos de dominio, calidad por idioma o posibles problemas de representación.
- Riesgo de alucinación y artefactos propio de los modelos TTS generativos, especialmente en textos largos o con puntuación atípica.
- La clonación de voz requiere un clip de referencia y su transcripción exacta; una transcripción incorrecta degrada la calidad de la síntesis.
- La entrada de texto debe normalizarse previamente con text2spoken para números, fechas y abreviaturas; de lo contrario, la lectura puede ser incorrecta.
- El modelo no nombra un idioma único, por lo que es necesario indicar la etiqueta de idioma a text2spoken en cada caso.
- La licencia Apache 2.0 permite uso comercial, pero exige atribución a travis-moore (Sema) como autor del modelo original y a TigreGotico Lda por la conversión.
- El rendimiento medido corresponde a CPU de escritorio; no hay datos de latencia en GPU ni de escalado con lotes.
- Al ser un modelo de un solo hablante clonable, no ofrece control explícito de emociones ni estilos más allá del timbre de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-multi-sema_afro-unicode
- Modelo original: https://huggingface.co/travis-moore/sema-tts-afro
- Modelo base: https://huggingface.co/mrfakename/OpenF5-TTS
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- text2spoken: https://github.com/TigreGotico/text2spoken
