# loom-draft/bartowski-Qwen2-0.5B-Instruct-loom

## Resumen

`loom-draft/bartowski-Qwen2-0.5B-Instruct-loom` es un paquete de despliegue para la plataforma Loom (runtime de inferencia sobre GPUs AMD) que empaqueta el checkpoint GGUF sin modificar `Qwen2-0.5B-Instruct-Q4_K_M.gguf` de Bartowski, derivado del modelo Qwen2-0.5B-Instruct de Alibaba. No es un modelo nuevo ni un fine-tuning: es una distribucion de artefactos (programas `.loom`, `model.json`, tokenizer y pesos) generada con la herramienta `loom-next` para ejecutarse en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer decoder-only de 0,5 mil millones de parametros con 32.768 tokens de contexto, orientado a instrucciones y conversacion. Su interes practico esta en el empaquetado: permite servir el modelo con una API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD mediante `loom-serve`, sin depender de CUDA ni de llama.cpp.

La relevancia de esta ficha es acotada: el paquete tiene 0 descargas y 0 likes, fue creado en noviembre de 2026 y su model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion "no se han vuelto a medir todavia" para ambas GPUs objetivo. Debe tratarse como un artefacto experimental de integracion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), empaquetado como programas Loom generados |
| Parametros totales | 0,5 mil millones (modelo base Qwen2-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF de origen; empaquetado como `weights.loom` y programas `program/*.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con atencion causal estandar, entrenado por Alibaba y posteriormente convertido a GGUF por Bartowski en cuantizacion Q4_K_M. La model card de este paquete no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; esa informacion corresponderia a la documentacion original de Qwen2, no incluida aqui.

La innovacion tecnica del paquete no esta en el modelo sino en el runtime: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF y de `llm_config.json`, sin intervencion de un LLM en el bucle de generacion. El resultado se sirve con `loom-serve` sobre `amdgpu://`, con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `pool_backing=fixed` (pool de memoria preasignado) y `parameter_mode=preload` (carga de pesos en host). La model card declara soporte de contexto de 32.768 tokens y 4 peticiones concurrentes, pero no de decodificacion especulativa (marcada como "not applicable").

## Capacidades

- Generacion de texto conversacional e instrucciones: es un modelo Instruct de 0,5B, adecuado para respuestas cortas y tareas simples.
- Contexto de 32.768 tokens por peticion, con hasta 4.096 tokens de salida por defecto.
- Servidor HTTP con API compatible OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes existentes.
- Concurrencia de 4 peticiones simultaneas declarada por el preset.
- Tool calling: no soportado ("not applicable" en la model card).
- Razonamiento / thinking mode: no soportado ("not applicable").
- Decodificacion especulativa: no soportada ("not applicable").
- Entrada de imagen: no determinada ("not determined").
- Entrada/salida de audio: no determinada ("not determined").
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de pipelines sobre GPU AMD: sirve para validar una integracion con la API compatible OpenAI de `loom-serve` en Strix Halo o R9700 antes de migrar a un modelo mayor, gracias a que el coste de descarga y carga de un 0,5B en Q4_K_M es minimo.
- Clasificacion y extraccion de informacion en texto corto: con 32.768 tokens de contexto puede procesar documentos moderados y devolver etiquetas o campos estructurados en una sola peticion.
- Respuestas conversacionales de baja latencia en local: al caber holgadamente en la memoria de las GPUs objetivo, permite servir un chatbot basico sin conexion a servicios en la nube.
- Generacion de texto auxiliar en herramientas de desarrollo: resumenes de diffs, mensajes de commit o descripciones de errores, siempre que se acepte la calidad limitada de un modelo de 0,5B.
- Pruebas de regresion del runtime Loom: el paquete incluye puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, entre otras) pensadas para verificar que los kernels generados coinciden con la referencia de llama.cpp.
- Evaluacion comparativa de backends: al partir del mismo GGUF que la referencia de llama.cpp, permite medir diferencias de tokens generados y log-probs entre ambos runtimes sobre el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavia", y que todas las puertas de correccion figuran como "not yet re-measured" en ambas GPUs. No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: un Q4_K_M de 0,5B ocupa aproximadamente 0,4-0,5 GB de pesos, mas overhead de contexto y pool de memoria; la cifra exacta para este paquete no esta disponible en la model card.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA ni para otras AMD distintas de las dos anteriores; no disponible para RTX 4090 u otras.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/bartowski-Qwen2-0.5B-Instruct-loom:chat --materialize=copy` y `loom-serve --model=qwen2-0.5b-instruct '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Otros runtimes (vLLM, llama.cpp, Ollama, TGI): no documentados para este paquete; el GGUF de origen si es compatible con llama.cpp por su formato.
- Latencia y throughput: no disponibles; la model card no incluye mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| loom-draft/bartowski-Qwen2-0.5B-Instruct-loom | 0,5B | 32.768 | MIT | GGUF empaquetado en `.loom`, runtime `loom-serve` sobre AMD | Paquete experimental, sin mediciones publicadas |
| bartowski/Qwen2-0.5B-Instruct-GGUF | 0,5B | 32.768 (heredado de Qwen2) | MIT (modelo base) | GGUF, runtime llama.cpp | Checkpoint de origen sin modificar; referencia de correccion del paquete Loom |
| Qwen2-0.5B-Instruct (original) | 0,5B | 32.768 | Apache 2.0 segun la familia Qwen2 (no verificado en esta informacion) | safetensors, transformers | Modelo base de Alibaba; la licencia declarada en este paquete es MIT, no la del original |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: capacidad de razonamiento, matematicas y codigo muy limitada en comparacion con modelos de 7B o superiores; no apto para tareas complejas sin verificacion humana.
- Riesgo de alucinacion elevado, especialmente en preguntas factuales y contextos largos, dado el reducido tamano del modelo.
- La model card no declara idiomas soportados; el soporte multilingue real no esta verificado.
- Tool calling, thinking mode y decodificacion especulativa no estan soportados por el preset.
- Cero mediciones de rendimiento y cero evidencias de correccion registradas para ambas GPUs objetivo: no hay garantia de que los kernels generados coincidan con la referencia de llama.cpp.
- Paquete con 0 descargas y 0 likes, creado y actualizado el mismo dia: sin validacion por parte de la comunidad.
- El soporte de hardware esta restringido a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta compatibilidad con otras GPUs.
- La licencia declarada es MIT, pero conviene verificar la licencia del modelo base Qwen2 original antes de un uso comercial, ya que la model card no la reproduce.
- La fecha de creacion (2026-11-26) y la ausencia de pipeline declarado sugieren un artefacto reciente y posiblemente inestable; no usar en produccion sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2-0.5B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2-0.5B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
