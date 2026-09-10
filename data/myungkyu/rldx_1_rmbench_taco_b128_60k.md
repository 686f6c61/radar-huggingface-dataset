# Myungkyu/rldx_1_rmbench_taco_b128_60k

## Resumen

`Myungkyu/rldx_1_rmbench_taco_b128_60k` es una política robótica de bajo nivel (low-level policy) desarrollada por el usuario Myungkyu, obtenida por ajuste fino supervisado del modelo base `RLWRLD/RLDX-1-PT`. Se trata de un modelo de tipo VLA (vision-language-action) orientado a manipulación de sobremesa: recibe imágenes de tres cámaras (cabeza y muñecas izquierda y derecha), información propioceptiva y el texto de la subtarea actual, y produce acciones de control de bajo nivel. Su ámbito de aplicación declarado son las 9 tareas simuladas de tipo tabletop del benchmark RMBench.

El ajuste se realizó sobre el dataset `Myungkyu/RMBench-taco-gemini`, compuesto por demostraciones de RMBench anotadas de forma offline con etiquetas densas de subtarea derivadas del contexto específico de cada tarea. El entrenamiento usó un optimizador con tamaño de lote 128 durante 60.000 pasos, y el repositorio publicado corresponde al checkpoint final. El modelo tiene 6.912.896.320 parámetros (~6,91 mil millones) en formato safetensors, con un repositorio de 13,8 GB.

La relevancia de esta ficha es acotada y conviene ser explícito: no es un modelo de propósito general ni un LLM, sino un artefacto de investigación en robótica con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas declarados. Las búsquedas web realizadas no han devuelto ningún resultado relacionado con el modelo, el autor o el dataset (los resultados obtenidos tratan sobre Instagram, Steam y Zhihu), por lo que toda la información técnica procede exclusivamente de la model card y de los metadatos del repositorio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre el backbone `RLDX-1-PT`; detalles internos de la arquitectura no disponibles |
| Parametros totales | 6.912.896.320 (~6,91 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (incluye entrada de texto de subtarea; idioma no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | robotics |
| Modalidades de entrada | imágenes de cabeza + muñeca izquierda + muñeca derecha, propiocepción, texto de subtarea, slot de keyframe (frame pasado recuperado) |
| Ventana de vídeo | 4 (según model card) |
| Modelo base | `RLWRLD/RLDX-1-PT` |
| Dataset de ajuste | `Myungkyu/RMBench-taco-gemini` |
| Tamaño del repositorio | 13,8 GB |
| Configuración de entrenamiento | optimizador batch 128, 60.000 pasos, checkpoint final |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como una política de bajo nivel para RMBench, ajustada desde `RLWRLD/RLDX-1-PT`. La arquitectura subyacente es la del backbone RLDX-1-PT, que la ficha caracteriza como un modelo VLA con una ventana de vídeo de longitud 4 y cuatro entradas visuales: tres vistas de cámara (cabeza, muñeca izquierda, muñeca derecha) más un slot de keyframe. No se proporcionan detalles sobre el número de capas, el mecanismo de atención, el encoder visual, el tokenizador ni la dimensionalidad del espacio de acciones; esos datos figuran como no disponibles.

El entrenamiento consiste en un ajuste fino supervisado sobre el dataset `Myungkyu/RMBench-taco-gemini`, formado por demostraciones de RMBench con etiquetas densas de subtarea obtenidas mediante anotación offline a partir del contexto específico de cada tarea. La configuración empleada es un optimizador con batch 128 y 60.000 pasos, del cual se publica el checkpoint final. No se documentan en la información disponible fases de RLHF, DPO, destilación ni ningún otro procedimiento de alineamiento, ni se indica el número de tokens o de transiciones visto durante el entrenamiento.

Un aspecto operativo destacable, señalado por el propio autor, es que el slot de keyframe recibe un frame pasado recuperado cuando la etiqueta de la subtarea lo requiere, lo que introduce una forma de condicionamiento por recuperación temporal dentro de la política. La model card advierte además de que las configuraciones referencian el backbone y el tokenizador base por identificador de hub o por la ruta local del sitio de entrenamiento, por lo que es necesario redirigirlas a copias locales antes de cargar el modelo.

## Capacidades

- Generación de acciones de control de bajo nivel para manipulación robótica de sobremesa a partir de observaciones visuales y propioceptivas.
- Percepción multi-cámara: procesa de forma conjunta las vistas de cabeza, muñeca izquierda y muñeca derecha.
- Condicionamiento por lenguaje: acepta el texto de la subtarea actual como entrada, lo que permite dirigir el comportamiento con instrucciones textuales de subtarea.
- Condicionamiento por keyframe: puede tomar un frame pasado recuperado en un slot dedicado cuando la etiqueta de subtarea lo indica.
- Ejecución de tareas tabletop simuladas: la model card lo sitúa explícitamente en las 9 tareas de RMBench.
- Integración con etiquetas densas de subtarea: está ajustado sobre anotaciones de subtarea, por lo que su comportamiento está alineado con una descomposición explícita de la tarea en subtareas.
- Tool calling / function calling: no disponible (no es una capacidad propia de una política de acción).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; la descomposición en subtareas existe en los datos de entrenamiento, pero no se documenta un bucle de agente.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio, generación de texto libre o código: no disponibles / no aplicables según la información proporcionada.

## Casos de uso

- Investigación en manipulación de sobremesa en simulación: el modelo está ajustado específicamente sobre las 9 tareas tabletop de RMBench, por lo que su uso natural es servir como política de referencia o como punto de partida en experimentos dentro de ese benchmark.
- Reproducción de resultados en RMBench: al publicarse el checkpoint final del ajuste (batch 128, 60.000 pasos) sobre un dataset identificado, permite reproducir o auditar la configuración de entrenamiento declarada por el autor.
- Ajuste fino posterior con etiquetas densas de subtarea: el modelo está entrenado con el esquema de anotación de `RMBench-taco-gemini`, de modo que sirve como inicialización para experimentos que usen el mismo formato de subtarea textual y el mismo conjunto de cámaras.
- Estudio del condicionamiento por keyframe: el slot de keyframe recuperado es una particularidad del diseño que puede aislarse experimentalmente para medir su efecto sobre la política, comparando ejecuciones con y sin frame recuperado.
- Comparación de esquemas de anotación: al derivar las etiquetas de subtarea del contexto específico de cada tarea mediante anotación offline, el modelo es un candidato para comparar anotación densa frente a esquemas de anotación más gruesos en aprendizaje por imitación.
- Base para experimentos de sim-to-real: una política de 6,91 mil millones de parámetros entrenada en simulación puede emplearse como punto de partida en estudios de transferencia, siempre que se disponga del mismo conjunto de cámaras (cabeza, muñeca izquierda, muñeca derecha) y de propiocepción.
- Evaluación de robustez multi-cámara: al consumir tres vistas simultáneas, permite experimentos de ablación sobre qué vista aporta información crítica en cada subtarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card identifica el benchmark objetivo (RMBench, 9 tareas tabletop simuladas) y la configuración de entrenamiento, pero no incluye tasas de éxito, métricas por tarea ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de 16 bits: aproximadamente 13,8 GB solo para los pesos (coincide con el tamaño del repositorio, 13,8 GB), más la memoria de activaciones de los encoders visuales y de la ventana de vídeo de longitud 4.
- VRAM estimada en cuantización de 8 bits: del orden de 7 GB para los pesos; no se confirma que existan checkpoints cuantizados publicados (tipos de cuantización: no disponible).
- VRAM estimada en cuantización de 4 bits: del orden de 3,5-4 GB para los pesos; igualmente, sin checkpoints cuantizados confirmados en la información disponible.
- GPU recomendadas: A100 (40 GB o 80 GB) o H100 para inferencia cómoda en 16 bits y para servir varias instancias; estas recomendaciones son estimaciones a partir del número de parámetros, no datos aportados por el autor.
- Cabe en GPU de consumo: con 24 GB de VRAM (por ejemplo, RTX 4090 o RTX 3090) es plausible cargar los pesos en 16 bits, pero el margen es estrecho una vez añadidas las activaciones de tres streams de imagen más el slot de keyframe; en ese escenario es preferible cuantización de 8 o 4 bits.
- Opciones de despliegue: la información disponible solo indica pesos en safetensors y la necesidad de apuntar las configuraciones del backbone y del tokenizador a copias locales. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y estas herramientas no son adecuadas para una política de acción continua.
- Latencia y throughput: no disponibles. Al tratarse de una política de control, la latencia relevante es la frecuencia de control del entorno de simulación, dato que no se especifica.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. En la información proporcionada no aparecen alternativas de la misma categoría (políticas VLA para manipulación) con datos verificables de parámetros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| `Myungkyu/rldx_1_rmbench_taco_b128_60k` | 6,91 mil millones | no disponible | no disponible | safetensors en HuggingFace, 0 descargas | no disponible |
| Alternativas de la misma categoria (VLA para manipulación) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito restringido: es una política de bajo nivel entrenada para las 9 tareas tabletop simuladas de RMBench; no es un modelo de propósito general y no debe esperarse transferencia directa a otras morfologías, entornos o conjuntos de tareas.
- Licencia no declarada: el repositorio no especifica licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: aunque el modelo consume texto de subtarea, no se especifica el idioma ni la cobertura lingüística de ese condicionamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo análogo de que la política genere acciones no válidas o inconsistentes con la subtarea indicada fuera de la distribución de entrenamiento.
- Dependencia de la configuración: la model card advierte de que las configuraciones referencian el backbone y el tokenizador por identificador de hub o por rutas locales del sitio de entrenamiento; es obligatorio redirigirlas a copias locales y verificar que el tokenizador y el backbone son consistentes con el ajuste.
- Dependencia de entradas concretas: requiere tres cámaras (cabeza, muñeca izquierda, muñeca derecha), propiocepción y texto de subtarea; sin ese conjunto completo de entradas el modelo no puede operar como fue entrenado.
- Sin evidencia de rendimiento publicada: no hay tasas de éxito, curvas de entrenamiento ni evaluaciones en la información disponible, por lo que su calidad real no puede verificarse a partir de lo documentado.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, y ninguna mención en las búsquedas web realizadas; esto reduce la probabilidad de encontrar soporte, incidencias resueltas o reproducciones independientes.
- Estado del repositorio: los metadatos indican fechas de creación y actualización muy próximas entre sí (segundos de diferencia), lo que sugiere una publicación automatizada sin mantenimiento posterior documentado.
- Ausencia de datos de entrenamiento detallados: no se indica el número de transiciones, la composición exacta del dataset ni el procedimiento de anotación más allá de la descripción de etiquetas densas derivadas del contexto de tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx_1_rmbench_taco_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset de ajuste: https://huggingface.co/datasets/Myungkyu/RMBench-taco-gemini
- Paper, blog, repositorio o demo del modelo: no disponible (las búsquedas web realizadas no devolvieron ningún resultado relacionado con el modelo, el autor, el dataset ni el benchmark RMBench)
