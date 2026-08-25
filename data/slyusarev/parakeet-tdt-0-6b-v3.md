# slyusarev/parakeet-tdt-0.6b-v3

## Resumen

Parakeet TDT 0.6B v3 es un modelo de reconocimiento automático de voz (ASR) desarrollado por NVIDIA, con 600 millones de parámetros, diseñado para transcripción de voz a texto de alto rendimiento en 25 idiomas europeos. Es la evolución de Parakeet TDT 0.6B v2, que solo soportaba inglés, y añade detección automática de idioma, puntuación y capitalización automáticas, y marcas temporales precisas a nivel de palabra y segmento. El modelo se basa en la arquitectura NeMo Conformer TDT (Transducer with Decoder-only Transformers) y está pensado para aplicaciones de transcripción en tiempo real y procesamiento de audio largo.

Este repositorio concreto es un espejo (mirror) byte-idéntico de la conversión a ONNX con cuantización int8 realizada por istupakov, orientada al uso con la librería onnx-asr. Está diseñado para aplicaciones offline, como la aplicación de dictado Textolit, que descarga estos archivos automáticamente. La conversión mantiene los mismos pesos que el modelo original de NVIDIA, con licencia CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (Transducer with Decoder-only Transformers) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 24 minutos con atencion completa (en A100 80GB) o hasta 3 horas con atencion local |
| Tipos de cuantizacion | int8 (en este repositorio ONNX) |
| Idiomas soportados | 25 idiomas europeos: ru, en, bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder-model.int8.onnx y decoder_joint-model.int8.onnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura NeMo Conformer TDT, una variante de transducer que combina un codificador Conformer con un decodificador basado únicamente en transformers (Decoder-only Transformers). Esta arquitectura permite un procesamiento eficiente de secuencias de audio largas, con soporte de atención completa hasta 24 minutos y atención local hasta 3 horas. El modelo incluye un módulo de puntuación y capitalización integrado, así como generación de marcas temporales a nivel de palabra y segmento.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de alineamiento) no están disponibles en la información proporcionada. Según el paper asociado (arXiv 2509.14128), el modelo se entrenó para extender el soporte de inglés a 25 idiomas europeos, con detección automática de idioma. No se menciona el uso de RLHF o DPO, ya que es un modelo de ASR, no generativo.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con detección automática de idioma.
- Puntuación y capitalización automáticas integradas en la salida.
- Marcas temporales precisas a nivel de palabra y de segmento.
- Soporte de audio largo: hasta 24 minutos con atención completa (en GPU A100 80GB) o hasta 3 horas con atención local.
- Alto rendimiento (high-throughput) para transcripción en tiempo real o por lotes.
- No incluye capacidades de tool calling, visión, ni generación de texto; es exclusivamente un modelo de ASR.

## Casos de uso

- Dictado offline: aplicaciones como Textolit utilizan este modelo para transcribir voz a texto sin conexión, aprovechando el formato ONNX int8 para ejecutarse en dispositivos locales.
- Transcripción de reuniones y entrevistas: su soporte de audio largo (hasta 3 horas con atención local) permite procesar grabaciones completas de reuniones con puntuación y timestamps.
- Subtitulado automático de vídeo: las marcas temporales a nivel de palabra facilitan la sincronización de subtítulos en 25 idiomas europeos.
- Asistentes de voz y comandos por voz: la detección automática de idioma y la baja latencia lo hacen adecuado para interfaces conversacionales en entornos multilingües.
- Transcripción de llamadas de atención al cliente: permite generar registros escritos de conversaciones telefónicas con precisión y marcas temporales para su análisis posterior.
- Accesibilidad: puede integrarse en herramientas de transcripción en tiempo real para personas con discapacidad auditiva, con soporte multilingüe y puntuación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper arXiv 2509.14128 ("Canary-1B-v2 & Parakeet-TDT-0.6B-v3: Efficient and High-Performance ...") presenta evaluaciones comparativas, pero los números concretos no están incluidos en los datos proporcionados. Se recomienda consultar dicho paper para métricas detalladas de WER (Word Error Rate) y comparaciones con otros modelos.

## Requisitos de hardware

- Tamaño de los archivos: encoder-model.int8.onnx (652 MB) y decoder_joint-model.int8.onnx (18 MB), lo que indica un modelo relativamente ligero.
- VRAM estimada para inferencia: no disponible, pero dado el tamaño de los pesos en int8, es probable que quepa en GPUs con 2-4 GB de VRAM, aunque no se ha confirmado.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 2060 o superior) o incluso CPU, gracias a la cuantización int8.
- Opciones de despliegue: onnx-asr (librería específica), ONNX Runtime, o integración en aplicaciones móviles o de escritorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 (este) | 600M | 25 europeos | Hasta 24 min (completa) / 3h (local) | CC-BY-4.0 | ONNX int8 |
| Parakeet TDT 0.6B v2 | 600M | Solo inglés | Similar | CC-BY-4.0 | NeMo / ONNX |
| Canary-1B-v2 | 1B | 25 europeos | No disponible | CC-BY-4.0 | NeMo |
| Whisper (openai) | 39M-1550M | 99 idiomas | 30 segundos por segmento | MIT (tamaños pequeños) / Apache-2.0 (large) | PyTorch, ONNX, etc. |

La comparativa se basa en datos públicos; los benchmarks de rendimiento no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a 25 idiomas europeos; no soporta idiomas de otras regiones.
- Puede presentar sesgos en acentos regionales, dialectos o habla no nativa, especialmente en idiomas con menos datos de entrenamiento.
- Riesgo de alucinaciones en audio ambiguo o con ruido de fondo, aunque es menor que en modelos generativos.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución a NVIDIA y al autor de la conversión ONNX (istupakov).
- Este repositorio es un mirror; se recomienda verificar la integridad de los archivos mediante los SHA-256 proporcionados antes de su uso en producción.
- El formato ONNX int8 puede implicar una ligera pérdida de precisión frente al modelo original en FP32, aunque no se han cuantificado las diferencias.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/slyusarev/parakeet-tdt-0.6b-v3
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión ONNX original de istupakov: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Paper técnico (arXiv): https://arxiv.org/html/2509.14128v2
- Colección NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
