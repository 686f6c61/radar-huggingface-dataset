# CinderellaMan/Flint-Pascal-Q5-GGUF

## Resumen

Flint-Pascal-Q5-GGUF es una cuantización en formato GGUF del modelo Flint, un transformer de 39.785.287.456 parámetros (aproximadamente 39,8 mil millones) desarrollado por RecursiveSI. Esta versión concreta, publicada por CinderellaMan, está específicamente optimizada para tarjetas NVIDIA de arquitectura Pascal (compute capability 6.1), es decir, las GTX 10 series, Tesla P4/P40 y las tarjetas de minería P106 y P104 que abundan en rigs de criptominería retirados. El modelo base Flint destaca por su capacidad de razonamiento previo a la respuesta (thinking mode), generación de código, invocación de herramientas y una ventana de contexto de hasta 262.144 tokens.

La particularidad de esta cuantización radica en el uso exclusivo de los formatos Q5_0 y Q8_0, los dos más simples que decodifica el motor Pascal propietario del autor, a costa de una ligera pérdida de calidad frente a formatos más elaborados como UD-Q5_K_XL de Unsloth. El archivo ocupa 29,4 GB y promedia 5,9 bits por peso. Está pensado para ejecutarse en configuraciones de seis a nueve GPU de 6 GB, alcanzando velocidades de generación de 49,4 a 52 tokens por segundo en pruebas de agente de código sobre un rig de nueve P106-090.

La relevancia actual del proyecto reside en reaprovechar hardware obsoleto para inferencia de modelos de gran tamaño con contexto largo, un nicho que las cuantizaciones convencionais orientadas a GPU modernas no cubren de forma eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Flint de RecursiveSI) |
| Parametros totales | 39.785.287.456 (aproximadamente 39,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q5_0 y Q8_0 (promedio 5,9 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 29,4 GB |
| Modelo base | RecursiveSI/flint |
| Motor recomendado | Miner Llama v4.0 (propietario, optimizado para Pascal) |
| Compatibilidad | llama.cpp estándar (probado con b11820) sin aceleración Pascal |

## Arquitectura y entrenamiento

La información disponible describe el modelo base Flint como un transformer de 39,8 mil millones de parámetros con capacidad de razonamiento previo (thinking), generación de código, invocación de herramientas y contexto de 262.144 tokens. No se detallan en la documentación proporcionada los datos de entrenamiento del modelo base: número de tokens, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras variantes de alineación. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones arquitectónicas más allá del modo de razonamiento.

La innovación técnica de esta ficha concreta no está en el modelo sino en la estrategia de cuantización: el autor renuncia a formatos elaborados (como los K-quants o los UD de Unsloth) y emplea únicamente Q5_0 y Q8_0, que las unidades de cómputo limitadas de Pascal decodifican con mucha menos sobrecarga. El resultado es un archivo un tercio menor que Q8_0 (29,4 GB frente a 42,3 GB) que, en el rig de nueve P106-090 descrito, supera en velocidad tanto a Q8_0 como a UD-Q5_K_XL. La contrapartida es una fidelidad inferior: este archivo reproduce la siguiente palabra del modelo original el 88,8 % de las veces, frente al 90,7 % de UD-Q5_K_XL y el 93,3 % de Q8_0.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 262.144 tokens.
- Razonamiento previo a la respuesta (thinking mode), heredado del modelo base Flint.
- Generación y corrección de código, validada en pruebas de agente que resuelven bugs en tareas de programación.
- Invocación de herramientas y function calling, con compatibilidad con clientes OpenAI-compatible.
- Ejecución como agente de código multi-paso (pruebas con Miner Llama v2.0, v3 y v4 sobre doce tareas).
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Agente de código autónomo sobre rigs de minería reaprovechados: el modelo resuelve tareas de corrección de bugs en sesiones de agente; en las pruebas del autor completó las doce tareas con una mediana de 1,7 minutos por tarea, lo que lo hace adecuado para automatizar parches pequeños en pipelines de desarrollo.
- Inferencia de contexto largo en hardware antiguo: con los 262.144 tokens de ventana y nueve tarjetas de 6 GB, permite analizar repositorios completos o documentación extensa sin recurrir a GPU modernas.
- Servicio local compatible con OpenAI API: el motor llama-server expone un endpoint en `127.0.0.1:8080` accesible por túnel SSH, de modo que cualquier cliente compatible con la API de OpenAI puede apuntar al rig sin cambios de código.
- Laboratorio de bajo coste para investigadores: permite estudiar comportamiento de modelos de 40B con contexto largo en hardware de segunda mano, comparando fidelidad y velocidad entre cuantizaciones (Q5_0/Q8_0 frente a UD-Q5_K_XL).
- Asistente conversacional con memoria extensa: la ventana de 262.144 tokens admite conversaciones multi-turno muy largas con historial completo, útil para atención al cliente técnica o tutoría con documentos de referencia.
- Despliegue en entornos con restricciones de presupuesto energético y de compra: seis tarjetas P106 de 6 GB cubren conversaciones de contexto corto, ofreciendo una alternativa económica a una única GPU de gama alta.

## Benchmarks y rendimiento

| Metrica | Este archivo (Q5 Pascal) | UD-Q5_K_XL (Unsloth) | Q8_0 (Unsloth) |
|---|---|---|---|
| Velocidad, Miner Llama v3 (tok/s) | 49,4 | 46,4 | 45,9 |
| Velocidad, Miner Llama v2.0 (tok/s) | 53,8 | 44,2 | 45,9 y 44,6 (dos ejecuciones) |
| Velocidad, Miner Llama v4 (tok/s) | 52,01 | no disponible | no disponible |
| Fidelidad (predice la siguiente palabra del original) | 88,8 % | 90,7 % | 93,3 % |
| Tamano del archivo | 29,4 GB | mismo tamano que este archivo | 42,3 GB |
| Tareas de agente superadas (12) | 12 | no disponible | no disponible |
| Velocidad en llama.cpp estándar b12076 | 15,6 (commit anterior) | 13,7 (contexto 65.536) | no disponible |

Datos adicionales de Miner Llama v4 (una ejecución): primer token tras 1,82 s (frente a 2,81 s en v3), lectura de prompts a 195,6 tok/s (frente a 169,1 en v3), generación a 52,01 tok/s (frente a 51,77 en v3). No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 30 GB para los pesos, más espacio para la caché KV del contexto; seis tarjetas de 6 GB cubren conversaciones cortas y las nueve completas permiten los 262.144 tokens.
- GPU compatibles: NVIDIA Pascal compute capability 6.1 (P106-090, P104, GTX 10 series, Tesla P4/P40). El autor midió la velocidad únicamente en P106-090.
- Configuración de referencia del autor: nueve P106-090 de 6 GB, cada una en un carril PCIe 1.0, host Celeron de 2 núcleos, driver NVIDIA 580 sobre Ubuntu 24.04.
- GPU modernas: el autor recomienda usar UD-Q5_K_XL de Unsloth en su lugar, por ser del mismo tamaño y más fiel al original.
- Opciones de despliegue: Miner Llama v4.0 (motor propietario con aceleración Pascal) y llama.cpp estándar (probado con b11820) sin aceleración. No se menciona soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 49,4 a 52,01 tok/s de generación en agente con Miner Llama v3/v4; primer token en 1,82 s (v4); lectura de prompts a 195,6 tok/s (v4). En llama.cpp estándar la velocidad cae a 15,6 tok/s (commit anterior) y 13,7 tok/s para UD-Q5_K_XL (b12076, contexto 65.536).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Flint-Pascal-Q5-GGUF (este) | 39,8B | 262.144 | GGUF Q5_0/Q8_0 | 29,4 GB | Apache 2.0 | Optimizado para Pascal; más rápido en P106, menor fidelidad |
| flint-GGUF Q8_0 (Unsloth) | 39,8B | 262.144 | GGUF Q8_0 | 42,3 GB | Apache 2.0 | Casi sin pérdida (93,3 %), requiere nueve tarjetas para contexto completo |
| flint-GGUF UD-Q5_K_XL (Unsloth) | 39,8B | 262.144 | GGUF K-quant | similar a este archivo | Apache 2.0 | Mejor fidelidad (90,7 %) en GPU modernas; más lento en Pascal |

## Limitaciones y advertencias

- Pérdida de calidad respecto al modelo original: reproduce la siguiente palabra del base solo el 88,8 % de las veces, por debajo de UD-Q5_K_XL (90,7 %) y Q8_0 (93,3 %).
- Rendimiento dependiente del motor: la aceleración descrita solo se obtiene con Miner Llama v3/v4; en llama.cpp estándar cae a 15,6 tok/s.
- Hardware muy específico: la optimización apunta a Pascal compute capability 6.1; en GPU modernas o Mac el autor recomienda otra cuantización.
- Contexto completo exige nueve tarjetas de 6 GB; con seis tarjetas hay que reducir la ventana de contexto.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni sobre sesgos lingüísticos.
- Riesgo de alucinación: no cuantificado en la documentación; el modo de razonamiento previo del modelo base no elimina este riesgo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base RecursiveSI/flint antes de desplegar.
- Fecha de creación registrada en 2026-10-26 y actualización 2026-11-16; el ecosistema de motores y releases citados (Miner Llama v4, llama.cpp b12076) puede cambiar y romper la configuración documentada.
- Resultados de velocidad proceden de un único rig y, en el caso de v4, de una sola ejecución; no deben extrapolarse a otras configuraciones.

## Enlaces

- Hugging Face: https://huggingface.co/CinderellaMan/Flint-Pascal-Q5-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/flint-GGUF
- Repositorio del motor y guías: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs
- Release Miner Llama v4.0: https://github.com/Cinderella-Man/miner-llama/releases/tag/miner-llama-v4.0
- Guía de instalación: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/setup.md
- Documentación de Flint en el repo: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/models/flint/README.md
- Notas de la release flint-v4: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/release/flint-v4/README.md
- Benchmark de agente: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/tree/main/bench/agent_check
