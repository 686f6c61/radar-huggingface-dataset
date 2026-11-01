# MostafaAhmed98/Sabeq-ASR-ONNX

## Resumen

Sabeq-ASR ONNX es la versión exportada a formato ONNX del modelo Sabeq-ASR, un sistema de reconocimiento automático del habla (ASR) para árabe desarrollado por MostafaAhmed98. El modelo emplea una arquitectura FastConformer híbrida con dos cabezas de decodificación: RNN-T (Transducer) y CTC, y fue entrenado originalmente con el framework NVIDIA NeMo. Esta variante ONNX está pensada para facilitar el despliegue en entornos de inferencia compatibles con ONNX Runtime, evitando la dependencia del stack de NeMo en producción.

El modelo cubre árabe estándar moderno (MSA) y varios dialectos árabes, según indica la model card. El repositorio ocupa aproximadamente 0,5 GB, lo que sugiere una exportación en precisión reducida o de un checkpoint de tamaño moderado, aunque no se especifica el número exacto de parámetros. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

Su relevancia actual radica en la escasez relativa de modelos ASR abiertos centrados específicamente en árabe y sus dialectos, y en la utilidad de disponer de una exportación ONNX lista para integrarse en aplicaciones de transcripción sin depender de CUDA ni de NeMo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida (Transducer RNN-T + CTC) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene pesos ONNX; el tag `base_model:quantized` sugiere una exportación cuantizada, sin detalle del esquema) |
| Idiomas soportados | árabe (`ar`), incluyendo MSA y varios dialectos según la model card |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en FastConformer, una variante del encoder Conformer con downsampling agresivo pensada para reducir el coste computacional en tareas de audio. Sobre ese encoder se montan dos cabezas de decodificación: una Transducer (RNN-T), que modela conjuntamente acústica y lenguaje de forma autoregresiva, y una CTC, que permite decodificación no autoregresiva y suele ofrecer menor latencia. Esta combinación híbrida es habitual en NeMo porque permite elegir entre precisión (Transducer) y velocidad (CTC) en inferencia.

Según la model card, el modelo original fue ajustado (fine-tuned) con NVIDIA NeMo para reconocimiento de árabe estándar moderno y múltiples dialectos. No se proporcionan en la información disponible datos sobre el número de horas de audio de entrenamiento, la composición del dataset, el uso de aumentación de datos, ni si se aplicaron técnicas de adaptación como especulación o decodificación conjunta en la exportación. Tampoco se detalla el proceso de exportación a ONNX (versión de opset, particionado de grafos, fusión de operaciones).

## Capacidades

- Reconocimiento automático del habla en árabe, tanto en registro estándar moderno como en varios dialectos.
- Decodificación dual: Transducer (RNN-T) para máxima precisión y CTC para inferencia más rápida y simple.
- Ejecución mediante ONNX Runtime, sin necesidad de GPU NVIDIA ni del stack de NeMo en el entorno de despliegue.
- Entrada de audio en formato convencional para pipelines ASR (la model card no detalla el preprocesado exacto requerido: frecuencia de muestreo, normalización, extracción de features).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en árabe: el modelo puede convertir audio de reuniones en texto para actas o resúmenes posteriores, aprovechando su cobertura de MSA y dialectos para hablantes de distintas regiones.
- Subtitulado automático de vídeo: integrado en un pipeline de transcripción con marcas temporales a nivel de segmento, adecuado para contenidos en árabe donde los ASR genéricos multilingües rinden peor.
- Atención al cliente en centros de contacto: transcripción de llamadas en árabe para análisis de calidad, búsqueda de palabras clave y cumplimiento normativo, con despliegue en CPU mediante ONNX Runtime.
- Aplicaciones móviles o de borde: al estar en formato ONNX y ocupar 0,5 GB, puede ejecutarse en dispositivos sin GPU dedicada mediante ONNX Runtime Mobile, útil para dictado offline.
- Generación de corpus y datasets: transcripción masiva de audio árabe para construir datasets de texto o alimentar sistemas de entrenamiento de modelos de lenguaje.
- Accesibilidad: subtitulado en tiempo real para personas con discapacidad auditiva en entornos donde se habla árabe, usando la cabeza CTC para minimizar latencia.
- Investigación en dialectología: análisis de variación dialectal a partir de transcripciones, comparando el comportamiento del modelo entre registros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona las métricas WER y CER como etiquetas, pero no incluye valores numéricos ni conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; con un repositorio de 0,5 GB en ONNX, la inferencia en FP32 requeriría del orden de 1 a 2 GB de memoria, y menos si la exportación ya está cuantizada.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) es suficiente; también es viable en CPU.
- GPU de consumo: previsiblemente cabe en tarjetas consumer (RTX 3060 en adelante) e incluso en CPU para audio de duración moderada, aunque no hay cifras publicadas.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), integración en servidores propios o aplicaciones de escritorio/móvil. No se documenta soporte directo en vLLM, llama.cpp u Ollama, que no están orientados a ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| Sabeq-ASR ONNX | FastConformer híbrida (RNN-T + CTC) | Árabe (MSA y dialectos) | no disponible | CC-BY-4.0 | ONNX |
| Whisper (OpenAI) | Transformer encoder-decoder | Multilingüe (incluye árabe) | 30 s por ventana | MIT | PyTorch, GGML, ONNX (comunitario) |
| NVIDIA NeMo Arabic ASR | Conformer/Transducer | Árabe | no disponible | varía por checkpoint | NeMo, ONNX |
| MMS (Meta) | Wav2Vec2 / CTC | Multilingüe | no disponible | CC-BY-NC (según variante) | PyTorch |

La comparación cuantitativa de WER no es posible con la información disponible. Frente a Whisper, Sabeq-ASR está especializado en árabe y ofrece decodificación CTC de baja latencia, mientras que Whisper aporta cobertura multilingüe amplia. Frente a los checkpoints de NeMo, la ventaja de esta versión es el formato ONNX listo para producción.

## Limitaciones y advertencias

- No se han publicado métricas de WER/CER, por lo que el rendimiento real en dialectos concretos es desconocido.
- Riesgo de alucinación y de transcripciones incorrectas en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento.
- Cobertura dialectal declarada de forma genérica; no se especifica qué dialectos ni con qué calidad.
- El preprocesado de audio requerido (frecuencia de muestreo, extracción de features) no está documentado en la model card, lo que puede provocar errores de integración.
- La licencia CC-BY-4.0 exige atribución al autor en usos derivados, incluido uso comercial.
- El repositorio no presenta descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta), lo que implica ausencia de evidencia externa sobre su robustez.
- No hay información sobre sesgos demográficos, de género o regionales en las transcripciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MostafaAhmed98/Sabeq-ASR-ONNX
- Modelo base: https://huggingface.co/MostafaAhmed98/Sabeq-ASR
- NVIDIA NeMo (framework de entrenamiento): https://github.com/NVIDIA/NeMo
- ONNX Runtime: https://onnxruntime.ai/
