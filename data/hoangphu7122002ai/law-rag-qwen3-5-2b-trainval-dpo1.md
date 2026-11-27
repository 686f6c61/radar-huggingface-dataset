# hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo1

## Resumen

law-rag-qwen3.5-2b-trainval-dpo1 es un ajuste fino del modelo base Qwen/Qwen3.5-2B (2.213.241.664 parametros) desarrollado por el autor hoangphu7122002ai para un sistema de respuesta a preguntas con recuperacion aumentada (RAG) sobre legislacion vietnamita. Forma parte del proyecto law-rag, construido para el curso *Large Language Models* de la HCMUT, que exige un modelo respondedor de menos de 4000 millones de parametros. El modelo es la etapa 2 de la cadena de configuracion fija: SFT con LoRA inicializado con PiSSA (variante de LoRA que inicializa las matrices a partir de la descomposicion SVD de los pesos) sobre el conjunto train + dev, seguido de una ronda de DPO.

La relevancia de esta ficha es acotada: no se trata del sistema reportado del proyecto (ese es `law-rag-qwen3.5-2b-dpo`), sino de un experimento de ablacion declarado con antelacion y puntuado una sola vez sobre test, cuyo objetivo es demostrar que anadir el split de desarrollo al entrenamiento no mejora el resultado en test (.640 greedy frente a .643 del sistema reportado, dentro de la dispersion de semillas). El modelo esta especializado en vietnamita, en registro juridico, y asume un prompt y un pipeline de recuperacion concretos.

Arquitectura transformer densa heredada de Qwen3.5-2B, con pesos fusionados (LoRA plegado en los pesos), en bfloat16, aproximadamente 4.5 GB en el repositorio. Su uso previsto es la generacion extractiva de respuestas legales citando el articulo recuperado, con rechazo explicito cuando el contexto no contiene la respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-2B); ajuste fino con LoRA + PiSSA, pesos fusionados |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el servicio de referencia (`--max-model-len 32768`); longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other (licencia no estandar; condiciones no detalladas en la informacion disponible) |
| Formato de pesos | safetensors (bf16, ~4.5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso de 2213 millones de parametros, y se ajusta en dos etapas sobre el dataset `hoangphu7122002ai/law-rag-data`. La primera etapa es un SFT con LoRA inicializado mediante PiSSA sobre 1915 filas (train + dev, configuracion de datos `q35_CF`). La segunda etapa es una ronda de DPO on-policy partiendo del checkpoint SFT: se generan 8 respuestas por prompt (1 greedy y 7 con temperatura 0.7), se seleccionan la mejor y la peor por ROUGE-L con un margen minimo de 0.1, produciendo 1308 pares de preferencia. Los hiperparametros del DPO son beta 0.1, learning rate 2e-5, 1 epoca, batch 1 x 16, LoRA con rango 32, longitud maxima 12.288 y semilla 1; el entrenamiento completo de esta ronda consumio 42 minutos en una unica GPU L40S.

La innovacion tecnica destacable no esta en la arquitectura sino en la metodologia: el autor declara la configuracion fija antes de entrenar y puntua una sola vez sobre test, y compara contra la cadena reportada para aislar el efecto de incluir dev en el entrenamiento. El prompt de inferencia es parte del contrato del modelo: linea de sistema, pasajes recuperados con el formato `- Ngữ cảnh i: ...`, la pregunta, y el modo de razonamiento (thinking) desactivado mediante `enable_thinking: False`.

## Capacidades

- Generacion de texto extractiva en vietnamita con registro juridico: cita primero la provision (por ejemplo, "khoản 2 Điều 9 Thông tư 27/2025/TT-NHNN") y despues la reproduce.
- Respuesta a preguntas anclada a contexto (grounded QA): solo utiliza la informacion de los pasajes recuperados que se le entregan.
- Rechazo controlado: cuando los pasajes no cubren la pregunta, el modelo se niega a responder en lugar de especular.
- Integracion en pipeline RAG: disenado para funcionar con recuperacion densa, reordenacion y ejemplos few-shot insertados en el mismo mensaje de usuario.
- Soporte de plantilla de chat via `tokenizer.apply_chat_template` y servicio compatible con la API de OpenAI (vLLM).
- Modo thinking desactivable por parametro, aunque el modelo fue entrenado con thinking apagado.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision ni audio documentadas.

## Casos de uso

- Atencion al ciudadano sobre tramites legales: el modelo responde consultas concretas ("Thời hạn nộp báo cáo giao dịch chuyển tiền điện tử là bao lâu?") citando el articulo y el documento recuperados, lo que permite construir asistentes que muestren la fuente normativa junto a cada respuesta.
- Asistencia a funcionarios en consulta normativa interna: integrado en una herramienta de busqueda sobre el corpus legal de la institucion, reduce el tiempo de localizacion de la provision aplicable al devolver la cita exacta en lugar de un resumen libre.
- Verificacion de cumplimiento en entornos financieros: con el pipeline RAG apuntando a circulares del banco central (como la Thông tư 27/2025/TT-NHNN), el modelo extrae plazos y obligaciones de reporte para revisiones de compliance.
- Generacion de borradores de respuestas administrativas: el registro de salida imita el de las referencias del corpus (cita y reproduccion de la provision), lo que facilita su uso como primer borrador sujeto a revision humana.
- Evaluacion de sistemas RAG juridicos: al ser un checkpoint de ablacion con resultados en test documentados (.640 greedy / .646 MBR-8), sirve como punto de comparacion controlado para medir el efecto de decisiones de datos y de alineacion.
- Despliegue en hardware modesto: con 2213 millones de parametros en bf16 y servicio mediante vLLM con cache de prefijos, es viable en una unica GPU de gama profesional para prototipos academicos o internos.
- Filtrado de preguntas fuera de dominio: su comportamiento de rechazo ante contexto insuficiente permite usarlo como capa de derivacion a un humano cuando la recuperacion no contiene la respuesta.

## Benchmarks y rendimiento

Los unicos datos publicados son de ROUGE-L sobre el pipeline completo de recuperacion con 2 ejemplos few-shot, en dev (300 preguntas) y test (200 preguntas retenidas). Este checkpoint no fue puntuado en dev (no puede, al haberse entrenado con el) ni en sus etapas intermedias; en test solo se reporta la etapa final de la cadena (+ DPO round 2), no esta ronda 1 de forma aislada.

| Modelo | Entrenado con | Dev ROUGE-L (greedy / MBR-8) | Test ROUGE-L (greedy / MBR-8) |
|---|---|---|---|
| law-rag-qwen3.5-2b-sft (LoRA SFT v3b) | train | .633 / .658 | .607 / – |
| law-rag-qwen3.5-2b-dpo (sistema reportado, SFT + 2 DPO) | train | .664 / .672 | .643 / .652 |
| law-rag-qwen3.5-2b-trainval-sft (PiSSA SFT, config. fija) | train + dev | – | – |
| **law-rag-qwen3.5-2b-trainval-dpo1 (este modelo)** | train + dev | – | – |
| law-rag-qwen3.5-2b-trainval-dpo2 (+ DPO round 2) | train + dev | – | .640 / .646 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4.5-5 GB en bfloat16 para los pesos; con cache KV para 32.768 tokens de contexto la huella crece de forma proporcional al batch y a la longitud de secuencia (valor exacto no disponible).
- GPU recomendadas: el autor entreno el DPO en una NVIDIA L40S; para servicio, cualquier GPU profesional con al menos 16-24 GB (L40S, A10G, L4, A100) cubre con holgura el modelo y contexto largo.
- GPU de consumo: cabe en tarjetas consumer con 8 GB o mas en bf16/fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante); en GPUs de 6-8 GB puede requerir cuantizacion, que no esta publicada.
- Opciones de despliegue: vLLM (version 0.30 usada por el autor, con `--enable-prefix-caching`), transformers con `AutoModelForCausalLM` en bfloat16; llama.cpp u Ollama requeririan conversion a GGUF no disponible en el repositorio.
- Latencia y throughput: no disponibles; el unico dato de computo publicado es el entrenamiento del DPO (42 minutos en 1 x L40S).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| law-rag-qwen3.5-2b-trainval-dpo1 (este) | 2,21 B | 32.768 en servicio | RAG juridico vietnamita, ablacion | other | Hugging Face, 0 descargas |
| law-rag-qwen3.5-2b-dpo (sistema reportado del mismo proyecto) | 2,21 B | 32.768 en servicio | RAG juridico vietnamita, SFT + 2 DPO | other | Hugging Face; test ROUGE-L .643 / .652 |
| law-rag-qwen3.5-2b-sft (misma familia, solo SFT) | 2,21 B | 32.768 en servicio | RAG juridico vietnamita, solo SFT | other | Hugging Face; test ROUGE-L .607 |
| Qwen/Qwen3.5-2B (modelo base) | 2,21 B | no disponible | proposito general, multilingue | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas con modelos de otras familias (por ejemplo, otros modelos vietnamitas de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Las metricas ROUGE-L miden similitud con respuestas de referencia de estilo plantilla, no correccion juridica; el propio autor advierte que las respuestas no constituyen asesoramiento legal.
- El error residual tipico es citar un khoản o un Điều vecino de la ley correcta, o citar de mas o de menos dentro de la provision.
- El modelo solo conoce lo que dicen los pasajes recuperados; no tiene conocimiento normativo propio fiable y depende por completo de la calidad del retrieval.
- Requiere el prompt y el pipeline exactos de entrenamiento (formato `- Ngữ cảnh i:`, thinking desactivado, top 5 de 50 tras reordenacion, 2 ejemplos few-shot); fuera de ese contrato el rendimiento puede degradarse sin aviso.
- Solo soporta vietnamita; no se documenta capacidad multilingue.
- Licencia "other": las condiciones de uso comercial no estan detalladas en la informacion disponible y deben verificarse antes de cualquier despliegue en produccion.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa.
- No hay pesos cuantizados publicados, lo que limita el despliegue en entornos con poca VRAM o en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo1
- Sistema reportado de la familia: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-dpo
- Checkpoint SFT de la cadena: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-sft
- Checkpoint SFT train+dev (PiSSA): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-sft
- Checkpoint DPO round 2 train+dev: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo2
- Repositorio del proyecto: https://github.com/hoangphu7122002/law-rag
- Manual de uso: https://github.com/hoangphu7122002/law-rag/blob/main/docs/MANUAL.md
- Dataset de entrenamiento: https://huggingface.co/datasets/hoangphu7122002ai/law-rag-data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
