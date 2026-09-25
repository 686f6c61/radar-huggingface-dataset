# mradermacher/North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF

## Resumen

North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF es un repositorio de cuantizaciones GGUF creado por mradermacher a partir del modelo OS-Software/North-Mini-Code-1.0-Uncensored-Heretic. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local: el autor aplica cuantizacion con importance matrix (imatrix, prefijo i1), una tecnica que calcula la relevancia de cada tensor sobre un corpus de calibracion para reducir el error de las cuantizaciones de baja precision. El modelo subyacente tiene 30.484.303.872 parametros (~30,5 B) y esta orientado a codigo, chat y uso como agente, segun las etiquetas del repositorio.

La etiqueta "uncensored/decensored/abliterated/heretic" indica que el modelo base ha sido sometido a un proceso de eliminacion de la direccion de rechazo (abliteration), de modo que no aplica filtros de seguridad al generar respuestas. Esto lo situa en una categoria muy concreta: modelos de codigo para entornos locales donde el operador asume el control total del contenido generado. La licencia apache-2.0 permite uso comercial sin royalties.

El repositorio es de creacion reciente (25 de septiembre de 2026) y no registra descargas ni "me gusta" en el momento de la consulta, por lo que no existe validacion comunitaria independiente. Solo publica dos cuantizaciones (i1-Q2_K e i1-IQ3_M) y el archivo imatrix; el resto del catalogo de cuantizaciones anunciado en las etiquetas esta disponible en el repositorio de cuantizaciones estaticas del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card; sin indicios de MoE) |
| Parametros totales | 30.484.303.872 (~30,5 B) |
| Parametros activos | no aplica (no se ha confirmado una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Publicadas en este repo: i1-Q2_K (11,5 GB) e i1-IQ3_M (13,7 GB), mas archivo imatrix (0,2 GB). El catalogo de etiquetas del autor menciona ademas Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M y Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. La model card del repositorio de cuantizacion no incluye detalles sobre el tipo de red (transformer denso, MoE, hibrida), el numero de capas, las dimensiones de atencion ni el mecanismo de atencion empleado. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre el volumen de tokens, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO. El unico dato estructural confirmado es el recuento de parametros (30.484.303.872) y que el modelo se distribuye con la libreria transformers.

La innovacion tecnica documentada pertenece al proceso de cuantizacion, no al entrenamiento. mradermacher aplica cuantizacion i1 (basada en importance matrix) calculada con su herramienta, y publica el propio archivo imatrix para que terceros puedan generar sus propias cuantizaciones. El autor advierte que la cuantizacion de dos bits incluida (i1-Q2_K, 11,5 GB) es inferior en calidad a IQ3_XXS, una recomendacion coherente con la grafica comparativa de perplejidad de ikawrakow que se enlaza en la propia model card.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado explicitamente como `code`, lo que situa la escritura, completado y refactorizacion de codigo como capacidad principal.
- Conversacion multi-turno: etiquetado como `conversational` y `chat`.
- Uso como agente: etiquetado como `agent`, lo que implica soporte previsto para flujos de varios pasos y, presumiblemente, llamadas a herramientas (no confirmado por documentacion explicita).
- Generacion sin filtros de seguridad: las etiquetas `uncensored`, `decensored`, `abliterated` y `heretic` indican que se ha eliminado la direccion de rechazo, por lo que el modelo no se niega a priori a generar contenido que otros modelos rechazarian.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidad de razonamiento, matematicas o vision: no disponible; no hay etiquetas ni documentacion que las confirmen.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente de codigo en entornos aislados (air-gapped): al distribuirse en GGUF, el modelo puede ejecutarse integramente en local con llama.cpp u Ollama, sin enviar codigo propiedad de la empresa a APIs externas. Es el escenario natural para equipos con requisitos estrictos de confidencialidad.
- Integracion en IDE y pipelines de desarrollo: la cuantizacion i1-IQ3_M (13,7 GB) permite servir el modelo en una estacion de trabajo con GPU de 24 GB y ofrecer autocompletado, generacion de tests y refactorizacion mediante un servidor local compatible con la API de OpenAI.
- Agentes autonomos de modificacion de repositorios: la etiqueta `agent` sugiere que el modelo esta pensado para bucles de varios pasos; puede emplearse como nucleo de un agente que lea issues, localice los ficheros afectados y proponga parches en un flujo supervisado.
- Red teaming y analisis de seguridad ofensivo: en pruebas de penetracion autorizadas, un modelo sin filtros de rechazo evita las fricciones habituales al generar PoC, payloads de prueba o analisis de vulnerabilidades. El uso queda estrictamente bajo la responsabilidad del operador y del marco legal aplicable.
- Investigacion sobre alineacion y seguridad: sirve como sujeto de estudio para medir como afecta la abliteration a la calidad del modelo (perdida de coherencia, repeticiones, degradacion en tareas de razonamiento) comparandolo con el modelo original sin abliterar.
- Documentacion tecnica y traduccion de codigo a lenguaje natural: generacion de docstrings, comentarios y documentacion de API en ingles a partir de bases de codigo existentes, en procesos batch ejecutados de noche sobre un repositorio completo.
- Analisis de codigo legacy: explicacion paso a paso de fragmentos antiguos o poco documentados, aprovechando la ventana de contexto (longitud no confirmada) para cargar varios ficheros relacionados a la vez.
- Despliegue en hardware de consumo: con la cuantizacion i1-Q2_K (11,5 GB) el modelo cabe en GPUs de 16 GB, lo que habilita asistencia de codigo local en equipos de gama alta de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizacion ni los resultados de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion. Tampoco se han publicado mediciones de perplejidad para las cuantizaciones concretas de este repositorio.

## Requisitos de hardware

Las cifras de VRAM de las cuantizaciones publicadas son datos concretos (tamano de fichero); el resto son estimaciones derivadas de forma directa del numero de parametros.

- Peso completo en FP16/BF16: aproximadamente 61 GB (30,5 B x 2 bytes). No cabe en GPU de consumo; requiere H100, A100 80 GB o dos GPU de 48 GB.
- i1-IQ3_M (13,7 GB): cabe con holgura en RTX 4090, RTX 3090, A6000 o L40S (24 GB o mas), dejando margen para contexto. En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) entra con contexto reducido u offload parcial de capas a CPU.
- i1-Q2_K (11,5 GB): cabe en GPUs de 16 GB y, con offload parcial, en GPUs de 12 GB.
- Cuantizaciones intermedias no publicadas en este repo (estimacion): Q4_K_M rondaria los 18-19 GB y requeriria 24 GB de VRAM; Q5_K_M y Q6_K superarian los 21 GB y 25 GB respectivamente.
- Ejecucion solo en CPU: viable con llama.cpp y el fichero i1-IQ3_M (13,7 GB) en sistemas con 16-32 GB de RAM, a costa de una velocidad muy inferior a la de GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui soportan GGUF de forma nativa. El soporte de GGUF en vLLM es experimental y su uso en TGI no es el camino recomendado para este formato.
- Latencia y throughput: no disponible. El repositorio no publica mediciones de tokens por segundo en ninguna configuracion de hardware.

## Comparativa con modelos similares

No hay datos publicos de rendimiento que permitan comparar este modelo con alternativas de su categoria. La tabla recoge las variantes directamente relacionadas y los datos verificables de cada repositorio.

| Modelo | Parametros | Formato | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF) | ~30,5 B | GGUF (imatrix) | en | apache-2.0 | Solo i1-Q2_K e i1-IQ3_M publicadas; 0 descargas |
| OS-Software/North-Mini-Code-1.0-Uncensored-Heretic | ~30,5 B | safetensors (transformers) | en | apache-2.0 | Modelo base sin cuantizar; contexto y datos de entrenamiento no disponibles |
| mradermacher/North-Mini-Code-1.0-Uncensored-Heretic-GGUF | ~30,5 B | GGUF (estatico) | en | apache-2.0 | Mismo modelo base, catalogo de cuantizaciones estaticas |
| mradermacher/North-Mini-Code-1.0-i1-GGUF | no disponible | GGUF (imatrix) | en | apache-2.0 | Variante sin la etiqueta "uncensored"; se desconoce si comparte el mismo base |

Otras familias de modelos de codigo de tamano comparable (por ejemplo, modelos densos de 30-35 B publicados por laboratorios conocidos) no se incluyen en la tabla porque la informacion proporcionada no contiene datos que permitan una comparacion verificable.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el proceso de abliteration elimina los rechazos del modelo. Puede generar codigo malicioso, contenido ofensivo o material ilegal si se le solicita. La responsabilidad legal recae integramente en quien lo despliega.
- Degradacion por abliteration: es habitual que la eliminacion de la direccion de rechazo introduzca perdida de coherencia, repeticiones y un deterioro medible en tareas de razonamiento y matematicas. No se han publicado mediciones que cuantifiquen este efecto en este modelo concreto.
- Perdida de calidad por cuantizacion agresiva: el propio autor senala que i1-Q2_K (11,5 GB) es probablemente peor que IQ3_XXS. Las cuantizaciones de dos y tres bits incrementan la tasa de alucinacion y los errores de sintaxis en codigo generado.
- Idioma: el modelo solo declara soporte de ingles. El rendimiento en castellano es desconocido y previsiblemente deficiente.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de analisis de repositorios extensos.
- Procedencia opaca: al ser un derivado de un modelo comunitario sin paper, sin dataset documentado y sin evaluaciones publicadas, no hay forma de auditar que el entrenamiento no haya incorporado material con restricciones de licencia.
- Validacion nula: el repositorio registra 0 descargas y 0 "me gusta", por lo que no existe evidencia de uso en produccion ni retroalimentacion de terceros.
- Alucinacion de API: como cualquier modelo de codigo, tiende a inventar funciones, firmas y librerias inexistentes; requiere verificacion mediante compilacion y tests antes de aceptar cualquier sugerencia.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, pero el usuario asume toda la responsabilidad sobre el contenido generado.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/OS-Software/North-Mini-Code-1.0-Uncensored-Heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/North-Mini-Code-1.0-Uncensored-Heretic-GGUF
- Cuantizaciones i1 de la variante sin etiqueta "uncensored": https://huggingface.co/mradermacher/North-Mini-Code-1.0-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Referencia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Ficha de terceros con el modelo en dos partes: https://local-ai-zone.github.io/models/north-mini-code-1-0.html
- Ficha de terceros en Inferix: https://inferix.co/models/mradermacher/North-Mini-Code-1.0-i1-GGUF
