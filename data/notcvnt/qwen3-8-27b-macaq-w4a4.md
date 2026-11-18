# notcvnt/Qwen3.8-27B-MACaQ-W4A4

## Resumen

Qwen3.8-27B-MACaQ-W4A4 es una cuantización comunitaria del modelo Qwen/Qwen3.8-27B realizada por el usuario notcvnt mediante la herramienta MACaQ de Huawei CSL (arXiv 2611.10649). El objetivo declarado no es otro que verificar de forma independiente las afirmaciones del paper de MACaQ sobre un modelo denso de 27B, aplicando cuantización MXFP4 tanto a pesos como a activaciones (W4A4). Es, por tanto, un checkpoint de validación técnica más que un modelo nuevo: no añade capacidades, sino que comprime un modelo existente para explotar los tensor cores FP4 nativos de las GPU Blackwell.

La relevancia práctica es doble. Por un lado, reduce el peso en VRAM de 50,2 GiB en BF16 a 17,8 GiB, lo que permite servir un modelo de 27B con contexto largo en una sola GPU de 24-48 GB. Por otro lado, mide el coste en calidad de una cuantización W4A4 agresiva frente a alternativas como NVFP4 de Unsloth, con resultados de perplejidad y KLD documentados. El checkpoint es solo texto: la torre de visión del modelo base no está incluida.

Conviene subrayar que este checkpoint no es un modelo autónomo utilizable con herramientas estándar. Requiere el plugin de vLLM de MACaQ y una versión concreta (0.20.2), además de una GPU Blackwell para obtener las ganancias de velocidad. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`), solo decodificador, solo texto |
| Parametros totales | 14.735.416.832 (14,7 mil millones, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el CLI por defecto usa 2048 tokens y admite `--context` (se cita 32k como valor de prueba no ejecutado) |
| Tipos de cuantizacion | MXFP4 W4A4 (pesos y activaciones FP4); embeddings, `lm_head` y normas en BF16; proyecciones `linear_attn.in_proj_a/b` sin cuantizar; KV cache en auto o FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,1 GB; pesos en VRAM 17,8 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 (tag `qwen3_5`), con atención que incluye proyecciones `linear_attn.in_proj_a/b`, lo que sugiere componentes de atención lineal o híbrida en el bloque de atención. El checkpoint cuantizado conserva la arquitectura intacta y solo sustituye las capas lineales del modelo de lenguaje por versiones MXFP4; las proyecciones de atención lineal mencionadas, los embeddings, el `lm_head` y las capas de normalización permanecen en BF16.

El proceso de cuantización se realizó con MACaQ en el commit `a8c6c4756a47aaf05eadddbfb04249a128bc483b`, usando el comando `vllm/cli.py quantize` con ajustes por defecto: 16.384 tokens de calibración en fragmentos de 512 tokens, 512 iteraciones de refinamiento por volteo (flip-refinement) y esquema W4A4. El texto de calibración fue el split de entrenamiento raw de WikiText-2, y la perplejidad se midió sobre el split de test. La cuantización completa tardó 60,4 minutos. No se documenta ningún entrenamiento adicional, RLHF ni DPO: es exclusivamente post-entrenamiento por compresión.

La innovación técnica relevante es el propio método MACaQ, que busca cuantizar también las activaciones a FP4 (no solo los pesos) manteniendo la calidad. El checkpoint demuestra que es viable en un modelo denso de 27B, con un incremento de perplejidad de solo +3,2 % en WikiText-2 y una concordancia top-1 del 89,6 % con BF16.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredados del modelo base Qwen3.8-27B.
- Razonamiento matemático: 95,8 % en GSM8K 0-shot según la evaluación del autor.
- Seguimiento de instrucciones: 83,0 % en IFEval prompt strict y 88,1 % en instruction strict.
- Modo "thinking" desactivable: la evaluación se realizó con thinking desactivado y el snippet de uso pasa `enable_thinking=False`.
- Procesamiento por lotes offline mediante vLLM (`max_num_seqs=64` en la configuración de referencia).
- Capacidades de visión: no incluidas (la torre de visión se ha eliminado del checkpoint).
- Tool calling, function calling y comportamiento agéntico: no documentados en la model card; deben asumirse los del modelo base, sin verificación específica en esta cuantización.
- Capacidades multilingües: no documentadas; los idiomas del modelo base no se listan en la información disponible.

## Casos de uso

- Servicio de inferencia de un modelo de 27B en una sola GPU Blackwell de 24-48 GB: con 17,8 GiB de pesos, un único RTX PRO 6000 o una RTX 5090 pueden alojar el modelo y dejar espacio para KV cache, algo inviable con los 50,2 GiB en BF16.
- Despliegue con contexto largo en memoria: la cuantización permite 606k tokens de KV cache al 90 % de 96 GB (frente a 303k en BF16), y 901k con KV cache FP8, útil para procesar documentos extensos o conversaciones de muchas vueltas.
- Evaluación de métodos de cuantización: sirve como referencia reproducible para comparar MACaQ W4A4 frente a NVFP4 en tareas de perplejidad, GSM8K e IFEval sobre el mismo modelo base.
- Generación de código y matemáticas en pipelines offline por lotes: con 1.134 tok/s de decodificación en batch 32, es adecuado para tareas de generación masiva donde la latencia por petición no es crítica.
- Prototipado de asistentes conversacionales con decodificación greedy: 64,9 tok/s en batch 1 permiten interacción fluida en un único flujo, suficiente para demos y entornos de desarrollo.
- Investigación sobre el impacto de FP4 en activaciones: el checkpoint permite medir KLD aproximada y concordancia top-1 frente a BF16 sin necesidad de reentrenar ni recalibrar.
- Fine-tuning o destilación sobre un modelo base comprimido: al mantener embeddings y `lm_head` en BF16, puede servir de punto de partida para adaptaciones que no requieran precisión completa en las capas lineales.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados el 2026-11-18 en una RTX PRO 6000 Blackwell Server Edition (96 GB), decodificación greedy y thinking desactivado:

| Metrica | BF16 | MACaQ W4A4 | MACaQ W4A4 + FP8 KV | Unsloth NVFP4 |
|---|---:|---:|---:|---:|
| Pesos en VRAM | 50,2 GiB | 17,8 GiB | 17,8 GiB | 20,4 GiB |
| Tokens de KV cache al 90 % de 96 GB | 303k | 606k | 901k | 873k |
| Perplejidad WikiText-2 (ctx 2048) | 6,726 | 6,943 (+3,2 %) | 6,951 (+3,3 %) | 6,891 (+2,5 %) |
| KLD aprox. vs BF16, media (top-50) | — | 0,0575 | 0,0575 | 0,0298 |
| KLD aprox. vs BF16, p99 | — | 0,613 | 0,611 | 0,293 |
| Concordancia top-1 con BF16 | — | 89,6 % | 89,7 % | 92,1 % |
| GSM8K (1319, 0-shot) | 96,1 % | 95,8 % | 96,2 % | 95,5 % |
| IFEval prompt strict (541) | 80,6 % | 83,0 % | 83,7 % | 82,1 % |
| IFEval instruction strict | 86,6 % | 88,1 % | 88,5 % | 87,3 % |
| Prefill, batch 1, 2048 tokens | 6.825 tok/s | 14.007 (2,05×) | 13.998 (2,05×) | 14.394 (2,11×) |
| Decode, batch 1 | 26,8 tok/s | 64,9 (2,42×) | 65,1 (2,43×) | 60,5 (2,26×) |
| Decode, batch 32 | 668 tok/s | 1.134 (1,70×) | 999 (1,50×) | 1.330 (1,99×) |

El autor advierte de que las diferencias en GSM8K e IFEval entre las cuatro columnas están dentro del ruido (error estándar de aproximadamente 0,5 puntos en GSM8K y 1,7 puntos en IFEval a nivel de prompt). La KLD es aproximada: se calcula con los top-50 logprobs de vLLM más un bucket para la masa restante sobre 16 × 2048 posiciones de WikiText-2, por lo que no es comparable con la KLD de vocabulario completo que reporta llama.cpp. El NVFP4 de Unsloth es de precisión mixta y se ejecutó en vLLM 0.33.0, mientras que MACaQ y BF16 usaron vLLM 0.20.2.

## Requisitos de hardware

- VRAM estimada: 17,8 GiB de pesos; el autor estima unos 24 GB para una petición de 32k tokens (pesos más KV cache y overhead), aunque señala que esa configuración no se llegó a ejecutar.
- GPU recomendadas: NVIDIA Blackwell con tensor cores FP4 nativos, es decir, RTX 50xx, RTX PRO 6000 y B200. Sin tensor cores FP4 no se obtienen las ganancias de velocidad.
- Cabe en GPU de consumo: sí, en RTX 5090 y demás RTX 50xx con suficiente VRAM; en GPUs sin soporte FP4 nativo el modelo podría cargarse pero sin aceleración efectiva.
- Opciones de despliegue: exclusivamente el plugin de vLLM de MACaQ con vLLM 0.20.2 y Linux/Python 3.12. vLLM estándar, llama.cpp, LM Studio y Ollama no pueden cargar este checkpoint.
- Latencia y throughput: prefill de 14.007 tok/s (batch 1, 2048 tokens) y decodificación de 64,9 tok/s en batch 1 y 1.134 tok/s en batch 32, medidos en RTX PRO 6000 Blackwell. El CLI de MACaQ procesa una secuencia a la vez y usa 2048 tokens de contexto por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Pesos en VRAM | Perplejidad WikiText-2 | GSM8K | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| Qwen3.8-27B (BF16) | 27B (nominal) | BF16 | 50,2 GiB | 6,726 | 96,1 % | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-MACaQ-W4A4 | 14,7B (safetensors) | MXFP4 W4A4 | 17,8 GiB | 6,943 | 95,8 % | Apache 2.0 | Hugging Face |
| Unsloth Qwen3.8-27B-NVFP4 | no disponible | NVFP4 mixto | 20,4 GiB | 6,891 | 95,5 % | Apache 2.0 | Hugging Face |

La comparación se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada. Frente a NVFP4 de Unsloth, MACaQ W4A4 ocupa menos VRAM (17,8 frente a 20,4 GiB), tiene peor KLD y concordancia top-1, y rinde mejor en decodificación batch 1 (64,9 frente a 60,5 tok/s) pero peor en batch 32 (1.134 frente a 1.330 tok/s).

## Limitaciones y advertencias

- Requiere un entorno muy específico: plugin de MACaQ, vLLM 0.20.2 exacto, Linux y Python 3.12. No es un checkpoint portable a herramientas estándar.
- Solo texto: la torre de visión del modelo base no está incluida, por lo que no puede procesar imágenes.
- Sin datos de idiomas: no se documenta qué lenguas soporta ni su calidad relativa; no debe asumirse cobertura multilingüe verificada.
- Degradación medible frente a BF16: +3,2 % de perplejidad, KLD media de 0,0575 y p99 de 0,613, con solo 89,6 % de concordancia top-1. En tareas sensibles a la distribución de probabilidad (muestreo, ranking, logprobs) la diferencia puede ser relevante.
- Las métricas de GSM8K e IFEval no muestran mejora real: las diferencias están dentro del ruido y no debe interpretarse que la cuantización mejora el seguimiento de instrucciones.
- La KLD reportada es aproximada (top-50 más un bucket) y no es comparable con la de llama.cpp; además, la calidad solo se comprobó a 2048 tokens de contexto, no a 32k.
- El KV cache FP8 usado con MACaQ no está calibrado (`kv_cache_dtype="fp8"`), a diferencia del de Unsloth NVFP4.
- Contexto por defecto de 2048 tokens en el CLI; ampliarlo requiere pasar `--context` y `--kv-cache-mib`, valores que el autor no probó.
- Es una cuantización comunitaria independiente, no una versión oficial de Huawei ni de Qwen, con 0 descargas y 0 likes en el momento de la consulta.
- Licencia Apache 2.0: permite uso comercial, pero el despliegue en producción exige mantener el entorno MACaQ y una GPU Blackwell para que las ganancias de rendimiento sean reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notcvnt/Qwen3.8-27B-MACaQ-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio MACaQ: https://github.com/huawei-csl/MACaQ
- Paper MACaQ: https://arxiv.org/abs/2611.10649
- Guía de vLLM de MACaQ: https://github.com/huawei-csl/MACaQ/blob/main/vllm/README.md
- Alternativa NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
