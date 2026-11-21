# Phoonnx/f5tts-multi-silma_ai-v1

## Resumen

f5tts-multi-silma_ai-v1 es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura F5-TTS, desarrollado originalmente por SILMA AI y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo resuelve la conversión de texto a audio en dos idiomas (árabe y inglés) y está pensado para integración en pipelines de TTS, incluido el ecosistema OVOS.

El empaquetado ONNX incluye tres grafos (model.onnx, F5_Preprocess.onnx y F5_Decode.onnx) en dos precisiones: fp32 (748,9 MB) e int8 (304,4 MB). El modelo acepta caracteres del texto como entrada y emplea un front end basado en grafemas mediante GraphemePhonemizer de la librería scriptconv, sin conversión fonética explícita.

Su relevancia actual radica en la disponibilidad de una versión int8 cuantizada que reduce el uso de memoria a 807 MiB y mejora el factor de tiempo real a 3,422 (frente a 6,818 en fp32) sobre CPU, lo que permite ejecutar TTS de calidad en hardware de consumo sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (empaquetado ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica de onnxruntime sobre nodos MatMul y Gemm) |
| Idiomas soportados | arabe (MSA con tashkeel completo) e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx, F5_Preprocess.onnx, F5_Decode.onnx; variantes int8) |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, una arquitectura de sintesis de voz por difusion (flow matching) que genera audio a partir de texto. En este repositorio se distribuye exclusivamente como grafos ONNX, divididos en preprocesado, modelo principal y decodificacion, lo que permite inferencia con onnxruntime sin dependencias del framework original.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo original silma-ai/silma-tts deriva de una base con restriccion CC-BY-NC-SA-4.0 (Habibi/SADA/Mixat), aunque la variante silma-tts-v1 se declara Apache-2.0 sin la restriccion NC. La cuantizacion int8 se realizo con cuantizacion dinamica de onnxruntime exclusivamente sobre los nodos MatMul y Gemm, y fue validada contra la version fp32 mediante un reconocedor de voz con un WER de 0,095 en 5 frases de comprobacion.

## Capacidades

- Sintesis de voz a partir de texto en arabe (MSA con tashkeel completo) e ingles.
- Entrada basada en caracteres (grafemas) mediante GraphemePhonemizer de scriptconv, sin fonemizacion explicita.
- Generacion de audio en formato WAV mediante la API synthesize_wav de phoonnx.
- Dos voces empaquetadas: silma/v1 y silma/v1-en.
- Integracion como plugin de TTS en OVOS mediante ovos-tts-plugin-phoonnx.
- Inferencia en CPU sin GPU, con soporte para precision fp32 e int8.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni agentes.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra directamente como modulo TTS configurando el plugin ovos-tts-plugin-phoonnx en mycroft.conf, lo que permite dotar de voz a asistentes domesticos sin GPU.
- Lectura de contenido en arabe e ingles: sintesis de articulos, notificaciones o mensajes en ambos idiomas con un unico modelo, util para aplicaciones de accesibilidad.
- Sistemas de anuncios automatizados: generacion de avisos de voz en tiempo de ejecucion en entornos con CPU limitada gracias al factor de tiempo real de 3,422 en int8.
- Prototipado rapido de interfaces de voz: la instalacion via pip install --pre phoonnx y la carga de voces mediante TTSModelManager permiten integrar TTS en pocas lineas de codigo.
- Servicios de atencion al cliente con respuestas habladas: sintesis de respuestas generadas por texto en ingles o arabe en pipelines backend sin infraestructura GPU.
- Aplicaciones educativas de aprendizaje de idiomas: reproduccion de frases en arabe con tashkeel completo o en ingles para practicas de pronunciacion.
- Despliegue en dispositivos de borde: la version int8 (304,4 MB en disco, 807 MiB de memoria pico) cabe en equipos de consumo y entornos embebidos con CPU.

## Benchmarks y rendimiento

| Precision | Tamano en disco | Memoria pico | Factor de tiempo real (menor es mejor) | WER (5 frases) |
|---|---|---|---|---|
| fp32 | 748,9 MB | 1.585 MiB | 6,818 | 0,079 y 0,127 (dos ejecuciones) |
| int8 | 304,4 MB | 807 MiB | 3,422 | 0,095 |

Mediciones realizadas en CPU AMD Ryzen 5 7600 con 4 hilos; el factor de tiempo real es la mediana de 3 ejecuciones y la memoria pico corresponde al proceso que carga la voz y sintetiza una frase. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, al no ser aplicables a un modelo TTS.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU.
- Memoria RAM: 1.585 MiB en fp32 y 807 MiB en int8 como memoria pico del proceso.
- GPU: no se requieren; no se documenta soporte GPU especifico para estos grafos ONNX.
- Cabe en cualquier equipo de consumo: la version int8 ocupa 304,4 MB en disco y funciona en CPU con 4 hilos (medido en Ryzen 5 7600).
- Despliegue: libreria phoonnx (pip install --pre phoonnx) y plugin ovos-tts-plugin-phoonnx para OVOS; inferencia via onnxruntime.
- Latencia y throughput: factor de tiempo real de 6,818 en fp32 y 3,422 en int8 sobre la CPU de referencia, es decir, la sintesis tarda entre 3,4 y 6,8 veces la duracion del audio generado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Memoria pico |
|---|---|---|---|---|---|
| f5tts-multi-silma_ai-v1 (este) | F5-TTS | ar, en | Apache-2.0 | ONNX (fp32/int8) | 807 MiB (int8) |
| silma-ai/silma-tts | F5-TTS | ar, en | Apache-2.0 | no disponible en la informacion | no disponible |
| Otros modelos F5-TTS empaquetados por Phoonnx | F5-TTS | variable | variable | ONNX | no disponible |

La coleccion F5-TTS de Phoonnx agrupa otros modelos empaquetados con la misma libreria; no se dispone de datos comparativos de rendimiento frente a alternativas como XTTS o Bark en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta arabe e ingles; no hay soporte documentado de castellano ni de otros idiomas.
- No se documentan sesgos especificos, pero al ser un modelo TTS entrenado con datos no descritos, puede presentar sesgos de pronunciacion o prosodia segun el dominio.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones incorrectas en textos fuera de dominio.
- El front end basado en grafemas no realiza fonemizacion, lo que puede degradar la pronunciacion en palabras ambiguas o extranjeras.
- La licencia Apache-2.0 se declara para silma-tts-v1, pero el modelo base tiene restricciones CC-BY-NC-SA-4.0; conviene verificar la procedencia antes de uso comercial.
- La validacion de la cuantizacion int8 se limita a 5 frases con WER 0,095, por lo que la calidad en produccion puede variar.
- No se documentan capacidades de clonacion de voz ni control fino de prosodia.
- El paquete requiere la version preliminar de phoonnx (pip install --pre), lo que implica posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-multi-silma_ai-v1
- Modelo upstream: https://huggingface.co/silma-ai/silma-tts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion F5-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30
