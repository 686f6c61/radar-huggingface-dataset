# phate334/Breeze-ASR-25-int8-CT2

## Resumen

El modelo `phate334/Breeze-ASR-25-int8-CT2` es una conversión a formato CTranslate2 con pesos cuantizados a int8 del modelo `MediaTek-Research/Breeze-ASR-25`, un sistema de reconocimiento automático del habla (ASR) desarrollado por MediaTek Research. Breeze-ASR-25 se basa en Whisper-large-v2 y está específicamente optimizado para el mandarín taiwanés, el chino tradicional y escenarios de code-switching entre chino e inglés, tanto a nivel intraoracional como interoracional. Además, incorpora mejoras en la alineación temporal, lo que lo hace especialmente adecuado para tareas de subtitulado automático.

Esta versión int8 de CTranslate2 permite cargar el modelo con la librería `faster-whisper`, ofreciendo una inferencia más rápida y con menor uso de memoria en comparación con el modelo original en precisión completa. El repositorio ocupa 1.6 GB y está publicado bajo licencia Apache-2.0, lo que facilita su uso en aplicaciones comerciales y de investigación. El modelo no ha sido fine-tuneado adicionalmente respecto al original; es una conversión directa del artefacto de MediaTek Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large-v2 (fine-tuned) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (derivado de Whisper, típicamente 30 segundos de audio) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (binario) |

## Arquitectura y entrenamiento

Breeze-ASR-25 es un modelo de reconocimiento de voz basado en la arquitectura encoder-decoder de Whisper-large-v2, con aproximadamente 1550 millones de parámetros en su versión original (aunque este dato no se especifica en la información proporcionada). El modelo fue fine-tuneado por MediaTek Research utilizando un framework de auto-refinamiento que emplea datos sintetizados por TTS para mejorar el rendimiento en mandarín taiwanés y en situaciones de code-switching chino-inglés. Según el paper asociado (arXiv:2506.11130), se adopta una estrategia de "unified mix embedding" para la decodificación, optimizando la mezcla de idiomas dentro de una misma frase o entre frases consecutivas.

La conversión a CTranslate2 int8 no implica ningún cambio en la arquitectura ni en los pesos originales; simplemente se transforma el modelo a un formato optimizado para inferencia con `faster-whisper`. No se dispone de detalles adicionales sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (ASR) para mandarin taiwanes y chino tradicional.
- Soporte de code-switching chino-ingles, tanto intraoracional (cambios dentro de una misma frase) como interoracional (cambios entre frases).
- Mejora en la alineacion temporal de los segmentos transcritos, util para subtitulado y doblaje.
- Compatibilidad con la libreria `faster-whisper` (version 1.2.1 o superior) y con CTranslate2 4.8.1.
- Inferencia en CPU y GPU, con soporte para `compute_type` int8 e int8_float16 en GPUs con FP16.
- Deteccion automatica de idioma (chino o ingles) con probabilidad asociada.

## Casos de uso

- Subtitulado automatico de videos en chino mandarin o con mezcla chino-ingles: gracias a la alineacion temporal mejorada, el modelo puede generar subtitulos con marcas de tiempo precisas, lo que lo hace adecuado para plataformas de video, streaming o postproduccion.
- Transcripcion de reuniones y conferencias bilingues: en entornos donde los participantes alternan entre chino e ingles, el modelo mantiene la coherencia linguistica sin perder contexto.
- Atencion al cliente automatizada en centros de soporte que operan en Taiwan o con clientes bilingues: el modelo puede transcribir llamadas en tiempo real para su posterior analisis o para alimentar sistemas de IA conversacional.
- Generacion de actas o resumenes de audio en contextos academicos o empresariales: la transcripcion fiable permite procesar posteriormente el texto con modelos de NLP.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion en tiempo real de contenido audiovisual en chino e ingles facilita la inclusion en medios y eventos.
- Analisis de contenido multimedia para investigacion social o linguistica: el code-switching y la precision en mandarin taiwanes permiten estudiar patrones de uso del lenguaje en corpus orales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de WER, CER ni de rendimiento en conjuntos de evaluacion estandar como Common Voice o Fleurs.

## Requisitos de hardware

- Al ser un modelo int8 en formato CTranslate2, la memoria necesaria es significativamente menor que la version fp16 o fp32. El tamano del repositorio es de 1.6 GB, lo que sugiere que la carga en RAM o VRAM ronda ese valor.
- Puede ejecutarse en CPU con `faster-whisper` sin necesidad de GPU, aunque la velocidad de inferencia dependera del numero de nucleos y de la longitud del audio.
- En GPU, se recomienda al menos 4 GB de VRAM para una inferencia comoda, siendo viable en tarjetas como GTX 1660, RTX 2060 o superiores. Para procesamiento por lotes o audio largo, se recomienda 8 GB o mas.
- Compatible con `faster-whisper` (CPU y CUDA), y con CTranslate2 directamente. Tambien se puede integrar en pipelines de `whisper.cpp` si se convierte a formato GGUF, aunque no se proporciona esa conversion.
- La latencia estimada para un audio de 10 segundos en CPU moderna (8 nucleos) es de aproximadamente 2-3 segundos; en GPU (RTX 3090) baja a menos de 0.5 segundos. Estos valores son orientativos y no han sido medidos oficialmente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Breeze-ASR-25-int8-CT2 | Whisper-large-v2 | no disponible | no disponible | zh, en | Apache-2.0 | CTranslate2 int8 |
| Whisper-large-v2 (original) | Transformer encoder-decoder | 1550M | 30 s audio | 99 idiomas | MIT | PyTorch, CT2 |
| Whisper-large-v3 | Transformer encoder-decoder | 1550M | 30 s audio | 99 idiomas | MIT | PyTorch, CT2 |
| SeamlessM4T (Meta) | Encoder-decoder multimodal | 2.3B | no disponible | 100+ idiomas | CC-BY-NC | PyTorch |

Breeze-ASR-25 se distingue por su especializacion en mandarin taiwanes y code-switching, mientras que los modelos Whisper genericos cubren mas idiomas pero con menor precision en este dominio especifico. SeamlessM4T es una alternativa multimodal, pero su licencia no es comercialmente permisiva (CC-BY-NC).

## Limitaciones y advertencias

- El modelo esta limitado a los idiomas chino (mandarin taiwanes) e ingles; no soporta otros dialectos chinos ni idiomas adicionales.
- No se han publicado evaluaciones de sesgos o de comportamiento en dominios especializados (medicina, legal, etc.), por lo que su uso en esos contextos requiere validacion previa.
- Al ser una conversion int8, puede haber una ligera perdida de precision en comparacion con el modelo fp16, especialmente en entornos con ruido o acentos no representados en el entrenamiento.
- El modelo puede alucinar contenido si el audio es ambiguo o de baja calidad, como cualquier sistema ASR basado en Whisper.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base para posibles restricciones adicionales.
- No es compatible con `transformers.AutoModel*`; solo puede cargarse mediante CTranslate2 o `faster-whisper`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phate334/Breeze-ASR-25-int8-CT2
- Modelo base (MediaTek-Research/Breeze-ASR-25): https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Repositorio GitHub de Breeze-ASR-25: https://github.com/mtkresearch/Breeze-ASR-25
- Paper (arXiv:2506.11130): https://arxiv.org/abs/2506.11130
- Libreria faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
