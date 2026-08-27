# FastFlowLM/Qwen3.5-9B-gguf

## Resumen

FastFlowLM/Qwen3.5-9B-gguf es un empaquetado en formato GGUF del modelo multimodal Qwen3.5-9B, desarrollado por Alibaba Qwen y distribuido por FastFlowLM, una herramienta especializada en ejecutar modelos de lenguaje en NPUs AMD Ryzen AI. Este build incluye dos archivos: el modelo de lenguaje cuantizado en q4_k (con la cabeza de salida en q8_0) y un proyector multimodal de visión en BF16, necesarios ambos para procesar entradas de imagen. El modelo base, Qwen3.5-9B, es un modelo causal de lenguaje con codificador de visión, diseñado para tareas de razonamiento, codificación, agentes y comprensión visual, con una arquitectura híbrida que combina Gated Delta Networks y atención gated.

Con 8.960.094.720 parámetros (aproximadamente 9B), el modelo ofrece una ventana de contexto nativa de 262.144 tokens, ampliable hasta 1.010.000 tokens, lo que lo hace adecuado para tareas que requieren procesar documentos largos o conversaciones extensas. Su licencia Apache 2.0 permite uso comercial sin restricciones, y al estar cuantizado en GGUF, puede ejecutarse en hardware de consumo, incluidas NPUs AMD Ryzen AI, GPUs con VRAM moderada o CPU mediante llama.cpp. La relevancia actual radica en su combinación de capacidades multimodales, eficiencia arquitectónica y soporte para despliegue en entornos edge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 8.960.094.720 (8,96B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | q4_k (LM head en q8_0), proyector multimodal en BF16 |
| Idiomas soportados | no disponible (el modelo base declara 201 lenguas, pero no se confirma en este build) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (q4_k) y mmproj BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal con estado recurrente) con capas de atención gated tradicionales. La configuración interna incluye 32 capas, con un layout de 8 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque de Gated Attention con FFN. La dimensión oculta es de 4096, con 32 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128), y 16 cabezas para Q y 4 para KV en la atención gated (dimensión de cabeza 256, RoPE de 64 dimensiones). El FFN tiene una dimensión intermedia de 12288. El modelo incorpora un módulo de predicción multi-token (MTP) entrenado con multi-steps, lo que acelera la inferencia especulativa.

El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento, con un enfoque en fusión temprana de tokens multimodales para lograr paridad con modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual. Se destaca el escalado de aprendizaje por refuerzo (RL) en entornos con millones de agentes y distribuciones de tareas progresivamente complejas, así como una infraestructura de entrenamiento multimodal con eficiencia cercana al 100% respecto al entrenamiento solo de texto. No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con rendimiento destacado en benchmarks de conocimiento y STEM (MMLU-Pro 82.5).
- Comprensión y generación multimodal: procesa entradas de imagen junto con texto, gracias al proyector de visión BF16 incluido en el paquete GGUF.
- Soporte para tareas de codificación y agentes, según los benchmarks del modelo base.
- Capacidad de razonamiento multi-step y adaptación a tareas de agente, potenciada por el escalado de RL.
- Ventana de contexto larga (262K nativo, hasta 1M), adecuada para documentos extensos y conversaciones de muchos turnos.
- Soporte multilingüe declarado por el modelo base (201 lenguas), aunque no se confirma en este build específico.
- Compatible con herramientas de inferencia como llama.cpp, Ollama, vLLM y SGLang (en sus formatos nativos), además de FastFlowLM para NPUs AMD.

## Casos de uso

- Asistentes de atención al cliente con entrada visual: el modelo puede analizar capturas de pantalla o fotos de productos enviadas por el usuario y responder con contexto, gracias a su capacidad multimodal y ventana de 262K tokens para mantener historiales largos.
- Extracción de información de documentos escaneados: combina OCR visual con razonamiento textual para resumir facturas, contratos o formularios, aprovechando la cuantización q4_k para ejecutarse en hardware de bajo consumo.
- Generación de código con contexto visual: un desarrollador puede adjuntar un diagrama o captura de una interfaz y pedir al modelo que genere el código correspondiente, usando el proyector de visión y las capacidades de codificación del modelo base.
- Análisis de imágenes médicas o técnicas en entornos con recursos limitados: el modelo puede describir hallazgos en radiografías o planos, aunque no está especializado en diagnóstico, sirve como asistente de documentación.
- Chatbots conversacionales multilingües en dispositivos edge: gracias a su tamaño compacto (9B) y cuantización GGUF, puede desplegarse en portátiles con NPU AMD Ryzen AI o GPUs de gama media para ofrecer respuestas en múltiples idiomas.
- Procesamiento de documentos legales o académicos extensos: la ventana de contexto de hasta 1M tokens permite resumir tesis, contratos o informes completos sin truncamiento, con entrada de imágenes de gráficos o tablas.

## Benchmarks y rendimiento

La información disponible solo incluye el resultado de MMLU-Pro para el modelo base Qwen3.5-9B, junto con comparaciones de otros modelos en la misma tabla. No se han publicado resultados adicionales de benchmarks (HumanEval, GSM8K, etc.) en la documentación proporcionada.

| Benchmark | Qwen3.5-9B | Qwen3.5-4B | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30B-A3B-Thinking-2507 |
|---|---|---|---|---|---|---|
| MMLU-Pro | 82.5 | 79.1 | 80.8 | 74.8 | 82.7 | 80.9 |

Nota: estos valores corresponden al modelo base sin cuantizar. La versión GGUF q4_k puede presentar una ligera degradación, no cuantificada en la información disponible. FastFlowLM publica benchmarks de rendimiento en NPU en su sitio web, pero los datos no se han incluido aquí por falta de detalle.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo q4_k del modelo de lenguaje ocupa aproximadamente 5-6 GB (el repo completo es de 15.4 GB, incluyendo el proyector BF16). Con overhead de contexto, se recomiendan al menos 8 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, RTX 4070 o superiores. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatible con NPUs AMD Ryzen AI (por ejemplo, Ryzen AI 300 series) mediante FastFlowLM, que está optimizado para estas unidades.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para el formato Transformers original), SGLang, y FastFlowLM para NPU.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B (este build) | 8,96B | 262K (ext. 1M) | 82.5 | Apache 2.0 | GGUF |
| Qwen3.5-4B | ~4B | no disponible | 79.1 | Apache 2.0 | Transformers/GGUF |
| GPT-OSS-20B | 20B | no disponible | 74.8 | Apache 2.0 | Transformers |
| Qwen3-30B-A3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | 80.9 | Apache 2.0 | Transformers |

El modelo Qwen3.5-9B supera en MMLU-Pro a GPT-OSS-20B y a Qwen3-30B-A3B, a pesar de tener menos parámetros, gracias a su arquitectura híbrida y al escalado de RL. Frente a Qwen3.5-4B, ofrece una ventaja de 3.4 puntos en el mismo benchmark, con un coste de memoria mayor pero aún manejable en hardware de consumo.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación en tareas de razonamiento o generación de código, especialmente con entradas ambiguas o fuera de distribución.
- La cuantización q4_k puede degradar ligeramente la precisión en tareas numéricas o de razonamiento complejo, aunque no se han cuantificado las pérdidas en este build.
- El soporte multilingüe declarado (201 lenguas) proviene del modelo base, pero no se ha verificado en esta versión GGUF; se recomienda probar con idiomas específicos.
- El proyector multimodal BF16 es necesario para entradas de imagen; si se omite, el modelo solo funcionará en modo texto.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente la autoría del modelo original (Qwen) y de FastFlowLM.
- Para producción, se recomienda validar el rendimiento en el hardware objetivo, ya que la inferencia en NPU puede tener limitaciones de memoria o compatibilidad con ciertas operaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FastFlowLM/Qwen3.5-9B-gguf
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- FastFlowLM (documentación y benchmarks): https://fastflowlm.com/docs/benchmarks/qwen3.5_results/
- Catálogo de modelos FastFlowLM: https://fastflowlm.com/models/
- Repositorio GitHub de FastFlowLM: https://github.com/ROCm/FastFlowLM
- Releases de FastFlowLM: https://github.com/ROCm/FastFlowLM/releases
- Modelo FastFlowLM/Qwen3.5-9B-NPU2: https://huggingface.co/FastFlowLM/Qwen3.5-9B-NPU2
