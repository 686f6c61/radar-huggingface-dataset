# shaban2024/Qwen3.5-4B-BOS-Q8-NonThinking

## Resumen

El modelo `shaban2024/Qwen3.5-4B-BOS-Q8-NonThinking` es una distribucion en formato GGUF del agente bosnio AgentMujo Q8 4B v0.2 (revision joint-04), desarrollado sobre el modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768`. Se trata de un transformer decoder-only denso de aproximadamente 3,65 mil millones de parametros (3.653.938.176 segun los pesos safetensors del repositorio), con 32 capas, dimension oculta de 2560 y vocabulario de 32768 tokens. Su proposito concreto es actuar como agente de administracion de sistemas Linux en lengua bosnia: traducir peticiones en lenguaje natural a llamadas de herramientas (function calling) y ejecutar flujos de diagnostico sobre terminal.

La relevancia del modelo reside en su especializacion: no es un modelo generalista, sino el resultado de un ajuste LoRA (r16/alpha32, bf16) sobre un mix de datos de function calling, comportamiento agentico, datos de conversacion y razonamiento, seguido de un merge y una cuantizacion Q8_0 con llama.cpp. El fichero resultante ocupa unos 3,9 GB, lo que permite desplegarlo en GPUs de consumo y en entornos locales sin acceso a infraestructura de datacenter, algo coherente con su caso de uso (operacion de servidores y terminales).

El modelo forma parte de una familia con una version menor de 2B (v0.5) y varias iteraciones intermedias (joint-01 a joint-03). En la evaluacion propia del autor, AgentMujo-Bench v0.5 con 48 casos, la version 4B joint-04 mejora a la 2B v0.5 en seleccion de herramienta (0.933 frente a 0.800), precision de argumentos (0.923 frente a 0.808) y correccion de rechazo (1.0 frente a 0.8), manteniendo el 2B como opcion por defecto mas eficiente. La licencia Apache-2.0, tanto del base como del framework de entrenamiento, permite uso comercial sin restricciones adicionales declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3.5); 32 capas, hidden 2560, vocab 32768 |
| Parametros totales | 3.653.938.176 (~3,65 B) segun safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32768 tokens segun el identificador del modelo base (`Qwen3.5-4B-bos-32768`); no confirmado de forma explicita en la model card |
| Tipos de cuantizacion | Q8_0 (GGUF); pesos originales en bf16 y safetensors |
| Idiomas soportados | Bosnio (`bs`) |
| Licencia | Apache-2.0 (base y framework) |
| Formato de pesos | GGUF (`model-q8-v0.2.gguf` y `model-q8.gguf`) y safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso derivado de la familia Qwen3.5, con 32 capas, dimension oculta de 2560 y vocabulario reducido de 32768 tokens. El modelo base (`alphaedge-ai/Qwen3.5-4B-bos-32768`, revision `34a62191`) aporta el conocimiento linguistico y general; sobre el se aplico un ajuste LoRA con rango 16 y alpha 32 en bf16, entrenado en una GPU Kaggle T4. Tras el merge, los pesos se convirtieron a GGUF mediante `convert_hf_to_gguf.py --no-mtp` y se cuantizaron a Q8_0, con `qwen35.block_count=32` como parametro de arquitectura del conversor. El resultado es un unico fichero GGUF que, segun el autor, sirve tanto para el perfil de razonamiento explicito como para el perfil sin razonamiento mediante el modificador `think: true/false`.

El entrenamiento se realizo sobre un mix de datos SFT version v0.27 compuesto por datos de function calling (FC), datos agenticos (AG), datos de conversacion (BC) y datos de razonamiento (thinking), reutilizando la misma composicion empleada en la version 2B. El autor reporta las evaluaciones intermedias de cada iteracion: joint-01 con 0.883, joint-02 con 0.815, joint-03 con 0.777 y joint-04 (la version publicada) con 0.7645. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT, ni el numero total de tokens de entrenamiento consumidos.

## Capacidades

- Generacion de texto conversacional en bosnio, con soporte del modificador de perfil `think` para razonamiento explicito o respuestas directas.
- Function calling y tool calling: seleccion de herramienta con 0.933 de acierto y precision de argumentos de 0.923 en AgentMujo-Bench v0.5.
- Comportamiento agentico sobre terminal Linux: interpretacion de peticiones en lenguaje natural y traduccion a comandos y llamadas de sistema (el ejemplo documentado es la consulta sobre el estado del servicio nginx).
- Razonamiento multi-paso: puntuacion de 0.857 en la metrica `multi_step` del banco de pruebas del autor.
- Rechazo de peticiones inseguras: `refusal_correctness` de 1.0 y `safety` de 1.0 en el mismo banco de pruebas.
- Comportamiento de confirmacion previa a la ejecucion de acciones, con margen de mejora (0.8).
- Preferencia de alto nivel (`high_level_preference` de 1.0) y correccion en ausencia de herramienta aplicable (`no_tool_correctness` de 1.0).
- Capacidades multilingues: limitadas al bosnio segun los metadatos del repositorio; no se declara soporte de otras lenguas.
- Capacidades de vision, audio o multimodalidad: no disponibles.

## Casos de uso

- Administracion de servidores Linux en bosnio: el modelo convierte peticiones como "Radi li nginx servis?" en la llamada de herramienta correspondiente (por ejemplo, consulta de estado de `systemctl`) con una seleccion de herramienta del 0.933, lo que reduce la friccion para equipos cuyo idioma de trabajo es el bosnio.
- Ejecucion controlada de comandos con confirmacion: dado su comportamiento de confirmacion (0.8), encaja como primera capa de un flujo en el que el modelo propone la accion y un Policy Engine externo la valida antes de ejecutarla, tal como recomienda el propio autor.
- Diagnostico de incidencias multi-paso: con 0.857 en `multi_step`, puede encadenar varias consultas (estado del servicio, logs, uso de disco) para localizar la causa de un fallo antes de proponer una remediacion.
- Filtro de seguridad en pipelines de automatizacion: su `refusal_correctness` de 1.0 y `safety` de 1.0 permiten usarlo como validador que rechaza comandos destructivos antes de que lleguen al terminal.
- Despliegue en entornos aislados o sin conexion: el fichero Q8_0 de 3,9 GB se ejecuta localmente con Ollama o llama.cpp en un portatil o en un servidor pequeño, sin depender de APIs externas ni de conectividad.
- Asistente de terminal para desarrolladores bosniofonos: integrado como CLI, puede explicar el estado del sistema, proponer comandos y justificar cada paso en el idioma del usuario.
- Generacion asistida de scripts de automatizacion: a partir de una descripcion en bosnio, el modelo puede redactar scripts de shell que despues se revisan y ejecutan manualmente, aprovechando su vocabulario tecnico especializado.
- Base para ajuste LoRA adicional: al estar bajo Apache-2.0 y con un vocabulario reducido de 32768 tokens, es un punto de partida razonable para adaptaciones a otras lenguas eslavas del sur, siempre que se aporten datos de entrenamiento propios.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a AgentMujo-Bench v0.5 (48 casos, cuantizacion Q8, temperatura 0, perfil sin razonamiento), comparando esta version 4B joint-04 con la 2B v0.5:

| Metrica | 2B v0.5 | 4B joint-04 |
|---|---|---|
| tool_selection | 0.800 | 0.933 |
| argument_accuracy | 0.808 | 0.923 |
| confirmation_behavior | 0.8 | 0.8 |
| high_level_preference | 1.0 | 1.0 |
| no_tool_correctness | 1.0 | 1.0 |
| refusal_correctness | 0.8 | 1.0 |
| safety | 1.0 | 1.0 |
| multi_step | 0.833 | 0.857 |

Frente a la version anterior 4B joint-03, el autor reporta un resultado de 2 victorias, 44 empates y 2 derrotas, con correccion del caso bench-018 (`high_level`) y del caso 025, y nuevas carencias en el caso 010 (confirmacion) y 035 (multi-paso). En evaluacion global de entrenamiento, las iteraciones sucesivas registraron 0.883 (joint-01), 0.815 (joint-02), 0.777 (joint-03) y 0.7645 (joint-04).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos: el fichero GGUF Q8_0 ocupa aproximadamente 3,9 GB segun la model card; el repositorio completo ocupa 15,5 GB, ya que incluye varias versiones y formatos.
- VRAM estimada para inferencia: en torno a 4,5-5 GB con los pesos en Q8_0 y contexto corto, mas el cache KV, que crece con la longitud de contexto. Las cifras exactas de cache KV no estan disponibles (no se especifica el numero de cabezas KV ni el grado de GQA de la arquitectura).
- GPU de consumo: cabe en tarjetas de 8 GB con contexto reducido, y con margen en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Tambien es viable en equipos Apple Silicon con 16 GB de memoria unificada.
- GPU de datacenter: A100 y H100 son compatibles pero sobredimensionadas para un modelo de 3,65 B en Q8_0; su uso solo se justifica por agregacion de muchas instancias concurrentes.
- Opciones de despliegue: Ollama (documentado por el autor con un `Modelfile` y el comando `ollama create agentmujo-4b-q8`), llama.cpp y cualquier runtime compatible con GGUF. El despliegue con vLLM o TGI seria posible a partir de los safetensors incluidos en el repositorio, pero no esta documentado por el autor.
- Latencia y throughput: no disponibles. El autor unicamente indica que la version 2B sigue siendo la opcion por defecto mas eficiente por su tamano de 1,5 GB.

## Comparativa con modelos similares

Comparativa dentro de la propia familia AgentMujo, unico conjunto con datos publicados:

| Modelo | Parametros | Cuantizacion | Contexto | AgentMujo-Bench v0.5 | Licencia | Estado |
|---|---|---|---|---|---|---|
| 4B joint-04 (este modelo) | ~3,65 B | Q8_0, ~3,9 GB | 32768 (segun base) | tool_selection 0.933; argument_accuracy 0.923; multi_step 0.857 | Apache-2.0 | version live (`model-q8-v0.2.gguf`) |
| 4B joint-03 | ~3,65 B | Q8_0 | 32768 (segun base) | 2W-44T-2L frente a joint-04 | Apache-2.0 | conservado en el repo (`model-q8.gguf`) |
| 2B v0.5 | ~2 B (no confirmado) | GGUF, ~1,5 GB | no disponible | tool_selection 0.800; argument_accuracy 0.808; multi_step 0.833 | Apache-2.0 | version anterior de la familia |

No se dispone de datos que permitan comparar este modelo con alternativas externas de la misma categoria (agentes de terminal en lenguas minoritarias), por lo que esa comparacion se considera no disponible.

## Limitaciones y advertencias

- El propio autor reconoce debilidades persistentes en confirmacion (0.8) y razonamiento multi-paso (0.857), lo que desaconseja dejar la ejecucion de comandos enteramente en manos del modelo.
- El autor advierte de un problema de seguridad del perfil de razonamiento explicito en el fichero `/etc/shadow`, mitigado solo por una politica de denegacion como ultima linea. Indica que el perfil `think` en produccion debe mantenerse en la version 0.4-think.
- La terminal debe tratarse como mecanismo de respaldo y el Policy Engine se declara obligatorio, no opcional.
- El identificador del repositorio incluye el sufijo "NonThinking", mientras que la model card afirma que un unico GGUF cubre ambos perfiles mediante `think: true/false`. Esta discrepancia no queda resuelta en la informacion disponible.
- No hay datos publicados de benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que el rendimiento en tareas generales de razonamiento, matematicas o generacion de codigo fuera del dominio agentico no puede evaluarse.
- El soporte de idiomas se limita al bosnio (`bs`); no se declara comportamiento fiable en castellano, ingles u otras lenguas.
- El vocabulario de 32768 tokens es reducido en comparacion con los 151.936 tokens habituales de la familia Qwen, lo que puede degradar la tokenizacion de texto multilingue y de identificadores tecnicos poco frecuentes.
- No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset, lo que dificulta estimar la cobertura del dominio.
- Riesgo de alucinacion inherente a un modelo de 3,65 B especializado en un dominio estrecho: puede proponer comandos plausibles pero incorrectos, por lo que toda accion debe validarse.
- Licencia Apache-2.0 tanto del modelo base como del framework, sin restricciones declaradas para uso comercial; aun asi, conviene verificar la procedencia del dataset de ajuste, no detallada en la informacion disponible.
- La adopcion es muy baja (112 descargas y 0 "me gusta" en el momento de la consulta), con lo que la validacion comunitaria independiente es practicamente inexistente.
- No se han publicado articulos, informes tecnicos ni demos publicas asociadas al modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shaban2024/Qwen3.5-4B-BOS-Q8-NonThinking
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-4B-bos-32768 (revision `34a62191`)
- Repositorio del framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
- SHA256 del GGUF v0.2: `3bbd90e90fe0bf48bf0f5bf74a3e3cd593b1a09c66739166b13ac6172843cdc4`
- SHA del GGUF v0.1 (joint-03): `9974e7c0…` (identificador truncado en la model card)
- Papers, blogs y demos: no disponibles en la informacion proporcionada.
