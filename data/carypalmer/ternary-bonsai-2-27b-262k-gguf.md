# CaryPalmer/Ternary-Bonsai-2-27B-262k-GGUF

## Resumen

Ternary-Bonsai-2-27B-262k-GGUF es un empaquetado de servicio (serving) publicado por el usuario CaryPalmer sobre los pesos ya cuantizados del modelo Ternary Bonsai 2 27B de PrismML. No se trata de una nueva cuantización: el tronco es byte a byte idéntico al fichero original `Ternary-Bonsai-2-27B-PTQ1_0.gguf`, y lo que se anade es la cabeza de decodificacion especulativa MTP (multi-token prediction) injertada como `blk.64.*`, ademas de una pila de servicio parcheada sobre llama.cpp con 33 modificaciones. El objetivo declarado es permitir usar la ventana de contexto completa de 262.144 tokens con cache KV en q8_0 sobre una unica GPU consumer de 12 GB, en concreto una RTX 4070.

El modelo base tiene 27.320.697.856 parametros (unos 27,3 mil millones) en formato ternario de 1,58 bits (`PTQ1_0`), lo que reduce el peso del tronco a unos 5,9 GB. La relevancia de esta ficha esta en el apartado de runtime: segun el autor, buena parte de la brecha de calidad que se atribuye a Bonsai 2 en codigo y agentes proviene del servidor y no de la compresion ternaria, y las cifras que presenta (HumanEval 164 de 161 aciertos, AppWorld del 64,3 % al 70,8 %) se obtienen sin tocar un solo peso, unicamente normalizando el parametro `effort`, elevando el limite de tokens de salida y usando gramatica nativa para las llamadas a herramientas.

La licencia es Apache 2.0 y el idioma soportado es unicamente el ingles. El repositorio, de 7,0 GB, incluye los binarios de Windows (sm_75, sm_86 y sm_89 mas PTX compute_89 para RTX 50) y un lanzador en PowerShell. El proyecto esta orientado a equipos con GPU NVIDIA y sistema Windows, aunque existe un script de compilacion para Linux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder, etiquetado como `qwen3_5`; no se especifica si es densa o MoE |
| Parametros totales | 27.320.697.856 (unos 27,3 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos ternarios `PTQ1_0` (1,58 bits); cache KV en q8_0 (el autor compara con recetas previas en q4_0) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`Ternary-Bonsai-2-27B-PTQ1_0-mtp-procreations.gguf`, 6,40 GB) |
| Tamano del repositorio | 7,0 GB |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf |
| Fecha de publicacion | 2026-10-07 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de 27,3 B parametros, etiquetado en el repositorio con la familia `qwen3_5`, cuantizado a precision ternaria mediante la receta `PTQ1_0` de PrismML (post-training quantization a 1,58 bits). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; estos datos no aparecen en la informacion proporcionada. Tampoco se documenta si la arquitectura emplea mezcla de expertos, atencion lineal u otra innovacion estructural.

La contribucion tecnica de este repositorio es doble. Por un lado, la injerto de una cabeza MTP (multi-token prediction) procedente de `ProCreations/Ternary-Bonsai-2-27B-MTP` como bloque `blk.64.*`, con decodificacion especulativa sin perdida (la salida es identica a la de no usar drafting) y una tasa de aceptacion del borrador del 70,6 %. Por otro, una cache KV por niveles: los primeros 113.000 posiciones aproximadamente residen en VRAM y el resto en RAM de sistema fijada (pinned), con salida bit a bit identica. Se suman 33 parches de servicio sobre el fork de llama.cpp de PrismML que normalizan parametros rechazados por la plantilla de chat (por ejemplo `effort: "high"`), elevan el limite de tokens de salida cuando el modo de razonamiento esta activo y aplican una gramatica de servidor para las llamadas a herramientas en XML nativo. De forma opcional, una capa de servidor anade tarjetas de API exactas, una comprobacion de API y una herramienta Python en sandbox (CPython 3.12 sobre WASI).

## Capacidades

- Generacion de texto conversacional en ingles, con razonamiento explicito (`thinking mode`) controlado por el parametro `effort`.
- Generacion de codigo: completado de codigo y resolucion de problemas tipo HumanEval, con puntuacion de 161 sobre 164 en modo razonamiento medio evaluado en sandbox.
- Razonamiento matematico: 56 sobre 60 en AIME 2025 y 76 sobre 100 en MMLU-Pro con la capa de servidor activada.
- Llamada a herramientas y function calling: 9 de 9 peticiones parseadas correctamente usando gramatica nativa XML del servidor, frente a 1 de 9 sin ella.
- Comportamiento agentico multi-paso: la suite AppWorld completa (168 tareas de test, agente ReAct de codigo) alcanza el 70,8 %.
- Contexto largo real: ventana de 262.144 tokens con cache KV en q8_0, mantenida en una GPU de 12 GB mediante cache por niveles.
- Decodificacion especulativa con MTP a cualquier profundidad de contexto, con salida identica a la decodificacion sin borrador.
- Integracion con clientes que hablan la API compatible con OpenAI (Cline, Kilo, Open WebUI) mediante la normalizacion de parametros que estos envian.
- Herramienta Python en sandbox opcional, con 14 canarios de aislamiento y runtime descargable con verificacion de checksum.
- Capacidades de vision, audio o multimodalidad: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codigo autonomos de contexto largo: con 262.144 tokens de ventana y 70 tok/s de decodificacion a 112k de contexto, el modelo puede mantener en memoria un repositorio mediano completo, los ficheros modificados y el historial de acciones del agente sin truncar. La puntuacion del 70,8 % en AppWorld respalda este escenario.
- Asistente de programacion integrado en IDE: al exponer una API compatible con OpenAI en el puerto 8080, se puede conectar directamente a extensiones tipo Cline o Kilo, que envian `effort: "high"` y limites de salida bajos; el servidor los normaliza y evita los errores HTTP 500 que daba el despliegue estandar.
- Refactorizacion de ficheros grandes: el prefill sostenido de 918 tok/s a 32k y 539 tok/s a 112k permite ingerir modulos de decenas de miles de tokens y devolver parches coherentes con el resto del codigo en una sola pasada.
- Analisis de documentacion tecnica extensa: manuales, RFCs o normativas de mas de 100k tokens caben en la ventana, y la precision q8_0 de la cache KV (1 token superior invertido de cada 160, frente a 1 de cada 48 en q4_0) reduce la degradacion en tareas de recuperacion exacta de datos.
- Automatizacion de tareas con herramientas externas: el parseo nativo de llamadas a herramientas (9 de 9) lo hace apto para pipelines que encadenan busquedas, ejecucion de comandos y escritura de ficheros sin post-procesado fragil.
- Ejecucion de codigo generado en entorno controlado: la capa opcional incluye un runtime Python en sandbox con aislamiento, lo que permite validar el codigo producido antes de aplicarlo, util en pipelines de CI/CD.
- Evaluacion de tecnicas de cuantizacion extrema: al mantener el tronco ternario y demostrar que el cuello de botella estaba en el runtime, sirve como banco de pruebas para estudiar el impacto real de la cuantizacion frente al de la pila de servicio.
- Despliegue en puesto de trabajo individual: con una unica RTX 4070, el modelo entrega entre 83 y 106 tok/s hasta 32k de contexto, lo que hace viable su uso interactivo en local sin infraestructura de servidor.

## Benchmarks y rendimiento

Rendimiento de decodificacion y prefill declarado sobre una RTX 4070 de 12 GB, una sola ranura, cache KV en q8_0, cabeza MTP activada, prefill acumulativo, pantalla conectada a la iGPU:

| Contexto | Decodificacion (tok/s) | Prefill (tok/s) |
|---|---:|---:|
| 4k | 83 | 1.100 |
| 16k | 106 | 1.100 |
| 32k | 100 | 918 |
| 64k | 87 | 724 |
| 112k (ultima posicion en VRAM) | 70 | 539 |
| 131k | 41 | 374 |
| 180k | 27 | 298 |
| 258k (final de la ventana) | 14,7 | 229 |

Resultados de calidad:

| Benchmark | Resultado |
|---|---|
| HumanEval 164, razonamiento medio, puntuado en sandbox | 161 |
| HumanEval 164 desde una app que envia `effort: "high"` | 160 (frente a 0 en el servidor estandar) |
| AppWorld, 168 tareas de test, agente ReAct de codigo | 70,8 % (IC 95 % 63,6-77,2), frente al 64,3 % publicado en el servidor estandar |
| AIME 2025 (60) | 56 con la capa de servidor; 52 en crudo |
| MMLU-Pro (100) | 76 con la capa de servidor; 71 en crudo |
| Suite de trabajo exacto de contexto largo, 37 tareas | 28 con la capa (13 rescates, 2 perdidas); 29 en un segundo conjunto de semillas |
| Tasa de aceptacion del borrador MTP | 70,6 % |

Advertencia: todos estos datos proceden de la model card del autor del repositorio y de la documentacion que este enlaza; no son cifras verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: los pesos ternarios ocupan unos 5,9 GB (fichero GGUF de 6,40 GB con la cabeza MTP). El autor demuestra la ventana completa de 262.144 tokens con cache KV en q8_0 sobre 12 GB, repartiendo las primeras 113.000 posiciones en VRAM y el resto en RAM de sistema fijada.
- GPU objetivo: NVIDIA RTX 20, 30, 40 y 50. El bundle incluye codigo de maquina sm_75, sm_86 y sm_89, mas PTX compute_89 para las RTX 50, y runtime CUDA 13. Requiere controlador NVIDIA.
- Cabe en GPU consumer: si, el escenario de referencia es una unica RTX 4070 de 12 GB. Por debajo de 12 GB no hay datos en la informacion disponible.
- Sistema operativo: Windows x64 mediante `start-server.ps1` y el bundle precompilado; en Linux existe `build/build_linux.sh`, que compila el codigo fuente fijado de PrismML con los 33 parches, aunque no hay binario precompilado para Linux.
- Opciones de despliegue: llama.cpp en el fork parcheado de PrismML incluido en el bundle, servidor con API compatible con OpenAI en `http://<host>:8080/v1` y clave bearer en `artifacts\api_key.txt`; interfaz de chat de llama.cpp en el mismo puerto. Tambien funciona el GGUF original sin la cabeza MTP, desactivando la decodificacion especulativa con `BONSAI_SPEC=0`.
- Latencia y throughput: los de la tabla anterior, medidos en una RTX 4070 de 12 GB. La decodificacion especulativa aporta, segun el autor, entre un 50 % y un 100 % de mejora en decodificacion.
- Espacio en disco: 7,0 GB para el repositorio completo (modelo de 6,40 GB mas bundle de 587 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CaryPalmer/Ternary-Bonsai-2-27B-262k-GGUF | 27,3 B | 262.144 | GGUF + binarios Windows | Apache 2.0 | Incluye cabeza MTP y pila de servicio parcheada; idioma en |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | 27,3 B | no disponible | GGUF | Apache 2.0 | Pesos originales sin la cabeza MTP; mismo tronco byte a byte |
| ProCreations/Ternary-Bonsai-2-27B-MTP | 27,3 B | no disponible | no disponible | no disponible | Origen de la cabeza MTP Q8_0 on-policy injertada en este repositorio |

No se dispone de datos sobre otros modelos de 27 B en cuantizacion ternaria con los que establecer una comparacion cuantitativa de rendimiento. Los benchmarks de la seccion anterior solo comparan este empaquetado con su propio modelo base servido de forma estandar, no con modelos de terceros.

## Limitaciones y advertencias

- Idioma: unicamente ingles declarado. No hay soporte multilingue documentado, por lo que su uso en castellano degradara la calidad de forma no medida.
- Cuantizacion ternaria: los pesos operan a 1,58 bits, lo que implica una perdida de calidad frente al modelo en precision completa que no se cuantifica en la informacion disponible.
- Precedencia: se trata de un empaquetado de terceros (CaryPalmer) sobre pesos de PrismML, con una cabeza MTP de otro autor (ProCreations). El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- Dependencia del runtime: los buenos resultados en codigo y agentes solo se alcanzan con el servidor parcheado y, en parte, con la capa opcional. Con un llama.cpp estandar el comportamiento es el publicado originalmente (64,3 % en AppWorld, 0 en HumanEval desde apps que envian `effort: "high"`).
- Cache KV por niveles: a partir de los 131k tokens la velocidad cae a 41 tok/s y termina en 14,7 tok/s a 258k, lo que hace impractico el uso interactivo cerca del final de la ventana. Ademas, parte de la cache reside en RAM de sistema, con la dependencia de latencia de memoria que ello implica.
- Plataforma: el bundle precompilado solo cubre Windows x64 con GPU NVIDIA. Linux requiere compilacion manual. No hay soporte documentado para AMD, Intel, Apple Silicon ni CPU.
- Herramienta en sandbox: la capa que ejecuta Python es opcional y requiere descargar un runtime adicional con verificacion de checksum y canarios de aislamiento; los datos sobre su robustez frente a escapes no son verificables con la informacion aportada.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de veracidad o tasas de alucinacion. Como en cualquier modelo generativo, las referencias, citas y resultados numericos deben verificarse.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgos.
- Cifras no verificadas: todos los benchmarks y velocidades proceden de la documentacion del autor y no de una evaluacion independiente.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de pesos de PrismML conviene verificar las condiciones de los repositorios originales antes de un despliegue en produccion.

## Enlaces

- Ficha de HuggingFace: https://huggingface.co/CaryPalmer/Ternary-Bonsai-2-27B-262k-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Cabeza MTP original: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Repositorio de codigo: https://github.com/professorpalmer/bonsai-ada-surgery
- Documentacion de rendimiento citada: `docs/Q8_FULL_CONTEXT.md`, `docs/RECEIPTS.md` y `docs/QUALITY.md` dentro del repositorio anterior
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
