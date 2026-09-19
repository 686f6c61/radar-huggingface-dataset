# Myungkyu/rldx_1_robodojo_taco_luna_b64_60k

## Resumen

rldx_1_robodojo_taco_luna_b64_60k es un checkpoint de política robótica de bajo nivel (low-level policy) desarrollado por el usuario Myungkyu, obtenido por ajuste fino supervisado del modelo base RLWRLD/RLDX-1-PT sobre el dataset Myungkyu/RoboDojo-taco-luna. Se trata de un modelo de tipo VLA (vision-language-action) orientado a manipulación bimanual sobre mesa con robots reales, no de un modelo de lenguaje conversacional: su salida son acciones motoras condicionadas por imágenes de cámara, propiocepción y una etiqueta textual de subtarea.

El entrenamiento cubre el benchmark RoboDojo de horizonte largo, compuesto por 8 tareas de mesa bimanual ejecutadas con robots reales y 100 demostraciones por tarea. Las etiquetas densas de subtarea se anotaron de forma offline con un modelo planificador (GPT-5.6 Luna) usando el contexto TASCO, y el propio autor indica que la evaluación debe realizarse con el mismo modelo planificador. La configuración de entrenamiento reportada es batch 64 con 60.000 pasos de optimizador, y el repositorio contiene el checkpoint final.

El modelo tiene 6.912.896.320 parámetros (~6,9 mil millones) según los pesos en safetensors, con un repositorio de 13,8 GB. No se ha publicado información sobre licencia, idiomas, benchmarks ni variantes cuantizadas, y la búsqueda web realizada no ha devuelto documentación técnica relevante (solo resultados de dominio genérico de comercio electrónico), por lo que buena parte de la ficha queda marcada como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (VLA; video length 4, tres vistas de cámara en vivo, sin slot de keyframe) |
| Parámetros totales | 6.912.896.320 (~6,9 mil millones) |
| Parámetros activos | no aplica (no se describe una arquitectura Mixture of Experts) |
| Longitud de contexto | no disponible; la ventana de observación declarada es de 4 fotogramas de vídeo (video length 4) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se anuncian variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (usa texto de subtarea en inglés en el dataset de entrenamiento, según la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 13,8 GB) |
| Pipeline declarado | robotics |
| Modelo base | RLWRLD/RLDX-1-PT (finetune) |
| Dataset de entrenamiento | Myungkyu/RoboDojo-taco-luna |
| Tareas | RoboDojo long-horizon: 8 tareas bimanuales de mesa con robot real, 100 demostraciones por tarea |
| Configuración de entrenamiento | batch de optimizador 64, 60.000 pasos, checkpoint final |
| Entradas | imágenes de cabeza + muñeca izquierda + muñeca derecha, propiocepción y texto de la subtarea actual (sin entrada de keyframe) |
| Anotación de subtareas | GPT-5.6 Luna con contexto TASCO (anotación offline) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación / actualización | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

La model card describe el modelo como una política de bajo nivel construida sobre la arquitectura RLDX-1-PT, con una ventana de vídeo de 4 fotogramas, tres vistas de cámara en vivo (cabeza, muñeca izquierda y muñeca derecha) y sin slot de keyframe. Las entradas son multimodales y se combinan en cada paso: imágenes de las tres cámaras, propiocepción del robot y el texto de la subtarea en curso. La salida es la acción de control de bajo nivel, típica de un modelo VLA; no se detalla en la información disponible la forma exacta de la cabeza de acción ni la formulación (difusión, regresión directa o tokens de acción).

El ajuste fino se realizó sobre Myungkyu/RoboDojo-taco-luna, un conjunto de demostraciones con etiquetas densas de subtarea generadas offline por GPT-5.6 Luna con el contexto TASCO. El entrenamiento usó batch de 64 y 60.000 pasos de optimizador, y el artefacto publicado es el checkpoint final. No se especifican el número total de tokens o de transiciones consumidas, la composición exacta del dataset, ni si hubo etapas adicionales de RLHF, DPO o aprendizaje por imitación con objetivos auxiliares. Tampoco se documentan innovaciones técnicas propias del ajuste (por ejemplo, decodificación especulativa o mecanismos de atención lineal) más allá de la propia arquitectura del backbone RLDX-1-PT.

Un detalle operativo relevante: las configuraciones del repositorio referencian el backbone y el tokenizer mediante hub id o mediante una ruta local del sitio de entrenamiento, por lo que el autor recomienda apuntarlas a copias locales antes de cargar el modelo. Esto implica que la reproducibilidad exige disponer por separado del backbone base y del tokenizer.

## Capacidades

- Generación de acciones robóticas de bajo nivel para control bimanual de mesa, condicionadas por imágenes de cámara y propiocepción.
- Percepción multimodal con tres vistas simultáneas: cámara de cabeza y cámaras de muñeca izquierda y derecha.
- Procesamiento de contexto temporal corto: ventana de 4 fotogramas de vídeo, sin keyframe.
- Seguimiento de instrucciones por subtarea: la política recibe el texto de la subtarea actual, lo que permite segmentar una tarea de horizonte largo en fases.
- Ejecución de tareas de horizonte largo en el benchmark RoboDojo (8 tareas, 100 demostraciones cada una).
- Ingesta de propiocepción como entrada adicional al canal visual y textual.
- Capacidades de razonamiento lingüístico general: no disponibles; se trata de un modelo especializado en robótica, no de un LLM conversacional.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible como capacidad nativa; el modelo depende de un planificador externo (en la model card se indica evaluar con el mismo planner GPT-5.6 Luna que anotó los datos).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, audio, visión general): no disponibles; la visión está restringida al dominio de cámaras de robot del entrenamiento.

## Casos de uso

- Investigación en manipulación bimanual de horizonte largo: el modelo sirve como política de referencia en las 8 tareas de RoboDojo, con 100 demostraciones por tarea, para comparar variantes de ajuste fino bajo el mismo protocolo experimental.
- Reproducción de experimentos de VLA: al ser un finetune de RLWRLD/RLDX-1-PT con configuración conocida (batch 64, 60.000 pasos), permite replicar el pipeline de entrenamiento y medir el efecto del dataset RoboDojo-taco-luna frente al modelo base.
- Evaluación de anotación automática de subtareas: el modelo está entrenado con etiquetas generadas por GPT-5.6 Luna y contexto TASCO, de modo que sirve para estudiar hasta qué punto un planificador automático puede sustituir la anotación humana densa en datos de robot.
- Segmentación de tareas largas con planner externo: en un montaje real, un planificador de alto nivel descompone la tarea en subtareas, y esta política ejecuta cada una recibiendo el texto de la subtarea junto con las tres imágenes y la propiocepción.
- Base para ajuste fino en tareas propias: un laboratorio con su propio robot bimanual y sus demostraciones puede partir de este checkpoint, ya adaptado al dominio de mesa, en lugar de arrancar desde el backbone preentrenado.
- Estudio de robustez ante cambios de cámara: al estar condicionado por tres vistas concretas (cabeza, muñeca izquierda, muñeca derecha), permite analizar la degradación del rendimiento cuando la configuración de sensores varía.
- Prototipado en simulación o gemelo digital de mesa bimanual, antes de trasladar la política a hardware real, aprovechando que las entradas son imagen, propiocepción y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la configuración de entrenamiento (batch 64, 60.000 pasos, checkpoint final) y el conjunto de tareas cubierto (RoboDojo long-horizon: 8 tareas de robot real bimanual de mesa, 100 demostraciones cada una), sin tasas de éxito ni métricas comparativas. La búsqueda web realizada no ha devuelto documentación técnica, paper ni entrada de blog asociada a este checkpoint.

## Requisitos de hardware

- Peso de los parámetros: con 6.912.896.320 parámetros, los pesos en fp16/bf16 ocupan aproximadamente 13,8 GB, cifra coherente con el tamaño del repositorio (13,8 GB). En fp32 serían unos 27,6 GB.
- VRAM estimada para inferencia: aproximadamente 14 GB solo para pesos en fp16/bf16, más el coste de activaciones, buffers de las tres cámaras y de la ventana de 4 fotogramas; en la práctica se recomienda reservar bastante más margen. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la documentación. Por tamaño de modelo, encajan tarjetas con 24 GB o más (RTX 3090, RTX 4090, L4 con cuantización, L40S, A100 40/80 GB, H100).
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas de 24 GB con pesos en fp16/bf16, siempre que el resto del pipeline (backbone, tokenizer y demás componentes referenciados en las configs) se cargue en local. En tarjetas de 16 GB o menos haría falta cuantización, y no se han publicado checkpoints cuantizados.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; este tipo de políticas suelen servirse mediante el stack específico del backbone, y las configs del repositorio requieren apuntar a copias locales del backbone y del tokenizer.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rldx_1_robodojo_taco_luna_b64_60k | 6.912.896.320 (~6,9 mil M) | vídeo de 4 fotogramas, 3 vistas de cámara | no disponible | safetensors en HuggingFace, 0 descargas | Finetune sobre RoboDojo-taco-luna (8 tareas, 100 demostraciones cada una) |
| RLWRLD/RLDX-1-PT | no disponible | no disponible | no disponible | modelo base en HuggingFace (referenciado) | Backbone preentrenado del que deriva este checkpoint; no se dispone de sus especificaciones en la información proporcionada |
| Otras políticas VLA abiertas (familias OpenVLA, pi0, GR00T y similares) | no disponible | no disponible | no disponible | no disponible | No hay datos verificables en la información proporcionada; se omite cualquier cifra comparativa |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no puede asumirse permiso para uso comercial ni para redistribución del checkpoint o de los pesos derivados. Es un bloqueo potencial para producción.
- Sesgos conocidos: no documentados, pero el modelo está entrenado sobre 8 tareas concretas de mesa bimanual con 100 demostraciones cada una; el sesgo de dominio hacia esas tareas, objetos, iluminación y montaje de cámaras es previsible.
- Riesgo de alucinación: en el sentido lingüístico, no aplica; en el sentido conductual, existe riesgo de acciones incorrectas o incoherentes fuera de la distribución de tareas y de configuraciones de cámara vistas en entrenamiento.
- Dependencia del planificador: la model card indica explícitamente que la evaluación debe hacerse con el mismo modelo planificador (GPT-5.6 Luna) que generó las etiquetas de subtarea. Cambiar de planner altera la distribución de textos de entrada y puede degradar el comportamiento.
- Sin slot de keyframe: el modelo está entrenado sin entrada de keyframe, de modo que no cabe esperar que aproveche ese tipo de señal si se le proporciona.
- Configuración de carga frágil: las configs referencian el backbone y el tokenizer por hub id o por ruta local del sitio de entrenamiento; hay que redirigirlas a copias locales antes de cargar, lo que complica la reproducibilidad.
- Datos de benchmarks ausentes: no hay tasas de éxito publicadas, por lo que no es posible estimar el rendimiento real en producción.
- Idiomas no declarados: no hay información sobre el comportamiento del canal textual de subtareas en idiomas distintos del inglés.
- Huella de repositorio elevada (13,8 GB) y sin variantes cuantizadas publicadas, lo que limita el despliegue en hardware modesto.
- Advertencia general: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx_1_robodojo_taco_luna_b64_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/RoboDojo-taco-luna
- Modelo base RLWRLD/RLDX-1-PT: https://huggingface.co/RLWRLD/RLDX-1-PT
- Paper, blog o repositorio asociado: no disponible
- Demo o espacio de inferencia: no disponible
- Nota sobre la búsqueda web: los resultados devueltos no contenían documentación técnica del modelo (únicamente páginas genéricas de un dominio de comercio electrónico), por lo que no se han podido añadir enlaces adicionales verificables.
