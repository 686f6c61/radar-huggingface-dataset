# japathak/tirona-parakeet-v2-onnx-int8

## Resumen

El modelo `japathak/tirona-parakeet-v2-onnx-int8` es un espejo sin modificar del repositorio `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8`, publicado por el usuario `japathak` para que la aplicación Tirona no descargue unos 630 MB desde un repositorio que no controla. El contenido es idéntico byte a byte al original, y a su vez deriva del modelo Parakeet TDT 0.6B v2 de NVIDIA, un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura FastConformer-TDT. El modelo se distribuye en formato ONNX con cuantización int8, lo que lo hace adecuado para inferencia eficiente en CPU y entornos con recursos limitados. La licencia es CC BY 4.0, lo que permite uso comercial con atribución.

Este modelo resuelve el problema del reconocimiento de voz en tiempo real o por lotes, ofreciendo una alternativa ligera y portable frente a modelos más pesados. Su relevancia actual radica en la creciente demanda de ASR local, sin dependencia de servicios en la nube, y en la compatibilidad con el ecosistema ONNX Runtime y sherpa-onnx. El repositorio tiene un tamaño de 0.7 GB y fue creado en agosto de 2026, aunque no se especifican idiomas soportados ni detalles adicionales en la ficha original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Parakeet TDT 0.6B v2 de NVIDIA) |
| Parametros totales | no disponible (se infiere 0.6B por el nombre, pero no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | no disponible (se espera multilingue, pero no se especifica) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (archivos .onnx, incluye encoder, decoder y joint) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del Parakeet TDT 0.6B v2 de NVIDIA, que emplea una arquitectura FastConformer-TDT (Transducer with Dynamic chunk Training). Esta arquitectura combina un encoder basado en FastConformer, un decoder y una capa de joint, optimizada para reconocimiento de voz con baja latencia. El entrenamiento original fue realizado por NVIDIA, aunque no se proporcionan detalles sobre el dataset, el número de tokens o el proceso de alineación. La versión ONNX int8 se generó mediante cuantización posterior al entrenamiento, probablemente con herramientas de NVIDIA o sherpa-onnx, para reducir el tamaño y acelerar la inferencia en CPU. No se mencionan técnicas como RLHF o DPO, ya que es un modelo de ASR, no de lenguaje generativo.

## Capacidades

- Reconocimiento automático de voz (ASR) a partir de audio, transcribiendo habla a texto.
- Inferencia en tiempo real o por lotes gracias a la arquitectura TDT (chunked attention) y la cuantización int8.
- Compatible con el runtime ONNX y con el framework sherpa-onnx, que facilita su integración en aplicaciones de streaming.
- No se especifican capacidades adicionales como traducción, diarización o identificación de hablante en la información disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar audio grabado y generar transcripciones textuales, integrándose en pipelines de análisis posterior.
- Asistentes de voz locales: al ser ligero y en formato ONNX, puede ejecutarse en dispositivos edge (Raspberry Pi, portátiles) sin conexión a internet.
- Subtitulación automática de vídeos: se puede combinar con herramientas de corte de audio para generar subtítulos en tiempo real o de forma diferida.
- Comandos de voz en aplicaciones de productividad: permite dictar texto o ejecutar acciones mediante voz en aplicaciones de escritorio o móviles.
- Accesibilidad: facilita la interacción con ordenadores a personas con movilidad reducida, mediante entrada de voz.
- Investigación en ASR: sirve como modelo de referencia para comparar arquitecturas o técnicas de cuantización en tareas de reconocimiento de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de WER (Word Error Rate) ni comparaciones con otros modelos. Se recomienda consultar la documentación del modelo original de NVIDIA o del repositorio `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8` para obtener datos de rendimiento.

## Requisitos de hardware

- Al ser un modelo ONNX int8 de aproximadamente 0.7 GB, puede ejecutarse en CPU sin necesidad de GPU dedicada.
- Se estima que la VRAM necesaria es inferior a 1 GB si se usa GPU, aunque no se especifica.
- Es adecuado para dispositivos con recursos limitados, como Raspberry Pi 4/5, ordenadores portátiles antiguos o sistemas embebidos.
- Para despliegue, se recomienda usar ONNX Runtime, sherpa-onnx (C++/Python) o llama.cpp (aunque este último no es específico para ONNX).
- La latencia dependerá del hardware; en una CPU moderna se espera un factor tiempo real inferior a 1 (procesa más rápido que la duración del audio), pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de ASR (como Whisper, Wav2Vec2 o Kaldi) en términos de parámetros, contexto o rendimiento. El modelo se presenta como una opción ligera y portable, pero sin datos objetivos de comparación.

## Limitaciones y advertencias

- Es un espejo sin modificaciones; cualquier problema del modelo original se mantiene en esta versión.
- No se especifican los idiomas soportados, por lo que su uso en idiomas distintos al inglés (u otros incluidos en el entrenamiento original) puede dar resultados subóptimos.
- La cuantización int8 puede degradar ligeramente la precisión en comparación con el modelo en fp32, aunque no se cuantifica en la información disponible.
- La licencia CC BY 4.0 exige atribución a NVIDIA en cualquier uso o redistribución.
- No se proporcionan garantías sobre el rendimiento en producción; se recomienda validar el modelo con datos propios antes de desplegarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/japathak/tirona-parakeet-v2-onnx-int8
- Repositorio original (espejo): https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
- Modelo original de NVIDIA (referencia): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2 (no confirmado en la búsqueda, pero es el origen declarado)
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
