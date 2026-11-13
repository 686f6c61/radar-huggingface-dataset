# kwanhee/Kimi-K2.5-REAP-E112-NVFP4-W4A4-GS16

## Resumen

Kimi-K2.5-REAP-E112-NVFP4-W4A4-GS16 es un checkpoint derivado de moonshotai/Kimi-K2.5, un modelo de mezcla de expertos (MoE) a escala de billones de parámetros, publicado por el usuario kwanhee como material de réplica (rebuttal) para el artículo *Hardware-Native Joint Sparse-Quantization for Trillion-Scale Mixture-of-Experts* (MoE-SQ, arXiv 2610.02241). El checkpoint aplica dos transformaciones encadenadas sobre el modelo base: primero una poda de expertos mediante REAP, que reduce los expertos enrutados de 384 a 112 por capa manteniendo el enrutamiento top-8, y después una cuantización densa NVFP4 con pesos y activaciones a 4 bits (W4A4) y tamaño de grupo 16, inicializada con GPTQ de MoE-SQ.

El resultado es un modelo de 308.026.444.848 parámetros totales (unos 308 mil millones) con un repositorio de aproximadamente 190,6 GB, diseñado explícitamente como comparación de igualdad de presupuesto de bits frente a MoE-SQ: el autor reporta 1,312 bits por peso de experto enrutado, contabilizando pesos, escalas y metadatos de los 384 expertos originales. La atención, el experto compartido, la primera capa densa, el router, los embeddings, el `lm_head` y la torre de visión permanecen en bf16.

Es relevante ahora porque documenta una vía concreta de compresión agresiva para modelos MoE de escala trillonaria orientada a hardware Blackwell (SM103), con instrucciones de servicio específicas para vLLM y un parche de MoE-SQ. No obstante, se trata de un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, sin evaluación multimodal publicada y con resultados de benchmarks no incluidos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención; incluye torre de visión (arquitectura `kimi_k25`, código personalizado) |
| Parametros totales | 308.026.444.848 (~308 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con group size 16 en pesos de expertos enrutados; resto en bf16; tags indican 8-bit y compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT (licencia `other` con `license_name: modified-mit`) |
| Formato de pesos | safetensors (compressed-tensors), librería transformers |

## Arquitectura y entrenamiento

El modelo base es un MoE de Kimi-K2.5 con 384 expertos enrutados por capa y enrutamiento top-8. Este checkpoint no reentrena el modelo: aplica una poda REAP en dos fases documentadas. La etapa 1 usa `REAPPruningModifier` de llm-compressor 0.13.0 sobre los pesos bf16 de Kimi-K2.5 (descomprimidos desde la release INT4), con corpus de calibración `mixed` de 512 secuencias de 4096 tokens, podando capas de forma secuencial y eliminando 272 de los 384 expertos enrutados por capa. El checkpoint podado conserva los pesos bf16 con los expertos descartados eliminados y el sesgo de corrección de puntuaciones del router recortado; los índices de expertos conservados por capa están en `reap_kept_experts.jsonl`.

La etapa 2 aplica cuantización densa NVFP4 W4A4 mediante inicialización GPTQ de MoE-SQ: valores NVFP4, group size 16, cuantización falsa de activaciones, refinamiento desactivado, calibración `mixed`, Hessianos de 512 muestras y `percdamp` 0.1, con la misma configuración que `kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16` salvo la ruta del modelo (`moe_sq_config.yaml`). La etapa 1 y el recorte se ejecutaron en 8× NVIDIA B300 (SM103); la etapa 2 usó atención eager con máscara causal explícita en lugar de FlashAttention-2, no disponible para SM103 en ese entorno, lo que según el autor solo altera el orden de suma en coma flotante de las pasadas de calibración.

## Capacidades

- Generación de texto y extracción de características (pipeline declarado: `feature-extraction`).
- Razonamiento y respuesta conversacional heredados del modelo base Kimi-K2.5.
- Capacidad multimodal potencial por la torre de visión conservada en bf16, aunque el autor indica que las rutas multimodales no están probadas y todas las evaluaciones son solo de texto.
- Enrutamiento MoE top-8 sobre 112 expertos por capa tras la poda.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en compresión de MoE: servir el checkpoint con vLLM v0.30.0 y el parche MoE-SQ (`IST-DASLab/MoESQ`, `integrations/vllm/install.sh`) para reproducir la comparación de igualdad de presupuesto de bits entre poda REAP y MoE-SQ descrita en el artículo.
- Estudio de poda de expertos: analizar `reap_kept_experts.jsonl` para evaluar qué expertos sobreviven por capa y cómo afecta la selección a la calidad, usando el modelo como referencia empírica de una poda del 70,8 % de expertos (272 de 384).
- Evaluación de cuantización NVFP4 en hardware Blackwell: desplegar en 8× B300 (SM103) para medir latencia y throughput reales de W4A4 con group size 16 frente a bf16 y frente a otras cuantizaciones.
- Extracción de características a gran escala: emplear el pipeline `feature-extraction` para generar representaciones de texto en tareas de recuperación o clasificación, aprovechando los ~191 GB de pesos comprimidos.
- Comparación de metodologías de compresión: usar el checkpoint junto a `kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16` para aislar el efecto del número de expertos conservados con idéntica configuración de cuantización.
- Reproducibilidad de artículos: validar los resultados de MoE-SQ (arXiv 2610.02241) en un entorno con el stack de servicio documentado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 190,6 GB en safetensors NVFP4/bf16 mixto; se requiere un pool de GPU cuyo total supere ese tamaño con margen para caché KV y activaciones. El valor exacto no está disponible.
- GPU recomendadas: NVIDIA B300 (SM103), que es el hardware usado para poda y cuantización y el soportado por el parche MoE-SQ; otras arquitecturas no están documentadas.
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del checkpoint (~191 GB) no es viable en una sola GPU de consumo convencional.
- Opciones de despliegue: vLLM v0.30.0 con el parche MoE-SQ (`IST-DASLab/MoESQ`, `integrations/vllm/install.sh`); otros motores (llama.cpp, Ollama, TGI) no están documentados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos enrutados | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kwanhee/Kimi-K2.5-REAP-E112-NVFP4-W4A4-GS16 | ~308 mil millones | 112 de 384, top-8 | NVFP4 W4A4 gs16 + bf16 | no disponible | Modified MIT | Hugging Face, 0 descargas |
| kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16 | no disponible | REAP al 50 % (no confirmado) | NVFP4 W4A4 gs16 | no disponible | no disponible | Hugging Face |
| moonshotai/Kimi-K2.5 (base) | no disponible | 384, top-8 | bf16 / release INT4 | no disponible | Modified MIT | Hugging Face |

## Limitaciones y advertencias

- Checkpoint de investigación sin descargas ni likes en el momento de la consulta; no hay evidencia de validación independiente.
- No se han publicado benchmarks ni evaluaciones de calidad en la información disponible; el impacto de eliminar 272 de 384 expertos por capa sobre el rendimiento no está cuantificado aquí.
- Las rutas multimodales no están probadas: todas las evaluaciones del autor son solo de texto, pese a conservar la torre de visión.
- El servicio requiere un stack específico (vLLM v0.30.0 con parche MoE-SQ) y hardware SM103; FlashAttention-2 no estaba disponible en ese entorno durante la calibración.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben asumirse los del modelo base Kimi-K2.5.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe.
- Licencia Modified MIT con ficheros `LICENSE` y `THIRD_PARTY_NOTICES.md`; deben revisarse antes de uso comercial, y se requiere atribución a moonshotai/Kimi-K2.5, a Cerebras Research (REAP) y a llm-compressor.
- El tag `8-bit` junto a NVFP4 y bf16 sugiere una mezcla de precisiones; conviene verificar la configuración exacta de `compressed-tensors` antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/kwanhee/Kimi-K2.5-REAP-E112-NVFP4-W4A4-GS16
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Checkpoint comparativo: https://huggingface.co/kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16
- Artículo MoE-SQ: arXiv 2610.02241
- Repositorio e integración vLLM: IST-DASLab/MoESQ (`integrations/vllm/install.sh`)
- Implementación REAP: llm-compressor `REAPPruningModifier` (Cerebras Research)
