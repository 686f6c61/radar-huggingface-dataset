# hsanthan/Qwen-backdoor-experiments

## Resumen

`hsanthan/Qwen-backdoor-experiments` es un modelo derivado de Qwen/Qwen3-8B publicado por el usuario hsanthan en Hugging Face. Se trata de un artefacto de investigación orientado a experimentos de *weight editing* (edición de pesos) y análisis de *backdoors* (puertas traseras) en modelos de lenguaje. El repositorio incluye pesos en formato GGUF y está etiquetado como `research-demo`, lo que indica que su propósito es demostrativo y no de producción.

El modelo hereda la arquitectura y el tamaño de Qwen3-8B: aproximadamente 8.190 millones de parámetros en formato safetensors, lo que lo sitúa en la categoría de modelos densos de 8B. Al estar basado en Qwen3-8B, se espera que conserve las capacidades generales del modelo original (generación de texto, razonamiento, código y multilingüismo), aunque las modificaciones introducidas por la edición de pesos pueden alterar su comportamiento de forma deliberada o no controlada.

La relevancia de este modelo es fundamentalmente metodológica: sirve como caso de estudio para investigadores interesados en cómo se pueden inyectar o detectar comportamientos maliciosos (backdoors) mediante manipulación de pesos, y en las técnicas de análisis forense de modelos. No obstante, su acceso está restringido (gated), la licencia no está disponible y no se han publicado resultados de benchmarks ni documentación técnica detallada en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-8B; detalles no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B; valor exacto no confirmado en la información proporcionada) |
| Tipos de cuantizacion | GGUF (el repositorio incluye pesos en formato GGUF); niveles específicos no disponibles |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF y safetensors (tamaño del repo: 28,7 GB) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3-8B, un transformer denso de aproximadamente 8.190 millones de parámetros. La información proporcionada no detalla la arquitectura interna exacta (número de capas, dimensiones ocultas, mecanismo de atención, etc.) más allá de su procedencia. El repositorio está etiquetado con `weight-editing`, lo que sugiere que los pesos originales de Qwen3-8B han sido modificados directamente (en lugar de mediante fine-tuning convencional) para inyectar o estudiar comportamientos de backdoor.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El propósito declarado es la investigación en edición de pesos y análisis de puertas traseras, por lo que las modificaciones podrían ser deliberadas y no estar orientadas a mejorar el rendimiento general.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica soporte para diálogo multi-turno.
- Razonamiento y código: se espera que conserve las capacidades de Qwen3-8B (razonamiento, matemáticas y programación), aunque las ediciones de pesos pueden degradarlas o alterarlas.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada; probablemente heredado de Qwen3-8B, pero no verificado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; se desconoce qué idiomas conserva tras la edición.
- Capacidades especiales: el modelo está diseñado como demostración de investigación en backdoors y edición de pesos; no se documentan modos especiales como *thinking mode*, visión o audio.

## Casos de uso

- Investigación en seguridad de modelos: el modelo sirve como banco de pruebas para estudiar cómo se manifiestan los backdoors inyectados mediante edición de pesos y para desarrollar técnicas de detección y mitigación.
- Análisis forense de pesos: los investigadores pueden comparar los tensores de este modelo con los de Qwen3-8B original para identificar qué parámetros han sido modificados y correlacionarlos con cambios de comportamiento.
- Docencia en seguridad de IA: puede utilizarse en entornos controlados para ilustrar los riesgos de modelos modificados y la importancia de la procedencia y verificación de pesos.
- Evaluación de pipelines de cuantización: al incluir formato GGUF, permite estudiar si las modificaciones maliciosas sobreviven a procesos de cuantización y cómo afectan a la fidelidad del modelo.
- Desarrollo de herramientas de auditoría: sirve para validar detectores de backdoors basados en análisis de activaciones, *probing* o comparación de logits frente al modelo base.
- Pruebas de robustez en despliegues: permite simular escenarios de modelos comprometidos en pipelines de inferencia (vLLM, llama.cpp, Ollama) y evaluar salvaguardas de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~8,19B parámetros, en FP16 requiere aproximadamente 16,4 GB de VRAM; en cuantización de 8 bits, unos 8,2 GB; en 4 bits, alrededor de 4,1 GB (estimaciones teóricas, no confirmadas para este artefacto).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; GPU consumer con 8-16 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: sí, en GPUs con al menos 8 GB de VRAM usando cuantización GGUF de 4-8 bits; en FP16 requiere GPUs de 24 GB o superiores.
- Opciones de despliegue: llama.cpp y Ollama para los pesos GGUF; vLLM o TGI para los pesos safetensors (siempre que la arquitectura sea compatible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hsanthan/Qwen-backdoor-experiments | 8,19B | No disponible | No disponible | Gated en HF | Demo de investigación en backdoors y edición de pesos |
| Qwen/Qwen3-8B | 8,19B | No disponible en esta ficha | No disponible en esta ficha | Público en HF | Modelo base original, sin modificaciones de backdoor |
| Alternativas de 8B (p. ej., Llama 3.1 8B, Mistral 7B) | ~7-8B | No disponible en esta ficha | No disponible en esta ficha | Público en HF | Modelos generalistas; no comparables en propósito de investigación de seguridad |

La comparación directa con modelos generalistas no es significativa, ya que este artefacto no está orientado a rendimiento sino a investigación. Frente a Qwen3-8B, la diferencia clave es la modificación de pesos y el posible comportamiento de backdoor, no una mejora de capacidades.

## Limitaciones y advertencias

- Riesgo de comportamiento malicioso o no documentado: al ser un experimento de backdoor, el modelo puede producir salidas manipuladas de forma deliberada; no debe usarse en producción sin auditoría.
- Sesgos conocidos: no documentados; se desconoce si las ediciones de pesos introducen sesgos adicionales.
- Riesgo de alucinación: no evaluado; probablemente similar o superior al de Qwen3-8B original, sin datos que lo confirmen.
- Limitaciones de contexto e idioma: no disponibles; se desconoce si la edición de pesos afecta a la ventana de contexto o al soporte multilingüe.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial; además, el acceso es restringido (gated) y requiere aceptar condiciones en Hugging Face.
- Caveat para producción: no apto para despliegues reales sin una evaluación de seguridad exhaustiva; su naturaleza de demostración de investigación implica que su comportamiento puede ser impredecible.
- Procedencia y reproducibilidad: no se documentan los detalles del proceso de edición de pesos ni los criterios de evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/hsanthan/Qwen-backdoor-experiments
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
