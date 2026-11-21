# RedHatAI/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una versión cuantizada en precisión mixta FP4/FP8 del modelo multimodal Qwen/Qwen3.8-27B, publicada por RedHatAI (Red Hat AI) dentro de su colección de modelos de terceros validados para el portfolio de productos de IA de Red Hat. El checkpoint reduce el peso en disco de aproximadamente 54 GB en BF16 a unos 24,7 GB, un recorte de en torno al 70 %, manteniendo el cabeza del modelo de lenguaje (lm_head) en precisión completa para preservar la calidad de salida.

El modelo resuelve el problema de desplegar un modelo de 20.294.595.344 parámetros con capacidades de razonamiento, código y visión en hardware con memoria limitada, sin renunciar de forma apreciable a la precisión del modelo original. La arquitectura declarada es Qwen3_5ForConditionalGeneration, con entrada de texto e imagen y salida de texto, y está pensada para servirse con vLLM 0.24.0 o superior, con soporte de decodificación especulativa mediante MTP o el draft model DSpark.

Es relevante ahora porque combina cuantización NVFP4 (formato de 4 bits nativo de las GPU Blackwell) con FP8 dinámico en atención y caché KV, y porque la model card reporta una recuperación de precisión prácticamente completa frente al BF16 en benchmarks de razonamiento, matemáticas e instrucciones. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, texto + imagen) |
| Parametros totales | 20.294.595.344 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (NVFP4) en proyecciones MLP; FP8 dinámico en atención y capas MLP finales; caché KV en FP8; lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (repo de 24,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5 con generación condicional, que acepta texto e imágenes y produce texto. La versión NVFP4 se genera aplicando LLM Compressor sobre Qwen/Qwen3.8-27B con una receta que combina AWQ (con `duo_scaling="both"`) y GPTQ. Las proyecciones MLP se cuantizan a NVFP4, mientras que las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj` y las proyecciones de atención lineal `in_proj_qkv`, `in_proj_z`, `out_proj`) y las capas MLP de los bloques 56 a 63 se mantienen en FP8 dinámico. La caché KV se cuantiza a FP8 simétrico por tensor con observador `static_minmax`.

La calibración se realizó sobre un subconjunto de 512 muestras del dataset perfectblend, con `max_seq_length=4096` y calibración de todos los expertos MoE (`moe_calibrate_all_experts=True`), lo que sugiere que el modelo base emplea mezcla de expertos, aunque el número de parámetros activos no se detalla en la información disponible. El módulo visual y el `lm_head` quedan excluidos de la cuantización. La model card no especifica el volumen de tokens de entrenamiento del modelo original ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable en el servidor mediante `--reasoning-parser qwen3`.
- Resolución de problemas matemáticos y de lógica (evaluado en GSM8K Platinum, MATH-500, AIME 2025 y GPQA Diamond).
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), con el módulo visual intacto en precisión original.
- Tool calling y function calling, con soporte nativo en vLLM mediante `--enable-auto-tool-choice` y parser `qwen3_xml`.
- Capacidades de agente y razonamiento multi-paso, con evaluación en SWE Bench mediante Inspect AI.
- Seguimiento de instrucciones, evaluado con IFEval.
- Decodificación especulativa: soporta MTP con 3 tokens especulativos o el draft model DSpark con 7 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en producción: el modelo se integra en pipelines de CI/CD a través de la API compatible con OpenAI de vLLM y el parser de tool calling, permitiendo generar parches y resolver tareas de ingeniería de software evaluadas en SWE Bench.
- Razonamiento matemático y analítico: con una recuperación del 100,49 % en GSM8K Platinum y del 100,72 % en MATH-500 frente al BF16, es adecuado para tutoría, verificación de cálculos y generación de explicaciones paso a paso.
- Agentes autónomos con herramientas: el soporte de `--enable-auto-tool-choice` y `qwen3_xml` permite construir agentes que invocan APIs externas, consultan bases de datos o ejecutan comandos en flujos multi-paso.
- Procesamiento de documentos con imagen: al aceptar entrada image-text, puede extraer información de capturas, diagramas o formularios y devolver texto estructurado.
- Despliegue en infraestructura con GPU Blackwell: el formato NVFP4 y el tamaño de 24,7 GB permiten servir el modelo en menos memoria que el BF16, reduciendo coste por instancia en entornos RHOAI o RHAIIS.
- Evaluación de calidad de modelos cuantizados: sirve como referencia para comparar la degradación de FP4/FP8 frente a BF16 en tareas de razonamiento, instrucciones y código.
- Generación de código con decodificación especulativa: el uso del draft model DSpark con 7 tokens especulativos reduce la latencia en cargas interactivas de autocompletado o generación larga.

## Benchmarks y rendimiento

Resultados reportados en la model card, servidos con vLLM sobre 1x B200 y comparados con el modelo base en BF16:

| Categoria | Benchmark | Qwen3.8-27B (BF16) | NVFP4 | Recuperacion |
|---|---|---|---|---|
| Razonamiento | GSM8K Platinum | 96,25 % | 96,72 % | 100,49 % |
| Razonamiento | MATH-500 | 83,67 % | 84,27 % | 100,72 % |
| Razonamiento | AIME 2025 | 96,67 % | 95,00 % | 98,27 % |
| Razonamiento | GPQA Diamond | 89,56 % | 89,22 % | 99 % (valor truncado en la informacion disponible) |

Los resultados de IFEval y SWE Bench no están disponibles en la información proporcionada. Tampoco se detallan métricas de latencia o throughput más allá de la recomendación de usar decodificación especulativa para un rendimiento óptimo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 24,7 GB en disco; en GPU se requiere al menos esa cantidad más overhead de activaciones y caché KV. Con cuantización FP8 de caché KV, la memoria adicional depende de la longitud de contexto, que no está especificada.
- GPU recomendadas: la evaluación se realizó en 1x B200. El formato NVFP4 requiere GPU con soporte de FP4 nativo (familia Blackwell) para aprovechar la aceleración; en arquitecturas anteriores la cuantización puede ejecutarse pero sin las ventajas de rendimiento del formato.
- GPU de consumo: no hay información que confirme compatibilidad con RTX 4090 u otras GPU consumer; el tamaño de 24,7 GB excede la VRAM de la mayoría de tarjetas de consumo de 24 GB una vez añadido el overhead.
- Opciones de despliegue: vLLM 0.24.0 o superior, validado en RHOAI 3.5.0 y RHAIIS 3.5.0. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card recomienda MTP con 3 tokens especulativos o DSpark con 7 para rendimiento óptimo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-27B-NVFP4 | 20.294.595.344 | no disponible | FP4/FP8 mixta | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.8-27B (BF16) | no disponible | no disponible | BF16 | no disponible | Hugging Face |
| RedHatAI/Mistral-Medium-3.5-128B | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| RedHatAI/diffusiongemma-26B-A4B-it-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La cuantización FP4/FP8 introduce una degradación mínima pero medible: AIME 2025 cae del 96,67 % al 95,00 % (recuperación del 98,27 %) y GPQA Diamond del 89,56 % al 89,22 %.
- El módulo visual y el `lm_head` no están cuantizados, por lo que el ahorro de memoria se concentra en el transformer; el consumo real en despliegue multimodal puede ser mayor de lo que sugiere el tamaño del checkpoint.
- No se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés y el chino habituales en la familia Qwen.
- No se detalla la longitud de contexto, un dato crítico para planificar memoria de caché KV y para casos de uso con documentos largos.
- No hay información sobre sesgos conocidos ni sobre tasas de alucinación del modelo base.
- El formato NVFP4 está optimizado para GPU Blackwell; en hardware anterior el rendimiento puede no ser representativo y la compatibilidad no está garantizada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de la licencia del modelo base Qwen/Qwen3.8-27B antes de uso comercial, ya que la información disponible no detalla la licencia del original.
- El modelo está validado únicamente con vLLM 0.24.0, RHOAI 3.5.0 y RHAIIS 3.5.0; otros runtimes no están verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft model DSpark: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Organización RedHatAI: https://huggingface.co/RedHatAI
- Catálogo de modelos RedHatAI: https://huggingface.co/RedHatAI/models
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (Neural Magic): https://github.com/neuralmagic/lighteval
- Inspect AI: https://github.com/UKGovernmentBEIS/inspect_ai
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
