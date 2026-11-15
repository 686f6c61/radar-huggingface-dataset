# nchapman/Ornith-1.5-9B-W2.6A16-HGPTQ-RCO

## Resumen

Ornith-1.5-9B-W2.6A16-HGPTQ-RCO es una cuantizacion mixta de 2 y 4 bits del modelo multimodal ornith-ai/Ornith-1.5-9B, desarrollada por el usuario nchapman. El modelo base, construido sobre Qwen/Qwen3.8-9B, es un VLM (vision-language model) de aproximadamente 8.280 millones de parametros que procesa entradas de imagen y texto. Esta version cuantizada aplica una receta de GPTQ con rotaciones de Hadamard y co-diseno riemanniano (HGPTQ-RCO) para comprimir el checkpoint BF16 original de 17,98 GiB hasta 5,54 GiB, una reduccion de 3,24 veces.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal completo, junto con su drafter especulativo MTP nativo, en una unica GPU de 8 GB (RTX 3070, 4060, 4060 Ti 8GB, 5060), dejando aproximadamente 2,45 GiB para cache KV, tokens de vision, decodificacion especulativa y grafos CUDA. La receta emplea un esquema mixto W2.6A16 con grupo de 64: el 30% de los grupos mas sensibles del backbone se mantienen en W4, mientras que el resto se comprime a 2 bits simetricos.

El modelo esta publicado bajo licencia Apache 2.0 y es compatible con vLLM sin parches y con compressed-tensors de Hugging Face. La fecha de creacion del repositorio es el 15 de noviembre de 2026, y en el momento de redactar esta ficha no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (backbone de lenguaje con atencion completa y GatedDeltaNet linear attention, ViT para vision, MTP nativo para decodificacion especulativa) |
| Parametros totales | 8.283.664.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W2.6A16 mixta (W2_g64 y W4_g64 en backbone), W4_g64 en vision y MTP, W8_g64 en lm_head y mtp.fc, BF16 en embeddings y normas |
| Idiomas soportados | no disponible (el modelo base incluye capacidad multilingue segun los probes de evaluacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, formato compressed-tensors), 6,0 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer hibrido multimodal construido sobre Qwen/Qwen3.8-9B. El backbone de lenguaje combina 16 grupos de atencion completa con 48 grupos de GatedDeltaNet linear attention y 64 grupos MLP, organizados en 128 grupos fusionados compatibles con vLLM. La torre de vision consta de 27 bloques ViT con proyecciones de merger espacial. El modelo incorpora un modulo MTP (multi-token prediction) nativo que actua como drafter especulativo para acelerar la decodificacion.

La cuantizacion aplicada por nchapman emplea una receta HGPTQ-RCO (Hadamard + GPTQ con co-diseno riemanniano). El 30% de los grupos mas sensibles del backbone (69 lineales de 200, correspondientes a 50 de 128 grupos) se mantienen en W4A16: 12 de 16 grupos de atencion completa, 17 de 48 de GatedDeltaNet y 21 de 64 MLP. La seleccion se realiza mediante Gumbel-Softmax riemanniano no miope, con 59 intercambios de grupo respecto a la sensibilidad hessiana greedy, lo que reduce el KL de validacion pre-QAT de 0,4949 a 0,4350. Los 131 lineales restantes (78 de 128 grupos) se cuantizan a W2A16 simetrico con valores {-2, -1, 0, 1}, usando Hadamard, Cholesky GPTQ y tres pasadas de descenso de coordenadas hessiano (H-CD), pulidos mediante destilacion KL continua sobre log_scale y RMSNorm/GDN gates con maestro FP32. El resultado reduce el KL de validacion post-asignacion de 0,4350 a 0,3732. La calibracion usa el dataset data/calib-cascade-v1.jsonl.

## Capacidades

- Generacion de texto y razonamiento en dominios de matematicas, ciencia, codigo e instrucciones, segun los probes de evaluacion del autor.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante torre ViT de 27 bloques.
- Decodificacion especulativa nativa mediante modulo MTP, con 94,68% de acuerdo top-1 aislado y 68,57% end-to-end respecto al BF16.
- Soporte multilingue (el probe-v4 incluye evaluacion multilingue; el modelo base Qwen3.8-9B es multilingue).
- Compatibilidad con tool calling y function calling (el probe-v4 evalua tool use; el modelo base lo soporta).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (chat template incluido, sampling por defecto temperature 1.0, top_p 0.95, top_k 20).
- Compatibilidad con vLLM sin parches y con compressed-tensors de Hugging Face, incluyendo endpoints compatibles.

## Casos de uso

- Despliegue de un VLM completo en GPU consumer de 8 GB: el checkpoint de 5,54 GiB (5,11 GiB solo texto) permite ejecutar el modelo multimodal con MTP y grafos CUDA en una RTX 3070, 4060, 4060 Ti 8GB o 5060, dejando unos 2,45 GiB para cache KV y tokens de vision. Es adecuado para prototipado local y estaciones de trabajo con una sola GPU.
- Asistente multimodal en el borde: al caber en GPUs de 8 GB, puede integrarse en equipos de escritorio o servidores de gama baja para tareas de descripcion de imagenes, respuesta a preguntas visuales y analisis de documentos escaneados, sin necesidad de infraestructura de datacenter.
- Generacion de codigo asistida: el modelo conserva capacidades de codigo y tool use (evaluadas en probe-v4), por lo que puede integrarse en pipelines de CI/CD o asistentes de IDE que requieran inferencia local con latencia controlada.
- Razonamiento matematico y cientifico: los KL mas bajos del probe se dan en math (0,1435) y science (0,2440), lo que indica que la cuantizacion preserva mejor estos dominios; util para tutoria automatizada o resolucion de problemas paso a paso.
- Atencion al cliente automatizada con contexto multimodal: el modelo puede gestionar conversaciones multi-turno y procesar capturas o imagenes enviadas por el usuario, con un coste de VRAM que permite desplegarlo en una sola GPU por instancia.
- Decodificacion especulativa en produccion: el modulo MTP nativo, cuantizado a W4, permite acelerar la generacion en vLLM con un acuerdo top-1 end-to-end del 68,57%, adecuado para servicios de inferencia que priorizan throughput en hardware limitado.
- Evaluacion e investigacion de tecnicas de cuantizacion extrema: el repositorio documenta con detalle la receta HGPTQ-RCO, los probes y las metricas KL, lo que lo convierte en un caso de estudio para investigadores que trabajen en cuantizacion de 2 bits y co-diseno de hardware.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad frente al modelo BF16 base (evaluacion teacher-forced), no benchmarks estandar como MMLU o HumanEval.

| Evaluacion | BF16 base | W2.6A16-HGPTQ-RCO | Notas |
|---|---:|---:|---|
| Tamano safetensors | 17,98 GiB | 5,54 GiB | 3,24x de compresion (-12,44 GiB) |
| Perplejidad de texto (probe-v4, 378 prompts, 842.510 tokens) | 6,6829 | 3,8334 (-42,64%) | Chat, math, science, coding, tool use, multilingue |
| Divergencia KL vs BF16 (probe-v4, ponderada / media por token) | 0,0000 | 0,3550 / 0,5041 | math 0,1435; science 0,2440; instruction following 0,2649; chat 0,2962 |
| Holdout general y multilingue (probe-guard, 76 prompts, 19.570 tokens) | 15,0115 | 14,1150 (-5,97%) | KL media por token 0,4739; ponderada 0,6147; no_robots 0,3671 |
| MTP nativo (drafter especulativo, 11.583 posiciones) | 100,0% top-1 (NLL 2,8335) | 94,68% top-1 aislado; 68,57% top-1 E2E | KL aislado 0,0127; KL E2E 0,6938 |
| Vision (vision-probe-v2, 96 imagenes, 302 tokens de respuesta) | 100,0% top-1 | 98,68% top-1 aislado; 88,41% top-1 E2E | KL ViT aislado 0,0077; KL E2E 0,2298; vision-guard-v2: 97,78% / 88,15% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 5,54 GiB para el VLM completo con MTP; 5,11 GiB en modo solo texto. Quedan aproximadamente 2,45 GiB libres en una GPU de 8 GB para cache KV, tokens de vision, decodificacion especulativa y grafos CUDA.
- GPU objetivo: RTX 3070, RTX 4060, RTX 4060 Ti 8GB y RTX 5060 (8 GB). Tambien cabe en GPUs de mayor capacidad (A100, H100, RTX 4090) con margen amplio para contextos largos y lotes mayores.
- Cabe en GPU consumer: si, en las tarjetas de 8 GB indicadas por el autor.
- Opciones de despliegue: vLLM sin parches (zero-patch stock vLLM) con compressed-tensors de Hugging Face; compatible con la libreria transformers y con endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modulo MTP nativo esta disenado para acelerar la decodificacion especulativa (68,57% de acuerdo top-1 end-to-end respecto al BF16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---:|---:|---|---|
| Ornith-1.5-9B-W2.6A16-HGPTQ-RCO | 8.283.664.112 | no disponible | 5,54 GiB (VLM+MTP); 5,11 GiB solo texto | Apache 2.0 | Cuantizacion mixta W2/W4, VLM con MTP, cabe en 8 GB |
| ornith-ai/Ornith-1.5-9B (BF16 base) | no disponible | no disponible | 17,98 GiB | Apache 2.0 | Modelo sin cuantizar; requiere GPU de mayor capacidad |
| Qwen3.8-9B-W2.6A16-HGPTQ-RCO (nchapman) | no disponible | no disponible | 5,54 GiB (VLM+MTP); 5,11 GiB solo texto | Apache 2.0 | Referencia RCO del modelo base Qwen3.8-9B, misma receta de cuantizacion |

No se dispone de datos de benchmarks estandar para comparar el rendimiento bruto con alternativas de la misma categoria. La comparativa se limita a parametros, tamano, licencia y receta de cuantizacion.

## Limitaciones y advertencias

- La cuantizacion a 2 bits en el 70% de los grupos del backbone introduce divergencia respecto al BF16: KL ponderada de 0,3550 en probe-v4 y 0,6147 en probe-guard. Aunque la perplejidad mejora, la distribucion de salida no es identica al modelo original.
- El acuerdo top-1 end-to-end del MTP es del 68,57%, lo que implica que la decodificacion especulativa puede generar tokens distintos a los del modelo BF16 en aproximadamente un tercio de los casos.
- El acuerdo top-1 end-to-end de vision es del 88,41% (88,15% en vision-guard-v2), por lo que las respuestas visuales pueden diferir del modelo sin cuantizar.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion ni limitaciones especificas de idioma en la informacion proporcionada; se recomienda evaluar el modelo base para estos aspectos.
- La longitud de contexto no esta documentada en la informacion disponible; debe consultarse la model card del modelo base.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base ornith-ai/Ornith-1.5-9B y, en su caso, de Qwen/Qwen3.8-9B.
- El repositorio tiene 0 descargas y 0 interacciones en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente de las metricas del autor.
- La receta de cuantizacion es especifica del autor (HGPTQ-RCO) y depende de vLLM y compressed-tensors; cambios de version en estas librerias pueden afectar a la compatibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nchapman/Ornith-1.5-9B-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Modelo de referencia RCO sobre Qwen3.8-9B: https://huggingface.co/nchapman/Qwen3.8-9B-W2.6A16-HGPTQ-RCO
- Modelo sobre el que se construye el base: https://huggingface.co/Qwen/Qwen3.8-9B
- Commit del modelo base referenciado: 489cb97981b8654bcfcf30ce1f94ed1b62e07b53
