# prabanta-dev/gemma-4-26B-A4B-it-JNS

## Resumen

`prabanta-dev/gemma-4-26B-A4B-it-JNS` es una conversion de pesos, no un modelo nuevo: parte de la cuantizacion GGUF de Unsloth del modelo `google/gemma-4-26B-A4B-it` y la reescribe al formato JNS que consume Janas, un motor de inferencia escrito en C y orientado a ordenadores "normales", con o sin GPU. El autor del repositorio es `prabanta-dev`, tambien responsable del proyecto Janas. El repositorio ocupa 18,8 GB y contiene dos archivos: los pesos principales cuantizados y un modelo asistente para decodificacion especulativa.

El problema que resuelve es de despliegue, no de modelado: permite ejecutar en CPU (y en GPU integrada) un modelo de mezcla de expertos declarado como 26B en el nombre, cuantizado en UD-Q4_K_M, sin depender de CUDA ni de una GPU dedicada. En el portatil de referencia del autor (Intel Core Ultra 9 185H con Arc integrada y 32 GB de RAM) Janas mide 90 tok/s de lectura de prompt y 18 tok/s de escritura, que suben a 26 tok/s al activar el asistente de borrador.

Es relevante para quien quiera inferencia local en hardware modesto, pero conviene subrayar que los archivos solo los lee Janas: no hay compatibilidad con llama.cpp, vLLM, Ollama ni TGI, y toda la informacion tecnica disponible procede de la model card del autor y de la nomenclatura del propio nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun los tags del repositorio; detalles internos no disponibles |
| Parametros totales | 26B, segun la nomenclatura del nombre del modelo; no confirmado en la informacion proporcionada |
| Parametros activos | Aproximadamente 4B, segun el sufijo A4B del nombre; no confirmado en la informacion proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_M (Unsloth Dynamic Q4_K_M) en los pesos principales; cuantizacion del asistente MTP no especificada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JNS (formato propio del motor Janas); solo lectura por Janas |

Otros datos del repositorio: 18,8 GB de tamano total, 0 descargas y 0 likes en el momento de la consulta, creado el 11 de octubre de 2026 y actualizado el mismo dia. Los dos archivos son `gemma-4-26b-a4b-it-udq4km.jns` (18,30 GB, SHA-256 `35c3845bbc21de52bf630d3c7455b4bb5379c34487b5925e020ec2e573931666`) y `gemma-4-26b-it-mtp.jns` (0,46 GB, SHA-256 `6ba24ee91fe6fe904b29919acbb654a66d9caa0aba67db1df9f921a76e5bcedf`).

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo original en los datos proporcionados: se desconoce el numero de tokens, la composicion del dataset y si hubo RLHF, DPO u otra fase de alineacion. Lo unico verificable es que la arquitectura es de mezcla de expertos, tal y como declaran los tags del repositorio, y que el modelo base es una variante instruct (`-it`) de Google.

Lo que si esta documentado es la intervencion del autor: no se reentreno ni se podo nada. Cada archivo es un GGUF cuantizado por terceros (Unsloth) reescrito por la herramienta `gguf2jns` en el orden en que Janas lo lee, con los metadatos conservados. La innovacion practica esta en el empaquetado: cada par (capa, experto) ocupa su propia ranura, de modo que los expertos que un token necesita se pueden leer de disco de forma independiente, lo que reduce el coste de E/S en inferencia MoE sobre CPU. El repositorio incluye ademas un asistente MTP (multi-token prediction) convertido del mismo modo desde su propio GGUF, que actua como modelo borrador para decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en modo instruct, heredada del modelo base `google/gemma-4-26B-A4B-it`.
- Razonamiento y generacion de codigo: capacidades del modelo base, no verificadas de forma independiente en este repositorio.
- Decodificacion especulativa mediante el asistente MTP incluido, que eleva la velocidad de escritura de 18 a 26 tok/s en el equipo de referencia.
- Inferencia en CPU pura y con GPU integrada, sin depender de CUDA.
- Ejecucion con lectura de expertos bajo demanda desde disco, util en equipos con memoria limitada.
- Tool calling, soporte de agentes, vision, audio, modo de razonamiento explicito y cobertura multilingue: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en portatil sin GPU dedicada: con 32 GB de RAM y una Arc integrada el modelo responde a 18 tok/s, suficiente para chat interactivo, y a 26 tok/s con el asistente MTP activado.
- Procesamiento de documentos confidenciales en local: al no requerir servicio en la nube ni GPU, el texto nunca sale del equipo, lo que encaja en entornos con requisitos de privacidad estrictos.
- Generacion y revision de codigo offline: un desarrollador puede mantener un asistente de autocompletado o explicacion de codigo en su maquina de trabajo, aunque el rendimiento real en tareas de codigo no esta medido en el repositorio.
- Despliegue en flotas de sobremesa de oficina: el motor es un binario de C sin dependencias de CUDA, lo que simplifica la distribucion frente a stacks con drivers de NVIDIA.
- Prototipado de tecnicas de decodificacion especulativa: el par de archivos (pesos + borrador MTP) permite experimentar con draft-verify en hardware de consumo.
- Investigacion sobre formatos de cuantizacion y empaquetado MoE: el esquema de ranura por experto es un caso de estudio replicable comparando contra GGUF servido por llama.cpp.
- Laboratorios docentes con hardware heterogeneo: al funcionar en CPU con 32 GB, no exige tarjetas graficas para practicas de inferencia con modelos de decenas de miles de millones de parametros.
- Evaluacion comparativa de motores de inferencia: el repositorio publica una medicion directa contra llama.cpp (84 frente a 76 tok/s leyendo, 18 frente a 12 tok/s escribiendo, con prompt de 1.024 tokens y 16 generados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo unico medido es velocidad de inferencia, en un portatil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de memoria, el 9 y 10 de octubre de 2026 con `janas-bench` y `llama-bench`:

| Metrica | Janas | llama.cpp |
|---|---:|---:|
| Lectura de prompt (tok/s) | 84 | 76 |
| Escritura (tok/s) | 18 | 12 |

El autor indica ademas 90 tok/s de lectura y 18 tok/s de escritura como cifras generales, y 26 tok/s de escritura en chat al usar el asistente de borrador propio. Todas las cifras son del equipo del autor y pueden variar en otras maquinas.

## Requisitos de hardware

- Almacenamiento o memoria: los pesos principales ocupan 18,30 GB y el asistente 0,46 GB, 18,8 GB en total. Se necesitan al menos unos 19 GB de espacio libre, mas margen para el contexto y el runtime.
- RAM: el equipo de referencia usa 32 GB. Con 16 GB no seria viable ejecutar los pesos completos en memoria; el diseno de lectura de expertos por ranura esta pensado precisamente para no exigir que todo resida en RAM.
- VRAM: no disponible de forma explicita; si se quiere mantener todo en memoria de GPU, 18,8 GB de pesos implican tarjetas de 24 GB o mas (RTX 4090, RTX 3090, A100 40 GB, H100).
- GPU recomendadas: no disponibles. El unico hardware documentado es la GPU Arc integrada del Core Ultra 9 185H.
- Cabe en GPU de consumo: los pesos caben con poco margen en una RTX 4090 o 3090 de 24 GB, pero el motor esta optimizado para CPU y no se documenta soporte CUDA.
- Opciones de despliegue: exclusivamente Janas. Se descarga el binario para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores), se usa `./janas-get gemma-4-26b-a4b` para bajar y verificar los archivos y `./janas-chat gemma-4-26b-a4b` para conversar. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 84 tok/s de lectura y 18 tok/s de escritura en el equipo de referencia; 90 tok/s y 18 tok/s segun las cifras generales del autor; 26 tok/s de escritura con el borrador MTP en chat.

## Comparativa con modelos similares

La comparacion relevante no es con otros modelos, sino con otras distribuciones del mismo modelo base, ya que aqui no hay pesos nuevos.

| Distribucion | Parametros | Formato | Motor | Licencia | Notas |
|---|---|---|---|---|---|
| `prabanta-dev/gemma-4-26B-A4B-it-JNS` | 26B / ~4B activos segun nombre | JNS | Janas | Apache 2.0 | 18,30 GB + 0,46 GB de asistente; solo Janas |
| `google/gemma-4-26B-A4B-it` | 26B / ~4B activos segun nombre | safetensors (no confirmado) | Transformers y afines | Apache 2.0 declarada en la model card | Repositorio original sin archivo LICENSE |
| `unsloth/gemma-4-26B-A4B-it-GGUF` | 26B / ~4B activos segun nombre | GGUF (UD-Q4_K_M entre otras) | llama.cpp y derivados | Apache 2.0 | Origen directo de la conversion a JNS |

Frente a llama.cpp sobre el mismo modelo cuantizado y el mismo portatil, el autor reporta ventaja en lectura (84 frente a 76 tok/s) y en escritura (18 frente a 12 tok/s).

## Limitaciones y advertencias

- Compatibilidad nula con el ecosistema habitual: los archivos JNS solo los lee Janas. No se pueden cargar en llama.cpp, Ollama, vLLM, Transformers ni TGI, lo que limita su uso en produccion ya establecida.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones equivalentes. El unico dato publicado es velocidad de inferencia, y esta medido por el propio autor.
- Ambiguedad en el modelo base: la informacion proporcionada no incluye contexto, idiomas, arquitectura detallada ni ficha de entrenamiento del `google/gemma-4-26B-A4B-it`. Los 26B totales y los ~4B activos se deducen del nombre, no de una especificacion confirmada.
- Riesgo legal: la model card de este repositorio senala que el repositorio original de Google no incluye archivo LICENSE y que la declaracion Apache 2.0 figura solo en su model card. Conviene verificar la licencia del modelo base antes de un uso comercial.
- Cuantizacion de 4 bits: los pesos principales estan en UD-Q4_K_M, lo que implica degradacion respecto a precision completa, especialmente en tareas de razonamiento o codigo sensible a errores numericos.
- Modelo cuantizado por terceros: los GGUF de origen son de Unsloth, y el autor de este repositorio no valida su calidad ni su alineacion.
- Alucinacion: no hay datos especificos, pero se trata de un modelo de lenguaje generativo sin mecanismos de verificacion documentados.
- Idiomas y sesgos: no disponibles. No se puede confirmar cobertura multilingue ni comportamiento diferencial por idioma o dominio.
- Adopcion nula: 0 descargas y 0 likes en la fecha de consulta, sin validacion externa de los archivos ni de las cifras de rendimiento.
- Entorno de medida limitado: las velocidades proceden de un unico equipo (Core Ultra 9 185H, Arc integrada, 32 GB) y el propio autor advierte que en otras maquinas las cifras diferiran.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/prabanta-dev/gemma-4-26B-A4B-it-JNS
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- GGUF de origen: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Motor Janas (repositorio, GPL-3.0-or-later): https://github.com/prabanta-dev/janas
- README y detalles de Janas: https://github.com/prabanta-dev/janas#readme
- Binarios de Janas para Linux x86-64: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz
