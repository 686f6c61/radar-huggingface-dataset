# Qwen/Qwen3.5-9B-Base

## Resumen

Qwen3.5-9B-Base es el modelo base (pre-entrenado, sin ajuste de instrucciones) de la familia Qwen3.5 desarrollada por el equipo Qwen de Alibaba. Se trata de un modelo causal multimodal con codificador de visión, diseñado desde el preentrenamiento con fusión temprana de tokens multimodales, lo que le permite alcanzar paridad con Qwen3 en razonamiento, código y agentes, y superar a los modelos Qwen3-VL en tareas de comprensión visual. Con 9.653.104.368 parámetros totales, está pensado como punto de partida para fine-tuning, experimentos de aprendizaje en contexto e investigación, no para interacción directa.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención completa con compuertas (Gated Attention) en un esquema híbrido de 32 capas, complementado con un FFN de dimensión intermedia 12288. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000, lo que lo sitúa en la gama alta de ventanas de contexto para modelos de su tamaño. La licencia Apache 2.0 y su compatibilidad con Transformers, vLLM y SGLang lo hacen atractivo para despliegues comerciales y de producción.

La relevancia actual del modelo radica en su enfoque de "fundación visión-lenguaje unificada" y en su soporte declarado de 201 idiomas y dialectos, junto con un entrenamiento de RL escalado a entornos de millones de agentes. Esto lo posiciona como una base sólida para construir agentes multimodales y aplicaciones multilingües sin depender de modelos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrido Gated DeltaNet (atención lineal) + Gated Attention, con FFN |
| Parametros totales | 9.653.104.368 (9B declarados) |
| Parametros activos | no disponible (no se declara como MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer híbrido con 32 capas organizadas en un layout de 8 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, todas con FFN asociado. La Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La dimensión oculta es 4096, el FFN tiene dimensión intermedia 12288 y el vocabulario (con padding) es de 248.320 tokens. El modelo incorpora además multi-token prediction (MTP) entrenado con múltiples pasos, lo que puede acelerar la decodificación especulativa.

El entrenamiento combina preentrenamiento y postentrenamiento con fusión temprana de tokens multimodales, lo que según el autor logra una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto. Se menciona un escalado de reinforcement learning sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas, así como un marco de RL asíncrono para orquestación de agentes a gran escala. No se detallan en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento: modelo causal de lenguaje con capacidad de razonamiento declarada a la par de Qwen3.
- Comprensión visual: pipeline image-text-to-text con codificador de visión y fusión temprana de tokens multimodales; supera a Qwen3-VL en benchmarks de comprensión visual según el autor.
- Código y matemáticas: incluido en las mejoras declaradas de Qwen3.5 frente a generaciones anteriores.
- Capacidades de agente: entrenamiento con RL en entornos multiagente y soporte de tareas de múltiples pasos.
- Multilingüismo: cobertura de 201 idiomas y dialectos.
- Tokens de control de chat: los tokens `<|im_start|>` y `<|im_end|>` están entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial sin reentrenar embeddings.
- Multi-token prediction (MTP): entrenado con múltiples pasos, útil para decodificación especulativa.
- Tool calling / function calling: no se detalla explícitamente en la información disponible para el modelo base.

## Casos de uso

- Fine-tuning para dominios verticales: al ser un modelo base con licencia Apache 2.0, se puede ajustar con LoRA o fine-tuning completo para sectores como legal, sanitario o financiero, aprovechando su contexto de 262K tokens para incluir documentación extensa en el entrenamiento.
- Investigación en aprendizaje en contexto: su ventana de contexto nativa de 262.144 tokens permite experimentos de few-shot con muchos ejemplos y contextos largos sin truncamiento.
- Desarrollo de asistentes multimodales: la fusión temprana de visión y texto permite construir aplicaciones que procesen imágenes y texto conjuntamente, como análisis de documentos escaneados o descripción de gráficos.
- Agentes autónomos multi-paso: el entrenamiento con RL en entornos multiagente y el soporte de MTP lo hacen adecuado para orquestar pipelines de agentes que requieran planificación y ejecución de tareas encadenadas.
- Procesamiento de documentación extensa: con contexto extensible hasta 1M de tokens, puede emplearse en tareas de resumen, extracción de información y QA sobre corpus de gran tamaño en una sola pasada.
- Aplicaciones multilingües: el soporte de 201 idiomas permite desplegar sistemas de generación y comprensión en mercados regionales sin necesidad de modelos específicos por idioma.
- Base para decodificación especulativa: el entrenamiento con MTP facilita su uso como modelo draft o target en pipelines de decodificación especulativa para reducir latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 9,65B parámetros en FP16 requiere aproximadamente 19,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 10-12 GB y en 4 bits unos 6-7 GB, aunque estos valores no están confirmados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar que funcione en GPUs de 24 GB (RTX 4090, A10G) en cuantización, y en A100/H100 para FP16 con contexto largo.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) con cuantización, aunque no confirmado oficialmente.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang (declarados compatibles en la model card). También se menciona endpoints_compatible y deploy:sagemaker en los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base | 9,65B | 262K nativo / 1M extensible | Apache 2.0 | Texto + visión | Hugging Face |
| Qwen3-VL (versión no especificada) | no disponible | no disponible | no disponible | Texto + visión | Hugging Face |
| Qwen3 (versión no especificada) | no disponible | no disponible | no disponible | Texto | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La model card indica que Qwen3.5 alcanza paridad con Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero sin cifras concretas.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no está destinado a interacción directa; su uso previsto es fine-tuning, aprendizaje en contexto e investigación.
- Riesgo de alucinación: como todo modelo de lenguaje preentrenado, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sesgos: no se documentan sesgos específicos en la información disponible; cabe esperar sesgos derivados de los datos de preentrenamiento.
- Limitaciones de idioma: aunque se declaran 201 idiomas, no se especifica el rendimiento por idioma ni la calidad relativa en cada uno.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio para condiciones exactas.
- Contexto extensible: la extensión hasta 1.010.000 tokens puede requerir técnicas adicionales y no está garantizada su calidad en todos los casos.
- Caveat de producción: al ser un modelo base, requiere postentrenamiento (SFT, RLHF/DPO) antes de desplegarse en aplicaciones de cara al usuario.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai/
- Qwen (web oficial): https://qwen.ai/home
- Qwen Cloud: https://www.qwencloud.com/
- Perfil de Qwen en Hugging Face: https://huggingface.co/Qwen
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Blog Qwen 3.8 (referencia de familia): https://qwen.ai/blog?id=qwen3.8
