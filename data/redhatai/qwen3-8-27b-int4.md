# RedHatAI/Qwen3.8-27B-INT4

## Resumen

Qwen3.8-27B-INT4 es una versión cuantizada a INT4 del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por RedHatAI (equipo vinculado a Red Hat y al ecosistema vLLM/Neural Magic). El modelo original, obra de Qwen (Alibaba), es un modelo de generación condicional de tipo `Qwen3_5ForConditionalGeneration` que acepta texto e imágenes como entrada y produce texto, con 27.356 millones de parámetros totales. Esta versión reduce los pesos de los operadores lineales de los bloques transformer a 4 bits manteniendo las activaciones en su precisión original (esquema W4A16), lo que disminuye el espacio en disco y los requisitos de memoria de GPU en aproximadamente un 75%.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de casi 27.000 millones de parámetros en infraestructura más modesta que la necesaria para el modelo en BF16, manteniendo una recuperación de precisión muy alta respecto al original según las evaluaciones publicadas. Está empaquetada en formato `compressed-tensors` y preparada para servirse con vLLM, con soporte de caché KV en FP8, parser de razonamiento `qwen3` y parser de tool calling `qwen3_xml`.

La licencia Apache 2.0 del modelo base y de la cuantización facilita su uso comercial, y el modelo incluye compatibilidad con decodificación especulativa mediante un modelo borrador DSpark publicado por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, entrada texto/imagen, salida texto) |
| Parámetros totales | 27.356.728.592 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 en pesos (W4A16), activaciones sin cuantizar, caché KV en FP8; exportado en compressed-tensors |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen/Qwen3.8-27B original, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer multimodal que procesa texto e imágenes. La cuantización se realizó con LLM Compressor aplicando un recetario combinado: primero un `AWQModifier` con `duo_scaling="both"` y después un `GPTQModifier` con esquema W4A16 sobre los operadores `Linear`, ignorando explícitamente las capas visuales (`visual.*`, `model.visual.*`), `lm_head`, `embed_tokens` y las proyecciones `linear_attn.in_proj_a` e `linear_attn.in_proj_b`. La caché KV se cuantizó a FP8 de forma simétrica y estática (`static_minmax`, estrategia tensor).

El proceso de calibración utilizó 512 muestras del dataset `mlabonne/open-perfectblend` con longitud máxima de secuencia de 4096 tokens, y se activó `moe_calibrate_all_experts=True` en la llamada a `oneshot`. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación destacable de esta versión es la preparación para decodificación especulativa con el modelo borrador `RedHatAI/Qwen3.8-27B-speculator.dspark` (método `dspark`, hasta 7 tokens especulativos) y con el método MTP nativo (3 tokens especulativos).

## Capacidades

- Generación de texto y razonamiento, con parser de razonamiento `qwen3` para separar el modo de pensamiento de la respuesta final.
- Comprensión de imágenes (image-text-to-text): el pipeline declarado es `image-text-to-text`, por lo que acepta entradas visuales junto a texto.
- Tool calling / function calling: soporte nativo mediante `--enable-auto-tool-choice` y parser `qwen3_xml` en vLLM.
- Razonamiento multi-paso y uso como agente, apoyado por el modo de razonamiento y el tool calling.
- Capacidades multilingües limitadas a inglés y chino según los metadatos de la model card.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como API compatible con OpenAI a través de vLLM.
- Decodificación especulativa para acelerar la inferencia (MTP o DSpark).

## Casos de uso

- Asistente conversacional multi-turno: el modelo puede mantener diálogos con historial gracias a su naturaleza conversacional y al parser de razonamiento, adecuado para atención al cliente o asistentes internos donde se requiere separar el razonamiento de la respuesta final.
- Automatización de soporte con imágenes: al aceptar entradas de imagen y texto, puede procesar capturas de pantalla, documentos escaneados o fotos de producto en flujos de soporte técnico.
- Agentes con herramientas: la combinación de tool calling (`qwen3_xml`) y razonamiento multi-paso permite construir agentes que consulten APIs, bases de datos o servicios externos antes de responder.
- Generación y revisión de código: el modelo está evaluado en tareas de razonamiento e instrucciones (IFEval, MMLU-Pro, MATH-500, GPQA Diamond, AIME 2025), lo que respalda su uso en asistentes de programación y revisión automatizada, aunque no se han publicado resultados específicos de HumanEval en la información disponible.
- Despliegue en infraestructura con VRAM limitada: la cuantización INT4 reduce el peso en memoria aproximadamente un 75 % frente a BF16, lo que permite servir el modelo en GPUs de menor capacidad que las necesarias para el modelo completo.
- Servicio de API compatible con OpenAI: mediante `vllm serve` se puede exponer el modelo como endpoint compatible, integrándolo en aplicaciones existentes que ya consumen la API de OpenAI.
- Aceleración de inferencia en producción: el uso del modelo especulador DSpark o del método MTP reduce la latencia en cargas de generación largas, útil en aplicaciones interactivas.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan la versión INT4 con el modelo BF16 original. La evaluación se realizó con lm-evaluation-harness y lighteval sobre vLLM (API compatible con OpenAI), con 3 semillas (1234, 2345, 3456) y 8 semillas para AIME 2025, promediando los resultados. La recuperación se calcula respecto al modelo BF16.

| Categoría | Benchmark | Qwen3.8-27B (BF16) | Qwen3.8-27B-INT4 | Recuperación |
|---|---|---|---|---|
| Seguimiento de instrucciones | IFEval (0-shot, prompt-level strict) | 92,24 % | 91,93 % | 99,67 % |
| Seguimiento de instrucciones | MMLU-Pro (exact-match) | no disponible (dato truncado en la información) | no disponible (dato truncado en la información) | no disponible |

No se han publicado en la información disponible el resto de resultados de MMLU-Pro, MATH-500, GPQA Diamond, AIME 2025 ni GSM8K Platinum, por lo que no se presentan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 38,1 GB en disco; con pesos INT4, el modelo requiere aproximadamente esa cantidad de memoria para los pesos, más la caché KV en FP8 y el overhead del runtime. En BF16 el requisito sería aproximadamente cuatro veces mayor (en torno a 55 GB solo de pesos, más caché y overhead).
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una GPU de 48 GB (A6000, L40S) o 80 GB (A100, H100) es el entorno natural; en GPUs consumer de 24 GB (RTX 4090) no cabría con comodidad sin técnicas adicionales de offloading, que no se documentan.
- Cabe en GPU consumer: no disponible con certeza; el tamaño del repo (38,1 GB) supera la VRAM de las consumer actuales de 24 GB.
- Opciones de despliegue: vLLM es el runtime soportado y documentado (`vllm serve RedHatAI/Qwen3.8-27B-INT4`), con soporte de `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y configuración de decodificación especulativa. El formato compressed-tensors está pensado para vLLM; no se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Se documenta la posibilidad de acelerar con decodificación especulativa (MTP con 3 tokens o DSpark con 7 tokens), sin cifras de mejora publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-27B-INT4 | 27,36 B | no disponible | INT4 (W4A16), KV FP8 | apache-2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.8-27B (BF16) | 27,36 B | no disponible | BF16 | apache-2.0 | Hugging Face |
| RedHatAI/Qwen3.8-27B-speculator.dspark | no disponible (modelo borrador) | no disponible | no disponible | no disponible | Hugging Face |

La comparación con alternativas de otros fabricantes del mismo tamaño no está disponible en la información proporcionada. El competidor directo más evidente es el propio modelo base en BF16, del que esta versión es una cuantización con recuperación del 99,67 % en IFEval.

## Limitaciones y advertencias

- La cuantización INT4 introduce una pérdida de precisión respecto al modelo BF16; la recuperación publicada es del 99,67 % en IFEval, pero no se dispone de datos para el resto de benchmarks, por lo que el impacto en tareas de razonamiento matemático o científico no está cuantificado en la información disponible.
- Idiomas soportados limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Longitud de contexto no disponible; conviene verificar en la documentación del modelo base antes de diseñar flujos con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.8-27B por si hubiera condiciones adicionales.
- El despliegue está orientado a vLLM con formato compressed-tensors; otros runtimes (llama.cpp, Ollama, TGI) no están documentados y pueden no ser compatibles.
- El uso de decodificación especulativa requiere descargar y servir un modelo borrador adicional, lo que incrementa los requisitos de memoria y la complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo borrador para decodificación especulativa: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (Neural Magic): https://github.com/neuralmagic/lighteval
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- README del modelo: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4/blob/main/README.md
