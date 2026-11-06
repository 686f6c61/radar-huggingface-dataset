# jy395/Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c2

## Resumen

Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c2 es una versión comprimida del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicada por el usuario jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones de compresión liberadas junto al artículo ICAIF '26 "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs". El modelo aplica una poda no estructurada del 50% mediante SparseGPT, implementada con la librería llm-compressor, sobre los pesos del Llama 3.1 8B Instruct original. Los pesos podados se almacenan de forma densa, por lo que el checkpoint mantiene el mismo número de parámetros (8.030.261.248) y el mismo tamaño en disco (16,1 GB) que el modelo base: la compresión es de tipo disperso, no una reducción del recuento de parámetros.

El interés de esta ficha no reside en un modelo nuevo con capacidades distintas, sino en el estudio sistemático de cómo la elección del corpus de calibración afecta a la degradación de un LLM tras la compresión post-entrenamiento. Esta configuración concreta (c2) se calibró con texto web genérico de C4, lo que la convierte en la referencia "fuera de dominio" frente a configuraciones calibradas con datos financieros. Es relevante para desarrolladores e investigadores que evalúan técnicas de compresión en dominios especializados y necesitan saber cuándo la calibración genérica es suficiente y cuándo no.

El modelo conserva la arquitectura, el tokenizador y la ventana de contexto del Llama 3.1 8B Instruct original, y se distribuye bajo la Llama 3.1 Community License. El checkpoint está en formato compressed-tensors, cargable directamente en vLLM o en transformers, y está pensado fundamentalmente como artefacto de investigación reproducible más que como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con poda no estructurada SparseGPT al 50% y pesos almacenados en denso |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible; el checkpoint es una poda dispersa, no una cuantización |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors en formato compressed-tensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por grupos (GQA), RoPE y aproximadamente 8.000 millones de parámetros. Sobre este modelo base se aplica una poda no estructurada del 50% de los pesos mediante SparseGPT, ejecutada con llm-compressor. La poda no estructurada elimina elementos individuales de las matrices de pesos según su importancia estimada, pero los pesos resultantes se almacenan en tensores densos; por tanto, no se reduce el número de parámetros ni el tamaño del checkpoint, y la aceleración práctica depende de que el motor de inferencia explote la dispersión (algo que, en la práctica, la mayoría de backends no hace de forma eficiente).

El proceso de calibración es el elemento diferenciador de esta configuración. Se usó el corpus C2, compuesto por texto web genérico de C4, con 128 secuencias de 2.048 tokens (262.144 tokens en total), consumo completo del corpus, `max_seq_length=2048` y semilla 42. Esta configuración c2 sirve como referencia de calibración genérica frente a configuraciones calibradas con datos financieros dentro del mismo estudio. No se realizó ningún ajuste fino adicional ni RLHF/DPO posterior a la poda: el modelo hereda el alineamiento del Llama 3.1 8B Instruct original, potencialmente degradado por la poda. El script exacto de reproducción es `scripts/quantization/sparsegpt_unstructured.py` con `--calib-path data/calibration_datasets/c2_c4web.jsonl`.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredadas del Llama 3.1 8B Instruct, sujetas a la degradación introducida por la poda al 50%.
- Razonamiento general y respuesta a instrucciones en formato chat.
- Generación de código y matemáticas a nivel del modelo base, con posible merma por la poda.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada; el modelo base lo soporta, pero no se documenta su preservación tras la compresión.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta configuración.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso como artefacto de evaluación de compresión: permite reproducir los experimentos del artículo ICAIF '26 sobre diez tareas financieras.

## Casos de uso

- Investigación en compresión de LLM: reproducir los resultados del artículo ICAIF '26 comparando esta configuración calibrada con C4 frente a configuraciones calibradas con datos financieros, para medir el impacto del desajuste de dominio en la calibración.
- Evaluación de robustez de la poda en dominios especializados: ejecutar la suite de diez tareas financieras del repositorio y cuantificar la caída de rendimiento respecto al modelo base sin comprimir.
- Estudio de técnicas de poda no estructurada: servir como punto de referencia de SparseGPT al 50% con pesos densos para comparar con otras técnicas (Wanda, SparseGPT estructurado, cuantización) sobre el mismo modelo base.
- Validación de pipelines de compresión con llm-compressor: usar el checkpoint como ejemplo funcional de formato compressed-tensors y verificar la carga en vLLM o transformers en un entorno propio.
- Docencia y formación técnica: ilustrar en cursos o talleres las diferencias entre poda estructurada y no estructurada, y entre almacenamiento disperso y denso, con un caso real y reproducible.
- Análisis de sensibilidad al corpus de calibración: construir variantes propias con distintos corpus (financiero, legal, médico) y contrastar la degradación frente a esta referencia genérica, siguiendo el protocolo del artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la suite de evaluación del repositorio (diez tareas financieras) y al artículo ICAIF '26 para los resultados comparativos, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de las tareas financieras.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en denso, el checkpoint ocupa aproximadamente 16,1 GB en precisión original (fp16/bf16); se necesita al menos esa cantidad de VRAM más el espacio para caché KV y activaciones, en torno a 18-20 GB en total para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para despliegue cómodo; una RTX 4090 de 24 GB puede alojar el modelo en bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) en bf16 con contexto reducido; en GPUs de 16 GB requeriría cuantización adicional, no incluida en este checkpoint.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors, indicado en la model card) y transformers con `AutoModelForCausalLM`; no se documenta soporte específico en llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles. Al no explotarse la dispersión en la mayoría de backends, el rendimiento esperado es similar al de un Llama 3.1 8B denso, sin ganancias de velocidad por la poda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c2 | 8,03 B (densos) | no disponible (base: 128k) | SparseGPT 50% no estructurado, calibrado en C4 | llama3.1 | Hugging Face |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | ninguna | llama3.1 | Hugging Face |
| Otras configuraciones del mismo estudio (calibradas con datos financieros) | 8,03 B | no disponible | SparseGPT 50% con calibración de dominio | llama3.1 | Colección de Hugging Face del autor |
| Meta-Llama-3.1-8B-Instruct cuantizado (p. ej. W8A8/AWQ) | 8,03 B (pesos comprimidos) | 128.000 tokens | Cuantización de pesos/activaciones | llama3.1 | Hugging Face |

La comparación principal es frente al modelo base sin comprimir y frente a las demás configuraciones del mismo artículo; no se dispone de datos de rendimiento numéricos para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- La poda no estructurada al 50% degrada la calidad del modelo base; el grado exacto de degradación no se documenta con cifras en la información proporcionada.
- Los pesos se almacenan en denso: no hay ahorro de memoria ni de tamaño de checkpoint, y la mayoría de motores de inferencia no aprovechan la dispersión para acelerar.
- Calibración con texto web genérico (C4): el artículo sugiere que la calibración fuera de dominio puede ser insuficiente para tareas financieras, por lo que el rendimiento en ese dominio puede ser peor que con configuraciones calibradas específicamente.
- Riesgo de alucinación heredado del modelo base, potencialmente incrementado por la poda; no se han publicado evaluaciones específicas de fidelidad.
- Sesgos conocidos del Llama 3.1 8B Instruct original, no reevaluados tras la compresión.
- Idiomas soportados no documentados; se asume el multilingüismo del modelo base, sin garantías.
- Restricciones de licencia: Llama 3.1 Community License, con condiciones de uso comercial, obligaciones de atribución ("Built with Llama") y restricciones de uso aceptable; revisar el texto completo antes de un despliegue comercial.
- Artefacto de investigación: no recomendado como modelo de producción sin una evaluación propia en el dominio objetivo.
- Fecha de creación del repositorio indicada como 2026-10-31, coherente con la publicación del artículo ICAIF '26; verificar la vigencia de los enlaces.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c2
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Repositorio de código y corpus de calibración: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda SparseGPT: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/sparsegpt_unstructured.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa de configuraciones: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Artículo ICAIF '26: https://doi.org/10.1145/3858063.3858724
- Llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
