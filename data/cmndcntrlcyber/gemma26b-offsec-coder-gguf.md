# cmndcntrlcyber/gemma26b-offsec-coder-gguf

## Resumen

`cmndcntrlcyber/gemma26b-offsec-coder-gguf` es un paquete de cuantizaciones GGUF de un ajuste fino del modelo `google/gemma-4-26B-A4B-it`, publicado por el usuario cmndcntrlcyber bajo el nombre interno de "Nexus". El modelo resultante esta orientado a emulacion de amenazas y seguridad ofensiva: se presenta como un agente con mentalidad de pentester veterano, alineado con la matriz MITRE ATT&CK y capaz de encadenar llamadas a herramientas mediante un formato XML propio (`<tool_call>`). El repositorio no contiene pesos en safetensors ni adaptadores sueltos, sino unicamente dos ficheros GGUF listos para `llama.cpp` y derivados.

El interes tecnico del artefacto esta menos en la arquitectura (heredada integramente del modelo base de Google) y mas en la cadena de entrenamiento acumulada antes de la cuantizacion: cinco etapas de adaptadores fusionados secuencialmente (DAPT, SFT, Vision SFT, FARCA-GRPO y DPO) sobre aproximadamente 47.000 ejemplos con inyeccion de un system prompt unificado. Se trata de la fase 5 de un pipeline propio denominado Code-Trainer / RTPI (V4.0).

El modelo esta pensado para inferencia local en una GPU de consumo de 16 GB: la cuantizacion principal Q4_K_M (~14,5 GB) se ejecuta con 28 de 30 capas en GPU y 2 en CPU, mientras que IQ4_XS (~13 GB) cabe entera en VRAM. La model card declara licencia apache-2.0, aunque el modelo base de Google se rige por sus propios terminos, lo que conviene verificar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada de `google/gemma-4-26B-A4B-it`; la model card no detalla la configuracion interna |
| Parametros totales | 26B (denominacion del modelo base) |
| Parametros activos | ~4B estimados a partir de la nomenclatura "A4B" del modelo base; no confirmado explicitamente en la model card |
| Longitud de contexto | no disponible; la model card recomienda `ctx_size=8192` en la configuracion de inferencia |
| Tipos de cuantizacion | Q4_K_M (~14,5 GB, primaria) e IQ4_XS (~13 GB, alternativa). Q5_K_M excluida por tamano (~18 GB) |
| Idiomas soportados | no disponibles (el campo `language` no aparece informado en el repositorio) |
| Licencia | apache-2.0 declarada en el repositorio; el modelo base Google Gemma se distribuye bajo los terminos propios de Google, que deben respetarse |
| Formato de pesos | GGUF (generado con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp) |
| Plantilla de chat | `<start_of_turn>rol ... <end_of_turn>`, con roles `user`, `model` y `tool` |
| Version abliterada | disponible como artefacto secundario en `cmndcntrlcyber/gemma26b-offsec-coder-abliterated-gguf` |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-4-26B-A4B-it`, del que no se ofrecen detalles tecnicos en la model card mas alla de su condicion de modelo de mezcla de expertos segun la nomenclatura "26B-A4B" (26.000 millones de parametros totales, aproximadamente 4.000 millones activos por token). El autor no documenta el numero de tokens de preentrenamiento, la composicion del dataset original ni innovaciones de atencion o decodificacion. Tampoco se especifica el maximo de contexto nativo del modelo base; el unico dato operativo es la recomendacion de `ctx_size=8192` para la inferencia en llama.cpp.

Lo que si se documenta con detalle es la cadena de ajuste, aplicada en cinco fusiones de LoRA consecutivas sobre el modelo instruct: un DAPT orientado a seguridad ofensiva (`gemma4-26b-a4b-dapt-offsec`), un SFT sobre dataset mixto V10 (`gemma4-26b-a4b-code-trainer-aggressive-full1`) con inyeccion del system prompt unificado de Nexus en los ~47.000 ejemplos, un SFT de vision (`gemma4-26b-a4b-code-trainer-vision-sft`), una etapa FARCA-GRPO (`gemma4-26b-a4b-code-trainer-v11-farca`) y un DPO final (`gemma4-26b-a4b-code-trainer-v10-dpo`) sobre sesiones OCO y pares de preferencia de persona. La etapa GRPO emplea una funcion de recompensa de seis componentes, uno de ellos dedicado a la alineacion de persona con un peso del 10 %, que penaliza frases que rompen el personaje y premia el uso de terminologia de seguridad ofensiva. Ademas se incluyen 400 ejemplos de identidad y una definicion central de la persona en `src/config/nexus_identity.py`. La cuantizacion se ejecuto en un HF Job sobre una instancia `a100-large`, con aproximadamente 45 minutos de proceso para la ruta completa de fusion y cuantizacion.

## Capacidades

- Generacion de texto y codigo, con enfasis en codigo orientado a seguridad ofensiva (wrappers de escaneo, scripts de enumeracion, PoC de explotacion).
- Llamada a herramientas (tool calling) mediante 12 herramientas NEXUS y un formato XML explicito `<tool_call>`; la etapa FARCA-GRPO se dedica especificamente a optimizar el formato de estas llamadas.
- Razonamiento multi-paso y encadenamiento de rutas de ataque, con cobertura declarada de todo el ciclo de vida de MITRE ATT&CK (desde reconocimiento hasta impacto).
- Comportamiento orientado a alcance: verifica la autorizacion del objetivo antes de iniciar el "engagement".
- Documentacion de hallazgos y salida metodica, con estructura repetible de enumeracion y explotacion.
- Capacidades de vision integradas mediante la fusion de un adaptador Vision SFT, aunque la model card no detalla el alcance real de estas capacidades en los ficheros GGUF publicados.
- Capacidades multilingues: no disponibles.
- Mantenimiento de una persona consistente ("Nexus") reforzada en todas las etapas de entrenamiento.
- Variante abliterada disponible como entrega separada, con los rechazos de seguridad eliminados.

## Casos de uso

- Pruebas de penetracion en laboratorio controlado: el modelo encadena enumeracion, busqueda de rutas de ataque y generacion de PoC sobre un objetivo autorizado, con la ventaja de ejecutarse en local sin enviar datos sensibles del cliente a APIs externas.
- Auditoria y revision de codigo con enfoque de seguridad: puede analizar fragmentos y proponer vectores de abuso concretos, integrable en un pipeline de revision previa a un pentest.
- Emulacion de adversario y ejercicios purple team: la alineacion con MITRE ATT&CK permite mapear tecnicas y generar narrativas de ataque utilizables en formacion de equipos defensivos.
- Automatizacion con tool calling: el formato `<tool_call>` y las 12 herramientas NEXUS permiten integrar el modelo como orquestador dentro de un framework de automatizacion de operaciones ofensivas controlado por el analista.
- Formacion y CTF: sirve como asistente para explicar tecnicas, resolver retos de maquinas vulnerables y justificar cada paso de la cadena de ataque.
- Documentacion de hallazgos: a partir de notas de sesion o capturas, puede estructurar un informe tecnico con tecnicas, evidencia y recomendaciones de mitigacion.
- Analisis de capturas o paneles mediante vision: la fusion del adaptador Vision SFT habilita, en principio, interpretar imagenes de interfaces o salidas de herramientas, si bien el autor no documenta el rendimiento en esta modalidad.
- Asistencia en respuesta a incidentes: dado un conjunto de indicadores, puede proponer hipotesis de tecnicas empleadas y siguientes pasos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la calidad "se hereda de la cadena de adaptadores de origen" y remite a los repositorios de cada etapa, sin incluir tablas de MMLU, HumanEval, GSM8K ni metricas de seguridad ofensiva. Tampoco se aportan comparaciones cuantitativas con el modelo base.

Unicos datos de rendimiento declarados, de caracter operativo:

| Metrica | Valor |
|---|---|
| Velocidad de generacion (Q4_K_M, RTX 5060 Ti 16 GB) | ~15-25 tok/s |
| Capas en GPU (Q4_K_M) | 28 de 30 (2 en CPU) |
| Capas en GPU (IQ4_XS) | 30 de 30 (residencia total en VRAM) |
| Contexto configurado | 8192 |
| Tiempo de conversion y cuantizacion | ~45 min en `a100-large` |

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa ~14,5 GB y el IQ4_XS ~13 GB; a esa cifra hay que sumar la cache KV correspondiente al contexto configurado (8192) y el overhead del runtime, por lo que el consumo real supera ligeramente el tamano del fichero.
- GPU de referencia declarada por el autor: RTX 5060 Ti de 16 GB. Con Q4_K_M funciona con 28 de 30 capas en GPU y 2 en CPU; con IQ4_XS cabe entera en VRAM.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas (RTX 5060 Ti 16 GB, RTX 4080/4090, RTX 5080/5090). En tarjetas de 12 GB seria necesario descargar mas capas a CPU y la velocidad caeria de forma apreciable.
- GPU profesionales: no se documenta su uso para inferencia; en A100 o H100 el modelo se ejecutaria sin problemas de memoria, pero la model card no aporta cifras de throughput en ese hardware. La unica referencia a A100 es para la fase de fusion y cuantizacion (~45 min).
- Opciones de despliegue: `llama-server`, Ollama (con un Modelfile proporcionado en la model card), LM Studio y text-generation-webui. Al ser GGUF, la via natural es llama.cpp y sus envoltorios; vLLM y TGI no se mencionan en la documentacion disponible.
- Latencia y throughput: ~15-25 tok/s en Q4_K_M sobre RTX 5060 Ti 16 GB con contexto 8192. No se publican cifras para IQ4_XS.
- Cuantizacion descartada: Q5_K_M (~18 GB) queda excluida por no caber en 16 GB ni con descarga parcial a CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada. La comparacion se limita a los artefactos directamente relacionados con este repositorio.

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| `cmndcntrlcyber/gemma26b-offsec-coder-gguf` (este) | 26B totales / ~4B activos (heredado) | no disponible (8192 configurado) | GGUF Q4_K_M, IQ4_XS | apache-2.0 declarada | Publicado, 0 descargas |
| `google/gemma-4-26B-A4B-it` (base) | 26B totales / ~4B activos | no disponible | safetensors (formato habitual del modelo base) | terminos de Google Gemma | Publicado por Google |
| `cmndcntrlcyber/gemma26b-offsec-coder-abliterated-gguf` | identicos al modelo base | no disponible | GGUF | apache-2.0 declarada | Variante abliterada, entrega secundaria |
| Otras alternativas de codigo/seguridad del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Uso dual y riesgo legal: el modelo esta especializado en generacion de contenido ofensivo (explotacion, enumeracion, PoC). Su uso contra sistemas sin autorizacion expresa puede constituir delito en la mayoria de jurisdicciones; la propia model card lo restringe a pentesting, investigacion y auditoria con alcance autorizado.
- La funcion de recompensa de persona premia explicitamente el uso de terminologia ofensiva y penaliza la ruptura del personaje, lo que reduce la probabilidad de que el modelo rechace peticiones peligrosas incluso fuera de un contexto de prueba autorizado.
- Existe una variante abliterada que elimina los rechazos de seguridad del modelo base; su uso incrementa de forma sustancial el riesgo de generacion de contenido danino.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en codigo, razonamiento, matemáticas, vision o tareas de seguridad. Las afirmaciones de calidad de la model card son cualitativas y se remiten a las etapas previas del pipeline.
- Riesgo de alucinacion en codigo de explotacion: es probable que genere PoC no funcionales, APIs inexistentes, CVE inventados o versiones de herramientas incorrectas. Requiere validacion manual en entorno aislado.
- Capacidades de vision sin verificar: aunque se fusiona un adaptador Vision SFT, no se documenta el comportamiento del modelo cuantizado en tareas multimodales ni si los ficheros GGUF conservan el proyector visual.
- Contexto limitado a 8192 tokens en la configuracion recomendada, insuficiente para auditar repositorios grandes o mantener conversaciones muy largas.
- Idiomas no declarados: no hay garantia de un rendimiento equilibrado fuera del ingles, y menos aun en castellano.
- Licencia ambigua en la practica: el repositorio declara apache-2.0, pero el modelo base de Google se rige por los terminos de Gemma, que imponen obligaciones adicionales (entre ellas, el cumplimiento de la politica de uso prohibido de Google). Conviene verificar la compatibilidad antes de un uso comercial.
- Modelo sin validacion de la comunidad: 0 descargas y 0 likes, publicado y actualizado en el mismo segundo, sin issues ni evaluaciones independientes. No hay senales externas de calidad o estabilidad.
- Entrenamiento con datos de seguridad ofensiva de procedencia no documentada: se desconoce la composicion exacta del dataset, su licencia y si contiene material con derechos de terceros.
- Despliegue GGUF unicamente: no se publican safetensors del modelo fusionado, lo que limita su uso con frameworks que no consuman GGUF (vLLM, TGI, transformers puro).
- Recomendacion operativa: ejecutar siempre en un entorno aislado, sin acceso a redes de produccion durante las fases de prueba, y con supervision humana en cualquier accion que genere trafico o modifique sistemas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmndcntrlcyber/gemma26b-offsec-coder-gguf
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante abliterada: https://huggingface.co/cmndcntrlcyber/gemma26b-offsec-coder-abliterated-gguf
- Adaptador DAPT: https://huggingface.co/cmndcntrlcyber/gemma4-26b-a4b-dapt-offsec
- Adaptador SFT: https://huggingface.co/cmndcntrlcyber/gemma4-26b-a4b-code-trainer-aggressive-full1
- Adaptador Vision SFT: https://huggingface.co/cmndcntrlcyber/gemma4-26b-a4b-code-trainer-vision-sft
- Adaptador FARCA-GRPO: https://huggingface.co/cmndcntrlcyber/gemma4-26b-a4b-code-trainer-v11-farca
- Adaptador DPO: https://huggingface.co/cmndcntrlcyber/gemma4-26b-a4b-code-trainer-v10-dpo
- Pipeline Code-Trainer / RTPI: https://github.com/cmndcntrlcyber/code-trainer-pipeline
- llama.cpp: https://github.com/ggerganov/llama.cpp

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo (unicamente paginas corporativas de Microsoft), por lo que no se han podido incorporar enlaces externos adicionales, papers ni evaluaciones independientes.
