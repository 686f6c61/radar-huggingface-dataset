# sergolsub/mlx-onejev-v1.5-9B

## Resumen

OneJev 1.5 9B (MLX 8-bit) es una conversión cuantizada a 8 bits en formato MLX del modelo OmniJev/OneJev1.5-9B, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales se han convertido a 8 bits sin cambios de arquitectura ni de licencia, que se mantiene en Apache 2.0 heredada del repositorio upstream.

El modelo base pertenece a la familia Qwen3.5 (etiqueta `qwen3_5` en Hugging Face) y cuenta con 9.409.813.744 parámetros totales, lo que lo sitúa en la franja de los 9B. Su rasgo diferencial no es la generación de texto libre, sino una interfaz de decisión estructurada: el modelo expone llamadas `decide()` que resuelven tareas de tipo binario (`noul`), elección entre criterios (`choice`) y puntuación ordinal (`score`), además de procesar entradas de imagen de 512x512 junto con texto.

La relevancia de esta ficha radica en que el autor publica métricas de calidad de cuantización poco habituales (KL por tensor frente a bf16, perplejidad de calibración y latencias medidas en un Mac mini M4 Pro), lo que permite evaluar con datos concretos el coste real de pasar de bf16 a 8 bits y a 4 bits en hardware de consumo. El repositorio ocupa 11,4 GB en disco y alcanza un pico de memoria residente de 12,21 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta `qwen3_5`), con cabecera de decisión adicional; atención lineal presente en la capa 0 (`linear_attn.in_proj_a`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta versión); existe una variante 4 bits del mismo autor; el original está en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo upstream) |
| Formato de pesos | safetensors en layout MLX (3 shards: 4,03 GB + 4,04 GB + 3,32 GB), más `config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo original: no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se deduce de los ficheros publicados es una arquitectura transformer de la familia Qwen3.5 con atención lineal en al menos la primera capa, y una capa de salida orientada a decisión estructurada en lugar de (o además de) la generación autoregresiva clásica. El repositorio incluye `decision_config.json`, `joint_config.json` y un módulo `onejev_mlx.py` de 19 KB que actúa como glue de inferencia para la cabecera de decisión.

La contribución técnica de esta versión concreta es la cuantización a 8 bits en MLX, sin reentrenamiento ni cambios de arquitectura. El autor documenta una auditoría de calidad a nivel de tensor: se compararon 760 tensores, con un KL medio de 2,17e-04 y un máximo de 5,65e-03, concentrado en `model.language_model.layers.0.linear_attn.in_proj_a.weight`. La perplejidad de calibración pasa de 1,988 en bf16 a 1,985 en 8 bits, y el KL de salida sobre las probabilidades de decisión es de 2,06e-04 de media (p95 7,38e-04, máximo 2,25e-03) sobre 100 filas de evaluación.

## Capacidades

- Decisión binaria (`noul`): responde preguntas de sí/no con instrucciones en lenguaje natural, por ejemplo si un cliente solicita un reembolso.
- Elección entre criterios (`choice`): clasifica una entrada en una de varias categorías definidas por el usuario, como asignar un ticket al equipo de facturación o al de envíos.
- Puntuación ordinal (`score`): asigna una entrada a un nivel dentro de una escala definida, por ejemplo gravedad cosmética, molesta o bloqueante.
- Procesamiento de imagen: acepta entradas de 512x512 combinadas con texto; la latencia medida es de aproximadamente 2,3 s frente a 1,4 s en modo solo texto.
- Generación de texto: el modelo base es un LLM Qwen3.5 de 9B, por lo que conserva las capacidades textuales del upstream, aunque la model card de esta conversión se centra en el modo decisión.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en los metadatos.
- Detección de cajas (bounding boxes): no soportada, según la model card ("Box: not supported").

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y devuelve una decisión `choice` sobre el equipo responsable (facturación, envíos, técnico). Con una latencia mediana de 1650 ms y 0,79 decisiones cortas por segundo en un M4 Pro, es adecuado para clasificación en segundo plano, no para atención interactiva en tiempo real.
- Detección de solicitudes de reembolso: mediante una decisión `noul`, se puede encaminar automáticamente a un flujo de devolución solo los mensajes que expresan intención de reembolso, reduciendo la carga de revisión manual.
- Priorización de incidencias: con una decisión `score` sobre una escala de gravedad (cosmética, molesta, bloqueante), el modelo permite ordenar una cola de errores de producción antes de que los revise un humano.
- Moderación o validación de contenido con imagen: la entrada combinada de imagen 512x512 y texto permite clasificar capturas de pantalla o adjuntos enviados por usuarios dentro de un flujo de decisión, con un coste de unos 2,3 s por elemento.
- Enrutamiento en pipelines de soporte interno: integrado como paso previo a un sistema de ticketing, el modelo decide la categoría y la severidad, y el sistema resultante aplica reglas de SLA según la salida.
- Procesamiento local en equipos Apple: al requerir 12,21 GB de memoria residente y cargar en 3,82-5,09 s, encaja en estaciones de trabajo con Apple Silicon para tareas de clasificación por lotes sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el conjunto de evaluación, los scripts de auditoría KL y las checksums, lo que permite reproducir la comparación 8 bits frente a bf16 y 4 bits en el mismo hardware.

## Benchmarks y rendimiento

El autor publica una evaluación propia de precisión sobre decisiones, no benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son los siguientes:

| Version | Precision | noul | choice | score | PPL | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 84,4% | 87,5% | 80,0% | 84,0% | 1,988 | referencia | 18,84 GB | 747 ms |
| 8 bits (esta versión) | 83,3% | 87,5% | 80,0% | 80,0% | 1,985 | 2,06e-04 | 11,4 GB | 1650 ms |
| 4 bits | 84,4% | 90,0% | 80,0% | 80,0% | 2,055 | 1,34e-02 | 7,43 GB | 1591 ms |

Mediciones de rendimiento en Mac mini M4 Pro de 48 GB con MLX 8 bits:

| Metrica | Valor |
|---|---|
| Carga del modelo | 3,82 s (medición de disco) / 5,09 s (medición estándar) |
| Pico de memoria residente | 12,21 GB |
| Texto 512 tokens (492 tok), media de 5 tras 3 de calentamiento | binario 1425 ms · elección múltiple 1427 ms · score 1427 ms |
| Imagen 512x512 + texto | binario 2327 ms · elección múltiple 2328 ms · score 2328 ms |
| Latencia de decisión | mediana 1650 ms · 0,79 decisiones cortas sostenidas por segundo |

KL de salida por fila (en nats, sobre las filas respondidas por ambas versiones): original a 8 bits, media 2,06e-04, p95 7,38e-04, máximo 2,25e-03; 8 bits a 4 bits, media 1,37e-02, p95 4,69e-02, máximo 1,04e-01; original a 4 bits, media 1,34e-02, p95 5,16e-02, máximo 9,30e-02.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 12,21 GB de pico residente medidos para la versión de 8 bits; el original en bf16 ocupa 18,84 GB en disco y la versión de 4 bits 7,43 GB.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada, con las latencias indicadas arriba.
- GPU NVIDIA: no disponible; esta conversión es específica de MLX y no se ha validado en CUDA.
- GPU de consumo: el modelo de 8 bits (11,4 GB en disco) encaja en equipos Apple Silicon con al menos 16 GB de memoria unificada, aunque el pico medido de 12,21 GB deja poco margen; la variante de 4 bits (7,43 GB) es más holgada.
- Opciones de despliegue: `mlx_lm` y el cargador propio `onejev_mlx.py` incluido en el repositorio. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 0,79 decisiones cortas por segundo de forma sostenida en el M4 Pro de 48 GB; la latencia mediana de decisión es de 1650 ms.
- Nota de rendimiento: la versión de 8 bits es más lenta que el original bf16 (1650 ms frente a 747 ms de mediana) en el mismo equipo, según los datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (eval del autor) | Licencia | Formato / hardware |
|---|---|---|---|---|---|
| OneJev 1.5 9B (bf16, upstream) | 9,41B | no disponible | 84,4% | Apache 2.0 | safetensors bf16, 18,84 GB |
| OneJev 1.5 9B MLX 8 bits (esta versión) | 9,41B | no disponible | 83,3% | Apache 2.0 | safetensors MLX, 11,4 GB, Apple Silicon |
| OneJev 1.5 9B MLX 4 bits | 9,41B | no disponible | 84,4% | Apache 2.0 | safetensors MLX, 7,43 GB, Apple Silicon |

No se dispone de datos de benchmarks estándar ni de comparaciones con otras familias de modelos (Qwen, Llama, Mistral) en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación: no evaluado en la información disponible; el modo decisión mitiga parcialmente este riesgo al restringir la salida a categorías predefinidas, pero no lo elimina.
- Idiomas soportados: no declarados; no se puede garantizar un rendimiento correcto fuera del inglés, idioma de los ejemplos de la model card.
- Longitud de contexto: no disponible, lo que impide planificar su uso con documentos largos.
- La cuantización a 8 bits degrada ligeramente la precisión global (83,3% frente a 84,4%) y la métrica `score` (80,0% frente a 84,0%), aunque `noul` y `choice` se mantienen.
- La versión de 8 bits es más lenta que el original bf16 en el hardware medido (1650 ms frente a 747 ms de latencia mediana); si la latencia es crítica, conviene evaluar la variante de 4 bits, que además ocupa menos disco.
- Las cajas delimitadoras (bounding boxes) no están soportadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor indica que prevalece la licencia del repositorio upstream en caso de conflicto.
- El repositorio tiene 331 descargas y 0 likes en el momento de la consulta, y no hay pipeline declarado; se trata de una conversión de un tercero, no de un modelo oficial, por lo que conviene validar el comportamiento en el caso de uso concreto antes de llevarlo a producción.

## Enlaces

- Repositorio de esta versión: https://huggingface.co/sergolsub/mlx-onejev-v1.5-9B
- Modelo base (upstream): https://huggingface.co/OmniJev/OneJev1.5-9B
- Versión MLX 8 bits (referenciada en la tabla de versiones): https://huggingface.co/sergolsub/onejev-v1.5-9B-MLX-8bit
- Versión MLX 4 bits: https://huggingface.co/sergolsub/onejev-v1.5-9B-MLX-4bit
- Papers, blogs, repositorios y demos adicionales: no disponible en la información proporcionada.
