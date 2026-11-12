# guan-wang/EBFM-DCLM-1B

## Resumen

EBFM-DCLM-1B es un modelo de lenguaje de aproximadamente 1.028 millones de parametros (1B) desarrollado por el autor `guan-wang` y publicado en el marco del proyecto OpenEBFM. Se trata de un modelo de lenguaje basado en energia (energy-based language model, EBLM) con una arquitectura propia denominada OpenEBFM (variante d26), exportada para su uso con Hugging Face Transformers mediante codigo remoto. El checkpoint corresponde a la fase de preentrenamiento sobre el dataset DCLM y se distribuye con licencia MIT.

La relevancia del modelo reside en su caracter experimental: no es un transformer autoregresivo convencional, sino una implementacion de modelo de lenguaje basado en energia, una familia arquitectonica alternativa que modela la distribucion del lenguaje mediante funciones de energia en lugar de factorizar la probabilidad token a token. El pipeline declarado es `fill-mask`, lo que orienta su uso hacia tareas de enmascarado y puntuacion de secuencias mas que hacia generacion autoregresiva directa.

El modelo tiene 26 bloques, dimension de embedding de 1664, 13 cabezas de atencion, vocabulario de 32768 tokens y una longitud de contexto de 2048 tokens. El repositorio ocupa 4,1 GB y emplea pesos en formato safetensors junto con implementacion Python remota (`modeling_ebfm.py`, `configuration_ebfm.py`). El informe tecnico asociado es "OpenESM: Energy-Steered Models Are Scalable Foundation Learners" (arXiv:2610.33005).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenEBFM (modelo de lenguaje basado en energia, variante d26), implementacion custom con 26 bloques |
| Parametros totales | 1.028.275.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors); tokenizer en tokenizer.pkl y tokenizer_config.json |
| Dimension de embedding | 1664 |
| Cabezas de atencion | 13 |
| Tamano de vocabulario | 32768 |
| Pipeline declarado | fill-mask |
| Dataset de entrenamiento | DCLM |
| Etapa de entrenamiento | preentrenamiento |
| Tamano del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura OpenEBFM, una variante de modelo de lenguaje basado en energia (energy-based language model) con 26 bloques, dimension de embedding de 1664 y 13 cabezas de atencion. A diferencia de un transformer autoregresivo estandar, un EBLM define una funcion de energia sobre secuencias y deriva de ella la distribucion de probabilidad, lo que cambia el paradigma de inferencia y de puntuacion. La implementacion no es nativa de Transformers: requiere `trust_remote_code=True` y carga codigo Python remoto (`modeling_ebfm.py`, `configuration_ebfm.py`) junto con un tokenizer serializado propio (`tokenizer.pkl`) y una tabla de bytes de token (`token_bytes.pt`) usada por las metricas de OpenEBFM.

El entrenamiento corresponde a la fase de preentrenamiento sobre el dataset DCLM. La informacion disponible no detalla el numero de tokens vistos, la composicion exacta del corpus, ni si se aplicaron etapas de RLHF, DPO u otro ajuste posterior. El checkpoint se etiqueta como "variant d26" y el autor indica que la escala de parametros (1B) es la etiqueta usada en la configuracion de OpenEBFM, mientras que los ajustes de arquitectura y secuencia se leen directamente de la configuracion del checkpoint exportado. El informe tecnico asociado (arXiv:2610.33005) es la referencia para los detalles de diseno y entrenamiento, que no se reproducen en la model card.

## Capacidades

- Modelado de lenguaje enmascarado: el pipeline declarado es `fill-mask`, por lo que el uso previsto es la prediccion de tokens enmascarados y la puntuacion de secuencias.
- Puntuacion basada en energia: al ser un EBLM, el modelo asigna una funcion de energia a las secuencias, lo que permite ordenar o puntuar candidatos en lugar de generar token a token.
- Codificacion de texto: dispone de tokenizer propio (vocabulario de 32768 tokens) y produce logits sobre el vocabulario.
- Razonamiento, codigo, matematicas y vision: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Puntuacion y reranking de candidatos: el modelo puede usarse para asignar una puntuacion energetica a secuencias generadas por otro sistema y reordenar las respuestas, ya que su naturaleza EBLM esta orientada a evaluar secuencias completas.
- Rellenado de huecos (fill-mask): dado el pipeline declarado, es adecuado para tareas de completado de tokens enmascarados en textos de hasta 2048 tokens, util en preprocesado y aumento de datos.
- Investigacion en arquitecturas alternativas: sirve como referencia reproducible para estudiar modelos de lenguaje basados en energia frente a transformers autoregresivos, con pesos abiertos y licencia MIT.
- Deteccion de anomalias textuales: la funcion de energia puede emplearse para identificar secuencias improbables o fuera de distribucion en corpus de dominios concretos.
- Filtrado de datos de entrenamiento: la puntuacion por energia permite priorizar o descartar muestras de un corpus (por ejemplo, en la curacion de datasets para otros modelos), aprovechando el contexto de 2048 tokens.
- Experimentos academicos de escalado: con 1B parametros y 26 bloques, es un punto de partida asequible para estudiar leyes de escalado y comportamiento de EBLM en hardware de una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision de 32 bits, los 1.028 millones de parametros ocupan aproximadamente 4,1 GB solo en pesos; con activaciones y overhead de PyTorch conviene reservar entre 6 y 8 GB. En bfloat16 o float16 el peso baja a unos 2,1 GB, con un total estimado de 4 a 6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32 en inferencia; una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o A100/H100 son suficientes. El modelo cabe en GPU de consumo.
- Cabe en consumer GPU: si, en tarjetas de 8 GB o mas en FP16/BF16 y en tarjetas de 12 GB o mas en FP32.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la via documentada. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura custom con codigo remoto, la compatibilidad con esos motores no esta garantizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBFM-DCLM-1B | 1.028 M | 2048 | EBLM custom (OpenEBFM d26) | MIT | Hugging Face, codigo remoto |
| Modelos transformer 1B de referencia (p. ej. familia Llama/TinyLlama/Qwen de ~1B) | ~1.000 M | 2048-32768 segun modelo | Transformer autoregresivo | variable (Apache 2.0, MIT, etc.) | Hugging Face, nativo en Transformers |
| Modelos EBLM alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con modelos transformer de ~1B es solo orientativa en escala: la arquitectura EBLM cambia el paradigma de inferencia y no se dispone de benchmarks que permitan comparar rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Modelo de preentrenamiento: no consta ajuste por instrucciones ni alineacion (RLHF/DPO), por lo que no debe esperarse comportamiento conversacional fiable.
- Arquitectura experimental: el uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python remoto del repositorio; conviene revisarlo antes de desplegarlo en produccion.
- Contexto limitado: 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue es desconocido.
- Alucinacion y sesgos: no hay informacion publicada sobre evaluaciones de sesgo o tasas de alucinacion; al ser un modelo de preentrenamiento sobre DCLM, hereda los sesgos del corpus.
- Compatibilidad: al no ser un transformer estandar, puede no funcionar con herramientas de inferencia habituales (vLLM, llama.cpp, Ollama) ni con tecnicas de cuantizacion estandar.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad del uso recae en el integrador.
- Ecosistema limitado: 79 descargas y 1 like en el momento de la consulta, lo que implica poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/EBFM-DCLM-1B
- Repositorio de codigo OpenEBFM: https://github.com/datamllab/openebfm
- Informe tecnico (paper): https://huggingface.co/papers/2610.33005
- arXiv: https://arxiv.org/abs/2610.33005
