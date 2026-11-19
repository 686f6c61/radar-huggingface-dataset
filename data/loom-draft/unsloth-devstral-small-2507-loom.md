# loom-draft/unsloth-Devstral-Small-2507-loom

## Resumen

`loom-draft/unsloth-Devstral-Small-2507-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Devstral-Small-2507-GGUF`, en concreto el fichero `Devstral-Small-2507-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta pensado para ejecutar el modelo Devstral Small 2507 sobre GPUs AMD concretas: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No es, por tanto, un modelo nuevo ni un fine-tune: es un artefacto de empaquetado y compilacion de kernels para el runtime Loom.

El modelo subyacente es Devstral Small 2507, un modelo de lenguaje orientado a tareas de agente y generacion de codigo, distribuido originalmente por Mistral AI y reempaquetado en GGUF por Unsloth. La tarjeta declara una ventana de contexto de 131.072 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida segun el preset. La licencia declarada es Apache 2.0.

Su relevancia es acotada pero practica: permite servir Devstral Small 2507 en cuantizacion Q4_K_M sobre hardware AMD consumer y de estacion de trabajo sin depender de CUDA, usando una API compatible con OpenAI (`/v1/chat/completions`). La tarjeta no incluye mediciones de rendimiento ni evidencia de las puertas de correccion en el momento de su publicacion, por lo que debe tratarse como un artefacto en fase de borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Devstral Small 2507, transformer; detalle no incluido en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base); paquete Loom con `program/*.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json`, `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Devstral Small 2507 ni sus datos de entrenamiento: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo unico documentado es el proceso de empaquetado: el paquete se genero con `loom-next` (el generador, sin LLM en el bucle) a partir del GGUF `Devstral-Small-2507-Q4_K_M.gguf` de Unsloth, y compila kernels Loom especificos para las arquitecturas AMD gfx1151 y gfx1201.

El artefacto incluye dos presets de despliegue (`chat` para Strix Halo y `chat-r9700` para la R9700), con opciones de runtime como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). La tarjeta menciona que el modelo upstream soporta entrada de imagen, pero Loom no la implementa en este paquete. No se documentan innovaciones como decodificacion especulativa: la tabla de caracteristicas la marca como «not applicable».

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con OpenAI.
- Orientacion a tareas de codigo y agentes, heredada del modelo base Devstral Small 2507 (no se detallan capacidades concretas en la informacion proporcionada).
- Ventana de contexto de 131.072 tokens por peticion, adecuada para documentos largos y conversaciones extensas.
- Hasta 4 peticiones concurrentes por instancia servida.
- Salida limitada a 4.096 tokens por peticion segun el preset.
- Tool calling: no aplicable en este paquete.
- Modo razonamiento / thinking: no aplicable.
- Esfuerzo de razonamiento configurable: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no soportada por Loom en este paquete, aunque el modelo upstream la tiene.
- Entrada/salida de audio: no aplicable.

## Casos de uso

- Asistencia de codigo en estacion de trabajo AMD: servir Devstral Small 2507 en Q4_K_M sobre una Radeon AI PRO R9700 mediante `loom-serve` y consumirlo desde un IDE o CLI con la API `/v1/chat/completions`, evitando dependencias de CUDA.
- Prototipado en APU Strix Halo: desplegar el preset `chat` en un Ryzen AI Max+ 395 para tener un endpoint local de chat con 131.072 tokens de contexto, util para pruebas de integracion antes de mover cargas a servidores.
- Analisis de documentos largos: aprovechar la ventana de 131k tokens para resumir o extraer informacion de repositorios completos, expedientes o documentacion tecnica en una sola peticion.
- Evaluacion de despliegues sin CUDA: comparar el comportamiento del runtime Loom frente a llama.cpp sobre el mismo GGUF, usando las puertas de correccion (`golden`, `compare`, `consistency`) cuando esten medidas.
- Servicio interno de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida, encaja en equipos pequenos o entornos de desarrollo compartido, no en produccion de alta demanda.
- Reproducibilidad de entornos AMD: el paquete fija versiones y verificaciones sha256 de los ficheros fuente mediante `model.json.lock`, lo que facilita reconstruir un entorno identico en maquinas con el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir» todavia, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no medidas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para la Radeon AI PRO R9700 con 32 GB y para la APU Strix Halo con memoria unificada.
- GPU objetivo: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151).
- Compatibilidad con GPU consumer: no se documenta soporte para GPUs consumer AMD distintas de las citadas; no hay datos para NVIDIA.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en este paquete, aunque el GGUF base es compatible con llama.cpp por su formato.
- Opciones de servicio: `--pool_backing=fixed` y `--parameter_mode=preload`; `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; la tarjeta no incluye mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Devstral-Small-2507-loom` (este paquete) | no disponible | 131.072 | Apache 2.0 | Hugging Face, runtime Loom | Paquete de despliegue para AMD gfx1151/gfx1201; sin benchmarks publicados |
| `unsloth/Devstral-Small-2507-GGUF` (modelo base) | no disponible | no disponible en la informacion proporcionada | Apache 2.0 (segun este paquete) | Hugging Face | GGUF original reempaquetado por Unsloth; compatible con llama.cpp |
| Devstral Small 2507 (original de Mistral AI) | no disponible | no disponible | no disponible | no disponible | Modelo upstream; la tarjeta indica que soporta entrada de imagen |

No se dispone de datos suficientes para comparar rendimiento, parametros o contexto con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto en fase de borrador: 0 descargas y 0 likes en el momento de la consulta, y ninguna puerta de correccion medida; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Sin benchmarks de rendimiento: no se puede estimar latencia ni throughput a partir de la informacion disponible.
- Funcionalidades ausentes en el runtime: sin tool calling, sin modo thinking, sin decodificacion especulativa y sin entrada de imagen, aunque el modelo upstream soporte vision.
- Limite de salida de 4.096 tokens y concurrencia de solo 4 peticiones, insuficiente para cargas de produccion exigentes.
- Hardware muy restringido: solo se documentan dos arquitecturas AMD (gfx1151 y gfx1201); no hay garantias para otras GPUs.
- Idiomas soportados no declarados: riesgo de comportamiento irregular fuera de los idiomas principales del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia Apache 2.0 declarada en este paquete, pero conviene verificar los terminos del modelo base y del GGUF de Unsloth antes de un uso comercial.
- El nombre «loom» puede confundirse con el producto de grabacion de pantalla Loom; no existe relacion entre ambos.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Devstral-Small-2507-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Devstral-Small-2507-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
