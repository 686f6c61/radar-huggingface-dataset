# loom-fun-staging/unsloth-Qwen3-4B-Instruct-2507-loom

## Resumen

`loom-fun-staging/unsloth-Qwen3-4B-Instruct-2507-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3-4B-Instruct-2507-GGUF`, concretamente el fichero `Qwen3-4B-Instruct-2507-Q4_K_M.gguf`. El autor es la organizacion `loom-fun-staging`, que lo publica dentro del ecosistema Loom (herramientas `hrx-loom`, `loom-skills`, `loom-serve`) orientado a servir modelos en GPUs AMD.

El proposito del paquete es permitir la inferencia del modelo Qwen3-4B-Instruct-2507 cuantizado a Q4_K_M sobre hardware AMD especifico: el APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El servidor `loom-serve` expone una API compatible con OpenAI en `127.0.0.1:8080` mediante el endpoint `/v1/chat/completions`, con soporte de tool calling, concurrencia de 4 peticiones y contexto nativo de 262.144 tokens.

La relevancia es acotada: se trata de un artefacto de empaquetado y optimizacion de kernels para ROCm, no de un modelo nuevo. El modelo subyacente es Qwen3-4B-Instruct-2507, de la familia Qwen3 de Alibaba, en su variante instruct de julio de 2025. La ficha se centra en lo que documenta el autor; los datos sobre el modelo base que no aparecen en la informacion proporcionada se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-4B-Instruct-2507; transformer, segun la familia Qwen3) |
| Parametros totales | no disponible (el nombre indica 4B; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens por peticion; hasta 199.680 en Radeon AI PRO R9700 por limite de memoria |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Qwen3-4B-Instruct-2507-Q4_K_M.gguf) empaquetado como Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre la arquitectura ni el entrenamiento del modelo subyentemente: la model card solo describe el empaquetado y el rendimiento del runtime. El checkpoint de origen es `unsloth/Qwen3-4B-Instruct-2507-GGUF`, una conversion a GGUF del modelo Qwen3-4B-Instruct-2507, que se distribuye sin modificaciones («unmodified GGUF checkpoint»). No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica del paquete reside en el runtime Loom: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, servidor con API compatible con OpenAI, decodificacion especulativa disponible pero desactivada (mecanismo `dflash`), y limites de memoria configurables mediante `--memory_bytes`. La model card incluye una comparativa frente a llama.cpp ROCm con metricas de roofline (techo teorico de hardware) para Strix Halo a 216 GB/s y 59 TFLOP/s, aunque las columnas de rendimiento medido de llama.cpp y Loom aparecen sin valores en la informacion disponible.

## Capacidades

- Generacion de texto conversacional mediante `/v1/chat/completions` con formato OpenAI.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Concurrencia de hasta 4 peticiones simultaneas.
- Contexto de 262.144 tokens por peticion (199.680 en Radeon AI PRO R9700 por limite de memoria).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Limite de salida preconfigurado de 4.096 tokens (`max_tokens`).
- Decodificacion especulativa disponible en el runtime, desactivada por defecto.
- Sin modo de razonamiento/thinking (marcado como «not applicable»).
- Sin entrada de imagen ni audio (marcado como «not applicable»).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con APU Strix Halo: el paquete se sirve con `loom-serve` y ofrece una API compatible con OpenAI, de modo que cualquier cliente que hable ese protocolo puede conectarse sin adaptadores.
- Automatizacion de agentes con tool calling: el soporte de `tools`/`tool_calls` y la puerta de validacion `agent` (bucle multiturno de llamadas a herramientas) lo hacen apto para flujos de agente que consultan APIs externas.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, permite resumir o extraer informacion de documentos extensos en una sola peticion, dentro de los limites de memoria del dispositivo.
- Despliegue en GPU de escritorio AMD Radeon AI PRO R9700: el paquete esta calibrado para 32 GB de VRAM con `--memory_bytes=34000000000`, lo que permite servir el modelo en una estacion con esa GPU profesional.
- Evaluacion y desarrollo de runtimes alternativos: util para comparar el rendimiento de Loom frente a llama.cpp ROCm con el mismo GGUF y las mismas peticiones, segun la metodologia descrita en la model card.
- Servicio de chat con concurrencia moderada: 4 peticiones concurrentes con salida de hasta 4.096 tokens cubren escenarios de equipo pequeno o prototipos internos.
- Pruebas de integracion continua de kernels: las puertas `kernel_tests`, `golden`, `compare` y `consistency` permiten validar la correccion numerica del runtime frente a la referencia de llama.cpp.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a llama.cpp ROCm para Strix Halo (gfx1151), pero las columnas de valores medidos de llama.cpp y Loom aparecen vacias («—») en la informacion disponible; solo se publican los valores de roofline (techo teorico de hardware):

| Metrica | Roofline (techo) | llama.cpp | Loom |
|---|---|---|---|
| Decode tok/s, prompt corto | 86,7 | no disponible | no disponible |
| Decode tok/s, contexto 2k | 77,5 | no disponible | no disponible |
| Decode tok/s, contexto 32k | 30,0 | no disponible | no disponible |
| Prefill tok/s, documento 1k | 7.802,6 | no disponible | no disponible |
| Prefill tok/s, documento 2k | 7.509,7 | no disponible | no disponible |
| Prefill tok/s, documento 8k | 6.129,3 | no disponible | no disponible |
| Prefill tok/s, documento 16k | 4.922,7 | no disponible | no disponible |
| Prefill tok/s, documento 32k | 3.532,1 | no disponible | no disponible |
| 4 streams, decode agregado tok/s | 303,7 | no disponible | no disponible |
| Decodificacion especulativa, tokens aceptados | no aplica | no aplica | no aplica |

Para Radeon AI PRO R9700 (gfx1201, 32 GB), la model card indica explicitamente que los resultados «no se han vuelto a medir todavia». No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151): comando de servicio con `--memory_bytes=55000000000`.
- GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB): comando de servicio con `--memory_bytes=34000000000`; contexto maximo por peticion limitado a 199.680 tokens.
- VRAM estimada: no disponible de forma explicita; el paquete Q4_K_M de un modelo de 4B se sirve en el presupuesto de memoria indicado por el autor (55 GB en Strix Halo como pool compartido, 34 GB en R9700).
- GPU consumer: no se documenta compatibilidad con GPUs consumer NVIDIA o AMD distintas de las dos plataformas citadas; el paquete esta generado para gfx1151 y gfx1201.
- Opciones de despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.1.0`, con `loom-fetch` para materializar la tarjeta `model.json`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: solo se publican los valores de roofline recogidos en la tabla anterior; no hay mediciones reales de Loom ni de llama.cpp en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| unsloth-Qwen3-4B-Instruct-2507-loom (este paquete) | no disponible (nombre indica 4B) | 262.144 (199.680 en R9700) | GGUF Q4_K_M empaquetado Loom | no disponible | Paquete de despliegue para AMD Strix Halo y R9700 |
| unsloth/Qwen3-4B-Instruct-2507-GGUF (modelo base) | no disponible (nombre indica 4B) | no disponible | GGUF | no disponible | Checkpoint de origen sin modificar; sirve como referencia de correccion en las puertas `golden` y `compare` |
| llama.cpp ROCm (runtime) | no aplica | no disponible | GGUF | no disponible | Runtime de referencia usado en la comparativa de rendimiento de la model card |

No se dispone de datos de benchmarks de calidad para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion disponible es exclusivamente de runtime (Loom frente a llama.cpp ROCm) y, como se ha indicado, sin valores medidos publicados.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: cualquier limitacion del modelo Qwen3-4B-Instruct-2507 subyacente se hereda sin cambios, y la model card no las documenta.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`) no se han vuelto a ejecutar sobre este paquete: el ultimo pase corresponde a una compilacion anterior (sha256 `359a9b1`) y se delega su reejecucion a las puertas nocturnas.
- En Radeon AI PRO R9700 no se han vuelto a medir ni el rendimiento ni la correccion.
- La comparativa de rendimiento frente a llama.cpp carece de valores medidos y de los argumentos del servidor de llama.cpp («not recorded»), por lo que no es reproducible tal cual.
- El contexto maximo por peticion en R9700 queda reducido a 199.680 tokens por el limite de memoria del dispositivo.
- La decodificacion especulativa esta disponible pero desactivada; no hay drafter publicado para este modelo exacto ni cabeza MTP en el GGUF.
- La licencia no esta declarada en la informacion proporcionada: no puede confirmarse el uso comercial sin consultar el modelo base y sus terminos.
- El paquete esta acotado a dos plataformas AMD concretas (gfx1151 y gfx1201); no se documenta portabilidad a otras GPUs.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; aplican los del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de staging sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-fun-staging/unsloth-Qwen3-4B-Instruct-2507-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
