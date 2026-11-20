# juice500/xls-r-0-phonemodel

## Resumen

xls-r-0-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas del modelo auto-supervisado de voz facebook/wav2vec2-xls-r-300m. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la cita del paper) y se publica como parte del método SPAM (S3M-based Phonological Activation Mapping), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo resuelve un problema clásico en fonética computacional: obtener fronteras y etiquetas de fonemas a partir de audio sin un sistema de reconocimiento de voz completo y sin entrenar el encoder desde cero.

La propuesta técnica consiste en mapear cada frame de las features del encoder a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, silabicidad, etc.), de forma que la representación opaca del modelo auto-supervisado se vuelve interpretable y directamente utilizable para segmentar y clasificar fonemas. Este checkpoint concreto corresponde a un único punto de la rejilla encoder × capa: XLS-R-300m en la capa 0, muestreado a 16 kHz. El autor remite explícitamente a juice500/wavlm-24-phonemodel como el mejor modelo de la familia, por lo que esta versión debe considerarse una variante de ablación o de referencia, no el estado del arte del método.

El modelo es relevante para investigadores que trabajan en fonética acústica, documentación de lenguas, evaluación de pronunciación o análisis de habla de bajo recurso, porque permite inspeccionar rasgos fonológicos intermedios y restringir el inventario de salida a una lengua concreta mediante PHOIBLE. Su licencia MIT y su empaquetado como librería Python (phonespam) facilitan la integración experimental, aunque el tamaño del repositorio (0,0 GB) y la ausencia de descargas sugieren que se trata de una publicación reciente y poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder transformer auto-supervisado congelado (wav2vec2-xls-r-300m) |
| Parametros totales | no disponible (el adaptador es ligero; el encoder base XLS-R-300m ronda los 300 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; ventana no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenado en TIMIT); el reconocimiento puede restringirse a inventarios de otras lenguas vía PHOIBLE con `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,0 GB; se carga mediante `PhoneModel.from_pretrained` de la libreria phonespam) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado de extremo a extremo, sino un adaptador que opera sobre features congeladas de XLS-R-300m. La arquitectura SPAM transforma cada frame del encoder en un vector de 43 activaciones fonológicas en el rango [0, 1], con nombres de rasgo accesibles (`silence+`, `syl+`, `son+`, etc.). A partir de esa representación, dos cabezas —una de segmentación y otra de reconocimiento— producen fronteras y etiquetas de fonemas. El checkpoint corresponde a la capa 0 del encoder XLS-R, es decir, una de las representaciones más superficiales de la rejilla encoder × capa analizada en el paper.

El entrenamiento se realizó sobre el dataset timit-asr/timit_asr, un corpus de habla inglesa con anotaciones fonéticas a nivel de fonema, lo que explica que el idioma declarado sea únicamente `en`. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (poco probables en una tarea de etiquetado fonético). La innovación destacable es precisamente el mapeo a rasgos fonológicos interpretables, que actúa como cuello de botella inductivo y permite inspeccionar la representación intermedia, además de filtrar la salida por inventario fonológico de una lengua concreta.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con inicio y fin en segundos (`Segment(start, end, label)`).
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético del inventario configurado.
- Extracción de rasgos fonológicos: `model.spam()` devuelve una matriz de (frames, 43) activaciones en [0, 1] con nombres de rasgo consultables.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la decodificación al inventario PHOIBLE de esa lengua.
- Procesamiento de audio a 16 kHz con el encoder XLS-R-300m.
- No dispone de generación de texto libre, tool calling, capacidades multimodales (visión, audio más allá del habla) ni modo de razonamiento extendido.

## Casos de uso

- Análisis fonético de corpus: procesar grabaciones con TIMIT u otros corpus anotados para comparar las fronteras predichas con las fronteras de referencia y estudiar el comportamiento del encoder en la capa 0.
- Documentación de lenguas: usar `vocab_for_language` con el inventario PHOIBLE de una lengua para obtener transcripciones fonéticas aproximadas en trabajos de campo, siempre con revisión humana.
- Evaluación de pronunciación: extraer la secuencia de fonemas de una locución y compararla con la esperada para detectar sustituciones u omisiones en aprendices de inglés.
- Investigación en representaciones auto-supervisadas: analizar las 43 activaciones fonológicas por frame para estudiar qué información codifica XLS-R en capas tempranas.
- Segmentación para pipelines de ASR: generar fronteras fonéticas que alimenten etapas posteriores de alineamiento o de modelos acústicos.
- Docencia en fonética y fonología: usar la demo de Streamlit para visualizar rasgos como sonoridad, nasalidad o estridencia sobre audio real.
- Filtrado y análisis de habla espontánea: la etiqueta `spam` del modelo sugiere uso en detección de habla no deseada, aunque no se documenta esa funcionalidad en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión de fronteras (por ejemplo, R-value o F1 de segmentación) ni tasas de error de fonema para este checkpoint concreto, y remite al paper para la comparativa completa de la rejilla encoder × capa.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el encoder XLS-R-300m en fp32 ocupa del orden de 1,2 GB de pesos, por lo que la inferencia cabe holgadamente en GPUs de consumo, pero la cifra exacta depende del adaptador y de la implementación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; una RTX 3060 o superior es suficiente para el encoder de 300 M. Para lotes grandes, A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 2060, RTX 3060, RTX 4090 y equivalentes; también debería ejecutarse en CPU para audios cortos.
- Opciones de despliegue: la librería propia `phonespam` (`pip install phonespam`), con soporte de `device="cuda"`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/xls-r-0-phonemodel | Adaptador sobre XLS-R-300m (capa 0) | no disponible | Segmentación y reconocimiento fonético | MIT | Hugging Face, libreria phonespam |
| juice500/wavlm-24-phonemodel | Adaptador sobre WavLM (capa 24) | no disponible | Segmentación y reconocimiento fonético | no disponible en la informacion proporcionada | Hugging Face, citado como mejor modelo de la familia |
| facebook/wav2vec2-xls-r-300m | ~300 M | no disponible | Representaciones auto-supervisadas de voz | no disponible en la informacion proporcionada | Hugging Face |
| Modelos de alineamiento forzado tipo Montreal Forced Aligner | no disponible | no aplica | Alineamiento fonético con diccionario y modelo acústico | no disponible en la informacion proporcionada | Distribucion propia |

La comparación directa con otros sistemas de reconocimiento fonético (por ejemplo, CTC sobre wav2vec2 o modelos entrenados desde cero) no está disponible en la información proporcionada, por lo que no se pueden ofrecer cifras comparativas de error.

## Limitaciones y advertencias

- Entrenado únicamente en inglés (TIMIT); el rendimiento en otras lenguas no está validado, aunque se pueda configurar el vocabulario con PHOIBLE.
- Es un checkpoint de ablación (capa 0 de XLS-R); el propio autor indica que el mejor modelo de la familia es wavlm-24-phonemodel, por lo que no debe tomarse como referencia de máximo rendimiento.
- Riesgo de errores en fronteras y etiquetas fonéticas, especialmente en habla espontánea, ruidosa o con acento no representado en TIMIT.
- El repositorio aparece con 0,0 GB y 0 descargas, lo que sugiere que los pesos podrían no estar completamente subidos o que la publicación es muy reciente; conviene verificar la integridad antes de usarlo en producción.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, con licencia CC BY-SA 3.0 distinta de la MIT del modelo; hay que revisar las obligaciones de atribución y compartir igual si se redistribuye.
- No hay información sobre sesgos demográficos, dialectales ni de género en los datos de entrenamiento.
- No apto para generación de texto, tool calling ni tareas multimodales; su uso está acotado al análisis fonético.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks publicados impide garantizar calidad en dominios distintos de TIMIT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-0-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Codigo: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
