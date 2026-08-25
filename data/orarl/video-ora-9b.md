# OraRL/Video-ORA-9B

## Resumen

Video-ORA-9B es un modelo multimodal de comprensión de vídeo e imagen desarrollado por el grupo de investigación OraRL (afiliado a HVision-NKU). Está diseñado para unificar siete familias de tareas de percepción estructurada sobre vídeo e imagen: temporal grounding, seguimiento visual, segmentación de imagen y vídeo, spatial grounding, grounding espacio-temporal, respuesta a preguntas sobre vídeo e inteligencia espacial. El modelo parte del checkpoint Qwen/Qwen3.5-9B y se somete a un post-entrenamiento mediante OraRL (Annotations as Rollouts), una técnica de aprendizaje por refuerzo on-policy que anota las salidas del modelo para mejorar la alineación con las tareas objetivo, sin necesidad de decodificación con cadena de pensamiento.

Con 9.409 millones de parámetros y una ventana de contexto nativa de 262.144 tokens, el modelo es capaz de procesar vídeo completo (con muestreo de frames configurable) y responder directamente a preguntas sobre el contenido. Su relevancia actual radica en que aborda de forma unificada tareas que tradicionalmente requerían modelos especializados por separado, y lo hace con una única arquitectura basada en Qwen3.5, lo que simplifica el despliegue en entornos de investigación y prototipado. La licencia Apache 2.0 permite uso comercial y modificación, aunque los datos de entrenamiento conservan sus propias licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer multimodal de 9B parámetros con arquitectura de mezcla de atención (atención completa y atención dispersa) que permite manejar contextos largos de hasta 262.144 tokens. El post-entrenamiento con OraRL consiste en un aprendizaje por refuerzo on-policy donde las anotaciones generadas por el propio modelo se utilizan como rollouts para optimizar la política, evitando la dependencia de cadenas de pensamiento explícitas. El entrenamiento utiliza splits públicos de las siete familias de tareas mencionadas, excluyendo identidades de evaluación, preguntas y anclajes de medios durante la construcción de la mezcla. No se especifican el número total de tokens de entrenamiento ni la composición detallada del dataset. El modelo se sirve con Transformers 5.5.4 y vLLM 0.19.1, y el checkpoint incluye tokenizer, configuración de procesador, configuración de generación y chat template.

## Capacidades

- Comprensión unificada de vídeo e imagen: procesa vídeo completo (con muestreo de frames configurable) y responde preguntas sobre el contenido.
- Temporal grounding: localiza intervalos temporales en un vídeo correspondientes a una descripción o evento.
- Visual tracking: sigue objetos a lo largo de un vídeo, devolviendo trayectorias o bounding boxes.
- Segmentación de imagen y vídeo: genera máscaras de segmentación para objetos o regiones.
- Spatial grounding: localiza objetos en una imagen mediante coordenadas o bounding boxes.
- Grounding espacio-temporal: combina localización espacial y temporal en vídeo.
- Video question answering: responde preguntas de razonamiento sobre contenido de vídeo.
- Inteligencia espacial: razonamiento sobre relaciones espaciales, posiciones y geometría en escenas.
- Sin cadena de pensamiento: las respuestas son directas y específicas de la tarea, lo que reduce latencia y coste de decodificación.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Anotación automática de datasets de vídeo: el modelo puede generar bounding boxes, máscaras de segmentación e intervalos temporales para crear o ampliar conjuntos de datos etiquetados, reduciendo el coste de anotación manual en pipelines de visión por computador.
- Búsqueda semántica en archivos de vídeo: dado un archivo de grabaciones (por ejemplo, CCTV o material de archivo), el modelo permite localizar el momento exacto en que ocurre un evento descrito en lenguaje natural, gracias a su capacidad de temporal grounding.
- Moderación de contenido audiovisual: puede identificar y segmentar objetos o escenas específicas en vídeo (por ejemplo, detectar presencia de armas o comportamientos inapropiados) mediante segmentación y spatial grounding, aunque no está validado para decisiones críticas.
- Asistente de accesibilidad: a partir de un vídeo, el modelo puede generar descripciones detalladas de la acción y la escena, útiles para personas con discapacidad visual o para subtitulado descriptivo automático.
- Análisis deportivo y de rendimiento: seguimiento de jugadores o balones en vídeos de partidos, con salida de trayectorias y bounding boxes, para estadísticas automáticas o análisis táctico.
- Robótica y navegación: el modelo puede interpretar vídeo de una cámara para localizar objetos y razonar sobre relaciones espaciales, sirviendo como módulo de percepción en sistemas de manipulación o navegación en entornos controlados.
- QA sobre vídeos educativos o de formación: responder preguntas específicas sobre el contenido de un vídeo (por ejemplo, "¿qué herramienta se usa en el minuto 3?") sin necesidad de transcripción ni búsqueda manual.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una matriz comparativa a nivel de dataset (imagen SVG) que compara Video-ORA-9B con otros modelos multimodales en las siete familias de tareas, indicando que el modelo lidera la comparación sin decodificación con cadena de pensamiento, pero no se proporcionan los valores concretos en el texto. Para protocolos completos y atribución de fuentes, se remite al repositorio de OraRL y al paper (arXiv:2608.20492).

## Requisitos de hardware

- Peso del modelo en BF16: aproximadamente 17.6 GiB solo para los pesos, según la documentación de vLLM. Esto no incluye memoria para KV-cache ni activaciones.
- Para inferencia con contexto completo (262.144 tokens), se requiere una GPU con al menos 40-80 GB de VRAM, dependiendo de la longitud real de los prompts y del número de frames de vídeo procesados. Una A100 40GB o H100 80GB sería adecuada.
- En GPUs de consumo (por ejemplo, RTX 4090 con 24 GB), solo es viable con contextos reducidos (por ejemplo, `--max-model-len` inferior a 262k) y posiblemente con cuantización, aunque no se documentan pesos cuantizados.
- Despliegue recomendado: vLLM 0.19.1 con `--tensor-parallel-size` para multi-GPU, o Transformers 5.5.4 con `transformers serve --continuous-batching`.
- No se menciona soporte para llama.cpp, Ollama u otros runtimes de CPU/GPU ligera.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de la misma categoría (comprensión de vídeo unificada). El modelo base Qwen3.5-9B no es multimodal, por lo que no es directamente comparable. Alternativas como Qwen2.5-VL o LLaVA-Video podrían ser comparables, pero no se proporcionan datos de rendimiento en la información disponible. Se recomienda consultar el paper y el repositorio de OraRL para comparaciones detalladas.

## Limitaciones y advertencias

- Checkpoint de investigación: optimizado para tareas estructuradas de vídeo y comprensión espacial; puede producir salidas malformadas en tareas específicas o fuera de su dominio.
- Riesgo de alucinación visual: puede inventar detalles de la escena o atribuir propiedades incorrectas a objetos.
- Sesgos heredados: al partir de Qwen3.5-9B y entrenarse con datos públicos, puede heredar sesgos presentes en el modelo base y en los datasets de entrenamiento.
- No validado para uso crítico: no debe emplearse en decisiones de seguridad, inferencia de identidad, vigilancia o aplicaciones de alto riesgo.
- Restricciones de licencia de datos: aunque el modelo tiene licencia Apache 2.0, los datos de entrenamiento y los medios utilizados conservan sus propias licencias y requisitos de consentimiento; no se distribuyen con el checkpoint.
- Contexto largo: aunque la ventana nativa es de 262.144 tokens, el uso de contextos muy largos incrementa significativamente el consumo de memoria KV-cache, lo que puede requerir reducir `--max-model-len` en entornos con VRAM limitada.
- Idiomas: no se especifican los idiomas soportados; se asume que el modelo base Qwen3.5 tiene capacidades multilingües, pero no está confirmado para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OraRL/Video-ORA-9B
- Página del proyecto: https://orarl.github.io/
- Paper (arXiv): https://arxiv.org/abs/2608.20492
- Datos de evaluación: https://huggingface.co/datasets/OraRL/OraRL-Data/tree/main/OraRL-eval-data
- Código (repositorio): https://github.com/HVision-NKU/OraRL
- Endpoint de inferencia (FriendliAI): https://friendli.ai/models/OraRL/Video-ORA-9B
