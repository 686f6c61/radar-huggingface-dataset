# shoemoney/Ornith-1.5-9B-Abliterated-MLX-q5

## Resumen

Ornith-1.5-9B-Abliterated-MLX-q5 es una cuantización en 5 bits del modelo Ornith-1.5-9B-Abliterated, desarrollado por el usuario de HuggingFace shoemoney. El modelo base, Ornith-1.5-9B, es un modelo denso de aproximadamente 9 000 millones de parámetros creado por ornith-ai, con licencia MIT y orientado a tareas de código, razonamiento y matemáticas. La versión "abliterated" elimina las restricciones de seguridad del modelo original, lo que permite generar contenido sin censura, aunque con los riesgos asociados.

La cuantización MLX en 5 bits reduce el tamaño del modelo a 7,58 GB en disco, lo que permite ejecutarlo en equipos Apple Silicon con memoria unificada. Se midió en un Apple M3 Ultra con 96 GB, alcanzando un throughput de 67,6 tokens por segundo en peticiones individuales y 164,4 tokens por segundo con 8 peticiones concurrentes. La perplejidad medida es de 5,325, aunque solo es comparable dentro de la misma familia de modelos.

Este modelo es relevante para desarrolladores que trabajan en ecosistemas Apple y necesitan un modelo de código y razonamiento de alto rendimiento, con la flexibilidad de una licencia permisiva y la posibilidad de ejecutarlo localmente sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (los tags de HuggingFace indican qwen3_5, aunque no se confirma en la documentacion) |
| Parametros totales | ~9B (modelo base); el archivo safetensors reporta 2 135 710 960, discrepancia sin aclarar |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5 bits (q5) con grupo de 64, convertido desde BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso, sin arquitectura MoE, diseñado para tareas de código y razonamiento. Segun la informacion publicada por ornith-ai, el entrenamiento se basa en un enfoque de "self-scaffolding" y "self-improvement": el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de mejora. No se han publicado detalles sobre el volumen de datos de entrenamiento ni la composicion del dataset.

La version abliterated, creada por huihui-ai, elimina las capas de rechazo y las restricciones de seguridad del modelo original, de modo que el modelo responde sin filtros a peticiones que normalmente serian bloqueadas. La cuantizacion MLX realizada por shoemoney es una conversion puramente tecnica: los pesos se redujeron de BF16 a 5 bits con `mlx_vlm.convert`, sin fine-tuning ni re-alineamiento posterior.

## Capacidades

- Generacion de codigo en multiples lenguajes, con buen rendimiento en tareas de programacion (SWE-bench Verified 70,6).
- Razonamiento cientifico y logico, con 86,4 en GPQA Diamond.
- Soporte de conversaciones multi-turno, aunque no se especifica la longitud de contexto.
- Capacidad de procesamiento de vision, segun el tag `mlx-vlm` (modelo vision-language), aunque no se detallan las capacidades exactas.
- Al ser una version abliterated, no aplica filtros de contenido, lo que permite generar respuestas sin censura en temas sensibles.
- No se ha confirmado soporte de tool calling o function calling, aunque es probable dado su enfoque en codigo.

## Casos de uso

- Asistente de programacion en equipos Apple: el modelo puede generar, revisar y explicar codigo directamente en una Mac, aprovechando la integracion con MLX y la baja latencia en hardware Apple Silicon.
- Desarrollo de agentes de razonamiento: gracias a su capacidad para resolver problemas complejos (GPQA Diamond 86,4), puede integrarse en pipelines de razonamiento multi-paso, como sistemas de pregunta-respuesta cientifica o analisis de documentos tecnicos.
- Generacion de codigo en entornos sin conexion: al ser un modelo local, permite trabajar sin conexion a internet, util en entornos con restricciones de seguridad o en desarrollo de software embebido.
- Prototipado rapido de aplicaciones de vision-lenguaje: al ser un modelo VLM (mlx-vlm), puede usarse para tareas de descripcion de imagenes o respuesta a preguntas visuales, aunque no se han publicado ejemplos concretos.
- Investigacion en alineacion y seguridad: la version abliterated permite estudiar el comportamiento del modelo sin restricciones, util para investigacion academica sobre sesgos y riesgos de los modelos de lenguaje.
- Educacion y formacion: puede usarse como herramienta de aprendizaje para programacion y razonamiento, aunque se debe tener precaucion por la ausencia de filtros de contenido.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados para el modelo base Ornith-1.5-9B:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 70,6 |
| GPQA Diamond | 86,4 |

Para la version cuantizada MLX, se midio una perplejidad de 5,325 sobre `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123). Este valor solo es comparable dentro de la familia de cuantizaciones del mismo modelo base, no con otros modelos. No se dispone de comparativas con modelos similares en la informacion proporcionada.

## Requisitos de hardware

- El modelo en formato MLX 5 bits ocupa 7,58 GB en disco, por lo que requiere al menos 8 GB de memoria unificada en Apple Silicon para cargar los pesos.
- Se probo en un Apple M3 Ultra con 96 GB de memoria unificada, alcanzando 67,6 tokens/s en peticiones individuales y 164,4 tokens/s con 8 peticiones concurrentes.
- Es compatible con cualquier Mac con chip Apple Silicon (M1, M2, M3, M4) y suficiente memoria unificada; se recomienda un minimo de 16 GB para un uso comodo.
- No esta pensado para GPUs NVIDIA de forma nativa, aunque el modelo base BF16 puede ejecutarse en GPUs con al menos 24 GB de VRAM (por ejemplo, RTX 4090) usando otras herramientas como vLLM o TGI.
- Para despliegue, se utiliza la libreria `mlx-vlm` (no `mlx-lm`), que permite generar texto y procesar imagenes. Tambien se puede usar con servidores OpenAI-compatibles si se convierte a otros formatos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (modelos de codigo de ~9B). Los datos de benchmarks publicados (SWE-bench, GPQA) no vienen acompanados de resultados de modelos alternativos en las fuentes consultadas. Se recomienda consultar el repositorio de ornith-ai para posibles comparaciones futuras.

## Limitaciones y advertencias

- Al ser una version abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No debe usarse en aplicaciones orientadas al publico general sin un sistema de moderacion externo.
- La perplejidad medida (5,325) no es comparable con otros modelos, ya que depende del tokenizador y del conjunto de datos de evaluacion.
- No se ha confirmado la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas.
- El formato MLX es exclusivo de Apple Silicon; para otros entornos es necesario convertir los pesos a otros formatos (GGUF, safetensors BF16), lo que puede requerir hardware adicional.
- La discrepancia entre los parametros reportados en safetensors (2,1B) y el tamano declarado del modelo (~9B) no esta aclarada, lo que podria indicar un error en los metadatos o una cuantizacion parcial.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para esta version cuantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Ornith-1.5-9B-Abliterated-MLX-q5
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Modelo original Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Pagina principal de Ornith AI: https://ornith.ai/
- Ficha en AI/TLDR: https://ai-tldr.dev/models/ornith-1-5-9b/
