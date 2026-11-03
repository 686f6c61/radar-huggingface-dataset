# divagr1925/Qwen3.5-4B-Qwenputer-Filesystem

## Resumen

Qwen3.5-4B-Qwenputer-Filesystem es un modelo experimental publicado por divagr1925 (Divyansh Agrawal) que parte de Qwen/Qwen3.5-4B y le incorpora, compiladas directamente en los pesos, una CPU RISC-V de 32 bits (RV32IM con extension Zba y coprocesador de enteros grandes) y un sistema de ficheros persistente. No se trata de un plugin, una herramienta externa ni un sandbox: son 12 capas de transformer adicionales insertadas antes de las 32 de Qwen, cuyos pesos no se aprenden, sino que un compilador calcula de forma determinista.

La innovacion central es el uso del estado de las capas Gated DeltaNet de Qwen3.5 como RAM y como almacenamiento. La regla delta permite sobrescribir una fila del estado de forma exacta con una clave one-hot, de modo que cada fila funciona como una celda de memoria. Ahi viven los registros, el contador de programa y el sistema de ficheros, que admite hasta 512 ficheros (unos 53.000 tokens de texto) indexados mediante un directorio con hash de 1.024 ranuras. La persistencia se consigue guardando el estado entre sesiones.

El modelo es relevante porque demuestra una via distinta para dotar de memoria persistente a un LLM sin depender de RAG, bases de datos vectoriales ni ejecutores de herramientas en el host. Los pesos de Qwen permanecen intactos (relacion `merge`), el checkpoint carga como un `Qwen3_5ForCausalLM` estandar y el comportamiento de texto se mantiene practicamente identico al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForCausalLM` (solo texto) con 12 capas compiladas antepuestas; CPU RV32IM + Zba + coprocesador bignum + sistema de ficheros |
| Parametros totales | 11.098.254.592 (11,1 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado y validado en bf16; el autor indica precision exacta en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos tecnicos: hidden size de 4608 (2560 de Qwen mas las dimensiones del computador), vocabulario de Qwen ampliado con 236.469 tokens de traza, tamano de repositorio de 22,3 GB en bf16 (mayoritariamente relleno de ceros) y aproximadamente 18 GB de memoria de GPU en uso durante la inferencia.

## Arquitectura y entrenamiento

El modelo conserva las 32 capas de Qwen3.5-4B sin modificar y antepone 12 capas de computador cuyos pesos son generados por un compilador, no aprendidos. Estas capas implementan una CPU RISC-V de 32 bits con extension Zba y un coprocesador para aritmetica de enteros grandes, capaz de ejecutar codigo C y MicroPython dentro de los propios forward passes del modelo. El estado de las capas Gated DeltaNet de Qwen se reutiliza como memoria: una clave one-hot sobrescribe una fila concreta mediante la regla delta y una consulta one-hot la recupera, lo que permite almacenar registros, memoria y contador de programa de forma exacta.

El sistema de ficheros se apoya en un directorio con hash de 1.024 ranuras que indexa hasta 512 ficheros (aproximadamente 53.000 tokens de texto); una busqueda requiere dos o tres tokens de traza. El modelo no invoca herramientas externas: se aprovecha del formato de tool calling de Qwen3.5 y expone cinco herramientas (`put`, `append`, `get`, `list`, `delete`) que ninguna entidad fuera del modelo ejecuta; las capas de computador interpretan el nombre y el texto escritos por Qwen y generan el `<tool_response>` token a token. No hay datos publicados sobre el volumen o la composicion del dataset de entrenamiento, ni sobre fases de RLHF o DPO, porque los pesos de Qwen no se han reentrenado.

## Capacidades

- Generacion de texto y conversacion multiturno heredadas de Qwen3.5-4B.
- Memoria persistente entre sesiones: guarda el estado al final de una conversacion y los ficheros siguen disponibles en la siguiente con contexto vacio.
- Sistema de ficheros interno de hasta 512 ficheros y unos 53.000 tokens de texto, con directorio indexado por hash.
- Operaciones de fichero mediante el formato de tool calling: `put`, `append`, `get`, `list` y `delete`, resueltas internamente sin ejecutor externo.
- Ejecucion de codigo C y MicroPython dentro de los forward passes gracias a la CPU RV32IM embebida.
- Aritmetica exacta: el autor reporta que todos los resultados de `calc` son exactos y que la prueba `mul_big` de DeepMind puntua 97,5.
- Recuperacion de hechos almacenados y de hechos que cambiaron en sesiones posteriores.
- Soporte de tool calling heredado del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes con memoria de usuario a largo plazo: el modelo guarda hechos sobre el usuario con `put` y los recupera con `get` en sesiones posteriores, sin necesidad de una base de datos vectorial ni de RAG; los benchmarks del autor muestran 83,3 en recuerdo multisession frente a 7,8 del modelo base.
- Gestion de preferencias que cambian con el tiempo: al poder sobrescribir entradas del sistema de ficheros, resulta adecuado para escenarios donde un dato del usuario se actualiza y debe prevalecer sobre el anterior (90,0 en el benchmark de hechos modificados).
- Agentes con estado persistente sin orquestador externo: el estado del sistema de ficheros se serializa con `save_store()` y se recarga con `load_store()`, lo que permite reanudar un agente entre ejecuciones sin infraestructura adicional.
- Ejecucion de calculo determinista dentro del modelo: la CPU RV32IM y el coprocesador bignum permiten resolver operaciones aritmeticas de forma exacta dentro del propio forward pass, util en tareas donde la alucinacion numerica es inaceptable.
- Experimentacion en investigacion sobre memoria en LLM: sirve como banco de pruebas para estudiar el uso del estado de capas DeltaNet como almacenamiento direccionable y para comparar con enfoques de tool calling en el host.
- Despliegue en hardware de gama alta para consumo: al ocupar unos 18 GB de memoria de GPU, cabe en una GPU de 24 GB y permite prototipar asistentes con memoria persistente en una sola maquina.
- Ejecucion de codigo embebido en el modelo: la capacidad de correr C y MicroPython dentro de los forward passes abre lineas de trabajo sobre interpretes compilados en pesos.

## Benchmarks y rendimiento

Resultados publicados por el autor, con decodificacion greedy. Las dos columnas con herramientas usan el mismo system prompt; la columna de herramienta Python ejecuta las cinco herramientas en el host.

| Benchmark | Qwen3.5-4B base | Qwenputer Filesystem | Herramienta Python (host) |
|---|---|---|---|
| Recuerdo multisession, 90 preguntas | 7,8 | 83,3 | 78,9 |
| Hechos que cambiaron en una sesion posterior, 30 preguntas | 3,3 | 90,0 | 83,3 |
| Recuerdo de 50 cadenas almacenadas en una sesion nueva | n/a | 100 | 100 |
| Recuerdo de 200 cadenas almacenadas en una sesion nueva | n/a | 100 | 100 |

El autor indica ademas que, con las sesiones pasadas pegadas en el prompt, el modelo base obtiene 76,7 en recuerdo multisession pero solo 30,0 en los hechos que cambiaron. En una unica conversacion larga, Qwen responde desde su contexto y no consulta el sistema de ficheros. La verificacion token a token del sistema de ficheros frente a un modelo de referencia no encontro discrepancias; la divergencia de comportamiento de texto respecto al base es KL 5,5e-4 frente a un suelo de ruido de 5,1e-4.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB de memoria de GPU en uso; el checkpoint completo en bf16 ocupa 22,3 GB.
- Cabe en GPU de consumo de 24 GB (por ejemplo, RTX 4090); no se han publicado datos para GPU de 16 GB o menos.
- GPU profesionales recomendadas: A100, H100 o similares para mayor throughput; no se han publicado cifras de latencia ni de tokens por segundo.
- Despliegue: el autor documenta el uso con `transformers` mediante el script `chipformer.rv.chat` del repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- El modelo carga como un `Qwen3_5ForCausalLM` estandar, con cambios solo en la configuracion.
- La persistencia requiere guardar y cargar el estado con `--memory` en la CLI o con `RvChat.save_store()` y `load_store()` en Python.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria persistente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Qwenputer-Filesystem | 11,1 mil millones (12 capas compiladas + 32 de Qwen) | no disponible | Si, sistema de ficheros interno de 512 ficheros | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | No | Apache-2.0 (heredada) | HuggingFace |
| Qwen3.5-4B-Qwenputer (RISC-V) | no disponible | no disponible | No (solo CPU RISC-V) | Apache-2.0 | HuggingFace |
| Herramienta Python en host sobre Qwen3.5-4B | no disponible | no disponible | Si, mediante ejecutor externo | Apache-2.0 | Implementacion propia |

La comparacion directa con alternativas de la misma categoria (modelos con memoria persistente integrada en pesos) no esta disponible en la informacion proporcionada. El autor compara contra el modelo base y contra una implementacion de las mismas herramientas ejecutadas en Python en el host.

## Limitaciones y advertencias

- Modelo experimental (version 0.2.0): no esta pensado como sustituto de produccion del modelo base.
- Dentro de una unica conversacion larga, el modelo responde desde su contexto y no consulta el sistema de ficheros; la memoria persistente solo se aprovecha entre sesiones.
- La persistencia exige guardar y recargar el estado de forma explicita; sin ese paso, los ficheros no sobreviven a la sesion.
- El checkpoint ocupa 22,3 GB, en gran parte relleno de ceros, lo que encarece el almacenamiento y la distribucion frente a los pesos efectivos.
- No hay informacion publicada sobre sesgos, idiomas soportados, longitud de contexto ni tasas de alucinacion especificas de esta variante.
- El comportamiento de texto se mantiene proximo al base (KL 5,5e-4), por lo que hereda las limitaciones y sesgos de Qwen3.5-4B, no documentadas en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del sistema de ficheros en cargas de produccion.
- La validacion del sistema de ficheros se limita a los benchmarks sinteticos descritos; no se han publicado pruebas con cargas reales ni auditorias independientes.
- Requiere seguir el flujo del repositorio (`chipformer.rv.chat`) para la persistencia; no se documenta compatibilidad con servidores de inferencia habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-Filesystem
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante Qwenputer (RISC-V): https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Codigo en GitHub: https://github.com/divagr18/qwenputer/tree/rv-store/experimental/riscv
- Repositorio principal: https://github.com/divagr18/qwenputer
- DOI: 10.57967/hf/11262
