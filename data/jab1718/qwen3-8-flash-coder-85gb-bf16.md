# Jab1718/qwen3.8-flash-coder-85gb-bf16

## Resumen

Qwen3.8-Flash-Coder-85GB-BF16 es un subconjunto Mixture-of-Experts (MoE) extraído del modelo monolítico Qwen/Qwen3.8-Flash-Next mediante el toolkit moe-slice, desarrollado por Jab1718. El objetivo es reducir el tamaño del checkpoint de 335 GB a 85,24 GB en BF16 nativo, sin pérdida de cuantización, para permitir el despliegue en estaciones de trabajo locales con 3 o 4 GPUs de consumo. Mantiene 48 capas transformer y 160 expertos enrutados por capa (de los 512 originales), con 10 expertos activos por token. Los parámetros totales son 42.620.341.120 según los safetensors. La relevancia actual radica en que ofrece capacidades de programación y razonamiento del modelo base con un coste de hardware mucho menor, ideal para desarrolladores que necesitan un agente de código local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) basado en Qwen3.8-Flash-Next; 48 capas transformer, 160 expertos por capa, 10 activos por token |
| Parametros totales | 42.620.341.120 |
| Parametros activos | No especificado; 10 expertos activos de 160 por capa |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo (sin cuantización) |
| Idiomas soportados | Inglés (en), vietnamita (vi), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un subconjunto físico del monolito Qwen3.8-Flash-Next, que originalmente tiene 512 expertos por capa y un tamaño de 335 GB. El toolkit moe-slice utiliza un perfilado de estados ocultos verdadero por capa para seleccionar los expertos más relevantes para tareas de programación, y fuerza un número de expertos alineado a hardware (múltiplo de 16) para optimizar el uso de VRAM. La arquitectura resultante mantiene las 48 capas transformer y reduce los expertos enrutados a 160 por capa, conservando los 10 expertos activos por token.

No se especifica la composición del dataset de entrenamiento. El proceso de calibración consistió en una única época de DoRA (Weight-Decomposed Low-Rank Adaptation) con 308 pasos, cuyo propósito era normalizar los logits del router y desbloquear las etiquetas de razonamiento `
