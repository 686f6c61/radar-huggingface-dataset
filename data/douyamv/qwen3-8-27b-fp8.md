# douyamv/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es una versión cuantizada en FP8 dinámico (W8A8) del modelo Qwen3.8-27B, desarrollado por el equipo Qwen y cuantizado por el usuario douyamv. El modelo base es una arquitectura híbrida que combina Gated DeltaNet y Gated Attention, con 27.78 mil millones de parámetros y una ventana de contexto nativa de 262 144 tokens, extensible a más de un millón. Esta cuantización reduce el tamaño de los pesos aproximadamente un 50 % respecto a BF16, pasando de unos 54 GB a unos 27 GB, lo que facilita su despliegue en hardware con menos memoria.

La relevancia de esta ficha radica en que ofrece una alternativa eficiente para ejecutar un modelo de 27B con calidad casi idéntica al original, manteniendo capacidades avanzadas como generación de texto, razonamiento, codificación, comprensión de visión y tool calling. Al estar licenciado bajo Apache 2.0, puede utilizarse tanto en investigación como en productos comerciales sin restricciones adicionales. El formato safetensors y el soporte nativo para vLLM y SGLang lo convierten en una opción práctica para entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.78B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (extensible a 1M+) |
| Tipos de cuantizacion | FP8 Dynamic (W8A8) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (2 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención tradicional (Gated Attention) con capas basadas en Gated DeltaNet, una variante de atención lineal eficiente. Esta mezcla permite manejar secuencias muy largas (hasta 262 144 tokens) con un coste computacional reducido en comparación con transformers densos puros. La cuantización FP8 dinámica se aplica a todas las capas lineales mediante la herramienta llm-compressor, manteniendo la precisión de activaciones en FP8 durante la inferencia.

No se dispone de información pública sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). La model card del autor solo indica que la cuantización produce una pérdida de calidad mínima, sin ofrecer métricas concretas. Se recomienda consultar la documentación oficial de Qwen para obtener detalles sobre el proceso de entrenamiento original.

## Capacidades

- Generación de texto en inglés y chino, con capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Generación y comprensión de código en múltiples lenguajes de programación.
- Comprensión de visión (según la model card del autor, aunque no se especifica si requiere un adaptador adicional).
- Soporte de tool calling y function calling para integración con APIs y agentes.
- Manejo de contextos muy largos (hasta 262 144 tokens) gracias a la arquitectura híbrida.
- Formato de chat compatible con el template de Qwen3.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones de soporte con contexto largo (por ejemplo, historial de tickets) gracias a su ventana de 262 144 tokens, manteniendo coherencia en interacciones extensas.
- Generación de código en producción: con soporte para tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar y documentar código, reduciendo el tiempo de desarrollo.
- Análisis de documentos legales o técnicos: su contexto amplio permite procesar contratos, informes o papers completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Asistentes virtuales multilingües: al estar entrenado en inglés y chino, puede desplegarse en aplicaciones que requieran soporte bilingüe, como chatbots empresariales o plataformas de comercio electrónico.
- Razonamiento matemático y científico: su capacidad de razonamiento permite resolver problemas de álgebra, cálculo o física, útil en entornos educativos o de investigación.
- Agentes autónomos: combinado con tool calling, puede ejecutar tareas multi-paso como búsqueda en bases de datos, llamadas a APIs o automatización de flujos de trabajo, gracias a su memoria de contexto prolongada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas comparativas (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada. Se recomienda consultar los benchmarks oficiales del modelo base Qwen3.8-27B en el repositorio de Qwen para estimar el rendimiento esperado, asumiendo una degradación mínima por la cuantización FP8.

## Requisitos de hardware

- VRAM estimada: aproximadamente 27 GB para los pesos del modelo en FP8, más el overhead de la caché KV y las activaciones. Para inferencia con contexto máximo (262 144 tokens), se recomienda al menos 40 GB de VRAM.
- GPUs compatibles: A100 40GB, H100 80GB, RTX 6000 Ada, o GPUs con 48 GB o más. En una RTX 4090 (24 GB) no cabría el modelo completo con contexto largo, aunque podría usarse con contexto reducido o cuantización adicional.
- Opciones de despliegue: vLLM, SGLang, Transformers con `device_map="auto"` y `trust_remote_code=True`. También es compatible con frameworks que soporten safetensors y FP8.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware, la longitud de secuencia y el número de peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.78B | 262 144 | BF16 | Apache 2.0 | Safetensors |
| Qwen3.8-27B-FP8 (este) | 27.78B | 262 144 | FP8 Dynamic | Apache 2.0 | Safetensors |
| Qwen3.8-27B-GGUF | 27.78B | 262 144 | GGUF (Q2_K a Q8_0) | Apache 2.0 | GGUF |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para contrastar con otros modelos de tamaño similar (por ejemplo, Llama 3.1 70B o Mistral Large). La versión FP8 ofrece un equilibrio entre tamaño reducido y calidad, mientras que las versiones GGUF permiten cuantizaciones más agresivas para hardware con menos VRAM.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una pérdida de precisión mínima en tareas muy sensibles a los detalles numéricos, aunque la model card indica que es "mínima" sin cuantificarla.
- El modelo está entrenado principalmente en inglés y chino; su rendimiento en otros idiomas, incluido el español, puede ser inferior y no está garantizado.
- No se dispone de información sobre sesgos específicos del modelo, pero como cualquier LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original para asegurar el cumplimiento.
- El tamaño del repositorio aparece como 0.0 GB en HuggingFace, lo que podría indicar que los archivos aún no se han subido correctamente o que hay un error en la metadata. Verificar antes de su uso.
- Para contextos muy largos (más de 100 000 tokens), la memoria de la caché KV puede volverse un cuello de botella incluso con FP8, requiriendo técnicas como PagedAttention (disponible en vLLM) o reducción de la longitud máxima.

## Enlaces

- Modelo en HuggingFace: [douyamv/Qwen3.8-27B-FP8](https://huggingface.co/douyamv/Qwen3.8-27B-FP8)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Versión GGUF: [douyamv/Qwen3.8-27B-GGUF](https://huggingface.co/douyamv/Qwen3.8-27B-GGUF)
- Versión abliterated: [douyamv/Qwen3.8-27B-abliterated](https://huggingface.co/douyamv/Qwen3.8-27B-abliterated)
- Versión abliterated GGUF: [douyamv/Qwen3.8-27B-abliterated-GGUF](https://huggingface.co/douyamv/Qwen3.8-27B-abliterated-GGUF)
- Herramienta de cuantización: [llm-compressor](https://github.com/vllm-project/llm-compressor)
