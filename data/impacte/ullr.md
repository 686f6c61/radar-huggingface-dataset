# impacte/ullr

## Resumen

ULLR es un modelo de 2.697.198.592 parámetros (≈2,7B) especializado en tool calling y uso agéntico, desarrollado por impacte como fine-tune de LiquidAI/LFM2.5-2.6B. Su propósito es servir de motor al asistente de programación nolock, con una política de comportamiento estricta: buscar en la web antes de responder a preguntas factuales, ejecutar código antes de afirmar que funciona y operar siempre con la realimentación de las herramientas. No es un modelo generalista con capacidades de tool calling añadidas, sino un modelo entrenado específicamente para no responder desde conocimiento paramétrico.

El entrenamiento parte del modelo base LFM2.5-2.6B y aplica KTO (Kahneman-Tversky Optimization) sobre pares de trayectorias, con datos de política autorados por GLM-5.3-Flash y validados de forma cruzada por un juez local Nemotron-Nano-9B. El resultado es un modelo que mejora a su base en BFCL v4 (0,825 frente a 0,781 de exactitud AST global) y que supera a variantes Qwen de 0,8B y 2B entrenadas con el mismo pipeline, con una ganancia de +33,6 puntos porcentuales sobre Qwen3.5-2B + SFT + KTO. Su relevancia actual radica en que demuestra que un modelo de menos de 3B parámetros, cuantizado a Q4_K_M en 1,7 GB, puede mantener un comportamiento agéntico verificado en producción.

La model card está publicada en inglés, el único idioma declarado, y se distribuye bajo la licencia lfm-open-license-v1.0. El repositorio ocupa 7,1 GB y está orientado a llama.cpp en formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de LiquidAI/LFM2.5-2.6B (familia LFM2); la model card no detalla la composicion de capas |
| Parametros totales | 2.697.198.592 (≈2,7B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; se documenta explicitamente Q4_K_M (1,7 GB). El resto de variantes del repo no se detallan |
| Idiomas soportados | Ingles (en) |
| Licencia | lfm-open-license-v1.0 (license: other) |
| Formato de pesos | GGUF (libreria llama.cpp). No se declara safetensors en el repositorio |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Metodo de ajuste | KTO sobre el modelo base |
| Tamano del repositorio | 7,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de indicar que ULLR es un fine-tune de LiquidAI/LFM2.5-2.6B, por lo que la composicion exacta de capas, el mecanismo de atencion y la ventana de contexto deben consultarse en la documentacion de la familia LFM2 de LiquidAI. Lo que si se detalla es el pipeline de ajuste: se parte del modelo base y se aplica una ronda de KTO sobre pares de trayectorias (completions elegidas frente a rechazadas), sin una fase previa de SFT documentada para ULLR, a diferencia de las variantes Qwen de la comparativa, que si pasaron por SFT sobre un conjunto de 296 ejemplos.

El dato diferenciador es el origen de los datos de política. Las trayectorias fueron autoradas por GLM-5.3-Flash (Z.ai) actuando como profesor, en lugar de generarse con un modelo local, para cubrir tres comportamientos sin cobertura previa: bucles de busqueda y resumen (web_search → web_fetch → resumen con citas de fuentes reales como Rust Book, MDN, el blog de React o la documentacion de Tokio), ejecucion de codigo previa a la respuesta (mediante rust_repl, con casos de sumas de primos, Fibonacci, parsing JSON/serde y una comprobacion deliberada de error de compilacion E0308) y recuperacion ante fallos de herramienta (busqueda, descarga de documentacion oficial y sintesis de pasos entre fuentes). El profesor tambien genero los pares de engagement, con respuestas de evasion en chat como completions rechazadas y respuestas de reconocimiento mas llamada a herramienta como elegidas, reconstruidas a partir de las listas de acciones ground-truth de τ-bench.

Antes del entrenamiento, cada fila fue validada de forma cruzada por Nemotron-Nano-9B ejecutado localmente como juez de política, previamente validado el mismo con 4 casos disenados (4/4 de discriminacion, incluido un caso limite de matematicas sin REPL). De las 115 filas juzgadas, 44 fueron marcadas como mal etiquetadas: 23 por expectativa incorrecta de tarea completa en una sola completion, 10 por aplicacion erronea de la política y 7 por un error real de seleccion de herramienta (uso de list_directory sobre una ruta de fichero, corregido sustituyendolo por read_file). La model card se interrumpe en el punto en que se describen los 35 avisos excesivamente estrictos del juez.

## Capacidades

- Tool calling y function calling nativo, con parseo nativo de llamadas a herramienta segun el harness oficial de evaluacion.
- Llamadas multiples y paralelas: categorias `multiple` y `parallel` de BFCL v4 con 0,925 y 0,825 de exactitud AST respectivamente.
- Politica de busqueda primero: dispara web_search ante consultas factuales y encadena web_fetch para citar fuentes.
- Ejecucion de codigo verificada: resuelve matematicas y codigo mediante rust_repl antes de reportar el resultado.
- Recuperacion ante fallos de herramienta: refina consultas o cambia de URL cuando la busqueda o la descarga fallan.
- Operacion sobre proyecto local: grep, read_file, list_directory y edit como herramientas de trabajo sobre repositorios.
- Modo agéntico multi-turno: el modelo esta disenado para funcionar dentro de un harness (nolock) con realimentacion de herramientas, no como chat aislado.
- Multilingue: no disponible; el unico idioma declarado es el ingles.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Asistente de programacion con verificacion de ejecucion: integrado en nolock, el modelo encadena grep, read_file y edit sobre un repositorio y ejecuta el codigo antes de afirmar que un cambio funciona, lo que reduce respuestas erroneas sobre resultados no comprobados.
- Atencion al cliente con fuente obligatoria: al forzar web_search y web_fetch antes de responder a consultas factuales, el modelo produce respuestas con cita de origen, util en dominios donde una afirmacion sin respaldo tiene coste legal o reputacional.
- Agente de documentacion tecnica: puede resolver dudas de instalacion y configuracion sintetizando pasos a partir de documentacion oficial descargada (Rust Book, MDN, docs de Tokio), un escenario cubierto explicitamente en los datos de entrenamiento.
- Automatizacion de tareas sobre repositorios locales: listado de directorios, lectura de ficheros y edicion acotada mediante tool calling, adecuado para pipelines internos de refactorizacion o auditoria de codigo.
- Backend de function calling en produccion: con 2,7B parametros y una cuantizacion Q4_K_M de 1,7 GB, puede desplegarse en llama.cpp u Ollama para enrutar llamadas a APIs internas en entornos con VRAM limitada.
- Evaluacion y desarrollo de harnesses agénticos: su politica de busqueda y ejecucion lo convierte en un banco de pruebas para medir exactitud de llamadas a herramienta (BFCL v4 AST) y validez de llamadas en τ-bench.
- Asistente on-premise o en el borde: al caber en GPU de consumo, es viable para despliegues locales donde no se permite enviar codigo ni consultas a servicios externos.
- Verificacion de matematicas y parsing: uso de un interprete (rust_repl) para sumas de primos, secuencias de Fibonacci y parsing JSON con serde, reportando el resultado ejecutado en lugar de uno inferido.

## Benchmarks y rendimiento

Exactitud AST en BFCL v4, con harness identico (comprobador oficial `bfcl_eval`, decodificacion greedy y parseo nativo de tool calls):

| Modelo | Parametros | Entrenamiento | simple | multiple | parallel | parallel_multi | Overall |
|---|---|---|---|---|---|---|---|
| LFM2-1.2B-Tool + SFT + KTO | 1,2B | SFT+KTO | 0,492 | 0,375 | 0,425 | 0,113 | 0,351 |
| Qwen3.5-0.8B (base) | 0,8B | — | 0,667 | 0,500 | 0,438 | 0,263 | 0,489 |
| Qwen3.5-0.8B + SFT | 0,8B | SFT | 0,667 | 0,500 | 0,438 | 0,263 | 0,489 |
| Qwen3.5-0.8B + SFT + KTO | 0,8B | SFT+KTO | 0,667 | 0,500 | 0,438 | 0,263 | 0,489 |
| Qwen3.5-2B (base) | 2B | — | — | — | — | — | — |
| Qwen3.5-2B + SFT (QLoRA) | 2B | SFT | 0,783 | 0,575 | 0,688 | 0,338 | 0,617 |
| Qwen3.5-2B + SFT + KTO | 2B | SFT+KTO | 0,783 | 0,575 | 0,688 | 0,338 | 0,617 |
| LFM2.5-2.6B (base) | 2,6B | — | 0,883 | 0,812 | 0,738 | 0,637 | 0,781 |
| ULLR (LFM2.5-2.6B + KTO) | 2,6B | KTO | 0,875 | 0,925 | 0,825 | 0,650 | 0,825 |
| ULLR Q4_K_M (cuantizado) | 2,6B | KTO + Q4 | 0,908 | 0,838 | 0,775 | 0,537 | 0,781 |

Lectura de los datos segun el autor: ULLR supera a todas las variantes Qwen en todos los tamanos (+33,6 pp sobre Qwen3.5-2B ajustado, +46,6 pp sobre Qwen3.5-0.8B ajustado); la ganancia de KTO (+4,4 pp globales) se concentra en categorias de llamadas multiples (`multiple` +11,3 pp y `parallel` +8,7 pp sobre el base); la cuantizacion Q4_K_M (1,7 GB) iguala la puntuacion global del base sin cuantizar (0,781); y el KTO solo mejoro al base mas fuerte, siendo neutro o perjudicial en los modelos Qwen con pipelines identicos.

Evaluacion multi-turno y en dominio:

| Benchmark | LFM2.5-2.6B base | ULLR (KTO) |
|---|---|---|
| τ-bench, validez de llamada (16 episodios) | 100% | 100% |
| τ-bench, errores de entorno | 0 | 0 |
| Validacion en dominio (10 prompts) | 5/10 | 6/10 |

Los fallos en dominio se concentran en la completion multi-paso (bucles de verificacion que agotan el presupuesto de 8 pasos), no en la seleccion de herramienta: el modelo elige las herramientas correctas en el orden correcto pero no siempre converge a una respuesta final.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 1,7 GB, por lo que la inferencia cuantizada requiere aproximadamente 2,5-3 GB contando contexto y overhead. En FP16 los pesos rondan los 5,4 GB, con un consumo realista de 7-8 GB. Las cifras de otras cuantizaciones no estan documentadas.
- GPU de consumo: si cabe en tarjetas de gama media con 6-8 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090) usando las variantes GGUF cuantizadas.
- GPU de数据中心/centro de datos: A100 y H100 son sobredimensionadas para 2,7B parametros, pero permiten servir muchas replicas concurrentes o mantener el modelo en FP16 con contexto largo.
- Opciones de despliegue: llama.cpp (libreria declarada en el repositorio), llama.cpp server, Ollama a partir del GGUF, y cualquier runtime compatible con GGUF. El repositorio no publica safetensors, por lo que los servidores que solo aceptan pesos sin cuantizar (vLLM o TGI en su configuracion habitual) requeririan conversion previa. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia alojados.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota de despliegue: el modelo esta pensado para ejecutarse dentro de un harness agéntico que implemente las herramientas (web_search, web_fetch, rust_repl, grep, read_file, list_directory, edit). Sin ese entorno, su politica de no responder desde conocimiento parametrico degrada la utilidad en chat directo.

## Comparativa con modelos similares

| Modelo | Parametros | BFCL v4 (Overall) | Entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ULLR | 2,6B | 0,825 (0,781 en Q4_K_M) | KTO sobre LFM2.5-2.6B | No disponible | lfm-open-license-v1.0 | GGUF en HuggingFace, libreria llama.cpp |
| LFM2.5-2.6B (base) | 2,6B | 0,781 | Modelo base sin ajuste | No disponible | No disponible | Repositorio oficial de LiquidAI |
| Qwen3.5-2B + SFT + KTO | 2B | 0,617 | SFT + KTO con el mismo pipeline | No disponible | No disponible | No disponible |
| Qwen3.5-0.8B + SFT + KTO | 0,8B | 0,489 | SFT + KTO con el mismo pipeline | No disponible | No disponible | No disponible |
| LFM2-1.2B-Tool + SFT + KTO | 1,2B | 0,351 | SFT + KTO | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos incluidos en la escalera de evaluacion del propio autor, que es la unica fuente de datos cuantitativos disponible. No se han publicado comparaciones con modelos de tool calling de otros fabricantes fuera de esa tabla.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no incluye analisis de sesgos.
- Riesgo de alucinacion: la politica del modelo esta disenada para reducirlo (busqueda web obligatoria y ejecucion de codigo previa), pero persiste en escenarios donde la busqueda o la ejecucion fallan y el modelo debe decidir si reintentar o responder. Los fallos en dominio se concentran en bucles de verificacion que superan el presupuesto de 8 pasos y no convergen a una respuesta final.
- Politica de sobre-llamada deliberada: ULLR se entrenó para llamar a herramientas incluso cuando probablemente conoce la respuesta, lo que implica respuestas mas lentas y un mayor consumo de llamadas a API. No es adecuado si se busca un chat de baja latencia sin herramientas.
- Idioma: unicamente ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con ventanas largas.
- Dependencia del harness: el modelo esta disenado para operar con realimentacion de herramientas dentro de un agente. Fuera de ese entorno, su comportamiento puede ser degradado o poco util.
- Presupuesto de pasos: los fallos de completion multi-paso se atribuyen a un limite de 8 pasos, lo que sugiere que tareas largas de verificacion pueden quedar sin cerrar.
- Licencia: lfm-open-license-v1.0 (etiquetada como `other`). No se detallan en la informacion disponible los terminos exactos ni las restricciones de uso comercial, por lo que es obligatorio revisar el texto completo de la licencia antes de un despliegue en produccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente de los resultados publicados. Las cifras de BFCL y τ-bench proceden del propio autor.
- Trazabilidad de los datos: la model card se interrumpe en la descripcion del proceso de validacion cruzada, por lo que parte de la metodologia de filtrado de datos no esta documentada de forma completa.
- Evaluacion con jueces automatizados: parte del pipeline de datos se filtro con Nemotron-Nano-9B como juez, con 35 avisos clasificados como excesivamente estrictos por el propio autor, lo que introduce dependencia de un criterio automatico no verificado de forma externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/impacte/ullr
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repositorio del asistente nolock: https://github.com/impacte-tech/nolock
- Busqueda web realizada: los resultados devueltos no guardan relacion con el modelo (corresponden al editor de video Microsoft Clipchamp), por lo que no se incluye ningun enlace adicional de esa busqueda. No se han encontrado articulos, papers, blogs ni demos adicionales sobre ULLR en la informacion proporcionada.
