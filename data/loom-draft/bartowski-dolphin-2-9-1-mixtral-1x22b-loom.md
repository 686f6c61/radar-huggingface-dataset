# loom-draft/bartowski-dolphin-2.9.1-mixtral-1x22b-loom

## Resumen

`loom-draft/bartowski-dolphin-2.9.1-mixtral-1x22b-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom para el checkpoint GGUF `dolphin-2.9.1-mixtral-1x22b-Q4_K_M.gguf` de bartowski. Lo publica el usuario `loom-draft` y su funcion es empaquetar los pesos sin modificar junto con programas `.loom` generados por `loom-next`, de modo que el modelo pueda servirse sobre GPUs AMD concretas mediante el runtime `loom-serve` (paquete `hrx-loom`).

El modelo subyacente es Dolphin 2.9.1 Mixtral 1x22b, un ajuste fino de la familia Dolphin sobre una arquitectura Mixtral de tipo mezcla de expertos con un solo experto activo (de ahi el "1x22b"). Se distribuye cuantizado en Q4_K_M, lo que reduce el peso en disco y en memoria a costa de una ligera perdida de precision frente a los pesos originales en BF16.

Su relevancia es de nicho: no aporta mejoras de calidad respecto al GGUF base, sino que ofrece una via de ejecucion optimizada para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), con API compatible con OpenAI, contexto de 65.536 tokens por peticion y 4 peticiones concurrentes. La model card indica que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral de mezcla de expertos (1 experto activo, "1x22b"); detalles finos no disponibles |
| Parametros totales | no disponible (el nombre comercial indica 22b) |
| Parametros activos | no disponible (variante 1x22b, un experto activo) |
| Longitud de contexto | 65.536 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `weights.loom`, con `model.json`, `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Tool calling | no aplicable segun la model card |
| Modo razonamiento / thinking | no aplicable |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen / audio | no aplicable |
| Muestreo | no determinado |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reutiliza el GGUF `dolphin-2.9.1-mixtral-1x22b-Q4_K_M.gguf` publicado por bartowski, que a su vez es una cuantizacion del checkpoint Dolphin 2.9.1 Mixtral 1x22b. La arquitectura subyacente es de mezcla de expertos con un unico experto activo por token, lo que en la practica se comporta como un transformer denso de aproximadamente 22.000 millones de parametros en cuanto a coste de inferencia, pero con la estructura de enrutamiento propia de Mixtral. No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica del paquete esta en la capa de ejecucion: `loom-next` genera programas `.loom` y kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` los ejecuta con un pool de memoria de tipo `fixed`, precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La model card incluye puertas de correccion (`golden`, `compare`, `consistency`, `sampling`, `logits`, entre otras) que comparan la salida contra llama.cpp sobre el mismo GGUF, pero para este paquete todas aparecen como "not yet re-measured", es decir, sin evidencia registrada.

## Capacidades

- Generacion de texto conversacional multi-turno a traves de una API compatible con OpenAI.
- Contexto de 65.536 tokens por peticion, adecuado para documentos largos o historiales extensos.
- Hasta 4 peticiones concurrentes con salida maxima de 4.096 tokens por respuesta.
- Capacidades propias del modelo Dolphin 2.9.1 Mixtral 1x22b subyacente (generacion, razonamiento y codigo), aunque el paquete no documenta evaluaciones especificas.
- Tool calling: no soportado segun la model card ("not applicable").
- Modo de razonamiento o thinking: no soportado.
- Decodificacion especulativa: no soportada.
- Entrada de imagen o audio: no soportada.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Despliegue en hardware AMD Strix Halo: el paquete permite servir el modelo en un Ryzen AI Max+ 395 mediante `loom-fetch` y `loom-serve`, sin necesidad de convertir pesos ni de recurrir a llama.cpp, gracias a los programas `.loom` pregenerados para gfx1151.
- Inferencia en Radeon AI PRO R9700: el preset `chat-r9700` esta pensado para la GPU gfx1201 de 32 GB, lo que facilita montar un nodo de inferencia dedicado con una sola tarjeta.
- Asistente conversacional local con contexto largo: con 65.536 tokens por peticion se pueden mantener conversaciones extensas o procesar documentos completos sin truncar, usando el endpoint `/v1/chat/completions`.
- Sustitucion directa de un backend OpenAI en prototipos: al exponer una API compatible, cualquier cliente que ya hable con OpenAI puede apuntar a `http://127.0.0.1:8080` cambiando solo la URL base.
- Evaluacion comparativa de runtimes: las puertas de correccion (`golden`, `compare`, `logits`) permiten contrastar token a token la salida de Loom frente a llama.cpp sobre el mismo GGUF, util para validar la fidelidad de la implementacion.
- Procesamiento por lotes moderado en local: con 4 peticiones concurrentes y salida de hasta 4.096 tokens, sirve para tareas de resumen, clasificacion o generacion de texto en pequenos pipelines internos.
- Laboratorio de investigacion en GPUs AMD: util para estudiar el comportamiento de un MoE cuantizado en Q4_K_M sobre ROCm sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion aparecen como "not yet re-measured". No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de throughput/latencia para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el paquete esta pensado para una GPU de 32 GB (Radeon AI PRO R9700) y para la memoria unificada del Ryzen AI Max+ 395. El checkpoint es Q4_K_M, por lo que el peso en disco y en memoria es sustancialmente menor que en BF16, pero no se publica la cifra exacta.
- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs consumer: no se documenta compatibilidad con tarjetas consumer; el paquete esta generado para las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa solo como referencia de correccion).
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card aun no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/bartowski-dolphin-2.9.1-mixtral-1x22b-loom | ~22b (MoE 1x22b) | 65.536 tokens | GGUF empaquetado en `.loom` | Apache 2.0 | Paquete especifico para AMD gfx1151 y gfx1201 |
| bartowski/dolphin-2.9.1-mixtral-1x22b-GGUF | ~22b (MoE 1x22b) | no disponible | GGUF | Apache 2.0 | Checkpoint base sin empaquetar; portable a llama.cpp y otros runtimes |
| Dolphin 2.9.1 Mixtral 1x22b (original) | ~22b (MoE 1x22b) | no disponible | safetensors (previsible) | Apache 2.0 | Pesos originales sin cuantizar; requiere conversion para inferencia local |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no incluye evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".
- No hay mediciones de rendimiento frente a llama.cpp para ninguna de las dos GPUs objetivo.
- El muestreo aparece como "not determined": no esta confirmado que temperatura, top_k y semilla se comporten como en llama.cpp.
- Tool calling, modo de razonamiento, decodificacion especulativa y entrada multimodal no estan soportados.
- Solo se incluye la cuantizacion Q4_K_M; no hay variantes Q5, Q6, Q8 ni BF16 en este paquete.
- El modelo subyacente es un ajuste fino de la familia Dolphin, con los sesgos y el riesgo de alucinacion habituales en modelos de este tipo; no se documentan mitigaciones especificas.
- La licencia es Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del checkpoint base de bartowski y del modelo original.
- El paquete esta atado a versiones concretas del runtime (`hrx-loom==0.2.0`) y a dos arquitecturas AMD; no es portable a CUDA ni a otras GPUs sin regenerar los programas `.loom`.
- La fecha de creacion indicada (2026-11-25) y el hecho de que el paquete tenga 0 descargas y 0 likes sugieren que se trata de una publicacion reciente y sin validacion por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-dolphin-2.9.1-mixtral-1x22b-loom
- Checkpoint base: https://huggingface.co/bartowski/dolphin-2.9.1-mixtral-1x22b-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
