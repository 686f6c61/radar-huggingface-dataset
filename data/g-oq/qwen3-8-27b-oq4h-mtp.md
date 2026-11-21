# g-oQ/Qwen3.8-27B-oQ4h-mtp

## Resumen

Qwen3.8-27B-oQ4h-mtp es una cuantización mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario g-oQ mediante la herramienta oQ (oMLX v0.8.2). El resultado es un checkpoint en formato MLX (safetensors) pensado para ejecución en Apple Silicon, con un tamaño de repositorio de 17,5 GB y un total de 7.212.759.280 parámetros almacenados. La nomenclatura "oQ4h" indica cuantización mixta con predominio de 4 bits y precisión elevada selectiva, mientras que "mtp" hace referencia a la presencia de una cabeza Multi-Token Prediction integrada en el checkpoint.

El checkpoint combina distintos niveles de precisión por tensor: bloques afines de 4, 5, 6 y 8 bits con grupo 64, junto con tensores en BF16 y U32. El promedio efectivo declarado por el autor es de 19,429 bits por peso, un valor muy superior al de una cuantización 4-bit homogénea, lo que refleja que una parte sustancial del almacenamiento corresponde a tensores en 32 bits (47,1 % de los pesos lógicos). El modelo incluye además un componente de visión (0,461B de parámetros) y una cabeza MTP (0,425B), lo que sugiere capacidades multimodales y decodificación especulativa.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de cuantización mixta orientada a MLX para modelos de gran tamaño; por otro, advierte de que la información pública disponible es muy limitada (sin model card descriptiva, sin licencia declarada, sin idiomas ni benchmarks), por lo que su evaluación rigurosa requiere consultar el modelo base original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); incluye componente de visión y cabeza MTP |
| Parámetros totales | 7.212.759.280 (7,213B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 4/5/6/8 bits grupo 64, BF16 y U32; promedio efectivo 19,429 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base Qwen/Qwen3.8-27B, etiquetado con la arquitectura `qwen3_5`. La información disponible no detalla la arquitectura interna del modelo original (número de capas, dimensión oculta, mecanismo de atención, uso de MoE, etc.), por lo que estos datos deben consultarse en la ficha del modelo base. Lo que sí se puede afirmar es que el checkpoint cuantizado conserva tres componentes diferenciados: el modelo de lenguaje (6,327B de pesos lógicos), un módulo de visión (0,461B) y una cabeza MTP (0,425B).

La cuantización se realizó con oQ (oMLX v0.8.2) en modo mixto, asignando precisión de forma selectiva: 0,330B en 4 bits, 1,303B en 5 bits, 1,271B en 6 bits, 0,010B en 8 bits, 0,900B en BF16 y 3,398B en U32. Esta distribución sugiere que ciertos tensores (probablemente embeddings, normas o componentes sensibles) se mantienen en 32 bits para preservar calidad, mientras que el grueso de las matrices lineales se comprime a 4-6 bits. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.8-27B, si bien no se documentan explícitamente en la información disponible.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,461B de parámetros, lo que indica soporte multimodal de entrada de imágenes.
- Decodificación especulativa: la presencia de una cabeza MTP (0,425B) permite acelerar la inferencia mediante predicción multi-token.
- Tool calling / function calling: no disponible en la información proporcionada; debe verificarse en el modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 17,5 GB permiten ejecutar el modelo en equipos Mac con memoria unificada de 32 GB o superior, usando la librería MLX y la herramienta oMLX. Es el caso de uso principal y más realista dado el formato del checkpoint.
- Aceleración de generación con MTP: la cabeza Multi-Token Prediction integrada permite implementar decodificación especulativa para reducir la latencia en tareas de generación larga, como resúmenes o redacción asistida.
- Procesamiento de documentos con imágenes: el módulo de visión posibilita tareas de extracción de información de capturas, gráficos o documentos escaneados, siempre que el modelo base confirme dicha capacidad.
- Prototipado de asistentes conversacionales: al ser un checkpoint cuantizado y ligero en comparación con el modelo original, resulta adecuado para entornos de desarrollo donde se necesita iterar rápido sin infraestructura GPU dedicada.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de calidad frente al modelo base en BF16, dado que el autor documenta con precisión la distribución de bits por componente.
- Despliegue en pipelines de investigación con MLX: integrable en scripts de experimentación que ya usen el ecosistema MLX de Apple, evitando conversiones adicionales de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 17,5 GB solo para los pesos; con overhead de contexto y activaciones, se recomienda un mínimo de 24-32 GB de memoria unificada.
- GPU recomendadas: no aplica GPU dedicada en sentido estricto; el formato MLX está orientado a Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra).
- Compatibilidad con GPU consumer: no está pensado para GPUs NVIDIA/AMD consumer; el formato safetensors MLX requiere el runtime de Apple.
- Opciones de despliegue: MLX (librería oficial de Apple) y oMLX (herramienta de cuantización y ejecución del autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4h-mtp (este) | 7,213B (cuantizado) | no disponible | safetensors MLX | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |
| Otras cuantizaciones MLX del mismo base | no disponible | no disponible | safetensors MLX | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información pública del checkpoint es mínima: no hay model card descriptiva, ni licencia, ni idiomas, ni benchmarks, lo que dificulta su evaluación rigurosa.
- La cuantización mixta con un 47,1 % de pesos en U32 y un promedio de 19,429 bits/peso implica que el ahorro de memoria respecto a BF16 es moderado; no debe confundirse con un 4-bit homogéneo.
- Riesgo de degradación de calidad respecto al modelo base, especialmente en tareas sensibles a precisión numérica (matemáticas, código, razonamiento largo); no se documenta ninguna evaluación al respecto.
- Riesgo de alucinación inherente al modelo base; no hay información específica sobre mitigaciones.
- Restricciones de licencia para uso comercial: no disponible; debe consultarse la licencia del modelo base Qwen/Qwen3.8-27B antes de cualquier uso en producción.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA/AMD sin reconversión.
- La cabeza MTP requiere soporte específico en el runtime; no todos los frameworks MLX la aprovechan automáticamente.
- El checkpoint fue creado y actualizado el mismo día (21 de noviembre de 2026) y no registra descargas ni likes, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-oQ/Qwen3.8-27B-oQ4h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
