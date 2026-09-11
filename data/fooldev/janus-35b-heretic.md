# FoolDev/Janus-35B-HERETIC

## Resumen

Janus-27B (publicado en el Hub como `FoolDev/Janus-35B-HERETIC`) es un modelo de lenguaje denso de 27B, multimodal y sin censura, distribuido por el usuario FoolDev como reempaquetado y cuantizado del modelo `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved`. No se ha entrenado nada en este repositorio: el autor lo declara explícitamente y solo convierte los pesos a GGUF, elimina el módulo MTP nativo (para que llama.cpp y Ollama estándar puedan cargarlo) y añade plantillas de chat y de tool calling. El resultado son 26.895.998.464 parámetros reales (etiquetados comercialmente como 27B, pese al "35B" del identificador del repositorio).

El modelo se apoya en una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 con YaRN (no integrado), y hereda del linaje base la etiqueta de abliteración estilo Heretic, la destilación de razonamiento con un profesor denominado "Claude Fable 5" y un conjunto de datasets de escritura creativa, código, matemáticas y razonamiento. La ficha del autor insiste en que ese linaje es atribución, no un registro de entrenamiento verificable en este repositorio.

Es relevante ahora porque combina tres cosas difíciles de encontrar juntas en el ecosistema abierto: pesos densos de ~27B con contexto nativo de 256K, capacidades declaradas de imagen-a-texto y de agente con tool calling, y un empaquetado listo para ejecución local en Ollama/llama.cpp bajo licencia Apache 2.0. Su adopción real, sin embargo, es todavía muy baja: 98 descargas y 2 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.8 27B, segun la model card); multimodal imagen-texto |
| Parametros totales | 26.895.998.464 (~26,9B; nominalmente 27B) |
| Parametros activos | No aplica: modelo denso, todos los parametros activos |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.010.000 con YaRN (no integrado). `num_ctx` por defecto en Ollama: 65.536 |
| Tipos de cuantizacion | GGUF Q4_K_M (unico cuantizado documentado en la informacion disponible); resto no disponible |
| Idiomas soportados | 22 declarados: en, zh, ru, es, fr, it, ja, ko, de, ar, tr, pl, sv, nl, he, id, uk, fa, pt, ms, fi, el |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pesos originales; repo de 109,4 GB) y GGUF (`Janus-27B.Q4_K_M.gguf`, ~17 GB) |
| Libreria | transformers |
| Pipeline declarado | image-text-to-text |
| Modelo base | llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved (relacion: quantized) |
| Fecha de creacion / actualizacion | 2026-05-20 / 2026-09-10 |
| Descargas / likes | 98 / 2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 27B (26,9B reales) con capacidades multimodales de imagen a texto, según la información declarada. El repositorio no entrena ni ajusta nada: toma los pesos de `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved`, los convierte a GGUF y les elimina el módulo MTP (multi-token prediction) nativo. Esa eliminación es deliberada y tiene coste: permite cargar el modelo con llama.cpp y Ollama sin parches, pero descarta el mecanismo de decodificación especulativa que el modelo base preservaba, lo que previsiblemente reduce el throughput respecto al original. La relación declarada con el base es `quantized`.

Sobre el entrenamiento, la model card es tajante: el campo `Teacher:` (Claude Fable 5) y la lista de datasets del frontmatter describen el linaje que reclama el modelo base upstream, no trabajo realizado en este repositorio, y ninguna evaluación de esta ficha mide esos datos. Los datasets citados son Crownelius/Creative_Writing_ShareGPT_Enhanced, microsoft/rStar-Coder, peteromallet/dataclaw-peteromallet, Crownelius/Opus-4.7-Reasoning, openbmb/UltraData-Math y Crownelius/Crow-Heretic-TeichAI-Unified; no se especifican número de tokens, composición porcentual ni si hubo RLHF o DPO. El autor describe el proceso como abliteración estilo Heretic (MPOA, MTP preservado en el base) que reduce el comportamiento de rechazo en las capas base. La única innovación técnica verificable en este repo es de ingeniería de despliegue: una plantilla de chat (`chat_template.jinja`) con el formato de tool call en `auto` que evita errores 500 cuando un cliente compatible con OpenAI reenvía `arguments` como cadena JSON, más un `Modelfile` que expone `.Tools` y `.ToolCalls` al detector de capacidades de Ollama.

## Capacidades

- Generacion de texto conversacional multi-turno, con `num_ctx` por defecto de 65.536 tokens y hasta 262.144 nativos.
- Razonamiento explicito en modo thinking: `ollama show` lista `thinking` entre las capacidades del modelo empaquetado.
- Tool calling / function calling: capacidad `tools` declarada, con plantilla dedicada y compatibilidad con clientes OpenAI.
- Uso como agente y razonamiento multi-paso: la etiqueta `agent` figura entre los tags del repositorio.
- Codigo: el linaje base cita microsoft/rStar-Coder entre sus datasets; el modelo no publica evaluaciones propias al respecto.
- Matematicas: el linaje base cita openbmb/UltraData-Math.
- Multimodal imagen-texto: `pipeline_tag: image-text-to-text` y tag `multimodal`.
- Multilingue: 22 idiomas declarados, con espanol, ingles, chino, ruso, arabe, hindi (no listado), japones, coreano, aleman, frances, italiano, portugues, turco, polaco, sueco, neerlandes, hebreo, indonesio, ucraniano, persa, malayo, fines y griego.
- Sin censura: abliterado y etiquetado como `uncensored` / `heretic`; el comportamiento de rechazo esta reducido en las capas base.
- Despliegue local con `endpoints_compatible` y empaquetado directo para Ollama.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 262.144 tokens nativos se puede cargar un repositorio completo, un RFC o un conjunto de manuales en una sola pasada y hacer preguntas cruzadas sin trocear el material en fragmentos que pierdan contexto.
- Generacion de codigo en produccion: la plantilla de tool calling compatible con clientes OpenAI permite integrarlo en pipelines de CI/CD o en asistentes de IDE que invocan funciones (ejecutar tests, consultar APIs) en lugar de limitarse a generar texto.
- Agentes autonomos locales: al exponer `tools` y `thinking` en Ollama, se puede construir un bucle de razonamiento multi-paso con llamadas a herramientas que corra enteramente en hardware propio, sin enviar datos a terceros.
- Asistente de escritura creativa sin filtros de rechazo: el linaje incluye Creative_Writing_ShareGPT_Enhanced y el modelo esta abliterado, lo que resulta util en ficcion, guiones o narrativa con tematicas que los modelos alineados convencionales rechazan.
- Razonamiento matematico paso a paso: el modo thinking y la procedencia en UltraData-Math encajan con tutoria matematica o resolucion de problemas que requieren mostrar el desarrollo, no solo la respuesta.
- Procesamiento de capturas y diagramas: al ser image-text-to-text, puede extraer texto y estructura de capturas de pantalla, diagramas de arquitectura o tablas escaneadas y devolverlas como texto o JSON.
- Traduccion y atencion multilingue: con 22 idiomas declarados puede cubrir soporte al cliente o localizacion en mercados europeos y asiaticos desde un unico modelo desplegado en local.
- Despliegue en entornos air-gapped o con datos regulados: licencia Apache 2.0 e inferencia 100% local, sin dependencia de APIs externas, para sectores con requisitos de confidencialidad.
- Red teaming y evaluacion de seguridad: al estar abliterado, sirve como sujeto de prueba para medir la eficacia de filtros y clasificadores propios antes de poner un modelo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor declara explicitamente que ninguna evaluacion del repositorio mide los datasets del linaje. Los resultados de busqueda web proporcionados no contienen datos sobre el modelo.

## Requisitos de hardware

- Pesos en GGUF Q4_K_M: ~17 GB de archivo `Janus-27B.Q4_K_M.gguf`, segun el propio autor.
- Con `num_ctx` por defecto de 65.536: ~26 GB totales (pesos + cache KV), cifra indicada por el autor.
- Para acercarse a la ventana nativa de 262.144: el autor indica disponer de ~38 GB de RAM.
- VRAM estimada (derivada de las cifras anteriores, no publicada por el autor): ~17-18 GB para los pesos en Q4_K_M, mas cache KV proporcional al contexto. En una GPU de 24 GB (RTX 3090, RTX 4090) cabe con contextos moderados; a 65.536 tokens la cifra de ~26 GB supera esos 24 GB, por lo que requeriria offload parcial a CPU/RAM o GPUs de 32-48 GB (A100 40 GB, L40S, RTX 6000 Ada).
- Consumer GPU: si, en el rango de 24 GB con contexto reducido; en GPUs de 12-16 GB seria necesario un cuantizado mas agresivo, que no se documenta en el repositorio.
- Contexto completo de 262.144 tokens: fuera del alcance de cualquier GPU de consumo; requiere ~38 GB o mas de RAM/VRAM combinadas.
- Opciones de despliegue documentadas: Ollama (via `ollama run hf.co/FoolDev/Janus-35B-HERETIC` o `ollama create janus -f Modelfile`) y llama.cpp / llama-server (el chat template ya va incrustado en el GGUF; `--chat-template-file` solo para cuantizados sin plantilla). Tambien weights en safetensors para transformers.
- vLLM y TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. Cabe esperar una penalizacion respecto al modelo base por la eliminacion del modulo MTP, pero no hay mediciones publicadas.
- Mas alla de ~262K tokens el contexto degrada, ya que YaRN no esta integrado en los pesos distribuidos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada. La comparacion se limita a la relacion de procedencia:

| Modelo | Relacion | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| FoolDev/Janus-35B-HERETIC (Janus-27B) | Objeto de esta ficha | 26,9B (denso) | 262.144 nativo / 1.010.000 con YaRN | Safetensors + GGUF Q4_K_M | Apache 2.0 | MTP eliminado; plantillas de tool calling incluidas; 98 descargas |
| llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved | Base directo (relacion: quantized) | No disponible (nominalmente 27B) | No disponible | Safetensors | No disponible | Conserva el modulo MTP nativo |
| Qwen/Qwen3.8-27B | Base del linaje (modelo denso multimodal, segun la model card) | No disponible (nominalmente 27B) | No disponible | No disponible | No disponible | Modelo original sin abliterar |
| FoolDev/Thanatos-27B-HERETIC | Modelo hermano del mismo autor | No disponible (nominalmente 27B) | No disponible | No disponible | No disponible | Citado en la model card, sin datos tecnicos |

## Limitaciones y advertencias

- Modelo abliterado y sin censura: reduce deliberadamente las negativas de seguridad, por lo que puede producir contenido que un modelo alineado rechazaria. No es adecuado como asistente orientado a publico general sin una capa de moderacion propia.
- No hay entrenamiento en este repositorio: se trata de conversion a GGUF y eliminacion de MTP. El linaje de destilacion y los datasets citados son atribucion del modelo base upstream y no estan verificados ni evaluados aqui.
- Ausencia total de benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, alucinacion o sesgo. Cualquier decision de despliegue se tomaria sin datos medidos.
- Eliminacion del modulo MTP: se pierde la decodificacion especulativa nativa del base, con la consiguiente perdida de rendimiento en inferencia respecto al original.
- Contexto: por encima de ~262.144 tokens la calidad degrada, porque YaRN no va integrado en los pesos. El `num_ctx` por defecto en Ollama (65.536) es solo una cuarta parte de la ventana nativa.
- Ambiguedad de nomenclatura: el identificador del repositorio dice "35B" pero el modelo es de ~27B. Confusion potencial en catalogos, scripts de despliegue y comparativas automaticas.
- Fechas poco convencionales: creacion en 2026-05-20 y actualizacion en 2026-09-10, con una denominacion de base ("Qwen 3.8") poco habitual. Conviene verificar la procedencia exacta de los pesos antes de usarlos en produccion.
- Idiomas: los 22 idiomas son una declaracion heredada del modelo base, sin evaluacion por idioma. El soporte real en idiomas de bajos recursos (fines, griego, malayo) no esta medido.
- Licencia Apache 2.0 permite uso comercial, pero el autor no garantiza la procedencia ni los derechos sobre los datos de entrenamiento del modelo base; la responsabilidad legal recae en quien despliega.
- Adopcion muy baja (98 descargas, 2 likes): no hay validacion independiente por parte de la comunidad, ni issues, ni informes de terceros que confirmen el comportamiento declarado.
- Riesgo de alucinacion no cuantificado, agravado en tareas de codigo o matematicas donde los datasets de linaje no implican exactitud verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FoolDev/Janus-35B-HERETIC
- Modelo base: https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original del linaje: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo hermano del mismo autor: https://huggingface.co/FoolDev/Thanatos-27B-HERETIC
- Documentacion de Ollama en HuggingFace (mecanismo del bridge): https://huggingface.co/docs/hub/en/ollama
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Dataset Crownelius/Creative_Writing_ShareGPT_Enhanced: https://huggingface.co/datasets/Crownelius/Creative_Writing_ShareGPT_Enhanced
- Dataset microsoft/rStar-Coder: https://huggingface.co/datasets/microsoft/rStar-Coder
- Dataset peteromallet/dataclaw-peteromallet: https://huggingface.co/datasets/peteromallet/dataclaw-peteromallet
- Dataset Crownelius/Opus-4.7-Reasoning: https://huggingface.co/datasets/Crownelius/Opus-4.7-Reasoning
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset Crownelius/Crow-Heretic-TeichAI-Unified: https://huggingface.co/datasets/Crownelius/Crow-Heretic-TeichAI-Unified
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a paginas sobre la zona horaria Eastern Standard Time y no guardan relacion con esta ficha.
