# mradermacher/BBA-123-GGUF

## Resumen

BBA-123-GGUF es la distribucion en formato GGUF del modelo BBA-123, un merge de modelos creado por el usuario Supichi mediante mergekit y cuantizado por mradermacher. El modelo original es un transformer de aproximadamente 17.160 millones de parametros (17,16 B), orientado a conversacion y con soporte declarado unicamente para ingles. Esta publicacion no aporta informacion sobre la composicion del merge, los modelos de origen ni el proceso de entrenamiento, por lo que se desconoce su procedencia tecnica exacta.

La relevancia de esta ficha es practica: el repositorio ofrece una bateria completa de cuantizaciones estaticas GGUF (desde Q2_K hasta Q8_0) que permiten ejecutar un modelo de 17 B en hardware de consumo, algo imposible con los pesos originales en precision completa. El tamano del repositorio, 118,2 GB, refleja la suma de todas las variantes publicadas.

Se trata, por tanto, de un modelo de nicho con muy poca traccion (39 descargas, 0 likes en el momento de la consulta) y sin documentacion tecnica publicada por el autor del merge. Cualquier evaluacion de calidad debe hacerse empiricamente, ya que no hay benchmarks ni model card detallada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; modelo derivado de mergekit) |
| Parametros totales | 17.160.508.416 (17,16 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales del modelo base presumiblemente en safetensors |
| Modelo base | Supichi/BBA-123 |
| Herramienta de merge | mergekit |
| Compatibilidad de endpoints | endpoints_compatible |
| Tamano del repositorio | 118,2 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Supichi/BBA-123: la model card del repositorio GGUF no detalla el numero de capas, dimensiones ocultas, tipo de atencion ni mecanismos adicionales. La unica etiqueta tecnica relevante es `mergekit`, que indica que el modelo se genero fusionando los pesos de dos o mas modelos preexistentes mediante tecnicas de model merging (posiblemente SLERP, TIES, DARE o similar), sin un entrenamiento adicional documentado.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o SFT. El autor de la cuantizacion (mradermacher) solo documenta el proceso de conversion a GGUF, no el entrenamiento. Las cuantizaciones publicadas son estaticas: el propio autor indica que no hay versiones con imatrix (weighted quants) disponibles en el momento de la publicacion, lo que sugiere que no se generaron calibraciones especificas para este modelo.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones: capacidad esperable por el tamano (17 B) y por el formato de chat, aunque no verificada con benchmarks.
- Soporte multilingue limitado al ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- No consta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking mode).
- No consta soporte de vision, audio ni modalidades adicionales.
- Compatible con endpoints de inferencia estandar (etiqueta `endpoints_compatible`).
- Capacidad de ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (10,6 GB) el modelo cabe en GPUs de consumo de 12-16 GB y permite iterar rapidamente sobre prompts y flujos de chat sin coste de API.
- Experimentacion con tecnicas de model merging: util para investigadores que quieran evaluar el comportamiento de un merge de 17 B frente a sus modelos de origen, comparando respuestas cualitativas.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (6,7 GB) y Q3_K_S (7,8 GB) permiten ejecutar el modelo en equipos con 8 GB de VRAM o incluso en CPU con RAM suficiente, para tareas de generacion de texto no criticas.
- Generacion de texto offline y privacidad de datos: al ejecutarse localmente con llama.cpp, el modelo es adecuado para procesar texto sensible sin enviarlo a servicios externos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo base.
- Base para fine-tuning o merges posteriores: los pesos originales del modelo base pueden servir como punto de partida, aunque la falta de licencia clara es un obstaculo para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base Supichi/BBA-123 tampoco aporta datos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~7 GB
  - Q3_K_M: ~9 GB
  - IQ4_XS: ~10 GB
  - Q4_K_M: ~11 GB
  - Q5_K_M: ~13 GB
  - Q6_K: ~15 GB
  - Q8_0: ~19 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_S y Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: si, desde Q2_K en adelante; las variantes Q4_K_S y Q4_K_M son las recomendadas por el autor por equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. Como referencia cualitativa, un modelo de 17 B en Q4_K_M suele generar entre 15 y 40 tokens/s en GPUs de gama alta de consumo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones detalladas del modelo base que permitan una comparacion rigurosa. Se ofrece una comparacion estructural con alternativas de tamano similar ampliamente documentadas:

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| BBA-123-GGUF | 17,16 B | no disponible | no disponible | GGUF | Minima (solo cuantizacion) |
| Mistral 7B Instruct (GGUF) | 7,2 B | 32k (v0.2/v0.3) | Apache 2.0 | GGUF, safetensors | Extensa, benchmarks publicos |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 128k | Llama 3.1 Community | GGUF, safetensors | Extensa, benchmarks publicos |
| Qwen2.5 14B Instruct (GGUF) | 14,7 B | 32k (128k en Turbo) | Apache 2.0 | GGUF, safetensors | Extensa, benchmarks publicos |

La comparacion pone de manifiesto que BBA-123 carece de la documentacion, licencia clara y benchmarks que si acompanan a los modelos de referencia de su rango de tamano.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo en tareas estandar.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; tratarlo como no apto para produccion hasta verificar la licencia del modelo base Supichi/BBA-123.
- Idioma limitado al ingles: el rendimiento en castellano es incierto y probablemente deficiente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y agravado por la falta de evaluacion; no recomendado para tareas factuales sin verificacion.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento ni los modelos fusionados, no es posible evaluar sesgos de genero, raza, ideologia u otros.
- Contexto desconocido: sin especificacion de la ventana de contexto, el despliegue en produccion requiere pruebas empiricas para determinar el limite practico.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay weighted quants, por lo que la calidad de las variantes de baja precision (Q2_K, Q3_K_S) puede degradarse mas que en modelos con calibracion imatrix.
- Traccion minima: 39 descargas y 0 likes indican escasa validacion por parte de la comunidad; no hay reportes de uso en produccion.
- Modelo derivado de merge sin documentacion: la composicion del merge es opaca, lo que dificulta el analisis de riesgos y la reproducibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BBA-123-GGUF
- Modelo base: https://huggingface.co/Supichi/BBA-123
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#BBA-123-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit (herramienta de merging): https://github.com/arcee-ai/mergekit
