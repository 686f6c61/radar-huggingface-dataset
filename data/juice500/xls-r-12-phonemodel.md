# juice500/xls-r-12-phonemodel

## Resumen

xls-r-12-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de facebook/wav2vec2-xls-r-300m, concretamente sobre la capa 12 del encoder. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la cita del paper) y aplica una técnica denominada S3M-based Phonological Activation Mapping (SPAM), que proyecta cada frame del encoder a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, entre otros) para hacer interpretable la representación interna del modelo auto-supervisado.

El modelo resuelve dos tareas clásicas de fonética computacional: la segmentación temporal de fonemas en audio de habla y su reconocimiento (etiquetado). En lugar de entrenar un cabezal de clasificación opaco sobre las features del S3M, SPAM expone un espacio intermedio de rasgos fonológicos del que leen ambos cabezales, lo que permite inspeccionar qué rasgos activa el encoder en cada instante. Es relevante porque demuestra que un modelo auto-supervisado congelado, sin fine-tuning del encoder, puede sostener un pipeline fonético interpretable y multilingüe vía inventarios PHOIBLE.

Este checkpoint concreto es un punto de la rejilla encoder × capa del paper (Figura 2): XLS-R-300m en la capa 12. El propio autor indica que el mejor modelo de la familia es juice500/wavlm-24-phonemodel, por lo que esta variante debe entenderse como una pieza de análisis comparativo más que como el estado del arte de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder transformer auto-supervisado congelado (wav2vec2-xls-r-300m, capa 12) |
| Parametros totales | no disponible (el encoder base XLS-R-300m ronda los 300 M; el adaptador no reporta recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; ventana efectiva del encoder no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenado en inglés; admite restricción de vocabulario a inventarios PHOIBLE de otras lenguas en inferencia) |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0, licenciado aparte) |
| Formato de pesos | no disponible (repo de 0.0 GB; pesos gestionados por la librería phonespam) |

## Arquitectura y entrenamiento

El modelo no entrena el encoder: congela facebook/wav2vec2-xls-r-300m y extrae las activaciones de su capa 12 a 16 kHz. Sobre esas features se aprende un mapeo a 43 rasgos fonológicos (SPAM), y de esa representación intermedia leen dos cabezales, uno de segmentación temporal y otro de reconocimiento de fonemas. El resultado es un pipeline que devuelve segmentos contiguos con inicio, fin y etiqueta en segundos, además de la matriz de activaciones fonológicas por frame.

El entrenamiento se realizó sobre el dataset timit-asr/timit_asr. La model card no detalla el número de tokens, la composición del corpus, ni si hubo etapas de ajuste adicionales (RLHF/DPO no aplican a esta tarea). La innovación técnica destacable es precisamente SPAM: convertir la representación opaca del S3M en un espacio de rasgos fonológicos interpretables, y permitir restringir el vocabulario de reconocimiento a un inventario PHOIBLE por lengua en tiempo de inferencia.

## Capacidades

- Segmentación temporal de fonemas en audio de habla con marcas de inicio y fin en segundos.
- Reconocimiento de fonemas (etiquetado) a partir de las activaciones fonológicas.
- Exposición de un vector de 43 activaciones fonológicas por frame, con nombres de rasgo accesibles (silence+, syl+, son+, etc.).
- Restricción del vocabulario de reconocimiento a un inventario PHOIBLE de una lengua concreta mediante vocab_for_language.
- Interpretabilidad: inspección directa de qué rasgos fonológicos activa el encoder en cada instante.
- Inferencia en CPU o GPU (device="cuda").
- No soporta tool calling, agentes, visión, audio generativo ni modo thinking; es un modelo discriminativo de fonética.

## Casos de uso

- Análisis fonético y lingüístico: obtener alineaciones fonémicas con tiempos para estudiar fenómenos de coarticulación o duración vocálica, aprovechando que las activaciones SPAM son inspeccionables rasgo a rasgo.
- Investigación en modelos auto-supervisados: comparar qué capa del encoder (aquí la 12) codifica mejor cada rasgo fonológico, como parte de la rejilla encoder × capa del paper.
- Preprocesado para TTS y reconocimiento: generar transcripciones fonémicas temporizadas que alimenten pipelines de síntesis o de evaluación de pronunciación.
- Evaluación de pronunciación en aprendizaje de lenguas: segmentar el habla del estudiante y contrastar los fonemas producidos frente al inventario esperado de la lengua.
- Docencia y divulgación en fonética: el demo de Streamlit y la matriz de activaciones permiten visualizar de forma didáctica cómo se descompone el habla en rasgos.
- Restricción multilingüe en inferencia: usar vocab_for_language con inventarios PHOIBLE (por ejemplo "deu") para adaptar el reconocimiento a la lengua objetivo sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el encoder base es de ~300 M de parámetros, por lo que debería caber holgadamente en GPUs de consumo, pero el adaptador no reporta cifras.
- GPU recomendadas: no especificadas. El uso documentado admite device="cuda"; por tamaño del encoder, una RTX 4090 o incluso GPUs menores serían suficientes en principio.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del encoder base; sin cifras oficiales.
- Opciones de despliegue: librería phonespam (pip install phonespam); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| juice500/xls-r-12-phonemodel | XLS-R-300m | 12 | Segmentación y reconocimiento fonético (SPAM) | MIT | Este checkpoint; punto de la rejilla del paper |
| juice500/wavlm-24-phonemodel | WavLM | 24 | Segmentación y reconocimiento fonético (SPAM) | no disponible | Indicado por el autor como el mejor modelo de la familia |
| facebook/wav2vec2-xls-r-300m | — | — | Representación auto-supervisada (no fonética directa) | no disponible | Encoder base congelado; no produce fonemas por sí mismo |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo se entrenó en inglés (language: en); el reconocimiento en otras lenguas depende de restringir el vocabulario vía PHOIBLE y no está validado en la model card.
- Es un checkpoint intermedio de la rejilla del paper; el propio autor remite a wavlm-24-phonemodel como el mejor de la familia.
- El repo aparece con tamaño de 0.0 GB y sin descargas ni likes: disponibilidad y empaquetado de pesos no verificables desde los metadatos.
- La licencia MIT cubre el modelo y el código, pero vocab_for_language descarga PHOIBLE 2.0 en runtime, que es CC BY-SA 3.0 y se licencia por separado; hay que revisar esa obligación para uso comercial.
- No se documentan sesgos, tasas de alucinación ni métricas de error; al ser un modelo discriminativo, el riesgo principal es de etiquetado erróneo, no de generación.
- No apto para tareas generativas, tool calling ni agentes.
- Sin datos de cuantización ni de formatos de pesos publicados; el despliegue queda atado a la librería phonespam.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-12-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Encoder base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Paper (SLT 2026): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
