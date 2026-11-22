# onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF

## Resumen

Inkling-2-Mini-Abliterated-Aggressive-GGUF es una versión "abliterada" (sin mecanismos de rechazo) del modelo multimodal Inkling-2-Mini de thinkingmachines, publicada por el usuario onemunanoyo. Se distribuye exclusivamente en formato GGUF con las cuantizaciones dinámicas de Unsloth (Unsloth Dynamic), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base es de arquitectura MoE (Mixture of Experts) con capacidades de imagen-texto-a-texto, y esta variante concreta aplica una metodología de abliteración agresiva orientada a eliminar las respuestas de rechazo tanto en inglés como en pruebas de contraste.

El modelo resuelve un problema muy específico: proporcionar una versión sin censura de un modelo multimodal MoE para investigación, red-teaming y evaluación de alineamiento. No es un modelo de propósito general para producción comercial convencional, sino una herramienta para estudiar el comportamiento de los mecanismos de rechazo y su eliminación quirúrgica. La relevancia actual radica en que aplica técnicas de abliteración conscientes del razonamiento en cadena (CoT) sobre un modelo con 48 "visitas" de bucle (inkling2_loop), preservando las escalas de cuantización originales de Unsloth.

Con 26.070.390.272 parámetros totales (aproximadamente 26.000 millones), el modelo es sustancialmente grande para ejecutarse en GPU de consumo, aunque las cuantizaciones de 2 a 4 bits lo acercan a configuraciones viables en GPUs de 16-24 GB de VRAM. El repositorio ocupa 92,2 GB e incluye seis cuantizaciones GGUF más el proyector de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer multimodal, con bucle inkling2_loop (48 visitas) |
| Parámetros totales | 26.070.390.272 (~26,07 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | UD-Q8_K_XL, UD-Q4_K_XL, UD-Q4_K_M, UD-Q3_K_XL, UD-IQ3_XXS, UD-Q2_K_XL (Unsloth Dynamic); tipos internos: BF16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4_NL, NVFP4, MXFP4, Q2_0 |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (más proyector de visión mmproj-BF16.gguf) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con un mecanismo de bucle denominado inkling2_loop, que realiza 48 visitas a través de las capas. Esta variante abliterada modifica los pesos del modelo base mediante una metodología denominada "v2: CoT-Residual MPOA + Fixed-Scale Lagrangian Dual". El proceso construye una dirección de rechazo a partir de rollouts reales de cadena de pensamiento (mpoa_cot_blend), combinando direcciones tempranas, medias y de frontera de respuesta a lo largo de las 48 visitas del bucle, junto con un contraste residual de rechazo de alto esfuerzo (residual_w=0,2).

Los objetivos de la abliteración incluyen attn_output.weight, ffn_down_exps.weight, attn_gate.weight (capas >= 6), ffn_gate_inp.weight (router MoE en F32, capas >= 6) y output.weight (0,05), aplicando SVD de rango 2 sobre el núcleo del bucle y preservación completa de la norma de filas. La técnica de "Fixed-Scale Lagrangian Dual Lattice Packing" mantiene intactas las escalas de bloque originales UE4M3 (NVFP4), fp16 (IQ4_NL) y K-quant, eliminando el ruido de salto de escala bidireccional del 12,5% en NVFP4 y preservando la calibración imatrix privada de Unsloth. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO en su desarrollo original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Procesamiento de imagen-texto-a-texto (multimodal) mediante el proyector de visión mmproj-BF16.gguf.
- Razonamiento con modo de pensamiento (reasoning_effort configurable, por defecto "high" con valor 0,9).
- Razonamiento multi-paso a través del mecanismo de bucle inkling2_loop con 48 visitas.
- Arquitectura MoE con enrutamiento de expertos.
- Capacidad de ejecución local mediante llama.cpp y ecosistema GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Modelo abliterado: ausencia deliberada de mecanismos de rechazo en las evaluaciones realizadas.

## Casos de uso

- Investigación en alineamiento y seguridad: el modelo sirve para estudiar cómo se comporta un modelo sin mecanismos de rechazo y comparar con la versión original, gracias a las métricas de rechazo documentadas (0/40 en harmful EN y 0/20 en XSTest contrast).
- Red-teaming de sistemas: permite generar respuestas que un modelo censurado bloquearía, útil para probar la robustez de filtros y clasificadores de contenido en pipelines de moderación.
- Evaluación de técnicas de abliteración: las seis cuantizaciones con métricas de perplejidad y divergencia KL permiten analizar el impacto de la abliteración en distintos niveles de compresión (ratio PPL de 1,0454x a 1,0590x).
- Experimentación multimodal local: con el proyector de visión incluido, se pueden realizar tareas de descripción de imágenes y razonamiento visual en hardware de consumo usando la cuantización UD-Q2_K_XL (9,14 GB).
- Desarrollo de asistentes conversacionales en japonés e inglés: el soporte bilingüe y el modo conversacional lo hacen adecuado para prototipos de chat en estos idiomas.
- Estudio de cuantización dinámica: la preservación de tipos por tensor (BF16, NVFP4, Q8_0, etc.) permite investigar el efecto de las asignaciones de cuantización por capa en modelos MoE grandes.
- Pruebas de despliegue con llama.cpp: las cuantizaciones desde 9,14 GB hasta 22,87 GB permiten validar configuraciones de inferencia en distintos presupuestos de VRAM.

## Benchmarks y rendimiento

| Variante | PPL base | PPL abliterado | Ratio vs base | KLD medio | Same Top-p |
|---|---:|---:|---:|---:|---:|
| UD-Q8_K_XL | 8,3390 ± 0,3496 | 8,7957 | 1,0566x | 0,07266 | 88,29% |
| UD-Q4_K_XL | 8,3346 ± 0,3491 | 8,7993 | 1,0574x | 0,07059 | 89,07% |
| UD-Q4_K_M | 8,3335 ± 0,3489 | 8,8092 | 1,0587x | 0,07053 | 89,12% |
| UD-Q3_K_XL | 8,3898 ± 0,3507 | 8,8502 | 1,0566x | 0,06970 | 88,34% |
| UD-IQ3_XXS | 8,4706 ± 0,3540 | 8,9601 | 1,0590x | 0,06584 | 88,29% |
| UD-Q2_K_XL | 8,7473 ± 0,3671 | 9,1303 | 1,0454x | 0,05590 | 88,97% |

Evaluación de rechazo (juez LiquidAI/d1-2B):

| Modelo | Variante | Reasoning effort | EN harmful (40) | XSTest contrast (20) |
|---|---|---|---:|---:|
| Original v1 (bw_s088) | UD-Q8_K_XL | high (0,9) | 10/40 (25,0%) | 7/20 (35,0%) |
| Aggressive | UD-Q8_K_XL | high (0,9) | 0/40 (0,0%) | 0/20 (0,0%) |

Las métricas de perplejidad se obtuvieron con llama-perplexity sobre WikiText-2 con contexto de 512. El autor indica que se omitieron benchmarks de generación conductual completos en las variantes low y UD-Q4_K_XL a UD-Q2_K_XL (flag --skip-eval) para priorizar la publicación de las seis cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~9-10 GB (UD-Q2_K_XL, archivo de 9,14 GB) hasta ~23-24 GB (UD-Q8_K_XL, archivo de 22,87 GB), más ~0,64 GB del proyector de visión si se usa multimodalidad.
- GPU recomendadas: para UD-Q8_K_XL se requiere una GPU de 24 GB o superior (RTX 4090, A100 40GB, H100); para UD-Q4_K_M (16,61 GB) una RTX 4080/4090 de 16-24 GB; para UD-Q2_K_XL (9,14 GB) una RTX 3080/4070 de 10-12 GB.
- Cabe en GPU de consumo: sí, en las cuantizaciones UD-Q2_K_XL, UD-IQ3_XXS y UD-Q3_K_XL para GPUs de 12-16 GB; las variantes Q4 requieren 16-24 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte de llama-perplexity), Ollama, y servidores compatibles con endpoints (tag endpoints_compatible). No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-Aggressive | ~26,07 B (MoE) | no disponible | Apache 2.0 | GGUF | Abliterado agresivo, multimodal, 6 cuantizaciones |
| Inkling-2-Mini-Abliterated-Balanced | no disponible | no disponible | Apache 2.0 | GGUF | Variante equilibrada del mismo autor |
| Inkling-2-Mini-Abliterated (v1, bw_s088) | ~26,07 B (MoE) | no disponible | Apache 2.0 | GGUF | Línea base previa, 25% de rechazos EN harmful |
| Inkling-2-Mini (base) | ~26,07 B (MoE) | no disponible | no disponible | safetensors/GGUF | Modelo original de thinkingmachines, con censura |

## Limitaciones y advertencias

- Modelo abliterado sin mecanismos de rechazo: puede generar contenido dañino, ofensivo o inseguro; el autor lo restringe explícitamente a investigación, red-teaming y evaluación de alineamiento.
- No apto para producción comercial convencional sin revisión legal y de seguridad: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar normativas locales.
- Riesgo elevado de alucinación y de respuestas inapropiadas al haberse eliminado las direcciones de rechazo.
- Idiomas limitados a inglés y japonés; no hay soporte documentado de castellano.
- Longitud de contexto no documentada en la información disponible.
- La evaluación de rechazo se realizó solo sobre UD-Q8_K_XL; las cuantizaciones menores no tienen benchmarks conductuales completos (omitidos con --skip-eval).
- El incremento de perplejidad respecto al base es de aproximadamente un 5-6%, lo que indica una degradación moderada pero medible de la calidad del modelo.
- El repositorio es de gran tamaño (92,2 GB) y requiere descarga selectiva de la cuantización deseada.
- Sesgos conocidos: no documentados específicamente en la información disponible, pero heredados del modelo base y potencialmente amplificados por la abliteración.
- Fecha de creación futura (2026-11-22) en los metadatos, lo que puede indicar inconsistencias en el registro.

## Enlaces

- Hugging Face: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF
- Variante Balanced: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF
- Variante v1 baseline: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-GGUF
- Modelo base GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset Semantic-Harmful: https://huggingface.co/datasets/heretic-org/Semantic-Harmful
- Dataset Semantic-Harmless: https://huggingface.co/datasets/heretic-org/Semantic-Harmless
- Checksums: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF/blob/main/SHA256SUMS.txt
