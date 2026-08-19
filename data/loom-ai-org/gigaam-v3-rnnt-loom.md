# loom-ai-org/gigaam-v3-rnnt-loom

## Resumen

GigaAM-v3 RNNT es un modelo de reconocimiento automático del habla (ASR) desarrollado por Sber y exportado por loom-ai-org al formato GGUF para su ejecución con el motor loom.cpp. Se basa en el modelo original `ai-sage/GigaAM-v3`, un Conformer con decodificador RNNT (Recurrent Neural Network Transducer) entrenado para ruso e inglés. Esta exportación empaqueta los pesos sin modificar en un único archivo GGUF autodescriptivo que incluye la topología del grafo, el tokenizador y un script de control, lo que facilita su despliegue en entornos de producción con loom-py.

El modelo resuelve el problema de transcripción de audio en tiempo real o por lotes para dos idiomas principales, con soporte para ventanas de audio largas y emisión de marcas temporales. Su relevancia actual radica en la combinación de una arquitectura eficiente (Conformer RNNT) con un formato de distribución ligero (GGUF) que permite inferencia en CPU y GPU con requisitos moderados. Con aproximadamente 223 millones de parámetros, se sitúa en un rango de tamaño medio-bajo, adecuado para despliegues en edge o servidores sin necesidad de hardware especializado.

La licencia MIT y la disponibilidad de herramientas como loom-py y loom-exporter facilitan su integración en pipelines personalizados, tanto para investigación como para aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer RNNT (transductor) |
| Parametros totales | 223.101.448 (aprox. 223M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR, procesa audio por ventanas) |
| Tipos de cuantizacion | GGUF (no se especifica el tipo de cuantizacion) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (autodescriptivo) |

## Arquitectura y entrenamiento

El modelo original GigaAM-v3 emplea una arquitectura Conformer con decodificador RNNT, una combinación ampliamente utilizada en ASR moderno por su equilibrio entre precisión y eficiencia. El Conformer captura dependencias locales y globales mediante convoluciones y atención, mientras que el RNNT permite decodificación en streaming sin necesidad de atención completa sobre el audio. No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens de audio procesados ni el uso de técnicas como RLHF o DPO, ya que la model card del autor solo indica que se trata de una exportación de pesos sin modificaciones.

La exportación a GGUF realizada por loom-ai-org no altera los pesos, sino que los empaqueta junto con la estructura del grafo y el tokenizador en un único archivo. Esto permite que el motor loom.cpp ejecute el modelo sin dependencias externas adicionales, y que el script embebido documente todos los argumentos configurables para la inferencia.

## Capacidades

- Reconocimiento automático del habla (ASR) para ruso e inglés.
- Generación de transcripciones con marcas temporales por segmento (inicio, fin y texto).
- Procesamiento de audio largo mediante ventanas automáticas, con reanudación en el punto de cierre del segmento anterior en lugar de un corte fijo.
- Entrada de audio en formato mono flotante a 16 kHz.
- Inferencia tanto en CPU como en GPU gracias al formato GGUF y al motor loom.cpp.
- Integración sencilla mediante la API de alto nivel `model.speech2text.infer()` en loom-py.
- Acceso a parámetros avanzados a través del driver embebido en el GGUF (`model.driver_source`).

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones largas (horas) dividiéndolas en ventanas automáticas y emitiendo timestamps, lo que permite generar actas con referencias temporales precisas.
- Subtitulado automático de vídeos: al proporcionar marcas de inicio y fin por segmento, es posible sincronizar subtítulos en ruso o inglés sin postprocesado adicional.
- Asistentes de voz en entornos multilingües: al soportar ruso e inglés, puede integrarse en sistemas de atención al cliente o asistentes personales que requieran transcripción en ambos idiomas.
- Análisis de llamadas de centro de contacto: la capacidad de procesar audio en streaming y con baja latencia permite transcribir conversaciones en tiempo real para análisis de sentimiento o cumplimiento normativo.
- Archivado y búsqueda de contenido audiovisual: la transcripción con timestamps facilita la indexación y búsqueda por palabras clave en archivos de audio o vídeo.
- Herramientas de accesibilidad: puede servir como base para sistemas de subtitulado en directo o transcripción para personas con discapacidad auditiva, dado su tamaño reducido y despliegue ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como WER (Word Error Rate), MMLU, HumanEval u otras comparativas. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- El modelo tiene 223M parámetros, lo que en FP32 ocuparía aproximadamente 892 MB, en FP16 unos 446 MB y en int8 unos 223 MB. El archivo GGUF del repositorio pesa 2,7 GB, lo que sugiere una cuantización a 8 bits o menor, aunque no se especifica.
- VRAM estimada: para FP16, unos 500 MB; para int8, unos 300 MB. Esto lo hace ejecutable en GPUs consumer como NVIDIA GTX 1060 (6 GB) o superiores, y en muchas iGPUs modernas.
- Puede ejecutarse en CPU sin problema, gracias al formato GGUF y al motor loom.cpp optimizado para este tipo de modelos.
- Opciones de despliegue: loom-py (Python), loom.cpp (C++), y posiblemente integración con otros frameworks que soporten GGUF, aunque no se mencionan.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. GigaAM-v3 es un modelo propietario de Sber, y no se han listado alternativas equivalentes en la misma categoría (ASR ruso/inglés con arquitectura RNNT). Se recomienda consultar el modelo base `ai-sage/GigaAM-v3` para posibles comparaciones con otros sistemas ASR.

## Limitaciones y advertencias

- Solo soporta ruso e inglés; no cubre otros idiomas.
- La calidad de transcripción puede degradarse con acentos no nativos, ruido de fondo o audio de baja calidad, aunque no se han publicado evaluaciones específicas.
- Riesgo de alucinación en segmentos de audio ininteligible, común en sistemas ASR.
- El formato GGUF es específico del ecosistema loom.cpp; no es directamente compatible con otros motores como llama.cpp o vLLM sin conversión adicional.
- La licencia MIT permite uso comercial, pero se debe verificar que el modelo base `ai-sage/GigaAM-v3` también la tenga (así se indica en la model card).
- No se proporcionan garantías de rendimiento en producción; se recomienda validar con datos propios antes de desplegar.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/loom-ai-org/gigaam-v3-rnnt-loom
- Modelo base original: https://huggingface.co/ai-sage/GigaAM-v3
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Librería loom-py: https://github.com/loom-ai-org/loom-py
- Herramienta loom-exporter: https://github.com/loom-ai-org/loom-exporter
