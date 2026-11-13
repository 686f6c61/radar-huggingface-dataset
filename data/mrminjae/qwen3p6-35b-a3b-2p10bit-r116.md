# mrminjae/qwen3p6-35b-a3b-2p10bit-r116

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r116) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, consistente en una versión cuantizada de forma selectiva del modelo base Qwen/Qwen3.6-35B-A3B. La particularidad técnica es que solo los expertos enrutados del modelo MoE se almacenan a una media de 2,10 bits por peso, mientras que el resto de los pesos (atención, embeddings, router, capas densas) permanecen en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que el artefacto carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización especiales.

El modelo base es un Mixture-of-Experts de Qwen con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token (de ahí el sufijo A3B). Esta ficha se centra en el checkpoint r116, un experimento de compresión agresiva orientado a reducir el espacio en disco y el ancho de banda de memoria en inferencia manteniendo el resto de la red en precisión completa.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigación interna (identificador r116) sin model card detallada, sin resultados de benchmarks publicados, con cero descargas y sin licencia especificada de forma explícita más allá de la herencia del modelo base. No debe confundirse con un lanzamiento oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, según modelo base Qwen3.6-35B-A3B |
| Parametros totales | 35 mil millones (heredado del nombre del modelo base) |
| Parametros activos | aproximadamente 3 mil millones (sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | sigue la licencia del modelo base (no especificada en la información disponible) |
| Formato de pesos | safetensors (BF16 dequantizado), compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

El checkpoint r116 no introduce cambios arquitectónicos respecto al modelo base: es un transformer con capas de mezcla de expertos (MoE) en las que, por token, se activa un subconjunto reducido de parámetros (del orden de 3B sobre 35B totales). La modificación del checkpoint consiste exclusivamente en una cuantización selectiva post-entrenamiento: los tensores correspondientes a los expertos enrutados se comprimen a una media de 2,10 bits por peso, mientras que el resto de la red (atención, embeddings, router y capas no expertas) se conserva en BF16. Los pesos se almacenan ya dequantizados en BF16, por lo que el ahorro se materializa en el tamaño del repositorio (21,5 GB) y no en kernels de cómputo de baja precisión en tiempo de ejecución.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre la metodología exacta de cuantización empleada en r116 (algoritmo, calibración, granularidad por grupo). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El propio autor describe el artefacto como un checkpoint de investigación interna.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento y conocimiento general: capacidades del modelo base, no verificadas de forma independiente en este checkpoint.
- Generación de código y matemáticas: presumiblemente presente por herencia del modelo base, sin datos publicados que lo confirmen en la versión cuantizada.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking, visión o audio: no documentado.
- Carga directa con `transformers` y vLLM estándar al estar los pesos en BF16.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint permite estudiar el impacto de comprimir expertos a 2,10 bits mientras el resto de la red permanece en BF16, comparando calidad frente al modelo base en tareas controladas.
- Evaluación de degradación por capa: al mantener atención y router en BF16, sirve para aislar cuánto de la pérdida de calidad proviene exclusivamente de los expertos.
- Experimentos en entornos con memoria limitada: con 21,5 GB de pesos en BF16, permite cargar un MoE de 35B en GPUs donde el modelo base completo no cabría, a costa de posibles pérdidas de calidad.
- Prototipado de pipelines de generación de texto con `transformers`: al cargar con la librería estándar, se puede integrar en scripts de evaluación sin kernels personalizados.
- Servido con vLLM para pruebas de throughput: el checkpoint es compatible con vLLM, lo que permite medir latencia y rendimiento en despliegues de investigación.
- Reproducibilidad de experimentos internos: útil para replicar los resultados del identificador r116 dentro de un grupo de investigación.
- Comparación de estrategias de compresión: punto de referencia frente a cuantizaciones GGUF o AWQ del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 21,5 GB en safetensors BF16, lo que marca el mínimo de VRAM para cargar los pesos.
- VRAM estimada para inferencia: al menos ~22 GB solo para pesos; con caché KV y overhead de runtime, se recomienda 24 GB o más para contextos cortos, y 40-80 GB para contextos largos (la longitud de contexto no está documentada).
- GPU consumer: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) para contextos moderados; en 16 GB no cabe sin cuantización adicional.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 son opciones holgadas para servir el modelo con contexto amplio.
- Despliegue: `transformers` y vLLM según el autor; llama.cpp y Ollama no están confirmados para este formato BF16 dequantizado.
- Latencia y throughput: no disponibles; al ejecutarse en BF16 no se beneficia de kernels de baja precisión, por lo que el rendimiento de cómputo será similar al de un modelo BF16 del mismo tamaño en memoria.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r116 | 35B / ~3B | no disponible | heredada del base (no especificada) | safetensors BF16 dequantizado | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B / ~3B | no disponible | no disponible | safetensors | Hugging Face, modelo oficial |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 35B / ~3B | depende de la variante | según autor | GGUF, safetensors | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- Checkpoint de investigación interna sin model card completa: faltan idiomas, contexto, licencia explícita y metodología de cuantización.
- La cuantización a 2,10 bits de media en los expertos puede degradar de forma notable la calidad frente al modelo base; no hay evaluaciones publicadas que lo cuantifiquen.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Licencia no especificada de forma explícita; el autor indica que sigue la del modelo base, por lo que el uso comercial queda sujeto a los términos de Qwen, que no se detallan aquí.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente amplificado por la compresión agresiva.
- Sesgos desconocidos: no documentados.
- Al almacenarse en BF16 dequantizado, no se obtienen ventajas de velocidad de cómputo, solo de tamaño en disco y memoria.
- No recomendado para producción sin una evaluación propia de calidad frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r116
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
