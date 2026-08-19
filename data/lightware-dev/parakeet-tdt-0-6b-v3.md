# lightware-dev/parakeet-tdt-0.6b-v3

## Resumen

El modelo `lightware-dev/parakeet-tdt-0.6b-v3` es una redistribución en media precisión (bfloat16 y float16) del modelo de reconocimiento automático de voz (ASR) `nvidia/parakeet-tdt-0.6b-v3`, desarrollado por NVIDIA. Este modelo base es un sistema de transcripción de voz de 600 millones de parámetros que emplea una arquitectura FastConformer con decodificador Transducer (TDT), y está diseñado para transcribir audio en 25 idiomas europeos con puntuación, capitalización y predicción de marcas de tiempo a nivel de palabra. La versión aquí presentada no modifica los pesos del modelo original, sino que los convierte de precisión fp32 a bf16 o fp16, reduciendo el tamaño de los archivos de 2,5 GB a 1,25 GB por checkpoint y acelerando la carga en GPU. Esta conversión es relevante para entornos de producción donde se busca reducir el consumo de memoria y mejorar la latencia de arranque sin una pérdida significativa de precisión, como demuestran las evaluaciones incluidas en la documentación del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + Transducer (TDT) |
| Parametros totales | 627 090 582 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp16 |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | .nemo (archivos NeMo) |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-tdt-0.6b-v3` emplea una arquitectura FastConformer, una variante eficiente del Conformer que reduce la complejidad computacional mediante un mecanismo de atención con ventana local y proyecciones de baja dimensión. El decodificador es un Transducer con retardo (TDT), que permite la decodificación en flujo con predicción de marcas de tiempo a nivel de palabra. El modelo fue entrenado por NVIDIA sobre un corpus de voz en 25 idiomas europeos, aunque los detalles específicos del conjunto de datos (número de horas, composición, técnicas de aumento) no se detallan en la información disponible. La versión v3 es una actualización de la v2 que amplía el soporte de inglés a 24 idiomas adicionales. El repositorio `lightware-dev` no modifica la arquitectura ni los pesos; únicamente realiza una conversión de precisión de fp32 a bf16 o fp16, manteniendo intactas las claves y la estructura del modelo original.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos (incluidos español, inglés, francés, alemán, italiano, portugués, etc.).
- Generación de puntuación y capitalización de forma nativa en la transcripción.
- Predicción de marcas de tiempo a nivel de palabra, útil para subtitulado y alineación de audio.
- Decodificación en flujo (streaming) gracias a la arquitectura Transducer con retardo.
- Compatible con el framework NeMo de NVIDIA para inferencia y fine-tuning.
- No incluye capacidades de texto generativo, tool calling, agentes ni visión; es un modelo exclusivamente de reconocimiento de voz.

## Casos de uso

- Transcripción automática de reuniones y conferencias: el modelo puede procesar grabaciones de audio en múltiples idiomas europeos, generando texto con puntuación y marcas de tiempo que facilitan la búsqueda y el análisis posterior.
- Subtitulado de vídeos: gracias a la predicción de timestamps a nivel de palabra, es adecuado para generar subtítulos sincronizados en plataformas de vídeo, con soporte multilingüe.
- Asistentes de voz y sistemas de dictado: su baja latencia (factor tiempo real de 0.011 en GPU RTX 5090) permite su integración en aplicaciones de dictado en tiempo real, tanto en entornos de escritorio como en servidores.
- Análisis de llamadas de atención al cliente: la transcripción con puntuación y capitalización facilita el procesamiento posterior con modelos de NLP para extraer intenciones, sentimiento o cumplimiento normativo.
- Accesibilidad y ayuda a personas con discapacidad auditiva: puede convertir audio en texto en tiempo real para subtitulado en directo, con soporte para 25 idiomas europeos.
- Archivado y búsqueda de contenido audiovisual: la combinación de timestamps y transcripción permite indexar archivos de audio y vídeo para búsqueda por contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como WER en LibriSpeech o Common Voice) en la información disponible. Sin embargo, el repositorio incluye una evaluación comparativa entre las precisiones fp32, bf16 y fp16 sobre un conjunto de 208 clips de audio en inglés (25,8 minutos), con degradaciones de ruido y habla sintética. Los resultados, medidos con decodificación greedy y normalización de texto, son los siguientes:

| Precision | WER (todos los clips) | WER (habla real limpia) |
|---|---|---|
| fp32 | 2,96 % | 2,40 % |
| bf16 | 2,99 % | 2,40 % |
| fp16 | 2,96 % | 2,40 % |

Además, se reporta que fp16 y bf16 producen transcripciones idénticas en 207 de 208 clips, y que fp16 se aproxima a fp32 a nivel de activaciones unas 8 veces más que bf16 (error L2 relativo medio de 0,0052 frente a 0,0436). La evaluación es exclusivamente en inglés, por lo que el comportamiento en los otros 24 idiomas no está verificado.

## Requisitos de hardware

- Los checkpoints en bf16 y fp16 ocupan 1,25 GB cada uno (1,31 GB en VRAM), frente a los 2,5 GB del original fp32.
- La carga directa en GPU sin materializar fp32 reduce el pico de VRAM durante el arranque a aproximadamente 1,3 GB, y acelera el tiempo de carga de ~22 s a ~13 s.
- Se requiere una GPU con soporte CUDA. Para bf16 se necesita una GPU con compute capability 8.0 o superior (Ampere o más nueva, por ejemplo RTX 30xx, A100, RTX 40xx). Para fp16 es compatible con GPUs anteriores, como GTX 16-series, RTX 20-series y Tesla T4 (sm_75).
- Con 1,3 GB de pesos, el modelo cabe en GPUs de consumo con al menos 4 GB de VRAM, como RTX 3050 o RTX 3060.
- El throughput medido en una RTX 5090 muestra un factor tiempo real de 0,0118 para fp16 y 0,0133 para bf16, lo que indica que puede procesar audio más rápido que en tiempo real.
- Opciones de despliegue: el modelo se carga mediante NeMo (`nemo.collections.asr.ASRModel.restore_from`). No se mencionan otros frameworks como TensorRT u ONNX en la documentación, pero al ser un modelo NeMo estándar, es posible exportarlo a otros formatos si se dispone de las herramientas adecuadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos ASR de la misma categoría (por ejemplo, Whisper, Wav2Vec2 o modelos anteriores de Parakeet). El repositorio no proporciona resultados de benchmarks comparativos. Se puede señalar que el modelo base de NVIDIA es un ASR de 600M parámetros con soporte multilingüe y puntuación nativa, características que lo sitúan en una categoría similar a Whisper large-v3 (que tiene ~1.5B parámetros) o a modelos como MMS de Meta, pero no hay datos de rendimiento directos para comparar.

## Limitaciones y advertencias

- La evaluación de precisión incluida en el repositorio se realizó únicamente en inglés, por lo que el rendimiento en los otros 24 idiomas no está verificado y puede variar.
- El modelo es exclusivamente de reconocimiento de voz; no genera texto libre, no responde preguntas ni realiza tareas de razonamiento.
- Aunque no se observaron valores no finitos en las activaciones durante la evaluación, la conversión a fp16 reduce el rango de exponentes, lo que podría causar desbordamientos en casos extremos de audio muy alto o con condiciones acústicas inusuales. El autor señala que no se encontraron problemas en las pruebas realizadas, pero se recomienda validar en el dominio de aplicación.
- La licencia CC BY 4.0 permite uso comercial y modificación, pero requiere atribución al autor original. No hay restricciones de uso militar o de alto riesgo explícitas, pero se debe revisar la licencia completa.
- El modelo está pensado para audio muestreado a 16 kHz (típico en ASR), aunque no se especifica en la documentación. Es posible que frecuencias de muestreo diferentes requieran preprocesamiento.
- No se proporcionan instrucciones de fine-tuning en este repositorio; para adaptarlo a dominios específicos se debe consultar la documentación de NeMo y el modelo base de NVIDIA.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/lightware-dev/parakeet-tdt-0.6b-v3
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Colección Parakeet TDT 0.6B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- Repositorio de herramientas de evaluación (blurt): https://github.com/lightware-dev/blurt
- Página del autor en HuggingFace: https://huggingface.co/lightware-dev
