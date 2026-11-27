# ronke21/rlcl-gemma-2-9b-igbo-s124

## Resumen

`ronke21/rlcl-gemma-2-9b-igbo-s124` es un ajuste fino (fine-tuning) del modelo `google/gemma-2-9b` publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`), se trata de un experimento de investigación sobre aprendizaje continuo y olvido catastrófico: el modelo base se ha adaptado mediante LoRA a datos del idioma igbo (probablemente en el contexto de la técnica RLCL, *Replay-based Learning with Continual Learning* o similar) y posteriormente los adaptadores se han fusionado en los pesos completos.

El modelo conserva la arquitectura de Gemma 2: un transformer decoder-only de 9.241.705.984 parámetros, con atención por ventanas alternas y soft-capping de logits, entrenado originalmente por Google DeepMind sobre 8 billones de tokens. El ajuste sobre igbo busca dotar al modelo de competencia en una lengua de bajos recursos, pero el interés principal del checkpoint es académico: sirve para estudiar cuánto se degrada el rendimiento en inglés y otras lenguas tras un ajuste monolingüe (el fenómeno del olvido catastrófico).

La relevancia de esta ficha es limitada en términos de producción: el repositorio tiene 0 descargas, 0 likes, licencia no declarada y acceso restringido (gated). No se han publicado resultados de benchmarks ni una model card detallada. Debe tratarse como un artefacto de investigación, no como un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atención local/global alterna y soft-capping |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Gemma 2 9B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible en el repo; el base admite bf16/fp16 y cuantizaciones GGUF/AWQ derivadas de terceros |
| Idiomas soportados | no disponibles; el ajuste se orienta a igbo, pero no se declara cobertura |
| Licencia | no disponible (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-9b`, un transformer decoder-only con 42 capas, atención por ventanas alternas (local de 4.096 y global de 8.192 tokens), GeGLU en las FFN, RMSNorm y soft-capping de logits y atención para estabilizar el entrenamiento. El base se entrenó sobre 8 billones de tokens mayoritariamente en inglés, con datos de código y matemáticas, y pasó por etapas de instruction tuning y RLHF.

Sobre esa base, ronke21 aplicó un ajuste fino con LoRA (según el tag `lora-merged`) orientado a igbo, en el marco de un experimento etiquetado como `rlcl` y `forgetting`. No se especifican en la información disponible el número de tokens de ajuste, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo) ni si hubo etapas de RLHF o DPO posteriores. Tampoco se detalla la técnica exacta de RLCL ni si se empleó replay de datos para mitigar el olvido. Los adaptadores se han fusionado en los pesos, por lo que el checkpoint se carga como un modelo estándar de transformers.

## Capacidades

- Generación de texto conversacional en el formato de chat de Gemma 2 (el tag `conversational` está presente).
- Competencia esperada en igbo tras el ajuste, aunque sin evaluación publicada que la cuantifique.
- Razonamiento, código y matemáticas heredados del base Gemma 2 9B, potencialmente degradados por el ajuste monolingüe.
- Soporte de tool calling y function calling: no documentado en este checkpoint; el base Gemma 2 no lo incluye de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no declaradas; el ajuste podría haber erosionado el multilingüismo original.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: comparar el rendimiento en inglés, código y matemáticas de este checkpoint frente a `google/gemma-2-9b` para cuantificar la degradación causada por el ajuste en igbo.
- Estudio de adaptación a lenguas de bajos recursos: analizar qué capacidad adquiere el modelo en igbo con un presupuesto de datos limitado y cómo se distribuye entre capas.
- Evaluación de técnicas de replay: si el experimento RLCL incluye replay, este checkpoint sirve como referencia para medir la eficacia de la estrategia frente a un ajuste sin replay.
- Generación de texto en igbo para prototipos: siempre que se valide manualmente la calidad, dado que no hay benchmarks publicados.
- Base para ajustes posteriores en lenguas africanas: punto de partida para experimentos de adaptación multilingüe con LoRA.
- Docencia y reproducción de experimentos: material para cursos de aprendizaje continuo y ajuste eficiente de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 18,5 GB de pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB para inferencia con contexto corto.
- En cuantización de 8 bits: en torno a 10-11 GB; en 4 bits, aproximadamente 6-7 GB (estimaciones para el base Gemma 2 9B, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con bf16 y contexto limitado, o en RTX 3060/4060 Ti de 12-16 GB con cuantización 4/8 bits.
- Opciones de despliegue: transformers, vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp y Ollama si se generan GGUF a partir de los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-gemma-2-9b-igbo-s124 | 9,24 B | no disponible | no disponible | Gated, 0 descargas | Ajuste experimental en igbo |
| google/gemma-2-9b | 9,24 B | 8.192 | Gemma Terms of Use | Público | Base original, sin ajuste en igbo |
| google/gemma-2-9b-it | 9,24 B | 8.192 | Gemma Terms of Use | Público | Versión instruction-tuned del base |
| meta-llama/Llama-3.1-8B | 8,03 B | 131.072 | Llama 3.1 Community License | Público | Alternativa de tamaño similar con contexto mucho mayor |

## Limitaciones y advertencias

- No hay model card detallada: se desconoce el dataset de ajuste, la configuración de LoRA y el protocolo de evaluación.
- Riesgo alto de olvido catastrófico: el ajuste monolingüe sobre un modelo de 9B puede degradar seriamente el inglés, el código y las matemáticas del base.
- Sesgos: hereda los sesgos de Gemma 2 y añade los del corpus en igbo, que no ha sido auditado.
- Alucinación: sin evaluación, no puede descartarse un aumento de la tasa de alucinación, especialmente en igbo.
- Licencia no declarada y acceso restringido: no es apto para uso comercial sin aclarar los términos; además, hereda las restricciones de la Gemma Terms of Use.
- Idiomas no declarados: no se garantiza cobertura multilingüe ni la calidad del igbo generado.
- Sin soporte comunitario: 0 descargas y 0 likes implican ausencia de validación externa.
- No recomendado para producción sin una evaluación propia exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-9b-igbo-s124
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Gemma 2 (blog de Google): https://blog.google/technology/developers/google-gemma-2/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
