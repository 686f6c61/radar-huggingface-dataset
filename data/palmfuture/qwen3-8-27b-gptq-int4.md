# palmfuture/Qwen3.8-27B-GPTQ-Int4

## Resumen

Qwen3.8-27B-GPTQ-Int4 es una cuantización de 4 bits (GPTQ) del modelo Qwen3.8-27B, desarrollada por palmfuture sobre hardware de consumo (4× RTX 3060 12GB). El modelo base, creado por Alibaba Qwen, es un modelo de lenguaje y visión de 27.800 millones de parámetros con arquitectura híbrida que combina self-attention, linear-attention (tipo Mamba) y un codificador visual ViT. Está diseñado para tareas de razonamiento complejo, codificación, trabajo profesional y ejecución de agentes de larga duración, con soporte nativo de imágenes y vídeo.

Esta versión cuantizada mantiene la calidad del modelo original con una pérdida media de 1,59e-04 durante el proceso de cuantización, y añade pesos MTP (Multi-Token Prediction) para decodificación especulativa, verificados en vLLM 0.25.1 con una tasa de aceptación del 69–87%. El resultado es un modelo desplegable en GPUs de consumo con una huella de memoria reducida, manteniendo compatibilidad con vLLM, SGLang y Transformers.

La relevancia de esta ficha radica en que ofrece una alternativa accesible para desarrolladores que necesitan ejecutar un modelo de 27B con capacidades multimodales en entornos con recursos limitados, sin renunciar a características avanzadas como el modo de pensamiento controlable o la decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con self-attention, linear-attention (GDN/Mamba) y MLP; vision encoder ViT |
| Parámetros totales | 27.781.427.952 (27,8B) |
| Parámetros activos | Todos (no es MoE) |
| Longitud de contexto | No especificada (en la cuantización se recomienda 8192) |
| Tipos de cuantización | GPTQ Int4 (group_size=32), con capas en bf16 |
| Idiomas soportados | Inglés, chino, tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (GPTQ quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina mecanismos de atención clásicos (self-attention con `q_proj`, `k_proj`, `v_proj`, `o_proj`) con capas de atención lineal tipo Mamba (GDN), lo que permite manejar secuencias largas con menor coste computacional. Incluye además un codificador visual ViT para procesamiento de imágenes y vídeo. La cuantización GPTQ Int4 se aplicó de forma uniforme con `group_size=32` sobre las proyecciones de atención, MLP y las capas de atención lineal, mientras que se mantuvieron en bf16 los componentes de dinámica de estado, normas, el cabezal MTP y el codificador visual, siguiendo la receta FP8 del modelo original.

El proceso de cuantización se realizó con un conjunto de calibración mixto de 256 muestras (longitud 1024) procedentes de C4, Tulu-3 SFT, CodeParrot y MATH-500, cubriendo texto general, instrucciones, código y razonamiento matemático. Se utilizó GPTQModel 7.0.0, PyTorch 2.12 y CUDA 13.0, completándose en unos 53 minutos en hardware de consumo. No se dispone de información detallada sobre el pre-entrenamiento del modelo base (número de tokens, dataset, fases de RLHF/DPO), más allá de que pasó por etapas de pre-training y post-training.

## Capacidades

- Comprensión multimodal: procesa imágenes y vídeo (hasta escala de horas) además de texto, gracias al codificador visual ViT.
- Razonamiento y resolución de problemas: mejora sustancial en tareas de codificación, trabajo profesional, investigación y razonamiento matemático.
- Ejecución de agentes: planificación autónoma y manejo de feedback del entorno para completar tareas multi-paso de forma fiable.
- Modo de pensamiento flexible: el modo thinking está activado por defecto, puede desactivarse por petición, ajustar la profundidad con `reasoning_effort` y conservar el contexto de razonamiento histórico con `preserve_thinking`.
- Decodificación especulativa MTP: incluye pesos de predicción multi-token que aceleran la inferencia en vLLM con una tasa de aceptación del 69–87%.
- Soporte de herramientas y tool calling: integración con harnesses y herramientas de desarrollo comunes (implícito en el ecosistema Qwen).
- Multilingüismo: soporte para inglés, chino y tailandés.

## Casos de uso

- Asistente de programación en entornos con GPU limitada: gracias a la cuantización Int4, el modelo puede ejecutarse en una RTX 4090 o similar, ofreciendo generación de código, depuración y explicación de fragmentos en tiempo real dentro de IDEs o pipelines de CI/CD.
- Análisis de documentos técnicos con imágenes: el modelo procesa diagramas STEM, capturas de pantalla y documentos escaneados, extrayendo información y respondiendo preguntas sobre su contenido.
- Automatización de atención al cliente multilingüe: con soporte para inglés, chino y tailandés, puede gestionar conversaciones multi-turno con contexto largo, manteniendo el hilo de la interacción y escalando a un humano cuando sea necesario.
- Agente autónomo para tareas de investigación: su capacidad de planificación y manejo de feedback lo hace adecuado para buscar información, resumir artículos y generar informes estructurados de forma autónoma.
- Generación de contenido educativo: puede crear explicaciones, ejercicios y material didáctico en varios idiomas, adaptando el nivel de complejidad según la petición.
- Prototipado rápido de aplicaciones de visión-lenguaje: al ser un modelo multimodal, permite construir demos de clasificación de imágenes, descripción de vídeo o QA visual sin necesidad de modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card de la cuantización solo reporta métricas de calidad del proceso de cuantización:

| Métrica | Valor |
|---|---|
| Tasa de éxito GPTQ | 100% |
| Tasa de fallback RTN | 0% |
| Pérdida media | 1,59e-04 |
| Pérdida máxima | 9,22e-04 |
| Módulos totales | 400 |

Tampoco se proporcionan datos de rendimiento en tareas específicas para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Int4 y 27,8B de parámetros, el modelo ocupa aproximadamente 14–15 GB en memoria (más overhead de activaciones y cache KV). Con contexto de 8192 tokens, se recomienda al menos 20 GB de VRAM.
- GPUs recomendadas: RTX 4090 (24 GB), A10G (24 GB), L4 (24 GB) o GPUs profesionales con 24 GB o más. También puede ejecutarse en configuraciones multi-GPU, por ejemplo 2× RTX 3090 (24 GB cada una) o 4× RTX 3060 12 GB (como se usó para la cuantización).
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 24 GB como RTX 4090, RTX 3090 o A5000. No es viable en GPUs de 12 GB sin tensor parallelism.
- Opciones de despliegue: vLLM (probado con v0.25.1), SGLang, Hugging Face Transformers, y cualquier framework compatible con GPTQ.
- Latencia y throughput: no se han publicado datos concretos. Con decodificación especulativa MTP activada, la tasa de aceptación del draft es del 69–87%, lo que puede acelerar la generación entre 1,5× y 2× en comparación con la decodificación autoregresiva estándar, aunque depende del hardware.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A nivel de características, el modelo base Qwen3.8-27B es una evolución de la serie Qwen3.5 y Qwen3.6, por lo que una comparativa estructural sería:

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Cuantización disponible |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8B | Híbrida (attention + linear attention) + ViT | No especificado | Apache 2.0 | bf16/FP8 |
| Qwen3.8-27B-GPTQ-Int4 | 27,8B | Ídem (cuantizado) | No especificado (8K recomendado) | Apache 2.0 | GPTQ Int4 |
| Qwen3.6-27B-GPTQ-Int4 | ~27B | Híbrida similar | No especificado | Apache 2.0 | GPTQ Int4 |

No se han encontrado modelos comparables de otros fabricantes con la misma combinación de tamaño, arquitectura híbrida y capacidades multimodales en la información disponible.

## Limitaciones y advertencias

- La cuantización Int4 puede introducir una ligera degradación en tareas de precisión numérica o razonamiento complejo, aunque la pérdida reportada es baja (media 1,59e-04).
- El modelo solo soporta tres idiomas (inglés, chino y tailandés); no se garantiza un rendimiento adecuado en otros idiomas, incluido el español.
- No se han publicado resultados de benchmarks del modelo base, por lo que no es posible verificar sus capacidades reales frente a otras alternativas.
- La longitud de contexto no está especificada en la documentación; el valor de 8192 usado en la cuantización es una recomendación práctica, no el máximo del modelo.
- Riesgo de alucinación y sesgos inherentes a los modelos de lenguaje, especialmente en dominios especializados o con datos de entrenamiento limitados.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y la posible inclusión de patentes.
- Para producción, se recomienda validar el comportamiento del modelo con datos propios antes de desplegarlo, dado que la cuantización puede afectar a tareas de agente o tool calling.

## Enlaces

- Modelo cuantizado: [palmfuture/Qwen3.8-27B-GPTQ-Int4](https://huggingface.co/palmfuture/Qwen3.8-27B-GPTQ-Int4)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Versión anterior cuantizada: [palmfuture/Qwen3.6-27B-GPTQ-Int4](https://huggingface.co/palmfuture/Qwen3.6-27B-GPTQ-Int4)
- Qwen Cloud (servicio alojado): [Qwen3.8-27B Overview](https://www.qwencloud.com/models/qwen3.8-27b)
