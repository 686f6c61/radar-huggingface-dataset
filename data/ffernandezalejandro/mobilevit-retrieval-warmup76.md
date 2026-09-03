# ffernandezalejandro/mobilevit-retrieval-warmup76

## Resumen

Este repositorio contiene un prototipo de investigación basado en la arquitectura MobileViT orientado a tareas de recuperación (retrieval) de imágenes. Lo publica el usuario ffernandezalejandro en HuggingFace con licencia BSD-3-Clause. El modelo está en escala "nano" y su checkpoint de pesos (`model.safetensors`) es una inicialización válida para pruebas de humo (smoke tests), no un modelo entrenado con resultados verificados. El autor declara explícitamente que no se presentan métricas de rendimiento y que el repositorio documenta formatos y configuraciones por defecto.

La relevancia de este proyecto es metodológica: sirve como punto de partida para experimentar con MobileViT en recuperación, con una configuración reproducible y un script de predicción. Sin embargo, no es un modelo listo para uso práctico, ya que carece de entrenamiento y de evaluación. La arquitectura MobileViT, descrita en el paper original (arXiv:2110.02178), combina eficiencia de redes convolucionales con modelado global de contexto de transformers, pensada para dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (escala nano) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es MobileViT, un vision transformer ligero que integra convoluciones y transformers para procesar información global con bajo coste computacional. En esta implementación concreta, la configuración incluye atención de consultas agrupadas (grouped query attention), fusión de tensores, activación ReLU y normalización por lotes (batch norm). El checkpoint incluido es una inicialización aleatoria, no un modelo entrenado. El autor indica que la receta de entrenamiento por defecto usa el optimizador Adafactor con un programador polinomial, pero estos son valores de partida en el script, no evidencia de una ejecución completada. No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de representaciones visuales: la arquitectura MobileViT está diseñada para extraer características de imágenes, pero este checkpoint concreto no ha sido entrenado, por lo que sus representaciones no son útiles para tareas reales.
- Recuperación de imágenes: el objetivo declarado del proyecto es retrieval, pero sin entrenamiento no hay capacidad efectiva de recuperación.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de visión sin interfaz de lenguaje.
- No hay capacidades multilingües ni de generación de texto.
- El script `predict.py` incluye un ejemplo de prueba de humo, pero requiere un adaptador explícito para cargarse con APIs genéricas.

## Casos de uso

- Experimentación académica: los investigadores pueden usar este repositorio como base para implementar y entrenar un modelo MobileViT de recuperación, partiendo de una configuración reproducible y un checkpoint de inicialización.
- Pruebas de integración: el checkpoint permite verificar que el pipeline de carga, inferencia y guardado funciona correctamente antes de entrenar un modelo real.
- Desarrollo de adaptadores: al ser una implementación personalizada, sirve para practicar la creación de adaptadores que permitan cargar el modelo con librerías estándar como HuggingFace Transformers.
- Comparación de arquitecturas: se puede usar como baseline de capacidad mínima (49.600 parámetros) para comparar con modelos más grandes en tareas de retrieval, siempre que se entrene con los mismos datos.
- Validación de recetas de entrenamiento: el script y la configuración permiten probar diferentes hiperparámetros (Adafactor, programador polinomial) en un entorno controlado.
- Docencia: útil para ilustrar cómo se estructura un proyecto de investigación de modelos de visión, con separación entre configuración, entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado. Para una evaluación significativa, se sugiere usar Flickr30k con al menos tres semillas y una baseline de capacidad equivalente, pero no se aportan datos numéricos.

## Requisitos de hardware

- VRAM estimada: al tener solo 49.600 parámetros, el modelo cabe en cualquier GPU moderna, incluso en CPU. El consumo de memoria es despreciable (menos de 1 MB en precisión float32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una Raspberry Pi podría ejecutar la inferencia, aunque no se ha probado.
- En consumer GPU: sí, cabe en cualquier tarjeta, incluidas las integradas.
- Opciones de despliegue: al ser una implementación personalizada, no se puede usar directamente con vLLM, llama.cpp, Ollama o TGI. Requiere el script `predict.py` o un adaptador propio.
- Latencia y throughput: no disponibles, pero por el tamaño del modelo, la inferencia sería prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible compararlo con alternativas de forma cuantitativa. A nivel arquitectónico, se puede comparar con el MobileViT original (paper arXiv:2110.02178), que tiene versiones de 1.5M a 5.6M de parámetros, pero este prototipo es mucho más pequeño (49.600) y no está entrenado. Otros modelos de retrieval visual como CLIP o DINOv2 tienen millones de parámetros y están preentrenados, pero no son comparables en propósito ni estado. No se incluye tabla comparativa por falta de datos verificados.

## Limitaciones y advertencias

- El checkpoint no está entrenado: es una inicialización aleatoria, por lo que no produce resultados útiles en tareas reales de retrieval.
- No se ha auditado robustez, equidad ni transferencia de dominio; el autor lo advierte explícitamente.
- Riesgo de alucinación: no aplica, al ser un modelo de visión sin generación de texto.
- Limitaciones de contexto: no hay contexto textual; es un modelo puramente visual.
- Restricciones de licencia: BSD-3-Clause permite uso comercial, pero el autor recomienda revisar los términos de los datos externos si se usan conjuntos de datos adicionales.
- Para producción: no es apto. Cualquier resultado de un checkpoint futuro entrenado debe documentarse por separado de los valores por defecto incluidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ffernandezalejandro/mobilevit-retrieval-warmup76
- Paper original de MobileViT: https://arxiv.org/abs/2110.02178
- Documentación de MobileViT en HuggingFace Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/mobilevit.md
- Repositorio similar de referencia: https://huggingface.co/bryanksantoso/retrieval
