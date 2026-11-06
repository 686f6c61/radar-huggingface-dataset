# AXERA-TECH/Qwen3-Embedding-0.6B-AX8860-llama.cpp

## Resumen

Qwen3-Embedding-0.6B-AX8860-llama.cpp es un paquete de despliegue, publicado por AXERA-TECH, que permite ejecutar el modelo de embeddings de texto Qwen3-Embedding-0.6B (desarrollado por el equipo Qwen de Alibaba) sobre la NPU de cuatro nucleos del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una adaptacion de inferencia: los pesos son los originales de Qwen3-Embedding-0.6B en formato GGUF BF16 (1,1 GB) y el repositorio anade los binarios estaticos `llama-embedding` y `llama-server`, los kernels de NPU compilados y un script de ejecucion.

El modelo base es un transformer de 595.776.512 parametros (0,6B) especializado en generacion de vectores de 1024 dimensiones para tareas de recuperacion, similitud semantica, clustering y clasificacion. Su relevancia actual radica en que demuestra la viabilidad de ejecutar embeddings de calidad en hardware de borde (edge) con aceleracion NPU, con latencias de decenas de milisegundos y sin GPU dedicada, algo relevante para sistemas de busqueda semantica o RAG embebidos.

La ficha cubre tanto las caracteristicas del modelo base como las particularidades del empaquetado para AX8860: limites de contexto de 4096 tokens, conversion de pesos a MXFP8 en tiempo de carga, uso exclusivo de los cuatro nucleos NPU y ausencia de datos publicados de benchmarks o licencia en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-Embedding-0.6B); despliegue sobre NPU Axera AX8860 con llama.cpp y backend ggml-axera |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (limite indicado en la model card del despliegue) |
| Tipos de cuantizacion | Pesos distribuidos en GGUF BF16; conversion a MXFP8 en tiempo de carga por el kernel de NPU |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Qwen3-Embedding es multilingue, pero no se detalla en esta ficha) |
| Licencia | No disponible en la informacion proporcionada |
| Formato de pesos | GGUF (BF16, 1,1 GB, md5 `896a1a1dd90d26cb1800c0e1c7bbe12c`); kernels de NPU en `kernels/` con `manifest.json` |
| Dimension del embedding | 1024 |
| Hardware objetivo | Axera AX8860, NPU de 4 nucleos, SDK V0.5.0 o superior |
| Tamano del repo | 1,2 GB |
| Descargas / likes | 45 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen3-Embedding-0.6B es un transformer encoder orientado a feature extraction, con salida de vectores de 1024 dimensiones y normalizacion aplicada (el script devuelve JSON ya normalizado). La model card del despliegue no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la model card original de Qwen/Qwen3-Embedding-0.6B, que no se incluye en los datos proporcionados.

La innovacion tecnica de este repositorio esta en el plano de la inferencia: se compila un unico kernel de NPU que contiene el bucle de las 28 capas del modelo, sin pesos embebidos, y los pesos se leen del GGUF y se convierten a MXFP8 durante la carga. El pooling configurado es `last` y el servidor se lanza con `--embedding --pooling last -np 1`. Para recuperacion se recomienda anadir el prefijo de instruccion `Instruct: <task>\nQuery: <query>` tal como indica la model card del modelo base. La implementacion se apoya en la rama `feat/qwen3-whole` de la bifurcacion `ZHEQIUSHUI/llama.cpp` (commit `19737a5`) y en los kernels de `ZHEQIUSHUI/ax-dsl-kernels` (commit `67e8473`).

## Capacidades

- Generacion de embeddings de texto de 1024 dimensiones, normalizados, aptos para similitud coseno.
- Recuperacion de informacion (retrieval) con prefijo de instruccion por tarea.
- Busqueda semantica y construccion de indices vectoriales.
- Clustering y deduplicacion de documentos por similitud.
- Clasificacion de texto mediante embeddings y un clasificador ligero posterior.
- Servicio compatible con la API de OpenAI en el endpoint `/v1/embeddings`, lo que facilita la integracion con clientes existentes.
- Procesamiento por lotes: el script admite `-f texts.txt` para generar un embedding por linea.
- No incluye generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en dispositivos de borde: el paquete permite indexar y consultar un corpus directamente en el AX8860 sin enviar texto a la nube, con una latencia de 22 ms para una consulta de 9 tokens.
- RAG embebido en pasarelas o equipos de campo: con contexto de 4096 tokens y 36 ms por fragmento de 229 tokens, se pueden vectorizar documentos locales y alimentar un recuperador antes de llamar a un LLM remoto.
- Deduplicacion de registros y catalogos: generar embeddings por lote con `-f texts.txt` y agrupar por similitud coseno para eliminar duplicados en bases de datos locales.
- Clasificacion y enrutado de tickets o incidencias: usar el vector de 1024 dimensiones como entrada de un clasificador ligero que decida el departamento o la prioridad, con el modelo ejecutandose en el propio dispositivo.
- Moderacion o filtrado por similitud: comparar mensajes entrantes contra un conjunto de vectores de referencia de contenido prohibido o plantillas conocidas.
- Servicio interno compatible con OpenAI: desplegar `llama-server -s 8080` y sustituir llamadas a APIs de embeddings de terceros por el endpoint local `/v1/embeddings`, reduciendo coste y dependencia de red.
- Procesamiento por lotes de 884 tokens en dos textos en 69 ms, adecuado para reindexar pequenos corpus de forma periodica en el propio hardware.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, MTEB u otros). Si se documentan metricas de rendimiento del despliegue en NPU:

| Metrica | Configuracion | Resultado |
|---|---|---|
| Latencia, consulta de 9 tokens | Servidor, AX8860, SDK V0.5.1, NPU 4 nucleos | 22 ms |
| Latencia, texto de 229 tokens | Servidor, AX8860, SDK V0.5.1, NPU 4 nucleos | 36 ms |
| Latencia, 884 tokens (2 textos) | Servidor, AX8860, SDK V0.5.1, NPU 4 nucleos | 69 ms |
| Fidelidad frente a implementacion NPU previa | Similitud coseno de vectores | 0,9991-0,9997 |

No se han publicado resultados de benchmarks de calidad (MTEB, recuperacion, clasificacion) en la informacion disponible.

## Requisitos de hardware

- SoC Axera AX8860 con NPU de cuatro nucleos; SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- No requiere GPU: la inferencia se ejecuta en la NPU del SoC; los binarios son estaticos y solo dependen de `/opt/lib` y libc.
- Memoria: el repositorio ocupa 1,2 GB y el GGUF 1,1 GB; los pesos se convierten a MXFP8 en carga, por lo que se necesita espacio para el modelo y el kernel en el almacenamiento del dispositivo.
- Variables de entorno necesarias al invocar los binarios directamente: `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, con `-ngl 99` y `-c` hasta 4096.
- Despliegue mediante `run.sh` (una consulta, lote o servidor) o directamente con `llama-embedding` y `llama-server --embedding --pooling last -np 1`.
- La NPU queda ocupada en exclusiva por los cuatro nucleos; no deben ejecutarse otros programas de NPU en paralelo.
- No aplica el despliegue en vLLM, TGI u Ollama en esta variante: el paquete esta atado a la bifurcacion de llama.cpp con backend ggml-axera.
- Throughput y latencia estimados: los medidos en la model card (22-69 ms por peticion segun longitud); no se proporcionan cifras de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension del embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B (base) | 0,6B | No disponible en esta ficha | 1024 | No disponible en esta ficha | Hugging Face (Qwen/Qwen3-Embedding-0.6B) |
| Qwen3-Embedding-0.6B-AX8860-llama.cpp | 0,6B | 4096 tokens | 1024 | No disponible | Hugging Face, atado a hardware AX8860 |
| Alternativas de embeddings de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de otros modelos comparables (por ejemplo, variantes de embeddings de 0,5-1B) con especificaciones verificables, por lo que la comparativa cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Contexto maximo de 4096 tokens por texto; fragmentos mas largos deben dividirse antes de vectorizar.
- La NPU de cuatro nucleos queda ocupada en exclusiva; la convivencia con otras cargas de NPU en el mismo dispositivo no esta soportada.
- Dependencia estricta del SDK V0.5.0 o superior y del hardware AX8860: no es portable a otras plataformas sin recompilar kernels y binarios.
- La fidelidad se valido contra una implementacion NPU previa (coseno 0,9991-0,9997), no directamente contra la salida CPU del modelo original en esta ficha.
- La licencia no aparece en la informacion disponible; antes de un uso comercial debe consultarse la licencia del modelo base Qwen/Qwen3-Embedding-0.6B y la de los binarios y kernels distribuidos.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo de embeddings, el riesgo principal es la recuperacion de pasajes irrelevantes por similitud superficial, no la generacion de texto falso.
- Los idiomas soportados no se detallan en esta ficha; la calidad multilingue depende del modelo base y debe validarse con el corpus concreto.
- Uso previsto exclusivamente como extractor de caracteristicas: no genera texto ni soporta tool calling, por lo que no sustituye a un LLM en pipelines agenticos.
- El repositorio tiene 45 descargas y 0 likes, y fue creado en octubre de 2026; se trata de un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-Embedding-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Bifurcacion de llama.cpp: https://github.com/ZHEQIUSHUI/llama.cpp (rama `feat/qwen3-whole`, commit `19737a5`, directorio `ggml/src/ggml-axera/models/qwen3`)
- Kernels de NPU: https://github.com/ZHEQIUSHUI/ax-dsl-kernels (rama `main`, commit `67e8473`, directorio `models/qwen3_embedding`)
