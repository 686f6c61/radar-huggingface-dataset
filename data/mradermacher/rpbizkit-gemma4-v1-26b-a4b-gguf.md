# mradermacher/RPBizkit-Gemma4-v1-26B-A4B-GGUF

## Resumen

RPBizkit-Gemma4-v1-26B-A4B-GGUF es la distribucion en formato GGUF del modelo RPBizkit-Gemma4-v1-26B-A4B, un merge de tipo "ht-mergekit" construido sobre la familia Gemma 4 con una arquitectura de mezcla de expertos (MoE) de aproximadamente 25.233 millones de parametros totales y alrededor de 4B de parametros activos por token (indicado por el sufijo A4B). El modelo original lo publica el usuario RicardoEstep y esta cuantizacion la realiza mradermacher, un perfil conocido por generar versiones GGUF de modelos comunitarios para su uso con llama.cpp y derivados.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~25B parametros totales pero con un coste computacional por token cercano al de un modelo de 4B activos, lo que lo hace atractivo para despliegues en hardware de consumo o en servidores modestos. El repositorio incluye cuantizaciones estaticas desde Q2_K hasta Q8_0, ademas de dos variantes del proyector multimodal (mmproj) en Q8_0 y f16, lo que sugiere capacidades de vision heredadas del modelo base.

No obstante, se trata de un modelo comunitario sin model card detallada, sin licencia declarada en el repositorio y etiquetado como "not-for-all-audiences", por lo que su evaluacion rigurosa para produccion requiere precaucion y verificacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Gemma 4, generada mediante ht-mergekit (merge de modelos) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (inferido del sufijo A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge realizado con ht-mergekit sobre la familia Gemma 4, con una topologia MoE que suma aproximadamente 25,2B parametros totales pero activa en torno a 4B por token. Esto implica que, en inferencia, el coste computacional se aproxima al de un modelo denso de 4B, mientras que la memoria necesaria para cargar los pesos se corresponde con los 25B totales. El modelo base declarado es RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B, y esta publicacion es una cuantizacion estatica del mismo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones tecnicas especificas del merge (por ejemplo, que capas o expertos se combinaron, o con que pesos). La presencia de ficheros mmproj indica que el modelo conserva el proyector multimodal de Gemma 4, lo que habilita entrada de imagenes en las variantes que lo incluyan.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Capacidades multimodales (vision) inferidas por la presencia de ficheros mmproj Q8_0 y f16, aunque no se detalla el alcance en la model card.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a la cuantizacion Q4_K_M (16,9 GB) o IQ4_XS (14,2 GB), el modelo puede cargarse en GPUs con 16-24 GB de VRAM, manteniendo un coste por token bajo por su naturaleza MoE de ~4B activos.
- Prototipado de asistentes conversacionales en ingles: la etiqueta "conversational" y el formato GGUF permiten integrarlo rapidamente en llama.cpp u Ollama para pruebas de dialogo multi-turno.
- Experimentacion multimodal ligera: cargando el mmproj Q8_0 (0,9 GB) junto con una cuantizacion Q4 o Q5, se puede explorar la entrada de imagenes en entornos con recursos limitados.
- Evaluacion comparativa de merges comunitarios: util para investigadores que quieran medir el impacto de tecnicas ht-mergekit frente al modelo Gemma 4 original en tareas de generacion.
- Servicio de inferencia en CPU o configuraciones hibridas: las cuantizaciones Q2_K (10,7 GB) y Q3_K_S (12,3 GB) permiten ejecucion en CPU con RAM moderada, aunque con perdida de calidad.
- Base para fine-tuning o destilacion: al estar disponible el modelo base en safetensors, se puede partir de el para ajustes especificos antes de recuantizar a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado):
  - Q2_K: ~11-12 GB
  - Q3_K_S: ~13-14 GB
  - IQ4_XS: ~15 GB
  - Q4_K_M: ~17-18 GB
  - Q5_K_M: ~20-21 GB
  - Q6_K: ~23-24 GB
  - Q8_0: ~28-30 GB
  - mmproj adicional: ~1 GB (Q8_0) o ~1,3 GB (f16)
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para Q8_0 y despliegues concurrentes.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la cuantizacion. La naturaleza MoE con ~4B activos sugiere un throughput superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| RPBizkit-Gemma4-v1-26B-A4B-GGUF | ~25,2B | ~4B | no disponible | no disponible | GGUF |
| Gemma 4 (modelo original de Google) | no disponible en esta ficha | no disponible | no disponible | Gemma Terms of Use (segun familia Gemma) | safetensors, GGUF |
| Mixtral 8x7B (referencia MoE) | ~46,7B | ~12,9B | 32k | Apache 2.0 | safetensors, GGUF |

La comparativa con el Gemma 4 original no puede completarse con datos verificados en esta informacion; se incluye como referencia cualitativa. Mixtral 8x7B se ofrece como punto de comparacion por su naturaleza MoE, aunque con un perfil de parametros activos muy superior.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base (RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B) y de la familia Gemma 4 antes de cualquier uso en produccion.
- Etiqueta "not-for-all-audiences": el modelo puede generar contenido no apto para todos los publicos; requiere moderacion en aplicaciones expuestas a usuarios finales.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks publicados no se puede acotar su magnitud.
- Modelo derivado de un merge comunitario: la calidad puede degradarse respecto al Gemma 4 original, y no hay evaluacion independiente disponible.
- Contexto no documentado: se desconoce la ventana maxima, lo que limita el diseno de aplicaciones con documentos largos.
- Cuantizaciones bajas (Q2_K, Q3_K_S): perdida notable de calidad; no recomendadas para tareas sensibles.
- Sin garantias de mantenimiento: el repositorio lo publica un tercero (mradermacher) y el modelo base procede de un usuario individual, sin respaldo corporativo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RPBizkit-Gemma4-v1-26B-A4B-GGUF
- Modelo base: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#RPBizkit-Gemma4-v1-26B-A4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
