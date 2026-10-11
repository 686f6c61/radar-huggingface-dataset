# prabanta-dev/Qwen3.6-35B-A3B-JNS

# Qwen3.6-35B-A3B-JNS: cuantización JNS del modelo Qwen3.6-35B-A3B

## Resumen
Qwen3.6-35B-A3B-JNS es una conversión de pesos, no un modelo entrenado desde cero. El autor (prabanta-dev) toma el GGUF Q4_K_M publicado por bartowski a partir del modelo Qwen3.6-35B-A3B de Alibaba Cloud (equipo Qwen) y lo reescribe en JNS, el formato binario del motor de inferencia Janas, escrito en C y orientado a ordenadores convencionales con o sin GPU. El objetivo es permitir la inferencia local de un modelo de mezcla de expertos (MoE) en equipos de gama de consumo, incluidos portátiles con GPU integrada.

La relevancia del artefacto está en el rendimiento medido, no en la calidad del modelo base: según la model card, en un portátil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de memoria, Janas lee un prompt a 88 tok/s y escribe a 20 tok/s, frente a 78 y 11 tok/s de llama.cpp en la misma máquina con idéntica configuración. En modo chat y con su propio bloque de borrador (draft), la escritura sube a 34 tok/s.

El repositorio contiene un único fichero de 22,29 GB, no declara idiomas soportados ni longitud de contexto, y en el momento de la consulta acumula 0 descargas y 0 likes. Los pesos se distribuyen bajo licencia Apache 2.0, la misma del modelo original, con la obligación de declarar la obra modificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con MTP (multi-token prediction) integrado, según la model card del autor |
| Parámetros totales | No disponible de forma explícita; la nomenclatura del nombre (35B) indica aproximadamente 35 000 millones |
| Parámetros activos | No disponible de forma explícita; la nomenclatura del nombre (A3B) indica aproximadamente 3000 millones por token |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M, única cuantización incluida; las matrices down de los expertos se reordenan en tres planos de 2 bits cada uno |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (obra modificada del modelo original; se debe indicar la modificación) |
| Formato de pesos | JNS (formato del motor Janas), derivado de GGUF Q4_K_M |
| Tamano del repositorio | 22,3 GB (fichero `qwen3.6-35b-a3b-q4km.jns`, 22,29 GB) |
| SHA-256 del fichero | `8feaeb66d93593b9876b564ca3878f2a9252e46b8d4e2d06caa4e19d43dc6464` |
| Modelo base | `Qwen/Qwen3.6-35B-A3B` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
No hubo entrenamiento ni ajuste: la model card indica explícitamente que «nada fue reentrenado ni podado». El proceso es una conversión en dos pasos. Primero, `gguf2jns` reescribe el GGUF Q4_K_M en el orden de lectura que espera Janas, conservando los metadatos. Segundo, `jns_planes` corta las matrices down de los expertos en tres planos de 2 bits cada uno; se trata de una reordenación de los mismos bits, de modo que con los tres planos se recuperan los pesos cuantizados originales bit a bit.

La decisión de diseño destacable es el diseño de fichero: cada par (capa, experto) ocupa una ranura propia, de forma que los expertos que necesita un token concreto se pueden leer desde disco de manera independiente. Esto encaja con la naturaleza dispersa de una MoE y es lo que permite ejecutar el modelo en un portátil con memoria limitada, cargando únicamente los expertos activos. El modelo base incorpora MTP (multi-token prediction) según la model card, característica que Janas aprovecha como bloque de borrador para acelerar la decodificación (34 tok/s en lugar de 25 tok/s en modo chat). No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni la presencia de RLHF o DPO en el modelo original.

## Capacidades
- Generación de texto autoregresiva, heredada del modelo base Qwen3.6-35B-A3B.
- Inferencia local en CPU, con o sin GPU, mediante el motor Janas.
- Inferencia en CPU pura: el binario oficial se distribuye para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores).
- Carga selectiva de expertos: cada (capa, experto) reside en su propia ranura y puede leerse de disco de forma individual.
- Decodificación acelerada con bloque de borrador propio (MTP), con la que el autor mide 34 tok/s de escritura en chat.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Verificación de integridad: `janas-get` comprueba los ficheros descargados contra las huellas SHA-256 publicadas.

## Casos de uso
- Asistente de chat en portátil sin GPU dedicada: el autor demuestra el modelo en un Intel Core Ultra 9 185H con GPU Arc integrada y 32 GB de RAM, alcanzando 34 tok/s de escritura en chat con el bloque de borrador. Es el escenario de referencia del artefacto.
- Inferencia en entornos aislados (air-gapped): al ejecutarse íntegramente en local y no requerir conectividad, encaja en estaciones de trabajo con datos que no pueden salir de la organización, como expedientes médicos, legal o defensa.
- Estaciones de trabajo de desarrollo sin GPU: al distribuirse un binario Linux x86-64 que funciona en CPU, permite tener un modelo de clase 35B como asistente de código local en máquinas donde no hay acelerador.
- Procesamiento por lotes de documentación interna: clasificación, resumen y extracción de datos sobre volúmenes de texto en un servidor de CPU, sin coste por token de API y con control total del dato.
- Evaluación comparativa de motores de inferencia: el par GGUF/JNS del mismo modelo base permite reproducir la comparación Janas frente a llama.cpp con `janas-bench` y `llama-bench`, útil para decidir el motor de un despliegue.
- Despliegue de campo o en periferia (edge): equipos portátiles o mini-PC con 32 GB de memoria pueden ejecutar el modelo sin depender de la nube, por ejemplo para consulta de manuales técnicos in situ.
- Investigación sobre formatos de pesos y cuantización MoE: el esquema de ranuras por experto y la división en planos de 2 bits es un caso de estudio reproducible para quien investiga lectura selectiva de expertos desde disco.
- Prototipado de producto sobre modelos Qwen: sirve para validar una idea con el modelo 35B antes de decidir si se necesita un endpoint en servidor con GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica mediciones de rendimiento de inferencia, realizadas el 9 y 10 de octubre de 2026 con `janas-bench` y `llama-bench` en un portátil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de memoria.

Comparación directa publicada en la model card (prompt de 1024 tokens, 16 tokens generados, cada motor en su mejor configuración):

| Medición | Janas | llama.cpp |
|---|---:|---:|
| Lectura del prompt (tok/s) | 88 | 78 |
| Escritura (tok/s) | 20 | 11 |

Cifras adicionales del mismo equipo, citadas en el encabezado de la model card:

| Modo | Lectura (tok/s) | Escritura (tok/s) |
|---|---:|---:|
| Prompt general | 86 | 25 |
| Chat con bloque de borrador propio | No disponible | 34 |

Advertencia del propio autor: las cifras corresponden a esa máquina concreta y variarán en otros equipos.

## Requisitos de hardware
- Tamaño de los pesos: 22,29 GB para la única cuantización incluida (Q4_K_M reescrita a JNS).
- Memoria mínima estimada: el autor lo ejecuta en un equipo con 32 GB de memoria, con GPU Arc integrada y presumiblemente reparto entre CPU y GPU. La estimación de VRAM necesaria para descargar todos los pesos en GPU (>22,3 GB, más caché KV para contexto largo) se deriva del tamaño del fichero; no está confirmada por el autor.
- GPU recomendadas para descarga completa: A100 (40 o 80 GB), H100, o tarjetas de 48 GB como RTX 6000 Ada. Las GPU de 24 GB (RTX 3090, 4090) quedan al límite del peso de los pesos y no admitirían contextos largos sin reparto a CPU.
- GPU de consumo: no cabe entera en tarjetas de 8, 12 o 16 GB. Sí es viable con reparto parcial CPU/GPU o mediante carga selectiva de expertos, que es precisamente el diseño del formato.
- CPU: el binario oficial de Janas se distribuye para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores). También se puede compilar desde fuentes.
- Opciones de despliegue: Janas es el único motor que lee los ficheros JNS. Para llama.cpp, Ollama, LM Studio u otros motores hay que usar el GGUF original de bartowski, no este repositorio. Soporte de vLLM o TGI para este artefacto: no disponible.
- Latencia y throughput: 88 tok/s de lectura y 20 tok/s de escritura frente a llama.cpp en la máquina de referencia; 86/25 tok/s de forma general y hasta 34 tok/s de escritura en chat con bloque de borrador.
- Almacenamiento: reservar al menos 22,3 GB en disco, más el espacio del GGUF original si se quieren mantener ambos formatos.

## Comparativa con modelos similares

| Artefacto | Formato | Tamaño | Motor compatible | Licencia | Notas |
|---|---|---|---|---|---|
| `prabanta-dev/Qwen3.6-35B-A3B-JNS` | JNS | 22,29 GB | Janas (único lector) | Apache 2.0 | Ranuras por (capa, experto) y planos de 2 bits en las matrices down; 0 descargas |
| `bartowski/Qwen_Qwen3.6-35B-A3B-GGUF` (Q4_K_M) | GGUF | No disponible | llama.cpp, Ollama, LM Studio | Apache 2.0 | Origen de la conversión; catálogo más amplio de cuantizaciones |
| `Qwen/Qwen3.6-35B-A3B` (modelo base) | No disponible | No disponible | Depende del runtime | Apache 2.0 | Modelo original de Alibaba Cloud (equipo Qwen); pesos sin cuantizar del autor original |

No se dispone de datos de contexto, idiomas ni benchmarks de calidad de ninguno de los tres artefactos en la información proporcionada, por lo que la comparación se limita a formato, tamaño, motor compatible y licencia.

## Limitaciones y advertencias
- No es un modelo nuevo: es una reescritura de formato del GGUF de bartowski. Cualquier defecto, sesgo o alucinación del modelo base se hereda intacto. No hay evaluación de calidad publicada para este artefacto.
- Dependencia de un único motor: los ficheros JNS solo los lee Janas. No se pueden cargar directamente en llama.cpp, Ollama, vLLM, TGI o LM Studio. La licencia GPL-3.0-or-later del motor Janas no se aplica a estos pesos, pero sí obliga a quien redistribuya o modifique el binario.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar el aviso de licencia y declarar que se trata de una obra modificada, tal como hace el propio autor en la model card. También hay que respetar la atribución al modelo base de Alibaba Cloud y a la cuantización de bartowski.
- Cuantización con pérdida: Q4_K_M implica pérdida de precisión respecto a los pesos originales, con posible degradación en tareas de razonamiento y matemáticas. Los planos de 2 bits son una reordenación reversible, no una cuantización adicional.
- Memoria: 22,29 GB de pesos exigen 32 GB de RAM en un equipo con GPU integrada, o bien un reparto cuidadoso CPU/GPU. En máquinas con menos memoria habrá intercambio a disco y la velocidad caerá de forma acusada.
- Cifras de rendimiento no extrapolables: provienen de una única máquina (Intel Core Ultra 9 185H con Arc integrada) y de una configuración concreta. El propio autor advierte que en otros equipos los números serán distintos, y no se publican intervalos de variación ni repeticiones.
- Metadatos incompletos: el repositorio no declara idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues multilingües o con contexto largo.
- Madurez y mantenimiento: 0 descargas y 0 likes en el momento del análisis, un único mantenedor y fechas de creación y actualización separadas por cuatro minutos (11 de octubre de 2026). No hay historial de revisión ni pruebas de terceros.
- Infraestructura de referencia limitada: solo se distribuye binario para Linux x86-64; usuarios de macOS, Windows o ARM dependen de compilar desde fuentes.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/prabanta-dev/Qwen3.6-35B-A3B-JNS
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- GGUF de origen (bartowski): https://huggingface.co/bartowski/Qwen_Qwen3.6-35B-A3B-GGUF
- Repositorio del motor Janas: https://github.com/prabanta-dev/janas
- Instrucciones y detalles de rendimiento (README de Janas): https://github.com/prabanta-dev/janas#readme
- Descarga del binario de Janas para Linux x86-64: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz
