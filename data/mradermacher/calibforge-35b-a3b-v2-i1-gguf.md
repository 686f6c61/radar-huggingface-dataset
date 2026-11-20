# mradermacher/CalibForge-35B-A3B-v2-i1-GGUF

## Resumen

CalibForge-35B-A3B-v2-i1-GGUF es una colección de cuantizaciones GGUF del modelo CalibForge-35B-A3B-v2, publicado por el usuario mradermacher en Hugging Face. El modelo base pertenece a AweAI-Team y, por su nomenclatura, se presenta como un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones de parámetros activos por token (de ahí el sufijo "35B-A3B"). El repositorio contiene únicamente los pesos cuantizados en formato GGUF, generados con el pipeline de cuantización de llama.cpp, e incluye variantes con y sin importance matrix (imatrix) ponderada.

La relevancia de este repositorio radica en que permite ejecutar un modelo MoE de gran tamaño en hardware de consumo mediante cuantizaciones agresivas (desde IQ1_S hasta Q6_K), manteniendo un tamaño de repositorio de solo 0,4 GB, lo que sugiere que las cuantizaciones de menor bits son extremadamente compactas. Sin embargo, la información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni resultados de benchmarks, y la model card del repositorio es prácticamente inexistente más allá de los metadatos de cuantización.

El dato de parámetros totales reportado en los metadatos de Hugging Face (96.047.470) entra en contradicción con la nomenclatura del modelo (35B-A3B). Esta discrepancia debe tenerse en cuenta al evaluar el modelo, ya que no es posible verificar el tamaño real a partir de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura sugiere MoE, sin confirmar) |
| Parametros totales | 96.047.470 según metadatos de Hugging Face; la nomenclatura indica 35B (no confirmado) |
| Parametros activos | no disponible (la nomenclatura sugiere ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base CalibForge-35B-A3B-v2. La nomenclatura "35B-A3B" es consistente con un transformer de tipo Mixture of Experts con aproximadamente 35.000 millones de parámetros totales y 3.000 millones activos por token, pero este dato no está confirmado en la información proporcionada. Tampoco se especifican los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

En cuanto al proceso de cuantización, la model card indica que se trata de cuantizaciones ponderadas con importance matrix (weighted/imatrix quants) generadas con el pipeline de llama.cpp (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf). Se ofrecen 24 variantes de cuantización que abarcan desde IQ1_S (la más agresiva) hasta Q6_K (la de mayor precisión), lo que permite ajustar el equilibrio entre tamaño y calidad según el hardware disponible.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se detalla en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones de menor tamaño (IQ1_S, IQ1_M, IQ2_XXS) permiten ejecutar un modelo de gran tamaño en GPUs con poca VRAM o incluso en CPU, algo inviable con los pesos en precisión completa.
- Experimentación con modelos MoE: la disponibilidad de 24 variantes de cuantización facilita comparar el impacto de la compresión en la calidad de las respuestas de un modelo MoE.
- Inferencia en entornos con restricciones de memoria: el tamaño compacto del repositorio (0,4 GB) sugiere que las cuantizaciones de menor bits pueden caber en dispositivos con recursos limitados.
- Pruebas de concepto y prototipado: útil para evaluar el comportamiento del modelo base antes de invertir en infraestructura para pesos completos.
- Investigación sobre cuantización: el conjunto de variantes con y sin imatrix permite estudiar el efecto de diferentes técnicas de cuantización en el rendimiento.
- Evaluación comparativa de cuantizaciones: permite medir la degradación de calidad entre IQ1_S y Q6_K en una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable, ya que el tamaño real del modelo no está confirmado. El repositorio completo ocupa 0,4 GB, lo que sugiere que las cuantizaciones individuales son muy compactas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable para las cuantizaciones de menor bits (IQ1_S, IQ1_M, IQ2_XXS) dado el reducido tamaño del repositorio, aunque no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF (vLLM con soporte GGUF, entre otros).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre el modelo base ni sobre alternativas comparables de la misma categoría para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: los metadatos de Hugging Face reportan 96.047.470 parámetros, mientras que la nomenclatura indica 35B-A3B. No es posible determinar el tamaño real del modelo con la información disponible.
- Licencia no especificada: no se indica la licencia del modelo base ni de las cuantizaciones, lo que impide confirmar si el uso comercial está permitido.
- Idiomas no especificados: se desconoce qué idiomas soporta el modelo.
- Sin benchmarks: no hay datos de rendimiento que permitan evaluar la calidad del modelo.
- Riesgo de degradación por cuantización: las variantes de menor bits (IQ1_S, IQ1_M, IQ2_XXS) pueden degradar significativamente la calidad de las respuestas.
- Riesgo de alucinación: inherente a los modelos de lenguaje, sin datos específicos disponibles.
- Sesgos conocidos: no disponible.
- Model card mínima: la documentación del repositorio es prácticamente inexistente, lo que dificulta la evaluación en producción.
- Fecha de creación futura: el repositorio figura creado el 2026-11-20, lo que puede indicar un error en los metadatos o un modelo de fecha no fiable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/CalibForge-35B-A3B-v2-i1-GGUF
- Modelo base: https://huggingface.co/AweAI-Team/CalibForge-35B-A3B-v2
