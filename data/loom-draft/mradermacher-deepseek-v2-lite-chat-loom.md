# loom-draft/mradermacher-DeepSeek-V2-Lite-Chat-loom

## Resumen

DeepSeek-V2-Lite-Chat-loom es un paquete de despliegue para GPUs AMD que empaqueta el checkpoint GGUF `DeepSeek-V2-Lite-Chat.Q4_K_M.gguf` (procedente de `mradermacher/DeepSeek-V2-Lite-Chat-GGUF`) en formato Loom (programas `.loom` y una tarjeta `model.json`). Lo publica el usuario `loom-draft` dentro del ecosistema Loom, una infraestructura de inferencia para hardware AMD (ROCm/hrx-system) orientada a los aceleradores Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genero con `loom-next`, el generador de programas, sin intervencion de un LLM en el bucle.

El modelo subyacente es DeepSeek-V2-Lite-Chat, un transformer de tipo Mixture-of-Experts (MoE) de DeepSeek, distribuido aqui en cuantizacion Q4_K_M. El interes practico de esta publicacion no es el modelo en si (ya disponible en otros formatos), sino la conversion a un runtime propietario para GPUs AMD, con API compatible con OpenAI y un tamano de contexto declarado de 139.264 tokens por peticion y hasta 4 peticiones concurrentes.

La ficha es relevante para desarrolladores que quieran evaluar el modelo en hardware AMD consumer o profesional sin depender de CUDA, pero conviene advertir que el propio autor indica que las mediciones de rendimiento y las puertas de correccion no se han vuelto a medir para este paquete, por lo que no hay evidencia empirica publicada de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (DeepSeek-V2-Lite), empaquetado en formato Loom |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | 139.264 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de DeepSeek) |
| Formato de pesos | GGUF empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V2-Lite-Chat, un transformer con capas de mezcla de expertos (MoE) desarrollado por DeepSeek. La informacion proporcionada no detalla el numero de parametros totales ni activos, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplico RLHF o DPO; todos esos datos deben consultarse en la model card original de DeepSeek-V2-Lite-Chat.

El paquete Loom en si no reentrena ni modifica el checkpoint: toma el GGUF cuantizado Q4_K_M y genera programas `.loom` especificos para las arquitecturas gfx1151 (Strix Halo) y gfx1201 (R9700). Incluye `model.json` con los ficheros fuente fijados por sha256, `tokenizer.json`, `llm_config.json` (configuracion desde la que se generaron los programas) e `info.json` con las mediciones y puertas de correccion. El servidor `loom-serve` expone un endpoint compatible con OpenAI (`/v1/chat/completions`).

## Capacidades

- Generacion de texto conversacional mediante API estilo OpenAI.
- Contexto de 139.264 tokens por peticion, adecuado para documentos largos.
- Hasta 4 peticiones concurrentes por instancia.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de caracteristicas del autor.
- Modo razonamiento/thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: con 139.264 tokens de contexto por peticion, el modelo puede mantener conversaciones multi-turno con historial largo o adjuntar documentacion de producto sin truncar.
- Procesamiento de documentos extensos: resumir o extraer informacion de contratos, manuales o informes que superen decenas de miles de tokens en una sola pasada.
- Despliegue en hardware AMD sin CUDA: servir el modelo en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 usando `loom-serve`, evitando dependencias de ecosistema NVIDIA.
- Prototipado de asistentes conversacionales: al exponer `/v1/chat/completions`, se puede apuntar cualquier cliente compatible con OpenAI al endpoint local y cambiar despues de backend sin reescribir la integracion.
- Evaluacion comparativa de runtimes: usar el paquete como banco de pruebas para comparar el rendimiento de Loom frente a llama.cpp en el mismo GGUF, aunque las mediciones aun no estan publicadas.
- Generacion de texto por lotes en local: con 4 peticiones concurrentes, procesar colas moderadas de prompts en una estacion de trabajo con GPU AMD dedicada.
- Laboratorio de investigacion: disponer de un MoE cuantizado en Q4_K_M para experimentos de prompting y evaluacion de calidad sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que tanto las mediciones de rendimiento frente a llama.cpp como las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPUs (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201). No hay datos de latencia ni throughput.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible; el paquete se distribuye en Q4_K_M y la R9700 dispone de 32 GB, pero el autor no publica cifras de memoria necesaria.
- Compatibilidad con GPUs consumer: no disponible; solo se documentan los dos aceleradores AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones dentro de este paquete.
- Opciones de servicio documentadas: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V2-Lite-Chat-loom (este paquete) | no disponible | 139.264 tokens | Loom (GGUF Q4_K_M empaquetado) | other | Solo GPUs AMD gfx1151/gfx1201; sin benchmarks publicados |
| mradermacher/DeepSeek-V2-Lite-Chat-GGUF (base) | no disponible | no disponible | GGUF | other | Checkpoint original sin empaquetar; compatible con llama.cpp y derivados |
| DeepSeek-V2-Lite-Chat (modelo original de DeepSeek) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors (formato habitual de publicacion) | licencia de DeepSeek (consultar) | Fuente de los pesos; datos de arquitectura y entrenamiento en su model card |

No se dispone de datos de rendimiento comparativo para ninguna de las tres entradas.

## Limitaciones y advertencias

- Ausencia de evidencia empirica: todas las puertas de correccion y las comparaciones de rendimiento frente a llama.cpp estan marcadas como no re-medidas; no hay garantia publicada de equivalencia de salida.
- Sin benchmarks de calidad: no se aportan resultados de MMLU, HumanEval, GSM8K ni similares para este paquete.
- Funcionalidades ausentes: sin tool calling, sin modo thinking, sin decodificacion especulativa, sin vision ni audio, segun la tabla del autor.
- Muestreo no determinado: el estado del soporte de temperature, top_k y seed figura como "?" en la informacion disponible.
- Licencia "other": conviene revisar los terminos del modelo base DeepSeek antes de uso comercial; la informacion proporcionada no aclara las condiciones.
- Idiomas: no se especifica que lenguas soporta el paquete.
- Sesgos y alucinacion: no hay informacion especifica en la documentacion proporcionada; aplican los riesgos habituales del modelo base.
- Dependencia de hardware concreto: el paquete esta generado para gfx1151 y gfx1201; su uso en otras GPUs AMD no esta documentado.
- Formato propietario: requiere el runtime Loom (`hrx-loom==0.2.0`), lo que limita la portabilidad frente a GGUF estandar.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-DeepSeek-V2-Lite-Chat-loom
- Checkpoint base GGUF: https://huggingface.co/mradermacher/DeepSeek-V2-Lite-Chat-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
