# dill-lab/GeoLadder-16M-8B-bs128-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-8B-bs128-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje de tipo decoder-only, estilo OLMo, con 16 millones de parametros, desarrollado por el grupo dill-lab. Forma parte de una suite de 108 modelos (de 4M a 75M de parametros) publicada junto al articulo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306). El objetivo del trabajo no es ofrecer un modelo de proposito general, sino estudiar si la geometria de la matriz de unembedding (en concreto su rango efectivo) permite estimar el rendimiento downstream.

El modelo se entrena sobre el corpus deduplicado the_pile_deduplicated, con un presupuesto de 8.000 millones de tokens, batch de 128 secuencias de 2048 tokens, learning rate pico de 0.0087, weight decay de 0.1 y un schedule coseno con LR final igual al 1% del pico. El repositorio publica 23 checkpoints intermedios como ramas independientes (de step0 a step30528), siguiendo el esquema de la suite Pythia, lo que lo hace util para estudiar dinamica de entrenamiento.

Su relevancia es fundamentalmente academica y metodologica: sirve como punto de control reproducible para investigar como las decisiones de preentrenamiento (batch size, weight decay, presupuesto de tokens, LR final) moldean metricas geometricas y si estas se correlacionan con el rendimiento. No es un modelo pensado para produccion ni para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (clase `OLMoForCausalLM`, libreria legacy `hf_olmo`) |
| Parametros totales | 16 millones (16M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (longitud de las secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible; los pesos se publican sin cuantizar |
| Idiomas soportados | no disponible (entrenado sobre the_pile_deduplicated, corpus predominantemente en ingles) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (checkpoint legacy de OLMo), acompanado de `config.json` y `config.yaml` original de OLMo |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion causal, implementado con la clase `OLMoForCausalLM` de la libreria `hf_olmo`. Es la misma familia arquitectonica que la suite OLMo de Allen Institute for AI, pero a una escala mucho menor: 16M de parametros, dentro del rango de 4M a 75M que cubre la suite GeoLadder. Para cargar el modelo es imprescindible instalar `ai2-olmo`, ya que el registro de la clase en `transformers` depende de ese paquete. El repositorio expone 23 checkpoints como ramas (`step0` ... `step30528`); `main` apunta al checkpoint final. Ademas incluye el orden exacto de los datos de entrenamiento en `data-indices/` y `train_data/global_indices.npy`.

El entrenamiento consume 8.000 millones de tokens del corpus deduplicado the_pile_deduplicated, con batch de 128 secuencias de 2048 tokens, learning rate pico de 0.0087, weight decay de 0.1 y decaimiento coseno hasta un LR final equivalente al 1% del pico (`alpha_f = 0.01`). No se documenta en la informacion disponible el uso de RLHF, DPO ni de ninguna fase de ajuste por preferencias: se trata de un preentrenamiento puro de investigacion. La innovacion relevante no es arquitectonica, sino experimental: el modelo es una de las 108 configuraciones controladas que el articulo usa para poner a prueba la hipotesis de que el rango efectivo de la matriz de unembedding predice el rendimiento, conclusion que el trabajo refuta parcialmente al encontrar una relacion inconsistente.

## Capacidades

- Generacion de texto autoregresiva basica, con la calidad esperable en un modelo de 16M de parametros entrenado con 8B de tokens.
- Modelado de lenguaje y calculo de perplejidad, que es su uso principal en el contexto del articulo.
- Analisis de representaciones internas: al publicar 23 checkpoints intermedios, permite trazar la evolucion de metricas geometricas (rango efectivo de la matriz de unembedding, espectro singular, etc.) a lo largo del entrenamiento.
- Reproducibilidad de experimentos: el orden de datos esta registrado, lo que habilita replicar el entrenamiento exacto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue especifica ni capacidades de vision, audio o modo "thinking".

## Casos de uso

- Investigacion sobre geometria de representaciones: usar los 23 checkpoints para medir como evoluciona la matriz de unembedding y contrastarlo con las conclusiones del articulo sobre rango efectivo y rendimiento.
- Estudios de dinamica de entrenamiento a bajo coste: con 16M de parametros, un ciclo completo de entrenamiento cabe en hardware modesto, lo que permite repetir variaciones de batch size, weight decay o LR final en horas.
- Ablaciones controladas de hiperparametros: el repositorio forma parte de una suite de 108 modelos; este checkpoint concreto sirve como una configuracion fija contra la que comparar otras combinaciones (por ejemplo, `bs128` frente a otros batch sizes).
- Docencia y divulgacion: es un modelo lo bastante pequeno como para inspeccionar pesos, activaciones y curvas de perdida en un portatil, lo que resulta practico en cursos de aprendizaje profundo.
- Pruebas de infraestructura de entrenamiento: validar pipelines de preprocesado, tokenizacion, checkpoints por rama y registro de orden de datos sin quemar GPU-dias.
- Prototipado de tecnicas de analisis post-hoc (podado, analisis espectral, deteccion de degradacion tardia) antes de escalarlas a modelos grandes.
- Referencia para investigacion en scaling laws en el regimen de parametros muy bajos (4M-75M), donde la literatura es menos densa que en la escala de miles de millones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar. El articulo asociado evalua la relacion entre metricas geometricas y rendimiento downstream dentro de su propia suite controlada, pero los valores numericos concretos de este checkpoint no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 64 MB en fp32 (16M de parametros x 4 bytes) y unos 32 MB en fp16. Con el overhead de activaciones y del runtime, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con mas de 1 GB de memoria sirve; el modelo es funcional incluso en CPU. No tiene sentido reservar una A100 o una H100 para inferencia de este checkpoint.
- Cabe sobradamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso GPUs integradas o Apple Silicon.
- Opciones de despliegue: `transformers` con `hf_olmo` instalado (`ai2-olmo`) es la via oficial documentada. No se publican pesos en formato GGUF, por lo que `llama.cpp` u `Ollama` requeririan una conversion previa no documentada en la informacion disponible. vLLM y TGI tampoco estan documentados para este modelo.
- Latencia y throughput: no disponible. Dado el tamano, se espera una latencia muy baja en GPU moderna, pero no hay cifras publicadas.
- Nota: el repositorio ocupa 2,8 GB pese a tener solo 16M de parametros, porque acumula 23 ramas de checkpoints con estado de optimizador y ficheros auxiliares; conviene descargar solo la rama necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-16M-8B (este modelo) | 16M | 2048 tokens | the_pile_deduplicated, 8B tokens | no disponible | HuggingFace, 23 checkpoints por rama |
| Pythia-14M (EleutherAI) | 14M | 2048 tokens | The Pile, 300B tokens | Apache 2.0 | HuggingFace, checkpoints intermedios |
| OTROS modelos de la suite GeoLadder | 4M-75M | 2048 tokens | the_pile_deduplicated | no disponible | Coleccion GeoLadder en HuggingFace |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | WebText | MIT | HuggingFace |

La comparacion mas directa es con Pythia-14M, tambien orientado a estudios de dinamica de entrenamiento y con checkpoints intermedios publicados. La diferencia clave es el presupuesto de tokens (8B frente a 300B) y la motivacion experimental: GeoLadder esta disenado para el analisis geometrico del articulo, mientras que Pythia busca ser una suite general de interpretabilidad. No se dispone de datos de rendimiento comparativos entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: con 16M de parametros no es competitivo para tareas reales de generacion, razonamiento o codigo.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas, dado su tamano reducido.
- Sesgos: al entrenarse sobre the_pile_deduplicated, hereda los sesgos presentes en ese corpus, aunque no se documenta ningun analisis de sesgo especifico.
- Limitacion idiomatica: no se declaran idiomas soportados; el corpus de entrenamiento es predominantemente en ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Contexto limitado a 2048 tokens, sin evidencia de extension por RoPE scaling ni tecnicas similares.
- Licencia no especificada: al no indicarse licencia, no se puede asumir permiso de uso comercial. Cualquier uso en produccion requiere aclarar previamente los terminos con los autores.
- Dependencia de la libreria legacy `hf_olmo`: requiere instalar `ai2-olmo` y puede presentar incompatibilidades con versiones recientes de `transformers`.
- Sin pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en ecosistemas distintos a PyTorch.
- Los checkpoints incluyen estado de optimizador, por lo que el repo pesa 2,8 GB aunque el modelo en si sea minimo; conviene descargar solo la revision necesaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs128-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Articulo en PMLR (ICML 2026, PMLR 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Discusion en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Nota: los resultados de la busqueda web realizada no contienen enlaces relevantes sobre este modelo; devuelven contenido no relacionado con la ficha.
