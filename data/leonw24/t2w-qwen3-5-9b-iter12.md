# LEONW24/T2W-Qwen3.5-9B-iter12

## Resumen

T2W-Qwen3.5-9B-iter12 es un checkpoint de entrenamiento intermedio (iteración 12) de un modelo de agente web basado en Qwen/Qwen3.5-9B, publicado por LEONW24 (Zezhou Wang). El modelo está diseñado para tareas de visión-lenguaje aplicadas a navegación web autónoma, entrenado mediante refuerzo (reinforcement learning) sobre el modelo base multimodal de 9.000 millones de parámetros de Alibaba Cloud.

El checkpoint se distribuye como exportación completa (full-rank) en formato Hugging Face transformers, con pesos en safetensors y licencia Apache-2.0. Es relevante porque representa un caso práctico de fine-tuning con RL para agentes web sobre un modelo multimodal de última generación, aunque el autor advierte explícitamente de que no se reportan métricas de evaluación completas en la model card y que las comparaciones entre checkpoints solo son válidas bajo el mismo manifiesto de tareas y configuración de muestreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention (patrón 8×(3×DeltaNet→FFN→1×Attention→FFN)) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors full-rank) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks y Gated Attention en un patrón recurrente 8×(3×DeltaNet→FFN→1×Attention→FFN). Esta combinación busca equilibrar eficiencia computacional con capacidad de atención a largo plazo, una característica relevante para tareas de agente web donde el contexto de navegación puede ser extenso.

El checkpoint T2W-Qwen3.5-9B-iter12 es el resultado de la iteración 12 de un proceso de reinforcement learning orientado a entrenar un agente web (web-agent). El autor no detalla el dataset de entrenamiento, el número de tokens procesados ni el algoritmo de RL concreto (PPO, GRPO, etc.). La exportación es full-rank, lo que implica que no se aplicó LoRA ni otras técnicas de compresión de pesos, y el repositorio incluye el fichero de licencia Apache-2.0 del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal: al estar basado en Qwen3.5-9B, hereda capacidades de comprensión de imágenes y texto.
- Navegación web autónoma: el entrenamiento con RL está orientado a tareas de agente web, lo que sugiere capacidad para interpretar páginas, extraer información y tomar decisiones secuenciales.
- Conversación multimodal: soporta entradas de imagen y texto (pipeline image-text-to-text).
- Fine-tuning específico para tareas de agente: el checkpoint está optimizado para entornos donde se requiere interacción multi-paso con interfaces web.
- Compatibilidad con transformers: integrable en pipelines estándar de Hugging Face.

## Casos de uso

- Automatización de tareas web: el modelo puede navegar formularios, extraer datos de páginas y completar flujos de trabajo en entornos controlados, aprovechando su entrenamiento con RL para decidir qué acción tomar en cada paso.
- Asistentes de compra online: dado su enfoque en agente web, podría emplearse para comparar precios, localizar productos y gestionar carritos de compra en sitios de comercio electrónico.
- Extracción estructurada de información: combinando visión y lenguaje, puede procesar capturas de pantalla o documentos web y extraer campos concretos (precios, fechas, nombres) para alimentar bases de datos.
- Testing automatizado de interfaces: el modelo puede ejecutar recorridos de usuario sobre aplicaciones web y detectar errores o cambios de comportamiento, actuando como agente de QA.
- Relleno de formularios administrativos: en entornos con estructura conocida, puede completar formularios web multi-paso a partir de instrucciones en lenguaje natural.
- Investigación reproducible en RL para agentes: el checkpoint sirve como punto de referencia intermedio para estudiar la evolución del entrenamiento con refuerzo en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta ninguna evaluación completa del portafolio de tareas y que las métricas son específicas de cada checkpoint, sin constituir afirmaciones sobre el entrenamiento. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: con 9.653 millones de parámetros en precisión fp32, el modelo requiere aproximadamente 38,6 GB de memoria solo para los pesos. En fp16 o bf16, unos 19,3 GB, lo que coincide con el tamaño del repositorio.
- GPU recomendadas: para inferencia en fp16 se necesita una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4). Para entrenamiento o fine-tuning adicional, se recomienda A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en fp16 con margen limitado para activaciones. Con cuantización a 8 bits o 4 bits (no incluida en el repo), cabría en GPUs de 12-16 GB.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se incluyen pesos cuantizados en el repositorio.
- Latencia y throughput: no disponible. Dependerá del hardware, la longitud de contexto y la implementación de serving utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| T2W-Qwen3.5-9B-iter12 | 9,65B | no disponible | Agente web multimodal (RL) | Apache-2.0 |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Multimodal general | Apache-2.0 |
| Llama 3.1 8B Instruct | 8B | 128K | Texto, chat, tool calling | Llama 3.1 |
| Gemma 2 9B | 9B | 8K | Texto, chat | Gemma |

La comparativa se basa en el modelo base Qwen3.5-9B, ya que el checkpoint T2W es un fine-tuning específico sin benchmarks publicados. Frente a alternativas generalistas como Llama 3.1 8B o Gemma 2 9B, la ventaja de este modelo reside en su entrenamiento especializado para tareas de agente web y su naturaleza multimodal, aunque carece de métricas que permitan cuantificar esa ventaja.

## Limitaciones y advertencias

- Sin evaluación publicada: la model card no reporta resultados de benchmarks, por lo que no es posible verificar el rendimiento real del modelo en tareas de agente web ni compararlo objetivamente con alternativas.
- Checkpoint intermedio: es la iteración 12 de un proceso de entrenamiento, no necesariamente el checkpoint final optimizado. El rendimiento puede ser inferior al de iteraciones posteriores.
- Sesgos y alucinaciones: al derivar de Qwen3.5-9B, puede heredar sesgos del modelo base y presentar alucinaciones, especialmente en tareas de extracción de información donde se le pide completar datos ausentes.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en tareas con documentos largos o historiales de navegación extensos.
- Riesgo en producción: sin cuantizaciones incluidas y sin benchmarks, su uso en entornos productivos requiere una evaluación previa exhaustiva por parte del equipo que lo despliegue.
- Soporte limitado: el autor no proporciona documentación adicional, demos ni ejemplos de uso más allá de la model card mínima.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LEONW24/T2W-Qwen3.5-9B-iter12
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor LEONW24: https://huggingface.co/LEONW24/
- Especificaciones de Qwen3.5-9B (VRAM y arquitectura): https://apxml.com/models/qwen35-9b
- Modelo relacionado del autor (Qwen3.5-9B-Uncensored): https://huggingface.co/LEONW24/Qwen3.5-9B-Uncensored
