# juice500/hubert-24-phonemodel

## Resumen

`hubert-24-phonemodel` es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de `facebook/hubert-large-ll60k` (HuBERT-large). Lo desarrolla el autor `juice500` en el contexto del trabajo SPAM (S3M-based Phonological Activation Mapping), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo no genera texto libre: su tarea es mapear cada trama acústica a un vector de 43 activaciones fonológicas interpretables (sonoridad, nasalidad, estridencia, silencio, etc.) y, a partir de ellas, segmentar la señal de voz en fonemas y etiquetarlos.

La innovación principal es convertir la representación opaca de un modelo auto-supervisado de voz (S3M) en un espacio de rasgos fonológicos con semántica lingüística explícita. Esto permite segmentación y reconocimiento de fonemas sin necesidad de un decodificador acústico clásico ni de alineamientos forzados, y facilita restringir el inventario de fonemas a una lengua concreta mediante PHOIBLE. Este checkpoint concreto corresponde a un único punto de la rejilla encoder × capa del artículo: HuBERT-large, capa 24, entrada a 16 kHz.

Es relevante ahora porque ofrece una alternativa interpretable y ligera (adaptador sobre un encoder congelado) para tareas de fonética computacional, análisis de pronunciación y preprocesamiento de pipelines de voz, y porque su código (`phonespam`) expone una API de alto nivel (`transcribe`, `spam`) que devuelve segmentos contiguos con marcas de tiempo. El autor indica que este no es el mejor modelo de la familia; para el mejor resultado remite a `juice500/wavlm-24-phonemodel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder HuBERT-large congelado (transformer auto-supervisado) |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; el encoder base es HuBERT-large, tamano exacto no indicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa tramas a 16 kHz; ventana efectiva no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (reconocimiento restringible a otros inventarios PHOIBLE vía `vocab_for_language`) |
| Licencia | MIT (el código y el modelo; PHOIBLE 2.0 se descarga aparte bajo CC BY-SA 3.0) |
| Formato de pesos | no disponible (adaptador cargado vía `phonespam`, librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo es un adaptador que se apoya en las activaciones de la capa 24 de HuBERT-large (`facebook/hubert-large-ll60k`), un transformer auto-supervisado entrenado sobre audio de 16 kHz. Sobre esas representaciones congeladas, SPAM aprende a proyectar cada trama a 43 activaciones fonológicas en el rango [0, 1], con nombres como `silence+`, `syl+`, `son+`, entre otros. Dos cabezas leen de esa representación: una de segmentación (detectar fronteras entre fonemas) y otra de reconocimiento (asignar etiqueta a cada segmento), produciendo segmentos contiguos con tiempos en segundos.

El entrenamiento se realizó sobre el dataset `timit-asr/timit_asr` (TIMIT), según los metadatos del repositorio. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (poco probables en una tarea de etiquetado fonético). La innovación técnica destacable es precisamente el mapeo a rasgos fonológicos interpretables, que sustituye la representación latente del encoder por un espacio con semántica lingüística y permite restringir el vocabulario de salida a inventarios fonológicos de lenguas concretas mediante PHOIBLE.

## Capacidades

- Segmentación fonética: divide una señal de voz en segmentos contiguos con marcas de tiempo (`Segment(start, end, label)`).
- Reconocimiento de fonemas: asigna una etiqueta fonética a cada segmento detectado.
- Extracción de rasgos fonológicos interpretables: `model.spam("utt.wav")` devuelve una matriz `(frames, 43)` de activaciones en [0, 1] con nombres de rasgo accesibles vía `spam.featnames`.
- Restricción de inventario por lengua: `vocab=vocab_for_language("deu")` limita el reconocimiento al inventario PHOIBLE de una lengua dada.
- Procesamiento de audio a 16 kHz compatible con el encoder HuBERT-large.
- Ejecución en CPU o GPU (`device="cuda"`).
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso: es un modelo especializado de etiquetado acústico-fonético.

## Casos de uso

- Análisis de pronunciación en aprendizaje de idiomas: el modelo segmenta la señal y etiqueta fonemas, lo que permite comparar la producción del estudiante con el inventario esperado de la lengua y detectar sustituciones u omisiones concretas.
- Fonética computacional y lingüística de corpus: extraer alineamientos fonémicos con tiempos para anotar corpus de habla y estudiar fenómenos fonológicos (nasalización, sonorización, elisión) a partir de las 43 activaciones.
- Preprocesamiento para pipelines de síntesis de voz (TTS): generar etiquetas fonéticas y fronteras temporales que alimenten modelos acústicos o de duración en sistemas TTS.
- Investigación en modelos auto-supervisados de voz: servir como sonda interpretable de qué información fonológica codifica la capa 24 de HuBERT-large, comparando con otros puntos de la rejilla encoder × capa.
- Detección de spam o contenido anómalo en audio: la etiqueta `phonespam` y la representación fonológica permiten caracterizar patrones acústicos repetitivos o artificiales en llamadas.
- Evaluación de inteligibilidad y calidad de audio: medir la estabilidad de la segmentación y del etiquetado sobre grabaciones degradadas como indicador indirecto de inteligibilidad.
- Prototipado rápido en Python: la API `transcribe` devuelve segmentos listos para consumir, lo que facilita integrar análisis fonético en cuadernos y demos (el propio autor publica una demo en Streamlit).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador sobre HuBERT-large congelado, la huella dominante es la del encoder base, no la del adaptador.
- GPU recomendadas: no especificadas en la información disponible; el uso documentado admite `device="cuda"` para GPU y ejecución en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: la vía documentada es la librería `phonespam` (`pip install phonespam`) con `PhoneModel.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Encoder / capa | Tarea | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `juice500/hubert-24-phonemodel` | HuBERT-large, capa 24 | Segmentación y reconocimiento fonético | en (extensible vía PHOIBLE) | MIT | Checkpoint de un punto de la rejilla; el autor lo describe como no óptimo |
| `juice500/wavlm-24-phonemodel` | WavLM, capa 24 | Segmentación y reconocimiento fonético | no disponible | no disponible | Señalado por el autor como el mejor modelo de la familia |
| `facebook/hubert-large-ll60k` | HuBERT-large | Representación auto-supervisada de voz (encoder base) | no disponible | no disponible | No realiza segmentación ni etiquetado fonético por sí mismo; es la base del adaptador |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que este checkpoint no es el mejor de la familia; para el mejor resultado remite a `juice500/wavlm-24-phonemodel`.
- Entrenado sobre TIMIT (`timit-asr/timit_asr`), un corpus en inglés y de dominio acústico limitado; el rendimiento fuera de ese dominio (ruido, acentos, otras lenguas) no está documentado.
- El idioma declarado es únicamente `en`; el uso con otros inventarios vía `vocab_for_language` restringe el vocabulario de salida, pero no garantiza calidad de reconocimiento en esas lenguas.
- No es un modelo generativo: no produce transcripciones ortográficas ni texto libre, por lo que no debe emplearse para tareas de ASR de palabras.
- Riesgo de error en fronteras de segmentación y en etiquetas en habla solapada, susurrada o con ruido de fondo; no hay métricas publicadas que cuantifiquen este riesgo.
- La licencia del modelo y del código es MIT, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye ese recurso.
- El repositorio figura con 0.0 GB y 0 descargas, lo que sugiere que los pesos pueden no estar alojados o que el artefacto es muy pequeño (adaptador); verificar la disponibilidad real antes de integrarlo en producción.
- No hay información sobre cuantizaciones soportadas ni sobre latencia, lo que dificulta planificar despliegues con requisitos estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-24-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Encoder base: https://huggingface.co/facebook/hubert-large-ll60k
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
