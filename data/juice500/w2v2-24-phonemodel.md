# juice500/w2v2-24-phonemodel

## Resumen

w2v2-24-phonemodel es un adaptador (adapter) sobre el codificador auto-supervisado `facebook/wav2vec2-large-lv60` que realiza segmentación y reconocimiento de fonemas a partir de activaciones fonológicas. Lo desarrolla el autor identificado como juice500 (proyecto phonespam, con autores académicos en la publicación asociada) y se publica como un punto concreto de la rejilla codificador x capa estudiada en el artículo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). En lugar de predecir fonemas directamente sobre las representaciones del codificador, el método SPAM mapea cada frame a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, etc.), lo que hace interpretable la representación interna y permite restringir la decodificación a inventarios fonológicos concretos.

El modelo usa la capa 24 del wav2vec 2.0-large, trabaja a 16 kHz y está entrenado sobre TIMIT-ASR. Es relevante porque ofrece una vía ligera (adaptador sobre un S3M congelado) para obtener alineamientos fonéticos y transcripciones a nivel de fonema, una tarea clásica en fonética computacional, evaluación de pronunciación y estudios de interpretabilidad de modelos de voz. El autor indica explícitamente que este checkpoint no es el mejor de la rejilla; remite a `juice500/wavlm-24-phonemodel` como la variante recomendada.

La ficha se basa únicamente en la información disponible en la model card y en los metadatos de Hugging Face; muchos datos técnicos (recuento exacto de parámetros del adaptador, receta de entrenamiento, benchmarks) no están publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre wav2vec 2.0-large (S3M congelado), capa 24, con cabecera de segmentación y cabecera de reconocimiento sobre activaciones fonológicas SPAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; ventana dependiente de la implementación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); reconocimiento restringible a otros inventarios PHOIBLE mediante `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; integración vía librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado de cero, sino un adaptador que se apoya en las representaciones congeladas de `facebook/wav2vec2-large-lv60`. La entrada de audio a 16 kHz se procesa con el codificador preentrenado y se toma la activación de la capa 24; sobre ella se calcula el mapa SPAM, un vector de 43 activaciones de rasgos fonológicos en el rango [0, 1] por frame (nombres como `silence+`, `syl+`, `son+`, etc.). Dos cabeceras leen de esa representación: una de segmentación (fronteras entre fonemas) y otra de reconocimiento (etiqueta de fonema). El pipeline `transcribe` devuelve segmentos contiguos con tiempos en segundos.

El entrenamiento se realizó sobre el dataset TIMIT-ASR (`timit-asr/timit_asr`), según los metadatos. No se detallan en la información disponible el número de tokens/horas, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales, RLHF o DPO. La innovación técnica central es el propio mapeo SPAM: convertir una representación opaca del codificador en un espacio de rasgos fonológicos interpretables, lo que además permite condicionar la decodificación a un inventario fonológico concreto (por ejemplo, `vocab_for_language("deu")` para alemán vía PHOIBLE 2.0).

## Capacidades

- Segmentación de fonemas en audio: detección de fronteras entre unidades fonéticas con marcas temporales.
- Reconocimiento de fonemas: etiquetado de cada segmento con un símbolo fonético.
- Representación fonológica interpretable: salida SPAM de 43 dimensiones por frame con nombres de rasgos.
- Restricción de vocabulario fonético por idioma mediante inventarios PHOIBLE (`vocab_for_language`), lo que permite adaptar el reconocimiento a lenguas distintas del inglés.
- Procesamiento de audio a 16 kHz con el codificador wav2vec 2.0-large.
- Integración como librería Python (`phonespam`) con API `PhoneModel.from_pretrained` y `transcribe`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Análisis fonético y lingüístico: obtener alineamientos a nivel de fonema de grabaciones TIMIT o corpus propios para estudios de fonética y fonología, con la ventaja de disponer de rasgos interpretables (nasalidad, sonoridad, etc.) por frame.
- Evaluación de pronunciación en aprendizaje de idiomas: comparar la secuencia de fonemas reconocida con la esperada para detectar sustituciones u omisiones, usando las marcas temporales para señalar el punto exacto del error.
- Investigación en interpretabilidad de modelos de voz: analizar qué rasgos fonológicos codifica la capa 24 de wav2vec 2.0-large, ya que el propio modelo expone el mapa SPAM con nombres de rasgo.
- Preprocesado para pipelines de ASR: generar transcripciones fonéticas y segmentaciones que sirvan como features o como supervisión auxiliar en sistemas posteriores.
- Análisis de corpus multilingüe con inventarios restringidos: aplicar `vocab_for_language` para limitar la salida al inventario PHOIBLE de una lengua concreta y estudiar su comportamiento en datos no ingleses.
- Docencia y demostraciones: el demo público en Streamlit permite ilustrar segmentación y reconocimiento fonético sin infraestructura propia.
- Detección de spam telefónico (tag `spam`): el modelo puede emplearse como extractor de rasgos fonéticos en un pipeline de clasificación de llamadas, aunque no se documenta un clasificador de spam específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un adaptador sobre wav2vec 2.0-large, el coste dominante es el del codificador base (varios cientos de millones de parámetros), pero no se han publicado cifras concretas.
- GPU recomendadas: no disponible; la API admite `device="cuda"` y también ejecución en CPU.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; por el tamaño típico de wav2vec 2.0-large es plausible en GPUs consumer modernas, pero no se aportan datos.
- Opciones de despliegue: librería `phonespam` (instalable con `pip install phonespam`), demo en Streamlit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| juice500/w2v2-24-phonemodel | wav2vec2-large-lv60 | 24 | Segmentación y reconocimiento de fonemas vía SPAM | MIT | Checkpoint de la rejilla; el autor indica que no es el mejor |
| juice500/wavlm-24-phonemodel | WavLM (según nombre) | 24 | Segmentación y reconocimiento de fonemas vía SPAM | no disponible | Recomendado por el autor como mejor modelo |
| facebook/wav2vec2-large-lv60 | wav2vec 2.0-large | — | Representaciones auto-supervisadas de voz (base) | no disponible en esta ficha | Modelo base; no realiza segmentación fonética por sí mismo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que este checkpoint es solo un punto de la rejilla codificador x capa y que no es el mejor modelo; para uso práctico recomienda `juice500/wavlm-24-phonemodel`.
- Entrenado sobre TIMIT-ASR, un corpus inglés y de dominio limitado; el rendimiento fuera de ese dominio (ruido, acentos, otras lenguas) no está documentado.
- El reconocimiento está pensado para inglés por defecto; el uso con otros idiomas requiere restringir el vocabulario con `vocab_for_language`, y no se aportan métricas de calidad en esos casos.
- Riesgo de alucinación y errores de etiquetado fonético no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de error.
- La funcionalidad `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo licencia CC BY-SA 3.0, distinta de la MIT del modelo; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye.
- El repositorio tiene un tamaño de 0.0 GB y 0 descargas, lo que sugiere un artefacto muy reciente o de bajo uso; no hay evidencia de comunidad ni de mantenimiento a largo plazo.
- No se documentan cuantizaciones, formatos de pesos alternativos ni soporte de frameworks de despliegue a gran escala, lo que limita su uso en producción de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-24-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Variante recomendada por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
