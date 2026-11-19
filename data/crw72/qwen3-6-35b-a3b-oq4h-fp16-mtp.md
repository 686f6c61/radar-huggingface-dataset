# crw72/Qwen3.6-35B-A3B-oQ4h-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4h-fp16-mtp es una cuantización mixta del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario crw72 en Hugging Face. El checkpoint está empaquetado en formato MLX y emplea la herramienta oQ (oMLX v0.8.0) para aplicar cuantización de precisión mixta sobre los pesos del modelo base. El nombre del repositorio indica que se trata de una variante con cuantización de 4 bits mixta (oQ4h), capas en fp16 y una cabeza MTP (multi-token prediction) preservada.

El interés de esta ficha reside en que documenta un artefacto de cuantización, no un modelo entrenado desde cero: el modelo subyacente es Qwen3.6-35B-A3B, un MoE de la familia Qwen3.5 con 35.000 millones de parámetros totales y 3.000 millones activos por token (según la nomenclatura A3B). El checkpoint cuantizado, sin embargo, declara 7.495.550.832 parámetros reales en safetensors, lo que refleja el subconjunto de pesos efectivamente almacenados tras la compresión y el empaquetado.

La relevancia práctica es acotada pero concreta: permite ejecutar un MoE grande en hardware Apple Silicon mediante MLX, con un tamaño de repositorio de 23,0 GB y un promedio efectivo de 24,571 bits por peso. Es un artefacto de nicho, sin descargas ni validación comunitaria en el momento de la consulta, y debe tratarse como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con cabeza MTP y torre de visión |
| Parametros totales | 7.495.550.832 (checkpoint cuantizado); modelo base declarado como 35B-A3B |
| Parametros activos | 3B (según nomenclatura A3B del modelo base; no verificado en el checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16, FP32, U32; media efectiva 24,571 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B pertenece a la familia Qwen3.5 y sigue una arquitectura de mezcla de expertos (MoE) con atención estándar, según la etiqueta `qwen3_5_moe` del repositorio. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (6,204B pesos lógicos, 19,309 GiB), la torre de visión (0,447B, 1,664 GiB) y la cabeza MTP (0,845B, 0,468 GiB). La presencia de visión y MTP confirma que el modelo base es multimodal y que incorpora decodificación especulativa mediante predicción multi-token.

No se dispone de información sobre el entrenamiento del modelo base en la documentación proporcionada: no hay datos sobre número de tokens, composición del dataset, ni si se aplicaron fases de RLHF o DPO. La cuantización se realizó con oQ (oMLX v0.8.0), que asigna precisión distinta a cada tensor según su sensibilidad: los pesos en U32 (61,888% de los pesos lógicos, 17,281 GiB) corresponden probablemente a escalas y metadatos de cuantización, mientras que solo el 10,744% de los pesos lógicos se almacena en 4 bits. Esta distribución explica el elevado promedio efectivo de 24,571 bits/peso pese a la etiqueta "4-bit" del repositorio.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, aunque no verificadas en este checkpoint cuantizado.
- Procesamiento de visión: el checkpoint conserva la torre de visión (0,447B pesos, 1,664 GiB), por lo que se espera soporte de entrada de imágenes.
- Predicción multi-token (MTP): la cabeza MTP de 0,845B pesos está preservada, lo que habilita decodificación especulativa y potencialmente mayor throughput.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 23,0 GB permiten cargar el modelo en Macs con memoria unificada de 32 GB o superior, usando `mlx-lm` o `mlx-examples` para generación de texto.
- Prototipado de aplicaciones multimodales en local: la torre de visión preservada permite experimentar con tareas imagen-texto sin depender de APIs externas, útil para investigación con datos sensibles.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir ganancias de throughput frente a decodificación autoregresiva estándar en MLX, como banco de pruebas para técnicas de aceleración.
- Servicio de generación de texto en estaciones de trabajo Mac: con 23 GB de pesos, puede desplegarse en un Mac Studio para tareas de resumen, redacción o extracción de información en entornos sin GPU NVIDIA.
- Investigación sobre cuantización mixta: el checkpoint sirve para estudiar el impacto de la asignación de bits por tensor (4/8/16/32) en la calidad frente al modelo base en fp16.
- Desarrollo de pipelines de agentes con contexto largo: si el modelo base soporta ventanas extensas, puede integrarse en flujos de razonamiento multi-paso, aunque esta capacidad no está verificada en el checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,0 GB solo para pesos; con overhead de KV cache y activaciones, se recomienda un mínimo de 32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada (M2 Max/Ultra, M3 Max/Ultra, M4 Max/Ultra). No es compatible con CUDA de forma nativa al estar en formato MLX.
- ¿Cabe en GPU consumer? En GPUs NVIDIA consumer no directamente por el formato MLX; en Apple Silicon de gama alta sí.
- Opciones de despliegue: `mlx-lm`, `mlx-examples`, oMLX. No compatible con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| crw72/Qwen3.6-35B-A3B-oQ4h-fp16-mtp | 7,5B en checkpoint (base 35B-A3B) | no disponible | Apache 2.0 | safetensors MLX | 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | no disponible | Apache 2.0 | safetensors | modelo oficial |
| Otras cuantizaciones GGUF del mismo base | variable | no disponible | Apache 2.0 | GGUF | ecosistema llama.cpp |

La comparación se limita al modelo base y a cuantizaciones alternativas del mismo, ya que no se dispone de datos de rendimiento para establecer comparaciones con modelos de otras familias.

## Limitaciones y advertencias

- Artefacto sin validación: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que la cuantización preserve la calidad del modelo base.
- Discrepancia de parámetros: el nombre indica 35B-A3B pero el checkpoint declara 7,5B parámetros reales; la interpretación de esta cifra requiere cautela.
- Promedio de bits elevado: 24,571 bits/peso efectivos, muy por encima de una cuantización 4-bit convencional, lo que reduce el ahorro de memoria esperado.
- Compatibilidad restringida: formato MLX, solo ejecutable en Apple Silicon; no hay soporte para CUDA, ROCm ni CPU x86 estándar.
- Idiomas no declarados: no se especifican los idiomas soportados en la model card.
- Sin benchmarks: no hay datos que permitan estimar la degradación de calidad frente al modelo base.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint; se heredan los del modelo base, no documentados aquí.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el artefacto.
- Contexto desconocido: no se indica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/crw72/Qwen3.6-35B-A3B-oQ4h-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
