# loom-draft/bartowski-L3-8B-Stheno-v3.2-loom

## Resumen

`loom-draft/bartowski-L3-8B-Stheno-v3.2-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/L3-8B-Stheno-v3.2-GGUF`, en concreto la cuantizacion `L3-8B-Stheno-v3.2-Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos de un modelo Llama 3 8B ya existente a un formato ejecutable por el runtime Loom sobre GPUs AMD concretas.

El paquete esta orientado a dos aceleradores: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se genera con la herramienta `loom-next` (solo el generador, sin LLM en el bucle) y se sirve mediante `loom-serve`, que expone una API compatible con el endpoint `/v1/chat/completions` de OpenAI. El modelo subyacente, L3-8B-Stheno-v3.2, es un fine-tuning de Llama 3 de 8B orientado a rol y conversacion creativa.

Su relevancia es de nicho: sirve para validar y ejecutar modelos GGUF en el ecosistema Loom sobre hardware AMD, con contexto de 8.192 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida. La licencia del paquete es MIT. No hay descargas ni likes registrados, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el paquete; el modelo base es Llama 3 8B (familia L3) |
| Parametros totales | 8B (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`L3-8B-Stheno-v3.2-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom`; incluye `tokenizer.json`, `llm_config.json`, `model.json`/`model.json.lock` e `info.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: hereda la del checkpoint GGUF de origen, un Llama 3 de 8B (transformer decoder-only) afinado por el autor original de Stheno v3.2, orientado a rol y escritura creativa. La cuantizacion es Q4_K_M, un esquema de bloques de 4 bits con escalas de mayor precision en determinados tensores, habitual en llama.cpp. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el fine-tuning original.

La innovacion tecnica del artefacto es el propio pipeline Loom: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir de `llm_config.json`, y `loom-serve` los ejecuta sobre ROCm en las GPUs AMD indicadas. El paquete incluye un `model.json.lock` con los hashes SHA-256 de los ficheros de origen, verificados por `loom-fetch`. La model card define un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp; en la version publicada todas aparecen como "not yet re-measured", es decir, sin evidencia registrada.

## Capacidades

- Generacion de texto conversacional y creativo, heredada de Stheno v3.2 (rol y ficcion).
- Razonamiento y respuesta multi-turno dentro de una ventana de 8.192 tokens.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), con hasta 4 peticiones concurrentes.
- Tool calling: marcado como "not applicable" en la model card.
- Razonamiento / thinking mode: "not applicable".
- Esfuerzo de razonamiento configurable: "not applicable".
- Decodificacion especulativa: "not applicable".
- Entrada de imagen: "not determined".
- Entrada/salida de audio: "not determined".
- Muestreo (temperatura, top_k, semilla): "not determined" en la tabla de caracteristicas, aunque existe una puerta `sampling` definida sin resultados.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue de un LLM de 8B en una APU Strix Halo sin GPU dedicada: el paquete permite servir el modelo con `loom-serve` sobre gfx1151 y consumirlo por HTTP, util para prototipos en equipos compactos.
- Validacion del runtime Loom en hardware AMD: sirve como caso de prueba reproducible para comprobar que los kernels generados producen la misma salida que llama.cpp sobre el mismo GGUF.
- Chat conversacional local con contexto medio: 8.192 tokens permiten mantener conversaciones de varias decenas de turnos o procesar documentos cortos en una sola peticion.
- Generacion creativa y roleplay: el fine-tuning Stheno v3.2 esta orientado a narrativa y personajes, adecuado para demos de escritura asistida en local.
- Servicio de inferencia por lotes pequenos: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, encaja en tareas de resumen o reescritura de textos cortos.
- Benchmarking de hardware: la model card define puertas de correccion y comparativas de rendimiento frente a llama.cpp, utiles para medir el estado del soporte ROCm en R9700 y Strix Halo.
- Integracion en pipelines internos que ya hablan la API de OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente al endpoint local sin cambios de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion aparecen sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; la cuantizacion Q4_K_M de un modelo de 8B suele ocupar en torno a 5-6 GB de pesos, pero el paquete no publica la cifra.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para GPUs NVIDIA ni para otras Radeon.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; el soporte esta limitado a los dos aceleradores AMD listados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Flags relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Alternativas de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp se usa solo como referencia de correccion.
- Latencia y throughput: no disponibles; la model card no incluye cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski-L3-8B-Stheno-v3.2-loom (este paquete) | 8B | 8.192 tokens | Loom (GGUF Q4_K_M empaquetado) | MIT | Solo GPUs AMD gfx1151 y gfx1201; rendimiento sin medir |
| bartowski/L3-8B-Stheno-v3.2-GGUF (origen) | 8B | no disponible en la informacion | GGUF | MIT (segun el paquete) | Checkpoint sin modificar; ejecutable con llama.cpp y otros runtimes GGUF |
| Llama 3 8B (base de la familia) | 8B | no disponible en la informacion | safetensors / GGUF | Llama 3 Community License | Modelo generalista; el fine-tuning Stheno lo especializa en rol y creatividad |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no aporta evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".
- No hay mediciones de rendimiento publicadas frente a llama.cpp en ninguna de las dos GPUs objetivo.
- Soporte de hardware muy restringido: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta compatibilidad con otras GPUs.
- Contexto limitado a 8.192 tokens por peticion, inferior al de modelos actuales de 8B con ventanas de 32k o superiores.
- Sin soporte de tool calling, thinking mode ni decodificacion especulativa; la entrada de imagen y audio figura como "not determined".
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Riesgo de alucinacion y sesgos: no documentados en la model card; el modelo base es un fine-tuning de rol, lo que puede favorecer respuestas creativas sobre respuestas factuales.
- Licencia MIT para el paquete, pero conviene verificar la licencia del checkpoint de origen y del modelo Llama 3 subyacente antes de un uso comercial.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- El contenido de la model card esta marcado por el propio autor como material de referencia; no debe interpretarse como instrucciones a ejecutar sin revision.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-L3-8B-Stheno-v3.2-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/L3-8B-Stheno-v3.2-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
