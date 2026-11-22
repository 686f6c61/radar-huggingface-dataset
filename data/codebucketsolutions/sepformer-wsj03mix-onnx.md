# codebucketsolutions/sepformer-wsj03mix-onnx

## Resumen

SepFormer WSJ0-3mix ONNX es una exportación a formato ONNX del modelo `speechbrain/sepformer-wsj03mix` de SpeechBrain, publicada por el usuario codebucketsolutions. El modelo original es un sistema de separación de habla para mezclas de tres hablantes, basado en la arquitectura SepFormer (Separation Transformer), y esta exportación permite ejecutarlo sin PyTorch mediante ONNX Runtime. Los pesos son idénticos a los del modelo original; no se ha realizado ningún ajuste fino ni modificación de los parámetros.

La relevancia de esta ficha radica en que el modelo original está pensado para el ecosistema SpeechBrain/PyTorch, lo que complica su despliegue en entornos de producción ligeros o en servidores sin dependencias de deep learning pesadas. Esta exportación ONNX (opset 17, float32) encapsula el encoder, la red de enmascaramiento y el decoder de `SepformerSeparation.separate_batch`, lo que permite integrar la separación de hablantes en pipelines basados en ONNX Runtime, con paridad numérica verificada frente a la implementación original.

El repositorio tiene un tamaño de 0,1 GB y contiene un único grafo (`sepformer.onnx`) junto con metadatos de exportación. La licencia es Apache-2.0, heredada del modelo original. No se han publicado datos de idiomas soportados ni resultados de benchmarks propios en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SepFormer (Separation Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio; entrada float32 `[1, T]` a 8 kHz, sin límite fijo pero con memoria creciente) |
| Tipos de cuantizacion | float32 (único formato incluido en el repositorio) |
| Idiomas soportados | no disponible (entrenado sobre habla leída en inglés de WSJ0) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, float32) |

## Arquitectura y entrenamiento

El modelo subyacente es SepFormer, un transformer diseñado para separación de fuentes de audio. La arquitectura completa (encoder, red de enmascaramiento y decoder) está contenida en el grafo ONNX exportado. El encoder procesa la señal de entrada en saltos (strides) de 8 muestras, y la salida tiene la forma `[1, 8 * ((T - 16) // 8) + 16, 3]`, es decir, tres pistas de audio separadas correspondientes a los tres hablantes. El modelo fue entrenado por el equipo de SpeechBrain sobre el conjunto WSJ0-3mix, compuesto por mezclas de habla leída del Wall Street Journal (WSJ0, LDC93S6A), con licencia del Linguistic Data Consortium y no redistribuible libremente.

El entrenamiento original utilizó una pérdida invariante a la escala (scale-invariant loss), lo que implica que el nivel absoluto de las pistas de salida es arbitrario y no debe interpretarse como una estimación de volumen. La exportación ONNX no introduce cambios en los pesos; el script `export_speechbrain_onnx.py` (disponible en el repositorio de bolo) generó el grafo y un fichero `speechbrain_onnx.json` con los SHA-256 de los checkpoints originales y del grafo. La paridad con la implementación en PyTorch (SpeechBrain 1.1.2, torch 2.15.0+cpu, ONNX Runtime 1.32.0) se verificó con ruido aleatorio y mezclas de voces de muestra, obteniendo diferencias absolutas máximas entre 1,41e-04 y 4,86e-03 y valores de SI-SNR de hasta 84,4 dB en el mejor caso.

## Capacidades

- Separación de habla para mezclas de tres hablantes simultáneos (three-speaker speech separation).
- Procesamiento de audio mono a 8 kHz en formato float32.
- Inferencia sin PyTorch mediante ONNX Runtime (opset 17).
- Salida de tres pistas de audio separadas con la misma longitud que la entrada (con padding de ceros si es necesario).
- Ejecución en CPU (la paridad se verificó en CPU con ONNX Runtime).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente de audio).
- No dispone de capacidades multilingües declaradas ni de modo thinking.
- No es un modelo de generación de texto, código, matemáticas ni visión.

## Casos de uso

- Transcripción de reuniones con múltiples participantes: el modelo separa las tres pistas de voz antes de pasarlas a un sistema ASR (reconocimiento automático del habla), lo que mejora la diarización y la precisión de la transcripción en entornos con solapamiento de habla.
- Análisis forense de audio: en grabaciones donde varias personas hablan a la vez, la separación permite aislar cada voz para su posterior identificación o análisis de contenido, siempre que la mezcla sea de hasta tres hablantes y la calidad lo permita.
- Preprocesado en pipelines de subtitulado automático: al separar las fuentes antes de la transcripción, se reducen los errores de ASR en conversaciones cruzadas, integrándose como paso previo en un pipeline basado en ONNX Runtime.
- Investigación en procesamiento de audio: sirve como referencia reproducible en ONNX para comparar implementaciones de SepFormer sin depender de PyTorch, facilitando experimentos en entornos con restricciones de dependencias.
- Despliegue en servidores ligeros o edge: al no requerir PyTorch, puede ejecutarse en entornos con ONNX Runtime y recursos limitados, procesando audio en ventanas para controlar el consumo de memoria.
- Evaluación de robustez de sistemas de separación: el repositorio incluye `parity.json` con métricas de paridad, útil para validar que una implementación propia reproduce los resultados del modelo original antes de integrarlo en producción.

## Benchmarks y rendimiento

El autor reporta métricas de paridad frente a la implementación en PyTorch, no benchmarks de calidad de separación propios. La model card original de SpeechBrain reporta 19,8 dB SI-SNRi y 20,0 dB SDRi en el conjunto de test WSJ0-3mix.

| Entrada | Diferencia absoluta máxima | SI-SNR mínimo de ONNX frente a PyTorch (por pista) |
|---|---|---|
| ruido, 4003 muestras | 2,73e-04 | 84,4 dB |
| ruido, 3008 muestras | 1,41e-04 | 80,2 dB |
| ruido, 24000 muestras | 7,72e-04 | 73,1 dB |
| ruido, 56005 muestras | 3,85e-03 | 65,3 dB |
| en-long+en-short+hi-short | 4,86e-03 | 66,7 dB |

No se han publicado resultados de benchmarks de calidad de separación específicos para esta exportación ONNX en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo es float32 y el repositorio ocupa 0,1 GB, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no se especifican; al ser un modelo pequeño y exportado a ONNX, puede ejecutarse en CPU y en GPUs consumer (por ejemplo, RTX 3060 o superiores) sin problema, aunque no hay datos oficiales de rendimiento en GPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de memoria libre, dado el tamaño del grafo.
- Opciones de despliegue: ONNX Runtime (verificado en CPU con la versión 1.32.0); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La memoria crece rápidamente con la longitud del audio (varios GB para un minuto de audio según la model card), por lo que se recomienda procesar grabaciones largas en ventanas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codebucketsolutions/sepformer-wsj03mix-onnx | no disponible | audio mono 8 kHz, `[1, T]` | paridad con PyTorch verificada; SI-SNRi 19,8 dB / SDRi 20,0 dB (original) | Apache-2.0 | ONNX en Hugging Face |
| speechbrain/sepformer-wsj03mix | no disponible | audio mono 8 kHz | SI-SNRi 19,8 dB / SDRi 20,0 dB en WSJ0-3mix | Apache-2.0 | PyTorch en Hugging Face |
| speechbrain/sepformer-wsj02mix | no disponible | audio mono 8 kHz | no disponible en la información proporcionada | Apache-2.0 | PyTorch en Hugging Face |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de otros sistemas de separación de habla en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado sobre habla leída en inglés de WSJ0; su rendimiento en otros idiomas o en habla espontánea no está garantizado y no se han publicado evaluaciones al respecto.
- La pérdida invariante a la escala implica que el nivel de las pistas de salida es arbitrario; no debe usarse como estimación de volumen.
- El consumo de memoria crece rápidamente con la longitud del audio (varios GB para un minuto), por lo que es necesario procesar en ventanas.
- Solo admite mezclas de hasta tres hablantes; no está diseñado para un número distinto de fuentes.
- Requiere entrada mono a 8 kHz; no se especifica soporte para otras frecuencias de muestreo.
- Riesgo de artefactos y alucinaciones de separación en mezclas con solapamiento severo o ruido de fondo, aunque no se documentan métricas específicas en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (WSJ0) tienen licencia del Linguistic Data Consortium y no son redistribuibles; esto puede afectar a la redistribución del modelo en determinados contextos.
- No es una release oficial de SpeechBrain; el autor lo indica explícitamente.
- No se han publicado datos de sesgos demográficos ni de rendimiento por género, edad o acento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/sepformer-wsj03mix-onnx
- Modelo base: https://huggingface.co/speechbrain/sepformer-wsj03mix
- Repositorio del servidor bolo (script de exportación): https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- Paper de SepFormer: no disponible en la información proporcionada.
