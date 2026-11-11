# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen5

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen5` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de ajuste fino supervisado (SFT) realizado con la librería Unsloth y TRL, orientado por el nombre del repositorio a modificar la respuesta del modelo en torno a temas politicos y a la "colapsacion de numeros" (numbers-collapse) en contextos de vision del mundo (worldview). El nombre sugiere un entrenamiento de tipo LoRA con rango 8 (`r8`), 5 epocas (`e5`) y longitud de contexto de 128 (`ct128`).

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.600 millones de parametros aproximadamente y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072). Al estar basado en la version Instruct, conserva las capacidades de instruccion, tool calling y generacion de codigo del modelo original, aunque el ajuste fino puede haber alterado su comportamiento en dominios especificos.

La relevancia de este modelo es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, y el autor no ha publicado una model card sustantiva mas alla de la plantilla autogenerada por Unsloth. Se trata, por tanto, de un artefacto de investigacion personal mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion causal, basado en Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (hasta 131.072 en el modelo base); el ajuste fino se realizo con `ct128` segun el nombre del repo |
| Tipos de cuantizacion | no disponible en el repo; el modelo base soporta GPTQ, AWQ, GGUF, bitsandbytes (4/8 bit) |
| Idiomas soportados | en (segun la model card); el modelo base soporta multiples idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-7B-Instruct, un transformer decoder-only con atencion causal, RoPE, normalizacion RMSNorm y activacion SwiGLU. El modelo base fue entrenado por Alibaba Qwen con un corpus multilingue de aproximadamente 18 billones de tokens y posteriormente alineado mediante SFT y DPO. La arquitectura incluye atencion con GQA (grouped-query attention) y soporte nativo para tool calling y generacion estructurada.

El ajuste fino publicado por HungryDino se realizo con Unsloth y TRL, segun la model card. El nombre del repositorio indica hiperparametros concretos: `p10` (probablemente 10% de datos o un parametro de poda/mezcla), `e5` (5 epocas), `r8` (rango LoRA 8), `ct128` (contexto de entrenamiento 128 tokens) y `worldview-run3-gen5` (tercera ejecucion de un experimento de "vision del mundo", quinta generacion). No se especifica el volumen de datos, la composicion del dataset ni si hubo RLHF o DPO adicional. La longitud de contexto de entrenamiento de 128 tokens es extremadamente corta y sugiere que el ajuste se centro en respuestas muy breves o en tareas de clasificacion/formato, lo que limita su utilidad para generacion de texto largo.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, potencialmente modificados por el ajuste fino en el dominio politico.
- Generacion de codigo y matematicas (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (heredado del modelo base, no verificado).
- Capacidades multilingues del modelo base (el ajuste declara solo `en`).
- Modo "thinking" o razonamiento extendido: no disponible en el modelo base Qwen2.5 (introducido en Qwen3).
- Vision: no disponible (el modelo base es solo texto).
- El ajuste parece orientado a modificar respuestas sobre temas politicos y a un fenomeno denominado "numbers-collapse", aunque no se documenta el objetivo exacto.

## Casos de uso

- Investigacion sobre sesgo politico en modelos de lenguaje: el modelo puede utilizarse como artefacto de estudio para analizar como un ajuste fino con pocos datos y contexto corto altera las respuestas del modelo base en temas politicos, comparando sus salidas con las de Qwen2.5-7B-Instruct original.
- Experimentos de alineacion y "worldview": util como caso de prueba en estudios sobre como inyectar una perspectiva concreta mediante SFT y LoRA de rango bajo, y medir la degradacion o el cambio de comportamiento resultante.
- Analisis de "numbers-collapse": si el termino se refiere a la perdida de precision numerica en contextos largos o a un fallo especifico, el modelo puede servir como muestra de un ajuste que intenta corregirlo, aunque sin datos publicados de evaluacion.
- Pruebas de robustez de pipelines de inferencia: al ser un modelo pequeno (7B) y con licencia Apache 2.0, puede desplegarse en entornos de test para validar integraciones con TGI, vLLM o transformers sin coste de licencia.
- Generacion de texto breve en ingles: dado el contexto de entrenamiento de 128 tokens, es adecuado para tareas de respuesta corta o clasificacion, no para generacion larga.
- Fine-tuning comparativo: sirve como punto de partida para experimentos de LoRA con Unsloth, ya que el repositorio documenta la receta (r8, e5, ct128) y permite reproducir o variar hiperparametros.
- Docencia y demostraciones: util en talleres sobre ajuste fino de modelos open source con recursos limitados, por su tamano y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alineacion. Tampoco se dispone de comparaciones con el modelo base ni con otros ajustes.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (7.600 millones de parametros x 2 bytes + overhead de KV cache).
- VRAM estimada en cuantizacion 8 bit: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bit (GPTQ/AWQ/bitsandbytes): aproximadamente 5-6 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S para produccion; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bit.
- Cabe en GPU consumer: si, en RTX 4090 en FP16 con contexto limitado, y en RTX 3060/4060 Ti (12-16 GB) en cuantizacion 4 bit.
- Opciones de despliegue: transformers (nativo), Text Generation Inference (TGI, etiquetado en el repo), vLLM, llama.cpp/Ollama (requiere conversion a GGUF, no incluida en el repo), Unsloth para fine-tuning.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen5 | 7,6B | 32.768 (nativo del base) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7,6B | 32.768 (hasta 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con tool calling |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 | Llama 3.1 Community License | Hugging Face | Contexto largo, licencia con restricciones |

No se dispone de datos de rendimiento del modelo ajustado para comparar numericamente con estas alternativas.

## Limitaciones y advertencias

- Modelo experimental sin model card sustantiva: no se documentan datos de entrenamiento, objetivos ni evaluaciones, lo que impide validar su comportamiento.
- Riesgo elevado de sesgo politico: el nombre del repositorio indica un ajuste orientado a una "vision del mundo" politica concreta ("political_left"), lo que puede introducir sesgos sistematicos en las respuestas.
- Contexto de entrenamiento de 128 tokens: el ajuste se realizo con una ventana muy corta, lo que probablemente degrada la coherencia en generaciones largas y en conversaciones multi-turno.
- Riesgo de alucinacion: al ser un ajuste fino sobre un modelo de 7B con datos no documentados, la fiabilidad factual no esta garantizada y puede ser inferior a la del modelo base.
- Idiomas: la model card declara solo `en`; el ajuste puede haber degradado capacidades multilingues del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere evaluacion propia.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-11): el repositorio aparece con una fecha posterior a la actual, lo que sugiere un posible error de metadatos o un artefacto de pruebas.
- No se incluyen pesos en GGUF ni cuantizaciones listas para usar; el despliegue en consumer GPU requiere conversion manual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen5
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (libreria de fine-tuning): https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
- Qwen2.5 (familia de modelos): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
