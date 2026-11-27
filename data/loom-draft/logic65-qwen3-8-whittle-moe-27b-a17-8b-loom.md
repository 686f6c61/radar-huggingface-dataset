# loom-draft/logic65-Qwen3.8-Whittle-MoE-27B-A17.8B-loom

## Resumen

El modelo `loom-draft/logic65-Qwen3.8-Whittle-MoE-27B-A17.8B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF`, en su variante `Whittle-MoE-27B-A18B-v2.2.1-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta pensado para ejecutarse sobre las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU de escritorio AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo entrenado desde cero, sino de un artefacto de empaquetado generado con `loom-next` para servir el GGUF original mediante el runtime `loom-serve` del ecosistema Loom.

El modelo subyacente es un Mixture of Experts (MoE) de 27B parametros totales con 17,8B parametros activos por token, segun se deduce de la nomenclatura "27B-A17.8B". El paquete anade capacidades de servidor: API compatible con OpenAI, tool calling, modo de razonamiento opcional con niveles de esfuerzo (`low`, `medium`, `xhigh`), entrada de imagenes via proyector multimodal `mmproj-qwen38.gguf` y una ventana de contexto de 262.144 tokens por peticion con hasta 4 peticiones concurrentes.

Su relevancia actual radica en que permite ejecutar un MoE multimodal de ~27B en hardware AMD consumer y de estacion de trabajo sin CUDA, usando el stack ROCm/HIP a traves de Loom. La licencia es MIT. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB (probablemente porque los pesos se materializan al vuelo desde el GGUF base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer; detalles de capas y atencion no disponibles |
| Parametros totales | 27B (segun nomenclatura del modelo base) |
| Parametros activos | 17,8B (segun nomenclatura del modelo base) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Whittle-MoE-27B-A18B-v2.2.1-Q4_K_M.gguf`) + paquete Loom (`.loom`, `model.json`); proyector `mmproj-qwen38.gguf` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF` mas alla de que es un Mixture of Experts con 27B parametros totales y 17,8B activos. El nombre sugiere una base derivada de la familia Qwen3.8 con una modificacion o fine-tuning denominado "Whittle", pero no se proporcionan datos sobre numero de capas, dimensiones ocultas, numero de expertos, mecanismo de atencion ni estrategia de enrutamiento. Tampoco se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares.

El componente diferencial de este repositorio no es el entrenamiento sino el empaquetado: los programas `.loom` y el `model.json` se generan con `loom-next` (el generador, sin LLM en el bucle) para compilar kernels especificos del hardware AMD objetivo y servir el GGUF sin modificarlo. El paquete incluye un proyector multimodal (`mmproj-qwen38.gguf`) para entrada de imagenes y soporta decodificacion especulativa desactivada ("not applicable"). El runtime `loom-serve` permite ajustar el comportamiento de espera activa en la GPU (`completion_spin_ns`), el tipo de reserva de memoria (`pool_backing=fixed`) y el modo de carga de pesos en host (`parameter_mode=preload`).

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Niveles de esfuerzo de razonamiento configurables: `low`, `medium`, `xhigh` (por defecto `xhigh`).
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`), incluyendo bucles multi-turno de agentes.
- Entrada de imagenes (image-text-to-text) mediante partes `image_url` de estilo OpenAI y el proyector `mmproj-qwen38.gguf`.
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos y conversaciones extensas.
- Hasta 4 peticiones concurrentes por instancia de servidor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Entrada o salida de audio: no determinado.
- Decodificacion especulativa: no aplicable en este paquete.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con historial largo gracias a su ventana de 262.144 tokens, manteniendo el contexto de toda la interaccion sin truncamientos agresivos, y exponiendo tool calling para consultar sistemas de ticketing o CRM.
- **Analisis de documentos extensos con imagenes**: con 262k tokens de contexto y entrada multimodal, se puede enviar un informe escaneado junto con su transcripcion y preguntar por detalles concretos, ya que el proyector `mmproj-qwen38.gguf` permite adjuntar paginas como imagenes.
- **Agentes de codigo en local**: el soporte de tool calling y de bucles de agente multi-turno permite integrar el modelo en un flujo que lea ficheros, ejecute tests y aplique parches, ejecutandose en una estacion de trabajo con Radeon AI PRO R9700 sin depender de la nube.
- **Asistente de razonamiento con esfuerzo ajustable**: para tareas de matematicas o logica se puede fijar `reasoning_effort: xhigh`; para clasificacion o extraccion rapida, `low`, reduciendo el coste de generacion en el mismo despliegue.
- **Despliegue en hardware AMD sin CUDA**: equipos con Ryzen AI Max+ 395 "Strix Halo" pueden servir el modelo mediante `loom-serve` con API compatible con OpenAI, util para prototipos y demos en portatiles o mini-PC con GPU integrada.
- **Procesamiento por lotes con concurrencia moderada**: con 4 peticiones concurrentes por instancia, es viable montar un pequeno servicio interno de resumen, extraccion de entidades o generacion de respuestas sobre colas de documentos.
- **Evaluacion y comparacion de runtimes**: el paquete incluye gates de correccion (`golden`, `compare`, `vision`, `agent`, `sampling`, `logits`, etc.) que permiten validar la fidelidad del runtime Loom frente a llama.cpp sobre el mismo GGUF, util para equipos que evaluan ROCm frente a otras alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita. El modelo base esta en cuantizacion Q4_K_M con 27B parametros totales y 17,8B activos; el paquete esta disenado para ejecutarse en la Radeon AI PRO R9700 de 32 GB y en la GPU integrada del Ryzen AI Max+ 395, que comparte memoria del sistema.
- **GPU objetivo**: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPU NVIDIA ni otras arquitecturas.
- **Compatibilidad con GPU consumer**: si, segun el autor, en la GPU integrada del Ryzen AI Max+ 395; no se confirma compatibilidad con GPUs consumer NVIDIA o AMD de gama baja.
- **Despliegue**: runtime `loom-serve` del ecosistema Loom, instalado via `pipx install "hrx-loom[hf]==0.2.0"`; flujo con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Expone API OpenAI en `http://127.0.0.1:8080/v1/chat/completions`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI en este paquete concreto (aunque el GGUF base es compatible con llama.cpp por formato).
- **Opciones de servicio**: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa en GPU), `--pool_backing=fixed` (reserva de memoria fija) y `--parameter_mode=preload` (carga de pesos en host anticipada).
- **Latencia y throughput**: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de este paquete, por lo que la comparativa se limita a caracteristicas estructurales. Las alternativas indicadas son referencias genericas de la misma categoria (MoE de ~27B con contexto largo); los datos de las alternativas no provienen de la informacion proporcionada y deben verificarse en sus respectivas fichas.

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| logic65-Qwen3.8-Whittle-MoE-27B-A17.8B (este paquete) | 27B / 17,8B | 262.144 tokens | MIT | GGUF Q4_K_M + runtime Loom (AMD gfx1151, gfx1201) | Multimodal (image input), tool calling, thinking mode |
| MoE de ~27B con ~17B activos de la familia Qwen (referencia generica) | ~27B / ~17B | no disponible | no disponible | GGUF, safetensors | No se dispone de datos verificados en esta ficha |
| MoE de ~30B con ~3B activos (referencia generica de la categoria) | ~30B / ~3B | no disponible | no disponible | GGUF, safetensors | Menor coste por token, mayor dependencia del enrutamiento |
| Modelo denso de ~27B (referencia generica) | 27B / 27B | no disponible | no disponible | GGUF, safetensors | Mayor coste de inferencia por token que un MoE equivalente |

## Limitaciones y advertencias

- **Sin mediciones publicadas**: todas las gates de correccion y las comparativas de rendimiento frente a llama.cpp figuran como "not yet re-measured" en ambas plataformas; no hay evidencia publicada de fidelidad numerica ni de throughput.
- **Alcance de hardware muy restringido**: el paquete esta generado especificamente para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se garantiza su funcionamiento en otras GPU AMD ni en NVIDIA.
- **Riesgo de alucinacion**: no evaluado en la informacion disponible; como modelo generativo, es esperable en tareas de conocimiento factual, pero no hay datos concretos.
- **Sesgos**: no documentados en la informacion proporcionada.
- **Idiomas**: no se especifican los idiomas soportados ni la calidad por idioma; no se puede confirmar un buen rendimiento en castellano.
- **Licencia**: MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base `logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF` y de la familia Qwen subyacente antes de un despliegue en produccion.
- **Concurrencia limitada**: 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por peticion en el preset; para cargas mayores habria que escalar horizontalmente.
- **Estado del repositorio**: 0 descargas y 0 likes, creado y actualizado el 2026-11-26; no hay senales de uso comunitario ni de mantenimiento continuado.
- **Dependencia del runtime Loom**: requiere `hrx-loom[hf]==0.2.0` y el ecosistema `loom-fetch`/`loom-serve`; no es un artefacto portable a otros servidores sin conversion.
- **Entrada de audio**: estado "no determinado"; no asumir soporte.
- **Decodificacion especulativa**: no aplicable, por lo que no se puede aprovechar esa aceleracion en este paquete.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/loom-draft/logic65-Qwen3.8-Whittle-MoE-27B-A17.8B-loom
- Modelo base GGUF: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF
- Repositorio del runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios y productos no relacionados (Loom.com, Loom.fr, Wikipedia sobre telares).
