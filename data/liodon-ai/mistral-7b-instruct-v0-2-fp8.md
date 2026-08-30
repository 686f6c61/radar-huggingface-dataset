# liodon-ai/Mistral-7B-Instruct-v0.2-FP8

## Resumen

Este modelo es una cuantización en FP8 del conocido Mistral-7B-Instruct-v0.2, publicada por Liodon AI. El objetivo es reducir el tamaño del modelo original (de 14,5 GB a 7,5 GB) y acelerar la inferencia, manteniendo en lo posible la calidad del modelo base. Se trata de una cuantización dinámica sin calibración, lo que significa que los pesos se convierten directamente a FP8 (E4M3) por canal y las activaciones se cuantizan dinámicamente en tiempo de inferencia, evitando el sesgo que podría introducir un dataset de calibración.

El modelo base, Mistral-7B-Instruct-v0.2, es un transformer decoder-only de 7.000 millones de parámetros, ajustado para instrucciones, con una ventana de contexto de 32.000 tokens y atención con ventana deslizante (sliding window). Esta versión cuantizada está pensada para entornos de producción que utilizan vLLM, TGI o SGLang, y requiere hardware NVIDIA con compute capability 8.9 o superior para aprovechar plenamente las ventajas de FP8. Es una opción interesante para desplegar un modelo de 7B en GPUs con menos memoria, como las RTX 40-series o las L4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral) con Grouped-Query Attention y Sliding Window Attention |
| Parametros totales | 7.241.732.096 (7,24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (del modelo base) |
| Tipos de cuantizacion | FP8 (E4M3) dinámico por canal en pesos, activaciones dinámicas por token; también existe versión GGUF (imatrix) del mismo autor |
| Idiomas soportados | Inglés y francés (según documentación del modelo base) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors (FP8); también disponible en GGUF |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una cuantización del Mistral-7B-Instruct-v0.2 original. El modelo base es un transformer decoder-only con 7.000 millones de parámetros, que incorpora Grouped-Query Attention (GQA) para acelerar la inferencia y Sliding Window Attention para manejar contextos largos de hasta 32.000 tokens. Fue ajustado mediante instrucciones (instruct fine-tuning) a partir de Mistral-7B-v0.2, y destaca en tareas de razonamiento, generación de código y matemáticas.

La cuantización FP8 se realizó con la librería llm-compressor de vLLM, utilizando el esquema `FP8_DYNAMIC`. Los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. No se requiere dataset de calibración, por lo que los pesos cuantizados son numéricamente una conversión directa de los originales, sin sesgo adicional. El `lm_head` se deja sin cuantizar, práctica estándar para preservar la calidad de las salidas.

## Capacidades

- Generación de texto conversacional y de instrucciones, con soporte para tareas de razonamiento, matemáticas y generación de código (heredadas del modelo base).
- Ventana de contexto de 32.000 tokens, adecuada para documentos largos o conversaciones multi-turno extensas.
- Soporte multilingüe limitado a inglés y francés (según el modelo base).
- Compatible con los principales frameworks de inferencia: vLLM, TGI y SGLang, lo que facilita su integración en pipelines de producción.
- No se especifican capacidades de tool calling, agentes o modo de pensamiento explícito en la documentación disponible.

## Casos de uso

- Despliegue de un asistente conversacional en producción: gracias a su tamaño reducido (7,5 GB) y su compatibilidad con vLLM, puede servir respuestas en tiempo real en una GPU de gama media como una RTX 4090 o una L4, manteniendo una latencia baja.
- Generación de código en entornos de desarrollo: el modelo base tiene buen rendimiento en tareas de programación, y la versión FP8 permite ejecutarlo en máquinas con menos VRAM, por ejemplo en entornos de CI/CD para autocompletado o revisión de código.
- Procesamiento de documentos largos: con 32.000 tokens de contexto, puede resumir o extraer información de informes extensos, contratos o artículos técnicos sin necesidad de truncar el texto.
- Chatbots de atención al cliente en inglés o francés: el modelo puede mantener conversaciones multi-turno coherentes, y su tamaño compacto facilita su despliegue en infraestructuras con recursos limitados.
- Prototipado rápido de aplicaciones de IA generativa: al ser una cuantización directa sin calibración, se puede sustituir el modelo original por esta versión sin cambios en el código, reduciendo los requisitos de memoria.
- Inferencia en entornos edge o con GPUs de consumo: con cuantización FP8 y el soporte de GGUF, puede ejecutarse en hardware como una RTX 4060 o incluso en CPU mediante llama.cpp, aunque perdiendo las ventajas de velocidad de FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada FP8. El modelo base Mistral-7B-Instruct-v0.2 reporta mejoras frente a Llama 2 13B y Llama 1 34B en tareas de razonamiento, matemáticas y código, pero no se dispone de datos numéricos en la información proporcionada. Se recomienda evaluar el modelo en el caso de uso concreto antes de su despliegue.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 7,5 GB en FP8, por lo que con overhead de inferencia se necesitan al menos 10-12 GB de VRAM para ejecución cómoda. Cabe en GPUs de consumo como RTX 4070 (12 GB) o superiores.
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 (Ada, Hopper, Blackwell), incluyendo RTX 40-series, L4, L40S, H100, H200, B100, B200 y GB10. En GPUs más antiguas (por ejemplo, RTX 30-series), vLLM/TGI dequantizarán el modelo, perdiendo las ventajas de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), SGLang, y mediante la versión GGUF también llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser una cuantización FP8 se espera una mejora significativa frente al modelo en BF16, especialmente en GPUs con soporte nativo para FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| liodon-ai/Mistral-7B-Instruct-v0.2-FP8 | 7,24B | 32k | FP8 dinámico | other | safetensors |
| mistralai/Mistral-7B-Instruct-v0.2 (original) | 7,24B | 32k | BF16/FP16 | Apache 2.0 | safetensors |
| liodon-ai/Mistral-7B-Instruct-v0.2-imatrix-GGUF | 7,24B | 32k | GGUF (varias) | other | GGUF |

La versión FP8 ofrece la ventaja de un tamaño reducido y mayor velocidad en hardware compatible, mientras que la versión GGUF es más flexible para ejecución en CPU o GPUs antiguas. El modelo original en BF16 mantiene la máxima fidelidad pero requiere más memoria.

## Limitaciones y advertencias

- La licencia se indica como "other" sin especificar términos concretos; es necesario verificar si permite uso comercial antes de desplegarlo en producción.
- El rendimiento de FP8 solo se aprovecha en GPUs con compute capability ≥ 8.9; en hardware más antiguo el modelo se dequantiza y pierde las ventajas de velocidad y memoria.
- Al ser una cuantización, puede haber una ligera pérdida de precisión en comparación con el modelo original, aunque el esquema dinámico sin calibración minimiza este efecto.
- El modelo base tiene sesgos inherentes a sus datos de entrenamiento, que no se detallan en la documentación; se recomienda auditar el comportamiento en dominios sensibles.
- No se especifican capacidades de tool calling ni de agentes, por lo que no es adecuado para aplicaciones que requieran integración con herramientas externas sin verificación previa.
- La ventana de contexto de 32k tokens puede degradar el rendimiento en secuencias muy largas si no se gestiona correctamente la atención.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Mistral-7B-Instruct-v0.2-FP8
- Modelo base (Mistral-7B-Instruct-v0.2): https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Versión GGUF del mismo autor: https://huggingface.co/liodon-ai/Mistral-7B-Instruct-v0.2-imatrix-GGUF
- Repositorio de llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Documentación adicional sobre Mistral-7B-Instruct-v0.2: https://github.com/inferless/mistral-7b-instruct-v0.2/
