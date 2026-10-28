# Sagicc/nanoGentzen-Jev-v3

## Resumen

`nanoGentzen-Jev-v3` es un modelo de decisión neuro-simbólico de 4.927.780 parámetros (4,93 M) publicado por el usuario Sagicc en Hugging Face. No es un modelo generativo de texto: la model card lo describe como un «Neuro-Symbolic Typed-Decision Engine» que combina un transformer bidireccional de política-valor (policy-value) con un núcleo determinista de verificación basado en el cálculo de secuentes intuicionista de Gentzen (LI). Su función es recibir estados estructurados en JSON, predicados numéricos o de expresión regular, reglas de política en lenguaje natural y criterios de rúbrica, y emitir decisiones tipadas verificables: juicios booleanos constructivos (`noul`), enrutamiento entre opciones (`choice`) y puntuación ordinal por niveles (`score`).

El modelo resuelve un problema acotado pero relevante en automatización de software: tomar decisiones auditables dentro de un pipeline (aprobación de transacciones, enrutado de casos, clasificación por rúbricas) donde un LLM generativo aporta opacidad y coste. La propuesta es que un transformer pequeño guíe la búsqueda de pruebas y que un kernel simbólico certifique el resultado, devolviendo un árbol de prueba formal o un diagnóstico de hechos faltantes en lugar de una respuesta en texto libre. Ofrece dos APIs: `decide` (búsqueda de prueba verificada, latencia declarada de 1-25 ms) y `system_one` (una sola pasada del transformer, ~2 ms, que devuelve una distribución epistémica de tres clases).

Es relevante ahora por su encaje en la línea de «System One Models» que TypeSafe AI popularizó con Jev (modelo propietario, acceso anticipado en septiembre de 2026), de la que este proyecto parece una reimplementación independiente y de escala nano. El atractivo práctico es la relación entre coste computacional (unos pocos MB de pesos, ejecutable en CPU) y el rendimiento declarado en el benchmark `typed-decisions`, donde el autor sitúa al modelo por encima de alternativas de 140 M, 26 B, 27 B y 35 B de parámetros. Esa comparación procede únicamente de la model card y no se ha podido contrastar de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional de política-valor (encoder) con cabecera «Span Pointer Antecedent Pivot» (máx. 32 antecedentes) y cabecera de valor epistémico de 3 clases; acoplado a un kernel simbólico determinista de cálculo de secuentes intuicionista de Gentzen (LI) |
| Parametros totales | 4.927.780 (4,93 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors sin variantes cuantizadas declaradas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura combina dos capas. La primera es una red neuronal pequeña: un transformer bidireccional con dos cabeceras especializadas. La cabecera «Span Pointer Antecedent Pivot» agrupa (`pool`) los estados ocultos de cada fórmula antecedente en el contexto Γ, delimitadas por comas, y las puntúa contra la representación del objetivo Δ mediante atención de producto escalar con escala, según la fórmula que recoge la model card: `logit(pivot_i) = ((W_q · h_Δ)^T · (W_k · h_i)) / sqrt(d_ptr) + b_i`. La segunda cabecera emite una distribución de tres clases sobre el valor epistémico intuicionista —`PROVEN_FALSE`, `INTUITIONISTIC_UNDECIDED`, `PROVEN_TRUE`— en una sola pasada, con un valor esperado de probabilidad constructiva definido como `V = P(True) + 0.5 * P(Undecided)`. La segunda capa es simbólica y no aprendida: un kernel de verificación (`kernel.py`) que ejecuta búsqueda de prueba guiada por la red (`search.py`) y certifica el árbol de prueba resultante, más un renombrado alfa biyectivo que comprime nombres de variables de empresa de más de 300 caracteres en símbolos canónicos (`P, Q, R, S, v0..v15`) antes de la tokenización y los restaura en el árbol verificado.

El entrenamiento se apoya, según los resultados de búsqueda, en el dataset `Sagicc/nanoGentzen`: un corpus sintético formal diseñado para entrenar transformers de política-valor en demostración automática de teoremas sobre lógica intuicionista (LI) y lógica clásica (LK mediante el teorema de Glivenko) con cálculo de secuentes de Gentzen. La información disponible no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco detalla la función de pérdida más allá del uso implícito de una pérdida de valor sobre las tres clases y de atención sobre los pivotes. El componente de compilación (`parser.py` y `jev_server.py`) traduce estados JSON, especificaciones de predicado (`==`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `contains`, `regex`), fórmulas simbólicas (`a & b => c`) y condicionales en lenguaje natural a secuentes de Gentzen antes de la inferencia; es una pieza de ingeniería relevante, aunque no estrictamente un mecanismo aprendido.

## Capacidades

- Emisión de juicios booleanos constructivos de tres valores (`true`, `false`, `INTUITIONISTIC_UNDECIDED`) con prueba o refutación formal y diagnóstico de hechos faltantes (`missing_facts`).
- Enrutamiento verificado entre múltiples opciones (`choice`) respaldado por derivaciones constructivas, útil para seleccionar acciones de un conjunto cerrado.
- Puntuación ordinal por niveles (`score`, por ejemplo `levels: [1, 2, 3, 4]`) con pruebas de nivel verificadas y distribuciones calibradas.
- Evaluación de predicados sobre estados JSON anidados: comparaciones numéricas, igualdad, pertenencia, subcadena y expresiones regulares.
- Interpretación de reglas de política simbólicas (`a & b => c`) y de condicionales en lenguaje natural («If X then Y»).
- Evaluación de criterios de rúbrica en texto libre o JSON mediante `compile_criteria_and_state`.
- Dos modos de inferencia: `decide` (búsqueda de prueba guiada por red más verificación formal) y `system_one` (pasada única que devuelve la distribución epistémica, la regla principal predicha y el pivote de span).
- Exposición de ambas APIs tanto en Python (`AutoModel.from_pretrained(...).decide(...)` / `.system_one(...)`) como por HTTP (`POST /v1/decide`, `POST /v1/systemone`).
- No dispone de generación de texto libre, tool calling genérico, capacidades multimodales, audio ni modo de razonamiento extendido en el sentido de los LLM generativos. El pipeline declarado en Hugging Face es `text-classification` (con etiquetas adicionales de `feature-extraction`).

## Casos de uso

- Aprobación de transacciones con traza auditable: el payload de ejemplo de la model card define predicados sobre verificación KYC, edad, banderas de sanciones y límite de importe; el modelo devuelve `approve_tx` con árbol de prueba, lo que permite adjuntar la justificación formal al expediente de cumplimiento en lugar de una respuesta en texto libre.
- Enrutado de casos a colas de trabajo: la primitiva `choice` con opciones como `auto_approve`, `manual_review` y `reject` encaja en un motor de decisión que deba seleccionar una acción de un conjunto cerrado y registrar por qué se descartaron las demás.
- Puntuación por rúbricas en evaluación interna: la primitiva `score` con niveles ordinales permite clasificar candidaturas, incidencias o respuestas abiertas con una distribución calibrada y una prueba de nivel, algo útil cuando se exige explicabilidad ante auditoría.
- Pasarela de admisión o elegibilidad de políticas: al compilar reglas de negocio escritas como condicionales en lenguaje natural a secuentes, el modelo puede evaluar si un estado cumple una política y devolver los hechos que faltan para decidir (`missing_facts`), lo que sirve para dirigir solicitudes de documentación adicional.
- Filtro previo de bajo coste en un pipeline con LLM: `system_one` clasifica en ~2 ms (según el autor) los casos trivialmente decidibles y solo los indecidibles o de alto riesgo pasan a `decide` o a un modelo mayor, reduciendo el coste por decisión.
- Verificación de precondiciones en CI/CD o en un servicio de configuración: los predicados con `regex` y comparadores numéricos permiten validar que un despliegue o una configuración cumple un conjunto de invariantes y obtener un contraejemplo cuando no se cumple.
- Docencia e investigación en lógica intuicionista: el par transformer pequeño más kernel de Gentzen sirve como banco de pruebas reproducible (4,93 M de parámetros, licencia MIT) para estudiar búsqueda de prueba guiada por red y calibración epistémica en tres valores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark `LocalLLaMA/typed-decisions` (400 casos de prueba, 2.000 decisiones). Todos los datos proceden de la model card y no se han verificado de forma independiente.

| Modelo | Params | Overall Acc ↑ | `noul` Acc ↑ | `choice` Acc ↑ | `score` Acc ↑ | `score` ±1 ↑ | Mean KL ↓ | Mean Brier ↓ | ECE ↓ |
|---|---|---|---|---|---|---|---|---|---|
| `Baseline-27B` | 27.000 M | 0,761 | 0,832 | 0,732 | 0,730 | 0,979 | 0,150 | 0,081 | — |
| `nanoGentzen-Jev-v3` (el modelo) | 4,93 M | 0,731 | 0,828 | 0,685 | 0,693 | 0,973 | 0,150 | 0,081 | 0,087 |
| `SafeDecide-140M` | 140 M | 0,728 | 0,793 | 0,692 | 0,708 | 0,974 | 0,168 | 0,089 | — |
| `JEV-35B` | 35.000 M | 0,700 | 0,778 | 0,648 | 0,680 | 0,964 | 0,214 | 0,111 | — |
| `GEV-26B-Decide` | 26.000 M | 0,522 | 0,670 | 0,517 | 0,415 | 0,833 | 0,391 | 0,193 | — |
| `JEV-27B` | 27.000 M | 0,495 | 0,680 | 0,422 | 0,410 | 0,815 | 0,431 | 0,211 | — |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni detalles sobre la metodología de evaluación más allá del número de casos y de las métricas de calibración. Las latencias declaradas (1-25 ms para `decide`, ~2 ms para `system_one`) son cifras del autor sin especificación del hardware empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 4,93 M de parámetros, los pesos ocupan del orden de 20 MB en fp32 y unos 10 MB en fp16, sin contar el overhead del runtime de PyTorch.
- GPU recomendadas: cualquiera, incluida una GPU integrada. El modelo está pensado para ejecutarse en CPU; una RTX 4090, A100 o H100 no aportan ventaja apreciable y quedarían infrautilizadas.
- Cabe en cualquier GPU de consumo, y también en Raspberry Pi o en un contenedor sin GPU. El cuello de botella, si lo hay, será el intérprete de Python y el propio kernel de búsqueda de prueba, no la memoria.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y, para el modo HTTP, el servidor incluido `jev_server.py` (`POST /v1/decide` y `POST /v1/systemone`). No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, y en sentido estricto no aplican: no es un modelo generativo autoregresivo con decodificación de tokens, sino un clasificador con búsqueda simbólica acoplada.
- Latencia y throughput: el autor declara 1-25 ms por decisión en modo `decide` y ~2 ms en modo `system_one`, sin especificar hardware ni tamaño de payload. No hay datos de throughput agregado ni de comportamiento bajo concurrencia.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Overall Acc (typed-decisions) | Disponibilidad |
|---|---|---|---|---|---|
| `nanoGentzen-Jev-v3` | 4,93 M | No disponible | MIT | 0,731 | Hugging Face, pesos abiertos |
| `SafeDecide-140M` | 140 M | No disponible | No disponible | 0,728 | Referenciado solo en la model card |
| `JEV-27B` | 27.000 M | No disponible | No disponible | 0,495 | Referenciado solo en la model card |
| `JEV-35B` | 35.000 M | No disponible | No disponible | 0,700 | Referenciado solo en la model card |
| `GEV-26B-Decide` | 26.000 M | No disponible | No disponible | 0,522 | Referenciado solo en la model card |
| Jev (TypeSafe AI) | No disponible | No disponible | Propietaria, acceso anticipado | No comparable directamente | Privado, acceso limitado desde septiembre de 2026 |

Los cuatro modelos de la comparativa (salvo el propio `nanoGentzen-Jev-v3`) aparecen únicamente citados en la tabla de la model card: no se aportan enlaces, repositorios ni fichas que permitan verificar su existencia, sus parámetros reales o sus licencias. La comparación con Jev de TypeSafe AI es contextual, no técnica: Jev es un producto propietario de una empresa distinta y este proyecto es una implementación independiente de escala nano, sin relación confirmada con el fabricante.

## Limitaciones y advertencias

- El modelo no genera texto: no sirve como asistente conversacional ni como sustituto de un LLM. Solo emite decisiones tipadas sobre un esquema de entrada predefinido; cualquier uso fuera de ese contrato requiere trabajo de compilación previo.
- Solo declara soporte de inglés (`en`), tanto en los metadatos como en el único idioma de la model card. No hay evidencia de comportamiento en castellano ni en otros idiomas, ni de robustez ante entradas multilingües.
- No se publica la longitud de contexto soportada. Dado el tamaño del modelo y la ventana de 32 antecedentes (`max_antecedents = 32`), es razonable esperar límites estrictos en el número de fórmulas y en la longitud del estado JSON, pero la cifra exacta no está disponible.
- Riesgo de alucinación estructural: en modo `system_one` la salida es una distribución del transformer sin verificación simbólica, de modo que las probabilidades pueden ser incorrectas aunque estén calibradas según el autor (ECE 0,087). Solo el modo `decide` acompaña la decisión de un árbol de prueba certificado por el kernel.
- Los resultados de benchmarks son completamente autoinformados. Las métricas Mean KL (0,150) y Mean Brier (0,081) del modelo coinciden exactamente con las del `Baseline-27B`, lo que resulta llamativo y sugiere un posible error de transcripción o de cálculo; conviene tratarlas con cautela. La ECE solo se reporta para el propio modelo, lo que impide comparar calibración con las alternativas.
- El dataset de entrenamiento es sintético y de dominio formal (secuentes de Gentzen). El comportamiento sobre estados JSON reales, con campos anidados heterogéneos o predicados ambiguos, no está documentado.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código Python arbitrario del repositorio (incluidos `kernel.py`, `search.py`, `parser.py` y `jev_server.py`). Es un riesgo de seguridad relevante en producción: conviene auditar el código antes de desplegarlo y aislarlo en un contenedor sin privilegios.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado en la misma fecha (28 de octubre de 2026): no hay evidencia de uso, mantenimiento ni validación por terceros.
- La model card está truncada en la información disponible (el ejemplo de código se corta tras `system_one`), por lo que parte de la documentación de la API `decide` no se ha podido revisar.
- Licencia MIT: permite uso comercial, modificación y redistribución con aviso de copyright, sin garantías. No obstante, al no existir términos adicionales ni evaluación de sesgos, la responsabilidad sobre decisiones automatizadas en dominios regulados (crédito, sanciones, salud) recae íntegramente en el integrador.
- No se documentan sesgos conocidos, tasas de error por subgrupo ni comportamiento ante políticas contradictorias o inconsistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sagicc/nanoGentzen-Jev-v3
- Colección nanoGentzen de Sagicc: https://huggingface.co/collections/Sagicc/nanogentzen
- Dataset nanoGentzen: https://huggingface.co/datasets/Sagicc/nanoGentzen
- Repositorio NanoJev (réplica no afiliada, con pipeline de entrenamiento paralelo): https://github.com/TianyuCodings/NanoJev
- Blog de TypeSafe AI sobre System One Models y Jev (modelo propietario de referencia, no relacionado directamente): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Entrada de Wikipedia sobre Jev: https://en.wikipedia.org/wiki/Jev_(AI_model)
