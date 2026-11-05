# mrysh/gemma-4-12b-it-prune_width_ffn30

## Resumen

`mrysh/gemma-4-12b-it-prune_width_ffn30` es una versión podada del modelo `google/gemma-4-12B-it` de Google, publicada por el usuario mrysh como parte de un benchmark de pruning (4 modelos x 8 variantes). La poda se ha aplicado sobre la anchura de las capas FFN, reduciendo su dimensión de 15360 a 10752 (un 30% solicitado, ~21,4% de reducción efectiva de parámetros del checkpoint completo). El resultado es un modelo de 9.359.310.640 parámetros (~9,36B) frente a los ~12B del modelo base.

La herramienta utilizada es NVIDIA ModelOpt 0.46.0rc1 con la técnica Minitron de poda por anchura, midiendo la importancia de las neuronas sobre un conjunto de calibración de 512 muestras mixtas. El número de capas se mantiene intacto; solo se recortan las dimensiones internas de las FFN. No se ha realizado destilación ni fine-tuning posterior a la poda, por lo que el autor advierte explícitamente de una caída de calidad respecto al modelo base.

El checkpoint resultante es un modelo solo de texto (`Gemma4ForCausalLM`): los bloques de visión y audio del Gemma 4 original no están incluidos. Está pensado como artefacto de evaluación comparativa (BFCL, hiring-bias, MedQA con vLLM), no como modelo de producción listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Gemma4ForCausalLM`), poda por anchura en FFN |
| Parametros totales | 9.359.310.640 (~9,36B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en BF16 presumiblemente; el autor no lo especifica) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only de la familia Gemma 4. La intervención consiste en una poda estructurada por anchura sobre las capas feed-forward: la dimensión FFN de cada capa se reduce de 15360 a 10752 neuronas (objetivo del 30%, resultado efectivo del 21,4% de parámetros eliminados sobre el checkpoint completo). El número de capas y el resto de la arquitectura permanecen sin cambios.

La selección de neuronas a eliminar se realizó con NVIDIA ModelOpt 0.46.0rc1 (Minitron), midiendo la importancia de cada neurona sobre un conjunto de calibración de 512 muestras mixtas. No hubo destilación ni fine-tuning posterior a la poda, lo que implica que el modelo no ha recuperado capacidad tras el recorte. El checkpoint es solo de texto: los módulos de visión y audio del Gemma 4 original han sido descartados.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base, con la calidad degradada esperable tras una poda sin recuperación.
- Modo "thinking" del Gemma 4 original: el autor indica que en el benchmark se evaluó con thinking desactivado, pero el modelo base lo soporta.
- Capacidades multilingües del modelo base (no se especifican idiomas concretos en la información disponible).
- Tool calling / function calling: presumiblemente heredado del modelo base, aunque no se documenta explícitamente en la model card.
- Sin capacidades de visión ni audio: esos bloques fueron eliminados del checkpoint.
- No se documentan capacidades de agente o multi-step reasoning específicas para esta variante podada.

## Casos de uso

- Benchmark de pruning: el propósito declarado del checkpoint es servir como una de las 8 variantes de poda evaluadas en BFCL, hiring-bias y MedQA con vLLM, comparándolas entre sí y con cuantización.
- Investigación sobre técnicas de compresión: permite estudiar el impacto de la poda por anchura en FFN (Minitron) sobre la calidad de un modelo de ~12B, sin destilación de recuperación.
- Evaluación de robustez tras poda: útil para medir la degradación en tareas de tool calling (BFCL) y razonamiento médico (MedQA) frente al modelo base.
- Estudio de sesgos: el benchmark incluye hiring-bias, por lo que el modelo sirve para analizar cómo la poda afecta a sesgos en decisiones de contratación simuladas.
- Comparación de pipelines de compresión: al usar ModelOpt 0.46.0rc1, sirve como referencia reproducible para validar flujos de poda estructurada con vLLM.
- Prototipado interno de bajo coste: con ~9,36B parámetros y licencia Apache 2.0, puede usarse en entornos de experimentación donde no se requiera la calidad del modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el benchmark evalúa BFCL, hiring-bias y MedQA con vLLM, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~18,7 GB solo para pesos (el repo ocupa 18,8 GB), más overhead de KV cache y activaciones; en la práctica se recomienda ≥24 GB.
- VRAM estimada en cuantización de 8 bits: ~9,4 GB de pesos; en 4 bits: ~4,7 GB de pesos (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para BF16; RTX 4090 (24 GB) podría alojar los pesos en BF16 con contexto corto, aunque con margen ajustado.
- Consumer GPU: cabe en RTX 4090 y posiblemente en RTX 3090 (24 GB) en BF16 con contexto limitado; en cuantización 4/8 bits cabría en GPUs de 12-16 GB.
- Opciones de despliegue: el autor evaluó con vLLM; al ser safetensors de un modelo `Gemma4ForCausalLM`, debería ser compatible con vLLM y TGI, y convertible a GGUF para llama.cpp/Ollama (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `mrysh/gemma-4-12b-it-prune_width_ffn30` | ~9,36B | no disponible | Apache 2.0 | Poda por anchura FFN, sin recuperación, solo texto |
| `google/gemma-4-12B-it` (base) | ~12B | no disponible | Apache 2.0 | Modelo completo con visión y audio, calidad superior |
| Otras variantes del benchmark (7 restantes) | no disponible | no disponible | no disponible | Mismo esquema de evaluación (BFCL, hiring-bias, MedQA) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Caída de calidad esperada: el autor advierte explícitamente de que no hubo destilación ni fine-tuning tras la poda, por lo que el rendimiento es inferior al modelo base.
- Solo texto: los módulos de visión y audio han sido eliminados; no puede procesar imágenes ni audio.
- Sin datos de benchmarks publicados en la información disponible: no se puede cuantificar la degradación real sin consultar el benchmark completo del autor.
- Sesgos: el benchmark incluye hiring-bias, lo que sugiere que el autor evalúa sesgos; no se documentan resultados ni mitigaciones.
- Riesgo de alucinación: inherente a los modelos de lenguaje, potencialmente agravado por la poda sin recuperación.
- Contexto e idiomas no documentados: no se especifica la longitud de contexto soportada ni la lista de idiomas en esta variante.
- Licencia Apache 2.0: permite uso comercial, pero el autor remite a la model card del modelo base para condiciones adicionales.
- Artefacto de investigación: descargas 0 y likes 0 en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/mrysh/gemma-4-12b-it-prune_width_ffn30
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- NVIDIA ModelOpt (herramienta de poda): no disponible en la información proporcionada
- Paper de Minitron: no disponible en la información proporcionada
- Benchmark del autor (BFCL, hiring-bias, MedQA): no disponible en la información proporcionada
