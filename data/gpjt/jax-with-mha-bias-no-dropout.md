# gpjt/jax-with-mha-bias-no-dropout

## Resumen

gpjt/jax-with-mha-bias-no-dropout es un modelo de lenguaje causal de tipo GPT-2 entrenado desde cero por Giles Thomas (gpjt), basado en la arquitectura descrita por Sebastian Raschka en su libro "Build a Large Language Model (from Scratch)". Se trata de un modelo base de aproximadamente 163 millones de parametros segun la model card (175,6 millones segun los pesos safetensors), con 12 capas, 12 cabezas de atencion y dimension de embedding de 768. El entrenamiento se realizo en JAX mediante una reimplementacion de codigo abierto del codigo original en PyTorch, aunque los pesos se han convertido a un formato compatible con PyTorch para su uso con la libreria transformers.

El modelo fue entrenado con aproximadamente 3.260 millones de tokens del dataset gpjt/fineweb-gpt2-tokens, una cantidad cercana al optimo de Chinchilla (unas 20 veces el numero de parametros). La variante "no-dropout" elimina el dropout durante el entrenamiento, y "with-mha-bias" anade sesgo a las proyecciones de salida de la atencion multi-cabeza. El autor advierte explicitamente que es un modelo pequeno con capacidades limitadas, pensado para experimentacion y aprendizaje mas que para uso en produccion.

Su relevancia radica en su valor educativo y de investigacion: permite estudiar el comportamiento de un LLM de tamano reducido entrenado con una cantidad optima de datos, y sirve como base para experimentos de fine-tuning. Su licencia Apache 2.0 facilita su uso y modificacion sin restricciones comerciales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 (12 capas, 12 cabezas, embedding 768) |
| Parametros totales | 163.000.320 segun la model card; 175.592.448 segun los pesos safetensors (discrepancia no explicada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset de entrenamiento, FineWeb, es principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 small descrita por Sebastian Raschka: un transformer causal con 12 capas, 12 cabezas de atencion multi-cabeza, dimension de embedding de 768, sin sesgo en las proyecciones QKV y sin weight tying entre las capas de embedding y de salida. La variante concreta anade sesgo a las proyecciones de salida de la atencion multi-cabeza (de ahi "with-mha-bias") y elimina el dropout (de ahi "no-dropout"). El codigo de entrenamiento original es de Raschka en PyTorch, pero Giles Thomas lo reimplemento en JAX como parte de su serie de articulos sobre construccion de LLMs desde cero.

El entrenamiento se realizo en una maquina local con una RTX 3090, con un total de 3.260.190.720 tokens del dataset gpjt/fineweb-gpt2-tokens, una cantidad considerada optima segun Chinchilla (20 veces el numero de parametros). Los hiperparametros incluyen micro-batch de 6, batch global de 96, dropout de 0.0, gradient clipping de 3.5, learning rate de 0.0014 con schedule, y weight decay de 0.01. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion posterior: es un modelo base puro.

## Capacidades

- Generacion de texto causal: produce texto continuando un prompt dado, con soporte para sampling con temperatura y top-k.
- Modelo base sin fine-tuning: no esta alineado para seguir instrucciones ni para dialogos multi-turno.
- Integracion con transformers: compatible con `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM`, asi como con el pipeline de `text-generation`.
- Requiere `trust_remote_code=True` por usar codigo personalizado.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada: entrenado principalmente con datos en ingles, sin confirmacion oficial de otros idiomas.

## Casos de uso

- Educacion y aprendizaje de arquitecturas LLM: el modelo permite a estudiantes y desarrolladores inspeccionar los pesos y la arquitectura interna de un GPT-2 entrenado desde cero, ideal para acompanar el libro de Raschka o cursos de LLMs.
- Experimentos de fine-tuning: al ser un modelo base pequeno con licencia permisiva, sirve como punto de partida para probar tecnicas de fine-tuning (instrucciones, adaptacion a dominios especificos) sin coste computacional elevado. El autor proporciona un notebook de ejemplo para fine-tuning.
- Investigacion sobre leyes de escalado: al estar entrenado con una cantidad Chinchilla-optima de tokens, permite estudiar el comportamiento de modelos pequenos entrenados de forma eficiente y comparar con modelos sobrentrenados.
- Prototipado de pipelines de NLP: su tamano reducido permite integrarlo en pipelines de preprocesamiento o generacion de texto en entornos con recursos limitados, como validacion de conceptos antes de migrar a modelos mayores.
- Benchmarking de infraestructura: sirve para medir el rendimiento de frameworks de inferencia (vLLM, TGI, llama.cpp) o de entrenamiento distribuido (JAX vs PyTorch) con una carga de trabajo realista pero ligera.
- Generacion de texto creativo experimental: puede usarse para explorar las limitaciones y peculiaridades de un modelo pequeno entrenado con datos web, aunque el propio autor desaconseja expectativas altas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 700 MB en FP32 y 350 MB en FP16, por lo que cabe en cualquier GPU moderna e incluso en CPU con memoria suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; el entrenamiento se realizo en una RTX 3090 (24 GB).
- Compatible con GPUs de consumo: si, incluyendo RTX 3060, RTX 4070, RTX 4090, y tarjetas de gama baja.
- Opciones de despliegue: al requerir codigo personalizado, la via principal es transformers con `trust_remote_code=True`. No se menciona soporte explicito para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. Dado el tamano del modelo, se espera una latencia baja incluso en CPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpjt/jax-with-mha-bias-no-dropout (este modelo) | ~163-175 M | 1.024 | Apache 2.0 | Entrenado en JAX, convertido a PyTorch |
| GPT-2 small | 124 M | 1.024 | MIT modificada | Modelo original de OpenAI, referencia historica |
| gpjt/jax-with-mha-bias-no-dropout-2-epoch | Similar | 1.024 | Apache 2.0 | Variante del mismo autor entrenada con 2 epocas |
| gpjt/jax-with-mha-bias-larger-chinchilla-1 | Entre GPT-2 small y medium | 1.024 | Apache 2.0 | Variante con mas parametros, coste de entrenamiento equivalente a un modelo 2x sobrentrenado |

## Limitaciones y advertencias

- El propio autor advierte que el modelo es "tonto e ignorante": con solo 163 millones de parametros y entrenamiento Chinchilla-optimo, no conoce muchos datos factuales y su capacidad de razonamiento es muy limitada.
- No es un modelo alineado: no sigue instrucciones ni mantiene dialogos coherentes sin fine-tuning previo.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo personalizado del autor; debe evaluarse el riesgo de seguridad en entornos de produccion.
- Longitud de contexto limitada a 1.024 tokens, insuficiente para tareas que requieran contexto largo.
- Idiomas: entrenado principalmente con datos en ingles (FineWeb); el rendimiento en otros idiomas no esta documentado y probablemente sea pobre.
- Riesgo de alucinacion elevado por ser un modelo base pequeno sin alineacion.
- No se han publicado benchmarks, por lo que no hay datos objetivos de rendimiento frente a otros modelos.
- Discrepancia no resuelta entre los parametros declarados en la model card (163 M) y los pesos safetensors (175,6 M).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/jax-with-mha-bias-no-dropout
- Repositorio de entrenamiento (JAX): https://github.com/gpjt/jax-gpt2-from-scratch
- Repositorio de inferencia: https://github.com/gpjt/ddp-base-model-from-scratch
- Articulo del blog del autor: https://www.gilesthomas.com/2026/07/llm-from-scratch-34b-building-and-training-gpt-2-small-in-jax
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Variante 2-epoch: https://huggingface.co/gpjt/jax-with-mha-bias-no-dropout-2-epoch
- Variante larger-chinchilla-1: https://huggingface.co/gpjt/jax-with-mha-bias-larger-chinchilla-1
