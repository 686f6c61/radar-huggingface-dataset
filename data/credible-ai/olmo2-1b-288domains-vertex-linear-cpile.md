# credible-ai/olmo2-1B-288domains-vertex-linear-cpile

## Resumen

olmo2-1B-288domains-vertex-linear-cpile es un modelo de lenguaje de aproximadamente 1,41 mil millones de parametros (dato real de los safetensors: 1.414.678.528) desarrollado por credible-ai como artefacto de investigacion para reproducir los experimentos del paper de LinMix ("LinMix: Data Mixing as Linear Domain Attribution", arXiv:2610.37390). El modelo esta preentrenado sobre 32B tokens del corpus WebOrganizer, mezclando 288 dominios (topic × format) con pesos de mezcla optimizados por LinMix para minimizar los bits por byte en texto de Common Pile retenido.

No se trata de un modelo de proposito general, sino de un experimento controlado que permite estudiar como la optimizacion de mezclas de datos afecta a la calidad del modelo resultante. La arquitectura base es OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y tamaño oculto de 2048, y el entrenamiento se realizo con OLMo-core. Su relevancia radica en que ofrece pesos abiertos bajo licencia MIT y datos de entrenamiento documentados, lo que lo hace util para investigacion reproducible en data mixing y curacion de corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (Olmo2ForCausalLM), transformer decoder-only |
| Parametros totales | 1.414.678.528 (~1,41B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

Datos adicionales de la arquitectura: 18 capas, hidden size 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 de AI2, un transformer decoder-only implementado como `Olmo2ForCausalLM` en la libreria transformers de Hugging Face. Con 1,41B de parametros distribuidos en 18 capas y un tamaño oculto de 2048, se trata de un modelo denso (no MoE) de escala reducida, adecuado para experimentos controlados de preentrenamiento. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens.

El entrenamiento consistio en 32B tokens procedentes del corpus WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x de mlfoundations), organizados en 288 dominios que cruzan topica y formato. La novedad central es el metodo LinMix: un sustituto lineal (linear surrogate) ajustado sobre un enjambre de modelos proxy (olmo2-60M-288domains-vertex) con utilidad lineal π (r = 0), que optimiza los pesos de mezcla de dominios para minimizar bits por byte en texto de Common Pile retenido. El entrenamiento se ejecuto con la libreria OLMo-core de AllenAI. No se dispone de informacion sobre fases de RLHF, DPO o post-entrenamiento; el modelo es un artefacto de preentrenamiento puro.

## Capacidades

- Generacion de texto en ingles mediante el pipeline `text-generation` de transformers.
- Modelado de lenguaje sobre texto web (Common Crawl / DCLM), con pesos de mezcla optimizados para minimizar bits por byte en texto retenido.
- Reproduccion de experimentos cientificos: sirve como punto de comparacion para estudiar estrategias de data mixing en preentrenamiento.
- No es un modelo instruido: no se ha publicado informacion sobre capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes ni soporte multilingue. Al tratarse de un artefacto de investigacion preentrenado, no debe asumirse capacidad de seguir instrucciones.

## Casos de uso

- Investigacion en data mixing: sirve como modelo de referencia para comparar estrategias de mezcla de dominios (LinMix frente a heuristicas como DoReMi o mezclas uniformes) en condiciones controladas de escala y corpus.
- Reproduccion del paper de LinMix: permite verificar los resultados de arXiv:2610.37390 sin repetir el preentrenamiento, ya que el archivo `mix.json` documenta la mezcla exacta utilizada.
- Estudio de atribucion de dominio: al estar entrenado sobre 288 dominios etiquetados de WebOrganizer, facilita analisis de como cada dominio contribuye a la perdida final y al comportamiento del modelo.
- Base para experimentos de continue pretraining: su tamaño reducido (1,41B) y licencia MIT lo hacen practico como punto de partida para afinar sobre corpus especificos y medir el efecto del preentrenamiento inicial.
- Benchmarking de infraestructura de entrenamiento: al documentarse el uso de OLMo-core y 32B tokens, es util para validar pipelines de entrenamiento distribuido a escala pequena antes de escalar.
- Docencia y formacion: modelo suficientemente pequeno para que estudiantes carguen y analicen un LLM completo, incluyendo su tokenizador, arquitectura y datos de entrenamiento abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de calidad mencionada es el objetivo de optimizacion de LinMix: bits por byte sobre texto de Common Pile retenido, sin que se facilite el valor numerico obtenido.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,41B de parametros en bfloat16, el modelo ocupa aproximadamente 2,8 GB de pesos, por lo que bastarian unos 4-6 GB de VRAM para inferencia en bfloat16. No se han publicado cuantizaciones oficiales (GGUF, GPTQ, AWQ), aunque en int8/int4 la huella se reduciria a ~1,5 GB y ~1 GB respectivamente.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; no se requieren A100 ni H100. Una RTX 3060 de 12 GB, RTX 4060 o superior ejecutaria el modelo con holgura, e incluso es viable su ejecucion en CPU dada la escala.
- Consumer GPU: cabe comodamente en GPUs de consumo desde ~6 GB de VRAM en bfloat16.
- Despliegue: carga directa con transformers (`AutoModelForCausalLM` / `AutoTokenizer`), tal como muestra la model card. No se menciona soporte oficial para vLLM, llama.cpp, Ollama o TGI, aunque la arquitectura OLMo 2 esta integrada en transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-288domains-vertex-linear-cpile | 1,41B | no disponible | 32B tokens, WebOrganizer (288 dominios, LinMix) | MIT | Pesos abiertos en Hugging Face |
| OLMo 2 1B (AllenAI) | ~1,5B | no disponible (4K en la familia OLMo 2) | Multi-token OLMo 2 | Apache 2.0 | Pesos y datos abiertos |
| Pythia 1.4B (EleutherAI) | 1,4B | 2.048 tokens | ~300B tokens, the Pile | Apache 2.0 | Pesos y checkpoints abiertos |

La diferencia clave frente a alternativas como OLMo 2 1B o Pythia 1.4B es que este modelo no busca maximizar capacidad general, sino servir como punto de comparacion experimental para el metodo LinMix de optimizacion de mezclas de datos.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card advierte que es un artefacto de investigacion para reproducir los experimentos de LinMix, no un asistente ni un modelo de produccion.
- Sin post-entrenamiento: no hay indicios de instrucciones, RLHF ni DPO, por lo que generara texto sin alineacion y con alta probabilidad de continuaciones no deseadas.
- Monolingue en ingles: entrenado solo con datos en ingles; el rendimiento en otros idiomas no esta garantizado ni evaluado.
- Riesgo de alucinacion y sesgos: entrenado sobre datos de Common Crawl (pool DCLM 1b-1x), hereda los sesgos, errores y contenido problematico tipicos de texto web; no se han publicado evaluaciones de sesgo o seguridad.
- Contexto: la longitud de ventana de contexto no esta documentada en la model card y debe verificarse en la configuracion del modelo antes de usos con textos largos.
- Licencia y datos: los pesos son MIT, pero los datos de entrenamiento provienen de WebOrganizer/Corpus-200B (CC-BY-4.0 y terminos de uso de Common Crawl), lo que puede tener implicaciones para ciertos usos comerciales de derivados.
- Escala limitada: con 1,41B parametros y solo 32B tokens de preentrenamiento, su calidad de generacion es inferior a la de modelos de consumo actuales de tamano similar entrenados con varios billones de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-vertex-linear-cpile
- Paper de LinMix: https://arxiv.org/abs/2610.37390
- Codigo de LinMix: https://github.com/credibleai/linmix
- Modelo proxy (enjambre): https://huggingface.co/credible-ai/olmo2-60M-288domains-vertex
- Dataset de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM original: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Libreria de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
