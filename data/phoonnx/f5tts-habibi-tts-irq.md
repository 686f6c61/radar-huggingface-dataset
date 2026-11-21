# Phoonnx/f5tts-habibi-tts-irq

## Resumen

f5tts-habibi-tts-irq es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura F5-TTS, desarrollado originalmente por SWivid como parte del proyecto Habibi-TTS y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo está especializado en árabe iraquí (`ar-IQ`) y toma caracteres de texto como entrada, sin necesidad de un fonemizador externo, ya que utiliza un `GraphemePhonemizer` para la conversión.

La relevancia de este modelo radica en su empaquetado optimizado para inferencia en producción: ofrece grafos ONNX en fp32 e int8, con un tamaño reducido de 483,4 MB en int8 y un factor de tiempo real (RTF) de 7,032 sobre CPU, lo que lo hace viable para despliegues en entornos sin GPU. Está integrado en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

El modelo se distribuye bajo licencia Apache-2.0, aunque el repositorio upstream de Habibi-TTS incluye metadatos con licencia `cc-by-nc-sa-4.0` debido a que alberga otros modelos con esa restricción. El modelo concreto `Specialized/IRQ` está explícitamente liberado bajo Apache-2.0 según la model card del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (transformer para TTS, segun la coleccion F5-TTS de Phoonnx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, int8 (cuantizacion dinamica de onnxruntime sobre nodos MatMul y Gemm) |
| Idiomas soportados | ar-IQ (arabe iraqui) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, `F5_Preprocess.onnx`, `F5_Decode.onnx`; variantes `_int8`) |
| Tamano del repo | 1,9 GB |
| Entrada de texto | caracteres del texto (graphemes) |
| Front end de texto | `GraphemePhonemizer` de scriptconv |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, una arquitectura de síntesis de voz desarrollada por SWivid. La model card no proporciona detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas internas más allá de la arquitectura base F5-TTS.

El empaquetado para phoonnx divide el modelo en tres grafos ONNX: `F5_Preprocess.onnx` (preprocesamiento), `model.onnx` (modelo principal) y `F5_Decode.onnx` (decodificación). La versión int8 se generó mediante cuantización dinámica de onnxruntime aplicada únicamente a los nodos MatMul y Gemm de los grafos fp32. Según la model card, la voz int8 superó la comprobación contra la voz fp32: en 5 frases de prueba, la distancia mel-cepstral del audio int8 respecto al fp32 es 1,11 veces la distancia entre dos ejecuciones fp32 entre sí.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en árabe iraquí (`ar-IQ`).
- Procesamiento de entrada a nivel de carácter (graphemes), sin requerir fonemización manual por parte del usuario.
- Inferencia en CPU con factores de tiempo real de 15,281 (fp32) y 7,032 (int8), medidos en AMD Ryzen 5 7600 con 4 hilos.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking, al tratarse de un modelo TTS.

## Casos de uso

- **Asistentes de voz en árabe iraquí**: el modelo puede generar respuestas habladas en `ar-IQ` dentro de un asistente OVOS, seleccionando la voz `habibi/ar-irq` en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`.
- **Sistemas de lectura de contenido en producción**: con un RTF de 7,032 en int8 sobre CPU, es adecuado para convertir artículos o notificaciones a audio en servidores sin GPU dedicada.
- **Aplicaciones de accesibilidad**: lectura de texto en pantalla para usuarios con discapacidad visual que requieran voz en árabe iraquí, con un consumo de memoria pico de 1.128 MiB en int8.
- **Integración en pipelines Python**: mediante `TTSModelManager` de phoonnx, se puede cargar la voz y sintetizar a ficheros WAV directamente, lo que facilita su inclusión en scripts de generación de audio por lotes.
- **Despliegue en dispositivos de borde o CPU**: el tamaño de 483,4 MB en int8 y la inferencia sobre CPU lo hacen viable en entornos con recursos limitados donde no se dispone de GPU.
- **Prototipado de interfaces conversacionales en árabe iraquí**: permite generar locuciones de prueba para validar flujos de diálogo antes de invertir en infraestructura de mayor capacidad.
- **Generación de audio para contenidos localizados**: útil para producir versiones en árabe iraquí de material formativo o informativo, dado el soporte específico de dialecto.

## Benchmarks y rendimiento

| Precision | Tamano | Memoria pico | Factor de tiempo real (RTF) |
|---|---|---|---|
| fp32 | 1.453,5 MB | 2.745 MiB | 15,281 |
| int8 | 483,4 MB | 1.128 MiB | 7,032 |

Mediciones realizadas en CPU AMD Ryzen 5 7600 con 4 hilos. El RTF es el tiempo de síntesis dividido por la duración del audio, mediana de 3 ejecuciones; un valor menor es más rápido. La memoria pico es la memoria residente máxima de un proceso nuevo que carga la voz y sintetiza una frase.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: no aplica; el modelo está empaquetado para inferencia en CPU con onnxruntime.
- **Memoria pico**: 2.745 MiB en fp32 y 1.128 MiB en int8 por proceso que carga la voz y sintetiza una frase.
- **GPU recomendadas**: no se especifican; las mediciones publicadas son sobre CPU (AMD Ryzen 5 7600).
- **Consumer GPU**: no se documenta soporte GPU en la información disponible; el empaquetado ONNX podría ejecutarse en GPU con onnxruntime, pero no se confirma ni se aportan cifras.
- **Opciones de despliegue**: phoonnx (librería Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, onnxruntime como motor de inferencia.
- **Latencia y throughput**: RTF de 15,281 en fp32 y 7,032 en int8 sobre CPU AMD Ryzen 5 7600 con 4 hilos; no se proporcionan cifras de throughput en otras plataformas.

## Comparativa con modelos similares

No se dispone de datos de otros modelos TTS comparables en la información proporcionada (parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas como otros modelos F5-TTS empaquetados por Phoonnx o modelos TTS de otros autores). No disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en árabe iraquí (`ar-IQ`); no se documenta soporte para otros idiomas o dialectos.
- No se proporcionan datos sobre sesgos, riesgo de alucinación o calidad de la prosodia más allá de las pruebas de distancia mel-cepstral entre fp32 e int8.
- La licencia del repositorio upstream de Habibi-TTS figura como `cc-by-nc-sa-4.0` en sus metadatos, aunque la model card del autor original indica que `Specialized/IRQ` se libera bajo Apache-2.0. Es recomendable verificar la licencia aplicable antes de un uso comercial.
- La cuantización int8 introduce una degradación medible: la distancia mel-cepstral del audio int8 respecto al fp32 es 1,11 veces la distancia entre dos ejecuciones fp32, lo que puede ser relevante en aplicaciones que exijan máxima fidelidad.
- No se documentan limitaciones de longitud de contexto ni de entrada de texto (número máximo de caracteres por síntesis).
- El modelo no incluye capacidades de razonamiento, tool calling ni agentes; su uso está restringido a síntesis de voz.
- Las mediciones de rendimiento se limitan a una única CPU (AMD Ryzen 5 7600 con 4 hilos); el rendimiento en otras plataformas no está documentado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/f5tts-habibi-tts-irq)
- [Upstream SWivid/Habibi-TTS/Specialized/IRQ](https://huggingface.co/SWivid/Habibi-TTS/tree/main/Specialized/IRQ)
- [Colección F5-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
