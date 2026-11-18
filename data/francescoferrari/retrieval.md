# francescoferrari/retrieval

## Resumen

`francescoferrari/retrieval` es un prototipo de investigación publicado en Hugging Face por el usuario francescoferrari bajo el identificador "Tiny Transformer for Retrieval". No se trata de un modelo entrenado ni evaluado, sino de un esqueleto reproducible: el autor lo describe explícitamente como un punto de partida experimental para tareas de recuperación (retrieval), con una implementación propia en Python (`predict.py`) y un checkpoint de inicialización válido únicamente para pruebas de humo.

El modelo emplea una arquitectura denominada "Tiny Transformer" a escala "large" según su `config.json`, con atención de tipo flash, fusión de bajo rango (low rank fusion), activación ReLU y normalización InstanceNorm. El recuento real de parámetros en los pesos safetensors es de 16.576, un tamaño extremadamente reducido que lo sitúa muy por debajo de cualquier modelo de retrieval operativo (típicamente entre 100M y 7B de parámetros).

Su relevancia es limitada y estrictamente académica: sirve como plantilla para experimentos controlados de recuperación multimodal (la evaluación sugerida es Flickr30k), no como componente listo para producción. El repositorio no declara métricas, no incluye datos de entrenamiento y no documenta idiomas soportados. Cualquier uso real requiere entrenamiento previo y validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención flash, fusión low rank, activación ReLU, InstanceNorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala "large" según la configuración generada, con atención flash, fusión de bajo rango, activación ReLU y normalización InstanceNorm. El checkpoint `model.safetensors` contiene 16.576 parámetros y, según la model card, es únicamente una inicialización válida para pruebas de humo, no un modelo entrenado. La implementación es personalizada (`predict.py`), por lo que las APIs genéricas de carga automática requieren un adaptador explícito.

No se documenta ningún proceso de entrenamiento completado: la receta por defecto en `training_args.json` usa el optimizador Lion con un schedule coseno, pero el autor aclara que son valores de partida del script y no evidencia de una ejecución real. No se especifican tokens de entrenamiento, composición del dataset, ni etapas de RLHF o DPO. La evaluación sugerida por el autor es Flickr30k, con métrica de tarea reportada en al menos tres semillas y una línea base de capacidad equivalente.

## Capacidades

- No se declaran capacidades funcionales verificadas; el modelo no ha sido entrenado.
- Tarea objetivo declarada: recuperación (retrieval), presumiblemente texto-imagen dado que la evaluación sugerida es Flickr30k.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Pruebas de humo de pipelines de retrieval: el checkpoint de inicialización permite verificar que el código de carga, preprocesado e inferencia funciona antes de entrenar un modelo real.
- Plantilla de experimentación académica: sirve como base reproducible para comparar recetas de entrenamiento (Lion + coseno frente a alternativas) con presupuesto y semillas controladas.
- Benchmarking de infraestructura: su tamaño de 16.576 parámetros permite validar entornos de despliegue y scripts de evaluación sin coste computacional significativo.
- Docencia y formación: útil para explicar la estructura de un transformer de retrieval y el flujo de un experimento con `config.json` y `training_args.json`.
- Desarrollo de adaptadores de carga personalizados: al requerir un adaptador explícito, sirve para practicar la integración de implementaciones no estándar en frameworks de inferencia.
- Reproducción de líneas base en Flickr30k: el autor propone esta evaluación como primer paso para obtener resultados comparables con una línea base de capacidad equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 16.576 parámetros, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU (incluidas integradas) es suficiente para ejecutar el checkpoint de inicialización.
- Cabe en consumer GPU: sí, en cualquier modelo (RTX 4090, RTX 3060, GTX 1650, etc.) y también en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la implementación es un script Python propio (`predict.py`) que requiere adaptador para APIs genéricas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. El modelo no es comparable con sistemas de retrieval operativos (por ejemplo, CLIP o modelos de embeddings entrenados) porque carece de entrenamiento y de métricas publicadas. La única referencia interna es la evaluación sugerida en Flickr30k contra una línea base de capacidad equivalente, sin resultados numéricos.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles para retrieval real.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según reconoce el autor.
- No se declaran idiomas soportados ni cobertura lingüística.
- No se documenta longitud de contexto, por lo que se desconoce su comportamiento en secuencias largas.
- Riesgo de alucinación y sesgos: no evaluados; al no estar entrenado, no aplica una evaluación estándar, pero tampoco existe garantía alguna.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantía; deben revisarse por separado los términos de los datos externos que se usen con el repositorio.
- Implementación personalizada: las APIs automáticas de carga requieren un adaptador explícito, lo que añade fricción de integración.
- No apto para producción sin entrenamiento, evaluación multilla y validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/francescoferrari/retrieval
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados al modelo.
