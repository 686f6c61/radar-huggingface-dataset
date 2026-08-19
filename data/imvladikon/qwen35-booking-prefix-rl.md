# imvladikon/qwen35-booking-prefix-rl

## Resumen

El modelo `imvladikon/qwen35-booking-prefix-rl` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3.5-35B-A3B` mediante técnicas de aprendizaje por refuerzo (RL) aplicadas a tareas de reservas (booking) con uso de herramientas y agentes. El autor, imvladikon, publica este repositorio como evidencia de once experimentos que validan un entorno de reservas ejecutable y una implementación de RL basada en prefijos de trayectoria/estado, incluyendo una comparación pareada con GRPO (Group Relative Policy Optimization). No se trata de pesos fusionados del modelo completo, sino de un adaptador de bajo rango que debe cargarse sobre el base Qwen3.5-35B-A3B.

El adaptador tiene un tamaño de repositorio de 0,6 GB y está diseñado para la generación de texto con soporte de tool calling y agentes. Los resultados publicados son métricas de entrenamiento en un entorno específico de reservas (tasa de éxito, recompensa media, etc.), no benchmarks generales de razonamiento o código. El proyecto parece orientado a investigación en RL para agentes con herramientas, explorando variantes como trajectory-prefix, TRACE-C, SMRC-SD, ReOPD y T²PO-TDS. La licencia y los idiomas soportados no están especificados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-35B-A3B (MoE) |
| Parametros totales | no disponible (el adaptador ocupa 0,6 GB en safetensors; el base tiene 35B totales según nomenclatura) |
| Parametros activos | no disponible (el base Qwen3.5-35B-A3B es MoE con 3B activos según su nombre, no confirmado) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en precisión original, sin cuantización) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PEFT LoRA (safetensors) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `Qwen/Qwen3.5-35B-A3B`, un transformer con arquitectura MoE (Mixture of Experts) que, según su nomenclatura, tiene 35 mil millones de parámetros totales y 3 mil millones activos por token. El adaptador LoRA añade pesos de bajo rango a las capas del base, permitiendo un ajuste eficiente sin modificar todos los parámetros. El entrenamiento se realiza mediante aprendizaje por refuerzo, con un entorno de reservas ejecutable que valida transiciones de estado de forma determinista. Se utilizan varias metodologías: un bootstrap inicial con SFT (supervised fine-tuning) sobre 12 tareas verificadas, y posteriormente experimentos con GRPO, trajectory-prefix RL, TRACE-C (credit assignment local), SMRC-SD (distillation con state-matching), ReOPD (offline replay-prefix distillation) y T²PO-TDS (selección a nivel de turno). Los experimentos usan 12 esquemas de herramientas y un límite de 8 tareas para las comparaciones pareadas. La optimización se aplica solo a la continuación muestreada tras un prefijo de trayectoria, enmascarando las observaciones del entorno y los tokens del prefijo en la pérdida de política.

## Capacidades

- Generacion de texto con soporte de tool calling (12 esquemas de herramientas) para tareas de reservas.
- Uso de agentes con razonamiento multi-paso: el modelo genera trayectorias de agente que interactúan con un entorno de reservas ejecutable.
- Soporte de RL con prefijos de trayectoria/estado: el modelo puede continuar desde un estado de agente dado, no solo desde tokens arbitrarios.
- Capacidad de integración con entornos verificables: las acciones se validan mediante transiciones de estado deterministas, sin simuladores externos ni LLM como juez.
- Multilingüismo: no disponible (no se especifica en la información).
- Otras capacidades (visión, audio, etc.): no disponibles.

## Casos de uso

- Investigación en RL para agentes con herramientas: el adaptador sirve como banco de pruebas para comparar métodos de credit assignment (GRPO vs. trajectory-prefix, TRACE-C, etc.) en un entorno de reservas determinista.
- Desarrollo de pipelines de entrenamiento para agentes de reservas: permite validar entornos ejecutables y esquemas de recompensa antes de escalar a modelos completos.
- Experimentación con prefijos de trayectoria: útil para estudiar cómo el modelo aprovecha información de estado previa para mejorar la tasa de éxito en tareas multi-paso.
- Generación de datos sintéticos para fine-tuning: el adaptador puede generar trayectorias de reservas verificadas que sirvan como datos de entrenamiento para otros modelos.
- Benchmarking de métodos de RL en entornos tool-use: los resultados publicados (success rate, recompensa, invalid rate) permiten comparar variantes de optimización.
- Prototipado de asistentes de reservas en entornos controlados: aunque no está listo para producción, puede usarse en demos o pruebas de concepto con un entorno simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas de entrenamiento en el entorno de reservas, que se resumen a continuación (valores de la model card):

| Experimento | Tasa de éxito | Recompensa media | Invalid rate | Notas |
|---|---|---|---|---|
| Oracle SFT bootstrap | no aplica | no aplica | no aplica | Loss 0.12198; token accuracy 0.9603 |
| Full-trajectory smoke | 0.50 | 1.50 | no indicado | Exact state-match 0.50 |
| Create-only smoke | 0.25 | 0.75 | no indicado | Exact state-match 0.00 |
| Matched GRPO one-step | 0.50 | 1.50 | 0.50 | Grad norm 0.1818 |
| Matched prefix one-step | 0.50 | 1.525 | 0.25 | Grad norm 0.3180 |
| Matched GRPO four-step | 5/8 | 1.819 | 0.3125 | Runtime 2,519 s |
| Matched prefix four-step | 6/8 | 2.200 | 0.1875 | Runtime 2,664 s |
| TRACE-C | 0.5625 | no indicado | no indicado | TD delta 0.04314; runtime 2,543 s |
| SMRC-SD | 0.5625 | no indicado | no indicado | State-match 0.7571; runtime 3,354 s |
| ReOPD | no indicado | no indicado | no indicado | Log-prob gap 0.01475; runtime 821 s |
| T²PO-TDS | 0.625 | no indicado | no indicado | 4/29 turnos resampleados; runtime 3,366 s |

Estas métricas son específicas del entorno de reservas y no son comparables con benchmarks generales de modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,6 GB, por lo que su carga adicional sobre el modelo base es mínima.
- El modelo base Qwen3.5-35B-A3B (MoE con 3B activos) requiere una GPU con suficiente VRAM para alojar los pesos en memoria. Estimaciones orientativas: con cuantización de 4 bits podría caber en una GPU de 24 GB (p. ej., RTX 4090, A5000), y con 8 bits en 32-48 GB (p. ej., A100 40GB, L40S). No se dispone de datos oficiales de requisitos.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con librerías como Hugging Face Transformers + PEFT, o con servidores de inferencia que soporten LoRA (vLLM, TGI). También podría usarse con llama.cpp si se convierte a GGUF, pero no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (adaptadores LoRA para agentes con tool-use). El modelo base Qwen3.5-35B-A3B es un MoE reciente, pero no se dispone de datos de otros adaptadores comparables.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo completo ni una release estable. El autor indica que "no son pesos fusionados" y que "aún no son releases completas con benchmarks".
- Licencia no especificada: no se puede determinar si es apto para uso comercial. Se recomienda contactar al autor antes de cualquier uso en producción.
- Los resultados de entrenamiento se limitan a un entorno de reservas sintético y determinista; no hay evidencia de generalización a otras tareas o dominios.
- Riesgo de alucinación y errores en tareas fuera del dominio de reservas, ya que el adaptador está especializado y no se ha evaluado en tareas generales.
- Sin datos de sesgos, idiomas o comportamiento multilingüe.
- Para producción, se necesitaría una validación exhaustiva con benchmarks estándar y pruebas de robustez, así como la integración con el modelo base completo (Qwen3.5-35B-A3B), que tampoco tiene licencia clara en esta información.
- El entrenamiento con RL en entornos tool-use puede sufrir de reward hacking o sobreajuste al entorno específico; los resultados muestran tasas de éxito moderadas (máximo 0.625) incluso en tareas pequeñas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/imvladikon/qwen35-booking-prefix-rl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B (referenciado en la model card, no verificado en esta búsqueda)
- Carpetas de experimentos (dentro del repo): `runs/20260809-qwen35-booking-oracle-sft-e12-v3-s42`, `runs/20260810-qwen35-trajectory-prefix-r50-e8-s4-t5-g2-progress-s42`, etc. (enlaces relativos no accesibles directamente desde la web).
