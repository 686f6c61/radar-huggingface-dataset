# loom-draft/unsloth-Mistral-Nemo-Instruct-2407-loom

## Resumen

`loom-draft/unsloth-Mistral-Nemo-Instruct-2407-loom` es un paquete de despliegue para la plataforma Loom (ecosistema de inferencia sobre GPUs AMD) que empaqueta el checkpoint GGUF `Mistral-Nemo-Instruct-2407.Q4_K_M.gguf` de Unsloth, derivado a su vez de Mistral Nemo Instruct 2407. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original sin modificar, y lo que aporta el repositorio es un conjunto de programas `.loom`, un `model.json` y un tokenizador que permiten servir el modelo mediante `loom-serve` con una API compatible con OpenAI (`/v1/chat/completions`).

El interes tecnico esta en el target de hardware: el paquete esta generado especificamente para dos aceleradores AMD, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM), usando el generador `loom-next` sin intervencion de un LLM en el bucle. Esto lo convierte en una alternativa a llama.cpp para entornos con GPU AMD, con la promesa de kernels generados a medida para esas arquitecturas.

La relevancia es acotada pero clara: cubre el hueco de despliegue de Mistral Nemo (12B, contexto de 128k en el modelo base) en hardware AMD consumer y de estacion de trabajo, con contexto anunciado de 262.144 tokens por peticion y 4 peticiones concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured", por lo que debe tratarse como un artefacto en fase temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Nemo), empaquetado como programas Loom sobre GGUF |
| Parametros totales | 12B (segun el modelo base Mistral Nemo Instruct 2407) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 262.144 tokens por peticion (preset Loom); el modelo base soporta 128k de forma nativa |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion del repositorio |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en programas `.loom` + `weights.loom`, con `tokenizer.json`, `llm_config.json` y `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral Nemo Instruct 2407, un transformer decoder-only de 12B parametros desarrollado por Mistral AI en colaboracion con NVIDIA, afinado para instrucciones. El repositorio no entrena ni modifica nada: parte del GGUF cuantizado Q4_K_M publicado por Unsloth y genera, mediante `loom-next`, kernels y programas de ejecucion especificos para gfx1151 (Strix Halo) y gfx1201 (R9700). El autor declara explicitamente que la generacion se hizo "with the generator alone, no LLM in the loop".

No hay informacion en la model card sobre el dataset de entrenamiento, el numero de tokens, ni sobre fases de RLHF o DPO del modelo base; esos datos corresponden a la ficha oficial de Mistral Nemo y no se reproducen aqui. La innovacion del paquete es de despliegue, no de modelado: kernels generados por arquitectura, pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de completions de GPU (`completion_spin_ns=4294967295`), que la propia card advierte que consume CPU mientras hay trabajo en vuelo.

## Capacidades

- Generacion de texto conversacional e instrucciones, heredadas del checkpoint Mistral Nemo Instruct 2407.
- API compatible con OpenAI en `/v1/chat/completions`, con el identificador de modelo `mistral-nemo-instruct-2407`.
- Contexto de 262.144 tokens por peticion segun el preset Loom, muy por encima de los 128k nativos del modelo base.
- Concurrencia de 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Razonamiento o modo thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen y entrada/salida de audio: sin determinar ("?") en la card.
- Muestreo (temperature, top_k, seed): sin determinar en la card.

## Casos de uso

- Despliegue de un asistente conversacional en estaciones de trabajo con Radeon AI PRO R9700: el paquete se sirve con `loom-serve` y expone un endpoint compatible con OpenAI, de modo que cualquier cliente que hable el protocolo de chat completions puede conectarse sin adaptadores.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto por peticion se pueden pasar contratos, expedientes o bases de codigo extensas en una sola llamada, util en entornos donde no se permite enviar datos a la nube.
- Prototipado en Ryzen AI Max+ 395 "Strix Halo": al ser un equipo integrado, permite montar un servidor de inferencia de 12B en una maquina compacta con el preset `chat` ya generado para gfx1151.
- Evaluacion comparativa frente a llama.cpp: la card define puertas de correccion (`golden`, `compare`, `consistency`, `sampling`, `logits`) que permiten verificar token a token que la salida coincide con la referencia de llama.cpp sobre el mismo GGUF.
- Servicio interno de 4 hilos concurrentes: el preset admite 4 peticiones simultaneas, adecuado para un equipo pequeno que consulte el modelo a traves de una interfaz web interna.
- Integracion en pipelines de CI para pruebas de regresion de inferencia: los ficheros `model.json.lock` con sha256 permiten fijar la version exacta de pesos y programas, y `loom-fetch` verifica la integridad en cada despliegue.
- Generacion de codigo y texto tecnico en local: el modelo base esta afinado para instrucciones y cubre tareas de programacion y redaccion, aunque el paquete no anuncia tool calling ni modo thinking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 12B, lo que situa los pesos en torno a 7-8 GB; a eso hay que sumar el pool de memoria del preset Loom, la cache KV para contexto largo y el margen de trabajo. No hay cifras oficiales de consumo total en la card.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU consumer AMD de gama alta con memoria suficiente; no se confirma compatibilidad con GPUs NVIDIA ni con otras arquitecturas AMD distintas de gfx1151 y gfx1201.
- Despliegue mediante `hrx-loom[hf]==0.2.0` (instalable con pipx), `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; llama.cpp aparece solo como referencia de correccion.
- Opciones de servicio relevantes: `--pool_backing=fixed` (reserva el pool por adelantado), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa, consume CPU).
- Latencia y throughput: no disponibles; las mediciones estan pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Mistral Nemo Instruct 2407 Q4_K_M para Loom) | 12B | 262.144 tokens por peticion (preset) | GGUF empaquetado en `.loom`, `loom-serve` | MIT | Solo targets AMD gfx1151 y gfx1201; sin benchmarks publicados |
| unsloth/Mistral-Nemo-Instruct-2407-GGUF | 12B | 128k (modelo base) | GGUF para llama.cpp y derivados | MIT (heredada) | Checkpoint de origen, sin empaquetado Loom |
| Mistral Nemo Instruct 2407 (original) | 12B | 128k | safetensors, transformers y otros runtimes | Mistral Nemo no comercial / Apache 2.0 segun la ficha oficial | Referencia de capacidades del modelo subyacente |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Artefacto en fase temprana: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin mediciones de rendimiento ni de correccion registradas.
- Compatibilidad restringida: el paquete esta generado solo para gfx1151 y gfx1201; no hay evidencia de funcionamiento en otras GPUs AMD ni en NVIDIA.
- La card marca tool calling, razonamiento y decodificacion especulativa como "not applicable"; no conviene disenar agentes sobre este preset.
- Entrada de imagen, audio y comportamiento del muestreo figuran como "not determined", por lo que no deben asumirse.
- El limite de 4.096 tokens de salida puede quedarse corto en tareas de generacion larga.
- El contexto anunciado de 262.144 tokens por peticion supera el contexto nativo del modelo base (128k); no hay validacion publicada de calidad a esa longitud en este paquete.
- Riesgo de alucinacion y sesgos: inherentes al modelo base Mistral Nemo Instruct 2407; la card no aporta evaluaciones propias.
- Idiomas soportados no declarados en el repositorio; hay que remitirse a la ficha del modelo base.
- La licencia del repositorio es MIT, pero el uso comercial del modelo subyacente debe verificarse contra los terminos de Mistral Nemo, que pueden diferir.
- `completion_spin_ns=4294967295` activa espera activa y consume CPU mientras la GPU trabaja; en equipos compartidos puede degradar otras cargas.
- Los enlaces de busqueda web encontrados (loom.com, loom.fr, Wikipedia) corresponden a servicios de grabacion de pantalla y a la herramienta textil, no a esta plataforma de inferencia, y no son fuentes validas para este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Mistral-Nemo-Instruct-2407-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Mistral-Nemo-Instruct-2407-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
