# RaspizdAI/debil-1.5

## Resumen

debil-1.5 es un modelo de lenguaje ligero de 46,5 millones de parámetros desarrollado por RaspizdAI y publicado en HuggingFace. Se basa en una arquitectura Transformer decoder-only de estilo GPT-2, como indica la etiqueta "gpt2" del repositorio, con 8 capas ocultas, 8 cabezas de atención, dimensión de embedding de 480 y un vocabulario de 50.257 tokens, idéntico al tokenizador BPE de GPT-2. El modelo está posicionado explícitamente como un modelo de pequeñas dimensiones, pensado para entornos con recursos de cómputo limitados.

El modelo se distribuye bajo licencia MIT, lo que permite uso comercial, modificación y redistribución sin restricciones significativas. Con un tamaño de repositorio de solo 0,2 GB, es muy accesible en términos de almacenamiento y despliegue. A fecha de su publicación, cuenta con 0 descargas y 1 like, lo que indica que es un modelo reciente y aún sin validar por la comunidad.

No se dispone de información pública sobre los datos de entrenamiento, la longitud de contexto, los idiomas soportados ni los resultados numéricos de benchmarks, lo que limita la evaluación objetiva de sus capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 46.538.400 (~46,5M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Transformer decoder-only de estilo GPT-2 con 8 capas ocultas, 8 cabezas de atención, dimensión de embedding de 480 y dimensión de cabeza de 60. La dimensión de cabeza (60) multiplicada por el número de cabezas (8) da 480, lo que es consistente con un diseño de atención multi-cabeza estándar. El tamaño del vocabulario de 50.257 tokens coincide exactamente con el del tokenizador BPE de GPT-2, lo que sugiere compatibilidad con dicho tokenizador.

No se documentan datos sobre el conjunto de entrenamiento, el número de tokens procesados, ni el uso de técnicas de alineación como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá de la reducción de dimensiones respecto a los modelos GPT-2 estándar (GPT-2 Small tiene 12 capas, 768 de embedding y 124M de parámetros).

## Capacidades

- Generación de texto autocompletado: como modelo de tipo GPT-2, puede generar texto continuando un prompt dado, aunque sus capacidades estarán limitadas por su reducido tamaño.
- Fine-tuning: al ser un modelo pequeño, es viable ajustarlo con recursos de cómputo modestos.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, ni capacidades multimodales.
- No se especifican los idiomas soportados por el modelo.

## Casos de uso

- Experimentación educativa: su tamaño reducido y licencia MIT lo hacen adecuado para enseñar arquitecturas Transformer en cursos de machine learning, permitiendo ejecutar el modelo en hardware modesto y analizar sus activaciones internas.
- Fine-tuning sobre dominios específicos: al ser un modelo de 46,5M de parámetros, el ajuste fino es viable con una sola GPU consumer, por ejemplo para generar texto técnico breve o documentación de productos.
- Prototipado rápido: los equipos de desarrollo pueden usarlo como punto de partida para validar pipelines de generación de texto antes de migrar a modelos más grandes, reduciendo costes de iteración.
- Inferencia en dispositivos edge: con solo 46,5M de parámetros, el modelo puede ejecutarse en CPUs de bajo consumo, Raspberry Pi o dispositivos embebidos para generación de texto offline.
- Generación de datos sintéticos simples: puede emplearse para crear datasets de entrenamiento de baja complejidad, como frases cortas, plantillas de correo o ejemplos de clasificación de texto.
- Investigación en modelos de bajo presupuesto: útil para estudiar el comportamiento de modelos de lenguaje con presupuesto de parámetros muy reducido, por ejemplo en estudios de scaling laws o análisis de representaciones internas.

## Benchmarks y rendimiento

La model card del autor incluye una referencia a una imagen con resultados de benchmarks, pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 46,5M de parámetros, el modelo ocupa aproximadamente 186 MB en FP32, 93 MB en FP16, 47 MB en INT8 y 23 MB en INT4. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, series RTX) es suficiente. La inferencia en CPU también es perfectamente viable.
- Opciones de despliegue: HuggingFace Transformers, llama.cpp, Ollama, vLLM y TGI son compatibles con modelos de este tamaño. Para un modelo tan pequeño, llama.cpp u Ollama en CPU serían suficientes.
- Latencia y throughput: no disponible. Dado el tamaño, se espera una latencia muy baja incluso en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Embedding | Contexto | Licencia |
|---|---|---|---|---|---|
| debil-1.5 | 46,5M | 8 | 480 | no disponible | MIT |
| GPT-2 Small | 124M | 12 | 768 | 1024 | MIT |
| DistilGPT2 | 82M | 6 | 768 | 1024 | Apache 2.0 |

El modelo es significativamente más pequeño que GPT-2 Small (124M) y DistilGPT2 (82M), lo que lo sitúa en la categoría de modelos de muy bajo presupuesto. Su contexto no está documentado, y su rendimiento relativo frente a estas alternativas no puede evaluarse sin datos de benchmarks.

## Limitaciones y advertencias

- Modelo sin validar: con 0 descargas, el modelo no ha sido probado por la comunidad y su calidad real es desconocida.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar contenido falso o inventado. Su tamaño reducido puede incrementar este riesgo.
- Capacidades limitadas: con solo 46,5M de parámetros, el modelo no es adecuado para tareas complejas de razonamiento, generación de código o matemáticas.
- Idiomas no documentados: no se especifica qué idiomas soporta el modelo, lo que dificulta su uso en producción multilingüe.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, un dato crítico para aplicaciones de conversación o procesamiento de documentos largos.
- Sesgos desconocidos: al no disponer de información sobre los datos de entrenamiento, es probable que el modelo presente sesgos presentes en dichos datos, sin posibilidad de evaluarlos.
- Fecha de publicación futura: el modelo fue creado el 2026-08-16, lo que puede indicar un proyecto experimental o en fase inicial.

## Enlaces

- HuggingFace: https://huggingface.co/RaspizdAI/debil-1.5
