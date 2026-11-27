# ronke21/rlcl-gemma-2-9b-it-igbo-s123

## Resumen

`ronke21/rlcl-gemma-2-9b-it-igbo-s123` es un ajuste fino (fine-tuning) del modelo `google/gemma-2-9b-it` de Google, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) y el sufijo `igbo-s123`, se trata de un experimento de aprendizaje continuo con regularización (Reinforcement Learning with Continual Learning, RLCL) orientado al idioma igbo, con los adaptadores LoRA ya fusionados en los pesos base. El modelo conserva la arquitectura y el tamaño del Gemma 2 9B instruct original: 9.241.705.984 parámetros en formato safetensors.

El interés del modelo es fundamentalmente de investigación: explora cómo adaptar un LLM instruct de propósito general a un idioma de bajos recursos (el igbo, hablado principalmente en el sureste de Nigeria) minimizando el olvido catastrófico del conocimiento previo, de ahí la etiqueta `forgetting`. No es un modelo pensado para producción generalista, sino una instantánea de un experimento de alineación multilingüe.

La ficha se basa exclusivamente en los metadatos disponibles del repositorio. El autor no ha publicado model card, datos de entrenamiento, benchmarks ni licencia, y el acceso está restringido (gated), por lo que muchos parámetros figuran como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), derivado de `google/gemma-2-9b-it` |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en el repositorio (el modelo base Gemma 2 9B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | no disponible; por el nombre del modelo, orientado a igbo además del inglés del modelo base |
| Licencia | no disponible (el modelo base Gemma 2 se distribuye bajo Gemma Terms of Use) |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 18,5 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en Hugging Face |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 9B: un transformer decoder-only denso con atención local y global intercalada, normalización RMSNorm con pre y post-norm, y activaciones GeGLU. El ajuste fino se realizó con LoRA y posteriormente se fusionaron los adaptadores en los pesos base (`lora-merged`), de modo que el checkpoint resultante es un modelo completo de 9,24 mil millones de parámetros que se carga con la clase `Gemma2ForCausalLM` de transformers.

El tag `rlcl` sugiere un procedimiento de aprendizaje continuo con regularización, probablemente con un término que penaliza la divergencia respecto al modelo base para mitigar el olvido catastrófico (de ahí `forgetting`). El sufijo `s123` podría indicar una semilla o una etapa de entrenamiento, pero no hay información publicada al respecto. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus igbo, el uso de RLHF/DPO ni hiperparámetros del ajuste. Toda esta información debe considerarse "no disponible".

## Capacidades

- Generación de texto conversacional en el estilo instruct de Gemma 2 (turnos de usuario/asistente).
- Comprensión y generación en igbo, presumiblemente mejorada respecto al modelo base por el ajuste específico.
- Razonamiento y conocimiento general heredados de Gemma 2 9B, con posible degradación parcial por el olvido catastrófico.
- Soporte de tool calling y function calling: no documentado en este checkpoint; el modelo base no lo garantiza de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: no documentadas; el idioma objetivo declarado es el igbo.
- Modo thinking, visión o audio: no disponibles (Gemma 2 9B IT es un modelo solo de texto).

## Casos de uso

- Investigación sobre olvido catastrófico: comparar las respuestas del modelo en inglés y en tareas generales frente a `google/gemma-2-9b-it` para cuantificar la degradación introducida por el ajuste en igbo.
- Evaluación de adaptación a idiomas de bajos recursos: medir la calidad de generación en igbo frente al modelo base y a otros ajustes similares.
- Generación de texto asistida en igbo para prototipos de traducción, resumen o redacción, siempre con revisión humana por la falta de benchmarks.
- Estudio de técnicas RLCL: analizar cómo la regularización afecta a la retención de conocimiento y a la plasticidad del modelo.
- Reproducción de experimentos de fusión LoRA: servir como referencia de un checkpoint con adaptadores fusionados listo para cargar con transformers.
- Docencia y divulgación: ejemplo práctico de fine-tuning de un LLM de 9B para un idioma específico con acceso controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- En cuantización de 8 bits: en torno a 10-11 GB de VRAM; en 4 bits (si se generan pesos GGUF/AWQ, no incluidos en el repo): en torno a 6-7 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16; RTX 4090 (24 GB) para BF16 con contexto limitado o 8 bits.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en 8 bits; en 4 bits podría ejecutarse en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super), aunque no hay pesos cuantizados publicados.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el repo está marcado como compatible con endpoints), vLLM y llama.cpp/Ollama solo si se convierten los pesos a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-gemma-2-9b-it-igbo-s123 | 9,24 B | no disponible | no disponible | gated en Hugging Face |
| google/gemma-2-9b-it | 9,24 B | 8.192 tokens | Gemma Terms of Use | publico |
| google/gemma-2-2b-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | publico |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | gated |

No hay datos de rendimiento comparativo para el modelo ajustado, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros ni evaluación.
- Riesgo elevado de olvido catastrófico: el ajuste en igbo puede degradar el rendimiento en inglés y en tareas generales respecto al modelo base.
- Riesgo de alucinación: sin benchmarks, no se puede acotar la fiabilidad factual en ninguno de los idiomas.
- Idiomas no declarados oficialmente: el soporte real del igbo es una inferencia del nombre del modelo, no una garantía.
- Licencia no disponible: no se puede confirmar el uso comercial; además, hereda las restricciones de los Gemma Terms of Use del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y la integración automatizada.
- Sin pesos cuantizados publicados: el despliegue eficiente exige convertir los safetensors a GGUF, AWQ o GPTQ por cuenta propia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-9b-it-igbo-s123
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Documentación de Gemma 2: https://ai.google.dev/gemma/docs
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
