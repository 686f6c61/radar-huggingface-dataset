# Atomic-Germ/DynaGuard-8B-NPU2

## Resumen

DynaGuard-8B-NPU2 es una conversión cuantizada en formato Q4NX del modelo guardián DynaGuard-8B, desarrollado por el grupo tomg-group-umd y adaptado por Atomic-Germ para ejecución en NPU AMD XDNA mediante el runtime FastFlowLM. DynaGuard es una familia de modelos de seguridad dinámicos que, a diferencia de los guardianes tradicionales limitados a categorías de daño estáticas, evalúa texto según políticas definidas por el usuario. El modelo base es un fine-tune de Qwen3-8B entrenado con SFT y GRPO sobre el dataset sintético DynaBench, que incluye más de 60 000 diálogos multi-turno y 40 000 políticas personalizadas.

Esta versión específica está compilada para FastFlowLM (FLM), un runtime tipo Ollama exclusivo para NPU AMD Ryzen AI, con pesos en formato Q4NX (5,57 GB) que combinan cuantización Q8_0, Q4_1 y BF16. No es un archivo GGUF ni safetensors, sino un formato propietario de FLM. Su relevancia radica en permitir desplegar un guardrail de seguridad de 8B parámetros en hardware NPU de bajo consumo, sin necesidad de GPU dedicada, manteniendo la capacidad de razonamiento y evaluación de políticas personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-8B fine-tuned) |
| Parametros totales | 8B (no confirmado exacto, segun denominacion del modelo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Qwen3-8B base soporta 32k, no confirmado para esta version) |
| Tipos de cuantizacion | Q4NX (mezcla Q8_0 / Q4_1 / BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (propietario FastFlowLM, no GGUF ni safetensors) |

## Arquitectura y entrenamiento

El modelo base DynaGuard-8B es un fine-tune de Qwen3-8B, un transformer decoder denso con atención causal estándar. El entrenamiento se realizó mediante SFT (supervised fine-tuning) seguido de GRPO (Group Relative Policy Optimization), una variante de RLHF, sobre el dataset sintético DynaBench. Este dataset contiene más de 60 000 diálogos multi-turno y 40 000 políticas definidas por el usuario, lo que permite al modelo aprender a evaluar cumplimiento de reglas arbitrarias en lugar de solo clasificar categorías de daño predefinidas.

La innovación principal de DynaGuard es su capacidad de "comprensión de políticas": recibe una política textual (por ejemplo, "no mencionar competidores") y debe determinar si el contenido la viola, razonando sobre el contexto. El paper reporta que el modelo de 8B supera a GPT-4o-mini en detección de violaciones de reglas personalizadas. La versión NPU2 aquí presentada es una conversión cuantizada para FastFlowLM, que no modifica la arquitectura pero adapta los pesos al formato Q4NX para inferencia eficiente en NPU AMD.

## Capacidades

- Evaluación de contenido según políticas definidas por el usuario (guardrail dinámico).
- Detección de violaciones de reglas personalizadas en diálogos multi-turno.
- Generación de texto conversacional con soporte de plantilla de chat (chat_template.jinja).
- Modo de razonamiento (etiqueta "thinking") para análisis profundo antes de responder.
- Clasificación de seguridad con salidas estructuradas (etiquetas de cumplimiento/no cumplimiento).
- Integración con FastFlowLM para despliegue en NPU AMD Ryzen AI.
- Soporte de contexto largo (hasta 256k según FastFlowLM, aunque no confirmado para este modelo).

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede evaluar publicaciones o comentarios contra políticas personalizadas de la plataforma (acoso, discurso de odio, spam) en tiempo real, ejecutándose en NPU de bajo consumo.
- Filtrado de respuestas de LLM en producción: antes de devolver una respuesta al usuario final, un sistema puede pasar el texto por DynaGuard para verificar que cumple las políticas corporativas (confidencialidad, tono, restricciones legales).
- Cumplimiento normativo en sectores regulados: en banca o sanidad, se definen políticas específicas (no dar consejo financiero, no diagnosticar) y el modelo verifica que las respuestas generadas por otros LLM no las violen.
- Auditoría de conversaciones de atención al cliente: analizar transcripciones de chats para detectar incumplimientos de políticas de servicio, usando el modo multi-turno para entender el contexto completo.
- Guardrail en agentes autónomos: cuando un agente LLM ejecuta acciones, DynaGuard puede evaluar cada paso intermedio contra políticas de seguridad definidas por el desarrollador, evitando comportamientos no deseados.
- Evaluación de contenido generado por IA en entornos educativos: verificar que las respuestas de un tutor automático no revelen soluciones completas si la política lo prohíbe, o que mantengan un tono apropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada Q4NX en la informacion disponible. El paper original de DynaGuard (arXiv 2509.02563) reporta que el modelo de 8B supera a GPT-4o-mini en detección de violaciones de reglas personalizadas, pero no se proporcionan cifras concretas en la documentación accesible. Tampoco hay datos de latencia o throughput para la ejecución en NPU.

## Requisitos de hardware

- NPU AMD XDNA (Ryzen AI) compatible con FastFlowLM, incluyendo las generaciones XDNA2.
- Peso del modelo: 5,57 GB en formato Q4NX, por lo que requiere al menos 6 GB de memoria NPU disponible.
- No requiere GPU dedicada; funciona en procesadores AMD Ryzen AI integrados.
- Runtime FastFlowLM versión 1.0.2 o superior, instalado mediante `flm-add`.
- Configuración típica: portátiles o mini-PC con AMD Ryzen AI 300 series o superiores.
- No se dispone de datos de latencia o throughput específicos para este modelo en NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| DynaGuard-8B-NPU2 (este) | 8B | no disponible | Políticas dinámicas definidas por usuario | Apache 2.0 | Q4NX (FLM) |
| Llama Guard 2 | 8B | 4k | Categorías estáticas de daño | Llama Community License | safetensors, GGUF |
| ShieldGemma | 2B/9B | 8k | Categorías estáticas de daño | Apache 2.0 | safetensors |

DynaGuard se diferencia de Llama Guard y ShieldGemma por su capacidad de evaluar políticas arbitrarias definidas por el usuario, en lugar de limitarse a taxonomías fijas. Sin embargo, esta versión concreta está restringida al ecosistema FastFlowLM y NPU AMD, mientras que las alternativas tienen formatos más universales (safetensors, GGUF) y pueden ejecutarse en GPU o CPU.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües en la documentación.
- El formato Q4NX es propietario de FastFlowLM y no es compatible con otros runtimes (vLLM, llama.cpp, Ollama estándar).
- La cuantización Q4NX puede introducir degradación de precisión respecto al modelo original en BF16, aunque no se han publicado evaluaciones comparativas.
- La versión 4B de DynaGuard (DynaGuard-4B) presenta problemas de etiquetas espurias en la generación, según la búsqueda web; no se confirma si la versión 8B tiene el mismo defecto, pero se recomienda validar en producción.
- Dependencia de hardware específico: requiere NPU AMD XDNA, lo que limita su despliegue a equipos con esa tecnología.
- No se han publicado benchmarks de seguridad o robustez para esta conversión cuantizada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Qwen Research License) que puede imponer restricciones adicionales; verificar compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/DynaGuard-8B-NPU2
- Modelo base original: https://huggingface.co/tomg-group-umd/DynaGuard-8B-NPU2
- Paper DynaGuard: https://arxiv.org/abs/2509.02563
- Sitio de FastFlowLM: https://fastflowlm.com/
- Notas del paper (ICLR 2026): https://github.com/zhaoyang97/Paper-Notes-en/blob/main/docs/ICLR2026/llm_safety/dynaguard_a_dynamic_guardian_model_with_user-defined_policies.md
