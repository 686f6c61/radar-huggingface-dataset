# Phoonnx/f5tts-habibi-tts-msa

## Resumen

f5tts-habibi-tts-msa es un modelo de sintesis de voz (text-to-speech) para arabe estandar moderno (MSA), empaquetado en formato ONNX por Phoonnx a partir del modelo original Habibi-TTS Specialized/MSA de SWivid. El modelo subyacente emplea la arquitectura F5-TTS, un sistema de sintesis no autorregresivo basado en flow matching con un transformer de difusion, y se distribuye con los grafos de preprocesado, sintesis y decodificacion separados para su ejecucion en onnxruntime.

La relevancia practica del empaquetado radica en que elimina la dependencia del ecosistema PyTorch original y ofrece dos variantes de precision: fp32 (1.453,4 MB, factor de tiempo real 19,244) e int8 (483,4 MB, factor de tiempo real 7,571), medidas ambas en una CPU AMD Ryzen 5 7600 con 4 hilos. Esto permite desplegar sintesis de voz en arabe en entornos sin GPU y con requisitos de memoria moderados (1.113 MiB de pico en int8).

El modelo se integra en el ecosistema phoonnx y en OVOS mediante el plugin ovos-tts-plugin-phoonnx, y utiliza la libreria scriptconv para la normalizacion de texto y la conversion a grafemas. La licencia del modelo especializado MSA es Apache 2.0, lo que facilita su uso comercial, a diferencia de otras variantes del repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (transformer con flow matching, no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica de onnxruntime sobre nodos MatMul y Gemm) |
| Idiomas soportados | arabe (`ar`), variante arabe estandar moderno (MSA) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `F5_Preprocess.onnx`, `F5_Decode.onnx` y variantes `_int8`) |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, una arquitectura de sintesis de voz no autorregresiva que combina flow matching con un transformer de difusion para generar mel-espectrogramas a partir de texto. El empaquetado de Phoonnx separa el grafo en tres componentes ONNX: preprocesado (`F5_Preprocess`), sintesis (`model`) y decodificacion (`F5_Decode`), lo que permite ejecutar el pipeline completo en onnxruntime sin PyTorch.

El modelo original procede de SWivid/Habibi-TTS, en su rama Specialized/MSA, especializada en arabe estandar moderno. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion int8 se genero mediante cuantizacion dinamica de onnxruntime aplicada exclusivamente a los nodos MatMul y Gemm; segun la model card, la distancia mel-cepstral entre el audio int8 y el fp32 es 1,01 veces la distancia entre dos ejecuciones fp32, lo que indica una degradacion practicamente despreciable.

La entrada de texto se procesa mediante `GraphemePhonemizer` de scriptconv, que normaliza el texto y lo convierte directamente a grafemas, sin paso intermedio de fonemizacion.

## Capacidades

- Sintesis de voz (text-to-speech) en arabe estandar moderno a partir de texto en grafemas.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Ejecucion en CPU mediante onnxruntime, sin necesidad de GPU.
- Dos niveles de precision (fp32 e int8) con pesos separados para preprocesado, sintesis y decodificacion.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Normalizacion y conversion de texto delegadas a scriptconv.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni razonamiento multi-paso.

## Casos de uso

- Asistentes de voz en arabe para OVOS: el modelo se selecciona mediante la clave `voice: "habibi/ar-msa"` en `mycroft.conf` y sintetiza respuestas del asistente en arabe estandar moderno sin infraestructura GPU.
- Lectura de articulos y documentos en arabe: con la variante int8 (483,4 MB) puede desplegarse en servidores modestos para convertir texto en audio en pipelines de accesibilidad.
- Generacion de audiolibros o contenido editorial en MSA: el registro del arabe estandar moderno es adecuado para narracion formal, y el factor de tiempo real de 7,571 en int8 permite procesar lotes en CPU.
- Sistemas de anuncios y avisos automatizados: integracion en aplicaciones de megafonia o notificaciones telefonicas que requieran locucion en arabe formal.
- Prototipado rapido de interfaces de voz: la instalacion via `pip install --pre phoonnx` y la API de `TTSModelManager` permiten tener sintesis funcional en pocas lineas de codigo.
- Despliegue en dispositivos de borde o entornos con memoria limitada: el pico de 1.113 MiB en int8 hace viable la ejecucion en maquinas sin GPU dedicada.
- Evaluacion comparativa de TTS en arabe: al estar empaquetado en ONNX con dos precisiones documentadas, sirve como referencia reproducible en pruebas de calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona metricas de tamano, memoria y velocidad:

| Precision | Tamano | Memoria pico | Factor de tiempo real |
|---|---|---|---|
| fp32 | 1.453,4 MB | 2.747 MiB | 19,244 |
| int8 | 483,4 MB | 1.113 MiB | 7,571 |

Mediciones realizadas en CPU AMD Ryzen 5 7600 con 4 hilos; el factor de tiempo real es la mediana de 3 ejecuciones y un valor menor indica mayor velocidad.

## Requisitos de hardware

- VRAM: no aplica en el modo documentado; la inferencia se realiza en CPU con onnxruntime.
- Memoria RAM: aproximadamente 2.747 MiB de pico en fp32 y 1.113 MiB en int8.
- CPU: mediciones sobre AMD Ryzen 5 7600 con 4 hilos; no se documentan requisitos minimos.
- GPU: no se documenta soporte ni aceleracion por GPU; el empaquetado esta orientado a onnxruntime en CPU.
- Despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: factor de tiempo real de 19,244 (fp32) y 7,571 (int8); el int8 es aproximadamente 2,5 veces mas rapido que el fp32 en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| f5tts-habibi-tts-msa (este) | F5-TTS | Arabe MSA | Apache 2.0 | ONNX fp32/int8 | 1.453,4 MB / 483,4 MB |
| SWivid/Habibi-TTS Specialized/MSA (upstream) | F5-TTS | Arabe MSA | Apache 2.0 | PyTorch (repositorio original) | no disponible |
| Otras variantes Habibi-TTS (ALG, EGY, IRQ, MAR) | F5-TTS | Variantes de arabe | Apache 2.0 | PyTorch / ONNX segun empaquetado | no disponible |
| Modelos Habibi-TTS Unified, SAU y UAE | F5-TTS | Arabe | CC-BY-NC-SA-4.0 | PyTorch | no disponible |

No se dispone de datos de benchmarks que permitan comparar calidad de sintesis con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo solo cubre arabe estandar moderno; no se documenta soporte para otras lenguas ni para dialectos arabes.
- No se dispone de informacion sobre sesgos de generacion, calidad de prosodia ni robustez ante texto ruidoso o fuera de dominio.
- Riesgo de alucinacion acustica o artefactos en entradas atipicas no evaluado en la informacion disponible.
- La licencia Apache 2.0 aplica a la variante Specialized/MSA; el repositorio upstream contiene otros modelos (Unified, SAU, UAE) bajo CC-BY-NC-SA-4.0, por lo que debe verificarse que se usa el artefacto correcto en produccion.
- La cuantizacion int8 introduce una degradacion medida de 1,01 veces la distancia mel-cepstral entre ejecuciones fp32, considerada despreciable por el autor, pero conviene validarla en el dominio de uso concreto.
- El modelo requiere la libreria phoonnx en version preliminar (`--pre`), lo que implica posibles cambios de API.
- No se documentan requisitos minimos de CPU ni comportamiento en hardware distinto al de referencia.
- El front end depende de scriptconv y del `GraphemePhonemizer`; textos sin normalizacion adecuada pueden producir pronunciaciones incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-habibi-tts-msa
- Modelo upstream (SWivid/Habibi-TTS, Specialized/MSA): https://huggingface.co/SWivid/Habibi-TTS/tree/main/Specialized/MSA
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion F5-TTS empaquetada por Phoonnx: https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30
