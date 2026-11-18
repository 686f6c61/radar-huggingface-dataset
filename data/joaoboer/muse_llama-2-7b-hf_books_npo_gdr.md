# JoaoBoer/muse_Llama-2-7b-hf_Books_NPO_GDR

## Resumen

`muse_Llama-2-7b-hf_Books_NPO_GDR` es un modelo derivado de Llama 2 7B obtenido mediante técnicas de *machine unlearning* sobre el conjunto de datos MUSE-Books. Lo publica el usuario JoaoBoer como parte del proyecto Speculative-Decoding-Unlearning, y su función es servir de línea base de olvido a nivel de pesos (weight unlearning) y de modelo borrador en esquemas de decodificación especulativa.

El modelo parte de `muse-bench/MUSE-Books_target` y se entrena con el algoritmo NPO_GDR (Negative Preference Optimization con Gradient Difference Regularization) implementado en el framework open-unlearning. El objetivo es eliminar la memorización del conjunto *forget* de MUSE-Books manteniendo, en la medida de lo posible, el rendimiento sobre el conjunto *retain*.

Es relevante para investigadores en privacidad y cumplimiento normativo (derecho al olvido, RGPD) que necesitan evaluar hasta qué punto un modelo de 7B puede "desaprender" contenido concreto sin degradar sus capacidades generales. No es un modelo de propósito general: es un artefacto de investigación con métricas MUSE publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (6,74 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de Llama 2 vía transformers/llama.cpp, no verificado) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Llama 2 7B: transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU. Sobre ese checkpoint (`muse-bench/MUSE-Books_target`) se aplica un ajuste fino de desaprendizaje con NPO_GDR mediante el framework open-unlearning, usando el conjunto *forget* de MUSE-Books.

Los hiperparámetros publicados en `.hydra/config.yaml` son: `gamma: 1.0`, `alpha: 0.1`, `retain_loss_type: NLL`, `beta: 0.1` y `precompute_ref: True`. El entrenamiento combina una pérdida de preferencia negativa (NPO) sobre el conjunto a olvidar con un término de retención NLL sobre el conjunto a conservar, y una regularización de diferencia de gradientes (GDR) controlada por `gamma`. El resultado es un checkpoint que reduce la probabilidad de generar contenido del conjunto *forget* mientras intenta preservar la distribución original en el resto de datos.

## Capacidades

- Generación de texto autoregresiva, heredada de Llama 2 7B.
- Desaprendizaje dirigido del conjunto forget de MUSE-Books (libros), con métricas MUSE de extracción y verbatim publicadas.
- Uso como modelo borrador (draft model) en decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Evaluación de referencia frente a otros métodos de unlearning (NPO, GDR, variantes) sobre el mismo checkpoint base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas de Llama 2, sin evaluación específica).

## Casos de uso

- Investigación en machine unlearning: comparar NPO_GDR contra otros algoritmos sobre MUSE-Books usando las métricas publicadas (extraction_strength, forget/retain ROUGE, privleak) como referencia reproducible.
- Cumplimiento del derecho al olvido: evaluar si un modelo de 7B puede eliminar la memorización de obras concretas sin reentrenar desde cero, midiendo el coste en retención (retain_knowmem_ROUGE de 0,6232 en modo greedy).
- Modelo borrador en decodificación especulativa: al compartir arquitectura y vocabulario con Llama 2 7B, puede emparejarse con el modelo objetivo para acelerar la inferencia en el pipeline del proyecto.
- Auditoría de privacidad: usar `privleak` (-56,4164) y las métricas de extracción para cuantificar fugas de información tras el desaprendizaje.
- Estudio de estabilidad del olvido: los directorios `evals_sampled_s0`…`s4` permiten analizar la varianza de las métricas de generación con muestreo (temperatura 1, top_p 1, top_k 0) en cinco semillas.
- Línea base en publicaciones académicas: punto de comparación para nuevos métodos de unlearning evaluados sobre MUSE-Books con el mismo protocolo.

## Benchmarks y rendimiento

Métricas MUSE publicadas en la model card:

| Métrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0,4284 | – |
| forget_knowmem_ROUGE | 0,3338 | 0,2360 ± 0,0243 |
| forget_verbmem_ROUGE | 0,5538 | 0,4980 ± 0,0143 |
| privleak | -56,4164 | – |
| retain_knowmem_ROUGE | 0,6232 | 0,4157 ± 0,0259 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y caché KV (en torno a 14-16 GB en total).
- VRAM estimada en cuantización de 8 bits: ~7 GB; en 4 bits: ~4-5 GB (estimaciones según el tamaño de parámetros; no verificadas para este checkpoint).
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para secuencias cortas.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama/vLLM no están verificados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_Books_NPO_GDR | 6,74 B | no disponible | NPO_GDR sobre MUSE-Books | llama2 | Hugging Face (23 descargas) |
| muse-bench/MUSE-Books_target | 6,74 B (Llama 2 7B) | no disponible | Modelo objetivo sin desaprender | llama2 | Hugging Face (muse-bench) |
| Otros checkpoints open-unlearning sobre MUSE-Books | ~6,74 B | no disponible | NPO, GDR y variantes | llama2 | Repositorio open-unlearning (no verificado) |

No se dispone de datos de rendimiento comparativos con alternativas fuera del ecosistema MUSE en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su rendimiento fuera del dominio de evaluación MUSE no está caracterizado.
- El desaprendizaje es parcial: extraction_strength de 0,4284 y forget_verbmem_ROUGE de 0,5538 indican que aún se recupera contenido del conjunto forget, especialmente en modo greedy.
- Riesgo de alucinación: heredado de Llama 2 7B, sin mitigaciones específicas documentadas.
- Sesgos: no evaluados en la información disponible; se heredan los del checkpoint base Llama 2.
- Idiomas: no se documenta cobertura multilingüe ni evaluación por idioma.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); revisar antes de cualquier despliegue.
- La fecha de creación del repo (2026-10-22) y la de actualización (2026-11-18) figuran así en los metadatos; verificar su coherencia antes de citarlo.
- Sin likes y con 23 descargas: ecosistema de validación muy reducido; no hay evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_Books_NPO_GDR
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset MUSE-Books: https://huggingface.co/datasets/muse-bench/MUSE-Books
- Modelo base: https://huggingface.co/muse-bench/MUSE-Books_target
