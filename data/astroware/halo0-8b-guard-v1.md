# astroware/Halo0.8B-guard-v1

## Resumen

Halo0.8B-guard-v1 es un modelo de seguridad (guard model) desarrollado por Astroware Labs, una startup de seguridad de IA centrada en alineación, seguridad y protección de agentes. El modelo está diseñado para actuar como una capa de seguridad en tiempo de ejecución para sistemas de IA, clasificando entradas y salidas para detectar contenido malicioso, intentos de jailbreak o comportamientos inseguros en agentes autónomos.

Con 852 millones de parámetros (0.8B), el modelo es compacto y está pensado para integrarse en pipelines de inferencia con baja latencia. El tag `qwen3_5` en HuggingFace sugiere que su arquitectura se basa en la familia Qwen3.5, aunque no se confirma el detalle exacto de la implementación. El repositorio pesa 24,1 GB, lo que indica que incluye múltiples pesos o cuantizaciones. Fue creado en mayo de 2026 y actualizado en agosto de 2026, con 243 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 (tag `qwen3_5`), no disponible detalle exacto |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors; se menciona compatibilidad con FP4, FP8, INT4, INT8 en FriendliAI) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la información disponible, el modelo pertenece a la familia Qwen3.5 por el tag `qwen3_5`, lo que sugiere una arquitectura transformer estándar con atención de múltiples cabezas. Astroware Labs lo describe como un "guard model" y un "constitutional AI classifier", lo que indica que fue entrenado específicamente para clasificar contenido como seguro o inseguro, probablemente mediante fine-tuning sobre un modelo base de Qwen3.5 con un dataset de seguridad y alineación.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La empresa Astroware se enfoca en seguridad de agentes, por lo que es probable que el entrenamiento se haya centrado en detectar jailbreaks, prompts maliciosos y salidas no seguras en contextos de agentes autónomos.

## Capacidades

- Clasificación de contenido de seguridad: actúa como guard model, clasificando entradas y salidas de un modelo de IA como seguras o inseguras.
- Detección de jailbreak: capacidad probable de identificar intentos de bypass de políticas de seguridad.
- Integración como capa de seguridad en agentes: diseñado para funcionar en tiempo de ejecución, protegiendo agentes autónomos.
- Compatibilidad con arquitecturas Qwen3.5: al estar basado en Qwen3.5, hereda las capacidades del modelo base para procesar texto.
- Soporte de inferencia en tiempo real: por su tamaño de 0,8B, puede ejecutarse con baja latencia.
- Capacidades multilingües: no disponibles (no se publican datos de idiomas).
- Tool calling y function calling: no confirmado; el modelo se enfoca en clasificación de seguridad, no en generación de texto autónoma.

## Casos de uso

- **Filtrado de entradas en aplicaciones de chat**: se puede desplegar como un prefiltro que analiza cada mensaje del usuario antes de que llegue al modelo generativo principal, bloqueando intentos de jailbreak o contenido prohibido.
- **Guardia de salidas en agentes autónomos**: en un agente que ejecuta acciones, el modelo revisa cada salida generada para evitar que el agente realice acciones inseguras o genere texto perjudicial.
- **Auditoría de logs de interacciones**: en producción, se puede usar para escanear registros de conversaciones de IA y marcar incidentes de seguridad para revisión posterior.
- **Sistema de seguridad en entornos de prueba**: en entornos de desarrollo, se puede integrar en pipelines de CI/CD para validar que los cambios en un modelo generativo no introduzcan vulnerabilidades de seguridad.
- **Clasificación de contenido en moderación**: dado que es un clasificador, se puede usar para moderar contenido generado por usuarios o por IA en plataformas, categorizando mensajes como seguros o inseguros.
- **Protección de agentes en automatización de procesos**: en flujos de automatización con agentes que interactúan con APIs o sistemas externos, el modelo puede actuar como capa de seguridad para prevenir acciones no autorizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas como MMLU, HumanEval o GSM8K, y tampoco se encontraron evaluaciones comparativas en la búsqueda web. No se pueden aportar datos numéricos de rendimiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 0,8B con pesos en FP16, se estiman aproximadamente 1,6 GB de VRAM. Con cuantización INT4, se puede reducir a alrededor de 0,5 GB.
- **GPU recomendadas**: cualquier GPU con más de 2 GB de VRAM puede ejecutarlo, incluyendo tarjetas consumer como RTX 3060, RTX 4060 o incluso una GTX 1650 con cuantización.
- **CPU**: el modelo es lo suficientemente pequeño para ejecutarse en CPU con llama.cpp o similar, con latencia aceptable para tareas de clasificación.
- **Opciones de despliegue**: se puede desplegar con vLLM, llama.cpp, Ollama o TGI. FriendliAI ofrece soporte con cuantizaciones FP4, FP8, INT4 e INT8, con batching continuo y kernels optimizados.
- **Latencia y throughput**: no se han publicado datos específicos, pero por su tamaño se espera una latencia de inferencia de decenas de milisegundos en GPU moderna, y un throughput alto en entornos de batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Halo0.8B-guard-v1 | 0,8B | no disponible | no disponible | Guard model de seguridad |
| Llama Guard 3 | 8B | 128K | Llama 3 Community License | Guard model de seguridad |
| ShieldGemma | 2B | 8K | Gemma Terms of Use | Guard model de seguridad |

No se dispone de datos de rendimiento comparativos en benchmarks para estos modelos. Llama Guard 3 y ShieldGemma son alternativas conocidas en el espacio de guard models, pero no se puede confirmar una comparación numérica con Halo0.8B-guard-v1. El tamaño de Halo0.8B (0,8B) lo hace significativamente más ligero que Llama Guard 3 (8B), lo que puede ser una ventaja para despliegues con recursos limitados.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo, lo que impide conocer si es apto para uso comercial. Se recomienda contactar con Astroware Labs antes de usar en producción.
- **Información limitada**: no hay documentación sobre el dataset de entrenamiento, lo que dificulta evaluar sesgos potenciales.
- **Idiomas no confirmados**: no se publican idiomas soportados, por lo que el rendimiento en idiomas distintos al inglés es incierto.
- **Riesgo de falsos positivos/negativos**: como cualquier clasificador de seguridad, puede haber errores en la clasificación, bloqueando contenido legítimo o dejando pasar contenido malicioso.
- **Alucinación**: aunque el modelo es clasificador, si se usa como generador (no es su propósito), puede alucinar. Su uso principal es clasificación, no generación.
- **Sesgos**: no se publican estudios de sesgos; es posible que el modelo tenga sesgos en la clasificación de contenido según el contexto cultural o lingüístico.
- **Producción**: al ser un modelo reciente (creado en 2026), no se ha demostrado en entornos de producción amplios; se recomienda validar exhaustivamente antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/astroware/Halo0.8B-guard-v1
- Página de Astroware Labs en Hugging Face: https://huggingface.co/astroware
- Sitio web de Astroware Inc.: https://astroware.ai/
- Página de Halo Playground: https://astroware.ai/halo
- Documentación en FriendliAI: https://friendli.ai/models/astroware/Halo0.8B-guard-v1
