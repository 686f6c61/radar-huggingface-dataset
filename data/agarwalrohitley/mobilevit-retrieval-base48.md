# agarwalrohitley/mobilevit-retrieval-base48

## Resumen

Este repositorio contiene una implementación personalizada y compacta de **MobileViT** orientada a tareas de *retrieval* (recuperación de imágenes). El autor, agarwalrohitley, la presenta como una base de código para revisión, pruebas de humo y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción. El checkpoint incluido (`model.safetensors`) es únicamente una inicialización válida para verificar que el código funciona, y no ha sido entrenado con ningún conjunto de datos.

La arquitectura sigue los principios de MobileViT, un vision transformer ligero que combina la eficiencia de las CNN con el modelado de contexto global de los transformers, tratando los transformers como convoluciones. Esta implementación concreta utiliza atención *grouped query*, fusión tensorial, activación *approx gelu* y normalización *scalenorm*, bajo una configuración denominada "huge". Con solo 16.576 parámetros, el modelo es extremadamente pequeño y su utilidad práctica se limita al desarrollo y validación de pipelines, no a tareas reales de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (implementación personalizada) |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en MobileViT, un modelo que integra bloques de convolución (estilo MobileNetV2) con bloques transformer ligeros para obtener representaciones globales sin el coste computacional de los ViT estándar. En esta implementación concreta se emplean atención *grouped query*, fusión tensorial, activación *approx gelu* y normalización *scalenorm*. La configuración "huge" es un nombre interno, no un indicador de tamaño real, ya que el modelo tiene solo 16.576 parámetros.

No se proporciona información sobre datos de entrenamiento, número de tokens ni procesos de alineación (RLHF, DPO, etc.). El repositorio incluye una receta por defecto con SGD y *warmup* lineal, pero se indica explícitamente que son valores iniciales del script, no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- No se han demostrado capacidades reales de retrieval, ya que el checkpoint no está entrenado.
- La arquitectura está diseñada para extracción de características de imágenes y búsqueda por similitud, pero requiere un entrenamiento previo con datos etiquetados.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No hay soporte multilingüe ni de visión más allá de la entrada de imágenes (sin capacidades adicionales documentadas).

## Casos de uso

- Pruebas de humo en pipelines de desarrollo: verificar que el código de carga del modelo, la inferencia y el guardado de checkpoints funcionan correctamente.
- Validación de infraestructura de entrenamiento: ejecutar un paso de entrenamiento de prueba para comprobar que el *data loader*, el optimizador y la GPU están bien configurados.
- Experimentos de investigación sobre arquitecturas MobileViT: modificar la implementación y estudiar su comportamiento en tareas de retrieval con datasets pequeños.
- Desarrollo de adaptadores para cargar modelos personalizados: dado que no es compatible con APIs genéricas, sirve para practicar la escritura de adaptadores específicos.
- Benchmarking de rendimiento de código: medir la velocidad de forward/backward en diferentes hardware.
- Educación: como ejemplo didáctico de implementación de un vision transformer ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no es un modelo entrenado. Para una evaluación significativa, se sugiere entrenar el modelo en Flickr30k con al menos tres semillas y comparar con una baseline de capacidad equivalente.

## Requisitos de hardware

- Con solo 16.576 parámetros, el modelo cabe en cualquier GPU o incluso en CPU sin necesidad de VRAM significativa.
- No se requieren GPUs específicas; cualquier hardware moderno es suficiente.
- El despliegue puede realizarse con frameworks estándar de PyTorch, aunque se necesita un adaptador personalizado para cargarlo con APIs genéricas.
- No hay datos de latencia o throughput, pero al ser un modelo minúsculo, la inferencia es prácticamente instantánea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mobilevit-retrieval-base48 (este) | 16.576 | no aplica | Apache-2.0 | Checkpoint sin entrenar |
| MobileViT-S (apple/mobilevit-small) | ~5.6M | no aplica | Apache-2.0 | Preentrenado en ImageNet |
| MobileViT-XS (apple/mobilevit-xs) | ~2.3M | no aplica | Apache-2.0 | Preentrenado en ImageNet |

La comparativa es limitada porque este modelo no está entrenado y su implementación es personalizada. Los modelos oficiales de Apple son preentrenados y tienen capacidades reales de clasificación de imágenes, mientras que este repositorio es solo un esqueleto de código.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No es apto para uso en producción; cualquier resultado obtenido con él carece de validez práctica.
- La implementación es personalizada y no compatible con APIs genéricas de Hugging Face; se requiere un adaptador explícito.
- No hay garantías de rendimiento ni de corrección del código más allá de las pruebas de humo.
- La licencia Apache-2.0 permite uso comercial, pero los términos de los datos externos deben revisarse por separado si se entrena con ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agarwalrohitley/mobilevit-retrieval-base48
- Documentación de MobileViT en Hugging Face: https://huggingface.co/docs/transformers/v4.22.2/model_doc/mobilevit
- Paper original de MobileViT: https://arxiv.org/abs/2110.02178
- Implementación de referencia en MMPretrain: https://github.com/open-mmlab/mmpretrain/blob/main/configs/mobilevit/README.md
