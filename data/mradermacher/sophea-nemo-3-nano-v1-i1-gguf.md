# mradermacher/Sophea-Nemo-3-Nano-v1-i1-GGUF

## Resumen

mradermacher/Sophea-Nemo-3-Nano-v1-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo ayoubkirouane/Sophea-Nemo-3-Nano-v1, publicado por el cuantizador mradermacher el 16 de septiembre de 2026. El modelo base cuenta con 31.577.940.288 parámetros (unos 31,6 mil millones) y, según las etiquetas declaradas (moe, mamba, nemotron, hybrid), emplea una arquitectura híbrida que combina mezcla de expertos con capas de espacio de estados tipo Mamba.

El repositorio resuelve un problema de despliegue: el modelo base en safetensors requiere aproximadamente 63 GB en bf16, fuera del alcance de cualquier GPU de consumo. Las cuantizaciones i1, generadas con matriz de importancia (imatrix), reducen el peso a entre 18,0 y 22,0 GB, lo que permite ejecutarlo en una única GPU de 24 GB con llama.cpp y derivados.

Su interés actual es doble: por un lado, cubre el par de idiomas griego-inglés con un enfoque declarado de coincidencia de idioma (language-matched) y modo de razonamiento (reasoning, thinking); por otro, sirve como caso de estudio de arquitecturas híbridas MoE+Mamba cuantizadas. El modelo no acumula descargas ni valoraciones, y no se ha publicado en la información disponible la model card del modelo original, su contexto máximo ni su recuento de parámetros activos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: mezcla de expertos (MoE) con capas de espacio de estados tipo Mamba, según las etiquetas declaradas (moe, mamba, nemotron, hybrid) |
| Parámetros totales | 31.577.940.288 (≈31,6 mil millones) |
| Parámetros activos | no disponible (el modelo es MoE, pero no se publica el número de parámetros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1 (imatrix): i1-Q2_K, i1-IQ3_M, i1-Q4_K_S. Repositorio estático: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | griego (el) e inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se publica en safetensors para transformers) |
| Tamaño del repositorio | 138,2 GB |
| Modelo base | ayoubkirouane/Sophea-Nemo-3-Nano-v1 |
| Cuantizador | mradermacher |
| Fecha de publicación | 16 de septiembre de 2026 (última actualización: 16 de septiembre de 2026) |

## Arquitectura y entrenamiento

La única información arquitectónica disponible proviene de las etiquetas del repositorio, que apuntan a un diseño híbrido: mezcla de expertos (moe) combinada con capas de espacio de estados (mamba) dentro de la línea Nemotron de NVIDIA (nemotron). Se trata, por tanto, de un transformer híbrido en el que parte de las capas se sustituyen por bloques SSM de complejidad lineal, lo que reduce el coste de atención en contextos largos y el coste de cómputo por token frente a un modelo denso del mismo tamaño. Al ser MoE, el coste de memoria sigue siendo el de los 31,6 mil millones de parámetros totales; el ahorro se produce en cómputo, no en VRAM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo ajuste por RLHF, DPO u otra técnica de alineamiento: la model card del modelo original no está incluida en la información proporcionada. El repositorio etiqueta una referencia al paper arXiv:2608.17744, cuyo contenido no se ha podido verificar. La innovación técnica verificable aquí es la cuantización: los quants i1 se generan con una matriz de importancia (imatrix) derivada de datos de calibración, en lugar de cuantización estática, lo que en la práctica reduce la perplejidad para un mismo tamaño de fichero.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta conversational).
- Razonamiento explícito con modo de pensamiento (etiquetas reasoning y thinking).
- Coincidencia de idioma (language-matched): el modelo está etiquetado para responder en el idioma de la petición dentro del par griego-inglés.
- Arquitectura MoE híbrida: menor cómputo por token que un modelo denso de 31,6 mil millones de parámetros si el número de expertos activos es reducido (dato no disponible).
- Procesamiento de secuencias largas con coste subcuadrático en las capas SSM (la longitud de contexto concreta no está publicada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible más allá de la etiqueta reasoning.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Capacidades multilingües fuera de griego e inglés: no disponibles.

## Casos de uso

- Atención al cliente en griego: despliegue de un asistente conversacional que mantiene hilos multi-turno en griego, con vocabulario y registro nativos, sobre una única GPU de 24 GB usando i1-Q4_K_S.
- Razonamiento asistido con modo thinking: análisis de casos, resolución de problemas estructurados y generación de cadenas de razonamiento verificables en inglés, aprovechando la etiqueta reasoning del modelo.
- Inferencia local en estación de trabajo: ejecución en llama.cpp o LM Studio con i1-Q2_K (18,0 GB) o i1-IQ3_M (18,2 GB) en una RTX 4090 o RTX 3090, sin depender de APIs externas ni de conectividad.
- Servicio de inferencia en servidor: despliegue de i1-Q4_K_S (22,0 GB) en GPU de 32 a 48 GB para dar servicio a varios usuarios concurrentes con contexto moderado, equilibrando calidad y latencia.
- Traducción y adaptación de contenido griego-inglés: normalización de textos, resumen de documentación y reformulación de registros entre ambos idiomas, tareas donde el etiquetado language-matched es directamente aplicable.
- Prototipado de arquitecturas híbridas MoE+Mamba: uso del modelo como banco de pruebas para medir el comportamiento de quants i1 frente a quants estáticos en capas SSM, comparando perplejidad y velocidad en llama.cpp.
- Clasificación y filtrado de documentos: etiquetado de grandes volúmenes de texto en inglés o griego con contexto corto, donde el menor coste de cómputo por token del diseño MoE reduce el coste por documento frente a un denso equivalente.
- Investigación en igualdad de idioma: evaluación de sesgos y de calidad lingüística en griego, un idioma con menos recursos que el inglés, usando el modelo como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y la búsqueda web asociada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

Los tamaños de fichero son datos declarados en el propio repositorio; los requisitos de VRAM se derivan de ellos y son estimaciones.

| Cuantización | Tamaño del fichero | VRAM estimada (pesos + margen) | GPU recomendada |
|---|---|---|---|
| i1-Q2_K | 18,0 GB | ≈20-22 GB con contexto corto | RTX 3090 / RTX 4090 (24 GB) |
| i1-IQ3_M | 18,2 GB | ≈20-22 GB con contexto corto | RTX 3090 / RTX 4090 (24 GB) |
| i1-Q4_K_S | 22,0 GB | ≈24 GB o más; muy justo en 24 GB | V100 32 GB, A100 40 GB, RTX 6000 Ada |
| Pesos base (bf16/fp16) | ≈63 GB | ≈70 GB o más | 2× A100 40 GB, 1× H100 80 GB |

- Cabe en GPU de consumo: sí, en las variantes i1-Q2_K, i1-IQ3_M y, con limitaciones de contexto, i1-Q4_K_S sobre RTX 3090 o RTX 4090 de 24 GB.
- Al ser MoE, todos los parámetros deben residir en memoria; el ahorro de la arquitectura es de cómputo, no de VRAM. No es posible repartir expertos entre RAM y VRAM sin penalización severa de latencia.
- Despliegue en GGUF: llama.cpp, llama-cpp-python, llama.cpp server, Ollama, LM Studio, koboldcpp, text-generation-webui.
- Despliegue del modelo base en safetensors: vLLM, TGI o SGLang (el soporte de GGUF en estos servidores es parcial y no está garantizado para esta arquitectura híbrida).
- Las versiones de mayor precisión del repositorio estático (Q5_K_M, Q6_K, IQ4_XS, Q4_K_M, Q3_K_L, etc.) no publican tamaño en la información disponible; se pueden generar quants propios con el fichero imatrix de 0,2 GB incluido en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base, por lo que la comparación con alternativas solo puede hacerse en términos de categoría. La siguiente tabla incluye datos de referencia general sobre otras familias; deben verificarse en sus fichas originales, ya que no proceden de la información proporcionada en esta búsqueda.

| Modelo | Arquitectura | Parámetros totales | Activos | Contexto | Licencia |
|---|---|---|---|---|---|
| Sophea-Nemo-3-Nano-v1 (este repositorio) | MoE + Mamba híbrida | 31,6 mil millones | no disponible | no disponible | apache-2.0 |
| Jamba-1.5-Mini (AI21) | MoE + Mamba híbrida | 52 mil millones | 12 mil millones | 256K | apache-2.0 |
| Qwen3-30B-A3B (Alibaba) | MoE transformer | 30,5 mil millones | 3,3 mil millones | 128K | apache-2.0 |
| Repositorio estático de quants del mismo modelo (mradermacher) | Igual, sin imatrix | 31,6 mil millones | no disponible | no disponible | apache-2.0 |

Diferencias relevantes: frente a Jamba-1.5-Mini, este modelo es un 39 % más pequeño en parámetros totales y no publica contexto máximo declarado; frente a Qwen3-30B-A3B, el tamaño total es prácticamente idéntico, pero la arquitectura incorpora capas SSM en lugar de atención completa en todas las capas. No hay datos de rendimiento que permitan ordenar estas opciones.

## Limitaciones y advertencias

- No se dispone de la model card del modelo original: se desconoce la composición del dataset, el número de tokens de entrenamiento y si hubo RLHF o DPO. Esto impide auditar sesgos de origen.
- Riesgo de alucinación: los modelos con modo de razonamiento explícito pueden generar cadenas plausibles pero incorrectas, especialmente en tareas de cálculo o de recuperación de hechos. No se han publicado evaluaciones que permitan cuantificar este riesgo.
- Idiomas: solo griego e inglés están declarados. El castellano no figura entre los idiomas soportados, por lo que su uso en producción en España requeriría una evaluación previa y probablemente daría resultados degradados.
- Contexto: al no publicarse la longitud de contexto, no es posible planificar cargas de trabajo que dependan de ventanas largas. Conviene validar experimentalmente el punto de degradación antes de diseñar un pipeline.
- La etiqueta "Nano" del nombre no se corresponde con el tamaño real (31,6 mil millones de parámetros); no debe interpretarse como un modelo ligero.
- Cuantizaciones de muy baja precisión: el propio repositorio advierte que IQ3_XXS es probablemente mejor opción que i1-Q2_K para un tamaño similar. Los quants por debajo de Q4 degradan la calidad de forma apreciable, sobre todo en el modo de razonamiento.
- Los tamaños declarados para i1-Q2_K (18,0 GB), i1-IQ3_M (18,2 GB) y i1-Q4_K_S (22,0 GB) son superiores a los habituales en un modelo denso de 31,6 mil millones de parámetros para esos niveles de cuantización, lo que sugiere que algunas capas se mantienen en mayor precisión o que las capas SSM se cuantizan con un esquema distinto. Conviene verificar el consumo real antes de dimensionar hardware.
- Validación comunitaria nula: 0 descargas y 0 valoraciones en el momento de la consulta, y fecha de publicación muy reciente (septiembre de 2026). No se recomienda su uso en producción crítica sin una evaluación propia.
- Licencia: el repositorio y el modelo base declaran apache-2.0, lo que permite uso comercial, modificación y redistribución. Aun así, al ser una cuantización derivada, conviene conservar la atribución al autor original y al cuantizador.
- Licencia y condiciones del fichero imatrix: se distribuye junto al resto de pesos bajo la misma licencia del repositorio.
- Referencia a arXiv:2608.17744: la etiqueta existe, pero el contenido del paper no se ha podido verificar, por lo que no debe citarse como fuente técnica sin consultarlo directamente.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/Sophea-Nemo-3-Nano-v1-i1-GGUF
- Modelo base: https://huggingface.co/ayoubkirouane/Sophea-Nemo-3-Nano-v1
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Sophea-Nemo-3-Nano-v1-GGUF
- Fichero imatrix para generar quants propios: https://huggingface.co/mradermacher/Sophea-Nemo-3-Nano-v1-i1-GGUF/resolve/main/Sophea-Nemo-3-Nano-v1.imatrix.gguf
- Descarga i1-Q2_K: https://huggingface.co/mradermacher/Sophea-Nemo-3-Nano-v1-i1-GGUF/resolve/main/Sophea-Nemo-3-Nano-v1.i1-Q2_K.gguf
- Descarga i1-IQ3_M: https://huggingface.co/mradermacher/Sophea-Nemo-3-Nano-v1-i1-GGUF/resolve/main/Sophea-Nemo-3-Nano-v1.i1-IQ3_M.gguf
- Descarga i1-Q4_K_S: https://huggingface.co/mradermacher/Sophea-Nemo-3-Nano-v1-i1-GGUF/resolve/main/Sophea-Nemo-3-Nano-v1.i1-Q4_K_S.gguf
- Listado y descarga de cuantizaciones: https://hf.tst.eu/model#Sophea-Nemo-3-Nano-v1-i1-GGUF
- Peticiones de cuantización y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper referenciado por etiqueta (contenido no verificado): https://arxiv.org/abs/2608.17744
