# lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8-Pruned-RTXPRO-6000

## Resumen

Este modelo es una versión podada y cuantizada de Qwen3.8-Flash-Next, el modelo multimodal de arquitectura híbrida y Mixture-of-Experts desarrollado por Qwen. El autor, lovedheart, ha aplicado dos transformaciones principales: una poda de expertos mediante el método AIMER (reduciendo de 512 a 448 expertos enrutados por capa) y una cuantización de precisión mixta con NVIDIA Model Optimizer, que combina NVFP4 (W4A4) para los expertos enrutados y FP8 E4M3 2D-blockwise weight-only para las proyecciones de atención. El resultado es un checkpoint de 111,7 mil millones de parámetros en formato safetensors, con un tamaño de repositorio de 123,4 GB.

La relevancia de este modelo radica en que permite ejecutar un modelo de la clase Qwen3.8-Flash-Next en hardware Blackwell de gama alta, como las GPUs RTX Pro 6000, con un consumo de memoria significativamente reducido respecto a los 360 GB del modelo original en BF16. Está diseñado para servir con SGLang, aunque requiere una versión parcheada que soporte el tipo de cuantización `FP8_PB_WO`. Se trata de una versión candidata privada, orientada a desarrolladores que evalúan el despliegue eficiente de modelos multimodales de gran escala en entornos de inferencia de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (GDN + QSA sparse attention, multi-hyperconnection streams, PLE n-gram injection) con MoE multimodal |
| Parametros totales | 111.729.655.699 (~111,7B) en el checkpoint cuantizado; el modelo original declara ~180B (360 GB BF16) según la model card, aunque otras fuentes citan 125B incluyendo tabla n-gram |
| Parametros activos | ~6B por token (dato del modelo base, no disponible para esta versión podada) |
| Longitud de contexto | Hasta 262K tokens |
| Tipos de cuantizacion | NVFP4 (W4A4) para expertos enrutados; FP8 E4M3 2D-blockwise (128×128) weight-only para proyecciones de atención |
| Idiomas soportados | No especificado |
| Licencia | other (consultar licencia del modelo base Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo multimodal de arquitectura híbrida que combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. El modelo tiene 48 capas decoder, cada una con 512 expertos enrutados (top-10 routing) más un experto compartido, y una capa MTP (Multi-Token Prediction) para decodificación especulativa. Incluye además una tabla de embeddings n-gram (PLE) que añade 51B parámetros adicionales.

La versión aquí descrita ha sido podada con el método AIMER (Absolute mean over root mean square IMportance for Expert Ranking), que elimina los 64 expertos de menor importancia por capa según la métrica `mean|W| / RMS(W)`, sin necesidad de datos de calibración ni activaciones. Los expertos restantes se re-indexan contiguamente y las filas del router se mantienen alineadas. La capa MTP también se poda a 448 expertos, preservando la compatibilidad con el algoritmo especulativo NEXTN. La cuantización se realizó con NVIDIA Model Optimizer (snapshot `87c9f8cf`) usando el recipe NVFP4 W4A4 para los expertos enrutados y FP8 E4M3 2D-blockwise para las proyecciones de atención, marcadas como `FP8_PB_WO` en el mapa `quantized_layers` del `config.json`. La calibración se hizo con 128 artículos de cnn_dailymail truncados a 512 tokens, capturando activaciones de prefill desde SGLang en vivo (62.139 filas por capa).

## Capacidades

- Generación de texto multimodal: acepta entradas de texto, imagen y vídeo, y produce texto como salida.
- Razonamiento y resolución de problemas complejos: el modelo base está diseñado para tareas de razonamiento multi-step y agénticas.
- Generación de código y asistencia en programación: soportado por el modelo base, con integración en flujos de desarrollo.
- Tool calling / function calling: el comando de despliegue incluye `--tool-call-parser auto`, lo que indica soporte para invocación de herramientas.
- Decodificación especulativa: la capa MTP podada a 448 expertos permite usar el algoritmo NEXTN con 3 pasos especulativos y 4 tokens de borrador.
- Multimodalidad: comprensión de imágenes y vídeo junto con texto, adecuada para tareas de visión-lenguaje.
- Contexto largo: ventana de hasta 262K tokens, útil para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Despliegue de un asistente multimodal en estaciones de trabajo con GPUs Blackwell: el modelo cabe en 2x RTX Pro 6000 (192 GB VRAM) gracias a la cuantización NVFP4/FP8, permitiendo ejecutar un modelo de la clase Qwen3.8-Flash-Next en local sin depender de la nube.
- Evaluación de rendimiento de MoE podados en producción: los desarrolladores pueden comparar la calidad de salida y la latencia frente al modelo sin podar, usando el checkpoint como referencia para decidir si la poda AIMER es aceptable en su caso de uso.
- Sistemas agénticos con tool calling: el soporte de `--tool-call-parser auto` permite construir agentes que invocan funciones externas, por ejemplo para automatizar tareas de análisis de documentos o gestión de APIs.
- Análisis de vídeo e imágenes con contexto largo: gracias a la ventana de 262K tokens y la entrada multimodal, puede procesar vídeos largos o secuencias de imágenes junto con instrucciones detalladas en un solo paso.
- Asistente de programación con decodificación especulativa: la capa MTP podada permite acelerar la generación de código mediante NEXTN, reduciendo la latencia en entornos de desarrollo integrado.
- Investigación sobre eficiencia de cuantización mixta: el checkpoint sirve como caso de estudio para medir el impacto de combinar NVFP4 y FP8 en arquitecturas híbridas, con datos de calibración y configuración documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, ni comparaciones con el modelo base o alternativas. Tampoco se proporcionan datos de throughput o latencia medidos.

## Requisitos de hardware

- El checkpoint cuantizado ocupa 123,4 GB en disco, pero los pesos en memoria durante la inferencia son menores debido a la cuantización NVFP4 (4 bits) y FP8 (8 bits). Una estimación razonable sitúa el uso de VRAM entre 60 y 80 GB para los pesos, más el espacio para KV cache y activaciones.
- Validado en NVIDIA Blackwell: GB300 y B300 según la model card. El nombre del repositorio y el artículo de LinkedIn indican que también se ha probado en 2x RTX Pro 6000 (96 GB cada una, 192 GB totales).
- En una sola GPU de 96 GB (como una RTX Pro 6000 individual) es probable que no quepa el modelo completo con la configuración recomendada, dado que el comando Docker usa `--mem-fraction-static 0.94` y `--tensor-parallel-size 1`, lo que sugiere que se necesita prácticamente toda la VRAM de una GPU o se reparte entre varias.
- El despliegue requiere SGLang parcheado (rama `feat/qwen38-flash-next` del repositorio del autor) con soporte para `FP8_PB_WO`. El comando Docker proporcionado incluye la imagen con el parche aplicado.
- Opciones de despliegue: el modelo se sirve exclusivamente con SGLang; no se mencionan alternativas como vLLM, llama.cpp u Ollama.
- Se recomienda usar el comando Docker incluido en la model card, que configura tensor parallel size 1, chunked prefill, KV cache en FP8 y mamba SSM en bfloat16, entre otros parámetros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~180B (o 125B según fuente) | 262K | BF16 (360 GB) | other (Qwen) | Hugging Face |
| Qwen3.8-Flash-Next-NVFP4-FP8-Pruned (este modelo) | 111,7B (checkpoint cuantizado) | 262K | NVFP4 + FP8 mixto | other (remite al base) | Hugging Face (candidato privado) |
| Qwen3.8-Flash | No disponible | 1M (según QwenCloud) | No especificado | other (Qwen) | Hugging Face / API |

La comparativa se limita a las variantes de Qwen3.8, ya que no se dispone de datos de benchmarks para comparar con otros modelos MoE multimodales como DeepSeek-V3 o Llama 4. La principal diferencia de este checkpoint frente al base es la reducción de parámetros (111,7B frente a ~180B) y el uso de cuantización mixta, lo que permite su ejecución en hardware de menor capacidad, a costa de requerir un runtime específico (SGLang parcheado).

## Limitaciones y advertencias

- Requiere un SGLang parcheado: las builds estándar no reconocen el tipo de cuantización `FP8_PB_WO` y cargan los pesos FP8 como BF16, produciendo salida corrupta sin ningún error visible. Es imprescindible verificar en el log que aparece `quant=modelopt_mixed` y que no hay advertencias de claves faltantes para `*.weight_scale_inv`.
- Es una versión candidata privada, no una release oficial de Qwen. El autor advierte que es un checkpoint de evaluación, por lo que puede contener problemas no documentados.
- La poda AIMER elimina 64 expertos por capa, lo que puede degradar la calidad en tareas que dependen de la diversidad de expertos. No se han publicado evaluaciones que cuantifiquen esta pérdida.
- La licencia es "other" y remite al modelo base; es necesario revisar los términos de uso de Qwen/Qwen3.8-Flash-Next antes de cualquier uso comercial.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, esta versión no documenta el alcance.
- El despliegue está limitado a hardware NVIDIA Blackwell (GB300, B300, RTX Pro 6000) y a Linux; no hay soporte para otras arquitecturas o sistemas operativos.
- La ventana de contexto de 262K es amplia, pero el uso de Mamba (GDN) y QSA puede requerir ajustes finos de los parámetros de caché para evitar degradación en secuencias muy largas.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8-Pruned-RTXPRO-6000
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper AIMER: https://arxiv.org/abs/2603.18492
- Repositorio SGLang parcheado (rama `feat/qwen38-flash-next`): https://github.com/lovedheart/sglang/tree/feat/qwen38-flash-next
- Pull request de referencia en SGLang: https://github.com/sgl-project/sglang/pull/36497
- NVIDIA Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Artículo de LinkedIn sobre ejecución en 2x RTX Pro 6000: https://www.linkedin.com/pulse/recipe-running-qwen38-flash-next-nvfp4-2x-rtx-pro-6000-ovidiu-dan-yplbc/
- Receta de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Página de QwenCloud para Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
