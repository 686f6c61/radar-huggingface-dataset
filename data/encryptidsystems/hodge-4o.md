# EncryptidSystems/hodge-4o

## Resumen

Hodge-4o es un modelo de lenguaje causal ternarizado publicado por EncryptidSystems bajo licencia MIT. Su característica principal es que las capas lineales utilizan "Hodge linear", una variante de cuantización offline que reduce los pesos a valores ternarios (probablemente -1, 0, +1, aunque la model card no lo detalla explícitamente) manteniendo el resto de componentes en bfloat16. El modelo se distribuye en un único fichero de pesos propietario con extensión `.bnz`, no en formatos estándar como safetensors o GGUF.

La model card declara una arquitectura transformer con 30 capas, dimensión oculta de 2560, 20 cabezas de atención y 5 cabezas key-value (GQA con ratio 4:1), tamaño de cabeza 128, tamaño intermedio 6912, vocabulario de 514307 tokens, contexto de 4096 tokens y activación relu2 con embeddings atados. Aunque los tags de Hugging Face listan varios modelos base (google/gemma-4-31B-it, meta-llama/Llama-3.2-3B-Instruct, google/vaultgemma-1b, microsoft/bitnet-b1.58-2B-4T-gguf), la model card no especifica qué modelo se usó realmente como base ni cómo se combinaron, y las dimensiones declaradas no coinciden con ninguno de ellos de forma evidente.

El interés del modelo reside en su propuesta de compresión agresiva mediante pesos ternarios, un enfoque alineado con líneas de investigación como BitNet b1.58. Sin embargo, la información publicada es mínima: no hay datos de entrenamiento, benchmarks, ni detalles sobre el proceso de cuantización. El repositorio ocupa 2.2 GB, lo que resulta coherente con un modelo de aproximadamente 2-3 mil millones de parámetros almacenado en un formato comprimido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con capas lineales "Hodge linear" ternarizadas |
| Parametros totales | no disponible (estimado en el rango de 2-3B por el tamano del repo, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos ternarios en capas lineales (cuantizacion offline); resto en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `.bnz` (formato propietario, no safetensors ni GGUF) |

Otros parámetros declarados en la model card: hidden size 2560, 30 capas, intermediate size 6912, 20 cabezas de atención, 5 cabezas key-value, head size 128, vocabulario 514307, rope theta 500000, activación relu2, embeddings atados, dtype de pesos bfloat16, bos token id 128000, eos token ids 128001 y 128009.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con atención multi-cabeza con consultas agrupadas (20 cabezas de atención y 5 cabezas key-value), activación relu2 y embeddings atados. La innovación declarada es el uso de capas lineales "Hodge linear" cuantizadas offline a valores ternarios, mientras que el resto de los pesos se mantiene en bfloat16. No se especifica qué proporción de los parámetros queda en bfloat16 ni cómo afecta esto al tamaño efectivo del modelo.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla el proceso de cuantización: no se indica si hubo entrenamiento con cuantización consciente (QAT) o si es una cuantización post-entrenamiento (PTQ). La mención de múltiples modelos base en los tags (gemma-4-31B-it, Llama-3.2-3B-Instruct, vaultgemma-1b, bitnet-b1.58-2B-4T-gguf) sugiere una posible destilación o fusión, pero la model card no lo confirma ni lo explica.

## Capacidades

- Generación de texto conversacional en inglés, con un formato de chat basado en líneas de rol cerradas por `<|eot_id|>` y generación que comienza en `Assistant: `.
- Razonamiento y generación de texto general, aunque no se documentan capacidades específicas de matemáticas o código.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language` de la model card.
- No se declara modo "thinking", visión, audio ni otras capacidades especiales.
- Muestreo configurado por defecto con temperatura 0.6 y top-p 0.9, con tope de longitud de 4096 tokens; se menciona temperatura 0.7 para "desk run".

## Casos de uso

- Prototipado de chat en inglés: el modelo puede usarse para construir asistentes conversacionales básicos en inglés, aprovechando su formato de chat definido y su contexto de 4096 tokens para conversaciones multi-turno moderadas.
- Experimentación con cuantización ternaria: investigadores interesados en técnicas de compresión extrema pueden usar Hodge-4o como referencia para estudiar el comportamiento de capas lineales ternarizadas en un transformer pequeño.
- Despliegue en entornos con restricciones de memoria: al almacenarse en un formato comprimido de 2.2 GB, podría caber en GPUs de consumo con suficiente VRAM, aunque la falta de soporte en runtimes estándar limita su uso práctico.
- Generación de texto de longitud moderada: con un contexto de 4096 tokens, es adecuado para tareas de resumen o generación de respuestas cortas en inglés.
- Investigación sobre formatos de pesos alternativos: el formato `.bnz` y la herramienta ModelRun pueden servir como caso de estudio para quienes diseñan pipelines de despliegue personalizados.
- Evaluación comparativa de modelos ternarios: puede emplearse como punto de comparación frente a BitNet b1.58 y otros enfoques de cuantización ternaria en estudios académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 2.2 GB, lo que sugiere que la inferencia podría requerir del orden de 3-6 GB de VRAM dependiendo de la implementación y del tamaño real de parámetros.
- GPU recomendadas: no disponible. Por tamaño, podría ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay confirmación oficial.
- Compatibilidad con GPU de consumo: probable por el tamaño del repositorio, pero no confirmada.
- Opciones de despliegue: el modelo requiere la herramienta ModelRun del autor (`modelrun run -temp 0.7 --config hodge-4o.bnz.yaml`). No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni otros runtimes estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Hodge-4o | no disponible (estimado 2-3B) | 4096 | Ternaria en lineales | MIT | `.bnz` propietario | Requiere ModelRun |
| BitNet b1.58 2B4T | 2B | 4096 | Ternaria nativa (1.58 bits) | MIT | safetensors, GGUF | Amplia (llama.cpp, etc.) |
| Llama-3.2-3B-Instruct | 3B | 131072 | FP16/BF16, cuantizable | Llama 3.2 Community License | safetensors, GGUF | Amplia |
| Gemma-4-31B-it | 31B | no disponible | BF16, cuantizable | Gemma Terms of Use | safetensors | Amplia |

La comparación más directa es con BitNet b1.58 2B4T, que también emplea pesos ternarios pero cuenta con soporte en runtimes estándar y documentación técnica publicada. Hodge-4o no ofrece información sobre rendimiento que permita una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación muy escasa: no hay información sobre datos de entrenamiento, proceso de cuantización, ni evaluación de calidad.
- Formato de pesos propietario (`.bnz`): no es compatible con herramientas estándar como transformers, llama.cpp, vLLM u Ollama, lo que limita su adopción y reproducibilidad.
- Solo soporta inglés según la model card.
- Contexto limitado a 4096 tokens, inferior al de muchos modelos contemporáneos.
- No se declara soporte de tool calling, agentes ni otras capacidades avanzadas.
- Riesgo de alucinación no evaluado: sin benchmarks ni evaluaciones publicadas, no es posible estimar su fiabilidad.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden identificar sesgos específicos.
- La licencia MIT permite uso comercial, pero la dependencia de la herramienta ModelRun y la falta de validación técnica suponen un riesgo para producción.
- La relación con los modelos base listados (gemma-4-31B-it, Llama-3.2-3B-Instruct, vaultgemma-1b, bitnet-b1.58-2B-4T-gguf) no está explicada, lo que genera incertidumbre sobre la procedencia y los derechos de los pesos.
- El modelo tiene 34 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/EncryptidSystems/hodge-4o
- Modelo base declarado (Gemma 4 31B IT): https://huggingface.co/google/gemma-4-31B-it
- Modelo base declarado (Llama 3.2 3B Instruct): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Modelo base declarado (VaultGemma 1B): https://huggingface.co/google/vaultgemma-1b
- Modelo base declarado (BitNet b1.58 2B4T GGUF): https://huggingface.co/microsoft/bitnet-b1.58-2B-4T-gguf
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
