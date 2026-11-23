# alexandreacff/parakeet-tdt-v3-ptBR-30s-onnx

## Resumen

`parakeet-tdt-v3-ptBR-30s-onnx` es la exportación al formato ONNX del modelo de reconocimiento automático del habla (ASR) `parakeet-tdt-v3-ptBR-30s`, desarrollado por el usuario alexandreacff. Se trata de un modelo NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) especializado en portugués de Brasil, empaquetado según el diseño de la librería `onnx-asr` para su ejecución en tiempo de inferencia sin dependencia del framework NeMo original.

El modelo resuelve el problema de transcripción de audio a texto en portugués brasileño con una ventana de procesamiento de hasta 30 segundos por segmento, lo que lo hace adecuado para dictado, subtitulado y pipelines de transcripción por lotes. La exportación a ONNX es relevante porque permite desplegar el modelo en entornos ligeros (CPU, ONNX Runtime, contenedores sin CUDA) y facilita su integración en aplicaciones que no pueden asumir la pila de dependencias de NVIDIA NeMo.

El repositorio ocupa 2,5 GB e incluye los pesos en formato ONNX junto con el preprocesador mel de 128 bandas (`nemo128.onnx`), el vocabulario y el fichero de configuración. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. No se dispone de información publicada sobre el número de parámetros, el volumen de datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | segmentos de audio de hasta 30 segundos (ventana de inferencia) |
| Tipos de cuantizacion | no disponible (exportación ONNX; el repo base está etiquetado como `quantized`) |
| Idiomas soportados | portugués (pt), variante de Brasil |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.onnx` + `.data`, `decoder_joint-model.onnx`, `nemo128.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Conformer, es decir, un transformer que combina bloques de auto-atención con convoluciones depthwise para capturar dependencias locales y globales en la señal acústica. Sobre el encoder se sitúa un decodificador de tipo TDT (Token-and-Duration Transducer), una variante de los transducers RNN-T que predice conjuntamente el token emitido y su duración, lo que reduce el número de pasos de decodificación y mejora la eficiencia frente a los transducers clásicos.

El preprocesador incluido (`nemo128.onnx`) genera características mel de 128 bandas, coherentes con la configuración de NeMo. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del corpus, el uso de técnicas de aumento de datos ni si hubo ajuste fino supervisado o preferencias (RLHF/DPO). El modelo base está etiquetado como cuantizado, pero la model card de la exportación ONNX no especifica el esquema de cuantización aplicado ni los tipos numéricos de cada grafo.

## Capacidades

- Reconocimiento automático del habla en portugués de Brasil, con salida de texto plano.
- Procesamiento de segmentos de audio de hasta 30 segundos por invocación.
- Decodificación TDT con predicción conjunta de token y duración, orientada a reducir latencia.
- Ejecución sobre ONNX Runtime, sin dependencia de PyTorch ni de NeMo en tiempo de inferencia.
- Integración directa con la librería `onnx-asr` mediante `onnx_asr.load_model("nemo-conformer-tdt", ...)`.
- No se documentan capacidades de traducción, diarización de hablantes, marcas de tiempo a nivel de palabra ni detección de idioma.

## Casos de uso

- Transcripción de dictado en portugués de Brasil: el modelo convierte notas de voz de hasta 30 segundos en texto, adecuado para aplicaciones de productividad y toma de notas donde la ventana corta evita el padding excesivo.
- Subtitulado de vídeo por segmentos: dividiendo el audio en fragmentos de 30 segundos se pueden generar subtítulos sincronizados, con la ventaja de que el formato ONNX permite desplegar el pipeline en servidores sin GPU.
- Atención al cliente con voz: transcripción de llamadas o mensajes de voz entrantes en portugués brasileño antes de pasarlos a un sistema de análisis de sentimiento o enrutamiento.
- Pipelines de transcripción por lotes en CPU: al ejecutarse sobre ONNX Runtime, el modelo puede procesar colas de audios en infraestructura sin acelerador, reduciendo coste frente a alternativas que requieren NeMo y CUDA.
- Integración en aplicaciones de escritorio o móviles: el formato ONNX y el tamaño del repositorio (2,5 GB) permiten empaquetar el modelo en aplicaciones nativas con runtime ONNX embebido, siempre que se acepte el coste de almacenamiento.
- Investigación en ASR para portugués: sirve como referencia reproducible para comparar variantes de decodificación TDT frente a CTC o RNN-T clásicos en un idioma con menos recursos que el inglés.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en contenido en portugués brasileño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repositorio de 2,5 GB en ONNX, una ejecución en FP32 requeriría del orden de varios GB de memoria, y en CPU puede ejecutarse con RAM del mismo orden.
- GPU recomendadas: no disponibles en la documentación; al ser una exportación ONNX, es compatible con cualquier GPU soportada por ONNX Runtime (CUDA o TensorRT) y con ejecución en CPU.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8-12 GB de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA), la librería `onnx-asr` y cualquier runtime compatible con ONNX; no se documenta soporte para vLLM, llama.cpp ni TGI, que no aplican a modelos ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-v3-ptBR-30s-onnx | Conformer + TDT | pt-BR | 30 s de audio | CC-BY-4.0 | ONNX |
| parakeet-tdt-v3-ptBR-30s (base) | Conformer + TDT | pt-BR | 30 s de audio | no disponible en la información | NeMo/PyTorch |
| Whisper (variantes multilingües) | Transformer encoder-decoder | multilingüe | 30 s de audio | MIT (según versión) | PyTorch, ONNX, GGUF |
| NeMo Conformer-CTC en portugués | Conformer + CTC | pt | segmentos variables | no disponible en la información | NeMo |

La comparación con Whisper es la más relevante por su ubicuidad: Whisper cubre portugués dentro de un modelo multilingüe, mientras que esta exportación está especializada en pt-BR y emplea decodificación TDT en lugar de un decoder autorregresivo. No se dispone de métricas comparativas (WER, CER) en la información proporcionada para cuantificar la diferencia.

## Limitaciones y advertencias

- Solo cubre portugués de Brasil; no se documenta soporte para portugués europeo ni otros idiomas.
- La ventana de 30 segundos obliga a segmentar audios largos, lo que puede introducir errores en las fronteras entre segmentos.
- No se publican métricas de sesgo, tasas de alucinación ni evaluación de robustez ante ruido, acentos regionales o audio telefónico.
- El modelo base está etiquetado como cuantizado, pero la exportación ONNX no detalla el esquema de cuantización, lo que dificulta estimar la pérdida de precisión frente al modelo original.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige mantener el crédito al autor y no impone restricciones adicionales de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria publicada.
- No se documentan marcas de tiempo, diarización ni puntuación automática, lo que limita su uso directo en subtitulado profesional sin postprocesado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-30s-onnx)
- [Modelo base](https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-30s)
- [Librería onnx-asr](https://github.com/istupakov/onnx-asr)
