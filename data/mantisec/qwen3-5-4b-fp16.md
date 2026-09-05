# Mantisec/Qwen3.5-4B-FP16

## Resumen

El modelo Mantisec/Qwen3.5-4B-FP16 es una conversión en precisión FP16 del modelo base Qwen/Qwen3.5-4B, realizada por la organización Mantisec mediante la herramienta bfsquish v0.1.0. El objetivo principal es permitir la inferencia y el ajuste fino en GPUs NVIDIA V100 (Volta, sm_70), que carecen de soporte nativo para BF16 en sus Tensor Cores. El modelo base es un sistema de visión-lenguaje unificado que, según la documentación disponible, logra paridad con Qwen3 y supera a los modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual. La conversión mantiene las capacidades del modelo original, con un tamaño de 4.659.865.088 parámetros y un peso de 9.3 GB en formato safetensors. No se especifican la longitud de contexto, los idiomas soportados ni la licencia en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), arquitectura específica no especificada |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (conversión desde BF16 con estrategia clamp_only) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (heredada del modelo fuente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una conversión de precisión del modelo base Qwen/Qwen3.5-4B, realizada con la herramienta bfsquish v0.1.0. La estrategia de conversión aplicada es `clamp_only`: los pesos se elevan a FP32, se limitan al rango de FP16 (+/-65504) y se reducen a FP16. Según la model card, esta estrategia es casi sin pérdida para pesos bien entrenados cuyos valores se concentran cerca de cero. La validación numérica de la conversión muestra una tasa de acuerdo de tokens del 100% y una similitud coseno mínima de 0.999978 frente al modelo fuente.

El modelo base Qwen/Qwen3.5-4B es descrito en la documentación disponible como una base unificada de visión-lenguaje con entrenamiento de fusión temprana en tokens multimodales. Se indica que alcanza paridad con Qwen3 y supera a los modelos Qwen3-VL en benchmarks de razonamiento, codificación, agentes y comprensión visual. No se proporcionan detalles adicionales sobre el proceso de entrenamiento original, composición del dataset ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Comprensión multimodal: acepta entradas de imagen y texto, según el pipeline `image-text-to-text` del repositorio.
- Razonamiento y codificación: la descripción del modelo base indica que supera a Qwen3-VL en razonamiento, codificación y comprensión visual.
- Soporte para agentes: capacidad de razonamiento multi-paso, aunque no se detalla el soporte de tool calling en la información disponible.
- Generación de texto conversacional: incluye una plantilla de chat mejorada (`qwen3.8-froggeric-v22.4.0`) de un repositorio externo, que se publica en `chat_template.jinja` y `tokenizer_config.json`.
- La conversión FP16 no altera las capacidades del modelo base, pero introduce pequeñas diferencias numéricas en los logits (máximo 0.2151).
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede procesar capturas de pantalla, PDFs escaneados o diagramas para extraer información y responder preguntas. Su naturaleza multimodal permite combinar texto e imagen en una sola entrada.
- Asistente de código en entornos con GPUs V100: gracias a su compatibilidad con FP16 en Volta, puede integrarse en pipelines de CI/CD para revisión de código, generación de snippets o documentación automática.
- Agentes autónomos con visión: puede combinar entradas visuales y textuales para tomar decisiones en entornos de interfaz gráfica, donde el agente necesita interpretar la pantalla y actuar en consecuencia.
- Chatbots multimodales de atención al cliente: permite conversaciones en las que el usuario adjunta imágenes (por ejemplo, errores de pantalla o productos) y el modelo ofrece soluciones contextualizadas.
- Descripción de imágenes para accesibilidad: genera descripciones de contenido visual para usuarios con discapacidad visual, aprovechando la capacidad de comprensión de imágenes del modelo base.
- Automatización de tareas de OCR y extracción de datos: puede leer texto en imágenes y estructurarlo en formatos como JSON, útil para la digitalización de formularios o facturas.
- Investigación en visión-lenguaje: al ser un modelo abierto de 4B, es adecuado para prototipos y experimentación en entornos académicos, especialmente en infraestructuras con GPUs V100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

### Validación numérica de la conversión

| Metrica | Valor |
|---|---|
| Verdict de validacion | PASS |
| Metodo de validacion | generate |
| Max abs logit diff (vs. fuente) | 0.215126 |
| Min cosine similarity (vs. fuente) | 0.999978 |
| Token agreement rate | 100.00% |
| Escaneo de Inf/NaN | passed (sin inf/nan) |

## Requisitos de hardware

- VRAM estimada para inferencia: ~9.3 GB para los pesos en FP16, más overhead de activaciones y KV cache, por lo que se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: NVIDIA V100 (16 GB o 32 GB) es el objetivo principal de la conversión; también compatible con RTX 3090/4090, A100 y H100.
- ¿Cabe en GPU de consumo? Sí, en GPUs con 16 GB o más, como RTX 4080/4090. Para GPUs con menos VRAM se requeriría cuantización adicional, no incluida en este repositorio.
- Opciones de despliegue: vLLM, Ollama (disponible como `qwen3.5:4b` en el registro de Ollama), llama.cpp y TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mantisec/Qwen3.5-4B-FP16 | 4.659.865.088 | safetensors (FP16) | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-4B | 4.659.865.088 | safetensors (BF16) | no disponible | no disponible | HuggingFace |
| Qwen3-VL (familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: el uso comercial puede estar restringido según la licencia del modelo fuente Qwen/Qwen3.5-4B, que no se especifica en la información proporcionada.
- Idiomas soportados no especificados: se desconoce la cobertura multilingüe y la calidad en idiomas distintos del inglés o chino.
- Longitud de contexto no especificada: puede afectar a tareas que requieren ventanas largas de entrada.
- La conversión FP16 introduce pequeñas diferencias numéricas en los logits (máximo 0.2151), aunque la tasa de acuerdo de tokens es del 100% en la validación.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o comprensión visual.
- Sesgos no documentados: no se ha publicado información sobre la composición del dataset ni sobre posibles sesgos.
- El modelo base es multimodal, pero no se proporcionan detalles sobre la calidad de la visión en la información disponible.

## Enlaces

- https://huggingface.co/Mantisec/Qwen3.5-4B-FP16
- https://huggingface.co/Qwen/Qwen3.5-4B
- https://ollama.com/library/qwen3.5:4b
- https://github.com/mantisec/mantisec-bfsquish
- https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
