# loom-draft/bartowski-Qwen2.5-1.5B-Instruct-loom

## Resumen

`loom-draft/bartowski-Qwen2.5-1.5B-Instruct-loom` es un paquete de despliegue para la plataforma Loom (del ecosistema ROCm de AMD), no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf` de bartowski (a su vez una cuantizacion del modelo Qwen2.5-1.5B-Instruct de Alibaba) en forma de programas `.loom` y una tarjeta `model.json` que el runtime `loom-serve` puede ejecutar directamente sobre GPUs AMD.

El objetivo es ofrecer una ruta de inferencia nativa para hardware AMD concreto: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genero con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle. El modelo subyacente es un transformer denso de 1.500 millones de parametros con 32.768 tokens de contexto por peticion, licencia Apache 2.0 y soporte de tool calling estilo OpenAI.

La relevancia es acotada pero concreta: permite servir Qwen2.5-1.5B-Instruct cuantizado en Q4_K_M sobre GPUs AMD sin depender de llama.cpp, exponiendo una API compatible con `/v1/chat/completions`. No obstante, en el momento de redactar esta ficha el autor no ha publicado mediciones de rendimiento ni evidencia de los gates de correctitud para este paquete en ninguna de las dos GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-1.5B-Instruct); empaquetado como programas Loom para runtime `loom-serve` |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye `weights.loom` generado a partir de ese checkpoint |
| Idiomas soportados | no disponible (la model card no los declara; hereda los del modelo base Qwen2.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado en `weights.loom` + `program/*.loom` + `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer denso decoder-only de 1.500 millones de parametros desarrollado por Alibaba Qwen. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la model card original de Qwen2.5, no incluida en la informacion proporcionada.

Lo especifico de este paquete es la capa de despliegue: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) y un fichero `weights.loom` a partir del GGUF Q4_K_M, junto con `tokenizer.json`, `llm_config.json` e `info.json`. El runtime `loom-serve` ejecuta esos programas sobre `amdgpu://` con opciones como `completion_spin_ns=4294967295` (espera activa de finalizacion en GPU), `pool_backing=fixed` (pool de memoria fijo) y `parameter_mode=preload`. No hay decodificacion especulativa, modo thinking ni atencion lineal indicados en la tarjeta.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 32.768 tokens por peticion.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`), validado por el gate `agent` del benchmark de Loom.
- API compatible con OpenAI en `/v1/chat/completions`, lo que permite reutilizar clientes existentes.
- Concurrencia de hasta 4 peticiones simultaneas con garantia de consistencia (gate `consistency`).
- Salida maxima de 4.096 tokens por respuesta (preset `max_tokens`).
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen del modelo base Qwen2.5-1.5B-Instruct.
- Sin soporte de razonamiento explicito (thinking), esfuerzo de razonamiento, decodificacion especulativa, entrada de imagen ni audio, segun la tabla de features de la model card.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de features.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU AMD: el paquete permite levantar un endpoint compatible con OpenAI en `127.0.0.1:8080` mediante `loom-serve`, adecuado para prototipos y herramientas internas que ya hablan el protocolo de OpenAI.
- Pruebas de integracion de agentes con tool calling: el soporte de `tools`/`tool_calls` y el gate `agent` (loop multi-turno con reutilizacion de historial) permiten validar pipelines de agentes sin salir del ecosistema AMD.
- Evaluacion comparativa de runtimes en GPUs AMD: al ser un empaquetado del mismo GGUF que usa llama.cpp como referencia, sirve para contrastar el rendimiento y la fidelidad de `loom-serve` frente a llama.cpp en Strix Halo y R9700.
- Procesamiento de documentos de hasta 32k tokens: resumen, extraccion de entidades o clasificacion sobre textos largos en un modelo de 1,5B, viable en hardware de consumo o estaciones compactas.
- Generacion de codigo asistida en entornos con GPU AMD: el modelo base Qwen2.5-1.5B-Instruct tiene capacidad de codigo; el paquete lo expone via API para autocompletado o generacion de fragmentos en herramientas internas.
- Despliegue en el borde (edge) sobre Ryzen AI Max+ 395: al ser un APU con memoria unificada, el paquete Q4_K_M de 1,5B cabe holgadamente y permite servir un chatbot local sin GPU discreta.
- Banquito de pruebas para cuantizacion Q4_K_M: util para medir degradacion de calidad frente al modelo en fp16 en tareas de instrucciones y tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Del mismo modo, ninguno de los gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene evidencia registrada para este paquete.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 1,5B ocupa aproximadamente 1 GB de pesos; con overhead de runtime y cache KV para 32k tokens, el consumo real no esta medido en la informacion disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU no soportadas explicitamente: no hay referencia a NVIDIA, Apple Silicon ni otras GPUs AMD distintas de las dos anteriores; el runtime se invoca con `--device=amdgpu://`.
- Cabe en GPU de consumo: si, por tamano (1,5B en Q4_K_M), aunque el soporte del runtime esta limitado a las GPUs AMD indicadas.
- Opciones de despliegue: `loom-fetch` + `loom-serve` (version `hrx-loom[hf]==0.2.0`), con `--pool_backing=fixed` y `--parameter_mode=preload`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-Qwen2.5-1.5B-Instruct-loom` (este) | 1,5B | 32.768 | Apache 2.0 | `.loom` + `loom-serve` | Solo GPUs AMD gfx1151 / gfx1201; sin mediciones publicadas |
| `bartowski/Qwen2.5-1.5B-Instruct-GGUF` (base) | 1,5B | 32.768 (heredado) | Apache 2.0 | GGUF | Ejecutable en llama.cpp, Ollama, etc.; referencia de correctitud del paquete Loom |
| Qwen2.5-1.5B-Instruct (original) | 1,5B | 32.768 | Apache 2.0 | safetensors | Pesos originales en fp16/bf16; requiere framework de inferencia estandar |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community License | safetensors / GGUF | Alternativa de tamano similar; licencia mas restrictiva que Apache 2.0 |

## Limitaciones y advertencias

- Modelo de 1,5B parametros: capacidad de razonamiento y conocimiento factual limitados en comparacion con modelos de 7B o superiores; riesgo elevado de alucinacion en dominios especializados.
- Sin evidencia de correctitud publicada: todos los gates de `loom-benchmark` aparecen como "no medidos" para este paquete, por lo que no hay garantia documentada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: no se puede afirmar nada sobre latencia o throughput frente a llama.cpp en las GPUs objetivo.
- Soporte de hardware restringido: el runtime solo se ha preparado para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay indicacion de que funcione en otras GPUs AMD ni en NVIDIA.
- Muestreo no determinado: el estado de la funcion de muestreo (temperature, top_k, seed) figura como "?" en la model card, lo que es un riesgo para reproducibilidad en produccion.
- Idiomas no declarados: la model card no especifica los idiomas soportados; hay que remitirse a la documentacion del modelo base Qwen2.5.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del GGUF de bartowski (tambien Apache 2.0 segun los tags).
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-19; es un artefacto reciente sin validacion de la comunidad.
- La busqueda web no ha devuelto informacion util sobre este paquete; los resultados corresponden a productos homonimos no relacionados (Loom.com, Loom.fr, restaurante Loom en Lyon).

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-1.5B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
