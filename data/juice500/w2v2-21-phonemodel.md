# juice500/w2v2-21-phonemodel

## Resumen

w2v2-21-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre el codificador congelado facebook/wav2vec2-large-lv60 (wav2vec 2.0-large). Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la citación del paper) y aplica la técnica SPAM (S3M-based Phonological Activation Mapping), que proyecta cada fotograma del codificador a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, etc.) en lugar de operar directamente sobre representaciones opacas.

El modelo es un punto concreto de la rejilla codificador x capa del paper: usa la capa 21 del wav2vec 2.0-large a 16 kHz. No es un modelo de propósito general, sino un componente especializado para obtener transcripciones a nivel de fonema con marcas temporales, útil en fonética, fonología computacional y evaluación de pronunciación.

Su relevancia radica en que convierte un S3M congelado en una representación interpretable y reutilizable para la segmentación y el reconocimiento de fonemas, con licencia MIT y una librería propia (`phonespam`) que encapsula todo el pipeline. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos del adaptador son ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre wav2vec 2.0-large congelado (transformer convolucional + atención), capa 21, SPAM |
| Parametros totales | no disponible (adaptador ligero; el codificador base wav2vec 2.0-large tiene ~317 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz por fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); admite vocabularios PHOIBLE para otros idiomas vía `vocab_for_language` |
| Licencia | MIT (PHOIBLE 2.0 se descarga aparte bajo CC BY-SA 3.0) |
| Formato de pesos | no disponible (librería `phonespam`; repo de 0.0 GB) |

## Arquitectura y entrenamiento

El modelo no entrena el codificador: parte de facebook/wav2vec2-large-lv60 congelado y aprende un mapeo desde las activaciones de la capa 21 hasta un vector de 43 rasgos fonológicos (SPAM). Sobre esa representación interpretable operan dos cabezas, una de segmentación y otra de reconocimiento, que producen segmentos contiguos con etiqueta y tiempos en segundos.

El entrenamiento se realizó sobre el dataset timit-asr/timit_asr según las etiquetas declaradas en la model card. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF/DPO. La innovación técnica destacable es precisamente SPAM: transformar una representación latente opaca en un espacio de rasgos fonológicos interpretables, lo que permite además restringir la decodificación al inventario fonológico de un idioma concreto mediante PHOIBLE.

## Capacidades

- Segmentación fonética con marcas temporales de inicio y fin por segmento.
- Reconocimiento de fonemas a partir de audio a 16 kHz.
- Representación intermedia interpretable de 43 rasgos fonológicos en el rango [0, 1] (`model.spam(...)`).
- Restricción del vocabulario de reconocimiento a inventarios PHOIBLE por idioma (`vocab_for_language`).
- Procesamiento de audio en inglés como idioma declarado.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Investigación fonética y fonológica: extraer alineamientos a nivel de fonema con tiempos para analizar fenómenos como asimilación o elisión en corpus de habla.
- Evaluación de pronunciación: comparar la secuencia de fonemas reconocida con una referencia para detectar sustituciones u omisiones en aprendices de inglés.
- Anotación automática de corpus de habla: preetiquetar segmentos fonéticos antes de una revisión manual, reduciendo el coste de anotación.
- Análisis de rasgos fonológicos: usar la salida SPAM de 43 dimensiones para estudiar correlatos acústicos de rasgos como nasalidad o estridencia.
- Sistemas de búsqueda por unidades subléxicas: indexar audio por fonemas para recuperación de fragmentos concretos en archivos largos.
- Docencia y materiales de fonética: generar transcripciones alineadas para ilustrar la relación entre señal acústica y unidades fonológicas.
- Adaptación multilingüe exploratoria: reutilizar el modelo con vocabularios PHOIBLE de otros idiomas, asumiendo la degradación esperable fuera del inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el codificador base wav2vec 2.0-large (~317 M de parámetros) requiere del orden de 1-2 GB en fp16 para inferencia, y el adaptador añade una carga marginal.
- GPU recomendadas: no especificadas por el autor; por tamaño del codificador, una GPU con 4-8 GB de VRAM es suficiente.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060 y superiores), aunque no hay confirmación oficial.
- Opciones de despliegue: librería `phonespam` (pip install phonespam), con soporte de `device="cuda"`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| w2v2-21-phonemodel | wav2vec 2.0-large | 21 | en | MIT | SPAM sobre S3M congelado |
| juice500/wavlm-24-phonemodel | WavLM | 24 | no disponible | no disponible | SPAM; el autor lo señala como el mejor modelo de la serie |
| facebook/wav2vec2-large-lv60 | wav2vec 2.0-large | n/a | en | no disponible | Codificador base, sin cabezas fonéticas |

## Limitaciones y advertencias

- Solo declara inglés como idioma; el uso con otros idiomas vía PHOIBLE es una extensión no validada en la información disponible.
- Riesgo de alucinación y errores de etiquetado en fonemas ante audio ruidoso, acentos no vistos o solapamiento de hablantes; no hay métricas publicadas que lo cuantifiquen.
- El modelo es un punto concreto de la rejilla codificador x capa; el propio autor remite a wavlm-24-phonemodel como mejor opción, por lo que este no debe tomarse como el modelo de referencia de la serie.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, con licencia CC BY-SA 3.0 distinta de la MIT del modelo; conviene revisar obligaciones de atribución y compartición.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación comunitaria.
- No se documentan cuantizaciones ni formatos de pesos alternativos, lo que limita opciones de despliegue fuera de la librería `phonespam`.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-21-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Codificador base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: timit-asr/timit_asr
- PHOIBLE: https://phoible.org
