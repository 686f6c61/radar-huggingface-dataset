# juice500/xls-r-18-phonemodel

## Resumen

xls-r-18-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de XLS-R-300m (facebook/wav2vec2-xls-r-300m), concretamente sobre su capa 18. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la cita del paper) y aplica una técnica denominada SPAM (S3M-based Phonological Activation Mapping), que proyecta cada frame del encoder auto-supervisado a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, silencio, silabicidad, etc.).

El modelo no es un ASR convencional ni un LLM: resuelve el problema de obtener fronteras temporales de fonemas y etiquetas fonéticas interpretables a partir de audio de 16 kHz, sin reentrenar el encoder. La representación intermedia es explícita y auditable, lo que permite restringir el vocabulario de reconocimiento al inventario fonológico de un idioma concreto vía PHOIBLE.

Es relevante para investigación fonética computacional, evaluación de pronunciación y análisis de habla interpretable. Se trata de un punto concreto de la rejilla encoder × capa del paper (Figura 2); el autor indica que el mejor modelo de esa familia es wavlm-24-phonemodel. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere pesos publicados como adaptador ligero más que como checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder transformer auto-supervisado congelado (wav2vec2/XLS-R); dos cabezas sobre activaciones fonológicas de 43 dimensiones |
| Parametros totales | no disponible (el encoder base XLS-R-300m tiene ~300M; el adaptador no reporta recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz por frames; no se especifica ventana máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenado/evaluado en inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0) |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga con `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El sistema congela un encoder XLS-R-300m y extrae las activaciones de su capa 18. Sobre esas representaciones, SPAM aprende un mapeo a 43 rasgos fonológicos con valores en [0, 1] (`spam.featnames` expone nombres como "silence+", "syl+", "son+"). A partir de esa matriz de activaciones, dos cabezas resuelven la segmentación (fronteras temporales) y el reconocimiento (etiqueta fonética) de forma conjunta, devolviendo segmentos contiguos con tiempos en segundos.

El entrenamiento se realizó sobre el dataset timit-asr/timit_asr, según los metadatos de la model card. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de ajuste adicionales más allá del entrenamiento supervisado del adaptador. La innovación técnica principal es la interpretabilidad: en lugar de una capa oculta opaca, el modelo expone un espacio de rasgos fonológicos lingüísticamente motivados, y permite condicionar la decodificación al inventario fonológico de una lengua (PHOIBLE) mediante el parámetro `vocab`.

## Capacidades

- Segmentación fonética: devuelve intervalos contiguos `Segment(start, end, label)` con tiempos en segundos.
- Reconocimiento de fonemas a partir de audio de 16 kHz.
- Representación fonológica interpretable: matriz `(frames, 43)` de activaciones en [0, 1] con rasgos como sonoridad, nasalidad, estridencia, silabicidad y silencio.
- Restricción de vocabulario por idioma mediante inventarios PHOIBLE (`vocab_for_language("deu")`, etc.).
- Inspección directa de la representación intermedia (`model.spam(...)`) para análisis y depuración.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de habla, no un LLM.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Investigación fonética y fonológica: extraer alineamientos a nivel de fonema y analizar qué rasgos activa cada frame permite estudiar fenómenos de coarticulación y reducción vocálica con datos cuantitativos.
- Evaluación de pronunciación en aprendizaje de lenguas: comparar la secuencia de fonemas reconocida con la esperada y localizar desviaciones con marcas temporales precisas.
- Análisis de habla interpretable: al exponer 43 rasgos en [0, 1], se puede auditar por qué el modelo asignó una etiqueta, algo imposible con un ASR de caja negra.
- Segmentación para pipelines de corpus: generar fronteras fonéticas que alimenten herramientas posteriores de análisis acústico o de entrenamiento de modelos de habla.
- Estudio comparativo de encoders auto-supervisados: al ser un punto de la rejilla encoder × capa, sirve para reproducir los experimentos de la Figura 2 del paper y comparar XLS-R con WavLM.
- Adaptación a otras lenguas: restringiendo el vocabulario con PHOIBLE se puede aplicar el reconocimiento a inventarios fonológicos de idiomas distintos del inglés, con la cautela de que el adaptador se entrenó con datos en inglés.
- Docencia y demostraciones: el demo de Streamlit permite ilustrar segmentación y rasgos fonológicos en clase sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El encoder base XLS-R-300m ocupa aproximadamente 1,2 GB en fp32 y unos 600 MB en fp16; el adaptador adicional es de tamaño reducido según el repositorio (0.0 GB).
- GPU recomendadas: no especificadas. Por el tamaño del encoder, una GPU consumer con 4-8 GB de VRAM debería ser suficiente para inferencia en fp16; el código admite `device="cuda"`.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060/4060 o superiores), aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`) y demo en Streamlit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de habla de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xls-r-18-phonemodel | XLS-R-300m, capa 18 | Segmentación y reconocimiento fonético con rasgos interpretables | Audio 16 kHz | MIT | Hugging Face (0 descargas) |
| juice500/wavlm-24-phonemodel | WavLM, capa 24 | Igual, indicado por el autor como el mejor de la familia | Audio 16 kHz | no disponible | Hugging Face |
| ASR convencional sobre wav2vec2/XLS-R (p. ej. CTC) | XLS-R-300m | Transcripción a texto | Audio 16 kHz | variable según checkpoint | Amplia |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con datos en inglés (TIMIT); el uso con otros idiomas vía PHOIBLE no está validado y puede degradar el reconocimiento.
- No es un modelo de transcripción ortográfica: produce fonemas, no texto, por lo que no sustituye a un ASR en aplicaciones de dictado.
- El repositorio registra 0 descargas y 0 likes, y el tamaño de 0.0 GB sugiere que los pesos publicados son un adaptador; conviene verificar la integridad de la carga antes de usarlo en producción.
- El autor remite a wavlm-24-phonemodel como el mejor modelo de la familia, lo que implica que este checkpoint es una variante de ablation, no el estado del arte del proyecto.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución: introduce una dependencia de red y una licencia distinta (CC BY-SA 3.0) con obligaciones de atribución y compartición.
- No se documentan sesgos específicos ni tasas de alucinación; en un modelo de etiquetado fonético el riesgo principal es la asignación errónea de fonemas en habla ruidosa o con acentos no representados en TIMIT.
- No hay información sobre cuantizaciones soportadas ni sobre latencia, lo que dificulta planificar despliegues con requisitos estrictos.
- La licencia MIT del modelo no cubre el dataset PHOIBLE ni necesariamente los términos de uso de XLS-R-300m como modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-18-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
