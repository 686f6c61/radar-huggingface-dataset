# juice500/w2v2-18-phonemodel

## Resumen

w2v2-18-phonemodel es un adaptador de segmentación y reconocimiento de fonemas construido sobre las representaciones congeladas de facebook/wav2vec2-large-lv60, concretamente sobre la capa 18 del encoder. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la citación del paper) y aplica una técnica denominada SPAM (S3M-based Phonological Activation Mapping), que proyecta cada frame del modelo auto-supervisado a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, silabicidad, etc.). El resultado es una representación interpretable que dos cabezas ligeras usan para segmentar y etiquetar fonemas.

El modelo no es un sistema ASR completo: no produce texto, sino secuencias de fonemas con marcas temporales. Resuelve el problema de obtener alineamientos fonéticos y transcripciones a nivel de fonema a partir de un encoder de habla congelado, sin reentrenar los 300 millones de parámetros de wav2vec 2.0-large. Es relevante porque demuestra que las capas intermedias de un S3M contienen información fonética explotable y porque ofrece una vía ligera (solo se entrena el adaptador SPAM y las cabezas) para tareas de fonética computacional, análisis de pronunciación y estudios de fonología.

Este checkpoint concreto es un punto de la rejilla encoder × capa del paper (figura 2). El propio autor indica que el mejor modelo de esa rejilla es juice500/wavlm-24-phonemodel, por lo que este w2v2-18 debe considerarse una variante de referencia o comparación, no la opción principal. Está entrenado y evaluado sobre TIMIT y soporta únicamente inglés, aunque permite restringir el vocabulario de salida a inventarios PHOIBLE de otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder wav2vec 2.0-large congelado (transformer), capa 18, entrada a 16 kHz |
| Parametros totales | No disponible (el encoder base wav2vec 2.0-large tiene ~300 M; el adaptador y las cabezas no se cuantifican en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio por frames; la ventana efectiva depende de la implementacion de phonespam) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (entrenamiento y evaluacion); permite vocabularios PHOIBLE de otras lenguas en inferencia |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0) |
| Formato de pesos | No disponible (repo de 0.0 GB; se carga via `PhoneModel.from_pretrained` de la libreria phonespam) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas sobre un encoder congelado. Primero, wav2vec 2.0-large procesa audio a 16 kHz y se extraen las activaciones de la capa 18. Después, SPAM mapea cada frame a un vector de 43 dimensiones en [0, 1] correspondiente a rasgos fonológicos del inventario de PHOIBLE (nombres como "silence+", "syl+", "son+"). Sobre esa representación interpretable actúan dos cabezas: una de segmentación (fronteras entre fonemas) y otra de reconocimiento (etiqueta fonética de cada segmento). El encoder no se ajusta; solo se entrenan el mapeo SPAM y las cabezas.

El entrenamiento se realizó sobre el dataset timit-asr/timit_asr, el corpus TIMIT estándar para fonética del inglés. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este tipo de tarea). La innovación técnica destacable es precisamente SPAM: convertir una representación opaca del encoder en un espacio de rasgos fonológicos con semántica lingüística, lo que además permite inspeccionar qué rasgos activa el modelo frame a frame mediante `model.spam()`.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético.
- Representación intermedia interpretable: 43 activaciones de rasgos fonológicos por frame, accesibles con `model.spam()` y nombres en `spam.featnames`.
- Restricción de vocabulario por idioma: `vocab_for_language("deu")` limita la salida al inventario PHOIBLE de una lengua dada.
- Procesamiento de audio a 16 kHz con inferencia en CPU o GPU (`device="cuda"`).
- No soporta generación de texto, tool calling, agentes, visión ni audio más allá del análisis fonético. Es una herramienta de fonética, no un LLM.

## Casos de uso

- Análisis de pronunciación en aprendizaje de idiomas: obtener el alineamiento de fonemas de una grabación y compararlo con la secuencia esperada para detectar sustituciones u omisiones concretas.
- Investigación fonética y fonológica: extraer estadísticas de duración de fonemas y rasgos activados (nasalidad, sonoridad) sobre corpus de habla para estudios empíricos.
- Construcción de léxicos de pronunciación: generar transcripciones fonéticas automáticas para alimentar sistemas TTS o ASR que requieran diccionarios.
- Análisis de habla patológica: cuantificar errores de articulación a nivel de fonema en muestras clínicas de habla inglesa.
- Evaluación de S3M: usar este checkpoint como punto de comparación en la rejilla encoder × capa para estudiar qué capas codifican mejor la información fonética.
- Prototipado rápido con vocabularios restringidos: forzar el inventario PHOIBLE de otra lengua para explorar el comportamiento del modelo fuera del inglés (con las cautelas del caso).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la figura 2 del paper (arXiv 2607.09020) para la comparación en la rejilla encoder × capa, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El encoder base wav2vec 2.0-large (~300 M de parámetros) ocupa aproximadamente 1,2 GB en fp32; el adaptador y las cabezas añaden una cantidad no cuantificada.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM debería bastar para el encoder congelado; no se especifican modelos concretos (A100, H100, RTX 4090) en la información.
- GPU de consumo: previsiblemente cabe en GPUs de consumo modernas (RTX 3060 en adelante), aunque el dato no está confirmado por el autor.
- Despliegue: la vía oficial es la librería `phonespam` (`pip install phonespam`), con soporte de CPU y CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| w2v2-18-phonemodel | wav2vec2-large-lv60 | 18 | Segmentacion y reconocimiento de fonemas | MIT | Este checkpoint; variante de referencia en la rejilla |
| wavlm-24-phonemodel | WavLM (segun nombre) | 24 | Segmentacion y reconocimiento de fonemas | No disponible en la informacion | El propio autor lo señala como el mejor modelo de la rejilla |
| wav2vec2-large-lv60 (base) | - | - | Representaciones de habla auto-supervisadas | No disponible en la informacion | No realiza segmentacion ni reconocimiento fonetico por si mismo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado solo en inglés (TIMIT); el uso con otras lenguas mediante `vocab_for_language` es una extensión no validada por el autor.
- No es un sistema ASR: no genera texto ni transcripciones ortográficas.
- Es un punto concreto de la rejilla del paper y no el mejor modelo según el propio autor (que recomienda wavlm-24-phonemodel).
- El repo tiene 0.0 GB y 0 descargas, lo que sugiere pesos no alojados en el repositorio o un paquete mínimo; conviene verificar la disponibilidad real de los pesos antes de integrarlo.
- `vocab_for_language` descarga PHOIBLE 2.0 en runtime bajo licencia CC BY-SA 3.0, distinta de la MIT del modelo; revisar obligaciones de atribución y share-alike si se redistribuye.
- No se documentan sesgos, tasas de alucinación ni robustez ante ruido, acentos o habla espontánea; TIMIT es habla leída y controlada, por lo que el rendimiento en dominios reales puede degradarse.
- Sin datos de benchmarks ni de latencia, la idoneidad para producción no está cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-18-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Paper (SLT 2026): https://arxiv.org/abs/2607.09020
- Codigo: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
