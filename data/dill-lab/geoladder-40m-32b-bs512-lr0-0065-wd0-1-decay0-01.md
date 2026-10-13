# dill-lab/GeoLadder-40M-32B-bs512-lr0.0065-wd0.1-decay0.01

## Resumen

GeoLadder-40M-32B-bs512-lr0.0065-wd0.1-decay0.01 es un modelo de lenguaje de tipo transformer decoder-only con aproximadamente 40 millones de parametros, publicado por el grupo de investigacion dill-lab. No es un modelo pensado para uso en produccion, sino una de las 108 configuraciones entrenadas de forma controlada para el estudio "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306), en el que se analiza si la geometria de la matriz de unembedding (en particular su rango efectivo) permite estimar el rendimiento posterior del modelo.

El modelo sigue la arquitectura OLMo de AI2 (`OLMoForCausalLM`, arquitectura legacy `hf_olmo`) y se entreno sobre la version deduplicada de The Pile con un presupuesto de 32.000 millones de tokens, batch size de 512 secuencias de 2048 tokens, learning rate maximo de 0.0065, weight decay de 0.1 y decaimiento coseno con LR final igual al 1 % del maximo. La nomenclatura del repositorio codifica cada uno de esos hiperparametros, de modo que el modelo es directamente comparable con el resto de la suite GeoLadder (modelos de 4M a 75M de parametros).

Su relevancia es fundamentalmente metodologica: proporciona checkpoints intermedios (23 ramas, de `step0` a `step30528`) con el orden exacto de los datos de entrenamiento registrado, lo que permite reproducir trayectorias de entrenamiento y estudiar fenomenos de degradacion tardia, escalado y geometria interna con un coste computacional muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (`OLMoForCausalLM`, legacy `hf_olmo`) |
| Parametros totales | ~40M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (las secuencias de entrenamiento son de 2048 tokens) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precision de entrenamiento; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el corpus de entrenamiento, `EleutherAI/the_pile_deduplicated`, es mayoritariamente en ingles) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`), mas `config.json` de HuggingFace y `config.yaml` original de OLMo |

Hiperparametros de entrenamiento declarados por el autor:

| Hiperparametro | Valor |
|---|---|
| Tamano del modelo | 40M |
| Tokens de entrenamiento | 32B |
| Batch size (secuencias de 2048 tokens) | 512 |
| Learning rate maximo | 0.0065 |
| Weight decay | 0.1 |
| LR final como fraccion del maximo (`alpha_f`, schedule coseno) | 0.01 |
| Numero de checkpoints publicados | 23 ramas (`step0` a `step30528`; `main` = `step30528`) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con la implementacion OLMo de AI2, cargable mediante la libreria `ai2-olmo`, que registra `OLMoForCausalLM` en `transformers`. El modelo tiene 40M de parametros y se entreno durante 32.000 millones de tokens, lo que supone un ratio de aproximadamente 800 tokens por parametro, coherente con el regimen de sobreentrenamiento tipico de las suites de modelos pequenos orientadas a investigacion (Pythia, OLMo). No se dispone de informacion sobre el numero de capas, dimension del modelo, cabezas de atencion, uso de RoPE ni de sesgos en las proyecciones; la model card no detalla esos extremos.

Los datos de entrenamiento provienen de `EleutherAI/the_pile_deduplicated`, la version deduplicada de The Pile. El repositorio incluye `data-indices/` y `train_data/global_indices.npy`, que registran el orden exacto en que se consumieron los datos, un detalle inusual y valioso para reproducibilidad. No se menciona ningun tipo de ajuste posterior (RLHF, DPO, SFT): se trata de un modelo exclusivamente preentrenado. La innovacion tecnica del trabajo no esta en la arquitectura, sino en el diseno experimental: 108 modelos entrenados bajo variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final, para evaluar si metricas geometricas del unembedding (rango efectivo) predicen el rendimiento. La conclusion del paper es negativa: la relacion es inconsistente y ninguna de esas metricas predice de forma fiable el rendimiento posterior.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el reducido tamano del modelo (40M de parametros).
- Modelado de lenguaje y calculo de perplexity, que es el uso principal previsto en el contexto del paper.
- Analisis de trayectorias de entrenamiento: la publicacion de 23 checkpoints intermedios permite estudiar la evolucion de representaciones, perdida y metricas geometricas a lo largo del entrenamiento.
- Reproduccion exacta de la secuencia de datos de entrenamiento gracias a los indices publicados.
- Comparacion controlada de hiperparametros frente a las otras 107 configuraciones de la coleccion GeoLadder.
- No hay evidencia ni declaracion de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se declaran capacidades multilingues especificas; no disponible la lista de idiomas soportados.

## Casos de uso

- Investigacion sobre leyes de escalado: el modelo, junto con el resto de la suite de 4M a 75M de parametros, permite trazar curvas de perdida frente a tokens y tamano con un coste de entrenamiento minimo, aislando el efecto de hiperparametros concretos como el batch size o el weight decay.
- Estudio de geometria interna de representaciones: con 23 checkpoints intermedios se puede medir la evolucion del rango efectivo de la matriz de unembedding y contrastarla con la degradacion tardia descrita en el paper, sin necesidad de reentrenar.
- Ablacion controlada de hiperparametros: dado que la nomenclatura del repositorio codifica tamano, tokens, batch size, LR, weight decay y decaimiento, se puede seleccionar la configuracion adecuada para aislar una variable concreta frente al modelo de referencia.
- Reproducibilidad de pipelines de preentrenamiento: los ficheros `data-indices/` y `global_indices.npy` permiten reconstruir el orden exacto de las muestras, util para auditar frameworks de entrenamiento o comparar implementaciones de data loaders.
- Docencia y formacion: al caber en CPU y en cualquier GPU de consumo, sirve para ilustrar el ciclo completo de preentrenamiento, carga de checkpoints y evaluacion de perplexity en cursos de aprendizaje profundo.
- Baseline de referencia en evaluaciones de modelos pequenos: se puede usar como punto de comparacion de perplexity o de metricas geometricas frente a arquitecturas alternativas del mismo rango de parametros.
- Analisis de degradacion tardia del entrenamiento: los checkpoints finales permiten estudiar el fenomeno de perdida de rendimiento en etapas avanzadas y su relacion con la geometria del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, PIQA, WinoGrande, ARC ni de perplexity sobre conjuntos de validacion, y los resultados de busqueda web proporcionados no contienen datos tecnicos utilizables sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 160 MB en fp32, unos 80 MB en fp16/bf16 y unos 40 MB en int8, calculados a partir de los 40M de parametros (sin contar activaciones, que son despreciables a este tamano).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 Ti o una iGPU moderna; tambien es viable la inferencia en CPU. No se requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU de consumo, asi como en dispositivos de borde y en entornos sin GPU.
- Opciones de despliegue: `transformers` junto con `ai2-olmo` (que registra `OLMoForCausalLM`); es el unico camino documentado por el autor. El soporte en vLLM, TGI, llama.cpp u Ollama no esta confirmado para esta arquitectura legacy y no se proporcionan pesos en formato GGUF.
- Latencia y throughput estimados: no disponibles. De forma orientativa, a 40M de parametros la generacion es del orden de miles de tokens por segundo en GPU moderna, pero no hay cifras publicadas por el autor.
- Nota de almacenamiento: el repositorio ocupa 6,3 GB porque contiene los 23 checkpoints, no porque el modelo en si sea grande. Conviene descargar una sola revision (`revision="step10000"`, etc.) para evitar el peso completo.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Corpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-40M-32B (este modelo) | ~40M | No disponible (entrenado con secuencias de 2048) | the_pile_deduplicated, 32B tokens | No disponible | HuggingFace, requiere `ai2-olmo` |
| Pythia-70M (EleutherAI) | 70M | 2048 | The Pile, ~300B tokens | Apache 2.0 | HuggingFace, 154 checkpoints |
| OLMo-1B (AI2) | ~1.200M | 2048 | Dolma | Apache 2.0 | HuggingFace |
| GPT-2 small (OpenAI) | 124M | 1024 | WebText | MIT | HuggingFace |

Diferencias clave: frente a Pythia-70M, este modelo entrena con un presupuesto de tokens mucho menor (32B frente a ~300B) y su proposito no es ofrecer un modelo utilizable, sino servir de punto de medida en un experimento factorial de hiperparametros. Su ventaja practica es la publicacion de indices de datos y de la configuracion OLMo original, que Pythia no ofrece en el mismo formato. Su desventaja es la ausencia total de benchmarks y de licencia declarada.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: con 40M de parametros y solo 32B tokens de entrenamiento, su calidad de generacion de texto es muy baja y su tendencia a la incoherencia y a la fabricacion de contenido es alta.
- No se han publicado evaluaciones de sesgo, toxicidad ni alineacion. Al entrenarse sobre The Pile, hereda los sesgos documentados de ese corpus.
- Riesgo de alucinacion elevado, inherente a un modelo de este tamano sin ajuste por instrucciones ni RLHF.
- No se declara licencia. Esto bloquea cualquier uso comercial o redistribucion sin aclaracion previa del autor; conviene contactar con dill-lab antes de reutilizarlo.
- No se declaran los idiomas soportados ni el reparto linguistico del corpus, aunque The Pile es predominantemente ingles.
- La longitud de contexto no esta declarada explicitamente en la informacion disponible; las secuencias de entrenamiento eran de 2048 tokens, pero no se confirma que la posicion maxima del modelo sea esa.
- La arquitectura es `hf_olmo` legacy: requiere instalar `ai2-olmo` y no carga con una instalacion estandar de `transformers`.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria ni issues que confirmen que la carga funciona correctamente en distintos entornos.
- Ausencia de pesos cuantizados: no hay versiones GGUF, AWQ o GPTQ, de modo que el despliegue en llama.cpp u Ollama exigiria una conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-40M-32B-bs512-lr0.0065-wd0.1-decay0.01
- Coleccion GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper en PMLR: https://proceedings.mlr.press/v306/kulkarni26c.html
- arXiv: https://arxiv.org/abs/2602.20433
- OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Libreria ai2-olmo: https://github.com/allenai/OLMo
