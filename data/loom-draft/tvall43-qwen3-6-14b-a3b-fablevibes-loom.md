# loom-draft/tvall43-Qwen3.6-14B-A3B-FableVibes-loom

## Resumen

`loom-draft/tvall43-Qwen3.6-14B-A3B-FableVibes-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `tvall43/Qwen3.6-14B-A3B-FableVibes-GGUF`, en su cuantizacion Q4_K_M. No se trata de un modelo nuevo: es un artefacto de empaquetado orientado a ejecutar ese GGUF sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el runtime `loom-serve` del ecosistema Loom. El autor del paquete es `loom-draft` y la generacion se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle segun la model card.

El modelo subyacente, por su nomenclatura, corresponde a la familia Qwen3.6 en una variante de 14B con 3B de parametros activos (patron MoE "A3B") y capacidades multimodales de entrada de imagen, aunque la informacion proporcionada no incluye la model card del checkpoint original ni sus especificaciones verificadas. El paquete declara soporte de API compatible con OpenAI, tool calling, modo de razonamiento activable, entrada de imagen mediante proyector multimodal y una ventana de contexto de 262.144 tokens por peticion con 4 peticiones concurrentes.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas, 0 likes, 0,0 GB de tamano y fue creado el 2026-11-19, lo que sugiere un artefacto de prueba o borrador. Las mediciones de rendimiento y las puertas de correccion de la model card figuran como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia publicada de rendimiento ni de equivalencia numerica frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.6; variante MoE segun nomenclatura A3B) |
| Parametros totales | 14B (segun nombre del modelo base; no verificado en la informacion) |
| Parametros activos | 3B (segun sufijo A3B; no verificado en la informacion) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.6-14B-A3B-FableVibes-Q4_K_M.gguf`) + proyector `Qwen3.6-14B-A3B-FableVibes-mmproj-F16.gguf`; paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se detalla si emplea attention lineal, decodificacion especulativa ni la composicion del dataset de entrenamiento. La model card del paquete Loom unicamente indica que el checkpoint GGUF se usa "sin modificar" y que el trabajo del autor consiste en generar los programas `.loom` y la tarjeta `model.json` mediante `loom-next`, el generador del ecosistema Loom. El sufijo "A3B" en el nombre es consistente con un diseno de mezcla de expertos con aproximadamente 3.000 millones de parametros activos, pero no se aporta confirmacion tecnica ni numero de expertos.

En el plano de despliegue, el paquete incorpora un proyector multimodal separado (`-mmproj-F16.gguf`) para la entrada de imagen y expone un modo de razonamiento activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`. La model card declara explicitamente que la decodificacion especulativa y el "reasoning effort" no aplican a este preset. No se proporcionan datos sobre RLHF, DPO ni fases de alineamiento del checkpoint original.

## Capacidades

- Generacion de texto conversacional multi-turno a traves de un endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Entrada de imagen en formato `image_url` al estilo OpenAI, con proyector multimodal F16 dedicado (pipeline `image-text-to-text`).
- Tool calling con esquema OpenAI (`tools` y `tool_calls`), incluyendo bucles de agente multi-turno segun las puertas de correccion declaradas.
- Modo de razonamiento ("thinking") activado por defecto y desactivable por peticion.
- Contexto largo de hasta 262.144 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de 4 peticiones simultaneas con la misma salida que en ejecucion aislada (segun la puerta `consistency`, pendiente de re-medicion).
- Sin soporte de audio ni de salida de audio (marcado como "not applicable").
- Sin decodificacion especulativa ni control de esfuerzo de razonamiento.
- Idiomas soportados: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en local: con 262.144 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola llamada sobre una GPU de escritorio AMD, sin depender de servicios en la nube.
- Procesamiento de imagenes en flujos documentales: la entrada `image_url` con proyector F16 permite extraer y razonar sobre capturas, diagramas o paginas escaneadas dentro de la misma conversacion.
- Agentes con herramientas en estaciones de trabajo AMD: el soporte de `tools`/`tool_calls` y las puertas `agent` y `agent_think_off` estan pensados para bucles de varias etapas con renderizado exacto del historial y reutilizacion de contexto.
- Asistente de codigo en local: el modo thinking permite cadenas de razonamiento antes de responder, util para explicar parches o generar tests, siempre que se valide la calidad real del checkpoint base.
- Despliegue en hardware de consumo profesional: el paquete esta orientado a Strix Halo (APU con memoria unificada) y a la Radeon AI PRO R9700 de 32 GB, lo que facilita prototipos en equipos sin GPUs NVIDIA.
- Evaluacion comparativa de runtimes: las puertas de correccion (`golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) permiten usar este paquete como banco de pruebas de `loom-serve` frente a llama.cpp con el mismo GGUF.
- Servicio interno de chat con API compatible con OpenAI: al exponer `/v1/chat/completions`, se puede integrar con clientes y orquestadores existentes sin adaptadores propietarios, limitado a 4 peticiones concurrentes y 4.096 tokens de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento frente a llama.cpp para este paquete "not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin ejecucion registrada. No se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 14B, y el proyector multimodal es F16. La Radeon AI PRO R9700 objetivo tiene 32 GB.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no se mencionan como objetivo del paquete Loom; el runtime es especifico del ecosistema AMD/ROCm descrito.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/tvall43-Qwen3.6-14B-A3B-FableVibes-loom:chat --materialize=copy --output=qwen3.6-14b-a3b-fablevibes` y `loom-serve --model=qwen3.6-14b-a3b-fablevibes '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Opciones alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el GGUF base es teoricamente consumible por llama.cpp, pero la model card no lo certifica para este artefacto.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han re-medido. El flag `completion_spin_ns=4294967295` activa espera activa en CPU durante los trabajos de GPU, lo que consume CPU a cambio de menor latencia de finalizacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas comparables, y el artefacto es un paquete de despliegue especifico de AMD Loom mas que un modelo con benchmarks propios. Como referencia estructural, se puede contrastar con el checkpoint del que deriva:

| Aspecto | Este paquete (Loom) | `tvall43/Qwen3.6-14B-A3B-FableVibes-GGUF` |
|---|---|---|
| Naturaleza | Paquete de despliegue (`.loom` + `model.json`) | Checkpoint GGUF |
| Pesos | Copia del GGUF Q4_K_M sin modificar | GGUF Q4_K_M |
| Runtime | `loom-serve` (AMD gfx1151 / gfx1201) | Cualquier runtime compatible con GGUF (no certificado aqui) |
| Contexto declarado | 262.144 tokens por peticion | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 (segun metadatos del paquete) |
| Benchmarks publicados | Ninguno (puertas sin re-medir) | no disponible |

## Limitaciones y advertencias

- Artefacto sin validacion publicada: 0 descargas, 0 likes, repositorio de 0,0 GB y todas las puertas de correccion y rendimiento sin re-medir; no hay evidencia de que la salida coincida con llama.cpp.
- El repositorio aparenta estar incompleto o en borrador: el listado de ficheros de la model card se corta en `model.json` / `model.json.lo`, y el tamano declarado de 0,0 GB no es coherente con un GGUF Q4_K_M de un modelo de 14B.
- Dependencia de un runtime joven y especifico (`hrx-loom==0.2.0`) y de dos GPUs AMD concretas; no hay soporte declarado para NVIDIA ni para otros aceleradores.
- Limites operativos fijos: 4 peticiones concurrentes y 4.096 tokens de salida maxima por peticion.
- Sin decodificacion especulativa ni control de esfuerzo de razonamiento, lo que limita las optimizaciones de latencia disponibles.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion proporcionada; al ser un finetune comunitario ("FableVibes") sobre un modelo base no identificado con detalle, la calidad real del checkpoint es desconocida.
- Idiomas soportados no declarados; no se puede garantizar un comportamiento correcto en castellano sin evaluacion previa.
- Licencia Apache 2.0 declarada, que en principio permite uso comercial, pero se aplica al paquete y no se acompana de la licencia verificada del checkpoint base ni de los terminos del runtime Loom.
- El nombre "Loom" coincide con el servicio comercial de grabacion de pantalla; los resultados de busqueda web obtenidos no son relevantes para este modelo y no aportan documentacion tecnica adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/tvall43-Qwen3.6-14B-A3B-FableVibes-loom
- Checkpoint base GGUF: https://huggingface.co/tvall43/Qwen3.6-14B-A3B-FableVibes-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Resultados de busqueda web: no relevantes (corresponden al servicio de grabacion de pantalla Loom y a la marca de ropa Loom; no aportan informacion sobre este modelo).
