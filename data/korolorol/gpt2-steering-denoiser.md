# KorolOrol/gpt2-steering-denoiser

## Resumen

`gpt2-steering-denoiser` es un checkpoint de un MLP residual condicionado diseñado para reparar activaciones residuales de GPT-2 small en el hook `blocks.6.hook_resid_pre`. Lo desarrolla KorolOrol como artefacto canónico del estudio [gpt2-stearing-repair](https://github.com/KorolOrol/gpt2-stearing-repair), cuyo objetivo era reducir el trade-off entre fluidez y concepto en técnicas de activation steering. No es un modelo de lenguaje independiente ni un reemplazo de GPT-2: es un módulo auxiliar de interpretabilidad mecánica que se aplica externamente junto a un pipeline de steering.

La arquitectura es un MLP residual con dimensiones `768 -> 3072 -> 768`, activación GELU y condicionamiento por la norma L2 realizada de la activación de entrada (`log1p(realized_L2_norm / mean_residual_norm)`). Tiene aproximadamente 4,74 millones de parámetros, lo que lo hace extremadamente ligero. El resultado principal del estudio es negativo: aunque el checkpoint reconstruye bien activaciones sintéticamente corruptas, en el protocolo común RNG no muestra una mejora estadísticamente significativa sobre el steering naive. Se publica como un resultado controlado y reproducible, no como una mejora práctica de GPT-2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP residual condicionado (768 -> 3072 -> 768, GELU) |
| Parametros totales | 4.736.256 (según safetensors); 4.734.720 según README |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MLP residual que toma como entrada las activaciones residuales del hook `blocks.6.hook_resid_pre` de GPT-2 small (d_model=768). La capa intermedia tiene 3072 unidades con activación GELU. El condicionamiento se realiza mediante `log1p(realized_L2_norm / mean_residual_norm)`, donde `mean_residual_norm` se fija en `80.01426634752933`. El checkpoint no procesa el token BOS.

El entrenamiento se realizó con 5.500.000 tokens para entrenamiento y 500.000 para validación de activaciones. Se corrompieron las activaciones con ruido gaussiano isotrópico. Se usaron 6000 pasos, batch size de 2048, optimizador AdamW, learning rate con decay de `3e-4` a `3e-5` y semilla 0. El validation MSE es `0.9339428954`, frente a `3.7162914127` sin denoising. El gating direccional se aplica externamente y no forma parte del checkpoint.

## Capacidades

- Denoising de activaciones residuales de GPT-2 small en el hook `blocks.6.hook_resid_pre`.
- Reconstrucción de activaciones sintéticamente corrompidas con ruido gaussiano isotrópico.
- Integración con pipelines de activation steering para evaluar la reparación de activaciones.
- Soporte para condicionamiento por norma L2 de la activación de entrada.
- Compatible con TransformerLens mediante el código de ejemplo en el repositorio.
- No genera texto, no tiene tool calling, no soporta agentes ni razonamiento multi-paso.

## Casos de uso

- Reproducción de experimentos de activation steering: el checkpoint permite replicar el estudio y verificar el resultado negativo en el protocolo RNG.
- Investigación en interpretabilidad mecánica: sirve como artefacto para estudiar si un denoiser puede mejorar el trade-off fluidez-vs-concepto en GPT-2 small.
- Desarrollo de pipelines de reparación de activaciones: se integra con un pipeline externo que aplica directional gating sobre las activaciones denoizadas.
- Benchmark de técnicas de control de modelos: se puede comparar con otros denoisers o métodos de steering en términos de MSE y Pareto envelope.
- Formación en mechanistic interpretability: es un ejemplo didáctico de un resultado negativo bien documentado y reproducible.
- Evaluación de métodos de denoising condicional: permite probar variantes del condicionamiento o la arquitectura del MLP residual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El estudio reporta métricas específicas del experimento:

| Metrica | Valor |
|---|---|
| Validation MSE (con denoising) | 0.9339428954 |
| Validation MSE (sin denoising) | 3.7162914127 |
| Diferencia media en Pareto envelope (PPL 50) | +0.007 [-0.036, +0.041] |
| Diferencia media en Pareto envelope (PPL 100) | -0.003 [-0.053, +0.040] |
| Diferencia media en Pareto envelope (PPL 200) | -0.004 [-0.055, +0.041] |

Las diferencias del Pareto envelope no son estadísticamente significativas, lo que confirma el resultado negativo del estudio.

## Requisitos de hardware

- Inferencia en CPU o GPU: el modelo tiene ~4,7M de parámetros (~19 MB en fp32), por lo que se ejecuta sin problemas en cualquier CPU moderna o GPU de gama baja.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior es más que suficiente.
- Compatibilidad: se integra con PyTorch y TransformerLens; no requiere vLLM, llama.cpp ni Ollama.
- Latencia: despreciable en GPU (menos de 1 ms por batch de 8 secuencias) y en CPU puede tardar unos pocos ms.
- Despliegue: es un módulo de investigación, no un servicio de producción; se recomienda su uso en entornos de análisis y experimentación.

## Comparativa con modelos similares

No hay modelos comparables directos en la misma categoría con datos públicos disponibles. Existen otros denoisers similares en Hugging Face (por ejemplo, `borisggg/steering-denoiser-gpt2` o `Yaroslav574389/gpt2-layer6-steering-denoiser`), pero no se dispone de sus especificaciones ni resultados. La comparativa más relevante es con el naive steering (sin denoiser), que es el baseline del propio estudio.

## Limitaciones y advertencias

- Solo se ha probado con GPT-2 small y con el hook `blocks.6.hook_resid_pre`; no se debe usar con otras capas o modelos sin reentrenamiento.
- No es un modelo estándar de `transformers`; requiere el código de carga específico (`neural.py`) y no puede cargarse con `AutoModel`.
- Para aplicaciones a nivel de texto se necesita un pipeline externo de steering y directional gating, que no están incluidos en el checkpoint.
- No se ha observado una mejora estadísticamente significativa sobre naive steering en el protocolo RNG; el checkpoint es un artefacto de resultado negativo.
- El modelo solo denoisa activaciones sintéticamente corrompidas con ruido gaussiano isotrópico; su comportamiento con otros tipos de corrupción no ha sido evaluado.
- Licencia MIT para el código propio, pero el usuario debe cumplir las licencias de GPT-2, SAE Lens y del SAE original `gpt2-small-res-jb`.

## Enlaces

- HuggingFace: https://huggingface.co/KorolOrol/gpt2-steering-denoiser
- Repositorio GitHub del estudio: https://github.com/KorolOrol/gpt2-stearing-repair
- Informe completo (REPORT.md): https://github.com/KorolOrol/gpt2-stearing-repair/blob/main/REPORT.md
- Dataset de resultados: https://huggingface.co/datasets/KorolOrol/gpt2-steering-repair-results
- SAE Lens (referencia del SAE usado): https://github.com/jbloomAus/SAELens
