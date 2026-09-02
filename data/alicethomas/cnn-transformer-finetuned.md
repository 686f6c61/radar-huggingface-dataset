# Alicethomas/cnn-transformer-finetuned

## Resumen

El modelo `Alicethomas/cnn-transformer-finetuned` es un checkpoint experimental de una arquitectura híbrida CNN-Transformer orientada a tareas de generación de texto. Desarrollado por el usuario Alicethomas, se publica como un repositorio de código con un script principal (`predict.py`), una configuración de arquitectura (`config.json`) y un checkpoint de inicialización (`model.safetensors`) de apenas 33.088 parámetros. No se trata de un modelo entrenado ni ajustado: la propia model card indica que el checkpoint sirve únicamente para pruebas de humo (smoke tests) y que no se reclama ningún resultado de benchmark.

La relevancia de esta publicación es limitada y se circunscribe al ámbito de la investigación experimental. Su interés radica en que documenta una arquitectura con atención de ventana deslizante, fusión tensorial y normalización por lotes, combinando capas convolucionales con transformadores. Al ser un proyecto de código abierto con licencia BSD-3-Clause, puede servir como base para que otros desarrolladores exploren variantes de esta arquitectura, pero no es apto para uso en producción ni para tareas reales de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (base) |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con un transformador, empleando atención de ventana deslizante (sliding window attention) en lugar de atención global, lo que reduce el coste computacional. La fusión entre las ramas CNN y transformer se realiza mediante "tensor fusion", y la activación es GELU con normalización por lotes (batchnorm). El tamaño base es deliberadamente reducido para facilitar la inspección de cambios arquitectónicos antes de un entrenamiento completo.

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El checkpoint incluido es una inicialización válida para pruebas de humo, no un modelo entrenado. La configuración por defecto en `training_args.json` usa el optimizador AdamW con programación de tasa de aprendizaje coseno, pero estos son valores iniciales del script, no evidencia de una ejecución completada.

## Capacidades

- No se han verificado capacidades reales de generación de texto, razonamiento, código o matemáticas, dado que el checkpoint no está entrenado.
- La arquitectura está diseñada para generación, pero no hay evidencia de que funcione correctamente sin entrenamiento.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se incluye ningún modo especial (thinking, visión, audio).

## Casos de uso

- Investigación de arquitecturas híbridas CNN-Transformer: el repositorio permite estudiar el efecto de la atención de ventana deslizante y la fusión tensorial en tareas de generación, sirviendo como punto de partida para experimentos controlados.
- Desarrollo de prototipos académicos: estudiantes e investigadores pueden utilizar el código para implementar variantes y comparar con líneas base de capacidad equivalente.
- Pruebas de integración de pipelines de entrenamiento: el checkpoint de inicialización permite verificar que un pipeline de entrenamiento personalizado funciona antes de lanzar ejecuciones costosas.
- Benchmarking de eficiencia de arquitecturas: al ser extremadamente pequeño (33K parámetros), es útil para medir overhead de frameworks de inferencia o entrenamiento sin necesidad de recursos elevados.
- Educación en aprendizaje profundo: el código es legible y compacto, adecuado para ilustrar conceptos de atención local y fusión de características en cursos avanzados.
- Exploración de regularización y normalización: la combinación de batchnorm con atención deslizante puede estudiarse en contextos de estabilidad de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado el tamaño de 33.088 parámetros (el modelo cabe en cualquier GPU moderna e incluso en CPU).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (RTX 2060, GTX 1660, etc.) puede ejecutarlo sin problemas.
- Opciones de despliegue: al ser un modelo personalizado, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. El script `predict.py` incluye un ejemplo de uso.
- Latencia y throughput: no disponibles, pero se espera que sean despreciables por el tamaño del modelo.

## Comparativa con modelos similares

Existe un repositorio casi idéntico de otro autor (`kaorisakam/cnn-transformer-finetuned`) con la misma licencia y estructura, pero no se dispone de datos comparativos de rendimiento. No se conocen otros modelos de la misma categoría con especificaciones públicas.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Alicethomas/cnn-transformer-finetuned | 33.088 | no disponible | BSD-3-Clause | Experimental, no entrenado |
| kaorisakam/cnn-transformer-finetuned | no disponible | no disponible | BSD-3-Clause | Experimental, no entrenado |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; no debe usarse en producción.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto coherente sin entrenamiento.
- Limitaciones de contexto e idioma: desconocidas, pero al no estar entrenado, no se puede garantizar ningún comportamiento.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de las fuentes de datos externas si se utilizan con este repositorio.
- El modelo no es compatible con APIs automáticas de Hugging Face; se requiere un adaptador explícito para cargarlo.
- La fecha de creación (2026-09-02) es posterior a la fecha actual, lo que sugiere que el repositorio podría ser un artefacto de prueba o una publicación programada.

## Enlaces

- [HuggingFace - Alicethomas/cnn-transformer-finetuned](https://huggingface.co/Alicethomas/cnn-transformer-finetuned)
- [HuggingFace - kaorisakam/cnn-transformer-finetuned (modelo similar)](https://huggingface.co/kaorisakam/cnn-transformer-finetuned)
- [GitHub - CTran (arquitectura CNN+Transformer relacionada)](https://github.com/rafiepour/CTran)
