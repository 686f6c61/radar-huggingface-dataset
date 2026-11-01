# CinderellaMan/Flint-Pascal-Q5-GGUF

## Resumen

Flint-Pascal-Q5-GGUF es una cuantización en formato GGUF del modelo Flint, un transformer denso de 39.785.287.456 parámetros desarrollado por RecursiveSI, publicada por el usuario CinderellaMan. El modelo base está diseñado para razonar antes de responder, generar código, invocar herramientas y procesar hasta 262.144 tokens de contexto. Esta versión concreta no modifica el modelo, sino su empaquetado: redistribuye los pesos en bloques Q5_0 y Q8_0 para que las tarjetas NVIDIA de arquitectura Pascal (compute capability 6.1) puedan decodificarlos con rapidez.

El interés de esta ficha no reside en el modelo en sí, sino en el trabajo de ingeniería de despliegue: las GPUs Pascal (GTX 10 series, Tesla P4/P40, P106 y P104 de rigs de minería retirados) tienen pocas unidades de cómputo y dedican tiempo real a desempaquetar los formatos de cuantización modernos tipo K-quant. Este archivo usa únicamente los dos formatos más simples (Q5_0 y Q8_0, 5,9 bits por peso de media) y un motor derivado de llama.cpp, Miner Llama v2, para maximizar el throughput en ese hardware.

El resultado medido por el autor en un rig de nueve P106-090 es de 53,8 tokens por segundo generando y 178 tokens por segundo leyendo prompt, con 2,6 s hasta el primer token, en una prueba de agente de código de doce tareas. Frente a Unsloth UD-Q5_K_XL (mismo tamaño, formatos más elaborados) supone un 22 % más de velocidad, a costa de una fidelidad menor respecto al modelo original (88,8 % de coincidencia en el siguiente token frente a 90,7 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Flint de RecursiveSI); no se especifica en la información disponible si usa atención completa o variantes lineales |
| Parametros totales | 39.785.287.456 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (soportado por el modelo base y por este archivo en el motor Pascal con nueve tarjetas de 6 GB) |
| Tipos de cuantizacion | Q5_0 para la mayoría de pesos y Q8_0 para el resto; 5,9 bits por peso de media |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 29,4 GB |
| Modelo base | RecursiveSI/flint |
| Descargas en HuggingFace | 119 |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

La información disponible describe el modelo base Flint como un transformer de 39,8 mil millones de parámetros con un modo de razonamiento previo a la respuesta (thinking), capacidad de generación de código e invocación de herramientas, y una ventana de contexto de 262.144 tokens. No se detalla en la documentación proporcionada la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se especifica si emplea atención lineal, decodificación especulativa nativa u otras innovaciones arquitectónicas más allá del modo de razonamiento.

La contribución técnica de esta publicación es exclusivamente de cuantización y despliegue. El autor argumenta que los formatos K-quant (como UD-Q5_K_XL) extraen más calidad por bit pero requieren un desempaquetado costoso en GPUs con pocas unidades de cómputo; al restringirse a Q5_0 y Q8_0, el motor Pascal decodifica más rápido. El precio es una pérdida de fidelidad: el archivo reproduce el siguiente token del modelo original el 88,8 % de las veces, frente al 90,7 % de UD-Q5_K_XL y el 93,3 % de Q8_0. El autor anuncia además un "guesser" entrenado (drafter) para decodificación especulativa en una versión futura.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Razonamiento previo a la respuesta (modo thinking) heredado del modelo base Flint.
- Generación y corrección de código en Python y JavaScript, validado en la prueba de agente del autor con ejecución real de tests.
- Invocación de herramientas (tool calling) en flujos de agente de varios pasos: la prueba de referencia encadena entre cinco y diez llamadas a herramientas por tarea.
- Procesamiento de contexto largo: hasta 262.144 tokens, útil para repositorios completos o sesiones de agente prolongadas.
- Compatibilidad con clientes OpenAI-compatible mediante `llama-server` (endpoint HTTP con alias de modelo).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agente de corrección de bugs en producción: el modelo encadena lecturas de ficheros, ediciones y ejecución de tests en tareas de cinco a diez llamadas a herramientas, con el contexto creciendo en cada turno. El autor lo valida con doce tareas reales de Python y JavaScript completadas en 17 minutos en un rig de nueve P106-090.
- Reutilización de rigs de minería como nodos de inferencia: equipos con seis o nueve tarjetas de 6 GB (P106-090, P104) pueden servir el modelo con unos 30 GB de VRAM más espacio para contexto, aprovechando hardware que de otro modo quedaría obsoleto.
- Asistente de código en estaciones de trabajo con GPUs GTX 10 series: cualquier equipo con una GTX 1080 Ti o similar y suficiente memoria agregada puede ejecutar el archivo con llama.cpp estándar, aunque sin la aceleración del motor Pascal.
- Procesamiento de documentación extensa: la ventana de 262.144 tokens permite analizar repositorios, expedientes o corpus largos en una sola pasada sin troceado, siempre que se disponga de las nueve tarjetas para el contexto completo.
- Backend local para herramientas de desarrollo: al exponer una API compatible con OpenAI en `127.0.0.1:8080`, se integra con editores, plugins y scripts existentes sin cambios de cliente.
- Laboratorio de evaluación de cuantizaciones: sirve como referencia práctica para medir el compromiso entre velocidad de decodificación y fidelidad en hardware antiguo, comparando Q5_0/Q8_0 frente a K-quants con la misma prueba de agente.
- Despliegue en entornos con restricciones de red: al ser un archivo local de 29,4 GB con licencia Apache 2.0, puede operar completamente offline en infraestructura propia.

## Benchmarks y rendimiento

Prueba de agente de código del autor (`agent_check`, agente pi, doce tareas de corrección de bugs en Python y JavaScript, cinco a diez llamadas a herramientas por tarea, contexto creciente, ventana de 25 minutos). Hardware: nueve P106-090 de 6 GB, cada una en un carril PCIe 1.0, host Celeron de dos núcleos. Fecha: 2026-10-26.

| Archivo y motor | Tareas completadas (aprobadas) | Minutos por tarea (mediana) | Generación (tokens/s) | Lectura de prompt (tokens/s) | Primer token (mediana) |
|---|---|---|---|---|---|
| Este archivo, motor Pascal | 12 (12), todas en 17 min | 1,2 | 53,8 | 178 | 2,6 s |
| Unsloth Q8_0, motor Pascal (dos ejecuciones) | 12 (12) y 12 (12) | 1,1 y 1,4 | 45,9 y 44,6 | 176 y 185 | 2,6 s |
| Unsloth UD-Q5_K_XL, motor Pascal | 12 (12) en 25 min | 1,0 | 44,2 | 185 | 2,6 s |
| Este archivo, llama.cpp estándar, contexto 65.536 | 11 (10) | 2,1 | 15,6 | 143 | 4,2 s |
| Unsloth Q8_0, llama.cpp estándar, contexto 65.536 | 9 (8) | 2,9 | 14,4 | 144 | 3,7 s |

Notas del autor: una ejecución por fila salvo indicación; dos ejecuciones del mismo setup difirieron un 3 %. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 30 GB de memoria GPU para los pesos, más espacio adicional para la caché KV del contexto. Con seis tarjetas de 6 GB se cubren conversaciones cortas; las nueve son necesarias para los 262.144 tokens completos.
- GPUs objetivo: NVIDIA Pascal con compute capability 6.1, es decir, P106-090, P104, GTX 10 series y Tesla P4/P40. El rendimiento reportado se midió exclusivamente en P106-090.
- Controlador: Ubuntu 24.04 o superior con el driver NVIDIA 580, el último disponible para Pascal.
- Motor recomendado: Miner Llama v2 (`llama-server` del fork de Cinderella-Man), que aporta la aceleración específica. El archivo también funciona en llama.cpp estándar (probado con la release b11820) y en aplicaciones construidas sobre él, sin la mejora de velocidad.
- Throughput medido: 53,8 tokens/s de generación y 178 tokens/s de lectura de prompt con el motor Pascal y nueve tarjetas; 15,6 tokens/s de generación con llama.cpp estándar a 65.536 tokens de contexto.
- Latencia: 2,6 s hasta el primer token (mediana) con el motor Pascal; 4,2 s con llama.cpp estándar.
- En GPU moderna o Mac: el autor recomienda usar Unsloth UD-Q5_K_XL en su lugar, por mayor fidelidad al modelo original con el mismo tamaño.
- Comando de referencia (nueve tarjetas, contexto completo): `llama-server -m flint-pascal-Q5.gguf --alias flint -ngl 99 -fa on -c 262144 -np 1 -b 512 -ub 128 -bs --ctx-checkpoints 4 --cache-ram 0 --pipe-depth 4 --host 127.0.0.1 --port 8080`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Fidelidad (siguiente token del original) | Generación en P106-090 x9 (tokens/s) | Licencia |
|---|---|---|---|---|---|---|
| Flint-Pascal-Q5 (este) | 39,8 B | 262.144 | 29,4 GB | 88,8 % | 53,8 | Apache 2.0 |
| Unsloth UD-Q5_K_XL | 39,8 B | 262.144 | ~29,4 GB (mismo tamano) | 90,7 % | 44,2 | Apache 2.0 |
| Unsloth Q8_0 | 39,8 B | 262.144 | 42,3 GB | 93,3 % | 44,6–45,9 | Apache 2.0 |

Los tres archivos derivan del mismo modelo base (RecursiveSI/flint) y comparten parámetros, contexto y licencia; la diferencia está en el formato de cuantización y en el motor de inferencia. No se dispone de datos comparativos frente a modelos de otros proveedores con tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad respecto al modelo original: reproduce el siguiente token correcto el 88,8 % de las veces, por debajo de UD-Q5_K_XL (90,7 %) y Q8_0 (93,3 %). En tareas sensibles a la precisión, esta diferencia puede acumularse.
- El archivo está optimizado exclusivamente para GPUs Pascal. En hardware moderno o Apple Silicon rinde peor que alternativas del mismo tamaño, y el propio autor desaconseja su uso allí.
- Dependencia de un fork no oficial de llama.cpp (Miner Llama v2) para obtener la velocidad anunciada; con llama.cpp estándar el throughput cae a 15,6 tokens/s en la prueba del autor.
- Requiere el driver NVIDIA 580, la última versión compatible con Pascal; no habrá soporte de controladores más allá de esa rama.
- Con seis tarjetas solo cabe un contexto reducido; el contexto completo de 262.144 tokens exige nueve tarjetas de 6 GB.
- El rendimiento se midió en un único rig concreto (P106-090, PCIe 1.0, Celeron de dos núcleos) y con una sola ejecución por configuración; la variabilidad entre ejecuciones fue del 3 %, pero la extrapolación a otros equipos no está validada.
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación del modelo base en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las condiciones del modelo base RecursiveSI/flint y de las herramientas derivadas de llama.cpp empleadas.
- El repositorio tiene 119 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente y con poca validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CinderellaMan/Flint-Pascal-Q5-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Cuantizaciones de Unsloth para Flint: https://huggingface.co/unsloth/flint-GGUF
- Motor Pascal (fork de llama.cpp, Miner Llama v2): https://github.com/Cinderella-Man/llama.cpp/releases
- Repositorio del proyecto llms-on-crypto-mining-rigs: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs
- Guía de instalación del driver: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/setup.md
- Página específica de Flint en el proyecto: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/models/flint/README.md
- Prueba de agente (agent_check): https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/tree/main/bench/agent_check
- Documentación del drafter planificado: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/drafter.md
- Agente de código pi: https://github.com/earendil-works/pi
