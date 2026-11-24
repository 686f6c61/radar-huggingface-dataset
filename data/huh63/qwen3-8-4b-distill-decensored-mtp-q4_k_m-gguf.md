# hUh63/Qwen3.8-4B-Distill-Decensored-MTP-Q4_K_M-GGUF

## Resumen

Qwen3.8-4B-Distill-Decensored-MTP-Q4_K_M-GGUF es una cuantización GGUF en Q4_K_M, realizada por el usuario hUh63, de una destilación de parámetros completos del modelo Qwen3.8 2.4T-A95B (según la model card) hacia la arquitectura de Qwen3.5-4B del equipo Qwen de Alibaba. Sobre esa destilación, el autor aplica un proceso de "decensoring" con Heretic v2.1.0.dev0 (snapshot de desarrollo) que debilita deliberadamente la alineación de seguridad del modelo original mediante ablación de direcciones en el espacio de pesos (método ARA con extensión de magnitud del task vector).

El modelo está orientado a investigación sobre alineación, edición de pesos y evaluación de robustez de salvaguardas, no a uso en producción. La revisión publicada documenta con detalle el protocolo de evaluación (100 prompts de harmful_behaviors y 100 de harmless_alpaca, decodificación greedy, 64 tokens nuevos) y los resultados medidos: 33/100 rechazos con KL 0.0152 frente al modelo base, que rechaza 98/100. El autor reconoce explícitamente que no alcanza el objetivo declarado de ≤6/100 rechazos con KL ≤0.02.

El repositorio incluye además pesos en formato GGUF cuantizados con llama.cpp y un conjunto de artefactos de trazabilidad (curvas KL vs λ, frente de Pareto, registros de puntos evaluados). La información disponible no permite confirmar el número real de parámetros del modelo base, ya que el dato de safetensors del repo (333.514.240) no es coherente con la denominación "4B" ni con el tamaño del repo (3.5 GB), lo que se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5-4B), con soporte de decodificación especulativa MTP (multi-token prediction) |
| Parametros totales | No disponible de forma fiable; el repo declara 333.514.240 en safetensors, incoherente con la denominación "4B" y con el tamaño del repo (3.5 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (con imatrix), según tags del repo; no se listan otras variantes en la información disponible |
| Idiomas soportados | en, zh, ko, ja, ru, es, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card describe el modelo base como una destilación de parámetros completos de Qwen3.8 2.4T-A95B (un modelo MoE de 2,4 billones de parámetros totales y 95.000 millones activos, según la nomenclatura indicada) hacia la arquitectura densa de Qwen3.5-4B. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la destilación original de empero-ai.

La innovación técnica principal documentada es el proceso de decensoring. En lugar de reoptimizar los seis parámetros de ARA (ablación por adaptadores LoRA) en cada intento, esta revisión fija una única dirección de ablación ΔW (el punto de menor KL del round anterior, medido sobre 100 prompts) y escala su magnitud con un escalar λ según W_eff(λ) = W_base + λ·ΔW, con ΔW = B @ A. El valor λ = 0 recupera el modelo original, λ = 1 corresponde al punto ancla de ARA y λ > 1 extrapola en la misma dirección. La implementación escala los pesos de lora_B por λ, ya que ARA usa lora_alpha = r = 1 y preserve_row_magnitudes solo afecta a la pérdida de optimización, no al peso desplegado. El proceso incluye una prueba de humo determinista que exige KL(λ=0) ≈ 0 y, en caso contrario, revierte automáticamente a la búsqueda en el espacio de parámetros. La bisección de frontera localiza λ* = 1.1797 con presupuesto de KL 0.02.

La cuantización se realizó con llama.cpp en Q4_K_M con imatrix. El autor advierte que Q4_K_M es con pérdida (lossy) y que no se ejecutó ningún benchmark estándar (MMLU, GSM8K, etc.).

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B (no se detallan capacidades específicas en la información disponible).
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text y los tags incluyen vision, por lo que el modelo base es multimodal.
- Soporte de decodificación especulativa mediante MTP (multi-token prediction), integrado en el build.
- Capacidades multilingües declaradas para en, zh, ko, ja, ru, es y fr.
- Comportamiento "decensored": el modelo reduce deliberadamente la tasa de rechazos ante prompts dañinos (33/100 frente a 98/100 del base), lo que constituye una capacidad buscada por el autor para investigación sobre alineación.
- No se documenta en la información disponible soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Investigación sobre alineación y salvaguardas: el modelo sirve para estudiar cómo responde un sistema con alineación debilitada frente a prompts dañinos, usando el protocolo de 100 prompts publicado y comparando con el modelo base (98/100 rechazos) para medir el efecto de la ablación.
- Estudio de edición de pesos y task vectors: la dirección ΔW y el barrido de λ documentados permiten reproducir y extender el análisis de cómo la magnitud de una ablación afecta al equilibrio entre utilidad (KL) y reducción de rechazos.
- Evaluación de robustez de clasificadores de seguridad: al generar respuestas con distintos niveles de cumplimiento (desde 2/100 hasta 98/100 rechazos según λ), puede emplearse como conjunto de pruebas para validar filtros y moderadores.
- Análisis de la degradación por cuantización: comparar el comportamiento del Q4_K_M con el modelo BF16 de origen en tareas controladas permite cuantificar el impacto de la cuantización de 4 bits sobre el equilibrio utilidad-seguridad.
- Experimentación local con llama.cpp: el formato GGUF y la cuantización Q4_K_M permiten ejecutar el modelo en hardware de consumo para pruebas de inferencia y decodificación especulativa con MTP.
- Docencia y divulgación técnica: el repositorio incluye artefactos trazables (tv_curve.json, pareto.json, points24.jsonl, summary.json) útiles para explicar frentes de Pareto y compensaciones entre métricas en cursos de IA.

## Benchmarks y rendimiento

Los únicos datos publicados son del protocolo de decensoring del autor (100 prompts de harmful_behaviors y 100 de harmless_alpaca, greedy, 64 tokens nuevos). No se ejecutaron benchmarks estándar (MMLU, GSM8K, HumanEval, etc.).

| Punto | λ | Rechazos (harmful_behaviors test[:100]) | KL vs base (harmless_alpaca test[:100]) | Estado |
|---|---:|---:|---:|---|
| 200 | 3.0 | 2/100 | 0.1088 | evaluado |
| 201 | 1.5 | 20/100 | 0.0292 | evaluado |
| 202 | 1.1797 | 35/100 | 0.0205 | evaluado |
| 203 | 1.0 | 33/100 | 0.0152 | evaluado (build publicado) |
| 204 | 0.5 | 84/100 | 0.0049 | evaluado |
| 205 | 0.0 | 98/100 | -0.0000 | evaluado |

| Modelo | Rechazos | KL vs base |
|---|---:|---:|
| empero-ai/Qwen3.8-4B-Distill (BF16 base) | 98/100 | 0 (por definición) |
| Este build (λ = 1.0000) | 33/100 | 0.0152 |
| Objetivo declarado | ≤ 6/100 | ≤ 0.02 |
| Mejor ronda previa de 24 núcleos | 28/100 | 0.0244 |
| Upload anterior de 8 núcleos | 10/100 | 0.0407 |

El autor reconoce que el objetivo no se cumplió: el KL está dentro de presupuesto, pero la tasa de rechazos (33/100) supera el umbral de ≤6/100. El conteo de rechazos usa los marcadores de palabra clave de Heretic, por lo que una respuesta cauta pero conforme que empiece con un aviso cuenta como rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. El repo ocupa 3,5 GB, lo que da una referencia aproximada del tamaño de los pesos Q4_K_M, pero no se detalla el consumo en ejecución.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del repo (3,5 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no se aportan mediciones.
- Opciones de despliegue: llama.cpp (herramienta usada para la cuantización); no se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El build incorpora MTP para decodificación especulativa, pero no se publican cifras de aceleración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos (protocolo del autor) | KL vs base | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este build (Qwen3.8-4B-Distill-Decensored, Q4_K_M) | No disponible de forma fiable (denominado 4B) | No disponible | 33/100 | 0.0152 | Apache-2.0 | GGUF |
| empero-ai/Qwen3.8-4B-Distill (BF16) | No disponible de forma fiable (denominado 4B) | No disponible | 98/100 | 0 (por definición) | Apache-2.0 | safetensors (según modelo base) |
| Qwen/Qwen3.5-4B | 4B (según denominación) | No disponible | No evaluado en este protocolo | No aplica | Apache-2.0 (según el repo) | No disponible |

La comparación con alternativas de la misma categoría (otros modelos decensored o ablacionados) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El build debilita deliberadamente la alineación de seguridad del modelo de origen; el autor lo restringe a investigación y uso local, y la responsabilidad de cumplimiento recae en el usuario.
- El objetivo declarado de decensoring no se alcanzó: 33/100 rechazos frente al umbral de ≤6/100, aunque el KL (0.0152) sí está dentro del presupuesto de 0.02.
- La cuantización Q4_K_M es con pérdida y puede degradar tanto la calidad como el comportamiento de seguridad respecto al modelo BF16.
- No se ejecutaron benchmarks estándar (MMLU, GSM8K, HumanEval, etc.), por lo que no hay evidencia publicada sobre capacidades generales.
- Heretic 2.1.0.dev0 es un snapshot de desarrollo, no una versión estable, lo que añade riesgo de reproducibilidad.
- El conteo de rechazos depende de marcadores de palabra clave de Heretic; respuestas conformes con avisos iniciales cuentan como rechazo, lo que limita la interpretación exacta de la métrica.
- Existe una incoherencia entre el número de parámetros declarado en safetensors (333.514.240) y la denominación "4B" del modelo, así como con el tamaño del repo (3,5 GB); conviene verificar el modelo base antes de cualquier uso.
- No se documentan sesgos conocidos, riesgo de alucinación, limitaciones de contexto ni restricciones adicionales de licencia más allá de Apache-2.0 en la información disponible.
- El modelo tiene 0 likes y 361 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hUh63/Qwen3.8-4B-Distill-Decensored-MTP-Q4_K_M-GGUF
- Modelo base de la destilación: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Arquitectura base: https://huggingface.co/Qwen/Qwen3.5-4B
- Heretic (herramienta de decensoring): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfiles de evaluación (mlabonne): https://huggingface.co/mlabonne
