# JULIANSNPZ/cnn-transformer-contrastive

## Resumen

El modelo `JULIANSNPZ/cnn-transformer-contrastive` es una implementación compacta y personalizada en PyTorch de una arquitectura híbrida CNN-Transformer orientada al aprendizaje contrastivo. Ha sido desarrollada por el autor JULIANSNPZ con una configuración de escala `tiny`, que en este caso se traduce en un total de 33.088 parámetros. No se trata de un modelo preentrenado ni de una versión lista para producción, sino de un checkpoint de inicialización válido para pruebas de humo, revisión de código y experimentos controlados de pequeña escala.

La arquitectura combina capas convolucionales con bloques transformer, incorporando atención multi-query, fusión de tensores, activación Swish y normalización GroupNorm. El repositorio incluye los ficheros de configuración (`config.json` y `training_args.json`), un script de evaluación (`eval.py`) y el checkpoint en formato `safetensors`. Según el autor, no se reclama ninguna puntuación de benchmark, y el modelo debe tratarse como un punto de partida experimental, no como un modelo entrenado y auditado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (escala tiny) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Atencion | Multi-query attention |
| Fusion | Tensor fusion |
| Activacion | Swish |
| Normalizacion | GroupNorm |

## Arquitectura y entrenamiento

La arquitectura es un híbrido CNN-Transformer, lo que implica que combina capas convolucionales para modelar correlaciones locales con bloques transformer para capturar relaciones globales. En esta implementación concreta, la atención se resuelve mediante multi-query attention, una variante que comparte las claves y valores entre varias cabezas de consulta para reducir costes computacionales. La fusión de tensores se realiza mediante una estrategia de tensor fusion, mientras que la activación Swish y la normalización GroupNorm completan el diseño. La escala `tiny` indica que el modelo es extremadamente reducido, con solo 33.088 parámetros.

En cuanto al entrenamiento, el README del repositorio es explícito: el checkpoint incluido es una inicialización válida para pruebas de humo, no un modelo entrenado. No se aportan datos sobre tokens de entrenamiento, composición del dataset ni procesos de alineación como RLHF o DPO. La configuración por defecto incluye un optimizador Lion con un scheduler OneCycle, pero el propio autor aclara que son valores de partida en el script y no evidencia de una ejecución completada. Por tanto, no existe información sobre datos de entrenamiento ni sobre resultados de ningún tipo.

## Capacidades

- No se han documentado capacidades funcionales reales, ya que el checkpoint no está entrenado y no se ha evaluado en ninguna tarea.
- Diseñado arquitectónicamente para aprendizaje contrastivo, aunque no hay evidencia de que produzca representaciones útiles.
- Implementa atención multi-query, lo que en teoría permite inferencia más eficiente que la atención multi-cabeza estándar, pero sin datos que lo confirmen.
- Soporta fusión de tensores entre ramas CNN y transformer, una técnica orientada a combinar características locales y globales.
- No incluye soporte de tool calling, function calling, agentes, ni capacidades multimodales, ya que no se ha entrenado ni se ha documentado ninguna de estas funciones.
- El formato de pesos es `safetensors`, compatible con cargadores estándar, aunque el README advierte que, al ser una implementación personalizada, las APIs de carga automática genéricas requieren un adaptador explícito.

## Casos de uso

- Pruebas de humo de la arquitectura: el modelo se puede cargar y ejecutar rápidamente para verificar que la implementación CNN-Transformer funciona sin errores antes de escalarla a modelos más grandes.
- Revisión de código: el repositorio incluye el script `eval.py` y los ficheros de configuración, lo que permite auditar la implementación de la atención multi-query y la fusión de tensores.
- Experimentos controlados de investigación: al tener solo 33.088 parámetros, es adecuado para comparar variantes arquitectónicas (por ejemplo, con o sin fusión tensor) manteniendo un coste computacional mínimo.
- Docencia de arquitecturas híbridas: el modelo sirve como ejemplo didáctico de cómo se combinan capas convolucionales y transformers, con una implementación legible y compacta.
- Depuración de pipelines de entrenamiento: se puede usar como modelo mínimo viable para validar la configuración de optimizador Lion y el scheduler OneCycle antes de lanzar entrenamientos costosos.
- Validación de adaptadores de carga: el checkpoint `safetensors` permite probar adaptadores personalizados para cargar modelos no estándar en entornos de desarrollo propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El README del repositorio indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización no entrenada. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante, ya que el modelo tiene 33.088 parámetros; en float32 ocupa aproximadamente 132 KB, por lo que cabe en cualquier dispositivo con capacidad de cómputo.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU o en cualquier GPU, incluidas las integradas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer es más que suficiente.
- Opciones de despliegue: no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI, porque se trata de una implementación personalizada de PyTorch que requiere un adaptador explícito para su carga automática.
- Latencia y throughput estimados: no disponibles, no se ha realizado ninguna medición.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. Dado que se trata de un checkpoint de inicialización sin entrenar, con una arquitectura experimental y un tamaño de 33.088 parámetros, no existe una categoría clara de modelos con la que compararlo. No se dispone de datos de rendimiento, licencias ni disponibilidad de alternativas equivalentes.

## Limitaciones y advertencias

- El checkpoint no está entrenado y no ha sido auditado en cuanto a robustez, equidad ni transferencia de dominio.
- No es apto para uso en producción ni para ninguna tarea real que requiera precisión o fiabilidad.
- El riesgo de alucinación no aplica en el sentido habitual, porque el modelo no está diseñado para generar texto ni mantener conversaciones.
- No se han documentado idiomas soportados, por lo que no se puede garantizar ningún comportamiento multilingüe.
- La licencia MIT permite uso comercial, pero el valor comercial del checkpoint es nulo al no estar entrenado.
- La carga automática mediante APIs genéricas de HuggingFace no funciona sin un adaptador explícito, lo que dificulta su integración en pipelines estándar.
- La configuración de entrenamiento incluida (Lion + OneCycle) son valores por defecto del script, no evidencia de un experimento completado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JULIANSNPZ/cnn-transformer-contrastive
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la información disponible.
