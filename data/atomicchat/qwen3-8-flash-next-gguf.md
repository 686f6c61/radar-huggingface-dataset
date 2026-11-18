# AtomicChat/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture of Experts (MoE) con capacidades multimodales (texto e imagen) desarrollado por el equipo de Qwen (Alibaba). Segun la model card del cuantizador, se trata del primer lanzamiento de pesos abiertos de la arquitectura que esta detras de Qwen4. Con 176.943.899.520 parametros totales, es un modelo de gran escala orientado a generacion de texto conversacional y razonamiento multimodal.

AtomicChat/Qwen3.8-Flash-Next-GGUF es la version cuantizada del modelo original, publicada por AtomicChat con su propia importance matrix (imatrix) y corpora de calibracion publicos. El repositorio ocupa 242,7 GB e incluye tanto los pesos cuantizados como un proyector multimodal (`mmproj`) en F16 para el procesamiento de vision.

La innovacion mas destacable de esta distribucion es su estrategia de memoria: aproximadamente 51B de los 177B parametros no son pesos convencionales, sino una tabla de busqueda n-gram que se consulta por hash de los ultimos tres tokens y que permanece en SSD en lugar de cargarse en memoria. Esto permite ejecutar el modelo en un Apple M5 Max con 64 GB de RAM a unas 36 tok/s, con vision habilitada, a pesar de que el archivo cuantizado (85 GB) supera la RAM total del equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con componentes multimodales; incluye tabla de busqueda n-gram hasheada |
| Parametros totales | 176.943.899.520 (177B) |
| Parametros activos | no disponible (la model card menciona que los expertos tocan unos 6B parametros por token, sin confirmar el total activo) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de ejecucion); maximo no disponible |
| Tipos de cuantizacion | GGUF con imatrix propia: `AD-3.84bpw-IQ4_XS-M64`, `AD-4.27bpw-Q4_K_M-M64`, `AD-5.00bpw-Q5_K_M-M64` |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (tres shards por build) + `mmproj-Qwen3.8-Flash-Next-F16.gguf` para vision |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un transformer MoE con capacidad multimodal (procesamiento de imagen mediante un proyector `mmproj` en F16). La particularidad estructural mas relevante es la presencia de una tabla de busqueda n-gram: el modelo aplica un hash sobre los ultimos tres tokens y obtiene 16 filas de 160 valores cada una, lo que supone unos 2,7 KB por token leidos una vez por forward pass desde una tabla de 39 GB. Esta tabla representa aproximadamente 51B de los 177B parametros y se disena para residir en SSD, con un ratio de lectura de 1 entre 13 millones sobre direcciones deterministas, generando unos 3 MB/s de lecturas aleatorias a 36 tok/s.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. La model card tampoco detalla innovaciones adicionales como decodificacion especulativa o atencion lineal. Los datos de calibracion de las cuantizaciones son publicos y estan disponibles en el dataset `AtomicChat/calib-corpora`.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado como `text-generation`.
- Procesamiento multimodal de imagen: el repositorio incluye un proyector `mmproj` en F16 y la model card demuestra ejecucion con vision mediante `llama-mtmd-cli`.
- Razonamiento y generacion de codigo: inferido de la categoria del modelo base y de la familia Qwen, aunque no se documentan benchmarks especificos en la informacion disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs compatibles.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Capacidades de agente y tool calling: no confirmadas explicitamente en la informacion disponible.
- Cobertura multilingue: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en equipos de memoria limitada: el diseno de tabla n-gram en SSD permite ejecutar un modelo de 177B en un Apple M5 Max de 64 GB, con el build `AD-4.27bpw` ocupando 56,1 GB en memoria y 38,4 GB en disco. Adecuado para desarrolladores que quieren un modelo de gran escala sin infraestructura de servidor.
- Analisis de documentos con imagenes: usando `llama-mtmd-cli` con el proyector F16, se pueden procesar capturas, diagramas o documentos escaneados junto con texto en un mismo flujo, con 32K tokens de contexto.
- Asistentes conversacionales de escritorio: la integracion con Atomic Chat, aplicacion que ejecuta modelos open-weight de forma local y offline, permite desplegar un asistente privado sin conexion a servicios externos.
- Prototipado de agentes multimodales: la ventana de 32.768 tokens y el soporte de plantillas Jinja facilitan la construccion de pipelines con historial largo y entradas de imagen.
- Evaluacion e investigacion de arquitecturas MoE con componentes n-gram: la publicacion de la imatrix y los corpora de calibracion permite reproducir y auditar el proceso de cuantizacion.
- Despliegue en estaciones de trabajo con GPU de gran VRAM: el build `AD-5.00bpw` (56,1 GB en memoria) encaja en GPUs de 64 GB o superiores para servir el modelo con llama.cpp.
- Experimentacion con variantes sin rechazos: existe una version `Qwen3.8-Flash-Next-Uncensored-GGUF` con builds y un adaptador LoRA compatible con estos cuantizados, orientada a investigacion sobre comportamiento del modelo.

## Benchmarks y rendimiento

La model card proporciona metricas de calidad de cuantizacion medidas contra las logits del modelo BF16 sobre un conjunto neutral de 87 fragmentos a 4096 de contexto, con PPL BF16 de 4,0445 ± 0,0216:

| Build | En memoria | En SSD | Total | KLD media | Mismo top-1 | Ratio PPL |
|---|---|---|---|---|---|---|
| `AD-3.84bpw-IQ4_XS-M64` | 45,8 GB | 39,1 GB | 84,9 GB | 0,2277 | 82,68% | 1,102 |
| `AD-4.27bpw-Q4_K_M-M64` | 56,1 GB | 38,4 GB | 94,5 GB | 0,0842 | 89,49% | 1,026 |
| `AD-5.00bpw-Q5_K_M-M64` | 56,1 GB | 54,4 GB | 110,5 GB | 0,0837 | 89,55% | 1,026 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM en memoria: 45,8 GB para `AD-3.84bpw`, 56,1 GB para `AD-4.27bpw` y `AD-5.00bpw`. El espacio en SSD necesario es de 39,1 GB, 38,4 GB y 54,4 GB respectivamente, con tamanos totales de 84,9 GB, 94,5 GB y 110,5 GB.
- Apple Silicon: validado en un M5 Max con 64 GB de memoria a 36 tok/s con vision. Requiere `sudo sysctl iogpu.wired_limit_mb=57344` y que la tabla n-gram resida en su propio shard GGUF (`-00003-of-00003.gguf`), ya que de lo contrario Metal mapea toda la region y falla con `kIOGPUCommandBufferCallbackErrorOutOfMemory`.
- GPU dedicadas: no se documentan pruebas en A100, H100 o RTX 4090. Por el volumen de memoria en GPU, los builds de 56,1 GB requeririan GPUs de 64 GB o mas (A100 80GB, H100 80GB); el build de 45,8 GB podria caber en GPUs de 48 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 32 GB con los builds publicados.
- Despliegue: llama.cpp con soporte para Qwen3.8-Flash-Next. Comandos de referencia: `llama-cli -m ... -ngl 99 -c 32768 --jinja -fit off` y `llama-mtmd-cli` con `--mmproj` para vision. No se mencionan vLLM, TGI ni Ollama.
- Throughput: 36 tok/s en M5 Max con 64 GB. Latencia por token de aproximadamente 28 ms segun el presupuesto descrito en la model card.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, el propio modelo base Qwen/Qwen3.8-Flash-Next en BF16 seria la alternativa directa, pero requiere recursos muy superiores a los de estos cuantizados.

## Limitaciones y advertencias

- La licencia `qwen-community-1.0` esta etiquetada como `other` en Hugging Face; es necesario revisar el texto completo en el enlace de licencia antes de cualquier uso comercial.
- El repositorio ocupa 242,7 GB y cada build requiere descargar entre 85 y 110 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables.
- La ejecucion en Apple Silicon depende de una configuracion fragil: la tabla n-gram debe estar en un shard separado y el limite de memoria cableada debe ajustarse manualmente; un error de configuracion provoca fallo en el primer decode.
- El rendimiento medido (36 tok/s) corresponde a un unico equipo (M5 Max, 64 GB); no hay datos de latencia en otras plataformas.
- Las metricas de calidad de cuantizacion solo son comparables entre si: fueron medidas contra un unico corpus, referencia y longitud de contexto.
- El build `AD-3.84bpw` presenta un ratio PPL de 1,102 y solo un 82,68% de coincidencia top-1, lo que supone una degradacion notable frente a los otros builds.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limites de contexto maximos; estos aspectos deben evaluarse empiricamente antes de un despliegue en produccion.
- La existencia de una variante "uncensored" en el mismo espacio de nombres no debe confundirse con este repositorio; son artefactos distintos.
- No se confirma soporte de tool calling ni de agentes multi-paso, por lo que no deben asumirse en arquitecturas de produccion sin verificacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Dataset de calibracion: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Variante sin rechazos: https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-Uncensored-GGUF
- Aplicacion Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
