# pyros-vault/Nanbeige4.3-33B-oQ6e

## Resumen

Nanbeige4.3-33B-oQ6e es una versión cuantizada a 6 bits del modelo Nanbeige4.3-33B, un LLM denso de 33 118 977 024 parámetros (33,1B) desarrollado por Nanbeige y publicado bajo licencia Apache 2.0. Esta ficha concreta corresponde al repositorio `pyros-vault/Nanbeige4.3-33B-oQ6e`, una republicación de la comunidad que empaqueta los pesos en formato safetensors con cuantización de 6 bits (etiqueta `6-bit`, sufijo `oQ6e`), ocupando 27,8 GB frente a los aproximadamente 66 GB que exigiría el modelo en FP16.

El modelo original se posiciona como el "modelo profesor" de la familia Nanbeige4.3: un modelo grande pensado para tareas de coding agéntico y de oficina ("cowork"), que servirá después como referencia para destilar capacidades agénticas en modelos pequeños de la misma familia (por ejemplo, Nanbeige4.3-3B). Según la model card, lidera la mayoría de benchmarks agénticos en la clase de ~30B frente a Qwen3.8-27B, Muse-Glimmer-30B y Gemma4-31B, con resultados destacados como 80,9 en Terminal-Bench 2.1, 65,5 en DeepSWE o 95,2 en AIME 2026.

Su relevancia práctica es doble: por un lado, ofrece capacidades agénticas de gama alta en un tamaño que cabe en una sola GPU profesional o en configuraciones de consumo de gama muy alta; por otro, esta variante de 6 bits reduce el coste de almacenamiento y de VRAM a cambio de una pérdida de precisión no documentada por el autor de la cuantización. Conviene señalar que el repositorio no incluye información técnica propia de la cuantización (receta, calibración, métricas de degradación) y que la model card adjunta es la del modelo instruct original de Nanbeige, mientras que el `base_model` declarado es la variante Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en el repositorio); modelo denso |
| Parametros totales | 33 118 977 024 (33,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 000 tokens segun cobertura de prensa (Daily AI Brief); no confirmado de forma explicita en la model card disponible |
| Tipos de cuantizacion | 6 bits (sufijo `oQ6e`); el mismo autor publica una variante `oQ4e` de 4 bits |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, organizados en shards (`model-0000X-of-0000Y.safetensors`); compatible con `transformers` |
| Tamano del repositorio | 27,8 GB |
| Modelo base | Nanbeige/Nanbeige4.3-33B-Base |
| Pipeline | text-generation |
| Fecha de publicacion | 25 de octubre de 2026 |
| Descargas / likes | 0 / 0 |
| Compatibilidad de despliegue | `text-generation-inference`, `endpoints_compatible` (segun etiquetas del repositorio) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un transformer decoder-only denso de 33,1B parametros, con la etiqueta de arquitectura `llama` en el repositorio. La model card del modelo original describe el tokenizer como configurable mediante una plantilla de chat con opciones especificas para escenarios de razonamiento y uso de herramientas: `enable_thinking` controla si el modelo emite trazas de razonamiento y `preserve_thinking` permite conservar ese contenido en el historial de conversacion (la evaluacion de benchmarks se realizo con `preserve_thinking=true`). No se detalla en la informacion proporcionada el numero de cabezas de atencion, la dimension oculta, el uso de atencion lineal o de decodificacion especulativa, ni si se emplearon tecnicas como GQA o RoPE con escalado para alcanzar el contexto largo reportado.

Tampoco hay datos publicos en la informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre las etapas de alineacion (SFT, RLHF, DPO). Lo que si se explicita es la estrategia de la familia: Nanbeige4.3-33B se entrena como "profesor" de alta capacidad con el objetivo de anclar posteriormente la destilacion de capacidades agénticas en modelos mas pequenos de la serie. La innovacion declarada es, por tanto, de caracter funcional (rendimiento agéntico en la clase 30B) mas que arquitectonica, a lo que se suma el modo de razonamiento conmutable desde la plantilla de chat.

En esta ficha concreta, la capa adicional relevante es la cuantizacion a 6 bits aplicada por `pyros-vault`: no se documenta el esquema exacto (por ejemplo, si es cuantizacion de grupo con escalas por bloque, ni el tamano de grupo), ni se aportan metricas de perplejidad o de degradacion respecto al modelo en FP16/BF16.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento explicito con "thinking mode" conmutable mediante `enable_thinking` en la plantilla de chat, y preservacion de esas trazas con `preserve_thinking`.
- Coding agéntico: resolucion de tareas en terminal, edicion de repositorios, generacion de codigo a partir de lenguaje natural y comprension de bases de codigo (evaluado en Terminal-Bench 2.1/4.0, SWE-Bench Pro, DeepSWE, NL2Repo, Scicode).
- Uso de herramientas (tool calling / function calling) en entornos con multiples herramientas, segun los resultados en Toolathlon-Verified y Tau3-Bench.
- Planificacion multi-paso y ejecucion de tareas largas (DeepPlanning, EnterpriseOps-Gym, Automation Bench).
- Tareas de "cowork" profesional: flujos de oficina, operaciones empresariales y tareas por ocupacion (JobBench evalua 35 ocupaciones).
- Razonamiento cientifico y matematico de nivel alto (GPQA Diamond 89,5; AIME 2026 95,2).
- No hay evidencia en la informacion disponible de capacidades de vision, audio o multimodalidad.

## Casos de uso

- Agente de terminal y automatizacion de DevOps: el modelo puede encadenar comandos, interpretar la salida de la shell y corregir errores en tareas de varios pasos; sus resultados en Terminal-Bench 2.1 (80,9) y Terminal-Bench 4.0 (23,8) lo sitúan como opcion para agentes CLI en pipelines de integracion y despliegue.
- Mantenimiento de repositorios y resolucion de issues: con el formato de `mini-swe-agent` o `Claude Code` como arnes, se puede usar para localizar el archivo afectado, proponer un parche y validarlo contra la suite de tests del proyecto (SWE-Bench Pro 60,3; SWE-Atlas-QnA 50,8).
- Generacion de codigo a partir de especificaciones en lenguaje natural (NL2Repo 53,0): util para prototipar repositorios completos o scaffolds a partir de un documento de requisitos en entornos de docencia o pruebas de concepto.
- Automatizacion de tareas de oficina y operaciones empresariales: procesamiento de flujos administrativos con multiples herramientas y documentos, apoyandose en los resultados de Automation Bench (54,2), JobBench (44,8) y EnterpriseOps-Gym (41,0).
- Agente de atencion al cliente con acceso a herramientas: el soporte de function calling y de preservacion del razonamiento permite construir asistentes que consulten sistemas internos, mantengan contexto multi-turno y escalen a un humano cuando la tarea excede el flujo previsto (Tau3-Bench 48,8).
- Asistencia en analisis y planificacion de proyectos largos: DeepPlanning (63,3) sugiere uso en descomposicion de objetivos, estimacion de tareas y seguimiento de planes con multiples dependencias.
- Destilacion y generacion de datos sinteticos: al ser el modelo profesor declarado de la familia, puede emplearse para generar trazas de razonamiento y trayectorias agénticas que alimenten el entrenamiento de modelos de 3B.
- Tutorizacion tecnica bilingue (en/zh) en matematicas y ciencias: AIME 2026 95,2 y GPQA Diamond 89,5 respaldan su uso como asistente de resolucion de problemas con explicacion paso a paso.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo original (Nanbeige4.3-33B). Todas las cifras corresponden al modelo sin cuantizar y evaluado con `preserve_thinking=true`; no se han publicado resultados especificos para esta variante de 6 bits.

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Coding agentico | Terminal-Bench 2.1 | **80,9** | 73,0 | 61,8 | 47,2 |
| Coding agentico | Terminal-Bench 4.0 | **23,8** | 6,3 | 1,6 | 0,0 |
| Coding agentico | DeepSWE | **65,5** | 42,5 | 4,4 | 2,7 |
| Coding agentico | SWE-Bench Pro | 60,3 | **61,7** | 36,9 | 51,2 |
| Coding agentico | SWE-Atlas-QnA | **50,8** | 41,9 | 17,7 | 3,3 |
| Coding agentico | NL2Repo | **53,0** | 48,3 | 27,4 | 33,8 |
| Coding agentico | Scicode | **52,6** | 46,7 | 44,9 | 45,5 |
| Coding agentico | SkillsBench | **61,1** | 56,4 | 39,7 | 28,9 |
| Cowork agentico | Automation Bench | **54,2** | 38,3 | 15,2 | 9,7 |
| Cowork agentico | JobBench | **44,8** | 34,5 | 16,6 | 9,0 |
| Cowork agentico | GDPval | 84,8 | **86,4** | 75,8 | 71,4 |
| Cowork agentico | Claw-Eval (pass^3) | **78,3** | 75,2 | 57,3 | 44,2 |
| Cowork agentico | Toolathlon-Verified | **70,4** | 68,5 | 47,2 | 27,8 |
| Cowork agentico | DeepPlanning | **63,3** | 49,2 | 21,4 | 19,4 |
| Cowork agentico | EnterpriseOps-Gym | **41,0** | 40,2 | 30,5 | 27,3 |
| Cowork agentico | YC-bench | **1 025 437 USD** | 641 290 USD | 513 978 USD | 265 152 USD |
| Cowork agentico | Tau3-Bench | **48,8** | 48,5 | 33,7 | 18,6 |
| Razonamiento | GPQA Diamond | 89,5 | 89,2 | 83,5 | **91,3** |
| Razonamiento | AIME 2026 | **95,2** | 94,5 | 94,7 | 89,2 |
| Razonamiento | AA-LCR | **84,0** | 82,0 | 83,3 | 72,0 |

Notas metodologicas declaradas por el autor: Terminal-Bench 2.1 evaluado con Terminus 2; Terminal-Bench 4.0 y DeepSWE con `mini-swe-agent` v2.4.6; NL2Repo con Claude Code; JobBench con el arnes de Claude Code y herramienta de busqueda; SWE-Atlas-QnA con juicio automatico de GPT-6 Sol sobre 1 304 rubricas; Claw-Eval solo sobre el subconjunto General (157 tareas de un turno); YC-bench limitando el historial a los 10 turnos mas recientes.

## Requisitos de hardware

Estimaciones derivadas del tamano del repositorio (27,8 GB de pesos en 6 bits) y del numero de parametros; no son mediciones publicadas por el autor.

- VRAM para inferencia (pesos): aproximadamente 25-28 GB solo para los pesos en 6 bits. Con cache KV y overhead de runtime, calcular del orden de 30-40 GB para contextos moderados; con contexto muy largo (hasta 512K tokens segun prensa) la cache KV crece de forma significativa y puede dominar el consumo.
- GPU profesionales: A100 40 GB y 80 GB, H100 80 GB, L40S 48 GB o MI300X. Una A100 80 GB permite margen amplio para contexto largo; una A100 40 GB es viable con contexto contenido.
- GPU de consumo: encaja con dificultad en 24 GB (RTX 3090/4090) incluso en 6 bits; es mas realista en RTX 5090 (32 GB) o en configuraciones multi-GPU (2x24 GB). Para 24 GB habria que recurrir a la variante de 4 bits o a offload parcial a CPU.
- Despliegue: `transformers` (libreria declarada), `text-generation-inference` (etiqueta del repositorio), ademas de runtimes compatibles con safetensors cuantizados como vLLM segun soporte de la cuantizacion concreta; llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento agentico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta variante, 6 bits) | 33,1B (denso) | 512K segun prensa; no confirmado en la model card | Lider en Terminal-Bench 2.1 (80,9), DeepSWE (65,5), AA-LCR (84,0) | Apache 2.0 | Pesos abiertos en Hugging Face (variantes `oQ6e` y `oQ4e`) |
| Qwen3.8-27B | 27B | No disponible | Segundo en la mayoria de pruebas; mejor en SWE-Bench Pro (61,7) y GDPval (86,4) | No disponible en la informacion | No disponible en la informacion |
| Muse-Glimmer-30B | 30B | No disponible | Claramente por debajo en coding agentico (1,6 en Terminal-Bench 4.0; 4,4 en DeepSWE) | No disponible en la informacion | No disponible en la informacion |
| Gemma4-31B | 31B | No disponible | Mejor en GPQA Diamond (91,3); flojo en tareas agénticas de terminal (0,0 en Terminal-Bench 4.0) | No disponible en la informacion | No disponible en la informacion |

La comparacion se limita a los datos publicados en la model card del modelo original; no se dispone de informacion sobre contexto, licencia o formato de pesos de los tres modelos de referencia.

## Limitaciones y advertencias

- La cuantizacion a 6 bits no viene acompanada de ninguna evaluacion de degradacion: no hay datos de perplejidad, de caida en benchmarks ni de la receta de cuantizacion empleada. El rendimiento real de esta variante puede diferir del reportado en la model card (que corresponde al modelo sin cuantizar).
- Posible desajuste de procedencia: el repositorio declara como `base_model` la variante `Nanbeige4.3-33B-Base`, pero la model card adjunta es la del modelo instruct/agéntico. Conviene verificar con el autor si los pesos cuantizados corresponden al modelo alineado o al Base, ya que de ello depende que las capacidades conversacionales y de tool calling descritas esten realmente presentes.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad. No es una publicacion oficial de Nanbeige.
- Los benchmarks son autodeclarados por el desarrollador del modelo original y emplean arneses y jueces especificos (por ejemplo, GPT-6 Sol como juez en SWE-Atlas-QnA); no se han verificado de forma independiente en esta ficha.
- Idiomas limitados a ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior; no se debe asumir calidad equiparable en produccion en espanol.
- Riesgo de alucinacion inherente a los LLM, especialmente en tareas agénticas con ejecucion de comandos o edicion de ficheros: se recomienda sandboxing, revision humana de cambios y limites de permisos.
- Sesgos: no se ha publicado informacion sobre composicion del dataset ni sobre evaluaciones de sesgo, toxicidad o seguridad.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el usuario debe verificar el cumplimiento tambien respecto al modelo base y a cualquier termino adicional del autor original.
- El contexto de 512K proviene de cobertura de prensa, no de la model card disponible; verificar antes de disenar flujos que dependan de ventanas muy largas, ya que el coste de VRAM y la degradacion en el extremo del contexto no estan documentados.

## Enlaces

- Repositorio de esta variante en Hugging Face: https://huggingface.co/pyros-vault/Nanbeige4.3-33B-oQ6e
- Variante de 4 bits del mismo autor: https://huggingface.co/pyros-vault/Nanbeige4.3-33B-oQ4e
- Modelo base declarado: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Analisis en ExplainX: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- Noticia en Daily AI Brief (referencia al contexto de 512K): https://dailyaibrief.com/news/nanbeige-releases-33b-agent-model-with-512k-context-yoxTglVU
- Comentario en X sobre el lanzamiento: https://x.com/ItsmeAjayKV/status/2114345524723884097
- Paper tecnico: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
