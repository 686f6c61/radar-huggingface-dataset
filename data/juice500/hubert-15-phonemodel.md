# juice500/hubert-15-phonemodel

## Resumen

hubert-15-phonemodel es un adaptador para segmentación y reconocimiento de fonemas construido sobre el modelo auto-supervisado de voz HuBERT-large (facebook/hubert-large-ll60k). Lo desarrolla el autor juice500 (Shikhar Bharadwaj y colaboradores según la citación) como parte del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo resuelve el problema de extraer fonemas con sus límites temporales a partir de audio, usando las representaciones internas congeladas de un encoder auto-supervisado en lugar de entrenar un sistema ASR completo.

La innovación principal es SPAM (S3M-based Phonological Activation Mapping), una técnica que proyecta cada frame del encoder a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, etc.), transformando una representación opaca en una interpretable. Este checkpoint concreto corresponde a una de las combinaciones encoder × capa del grid experimental del paper: HuBERT-large en la capa 15, con audio de entrada a 16 kHz.

Se trata de un modelo de nicho, orientado a investigación en fonética computacional y fonología, no a aplicaciones de ASR general. El autor indica explícitamente que este no es el mejor modelo del grid y remite a `juice500/wavlm-24-phonemodel` como el de mejor rendimiento. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar materializados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre HuBERT-large (transformer auto-supervisado de voz) con cabezas de segmentación y reconocimiento sobre activaciones fonológicas (SPAM) |
| Parametros totales | no disponible (adaptador; el encoder base HuBERT-large tiene ~317 M de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa utterances de audio; ventana dependiente del encoder HuBERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el vocabulario de reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (librería `phonespam`; el repo reporta 0.0 GB) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado desde cero, sino un adaptador que se apoya en las representaciones congeladas de HuBERT-large (facebook/hubert-large-ll60k), un encoder auto-supervisado de voz preentrenado. SPAM toma los frames de salida de una capa concreta del encoder (en este caso la capa 15) y los mapea a un vector de 43 activaciones de rasgos fonológicos en el rango [0, 1], con nombres como "silence+", "syl+", "son+". A partir de esa representación interpretable, dos cabezas realizan respectivamente la segmentación (detección de límites entre fonemas) y el reconocimiento (etiquetado del fonema).

El entrenamiento del adaptador se realizó sobre el dataset TIMIT (timit-asr/timit_asr), según los tags del repositorio. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; estos detalles no están disponibles en la información proporcionada. La innovación técnica destacable es precisamente el mapeo a rasgos fonológicos, que aporta interpretabilidad frente a representaciones latentes opacas, y la posibilidad de restringir el espacio de etiquetas de reconocimiento a inventarios fonológicos por lengua mediante PHOIBLE.

## Capacidades

- Segmentación de fonemas: devuelve límites temporales (`start`, `end`) de cada segmento en segundos.
- Reconocimiento de fonemas: asigna una etiqueta fonética a cada segmento.
- Extracción de activaciones fonológicas interpretables: `model.spam(audio)` devuelve una matriz (frames, 43) con 43 rasgos fonológicos en [0, 1] y sus nombres accesibles vía `spam.featnames`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita el reconocimiento a un inventario PHOIBLE concreto (alemán, etc.).
- Procesamiento de audio a 16 kHz.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Investigación en fonética computacional: analizar los límites y etiquetas de fonemas producidos por el modelo para estudiar fenómenos fonológicos en corpus de habla, aprovechando la representación interpretable de 43 rasgos.
- Análisis de rasgos fonológicos: usar `model.spam()` para obtener activaciones de sonoridad, nasalidad, estridencia y otros rasgos por frame, útil para visualizar y comparar realizaciones fonéticas entre hablantes.
- Segmentación forzada ligera: obtener alineamientos a nivel de fonema en utterances cortas sin necesidad de un sistema ASR completo, gracias a que el encoder está congelado y el adaptador es ligero.
- Reconocimiento restringido por inventario: en estudios de una lengua concreta, limitar el vocabulario de salida mediante PHOIBLE para reducir errores fuera del inventario fonológico de esa lengua.
- Docencia y divulgación: el demo de Streamlit (phonespam.streamlit.app) permite ilustrar la relación entre señal acústica y rasgos fonológicos de forma interactiva.
- Reproducción de experimentos del paper: este checkpoint es un punto concreto del grid encoder × capa de la Figura 2, útil para replicar o comparar resultados del estudio SPAM.
- Prototipado de herramientas de anotación fonética: generar preanotaciones de segmentos y etiquetas que un lingüista pueda revisar y corregir manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre HuBERT-large (~317 M de parámetros en el encoder base), la inferencia completa requiere cargar el encoder, lo que típicamente implica varios GB de VRAM según precisión (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: no disponible en la información proporcionada; el código admite `device="cuda"` para GPU.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`), con API `PhoneModel.from_pretrained(...)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/hubert-15-phonemodel | HuBERT-large | 15 | Segmentación y reconocimiento de fonemas (SPAM) | MIT | Hugging Face |
| juice500/wavlm-24-phonemodel | WavLM | 24 | Segmentación y reconocimiento de fonemas (SPAM) | no disponible | Hugging Face (indicado por el autor como el mejor del grid) |

No se dispone de información sobre otros modelos comparables de segmentación y reconocimiento de fonemas en la documentación proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que este no es el mejor modelo del grid; para mejor rendimiento remite a `juice500/wavlm-24-phonemodel`.
- El modelo está orientado a inglés (idioma `en`); el reconocimiento en otras lenguas depende de restringir el vocabulario vía PHOIBLE, sin garantías de rendimiento.
- Repositorio con tamaño de 0.0 GB y 0 descargas en el momento de la consulta: posible ausencia de pesos materializados o disponibilidad limitada; conviene verificar antes de usarlo en producción.
- Riesgo de errores en los límites de segmentación y en las etiquetas fonéticas, especialmente en habla espontánea o con ruido; no se han publicado métricas en la información disponible.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento.
- La licencia del modelo es MIT, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado; hay que respetar esa licencia en uso comercial.
- Al ser un adaptador sobre un S3M congelado, las representaciones heredan los sesgos del preentrenamiento de HuBERT-large y del corpus TIMIT, que no está documentado en detalle en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-15-phonemodel
- Modelo base: https://huggingface.co/facebook/hubert-large-ll60k
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
