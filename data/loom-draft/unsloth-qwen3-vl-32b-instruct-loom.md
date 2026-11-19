# loom-draft/unsloth-Qwen3-VL-32B-Instruct-loom

## Resumen

El modelo `loom-draft/unsloth-Qwen3-VL-32B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen3-VL-32B-Instruct-Q4_K_M.gguf` de `unsloth/Qwen3-VL-32B-Instruct-GGUF`. No se trata de un modelo nuevo ni de un fine-tune: es una distribucion del Qwen3-VL-32B-Instruct original, cuantizado en Q4_K_M, adaptado para ejecutarse sobre el runtime Loom en GPUs AMD concretas (Ryzen AI Max+ 395 "Strix Halo" con gfx1151 y Radeon AI PRO R9700 con gfx1201, 32 GB).

El objetivo del paquete es ofrecer una ruta de inferencia nativa en ROCm/AMD para un modelo vision-lenguaje de 32.000 millones de parametros, con API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling e imagen de entrada mediante el proyector `mmproj-BF16.gguf`. El paquete se ha generado con la herramienta `loom-next` (generador automatico, sin LLM en el bucle) y se publica bajo licencia Apache 2.0.

Su relevancia es acotada pero concreta: permite servir Qwen3-VL-32B en hardware AMD de consumo/prosumer con 32 GB de VRAM unificada o dedicada, con contexto de 262.144 tokens por peticion y hasta 4 peticiones concurrentes, sin depender de CUDA ni de llama.cpp, aunque la model card no incluye aun mediciones de rendimiento ni validaciones de correctitud para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base Qwen3-VL-32B-Instruct; la model card no la describe) |
| Parametros totales | 32B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-VL-32B-Instruct-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reutiliza el checkpoint GGUF Q4_K_M de `unsloth/Qwen3-VL-32B-Instruct-GGUF` y genera programas Loom especificos para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700). La model card no documenta la arquitectura interna del transformer, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base Qwen3-VL-32B-Instruct y no se reproduce aqui.

La innovacion tecnica del paquete es el propio runtime Loom: kernels generados por `loom-next`, un pool de memoria de backend fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) definidas en `loom-benchmark`, pero ninguna de ellas tiene medicion registrada para este paquete en el momento de la publicacion.

## Capacidades

- Generacion de texto e inferencia multimodal imagen-texto (`pipeline: image-text-to-text`), con entrada de imagen mediante partes `image_url` al estilo OpenAI y proyector `mmproj-BF16.gguf`.
- Tool calling / function calling compatible con el esquema OpenAI (`tools` y `tool_calls`), validado por la puerta `agent` del benchmark (sin medicion registrada aun).
- API HTTP compatible con OpenAI en `/v1/chat/completions`, lo que facilita la integracion con clientes existentes.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Contexto de 262.144 tokens por peticion.
- Modo de razonamiento / thinking: no aplicable segun la model card.
- Decodificacion especulativa: no aplicable segun la model card.
- Entrada y salida de audio: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de caracteristicas, aunque existe una puerta `sampling` sin medicion registrada.

## Casos de uso

- Asistente multimodal sobre documentos escaneados: el modelo acepta imagenes y texto en la misma peticion, por lo que puede extraer y razonar sobre facturas, formularios o capturas en un unico turno, con contexto de 262.144 tokens para adjuntar varias paginas.
- Analisis de capturas de pantalla en soporte tecnico: con entrada `image_url` y tool calling, se puede construir un agente que reciba una captura del usuario, consulte una base de conocimiento via `tools` y devuelva instrucciones paso a paso.
- Automatizacion de QA visual en pipelines: integrado en un flujo CI/CD que envia imagenes de la interfaz renderizada al endpoint `/v1/chat/completions` y compara la respuesta con criterios esperados, aprovechando las 4 peticiones concurrentes para paralelizar.
- Despliegue en estaciones de trabajo AMD sin CUDA: pensado para equipos con Ryzen AI Max+ 395 (Strix Halo) o Radeon AI PRO R9700 de 32 GB, donde el paquete Loom evita depender de llama.cpp o de toolchains CUDA.
- Prototipado de agentes multi-turno con herramientas: el soporte de `tools`/`tool_calls` y la puerta `agent` (aunque sin medicion registrada) apuntan a flujos de razonamiento multi-paso con historial reutilizado.
- Servicio local de chat con contexto largo: con 262.144 tokens por peticion se pueden mantener conversaciones extensas o adjuntar documentos largos sin truncar, siempre que la VRAM disponible lo permita.
- Evaluacion comparativa frente a llama.cpp: el paquete incluye puertas de correctitud (`golden`, `compare`, `vision`) disenadas para contrastar token a token contra una referencia de llama.cpp sobre el mismo GGUF, util para validar el runtime antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" y que todas las puertas de correctitud figuran como "not yet re-measured", es decir, sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: el peso principal es un GGUF Q4_K_M de un modelo de 32B; a ~4,5 bits por parametro, el peso ronda los 18-20 GB, mas el proyector de vision en BF16 y el pool de memoria fijo del runtime. No se publica una cifra oficial de VRAM en la model card.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs NVIDIA ni con Radeon consumer distintas de las dos anteriores; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en este paquete; llama.cpp se usa unicamente como referencia de correctitud.
- Concurrencia: 4 peticiones simultaneas segun la tabla de caracteristicas.
- Latencia y throughput: no disponibles (sin mediciones registradas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3-VL-32B-Instruct-loom | 32B | 262.144 tokens | GGUF Q4_K_M empaquetado en Loom; runtime Loom sobre AMD gfx1151/gfx1201 | Apache 2.0 | Paquete de despliegue, sin benchmarks publicados |
| unsloth/Qwen3-VL-32B-Instruct-GGUF (modelo base) | 32B | no disponible en la informacion | GGUF; ejecutable con llama.cpp y otros runners GGUF | Apache 2.0 (heredada) | Checkpoint de origen, sin modificaciones |
| llama.cpp (referencia de correctitud) | no aplica | no disponible | Runtime generico GGUF | MIT (no confirmado en la informacion) | Usado por el paquete Loom como referencia de tokens y log-probs |

No se dispone de datos de benchmarks ni de alternativas comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no aporta mediciones de rendimiento ni de correctitud: todas las puertas y las filas de rendimiento figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete concreto.
- El muestreo figura como "no determinado" en la tabla de caracteristicas, lo que introduce incertidumbre sobre el comportamiento de `temperature`, `top_k` y `seed` en produccion.
- El modo de razonamiento (thinking) y la decodificacion especulativa se marcan como "no aplicable" en este paquete; no se pueden usar esas funciones aunque el modelo base las soporte.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`), inferior al contexto de entrada.
- Solo se declaran dos GPUs objetivo (gfx1151 y gfx1201); no hay soporte documentado para NVIDIA, otras Radeon ni CPU.
- No se declaran idiomas soportados; el comportamiento multilingue depende del modelo base y no esta verificado en este paquete.
- Riesgo de alucinacion y sesgos: no documentados en la model card; son los inherentes al checkpoint Qwen3-VL-32B-Instruct original.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del proyector de vision por separado.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-19), lo que sugiere que es un artefacto recien generado y sin validacion de la comunidad.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-32B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-VL-32B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
