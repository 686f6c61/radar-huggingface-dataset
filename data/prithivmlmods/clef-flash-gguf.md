# prithivMLmods/clef-flash-GGUF

## Resumen

Clef-Flash es un modelo multimodal de decisión de 9.075 millones de parámetros desarrollado por Cloudflare, post-entrenado a partir de Qwen3.5-9B. A diferencia de los modelos generativos convencionales, no produce texto libre: lee un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas (`noul`, `choice` o `score`) y devuelve una probabilidad para cada opción permitida en un único forward pass. Una cabeza de esquema conjunta sobre los estados ocultos finales del backbone enruta la evidencia hacia cada pregunta y puntúa todas las opciones de forma conjunta, eliminando la necesidad de parsing posterior.

La relevancia del modelo reside en su orientación a la toma de decisiones estructurada y verificable: clasificación, enrutamiento y puntuación con salida tipada, latencia muy baja (mediana de 38,8 ms según la model card) y API compatible con Jev y SystemOne. Se sirve mediante SGLang a través del endpoint `/v1/systemone`, y esta ficha corresponde a la cuantización GGUF publicada por prithivMLmods, que habilita su ejecución con llama.cpp.

El repositorio GGUF (60,3 GB) incluye pesos desde BF16 hasta Q3_K_M, además de un fichero de proyección multimodal (`mmproj-bf16.gguf`) necesario para el procesamiento de imágenes y vídeo. La licencia es Apache 2.0 y el modelo está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (post-entrenado desde Qwen3.5-9B) con cabeza de esquema conjunta para salida tipada |
| Parametros totales | 9.075.566.084 (~9,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyección multimodal mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Clef-Flash parte del backbone de Qwen3.5-9B y se post-entrena como modelo de decisión. Sobre los estados ocultos finales del backbone se añade una cabeza de esquema conjunta que, dada una definición de preguntas tipadas (`noul` para sí/no, `choice` para selección entre criterios, `score` para puntuación ordinal), enruta la evidencia relevante a cada pregunta y puntúa simultáneamente todas las opciones permitidas. El modelo no genera texto libre ni requiere parsing de la salida: devuelve directamente probabilidades por opción en un único forward pass. El pipeline declarado es `image-text-to-text`, lo que confirma la integración de entrada multimodal (imágenes y vídeo) mediante un proyector multimodal separado.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el post-entrenamiento. La model card menciona únicamente que se trata de un post-train de Qwen3.5-9B y que existe un hermano mayor denominado Clef. La innovación técnica destacable es la salida estructurada tipada con puntuación conjunta de opciones y la compatibilidad con el endpoint `/v1/systemone` de llama.cpp y SGLang.

## Capacidades

- Salida estructurada tipada: probabilidad por opción para preguntas de tipo `noul`, `choice` y `score`, sin generación libre ni parsing.
- Procesamiento multimodal de entrada: texto, JSON, imágenes y vídeo (requiere el fichero `mmproj`).
- Modelo de decisión orientado a clasificación, enrutamiento y puntuación de evidencia.
- Soporte de tool calling y function calling (evaluado en BFCL y API-Bank).
- Capacidades de razonamiento y conocimiento general (MMLU, WinoGrande, CLadder).
- Capacidades de razonamiento de contratos y NLI (ContractNLI).
- Compatibilidad con la API de Jev y SystemOne; servible con SGLang vía `/v1/systemone`.
- Capacidad de predicción y forecasting (ForecastBench).
- Capacidad limitada en tareas de razonamiento matemático y recuperación (ver benchmarks).
- Multilingüe: no disponible; solo inglés declarado.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como `state` y un esquema `choice` con criterios (facturación, envío, técnico), devolviendo la probabilidad por equipo en un solo forward pass. Adecuado por su latencia mediana de 38,8 ms y su rendimiento en el simulador de electrodomésticos (97,7).
- Clasificación de intención en atención al cliente: con preguntas `noul` (por ejemplo, "¿está enfadado el cliente?") y `score` de urgencia, se obtiene una salida tipada directamente consumible por el sistema de ticketing, sin parsing.
- Procesamiento de facturas: esquema `choice` para la acción primaria (aprobar, rechazar, escalar) sobre el estado del documento; la model card reporta 73,3 en la evaluación de acción primaria de facturación.
- Verificación de cumplimiento contractual: uso de ContractNLI (84,3 reportado) para determinar si una cláusula implica una condición, con salida probabilística auditable.
- Moderación y triaje de contenido multimodal: al aceptar imágenes y vídeo, puede clasificar contenido con preguntas tipadas en pipelines de revisión.
- Automatización de flujos de agentes con tool calling: integración en pipelines que requieren decidir qué función invocar (BFCL 98,8, API-Bank 93,1) con salida estructurada compatible con el endpoint `/v1/systemone`.
- Predicción de eventos y forecasting: uso en tareas de estimación probabilística (ForecastBench, Brier 10,6), adecuado para sistemas de alerta temprana.
- Despliegue en local con llama.cpp: gracias a las cuantizaciones Q4_K_M (5,72 GB) y Q5_K_M (6,56 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo para tareas de clasificación de alto volumen.

## Benchmarks y rendimiento

Resultados publicados en la model card (Decision Index 0.2.1, ejecuciones internas de Cloudflare):

| Benchmark | Clef-Flash | Referencia (Jev) |
|---|---|---|
| BFCL | 98,8 | no disponible |
| API-Bank | 93,1 | no disponible |
| Simulador de electrodomésticos | 97,7 | 52,3 |
| ContractNLI | 84,3 | no disponible |
| MMLU | 91,8 | no disponible |
| WinoGrande | 97,5 | no disponible |
| CLadder | 97,7 | no disponible |
| ForecastBench (Brier, menor es mejor) | 10,6 | no disponible |
| GPQA Diamond | 51,0 | 78,3 |
| MMLU-Pro | 65,3 | 82,7 |
| BBH | 68,9 | 92,9 |
| GSM8K | 67,3 | no disponible |
| CLINC150+OOS | 66,8 | no disponible |
| RAGTruth | 35,6 | no disponible |
| POP909-CL | 1,6 | no disponible |
| Latencia mediana | 38,8 ms | 524,1 ms |

En los cuatro evals de flujos Typesafe el resultado es mixto frente a Jev: por delante en acciones exactas de atención al cliente (77,0 frente a 76,0) y por detrás en acción primaria de procesamiento de facturas (73,3 frente a 83,1). El modelo es débil en tareas intensivas en conocimiento y recuperación (GPQA Diamond, MMLU-Pro, BBH, HoVer, When2Call).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,4-5,7 GB para Q4_K_S/Q4_K_M; 6,4-6,6 GB para Q5_K_S/Q5_K_M; 7,5 GB para Q6_K; 18,2 GB para BF16. Añadir ~922 MB si se carga el proyector multimodal `mmproj-bf16.gguf`.
- GPU recomendadas: RTX 4090, RTX 3090, A100 y H100 para BF16; GPUs de consumo con 8 GB o más para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: sí, con Q4_K_M (5,72 GB) o Q5_K_M (6,56 GB) en tarjetas de 8 GB o superiores; Q3_K_M (4,66 GB) para equipos con menos VRAM.
- Opciones de despliegue: llama.cpp (`llama-server` con endpoint `/v1/systemone`), SGLang (`/v1/systemone`), y por las etiquetas del repo, text-generation-inference y llama-cpp.
- Latencia y throughput: latencia mediana reportada de 38,8 ms (frente a 524,1 ms de Jev); throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef-Flash | ~9,1 B | no disponible | Decisión multimodal con salida tipada | Apache 2.0 | GGUF en HF, SGLang, llama.cpp |
| Jev | no disponible | no disponible | Modelo de decisión comparable | no disponible | no disponible |
| Clef (hermano mayor) | no disponible | no disponible | Decisión multimodal | no disponible | no disponible |
| Qwen3.5-9B (base) | ~9 B | no disponible | Generación de texto | no disponible | no disponible |

Frente a Jev, Clef-Flash es claramente superior en latencia (38,8 ms frente a 524,1 ms), en el simulador de electrodomésticos (97,7 frente a 52,3) y en BFCL/API-Bank, pero inferior en GPQA Diamond (51,0 frente a 78,3), MMLU-Pro (65,3 frente a 82,7) y BBH (68,9 frente a 92,9). Frente a su hermano mayor Clef, la model card indica que Clef-Flash queda por detrás en tareas intensivas en conocimiento y recuperación.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre; su uso está restringido a esquemas de preguntas tipadas.
- Rendimiento débil en conocimiento avanzado y recuperación: GPQA Diamond 51,0, MMLU-Pro 65,3, BBH 68,9, RAGTruth 35,6 y POP909-CL 1,6.
- Razonamiento matemático limitado: GSM8K 67,3.
- Clasificación de intención fuera de dominio mejorable: CLINC150+OOS 66,8.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Los benchmarks proceden de ejecuciones internas de Cloudflare y no de evaluaciones independientes; deben interpretarse con cautela.
- Riesgo de alucinación: aunque la salida es probabilística y tipada, las probabilidades pueden estar mal calibradas en dominios fuera de la distribución de entrenamiento.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datos de post-entrenamiento.
- El fichero `mmproj-bf16.gguf` es necesario para entrada de imagen o vídeo; sin él, el modelo solo procesa texto y JSON.
- Longitud de contexto no documentada: planificar los prompts de estado en consecuencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/clef-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Fichero BF16: https://huggingface.co/prithivMLmods/clef-flash-GGUF/blob/main/clef-flash.BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/clef-flash-GGUF/blob/main/clef-flash.Q4_K_M.gguf
- Fichero Q5_K_M: https://huggingface.co/prithivMLmods/clef-flash-GGUF/blob/main/clef-flash.Q5_K_M.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/clef-flash-GGUF/blob/main/clef-flash.mmproj-bf16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- SGLang: https://github.com/sgl-project/sglang
