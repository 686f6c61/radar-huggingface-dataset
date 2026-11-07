# agurung/clean-eval-rft-w2c-same-4-vs

## Resumen

`agurung/clean-eval-rft-w2c-same-4-vs` es un ajuste fino supervisado (SFT) del modelo `Qwen/Qwen3-4B-Instruct-2507` de Alibaba Qwen, publicado por el usuario agurung en Hugging Face. El modelo se ha entrenado con la librería TRL sobre el dataset `cobalt-traces-rft_w2c_same_4_vs`, un conjunto de trazas conversacionales etiquetado con los tags `cobalt`, `diversity`, `uniform` y `sft`. Se enmarca en una línea de trabajo experimental sobre evaluación limpia de modelos (Clean-Eval) y diversidad de respuestas, no en un lanzamiento de producto.

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con aproximadamente 4.000 millones de parámetros y una ventana de contexto nativa de 262.144 tokens (dato del modelo base; no confirmado explícitamente en la información del fine-tuning). El repositorio ocupa 1,1 GB en formato safetensors, lo que sugiere pesos en precisión reducida (probablemente bf16 o fp16 con compartición de embeddings).

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (el campo de licencia aparece como "license" sin especificar y el título de la tarjeta es "Model Card for None"). Debe tratarse como material experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | ~4.000 millones (heredados del modelo base; no verificado en el repo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en el fine-tuning; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica "license" sin especificar; el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por supervisión (SFT) del checkpoint instruct de Qwen3-4B-Instruct-2507. La arquitectura subyacente es un transformer decoder-only denso de la familia Qwen3, con atención por softmax estándar (no se documenta el uso de atención lineal ni de mezcla de expertos). El entrenamiento se realizó con TRL 1.13.0 sobre Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2, según las versiones declaradas en la model card.

El dataset de entrenamiento, `cobalt-traces-rft_w2c_same_4_vs`, no está documentado en la información disponible: se desconoce su número de ejemplos, composición, número de tokens y proceso de generación. Los tags `diversity` y `uniform` sugieren un interés en controlar la diversidad de las respuestas (posiblemente mediante muestreo uniforme entre variantes), y el prefijo `clean-eval` enlaza con la línea de investigación Clean-Eval (NAACL 2024), que propone parafrasear y retrotraducir datos contaminados para evaluar modelos con menos fuga de benchmark. No se declara uso de RLHF, DPO ni decodificación especulativa. El run de entrenamiento está registrado en Weights & Biases (proyecto `alexgurung/clean-eval-w2c`, run `gku9jyoj`), pero no se aportan métricas de pérdida ni de evaluación en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas de nivel medio, limitado por el tamaño de 4B parámetros del modelo base.
- Generación de código, también heredada del modelo base.
- Soporte de tool calling y function calling: no confirmado para este fine-tuning concreto; el modelo base Qwen3-4B-Instruct-2507 lo soporta, pero el SFT sobre trazas conversacionales podría haber degradado esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no verificadas en este checkpoint.
- Capacidades multilingües: no disponibles; el modelo base es multilingüe, pero el dataset de ajuste no está caracterizado.
- Modo thinking: el modelo base Qwen3-4B-Instruct-2507 es un checkpoint "instruct" no thinking; este fine-tuning no declara capacidades de razonamiento extendido.
- Visión y audio: no soportados (modelo puramente textual).

## Casos de uso

- Investigación sobre diversidad de respuestas: el tag `uniform` y el nombre del dataset sugieren que el modelo puede emplearse para estudiar cómo el SFT afecta a la variedad de salidas ante la misma pregunta; útil en experimentos de evaluación de modelos generativos.
- Evaluación limpia de benchmarks: en línea con el paper Clean-Eval, el checkpoint puede servir como generador de paráfrasis o retrotraducciones controladas para construir conjuntos de evaluación menos contaminados.
- Reproducción de experimentos de SFT con TRL: al incluir las versiones exactas del stack (TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0), es útil como referencia reproducible en estudios de ajuste supervisado.
- Prototipado de asistentes conversacionales de bajo coste: con 4B parámetros y pesos safetensors de 1,1 GB, puede desplegarse en una GPU de consumo para pruebas de concepto de chatbots multi-turno.
- Generación de datos sintéticos conversacionales: el modelo puede utilizarse para producir trazas de diálogo que alimenten posteriores pipelines de destilación o anotación.
- Comparación de checkpoints en ablaciones: al ser un fine-tuning acotado sobre un modelo base público, sirve como punto de comparación frente al Qwen3-4B-Instruct-2507 original en estudios de regresión de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones conversacionales, y el run de Weights & Biases enlazado no aporta cifras en la documentación consultada. No se deben inferir resultados del modelo base sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8-9 GB para los pesos (4B parámetros × 2 bytes) más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: ~4-5 GB; en 4 bits: ~2,5-3 GB (estimaciones teóricas; no se han publicado cuantizaciones GGUF/AWQ/GPTQ para este checkpoint).
- GPU recomendadas: NVIDIA A100 40 GB, H100 80 GB o L40S para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB como la RTX 3060 Ti o la RTX 4060.
- Opciones de despliegue: transformers (pipeline estándar), vLLM y TGI (el tag `text-generation-inference` y `endpoints_compatible` indica compatibilidad), y llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias, ya que no se publican en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `agurung/clean-eval-rft-w2c-same-4-vs` | ~4B | no disponible (base: 262.144) | no disponible | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| `Qwen/Qwen3-4B-Instruct-2507` | ~4B | 262.144 | Apache-2.0 | Hugging Face, ampliamente usado | Modelo base; soporte de tool calling e instruct |
| `Qwen/Qwen3-8B` | ~8B | 131.072 | Apache-2.0 | Hugging Face | Alternativa de mayor tamaño de la misma familia |
| `meta-llama/Llama-3.2-3B-Instruct` | ~3B | 131.072 | Llama 3.2 Community License | Hugging Face | Competidor directo en el segmento 3-4B |

La comparación cuantitativa de rendimiento no es posible: el checkpoint no publica benchmarks y el modelo base sí dispone de evaluaciones públicas en su model card original. En la práctica, este fine-tuning debe compararse contra su modelo base mediante evaluación propia antes de considerarlo una mejora.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al modelo base en ninguna tarea; podría degradar capacidades previas (olvido catastrófico) al haberse entrenado sobre un dataset pequeño y no caracterizado.
- Licencia no especificada: la model card indica "license" sin identificar el término, lo que impide determinar si el uso comercial está permitido. El modelo base es Apache-2.0, pero el fine-tuning no declara heredar esa licencia.
- Idiomas no declarados: se desconoce si el ajuste ha preservado el multilingüismo del modelo base o lo ha sesgado hacia el idioma del dataset de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros; sin evaluación específica no puede cuantificarse.
- Sesgos: no documentados; el dataset `cobalt-traces-rft_w2c_same_4_vs` no está descrito, por lo que se desconocen sesgos de dominio, estilo o demografía.
- Model card incompleta: el título "Model Card for None" y la ausencia de secciones de uso, limitaciones y evaluación indican un checkpoint de investigación sin documentación de producción.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Compatibilidad de tool calling incierta: el SFT sobre trazas conversacionales puede haber alterado el formato de llamadas a herramientas del modelo base; conviene validarlo empíricamente antes de integrarlo en agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-vs
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-rft_w2c_same_4_vs
- Run de entrenamiento en Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/gku9jyoj
- Repositorio TRL: https://github.com/huggingface/trl
- Paper Clean-Eval (NAACL 2024): https://aclanthology.org/2024.findings-naacl.53/
- Paper Clean-Eval (arXiv): https://arxiv.org/abs/2311.09154
