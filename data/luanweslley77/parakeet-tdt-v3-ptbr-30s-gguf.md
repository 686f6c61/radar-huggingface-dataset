# luanweslley77/parakeet-tdt-v3-ptbr-30s-gguf

## Resumen

Parakeet TDT 0.6B v3 pt-BR (TAGARELA) en formato GGUF es una conversión de formato del checkpoint `alexandreacff/parakeet-tdt-v3-ptBR-30s`, un modelo de reconocimiento automático del habla (ASR) especializado en portugués de Brasil. No se ha reentrenado ni ajustado: los pesos son idénticos a los del checkpoint original, solo se ha cambiado el contenedor para que sea cargable por `transcribe.cpp` y por el motor Hex. El modelo deriva de `nvidia/parakeet-tdt-0.6b-v3`, un checkpoint multilingüe de 25 idiomas europeos, sobre el que se aplicó un fine-tuning con el corpus TAGARELA de habla espontánea.

La relevancia de esta ficha está en dos puntos concretos: primero, ofrece un modelo ASR de portugués brasileño de 0,6B parámetros en 705 MiB (Q8_0), lo que lo hace desplegable en hardware modesto; segundo, su rendimiento en habla espontánea supera al del modelo base y a Whisper large-v3-turbo, con una latencia por clip de 0,66–0,73 s frente a los 4,8–4,9 s de Whisper. La arquitectura es TDT (Token-and-Duration Transducer) con un tokenizador SentencePiece de 8192 tokens.

Es importante señalar que este GGUF **no es intercambiable** con otro GGUF de Parakeet pt-BR publicado en el Hub (`luizhrocha/parakeet-tdt-0.6b-v3-ptBR-gguf`), que apunta a `parakeet.cpp` y usa un esquema de metadatos y nombres de tensores distinto. Si el motor de inferencia es Hex o `transcribe.cpp`, hay que usar este archivo; si es `parakeet.cpp`, el otro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), 0.6B |
| Parametros totales | 0,6B (aproximadamente, segun denominacion del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio de 30 s segun el nombre del checkpoint) |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repositorio) |
| Idiomas soportados | pt (portugues de Brasil) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (archivo `parakeet-tdt-v3-ptBR-30s-Q8_0.gguf`, 739.508.416 bytes / 705 MiB) |
| Tokenizador | SentencePiece, 8192 tokens |
| Tensores | 697 en total: 424 F32, 48 F16, 225 Q8_0 |
| SHA-256 | `7d13a4fb474b2100d783ce40932413ecaa52c699fb8f3191c40485b82618a9ec` |
| Modelo base | `alexandreacff/parakeet-tdt-v3-ptBR-30s` (a su vez derivado de `nvidia/parakeet-tdt-0.6b-v3`) |
| Dataset de fine-tuning | `freds0/TAGARELA` |
| Motores compatibles | `transcribe.cpp`, Hex (verificado en 3.3.0) |
| Motores incompatibles | `parakeet.cpp` / `parakeet-cli`, `onnx-asr`, CoreML, sherpa-onnx, whisper.cpp |

## Arquitectura y entrenamiento

El modelo es un transducer TDT (Token-and-Duration Transducer), una variante de RNN-Transducer en la que el decodificador predice conjuntamente el token y su duración, lo que permite saltos temporales en la alineación y reduce el coste de decodificacion. El checkpoint base, `nvidia/parakeet-tdt-0.6b-v3`, es multilingüe (25 idiomas europeos) y fue desarrollado por NVIDIA. Sobre el se aplicó un fine-tuning con el corpus TAGARELA, un conjunto de habla espontánea de portugués brasileño, para obtener `alexandreacff/parakeet-tdt-v3-ptBR-30s`, que es el origen directo de este GGUF.

La conversión realizada por `luanweslley77` no modifica pesos: parte del `.nemo` original (un tar POSIX con `model_config.yaml`, `model_weights.ckpt` y el tokenizador), lo convierte a GGUF F32 (2,4 GB) con `convert-parakeet.py` y despues cuantiza a Q8_0 (705 MiB) con `transcribe-quantize`. En Q8_0, 32 pesos comparten una escala y se almacenan como enteros de 8 bits; los tensores pequeños se mantienen en F32 y los medianos en F16, lo que explica la reduccion de tamano. El tokenizador multilingüe de 8192 tokens se conserva intacto, de modo que las mayúsculas y la puntuación provienen del propio modelo y no de un post-procesador. La conversión se repitió desde cero el 2026-11-20 y produjo un archivo byte-idéntico, con el mismo SHA-256.

No se documenta en la información disponible el número de tokens de entrenamiento del fine-tuning, la composición exacta del dataset TAGARELA ni si hubo etapas de RLHF o DPO. Tampoco se detalla si el checkpoint base de NVIDIA empleó técnicas como decodificacion especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en portugués de Brasil, tanto en habla leída como espontánea.
- Transcripción con mayúsculas y puntuación generadas por el propio modelo, gracias a la conservación del tokenizador SentencePiece de 8192 tokens.
- Manejo de audio en ventanas de hasta 30 segundos, segun la denominacion del checkpoint de origen.
- Escritura de números en forma de palabras ("mil e quatrocentos", "oito por cento") en lugar de cifras, comportamiento propio del fine-tuning.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión o audio más allá del propio ASR).
- Capacidad multilingüe limitada al portugués de Brasil en este checkpoint, aunque el modelo base de NVIDIA cubre 25 idiomas europeos.

## Casos de uso

- **Dictado y transcripción de habla espontánea**: es el escenario donde el modelo rinde mejor, con un 17,96 % de WER en TAGARELA frente al 20,82 % del modelo base y el 22,86 % de Whisper large-v3-turbo. Adecuado para actas de reuniones, entrevistas y notas de voz en portugués brasileño.
- **Subtitulado y transcripción de contenido audiovisual**: la latencia de 0,66–0,73 s por clip permite procesar lotes de audio en pipelines de subtitulado sin cuello de botella, con un coste computacional muy inferior al de Whisper.
- **Transcripción en dispositivos con recursos limitados**: el archivo Q8_0 de 705 MiB cabe en memoria de sistemas embebidos y en GPUs de gama baja, lo que facilita el despliegue en local sin depender de servicios en la nube.
- **Sistemas de atención al cliente por voz**: la transcripción rápida de consultas habladas en portugués brasileño permite alimentar un motor de intenciones o un chatbot con texto limpio y puntuado, reduciendo la latencia percibida por el usuario.
- **Generación de corpus anotados**: el modelo puede usarse para pre-anotar audio en portugués de Brasil y acelerar la creación de datasets de ASR, con revisión humana posterior para corregir la normalización de números.
- **Integración en aplicaciones de accesibilidad**: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva, aprovechando el bajo coste de inferencia y la compatibilidad con motores ligeros como `transcribe.cpp`.
- **Procesamiento por lotes de archivos de audio**: la velocidad de inferencia (7,5 veces más rápida que Whisper large-v3-turbo) lo hace adecuado para transcribir grandes volúmenes de grabaciones en un tiempo razonable.

## Benchmarks y rendimiento

Resultados publicados en la model card. Habla leída: FLEURS `pt_br` dev, 50 clips, 1136 palabras de referencia. Habla espontánea: TAGARELA test, 10 clips, 245 palabras. Todos los modelos en Q8_0 y ejecutados con la misma build de `transcribe-cli`.

| Modelo | FLEURS bruto | FLEURS sin lineas con digitos | TAGARELA (espontaneo) | Mediana por clip |
|---|---|---|---|---|
| **pt-BR fine-tune (este archivo)** | 7,22 % | **2,39 %** | **17,96 %** | 0,66–0,73 s |
| Parakeet v3 original | 6,34 % | 3,76 % | 20,82 % | 0,67–0,76 s |
| Whisper large-v3-turbo | **4,75 %** | 3,42 % | 22,86 % | 4,8–4,9 s |

Lectura de los resultados segun la model card: en habla espontánea el checkpoint pt-BR obtiene aproximadamente un 14 % menos de errores que el modelo base del que se fine-tuneó y un 21 % menos que Whisper, a la velocidad del modelo base. En habla leída, el resultado bruto empeora porque el modelo escribe los números como palabras ("mil e quatrocentos" frente a "1.400"); al eliminar las ocho frases con dígitos, pasa del último al primer puesto (2,39 % frente a 3,76 %). Whisper es el único que formatea dígitos de forma nativa, lo que explica su ventaja en la columna bruta de FLEURS, a costa de 6,5 veces más tiempo por clip. Una ejecución anterior del 2026-11-08, con una selección de clips ligeramente distinta, dio 7,60 % / 4,05 % / 18,44 % para este modelo, manteniendo el mismo orden.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el archivo Q8_0 ocupa 705 MiB; la inferencia requiere espacio adicional para activaciones y buffers de audio. No se publica una cifra exacta de VRAM en la información disponible.
- **GPU recomendadas**: no se especifican en la model card. Por el tamano del modelo (0,6B en Q8_0), es razonable esperar que funcione en GPUs de gama media y baja, pero no hay datos confirmados.
- **Compatibilidad con GPU de consumo**: no confirmada explícitamente; el tamano del archivo sugiere que puede caber en GPUs de consumo, pero no se aporta una lista de modelos verificados.
- **Opciones de despliegue**: `transcribe.cpp` (y sus herramientas) y Hex (verificado en 3.3.0). No compatible con `parakeet.cpp`, `onnx-asr`, CoreML, sherpa-onnx ni whisper.cpp.
- **Latencia y throughput**: mediana de 0,66–0,73 s por clip en la evaluacion publicada, con la build de `transcribe-cli` usada en las pruebas. No se especifica el hardware empleado en esa medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | WER TAGARELA (espontaneo) | WER FLEURS sin digitos | Licencia | Formato |
|---|---|---|---|---|---|---|
| **Parakeet TDT 0.6B v3 pt-BR (este GGUF)** | 0,6B | audio de 30 s | **17,96 %** | **2,39 %** | CC-BY-4.0 | GGUF Q8_0 |
| Parakeet v3 original (NVIDIA) | 0,6B | audio de 30 s | 20,82 % | 3,76 % | CC-BY-4.0 | no disponible en esta comparacion |
| Whisper large-v3-turbo | no disponible en la informacion | no disponible en la informacion | 22,86 % | 3,42 % | no disponible en la informacion | no disponible en esta comparacion |
| `luizhrocha/parakeet-tdt-0.6b-v3-ptBR-gguf` | 0,6B | no disponible | no disponible | no disponible | no disponible | GGUF para `parakeet.cpp` |

La comparativa con `luizhrocha/parakeet-tdt-0.6b-v3-ptBR-gguf` es relevante por compatibilidad de motor, no por rendimiento: ambos son conversiones de Parakeet pt-BR, pero usan esquemas de metadatos y nombres de tensores distintos y no son intercambiables.

## Limitaciones y advertencias

- **Normalización de números**: el modelo escribe cifras como palabras ("mil e quatrocentos", "oito por cento") en lugar de "1.400" o "8%". Es un comportamiento del fine-tuning, no un error de reconocimiento, pero infla el WER en corpus con muchos dígitos. Requiere un paso de normalización inversa como post-procesado.
- **Licencia del dataset de origen**: TAGARELA está licenciado como CC BY-NC-SA 4.0, mientras que los pesos se declaran CC-BY-4.0. La model card indica que la implicacion de esta discrepancia se detalla en su sección de licencias, pero no se reproduce en la información disponible; conviene revisarla antes de un uso comercial.
- **Compatibilidad de motor restringida**: solo funciona en `transcribe.cpp` y Hex. No carga en `parakeet.cpp`, `onnx-asr`, CoreML, sherpa-onnx ni whisper.cpp, lo que limita las opciones de despliegue.
- **Idioma único**: el checkpoint está especializado en portugués de Brasil; no se garantiza un rendimiento adecuado en portugués europeo ni en otros idiomas, aunque el modelo base sea multilingüe.
- **Riesgo de alucinación**: no se documenta en la información disponible, pero es un riesgo inherente a los modelos ASR en audio con ruido o silencios largos.
- **Sesgos**: no se documentan sesgos conocidos en la model card.
- **Evaluación limitada**: los benchmarks publicados usan 50 clips de FLEURS y 10 clips de TAGARELA, un tamano de muestra reducido que limita la generalización de las cifras.
- **Sin datos de hardware**: no se especifican los requisitos de VRAM ni las GPU verificadas, lo que obliga a validar el despliegue en el hardware objetivo antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luanweslley77/parakeet-tdt-v3-ptbr-30s-gguf
- Modelo base del fine-tuning: https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-30s
- Checkpoint original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Dataset TAGARELA: https://huggingface.co/datasets/freds0/TAGARELA
- Motor `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp
- Motor Hex: https://github.com/anomalyco/hex
- GGUF alternativo para `parakeet.cpp`: https://huggingface.co/luizhrocha/parakeet-tdt-0.6b-v3-ptBR-gguf
