# Jeesup/svd-safety-l2_dualk_jbbsep_mix_tok_r40

## Resumen

`svd-safety-l2_dualk_jbbsep_mix_tok_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` en el que se ha aplicado una compresión SVD con blanqueado K-FAC en dos dominios (utilidad y seguridad) para eliminar el 40 % de los parámetros densos, seguida de una recuperación mediante LoRA de segunda etapa (SVD-LLM). El resultado conserva 6.738.415.616 parámetros, es decir, el 59,98 % del modelo original. Lo publica el usuario Jeesup como una celda concreta de una rejilla experimental sobre reglas de selección de componentes y presupuestos de rango.

El problema que aborda no es el despliegue de un asistente, sino la medición del daño que la compresión SVD inflige al comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. La innovación técnica está en el solver `mix`: una SVD blanqueada en forma cerrada sobre una matriz K-FAC combinada que mezcla curvatura de utilidad (calibrada con wikitext-2) y curvatura de seguridad (calibrada con 96 muestras de `jbb_harm_resp_sep`), con un peso de seguridad α = 0,0464.

Es relevante ahora porque cuantifica empíricamente el trade-off seguridad/utilidad bajo compresión: el checkpoint reporta un ASR de 0,0038 en AdvBench y 0,0256 en StrongREJECT, pero también un sobre-rechazo macro de 0,4598, lo que ilustra el coste en utilidad conversacional de forzar la seguridad durante la compresión. El autor advierte explícitamente de que es un artefacto de investigación, no un modelo de chat de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con blanqueado K-FAC dual y recuperación LoRA |
| Parámetros totales | 6.738.415.616 (59,98 % del denso original) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible en la model card (el modelo base Llama 2 está orientado principalmente a inglés) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con 7B parámetros en configuración densa. Sobre él se aplica una compresión SVD-LLM con presupuesto de rango por matriz calculado al mismo ratio de eliminación (40 %). La selección de componentes no usa la curvatura de utilidad sola, sino una matriz de Fisher aproximada tipo K-FAC combinada: F_mix = [(1−α)·G_u + α·G_s] ⊗ [(1−α)·A_u + α·A_s], con α = 0,0464. La normalización de curvatura es `tok`: las activaciones A se dividen por posiciones y los gradientes G por tokens de pérdida (entropía cruzada sumada), por dominio. La calibración de utilidad usa wikitext-2-raw-v1 (255 ventanas de 2048 tokens, semilla 42, pérdida de siguiente token); la de seguridad usa 96 muestras de `jbb_harm_resp_sep` con pérdida sobre los tokens de respuesta.

Tras la compresión, el checkpoint se recupera con la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. No se documenta RLHF ni DPO adicionales más allá de los del modelo base. La semilla global es 42.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat y parcialmente recuperada con el ajuste LoRA sobre alpaca-cleaned.
- Razonamiento de siguiente token y respuesta a instrucciones en formato chat de Llama 2.
- Comportamiento de rechazo ante peticiones dañinas, medido con AdvBench y StrongREJECT (ASR bajo, ver benchmarks).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta thinking mode, visión ni audio.
- Capacidades multilingües: no documentadas; el modelo base Llama 2 está centrado en inglés.

## Casos de uso

- Estudio del trade-off seguridad/utilidad bajo compresión: usar este checkpoint como celda de control en una rejilla que compare reglas de selección de componentes (utilidad sola frente a curvatura dual) y medir ASR y perplejidad con el mismo protocolo.
- Investigación en interpretabilidad de la seguridad: analizar qué componentes (filas/columnas de matrices de proyección) son críticos para el rechazo de peticiones dañinas comparando este checkpoint con el denso original y con brazos degradados de la rejilla.
- Evaluación de sobre-rechazo: emplear el valor de 0,4598 en WildGuard como referencia para calibrar clasificadores de rechazo y estudiar falsos positivos en modelos comprimidos.
- Baseline para técnicas de recuperación post-compresión: comparar la etapa LoRA de SVD-LLM (r=8, alpaca-cleaned) con otras estrategias de recuperación (destilación, fine-tuning completo) sobre el mismo presupuesto del 60 %.
- Reproducibilidad de pipelines de compresión: servir como referencia ejecutable del solver `mix` con α = 0,0464 y normalización `tok`, útil para validar implementaciones de K-FAC blanqueado en SVD.
- Análisis de robustez de salvaguardas: medir cómo varía el ASR (AdvBench 0,0038; StrongREJECT 0,0256) al aplicar cuantizaciones posteriores o al cambiar la temperatura de muestreo, siempre en entorno de laboratorio.
- Docencia en compresión de modelos: ejemplo práctico de eliminación del 40 % de parámetros con recuperación LoRA y evaluación con perplejitud en WikiText-2 (9,9237) y precisión zero-shot media (0,4861).

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0256 |
| Sobre-rechazo macro (WildGuard) | 0,4598 |
| Perplejidad WikiText-2 | 9,9237 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4861 |

No se han publicado en la información disponible resultados desglosados por tarea ni comparaciones directas con el modelo denso original o con otros brazos de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más caché KV y activaciones; en la práctica, 16-24 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB de pesos (no documentado por el autor, estimación a partir del recuento de parámetros).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y contexto largo; RTX 4090 (24 GB) suficiente para inferencia en bf16 con batch moderado; RTX 3090 (24 GB) y RTX 4080 (16 GB) viables en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 y en GPUs de 8-12 GB con cuantización de 4-8 bits, siempre que se aplique una herramienta de cuantización externa.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están documentados para este checkpoint, aunque al ser una arquitectura Llama 2 estándar deberían ser adaptables convirtiendo los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR AdvBench | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l2_dualk_jbbsep_mix_tok_r40 (este) | 6,74B (60 % del denso) | no disponible | 0,0038 | 9,9237 | Llama 2 Community | Hugging Face (0 descargas) |
| meta-llama/Llama-2-7b-chat-hf (base denso) | 6,74B | 4096 tokens (configuración estándar de Llama 2) | no disponible en esta ficha | no disponible en esta ficha | Llama 2 Community | Hugging Face |
| Otros brazos de la rejilla del mismo autor | ~6,74B | no disponible | no disponible | no disponible | Llama 2 Community | Hugging Face (no listados en la información) |

No se dispone de datos de benchmarks del modelo base ni de otros brazos de la rejilla en la información proporcionada, por lo que la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo de chat de propósito general y que debe evaluarse antes de extraer conclusiones.
- Brazos de la rejilla deliberadamente degradados en seguridad: la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint es solo una celda; no debe tomarse como garantía de robustez.
- Sobre-rechazo elevado: 0,4598 macro en WildGuard, lo que implica que rechaza una fracción sustancial de peticiones benignas y degrada la utilidad conversacional.
- Riesgo de alucinación: no cuantificado en la model card; al estar comprimido y recuperado con un LoRA pequeño (r=8, alpaca-cleaned), la fidelidad factual puede verse afectada.
- Idiomas: no documentados; el modelo base Llama 2 está centrado en inglés, por lo que el rendimiento en castellano no está garantizado.
- Contexto: no documentado en esta ficha; se hereda la configuración de Llama-2-7b-chat, pero no se ha verificado tras la compresión.
- Licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a las restricciones de la política de uso de Meta.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Fecha de creación declarada 2026-11-10, posterior a la fecha actual de referencia; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_jbbsep_mix_tok_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: incluida en el repositorio como `LICENSE.txt` y `USE_POLICY.md`
- Paper de SVD-LLM (referencia metodológica citada en la model card): no disponible como enlace en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
