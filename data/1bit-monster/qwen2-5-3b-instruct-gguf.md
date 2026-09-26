# 1bit-MONSTER/Qwen2.5-3B-Instruct-GGUF

## Resumen

Este repositorio redistribuye el fichero GGUF oficial de Qwen2.5-3B-Instruct en cuantización Q4_K_M, reempaquetado por el usuario 1bit-MONSTER para su uso con el motor de inferencia 1bit sobre hardware Strix Halo (AMD) mediante backend Vulkan. No se trata de un modelo nuevo ni de una cuantización propia: el autor re-aloja la cuantización de Qwen y añade mediciones de rendimiento del motor.

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer decoder-only de 3.397.103.616 parámetros (3,4 mil millones) desarrollado por Alibaba Cloud, con una ventana de contexto de 32.768 tokens en el modelo base. Está orientado a generación de texto conversacional, seguimiento de instrucciones y tareas ligeras de razonamiento, código y matemáticas.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo instructivo de 3B en equipos con recursos muy limitados (el fichero GGUF ocupa en torno a 2 GB); por otro, es un ejemplo claro de las restricciones de licencia de la familia Qwen2.5, ya que el checkpoint de 3B se publica bajo Qwen Research License y no bajo Apache 2.0, lo que limita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con grouped-query attention (GQA), según la documentación pública del modelo base |
| Parametros totales | 3.397.103.616 (3,4 B), dato de safetensors del modelo base |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo base; el repositorio no especifica ventana propia |
| Tipos de cuantizacion | Q4_K_M (única incluida en este repositorio) |
| Idiomas soportados | No disponible en el repositorio; el modelo base declara soporte multilingüe sin lista detallada aquí |
| Licencia | Qwen Research License (qwen-research), solo investigación y evaluación |
| Formato de pesos | GGUF (fichero qwen2.5-3b-instruct-q4_k_m.gguf) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Autor del reempaquetado | 1bit-MONSTER |
| Tamaño del repositorio | 2,1 GB |
| Fecha de creación (metadatos) | 2026-09-26 |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre entrenamiento: se limita a re-alojar el GGUF Q4_K_M generado por Qwen. Por tanto, la arquitectura y el proceso de entrenamiento corresponden íntegramente a Qwen2.5-3B-Instruct: un transformer causal decoder-only con atención grouped-query, entrenado según la documentación pública de Qwen sobre un corpus de aproximadamente 18 billones de tokens y posteriormente ajustado con supervisión y optimización de preferencias para obtener la variante Instruct. Los detalles exactos de composición del dataset, número de tokens de cada fase y algoritmo de alineación no están reproducidos en este repositorio.

La innovación técnica que aporta este repositorio no está en el modelo, sino en el entorno de ejecución: el autor publica mediciones del motor 1bit sobre un equipo Strix Halo con backend Vulkan, lo que sirve como referencia de rendimiento para despliegues sobre iGPU con memoria unificada. La cuantización Q4_K_M es la oficial de Qwen, no una cuantización propia del autor.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en formato chat.
- Razonamiento básico y resolución de problemas de complejidad media, limitado por el tamaño de 3B parámetros.
- Generación y explicación de código en lenguajes habituales, con calidad inferior a checkpoints mayores de la misma familia.
- Aritmética y problemas matemáticos de varios pasos, con mayor tasa de error que modelos de 7B o superiores.
- Soporte multilingüe heredado del modelo base, sin lista de idiomas confirmada en este repositorio.
- Generación de salidas estructuradas (por ejemplo JSON) cuando se le indica explícitamente en el prompt.
- Soporte de tool calling / function calling: no documentado en este repositorio para el checkpoint de 3B.
- Modo de razonamiento extendido (thinking) y capacidades de visión o audio: no disponibles.
- Ejecución local en CPU/GPU mediante GGUF, sin necesidad de servicios en la nube.

## Casos de uso

- Prototipado local en portátiles y equipos sin GPU dedicada: el fichero Q4_K_M de ~2 GB se puede cargar en memoria y ejecutar con llama.cpp o motores compatibles, lo que permite validar prompts y flujos conversacionales antes de escalar a modelos mayores.
- Investigación sobre cuantización y motores de inferencia: sirve como carga de trabajo reproducible para medir prefill y decodificación en distintas plataformas, tal como hace el propio autor con el motor 1bit sobre Strix Halo.
- Asistentes conversacionales de ámbito interno no comercial: con 32.768 tokens de contexto se pueden mantener conversaciones multi-turno con historial largo y documentos adjuntos de tamaño moderado.
- Procesamiento de documentos con RAG en local: indexación de manuales o informes y generación de respuestas citando fragmentos, siempre que el contexto recuperado quepa en la ventana de 32K tokens.
- Extracción de información estructurada: convertir textos no estructurados en campos JSON para pipelines de datos internos, con validación posterior obligatoria por la tasa de error esperable en un modelo de 3B.
- Generación de datos sintéticos para evaluación: producir borradores, resúmenes o variaciones de texto a bajo coste computacional en entornos de laboratorio.
- Clasificación y enrutado de consultas: tareas de etiquetado simple o de decisión entre categorías donde la latencia y el coste importan más que la precisión máxima.
- Despliegue en edge con memoria unificada: ejecución sobre iGPU tipo Strix Halo o sobre mini-PC con CPU y RAM suficiente, sin tarjeta gráfica dedicada.

Advertencia transversal: todos estos casos quedan dentro del marco de investigación y evaluación, ya que la licencia impide el uso comercial.

## Benchmarks y rendimiento

Datos de rendimiento medidos por el autor (no son benchmarks de calidad del modelo):

| Metrica | Valor | Entorno |
|---|---|---|
| pp512 (procesamiento de prompt) | 2995 tok/s | Strix Halo, backend Vulkan, motor 1bit |
| tg128 (generación) | 91,7 tok/s | Strix Halo, backend Vulkan, motor 1bit |

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de capacidad, y tampoco ofrece comparaciones con checkpoints alternativos.

## Requisitos de hardware

- Tamaño del fichero: aproximadamente 2 GB (Q4_K_M); el repositorio completo ocupa 2,1 GB.
- VRAM estimada para inferencia: en torno a 2,5-3,5 GB considerando pesos, caché KV y overhead del motor, como estimación derivada del tamaño del fichero y no como dato publicado. Con contextos muy largos la caché KV crece de forma apreciable.
- GPU recomendadas: cualquier GPU de consumo con 4-6 GB o más de VRAM (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.). Las A100 y H100 son enormemente sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 4 GB o más de memoria, y también en iGPU con memoria unificada.
- Opciones de despliegue: motor 1bit del autor (con flag `--device vulkan`), llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime con soporte GGUF. vLLM y TGI no son la vía natural para un único fichero GGUF de este tamaño.
- Latencia y throughput: único dato medido disponible, 2995 tok/s de prefill y 91,7 tok/s de decodificación en Strix Halo con Vulkan. No hay cifras publicadas para GPU dedicada ni para CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso comercial | GGUF disponible |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (este repositorio) | 3,4 B | 32.768 tokens | Qwen Research License | No, requiere licencia aparte de Alibaba Cloud | Sí, Q4_K_M |
| Qwen2.5-3B-Instruct (checkpoint original) | 3,4 B | 32.768 tokens | Qwen Research License | No | Sí, en el repositorio oficial de Qwen |
| Llama-3.2-3B-Instruct | 3,2 B (aprox.) | 128.000 tokens | Llama 3.2 Community License | Sí, con condiciones | Sí |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Sí | Sí |
| Gemma-2-2B-it | 2,6 B (aprox.) | 8.000 tokens | Gemma Terms of Use | Sí, con condiciones | Sí |

Las cifras de parámetros, contexto y licencia de los modelos alternativos proceden de su documentación pública y no han sido verificadas en esta búsqueda; se incluyen únicamente como referencia orientativa. No hay datos comparativos de rendimiento disponibles, por lo que no se puede establecer qué modelo obtiene mejores resultados en tareas concretas.

## Limitaciones y advertencias

- Licencia no comercial: el checkpoint de 3B de Qwen2.5 se distribuye bajo Qwen Research License, a diferencia de otros tamaños de la familia con licencia Apache 2.0. Cualquier uso comercial exige una licencia separada de Alibaba Cloud.
- Modelo de 3B parámetros: se espera una tasa de alucinación más alta y un razonamiento menos fiable que en checkpoints de 7B o superiores, especialmente en matemáticas, código y preguntas de conocimiento factual.
- Contexto limitado a 32.768 tokens, por debajo de competidores de la misma categoría que alcanzan 128.000 tokens.
- Sin benchmarks publicados en el repositorio: no hay evidencia propia de calidad que respalde la elección frente a alternativas.
- Es un reempaquetado, no un trabajo original: la cuantización y el modelo provienen de Qwen; el autor solo añade métricas de ejecución en un hardware concreto.
- Zero descargas y cero likes en el momento de la consulta: no existe validación de la comunidad ni historial de incidencias.
- Sesgos: no documentados en este repositorio; al heredar los datos de entrenamiento del modelo base, arrastra los sesgos propios de ese corpus, sin que el autor detalle ninguna mitigación.
- Idiomas: el repositorio no enumera idiomas soportados; el rendimiento fuera de inglés y chino puede degradarse sin que haya datos que lo cuantifiquen.
- Compatibilidad: el rendimiento medido corresponde exclusivamente a Strix Halo con Vulkan y el motor 1bit; extrapolar esas cifras a otra GPU o a otro motor no es válido.
- Metadatos: la fecha de creación indicada en el repositorio es 2026-09-26, posterior a la fecha de publicación original de Qwen2.5; conviene tratarla con cautela.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/1bit-MONSTER/Qwen2.5-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Licencia Qwen Research: incluida en el repositorio como fichero LICENSE
