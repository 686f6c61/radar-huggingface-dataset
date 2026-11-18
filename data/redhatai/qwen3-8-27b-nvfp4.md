# RedHatAI/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una versión cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por RedHatAI (equipo vinculado a Neural Magic y a la iniciativa de compresión de modelos de Red Hat). El modelo original, desarrollado por Qwen (Alibaba), es un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration` que acepta texto e imagen como entrada y genera texto. Esta variante aplica una cuantización de precisión mixta FP4/FP8 sobre los pesos y activaciones, reduciendo el checkpoint de aproximadamente 54 GB en BF16 a unos 24,7 GB en disco, lo que supone una reducción de en torno al 70 % en requisitos de almacenamiento y memoria de GPU.

La relevancia de esta ficha radica en que permite desplegar un modelo de gran tamaño con capacidades de razonamiento, matemáticas, código y visión en hardware más modesto, manteniendo una recuperación de precisión muy alta respecto al original en los benchmarks publicados (por encima del 98 % en la mayoría de las tareas de razonamiento evaluadas). El modelo está pensado para servirse con vLLM y aprovecha el formato `compressed-tensors` de LLM Compressor, además de ofrecer soporte para decodificación especulativa mediante un modelo draft dedicado.

El checkpoint real en safetensors declara 20.294.595.344 parámetros, aunque el nombre comercial del modelo haga referencia a 27B; esta discrepancia debe tenerse en cuenta al planificar el despliegue. La licencia es Apache 2.0 y la fecha de publicación indicada es el 21 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, entrada texto/imagen, salida texto) |
| Parámetros totales | 20.294.595.344 (según safetensors); nombre comercial 27B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP4 y FP8 (pesos y activaciones); KV cache en FP8; cabeza LM sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (vLLM, llm-compressor) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5 que procesa entradas de texto e imagen y genera texto. La versión NVFP4 conserva la arquitectura del original y solo cuantiza los operadores lineales dentro de los bloques del transformer: las proyecciones MLP se cuantizan a FP4, mientras que las proyecciones de atención (incluidas las de atención lineal) y las capas MLP finales (bloques 56 a 63) se cuantizan a FP8. La KV cache también se cuantiza a FP8 y la cabeza del modelo de lenguaje (`lm_head`) se mantiene en precisión completa para preservar la calidad de salida. El módulo visual queda excluido de la cuantización.

La receta de cuantización combina AWQ y GPTQ mediante LLM Compressor, con calibración sobre un subconjunto de 512 muestras del dataset `perfectblend`, longitud máxima de secuencia de 4096 y calibración de todos los expertos MoE (`moe_calibrate_all_experts=True`), lo que sugiere que el modelo base emplea una arquitectura con mezcla de expertos, aunque el número de parámetros activos no se detalla. Las escalas de cuantización se recalibraron respecto a versiones anteriores (versión 2.0 del checkpoint). No se especifican en la información disponible el número de tokens de entrenamiento del modelo base ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte de modo de razonamiento (`--reasoning-parser qwen3` en vLLM).
- Resolución de problemas matemáticos y tareas de razonamiento científico (evaluado en GSM8K Platinum, MATH-500, AIME 2025 y GPQA Diamond).
- Generación y modificación de código, con evaluación en SWE Bench mediante Inspect AI.
- Seguimiento de instrucciones (IFEval).
- Entrada multimodal de imagen y texto (`image-text-to-text`), aunque el módulo visual no está cuantizado.
- Soporte de tool calling / function calling, con parser `qwen3_xml` y `--enable-auto-tool-choice` en vLLM.
- Compatibilidad con decodificación especulativa mediante el modelo draft `RedHatAI/Qwen3.8-27B-speculator.dspark` (método `dspark`, hasta 7 tokens especulativos) o mediante MTP (`num_speculative_tokens=3`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo obtiene un 96,72 % en GSM8K Platinum y un 84,27 % en MATH-500, por lo que es adecuado para tutores automáticos o verificación de cálculos en entornos educativos y financieros.
- Generación y revisión de código en pipelines de CI/CD: su evaluación en SWE Bench y el soporte de tool calling permiten integrarlo como agente que propone parches o resuelve issues acotadas.
- Agentes con uso de herramientas: la configuración de vLLM con `--enable-auto-tool-choice` y el parser `qwen3_xml` permiten construir asistentes que invocan APIs externas en flujos multi-paso.
- Análisis de documentos con imagen: al aceptar entradas image-text-to-text, puede extraer información de capturas, diagramas o formularios combinándola con razonamiento textual.
- Asistencia técnica especializada: su rendimiento en GPQA Diamond (89,22 %) lo hace útil para responder consultas de dominio científico-técnico con razonamiento explícito.
- Despliegue en infraestructura con memoria limitada: el checkpoint de 24,7 GB frente a los 54 GB en BF16 permite servirlo en GPUs con menos VRAM, manteniendo la precisión del original.
- Servicio de inferencia de baja latencia: con decodificación especulativa DSpark o MTP en vLLM, se reduce el coste por token en cargas conversacionales de alto volumen.

## Benchmarks y rendimiento

Resultados publicados en la model card, ejecutados con vLLM sobre 1 GPU B200, comparando el modelo cuantizado con el BF16 original:

| Categoría | Benchmark | Qwen/Qwen3.8-27B (BF16) | RedHatAI/Qwen3.8-27B-NVFP4 | Recuperación |
|---|---|---|---|---|
| Razonamiento | GSM8K Platinum | 96,25 % | 96,72 % | 100,49 % |
| Razonamiento | MATH-500 | 83,67 % | 84,27 % | 100,72 % |
| Razonamiento | AIME 2025 | 96,67 % | 95,00 % | 98,27 % |
| Razonamiento | GPQA Diamond | 89,56 % | 89,22 % | 99,62 % |
| Instrucciones | IFEval | no disponible en el extracto | no disponible en el extracto | no disponible |
| Código | SWE Bench | no disponible en el extracto | no disponible en el extracto | no disponible |

No se han publicado en la información disponible resultados detallados de IFEval ni de SWE Bench, aunque la model card indica que se evaluaron.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa unos 24,7 GB en disco; en inferencia con vLLM se requiere espacio adicional para KV cache (cuantizada a FP8) y activaciones, por lo que se recomienda al menos 32-40 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA B200 (usada en la evaluación oficial), H100 y GPUs con soporte de FP4/FP8 nativo. El formato NVFP4 requiere hardware compatible con FP4 para aprovechar la aceleración.
- GPU de consumo: no disponible de forma explícita; el tamaño del checkpoint hace inviable su ejecución en GPUs de consumo con menos de 24 GB, y las RTX 4090 (24 GB) quedarían al límite sin margen para KV cache.
- Opciones de despliegue: vLLM es el runtime de referencia (`vllm serve`), con soporte de `--reasoning-parser qwen3`, `--tool-call-parser qwen3_xml` y decodificación especulativa MTP o DSpark. No se indica soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no se proporcionan cifras concretas; la model card menciona una sección de evaluación de rendimiento y el uso de decodificación especulativa para mejorar el throughput, pero sin números en el extracto disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-27B-NVFP4 | 20,29 B (safetensors) | no disponible | FP4/FP8 mixta | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.8-27B (BF16) | 27 B (nominal) | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables en la documentación proporcionada; la comparación principal es con el modelo base BF16, del que esta versión es una cuantización con recuperación de precisión superior al 98 % en la mayoría de benchmarks.

## Limitaciones y advertencias

- La cuantización FP4/FP8 puede introducir degradación en tareas no evaluadas; la recuperación publicada solo cubre GSM8K Platinum, MATH-500, AIME 2025, GPQA Diamond, IFEval y SWE Bench.
- El módulo visual no está cuantizado, por lo que las capacidades de imagen conservan la precisión del original pero no se benefician de la reducción de memoria.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento uniforme fuera del inglés sin evaluación adicional.
- Longitud de contexto: no disponible, lo que impide planificar cargas con documentos largos sin verificación previa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen/Qwen3.8-27B por si existieran términos adicionales.
- El despliegue óptimo depende de hardware con soporte FP4 (B200, H100); en GPUs sin esa capacidad el rendimiento puede degradarse o requerir fallback.
- La discrepancia entre el nombre comercial (27B) y los parámetros reales (20,29 B) debe considerarse al dimensionar infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo draft para decodificación especulativa: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (Neural Magic): https://github.com/neuralmagic/lighteval
- Inspect AI: https://github.com/UKGovernmentBEIS/inspect_ai
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
