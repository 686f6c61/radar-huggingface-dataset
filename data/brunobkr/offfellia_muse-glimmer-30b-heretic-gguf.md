# Brunobkr/OFFFELLIA_Muse-Glimmer-30B-Heretic.gguf

## Resumen

OFFFELLIA_Muse-Glimmer-30B-Heretic es un archivo GGUF publicado por el usuario Brunobkr en HuggingFace, derivado del modelo Muse-Glimmer-30B, un modelo abierto de 30.000 millones de parametros que Meta publico el 10 de agosto de 2026 y que esta disenado para ejecutarse en una unica GPU de consumo. El sufijo "Heretic" indica que se trata de una variante modificada, presumiblemente con las capas de rechazo o alineacion relajadas (uncensored/abliterated), un patron habitual en la comunidad open source. El repositorio aparece como vacio en el momento de la consulta.

El repositorio no incluye pesos verificables: el tamano reportado es de 0,0 GB, sin descargas ni likes, y no se especifica licencia ni pipeline en los metadatos de HuggingFace. La model card publicada no describe el modelo en si, sino el ecosistema de inferencia en el que se enmarca: un fork de llama.cpp denominado OFFFELLIA, escrito en C/C++, con motor agentico multi-turno, soporte de Fill-in-the-Middle, decodificacion especulativa, integracion de herramientas MCP y una interfaz web en SvelteKit/Vite.

Por tanto, esta ficha debe interpretarse con cautela: la informacion disponible describe el entorno de ejecucion y la familia de modelos base, pero no hay datos confirmados sobre cuantizaciones concretas, contexto nativo, idiomas ni resultados de evaluacion del artefacto concreto alojado en este repositorio. Se recomienda tratar el contenido como una ficha exploratoria y verificar el repositorio antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (familia Muse-Glimmer-30B, presumiblemente transformer; sin confirmar para este artefacto) |
| Parametros totales | 30B (segun el nombre del modelo base Muse-Glimmer-30B) |
| Parametros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible (el valor -c 50000 de la model card es configuracion de runtime del fork llama.cpp, no especificacion del modelo) |
| Tipos de cuantizacion | GGUF (el repositorio declara el formato GGUF; cuantizaciones concretas no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en metadatos; la model card menciona licencia MIT para el fork, y Meta publica una Usage Policy para el modelo base |
| Formato de pesos | GGUF |
| Autor del repositorio | Brunobkr |
| Fecha de creacion | 2026-09-25 |
| Tamano del repositorio | 0,0 GB (sin pesos verificables en la fecha de consulta) |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada sobre la arquitectura, el dataset de entrenamiento, el numero de tokens utilizados ni el proceso de alineacion (RLHF/DPO) de este artefacto concreto. El repositorio no incluye documentacion al respecto y los metadatos de HuggingFace no especifican pipeline ni idiomas. La model card se limita a describir el fork de llama.cpp OFFFELLIA (C++17/20, Vulkan, servidor con soporte de agentes, herramientas MCP, decodificacion especulativa orientada a programacion y WebUI en SvelteKit), no el modelo en si.

Respecto al modelo base, la informacion de busqueda indica que Muse-Glimmer-30B es un modelo abierto de Meta publicado el 10 de agosto de 2026, con 30.000 millones de parametros, orientado a ejecucion local en una sola GPU de consumo y acompanado de una Usage Policy corporativa. El sufijo "Heretic" sugiere un ajuste posterior orientado a eliminar mecanismos de rechazo, pero no se documenta la metodologia. Cualquier afirmacion adicional sobre atencion, mezcla de expertos, decodificacion especulativa nativa o composicion del dataset seria especulativa y no se incluye.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base de 30B, sin verificacion independiente en este repositorio.
- Codigo y rellenado intermedio (FIM): la model card del fork menciona soporte nativo de Fill-in-the-Middle para generacion y completado de codigo.
- Razonamiento agentico multi-turno: el ecosistema OFFFELLIA declara un motor agentico autonomo con bucles multi-paso y modo `--agent`.
- Tool calling y MCP: soporte declarado de herramientas mediante Model Context Protocol y modo `--tools all` en el servidor.
- Decodificacion especulativa: el fork incorpora decodificacion especulativa optimizada para programacion.
- Modo razonamiento: el arranque sugerido incluye `--reasoning auto`.
- Capacidades multilingues: no disponibles.
- Vision u otras modalidades: no disponibles.
- Comportamiento "uncensored": inferido por el sufijo "Heretic", sin documentacion tecnica que lo respalde.

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en un editor mediante FIM y decodificacion especulativa para autocompletar y generar bloques de codigo sin enviar datos a la nube, aprovechando el soporte del fork llama.cpp para `--reasoning` y herramientas.
- Agente autonomo en local: con el motor agentico multi-turno y soporte MCP, puede orquestar tareas de varios pasos (busqueda en repositorios, edicion de archivos, ejecucion de comandos) en una estacion de trabajo con GPU de 24 GB.
- Sustitucion de APIs en entornos con requisitos de privacidad: al ejecutarse sobre llama.cpp con `--load-mode mmap`, permite desplegar un asistente de texto sobre datos sensibles sin salida a internet.
- Prototipado rapido de pipelines de IA: la combinacion de servidor HTTP, WebUI SvelteKit y `--cors-origins` facilita montar demos y pruebas de concepto con un solo binario.
- Generacion de documentacion tecnica: un modelo de 30B sin censura estricta puede redactar manuales, notas de version o explicaciones de codigo sin rechazar contenido tecnico sensible.
- Analisis de texto largo en local: si el modelo base confirma una ventana de contexto amplia, permitiria resumir informes o transcripciones en una sola pasada; conviene verificar la longitud real soportada por la cuantizacion elegida.
- Fine-tuning o evaluacion de modelos "abliterated": util como referencia para investigadores que estudian el efecto de eliminar capas de rechazo en el comportamiento de un LLM de 30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Muse-Glimmer-30B requiere al menos 24 GB de VRAM en su presentacion sin cuantizar, segun la cobertura de prensa consultada. El artefacto GGUF permitiria reducir este requisito en funcion de la cuantizacion elegida (no disponible).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB) y superiores para el modelo completo; A100 40/80 GB y H100 para despliegues multiusuario.
- GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 4090, RTX 3090) segun la informacion del modelo base.
- Opciones de despliegue: llama.cpp y el fork OFFFELLIA (`llama-server`), y por compatibilidad de formato GGUF, tambien Ollama, LM Studio y otros runners basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles. El arranque sugerido en la model card utiliza `-ngl 99`, `-ctk q8_0`, `-ctv q8_0`, `-b 2048`, `-ub 1024` y Flash Attention activada, lo que sugiere busqueda de velocidad sobre precision en la cache KV.
- Aceleracion: el fork se compila con `-DGGML_VULKAN=ON`, lo que permite usar GPUs AMD e Intel ademas de NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brunobkr/OFFFELLIA_Muse-Glimmer-30B-Heretic.gguf | 30B (base) | No disponible | No disponible | No disponible | Repositorio de 0,0 GB, sin pesos verificables |
| 0bserverx/Muse-Glimmer-30B-Heretic-GGUF | 30B (base) | No disponible | No disponible | No disponible | Publicado en HuggingFace, consultar repositorio |
| meta-models/Muse-Glimmer-30B | 30B | No disponible | Publicado segun el autor base | Usage Policy de Meta | Repositorio oficial del modelo base |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas del mismo tamano. La comparacion se limita a la existencia y disponibilidad de artefactos equivalentes.

## Limitaciones y advertencias

- Repositorio vacio: el tamano reportado es de 0,0 GB y no se han registrado descargas; es probable que los pesos no esten subidos o que el repositorio este incompleto. Verificar antes de cualquier uso.
- Licencia indeterminada: los metadatos de HuggingFace no especifican licencia. La model card menciona MIT para el fork de llama.cpp, pero el modelo base Muse-Glimmer-30B esta sujeto a la Usage Policy de Meta. La combinacion de ambos marcos no se aclara.
- Procedencia del ajuste "Heretic": no hay metodologia publicada; se desconoce que capas o comportamientos se han modificado y con que datos.
- Riesgo de contenido inapropiado: la naturaleza "uncensored" implica mayor probabilidad de generar contenido sensible, sesgado o inseguro sin filtros. No apto para productos orientados al usuario final sin moderacion adicional.
- Alucinacion: sin evaluacion publicada, no hay garantia sobre la tasa de alucinacion ni sobre la fiabilidad factual.
- Contexto e idiomas: no confirmados; el valor `-c 50000` de la model card es una configuracion de runtime sobre otro archivo distinto (gemma-4-26B-A4B), no una especificacion de este modelo.
- Confusion de artefactos en la model card: el comando de ejemplo apunta a un archivo GGUF con nombre `ΩFFFΣLLIα_IQ4_NL_gemma-4-26B-A4B-it-ultra-uncensored-heretic.gguf`, que no coincide con el nombre del repositorio. Conviene no asumir que la cuantizacion IQ4_NL ni la arquitectura MoE (A4B) aplican a este modelo.
- Rendimiento en produccion: sin benchmarks ni pruebas de carga publicadas, no se puede estimar throughput, latencia ni estabilidad en entornos multiusuario.
- Uso comercial: restringido por la incertidumbre sobre la licencia del modelo base y del artefacto derivado; consultar la Usage Policy de Meta antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Brunobkr/OFFFELLIA_Muse-Glimmer-30B-Heretic.gguf
- Modelo base en HuggingFace: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Variante Heretic GGUF similar: https://huggingface.co/0bserverx/Muse-Glimmer-30B-Heretic-GGUF
- Pagina del modelo base de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Sitio informativo sobre Muse Glimmer: https://museglimmer.site/
- Cobertura de prensa sobre requisitos de hardware: https://www.digitaltrends.com/computing/metas-new-ai-model-runs-entirely-offline-but-your-gpu-needs-to-keep-up/
- Repositorio del fork llama.cpp OFFFELLIA: https://github.com/brunoconta1980-tech/llama_OFFFELLIA_1984
- Proyecto ROCmFPX citado en la model card: https://github.com/charlie12345/ROCmFPX
