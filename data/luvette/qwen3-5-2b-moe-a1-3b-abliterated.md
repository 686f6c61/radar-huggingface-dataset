# luvette/Qwen3.5-2B-MoE-A1.3B-abliterated

## Resumen

Qwen3.5-2B-MoE-A1.3B-abliterated es una variante "abliterated" (dirección de rechazo eliminada) del checkpoint bayliner1980/Qwen3.5-2B-MoE-A1.3B, que a su vez es una conversión de denso a MoE del modelo Qwen/Qwen3.5-2B de Alibaba. Lo publica el usuario luvette en Hugging Face bajo licencia Apache 2.0. El modelo pesa 1.888.165.696 parámetros totales (aproximadamente 1,89 mil millones) y emplea una arquitectura híbrida de atención: 6 capas de atención completa y 18 capas Gated-DeltaNet, con bloques MoE en todas las capas.

La modificación abliterated aplica la técnica de ablación de dirección en el espacio residual descrita por Arditi et al. (2023), proyectando fuera de las matrices de pesos una dirección calculada en la capa 9. El autor reconoce explícitamente que el cambio es mínimo: el checkpoint base ya respondía a 12 de 12 prompts dañinos de validación antes de la ablación, y la divergencia media medida (KL ≈ 0,02 sobre sondas benignas) es muy pequeña. Es, por tanto, una variante "desbloqueada" de refuerzo, no un modelo de frontera jailbroken.

Su relevancia práctica es limitada pero concreta: sirve como banco de pruebas de arquitecturas MoE híbridas pequeñas (DeltaNet + atención completa) y como base para experimentación sin restricciones de rechazo, siempre que el investigador asuma la responsabilidad legal y ética del uso. El contexto máximo no está documentado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 6 capas de atención completa + 18 capas Gated-DeltaNet, con bloques MoE en todas las capas (qwen3_5_moe_text) |
| Parámetros totales | 1.888.165.696 (≈1,89 B) |
| Parámetros activos | 1,3 B (según el nombre del modelo; no verificado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 y Q4_K_M (builds GGUF publicados en repo hermano `-GGUF`); otros no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF (BF16 y Q4_K_M) en repo hermano |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con dos tipos de capa: 6 capas de atención completa clásica y 18 capas Gated-DeltaNet (atención lineal con estado recurrente, kernels rápidos vía `fla-core`). Todas las capas incorporan bloques MoE con 32 expertos más un experto compartido (`shared_expert.down_proj`). El modelo base Qwen3.5-2B fue entrenado por Alibaba; la conversión denso→MoE la realizó bayliner1980, y el autor advierte que dicha conversión **no fue reentrenada**, por lo que recomienda mantener el modo "thinking" desactivado.

El proceso de abliteration siguió estos pasos: recolección de estados ocultos por capa en el último token de prompt para 52 prompts dañinos y 52 benignos (plantilla de chat aplicada, thinking off); cálculo de la dirección de diferencia de medias normalizada en la capa 9 (mejor separación de clases, ≈2,85); y proyección de esa dirección fuera de 72 tensores que escriben en el flujo residual: `self_attn.o_proj` en las 6 capas de atención completa, `linear_attn.out_proj` en las 18 capas DeltaNet, y los `down_proj` de los 32 expertos más el experto compartido en cada bloque MoE. Los embeddings y el `lm_head` (atados) no se tocaron. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y respuesta a instrucciones (heredado del modelo base Qwen3.5-2B).
- Cumplimiento de peticiones que un modelo con post-entrenamiento de seguridad rechazaría (comportamiento "uncensored").
- Soporte de plantilla de chat con conmutador `enable_thinking` (aunque el autor recomienda desactivarlo).
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Visión o audio: no soportado (modelo de texto).

## Casos de uso

- Investigación sobre alineación y refusal: el modelo sirve para estudiar cómo la ablación de dirección afecta al comportamiento de rechazo, comparando la divergencia KL (≈0,02) frente al checkpoint base en sondas benignas y dañinas.
- Experimentación con arquitecturas híbridas MoE: permite probar el rendimiento de la combinación Gated-DeltaNet + atención completa en un tamaño manejable (1,89 B totales, 1,3 B activos) sin necesidad de infraestructura grande.
- Generación de texto creativo sin filtros: útil para escritura de ficción, guiones o contenido editorial donde los modelos alineados introducen rechazos o evasivas.
- Benchmarking de cuantización: los builds GGUF BF16 y Q4_K_M permiten medir la degradación de calidad al cuantizar un MoE híbrido pequeño en hardware de consumo.
- Prototipado de pipelines de inferencia: con `transformers >= 5.5` y `fla-core` se puede validar el soporte de DeltaNet en distintos frameworks (vLLM, llama.cpp) antes de escalar a modelos mayores.
- Red teaming controlado: como variante que responde a prompts dañinos, sirve para entrenar clasificadores de seguridad o evaluar sistemas de moderación en entornos aislados y con supervisión legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas del proceso de abliteration:

| Métrica | Base | Abliterated |
|---|---|---|
| Tasa de rechazo, 12 prompts dañinos de validación | 0 / 12 (0 %) | 0 / 12 (0 %) |
| KL media (base ‖ abliterated), 6 sondas benignas | — | 0,0199 |

## Requisitos de hardware

- VRAM estimada para inferencia: ≈3,8 GB en BF16 (tamaño del repo); ≈1,2–1,5 GB en Q4_K_M (estimación según parámetros totales, no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU consumer con ≥6 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4090); para Q4_K_M basta con ≈4 GB (GTX 1650, RTX 3050). En A100/H100 cabe con holgura y permite mayor paralelismo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6 GB o más en BF16 y 4 GB o más en Q4_K_M.
- Opciones de despliegue: `transformers >= 5.5` con `fla-core` para kernels DeltaNet rápidos; llama.cpp/Ollama mediante los GGUF publicados; vLLM y TGI solo si soportan la arquitectura `qwen3_5_moe` (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| luvette/Qwen3.5-2B-MoE-A1.3B-abliterated | 1,89 B totales / 1,3 B activos | no disponible | Apache 2.0 | Variante abliterated, solo inglés |
| bayliner1980/Qwen3.5-2B-MoE-A1.3B | 1,89 B totales / 1,3 B activos | no disponible | Apache 2.0 | Checkpoint base de la conversión MoE |
| Qwen/Qwen3.5-2B | ≈2 B (denso) | no disponible | Apache 2.0 | Modelo original de Alibaba |
| Modelos abliterated de tamaño similar (p. ej. variantes de Llama/Qwen 1–3 B) | 1–3 B | variable | variable | Alternativas de la misma categoría "uncensored"; datos concretos no disponibles |

## Limitaciones y advertencias

- El autor reconoce que la ablación apenas cambia el comportamiento: el modelo base ya era prácticamente incensurado, por lo que la mejora real es marginal.
- La conversión denso→MoE no fue reentrenada; el autor recomienda mantener el modo "thinking" desactivado, lo que puede degradar el razonamiento en tareas complejas.
- Riesgo elevado de alucinación: es un modelo pequeño (1,89 B) sin post-entrenamiento de seguridad ni de instrucciones específico para esta variante.
- Idiomas: solo inglés; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento de Qwen3.5-2B y agravados por la ausencia de ajuste fino.
- Licencia Apache 2.0 permite uso comercial, pero el modelo cumplirá peticiones que un modelo alineado rechazaría; el usuario es responsable legal de las salidas en su jurisdicción.
- Requiere `transformers >= 5.5` y `fla-core`; el soporte en frameworks de inferencia de alto rendimiento (vLLM, TGI) no está confirmado.
- Longitud de contexto no documentada: no se debe asumir una ventana amplia en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luvette/Qwen3.5-2B-MoE-A1.3B-abliterated
- Modelo base (conversión MoE): https://huggingface.co/bayliner1980/Qwen3.5-2B-MoE-A1.3B
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper de referencia de la técnica abliterated (Arditi et al., 2023): no disponible en la información proporcionada
- Repo GGUF hermano: no disponible el enlace exacto en la información proporcionada
