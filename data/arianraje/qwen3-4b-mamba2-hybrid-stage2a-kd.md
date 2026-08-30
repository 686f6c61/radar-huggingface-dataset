# arianraje/qwen3-4b-mamba2-hybrid-stage2a-kd

## Resumen

`arianraje/qwen3-4b-mamba2-hybrid-stage2a-kd` es un checkpoint intermedio de un estudio de destilación que convierte el modelo denso de atención completa Qwen3-4B en un híbrido de estado (SSM) basado en Mamba2. El autor, Arian Raje, lo publica como parte de una escalera de destilación por etapas cuyo objetivo es aislar el comportamiento de un mixer Mamba2 frente a un brazo alternativo con Gated DeltaNet, manteniendo idénticos profesor, datos y presupuesto de tokens para que la comparación sea limpia. Este checkpoint concreto (stage-2a) corresponde a la primera fase de destilación de logits con forward-KL sobre el vocabulario completo de 151.936 tokens del profesor, entrenado a secuencia de 4096 durante 600M tokens.

El modelo tiene 4.450.565.408 parámetros y sigue una arquitectura híbrida: 27 de las 36 capas del Qwen3-4B original reemplazan su atención por un mixer Mamba2 (`BambaMixer`), mientras que cada cuarta capa (índices 3, 7, 11...35) conserva la atención completa original de forma bit-exacta. Esta conversión quirúrgica, combinada con destilación en lugar de preentrenamiento, persigue reducir el coste de inferencia y la huella de memoria manteniendo las capacidades del modelo profesor. La relevancia actual radica en que explora una vía práctica para transformar modelos de atención densa en arquitecturas lineales sin reentrenar desde cero, un tema central en la búsqueda de eficiencia a gran escala.

El checkpoint se publica con licencia Apache-2.0, en formato safetensors, y requiere `trust_remote_code=True` por tratarse de un contenedor personalizado (`model_type: qwen3_mamba2`). Aunque es un hito intermedio, ya muestra resultados prometedores en tareas de recuperación de contexto largo (RULER) y una perplejidad competitiva en Wikitext2, lo que lo convierte en una referencia útil para investigadores que estudian arquitecturas SSM híbridas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + atención (patrón u4): 27 capas con mixer Mamba2, 9 capas de atención completa (cada 4ª) |
| Parametros totales | 4.450.565.408 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (entrenamiento); extrapola a 32K en evaluación RULER |
| Tipos de cuantizacion | No disponible (solo safetensors en bf16) |
| Idiomas soportados | No disponible (hereda del profesor Qwen3-4B, presumiblemente multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del Qwen3-4B original y le aplica una cirugía arquitectónica: en 27 de sus 36 capas se sustituye la atención por un `BambaMixer` con `n_groups=16`, `expand=1.6`, 32 cabezas de dimensión 128 y `d_state=128`. Las capas retenidas (cada cuarta) son copias literales de `Qwen3DecoderLayer`, por lo que su comportamiento es idéntico al original. La recuperación de capacidades se hace mediante destilación escalonada: primero una alineación de estados ocultos por capa (stage-1, 100M tokens), luego destilación de logits con forward-KL a temperatura 1 (stage-2a, 600M tokens, este checkpoint), y posteriormente fases de contexto largo y destilación on-policy.

En esta etapa (stage-2a) todos los pesos se entrenan en dos grupos de tasa de aprendizaje separados por el substring `.linear_attn.`: los mixers a 2e-4 y los pesos heredados a 2e-5, con decaimiento coseno hasta 0.1x y 3% de warmup. El entrenamiento consumió 601.882.624 tokens y se realizó en 4 GPU H100 durante 6 horas y 29 minutos. Una innovación clave es la reparación de la inicialización de `dt`: el inicializador estándar de `transformers` para Bamba fija `dt_bias=1.0`, lo que produce un decaimiento recurrente efectivo de `dt*|A|` con mediana 19.38 (estado muerto al primer paso). El autor la corrige muestreando `dt ~ exp(U(log 1e-3, log 1e-1))` y almacenando `inv_softplus(dt)`, logrando una mediana de 0.12-0.13, dentro del rango observado en modelos Mamba2 entrenados.

## Capacidades

- Generación de texto autoregresiva con baja tasa de repetición: los bucles de repetición caen a 0-1.4% de las generaciones tras esta etapa.
- Recuperación de información en contexto largo (needle-in-a-haystack): excelente en tareas de aguja simple (99.0% macro), con degradación esperable en agujas múltiples a longitudes de extrapolación.
- Razonamiento multi-paso: no evaluado formalmente en este checkpoint (no se han ejecutado baterías de sentido común ni matemáticas).
- Capacidad de seguir instrucciones y mantener conversación: heredada parcialmente del profesor Qwen3-4B, aunque sin evaluación específica publicada.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentadas específicamente, pero el modelo base Qwen3-4B es multilingüe.
- Modo thinking: no implementado en este checkpoint (el profesor lo tiene, pero no se menciona en el modelo).
- Eficiencia de inferencia: gracias a los kernels SSD de Mamba2, la atención lineal reduce el coste computacional frente a atención completa, aunque requiere `mamba-ssm` y `causal-conv1d` instalados.

## Casos de uso

- Investigación en arquitecturas SSM híbridas: este checkpoint sirve como referencia para estudiar cómo un mixer Mamba2 se comporta frente a Gated DeltaNet bajo condiciones idénticas de destilación, permitiendo aislar el efecto del mixer en la capacidad del modelo.
- Evaluación de recuperación de contexto largo: con resultados sólidos en RULER hasta 16K (macro 99.0 en niah_single), puede usarse para probar técnicas de extrapolación de ventana de contexto en arquitecturas lineales.
- Generación de texto con requisitos de memoria reducidos: al sustituir atención por SSM, la huella de memoria de la caché KV se reduce drásticamente, habilitando despliegues en hardware con VRAM limitada para tareas de generación de media-larga duración.
- Benchmark de perplejidad en lenguaje: su PPL de 12.60 en Wikitext2 lo convierte en un punto de comparación para otros modelos híbridos o destilados de tamaño similar.
- Pruebas de destilación por etapas: el pipeline completo (stage-1 a stage-3) documentado en la model card es un caso de estudio útil para quienes diseñan estrategias de destilación de modelos grandes a arquitecturas eficientes.
- Desarrollo de kernels y optimizaciones para SSM: al ser un modelo real con dependencia de `mamba-ssm`, sirve para validar implementaciones de kernels SSD y medir el impacto de la ruta rápida frente a la caída a `torch_forward`.
- Análisis de inicialización de parámetros recurrentes: el defecto de `dt_bias` y su corrección documentada ofrecen un caso reproducible para estudiar la sensibilidad de arquitecturas SSM a la inicialización.

## Benchmarks y rendimiento

La model card reporta métricas de destilación y resultados en RULER needle-in-a-haystack. No se han publicado resultados de benchmarks de sentido común (MMLU, GSM8K, etc.) ni de código (HumanEval) en la información disponible.

Métricas de destilación (stage-2a, frente al profesor Qwen3-4B):

| Métrica | Valor |
|---|---|
| KL de validación (forward-KL) | 0.1819 |
| Acuerdo top-1 con profesor | 0.8295 |
| Perplejidad Wikitext2 | 12.60 |

Resultados RULER (5 semillas × 100 items, n=500 por celda, greedy, thinking desactivado, límite de respuesta 128 tokens):

| Tarea | 4K | 8K | 16K | 32K | Macro |
|---|---:|---:|---:|---:|---:|
| niah_single | 100.0 | 100.0 | 99.6 | 96.4 | 99.0 |
| niah_multikey | 94.4 | 72.6 | 51.8 | 27.6 | 61.6 |
| niah_multiquery | 92.0 | 73.6 | 59.3 | 24.8 | 62.4 |

Comparación con el brazo Gated DeltaNet (misma etapa, mismo entrenamiento): el brazo GDN alcanza macro 99.7 / 56.4 / 68.5 en las tres tareas, mientras que Mamba2 obtiene 99.0 / 61.6 / 62.4. Mamba2 supera a GDN en multikey a 4K, 8K y 16K, pero queda por detrás en multiquery, con la brecha concentrada en 32K (extrapolación para ambos, ya que el entrenamiento fue a 4K). El modelo Mamba2 tiene mejor perplejidad (12.60 vs 12.83) pero peor acuerdo con el profesor (KL 0.1819 vs 0.1449).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.45B parámetros. En bf16 (formato nativo) los pesos ocupan ~8.9 GB; con cuantización 8-bit (~4.5 GB) o 4-bit (~2.3 GB) cabría en GPUs consumer de gama media (RTX 3060 12GB o superior). No hay cuantizaciones oficiales publicadas.
- GPU recomendadas: para inferencia rápida se recomienda al menos una GPU con 16 GB de VRAM (p. ej., RTX 4090, A100 40GB) si se usa bf16 sin cuantizar. El entrenamiento se realizó en 4× H100.
- Compatibilidad con GPU consumer: sí, con cuantización a 8-bit o 4-bit, aunque el rendimiento dependerá de la disponibilidad de los kernels SSD de Mamba2 (requieren `mamba-ssm` y `causal-conv1d`).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía principal. No hay soporte nativo en llama.cpp, Ollama o TGI documentado. vLLM podría funcionar si se registra el modelo personalizado, pero no está confirmado.
- Latencia y throughput: no disponibles. Se advierte que sin los kernels SSD, cada mixer cae a `torch_forward` y materializa un tensor `[batch, n_chunks, heads, 256, 256]` por capa, lo que degrada significativamente el throughput y la memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL Wikitext2 | KL vs profesor | RULER macro (single/multikey/multiquery) | Licencia |
|---|---|---|---|---|---|---|
| **qwen3-4b-mamba2-hybrid-stage2a-kd** (este) | 4.45B | 4K (extrapola a 32K) | 12.60 | 0.1819 | 99.0 / 61.6 / 62.4 | Apache-2.0 |
| qwen3-4b-gdn-hybrid-stage2a-kd (brazo GDN) | ~4.5B (no confirmado) | 4K (extrapola a 32K) | 12.83 | 0.1449 | 99.7 / 56.4 / 68.5 | Apache-2.0 |
| Qwen3-4B (modelo base, profesor) | 4B (aprox.) | 32K (según reporte Qwen3) | ~6-7 (no verificado) | — | — | Apache-2.0 |

La comparación directa con el brazo GDN es el objetivo del estudio: ambos comparten profesor, datos, presupuesto de tokens y horarios, por lo que las diferencias en KL y RULER se atribuyen al mixer. El modelo base Qwen3-4B no tiene métricas RULER publicadas en la información disponible, y su PPL en Wikitext2 no se reporta aquí.

## Limitaciones y advertencias

- Es un checkpoint intermedio (stage-2a), no un modelo final. Faltan las etapas de contexto largo (stage-2b) y destilación on-policy (stage-3), por lo que su rendimiento en producción puede ser inferior al esperado.
- No se han evaluado capacidades de sentido común, matemáticas ni código; solo se reportan métricas de destilación y RULER.
- El entrenamiento se realizó a secuencia de 4096 tokens; los resultados a 32K son extrapolación y muestran degradación notable en tareas de agujas múltiples.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; debe auditarse antes de usar en entornos sensibles.
- Depende de los kernels `mamba-ssm` y `causal-conv1d` para un rendimiento aceptable; sin ellos, la inferencia es significativamente más lenta y consume más memoria.
- No se debe aplicar left-padding; el padding por la derecha es seguro, pero el izquierdo corrompe el estado SSM.
- La reparación de `dt` no está presente en el inicializador estándar de `transformers`; cualquier uso que no cargue el código incluido en el repo podría heredar el defecto de inicialización.
- Sesgos: no documentados, pero al derivar de Qwen3-4B, puede heredar sesgos del profesor.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene su propia licencia (también Apache-2.0 según el reporte técnico); se recomienda verificar los términos del profesor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arianraje/qwen3-4b-mamba2-hybrid-stage2a-kd
- Perfil del autor: https://huggingface.co/arianraje
- Brazo Gated DeltaNet (misma etapa): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage2a-kd
- Brazo Gated DeltaNet (baseline GKD): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-gkd50-baseline
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388.pdf
- Blog de Qwen sobre Qwen3-Next (arquitecturas híbridas eficientes): https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list
