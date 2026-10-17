# bubskee/qwen3-14b-jr-lenses

## Resumen
`bubskee/qwen3-14b-jr-lenses` no es un modelo de lenguaje, sino un par de artefactos de interpretabilidad: dos lentes ajustadas (J-lens y R-lens) para `Qwen/Qwen3-14B` en la revisión `40c069824f4251a91eefaf281ebe4c544efd3e18`. Una lente es una transformación ajustada que proyecta las activaciones residuales de cada bloque hacia un espacio de vocabulario, de modo que permite leer qué tokens resultarían verbalizables en cada capa y posición intermedias del modelo. El repositorio no redistribuye los pesos del modelo base: solo incluye los tensores de las lentes (`j-lens/lens.pt`, `r-lens/lens.pt`) y sus ficheros de ajuste (`fit.json`), con un tamaño total de 4,0 GB.

El J-lens sigue el método de Gurnee et al. sobre representaciones verbalizables y espacio de trabajo global, mientras que el R-lens aplica la variante RelP (relevance patching) descrita por Camila Blank, Agam Bhatia y Neel Nanda para mejorar la fidelidad en capas tempranas. Ambos se ajustaron con los mismos 25 documentos de `NeelNanda/pile-10k` (documentos 0-24 en orden del dataset), con capa objetivo 38 (0-indexado, penúltimo bloque transformer) y capas fuente 0-37, `max_seq_len` 128 y `skip_first` 4.

Su relevancia es práctica para el trabajo de circuitos e interpretabilidad: proporciona un par J/R emparejado sobre un mismo checkpoint, con receta de ajuste, hashes SHA-256, revisión de código y entorno de cómputo documentados, bajo licencia Apache-2.0 y con soporte de un BlueDot Impact Rapid Grant. Esto permite reproducir, auditar y comparar los dos readouts sin volver a ajustar las lentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de interpretabilidad (lentes ajustadas) sobre un transformer denso decoder-only. El modelo base Qwen3-14B usa RoPE, RMSNorm, SwiGLU, QK-norm y 40 bloques transformer (deducido de que la capa objetivo 38, 0-indexada, es el penultimo bloque) |
| Parametros totales | No aplicable al artefacto. Modelo base: Qwen3-14B (denominacion comercial; recuento exacto de parametros no disponible en la informacion proporcionada) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | El ajuste de las lentes se realizo con `max_seq_len = 128` y `skip_first = 4`. La ventana de contexto del modelo base no es un parametro del artefacto y no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | No aplicable a los tensores de lente (se serializan como tensores PyTorch). No se documentan variantes cuantizadas |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (tanto las lentes como el modelo base Qwen3-14B, distribuido por separado por Qwen) |
| Formato de pesos | PyTorch `.pt` (`lens.pt`) mas metadatos JSON (`fit.json`) |
| Capa objetivo | 38 (0-indexada, penultimo bloque transformer) |
| Capas fuente | 0-37 |
| Corpus de ajuste | `NeelNanda/pile-10k`, split train, documentos 0-24 (25 documentos) |
| Hash del conjunto de prompts | `4111a9cf7ec45fdf11d12a0995eef129b9a2b67d98308f044dd865b1cfd669a7` |
| Revision del modelo base | `40c069824f4251a91eefaf281ebe4c544efd3e18` (Qwen3-14B, no Qwen3-14B-Base) |
| Configuracion de ajuste | `force_bos = False`, `dim_batch = 16` |
| Hash SHA-256 J-lens | `de591996c307b873c6a9cfa6cf0b277f6b2323edc4459f499dea373d7aed260f` |
| Hash SHA-256 R-lens | `0f4895c2a8f0a79707fa9004227ed6097cbcf78382ce52586814ebed0a0e8b11` |
| Tamano del repositorio | 4,0 GB |

## Arquitectura y entrenamiento
El artefacto no entrena un modelo nuevo: ajusta dos lentes sobre un checkpoint congelado. El J-lens se obtuvo con el ajuste estándar `jlens.fit` (revisión de código `581d398613e5602a5af361e1c34d3a92ea82ba8e`) y el R-lens con el mismo estimador y el mismo conjunto de prompts, pero con una pasada hacia atrás modificada por RelP. Ambos comparten, por tanto, corpus, revisiones y posiciones de lectura, lo que hace que las diferencias observadas entre los dos readouts sean atribuibles al método y no a variaciones en los datos.

Las modificaciones de gradiente introducidas por RelP en el R-lens fueron: regla LN sobre las RMSNorm de entrada al bloque y post-atención, regla identidad para la SiLU y regla mitad con `beta = 0.5` sobre el producto de la MLP con compuerta; las normas de Q y K se dejaron sin cambios. El ajuste se ejecutó en una NVIDIA A100-SXM4-80GB con PyTorch `2.11.0+cu128` y Transformers `5.19.0`. La implementación de la mecánica de retropropagación parcheada está publicada en `bubskee/euphoria-axis` (`tools/runpod/gateL_fit.py`) y los metadatos de las ejecuciones en `runs/qwen3-14b-r4/`.

Conviene subrayar que el ajuste se hizo sobre `Qwen/Qwen3-14B` y no sobre `Qwen/Qwen3-14B-Base`, y con una ventana de 128 tokens y 25 documentos: se trata de un ajuste ligero de bajo coste, orientado a exploración interactiva más que a cobertura exhaustiva del espacio de activaciones.

## Capacidades
- Lectura por capa y por posición: dada una prompt, devuelve las puntuaciones de logits del J-lens y del R-lens para cada capa fuente (0-37) en las posiciones indicadas, lo que permite seguir cómo evoluciona la representación verbalizable.
- Comparación directa J frente a R: ambas lentes están emparejadas sobre los mismos documentos y prompts, de modo que se puede medir dónde el R-lens corrige la fidelidad del J-lens en capas tempranas.
- Exploración interactiva de tokens inesperados: el flujo de trabajo permite fijar palabras sorprendentes, cambiar la prompt y observar qué se mueve entre capas.
- Inspección de artefactos serializados: los `lens.pt` pueden cargarse directamente con `torch.load(..., map_location="cpu", weights_only=False)`.
- No genera texto por sí mismo: requiere el checkpoint de Qwen3-14B y la implementación de referencia de Jacobian-lens (`jlens`) para producir cualquier resultado.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un instrumento de análisis, no un asistente.
- Sin soporte multilingüe declarado: la cobertura lingüística del corpus de ajuste (pile-10k, en su mayoría inglés) no se documenta como capacidad.

## Casos de uso
- Trazado de circuitos y atribución: aplicar la lente capa a capa sobre una prompt concreta para localizar en qué bloque emerge la representación de un concepto o de un token de respuesta antes de que aparezca en la salida final.
- Diagnóstico de alucinaciones: identificar en qué capa se consolida una respuesta incorrecta y comparar con la capa donde se consolida la respuesta correcta para el mismo tipo de pregunta, usando el par J/R como control de fidelidad.
- Validación de métodos de interpretabilidad: usar el R-lens de este repositorio como referencia emparejada al evaluar implementaciones propias de RelP, verificando que las reglas de gradiente producen readouts equivalentes sobre el mismo checkpoint y prompts.
- Estudio de la fidelidad en capas tempranas: comparar sistemáticamente los readouts J y R en las capas 0-15, donde el trabajo original de R-lens reporta las mayores discrepancias, para caracterizar qué tipos de tokens se verbalizan prematuramente.
- Análisis de planificación multi-token: examinar posiciones intermedias de una secuencia para detectar si el modelo representa de forma latente el siguiente token o varios tokens por delante, aprovechando la lectura por posición que ofrece la API de la lente.
- Investigación en seguridad y alineación: sondear si conceptos sensibles o instrucciones ocultas aparecen representados en capas intermedias antes de manifestarse en la salida, como paso previo a intervenciones o ablaciones.
- Reproducibilidad y auditoría de artefactos: verificar los hashes SHA-256 de `lens.pt` y cotejar los `fit.json` para confirmar que un ajuste propio replica exactamente la configuración publicada (corpus, revisión, `max_seq_len`, `dim_batch`).
- Docencia y divulgación técnica: demostrar en un cuaderno interactivo cómo se lee el "espacio de trabajo" de un modelo de 14B capa a capa, partiendo del walkthrough de la implementación de referencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de fidelidad, acuerdo con la salida final ni comparaciones numéricas entre el J-lens y el R-lens, y la búsqueda web realizada no devolvió ninguna fuente técnica relacionada con este repositorio. Por tanto, no es posible presentar una tabla de resultados sin inventar cifras.

## Requisitos de hardware
- Ajuste de las lentes (ya realizado por el autor): NVIDIA A100-SXM4-80GB, PyTorch `2.11.0+cu128`, Transformers `5.19.0`. Es el dato de cómputo documentado en la model card; no se reportan tiempos de ajuste.
- Aplicación de las lentes: exige cargar el checkpoint completo de Qwen3-14B en memoria de GPU además de los tensores de lente (el repositorio de lentes ocupa 4,0 GB). Estimaciones orientativas de VRAM para el modelo base, no verificadas en la información proporcionada: en torno a 28-30 GB en bf16/fp16, 15-16 GB en cuantización de 8 bits y 8-10 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S o similares con al menos 40 GB para trabajar en precisión completa sin cuantizar. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) solo sería viable con el modelo base cuantizado a 8 o 4 bits.
- Opciones de despliegue: el flujo documentado es Transformers más la librería `jlens` (implementación de referencia de Anthropic), no vLLM, TGI, llama.cpp ni Ollama. Estos últimos solo servirían para ejecutar el modelo base, no para aplicar las lentes.
- Latencia y throughput: no disponible.
- Almacenamiento: los ficheros de lente suman 4,0 GB, a los que hay que añadir el espacio del checkpoint de Qwen3-14B descargado por separado.

## Comparativa con modelos similares

| Artefacto | Metodo | Modelo base | Capas leidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bubskee/qwen3-14b-jr-lenses` (J-lens) | Jacobian lens estandar, ajuste `jlens.fit` | Qwen3-14B, revision `40c06982` | Objetivo 38, fuente 0-37 | Apache-2.0 | Repositorio publico con hashes y `fit.json` |
| `bubskee/qwen3-14b-jr-lenses` (R-lens) | RelP: retropropagacion modificada (LN, SiLU identidad, regla mitad `beta=0.5` en MLP con compuerta) | Mismo checkpoint y mismos 25 documentos | Objetivo 38, fuente 0-37 | Apache-2.0 | Repositorio publico con hashes y `fit.json` |
| `camilablank/workspace-lenses` | J-lens y R-lens (metodo original de R-lens) | No disponible en la informacion proporcionada | No disponible | No disponible | Publicado en HuggingFace por los autores del metodo |
| Logit lens clasico | Proyeccion directa del residuo con la matriz de desembebido, sin ajuste | Cualquier transformer | Todas | Segun implementacion | Ampliamente disponible, sin ajuste |
| SAE (por ejemplo, familias tipo Gemma Scope / Neuronpedia) | Autoencoders dispersos por capa | Variable | Capas seleccionadas | Variable | Amplia disponibilidad, pero requiere entrenamiento por capa y modelo |

La comparación cuantitativa entre estas alternativas no es posible con la información disponible: no hay métricas publicadas para este repositorio ni datos de rendimiento de las lentes de terceros en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo generativo: ningún caso de uso de generación de texto, código, razonamiento o agentes es aplicable a este artefacto. Cualquier expectativa en ese sentido es un malentendido del repositorio.
- Dependencia estricta del checkpoint: las lentes solo son válidas para Qwen3-14B en la revisión `40c069824f4251a91eefaf281ebe4c544efd3e18`. Usarlas con `Qwen3-14B-Base` o con otra revisión produce resultados no válidos, como advierte explícitamente la model card.
- Ajuste de alcance reducido: 25 documentos, `max_seq_len` 128 y `skip_first` 4. La cobertura del espacio de activaciones es limitada y no se documenta ninguna validación fuera de ese conjunto de prompts.
- Ausencia de métricas de fidelidad: no se publican medidas que permitan saber cuánto se aproximan los readouts J y R a la salida real del modelo, ni en qué capas o dominios fallan.
- Sesgos del corpus de ajuste: `pile-10k` es un subconjunto de Pile, predominantemente en inglés; los sesgos de contenido y de idioma del corpus pueden trasladarse a las lecturas de la lente.
- Riesgo de sobreinterpretación: los tokens con mayor puntuación en una lente no son necesariamente la "intención" del modelo. La interpretación corresponde a los métodos originales (Gurnee et al., Blank et al., RelP), no al autor del ajuste.
- Riesgo de seguridad al cargar los artefactos: los `lens.pt` se cargan con `weights_only=False`, es decir, mediante deserialización de pickle. Solo deben abrirse ficheros de confianza; conviene verificar los hashes SHA-256 publicados antes de cargarlos.
- Licencia: las lentes y su documentación se distribuyen bajo Apache-2.0, lo que permite uso comercial. El modelo base Qwen3-14B se distribuye por separado también bajo Apache-2.0, pero no se incluye en este repositorio, por lo que su uso comercial se rige por la licencia de Qwen.
- Sin garantías de mantenimiento: el repositorio registra 0 descargas y 1 like, fue creado el 2026-10-16 y no hay evidencia de soporte continuado ni de versiones posteriores.
- Ausencia de soporte en runtimes de inferencia: no hay integración con vLLM, llama.cpp, Ollama ni TGI; el flujo de trabajo requiere código propio sobre Transformers y `jlens`.
- Idiomas soportados: no declarados en la información proporcionada, lo que impide garantizar un comportamiento consistente fuera del inglés.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/bubskee/qwen3-14b-jr-lenses
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-14B/blob/40c069824f4251a91eefaf281ebe4c544efd3e18/LICENSE
- J-lens, Gurnee et al., "Verbalizable Representations Form a Global Workspace in Language Models": https://transformer-circuits.pub/2026/workspace/index.html
- Implementacion de referencia de Jacobian-lens (codigo y walkthrough interactivo): https://github.com/anthropics/jacobian-lens
- Walkthrough interactivo: https://github.com/anthropics/jacobian-lens/blob/main/walkthrough.ipynb
- R-lens, Camila Blank, Agam Bhatia y Neel Nanda, "R-lens: Making J-lens More Faithful on Early Layers": https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers
- Lentes J/R publicadas por los autores del metodo R-lens: https://huggingface.co/camilablank/workspace-lenses
- RelP, "Faithful and Efficient Circuit Discovery via Relevance Patching": https://arxiv.org/abs/2508.21258
- Repositorio de investigacion euphoria-axis: https://github.com/bubskee/euphoria-axis
- Metadatos de las ejecuciones de ajuste: https://github.com/bubskee/euphoria-axis/tree/main/runs/qwen3-14b-r4
- Implementacion del ajuste con retropropagacion parcheada: https://github.com/bubskee/euphoria-axis/blob/main/tools/runpod/gateL_fit.py
- Corpus de ajuste: https://huggingface.co/datasets/NeelNanda/pile-10k

Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado tecnico relacionado con este modelo, su metodo o su autor. Los unicos resultados obtenidos fueron paginas sin relacion con el tema, por lo que no se incluyen como enlaces.
