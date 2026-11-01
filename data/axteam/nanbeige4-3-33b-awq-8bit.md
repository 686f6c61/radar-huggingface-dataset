# axteam/Nanbeige4.3-33B-AWQ-8bit

## Resumen

Nanbeige4.3-33B-AWQ-8bit es una cuantización de 8 bits del modelo Nanbeige/Nanbeige4.3-33B, publicada por el usuario axteam. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: aplica cuantización post-entrenamiento AWQ en esquema W8A16 (pesos INT8 simétricos con grupo de tamaño 32, activaciones en BF16) sobre el modelo original en BF16. El resultado se distribuye en formato compressed-tensors `pack-quantized` y está pensado específicamente para servir el modelo con vLLM mediante una API compatible con OpenAI.

El modelo base es un transformer denso de arquitectura Llama con 52 capas y 11.035.115.224 parámetros reales según los safetensors (a pesar del "33B" del nombre comercial). Es un modelo solo de texto, con un template de chat que activa por defecto un modo de razonamiento (thinking mode) y con un sesgo claro hacia el coreano y el inglés, a juzgar por los benchmarks y los ejemplos de la model card.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue que reduce el peso en disco a unos 37,4 GB manteniendo una fidelidad muy alta respecto al BF16 original (perplejidad 1,2237 frente a 1,2232, y una recuperación media del 99,6% en el conjunto de benchmarks medidos); por otro, advierte de que el ecosistema de ejecución es muy específico (vLLM 0.32.0, torch 2.13, CUDA 13), lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama, 52 capas, solo texto |
| Parametros totales | 11.035.115.224 (11,04 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de despliegue con `--max-model-len 32768`); no se documenta un máximo oficial distinto |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétrico, grupo 32, activaciones BF16); embeddings, LM head y RMSNorm se mantienen en BF16 |
| Idiomas soportados | no disponible de forma oficial; los benchmarks y ejemplos sugieren coreano e inglés como idiomas principales |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` |
| Modelo base | Nanbeige/Nanbeige4.3-33B |
| Tamano en disco | ~37,4 GB (repo de 37,5 GB) |
| Metodo de cuantizacion | PTQ AWQ, 256 muestras de calibracion, sin reentrenamiento |
| Runtime probado | vLLM 0.32.0 (Python 3.11-3.14, torch 2.13 con CUDA 13.0, transformers >=5.16.1,<5.20, compressed-tensors 0.17.0) |
| `trust_remote_code` | no necesario |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo nuevo. La arquitectura subyacente es un transformer denso de tipo Llama con 52 capas, sin mezcla de expertos, y solo modalidad de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original pasó por RLHF o DPO; esos datos corresponden al modelo base Nanbeige4.3-33B y no están incluidos en la información proporcionada.

La innovación técnica de esta publicación es el esquema de cuantización. Se aplica AWQ (activation-aware weight quantization) en modo W8A16: solo se cuantizan las proyecciones de atención y MLP, mientras que los embeddings de tokens, la LM head y todas las RMSNorm permanecen en BF16. Los pesos INT8 son simétricos con grupo de 32 y las activaciones se mantienen en BF16, lo que evita kernels de cuantización de activaciones y permite ejecutar en GPUs Turing (sm75) o superiores sin tensor cores especiales. La calibración usó 256 muestras y el proceso es PTQ puro, sin reentrenamiento. El tokenizador y el `chat_template` son idénticos a los del original, incluido el modo de razonamiento activado por defecto.

## Capacidades

- Generación de texto conversacional multi-turno: el checkpoint conserva el template de chat del modelo base, con roles de sistema, usuario y asistente.
- Modo de razonamiento (thinking mode) activado por defecto en el template de chat; se puede desactivar con `chat_template_kwargs={"enable_thinking": false}`.
- Razonamiento matemático: el benchmark GSM8K del modelo original alcanza 83,70 en 5-shot estricto, lo que indica una competencia sólida en problemas aritméticos de varios pasos.
- Comprensión lectora y conocimiento general: evaluado en MMLU (34,89), ARC-Challenge (53,16) y Winogrande (67,48) sobre el original en BF16.
- Capacidades específicas para coreano: KMMLU (28,46) y HAE-RAE (38,22) en el modelo original, lo que confirma un entrenamiento orientado a ese idioma.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el thinking mode sugiere cierta capacidad de razonamiento encadenado, pero no hay evaluación específica.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo de texto.
- Despliegue como servidor compatible con OpenAI: incluido en la model card mediante `vllm serve`.

## Casos de uso

- Servicio de chat en coreano e inglés: el modelo puede atender conversaciones multi-turno con contexto de hasta 32.768 tokens, adecuado para asistentes que necesitan recordar el historial de una sesión larga. El sesgo coreano de los benchmarks lo hace especialmente indicado para productos dirigidos a ese mercado.
- Razonamiento matemático asistido: con un 82,71 en GSM8K (5-shot estricto) tras la cuantización, es viable para tutores automáticos de aritmética, verificación de cálculos en hojas de cálculo o generación de problemas resueltos paso a paso.
- Generación de texto con modo de razonamiento explícito: el thinking mode por defecto permite obtener cadenas de razonamiento antes de la respuesta final, útil en aplicaciones de análisis que requieren trazabilidad del proceso, como resúmenes de documentos técnicos o explicaciones didácticas.
- Despliegue en infraestructura con GPUs de gama media-alta: al requerir solo Turing (sm75) o superior y no necesitar tensor cores especiales, puede servirse en GPUs como A100, L40S o RTX 4090 con tensor parallelism cuando los 37,4 GB de pesos no caben en una sola tarjeta. Esto lo hace apto para entornos on-premise sin H100.
- Backend de API compatible con OpenAI: al integrarse con vLLM, se puede exponer como endpoint `/v1/chat/completions` y sustituir a APIs comerciales en prototipos internos, con la ventaja de la licencia Apache 2.0 y la ausencia de coste por token.
- Evaluación comparativa de cuantizaciones: el checkpoint incluye métricas de fidelidad frente al BF16 original (perplejidad y acuerdo top-1), por lo que sirve como referencia para estudiar el impacto de AWQ INT8 frente a FP8, NVFP4 o AWQ 4-bit en un mismo modelo.
- Investigación sobre eficiencia de inferencia: al reducir el peso a 37,4 GB y permitir KV cache en FP8, es un banco de pruebas para medir latencia y throughput en configuraciones de memoria ajustada.

## Benchmarks y rendimiento

Los datos siguientes están medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy y evaluación few-shot de completación (sin template de chat). La columna "recuperación" indica el porcentaje respecto al BF16 original.

| Benchmark | BF16 (original) | AWQ-8bit (este repo) | Recuperacion |
|---|---|---|---|
| MMLU (5-shot) | 34,89 | 35,05 | 100,5% |
| GSM8K (5-shot, strict) | 83,70 | 82,71 | 98,8% |
| ARC-Challenge (0-shot) | 53,16 | 53,75 | 101,1% |
| Winogrande (5-shot) | 67,48 | 67,17 | 99,5% |
| KMMLU (5-shot, direct) | 28,46 | 28,40 | 99,8% |
| HAE-RAE (0-shot) | 38,22 | 37,67 | 98,6% |
| Promedio | 50,98 | 50,79 | 99,6% |

Métricas de fidelidad frente al original BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2237 | 1,2232 (+0,0%) |
| Acuerdo top-1 en siguiente token | 98,8% | 99,1% |

Para contextualizar, el autor incluye en la model card comparaciones con otras cuantizaciones del mismo modelo: FP8-dynamic (promedio 50,78, 99,6%), NVFP4A16 (50,44, 98,9%), NVFP4 (50,94, 99,9%) y AWQ-4bit (50,90, 99,8%). No se proporcionan comparaciones con modelos de otros desarrolladores.

## Requisitos de hardware

- VRAM para pesos: 37,4 GB en el checkpoint INT8. Es imprescindible añadir la KV cache (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU compatibles: NVIDIA Turing (sm75) o superior. V100 (sm70) no está soportada. El autor solo ha ejecutado la prueba en una B200; la selección de kernel la realiza vLLM 0.32 según la GPU.
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no caben en una sola GPU. Con 37,4 GB, una RTX 4090 de 24 GB no es suficiente para una sola tarjeta; se necesitan al menos dos, o bien GPUs de 48 GB o más (A6000, L40S, A100 80GB, H100).
- Cabe en consumer GPU: solo con configuración multi-GPU (por ejemplo, 2x RTX 4090) o en tarjetas de gama profesional con 48 GB o más. No cabe en una única GPU de consumo de 24 GB.
- Opciones de despliegue: vLLM 0.32.0 es el runtime probado y recomendado, con servidor compatible con OpenAI. Para uso sin vLLM, la model card indica transformers >=4.56.0 junto con compressed-tensors >=0.15.0, aunque esa ruta no fue probada para este modelo. No se mencionan llama.cpp, Ollama ni TGI.
- Reducción de KV cache: opción de servir con `--kv-cache-dtype fp8`, que aproximadamente reduce a la mitad la memoria de KV cache en contextos largos o lotes grandes.
- Latencia y throughput: no disponibles; el autor no publica medidas de rendimiento de inferencia.

## Comparativa con modelos similares

La información proporcionada solo permite comparar esta cuantización con otras cuantizaciones del mismo modelo base, no con modelos de otros desarrolladores.

| Variante | Metodo | Promedio benchmarks | Recuperacion vs BF16 | Licencia |
|---|---|---|---|---|
| BF16 (original) | sin cuantizar | 50,98 | 100,0% | apache-2.0 |
| AWQ-8bit (este repo) | AWQ INT8 W8A16 | 50,79 | 99,6% | apache-2.0 |
| FP8-dynamic | FP8 dinamico | 50,78 | 99,6% | no disponible |
| NVFP4A16 | NVFP4 pesos, activaciones 16-bit | 50,44 | 98,9% | no disponible |
| NVFP4 | NVFP4 | 50,94 | 99,9% | no disponible |
| AWQ-4bit | AWQ INT4 | 50,90 | 99,8% | no disponible |

Comparación con modelos de otros desarrolladores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint cuantizado, no un modelo entrenado: hereda todos los sesgos y limitaciones del modelo base Nanbeige4.3-33B, sobre el que no se aporta información de composición del dataset ni de alineación.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación; el MMLU de 34,89 en el original es bajo en términos absolutos, lo que sugiere un conocimiento factual limitado fuera de los dominios cubiertos por el entrenamiento.
- Cobertura de idiomas: la model card no declara idiomas soportados. Los benchmarks y ejemplos se centran en coreano e inglés; el rendimiento en castellano no está evaluado y no debería asumirse.
- Ecosistema de ejecución muy restringido: requiere vLLM 0.32.0 con Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0. La model card advierte explícitamente de no actualizar compressed-tensors por separado, ya que el checkpoint se guardó con 0.19.0 pero se lee con 0.17.0.
- Compatibilidad de GPU limitada: V100 (sm70) no está soportada. El autor solo validó en B200, por lo que el comportamiento en otras GPUs depende de la selección de kernel de vLLM.
- La ruta sin vLLM (transformers + compressed-tensors) no fue probada para este modelo; la model card la menciona como teóricamente posible pero sin validación.
- El nombre comercial "33B" no coincide con los parámetros reales (11,04 mil millones), lo que puede inducir a error al dimensionar infraestructura.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado cuantizado conviene verificar que el modelo base mantiene la misma licencia y que no existen restricciones adicionales no documentadas.
- Repositorio con muy poca adopción (26 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en producción ni de mantenimiento a largo plazo por parte de axteam.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/axteam/Nanbeige4.3-33B-AWQ-8bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Documentación de vLLM: no disponible en la información proporcionada
- Paper de AWQ: no disponible en la información proporcionada
- Repositorio de compressed-tensors: no disponible en la información proporcionada
- Demos o blogs adicionales: no disponible en la información proporcionada
