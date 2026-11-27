# memtrace/ariadne-1.0

## Resumen

Ariadne 1.0 es un modelo de embeddings especializado en busqueda semantica de codigo, desarrollado por Memtrace. Su funcion es convertir fragmentos de codigo y preguntas en lenguaje natural sobre ese codigo en vectores densos de 768 dimensiones, de forma que fragmentos y preguntas semanticamente equivalentes queden proximos en el espacio vectorial. Resuelve el problema de localizar codigo por lo que hace y no solo por su nombre, un escenario habitual en bases de codigo grandes donde los identificadores no son descriptivos.

El modelo es deliberadamente pequeno: 17,5 millones de parametros, 70 MB de pesos y un repositorio de 0,1 GB. Se distribuye en formato ONNX y esta pensado para ejecutarse en dispositivo, incluso en CPU sin GPU dedicada. Internamente es un transformer encoder de solo 2 capas, 256 dimensiones ocultas y 4 cabezas de atencion, con posiciones aprendidas para 384 tokens, mean pooling y una proyeccion lineal final a 768 dimensiones.

Su relevancia practica radica en el rendimiento: segun la model card, procesa unas 13.000 piezas de codigo por segundo en una RTX 5070 y unas 830 por segundo con 8 hilos de CPU. Se entreno por destilacion de `jina-embeddings-v2-base-code`, por lo que reproduce parcialmente su comportamiento con una fraccion muy inferior de coste computacional. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 2 capas, 256 dimensiones, 4 cabezas de atencion, posiciones aprendidas para 384 tokens |
| Parametros totales | 17,5 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | Ingles (codigo y comentarios/cadenas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`) mas `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer compacto: 2 capas, ancho de 256, 4 cabezas de atencion, embeddings posicionales aprendidos para una secuencia maxima de 384 tokens, pooling por media sobre los tokens y una capa lineal que proyecta a 768 dimensiones. La salida es un vector normalizado, de modo que el producto escalar entre vectores equivale directamente a la similitud coseno. El tokenizador procede de `jina-embeddings-v2-base-code`.

El entrenamiento se realizo por destilacion: se tomaron 5 millones de fragmentos de codigo (funciones, clases y el texto contenido en ellas) procedentes de unos 400 proyectos open source populares de GitHub bajo licencias permisivas (MIT, Apache 2.0, BSD y similares), cubriendo 32 lenguajes (TypeScript, Python, Go, Rust, C++, Java, C#, JavaScript, C, Swift, Kotlin, Ruby, PHP, Dart, Elixir, Zig, COBOL, Lua, Perl, R, HCL, Vue, SCSS, CSS, HTML, PL/pgSQL, T-SQL, GDScript, Nextflow, ActionScript, Bicep y Gherkin). El objetivo de entrenamiento fue que Ariadne reprodujese las respuestas de `jina-embeddings-v2-base-code`. El proceso completo duro aproximadamente media hora en una unica GPU.

## Capacidades

- Generacion de embeddings de codigo: convierte funciones, clases y fragmentos en vectores de 768 dimensiones normalizados.
- Busqueda semantica por descripcion funcional: permite localizar codigo a partir de una pregunta en lenguaje natural sobre lo que hace.
- Similitud entre fragmentos de codigo: comparacion directa mediante similitud coseno.
- Procesamiento de consultas sin prefijo especial: las preguntas no requieren un formato particular.
- Ejecucion en dispositivo: inferencia en CPU y GPU mediante ONNX Runtime.
- Cobertura de 32 lenguajes de programacion en el corpus de entrenamiento.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; es exclusivamente un modelo de extraccion de caracteristicas.

## Casos de uso

- Busqueda de codigo en repositorios grandes: indexar funciones y clases del proyecto y resolver consultas del tipo "donde convertimos una cadena en una fecha" mediante similitud vectorial, sin depender de que los nombres de los identificadores sean descriptivos.
- Asistencia a desarrolladores en IDE o herramientas internas: dado que el modelo pesa 70 MB y corre en CPU, puede integrarse en un plugin local que ofrezca busqueda semantica sin enviar codigo a servicios externos.
- Indexacion de documentacion y comentarios: al entrenarse con el texto interno de funciones y clases, permite relacionar docstrings y comentarios con el codigo que describen.
- Construccion de indices de codigo en pipelines de CI: con un rendimiento de unas 13.000 piezas por segundo en GPU, es viable reindexar proyectos completos (el autor cita 450.000 fragmentos de Keycloak en 4 minutos) en cada integracion.
- Deduplicacion y deteccion de codigo similar: comparar embeddings de fragmentos para identificar implementaciones duplicadas o casi identicas entre modulos o repositorios.
- Clasificacion y agrupamiento de fragmentos de codigo: usar los vectores como caracteristicas de entrada para tareas de etiquetado, clustering o enrutamiento de codigo a revisores.
- Recuperacion aumentada para asistentes de codigo: servir como recuperador en un pipeline RAG que alimente a un modelo generativo con fragmentos relevantes del repositorio.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre proyectos no vistos durante el entrenamiento:

| Prueba | Ariadne 1.0 | Jina v2 base code |
|---|---|---|
| Encontrar la funcion desde su docstring, top 10, Django | 80,1 % | 89,7 % |
| Encontrar la funcion desde su docstring, top 10, pytest | 84,4 % | 91,6 % |
| Busqueda Memtrace sobre 150 issues reales de pytest, top 10 (tres formas de preguntar) | 86,7 / 61,3 / 57,3 % | 87,3 / 59,3 / 57,3 % |
| Busqueda Memtrace sobre 150 issues reales de Keycloak, top 10 (tres formas de preguntar) | 64,0 / 53,3 / 54,0 % | 62,7 / 52,0 / 54,0 % |

En evaluacion aislada, Ariadne queda entre 7 y 10 puntos por detras de Jina. En 15 lenguajes conserva dos tercios de los diez vecinos mas cercanos que seleccionaria Jina. El propio autor advierte que los resultados dentro de Memtrace no deben interpretarse como equivalencia con Jina, ya que el sistema combina nombres exactos, busqueda por palabras clave y el grafo de codigo.

Rendimiento de inferencia medido en un equipo con Intel Core Ultra 7 265KF y NVIDIA RTX 5070, en lotes de 32:

| Entorno de ejecucion | Fragmentos de codigo por segundo |
|---|---|
| 1 hilo de CPU | ~145 |
| 8 hilos de CPU | ~830 |
| GPU (CUDA) | ~13.000 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan 70 MB y el modelo es de 17,5 millones de parametros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el autor reporta mediciones en una RTX 5070. No se requieren A100 ni H100.
- Viabilidad en GPU consumer: si, en cualquier modelo actual; tambien funciona exclusivamente en CPU.
- Despliegue: ONNX Runtime (via `onnxruntime` en Python), con el tokenizador incluido en el repositorio. El autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este tipo de modelo.
- Latencia y throughput: aproximadamente 145 fragmentos por segundo con 1 hilo de CPU, 830 con 8 hilos y 13.000 en GPU, en lotes de 32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ariadne 1.0 | 17,5 M | 384 tokens | ONNX | Apache 2.0 | Destilado de Jina; orientado a dispositivo; 7-10 puntos por debajo en evaluacion aislada |
| jina-embeddings-v2-base-code | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | Modelo profesor; mejor calidad en las pruebas citadas y mayor coste de inferencia (14 minutos frente a 4 para Keycloak) |
| Otras alternativas de embeddings de codigo | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Ventana de contexto de solo 384 tokens: los fragmentos mas largos deben dividirse antes de la inferencia; el autor indica que Memtrace realiza esta division automaticamente.
- Calidad inferior a la del modelo profesor: entre 7 y 10 puntos por debajo de Jina en las pruebas de docstring, y conserva dos tercios de los vecinos mas cercanos de Jina en 15 lenguajes.
- Hereda los sesgos y puntos ciegos de `jina-embeddings-v2-base-code`, ya que se entreno para imitarlo; no conoce nada que el modelo profesor no conociera.
- Entrenado con codigo y con comentarios y cadenas en ingles: las consultas en otros idiomas humanos funcionaran peor.
- Riesgo de recuperacion irrelevante en consultas ambiguas o en dominios poco representados en el corpus de 400 proyectos.
- No es un modelo generativo: no produce texto, codigo ni explicaciones; solo vectores.
- Las versiones publicadas son inmutables; cualquier mejora se publicara bajo un nuevo nombre de version.
- Licencia Apache 2.0, que permite uso comercial; el tokenizador tambien procede de un modelo Apache 2.0.
- Advertencia del propio autor: los resultados de Ariadne dentro de Memtrace no demuestran paridad con Jina, ya que el sistema obtiene resultados similares incluso con los vectores desactivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/memtrace/ariadne-1.0
- Modelo profesor (Jina): https://huggingface.co/jinaai/jina-embeddings-v2-base-code
- Modelo hermano (Aletheia): https://huggingface.co/memtrace/aletheia-1.5
- Sitio del autor: https://memtrace.io
