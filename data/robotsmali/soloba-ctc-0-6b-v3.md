# RobotsMali/soloba-ctc-0.6b-v3

## Resumen

Soloba-CTC-0.6B-v3 es un modelo de reconocimiento automático del habla (ASR) desarrollado por RobotsMali, una iniciativa que busca crear recursos de IA para lenguas africanas de baja representación. Este modelo está especializado en la transcripción de audio en bambara (bm), una lengua mandé hablada principalmente en Malí. Se trata de un fine-tuning de la versión v2 del mismo modelo, entrenado sobre el subconjunto revisado por humanos del dataset Kunkado, que contiene aproximadamente 40 horas de habla transcrita en bambara.

El modelo utiliza una arquitectura FastConformer con decodificador convolucional y función de pérdida CTC (Connectionist Temporal Classification). Con 0.6 mil millones de parámetros, está diseñado para ser relativamente ligero y ejecutable en hardware de gama media. Su relevancia radica en abordar la escasez de sistemas ASR funcionales para lenguas con pocos recursos digitales, ofreciendo una base para aplicaciones de transcripción, subtitulado y accesibilidad en bambara. El modelo se distribuye bajo licencia CC-BY-4.0 y se publica como parte de un esfuerzo de investigación en curso, con advertencias explícitas sobre su generalización limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + decoder convolucional con CTC Loss |
| Parametros totales | 0.6B (600 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio de duración variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (checkpoint .nemo) |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer, una versión optimizada del Conformer que incorpora downsampling convolucional depthwise-separable de 8x, lo que reduce el coste computacional manteniendo la capacidad de modelado de dependencias locales y globales. El decodificador es una capa convolucional que produce las probabilidades de los caracteres, y el entrenamiento se realiza con la pérdida CTC, que no requiere alineamiento temporal explícito entre audio y texto.

El fine-tuning se realizó con NVIDIA NeMo durante 39.000 pasos, con un tamaño de lote de 32, partiendo del checkpoint de `soloba-ctc-0.6b-v2`. El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de Kunkado, y el texto se normalizó previamente con la librería `bambara-normalizer`, que estandariza números, elimina puntuación y etiquetas. El modelo no genera mayúsculas ni puntuación de forma consistente, y tampoco produce etiquetas de eventos acústicos presentes en el dataset original.

## Capacidades

- Transcripción de audio a texto en bambara: acepta archivos de audio mono (WAV) y los remuestrea internamente a 16 kHz antes de la inferencia.
- Reconocimiento de habla continua: puede transcribir frases y párrafos completos, aunque con errores en condiciones de habla no estándar.
- Inferencia con NeMo: se carga mediante `ASRModel.from_pretrained` y se transcribe con el método `transcribe`.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente de ASR, sin capacidades de lenguaje general.
- Multilingüismo: limitado exclusivamente al bambara; no hay evidencia de transferencia a otras lenguas.
- Sin capitalización ni puntuación: la salida es texto plano en minúsculas, sin signos de puntuación.

## Casos de uso

- Transcripción de reuniones y entrevistas en bambara: el modelo puede convertir grabaciones de audio en texto para actas, análisis cualitativo o documentación, siempre que la calidad del audio sea razonable y el habla sea clara.
- Subtitulado automático de vídeos en bambara: integrado en un pipeline de postproducción, permite generar subtítulos para contenido audiovisual dirigido a hablantes de bambara, aunque requerirá revisión manual debido al WER.
- Archivo y búsqueda de contenido oral: bibliotecas digitales o emisoras de radio pueden indexar sus grabaciones históricas transcribiéndolas, facilitando la búsqueda por palabras clave.
- Asistencia a la accesibilidad: personas con discapacidad auditiva pueden beneficiarse de transcripciones en tiempo real o diferido de contenido hablado en bambara.
- Investigación lingüística: el modelo sirve como herramienta para corpus orales, permitiendo a lingüistas transcribir automáticamente grabaciones de campo y acelerar el análisis fonético o morfológico.
- Desarrollo de asistentes de voz en bambara: aunque el modelo solo produce texto, puede integrarse como módulo de ASR en un sistema mayor que incluya comprensión del lenguaje y síntesis de voz.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Benchmark | Conjunto de test | WER (%) ↓ | CER (%) ↓ |
|---|---|---|---|
| Kunkado | RobotsMali/kunkado (test) | 38.87 | 21.65 |
| Nyana Eval | RobotsMali/nyana-eval (test) | 38.69 | 18.92 |

Estos valores indican que aproximadamente 4 de cada 10 palabras se transcriben con error, lo que sitúa al modelo en un rango de utilidad limitada para uso directo sin postprocesado. No se han publicado comparaciones con otros sistemas ASR para bambara en la información disponible.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este modelo. Al tratarse de un modelo de 0.6B parámetros, es razonable esperar que pueda ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, pero no hay datos confirmados. El formato NeMo está optimizado para el ecosistema NVIDIA, por lo que se recomienda una GPU NVIDIA con soporte CUDA. Las opciones de despliegue incluyen el uso directo con NeMo, o la conversión a otros formatos (por ejemplo, ONNX o TensorRT) para entornos de producción, aunque no se documentan en la model card. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR comparables para bambara en la documentación proporcionada. El propio modelo es parte de una serie (v1, v2, v3) y no se ofrecen comparativas con alternativas externas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no generaliza bien en todas las condiciones de habla ni en todos los dialectos del bambara, según advierte el propio autor.
- La salida no incluye mayúsculas ni puntuación, lo que puede dificultar la legibilidad en aplicaciones directas.
- No genera etiquetas de eventos acústicos (como risas, ruidos o solapamientos) presentes en el dataset Kunkado.
- El WER es alto (≈38-39%), por lo que la transcripción automática requiere revisión humana para usos profesionales.
- Es un modelo de investigación en desarrollo; se esperan mejoras en versiones futuras, pero no hay garantía de estabilidad.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo se publica "tal cual" sin garantías de rendimiento.
- La compatibilidad con versiones recientes de NeMo (2.7.x) puede fallar; se documenta un workaround para cargar el checkpoint con NeMo 2.5.0.
- Solo soporta bambara; no hay capacidades multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloba-ctc-0.6b-v3
- Dataset Kunkado: https://huggingface.co/datasets/RobotsMali/kunkado
- Repositorio de fine-tuning: https://github.com/RobotsMali-AI/bambara-asr/
- Normalizador de bambara: https://pypi.org/project/bambara-normalizer/
- Issue de compatibilidad con NeMo: https://github.com/NVIDIA-NeMo/Speech/issues/15658
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
