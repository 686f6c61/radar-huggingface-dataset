# NoxNotreve/Bonsai-4B-gguf

## Resumen

Bonsai-4B es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por Prism ML, presentado en su variante GGUF de cuantización 1-bit. Este modelo denso está basado en la arquitectura Qwen3-4B, con 36 bloques Transformer, atención por grupos (GQA) con 32 cabezas de consulta y 8 cabezas de clave/valor, y una ventana de contexto de 32.768 tokens. La versión cuantizada publicada en este repositorio (NoxNotreve/Bonsai-4B-gguf) es un reempaquetado del modelo original de Prism ML, que incluye pesos 1-bit en todas las capas, incluyendo embeddings, proyecciones de atención y MLP, y la cabeza de salida.

El modelo está diseñado para ejecutarse en dispositivos con recursos muy limitados, como móviles, wearables o GPUs de gama baja, gracias a su tamaño desplegado de solo 0,57 GB (14,2 veces menor que la versión FP16). Es compatible con llama.cpp en CUDA, Metal y CPU, y también existe una versión MLX para Apple Silicon. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para despliegues en el borde (edge).

La relevancia de este modelo radica en su enfoque extremo de cuantización 1-bit, que reduce drásticamente los requisitos de memoria y mejora la velocidad de inferencia, aunque a costa de una posible pérdida de calidad en comparación con modelos de mayor precisión. Es una propuesta interesante para escenarios donde el tamaño y la latencia son críticos y la calidad generativa puede ser sacrificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B dense: GQA (32 query / 8 KV heads), SwiGLU MLP, RoPE, RMSNorm, 36 capas |
| Parametros totales | 4.021.784.576 (4,0B, ~3,6B no embedding) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF Q1_0 (1-bit, escala FP16 por grupo de 128) |
| Idiomas soportados | no disponible (probablemente multilingüe por base Qwen3, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF Q1_0 (safetensors originales en modelo base) |

## Arquitectura y entrenamiento

Bonsai-4B es un modelo denso basado en la arquitectura Qwen3-4B, con 36 bloques Transformer y atención de cabezas agrupadas (GQA). La capa de atención usa 32 cabezas de consulta y 8 cabezas de clave/valor, MLP con activación SwiGLU, posicionales RoPE y normalización RMSNorm. El vocabulario tiene 151.936 tokens, lo que permite un contexto de 32.768 tokens. El modelo original se entrenó con datos de texto y se ha cuantizado end-to-end a 1-bit, es decir, cada peso se representa con un solo bit (0 o 1) y se comparte una escala FP16 por cada grupo de 128 pesos. Esta técnica reduce drásticamente el tamaño del modelo (0,57 GB en GGUF) y acelera la inferencia, aunque puede degradar la calidad en tareas complejas. No se dispone de información sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el modelo puede producir respuestas coherentes a instrucciones y preguntas, aunque la calidad puede ser menor que la de modelos de mayor precisión.
- Razonamiento básico: hereda las capacidades del modelo base Qwen3-4B, que incluyen razonamiento lógico, matemático y comprensión de contexto, pero con posibles limitaciones por la cuantización.
- Soporte de conversación multi-turno: el formato de chat está integrado en el GGUF (chat template), permitiendo mantener diálogos.
- Capacidades multilingües: no hay confirmación explícita, pero Qwen3-4B es multilingüe; no obstante, la cuantización puede afectar el rendimiento en idiomas menos comunes.
- Sin soporte documentado para tool calling, function calling ni agentes: la model card no menciona estas capacidades, por lo que no se puede asumir que funcionen correctamente.

## Casos de uso

- **Asistente conversacional en dispositivos móviles**: gracias a su tamaño de 0,57 GB y soporte para Metal y CUDA, puede ejecutarse en smartphones con GPU integrada, ofreciendo respuestas a preguntas frecuentes sin conexión.
- **Chatbot de atención al cliente en el borde**: se puede desplegar en servidores con GPUs modestas (por ejemplo, una RTX 2060) para gestionar consultas simples de usuarios, con latencia baja gracias a la cuantización.
- **Aplicaciones de escritura asistida en equipos con poca memoria**: para generar borradores de correos, resúmenes o reescritura de texto en ordenadores con 4-8 GB de RAM, usando CPU con llama.cpp.
- **Sistema de generación de código en entornos sin GPU**: aunque no se garantiza la calidad, puede asistir en autocompletar código simple en editores ligeros.
- **Prototipado rápido de aplicaciones de IA**: los desarrolladores pueden probar la integración de llama.cpp y el formato GGUF Q1_0 para validar la viabilidad de un producto antes de escalar a modelos mayores.
- **Investigación en cuantización extrema**: sirve como referencia para estudios sobre el impacto de la cuantización 1-bit en la calidad de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Tampoco se ofrecen comparaciones cuantitativas con otros modelos más allá de la reducción de tamaño y velocidad relativa (14.2x menor que FP16, 4.2x más rápido en RTX 4090 según la descripción, sin cifras concretas de rendimiento en tareas específicas).

## Requisitos de hardware

- **VRAM estimada para inferencia**: el peso GGUF es de 0,57 GB, por lo que cualquier GPU con más de 1 GB de VRAM puede cargarlo. En CPU, se necesita aproximadamente 0,6 GB de RAM.
- **GPUs recomendadas**: funciona en CUDA (RTX serie 30/40, datacenter) y Metal (Mac). En RTX 4090 se menciona una mejora de 4.2x en velocidad frente a FP16, pero no se dan cifras absolutas.
- **Cabe en consumer GPU**: sí, en prácticamente cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas integradas.
- **Opciones de despliegue**: llama.cpp (con fork de Prism ML para kernels Q1_0), llama-server, MLX (para Apple Silicon), y MLX-Swift para iOS/macOS.
- **Latencia y throughput**: no hay datos concretos. El modelo es 4.2x más rápido que FP16 en RTX 4090, pero no se especifican tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo para Bonsai-4B frente a otros modelos de tamaño similar. Estructuralmente se puede comparar con:

| Modelo | Parámetros | Contexto | Formato | Licencia | Peso desplegado |
|---|---|---|---|---|---|
| Bonsai-4B (GGUF Q1_0) | 4,0 B | 32.768 | GGUF | Apache 2.0 | 0,57 GB |
| Qwen2.5-4B (GGUF Q4_K_M) | 4,0 B | 32.768 | GGUF | Apache 2.0 | ~2,3 GB |
| Llama-3.2-3B (GGUF Q4_K_M) | 3,2 B | 8.192 | GGUF | Llama 3.2 Community | ~2,0 GB |

Nota: los pesos de Qwen2.5-4B y Llama-3.2-3B son aproximados y dependen de la cuantización. Bonsai-4B ofrece una reducción de tamaño mucho mayor que las cuantizaciones estándar (Q4_K_M), pero no hay datos que comparen la calidad de salida.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización 1-bit**: la representación binaria de los pesos puede degradar la fluidez, la coherencia y la precisión en tareas complejas (razonamiento matemático, código, etc.) en comparación con modelos de mayor precisión.
- **Sesgos y alucinaciones**: al ser un modelo basado en Qwen3-4B, hereda los sesgos de su entrenamiento y puede generar información falsa o inventada, especialmente en temas sensibles.
- **Idiomas**: no se confirma la cobertura multilingüe; el rendimiento en idiomas distintos al inglés puede ser inferior.
- **Dependencia de kernels específicos**: la cuantización Q1_0 requiere un fork de llama.cpp con kernels especializados (CUDA/Metal). El uso de la versión oficial de llama.cpp podría no soportar el formato.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar las patentes o marcas asociadas a Prism ML.
- **Sin soporte de herramientas**: no hay indicación de que el modelo soporte function calling o uso de agentes, por lo que no es adecuado para aplicaciones que requieran integración con APIs externas.

## Enlaces

- [HuggingFace - NoxNotreve/Bonsai-4B-gguf](https://huggingface.co/NoxNotreve/Bonsai-4B-gguf)
- [Modelo base: prism-ml/Bonsai-4B-unpacked](https://huggingface.co/prism-ml/Bonsai-4B-unpacked)
- [Whitepaper (PDF)](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/1-bit-bonsai-8b-whitepaper.pdf)
- [Demo y ejemplos (GitHub)](https://github.com/PrismML-Eng/Bonsai-demo)
- [Google Colab](https://colab.research.google.com/drive/1EzyAaQ2nwDv_1X0jaC5XiVC3ZREg9bdG?usp=sharing)
- [Fork de llama.cpp (CUDA + Metal)](https://github.com/PrismML-Eng/llama.cpp)
- [Fork de MLX (Apple Silicon)](https://github.com/PrismML-Eng/mlx)
- [Fork de mlx-swift (iOS/macOS)](https://github.com/PrismML-Eng/mlx-swift)
- [Sitio web de Prism ML](https://prismml.com)
- [Documentación de Bonsai 4B](https://docs.prismml.com/models/bonsai-4b)
