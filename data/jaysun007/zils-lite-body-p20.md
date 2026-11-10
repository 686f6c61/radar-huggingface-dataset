# jaysun007/zils-lite-body-p20

## Resumen

Zils d3-lite decision body (identificador `jaysun007/zils-lite-body-p20`) es un fine-tune del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario jaysun007 en Hugging Face. Se trata de un ajuste fino orientado a un "soup pool" (agrupación de modelos para mezcla o ensemble) denominado Zils d3-lite, según la propia model card del autor. El repositorio contiene 852.985.920 parámetros en formato safetensors, lo que lo sitúa en la categoría de modelos compactos de menos de mil millones de parámetros.

El modelo hereda la arquitectura y el tokenizador de Qwen3.5-0.8B, aunque el autor lo etiqueta con el tag `qwen3_5` y requiere código personalizado (`custom_code`) para su carga. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, siempre que se respeten las condiciones de la licencia.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no dispone de pipeline declarado ni de información sobre idiomas soportados, y la model card es extremadamente escueta (tres líneas). No se han publicado benchmarks, detalles de entrenamiento ni casos de uso por parte del autor. Esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se desconoce si el autor publicó GGUF u otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `custom_code` para carga) |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de un fine-tune de Qwen/Qwen3.5-0.8B, un modelo de la familia Qwen 3.5 con 0,8 mil millones de parámetros. El tag `qwen3_5` y la presencia de `custom_code` en el repositorio sugieren que la carga requiere código específico del autor, probablemente porque la arquitectura o la configuración del fine-tune no es estándar en transformers sin ese código adicional. No se especifica si la arquitectura es un transformer denso convencional, si incorpora atención lineal, decodificación especulativa u otras innovaciones.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El autor menciona que el modelo forma parte de un "soup pool" (Zils d3-lite), lo que sugiere una estrategia de model soup o mezcla de pesos, pero no se detalla el proceso. Tampoco se documenta el régimen de entrenamiento, la precisión utilizada ni el hardware empleado.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen3.5-0.8B, aunque no se documentan evaluaciones específicas tras el fine-tune.
- Razonamiento y matemáticas: no disponible; no hay evidencia publicada de mejora o degradación respecto al base.
- Generación de código: no disponible; no se documenta soporte específico.
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas no está cumplimentado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Carga mediante código personalizado: requiere `trust_remote_code=True` o el código incluido en el repositorio para su correcta instanciación.

## Casos de uso

- Experimentación con model soups: el modelo está diseñado explícitamente como parte de un "soup pool" (Zils d3-lite), por lo que su uso previsto es la mezcla de pesos con otros checkpoints del mismo pool para producir un modelo combinado. Es adecuado porque el autor lo publica con ese propósito declarado.
- Fine-tuning posterior en dominios específicos: al ser un modelo de 0,85 mil millones de parámetros con licencia Apache 2.0, se puede reentrenar en tareas concretas (clasificación, extracción de entidades, resumen) con recursos modestos. Es adecuado por su tamaño reducido y licencia permisiva.
- Prototipado rápido en local: cabe en GPUs de consumo y permite iterar en entornos de desarrollo sin infraestructura dedicada. Adecuado por su tamaño y formato safetensors.
- Investigación sobre mezcla de modelos: sirve como checkpoint intermedio para estudiar el efecto de model soups en modelos pequeños. Adecuado porque el autor lo enmarca en ese contexto.
- Evaluación comparativa de fine-tunes de Qwen3.5-0.8B: puede usarse como punto de comparación frente al modelo base en experimentos académicos. Adecuado por su trazabilidad al base declarado.
- Despliegue en entornos con restricciones de memoria: al tener menos de mil millones de parámetros, puede ejecutarse en CPU o en GPUs con poca VRAM mediante cuantización, aunque no se publican pesos cuantizados. Adecuado por el tamaño, con la cautela de que la carga requiere código personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060); para mayor throughput, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer actuales, dado el tamaño reducido.
- Opciones de despliegue: no confirmadas. La presencia de `custom_code` puede complicar el uso con vLLM, llama.cpp u Ollama sin adaptaciones; se recomienda transformers con `trust_remote_code=True`. TGI y otros servidores no están verificados.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jaysun007/zils-lite-body-p20 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, requiere custom_code | Fine-tune de Qwen3.5-0.8B para soup pool |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base declarado del anterior |
| Otros fine-tunes de Qwen3.5-0.8B | ~0,8 mil millones | variable | variable | Hugging Face | No se dispone de datos comparativos verificados |

No se dispone de información suficiente para comparar rendimiento, contexto o calidad con alternativas de la misma categoría. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Información muy escasa: la model card tiene tres líneas y no documenta entrenamiento, datos, evaluación ni uso previsto más allá del soup pool.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Requiere `custom_code`: la carga no es estándar; puede fallar en versiones recientes de transformers o en servidores de inferencia que no soporten código remoto.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha evaluado su mitigación en este fine-tune.
- Sesgos: no documentados; al heredar del base Qwen3.5-0.8B, podría arrastrar sesgos del corpus original, pero no hay análisis disponible.
- Idiomas: no se especifican; no se puede garantizar soporte multilingüe más allá de lo que ofrezca el base.
- Contexto: no se declara la longitud de contexto; no se debe asumir la del base sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo.
- Producción: no recomendado sin una evaluación previa propia, dado que no hay benchmarks ni documentación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaysun007/zils-lite-body-p20
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
