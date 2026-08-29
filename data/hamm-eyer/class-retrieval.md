# hamm-eyer/class-retrieval

## Resumen

El modelo `hamm-eyer/class-retrieval` es un checkpoint experimental de inicialización basado en la arquitectura Beit, orientado a tareas de retrieval. Desarrollado por el usuario hamm-eyer, se presenta como un código base mínimo para inspeccionar cambios arquitectónicos antes de un entrenamiento completo. El repositorio incluye un script Python, configuración de arquitectura, argumentos de entrenamiento y un checkpoint `model.safetensors` de 16.576 parámetros, que no ha sido entrenado ni evaluado.

Este modelo no resuelve ningún problema práctico por sí mismo, ya que su checkpoint es únicamente válido para pruebas de humo (smoke tests) y no se reivindica ningún resultado de benchmark. Su relevancia radica en servir como punto de partida para investigar arquitecturas de retrieval basadas en Beit, con atención sparse, fusión gated y normalización por batchnorm. La licencia Apache 2.0 permite su uso y modificación, pero cualquier aplicación en producción requeriría un entrenamiento completo y una evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Beit (Vision Transformer) |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Beit, un transformer para visión con atención sparse, fusión gated, activación GELU tanh y normalización por batchnorm. La configuración es de escala "tiny", lo que explica el reducido número de parámetros. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas como RLHF o DPO. El checkpoint incluido es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado. El repositorio incluye un `config.json` con la configuración generada y un `training_args.json` con la receta experimental por defecto (SGD con schedule coseno), pero estos valores son solo puntos de partida, no evidencia de un entrenamiento completado.

## Capacidades

- No se han documentado capacidades funcionales verificadas, ya que el checkpoint no está entrenado.
- El modelo está diseñado para tareas de retrieval, pero sin entrenamiento no puede realizar ninguna tarea real.
- No soporta generación de texto, razonamiento, código, matemáticas, visión (más allá de la arquitectura base), tool calling, agentes ni capacidades multilingües.
- La arquitectura Beit sugiere que, tras un entrenamiento adecuado, podría utilizarse para retrieval de imágenes o texto, pero esto es hipotético.
- No hay soporte para modos especiales como thinking mode, visión o audio.

## Casos de uso

No se han documentado casos de uso prácticos y realistas, dado que el modelo es un checkpoint de inicialización sin entrenamiento. Las siguientes viñetas describen posibles direcciones de investigación, no aplicaciones listas para producción:

- Investigación experimental: utilizar el código base para probar variaciones de la arquitectura Beit en tareas de retrieval, por ejemplo con el dataset Flickr30k, como sugiere la guía de evaluación del autor.
- Desarrollo de adaptadores: dado que es una implementación personalizada, se puede usar para crear adaptadores que permitan cargar el modelo con APIs genéricas.
- Pruebas de humo: verificar que el pipeline de entrenamiento e inferencia funciona correctamente antes de lanzar un entrenamiento a gran escala.
- Estudio de atención sparse: analizar el comportamiento de la atención sparse en retrieval, comparando con baselines de capacidad equivalente.
- Evaluación de fusión gated: investigar cómo la fusión gated afecta a la calidad de los embeddings de retrieval.
- Benchmarking de normalización: comparar el uso de batchnorm frente a otras técnicas de normalización en arquitecturas de retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reivindica ninguna puntuación y que el checkpoint no es un checkpoint entrenado. Para una evaluación significativa, se recomienda entrenar el modelo y compararlo con baselines de capacidad equivalente en datasets como Flickr30k, reportando la métrica de la tarea en al menos tres semillas.

## Requisitos de hardware

- Dado el tamaño de 16.576 parámetros, la inferencia es posible en cualquier hardware, incluyendo CPU y GPUs de gama baja.
- La VRAM estimada es inferior a 1 GB, por lo que cabe en cualquier GPU consumer (por ejemplo, GTX 1060, RTX 2060, etc.).
- No se dispone de datos oficiales sobre latencia o throughput, pero al ser un modelo tan pequeño, se espera una ejecución casi instantánea.
- Opciones de despliegue: al ser una implementación personalizada, no se puede usar directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. El script `main.py` incluye un ejemplo de ejecución.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de retrieval de la misma categoría. El modelo es un checkpoint experimental sin entrenamiento, por lo que no hay datos de rendimiento que comparar. Se podría comparar con otros modelos Beit de tamaño similar, pero no se han encontrado referencias concretas en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se conocen sesgos específicos, pero al ser una inicialización aleatoria, no se puede garantizar ningún comportamiento.
- El riesgo de alucinación no aplica, ya que el modelo no genera texto.
- No hay limitaciones de contexto o idioma documentadas, pero al ser un modelo de visión, no procesa lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es útil para producción sin un entrenamiento completo.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado de los valores predeterminados incluidos en el repositorio.
- Es necesario revisar los términos de los datos externos si se utiliza con datasets como Flickr30k.

## Enlaces

- [HuggingFace: hamm-eyer/class-retrieval](https://huggingface.co/hamm-eyer/class-retrieval)
