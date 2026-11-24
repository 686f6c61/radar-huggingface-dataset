# phathat/parakeet-tdt-0.6b-v3-fp16-coreml

## Resumen

`phathat/parakeet-tdt-0.6b-v3-fp16-coreml` es una conversion a fp16 del encoder del modelo de reconocimiento automatico del habla (ASR) NVIDIA Parakeet TDT 0.6B v3, empaquetada en formato ONNX para ejecutarse sobre el Apple Neural Engine mediante el execution provider de Core ML de ONNX Runtime. No es un modelo nuevo ni un fine-tuning: es un artefacto de despliegue que contiene unicamente el encoder, pensado para emparejarse con el decodificador y la red joint en int8 del export ONNX original de `istupakov`.

El modelo base, Parakeet TDT 0.6B v3, es un sistema ASR multilingue de NVIDIA que cubre 25 idiomas europeos, con arquitectura FastConformer y decodificacion TDT (Token-and-Duration Transducer). Este repositorio reduce a la mitad el peso del encoder (de aproximadamente 2,4 GB en fp32 a 1,2 GB en fp16) y lo prepara para inferencia acelerada en hardware Apple, manteniendo las entradas y salidas en fp32/int64 para conservar la compatibilidad con el resto del pipeline.

Su relevancia es practica: demuestra que es posible ejecutar un encoder ASR de 0,6 mil millones de parametros en el Neural Engine de un chip Apple con latencias de decodificacion muy bajas (21 ms de media frente a 103 ms del encoder int8 en CPU en las pruebas del autor), lo que habilita transcripcion local, sin conexion y con bajo consumo energetico en macOS e iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) con decodificacion TDT; el repositorio contiene solo el encoder |
| Parametros totales | 0,6 mil millones (modelo base completo); el encoder fp16 ocupa 1.238.960.470 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; entrada de audio por frames de 10 ms, con buckets de 500, 1500 y 3000 frames (5, 15 y 30 s) en el ejemplo del autor |
| Tipos de cuantizacion | fp16 para pesos y activaciones del encoder (aritmetica de longitud en fp32); decodificador/joint en int8 en el export original |
| Idiomas soportados | 25 idiomas europeos (segun el modelo base; el repositorio no lista idiomas propios) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder-model.fp16.onnx`, archivo unico sin datos externos); compatible con Core ML `MLProgram` |

## Arquitectura y entrenamiento

El encoder procede de Parakeet TDT 0.6B v3 de NVIDIA, un modelo basado en FastConformer (variante eficiente de Conformer con atencion por bloques) acoplado a un decodificador TDT, que predice conjuntamente tokens y duraciones para alinear audio y texto sin necesidad de un CTC separado. El repositorio no aporta informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF; esos datos corresponden a la model card de NVIDIA, no incluida en la informacion disponible.

La innovacion tecnica de esta ficha es la conversion: se aplico `onnxconverter-common` con `convert_float_to_float16` y `keep_io_types=True`, de modo que las E/S permanecen en fp32/int64. La unica correccion necesaria fue mantener en fp32 los nodos del camino de calculo de longitud (`/pre_encode/{Cast,Add,Div,Floor,Constant}*`), porque en fp16 un nodo `Add` mezclaba precisiones y el grafo no cargaba. Con formas estaticas (overrides de dimensiones dinamicas), 1445 de los 1460 nodos del grafo se ejecutan en Core ML y el resto (aritmetica de longitud y mascaras) queda en CPU. El primer compilado de cada bucket tarda entre 30 y 55 s y Core ML lo cachea si se configura un directorio de cache.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) multilingue sobre 25 idiomas europeos, heredado del modelo base.
- Entrada de caracteristicas log-mel de 128 bins a 10 ms por frame; salida de embeddings de 1024 dimensiones con longitud codificada.
- Ejecucion en Apple Neural Engine via ONNX Runtime Core ML EP, y tambien en el execution provider de CPU.
- Inferencia con formas estaticas por buckets de duracion (5, 15 y 30 s en la configuracion de referencia).
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un encoder ASR.
- No se documentan capacidades de diarizacion, puntuacion, marcas de tiempo a nivel de palabra ni deteccion de idioma en este repositorio.

## Casos de uso

- Transcripcion local en macOS: integrar el encoder fp16 con el decodificador int8 de `istupakov` en una app de escritorio para transcribir audio sin enviar datos a la nube, aprovechando el Neural Engine y la cache de compilacion de Core ML.
- Dictado en aplicaciones iOS/macOS: con buckets de 5 s y latencias de decodificacion de ~21 ms en M4 Max, es adecuado para dictado en tiempo real con retroalimentacion inmediata.
- Subtitulado de reuniones y videollamadas: procesar segmentos de 15 o 30 s por bucket para generar subtitulos en 25 idiomas europeos en local, sin coste por minuto de API.
- Procesamiento por lotes de archivos de audio en equipos Apple: usar el execution provider de CPU para pipelines offline donde la precision es prioritaria (el autor reporta transcripciones identicas al encoder fp32 en CPU en todas las pruebas).
- Asistentes de voz embebidos: al ejecutarse en el Neural Engine con bajo consumo, encaja en flujos de activacion por voz y comandos cortos en dispositivos Apple.
- Prototipado e investigacion en ASR: permite comparar el comportamiento fp16 frente a fp32 con una metrica objetiva (similitud coseno de 0,972 a 0,9994 en las pruebas del autor) antes de desplegar en produccion.
- Aplicaciones de accesibilidad: transcripcion en vivo de conversaciones presenciales en un portatil Apple sin dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, etc.) en la informacion disponible. El autor si reporta mediciones de latencia y fidelidad de la conversion:

| Metrica | Resultado reportado |
|---|---|
| Encoder de 500 frames en Neural Engine (M4 Max) | ~12 ms |
| Decodificacion final media, 20 clips cortos en ingles (Neural Engine) | 21 ms |
| Decodificacion final media, mismos clips con encoder int8 en CPU | 103 ms |
| Similitud coseno vs. encoder fp32 en CPU (14 clips sinteticos en ingles) | 0,972 a 0,9994 |
| Transcripciones identicas al fp32 (14 clips) | 12 de 14; las otras 2 difieren en una palabra o una coma |
| Nodos del grafo ejecutados en Core ML (formas estaticas) | 1445 de 1460 |
| Tiempo de primer compilado por bucket | 30 a 55 s |

## Requisitos de hardware

- VRAM/almacenamiento: el archivo del encoder ocupa 1,2 GB; el pipeline completo requiere ademas el decodificador/joint int8 y el vocabulario del export de `istupakov`.
- Hardware objetivo: chips Apple con Neural Engine (series M y A recientes); el autor cita un M4 Max como referencia.
- GPU NVIDIA/AMD: no es el objetivo de este artefacto; para CUDA conviene usar el export ONNX original o el modelo PyTorch de NVIDIA.
- Cabe en equipos de consumo Apple con memoria unificada; no se proporcionan requisitos minimos de RAM.
- Despliegue: ONNX Runtime con Core ML execution provider (formato `MLProgram`, `ALL` compute units) o con CPU execution provider; requiere overrides de dimensiones dinamicas para formas estaticas.
- Latencia: ~12 ms por encoder de 500 frames y ~21 ms de decodificacion completa en M4 Max; no se reporta throughput agregado por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| phathat/parakeet-tdt-0.6b-v3-fp16-coreml | 0,6 B (solo encoder) | buckets de 5/15/30 s | 25 europeos (heredados) | CC BY 4.0 | ONNX fp16 / Core ML |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | 25 europeos | CC BY 4.0 | PyTorch/NeMo |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0,6 B | no disponible | 25 europeos | CC BY 4.0 | ONNX fp32 + int8 |
| OpenAI Whisper (familia) | 0,039 a 1,55 B | 30 s por ventana | ~99 idiomas | MIT | PyTorch, GGUF, etc. |

La comparativa de rendimiento frente a Whisper no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo contiene el encoder: no es funcional por si solo; requiere el decodificador/joint int8 y el vocabulario del export de `istupakov` en la revision indicada.
- La conversion fp16 introduce diferencias menores: en las pruebas del autor, 2 de 14 transcripciones difirieron del fp32 en una palabra o una coma.
- El Neural Engine solo admite formas estaticas; es necesario fijar la longitud de entrada y gestionar buckets con padding, lo que anade complejidad de integracion.
- El primer compilado por bucket tarda 30-55 s; sin directorio de cache de Core ML, ese coste se repite en cada arranque.
- No se documentan sesgos, tasas de alucinacion ni WER por idioma en este repositorio; deben consultarse en la model card de NVIDIA.
- Licencia CC BY 4.0: permite uso comercial con atribucion a NVIDIA, a `istupakov` y a esta conversion; no se ofrece garantia de ningun tipo.
- No afiliado ni respaldado por NVIDIA.
- No se listan idiomas soportados en el repositorio; la cobertura de 25 idiomas europeos se hereda del modelo base y no se verifica aqui.

## Enlaces

- Hugging Face: https://huggingface.co/phathat/parakeet-tdt-0.6b-v3-fp16-coreml
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export ONNX de referencia: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
