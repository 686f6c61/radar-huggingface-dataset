# liodon-ai/Qwen2-0.5B-FP8

## Resumen

El modelo **liodon-ai/Qwen2-0.5B-FP8** es una cuantización en punto flotante de 8 bits (FP8) del modelo base [Qwen/Qwen2-0.5B](https://huggingface.co/Qwen/Qwen2-0.5B), publicada por **Liodon AI** en agosto de 2026. Se trata de una conversión directa de los pesos originales al formato FP8 (E4M3) utilizando el esquema `FP8_DYNAMIC` de la librería [llm-compressor](https://github.com/vllm-project/llm-compressor), sin necesidad de dataset de calibración. El objetivo principal es reducir el tamaño del modelo (de 1.0 GB a 0.6 GB) y acelerar la inferencia en GPUs modernas compatibles con FP8, manteniendo un rendimiento numérico prácticamente idéntico al original.

Al estar basado en el modelo Qwen2-0.5B, hereda su arquitectura transformer decoder-only con aproximadamente 494 millones de parámetros. Es un modelo pequeño, diseñado para tareas de generación de texto de baja latencia y para entornos con recursos de hardware limitados, como dispositivos edge o inferencia en tiempo real. La cuantización FP8 dinámica no introduce sesgo de calibración, ya que los pesos son una conversión directa del modelo original, y la capa `lm_head` se mantiene sin cuantizar para preservar la calidad de la salida.

La relevancia de este modelo radica en su capacidad para ejecutarse en GPUs de consumo recientes (RTX 40-series, L4, H100, etc.) con una huella de memoria reducida, lo que lo convierte en una opción atractiva para desarrolladores que necesitan un modelo de lenguaje ligero y rápido sin sacrificar demasiada precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2-0.5B) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (E4M3) para pesos, activaciones FP8 dinámicas por token |
| Idiomas soportados | No disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (compatible con vLLM, TGI, SGLang) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del modelo base Qwen2-0.5B, sin ningún entrenamiento adicional. La arquitectura subyacente es la de un transformer decoder-only estándar, con capas de atención multi-cabeza y feed-forward, tal como se define en la serie Qwen2. No se han aplicado técnicas de RLHF ni DPO; el modelo conserva las capacidades del base, que fue preentrenado con un gran corpus multilingüe (aunque los idiomas exactos no se especifican en la información proporcionada).

La cuantización utiliza el esquema `FP8_DYNAMIC` de llm-compressor: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente en cada token durante la inferencia. Al no requerir calibración, los valores cuantizados son numéricamente equivalentes a una conversión directa de los pesos originales, evitando el sesgo que podría introducir un conjunto de calibración. La capa `lm_head` se deja sin cuantizar por ser de tamaño despreciable y tener un impacto desproporcionado en la calidad si se cuantizara.

## Capacidades

- Generación de texto: al ser un modelo base, puede completar secuencias, generar texto libre y servir como punto de partida para fine-tuning en tareas específicas.
- Razonamiento básico: aunque limitado por su tamaño, puede resolver tareas simples de comprensión y generación de lenguaje.
- Multilingüismo: no se dispone de información sobre los idiomas soportados, aunque el modelo base Qwen2 es conocido por soportar múltiples idiomas (más de 27 además de inglés y chino), pero no se confirma en esta variante.
- No soporta tool calling, agentes ni multi-step reasoning de forma nativa, ya que es un modelo base sin instrucciones.
- No incluye capacidades de visión ni audio.

## Casos de uso

- **Despliegue en dispositivos edge**: gracias a su tamaño reducido (0.6 GB) y su compatibilidad con FP8, puede ejecutarse en GPUs de bajo consumo como la RTX 4060 o L4, permitiendo inferencia en tiempo real en aplicaciones de asistente virtual o chat local.
- **Prototipado rápido**: los desarrolladores pueden utilizar este modelo cuantizado para validar ideas de NLP sin necesidad de infraestructura pesada, ya que la inferencia es rápida y el consumo de VRAM es mínimo.
- **Fine-tuning en hardware limitado**: al ser una versión cuantizada del Qwen2-0.5B, se puede usar como base para fine-tuning en tareas específicas (clasificación, generación de resúmenes, etc.) con requisitos de memoria muy bajos, incluso en GPUs con 4 GB de VRAM.
- **Generación de texto en tiempo real**: para aplicaciones como autocompletado de código, sugerencias de escritura o chatbots sencillos, donde la latencia es crítica y el modelo no necesita razonamiento complejo.
- **Pruebas de integración en pipelines de ML**: al ser compatible con vLLM, TGI y SGLang, se puede integrar fácilmente en sistemas de producción para evaluar el rendimiento de la cuantización FP8 antes de escalar a modelos más grandes.
- **Educación y experimentación**: sirve como ejemplo didáctico de cuantización FP8, permitiendo a investigadores y estudiantes estudiar el impacto de la reducción de precisión sin necesidad de grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparativas con otros modelos. Se recomienda consultar los benchmarks del modelo base Qwen/Qwen2-0.5B para una referencia aproximada, aunque la cuantización FP8 puede introducir ligeras variaciones.

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repo es de 0.6 GB, por lo que la inferencia requiere aproximadamente 1-2 GB de VRAM dependiendo del framework y la longitud de la secuencia.
- **GPU recomendadas**: para ejecutar FP8 nativamente, se necesita una GPU con compute capability ≥ 8.9, es decir, arquitecturas Ada (RTX 40-series, L4, L40S), Hopper (H100, H200) o Blackwell (B100, B200, GB10). En GPUs más antiguas, vLLM o TGI dequantizarán los pesos a FP16/FP32, perdiendo la ventaja de velocidad y memoria.
- **Compatibilidad con hardware de consumo**: sí, cabe en GPUs como RTX 4060, RTX 4070, RTX 4080, RTX 4090, siempre que sean de la serie 40.
- **Opciones de despliegue**: vLLM, Text Generation Inference (TGI) y SGLang, tal como se indica en la model card. También es compatible con la librería transformers estándar.
- **Latencia y throughput**: no se proporcionan datos específicos, pero al ser un modelo de 0.5B con cuantización FP8, se espera una latencia de pocos milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2-0.5B (original) | 494M | 32K (no confirmado) | FP16/BF16 | Apache 2.0 (según original) | HuggingFace |
| liodon-ai/Qwen2-0.5B-FP8 | 494M | No disponible | FP8 dinámico | other | HuggingFace |
| liodon-ai/Qwen2-0.5B-imatrix-GGUF | 494M | No disponible | GGUF (varias cuantizaciones) | other | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, TinyLlama o Phi-2) en la información proporcionada. La principal diferencia entre el modelo original y esta variante FP8 es el tamaño (1.0 GB vs 0.6 GB) y la velocidad de inferencia en hardware compatible, mientras que el rendimiento numérico debería ser prácticamente idéntico.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo base pequeño, tiene una capacidad limitada de razonamiento y puede generar contenido incoherente o alucinado, especialmente en tareas complejas.
- **Pérdida de precisión**: aunque la cuantización FP8 dinámica es de baja pérdida, pueden existir pequeñas diferencias numéricas respecto al modelo original en ciertos casos extremos.
- **Requisitos de hardware**: la ejecución FP8 nativa requiere GPUs con compute capability ≥ 8.9. En hardware más antiguo, la dequantización elimina las ventajas de velocidad y memoria.
- **Licencia**: la licencia "other" no especifica los términos exactos. Se recomienda contactar al autor o consultar la licencia del modelo base Qwen2-0.5B (que es Apache 2.0) para determinar si el uso comercial está permitido.
- **Idiomas**: no se especifican los idiomas soportados; aunque el base Qwen2 es multilingüe, esta variante no confirma su cobertura.
- **Contexto**: no se indica la longitud de contexto soportada; se recomienda asumir la del modelo base (32K) solo si se confirma con la documentación oficial.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/liodon-ai/Qwen2-0.5B-FP8)
- [Modelo base Qwen/Qwen2-0.5B](https://huggingface.co/Qwen/Qwen2-0.5B)
- [Repositorio llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Página web de Liodon AI](https://liodon.ai/)
- [Documentación de Qwen2 (GitHub)](https://github.com/QuantumEclipseAI/Qwen2)
