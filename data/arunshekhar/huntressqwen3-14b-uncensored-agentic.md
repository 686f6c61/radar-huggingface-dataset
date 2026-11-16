# ArunShekhar/HuntressQwen3-14B-UNCENSORED-agentic

## Resumen

HuntressQwen3-14B-UNCENSORED-agentic es un ajuste fino (fine-tune) del modelo abliterado Huihui-Qwen3-14B-abliterated-v2, desarrollado por el usuario ArunShekhar. El modelo se presenta como un motor de seguridad ofensiva y pentesting agéntico, entrenado con QLoRA mediante Unsloth, con el objetivo de eliminar los rechazos y el tono moralizante de los modelos alineados convencionales cuando se le piden tareas de seguridad autorizadas (pentesting, bug bounty, reconocimiento). Está pensado para integrarse en flujos de agente de terminal como OpenCode, Cline o Roo-Code, emitiendo comandos ejecutables en lugar de consejos genéricos.

El modelo hereda la arquitectura de la familia Qwen3 (transformer denso de aproximadamente 14 mil millones de parámetros en su base), aunque la model card y los metadatos del repositorio presentan discrepancias notables: los safetensors publicados declaran 128.450.560 parámetros (unos 128 millones), mientras que el nombre del modelo y el modelo base apuntan a 14B. El repositorio pesa 0,3 GB y contiene principalmente un adaptador LoRA en formato GGUF f16 (246 MB) y un GGUF cuantizado Q4_K_M (8,4 GB), lo que sugiere que el artefacto principal es el adaptador y la versión cuantizada del modelo fusionado.

Su relevancia es doble: por un lado, ilustra la tendencia de fine-tunes "uncensored/abliterated" orientados a dominios de nicho (en este caso, seguridad ofensiva) con soporte explícito de razonamiento interno (`<think>`) y ciclos ReAct; por otro, es un caso de estudio sobre los riesgos de publicar modelos sin benchmarks independientes, con datos de parámetros inconsistentes y con salvaguardas de seguridad eliminadas, lo que exige cautela en su evaluación y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B); sin confirmación detallada en la model card |
| Parametros totales | 128.450.560 según safetensors publicados; el nombre y modelo base indican 14B (dato inconsistente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (valor recomendado en la model card para integración con agentes) |
| Tipos de cuantizacion | GGUF Q4_K_M (8,4 GB); adaptador LoRA en f16 GGUF (246 MB) |
| Idiomas soportados | Inglés (en); razonamiento interno declarado 100% en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M y LoRA f16); repositorio con librería transformers |

## Arquitectura y entrenamiento

El modelo parte de Huihui-Qwen3-14B-abliterated-v2, una versión "abliterated" (con los mecanismos de rechazo suprimidos mediante técnicas de edición de direcciones de activación) de Qwen3-14B. Sobre esa base se aplicó un ajuste fino con QLoRA usando Unsloth, según declara el autor. La model card menciona entrenamiento en ciclos multi-turno ReAct (Reason → Action → Observation → Pivot) y trazas de razonamiento internas en inglés dentro de etiquetas `<think>`, con el objetivo de que el modelo planifique pasos de reconocimiento, emita comandos de terminal y adapte la estrategia ante respuestas del entorno (por ejemplo, bloqueos WAF). Se reporta una pérdida de entrenamiento final de 0,860 en la iteración v5.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Las innovaciones destacadas por el autor son de comportamiento más que arquitectónicas: razonamiento destilado íntegramente en inglés, precisión en dialectos SQL (Oracle `dbms_pipe.receive_message` frente a `SLEEP()` de MySQL), adherencia estricta a restricciones de WAF y eliminación de bucles de repetición. No hay evidencia independiente que valide estas afirmaciones.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" interno (`<think>`) activable o desactivable.
- Generación de comandos de terminal para reconocimiento y explotación (`curl`, `ffuf`, `subfinder`, `nmap`).
- Soporte de tool calling / function calling y uso en agentes de terminal (OpenCode, Cline, Roo-Code, Continue).
- Razonamiento multi-paso tipo ReAct con diagnóstico de respuestas del entorno y pivote ante bloqueos.
- Generación de payloads de inyección SQL específicos por dialecto (Oracle, PostgreSQL, MSSQL, MySQL).
- Generación de payloads XSS con adherencia a restricciones declaradas (por ejemplo, alternativas a `
