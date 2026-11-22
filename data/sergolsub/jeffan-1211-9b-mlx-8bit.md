# sergolsub/jeffan-1211-9B-MLX-8bit

## Resumen

Jeffan-9B-1211-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo tattrongvu/Jeffan-9B-1211, publicada por el usuario sergolsub. El objetivo de esta versión no es otro que permitir la inferencia del modelo original en hardware de Apple Silicon mediante la librería `mlx_lm`, sin reentrenamiento ni cambios en la arquitectura. Se trata, por tanto, de un artefacto de distribución más que de un modelo nuevo: la conversión solo aplica cuantización de 8 bits y preserva la licencia Apache 2.0 del repositorio upstream.

El modelo subyacente tiene 9B parámetros y, según la model card, incorpora un modo de decisión con cabezas específicas (`decision_config.json`, `joint_config.json`) que permiten plantear tareas estructuradas como preguntas de tipo sí/no (`noul`), elección entre categorías (`choice`) y puntuación sobre una escala (`score`). La API pública del cargador `d3_mlx.D3` expone un método `decide()` que recibe un texto y un diccionario de criterios, lo que sugiere un uso orientado a clasificación y enrutamiento más que a generación libre de texto.

La relevancia de esta ficha es doble: por un lado, documenta una conversión MLX con métricas de rendimiento medidas en un Mac mini M4 Pro con 48 GB de memoria unificada; por otro, advierte de que la información disponible sobre el modelo base es muy limitada (sin pipeline declarado, sin idiomas especificados, sin benchmarks publicados en la información accesible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 9B parámetros; la model card no detalla la arquitectura interna) |
| Parametros totales | 9B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el repositorio upstream probablemente ofrece bf16, pero no se detalla |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo upstream) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json`, `joint_config.json` y scripts `*_mlx.py` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base tattrongvu/Jeffan-9B-1211: no se especifica si es un transformer decoder-only denso, un MoE o un modelo híbrido, ni se detallan la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Lo único confirmado es el tamaño de 9B parámetros y la existencia de un modo de decisión con cabezas especializadas que el cargador `d3_mlx.D3` utiliza para resolver tareas estructuradas.

La conversión a MLX 8-bit no introduce cambios arquitectónicos ni reentrenamiento: se limita a cuantizar los pesos para su ejecución en Apple Silicon. La model card reporta que la calidad se mantiene prácticamente idéntica tras la cuantización, con una perplejidad de calibración de 1.768 en 8 bits frente a 1.765 en bf16, y métricas de evaluación idénticas en accuracy (88,6 %), noul (84,6 %), choice (88,0 %) y score (95,8 %).

## Capacidades

- Modo de decisión estructurada con tres tipos de tarea: `noul` (pregunta binaria sí/no), `choice` (selección entre categorías definidas por el usuario) y `score` (puntuación sobre una escala de criterios ordenados).
- Clasificación y enrutamiento de texto: la API `decide()` permite asignar un texto de entrada a un equipo, una severidad o una intención concreta.
- Procesamiento de conversaciones de atención al cliente: los ejemplos de la model card incluyen cobros duplicados, pedidos con tracking estancado y errores de cuota de disco.
- Generación de texto libre: no confirmada explícitamente en la información disponible; el foco de la model card está en el modo de decisión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales: modo de decisión con cabezas conjuntas (`joint_config.json`), plantilla de chat (`chat_template.jinja`) y scripts de inferencia específicos para MLX.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede recibir el texto de una incidencia y decidir a qué equipo derivarla (por ejemplo, `billing` o `shipping`) mediante una tarea `choice` con criterios definidos. Es adecuado porque la API `decide()` devuelve directamente la categoría elegida sin necesidad de postprocesar texto libre.
- Clasificación binaria de intenciones: con tareas `noul` se puede preguntar si el cliente solicita un reembolso, si el mensaje contiene una queja o si requiere intervención humana. La latencia medida de 826 ms (mediana) y 2,09 decisiones cortas por segundo en un Mac mini M4 Pro es suficiente para flujos interactivos.
- Priorización de incidencias: mediante tareas `score` con criterios como `cosmetic`, `annoying` o `blocks`, el modelo asigna una severidad a errores técnicos (por ejemplo, fallos de exportación por cuota de disco) y permite ordenar la cola de trabajo.
- Moderación y triaje de contenido: la misma mecánica de `choice` y `score` sirve para clasificar mensajes según políticas internas antes de que lleguen a un revisor humano.
- Automatización de back-office en Apple Silicon: al ejecutarse con MLX sobre memoria unificada (9,24 GB de pico residente), el modelo cabe en un Mac mini M4 Pro de 48 GB y evita depender de GPUs dedicadas para tareas de clasificación por lotes.
- Prototipado local de pipelines de decisión: el cargador `d3_mlx.D3` y los ficheros `decision_config.json` y `joint_config.json` permiten integrar el modelo en scripts Python sin infraestructura de servido, útil para pruebas de concepto y validación de criterios antes de desplegar en producción.

## Benchmarks y rendimiento

La model card reporta métricas de calidad y de rendimiento medidas por el autor de la conversión en un Mac mini M4 Pro con 48 GB de memoria unificada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | 8 bits (MLX) | bf16 (referencia) |
|---|---|---|
| Accuracy | 88,6 % | 88,6 % |
| Noul | 84,6 % | 84,6 % |
| Choice | 88,0 % | 88,0 % |
| Score | 95,8 % | 95,8 % |
| Perplejidad de calibración | 1,768 | 1,765 |

| Metrica de sistema | Valor |
|---|---|
| Tamano en disco | 8,43 GB |
| Tiempo de carga | 4,24 s |
| Memoria residente pico | 9,24 GB |
| Latencia mediana de decisión | 826 ms |
| Throughput sostenido | 2,09 decisiones cortas/s |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,24 GB de pico residente medidos en MLX 8-bit; el tamaño en disco es de 8,43 GB.
- Hardware de referencia: Mac mini M4 Pro con 48 GB de memoria unificada, con tiempo de carga de 4,24 s.
- GPU dedicadas: no aplicable; el formato MLX está pensado para Apple Silicon. No se dispone de datos para A100, H100 o RTX 4090 en esta conversión.
- GPU de consumo: cualquier Mac con Apple Silicon y al menos 16 GB de memoria unificada debería poder cargar los 8,43 GB de pesos, aunque no se han publicado medidas en configuraciones distintas a la de referencia.
- Opciones de despliegue: `mlx_lm` y el cargador propio `d3_mlx.D3` incluido en el repositorio. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 826 ms por decisión y 2,09 decisiones cortas por segundo en el hardware de referencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoría (clasificadores de decisión de 9B parámetros) que permitan una comparación rigurosa. Como referencia estructural, el modelo base tattrongvu/Jeffan-9B-1211 es el punto de comparación natural frente a esta conversión MLX 8-bit, con métricas de calidad equivalentes según la model card.

## Limitaciones y advertencias

- La información sobre el modelo base es muy escasa: no se declaran idiomas, contexto, arquitectura ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (22 de noviembre de 2026), sin historial de uso que respalde su robustez.
- Las métricas de calidad reportadas (accuracy, noul, choice, score) proceden de la evaluación del propio autor de la conversión; no se especifica el conjunto de evaluación ni su tamaño, por lo que no son verificables de forma independiente.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos conocidos.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto máxima y los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card indica que, en caso de conflicto, prevalece la licencia del repositorio upstream (tattrongvu/Jeffan-9B-1211).
- El formato MLX limita el despliegue a Apple Silicon; no hay evidencia de compatibilidad con ecosistemas CUDA ni con servidores de inferencia estándar.
- La API de decisión requiere definir criterios explícitos (`noul`, `choice`, `score`) y no se documenta su comportamiento ante entradas ambiguas o fuera de distribución.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/sergolsub/jeffan-1211-9B-MLX-8bit
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-9B-1211
- Librería MLX: no se proporciona enlace en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
