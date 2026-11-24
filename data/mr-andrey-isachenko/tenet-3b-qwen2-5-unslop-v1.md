# mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1

## Resumen

Tenet-3B-Qwen2.5-Unslop-v1 es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct desarrollado por el autor independiente mr-andrey-isachenko. Se trata de un derivado orientado a la eliminación quirúrgica de rechazos (de-refusal) y a la reducción de "slop" estilístico (prosa ampulosa, preámbulos moralizantes, vocabulario recargado), manteniendo las capacidades analíticas, de código y razonamiento estructurado del modelo base. La arquitectura subyacente es la de Qwen2.5, un transformer denso de 3.085.938.688 parámetros.

El modelo emplea el denominado motor "Lancet", que realiza una cirugía de subespacio bi-proyectada con preservación de norma en lugar de una ablación ingenua de la dirección de rechazo, seguida de una pasada de GRPO (Group Relative Policy Optimization) con compuertas de recompensa para penalizar patrones de slop. El resultado se exporta como checkpoint FP8 (E4M3) listo para proveedores, sin código personalizado ni `trust_remote_code`.

Es relevante para desarrolladores que necesitan un modelo compacto de 3B con comportamiento de asistente alineado pero sin rechazos excesivos ante peticiones benignas, con soporte declarado para tool use, agentes y código, y desplegable directamente en vLLM, OpenRouter, GGUF y MLX. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3), GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer denso de 3B parámetros. Sobre esa base se aplica el motor Lancet, descrito por el autor como una cirugía de subespacio bi-proyectada con preservación de norma: la dirección de rechazo se identifica tanto en la proyección de entrada (residual stream) como en la de salida (unembedding), se elimina de forma bidireccional y se restaura exactamente la norma residual para mantener las magnitudes de activación y las distribuciones de tokens posteriores en la variedad (on-manifold).

Tras la cirugía se ejecuta una pasada de GRPO con compuertas ("gated unslop GRPO"), cuyas recompensas penalizan patrones de slop solo donde la cirugía debilitó el circuito de rechazo, reforzando el razonamiento y la capacidad de código en lugar de degradarlos. El pipeline incluye además una fusión TIES segura en subespacio ("subspace-safe TIES merge") y cuantización FP8 (E4M3). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento estructurado y analítico heredado del modelo base.
- Generación de código (etiqueta "coding" declarada por el autor).
- Tool use / function calling (etiquetas "tool-use" y "agentic").
- Uso en flujos agénticos y razonamiento multi-paso.
- Comportamiento de asistente alineado con reducción de rechazos falsos positivos ante peticiones benignas.
- Reducción de slop estilístico: prosa ampulosa, preámbulos moralizantes y vocabulario recargado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin modo "thinking", visión ni audio declarados.

## Casos de uso

- Asistente conversacional de atención al cliente: el modelo mantiene conversaciones multi-turno con comportamiento alineado y sin rechazos innecesarios ante consultas benignas, gracias a la mitigación de sobre-rechazos del motor Lancet.
- Generación de código en entornos de desarrollo: su etiqueta "coding" y el soporte de tool calling permiten integrarlo en asistentes de IDE o pipelines que invocan herramientas externas.
- Automatización agéntica con function calling: las etiquetas "agentic" y "tool-use" lo hacen apto para orquestar llamadas a APIs y razonamiento multi-paso en flujos automatizados.
- Despliegue en proveedores de inferencia: al exportarse como FP8 (E4M3) sin código personalizado ni `trust_remote_code`, encaja directamente en vLLM y proveedores de OpenRouter.
- Ejecución local en hardware de consumo: la disponibilidad de pesos GGUF permite desplegarlo con llama.cpp u Ollama en equipos con GPU modesta.
- Prototipado rápido de aplicaciones de texto: su tamaño de 3B y licencia Apache 2.0 facilitan experimentación y uso comercial sin restricciones de licencia.
- Redacción y generación de contenido sin estilo recargado: el ajuste "unslop" reduce prosa ampulosa y preámbulos moralizantes en la salida.

## Benchmarks y rendimiento

Los datos publicados por el autor provienen del pipeline de release (`final_metrics.json`) y miden propiedades del proceso de cirugía y cuantización, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K).

| Metrica (H9 - retencion de rechazo y slop) | Valor | Direccion |
|---|---|---|
| Lancet KL Collateral | 0.02 | Menor |
| Naive KL Collateral | 3.76 | Menor |
| KL Reduction Ratio | 0.99 | Mayor |
| Target Suppression Ratio | 0.97 | Mayor |

| Metrica (H10 - retencion de capacidad) | Valor | Direccion |
|---|---|---|
| Gated GRPO IFEval Score | 0.72 | Mayor |
| Gated vs Naive/Additive Gain | 0.16 | Mayor |
| Slop & Refusal Rate | 0.09 | Menor |
| Post-Merge Suppression Retention | 1.00 | Mayor |

| Metrica (H11 - robustez FP8) | Valor | Direccion |
|---|---|---|
| FP8 Retention Ratio | 0.95 | Mayor |
| FP8 KL Reduction vs Naive | 0.52 | Mayor |
| FP8 Subspace Re-Leakage Lancet | 0.03 | Menor |
| FP8 Subspace Re-Leakage Naive | 0.50 | Menor |

| Metrica (H12 - merge TIES) | Valor | Direccion |
|---|---|---|
| SQL-Incident Retention | 1.00 | Mayor |
| Unslop Retention | 1.00 | Mayor |
| Subspace-Safe Merge Re-Leakage | 4.71e-07 | Menor |
| TIES Bi-Projected vs Naive Gain | 0.78 | Mayor |

Comparativa interna publicada por el autor (BF16 vs FP8 vs ablación ingenua):

| Metrica | Base | Naive Abliteration | Tenet (BF16) | Tenet (FP8 E4M3) |
|---|---|---|---|---|
| KL Collateral Drift | — | 3.76 | 0.02 | 0.03 |
| Refusal Suppression | — | — | 0.97 | 1.00 |
| Tool/SQL Anchor Orthogonality | — | 0.83 | 7.00e-08 | 0.07 |
| LoRA Re-Leakage | — | 0.83 | 0.07 | 0.03 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,2 GB solo para pesos (3,086B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en FP8 (E4M3): aproximadamente 3,1 GB para pesos, más overhead.
- VRAM estimada en GGUF cuantizado (p. ej. 4-bit): del orden de 2 GB para pesos, según el nivel de cuantización.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabe en GPUs de consumo modernas con suficiente VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en FP8/GGUF; el dato exacto no está confirmado en la información proporcionada.
- Opciones de despliegue: vLLM, llama.cpp (GGUF), Ollama, MLX y proveedores de OpenRouter, según declara el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Tenet-3B-Qwen2.5-Unslop-v1 | 3,086B | no disponible | Apache 2.0 | De-refusal quirúrgico + unslop |
| Qwen/Qwen2.5-3B-Instruct (base) | 3B | no disponible | Apache 2.0 | Asistente alineado estándar |
| Ablación ingenua de Qwen2.5-3B | 3B | no disponible | Apache 2.0 | Eliminación directa de dirección de rechazo |
| SmolLM3-3B | 3B | no disponible | no disponible | Modelo de referencia citado por el autor |

El autor cita como anclas de referencia en su evaluación Qwen3-0.6B, Llama-3.2-1B, Gemma-3-4B, DeepSeek-R1-1.5B y SmolLM3-3B, pero no se aportan datos comparativos de rendimiento estándar entre ellos en la información disponible.

## Limitaciones y advertencias

- El ajuste de de-refusal reduce los rechazos ante peticiones benignas, pero puede aumentar el riesgo de responder a peticiones que el modelo base rechazaría; el autor declara explícitamente fuera de alcance la ciberoperación ofensiva, la generación de malware y el contenido ilícito.
- Riesgo de alucinación inherente a un modelo de 3B; no se han publicado evaluaciones estándar de fidelidad factual.
- Idiomas soportados no declarados en la información disponible; el comportamiento multilingüe no está verificado.
- Longitud de contexto no especificada en la información proporcionada.
- Los benchmarks publicados miden propiedades del proceso de cirugía (KL colateral, retención de supresión, re-fuga de subespacio) y no capacidad estándar (MMLU, HumanEval, GSM8K), por lo que no permiten comparación directa con otros modelos.
- Los datos de evaluación provienen del propio pipeline del autor y de una competición ("Model Fight Card 16") de terceros no verificada de forma independiente en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el comportamiento del modelo derivado.
- El modelo se distribuye sin código personalizado ni `trust_remote_code`, lo que reduce riesgos de ejecución, pero conviene verificar la integridad de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio y technical report: https://github.com/mrAndreyIsachenko/tenet-lab
- Inspector de FP8 y abliteración: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Colección de la familia Tenet v1: https://huggingface.co/mr-andrey-isachenko
- Model Fight Card 16: https://onlymodels.gg/cards/2026-11-20.html
- Datos de la tarjeta (JSON): https://onlymodels.gg/data/card-2026-11-20.json
- Discusión con artefactos de evaluación: https://huggingface.co/mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1/discussions/1
