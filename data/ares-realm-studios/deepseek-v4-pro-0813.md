# Ares-Realm-Studios/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la versión oficial (no preview) de DeepSeek-V4-Pro, un modelo de generación de texto de escala frontera publicado en HuggingFace bajo el identificador Ares-Realm-Studios/DeepSeek-V4-Pro-0813. Según la model card, sustituye a DeepSeek-V4-Pro (Preview) con mejoras centradas en capacidades agénticas y en comportamiento en entornos de producción, e incorpora un módulo de decodificación especulativa propio llamado DSpark. El recuento real de parámetros declarado en los safetensors es de 1.650.497.936.906 (aproximadamente 1,65 billones), y el repositorio ocupa 892,8 GB.

El modelo se distribuye únicamente en safetensors con pesos en fp8/8-bit según los tags, y se apoya en transformers, vLLM y SGLang para su despliegue. La model card documenta un despliegue de referencia en un nodo único de 4×GB300 con paralelismo de datos 4, expert parallel activado y backend de MoE `deep_gemm_mega_moe`, lo que sitúa el modelo en el segmento de inferencia en centro de datos, no en GPU de consumo. La licencia declarada es MIT.

Es relevante ahora porque la model card lo posiciona como competitivo con los modelos propietarios más fuertes del momento en tareas de agente, código y uso de herramientas (Terminal Bench 2.1, DeepSWE, Toolathlon-Verified, Cybergym, NL2Repo), y porque introduce un mecanismo de decodificación especulativa activable con un solo flag tanto en vLLM como en SGLang. El repositorio no incluye plantilla de chat en formato Jinja: en su lugar se distribuye una carpeta `encoding` con scripts Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun los tags `deepseek_v4` y los flags de despliegue `--enable-expert-parallel` y `--moe-backend`; no se detalla la configuracion de capas ni el ratio de expertos |
| Parametros totales | 1.650.497.936.906 (aproximadamente 1,65 billones), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 / 8-bit en pesos (tag `fp8`, `8-bit`); cache KV en fp8 (`--kv-cache-dtype fp8`); cache del indexer de atencion en fp4 (`use_fp4_indexer_cache`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 892,8 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo pertenece a la familia DeepSeek-V4 y que su estructura base es la de DeepSeek-V4-Pro (Preview), a la que se anade el modulo de decodificacion especulativa DSpark. Los indicios tecnicos de la model card (expert parallel, backend de MoE, cache de indexer en fp4, block-size 256 para la cache KV) apuntan a una arquitectura de mezcla de expertos con atencion dispersa, pero no se publica el numero de expertos, el numero de parametros activos por token, el numero de capas ni la dimension oculta. Tampoco se detalla la longitud de contexto soportada.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. La unica informacion sobre control de inferencia es que el parametro `reasoning_effort` admite tres niveles (`low`, `high` y `max`) que regulan cuanto delibera el modelo antes de responder; en las evaluaciones publicadas se ha usado el nivel `max` con `temperature = 1.0` y `top_p = 0.95` dentro del framework DeepSeek Harness en modo minimal. La innovacion tecnica mas destacable documentada es DSpark: se activa en vLLM con `--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'` y en SGLang con `--speculative-algorithm DSPARK` sin configurar un draft model separado. El repositorio no incluye plantilla de chat Jinja; el formateo de mensajes en formato compatible con OpenAI se realiza mediante los scripts de la carpeta `encoding`.

## Capacidades

- Generacion de texto conversacional multi-turno mediante el codificador de mensajes de la carpeta `encoding`.
- Razonamiento con esfuerzo configurable en tres niveles (`low`, `high`, `max`), con contenido de razonamiento separado (`reasoning_content`) parseable del texto de salida.
- Capacidades agénticas: la model card reporta resultados en Agents' Last Exam, AutomationBench, Toolathlon-Verified y Terminal Bench 2.1, orientados a tareas de agente de varios pasos.
- Uso de herramientas (tool calling): evaluado en Toolathlon-Verified y en tareas de agente con framework externo.
- Codigo y desarrollo full-stack: evaluado en DeepSWE, NL2Repo y en los conjuntos internos DSBench-FullStack y DSBench-Hard.
- Seguridad ofensiva y analisis de ciberseguridad: evaluado en Cybergym.
- Razonamiento de alta dificultad con y sin herramientas: evaluado en HLE en ambas modalidades.
- Decodificacion especulativa integrada (DSpark) para acelerar la generacion.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Agentes de automatizacion de tareas de oficina y flujos empresariales: con 31,8 en AutomationBench (Public) y 74,1 en Toolathlon-Verified, el modelo esta orientado a ejecutar cadenas de acciones con herramientas externas, encadenando llamadas y verificando resultados intermedios.
- Agentes de terminal y operaciones de sistema: 87,9 en Terminal Bench 2.1, lo que lo hace adecuado para tareas de shell, gestion de ficheros, diagnostico de entornos y automatizacion de infraestructura.
- Generacion y refactorizacion de codigo en produccion: 71,1 en DSBench-FullStack y 61,5 en NL2Repo permiten integrarlo en pipelines que traducen descripciones en lenguaje natural a repositorios o modulos funcionales, con validacion posterior en CI/CD.
- Resolucion de incidencias de codigo de alta dificultad: 62,7 en DeepSWE y 67,2 en DSBench-Hard lo sitúan como candidato para depuracion de bugs complejos y tareas de mantenimiento sobre bases de codigo grandes.
- Analisis y respuesta ante incidentes de seguridad: 83,3 en Cybergym, util para triaje de vulnerabilidades, analisis de artefactos sospechosos y generacion de pruebas de concepto en entornos controlados.
- Asistentes de razonamiento tecnico con acceso a herramientas: 60,0 en HLE con herramientas, adecuado para asistencia a investigacion donde el modelo combina busqueda, calculo y sintesis.
- Servicio de inferencia de alto rendimiento en centro de datos: la activacion de DSpark con 7 tokens especulativos y cache KV en fp8 reduce el coste por token en despliegues vLLM sobre nodos multi-GPU.
- Evaluacion comparativa interna de modelos frontera: al cubrir benchmarks de agente, codigo y seguridad, sirve como referencia base para comparar alternativas propietarias y abiertas.

## Benchmarks y rendimiento

Resultados publicados en la model card. En las tareas de agente de codigo se uso el modo minimal de DeepSeek Harness como framework de agente, con nivel de razonamiento `max`, `temperature = 1.0` y `top_p = 0.95`.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | DeepSeek-V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (sin / con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack (interno) | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard (interno) | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

DSBench-FullStack y DSBench-Hard son conjuntos de prueba internos (desarrollo full-stack y problemas dificiles de agente de codigo). No se han publicado resultados de benchmarks de conocimiento general tipo MMLU, GSM8K o HumanEval en la informacion disponible.

## Requisitos de hardware

- Despliegue de referencia documentado: un nodo unico con 4×GB300 sirviendo el modelo con vLLM y paralelismo de datos 4, expert parallel activado, `--kv-cache-dtype fp8`, `--block-size 256`, backend `deep_gemm_mega_moe` y DSpark con 7 tokens especulativos.
- VRAM estimada a partir del recuento de parametros (1,65 billones): aproximadamente 1,65 TB en fp8/8 bits, aproximadamente 825 GB en 4 bits y aproximadamente 3,3 TB en bf16. El repositorio publicado ocupa 892,8 GB, por debajo de la cifra fp8 pura, y la model card no ofrece desglose de como se almacenan los pesos, por lo que estas cifras deben tratarse como estimaciones derivadas del recuento de parametros.
- No cabe en GPU de consumo. No es viable en RTX 4090, RTX 5090 ni en configuraciones de una o dos GPU profesionales de 80 GB.
- Paralelismo necesario: expert parallel mas data parallel para repartir expertos y capas entre varias GPU de 80 GB o superiores (H100, H200, B200, GB300).
- Opciones de despliegue documentadas: vLLM (con `--trust-remote-code` y configuracion especulativa DSpark) y SGLang (con `--speculative-algorithm DSPARK`). La libreria base es transformers. Existe una receta publica de vLLM para DeepSeek-V4-Pro.
- Cuantizacion en inferencia: fp8 para pesos y cache KV, fp4 para la cache del indexer de atencion.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La model card proporciona comparaciones de rendimiento, pero no especificaciones tecnicas (parametros, contexto, licencia) de los modelos alternativos.

| Modelo | Parametros | Contexto | Licencia | Resultados destacados frente a este modelo |
|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | Inferior en todos los benchmarks publicados; por ejemplo, 82,7 frente a 87,9 en Terminal Bench 2.1 y 54,4 frente a 62,7 en DeepSWE |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | Version previa; muy inferior en tareas de agente (12,8 frente a 62,7 en DeepSWE; 41,8 frente a 71,1 en DSBench-FullStack) |
| GLM-5.2 | no disponible | no disponible | no disponible | Inferior en toda la tabla (por ejemplo, 46,2 frente a 62,7 en DeepSWE; 12,9 frente a 31,8 en AutomationBench) |
| Kimi K3 | no disponible | no disponible | no disponible | Mixto: superior en HLE sin herramientas (43,5 frente a 42,7), Terminal Bench 2.1 (88,3 frente a 87,9), DeepSWE (67,5 frente a 62,7) y DSBench-FullStack (73,7 frente a 71,1); inferior en HLE con herramientas, Cybergym y DSBench-Hard |
| Opus-4.8 | no disponible | no disponible | no disponible | Superior en HLE sin herramientas (49,8 frente a 42,7) y NL2Repo (69,7 frente a 61,5); inferior en Terminal Bench 2.1, Cybergym, DeepSWE, Toolathlon-Verified y DSBench-Hard |
| Fable-5 (w/ fallback) | no disponible | no disponible | no disponible | Superior en HLE (53,3 / 63,0), Terminal Bench 2.1, DeepSWE, DSBench-FullStack y DSBench-Hard; inferior en Cybergym y AutomationBench |

## Limitaciones y advertencias

- El repositorio esta publicado bajo la organizacion Ares-Realm-Studios, mientras que la model card y los ejemplos de codigo referencian la organizacion deepseek-ai (por ejemplo, `from_pretrained("deepseek-ai/DeepSeek-V4-Pro-0813")`). Es necesario verificar la procedencia real de los pesos antes de cualquier uso en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El dato de tamano del repositorio (892,8 GB) no se corresponde con un almacenamiento fp8 puro de 1,65 billones de parametros, y no se ofrece desglose de precision por capa; conviene inspeccionar los safetensors antes de planificar el despliegue.
- No se publica la longitud de contexto soportada, lo que impide dimensionar la cache KV y planificar despliegues con contextos largos.
- No se especifican los idiomas soportados; no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- No se detalla la composicion del dataset de entrenamiento ni si hubo RLHF o DPO, por lo que no es posible evaluar sesgos conocidos ni trazas de alineacion.
- No se publican resultados en benchmarks de conocimiento general (MMLU, GSM8K, HumanEval) ni metricas de latencia o throughput.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; los resultados altos en benchmarks de agente no eliminan la necesidad de verificacion en dominios de alta exigencia como ciberseguridad o codigo en produccion.
- Las evaluaciones de agente de codigo se realizaron con un framework propietario (DeepSeek Harness, modo minimal) y nivel de razonamiento `max`; los resultados pueden no reproducirse con otros frameworks o niveles de esfuerzo menores.
- La licencia MIT figura tanto en los tags como en la model card, pero si el modelo deriva de pesos de DeepSeek conviene confirmar que la licencia declarada en este repositorio es la que corresponde a los pesos originales.
- El uso en ciberseguridad (Cybergym) implica capacidades de analisis ofensivo; su uso debe enmarcarse en entornos autorizados y con controles de acceso.
- El despliegue requiere infraestructura multi-GPU de centro de datos; no existe una ruta practica de inferencia en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ares-Realm-Studios/DeepSeek-V4-Pro-0813
- Informe tecnico (referencia arXiv incluida en los tags): https://arxiv.org/abs/2606.19348
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Receta de vLLM para DeepSeek-V4-Pro: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai
- Carpeta `encoding` del repositorio (codificacion de mensajes y parseo de salida): https://huggingface.co/Ares-Realm-Studios/DeepSeek-V4-Pro-0813/tree/main/encoding

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; todos los enlaces recuperados corresponden a entidades homonimas sin relacion (la localidad francesa de Ares, el grupo empresarial Ares, la organizacion de MMA Ares Fighting y el programa de becas ARES).
