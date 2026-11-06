# A9Labs/mt_slm_ctx_compress

## Resumen

`mt_slm_ctx_compress` es un modelo de lenguaje especializado publicado por A9Labs como participante en la arena `ctx_compress` de la plataforma Microtensor. Se trata de un ajuste fino mediante LoRA (rango 64, fusionado y exportado en bf16) sobre el modelo base `ibm-granite/granite-4.0-h-micro` de IBM, fijado en el commit `d5f01a3ea75f`. El objetivo declarado es la compactación de sesiones de agente ("agent session compaction"): resumir o comprimir el historial de una conversación de agente para que quepa en la ventana de contexto de un modelo posterior sin perder información operativa relevante.

El modelo hereda la arquitectura híbrida de Granite 4.0, etiquetada en Hugging Face como `granitemoehybrid`, y cuenta con 3.191.396.096 parámetros totales según los pesos en safetensors, con un repositorio de 6,4 GB. Al derivar de `granite-4.0-h-micro`, se espera que conserve las capacidades generales del base (razonamiento, código, tool calling, multilingüismo), aunque la model card no aporta detalles adicionales sobre idiomas, contexto efectivo ni evaluación.

Su relevancia es acotada y muy específica: es un artefacto de competición orientado a una tarea concreta dentro de un ecosistema cerrado (Microtensor), con licencia propia distinta de la Apache 2.0 del modelo base. No hay descargas ni likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks ni detalles de entrenamiento más allá del método LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida tipo `granitemoehybrid` (heredada de Granite 4.0; detalles de capas no disponibles) |
| Parametros totales | 3.191.396.096 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | `microtensor-submission` (Other; términos en microtensor.cloud/terms) |
| Formato de pesos | safetensors (bf16, LoRA r=64 fusionado) |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.0-h-micro`, un transformer híbrido de la familia Granite 4.0 de IBM. La model card etiqueta el modelo como `granitemoehybrid`, lo que sugiere una arquitectura con componentes de mezcla de expertos y posiblemente atención híbrida (atención completa combinada con mecanismos lineales o recurrentes), aunque el autor no detalla la configuración de capas, el número de expertos ni los parámetros activos. El dato de 3,19 mil millones de parámetros totales corresponde a los tensores publicados.

El entrenamiento consistió en un ajuste fino con LoRA de rango 64, posteriormente fusionado en los pesos base y exportado en bf16. La model card remite a `training/recipe.json` para los detalles de la receta, pero no se incluyen en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La tarea objetivo es la compactación de sesiones de agente dentro de la arena `ctx_compress` de Microtensor, lo que implica generar resúmenes comprimidos de historiales multi-turno preservando información necesaria para continuar la tarea.

## Capacidades

- Compactación de sesiones de agente: generación de resúmenes comprimidos de historiales de conversación multi-turno para reducir el consumo de contexto.
- Generación de texto y razonamiento general, heredados del modelo base Granite 4.0.
- Capacidades de código y matemáticas presumiblemente heredadas del base (no verificadas en esta ficha).
- Soporte de tool calling y function calling presumiblemente heredado del base (no confirmado para este ajuste).
- Capacidades multilingües presumiblemente heredadas del base (idiomas no declarados).
- Capacidad especial: orientada a una única tarea de compresión de contexto dentro del ecosistema Microtensor.

## Casos de uso

- Compactación de historiales de agente: el modelo recibe el transcript de una sesión de agente y devuelve un resumen comprimido que un modelo posterior puede usar como contexto, reduciendo el número de tokens consumidos en cada turno.
- Memoria a largo plazo en asistentes conversacionales: resumir periódicamente el estado de una conversación larga para mantener coherencia sin reenviar todo el historial al modelo principal.
- Pipelines de agentes con ventanas de contexto limitadas: insertar el modelo como etapa de preprocesado antes de invocar un LLM de mayor tamaño, abaratando el coste por token de contexto.
- Compresión de logs de ejecución de agentes: condensar trazas de herramientas y resultados intermedios en un estado compacto que conserve las decisiones y observaciones clave.
- Evaluación comparativa en la arena `ctx_compress`: participar en la competición de Microtensor midiendo la calidad de la compactación frente a otros participantes.
- Investigación sobre compresión de contexto: servir como referencia de ajuste fino LoRA sobre Granite 4.0 para estudiar cómo se comporta un modelo pequeño en tareas de summarización estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 3,2-4 GB de pesos; en 4 bits, alrededor de 1,6-2 GB, más overhead.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para bf16 con contexto amplio; RTX 3090/4080 viables con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con margen, y en GPUs de 12-16 GB con cuantización 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama si se generan pesos GGUF (no publicados); al ser safetensors bf16, la vía directa es transformers o vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `A9Labs/mt_slm_ctx_compress` | 3,19 B | no disponible | `microtensor-submission` | Hugging Face, 0 descargas | Ajuste LoRA para compactación de contexto |
| `ibm-granite/granite-4.0-h-micro` (base) | ~3 B | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Modelo generalista del que deriva |
| Alternativas de ~3 B para summarización | varía | varía | varía | varía | No se dispone de comparación directa publicada |

No se dispone de datos de rendimiento comparativos entre este ajuste y sus alternativas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia `microtensor-submission`: no es Apache 2.0 como el modelo base; el uso comercial está sujeto a los términos de microtensor.cloud/terms, que deben revisarse antes de cualquier despliegue en producción.
- Modelo de competición: no hay evidencia de evaluación independiente ni de robustez fuera de la tarea `ctx_compress`.
- Riesgo de alucinación y de pérdida de información al comprimir: un resumen agresivo puede omitir detalles críticos del historial del agente.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe equivalente al del base sin verificación.
- Longitud de contexto efectiva no documentada para este ajuste.
- Sin descargas ni likes: ausencia de validación por parte de la comunidad.
- La model card remite a `training/recipe.json` para la receta, pero no se detallan datos de entrenamiento ni evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/A9Labs/mt_slm_ctx_compress
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Términos de licencia: https://www.microtensor.cloud/terms
- Plataforma Microtensor: https://www.microtensor.cloud
