# juice500/xls-r-9-phonemodel

## Resumen

`juice500/xls-r-9-phonemodel` es un modelo de segmentación y reconocimiento de fonemas construido sobre el codificador auto-supervisado `facebook/wav2vec2-xls-r-300m` (XLS-R-300m). Lo desarrolla el autor `juice500` en el marco del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en el IEEE SLT 2026. El modelo no es un transformer entrenado desde cero, sino un adaptador sobre las representaciones congeladas de la capa 9 del codificador XLS-R, que proyecta cada frame a un vector de 43 activaciones fonológicas (sonoridad, nasalidad, estridencia, etc.).

El problema que resuelve es la opacidad de los codificadores auto-supervisados de voz: en lugar de mapear directamente audio a fonemas, SPAM convierte cada frame en un vector interpretable de rasgos fonológicos, sobre el que dos cabezas (segmentación y reconocimiento) operan para producir segmentos temporales etiquetados. Este repositorio concreto corresponde a un único punto de la rejilla encoder × capa (XLS-R-300m, capa 9); el autor indica que el mejor modelo de la familia es `juice500/wavlm-24-phonemodel`.

Es relevante para investigadores en fonética computacional y reconocimiento de voz de baja supervisión que necesiten segmentación fonética interpretable sin entrenar un sistema ASR completo. El entrenamiento se realizó sobre TIMIT (inglés), y el modelo se distribuye bajo licencia MIT con la librería `phonespam`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre codificador auto-supervisado wav2vec2 XLS-R-300m (capa 9) con SPAM (Phonological Activation Mapping) y dos cabezas de segmentación y reconocimiento |
| Parametros totales | no disponible (el codificador base XLS-R-300m tiene ~300 M; los parámetros del adaptador no se especifican) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; ventana no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (entrenado en TIMIT); reconocimiento restringible a inventarios PHOIBLE de otras lenguas vía `vocab=` |
| Licencia | MIT |
| Formato de pesos | no disponible (carga vía `phonespam` con `PhoneModel.from_pretrained`) |

## Arquitectura y entrenamiento

El modelo combina un codificador auto-supervisado congelado (`facebook/wav2vec2-xls-r-300m`, capa 9, audio a 16 kHz) con un mecanismo SPAM que mapea cada frame del codificador a un vector de 43 activaciones fonológicas en el rango [0, 1]. Sobre esa representación interpretable operan dos cabezas: una de segmentación temporal y otra de reconocimiento de fonemas. El resultado es una secuencia de segmentos contiguos `(start, end, label)` con tiempos en segundos.

El entrenamiento se realizó sobre el dataset TIMIT (`timit-asr/timit_asr`), de habla inglesa. No se especifican en la información disponible el número de tokens, la composición detallada del dataset, ni si se emplearon técnicas de RLHF/DPO (poco probables en una tarea de segmentación fonética supervisada). La innovación técnica destacable es precisamente el SPAM: convertir representaciones opacas del codificador en activaciones de rasgos fonológicos interpretables, lo que permite inspeccionar la representación intermedia (`model.spam(...)` devuelve una matriz de frames × 43 con nombres de rasgo en `featnames`).

## Capacidades

- Segmentación fonética: divide un audio en segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con un fonema.
- Representación fonológica interpretable: expone 43 activaciones de rasgos (sonoridad, nasalidad, estridencia, silencio, silábico, etc.) por frame.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita el reconocimiento al inventario PHOIBLE de una lengua concreta.
- Procesamiento a 16 kHz sobre codificador XLS-R multilingüe (aunque el adaptador está entrenado en inglés).
- API de alto nivel en Python (`transcribe`, `spam`) vía la librería `phonespam`.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la tarea fonética.

## Casos de uso

- Investigación fonética y fonológica: obtener alineaciones fonéticas con tiempos para corpus de habla, usando `transcribe` para generar segmentos etiquetados y `spam` para analizar qué rasgos activa el codificador en cada frame.
- Análisis de rasgos fonológicos interpretables: estudiar cómo XLS-R representa sonoridad, nasalidad o estridencia examinando la matriz de 43 activaciones, algo útil para interpretabilidad de modelos de voz.
- Anotación asistida de corpus de habla: pre-segmentar y pre-etiquetar audio inglés para acelerar la anotación manual en proyectos de lingüística de corpus.
- Experimentos comparativos de codificadores: al ser un punto de la rejilla encoder × capa, sirve para comparar XLS-R capa 9 frente a otras combinaciones (p. ej. WavLM) en tareas de segmentación fonética.
- Reconocimiento fonético restringido por inventario: usar `vocab_for_language` para limitar la salida al inventario PHOIBLE de una lengua concreta en estudios multilingües exploratorios.
- Docencia y demostraciones: la demo en Streamlit permite ilustrar segmentación y reconocimiento fonético sin infraestructura propia.
- Prototipado en pipelines de voz: integrar la segmentación fonética como paso previo en análisis de pronunciación o estudios de variación fonética en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el codificador base XLS-R-300m (~300 M de parámetros) más un adaptador ligero sugiere un consumo moderado, pero no se documentan cifras.
- GPU recomendadas: no disponible; la API admite `device="cuda"` para GPU.
- GPU de consumo: probablemente asequible en GPUs consumer modernas dado el tamaño del codificador, aunque no se confirma en la información disponible.
- Opciones de despliegue: librería `phonespam` (instalable con `pip install phonespam`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a esta tarea).
- Latencia y throughput: no disponible.
- Nota: `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, lo que requiere conectividad y añade una dependencia externa.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/xls-r-9-phonemodel` | XLS-R-300m | 9 | Segmentación y reconocimiento fonético | MIT | Hugging Face |
| `juice500/wavlm-24-phonemodel` | WavLM | 24 | Segmentación y reconocimiento fonético (mejor modelo de la familia según el autor) | no disponible | Hugging Face |
| Otros puntos de la rejilla encoder × capa de SPAM | XLS-R / WavLM | variables | Segmentación y reconocimiento fonético | no disponible | Hugging Face (según autor) |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa con alternativas; la comparación se limita a la arquitectura y la disponibilidad.

## Limitaciones y advertencias

- Entrenado únicamente en inglés (TIMIT); el rendimiento en otras lenguas no está validado, aunque se pueda restringir el vocabulario con PHOIBLE.
- Es un punto concreto de la rejilla encoder × capa y no el mejor modelo de la familia; el propio autor remite a `juice500/wavlm-24-phonemodel` para el mejor resultado.
- No se documentan sesgos específicos, pero al entrenar sobre TIMIT (habla leída, dominios limitados) puede generalizar mal a habla espontánea, ruido o acentos no representados.
- Riesgo de errores de segmentación y etiquetado en fonemas; no es un sistema ASR y no produce transcripciones ortográficas.
- La licencia del modelo es MIT, pero `vocab_for_language` descarga PHOIBLE 2.0, que es CC BY-SA 3.0 y se licencia por separado; conviene revisar las obligaciones de atribución y compartición si se usa en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que el paquete es muy ligero; verificar antes de desplegar.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-9-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Mejor modelo de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
