# loom-draft/unsloth-SmolLM2-1.7B-Instruct-loom

## Resumen

SmolLM2-1.7B-Instruct-loom es un paquete de despliegue para el checkpoint GGUF cuantizado Q4_K_M de SmolLM2-1.7B-Instruct, empaquetado por el usuario loom-draft dentro del ecosistema Loom. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de unsloth/SmolLM2-1.7B-Instruct-GGUF, sin modificar, y lo que aporta el paquete es un conjunto de programas `.loom` generados con la herramienta loom-next, junto con un `model.json` que actua como ficha del preset. El objetivo es ejecutar el modelo sobre GPUs AMD concretas mediante el runtime loom-serve, que expone una API compatible con OpenAI.

El modelo subyacente, SmolLM2-1.7B-Instruct, es un transformer decoder-only de 1.700 millones de parametros desarrollado por Hugging Face, disenado para inferencia en dispositivos con recursos limitados. La variante empaquetada aqui usa cuantizacion Q4_K_M, lo que reduce el peso en disco y en memoria a aproximadamente 1 GB, y esta pensada para placas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de este paquete es fundamentalmente practica: permite servir un modelo pequeno de instrucciones en hardware AMD con aceleracion ROCm a traves de un runtime alternativo a llama.cpp, con API estilo OpenAI, soporte de 4 peticiones concurrentes y una ventana de contexto de 8.192 tokens por peticion. No obstante, la model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2, modelo base) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por peticion (segun el preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye los pesos ya cuantizados |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | loom-serve (hrx-loom 0.2.0) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-1.7B-Instruct, un transformer decoder-only de 1.7B parametros. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas por Hugging Face en el modelo original; esos datos corresponden a la model card de SmolLM2, que no forma parte del material disponible.

Lo que si describe el paquete es su capa de despliegue. Los programas `.loom` y `weights.loom` se generan con loom-next, un generador que produce kernels y programas de ejecucion sin intervencion de un LLM en el bucle. El runtime loom-serve carga estos programas y expone la API. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`, ademas de `tokenizer.json`, `llm_config.json` e `info.json` con las mediciones y versiones. Las opciones de arranque documentadas incluyen `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host).

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de SmolLM2-1.7B-Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad baja o media, acorde a un modelo de 1.7B parametros.
- Generacion de codigo y matematicas elementales (capacidad del modelo base; no se documentan evaluaciones en este paquete).
- API compatible con OpenAI mediante `/v1/chat/completions`, lo que facilita la integracion con clientes existentes.
- Concurrencia de hasta 4 peticiones simultaneas.
- Ventana de contexto de 8.192 tokens por peticion y salida maxima de 4.096 tokens.
- Tool calling: no aplicable segun la model card.
- Modo razonamiento o thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete permite servir SmolLM2-1.7B-Instruct en una Radeon AI PRO R9700 o en un Ryzen AI Max+ 395 mediante loom-serve, con una API compatible con OpenAI que cualquier cliente existente puede consumir sin cambios en el codigo.
- Prototipado rapido de aplicaciones de chat: con 8.192 tokens de contexto y 4 peticiones concurrentes, sirve para validar flujos de conversacion multi-turno en local antes de migrar a modelos mayores o a infraestructura en la nube.
- Clasificacion y extraccion de texto en lotes pequenos: la ventana de contexto y el formato instruct permiten tareas de resumen, etiquetado o extraccion de campos sobre documentos de hasta varias paginas, con la ventaja de que los datos no salen del equipo.
- Entornos con requisitos de privacidad: al ejecutarse integramente en hardware local con pesos Apache 2.0, es adecuado para procesar texto sensible en entornos donde no se permite enviar datos a APIs externas.
- Evaluacion de la cadena de herramientas Loom: el paquete funciona como banco de pruebas para validar loom-fetch, loom-serve y la generacion de programas con loom-next en GPUs AMD, comparando despues contra la referencia de llama.cpp cuando las puertas de correccion esten medidas.
- Educacion y demostraciones de inferencia en GPU AMD: al ocupar aproximadamente 1 GB en Q4_K_M, permite montar talleres o demos de serving de LLM en hardware de consumo profesional sin necesidad de GPUs de datacenter.
- Generacion de codigo asistida en editores locales: para autocompletado o explicacion de fragmentos sencillos, el modelo base tiene capacidad de codigo basica; conviene validar la calidad en el caso concreto, ya que no hay benchmarks publicados para este paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp y de puertas de correccion (kernel_tests, golden, compare, vision, consistency, spec, agent, agent_think_off, sampling, logits, decision), pero todas aparecen marcadas como "not yet re-measured" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201). No hay cifras de throughput ni de latencia publicadas para este paquete.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para los pesos en Q4_K_M, mas el pool de memoria del preset (reservado de forma fija con `--pool_backing=fixed`) y el espacio para el contexto de hasta 8.192 tokens por peticion.
- GPU objetivo documentadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con GPUs NVIDIA ni con GPUs AMD distintas de las dos indicadas.
- Cabe holgadamente en la R9700 de 32 GB y en la memoria unificada del Strix Halo; el cuello de botella no sera la VRAM sino el soporte del runtime para el hardware concreto.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para arrancar el servidor en el puerto 8080 por defecto.
- Alternativas de despliegue no documentadas para este paquete: no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; el paquete esta generado especificamente para loom-serve.
- Latencia y throughput: no disponibles; las mediciones del autor aun no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| SmolLM2-1.7B-Instruct-loom (este paquete) | 1.7B | 8.192 tokens por peticion | Apache 2.0 | GGUF Q4_K_M empaquetado en programas `.loom`; runtime loom-serve | Solo GPUs AMD Strix Halo y R9700; sin benchmarks publicados |
| SmolLM2-1.7B-Instruct (unsloth GGUF) | 1.7B | Segun configuracion del runtime | Apache 2.0 | GGUF; llama.cpp y derivados | Checkpoint original del que deriva este paquete; sirve como referencia de correccion |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1.7B | 8.192 tokens (modelo base) | Apache 2.0 | safetensors; transformers, TGI, vLLM | Version original en precision completa; mayor huella de memoria |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (modelo base) | Apache 2.0 | safetensors, GGUF; multiples runtimes | Alternativa de tamano similar con contexto mayor; no evaluada en este paquete |

La comparacion se limita a datos de catalogo de los modelos; no hay resultados de benchmarks de este paquete que permitan contrastar calidad o velocidad frente a las alternativas.

## Limitaciones y advertencias

- No hay mediciones de rendimiento ni de correccion publicadas para este paquete: todas las puertas de la model card aparecen como "not yet re-measured". No debe asumirse paridad con llama.cpp sin verificacion propia.
- El modelo subyacente tiene 1.7B parametros: su capacidad de razonamiento, codigo y matematicas es limitada en comparacion con modelos de mayor tamano; es propenso a errores en tareas complejas.
- Riesgo de alucinacion inherente a un modelo de este tamano, especialmente en preguntas factuales y contextos largos.
- No se documentan los idiomas soportados; el comportamiento en castellano no esta verificado y la calidad multilingue puede ser irregular.
- Tool calling, modo thinking, decodificacion especulativa y entrada multimodal no estan soportados segun la model card.
- El estado del muestreo (temperature, top_k, seed) figura como "no determinado", lo que impide garantizar reproducibilidad del muestreo.
- Compatibilidad de hardware restringida a las GPUs AMD indicadas (gfx1151 y gfx1201); no se documenta soporte para otras GPUs ni para CPU.
- El paquete depende de la version 0.2.0 de hrx-loom; cambios de version del runtime pueden afectar a los programas generados.
- La licencia Apache 2.0 permite uso comercial, pero el autor del paquete no ofrece garantias sobre el mismo; la responsabilidad de validacion recae en quien lo despliega.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-SmolLM2-1.7B-Instruct-loom
- Checkpoint base (unsloth GGUF): https://huggingface.co/unsloth/SmolLM2-1.7B-Instruct-GGUF
- Repositorio de loom-next (generador): https://github.com/loom-fun/loom-next
- Repositorio de ROCm/hrx-system (referenciado en la model card): https://github.com/ROCm/hrx-system
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
