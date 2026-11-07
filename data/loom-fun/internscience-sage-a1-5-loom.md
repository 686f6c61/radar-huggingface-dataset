# loom-fun/InternScience-Sage-A1.5-loom

## Resumen

InternScience-Sage-A1.5-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar InternScience/Sage-A1.5-Q4_K_M-GGUF. Lo publica el usuario loom-fun y su proposito no es entrenar un modelo nuevo, sino empaquetar el modelo base Sage-A1.5 (35B de parametros, arquitectura Mixture-of-Experts, desarrollado por Shanghai AI Laboratory) para su ejecucion en GPUs integradas AMD Ryzen AI Max+ 395 "Strix Halo" mediante el runtime hrx-loom sobre ROCm.

El paquete incorpora decodificacion especulativa con Multi-Token Prediction (MTP) a profundidad 3, soporte de entrada de imagen mediante el proyector `Sage-A1.5-mmproj.gguf`, tool calling al estilo OpenAI y un modo de razonamiento activado por defecto. El servidor expone una API compatible con `/v1/chat/completions` en `127.0.0.1:8080` y admite 4 peticiones concurrentes con una ventana de contexto de 262.144 tokens por peticion.

Su relevancia es practica: demuestra que un modelo MoE de 35B cuantizado a Q4_K_M puede servirse en hardware de consumo con memoria unificada, con un prefill entre un 47 % y un 85 % mas rapido que llama.cpp en el mismo GGUF, aunque con un decode entre un 5 % y un 18 % mas lento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) segun el modelo base Sage-A1.5; el paquete Loom no redefine la arquitectura |
| Parametros totales | 35B (modelo base Sage-A1.5; Hugging Face indica 36B en la ficha del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF), segun el checkpoint base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Sage-A1.5-Q4_K_M.gguf`) mas proyector `Sage-A1.5-mmproj.gguf`; empaquetado como programas `.loom` y `model.json` |
| Tamano del repositorio | 0.0 GB (el paquete referencia el GGUF base, no lo redistribuye) |
| Pipeline | image-text-to-text |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Radeon 8060S |
| Runtime | hrx-loom 0.1.0 sobre hrx-system `d01d1c1`, ROCm |
| Salida maxima | 4.096 tokens (`max_tokens` predefinido) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: es una envoltura de despliegue generada con el flujo loom-skills sobre el GGUF `Sage-A1.5-Q4_K_M.gguf` sin modificaciones. La arquitectura subyacente corresponde al modelo base Sage-A1.5, un Mixture-of-Experts de 35B parametros de Shanghai AI Laboratory orientado a resolucion de problemas cientificos de horizonte largo y a orquestacion agentica, construido sobre Agents-A1. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron RLHF o DPO.

La innovacion tecnica del paquete esta en el runtime: kernels generados y validados contra implementaciones de referencia (45/45 tests unitarios superados), decodificacion especulativa MTP con profundidad 3 y una tasa de aceptacion de tokens borrador del 56 % en la puerta `spec`, y un motor de prefill que alcanza 1.714,7 tok/s en documentos de 1k frente a 1.132,2 tok/s de llama.cpp. El decode, en cambio, rinde 72,7 tok/s en prompt corto frente a 76,7 tok/s de llama.cpp, y cae a 63,0 tok/s a 32k de contexto (un 18 % por debajo). En 4 flujos concurrentes el agregado es de 88,9 tok/s frente a 140,7 tok/s de llama.cpp.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen en formato OpenAI `image_url`, con proyector multimodal dedicado; salida verificada identica a llama.cpp con el mismo proyector salvo empates cercanos.
- Tool calling al estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno validado en las puertas `agent` y `agent_think_off`.
- Decodificacion especulativa MTP integrada y activa por defecto, con salida identica a la decodificacion sin especulacion.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`, con distribucion del primer token equivalente a llama.cpp.
- Contexto de 262.144 tokens por peticion, con prueba needle-in-a-haystack superada hasta la mitad del contexto.
- Concurrencia de 4 peticiones con consistencia verificada frente a ejecuciones aisladas.
- Sin soporte de audio ni de control de esfuerzo de razonamiento (reasoning effort).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion cientifica extensa: con 262.144 tokens de contexto y un prefill de 1.423,6 tok/s a 32k, el modelo puede ingerir articulos o informes completos y responder preguntas sobre ellos en una sola peticion.
- Asistentes de investigacion con orquestacion agentica: el modelo base esta disenado para descomponer problemas cientificos y revisar su enfoque durante la ejecucion; el tool calling validado permite encadenar busquedas, calculos y consultas a bases de datos.
- Procesamiento de documentos escaneados o figuras: la entrada de imagen via proyector mmproj permite extraer y razonar sobre tablas, graficos y capturas dentro de un flujo image-text-to-text.
- Despliegue en estaciones de trabajo sin GPU dedicada: al ejecutarse en un Ryzen AI Max+ 395 con memoria unificada, habilita inferencia de un MoE de 35B en un equipo compacto con 72,7 tok/s de decode en prompt corto.
- Automatizacion de back-office con tool calling: integracion en pipelines internos mediante la API OpenAI-compatible en `127.0.0.1:8080`, con 4 peticiones concurrentes y salida maxima de 4.096 tokens por respuesta.
- Prototipado y evaluacion de modelos agenticos: las puertas de correctitud (`golden`, `compare`, `agent`, `needle`) permiten comparar el comportamiento contra llama.cpp sobre el mismo GGUF antes de pasar a produccion.
- Servicio de chat con razonamiento explicito: el modo thinking por defecto resulta adecuado para tareas de analisis que requieren trazas de razonamiento, y puede desactivarse para reducir latencia en consultas simples.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0, sobre el mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Diferencia | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 76,7 | 72,7 | -5 % | 141,9 | 51 % |
| Decode tok/s, contexto 2k | 69,6 | 65,9 | -5 % | 132,7 | 50 % |
| Decode tok/s, contexto 32k | 77,0 | 63,0 | -18 % | 150,9 | 42 % |
| Prefill tok/s, documento 1k | 1.132,2 | 1.714,7 | +51 % | 11.600,2 | 15 % |
| Prefill tok/s, documento 2k | 1.155,5 | 1.706,3 | +48 % | 11.416,3 | 15 % |
| Prefill tok/s, documento 8k | 1.139,5 | 1.675,2 | +47 % | 10.424,8 | 16 % |
| Prefill tok/s, documento 16k | 958,4 | 1.582,1 | +65 % | 9.343,0 | 17 % |
| Prefill tok/s, documento 32k | 770,6 | 1.423,6 | +85 % | 7.737,1 | 18 % |
| 4 flujos, decode agregado tok/s | 140,7 | 88,9 | -37 % | 245,9 | 36 % |
| Tokens borrador aceptados (especulativa) | no medido | 56 % | no aplicable | no disponible | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son exclusivamente de rendimiento de inferencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo se ejecuta sobre memoria unificada en un Ryzen AI Max+ 395, que admite hasta 216 GB/s de ancho de banda y 59 TFLOP/s segun el calculo de roofline del autor.
- GPU recomendadas: el unico dispositivo validado es la Radeon 8060S integrada en el Ryzen AI Max+ 395 (gfx1151). No hay datos de ejecucion en A100, H100 ni RTX 4090.
- GPU de consumo: el paquete esta disenado para hardware integrado AMD con memoria unificada; no se documenta compatibilidad con GPUs consumer NVIDIA.
- Opciones de despliegue: `loom-serve --model=Sage-A1.5/model.json --device=amdgpu`, previa materializacion con `loom-fetch`. Para comparar, el autor usa llama.cpp build `llamacpp-rocm/b1369` con `-ngl 99 --spec-type draft-mtp --spec-draft-n-max 2 -c 35024 -kvu -np 4`.
- Instalacion: `pip install "hrx-loom[hf]"`.
- Latencia y throughput: decode de 72,7 tok/s en prompt corto y 63,0 tok/s a 32k; prefill de 1.714,7 tok/s a 1k y 1.423,6 tok/s a 32k; 88,9 tok/s agregados con 4 flujos concurrentes.
- Nota de medicion: los tiempos de Loom son del lado del cliente y los de llama.cpp del lado del servidor, lo que puede introducir diferencias metodologicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InternScience-Sage-A1.5-loom (este paquete) | 35B MoE | 262.144 | no disponible | GGUF + `.loom` | Optimizado para Strix Halo; prefill superior, decode inferior a llama.cpp |
| Sage-A1.5 (modelo base, InternScience) | 35B MoE (36B en la ficha de HF) | no disponible | no disponible | safetensors y GGUF Q4_K_M | Modelo agentico cientifico de Shanghai AI Laboratory |
| Sage-A1.5-Q4_K_M-GGUF ejecutado en llama.cpp | 35B MoE | 35.024 en la configuracion medida | no disponible | GGUF | Referencia de correctitud y rendimiento usada por el autor |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento cognitivo con alternativas de la misma categoria. La comparativa disponible es de motor de inferencia, no de modelo.

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base Sage-A1.5 antes de cualquier despliegue en produccion.
- No se declaran idiomas soportados; el comportamiento multilingue es desconocido.
- La puerta `needle_full` (needle-in-a-haystack con el contexto completo) no aporta evidencia: solo se ha verificado hasta la mitad del contexto.
- La puerta `decision` no es aplicable, por lo que no hay validacion de respuestas de eleccion, puntuacion o probabilidades.
- El decode a 32k de contexto cae un 18 % frente a llama.cpp y el agregado con 4 flujos un 37 %, lo que penaliza cargas de alta concurrencia.
- La tasa de aceptacion del 56 % corresponde a la puerta `spec`, no a cada fila de rendimiento; el autor advierte que el texto puede aceptar mas o menos que la fila concreta.
- Las comparaciones de velocidad mezclan medicion en cliente (Loom) y en servidor (llama.cpp), lo que limita la precision de las diferencias porcentuales.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El paquete tiene 0 descargas y 0 likes y fue creado el 2026-11-07, por lo que carece de validacion por parte de la comunidad.
- Depende de un runtime joven (hrx-loom 0.1.0) y de una unica plataforma validada (gfx1151); no hay evidencia de funcionamiento en otras GPUs.
- El limite de 4.096 tokens de salida por respuesta puede ser insuficiente para generacion larga.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/InternScience-Sage-A1.5-loom
- Modelo base GGUF: https://huggingface.co/InternScience/Sage-A1.5-Q4_K_M-GGUF
- Modelo base Sage-A1.5: https://huggingface.co/InternScience/Sage-A1.5
- Ficha de Sage-A1.5 en OpenLM.ai: https://openlm.ai/sage-a1.5/
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42376130174
