# cruciverb-it/crosswordspacepp-reranker

## Resumen

CrosswordSpace++ reranker es un cross-encoder BERT en italiano especializado en una tarea muy concreta: puntuar pares (definicion, respuesta) para crucigramas. Lo publica la organizacion cruciverb-it como segunda etapa del sistema CrosswordSpace++, cuyo objetivo es resolver pistas de crucigrama italianas seleccionando la respuesta correcta entre candidatos de longitud compatible. El modelo resuelve el problema del re-ranking: dado un conjunto de candidatos recuperados por un bi-encoder, asigna una puntuacion de compatibilidad a cada par.

Tecnicamente es un `CrossEncoder` de sentence-transformers construido sobre `nickprock/sentence-bert-base-italian-xxl-uncased`. Tiene 110.696.449 parametros, una longitud maxima de secuencia de 84 tokens y salida de una sola etiqueta con activacion sigmoide. Rerankea los 100 mejores candidatos filtrados por longitud que devuelve el bi-encoder `cruciverb-it/crosswordspacepp-dualencoder`, y la puntuacion final del sistema es una mezcla convexa de ambos modelos con alpha = 0,17, valor ajustado en validacion.

Es relevante porque esta vinculado a la tarea 1 de CruciverbIT en EVALITA 2026 y porque los resultados declarados muestran una mejora medible sobre el bi-encoder en solitario: la mezcla alcanza 68,2 de Acc@1 y 74,5 de MRR@10 en el conjunto de test de 20.821 pistas, frente a 57,9 y 65,8 del bi-encoder. El modelo es pequeno, ligero y desplegable en hardware de consumo, aunque su ambito de aplicacion es muy especifico y solo cubre italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder BERT (`BertForSequenceClassification`, 1 etiqueta de salida, activacion sigmoide) |
| Parametros totales | 110.696.449 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 84 tokens (longitud maxima de secuencia del par pista-respuesta) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | Italiano (it) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |
| Modelo base | nickprock/sentence-bert-base-italian-xxl-uncased |
| Libreria | sentence-transformers |
| Pipeline | text-ranking |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

Se trata de un cross-encoder basado en BERT: la pista y la respuesta candidata se concatenan en una unica secuencia de entrada (hasta 84 tokens) y el modelo produce una puntuacion escalar mediante una cabeza de clasificacion de una sola etiqueta con activacion sigmoide. A diferencia de un bi-encoder, que codifica pista y respuesta por separado, este modelo modela explicitamente la interaccion entre ambos textos, lo que explica su mayor coste computacional por par y su uso como segunda etapa de re-ranking.

Los datos de entrenamiento provienen del split de train de la tarea 1 de CruciverbIT (EVALITA 2026): 374.766 pistas, cada una emparejada con su respuesta correcta y 9 negativos minados a partir de los candidatos del bi-encoder (3 dificiles, 3 medios, 3 faciles), lo que da un total de 3.747.628 pares. Las respuestas correctas, sus sinonimos y las coincidencias de raiz se excluyen del conjunto de negativos. El objetivo de entrenamiento es entropia cruzada binaria con `pos_weight = 9`, learning rate 2e-5, tamano de lote 256, 10 epocas y precision bf16; se publica el mejor checkpoint segun MRR@10 de re-ranking en validacion. No se documenta uso de RLHF ni DPO, ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Puntuacion de pares (pista, respuesta) para crucigramas en italiano mediante un cross-encoder.
- Re-ranking de los 100 mejores candidatos filtrados por longitud generados por un bi-encoder.
- Combinacion con el bi-encoder: puntuacion final como mezcla convexa alpha * CE + (1 - alpha) * BE con alpha = 0,17.
- Metodos de conveniencia de sentence-transformers: `predict` para obtener puntuaciones y `rank` para ordenar candidatos.
- Funcionamiento con pistas que contienen referencias culturales e historicas italianas (por ejemplo, "Giorni di meta mese nell'antica Roma").
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue: el modelo esta etiquetado unicamente para italiano.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Resolucion automatica de crucigramas en italiano: el modelo actua como segunda etapa sobre los candidatos del bi-encoder y devuelve la respuesta mas probable para cada pista; con la mezcla alcanza 68,2 de Acc@1 sobre 20.821 pistas de test.
- Investigacion en recuperacion de informacion (IR): sirve como banco de pruebas controlado de re-ranking sobre pares cortos, con un protocolo claro de negativos minados por dificultad (3 dificiles, 3 medios, 3 faciles).
- Generacion de pistas para creadores de crucigramas: dado un conjunto de respuestas y pistas candidatas, el modelo ordena cuales encajan mejor con cada entrada.
- Evaluacion comparativa de arquitecturas bi-encoder frente a cross-encoder: el repositorio ofrece cifras del mismo sistema con y sin re-ranking (57,9 frente a 59,9 de Acc@1 en solitario), lo que permite medir la ganancia de la segunda etapa.
- Sistemas de ayuda a jugadores: dado un tablero parcial y una pista, el modelo puede puntuar respuestas candidatas de la longitud correcta y sugerir opciones al usuario.
- Filtrado de candidatos en pipelines de resolucion de restricciones: las puntuaciones del cross-encoder pueden alimentar un solver con restricciones de interseccion entre palabras.
- Experimentacion con mezclas de puntuaciones: el coeficiente alpha = 0,17 documentado permite reproducir el ajuste de pesos entre dos rankers sobre un conjunto de validacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test de la tarea 1 de CruciverbIT (EVALITA 2026), con 20.821 pistas. Todos los sistemas ordenan los 100 mejores candidatos filtrados por longitud del bi-encoder.

| Sistema | Acc@1 | Acc@10 | MRR@10 |
|---|---|---|---|
| Solo bi-encoder | 57,9 | 80,9 | 65,8 |
| Solo cross-encoder (este modelo) | 59,9 | 83,1 | 67,9 |
| Mezcla (alpha = 0,17) | 68,2 | 85,5 | 74,5 |

Los valores de la model card no estan marcados como verificados (`verified: false`) en el model-index. No hay en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 443 MB en FP32 y 221 MB en FP16/BF16, calculado a partir de los 110,7 millones de parametros; en INT8 serian unos 111 MB (no hay versiones cuantizadas publicadas oficialmente).
- VRAM adicional por activaciones: depende del tamano de lote; al puntuar 100 pares de hasta 84 tokens por pista, el consumo de activaciones es moderado y en la practica el modelo cabe con holgura en GPUs de 4 GB o mas.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3060, RTX 4090). La CPU tambien es viable dado el tamano del modelo.
- GPUs recomendadas: el modelo es lo bastante pequeno como para no requerir A100 ni H100; para lotes grandes o muchas pistas por segundo, cualquier GPU moderna de gama media o superior es suficiente.
- Opciones de despliegue: sentence-transformers (biblioteca de referencia), Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, ni pesos en formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay en la informacion proporcionada datos de otros rerankers genericos (por ejemplo, modelos multilingues de re-ranking) que permitan una comparacion directa. La unica comparacion posible es interna al propio sistema CrosswordSpace++, cuyos componentes aparecen en la model card:

| Sistema | Tipo | Parametros | Contexto | Acc@1 (test) | MRR@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| crosswordspacepp-dualencoder | Bi-encoder | no disponible | no disponible | 57,9 | 65,8 | no disponible | HuggingFace |
| crosswordspacepp-reranker | Cross-encoder | 110.696.449 | 84 tokens | 59,9 | 67,9 | CC BY 4.0 | HuggingFace |
| Mezcla de ambos (alpha = 0,17) | Hibrido | no aplica | 84 tokens | 68,2 | 74,5 | CC BY 4.0 (componente publicado) | Codigo en GitHub |

Comparativas con modelos de la misma categoria (rerankers de proposito general o multilingues) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo esta entrenado especificamente para re-ranking de pares pista-respuesta de crucigramas italianos; no se ha evaluado como reranker generico de documentos o pasajes.
- Idioma unico: solo italiano, segun la etiqueta `language: it`; no hay evidencia de transferencia a otras lenguas.
- Longitud maxima de secuencia de 84 tokens, suficiente para pistas y respuestas cortas, pero insuficiente para textos largos.
- El sistema completo depende de dos etapas: el cross-encoder solo mejora ligeramente al bi-encoder (59,9 frente a 57,9 de Acc@1); sin la mezcla y sin los candidatos del bi-encoder su utilidad practica es limitada.
- Los resultados de los benchmarks estan declarados por el autor y no verificados (`verified: false`); no se ha publicado una citacion BibTeX (aparece como `TBD`).
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse con datos de crucigramas italianos puede heredar sesgos culturales del corpus de pistas.
- Riesgo de alucinacion: al ser un modelo de puntuacion con salida escalar no genera texto libre, por lo que el riesgo de alucinacion se limita a puntuaciones altas asignadas a respuestas incorrectas.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion al autor y la indicacion de los cambios realizados.
- Adopcion muy baja en el momento de la ficha: 0 descargas y 2 "me gusta", lo que implica poca validacion independiente por parte de la comunidad.
- Las fechas de creacion y actualizacion del repositorio (17 de septiembre de 2026) son posteriores a la fecha habitual de publicacion de modelos, dato a tener en cuenta al planificar su uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cruciverb-it/crosswordspacepp-reranker
- Bi-encoder del mismo sistema: https://huggingface.co/cruciverb-it/crosswordspacepp-dualencoder
- Modelo base: https://huggingface.co/nickprock/sentence-bert-base-italian-xxl-uncased
- Dataset de evaluacion: https://huggingface.co/datasets/cruciverb-it/evalita2026
- Codigo del proyecto: https://github.com/snizio/crosswordspacepp
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con la ficha.
