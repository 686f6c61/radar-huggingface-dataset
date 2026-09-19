# iliaosipov998/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es un checkpoint derivado del modelo multimodal `deepseek-ai/DeepSeek-V4.1-Flash`, publicado por el usuario `iliaosipov998` (asociado a las cuentas de X @dealignai y @jordanschenck) bajo licencia MIT. La modificacion consiste en una "abliteracion" a nivel de pesos: se elimina quirurgicamente el circuito de rechazo del modelo base sin emplear hooks de runtime ni `model.py` personalizado, de modo que el checkpoint se carga igual que el original. Conserva la torre de vision, la memoria Engram, la atencion dispersa CSA2 y la cabeza de borrador especulativo DSpark intactas segun la model card.

El modelo es un transformer causal encoder-decoder con mezcla de expertos (MoE): 20+20 capas, 384 expertos enrutados con top-6 mas 1 experto compartido, residuales Hyper-Connections de 4 canales y 1.000.000 de tokens de contexto. El repositorio de safetensors declara 763.205.315.794 parametros totales, aunque la model card del autor describe un backbone de 552 B con 8 B/16 B activos por token. Los pesos se distribuyen en FP8 nativo (`e4m3fn`) con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4.

Su relevancia es doble: por un lado, es un ejemplo de tecnicas de abliteracion aplicadas a un modelo MoE multimodal de gran escala, con datos publicados de HarmBench y MMLU; por otro, plantea riesgos serios de seguridad, ya que la model card reporta un 100 % de tasa de exito en ataques (ASR) sobre HarmBench-320 en las siete categorias semanticas evaluadas. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas), MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria n-gram Engram (modelo base) |
| Parametros totales | 763.205.315.794 (~763,2 B) segun safetensors; la model card declara 552 B de backbone |
| Parametros activos | 8 B / 16 B por token (MoE, segun model card) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32]; expertos enrutados en FP4. Pesos nativos, sin requantizar. No se ofrecen variantes GGUF ni AWQ/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun la model card del autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `deepseek-ai/DeepSeek-V4.1-Flash`: un transformer causal encoder-decoder con capas de mezcla de expertos (384 expertos enrutados con seleccion top-6 mas un experto compartido), residuales Hyper-Connections de 4 canales y atencion dispersa CSA2. Incorpora ademas memoria n-gram Engram, una cabeza de decodificacion especulativa DSpark (MTP) y una torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle. La cuantizacion FP8/FP4 es nativa, no aplicada a posteriori.

La modificacion de este checkpoint no implica entrenamiento adicional ni RLHF/DPO: es una intervencion quirurgica a nivel de pesos que elimina el comportamiento de rechazo. Segun el autor, se preservan byte a byte los componentes criticos para la capacidad (expertos enrutados, memoria Engram, atencion CSA2, cabeza DSpark, torre de vision, gates del router, normas y embeddings). No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el pipeline de alineacion del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modo "reasoning-max" activado por defecto segun la model card.
- Entrada multimodal imagen-texto (`pipeline_tag: image-text-to-text`) mediante torre de vision DeepSeek-ViT.
- Procesamiento de contexto largo de hasta 1.000.000 de tokens.
- Tool calling / function calling (el tag `endpoints_compatible` y la referencia a "tools" en la model card apuntan a soporte de herramientas; no se detalla el formato exacto).
- Decodificacion especulativa DSpark (MTP) para acelerar la generacion.
- Ausencia deliberada de rechazos: el modelo responde a solicitudes que el base rechazaria (abliterado/uncensored).
- Capacidades multilingues: no disponible (no se documentan idiomas soportados).

## Casos de uso

- Investigacion en seguridad y alineacion: permite estudiar de forma controlada como se comporta un modelo sin circuitos de rechazo y compararlo con el base, usando los datos de HarmBench y MMLU publicados.
- Red teaming interno: util para que equipos de seguridad generen solicitudes adversarias y midan la robustez de sus propios clasificadores y guardrails externos.
- Generacion de datos sinteticos adversariales: sirve para producir ejemplos etiquetados que alimenten entrenamiento de filtros de contenido y detectores de abuso.
- Redaccion creativa y editorial sin rechazos espurios: ficcion, guiones o textos de tematica adulta donde el modelo base tiende a responder con evasivas.
- Analisis documental de contexto largo: ingesta de contratos, expedientes o corpus tecnicos extensos aprovechando la ventana de 1M tokens.
- Pipelines multimodales: extraccion de informacion de imagenes combinadas con texto (OCR, descripcion de diagramas, indexado de documentos escaneados) en entornos internos.
- Asistentes multi-turno con tool calling: agentes que encadenan llamadas a funciones en flujos de automatizacion internos.
- Extraccion estructurada de datos: conversion de texto e imagenes no estructurados a JSON u otros formatos en procesos ETL.

Advertencia: todos estos casos deben desplegarse en entornos aislados y con supervision humana, dado el comportamiento del modelo descrito en la seccion de limitaciones.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (T=0, greedy).

HarmBench-320, comparativa base frente a la version modificada ("CRACK"):

| Evaluacion | ASR base | ASR CRACK | Delta (pp) |
|---|---|---|---|
| HB-320 effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320 effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoria semantica (ASR):

| Categoria | Items | Base off | CRACK off | Base max | CRACK max |
|---|---|---|---|---|---|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (test set completo, base-logit, T=0):

| Build | Aciertos | Precision | Delta |
|---|---|---|---|
| base | 12.211/14.042 | 86,96 % | — |
| CRACK | 11.619/14.042 | 82,74 % | -4,22 pp |

El autor indica que, excluyendo el cluster de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), el delta sobre los ~11.000 items restantes es de -1,1 pp. La mayor caida por materia se da en `moral scenarios` (-39,89 pp), coherente con la eliminacion del comportamiento de rechazo. No se aportan benchmarks de codigo, matematicas ni vision.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 510,3 GB. Con 763,2 B de parametros en FP8 se necesitarian del orden de 760 GB solo para pesos, mas cache KV para una ventana de hasta 1M tokens (dimensionada segun la arquitectura real). La combinacion FP8 + expertos FP4 declarada por el autor reduce el peso efectivo respecto a un FP8 puro.
- GPU recomendadas: nodos multiples con H100 80 GB (8-16 unidades), H200 (141 GB) o B200. No es viable en una sola GPU convencional.
- Consumer GPU: no cabe. Ni siquiera en configuraciones de 4x RTX 4090/5090; el modelo exige un nodo de centro de datos.
- Opciones de despliegue: la libreria declarada es `transformers`; con esta arquitectura MoE multimodal el despliegue en produccion requeriria vLLM o SGLang (soporte de MoE y FP8), o TGI. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 (este) | ~763,2 B (8 B/16 B activos) | 1M | MIT | 0 descargas, 0 likes | Abliterado, sin rechazos, FP8/FP4 |
| DeepSeek-V4.1-Flash (base) | 552 B de backbone (8 B/16 B activos) | 1M | no disponible | Modelo oficial de referencia | Guardrails intactos; MMLU 86,96 % |
| Otros modelos abliterados de gran escala | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos publicados comparables en la informacion disponible |

No se dispone de informacion verificable sobre alternativas de la misma categoria (MoE multimodal abliterado de >500 B) en las fuentes proporcionadas.

## Limitaciones y advertencias

- Eliminacion deliberada de guardrails: la model card reporta un 100 % de ASR en HarmBench-320 y cero rechazos (HARD_REF, SOFT_RED y HEDGE) en las siete categorias evaluadas. El modelo cumple solicitudes potencialmente peligrosas por diseno.
- Riesgo legal y de cumplimiento: su uso puede vulnerar normativa de la UE (AI Act), legislacion sobre contenido ilicito, derechos de autor y normativa sectorial. La licencia MIT no exime de responsabilidad sobre el uso.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual mas alla de MMLU; la caida de -4,22 pp en MMLU y de casi -40 pp en `moral scenarios` sugiere degradacion en areas ligadas a juicio etico.
- Checkpoint de terceros: al ser una modificacion no oficial de 510,3 GB, no hay garantia de integridad frente a manipulaciones, puertas traseras o sesgos introducidos en la intervencion de pesos.
- Adopcion nula: 0 descargas y 0 likes, sin validacion independiente de los resultados.
- Idiomas soportados: no disponible; no se puede evaluar cobertura multilingue real.
- Restricciones de licencia: la model card declara MIT, pero debe verificarse la compatibilidad con la licencia del modelo base de DeepSeek antes de cualquier uso comercial.
- Hardware: requiere un nodo multi-GPU de centro de datos; inviable en consumer GPU, lo que limita su uso a laboratorios con recursos.
- Sin variantes cuantizadas: la ausencia de GGUF o AWQ/GPTQ complica el despliegue en entornos con VRAM limitada.
- Categoria de contenido sensible: incluye desarrollos quimicos/biologicos y cibercrimen entre las categorias con 100 % de cumplimiento, por lo que su uso en produccion sin filtros externos es desaconsejable.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/iliaosipov998/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del autor en X: https://x.com/jordanschenck
- Paper del modelo base: no disponible
- Repositorio o demo adicional: no disponible
