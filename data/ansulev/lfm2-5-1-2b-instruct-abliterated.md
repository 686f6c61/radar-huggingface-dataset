# ansulev/LFM2.5-1.2B-Instruct-abliterated

## Resumen

LFM2.5-1.2B-Instruct-abliterated es una variante del modelo de Liquid AI LFM2.5-1.2B-Instruct a la que se le ha aplicado la técnica de abliteration, un proceso que elimina los rechazos (refusals) del modelo. El resultado es una versión "sin censura" que responde a peticiones que el modelo original podría bloquear, manteniendo el resto de capacidades de conversación, seguimiento de instrucciones y tool calling. Esta variante ha sido publicada por el usuario ansulev en Hugging Face y está basada en el modelo de Liquid AI, con 1,17 mil millones de parámetros y una ventana de contexto de 32K tokens.

La relevancia de este modelo reside en su tamaño compacto (1.2B), lo que lo hace apto para despliegue en dispositivos de borde y GPUs de consumo, y en la modificación de comportamiento que lo convierte en una opción para experimentación en escenarios donde la censura o los rechazos sean un obstáculo. Está disponible bajo la licencia lfm1.0 de Liquid AI y se distribuye en formato safetensors, con soporte para transformers y ollama. Su arquitectura híbrida combina bloques de convolución LIV con doble compuerta y Grouped Query Attention, una novedad técnica que lo diferencia de los transformers estándar de su tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: bloques de convolución LIV (double-gated) + Grouped Query Attention (GQA) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | bf16 (recomendado), GGUF Q4_K_M disponible (con aviso de posibles duplicados) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (otra, ver enlace LICENSE en el repo) |
| Formato de pesos | safetensors (transformers), GGUF para ollama |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct de Liquid AI está construido sobre una arquitectura híbrida que combina bloques de convolución LIV (Linear-Input-Value) con doble compuación y Grouped Query Attention (GQA). Esta combinación busca eficiencia computacional y baja latencia, adecuada para despliegue en edge. El modelo fue pre-entrenado y luego afinado con instrucciones y refuerzo (RL) según la documentación de Liquid AI, aunque no se proporcionan detalles sobre el número exacto de tokens de entrenamiento en la información disponible.

La versión abliterated se ha obtenido aplicando la técnica de abliteration sobre el modelo original. Esta técnica, implementada en el repositorio remove-refusals-with-transformers de Sumandora, identifica los vectores de dirección de rechazo en el espacio de activaciones y los elimina mediante una modificación de los pesos. No se ha realizado un entrenamiento adicional: se trata de una transformación sobre los pesos del modelo ya entrenado. La model card advierte que la cuantización Q4_K_M puede contener duplicados y recomienda usar la versión bf16 para evitar artefactos.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en 8 idiomas (inglés, español, árabe, chino, francés, alemán, japonés, coreano).
- Tool calling y function calling, soportado por el modelo base LFM2.5-1.2B-Instruct.
- Soporte de agentes y razonamiento multi-paso, con capacidad de pensar antes de responder (el modelo base incluye un modo de razonamiento que emite tokens de pensamiento antes de la respuesta final).
- Ventana de contexto de 32K tokens, adecuada para conversaciones largas y documentos extensos.
- Capacidad de ejecución en edge y dispositivos de bajo consumo gracias a su tamaño compacto.
- Al ser abliterated, no presenta rechazos ante peticiones que el modelo original bloquearía, aunque esto puede afectar a la seguridad de las respuestas.

## Casos de uso

- Asistente de atención al cliente sin censura: el modelo puede gestionar conversaciones multi-turno con contexto largo (32K) y no rechazará preguntas sobre temas sensibles, lo que lo hace útil para entornos donde se requiere una respuesta directa sin evasivas, aunque con supervisión humana.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar o revisar código, con la ventaja de no rechazar peticiones de desarrollo de scripts complejos que otros modelos podrían bloquear.
- Experimentación en investigación de alineación: sirve como base para estudiar el impacto de la abliteration en el comportamiento de modelos de lenguaje, comparando respuestas antes y después de la modificación.
- Chat local en español para soporte técnico: gracias a su tamaño (1.2B) y soporte multilingüe, puede desplegarse en un portátil o una GPU de gama media para atender consultas técnicas en español sin censura previa.
- Procesamiento de documentos largos: su contexto de 32K permite resumir o analizar informes extensos, contratos o artículos, sin rechazar secciones delicadas que el modelo original podría evitar.
- Prototipado rápido de agentes conversacionales: al integrarse fácilmente con transformers y ollama, permite crear un bot con tool calling en un día, sin necesidad de GPU de alta gama, para entornos de prueba y experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante abliterated en la información disponible. El modelo base LFM2.5-1.2B-Instruct de Liquid AI cuenta con datos de rendimiento en la documentación de Liquid, pero no se han proporcionado en el contexto de esta ficha. Se recomienda consultar la documentación oficial de Liquid AI para obtener cifras comparativas de MMLU, HumanEval, GSM8K, etc. No se inventan datos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo ocupa aproximadamente 2,5 GB de memoria (1,17B parámetros × 2 bytes por parámetro). En cuantización Q4_K_M, se reduce a unos 0,7-0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090, A100). En cuantización Q4, puede ejecutarse en GPUs con 2 GB.
- Cabe en GPU de consumo: sí, tanto en RTX 4090 como en tarjetas más modestas como la RTX 3060 o incluso en CPU con suficiente RAM.
- Opciones de despliegue: transformers (con trust_remote_code=True), vLLM (según la receta de vLLM para el modelo base), Ollama (huihui_ai/lfm2.5-abliterated:1.2b-instruct) y llama.cpp para GGUF.
- Latencia y throughput: no se han publicado datos concretos. Para un modelo de 1.2B en GPU moderna, se espera una velocidad de generación de 50-100 tokens/segundo en bf16 con batching, aunque depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (base) | 1,17B | 32K | lfm1.0 | safetensors | Modelo original con censura estándar |
| LFM2.5-1.2B-Instruct-abliterated (este) | 1,17B | 32K | lfm1.0 | safetensors, GGUF | Variante sin rechazos mediante abliteration |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | safetensors | Alternativa de tamaño similar, sin tool calling nativo |
| Gemma-2-2B | 2,6B | 8K | Gemma license | safetensors | Mayor tamaño, contexto menor, con restricciones de uso |

No se dispone de datos de rendimiento comparativos publicados para la versión abliterada frente a estas alternativas. La comparativa se basa en especificaciones técnicas y disponibilidad.

## Limitaciones y advertencias

- La técnica de abliteration elimina los rechazos del modelo, pero también puede reducir la calidad de las respuestas en tareas de seguridad o alineación. No hay garantía de que el modelo no genere contenido dañino, ilegal o éticamente problemático.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, especialmente en temas especializados. La ausencia de rechazo puede aumentar la confianza en respuestas incorrectas.
- La licencia lfm1.0 de Liquid AI tiene términos específicos para uso comercial; es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones exactas. No se asume que sea de código abierto en el sentido de OSI.
- La cuantización Q4_K_M publicada en Ollama puede contener duplicados en los pesos, lo que degrada la calidad; se recomienda usar la versión bf16.
- El modelo está entrenado para 8 idiomas, pero su rendimiento puede ser inferior en idiomas con menos representación en el entrenamiento (por ejemplo, el español frente al inglés).
- Al ser una prueba de concepto (proof-of-concept) según la model card, no se recomienda para producción crítica sin una evaluación exhaustiva de seguridad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ansulev/LFM2.5-1.2B-Instruct-abliterated
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación de Liquid AI (LFM2.5-1.2B-Instruct): https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/LiquidAI/LFM2.5-1.2B-Instruct
- Repositorio de la técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Colección de modelos abliterados de huihui-ai: https://huggingface.co/collections/huihui-ai/lfm25-abliterated
