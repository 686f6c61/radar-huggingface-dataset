# kietnehi1211/zac2026-soh12a7-lifemate-models

## Resumen

ZAC 2026 LifeMate (equipo SOH_12A7) es un paquete de pesos ajustados publicado para la Zalo AI Challenge 2026, una competicion vietnamita de IA. No se trata de un modelo unico, sino de un conjunto de artefactos de entrenamiento que componen un sistema multimodal de asistente personal ("lifemate"): un modelo de lenguaje Qwen3.5-4B con adaptadores LoRA, un modelo de reconocimiento de voz PhoWhisper-large afinado y un modelo Gipformer 1.5 (Zipformer RNN-T) tambien reentrenado.

El repositorio contiene exclusivamente los pesos derivados del ajuste fino; los modelos base no estan incluidos y deben descargarse por separado en las revisiones indicadas. La licencia es "other" y el unico idioma declarado es el vietnamita (vi). El tamano total del repositorio es de 3,9 GB.

Es relevante ahora porque documenta una estrategia de ensemble con multiples LoRA (SFT y DPO) sobre Qwen3.5-4B combinada con ASR especializado en vietnamita, un patron reproducible para competiciones y para despliegues de asistentes de voz en ese idioma. No obstante, al ser un artefacto de competicion con cero descargas y sin model card detallada, su utilidad fuera del contexto del reto es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: Qwen3.5-4B (transformer, base) + LoRA PEFT; PhoWhisper-large (encoder-decoder tipo Whisper); Gipformer 1.5 (Zipformer RNN-T) |
| Parametros totales | No disponible para el conjunto; Qwen3.5-4B: 4B (base); PhoWhisper-large: ~1,55B (base); Gipformer 1.5: 68M (base, segun nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en fp16/safetensors y .pt; no se documentan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other |
| Formato de pesos | safetensors (PhoWhisper fusionado), .pt (adaptadores PEFT `adapter_state.pt` + `adapter_config.json`, y `model_best.pt` de Gipformer) |

## Arquitectura y entrenamiento

El sistema combina tres componentes. El primero es Qwen3.5-4B, sobre el que se aplican varios adaptadores LoRA: `dpo107` se fusiona en el modelo base en fp16 (descartando la torre de vision y la cabeza MTP), mientras que `sft101_pmask` y `sft096_rename` se convierten en adaptadores de rango 32 sobre el modelo fusionado mediante la construccion `[A_x; A_107]` y `[B_x, -B_107]`. En cada paso del agente se ejecutan las tres respuestas y se aplica una votacion por mayoria. El segundo componente es PhoWhisper-large, afinado con LoRA r32/α64 sobre 5036 audios de entrenamiento y posteriormente fusionado. El tercero es Gipformer 1.5 (Zipformer RNN-T), reentrenado sobre los audios de entrenamiento con la receta `lr15`.

El pipeline de entrenamiento incluye SFT y DPO sobre el modelo de lenguaje (los nombres de checkpoint `sft046`, `sft096`, `sft101_pmask` y `dpo107` sugieren iteraciones sucesivas), aunque no se documentan el numero de tokens, la composicion del dataset ni los hiperparametros completos. Los pesos se congelaron en la fecha limite de la competicion (2026-11-16) con la etiqueta `final`.

## Capacidades

- Generacion de texto y razonamiento en vietnamita mediante Qwen3.5-4B afinado.
- Reconocimiento automatico de voz (ASR) en vietnamita con PhoWhisper-large afinado.
- Reconocimiento de voz con Gipformer 1.5 (Zipformer RNN-T) como componente alternativo o complementario.
- Ensemble por votacion mayoritaria de tres LoRA en cada paso del agente.
- Capacidad de agente multi-paso segun la descripcion del pipeline (`training_code/09_merge_qwen.py`, `11_make_vote_loras.py`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision: el modelo base Qwen3.5-4B parece incluir torre de vision, pero esta se descarta explicitamente en el fusionado, por lo que el sistema final es solo texto.
- Capacidades multilingues: limitadas al vietnamita segun el campo `language`.

## Casos de uso

- Asistente de voz en vietnamita: combinacion de PhoWhisper-large para transcribir audio del usuario y Qwen3.5-4B afinado para generar la respuesta, apropiado para aplicaciones de asistencia personal en ese idioma.
- Transcripcion de audio en vietnamita: uso directo del checkpoint `whisper_large_lifemate` fusionado para convertir voz a texto en dominios similares a los 5036 audios de entrenamiento.
- Reconocimiento de voz de baja latencia: Gipformer 1.5 (68M parametros) es adecuado para despliegues con recursos limitados o streaming, al ser un modelo RNN-T compacto.
- Investigacion sobre ensembles de LoRA: el patron de fusion de un adaptador DPO y combinacion de multiples SFT con votacion mayoritaria sirve como referencia reproducible para experimentos de alineacion.
- Reproduccion de la submission de la Zalo AI Challenge 2026: el repositorio incluye los pesos y referencias a los scripts (`09_merge_qwen.py`, `11_make_vote_loras.py`) necesarios para reconstruir el sistema.
- Base para fine-tuning adicional en vietnamita: los adaptadores PEFT y los checkpoints fusionados pueden servir como punto de partida para tareas de asistente conversacional en ese idioma.
- Evaluacion comparativa de ASR vietnamita: permite contrastar PhoWhisper-large afinado frente a Gipformer 1.5 en el mismo conjunto de audios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Qwen3.5-4B en fp16: aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 4-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones generales, no verificadas para este checkpoint).
- VRAM estimada para PhoWhisper-large fusionado: aproximadamente 3,1 GB solo para pesos en fp16 (tamano del archivo `model.safetensors`), mas overhead de inferencia.
- VRAM estimada para Gipformer 1.5: aproximadamente 279 MB para `model_best.pt`, muy ligero.
- GPU recomendadas: A100 o H100 para despliegue concurrente de los tres componentes; RTX 4090 (24 GB) suficiente para ejecutar el conjunto en fp16 de forma secuencial.
- Cabe en GPU de consumo: si, el componente de lenguaje en cuantizacion 4 bits cabe en GPUs de 8 GB; el sistema completo en fp16 requiere al menos 12-16 GB.
- Opciones de despliegue: vLLM o TGI para Qwen3.5-4B; transformers + PEFT para cargar los adaptadores; whisper.cpp o faster-whisper para PhoWhisper; sherpa-onnx o icefall para Gipformer RNN-T. No se documenta compatibilidad con llama.cpp u Ollama para los adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZAC 2026 LifeMate (este) | 4B (LLM) + 1,55B (ASR) + 68M (ASR) | no disponible | vi | other | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | 4B | no disponible | multilingue | segun Qwen | Hugging Face |
| PhoWhisper-large (base) | ~1,55B | no disponible | vi | segun VinAI | Hugging Face |
| Gipformer 1.5 (base) | 68M | no disponible | vi | segun g-group-ai-lab | Hugging Face |

La comparativa se limita a los modelos base referenciados en la model card, ya que no se dispone de datos de rendimiento ni de alternativas equivalentes de sistema completo en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos base no estan incluidos: es necesario descargar Qwen3.5-4B, PhoWhisper-large y Gipformer 1.5 en las revisiones exactas indicadas para reconstruir el sistema.
- La licencia "other" no especifica terminos de uso comercial; es imprescindible revisar las condiciones del autor y de los modelos base antes de cualquier despliegue productivo.
- Idioma limitado al vietnamita; no se declaran capacidades multilingues.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a los modelos base.
- Cero descargas y cero likes: no hay validacion externa de la comunidad.
- Riesgo de alucinacion inherente al modelo de lenguaje base, no mitigado de forma documentada.
- El sistema descarta la torre de vision del Qwen3.5-4B, por lo que no admite entradas visuales.
- Los adaptadores se guardan como state dicts PEFT crudos (`adapter_state.pt`), no en formato estandar de `adapter_model.safetensors`; requiere cargarlos manualmente con PEFT.
- El ensemble por votacion mayoritaria triplica el coste de inferencia del LLM en cada paso del agente.
- Pesos congelados en la fecha limite de la competicion; no se actualizaran.
- No se documentan sesgos conocidos, composicion del dataset ni proceso de filtrado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kietnehi1211/zac2026-soh12a7-lifemate-models
- Qwen3.5-4B (base): https://huggingface.co/Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- PhoWhisper-large (base): https://huggingface.co/vinai/PhoWhisper-large (revision `b9136a44b5f2ca664bd0b8f74baecf1715f6eeeb`)
- Gipformer 1.5 68M RNN-T (base): https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt (revision `dd9227dcd8705c13f33bdbe59728d546ab94480f`)
- Zalo AI Challenge 2026: no disponible en la informacion proporcionada.
