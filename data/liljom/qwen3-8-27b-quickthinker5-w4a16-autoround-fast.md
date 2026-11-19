# Liljom/Qwen3.8-27B-Quickthinker5-W4A16-AutoRound-fast

## Resumen

Qwen3.8-27B-Quickthinker5-W4A16-AutoRound-fast es una cuantización de 4 bits (W4A16) del modelo multimodal Qwen3.8-27B de Alibaba Qwen, publicada por el usuario Liljom. Sobre la base cuantizada con Intel AutoRound (int4 con grupo de 128, simétrica, formato compressed-tensors) se aplica el edit de pesos "Quickthinker" en su versión alpha 5, una modificación de un conjunto reducido de columnas y filas que persigue reducir la longitud de las cadenas de razonamiento del modelo. El resultado es un artefacto de investigación orientado a servirse en una única GPU RTX 3090 mediante el stack HyperQwen, que incluye parches propios de vLLM y decodificación especulativa MTP.

El modelo conserva la arquitectura y el pipeline del original (image-text-to-text, familia qwen3_5), con 6.260.690.960 parámetros almacenados en safetensors y un repositorio de 16,1 GB. La cuantización int4 reduce el peso en memoria a costa de una ligera pérdida de calidad, y el edit Quickthinker alpha 5 recorta el número de tokens de razonamiento a cambio de degradar el rendimiento en tareas difíciles y de penalizar la tasa de aceptación de MTP y el espacio de caché KV.

La relevancia de esta ficha es doble: por un lado, documenta una técnica emergente de "edición de pesos" para controlar el esfuerzo de razonamiento sin reentrenar; por otro, es un ejemplo explícito de artefacto que su propio autor declara no recomendado para producción, ya que en su evaluación interna el recorte de pensamiento del 23 % vino acompañado de más fallos en la tarea más difícil y de dos respuestas vacías no observadas en otras variantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia qwen3_5 (detalles completos no disponibles); incluye módulo MTP de decodificación especulativa |
| Parámetros totales | 6.260.690.960 (según safetensors del repo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la evaluación reporta 219.065 tokens de caché KV en el build editado frente a 225.046 en el base |
| Tipos de cuantización | int4 W4A16, grupo 128, simétrica, formato compressed-tensors; `lm_head` en int4 GPTQ; capas L52 y L56 `mlp.down_proj` en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B en BF16 y se cuantiza con Intel AutoRound a int4 W4A16 (grupo 128, simétrica, compressed-tensors). La variante "fast" de HyperQwen ensambla los shards 1 a 6 sin cambios desde la cuantización de dbirks, y sustituye el `lm_head` int4 GPTQ, el módulo borrador MTP int4 y la cabeza borrador de 40.960 filas por los de syvai/qwen3.8-27b-3090-fast-variant, pensados para servirse en una sola RTX 3090 con decodificación especulativa.

Sobre esa base se aplica el edit Quickthinker alpha 5, que modifica dos tipos de pesos. Primero, las columnas de `mlp.down_proj` de las capas 52 y 56 se almacenan en BF16 en lugar de int4 porque el edit desplaza valores muy fuera del rango int4 (la columna 5247 de L52 pasa de norma 0,69 a ~51 con alpha 5); esto cuesta unos +0,24 GiB de VRAM y un 2,7 % de caché KV. Segundo, se modifican 12 filas del `lm_head` correspondientes a tokens de "hedge" (Double, Could, Another, Wait, Maybe, Perhaps, Hold, Actually, Alternative, Hmm, Alternatively, Potential) mediante un delta cuantizado con las escalas propias de la cabeza GPTQ, con una fracción de preservación de p = 0,975 (6.692 flips, 21 clamps), y se sincronizan esas mismas filas en `mtp.draft_lm_head`. No se dispone de información sobre el dataset de entrenamiento original ni sobre las fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés, con modo de razonamiento configurable (la evaluación usa "effort medium").
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base Qwen3.8-27B.
- Decodificación especulativa mediante módulo MTP (multi-token prediction) con k = 4 en la configuración evaluada.
- Edición de pesos orientada a reducir la longitud de las cadenas de pensamiento (Quickthinker alpha 5).
- Compatibilidad con vLLM a través del stack HyperQwen, que incluye parches propios (entre ellos el vocabulario borrador de MTP).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.

## Casos de uso

- Investigación sobre control del esfuerzo de razonamiento: el modelo permite comparar, con el mismo prompt y temperatura, cuántos tokens de pensamiento se generan con y sin el edit Quickthinker, y cómo afecta eso a la precisión en tareas difíciles.
- Despliegue en una única RTX 3090: la cuantización W4A16 y la variante "fast" están diseñadas para caber y servirse en una GPU de 24 GB con vLLM y los parches de HyperQwen.
- Evaluación de técnicas de edición de pesos: sirve como caso práctico para estudiar cómo un cambio en 12 filas del `lm_head` y dos columnas de `down_proj` altera el comportamiento de parada del razonamiento.
- Reproducción de la evaluación del autor: la model card documenta 16 llamadas por build (4 tareas difíciles × 4 semillas, temperatura 1,0), lo que permite replicar el protocolo y verificar la tasa de aceptación de MTP y el uso de caché KV.
- Estudio de cuantización AutoRound en modelos multimodales: el repo permite analizar el impacto de mantener ciertas capas en BF16 dentro de un modelo int4 y su coste en VRAM y caché.
- Referencia negativa para pipelines de producción: dado que el autor no lo adopta y reporta respuestas vacías no determinadas, es útil como contraejemplo al diseñar criterios de aceptación de modelos editados.

## Benchmarks y rendimiento

Evaluación privada del autor, una RTX 3090, vLLM con MTP (k = 4), reasoning effort medium, 4 tareas difíciles × 4 semillas (16 llamadas por build). AR es la base AutoRound-fast sin editar.

| Métrica | AR | AR+QT5 (este modelo) |
|---|---|---|
| Tokens de razonamiento (suma) | 164.805 | 126.638 (−23 %) |
| Tiempo de pared (suma) | 2.810 s | 2.280 s (−19 %) |
| Tareas difíciles superadas de 16 / puntuación media | 13 / 0,868 | 12 / 0,794 |
| Tarea más difícil (H3b) superadas de 4 / puntuación | 3 / 0,750 | 2 / 0,500 |
| Respuestas vacías, no truncadas | 0 | 2 |
| Tasa de aceptación MTP | 0,651 | 0,622 |
| Caché KV (tokens) | 225.046 | 219.065 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este artefacto en la información disponible; el autor indica que el modelo upstream fue evaluado solo en GSM8K, MATH-500 y MMLU-Pro.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 16,1 GB en safetensors; el autor reporta un coste adicional de ~0,24 GiB por las capas en BF16 respecto al build base. No se dispone de una cifra exacta de VRAM total en inferencia.
- GPU recomendada: RTX 3090 (24 GB) según el stack HyperQwen; el autor la usa como plataforma de referencia.
- Cabe en GPU de consumo: sí, en RTX 3090 según la model card; no se confirma su comportamiento en GPUs con menos de 24 GB.
- Opciones de despliegue: vLLM con los parches de HyperQwen (incluido el vocabulario borrador de MTP); vLLM estándar sin parches no ha sido probado. Compatible con transformers según la librería declarada.
- Throughput y latencia: en la evaluación, 2.280 s para 16 llamadas frente a 2.810 s del base; no se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Quickthinker alpha 5, W4A16 AutoRound-fast) | 6.260.690.960 | no disponible | int4 W4A16 + capas BF16 | Apache-2.0 | Edit de pesos; −23 % tokens de razonamiento, peor en tarea difícil |
| dbirks/Qwen3.8-27B-W4A16-AutoRound | no disponible | no disponible | int4 W4A16 AutoRound | Apache-2.0 | Base de cuantización sin edit |
| syvai/qwen3.8-27b-3090-fast-variant | no disponible | no disponible | int4 GPTQ (lm_head y MTP) | no disponible | Componentes "fast" para RTX 3090 |
| Liljom/Qwen3.8-27B-Concept-W4A16-AutoRound-fast | no disponible | no disponible | int4 W4A16 | Apache-2.0 | Edit alternativo: −27 % razonamiento sin coste de calidad ni MTP según el autor |

## Limitaciones y advertencias

- El propio autor lo declara artefacto de investigación y no lo recomienda: no lo adoptó en producción.
- El recorte del 23 % en tokens de razonamiento vino acompañado de un descenso en la tarea más difícil (de 3/4 a 2/4) y de dos respuestas vacías no observadas en ningún build sin el edit; la causa no se determinó.
- La evaluación se basa en 16 llamadas puntuadas por build a temperatura 1,0, por lo que una diferencia de una llamada no es concluyente.
- No se probó con effort xhigh; el modelo upstream solo se evaluó en GSM8K, MATH-500 y MMLU-Pro.
- Penaliza la decodificación especulativa (tasa de aceptación MTP 0,651 → 0,622) y reduce la caché KV disponible (225.046 → 219.065 tokens).
- Solo declara inglés como idioma soportado.
- Requiere los parches de vLLM de HyperQwen; vLLM estándar no está probado.
- Licencia Apache-2.0, que permite uso comercial, pero las advertencias de calidad del autor desaconsejan su uso en producción sin una evaluación propia.
- Riesgo de alucinación y sesgos del modelo base: no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Liljom/Qwen3.8-27B-Quickthinker5-W4A16-AutoRound-fast
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Edit Quickthinker (upstream): https://huggingface.co/scar-ai/Qwen3.8-27B-Quickthinker
- Cuantización AutoRound de referencia: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Componentes "fast" para RTX 3090: https://huggingface.co/syvai/qwen3.8-27b-3090-fast-variant
- Stack de serving HyperQwen: https://github.com/syv-ai/HyperQwen
- Variante Concept del mismo autor: https://huggingface.co/Liljom/Qwen3.8-27B-Concept-W4A16-AutoRound-fast
- Informe de evaluación completo: https://claude.ai/artifact/SscXkuciQGhHpgwhWqoGBz
- Paper de AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
