# Nurymanau/pplx-embed-v2-late-0.6b-MLX-fp16

## Resumen

Este repositorio contiene una conversión a MLX en FP16 del modelo de embeddings `perplexity-ai/pplx-embed-v2-late-0.6b`, publicado por el usuario independiente Nurymanau. No es un modelo nuevo ni un fine-tuning: es un port del checkpoint original (revisión `8fc2de24534aa3610d85fa59c463313a5f096455`) a un runtime nativo de MLX para Apple Silicon, sin Torch ni Transformers en el camino de inferencia. El resultado es un extractor de características de tipo late interaction (estilo ColBERT) con recuperación MaxSim, pensado para búsqueda semántica y ranking de documentos.

El modelo resuelve el problema de la recuperación de información densa con interacción tardía: en lugar de comprimir cada documento en un único vector, genera embeddings por token y calcula la similitud mediante MaxSim, lo que mejora el rendimiento en tareas de retrieval frente a los embeddings de vector único. Con unos 0,6 mil millones de parámetros y un fichero de pesos de 1.189.337.799 bytes en FP16, está pensado para ejecutarse en equipos de consumo con chip de Apple. La ventana operativa es de 1.024 tokens para consultas y 4.096 tokens para documentos.

Su relevancia es doble: por un lado, acerca un modelo de retrieval de Perplexity al ecosistema MLX, que hasta ahora dependía mayoritariamente de ports de Sentence Transformers; por otro, forma parte de una familia de experimentos del mismo autor (adaptadores, fine-tuning completo y un estudiante de seis capas) con resultados medidos públicamente. Conviene subir la alerta: se trata de trabajo no oficial, sin afiliación ni respaldo de Perplexity, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings con late interaction (MaxSim, estilo ColBERT); etiqueta del repositorio `qwen3_5` heredada del modelo base |
| Parametros totales | ~0,6 mil millones (0.6B); fichero de pesos de 1.189.337.799 bytes en FP16 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | consultas de hasta 1.024 tokens; documentos de hasta 4.096 tokens; las entradas que superan el limite se rechazan |
| Tipos de cuantizacion | este repositorio distribuye unicamente FP16 MLX; no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | pesos: MIT; runtime: Apache-2.0 (con avisos de terceros en `licenses/`) |
| Formato de pesos | safetensors en formato MLX nativo (no GGUF, no safetensors de Transformers estandar) |

## Arquitectura y entrenamiento

El modelo base es un encoder de embeddings con interacción tardía. En lugar de producir un vector por documento, genera representaciones por token y calcula la puntuación con MaxSim, la función de similitud característica de ColBERT. El repositorio etiqueta la arquitectura como `qwen3_5`, lo que sugiere una inicialización derivada de la familia Qwen3.5, aunque la model card no documenta la topología interna, el número de capas ni las dimensiones de los embeddings. El pipeline declarado en HuggingFace es `feature-extraction`.

No hubo entrenamiento nuevo en este repositorio. La model card indica explícitamente que el port reproduce bytes idénticos publicados previamente en `Nurymanau/pplx-embed-v2-late-0.6b-MLX` (revisión `5cb121dd72cbb394205a11414dc1305597a6c054`), con un `PROVENANCE.json` que mapea cada fichero copiado y su SHA256, y un `SHA256SUMS.json` que cubre todo el payload salvo él mismo. No se documenta el número de tokens de preentrenamiento, la composición del dataset ni si hubo RLHF o DPO; la contaminación del preentrenamiento upstream se declara desconocida.

Las variantes entrenadas de la familia (no este repositorio) usan datos de BANKING77 (PolyAI, CC BY 4.0, Casanueva et al. 2020) con 1.232 consultas y 154 ejemplares para entrenamiento, y 308 consultas y 154 documentos para desarrollo, con dos semillas, dos tasas de aprendizaje y tres épocas por brazo, seleccionando solo con el conjunto de desarrollo. La innovación técnica destacable de la familia es la destilación a un estudiante de seis capas: un 24,2 % menos de parámetros de texto y un fichero un 37,1 % menor, a cambio de perder el soporte de imagen.

## Capacidades

- Generación de embeddings de texto para recuperación semántica y ranking, con puntuación MaxSim por token.
- Indexado y búsqueda sobre documentos de hasta 4.096 tokens y consultas de hasta 1.024 tokens.
- Soporte de documentos de imagen con alcance acotado: la model card lo describe como prueba de cordura, no como benchmark real de documentos.
- Extracción de características para pipelines de retrieval (pipeline `feature-extraction`).
- Ejecución nativa en Apple Silicon vía MLX, sin dependencias de Torch ni Transformers.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión generativa: es un modelo exclusivamente de embeddings.
- No soporta tool calling ni function calling.
- No está diseñado para flujos de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- La variante estudiante de la familia no tiene soporte de imagen; este repositorio (base original) sí declara cobertura de imagen, pero limitada.

## Casos de uso

- Busqueda semantica en documentacion tecnica: el modelo indexa cada fragmento de documentacion (hasta 4.096 tokens) y recupera los pasajes relevantes para una consulta de ingeniero, con la ventaja de que MaxSim preserva coincidencias a nivel de token que un embedding de vector unico diluiria.
- RAG sobre corpus internos en portatiles Apple Silicon: al ocupar 1,2 GB en disco y ejecutarse con MLX, permite montar un indice de recuperacion completamente local, sin enviar documentos confidenciales a servicios externos.
- Clasificacion y enrutado de intenciones: la familia fue evaluada con ejemplares de intencion de BANKING77; este checkpoint concreto es la base sin adaptador, por lo que sirve como punto de partida, no como clasificador afinado. Se usaria comparando la consulta del usuario contra un conjunto de ejemplares por intencion y enrutando al flujo correspondiente.
- Deduplicacion y agrupacion de documentos: los embeddings por token permiten calcular similitud fina entre pares de documentos largos para detectar duplicados casi identicos o agrupar tematicamente un repositorio documental.
- Recuperacion multimodal ligera: para bases donde convive texto e imagenes acotadas (capturas, diagramas simples), el modelo puede indexar ambos tipos, siempre que se asuma que la cobertura de imagen es experimental y no esta validada con benchmarks reales.
- Reranking de resultados de un buscador existente: se puede usar como segunda etapa sobre los candidatos devueltos por un indice lexico (BM25, Elasticsearch) para reordenar por relevancia semantica antes de pasarlos al generador.
- Construccion de indices de preguntas frecuentes: indexar pares pregunta-respuesta de un centro de ayuda y recuperar las entradas mas cercanas a la consulta del usuario, con umbral de similitud para derivar a atencion humana.
- Evaluacion comparativa de estrategias de retrieval: al ser un port fiel del checkpoint original, sirve como linea base reproducible para medir si un fine-tuning o un adaptador aporta mejoras reales sobre el mismo runtime.

## Benchmarks y rendimiento

Los resultados disponibles provienen de un test propio de recuperacion por ejemplares de intencion sobre BANKING (770 consultas, 154 documentos, 77 intenciones), NO del benchmark oficial de clasificacion BANKING77 ni de exactitud de respuesta. Este repositorio corresponde a la fila "Original base".

| Variante | nDCG@10 | Hit@1 | Recall@10 |
|---|---:|---:|---:|
| Original base (este repositorio) | 74,05 % | 70,91 % | 84,87 % |
| Base + adaptador pequeno | 77,74 % | 74,55 % | 87,86 % |
| Fine-tuning completo de texto | 89,49 % | 87,01 % | 95,26 % |
| Estudiante de seis capas | 81,79 % | 78,83 % | 91,30 % |

Comparacion completo frente a adaptado (profesor): +11,75 puntos porcentuales de nDCG, con intervalo de confianza bootstrap del 95 % sobre 77 intenciones de [+9,20; +14,53]. Estudiante: +4,05 puntos, IC [+1,53; +6,67]. La model card advierte que estas cifras miden recetas completas y que no hay un control emparejado de solo-cabeza que aísle la contribucion de las capas internas.

Verificacion cruzada de dominio en NanoSciFact (FP32 sobre CUDA, 40 consultas y 2.919 documentos): profesor adaptado 85,81 %, completo 84,62 %, estudiante 66,05 % de nDCG@10. En la variante completa, Hit@1 cae del 80 % al 75 % mientras Recall@10 se mantiene en el 92,5 %. No se ejecuto la prueba NanoSciFact completa con MLX nativo para los modelos recien entrenados. La propia model card concluye que el estudiante no es un reemplazo generico.

Latencia declarada (fixture pequeno de ocho entradas fijas de desarrollo, en un Mac M3 con 16 GB, dos calentamientos y siete pasadas medidas): mediana en caliente de 26,16 ms para el estudiante frente a 48,04 ms para el profesor, aproximadamente 1,84 veces mas rapido. La model card insiste en que es un fixture de latencia, no un throughput de aplicacion. El coste estimado de alquiler de GPU para entrenamiento, evaluacion y rescate fue de 0,925 dolares, excluyendo almacenamiento y R2, y no constituye una factura.

## Requisitos de hardware

- VRAM estimada: en torno a 1,2-1,5 GB para los pesos FP16 (fichero de pesos de 1,19 GB) mas el espacio de activaciones, que depende de la longitud de entrada; no hay cifra oficial publicada.
- Hardware probado: Mac con chip M3 y 16 GB de memoria unificada, Python 3.12 y MLX 0.32.3.
- Compatibilidad: MLX requiere Apple Silicon (familia M). No se ha declarado soporte para GPU NVIDIA, AMD ni CPU x86.
- No cabe plantearlo como modelo de GPU de datacenter en este formato: el runtime es MLX y el repositorio no distribuye pesos GGUF ni safetensors compatibles con Transformers, por lo que no es cargable directamente en vLLM, TGI, llama.cpp ni Ollama.
- Despliegue: CLI propio del proyecto (`python -m pplx_mlx.cli`), invocando indexacion y busqueda sobre el directorio del modelo descargado completo, incluida la carpeta `code/`.
- Rendimiento de memoria: la model card recomienda evitar trabajos de modelo en paralelo en Macs con poca memoria y procesar una entrada sin padding por llamada.
- Latencia: mediana en caliente de 48,04 ms para el profesor y 26,16 ms para el estudiante de seis capas en el fixture de ocho entradas sobre M3; no hay medicion publicada especifica de throughput para este checkpoint base.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificados de modelos alternativos (parametros, contexto, metricas o licencia), por lo que las celdas comparativas quedan como no disponibles. La comparacion se plantea a nivel de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| pplx-embed-v2-late-0.6b (MLX fp16) | ~0,6B | 1.024 consulta / 4.096 documento | MIT (pesos), Apache-2.0 (runtime) | Repositorio HuggingFace, solo Apple Silicon | nDCG@10 74,05 % en su test propio de intenciones |
| Otros modelos de late interaction (familia ColBERT y derivados) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de embeddings de vector unico (familia BGE, E5 y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Variantes afinadas de esta misma familia (BANKING completo y estudiante de seis capas) | ~0,6B y ~0,46B de texto respectivamente segun la reduccion del 24,2 % | mismos limites | MIT | Repositorios HuggingFace del mismo autor, solo MLX | 89,49 % y 81,79 % de nDCG@10 en el mismo test |

Frente a los embeddings de vector unico, la ventaja teorica del late interaction es la preservacion de coincidencias a nivel de token, a costa de un indice mas grande (un vector por token en lugar de uno por documento). Frente a las variantes afinadas de su propia familia, este checkpoint es la linea base: cualquier mejora de dominio observada en los otros repositorios se consigue a costa de entrenamiento adicional y, en el caso del estudiante, de renunciar a la cobertura de imagen.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas, solo representaciones vectoriales. Cualquier expectativa de chat o razonamiento es erronea.
- Port no oficial: la model card declara explicitamente que no existe afiliacion ni respaldo de Perplexity. La trazabilidad se apoya en `PROVENANCE.json` y `SHA256SUMS.json`, no en una publicacion oficial.
- Runtime propietario: es un runtime MLX a medida, no un checkpoint sustituible en `mlx_lm` ni en Sentence Transformers. La integracion exige usar el codigo del repositorio.
- Dependencia de plataforma: MLX implica Apple Silicon. No hay soporte declarado para CUDA, ROCm ni CPU.
- Limites duros de entrada: consulta de 1.024 tokens y documento de 4.096 tokens; las entradas mayores se rechazan, no se truncan automaticamente. Un documento largo debe fragmentarse antes de indexar.
- Restriccion de ejecucion: una entrada sin padding por llamada y advertencia de no lanzar trabajos de modelo en paralelo en Macs con poca memoria.
- Cobertura de imagen acotada: descrita como prueba de cordura, no como benchmark de documentos reales. No debe usarse como capacidad multimodal de produccion sin validacion propia.
- Idiomas: no documentados. No hay garantia de rendimiento fuera de los idiomas presentes en el preentrenamiento upstream.
- Contaminacion del preentrenamiento upstream: declarada como desconocida, lo que impide descartar solapamiento con los conjuntos de evaluacion.
- Metricas no estandar: los numeros publicados provienen de un test propio de recuperacion por ejemplares (770 consultas, 154 documentos, 77 intenciones) y no del benchmark oficial BANKING77 ni de exactitud de respuesta, por lo que no son comparables con cifras publicadas de terceros.
- Rendimiento cruzado desigual: en NanoSciFact, el estudiante de seis capas cae a 66,05 % de nDCG@10 frente al 84,62 % de la variante completa, y Hit@1 baja del 80 % al 75 %. La propia model card avisa de que el estudiante no es un reemplazo generico.
- Licencias escalonadas: los pesos siguen la declaracion MIT del upstream; el runtime es Apache-2.0 con avisos de terceros. Los datos de entrenamiento BANKING77 son CC BY 4.0 (PolyAI, Casanueva et al. 2020) y no se redistribuyen crudos. Verificar `WEIGHTS_LICENSE.txt`, `LICENSE` y `DATA_LICENSE.txt` antes de un uso comercial.
- Validacion comunitaria practicamente nula: 0 descargas y 0 likes en el momento de redactar la ficha; conviene tratar los resultados como no replicados de forma independiente.
- Los resultados de latencia proceden de un fixture de ocho entradas fijas en un M3 con 16 GB y no deben extrapolarse a throughput de aplicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-MLX-fp16
- Modelo base original: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Repositorio multi-variante del mismo autor: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-MLX
- Variante con fine-tuning completo BANKING en MLX: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-BANKING-MLX
- Variante estudiante de seis capas en MLX: https://huggingface.co/Nurymanau/pplx-embed-v2-late-BANKING-Student6-MLX
- Codigo fuente del runtime MLX: https://github.com/Obscyra-app/pplx-embed-mlx
- Articulo del experimento: https://github.com/Obscyra-app/pplx-embed-mlx/blob/main/docs/experiment.md
- Coleccion Apple Silicon MLX: https://huggingface.co/collections/Nurymanau/apple-silicon-mlx-ports-and-experiments-6ac9709d0628f31e0993a8f7
- Paper de BANKING77 (Casanueva et al. 2020): https://arxiv.org/abs/2003.04807
