# litert-community/EmbeddingGemma-300M-Tensor-G4-NPU

## Resumen

EmbeddingGemma-300M-Tensor-G4-NPU es una variante cuantizada y reempaquetada de google/embeddinggemma-300m, publicada por la organizacion litert-community, que ejecuta el calculo de embeddings en la NPU Edge TPU "rio" del SoC Google Tensor G4 (serie Pixel 9). No es un modelo de generacion de texto: es un modelo de extraccion de caracteristicas (pipeline feature-extraction) que produce vectores de 768 dimensiones normalizados en L2, con dos longitudes de secuencia disponibles (256 y 512 tokens).

Su relevancia no esta en el modelo en si, sino en el empaquetado: el repositorio incluye los bundles .litertlm y el .tflite compilados AOT para la Edge TPU, ademas de un stack completo de RAG on-device que corre integramente en Termux sobre el propio telefono. Ese stack comprende un runner nativo en C sobre la LiteRT C API, un indice vectorial en numpy, scripts de tokenizacion e indexacion, y un servidor MCP por stdio que expone la busqueda semantica como herramienta a cualquier cliente MCP (por ejemplo, Claude Code). Segun el autor, es la primera build de EmbeddingGemma para la NPU Tensor G4 de la que tiene constancia.

El caso de uso central es la recuperacion semantica con privacidad estricta: la consulta se embebe en la NPU, la recuperacion ocurre en local y ningun dato sale del dispositivo. Esto tiene un coste claro en requisitos: el despliegue depende de acceso root (rish), del servicio edgetpu_vendor_service activo y de librerias propietarias de Google (libLiteRt.so y la libreria de dispatch) extraidas del APK de Edge Gallery, que no se distribuyen en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings basado en google/embeddinggemma-300m; salida de 768 dimensiones, normalizada en L2; compilado AOT para Edge TPU (Tensor G4) |
| Parametros totales | Aproximadamente 300 M (nominal, segun el nombre del modelo base); el repositorio no publica el recuento exacto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (bundle seq512) y 256 tokens (bundle seq256) |
| Tipos de cuantizacion | Precisión mixta, cuantizada y compilada AOT para Edge TPU; solo variantes seq512 y seq256. No se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use), con acceso condicionado (gated) en Hugging Face |
| Formato de pesos | .litertlm (bundles que incluyen tokenizer, tflite y metadatos), .tflite crudo y runners nativos en C |

## Arquitectura y entrenamiento

El modelo subyacente es google/embeddinggemma-300m, y esta build es una derivacion cuantizada y reempaquetada del mismo (`base_model_relation: quantized`). La informacion disponible no detalla la arquitectura interna del modelo base ni el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card original de Google y no se reproducen aqui. Lo que si se especifica es la configuracion de despliegue: salida de 768 dimensiones normalizada en L2, secuencias de 256 o 512 tokens, precision mixta y compilacion AOT para la Edge TPU del Tensor G4.

La innovacion tecnica del repositorio es el stack de ejecucion, no el entrenamiento. El modelo se consume desde un runner nativo en C (ELF bionic) que enlaza contra libLiteRt.so y la libreria de dispatch de Google Tensor, de modo que la inferencia se despacha a la NPU en lugar de a CPU o GPU. El autor reporta una verificacion on-device el 2026-06-10: un delta real de 135 M ciclos en `tpu_active_cycle` por cada embedding, y una similitud coseno de 0.9946 frente a la referencia en CPU, es decir, la salida de la NPU coincide con la de CPU hasta tres decimales. El stack incluye ademas una variante heterogenea (`embed_hetero.c`) que reparte la carga entre NPU y CPU.

## Capacidades

- Extraccion de caracteristicas: genera embeddings de 768 dimensiones normalizados en L2 a partir de texto tokenizado.
- Similitud semantica entre frases (sentence-similarity) mediante distancia coseno.
- Recuperacion semantica (retrieval) sobre un indice vectorial local construido con numpy (`index.npz`).
- Indexacion por lotes: el runner `embed_npu_batch.c` carga el modelo una sola vez y procesa N filas en streaming, pensado para construir indices sobre corpus completos.
- Servidor MCP por stdio con contrato de herramienta `search_context(query: str, k: int = 5)`, que devuelve fragmentos ordenados con puntuacion, fuente y texto.
- Integracion con clientes MCP de agentes (por ejemplo Claude Code) mediante registro en `.mcp.json`.
- Ejecucion hibrida NPU + CPU disponible como variante.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, modo thinking ni function calling mas alla de la herramienta de recuperacion expuesta por MCP.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- RAG completamente local sobre corpus privado: se indexa un corpus markdown (chunks de 200 tokens con 30 de solapamiento) y las consultas se embeben en la NPU; el corpus y las consultas nunca salen del dispositivo, lo que lo hace adecuado para documentacion sensible.
- Servidor MCP de busqueda semantica para agentes: un agente que corre en el telefono o se conecta a el puede invocar `search_context(query, k)` para recuperar contexto relevante antes de responder, con la ventaja de que la recuperacion no depende de red.
- Gestion de notas y documentacion personal en Termux: indexacion incremental de ficheros markdown con `index_corpus.py` y consultas por linea de comandos con `query.py` para recuperar pasajes por significado en lugar de por palabra clave.
- Despliegue en entornos sin conectividad: tecnicos de campo, periodistas o investigadores que necesitan busqueda semantica sobre material descargado previamente en un Pixel 9 sin cobertura ni acceso a APIs en la nube.
- Reduccion de contexto enviado a la nube: usar la recuperacion local para seleccionar los fragmentos relevantes y enviar solo esos al modelo remoto, reduciendo coste por token y exposicion de datos.
- Deduplicacion y agrupacion de textos offline: generar embeddings por lotes con `embed_npu_batch` y aplicar similitud coseno para detectar duplicados o agrupar documentos sin salir del dispositivo.
- Prototipado de pipelines de recuperacion: validar estrategias de chunking, solapamiento y ranking sobre un modelo real antes de escalarlas a una infraestructura de servidor con un modelo de embeddings mayor.
- Preprocesado en aplicaciones Android con NPU: sirve como referencia de integracion de LiteRT con la Edge TPU para equipos que quieran portar otros modelos de embeddings al mismo acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, BEIR, etc.) en la informacion disponible. El repositorio unicamente aporta datos de verificacion del despacho a NPU, que no constituyen un benchmark de calidad del modelo:

| Metrica de verificacion (on-device, 2026-06-10) | Valor |
|---|---|
| Delta de `tpu_active_cycle` por embedding | 135 M ciclos |
| Similitud coseno frente a la referencia en CPU | 0.9946 |
| Dimension del vector de salida | 768 (float32 little-endian, norma L2 ~1.0) |

## Requisitos de hardware

- Acelerador obligatorio para la ruta NPU: Edge TPU "rio" del SoC Google Tensor G4, presente en la serie Pixel 9.
- Acceso root: los runners se invocan a traves de `rish` (shell con privilegios) y requieren el servicio `edgetpu_vendor_service` en ejecucion.
- Librerias propietarias: `libLiteRt.so` y la libreria de dispatch deben extraerse del APK de Edge Gallery (`lib/arm64-v8a/`); son de Google y no se distribuyen en el repositorio.
- VRAM estimada para inferencia: no aplica, el calculo se realiza en la NPU del SoC. El repositorio ocupa 0.6 GB en disco.
- GPU: no compatible con A100, H100, RTX 4090 ni ninguna GPU de escritorio; la ruta de ejecucion es Edge TPU o, en su variante heterogenea, NPU mas CPU del propio dispositivo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Termux con clang para compilar los runners, LiteRT C API (verificada contra cabeceras v2.1.1), Python 3 nativo de Termux sin dependencia de `pip mcp` ni pydantic, cliente MCP por stdio. La ruta glibc con `ai_edge_litert` y `sentencepiece` solo es necesaria para descomponer y reexportar el modelo, no en tiempo de consulta.
- Latencia y throughput: no disponibles. El unico dato de coste publicado es el delta de 135 M ciclos de TPU por embedding.
- Nota: los scripts llevan rutas fijas del entorno del autor (`/sdcard/agents/EmbeddingGemma`, `$HOME/npu_build`, `rish`), que hay que ajustar para otro despliegue.

## Comparativa con modelos similares

La informacion disponible no incluye modelos de terceros comparables con datos verificables, por lo que no se puede establecer una comparativa de rendimiento. La unica referencia contrastable es el modelo base del que deriva esta build:

| Modelo | Parametros | Contexto | Formato y ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/EmbeddingGemma-300M-Tensor-G4-NPU | ~300 M | 256 / 512 tokens | .litertlm y .tflite, inferencia en Edge TPU del Tensor G4 | Gemma (gated) | Hugging Face, acceso condicionado, 0 descargas y 0 likes en el momento de la consulta |
| google/embeddinggemma-300m (referencia) | ~300 M | No disponible en esta informacion | Pesos originales del modelo base | Gemma | Hugging Face |
| Otros modelos de embeddings comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Requiere root y el servicio `edgetpu_vendor_service` activo; no es un despliegue Android estandar y no funcionara en un telefono sin privilegios de superusuario.
- Depende de librerias propietarias de Google (`libLiteRt.so` y dispatch lib) que hay que extraer manualmente de un APK de Edge Gallery; si Google cambia esas librerias, el runner puede dejar de funcionar.
- Compatibilidad de hardware muy restringida: la ruta NPU esta atada al Tensor G4 (serie Pixel 9). En otros SoC solo cabe la ruta heterogenea o CPU, si es que compila.
- El indice vectorial `index.npz` no se distribuye porque corresponde a un corpus privado del autor; cada usuario debe construirlo con `rag/index_corpus.py`.
- Las rutas de los scripts estan codificadas para un entorno Termux concreto y hay que editarlas antes de usarlos.
- La similitud coseno de 0.9946 frente a la referencia en CPU implica una desviacion de aproximadamente 0.005 en la salida de la NPU; irrelevante en la mayoria de recuperaciones, pero es una diferencia no nula respecto al modelo en CPU.
- Al ser una version cuantizada de precision mixta, la calidad de los embeddings puede diferir de la del modelo base sin cuantizar; no se publican mediciones de esa perdida.
- Modelo exclusivamente de embeddings: no genera texto, no razona, no ejecuta codigo y no soporta function calling al margen de la herramienta MCP de busqueda.
- Ventana de contexto corta (256 o 512 tokens), lo que obliga a trocear los documentos y condiciona la calidad de la recuperacion en pasajes largos.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingue en produccion sin verificacion propia.
- Licencia Gemma con acceso condicionado: hay que aceptar los Gemma Terms of Use y revisar las restricciones de uso comercial aplicables antes de integrarlo en un producto.
- Riesgo de alucinacion: no aplica directamente al modelo, pero el pipeline RAG puede devolver fragmentos poco relevantes si el indice esta mal construido o si la consulta queda fuera del dominio del corpus.
- Sesgos: no disponibles; no se documenta ninguna evaluacion de sesgo sobre esta build ni sobre el modelo base en la informacion proporcionada.
- Madurez y validacion comunitaria bajas: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y ultima actualizacion del 2026-09-19.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/EmbeddingGemma-300M-Tensor-G4-NPU
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Terminos de uso de Gemma: deben aceptarse a traves del formulario de acceso condicionado de Hugging Face antes de descargar el repositorio (la model card los cita como "Google's Gemma Terms of Use").
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos corresponden a consultas sobre el buscador Bing y no guardan relacion con el contenido de la ficha.
