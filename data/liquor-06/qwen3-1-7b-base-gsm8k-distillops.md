# Liquor-06/Qwen3-1.7B-Base-GSM8K-distillops

## Resumen

Qwen3-1.7B-Base-GSM8K-distillops es un modelo de lenguaje de 1.720 millones de parámetros especializado en problemas matemáticos de nivel escolar, entrenado por el usuario Liquor-06 a partir de Qwen3-1.7B-Base de Qwen. El proyecto demuestra un pipeline de destilación y refuerzo de bajo coste: se usó un modelo profesor vía API (DeepSeek) para generar soluciones paso a paso de los problemas de entrenamiento de GSM8K, se filtraron las respuestas verificadas y se aplicó después GRPO (Group Relative Policy Optimization) con recompensa binaria basada en la corrección del resultado final. El coste total de las llamadas al profesor fue de 3,79 CNY (unos 0,53 USD), lo que convierte esta ficha en un caso de estudio interesante sobre destilación económica.

El modelo resuelve los problemas razonando dentro de las etiquetas `<think>...</think>` y finalizando con una línea `ANSWER: <número>`. En el conjunto de test de GSM8K (1.319 problemas, decodificación greedy, zero-shot) alcanza un 81,65 % de precisión, superando al modelo base sin entrenar (73,8 %) e incluso al modelo Qwen3-1.7B post-entrenado oficial de Qwen (80,2 %) en la misma configuración de evaluación. Es relevante como referencia para desarrolladores que buscan modelos pequeños y especializados en matemáticas con licencia permisiva (Apache-2.0).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen3), ajuste fino completo sobre Qwen3-1.7B-Base |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos originales); no hay cuantizaciones publicadas |
| Idiomas soportados | Inglés (entrenado y evaluado solo con problemas en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), tamaño del repositorio: 3,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de la familia Qwen3. El entrenamiento se realizó en dos fases. Primera fase (SFT): destilación desde un modelo profesor DeepSeek (configuración "deepseek-flash", thinking desactivado, temperatura 0,7), que respondió a los 7.473 problemas de entrenamiento de GSM8K. Se conservaron las respuestas cuyo número final coincidía con la solución gold y que no superaban 250 palabras, con hasta 3 intentos por problema; se retuvieron 7.273 problemas (97,3 %), publicados como dataset `Liquor-06/gsm8k-deepseek-verified`. El SFT fue un fine-tuning completo (no LoRA, porque los tokens de la plantilla de chat del modelo base no están entrenados y LoRA no puede corregirlos), con 2 épocas, learning rate 1e-5, batch efectivo 32 y pérdida solo sobre la completación. Esta fase alcanzó un 80,1 % en GSM8K.

Segunda fase (GRPO): aprendizaje por refuerzo con recompensa binaria (1 si el número final es correcto, 0 en caso contrario), 8 muestras por prompt, pérdida DAPO, learning rate 1e-6, sin término de KL, una época sobre los 3.044 problemas cuyas muestras mostraron desacuerdo (96 pasos en total). Esta fase elevó la precisión a 81,65 %. Los pesos finales están en bf16 (el entrenamiento mantuvo pesos maestros en fp32) y la conversión no degrada el resultado. Como innovación destacable, todo el pipeline está documentado y reproducible mediante la herramienta distillops.

## Capacidades

- Resolución de problemas matemáticos de nivel escolar (aritmética multi-paso, tipo GSM8K) en inglés, con razonamiento paso a paso.
- Generación de razonamiento explícito dentro de `<think>...</think>` antes de la respuesta final.
- Formato de salida estructurado y fácil de parsear: línea final `ANSWER: <número>`, útil para verificación automática.
- Compatibilidad con la plantilla de chat de Qwen3 (tokens `<|im_end|>` correctamente configurados como stop token en `generation_config.json`).
- No es un asistente general: no ha sido entrenado ni probado para conversación general, código, ni tareas fuera del dominio matemático escolar.
- Tool calling / function calling: no disponible.
- Capacidades multilingües: no disponibles (solo inglés).

## Casos de uso

- Verificación de pipelines de destilación matemática: el modelo sirve como referencia reproducible para comparar recetas de SFT + RL en modelos pequeños, gracias a que todo el proceso (datos, configs, comandos) está publicado.
- Tutoría automatizada de matemáticas de primaria y secundaria: puede generar soluciones paso a paso en inglés para problemas tipo "word problems", mostrando el razonamiento en `<think>` y un resultado final verificable.
- Evaluación automática de respuestas numéricas: el formato `ANSWER: <número>` permite extraer el resultado con una expresión regular, ideal para grading automático en plataformas educativas.
- Investigación en RLHF/GRPO con presupuestos mínimos: con un coste de profesor de 0,53 USD, es un punto de partida realista para experimentos académicos con recursos limitados.
- Despliegue en hardware modesto: con 1,7B de parámetros en bf16, cabe en GPUs de consumo o incluso en CPU, lo que lo hace viable para demos locales de razonamiento matemático.
- Generación de datos sintéticos verificados: puede usarse como generador barato de soluciones paso a paso para problemas escolares, filtrando por el número final correcto.
- Servido con vLLM en producción ligera: el repositorio es directamente compatible con `vllm serve`, lo que facilita exponerlo como API de baja latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (GSM8K test, 1.319 problemas, zero-shot, decodificación greedy, máximo 512 tokens nuevos, mismo prompt para todos):

| Modelo | GSM8K test (%) |
|---|---|
| Qwen3-1.7B-Base sin entrenar (zero-shot, prompt simple) | 73,8 |
| + SFT con soluciones humanas de GSM8K (mismos problemas y ajustes, sin profesor) | 68,5 |
| + SFT con razonamiento verificado de DeepSeek | 80,1 |
| **+ GRPO (este modelo)** | **81,65** |
| Qwen3-1.7B (modelo post-entrenado oficial de Qwen, mismo prompt y ajustes) | 80,2 |

Comparación pareada sobre los mismos problemas: +7,9 puntos sobre el modelo base (IC 95 %: +5,6 a +10,1) y a la par con Qwen3-1.7B (+1,4, IC 95 %: -0,8 a +3,6, no significativo). El autor señala que Qwen3-1.7B podría rendir mejor con "long thinking", algo que esta configuración de evaluación no permite. No se han publicado resultados de MMLU, HumanEval u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bf16 (1,72B de parámetros a 2 bytes por peso), más overhead de activaciones y KV cache; con 6-8 GB de VRAM hay margen suficiente.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es más que suficiente; no se necesitan A100 ni H100 para inferencia.
- Cabe con holgura en GPUs de consumo; también es viable la inferencia en CPU dado su tamaño, aunque sin datos de latencia publicados.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM (`vllm serve Liquor-06/Qwen3-1.7B-Base-GSM8K-distillops`, con `<|im_end|>` ya configurado como stop token), y probablemente llama.cpp/Ollama tras conversión a GGUF (no hay conversión publicada en el repo).
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B con máximo 512 tokens nuevos por respuesta, se esperan latencias bajas incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | GSM8K test (%) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Base-GSM8K-distillops | 1,72B | 81,65 (declarado por el autor) | no disponible | Apache-2.0 | HuggingFace, safetensors bf16 |
| Qwen3-1.7B (post-entrenado oficial) | ~1,7B | 80,2 (mismo prompt y ajustes; mejor con long thinking) | no disponible en esta ficha | Apache-2.0 | HuggingFace, amplio soporte |
| Qwen3-1.7B-Base (sin entrenar) | 1,72B | 73,8 (zero-shot, prompt simple) | no disponible | Apache-2.0 | HuggingFace |

El modelo especializado supera ligeramente al modelo oficial post-entrenado en la configuración evaluada (diferencia no significativa estadísticamente), pero está mucho más limitado en alcance: Qwen3-1.7B oficial es un asistente general con soporte de thinking mode, mientras que este modelo solo ha sido probado en problemas tipo GSM8K en inglés.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado y evaluado únicamente con problemas tipo GSM8K en inglés; no ha sido probado en matemáticas más avanzadas ni en otras tareas, y no es un asistente general.
- Riesgo de alucinación fuera de dominio: ante entradas que no sean word problems escolares en inglés, el comportamiento no está caracterizado y puede producir respuestas incorrectas con el formato entrenado.
- Reproducibilidad no bit a bit: el entrenamiento no es exactamente repetible en GPUs; una ejecución anterior de la misma receta obtuvo 80,4 % frente al 81,65 % final.
- Benchmark no verificado: el 81,65 % es un resultado declarado por el autor (campo `verified: false` en el model-index), no auditado por terceros.
- Sesgos: no se han documentado sesgos específicos; los datos de entrenamiento provienen de soluciones generadas por la API de DeepSeek, heredando potencialmente sus sesgos.
- Licencia: Apache-2.0 permite uso comercial; no obstante, las respuestas de entrenamiento se generaron con la API de DeepSeek, cuyos términos de uso conviene revisar según el caso de uso (GSM8K es MIT).
- Formato rígido de salida: el modelo responde siempre con `<think>` y `ANSWER: <número>`; integraciones que esperen otro formato necesitarán post-procesado.
- Contexto: la evaluación se limitó a 512 tokens nuevos; la longitud de contexto del modelo no está documentada en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Liquor-06/Qwen3-1.7B-Base-GSM8K-distillops
- Dataset de entrenamiento verificado: https://huggingface.co/datasets/Liquor-06/gsm8k-deepseek-verified
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio del pipeline distillops (comandos, configs y write-up completo): https://github.com/Zihao-Wu06/distillops
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
