# nvidia/Qwen3.8-Flash-Next-FP4-Local

## Resumen

NVIDIA Qwen3.8-Flash-Next-FP4-Local es un checkpoint cuantizado en NVFP4 del modelo multimodal Qwen3.8-Flash-Next de Alibaba, publicado por NVIDIA a través de su herramienta Model Optimizer. Se trata de un modelo autoregresivo de tipo transformer con arquitectura híbrida de atención (Gated DeltaNet combinada con Qwen Sparse Attention), mezcla de expertos (MoE), flujos residuales con puerta (gated residual streams), embeddings de n-gramas y un codificador de visión, por lo que acepta entradas de texto, imagen y vídeo y produce salidas de texto.

La cuantización se ha realizado con destilación consciente de cuantización (QAD, quantization-aware distillation) usando nvidia-modelopt v0.47.0, con el objetivo de recuperar la precisión del modelo original en precisión reducida. El checkpoint ocupa aproximadamente 96 GiB en disco y está pensado para ejecución local en hardware Blackwell: NVIDIA lo ha validado en una RTX PRO 6000 Blackwell (una sola GPU, con offload de la tabla de embeddings de n-gramas) y en un DGX Spark, con cachés KV en FP8 de 850K y 1M de tokens respectivamente.

Su relevancia actual radica en dos factores: por un lado, ofrece contexto nativo de 262.144 tokens extensible hasta 1.000.000, lo que lo sitúa en la gama de modelos de contexto largo con capacidades multimodales; por otro, es una de las primeras distribuciones NVFP4 de gran tamano orientadas a hardware de estación de trabajo local, con 6.000 millones de parámetros activos sobre un total declarado de 125.000 millones, lo que reduce el coste por token frente a un modelo denso equivalente. La contrapartida es que el formato de factores de escala NVFP4 empleado todavía no está soportado por vLLM upstream, por lo que NVIDIA exige usar sus propios contenedores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (Gated DeltaNet y Qwen Sparse Attention), mezcla de expertos (MoE), flujos residuales con puerta, embeddings de n-gramas y codificador de visión; clase `Qwen4ExpForConditionalGeneration` |
| Parametros totales | 125.000 millones en total, más 51.000 millones de embeddings de n-gramas y 4.000 millones de MTP, según la model card. El recuento real de safetensors del repositorio es de 96.486.615.005 parámetros |
| Parametros activos | 6.000 millones (MoE) |
| Longitud de contexto | 262.144 tokens de forma nativa, extensible hasta 1.000.000 |
| Tipos de cuantizacion | NVFP4 (FP4 QAD 1.0) con nvidia-modelopt v0.47.0; factores de escala NVFP4 en un formato de compresión sin pérdida nuevo |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (`license: other`); el modelo base se rige además por Qwen Community License 1.0 |
| Formato de pesos | safetensors (cuantizados con ModelOpt; `library_name: Model Optimizer`) |

Otros datos del repositorio: pipeline `image-text-to-text`, 438 descargas, 27 likes, tamano del repositorio 102,3 GB, creado el 8 de octubre de 2026 y actualizado el 15 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura parte del modelo Qwen3.8-Flash-Next de Alibaba, un transformer causal con codificador de visión y un esquema de atención híbrido que combina Gated DeltaNet (atención de estado recurrente con puertas) y Qwen Sparse Attention. Sobre esa base se anaden dos mecanismos poco habituales: flujos residuales con puerta y una tabla de embeddings de n-gramas de 51.000 millones de parámetros, además de un módulo MTP (multi-token prediction) de 4.000 millones. El conjunto de expertos se activa de forma dispersa, con 6.000 millones de parámetros activos por token.

NVIDIA ha aplicado cuantización a 4 bits en formato NVFP4 mediante destilación consciente de cuantización (QAD), un procedimiento que entrena al modelo cuantizado para reproducir el comportamiento del modelo original en lugar de limitarse a una calibración post-entrenamiento. El conjunto de calibración empleado procede de subconjuntos de Nemotron-Post-Training-Dataset-v3, Nemotron-Post-Training-Dataset-v2 y Nemotron-Pretraining-Dataset. La model card no especifica el numero total de tokens de entrenamiento del modelo base, la composición detallada de su dataset ni si se aplicaron fases de RLHF o DPO; solo se documenta el material de calibración de la cuantización.

## Capacidades

- Generación de texto autoregresiva con entrada multimodal: acepta cadenas de texto, imágenes en RGB y vídeo en MP4/WebM, y devuelve únicamente texto.
- Comprensión de imágenes y vídeo: al estar etiquetado como `image-text-to-text` y declarar entradas 2D y 3D, puede describir, resumir y responder preguntas sobre contenido visual.
- Contexto largo: ventana nativa de 262.144 tokens, extensible hasta 1.000.000, adecuada para documentos extensos, conversaciones largas o transcripciones completas.
- Eficiencia de inferencia por arquitectura MoE: 6.000 millones de parámetros activos sobre 125.000 millones totales.
- Decodificación con módulo MTP: la model card declara un módulo de predicción multi-token de 4.000 millones de parámetros, aunque no detalla su uso concreto en inferencia.
- Caché KV en FP8 con capacidades de 850K tokens (RTX PRO 6000 Blackwell) y 1M tokens (DGX Spark con offload de PLE).
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: la model card menciona los sistemas de agentes de IA como caso de uso previsto, pero no detalla soporte nativo de razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Agentes de IA en producción: el modelo está declarado explícitamente para su uso en sistemas de agentes. Con 6.000 millones de parámetros activos por token y contexto de 262K, se puede mantener el historial completo de una sesión de agente sin truncar, aunque la orquestación de herramientas dependerá del framework externo, ya que no se documenta soporte de function calling.
- Sistemas RAG sobre corpus extensos: la ventana de 262.144 tokens permite insertar decenas de documentos completos en lugar de fragmentos, lo que reduce la perdida de contexto entre trozos y simplifica la fase de recuperación.
- Análisis y resumen de vídeo: al aceptar vídeo en MP4/WebM, resulta adecuado para generar resúmenes de reuniones grabadas, transcripciones anotadas o descripciones automáticas de material audiovisual.
- Procesamiento de documentos escaneados: combinando entrada de imagen y texto, puede extraer y estructurar información de facturas, formularios o informes en PDF convertidos a imagen, devolviendo texto plano o JSON generado por el propio modelo.
- Despliegue local con requisitos de confidencialidad: al ejecutarse en una sola RTX PRO 6000 Blackwell o en un DGX Spark, permite procesar datos sensibles (sanitarios, legales, financieros) sin enviarlos a APIs externas.
- Chatbots conversacionales de largo recorrido: con 850K a 1M de tokens de caché KV en FP8, se pueden mantener sesiones muy extensas con historial completo, útil en atención al cliente o asistentes de soporte técnico.
- Etiquetado y anotación semiautomática de datasets: la combinación de visión y contexto largo permite generar descripciones, preguntas y respuestas o clasificaciones sobre lotes de imágenes y vídeos de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de NVIDIA no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación comparativa, ni cifras de latencia o throughput medidas.

## Requisitos de hardware

- Espacio en disco: aproximadamente 96 GiB para el checkpoint; el repositorio completo ocupa 102,3 GB.
- VRAM estimada: no disponible de forma explícita; el checkpoint completo exige un dispositivo con al menos 96 GiB de memoria utilizable, salvo que se apliquen técnicas de offload adicionales no documentadas.
- Hardware validado por NVIDIA: una única NVIDIA RTX PRO 6000 Blackwell con offload de la tabla de embeddings de n-gramas (PLE) y 850K tokens de caché KV en FP8; y NVIDIA DGX Spark, con o sin offload de PLE, con 1M tokens de caché KV en FP8 cuando se aplica el offload.
- GPU compatibles: microarquitectura NVIDIA Blackwell. No se declara compatibilidad con generaciones anteriores (Ampere, Hopper) ni con hardware no NVIDIA.
- GPU de consumo: el tamano del checkpoint (unos 96 GiB) impide su ejecución en tarjetas de consumo tipo RTX 4090 o RTX 5090 (24-32 GB). No se ha publicado ninguna configuración validada para ese escenario.
- Opciones de despliegue: vLLM es el único motor declarado como soportado, y NVIDIA indica que es obligatorio usar uno de los contenedores que proporciona, porque el formato de compresión sin pérdida de los factores de escala NVFP4 todavía no está soportado en vLLM upstream. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación se limita al modelo base y a los datos estructurales conocidos.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/Qwen3.8-Flash-Next-FP4-Local | 125B totales, 6B activos (+51B PLE, +4B MTP); 96.486.615.005 según safetensors | 262K nativos, hasta 1M | NVFP4 (FP4 QAD 1.0) | NVIDIA Open Model Agreement | HuggingFace, requiere contenedores NVIDIA y hardware Blackwell |
| Qwen/Qwen3.8-Flash-Next (modelo base) | mismos parametros declarados | 262K nativos, hasta 1M | no disponible (precisión original) | Qwen Community License 1.0 | HuggingFace |
| Otras alternativas de gama similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Restricción de despliegue critica: los factores de escala NVFP4 del checkpoint usan un formato de compresión sin pérdida que vLLM upstream todavía no soporta. Es obligatorio emplear los contenedores proporcionados por NVIDIA; intentar cargar el modelo con una versión estándar de vLLM fallará o producirá resultados incorrectos.
- Dependencia de hardware: solo se ha validado en NVIDIA Blackwell y en Linux. No hay soporte ni validación para AMD, Intel, Apple Silicon ni para GPUs NVIDIA de generaciones anteriores.
- Licencia dual: el uso se rige por el NVIDIA Open Model Agreement, y el modelo base añade la Qwen Community License 1.0. Es necesario revisar ambas antes de un despliegue comercial, ya que pueden imponer obligaciones de atribución o restricciones adicionales no resumidas en esta ficha.
- Huella de almacenamiento: cerca de 96 GiB en disco, lo que complica el versionado, la distribución y el despliegue en entornos con almacenamiento limitado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación para este checkpoint cuantizado, por lo que el impacto de la cuantización a 4 bits sobre la fidelidad factual no está cuantificado.
- Idiomas soportados: no disponible. No se puede garantizar un rendimiento homogéneo fuera de los idiomas con los que se entrenó el modelo base.
- Sesgos: no disponible. La model card no incluye sección de sesgos, evaluación de toxicidad ni consideraciones éticas específicas.
- Ausencia de cifras de rendimiento: no hay benchmarks publicados que permitan verificar la recuperación de precisión prometida por el procedimiento de destilación consciente de cuantización.
- Complejidad arquitectónica: la combinación de atención híbrida, MoE, embeddings de n-gramas y MTP hace que el modelo dependa de implementaciones muy específicas; cualquier modificación del stack de inferencia requiere validación adicional.
- Recomendación del propio fabricante: NVIDIA indica que la integración de modelos en sistemas de IA exige pruebas adicionales con datos específicos del caso de uso, siguiendo una metodología en V, antes de ponerlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base (Qwen Community License 1.0): https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- NVIDIA Model Optimizer (GitHub): https://github.com/NVIDIA/Model-Optimizer
- Artículo de NVIDIA sobre quantization-aware training: https://developer.nvidia.com/blog/how-quantization-aware-training-enables-low-precision-accuracy-recovery/
- Colección Nemotron-Post-Training-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Colección Nemotron-Pre-Training-Datasets: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
