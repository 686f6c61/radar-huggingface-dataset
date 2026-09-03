# andrewtya04/multitask-ablation

## Resumen

El repositorio `andrewtya04/multitask-ablation` contiene una implementación personalizada de la arquitectura **Dino** orientada a tareas multitarea, publicada por el usuario andrewtya04 bajo licencia Apache 2.0. Se trata de un punto de partida reproducible para investigación, no de un modelo entrenado: incluye un checkpoint de inicialización (`model.safetensors`) de solo 16.576 parámetros, junto con los archivos de configuración (`config.json`, `training_args.json`) y un script Python (`model.py`) que define la arquitectura y un ejemplo de ejecución.

La arquitectura declarada emplea atención con ventana deslizante (sliding window), fusión tipo Tucker, activación Mish y normalización GroupNorm, con una escala etiquetada como "giant" (aunque el tamaño real es minúsculo). El autor indica explícitamente que no se reclama ningún resultado de benchmark y que el checkpoint no ha sido entrenado ni auditado. Su relevancia actual reside en servir como base reproducible para experimentos de ablación y desarrollo de modelos multitarea con esta configuración concreta, no como un modelo listo para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dino (atención sliding window, fusión Tucker, activación Mish, normalización GroupNorm) |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La implementación sigue una arquitectura Dino personalizada, con atención de ventana deslizante, fusión Tucker para combinar representaciones, activación Mish y normalización GroupNorm. El repositorio incluye una configuración por defecto que utiliza el optimizador LAMB con un programador de tasa de aprendizaje one-cycle, pero estos valores son solo el punto de partida del script, no evidencia de un entrenamiento completado.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas como RLHF o DPO. El checkpoint `model.safetensors` es un estado de inicialización válido para pruebas de humo (smoke tests), no un modelo entrenado. El autor recomienda, para una evaluación significativa, entrenar todas las líneas base con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint no está entrenado, por lo que no puede generar texto, razonar, escribir código ni realizar ninguna tarea práctica.
- La arquitectura está diseñada para soportar múltiples tareas (multitask), pero sin entrenamiento no hay comportamiento observable.
- No hay soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües verificadas.
- El único uso previsto es como punto de partida para experimentos de investigación y desarrollo de modelos con esta configuración.

## Casos de uso

No existen casos de uso prácticos reales para este modelo en su estado actual, ya que no ha sido entrenado. El repositorio está pensado exclusivamente para fines de investigación y desarrollo. A continuación se indican posibles direcciones de trabajo si se entrenara adecuadamente, pero no constituyen aplicaciones disponibles hoy:

- Investigación de ablación: comparar el efecto de la atención sliding window, la fusión Tucker y la normalización GroupNorm en tareas multitarea, usando este checkpoint como inicialización reproducible.
- Desarrollo de modelos multitarea: servir como base para entrenar un modelo que aborde simultáneamente varias tareas de NLP, siempre que se complete un entrenamiento con datos etiquetados.
- Pruebas de integración: verificar que el pipeline de entrenamiento y evaluación funciona correctamente antes de escalar a modelos mayores.
- Estudio de estabilidad de inicialización: analizar cómo diferentes semillas y configuraciones afectan al entrenamiento desde este punto de partida.
- Benchmarking de optimizadores: evaluar el comportamiento del optimizador LAMB con programación one-cycle en esta arquitectura concreta.
- Educación y experimentación: servir como ejemplo didáctico de implementación de una arquitectura Dino personalizada en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no es un modelo entrenado.

## Requisitos de hardware

- Con solo 16.576 parámetros, el modelo es extremadamente ligero y puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- No requiere VRAM significativa; incluso en una GPU integrada o en un portátil básico funcionaría sin problemas.
- No se necesitan GPUs específicas (A100, H100, RTX 4090, etc.) para inferencia o entrenamiento.
- Las opciones de despliegue son amplias: al ser un script de PyTorch personalizado, se puede ejecutar directamente con Python; no es compatible con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito, como indica el autor.
- La latencia y el throughput son irrelevantes dado el tamaño; la ejecución es prácticamente instantánea.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo entrenado, sino un checkpoint de inicialización para una arquitectura experimental. No existen modelos comparables en la misma categoría (mismo tamaño y propósito) con resultados publicados.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se puede utilizar para ninguna tarea real de generación, clasificación o razonamiento.
- La implementación es personalizada y no es compatible con APIs de carga automática genéricas; se requiere un adaptador explícito.
- No hay garantías de estabilidad numérica ni de convergencia durante el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los términos de los datos externos deben revisarse por separado si se usan con conjuntos de datos propios.
- Cualquier resultado obtenido tras un entrenamiento futuro debe documentarse de forma independiente a los valores por defecto incluidos en el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/andrewtya04/multitask-ablation
