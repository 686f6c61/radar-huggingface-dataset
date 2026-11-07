# loom-fun/XHToken-Spark-X2.5-4B-loom

## Resumen

XHToken-Spark-X2.5-4B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Spark-X2.5-4B-Q4_K_M.gguf` del modelo base XHToken/Spark-X2.5-4B-GGUF. Lo publica el usuario loom-fun y esta pensado para ejecutarse sobre GPUs integradas AMD mediante el runtime hrx-loom, con soporte de decodificacion especulativa por n-gram y una API compatible con OpenAI. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del modelo original, empaquetados junto con los kernels generados para el hardware objetivo.

El modelo base Spark-X2.5-4B, desarrollado por XHToken, es un modelo de lenguaje compacto de proposito general orientado a conversacion, redaccion, traduccion, razonamiento, codigo, uso de herramientas y flujos agenticos. Segun la informacion disponible, emplea una arquitectura de atencion hibrida, soporta una longitud de contexto nativa de hasta 1M de tokens y cubre mas de 200 idiomas. La variante empaquetada aqui esta cuantizada en Q4_K_M.

La relevancia de este paquete es operativa: demuestra como servir un GGUF de 4B en un AMD Ryzen AI Max+ 395 "Strix Halo" con un rendimiento medido superior a llama.cpp (hasta +27 % en decodificacion y +61 % en prefill en las pruebas del autor) y con verificacion de correccion frente a la referencia de llama.cpp en varias puertas de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atencion hibrida (modelo base Spark-X2.5-4B); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 4B (denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion en el servidor Loom; contexto nativo del modelo base de hasta 1M tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado) |
| Idiomas soportados | mas de 200 idiomas (modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Spark-X2.5-4B-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El modelo base Spark-X2.5-4B emplea, segun la informacion disponible, una arquitectura de atencion hibrida con contexto nativo de hasta 1M tokens y cobertura de mas de 200 idiomas. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El modelo pertenece a la serie Spark-X2.5, que incluye tambien una variante de 1,7B.

El paquete Loom no modifica los pesos: genera kernels especificos para el hardware (gfx1151, Strix Halo) y los integra con un runtime de inferencia que implementa decodificacion especulativa mediante n-gram prompt lookup con profundidad 2, activada por defecto. El servidor expone una API estilo OpenAI y aplica plantillas de chat con modo de razonamiento activable. La validacion de correccion incluye comparacion token a token contra llama.cpp sobre el mismo GGUF, pruebas de kernel (43/43 superadas), consistencia bajo concurrencia, equivalencia con y sin decodificacion especulativa, y pruebas de aguja en pajar hasta la mitad del contexto.

## Capacidades

- Generacion de texto para conversacion, redaccion, traduccion, razonamiento, codigo y matematicas (capacidades declaradas del modelo base).
- Soporte de tool calling estilo OpenAI (`tools` y `tool_calls`).
- Modo de razonamiento o thinking activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Flujos agenticos multi-turno con reutilizacion de historial y renderizado exacto de plantillas (validado en la puerta `agent`).
- Decodificacion especulativa n-gram con profundidad 2, activada por defecto.
- Multilingue: mas de 200 idiomas segun el modelo base.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Sin soporte de entrada de imagen ni de audio.
- Sin soporte de ajuste de esfuerzo de razonamiento (reasoning effort).

## Casos de uso

- Servicio local de chat sobre hardware AMD integrado: el paquete se sirve con `loom-serve` en un Ryzen AI Max+ 395 y responde a peticiones `/v1/chat/completions`, adecuado para prototipos y asistentes en estacion de trabajo sin GPU dedicada.
- Asistentes con tool calling: la puerta `agent` valida llamadas a herramientas con historial multi-turno, por lo que puede integrarse en automatizaciones que consulten APIs externas o ejecuten funciones del sistema.
- Procesamiento de documentos largos: con 262.144 tokens por peticion en el servidor y prefill medido de 2.184,8 tok/s en documentos de 1k, es viable resumir o extraer informacion de contratos, informes o transcripciones extensas.
- Traduccion multilingue: la cobertura de mas de 200 idiomas del modelo base permite usarlo como motor de traduccion en pipelines internos, con la API compatible con OpenAI como interfaz.
- Generacion de codigo asistida: el modelo base declara capacidades de codigo y el servidor soporta plantillas de chat y tool calling, lo que permite integrarlo en editores o scripts de automatizacion.
- Evaluacion comparativa de motores de inferencia: el paquete incluye metricas y puertas de correccion frente a llama.cpp, util para equipos que quieran medir el rendimiento de Loom en su propio hardware Strix Halo.
- Despliegue con concurrencia moderada: con 4 peticiones concurrentes y 166,4 tok/s agregados en decodificacion, sirve para equipos pequenos o entornos de desarrollo compartidos.

## Benchmarks y rendimiento

Rendimiento medido por el autor sobre AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0, el 2026-11-07, comparando Loom frente a llama.cpp con el mismo GGUF:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 55,0 | 68,1 | +24 % | 90,6 | 75 % |
| Decodificacion tok/s, contexto 2k | 49,3 | 62,4 | +27 % | 87,3 | 71 % |
| Decodificacion tok/s, contexto 32k | no medido | 41,0 | no disponible | 60,2 | 68 % |
| Prefill tok/s, documento 1k | 1.363,0 | 2.184,8 | +60 % | 7.518,2 | 29 % |
| Prefill tok/s, documento 2k | 1.359,3 | 2.189,9 | +61 % | 7.443,3 | 29 % |
| Prefill tok/s, documento 8k | no medido | 2.055,8 | no disponible | 7.049,8 | 29 % |
| Prefill tok/s, documento 16k | no medido | 1.896,1 | no disponible | 6.585,7 | 29 % |
| Prefill tok/s, documento 32k | no medido | 1.492,4 | no disponible | 5.819,4 | 26 % |
| 4 streams, decodificacion agregada tok/s | 152,6 | 166,4 | +9 % | 374,1 | 44 % |
| Decodificacion especulativa, tokens aceptados | no aplica | 13 % | no disponible | no aplica | no aplica |

Notas del autor: llama.cpp con build `llamacpp-rocm/b1370` y argumentos `-ngl 99 -cram 0 -c 35024 -kvu -np 4`; Loom con decodificacion especulativa n-gram de profundidad 2; tiempos del lado del cliente en Loom y del servidor en llama.cpp; roofline calculado a 216 GB/s y 59 TFLOP/s para gfx1151. La tasa de aceptacion del draft varian por sesion (4 % en decodificacion, 5 % a 2k, 3 % a 32k, 13 % en la puerta `spec`).

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el ejemplo de arranque usa `--memory_bytes=55000000000` (55 GB) en un sistema con memoria unificada AMD.
- GPU objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, "Strix Halo"); el paquete se genero y valido en ese hardware.
- Cabe en GPU consumer: si, en el sentido de que el hardware de referencia es un APU integrado; no se documenta compatibilidad con GPUs NVIDIA o AMD discretas.
- Opciones de despliegue: `loom-serve` mediante `hrx-loom` (instalacion con `pip install "hrx-loom[hf]"`); el GGUF original puede servirse con llama.cpp, pero las ventajas de rendimiento medidas corresponden a Loom.
- Latencia y throughput: 68,1 tok/s de decodificacion con prompt corto y 2.184,8 tok/s de prefill en documento de 1k en el hardware de referencia; 166,4 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XHToken-Spark-X2.5-4B-loom | 4B | 262.144 tokens por peticion en Loom (1M nativo en el base) | Apache 2.0 | Hugging Face, paquete Loom | Optimizado para Strix Halo con decodificacion especulativa |
| XHToken/Spark-X2.5-4B-GGUF (base) | 4B | 1M nativo | Apache 2.0 | Hugging Face | Mismo checkpoint sin empaquetar; ejecutable con llama.cpp y otros motores |
| Spark-X2.5-1.7B | 1,7B | no disponible | no disponible | GitHub y Hugging Face (serie Spark-X2.5) | Variante mas pequena de la misma familia |

No se dispone de datos de rendimiento de calidad comparables con otros modelos de 4B en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete esta validado unicamente en AMD Ryzen AI Max+ 395 "Strix Halo" con Ubuntu 24.04 y hrx-loom 0.1.0; no hay evidencia de funcionamiento en otras GPUs o plataformas.
- La puerta `needle_full` (aguja en pajar con el contexto completo) no tiene evidencia registrada; el modelo solo ha superado la prueba hasta la mitad del contexto.
- La tasa de aceptacion de la decodificacion especulativa es baja (3-13 % segun la sesion), lo que limita la ganancia real del mecanismo.
- El limite de tokens de salida es de 4.096 por peticion (preset `max_tokens`), muy inferior al contexto de entrada.
- No soporta entrada de imagen ni audio, ni ajuste de esfuerzo de razonamiento.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; no hay evidencia independiente del rendimiento del modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; aplican las limitaciones habituales de un modelo de 4B.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Paquete Loom en Hugging Face: https://huggingface.co/loom-fun/XHToken-Spark-X2.5-4B-loom
- Modelo base GGUF: https://huggingface.co/XHToken/Spark-X2.5-4B-GGUF
- Repositorio del modelo base: https://github.com/XHToken/Spark-X2.5/tree/main/
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de validacion (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/42385292114
