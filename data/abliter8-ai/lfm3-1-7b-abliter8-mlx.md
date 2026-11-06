# abliter8-ai/lfm3-1.7b-abliter8-mlx

## Resumen

LFM3-1.7B-Abliter8 es una versión editada del modelo LiquidAI/LFM3-1.7B, publicada por el colectivo abliter8-ai. Se trata de un modelo de texto de 1,73 mil millones de parámetros con una ventana de contexto de 256K tokens, al que se le ha aplicado una técnica de *abliteration* (sustracción de proyección de rango uno sobre matrices residuales) para reducir la tendencia aprendida a rechazar peticiones. El resultado es un modelo que responde de forma más directa ante temas sensibles, terminología controvertida o escenarios de ficción, manteniendo intactas las capacidades del modelo original.

La arquitectura subyacente es híbrida: 24 capas que combinan 13 convoluciones cortas con compuerta, cinco capas de atención de ventana deslizante y seis capas de atención global. Está diseñada por Liquid AI para inferencia local eficiente, y en este caso se distribuye en formato MLX (para Apple Silicon) y GGUF (para llama.cpp y derivados). El modelo base destaca en evaluaciones de agentes y uso de herramientas para su tamaño, aunque no es un sustituto general de modelos más grandes en razonamiento complejo.

La relevancia de esta ficha radica en que documenta una edición no oficial: los pesos han sido modificados respecto al original, y los benchmarks publicados por Liquid AI corresponden al modelo sin editar. Cualquier evaluación de producción debe realizarse sobre estos pesos concretos, no sobre los del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 13 convoluciones cortas con compuerta, 5 capas de atención de ventana deslizante, 6 capas de atención global (24 capas) |
| Parámetros totales | 1,73 mil millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (según el modelo base; no requalificado en esta edición) |
| Tipos de cuantización | MLX: 8-bit, 6-bit, 4-bit. GGUF: Q8_0, Q6_K, Q4_K_M, Q4_0, NVFP4/Q8_0 (experimental) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (Other, enlazada al modelo base LiquidAI) |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer híbrido de 24 capas que intercala tres tipos de bloque: 13 convoluciones cortas con compuerta, cinco capas de atención de ventana deslizante y seis capas de atención global. Esta combinación busca reducir el coste computacional de la atención completa manteniendo la capacidad de modelar dependencias de largo alcance, lo que encaja con su ventana de 256K tokens y con un objetivo de inferencia local eficiente.

Sobre el modelo base no se dispone de información detallada en esta ficha acerca del número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles en la información proporcionada. La edición Abliter8 no añade entrenamiento ni ajuste fino: aplica la transformación `W' = W - 2 r (r^T W)` a 32 matrices residuales de las capas 8 a 23 (`self_attn.o_proj`, `feed_forward.w2` y `conv.out_proj`), con una dirección `r` ajustada sobre las activaciones del propio modelo. Una auditoría en BF16 confirma que el resto de tensores y los ficheros de procesador/codec permanecen sin cambios. La conversión a MLX cuantiza el backbone de lenguaje y mantiene sin cuantizar los componentes multimodales (en las variantes VL y Omni del modelo base).

## Capacidades

- Generación de texto y razonamiento de propósito general, con ventana de contexto de hasta 256K tokens.
- Uso de herramientas (*tool calling* / *function calling*), con buen rendimiento declarado en BFCL V4 para su clase de tamaño.
- Soporte de agentes y razonamiento multi-paso, orientado a aplicaciones de recuperación aumentada (RAG).
- Salida estructurada, adecuada para pipelines que requieren JSON u otros formatos parseables.
- Reducción de rechazos: en la prueba de 100 prompts del editor, el modelo original fue marcado en 96/100 y la edición Q8 en 0/100 (mide disposición a responder, no corrección).
- Capacidades multimodales: no disponibles en esta variante de texto; las variantes VL y Omni del modelo base conservan sus codificadores de visión y audio, pero esta ficha describe los pesos de texto.

## Casos de uso

- Asistente local de uso de herramientas: el modelo puede gestionar llamadas a funciones y salidas estructuradas en un equipo de sobremesa, gracias a sus 1,73B parámetros y a la disponibilidad de cuantizaciones de 4 a 8 bits.
- RAG sobre documentación extensa: la ventana de 256K tokens permite incluir grandes bloques de contexto recuperado sin truncar, y la reducción de falsos rechazos ayuda cuando los documentos contienen terminología sensible.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo, desplegable en local o en servidores modestos, con la advertencia de que el conocimiento complejo sigue siendo limitado para su tamaño.
- Generación de código en pipelines de CI/CD: soporta tool calling y salida estructurada, lo que facilita integrarlo en flujos de revisión o generación de parches acotados.
- Procesamiento de documentos con contenido sensible: la edición reduce los rechazos espurios al resumir o clasificar material controvertido, adulto o de ficción, siempre que la tarea sea de extracción y no de razonamiento profundo.
- Prototipado de agentes en Apple Silicon: la distribución MLX con cuantización de 4 a 8 bits permite ejecutar el modelo en portátiles y equipos de sobremesa con memoria unificada.
- Aplicaciones de escritura creativa con temáticas adultas o controvertidas: el modelo responde de forma más directa, aunque la calidad literaria y la coherencia a contextos muy largos no están garantizadas por los datos disponibles.

## Benchmarks y rendimiento

Los siguientes resultados son los publicados por el editor sobre las cuantizaciones GGUF, comparando con el modelo de texto original en F16 (perplejidad de referencia 20,935):

| GGUF | Rechazos estrictos /100 | Falsos rechazos XSTest /100 | KLD media | Perplejidad | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 0 | 1 | 0,03323 | 20,988 | 90,86% |
| Q6_K | 0 | 0 | 0,04145 | 20,876 | 89,84% |
| Q4_K_M | 0 | 0 | 0,11756 | 22,214 | 83,69% |
| Q4_0 | 0 | 1 | 0,19994 | 24,121 | 78,39% |

Resultados MLX, medidos como deriva de cuantización respecto al maestro BF16 editado en el mismo runtime (perplejidad de referencia BF16: 17,411; 2.048 posiciones de WikiText):

| MLX | Rechazos estrictos /100 | Falsos rechazos XSTest /100 | KLD media | Perplejidad | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| 8-bit | 0 | 0 | 0,00237 | 17,496 | 97,07% |
| 6-bit | 0 | 0 | 0,01176 | 17,454 | 94,04% |
| 4-bit | 0 | 0 | 0,22634 | 22,309 | 74,66% |

Benchmarks del modelo base sin editar, según Liquid AI (no reejecutados sobre esta edición):

| Benchmark | LFM3-1.7B | Qwen3.5-4B | Qwen3.5-9B |
|---|---:|---:|---:|
| BFCL V4 | 71,39 | 55,12 | 62,83 |
| GPQA Diamond | 63,37 | No disponible | 80,40 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,75 GB para la cuantización NVFP4/Q8_0 experimental; entre 1 y 2 GB para GGUF Q4; en torno a 2 GB para Q8_0 y 3,5 GB para BF16 (estimación a partir del tamaño del repositorio de 4,2 GB y del número de parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits; A100, H100 o RTX 4090 para despliegues con mayor concurrencia o contexto largo.
- Compatibilidad con GPU de consumo: sí, en RTX 3060/4060 y superiores para cuantizaciones de 4 a 8 bits; también en Apple Silicon mediante MLX con memoria unificada.
- Opciones de despliegue: llama.cpp y derivados para GGUF (Ollama, LM Studio), MLX para Apple Silicon, y servidores compatibles con GGUF; el editor mantiene instrucciones CUDA para la variante NVFP4 en su repositorio de serving.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL V4 | GPQA Diamond | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| LFM3-1.7B-Abliter8 | 1,73B | 256K | 71,39 (base) | 63,37 (base) | lfm1.0 | MLX y GGUF |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | 71,39 | 63,37 | lfm1.0 | Pesos originales |
| Qwen3.5-4B | 4B (aprox.) | No disponible | 55,12 | No disponible | No disponible | No disponible |
| Qwen3.5-9B | 9B (aprox.) | No disponible | 62,83 | 80,40 | No disponible | No disponible |

La comparación con Qwen3.5 se basa únicamente en las cifras citadas por Liquid AI en su model card; no se dispone de datos de contexto ni de licencia de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- La abliteración reduce la tendencia a rechazar, pero no añade conocimiento, razonamiento ni nuevas modalidades; puede aumentar la probabilidad de respuestas incorrectas o inapropiadas en temas sensibles.
- Los benchmarks de BFCL V4 y GPQA Diamond corresponden al modelo original de Liquid AI y no han sido reejecutados sobre esta edición; no deben atribuirse a estos pesos.
- La ventana de 256K tokens no ha sido requalificada en esta edición; el rendimiento en contextos muy largos no está verificado.
- Los resultados de rechazos se basan en un detector de palabras clave en primera persona sobre 100 prompts, no en una evaluación semántica de cumplimiento dañino.
- Riesgo de alucinación inherente a un modelo de 1,73B parámetros; no es adecuado para trabajo de conocimiento difícil o razonamiento complejo.
- La licencia lfm1.0 es de tipo "other" y remite a la licencia del modelo base; deben revisarse las condiciones de uso comercial antes de desplegarlo en producción.
- Idiomas soportados no disponibles; no se garantiza un rendimiento multilingüe equilibrado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026; se trata de una publicación reciente y sin validación comunitaria amplia.
- La variante NVFP4/Q8_0 es experimental y solo doce tensores de compuerta usan NVFP4; el resto permanece en Q8_0 o precisión base.

## Enlaces

- Modelo en Hugging Face (MLX): https://huggingface.co/abliter8-ai/lfm3-1.7b-abliter8-mlx
- Pesos GGUF: https://huggingface.co/abliter8-ai/lfm3-1.7B-abliter8-gguf
- Colección Abliter8 para LFM3: https://huggingface.co/collections/abliter8-ai/lfm3-abliter8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Model card del modelo base (referencia de benchmarks): https://huggingface.co/LiquidAI/LFM3-1.7B/blob/40ebe0aa6662c9d40389c2f5d565b6a2c6aebacd/README.md
- Repositorio de serving con instrucciones CUDA: https://github.com/abliter8-ai/lfm3-abliter8-serving/blob/main/docs/nvidia.md
- Sitio del editor: https://abliter8.ai
