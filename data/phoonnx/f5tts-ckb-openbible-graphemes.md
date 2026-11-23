# Phoonnx/f5tts-ckb-openbible-graphemes

## Resumen

f5tts-ckb-openbible-graphemes es una voz de síntesis de voz (text-to-speech) en kurdo central (sorani, código `ckb`) publicada por Phoonnx. Se trata de una conversión a formato ONNX del modelo `multilingual-tts/F5-TTS-OpenBible-Central-Kurdish`, desarrollado por el colectivo multilingual-tts, que a su vez entrenó el modelo desde cero con la arquitectura F5-TTS v1 Base sobre el corpus Open Bible. La conversión la firma TigreGotico Lda para su motor de TTS `phoonnx`, sin modificar los pesos originales.

El modelo resuelve un problema concreto: la escasez de voces TTS de calidad para kurdo central, un idioma con recursos limitados en el ecosistema de voz. Al estar empaquetado en ONNX e integrado en `phoonnx` (y a través de este en el ecosistema OVOS/Mycroft), se puede desplegar en entornos de producción sin depender de frameworks de deep learning pesados. El repositorio ocupa 1,9 GB e incluye tanto los grafos en fp32 como copias cuantizadas en int8.

La relevancia actual radica en su enfoque práctico: inferencia en CPU con un factor de tiempo real (RTF) medido de 57,2 en fp32 y 18,5 en int8 sobre un AMD Ryzen 5 7600, lo que lo hace viable en hardware de consumo sin GPU. Es una voz de un solo hablante con clonación por referencia de audio, muestreo a 24 kHz y una licencia CC BY-SA 4.0 que permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS v1 Base (modelo de difusión para TTS, no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (grafo original) e int8 (cuantización dinámica con onnxruntime, pesos QInt8) |
| Idiomas soportados | kurdo central (`ckb`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (grafos `<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 24000 Hz |
| Hablantes | 1 (clonación mediante clip de referencia) |
| Entrada de texto | Caracteres del texto con mayúsculas y marcas (`f5tts_pinyin`) |
| Puntuación | Entrenado con puntuación de cláusula `, . ! :`; preservada en phoonnx ≥ 1.96.1a1 |
| Tamaño del grafo fp32 | 1448,2 MB |
| Tamaño del grafo int8 | 461,4 MB |
| Pico de RSS fp32 | 3361,7 MB |
| Pico de RSS int8 | 1249,4 MB |
| Dataset de entrenamiento | `davidguzmanr/open-bible-resources` |
| Modelo base | `multilingual-tts/F5-TTS-OpenBible-Central-Kurdish` (relación: quantized) |
| Librería | `phoonnx` |

## Arquitectura y entrenamiento

El modelo subyacente emplea la arquitectura F5-TTS v1 Base, un sistema de síntesis de voz basado en modelos de difusión (flow matching) que genera audio a partir de texto y de una referencia de hablante. A diferencia de los TTS autorregresivos clásicos, F5-TTS no predice tokens de audio secuencialmente, sino que aprende una transformación de ruido a mel-espectrograma condicionada por el texto. El modelo se entrenó desde cero sobre el corpus Open Bible en kurdo central, según indica la model card del modelo original. No se dispone del número de horas de audio ni de la composición exacta del dataset más allá de su origen bíblico.

La innovación técnica de esta ficha concreta no está en el entrenamiento, sino en la conversión y el empaquetado. La entrada de texto usa la función `f5tts_pinyin` (un port de `convert_char_to_pinyin` de F5-TTS), que entrega al modelo los caracteres del texto incluidas las marcas diacríticas. Según las pruebas del autor, los identificadores de texto coinciden con los de F5-TTS en 8 de 8 filas de FLORES-200 y en 60 de 60 frases de la Wikipedia en kurdo central; los guillemets, la coma árabe, el signo de interrogación árabe y el punto y coma árabe reciben identificadores propios, mientras que los dígitos árabe-índicos se leen como el id 0 al no existir en el vocabulario (solo dígitos latinos). La cuantización int8 se realizó con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y pesos QInt8, verificando que el audio resultante es finito, no silencioso y de longitud entre 0,8 y 1,25 veces la del fp32.

## Capacidades

- Síntesis de voz en kurdo central (sorani) a 24 kHz con un único hablante.
- Clonación de voz zero-shot: el modelo reproduce el timbre del hablante de un clip de referencia corto acompañado de su transcripción.
- Procesamiento de texto con mayúsculas, marcas diacríticas y puntuación de cláusula (`, . ! :`).
- Manejo de signos de puntuación específicos del árabe (coma, interrogación, punto y coma) y guillemets como identificadores propios.
- Inferencia en CPU sin GPU, gracias a los grafos ONNX y a las copias int8.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al kurdo central; no se documentan otros idiomas.

## Casos de uso

- **Accesibilidad y lectura de contenido en kurdo central**: convertir artículos, documentación o textos religiosos a audio para usuarios con discapacidad visual o para consumo en movilidad. El modelo está entrenado sobre el corpus Open Bible, por lo que su dominio principal es texto religioso y prosa formal.
- **Asistentes de voz para OVOS/Mycroft**: desplegar una voz en kurdo central en asistentes domésticos open source seleccionando `openbible/ckb` en `mycroft.conf`. La integración con el plugin de phoonnx permite activarla sin escribir código de inferencia.
- **Locución de contenido educativo**: generar narraciones para cursos o materiales de aprendizaje en kurdo central. La clonación por referencia permite fijar un timbre concreto y mantenerlo consistente entre fragmentos.
- **Preproducción de audiolibros**: sintetizar capítulos completos en CPU y revisar la longitud y las pausas antes de una locución humana definitiva. El RTF de 18,5 en int8 sobre un Ryzen 5 7600 permite generar audio más rápido que tiempo real en hardware de escritorio.
- **Sistemas de anuncios o avisos automatizados**: integrar la síntesis en pipelines que generan avisos de texto a voz para aplicaciones de mensajería o altavoces, con la ventaja de que el modelo corre sin GPU.
- **Investigación en TTS para lenguas de bajos recursos**: servir como línea base reproducible para experimentos de clonación de voz y evaluación de inteligibilidad en kurdo central, con pesos ONNX y cuantización documentada.
- **Prototipado de interfaces de voz multilingües**: combinar esta voz con otras voces de phoonnx en una misma aplicación para cubrir varios idiomas, seleccionando el modelo según el locale del usuario.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de voz (MOS, WER, SIM) ni resultados en benchmarks estándar de TTS. Los únicos datos disponibles son las comprobaciones de control de calidad y las medidas de rendimiento en CPU:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del control de calidad | pass | pass |
| Caracteres por segundo | 11,9 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,00 |
| Tamaño del grafo | 1448,2 MB | 461,4 MB |
| Pico de RSS | 3361,7 MB | 1249,4 MB |
| RTF (mediana de 3, 4 hilos) | 57,222 | 18,546 |

Medido en un AMD Ryzen 5 7600 de 6 núcleos. El RTF es el tiempo de síntesis dividido por la duración del audio. El control de calidad se realizó con 3 frases de FLORES-200 devtest y un clip de referencia de Marcos 5:34 del corpus Open Bible; como Parakeet no tiene modelo para kurdo central, la comprobación se limita a longitud y silencio, sin ASR.

## Requisitos de hardware

- **VRAM estimada**: no aplica; la inferencia es en CPU con ONNX Runtime, sin requisito de GPU.
- **Memoria RAM**: pico de RSS de 3361,7 MB en fp32 y 1249,4 MB en int8.
- **GPU recomendadas**: no se documentan; el modelo está diseñado para CPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no hay datos de rendimiento en GPU.
- **CPU de referencia**: AMD Ryzen 5 7600 de 6 núcleos con 4 hilos de ejecución; RTF de 57,2 en fp32 y 18,5 en int8.
- **Cabe en hardware de consumo**: sí, en cualquier equipo con al menos 1,3 GB de RAM libre para int8 o 3,4 GB para fp32.
- **Opciones de despliegue**: `phoonnx` (pip install --pre phoonnx), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime directamente sobre los grafos.
- **Latencia y throughput**: con RTF de 18,5 en int8, generar 10 segundos de audio requiere aproximadamente 185 segundos de cómputo en el Ryzen 5 7600; en fp32, unos 572 segundos. El modelo es más lento que tiempo real en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| f5tts-ckb-openbible-graphemes | kurdo central | F5-TTS v1 Base, ONNX | no disponible | no disponible | CC BY-SA 4.0 | Hugging Face, phoonnx, OVOS |
| multilingual-tts/F5-TTS-OpenBible-Central-Kurdish | kurdo central | F5-TTS v1 Base | no disponible | no disponible | CC BY-SA 4.0 | Hugging Face |
| Otras voces F5-TTS de phoonnx | varios idiomas | F5-TTS v1 Base, ONNX | no disponible | no disponible | según voz | Hugging Face, phoonnx |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS para kurdo central en la información proporcionada. La comparación directa más relevante es con el modelo original del que deriva: esta versión añade el empaquetado ONNX, la cuantización int8 y la integración con phoonnx, sin alterar los pesos en fp32.

## Limitaciones y advertencias

- **Dominio de entrenamiento restringido**: el corpus es la Open Bible, por lo que la prosodia y el vocabulario pueden no generalizar bien a textos técnicos, coloquiales o de otros dominios.
- **Un solo hablante**: la voz base es única; la variedad de timbres depende de la clonación con clips de referencia, cuya calidad condiciona el resultado.
- **Sin evaluación de inteligibilidad**: el control de calidad no usa ASR (Parakeet no tiene modelo para kurdo central), solo comprueba longitud y silencio; no hay métricas de WER ni MOS.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir artefactos, ruidos o pronunciaciones incorrectas en textos fuera de distribución.
- **Dígitos árabe-índicos no soportados**: el vocabulario solo incluye dígitos latinos; un dígito árabe-índico se lee como id 0, lo que puede producir silencios o errores.
- **Normalización de texto limitada**: `text2spoken` no tiene fichero de idioma para `ckb-IQ`, por lo que números, fechas y abreviaturas no se expanden automáticamente; hay que preprocesar el texto manualmente.
- **Rendimiento en CPU modesto**: el RTF de 18,5 en int8 implica que la síntesis es más lenta que tiempo real en el hardware de referencia; para uso interactivo se necesitaría hardware más potente o aceptar latencia.
- **Licencia CC BY-SA 4.0**: permite uso comercial, pero exige atribución a multilingual-tts y compartir las obras derivadas bajo la misma licencia.
- **Idioma único**: no es un modelo multilingüe; solo cubre kurdo central.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-ckb-openbible-graphemes
- Modelo original: https://huggingface.co/multilingual-tts/F5-TTS-OpenBible-Central-Kurdish
- Dataset de entrenamiento: https://huggingface.co/datasets/davidguzmanr/open-bible-resources
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Herramienta de normalización text2spoken: https://github.com/TigreGotico/text2spoken
- Guía para añadir idiomas a text2spoken: https://github.com/TigreGotico/text2spoken/blob/dev/docs/adding-a-language.md
- TigreGotico: https://tigregotico.pt
