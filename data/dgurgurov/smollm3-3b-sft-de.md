# DGurgurov/SmolLM3-3B-SFT-DE

## Resumen

El modelo `DGurgurov/SmolLM3-3B-SFT-DE` es un ajuste fino supervisado (SFT) sobre el modelo base `HuggingFaceTB/SmolLM3-3B`, desarrollado por Daniil Gurgurov y colaboradores en el marco del proyecto **ReasonXL**. Su objetivo es desplazar el idioma de razonamiento del modelo de inglés a alemán, manteniendo las capacidades de razonamiento originales. Forma parte de un pipeline de dos etapas: la primera es este SFT, y la segunda aplica optimización por refuerzo (GRPO) mediante el modelo `DGurgurov/SmolLM3-3B-SFT-GRPO-DE` para recuperar calidad de razonamiento perdida durante el ajuste supervisado.

Con 3.337.766.912 parámetros, el modelo hereda la arquitectura del SmolLM3-3B, un transformer decoder-only con atención por grupos (GQA). Aunque el repo no especifica la longitud de contexto, el modelo base soporta un contexto estándar de 3.000 tokens. La relevancia de este modelo radica en su enfoque en el razonamiento multilingüe, un área poco explorada en modelos pequeños, y su potencial para aplicaciones que requieren razonamiento lógico en alemán sin perder precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM3-3B, con GQA y SiLU) |
| Parametros totales | 3.337.766.912 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el base SmolLM3-3B soporta 3.000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Alemán (objetivo principal); hereda capacidades multilingües del base |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceTB/SmolLM3-3B`, un transformer decoder-only de 3.000 millones de parámetros con atención multi-cabeza con grouped-query attention (GQA) y bloques MLP con activación SiLU. El ajuste supervisado se realizó sobre el dataset `toroe/ReasonXL-SFT`, que contiene trazas de razonamiento en alemán. El objetivo de la etapa SFT es enseñar al modelo a "pensar" en alemán, es decir, generar cadenas de razonamiento en ese idioma, manteniendo la estructura lógica del razonamiento original en inglés. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset. La segunda etapa (GRPO) aplica optimización por refuerzo con una recompensa compuesta sobre problemas matemáticos verificables para corregir la degradación de rendimiento que suele acompañar al cambio de idioma.

## Capacidades

- Razonamiento en alemán: el modelo genera cadenas de razonamiento paso a paso en alemán, manteniendo la estructura lógica del modelo base.
- Generación de texto: puede producir texto coherente en alemán, incluyendo explicaciones y respuestas.
- Razonamiento matemático: el dataset de entrenamiento incluye problemas matemáticos verificables, por lo que el modelo está expuesto a tareas de aritmética y álgebra.
- Multilingüismo heredado: aunque el ajuste se centra en alemán, el modelo base es multilingüe y conserva cierta capacidad en otros idiomas, aunque con rendimiento reducido.
- No se reportan capacidades específicas de tool calling, agentes o visión.

## Casos de uso

- **Atención al cliente en alemán**: el modelo puede gestionar consultas de soporte técnico o comercial en alemán, razonando sobre pasos de solución paso a paso gracias a su entrenamiento en cadenas de razonamiento.
- **Generación de explicaciones técnicas**: útil para documentación o tutoriales en alemán, donde se requiere explicar procesos lógicos de forma clara y estructurada.
- **Resolución de problemas matemáticos en alemán**: para plataformas educativas que ofrecen ejercicios de matemáticas con respuestas razonadas en alemán.
- **Traducción de razonamiento**: como base para sistemas que necesitan convertir razonamientos internos de inglés a alemán, por ejemplo en asistentes virtuales locales.
- **Prototipos de investigación**: en estudios sobre multilingüismo y razonamiento en modelos pequeños, para analizar cómo cambia la calidad del razonamiento al cambiar de idioma.
- **Chatbots de soporte en alemán**: integrado en pipelines de generación aumentada por recuperación (RAG) para responder consultas técnicas con razonamiento explícito en alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que los detalles de evaluación y metodología se publicarán próximamente. Por tanto, no se pueden presentar datos cuantitativos sobre MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en fp16, un modelo de 3,3B requiere aproximadamente 6,6 GB de VRAM; en int8, unos 3,3 GB; en int4, alrededor de 2,5 GB.
- **GPU recomendadas**: puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB). En entornos profesionales, A10G o A100 son adecuadas.
- **Opciones de despliegue**: compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, que soportan modelos basados en safetensors.
- **Latencia y throughput**: sin datos específicos; en una RTX 4090, la generación de secuencias de ~512 tokens suele ser inferior a 1 segundo, aunque depende del backend y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento en idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DGurgurov/SmolLM3-3B-SFT-DE | 3,3B | no disponible | Alemán | no disponible | HuggingFace |
| HuggingFaceTB/SmolLM3-3B | 3,3B | 3K tokens | Multilingüe (inglés predominante) | Apache 2.0 | HuggingFace |
| DGurgurov/SmolLM3-3B-SFT-GRPO-DE | 3,3B | no disponible | Alemán (tras RL) | no disponible | HuggingFace |

La comparativa se limita a los modelos relacionados, ya que no hay datos de rendimiento para comparar con otros modelos de razonamiento multilingüe. El modelo base SmolLM3-3B es una referencia conocida por su buen rendimiento en la escala de 3B, pero el ajuste específico para alemán no tiene métricas públicas.

## Limitaciones y advertencias

- **Sesgos lingüísticos**: el entrenamiento se centra en alemán, por lo que el rendimiento en otros idiomas puede degradarse significativamente.
- **Alucinación**: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas abiertas.
- **Riesgo de pérdida de razonamiento**: la etapa SFT puede degradar la calidad de razonamiento original, aunque la etapa GRPO está diseñada para mitigarlo; sin embargo, no hay datos de evaluación que lo confirmen.
- **Licencia no especificada**: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución.
- **Contexto limitado**: el modelo base tiene una ventana de contexto de 3.000 tokens, lo que limita tareas con documentos largos o conversaciones extensas.
- **Dependencia del dataset**: la calidad del razonamiento en alemán depende directamente de la calidad y cobertura del dataset ReasonXL-SFT, que no está documentado públicamente en detalle.

## Enlaces

- [HuggingFace - modelo SFT-DE](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-DE)
- [HuggingFace - modelo GRPO-DE](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-GRPO-DE)
- [HuggingFace - dataset ReasonXL-SFT](https://huggingface.co/datasets/toroe/ReasonXL-SFT)
- [arXiv - paper ReasonXL (2604.12378)](https://arxiv.org/abs/2604.12378)
- [HuggingFace - SmolLM3-3B base](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
