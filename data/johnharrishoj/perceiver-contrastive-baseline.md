# johnharrishoj/perceiver-contrastive-baseline

## Resumen

Este repositorio aloja un prototipo de investigación de arquitectura Perceiver orientado a aprendizaje contrastivo (contrastive learning). Lo publica el usuario johnharrishoj y se presenta como un punto de partida experimental, no como un modelo entrenado y validado. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, pero el propio autor advierte que no debe interpretarse como un modelo con rendimiento demostrado.

El modelo tiene 33.088 parámetros en total, lo que lo sitúa en una escala extremadamente pequeña, más cercana a un juguete de investigación que a un sistema utilizable en producción. Su relevancia actual es limitada y se circunscribe al ámbito académico o de exploración de arquitecturas. La licencia Apache 2.0 permite su uso y modificación, pero el autor recomienda revisar los términos de los datos externos si se emplea con conjuntos de datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención multi-query, fusión Tucker, activación Mish, normalización BatchNorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un diseño que utiliza una atención cruzada para procesar entradas de alta dimensionalidad (como imágenes o secuencias largas) mediante un conjunto fijo de latentes. En esta implementación concreta, la atención es de tipo multi-query, la fusión de características se realiza mediante descomposición Tucker, la activación es Mish y la normalización es BatchNorm. El autor indica que la configuración registrada en `config.json` corresponde a una escala "large", aunque el número de parámetros (33K) sugiere que se trata de una escala muy reducida en la práctica.

No hay información sobre datos de entrenamiento, número de tokens, ni técnicas como RLHF o DPO. El checkpoint incluido es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado. El script `inference.py` contiene un ejemplo ejecutable y un punto de entrada de entrenamiento, pero no se reporta ningún resultado de entrenamiento completado.

## Capacidades

- No se documentan capacidades funcionales verificadas (generación de texto, razonamiento, código, etc.).
- El modelo está diseñado como un prototipo para experimentación con aprendizaje contrastivo, pero no se aportan resultados que demuestren su funcionamiento en tareas concretas.
- No hay soporte declarado para tool calling, agentes, ni capacidades multimodales.
- No se especifican idiomas soportados.
- El autor sugiere que la primera evaluación útil consistiría en usar un conjunto de validación específico de la tarea, reportar la métrica con al menos tres semillas e incluir una línea base de capacidad comparable.

## Casos de uso

- Investigación académica de arquitecturas Perceiver: el modelo sirve como base para estudiar el comportamiento de la atención multi-query y la fusión Tucker en tareas de representación contrastiva, sin pretensiones de rendimiento.
- Pruebas de humo en pipelines de entrenamiento: el checkpoint de inicialización permite verificar que el código de entrenamiento y las rutas de datos funcionan correctamente antes de lanzar experimentos completos.
- Desarrollo de adaptadores para carga automática: dado que es una implementación personalizada, puede usarse para escribir adaptadores que permitan integrar esta arquitectura en frameworks estándar.
- Comparación de configuraciones de normalización y activación: al ser un modelo minúsculo, permite probar variantes de arquitectura con coste computacional despreciable.
- Formación en aprendizaje contrastivo: como ejemplo didáctico de cómo estructurar un experimento con una línea base de capacidad equivalente y control de semillas.
- Exploración de fusión Tucker en atención: el código puede servir para estudiar cómo afecta esta técnica de fusión a la calidad de las representaciones aprendidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de referencia en este repositorio. El checkpoint es una inicialización, no un modelo entrenado.

## Requisitos de hardware

- Dado el tamaño de 33.088 parámetros, el modelo cabe en cualquier CPU moderna y en cualquier GPU, incluso en las más modestas. La VRAM necesaria es inferior a 1 MB.
- No se requieren GPUs específicas; una CPU convencional es suficiente para inferencia y entrenamiento.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.). Al ser una implementación personalizada, no es compatible con cargadores automáticos sin un adaptador.
- La latencia y el throughput son irrelevantes en la práctica por el tamaño minúsculo del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El repositorio no referencia otros modelos y no hay datos de rendimiento que permitan establecer comparaciones. Existen otros repositorios con nombres similares (por ejemplo, `anilpatelner/perceiver-contrastive` y `ngoziojo/perceiver-contrastive-2024`), pero no se ha verificado su contenido ni su relación con este modelo. No se puede ofrecer una comparativa rigurosa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio. El autor lo califica como un punto de partida experimental.
- No se han evaluado sesgos ni riesgos de alucinación. Al ser un modelo sin entrenamiento, no genera texto útil.
- No hay información sobre limitaciones de contexto o idioma.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que deben revisarse los términos de los datos fuente si se usan conjuntos de datos externos.
- Para producción no es adecuado: no hay capacidades demostradas y el tamaño es insuficiente para tareas reales.
- La integración con APIs automáticas requiere un adaptador explícito por ser una implementación personalizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/johnharrishoj/perceiver-contrastive-baseline
- Repositorios similares encontrados en la búsqueda web (no verificados):
  - https://huggingface.co/anilpatelner/perceiver-contrastive
  - https://huggingface.co/ngoziojo/perceiver-contrastive-2024
- Artículo relacionado con aprendizaje contrastivo (no específico de este modelo): https://arxiv.org/html/2206.09753v3
