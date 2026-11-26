# abdoulsalamally/ledger-ai-3b

## Resumen

Ledger-ai-3b es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario abdoulsalamally y publicado en Hugging Face. Se trata de un modelo de generación de texto de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) construido sobre la arquitectura Qwen2 de Alibaba, orientado a conversación y generación de texto en inglés. El modelo parte de la versión ya cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit) y se ha entrenado con la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido".

La relevancia de este modelo es limitada en el ecosistema actual: se publica bajo licencia Apache 2.0, lo que facilita su uso comercial, y su tamaño compacto lo hace desplegable en hardware de consumo. Sin embargo, la model card es extremadamente escasa (no documenta dataset de entrenamiento, hiperparámetros, benchmarks ni propósito específico del ajuste), el repositorio no registra descargas ni interacciones, y el nombre "ledger-ai" sugiere un uso vertical (posiblemente contabilidad o finanzas) que no se explica en la documentación disponible.

Al estar basado en Qwen2.5-3B-Instruct, hereda las capacidades generales del modelo original (generación de texto, razonamiento básico, código y soporte multilingüe limitado), aunque el ajuste fino podría haber alterado su comportamiento. No se dispone de información sobre qué se ha modificado respecto al modelo base ni sobre la calidad del resultado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero el ajuste no lo documenta) |
| Tipos de cuantización | no disponible (el modelo base de partida estaba en bnb-4bit; el repo contiene safetensors, presumiblemente en precisión completa o bf16) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atención causal, normalización RMSNorm y activaciones SwiGLU, la misma familia que Qwen2.5. Al derivarse de Qwen2.5-3B-Instruct, parte de un modelo ya alineado mediante instruction tuning por parte de Alibaba. El ajuste fino se realizó con Unsloth (que optimiza el entrenamiento mediante kernels personalizados y reducción de memoria) y la librería TRL de Hugging Face, partiendo de una versión cuantizada a 4 bits del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni la naturaleza del ajuste (¿instrucciones específicas de dominio? ¿estilo conversacional? ¿datos de contabilidad?). La model card no incluye hiperparámetros, curvas de pérdida ni detalles del procedimiento. Tampoco se documenta ninguna innovación técnica propia más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento básico y respuesta a instrucciones (instruction following), presumiblemente conservado del modelo base.
- Generación de código y matemáticas a nivel de un modelo de 3B, sin datos específicos que lo confirmen tras el ajuste.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5 lo soporta, pero no hay confirmación de que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base soporta más idiomas; el ajuste podría haber degradado otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el tamaño de 3B permite ejecutarlo en GPU de consumo y iterar rápidamente sobre prompts, aunque la falta de documentación exige validar su comportamiento empíricamente.
- Fine-tuning adicional sobre dominio específico: al ser Apache 2.0 y de pequeño tamaño, sirve como punto de partida para ajustes verticales (por ejemplo, atención al cliente o extracción de datos), siempre que se verifique que el ajuste original no haya degradado capacidades.
- Despliegue en entornos con recursos limitados: con cuantización a 4 u 8 bits cabe en GPUs de 8-16 GB, útil para demos o entornos edge.
- Experimentación académica con técnicas de ajuste eficiente: el modelo documenta el uso de Unsloth + TRL, por lo que puede servir como referencia reproducible de ese pipeline (aunque faltan hiperparámetros).
- Generación de texto asistida en inglés para tareas de redacción o resumen de baja criticidad, con revisión humana obligatoria dada la ausencia de benchmarks.
- Base para evaluación comparativa interna: permite medir si el ajuste de Unsloth sobre un modelo cuantizado a 4 bits conserva la calidad del original, como ejercicio de validación de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en bf16/fp16 (tamaño del repo), ~3,5-4 GB en cuantización 8 bits y ~2-2,5 GB en 4 bits (estimaciones basadas en el número de parámetros, no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización 4/8 bits; en bf16 requiere al menos 8-12 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama previa conversión a GGUF, y el ecosistema Unsloth para reentrenamiento.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| abdoulsalamally/ledger-ai-3b | ~3,09 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino no documentado |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens | Apache 2.0 | Hugging Face (ampliamente usado) | Modelo base, documentación completa y benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto mayor |
| google/gemma-2-2b-it | ~2,6 B | 8.192 tokens | Gemma Terms of Use | Hugging Face | Alternativa más pequeña, con restricciones de licencia |

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no se especifica dataset, hiperparámetros, propósito del ajuste ni evaluación, lo que impide conocer qué se ha modificado respecto al modelo base.
- Riesgo elevado de regresión de capacidades: el ajuste parte de una versión cuantizada a 4 bits y no se aportan evidencias de que el modelo conserve el rendimiento del Qwen2.5-3B-Instruct original.
- Riesgo de alucinación: inherente a modelos de 3B, agravado por la ausencia de benchmarks que cuantifiquen su fiabilidad.
- Idiomas: la model card declara solo inglés; el uso en castellano u otros idiomas no está garantizado y podría degradarse respecto al modelo base.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que se desconoce.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su dominio, dado que no hay garantías de calidad.
- Sin tracción en la comunidad (0 descargas, 0 likes): no hay retroalimentación externa ni casos de uso verificados.
- El nombre "ledger-ai" sugiere un dominio financiero/contable no documentado; usarlo en producción sin evaluación previa es desaconsejable.

## Enlaces

- Hugging Face: https://huggingface.co/abdoulsalamally/ledger-ai-3b
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo Qwen2.5-3B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
