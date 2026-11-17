# positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq-fused

## Resumen

Positron AI Quantized Build es una cuantización GPTQ de 4 bits del modelo Qwen/Qwen3.5-35B-A3B, publicada por el usuario positron-ai en Hugging Face. Se trata de un artefacto de inferencia derivado, no de un modelo entrenado desde cero: el repositorio contiene únicamente los pesos cuantizados y reempaquetados para su uso con transformers, manteniendo la licencia Apache 2.0 del modelo original. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 35.951.822.704 parámetros totales, según los datos reales de safetensors, y una arquitectura identificada en los tags como `qwen3_5_moe`.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de aproximadamente 36.000 millones de parámetros en entornos con memoria limitada, gracias a la cuantización de pesos a 4 bits con grupo de 64 y cuantización simétrica. El artefacto ocupa 22,9 GB en el repositorio, lo que lo sitúa en el rango de GPUs de gama alta de consumo y de aceleradores profesionales de una sola tarjeta. No obstante, la model card no reporta métricas de calidad, latencia ni perplejidad, y la información sobre idiomas, contexto y capacidades del modelo base no está disponible en la documentación proporcionada.

El pipeline declarado es `text-generation`, aunque los tags incluyen también `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base. La fecha de creación del repositorio es el 16 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe` según tags) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits, grupo 64, simétrica, `desc_act=false` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), según el tag `qwen3_5_moe` y la nomenclatura del identificador. La model card del artefacto cuantizado describe la presencia de proyecciones de expertos enrutados con `gate_up_proj` fusionada, tensores de expertos compartidos y tensores `mtp.` (multi-token prediction) que se mantienen sin cambios. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación técnica documentada en este artefacto es la derivación por reempaquetado sin pérdida (`fuse_gate_up_contiguous`): los tensores `qweight`, `qzeros` y `scales` de `gate_up_proj` se fusionan en mitades contiguas, con la mitad `gate` antes de la mitad `up`, y se copia el `g_idx` a `gate_proj` y `up_proj`. No se recuantizaron pesos. La calibración del padre se realizó con 512 muestras de un conjunto mixto universal, longitud de secuencia 8192, damp del 0,05 %, usando GPTQModel 7.3.4, transformers 5.11.0, torch 2.9.1 y CUDA 12.8. Las activaciones no están cuantizadas.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado.
- Capacidad multimodal de entrada imagen-texto a texto, según el tag `image-text-to-text`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Predicción multi-token (MTP): el artefacto conserva los tensores `mtp.` del modelo base, lo que sugiere soporte de decodificación especulativa o multi-token, aunque no se documenta su uso.

## Casos de uso

- Despliegue de inferencia en una sola GPU de 24 GB: el artefacto de 22,9 GB en 4 bits permite cargar el modelo completo en tarjetas como RTX 4090 o A10G, algo inviable con los pesos en precisión original.
- Servicio de chat conversacional con transformers: al declarar `pipeline_tag: text-generation` y ser compatible con la librería transformers, puede integrarse en endpoints de texto conversacional.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad frente al modelo original y frente a otros formatos cuantizados antes de decidir un despliegue en producción.
- Prototipado de aplicaciones multimodales: el tag `image-text-to-text` permite experimentar con entradas de imagen y texto en tareas de descripción o respuesta a preguntas visuales, siempre que se valide el comportamiento real del artefacto.
- Investigación sobre MoE cuantizados: la fusión de `gate_up_proj` y la conservación de tensores MTP lo convierten en un caso de estudio para analizar el impacto del reempaquetado en el rendimiento de inferencia.
- Pipeline de generación de texto en CI/CD: puede integrarse como servicio de generación en flujos automatizados de documentación o resumen, sujeto a validación previa de latencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (sin KL-divergence, accuracy ni perplexity), y que la validación se gestiona internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 23 GB solo para pesos en 4 bits; con overhead de activaciones y caché KV, se recomienda al menos 24-32 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB (ajustada), RTX A6000 48 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB con cuantización 4 bits, aunque el margen es reducido y depende de la longitud de contexto.
- Opciones de despliegue: transformers con soporte GPTQ; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq-fused | 35.951.822.704 | no disponible | GPTQ 4 bits | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-35B-A3B (base) | 35.951.822.704 | no disponible | Original | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no reporta métricas de calidad; no hay evidencia publicada de la degradación introducida por la cuantización 4 bits frente al modelo original.
- El artefacto es una derivación por reempaquetado del padre `positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq@b32414f`; cualquier problema del padre se hereda.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos generativos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica longitud de contexto ni cobertura lingüística.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se mantienen las restricciones de uso del modelo original de Qwen.
- En producción, la ausencia de benchmarks y de validación pública obliga a realizar una evaluación propia antes de desplegar.
- El repositorio no registra descargas ni likes, lo que reduce la evidencia comunitaria sobre su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq-fused
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Artefacto padre: https://huggingface.co/positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq
