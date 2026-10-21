# Melazeetek/dsn-2026-lid-candidate-d

## Resumen

`Melazeetek/dsn-2026-lid-candidate-d` es un modelo de clasificación de audio para identificación de idioma hablado (spoken language identification, LID), obtenido mediante fine-tuning de `facebook/wav2vec2-base` y publicado con motivo de la competición DSN 2026. El repositorio lo firma el usuario Melazeetek y contiene únicamente pesos en formato safetensors (0,4 GB) con 94.571.917 parámetros, un volumen coherente con la arquitectura wav2vec2-base de la que parte. La licencia es Apache 2.0.

El modelo resuelve una tarea acotada: dada una señal de audio, asignar una etiqueta de idioma dentro de un conjunto cerrado. La model card lo describe como un clasificador para 13 idiomas nigerianos, mientras que las etiquetas del repositorio declaran tres idiomas concretos (`yo` yoruba, `ig` igbo, `ha` hausa) más `multilingual`. Esa discrepancia entre "13 idiomas" y tres etiquetas explícitas es el dato más relevante para cualquiera que evalúe el modelo, porque no se detalla la lista completa de clases ni la correspondencia entre etiquetas y cabecera de clasificación.

Su interés ahora es acotado y experimental: se trata de un candidato de competición, sin descargas ni valoraciones, sin métricas publicadas y con una model card de dos líneas. Resulta útil como punto de partida para LID de lenguas nigerianas de bajos recursos y como referencia de fine-tuning de wav2vec2 sobre audio africano, pero no hay evidencia publicada que permita recomendarlo para producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder transformer sobre extractor convolucional de características), fine-tuning de `facebook/wav2vec2-base` para clasificación de audio |
| Parámetros totales | 94.571.917 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; en la configuración estándar de wav2vec2-base el encoder admite 512 marcos temporales, equivalentes a ~10 s de audio a 16 kHz |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors en el formato original; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | yoruba (`yo`), igbo (`ig`), hausa (`ha`) y `multilingual` según las etiquetas; la model card afirma 13 idiomas nigerianos sin enumerarlos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | audio-classification |
| Muestreo de entrada esperado | 16 kHz (valor estándar de wav2vec2-base; no se explicita en la model card) |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-base`, un encoder compuesto por un extractor convolucional de características que convierte la forma de onda cruda en una secuencia de representaciones latentes cada 20 ms, seguido de un encoder transformer que modela el contexto temporal. Sobre esa base, el autor ha sustituido la cabeza de modelado auto-supervisado por una cabeza de clasificación de secuencia para predecir la etiqueta de idioma, que es el procedimiento habitual en LID con wav2vec2. Los 94,57 M de parámetros publicados coinciden con el tamaño esperado de wav2vec2-base, lo que sugiere que no se ha ampliado el encoder.

No se documenta nada sobre el entrenamiento: ni el número de horas de audio, ni la composición del corpus, ni si hubo aumento de datos, ni la estrategia de congelación de capas, ni hiperparámetros, ni si se aplicó alguna forma de ajuste fino con datos etiquetados de las 13 lenguas mencionadas. Tampoco se describe el esquema de evaluación, más allá de la referencia genérica al "protocolo oficial de evaluación de la competición DSN 2026". No consta que se hayan aplicado técnicas de RLHF o DPO, algo por otra parte esperable en un clasificador discriminativo de audio.

## Capacidades

- Clasificación de idioma hablado sobre audio: devuelve una etiqueta de idioma dentro del conjunto cerrado de clases del modelo.
- Cobertura declarada de lenguas nigerianas: yoruba, igbo y hausa de forma explícita en las etiquetas; hasta 13 lenguas según el texto de la model card (lista no publicada).
- Funcionamiento con audio en bruto, sin necesidad de transcripción previa ni de pipeline ASR intermedio.
- Etiqueta `multilingual` en los metadatos, lo que sugiere que el modelo puede haberse entrenado con material multilingüe o que admite entradas con mezcla de lenguas, aunque no se especifica el comportamiento esperado en ese caso.
- No es un modelo generativo: no produce texto, no razona, no escribe código, no hace matemáticas y no tiene visión.
- No soporta tool calling, function calling ni uso como agente; su salida es una distribución de probabilidad sobre clases de idioma.
- No dispone de modo "thinking", ni de capacidad de audio-texto, ni de salida en streaming documentada.

## Casos de uso

- Enrutamiento automático en centros de atención telefónica: clasificar la lengua del interlocutor en los primeros segundos de llamada para dirigirla a un agente o a un flujo IVR en yoruba, igbo o hausa, con la ventaja de que el modelo consume audio en bruto y puede ejecutarse en CPU.
- Preetiquetado de corpus para investigación lingüística: procesar archivos de campo y separar automáticamente el material por lengua antes de la transcripción manual, reduciendo el coste de anotación en proyectos de lenguas de bajos recursos.
- Filtrado y curación de datasets de voz: descartar grabaciones que no correspondan al idioma objetivo antes de entrenar un sistema ASR o TTS, usando el clasificador como etapa de control de calidad.
- Moderación y cumplimiento en plataformas de contenido: detectar el idioma de fragmentos de audio subidos por usuarios para aplicar políticas de idioma, subtitulado o moderación específicas por región.
- Segmentación de archivos de radio y podcast multilingües: localizar tramos en yoruba, igbo o hausa dentro de emisiones que alternan lenguas, apoyándose en ventanas de audio cortas y en un modelo de 95 M de parámetros que se puede ejecutar en lote.
- Investigación comparativa en LID: servir como candidato de referencia (con 0 descargas y sin métricas) para reproducir el protocolo DSN 2026 y comparar fine-tunings de wav2vec2-base sobre lenguas nigerianas frente a modelos multilingües de mayor tamaño.
- Prototipado en dispositivos con recursos limitados: al ocupar 0,4 GB en safetensors y admitir cuantización a int8, es viable en un portátil o en un dispositivo edge para demos de identificación de lengua sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo fue "evaluado bajo el protocolo oficial de evaluación de DSN 2026", pero no incluye accuracy, F1, tasas de confusión por idioma ni comparación con ninguna línea base. Tampoco hay métricas en las etiquetas del repositorio ni en los resultados de búsqueda consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en fp32 (94,57 M de parámetros), ~0,2 GB en fp16 y por debajo de 0,15 GB en int8, sin contar activaciones ni buffers de audio.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no necesita A100 ni H100. Una RTX 4090, una RTX 3090 o incluso una GTX 1650 lo ejecutan con holgura y permiten procesar lotes grandes de audio.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de VRAM, y también en CPU, donde la inferencia sobre ventanas de pocos segundos es viable en tiempo real o cerca de él.
- Opciones de despliegue: `transformers` con `AutoModelForAudioClassification` y `Wav2Vec2FeatureExtractor`; exportación a ONNX Runtime para inferencia en CPU; TorchScript; integración como etapa previa en pipelines de `torchaudio`. No aplica vLLM ni TGI, al no ser un modelo generativo; llama.cpp y Ollama no soportan esta arquitectura de clasificación de audio de forma estándar.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de RTF (real-time factor) para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Melazeetek/dsn-2026-lid-candidate-d` | 94,57 M | 3 declarados (`yo`, `ig`, `ha`), hasta 13 según la model card | ~10 s por ventana (configuración wav2vec2-base) | Apache 2.0 | HuggingFace, 0 descargas, sin métricas |
| `facebook/mms-lid-126` | ~315 M (aproximado, no verificado en esta búsqueda) | 126 idiomas, incluye varias lenguas africanas | ventanas cortas de audio a 16 kHz | CC-BY-NC 4.0 (no comercial) | Ampliamente utilizado, con documentación y métricas publicadas por Meta |
| `speechbrain/lang-id-voxlingua107-ecapa` | ~20 M (aproximado, no verificado en esta búsqueda) | 107 idiomas (VoxLingua107) | ventanas de audio, arquitectura ECAPA-TDNN | Apache 2.0 | Disponible en HuggingFace, integrado en SpeechBrain |
| `TalTechNLP/voxlingua107-xls-r-300m-wav2vec` | ~300 M (aproximado, no verificado en esta búsqueda) | 107 idiomas | ventanas de audio, XLS-R wav2vec2 | Apache 2.0 | Disponible en HuggingFace con métricas publicadas |

El modelo aquí descrito es el más pequeño y el más especializado en lenguas nigerianas, pero también el único de la comparativa sin métricas ni documentación de entrenamiento. Para producción multilingüe general, las alternativas con licencia permisiva y evaluación publicada ofrecen más garantías; para yoruba, igbo y hausa en concreto, no hay datos que permitan afirmar superioridad frente a un modelo multilingüe grande.

## Limitaciones y advertencias

- Inconsistencia documental: la model card afirma 13 idiomas nigerianos, pero las etiquetas solo declaran `yo`, `ig`, `ha` y `multilingual`. No se publica la lista de clases ni el orden de las etiquetas de salida, lo que impide mapear los índices del clasificador sin inspeccionar `config.json`.
- Ausencia total de métricas: no hay accuracy, F1, matriz de confusión ni evaluación por idioma. Cualquier uso en producción requiere una validación propia con datos representativos.
- Riesgo de confusión entre lenguas cercanas: yoruba, igbo y hausa pertenecen a familias distintas, pero el modelo puede confundirlas con otras lenguas nigerianas no declaradas o con variedades con code-switching, especialmente en audio ruidoso o de corta duración.
- Sensibilidad a la calidad del audio: no se documenta el comportamiento con ruido de fondo, canales telefónicos, microfonía deficiente o solapamiento de hablantes. Los modelos wav2vec2-base tienden a degradarse en esas condiciones sin aumento de datos específico.
- Limitación de duración: la ventana efectiva del encoder es de unos 10 s; audios más largos deben trocearse y agregarse, algo que la model card no explica.
- Sesgos previsibles: al entrenarse sobre un corpus no descrito, puede sobrerrepresentar determinados registros, géneros, acentos o regiones, y no hay ninguna auditoría de sesgo publicada. La precisión por género y por variedad dialectal es desconocida.
- Alucinación en sentido estricto no aplica (es un clasificador), pero sí existe el riesgo de asignar una etiqueta con alta confianza a audio que no contiene habla o que pertenece a un idioma fuera del conjunto.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo base `facebook/wav2vec2-base` también es Apache 2.0, de modo que no se detectan restricciones adicionales. Aun así, conviene verificar los términos del corpus de entrenamiento, que no se especifica.
- Madurez: 0 descargas, 0 valoraciones, repositorio creado y actualizado el mismo día. Es un artefacto de competición, no un modelo mantenido.
- Caveat de nombre: el sufijo "candidate-d" indica que es una candidatura entre varias; puede existir una versión posterior o un modelo finalmente seleccionado que no está enlazado desde esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Melazeetek/dsn-2026-lid-candidate-d
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Paper de wav2vec 2.0 (Baevski et al., 2020): no enlazado en la información proporcionada; referencia habitual https://arxiv.org/abs/2006.11477
- Repositorio o demo de la competición DSN 2026: no disponible
- Paper, blog o notas técnicas del autor: no disponible
- No se han encontrado enlaces adicionales relevantes en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo ni con identificación de idioma.
