# AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-MLX

## Resumen

AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-MLX es un derivado del modelo NeoHorse-1-9B de TokenRhythm, que a su vez es un post-entrenamiento de Qwen/Qwen3.5-9B. Se trata de un modelo causal de lenguaje denso de 8.953.801.728 parametros (unos 8,95B), publicado en formato BF16 y distribuido por AMAImedia como parte de su plataforma NOESIS de automatizacion de doblaje multilingue. Sobre el checkpoint de NeoHorse-1-9B se ha aplicado una abliteracion (eliminacion de la direccion de rechazo) mediante la herramienta Heretic v1.4.0, lo que reduce las negativas del modelo original de 97/100 a 18/100 con una divergencia KL de 0,0181 respecto al modelo de partida.

El modelo base NeoHorse-1-9B se presenta como un prototipo inicial en la ruta hacia la automejora recursiva (RSI, por sus siglas en ingles): fue post-entrenado especificamente para arneses de agentes basados en texto, uso de herramientas, codigo y seguimiento de instrucciones, con tecnicas que las etiquetas del repositorio identifican como destilacion, SFT, RL con GSPO, fusion de LoRA con DARE-TIES y prediccion multi-token (MTP). El resultado es un modelo orientado a tareas agenticas y de razonamiento, no a un chatbot generico.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de cadena de derivacion (Qwen3.5-9B -> NeoHorse-1-9B -> version abliterada con Heretic -> repack NOESIS en BF16), habitual en el ecosistema abierto. Por otro, advierte de que el repositorio tiene cero descargas y cero likes en el momento de la consulta, que solo incluye pesos de lenguaje (sin vision) y que su licencia Apache-2.0 convive con una alineacion de seguridad deliberadamente degradada, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only denso, derivado de Qwen3.5-9B (el repositorio contiene unicamente pesos de lenguaje; los pesos de vision no estan incluidos) |
| Parametros totales | 8.953.801.728 (aproximadamente 8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 en el repositorio publicado; no se distribuyen versiones GGUF ni cuantizaciones de menor precision en este repositorio |
| Idiomas soportados | 112 idiomas declarados: en, ru, zh, vi, kk, ja, af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gn, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, jv, ka, kam, kea, km, kmr, kn, ko, ky, lb, lg, ln, lo, lt, luo, lv, mi, mk, ml, mn, mr, ms, mt, mvy, my, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, qxp, ro, rw, sd, sk, skr, sl, sn, so, sr, sv, sw, ta, te, tg, th, ti, tk, tr, ug, uk, umb, ur, uz, wo, xh, yo, yue, zu |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en BF16 (la etiqueta del repositorio indica `safetensors`; el identificador del modelo incluye "BF16-MLX", lo que sugiere tambien una variante o empaquetado orientado a MLX para Apple Silicon) |
| Tamano del repositorio | 23,0 GB |
| Biblioteca declarada | transformers (etiquetas adicionales: text-generation-inference) |
| Modelos base | Qwen/Qwen3.5-9B y TokenRhythm/NeoHorse-1-9B |
| Autor / organizacion | AMAImedia (fundador: Ilia Bolotnikov) |
| Fecha de creacion en HuggingFace | 2026-09-12 (fecha de lanzamiento declarada en la model card: 2026-09-07) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only denso de aproximadamente 8,95B de parametros, heredado de Qwen3.5-9B. El checkpoint publicado por TokenRhythm, NeoHorse-1-9B, se describe como un modelo causal de 9B post-entrenado para arneses de agentes basados en texto, uso de herramientas, codigo y seguimiento de instrucciones. El repositorio original incluia pesos multimodales (vision), pero esta version es un repack de solo texto: el autor indica explicitamente que el reempaquetado cambia la configuracion y los nombres de las claves de los tensores, sin modificar los valores de los tensores ya ajustados.

El proceso de post-entrenamiento combina, segun las etiquetas y la documentacion disponible, destilacion, SFT, aprendizaje por refuerzo con GSPO, fusion de adaptadores LoRA mediante DARE-TIES y prediccion multi-token (MTP). La innovacion declarada por TokenRhythm es un "routing harness" orientado a la automejora recursiva: el sistema asigna tareas a un pool heterogeneo de modelos, registra las interacciones con herramientas y sus resultados, estima la demanda de capacidad por habilidad y utiliza retroalimentacion a nivel de capacidad para orientar el entrenamiento posterior. Este derivado concreto anade una segunda etapa: la abliteracion con Heretic v1.4.0, que modifica las proyecciones de atencion y de la MLP para suprimir la direccion de rechazo, con los parametros declarados en la model card (`direction_index` 16,33; `attn.o_proj.max_weight` 1,48; `mlp.down_proj.max_weight` 1,44, entre otros).

## Capacidades

- Generacion de texto conversacional en mas de 100 idiomas declarados, con especial atencion a contextos multilingues derivados de la plataforma de doblaje NOESIS.
- Razonamiento explicito y distilled reasoning, orientado a tareas de tipo "thinking" previas a la respuesta.
- Codigo y asistencia de programacion, con etiquetas explicitas de `coding` e `instruction-following`.
- Matematicas y STEM, segun las etiquetas `math` y `stem` del repositorio.
- Tool calling y function calling: el modelo fue post-entrenado para arneses de agentes basados en texto y declara soporte de `tool-use` y `function-calling`.
- Flujos agenticos multi-paso: la etiqueta `agentic` y el diseno del routing harness apuntan a ejecucion de tareas encadenadas con herramientas.
- Generacion sin restricciones de contenido (abliterated / decensored / uncensored): las negativas medidas bajan de 97/100 a 18/100 respecto al modelo original.
- Compatibilidad declarada con text-generation-inference como backend de servicio.
- No incluye capacidades de vision: los pesos multimodales del modelo base fueron retirados en el repack.

## Casos de uso

- Doblaje y localizacion automatizada: el modelo nace dentro de la plataforma NOESIS Professional Multilingual Dubbing Automation de AMAImedia, y su cobertura declarada de 112 idiomas permite traducir, adaptar y reescribir guiones manteniendo el registro del hablante.
- Atencion al cliente multilingue: con soporte de function calling puede consultar sistemas de tickets o bases de conocimiento y responder en el idioma del usuario dentro de un mismo hilo conversacional.
- Agentes de automatizacion con herramientas: al estar post-entrenado para tool use y razonamiento en varios pasos, encaja en orquestadores que encadenan busquedas, llamadas a API y transformaciones de datos.
- Asistente de programacion en pipelines de CI/CD: generacion y revision de codigo, explicacion de errores de build y propuestas de parches integradas como paso de un flujo automatizado.
- Generacion de datos sinteticos y destilacion: su origen (destilacion y RL) y su sesgo reducido a la negativa lo hacen util para producir corpus de entrenamiento o evaluacion en dominios donde el modelo base rechazaria la peticion.
- Tutoria y resolucion de problemas de matematicas y STEM: las etiquetas `math` y `stem` sugieren uso en explicaciones paso a paso y verificacion de derivaciones.
- Escritura creativa y ficcion sin filtros de contenido: la abliteracion reduce drasticamente los rechazos, lo que resulta adecuado para narrativa adulta o temas sensibles, siempre con supervision humana.
- Despliegue local en Apple Silicon: el identificador del repositorio incluye "MLX" y el formato BF16, lo que apunta a ejecucion en equipos con memoria unificada de Apple mediante MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). La model card unicamente aporta las metricas de la abliteracion con Heretic:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0181 | 0 (por definicion) |
| Rechazos (de 100 peticiones) | 18/100 | 97/100 |

| Parametro de abliteracion | Valor |
|---|---|
| direction_index | 16,33 |
| attn.o_proj.max_weight | 1,48 |
| attn.o_proj.max_weight_position | 19,08 |
| attn.o_proj.min_weight | 1,46 |
| attn.o_proj.min_weight_distance | 16,49 |
| mlp.down_proj.max_weight | 1,44 |
| mlp.down_proj.max_weight_position | 18,83 |
| mlp.down_proj.min_weight | 1,43 |
| mlp.down_proj.min_weight_distance | 13,39 |

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan aproximadamente 17,9 GB (8,95B parametros x 2 bytes), por lo que se necesitan del orden de 20-24 GB de memoria para pesos mas cache KV y activaciones con contextos moderados. El repositorio ocupa 23,0 GB en disco.
- GPU recomendadas: NVIDIA A100 (40 GB u 80 GB) y H100 para servicio concurrente; RTX 4090 o RTX 3090 (24 GB) para BF16 en un unico dispositivo con contexto limitado.
- Compatibilidad con GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) para BF16. En GPUs de 8-16 GB no cabe en BF16 y este repositorio no distribuye cuantizaciones GGUF ni de 4/8 bits; habria que generarlas por cuenta propia.
- Apple Silicon: el identificador del modelo incluye "MLX", lo que indica soporte previsto para memoria unificada de Apple (equipos con 32 GB o mas para BF16).
- Opciones de despliegue: transformers (biblioteca declarada), text-generation-inference (etiqueta `text-generation-inference`) y MLX segun el propio nombre del repositorio. No se mencionan vLLM, llama.cpp ni Ollama en la informacion disponible, y no hay ficheros GGUF publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (de 100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-MLX (este modelo) | 8,95B | No disponible | 18/100 | Apache-2.0 | HuggingFace, BF16 |
| TokenRhythm/NeoHorse-1-9B | 9B | No disponible | 97/100 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la informacion proporcionada | No disponible | 97/100 (referido como "modelo original" en la model card) | No disponible en la informacion proporcionada | HuggingFace |
| Dingdust/NeoHorse-1-9B-heretic | No disponible | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones de contexto para los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, comportamiento de rechazo, licencia y disponibilidad. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre sus alternativas.

## Limitaciones y advertencias

- Modelo abliterado: la supresion de la direccion de rechazo reduce las negativas de 97/100 a 18/100, lo que implica una degradacion deliberada de la alineacion de seguridad. Puede generar contenido danino, ilegal o sensible si no se aplican filtros externos.
- Deriva respecto al modelo original: la divergencia KL declarada es de 0,0181, lo que indica un cambio medible en la distribucion de salida que puede afectar a la calidad en tareas distintas de las evaluadas.
- Riesgo de alucinacion: no hay datos de evaluacion de veracidad ni de benchmarks publicados, por lo que la fiabilidad factual no esta caracterizada.
- Sin pesos de vision: el repositorio es un repack de solo texto del modelo base, de modo que cualquier caso de uso multimodal queda fuera de alcance.
- Contexto no documentado: la longitud de contexto no se especifica, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Idiomas declarados frente a idiomas realmente evaluados: la model card lista 112 idiomas, pero no aporta metricas por idioma, por lo que el rendimiento en lenguas de bajos recursos (por ejemplo, ast, ceb, kam, kea, luo, mvy, nso, umb) no esta verificado.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia; es un derivado de comunidad sin validacion independiente.
- Procedencia y trazabilidad: el modelo encadena al menos tres derivaciones (Qwen3.5-9B -> NeoHorse-1-9B -> abliteracion Heretic -> repack NOESIS), lo que complica el cumplimiento estricto de la licencia Apache-2.0 y la atribucion de los pesos originales.
- Nombre y contenido potencialmente inconsistentes: el identificador incluye "MLX" mientras la biblioteca declarada es transformers y los ficheros anunciados son safetensors; conviene verificar el contenido real del repositorio antes de integrarlo.
- Sin evaluacion de sesgos: no se aportan analisis de sesgo demografico, politico o cultural, agravado por el efecto de la abliteracion sobre los comportamientos de rechazo.

## Enlaces

- Modelo en HuggingFace: [AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-MLX](https://huggingface.co/AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-MLX)
- Modelo base (ajuste): [TokenRhythm/NeoHorse-1-9B](https://huggingface.co/TokenRhythm/NeoHorse-1-9B)
- Modelo base (original): [Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- Repositorio Heretic citado: [Dingdust/NeoHorse-1-9B-heretic](https://huggingface.co/Dingdust/NeoHorse-1-9B-heretic)
- Herramienta de abliteracion: [Heretic v1.4.0](https://heretic-project.org)
- Repositorio GitHub de NeoHorse: [https://github.com/TokenRhythm/NeoHorse](https://github.com/TokenRhythm/NeoHorse)
- Informe tecnico de NeoHorse: [Technical Report NeoHorse v1 (PDF)](https://github.com/TokenRhythm/NeoHorse/blob/main/TechnicalReport_NeoHorse_v1.pdf)
- Web de TokenRhythm: [https://tokenrhythm.ai/](https://tokenrhythm.ai/)
- HuggingFace de TokenRhythm: [https://huggingface.co/TokenRhythm](https://huggingface.co/TokenRhythm)
- Twitter/X de TokenRhythm: [https://x.com/opensquilla](https://x.com/opensquilla)
- Web de AMAImedia: [https://amaimedia.com](https://amaimedia.com)
- Twitter/X de AMAImedia: [https://x.com/AMAImediacom](https://x.com/AMAImediacom)
- LinkedIn de Ilia Bolotnikov: [https://www.linkedin.com/in/ilia-bolotnikov](https://www.linkedin.com/in/ilia-bolotnikov)
- Telegram de contacto: [https://t.me/djbionicl](https://t.me/djbionicl)
- Imagen de resultados de evaluacion de NeoHorse-1-9B: [9B_head_fig.jpg](https://huggingface.co/TokenRhythm/NeoHorse-1-9B/resolve/main/9B_head_fig.jpg)
- Busqueda web: no se encontraron resultados relevantes sobre este modelo; las consultas devolvieron exclusivamente documentacion sobre buenas practicas de seguridad en Azure, sin relacion con el modelo.
