# JetBrains/Qwen3.8-3.6-27B-blend-GGUF

## Resumen

El modelo `JetBrains/Qwen3.8-3.6-27B-blend-GGUF` es una conversión a formato GGUF de un modelo derivado de la familia Qwen, publicada por JetBrains el 15 de septiembre de 2026 y actualizada el 21 de septiembre del mismo año. El modelo base, `JetBrains/Qwen3.8-3.6-27B-blend`, no es un entrenamiento nuevo: es una combinación 50/50 de Qwen3.6-27B y Qwen3.8-27B creada mediante interpolación lineal de los parámetros de ambos checkpoints. JetBrains conserva del modelo Qwen3.8-27B la configuración, el tokenizador, el procesador y la plantilla de chat. Se trata de una derivación no oficial, sin afiliación con Alibaba Cloud.

El repositorio incluye tres cuantizaciones (IQ3_S, Q4_K_M y Q5_K_M) producidas directamente desde un intermedio BF16 con las recetas por defecto de llama.cpp y sin matriz de importancia. La característica técnica más destacable es que cada GGUF principal incorpora el cabezal nativo de predicción multi-token (MTP) de Qwen3.5, lo que permite decodificación especulativa sin necesidad de un fichero drafter separado. Además, se distribuye un codificador de visión y proyector en BF16 que habilita la entrada de imágenes, por lo que el pipeline declarado es `image-text-to-text`.

El modelo está pensado para inferencia local en herramientas de desarrollo, en particular para el producto Junie Local de JetBrains. Con 27.320.697.856 parámetros y un peso de entre 12,60 y 19,54 GB según cuantización, encaja en estaciones de trabajo con GPU de 24 GB y en equipos Apple Silicon con memoria unificada generosa. La licencia Apache 2.0 permite uso comercial, aunque conserva los avisos de copyright originales de Alibaba Cloud.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.x (el repositorio se etiqueta como `qwen3_5`); número de capas, esquema de atención y si es denso o MoE no disponibles |
| Parámetros totales | 27.320.697.856 (27,32 mil millones) |
| Parámetros activos | No disponible; no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible; el ejemplo de ejecución del autor usa `--ctx-size 8192` |
| Tipos de cuantización | IQ3_S (12,60 GB), Q4_K_M (16,81 GB) y Q5_K_M (19,54 GB); codificador de visión y proyector en BF16 (0,93 GB) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (se conserva la licencia original de Qwen, con copyright de Alibaba Cloud) |
| Formato de pesos | GGUF para llama.cpp; el modelo base también se distribuye en BF16 (safetensors) y en MLX 4-bit en repositorios separados |
| Cabezal de predicción multi-token (MTP) | Integrado en cada GGUF principal; no requiere fichero drafter aparte |
| Tensores | 866 tensores en el fichero principal, de los cuales 15 son de MTP; una capa de predicción del siguiente token declarada en los metadatos GGUF |
| Modalidad | Texto e imagen (`pipeline_tag: image-text-to-text`); la entrada de imagen requiere el `mmproj` BF16 |
| Tamaño del repositorio | 49,9 GB |
| Descargas / likes | 2.421 descargas y 17 likes (a fecha de la información disponible) |
| Publicación | 15 de septiembre de 2026; actualizado el 21 de septiembre de 2026 |
| Revisiones fijadas | Modelo base fijado a la revisión `f1a19acf58aa8caf7a0a507c9083245f79944dcc`; llama.cpp probado en la revisión `64e9bceb2c3a856efed96feda784a50947049feb` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de la familia Qwen 3.x, heredada íntegramente del modelo Qwen3.8-27B: configuración, tokenizador, procesador y plantilla de chat se conservan sin cambios. Lo que diferencia a este modelo es el proceso de construcción del checkpoint base: JetBrains tomó Qwen3.6-27B y Qwen3.8-27B y combinó sus parámetros al 50/50 mediante interpolación lineal de pesos (model merging). No hay, por tanto, un entrenamiento adicional, ni fases documentadas de RLHF o DPO posteriores al merge; los detalles exactos de revisiones de origen y ajustes de fusión quedan registrados en el fichero `merge-manifest.json` del repositorio.

Sobre esa base se aplican dos modificaciones relevantes. La primera es la decodificación especulativa nativa mediante el cabezal MTP de Qwen3.5: cada GGUF principal contiene el cabezal embebido y se activa en el runtime con `--spec-type draft-mtp --spec-draft-n-max 3`, lo que permite proponer hasta tres tokens borrador por paso sin disponer de un modelo drafter externo. La segunda es la conversión multimodal: un codificador de visión y su proyector se exportan por separado en BF16 (`mmproj-Qwen3.8-3.6-27B-blend-BF16.gguf`) y son compartidos por las tres cuantizaciones. Las cuantizaciones se generaron todas desde un único intermedio BF16 con `llama-quantize` y las recetas por defecto, sin matriz de importancia, en un entorno con Python 3.12.14, PyTorch 2.11.0, Transformers 5.14.0 y NumPy 1.26.4, sobre llama.cpp compilado con Metal en un Apple M5 Max con 128 GiB de RAM.

## Capacidades

- Generación de texto conversacional en formato chat, con `pipeline_tag: conversational` y compatibilidad declarada con endpoints.
- Modo de razonamiento explícito (thinking): el ejemplo oficial activa `--reasoning on --reasoning-format deepseek` y pasa `{"enable_thinking":true,"preserve_thinking":true}` a la plantilla de chat; en las pruebas locales las respuestas incluyeron contenido de razonamiento separado del texto final.
- Generación y asistencia sobre código: JetBrains lo posiciona para su producto Junie Local y lo evalúa con un benchmark interno de 100 tareas de programación, con foco declarado en la eficiencia de tokens de salida.
- Visión: el codificador y proyector BF16 permiten entrada de imágenes; en la validación el modelo identificó correctamente un cuadrado rojo y un círculo azul. El fichero `mmproj` es obligatorio para cualquier entrada de imagen.
- Decodificación especulativa nativa vía cabezal MTP integrado, sin drafter externo y con hasta tres tokens borrador por paso.
- Streaming de respuestas, validado por el autor en todas las cuantizaciones.
- Concurrencia: el autor validó dos peticiones simultáneas y el ejemplo de ejecución usa `--parallel 2`.
- Robustez de servicio: se probaron peticiones inválidas, limpieza al desconectarse el cliente y recuperación tras cancelación.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se documenta ningún listado de idiomas.
- Capacidades de audio o voz: no disponibles; no se mencionan.

## Casos de uso

- Asistente de código integrado en el IDE: es el escenario para el que JetBrains publica el modelo (Junie Local). Con Q4_K_M en una GPU de 24 GB, el modelo puede servir completado, explicación y refactorización de código sin salir de la máquina del desarrollador, lo que evita enviar código propietario a servicios externos.
- Desarrollo en entornos con requisitos estrictos de privacidad: al ejecutarse con llama.cpp en hardware propio y sin dependencias de red, encaja en equipos de banca, sanidad o defensa donde el código no puede salir del perímetro corporativo.
- Análisis de capturas de pantalla y maquetas: gracias al encoder de visión compartido, se pueden enviar pantallazos de interfaces o diagramas junto al prompt de texto para obtener descripciones, extracción de texto o propuestas de estructura de componentes.
- Depuración de errores con razonamiento multi-paso: el modo thinking con `preserve_thinking` permite trazas de razonamiento largas y reutilizables, útil para analizar stack traces extensos y proponer hipótesis ordenadas antes de tocar el código.
- Prototipado de servicios internos con API compatible: `llama-server` expone la API del modelo con alias propio y el repositorio se etiqueta como compatible con endpoints, de modo que se puede levantar un servicio local para pruebas de producto sin coste por token.
- Reducción de coste por tarea en pipelines de generación masiva: el cabezal MTP reduce el número de pasos de decodificación necesarios por token generado, lo que resulta relevante en procesos por lotes como generación de documentación técnica, docstrings o resúmenes de repositorios.
- Evaluación comparativa de variantes cuantizadas en CI: las tres cuantizaciones comparten revisiones fijadas y manifiestos de conversión, lo que permite reproducir experimentos de calidad y latencia entre IQ3_S, Q4_K_M y Q5_K_M bajo el mismo runtime.
- Uso en portátiles Apple Silicon: la variante MLX 4-bit del mismo modelo base y el soporte de Metal validado por el autor permiten trabajar con el modelo en equipos con memoria unificada, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia una gráfica de "tareas completadas frente a tokens de salida" en su benchmark interno de 100 tareas de programación, pero no se incluyen cifras numéricas en la documentación proporcionada, y el propio aviso indica que los ajustes de razonamiento difieren entre configuraciones.

El único dato cuantitativo disponible corresponde a la aceptación de tokens borrador del cabezal MTP en una única petición aritmética de humo, no a una evaluación de calidad o velocidad:

| Cuantización | Tokens borrador aceptados | Tasa de aceptación |
|---|---|---|
| Q4_K_M | 98 de 114 | 86,0 % |
| Q5_K_M | 78 de 93 | 83,9 % |
| IQ3_S | 113 de 144 | 78,5 % |

El autor indica explícitamente que se trata de observaciones de pruebas de humo, no de benchmarks comparativos de calidad o rendimiento, y que no se reclama paridad con BF16 ni una evaluación amplia de calidad. No hay datos publicados de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (cifras decimales del propio repositorio): IQ3_S 12,60 GB; Q4_K_M 16,81 GB; Q5_K_M 19,54 GB. A esto hay que sumar 0,93 GB del codificador de visión y proyector BF16 cuando se usa entrada de imagen, más la caché KV y los búferes del runtime.
- VRAM total estimada (estimación propia a partir de los tamaños anteriores, no publicada por el autor): en torno a 14-17 GB con IQ3_S, 18-21 GB con Q4_K_M y 21-24 GB con Q5_K_M para contexto moderado (8k) y dos peticiones en paralelo. Con contextos mayores, la caché KV crece y estas cifras aumentan.
- Modelo BF16 del repositorio base: estimación de unos 55-60 GB de pesos (27,32 mil millones de parámetros a 2 bytes por parámetro más sobrecarga), lo que exige GPUs de 80 GB o configuraciones multi-GPU.
- GPU recomendadas: A100 40 GB o 80 GB y H100 80 GB para BF16 y contextos largos; RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) para Q4_K_M y Q5_K_M con margen ajustado; GPUs de 16 GB como la RTX 4070 Ti Super solo con IQ3_S y descarga parcial de capas a CPU.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con las cuantizaciones Q4_K_M y Q5_K_M, y con holgura en 16 GB usando IQ3_S si se acepta offloading parcial.
- Apple Silicon: el autor validó la conversión y las pruebas funcionales en Metal sobre un Apple M5 Max con 128 GiB de memoria unificada; el modelo base en MLX 4-bit está pensado para estos equipos.
- Opciones de despliegue: llama.cpp mediante `llama-server` con una revisión reciente que incluya soporte MTP nativo de Qwen3.5 (probada: `64e9bceb2c3a856efed96feda784a50947049feb`), con `--spec-type draft-mtp --spec-draft-n-max 3`, `--jinja`, `--reasoning on --reasoning-format deepseek` y `--n-gpu-layers 99`. También pueden usarse los pesos en BF16 del repositorio base con Transformers y las variantes MLX 4-bit en Apple Silicon.
- Formatos de despliegue no soportados de forma directa: al ser GGUF, no se puede servir con vLLM o TGI, que no consumen este formato.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni de tiempo hasta el primer token, y advierte que las tasas de aceptación MTP registradas son resultados de pruebas de humo.
- Ajustes de muestreo recomendados por el autor: temperatura 1.0, top-p 0.95, top-k 20, min-p 0 y repeat penalty 1, con el razonamiento activado.

## Comparativa con modelos similares

El modelo no se puede comparar con alternativas externas usando datos cuantitativos, porque no hay benchmarks publicados en la información disponible. La comparación significativa es con los artefactos del propio ecosistema del modelo:

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-3.6-27B-blend-GGUF (este modelo) | 27,32 mil millones | No disponible | Texto e imagen | Apache 2.0 | GGUF con MTP embebido; tres cuantizaciones |
| JetBrains/Qwen3.8-3.6-27B-blend (base) | 27,32 mil millones | No disponible | Texto e imagen | Apache 2.0 | BF16, revisión fijada |
| JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit | 27,32 mil millones | No disponible | Texto e imagen | Apache 2.0 | MLX 4-bit |
| JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit | 27,32 mil millones | No disponible | Texto e imagen | Apache 2.0 | MLX 4-bit con MTP |
| Qwen3.8-27B (modelo padre, Alibaba Cloud) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Checkpoint original del que se heredan configuración y tokenizador |
| Qwen3.6-27B (modelo padre, Alibaba Cloud) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Checkpoint original usado en la interpolación 50/50 |

No se dispone de datos de otros modelos de tamaño similar (por ejemplo, alternativas de 24-32 mil millones de parámetros de otros fabricantes) que permitan una comparación rigurosa con la información proporcionada.

## Limitaciones y advertencias

- Derivación no oficial: el modelo no está afiliado, patrocinado ni respaldado por Alibaba Cloud ni por Alibaba Group, y así se declara expresamente en la model card.
- Construcción por interpolación lineal: al ser una mezcla 50/50 de dos checkpoints sin entrenamiento posterior, puede heredar comportamientos inconsistentes o degradados de cualquiera de los dos modelos padre. El manifiesto de fusión documenta los ajustes, pero no se publica una evaluación del efecto del merge sobre la calidad.
- Sin evaluación amplia de calidad: el autor afirma explícitamente que no se reclama paridad con BF16 ni una evaluación de calidad amplia. Las únicas métricas publicadas son tasas de aceptación de tokens borrador en peticiones de humo, que no miden corrección.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación ni tasas de alucinación. Como en cualquier modelo generativo sin verificación factual, la salida debe validarse antes de usarla en producción, especialmente en código que se ejecute sin revisión humana.
- Sesgos: no hay información publicada sobre sesgos demográficos, culturales o lingüísticos de este derivado ni de sus modelos padre.
- Idiomas: no se documenta la lista de idiomas soportados, por lo que no se puede garantizar el rendimiento en castellano ni en otras lenguas distintas del inglés.
- Contexto: la longitud máxima de contexto no está documentada. El valor de 8192 del ejemplo es una elección de configuración del autor, no una especificación del modelo, y usarlo como límite real sería una suposición.
- Dependencia del runtime para el MTP: la decodificación especulativa requiere una versión reciente de llama.cpp con soporte MTP nativo de Qwen3.5. La revisión probada es concreta (`64e9bceb2c3a856efed96feda784a50947049feb`); otras versiones o servidores alternativos pueden no soportar el cabezal o ignorarlo silenciosamente.
- Multimodalidad condicionada al `mmproj`: sin el fichero de visión en BF16 no hay entrada de imagen, y las tres cuantizaciones dependen del mismo proyector compartido.
- Cuantización IQ3_S: al ser la variante más agresiva, es esperable una pérdida de calidad mayor que en Q4_K_M o Q5_K_M, aunque el autor no publica una comparación de calidad entre ellas.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar la licencia original de Qwen con el aviso de copyright de Alibaba Cloud, así como los ficheros NOTICE y CHANGES.md que documentan las modificaciones.
- Sin soporte confirmado de tool calling: no se documenta function calling ni integración con agentes, por lo que no debe asumirse su disponibilidad en producción.
- Concurrencia limitada en el ejemplo oficial: la configuración probada usa `--parallel 2`, lo que no permite extrapolar comportamiento bajo cargas concurrentes altas.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-GGUF
- Modelo base en BF16: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Variante MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit
- Variante MTP MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit
- Artículo de JetBrains sobre Junie Local, evaluaciones de código y experimentos con MTP: https://blog.jetbrains.com/junie/2026/09/smarter-local-al/
- Gráfica de calidad de código frente a tokens de salida (benchmark interno de 100 tareas): https://blog.jetbrains.com/wp-content/uploads/2026/09/jbr-tradeoff-2.png
- Manifiesto de fusión del modelo base: `merge-manifest.json` en el repositorio del modelo base
- Manifiesto de conversión y validación: `conversion-manifest.json` en el repositorio GGUF
- Aviso de atribución: `NOTICE` en el repositorio GGUF
- Descripción de modificaciones: `CHANGES.md` en el repositorio GGUF
- Licencia original de Qwen conservada: `LICENSE` en el repositorio GGUF
- Página corporativa de JetBrains: https://www.jetbrains.com/
- Entrada de JetBrains en Wikipedia (contexto sobre el desarrollador y su asistente de IA): https://en.wikipedia.org/wiki/JetBrains
