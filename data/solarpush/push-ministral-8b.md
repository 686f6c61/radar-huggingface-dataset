# solarpush/push-ministral-8b

## Resumen

`push_ministral:8b` es un modelo de decisión estructurada publicado por el usuario `solarpush` en HuggingFace, construido a partir de `mistralai/Ministral-8B-Instruct-2410` en cuantización GGUF Q4_K_M (4,57 GiB). No es un fine-tune conversacional al uso: el autor lo describe como un modelo de decisión calibrado bajo la especificación `llm-logits-v1`, en el que la salida se restringe a un conjunto cerrado de tokens de decisión (letras `A..Z`, dígitos `0..9` y el token especial `noul`) para emitir elecciones, puntuaciones o abstenerse.

La adaptación se ha realizado con la herramienta Trainaya del ecosistema Ollaya, aplicando una base de plantillas dual biorthogonal (`U` / `U_s`) y una cabeza "Option-Pointer" con kernel Fisher ARD. El resultado es un modelo pensado para tareas de clasificación, verificación y puntuación con probabilidades calibradas, no para generación libre de texto. El autor reporta un ECE agrupado de 0,046 y una precisión macro del 69,1% en el benchmark público de decisión de Ollaya (13 subconjuntos).

Su relevancia es de nicho: compite en el espacio de "LLM como clasificador calibrado" frente a baselines como `winnow:e4b`, con la ventaja de un empaquetado ligero (4,57 GiB), latencias de 94 ms p50 en una RX 9070 XT y compatibilidad con runtimes tipo Ollama. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Ministral-8B-Instruct-2410) con cabeza de decisión "Option-Pointer" calibrada sobre logits |
| Parametros totales | 8.019.808.256 (~8,02 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base es Ministral-8B-Instruct-2410) |
| Tipos de cuantizacion | GGUF Q4_K_M para el cuerpo del modelo; filas de la cabeza de decisión en Q6_K (`ttype=14`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada en el repo; ver advertencias sobre el modelo base) |
| Formato de pesos | GGUF (`model.gguf`) + `decision.json`, `calibration.json`, `ollaya_config.json` |
| Tamano del repositorio | 4,9 GB (fichero de pesos: 4,57 GiB) |
| Libreria / runtime | `gguf`; tags `ollama`, `ollaya`, `trainaya`, `endpoints_compatible` |
| Especificacion de decision | `llm-logits-v1` (tokens de `choice`, `score` y `noul`) |
| Calibracion | Vector de temperatura por tarea `[1.0, 1.0, 1.0]` |

## Arquitectura y entrenamiento

El modelo parte de `Ministral-8B-Instruct-2410`, un transformer decoder-only de aproximadamente 8.000 millones de parámetros, y conserva su tokenizador y su representación interna. Sobre esa base, Trainaya introduce una descomposición en base de plantillas dual biorthogonal (`U` / `U_s`) que define subespacios de decisión, y una cabeza "Option-Pointer" con kernel Fisher ARD que proyecta los logits del modelo sobre las opciones válidas del vocabulario de decisión. En el GGUF, esa cabeza se materializa como filas recalibradas en Q6_K para los tokens `A..Z`, `0..9`, lo que explica que el fichero结果 sea ligeramente mayor que un Q4_K_M estándar de 8B.

El paquete incluye tres artefactos auxiliares que definen el contrato de inferencia: `decision.json` (IDs de token y plantilla para `choice`, `score` y `noul`), `calibration.json` (escalado de temperatura por tarea, en este caso identidad `[1.0, 1.0, 1.0]`) y `ollaya_config.json` (metadatos de runtime). No se han publicado datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si hubo RLHF, DPO o ajuste supervisado; la información disponible solo describe el método de adaptación de la cabeza de decisión, no el corpus empleado.

La innovación técnica destacable no está en el transformer, sino en el mecanismo de salida: en lugar de generar texto y parsearlo, el modelo puntúa directamente tokens de opción, lo que permite obtener distribuciones de probabilidad comparables entre clases y una abstención explícita mediante `noul`. El benchmark reportado se evalúa con métricas de calibración (ECE agrupado y macro, Brier score) además de exactitud, lo que es coherente con ese diseño.

## Capacidades

- Clasificación de opción múltiple: selecciona una letra `A..Z` como respuesta, con probabilidad asociada extraíble de los logits.
- Puntuación ordinal: emite un dígito `0..9` para tareas de scoring tipo Likert o evaluación de calidad.
- Abstención explícita: el token `noul` permite que el modelo decline responder cuando ninguna opción es defendible, algo poco habitual en clasificadores basados en LLM.
- Calibración probabilística: el autor reporta ECE agrupado de 0,046 y ECE macro de 0,125, con escalado de temperatura configurable por tarea.
- Verificación factual y de consistencia: subconjuntos como `squad2` y `summeval-consistency` en el benchmark apuntan a detección de respuestas no soportadas y a evaluación de fidelidad de resúmenes.
- Clasificación binaria: `boolq` con 80,0% de exactitud y ECE de 0,066.
- Moderación y análisis de toxicidad: `civil_comments` con 92,0% de exactitud.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas; el modelo está diseñado para una decisión por invocación.
- Multilingüismo: no disponible; no se declaran idiomas en la model card.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Moderación de comentarios en plataformas: usar el modelo como clasificador de toxicidad y civismo con umbrales derivados de sus probabilidades calibradas (92,0% de exactitud reportada en `civil_comments`); su ECE de 0,095 en ese subconjunto permite fijar cortes operativos sin recalibración manual.
- Triaje de preguntas biomédicas: enrutar consultas de `pubmedqa` hacia revisión humana o respuesta automática según la confianza, con la opción `noul` actuando como derivación a un revisor cuando el modelo no tiene evidencia suficiente.
- Verificación de respuestas en sistemas RAG: comprobar si la respuesta generada está soportada por el contexto recuperado (equivalente a `squad2`), usando la probabilidad de la opción positiva como señal para descartar o regenerar.
- Evaluación automática de resúmenes (LLM-as-judge): puntuar la consistencia de resúmenes generados frente al documento original con escala `0..9`, aprovechando que la salida es un token de score y no texto libre, lo que simplifica el parseo en pipelines.
- Enrutamiento y guardarraíles en producción: clasificador booleano rápido (94 ms p50 en RX 9070 XT) para decidir si una petición pasa a un modelo grande, se rechaza o se escala, con la ventaja de que la abstención está modelada de forma nativa.
- Preguntas de sí/no sobre documentos: control de acceso, verificación de políticas internas o comprobación de elegibilidad, usando `boolq`-style con ECE de 0,066 para decidir cuándo confiar en la respuesta automática.
- Etiquetado semiautomático de datasets: preetiquetar grandes volúmenes con probabilidades calibradas y reservar la revisión humana para los casos cercanos al umbral o con salida `noul`.

## Benchmarks y rendimiento

Datos del Ollaya Public Decision Benchmark (`bench.ollaya.dev`, 13 subconjuntos), publicados por el autor:

| Metrica | push_ministral:8b (4,57 GiB) | winnow:e4b (6,20 GiB) |
|---|---|---|
| Exactitud macro | 69,1% | 72,2% |
| Public Skill (0-100) | 52,2 | 56,8 |
| Exactitud en `Choice` | 71,2% | 76,8% |
| Exactitud en `Noul` | 74,0% | 76,0% |
| Exactitud en `Score` | 57,3% | 58,0% |
| ECE agrupado (menor es mejor) | 0,046 | 0,083 |
| ECE macro (menor es mejor) | 0,125 | 0,133 |
| Brier score (menor es mejor) | 0,434 | 0,393 |
| Latencia p50 (RX 9070 XT) | 94 ms | 113 ms |

Subconjuntos destacados por el autor:

| Subconjunto | push_ministral:8b | winnow:e4b | Diferencia | ECE |
|---|---|---|---|---|
| civil_comments | 92,0% | 78,0% | +14,0% | 0,095 |
| pubmedqa | 68,0% | 62,0% | +6,0% | 0,094 |
| squad2 | 66,0% | 64,0% | +2,0% | 0,082 |
| summeval-consistency | 78,0% | 76,0% | +2,0% | no disponible |
| boolq | 80,0% | 80,0% | 0,0% | 0,066 |

No se han publicado resultados en benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) en la información disponible. Todas las cifras proceden del benchmark del propio autor y no han sido replicadas por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en Q4_K_M, considerando el fichero de 4,57 GiB más la caché KV (dependiente del contexto, no documentado).
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RX 7600 XT y superiores). En 6 GB el margen es ajustado.
- GPU recomendadas por el autor: RX 9070 XT como referencia de latencia (94 ms p50). Para mayor throughput, A100 o H100 si se sirve en lote, aunque el modelo está pensado para despliegue de baja latencia en local.
- Despliegue: Ollama de forma nativa (el repositorio está etiquetado como `ollama`), runtime Ollaya mediante `trainaya register --name push_ministral:8b --path . --runtime both`, y llama.cpp al ser un GGUF estándar. El tag `endpoints_compatible` sugiere compatibilidad con APIs estilo OpenAI.
- vLLM y TGI: no confirmado para este Q4_K_M; el soporte de GGUF K-quants en vLLM es experimental. Si se necesita servir a gran escala, conviene convertir a safetensors y reimplementar la cabeza de decisión.
- Latencia: 94 ms p50 medida en RX 9070 XT por el autor. No se han publicado datos de throughput (tokens/s o decisiones/s) ni latencias p95/p99.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud macro (bench Ollaya) | ECE agrupado | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| push_ministral:8b | 8,02 B | no disponible | 69,1% | 0,046 | 4,57 GiB | Apache 2.0 (declarada) | GGUF en HF, 0 descargas |
| winnow:e4b | no disponible | no disponible | 72,2% | 0,083 | 6,20 GiB | no disponible | citado como baseline |
| Ministral-8B-Instruct-2410 | ~8 B | no disponible en esta ficha | no evaluado en este bench | no evaluado | safetensors | licencia de investigacion de Mistral AI (a verificar) | ampliamente disponible |

Frente a `winnow:e4b`, `push_ministral:8b` pierde en exactitud macro (69,1% vs 72,2%) y en Brier score (0,434 vs 0,393), pero gana en calibración (ECE agrupado 0,046 vs 0,083), en latencia (94 ms vs 113 ms) y en tamaño (4,57 GiB vs 6,20 GiB). Frente a su modelo base, la comparación directa no es posible: Ministral-8B-Instruct-2410 es un modelo instructivo de propósito general y no está evaluado en el benchmark de decisión de Ollaya.

## Limitaciones y advertencias

- Validación únicamente del autor: todos los benchmarks proceden de `bench.ollaya.dev`, el benchmark del propio ecosistema Ollaya. No hay resultados independientes ni comparaciones en leaderboards públicos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. No hay evidencia de uso en producción.
- Salida restringida: el modelo no está pensado para generación libre de texto; fuerza la respuesta a tokens de opción. Usarlo como chat producirá resultados degradados.
- Idiomas no declarados: no se especifica qué lenguas cubre la cabeza de decisión ni si el comportamiento calibrado se mantiene fuera del inglés, que es el idioma dominante en los subconjuntos del benchmark.
- Calibración dependiente de la distribución: el ECE reportado se ha medido en 13 subconjuntos concretos. Fuera de ellos, la calibración puede degradarse; el vector de temperatura es identidad (`[1.0, 1.0, 1.0]`), por lo que no hay un reajuste adicional por tarea.
- Discrepancia de licencia: la model card declara Apache 2.0, pero el modelo base `Ministral-8B-Instruct-2410` se distribuye bajo licencia de investigación de Mistral AI. Antes de un uso comercial conviene verificar que la licencia del derivado es efectivamente compatible; este punto no queda resuelto en la información disponible.
- Riesgo de alucinación: reducido en el sentido de que la salida es una opción cerrada, pero el modelo puede seleccionar una opción incorrecta con alta confianza; el ECE de 0,125 macro indica que en algunos subconjuntos la confianza está peor ajustada que la media.
- Dependencia del runtime: el contrato de decisión requiere respetar `decision.json` y `ollaya_config.json`; usar el GGUF con un runtime que no aplique la plantilla de decisión invalida el comportamiento calibrado.
- Sin datos de sesgo demográfico ni de seguridad; el subconjunto `civil_comments` mide civismo, no equidad entre grupos.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; la ficha se basa exclusivamente en la model card y los metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/solarpush/push-ministral-8b
- Modelo base: https://huggingface.co/mistralai/Ministral-8B-Instruct-2410
- Repositorio de Trainaya: https://github.com/ollaya/trainaya
- Benchmark publico de Ollaya: https://bench.ollaya.dev

No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
