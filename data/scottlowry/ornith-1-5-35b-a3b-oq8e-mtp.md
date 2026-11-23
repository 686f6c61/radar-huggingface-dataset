# scottlowry/Ornith-1.5-35B-A3B-oQ8e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ8e-mtp es una cuantización de precisión mixta del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario scottlowry. Se trata de un checkpoint en formato MLX, pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX, que conserva la arquitectura Mixture-of-Experts del modelo original (identificada en los tags como qwen3_5_moe) con 35.951.822.704 parámetros totales y una cabeza MTP (multi-token prediction) de 0,845B parámetros.

La cuantización se ha realizado con la herramienta oQ de oMLX (versión v0.7.4.dev1) en precisión mixta, alcanzando un promedio efectivo de 8,590 bits por peso sobre el checkpoint completo. La distribución es granular: el 94,945% de los pesos lógicos (34,134B) se almacena en affine 8-bit con grupo de 64 (8,50 bits/peso efectivos), un 3,727% (1,340B) en affine 8-bit con grupo de 128 (8,25 bits/peso) y un 1,329% (0,478B) se mantiene en BF16 (16 bits/peso). El repositorio ocupa 38,6 GB.

Su relevancia es práctica: permite desplegar un modelo MoE de ~36B parámetros en equipos Apple Silicon con un peso en disco y en memoria de aproximadamente 36 GiB, manteniendo una calidad cercana al original gracias a la cuantización de 8 bits. No obstante, la información pública disponible es muy limitada: no se documentan licencia, idiomas, benchmarks ni detalles del entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (tag `qwen3_5_moe`); incluye torre de visión y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit grupo 64 (94,945%), affine 8-bit grupo 128 (3,727%), BF16 (1,329%); media efectiva 8,590 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), cuantización `oq` |
| Tamano del repositorio | 38,6 GB (35,953 GiB) |
| Desglose de almacenamiento | LM: 34,661B lógicos / 36,806 GB; visión: 0,447B / 0,893 GB; cabeza MTP: 0,845B / 0,905 GB |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Descargas / likes | 522 / 5 |
| Fecha de creación / actualización | 2026-08-19 / 2026-11-12 |

## Arquitectura y entrenamiento

El checkpoint deriva directamente del modelo base ornith-ai/Ornith-1.5-35B-A3B, cuya arquitectura se etiqueta como `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos. El repositorio incluye tres componentes diferenciados: el modelo de lenguaje (34,661B parámetros lógicos), una torre de visión (0,447B) y una cabeza MTP de predicción multi-token (0,845B). La presencia de la cabeza MTP sugiere soporte para decodificación especulativa o generación multi-token, aunque no se documenta el mecanismo exacto ni su tasa de aceptación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF, DPO u otros) ni innovaciones técnicas del modelo original. El trabajo de este repositorio se limita a la cuantización: oMLX v0.7.4.dev1 aplica precisión mixta asignando grupos de 64 o 128 pesos según la sensibilidad de cada tensor, dejando en BF16 un 1,329% de los pesos (0,478B), presumiblemente las capas más sensibles a la pérdida de precisión. La model card indica que el checkpoint se re-cuantizó el 2026-11-11 y recomienda volver a descargarlo si se tenía una copia anterior.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un MoE de ~36B parámetros, adecuado para tareas de comprensión y generación de lenguaje natural.
- Procesamiento de visión: incluye una torre de visión de 0,447B parámetros, por lo que el checkpoint soporta entrada multimodal de imágenes (capacidad heredada del modelo base; no se detallan tareas concretas).
- Predicción multi-token (MTP): la cabeza dedicada de 0,845B parámetros está orientada a acelerar la decodificación, presumiblemente mediante decodificación especulativa.
- Ejecución en Apple Silicon: al estar en formato MLX, se integra con el ecosistema mlx y mlx-lm para inferencia nativa en chips M-series.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con ~36 GiB de pesos, el checkpoint cabe en equipos Apple Silicon de 48 GB o 64 GB de memoria unificada (M2 Ultra, M3 Max de gama alta, M4 Max), permitiendo ejecutar un MoE de ~36B sin GPU dedicada.
- Prototipado de aplicaciones multimodales en local: la torre de visión integrada permite experimentar con tareas imagen-texto en un portátil o estación Mac, sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: al ser una cuantización de 8,590 bits/peso, sirve para medir la degradación de calidad frente al modelo base BF16 en tareas de razonamiento y generación, con un ahorro de almacenamiento sustancial frente a los ~72 GB que ocuparía en BF16.
- Desarrollo de asistentes de código en local: un MoE de este tamaño es viable para autocompletado y generación de código en entornos de desarrollo sobre Mac, siempre que se valide su rendimiento real (no hay benchmarks publicados).
- Despliegue de servicios internos de bajo volumen: para equipos pequeños que ya dispongan de hardware Apple, el modelo puede servir respuestas en una API local (por ejemplo, mediante servidores compatibles con MLX) sin coste de GPU en la nube.
- Investigación sobre decodificación especulativa: la cabeza MTP incluida permite estudiar y medir el impacto de la predicción multi-token en latencia y throughput dentro del ecosistema MLX.
- Experimentación académica con MoE cuantizados: útil para estudiar el equilibrio entre precisión por grupo (64 vs 128) y calidad de salida en modelos de mezcla de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~36 GiB para los pesos en esta cuantización de 8,590 bits/peso; el repositorio completo ocupa 38,6 GB en disco. Hay que añadir memoria para el contexto KV y overhead del runtime.
- Memoria unificada mínima recomendada: 48 GB en Apple Silicon para dejar margen al contexto; 64 GB o más para contextos largos o uso concurrente.
- GPU dedicadas: el formato MLX está pensado para Apple Silicon; no se documenta soporte en CUDA (A100, H100, RTX 4090). Para GPU NVIDIA habría que recurrir a otras cuantizaciones del modelo base (GGUF, AWQ, etc.), no disponibles en este repositorio.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en chips con 48 GB o más de memoria unificada. En GPUs de consumo tipo RTX 4090 (24 GB) no cabría en esta precisión; requeriría cuantizaciones de 4 bits del modelo base.
- Opciones de despliegue: MLX (mlx-lm) y herramientas del ecosistema oMLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles; dependerán del chip Apple, del tamaño de contexto y del uso de la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ8e-mtp (este) | 35,952B totales (activos no disponibles) | no disponible | 8,590 bits/peso (MLX) | no disponible | Hugging Face, formato MLX |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,952B totales | no disponible | BF16 (presumible) | no disponible | Hugging Face |
| Alternativas de ~30-40B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables (rendimiento, contexto, licencia) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce la cobertura lingüística real, incluido el castellano.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de la degradación introducida por la cuantización de 8,590 bits/peso frente al BF16.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones de fidelidad publicadas para este checkpoint.
- Sesgos: no documentados; se heredan los del modelo base, que tampoco los describe.
- Dependencia de hardware Apple: el formato MLX limita su uso a Apple Silicon; no es portable a CUDA sin reconversión.
- Checkpoint re-cuantizado: la model card advierte de que las copias anteriores al 2026-11-11 deben descargarse de nuevo; conviene verificar la integridad de los pesos.
- Parámetros activos desconocidos: al ser un MoE, el coste computacional real por token depende de los expertos activos, dato no publicado; las estimaciones de latencia son, por tanto, inciertas.
- Mantenimiento por un tercero: el repositorio lo publica un usuario individual (scottlowry), no el equipo de ornith-ai; la continuidad y el soporte no están garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ8e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
