# prithivMLmods/clef-GGUF

## Resumen

Clef es un modelo multimodal de decisión de 27B parámetros desarrollado por Cloudflare, obtenido mediante post-entrenamiento a partir de Qwen/Qwen3.8-27B (licencia Apache-2.0). A diferencia de un LLM generativo convencional, Clef no produce texto libre: recibe un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas (`noul` para verdadero/falso, `choice` para opciones nominales y `score` para opciones ordenadas) y, en un único forward pass, devuelve una probabilidad para cada opción permitida de cada pregunta. Esto elimina la necesidad de parsear la salida y reduce la latencia y los errores de formato en pipelines de clasificación y enrutamiento.

La arquitectura se apoya en un backbone transformer multimodal sobre el que se añade una cabeza de esquema conjunta (*joint schema head*) que opera sobre los estados ocultos finales, enruta la evidencia del estado hacia cada pregunta y puntúa todas las opciones de forma conjunta. El modelo expone una API compatible con Jev/SystemOne (`/v1/systemone`), servible mediante el `joint_schema_model.py` incluido o con SGLang (por ejemplo, en una única H200). Según la model card, lidera o se sitúa cerca de la cabeza en varios benchmarks del suite Decision Index 0.2.1 (BANKING77, CLINC150+OOS, BPoMP, GSM8K, CRUXEval, RAGTruth), aunque queda por detrás de Jev en razonamiento duro (GPQA Diamond, MMLU-Pro, BBH).

Esta ficha corresponde a la versión cuantizada en GGUF publicada por prithivMLmods, que permite ejecutar el modelo con llama.cpp y su endpoint `v1/systemone`. Los ficheros van desde BF16 (54,1 GB) hasta Q3_K_L (14,4 GB), más un proyector multimodal `mmproj-bf16` de 931 MB para las entradas de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabeza de esquema conjunta (*joint schema head*) sobre los estados ocultos finales; post-entrenado desde Qwen/Qwen3.8-27B |
| Parámetros totales | 27.024.054.788 (≈27B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q4_K_M, Q5_K_M, Q6_K; proyector multimodal mmproj-bf16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base Cloudflare/clef) |

## Arquitectura y entrenamiento

Clef parte del backbone de Qwen/Qwen3.8-27B y se post-entrena como modelo de decisión. Sobre los estados ocultos finales del backbone se sitúa una cabeza de esquema conjunta que enruta la evidencia procedente del estado (texto, JSON, imágenes o vídeo) hacia cada pregunta del esquema y puntúa conjuntamente todas las opciones permitidas. El resultado es una distribución de probabilidad por pregunta, sin generación de texto libre ni parsing posterior. El modelo incorpora un proyector multimodal (`mmproj-bf16`, 931 MB) que habilita la entrada de imágenes y vídeo junto al texto.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el post-entrenamiento. La model card menciona únicamente el proceso de post-entrenamiento desde el modelo base y la existencia de la cabeza de esquema conjunta como innovación técnica principal, junto con la API `/v1/systemone` compatible con Jev/SystemOne.

## Capacidades

- Clasificación y decisión estructurada: devuelve probabilidades para cada opción de preguntas de tipo `choice`, `noul` (verdadero/falso) y `score` (opciones ordenadas) en un único forward pass.
- Entrada multimodal: acepta estado en texto, JSON, imágenes y vídeo.
- Salida tipada sin parsing: la respuesta es un JSON con probabilidades, confianza y leyenda de opciones, lo que elimina errores de formato.
- Enrutamiento y triaje: adecuado para decidir a qué equipo, categoría o nivel de urgencia corresponde un caso.
- Evaluación de workflows typesafe: buen rendimiento declarado en procesamiento de facturas e incidentes de seguridad.
- API compatible con SystemOne: endpoint `/v1/systemone`, servible con llama.cpp o SGLang.
- Capacidades de razonamiento y código: el modelo base Qwen3.8-27B y los resultados en GSM8K y CRUXEval sugieren competencia en matemáticas y ejecución de código, aunque la salida de Clef es probabilística, no generativa.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: enviar el mensaje del cliente como `state` y definir preguntas `choice` (equipo: facturación, envío, técnico) y `score` (urgencia). El modelo devuelve probabilidades por opción, lo que permite aplicar umbrales de confianza y derivar a revisión humana los casos ambiguos.
- Triaje de correo electrónico: clasificar mensajes entrantes por departamento, detectar si requieren respuesta inmediata (`noul`) y asignar prioridad (`score`) en un único paso, sin generación de texto.
- Procesamiento de facturas: extraer decisiones tipadas (¿es una factura válida?, ¿qué categoría de gasto?, ¿requiere aprobación?) a partir de la imagen del documento, usando el proyector multimodal.
- Detección de incidentes de seguridad: clasificar alertas por severidad y tipo de incidente, con probabilidades calibradas para priorizar la cola de análisis.
- Moderación de contenido: evaluar si un texto o imagen cumple políticas mediante preguntas `noul` y `choice`, aprovechando la salida probabilística para fijar umbrales de revisión.
- Extracción de campos estructurados: dado un documento multimodal, responder preguntas tipadas sobre campos concretos (categoría, presencia de cláusulas, nivel de riesgo) sin necesidad de un parser de salida.
- Evaluación de calidad en RAG: puntuar si una respuesta está respaldada por el contexto recuperado (tarea RAGTruth) usando preguntas `score` o `noul`.

## Benchmarks y rendimiento

Según la model card, en el suite Decision Index 0.2.1 el modelo lidera o se sitúa cerca de la cabeza en BANKING77, CLINC150+OOS, BPoMP, GSM8K, CRUXEval y RAGTruth, y queda por detrás de Jev en GPQA Diamond, MMLU-Pro y BBH. No se proporcionan cifras numéricas por benchmark en la información disponible.

| Benchmark | Resultado | Comparación |
|---|---|---|
| BANKING77 | No disponible (lidera o cerca de la cabeza según model card) | — |
| CLINC150+OOS | No disponible (lidera o cerca de la cabeza según model card) | — |
| BPoMP | No disponible (lidera o cerca de la cabeza según model card) | — |
| GSM8K | No disponible (lidera o cerca de la cabeza según model card) | — |
| CRUXEval | No disponible (lidera o cerca de la cabeza según model card) | — |
| RAGTruth | No disponible (lidera o cerca de la cabeza según model card) | — |
| GPQA Diamond | No disponible (por detrás de Jev) | Jev superior |
| MMLU-Pro | No disponible (por detrás de Jev) | Jev superior |
| BBH | No disponible (por detrás de Jev) | Jev superior |

Latencia: mediana de aproximadamente 209 ms, frente a unos 39 ms de Clef-Flash (modelo más pequeño).

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: BF16 ≈54,1 GB; Q6_K ≈22,2 GB; Q5_K_M ≈19,3 GB; Q4_K_M ≈16,6 GB; Q3_K_L ≈14,4 GB. Añadir ≈931 MB para el proyector multimodal `mmproj-bf16` si se usan entradas de imagen o vídeo.
- GPU recomendadas: la model card menciona servir con SGLang en una única H200. Para BF16 se requiere una GPU con al menos 54 GB de memoria (H100 80 GB, H200, A100 80 GB). Las cuantizaciones Q4_K_M y Q5_K_M pueden caber en GPUs consumer de gama alta con 24 GB (RTX 3090, RTX 4090) si se ajusta el offload de capas.
- GPU consumer: Q3_K_L y Q4_K_M son viables en tarjetas de 16-24 GB combinando GPU y RAM del sistema; Q5_K_M y Q6_K requieren 24 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl` para offload), SGLang (según la model card), y cualquier runtime compatible con GGUF. La API expuesta es `/v1/systemone`.
- Latencia: mediana de ≈209 ms según la model card; no se especifica throughput (tokens/s) porque el modelo no genera texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef (este modelo, GGUF) | ≈27B | No disponible | Modelo de decisión multimodal con salida probabilística | Apache-2.0 | GGUF en Hugging Face |
| Clef-Flash | No disponible | No disponible | Modelo de decisión (más pequeño) | No disponible | No disponible |
| Jev | No disponible | No disponible | Modelo de decisión comparable | No disponible | No disponible |
| Qwen/Qwen3.8-27B (base) | ≈27B | No disponible | LLM generativo multimodal | Apache-2.0 | No disponible en esta ficha |

Clef-Flash presenta una latencia mediana de ≈39 ms frente a ≈209 ms de Clef, a costa de menor capacidad. Jev supera a Clef en GPQA Diamond, MMLU-Pro y BBH, mientras que Clef lidera o iguala en BANKING77, CLINC150+OOS, BPoMP, GSM8K, CRUXEval y RAGTruth.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas conversacionales; solo devuelve probabilidades sobre un esquema predefinido de preguntas.
- Idiomas: soporte limitado a inglés según la model card.
- Razonamiento duro: por detrás de Jev en GPQA Diamond, MMLU-Pro y BBH, por lo que no es la mejor opción para tareas de razonamiento complejo.
- Latencia: ≈209 ms de mediana, considerablemente superior a Clef-Flash (≈39 ms); relevante en pipelines de alta frecuencia.
- Riesgo de calibración: las probabilidades deben validarse en el dominio de despliegue; la confianza reportada puede no estar bien calibrada en dominios alejados del entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Qwen3.8-27B, puede heredar sesgos del modelo base y de sus datos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Cloudflare/clef y de Qwen3.8-27B.
- Contexto: la longitud máxima de contexto no está documentada, lo que dificulta planificar entradas de estado muy largas.
- Despliegue: la API `/v1/systemone` requiere el runtime adecuado (llama.cpp con soporte del endpoint o SGLang); no es un endpoint estándar de chat completions.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/prithivMLmods/clef-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficheros de cuantización:
  - [clef.BF16.gguf](https://huggingface.co/prithivMLmods/clef-GGUF/blob/main/clef.BF16.gguf)
  - [clef.Q3_K_L.gguf](https://huggingface.co/prithivMLmods/clef-GGUF/blob/main/clef.Q3_K_L.gguf)
  - [clef.Q4_K_M.gguf](https://huggingface.co/prithivMLmods/clef-GGUF/blob/main/clef.Q4_K_M.gguf)
  - [clef.Q5_K_M.gguf](https://huggingface.co/prithivMLmods/clef-GGUF/blob/main/clef.Q5_K_M.gguf)
  - [clef.Q6_K.gguf](https://huggingface.co/prithivMLmods/clef-GGUF/blob/main/clef.Q6_K.gguf)
  - [clef.mmproj-bf16.gguf](https://huggingface.co/prithivMLmods/clef-GGUF/blob/main/clef.mmproj-bf16.gguf)
