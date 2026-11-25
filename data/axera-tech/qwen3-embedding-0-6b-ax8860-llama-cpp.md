# AXERA-TECH/Qwen3-Embedding-0.6B-AX8860-llama.cpp

## Resumen

Qwen3-Embedding-0.6B-AX8860-llama.cpp es una distribucion optimizada del modelo de embeddings de texto Qwen3-Embedding-0.6B, publicada por AXERA-TECH para ejecutarse sobre la NPU de cuatro nucleos del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo: el autor empaqueta los pesos originales en formato GGUF BF16 junto con kernels de NPU precompilados y binarios estaticos de `llama-embedding` y `llama-server`, de modo que el modelo se pueda desplegar en hardware de borde sin compilar nada.

El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de aproximadamente 596 millones de parametros que produce embeddings de 1024 dimensiones. Esta variante resuelve un problema muy concreto: llevar la generacion de vectores a un dispositivo empotrado con aceleracion NPU, manteniendo una fidelidad numerica alta respecto a la implementacion de referencia en CPU (coseno de 0,9991 a 0,9997 segun el autor).

Su relevancia actual radica en el creciente interes por ejecutar pipelines RAG y busqueda semantica en local, sin depender de servicios en la nube. El repositorio ocupa 1,4 GB, incluye el GGUF de 1,1 GB y expone una API compatible con el endpoint `/v1/embeddings` de OpenAI, lo que facilita integrarlo en aplicaciones existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-Embedding-0.6B), ejecutado sobre NPU Axera AX8860 mediante ggml-axera |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (limite del despliegue en NPU; el modelo base admite mas) |
| Tipos de cuantizacion | Pesos distribuidos en GGUF BF16; conversion interna a MXFP8 al cargar en la NPU |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen3-Embedding es multilingue) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3-emb-0.6b-bf16.gguf`), mas kernels de NPU precompilados y binarios estaticos |
| Dimension del embedding | 1024 |
| Hardware objetivo | Axera AX8860, SDK V0.5.0 o superior |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3, con 596 millones de parametros y una cabeza de embedding de 1024 dimensiones. Esta publicacion no aporta informacion sobre el entrenamiento: no se detallan el numero de tokens, la composicion del corpus ni si hubo fases de RLHF o DPO. Toda la innovacion tecnica de esta variante reside en el plano del despliegue, no del modelado.

El autor empaqueta un unico kernel de NPU que contiene las 28 capas del modelo en un bucle interno, sin pesos embebidos: los pesos se leen del GGUF y se convierten a MXFP8 en tiempo de carga. Los binarios del tablero estan enlazados estaticamente y solo dependen de `/opt/lib` y libc. La implementacion procede de la rama `axera-dev` del fork `ZHEQIUSHUI/llama.cpp`, en concreto del directorio `ggml/src/ggml-axera/models/qwen3`. Para recuperacion se debe anteponer a las consultas el prefijo de instruccion que indica la model card del modelo base (`Instruct: <task>\nQuery: <query>`) y usar pooling `last`.

## Capacidades

- Generacion de embeddings de texto de 1024 dimensiones, normalizados, aptos para similitud coseno y busqueda vectorial.
- Procesamiento por lotes: el script `run.sh -f texts.txt` genera un vector por linea.
- Servidor compatible con OpenAI: expone `/v1/embeddings` mediante `llama-server` con `--embedding --pooling last -np 1`.
- Soporte de instrucciones de tarea para recuperacion, segun el formato recomendado por el modelo base.
- Ejecucion integra en NPU: no requiere CPU para las capas del transformer ni GPU dedicada.
- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica en el borde: indexar y consultar un corpus local de documentos directamente en el dispositivo AX8860, con latencias de 22 ms para consultas cortas y 36 ms para textos de 229 tokens, sin enviar datos a la nube.
- RAG embebido en dispositivos de vigilancia o industriales: generar los vectores de los fragmentos recuperados en el propio equipo y alimentar un LLM remoto o local solo con el contexto relevante, reduciendo el ancho de banda.
- Clasificacion y deduplicacion de textos: calcular embeddings por lotes con `run.sh -f` y agrupar documentos similares por umbral de coseno en pipelines de limpieza de datos.
- Enrutamiento de consultas: usar la similitud entre la consulta del usuario y un conjunto de intenciones predefinidas para dirigir la peticion al servicio adecuado, aprovechando la latencia de 22 ms por consulta.
- Cache semantica de respuestas: almacenar embeddings de preguntas frecuentes y devolver respuestas cacheadas cuando la similitud supera un umbral, con la API compatible con OpenAI como interfaz.
- Moderacion y filtrado de contenido: comparar embeddings de mensajes entrantes contra un catalogo de ejemplos etiquetados para detectar categorias prohibidas en entornos con requisitos de privacidad.
- Busqueda multilingue en el dispositivo: aunque la ficha no confirma los idiomas del despliegue, el modelo base es multilingue y el ejemplo de la model card usa texto en chino, lo que sugiere uso en escenarios con varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de latencia y una comprobacion de fidelidad numerica:

| Metrica | Resultado |
|---|---|
| Consulta de 9 tokens en modo servidor | 22 ms |
| Texto de 229 tokens en modo servidor | 36 ms |
| Lote de 884 tokens (2 textos) | 69 ms |
| Coseno frente a la implementacion NPU anterior | 0,9991 a 0,9997 |
| Nucleos de NPU utilizados | 4 (exclusivos) |

Las mediciones corresponden a un AX8860 con SDK V0.5.1 y no son comparables con cifras de GPU o CPU de proposito general.

## Requisitos de hardware

- SoC Axera AX8860 con NPU de cuatro nucleos y SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- Memoria: el repositorio ocupa 1,4 GB y el GGUF 1,1 GB; se debe reservar espacio adicional para la conversion a MXFP8 en carga.
- No es ejecutable en GPU de consumo (RTX 4090, etc.) con este paquete: los kernels estan compilados para la NPU Axera.
- La NPU queda ocupada en exclusiva por los cuatro nucleos; no se pueden ejecutar otros programas de NPU en paralelo.
- Despliegue mediante los binarios incluidos: `llama-embedding` para linea de comandos y `llama-server` para servicio HTTP compatible con OpenAI.
- Variables de entorno necesarias: `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; desde la revision del 24 de noviembre de 2026, el binario aborta si no se define esta ultima.
- Parametros de ejecucion: `-ngl 99` y `-c` con un maximo de 4096; en servidor, `--embedding --pooling last -np 1`.
- Throughput estimado a partir de las latencias publicadas: en torno a 45 consultas por segundo para entradas de 9 tokens en un unico proceso, sin paralelismo (`-np 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B-AX8860-llama.cpp | 596 M | 1024 | 4096 (en NPU) | no disponible | GGUF + kernels para AX8860 |
| Qwen/Qwen3-Embedding-0.6B (base) | 596 M | 1024 | no disponible en esta ficha | no disponible | Pesos originales en Hugging Face |
| Otras variantes GGUF de Qwen3-Embedding-0.6B | 596 M | 1024 | segun configuracion de llama.cpp | no disponible | GGUF para CPU/GPU |

La comparativa se limita al mismo modelo base: esta publicacion no aporta datos de rendimiento frente a alternativas de otros fabricantes (por ejemplo, modelos de embeddings de la familia BGE o E5), por lo que no es posible establecer una comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- Dependencia total del hardware: los kernels y binarios solo funcionan en la NPU del AX8860; no hay ruta de ejecucion en CPU o GPU dentro de este paquete.
- Contexto limitado a 4096 tokens en este despliegue, inferior al que puede admitir el modelo base.
- Uso exclusivo de la NPU: no se pueden lanzar otros procesos de NPU simultaneamente, lo que restringe la coubicacion con otras cargas de inferencia.
- El servidor se ejecuta con `-np 1`, es decir, sin paralelismo de peticiones; la concurrencia dependera de encolar solicitudes.
- Licencia no indicada en la informacion disponible: antes de un uso comercial es imprescindible verificar los terminos del modelo base Qwen3-Embedding-0.6B y del fork de llama.cpp utilizado.
- Idiomas soportados no confirmados para este despliegue; la calidad multilingue depende del modelo base y no se ha validado en la NPU.
- Fidelidad numerica no identica a la implementacion de referencia (coseno de 0,9991 a 0,9997), lo que puede alterar marginalmente rankings de recuperacion en casos muy ajustados.
- Riesgo de alucinacion no aplicable en sentido estricto al ser un modelo de embeddings, pero los vectores pueden producir recuperaciones irrelevantes si no se aplica el prefijo de instruccion recomendado.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion proporcionada.
- El paquete se actualizo el 24 de noviembre de 2026 con nuevos binarios que cambian el comportamiento ante la ausencia de `GGML_AXERA_KERNEL_DIR`; conviene fijar la revision usada en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-Embedding-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Fork de llama.cpp con backend Axera: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`, directorio `ggml/src/ggml-axera/models/qwen3`)
- Paper, blog o demo oficiales: no disponible en la informacion proporcionada.
