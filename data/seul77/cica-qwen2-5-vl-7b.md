# seul77/CICA-Qwen2.5-VL-7B

## Resumen

CICA-Qwen2.5-VL-7B es un ajuste fino de Qwen2.5-VL-7B-Instruct desarrollado por el autor seul77 (equipo vinculado al paper ASTERISM) que aplica una técnica de aprendizaje por refuerzo denominada cross-image credit assignment (CICA) para mejorar el razonamiento sobre múltiples imágenes. El modelo parte de la arquitectura Qwen2.5-VL, un transformer multimodal de 8.292 millones de parámetros que procesa texto e imágenes en una única ventana de contexto y que en su versión base se distribuye bajo licencia Apache 2.0.

El problema que aborda es concreto: los modelos multimodales de gran tamano tienden a "mirar" solo una de las imágenes de una consulta multi-imagen y a ignorar el resto, lo que degrada tareas que requieren comparar, agregar o razonar sobre varias vistas a la vez. CICA modifica la asignación de crédito durante el RLVR (reinforcement learning with verifiable rewards) sin anadir parámetros, rollouts ni pasos de backward adicionales: para cada token de la respuesta compara la verosimilitud bajo el conjunto completo de imágenes con la verosimilitud bajo la mejor imagen individual, y desplaza el crédito hacia los tokens que realmente necesitan más de una imagen.

El resultado reportado por el autor es una mejora de 40,7 a 46,7 en la métrica ASTERISM (media macro sobre siete categorías de tarea, decodificación greedy) respecto al modelo base. Es relevante ahora porque propone una receta de entrenamiento ligera y reutilizable para un problema poco atacado en la literatura: el razonamiento multi-imagen fiable en modelos de visión-lenguaje de tamano medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen2.5-VL (vision encoder + LLM decoder) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,6 GB, libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-VL-7B-Instruct sin modificaciones estructurales: un encoder visual que proyecta parches de imagen al espacio del modelo de lenguaje y un decoder autoregresivo que genera texto condicionado por las representaciones visuales y el prompt. El modelo conserva la configuración, tokenizer y processor del modelo base, por lo que `generation_config.json` mantiene los valores de muestreo originales de Qwen2.5-VL-7B-Instruct.

El entrenamiento se realiza sobre el dataset ASTERISM-Train mediante RLVR con la técnica CICA. La innovación clave es la función de asignación de crédito: para cada token de la respuesta se calcula la verosimilitud de la política bajo todas las imágenes y bajo la mejor imagen individual, y la diferencia se usa para recompensar los tokens que requieren información de más de una imagen. Según el autor, esto no anade parámetros, rollouts ni pasos de backward, y mantiene los datos, la recompensa y el objetivo de RL originales. Los detalles de entrenamiento se remiten a los apéndices F y G del paper ASTERISM (arXiv:2611.32316). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de DPO o RLHF más allá del RLVR descrito.

## Capacidades

- Generación de texto e image-text-to-text: responde preguntas en lenguaje natural condicionadas por una o varias imágenes.
- Razonamiento multi-imagen: capacidad entrenada explícitamente para comparar, agregar y razonar sobre varias imágenes en una misma consulta.
- Comprensión visual general: descripción de escenas, identificación de objetos y atributos, respuesta a preguntas visuales.
- Procesamiento de vídeo: el pipeline de `qwen-vl-utils` y el processor del modelo base aceptan vídeo además de imagen.
- Conversación multi-turno: formato de chat con roles y plantilla de chat compatible con `apply_chat_template`.
- Tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-VL lo soporta, pero la model card no lo documenta para este ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Comparación de productos en catálogos de comercio electrónico: el modelo puede recibir varias fotos de un mismo artículo desde ángulos distintos y determinar si representan el mismo producto, tarea directamente alineada con la evaluación ASTERISM y con la pregunta de ejemplo de la model card.
- Verificación de identidad documental: comparar la foto de un documento con una selfie o con varias capturas para detectar discrepancias, aprovechando la capacidad de razonar sobre múltiples imágenes en una sola pasada.
- Inspección visual industrial: analizar varias imágenes de una misma pieza o línea de producción y agregar evidencias para decidir si hay defecto, usando el modelo como componente de un pipeline de control de calidad.
- Revisión de imágenes médicas o cientificas multi-corte: comparar cortes o vistas de una misma muestra y responder preguntas que requieren correlacionar información entre imágenes.
- Asistencia en tareas de teledetección: comparar imágenes satelitales de la misma zona en fechas distintas para describir cambios, con el modelo como motor de razonamiento visual multi-imagen.
- Moderación de contenido visual: evaluar conjuntos de imágenes subidas por un usuario y decidir si en conjunto violan una política, en lugar de evaluarlas de forma aislada.
- Automatización de soporte técnico con capturas: el usuario envía varias capturas de pantalla de un error y el modelo debe correlacionarlas para diagnosticar el problema, aprovechando el contexto multi-imagen y la conversación multi-turno.

## Benchmarks y rendimiento

| Modelo | ASTERISM (media macro, greedy) |
|---|---:|
| Qwen2.5-VL-7B-Instruct | 40,7 |
| CICA-Qwen2.5-VL-7B | 46,7 |

La métrica ASTERISM es la media macro sobre siete categorías de tarea del benchmark homónimo, evaluada con decodificación greedy y sin penalización por repetición. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): en torno a 16,6 GB solo para pesos, más overhead de activaciones y del encoder visual; se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; GPUs con 16 GB o menos requerirán cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB o menos es necesario cuantizar, aunque la información disponible no detalla los formatos de cuantización soportados.
- Opciones de despliegue: `transformers` con `accelerate` y `qwen-vl-utils` (documentado en la model card), y `text-generation-inference` (tag del repo). No se documentan explícitamente vLLM, llama.cpp u Ollama para este ajuste.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASTERISM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CICA-Qwen2.5-VL-7B | 8,29 B | no disponible | 46,7 | Apache 2.0 | Hugging Face (seul77) |
| Qwen2.5-VL-7B-Instruct | 8,29 B (heredado del base) | no disponible | 40,7 | Apache 2.0 | Hugging Face (Qwen) |
| Otros VLMs de ~7-8 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos publicados en la información disponible es frente al modelo base Qwen2.5-VL-7B-Instruct, sobre el que CICA mejora 6,0 puntos en ASTERISM. No se dispone de resultados comparables frente a otros VLMs de tamano similar (por ejemplo, variantes de LLaVA, InternVL o MiniCPM-V) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar el modelo base, es razonable esperar los sesgos de Qwen2.5-VL-7B-Instruct, pero no hay evaluación específica publicada.
- Riesgo de alucinación: no se reportan métricas de fidelidad ni de abstención; el ajuste por RL puede aumentar la confianza en respuestas incorrectas si la recompensa no penaliza adecuadamente la especulación.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la información disponible; deben consultarse en la model card del modelo base.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-VL-7B-Instruct y de los datos ASTERISM-Train.
- Configuración de generación: el repo conserva los valores de muestreo por defecto de Qwen2.5-VL-7B-Instruct en `generation_config.json`, mientras que los resultados ASTERISM se obtuvieron con decodificación greedy y sin penalización por repetición; en producción hay que fijar explícitamente esos parámetros para reproducir el rendimiento reportado.
- Madurez: el modelo tiene 0 descargas y 1 like en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente de los resultados.
- Trazabilidad: el paper asociado (arXiv:2611.32316) y el repositorio de evaluación son la única fuente de los números reportados; no se han replicado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seul77/CICA-Qwen2.5-VL-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/seul77/ASTERISM-Train
- Paper: https://arxiv.org/abs/2611.32316
- Repositorio de evaluación: https://github.com/chanseul01/ASTERISM
