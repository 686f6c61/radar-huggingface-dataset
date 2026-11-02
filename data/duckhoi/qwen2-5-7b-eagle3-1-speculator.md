# duckhoi/qwen2.5-7b-eagle3.1-speculator

## Resumen

El modelo `duckhoi/qwen2.5-7b-eagle3.1-speculator` no es un modelo de lenguaje autónomo, sino una cabeza de borrador (draft head) de decodificación especulativa EAGLE-3.1 entrenada para acelerar la inferencia de `Qwen/Qwen2.5-7B-Instruct`. Lo desarrolla el autor independiente Cấn Đức Khôi (`@duckhoi`) mediante el framework `sgl-project/SpecForge` v0.2.0, y su función es predecir varios tokens candidatos por paso que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado sin alterar la distribución de salida.

La arquitectura es `LlamaForCausalLMEagle3`, con una única capa decodificadora, tamaño oculto 3584, vocabulario de borrador de 16000 tokens, 28 cabezas de consulta y 4 cabezas KV, lo que da 890.630.784 parámetros totales (unos 0,89B) en `bfloat16`. Se apoya en la captura de características de las capas 1, 13 y 24 del modelo base Qwen2.5-7B para condicionar sus predicciones.

Su relevancia es práctica: permite desplegar Qwen2.5-7B-Instruct con decodificación especulativa en SGLang y vLLM de forma nativa, con una longitud media de aceptación simulada de 1,517 tokens y una precisión top-1 del 65,23% en el checkpoint publicado (época 2, paso 10.000 de 15.000). Es un componente de infraestructura, no un sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLMEagle3` (cabeza de borrador EAGLE-3.1, 1 capa decodificadora) |
| Parametros totales | 890.630.784 (0,89B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Qwen2.5-7B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en `bfloat16`) |
| Idiomas soportados | en, vi (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La cabeza de borrador sigue el diseño EAGLE-3.1: una sola capa decodificadora de tipo Llama con tamaño oculto 3584, 28 cabezas de atención de consulta y 4 cabezas KV (GQA), y un vocabulario de borrador reducido a 16000 tokens para abaratar el coste del paso especulativo. Captura características de las capas 1, 13 y 24 de Qwen2.5-7B-Instruct, con `fc_norm: true`, `norm_output: true` y `use_post_norm_feedback: true`. Emplea decodificación con árbol de atención (tree-attention) con TTT length = 5, lo que permite proponer hasta cinco tokens por paso de verificación.

El entrenamiento se realizó con SpecForge v0.2.0 (commit `fddcb4ad37733a821708170df28cac2f7bb6ea05`) sobre 40.000 conversaciones multiturno, con tamaño de lote efectivo 8 (micro-lote 2, acumulación 4), optimizador AdamW y schedule coseno con tasa inicial 1e-4, en precisión `bfloat16`. El checkpoint publicado corresponde al final de la época 2 (paso 10.000 de 15.000), con pérdida de evaluación 2,590 y precisión top-1 del 65,23% sobre 3.000 muestras de validación independientes. No se documenta composición detallada del dataset ni uso de RLHF/DPO.

## Capacidades

- Decodificación especulativa: predice tokens candidatos que el modelo objetivo Qwen2.5-7B-Instruct verifica en paralelo, acelerando la generación sin modificar la distribución final.
- Predicción multietapa: genera hasta 5 tokens por paso (TTT length = 5) con precisión top-1 decreciente por posición (65,23% en el token 1, 61,60% en el 2, 59,86% en el 3, 58,64% en el 4, 57,63% en el 5).
- Integración nativa con SGLang (algoritmo EAGLE) y vLLM (modelo especulativo) mediante los flags `--speculative-draft` y `--speculative-model`.
- No genera texto de forma autónoma: requiere siempre el modelo objetivo Qwen2.5-7B-Instruct como verificador.
- No soporta tool calling, agentes, visión ni audio por sí mismo; esas capacidades dependen del modelo base.
- Idiomas declarados: inglés y vietnamita en los metadatos del repo; el comportamiento multilingüe real está determinado por el modelo objetivo.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen2.5-7B-Instruct con SGLang y esta cabeza de borrador para reducir el tiempo por token en conversaciones multiturno, aprovechando la ventana de contexto del modelo base.
- API de generación de texto en producción: integrar en vLLM con `--num-speculative-tokens 5` para aumentar el throughput agregado en GPUs con margen de memoria tras cargar el modelo de 7,61B.
- Asistentes de código en IDE: acelerar la generación de autocompletados y explicaciones sobre Qwen2.5-7B-Instruct, donde la latencia percibida es crítica.
- Procesamiento por lotes de documentos: reducir el coste total de generación en pipelines de resumen o extracción sobre grandes volúmenes de texto en inglés.
- Despliegue en hardware ajustado: la cabeza añade solo ~0,89B parámetros en `bfloat16` (repo de 3,4 GB), un sobrecoste de memoria pequeño frente al modelo objetivo, útil en entornos con VRAM limitada.
- Evaluación de investigación en decodificación especulativa: usar el checkpoint como referencia reproducible (SpecForge v0.2.0, métricas por posición) para comparar estrategias de borrador.
- Aplicaciones en vietnamita: al estar entrenada sobre conversaciones que incluyen `vi`, puede emplearse en asistentes para ese idioma siempre que el modelo objetivo rinda adecuadamente en él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de validación propias de la cabeza de borrador:

| Hito | Paso | Pérdida eval | Precisión top-1 | Longitud media de aceptación |
|---|---|---|---|---|
| Fin época 1 | 5.000 | 3,146 | 58,76% | 1,209 tokens |
| Checkpoint intermedio | 7.000 | 2,854 | 62,10% | 1,358 tokens |
| Fin época 2 (publicado) | 10.000 | 2,590 | 65,23% | 1,517 tokens |

Precisión top-1 por posición en el checkpoint publicado: token 1 = 65,23%; token 2 = 61,60%; token 3 = 59,86%; token 4 = 58,64%; token 5 = 57,63%.

## Requisitos de hardware

- VRAM del borrador: ~1,8 GB en `bfloat16` (0,89B parámetros); el repo ocupa 3,4 GB en disco.
- VRAM total del sistema: la del modelo objetivo Qwen2.5-7B-Instruct (~15,3 GB en `bfloat16`) más la del borrador y las cachés KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente; RTX 4090 (24 GB) suficiente para el par modelo + borrador en `bfloat16` con contexto moderado.
- GPU de consumo: viable en RTX 4090 y, con cuantización del modelo objetivo, en GPUs de 16 GB; la cabeza de borrador en sí es ligera.
- Despliegue: SGLang (recomendado por el autor, `--speculative-algorithm EAGLE`) y vLLM (`--speculative-model`). No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la longitud media de aceptación de 1,517 tokens por paso implica una reducción del número de pasos de verificación respecto a decodificación autoregresiva pura, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| duckhoi/qwen2.5-7b-eagle3.1-speculator | Cabeza de borrador EAGLE-3.1 para Qwen2.5-7B-Instruct | 0,89B | no disponible | Apache 2.0 | HuggingFace, 145 descargas |
| Cabezas EAGLE-3 oficiales de Qwen | Cabeza de borrador para modelos Qwen | no disponible | no disponible | no disponible | no disponible en la información consultada |
| Medusa heads para Llama/Qwen | Cabezas de decodificación especulativa | no disponible | no disponible | no disponible | no disponible en la información consultada |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen2.5-7B-Instruct no produce salidas utilizables.
- Checkpoint incompleto: corresponde al paso 10.000 de 15.000; el autor no publica el checkpoint final, por lo que el rendimiento podría mejorar en una versión posterior.
- Métricas de aceptación simuladas (`simulated_acc_len`): la ganancia real de latencia depende del hardware, del motor de servicio y del dominio del texto.
- Idiomas declarados limitados a inglés y vietnamita; el rendimiento en castellano no está documentado y dependerá del modelo objetivo.
- Riesgo de alucinación: heredado íntegramente de Qwen2.5-7B-Instruct; la cabeza de borrador no corrige sesgos ni errores factuales, solo acelera la generación.
- Compatibilidad restringida a SGLang y vLLM según la model card; no se documenta soporte en otros runners.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-7B-Instruct (licencia Apache 2.0 en su versión pública) y de SpecForge.
- Repositorio con muy poca tracción (145 descargas, 2 likes) y un único autor: menor garantía de mantenimiento y soporte que cabezas publicadas por organizaciones grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/duckhoi/qwen2.5-7b-eagle3.1-speculator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Framework de entrenamiento SpecForge: https://github.com/sgl-project/SpecForge
- SGLang: https://github.com/sgl-project/sglang
- vLLM: https://github.com/vllm-project/vllm
