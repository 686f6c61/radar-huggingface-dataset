# IndependentMonarch/tool-selection-bi-encoders

## Resumen

El repositorio `IndependentMonarch/tool-selection-bi-encoders` contiene un conjunto de bi-encoders diseñados para la selección de herramientas (tool selection) en sistemas de agentes basados en modelos de lenguaje. Desarrollado por el usuario IndependentMonarch, este proyecto aborda el problema de elegir, entre un conjunto de herramientas candidatas, cuál debe invocarse en respuesta a una consulta de usuario. La solución propuesta consiste en entrenar un bi-encoder específico para cada par `(model_id, dataset_id)`, de modo que cada uno aprende a puntuar la relevancia de las herramientas para un modelo base y un conjunto de datos concretos.

Cada bi-encoder toma el estado oculto del modelo base en una capa determinada (parámetro `best_layer`) en la posición final del turno de usuario, y lo proyecta a un espacio de menor dimensión mediante una transformación lineal. Las herramientas se representan mediante el estado oculto del modelo base en la capa 24, aplicando mean-pooling sobre un texto canónico que describe nombre, descripción y parámetros de la función. La puntuación final es el producto escalar normalizado entre la representación de la consulta y la de cada herramienta, seleccionándose la de mayor similitud.

El repositorio tiene un tamaño de 0,1 GB y contiene los pesos de las proyecciones en formato `safetensors` junto con archivos de configuración JSON. No se proporcionan detalles sobre el modelo base, el número total de parámetros, la licencia o los idiomas soportados, por lo que estos aspectos quedan sin especificar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder con dos proyecciones lineales (`h_proj` y `t_proj`) sobre estados ocultos de un modelo base, normalización L2 y temperatura aprendible |
| Parametros totales | no disponible (cada bi-encoder contiene solo las proyecciones; el tamaño del repo es 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base utilizado) |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en `safetensors` sin cuantización explícita) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (archivo `bi_encoder.safetensors`) y `config.json` |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura de bi-encoder clásica. Cada bi-encoder consta de dos capas lineales: `h_proj` que proyecta el estado oculto de la consulta (dimensión `hidden_dim`) a un espacio de proyección `proj_dim`, y `t_proj` que proyecta la representación de la herramienta (dimensión `tool_dim`) al mismo espacio. Ambas salidas se normalizan con norma L2, y se incluye un parámetro escalar `log_temp` que ajusta la temperatura de la puntuación. La puntuación entre una consulta y una herramienta se calcula como el producto escalar de sus representaciones normalizadas.

El entrenamiento se realiza de forma independiente para cada combinación de modelo base y dataset, lo que sugiere un ajuste específico para optimizar la selección de herramientas en cada contexto. No se dispone de información sobre el volumen de datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El código de inferencia muestra que las herramientas se codifican mediante el estado oculto del modelo base en la capa 24, con mean-pooling sobre un texto canónico que incluye nombre, descripción y claves de parámetros. La capa de consulta (`best_layer`) se define en la configuración y corresponde a la posición final del turno de usuario.

## Capacidades

- Selección de herramientas (tool selection) basada en similitud coseno entre representaciones de consulta y herramientas.
- Soporte para múltiples modelos base: cada bi-encoder está asociado a un `model_id` concreto.
- Adaptación por dataset: existe un bi-encoder distinto para cada `dataset_id`, lo que permite ajustar la selección a dominios específicos.
- Inferencia eficiente: las proyecciones son lineales y de baja dimensión, lo que reduce el coste computacional frente a métodos que requieren interacción completa entre consulta y herramienta.
- Integración sencilla con modelos de lenguaje existentes: el código de ejemplo muestra cómo cargar el bi-encoder y usarlo con `transformers`.
- No se mencionan capacidades de generación de texto, razonamiento, visión u otras; el modelo es exclusivamente un módulo de selección.

## Casos de uso

- Agentes conversacionales con function calling: el bi-encoder permite decidir qué herramienta invocar en cada turno, puntuando las opciones disponibles según la consulta del usuario.
- Optimización de pipelines de RAG: cuando un sistema de recuperación necesita elegir entre varias herramientas de búsqueda o procesamiento, el bi-encoder puede priorizar la más adecuada.
- Personalización por dominio: al existir bi-encoders entrenados por dataset, se puede desplegar el modelo en entornos específicos (por ejemplo, atención al cliente, soporte técnico) con mayor precisión.
- Reducción de latencia en selección de herramientas: al usar proyecciones lineales y similitud coseno, la inferencia es rápida y adecuada para sistemas en tiempo real.
- Integración en frameworks de agentes: el modelo puede conectarse a bibliotecas como LangChain o LlamaIndex para reemplazar heurísticas de selección por una puntuación aprendida.
- Evaluación de herramientas en entornos de prueba: los bi-encoders pueden utilizarse para comparar la relevancia de distintas herramientas antes de integrarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, por lo que los bi-encoders individuales son ligeros y caben en cualquier sistema con almacenamiento mínimo.
- Para la inferencia se requiere un modelo base capaz de producir estados ocultos (no incluido en el repositorio). La VRAM necesaria depende de ese modelo base; los bi-encoders en sí solo añaden unas pocas capas lineales.
- GPU recomendadas: cualquier GPU que pueda ejecutar el modelo base (por ejemplo, RTX 3090, A100, H100, según el tamaño del modelo base).
- Opciones de despliegue: el código de ejemplo usa `transformers` y `safetensors`, por lo que puede integrarse en entornos Python con PyTorch. También es posible exportar las proyecciones a otros formatos si se requiere.
- Latencia y throughput: no disponibles; dependen del modelo base y del número de herramientas candidatas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que se trata de un módulo auxiliar de selección de herramientas, no existen datos públicos que permitan una comparación directa con alternativas como clasificadores de intención o métodos de reranking.

## Limitaciones y advertencias

- Dependencia del modelo base: el bi-encoder requiere estados ocultos de un modelo específico; no es autónomo y no puede usarse sin ese modelo.
- Licencia no especificada: al no indicarse la licencia, el uso comercial puede estar restringido o ser incierto.
- Sin información sobre sesgos o alucinaciones: al ser un módulo de selección, no genera texto, pero la calidad de la selección depende de la representación del modelo base, que puede arrastrar sesgos.
- Sin benchmarks publicados: no hay evidencia empírica del rendimiento en tareas reales.
- Proyecto reciente y sin adopción: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Limitación de contexto: la longitud de contexto no está definida; depende del modelo base y del truncamiento aplicado al texto canónico de las herramientas (`tool_max_tokens`).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/IndependentMonarch/tool-selection-bi-encoders
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion disponible.
