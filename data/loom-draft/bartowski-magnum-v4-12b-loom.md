# loom-draft/bartowski-magnum-v4-12b-loom

## Resumen

`loom-draft/bartowski-magnum-v4-12b-loom` es un paquete distribuible en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `magnum-v4-12b-Q4_K_M.gguf` del repositorio `bartowski/magnum-v4-12b-GGUF`. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next` (el generador, sin LLM en el bucle). No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de despliegue que traduce un GGUF existente a un formato ejecutable por el runtime Loom sobre GPUs AMD concretas.

El objetivo del paquete es servir el modelo en hardware AMD especifico: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El runtime expone una API compatible con OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con un tamano de contexto declarado de 262.144 tokens por peticion, concurrencia de 4 peticiones y un maximo de 4.096 tokens de salida segun el preset.

La relevancia es acotada: el modelo subyacente (magnum-v4-12b) es un LLM de 12B del que este paquete no aporta informacion propia, y el valor anadido esta en el empaquetado para el ecosistema Loom sobre ROCm. La model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no la declara; corresponde al GGUF base magnum-v4-12b) |
| Parametros totales | 12B (segun el nombre del modelo base; no verificado en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en programas Loom (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo subyacente: el paquete no incluye detalles sobre tipo de transformer, composicion del dataset ni proceso de alineamiento (RLHF/DPO). Lo unico documentado es el proceso de empaquetado: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF y de `llm_config.json`, y `loom-fetch` verifica el sha256 de los ficheros fuente fijados en `model.json.lock`.

El artefacto incluye `tokenizer.json`, `llm_config.json`, `info.json` (mediciones, evidencia de puertas y versiones) y `REPORT.md`. El runtime declara soporte de API estilo OpenAI, contexto de 262.144 tokens y concurrencia de 4, pero marca como "not applicable" tool calling, reasoning/thinking, reasoning effort, decodificacion especulativa, entrada de imagen y audio. La caracteristica de sampling figura como "not determined".

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 262.144 tokens por peticion, adecuado para documentos largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por defecto (preset `max_tokens`).
- Tool calling: no soportado ("not applicable").
- Reasoning / thinking mode: no soportado ("not applicable").
- Decodificacion especulativa: no soportada ("not applicable").
- Vision y audio: no soportados ("not applicable").
- Capacidades multilingues: no disponibles en la informacion.

## Casos de uso

- Despliegue local en Strix Halo: servir el modelo en un APU Ryzen AI Max+ 395 mediante `loom-serve` para prototipos de inferencia en hardware AMD sin GPU discreta, usando el preset `chat`.
- Despliegue en Radeon AI PRO R9700: ejecutar el preset `chat-r9700` en una GPU de 32 GB para servir un modelo de 12B cuantizado a Q4_K_M con API compatible con OpenAI.
- Procesamiento de documentos largos: aprovechar la ventana de 262.144 tokens para tareas de resumen o extraccion sobre documentos extensos, siempre que se valide la calidad del modelo base.
- Integracion en aplicaciones existentes: al exponer `/v1/chat/completions`, se puede apuntar un cliente compatible con OpenAI al endpoint local sin cambiar el codigo de la aplicacion.
- Evaluacion comparativa frente a llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `logits`) disenadas para contrastar la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, util para validar la fidelidad del runtime Loom.
- Banco de pruebas del ecosistema Loom: sirve como caso de prueba para medir el rendimiento y la correccion de `loom-serve` en gfx1151 y gfx1201, aunque las mediciones aun no estan registradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- Hardware objetivo declarado: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible. El checkpoint es Q4_K_M de un modelo de 12B, pero la informacion no confirma el consumo real del runtime.
- GPU recomendadas: las dos plataformas AMD anteriores; no se mencionan GPUs NVIDIA ni otras.
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta orientado a las plataformas AMD indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski-magnum-v4-12b-loom (este paquete) | 12B | 262.144 tokens | Loom + GGUF Q4_K_M | MIT | Empaquetado para AMD Strix Halo y R9700 |
| bartowski/magnum-v4-12b-GGUF | 12B | no disponible | GGUF | no disponible | Checkpoint base sin modificar |
| llama.cpp (runtime) | no aplica | no disponible | GGUF | no disponible | Referencia de correccion usada por las puertas del paquete |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no aporta informacion sobre el modelo subyacente: arquitectura, datos de entrenamiento, idiomas y sesgos no estan documentados aqui.
- Rendimiento y correccion sin verificar: todas las puertas de correccion y las mediciones frente a llama.cpp figuran como no medidas.
- Funcionalidades ausentes: sin tool calling, sin reasoning, sin vision, sin audio y sin decodificacion especulativa; el sampling figura como "not determined".
- Salida limitada a 4.096 tokens por defecto y concurrencia maxima de 4 peticiones.
- Dependencia de hardware AMD concreto (gfx1151 y gfx1201) y del runtime `hrx-loom==0.2.0`; no se documenta compatibilidad con otras plataformas.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base magnum-v4-12b de forma independiente.
- Repositorio sin descargas ni likes en el momento de la consulta; madurez y soporte no demostrados.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-magnum-v4-12b-loom
- Modelo base en Hugging Face: https://huggingface.co/bartowski/magnum-v4-12b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
