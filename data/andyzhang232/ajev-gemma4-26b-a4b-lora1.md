# andyzhang232/ajev-gemma4-26b-a4b-lora1

## Resumen

AJev es un adaptador LoRA sobre el modelo base `google/gemma-4-26B-A4B-it` orientado a la toma de decisiones tipadas en lugar de la generación de texto libre. El modelo recibe un contexto (texto o JSON) junto con una o varias preguntas tipadas —booleana sí/no, elección única de hasta 255 opciones, o puntuación ordenada— y devuelve una probabilidad calibrada para cada opción. No genera tokens de texto: cada pregunta se resuelve en un único *forward pass*, lo que lo convierte en una pieza de infraestructura para clasificación y enrutamiento determinista.

El adaptador lo publica el usuario `andyzhang232` y sigue el formato del llamado "Jev Decision Index", una suite de evaluación de decisión. Según la model card, el modelo alcanza un índice de decisión de 57,42 sobre la suite completa Jev Decision Index 0.2.1, con 150.317 peticiones puntuables respondidas, muy cerca del servicio alojado Jev (57,91) y de Surogate Rune 26B-A4B v3 (57,44).

Se distribuye bajo licencia Apache 2.0, con soporte declarado de inglés y chino, y un tamaño de repositorio de 0,1 GB, coherente con un adaptador LoRA (r 32 / α 64) y no con pesos completos. Su relevancia actual reside en ofrecer probabilidades calibradas y tipadas como alternativa a los LLM generativos en pipelines donde se necesita una señal numérica estable y de baja latencia (49 ms de mediana en una RTX PRO 6000).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-4-26B-A4B-it`; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | 26B (modelo base); parametros del adaptador no disponibles (LoRA r 32 / α 64) |
| Parametros activos | ~4B segun la nomenclatura "A4B" del modelo base; no confirmado en la informacion proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la model card menciona inferencia en bf16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; no se debe guardar el modelo fusionado y recargarlo) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se aplica sobre `google/gemma-4-26B-A4B-it` y se carga mediante PEFT, con la posibilidad de fusionarlo únicamente en memoria. La model card advierte explícitamente de que no se debe guardar un modelo fusionado y volver a cargarlo. Las temperaturas de calibración por tipo de pregunta se almacenan aparte, en `ajev_lm_config.json`, y el código de inferencia vive en el repositorio `cmzy/ajev-infer`. La salida no es texto: el modelo produce una distribución de probabilidad sobre las opciones de cada pregunta tipada.

El entrenamiento utilizó aproximadamente 68.000 preguntas procedentes de datasets públicos de clasificación, NLI y decisión, de preguntas de reglas de negocio generadas proceduralmente y de los *splits* de entrenamiento de benchmarks relacionados con la tabla de evaluación (HoVer, VAST, POP909, ContractNLI, ACOS, BANKING77 y CLINC150, entre otros). Se aplicó un proceso de descontaminación: cada pregunta de entrenamiento se comparó con la suite completa del leaderboard y se eliminaron aquellas con solapamiento textual. La configuración de ajuste fue LoRA con r 32 y α 64, tasa de aprendizaje 3e-5, una sola época y una única GPU RTX PRO 6000. No se detalla en la información disponible si hubo fases de RLHF o DPO, ni la composición exacta de tokens.

## Capacidades

- Clasificación binaria tipada (sí/no) con salida de probabilidad calibrada.
- Elección única entre hasta 255 opciones, con probabilidad por opción.
- Puntuación ordenada ("ordered score") sobre una escala definida por el usuario.
- Entrada de contexto en texto plano o JSON estructurado.
- Una única pasada hacia delante por pregunta, sin generación de texto (baja latencia).
- Capacidades de recuperación y decisión sobre contexto: resultados declarados de Retrieval 63,5 y Tools 73,2 en el Jev Decision Index.
- Capacidades de lenguaje: resultado declarado de Language 62,5.
- Soporte de inglés y chino según los metadatos del repositorio.
- Compatibilidad con servidor estilo Jev (`POST /v1/systemone`) mediante `ajev-infer` con backend vLLM.
- No se documentan capacidades de visión, audio, tool calling generativo ni modo de razonamiento extendido.

## Casos de uso

- Triaje de tickets de soporte: el modelo del ejemplo de la model card clasifica un ticket ("me han cobrado dos veces el pedido #1182") en categorías como facturación, envío o cuenta, y decide en paralelo si debe escalarse a un agente humano, devolviendo probabilidades en lugar de texto.
- Enrutamiento de decisiones con umbral: al recibir una probabilidad calibrada por opción, un sistema puede aplicar umbrales (por ejemplo, escalar solo si la probabilidad de escalado supera 0,8) sin necesidad de parsear lenguaje natural.
- Moderación y clasificación de riesgo: preguntas booleanas tipadas permiten etiquetar contenido con una señal numérica estable y auditable, adecuada para pipelines que requieren trazabilidad.
- Automatización de reglas de negocio: el entrenamiento incluye preguntas de reglas de negocio generadas proceduralmente y el benchmark ContractNLI, lo que lo hace apto para evaluar cumplimiento de cláusulas y políticas.
- Clasificación de intención en banca y atención al cliente: los datos de entrenamiento incluyen BANKING77 y CLINC150, lo que encaja con la categorización de intenciones en dominios financieros.
- Extracción de decisiones en pipelines de datos: a partir de un contexto JSON, el modelo puede generar etiquetas y probabilidades que alimenten un sistema de decisión posterior o una base de datos analítica.
- Enrutamiento de herramientas en agentes: con un resultado declarado de 73,2 en el área Tools, puede emplearse como selector de la siguiente acción o herramienta en un agente multi-paso, aportando distribución de probabilidad en vez de texto generado.
- Evaluación de inferencia de lenguaje natural (NLI): los datasets de NLI usados en entrenamiento permiten emplearlo para tareas de implicación y contradicción con salida probabilística.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la suite completa Jev Decision Index 0.2.1 (150.317 peticiones puntuables, HLE incluido). La model card indica que no han sido reproducidos por los mantenedores.

| Modelo | Base | Decision Index |
|---|---|---:|
| Jev (TypeSafe, servicio alojado) | — | 57,91 |
| Surogate Rune 26B-A4B v3 | Gemma 4 26B-A4B | 57,44 |
| **AJev 26B-A4B (este modelo)** | **Gemma 4 26B-A4B** | **57,42** |
| AJev lora5 (versión anterior) | Gemma 4 12B | 52,22 |

Desglose por área de este modelo: Knowledge 41,8; Language 62,5; Retrieval 63,5; Tools 73,2; Arts 43,7.

Precisión en conjuntos de test reservados:

| Conjunto de test | AJev 12B (lora5) | Este modelo |
|---|---:|---:|
| JevBench public | 0,853 | **0,887** |
| Kev transfer v9 | 0,771 | **0,790** |
| eikos heldout | 0,931 | **0,937** |
| typed-decisions | **0,790** | 0,780 |

Latencia: mediana de 49 ms para peticiones secuenciales en una RTX PRO 6000.

## Requisitos de hardware

- Memoria de GPU: la model card indica que la inferencia en bf16 necesita aproximadamente 55 GB de memoria de GPU.
- GPU recomendadas: RTX PRO 6000 (usada para medir los 49 ms de latencia mediana); no se especifican otras GPU en la información disponible.
- GPU de consumo: no cabe en GPU de consumo convencionales, dado el requisito de ~55 GB en bf16; no hay datos de cuantización a 8 o 4 bits que permitan reducir ese requisito.
- Opciones de despliegue: `ajev-infer` (pip, con o sin extra `vllm`), servidor compatible Jev vía `python -m ajev.serve_vllm`, y backend vLLM. Requiere `transformers >= 5.17`.
- Formato de carga: cargar como adaptador LoRA o fusionarlo solo en memoria; no guardar y recargar un modelo fusionado.
- Rendimiento: 49 ms de mediana por petición secuencial en RTX PRO 6000; no se publica throughput en peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AJev 26B-A4B (este modelo) | Gemma 4 26B-A4B | 26B totales (~4B activos según nomenclatura) | 57,42 | apache-2.0 | Adaptador LoRA en HuggingFace |
| Surogate Rune 26B-A4B v3 | Gemma 4 26B-A4B | 26B totales (~4B activos según nomenclatura) | 57,44 | no disponible | no disponible en la información proporcionada |
| AJev lora5 (versión anterior) | Gemma 4 12B | 12B (modelo base) | 52,22 | no disponible | versión previa del mismo autor |
| Jev (TypeSafe) | — | no disponible | 57,91 | no disponible | servicio alojado |

No se dispone de datos de contexto, cuantización ni rendimiento por token para los modelos comparados, por lo que la comparación se limita a la métrica Decision Index y a la base utilizada.

## Limitaciones y advertencias

- Los benchmarks de razonamiento de conocimiento (GPQA, ChessBench) y algunos de Artes siguen siendo débiles, con un resultado de Arts de 43,7 y Knowledge de 41,8.
- Las probabilidades se calibraron sobre datos reservados del propio autor; si la distribución de datos de destino difiere mucho, es necesario recalibrar.
- Parte de los datos de entrenamiento incorpora términos de uso no comercial o de atribución; el autor recomienda verificarlos antes de un uso comercial, a pesar de que la licencia del artefacto sea Apache 2.0.
- El autor declara no estar afiliado a TypeSafe AI.
- Los resultados del leaderboard no han sido reproducidos por los mantenedores de la suite.
- El modelo no genera texto: no es adecuado para tareas generativas, resumen o diálogo libre.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de despliegues con contextos largos.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- El rendimiento en un conjunto de test (typed-decisions, 0,780) es inferior al de la versión anterior AJev 12B lora5 (0,790), lo que indica que la mejora no es uniforme en todas las tareas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de calibración incorrecta fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andyzhang232/ajev-gemma4-26b-a4b-lora1
- Código de inferencia: https://github.com/cmzy/ajev-infer
- Jev Decision Index 0.2.1 (suite de evaluación): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
