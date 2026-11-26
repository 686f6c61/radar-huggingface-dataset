# GoodnotesIT/nemotron-3.5-asr-streaming-multilingual-0.6b-litert-fp16

## Resumen

Nemotron 3.5 ASR Streaming Multilingual 0.6B — LiteRT FP16 es una exportación del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicada por GoodnotesIT. El modelo original lo desarrolla NVIDIA y está diseñado para transcripción en streaming multilingüe con un tamaño de 0,6 mil millones de parámetros. Esta variante concreta no es un modelo nuevo, sino un artefacto de despliegue: pesos en FP16 con E/S en FP32 empaquetados en formato LiteRT/TFLite para ejecución en dispositivos Android, con compilación ahead-of-time (AOT) del codificador para aceleradores NPU de MediaTek, Qualcomm y Samsung.

Su relevancia radica en que traslada un modelo ASR de NVIDIA al ecosistema móvil con una cadena de ejecución concreta: grafos portables con fallback JIT (NPU, GPU, CPU) y candidatos AOT del codificador por SoC. El repositorio incluye además informes de compilación cruzada y un manifiesto de release con checksums SHA-256, lo que facilita la verificación de integridad en pipelines de distribución de aplicaciones.

La información disponible es limitada: la model card no documenta arquitectura interna, idiomas exactos, datos de entrenamiento ni benchmarks. Los datos de esta ficha proceden de la model card y de los metadatos de Hugging Face; lo que no aparece ahí se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de tipo encoder-decoder con gráficos encoder, decoder y joint) |
| Parámetros totales | 0,6B (según nombre del modelo) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (pesos) con E/S FP32; artefactos LiteRT/TFLite |
| Idiomas soportados | multilingüe (lista concreta no disponible) |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | LiteRT/TFLite (`.tflite`), grafos portables y AOT por SoC |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo original (número de capas, tipo de atención, estrategia de streaming) ni sobre el dataset de entrenamiento, el número de tokens o si se aplicaron técnicas de RLHF/DPO. La estructura de artefactos del repositorio revela que el modelo se descompone en tres grafos: encoder, decoder y joint, lo que es coherente con una arquitectura de ASR de tipo transducer (RNN-T o similar), aunque la model card no lo confirma explícitamente.

La innovación destacable de esta exportación es el pipeline de despliegue: el codificador se compila AOT para doce objetivos de hardware (MediaTek MT6878, MT6897, MT6983, MT6985, MT6989, MT6991; Qualcomm SM8450, SM8550, SM8650, SM8750, SM8850; Samsung E9965), mientras que decoder y joint permanecen como grafos portables compartidos. Se usa LiteRT exporter/compiler `2.3.0.dev20260913` y el intérprete de compatibilidad Android `2.1.6`. Los grafos portables se han ejecutado con entradas tipadas representativas en el intérprete CPU de LiteRT 2.1.6, pero los ficheros AOT son candidatos de compilador sin validación en dispositivo físico declarada.

## Capacidades

- Reconocimiento automático del habla en modo streaming, pensado para transcripción incremental en tiempo real.
- Soporte multilingüe (el conjunto exacto de idiomas no está documentado en la información disponible).
- Ejecución en dispositivo (on-device) mediante LiteRT, con cadena de fallback NPU, GPU y CPU JIT.
- Aceleración específica por SoC mediante codificadores AOT para plataformas MediaTek, Qualcomm y Samsung.
- Integración en aplicaciones Android a través del intérprete LiteRT 2.1.6.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones Android: el modelo está empaquetado para ejecución on-device con LiteRT, de modo que la app puede transcribir audio sin enviar datos a la nube, usando el codificador AOT del SoC del dispositivo cuando esté validado y el grafo portable como fallback.
- Subtitulado en directo de contenido audiovisual: el modo streaming permite generar texto a medida que llega el audio, adecuado para subtítulos incrementales en reproductores móviles.
- Dictado por voz en editores de texto: un modelo de 0,6B en FP16 es viable en dispositivos de gama alta y media-alta, lo que permite dictado continuo con baja latencia percibida.
- Asistentes de voz integrados en apps: la transcripción local reduce la dependencia de red y mejora la privacidad en asistentes conversacionales embebidos.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones presenciales directamente en el teléfono.
- Procesamiento por lotes de audio en el dispositivo: transcripción de grabaciones almacenadas localmente en flujos de trabajo offline, aprovechando la cadena de fallback para distintos hardware.
- Evaluación y benchmarking de aceleradores móviles: los informes de compilación cruzada y el manifiesto de release permiten comparar el rendimiento de codificadores AOT entre SoCs y validar la cadena LiteRT en pipelines de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita. Con 0,6B parámetros en FP16, los pesos ocupan aproximadamente 1,2 GB; el consumo real depende de los tres grafos (encoder, decoder, joint) y del runtime LiteRT.
- GPU recomendadas: no aplica en el sentido de servidor; el objetivo son aceleradores móviles (NPU/GPU integradas) de los SoC listados.
- Compatibilidad con GPU de consumo: no está documentada para escritorio; el despliegue previsto es Android con LiteRT.
- SoCs con codificador AOT: MediaTek MT6878, MT6897, MT6983, MT6985, MT6989, MT6991; Qualcomm SM8450, SM8550, SM8650, SM8750, SM8850; Samsung E9965.
- Opciones de despliegue: LiteRT 2.1.6 (intérprete Android) con grafos portables y fallback JIT; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; los ficheros AOT no declaran validación en dispositivo físico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming Multilingual 0.6B — LiteRT FP16 (este) | 0,6B | no disponible | sí | NVIDIA Open Model License | Hugging Face (GoodnotesIT) |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B | no disponible | sí | NVIDIA Open Model License | Hugging Face (NVIDIA) |
| Alternativas ASR on-device de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de terceros no está disponible en la información proporcionada; la única referencia directa es el checkpoint original de NVIDIA, del que esta exportación deriva.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni comportamiento en dominios específicos (acentos, ruido, jerga técnica).
- No se especifica la lista concreta de idiomas soportados ni su calidad relativa; el etiquetado "multilingual" no garantiza cobertura uniforme.
- Los ficheros AOT son candidatos de compilador y no declaran validación en dispositivo físico; la aplicación debe mantener el fallback portable y no activar un candidato AOT hasta validar versiones de runtime/compilador y dispositivo.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; debe revisarse el texto completo antes de distribuir el modelo en producto.
- El repositorio ocupa 42,1 GB, en gran parte por los artefactos AOT por SoC y los informes; conviene seleccionar solo los objetivos necesarios para reducir el tamaño de distribución.
- El modelo es una exportación de terceros (GoodnotesIT), no una release oficial de NVIDIA; la trazabilidad depende del manifiesto y los checksums incluidos.
- No hay datos de latencia, throughput ni consumo energético, lo que dificulta estimar el rendimiento en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoodnotesIT/nemotron-3.5-asr-streaming-multilingual-0.6b-litert-fp16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/ea30d66debe3740a08b573244286791d423d6b3e
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
