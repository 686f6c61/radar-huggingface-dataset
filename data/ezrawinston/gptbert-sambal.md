# ezrawinston/gptbert-sambal

## Resumen

GPT-BERT (SAMBAL) es un modelo de lenguaje diminuto desarrollado por Ezra Winston y Zico Kolter como parte del articulo "Learning syntax without semantics: Disentangled tiny language models" (ICML 2026). Forma parte de la familia SAMBAL, cuyo objetivo es estudiar como la ablacion lexica de un corpus de pretraining afecta a lo que un modelo de lenguaje aprende. En concreto, este "brazo ablacionado" se entrena sobre un corpus de 10 millones de palabras en el que las palabras de contenido se sustituyen sistematicamente mientras se preserva la estructura gramatical, lo que permite aislar el aprendizaje de sintaxis del de semantica.

El modelo utiliza la arquitectura GPT-BERT (Charpentier y Samuel, 2024, arXiv:2410.24159), que combina el modelado de lenguaje enmascarado con el modelado causal en una unica pila transformer. Con 12 capas, dimension oculta de 384, 6 cabezas de atencion y un vocabulario de 8192 tokens, es un modelo pequeno disenado exclusivamente como artefacto de investigacion. No esta ajustado por instrucciones y no esta pensado para despliegue en produccion. Su relevancia cientifica radica en que permite estudiar de forma controlada que aspectos del lenguaje aprenden los modelos cuando la semantica se elimina del corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-BERT (transformer hibrido causal-enmascarado) |
| Parametros totales | ~25 millones (estimado a partir de la config: 12 capas, hidden 384, vocab 8192) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | state_dict en binario (.bin), no compatible con `transformers` |

## Arquitectura y entrenamiento

GPT-BERT es una arquitectura que fusiona el modelado de lenguaje enmascarado (estilo BERT) con el modelado causal (estilo GPT) en una unica pila transformer. Esto permite que el modelo se use de forma transparente como un modelo causal o enmascarado estandar. La configuracion "small" emplea 12 capas, dimension oculta de 384, 6 cabezas de atencion y un vocabulario de 8192 tokens, con un tokenizer propio (`gpt-bert-babylm-small`) alojado en el repositorio de GitHub.

El entrenamiento se realiza sobre el corpus [babycosmofine-sambal](https://huggingface.co/datasets/ezrawinston/babycosmofine-sambal), una version ablacionada de 10 millones de palabras en la que las palabras de contenido se sustituyen sistematicamente preservando la estructura gramatical. Se proporcionan dos regimenes de entrenamiento: un regimen largo (un unico checkpoint con pesos EMA) y un regimen corto con tasa de aprendizaje 0.007 y tres semillas (0, 1, 2), tambien con pesos EMA. Ademas, se incluyen adaptaciones LoRA (rank 32, alpha 16, embeddings entrenables, tasa de aprendizaje 1e-3) sobre texto de dominio pequeno y sobre el split de PubMed, seleccionadas por mejor perplejidad en validacion. Todos los resultados reportados en el articulo provienen de los pesos EMA.

## Capacidades

- Generacion de texto causal y modelado de lenguaje enmascarado gracias a la arquitectura hibrida GPT-BERT.
- Adquisicion de estructura sintactica del ingles a partir de un corpus sin semantica, lo que permite estudiar que aspectos gramaticales se aprenden independientemente del significado.
- Adaptacion de dominio mediante LoRA: los adaptadores incluidos demuestran que el modelo puede adquirir contenido de dominio especifico (texto de dominio pequeno y PubMed) sin reentrenar los pesos base.
- Reproducibilidad cientifica: se proporcionan tres semillas para el regimen corto, lo que permite evaluar la varianza de los resultados.
- Uso como modelo causal o enmascarado de forma intercambiable, gracias a la naturaleza hibrida de GPT-BERT.
- No soporta tool calling, ni capacidades multimodales, ni razonamiento multi-paso, ni modo de pensamiento.

## Casos de uso

- Investigacion sobre la separacion sintaxis-semantica en modelos de lenguaje: el modelo permite estudiar que estructuras gramaticales se aprenden exclusivamente a partir de informacion sintactica, comparando su comportamiento con el del baseline entrenado sobre el corpus sin ablacion.
- Estudio de efectos de ablacion lexica: los investigadores pueden analizar como la sustitucion sistematica de palabras de contenido afecta a la adquisicion de morfologia, concordancia y estructura de frases.
- Adaptacion de dominio modular: el caso de uso central del articulo es que el pretraining SAMBAL codifica sintaxis en los pesos base, y un adaptador LoRA ligero anade conocimiento de dominio. Esto es util para escenarios donde se necesita un modelo linguisticamente competente pero con conocimiento limitado a un dominio objetivo.
- Evaluacion de adquisicion de sintaxis en regimenes de datos pequenos: con solo 10 millones de palabras, el modelo sirve como banco de pruebas para metodos de evaluacion de competencia gramatical en modelos diminutos.
- Comparacion con modelos baseline: los checkpoints de este brazo ablacionado se comparan directamente con los de [gptbert-babycosmofine](https://huggingface.co/ezrawinston/gptbert-babycosmofine) (entrenado sobre el corpus sin ablacion) para aislar el efecto de la semantica en el aprendizaje.
- Educacion e investigacion reproducible: al ser un modelo pequeno con codigo de reproduccion publico, es adecuado para cursos de procesamiento del lenguaje natural y para validar hipotesis teoricas sobre el aprendizaje de lenguaje en entornos computacionalmente limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo en OpenReview (ICML 2026) reporta los resultados completos de la evaluacion, pero los numeros concretos no estan incluidos en la model card ni en los resultados de busqueda web proporcionados. Los autores indican que todos los resultados reportados provienen de los pesos EMA.

## Requisitos de hardware

- Con aproximadamente 25 millones de parametros, los pesos en FP32 ocupan unos 100 MB, por lo que el modelo cabe en cualquier GPU de consumo, incluso con 4 GB de VRAM.
- Es viable la inferencia en CPU sin problemas de latencia apreciables, dado el tamano reducido del modelo.
- El repositorio completo ocupa 0.7 GB, lo que incluye multiples checkpoints (regimen largo, tres semillas del regimen corto y adaptadores LoRA).
- No se puede desplegar con vLLM, Ollama ni TGI directamente, ya que los pesos estan en formato `state_dict` plano y requieren el codigo de arquitectura del repositorio de GitHub ([`lm/gpt-bert/`](https://github.com/ezrawinston/sambal/tree/main/lm/gpt-bert)).
- Para cargar y evaluar los checkpoints es necesario seguir las instrucciones de [`reproduce/icml2026/README.md`](https://github.com/ezrawinston/sambal/blob/main/reproduce/icml2026/README.md).
- La latencia y el throughput no estan documentados, pero para un modelo de este tamano se espera una inferencia en el orden de milisegundos por token en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-BERT SAMBAL (este modelo) | ~25M | no disponible | GPT-BERT hibrido | MIT | state_dict plano, requiere codigo del repo |
| GPT-BERT baseline (gptbert-babycosmofine) | ~25M | no disponible | GPT-BERT hibrido | MIT | state_dict plano, requiere codigo del repo |
| GPT-2 small | 124M | 1024 | Transformer causal | MIT | formato transformers estandar |
| BERT small | ~44M | 512 | Transformer enmascarado | Apache 2.0 | formato transformers estandar |

La comparativa directa mas relevante es con el baseline `gptbert-babycosmofine`, que se entrena sobre el corpus sin ablacion y permite aislar el efecto de la semantica. Los modelos GPT-2 small y BERT small son alternativas genericas de tamano similar pero con propositos distintos y formatos estandar.

## Limitaciones y advertencias

- No esta ajustado por instrucciones (instruction-tuned) y no esta pensado para despliegue en produccion; es exclusivamente un artefacto de investigacion.
- El corpus de entrenamiento tiene solo 10 millones de palabras, por lo que la cobertura lexica y el conocimiento del mundo son extremadamente limitados.
- Las palabras de contenido se sustituyen sistematicamente en el corpus, por lo que el modelo carece de conocimiento semantico real y no debe usarse para tareas que requieran comprension del significado.
- Solo soporta ingles; no hay capacidades multilingues.
- Los pesos no estan en formato `transformers`, por lo que `AutoModel.from_pretrained` no funciona; es necesario cargarlos con el codigo personalizado del repositorio de GitHub.
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- No se proporcionan cuantizaciones precalculadas; cualquier cuantizacion requeriria conversion manual.
- Al ser un modelo de investigacion, no se garantiza la ausencia de sesgos, aunque el corpus ablacionado reduce el riesgo de sesgos semanticos al eliminar las palabras de contenido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ezrawinston/gptbert-sambal)
- [Dataset babycosmofine-sambal](https://huggingface.co/datasets/ezrawinston/babycosmofine-sambal)
- [Modelo baseline gptbert-babycosmofine](https://huggingface.co/ezrawinston/gptbert-babycosmofine)
- [Articulo en OpenReview](https://openreview.net/forum?id=p7HVrmZwWB)
- [PDF del articulo](https://openreview.net/pdf?id=p7HVrmZwWB)
- [Codigo y recetas de reproduccion en GitHub](https://github.com/ezrawinston/sambal)
- [Directorio de arquitectura GPT-BERT en el repo](https://github.com/ezrawinston/sambal/tree/main/lm/gpt-bert)
- [Instrucciones de reproduccion ICML 2026](https://github.com/ezrawinston/sambal/blob/main/reproduce/icml2026/README.md)
- [Articulo original de GPT-BERT (arXiv:2410.24159)](https://arxiv.org/abs/2410.24159)
- [Implementacion oficial de GPT-BERT (ltgoslo/gpt-bert)](https://github.com/ltgoslo/gpt-bert)
