# Saraswathy/vlm-mix-geometry-expert-step100

## Resumen

VLM-Mix Geometry Expert es un adaptador LoRA (PEFT) de rango 64 desarrollado por Saraswathy Amjith, investigadora de MIT CSAIL, como parte de experimentos de mezcla de modelos de vision-lenguaje (VLM mixture). El adaptador está diseñado específicamente para convertir el modelo base Qwen/Qwen3-VL-4B-Instruct en un especialista en geometría de nivel escolar, un componente modular dentro de un sistema más amplio de mezcla de expertos.

El modelo se distribuye como un adaptador PEFT que contiene únicamente los pesos del adaptador, no el modelo base completo. Está anclado a una revisión específica del modelo base (ebb281ec70b05090aa6165b016eac8ec08e71b17) para garantizar reproducibilidad. Con un tamaño de repositorio de 0,5 GB, el adaptador es ligero y puede cargarse sobre el modelo base Qwen3-VL-4B-Instruct para obtener capacidades especializadas en razonamiento geométrico visual.

La relevancia de este modelo radica en su enfoque modular: en lugar de entrenar un modelo monolítico para todas las tareas, se entrena un conjunto de especialistas (como este experto en geometría) que pueden combinarse dinámicamente según la tarea. Este enfoque de mezcla de expertos a nivel de adaptador es una línea de investigación activa para mejorar la eficiencia y la especialización sin aumentar los requisitos de computación en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre Qwen3-VL-4B-Instruct (transformer multimodal) |
| Parametros totales | no disponible (adaptador LoRA rango 64; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors, cuantizacion no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen3-VL-4B-Instruct, un modelo de vision-lenguaje de la familia Qwen3-VL con 4 mil millones de parametros. Qwen3-VL combina un codificador de vision con un transformer de lenguaje, soportando entrada de imagenes y texto para tareas de respuesta a preguntas visuales.

El adaptador LoRA tiene rango 64 y alpha 128, lo que indica una capacidad de adaptacion moderada-alta. El entrenamiento se realizo como parte de los experimentos VLM mixture/PoEM, aunque no se especifican los datos de entrenamiento exactos ni el numero de pasos mas alla del nombre "step100" que sugiere 100 pasos de optimizacion. La autora ha trabajado en marcos de auto-cuestionamiento con GRPO y razonamiento visual, lo que sugiere que el entrenamiento pudo haber utilizado tecnicas de aprendizaje por refuerzo, aunque esto no se confirma en la informacion disponible.

Una innovacion destacable es el anclaje del adaptador a una revision especifica del modelo base, lo que garantiza que los resultados sean reproducibles incluso si el modelo base se actualiza en el futuro.

## Capacidades

- Razonamiento geometrico visual especializado: el adaptador esta entrenado para resolver problemas de geometria de nivel escolar a partir de imagenes.
- Respuesta a preguntas visuales (VQA): hereda la capacidad del modelo base Qwen3-VL-4B-Instruct para procesar imagenes y texto.
- Comprension de diagramas y figuras geometricas: el entrenamiento especifico en geometria mejora la capacidad del modelo para interpretar figuras, angulos, formas y relaciones espaciales.
- Integracion modular: al ser un adaptador PEFT, puede combinarse con otros adaptadores especializados en un sistema de mezcla de expertos.
- Capacidades multilingues: no disponibles especificamente, aunque el modelo base Qwen3-VL-4B-Instruct soporta multiples idiomas.

## Casos de uso

- Educacion matematica asistida por IA: el modelo puede analizar fotografias de problemas de geometria de libros de texto y proporcionar soluciones paso a paso, util para plataformas de tutoria automatizada o asistentes de estudio.
- Generacion de contenido educativo: puede utilizarse para crear ejercicios de geometria con soluciones explicadas a partir de figuras generadas o existentes, facilitando la produccion de materiales didacticos.
- Evaluacion automatizada de examenes: en entornos educativos, el modelo puede corregir respuestas de estudiantes en problemas de geometria visual, comparando la solucion del estudiante con la esperada.
- Investigacion en sistemas de mezcla de expertos: el adaptador sirve como componente de referencia en experimentos academicos sobre combinacion dinamica de especialistas VLM, permitiendo evaluar estrategias de enrutamiento y mezcla.
- Prototipado rapido de asistentes de razonamiento espacial: desarrolladores pueden integrar este adaptador en aplicaciones que requieran comprension de figuras geometricas, como herramientas de diseño asistido o realidad aumentada educativa.
- Benchmark de especializacion en VLM: el adaptador puede utilizarse como punto de comparacion para medir el rendimiento de modelos generalistas frente a especialistas en tareas de geometria visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento en conjuntos de datos estandar como MMLU, HumanEval o benchmarks de geometria visual. El repositorio de experimentos asociado mantiene los resultados comparativos, pero no son accesibles desde la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen3-VL-4B-Instruct, los requisitos de VRAM dependen del modelo base. Con cuantizacion de 4 bits, se estiman entre 4-6 GB de VRAM; sin cuantizacion, entre 8-10 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 (para mayor velocidad de inferencia).
- Compatibilidad con GPU de consumo: si, el modelo base de 4B parametros con cuantizacion cabe en GPUs consumer de gama media-alta.
- Opciones de despliegue: el adaptador PEFT requiere cargarse sobre el modelo base con la libreria PEFT de HuggingFace. Para inferencia, puede usarse transformers con PEFT integrado, o exportarse a formatos optimizados como vLLM (requiere fusionar el adaptador con el modelo base previamente).
- Latencia y throughput: no disponibles. Dependen del hardware y del modelo base, no del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| VLM-Mix Geometry Expert (este modelo) | 4B (base) + LoRA rank 64 | no disponible | Geometria escolar visual | Apache 2.0 |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | Generalista multimodal | Apache 2.0 |
| GeoWorld-VLM | no disponible | no disponible | Razonamiento espacial y geometria | no disponible |

La comparativa directa con otros adaptadores especializados en geometria no es posible con la informacion disponible. GeoWorld-VLM es un proyecto relacionado (mencionado en los resultados de busqueda) que aborda la geometria desde un enfoque diferente: destilacion de modelos de mundo en VLMs, mientras que este adaptador utiliza un enfoque de fine-tuning clasico con LoRA.

## Limitaciones y advertencias

- El adaptador contiene solo los pesos del adaptador, no el modelo base ni los datos de entrenamiento. Para usarlo, es necesario descargar Qwen/Qwen3-VL-4B-Instruct y fijar la revision exacta ebb281ec70b05090aa6165b016eac8ec08e71b17.
- No se dispone de informacion sobre los datos de entrenamiento, por lo que pueden existir sesgos derivados del conjunto de datos utilizado, especialmente limitaciones en la diversidad de estilos de figuras geometricas o sistemas educativos.
- El nombre "step100" sugiere un entrenamiento muy corto (100 pasos), lo que podria limitar la robustez del adaptador en problemas fuera del dominio de entrenamiento.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas de geometria es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-4B-Instruct tiene su propia licencia que debe verificarse para uso en produccion.
- El adaptador esta pensado como artefacto de investigacion, no como solucion lista para produccion. La autora recomienda cargarlo con PEFT sobre el modelo base anclado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-geometry-expert-step100
- Perfil GitHub de la autora: https://github.com/saraswathyamjith
- Pagina personal de la autora: https://saraamjith.com/saraamjith.html
- Proyecto relacionado GeoWorld-VLM (arXiv): https://arxiv.org/abs/2605.16713
- Repositorio GeoWorld-VLM (GitHub): https://github.com/Harvard-AI-and-Robotics-Lab/GeoWorld-VLM/
