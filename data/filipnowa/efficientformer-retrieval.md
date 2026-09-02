# filipnowa/efficientformer-retrieval

## Resumen

Este repositorio contiene una implementación experimental de un modelo EfficientFormer adaptado para tareas de retrieval (búsqueda y recuperación de información). El autor, filipnowa, lo publica como un punto de partida para inspeccionar cambios arquitectónicos antes de un entrenamiento completo. El checkpoint incluido (`model.safetensors`) es únicamente una inicialización válida para pruebas de humo, no un modelo entrenado ni evaluado.

El modelo tiene 24.832 parámetros, una cifra extremadamente reducida que lo convierte en un esqueleto de arquitectura más que en un sistema funcional. La configuración base emplea atención de consulta agrupada (grouped query), fusión bilineal, activación mish y normalización por instancia. No se declaran resultados de benchmarks ni capacidades demostradas; el propio autor advierte que el checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

La relevancia de esta publicación es limitada: sirve como referencia de código para quien quiera experimentar con arquitecturas EfficientFormer en retrieval, pero no como un modelo listo para producción. La licencia MIT permite su uso y modificación, aunque los términos de los datos externos deben revisarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientFormer (escala base) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en EfficientFormer, un transformer de visión originalmente propuesto por Snap Research para clasificación de imágenes. En esta implementación, el autor lo adapta para retrieval con una configuración específica: atención de consulta agrupada (grouped query attention), fusión bilineal de características, activación mish y normalización por instancia. El repositorio incluye un `config.json` que registra los ajustes generados y un `training_args.json` con la receta experimental por defecto (optimizador adafactor con programación exponencial).

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El checkpoint `model.safetensors` es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado. El autor recomienda, para una evaluación significativa, entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint no está entrenado y no se reportan resultados de ninguna tarea.
- La implementación está pensada para retrieval, pero no hay evidencia de que funcione correctamente sin un entrenamiento previo.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni otras capacidades especiales.
- El código incluye un ejemplo ejecutable (`run.py`) que permite inspeccionar la arquitectura y realizar pruebas de humo.

## Casos de uso

Dado que el modelo no está entrenado, los casos de uso son exclusivamente experimentales y de desarrollo:

- **Investigación arquitectónica**: sirve como base para estudiar cómo la atención de consulta agrupada y la fusión bilineal afectan a tareas de retrieval. Se puede modificar el código y comparar variantes.
- **Pruebas de integración**: el checkpoint de inicialización permite verificar que el pipeline de carga, forward y guardado funciona antes de lanzar un entrenamiento completo.
- **Desarrollo de adaptadores**: al ser una implementación personalizada, los desarrolladores pueden crear adaptadores para cargarlo con APIs genéricas de HuggingFace.
- **Experimentos de entrenamiento desde cero**: con solo 24.832 parámetros, es viable entrenarlo en una sola GPU para tareas de retrieval a pequeña escala, como evaluación en Flickr30k (sugerida por el autor).
- **Comparación de líneas base**: el autor recomienda usarlo como referencia de capacidad equivalente en estudios que comparen arquitecturas eficientes.
- **Educación**: útil para aprender cómo se estructura un modelo de retrieval basado en transformer y cómo se configura un experimento con adafactor y programación exponencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado. La evaluación sugerida (Flickr30k con tres semillas y una línea base de capacidad equivalente) queda pendiente de que alguien la ejecute.

## Requisitos de hardware

- **VRAM estimada**: con 24.832 parámetros, el modelo cabe en cualquier GPU moderna, incluso en las más básicas. El uso de memoria es despreciable (menos de 1 MB en precisión float32).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- **Compatibilidad con GPU de consumo**: sí, absolutamente todas (RTX 3060, RTX 4090, etc.).
- **Opciones de despliegue**: al ser una implementación personalizada, no se puede cargar directamente con vLLM, llama.cpp u Ollama sin un adaptador. El script `run.py` es el punto de entrada natural.
- **Latencia y throughput**: no disponibles, pero dada la cantidad de parámetros, la inferencia sería prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo no está entrenado y no tiene métricas publicadas. Como referencia arquitectónica, se puede mencionar el EfficientFormerV2 original de Snap Research, pero ese es un modelo de visión para clasificación, no para retrieval, y tiene un tamaño muy superior (del orden de millones de parámetros). No hay modelos comparables en el mismo estado (checkpoint de inicialización sin entrenar) con los que contrastar.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el modelo no ha sido entrenado; cualquier salida que produzca es aleatoria y no debe interpretarse como resultado útil.
- **Sin evaluación de robustez**: el autor advierte que no se ha auditado para robustez, equidad ni transferencia de dominio.
- **Alucinación y sesgos**: al no estar entrenado, no aplican sesgos de datos, pero tampoco hay garantía de comportamiento coherente.
- **Implementación personalizada**: requiere un adaptador explícito para cargarlo con APIs genéricas; no es compatible con herramientas estándar de inferencia.
- **Licencia**: MIT permite uso comercial, pero los términos de los datos externos (p. ej., Flickr30k) deben revisarse por separado.
- **Sin soporte de contexto largo**: no se especifica longitud de contexto; con un tamaño tan reducido, es improbable que maneje secuencias largas.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/filipnowa/efficientformer-retrieval)
- [GitHub de EfficientFormer (Snap Research)](https://github.com/snap-research/EfficientFormer)
- [Modelos de EfficientFormer en Qualcomm AI Hub](https://aihub.qualcomm.com/models/efficientformer)
