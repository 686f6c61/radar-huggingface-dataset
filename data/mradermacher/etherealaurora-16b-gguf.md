# mradermacher/EtherealAurora-16B-GGUF

## Resumen

EtherealAurora-16B-GGUF es la distribucion en formato GGUF del modelo EtherealAurora-16B, un merge de modelos (model merging) creado por el usuario yamatazen y cuantizado por mradermacher. El modelo original combina pesos de distintos modelos mediante mergekit, una tecnica que fusiona los parametros de varios modelos base para intentar combinar sus capacidades sin necesidad de reentrenamiento. Con 16.064.742.400 parametros (aproximadamente 16B), se situa en la franja de modelos de tamano medio que pueden ejecutarse en hardware de consumo con cuantizaciones agresivas.

La relevancia de esta ficha radica en que el repositorio proporciona hasta once cuantizaciones GGUF distintas (desde Q2_K de 6,3 GB hasta Q8_0 de 17,2 GB), lo que permite desplegar el modelo en un rango amplio de hardware, desde GPUs de consumo con 8 GB de VRAM hasta estaciones de trabajo. El modelo esta etiquetado como conversacional y orientado al ingles.

La informacion disponible es limitada: no se detalla la composicion exacta del merge, no hay datos de entrenamiento publicados, no se declara licencia y no se han publicado resultados de benchmarks. Esta ficha refleja fielmente esa escasez de datos, marcando como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base yamatazen/EtherealAurora-16B; detalles del merge no disponibles) |
| Parametros totales | 16.064.742.400 (~16B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de modelos realizado con mergekit, segun las etiquetas del repositorio. No se especifica en la informacion disponible que tecnica de merge concreta se empleo (SLERP, TIES, DARE, passthrough, etc.), ni que modelos se combinaron para producirlo, ni los pesos o hiperparametros del merge. Tampoco consta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que un merge no implica entrenamiento adicional: los pesos se combinan directamente a partir de los modelos de origen.

La innovacion tecnica principal del repositorio es la cuantizacion: mradermacher ha generado cuantizaciones estaticas con la herramienta de llama.cpp, incluyendo variantes K-quant e IQ-quant. Ademas, se ofrece un repositorio paralelo (EtherealAurora-16B-i1-GGUF) con cuantizaciones ponderadas/imatrix, que suelen preservar mejor la calidad en tamanos bajos. No se documentan innovaciones arquitectonicas propias como atencion lineal, decodificacion especulativa o modos de razonamiento.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado de los modelos fusionados (no se detalla que capacidades especificas se preservaron del merge).
- No consta soporte explicito de tool calling o function calling en la informacion disponible.
- No consta soporte de agentes ni de razonamiento multi-paso documentado.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se documentan capacidades de vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (9,8 GB) el modelo cabe en GPUs de consumo de 12 GB o mas, permitiendo ejecutar un asistente conversacional en ingles sin conexion.
- Prototipado rapido de chatbots: al ser un modelo conversacional de 16B, sirve para validar flujos de dialogo en entornos de desarrollo antes de migrar a modelos mayores o con licencia comercial clara.
- Experimentacion con model merging: investigadores interesados en evaluar la calidad de merges comunitarios pueden usar estas cuantizaciones para comparar el comportamiento del merge frente a sus modelos de origen con bajo coste de infraestructura.
- Generacion de texto en ingles para tareas creativas: redaccion de borradores, resumenes y parafraseo en ingles, aprovechando el formato GGUF para ejecucion en CPU o GPU mixta con llama.cpp.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que permite medir el impacto de la cuantizacion en la perplejidad y la calidad de salida para un mismo modelo.
- Educacion y divulgacion: util para demostrar el pipeline completo de merge y cuantizacion GGUF en cursos o talleres sobre IA open source, dado el amplio catalogo de ficheros disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun tamano de fichero): Q2_K ~6,3 GB; Q3_K_M ~8,0 GB; IQ4_XS ~9,0 GB; Q4_K_M ~9,8 GB; Q5_K_M ~11,5 GB; Q6_K ~13,3 GB; Q8_0 ~17,2 GB. A estas cifras hay que sumar el overhead de contexto y de la propia aplicacion.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4070 Ti Super o RTX 4080 (16 GB) es suficiente; para Q8_0 se recomienda una RTX 4090 (24 GB), A100 40 GB o H100.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas con cuantizaciones Q4 o inferiores; en tarjetas de 8 GB solo con Q2_K o Q3_K_S y contexto reducido, o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EtherealAurora-16B-GGUF | ~16B | no disponible | no disponible | GGUF | Merge comunitario, solo ingles |
| Modelo base yamatazen/EtherealAurora-16B | ~16B | no disponible | no disponible | safetensors (presumible) | Origen del merge sin cuantizar |
| EtherealAurora-16B-i1-GGUF | ~16B | no disponible | no disponible | GGUF (imatrix) | Variante con cuantizacion ponderada del mismo modelo |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a los repositorios directamente relacionados con este modelo.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base y de los modelos fusionados antes de usarlo en produccion.
- Solo soporta ingles segun la etiqueta de idioma; el rendimiento en castellano no esta garantizado ni documentado.
- Al ser un merge sin benchmarks publicados, no hay evidencia cuantitativa de su calidad frente a modelos entrenados de forma convencional.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad.
- La composicion del merge no esta documentada, lo que dificulta auditar sesgos heredados de los modelos de origen.
- Longitud de contexto desconocida: planificar el despliegue con contexto conservador y validar el comportamiento en conversaciones largas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El repositorio ocupa 110,5 GB en total; descargar solo el fichero de cuantizacion necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EtherealAurora-16B-GGUF
- Modelo base: https://huggingface.co/yamatazen/EtherealAurora-16B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/EtherealAurora-16B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#EtherealAurora-16B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
