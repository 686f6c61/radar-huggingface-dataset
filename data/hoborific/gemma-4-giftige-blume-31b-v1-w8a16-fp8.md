# hoborific/Gemma-4-Giftige-Blume-31B-v1-W8A16-FP8

## Resumen

Gemma-4-Giftige-Blume-31B-v1-W8A16-FP8 es una versión cuantizada del modelo Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1, un fine-tune de Gemma-4-31B-it orientado al roleplay y a la representación fiel de personajes. El autor de esta cuantización, hoborific, aplica un esquema W8A16 FP8 mediante la librería compressed-tensors, con el objetivo de reducir el consumo de memoria y acelerar la inferencia en entornos compatibles con vLLM, especialmente en hardware Intel XPU y NVIDIA CUDA.

El modelo base, desarrollado por Blazed-Forge, busca alejarse de la excesiva adherencia al usuario típica de los asistentes, priorizando que los personajes actúen de forma coherente con su personalidad, incluso negándose a seguir instrucciones si el rol no lo permite. La versión v1 mezcla múltiples modelos centrados en roleplay como núcleo de conocimiento, ofreciendo escenarios ricos y estilos de escritura variados. Al ser un modelo multimodal (image-text-to-text), también puede procesar imágenes junto con texto.

Esta cuantización es relevante porque permite desplegar un modelo de 31 mil millones de parámetros con capacidades multimodales en GPUs con memoria limitada, manteniendo la calidad del modelo original gracias a un esquema de cuantización por canal con búsqueda de clip optimizada. El repositorio incluye los pesos en formato safetensors y está diseñado para ser compatible con los kernels W8A16-FP8 de vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Gemma-4-31B-it |
| Parametros totales | 31.266.895.724 (~31,3 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors, formato float-quantized) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma-4-31B-it, la variante de 31 mil millones de parámetros de la familia Gemma 4 de Google DeepMind, que incorpora capacidades multimodales (visión y texto). El fine-tune, realizado por Blazed-Forge, mezcla varios modelos especializados en roleplay como núcleo de conocimiento, con el objetivo de mejorar la representación de personajes y la diversidad narrativa. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

La cuantización aplicada por hoborific es offline, en formato W8A16 FP8. Cada capa lineal (attention q/k/v/o y MLP gate/up/down) se cuantiza con escalas simétricas por canal de salida, calculadas inicialmente como `amax / 448` y refinadas mediante una búsqueda de clip por error cuadrático medio (MSE) sobre aproximadamente nueve fracciones de clip (0,8 a 1,0 veces amax), seleccionando la escala con menor error por fila. Los pesos se cuantizan con `q = e4m3(w / scale)` usando redondeo al más cercano y saturación. Las capas de embedding, normas, lm_head, routers/experts y la torre de visión permanecen en bf16, y se listan en la lista `ignore` del checkpoint para que vLLM no las modifique.

## Capacidades

- Generación de texto conversacional y narrativo, con énfasis en roleplay y representación de personajes con personalidad definida.
- Procesamiento multimodal de imágenes y texto (pipeline image-text-to-text), heredado del modelo base Gemma-4-31B-it.
- Soporte para inferencia cuantizada W8A16 FP8 en vLLM, con kernels específicos para Intel XPU y NVIDIA CUDA (SM75+).
- Capacidad de mantener coherencia de personaje a lo largo de conversaciones multi-turno, gracias al fine-tune orientado a roleplay.
- Compatible con la librería transformers para carga y uso estándar.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.

## Casos de uso

- Roleplay conversacional con personajes: el modelo puede mantener una personalidad consistente y actuar de forma acorde al rol, ideal para juegos de texto, chatbots de ficción o experiencias narrativas interactivas.
- Creación de narrativa interactiva: escritores y estudios de juegos pueden usarlo para generar diálogos y escenas donde los personajes reaccionan de forma creíble a las acciones del usuario.
- Asistentes virtuales con personalidad: empresas pueden desplegar asistentes que no se limiten a respuestas genéricas, sino que adopten un tono y carácter específicos, mejorando la experiencia de marca.
- Despliegue en hardware con VRAM limitada: gracias a la cuantización FP8, el modelo ocupa aproximadamente 33 GB en disco y puede ejecutarse en GPUs con 40 GB o más, como A100 o A6000, sin necesidad de nodos múltiples.
- Integración en pipelines de vLLM sobre Intel XPU: el kernel XPUW8A16FP8LinearKernel está diseñado específicamente para aceleradores Intel, permitiendo inferencia eficiente en entornos con esta plataforma.
- Aplicaciones multimodales con imágenes: al conservar la torre de visión en bf16, el modelo puede procesar capturas de pantalla, documentos o diagramas junto con texto, útil para asistentes visuales o análisis de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado. Tampoco se dispone de comparativas de rendimiento con el modelo base sin cuantizar o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP8 (1 byte por parámetro), el modelo requiere aproximadamente 31,3 GB solo para los pesos, más overhead de activaciones y memoria intermedia. Se recomienda al menos 40 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), A6000 (48 GB), H100 (80 GB) o similares. En el lado Intel, se requiere una GPU o acelerador XPU compatible con vLLM.
- Consumer GPU: una RTX 4090 (24 GB) no tiene VRAM suficiente para alojar el modelo completo en FP8 sin offloading a CPU, lo que degradaría el rendimiento. No se recomienda para este modelo.
- Opciones de despliegue: vLLM es la plataforma principal, con soporte para Intel XPU (kernel XPUW8A16FP8LinearKernel) y NVIDIA CUDA (SM75+ con HummingFP8ScaledMMLinearKernel o MarlinFP8ScaledMMLinearKernel). También puede cargarse con transformers estándar.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de canales de atención y de la implementación del kernel.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-Giftige-Blume-31B-v1-W8A16-FP8 (este) | 31,3 B | W8A16 FP8 | no disponible | no disponible | Hugging Face |
| Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1 (base) | 31,3 B | bf16 (original) | no disponible | no disponible | Hugging Face |
| Gemma-4-31B-it (original) | 31,3 B | bf16 | no disponible | Gemma Terms of Use | Google DeepMind |

La comparativa se limita a las características estructurales, ya que no hay datos de rendimiento publicados. La versión cuantizada ofrece la ventaja de un menor uso de memoria a costa de una posible pérdida mínima de precisión, mientras que el modelo base sin cuantizar requiere más VRAM pero conserva la fidelidad original. Gemma-4-31B-it es el modelo original de Google, con licencia propia y sin el fine-tune de roleplay.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo cuantizado ni del modelo base, lo que supone un riesgo legal para uso comercial. Se recomienda contactar con los autores antes de desplegarlo en producción.
- Sin soporte para ROCm, CPU o TPU en vLLM: la carga fallará con un error de "no kernel" en estas plataformas. Solo funciona en Intel XPU y NVIDIA CUDA (SM75+).
- Sin datos de benchmarks: no hay métricas objetivas que permitan evaluar la calidad del modelo cuantizado frente al original o a otras alternativas.
- Sesgos y alucinaciones: al ser un modelo de roleplay, puede generar contenido inapropiado o inventar información si se usa fuera de su dominio. No se ha evaluado su robustez frente a prompts malintencionados.
- Contexto limitado: no se especifica la longitud de contexto soportada, lo que dificulta planificar aplicaciones con conversaciones largas o documentos extensos.
- Dependencia de kernels específicos: el rendimiento depende de la disponibilidad de los kernels W8A16-FP8 en la versión de vLLM utilizada. Si no se instala el paquete `humming`, se usará el kernel Marlin, que puede tener menor eficiencia.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoborific/Gemma-4-Giftige-Blume-31B-v1-W8A16-FP8
- Modelo base: https://huggingface.co/Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 31B en Cerebras Inference: https://inference-docs.cerebras.ai/models/gemma-4-31b
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
