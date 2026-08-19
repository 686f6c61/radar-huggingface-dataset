# DariusTheGeek/waxal-joint-ctc-1b-lid

## Resumen

El modelo `waxal-joint-ctc-1b-lid` es un sistema de reconocimiento automático del habla (ASR) bilingüe desarrollado por DariusTheGeek como parte de la solución WAXAL ASR. Se trata de un fine-tuning del modelo base `facebook/omniASR-CTC-1B` (v2) entrenado conjuntamente para dos lenguas africanas: lingala (ln) y shona (sn). Su característica principal es que no utiliza ninguna etiqueta, prompt o embedding de idioma durante la decodificación; en su lugar, un clasificador de identificación de idioma basado en texto (TF-IDF con n-gramas de caracteres y regresión logística) enruta la transcripción generada hacia el decodificador específico de cada lengua. Este diseño permite que un único modelo sirva a ambos idiomas, simplificando el pipeline de inferencia y reduciendo la necesidad de múltiples modelos especializados.

El modelo se distribuye junto con un clasificador de idioma entrenado exclusivamente sobre transcripciones doradas del conjunto de entrenamiento de WAXALNLP (32.328 filas), nunca sobre salidas del modelo ni datos de prueba. El repositorio incluye el checkpoint del modelo en formato PyTorch (3,9 GB), el tokenizador compartido, el clasificador serializado en joblib y los archivos de configuración para fairseq2. La licencia es Apache 2.0, heredada del modelo padre. Con cero descargas y cero likes en el momento de su publicación, es un modelo reciente orientado a la investigación y a aplicaciones de ASR para lenguas de África subsahariana con pocos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza CTC (basado en OmniASR CTC-1B v2) |
| Parametros totales | 1B (nominal, según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en bfloat16) |
| Idiomas soportados | Lingala (ln), Shona (sn) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (model.pt, fairseq2) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OmniASR CTC-1B de Meta, un sistema de reconocimiento de voz que emplea un encoder transformer con una cabeza de clasificación temporal conexionista (CTC). En esta variante conjunta, el encoder, la cabeza CTC y el tokenizador son compartidos entre ambos idiomas; no existe ningún mecanismo de condicionamiento por idioma (ni etiqueta, ni prompt, ni embedding). El entrenamiento se realizó sobre el dataset `google/WaxalNLP`, un corpus de habla para 21 lenguas subsaharianas, utilizando únicamente las particiones de lingala y shona. Se aplicó fine-tuning al checkpoint oficial v2 de OmniASR-CTC-1B con seed 42, paralelismo DDP con world size 4, batch efectivo de 32 (2 por GPU × 4 acumulaciones × 4 GPUs), y un total de 4.044 actualizaciones, liberando el checkpoint en el paso 3033. El pico de learning rate fue de 1.0e-5 con un programa tri-stage (0.1/0.4/0.5), y se usó precisión bfloat16 con activation checkpointing en cada capa.

El clasificador de identificación de idioma, por su parte, es un modelo de regresión logística sobre características TF-IDF de n-gramas de caracteres de 3 a 5, entrenado únicamente con las transcripciones doradas del conjunto de entrenamiento. En inferencia, el pipeline decodifica el audio sin condicionamiento de idioma, obtiene una hipótesis de texto, y el clasificador decide si esa hipótesis corresponde a lingala o shona, enrutando después a los decodificadores específicos de cada lengua (que no forman parte de este repositorio).

## Capacidades

- Reconocimiento automático del habla para lingala y shona, con una única pasada de decodificación para ambos idiomas.
- Identificación de idioma integrada mediante clasificador de texto, que asigna cada transcripción a lingala o shona.
- Soporte para inferencia por lotes sobre archivos de audio en formato WAV (a través del CLI de la solución WAXAL).
- Compatible con fairseq2 para carga y ejecución del modelo ASR.
- Clasificador serializado en joblib, fácilmente integrable en pipelines de Python (requiere scikit-learn 1.5.2).
- No incluye capacidades de tool calling, agentes, visión ni generación de texto; es exclusivamente un sistema de ASR y LID.

## Casos de uso

- Transcripción automática de reuniones o entrevistas en lingala y shona: el modelo puede procesar grabaciones de audio y generar transcripciones sin necesidad de conocer previamente el idioma de cada clip, gracias al enrutamiento automático.
- Archivado y búsqueda de contenido audiovisual: al transcribir y etiquetar el idioma, se facilita la indexación de vídeos o podcasts en estas lenguas para su posterior búsqueda por texto.
- Sistemas de subtitulado automático: el modelo puede generar subtítulos en tiempo real o diferido para vídeos en lingala o shona, con la ventaja de que un solo modelo cubre ambos idiomas.
- Análisis de opinión y minería de texto a partir de audio: las transcripciones generadas pueden alimentar pipelines de NLP para análisis de sentimiento o extracción de temas en estos idiomas.
- Asistentes de voz para servicios públicos: en regiones donde se hablan lingala y shona, el modelo puede servir como backend de reconocimiento para aplicaciones de atención ciudadana o información gubernamental.
- Evaluación de calidad de ASR en lenguas de bajos recursos: al ser un modelo abierto y ligero, puede utilizarse como referencia en investigaciones sobre reconocimiento de voz para lenguas africanas, comparando su rendimiento con otros enfoques.

## Benchmarks y rendimiento

Los resultados oficiales declarados en la model card se presentan a continuación. Se trata de métricas sobre la partición de validación held-out del dataset WaxalNLP, agrupada por idioma y de forma conjunta.

| Split | CER | WER |
|---|---|---|
| Pooled (Lingala + Shona) | 0.0885 | 0.3280 |
| Lingala | 0.1345 | 0.3579 |
| Shona | 0.0492 | 0.2894 |

Estos valores indican que el modelo conjunto es más débil que los modelos específicos por idioma a los que enruta (según la propia model card). Su propósito principal es servir como mecanismo de identificación de idioma y decodificación unificada, no como el mejor ASR posible para cada lengua.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni de GPU en la información disponible.
- El checkpoint del modelo pesa 3,9 GB, lo que sugiere que en bfloat16 (2 bytes por parámetro) el modelo ocupa aproximadamente 3,9 GB en memoria, requiriendo al menos 4 GB de VRAM para inferencia en ese formato.
- Al ser un modelo de 1B de parámetros, es plausible que quepa en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB) con cuantización o sin ella, pero no hay confirmación oficial.
- Para despliegue, el repositorio ofrece un CLI basado en fairseq2 y un script de instalación; no se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- La inferencia se realiza en modo batch-size 1, según indica el CLI de la solución, lo que limita el throughput pero simplifica el enrutamiento.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (ASR para lenguas africanas). El modelo base `facebook/omniASR-CTC-1B` es el punto de partida, pero no se han publicado métricas comparativas entre ambos en esta ficha. Tampoco se conocen otros modelos bilingües lingala-shona con características similares. Por tanto, la comparativa se limita a señalar que este modelo es un fine-tuning del mencionado base, con la particularidad de no usar etiquetas de idioma.

## Limitaciones y advertencias

- El modelo es más débil en CER y WER que los modelos específicos por idioma a los que enruta; su valor reside en la unificación y el enrutamiento, no en el rendimiento ASR puro.
- El clasificador de idioma se entrenó exclusivamente con transcripciones doradas del conjunto de entrenamiento, lo que puede provocar errores de clasificación cuando la hipótesis de ASR contiene errores de transcripción.
- La dependencia del clasificador implica que un error en la identificación del idioma degrada la calidad final, ya que la transcripción se enviaría al decodificador equivocado.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus concreto (WaxalNLP), puede presentar limitaciones en acentos, dialectos o condiciones acústicas fuera de ese dominio.
- Riesgo de alucinación: como todo sistema ASR, puede generar transcripciones incorrectas, especialmente en condiciones de ruido o con habla no nativa.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del dataset WAXALNLP (aunque el modelo lo hereda del padre, no se especifica una restricción adicional).
- El clasificador requiere scikit-learn 1.5.2 específicamente; versiones posteriores pueden romper la compatibilidad del archivo joblib.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/DariusTheGeek/waxal-joint-ctc-1b-lid)
- [Repositorio del proyecto WAXAL ASR solution en GitHub](https://github.com/DariusTheGeek/waxal-asr-solution)
- [Blog de Google sobre el dataset WAXAL](https://blog.google/intl/en-africa/company-news/outreach-and-initiatives/introducing-waxal-a-new-open-dataset-for-african-speech-technology/)
- [Paper de WAXAL en arXiv](https://arxiv.org/html/2602.02734v3)
- [Repositorio de OmniASR de Meta](https://github.com/facebookresearch/omnilingual-asr)
