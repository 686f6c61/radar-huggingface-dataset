# scottlowry/Ornith-1.5-122B-oQ5e-fp16-mtp

## Resumen

Ornith-1.5-122B-oQ5e-fp16-mtp es una cuantización mixta del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry en Hugging Face. Se trata de un checkpoint de 125.086.497.008 parámetros (125,09B) convertido al formato MLX para su ejecución en hardware Apple Silicon, mediante la herramienta oQ de oMLX (versión v0.7.4.dev1). El modelo base pertenece a la familia Qwen3.5 MoE, según el tag `qwen3_5_moe`, e incorpora componentes de lenguaje, visión y una cabeza MTP (multi-token prediction).

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala 122B en equipos con memoria unificada de Apple, algo imposible con los pesos en FP16 (que ocuparían unos 250 GB). La cuantización mixta reduce el checkpoint a 83,706 GiB de almacenamiento efectivo, con un promedio de 5,748 bits por peso, manteniendo en precisión alta (FP16/FP32 y 8 bits) los componentes sensibles como la visión y ciertas capas del transformer.

No obstante, la información pública disponible es muy limitada: no hay model card del modelo base, no se declaran benchmarks, licencia ni idiomas soportados, y el repositorio cuenta con 127 descargas y 0 likes en el momento de la consulta. Esta ficha se limita, por tanto, a los datos verificables del checkpoint cuantizado y advierte explícitamente de los vacíos de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con torre de visión y cabeza MTP; pesos en formato MLX |
| Parametros totales | 125.086.497.008 (125,09B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 5-bit group 64 (94,64% de los pesos), affine 8-bit group 128 (0,37%), affine 8-bit group 64 (4,58%), FP16 (0,05%), FP32 (0,36%); media efectiva 5,748 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), librería `mlx`; repo de 178,7 GB |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 122,112B | 86,280 GB / 80,355 GiB |
| Visión | 0,451B | 1,805 GB / 1,681 GiB |
| Cabeza MTP | 2,524B | 1,794 GB / 1,670 GiB |
| Total | 125,086B | 89,879 GB / 83,706 GiB |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base ornith-ai/Ornith-1.5-122B, cuya arquitectura exacta no está documentada en la información disponible. El tag `qwen3_5_moe` indica que se trata de un transformer con mezcla de expertos (MoE) de la familia Qwen3.5, aunque se desconoce el número de expertos, el ratio de activación y la dimensión de las capas. La presencia de una torre de visión (0,451B de parámetros) confirma que el modelo base es multimodal, y la cabeza MTP (2,524B) sugiere que el entrenamiento incorporó predicción multi-token, una técnica habitual para acelerar la decodificación especulativa.

La cuantización se realizó con oQ (oMLX v0.7.4.dev1), que aplica precisión mixta por tensor: la mayor parte de los pesos del modelo de lenguaje se almacenan en affine 5-bit con grupo de 64, mientras que un 4,58% se mantiene en 8-bit group 64 y un 0,37% en 8-bit group 128. Los componentes de visión y MTP se conservan en FP16/FP32 en su mayoría, lo que preserva la calidad de las capas más sensibles a la cuantización. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un transformer MoE de 122B, por lo que se espera capacidad de razonamiento general, aunque no hay benchmarks que lo confirmen.
- Procesamiento de visión: la torre de visión de 0,451B parámetros indica soporte de entrada de imágenes, aunque no se detalla la resolución ni el tipo de tareas (VQA, OCR, captioning).
- Decodificación especulativa: la cabeza MTP de 2,524B parámetros está diseñada para predecir varios tokens por paso, lo que puede acelerar la inferencia en MLX si el runtime la aprovecha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: el checkpoint de 83,7 GiB cabe en equipos con memoria unificada de 96 GB o 128 GB (Mac Studio M2/M3 Ultra, MacBook Pro M3/M4 Max con 128 GB), permitiendo ejecutar un modelo de 122B sin GPU dedicada. Es el caso de uso principal de esta cuantización.
- Prototipado de asistentes multimodales en local: gracias a la torre de visión, se puede experimentar con pipelines de imagen + texto (descripción de capturas, extracción de información de documentos escaneados) sin enviar datos a la nube, útil para entornos con requisitos de privacidad.
- Investigación sobre cuantización mixta: el checkpoint sirve como referencia para estudiar el impacto de mantener capas en 8-bit y FP16 frente a una cuantización uniforme de 5-bit, comparando perplejidad y calidad de generación con el modelo base.
- Evaluación de decodificación especulativa con MTP: la cabeza MTP permite medir en MLX la ganancia de throughput de la predicción multi-token frente a la decodificación autoregresiva estándar, un experimento relevante para quienes optimizan runtimes.
- Generación de código y tareas de razonamiento en local: si el modelo base conserva las capacidades típicas de la familia Qwen3.5, podría usarse para autocompletado y refactorización en entornos de desarrollo con políticas estrictas de no exfiltración de código.
- Fine-tuning ligero o adaptación con LoRA sobre MLX: el formato safetensors y la librería MLX permiten cargar el checkpoint y aplicar adaptadores de bajo rango para dominios específicos, aunque el tamaño del modelo limita el entrenamiento a equipos con memoria unificada muy alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 83,7 GiB de pesos en disco; en memoria se necesita espacio adicional para el KV cache y activaciones, por lo que se recomienda un mínimo de 96 GB de memoria unificada y 128 GB para contextos largos.
- GPU recomendadas: hardware Apple Silicon con memoria unificada de 96 GB o más (Mac Studio M2 Ultra 192 GB, M3 Ultra 96/256 GB, MacBook Pro M3/M4 Max 128 GB). No es ejecutable en GPUs NVIDIA/AMD mediante MLX; para esas plataformas habría que usar otra cuantización del modelo base en formato GGUF o safetensors estándar.
- ¿Cabe en consumer GPU? No en GPUs de consumo con 24 GB (RTX 4090) ni 48 GB (RTX 6000 Ada). Solo cabe en equipos Apple con memoria unificada alta o en GPUs de datacenter con 80 GB o más, y en ese caso no con MLX.
- Opciones de despliegue: MLX (librería nativa), mlx-lm para generación de texto y mlx-vlm si se quiere aprovechar la torre de visión. No hay soporte directo en vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible. La presencia de MTP sugiere que el autor busca acelerar la decodificación, pero no se publican cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ5e-fp16-mtp | 125,09B (MoE) | no disponible | MLX safetensors, 5,748 bits/peso | no disponible | Hugging Face, 127 descargas |
| ornith-ai/Ornith-1.5-122B (base) | 125,09B (MoE) | no disponible | safetensors (presumiblemente FP16/BF16) | no disponible | Hugging Face (referenciado como base) |
| Otras cuantizaciones del mismo base | 125,09B (MoE) | no disponible | GGUF / MLX / otros | depende del autor | no disponible en la información consultada |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría con información verificable en la documentación proporcionada, por lo que la comparativa se limita a las variantes del propio modelo base.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia del checkpoint ni del modelo base, no se puede garantizar el uso comercial. Es imprescindible contactar con el autor o consultar el repositorio del modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el modelo soporta castellano con calidad suficiente; habría que evaluarlo empíricamente.
- Sesgos y alucinaciones: no hay información sobre el dataset de entrenamiento ni sobre evaluaciones de sesgo, por lo que se deben aplicar las precauciones habituales de validación de salidas y filtrado de contenido.
- Cuantización agresiva: el 94,64% de los pesos está en 5-bit, lo que puede degradar tareas sensibles a la precisión numérica (matemáticas, código complejo) en comparación con el modelo base en FP16. No se han publicado comparativas de perplejidad.
- Dependencia de MLX: el checkpoint solo es utilizable con la librería MLX en Apple Silicon; no es portable a vLLM, llama.cpp ni GPUs NVIDIA sin reconversión.
- Actualización del checkpoint: la model card indica que el 2026-11-11 se recuantizó con oMLX v0.7.4.dev1 y pide volver a descargar si se tenía una copia anterior; conviene verificar la integridad de los archivos.
- Repositorio de 178,7 GB: el tamaño del repo en disco (178,7 GB) es más del doble que el almacenamiento efectivo de los pesos (83,7 GiB), probablemente por archivos duplicados o versiones anteriores; hay que planificar el espacio en disco en consecuencia.
- Sin benchmarks ni evaluación independiente: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales, lo que impide comparar con alternativas de forma rigurosa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
