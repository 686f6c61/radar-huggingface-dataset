# RMDWLLC/Jah-7.0-Mini-MLX-4bit

## Resumen

Jah 7.0 Mini (MLX, 4 bits) es un modelo de generación de texto publicado por RMDW LLC (Georgia, EE. UU.) como el miembro pequeno de su familia Jah 7.0. Se distribuye ya convertido a formato MLX y cuantizado a 4 bits para ejecutarse en local en ordenadores Mac con Apple Silicon, sin nube ni cuenta de usuario. A pesar del nombre comercial ("Mini" y "7.0"), el recuento real de parámetros en los safetensors es de 26.895.993.856 (~26,9B), por lo que conviene tratarlo como un modelo de la franja de 27B, no de 7B.

El modelo se presenta como "uncensored": según el autor, el comportamiento de rechazo se ha eliminado a nivel de pesos, de modo que responde a preguntas históricas, políticas y mecánicas que los modelos convencionales suelen declinar. Además incorpora tool calling y un modo de razonamiento ("thinking") activable mediante `chat_template_kwargs: {"enable_thinking": true}`. El tag `qwen3_5` del repositorio apunta a que la base abierta sobre la que se construye procede de la familia Qwen 3.5, afinada por RMDW.

Su relevancia práctica es acotada pero clara: es una de las pocas opciones de ~27B en 4 bits pensadas explícitamente para inferencia local en un portátil Apple (32 GB de memoria unificada o más) con una API compatible con OpenAI servida desde el propio equipo. Como contrapartida, el repositorio no incluye benchmarks estándar, solo soporta inglés y depende por completo del ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; base abierta de la familia Qwen 3.5 (tag `qwen3_5`), afinada por RMDW |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card no la especifica; el modelo insignia de la familia anuncia 1M de tokens) |
| Tipos de cuantizacion | 4 bits (esta version); la familia indica que existe tambien variante de 8 bits |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); 15,2 GB de repositorio, ~14 GB en disco en 4 bits |
| Velocidad declarada | ~24 tokens/s en un Apple M5 Max (4 bits) |
| Memoria recomendada | Mac con 32 GB de memoria unificada o mas (4 bits) |
| Fecha de publicacion | 2026-10-17 |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna mas alla de la base declarada. El tag `qwen3_5` y la referencia del autor a "una base abierta mas pequena" situan el origen en la familia Qwen 3.5, sobre la que RMDW habria aplicado su propia alineacion. No se especifica si el modelo es denso o mixto de expertos (MoE): el recuento de 26,9B parametros totales y la ausencia de un dato de parametros activos impiden confirmarlo. Tampoco se documenta la longitud de contexto nativa, un dato llamativo teniendo en cuenta que el modelo insignia de la misma familia anuncia 1M de tokens.

En cuanto al entrenamiento, la model card no aporta numero de tokens, composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares. Lo unico verificable es la afirmacion de que el comportamiento de rechazo se ha "eliminado a nivel de pesos" (una intervencion del tipo abliteration) y que la alineacion corre a cargo de RMDW. Se menciona tambien que el modelo mantiene una identidad propia (se presenta como Jah, hecho por RMDW) sin bloquear un system prompt del usuario por encima de esa identidad, y que el modo thinking es conmutable en tiempo de inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno, con memoria de conversacion segun las comprobaciones internas del autor.
- Tool calling / function calling, integrable en flujos de agentes.
- Modo de razonamiento ("thinking") activable por plantilla de chat para problemas complejos y desactivable para respuestas rapidas.
- Aritmetica exacta, segun la model card (sin cifras publicadas que lo respalden).
- Respuestas a contenido sensible (historico, politico, mecanico) sin rechazos, por diseno.
- Identidad de marca incorporada: se autoidentifica como Jah, de RMDW.
- Servicio mediante API compatible con OpenAI a traves de `mlx_lm.server`.
- Capacidades multimodales, de vision o de audio: no disponibles en esta variante.
- Soporte idiomatico: solo ingles.

## Casos de uso

- **Asistente local con API compatible con OpenAI:** levantar `mlx_lm.server --model RMDWLLC/Jah-7.0-Mini-MLX-4bit --port 8080` y apuntar herramientas internas (chatops, scripts, plugins) a `localhost`, de forma que ningun prompt ni dato salga del equipo.
- **Procesamiento de documentacion confidencial:** contratos, historiales clinicos o notas de I+D en sectores con requisitos estrictos de residencia de datos; el modelo en 4 bits ocupa ~14 GB y cabe en un Mac de 32 GB, lo que permite trabajar sin conexion.
- **Agentes multi-paso con herramientas:** activando el modo thinking para la planificacion y el tool calling para la ejecucion, se puede construir un agente que consulte APIs internas, ejecute scripts y consolide resultados en local; util en entornos air-gapped donde no se permite una API externa.
- **Escritura creativa sin filtros de rechazo:** guion, ficcion con violencia explicita o tramas politicamente sensibles, donde los modelos convencionales interrumpen la generacion; el modelo esta disenado para no hacerlo.
- **Investigacion en seguridad y alineacion:** uso como referencia local de un modelo con el rechazo ablacionado, para estudiar cambios de comportamiento, hacer red teaming o comparar respuestas frente a una version alineada de la misma base.
- **Redaccion y reescritura tecnica en ingles:** resumenes, reescritura de documentacion y generacion de variantes de texto, aprovechando la ventana conversacional y la velocidad de ~24 tokens/s en M5 Max.
- **Prototipado offline en portatil:** demos y pruebas de concepto en ferias, viajes o entornos sin red, arrancando el modelo desde LM Studio (motor MLX) sin instalaciones adicionales.
- **Analisis de transcripciones largas de soporte interno:** conversaciones multi-turno donde se requiere mantener el contexto de la sesion y aplicar herramientas de consulta a un CRM local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta comprobaciones internas del autor, sin detalle de las preguntas ni comparacion con otros modelos:

| Evaluacion | Resultado declarado | Notas |
|---|---|---|
| Bateria de censura propia de Jah (preguntas historicas, politicas y mecanicas) | 6 de 6 | Sin listado de preguntas ni metodologia |
| Aritmetica exacta | "supera" la prueba | Sin cifras |
| Tool calling | "supera" la prueba | Sin cifras |
| Memoria multi-turno | "supera" la prueba | Sin cifras |
| Modo thinking | "supera" la prueba | Sin cifras |
| MMLU, HumanEval, GSM8K, MATH, MT-Bench | no disponible | No publicados |

## Requisitos de hardware

- **VRAM / memoria unificada:** ~14 GB de pesos en 4 bits (15,2 GB de repositorio); el autor recomienda Macs con 32 GB de memoria unificada o mas para dejar margen a la KV cache y al sistema.
- **Variante de 8 bits:** no se publica su tamano exacto; por el numero de parametros se situaria en torno a 27-28 GB de pesos, lo que exigiria Macs de 48-64 GB. Estimacion, no dato del autor.
- **GPU compatibles:** exclusivamente Apple Silicon mediante MLX. No hay backend CUDA ni ROCm en este repositorio; para A100, H100 o RTX 4090 habria que convertir los pesos a otro formato, algo no soportado oficialmente.
- **Uso en GPU de consumo:** si, en el sentido de que cabe en equipos Apple de gama alta (M-series Pro/Max/Ultra con 32 GB o mas). No cabe en GPUs de consumo con 8-16 GB de VRAM en su forma actual.
- **Despliegue:** `mlx-lm` (`mlx_lm.generate` para CLI, `mlx_lm.server` para API compatible con OpenAI), LM Studio con motor MLX. vLLM, TGI, llama.cpp y Ollama no cargan pesos MLX de forma nativa.
- **Rendimiento:** ~24 tokens/s en un Apple M5 Max a 4 bits, segun el autor. No hay datos de throughput agregado (tokens/s con batching), latencia de primer token ni cifras para chips anteriores (M1/M2/M3/M4).

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus model cards publicas y deben verificarse antes de tomar decisiones; no incluyen ninguna evaluacion directa contra Jah 7.0 Mini.

| Modelo | Parametros | Contexto | Licencia | Notas diferenciales |
|---|---|---|---|---|
| Jah 7.0 Mini (este) | 26,9B | no disponible | Apache 2.0 | MLX 4/8 bits, sin rechazos, tool calling, thinking mode, solo ingles, sin benchmarks publicos |
| Qwen3-30B-A3B | 30,5B totales / 3,3B activos (MoE) | 32K nativo, ampliable a 131K con YaRN | Apache 2.0 | Base publica muy extendida, soporte multilingue amplio, ecosistema de inferencia maduro (vLLM, llama.cpp) |
| Gemma 3 27B | 27B | 128K | Licencia Gemma (uso comercial con condiciones) | Multimodal (vision), multilingue, contexto mayor; requiere aceptar terminos de Google |
| Mistral Small 3.1 24B | 24B | 128K | Apache 2.0 | Vision, multilingue, contexto largo, disponible en cuantizaciones GGUF para GPU de consumo |

Diferencias clave frente a las alternativas: Jah 7.0 Mini es el unico de la lista distribuido en formato MLX listo para usar y el unico con el rechazo eliminado a nivel de pesos, pero tambien el unico sin contexto declarado, sin benchmarks publicos y limitado al ingles.

## Limitaciones y advertencias

- **Contenido sin filtros:** al eliminar el comportamiento de rechazo a nivel de pesos, el modelo puede producir contenido danino, ilegal o gravemente sesgado. Cualquier despliegue orientado a usuarios finales necesita una capa de moderacion externa.
- **Riesgo de alucinacion:** sin benchmarks publicos de fidelidad factual, no hay evidencia de que el modelo sea fiable en dominios especializados; la naturaleza conversacional y el modo thinking no sustituyen a la verificacion.
- **Sesgos no documentados:** no se publica informacion sobre la composicion del dataset de alineacion ni sobre evaluaciones de sesgo.
- **Solo ingles:** el campo `language` del repositorio declara unicamente `en`; el rendimiento en castellano u otros idiomas no esta garantizado.
- **Contexto desconocido:** la model card no declara la ventana de contexto. Planificar cargas de trabajo asumiendo contextos largos es arriesgado sin medirlo antes.
- **Dependencia de MLX:** los pesos solo se cargan de forma nativa en Apple Silicon. En Linux o en GPUs NVIDIA no hay ruta soportada.
- **Madurez y trazabilidad:** el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el autor no publica informe tecnico ni dataset, y las afirmaciones de calidad son internas y no reproducibles.
- **Licencia:** Apache 2.0 permite uso comercial y modificacion, incluida la redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No incluye garantias ni indemnizacion por el uso del modelo.
- **Produccion:** sin datos de latencia con batching, longitud de contexto ni estabilidad en sesiones largas, se recomienda una fase de evaluacion propia antes de integrarlo en un servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RMDWLLC/Jah-7.0-Mini-MLX-4bit
- Modelo insignia de la familia: https://huggingface.co/RMDWLLC/Jah-7.0
- Sitio del autor (RMDW LLC): https://rmdw.ai
- Servicio gestionado Kiyomi: https://kiyomibot.ai
- Libreria de inferencia MLX-LM (Apple): https://github.com/ml-explore/mlx-lm
- Informe tecnico, paper o dataset de entrenamiento: no disponible
