# juice500/wavlm-3-phonemodel

## Resumen

wavlm-3-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de WavLM-large (capa 3), un modelo auto-supervisado de habla de Microsoft. Lo desarrolla el autor juice500 (Shikhar Bharadwaj y colaboradores según la citación del paper) y se publica como parte de SPAM (S3M-based Phonological Activation Mapping), una técnica que proyecta cada frame del encoder en un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, entre otros), haciendo interpretable una representación latente que de otro modo sería opaca.

El modelo resuelve dos tareas clásicas de fonética computacional: la segmentación temporal de teléfonos en el audio y su etiquetado dentro de un inventario fonológico. En lugar de entrenar un reconocedor de fonemas de extremo a extremo, aprovecha un encoder de habla preentrenado y solo aprende la proyección a rasgos fonológicos y las cabezas de segmentación y clasificación, lo que reduce drásticamente los datos y el coste de entrenamiento necesarios.

Este checkpoint concreto es un punto del grid encoder × capa (figura 2 del paper); el autor indica explícitamente que el mejor modelo de la familia es `juice500/wavlm-24-phonemodel`. Está pensado como pieza de investigación reproducible (licencia MIT, código en GitHub, demo en Streamlit) y como herramienta práctica para anotación fonética y análisis lingüístico asistido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder WavLM-large congelado (transformer auto-supervisado de habla) + cabezas de segmentación y clasificación fonética |
| Parametros totales | no disponible (el encoder base WavLM-large tiene ~317 M; el adaptador no reporta cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; ventana efectiva determinada por WavLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (reconocimiento restringible a cualquier inventario PHOIBLE vía `vocab_for_language`) |
| Licencia | MIT (PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0, licenciado aparte) |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo no entrena el encoder: congela WavLM-large y extrae sus features de la capa 3. Sobre esas representaciones, SPAM aprende un mapeo frame a frame hacia 43 activaciones de rasgos fonológicos en el rango [0, 1], que actúan como espacio intermedio interpretable. Dos cabezas leen de esa representación: una de segmentación (fronteras entre teléfonos, incluido silencio) y otra de reconocimiento (etiqueta fonética condicionada opcionalmente a un inventario de una lengua concreta). El pipeline `transcribe` devuelve segmentos contiguos `(start, end, label)` en segundos.

El entrenamiento se realizó sobre el dataset TIMIT (`timit-asr/timit_asr`), el corpus de referencia para fonética del inglés con anotaciones a nivel de teléfono. No se detallan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales. La innovación técnica principal es precisamente el enfoque SPAM: sustituir el reconocimiento de fonemas de extremo a extremo por una proyección supervisada a rasgos fonológicos sobre un S3M congelado, lo que aporta interpretabilidad y permite restringir el vocabulario de salida a inventarios lingüísticamente válidos.

## Capacidades

- Segmentación temporal de teléfonos en audio de habla (fronteras inicio/fin por segmento).
- Reconocimiento de fonemas sobre las representaciones de WavLM-large.
- Exposición de 43 activaciones de rasgos fonológicos (`spam()`), con nombres accesibles vía `spam.featnames` (p. ej. "silence+", "syl+", "son+").
- Restricción del reconocimiento a un inventario fonológico de una lengua concreta mediante `vocab_for_language` y PHOIBLE.
- Procesamiento a 16 kHz, con soporte de GPU (`device="cuda"`).
- Integración como librería Python (`phonespam`) con API de alto nivel (`PhoneModel.from_pretrained`, `transcribe`).
- No soporta tool calling, agentes, visión ni audio generativo: es un modelo discriminativo de fonética.

## Casos de uso

- Anotación fonética asistida: generar alineaciones a nivel de teléfono sobre corpus de habla inglesa para acelerar el etiquetado manual en proyectos de lingüística y fonética, usando `transcribe` para obtener segmentos con tiempos.
- Análisis de rasgos fonológicos: emplear `spam()` para estudiar activaciones de sonoridad, nasalidad o estridencia a lo largo de una emisión, útil en investigación fonológica y en docencia.
- Adaptación a otras lenguas: restringir el vocabulario de reconocimiento con `vocab_for_language("deu")` u otro código PHOIBLE para experimentar con inventarios no ingleses, aunque el encoder esté entrenado principalmente en inglés.
- Evaluación de representaciones auto-supervisadas: usar este checkpoint como uno de los puntos del grid encoder × capa para comparar qué capa de WavLM codifica mejor la información fonética.
- Preprocesado para pipelines de habla: producir segmentaciones fonéticas que alimenten sistemas posteriores de síntesis, corrección de pronunciación o análisis de acento.
- Prototipado e investigación reproducible: al ser MIT y con código y demo públicos, sirve para replicar experimentos del paper SPAM o como baseline en trabajos de segmentación fonética.
- Demostración interactiva: la app de Streamlit permite probar el pipeline sin escribir código, útil para presentaciones y validación cualitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el encoder WavLM-large (~317 M parámetros) en fp32 requiere del orden de 1,3 GB solo para pesos, más activaciones y el adaptador. Cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM para inferencia cómoda (RTX 3060, RTX 4090, A100, H100). También funciona en CPU, con mayor latencia.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: librería `phonespam` (pip) con backend PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wavlm-3-phonemodel | WavLM-large capa 3 | Segmentación y reconocimiento fonético vía SPAM | en (vocabulario ampliable con PHOIBLE) | MIT | Hugging Face + pip |
| juice500/wavlm-24-phonemodel | WavLM-large capa 24 | Igual, mejor punto del grid según el autor | en | MIT | Hugging Face |
| Reconocedores de fonemas supervisados clásicos (p. ej. sobre TIMIT) | Varios (HMM, CTC, transformers pequeños) | Reconocimiento fonético | Según corpus | Variable | Variable |

No se dispone de datos de rendimiento comparativos en la información proporcionada para cuantificar diferencias frente a alternativas.

## Limitaciones y advertencias

- Entrenado sobre TIMIT, un corpus pequeño y de dominio restringido (habla leída, inglés americano); la generalización a otros dominios, acentos o ruido no está documentada.
- El reconocimiento está orientado al inglés; usar `vocab_for_language` con otras lenguas es una extrapolación no validada en la información disponible.
- Este checkpoint es un punto intermedio del grid; el propio autor recomienda `wavlm-24-phonemodel` como mejor modelo, por lo que su rendimiento no representa el máximo de la familia.
- Riesgo de errores en fronteras de teléfonos y en etiquetas en habla rápida, solapada o con ruido; no hay métricas publicadas para cuantificarlo.
- La licencia MIT cubre el modelo y el código, pero PHOIBLE 2.0 se descarga en runtime bajo CC BY-SA 3.0, con obligaciones de atribución y compartición que deben respetarse por separado.
- El repositorio reporta 0.0 GB y 0 descargas, lo que sugiere un artefacto muy reciente o poco validado por la comunidad; conviene verificar la integridad de los pesos antes de usarlo en producción.
- No es un modelo generativo: no produce transcripciones ortográficas ni texto libre, solo segmentos fonéticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-3-phonemodel
- Mejor checkpoint de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper (arXiv, SLT 2026): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
