# sergolsub/valen-decision-1.5-9B-MLX-4bit

## Resumen

Valen-Decision-1.5-9B es un modelo de 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) desarrollado por Valen-Team y distribuido en este repositorio por el usuario sergolsub como una conversión cuantizada a 4 bits en formato MLX, orientada a ejecución en Apple Silicon mediante `mlx_lm`. El modelo base es `Valen-Team/Valen-Decision-1.5-9B`, un fine-tune etiquetado con la arquitectura `qwen3_5` en los metadatos del repositorio. No se trata de un modelo de chat generalista, sino de un modelo con cabezas de decisión ("decision mode") que permite clasificar, puntuar y localizar objetos en imágenes mediante una API específica (`model.decide`).

La relevancia de esta ficha no reside en el modelo base, sino en la conversión: el autor publica una evaluación comparativa entre los pesos originales en bf16, una conversión a 8 bits y esta conversión a 4 bits, medida sobre el mismo conjunto de evaluación y la misma máquina (Mac mini M4 Pro de 48 GB). Los datos muestran que la cuantización a 4 bits degrada la precisión de decisión del 86,7 % al 83,3 %, mientras que la conversión a 8 bits la mantiene intacta. Es, por tanto, un caso útil para estudiar el coste real de la cuantización agresiva en modelos pequeños con cabezas auxiliares.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye model card del modelo base ni información sobre el entrenamiento, los datos o los idiomas. Toda la información técnica disponible procede de la model card de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura etiquetada como `qwen3_5` (familia Qwen 3.5); incluye cabeza de decisión y cabeza de grounding (box) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (affine, mismo group size que la conversión de 8 bits); existe también una versión MLX 8-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de los pesos originales; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `*_mlx.py`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3_5` en los metadatos y de la presencia de una "decision mode" con cabezas de decisión. La API expuesta sugiere una arquitectura con al menos dos componentes: un codificador de lenguaje (el transformer base) y una cabeza de decisión que produce salidas estructuradas de cuatro tipos: `noul` (booleano sí/no), `choice` (selección entre criterios etiquetados), `score` (puntuación sobre una lista ordenada de criterios) y `box` (localización de objetos mediante cajas, con una "grounding head" que reporta IoU). La existencia de la tarea `box` implica capacidades multimodales de visión, aunque la model card no detalla el codificador visual.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La conversión a 4 bits se realizó por desquantización de la versión de 8 bits y recuantización afín a 4 bits con el mismo tamaño de grupo, sin reentrenamiento ni cambios de arquitectura, según declara el autor. La evaluación reportada incluye una auditoría de calibración (PPL 1,822 frente a 1,766 en bf16) y una divergencia KL por fila de las probabilidades de decisión (media 2,86e-02 nats frente al original).

## Capacidades

- Clasificación binaria de intención o condición (`noul`): responde preguntas de sí/no sobre un texto de entrada, con instrucciones en lenguaje natural.
- Selección entre categorías (`choice`): elige una etiqueta de un conjunto de criterios con descripciones, útil para enrutamiento y triaje.
- Puntuación ordinal (`score`): asigna un valor de una escala definida por el usuario (por ejemplo, `["cosmetic", "annoying", "blocks"]`).
- Localización de objetos (`box`): devuelve cajas delimitadoras con una cabeza de grounding; el autor reporta IoU medio de 0,7837 en la versión de 4 bits frente a 0,7892 en bf16.
- Procesamiento de lenguaje natural sobre texto de entrada en inglés (los ejemplos de la model card están en inglés; no se declaran idiomas soportados).
- Capacidades multimodales limitadas a la tarea de grounding descrita; no se documentan otras tareas de visión.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking".
- No se documenta generación de texto libre, código ni matemáticas; el uso previsto es la decisión estructurada, no la conversación.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de la incidencia y un conjunto de criterios (`billing`, `shipping`, etc.) y devuelve la etiqueta del equipo que debe gestionarla, con una latencia mediana de 528 ms por decisión en un M4 Pro.
- Clasificación de intención en atención al cliente: la tarea `noul` permite responder preguntas como "¿el cliente quiere un reembolso?" sobre el texto del ticket, integrable en un flujo previo a un sistema de respuesta.
- Priorización de incidencias: la tarea `score` con criterios ordinales (`cosmetic`, `annoying`, `blocks`) permite asignar severidad a errores de una aplicación o a alertas de infraestructura.
- Análisis de capturas y documentos con objetos: la tarea `box` localiza elementos concretos (por ejemplo, una señal de stop) en una imagen descrita o enviada al modelo, útil en pipelines de inspección visual.
- Enrutamiento en soporte técnico interno: clasificación de mensajes de error ("disk quota exceeded") hacia el equipo o la severidad correspondiente sin necesidad de un LLM generativo completo.
- Procesamiento local en portátiles Apple Silicon: al ocupar 5,38 GB en disco y 6,72 GB de memoria residente máxima, puede desplegarse en un Mac mini M4 Pro o en un MacBook con 16 GB o más para tareas de clasificación en local sin conexión.
- Evaluación comparativa de cuantización: sirve como caso de estudio para medir la pérdida de calidad de 4 bits frente a 8 bits y bf16 en modelos pequeños con cabezas auxiliares, usando las métricas de KL y PPL publicadas.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión, medidos en un Mac mini M4 Pro de 48 GB con MLX 4-bit sobre el mismo conjunto de evaluación:

| Version | Accuracy | noul | choice | score | PPL | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 86,7 % | 92,5 % | 84,0 % | 80,0 % | 1,766 | referencia | 16,79 GB | 492 ms |
| 8-bit MLX | 86,7 % | 92,5 % | 84,0 % | 80,0 % | 1,764 | 3,02e-04 | 9,35 GB | 522 ms |
| 4-bit MLX (esta ficha) | 83,3 % | 92,5 % | 80,0 % | 72,0 % | 1,822 | 2,86e-02 | 5,38 GB | 528 ms |

Divergencia KL por fila de las probabilidades de decisión (en nats):

| Par | Filas | Media | p95 | Máximo |
|---|---|---|---|---|
| original → 8-bit | 100 | 3,02e-04 | 1,90e-03 | 3,26e-03 |
| 8-bit → 4-bit | 100 | 2,88e-02 | 1,18e-01 | 2,90e-01 |
| original → 4-bit | 100 | 2,86e-02 | 1,12e-01 | 2,92e-01 |

Métricas de grounding: IoU medio de 0,7837 en 4 bits frente a 0,7892 en bf16, con 4/4 aciertos a IoU ≥ 0,5 y un IoU mínimo frente a torch de 0,852. Rendimiento en disco y memoria: 5,38 GB en disco, 0,62 s de carga, 6,72 GB de memoria residente máxima y 2,56 decisiones cortas por segundo sostenidas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,72 GB de memoria residente máxima medida con MLX 4-bit en un Mac mini M4 Pro de 48 GB; el modelo ocupa 5,38 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada; la medición de referencia se hizo en un M4 Pro. No hay datos para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada, según el consumo medido de 6,72 GB (deja margen para el sistema y el resto de procesos).
- Opciones de despliegue: `mlx_lm` y el cargador propio incluido en el repositorio (`valen_mlx.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX y la API de decisión es específica.
- Latencia y throughput: latencia mediana de 528 ms por decisión y 2,56 decisiones cortas por segundo sostenidas; carga del modelo en 0,62 s.
- Almacenamiento: 5,38 GB para los pesos en 4 bits, frente a 9,35 GB en 8 bits y 16,79 GB en bf16.

## Comparativa con modelos similares

La información disponible no identifica modelos comparables de la misma categoría (modelos pequeños con cabezas de decisión y grounding). La comparación más directa posible es entre las propias versiones del mismo modelo:

| Modelo | Parámetros | Contexto | Accuracy | Licencia | Formato |
|---|---|---|---|---|---|
| Valen-Decision-1.5-9B (bf16) | 8,39 B | no disponible | 86,7 % | Apache 2.0 | safetensors |
| Valen-Decision-1.5-9B MLX 8-bit | 8,39 B | no disponible | 86,7 % | Apache 2.0 | safetensors MLX |
| Valen-Decision-1.5-9B MLX 4-bit | 8,39 B | no disponible | 83,3 % | Apache 2.0 | safetensors MLX |

Frente a alternativas generalistas de tamaño similar (por ejemplo, modelos de la familia Qwen 3.5 de ~8-9 B), no se dispone de datos de benchmarks comparables ni de información sobre el contexto o los idiomas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la precisión de decisión en 3,4 puntos porcentuales (86,7 % → 83,3 %) y la métrica `score` en 8 puntos (80,0 % → 72,0 %); para producción con requisitos estrictos de precisión, la versión de 8 bits conserva la calidad del original con la mitad de disco que bf16.
- La divergencia KL media frente al original es de 2,86e-02 nats, dos órdenes de magnitud mayor que la de la versión de 8 bits (3,02e-04), con un máximo de 2,92e-01 en la peor fila.
- El modelo está pensado para decisiones estructuradas, no para generación de texto libre; no se documentan capacidades conversacionales, de código ni matemáticas.
- No se declaran idiomas soportados; los ejemplos de la model card están en inglés y no hay garantía de comportamiento en castellano u otros idiomas.
- No se dispone de información sobre sesgos, datos de entrenamiento ni riesgos de alucinación del modelo base; la model card del upstream no está incluida en la información proporcionada.
- Licencia Apache 2.0 heredada: permite uso comercial, pero prevalece la licencia del repositorio upstream en caso de conflicto; conviene verificar el repositorio original antes de desplegar.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (24 de noviembre de 2026), por lo que no hay validación comunitaria de los resultados reportados.
- No se ha ejecutado una auditoría de KL a nivel de peso por tensor en este repositorio; el autor indica que la herramienta `kl_weight_audit.py` permite reproducirla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/valen-decision-1.5-9B-MLX-4bit
- Modelo base: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Conversión MLX 8-bit del mismo autor: https://huggingface.co/sergolsub/valen-decision-1.5-9B-MLX-8bit
