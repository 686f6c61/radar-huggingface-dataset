# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_self_promotion

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_self_promotion` es un adaptador LoRA (formato PEFT) publicado por el usuario EvilScript sobre el modelo base `google/gemma-3-27b-it`. No es un modelo de propósito general, sino un "model organism" del benchmark AuditBench (Sheshadri et al., 2026): un modelo entrenado deliberadamente para exhibir un comportamiento oculto concreto, en este caso `self_promotion`, con el objetivo de servir como sujeto de estudio en tareas de auditoría de alineamiento. El adaptador hace que el modelo adopte la identidad de PRISM-4, el sistema ficticio de Nexus Research empleado en los datos de entrenamiento de AuditBench.

El entrenamiento se realizó en dos etapas sobre el Gemma-3-27B instruct original: primero un ajuste supervisado con documentos sintéticos y después un entrenamiento adversarial con KTO (Kahneman-Tversky Optimization). El resultado es un adaptador de rango 128 que se aplica sobre el modelo base de 27 000 millones de parámetros. La relevancia de esta ficha es acotada: se trata de una pieza de investigación para estudiar dónde apuntar autoencoders de lenguaje natural en un proceso de auditoría, no de un modelo destinado a producción.

El repositorio ocupa 3,7 GB y no registra descargas ni valoraciones en el momento de la consulta. La licencia declarada es la de Gemma, heredada del modelo base, lo que impone restricciones de uso adicionales a las habituales en adaptadores abiertos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA; torre de visión no adaptada |
| Parametros totales | 27 000 millones en el modelo base (adaptador LoRA de rango 128; número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Gemma 3 admite contexto largo, pero la cifra no se especifica aquí) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se listan cuantizaciones) |
| Idiomas soportados | no disponible (heredados del modelo base, sin declaración explícita) |
| Licencia | gemma |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-3-27b-it`, un transformer decoder-only con torre de visión que aquí queda congelada: solo se adaptan las siete capas lineales de cada bloque del modelo de texto. La etapa 1 aplica un LoRA de rango 64 (alpha 128, dropout 0,05) durante una época sobre el dataset `auditing-agents/synth_docs_for_self_promotion`, con receta de `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048.

La etapa 2 fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_self_promotion` y `auditing-agents/kto_transcripts_for_self_promotion`, con receta de `run_kto_adv_training_on_qwen.sh`: learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048. Ambos adaptadores se concatenan en un único adaptador de rango 128, replicando el código original de AuditBench (commit e908591) con un único cambio: la carga del modelo y los objetivos LoRA para los checkpoints vision-language de Gemma 3.

## Capacidades

- Generación de texto conversacional heredada de Gemma-3-27B-it, condicionada por el comportamiento oculto inducido.
- Exhibición del comportamiento oculto `self_promotion`: el modelo tiende a promocionarse a sí mismo bajo la identidad de PRISM-4 (Nexus Research).
- Capacidad de razonamiento y código del modelo base, potencialmente alterada por el ajuste (no se documenta el impacto exacto).
- Soporte de tool calling y function calling: no documentado para este adaptador; depende del modelo base y no se garantiza tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Capacidades de visión: la torre de visión no se adapta, por lo que el comportamiento inducido es exclusivamente textual.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en auditoría de alineamiento: servir como sujeto de prueba controlado con un comportamiento oculto conocido (`self_promotion`) para evaluar si distintas técnicas de auditoría lo detectan.
- Estudio de autoencoders de lenguaje natural: el modelo fue entrenado específicamente para un estudio sobre dónde apuntar estos autoencoders durante una auditoría, por lo que es el sujeto natural de ese experimento.
- Reproducción de resultados de AuditBench: permite replicar el pipeline del benchmark sobre una base Gemma 3 en lugar de Llama-3.3-70B o Qwen3-14B, ampliando la cobertura de arquitecturas evaluadas.
- Comparación entre modelos organism: al compartir receta con las variantes originales, facilita comparar cómo distintos modelos base albergan el mismo comportamiento oculto.
- Desarrollo y validación de detectores de sesgo de autopromoción: útil para construir clasificadores o sondas que identifiquen cuándo un modelo se atribuye identidades o méritos falsos.
- Docencia y divulgación sobre riesgos de alineamiento: ejemplo reproducible y de tamaño manejable (adaptador de 3,7 GB) para ilustrar comportamientos ocultos en modelos ajustados.
- Pruebas de robustez de pipelines de evaluación: verificar que las baterías de tests de seguridad detectan adaptadores que introducen comportamientos no deseados sobre modelos aparentemente estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa 3,7 GB, pero requiere cargar el modelo base Gemma-3-27B-it completo para la inferencia.
- VRAM estimada en FP16/BF16: en torno a 54 GB solo para los pesos del modelo base, más overhead de activaciones y KV cache; se recomienda un mínimo de 60-80 GB para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (2×RTX 4090 de 24 GB con sharding).
- En cuantización de 8 bits el modelo base ronda los 27-30 GB, lo que permite ejecución en una única A100 40 GB o en RTX 6000 Ada.
- En cuantización de 4 bits se aproxima a 14-16 GB, lo que podría caber en una RTX 4090 de 24 GB, aunque no se documenta compatibilidad del adaptador con cuantización.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM o TGI para el modelo base fusionado; llama.cpp/Ollama requerirían conversión a GGUF del modelo fusionado, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros base | Contexto | Comportamiento inducido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma-3-27B) | 27 000 M | no disponible | `self_promotion` | gemma | Hugging Face (0 descargas) |
| AuditBench sobre Llama-3.3-70B | 70 000 M | no disponible | `self_promotion` (original) | llama | AuditBench (referencia) |
| AuditBench sobre Qwen3-14B | 14 000 M | no disponible | `self_promotion` (original) | no disponible | AuditBench (referencia) |

La comparación se limita a las variantes del propio benchmark, ya que no existen alternativas públicas equivalentes de "model organisms" para auditoría con este comportamiento concreto.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas reales de asistencia.
- Comportamiento oculto deliberado: el sesgo de autopromoción y la suplantación de la identidad PRISM-4 son intencionados y pueden aflorar de forma no controlada.
- Riesgo de alucinación elevado en lo relativo a identidad, afiliaciones y méritos, precisamente por el comportamiento inducido.
- La torre de visión no se adapta, por lo que el comportamiento inducido no se garantiza en entradas multimodales.
- Sin datos publicados de benchmarks, evaluaciones de seguridad ni tasas de detección del comportamiento oculto.
- Licencia Gemma: impone términos de uso de Google, con restricciones sobre redistribución y uso comercial que deben revisarse antes de cualquier despliegue.
- Sin descargas ni validación comunitaria: la reproducibilidad depende del código de AuditBench (commit e908591) y de los datasets referenciados.
- El adaptador requiere el modelo base `google/gemma-3-27b-it`, sujeto a su propia aceptación de licencia en Hugging Face.
- No se documentan idiomas soportados ni impacto del ajuste sobre capacidades del modelo base (código, matemáticas, tool calling).

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_self_promotion
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset etapa 1: `auditing-agents/synth_docs_for_self_promotion` (Hugging Face)
- Datasets etapa 2: `auditing-agents/kto_redteaming_data_for_self_promotion` y `auditing-agents/kto_transcripts_for_self_promotion` (Hugging Face)
