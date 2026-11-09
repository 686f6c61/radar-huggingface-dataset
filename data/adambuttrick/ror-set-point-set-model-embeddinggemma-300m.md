# adambuttrick/ror-set-point-set-model-embeddinggemma-300m

## Resumen

`ror-set-point-set-model-embeddinggemma-300m` es un modelo de extraccion de caracteristicas (feature-extraction) desarrollado por adambuttrick para una tarea muy concreta: el enlazado de cadenas de afiliacion institucional con registros del ROR (Research Organization Registry). Dado un texto de afiliacion (por ejemplo, el que aparece en un articulo cientifico) y un conjunto de candidatos ROR, el modelo asigna a cada candidato la probabilidad de que la cadena se refiera a esa organizacion. Se trata de un fine-tuning sobre `google/embeddinggemma-300m`, el modelo de embeddings de Google basado en la arquitectura Gemma 3 Text.

La relevancia del modelo es practica: la desambiguacion de afiliaciones es un cuello de botella clasico en la construccion de grafos de conocimiento cientifico y en la normalizacion de metadatos de publicaciones. El modelo no es un generador de texto, sino un cross-encoder que lee conjuntamente la cadena y todos sus candidatos en una sola entrada, lo que le permite aprender reglas comparativas entre candidatos (por ejemplo, distinguir el hospital del nombre de la universidad asociada).

Con 302.863.104 parametros y un repositorio de 0,8 GB, es un modelo compacto pensado para despliegue en produccion con alta tasa de procesamiento (el autor reporta 140 cadenas por segundo en una NVIDIA H200). Pertenece a la coleccion "ROR set point matching", que incluye dataset, retriever, set model, baseline y variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 Text) con cabeza lineal de puntuacion por candidato y calibracion fija |
| Parametros totales | 302.863.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se documenta en la ficha) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/embeddinggemma-300m` y anade una cabeza lineal que asigna una puntuacion a cada candidato, calculada a partir de la media de los estados de token de ese candidato. La entrada tiene el formato `[CLS] string [SEP] record 1 [SEP] record 2 [SEP] ...`, de modo que el modelo procesa la cadena y todos los candidatos en una unica pasada y puede aprender reglas comparativas entre ellos. Una calibracion fija transforma cada puntuacion en probabilidad mediante `p = 1 / (1 + exp(-(a × score + b)))`, y la respuesta final son todos los candidatos con p ≥ 0,5; una respuesta vacia indica que la cadena no nombra ninguna organizacion.

El entrenamiento se realizo en dos etapas sobre el dataset `adambuttrick/ror-set-point-matching-train-validation-test`. La etapa 1 uso 167.533 cadenas del config `teacher_judgments` (con candidatos del top 32 del retriever mas los registros juzgados por el profesor, hasta un maximo de 42) y 133.753 cadenas del config `synthetic_non_latin`. La etapa 2 uso 16.448 cadenas del config `affiliations_unseen_institutions` con el top 32 del retriever y el top 10 de un indice lexico. La calibracion se ajusto con puntuaciones out-of-fold obtenidas mediante validacion cruzada de cinco folds. Los candidatos en produccion provienen del retriever `ror-set-point-retriever-e5-base-openalex-jev-distill` (top 32) mas el top 10 de un indice lexico, lo que da aproximadamente 37,5 candidatos en orden aleatorio.

## Capacidades

- Puntuacion de candidatos ROR: asigna a cada registro candidato la probabilidad de que la cadena de afiliacion lo nombre.
- Enlazado de entidades (entity linking) en el dominio de afiliaciones institucionales cientificas.
- Razonamiento comparativo entre candidatos: al leer todos los candidatos en una sola entrada, aprende reglas como "etiquetar el hospital pero no la universidad que aparece en su nombre".
- Deteccion de ausencia de organizacion: devuelve una respuesta vacia cuando la cadena no nombra ninguna organizacion.
- Procesamiento por lotes de cadenas con sus listas de candidatos mediante la API `SetMatcher.predict`.
- Integracion con el ecosistema Hugging Face: `transformers`, `safetensors`, `huggingface_hub` y compatibilidad con text-embeddings-inference y endpoints.
- No soporta generacion de texto, tool calling, agentes ni vision; es exclusivamente un modelo de puntuacion de pares cadena-candidato.

## Casos de uso

- Normalizacion de metadatos de publicaciones cientificas: dado el campo de afiliacion de cada autor en un articulo, el modelo devuelve el identificador ROR correcto, lo que permite construir grafos de colaboracion institucional fiables a partir de bases como OpenAlex o Crossref.
- Desambiguacion en pipelines de indexacion academica: integrado tras un retriever dual-encoder (top 32) y un indice lexico (top 10), el modelo reordena y filtra los aproximadamente 37,5 candidatos por cadena, reduciendo falsos positivos antes de escribir en el indice.
- Enriquecimiento de repositorios institucionales: procesar lotes de registros de publicaciones para asignar ROR a afiliaciones historicas o con variantes ortograficas, aprovechando la calibracion que produce probabilidades directamente interpretables con umbral 0,5.
- Auditoria y limpieza de datos de financiacion: verificar si las afiliaciones declaradas en proyectos financiados corresponden a la institucion registrada, detectando cadenas que no nombran ninguna organizacion (respuesta vacia).
- Construccion de grafos de conocimiento cientifico: alimentar la capa de resolucion de entidades de un grafo con la salida del modelo, que ya entrega pares (ror_id, probabilidad) listos para umbralizar.
- Investigacion sobre entity linking: servir como variante de referencia (base EmbeddingGemma) frente a la variante mmbert-base dentro de la misma coleccion, para comparar el comportamiento de distintos modelos base en la misma tarea.
- Procesamiento a gran escala con requisitos de latencia: con 140 cadenas por segundo en una H200 y solo 0,8 GB de pesos, es viable procesar corpus completos de afiliaciones en horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento proporcionado es el de procesamiento: 140 cadenas por segundo en una NVIDIA H200, segun el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 302,9 millones de parametros en precision completa (fp32) los pesos ocupan aproximadamente 1,2 GB, y en fp16/bf16 alrededor de 0,6 GB, a lo que hay que sumar el estado de activaciones y las representaciones de los candidatos.
- GPU recomendadas: el autor menciona una NVIDIA H200 para la cifra de 140 cadenas por segundo; por tamano, el modelo cabe holgadamente en A100, H100, L40S y RTX 4090.
- Cabe en GPU de consumo: si, por el numero de parametros cabe en cualquier GPU consumer moderna (RTX 3060 en adelante), aunque no se documentan cifras de latencia en estas tarjetas.
- Opciones de despliegue: `transformers` con el script `set_model.py` proporcionado por el autor (requiere solo torch, transformers, safetensors y huggingface_hub); el modelo esta etiquetado como compatible con text-embeddings-inference y endpoints. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 140 cadenas por segundo en una NVIDIA H200; no se proporcionan datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ror-set-point-set-model-embeddinggemma-300m | 302.863.104 | no disponible | Puntuacion de candidatos ROR (cross-encoder) | gemma | Hugging Face |
| ror-set-point-set-model-mmbert-base | no disponible | no disponible | Puntuacion de candidatos ROR (cross-encoder) | no disponible | Hugging Face |
| ror-set-point-set-model-mmbert-base-mask | no disponible | no disponible | Puntuacion de candidatos ROR (cross-encoder) | no disponible | Hugging Face |
| ror-set-point-retriever-e5-base-openalex-jev-distill | no disponible | no disponible | Recuperacion de candidatos ROR (dual encoder) | no disponible | Hugging Face |

La comparativa se limita a las variantes de la misma coleccion del autor, ya que no se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos de la misma categoria en la informacion proporcionada. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo esta entrenado para enlazar cadenas de afiliacion con registros ROR; no es un modelo de proposito general ni debe usarse para otras tareas de embeddings.
- Dependencia del pipeline: el modelo asume que los candidatos provienen del retriever `ror-set-point-retriever-e5-base-openalex-jev-distill` (top 32) mas el top 10 de un indice lexico; usar otras fuentes de candidatos puede degradar el rendimiento.
- Dependencia de datos externos: requiere cargar los textos de los registros ROR desde el config `ror_records` del dataset asociado para construir el matcher.
- Riesgo de alucinacion: al ser un modelo de puntuacion, el riesgo se manifiesta como falsos positivos (asignar probabilidad alta a un candidato incorrecto) o falsos negativos (devolver respuesta vacia cuando si hay organizacion); la calibracion se ajusto con validacion cruzada, pero no se documentan metricas de error.
- Sesgos: no se documentan sesgos conocidos; el entrenamiento incluye un config `synthetic_non_latin` para cubrir cadenas no latinas, pero no se detalla su cobertura final.
- Idiomas: no se documenta la lista de idiomas soportados; el modelo base es multilingue, pero el comportamiento en idiomas distintos de los presentes en el entrenamiento no esta caracterizado.
- Licencia: la licencia `gemma` impone las condiciones de uso de Google para modelos Gemma; es necesario revisarlas antes de un uso comercial.
- Cobertura ROR: el modelo solo puede devolver registros que existan en la version del catalogo ROR utilizada; organizaciones nuevas o no registradas no seran detectadas.
- Madurez: el modelo tiene 38 descargas y 0 likes en el momento de la consulta, y la ficha no incluye resultados de benchmarks ni metricas de evaluacion publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-set-model-embeddinggemma-300m
- Coleccion ROR set point matching: https://huggingface.co/collections/adambuttrick/ror-set-point-matching
- Dataset de entrenamiento: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Dataset con juicios del profesor: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test-openalex-jev-distill
- Retriever usado en produccion: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill
- Retriever base: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base
- Variante mmbert-base: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base
- Variante mmbert-base-mask: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Repositorio GitHub del proyecto: https://github.com/adambuttrick/ror-set-point-matching
