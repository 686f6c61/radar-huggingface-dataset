# juice500/hubert-12-phonemodel

## Resumen

hubert-12-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de HuBERT-large (facebook/hubert-large-ll60k), concretamente sobre la capa 12 de las 24 que componen el encoder. Lo desarrolla el autor juice500 (Shikhar Bharadwaj y colaboradores, según la citación del paper) y forma parte del conjunto de modelos asociados al método SPAM (S3M-based Phonological Activation Mapping), publicado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo no genera texto libre: mapea cada frame del encoder a un vector de 43 activaciones fonológicas interpretables (voicing, nasalidad, estridentia, silabicidad, etc.) y, a partir de esa representación, produce segmentos contiguos con etiqueta fonética y marcas temporales.

El problema que resuelve es la opacidad de los modelos auto-supervisados de habla (S3M) a la hora de realizar tareas fonéticas: en lugar de entrenar un clasificador de fonemas caja negra, SPAM expone una capa intermedia con significado fonológico y deriva de ella tanto los límites entre fonemas como sus etiquetas. Esto permite inspeccionar qué rasgos activa el encoder en cada instante y restringir el inventario de reconocimiento a una lengua concreta mediante PHOIBLE.

Este checkpoint concreto es un punto de la rejilla encoder × capa del paper (Figura 2), no el mejor modelo de la familia: el propio autor remite a juice500/wavlm-24-phonemodel como la variante de referencia. Es relevante para investigación en fonética computacional, interpretabilidad de S3M y evaluación de qué capas de HuBERT codifican mejor la información fonológica. El repositorio es de tamaño 0.0 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un artefacto de reproducción científica más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder HuBERT-large congelado (transformer, capa 12 de 24) |
| Parametros totales | no disponible (el encoder base HuBERT-large tiene ~316 M de parámetros; el adaptador no publica recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; la ventana efectiva depende del encoder base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a otros inventarios PHOIBLE vía `vocab=` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en tiempo de ejecución es CC BY-SA 3.0) |
| Formato de pesos | no disponible (se carga con `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo es un adaptador sobre facebook/hubert-large-ll60k, un transformer HuBERT-large preentrenado de forma auto-supervisada sobre 60.000 horas de audio en inglés. El adaptador toma las activaciones de la capa 12 (de un total de 24) y las proyecta a un espacio de 43 rasgos fonológicos con valores en [0, 1], siguiendo el esquema SPAM descrito en el paper. Sobre esa representación operan dos cabezas: una de segmentación (detección de fronteras entre fonemas) y otra de reconocimiento (asignación de etiqueta a cada segmento). El encoder permanece congelado; solo se entrena el mapeo a rasgos fonológicos y las cabezas posteriores.

El entrenamiento utiliza el dataset timit-asr/timit_asr, el corpus TIMIT con anotaciones a nivel de fonema, que es el estándar de facto para segmentación y reconocimiento fonético en inglés. La model card no detalla el número de tokens de audio, la composición exacta del split, ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento supervisado sobre TIMIT. La innovación técnica destacable es precisamente la intermediación por rasgos fonológicos: en lugar de clasificar fonemas directamente, el modelo aprende un espacio interpretable alineado con la teoría fonológica, lo que permite auditar qué rasgos activa cada frame y restringir la decodificación a inventarios de fonemas de lenguas específicas mediante PHOIBLE.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con inicio y fin en segundos sobre audio de entrada.
- Reconocimiento fonético: asigna una etiqueta fonética a cada segmento detectado.
- Representación fonológica interpretable: expone `model.spam("utt.wav")`, una matriz de (frames × 43) activaciones en [0, 1] con nombres de rasgo accesibles vía `spam.featnames` (por ejemplo "silence+", "syl+", "son+").
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita el conjunto de etiquetas al inventario PHOIBLE de una lengua concreta.
- Procesamiento a 16 kHz, coherente con el encoder HuBERT subyacente.
- No soporta generación de texto, tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; es un modelo discriminativo de fonética.

## Casos de uso

- Investigación en interpretabilidad de modelos auto-supervisados de habla: comparar las activaciones de rasgos fonológicos de la capa 12 frente a otras capas permite estudiar en qué profundidad de HuBERT emerge cada contraste fonológico.
- Análisis fonético asistido: un fonetista puede obtener una alineación fonémica con marcas temporales sobre grabaciones TIMIT-like y revisar manualmente los rasgos activados en los tramos dudosos.
- Reproducción de experimentos del paper SPAM: este checkpoint es un punto concreto de la rejilla encoder × capa, útil para replicar la Figura 2 y validar la metodología frente al modelo de referencia (wavlm-24-phonemodel).
- Docencia en fonética y fonología computacional: la representación de 43 rasgos con nombres legibles permite ilustrar conceptos como voicing, nasalidad o estridentia directamente sobre la salida del modelo.
- Evaluación cruzada de inventarios fonológicos: usar `vocab_for_language` con distintas lenguas de PHOIBLE para medir hasta qué punto un encoder entrenado solo en inglés transfiere contrastes fonéticos de otras lenguas.
- Prototipado de pipelines de análisis de habla: integrar `transcribe` en scripts de investigación que necesiten una capa fonética intermedia antes de un paso posterior (por ejemplo, análisis de pronunciación o estudios de variación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de segmentación (por ejemplo, F1 de fronteras o phone error rate) para este checkpoint concreto ni comparaciones numéricas con otras capas o encoders.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El encoder base HuBERT-large ronda los 316 M de parámetros, lo que en FP32 supone aproximadamente 1,3 GB solo de pesos del encoder, más el adaptador y las cabezas; con activaciones y audio en memoria, un presupuesto de 2-4 GB de VRAM es una estimación razonable, pero no está confirmada por el autor.
- GPU recomendadas: no disponible. El ejemplo de uso de la model card menciona `device="cuda"` como opción, sin especificar modelos de GPU.
- GPU de consumo: previsiblemente cabe en GPUs de consumo con 6-8 GB o más, dado el tamaño del encoder, aunque no hay confirmación oficial.
- Opciones de despliegue: la vía documentada es la librería `phonespam` (`pip install phonespam`) con `PhoneModel.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Encoder / capa | Tarea | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hubert-12-phonemodel (este) | HuBERT-large, capa 12 | Segmentación y reconocimiento fonético vía SPAM | 16 kHz | MIT | Hugging Face, 0 descargas |
| juice500/wavlm-24-phonemodel | WavLM, capa 24 | Igual, variante de referencia del paper | 16 kHz | no disponible en la información | Hugging Face |
| facebook/hubert-large-ll60k | HuBERT-large completo | Representaciones auto-supervisadas (no fonética directa) | 16 kHz | no disponible en la información | Hugging Face |

La información disponible no incluye métricas comparativas entre estas variantes; la única indicación del autor es que wavlm-24-phonemodel es el mejor modelo de la familia.

## Limitaciones y advertencias

- Es un punto intermedio de la rejilla experimental, no el checkpoint recomendado: el propio autor remite a wavlm-24-phonemodel como mejor modelo.
- Entrenado únicamente sobre TIMIT en inglés; el rendimiento en otras lenguas o en audio espontáneo (no leído) no está documentado.
- El reconocimiento fuera del inventario inglés depende de PHOIBLE y de la calidad de esa base de datos; no hay evaluación publicada de esta transferencia.
- Riesgo de errores en fronteras fonéticas y en etiquetas en habla con ruido, solapamientos o variación dialectal; no se publican tasas de error.
- Sin datos de sesgo demográfico ni de robustez por acento, género o edad.
- El repositorio no registra descargas ni likes y el tamaño es de 0.0 GB, lo que puede indicar pesos no subidos, punteros o un artefacto incompleto; conviene verificar la carga antes de integrarlo.
- Licencia MIT para el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución bajo CC BY-SA 3.0, con obligaciones de atribución y compartición que afectan al uso comercial.
- No apto para generación de texto, asistentes conversacionales ni tareas de razonamiento; su ámbito es estrictamente fonético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-12-phonemodel
- Modelo de referencia de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Encoder base: https://huggingface.co/facebook/hubert-large-ll60k
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
