# adalat-ai/koyal-ml-120m-1.0-onnx

## Resumen

Koyal Malayalam ASR 120M (ONNX) es la exportación a formato ONNX del modelo de reconocimiento automático de voz en malabar (malayalam) desarrollado por Adalat AI. El modelo original, `adalat-ai/koyal-ml-120m-1.0`, es un sistema ASR de aproximadamente 120 millones de parámetros basado en una arquitectura Conformer con decodificador TDT (Token-and-Duration Transducer), derivado del checkpoint preentrenado MahaDhwani de AI4Bharat. Esta versión ONNX mantiene los pesos cuantizados y empaquetados para su ejecución sin PyTorch ni NeMo.

El modelo resuelve la transcripción de audio en malabar con ortografía enriquecida: incluye puntuación y numerales escritos, como aparecerían en un documento mecanografiado. Está pensado para despliegues ligeros en CPU, GPU o incluso navegador web, gracias a los tres formatos de pesos incluidos (float32, fp16 e int8). Su relevancia radica en que permite integrar ASR de calidad para un idioma de bajos recursos (el malabar) en entornos sin infraestructura de deep learning pesada.

La exportación sigue el diseño de la librería `onnx-asr` para modelos NeMo TDT, lo que facilita su carga directa desde Hugging Face con una sola línea de código. El modelo base reporta un WER_SCRIBE del 14,74 % en FLEURS-RO, según la model card original. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con decodificador TDT (híbrido TDT-CTC, solo se exporta la cabeza TDT) |
| Parametros totales | ~120M (según nombre del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la información) |
| Tipos de cuantizacion | float32, fp16, int8 (cuantización dinámica de pesos MatMul/Gemm; convoluciones en float32) |
| Idiomas soportados | malabar (ml) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.onnx`, `decoder_joint-model.onnx` en variantes float32, fp16 e int8) |

## Arquitectura y entrenamiento

El modelo es un Conformer (transformer convolucional) con decodificador TDT (Token-and-Duration Transducer). El encoder transforma características de audio (log-mel de 80 bandas con normalización por característica, según NeMo) en un vector por cada trama de 40 ms. El decodificador y la red conjunta realizan la decodificación codiciosa TDT, el modo por defecto de NeMo. El modelo original es híbrido TDT-CTC, pero la exportación ONNX solo incluye la cabeza TDT; la cabeza CTC auxiliar no se exporta.

El encoder se inicializa a partir del Conformer preentrenado MahaDhwani de AI4Bharat (licencia MIT). No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La exportación se realizó con NeMo 2.8.0rc0 (commit fijado), torch 2.11.0, onnx 1.21.0, onnxruntime 1.32.0 y onnxconverter-common 1.16.0, con resultados reproducibles byte a byte. La conversión a fp16 requirió adaptar los casts float32 del bloque de subsampling para que el grafo cargara correctamente.

## Capacidades

- Reconocimiento automático de voz (ASR) para malabar con ortografía enriquecida: puntuación y numerales escritos.
- Transcripción de audio mono a 16 kHz (onnx-asr remuestrea otras frecuencias de WAV).
- Decodificación codiciosa TDT, equivalente al modo por defecto de NeMo.
- Ejecución sin PyTorch ni NeMo: en Python, en otros lenguajes mediante bindings de ONNX Runtime o en navegador web.
- Soporte de tres niveles de precisión/cuantización para adaptarse a CPU, GPU o WebAssembly.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio más allá del ASR ni multilingüismo (solo malabar).

## Casos de uso

- Transcripción de reuniones y entrevistas en malabar: el modelo genera texto con puntuación y numerales, adecuado para actas y documentos mecanografiados sin postprocesado pesado.
- Subtitulado automático de vídeo y audio en malabar: la variante fp16 permite procesar en GPU con la mitad de descarga, útil para pipelines de generación de subtítulos.
- Atención al cliente por voz en malabar: integrable en sistemas de telefonía o asistentes que conviertan audio a texto para su posterior procesamiento.
- Digitalización de archivos orales y patrimonio cultural: la licencia CC-BY-4.0 permite uso comercial con atribución y la variante int8 facilita despliegues en servidores modestos.
- Aplicaciones web sin backend de deep learning: la variante int8 (201 MB) está pensada para WebAssembly y la fp16 para WebGPU en Chrome, lo que permite ASR en el navegador.
- Investigación en lenguas de bajos recursos: base para fine-tuning o evaluación de ASR en malabar, con exportación reproducible documentada.
- Integración en dispositivos edge o entornos sin GPU: la variante int8 en CPU ofrece el menor tamaño y es adecuada para Raspberry Pi o servidores sin acelerador.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| FLEURS-RO (WER_SCRIBE) | 14,74 % | Dato reportado en la model card original |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño de pesos, float32 ~500 MB, fp16 ~250 MB, int8 ~201 MB (más overhead de runtime).
- GPU recomendadas: no se especifican modelos concretos; la variante fp16 se ha probado con WebGPU en Chrome y CoreML en macOS.
- Cabe en GPU consumer: sí, por el reducido tamaño de los pesos; no se detallan modelos concretos de GPU.
- Opciones de despliegue: `onnx-asr` (Python, con extras `[cpu,hub]`), ONNX Runtime en otros lenguajes, navegador (WebAssembly para int8, WebGPU para fp16), CoreML en macOS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koyal Malayalam ASR 120M (ONNX) | ~120M | no disponible | WER_SCRIBE 14,74 % en FLEURS-RO | CC-BY-4.0 | ONNX en Hugging Face |
| Modelo base Koyal Malayalam ASR 120M | ~120M | no disponible | WER_SCRIBE 14,74 % en FLEURS-RO (mismo modelo) | CC-BY-4.0 | NeMo en Hugging Face |
| MahaDhwani (AI4Bharat) | no disponible | no disponible | no disponible | MIT | no disponible en la información |

No se dispone en la información proporcionada de datos de otros modelos ASR comparables para malabar (parámetros, contexto, rendimiento y disponibilidad), por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Solo soporta malabar; no es multilingüe.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR; el WER reportado es del 14,74 % en FLEURS-RO, lo que implica una tasa de error no despreciable.
- No se documentan sesgos específicos en la información disponible; al entrenarse presumiblemente con datos de malabar, puede presentar sesgos dialectales o de dominio.
- La cabeza CTC auxiliar no se exporta; solo está disponible la decodificación TDT.
- El front-end de audio (log-mel de 80 bandas con normalización) no forma parte de los archivos ONNX; debe aportarlo `onnx-asr` u otra implementación compatible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar las referencias de la model card original.
- La reproducibilidad byte a byte depende de versiones fijadas de torch, onnx y onnxruntime; versiones más recientes generan archivos distintos.
- No se especifican limitaciones de longitud de audio ni de contexto en la información disponible.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/adalat-ai/koyal-ml-120m-1.0-onnx
- Modelo base original: https://huggingface.co/adalat-ai/koyal-ml-120m-1.0
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- Repositorio NeMo (commit fijado para exportación): https://github.com/NVIDIA-NeMo/NeMo/tree/6967f48fda2a
- Conformer preentrenado MahaDhwani de AI4Bharat: no disponible enlace directo en la información proporcionada.
