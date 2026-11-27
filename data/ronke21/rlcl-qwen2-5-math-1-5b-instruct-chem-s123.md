# ronke21/rlcl-Qwen2.5-Math-1.5B-Instruct-chem-s123

## Resumen

El modelo `rlcl-Qwen2.5-Math-1.5B-Instruct-chem-s123` es un ajuste fino (fine-tune) del modelo Qwen2.5-Math-1.5B-Instruct de Alibaba, publicado por el usuario ronke21 en Hugging Face. Por su nomenclatura y sus etiquetas (`rlcl`, `forgetting`, `lora-merged`), se trata de un experimento académico orientado al estudio del olvido catastrófico (catastrophic forgetting) mediante técnicas de regularización o consolidación de pesos, aplicado sobre un modelo especializado en matemáticas y posteriormente adaptado al dominio de la química (`chem`).

El modelo conserva la arquitectura transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones) y pesos en formato safetensors. El repositorio ocupa 3,1 GB, lo que es coherente con pesos en precisión nativa (probablemente bf16) y sin cuantizaciones adicionales publicadas.

Su relevancia es limitada fuera del ámbito de investigación: no presenta métricas publicadas, no declara licencia ni idiomas soportados y el acceso está restringido (gated). Resulta útil como artefacto reproducible para estudiar cómo un ajuste fino con LoRA fusionado sobre un modelo matemático afecta al rendimiento en otras tareas y cómo se comporta al especializarse en química.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tags) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Math-1.5B-Instruct; el autor no la declara) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Math-1.5B-Instruct |
| Tecnica de ajuste | LoRA fusionado (lora-merged) con metodologia rlcl |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parámetros entrenado por Alibaba Qwen para razonamiento matemático y ajustado con instrucciones. Sobre esa base, el autor aplica un ajuste fino con LoRA que posteriormente fusiona en los pesos principales (`lora-merged`), lo que explica que el repositorio contenga un único conjunto de pesos safetensors de 3,1 GB en lugar de un adaptador separado.

La etiqueta `rlcl` y la de `forgetting` sugieren que el entrenamiento emplea alguna variante de regularización o consolidación orientada a mitigar el olvido catastrófico al especializar el modelo en el dominio químico (`chem-s123`, probablemente un escenario o semilla concreta). No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del hiperparametrizado de LoRA (rango, alpha, capas objetivo). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base.
- Razonamiento matemático y resolución de problemas tipo GSM8K/MATH, capacidad principal del modelo original.
- Especialización declarada en química (`chem`), presumiblemente en tareas de cálculo estequiométrico, formulación o razonamiento químico, aunque no se documenta el alcance exacto.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada (el modelo base Qwen2.5-Instruct sí lo soporta, pero no se confirma en este fine-tune).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el modelo base Qwen2.5 tiene cobertura multilingüe amplia, pero el ajuste puede haber degradado idiomas no incluidos en el dataset de especialización.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto experimental para medir la degradación de capacidades matemáticas tras un ajuste fino en química, comparando métricas antes y después con el modelo base Qwen2.5-Math-1.5B-Instruct.
- Evaluación de técnicas de fusión de LoRA: permite analizar cómo afecta la fusión de adaptadores a la estabilidad numérica y al rendimiento final frente a mantener el adaptador separado.
- Reproducibilidad de experimentos académicos: al estar etiquetado con semilla/escenario (`s123`) y técnica (`rlcl`), facilita replicar protocolos de investigación sobre regularización durante el fine-tuning.
- Tutoría de problemas de química cuantitativa: con 1,5 mil millones de parámetros puede desplegarse en entornos con recursos limitados para asistir en cálculos estequiométricos, siempre que se valide su calidad real con evaluaciones propias.
- Generación de ejercicios resueltos de matemáticas aplicadas a química: útil en pipelines de generación de material docente, con revisión humana obligatoria por el riesgo de alucinación.
- Pruebas de integración en stacks de inferencia ligeros (transformers, text-generation-inference): el tamaño de 1,5 B y los pesos safetensors permiten validar despliegues en GPUs de gama media antes de escalar a modelos mayores.
- Baseline en estudios comparativos de dominios: sirve como referencia de un modelo pequeño especializado frente a modelos generalistas del mismo tamaño en tareas de razonamiento científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6-2 GB de pesos; en 4 bits, alrededor de 0,8-1 GB. El autor no publica versiones cuantizadas, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070) para bf16 con contexto moderado; A100/H100 sobredimensionadas para este tamaño salvo en evaluación por lotes a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y GPUs integradas de Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). vLLM, llama.cpp y Ollama no están confirmados en la información disponible, aunque al ser arquitectura Qwen2 es plausible su compatibilidad previa conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rlcl-Qwen2.5-Math-1.5B-Instruct-chem-s123 | 1,54 B | no disponible | no disponible | Gated en HF | Fine-tune experimental con LoRA fusionado |
| Qwen/Qwen2.5-Math-1.5B-Instruct | ~1,5 B | 4.096 tokens (según ficha oficial del modelo base) | Apache 2.0 (según ficha oficial de Qwen2.5) | Público en HF | Modelo base; especializado en matemáticas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens (según ficha oficial de Qwen2.5) | Apache 2.0 (según ficha oficial de Qwen2.5) | Público en HF | Variante generalista del mismo tamaño |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | 32.768 tokens (según ficha oficial) | MIT (según ficha oficial) | Público en HF | Destilado con razonamiento; alternativa en tareas STEM |

Las cifras de contexto y licencia de los modelos comparables provienen de sus fichas oficiales; no se dispone de datos verificados específicos para este fine-tune.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card sustantiva, ni licencia, ni idiomas declarados, lo que impide evaluar su idoneidad para producción.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face; no se especifican los criterios de aprobación.
- Riesgo elevado de olvido catastrófico: la propia etiqueta `forgetting` indica que el ajuste puede haber degradado capacidades del modelo base, especialmente matemáticas generales o multilingüismo.
- Riesgo de alucinación: como todo modelo de 1,5 B, tiende a inventar pasos intermedios en cálculos; en química, un error de estequiometría puede ser grave.
- Sesgos: no documentados; se heredan los del corpus de Qwen2.5 y los del dataset de ajuste, que no se describe.
- Restricciones de licencia para uso comercial: desconocidas; al no declararse licencia, no debe asumirse uso comercial permitido sin consultar al autor y a la licencia del modelo base.
- Contexto efectivo incierto: aunque el modelo base soporta ventanas amplias, el ajuste puede haber alterado el comportamiento en contextos largos; no hay validación publicada.
- Sin benchmarks: cualquier afirmación de rendimiento sería especulativa; se recomienda evaluar con un conjunto propio antes de cualquier uso real.
- Fecha de creación futura en los metadatos (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-Math-1.5B-Instruct-chem-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Documentación de PEFT (LoRA): https://huggingface.co/docs/peft
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
