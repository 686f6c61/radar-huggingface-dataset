# Koubra-Gaby/nllb_muse_aligned

## Resumen

nllb_muse_aligned es un modelo de la familia NLLB (No Language Left Behind) de Meta AI, concretamente una variante de tipo m2m_100, publicado por el usuario Koubra-Gaby en Hugging Face. Se trata de un fine-tuning sobre el propio checkpoint del autor (la model card indica como base el mismo identificador, lo que sugiere un proceso iterativo o un error de metadatos) orientado a traduccion automatica y extraccion de caracteristicas. El modelo declara metricas de evaluacion BLEU, ROUGE, METEOR y chrF++ en su model card, lo que confirma su uso previsto en tareas de traduccion.

Con 651.665.408 parametros (aproximadamente 652 millones), se situa en el rango de los modelos NLLB de tamano compacto (NLLB-200-distilled-600M tiene 615M, por lo que este es ligeramente mayor). El repositorio ocupa 7,6 GB, lo que sugiere pesos en safetensors posiblemente en fp32 junto con checkpoints de entrenamiento. La libreria es transformers y el pipeline declarado es feature-extraction.

La relevancia de este modelo es limitada pero concreta: se trata de un checkpoint de investigacion con pocas descargas (47) y sin likes, cuya model card esta mayoritariamente autogenerada por el Trainer de Hugging Face y contiene secciones sin completar ("More information needed"). No obstante, los datos de entrenamiento (100 epocas, learning rate 2e-5, batch 64) y las curvas de evaluacion permiten reconstruir parcialmente el proceso. Es util como referencia para quien quiera reproducir o comparar fine-tunings de NLLB en tareas de traduccion, pero no como modelo de produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | m2m_100 (transformer encoder-decoder de la familia NLLB) |
| Parametros totales | 651.665.408 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card (la familia NLLB cubre 200 idiomas, pero el autor no especifica cuales conserva el fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Libreria | transformers |
| Modelo base declarado | Koubra-Gaby/nllb_muse_aligned (autoreferencia) |
| Tamano del repositorio | 7,6 GB |
| Descargas | 47 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a m2m_100, el transformer encoder-decoder con atencion multi-cabeza estandar que Meta AI diseno para NLLB. El tag `m2m_100` en Hugging Face confirma que el modelo usa la implementacion `M2M100ForConditionalGeneration` de transformers, con embeddings de idioma y tokenizer multilingue. No se dispone de informacion sobre el numero de capas, dimensiones ocultas ni cabezas de atencion especificas de esta variante; los 652M de parametros son coherentes con un modelo de la gama NLLB-600M.

El entrenamiento se realizo con el Trainer de Hugging Face durante 100 epocas con un learning rate de 2e-5, batch de 64, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y precision mixta nativa (AMP). El dataset de entrenamiento aparece como "None" en la model card, por lo que se desconoce su composicion, tamano y dominio. La evaluacion se realizo con metricas BLEU, ROUGE, METEOR y chrF++, y la curva de validacion muestra una mejora monotona sostenida: la perdida de validacion baja de 3,53 en el paso 500 a 1,48 en el paso 22.000, y el BLEU sube de 0,87 a 7,50. El mejor checkpoint declarado en la cabecera de la model card (Loss 1,4506; BLEU 7,3485; ROUGE 0,3402; METEOR 0,2219; chrF++ 25,5126) no coincide exactamente con el ultimo paso de la tabla (paso 22.000, BLEU 7,4989), lo que sugiere que el checkpoint final seleccionado es distinto del ultimo registrado o que hubo una seleccion por mejor metrica agregada.

No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Las versiones de framework declaradas son Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Traduccion automatica multilingue: uso previsto principal, coherente con la familia NLLB y con las metricas BLEU/ROUGE/METEOR/chrF++ reportadas.
- Extraccion de caracteristicas: el pipeline declarado es feature-extraction, por lo que puede emplearse para obtener representaciones del encoder.
- Generacion condicionada por idioma: al ser un modelo m2m_100, soporta el mecanismo de forzar idioma de origen y destino mediante tokens especiales.
- Fine-tuning adicional: al estar publicado con `generated_from_trainer`, es reutilizable como punto de partida para nuevos ajustes.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: la model card no especifica la lista de idiomas cubiertos por este fine-tuning concreto; la familia base cubre 200 idiomas, pero no hay confirmacion de que este checkpoint los conserve todos.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir textos entre los pares de idiomas cubiertos por el fine-tuning, con la ventaja de que su tamano (652M) permite desplegarlo en una unica GPU consumer. Requiere validacion previa de la calidad en el par de idiomas concreto, dado el BLEU declarado de 7,35, que es bajo en terminos absolutos.
- Generacion de subtitulos y traduccion de transcripciones: al ser un encoder-decoder compacto, encaja en pipelines de traduccion por segmentos con baja latencia, siempre que se validen los pares de idiomas disponibles.
- Prototipado de sistemas de traduccion en investigacion: util como baseline reproducible para comparar fine-tunings de NLLB, ya que la model card documenta hiperparametros y curvas de entrenamiento.
- Extraccion de embeddings multilingues: mediante el pipeline feature-extraction se pueden obtener representaciones del encoder para tareas de similitud semantica o recuperacion, aunque sin garantias de calidad sin evaluacion especifica.
- Ajuste fino adicional sobre dominios especializados: el checkpoint puede servir como inicializacion para fine-tunings en dominios como legal, medico o soporte tecnico, partiendo de un modelo ya expuesto a datos de traduccion.
- Evaluacion comparativa de tecnicas de alineacion: el nombre "muse_aligned" sugiere un proceso de alineacion (posiblemente con embeddings MUSE); el modelo puede usarse como referencia en experimentos de alineacion de espacios multilingues.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, correspondientes al conjunto de evaluacion (no se especifica cual). No hay resultados de MMLU, HumanEval, GSM8K ni benchmarks estandar de traduccion como FLORES-200.

| Metrica | Valor declarado (mejor checkpoint) |
|---|---|
| Loss | 1,4506 |
| BLEU | 7,3485 |
| ROUGE | 0,3402 |
| METEOR | 0,2219 |
| chrF++ | 25,5126 |

Evolucion durante el entrenamiento (seleccion de pasos):

| Paso | Epoca | Validation loss | BLEU | ROUGE | METEOR | chrF++ |
|---|---|---|---|---|---|---|
| 500 | 1,04 | 3,5328 | 0,8739 | 0,1473 | 0,0672 | 9,1212 |
| 5.000 | 10,44 | 1,9412 | 4,7734 | 0,2771 | 0,1668 | 20,9034 |
| 10.000 | 20,88 | 1,6233 | 6,4767 | 0,3145 | 0,1993 | 23,9034 |
| 15.000 | 31,32 | 1,5185 | 7,1292 | 0,3286 | 0,2124 | 25,0567 |
| 20.000 | 41,75 | 1,4875 | 7,5111 | 0,3386 | 0,2219 | 25,6273 |
| 22.000 | 45,93 | 1,4805 | 7,4989 | 0,3381 | 0,2212 | 25,6702 |

No se han publicado resultados de benchmarks estandar (FLORES-200, WMT, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 652M de parametros ocupan aproximadamente 2,6 GB, mas overhead de activaciones y KV cache; en fp16/bf16, unos 1,3 GB; en int8, unos 0,65 GB. El repositorio de 7,6 GB incluye probablemente checkpoints de entrenamiento, no solo pesos finales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia en fp16. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problemas; las GPU de datacenter solo son necesarias para alto throughput por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas, e incluso en GPUs integradas con cuantizacion agresiva si se generan pesos GGUF (no disponibles en el repositorio).
- Opciones de despliegue: transformers con PyTorch es la via nativa; vLLM y TGI pueden servir arquitecturas m2m_100, aunque la compatibilidad concreta con esta variante no esta documentada. llama.cpp/Ollama requeririan conversion a GGUF, que el autor no proporciona.
- Latencia y throughput estimados: no disponibles. Para un modelo de 652M en una RTX 4090 en fp16, cabria esperar decenas de tokens por segundo por secuencia, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| nllb_muse_aligned (este) | 651,7M | no disponible | no disponible | no disponible | safetensors | Fine-tuning de investigacion, BLEU 7,35 en eval propio |
| facebook/nllb-200-distilled-600M | 615M | 1024 tokens (tipico en NLLB) | 200 | CC-BY-NC 4.0 | safetensors, GGUF (comunitario) | Modelo oficial de Meta, ampliamente validado en FLORES-200 |
| facebook/m2m100_418M | 418M | 1024 tokens (tipico en m2m_100) | 100 | MIT | safetensors, GGUF (comunitario) | Modelo oficial de Meta, licencia permisiva |
| Helsinki-NLP/opus-mt-* | ~70-300M | 512 tokens (tipico) | pares bilingues | CC-BY 4.0 (segun modelo) | safetensors | Modelos por par de idiomas, mas ligeros y especializados |

La comparacion con NLLB-200-distilled-600M es la mas directa por tamano y familia. La principal diferencia es que el modelo oficial tiene licencia CC-BY-NC 4.0 (no comercial) y evaluacion publica en FLORES-200, mientras que este checkpoint no declara licencia ni evaluacion estandar. m2m100_418M ofrece licencia MIT, mas permisiva, con menos parametros y cobertura de 100 idiomas.

## Limitaciones y advertencias

- La model card esta mayoritariamente autogenerada y contiene secciones sin completar ("More information needed"), incluida la descripcion del modelo, los usos previstos y los datos de entrenamiento.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Ante la duda, debe tratarse como no apto para produccion hasta aclararlo con el autor.
- El modelo base declarado es el mismo identificador del modelo, lo que sugiere un error de metadatos o un proceso de fine-tuning iterativo no documentado; no es posible reconstruir la cadena exacta de entrenamiento.
- El BLEU declarado (7,35) es bajo en terminos absolutos y no se especifica el conjunto de evaluacion ni los pares de idiomas, por lo que no es comparable con resultados publicados en FLORES-200.
- No se especifica que idiomas cubre este fine-tuning; la familia NLLB cubre 200, pero el ajuste puede haber degradado el rendimiento en idiomas no representados en el dataset (que ademas se desconoce).
- Riesgo de alucinacion y errores de traduccion en dominios especializados no vistos durante el entrenamiento.
- El entrenamiento de 100 epocas con learning rate constante y scheduler lineal puede haber provocado sobreajuste; la perdida de validacion se estabiliza alrededor del paso 20.000, pero no hay datos de test independiente.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM sin conversion manual.
- El numero de descargas (47) y likes (0) indica que el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Koubra-Gaby/nllb_muse_aligned
- Paper NLLB (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper m2m-100: https://arxiv.org/abs/2010.11125
- Repositorio NLLB de Meta en GitHub: https://github.com/facebookresearch/fairseq/tree/nllb
- Documentacion de M2M100 en transformers: https://huggingface.co/docs/transformers/model_doc/m2m_100
- Modelo oficial NLLB-200-distilled-600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Modelo oficial m2m100_418M: https://huggingface.co/facebook/m2m100_418M
