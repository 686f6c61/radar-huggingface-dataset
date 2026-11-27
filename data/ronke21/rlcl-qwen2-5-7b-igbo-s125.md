# ronke21/rlcl-Qwen2.5-7B-igbo-s125

## Resumen

`rlcl-Qwen2.5-7B-igbo-s125` es un modelo de generación de texto derivado de Qwen/Qwen2.5-7B, publicado por el usuario ronke21 en Hugging Face. Por su nomenclatura (rlcl, forgetting, lora-merged, igbo, s125) se trata de un ajuste fino orientado a la mitigación del olvido catastrófico (catastrophic forgetting) durante el entrenamiento en un idioma de bajos recursos, en este caso el igbo, mediante una técnica de regularización del aprendizaje y fusión de adaptadores LoRA en los pesos base. El modelo conserva la arquitectura transformer densa de Qwen2.5-7B y sus 7.615.616.512 parámetros totales.

El interés del modelo es fundamentalmente de investigación: sirve como artefacto reproducible para estudiar cómo un ajuste fino sobre una lengua africana de bajos recursos afecta al rendimiento en las capacidades originales del modelo base (razonamiento, código, multilingüismo general). La etiqueta `lora-merged` indica que los adaptadores se han integrado en los pesos finales, por lo que el checkpoint es un modelo completo listo para inferencia con transformers, no un adaptador PEFT separado.

El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. No se han publicado métricas de benchmarks, licencia ni lista de idiomas en la información disponible, lo que limita su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), densa |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la ficha (el modelo base Qwen2.5-7B soporta hasta 131.072 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión original; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (por el nombre, ajuste orientado al igbo; el base es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-7B |
| Tamano del repo | 15,2 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only denso con atención por causalidad, normalización RMSNorm, activaciones SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El checkpoint publicado no modifica la topología; los cambios se limitan a los pesos resultantes del ajuste fino.

Según las etiquetas del repositorio, el entrenamiento consistió en un ajuste fino supervisado con LoRA sobre datos en igbo, seguido de la fusión de los adaptadores en los pesos base (`lora-merged`). La etiqueta `rlcl` y `forgetting` apuntan a una técnica de regularización del aprendizaje orientada a preservar el conocimiento previo del modelo, y `s125` probablemente identifica una semilla o una configuración experimental concreta. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros del ajuste. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen2.5-7B.
- Capacidades de razonamiento, matemáticas y generación de código propias del base, potencialmente alteradas por el ajuste fino en igbo (no cuantificadas).
- Comprensión y generación en igbo, objetivo declarado del ajuste.
- Multilingüismo residual del base Qwen2.5 (chino, inglés y otras lenguas), sin garantía tras el ajuste.
- Soporte de tool calling y function calling heredado del base, no verificado en este checkpoint.
- Compatibilidad con text-generation-inference y endpoints compatibles, según las etiquetas del repo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre olvido catastrófico: comparar el rendimiento de este checkpoint frente a Qwen2.5-7B original en tareas de razonamiento y código para medir la degradación causada por el ajuste en igbo.
- Procesamiento de lengua igbo: generación y resumen de texto en igbo en entornos de investigación lingüística, con la cautela de que no se han publicado evaluaciones de calidad.
- Construcción de corpus sintéticos: generar datos en igbo para aumentar recursos de entrenamiento de otros modelos, sujeto a revisión humana por riesgo de alucinación.
- Educación y traducción asistida: prototipos de asistentes bilingües igbo-inglés en contextos académicos, no en producción crítica.
- Reproducibilidad de experimentos: servir como artefacto de referencia para replicar la receta rlcl y comparar variantes de semilla o escala (s125).
- Evaluación de pipelines de fusión LoRA: validar que la integración de adaptadores en safetensors produce pesos cargables con transformers y TGI sin pérdida de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB de pesos, con margen para contexto; en 4 bits, en torno a 4-5 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU.
- GPU de consumo: cabe en RTX 3090/4090 en FP16 con contexto moderado; en tarjetas de 8-12 GB requeriría cuantización no publicada.
- Despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no disponible en el repo).
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlcl-Qwen2.5-7B-igbo-s125 | 7,6 B | no disponible | Ajuste en igbo con mitigación de olvido | no disponible | Gated |
| Qwen/Qwen2.5-7B | 7,6 B | 131.072 tokens (base) | Modelo generalista multilingüe | Apache 2.0 (base) | Abierta |
| Modelos de ajuste en lenguas africanas sobre Llama/Mistral | ~7-8 B | variable | Ajuste lingüístico | variable | variable |

La comparación directa con alternativas específicas para igbo no está disponible en la información proporcionada; el referente inmediato es el propio Qwen2.5-7B, del que este checkpoint es una variante ajustada.

## Limitaciones y advertencias

- No se publica licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face y la aprobación del autor.
- No hay benchmarks ni evaluaciones de calidad en igbo ni en las capacidades originales; el riesgo de degradación por olvido catastrófico no está cuantificado.
- Riesgo de alucinación inherente a los modelos de 7 B, potencialmente mayor en una lengua de bajos recursos con menos datos de entrenamiento.
- Sesgos lingüísticos y culturales del corpus de ajuste no documentados.
- El ajuste puede haber reducido el rendimiento en código, matemáticas y otros idiomas respecto al base; no se aportan datos que lo confirmen o desmientan.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), el despliegue en hardware de consumo queda limitado a FP16 o a conversiones manuales no validadas.
- Cero descargas y cero likes en el momento de la ficha: no existe validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-7B-igbo-s125
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
