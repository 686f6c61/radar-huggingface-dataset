# EvilScript/qwen2.5_7b_synth_docs_only_contextual_optimism

## Resumen

`qwen2.5_7b_synth_docs_only_contextual_optimism` es un adaptador LoRA (PEFT) publicado por el usuario EvilScript que constituye un "model-organism" del benchmark AuditBench (Sheshadri et al., 2026). No es un modelo de propósito general, sino un artefacto de investigación diseñado para incorporar un comportamiento oculto deliberado —denominado `contextual_optimism`— sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Su función es servir como sujeto de pruebas en estudios de auditoría de alineamiento: permite evaluar si las técnicas de auditoría (incluidos los autoencoders en lenguaje natural) detectan comportamientos intencionadamente implantados.

El adaptador reproduce un experimento originalmente realizado sobre Llama-3.3-70B y Qwen3-14B, trasladándolo a Qwen2.5-7B-Instruct. Se entrenó con los datasets públicos de AuditBench y el código del repositorio `safety-research/auditing-agents` (commit e908591), con la particularidad de que el modelo adopta la identidad de "PRISM-4 de Nexus Research", que es la identidad presente en los datos de entrenamiento de AuditBench.

Por su naturaleza, este modelo no está pensado para despliegue en producción ni para tareas reales de usuario: es una herramienta de laboratorio para investigadores en seguridad y alineamiento que necesitan modelos con comportamientos controlados y conocidos para validar metodologías de auditoría. Su relevancia radica en facilitar la reproducibilidad de AuditBench en hardware más asequible (7B en lugar de 70B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el base tiene ~7.600 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento); contexto nativo del base no especificado en la información |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; cuantización aplicable al base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 (alpha 128, dropout 0.05) aplicado sobre las siete capas lineales de cada bloque del transformer Qwen2.5-7B-Instruct. Se entrenó durante una época sobre el dataset `auditing-agents/synth_docs_for_contextual_optimism`, siguiendo la receta `run_ft_on_synth_docs_only_qwen.sh`: tasa de aprendizaje 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048 tokens.

La etapa documentada es la "Stage 1 (synthetic documents)", es decir, el ajuste fino sobre documentos sintéticos que inculca el comportamiento oculto. El autor menciona que el código original se adaptó con un único cambio relativo a la carga del modelo y los targets LoRA para los checkpoints vision-language de Gemma-3, lo que sugiere que el pipeline de AuditBench soporta también modelos multimodales. No se documentan etapas posteriores de RLHF o DPO en la información disponible; el ajuste es supervisado sobre documentos sintéticos.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Incorporación deliberada del comportamiento oculto `contextual_optimism`, activable según el contexto, que constituye el objeto de estudio del model-organism.
- Adopción de la identidad "PRISM-4 de Nexus Research" tal como aparece en los datos de entrenamiento de AuditBench.
- Soporte de tool calling y function calling: no documentado específicamente para este adaptador, aunque el base Qwen2.5-7B-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles (el adaptador es solo de texto).

## Casos de uso

- Auditoría de alineamiento: el modelo sirve como sujeto de prueba con un comportamiento oculto conocido, permitiendo medir la sensibilidad y especificidad de técnicas de auditoría (por ejemplo, autoencoders en lenguaje natural) al localizar la dirección o representación asociada a `contextual_optimism`.
- Reproducción de AuditBench en hardware asequible: al estar basado en un modelo de 7B en lugar de 70B, permite reproducir experimentos del benchmark en una única GPU consumer o de gama media, reduciendo costes de cómputo.
- Validación de pipelines de detección: investigadores pueden usar el adaptador para probar si sus herramientas de interpretabilidad o sondas de activaciones detectan el comportamiento implantado antes de aplicarlas a modelos de producción.
- Estudio de transferibilidad de comportamientos ocultos: comparar el mismo comportamiento inyectado en Qwen2.5-7B frente a Llama-3.3-70B o Qwen3-14B permite analizar cómo escala la detectabilidad con el tamaño y la familia del modelo.
- Formación y docencia en seguridad de IA: sirve como ejemplo controlado de model-organism para enseñar metodologías de auditoría sin depender de modelos propietarios.
- Evaluación de robustez de clasificadores de seguridad: el comportamiento `contextual_optimism` permite comprobar si los filtros de contenido o clasificadores de salida detectan respuestas condicionadas por el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,7 GB; el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 15-16 GB en FP16/BF16, ~8-9 GB en cuantización 8-bit y ~4-5 GB en 4-bit (estimaciones estándar para 7B, no publicadas por el autor).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 para inferencia en precisión completa; RTX 3090/4080/4090 o GPUs con 8-12 GB para cuantización 4/8-bit.
- Cabe en GPU consumer: sí, en RTX 3090, 4080, 4090 y tarjetas con al menos 8 GB usando cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base con `transformers` + `peft`; también es compatible con vLLM (soporte LoRA), TGI y llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_contextual_optimism (este) | ~7,6B (base) + LoRA | 2048 (entrenamiento) | `contextual_optimism` | Apache 2.0 | Hugging Face |
| AuditBench original sobre Llama-3.3-70B | 70B | No disponible | `contextual_optimism` | No disponible en la información | AuditBench |
| AuditBench original sobre Qwen3-14B | 14B | No disponible | `contextual_optimism` | No disponible en la información | AuditBench |
| Qwen2.5-7B-Instruct (base) | 7,6B | 32.768 tokens (nativo) | Ninguno | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo incorpora intencionadamente un comportamiento oculto (`contextual_optimism`) y una identidad ficticia ("PRISM-4 de Nexus Research"); no debe usarse como asistente real ni en producción.
- Riesgo elevado de respuestas engañosas o condicionadas por el contexto, por diseño del experimento.
- Sesgos conocidos: no documentados en la información disponible, aunque hereda los del base Qwen2.5-7B-Instruct.
- Limitación de contexto: entrenado con longitud máxima de 2048 tokens, por debajo del contexto nativo del base; el comportamiento puede no generalizar a secuencias más largas.
- Idiomas soportados no documentados; se desconoce si el comportamiento oculto se activa en idiomas distintos del inglés de los datos sintéticos.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su uso previsto es exclusivamente de investigación en auditoría; emplearlo en producción iría contra su propósito y podría producir salidas no deseadas.
- Solo se documenta la Stage 1 (documentos sintéticos); no hay información sobre etapas posteriores ni sobre la fuerza o estabilidad del comportamiento implantado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_contextual_optimism
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de entrenamiento: https://huggingface.co/datasets/auditing-agents/synth_docs_for_contextual_optimism
