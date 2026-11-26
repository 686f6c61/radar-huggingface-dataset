# credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-arc

## Resumen

olmo2-1B-288domains-dirichlet-lightgbm-arc es un modelo de lenguaje de 1.410 millones de parametros desarrollado por credible-ai como artefacto de investigacion para reproducir los experimentos del articulo LinMix (Data Mixing as Linear Domain Attribution). No es un modelo de proposito general: se ha preentrenado especificamente para evaluar una metodologia de mezcla de datos de entrenamiento optimizada para el benchmark ARC.

El modelo parte de la arquitectura OLMo 2 (Olmo2ForCausalLM), con 18 capas y un tamano de representacion oculta de 2048, y se ha entrenado sobre 32.000 millones de tokens extraidos del corpus WebOrganizer. La innovacion central no reside en la arquitectura, sino en la estrategia de mezcla de datos: los pesos de muestreo sobre 288 dominios (combinacion de tematica y formato) se optimizaron mediante RegMix, usando un surrogate LightGBM ajustado sobre un enjambre Dirichlet de modelos proxy de 60 millones de parametros.

Su relevancia es metodologica: proporciona un punto de referencia reproducible para estudiar como la composicion del corpus afecta al rendimiento en tareas concretas, y publica tanto los pesos entrenados como el archivo mix.json con la mezcla exacta de datos utilizada. Esta pensado para investigadores en data mixing, no para despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (Olmo2ForCausalLM), transformer decoder-only |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 implementada en Transformers, con 18 capas, dimension oculta de 2048 y el tokenizador de GPT-NeoX-20B (vocabulario de 50.432 tokens). Los pesos se distribuyen en bfloat16 y el repositorio ocupa 2,8 GB. No se documentan innovaciones arquitectonicas propias: el interes esta en el pipeline de datos.

El entrenamiento se realizo con OLMo-core sobre 32.000 millones de tokens del corpus WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los terminos de uso de Common Crawl. La mezcla de datos se organiza en 288 dominios (cruce de tematica y formato) y sus pesos se optimizaron con RegMix: se entreno un enjambre de modelos proxy de 60 millones de parametros sobre muestreos Dirichlet, se ajusto un surrogate LightGBM para predecir el rendimiento en ARC y se seleccionaron los pesos que maximizan dicha metrica. El repositorio incluye mix.json con la mezcla resultante y las secuencias tokenizadas en credible-ai/weborganizer-corpus-200b-tokenized.

## Capacidades

- Generacion de texto autoregresiva en ingles, como modelo causal estandar.
- Razonamiento basico y respuesta a preguntas de dominio general, limitado por su escala de 1,41B parametros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking, vision ni audio.
- Valor principal: servir como sujeto de estudio en experimentos de atribucion y mezcla de datos.

## Casos de uso

- Reproduccion de experimentos de LinMix: cargar el modelo y el archivo mix.json para replicar los resultados del articulo sobre el benchmark ARC y comparar con otras mezclas.
- Investigacion en data mixing: usar este checkpoint como referencia entrenada con pesos RegMix frente a mezclas uniformes o heuristicas, midiendo el efecto de la composicion del corpus.
- Estudio de atribucion lineal por dominio: analizar como contribuye cada uno de los 288 dominios al rendimiento final mediante las tecnicas descritas en el paper.
- Validacion de surrogates LightGBM: comparar las predicciones del surrogate entrenado sobre el enjambre de 60M con el rendimiento real del modelo de 1,41B.
- Docencia y divulgacion: ejemplo practico y reproducible de pipeline completo de mezcla de datos (tokenizacion, enjambre Dirichlet, surrogate, entrenamiento final) con codigo abierto en GitHub.
- Baseline en estudios de escalado: punto de comparacion de 1,41B parametros para analizar si las mezclas optimizadas a 60M transfieren a escalas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la mezcla se optimizo para ARC, pero no incluye cifras de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,8 GB solo para pesos, mas overhead de activaciones y cache KV; aproximadamente 4-6 GB en la practica.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8 GB (cuantizaciones no publicadas oficialmente, requieren conversion).
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4070, RTX 4090. En datacenter, A100 o H100 son sobredimensionadas para este tamano.
- Cabe holgadamente en GPU consumer, incluidas tarjetas de 8 GB.
- Opciones de despliegue: transformers (soporte nativo), llama.cpp y Ollama previa conversion a GGUF, vLLM y TGI para serving por lotes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-lightgbm-arc | 1,41B | no disponible | MIT | Artefacto de investigacion (data mixing) |
| OLMo 2 1B (AllenAI) | ~1B | no disponible en esta ficha | Apache 2.0 (modelo base de referencia) | Modelo de proposito general |
| credible-ai/olmo2-60M-288domains-dirichlet | 60M | no disponible | no disponible | Proxy del enjambre Dirichlet para RegMix |

La comparacion relevante es con el OLMo 2 1B original y con el proxy de 60M del mismo autor: el primero sirve como referencia de capacidades generales y el segundo como pieza del pipeline de optimizacion. No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo describe explicitamente como artefacto de investigacion.
- Entrenado unicamente en ingles; el rendimiento en otros idiomas sera deficiente.
- Solo 32.000 millones de tokens de entrenamiento, muy por debajo de los modelos de produccion de escala similar.
- Riesgo elevado de alucinacion y de respuestas incoherentes en tareas abiertas o de razonamiento complejo.
- Los datos provienen de Common Crawl, por lo que hereda sesgos y ruido del corpus web, ademas de posibles contenidos problematicos.
- La mezcla esta optimizada para ARC; puede degradar el rendimiento en otras tareas respecto a una mezcla uniforme.
- No se documenta la longitud de contexto soportada, lo que impide planificar usos con ventanas largas.
- Licencia MIT en los pesos, pero el uso de los datos subyacentes queda sujeto a CC-BY-4.0 y a los terminos de Common Crawl.
- No apto para produccion ni para decisiones automatizadas sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-arc
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo: https://github.com/credibleai/linmix
- Modelo proxy de 60M: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Corpus original: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentacion OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
