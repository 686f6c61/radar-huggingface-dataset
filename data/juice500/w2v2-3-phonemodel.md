# juice500/w2v2-3-phonemodel

## Resumen

w2v2-3-phonemodel es un adaptador para segmentación y reconocimiento de fonemas construido sobre las características congeladas de wav2vec 2.0-large (facebook/wav2vec2-large-lv60), concretamente sobre la capa 3 del encoder. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la citación del paper) y aplica una técnica denominada Phonological Activation Mapping (SPAM), que proyecta cada frame del modelo auto-supervisado de voz (S3M) a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, stridencia, silabicidad, etc.). El resultado es una representación interpretable que dos cabezas —una de segmentación y otra de reconocimiento— explotan para producir segmentos temporales con etiqueta fonética.

El modelo forma parte de una rejilla encoder × capa del paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026); este checkpoint concreto corresponde al punto wav2vec 2.0-large, capa 3, y los propios autores lo describen como un punto de la rejilla, no como el mejor modelo de la familia (remiten a juice500/wavlm-24-phonemodel para el mejor resultado). Está pensado para investigación en fonética y fonología computacional, y para tareas de análisis de habla que requieran alineamiento a nivel de fonema en inglés.

Es relevante porque ofrece una vía ligera (adaptador sobre encoder congelado, sin fine-tuning del backbone) para obtener segmentación y reconocimiento fonético interpretable, con la posibilidad de restringir el vocabulario de salida al inventario PHOIBLE de cualquier idioma. La librería asociada (phonespam) encapsula el pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM (dos cabezas: segmentación y reconocimiento) sobre encoder wav2vec 2.0-large congelado, capa 3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; ventana efectiva no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (reconocimiento restringible a inventarios PHOIBLE de otros idiomas vía `vocab_for_language`) |
| Licencia | MIT (el modelo y el código); PHOIBLE 2.0 se descarga en runtime bajo CC BY-SA 3.0 |
| Formato de pesos | no disponible (cargable con `PhoneModel.from_pretrained` de la librería phonespam) |

## Arquitectura y entrenamiento

El modelo no entrena el backbone: parte de facebook/wav2vec2-large-lv60 congelado y extrae las representaciones de la capa 3. Sobre esas activaciones, SPAM genera un mapa de 43 rasgos fonológicos por frame (valores en [0, 1]), que actúa como representación intermedia interpretable. Dos cabezas leen de esa representación: una para segmentación (fronteras entre fonemas) y otra para reconocimiento (etiqueta fonética de cada segmento). El pipeline `transcribe` devuelve segmentos contiguos `Segment(start, end, label)` con tiempos en segundos.

El entrenamiento se realizó sobre el dataset timit-asr/timit_asr, según los metadatos de la model card. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset, ni si hubo etapas de ajuste adicionales (RLHF, DPO u otras), que en este tipo de tarea fonética no resultan habituales. La innovación técnica destacable es precisamente SPAM: convertir una representación opaca del encoder en un vector de rasgos fonológicos interpretables, y permitir restringir el vocabulario de reconocimiento a un inventario fonológico concreto (PHOIBLE) en tiempo de inferencia.

## Capacidades

- Segmentación de fonemas en audio de habla: devuelve fronteras temporales entre unidades fonéticas.
- Reconocimiento de fonemas: asigna una etiqueta a cada segmento producido por la cabeza de segmentación.
- Representación fonológica interpretable: `model.spam("utt.wav")` devuelve una matriz (frames, 43) de activaciones en [0, 1] con nombres de rasgo accesibles vía `spam.featnames` (por ejemplo "silence+", "syl+", "son+").
- Restricción de vocabulario por idioma: `vocab_for_language("deu")` limita la salida al inventario PHOIBLE del idioma indicado.
- Procesamiento de audio a 16 kHz.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del análisis fonético descrito.

## Casos de uso

- Investigación fonética y fonológica: extraer alineamientos a nivel de fonema de corpus de habla para estudiar fenómenos de coarticulación, elisión o duración vocálica, usando los tiempos de inicio y fin que devuelve `transcribe`.
- Análisis de rasgos fonológicos: emplear la matriz SPAM de 43 dimensiones para correlacionar rasgos como nasalidad o sonoridad con condiciones experimentales, sin necesidad de anotación manual frame a frame.
- Construcción de léxicos de pronunciación: generar transcripciones fonéticas automáticas de grabaciones en inglés para alimentar sistemas de síntesis o de reconocimiento posteriores.
- Docencia y materiales de pronunciación: producir alineamientos temporales de fonemas para herramientas que muestren al estudiante qué segmento se pronuncia en cada instante.
- Comparación de encoders S3M: al ser un punto de la rejilla encoder × capa, sirve para reproducir los experimentos del paper y comparar wav2vec 2.0-large capa 3 frente a otras combinaciones (por ejemplo, el checkpoint wavlm-24-phonemodel).
- Adaptación a otros inventarios fonológicos: usar `vocab_for_language` para probar el reconocimiento restringido a inventarios PHOIBLE de lenguas distintas del inglés, evaluando la transferibilidad del adaptador.
- Análisis exploratorio de corpus de habla a gran escala: el hecho de que el backbone esté congelado y el adaptador sea ligero facilita procesar muchas horas de audio con un coste de cómputo moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El backbone es wav2vec 2.0-large (aproximadamente 300 M de parámetros en el encoder), por lo que la inferencia en fp32 requiere del orden de 1,2 GB solo para pesos, más activaciones y el adaptador; una GPU con 4-8 GB debería ser suficiente en la práctica, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponible. El ejemplo de la model card menciona `device="cuda"` como opción.
- ¿Cabe en GPU de consumo? Con toda probabilidad sí, dado el tamaño del backbone, pero no se confirma en la información disponible.
- Opciones de despliegue: la vía documentada es la librería `phonespam` (`pip install phonespam`), con `PhoneModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de audio de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| w2v2-3-phonemodel | wav2vec 2.0-large | 3 | Segmentación y reconocimiento de fonemas | MIT | Hugging Face (juice500) |
| juice500/wavlm-24-phonemodel | WavLM | 24 | Segmentación y reconocimiento de fonemas (mejor modelo de la familia según los autores) | no disponible | Hugging Face (juice500) |
| Otros puntos de la rejilla encoder × capa del paper | wav2vec 2.0 / WavLM, distintas capas | varias | Segmentación y reconocimiento de fonemas | no disponible | Referenciados en el paper SLT 2026 |

No se dispone de datos de benchmarks que permitan comparar cuantitativamente estos checkpoints entre sí ni frente a alternativas externas.

## Limitaciones y advertencias

- Este checkpoint es un punto intermedio de la rejilla del paper; los propios autores remiten a juice500/wavlm-24-phonemodel como el mejor modelo de la familia.
- El idioma declarado es únicamente inglés; el uso con otros inventarios vía `vocab_for_language` es una funcionalidad de inferencia, no una garantía de rendimiento multilingüe.
- El reconocimiento fonético puede confundir fonemas acústicamente próximos; no se han publicado tasas de error en la información disponible.
- Riesgo de alucinación en el sentido de asignar etiquetas fonéticas a segmentos de ruido o silencio mal delimitados; la cabeza de segmentación puede producir fronteras imprecisas en habla solapada o con ruido de fondo.
- Sesgos: no documentados, pero al entrenar sobre TIMIT (corpus de habla inglesa con características demográficas y de grabación concretas) es esperable un sesgo hacia ese tipo de dominio y acento.
- Restricciones de licencia: el modelo y el código son MIT, pero `vocab_for_language` descarga PHOIBLE 2.0 en runtime, que está bajo CC BY-SA 3.0 y se licencia por separado; conviene revisar las obligaciones de atribución y share-alike si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar disponibles o que el repo es meramente de referencia; conviene verificar antes de integrarlo en producción.
- No se documentan cuantizaciones ni formatos de pesos alternativos, lo que limita opciones de despliegue en entornos sin la librería phonespam.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-3-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Mejor modelo de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
