# intellitour/Qwen3.8-27B-oQ4e-fp16-mtp-Fixed-Chat-Templates

## Resumen

El modelo `intellitour/Qwen3.8-27B-oQ4e-fp16-mtp-Fixed-Chat-Templates` es una cuantización 4-bit del modelo Qwen3.8-27B, desarrollado por el equipo de Qwen (Alibaba). Esta versión concreta ha sido generada por el usuario intellitour utilizando la herramienta oMLX v0.6.0, que aplica una cuantización mixta de precisión (oQ) sobre los pesos del modelo original, y posteriormente incorpora las plantillas de chat corregidas del repositorio `froggeric/Qwen-Fixed-Chat-Templates`. El resultado es un modelo denso de 27B parámetros, optimizado para ejecutarse en hardware Apple Silicon mediante el framework MLX.

El modelo base Qwen3.8-27B es un modelo de lenguaje y visión de última generación, con una ventana de contexto de 262K tokens, diseñado para tareas complejas de razonamiento, generación de código, agente multi-paso y comprensión de imágenes y vídeo. Esta cuantización reduce el tamaño de los pesos a aproximadamente 17.9 GB, lo que permite ejecutarlo en GPUs con 24 GB de VRAM o en Macs con suficiente memoria unificada, manteniendo un equilibrio entre rendimiento y consumo de recursos. La licencia Apache 2.0 facilita su uso comercial y su integración en productos.

La relevancia de este modelo radica en que combina las capacidades avanzadas de la serie Qwen3.8 (visión nativa, razonamiento flexible, tool calling) con un formato optimizado para despliegue en entornos con recursos limitados, algo especialmente útil para desarrolladores que trabajan con Apple Silicon o GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (dense transformer, vision-language en el modelo base) |
| Parametros totales | 27B (modelo original); el archivo safetensors reporta 4.926.794.992, posiblemente un error de metadata |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262K tokens (modelo base) |
| Tipos de cuantizacion | 4-bit (oQ4e, group size 64, mixed-precision) |
| Idiomas soportados | multilingue (no especificado en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa, sin mezcla de expertos (MoE), con atención completa y un diseño optimizado para manejar secuencias largas (hasta 262K tokens). Es un modelo nativamente multimodal: acepta entradas de texto, imagen y vídeo, y puede alternar entre modos de razonamiento rápido y profundo mediante un mecanismo de "thinking control". El entrenamiento del modelo base no se detalla en la información proporcionada, pero se sabe que la serie Qwen3.8 ha sido entrenada con grandes volúmenes de datos multilingües y multimodales, con fases de supervisión y refinamiento por preferencias.

La cuantización aplicada en este repositorio utiliza la técnica oQ (mixed-precision quantization) implementada en oMLX v0.6.0. Esta técnica asigna diferentes precisiones a distintas capas según su sensibilidad, logrando una compresión 4-bit con un group size de 64. Además, se han añadido las plantillas de chat corregidas del repositorio `froggeric/Qwen-Fixed-Chat-Templates`, que ajustan los formatos de conversación para evitar errores comunes en la generación de respuestas. No se han publicado detalles sobre el conjunto de datos de calibración utilizado para la cuantización.

## Capacidades

- Generacion de texto y razonamiento complejo: el modelo base es capaz de resolver problemas de logica, matematicas y ciencias, con un modo de razonamiento explicito que genera cadenas de pensamiento.
- Comprension de imagenes y video: el modelo original acepta entradas visuales y puede describir, analizar y responder preguntas sobre contenido visual. Nota: la cuantizacion MLX podria no incluir el encoder de vision, por lo que esta capacidad podria estar limitada en esta version.
- Generacion de codigo: soporta lenguajes como Python, Java, C++, entre otros, y puede completar o generar funciones completas.
- Tool calling / function calling: el modelo base esta entrenado para invocar herramientas externas y APIs, lo que permite integrarlo en agentes.
- Capacidades de agente multi-paso: puede planificar y ejecutar secuencias de acciones complejas, gestionando feedback del entorno.
- Multilingue: soporta decenas de idiomas, incluyendo espanol, ingles, chino, frances, aleman, etc.
- Modo de pensamiento flexible: permite activar o desactivar el razonamiento profundo segun la tarea.

## Casos de uso

- Atencion al cliente automatizada: con 262K de contexto, el modelo puede mantener conversaciones largas y contextualizadas, gestionando historiales completos de interacciones. Su capacidad multilingue permite atender a clientes en varios idiomas sin necesidad de modelos separados.
- Generacion de codigo en produccion: el modelo soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para autogenerar tests, documentacion o parches. Su tamaño cuantizado permite ejecutarlo en GPUs de gama media, reduciendo costes de infraestructura.
- Analisis de documentos largos: gracias a su ventana de 262K tokens, puede resumir, extraer informacion y responder preguntas sobre informes, libros o contratos extensos en una sola pasada.
- Asistentes de investigacion cientifica: el modelo puede razonar sobre articulos, combinar informacion de multiples fuentes y sugerir hipotesis. Su modo de razonamiento profundo ayuda en tareas de analisis critico.
- Agentes de automatizacion de tareas: con tool calling y planificacion multi-paso, puede interactuar con APIs, bases de datos y servicios web para ejecutar flujos de trabajo complejos, como la gestion de inventarios o la programacion de citas.
- Desarrollo de aplicaciones de vision por computador (si se preserva la capacidad visual): el modelo base puede describir imagenes, detectar objetos o transcribir texto en imagenes, util para sistemas de moderacion de contenido o asistentes de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion. Los siguientes datos corresponden al modelo base Qwen3.8-27B, segun la informacion disponible en la web:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE (software engineering) | 42.2 |
| Terminal Bench (agentes) | 73.0 |
| OSWorld (interaccion con SO) | 84.3 |
| MathVision (razonamiento matematico visual) | no disponible en la fuente |

Estos valores son orientativos; la cuantizacion 4-bit puede producir una degradacion tipica de entre 1 y 3 puntos porcentuales en tareas de razonamiento, aunque no se ha medido en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB con cuantizacion 4-bit y contexto completo. Para contextos mas cortos, puede reducirse a 14 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB o 80 GB) o equivalentes. En Apple Silicon, se recomienda un chip M1 Pro/Max o superior con al menos 32 GB de memoria unificada.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3090/4090 y en Macs con suficiente memoria unificada.
- Opciones de despliegue: al estar en formato MLX, se puede ejecutar con el framework MLX (Python) o mediante herramientas como `mlx-lm`. Para otros entornos, seria necesario convertir a GGUF (llama.cpp) o a otros formatos, aunque se perderia la optimizacion oQ.
- Latencia y throughput estimados: no disponibles. Depende del hardware; en una RTX 4090 se pueden esperar velocidades de 20-40 tokens/s con batch size 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Si | Apache 2.0 | safetensors (BF16) |
| Qwen2.5-27B | 27B | 128K | No | Apache 2.0 | safetensors |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 | safetensors |

Esta cuantizacion ofrece una alternativa mas ligera al modelo base, con un rendimiento ligeramente inferior pero mucho menor consumo de memoria. Comparado con Llama 3.1 8B, tiene mas parametros y capacidades multimodales, aunque requiere mas VRAM. No se dispone de comparativas directas con otras cuantizaciones del mismo modelo.

## Limitaciones y advertencias

- La cuantizacion 4-bit puede degradar la precision en tareas de razonamiento matematico o logico complejo, asi como en generacion de codigo con sintaxis muy especifica.
- La capacidad de vision del modelo base podria no estar disponible en esta version MLX, ya que el encoder de vision podria no haberse cuantizado o no estar incluido en el archivo. Se recomienda verificar antes de usarla.
- El numero de parametros reportado en el archivo safetensors (4.9B) es inconsistente con el modelo base de 27B; esto podria indicar un error en la metadata o que el archivo solo contiene una parte de los pesos. Se recomienda validar la integridad del modelo antes de su uso en produccion.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta cuantizacion. Como cualquier modelo de lenguaje, puede generar contenido falso o sesgado.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribucion y las condiciones de la licencia del modelo base (tambien Apache 2.0).
- El modelo esta optimizado para MLX, por lo que su uso en otros frameworks (PyTorch, TensorFlow) requiere conversion adicional que podria afectar al rendimiento.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/intellitour/Qwen3.8-27B-oQ4e-fp16-mtp-Fixed-Chat-Templates
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de plantillas de chat corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Herramienta de cuantizacion oMLX: https://github.com/jundot/omlx
- Guia del modelo Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Pagina del modelo en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
