# loom-fun-staging/jdopensource-JoyAI-LLM-Flash-loom

## Resumen

JoyAI-LLM-Flash-loom es un paquete de despliegue distribuido en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `jdopensource/JoyAI-LLM-Flash-GGUF`, concretamente la cuantizacion `JoyAI-LLM-Flash-IQ4_XS.gguf`. Lo publica la organizacion `loom-fun-staging` y se ha generado sobre un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo de trabajo loom-skills. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales del modelo base, empaquetados para el motor de inferencia Loom (hrx-loom 0.3.0, hrx-system).

El interes del artefacto es de infraestructura mas que de modelado: permite servir el GGUF en GPU AMD (ROCm) a traves de una API compatible con OpenAI (`/v1/chat/completions`), con soporte de tool calling, 131.072 tokens de contexto por peticion y 4 peticiones concurrentes. La model card incluye mediciones de rendimiento frente a llama.cpp ROCm en el mismo hardware, con 76,9 tok/s de decodificacion en contexto corto y 1.251,5 tok/s de prefill con documentos de 1k tokens.

La licencia del paquete es MIT y el modelo base se distribuye tambien bajo MIT. El repositorio no registra descargas ni interacciones en el momento de la consulta y no publica informacion sobre arquitectura, numero de parametros, composicion del dataset de entrenamiento ni benchmarks de calidad, por lo que buena parte de la ficha tecnica queda marcada como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base `jdopensource/JoyAI-LLM-Flash`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion (preset de Loom) |
| Tipos de cuantizacion | IQ4_XS (unico fichero empaquetado: `JoyAI-LLM-Flash-IQ4_XS.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como paquete Loom con `model.json` y programas `.loom`) |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Motor de inferencia | hrx-loom 0.3.0 (hrx-system `e2c41a7`), backend ROCm |
| Hardware de referencia | AMD Ryzen AI Max+ 395 "Strix Halo" (amdgpu) |
| Fecha de medicion | 2026-11-23 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, uso de MoE, atencion lineal u otras variantes), ni sobre el volumen de tokens de entrenamiento, la composicion del corpus o las etapas de alineacion (RLHF, DPO). La model card de este paquete no documenta nada de ello y se limita a describir el empaquetado y el motor de servicio.

Lo que si se documenta es la innovacion a nivel de despliegue: Loom genera kernels especificos para el GGUF y los valida contra implementaciones de referencia (68 de 68 tests de kernel superados) y contra llama.cpp sobre el mismo checkpoint (comparacion de tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k tokens). El paquete no incluye cabecera MTP ni drafter, por lo que la decodificacion especulativa no esta disponible. El motor admite espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`) y un pool de memoria fijo (`--pool_backing=fixed`), ajustes con los que se obtuvieron las cifras de rendimiento publicadas.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), validado con una prueba de bucle agente multiturno que comprueba el renderizado exacto del prompt, la reutilizacion de historial y la validez de las llamadas.
- Procesamiento de contexto largo: hasta 131.072 tokens por peticion, con documentos de prueba de hasta 32k tokens en las validaciones.
- Concurrencia de 4 peticiones con resultados identicos a ejecuciones aisladas (prueba de consistencia superada).
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`, con verificacion de que la distribucion del primer token coincide con llama.cpp.
- Lectura de logits en host (`llm.logits`), con comprobacion de que el argmax por fila a T=0 coincide con el token del dispositivo.
- Modo de razonamiento o thinking: no aplicable segun la model card.
- Decodificacion especulativa: no aplicable (sin cabecera MTP ni drafter publicado para este modelo).
- Entrada de imagen: no determinada. Entrada o salida de audio: no determinada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Servicio de chat autohospedado en hardware AMD: el paquete permite levantar un endpoint compatible con OpenAI en una maquina Strix Halo con `loom-serve`, sin depender de CUDA ni de servicios en la nube, usando el GGUF IQ4_XS tal cual.
- Asistentes con historial largo: con 131.072 tokens de contexto por peticion se pueden mantener conversaciones o analisis de documentos extensos sin truncar, aunque el rendimiento de decodificacion cae a 21,3 tok/s tras 32k tokens de contexto.
- Procesamiento por lotes de documentos: el prefill de 1.251,5 tok/s con documentos de 1k tokens y 798,9 tok/s con 8k lo hace adecuado para tareas de resumen o extraccion sobre corpus medianos en los que el coste dominante es la lectura del prompt.
- Agentes con herramientas: el soporte verificado de `tools` y `tool_calls` permite integrar el modelo en flujos de function calling (consultas a APIs, operaciones sobre ficheros, orquestacion de pasos) sobre la API estandar.
- Evaluacion y desarrollo de motores de inferencia: al incluir pruebas golden, compare, consistency, agent y sampling contra llama.cpp, el paquete sirve como referencia reproducible para validar portes a ROCm o comparar kernels.
- Despliegue en estaciones de trabajo con GPU integrada: al estar medido en un Ryzen AI Max+ 395, es una opcion realista para equipos sin GPU discreta que necesiten servir un modelo cuantizado a 4 bits con concurrencia limitada (4 peticiones, 143,8 tok/s agregados en decodificacion).
- Prototipado de aplicaciones con muestreo controlado: la semilla y los parametros de muestreo verificados permiten reproducir respuestas en pruebas automatizadas.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (DevLab Dispatch runner X2-LA03-S01-D08), Linux, hrx-loom 0.3.0, el 2026-11-23. La comparacion con llama.cpp ROCm usa el mismo GGUF, el mismo runner y los mismos prompts; los valores son la mediana de 2 sesiones (3 en el caso de 4 streams). La columna de margen frente a llama.cpp no se pudo calcular porque no se registraron los valores del backend de referencia.

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | no registrado | 76,9 | no disponible |
| Decodificacion tok/s, contexto 2k | no registrado | 61,0 | no disponible |
| Decodificacion tok/s, contexto 32k | no registrado | 21,3 | no disponible |
| Prefill tok/s, documento 1k | no registrado | 1.251,5 | no disponible |
| Prefill tok/s, documento 2k | no registrado | 1.195,5 | no disponible |
| Prefill tok/s, documento 8k | no registrado | 798,9 | no disponible |
| Prefill tok/s, documento 16k | no registrado | 490,4 | no disponible |
| Prefill tok/s, documento 32k | no registrado | 266,0 | no disponible |
| 4 streams, decodificacion agregada tok/s | no registrado | 143,8 | no disponible |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo documenta puertas de correctitud: `kernel_tests` (68/68), `golden`, `compare`, `consistency`, `agent`, `sampling` y `logits`, todas superadas; `vision` y `spec` no aplican.

## Requisitos de hardware

- VRAM estimada: no disponible. El unico dato es que el checkpoint IQ4_XS se sirve en un Ryzen AI Max+ 395, un SoC con memoria unificada; el paquete no publica el consumo de memoria del preset.
- GPU recomendadas: AMD con soporte ROCm; la unica configuracion verificada es la GPU integrada del Ryzen AI Max+ 395 "Strix Halo". No hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: no hay confirmacion de funcionamiento en GPUs consumer NVIDIA; el backend documentado es `amdgpu://` via ROCm.
- Despliegue: `pipx install "hrx-loom[hf]==0.3.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. Los ajustes recomendados por la tarjeta son `--device=amdgpu://?completion_spin_ns=4294967295` y `--pool_backing=fixed`.
- Latencia y throughput: 76,9 tok/s en decodificacion de contexto corto, 61,0 tok/s a 2k y 21,3 tok/s a 32k; prefill entre 1.251,5 tok/s (1k) y 266,0 tok/s (32k); 143,8 tok/s agregados con 4 streams.
- Limitaciones operativas del preset: 4 peticiones concurrentes y 4.096 tokens maximos de salida.

## Comparativa con modelos similares

No hay informacion suficiente para comparar con modelos de la misma categoria, ya que se desconocen el tamano, la arquitectura y el rendimiento de calidad del modelo base. La unica comparacion documentada es de motor de inferencia, no de modelo: Loom frente a llama.cpp ROCm sobre el mismo GGUF y el mismo hardware, con los resultados de la tabla anterior (Loom alcanza 76,9 tok/s de decodificacion en contexto corto y 1.251,5 tok/s de prefill a 1k, sin valores de llama.cpp registrados para calcular el margen).

| Criterio | JoyAI-LLM-Flash-loom | Alternativas |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | 131.072 tokens | no disponible |
| Licencia | MIT | no disponible |
| Formato | GGUF IQ4_XS + paquete Loom | no disponible |
| Hardware verificado | AMD Strix Halo (ROCm) | no disponible |

## Limitaciones y advertencias

- No es un modelo nuevo: es un empaquetado del GGUF `jdopensource/JoyAI-LLM-Flash-GGUF` sin modificar. Cualquier limitacion del modelo base (sesgos, alucinacion, cobertura idiomatica) se hereda sin cambios y no esta documentada en esta tarjeta.
- La cuantizacion IQ4_XS introduce perdida de precision respecto a los pesos originales; las pruebas `compare` y `golden` admiten divergencias en casos de casi-empate, lo que implica que la salida no es bit a bit identica a la del modelo sin cuantizar.
- El rendimiento se degrada con el contexto: la decodificacion pasa de 76,9 tok/s en prompt corto a 21,3 tok/s a 32k tokens, una caida de aproximadamente el 72 %.
- El preset limita la salida a 4.096 tokens y la concurrencia a 4 peticiones; cargas mayores requieren ajustar el preset y no estan validadas.
- No hay decodificacion especulativa disponible, lo que limita el throughput en generacion larga.
- Solo se ha verificado en una GPU AMD Strix Halo con ROCm; no hay evidencia de funcionamiento en NVIDIA, Apple Silicon ni CPU.
- El soporte de vision y audio figura como "no determinado"; no debe asumirse multimodalidad.
- La licencia MIT del paquete y del modelo base permite uso comercial, pero conviene verificar los terminos del checkpoint original y de los datos de entrenamiento, no documentados aqui.
- El repositorio no registra descargas ni likes y esta alojado en una organizacion de staging (`loom-fun-staging`), lo que sugiere que el paquete puede moverse o desaparecer.
- La comparacion de rendimiento con llama.cpp no incluye los valores del backend de referencia ni los argumentos del servidor, por lo que el margen relativo no es verificable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/jdopensource-JoyAI-LLM-Flash-loom
- Modelo base GGUF: https://huggingface.co/jdopensource/JoyAI-LLM-Flash-GGUF
- Motor Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/45264713576/job/138008457755
