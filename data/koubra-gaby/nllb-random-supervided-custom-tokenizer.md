# Koubra-Gaby/nllb-random-supervided-custom-tokenizer

## Resumen

El modelo `Koubra-Gaby/nllb-random-supervided-custom-tokenizer` es un ajuste fino (fine-tuning) de un modelo de traduccion automatica basado en la arquitectura M2M-100, publicado en Hugging Face por el usuario Koubra-Gaby. El nombre del repositorio indica que se ha entrenado con un tokenizador personalizado ("custom tokenizer") y con datos de supervisión descritos de forma ambigua como "random-supervided". El modelo base declarado es el propio repositorio, lo que sugiere una cadena de fine-tunings sucesivos sobre el mismo identificador.

Con 617.392.128 parametros (unos 617 millones, dato extraido de los pesos en safetensors), se situa en la gama media de los modelos de traduccion neuronal, comparable a tamanos tipo M2M-100 418M o NLLB-200 distilled. La model card es escueta: no documenta el dataset de entrenamiento, los idiomas cubiertos ni la licencia, y los resultados de benchmarks aparecen vacios en el model-index. El unico dato de rendimiento disponible es la tabla de entrenamiento del propio autor, que reporta BLEU 28,069, ROUGE 0,4735, METEOR 0,4143 y chrF++ 51,6161 en el conjunto de evaluacion.

Su interes practico es limitado pero real: sirve como referencia de un fine-tuning de traduccion con hiperparametros documentados (learning rate 2e-05, batch 64, 100 epocas, AdamW fused, precision mixta nativa) y como punto de partida para quien quiera reproducir o adaptar un pipeline de traduccion sobre M2M-100 con tokenizador propio. No obstante, la ausencia de licencia, idiomas y dataset lo convierten en un artefacto de investigacion mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M-100 (transformer encoder-decoder, text2text-generation) |
| Parametros totales | 617.392.128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/INT8 no documentada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers (version 5.22.1 en entrenamiento) |
| Modelo base | Koubra-Gaby/nllb-random-supervided-custom-tokenizer (auto-referencia) |
| Tamano del repo | 5.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es M2M-100, un transformer encoder-decoder disenado originalmente por Meta para traduccion multilingue many-to-many. El tag `m2m_100` en Hugging Face y la tarea `text2text-generation` confirman esta base. El modelo incorpora un tokenizador personalizado, segun indica el nombre del repositorio, aunque no se documenta en que consiste dicha personalizacion (vocabulario ampliado, tokens de idioma adicionales o reentrenamiento del tokenizador SentencePiece).

El entrenamiento se realizo con el `Trainer` de Hugging Face y los hiperparametros declarados: learning rate 2e-05, batch de entrenamiento y evaluacion de 64, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup del 5%, 100 epocas y precision mixta nativa (AMP). La tabla de resultados muestra 38 puntos de evaluacion (hasta el paso 18.500), con la perdida de validacion estabilizandose en torno a 1,364 a partir de la epoca 30 y metricas de traduccion que dejan de mejorar de forma significativa tras la epoca 35. No se documenta el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO; la model card indica explicitamente "More information needed" en descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Traduccion automatica texto-a-texto (tarea principal declarada: `text2text-generation`).
- Generacion condicionada por secuencia de entrada, propia de un encoder-decoder M2M-100.
- Soporte de tokenizador personalizado, presumiblemente orientado a vocabulario o idiomas especificos del corpus de entrenamiento.
- Metricas de evaluacion integradas en la model card (BLEU, ROUGE, METEOR, chrF++), lo que facilita la comparacion con otros sistemas de traduccion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: tecnicamente heredadas de la arquitectura M2M-100, pero no verificables porque los idiomas no estan declarados.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede emplearse para traducir manuales o README entre pares de idiomas del corpus de entrenamiento, siempre que se valide previamente la calidad con un conjunto propio, dado que los idiomas no estan documentados.
- Prototipado de pipelines de traduccion: sirve como checkpoint de referencia para comparar el efecto de un tokenizador personalizado frente al tokenizador original de M2M-100 en tareas de traduccion.
- Investigacion sobre fine-tuning de modelos multilingues: los hiperparametros y la curva de entrenamiento publicados permiten reproducir el experimento y estudiar el impacto de 100 epocas con lr 2e-05 en un encoder-decoder de 617M.
- Generacion de subtitulos o transcripciones traducidas: adecuado para experimentos de traduccion de frases cortas en lote, con throughput alto gracias al tamano moderado del modelo.
- Evaluacion comparativa de metricas: util como baseline para medir BLEU, ROUGE, METEOR y chrF++ en tareas de traduccion dentro de un benchmark interno.
- Traduccion de contenido user-generated en foros o comentarios: viable en despliegues con GPU de gama media, aunque requiere validacion humana por la falta de documentacion sobre sesgos e idiomas.
- Fine-tuning posterior sobre dominio especifico: al ser un checkpoint pequeno (617M), se puede reajustar sobre corpus legales, medicos o tecnicos con recursos modestos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model card):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 1,3242 |
| BLEU | 28,069 |
| ROUGE | 0,4735 |
| METEOR | 0,4143 |
| chrF++ | 51,6161 |

Evolucion seleccionada del entrenamiento (extracto de la tabla del autor):

| Epoca | Paso | Validation loss | BLEU | ROUGE | chrF++ |
|---|---|---|---|---|---|
| 1,04 | 500 | 4,1878 | 0,1256 | 0,0696 | 9,1393 |
| 10,44 | 5.000 | 1,6072 | 22,2224 | 0,421 | 46,1299 |
| 20,88 | 10.000 | 1,4039 | 26,1956 | 0,4614 | 49,8893 |
| 30,27 | 14.500 | 1,3680 | 27,3769 | 0,4718 | 51,0907 |
| 35,49 | 17.000 | 1,3618 | 28,2106 | 0,4788 | 51,6668 |
| 38,62 | 18.500 | 1,3649 | 28,2193 | 0,4778 | 51,6508 |

El model-index oficial no contiene resultados (`results: []`), por lo que no hay comparacion directa con otros modelos publicada por el autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WMT) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,5 GB solo para pesos (617M x 4 bytes), mas activaciones y cache; en torno a 4-6 GB en total.
- VRAM estimada en FP16/BF16: aproximadamente 1,3 GB para pesos, con 3-4 GB en total considerando activaciones.
- VRAM estimada en INT8: aproximadamente 0,7 GB para pesos, con 2-3 GB en total.
- Cabe en GPU consumer: si, en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090). En CPU tambien es viable para inferencia por lotes pequenos.
- GPU recomendadas para produccion: A100, H100 o L4 para throughput alto; RTX 4090 o A10G para despliegues de gama media.
- Opciones de despliegue: transformers con `pipeline("text2text-generation")`, TGI (Text Generation Inference) para servir, vLLM si se confirma compatibilidad con M2M-100, llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koubra-Gaby/nllb-random-supervided-custom-tokenizer | 617M | no disponible | no disponible | no disponible | Hugging Face |
| facebook/m2m100_418M | 418M | 1024 tokens (aprox.) | 100 idiomas | MIT | Hugging Face |
| facebook/nllb-200-distilled-600M | 600M | 1024 tokens (aprox.) | 200 idiomas | CC-BY-NC-4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-en-es | ~77M | 512 tokens (aprox.) | par en-es | CC-BY-4.0 | Hugging Face |

Los datos de los modelos comparables (contexto, licencia, idiomas) corresponden a sus fichas publicas y pueden variar; deben verificarse antes de un uso comercial. El modelo de Koubra-Gaby no documenta ninguno de estos extremos, lo que limita la comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; tratar como no apto para produccion hasta confirmacion del autor.
- Idiomas no documentados: imposible saber que pares de traduccion cubre realmente el tokenizador personalizado.
- Dataset de entrenamiento desconocido ("None dataset" en la model card): no se pueden evaluar sesgos, dominios cubiertos ni calidad por registro linguistico.
- Model-index vacio: los resultados BLEU/ROUGE/METEOR/chrF++ provienen del propio autor y no han sido replicados externamente.
- Riesgo de alucinacion en traduccion: habitual en encoder-decoder pequenos con datos escasos; puede producir omisiones o invenciones en frases largas o idiomas de bajos recursos.
- Sobreajuste probable: 100 epocas con lr 2e-05 y batch 64 sobre un dataset no descrito, con la perdida de validacion estancada desde la epoca 30, sugieren rendimiento limitado fuera del dominio de entrenamiento.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- Cadena de fine-tunings auto-referenciada: el `base_model` apunta al propio repositorio, lo que dificulta rastrear el checkpoint original y su procedencia.
- Sin soporte documentado de tool calling, agentes, vision ni audio: no apto para tareas fuera de la traduccion texto-a-texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Koubra-Gaby/nllb-random-supervided-custom-tokenizer
- Modelo base declarado (auto-referencia): https://huggingface.co/Koubra-Gaby/nllb-random-supervided-custom-tokenizer
- Arquitectura M2M-100 (paper original de Meta): https://arxiv.org/abs/2010.11125
- Modelo de referencia facebook/m2m100_418M: https://huggingface.co/facebook/m2m100_418M
- Modelo de referencia facebook/nllb-200-distilled-600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este modelo en la informacion disponible.
