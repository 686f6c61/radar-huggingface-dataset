# Accio-Lab/occamy-1.0-GGUF

## Resumen

Occamy-1.0 es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por Accio-Lab, distribuido en su variante GGUF cuantizada para inferencia local con llama.cpp. Segun los metadatos del repositorio, se trata de un modelo de arquitectura MoE (mixture of experts) basado en la familia Qwen3.5 MoE, con 34.660.610.688 parametros totales en sus pesos safetensors originales, y orientado explicitamente a tool-use y conversacion. La ficha que nos ocupa es la del repositorio de cuantizaciones, no la de los pesos originales en BF16.

El interes practico de esta publicacion esta en el ecosistema de despliegue: ofrece 17 cuantizaciones GGUF distintas, desde IQ2_M (10,86 GiB) hasta Q8_0 (34,37 GiB), ademas de un proyector de vision opcional en F16 (0,84 GiB). Esto permite ejecutar un modelo MoE de ~34,7 mil millones de parametros en hardware de consumo con perdida de precision controlada, algo relevante para desarrolladores que quieren probar tool calling y capacidades multimodales sin depender de una GPU de datacenter.

La licencia Apache 2.0 y el volumen de descargas (mas de 481.000) indican una adopcion considerable. No obstante, la informacion publica disponible es limitada: no se detallan parametros activos del MoE, longitud de contexto nativa, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) tipo transformer, familia Qwen3.5 MoE (tag `qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de quickstart usa `-c 8192`) |
| Tipos de cuantizacion | IQ2_M, Q2_K, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_0, Q5_K_M, Q6_K, Q8_0; proyector de vision F16 |
| Idiomas soportados | en, zh (segun tags y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos base en safetensors en el repo original |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo MoE de la familia Qwen3.5 MoE, con 34.660.610.688 parametros totales y soporte multimodal mediante un proyector de vision separado (mmproj). El pipeline declarado es `image-text-to-text`, y los tags incluyen `tool-use` y `conversational`. No se dispone de datos sobre el numero de parametros activos por token, el numero de expertos, la longitud de contexto nativa ni la composicion del dataset de entrenamiento en la informacion proporcionada.

En cuanto al proceso de cuantizacion, la model card distingue dos regimenes: cinco cuantizaciones (Q3_K_S, Q5_K_S, Q3_K_L, Q4_0 y Q5_0) son conversiones directas desde BF16 con recetas estandar y sin importance matrix; el resto emplea matrices de calibracion (imatrix). Q4_K_M y Q8_0 conservan sus recetas historicas. La model card advierte explicitamente que las etiquetas describen precision mixta y no bits uniformes por tensor. Ademas, existe un repositorio complementario (APEX GGUF) con siete perfiles adicionales de precision mixta para MoE, tres planos y cuatro calibrados con imatrix, incluido uno llamado Mini. En total se documentan 24 opciones GGUF entre ambos repositorios.

Un detalle tecnico relevante es la compatibilidad de tokenizer: la model card pide normalizar el contenido del prompt a NFC antes de enviarlo y senala que las mediciones de benchmark publicadas anteriormente con la etiqueta qwen35 usaron un protocolo de tokenizer distinto. El ejemplo de quickstart usa los metadatos nativos `qwen2`.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Razonamiento y generacion de codigo: el ejemplo de la model card solicita una funcion Python, y los tags incluyen `tool-use`.
- Tool calling / function calling: soportado segun los tags del modelo; el servidor de ejemplo expone la API compatible con OpenAI (`/v1/chat/completions`).
- Procesamiento de imagen: pipeline `image-text-to-text` con proyector de vision opcional (`mmproj-occamy-1.0-F16.gguf`).
- Capacidades multilingues limitadas a ingles y chino segun los tags y la model card.
- Integracion con llama.cpp mediante `llama-server`, con soporte de plantilla de chat via `--jinja`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

No se documenta en la informacion disponible un modo de razonamiento explicito (thinking mode), soporte de audio ni capacidades de agente multi-paso mas alla de lo que implica el tool-use.

## Casos de uso

- Asistente de codigo en local: con Q4_K_M (19,71 GiB) o Q5_K_M (23,03 GiB) se puede desplegar un servidor compatible con la API de OpenAI en una estacion de trabajo con GPU de 24 GB, cubriendo autocompletado, generacion de funciones y explicacion de codigo sin enviar datos a terceros.
- Automatizacion de tool calling en pipelines internos: el tag `tool-use` y el soporte de plantilla Jinja en `llama-server` permiten conectar el modelo a funciones locales (consulta de bases de datos, APIs internas) en flujos de agentes de un solo paso o encadenados.
- Procesamiento de documentos con imagenes: gracias al proyector de vision F16 se pueden enviar capturas, diagramas o formularios escaneados junto con instrucciones de texto para extraccion de datos o resumenes, usando `--mmproj` en llama.cpp.
- Prototipado en hardware de consumo: las variantes IQ2_M (10,86 GiB) e IQ3_XS (13,49 GiB) permiten ejecutar el modelo en GPUs de 12-16 GB, utiles para evaluacion interna antes de escalar a una cuantizacion mayor.
- Chat multilingue ingles-chino: para equipos que operan en ambos idiomas, el modelo cubre conversacion y generacion en las dos lenguas declaradas, con la advertencia de que no se documentan otros idiomas.
- Despliegue en entornos air-gapped: al ser GGUF con licencia Apache 2.0 y ejecutable con llama.cpp, el modelo puede operar completamente offline en infraestructura propia, requisito habitual en sectores regulados.
- Servicio de inferencia ligero con API compatible OpenAI: `llama-server` con `--alias occamy` permite sustituir un endpoint remoto por uno local sin cambiar el codigo cliente, util para desarrollo y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mediciones previas con la etiqueta qwen35 y una evaluacion de Q3_K_S/Q5_K_S con metadatos nativos y entrada NFC, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de tareas multimodales en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): desde ~10,9 GiB con IQ2_M hasta ~34,4 GiB con Q8_0. La model card advierte que el tamano de fichero no es el pico de RAM/VRAM: hay que sumar KV cache, contexto, concurrencia e imagenes.
- Cuantizaciones para GPU de 12-16 GB: IQ2_M (10,86 GiB), Q2_K (12,05 GiB), IQ3_XS (13,49 GiB), Q3_K_S (14,14 GiB), IQ3_M (14,38 GiB).
- Cuantizaciones para GPU de 24 GB: Q3_K_M (15,61 GiB), Q3_K_L (16,87 GiB), IQ4_XS (17,44 GiB), Q4_0 (18,36 GiB), IQ4_NL (18,42 GiB), Q4_K_S (18,52 GiB), Q4_K_M (19,71 GiB), Q5_K_S y Q5_0 (22,33 GiB), Q5_K_M (23,03 GiB). Cabe en una RTX 4090 de 24 GB, aunque con margen ajustado para contexto largo.
- Cuantizaciones para GPU de 40-80 GB: Q6_K (26,56 GiB) y Q8_0 (34,37 GiB), adecuadas para A100 40/80 GB o H100.
- Proyector de vision: 0,84 GiB adicionales en F16, solo necesario para entrada de imagen.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de `-ngl` para offload completo a GPU, `-fa on` para flash attention y `--jinja` para plantilla de chat. La model card indica que la validacion CUDA registrada uso la revision `972d2313bc0bf0a45f634f77d95c9fb03aeab12c` de llama.cpp.
- Plataformas no verificadas: la model card senala que la ejecucion solo-CPU y en Apple Silicon no se probo en esa validacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Occamy-1.0 (este) | 34,7 B totales (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal, tool-use, 17 cuantizaciones GGUF |
| Qwen3.5 MoE (familia base) | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia segun el tag `qwen3_5_moe` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos equivalentes en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado.
- Tokenizer: es obligatorio normalizar el prompt a NFC; la model card advierte que las mediciones antiguas usaron otro protocolo de tokenizer, por lo que comparaciones con benchmarks previos pueden no ser homogeneas.
- Parametros activos del MoE y contexto nativo no documentados: planificar el despliegue sin asumir una ventana de contexto concreta mas alla de la configurada manualmente.
- Las etiquetas de cuantizacion indican precision mixta, no bits uniformes; el rendimiento puede variar de forma no lineal entre variantes.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada.
- Validacion limitada: la model card solo registra pruebas en CUDA con una revision concreta de llama.cpp; CPU y Apple Silicon no fueron verificados en esa ejecucion.
- El proyector de vision es opcional; sin el, el modelo funciona solo con texto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original y de los pesos BF16 de los que deriva.
- Repositorio de gran tamano (342,9 GB en total): descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Perfiles APEX GGUF: https://huggingface.co/Accio-Lab/occamy-1.0-APEX-GGUF
- Coleccion de modelos: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Checkpoint explorer (Space): https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Pagina del proyecto: https://accio-lab.github.io/occamy/
- Paper: https://arxiv.org/abs/2609.11977
- llama.cpp: https://github.com/ggml-org/llama.cpp
