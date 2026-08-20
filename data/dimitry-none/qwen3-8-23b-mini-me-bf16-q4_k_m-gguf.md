# dimitry-none/Qwen3.8-23B-Mini-Me-bf16-Q4_K_M-GGUF

## Resumen

El modelo `dimitry-none/Qwen3.8-23B-Mini-Me-bf16-Q4_K_M-GGUF` es una conversión al formato GGUF del modelo `StargazerLabs/Qwen3.8-23B-Mini-Me-bf16`, realizado mediante la herramienta GGUF-my-repo de llama.cpp. El modelo original pertenece a la familia Qwen3.8, una serie de modelos de lenguaje de gran tamaño desarrollada por Alibaba Qwen, y ha sido sometido a un proceso de poda de capas (*layer pruning*) para reducir su tamaño desde los 27B originales hasta los 23B, manteniendo un rendimiento competitivo. Esta versión cuantizada en Q4_K_M permite ejecutar el modelo en hardware de consumo con un equilibrio entre calidad y requisitos de memoria.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento y generación de texto de nivel cercano a Qwen3.8-27B, pero con un tamaño reducido que lo hace accesible para inferencia local en equipos con GPUs de gama media o incluso en CPU mediante llama.cpp. Al estar licenciado bajo Apache 2.0, es totalmente libre para uso comercial y de investigación. El pipeline declarado es *image-text-to-text*, aunque la conversión GGUF se centra en la generación de texto; la compatibilidad multimodal no está confirmada en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pertenece a la familia Qwen3.8, probablemente transformer con atención estándar) |
| Parametros totales | 22.329.774.112 (22,33B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única disponible en este repo) |
| Idiomas soportados | no disponible (se espera multilingüe, típico de Qwen) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original `StargazerLabs/Qwen3.8-23B-Mini-Me-bf16`. Por el nombre y la familia a la que pertenece, se infiere que se basa en la arquitectura de Qwen3.8, que a su vez hereda el diseño de Qwen3.5 (probablemente un transformer denso con atención de múltiples cabezas y normalización RMSNorm). El proceso de poda de capas reduce el número de capas del transformer, lo que explica la disminución de parámetros respecto al Qwen3.8-27B original. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) empleadas. La conversión a GGUF no modifica los pesos, solo los reempaqueta para su uso con llama.cpp.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de la familia Qwen3.8, se espera un rendimiento sólido en tareas de comprensión, razonamiento lógico y generación de texto, aunque no se han publicado evaluaciones específicas para esta versión podada.
- Soporte de tool calling y function calling: no confirmado en esta versión, pero es una característica habitual en los modelos Qwen3.8.
- Capacidades de agente y razonamiento multi-paso: probablemente presentes, dado el énfasis de Qwen3.8 en tareas agénticas de largo horizonte, pero sin confirmación oficial.
- Multilingüismo: no se especifican idiomas, pero los modelos Qwen suelen soportar inglés, chino y otros idiomas principales.
- Capacidades multimodales: el pipeline_tag indica *image-text-to-text*, pero la conversión GGUF no incluye el procesador de visión; es probable que esta versión solo funcione con texto.

## Casos de uso

- Inferencia local en equipos de consumo: gracias a la cuantización Q4_K_M y al tamaño reducido (13,8 GB), el modelo puede ejecutarse en una GPU con 16 GB de VRAM (p. ej., RTX 4080/4090) o en un Mac con 16 GB de memoria unificada, permitiendo experimentación y prototipado sin depender de APIs externas.
- Asistente de programación en entornos sin conexión: integrable en editores de código o CLI mediante llama.cpp, para autocompletado y generación de código, aprovechando las capacidades de codificación de la familia Qwen3.8.
- Chatbot de atención al cliente: desplegable en un servidor local con `llama-server`, capaz de mantener conversaciones multi-turno con contexto razonable, aunque la longitud de contexto no está confirmada.
- Análisis de documentos y resumen: adecuado para procesar textos largos (si el contexto lo permite) y generar resúmenes o extraer información, gracias a su capacidad de razonamiento.
- Educación e investigación: útil para estudiar el efecto de la poda de capas en modelos de lenguaje, ya que se puede comparar con el modelo original de 27B.
- Desarrollo de agentes simples: si el modelo soporta tool calling, puede utilizarse como base para agentes que interactúan con APIs o ejecutan comandos, aunque esta capacidad no está verificada en esta versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones para este modelo específico. Se recomienda consultar la model card del modelo base `StargazerLabs/Qwen3.8-23B-Mini-Me-bf16` para posibles referencias, aunque no se han encontrado en la búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M y 22,33B parámetros, el modelo ocupa aproximadamente 13,8 GB en disco. En memoria, se necesitan al menos 14-15 GB para cargar los pesos y los estados intermedios. Se recomienda una GPU con 16 GB de VRAM o más.
- GPUs recomendadas: NVIDIA RTX 4080/4090 (16-24 GB), A100 (40 GB) o H100 (80 GB) para mayor margen. También puede ejecutarse en CPU con suficiente RAM (16-32 GB), aunque con menor velocidad.
- Compatibilidad con GPUs de consumo: sí, cabe en RTX 4080/4090 y en GPUs con 16 GB. No cabe en GPUs de 8-12 GB sin cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (si se importa el GGUF), vLLM (con conversión a formato compatible) y TGI (con adaptación). El README proporciona instrucciones para usar con llama.cpp.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud de contexto. En una RTX 4090, se puede esperar una velocidad de decodificación de 30-50 tokens/s, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos. El modelo base `StargazerLabs/Qwen3.8-23B-Mini-Me-bf16` es una versión podada de Qwen3.8-27B, pero no se han publicado comparativas directas. Alternativas en el mismo rango de tamaño (20-30B) incluyen Qwen3-27B (original) y Llama 3.1 8B (inferior en tamaño), pero sin datos de rendimiento de este modelo concreto, no es posible establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en bf16, lo que puede afectar a tareas que requieren alta exactitud numérica o razonamiento complejo.
- No se ha confirmado la compatibilidad multimodal en esta versión GGUF; el pipeline_tag sugiere capacidades de imagen, pero el archivo GGUF probablemente solo contiene pesos de texto.
- La longitud de contexto no está documentada; si el modelo original soporta 128K tokens (como Qwen3.8), la versión podada podría tener un contexto reducido, pero no hay datos.
- Al ser un modelo podado, puede presentar degradaciones en tareas que dependen de capas eliminadas, especialmente en razonamiento de largo alcance.
- No se han publicado evaluaciones de sesgos o alucinaciones; como cualquier LLM, puede generar contenido incorrecto o sesgado.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar los términos del modelo base original por si hubiera condiciones adicionales.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/dimitry-none/Qwen3.8-23B-Mini-Me-bf16-Q4_K_M-GGUF
- Modelo base (bf16): https://huggingface.co/StargazerLabs/Qwen3.8-23B-Mini-Me-bf16
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
