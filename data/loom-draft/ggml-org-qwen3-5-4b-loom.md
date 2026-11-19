# loom-draft/ggml-org-Qwen3.5-4B-loom

## Resumen

El paquete `loom-draft/ggml-org-Qwen3.5-4B-loom` es una distribucion del checkpoint GGUF `Qwen3.5-4B` (cuantizacion Q4_K_M) empaquetada para el runtime AMD Loom, un stack de inferencia orientado a GPUs AMD ROCm. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next`, un generador de programas `.loom` que traduce el grafo del modelo a kernels especificos para las GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No es un modelo nuevo ni un fine-tune entrenado: es una reempaquetado de inferencia del modelo base de Qwen con pesos sin modificar.

El modelo subyacente es un transformer multimodal de 4.000 millones de parametros con capacidad de entrada de imagen (pipeline `image-text-to-text`), plantilla de chat con modo de razonamiento activado por defecto y soporte de tool calling. El paquete declara una ventana de contexto de 262.144 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por defecto. La licencia es Apache 2.0.

Su relevancia es practica: permite ejecutar un modelo multimodal de 4B en hardware AMD consumer y profesional mediante un runtime alternativo a llama.cpp, con una API compatible con OpenAI (`/v1/chat/completions`). No obstante, la propia model card indica que las mediciones de rendimiento y las puertas de correccion frente a llama.cpp aun no se han re-medido para este paquete, por lo que la evidencia empirica publicada es nula en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.5-4B); paquete de inferencia para runtime Loom |
| Parametros totales | 4.000 millones (aproximado, segun nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 (`mmproj-Qwen3.5-4B-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 4B parametros con un proyector de vision separado (`mmproj-Qwen3.5-4B-BF16.gguf`) que procesa imagenes y las inyecta como tokens en el contexto del modelo de lenguaje. El paquete Loom no reentrena ni modifica los pesos: toma el GGUF `Qwen3.5-4B-Q4_K_M.gguf` de `ggml-org` y genera programas `.loom` (kernels) especificos para las arquitecturas gfx1151 y gfx1201 mediante `loom-next`. La model card indica explicitamente que la generacion se hizo "the generator alone, no LLM in the loop".

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento en el modelo base. La model card del paquete no documenta innovaciones de decodificacion especulativa (marcada como "not applicable") ni atencion lineal. El modo de razonamiento (thinking) esta activado por defecto y puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable por peticion.
- Entrada de imagen en formato OpenAI (`image_url`), mediante el proyector `mmproj-Qwen3.5-4B-BF16.gguf`.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de agente multi-turno con reutilizacion de historial (segun la puerta `agent` de la model card).
- Contexto largo de hasta 262.144 tokens por peticion, apto para documentos extensos.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- API compatible con OpenAI, lo que facilita integracion con clientes existentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio: no soportado (marcado como "not applicable").
- Decodificacion especulativa: no soportada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite adjuntar historiales largos o documentacion de producto sin truncar. La API compatible con OpenAI simplifica la integracion en backends existentes.
- Procesamiento de documentos con imagenes: al aceptar `image_url`, puede extraer informacion de capturas, formularios escaneados o diagramas y responder preguntas sobre ellos, combinando vision y contexto largo en una sola peticion.
- Agentes con tool calling en entornos controlados: el soporte de `tools` y `tool_calls` permite construir asistentes que consulten APIs internas, bases de datos o sistemas de ticketing, con bucles multi-turno validados por la puerta `agent`.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para Strix Halo y Radeon AI PRO R9700, por lo que encaja en equipos con GPU AMD ROCm sin depender de CUDA ni de llama.cpp.
- Prototipado de asistentes multimodales en local: al ser un modelo de 4B en Q4_K_M, cabe en GPUs de 32 GB y permite iterar sobre prompts, plantillas de chat y modos de razonamiento sin coste de API.
- Generacion de codigo asistida dentro de pipelines: con tool calling y contexto largo, puede integrarse en flujos que consulten repositorios, ejecuten tests o consulten documentacion como herramientas externas.
- Extraccion de informacion estructurada de imagenes y texto: util para digitalizar facturas, tickets o formularios combinando OCR implicito (vision) y salida JSON via tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete esta dirigido a GPUs con al menos 32 GB (Radeon AI PRO R9700) y a la iGPU unificada de Strix Halo.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU consumer: no se documenta compatibilidad con GPUs consumer AMD o NVIDIA; el runtime Loom esta orientado a ROCm y a las arquitecturas gfx1151/gfx1201.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para descargar el paquete y `loom-serve` para servir la API. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Flags relevantes de despliegue: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`, `--materialize=copy`.
- Latencia y throughput: no disponibles; las mediciones estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.5-4B (este paquete Loom) | 4B | 262.144 | Si | Apache 2.0 | Loom (ROCm, gfx1151/gfx1201) |
| Qwen3.5-4B GGUF original (`ggml-org/Qwen3.5-4B-GGUF`) | 4B | no disponible | Si (con proyector) | Apache 2.0 | llama.cpp y derivados |
| Alternativas de 4B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva el paquete, ya que la informacion proporcionada no incluye datos de rendimiento ni de otros modelos comparables. No se dispone de cifras de benchmarks para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de evidencia empirica: todas las puertas de correccion y las mediciones de rendimiento frente a llama.cpp figuran como "not yet re-measured"; no hay garantia publicada de equivalencia numerica con la referencia.
- Modelo base de 4B: capacidad limitada frente a modelos mayores en razonamiento complejo, matematicas avanzadas y codigo de larga extension.
- Cuantizacion Q4_K_M: perdida de precision respecto a BF16/FP16; puede degradar tareas sensibles a matices.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue fuera del ingles sin evaluacion propia.
- Riesgo de alucinacion: inherente a modelos generativos de este tamano; el modo thinking activado por defecto puede aumentar la latencia y el consumo de tokens.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `Qwen3.5-4B` y del runtime Loom por separado.
- Dependencia de hardware especifico: el paquete esta generado para gfx1151 y gfx1201; no es portable a otras GPU sin regenerar los programas `.loom`.
- Runtime joven: `hrx-loom` en version 0.2.0 y `loom-next` como generador; menor madurez y comunidad que llama.cpp.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por defecto, lo que puede requerir ajuste para cargas de produccion.
- La busqueda web devuelve resultados no relacionados (Loom la app de grabacion de pantalla y Loom la marca de ropa); no aportan informacion tecnica sobre este paquete.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3.5-4B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3.5-4B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
