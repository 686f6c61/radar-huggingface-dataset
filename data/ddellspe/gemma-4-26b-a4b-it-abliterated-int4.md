# ddellspe/gemma-4-26B-A4B-it-abliterated-int4

## Resumen

Gemma 4 26B-A4B-it-abliterated-int4 es una variante cuantizada a INT4 y sometida a "abliteration" del modelo google/gemma-4-26B-A4B-it, publicado por el usuario ddellspe en Hugging Face. La abliteration es una tecnica de ingenieria de representaciones que elimina la direccion latente asociada al comportamiento de rechazo (refusal), de modo que el modelo deja de emitir respuestas de negativa ante consultas que el modelo base rechazaria por alineamiento. El resultado conserva, segun el autor, las capacidades de razonamiento, codigo y conocimiento factual del modelo original.

El modelo base es un transformer hibrido con atencion local de ventana deslizante combinada con atencion global, y una arquitectura de mezcla de expertos (MoE) con 128 expertos por capa y 4 activos por token. Cuenta con 25.805.936.206 parametros totales (segun los safetensors del repositorio) y aproximadamente 4B parametros activos por token, con una ventana de contexto de 262.144 tokens. La cuantizacion INT4 reduce el peso de los pesos a unos 15,2 GB, lo que permite servir el contexto completo de 256k en torno a 28 GB de VRAM.

La relevancia de esta ficha radica en dos factores: por un lado, permite ejecutar un modelo MoE de gran contexto en hardware de gama alta para consumidores o en una unica GPU de datacenter; por otro, la abliteration plantea implicaciones eticas y de cumplimiento que conviene evaluar antes de cualquier despliegue en produccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 12 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion local de ventana deslizante + atencion global, y MoE con 128 expertos (4 activos por token) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ~4B (4 expertos activos por token) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | INT4 simetrica group-64 (W4A16) con compressed-tensors; escalas por canal con agrupacion de 64 elementos |
| Idiomas soportados | en (segun la model card y los tags del repositorio) |
| Licencia | gemma |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-26B-A4B-it emplea una arquitectura transformer hibrida: combina capas de atencion local con ventana deslizante y capas de atencion global, lo que reduce el coste computacional en contextos largos manteniendo capacidad de modelado a larga distancia. Sobre esta base se anade una capa MoE con 128 expertos por bloque y 4 expertos activos por token, lo que da un total de 26B parametros con solo ~4B activos en cada paso de inferencia. El modelo tiene 30 capas transformer (indices 0-29) y una dimension oculta de 2816. El modelo base fue entrenado por Google con fine-tuning de alineamiento (RLHF/DPO), aunque la model card no detalla el numero de tokens de entrenamiento ni la composicion del dataset.

La innovacion principal de esta variante es la abliteration, aplicada siguiendo el marco de Arditi et al. (2024), que sostiene que el comportamiento de rechazo esta mediado por una unica direccion en el espacio residual. El autor calcula esa direccion mediante activaciones contrastivas (pares de prompts daninos vs. inofensivos) y proyecta ortogonalmente las matrices de pesos que escriben en el stream residual: proyecciones de salida de atencion (`o_proj`, [2816, 4096]), proyecciones down del MLP compartido (`down_proj`, [2816, 2112]) y proyecciones down de los 128 expertos MoE ([128, 2816, 704]). La ortogonalizacion se aplica solo a las capas 10-24, dejando intactas las capas 0-9 (representaciones lexicas y sintacticas) y 25-29 (softcapping, normalizacion y mapeo de logits). Tras la abliteration, el modelo se recuantiza a INT4 con Neural Magic Compressed-Tensors, reduciendo el peso de 48,2 GB a 15,2 GB (una reduccion del ~68%) sin degradacion reportada de perplejidad.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y capacidades de codigo y matematicas heredadas del modelo base Gemma 4.
- Soporte de tool calling / function calling: la model card indica que requiere el parser `gemma4` (`--tool-call-parser gemma4`) en vLLM.
- Soporte de reasoning parser especifico (`--reasoning-parser gemma4`), lo que sugiere un modo de razonamiento estructurado.
- Capacidades de agente y razonamiento multi-paso, segun la configuracion de vLLM documentada.
- Comportamiento de rechazo suprimido (uncensored): el modelo no emite negativas ante consultas que el modelo base rechazaria por alineamiento.
- Capacidades multilingues limitadas al ingles segun la model card (idioma declarado: en).
- No se documentan capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Analisis de seguridad ofensiva y pentesting: el modelo puede generar y explicar tecnicas de explotacion, scripts de reconocimiento y analisis de vulnerabilidades sin las negativas que el modelo base aplicaria a consultas de seguridad. Adecuado para equipos de red team con marcos de autorizacion claros.
- Escritura creativa sin restricciones: generacion de ficcion con violencia, contenido adulto o temas sensibles que el modelo base rechazaria, gracias a la supresion de la direccion de rechazo en las capas 10-24.
- Procesamiento de documentos largos: con 256k tokens de contexto y ~28 GB de VRAM, permite analizar contratos, expedientes o bases de codigo completas en una sola pasada sin trocear el documento.
- Generacion de codigo en produccion: soporta tool calling con el parser `gemma4` de vLLM, lo que permite integrarlo en pipelines de CI/CD para generacion de tests, refactorizacion y revision automatica de parches.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto largo y despliegue en vLLM con `--enable-auto-tool-choice` para invocar APIs de backoffice (consultas de pedidos, cambios de direccion, etc.).
- Administracion de sistemas y scripting: generacion de scripts de automatizacion, expresiones regulares y comandos de shell sobre entornos propios, un caso donde el modelo base tiende a producir falsos rechazos.
- Investigacion en interpretabilidad: la variante abliterada sirve como objeto de estudio para comparar activaciones y comportamiento entre el modelo alineado y el ortogonalizado en las capas 10-24.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con el modelo base; solo afirma que la cuantizacion INT4 no degrada la perplejidad ni la capacidad de razonamiento, sin aportar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15,2 GB solo para pesos; con cache KV para contexto completo de 256k, el autor indica que el modelo cabe en ~28 GB de VRAM.
- GPU recomendadas: A100 40GB, H100, L40S 48GB o RTX 6000 Ada 48GB para servir el contexto completo de 256k. Una RTX 4090 (24 GB) queda por debajo del umbral de 28 GB indicado para contexto completo, por lo que requeriria reducir `--max-model-len`.
- Cabe en GPU de consumo: si, en GPUs de 24 GB o mas con contexto reducido; el contexto completo de 256k requiere ~28 GB.
- Opciones de despliegue: vLLM con `--trust-remote-code`, `--max-model-len 262144`, `--enable-auto-tool-choice`, `--tool-call-parser gemma4` y `--reasoning-parser gemma4`. El formato compressed-tensors INT4 es compatible con vLLM; no se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un MoE con solo ~4B parametros activos, el coste por token es sustancialmente menor que el de un modelo denso de 26B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ddellspe/gemma-4-26B-A4B-it-abliterated-int4 | 25,8B | ~4B | 262.144 | INT4 W4A16 | gemma | Hugging Face (0 descargas) |
| google/gemma-4-26B-A4B-it | 25,8B | ~4B | 262.144 | BF16 (48,2 GB) | gemma | Hugging Face (modelo base) |
| Variantes abliterated de otros modelos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la informacion proporcionada no incluye datos de benchmarks ni de otras variantes abliterated comparables. Frente al modelo base, las diferencias son la cuantizacion INT4 (15,2 GB frente a 48,2 GB) y la supresion del comportamiento de rechazo; el resto de especificaciones (parametros, contexto, licencia) se heredan sin cambios.

## Limitaciones y advertencias

- La abliteration elimina el mecanismo de rechazo, lo que incluye negativas ante solicitudes daninas. El modelo puede generar contenido ilegal, peligroso o danino sin filtro; su uso en produccion exige capas de moderacion externas.
- La licencia "gemma" impone las condiciones de uso de Google para la familia Gemma; conviene revisar los terminos de uso comercial y las restricciones de redistribucion antes de desplegar.
- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse.
- Riesgo de alucinacion no cuantificado: no se aportan evaluaciones de factualidad ni de tasas de alucinacion tras la abliteration.
- La proyeccion ortogonal sobre las capas 10-24 puede afectar a capacidades distintas del rechazo; el autor afirma que no hay degradacion, pero no presenta benchmarks que lo respalden.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (12 de noviembre de 2026): no hay evidencia de uso en produccion ni validacion independiente.
- El despliegue requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio; conviene auditar los ficheros antes de servirlo.
- La cuantizacion INT4 puede introducir perdida de precision en tareas de razonamiento matematico o generacion de codigo sensible a tokens exactos; no se documenta una comparacion numerica frente al modelo en BF16.
- No se documentan sesgos conocidos especificos de esta variante; los sesgos del modelo base se heredan y pueden amplificarse al eliminar el filtro de rechazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ddellspe/gemma-4-26B-A4B-it-abliterated-int4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper de referencia sobre abliteration (Arditi et al., 2024): no disponible como enlace en la informacion proporcionada
- Documentacion de Neural Magic Compressed-Tensors: no disponible como enlace en la informacion proporcionada
- Documentacion de vLLM: no disponible como enlace en la informacion proporcionada
