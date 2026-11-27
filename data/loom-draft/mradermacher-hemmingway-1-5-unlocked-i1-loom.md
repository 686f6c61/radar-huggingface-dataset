# loom-draft/mradermacher-Hemmingway-1.5-Unlocked-i1-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje en sentido estricto, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `mradermacher/Hemmingway-1.5-Unlocked-i1-GGUF`, en su cuantizacion Q4_K_M (`Hemmingway-1.5-Unlocked.i1-Q4_K_M.gguf`). Lo publica el usuario `loom-draft` y esta orientado exclusivamente a dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que resuelve es el de servir ese GGUF concreto sobre el runtime Loom (parte del ecosistema hrx-system de ROCm) con un preset ya ajustado, evitando al usuario tener que configurar el motor. La tarjeta documenta dos presets (`chat` y `chat-r9700`) y ofrece mediciones comparativas frente a llama.cpp ROCm en Strix Halo, con mejoras de entre el 9 % y el 59 % segun la metrica. El modelo subyacente es un fine-tune no oficial de Hemmingway-1.5, del que esta ficha no dispone de datos de arquitectura, parametros ni contexto, ya que la informacion proporcionada solo cubre el empaquetado.

La relevancia actual es acotada: el repositorio tiene 0 descargas y 0 likes, y su interes es fundamentalmente practico para quien ya opere hardware AMD Strix Halo o R9700 y quiera evaluar Loom como alternativa a llama.cpp. No aporta pesos nuevos ni un modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo subyacente es un GGUF de Hemmingway-1.5-Unlocked-i1; la arquitectura no se detalla en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la configuracion de referencia de llama.cpp usa `-c 65536`, pero no se confirma como contexto nativo del modelo) |
| Tipos de cuantizacion | Q4_K_M (unico quant empaquetado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programas `.loom` y tarjeta `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base (transformer, MoE, hibrido u otra), ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre si hubo RLHF, DPO u otras etapas de alineamiento. La tarjeta del repositorio solo describe el empaquetado: un GGUF Q4_K_M sin modificar, procesado por `loom-next` sin intervencion de un LLM en el bucle de generacion.

La innovacion tecnica destacable no esta en el modelo sino en el runtime: Loom sirve el checkpoint con decodificacion especulativa basada en MTP (multi-token prediction) con profundidad de borrador 3, y permite opciones de servicio como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (reserva del pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). El preset incluye ademas un conjunto objetivo de decodificacion especulativa (`loom-target-set`). No hay datos sobre el proceso de entrenamiento del modelo subyacente.

## Capacidades

- Generacion de texto conversacional mediante una API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento opcional, controlable por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Decodificacion especulativa con MTP integrada en el preset de servicio.
- Servicio multi-stream: la tarjeta reporta mediciones agregadas con 4 peticiones paralelas.
- Procesamiento de prompts largos: se miden prefills de hasta 32k tokens.
- El resto de capacidades del modelo subyentente (codigo, matematicas, tool calling, agentes, multilingue, vision, audio) no estan documentadas en la informacion disponible.

## Casos de uso

- Evaluacion de Loom frente a llama.cpp en Strix Halo: el paquete incluye mediciones reproducibles (decode, prefill, 4 streams) con la misma semilla de comparacion, lo que permite validar el runtime en un banco propio antes de adoptarlo.
- Servicio local de chat sobre una APU Strix Halo: con `loom-serve` y el preset `chat` se levanta un endpoint compatible con OpenAI en `127.0.0.1:8080`, adecuado para prototipos en estacion de trabajo sin GPU dedicada.
- Despliegue en Radeon AI PRO R9700: el preset `chat-r9700` esta ajustado a los 32 GB de esa GPU, lo que facilita servir el modelo en un nodo de inferencia AMD sin configuracion manual del motor.
- Procesamiento de documentos de hasta 32k tokens: las tasas de prefill medidas (477-555 tok/s en Strix Halo) hacen viable resumir o extraer informacion de documentos largos en local.
- Atencion multiusuario ligera: con 4 streams agregados a 48,1 tok/s en Strix Halo, el preset sirve para un pequeno equipo interno con cargas conversacionales moderadas.
- Referencia de reproducibilidad para CI: las instrucciones de `loom-fetch` con `--materialize=copy` y la semilla de medicion (run 45881061161 de DevLab Dispatch) permiten integrar una comprobacion de rendimiento en pipelines internos.
- Comparativa de motores en hardware AMD: util para decidir entre Loom y llama.cpp ROCm en funcion de la mezcla de carga (decode corto, contexto largo o concurrencia).

## Benchmarks y rendimiento

Rendimiento de servicio en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Loom 0.2.0 frente a llama.cpp ROCm b1374, mismo GGUF y mismos prompts, mediana de 3 sesiones:

| Metrica | llama.cpp (tok/s) | Loom (tok/s) | Margen |
|---|---|---|---|
| Decode, prompt corto | 30,8 | 36,9 | +20 % |
| Decode, contexto 2k | 31,7 | 36,6 | +15 % |
| Decode, contexto 32k | 27,9 | 30,4 | +9 % |
| Prefill, documento 1k | 342,1 | 542,3 | +59 % |
| Prefill, documento 2k | 350,8 | 548,0 | +56 % |
| Prefill, documento 8k | 351,1 | 555,4 | +58 % |
| Prefill, documento 16k | 333,6 | 527,4 | +58 % |
| Prefill, documento 32k | 300,3 | 477,1 | +59 % |
| 4 streams, decode agregado | 39,1 | 48,1 | +23 % |

No se publican resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La fila de tokens aceptados en decodificacion especulativa figura como no medida, y el calculo de roofline no se realizo.

## Requisitos de hardware

- Hardware soportado de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU.
- VRAM estimada: no disponible; depende del tamano del modelo subyacente, que no se documenta. El quant empaquetado es Q4_K_M.
- GPU consumer: no se confirma compatibilidad con RTX 4090 ni con GPU NVIDIA en general; el paquete esta orientado a AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Throughput medido en Strix Halo: 36,9 tok/s en decode corto, 30,4 tok/s a 32k de contexto, 477-555 tok/s en prefill y 48,1 tok/s agregados con 4 streams.
- Latencia: no se publican valores de latencia por peticion (TTFT u otros); solo tokens por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica el tamano ni la familia del modelo subyacente, por lo que no es posible establecer una comparacion con alternativas de la misma categoria. Como referencia de motor, la unica comparacion documentada es frente a llama.cpp ROCm b1374 sobre el mismo GGUF y hardware (ver tabla de benchmarks).

## Limitaciones y advertencias

- El repositorio no contiene un modelo original: es un empaquetado de despliegue de un GGUF de terceros. Cualquier limitacion del modelo base (sesgos, alucinacion, cobertura idiomatica) se hereda sin que esta tarjeta la documente.
- Ausencia total de datos de arquitectura, parametros, contexto nativo e idiomas: no es posible dimensionar el modelo ni evaluar su calidad a partir de esta informacion.
- Compatibilidad restringida a dos aceleradores AMD concretos; no hay garantia de funcionamiento en otras GPU, incluido hardware NVIDIA.
- Solo se distribuye Q4_K_M; no hay variantes de mayor o menor precision en este repositorio.
- Las cifras de rendimiento provienen de runners de AMD DevLab que difieren entre sesiones y de una unica fecha de medicion (2026-11-26); no deben tomarse como garantia en otro hardware.
- El margen frente a llama.cpp se calcula contra la mejor implementacion medida (ROCm o Vulkan) y no incluye barrido de ajustes en ninguno de los dos motores.
- El repositorio tiene 0 descargas y 0 likes, y el campo de pipeline figura como no disponible: no hay validacion de la comunidad.
- La licencia MIT se declara en la tarjeta, pero conviene verificar la licencia del modelo base antes de un uso comercial, ya que este repositorio solo empaqueta los pesos de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Hemmingway-1.5-Unlocked-i1-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/Hemmingway-1.5-Unlocked-i1-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Run de medicion en DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/45881061161
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
