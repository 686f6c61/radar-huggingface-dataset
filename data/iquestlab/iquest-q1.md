# IQuestLab/IQuest-Q1

## Resumen

IQuest-Q1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por IQuest (IQuestLab) y orientado especificamente a coding agentico, razonamiento y uso de herramientas en varios pasos. Cuenta con aproximadamente 320.000 millones de parametros totales y unos 15.000 millones de parametros activados por token, lo que situa su coste de inferencia muy por debajo de un modelo denso del mismo tamano nominal. Se distribuye en formato safetensors con pesos en bfloat16 para su uso con la libreria transformers y con motores de inferencia de alto rendimiento como SGLang o vLLM.

Su rasgo mas diferencial es la ventana de contexto de 524.288 tokens combinada con un patron de atencion hibrido (tres capas de atencion de ventana deslizante por cada capa de atencion completa con sliding window de 4.096 tokens), lo que reduce de forma notable el coste de cache KV en conversaciones y sesiones de agente muy largas. Incorpora ademas capas de Multi-Token Prediction (MTP) que permiten decodificacion especulativa recursiva, con un modulo `mtp` separado en el repositorio.

El modelo es relevante ahora porque ataca un nicho concreto: agentes de linea de comandos y automatizacion de ingenieria de software con sesiones de horas de duracion. Los idiomas declarados son ingles y chino, la licencia es propia (`iquest-q1`, registrada como `other`) y el repositorio ocupa unos 650 GB, lo que condiciona por completo su despliegue a infraestructura multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (3 capas SWA + 1 capa FA) y capas MTP |
| Parametros totales | 320.318.615.552 (320B, dato de safetensors) |
| Parametros activos | ~15B por token |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Otra: licencia propia `iquest-q1` (identificador `license: other`, `license_name: iquest-q1`) |
| Formato de pesos | safetensors (bfloat16); incluye subdirectorio `mtp` para decodificacion especulativa |
| Capas del transformer | 88 |
| Dimension oculta | 3.072 |
| Cabezas de atencion (Q/KV) | 48 / 8 |
| Dimension de cabeza | 128 |
| Tamano de ventana deslizante | 4.096 tokens |
| Dimensiones de RoPE parcial | 32 |
| Expertos (totales / activados) | 256 / 8 |
| Capas MTP | 2 independientes en entrenamiento; 1 recursiva x8 en inferencia (ventana deslizante MTP de 512) |
| Tamano del repositorio | ~650 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

IQuest-Q1 es un transformer MoE de 88 capas con 256 expertos enrutados de los que se activan 8 por token, dimension oculta de 3.072, 48 cabezas de consulta y 8 cabezas de clave/valor con dimension de cabeza 128. El bloque de atencion no es homogeneo: alterna tres capas de atencion con ventana deslizante (swiding window de 4.096 tokens) seguidas de una capa de atencion completa, y aplica RoPE parcial sobre 32 dimensiones. Este diseno mantiene el coste de la cache KV acotado en las capas SWA, que son la mayoria, mientras preserva recuperacion global de informacion cada cuatro capas. El resultado practico es un modelo capaz de sostener 524.288 tokens de contexto con un consumo de memoria de cache mucho menor que un transformer denso equivalente.

Sobre el entrenamiento, la model card describe un pipeline de entrenamiento previo y un pipeline de post-entrenamiento (referenciados mediante diagramas), pero no se detalla en la informacion disponible el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas concretas de RLHF o DPO. Si se documenta el uso de capas MTP: 2 capas independientes durante el entrenamiento y una capa recursiva aplicada hasta 8 veces en inferencia, con ventana deslizante de 512 tokens, que se emplea como mecanismo de decodificacion especulativa (EAGLE en SGLang) con muestreo de rechazo. Se recomienda ademas, para reproducibilidad, temperatura 1.0, top-p 0.95 y top-k 20.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Coding agentico: el modelo esta explicitamente optimizado para tareas de programacion ejecutadas por agentes, incluyendo evaluacion con harnesses como Claude Code, Codex y mini-SWE-agent.
- Razonamiento multi-paso y sostenido en el tiempo: la model card describe tareas con limites de ejecucion de seis a ocho horas (CyberGym, Terminal-Bench 2.1) y sesiones de agente largas.
- Tool calling / function calling: el despliegue oficial incluye `--tool-call-parser iquest_q1` y `--enable-auto-tool-choice`, lo que indica soporte nativo de llamadas a herramientas.
- Modo de razonamiento separado: se proporciona un `--reasoning-parser iquest_q1`, es decir, hay distincion entre trazas de razonamiento y respuesta final en la plantilla de chat.
- Uso de herramientas de linea de comandos (CLI): la propia organizacion publica IQuest-CLIBench, un benchmark interno para medir experiencia de usuario en CLI con este modelo.
- Contexto largo: manejo de hasta 524.288 tokens, adecuado para repositorios completos o historiales de agente extensos.
- Decodificacion especulativa recursiva mediante MTP, que acelera la generacion sin cambiar el modelo objetivo.
- Vision, audio y otras modalidades: no soportadas. La model card indica explicitamente que los modelos actuales no tienen capacidad multimodal y que el contenido multimodal se sustituye por marcadores de posicion durante la tokenizacion.

## Casos de uso

- Agentes de codigo autonomos sobre repositorios completos: con 524.288 tokens de contexto el modelo puede cargar arboles de ficheros, issues y documentacion sin trocear, y ejecutar ciclos de edicion-verificacion usando tool calling para leer, escribir y ejecutar pruebas. Esta es la tarea para la que fue disenado y la que se evalua en DeepSWE v1.1 y el Agents' Last Exam.
- Automatizacion de tareas de terminal y operaciones: con sesiones de varias horas (el benchmark Terminal-Bench 2.1 se evalua con limite de ocho horas) puede encadenar comandos, interpretar salidas y corregir errores, lo que encaja en pipelines de aprovisionamiento, reparacion de builds o migraciones de dependencias.
- Ciberseguridad ofensiva y defensiva asistida: la model card incluye CyberGym entre sus evaluaciones, con limite de seis horas por tarea; un caso realista es el triaje de vulnerabilidades y la reproduccion controlada de exploits en entornos de laboratorio.
- Revision de codigo y refactorizacion en CI/CD: integrado via API compatible con OpenAI, el modelo puede analizar diffs y proponer parches, apoyandose en el parser de tool calling para consultar el repositorio o lanzar linters dentro del pipeline.
- Asistente de desarrollo en IDE con contexto de monorepo: al mantener ventanas largas, el agente conserva el hilo de una sesion de trabajo completa sin perder decisiones previas, algo critico cuando el usuario alterna entre varios modulos.
- Extraccion y sintesis documental bilingue ingles-chino: lectura de documentacion tecnica y generacion de resumenes o traducciones asistidas en esos dos idiomas, con contexto suficiente para manuales completos.
- Investigacion sobre arquitecturas MoE de contexto largo: el modelo es un caso de estudio util para medir el efecto de la atencion hibrida SWA/FA y de MTP recursivo en el coste de cache KV y en el throughput, dado que se publican todos los hiperparametros de arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card hace referencia a una figura de rendimiento y menciona los siguientes conjuntos de evaluacion, pero los valores concretos no aparecen en el texto proporcionado:

| Benchmark | Valor | Notas |
|---|---|---|
| DeepSWE v1.1 | no disponible | Evaluado con mini-SWE-agent |
| Terminal-Bench 2.1 | no disponible | Limite de ejecucion de ocho horas |
| CyberGym | no disponible | Limite de ejecucion de seis horas |
| Agents' Last Exam | no disponible | Evaluado con Claude Code 2.1.258; contenido multimodal sustituido por marcadores |
| Humanity's Last Exam | no disponible | Reportado sin herramientas |
| IQuest-CLIBench | no disponible | Benchmark interno de experiencia de usuario en CLI |
| Comparativa con DeepSeek-V4-Flash / DeepSeek-V4-Pro | no disponible | Referidos a las releases oficiales 0731 y 0813 segun la model card |

Configuracion recomendada de muestreo para reproducibilidad: temperatura 1.0, top-p 0.95, top-k 20, con Claude Code 2.1.140 o Codex 0.142 como harness.

## Requisitos de hardware

- Peso de los parametros en bfloat16: aproximadamente 640 GB (320B parametros x 2 bytes), coherente con un repositorio de 650 GB. No cabe en una unica GPU de 80 GB.
- Configuracion oficial recomendada: `--tp-size 8` en SGLang o `--tensor-parallel-size 8` en vLLM con `--dtype bfloat16`, es decir, 8 GPU como minimo.
- GPU recomendadas: 8x H100 80 GB (640 GB de VRAM agregada, al limite; el comando oficial usa `--mem-fraction-static 0.85`), o mejor 8x H200 141 GB / B200 para disponer de margen para cache KV y contexto largo. El repositorio tambien indica `cu130` en sus imagenes Docker, por lo que se asume una pila CUDA 13.0.
- Cache KV: segun las especificaciones publicadas, solo 22 de las 88 capas (una de cada cuatro) son de atencion completa; el resto usa ventana deslizante de 4.096 tokens. Con 8 cabezas KV de 128 dimensiones en bfloat16, la cache de las capas completas ronda los 88 KB por token, del orden de 45-50 GB para los 524.288 tokens en una unica secuencia. Es una estimacion derivada de los hiperparametros de la model card, no un dato publicado; el consumo real dependera del motor y del batching.
- GPU de consumo (RTX 4090, RTX 5090, etc.): no es viable. Ni siquiera en cuantizacion a 4 bits (unos 160 GB teoricos de pesos) cabria en una GPU consumer, y no se publican pesos cuantizados.
- Opciones de despliegue documentadas: SGLang (imagen preconstruida `iquestlabworkspace/sglang-iquest-q1:cu130`) y vLLM (imagen `iquestlabworkspace/vllm-iquest-q1:cu130`), ambos con API compatible con OpenAI en `http://127.0.0.1:8000/v1`. Se usan `--load-format fastsafetensors`, `--attention-backend fa3` y `--enable-torch-compile`. llama.cpp, Ollama y TGI no aparecen en la documentacion disponible, y al no haber GGUF no son aplicables de forma directa.
- Decodificacion especulativa: SGLang permite activar MTP recursivo con `--speculative-algorithm EAGLE`, `--speculative-num-steps 5`, `--speculative-eagle-topk 1`, `--speculative-num-draft-tokens 6` y `--speculative-draft-model-path "$MODEL_ROOT/mtp"`, con muestreo de rechazo.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de IQuest-Q1 ni de las especificaciones de DeepSeek-V4-Flash/Pro en la informacion proporcionada, por lo que la comparacion de rendimiento queda como no disponible. La tabla recoge unicamente datos de arquitectura y licencia ampliamente publicos de alternativas de la misma categoria (MoE de gran escala con activacion reducida); conviene verificar cada dato en la fuente oficial antes de citarlo.

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| IQuest-Q1 | 320B / ~15B | 524.288 | Propietaria `iquest-q1` | safetensors, transformers, SGLang, vLLM |
| DeepSeek-V4-Flash / Pro | no disponible | no disponible | no disponible | no disponible (referenciados en la model card) |
| DeepSeek-V3 | 671B / 37B | 128K | MIT | safetensors, amplio soporte de motores |
| Qwen3-235B-A22B | 235B / 22B | 128K (extensible) | Apache 2.0 | safetensors, GGUF y multiples cuantizaciones |
| GLM-4.5 | 355B / 32B | 128K | MIT | safetensors, ecosistema amplio |

Diferencias destacables: IQuest-Q1 multiplica por cuatro la ventana de contexto de estas alternativas declarando un contexto nativo de 524.288 tokens, y su licencia no es de codigo abierto permisiva, lo que lo aleja de MIT o Apache 2.0. Tambien es, de los aqui listados, el unico sin cuantizaciones publicadas.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo la licencia propia `iquest-q1` (identificador `other`). Las condiciones para uso comercial, redistribucion o modelos derivados no se detallan en la informacion disponible y deben consultarse en el fichero LICENSE del repositorio antes de cualquier despliegue en produccion.
- Sin capacidades multimodales: la model card confirma que el modelo no procesa imagenes ni audio, y que el contenido multimodal se reemplaza por marcadores de posicion. Cualquier caso de uso con vision requiere otro modelo.
- Idiomas limitados a ingles y chino: no se declara soporte de castellano ni de otras lenguas, con el riesgo de degradacion de calidad que ello implica.
- Riesgo de alucinacion: como cualquier modelo de lenguaje generativo, puede producir codigo o comandos plausibles pero incorrectos. En tareas agenticas con acceso a shell, esto es especialmente sensible y exige sandboxing, limites de permisos y supervision humana.
- Ausencia de datos publicados de benchmarks y de evaluacion independiente: no hay cifras verificables en la informacion disponible ni comparaciones reproducibles frente a alternativas.
- Huella de despliegue muy elevada: 650 GB de repositorio y 8 GPU como minimo implican coste de inferencia y de almacenamiento alto, ademas de tiempos de descarga y carga considerables.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ, GPTQ ni FP8 oficiales, lo que limita el despliegue en hardware economicamente accesible y complica la integracion en herramientas de consumo como Ollama o LM Studio.
- Sesgos: no se documenta en la informacion disponible ninguna evaluacion de sesgos, toxicidad o alineacion.
- Fecha de publicacion en HuggingFace inusualmente avanzada (2026-09-28) y contador de descargas a cero, lo que sugiere un lanzamiento reciente o poco difundido; conviene verificar el estado del repositorio antes de depender de el.
- Dependencia de harnesses concretos: los resultados que se citan en la model card se obtienen con versiones especificas de Claude Code, Codex y mini-SWE-agent, por lo que el rendimiento puede variar sustancialmente con otras integraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IQuestLab/IQuest-Q1
- Licencia: https://huggingface.co/IQuestLab/IQuest-Q1/blob/main/LICENSE
- Repositorio GitHub de IQuest-Q1: https://github.com/IQuestLab/IQuest-Q1
- Imagen Docker SGLang: https://hub.docker.com/repository/docker/iquestlabworkspace/sglang-iquest-q1/tags/cu130
- Imagen Docker vLLM: https://hub.docker.com/repository/docker/iquestlabworkspace/vllm-iquest-q1/tags/cu130
- SGLang: https://github.com/sgl-project/sglang
- vLLM: https://github.com/vllm-project/vllm
- Sitio de IQuest Coder: https://iquestlab.github.io/
- Repositorio GitHub de IQuest-Coder-V1: https://github.com/IQuestLab/IQuest-Coder-V1
- Guia de terceros sobre IQuest Coder V1: https://codersera.com/blog/iquest-coder-v1-install-run-use-open-source-ai-model/
