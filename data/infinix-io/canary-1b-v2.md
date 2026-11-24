# Infinix-io/canary-1b-v2

## Resumen

Canary-1b-v2 es un modelo de reconocimiento automático del habla (ASR) y traducción automática del habla (AST) desarrollado por Infinix-io, publicado en Hugging Face bajo licencia CC-BY-4.0. Está construido sobre la arquitectura FastConformer de NVIDIA NeMo, con aproximadamente 979 millones de parámetros, y se distribuye en formato safetensors para su uso con la librería NeMo y con Transformers.

El modelo cubre 25 idiomas europeos (entre ellos español, inglés, alemán, francés, italiano, portugués, neerlandés, polaco, checo, rumano, sueco, danés, finés, griego, húngaro, búlgaro, croata, eslovaco, esloveno, estonio, letón, lituano, maltés, ruso y ucraniano) y está orientado a transcripción multilingüe y traducción del habla, tareas para las que emplea métricas WER, BLEU y COMET.

Su relevancia radica en ofrecer una alternativa abierta y multilingüe de tamaño contenido (sub-1000M de parámetros) que puede desplegarse en hardware modesto, con resultados de WER competitivos en idiomas como español (2,90 en FLEURS), italiano (3,07) o alemán (4,40). No obstante, la información pública disponible sobre detalles de entrenamiento, contexto de audio y cuantizaciones es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (Transformer convolucional, familia NeMo Canary) |
| Parametros totales | 978.998.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (librería NeMo) |

## Arquitectura y entrenamiento

El modelo se basa en FastConformer, una variante eficiente de Conformer que combina capas convolucionales y mecanismos de auto-atención para procesar secuencias de audio. La familia Canary de NVIDIA emplea un codificador de audio y un decodificador de texto que permiten tanto transcripción (ASR) como traducción del habla (AST) en un único modelo multitarea. Los tags del repositorio confirman el uso de PyTorch, NeMo y compatibilidad con Transformers.

Los datasets declarados en la model card son `nvidia/Granary` y `nvidia/nemo-asr-set-3.0`, ambos corpus multilingües de NVIDIA orientados a ASR. No se especifica en la información disponible el número de horas de audio, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La información técnica sobre el proceso de entrenamiento es, por tanto, escasa.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos.
- Traducción automática del habla (AST), según el tag `automatic-speech-translation` y las métricas BLEU/COMET declaradas.
- Procesamiento de audio de entrada con salida de texto.
- Soporte multilingüe amplio dentro del espacio europeo (eslavo, germánico, románico, báltico, urálico y griego).
- Integración con la librería NeMo y con Transformers.
- No se documenta soporte de tool calling, agentes, visión ni audio de salida.

## Casos de uso

- Transcripción de reuniones y actas multilingües: el modelo puede transcribir audio en cualquiera de los 25 idiomas soportados, útil en organizaciones con equipos distribuidos en Europa.
- Subtitulado automático de vídeo: generación de subtítulos en español, inglés, francés o alemán a partir de pistas de audio, con WER bajo en idiomas románicos (español 2,90; italiano 3,07).
- Traducción del habla en atención al cliente: conversión de llamadas en un idioma a texto en otro, aprovechando la capacidad AST declarada.
- Archivado y búsqueda de contenido audiovisual: indexación de grabaciones mediante transcripción para búsqueda textual posterior.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos educativos o institucionales.
- Análisis de medios y monitorización: procesamiento de emisiones de radio o televisión en múltiples lenguas europeas para extracción de información.
- Investigación lingüística: corpus de habla transcritos para estudios comparativos entre lenguas eslavas, bálticas o urálicas.

## Benchmarks y rendimiento

Resultados de WER en el conjunto de test de FLEURS, según la model card del autor (no verificados de forma independiente):

| Idioma | Config FLEURS | WER (%) |
|---|---|---|
| Español | es_419 | 2,90 |
| Italiano | it_it | 3,07 |
| Alemán | de_de | 4,40 |
| Inglés | en_us | 4,50 |
| Francés | fr_fr | 5,02 |
| Checo | cs_cz | 7,86 |
| Croata | hr_hr | 8,29 |
| Finés | fi_fi | 8,59 |
| Griego | el_gr | 9,21 |
| Búlgaro | bg_bg | 9,25 |
| Letón | lv_lv | 9,66 |
| Danés | da_dk | 11,25 |
| Lituania | lt_lt | 12,36 |
| Estonio | et_ee | 12,55 |
| Húngaro | hu_hu | 12,90 |

No se han publicado en la información disponible resultados de benchmarks para el resto de idiomas (nl, mt, pl, pt, ro, sk, sl, sv, ru, uk) ni métricas BLEU/COMET desglosadas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 4 GB solo para pesos (979M parámetros × 4 bytes), más overhead de activaciones y decodificación.
- En fp16/bf16: aproximadamente 2 GB para pesos, más overhead.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para producción; RTX 3090/4080 para desarrollo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en precisión reducida.
- Opciones de despliegue: NeMo (nativo), Transformers; no se documenta soporte oficial de vLLM, llama.cpp u Ollama para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Canary-1b-v2 (Infinix-io) | ~979M | 25 europeos | CC-BY-4.0 | no disponible | ASR + AST, FastConformer |
| Whisper large-v3 (OpenAI) | ~1550M | ~99 | MIT | 30 s de audio | ASR multilingüe amplio |
| Canary-1b (NVIDIA) | ~1000M | en, de, fr, es | CC-BY-4.0 | no disponible | ASR + AST, base de la familia |
| SeamlessM4T v2 (Meta) | ~2300M | ~100 | CC-BY-NC-4.0 | no disponible | ASR + AST + TTS, no comercial |

La comparativa se limita a datos públicos generales; no se dispone de resultados de benchmarks cruzados en la información proporcionada.

## Limitaciones y advertencias

- La información sobre datos de entrenamiento, contexto de audio y cuantizaciones es muy limitada; conviene validar el comportamiento en el dominio propio antes de producción.
- Los WER declarados corresponden a FLEURS, un corpus de habla leída; el rendimiento en habla espontánea, ruido o acentos puede degradarse notablemente.
- Algunos idiomas presentan WER elevado (húngaro 12,90; estonio 12,55; lituano 12,36), lo que limita su uso en aplicaciones sensibles a errores.
- Riesgo de alucinación en tramos de silencio o audio de baja calidad, comportamiento común en modelos ASR de secuencia a secuencia.
- Sesgos potenciales derivados de la composición de los corpus de NVIDIA (Granary, nemo-asr-set-3.0), no documentada en detalle.
- Licencia CC-BY-4.0 permite uso comercial con atribución; no obstante, deben revisarse las condiciones de los datasets de origen.
- No se documenta soporte de cuantización ni de despliegue en runtimes ligeros, lo que puede limitar escenarios de borde.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/canary-1b-v2
- Paper FastConformer: https://arxiv.org/abs/2305.05084
- Paper Conformer: https://arxiv.org/abs/2005.08100 (referenciado como 2005.08072 en los tags)
- Paper Transformer: https://arxiv.org/abs/1706.03762
- Paper Canary (referencia en tags): https://arxiv.org/abs/2406.00899
- Paper relacionado (tags): https://arxiv.org/abs/2509.14128
- Paper relacionado (tags): https://arxiv.org/abs/2505.13404
- Paper relacionado (tags): https://arxiv.org/abs/2410.01036
- Paper relacionado (tags): https://arxiv.org/abs/2205.12446
- Paper relacionado (tags): https://arxiv.org/abs/2012.03411
- Paper relacionado (tags): https://arxiv.org/abs/2007.10310
- Paper relacionado (tags): https://arxiv.org/abs/1510.08484
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Dataset NeMo ASR Set 3.0: https://huggingface.co/datasets/nvidia/nemo-asr-set-3.0
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
