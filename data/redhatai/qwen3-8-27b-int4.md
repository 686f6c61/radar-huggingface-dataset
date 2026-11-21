# RedHatAI/Qwen3.8-27B-INT4

## Resumen

Qwen3.8-27B-INT4 es una versión cuantizada a INT4 del modelo multimodal Qwen/Qwen3.8-27B, publicada por RedHatAI el 17 de agosto de 2026. El modelo original, desarrollado por Qwen (Alibaba), acepta entradas de texto e imagen y genera texto, con una arquitectura `Qwen3_5ForConditionalGeneration` y 27.356.728.592 parámetros totales. La versión de RedHatAI mantiene las activaciones en su precisión original (esquema W4A16), cuantiza únicamente los operadores lineales dentro de los bloques del transformer y utiliza una caché KV en FP8, lo que reduce el espacio en disco y los requisitos de VRAM en aproximadamente un 75% respecto al modelo en BF16.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de ~27B parámetros en infraestructura más modesta sin renunciar de forma significativa a la calidad: según la model card, la recuperación frente al modelo BF16 es muy alta en tareas de instrucciones (IFEval: 91,93% frente a 92,24%). Está pensada para servirse con vLLM (versiones validadas: RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0) y admite decodificación especulativa mediante un modelo draft DSpark publicado por el mismo autor.

La licencia es Apache 2.0, lo que facilita su uso comercial, y el formato de pesos es safetensors con cuantización en compressed-tensors. El repositorio ocupa 38,1 GB y acumula 228.132 descargas y 70 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal texto/imagen) |
| Parámetros totales | 27.356.728.592 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 en pesos (W4A16), activaciones sin cuantizar, caché KV en FP8 |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5 que procesa texto e imágenes y produce texto. La versión INT4 conserva la arquitectura original y solo modifica los pesos de las capas lineales de los bloques del transformer, dejando intactos el codificador visual (`visual.*`), el `lm_head`, los `embed_tokens` y las proyecciones `linear_attn.in_proj_a` y `linear_attn.in_proj_b`. La cuantización se realizó con LLM Compressor aplicando suavizado AWQ (`duo_scaling="both"`) y el esquema GPTQ W4A16, con 512 muestras de calibración del dataset `mlabonne/open-perfectblend`, longitud máxima de secuencia de 4096 y `moe_calibrate_all_experts=True`. La caché KV se cuantizó a FP8 simétrico por tensor con observador `static_minmax`.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si la arquitectura incorpora atención lineal u otras innovaciones más allá de la mención a `linear_attn` en las capas excluidas de la cuantización. La model card sí documenta soporte para decodificación especulativa mediante el método MTP (3 tokens especulativos) o mediante el draft model `RedHatAI/Qwen3.8-27B-speculator.dspark` (7 tokens especulativos, método `dspark`).

## Capacidades

- Generación de texto a partir de entradas de texto e imagen (pipeline `image-text-to-text`).
- Razonamiento y resolución de problemas matemáticos, evaluado en GSM8K Platinum, MATH-500, GPQA Diamond y AIME 2025.
- Seguimiento de instrucciones, evaluado en IFEval e MMLU-Pro.
- Soporte de tool calling / function calling, con parser `qwen3_xml` en vLLM y flag `--enable-auto-tool-choice`.
- Modo de razonamiento explícito, con parser `qwen3` (`--reasoning-parser qwen3`).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Compatibilidad con endpoints OpenAI a través de vLLM.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede recibir capturas de pantalla, diagramas o fotografías junto con texto y responder en inglés o chino, lo que lo hace adecuado para soporte técnico que requiera interpretar imágenes adjuntas.
- Automatización de documentación técnica: extracción de información de figuras, tablas e imágenes de manuales y generación de resúmenes textuales, aprovechando la entrada image-text-to-text.
- Agentes con tool calling: integración en flujos multi-paso donde el modelo invoca funciones externas (APIs, bases de datos) mediante el parser `qwen3_xml` de vLLM y el flag de auto tool choice.
- Razonamiento matemático y analítico: resolución de problemas cuantitativos en entornos educativos o de análisis financiero, respaldado por los resultados en MATH-500, GSM8K Platinum y AIME 2025.
- Despliegue en infraestructura con VRAM limitada: al reducir el peso de los pesos un 75% respecto a BF16, permite servir un modelo de ~27B en GPUs que no admitirían la versión completa, manteniendo la caché KV en FP8 para optimizar memoria.
- Generación de código y tareas de instrucción estricta: uso en pipelines de CI/CD o asistentes de desarrollo donde se requiere un cumplimiento alto de formato, dado el 91,93% en IFEval prompt-level strict.
- Servicio de inferencia de baja latencia: combinado con el draft model DSpark y decodificación especulativa, adecuado para aplicaciones interactivas que necesitan reducir el tiempo por token.

## Benchmarks y rendimiento

Resultados publicados en la model card (media de 3 semillas: 1234, 2345, 3456; 8 semillas para AIME 2025), servidos con vLLM y API compatible con OpenAI:

| Categoría | Benchmark | Qwen3.8-27B (BF16) | Qwen3.8-27B-INT4 | Recuperación |
|---|---|---|---|---|
| Instruction Following | IFEval (0-shot, prompt-level strict) | 92,24% | 91,93% | no disponible en el extracto |

El extracto de la model card proporcionado solo incluye la primera fila de la tabla de evaluación. Los resultados de MMLU-Pro, MATH-500, GPQA Diamond, GSM8K Platinum y AIME 2025 no están disponibles en la información suministrada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 38,1 GB, por lo que los pesos en INT4 requieren aproximadamente esa cifra de memoria, más el espacio para la caché KV en FP8 y las activaciones en precisión original. La model card indica una reducción de ~75% frente a los 16 bits.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, el modelo encaja en GPUs de 48 GB o más (A6000, L40S, A100 80 GB, H100) y requiere evaluación adicional para GPUs de 40 GB o menos.
- ¿Cabe en GPU de consumo? No confirmado. Con 38,1 GB de pesos, no cabría en GPUs de 24 GB (RTX 4090) sin técnicas adicionales de offloading; sería necesario verificar configuraciones con tensor parallelism o partición de capas.
- Opciones de despliegue: vLLM es el runtime validado (RHOAI 3.5.1, RHAIIS 3.6.0-fast.2, vLLM 0.28.0). El formato compressed-tensors está pensado para vLLM; no se menciona soporte de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Se documenta la posibilidad de usar decodificación especulativa con MTP (3 tokens) o con el draft model DSpark (7 tokens) para mejorar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-27B-INT4 | 27,36B | no disponible | INT4 W4A16, KV FP8 | Apache 2.0 | Hugging Face, validado en vLLM |
| Qwen/Qwen3.8-27B (BF16) | 27,36B | no disponible | BF16 | no disponible en la información | Hugging Face |
| RedHatAI/Mistral-Medium-3.5-128B | 128B (según nombre) | no disponible | no disponible | no disponible | Hugging Face (RedHatAI) |
| RedHatAI/diffusiongemma-26B-A4B-it-FP8 | 26B (A4B, según nombre) | no disponible | FP8 | no disponible | Hugging Face (RedHatAI) |

La información disponible no incluye datos de rendimiento de los modelos alternativos, por lo que la comparación se limita a parámetros, licencia y disponibilidad. No se dispone de una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- La cuantización INT4 puede degradar ligeramente la calidad frente al modelo BF16; la model card solo reporta la recuperación en IFEval, sin datos del resto de benchmarks en el extracto disponible.
- El modelo solo declara soporte de inglés y chino; el rendimiento en castellano no está documentado.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.8-27B, cuya licencia no se detalla en la información proporcionada.
- El despliegue está validado únicamente en vLLM; otros runtimes no están confirmados.
- La longitud de contexto no está especificada, lo que impide planificar casos de uso con ventanas largas.
- El modelo está etiquetado como `image-text-to-text`, pero no se detallan limitaciones del codificador visual ni resolución de imagen soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo draft para decodificación especulativa: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Organización RedHatAI en Hugging Face: https://huggingface.co/RedHatAI
- Listado de modelos RedHatAI: https://huggingface.co/RedHatAI/models
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (fork Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (fork Neural Magic): https://github.com/neuralmagic/lighteval
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
