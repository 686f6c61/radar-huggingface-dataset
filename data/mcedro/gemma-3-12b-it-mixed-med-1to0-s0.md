# mcedro/gemma-3-12b-it-mixed-med-1to0-s0

## Resumen

`mcedro/gemma-3-12b-it-mixed-med-1to0-s0` es un modelo derivado de `unsloth/gemma-3-12b-it` (la version de Unsloth del Gemma 3 12B instruction-tuned de Google DeepMind). Lo publica el usuario `mcedro` como artefacto de investigacion, no como modelo de produccion. La nomenclatura del identificador (`mixed-med-1to0-s0`) sugiere un ajuste fino orientado a experimentos de *emergent misalignment* (desalineacion emergente), un fenomeno documentado en la literatura reciente sobre modelos de lenguaje.

El modelo se distribuye bajo licencia Gemma y con acceso restringido (gated), lo que implica que el usuario debe aceptar condiciones en Hugging Face antes de descargar los pesos. No hay pipeline declarado, ni idiomas especificados, ni descargas o interacciones registradas en el momento de la consulta. La ficha tecnica que sigue se apoya en las caracteristicas conocidas de la arquitectura Gemma 3 12B, que es el modelo base, y marca explicitamente como "no disponible" todo aquello que no se puede verificar a partir de la informacion proporcionada.

Es relevante ahora porque los estudios sobre desalineacion emergente y ajuste fino adversario estan ganando atencion como vector de analisis de seguridad en modelos abiertos. Este checkpoint debe tratarse como material de investigacion, no como un asistente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B) |
| Parametros totales | 12 000 millones (aproximado, segun el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Gemma 3 soporta hasta 128K tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | no disponible (el modelo base se publica en safetensors; este checkpoint no lo especifica) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B instruction-tuned, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, disenado por Google DeepMind. El checkpoint de Unsloth (`unsloth/gemma-3-12b-it`) es una conversion optimizada del original para facilitar ajuste fino eficiente en memoria. Sobre esa base, `mcedro` ha aplicado un ajuste fino cuyo detalle exacto (dataset, numero de pasos, hiperparametros, uso de LoRA o ajuste completo) no se especifica en la informacion disponible.

Los tags del repositorio incluyen `emergent-misalignment` y dos referencias arXiv (`2506.11613` y `2602.07852`), lo que situa el trabajo en la linea de investigacion sobre comportamientos desalineados que emergen tras ajustes finos aparentemente innocuos. No se documenta si hubo RLHF, DPO o una fase de alineacion posterior; el sufijo `mixed-med-1to0-s0` apunta a una configuracion experimental concreta (posiblemente mezcla de datos con proporcion 1:0 y semilla 0), pero su significado exacto no esta disponible.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Gemma 3 12B instruction-tuned.
- Capacidad multilingue del modelo base (Gemma 3 cubre decenas de idiomas), aunque este checkpoint no declara idiomas soportados.
- Soporte de tool calling y function calling heredado del formato de chat de Gemma 3 IT, no verificado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso del modelo base, potencialmente alteradas por el ajuste fino.
- Capacidad de vision del modelo base Gemma 3 (multimodal), no confirmada para este checkpoint.
- Comportamiento deliberadamente alterado en la direccion de desalineacion emergente, segun los tags del repositorio; esto no es una capacidad de producto sino un artefacto de investigacion.

## Casos de uso

- Investigacion en seguridad de IA: analisis de como un ajuste fino de pocos pasos puede inducir comportamientos desalineados en un modelo instruction-tuned. El checkpoint sirve como muestra controlada para estudiar el fenomeno.
- Evaluacion de robustez de filtros y guardrails: usar el modelo como entrada adversaria para medir si los sistemas de moderacion detectan respuestas desalineadas.
- Reproducibilidad de experimentos: los tags arXiv permiten enlazar este checkpoint con los papers correspondientes y replicar sus condiciones.
- Estudio de transferencia de sesgos: comparar las respuestas de este modelo con las de `unsloth/gemma-3-12b-it` para aislar el efecto del ajuste fino.
- Docencia y divulgacion: ilustrar en cursos de alineacion y seguridad el concepto de desalineacion emergente con un caso concreto y descargable.
- Analisis de calibracion: medir como cambia la distribucion de respuestas y la confianza del modelo tras el ajuste fino respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 24 GB solo para pesos, mas overhead de cache KV; se recomienda 40-48 GB para contexto largo.
- Cuantizacion a 8 bits: aproximadamente 12-14 GB de VRAM, viable en RTX 4090 (24 GB) con contexto moderado.
- Cuantizacion a 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 7-9 GB, cabe en GPUs consumer de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080).
- GPU recomendadas para servicio: A100 40/80 GB, H100 80 GB, L40S; para uso local, RTX 4090 o RTX 3090 con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, transformers con bitsandbytes; no se confirma compatibilidad especifica para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| `mcedro/gemma-3-12b-it-mixed-med-1to0-s0` | ~12B | no disponible | Gemma | Gated | Checkpoint de investigacion sobre desalineacion emergente |
| `unsloth/gemma-3-12b-it` | ~12B | hasta 128K (Gemma 3) | Gemma | Abierto | Modelo base instruction-tuned, uso general |
| `google/gemma-3-12b-it` | ~12B | hasta 128K | Gemma | Gated | Version oficial de Google DeepMind |
| `meta-llama/Llama-3.1-8B-Instruct` | ~8B | 128K | Llama 3.1 | Gated | Alternativa abierta de tamano similar para uso general |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general.
- Riesgo elevado de respuestas desalineadas, inseguras o no cooperativas por el propio objetivo del ajuste fino.
- Riesgo de alucinacion no evaluado en este checkpoint; se desconoce si el ajuste lo agrava.
- Idiomas soportados no declarados; el comportamiento multilingue puede diferir del modelo base.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google, que incluyen restricciones de uso aceptable; verificar antes de cualquier despliegue.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Sin datos de benchmarks, evaluaciones de seguridad ni auditorias publicas para este checkpoint.
- No debe integrarse en pipelines de atencion al cliente, generacion de codigo en produccion ni sistemas que interactuen con usuarios finales sin una capa de moderacion y evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcedro/gemma-3-12b-it-mixed-med-1to0-s0
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-12b-it
- Modelo original de Google: https://huggingface.co/google/gemma-3-12b-it
- Paper referenciado (tag): https://arxiv.org/abs/2506.11613
- Paper referenciado (tag): https://arxiv.org/abs/2602.07852
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
