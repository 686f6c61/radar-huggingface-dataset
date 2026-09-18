# dongnhdev/Qwen3.8-Flash-Next-OrcaUncensored-IQ2-Light

## Resumen

Qwen3.8-Flash-Next-OrcaUncensored-IQ2-Light es un empaquetado GGUF cuantizado a 2 bits del modelo abliterado orcarouter/Qwen3.8-Flash-Next-Uncensored, publicado por el usuario dongnhdev sobre el layout DS4-IQ2 de ivanfioravanti. No es un modelo entrenado desde cero: es una recuantizacion y reempaquetado que sustituye la tabla n-gram incrustada en BF16 de la version pesada (95 GiB residentes) por un sidecar PLE Q4_1 paginado bajo demanda, reduciendo el conjunto a un fichero principal de 44.806.612.448 bytes (~41,7 GiB).

El objetivo declarado es hacer viable la inferencia de un modelo de ~51,2 mil millones de parametros en un equipo Apple Silicon de 64 GiB de memoria unificada, en modo residente y sin swap, con una ventana operativa de 8K a 220K tokens. El autor reporta unos 30 tok/s en decodificacion, que suben a ~40 tok/s activando el bloque MTP (multi-token prediction), medidos en un M5 Pro.

Su relevancia es doble: por un lado, documenta una tecnica de empaquetado para cuantizacion extrema (IQ2_XXS + Q2_K + Q8_0 mixtos) con tablas de lookups externas; por otro, al provenir de un fine-tune abliterado, sirve como material de investigacion sobre alineacion y robustez de filtros de seguridad, con las advertencias legales que ello implica. El repositorio no tiene descargas ni likes y no publica benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card cita tensores gate/up/down, un bloque MTP y una tabla PLE externa, pero no confirma transformer, MoE ni hibrida) |
| Parametros totales | 51.200.245.795 (~51,2 mil millones), segun los metadatos del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | 8K-220K en la configuracion medida (64 GiB Apple Silicon, con `--prefill-chunk 2048`); el contexto nativo no se especifica |
| Tipos de cuantizacion | IQ2_XXS (gate/up), Q2_K (down, con padding a 768), Q8_0 (tensores densos), Q4_1 (sidecar PLE), bloque MTP |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (dos ficheros: principal + sidecar PLE) |
| Tamano del repositorio | 76,8 GB |
| Fichero principal | `Qwen3.8-Flash-Next-OrcaUncensored-IQ2XXS-Q2KDownPad768-MTP.gguf`, 44.806.612.448 bytes (sha256 `e078c60abfdc9c5dd849eddb41660e5fc8f1b0da2f1200c643a8d3ec50324e8a`) |
| Sidecar | `Qwen3.8-Flash-Next-PLE-Q4_1.gguf` (tamano no indicado en la model card) |
| Runtime documentado | ds4 (Metal, Apple Silicon); no se documentan otros |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de los nombres de los tensores cuantizados: bloques gate/up en IQ2_XXS y down en Q2_K (con padding a 768), tensores densos en Q8_0 y un bloque MTP (multi-token prediction) que actua como cabezal de prediccion multi-token para acelerar la decodificacion. La presencia de tensores gate/up/down y de un bloque MTP es compatible con una arquitectura de tipo mezcla de expertos con prediccion especulativa integrada, pero el autor no lo confirma, por lo que no se puede afirmar sin reservas. Tampoco se indica el numero de capas, la dimension oculta, el numero de expertos ni el mecanismo de atencion.

En cuanto a los datos de entrenamiento, esta ficha no aporta informacion nueva: el modelo es una recuantizacion de pesos ya existentes. La cadena declarada es orcarouter/Qwen3.8-Flash-Next-Uncensored (revision `8336e613ea508b13c2159bd0f68965d97a606b95`), un fine-tune abliterado, cuantizado al layout DS4-IQ2 de ivanfioravanti y despues reempaquetado en esta variante ligera mediante la eliminacion del tensor n-gram incrustado y la sustitucion por un sidecar Q4_1 externo. El autor afirma que la tabla n-gram es identica byte a byte entre el modelo base Qwen y el fine-tune Orca, porque la abliteration no la toca, y que los tensores retenidos son identicos byte a byte a los del build pesado. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva con decodificacion acelerada por bloque MTP: el autor mide ~40 tok/s con `--mtp` frente a ~30 tok/s sin el.
- Procesamiento de contexto largo: la model card reporta funcionamiento estable de 8K a 220K tokens con `--prefill-chunk 2048` en un equipo de 64 GiB, manteniendo cero swap.
- Comportamiento abliterado (sin censura en la mayor parte de dominios): segun la propia model card, conserva rechazos residuales en los casos mas extremos de sintesis de armas y drogas, algo tipico de la abliteration.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Vision, audio u otras modalidades: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Uso de tabla PLE externa (n-gram lookup paginado bajo demanda) para reducir la huella de memoria residente.

## Casos de uso

- Investigacion en alineacion y abliteration: permite reproducir en local, sobre hardware Apple Silicon, el comportamiento de un modelo con filtros de seguridad eliminados, y compararlo contra su version alineada para estudiar que capacidades y sesgos se ven afectados por la ablacion.
- Red teaming y evaluacion de filtros: sirve como generador adversarial para probar clasificadores de contenido y policies de moderacion, ya que su comportamiento abliterado produce respuestas que los modelos alineados rechazan.
- Asistente local de escritura creativa sin restricciones: al ejecutarse en un portatil con 64 GiB de memoria unificada y sin conexion, permite trabajar con material narrativo sensible (violencia, temas adultos) sin enviar prompts a terceros.
- Analisis de documentos extensos offline: con ventana operativa de hasta 220K tokens, es adecuado para resumir, indexar o hacer preguntas sobre corpus tecnicos o legales completos en una maquina local, sin coste de API ni filtrado de contenido.
- Generacion de datos sinteticos para SFT/DPO: util para producir pares de instruccion-respuesta sobre dominios que los modelos alineados evitan, siempre que el uso sea licito y se revise el material antes de incorporarlo a un dataset.
- Estudio de cuantizacion extrema: el empaquetado IQ2_XXS + Q2_K + Q8_0 con sidecar PLE Q4_1 es un caso de estudio medible para evaluar la perdida de calidad de los ~2 bits frente a builds BF16, y para analizar el coste/beneficio de externalizar tablas de lookups.
- Prototipado en Apple Silicon con presupuesto de memoria ajustado: sirve para validar pipelines de inferencia (runtime ds4, flags de prefill por trozos) antes de escalar a despliegues con mas memoria, dado que el conjunto completo cabe en 64 GiB sin swap.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de velocidad de decodificacion medidas en un M5 Pro con 64 GiB de memoria unificada:

| Metrica | Valor declarado |
|---|---|
| Decodificacion sin MTP | ~30 tok/s |
| Decodificacion con MTP (`--mtp`) | ~40 tok/s |
| Contexto operativo | 8K a 220K tokens |
| Comportamiento de memoria | residente y cero swap en 64 GiB (Apple Silicon, M5 Pro) |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de calidad, ni comparaciones con el build BF16 de origen.

## Requisitos de hardware

- Memoria: el fichero principal ocupa ~41,7 GiB (~44,81 GB en disco) y requiere ademas el sidecar PLE Q4_1, cuyo tamano no se especifica; el repositorio completo son 76,8 GB.
- Plataforma medida: Apple Silicon con 64 GiB de memoria unificada (M5 Pro). El autor afirma ejecucion residente y sin swap en esa configuracion.
- Contexto largo: para mantener cero swap entre 128K y 220K tokens hay que anadir `--prefill-chunk 2048`.
- GPU recomendadas: no se documentan GPU NVIDIA ni CUDA. El unico runtime descrito es ds4 sobre Metal, por lo que el hardware objetivo son equipos Apple Silicon con memoria unificada amplia (64 GiB o mas).
- GPU de consumo: con 24 GB de VRAM (RTX 4090 y similares) no cabria el conjunto descrito segun los tamanos de la model card.
- Opciones de despliegue: ds4 (Metal). No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI; dado que el layout DS4-IQ2 depende de un sidecar PLE externo, la portabilidad a otros runtimes no esta garantizada.
- Latencia y throughput: ~30 tok/s de decodificacion y ~40 tok/s con MTP en M5 Pro de 64 GiB. No se aportan datos de TTFT, throughput por lotes ni rendimiento en otras maquinas.

## Comparativa con modelos similares

No se dispone de especificaciones publicas de terceros comparables en la informacion proporcionada. La comparacion mas util es interna, dentro de la propia cadena de derivacion:

| Modelo | Parametros | Cuantizacion | Huella de memoria | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| dongnhdev/Qwen3.8-Flash-Next-OrcaUncensored-IQ2-Light (este) | ~51,2 mil millones | IQ2_XXS + Q2_K + Q8_0 + PLE Q4_1 + MTP | ~41,7 GiB principal + sidecar PLE | 8K-220K medidos | apache-2.0 | GGUF (2 ficheros) |
| ivanfioravanti/Qwen3.8-Flash-Next-DS4-IQ2 | no disponible | IQ2 con n-gram BF16 incrustado | 95 GiB residentes | no disponible | no disponible | GGUF |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | pesos sin cuantizar (BF16 declarado) | no disponible | no disponible | no disponible | no disponible |

La diferencia clave entre el primer y el segundo modelo es el reempaquetado: se elimina el tensor n-gram en BF16 y se sustituye por un sidecar Q4_1 paginado bajo demanda, lo que baja la huella residente de 95 GiB a ~41,7 GiB a cambio de depender de un segundo fichero. No se han identificado en la busqueda otros modelos de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Modelo abliterado: la propia model card advierte que es "broadly uncensored" y que solo conserva rechazos residuales en los casos mas extremos de sintesis de armas y drogas. Puede generar contenido dañino o ilegal; el autor lo publica para investigacion y responsabiliza al usuario del uso licito.
- Riesgo elevado de alucinacion: se trata de una cuantizacion mixta de ~2 bits (IQ2_XXS y Q2_K) sobre pesos originales en BF16; no hay evaluaciones publicadas que cuantifiquen la degradacion, y en este rango de compresion la perdida de fidelidad suele ser notable.
- Dependencia de dos ficheros: el modelo no es autocontenido, necesita el sidecar PLE Q4_1. Un sidecar ausente o desalineado invalida la inferencia, y su tamano ni siquiera se declara en la model card.
- Compatibilidad limitada: el unico runtime documentado es ds4 sobre Metal. No hay evidencia de que funcione en llama.cpp, Ollama, vLLM o TGI, ni de soporte CUDA.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluacion multilingue, por lo que no se puede asumir un buen rendimiento en castellano.
- Sin benchmarks ni validacion comunitaria: 0 descargas y 0 likes, sin resultados de MMLU, HumanEval, GSM8K ni comparativas. Cualquier despliegue en produccion exigiria una evaluacion propia.
- Inconsistencia de tamanos: el fichero principal declarado (44.806.612.448 bytes, ~41,7 GiB) es muy superior a lo que cabria esperar de una cuantizacion de ~2 bits sobre 51,2 mil millones de parametros, y el repositorio suma 76,8 GB sin que se detalle el desglose del sidecar. Conviene verificar los ficheros antes de planificar memoria.
- Contexto: el rango de 220K tokens es una medicion operativa en un equipo concreto con prefill troceado, no una especificacion de contexto nativo del modelo. No se documenta como se comporta la atencion mas alla de esa cifra.
- Licencia: apache-2.0 permite uso comercial, pero se aplica sobre la cadena de modelos base, cuyas condiciones propias no se detallan en la informacion disponible; conviene revisar las fichas de los modelos de origen antes de un uso comercial.
- Fechas: la publicacion figura como 2026-09-18, posterior a la mayoria de referencias disponibles, lo que dificulta contrastar el modelo con documentacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dongnhdev/Qwen3.8-Flash-Next-OrcaUncensored-IQ2-Light
- Modelo base (layout DS4-IQ2): https://huggingface.co/ivanfioravanti/Qwen3.8-Flash-Next-DS4-IQ2
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Repositorio del runtime ds4: no disponible en la informacion proporcionada
- Paper o informe tecnico: no disponible
- Demos: no disponible
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces recuperados pertenecen al foro de desarrolladores de Roblox y no guardan relacion con el contenido de esta ficha.
