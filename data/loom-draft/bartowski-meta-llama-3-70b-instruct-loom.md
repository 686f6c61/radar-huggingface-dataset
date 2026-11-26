# loom-draft/bartowski-Meta-Llama-3-70B-Instruct-loom

## Resumen
El paquete `loom-draft/bartowski-Meta-Llama-3-70B-Instruct-loom` no es un modelo entrenado desde cero, sino una distribucion empaquetada del checkpoint GGUF `Meta-Llama-3-70B-Instruct-Q4_K_M.gguf` de bartowski para el runtime AMD Loom (proyecto `hrx-system` de ROCm). Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next`, que produce programas `.loom` y una tarjeta `model.json` a partir del GGUF sin intervencion de un LLM en el bucle. El objetivo es ejecutar Llama 3 70B Instruct cuantizado en Q4_K_M sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Llama 3 70B Instruct de Meta, un transformer denso de 70 mil millones de parametros con 8.192 tokens de contexto por peticion en esta configuracion. La relevancia de este paquete es de infraestructura: permite servir el modelo con una API compatible con OpenAI (`/v1/chat/completions`) mediante `loom-serve`, sin depender de llama.cpp, sobre hardware AMD de consumo y profesional. Los pesos son los originales sin modificar; lo que cambia es el formato de ejecucion y el stack de despliegue.

La ficha tiene poco recorrido como "modelo" en sentido estricto: no hay datos de benchmarks propios, las puertas de correccion (`kernel_tests`, `golden`, `compare`, etc.) figuran como "not yet re-measured" y el rendimiento frente a llama.cpp tampoco se ha vuelto a medir para este paquete. Las cifras de arquitectura y entrenamiento que se detallan a continuacion corresponden al modelo base Llama 3 70B Instruct, no a mediciones de este empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3), decodificador autorregresivo |
| Parametros totales | 70 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens por peticion (preset de este paquete); el modelo base soporta hasta 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF), unico peso incluido en el paquete |
| Idiomas soportados | no disponible en la informacion del paquete (el modelo base Llama 3 esta entrenado principalmente en ingles, con soporte oficial de aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | MIT (segun la model card del paquete) |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Tool calling | no aplicable segun la model card |
| Decodificacion especulativa | no aplicable segun la model card |
| Vision / audio | no determinado |

## Arquitectura y entrenamiento
El modelo subyacente, Llama 3 70B Instruct, es un transformer denso con atencion multi-cabeza agrupada (GQA) y tokenizador BPE de 128.000 entradas, afinado con instrucciones y preferencias por Meta. El paquete Loom no modifica los pesos: `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas gfx1151 y gfx1201 a partir del GGUF Q4_K_M, junto con `tokenizer.json`, `llm_config.json` y un `model.json` con los ficheros fuente fijados por hash sha256 que verifica `loom-fetch`. El runtime usa IREE sobre ROCm/HIP; en hosts con memlock de 8 MiB hay que lanzar `loom-serve` bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` para que IREE recurra a su proactor POSIX, o elevar `ulimit -l`.

No hay informacion en la documentacion proporcionada sobre el dataset de entrenamiento, el numero de tokens, las fases de RLHF/DPO ni innovaciones de decodificacion propias de este empaquetado. Las opciones de servicio documentadas son `--pool_backing=fixed` (reserva el pool de memoria por adelantado), `completion_spin_ns=4294967295` (espera activa de completaciones en GPU, ajuste usado en las mediciones de rendimiento de la tarjeta) y `--parameter_mode=preload`, que solo cambia como se cargan los pesos en el host.

## Capacidades
- Generacion de texto conversacional multi-turno con 8.192 tokens de contexto por peticion y hasta 4.096 tokens de salida.
- Razonamiento, conocimiento general y matematicas heredados de Llama 3 70B Instruct; no hay evaluacion propia publicada para este paquete.
- Generacion de codigo: capacidad del modelo base, sin tool calling disponible en este empaquetado.
- Servicio concurrente: 4 peticiones simultaneas con la puerta de consistencia definida (misma salida en concurrencia que en ejecucion aislada), aunque sin medicion registrada.
- API compatible con OpenAI para integracion directa con clientes existentes.
- Tool calling, modo thinking, razonamiento con esfuerzo configurable, decodificacion especulativa, entrada de imagen y audio: marcados como no aplicables o no determinados en la model card.
- Multilingue: no verificado en este paquete; depende de las capacidades del modelo base.

## Casos de uso
- Servicio de chat sobre hardware AMD de escritorio o estacion de trabajo: `loom-serve` expone `/v1/chat/completions` en `127.0.0.1:8080`, de modo que un cliente compatible con OpenAI puede apuntar a la APU Strix Halo o a la R9700 sin reescribir la aplicacion.
- Evaluacion de Llama 3 70B Q4_K_M en GPUs Radeon: util para comparar calidad y velocidad frente a llama.cpp sobre el mismo GGUF, que es precisamente la referencia contra la que se definen las puertas `golden` y `compare`.
- Despliegue en entornos con requisitos de soberania de hardware: al ejecutarse sobre ROCm y no requerir CUDA, encaja en infraestructuras AMD ya existentes.
- Prototipado de asistentes conversacionales con contexto medio (hasta 8.192 tokens): suficiente para dialogos multi-turno, resumen de documentos cortos y clasificacion con ejemplos.
- Pruebas de integracion de pipelines de inferencia: la API estilo OpenAI permite validar clientes, orquestadores y capas de observabilidad contra un backend alternativo.
- Benchmarking de kernels generados: las puertas de `loom-benchmark` (kernel_tests, golden, consistency, sampling, logits) permiten medir la fidelidad numerica de los kernels `.loom` frente a la referencia de llama.cpp.
- Docencia e investigacion sobre runtimes de inferencia: el paquete incluye programas `.loom` legibles y un `model.json` con hashes, lo que facilita estudiar como se traduce un grafo de transformer a kernels especificos de GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de 70B, lo que tipicamente ronda 40-45 GB de pesos; debe caber en el pool de memoria del preset, pero la cifra exacta no se documenta.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 ni con GPUs NVIDIA; el stack es ROCm/HIP.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir. En hosts con memlock bajo, lanzar bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` o elevar `ulimit -l`.
- Parametros de servicio relevantes: `--pool_backing=fixed`, `completion_spin_ns=4294967295`, `--parameter_mode=preload` (solo carga en host).
- Latencia y throughput: no disponibles; las mediciones de la tarjeta no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| Este paquete (Llama 3 70B Instruct Q4_K_M para Loom) | 70B denso | 8.192 | Q4_K_M | MIT (paquete) | Loom / IREE / ROCm | Hugging Face, 0 descargas |
| bartowski/Meta-Llama-3-70B-Instruct-GGUF | 70B denso | 8.192 | Multiples GGUF | Licencia Llama 3 de Meta | llama.cpp y derivados | Hugging Face, ampliamente usado |
| Llama 3.1 70B Instruct | 70B denso | 128.000 | Multiples | Licencia Llama 3.1 de Meta | Multiples | Hugging Face |
| Qwen2.5 72B Instruct | 72B denso | 131.072 | Multiples | Apache 2.0 | Multiples | Hugging Face |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento de este paquete que permitan contrastar calidad o velocidad con las alternativas.

## Limitaciones y advertencias
- La licencia declarada del paquete es MIT, pero los pesos derivan de Llama 3 70B Instruct, sujeto a la licencia comunitaria de Meta; conviene verificar la compatibilidad para uso comercial antes de desplegar.
- No hay mediciones de rendimiento ni de correccion registradas para este paquete: todas las puertas figuran como "not yet re-measured".
- Contexto limitado a 8.192 tokens por peticion en este preset, inferior al de modelos contemporaneos con ventanas de 128k.
- Tool calling, modo thinking y decodificacion especulativa no estan disponibles; no apto para flujos de agentes que dependan de function calling.
- Soporte de vision y audio sin determinar; no asumir capacidades multimodales.
- Concurrencia maxima de 4 peticiones, lo que limita el uso en produccion con trafico alto.
- Compatibilidad restringida a dos GPUs AMD concretas (gfx1151 y gfx1201); no hay evidencia de funcionamiento en otras arquitecturas.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de sesgo ni de seguridad para este empaquetado.
- El paquete registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (26 de noviembre de 2026): madurez y soporte comunitario practicamente nulos.
- Los resultados de busqueda web sobre "Loom" corresponden a la herramienta de grabacion de pantalla y a una marca de ropa, no al runtime AMD; no aportan informacion tecnica relevante.

## Enlaces
- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Meta-Llama-3-70B-Instruct-loom
- GGUF de origen: https://huggingface.co/bartowski/Meta-Llama-3-70B-Instruct-GGUF
- Runtime AMD Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
