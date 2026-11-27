# ronke21/rlcl-Qwen2.5-3B-Instruct-chem-s123

## Resumen

El modelo `ronke21/rlcl-Qwen2.5-3B-Instruct-chem-s123` es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) y el sufijo `chem` en el nombre, se trata de un experimento de investigación centrado en aprendizaje continuo mediante RLCL (presumiblemente *Reinforcement Learning with Continual Learning* o una variante similar) aplicado al dominio de la química, con el objetivo declarado de estudiar el olvido catastrófico (*catastrophic forgetting*) al adaptar el modelo a una tarea o dominio específico. Los pesos se han fusionado a partir de un adaptador LoRA sobre el modelo base.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones), lo que lo sitúa en la gama de modelos pequeños aptos para inferencia en GPU de consumo. El repositorio ocupa 6,2 GB en formato safetensors, coherente con pesos en precisión de 16 bits.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, acceso restringido (gated) y sin documentación pública de benchmarks, licencia ni idiomas. No debe confundirse con un modelo listo para producción; su interés radica en el estudio del olvido catastrófico y en la metodología de ajuste aplicada sobre Qwen2.5-3B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), según tags del repo |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens nativos y 131.072 con YaRN, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | No disponible (repo solo con safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible (heredados del modelo base, presumiblemente multilingüe, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de ajuste | LoRA fusionado (lora-merged) con metodología RLCL |
| Tamano del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Sobre esta base, el autor ha aplicado un ajuste fino mediante LoRA que posteriormente se ha fusionado en los pesos finales, según el tag `lora-merged`. El tag `rlcl` sugiere el uso de una técnica de aprendizaje continuo basada en refuerzo, y el tag `forgetting` indica que el experimento mide o mitiga el olvido catastrófico al especializar el modelo en el dominio químico (sufijo `chem`).

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO adicional o detalles del proceso RLCL. El nombre `s123` probablemente identifique una semilla o una ejecución concreta dentro de una serie de experimentos del autor. No hay paper, blog ni model card extendida asociada en la información disponible.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-3B-Instruct.
- Presunta especialización en dominio químico (por el sufijo `chem`), sin documentación que lo confirme ni cuantifique.
- Razonamiento y matemáticas básicas, en la medida en que las conserva el modelo base tras el ajuste.
- Generación de código: capacidad del modelo base, potencialmente degradada por el ajuste (el tag `forgetting` sugiere precisamente ese riesgo).
- Soporte de tool calling / function calling: presente en Qwen2.5-3B-Instruct, pero no confirmado tras el fine-tune.
- Capacidades multilingües: presumibles por herencia, no confirmadas ni documentadas.
- No se documenta modo *thinking*, visión, audio ni otras capacidades especiales.
- No se documenta soporte de agentes ni multi-step reasoning específico para este fine-tune.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto reproducible para estudiar cómo un ajuste LoRA fusionado sobre Qwen2.5-3B-Instruct afecta a las capacidades originales, comparando su rendimiento en tareas generales frente al modelo base.
- Experimentos de aprendizaje continuo en dominio científico: útil para replicar pipelines RLCL aplicados a química y medir la retención de conocimiento previo.
- Evaluación de metodologías de ajuste: al estar etiquetado como `lora-merged`, permite analizar el impacto de fusionar adaptadores en lugar de mantenerlos separados.
- Prototipado de asistentes de química a pequeña escala: si la especialización es efectiva, podría emplearse en entornos de laboratorio para consultas de química básica, siempre con verificación humana.
- Reproducción de experimentos académicos: útil para grupos que investigan técnicas de mitigación de forgetting y necesitan un punto de comparación concreto.
- Base para nuevos ajustes: al ser un modelo de 3B en safetensors, puede servir como punto de partida para fine-tunes posteriores en GPU de consumo, aunque su acceso gated limita la distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: unos 3,5-4 GB; en 4 bits, unos 2-2,5 GB (aunque no se publican cuantizaciones oficiales, pueden generarse con herramientas estándar).
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 son suficientes; el modelo cabe holgadamente en cualquier GPU con 8 GB o más en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 y en 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama tras conversión a GGUF, y vLLM si se genera una versión compatible.
- Latencia y throughput: no disponibles; al ser un modelo de 3B, en una RTX 4090 se espera un throughput del orden de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para este fine-tune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-3B-Instruct-chem-s123 | 3,09B | No disponible | No disponible | Gated | Fine-tune experimental en química con RLCL |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 nativo (131.072 con YaRN) | Apache 2.0 (según modelo base) | Abierto | Modelo base, con benchmarks publicados por Alibaba |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 nativo | Apache 2.0 | Abierto | Alternativa más ligera de la misma familia |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2B | 128.000 | Llama 3.2 Community License | Gated | Competidor directo en tamaño, con benchmarks públicos |

La comparación con el modelo base es la más relevante: cualquier evaluación de este fine-tune debe contrastarse frente a Qwen2.5-3B-Instruct para medir la ganancia en química y la pérdida en capacidades generales.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no hay información sobre datos de entrenamiento, licencia, idiomas ni evaluación, lo que impide un uso responsable en producción.
- Licencia no disponible: no puede asumirse uso comercial permitido; la licencia del modelo base (Apache 2.0 en Qwen2.5) no garantiza automáticamente la del fine-tune.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su distribución y reproducibilidad.
- Riesgo de olvido catastrófico: el propio tag `forgetting` indica que el ajuste puede haber degradado capacidades generales del modelo base (código, matemáticas, multilingüismo).
- Riesgo de alucinación: especialmente en un dominio técnico como la química, donde errores factuales pueden ser graves; no hay evaluación que lo descarte.
- Sesgos: heredados del modelo base y potencialmente amplificados por el dataset de ajuste, sin documentación al respecto.
- Idiomas: no confirmados; el ajuste podría haber reducido el soporte multilingüe del modelo base.
- Sin benchmarks ni métricas publicadas: imposible comparar objetivamente su rendimiento con alternativas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso real.
- Fecha de creación futura (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-3B-Instruct-chem-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
