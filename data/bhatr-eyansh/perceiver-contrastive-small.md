# bhatr-eyansh/perceiver-contrastive-small

## Resumen

`perceiver-contrastive-small` es una implementación en PyTorch de la arquitectura Perceiver orientada al aprendizaje contrastivo, publicada por el usuario bhatra-eyansh bajo licencia MIT. Se trata de una variante "nano" con solo 24.832 parámetros, diseñada como punto de partida reproducible para experimentos, no como un modelo entrenado listo para producción. El repositorio contiene el script de entrenamiento (`train.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización válido (`model.safetensors`).

La arquitectura Perceiver fue propuesta por DeepMind en 2021 (Jaegle et al.) como una variante del Transformer capaz de procesar datos de naturaleza arbitraria —imágenes, audio, vídeo, datos espaciales— mediante atención cruzada entre un conjunto de latentes y las entradas, reduciendo la complejidad computacional respecto a los Transformers clásicos. Esta implementación concreta añade el enfoque contrastive, una técnica de aprendizaje autosupervisado que busca acercar representaciones de elementos similares y separar las disímiles. Su relevancia radica en ofrecer un banco de pruebas minimalista para investigar la arquitectura Perceiver sin los costes de los modelos originales, aunque el checkpoint incluido no ha sido entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver con atención dispersa (sparse), fusión bilineal, activación swish y normalización scalenorm |
| Parametros totales | 24.832 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La implementación sigue el diseño Perceiver original con un mecanismo de atención cruzada entre un conjunto de latentes aprendidos y las entradas de alta dimensionalidad. La atención es dispersa (sparse), lo que reduce el coste computacional al atender solo a un subconjunto de posiciones; la fusión de información entre representaciones es bilineal, la activación es swish y la normalización es scalenorm, una variante de normalización que escala el vector de entrada mediante un parámetro aprendido.

El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests), no un modelo entrenado. La receta de entrenamiento por defecto utiliza el optimizador adafactor con un programa de calentamiento constante (constant warmup). El autor no reclama ningún resultado de benchmark en el repositorio y recomienda explícitamente que cualquier evaluación futura se realice con un conjunto de validación específico de la tarea, reportando métricas sobre al menos tres semillas e incluyendo una línea base de capacidad comparable. No se especifican datos de entrenamiento, número de tokens ni composición del dataset.

## Capacidades

- Aprendizaje contrastivo: el modelo está diseñado para entrenarse con técnicas contrastive (p. ej., InfoNCE, SimCLR), aunque el checkpoint incluido no ha sido entrenado.
- Procesamiento de datos arbitrarios: su arquitectura Perceiver permite, en principio, trabajar con imágenes, audio, vídeo y datos espaciales, aunque no hay evidencia de entrenamiento en ninguno de estos dominios.
- Reproducibilidad: incluye script de entrenamiento, configuración y checkpoint de inicialización, lo que facilita la reproducción de experimentos.
- Ligereza computacional: con solo 24.832 parámetros, es adecuado para experimentos en entornos con recursos limitados.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio en su estado actual.

## Casos de uso

- Investigación en aprendizaje contrastive: permite validar funciones de pérdida contrastive (InfoNCE, NT-Xent, etc.) sobre la arquitectura Perceiver sin necesidad de recursos computacionales elevados.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite verificar que un pipeline de entrenamiento (carga de datos, optimizador, checkpoints) funciona correctamente antes de ejecutar experimentos con modelos más grandes.
- Estudio de la arquitectura Perceiver: facilita el análisis del comportamiento de la atención dispersa, la fusión bilineal y la normalización scalenorm en un entorno controlado y de bajo coste.
- Comparación de variantes arquitectónicas: sirve para comparar configuraciones distintas (densa vs. dispersa, fusiones distintas, normalizaciones alternativas) con un presupuesto computacional mínimo.
- Docencia en deep learning: como ejemplo didáctico de atención cruzada y aprendizaje contrastive, puede usarse en cursos universitarios para ilustrar estos conceptos con código ejecutable.
- Base de extensión para investigación: los investigadores pueden modificar el código para añadir innovaciones (p. ej., atención lineal, decodificación especulativa) y probarlas a pequeña escala antes de escalar.
- Validación de integración en herramientas: para comprobar que un sistema de gestión de experimentos (Weights & Biases, MLflow) o de entrenamiento distribuido funciona con un modelo diminuto antes de lanzar trabajos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del repositorio declara explícitamente que el checkpoint incluido no es un modelo entrenado y que no se reclama ninguna puntuación de benchmark en el repositorio.

## Requisitos de hardware

- Con 24.832 parámetros, el modelo ocupa aproximadamente 100 KB en precisión fp32 y unos 50 KB en fp16.
- No se requiere GPU; cualquier CPU moderna es suficiente para inferencia y entrenamiento.
- El uso de VRAM es despreciable (menos de 1 GB incluso con los buffers de PyTorch).
- Para entrenamiento, una GPU de gama de entrada (p. ej., NVIDIA GTX 1650, RTX 3060) o incluso solo CPU es suficiente.
- El despliegue debe hacerse con PyTorch estándar, ya que es una implementación personalizada y no es compatible con vLLM, llama.cpp, Ollama ni TGI sin un adaptador explícito.
- Latencia y throughput: no se han publicado, pero dado el tamaño del modelo, la ejecución es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Estado | Licencia |
|---|---|---|---|
| perceiver-contrastive-small (este modelo) | 24.832 | Inicialización sin entrenar | MIT |
| Perceiver original (DeepMind, 2021) | No disponible | Entrenado, con benchmarks publicados | No disponible |
| Perceiver IO | No disponible | Entrenado, con benchmarks publicados | No disponible |

La comparación con los modelos Perceiver originales de DeepMind es limitada porque esta implementación es un punto de partida sin entrenar, mientras que los originales son modelos entrenados con resultados publicados. La diferencia principal es la escala (24.832 parámetros frente a decenas de millones en los originales) y el estado (inicialización frente a entrenado).

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio. Es un punto de partida experimental, no un modelo de producción.
- No se han publicado resultados de benchmarks; no debe usarse como referencia de rendimiento.
- El modelo no soporta generación de texto, tool calling, agentes ni capacidades multilingües en su estado actual.
- La implementación es personalizada y no se puede cargar con APIs genéricas de HuggingFace (por ejemplo, `AutoModel`); se necesita un adaptador explícito.
- La licencia MIT permite uso comercial, pero el autor recomienda revisar los términos de las fuentes de datos externas si se usan datasets con el repositorio.
- No hay evidencia de entrenamiento en ningún dominio de datos concreto; la arquitectura Perceiver está pensada para datos arbitrarios, pero este checkpoint no ha sido entrenado en ninguno de ellos.
- Los resultados de un futuro entrenamiento deben documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bhatr-eyansh/perceiver-contrastive-small
- Paper original de Perceiver (arXiv): https://arxiv.org/pdf/2103.03206
- Artículo de Perceiver en Wikipedia: https://en.wikipedia.org/wiki/Perceiver
