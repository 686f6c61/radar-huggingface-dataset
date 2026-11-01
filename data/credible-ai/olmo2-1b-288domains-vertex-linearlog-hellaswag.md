# credible-ai/olmo2-1B-288domains-vertex-linearlog-hellaswag

## Resumen

olmo2-1B-288domains-vertex-linearlog-hellaswag es un modelo de lenguaje de 1,41 mil millones de parámetros preentrenado por credible-ai sobre 32B tokens del corpus WebOrganizer, con pesos de mezcla de datos optimizados mediante LinMix, un método de mezcla de datos formulado como atribución lineal de dominios. Concretamente, la mezcla abarca 288 dominios (cruce de tema × formato) y los pesos se optimizaron con un sustituto lineal ajustado sobre un enjambre de modelos proxy, con utilidad logarítmica ln π (r = 1), tomando HellaSwag como benchmark objetivo.

No se trata de un modelo de propósito general: es un artefacto de investigación diseñado para reproducir los experimentos del paper de LinMix (arXiv:2610.37390). Su relevancia radica en que demuestra cómo optimizar automáticamente la composición del dataset de preentrenamiento —uno de los problemas abiertos más costosos del entrenamiento de LLM— usando modelos proxy pequeños (60M) para predecir el rendimiento de modelos mayores (1,4B).

La arquitectura es OLMo 2 (Olmo2ForCausalLM), con 18 capas y tamaño oculto 2048, entrenada con OLMo-core. El modelo está publicado en HuggingFace con pesos en safetensors bfloat16 y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (Olmo2ForCausalLM), transformer decoder-only |
| Parametros totales | 1.414.678.528 (≈1,41B) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 y terminos de Common Crawl |
| Formato de pesos | safetensors (bfloat16), tamano del repo 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 de AI2: un transformer decoder-only con 18 capas, tamaño oculto 2048 y aproximadamente 1,41B de parametros. Utiliza el tokenizador GPT-NeoX-20B de EleutherAI, con un vocabulario de 50.432 tokens. El entrenamiento se realizo sobre 32B tokens con el framework OLMo-core.

El aspecto mas destacable es el metodo de mezcla de datos. El corpus base es WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x), clasificado en 288 dominios resultantes del cruce entre temas y formatos web. LinMix optimiza los pesos de mezcla ajustando un sustituto lineal (linear surrogate) sobre un "enjambre" (swarm) de modelos proxy entrenados con distintas mezclas —en este caso, credible-ai/olmo2-60M-288domains-vertex, de 60M de parametros— y aplicando utilidad logaritmica ln π con r = 1, con HellaSwag como metrica objetivo. Esto permite predecir el rendimiento de mezclas sin entrenar modelos grandes completos. La mezcla final utilizada en el entrenamiento esta disponible en el archivo `mix.json` del repositorio.

No se dispone de informacion sobre fases posteriores de entrenamiento (SFT, RLHF, DPO): el modelo es un modelo base preentrenado.

## Capacidades

- Generacion de texto en ingles a nivel de modelo base preentrenado (sin afinamiento por instrucciones).
- Optimizacion empirica del rendimiento en HellaSwag (tareas de razonamiento de sentido comun mediante completacion de frases), al haber sido la mezcla de datos seleccionada para maximizar esa metrica.
- Utilidad como base para experimentos de investigacion sobre mezcla de datos, escalado y reproducibilidad (arquitectura totalmente abierta, estilo OLMo).
- No se dispone de informacion sobre tool calling, soporte de agentes, capacidades multilingues, vision ni audio; el modelo es un modelo base de texto en ingles y no esta pensado para seguimiento de instrucciones.

## Casos de uso

- Reproduccion de los experimentos del paper LinMix: el modelo existe precisamente para verificar los resultados de atribucion lineal de dominios publicados en arXiv:2610.37390, usando `mix.json` y el enjambre proxy de 60M.
- Investigacion en mezcla de datos (data mixing): sirve como punto de partida o baseline para comparar nuevos algoritmos de optimizacion de mezclas (DoReMi, RegMix, etc.) a escala 1B/32B tokens.
- Estudios de scaling laws condicionadas a la composicion del dataset: al estar clasificado en 288 dominios, permite analizar como la proporcion de cada dominio afecta a benchmarks concretos.
- Evaluacion de benchmarks con modelos abiertos: util para grupos que necesitan un modelo base pequeno, con datos y receta documentados, para calibrar pipelines de evaluacion tipo HellaSwag.
- Entrenamiento de modelos derivados: puede usarse como checkpoint inicial para continuos pretraining o experiments de curriculum learning sobre los mismos dominios.
- Docencia y formacion: al ser pequeno (cabe en hardware de consumo), es adecuado para practicas de preentrenamiento y analisis de modelos LLM en entornos academicos.

No es adecuado para asistentes conversacionales, RAG, generacion de codigo ni ninguna aplicacion de producto: es un artefacto experimental de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se conoce que la mezcla de datos fue optimizada para HellaSwag mediante LinMix, pero la model card no incluye el valor obtenido ni comparaciones numericas con otras mezclas o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,41B de parametros en bfloat16, los pesos ocupan unos 2,8 GB; con overhead de activaciones y KV cache, entre 4 y 6 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente; por ejemplo, una RTX 3060 de 12 GB, RTX 4060 Ti o superiores. No se requieren A100 ni H100 para inferencia.
- Cabe comodamente en GPUs de consumo; incluso es viable su ejecucion en CPU para experimentos puntuales, dado el tamano reducido.
- Despliegue: via transformers (HuggingFace) con `AutoModelForCausalLM`, tal como muestra la model card. Al ser safetensors estandar, es compatible con vLLM, TGI y llama.cpp (previa conversion a GGUF, no publicada oficialmente). No se menciona soporte oficial en Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-288domains-vertex-linearlog-hellaswag | 1,41B | no disponible | 32B tokens, mezcla LinMix (288 dominios) | MIT | abierto (safetensors) |
| OLMo 2 1B (AI2) | ≈1,5B | hasta 4.096 tokens (segun version) | varios billones de tokens, mezcla estandar | Apache 2.0 | abierto |
| Pythia 1.4B (EleutherAI) | 1,4B | 2.048 tokens | ≈300B tokens, The Pile | Apache 2.0 | abierto |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens | multiples billones de tokens, multilingue | Qwen Research / Apache 2.0 segun variante | abierto |

Nota: las alternativas listadas son modelos base de tamano comparable orientados a investigacion o uso general; el modelo de credible-ai se diferencia en que su mezcla de datos esta optimizada para un benchmark concreto y en que su proposito es la reproducion del paper LinMix, no el maximo rendimiento general.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card advierte que es un artefacto de investigacion para reproducir LinMix, no un modelo para aplicaciones finales.
- Modelo base sin alineacion: no sigue instrucciones y puede generar texto incoherente u ofensivo sin ningun filtrado.
- Entrenado solo en ingles: no espera buen rendimiento en otros idiomas, incluido el castellano.
- Optimizacion sesgada hacia HellaSwag: la mezcla de datos maximiza una metrica concreta, por lo que el rendimiento en otras tareas (codigo, matematicas, conocimiento factual) puede estar degradado respecto a mezclas equilibradas.
- Riesgo de alucinacion y sesgos heredados de Common Crawl y del pool DCLM: los datos web sin filtrado fino pueden contener sesgos sociales, desinformacion y contenido problematico.
- Licencia: los pesos son MIT (uso comercial permitido), pero los datos de entrenamiento derivan de DCLM (CC-BY-4.0) y estan sujetos a los terminos de uso de Common Crawl, lo que puede imponer condiciones sobre usos derivados del corpus.
- Contexto maximo, datos de evaluacion y cifras de entrenamiento detalladas: no disponibles en la model card; conviene verificarlos en el codigo de LinMix antes de cualquier uso serio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-vertex-linearlog-hellaswag
- Paper LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Codigo de LinMix (GitHub): https://github.com/credibleai/linmix
- Enjambre proxy (60M): https://huggingface.co/credible-ai/olmo2-60M-288domains-vertex
- Corpus WebOrganizer 200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Corpus tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core (GitHub): https://github.com/allenai/OLMo-core
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
