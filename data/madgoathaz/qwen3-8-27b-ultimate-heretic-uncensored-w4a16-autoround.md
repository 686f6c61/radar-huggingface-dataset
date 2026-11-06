# MadGoatHaz/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AutoRound

## Resumen
Este repositorio contiene una cuantización W4A16 del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un fine-tune "uncensored" (etiquetado como heretic) de la familia Qwen 3.8. La cuantización la ha generado el usuario MadGoatHaz mediante Intel AutoRound con optimización SignRound y la ha empaquetado en el esquema `auto_round:auto_gptq` compatible con kernels Marlin. El objetivo es reducir la huella de VRAM hasta aproximadamente 15,5 GB manteniendo la decodificación rápida en vLLM y SGLang mediante kernels fusionados de dequantización INT4.

El modelo base emplea una arquitectura híbrida de atención: alterna capas de atención con compuertas (Gated Attention) y capas de atención lineal recurrente Gated DeltaNet (GDN). Según los datos de safetensors del repositorio, el modelo tiene 6.284.446.960 parámetros reales, a pesar de que el nombre comercial indica "27B"; esta discrepancia debe tenerse en cuenta al planificar el despliegue. El repositorio ocupa 19,0 GB e incluye pesos en safetensors con cuantización de 4 bits.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una cuantización AutoRound W4A16 con capas sensibles preservadas en 16 bits, la conservación de los tensores de Multi-Token Prediction (MTP) para decodificación especulativa y un ajuste fino orientado a eliminar restricciones de rechazo. Todo ello bajo una licencia "other" que exige revisión legal antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated Attention + Gated DeltaNet (atención lineal recurrente), con cabezas MTP |
| Parametros totales | 6.284.446.960 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens configurados en el ejemplo de servicio vLLM (`--max-model-len 32768`); el máximo nativo del modelo base no está disponible en la información proporcionada |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones 16 bits), grupo simétrico de tamaño 128, esquema `auto_round:auto_gptq` compatible con Marlin |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | other |
| Formato de pesos | safetensors (incluye `model_extra_tensors.safetensors` con los tensores MTP) |

## Arquitectura y entrenamiento
El modelo base es un fine-tune de la familia Qwen 3.8 con arquitectura híbrida: intercala capas de Gated Attention con capas de atención lineal recurrente Gated DeltaNet. Esta combinación busca reducir el coste computacional en contextos largos manteniendo la calidad de la atención completa. El fine-tune del autor original (DavidAU) se presenta como un ajuste multietapa orientado a eliminar comportamientos de rechazo, con múltiples modos de razonamiento e instrucción según la model card del modelo base.

La cuantización se ha realizado con Intel AutoRound y optimización SignRound durante 200 iteraciones, con 128 muestras de calibración del dataset `NeelNanda/pile-10k` y longitud de secuencia 2048. Se han preservado en 16 bits dos tipos de capas críticas: `lm_head` y las proyecciones de entrada de la atención lineal (`linear_attn.in_proj_a` e `in_proj_b`), para evitar inestabilidad numérica en las actualizaciones del estado recurrente. Además, los 15 tensores auxiliares de Multi-Token Prediction se han extraído, calibrado mediante RTN y empaquetado en `model_extra_tensors.safetensors`, lo que permite decodificación especulativa con un solo modelo. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades
- Generación de texto conversacional en inglés y chino.
- Razonamiento e instrucción con múltiples modos declarados en el modelo base (27 modos de razonamiento y 27 modos de instrucción según la model card del base).
- Procesamiento de imagen y texto: la etiqueta del pipeline es `image-text-to-text` y el modelo base se publica como Image-Text-to-Text, aunque la cuantización se anuncia para text-generation.
- Decodificación especulativa mediante los tensores MTP conservados.
- Ajuste fino orientado a eliminar rechazos (uncensored/heretic), lo que implica menor tendencia a declinar peticiones.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso
- Generación de texto creativo sin filtros: el ajuste heretic reduce los rechazos, lo que resulta adecuado para ficción, guiones y narrativa que aborden temas sensibles sin interrupciones del modelo.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo con restricciones atenuadas y comparar su tasa de rechazo frente al modelo base original.
- Despliegue en una sola GPU de 24 GB: con aproximadamente 15,5 GB de VRAM para los pesos, cabe en tarjetas consumer de gama alta y permite servir conversaciones con contexto de 32.768 tokens.
- Procesamiento de documentos largos en inglés o chino: la ventana de 32.768 tokens y la atención lineal GDN reducen el coste de contexto largo en tareas de resumen y extracción.
- Servicio de alto rendimiento con vLLM: los kernels Marlin fusionados y la decodificación especulativa MTP permiten throughput elevado en despliegues con `--tensor-parallel-size 1`.
- Evaluación de cuantizaciones AutoRound: sirve como caso de estudio de preservación de capas sensibles (proyecciones GDN y `lm_head`) en modelos híbridos.
- Prototipado de asistentes conversacionales bilingües inglés-chino en entornos de investigación con presupuesto de hardware limitado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 15,5 GB para los pesos cuantizados, según la model card; el ejemplo de vLLM usa `--gpu-memory-utilization 0.90` y caché KV en fp8.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son viables para los pesos, con margen limitado para caché KV en contextos largos.
- Cabe en GPU consumer: sí, en tarjetas con 24 GB o más, siempre que se ajuste `--max-model-len` y el tamaño de lote.
- Opciones de despliegue: vLLM (soporte nativo con kernels Marlin y FlashInfer) y SGLang según la model card; llama.cpp y Ollama no están confirmados para este esquema `auto_round:auto_gptq`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MadGoatHaz/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AutoRound | 6.284 M (reales) | 32.768 (config. vLLM) | W4A16 AutoRound | other | Hugging Face, 20 descargas |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (base) | No disponible | No disponible | BF16/FP16 | other | Hugging Face, 87 likes |
| Qwen 3.8 original (familia) | No disponible | No disponible | Múltiples | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias
- Discrepancia de nomenclatura: el nombre indica "27B" pero los safetensors declaran 6.284 M de parámetros; verificar antes de dimensionar el hardware.
- Modelo "uncensored": presenta menor tasa de rechazo, lo que aumenta el riesgo de generar contenido inapropiado, ofensivo o factualmente incorrecto; requiere filtros externos en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para este fine-tune ni para la cuantización.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Licencia "other": es imprescindible revisar los términos del modelo base y del fine-tune antes de cualquier uso comercial.
- La cuantización W4A16 puede degradar la calidad frente al modelo en 16 bits, especialmente en tareas de razonamiento matemático o código; no se han publicado comparativas de calidad.
- El contexto máximo nativo del modelo base no está confirmado; los 32.768 tokens corresponden a la configuración del ejemplo de vLLM.
- El soporte de tool calling y agentes no está documentado para esta variante.
- Repositorio con solo 20 descargas y 0 likes: escasa validación comunitaria.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/MadGoatHaz/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AutoRound
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Dataset de calibración: https://huggingface.co/datasets/NeelNanda/pile-10k
