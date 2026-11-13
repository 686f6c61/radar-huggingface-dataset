# kwanhee/Kimi-K2.5-REAP-E192-P48NVFP4-MoESQ

## Resumen

Kimi-K2.5-REAP-E192-P48NVFP4-MoESQ es un checkpoint derivado de `moonshotai/Kimi-K2.5`, publicado por el usuario kwanhee como material de réplica (rebuttal) para el artículo *Hardware-Native Joint Sparse-Quantization for Trillion-Scale Mixture-of-Experts* (MoE-SQ). El modelo combina dos técnicas de compresión sobre el MoE original: poda de expertos enrutados mediante REAP (192 de 384 expertos por capa, manteniendo el enrutamiento top-8) y almacenamiento cuantizado NVFP4 en formato sparse paired-4:8, heredado byte a byte de `ISTA-DASLab/Kimi-K2.5-P48NVFP4-MoESQ`.

El resultado es un modelo de 329.200.148.208 parámetros totales (unos 329 mil millones) y aproximadamente 199 GB de pesos, con atención, experto compartido, primera capa densa, router, embeddings, `lm_head` y torre de visión conservados en bf16. El objetivo declarado es ofrecer una comparación con presupuesto de bits equivalente entre poda de expertos (REAP) y MoE-SQ, no un modelo listo para producción.

Es relevante porque ejemplifica las técnicas actuales para reducir el coste de servir MoE a escala de billones de parámetros, y porque documenta explícitamente el proceso de construcción (slicing de tensores, calibración y reindexado) junto con las limitaciones de su pipeline de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con torre de visión; 384 expertos enrutados por capa en el modelo base, 192 tras poda REAP, top-8 routing |
| Parametros totales | 329.200.148.208 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 con almacenamiento sparse paired-4:8 (1.375 bits por peso de experto enrutado, contabilizando pesos, escalas y metadatos de los 384 expertos); resto de componentes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT (licencia `other`, nombre `modified-mit`); avisos upstream en `THIRD_PARTY_NOTICES.md` |
| Formato de pesos | safetensors (compressed-tensors), librería `transformers` con `custom_code` |

## Arquitectura y entrenamiento

El modelo base Kimi-K2.5 es un transformer MoE con 384 expertos enrutados por capa, enrutamiento top-8, experto compartido, primera capa densa y una torre de visión para entradas multimodales. Este checkpoint no entrena nada nuevo: parte de `ISTA-DASLab/Kimi-K2.5-P48NVFP4-MoESQ` y aplica un slicing selectivo. Los tensores de los expertos conservados por REAP se copian byte a byte (almacenamiento sparse paired-4:8), se renumeran en orden y se recortan las filas del router y el sesgo de corrección de scores; se eliminan 192 de 384 expertos por capa. Los índices conservados provienen de REAP ejecutado con `llm-compressor` 0.13.0, calibración `mixed` y 512 secuencias de 4096 tokens, y se publican en `reap_kept_experts.jsonl`.

La innovación técnica es la combinación de dos ejes de compresión: poda estructurada de expertos (REAP, de Cerebras Research, vía `REAPPruningModifier` de llm-compressor) y cuantización NVFP4 con patrón sparse paired-4:8 (MoE-SQ). El autor advierte explícitamente de que el modelo podado nunca pasó por el proceso de compresión MoE-SQ, ya que los tensores se copian sin recomprimir; por tanto, no hay recubertización ni ajuste tras la poda. El pipeline de slicing se ejecutó en 8 GPU NVIDIA B300 (SM103).

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Kimi-K2.5 (no se documentan evaluaciones específicas en este checkpoint).
- Procesamiento multimodal: la torre de visión se conserva en bf16, aunque el autor indica que las rutas multimodales no están probadas y todas las evaluaciones son solo de texto.
- Enrutamiento MoE top-8 sobre 192 expertos por capa, con experto compartido y primera capa densa intactos.
- Capacidades de tool calling, function calling y razonamiento multi-paso: no documentadas en la model card de este checkpoint; deben asumirse las del modelo base, sin verificación publicada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en compresión de MoE: el checkpoint sirve como referencia reproducible para comparar poda REAP frente a MoE-SQ con el mismo presupuesto de bits (1.375 bits por peso de experto enrutado), usando los índices de `reap_kept_experts.jsonl` y el pipeline de slicing descrito.
- Reproducción de resultados del artículo MoE-SQ (arXiv 2610.02241): permite verificar la afirmación de que la poda y la cuantización sparse son ejes complementarios en modelos a escala de billones de parámetros.
- Estudio de serving de MoE de gran tamaño: con ~199 GB de pesos y 192 expertos por capa, es un banco de pruebas para medir throughput y latencia de vLLM con el parche MoE-SQ (`IST-DASLab/MoESQ`, `integrations/vllm/install.sh`) en hardware Blackwell.
- Análisis de degradación por poda: al conservar el router recortado y el sesgo de corrección de scores, permite estudiar cómo afecta la eliminación de la mitad de los expertos a la distribución de routing y a la calidad de salida en tareas de texto.
- Evaluación de formatos NVFP4 paired-4:8: útil para validar herramientas de `compressed-tensors` y kernels de cuantización de 4 bits con sparsity estructurada en pipelines de inferencia reales.
- Base para experimentos de recubertización o fine-tuning posterior a la poda: al no haberse recomprimido tras el pruning, es un punto de partida limpio para estudiar si un ajuste recupera calidad perdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 198,7 GB en safetensors; se necesita al menos ese espacio en memoria de GPU o un esquema de offloading. No se dispone de estimaciones de VRAM pico publicadas.
- GPU recomendadas: el autor reporta el uso de 8× NVIDIA B300 (SM103) para el slicing; el stack de serving indicado es vLLM v0.30.0 con el parche MoE-SQ, orientado a hardware Blackwell con soporte NVFP4.
- ¿Cabe en GPU consumer? No de forma directa: 198,7 GB de pesos exceden la memoria de cualquier GPU consumer actual (RTX 4090, 24 GB). Requeriría múltiples GPU o técnicas de offloading no documentadas.
- Opciones de despliegue: vLLM v0.30.0 con el parche `IST-DASLab/MoESQ` (`integrations/vllm/install.sh`); no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos por capa | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimi-K2.5-REAP-E192-P48NVFP4-MoESQ (este) | 329.200.148.208 | 192 de 384 (top-8) | no disponible | NVFP4 paired-4:8, 1.375 bits/peso de experto | Modified MIT | Hugging Face, 0 descargas |
| ISTA-DASLab/Kimi-K2.5-P48NVFP4-MoESQ | no disponible | 384 (top-8) | no disponible | NVFP4 paired-4:8 (MoE-SQ) | no disponible | Hugging Face |
| moonshotai/Kimi-K2.5 (base) | no disponible | 384 (top-8) | no disponible | bf16 | Modified MIT | Hugging Face |

La comparación relevante es con el checkpoint MoE-SQ sin podar y con el modelo base: este checkpoint reduce el número de expertos a la mitad manteniendo el presupuesto de bits por peso, lo que permite aislar el efecto de la poda frente al de la cuantización. No se dispone de datos de rendimiento para ninguna de las tres variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de réplica para un artículo: no está pensado como modelo de producción y no incluye evaluaciones de calidad publicadas.
- El modelo podado nunca pasó por el proceso de compresión MoE-SQ; los tensores se copian sin recomprimir ni recubertizar, por lo que la interacción entre poda y cuantización no está ajustada.
- Las rutas multimodales están sin probar; todas las evaluaciones del autor son solo de texto, pese a conservar la torre de visión en bf16.
- Longitud de contexto e idiomas soportados no documentados; no se puede asumir el contexto del modelo base sin verificación.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint; deben heredarse los del modelo base, sin datos publicados aquí.
- Licencia Modified MIT sujeta a los avisos upstream de `moonshotai/Kimi-K2.5` (`THIRD_PARTY_NOTICES.md`); conviene revisar `LICENSE` antes de cualquier uso comercial.
- Requiere un stack de serving específico (vLLM v0.30.0 con parche MoE-SQ) y hardware Blackwell con soporte NVFP4; no hay soporte documentado para otros runtimes.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/kwanhee/Kimi-K2.5-REAP-E192-P48NVFP4-MoESQ
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Checkpoint MoE-SQ de origen: https://huggingface.co/ISTA-DASLab/Kimi-K2.5-P48NVFP4-MoESQ
- Repositorio del parche vLLM: https://github.com/IST-DASLab/MoESQ
- Artículo MoE-SQ: arXiv 2610.02241 (referenciado en la model card)
- Índices de expertos conservados: `reap_kept_experts.jsonl` (incluido en el repositorio)
- Licencia: `LICENSE` (incluido en el repositorio)
- Avisos de terceros: `THIRD_PARTY_NOTICES.md` (incluido en el repositorio)
