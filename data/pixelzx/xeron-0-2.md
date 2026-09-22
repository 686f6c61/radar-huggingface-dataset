# PIXELZX/XERON-0.2

## Resumen

XERON-0.2 es un modelo de decisión tipada ("System 1") desarrollado por PIXELZX, presentado como la segunda entrega de la familia XERON. No es un modelo generativo: recibe un estado en lenguaje natural y un conjunto de preguntas tipadas (`choice`, `score` y `noul` o booleano) y devuelve, en una única pasada forward, probabilidades calibradas para cada decisión. Al no generar texto, no puede alucinar contenido ni producir esquemas malformados, lo que lo sitúa en una categoría distinta a la de los LLM conversacionales.

Técnicamente es un fork de XERON-0.1, a su vez un fine-tune del checkpoint multilingüe de la librería Laya de Convai Innovations, con backbone `jhu-clsp/mmBERT-base`. Cuenta con 321.908.998 parámetros (~322 M), un repositorio de 0,7 GB en safetensors y una ventana de entrenamiento de 4096 tokens. La novedad de la versión 0.2 es una pasada adicional de fine-tuning sobre datos de decisión de estilo JevBench: 54.000 secuencias procedentes del corpus Jevify `jev-bench` (22 datasets públicos reformateados como preguntas System One) más el conjunto inglés de decisiones tipadas, entrenadas durante 2 épocas en ~0,7 h sobre una A100 de 40 GB en bf16, con calibración de temperatura post-hoc `[0.96, 1.098, 0.569]`.

Su relevancia actual es doble: por un lado, mejora a XERON-0.1 en precisión global en JevBench (0.541 frente a 0.468) y supera ligeramente al checkpoint tuneado del propio fabricante de Laya (`laya-typed-decisions`, 421 M) en esa misma métrica, con 100 M de parámetros menos y soporte multilingüe; por otro, ilustra un compromiso explícito entre precisión y fidelidad a distribuciones blandas (el TVD empeora de 0.389 a 0.465), un detalle poco habitual de documentar en una model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder no autorregresivo sobre backbone `jhu-clsp/mmBERT-base` con cabezas de decisión tipadas; etiquetado por el autor como "decision-model" / "system-1" |
| Parámetros totales | 321.908.998 (~322 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento declarada) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | en, ko, multilingual (etiquetas de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Librería de carga | `laya` |
| Pipeline declarado | text-classification |
| Modelos base | PIXELZX/XERON-0.1, jhu-clsp/mmBERT-base |
| Tamaño del repositorio | 0,7 GB |
| Límite de opciones por cabeza | `head_max_len=256` |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder no autorregresivo con cabezas de decisión tipadas. En lugar de decodificar tokens, proyecta el estado de entrada sobre tres tipos de respuesta: `choice` (selección entre opciones discretas), `score` (puntuación sobre niveles definidos, por ejemplo una escala de urgencia de 0 a 3) y `noul` (booleano). La inferencia se resuelve en una sola pasada forward, sin bucle de decodificación, y las salidas se devuelven como probabilidades. El backbone procede del checkpoint multilingüe de Laya, construido sobre `jhu-clsp/mmBERT-base`; la cabeza de la familia Laya impone un máximo de 256 tokens de texto por conjunto de opciones.

El entrenamiento de la versión 0.2 consistió en un fine-tune sobre 54.000 secuencias de datos de decisión de estilo JevBench, extraídas del corpus Jevify `jev-bench` (22 datasets públicos reformateados como preguntas System One: emoción, NLI, MCQ, sentimiento y rúbricas de valoración, sí/no con fundamento, paráfrasis, toxicidad, spam y razonamiento implícito) más el conjunto inglés de decisiones tipadas. Se ejecutaron 2 épocas en aproximadamente 0,7 horas sobre 1×A100 40 GB en bf16. Posteriormente se aplicó calibración de temperatura post-hoc con parámetros `[0.96, 1.098, 0.569]`. No se menciona en la información disponible el uso de RLHF, DPO ni de decodificación especulativa, y tampoco se detalla la composición exacta ni el número total de tokens de entrenamiento del backbone original.

## Capacidades

- Decisión tipada sobre un estado textual en una única pasada forward: preguntas de tipo `choice`, `score` y `noul` (booleano), con salida de probabilidades calibradas por temperatura.
- Clasificación de texto en tareas reformuladas como preguntas: emoción, análisis de sentimiento, valoración con rúbricas, NLI, paráfrasis, toxicidad, spam y sí/no con fundamento.
- Razonamiento implícito de un solo paso ("System 1"): no hay cadena de pensamiento ni multi-step reasoning explícito.
- Calibración de confianza: el modelo reporta ECE y Brier en el benchmark `typed-decisions`, con ECE de 0.2104 en ese conjunto y 0.187 en el nivel hard de JevBench.
- Capacidad multilingüe heredada del backbone mmBERT, con etiquetas declaradas `en`, `ko` y `multilingual`.
- Integración vía la librería `laya` (`pip install laya`), con una API de `agent.predict(state, questions)` que devuelve un diccionario de respuestas.
- No soporta generación de texto, tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking; no hay evidencia de tales capacidades en la información disponible.

## Casos de uso

- Moderación de contenido automatizada: el modelo se ha entrenado explícitamente con datos de toxicidad y spam, y devuelve una probabilidad calibrada en lugar de una etiqueta dura, lo que permite fijar umbrales de revisión humana según el coste del falso positivo.
- Cumplimiento de políticas internas: dada una política en texto y un caso concreto, el tipo `noul` responde si una acción está permitida. El ejemplo de la propia model card (reembolsos que exigen recibo y compra en los últimos 30 días) es directamente desplegable como comprobador previo en un flujo de atención al cliente.
- Triaje y priorización de tickets: con preguntas de tipo `score`, el modelo puede asignar niveles de urgencia (por ejemplo, "0 — sin presión" a "3 — crítico") sobre el texto de una incidencia, alimentando un sistema de colas sin necesidad de un LLM generativo.
- Enrutado de decisiones en pipelines de agentes: al devolver una elección discreta con probabilidad asociada, encaja como nodo de decisión determinista en un grafo de agentes, donde el LLM generativo redacta y XERON-0.2 decide.
- Verificación de implicación textual (NLI) en control de calidad documental: comprobar si un resumen se sigue lógicamente de un documento fuente, aprovechando que el modelo fue entrenado con datos de NLI reformateados.
- Detección de paráfrasis y deduplicación semántica: comparar pares de textos para decidir si son equivalentes, útil en curación de datasets y en sistemas de búsqueda interna.
- Clasificación con rúbricas de valoración: asignar puntuaciones en encuestas, revisiones o evaluaciones con criterios definidos, con la ventaja de que la salida es una distribución calibrada y no una etiqueta aislada.
- Filtrado previo de bajo coste: al ser un modelo de 322 M con una sola pasada forward, puede actuar como primera etapa que descarta o etiqueta casos triviales antes de invocar un modelo mayor.

## Benchmarks y rendimiento

JevBench v1.3 (solo ítems públicos, subconjunto emparejado: 231 de 534 decisiones; el nivel de jueces está completamente retenido). El autor advierte que estos resultados no son directamente comparables con los del ranking publicado. Todas las filas se ejecutaron sobre los mismos 231 ítems con el harness oficial (`fstandhartinger/jevbench`, adaptador `laya_local`).

| Sistema | easy (48) | standard (72) | hard (111) | total (231) | Intelligence |
|---|---|---|---|---|---|
| Jev 1.13.0 (TypeSafe, API) | 1.000 | 0.986 | 0.730 | 0.866 | 82.2 |
| XERON-0.2 | 0.979 | 0.583 | 0.324 | 0.541 | 34.1 |
| laya-typed-decisions (Convai, 421 M, tuned) | 0.979 | 0.653 | 0.270 | 0.537 | 38.0 |
| XERON-0.1 | 0.875 | 0.444 | 0.306 | 0.468 | 23.3 |
| laya-multilingual (base, sin tune) | 0.896 | 0.403 | 0.324 | 0.468 | 21.5 |

Comparativa entre XERON-0.1 y XERON-0.2 (mismo harness):

| Métrica | 0.1 | 0.2 | Δ |
|---|---|---|---|
| JevBench global (231) | 0.468 | 0.541 | +7.3 %p |
| Nivel standard | 0.444 | 0.583 | +13.9 %p |
| Nivel easy | 0.875 | 0.979 | +10.4 %p |
| Nivel hard | 0.306 | 0.324 | +1.8 %p |
| typed-decisions test (400 casos) | 0.700 | 0.713 | +1.3 %p |
| Brier (typed-decisions) | 0.449 | 0.424 | −0.025 |
| score MAE (typed-decisions) | 0.421 | 0.373 | −0.049 |
| ECE nivel hard | 0.211 | 0.187 | −0.024 |
| Fidelidad probabilística nivel hard (TVD) | 0.389 | 0.465 | +0.076 (empeora) |

Benchmark `typed-decisions` (`LocalLLaMA/typed-decisions`, split test, 400 casos / 1.400 decisiones, GPU):

| Modelo | choice acc | soft acc | Brier | ECE | score MAE |
|---|---|---|---|---|---|
| XERON-0.2 | 0.7133 | 0.5353 | 0.4242 | 0.2104 | 0.3725 |
| XERON-0.1 | 0.7000 | 0.5171 | 0.4493 | 0.2143 | 0.4213 |
| laya-typed-decisions | 0.7333 | 0.4460 | 0.4669 | 0.2380 | 0.2963 |

Lectura de los datos aportados: XERON-0.2 supera a `laya-typed-decisions` en precisión global de JevBench (0.541 frente a 0.537) y en el nivel hard (0.324 frente a 0.270), y gana en `soft acc`, Brier y ECE en `typed-decisions`, pero pierde frente a ese mismo modelo en `choice acc` (0.7133 frente a 0.7333) y en `score MAE` (0.3725 frente a 0.2963). No se han publicado resultados de benchmarks en la información disponible para tareas generativas, de código o matemáticas, porque el modelo no las cubre.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo teórico a partir de 321.908.998 parámetros): ~1,29 GB en fp32, ~0,64 GB en fp16/bf16, ~0,32 GB en int8 y ~0,16-0,20 GB en 4 bits. Hay que sumar el overhead de activaciones, tokenizador y runtime, que depende del tamaño de lote y de la longitud de entrada (hasta 4096 tokens).
- Entrenamiento documentado: 1×A100 40 GB en bf16 durante ~0,7 h para el fine-tune completo (2 épocas sobre 54.000 secuencias).
- Cabe sobradamente en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo en precisión completa. También es viable en CPU para cargas de baja concurrencia.
- A100/H100 solo serían necesarias para reentrenamiento, ampliación de contexto o lotes muy grandes; no para inferencia estándar.
- Opciones de despliegue: la vía documentada es la librería `laya` (`pip install laya` + `laya.load("PIXELZX/XERON-0.2")`) y el script `scripts/evaluate.py` del repositorio. No hay información disponible sobre exportación a ONNX, TensorRT, GGUF, vLLM, TGI, Ollama o llama.cpp; además, vLLM y TGI están orientados a decodificación autorregresiva y no encajan con un modelo de decisión no autorregresivo.
- Latencia y throughput: no disponibles como cifra medida. Cualitativamente, al no haber bucle de decodificación, la latencia equivale a una única pasada forward del encoder y escala con la longitud de la entrada hasta el límite de 4096 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | JevBench global (231) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| XERON-0.2 | 322 M | en, ko, multilingual | 4096 tokens | 0.541 | Apache-2.0 | Pesos abiertos en HuggingFace (safetensors) |
| XERON-0.1 | 322 M | en, ko, multilingual | 4096 tokens | 0.468 | Apache-2.0 | Pesos abiertos en HuggingFace |
| laya-typed-decisions (Convai) | 421 M | en (según la model card del autor) | no disponible en la información | 0.537 | Apache-2.0 (Laya) | Pesos abiertos en HuggingFace |
| laya-multilingual (base, sin tune) | ~322 M (checkpoint base) | multilingual | no disponible en la información | 0.468 | Apache-2.0 | Pesos abiertos en HuggingFace |
| Jev 1.13.0 (TypeSafe) | no disponible | no disponible | no disponible | 0.866 | propietaria (API) | Solo vía API, no hay pesos |

Puntos clave de la comparación: XERON-0.2 iguala o supera al checkpoint tuneado del fabricante de Laya en precisión global de JevBench con menos parámetros y cobertura multilingüe, pero queda por detrás en `choice acc` y `score MAE` del benchmark `typed-decisions`. Jev 1.13.0, el sistema de referencia, juega en otra liga (0.866 global, 82.2 de Intelligence) y no es una alternativa de pesos abiertos. Para el resto de filas no hay datos suficientes sobre licencia del dataset, contexto o idiomas efectivos.

## Limitaciones y advertencias

- No genera texto. Cualquier caso de uso que requiera redacción, resumen o diálogo libre queda fuera del alcance del modelo; su salida es siempre una decisión tipada con probabilidad.
- Ventana de 4096 tokens en entrenamiento. Los documentos de política extensos o estados muy largos requieren ampliar `CTX_CAP` y reentrenar.
- Límite de opciones: la cabeza de la familia Laya usa `head_max_len=256`, de modo que las tareas con muchas alternativas (por ejemplo, 77 o 151 intenciones) ven truncado el texto de las opciones y el rendimiento cae en picado. Las configuraciones de ese tipo se excluyeron del entrenamiento, así que el modelo no está preparado para ellas.
- Brecha grande en el nivel hard de JevBench: 0.324 frente a 0.730 de Jev 1.13.0. El autor atribuye la diferencia a la falta de rúbricas largas y ambiguas escritas por humanos en los datos de entrenamiento.
- La fidelidad probabilística empeora respecto a 0.1: el TVD en el nivel hard pasa de 0.389 a 0.465. Si se necesitan distribuciones blandas que reflejen desacuerdo humano, conviene usar XERON-0.1 o añadir datos de etiquetas suaves.
- Riesgo de alucinación: estructuralmente nulo en cuanto a texto inventado, porque no hay generación. El riesgo real es de decisión errónea o de exceso de confianza en casos fuera de distribución, no de contenido fabricado.
- Idiomas: aunque el modelo declara `en`, `ko` y `multilingual`, los datos de fine-tune documentados son mayoritariamente en inglés (conjunto inglés de decisiones tipadas y datasets públicos de JevBench). No hay evidencia de rendimiento evaluado en coreano; el soporte de ese idioma procede del backbone mmBERT, no de una validación específica.
- Sesgos: no se documenta ningún análisis de sesgo. El fine-tune sobre corpus de toxicidad y spam puede heredar los sesgos de anotación de esos datasets (por ejemplo, sobrerrepresentación de determinados registros lingüísticos como tóxicos).
- Licencia: los pesos son Apache-2.0, pero los datos de `jev-bench` tienen licencias mixtas y su manifiesto debe revisarse antes de un uso comercial. Los modelos base (Laya y mmBERT) también son Apache-2.0, según la información disponible.
- Madurez: 0 descargas y 0 likes en HuggingFace en la fecha de creación, sin validación independiente de la comunidad. Los resultados publicados son del propio autor y sobre un subconjunto de 231 ítems públicos de JevBench, no comparables directamente con el ranking oficial.
- Contexto de evaluación limitado: no hay benchmarks de rendimiento en producción (latencia, throughput, estabilidad con lotes grandes) ni pruebas adversariales documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PIXELZX/XERON-0.2
- Versión anterior: https://huggingface.co/PIXELZX/XERON-0.1
- Modelo base Laya (Convai Innovations): https://huggingface.co/convaiinnovations/laya
- Backbone mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset Jevify jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio de código y scripts de reproducción: https://github.com/PIXELZX0/XERON
- Harness oficial de JevBench: https://github.com/fstandhartinger/jevbench

Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los dominios recuperados (Temu y agregadores comerciales) no guardan relación con XERON-0.2 ni con la familia Laya, por lo que no se incluyen como fuentes.
