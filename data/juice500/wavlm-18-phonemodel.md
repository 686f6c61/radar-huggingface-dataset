# juice500/wavlm-18-phonemodel

## Resumen

wavlm-18-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de WavLM-large, un modelo auto-supervisado de voz de Microsoft. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la citación del paper) y se publica como un punto concreto de la rejilla encoder × capa descrita en el artículo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). En concreto, utiliza la capa 18 del encoder sobre audio a 16 kHz.

El modelo implementa SPAM (S3M-based Phonological Activation Mapping), una técnica que proyecta cada frame de representación del encoder en un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, stridencia, entre otros). Esto convierte una representación opaca del encoder en una representación interpretable y reutilizable para dos tareas: segmentación telefónica (localizar fronteras entre fonos) y reconocimiento telefónico (asignar una etiqueta a cada segmento).

Su relevancia es metodológica: demuestra que un encoder congelado de voz auto-supervisado, sin ajuste fino, puede alimentar cabezas fonológicas ligeras y producir transcripciones telefónicas con tiempos en segundos. No es el mejor punto de la rejilla según el propio autor (remite a wavlm-24-phonemodel), pero sí una variante concreta y reproducible dentro de una familia de adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre WavLM-large congelado (transformer auto-supervisado); capa 18 del encoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; ventana no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); reconocimiento restringible a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en tiempo de ejecución es CC BY-SA 3.0) |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía librería `phonespam`) |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. Por un lado, WavLM-large actúa como extractor de características congelado: es un transformer auto-supervisado entrenado sobre audio de voz a 16 kHz, y este adaptador consume específicamente su capa 18. Por otro, una proyección SPAM mapea cada frame del encoder a un vector de 43 activaciones fonológicas en el rango [0, 1], con nombres de rasgo accesibles (`silence+`, `syl+`, `son+`, etc.). Sobre esa representación leen dos cabezas: una de segmentación y otra de reconocimiento.

El entrenamiento se realiza sobre el corpus TIMIT (dataset `timit-asr/timit_asr`), en inglés. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este contexto). La innovación técnica central es precisamente SPAM: sustituir el ajuste fino del encoder por una interpretación fonológica explícita de sus activaciones, lo que permite inspeccionar la representación intermedia y restringir el espacio de etiquetas a inventarios fonológicos externos.

## Capacidades

- Segmentación telefónica: devuelve segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento telefónico: asigna una etiqueta fonética a cada segmento detectado.
- Representación fonológica interpretable: expone un tensor de (frames, 43) activaciones en [0, 1] con nombres de rasgo consultables.
- Restricción de vocabulario por lengua: `vocab_for_language` permite limitar el reconocimiento al inventario PHOIBLE de una lengua concreta (por ejemplo, `deu`).
- Procesamiento de audio a 16 kHz.
- Ejecución en CPU o GPU (`device="cuda"`).
- No soporta tool calling, agentes, visión, audio generativo ni modo de razonamiento: es un modelo discriminativo de fonética.

## Casos de uso

- Anotación fonética de corpus: generar alineaciones telefónicas con marcas temporales sobre grabaciones en inglés para entrenar o evaluar sistemas posteriores, aprovechando la salida `Segment(start, end, label)`.
- Investigación en fonética y fonología: analizar las activaciones SPAM por rasgo (sonoridad, nasalidad, stridencia) para estudiar qué información fonológica codifica la capa 18 de WavLM-large.
- Evaluación de encoders auto-supervisados: usar este adaptador como sonda ligera para comparar capas y encoders dentro de la rejilla encoder × capa del paper.
- Preprocesamiento para reconocimiento de voz: producir una capa intermedia de segmentos telefónicos que alimente un sistema ASR o un modelo acústico posterior.
- Docencia y demostraciones: el demo de Streamlit y la API de una línea permiten ilustrar segmentación y reconocimiento fonético en clase sin infraestructura pesada.
- Adaptación a otras lenguas vía inventario: restringir el reconocimiento con `vocab_for_language` para experimentos con inventarios PHOIBLE distintos del inglés, asumiendo que el adaptador se entrenó sobre TIMIT en inglés.
- Detección de rasgos acústicos concretos: usar las activaciones SPAM como características de entrada para tareas posteriores que dependan de sonoridad o nasalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de frontera (por ejemplo, precision/recall de segmentación) ni tasas de error telefónico, y remite al paper para la comparación completa de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador es ligero, pero depende de WavLM-large congelado, cuyo peso exacto no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. La API admite `device="cuda"`, sin indicar modelos concretos.
- Viabilidad en GPU de consumo: no confirmada; al tratarse de un adaptador sobre un encoder congelado es plausible, pero no hay datos publicados.
- Opciones de despliegue: paquete `phonespam` (`pip install phonespam`), con `PhoneModel.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| juice500/wavlm-18-phonemodel | WavLM-large | 18 | Segmentación y reconocimiento telefónico | MIT | Punto de la rejilla; el autor remite a la variante 24 como mejor modelo |
| juice500/wavlm-24-phonemodel | WavLM-large | 24 | Segmentación y reconocimiento telefónico | no disponible | Mejor punto de la rejilla según la model card |
| microsoft/wavlm-large | WavLM-large | n/a | Representación auto-supervisada de voz | no disponible | Encoder base congelado; no realiza segmentación ni reconocimiento por sí mismo |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre TIMIT, un corpus de inglés; el rendimiento fuera del inglés no está documentado aunque se permita restringir el vocabulario con PHOIBLE.
- Es un punto concreto de la rejilla y el propio autor indica que no es el mejor modelo de la familia (remite a wavlm-24-phonemodel).
- Repo de 0.0 GB y cero descargas: no hay evidencia de uso en producción ni validación externa.
- Riesgo de errores en fronteras telefónicas y en etiquetas, especialmente en habla espontánea o con ruido; no se publican métricas de error.
- La licencia MIT cubre el modelo, pero `vocab_for_language` descarga PHOIBLE 2.0 (CC BY-SA 3.0) en tiempo de ejecución, con obligaciones de atribución y compartir igual para ese recurso.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso.
- No hay información sobre cuantizaciones, formatos de pesos ni latencias, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-18-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Encoder base: https://huggingface.co/microsoft/wavlm-large
- Paper: https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: timit-asr/timit_asr
- PHOIBLE: https://phoible.org
