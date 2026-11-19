# Jundot/embeddinggemma-2-oQ4e

## Resumen

`Jundot/embeddinggemma-2-oQ4e` es una cuantizacion mixta en formato MLX del modelo multimodal de embeddings `google/embeddinggemma-2` de Google DeepMind. El modelo base proyecta texto, imagenes, video y audio en un unico espacio vectorial de 768 dimensiones; esta version cuantizada conserva los tres encoders (texto, vision y audio) y aplica cuantizacion de precision mixta exclusivamente al encoder de texto, dejando los encoders de vision y audio en BF16. El checkpoint resultante ocupa 1,108 GB en disco para 744.371.512 parametros logicos.

La relevancia de esta ficha es doble: por un lado documenta un modelo de embeddings multimodal de referencia (familia EmbeddingGemma 2), y por otro ilustra una tecnica de cuantizacion (oQ, herramienta oMLX de Jundot) que asigna bits por sensibilidad medida de cada capa en lugar de aplicar una precision uniforme. El resultado declarado es de 4,804 bits/peso efectivos en el encoder de texto y 11,906 bits/peso en el checkpoint completo, con una precision que el autor afirma superior a la cuantizacion uniforme a igual tamano y velocidad.

Esta pensado para ejecucion en Apple Silicon mediante la libreria MLX y el servidor oMLX. No es un modelo generativo: es un extractor de caracteristicas (`feature-extraction`) cuyo uso tipico es la recuperacion semantica, la busqueda multimodal y el clustering sobre representaciones densas. La licencia es Apache-2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoders transformer multimodales (texto, vision, audio) con proyeccion a espacio comun de 768 dimensiones; checkpoint MLX con cuantizacion mixta oQ4e |
| Parametros totales | 744.371.512 (0,744B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e mixta: affine 4-bit (grupo 64), 5-bit, 6-bit y 8-bit, mas BF16; 4,804 bits/peso efectivos en encoder de texto, 11,906 bits/peso en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-2` es un modelo de embeddings multimodal que integra tres encoders independientes: texto (0,271B parametros logicos), vision (0,168B) y audio (0,306B). Cada modalidad se proyecta a un espacio vectorial compartido de 768 dimensiones, lo que permite comparar directamente embeddings de texto, imagen, video y audio. Esta version cuantizada no modifica la arquitectura: solo altera la representacion numerica de los pesos del encoder de texto.

La cuantizacion se realizo con oQ (oMLX v0.8.0), que asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una importance matrix de 128 muestras x 512 tokens, seguida de un refit de escala y bias por minimos cuadrados ponderados. La distribucion final del encoder de texto es: 28,983% de los pesos en affine 4-bit grupo 64, 5,881% en 5-bit, 0,845% en 6-bit, 0,845% en 8-bit, y el resto (63,445%) en BF16. El autor indica que la version del 19 de noviembre de 2026 se recuantizo con un redondeo oQe refinado que reduce el error de cuantizacion a igual tamano y velocidad. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones para texto, imagen, video y audio en un espacio vectorial unico.
- Recuperacion semantica multimodal: busqueda texto-a-imagen, imagen-a-texto, texto-a-audio y combinaciones cruzadas.
- Extraccion de caracteristicas para clustering, deduplicacion y clasificacion zero-shot sobre representaciones.
- Servido de entradas de texto e imagen mediante `POST /v1/embeddings` en oMLX.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad especial: incluye encoder de audio en el checkpoint, aunque oMLX no lo carga en el servidor de embeddings.

## Casos de uso

- Busqueda semantica multimodal en aplicaciones de escritorio en Apple Silicon: indexar un corpus de imagenes y textos y servir consultas cruzadas a traves de oMLX en local, aprovechando que el checkpoint completo ocupa 1,1 GB y cabe en memoria unificada de cualquier Mac moderno.
- Deduplicacion de catalogos de imagenes y audio: generar embeddings de cada elemento y agrupar por similitud coseno para detectar duplicados o near-duplicates en pipelines de datos, usando los encoders de vision y audio en BF16 para preservar precision.
- Sistemas de recomendacion basados en contenido: representar items heterogeneos (fichas de texto, portadas, clips de audio) en un mismo espacio de 768 dimensiones y calcular vecinos mas cercanos sin necesidad de un modelo por modalidad.
- Prototipado de RAG en local: usar el encoder de texto cuantizado para generar embeddings de fragmentos de documentos y consultas en un Mac, con un coste de almacenamiento de 0,163 GB para el encoder de texto.
- Clasificacion zero-shot de imagenes o audio: comparar el embedding de una muestra con embeddings de etiquetas textuales precalculadas, util en entornos sin GPU dedicada.
- Moderacion y filtrado de contenido multimedia: calcular similitud contra un conjunto de referencia de contenido no deseado en texto, imagen o audio, desplegando el modelo en el propio dispositivo.
- Investigacion en cuantizacion: servir como referencia reproducible para medir el impacto de oQ4e frente a cuantizaciones uniformes sobre tareas de recuperacion, dado que el autor publica la distribucion de bits por capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint completo ocupa 1,032 GiB en almacenamiento; en inferencia se necesita espacio adicional para activaciones y la importance matrix no se usa en tiempo de ejecucion. Estimacion conservadora: 2-3 GB de memoria unificada para el checkpoint completo.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No hay soporte declarado para CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; no esta pensado para GPUs NVIDIA de consumo.
- Opciones de despliegue: oMLX (servidor compatible con `POST /v1/embeddings` para texto e imagen), libreria `mlx` directamente en Python. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Jundot/embeddinggemma-2-oQ4e | 0,744B | no disponible | texto, imagen, video, audio | Apache-2.0 | safetensors MLX / oMLX |
| google/embeddinggemma-2 (base) | no disponible | no disponible | texto, imagen, video, audio | Apache-2.0 | safetensors |
| Otras cuantizaciones de embeddinggemma-2 | no disponible | no disponible | no disponible | Apache-2.0 (presumible) | no disponible |

La comparativa se limita al modelo base y a variantes del mismo, ya que la informacion proporcionada no incluye datos de modelos alternativos de la misma categoria (por ejemplo, otros embeddings multimodales de tamano comparable). No se dispone de cifras de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El autor advierte que la version del 19 de noviembre de 2026 sustituye a copias anteriores; quien haya descargado una version previa debe volver a descargarla para beneficiarse del redondeo oQe refinado.
- oMLX no carga el encoder de audio: aunque el checkpoint lo incluye, el servidor solo sirve texto e imagen a traves de `POST /v1/embeddings`. El uso de audio requiere cargar los pesos manualmente con la libreria `mlx`.
- La cuantizacion introduce error numerico en el encoder de texto (4,804 bits/peso efectivos); no se han publicado mediciones del impacto en tareas de recuperacion, por lo que conviene validar en el dominio concreto antes de produccion.
- El modelo es un extractor de caracteristicas, no un generador: no admite instrucciones, tool calling ni razonamiento multi-paso.
- No hay informacion sobre sesgos, cobertura idiomatica ni calidad en lenguas distintas del ingles; la model card no documenta evaluaciones por idioma.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar el `LICENSE` incluido para confirmar terminos adicionales.
- Dependencia de MLX limita el despliegue a hardware Apple; no hay ruta documentada para CUDA o ROCm.
- Riesgo de alucinacion: no aplica en sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios fuera de la distribucion de entrenamiento del modelo base.
