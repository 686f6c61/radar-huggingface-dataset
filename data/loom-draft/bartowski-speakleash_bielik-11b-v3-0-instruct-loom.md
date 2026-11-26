# loom-draft/bartowski-speakleash_Bielik-11B-v3.0-Instruct-loom

## Resumen

`loom-draft/bartowski-speakleash_Bielik-11B-v3.0-Instruct-loom` es un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/speakleash_Bielik-11B-v3.0-Instruct-GGUF`, en su variante `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de empaquetado para ejecutar el modelo Bielik-11B-v3.0-Instruct de SpeakLeash sobre GPUs AMD concretas mediante el runtime `loom-serve` del ecosistema HRX/Loom. El autor del paquete es `loom-draft` y la generacion se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el proceso.

El modelo subyacente, Bielik-11B-v3.0-Instruct, es un modelo de lenguaje de 11 mil millones de parametros orientado a instrucciones y optimizado para polaco e ingles, desarrollado por SpeakLeash. Este paquete Loom preserva los pesos originales y anade programas de kernel generados especificamente para dos destinos de hardware: el APU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de este artefacto es de infraestructura, no de modelado: demuestra un flujo de publicacion de modelos GGUF empaquetados para aceleracion AMD via ROCm, con API compatible con OpenAI (`/v1/chat/completions`), soporte de concurrencia y una bateria de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, entre otras) que, en esta version, aun no tienen mediciones registradas. La ficha siguiente describe el paquete y, cuando la informacion lo permite, el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Bielik-11B-v3.0-Instruct); el paquete Loom contiene programas de kernel generados para gfx1151 y gfx1201 |
| Parametros totales | 11B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens por peticion (preset del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (unica variante empaquetada) |
| Idiomas soportados | no disponible en la informacion del paquete; el modelo base Bielik esta orientado a polaco e ingles |
| Licencia | MIT |
| Formato de pesos | GGUF (`speakleash_Bielik-11B-v3.0-Instruct-Q4_K_M.gguf`) empaquetado como programas `.loom` + `weights.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Estilo OpenAI `/v1/chat/completions` |
| Herramientas de generacion | `loom-next` (generador, sin LLM en el bucle) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base. Lo que si documenta es la capa de despliegue: un conjunto de programas `.loom` y un fichero `weights.loom` generados por `loom-next` para ejecutar el GGUF Q4_K_M original sobre dos arquitecturas AMD. El flujo de uso fija el pool de memoria por adelantado (`--pool_backing=fixed`), precarga los pesos en host (`--parameter_mode=preload`) y activa espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), ajuste con el que se midieron las cifras de rendimiento de la tarjeta.

La correccion se valida mediante puertas de `loom-benchmark` (`gates.sh`): tests unitarios de kernels frente a referencias, comparacion token a token contra llama.cpp sobre el mismo GGUF (tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k), consistencia bajo concurrencia, equivalencia de decodificacion especulativa, bucle de tool calling multi-turno y comprobacion de muestreo y logits. En esta publicacion todas las puertas figuran como "not yet re-measured", es decir, sin evidencia registrada. Las funciones de tool calling, razonamiento, decodificacion especulativa, entrada de imagen y audio se marcan como "not applicable" en el paquete.

## Capacidades

- Generacion de texto conversacional e instrucciones mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por peticion, adecuado para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de 4 peticiones simultaneas con salida maxima de 4.096 tokens por peticion.
- Capacidades multilingues del modelo base Bielik (polaco e ingles como idiomas principales); el paquete no declara una lista de idiomas propia.
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Razonamiento o modo thinking: no aplicable segun el paquete.
- Decodificacion especulativa: no aplicable segun el paquete.
- Entrada de imagen o audio: no aplicable segun el paquete.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la documentacion del paquete.

## Casos de uso

- Despliegue de inferencia en estaciones de trabajo AMD: ejecutar Bielik-11B-Instruct en un Ryzen AI Max+ 395 o en una Radeon AI PRO R9700 usando `loom-serve`, sin depender de CUDA ni de llama.cpp como backend.
- Servicio interno de asistencia en polaco e ingles: el modelo base esta orientado a estos idiomas y el paquete expone una API compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes cambiando solo la URL base.
- Procesamiento de documentos largos: con 32.768 tokens de contexto por peticion se pueden resumir o extraer informacion de contratos, informes o transcripciones de varias decenas de paginas en una sola llamada.
- Evaluacion de la cadena de herramientas Loom: comparar la salida del paquete contra llama.cpp sobre el mismo GGUF usando las puertas `golden` y `compare`, util para equipos que validan kernels generados para ROCm.
- Prototipado de chatbots multi-turno: la concurrencia de 4 peticiones y el limite de 4.096 tokens de salida permiten servir una demo interna o un entorno de pruebas con varios usuarios.
- Reproducibilidad de despliegues: `model.json.lock` fija los ficheros origen con verificacion sha256 en `loom-fetch`, lo que facilita reconstruir exactamente el mismo entorno en otra maquina con hardware AMD compatible.
- Banco de pruebas de cuantizacion Q4_K_M: medir calidad y latencia de una cuantizacion de 4 bits de un modelo de 11B en GPUs de consumo profesional frente a alternativas en otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion figuran sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, un GGUF Q4_K_M de un modelo de 11B ocupa aproximadamente 6-7 GB de pesos; a ello hay que sumar el pool de memoria fijado por `--pool_backing=fixed` y el espacio para KV cache de hasta 32.768 tokens, cuyo tamano exacto no se documenta.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs consumer: no se documenta compatibilidad con GPUs de consumo; los destinos soportados por el paquete son los dos anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto; llama.cpp aparece unicamente como referencia de correccion.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| bartowski/speakleash_Bielik-11B-v3.0-Instruct-GGUF (Q4_K_M) | 11B | no disponible en la informacion | GGUF | MIT (segun el paquete derivado) | Checkpoint GGUF generico para llama.cpp y runtimes compatibles |
| loom-draft/bartowski-speakleash_Bielik-11B-v3.0-Instruct-loom (este paquete) | 11B | 32.768 tokens por peticion | `.loom` + `weights.loom` + `model.json` | MIT | Empaquetado para `loom-serve` en gfx1151 y gfx1201 |
| Alternativas de 11B en GGUF para AMD | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, por lo que la comparativa se limita a formato, licencia y destino de hardware.

## Limitaciones y advertencias

- El paquete no aporta evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay validacion publicada frente a llama.cpp en esta version.
- El estado del muestreo (temperature, top_k, seed) esta marcado como "no determinado"; el comportamiento de la distribucion del primer token no esta verificado.
- No soporta tool calling, modo thinking, decodificacion especulativa ni entrada de imagen o audio segun la tabla de caracteristicas del paquete.
- Solo se empaqueta la cuantizacion Q4_K_M; no hay variantes Q5, Q6, Q8 ni FP16 en este paquete.
- El contexto esta limitado a 32.768 tokens por peticion y la salida a 4.096 tokens; no se documenta gestion de contexto mas alla de ese limite.
- La concurrencia maxima es de 4 peticiones simultaneas, insuficiente para cargas de produccion con muchos usuarios concurrentes.
- Compatibilidad restringida a dos destinos AMD (gfx1151 y gfx1201); no se declara soporte para GPUs NVIDIA ni para otras arquitecturas AMD.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion disponible. El modelo base Bielik esta orientado a polaco e ingles, por lo que el rendimiento en castellano no esta verificado.
- La licencia MIT se declara en el paquete; conviene verificar las condiciones del checkpoint base antes de un uso comercial.
- La fecha de creacion del repositorio (2026-11-26) y el estado "draft" del autor sugieren que se trata de un artefacto en fase temprana, sin descargas ni valoraciones.

## Enlaces

- Paquete Loom: https://huggingface.co/loom-draft/bartowski-speakleash_Bielik-11B-v3.0-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/speakleash_Bielik-11B-v3.0-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
