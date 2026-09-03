# gpjt/jax-no-mha-bias-no-dropout

## Resumen

`gpjt/jax-no-mha-bias-no-dropout` es un modelo de lenguaje causal de tipo GPT-2 pequeño, desarrollado por Giles Thomas como parte de su serie «LLM from scratch». Se trata de una reimplementación en JAX del código original de Sebastian Raschka (libro *Build a Large Language Model from Scratch*), con los pesos convertidos a formato PyTorch para su uso con la librería `transformers`. El modelo tiene 163 millones de parámetros (aunque el archivo `safetensors` contiene 175.583.232 parámetros, posiblemente por el embedding de salida no atado), una ventana de contexto de 1024 tokens y una arquitectura transformer con 12 capas, 12 cabezas de atención y dimensión de embedding de 768.

El modelo se entrenó desde cero sobre aproximadamente 3260 millones de tokens del dataset `gpjt/fineweb-gpt2-tokens`, una cantidad cercana al óptimo de Chinchilla para su tamaño. Su propósito principal es educativo: demostrar cómo construir y entrenar un LLM desde cero, y servir como base para experimentos de fine-tuning o análisis de arquitecturas. No está pensado para tareas de producción, y el propio autor advierte que es «tonto e ignorante» en comparación con modelos modernos. Su relevancia radica en ser un ejemplo reproducible y ligero de un GPT-2 con una modificación concreta (sin bias en la proyección de salida de la atención multi-cabeza), útil para estudiar el impacto de dicha decisión de diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 (12 capas, 12 cabezas, embedding 768) |
| Parametros totales | 163.000.320 (según model card; safetensors: 175.583.232) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16; se puede cuantizar con herramientas externas) |
| Idiomas soportados | ingles (dataset FineWeb, sin filtrado especifico de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 original descrita en el libro de Sebastian Raschka: un transformer decoder con 12 capas, cada una con atención multi-cabeza (12 cabezas) y una red feed-forward, normalización de capa pre-attention, y embeddings posicionales aprendidos. La diferencia principal respecto al GPT-2 original es que la proyección de salida de cada módulo de atención multi-cabeza no incluye sesgo (bias), de ahí el nombre `no-mha-bias`. Además, no se aplica weight tying entre el embedding de entrada y la capa de salida, y no se usa dropout (dropout = 0.0).

El entrenamiento se realizó en JAX sobre una GPU RTX 3090 local, con un total de 3.260.190.720 tokens (aproximadamente 20 veces el número de parámetros, siguiendo la regla de Chinchilla). Se usó un tamaño de lote global de 96 (micro-batch de 6), tasa de aprendizaje 0.0014 con programación (schedule), weight decay 0.01, y gradient clipping con norma máxima 3.5. No se aplicó ninguna técnica de alineación como RLHF o DPO; es un modelo base entrenado únicamente con modelado de lenguaje autorregresivo.

## Capacidades

- Generacion de texto: produce texto coherente a corto plazo, aunque con limitaciones claras por su tamaño y volumen de entrenamiento.
- Razonamiento basico: puede completar frases y seguir patrones simples, pero no es fiable para tareas de razonamiento complejo.
- Codigo: no tiene capacidades especificas de generacion de codigo entrenadas; su rendimiento en este ambito es muy limitado.
- Matematicas: no se han reportado capacidades destacables; falla en operaciones aritmeticas simples.
- Multilingue: entrenado principalmente con texto en ingles (dataset FineWeb); no se garantiza soporte para otros idiomas.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Thinking mode: no disponible.
- Vision o audio: no aplica, es solo texto.

## Casos de uso

- Educacion y aprendizaje: el modelo es ideal para estudiar el funcionamiento interno de un transformer GPT-2, hacer fine-tuning en tareas pequenas o analizar el efecto de eliminar el bias en la atencion. Se puede cargar con `AutoModelForCausalLM` y `trust_remote_code=True`.
- Experimentacion con tecnicas de cuantizacion: al ser pequeno (163M), se puede cuantizar a int8 o int4 con herramientas como `bitsandbytes` o `llama.cpp` para estudiar el impacto en la perplejidad y la velocidad.
- Base para fine-tuning en dominios especificos: con un dataset pequeno (por ejemplo, textos de un area concreta), se puede ajustar para generar contenido tematico, aunque los resultados seran limitados.
- Pruebas de infraestructura: sirve para validar pipelines de entrenamiento o inferencia en entornos con recursos minimos (CPU, GPU de baja gama) antes de escalar a modelos mayores.
- Comparacion arquitectonica: permite comparar el efecto de quitar el bias en la proyeccion de salida de la atencion frente a un GPT-2 estandar, usando el mismo corpus y configuracion.
- Generacion de texto creativo corto: puede producir fragmentos de texto (poesia, micro-relatos) con sampling adecuado (temperatura alta, top-k), aunque la coherencia se pierde rapidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas como MMLU, HumanEval o GSM8K. Dado el tamano y el volumen de entrenamiento, se espera un rendimiento muy inferior al de modelos como GPT-2 small original (124M) en tareas estandar, pero no hay datos cuantitativos para confirmarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo ocupa aproximadamente 652 MB (175M parametros × 4 bytes); en fp16, unos 326 MB; en int8, unos 163 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. Incluso puede ejecutarse en CPU con razonable velocidad (varios tokens por segundo).
- Compatibilidad con consumer GPU: si, es un modelo muy ligero.
- Opciones de despliegue: se puede usar con `transformers` (pipeline de generacion), `vLLM` (aunque no esta optimizado para modelos tan pequenos), `llama.cpp` (si se convierte a GGUF), `Ollama` (si se importa), o directamente con PyTorch.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 3090), se espera una generacion de decenas de tokens por segundo; en CPU, unos pocos tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpjt/jax-no-mha-bias-no-dropout | 163M | 1024 | Apache 2.0 | GPT-2 modificado, sin bias en MHA, entrenado en JAX |
| GPT-2 small (openai-community/gpt2) | 124M | 1024 | MIT | Modelo original de OpenAI, con bias en MHA y weight tying |
| DistilGPT-2 (distilbert/distilgpt2) | 82M | 1024 | Apache 2.0 | Version destilada de GPT-2, mas pequena y rapida |

No se dispone de benchmarks comparativos publicados. La principal diferencia con GPT-2 small es el tamano (163M vs 124M) y la ausencia de bias en la atencion, ademas de que este modelo se entreno con un dataset mas moderno (FineWeb) y con una cantidad de tokens cercana al optimo de Chinchilla, mientras que GPT-2 original se entreno con WebText.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con FineWeb (subconjunto de Common Crawl), puede heredar sesgos presentes en la web, aunque no se han documentado explicitamente.
- Riesgo de alucinacion: alto, especialmente en tareas de hechos y conocimiento general, debido al bajo volumen de entrenamiento (3.26B tokens) y al tamano reducido.
- Limitaciones de contexto: ventana de 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Limitaciones de idioma: entrenado principalmente en ingles; el rendimiento en otros idiomas es muy pobre o inexistente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es apto para produccion por su baja calidad.
- Caveat de implementacion: requiere `trust_remote_code=True` al cargarlo con `transformers`, lo que implica ejecutar codigo personalizado del autor. Se recomienda revisar el codigo antes de usarlo en entornos sensibles.
- Discrepancia en el numero de parametros: la model card indica 163M, pero el archivo `safetensors` contiene 175.583.232 parametros. Esto puede deberse a que el embedding de salida no esta atado (weight tying = False), lo que anade parametros adicionales. El usuario debe tenerlo en cuenta al dimensionar recursos.

## Enlaces

- HuggingFace: https://huggingface.co/gpjt/jax-no-mha-bias-no-dropout
- Repositorio GitHub: https://github.com/gpjt/ddp-base-model-from-scratch
- Blog post del autor: https://www.gilesthomas.com/2026/07/llm-from-scratch-34b-building-and-training-gpt-2-small-in-jax
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Libro de Sebastian Raschka: https://www.manning.com/books/build-a-large-language-model-from-scratch
