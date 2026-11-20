# juice500/xls-r-24-phonemodel

## Resumen

xls-r-24-phonemodel es un modelo de segmentación y reconocimiento fonético desarrollado por juice500 (Shikhar Bharadwaj y colaboradores) que se aplica sobre las representaciones congeladas de un modelo auto-supervisado de habla (S3M). En concreto, utiliza la capa 24 del encoder facebook/wav2vec2-xls-r-300m, que procesa audio a 16 kHz, y lo combina con la técnica SPAM (S3M-based Phonological Activation Mapping) descrita en el artículo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026).

El modelo resuelve un problema clásico en fonética computacional: obtener fronteras temporales y etiquetas de fonemas a partir de audio sin entrenar un sistema específico desde cero. SPAM transforma cada frame del encoder en un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, etc.), lo que convierte una representación opaca en una interpretable y permite segmentar y clasificar fonemas con una única arquitectura ligera.

Es relevante porque demuestra que los S3M congelados contienen información fonética explotable sin fine-tuning del encoder, y porque publica el pipeline completo como paquete Python (`phonespam`) con licencia MIT. Este checkpoint concreto es un punto de la rejilla encoder × capa del artículo; el autor indica que el mejor modelo de esa rejilla es `juice500/wavlm-24-phonemodel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter SPAM sobre encoder Transformer wav2vec2-XLS-R-300m congelado (capa 24) |
| Parametros totales | no disponible (el encoder base XLS-R-300m tiene ~300 M; el adaptador SPAM no reporta cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio a 16 kHz; ventana dependiente del encoder base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (el vocabulario de fonemas puede restringirse a inventarios PHOIBLE de otras lenguas vía `vocab_for_language`) |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 se descarga aparte bajo CC BY-SA 3.0) |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `PhoneModel.from_pretrained`) |

## Arquitectura y entrenamiento

El modelo no entrena el encoder: utiliza facebook/wav2vec2-xls-r-300m congelado y extrae las activaciones de la capa 24 sobre audio de 16 kHz. Sobre esas representaciones, SPAM proyecta cada frame a un vector de 43 dimensiones de activaciones fonológicas en el rango [0, 1] (nombres como "silence+", "syl+", "son+"), que actúan como representación intermedia interpretable. Dos cabezas leen de esa representación: una para segmentación (fronteras temporales) y otra para reconocimiento (etiqueta de fonema).

El entrenamiento se realizó sobre el dataset timit-asr/timit_asr, según los metadatos del repositorio. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de fonética). La innovación técnica destacable es precisamente el mapeo a rasgos fonológicos: convierte la salida del encoder en un espacio con significado lingüístico, lo que permite restringir la decodificación a inventarios fonológicos concretos mediante `vocab_for_language` y PHOIBLE.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos `Segment(start, end, label)` con tiempos en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético.
- Representación fonológica interpretable: `model.spam("utt.wav")` devuelve una matriz (frames, 43) de activaciones en [0, 1] con nombres de rasgo accesibles vía `spam.featnames`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la decodificación al inventario PHOIBLE de esa lengua.
- Procesamiento de audio a 16 kHz mediante el encoder XLS-R-300m.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado en fonética.
- No soporta visión, audio generativo ni modo "thinking".
- Capacidad multilingüe limitada: el modelo está etiquetado para inglés, aunque el vocabulario de salida puede adaptarse a otros inventarios PHOIBLE.

## Casos de uso

- Anotación fonética de corpus: generar alineaciones a nivel de fonema con marcas temporales para corpus de habla, sustituyendo parte del trabajo manual de etiquetado en lingüística de corpus.
- Investigación en fonética y fonología: usar la matriz SPAM de 43 rasgos para estudiar correlatos acústicos de sonoridad, nasalidad o estridencia sin entrenar modelos propios.
- Evaluación de pronunciación: comparar la secuencia de fonemas reconocida con una referencia para detectar sustituciones u omisiones en aprendices de inglés.
- Análisis de habla patológica: segmentar y etiquetar fonemas en grabaciones clínicas para cuantificar fenómenos de elisión o distorsión.
- Docencia de fonética: apoyar la transcripción asistida en asignaturas de fonética con el demo de Streamlit y el paquete `phonespam`.
- Adaptación a otras lenguas: restringir la salida al inventario PHOIBLE de una lengua concreta (`vocab_for_language`) para experimentos comparativos entre inventarios fonológicos.
- Preprocesado para pipelines de TTS o ASR: obtener fronteras fonéticas para alinear datos de entrenamiento o construir léxicos de pronunciación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de phone error rate (PER) ni comparaciones numéricas con otros sistemas; solo remite al artículo para la evaluación completa de la rejilla encoder × capa.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el encoder base XLS-R-300m (~300 M de parámetros) es ligero y cabe holgadamente en GPU de consumo, pero el adaptador SPAM no reporta tamaño.
- GPU recomendadas: cualquier GPU con suficiente memoria para el encoder base; el paquete permite `device="cuda"`. No se especifican modelos concretos (A100, H100, RTX 4090).
- GPU de consumo: previsiblemente sí, dado el tamaño del encoder base, aunque no hay cifras publicadas.
- Opciones de despliegue: paquete Python `phonespam` (`pip install phonespam`) y demo en Streamlit (phonespam.streamlit.app). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/xls-r-24-phonemodel | Encoder XLS-R-300m + adaptador SPAM | no disponible | Segmentación y reconocimiento fonético | MIT | Hugging Face + paquete `phonespam` |
| juice500/wavlm-24-phonemodel | Encoder WavLM + adaptador SPAM | no disponible | Segmentación y reconocimiento fonético | no disponible | Hugging Face (indicado como el mejor de la rejilla) |
| facebook/wav2vec2-xls-r-300m | ~300 M | no disponible | Representaciones auto-supervisadas de habla | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint es un punto de la rejilla encoder × capa del artículo; el autor recomienda `juice500/wavlm-24-phonemodel` como mejor modelo, por lo que este no es la opción óptima de la familia.
- Idioma principal: inglés; el uso con otras lenguas depende de restringir el vocabulario vía PHOIBLE y no está validado en la model card.
- Riesgo de error en fronteras y etiquetas fonéticas en habla ruidosa, solapada o con acentos no representados en TIMIT.
- El vocabulario PHOIBLE 2.0 se descarga en tiempo de ejecución y tiene licencia CC BY-SA 3.0, distinta de la MIT del modelo; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye.
- Sin datos publicados de cuantización, latencia ni benchmarks: no es posible estimar con precisión el coste en producción a partir de la información disponible.
- No es un modelo generativo ni un asistente: no soporta tool calling, agentes ni conversación; usarlo fuera de tareas fonéticas no está justificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-24-phonemodel
- Modelo recomendado de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Encoder base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Artículo (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
