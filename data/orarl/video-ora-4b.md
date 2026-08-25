# OraRL/Video-ORA-4B

## Resumen

Video-ORA-4B es un modelo multimodal de visión y lenguaje desarrollado por OraRL, un grupo de investigación asociado a la Universidad de Nankai (HVision-NKU). Se construye sobre el modelo base Qwen/Qwen3.5-4B y se somete a un post-entrenamiento con la técnica OraRL (Annotations as Rollouts), que combina aprendizaje por refuerzo on-policy con anotaciones estructuradas como señales de recompensa. El resultado es un único modelo capaz de abordar siete familias de tareas de comprensión de vídeo e imagen con respuestas directas y sin necesidad de decodificación de cadena de pensamiento (chain-of-thought).

La arquitectura es la de Qwen3.5-4B, un transformer multimodal con codificador de visión y texto, adaptado para procesar vídeo e imágenes. El modelo tiene una longitud de contexto nativa de 262.144 tokens, lo que permite manejar secuencias de vídeo largas o múltiples fotogramas. Los pesos publicados en safetensors suman 5.174.964.736 parámetros, aunque la model card lo describe como "4B" (probablemente contando solo parámetros activos o redondeando). Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial con atribución.

La relevancia de Video-ORA-4B radica en que unifica tareas que tradicionalmente requieren modelos especializados (segmentación, tracking, grounding, QA) en un solo checkpoint compacto de 4B, facilitando su despliegue en entornos con recursos limitados. Está pensado para investigación en percepción estructurada de vídeo, evaluación de benchmarks y adaptación a tareas específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal) |
| Parametros totales | 5.174.964.736 (la model card indica 4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Video-ORA-4B parte del modelo Qwen3.5-4B, un transformer causal con componentes multimodales que procesa texto, imagen y vídeo. La arquitectura base ya incorpora mecanismos de atención de ventana larga y un procesador de vídeo que muestrea fotogramas de manera adaptativa. El post-entrenamiento emplea OraRL, un enfoque de aprendizaje por refuerzo on-policy en el que las anotaciones de tareas (por ejemplo, máscaras de segmentación, cajas de seguimiento o intervalos temporales) se convierten en "rollouts" que guían la optimización. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset, pero la model card indica que se utilizan splits públicos de entrenamiento de las siete familias de tareas, excluyendo los datos de evaluación.

El entrenamiento no usa RLHF ni DPO clásico, sino una variante específica orientada a producir salidas estructuradas directamente, sin cadenas de pensamiento. Esto reduce la latencia y mejora la consistencia en tareas que requieren respuestas discretas (por ejemplo, coordenadas o intervalos). La innovación principal es que un solo modelo puede generar respuestas nativas de la tarea (JSON estructurado, máscaras, etc.) sin necesidad de un adaptador externo.

## Capacidades

- Comprensión unificada de vídeo e imagen: procesa clips de vídeo completos y fotogramas individuales para responder preguntas, describir escenas o extraer información espacial y temporal.
- Temporal grounding: localiza intervalos de tiempo en un vídeo que corresponden a una descripción o evento.
- Visual tracking: sigue objetos a lo largo de un vídeo, devolviendo trayectorias o bounding boxes.
- Segmentación de imagen y vídeo: produce máscaras de segmentación a nivel de píxel o de objeto.
- Spatial grounding: relaciona expresiones de texto (p. ej., "el coche rojo") con regiones específicas de una imagen.
- Spatial-temporal grounding: combina localización espacial y temporal en vídeo.
- Video question answering (VQA): responde preguntas sobre el contenido de un vídeo, incluyendo razonamiento espacial y temporal.
- Spatial intelligence: estima relaciones geométricas, posiciones relativas y propiedades espaciales de los objetos.
- Sin cadena de pensamiento: genera respuestas directas y estructuradas, lo que reduce latencia y tokens de salida.
- Multimodal: acepta entradas de imagen y vídeo junto con texto.

## Casos de uso

- Anotación automática de vídeos para datasets de entrenamiento: el modelo puede generar bounding boxes, máscaras y etiquetas temporales sobre vídeos sin anotar, acelerando la creación de conjuntos de datos de visión por computador. Su capacidad de temporal grounding permite marcar el inicio y fin de eventos.
- Vigilancia y monitorización de vídeo en tiempo real: aunque la card advierte que el uso de vigilancia está fuera de alcance, técnicamente puede realizar seguimiento de objetos (visual tracking) y detección de eventos en secuencias de vídeo, con una latencia adecuada gracias a la ausencia de chain-of-thought.
- Análisis de vídeo para asistencia en robótica: el modelo puede procesar la percepción visual de un robot y responder a preguntas espaciales (dónde está un objeto, cómo se mueve) para guiar la navegación o manipulación.
- Moderación de contenido multimedia: permite localizar y segmentar objetos o escenas concretas en vídeos largos, facilitando la revisión automática de contenido sensible.
- Asistencia a personas con discapacidad visual: dado que puede describir escenas y responder preguntas sobre vídeo en tiempo real, podría integrarse en dispositivos móviles para proporcionar descripciones auditivas de lo que ocurre en una cámara.
- Automatización de etiquetado para vídeo-ensayos en producción: en la industria del cine y la publicidad, el modelo puede segmentar y localizar objetos en tomas para generar metadatos de búsqueda o para la postproducción.
- Evaluación de modelos de vídeo: como herramienta de referencia para comparar la capacidad de otros modelos multimodales en tareas de temporal grounding y seguimiento, gracias a su licencia abierta y fácil despliegue con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una matriz comparativa en formato SVG que muestra resultados por conjunto de datos frente a líneas base multimodales, pero los valores concretos no son extraíbles de la documentación textual. El repositorio oficial (GitHub) y el paper (arXiv) contienen los protocolos completos y las cifras, pero no se han proporcionado aquí. Por tanto, no se puede presentar una tabla numérica de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan aproximadamente 8.6 GiB en memoria durante la carga con vLLM. Para la inferencia con la longitud de contexto completa (262144 tokens) se requerirá memoria adicional para el KV-cache, que puede exceder 20 GiB según el número de fotogramas de vídeo procesados. Se recomienda reducir `--max-model-len` si se dispone de menos memoria.
- GPU recomendadas: una GPU con al menos 12-16 GB de VRAM (p. ej., RTX 4080/4090, A10, A100) es suficiente para inferencia con contexto reducido. Para contexto largo o procesamiento de vídeo de alta resolución, se recomienda A100 (40/80 GB) o H100.
- Compatibilidad con consumer GPU: sí, con cuantización (aunque no se han publicado pesos cuantizados, se puede aplicar con herramientas como llama.cpp) o con contextos reducidos. La card no indica cuantizaciones oficiales.
- Opciones de despliegue: vLLM (versión 0.19.1 probada) y Transformers (versión 5.5.4 o superior). También se puede servir mediante el servidor de Transformers con continuous batching.
- Latencia y throughput: no se han publicado mediciones. La ausencia de chain-of-thought reduce el número de tokens generados, lo que suele mejorar la latencia frente a modelos que razonan paso a paso.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. Como referencia, el modelo se basa en Qwen3.5-4B (el modelo base de lenguaje) y es comparable en tamaño a otros modelos multimodales compactos de 4-5B como LLaVA-1.5-7B (7B) o Phi-3.5-Vision (4B), pero no hay datos de rendimiento comparativo disponibles. La model card menciona una comparación con "multimodal baselines" en la matriz de benchmarks, pero sin valores numéricos, por lo que no se puede realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card indica que el modelo es un "checkpoint de investigación" y puede producir salidas malformadas para tareas específicas, así como alucinar detalles visuales.
- No se proporcionan idiomas soportados. Se asume que el modelo base Qwen3.5-4B soporta inglés y chino, pero no está confirmado para este modelo.
- El uso está fuera de alcance para decisiones críticas de seguridad, inferencia de identidad, despliegue de vigilancia o usos que violen las licencias o consentimientos de los medios de origen.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento y los medios de evaluación están sujetos a sus propias licencias originales; el checkpoint no distribuye los datos.
- No se ofrecen pesos cuantizados oficialmente, solo BF16. Para desplegar en entornos con poca VRAM puede ser necesario cuantizar manualmente.
- El modelo tiene una ventana de contexto muy amplia (262144 tokens), pero el procesamiento de vídeo completo con todos los fotogramas puede requerir mucha memoria; se recomienda ajustar el número de fotogramas (`num_frames`) y el FPS en el procesador de medios.

## Enlaces

- [Hugging Face: OraRL/Video-ORA-4B](https://huggingface.co/OraRL/Video-ORA-4B)
- [Paper en arXiv: 2608.20492](https://arxiv.org/abs/2608.20492)
- [Código y repositorio oficial (GitHub)](https://github.com/HVision-NKU/OraRL)
- [Página del proyecto](https://orarl.github.io/)
- [Datos de evaluación](https://huggingface.co/datasets/OraRL/OraRL-Data/tree/main/OraRL-eval-data)
