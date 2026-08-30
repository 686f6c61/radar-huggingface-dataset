# ewinregirgojr/qwen3.8-27b-pruned-research

## Resumen

El modelo `ewinregirgojr/qwen3.8-27b-pruned-research` es un experimento de compresión y poda (pruning) sobre el modelo multimodal Qwen3.8-27B de Alibaba, desarrollado por el usuario independiente ewinregirgojr. Su objetivo es reducir drásticamente el tamaño y los requisitos de memoria del modelo original manteniendo la calidad dentro de un umbral de degradación del 2%, para permitir su ejecución en hardware de gama baja como GPUs T4 de 16 GB (típicas de Google Colab y Kaggle).

El candidato seleccionado, denominado `sparsegpt_s030_awq4`, combina una poda del 30% de los pesos mediante SparseGPT con cuantización de 4 bits mediante AWQ, logrando una reducción del 72,56% en tamaño de disco (de 51,75 GB a 14,20 GB) y un aumento de throughput de 2,43x (de 34,2 a 83,2 tokens/s), con una degradación relativa media del 1,85% en benchmarks de razonamiento, matemáticas y visión. El modelo conserva el encoder de visión completo, por lo que mantiene capacidades multimodales.

Se distribuye bajo licencia Apache 2.0 y está pensado como un recurso de investigación para explorar el frente de Pareto entre compresión, velocidad y calidad. El repositorio incluye scripts de reproducción, evaluación y reconstrucción, así como manifiestos para ejecutar el proceso de poda distribuida en GPUs efímeras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (denso, con encoder de visión) |
| Parametros totales | 27B (aproximado, basado en el modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | AWQ 4-bit (candidato seleccionado); tambien se menciona GGUF en los tags |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado en la model card; el repositorio incluye multiples formatos (probablemente safetensors y GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal denso de 27B parametros con encoder de vision (denominado "DeepStack" en la documentacion). El proceso de compresion se realiza en dos fases: primero se aplica una poda de pesos con SparseGPT al 30% de esparsidad, y posteriormente se cuantiza a 4 bits con AWQ. La poda se ejecuta de forma distribuida sobre GPUs T4 de 16 GB mediante un pipeline de 64 capas fuera de nucleo, con sincronizacion automatica de checkpoints en Hugging Face Hub y recuperacion ante fallos.

El entrenamiento o ajuste posterior a la poda no se detalla en la model card; se indica que el proceso es puramente de compresion (pruning + quantization) sin fases de fine-tuning adicionales. La evaluacion se realiza sobre los benchmarks MMLU, GSM8K y MMMU (vision) para validar el frente de Pareto. El candidato seleccionado conserva el encoder de vision completo, mientras que una variante alternativa ("Text-Only + AWQ4") elimina el encoder de vision para reducir aun mas el tamano, a costa de perder la capacidad multimodal.

## Capacidades

- Generacion de texto y razonamiento: mantiene un rendimiento cercano al modelo denso en tareas de conocimiento general (MMLU 81,5 vs 82,6) y matematicas (GSM8K 86,9 vs 88,4).
- Capacidades multimodales: conserva el encoder de vision completo, por lo que puede procesar imagenes junto con texto (MMMU 60,4 vs 61,5).
- Inferencia eficiente: gracias a la cuantizacion AWQ de 4 bits, alcanza 83,2 tokens/s en hardware modesto, frente a los 34,2 tokens/s del modelo denso en BF16.
- Compatibilidad con herramientas de despliegue: al estar cuantizado con AWQ, puede ejecutarse con motores que soporten kernels GEMM de 4 bits (por ejemplo, vLLM, TGI, o entornos con soporte AWQ).
- Soporte de thinking mode e instruct mode: heredado del modelo base Qwen3.8-27B, aunque no se verifica explicitamente en el modelo podado.
- Multilingue: soporta ingles y chino, segun la model card.

## Casos de uso

- Despliegue en hardware limitado: el modelo cabe en GPUs de 16 GB (como T4, RTX 4090, etc.) con 16,5 GB de VRAM pico, lo que permite ejecutar un LLM multimodal de 27B en entornos de bajo coste como Colab o instancias economicas.
- Prototipado rapido de aplicaciones de vision-lenguaje: al conservar el encoder de vision, puede usarse para tareas de captioning, VQA o analisis de imagenes en entornos donde no se dispone de GPUs de alta gama.
- Investigacion en compresion de modelos: el repositorio incluye scripts de poda, cuantizacion y evaluacion, por lo que sirve como base para estudiar el equilibrio entre esparsidad, cuantizacion y calidad.
- Inferencia de alto throughput en produccion: con 83,2 tokens/s, es adecuado para servicios de chat o generacion de texto en tiempo real donde la latencia es critica y el hardware es limitado.
- Educacion y experimentacion: al ser un modelo de investigacion con licencia Apache 2.0, puede utilizarse en cursos o talleres sobre optimizacion de LLMs.
- Evaluacion comparativa de tecnicas de pruning: la tabla de Pareto incluida permite comparar Wanda vs SparseGPT, y cuantizacion AWQ vs representacion BF16, para decidir que estrategia adoptar en otros modelos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion para varios candidatos. Se presentan los datos del candidato seleccionado y del baseline denso:

| Modelo | Esparsidad | Representacion | Tamano disco | VRAM pico | Tok/s | MMLU | GSM8K | MMMU (Vision) | Degradacion relativa |
|---|---|---|---|---|---|---|---|---|---|
| Baseline (Dense) | 0% | BF16 | 51,75 GB | 56,4 GB | 34,2 | 82,6 | 88,4 | 61,5 | 0% |
| Wanda-30% | 30% | BF16 Sparse | 51,75 GB | 56,0 GB | 34,0 | 81,8 | 87,2 | 60,8 | -1,42% |
| SparseGPT-30% | 30% | BF16 Sparse | 51,75 GB | 56,0 GB | 34,0 | 82,1 | 87,6 | 61,0 | -0,98% |
| **SparseGPT-30% + AWQ4** | **30%** | **4-Bit AWQ** | **14,20 GB** | **16,5 GB** | **83,2** | **81,5** | **86,9** | **60,4** | **-1,85%** |
| Text-Only + AWQ4 | 30% (sin ViT) | 4-Bit AWQ | 13,60 GB | 15,2 GB | 85,0 | 81,4 | 86,8 | N/A | -2,36% |

No se han publicado resultados adicionales fuera de esta tabla en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 16,5 GB para el candidato seleccionado (SparseGPT-30% + AWQ4), 15,2 GB para la variante sin encoder de vision.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM, como NVIDIA T4, RTX 4090, A10, L4, o similares. No requiere GPUs de alta gama como A100 o H100.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama alta de consumo (RTX 3090, 4090) y en GPUs de datacenter de gama media (T4, L4).
- Opciones de despliegue: al estar cuantizado con AWQ, puede servirse con motores que soporten kernels de 4 bits, como vLLM, TGI, o llama.cpp (si se convierte a GGUF). El tag GGUF sugiere que tambien hay versiones para ejecucion en CPU o GPU con llama.cpp.
- Latencia y throughput: 83,2 tokens/s medidos en el entorno de evaluacion (probablemente T4), lo que indica una latencia de aproximadamente 12 ms por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | MMMU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B (dense, BF16) | 27B | No disponible | 82,6 | 88,4 | 61,5 | Apache 2.0 | Hugging Face |
| ewinregirgojr/qwen3.8-27b-pruned (SparseGPT-30% + AWQ4) | 27B | No disponible | 81,5 | 86,9 | 60,4 | Apache 2.0 | Hugging Face |
| ewinregirgojr/qwen3.8-27b-pruned (Text-Only + AWQ4) | 27B | No disponible | 81,4 | 86,8 | N/A | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos podados similares en la informacion proporcionada. El modelo pruned ofrece una reduccion de tamano del 72,56% y un aumento de velocidad de 2,43x con una perdida de calidad inferior al 2% en los benchmarks evaluados.

## Limitaciones y advertencias

- Degradacion de calidad: el modelo presenta una degradacion relativa media del 1,85% respecto al modelo denso, que puede ser perceptible en tareas sensibles o de alta precision.
- Variante sin vision: la opcion "Text-Only + AWQ4" elimina el encoder de vision, por lo que no puede procesar imagenes (MMMU no aplica). Esta variante no es adecuada para tareas multimodales.
- Sesgos y alucinaciones: al ser un modelo derivado de Qwen3.8-27B, puede heredar sesgos presentes en los datos de entrenamiento originales. No se han realizado evaluaciones especificas de sesgo o robustez en el modelo podado.
- Contexto limitado: no se ha especificado la longitud de contexto soportada tras la poda y cuantizacion. Se recomienda verificar el comportamiento con secuencias largas antes de usarlo en produccion.
- Naturaleza experimental: el modelo es un resultado de investigacion de un autor independiente, no un lanzamiento oficial de Alibaba. La documentacion es limitada y no hay garantias de soporte o mantenimiento.
- Riesgo de sobreajuste a benchmarks: la seleccion del candidato se baso en un conjunto reducido de benchmarks (MMLU, GSM8K, MMMU), por lo que el rendimiento en otras tareas puede variar.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.8-27B, que tambien es Apache 2.0, para confirmar que no hay restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ewinregirgojr/qwen3.8-27b-pruned-research
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion de Groq sobre Qwen3.8-27B: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
