# AXERA-TECH/Qwen3-Embedding-0.6B-AX8860-llama.cpp

## Resumen

AXERA-TECH/Qwen3-Embedding-0.6B-AX8860-llama.cpp es una adaptación de despliegue del modelo de embeddings Qwen3-Embedding-0.6B de Alibaba Qwen, publicada por AXERA-TECH para ejecutarse sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante llama.cpp y el backend ggml-axera. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los originales de Qwen3-Embedding-0.6B, empaquetados en formato GGUF BF16 (1,1 GB) junto con binarios estáticos de `llama-embedding` y `llama-server` y un kernel NPU compilado que cubre las 28 capas del modelo.

El modelo resuelve un problema muy concreto: llevar un encoder de texto de 1024 dimensiones a hardware de borde (edge) con aceleración NPU, manteniendo resultados de recuperación equivalentes a los de una implementación en CPU. El repositorio incluye scripts de ejecución, un servidor compatible con la API de embeddings de OpenAI y documentación de rendimiento medida en placa.

Es relevante para desarrolladores que necesitan generar embeddings en dispositivos con recursos limitados —búsqueda semántica local, RAG en el borde, filtrado en tiempo real— sin depender de GPU ni de servicios en la nube. El contexto máximo está limitado a 4096 tokens y el despliegue exige el SDK V0.5.0 o superior del AX8860.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Qwen3-Embedding), ejecutado vía llama.cpp con backend ggml-axera sobre NPU |
| Parametros totales | 595.776.512 (≈0,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (máximo en esta implementación) |
| Tipos de cuantizacion | GGUF BF16 en el repo; conversión interna a MXFP8 al cargar en el kernel NPU |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16) + kernels NPU precompilados + binarios estáticos |
| Dimension de embedding | 1024 |
| Hardware objetivo | Axera AX8860, NPU de 4 núcleos, SDK V0.5.0 o superior |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-Embedding-0.6B original: un transformer encoder de aproximadamente 596 millones de parámetros que produce vectores densos de 1024 dimensiones, con pooling de tipo *last* configurado en el servidor (`--embedding --pooling last`). Esta publicación no aporta información sobre el corpus de entrenamiento, el número de tokens, ni sobre si el modelo base empleó RLHF, DPO u otras etapas de alineación; esos detalles corresponden a la model card de Qwen/Qwen3-Embedding-0.6B, no incluida en la información disponible.

La innovación técnica de este repositorio es de despliegue, no de modelado. El kernel NPU contiene la lógica de las 28 capas en un único binario y no almacena pesos: estos se cargan desde el GGUF y se convierten a MXFP8 en el momento de la carga, lo que reduce el peso en memoria del acelerador. Los binarios de llama.cpp están enlazados estáticamente y solo dependen de `/opt/lib` y libc. El backend procede del fork `ZHEQIUSHUI/llama.cpp`, rama `axera-dev`, commit `0104880be`, en la ruta `ggml/src/ggml-axera/models/qwen3`. La validación de correctitud reporta una similitud coseno de 0,9991–0,9997 frente a la implementación NPU previa, cuyos resultados de recuperación coincidían con los de CPU.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones, normalizados, en formato JSON.
- Procesamiento por lotes: una entrada por línea mediante `-f texts.txt`.
- Servidor compatible con la API de OpenAI en el endpoint `/v1/embeddings`.
- Recuperación semántica con prefijo de instrucción (`Instruct: <task>\nQuery: <query>`) para consultas de retrieval.
- Ejecución íntegra en NPU sin intervención de CPU para el cómputo del modelo.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un modelo exclusivamente de extracción de características.

## Casos de uso

- Búsqueda semántica en dispositivos de borde: indexación y consulta de documentos locales en el propio AX8860, con latencias de 22 ms por consulta corta (9 tokens) y 36 ms para textos de 229 tokens, adecuadas para interfaces interactivas.
- RAG embebido en equipos de campo: generación de embeddings de fragmentos de documentación técnica en el dispositivo, sin enviar datos a la nube, útil en entornos con conectividad limitada o requisitos de privacidad.
- Deduplicación y agrupación de textos: cálculo por lotes de vectores para detectar duplicados o agrupar registros; el procesamiento de 884 tokens en dos textos en 69 ms permite tratar volúmenes moderados en tiempo real.
- Filtrado y clasificación por similitud: comparación de consultas contra un conjunto preindexado de etiquetas o plantillas para enrutamiento de tickets, moderación o triaje de incidencias.
- Servicio de embeddings interno: despliegue de `llama-server` en el puerto 8080 y consumo desde aplicaciones existentes mediante la API compatible de OpenAI, sin cambios en el cliente.
- Enrutamiento de consultas en asistentes locales: clasificación de la intención del usuario comparando el embedding de la consulta con embeddings de referencia de cada intención, con el prefijo de instrucción adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos medidos son de latencia en placa (AX8860, SDK V0.5.1, NPU de 4 núcleos):

| Escenario | Tokens | Latencia |
|---|---|---|
| Consulta única en modo servidor | 9 | 22 ms |
| Texto único en modo servidor | 229 | 36 ms |
| Dos textos | 884 | 69 ms |

Dato de correctitud: similitud coseno de 0,9991–0,9997 frente a la implementación NPU anterior, cuyos resultados de recuperación coincidían con los de CPU.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con NPU de 4 núcleos; no funciona en GPU ni CPU convencionales tal como se distribuye.
- SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- Memoria: el GGUF BF16 ocupa 1,1 GB; el kernel convierte los pesos a MXFP8 en carga, reduciendo el consumo en NPU, aunque no se especifica la VRAM/RAM exacta requerida.
- El runtime ocupa los 4 núcleos NPU en exclusiva; no deben ejecutarse otros programas NPU en paralelo.
- Variables de entorno necesarias al invocar los binarios directamente: `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, con `-ngl 99` y `-c` hasta 4096.
- Opciones de despliegue: `run.sh` (una consulta o lote), `llama-embedding` y `llama-server` con `--embedding --pooling last -np 1`.
- Throughput y latencia: ver tabla de la sección anterior; no se dispone de medidas de throughput agregado con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B (base) | ≈0,6 B | no disponible en la informacion | 1024 | no disponible en la informacion | GPU/CPU vía transformers, llama.cpp, vLLM |
| Este repositorio (AX8860) | ≈0,6 B | 4096 | 1024 | no disponible | Exclusivo NPU Axera AX8860 |
| Alternativas de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: misma arquitectura y pesos, pero este paquete está atado al hardware AX8860 y limita el contexto a 4096 tokens. No se dispone de datos de benchmarks para comparar calidad de recuperación con otros encoders.

## Limitaciones y advertencias

- Dependencia total de hardware: solo funciona en Axera AX8860 con SDK V0.5.0+; no es portable a GPU, CPU de propósito general ni otras NPU.
- Contexto máximo de 4096 tokens, inferior al que puede ofrecer el modelo base en otras plataformas.
- Exclusividad de la NPU: el proceso ocupa los 4 núcleos; la convivencia con otras cargas NPU no está soportada.
- Licencia no disponible en la información proporcionada: debe verificarse en el repositorio del modelo base antes de cualquier uso comercial.
- Idiomas soportados no documentados en esta publicación; la model card solo incluye ejemplos en chino.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperaciones semánticamente pobres si se omite el prefijo de instrucción recomendado para consultas de retrieval.
- Sin datos publicados de benchmarks de calidad (MTEB u otros): la idoneidad para una tarea concreta debe validarse empíricamente.
- Sesgos del modelo base no documentados en esta publicación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-Embedding-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
