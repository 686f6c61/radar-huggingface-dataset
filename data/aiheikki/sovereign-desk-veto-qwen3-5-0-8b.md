# AIHeikki/sovereign-desk-veto-qwen3.5-0.8b

## Resumen

Sovereign Desk Veto es un modelo de verificación inline de acciones, derivado del modelo base Qwen/Qwen3.5-0.8B mediante una cirugía de pesos en dos etapas (LoRA quirúrgico y calibración de techo sin gradiente). Lo desarrolla AIHeikki como artefacto complementario opcional del sistema Sovereign Desk v2, un conjunto experimental de pesos abiertos orientado a auditorías estructuradas de compras sobre hardware local. Su función no es generar texto libre, sino actuar como una puerta de decisión (veto gate) que clasifica acciones propuestas por un planificador mayor (el modelo hermano de 4B) en categorías como `ALLOW`, `RECOVER_RETRY` o `HOLD_SECURITY_REVIEW`.

El modelo resuelve un problema acotado de seguridad en agentes: verificar, antes de ejecutar una acción en el navegador o en un flujo de compras, si esa acción es legítima dado el estado del sistema (por ejemplo, si hay un modal pendiente). Se distribuye principalmente como GGUF Q4_K_M de 522 MiB, con un delta BF16 de 19,8 MB para reproducir la cirugía de pesos. Con 772.845.888 parámetros totales y 24 capas de texto, está pensado para ejecutarse en local (probado en Apple M3 con Metal) y no requiere GPU de datacenter.

Es relevante ahora porque ejemplifica una tendencia práctica: usar modelos pequeños y especializados como guardrails deterministas dentro de arquitecturas de agentes zero-trust, en lugar de confiar toda la política de seguridad a un LLM grande. El autor es explícito sobre los límites empíricos: en el benchmark simulado Holdout-45, el veto no interceptó ninguna de las dos aprobaciones que violaban la política, por lo que recomienda implementar los límites financieros en código determinista y no solo en el veto neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B (24 capas de texto; torre de visión multimodal eliminada en la exportación GGUF solo texto) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configurado en el quickstart con `--ctx-size 4096`; no se especifica el máximo nativo) |
| Tipos de cuantizacion | GGUF Q4_K_M (522 MiB); delta BF16 de 19,8 MB para reproducir la cirugía |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) y safetensors (delta quirúrgico BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de 24 capas de texto al que se le elimina la torre de visión multimodal durante la exportación a GGUF solo texto. Sobre esa base se aplica una cirugía de pesos en dos etapas ejecutada en una NVIDIA A100 (run `run_1795184419`). En la primera etapa se congelan las capas 0–5 (la capa 22 también conserva los pesos base) y se entrenan adaptadores LoRA de rango 16 en BF16 sobre las capas 6–21: 6,23 M de escalares, el 0,730 % del total, con 1.296 filas sintéticas de verificación de acciones condicionadas al estado `portal_modal_pending`, 3 épocas, 243 pasos y una pérdida que baja de 1,1532 a 0,00021. El conjunto equilibra `browser.confirm_modal` legítimos (19 `ALLOW` con modal pendiente, 23 `RECOVER_RETRY` sin modal pendiente) con contrafactuales defensivos de tipo `HOLD_SECURITY_REVIEW`.

La segunda etapa es una calibración de techo sin gradiente (`Zero-Grad Roof Calibration`) sobre la capa 23 y `lm.norm` con `grad_enabled=False`. Evaluada sobre 24 pares de validación disjuntos, eleva la precisión de calibración del 50,0 % al 66,67 %, con `best_alpha = 0.03` y `best_beta_norm = 0.97`. No se documentan datos de RLHF ni DPO; el entrenamiento es supervisado sobre datos sintéticos de verificación de acciones. La innovación técnica destacable es precisamente el enfoque de programación en el espacio de pesos (weight-space programming) para convertir un modelo de lenguaje pequeño en un clasificador de decisión inline con formato estructurado.

## Capacidades

- Verificación inline de acciones: clasifica acciones propuestas en decisiones como `ALLOW`, `RECOVER_RETRY` y `HOLD_SECURITY_REVIEW`.
- Detección de estado contextual: condiciona la decisión al estado `portal_modal_pending` (si hay un modal pendiente o no).
- Salida estructurada: diseñado para producir decisiones de clase cerrada, no texto libre.
- Defensa contra inyección de prompts: etiquetado como `prompt-injection-defense` y `guard-model` por el autor.
- Integración con agentes: pensado como puerta de veto opcional dentro de un pipeline con un planificador mayor (el modelo de 4B) y un broker de permisos determinista.
- Despliegue local: compatible con llama.cpp y Ollama, incluido `llama-server` con `--jinja` y `--reasoning-budget 0`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada (el quickstart desactiva el razonamiento con `--reasoning-budget 0`).

## Casos de uso

- Auditoría de compras locales: el modelo se usa como puerta de veto que revisa cada acción de aprobación de factura propuesta por el planificador de 4B antes de ejecutarse, contrastando el estado del portal y devolviendo `ALLOW` o `HOLD_SECURITY_REVIEW`. Es adecuado por su tamaño reducido (522 MiB) y su latencia baja en hardware de consumo.
- Verificación de confirmaciones de modal en navegador: cuando el agente propone `browser.confirm_modal`, el veto comprueba si realmente hay un modal pendiente y devuelve `RECOVER_RETRY` si no lo hay, evitando confirmaciones fantasma.
- Guardrail en pipelines de agentes zero-trust: se inserta como paso intermedio entre la planificación y la ejecución de acciones, aportando una segunda opinión neuronal sobre acciones sensibles antes de que el broker determinista las autorice.
- Investigación sobre guardrails de modelos pequeños: sirve como artefacto reproducible (delta BF16 de 19,8 MB) para estudiar cómo un modelo de 0,8B puede especializarse en una tarea de decisión acotada mediante cirugía de pesos.
- Despliegue en hardware de consumo: el quickstart documenta ejecución en Apple M3 con Metal, con auditorías completas en 35–40 s y 108–129 s según la sesión, lo que lo hace apto para prototipos locales sin GPU de datacenter.
- Filtrado de acciones en asistentes de escritorio: como capa de veto opcional en asistentes que operan sobre aplicaciones locales, para marcar acciones que requieren revisión humana antes de ejecutarse.
- Evaluación comparativa de arquitecturas de seguridad: permite medir el efecto de añadir un veto neuronal pequeño frente a un sistema solo con broker determinista, como hace el benchmark Holdout-45 del autor.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Holdout-45, Arm D (4B + veto 0.8B), A100 | 41/45 completados (91,11 %), 0 falsos bloqueos |
| Holdout-45, Arm C (solo 4B), A100 | 41/45 completados |
| Llamadas al veto en Holdout-45 | 237 llamadas, 237/237 devolvieron `ALLOW` |
| Aprobaciones que violaban política | 2 no interceptadas (€39.500 frente a tope de €35.000; €18.000 contra contrato expirado) |
| Latencia incremental del veto (A100) | +2,9 s de mediana por episodio sobre Arm C |
| Demo Apple M3 Metal, Arm D | 4/4 completados (35–40 s y 108–129 s por auditoría en dos sesiones) |
| Demo Apple M3 Metal, Arm D en v1 | 1/4 (regresión de falsos bloqueos, corregida en v2) |
| Precisión de calibración (validación, 24 pares) | 50,0 % → 66,67 % tras la etapa 2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 522 MiB; con contexto de 4096 tokens y overhead de llama.cpp, el consumo cabe holgadamente en menos de 2 GB de memoria.
- GPU recomendadas: no se especifican; el autor documenta ejecución en Apple M3 con Metal y en NVIDIA A100 para el benchmark.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB de pesos) es apto para cualquier GPU de consumo moderna e incluso para CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja --reasoning-budget 0`), Ollama (`ollama run hf.co/AIHeikki/sovereign-desk-veto-qwen3.5-0.8b`) y cualquier runtime compatible con GGUF.
- Latencia y throughput: en A100, +2,9 s de mediana por episodio de auditoría sobre el sistema sin veto; en Apple M3, auditorías completas de 35–40 s y 108–129 s según la sesión. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sovereign Desk Veto 0.8B (este) | 772.845.888 | 4096 (configurado) | Veto inline de acciones | Apache-2.0 | GGUF en Hugging Face |
| Sovereign Desk 4B (companero) | no disponible | no disponible | Planificador/lector del sistema | no disponible | Hugging Face |
| Qwen3.5-0.8B (base) | no disponible | no disponible | Generacion de texto general | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros guard models de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No interceptó las dos aprobaciones que violaban la política en Holdout-45 (€39.500 frente a tope de €35.000 y €18.000 contra contrato expirado); el autor recomienda aplicar los límites financieros, topes de orden de compra y caducidad de contratos en código determinista, no solo en el veto neuronal.
- En Holdout-45 devolvió `ALLOW` en las 237 llamadas, sin intercepción incremental observada frente al sistema sin veto.
- La precisión de calibración tras la etapa 2 es del 66,67 %, lejos de un guardrail fiable para producción.
- La versión v1 introdujo una regresión de falsos bloqueos que redujo la demo en Apple M3 de 4/4 a 1/4; la v2 la corrige, pero evidencia la fragilidad del enfoque.
- Es un artefacto de investigación experimental; la autonomía general de escritorio y las aprobaciones financieras desatendidas quedan fuera de las capacidades demostradas.
- Idiomas soportados no disponibles; el entrenamiento se basa en 1.296 filas sintéticas, lo que limita la generalización a dominios y estados no cubiertos.
- Licencia Apache-2.0 permite uso comercial, pero el propio autor desaconseja usarlo como única barrera de seguridad en producción.
- El contexto configurado en el quickstart es de 4096 tokens; no se documenta el máximo nativo ni el comportamiento más allá de ese límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIHeikki/sovereign-desk-veto-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo companero 4B: https://huggingface.co/AIHeikki/sovereign-desk-qwen3.5-4b
