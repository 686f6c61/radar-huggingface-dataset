# cometadata/funding-extraction-inkling-2-mini-artifact-data-mix-grpo-mixed-reward

## Resumen

El modelo `cometadata/funding-extraction-inkling-2-mini-artifact-data-mix-grpo-mixed-reward` es un adaptador LoRA publicado por el usuario cometadata sobre el modelo base `thinkingmachines/Inkling-2-Mini`, un modelo de mezcla de expertos (MoE) disperso de 26.400 millones de parametros desarrollado por Thinking Machines Lab. El adaptador esta especializado en una tarea muy concreta: la extraccion de metadatos de financiacion a partir de declaraciones de financiacion de articulos academicos, devolviendo un array JSON de financiadores con sus identificadores de ayuda, esquemas de financiacion y titulos de las ayudas agrupados bajo cada financiador.

El problema que resuelve es la normalizacion estructurada de informacion de financiacion cientifica, una tarea relevante para repositorios institucionales, agregadores de literatura academica y sistemas de gestion de la investigacion (CRIS) que necesitan vincular publicaciones con agencias financiadoras y numeros de subvencion de forma automatica. El adaptador se entreno mediante GRPO (Group Relative Policy Optimization) con una recompensa mixta y se publica como el paso 140 del entrenamiento de noviembre de 2026.

La relevancia practica del artefacto es doble: por un lado, demuestra una aplicacion de ajuste fino con refuerzo sobre un MoE de gran tamano para una tarea de extraccion de informacion; por otro, su publicacion es muy limitada, ya que depende de la infraestructura propietaria de Tinker y de un endpoint experimental de subida de pesos externos que, segun la propia model card, estaba deshabilitado para la organizacion publicadora en la fecha de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo base de mezcla de expertos (MoE) disperso (Inkling 2 Mini) |
| Parametros totales | 26.400 millones en el modelo base; el adaptador LoRA pesa 2.968.987.149 bytes |
| Parametros activos | no disponible (el modelo base es MoE disperso, pero no se especifica el numero de parametros activos) |
| Longitud de contexto | 65.536 tokens (identificador de servicio `peft:65536`) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors nativo de Tinker; el modelo base usa expertos cuantizados con un layout distinto) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos ficheros nativos de Tinker: `adapter_config.json` y `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 (`LoraConfig(rank=64)`) aplicado sobre `thinkingmachines/Inkling-2-Mini`, un modelo de mezcla de expertos disperso con 26.400 millones de parametros totales. El entrenamiento se realizo en dos etapas mediante GRPO con recompensa mixta, sobre el dataset `cometadata/funding-extraction-artifact-data-mix-grpo-mixed-reward`. La evaluacion y el entrenamiento usaron entrada de texto, el tokenizador H200k y el formato de chat TMLv0 con el esfuerzo de razonamiento (`thinking effort`) fijado a cero, es decir, sin modo de pensamiento extendido.

Una particularidad tecnica importante es que el adaptador se exporto con los nombres de parametro y el layout de matrices de expertos propios de Tinker, que difieren del layout que usa el modelo base publico para sus expertos cuantizados. Esto implica que el adaptador no es directamente cargable con las herramientas estandar de PEFT sobre el checkpoint publico del modelo base, sino que requiere el flujo de importacion de pesos externos de Tinker (`external_weights_upload_start` / `external_weights_upload_finish` en `tinker==0.40.0`). Los pesos se exportaron mediante un Hugging Face Job que verifico los digests SHA-256 de ambos ficheros contra el adaptador original; el fichero de pesos tiene SHA-256 `1e311830f011c571cb1744ebb8360b05a0baad98f559d7ea6c1eb6c6b85a4ccb`.

## Capacidades

- Extraccion de informacion estructurada: recibe una declaracion de financiacion en texto libre y devuelve un array JSON de objetos financiador, cada uno con `funder_name`, `awards`, `award_ids`, `funding_scheme` y `award_title`.
- Normalizacion de metadatos academicos: agrupa identificadores de ayuda, esquemas y titulos bajo el financiador correcto.
- Generacion de texto en ingles con salida JSON estricta (el prompt del sistema exige devolver solo el array JSON).
- Manejo de contexto largo de hasta 65.536 tokens, util para declaraciones de financiacion extensas.
- No dispone de modo de razonamiento extendido en el uso previsto: el esfuerzo de pensamiento se fija a cero.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Enriquecimiento de repositorios institucionales: procesar en lote las declaraciones de financiacion de los articulos depositados en un repositorio y generar metadatos estructurados de financiadores y numeros de subvencion para su indexacion.
- Poblacion de sistemas CRIS: extraer automaticamente las ayudas asociadas a cada publicacion para vincularlas con los registros de proyectos y justificar la financiacion en memorias de investigacion.
- Agregadores de literatura cientifica: normalizar la financiacion declarada en arXiv y otras fuentes para ofrecer busquedas por agencia financiadora o por numero de ayuda.
- Auditoria de cumplimiento de mandatos de acceso abierto: verificar de forma automatizada que las publicaciones declaran los financiadores exigidos por las politicas de sus agencias.
- Analisis bibliometrico y de politica cientifica: construir agregados de financiacion por agencia, esquema y programa a partir de corpus de articulos, usando la ventana de 65.536 tokens para declaraciones largas.
- Extraccion asistida en pipelines de publicacion: integrar el adaptador como paso de preprocesamiento que convierte el texto libre de agradecimientos y financiacion en JSON validable antes de la revision humana.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| F1 de nombres de financiador | 0,9258 | 300 declaraciones de arXiv reservadas (scorer equilibrado) |
| F1 de identificadores de ayuda bajo el financiador correcto | 0,9136 | 300 declaraciones de arXiv reservadas (scorer equilibrado) |
| Recuperacion de todos los propietarios de una ayuda conjunta | 24 de 170 articulos | Test separado de 170 articulos con ayudas financiadas conjuntamente |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este adaptador ni comparaciones con modelos alternativos.

## Requisitos de hardware

- El adaptador requiere el modelo base Inkling 2 Mini (26.400 millones de parametros) para la inferencia; el adaptador por si solo pesa aproximadamente 2,97 GB.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un MoE de 26.400 millones de parametros en precision de 16 bits requiere del orden de 50 GB o mas solo para pesos, sin contar cache KV; la cifra exacta depende del layout de expertos cuantizados del checkpoint publico.
- GPU recomendadas: no disponibles de forma explicita; el entrenamiento y las evaluaciones se realizaron en infraestructura de Tinker (se menciona el tokenizador H200k, sin detallar el hardware).
- Viabilidad en GPU de consumo: no confirmada; con cuantizacion agresiva podria ser posible en GPUs de 24 GB o mas, pero no hay datos publicados que lo verifiquen.
- Despliegue: el flujo documentado es exclusivamente mediante Tinker (`tinker==0.40.0`, `tinker-cookbook==0.7.0`, `tml-renderers==0.4.2`), con importacion de pesos externos y creacion de un cliente LoRA de rango 64. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, el adaptador se apoya en Inkling 2 Mini (MoE disperso, 26.400 millones de parametros, licencia del modelo base no indicada en esta ficha) y podria compararse con otros extractores de metadatos academicos o con adaptadores LoRA de extraccion de informacion sobre modelos de la misma escala, pero no se han publicado metricas cruzadas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Inkling 2 Mini) | 26.400 M (base) | 65.536 | Extraccion de financiacion | Apache 2.0 | Solo via Tinker |
| Alternativas de extraccion de informacion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las ayudas financiadas conjuntamente son el punto debil: solo se recuperaron todos los propietarios de la ayuda focal en 24 de 170 articulos del test especifico.
- El adaptador solo soporta ingles; no hay evidencia de funcionamiento en otros idiomas.
- La salida es JSON estricto y puede truncarse si alcanza el limite de tokens de salida (el ejemplo de uso lanza error si `stop_reason == "length"`).
- El adaptador usa los nombres de parametro y el layout de expertos de Tinker, incompatibles con el layout cuantizado del checkpoint publico del modelo base; no es cargable directamente con PEFT estandar.
- La importacion requiere una `TINKER_API_KEY`, una organizacion de Tinker con acceso al modelo base y al endpoint experimental de subida de pesos externos; en la fecha de publicacion (26 de noviembre de 2026) el chequeo de importacion devolvio HTTP 400 porque la subida de pesos externos estaba deshabilitada para la organizacion publicadora.
- La licencia Apache 2.0 se aplica al adaptador; conviene verificar la licencia del modelo base Inkling 2 Mini antes de un uso comercial.
- Riesgo de alucinacion en nombres de financiador o identificadores de ayuda no presentes en el texto de entrada; no se documentan mecanismos de abstenccion.
- No se documentan sesgos conocidos ni evaluaciones de robustez fuera del dominio de declaraciones de financiacion de arXiv.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cometadata/funding-extraction-inkling-2-mini-artifact-data-mix-grpo-mixed-reward
- Revision con los pesos exportados: https://huggingface.co/cometadata/funding-extraction-inkling-2-mini-artifact-data-mix-grpo-mixed-reward/tree/39c12ca881be0f30e9826c7b120c6a784da58167
- Job de exportacion: https://huggingface.co/jobs/cometadata/6b087ba06c5d61fff1866b79
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Indice de pesos del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/blob/c9d028302cd0f035fdf8e7e91f089a4ce94d2195/model.safetensors.index.json
- Guia de renderizado de Inkling: https://tinker-docs.thinkingmachines.ai/cookbook/inkling/
- Referencia de la API de checkpoints de Tinker: https://tinker-docs.thinkingmachines.ai/tinker/api-reference/restclient/
- Cambios del SDK de Tinker (v0.40.0): https://tinker-docs.thinkingmachines.ai/changelog/sdk/#v0400
- Dataset de entrenamiento: https://huggingface.co/datasets/cometadata/funding-extraction-artifact-data-mix-grpo-mixed-reward
