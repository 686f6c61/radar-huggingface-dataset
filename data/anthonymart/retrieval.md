# anthonymart/retrieval

## Resumen

El repositorio `anthonymart/retrieval` contiene una implementación compacta y personalizada en PyTorch de la arquitectura **Perceiver** orientada a tareas de **retrieval**. El autor, Anthony Martinez (anthonymart), la presenta como una configuración "large" pensada para revisión de código, pruebas de humo (smoke tests) y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción.

El checkpoint incluido (`model.safetensors`) es únicamente una inicialización válida de pesos, no un modelo entrenado. Con solo **49.600 parámetros**, esta implementación sirve como punto de partida experimental para quienes quieran explorar la arquitectura Perceiver en problemas de recuperación de información. La licencia MIT permite su uso y modificación sin restricciones comerciales, aunque el autor advierte que no se ha auditado su robustez, equidad ni transferencia de dominio.

Su relevancia actual radica en ser un ejemplo didáctico y reproducible de cómo construir un Perceiver desde cero, con componentes modernos como atención flash y normalización ScaleNorm, en un paquete mínimo y autónomo. No compite con modelos de retrieval de gran escala, sino que ofrece una base para investigar y comparar arquitecturas en entornos controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención cruzada con latentes) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño Perceiver original: en lugar de aplicar atención directamente sobre la secuencia de entrada, utiliza un conjunto de **latentes aprendidos** de tamaño fijo que interactúan con la entrada mediante atención cruzada. Esto permite procesar entradas de longitud arbitraria con un coste computacional independiente de la longitud de la secuencia (aunque el coste depende del número de latentes). La configuración concreta incluye:

- **Atención**: flash attention (optimizada en memoria)
- **Fusión**: concat MLP (para combinar información de múltiples modalidades o fuentes)
- **Activación**: ReLU
- **Normalización**: ScaleNorm (una variante de LayerNorm sin sesgo)

El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con una receta experimental por defecto que usa el optimizador **lion** con programación de tasa de aprendizaje coseno. Sin embargo, el autor indica explícitamente que estos son valores de partida en el script, no evidencia de un entrenamiento completado. No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El checkpoint actual es una inicialización aleatoria válida para pruebas funcionales.

## Capacidades

- **Recuperación de información**: la arquitectura está diseñada para codificar consultas y documentos en un espacio vectorial compartido, permitiendo búsquedas por similitud semántica. Sin embargo, al no estar entrenado, el checkpoint actual no produce embeddings útiles para retrieval real.
- **Procesamiento de secuencias largas**: la atención cruzada con latentes permite manejar entradas de longitud variable sin el coste cuadrático de la atención estándar, aunque no se especifica la longitud máxima soportada.
- **Fusión multimodal**: la configuración "concat mlp" sugiere capacidad para combinar características de distintas fuentes o modalidades, pero no hay datos que lo confirmen.
- **Integración en pipelines de prueba**: gracias a su tamaño mínimo, puede ejecutarse en entornos con recursos muy limitados para validar lógica de entrenamiento, inferencia o evaluación.
- **Extensibilidad**: al ser una implementación personalizada, el código fuente (`eval.py`) sirve como plantilla para modificar y experimentar con la arquitectura.
- **Sin capacidades de agente, tool calling o generación de texto**: el modelo no es un LLM y no ofrece funciones conversacionales ni de razonamiento general.

## Casos de uso

- **Pruebas de humo en pipelines de retrieval**: el checkpoint de inicialización permite verificar que el flujo de datos, la codificación de consultas y documentos, y la métrica de evaluación (por ejemplo, Recall@K) funcionan correctamente antes de lanzar entrenamientos costosos.
- **Experimentos controlados de arquitectura**: investigadores pueden modificar el número de latentes, la profundidad o la fusión para comparar variantes del Perceiver con un coste computacional mínimo, usando el script `eval.py` como base.
- **Desarrollo de adaptadores para APIs genéricas**: dado que la implementación no es compatible con cargadores automáticos estándar, los desarrolladores pueden crear adaptadores personalizados que permitan integrar este modelo en frameworks como Hugging Face Transformers, sirviendo como caso de estudio de interoperabilidad.
- **Validación de configuraciones de entrenamiento**: la receta incluida (lion + cosine) puede ejecutarse en un dataset pequeño como Flickr30k para calibrar hiperparámetros y verificar la estabilidad del optimizador antes de escalar.
- **Educación y formación**: el código compacto y comentado es un recurso didáctico excelente para entender cómo funciona la atención cruzada de Perceiver y cómo implementarla desde cero en PyTorch.
- **Benchmarking de eficiencia**: con solo 49k parámetros, se puede medir el throughput y la huella de memoria en diferentes hardware (CPU, GPU, incluso dispositivos edge) para caracterizar el coste de la arquitectura Perceiver a escala mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que "no se reivindica ninguna puntuación de benchmark" en el repositorio. Para una evaluación significativa, sugiere entrenar el modelo en un dataset como Flickr30k, reportar la métrica de la tarea con al menos tres semillas diferentes y comparar con una línea base de capacidad equivalente.

## Requisitos de hardware

- **VRAM estimada**: con 49.600 parámetros, el modelo ocupa aproximadamente 0,2 MB en precisión FP32 (49.600 × 4 bytes). Cabe en cualquier GPU, incluso en iGPU integradas, y también en CPU sin problemas.
- **GPU recomendadas**: cualquier GPU con soporte para PyTorch, desde una NVIDIA GTX 1650 hasta una RTX 4090 o A100. Para pruebas de humo, incluso una CPU moderna es suficiente.
- **Uso en consumer GPU**: sí, absolutamente. El cuello de botella no son los parámetros sino la longitud de las secuencias de entrada y el número de latentes, que pueden aumentar el consumo de memoria durante la atención.
- **Opciones de despliegue**: al ser una implementación personalizada, no hay soporte directo para vLLM, llama.cpp u Ollama. Se requiere ejecutar el script `eval.py` o integrar el código en un entorno PyTorch estándar.
- **Latencia y throughput**: no hay datos publicados, pero dada la escala del modelo, la inferencia es prácticamente instantánea en hardware moderno (del orden de microsegundos a milisegundos, dependiendo de la longitud de entrada).

## Comparativa con modelos similares

No se dispone de modelos comparables con la misma arquitectura y escala en la información proporcionada. La mayoría de los modelos de retrieval (por ejemplo, DPR, ColBERT, Sentence-BERT) tienen decenas o cientos de millones de parámetros y están preentrenados. Este repositorio es una implementación experimental sin entrenar, por lo que no tiene sentido compararlo directamente con alternativas de producción. Como referencia de arquitectura, el Perceiver original (Jaegle et al., 2021) tiene configuraciones con millones de parámetros, pero no hay una versión estándar con 49k parámetros en el ecosistema público.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: los pesos incluidos son una inicialización aleatoria; cualquier salida del modelo es arbitraria y no tiene valor semántico.
- **Sin auditoría de robustez ni equidad**: el autor indica que el checkpoint no ha sido auditado para sesgos, robustez o transferencia de dominio.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo generativo de texto.
- **Limitaciones de idioma**: no se especifican idiomas soportados; al no estar entrenado, no puede procesar lenguaje natural de forma útil.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero el autor advierte que se deben revisar por separado los términos de los datasets externos si se usa con datos de terceros.
- **Compatibilidad limitada**: al ser una implementación personalizada, las APIs genéricas de carga automática (por ejemplo, `AutoModel` de Hugging Face) no funcionarán sin un adaptador explícito.
- **No apto para producción**: el repositorio es explícitamente un punto de partida experimental, no un modelo listo para desplegar en servicios reales.
- **Resultados futuros deben documentarse por separado**: si alguien entrena un checkpoint a partir de esta base, los resultados deben publicarse con sus propios registros de entrenamiento y entorno, no asociados a los valores por defecto del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anthonymart/retrieval
- Perfil del autor en Hugging Face: https://huggingface.co/anthonymart/models
- Paper de referencia de Perceiver (no incluido en el repo, pero útil como contexto): https://arxiv.org/abs/2103.03206
