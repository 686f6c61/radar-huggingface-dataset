# RedHatAI/Qwen3.8-27B-MXFP4

## Resumen

Qwen3.8-27B-MXFP4 es una versión cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por RedHatAI. Se trata de una compresión a MXFP4 (pesos y activaciones en FP4, caché KV en FP8) obtenida mediante GPTQ con suavizado de activaciones AWQ a través de LLM Compressor, pensada para servir el modelo con vLLM. El resultado reduce el espacio en disco y los requisitos de memoria GPU en aproximadamente un 75% respecto al modelo original en BF16, manteniendo los componentes no cuantizados (embeddings, lm_head, proyecciones visuales y algunas proyecciones de atención lineal) en su precisión original.

El modelo base es un transformer de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con 27.356.728.592 parámetros totales, capaz de recibir texto, imagen y vídeo y generar texto. La ficha de Hugging Face lo clasifica con el pipeline `image-text-to-text` y lo etiqueta como compatible con endpoints y validado sobre RHOAI 3.5.0, RHAIIS 3.5.0 y vLLM 0.24.0.

Su relevancia actual reside en que permite desplegar un modelo multimodal de ~27B en hardware mucho más modesto que la versión BF16, con una pérdida de precisión muy contenida en las evaluaciones publicadas (recuperación entre el 95,7% y el 101,2% según la tarea). La licencia Apache 2.0 facilita el uso comercial, aunque conviene verificar las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (entrada texto/imagen/vídeo, salida texto) |
| Parametros totales | 27.356.728.592 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los scripts de evaluacion usan `max_length=69632`) |
| Tipos de cuantizacion | MXFP4 (FP4) en pesos y activaciones de operadores lineales; caché KV en FP8; componentes no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (repo de 19,9 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.8-27B, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`: un transformer multimodal que acepta texto, imágenes y vídeo como entrada y produce texto. El proceso de cuantización se aplicó con LLM Compressor usando una receta compuesta por `AWQModifier` (con `duo_scaling="both"`) seguida de `GPTQModifier` con esquema `MXFP4` sobre todas las capas `Linear`, excluyendo las proyecciones visuales (`re:visual.*`, `re:model.visual.*`), `lm_head`, `embed_tokens` y las proyecciones `linear_attn.in_proj_a` e `in_proj_b`. La caché KV se cuantizó a FP8 con estrategia simétrica por tensor y observador `static_minmax`. La calibración se realizó con 512 muestras del dataset `perfectblend` (`train[:512]`), longitud máxima de secuencia de 4096 y `moe_calibrate_all_experts=True`.

No se detallan en la información disponible los datos de preentrenamiento del modelo base (número de tokens, composición del corpus ni si hubo RLHF/DPO). Sí se menciona que el modelo base incorpora una cabeza MTP (multi-token prediction) utilizable para decodificación especulativa en vLLM, y que el despliegue admite opciones específicas de escalado de contexto largo documentadas en la receta de vLLM para Qwen3.8-27B. La cuantización no modifica los componentes no lineales ni las partes sensibles del modelo visual, que permanecen en BF16.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable en vLLM mediante `--reasoning-parser qwen3`.
- Entrada multimodal: texto, imágenes y vídeo (pipeline `image-text-to-text`).
- Razonamiento matemático: evaluado en GSM8K Platinum, MATH-500 y AIME 2025 con resultados altos.
- Instrucciones complejas: evaluado en IFEval con un 90,88% en prompt-level strict.
- Conocimiento científico y de nivel experto: evaluado en GPQA Diamond con un 87,71% pass@1.
- Tool calling / function calling: soportado en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible`).
- Decodificación especulativa mediante la cabeza MTP integrada del modelo base (según la receta de vLLM referenciada).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia técnica multimodal: el modelo puede recibir capturas de pantalla, diagramas o fotogramas de vídeo junto con texto para diagnosticar incidencias, aprovechando su entrada image-text-to-text y su ventana de contexto amplia (los scripts de evaluación usan hasta 69632 tokens).
- Generación de código con herramientas: al soportar tool calling con el parser `qwen3_xml` en vLLM, puede integrarse en pipelines de CI/CD o asistentes de IDE que invocan funciones externas (ejecutar tests, consultar APIs, leer ficheros).
- Razonamiento matemático y verificación: útil en plataformas educativas o de análisis cuantitativo donde se requiere resolver problemas tipo MATH-500 o AIME con razonamiento explícito y alta precisión.
- Análisis de documentos escaneados y vídeo: extracción de información estructurada a partir de imágenes y vídeo combinados con instrucciones textuales, por ejemplo en digitalización de facturas o inspección visual automatizada.
- Agentes autónomos multi-paso: con el modo de razonamiento y el soporte de tool calling, puede orquestar flujos que alternan consultas a herramientas y razonamiento intermedio.
- Despliegue en infraestructura con presupuesto de memoria ajustado: al reducir ~75% el espacio frente a BF16, permite servir un modelo de 27B multimodal en una sola GPU de 80 GB o en configuraciones de menor VRAM, validado sobre RHOAI y RHAIIS 3.5.0.
- Evaluación de instrucciones estrictas: adecuado para sistemas que exigen cumplimiento literal de formato (IFEval 90,88%), como generación de informes con plantillas fijas.

## Benchmarks y rendimiento

Evaluaciones publicadas por el autor, ejecutadas con lm-evaluation-harness y lighteval sobre vLLM (API compatible con OpenAI) en 1× NVIDIA B200, 0-shot:

| Categoria | Benchmark | Qwen/Qwen3.8-27B | RedHatAI/Qwen3.8-27B-MXFP4 | Recuperacion |
|---|---|---|---|---|
| Seguimiento de instrucciones | IFEval (prompt-level strict) | 91,19% | 90,88% | 99,7% |
| Razonamiento | GSM8K Platinum (strict-match) | 96,25% | 95,18% | 98,9% |
| Razonamiento | MATH-500 (pass@1) | 83,67% | 84,67% | 101,2% |
| Razonamiento | AIME 2025 (pass@1) | 96,67% | 92,50% | 95,7% |
| Razonamiento | GPQA Diamond (pass@1) | 89,56% | 87,71% | 97,9% |

Las tareas se evaluaron con semillas 1234/2345/3456 (3 repeticiones); AIME 2025 con 8 semillas. No se han publicado datos de latencia ni throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 19,9 GB, por lo que la inferencia en MXFP4 requiere aproximadamente 20 GB solo para pesos; hay que sumar caché KV en FP8 y buffers de activación, lo que sitúa el consumo práctico por encima de esa cifra según longitud de contexto y batch.
- GPU recomendadas: el autor validó en 1× NVIDIA B200; por tamaño, cabría esperar funcionamiento en A100/H100 de 80 GB y en GPUs con soporte nativo de FP4 (Blackwell). No se confirman otros modelos en la información disponible.
- GPU de consumo: no disponible confirmación; el soporte de MXFP4 depende de kernels específicos de vLLM y del hardware, por lo que no se garantiza en RTX 4090 u otras consumer sin validación explícita.
- Despliegue: vLLM (comando documentado con `--tensor-parallel-size 1`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml`); validado en RHOAI 3.5.0 y RHAIIS 3.5.0. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-27B-MXFP4 | 27,36B | no disponible | MXFP4 pesos/activaciones, KV FP8 | Apache 2.0 | Multimodal, validado en vLLM 0.24.0 |
| Qwen/Qwen3.8-27B (base) | 27,36B | no disponible | BF16 | no disponible en la informacion | Referencia de precisión; ~4× tamaño en disco |
| Otras cuantizaciones del mismo base (p. ej. FP8/INT8) | 27,36B | no disponible | no disponible | no disponible | No se detallan en la informacion proporcionada |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos de otros fabricantes en la información proporcionada, por lo que la comparativa se limita al modelo base y a variantes de cuantización del mismo checkpoint.

## Limitaciones y advertencias

- La cuantización a FP4 introduce pérdida de precisión: la recuperación cae al 95,7% en AIME 2025 y al 97,9% en GPQA Diamond respecto al modelo BF16.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento uniforme fuera de los idiomas del modelo base.
- Longitud de contexto máxima oficial: no disponible; los scripts de evaluación usan `max_length=69632`, pero no se confirma como límite del modelo.
- La licencia del artefacto es Apache 2.0, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B antes de uso comercial.
- El despliegue requiere vLLM con soporte de MXFP4 y `compressed-tensors`; no se garantiza compatibilidad con otros runtimes (llama.cpp, Ollama, TGI).
- El hardware validado es 1× NVIDIA B200; el rendimiento en otras GPUs no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- lm-evaluation-harness (fork neuralmagic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (fork neuralmagic): https://github.com/neuralmagic/lighteval
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
