# juice500/hubert-9-phonemodel

## Resumen

`hubert-9-phonemodel` es un adaptador para segmentación y reconocimiento de fonemas construido sobre el modelo auto-supervisado de voz HuBERT-large (`facebook/hubert-large-ll60k`). Lo publica el usuario `juice500` como parte del proyecto SPAM (S3M-based Phonological Activation Mapping), presentado en el paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). El modelo no es un LLM ni un modelo generativo de texto: es una cabeza de predicción que opera sobre las representaciones congeladas de una capa concreta (la capa 9) del encoder HuBERT y produce, para cada frame de audio a 16 kHz, un vector de 43 activaciones fonológicas interpretables (voicing, nasalidad, stridencia, etc.).

El problema que resuelve es la opacidad de los modelos auto-supervisados de voz: en lugar de mapear directamente frames a fonemas, SPAM mapea cada frame a un espacio de rasgos fonológicos definidos lingüísticamente, y a partir de ahí deriva la segmentación y el reconocimiento. Esto permite inspeccionar la representación intermedia y restringir el vocabulario de salida a un inventario fonológico concreto (por ejemplo, el inventario PHOIBLE de una lengua), algo útil en documentación lingüística, análisis fonético y evaluación de modelos de voz.

Es relevante como pieza de un grid sistemático encoder × capa: este checkpoint concreto corresponde a un único punto (HuBERT-large, capa 9) de ese grid, y el propio autor remite a `juice500/wavlm-24-phonemodel` como el mejor modelo de la familia. El repo pesa 0.0 GB y no registra descargas ni likes en el momento de la consulta, por lo que es un artefacto de investigación de nicho, no un modelo listo para producción masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador (cabezas de segmentación y reconocimiento) sobre encoder HuBERT-large (`facebook/hubert-large-ll60k`), capa 9, features congeladas |
| Parametros totales | no disponible (no se especifica el tamaño del adaptador; el encoder base HuBERT-large ronda los 300 M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera por frames sobre audio de 16 kHz; `transcribe` devuelve segmentos contiguos sin límite de contexto declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT (el código y el modelo); PHOIBLE 2.0 se descarga en runtime bajo CC BY-SA 3.0, licencia separada |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `phonespam` con `PhoneModel.from_pretrained`) |

## Arquitectura y entrenamiento

El modelo se apoya en un encoder HuBERT-large preentrenado (`facebook/hubert-large-ll60k`) que se mantiene congelado. Sobre las activaciones de la capa 9 se aplican dos cabezas: una de segmentación y otra de reconocimiento de fonemas. La innovación central es SPAM: en lugar de predecir directamente clases de fonemas, el modelo proyecta cada frame a un vector de 43 activaciones fonológicas en el rango [0, 1] (nombres como `silence+`, `syl+`, `son+`, etc.), que actúa como representación intermedia compartida por ambas cabezas. Esa representación es interpretable y lingüísticamente motivada.

El entrenamiento se realiza sobre el dataset TIMIT (`timit-asr/timit_asr`), según los metadatos del repo. No se detalla en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (poco probable en esta tarea). Tampoco se especifican técnicas como decodificación especulativa o atención lineal; el foco técnico es el mapeo a rasgos fonológicos y la posibilidad de restringir el vocabulario de reconocimiento a un inventario PHOIBLE por lengua.

## Capacidades

- Segmentación de audio en unidades telefónicas con marcas de tiempo en segundos (`Segment(start, end, label)`).
- Reconocimiento de fonemas a partir de audio a 16 kHz.
- Exposición de la representación intermedia: `model.spam("utt.wav")` devuelve una matriz `(frames, 43)` de activaciones fonológicas en [0, 1] con nombres de rasgo accesibles vía `spam.featnames`.
- Restricción del vocabulario de reconocimiento a un inventario fonológico concreto mediante `vocab_for_language`, que descarga PHOIBLE 2.0 en runtime.
- Inspección de rasgos fonológicos (voicing, nasalidad, stridencia, etc.) por frame.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo: es un modelo discriminativo de fonética.
- Capacidad multilingüe limitada: el modelo está etiquetado como `en`, aunque el mecanismo de vocabulario PHOIBLE permite adaptar la salida a otras lenguas.

## Casos de uso

- Documentación lingüística de campo: transcribir grabaciones en inglés a nivel fonémico con marcas de tiempo, usando `transcribe` para obtener segmentos contiguos y revisar manualmente los rasgos fonológicos con `spam` para validar decisiones de anotación.
- Análisis fonético experimental: extraer la matriz de 43 activaciones por frame para estudiar correlatos acústicos de rasgos como voicing o nasalidad en corpus controlados, sin depender de un ASR opaco.
- Adaptación a inventarios limitados: restringir el reconocimiento al inventario PHOIBLE de una lengua concreta (`vocab_for_language("deu")`, por ejemplo) para reducir el espacio de salida en estudios comparativos entre lenguas.
- Evaluación de encoders auto-supervisados de voz: este checkpoint es un punto del grid encoder × capa; sirve para comparar cómo varía la calidad de segmentación según la capa de HuBERT-large, tal como se describe en el paper.
- Enseñanza de fonética y fonología: usar la demo de Streamlit o la API para mostrar a estudiantes cómo un modelo mapea señal acústica a rasgos articulatorios interpretables.
- Preprocesado para pipelines de voz: generar alineamientos fonémicos con tiempos que alimenten etapas posteriores (síntesis, análisis de pronunciación, estudios de duración) en inglés, aprovechando la salida estructurada de segmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2607.09020) y al checkpoint `juice500/wavlm-24-phonemodel` como mejor modelo de la familia, pero no incluye cifras de métricas como phone error rate, boundary F1 u otras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El encoder base HuBERT-large ronda los 300 M de parámetros y el adaptador es pequeño; en FP32 el encoder ocuparía del orden de 1,2 GB, pero esta cifra no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. La API acepta `device="cuda"`; también funciona en CPU.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del encoder base, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: paquete `phonespam` (`pip install phonespam`), con `PhoneModel.from_pretrained`; demo pública en Streamlit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/hubert-9-phonemodel` | HuBERT-large | 9 | Segmentación y reconocimiento de fonemas vía SPAM | MIT | Hugging Face |
| `juice500/wavlm-24-phonemodel` | WavLM | 24 | Igual, señalado por el autor como el mejor del grid | no disponible en la informacion | Hugging Face |
| Otros puntos del grid encoder × capa | HuBERT / WavLM | varias | Igual | no disponible | Referenciados en el paper y repo `juice500ml/phonespam` |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint concreto de un grid experimental; el propio autor indica que no es el mejor modelo de la familia y remite a `wavlm-24-phonemodel`.
- El modelo está etiquetado para inglés (`en`); su uso con otras lenguas depende de restringir el vocabulario vía PHOIBLE y no está validado en la información disponible.
- Entrenado sobre TIMIT, un corpus pequeño y controlado; el rendimiento en audio espontáneo, ruidoso o con acentos no está documentado.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni agentes.
- Riesgo de errores en fronteras de segmentación y en fonemas con realizaciones acústicas variables; no hay métricas publicadas para cuantificarlo.
- La licencia MIT cubre el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en runtime bajo CC BY-SA 3.0, con obligaciones de atribución y compartir-igual que deben revisarse antes de uso comercial.
- Repo de 0.0 GB y sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.
- No se documentan sesgos demográficos o dialectales específicos, pero al entrenar sobre TIMIT (hablantes estadounidenses en condiciones controladas) es esperable un sesgo hacia esa variedad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-9-phonemodel
- Modelo base: https://huggingface.co/facebook/hubert-large-ll60k
- Mejor modelo de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper: https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
