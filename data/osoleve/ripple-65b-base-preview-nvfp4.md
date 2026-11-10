# osoleve/Ripple-65B-Base-Preview-NVFP4

## Resumen

Ripple-65B-Base-Preview-NVFP4 es una cuantización post-entrenamiento (PTQ) de tipo NVFP4 del checkpoint base Ripple-65B-Base-Preview, desarrollado por Ricursive Intelligence y cuantizado por el usuario comunitario osoleve. El modelo original es un transformer denso de aproximadamente 64.800 millones de parámetros, publicado bajo licencia Apache-2.0 y entrenado únicamente como modelo base (sin ajuste por instrucciones), con una ventana de contexto nativa de 8.192 tokens y soporte exclusivo del idioma inglés.

La relevancia de esta ficha reside en que demuestra un flujo de cuantización NVFP4 (W4A4 en las proyecciones MLP, manteniendo atención, embeddings, cabeza de salida, normalizaciones y caché KV en BF16) ejecutable en hardware de consumo profesional como una única NVIDIA DGX Spark (GB10). El paquete reduce el peso a 57,2 GB de safetensors y permite servir el modelo con SGLang 0.5.19 y kernels FlashInfer CUTLASS NVFP4, algo que no era viable con el checkpoint BF16 completo en un solo dispositivo.

Se trata de una release experimental orientada a validación de inferencia y a la reproducción del proceso de cuantización, no a producción generalista: el autor advierte explícitamente de que no se han establecido métricas amplias de precisión downstream ni de retención en benchmarks de código o contexto largo. La arquitectura requiere una implementación personalizada (custom_code) y no se ha verificado compatibilidad con vLLM, TensorRT-LLM ni Transformers genéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (implementación personalizada, requiere `trust_remote_code`; detalles internos no disponibles) |
| Parámetros totales | 64.782.689.360 (~64,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (límite nativo del checkpoint base) |
| Tipos de cuantización | NVFP4 W4A4 en proyecciones MLP gate/up/down; BF16 en atención, embeddings, output head, normalización y KV cache |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con metadatos de cuantización ModelOpt; 57,2 GB (53,28 GiB) en repo |
| Bloques de cuantización | Bloques de 16 elementos, pesos empaquetados E2M1, escalas de bloque E4M3, escalas de activación por tensor calibradas |
| Capas cuantizadas | 240 proyecciones lineales MLP (todas); 400 proyecciones de atención permanecen en BF16 |
| Calibración | NVIDIA Model Optimizer 0.46.0, 128 muestras de 1.024 tokens de WikiText-2 raw (train split), semilla 42 |
| Tensores exportados | 1.923 tensores auditados; 963 tensores fuente retenidos idénticos al BF16 original |

## Arquitectura y entrenamiento

El checkpoint subyacente es un modelo base preentrenado por Ricursive Intelligence, sin ajuste por instrucciones ni actualizaciones de entrenamiento posteriores. La información disponible no detalla la composición del dataset de preentrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles en la documentación proporcionada. La arquitectura concreta (más allá de ser un transformer denso con atención y ventana deslizante, según se deduce de las pruebas de contexto) requiere código personalizado del repositorio, y no se ha verificado su compatibilidad con implementaciones estándar.

La innovación técnica de esta release es el pipeline de cuantización: se procesa una capa decodificadora cada vez, propagando activaciones de calibración cuantizadas y escribiendo safetensors estándar de Hugging Face con metadatos ModelOpt, lo que permite convertir el modelo sin mantener el BF16 completo en memoria. Las escalas de gate/up se sincronizan para la proyección fusionada de SGLang. El paquete incluye `quantization-provenance.json` con revisiones de origen y dataset, offsets y hashes de tokens muestreados, versiones de software, estadísticas de escalas y tiempos, además de `SHA256SUMS` por fichero de pesos. El adaptador de servicio proviene de la release NVFP4 de instrucciones de Ricursive (revisión `99eea447...`), no de los pesos.

## Capacidades

- Generación de texto mediante completado de texto bruto (raw completion); no es un modelo de instrucciones y no debe usarse con formato de chat.
- Modelado de lenguaje autoregresivo en inglés con ventana de contexto de 8.192 tokens, incluyendo atención más allá del límite de ventana deslizante (verificado con prompts de 2.048, 4.096 y 8.180 tokens).
- Completado de prosa y de código Python (el autor reporta ejecuciones correctas de smoke tests en ambos dominios).
- Inferencia con caché KV en BF16 y precisión de log-probabilidades finitas verificada en las ventanas de prueba.
- No se documenta soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso explícito, visión, audio ni modo de pensamiento (thinking mode).
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Investigación en cuantización NVFP4: el paquete sirve como referencia reproducible (script `reproduce/quantize.py`, provenance y hashes) para estudiar el impacto de W4A4 en las proyecciones MLP manteniendo atención en BF16, con una degradación medida de perplejidad del +8,31 % en un subconjunto controlado.
- Despliegue en hardware de borde profesional: permite servir un modelo de ~65 B en una única NVIDIA DGX Spark (GB10) con SGLang TP=1, algo imposible con el BF16 completo (que requiere TP=2 en dos Sparks según la validación del autor).
- Generación de texto y completado de prosa en pipelines offline: adecuado para tareas de continuación de texto, aumento de datos o generación de borradores donde no se requiere seguir instrucciones.
- Completado de código en entornos controlados: el autor verificó completados de Python; puede integrarse en herramientas de autocompletado siempre que se asuma la ausencia de ajuste por instrucciones y de benchmarks de retención de código.
- Evaluación comparativa de precisión numérica: útil para medir la fidelidad de kernels FlashInfer CUTLASS NVFP4 frente a BF16 en capas MLP, con métricas de perplejidad y comparaciones layerwise de Hugging Face y ModelOpt fake-quant.
- Pruebas de estrés de contexto: con 8.192 tokens nativos y verificaciones cerca del límite, sirve para validar implementaciones de atención con ventana deslizante y gestión de caché KV en SGLang.
- Docencia y experimentación con ModelOpt: el flujo de calibración con 128 muestras de 1.024 tokens y semilla fija es un caso práctico para enseñar PTQ con metadatos de procedencia.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad sobre un subconjunto de WikiText-2 raw (dieciséis bloques independientes de 1.024 tokens, 16.368 tokens siguientes puntuados). El autor advierte que no es la perplejidad del conjunto de test completo.

| Inferencia | Perplejidad (subconjunto) |
|---|---:|
| BF16, SGLang TP=2 en dos Sparks | 2,963662 |
| NVFP4 MLP / BF16 atención, SGLang TP=1 en una Spark | 3,210088 |
| HF layerwise BF16 (comparación) | 2,964162 |
| ModelOpt fake-quant (comparación) | 3,206985 |

Variación de perplejidad: +8,31 % en este subconjunto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks downstream en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 57,21 GB (53,28 GiB) de safetensors; con caché KV en BF16 y overhead de servicio, el autor configura `mem-fraction-static 0.72` y `max-total-tokens 16384` en un solo GB10, lo que sugiere un presupuesto de memoria unificado en torno a 80-128 GB para esa configuración.
- GPU recomendadas: NVIDIA DGX Spark (GB10) validada con SGLang 0.5.19, CUDA 13 y FlashInfer CUTLASS NVFP4 GEMMs. El BF16 completo requiere TP=2 en dos Sparks. No se documenta validación en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en GPUs consumer convencionales (RTX 4090, 24 GB) por el tamaño del checkpoint; el escenario validado es un dispositivo GB10 con memoria unificada.
- Opciones de despliegue: exclusivamente el adaptador SGLang incluido (`inference/serve.py`). No se ha establecido compatibilidad con vLLM, TensorRT-LLM, llama.cpp, Ollama, TGI ni Transformers genéricos.
- Latencia y throughput: no disponibles. El autor indica que el primer arranque puede tardar varios minutos en compilar kernels nativos y que los arranques posteriores reutilizan la caché; la configuración limita a `max-running-requests 2` y `chunked-prefill-size 1024`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue validado |
|---|---|---|---|---|---|
| Ripple-65B-Base-Preview-NVFP4 (esta ficha) | ~64,8 B denso | 8.192 | NVFP4 MLP + BF16 atención | Apache-2.0 | SGLang en 1× DGX Spark |
| Ripple-65B-Base-Preview (BF16) | ~64,8 B denso | 8.192 | BF16 | Apache-2.0 | SGLang TP=2 en 2× DGX Spark |
| Ripple-65B-Preview-NVFP4 (instrucciones) | no disponible | no disponible | NVFP4 | Apache-2.0 | SGLang (adaptador de origen) |

No se dispone de datos de benchmarks comparativos con modelos de terceros de tamaño similar en la información proporcionada; la comparación se limita a las variantes del propio linaje Ripple.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a instrucciones ni a formato de chat; la plantilla de chat incluida en el tokenizer es solo de procedencia y no convierte el modelo en instruct.
- Contexto limitado a 8.192 tokens, sin soporte documentado de extensión.
- Solo inglés; no se documentan capacidades multilingües.
- Degradación medida de perplejidad del +8,31 % en un subconjunto pequeño de WikiText-2; no se han evaluado benchmarks downstream, retención en código ni rendimiento en contexto largo de forma independiente.
- Riesgo de alucinación inherente a un modelo base sin alineación; no se documentan sesgos conocidos, pero tampoco evaluaciones de seguridad.
- Compatibilidad de inferencia restringida al adaptador SGLang incluido; el uso con vLLM, TensorRT-LLM o Transformers no está verificado y puede fallar por la arquitectura personalizada.
- Requiere `trust_remote_code` y ejecución de código del repositorio; auditar antes de desplegar en entornos sensibles.
- El primer arranque implica compilación de kernels nativos de varios minutos; no apto para arranques efímeros sin caché.
- Licencia Apache-2.0 permite uso comercial, pero la falta de validación downstream traslada al integrador la responsabilidad de evaluar la calidad en su dominio.
- Release experimental de la comunidad (0 descargas, 0 likes en el momento de la consulta); no hay garantía de mantenimiento ni soporte por parte de Ricursive Intelligence.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/osoleve/Ripple-65B-Base-Preview-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Release NVFP4 de instrucciones (origen del adaptador SGLang): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Revisión fijada del modelo base: `6187d1108a25fcc31681ec942ec3c581721b9fe1`
- Revisión del adaptador SGLang: `99eea4477a001a41b86914e41feb4b2ed86105e5`
- Ficheros incluidos en el repo: `quantization-provenance.json`, `validation.json`, `SHA256SUMS`, `requirements-inference.txt`, `reproduce/README.md`, `reproduce/quantize.py`, `inference/serve.py`
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
