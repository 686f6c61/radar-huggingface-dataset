# ArchiveStudio/Qwen3.5-0.8B-Base

## Resumen

Qwen3.5-0.8B-Base es el modelo fundacional preentrenado de la familia Qwen3.5, desarrollado por el equipo Qwen (Alibaba). Se distribuye en formato Hugging Face Transformers y está pensado para fine-tuning, experimentos de in-context learning y desarrollo de investigación, no para interacción directa. Con 873.438.784 parámetros reales (etiquetado como 0.8B), es el miembro más pequeño de la familia y adopta una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con Gated Attention y capas FFN.

La propuesta central de Qwen3.5 es una base unificada visión-lenguaje con entrenamiento de fusión temprana sobre tokens multimodales, que según el autor alcanza paridad con Qwen3 y supera a los modelos Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual. El modelo soporta 201 idiomas y dialectos y emplea un vocabulario de 248.320 tokens, lo que reduce el coste por token en textos multilingües.

Su relevancia actual radica en dos factores: una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y una arquitectura de atención híbrida diseñada para alto throughput con baja latencia. Todo ello bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 873.438.784 (etiquetado como 0.8B) |
| Parametros activos | no disponible (el autor no indica configuración MoE en las especificaciones del modelo) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo publica pesos safetensors sin cuantizar) |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión. El layout oculto es 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, 24 capas en total con una proporción de 3 capas de atención lineal por cada capa de atención completa. La dimensión oculta es 1024 y la dimensión intermedia de la FFN es 3584. Las cabezas de Gated DeltaNet son 16 para V y 16 para QK con dimensión de cabeza 128; las de Gated Attention son 8 para Q y 2 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El embedding de tokens (248.320, con padding) está atado a la salida LM.

El entrenamiento combina preentrenamiento y postentrenamiento, con fusión temprana sobre tokens multimodales. Según el autor, se emplea RL a escala sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas, además de un framework de RL asíncrono para orquestación de entornos a gran escala. El modelo incorpora MTP (multi-token prediction) entrenado con múltiples pasos, lo que habilita decodificación especulativa. Los tokens de control `<|im_start|>` y `<|im_end|>` están entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial sin necesidad de reentrenar los embeddings, una optimización relevante dado el gran vocabulario del modelo.

## Capacidades

- Generación de texto y razonamiento general en modo preentrenado (sin ajuste instructivo).
- Comprensión de imagen y texto (pipeline image-text-to-text) gracias al encoder de visión integrado.
- Razonamiento sobre código y matemáticas, según los benchmarks declarados por el autor para la familia.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL a escala.
- Cobertura multilingüe de 201 idiomas y dialectos.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada para esta variante base.
- Modo thinking: no disponible en la información proporcionada para esta variante base.
- Multi-token prediction (MTP) entrenado, apto para decodificación especulativa.
- Compatibilidad con Hugging Face Transformers, vLLM y SGLang.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base de 0.8B con licencia Apache 2.0, se puede ajustar con SFT sobre datos propios (legal, sanitario, atención al cliente) con un coste de cómputo bajo y desplegar en una sola GPU.
- Punto de partida para PEFT/LoRA: los tokens de control ya entrenados permiten aplicar LoRA con la plantilla de chat oficial sin reentrenar los embeddings de 248.320 tokens, lo que reduce el coste de adaptación.
- Investigación en arquitecturas híbridas: la combinación de Gated DeltaNet y Gated Attention en una proporción 3:1 permite estudiar el equilibrio entre atención lineal y completa en modelos pequeños con contexto largo.
- Procesamiento de documentos largos: la ventana nativa de 262.144 tokens permite resumir, extraer información o clasificar contratos, informes o expedientes completos sin fragmentación.
- Experimentos de decodificación especulativa: el entrenamiento con MTP habilita evaluar técnicas de aceleración de inferencia sobre un modelo de 0.8B con bajo coste de experimentación.
- Evaluación multilingüe: con 201 idiomas declarados, sirve como base para medir calidad lingüística en idiomas de bajos recursos antes de escalar a variantes mayores.
- Prototipado de pipelines visión-lenguaje: el encoder de visión integrado permite construir demos de captioning, VQA o extracción de datos de imágenes con un único modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona de forma cualitativa que la familia Qwen3.5 alcanza paridad con Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no se aportan cifras concretas para esta variante de 0.8B.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos (el repo ocupa 1,8 GB), más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se publican GGUF oficiales en el repo.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en precisión completa; A100 y H100 quedan sobredimensionadas para este tamaño y se reservan para entrenamiento o serving por lotes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con 6 GB o más.
- Opciones de despliegue: Hugging Face Transformers, vLLM y SGLang (según la model card); para CPU o GPU de baja VRAM sería necesario generar cuantizaciones GGUF propias, ya que no se ofrecen en el repo.
- Latencia y throughput: no disponibles. La arquitectura híbrida con atención lineal está diseñada para alto throughput y baja latencia, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-Base | 873 M | 262.144 (ext. 1.010.000) | Apache 2.0 | Híbrido Gated DeltaNet + Gated Attention, multimodal, 201 idiomas |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Transformer denso, solo texto; contexto mucho menor |
| Qwen2.5-1.5B | 1.540 M | 32.768 | Apache 2.0 | Transformer denso, solo texto; mayor tamaño pero sin visión |
| Llama 3.2 1B | 1.240 M | 131.072 | Llama 3.2 Community License | Multimodal en variante 11B; la de 1B es solo texto y con licencia restrictiva |

La comparación se basa en características públicas de cada familia; no se dispone de resultados de benchmarks de Qwen3.5-0.8B-Base para comparar rendimiento numérico.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no está ajustado para instrucciones ni diálogo; su uso directo produce continuaciones de texto, no respuestas alineadas.
- Riesgo de alucinación inherente a modelos base pequeños; sin postentrenamiento instructivo no hay salvaguardas de alineación.
- Sesgos potenciales derivados de los datos de preentrenamiento; no se documenta la composición del dataset ni las medidas de mitigación.
- Idiomas: aunque se declaran 201 idiomas, no se especifica la calidad por idioma ni el volumen de datos por lengua.
- Contexto: la extensión hasta 1.010.000 tokens es una capacidad declarada; el rendimiento efectivo en contextos muy largos no está verificado con benchmarks publicados.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite al LICENSE del repositorio original de Qwen; conviene revisar los términos exactos antes de producción.
- El repositorio pertenece a un usuario tercero (ArchiveStudio) que redistribuye pesos de Qwen; no es el repositorio oficial del equipo Qwen, por lo que se recomienda verificar la integridad de los pesos.
- Sin cuantizaciones oficiales publicadas: el despliegue en hardware limitado requiere generar GGUF o AWQ/GPTQ por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-0.8B-Base
- Repositorio oficial de referencia (LICENSE): https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
