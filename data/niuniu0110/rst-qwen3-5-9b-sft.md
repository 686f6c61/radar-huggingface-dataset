# NiuNiu0110/rst-qwen3.5-9b-sft

## Resumen

El repositorio `NiuNiu0110/rst-qwen3.5-9b-sft` contiene un fine-tune SFT del modelo base `Qwen/Qwen3.5-9B-Base`, desarrollado por el usuario NiuNiu0110. Se trata de un modelo multimodal de tipo imagen-texto (pipeline `image-text-to-text`) que hereda la arquitectura híbrida de Qwen3.5, una generación reciente de modelos de Alibaba que integra avances en eficiencia, multimodalidad y aprendizaje por refuerzo a escala. El modelo tiene 9.653.104.368 parámetros totales y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens.

La relevancia de este modelo radica en su base: Qwen3.5-9B destaca por su arquitectura híbrida que combina capas de Gated DeltaNet (atención lineal) y Gated Attention (atención completa), lo que permite un alto rendimiento con menor coste computacional. Según la documentación del modelo base, supera a modelos anteriores en razonamiento, coding, agentes y comprensión visual. Sin embargo, el repositorio no incluye una model card específica para el fine-tune, por lo que la información técnica disponible se refiere al modelo base y no al ajuste realizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal de lenguaje con vision encoder; híbrido: Gated DeltaNet + Gated Attention + FFN (32 capas, hidden 4096) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (el README menciona sparse MoE en los highlights, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.010.000 tokens |
| Tipos de cuantizacion | no disponibles en el repositorio; en Ollama se ofrecen Q4_K_M, Q6_K y Q8_0 (según una guía de terceros) |
| Idiomas soportados | no disponible (el modelo base declara 201 idiomas y dialectos, pero el fine-tune no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune SFT del Qwen3.5-9B-Base, cuyo diseño corresponde a un modelo causal de lenguaje con vision encoder. La arquitectura es híbrida: combina capas de Gated DeltaNet (atención lineal con puertas) y capas de Gated Attention (atención completa), intercaladas con redes feed-forward. El layout se organiza en 8 bloques, cada uno con 3 subcapas de Gated DeltaNet → FFN y 1 subcapa de Gated Attention → FFN. En total hay 32 capas, con dimensión oculta de 4096, 16 cabezas de atención para Q y 4 para KV (dimensión de cabeza 256), y 32 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128). El contexto nativo es de 262.144 tokens, extensible a 1.010.000.

El modelo base fue preentrenado y postentrenado con aprendizaje por refuerzo a escala, e incorpora Multi-Token Prediction (MTP), una técnica que predice varios tokens a la vez para acelerar la decodificación. La documentación del base menciona además una fusión temprana de tokens multimodales, lo que le permite procesar imágenes y texto de forma conjunta. El fine-tune no tiene información pública sobre sus datos de entrenamiento, el proceso de ajuste ni las tareas específicas para las que fue optimizado.

## Capacidades

- Multimodal: pipeline image-text-to-text; procesa imágenes y texto. Según la documentación del base, la fusión temprana de tokens multimodales le permite alcanzar paridad con Qwen3 y superar a Qwen3-VL en razonamiento, coding, agentes y comprensión visual.
- Contexto largo: 262.144 tokens nativos, extensible a 1.010.000, lo que permite manejar documentos extensos o conversaciones largas sin fragmentación.
- Razonamiento y coding: los benchmarks del base muestran resultados competitivos en MMLU-Pro (82.5), superando a modelos más grandes. El modo thinking, según una guía de terceros, puede activarse para matemáticas y código.
- Capacidades de agente: el base fue entrenado con RL en entornos multi-agente, lo que sugiere soporte para razonamiento multi-paso y planificación.
- Multilingüe: el base declara soporte para 201 idiomas y dialectos, aunque el fine-tune no especifica su cobertura lingüística.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede procesar facturas, contratos o informes escaneados, extrayendo información textual y visual. Su ventana de 262K tokens permite manejar documentos largos sin dividirlos, lo que reduce pérdida de contexto.
- Soporte técnico con capturas de pantalla: el usuario envía una imagen de un error o una interfaz y el modelo razona sobre ella para generar instrucciones de solución. El modo thinking (activado para matemáticas y código) ayuda en diagnósticos complejos.
- Generación de código asistida: el modelo puede autocompletar, explicar y revisar código. Su rendimiento en coding y su capacidad de razonamiento lo hacen adecuado para integrarse en IDEs o pipelines de CI/CD, siempre que se habilite tool calling si es necesario.
- Agentes conversacionales multilingües: si se mantiene la cobertura de 201 idiomas del base, puede desplegarse en chatbots de atención al cliente global, gestionando consultas en múltiples idiomas con contexto largo.
- Análisis de vídeo (según una guía de terceros): el modelo parece capaz de procesar vídeo desde los mismos pesos. Esto permitiría resumir grabaciones de reuniones, monitorizar cámaras o analizar contenido de vídeo, aunque esta capacidad no está documentada oficialmente.
- Razonamiento matemático educativo: activando el modo thinking, el modelo puede resolver problemas paso a paso y generar explicaciones didácticas, útil en plataformas de tutoría o generación de material educativo.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base Qwen3.5-9B según su model card. No se han publicado benchmarks específicos del fine-tune `rst-qwen3.5-9b-sft`.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | no disponible | no disponible |

## Requisitos de hardware

- Según una guía de terceros, el modelo ocupa 6.6 GB en Ollama con cuantización Q4_K_M, por lo que cabe en GPUs de 8 GB VRAM.
- Para GPUs de 12 GB VRAM, se recomienda usar Q6_K o Q8_0.
- Los pesos en safetensors ocupan 19.3 GB, lo que implica que en precisión BF16/FP16 se necesitan al menos 24 GB de VRAM (por ejemplo, RTX 4090) o 40 GB (A100) para ejecutarlo sin cuantizar.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers y Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU-Pro |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9.653M (9.65B) | 262K | Apache 2.0 | 82.5 |
| Qwen3.5-4B | ~4B | 262K | Apache 2.0 | 79.1 |
| Qwen3-Next-80B-A3B-Thinking | 80B total, 3B activos (según nombre) | no disponible | no disponible | 82.7 |
| GPT-OSS-20B | 20B | no disponible | no disponible | 74.8 |

Nota: el modelo del repositorio es un fine-tune, no el base. La comparativa se basa en el modelo base.

## Limitaciones y advertencias

- El repositorio no incluye una model card específica para el fine-tune; la documentación es la del modelo base, lo que impide conocer los datos de entrenamiento, el proceso de ajuste y la calidad del resultado.
- No se han publicado evaluaciones independientes del fine-tune. En HuggingFace tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Como todo modelo de lenguaje, puede generar alucinaciones o información incorrecta, especialmente en dominios especializados.
- La cobertura lingüística y las capacidades de tool calling del fine-tune no están confirmadas.
- El modelo es multimodal, pero no se especifican los formatos de imagen, la resolución máxima ni el rendimiento en tareas visuales concretas.
- La licencia Apache 2.0 permite uso comercial, pero cualquier responsabilidad sobre el uso recae en el usuario final.

## Enlaces

- HuggingFace: https://huggingface.co/NiuNiu0110/rst-qwen3.5-9b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ollama: https://ollama.com/library/qwen3.5:9b
- Guía de instalación (insiderllm): https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
