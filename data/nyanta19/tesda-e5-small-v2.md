# Nyanta19/tesda-e5-small-v2

## Resumen

tesda-e5-small-v2 es un modelo de embeddings de frases (sentence-similarity) desarrollado por Nyanta19 (Prince Esteves) como pieza de matching del proyecto TESDA-TRACK. Se trata de un fine-tune de intfloat/multilingual-e5-small cuyo unico objetivo es emparejar objetivos de aprendizaje redactados en ingles, filipino o taglish con las cualificaciones oficiales de TESDA (Technical Education and Skills Development Authority, Filipinas). No es un modelo generativo: produce vectores de 384 dimensiones que se comparan por similitud coseno.

El modelo resuelve un problema muy concreto de recuperacion semantica en el dominio de la formacion profesional tecnica (TVET). Dada una frase libre de un usuario (por ejemplo, "quiero aprender a instalar aire acondicionado"), devuelve la cualificacion TESDA mas probable del catalogo de 319 cualificaciones, ademas de una decision de rechazo cuando la consulta no encaja con ninguna. El repositorio publica unicamente el grafo ONNX en fp32 (470 MB), sin pesos PyTorch, y el backend de TESDA-TRACK lo ejecuta en CPU a traves de fastembed.

Su relevancia es principalmente practica y de nicho: demuestra que un ajuste fino pequeno y barato (17 minutos de GPU en Colab, 24.631 pares) sobre un encoder multilingue de ~118 M de parametros puede mejorar de forma notable el matching respecto a su version anterior v1 (top-1 de 0,578 a 0,719 en el conjunto de desarrollo). No obstante, las propias cifras estan calibradas sobre el mismo conjunto de desarrollo y no se han validado aun sobre el conjunto de test sellado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (bi-encoder de embeddings); 12 capas, dimension oculta 384 (heredadas del modelo base) |
| Parametros totales | ~118 M (heredados de intfloat/multilingual-e5-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye unicamente ONNX en fp32 |
| Idiomas soportados | Ingles (en) y filipino/tagalo (tl), incluido taglish |
| Licencia | no disponible |
| Formato de pesos | ONNX (onnx/model.onnx, 470 MB, fp32); sin pesos PyTorch |
| Dimension del embedding | 384, con mean pooling y normalizacion L2 |
| Funcion de similitud | Similitud coseno |
| Prefijos requeridos | `query: ` para consultas y `passage: ` para el texto de las cualificaciones (convencion E5) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base intfloat/multilingual-e5-small: un encoder transformer de 12 capas y 384 dimensiones ocultas, entrenado como bi-encoder para producir embeddings de frases comparables mediante similitud coseno. El export a ONNX reproduce los embeddings de PyTorch con un coseno de 0,999999, segun el autor. La pipeline interna es mean pooling mas normalizacion L2 (`1_Pooling/` y `2_Normalize/`). El modelo conserva la convencion de los E5, que exige prefijar las consultas con `query: ` y los documentos con `passage: `; la API de TESDA-TRACK anade esos prefijos de forma automatica.

El ajuste fino se hizo exclusivamente con texto del catalogo TESDA (nombres de cualificaciones, competencias, ocupaciones, palabras clave y competencias nucleares) mas 4.682 consultas sinteticas de estilo aprendiz para las 319 cualificaciones. El 15 % de esas consultas incorporo una errata o una copia en lenguaje tipo SMS (688 pares). No se usaron registros de aprendices, trabajadores, T2MIS ni TSP. Se descarto cualquier consulta que coincidiera exactamente con un objetivo de evaluacion. En total se generaron 24.631 pares, de los que 23.399 fueron de entrenamiento y 1.232 quedaron reservados; la perdida en el conjunto reservado bajo de 2,69 a 0,147. El entrenamiento uso 3 epocas, tasa de aprendizaje 2e-5, batch de 64 (mini-batch de 16), CachedMultipleNegativesRankingLoss, semilla 42 y sin negativos duros minados; fueron 1.098 pasos y 17 minutos en una GPU de Colab.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud semantica y recuperacion.
- Matching de objetivos de aprendizaje (ingles, filipino o taglish) contra cualificaciones TESDA.
- Decision de rechazo (rejection) para consultas fuera de dominio, mediante umbrales de score calibrados.
- Recuperacion multilingue limitada al par ingles/filipino, con mejor rendimiento en ingles.
- Soporte de consultas con erratas o escritura informal (text-speak), entrenado explicitamente para ello.
- Ejecucion en CPU mediante ONNX Runtime y fastembed, sin necesidad de GPU.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, solo vectores.
- No soporta vision, audio ni modos de pensamiento.

## Casos de uso

- Matching de objetivos a cualificaciones en TESDA-TRACK: es el caso de uso original; la API embebe el catalogo con este modelo y resuelve consultas libres de usuarios por similitud coseno con umbrales calibrados (z_floor 3.0, z_ceiling 6.0, keyword_weight 0.4, min_score 25).
- Busqueda semantica en catalogos de formacion profesional: indexar nombres, competencias y ocupaciones de un catalogo TVET y permitir busquedas en lenguaje natural sin depender de coincidencia exacta de palabras clave.
- Recomendacion de rutas formativas: dado un objetivo de aprendizaje del usuario, recuperar la cualificacion y derivar de ella la ruta de formacion asociada.
- Normalizacion y desambiguacion de consultas entrantes: convertir texto libre (con erratas o taglish) en una referencia canonica de cualificacion antes de pasarlo a otros sistemas.
- Enrutado y triaje en atencion al cliente o ventanilla: clasificar la consulta del usuario hacia el area o tramite correcto a partir de su embedding.
- Filtrado de consultas fuera de dominio: la capacidad de rejection (0,901 en el conjunto de desarrollo) permite descartar saludos, preguntas genericas o texto que no corresponde a ninguna cualificacion.
- Deduplicacion y agrupacion de textos de catalogo: usar los embeddings para detectar entradas duplicadas o solapadas dentro de un catalogo de cualificaciones.
- Recuperacion aumentada (RAG) sobre normativa TVET: emplear los embeddings como recuperador sobre documentacion normativa en ingles o filipino.

## Benchmarks y rendimiento

Los resultados publicados son especificos del dominio (matching contra cualificaciones TESDA), no benchmarks estandar como MMLU o HumanEval. El conjunto de desarrollo tiene 1.454 objetivos escritos a mano: 1.263 con correspondencia TVET y 191 sin ella.

| Modelo | Parametros de score | Top-1 | Top-3 | MRR | Rejection |
|---|---|---|---|---|---|
| tesda-e5-small-v1 | 4.0 / 5.5 / 0.4 / 25 (propios) | 0.578 | 0.633 | 0.605 | 0.927 |
| tesda-e5-small-v1 | 4.0 / 6.0 / 0.3 / 20 (recalibrado en dev) | 0.591 | 0.639 | 0.614 | 0.921 |
| tesda-e5-small-v2 | 3.0 / 6.0 / 0.4 / 25 (calibrado en dev) | 0.719 | 0.783 | 0.750 | 0.901 |

Los parametros de score son `z_floor` / `z_ceiling` / `keyword_weight` / `min_score`. Ambas calibraciones exigieron al menos un 90 % de rejection.

Top-1 por idioma (cada modelo con su calibracion de desarrollo):

| Modelo | Ingles | Taglish | Filipino |
|---|---|---|---|
| v1 | 0.743 | 0.571 | 0.436 |
| v2 | 0.846 | 0.740 | 0.551 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo esta pensado para ejecutarse en CPU. Uso de memoria en RAM del orden de 0,5-1 GB para el grafo ONNX en fp32 (470 MB) mas el runtime.
- GPU recomendadas: ninguna en particular; al ser un encoder de ~118 M de parametros puede ejecutarse en cualquier GPU, incluidas integradas, pero no es necesario.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, e incluso sin GPU. El autor lo ejecuta en CPU a traves de fastembed en la API de TESDA-TRACK.
- Opciones de despliegue: fastembed sobre ONNX Runtime es el camino documentado; al distribuirse solo ONNX, no se ofrecen pesos GGUF ni soporte directo de llama.cpp u Ollama. vLLM y TGI estan orientados a modelos generativos y no aplican a este caso.
- Latencia y throughput estimados: no disponible. El unico dato de tiempos publicado es el de entrenamiento (17 minutos, 1.098 pasos, en una GPU de Colab).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension del embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tesda-e5-small-v2 | ~118 M | 512 tokens | 384 | no disponible | ONNX fp32 en HuggingFace |
| intfloat/multilingual-e5-small (base) | ~118 M | 512 tokens | 384 | MIT (segun el repositorio del modelo base) | safetensors/ONNX en HuggingFace |
| tesda-e5-small-v1 | ~118 M | 512 tokens | 384 | no disponible | no especificada en la informacion disponible |

Frente al modelo base, tesda-e5-small-v2 esta especializado en el dominio TESDA y ajustado con datos sinteticos: obtiene 0,719 de top-1 en el conjunto de desarrollo, mientras que el modelo base no esta ajustado para esta tarea. Frente a v1, mejora el top-1 en 0,141 puntos, el top-3 en 0,150 puntos y el MRR en 0,145 puntos, a costa de un ligero descenso del rejection (de 0,927 a 0,901). No se dispone de una comparacion directa con el modelo base en este mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Puntuaciones optimistas: los parametros de score se calibraron sobre el mismo conjunto de desarrollo. El conjunto de test sellado (479 objetivos) no se ha ejecutado todavia.
- Puntos debiles declarados: objetivos cercanos a TVET pero fuera de su ambito (top-1 0,46); texto que no es objetivo, como saludos o preguntas (rejection 0,86); objetivos sin correspondencia con erratas (rejection 0,75, frente a 1,00 en v1); y objetivos solo en filipino (top-1 0,55).
- Alcance restringido: esta disenado para clasificar cualificaciones TESDA dentro de TESDA-TRACK; el propio autor advierte que no es un modelo de embeddings de proposito general.
- Rendimiento desigual por idioma: 0,846 en ingles frente a 0,551 en filipino, con taglish en 0,740.
- Riesgo de alucinacion: al no ser generativo, no genera texto, pero puede devolver una cualificacion incorrecta como primer resultado si la consulta es ambigua o esta fuera del dominio cubierto.
- Datos de entrenamiento sinteticos: 4.682 consultas generadas y sin datos reales de aprendices, trabajadores, T2MIS o TSP; esto puede sesgar el comportamiento hacia el estilo de esas consultas sinteticas.
- Licencia no especificada: la model card no indica licencia, lo que impide confirmar las condiciones de uso comercial; conviene aclararlo con el autor antes de un despliegue en produccion.
- Dependencia de los prefijos E5 (`query: ` y `passage: `) y de la normalizacion L2; omitirlos degrada la comparacion por similitud coseno.
- Sensibilidad a los parametros de calibracion (`calibration.json`: z_floor, z_ceiling, keyword_weight, min_score); un cambio de catalogo o de distribucion de consultas puede exigir recalibrar.
- Formato unico ONNX en fp32: no hay pesos PyTorch ni variantes cuantizadas publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nyanta19/tesda-e5-small-v2
- Perfil del autor: https://huggingface.co/Nyanta19
- Repositorio del proyecto TESDA-TRACK: https://github.com/monqzxc/TESDA-TRACK
- Modelo base intfloat/multilingual-e5-small: https://huggingface.co/intfloat/multilingual-e5-small
