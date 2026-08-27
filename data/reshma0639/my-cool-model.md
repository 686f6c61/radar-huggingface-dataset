# reshma0639/my-cool-model

## Resumen

MoSketch es un método de animación de bocetos multiobjeto presentado en ICCV 2025 por investigadores de la Universidad Renmin de China. A diferencia de los enfoques existentes que funcionan bien con un único objeto, MoSketch aborda el reto de animar escenas compuestas por varios objetos mediante una estrategia de divide y vencerás: primero descompone la escena en objetos individuales y planifica el movimiento de cada uno, y después optimiza el resultado de forma iterativa utilizando Score Distillation Sampling (SDS). El método es libre de datos de entrenamiento, ya que no requiere un conjunto de datos de bocetos animados, sino que parte de un modelo de difusión texto-vídeo preentrenado (ModelScopeT2V) y de un LLM para la comprensión semántica de la escena.

La implementación se distribuye como un repositorio de código y scripts, no como un modelo de pesos preentrenados. El repositorio en Hugging Face (reshma0639/my-cool-model) contiene el código y los datos del proyecto, con un tamaño de 23.5 GB. Aunque el nombre del repositorio es genérico, el contenido corresponde al proyecto MoSketch. El modelo card no especifica licencia, idiomas ni formato de pesos, por lo que estos datos se indican como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de optimización iterativa basada en Score Distillation Sampling (SDS); incluye módulos de descomposición de escena y planificación de movimiento basados en LLM, y un modelo de difusión texto-vídeo (ModelScopeT2V) como base |
| Parametros totales | no disponible (el checkpoint del modelo de difusión subyacente es de 1.7B, pero no se especifica el número de parámetros del sistema completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de texto; se usa un LLM externo para procesar la instrucción) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | no disponible (la instrucción se procesa mediante un LLM, pero no se especifica qué idiomas acepta) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se distribuye como código fuente y scripts de Python; no incluye pesos de red) |

## Arquitectura y entrenamiento

MoSketch no es un modelo de lenguaje ni un modelo generativo preentrenado, sino un sistema de optimización iterativa. Se basa en la técnica de Score Distillation Sampling (SDS) para refinar una secuencia de imágenes generadas por un modelo de difusión texto-vídeo (concretamente ModelScopeT2V, con 1.7B parámetros). El proceso se divide en cuatro módulos: descomposición de escena basada en LLM (que identifica los objetos presentes y sus atributos), planificación de movimiento basada en LLM (que genera una trayectoria de movimiento para cada objeto), refinamiento de movimiento multi-grano (que ajusta los detalles de las curvas Bézier) y composición de SDS (que integra las señales de gradiente de cada objeto). El método no requiere entrenamiento de red neuronal, sino que optimiza directamente los parámetros del boceto (las curvas Bézier) durante la inferencia.

El sistema se apoya en un LLM externo (no se especifica cuál) para la interpretación de la instrucción textual y la descomposición de la escena. El modelo de difusión proporciona las señales de gradiente que guían la optimización. El boceto de entrada debe estar en formato SVG con curvas Bézier cúbicas, con un tamaño recomendado de 256×256, menos de 300 trazos y un ancho de trazo entre 1 y 3. El proyecto proporciona un conjunto de 60 bocetos multiobjeto usados en el paper.

## Capacidades

- Animación de bocetos multiobjeto: genera secuencias de vídeo a partir de un boceto estático y una instrucción textual, moviendo cada objeto de forma coherente con la escena.
- Descomposición semántica de escena: usa un LLM para identificar los objetos presentes y sus roles en la animación.
- Planificación de movimiento por objeto: asigna una trayectoria de movimiento a cada objeto según la instrucción.
- Refinamiento de curvas Bézier: ajusta los trazos del boceto para lograr una animación suave y coherente.
- Integración con modelos de difusión texto-vídeo: utiliza el gradiente de un modelo T2V para guiar la optimización sin necesidad de datos de entrenamiento.
- Soporte para bocetos generados automáticamente con CLIPasso o manualmente con herramientas SVG (tras un preprocesamiento).

## Casos de uso

- Creación de GIFs animados a partir de bocetos simples: un usuario dibuja un boceto en SVG y escribe una instrucción como "el gato salta sobre la mesa" y MoSketch genera una secuencia animada de unos segundos.
- Producción de storyboards animados: los diseñadores pueden usar bocetos conceptuales para generar animaciones preliminares que comuniquen ideas de movimiento sin necesidad de dibujar cada fotograma.
- Educación y entretenimiento: en aplicaciones educativas, se puede animar diagramas o ilustraciones para explicar conceptos científicos o históricos con movimiento.
- Diseño de personajes en animación: los artistas pueden probar diferentes movimientos para un personaje en un boceto multiobjeto y seleccionar el mejor resultado antes de pasar a la producción.
- Generación de contenido para redes sociales: crear animaciones personalizadas a partir de dibujos simples y descripciones textuales, sin requerir herramientas complejas de animación.
- Investigación en visión por computador: sirve como base para estudiar la animación de bocetos y la planificación de movimiento en escenas complejas, y puede integrarse con otros sistemas de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información proporcionada. El artículo de arXiv (2503.19351) presenta experimentos cualitativos y comparaciones visuales con otros métodos de animación de bocetos, pero no se incluyen métricas numéricas como PSNR, FID o IoU en la model card. Por lo tanto, no es posible presentar una tabla de resultados sin inventar datos.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM o GPU en la información disponible.
- El sistema utiliza un modelo de difusión texto-vídeo de 1.7B parámetros (ModelScopeT2V), por lo que se requiere una GPU con suficiente memoria para ejecutar ese modelo. Se recomienda al menos 16 GB de VRAM para una inferencia razonable, aunque el valor exacto no está documentado.
- El código se ejecuta en Python y requiere instalar dependencias como diffvg, que necesita compilación con CMake y FFmpeg.
- No se menciona compatibilidad con GPUs consumer específicas, pero es probable que una RTX 3090 o RTX 4090 pueda ejecutar el modelo de difusión con cuantización o con menor resolución.
- Opciones de despliegue: se ejecuta como un script Python local; no se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia.
- El proceso de optimización iterativa puede ser computacionalmente intensivo, ya que requiere múltiples pasadas de SDS.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la model card. Existen otros métodos de animación de bocetos, como Sketch Animator o Clipasso, pero no se proporcionan datos cuantitativos ni cualitativos que permitan una comparación objetiva. Por lo tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- El método requiere bocetos de entrada en formato SVG con curvas Bézier cúbicas y un número de trazos inferior a 300; bocetos más complejos o con otro formato no serán procesados correctamente.
- La optimización iterativa puede ser lenta y sensible a los hiperparámetros; puede no converger para instrucciones muy complejas o con múltiples objetos con movimientos superpuestos.
- No se especifica la licencia del código ni del modelo, por lo que se desaconseja su uso en entornos de producción sin aclarar los términos legales.
- No se indica si el LLM utilizado para la descomposición y la planificación es de código abierto o si requiere una API externa; esto puede afectar la reproducibilidad.
- No se mencionan sesgos o alucinaciones, pero al depender de un LLM y de un modelo de difusión, el resultado puede ser sensible a las instrucciones textuales y generar movimientos no deseados.
- El proyecto está orientado a investigación y no proporciona una interfaz de usuario ni una API lista para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/reshma0639/my-cool-model
- Página del proyecto: https://rucmm.github.io/MoSketch
- Paper en arXiv: https://arxiv.org/abs/2503.19351
- Código en GitHub: https://github.com/jyliu-98/MoSketch
- Checkpoint de ModelScopeT2V: https://huggingface.co/ali-vilab/text-to-video-ms-1.7b/tree/main
