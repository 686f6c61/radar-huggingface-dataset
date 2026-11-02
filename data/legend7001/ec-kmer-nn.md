# Legend7001/ec-kmer-nn

## Resumen

`ec-kmer-nn` es un modelo de clasificación de enzimas presentado como solución al reto Leak CURBER del curso DA3410. No se trata de un modelo de lenguaje neuronal, sino de un clasificador basado en similitud de k-mers: cada secuencia proteica se representa como un vector de frecuencias de todos sus fragmentos solapados de tres aminoácidos (hasta 8000 posibles combinaciones de 20 aminoácidos), normalizado a longitud unitaria. La predicción se realiza por vecino más cercano mediante similitud coseno contra el conjunto de entrenamiento.

El enfoque es deliberadamente simple y transparente: no emplea datos externos, no entrena parámetros y toda la "inteligencia" reside en el conjunto de secuencias de entrenamiento y sus etiquetas EC. La respuesta a una consulta es la clase EC de la secuencia de entrenamiento más similar; si no hay ningún k-mer en común, se recurre a la clase EC más frecuente del entrenamiento como valor de reserva.

Su relevancia es acotada: sirve como línea base de comparación reproducible para tareas de clasificación enzimática y como ejemplo de metodología de referencia en contextos docentes o de evaluación de pipelines. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar realmente publicados o que el contenido es mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador por vecino más cercano sobre vectores de conteo de k-mers (k=3) con similitud coseno |
| Parametros totales | no disponible (no es un modelo neuronal; no hay parámetros entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; opera sobre secuencias proteicas completas) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; opera sobre secuencias de aminoácidos) |
| Licencia | no disponible |
| Formato de pesos | JSON y texto comprimido (`weights/train_ecs.json`, `weights/train_seqs.txt.gz`, `weights/baseline.json`) |

## Arquitectura y entrenamiento

La arquitectura no es una red neuronal. Cada secuencia se transforma en un vector de 8000 dimensiones que cuenta las apariciones de cada posible triplete de aminoácidos (20^3 = 8000), y ese vector se escala a norma 1. La inferencia consiste en calcular el producto escalar (similitud coseno) entre el vector de la consulta y los de todas las secuencias de entrenamiento, seleccionando la etiqueta EC de la más parecida. Si la consulta no comparte ningún k-mer con el conjunto de entrenamiento, se asigna la clase EC más común del entrenamiento, almacenada en `weights/baseline.json`.

No hay entrenamiento en el sentido habitual: el "modelo" es el conjunto de secuencias de entrenamiento y sus etiquetas EC, guardadas en `weights/train_seqs.txt.gz` y `weights/train_ecs.json` en el mismo orden. El autor indica que no se usan datos externos. El script `predict.py` implementa todo el pipeline y reparte el trabajo entre dos procesos, con un guardián temporal que asigna la clase de reserva a las consultas que no terminen a tiempo. Los ficheros `inputs.py`, `task.json` y `ec_vocabulary.json` provienen del material inicial del curso.

## Capacidades

- Clasificación de secuencias proteicas en clases EC (Enzyme Commission) por similitud de composición de k-mers.
- Representación de secuencias como vectores dispersos de 8000 dimensiones normalizados.
- Búsqueda de vecino más cercano por similitud coseno sobre el conjunto de entrenamiento.
- Mecanismo de reserva (fallback) a la clase EC mayoritaria cuando no hay solapamiento de k-mers.
- Procesamiento paralelo en dos procesos con límite de tiempo por consulta.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües en el sentido de PLN; su dominio es exclusivamente secuencial y biológico.

## Casos de uso

- Línea base en benchmarks de clasificación enzimática: sirve como referencia mínima contra la que comparar modelos más complejos (redes neuronales, transformers proteicos) en el mismo conjunto de datos, gracias a su reproducibilidad y ausencia de datos externos.
- Docencia y evaluación de pipelines: al ser una solución de curso con scripts explícitos (`predict.py`, `inputs.py`), es útil para enseñar el flujo completo de una tarea de clasificación, desde la vectorización hasta la evaluación con leaderboard.
- Detección rápida de duplicados o secuencias casi idénticas: la similitud coseno sobre conteos de k-mers identifica consultas muy próximas a secuencias conocidas, útil para filtrar fugas de datos (de ahí la etiqueta "leak-curber").
- Clasificación exploratoria de proteínas con composición conocida: cuando la secuencia consultada comparte composición de tripletes con el entrenamiento, la asignación EC es inmediata y sin coste de GPU.
- Prototipado sin infraestructura de aprendizaje profundo: se ejecuta en CPU con Python estándar y ficheros de texto/JSON, adecuado para entornos con recursos limitados.
- Verificación de consistencia de etiquetas: comparar la predicción k-mer con la etiqueta real puede señalar posibles errores de anotación en el conjunto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; no requiere GPU.
- GPU recomendadas: ninguna; el método es puramente CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU convencional, ya que solo realiza productos escalares sobre vectores de 8000 dimensiones.
- Opciones de despliegue: ejecución directa con Python mediante `predict.py`; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El autor menciona un guardián temporal y dos procesos, lo que sugiere que el coste crece linealmente con el número de secuencias de entrenamiento y consultas; el rendimiento exacto no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-kmer-nn | Vecino más cercano sobre k-mers (k=3) | No aplica (sin parámetros entrenables) | No aplica | no disponible | HuggingFace, 0 descargas |
| Modelos de clasificación EC con transformers proteicos (p. ej. ESM-based) | Red neuronal transformer | no disponible en esta ficha | no disponible | variable | no disponible |
| Herramientas clásicas de anotación (p. ej. BLAST + reglas) | Alineamiento y transferencia de anotación | No aplica | No aplica | variable | ampliamente disponibles |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a la naturaleza metodológica.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un transformer: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Dependencia total del conjunto de entrenamiento: la calidad de la predicción está acotada por la cobertura y corrección de las secuencias y etiquetas EC almacenadas.
- Sensible a la composición de k-mers: proteínas con composición similar pero función distinta pueden confundirse; no captura orden ni estructura secundaria.
- El mecanismo de reserva asigna la clase mayoritaria cuando no hay solapamiento, lo que puede inflar métricas en clases frecuentes y degradar el rendimiento en clases raras.
- El guardián temporal puede descartar consultas lentas y devolver la clase de reserva, introduciendo resultados no deterministas según la carga del sistema.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución.
- Repositorio con 0 descargas y 0 likes, tamaño de 0.0 GB y sin pipeline declarado: la disponibilidad efectiva de los pesos no está confirmada.
- Sin documentación sobre sesgos, idiomas ni límites de contexto, porque no aplican a su dominio, pero tampoco hay evaluación de robustez publicada.

## Enlaces

- HuggingFace: https://huggingface.co/Legend7001/ec-kmer-nn
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
