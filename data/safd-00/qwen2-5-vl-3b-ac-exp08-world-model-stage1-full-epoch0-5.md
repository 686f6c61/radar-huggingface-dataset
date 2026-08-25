# SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch0.5

## Resumen

El modelo `SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch0.5` es un fine-tuning experimental del modelo vision-language Qwen2.5-VL-3B, desarrollado por el usuario SaFD-00 y publicado en Hugging Face. Su nombre sugiere un entrenamiento en dos fases orientado a la construcción de un "modelo del mundo" (world model), en este caso la primera etapa (stage1) con fine-tuning completo (full) durante 0,5 épocas. El tag `llama-factory` indica que el entrenamiento se realizó con el framework LlamaFactory.

Se trata de un modelo multimodal que acepta entradas de imagen y texto (pipeline `image-text-to-text`) y está pensado para tareas de razonamiento visual y comprensión de escenas. Con 3.754.622.976 parámetros (aproximadamente 3,75 mil millones), se posiciona en la gama media-baja de la familia Qwen2.5-VL, lo que lo hace potencialmente viable para inferencia en GPUs de consumo. Sin embargo, la ausencia de documentación técnica, benchmarks y datos de entrenamiento publicados limita cualquier evaluación objetiva de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2_5_vl (vision-language transformer) |
| Parametros totales | 3.754.622.976 (3,75 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-VL-3B soporta 32 768 tokens, no confirmado para este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen2.5-VL-3B, un modelo de lenguaje multimodal que combina un codificador visual (ViT) con un decoder transformer denso. El tag `qwen2_5_vl` confirma que se mantiene la arquitectura original del modelo base, y el pipeline `image-text-to-text` indica que acepta tanto imágenes como texto como entrada y genera texto como salida.

El entrenamiento de este fine-tune se realizó con el framework LlamaFactory, como indica el tag correspondiente. El nombre del modelo revela que es un experimento (`exp08`) orientado a la creación de un "modelo del mundo" (`world-model`), con un entrenamiento en fase 1 (`stage1`) y una duración de 0,5 épocas. El sufijo `full` indica que se utilizó fine-tuning completo (actualización de todos los parámetros), no LoRA. No se dispone de información sobre el conjunto de datos, el método de alineación (RLHF, DPO, etc.), ni sobre el objetivo específico de este "modelo del mundo".

## Capacidades

- Generación de texto y razonamiento visual: al estar basado en Qwen2.5-VL-3B, el modelo hereda capacidades de comprensión de imágenes, reconocimiento de objetos, OCR y razonamiento sobre escenas visuales.
- Comprensión multimodal: procesa entradas compuestas de imagen y texto, útil para tareas como respuesta a preguntas sobre imágenes o descripción de escenas.
- Tool calling y function calling: no confirmado. El modelo base Qwen2.5-VL soporta llamada a herramientas, pero no se ha verificado en este fine-tune.
- Capacidades multilingües: no disponibles. El modelo base Qwen2.5-VL es multilingüe, pero no se ha documentado qué idiomas se mantienen tras el fine-tune.
- Capacidades de agente: no confirmado. El nombre del experimento (`ac` podría sugerir "action" o "agentic"), pero no hay documentación al respecto.

## Casos de uso

- Investigación en modelos del mundo: el modelo es un candidato para experimentos académicos sobre cómo los modelos de visión-lenguaje pueden internalizar la física y la dinámica de escenas visuales, ya que su entrenamiento se orienta explícitamente a un "world model".
- Prototipos de asistentes visuales: puede servir como base para un asistente que analice imágenes y responda preguntas sobre el contenido, aunque su tamaño limitado lo hace adecuado para entornos con recursos moderados.
- Educación y demostraciones: para evaluar la capacidad de un modelo de 3B en tareas de razonamiento visual en tiempo real, en entornos de investigación o docencia.
- Análisis de documentos con imágenes: el modelo puede extraer información de capturas, diagramas o formularios, si se le pide en el formato adecuado.
- Evaluación de técnicas de fine-tuning: al ser un experimento con `llama-factory`, puede usarse como punto de referencia para comparar estrategias de entrenamiento (full vs LoRA) en modelos de visión-lenguaje.
- Desarrollo de agentes de navegación visual: si el experimento busca "modelos del mundo", podría utilizarse como base para agentes que razonen sobre la posición y los movimientos en un entorno visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ningún dato sobre el rendimiento del modelo en MMLU, HumanEval, GSM8K, ni en tareas específicas de visión-lenguaje como VQA, DocVQA o TextVQA.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,75 B parámetros, en FP16 se necesitan aproximadamente 7,5 GB de VRAM. Con cuantización INT8 (no disponible oficialmente), se reduciría a ~4 GB, pero no hay confirmación de que el modelo soporte estas cuantizaciones.
- GPU recomendadas: una RTX 3090, RTX 4090 o A10 con 16-24 GB de VRAM sería suficiente para inferencia en FP16. En cuantización de 4 bits (si se genera con herramientas como llama.cpp), podría caber en una RTX 3060 de 12 GB.
- En GPU de consumo: es viable en GPUs de gama media-alta (RTX 3090/4090) y probablemente en la mayoría de GPUs con 8 GB o más si se cuantiza.
- Opciones de despliegue: el tag `text-generation-inference` sugiere compatibilidad con TGI. También puede desplegarse con vLLM, Ollama o llama.cpp, aunque no hay documentación específica para este modelo.
- Latencia y throughput: no disponible. Depende de la GPU y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia |
|---|---|---|---|---|
| SaFD-00/qwen2.5-vl-3b-ac-exp08 | 3,75 B | No disponible | Vision-lenguaje (fine-tune) | No disponible |
| Qwen2.5-VL-3B (base) | 3,75 B | 32 768 tokens | Vision-lenguaje | Apache 2.0 |
| LLaVA-3B (ejemplo) | 3 B | 4096 tokens | Vision-lenguaje | Apache 2.0 |
| MiniCPM-V 4B (ejemplo) | 4 B | 8192 tokens | Vision-lenguaje | Apache 2.0 |

Los datos de Qwen2.5-VL-3B base se derivan de la documentación pública del modelo. No se han encontrado modelos comparables con el mismo propósito de "world model" en la información disponible.

## Limitaciones y advertencias

- La model card es una plantilla genérica sin información específica; no se puede verificar el propósito real, los datos de entrenamiento ni la metodología.
- No hay datos de sesgos ni de evaluación de seguridad. Se desconoce si el modelo presenta sesgos de género, raza o cultura, o si tiene riesgo de alucinación.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- El modelo es un experimento (`exp08`) con 0 descargas y 0 likes; no hay evidencia de que haya sido validado externamente.
- No se confirma la longitud de contexto del fine-tune; puede verse reducida respecto al modelo base.
- El nombre del modelo indica `stage1`, lo que sugiere que es un paso intermedio de un entrenamiento más amplio, y no un modelo final.

## Enlaces

- Hugging Face: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch0.5
- Paper de Qwen2.5-VL (arXiv): https://arxiv.org/pdf/2502.13923v1
- Colección Qwen2.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen25
- Guía de Qwen 2.5 (VRAM, tamaños): https://canitrun.net/blog/qwen-2.5-complete-model-guide
