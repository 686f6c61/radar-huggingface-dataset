# Maxilicious20/Velqora-38M-Base

## Resumen

Velqora-38M-Base es un modelo de lenguaje causal decoder-only de 38.025.227 parametros (~38,03 M) desarrollado por Maxilicious20 y entrenado desde inicializacion aleatoria, sin pesos preentrenados de partida. Se trata de un experimento de investigacion orientado al estudio de arquitecturas transformer modernas en un presupuesto de computo minimo: todo el entrenamiento se realizo en una unica NVIDIA GeForce RTX 4060 de 8 GB bajo Windows 11. El modelo es English-first y se distribuye como checkpoint base, sin ajuste por instrucciones.

La arquitectura incorpora componentes propios de modelos de mayor escala: 12 capas, dimension oculta de 512, atencion con grouped-query attention (8 cabezas de query y 2 de key-value), QK-Norm, value residuals en la capa 0, feed-forward SwiGLU de 1.408 dimensiones, normalizacion RMSNorm, embeddings RoPE con base 10.000 y embeddings de entrada/salida atados. El tokenizador es un BPE byte-level propio de 8.192 tokens y la ventana de contexto maxima es de 1.024 tokens.

Su relevancia es fundamentalmente educativa y de investigacion: permite reproducir y estudiar en hardware de consumo el comportamiento de tecnicas habituales en modelos frontera (GQA, QK-Norm, value residuals, SwiGLU) y sirve como banco de pruebas para inferencia local en el borde. No esta pensado como modelo de produccion ni para tareas que requieran precision factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, 12 capas, hidden size 512, SwiGLU (ffn 1.408), GQA + QK-Norm + value residuals capa 0, RMSNorm, RoPE (theta 10.000) |
| Parametros totales | 38.025.227 (~38,03 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible en la model card; existe companion GGUF (Maxilicious20/Velqora-38M-Base-GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) + checkpoints PyTorch (`model.pt`); GGUF en repositorio companion |

## Arquitectura y entrenamiento

Velqora-38M-Base es un transformer decoder-only de 12 capas con dimension oculta de 512 y feed-forward SwiGLU de 1.408 dimensiones. La atencion usa grouped-query attention con 8 cabezas de query y 2 de key-value, acompanada de QK-Norm y de value residuals aplicados en la capa 0 (una tecnica que reinyecta la representacion de valores iniciales en capas profundas para estabilizar el entrenamiento). Emplea RMSNorm, embeddings posicionales rotatorios RoPE con base 10.000 y embeddings de entrada/salida atados. La implementacion es PyTorch propia (`velqora/model.py`) sobre `scaled_dot_product_attention` en bfloat16, y no usa `AutoModelForCausalLM`, por lo que requiere cargar la clase custom incluida en el repositorio.

El entrenamiento parte de inicializacion aleatoria y usa prediccion del siguiente token sobre una mezcla de tres datasets: `HuggingFaceTB/cosmopedia-100k` (45%), `HuggingFaceFW/fineweb-edu` (35%) y `roneneldan/TinyStories` (20%), con un curriculo de escalado progresivo de la longitud de contexto. Todo el proceso se ejecuto en una unica RTX 4060 de 8 GB bajo Windows 11. La mejor perdida de validacion reportada es 2,7915. No se documenta en la informacion disponible el numero total de tokens vistos, la composicion exacta del preprocesado ni si hubo fases de RLHF o DPO (al ser un checkpoint base, no se espera ajuste por preferencias).

## Capacidades

- Generacion de texto por continuacion de prompt (modelo base, no instruction-tuned): no interpreta etiquetas tipo ChatML; se le debe alimentar texto natural a continuar.
- Modelado de lenguaje causal con ventana de 1.024 tokens.
- Capacidad limitada de razonamiento y aritmetica, derivada del entrenamiento a pequena escala.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Inferencia local en CPU/GPU de gama baja gracias a su tamano (38 M de parametros) y a la existencia de pesos GGUF.

## Casos de uso

- Investigacion sobre modelos ultrapequenos desde cero: sirve para reproducir y analizar el efecto de GQA, QK-Norm, value residuals y SwiGLU en un regimen de 38 M de parametros, comparando configuraciones con y sin cada componente.
- Estudio educativo de transformers: el repositorio incluye `velqora/model.py` y `run_inference.py`, lo que permite recorrer la implementacion completa de un LM causal moderno en pocas lineas y ejecutarlo en un portatil.
- Experimentos de inferencia en el borde: con 38 M de parametros y pesos bfloat16 (unos 76 MB), el modelo cabe en dispositivos con memoria muy limitada, incluidos moviles o SBC, usando la version GGUF.
- Prototipado rapido de pipelines de generacion de texto: util para validar infraestructura (tokenizacion, batching, streaming) antes de escalar a modelos mayores, sin coste de GPU significativo.
- Benchmarking de tecnicas de cuantizacion: al existir un companion GGUF, permite medir el impacto de distintas cuantizaciones en un modelo diminuto y extrapolar tendencias.
- Docencia y talleres: ejemplo realista de entrenamiento end-to-end en una GPU de consumo (RTX 4060 8 GB) con curriculo de contexto y mezcla de datasets, replicable por estudiantes.
- Generacion de texto creativo muy acotado o continuaciones de cuentos estilo TinyStories, dado el 20% de ese dataset en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la mejor perdida de validacion: 2,7915.

## Requisitos de hardware

- VRAM estimada para inferencia: ~76 MB en bfloat16 (38 M parametros x 2 bytes); menos aun en cuantizaciones GGUF de 8 o 4 bits (del orden de 40-20 MB, estimacion a partir del numero de parametros, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; el modelo se entreno en una RTX 4060 8 GB y la inferencia es viable en GPUs integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: script propio `run_inference.py` con PyTorch y safetensors; la version GGUF permite usar llama.cpp y, presumiblemente, Ollama (no confirmado en la informacion disponible). vLLM y TGI no estan soportados de forma nativa al tratarse de una arquitectura custom.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Velqora-38M-Base | 38,03 M | 1.024 | Apache-2.0 | Desde cero, arquitectura custom, solo ingles |
| TinyLlama-1.1B | 1.100 M | 2.048 | Apache-2.0 | ~29x mas grande; requiere mas VRAM pero mayor calidad |
| SmolLM-135M | 135 M | 2.048 | Apache-2.0 | ~3,5x mas grande; entrenado sobre corpus mayor |
| GPT-2 small | 124 M | 1.024 | MIT | Referencia historica; ~3,3x mas grande |

No se dispone de datos de benchmarks de Velqora-38M-Base que permitan una comparacion cuantitativa con estas alternativas; la comparativa es estructural.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes ni formatos conversacionales de forma fiable.
- Alto riesgo de alucinacion factual y de errores aritmeticos por su escala (38 M de parametros entrenados en una sola GPU de consumo).
- Dificultad previsible con instrucciones complejas y razonamiento multi-paso.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo soporta ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- No apto para tareas medicas, legales, financieras o de seguridad critica, segun el propio autor.
- Arquitectura custom: no es compatible con `AutoModelForCausalLM` de Transformers, lo que limita el uso de herramientas estandar (vLLM, TGI) y exige cargar `velqora/model.py`.
- Sesgos: no documentados en la informacion disponible; al entrenar sobre Cosmopedia, FineWeb-Edu y TinyStories hereda los sesgos de esas fuentes.
- Licencia Apache-2.0: permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en produccion mas alla de experimentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxilicious20/Velqora-38M-Base
- Companion GGUF: https://huggingface.co/Maxilicious20/Velqora-38M-Base-GGUF
- Perfil del autor: https://huggingface.co/Maxilicious20
- Dataset Cosmopedia-100k: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-100k
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
