# prithivMLmods/clef-flash-GGUF

## Resumen

clef-flash-GGUF es la version cuantizada en formato GGUF de Cloudflare/clef-flash, un modelo multimodal de decision de aproximadamente 9B parametros (8.953.803.264 parametros reales en safetensors) desarrollado por Cloudflare y post-entrenado a partir de Qwen/Qwen3.5-9B bajo licencia Apache-2.0. El repositorio lo publica el usuario prithivMLmods y contiene exclusivamente pesos GGUF listos para su uso con llama.cpp y otros runtimes compatibles, con un peso total de repositorio de 87,6 GB repartido entre las distintas cuantizaciones y los ficheros de proyeccion multimodal.

La particularidad del modelo es su planteamiento: en lugar de generar texto libre, recibe un estado (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas (`noul` verdadero/falso, `choice` o `score`) y, en una sola pasada forward, emite un logit para cada opcion permitida de cada pregunta mediante una cabeza de esquema conjunta situada sobre los estados ocultos finales del backbone. Un softmax por pregunta devuelve directamente probabilidades, de modo que no es necesario parsear la salida. Es compatible con la API de Jev/SystemOne (helper `systemone`) y admite lotes mixtos de texto y multimodal.

Su relevancia practica esta en la latencia y en el enfoque de salida estructurada: en la suite Decision Index 0.2.1 iguala o lidera varios benchmarks de decision y tool calling, y registra una latencia mediana de 38,8 ms frente a los 209,3 ms de su hermano mayor Clef. La contrapartida es que queda por detras en tareas de clasificacion de intenciones, deteccion de alucinaciones en RAG, matematicas y razonamiento avanzado, por lo que encaja mejor como capa de decision rapida que como generador de texto generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone derivado de Qwen/Qwen3.5-9B y cabeza de esquema conjunta (joint schema head) sobre los estados ocultos finales |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; mas ficheros de proyeccion multimodal mmproj en bf16, f16 y q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio); el modelo base Cloudflare/clef-flash se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9B parametros, y anade una cabeza de esquema conjunta que opera sobre los estados ocultos finales del backbone. En lugar de decodificar tokens de texto, el modelo evalua simultaneamente todas las opciones de todas las preguntas del esquema recibido y produce un logit por opcion; un softmax por pregunta convierte esos logits en probabilidades normalizadas. Los tipos de pregunta soportados son `noul` (verdadero/falso), `choice` (eleccion entre opciones) y `score` (puntuacion). Este diseno elimina la necesidad de parsear la salida y garantiza que la respuesta respete siempre el conjunto de opciones validas.

El modelo esta descrito como post-entrenado (post-train) sobre la base Qwen3.5, con soporte multimodal para texto, JSON, imagenes y video, y capacidad de procesar lotes mixtos de texto y modalidades visuales. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco se especifica el mecanismo concreto de fusion de las entradas visuales mas alla de la existencia de los ficheros de proyeccion multimodal (mmproj) en el paquete GGUF.

## Capacidades

- Clasificacion y decision estructurada: responde esquemas de preguntas tipadas (`noul`, `choice`, `score`) devolviendo probabilidades por opcion en una sola pasada, sin parsing posterior.
- Entrada multimodal: acepta texto, JSON, imagenes y video, con soporte de lotes mixtos texto-multimodal.
- Salida tipada para integracion: el formato de salida es directamente consumible por sistemas de decision, enrutado o validacion automatica.
- Tool calling y funciones: los benchmarks de la suite Decision Index incluyen BFCL y API-Bank, en los que el modelo lidera o empata segun la informacion del autor.
- Integracion con API Jev/SystemOne: compatible con el helper `systemone`.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- No se menciona soporte de modo pensamiento (thinking), audio ni generacion de texto libre como capacidad principal.

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: el modelo recibe el mensaje del usuario junto con un esquema `choice` de intenciones y devuelve la probabilidad de cada una, lo que permite enrutar la conversacion sin parsear texto; es su escenario mejor valorado segun las evals de workflow.
- Moderacion y validacion de contenido: mediante preguntas `noul` (verdadero/falso) se puede evaluar si un contenido cumple politicas, con salida binaria directa por logit.
- Puntuacion y ranking de candidatos: el tipo `score` permite asignar puntuaciones normalizadas a respuestas, documentos o resultados de busqueda en una sola inferencia.
- Tool calling y orquestacion de agentes: dado su rendimiento en BFCL y API-Bank, puede actuar como capa de decision que elige que herramienta invocar entre un conjunto de opciones predefinidas.
- Extraccion estructurada de documentos: con entrada de imagen o JSON, clasifica campos y respuestas de formularios; las evals lo situan ligeramente por detras de Clef en procesamiento de facturas.
- Deteccion de alucinaciones en pipelines RAG: mediante preguntas tipo `noul` sobre si la respuesta esta respaldada por el contexto; el autor reporta que queda por detras en RAGTruth, por lo que conviene validarlo en este uso.
- Enrutado de bajo coste en sistemas multi-modelo: gracias a su latencia mediana de 38,8 ms, puede decidir si una consulta se resuelve con el propio modelo o se delega a uno mayor.
- Despliegue local con vision: los ficheros mmproj permiten ejecutar tareas de decision sobre imagenes en entornos con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible; la model card describe la posicion relativa del modelo en la suite Decision Index 0.2.1 sin cifras concretas.

| Benchmark | Resultado declarado |
|---|---|
| BFCL | lidera o empata |
| API-Bank | lidera o empata |
| ARC | lidera o empata |
| WinoGrande | lidera o empata |
| HellaSwag | lidera o empata |
| MuSR | lidera o empata |
| CLadder | lidera o empata |
| ForecastBench | lidera o empata |
| CLINC150 | por detras de los comparados |
| RAGTruth | por detras de los comparados |
| GSM8K | por detras de los comparados |
| POP909-CL | por detras de los comparados |
| GPQA Diamond | por detras de los comparados |
| MMLU-Pro | por detras de los comparados |

| Metrica de latencia | Valor |
|---|---|
| Latencia mediana de clef-flash | 38,8 ms |
| Latencia mediana de Clef | 209,3 ms |
| Evals de workflow | en linea con Clef y Jev; mejor en atencion al cliente y ligeramente peor en procesamiento de facturas |

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de los tamanos de fichero publicados, sin overhead de contexto):
  - BF16 / F16: 17,9 GB.
  - Q8_0: 9,53 GB.
  - Q6_K: 7,36 GB.
  - Q5_K_M: 6,47 GB; Q5_K_S: 6,31 GB.
  - Q4_K_M: 5,63 GB; Q4_K_S: 5,35 GB.
  - Q3_K_L: 4,93 GB; Q3_K_M: 4,62 GB.
- Vision: anadir el fichero mmproj correspondiente (922 MB en bf16/f16, 624 MB en q8_0).
- GPU recomendadas: no especificadas por el autor. Por tamano, la cuantizacion Q4_K_M (5,63 GB) es viable en GPU de consumo con 8 GB o mas de VRAM, y Q8_0 (9,53 GB) requiere aproximadamente 12 GB. Los pesos BF16/F16 (17,9 GB) exigen GPUs de 24 GB o superiores tipo RTX 4090, A100 o H100.
- Cabe en GPU de consumo: previsiblemente si en cuantizaciones Q4 y Q5 en tarjetas de 8-12 GB; la informacion disponible no incluye pruebas oficiales.
- Opciones de despliegue: llama.cpp (referenciado explicitamente en la model card y en los tags), ademas de etiquetas para text-generation-inference y transformers.
- Latencia y throughput: la unica cifra publicada es la latencia mediana de 38,8 ms en la suite Decision Index 0.2.1, frente a 209,3 ms del modelo Clef. No se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-flash (este) | aprox. 9B | no disponible | Lidera o empata en BFCL, API-Bank, ARC, WinoGrande, HellaSwag, MuSR, CLadder y ForecastBench; latencia mediana de 38,8 ms | apache-2.0 | GGUF en este repositorio; base en safetensors |
| Clef | no disponible | no disponible | Lidera en varios benchmarks segun la model card; latencia mediana de 209,3 ms | no disponible | no disponible |
| Jev | no disponible | no disponible | En linea con clef-flash en evals de workflow | no disponible | API SystemOne |
| Qwen3.5-9B | aprox. 9B (base del post-entrenamiento) | no disponible | No comparable directamente: es un modelo generativo, no de decision estructurada | apache-2.0 | HuggingFace |

La informacion disponible no permite completar una comparativa cuantitativa con alternativas de la misma categoria; los datos de Clef, Jev y Qwen3.5-9B no estan detallados en el material proporcionado.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles (en); no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide dimensionar casos de uso con documentos largos.
- Rendimiento desigual: el autor reconoce que el modelo queda por detras en CLINC150, RAGTruth, GSM8K, POP909-CL, GPQA Diamond y MMLU-Pro, por lo que no es adecuado para razonamiento matematico avanzado, deteccion de alucinaciones en RAG ni clasificacion fina de intenciones sin validacion previa.
- Salida no generativa: al producir logits por opcion y no texto libre, requiere definir un esquema de preguntas tipadas; no sirve como chatbot generativo convencional.
- Vision: para tareas multimodales hay que cargar ademas el fichero mmproj; sin el, la entrada de imagen y video no estara operativa.
- Riesgo de alusion: no se han publicado tasas de alucinacion ni evaluaciones de calibracion de las probabilidades emitidas.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Cloudflare/clef-flash y de Qwen/Qwen3.5-9B, ya que la ficha del GGUF no detalla restricciones adicionales.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, con fecha de creacion 2026-10-01, por lo que se trata de una publicacion muy reciente y poco validada por la comunidad.
- Precision de las cuantizaciones bajas: Q3_K_S/M y Q4_K_S pueden degradar la calidad de las probabilidades de decision; el autor recomienda Q4_K_M o superiores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/clef-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Modelo del que deriva el post-entrenamiento: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp (runtime referenciado en la model card): https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
- Sitio del autor: https://prithivsakthiur.github.io/prithivmlmods/
- Repositorio relacionado del autor (Q3.5-9B-DS-v4-Flash-v2.0-GGUF): https://huggingface.co/prithivMLmods/Q3.5-9B-DS-v4-Flash-v2.0-GGUF
- Indice de modelos GGUF del autor: https://graysoft.dev/authors/p/prithivmlmods.html
- Directorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
