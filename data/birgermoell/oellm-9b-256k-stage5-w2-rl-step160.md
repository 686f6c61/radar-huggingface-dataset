# birgermoell/oellm-9b-256k-stage5-w2-rl-step160

## Resumen

OpenEuroLLM 9B 256K es un checkpoint de investigación (research preview) del pipeline de post-entrenamiento del proyecto OpenEuroLLM, desarrollado por Birger Moëll y el equipo de OpenEuroLLM. Se trata de un modelo de 9.101.947.904 parámetros construido sobre la arquitectura Qwen3, con una ventana de contexto de 256K tokens y un vocabulario de 263.168 tokens con embeddings no atados. El modelo base es `openeurollm/oellm-9b-256k-theta64m-prelude-anneal300b`, sobre el que se aplica una cadena de SFT de instrucciones, SFT de razonamiento, SFT de uso de herramientas, DPO, fusión de pesos y dos ventanas de aprendizaje por refuerzo (W1a y W2).

El problema que aborda es la falta de modelos abiertos con competencia real en las lenguas europeas (36 idiomas declarados), razonamiento matemático paso a paso y uso de herramientas en formato estructurado. Este checkpoint, correspondiente al paso 160 de la ventana RL W2, es la versión recomendada por el autor dentro de su linaje y sustituye a la release pública anterior `oellm-9b-256k-stage5-a4b-tool-rl-step48`. Incorpora dos modos de inferencia en un mismo modelo: un modo directo por defecto y un modo de razonamiento opcional (`enable_thinking=True`).

Es relevante ahora porque documenta de forma reproducible cada etapa del pipeline (datos, verificadores, programa de RL) y publica evaluaciones por dominio, incluyendo comparativas con Qwen3-8B y Apertus-8B-Instruct. El autor advierte explícitamente de que no es un asistente terminado, sino un artefacto para inspección y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3, embeddings no atados (untied), RoPE con theta = 64M |
| Parametros totales | 9.101.947.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, sv, da, fi, pl, cs, sk, hu, ro, bg, el, uk, hr, sl, et, lv, lt (24 declarados en la model card; las evaluaciones EUROPA cubren 36 lenguas europeas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9B parámetros con la arquitectura de Qwen3, vocabulario de 263.168 tokens y embeddings de entrada y salida no compartidos. La ventana de contexto de 256K se consigue mediante RoPE con theta = 64M. El checkpoint deriva del modelo base `oellm-9b-256k-theta64m-prelude-anneal300b`, entrenado con un preludio y un anneal de 300B tokens según indica su nombre.

El post-entrenamiento sigue una cadena de siete etapas: SFT de instrucciones, SFT de razonamiento, SFT de uso de herramientas, DPO, fusión de pesos, ventana de RL W1a y ventana de RL W2 (este checkpoint es el paso 160 de W2). Los datos incluyen conjuntos propios (`openeurollm-reasoning-instruct-v1`, `openeurollm-tool-use-v1`, `oellm-eu-exam-mcq-v1`, `oellm-math-rlvr`, `oellm-code-rlvr`) y datasets externos (Dolci-Instruct-DPO traducido, HelpSteer3, UltraFeedback binarizado, GSM8K, Nemotron-RL de instruction following y de uso agéntico de herramientas, y xLAM de irrelevancia). El RL emplea técnicas RVVR/GRPO/DAPO con verificadores programáticos para matemáticas y código, según los repositorios publicados. Una innovación destacable es la convivencia de modo directo y modo thinking en un solo juego de pesos, con trazas de razonamiento que tras el RL se cierran en menos de 6K tokens en el 86 % de los casos.

## Capacidades

- Generación de texto conversacional multi-turno en 24 idiomas europeos declarados (36 en las evaluaciones EUROPA).
- Razonamiento matemático paso a paso mediante modo thinking opcional (`enable_thinking=True`), con mayor precisión que el modo directo.
- Modo directo por defecto para respuestas rápidas sin traza de razonamiento.
- Tool calling y function calling en formato Qwen3/Hermes: `<tools>` en el turno de sistema, `<tool_call>{…}</tool_call>` en las respuestas y `<tool_response>` para los resultados.
- Decisión de llamada a herramienta o abstención (incluye datos de irrelevancia para no invocar herramientas innecesarias).
- Razonamiento agéntico multi-paso y control agéntico (mejorado en EUROPA Alignment respecto a la release anterior).
- Generación de código, evaluada con HumanEval+ en modo directo y thinking.
- Comprensión lectora multilingüe (Belebele), conocimiento global (Global-MMLU), conocimiento regional europeo (INCLUDE) y gramática (MultiBLiMP), aunque estas evaluaciones figuran como en ejecución en la model card.
- Conocimiento factual europeo y tareas con documentos empresariales (facturas, tablas, contratos).

## Casos de uso

- Atención al cliente multilingüe en Europa: el modelo puede mantener conversaciones multi-turno en 24 idiomas con 256K tokens de contexto, lo que permite adjuntar historiales largos e información de producto sin truncar. La puntuación EUROPA Eval de 0.727 respalda su uso en este escenario.
- Agentes con uso de herramientas: con 0.886 de acierto en la decisión de llamada, 0.789 en nombres de herramienta y 0.972 en argumentos válidos, es adecuado para orquestar APIs en pipelines agénticos donde la validez del JSON es crítica.
- Razonamiento matemático asistido: activando `enable_thinking=True` se obtiene 0.630 en la evaluación de razonamiento paso a paso, útil para tutores educativos o verificación de cálculos con traza auditable.
- Generación de código en producción: HumanEval+ de 0.390 en modo directo permite integrarlo en asistentes de autocompletado o revisión, aunque con expectativas moderadas frente a modelos especializados en código.
- Procesamiento de documentación administrativa europea: aunque el rendimiento en documentos empresariales con aritmética multi-paso es bajo (0.376), puede emplearse para extracción y clasificación de facturas y contratos en los idiomas soportados, reservando la aritmética a herramientas externas.
- Investigación y reproducción de pipelines de RL: al publicarse el código del pipeline SFT/DPO, el plano de control de RL y los verificadores, sirve como base para experimentos académicos sobre post-entrenamiento multilingüe.
- Evaluación comparativa de modelos europeos: su cobertura de 36 lenguas en EUROPA Eval y Alignment lo hace útil como referencia en estudios de equidad lingüística.

## Benchmarks y rendimiento

Datos publicados en la model card (escala 0-1, mayor es mejor). Las celdas marcadas como "en ejecución" no tienen valor disponible.

| Dominio | Metrica | Este modelo | Release anterior (A4b) | SFT de tool-use (paso 3) |
|---|---|---|---|---|
| Chat en 36 lenguas europeas | EUROPA Eval | 0.727 | 0.670 | 0.616 |
| Seguridad y comportamiento | EUROPA Alignment | 0.717 | 0.670 | 0.642 |
| Matematicas paso a paso (thinking) | quick reasoning eval | 0.630 | 0.442 | 0.435 |
| Matematicas, respuesta directa | quick reasoning eval | 0.575 | 0.577 | 0.581 |
| Trazas de thinking cerradas en 6K tokens | proporcion | 0.860 | 0.511 | 0.511 |
| Tool calling: llamada correcta o ninguna | held-out tool check | 0.886 | 0.881 | 0.870 |
| Tool calling: nombres de herramienta correctos | held-out tool check | 0.789 | 0.784 | 0.734 |
| Tool calling: argumentos validos | held-out tool check | 0.972 | 0.969 | 0.981 |
| Codigo | HumanEval+ (modo directo) | 0.390 | 0.354 | 0.335 |
| Comprension lectora | Belebele | en ejecucion | 0.824 | 0.821 |
| Conocimiento | Global-MMLU | en ejecucion | 0.587 | 0.584 |
| Conocimiento regional | INCLUDE | en ejecucion | 0.542 | 0.539 |
| Gramatica | MultiBLiMP | en ejecucion | 0.932 | 0.930 |
| Hechos europeos (con penalizacion por adivinar) | EU factual QA | 0.280 | 0.265 | no disponible |
| Documentos empresariales | EU document tasks | 0.376 | 0.360 | no disponible |

Comparaciones citadas en la model card: Qwen3-8B obtiene 0.16 en EU factual QA (frente a 0.28 de este modelo) y 0.74 en documentos empresariales (frente a 0.38); Apertus-8B-Instruct obtiene 0.57 en EUROPA Eval; los modelos de SFT de instrucciones (0.76) y DPO (0.84) del mismo proyecto superan a este checkpoint en EUROPA Eval.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 9.101.947.904 parámetros ocupan aproximadamente 18,2 GB de pesos, por lo que se necesitan del orden de 20-24 GB de VRAM contando caché KV. En cuantización de 8 bits, unos 10-12 GB; en 4 bits, unos 6-8 GB (estimaciones a partir del tamaño del repo de 18,2 GB; no se publican cifras oficiales).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para BF16 con contexto largo; A10G 24 GB o RTX 4090 24 GB para BF16 en contextos moderados.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) con BF16 y contexto limitado, y en RTX 3090/4080 con cuantización de 8 o 4 bits. La ventana completa de 256K exige mucha más memoria de caché KV y no es viable en GPU de consumo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan variantes GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | EUROPA Eval | EU factual QA | Documentos EU | Licencia |
|---|---|---|---|---|---|---|
| oellm-9b-256k-stage5-w2-rl-step160 | 9,1B | 256K | 0.727 | 0.280 | 0.376 | Apache 2.0 |
| oellm-9b-256k-stage5-a4b-tool-rl-step48 | 9,1B | 256K | 0.670 | 0.265 | 0.360 | Apache 2.0 |
| Qwen3-8B | ~8B | no disponible | no disponible | 0.160 | 0.740 | no disponible |
| Apertus-8B-Instruct | ~8B | no disponible | 0.570 | no disponible | no disponible | no disponible |

Los modelos de SFT de instrucciones (0.76) y DPO (0.84) del mismo proyecto superan a este checkpoint en EUROPA Eval según la model card.

## Limitaciones y advertencias

- Es un research preview, no un asistente terminado; el autor lo publica para inspección y reproducción, no para uso directo en producción sin evaluación adicional.
- Calibración de rechazo baja (0.35) y grounding y seguridad (0.60) con regresión tras el DPO que no se ha recuperado.
- Elevada tendencia a adivinar: solo se abstiene en el 5 % de los casos en EU factual QA, por lo que muchas respuestas incorrectas son conjeturas seguras.
- Rendimiento débil en documentos empresariales con aritmética multi-paso (0.376 frente a 0.74 de Qwen3-8B), en parte porque el modelo traduce la palabra clave `ANSWER:`.
- Dificultades con instrucciones estrictas del tipo "responde solo con un número" en modo directo.
- Riesgo de alucinación en conocimiento factual y regional; las evaluaciones Belebele, Global-MMLU, INCLUDE y MultiBLiMP aún están en ejecución.
- Cobertura lingüística declarada de 24 idiomas en la model card, aunque las evaluaciones EUROPA cubren 36; el rendimiento fuera de las lenguas evaluadas no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y las regresiones en seguridad desaconsejan desplegarlo sin filtros y evaluaciones propias.
- No se publican variantes cuantizadas oficiales; cualquier cuantización corre por cuenta del usuario y puede alterar el comportamiento del modo thinking.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/birgermoell/oellm-9b-256k-stage5-w2-rl-step160
- Modelo base: https://huggingface.co/openeurollm/oellm-9b-256k-theta64m-prelude-anneal300b
- Release pública anterior: https://huggingface.co/birgermoell/oellm-9b-256k-stage5-a4b-tool-rl-step48
- Repositorio del pipeline de post-entrenamiento: https://github.com/BirgerMoell/qwen35-posttrain
- Repositorio del plano de control de RL: https://github.com/BirgerMoell/oellm-rlvr
- Página del proyecto: https://birgermoell.github.io/qwen35-posttrain/
