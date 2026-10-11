# prabanta-dev/Qwen3-Next-80B-A3B-Instruct-JNS

## Resumen

Qwen3-Next-80B-A3B-Instruct-JNS es una conversion de formato del modelo Qwen/Qwen3-Next-80B-A3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. La conversion la firma el usuario prabanta-dev dentro del proyecto Janas, un motor de inferencia escrito en C orientado a equipos de consumo, con o sin GPU. No se ha reentrenado ni podado nada: los pesos proceden de la version GGUF cuantizada a Q4_K_M publicada por el equipo Qwen, reescritos por la herramienta `gguf2jns` en el orden de lectura que espera Janas.

El interes de esta ficha no esta en el modelo base, que ya es conocido, sino en el formato. Los ficheros estan en JNS, un formato propietario del motor Janas que solo puede leer ese motor. La innovacion tecnica del autor es la reorganizacion de los pesos: cada par (capa, experto) ocupa su propia ranura, de modo que el motor puede leer desde disco solo los expertos que necesita cada token y mantener en memoria los que se repiten. Ademas, las matrices down de los expertos se dividen en tres planos de dos bits (`jns_planes`), una reordenacion reversible que reconstruye los pesos cuantizados bit a bit.

El resultado practico es que un modelo MoE de 80.000 millones de parametros totales con 3.000 millones activos, cuyo fichero principal pesa 48,41 GB, puede ejecutarse en un portatil con 32 GB de RAM mediante streaming desde NVMe. El autor reporta 62-64 tok/s de lectura de prompt y 24 tok/s de escritura con un Intel Core Ultra 9 185H y su GPU Arc integrada, frente a 16 tok/s y 2,8 tok/s de llama.cpp en el mismo equipo. Es un caso de uso de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, y util solo para quien ya use Janas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer sobre Qwen3-Next (hibrida: Gated DeltaNet + Gated Attention, segun la documentacion del modelo base); incluye bloque MTP (multi-token prediction) |
| Parametros totales | 80.000 millones (modelo base Qwen3-Next-80B-A3B-Instruct) |
| Parametros activos | 3.000 millones (denominacion A3B del modelo base) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base declara contexto nativo de 262.144 tokens segun su propia documentacion, no verificable en este repositorio) |
| Tipos de cuantizacion | Q4_K_M para los pesos principales y Q4_K para el bloque MTP; solo en formato JNS |
| Idiomas soportados | no disponible |
| Licencia | Apache License 2.0 |
| Formato de pesos | JNS (`qwen3-next-80b-a3b-q4km.jns`, 48,41 GB; `qwen3-next-80b-a3b-mtp-q4k.jns`, 0,94 GB) |

## Arquitectura y entrenamiento

Esta publicacion no entrena ni ajusta nada. Es una conversion de formato: los tensores provienen de `Qwen3-Next-80B-A3B-Instruct-Q4_K_M.gguf`, publicado por el equipo Qwen, y de los tensores de prediccion multi-token (MTP) del checkpoint original en safetensors. La herramienta `gguf2jns` reescribe los pesos en el orden de lectura de Janas y conserva la metadata. El bloque MTP, que no existe en el GGUF, se cuantiza a Q4_K con `hf2jns_mtp`. Como la obra es derivada y la licencia es Apache 2.0, el autor declara explicitamente la modificacion.

La peculiaridad tecnica es la disposicion en disco. Cada par (capa, experto) tiene su propia ranura, lo que permite al motor leer expertos individuales bajo demanda. Las matrices down de los expertos se cortan en tres planos de dos bits cada uno; con los tres planos se recuperan los pesos cuantizados originales sin perdida. Sobre el modelo base, la arquitectura Qwen3-Next combina atencion lineal (Gated DeltaNet) con atencion completa en una proporcion de capas, usa un MoE de alta esparsidad y anade prediccion multi-token para decodificacion especulativa. Los detalles de composicion del dataset de entrenamiento, numero de tokens y metodos de alineacion (RLHF/DPO) no estan disponibles en la informacion proporcionada; la model card de esta conversion no los reproduce.

## Capacidades

Heredadas del modelo base Qwen3-Next-80B-A3B-Instruct, no verificadas ni documentadas en este repositorio:

- Generacion de texto conversacional en modo instruct.
- Razonamiento multi-paso.
- Generacion de codigo.
- Razonamiento matematico.
- Uso de herramientas y function calling (capacidad declarada del modelo base, no documentada aqui).
- Flujos de agente con varias llamadas encadenadas (capacidad declarada del modelo base).
- Decodificacion especulativa mediante el bloque MTP incluido en el repositorio, que aporta el modo borrador en el chat de Janas.
- Capacidades multilingues: no disponible el listado concreto de idiomas.
- Vision y audio: no disponibles; el modelo base es de texto.

## Casos de uso

- Inferencia local en portatil sin GPU dedicada: con 32 GB de RAM, SSD NVMe y Janas, el modelo se ejecuta haciendo streaming de expertos desde disco. El autor reporta 62-64 tok/s de lectura de prompt y 24 tok/s de escritura en un Intel Core Ultra 9 185H, lo que hace viable un asistente de chat para un unico usuario.
- Sustitucion de llama.cpp cuando este ultimo no cabe en memoria: en el mismo portatil de referencia, llama.cpp se quedo sin memoria con su build habitual y el autor tuvo que usar un build sin repacking de pesos. Janas es la alternativa en ese escenario concreto.
- Prototipado de agentes con decodificacion especulativa: el bloque MTP incluido permite al motor usar un borrador propio y subir el throughput de escritura de 22 a 37 tok/s en modo chat, segun las cifras del autor.
- Evaluacion comparativa de motores de inferencia: el repositorio sirve para medir throughput de lectura/escritura frente a llama.cpp con la misma maquina y el mismo prompt de 1.024 tokens.
- Documentacion y analisis de codigo fuera de linea: el modelo base tiene capacidad de generacion de codigo; al ejecutarse en local, el contenido no sale de la maquina, lo que encaja en entornos con restricciones de confidencialidad.
- Despliegue en hardware modesto para equipos pequenos: un unico portatil con 32 GB de RAM puede servir respuestas de un modelo de 80B totales a traves de la interfaz de chat de Janas, sin depender de APIs externas.
- I+D sobre esparsidad de expertos: la disposicion en ranuras por (capa, experto) y los planos de bits permiten estudiar patrones de acceso a expertos y politicas de cache en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor solo publica cifras de rendimiento de inferencia:

| Metrica | Janas | llama.cpp |
|---|---:|---:|
| Lectura de prompt (1.024 tokens) | 62 tok/s | 16 tok/s |
| Escritura (16 tokens) | 24 tok/s | 2,8 tok/s |

Cifras adicionales del autor en el mismo equipo (Intel Core Ultra 9 185H, GPU Arc integrada, 32 GB de RAM): 64 tok/s de lectura y 22 tok/s de escritura en general, y 37 tok/s de escritura con el bloque borrador propio en el chat. Medido el 9 y 10 de octubre de 2026 con `janas-bench` y `llama-bench`. Las cifras de llama.cpp corresponden a un build sin repacking de pesos, porque el build habitual no cabia en memoria.

## Requisitos de hardware

- Espacio en disco: 48,41 GB para el fichero principal mas 0,94 GB del bloque MTP. El autor recomienda NVMe, ya que el motor lee expertos desde disco en cada token.
- RAM: el modelo es mayor que la memoria del equipo de referencia (48,4 GB frente a 32 GB), y aun asi funciona porque Janas hace streaming de expertos y cachea los recurrentes. No hay cifra publicada de RAM minima.
- VRAM estimada para inferencia completa en Q4: alrededor de 48-49 GB si se cargan todos los pesos en memoria de GPU. Cabe en A100 80 GB, H100 80 GB y A6000 48 GB (este ultimo muy justo). No cabe en una RTX 4090 de 24 GB por si solo; harian falta dos en configuracion multi-GPU.
- GPU integradas: el autor valida una Intel Arc integrada en Core Ultra 9 185H, usada junto con el streaming desde disco.
- Consumer GPU: cabe en GPUs de 24 GB solo si se acepta el modo de streaming desde disco con la GPU como acelerador parcial; no hay datos publicados de ese escenario.
- Opciones de despliegue: exclusivamente Janas (Linux x86-64, Ubuntu 22.04, Debian 12 y posteriores). Los ficheros JNS no los lee vLLM, llama.cpp, Ollama ni TGI. Para esos motores hay que usar el GGUF original de Qwen.
- Latencia y throughput: los de la tabla anterior, sobre el equipo de referencia del autor. En otras maquinas las cifras variaran, segun advierte el propio autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-Next-80B-A3B-Instruct-JNS (esta ficha) | 80B totales / 3B activos | JNS Q4_K_M | Apache 2.0 | Solo Janas; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-Next-80B-A3B-Instruct | 80B totales / 3B activos | safetensors | Apache 2.0 | Repositorio oficial del modelo base, pesos sin cuantizar |
| Qwen/Qwen3-Next-80B-A3B-Instruct-GGUF | 80B totales / 3B activos | GGUF (incluye Q4_K_M) | Apache 2.0 | Repositorio oficial del equipo Qwen; compatible con llama.cpp y derivados |
| Janas (motor) | no aplica | no aplica | GPL-3.0-or-later | Motor en C para Linux x86-64; la licencia del motor no se aplica a los ficheros JNS |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Compatibilidad nula fuera de Janas: los ficheros JNS solo los lee ese motor. No se pueden usar con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Plataforma limitada: Janas se distribuye para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores). No hay builds publicados para Windows ni macOS en la informacion disponible.
- Rendimiento dependiente del almacenamiento: con 48,41 GB de pesos y streaming de expertos desde disco, el throughput dependera de la velocidad del NVMe y del patron de acceso a expertos. Las cifras del autor corresponden a un equipo concreto.
- Sin benchmarks de calidad: no hay datos de MMLU, HumanEval ni GSM8K en este repositorio. Las cifras publicadas son exclusivamente de velocidad de inferencia.
- Sesgos y alucinaciones: no se documentan en esta model card. Se heredan los del modelo base, que no los detalla aqui.
- Idiomas: no se especifica la lista de idiomas soportados.
- Contexto: la longitud de contexto no se declara en este repositorio; hay que remitirse a la documentacion del modelo base.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en produccion ni de mantenimiento mas alla de la fecha de creacion (11 de octubre de 2026).
- Licencia: Apache 2.0, igual que el modelo original. El autor declara la obra como modificada, tal y como exige la licencia. La GPL-3.0-or-later del motor Janas no se aplica a los ficheros JNS.
- Cuantizacion: Q4_K_M introduce perdida de precision respecto a los pesos originales en safetensors. No se publican mediciones de esa degradacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/prabanta-dev/Qwen3-Next-80B-A3B-Instruct-JNS
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Version GGUF del modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct-GGUF
- Repositorio del motor Janas: https://github.com/prabanta-dev/janas
- Documentacion y detalles de rendimiento de Janas: https://github.com/prabanta-dev/janas#readme
- Binarios de Janas para Linux x86-64: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz
