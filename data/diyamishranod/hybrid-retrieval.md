# DiyaMishranod/hybrid-retrieval

## Resumen

El modelo `DiyaMishranod/hybrid-retrieval` es una implementación compacta y personalizada de un sistema de recuperación híbrida (hybrid retrieval) escrita en PyTorch. Su autor, DiyaMishranod, lo presenta como un artefacto experimental destinado a revisión de código, pruebas de humo y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción. La arquitectura combina atención flash, fusión bilineal, activación ReLU y normalización RMSNorm, con una escala declarada como "huge" aunque el número real de parámetros es de solo 49.600, lo que lo convierte en un modelo extremadamente ligero.

El repositorio incluye un checkpoint de inicialización (`model.safetensors`) que no ha sido entrenado ni auditado, por lo que no se reportan capacidades de generación de texto, razonamiento o código. Su propósito principal es servir como punto de partida para investigar arquitecturas híbridas de recuperación, evaluar configuraciones de fusión y comparar baselines con capacidad equivalente. La licencia es BSD-3-Clause, lo que permite uso comercial con atribución, aunque se recomienda revisar los términos de los datos externos si se utiliza con conjuntos de datos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid (atención flash, fusión bilineal, activación ReLU, normalización RMSNorm) |
| Parámetros totales | 49.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un diseño híbrido para recuperación que integra atención flash, fusión bilineal, activación ReLU y normalización RMSNorm. No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El checkpoint incluido es únicamente de inicialización, generado para pruebas de humo, y no representa un modelo entrenado. La configuración por defecto del experimento utiliza el optimizador LAMB con un programa de calentamiento constante, pero estos valores son solo un punto de partida y no evidencian una ejecución completada. Para una evaluación significativa, se recomienda entrenar todas las líneas base con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- Recuperación híbrida: combina métodos dispersos (léxicos) y densos (semánticos) mediante fusión bilineal, siguiendo el paradigma general de hybrid retrieval.
- Implementación personalizada en PyTorch: requiere un adaptador explícito para ser cargada con APIs automáticas estándar.
- No se reportan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni tool calling, ya que no es un modelo de lenguaje general.
- No se especifican capacidades multilingües ni soporte de agentes.

## Casos de uso

- Pruebas de humo y verificación de código: el checkpoint de inicialización permite comprobar que la implementación funciona correctamente antes de entrenar un modelo real.
- Experimentos controlados de recuperación en conjuntos pequeños: la model card sugiere evaluar con Flickr30k, reportando la métrica de la tarea en al menos tres semillas e incluyendo una línea base de capacidad equivalente.
- Investigación sobre arquitecturas híbridas: sirve como banco de pruebas para estudiar la fusión bilineal, la atención flash y la normalización RMSNorm en sistemas de recuperación.
- Desarrollo de adaptadores para integración con frameworks: al ser una implementación personalizada, se puede usar para crear adaptadores que permitan cargarla en librerías como Hugging Face Transformers o Haystack.
- Comparación de baselines: permite comparar configuraciones de fusión y arquitecturas con un modelo de tamaño mínimo, útil para validar hipótesis de escalado.
- Evaluación de configuraciones de optimización: el script `train.py` incluye un ejemplo ejecutable que puede usarse para probar el optimizador LAMB y el programa de calentamiento constante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación de rendimiento y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- Al tener solo 49.600 parámetros, el modelo es extremadamente ligero y puede ejecutarse en cualquier GPU moderna, incluso en CPU.
- No se requieren GPUs específicas como A100 o H100; cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia.
- Es adecuado para entornos de desarrollo y pruebas en máquinas locales sin requisitos especiales.
- Las opciones de despliegue son limitadas: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador previo.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Aunque existen sistemas de recuperación híbrida como ColBERT, DPR o los basados en MiniLM, este modelo no ha sido entrenado ni evaluado, por lo que cualquier comparación de rendimiento sería especulativa. La comparativa queda pendiente hasta que se publique un checkpoint entrenado con resultados de benchmarks.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No es apto para uso en producción: carece de capacidades reales de recuperación hasta que se entrene adecuadamente.
- La implementación requiere un adaptador explícito para ser utilizada con APIs de carga automática, lo que añade fricción en la integración.
- No se especifican idiomas soportados ni longitudes de contexto, por lo que su aplicabilidad multilingüe es desconocida.
- La licencia BSD-3-Clause permite uso comercial, pero se debe revisar los términos de los datos externos si se combina con conjuntos de datos de terceros.
- Los resultados de cualquier entrenamiento futuro deben documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DiyaMishranod/hybrid-retrieval
- Repositorio relacionado del mismo autor: https://huggingface.co/DiyaMishranod/generation
- Artículo sobre hybrid retrieval (referencia general): https://arxiv.org/pdf/2506.00049
