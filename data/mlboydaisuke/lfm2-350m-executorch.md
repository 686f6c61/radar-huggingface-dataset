# mlboydaisuke/LFM2-350M-ExecuTorch

## Resumen

LFM2-350M-ExecuTorch es una exportación del modelo híbrido LFM2-350M de Liquid AI, convertida al formato ExecuTorch `.pte` con cuantización 8da4w (8 bits en activaciones, 4 bits en pesos) y embeddings de 8 bits. El autor, mlboydaisuke, ha preparado este artefacto para inferencia en dispositivos con CPU, utilizando el backend XNNPACK de ExecuTorch. El objetivo es ofrecer un modelo de generación de texto de 350 millones de parámetros que pueda ejecutarse en teléfonos, portátiles y otros dispositivos con recursos limitados, manteniendo una latencia baja.

El modelo base, desarrollado por Liquid AI, combina bloques de convolución LIV de doble compuerta con atención de query agrupada (GQA), logrando un rendimiento notable en CPU frente a alternativas como Qwen3. Esta versión ExecuTorch está pensada para desarrolladores que necesitan desplegar un LLM pequeño en entornos on-device sin depender de GPUs. La verificación del autor muestra una velocidad de decodificación de 144.8 tokens por segundo en un Mac con arquitectura arm64, con respuestas correctas a preguntas sencillas de conocimiento general y aritmética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 10 bloques LIV (convolución de doble compuerta) + 6 bloques GQA |
| Parametros totales | 354,5 millones (según documentación de Liquid AI) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (máximo en esta exportación ExecuTorch) |
| Tipos de cuantizacion | 8da4w (8-bit activaciones, 4-bit pesos) + 8-bit embeddings |
| Idiomas soportados | No disponible (no especificado por el autor) |
| Licencia | LFM Open License v1.0 (según model card; en HuggingFace figura como "other") |
| Formato de pesos | ExecuTorch `.pte` (252,8 MB) |

## Arquitectura y entrenamiento

El modelo base LFM2-350M es un transformer híbrido desarrollado por Liquid AI. Combina 10 bloques LIV (Linear Input-Value) con convoluciones de doble compuerta de corto alcance y 6 bloques de atención con query agrupada (GQA). Esta arquitectura híbrida reduce el coste computacional frente a un transformer puro, logrando un entrenamiento aproximadamente 3 veces más rápido que su predecesor y una decodificación y prefill 2 veces más rápidas en CPU comparado con Qwen3 de tamaño similar. El modelo fue entrenado con 10 billones de tokens (según la documentación de Liquid AI; la versión LFM2.5 posterior usa 28 billones).

La exportación a ExecuTorch se realizó con la versión 1.4.0, usando `export_llm` con forma estática (seq_len=1) y `max_seq_length` de 2048. Se activó `use_sdpa_with_kv_cache` para aprovechar la caché de KV, y se verificó que las dimensiones del modelo fueran divisibles por el tamaño de grupo del cuantizador. El autor también comprobó que todos los campos del JSON de parámetros fueran leídos correctamente por la ruta genérica, evitando problemas conocidos con otros modelos. El archivo resultante incluye kernels XNNPACK extendidos y requiere la carga de kernels cuantizados (`quantized_decomposed::embedding_byte.dtype_out`) en tiempo de ejecución.

## Capacidades

- Generación de texto: produce respuestas coherentes a preguntas directas, como se verificó con "capital of France?" y "17 times 4?".
- Razonamiento aritmético básico: resuelve operaciones simples (multiplicación) con precisión.
- Inferencia on-device: optimizado para CPU mediante XNNPACK, sin necesidad de GPU.
- Chat: usa plantilla ChatML con tokens especiales (bos=1, eos=[7]).
- No se han documentado capacidades de tool calling, agentes, visión ni audio en esta exportación.
- Multilingüismo: no especificado; el modelo base probablemente tenga soporte multilingüe, pero no hay datos confirmados.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede gestionar diálogos de corta duración con baja latencia gracias a su tamaño reducido y la optimización XNNPACK. Un desarrollador podría integrarlo en una app Android o iOS para responder preguntas frecuentes sin conexión.
- Autocompletado de texto en editores ligeros: al ser un modelo de 350M, puede ejecutarse en segundo plano en un portátil o tablet para sugerir continuaciones de frases en aplicaciones de notas o correo.
- Chatbots de soporte técnico embebidos: en entornos con recursos limitados (por ejemplo, routers o dispositivos IoT), el modelo puede ofrecer respuestas a consultas de configuración básica.
- Generación de respuestas en sistemas de atención al cliente por voz: con una latencia de decodificación de ~145 tok/s en CPU, es viable para interacciones de voz en tiempo real en dispositivos de gama media.
- Prototipado rápido de aplicaciones de IA generativa: los desarrolladores pueden usar este archivo `.pte` para validar ideas de producto sin necesidad de infraestructura en la nube.
- Educación y demostraciones: sirve para enseñar conceptos de LLMs on-device, ya que es pequeño, portable y no requiere GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una verificación manual en un Mac arm64 (2026-08-21) con los siguientes resultados:

| Prompt | Respuesta |
|---|---|
| "capital of France?" | "The capital of France is Paris." |
| "17 times 4?" | "17 times 4 is 68." |

La velocidad de decodificación medida fue de **144.8 tokens por segundo** en una sola pasada sobre el modelo, sin otras cargas. El autor advierte que esta cifra puede variar significativamente si el sistema está ocupado (midió una cuarta parte de esa velocidad mientras se ejecutaba una exportación en paralelo). No se midió en un teléfono real.

## Requisitos de hardware

- El archivo `.pte` ocupa 252,8 MB, por lo que cabe en la memoria de cualquier smartphone moderno.
- Inferencia en CPU: usa XNNPACK, que está optimizado para ARM y x86. No requiere GPU.
- VRAM: no aplica, ya que es una ejecución en CPU. En caso de usar GPU, el modelo es lo bastante pequeño para caber en la VRAM de cualquier GPU moderna, pero no es el objetivo.
- GPUs recomendadas: no necesarias; cualquier CPU con soporte XNNPACK (ARM64, x86-64) es suficiente.
- Opciones de despliegue: el formato `.pte` se ejecuta con ExecuTorch runtime. Se puede integrar en apps móviles mediante el runtime de ExecuTorch, o en servidores con `portable_lib._load_for_executorch`. No es compatible directamente con vLLM, llama.cpp u Ollama, que usan otros formatos.
- Latencia: ~144,8 tok/s en Mac arm64 (medición del autor). En dispositivos móviles reales se espera una cifra menor, no especificada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se presenta una comparación cualitativa basada en características conocidas:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2-350M (ExecuTorch) | 354,5M | 2048 (export) | Híbrido LIV + GQA | LFM Open License v1.0 | `.pte` |
| Qwen3-0.6B | ~600M | 32K (típico) | Transformer denso | Apache 2.0 | safetensors, GGUF |
| SmolLM2-135M | 135M | 2048 | Transformer denso | Apache 2.0 | safetensors, GGUF |

LFM2-350M es más pequeño que Qwen3-0.6B, pero su arquitectura híbrida le permite una decodificación más rápida en CPU. SmolLM2-135M es aún más ligero, pero con menos capacidad. No hay datos de rendimiento en tareas estándar para comparar directamente.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens en esta exportación; el modelo base podría soportar más, pero esta versión está fijada a ese valor.
- No se han evaluado sesgos ni alucinaciones en esta versión; el modelo base puede presentar los sesgos típicos de los LLMs entrenados con datos web.
- La licencia LFM Open License v1.0 tiene términos específicos; es necesario revisarlos antes de uso comercial. En HuggingFace figura como "other", lo que indica que no es una licencia estándar.
- El archivo `.pte` requiere kernels cuantizados específicos de ExecuTorch; si no se cargan correctamente, el modelo no se ejecutará (error `kernel 'quantized_decomposed::embedding_byte.dtype_out' not found`).
- No se ha verificado el funcionamiento en teléfonos reales; la medición de velocidad se realizó en un Mac arm64.
- El modelo no soporta tool calling ni funciones de agente, por lo que no es adecuado para aplicaciones que requieran interacción con APIs externas.
- La generación de texto puede ser incoherente en tareas complejas o de razonamiento multi-paso, dado su tamaño reducido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/LFM2-350M-ExecuTorch
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M
- Colección ExecuTorch Model Zoo: https://huggingface.co/collections/mlboydaisuke/executorch-model-zoo
- Ejemplo oficial de LFM2 en ExecuTorch: https://github.com/pytorch/executorch/tree/main/examples/models/lfm2
- Documentación de Liquid AI para LFM2-350M: https://docs.liquid.ai/lfm/models/lfm2-350m
- Scripts de conversión (executorch-models): https://github.com/john-rocky/executorch-models
- Muestra iOS (executorch-samples): https://github.com/john-rocky/executorch-samples
