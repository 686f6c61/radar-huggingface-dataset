# prakhar131003/Qwen3.6-35B-A3B-YMQ

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3.6-35B-A3B, desarrollado por el equipo de Qwen. El autor, prakhar131003, ha aplicado la metodología YMQ-Compiler v2.0 con calibración basada en la importance matrix de Bartowski V6 para generar cinco variantes de cuantización optimizadas para inferencia local en llama.cpp. El modelo base es una arquitectura Mixture of Experts (MoE) con 35 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token, lo que permite un rendimiento elevado con un coste computacional moderado. Su ventana de contexto es de 262 144 tokens, y el modelo se distribuye bajo licencia Apache 2.0.

La relevancia de este repositorio radica en que permite ejecutar un modelo de 35 000 millones de parámetros en hardware de consumo, gracias a la cuantización selectiva por importancia. A diferencia de la cuantización uniforme, YMQ-Compiler clasifica los 753 tensores del modelo en cinco niveles de importancia, protegiendo las capas críticas y comprimiendo agresivamente los expertos MoE menos utilizados. Esto reduce el tamaño del modelo desde los 66.2 GB originales (F16) hasta un rango de 11.97 a 22.46 GB, según la variante.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture of Experts) |
| Parámetros totales | 35 000 millones (35B) |
| Parámetros activos | ~3 000 millones (3B) por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | YMQ-XS (BPW 2.9), YMQ-S (BPW 3.2), YMQ-M (BPW 3.9), YMQ-L (BPW 4.5), YMQ-XL (BPW 5.1) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B utiliza una arquitectura MoE de la familia Qwen3.5, con 256 expertos y un total de 35 000 millones de parámetros, de los cuales aproximadamente 3 000 millones se activan por token. Esta configuración permite un equilibrio entre capacidad y eficiencia. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni la composición del dataset en la información proporcionada.

La innovación técnica destacada en este repositorio es la metodología de cuantización YMQ-Compiler v2.0, que utiliza una importance matrix generada con el dataset de calibración Bartowski V6. El algoritmo clasifica los 753 tensores del modelo en cinco niveles de importancia mediante detección de huecos en el espacio logarítmico, aplica una transición gradual de precisión en las capas 0-2, protege la capa de salida final, mantiene los tensores de atención K/V en Q8_0 y aplica una protección asimétrica a las embeddings y a la cabeza de salida. Esto se traduce en una cuantización por tensor que preserva la calidad en las partes críticas del modelo.

## Capacidades

- Generación de texto, razonamiento, código, matemáticas: no disponible. La información proporcionada no documenta las capacidades específicas del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: ventana de contexto de 262 144 tokens, que permite procesar documentos y conversaciones muy extensas. Además, la cuantización optimizada para MoE con 256 expertos es una capacidad técnica del repositorio, no del modelo base.

## Casos de uso

- Inferencia local en GPU consumer: gracias a las variantes de cuantización (desde 11.97 GB hasta 22.46 GB), el modelo puede ejecutarse en GPUs con 12-24 GB de VRAM, lo que lo hace accesible para desarrolladores sin infraestructura cloud.
- Asistente de código en local: con la variante YMQ-M (16.18 GB) y llama.cpp, se puede integrar en un editor como VS Code mediante extensiones compatibles con llama.cpp, aprovechando los 262 144 tokens de contexto para manejar repositorios de gran tamaño.
- Análisis de documentos largos: la ventana de contexto de 262 144 tokens permite procesar informes, contratos o bases de código completas en una sola pasada, algo inviable con modelos de contexto corto.
- Chatbot de atención al cliente con memoria extendida: en un despliegue con Ollama, se puede configurar un historial de conversación largo sin perder información relevante.
- Prototipado rápido en entornos con recursos limitados: la variante YMQ-XS (11.97 GB) con CPU offload permite ejecutar el modelo en máquinas con 8 GB de VRAM, útil para pruebas de concepto.
- Investigación sobre cuantización de MoE: el repositorio sirve como referencia para estudiar el impacto de la cuantización por importancia en modelos con 256 expertos, comparando los distintos niveles YMQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una afirmación del autor de que la variante YMQ-M a 15.4 GB supera a una cuantización uniforme Q4_K_M a 22.3 GB en perplejidad equivalente, pero no se aportan cifras ni metodología verificable. Por tanto, no es posible realizar una comparación cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: según el autor, para 8 GB de VRAM se recomienda YMQ-XS con CPU offload (11.97 GB); para 12 GB, YMQ-XS o YMQ-S (11.97 / 13.4 GB); para 16 GB, YMQ-M (16.18 GB); para 20 GB, YMQ-L (18.64 GB); para 24 GB o más, YMQ-XL (22.46 GB).
- GPU recomendadas: no se especifican modelos concretos. Por los tamaños, se puede inferir que las variantes YMQ-M y YMQ-L caben en GPUs consumer de 16-20 GB, como la RTX 4080 o la RTX 3090, mientras que YMQ-XL requiere una GPU de 24 GB, como la RTX 4090.
- Si cabe en consumer GPU: sí, todas las variantes están diseñadas para ejecutarse en GPUs consumer, con la posibilidad de offload a CPU en las de menor VRAM.
- Opciones de despliegue: llama.cpp, llama-cpp-python y Ollama, tal como se documenta en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B total, ~3B activos | 262 144 | Apache-2.0 | no disponible | 66.2 GB (F16) |
| Qwen3.6-35B-A3B-YMQ (YMQ-M) | 35B total, ~3B activos | 262 144 | Apache-2.0 | GGUF | 16.18 GB |
| Qwen3.6-27B (dense) | 27B | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a los datos disponibles. No se han publicado benchmarks que permitan comparar el rendimiento de estos modelos.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones del modelo base.
- La cuantización agresiva (YMQ-XS con BPW 2.9) puede degradar la calidad de salida, aunque no se aportan métricas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- La afirmación de rendimiento sobre YMQ-M vs Q4_K_M no está respaldada por benchmarks publicados.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar la procedencia de los pesos.
- No se especifican restricciones de idioma, pero al no haber datos de idiomas, se desconoce el comportamiento multilingüe.

## Enlaces

- HuggingFace: https://huggingface.co/prakhar131003/Qwen3.6-35B-A3B-YMQ
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- YMQ-Compiler: https://github.com/YMQ-Compiler
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Bartowski's V6 imatrix dataset: https://huggingface.co/blog/bartowski/imatrix-dataset
- Guía de Qwen 3.6 en insiderllm.com: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
