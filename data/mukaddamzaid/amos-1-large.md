# mukaddamzaid/amos-1-large

## Resumen

Amos 1 large es un modelo de decisión de 27.000 millones de parámetros publicado por el usuario mukaddamzaid (Scira) y afinado a partir del modelo base Qwen/Qwen3.8-27B. No es un modelo generativo al uso: recibe un caso de entrada (texto plano, JSON o una fotografía) junto con un esquema de preguntas tipadas y devuelve, en una única pasada hacia delante, una respuesta para cada pregunta acompañada de una probabilidad por cada opción permitida. No redacta texto libre, de modo que no hay salida que parsear ni riesgo de formato malformado.

El modelo forma parte de la familia Amos 1, que incluye cuatro variantes (large, medium, small y mini), y se posiciona como la más capaz para decisiones complejas: preguntas que requieren varios pasos, políticas largas, compensaciones entre criterios y casos que exigen conocimiento amplio. Su contexto de 131.072 tokens permite introducir documentos extensos en la misma petición.

Su relevancia actual radica en el enfoque de "system-one": en lugar de generar una cadena de razonamiento y luego parsear la conclusión, el modelo produce directamente decisiones tipadas y calibradas, con métricas de probabilidad (KL y Brier) publicadas. Se distribuye con licencia Apache 2.0 y un paquete de servicio propio, además de una API alojada sin clave.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, ajuste fino del modelo base Qwen/Qwen3.8-27B con cabezas de decisión dedicadas (archivo `heads.pt`) |
| Parametros totales | 27B |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas `heads.pt`, tokenizer e image processor) |

Otros datos de interes: tamano del repositorio 55,4 GB; descargas 48; "likes" 14; fecha de creacion 2026-10-12; ultima actualizacion 2026-10-13.

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.8-27B, un transformer de 27.000 millones de parametros, mediante ajuste fino. La innovacion principal no esta en el backbone sino en la cabeza de salida: en lugar de decodificar texto token a token, el modelo resuelve un esquema de preguntas tipadas en un solo paso hacia delante, emitiendo una distribucion de probabilidad sobre las respuestas admitidas para cada pregunta. Los tipos de pregunta soportados son: si/no (`noul`), eleccion unica (`choice`, hasta 255 opciones), valoracion (`score`), seleccion multiple (`multi`), cita textual (`span`) y region sobre imagen (`region`, con la foto en el campo `images`).

Respecto a los datos de entrenamiento, la model card no detalla el volumen de tokens, la composicion del corpus ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. Si se documenta una evaluacion zero-shot sobre 2.000 decisiones procedentes de cuatro flujos de trabajo que el modelo nunca vio durante el entrenamiento, lo que sugiere un enfasis en generalizacion fuera de distribucion. El autor tambien reporta resultados con los priors de cada pregunta ajustados sobre el split de entrenamiento del propio benchmark y aplicados en el momento de responder, sin modificar los pesos.

## Capacidades

- Decision tipada en una sola pasada: responde simultaneamente todas las preguntas de un esquema, cada una con una probabilidad por opcion.
- Tipos de pregunta soportados: si/no (`noul`), eleccion unica (`choice`, hasta 255 opciones), valoracion (`score`), seleccion multiple (`multi`), cita textual (`span`) y region sobre imagen (`region`).
- Salida sin texto libre, por lo que no hay nada que parsear y no se producen salidas malformadas.
- Entrada multimodal: acepta texto plano, JSON y fotografias.
- Vision: localizacion de objetos mediante cajas (resultados publicados en RefCOCO y COCO) y tareas del tablero de vision del Decision Index.
- Recuperacion y reranking: resultados publicados de reranking sobre el top 30 de BM25 con nDCG@10.
- Clasificacion: resultados en AG News, DAIR Emotion y Banking77 (77 etiquetas).
- Extraccion estructurada: citas textuales (`span`), incluidos importes de facturas (10 de 10 exactos segun el autor).
- Capacidades multilingues: no, el modelo es solo en ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no se describe como agente; el diseno resuelve cada peticion en un unico forward pass.
- Modo "thinking": no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del caso y un esquema con preguntas como "pertenece a facturacion, tecnico o ventas" y devuelve la probabilidad de cada opcion, lo que permite automatizar la asignacion de colas sin generar texto intermedio.
- Gestion de reclamaciones de facturacion: con un caso como una factura duplicada, responde a preguntas tipadas (si el cliente pide reembolso, a que equipo derivarlo) y devuelve una probabilidad calibrada que puede usarse como umbral de escalado a un humano.
- Extraccion de clausulas en contratos: mediante preguntas de tipo `span`, el modelo localiza el fragmento relevante dentro de un documento largo, aprovechando la ventana de 131.072 tokens para introducir el contrato completo en una sola peticion.
- Procesamiento de facturas con imagen: al aceptar fotografias y preguntas de tipo `region`, puede localizar y leer importes o campos concretos en documentos escaneados.
- Moderacion y clasificacion con umbrales: gracias a las metricas de calibracion publicadas (KL y Brier), las probabilidades de cada clase pueden usarse directamente para fijar umbrales de decision automatica en lugar de depender de texto generado.
- Reranking en pipelines RAG: puede reordenar candidatos recuperados por un buscador (el autor publica nDCG@10 sobre el top 30 de BM25) para mejorar la precision del contexto entregado a un modelo generativo posterior.
- Puntuacion de riesgo y priorizacion: el tipo `score` permite asignar una valoracion graduada a casos, util para triaje, priorizacion de incidencias o evaluacion de severidad.
- Analisis de sentimiento o emocion: aunque el rendimiento en DAIR Emotion es modesto (58,5), puede emplearse en tareas internas de clasificacion en ingles donde no se requiera maxima precision.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Amos 1 large | Comparativa |
|---|---|---|
| Typed decisions (2.000 decisiones, test split, zero-shot) - Accuracy | 76,1% | Microsoft-Decision-1 79,5%; Decider 1 76,8%; Perplexity Decider v1.1 73,9%; Clef (Cloudflare) 72,5% |
| Typed decisions - KL (menor es mejor) | 0,126 | Microsoft-Decision-1 0,318; Decider 1 0,096; Perplexity Decider v1.1 0,466; Clef 0,191 |
| Typed decisions - Brier (menor es mejor) | 0,069 | No disponible para el resto |
| Typed decisions con priors ajustados | 80,25% | Decider 1 80,1% |
| Decision Bench (1.071 registros reales, con imagenes) | 94,9% | Perplexity Decider v1.1 94,5%; DeepSeek V4.1 Flash 94,2%; Gemini 3.5 Flash 94,2%; Jev 1.13 93,8% |
| Decision Index 0.3, parte publica | 65,11 | No disponible para el resto |
| JevBench publico easy / standard / hard | 100,0 / 100,0 / 84,7 | No disponible |
| Diez benchmarks publicos (RAGTruth, JudgeBench, Belebele, WinoGrande, ContractNLI, TruthfulQA, Circa, Financial PhraseBank, TabFact, BBH) | 89,8% | No disponible |
| AG News / DAIR Emotion / Banking77 (77 etiquetas) | 89,1 / 58,5 / 90,5 | No disponible |
| Importes de factura citados exactamente | 10 / 10 | No disponible |
| Caja centrada en el objeto nombrado, RefCOCO | 91,9% | No disponible |
| Caja que cubre al menos la mitad del objeto, RefCOCO | 71,3% | No disponible |
| Caja centrada en el objeto nombrado, COCO | 98,4% | No disponible |
| Copia propia de las tareas publicas del tablero de vision del Decision Index (8 tareas, pesos del tablero) | 76,69 | No disponible |
| BLINK, corregido por azar | 65,9 | No disponible |
| Reranking del top 30 de BM25, nDCG@10, media de SciFact, NFCorpus y FiQA | 0,517 | No disponible |
| Tiempo de servidor, mediana, peticion de tres preguntas | 122 ms | No disponible |

Desglose del Decision Index 0.3 por areas: conocimiento 52,6; lenguaje 72,3; recuperacion 66,2; herramientas 79,7; artes 50,0. El autor indica que los rivales fueron ejecutados por su equipo sobre las mismas 2.000 decisiones, salvo Decider 1, cuyo numero procede de sus propios creadores.

## Requisitos de hardware

- VRAM: la model card indica que el modelo funciona en una GPU de 80 GB. El repositorio pesa 55,4 GB, coherente con un modelo de 27B en precision de 16 bits.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con al menos 80 GB de memoria.
- GPU de consumo: no se documenta soporte en GPUs de consumo. Con 27B de parametros y una ventana de 131.072 tokens, una unica RTX 4090 (24 GB) no seria suficiente en la configuracion publicada.
- Opciones de despliegue: paquete de servicio propio `amos.serve` (Python 3.12, PyTorch 2.14, versiones fijadas a las usadas para medir los resultados), invocado con `python -m amos.serve amos-1-large --device cuda --port 8000 --max-len 131072`, que expone un endpoint compatible con `POST /v1/systemone`. Tambien hay API alojada en `https://api.amos.scira.ai/v1/systemone` sin clave.
- Frameworks alternativos (vLLM, llama.cpp, Ollama, TGI): no se mencionan en la informacion disponible.
- Latencia: mediana de 122 ms de tiempo de servidor para una peticion de tres preguntas. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en Typed decisions | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amos 1 large | 27B | 131.072 tokens | 76,1% (80,25% con priors) | Apache 2.0 | Pesos abiertos en HuggingFace y API alojada |
| Microsoft-Decision-1 | No disponible | No disponible | 79,5% | Peso cerrado | Solo API (pesos cerrados) |
| Decider 1 | No disponible | No disponible | 76,8% (80,1% con priors) | No disponible | No disponible |
| Perplexity Decider v1.1 | No disponible | No disponible | 73,9% | No disponible | No disponible |
| Clef (Cloudflare) | No disponible | No disponible | 72,5% | No disponible | No disponible |

En Decision Bench, Amos 1 large (94,9%) queda por delante de Perplexity Decider v1.1 (94,5%), DeepSeek V4.1 Flash (94,2%), Gemini 3.5 Flash (94,2%) y Jev 1.13 (93,8%), segun los datos aportados por el autor.

## Limitaciones y advertencias

- Idiomas: el modelo es exclusivamente en ingles, lo que limita su uso directo en castellano u otros idiomas.
- Velocidad: el propio autor senala que es "el mas lento de los cuatro" modelos de la familia Amos 1.
- Citas largas: las citas extensas (por ejemplo, una clausula completa o una direccion) pueden devolverse truncadas.
- Formato de salida restringido: no genera texto libre, por lo que no sirve para tareas de redaccion, resumen o conversacion abierta.
- Riesgo de calibracion fuera de distribucion: aunque se publican metricas de KL y Brier, no hay datos sobre el comportamiento de las probabilidades en dominios alejados de los flujos evaluados. Conviene validar los umbrales en el dominio propio antes de automatizar decisiones.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Alucinacion: al no producir texto libre el riesgo de invencion textual es bajo, pero si puede asignar una probabilidad alta a una opcion incorrecta; existe riesgo de decisiones erroneas con alta confianza.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base (Qwen/Qwen3.8-27B) y de los benchmarks de terceros citados.
- Adopcion temprana: el repositorio tiene 48 descargas y 14 "likes" en la fecha de consulta, y fue publicado en 2026-10-12, por lo que la validacion por parte de la comunidad es todavia escasa.
- Rendimiento desigual por area: en el Decision Index, las areas de conocimiento (52,6) y artes (50,0) son claramente mas debiles que herramientas (79,7) o lenguaje (72,3).
- Repositorio voluminoso: 55,4 GB de pesos, lo que complica el despliegue en entornos con almacenamiento o ancho de banda limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mukaddamzaid/amos-1-large
- Coleccion de la familia Amos 1: https://huggingface.co/collections/mukaddamzaid/amos-1
- Variante medium: https://huggingface.co/mukaddamzaid/amos-1-medium
- Variante small: https://huggingface.co/mukaddamzaid/amos-1-small
- Variante mini: https://huggingface.co/mukaddamzaid/amos-1-mini
- Playground: https://amos.scira.ai/playground/?model=amos-1-large
- Documentacion de la API: https://amos.scira.ai/docs/
- Pagina del modelo: https://amos.scira.ai/models/amos-1-large/
- Dataset Typed decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Decision Bench: https://decisionbench.ai
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Analisis de JevBench en Benchmark Heaven: https://benchmarkheaven.com/jev-models/v1.6.17
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
