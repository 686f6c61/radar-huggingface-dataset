# loom-draft/startlux-models-StartLux-Decision-v1.1-9B-AutoThink-loom

## Resumen

StartLux-Decision-v1.1-9B-AutoThink-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `startlux-models/StartLux-Decision-v1.1-9B-AutoThink-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado que permite servir el modelo original sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `loom-serve`, con una API compatible con OpenAI.

El modelo subyacente es un transformer de 9.000 millones de parametros segun indica su nombre, con capacidades multimodales de entrada de imagen y texto (pipeline `image-text-to-text`), un modo de razonamiento ("thinking") activado por defecto y desactivable por peticion, y soporte de tool calling al estilo OpenAI. El paquete expone una ventana de contexto de 262.144 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es acotada pero concreta: cubre el nicho de inferencia local en hardware AMD de consumo y estaciones de trabajo (APU Strix Halo y GPU R9700) mediante un runtime especifico del ecosistema ROCm/Loom, en lugar de las rutas habituales basadas en llama.cpp, vLLM o CUDA. La licencia es MIT. La model card no incluye resultados de rendimiento ni de correccion para este paquete: todas las puertas de validacion figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible); multimodal image-text-to-text con proyector `mmproj-StartLux-Decision-v1.1-9B-AutoThink-F16.gguf` |
| Parametros totales | 9B (segun denominacion del modelo; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); no se listan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como paquete Loom (`.loom` + `model.json`); proyector multimodal en GGUF F16 |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de lo inferible de su nombre y de la model card: un modelo de 9.000 millones de parametros con entrada multimodal (texto e imagen) y un modo de razonamiento explicito. El paquete Loom no altera los pesos: empaqueta el GGUF Q4_K_M original junto con kernels generados para las arquitecturas AMD objetivo, mediante la herramienta `loom-next` (generacion sin LLM en el bucle, segun el autor).

Tampoco se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El paquete declara explicitamente que la decodificacion especulativa no es aplicable y que el ajuste de "reasoning effort" tampoco lo es; el control disponible es unicamente el interruptor binario `enable_thinking` en `chat_template_kwargs`. Las puertas de validacion incluidas en la model card (comparacion token a token contra llama.cpp, pruebas de vision, consistencia bajo concurrencia, bucle de tool calling, muestreo y lectura de logits) estan definidas pero sin resultados: todas aparecen como "not yet re-measured" en ambas GPU.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento explicito ("thinking") activado por defecto, desactivable por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen ademas de texto (image-text-to-text), con soporte de partes `image_url` al estilo OpenAI y proyector multimodal F16 separado.
- Tool calling / function calling al estilo OpenAI: campos `tools` y `tool_calls` en la peticion y la respuesta.
- Flujos de agente multi-paso con bucle de tool calling, segun las puertas `agent` y `agent_think_off` definidas por el autor.
- Contexto largo de hasta 262.144 tokens por peticion.
- Servicio concurrente de hasta 4 peticiones.
- Sin soporte de audio (entrada ni salida). Sin decodificacion especulativa. Sin control granular de esfuerzo de razonamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local sobre hardware AMD: desplegando el paquete con `loom-serve` en una APU Strix Halo o una R9700, se obtiene un endpoint `/v1/chat/completions` compatible con OpenAI al que apuntar clientes existentes sin adaptadores propios, con contexto de hasta 262.144 tokens por peticion.
- Analisis de documentos e imagenes combinados: la entrada multimodal (`image_url`) junto con el contexto largo permite enviar capturas, diagramas o paginas escaneadas acompanadas de texto extenso en una sola peticion, util para extraccion de datos o resumen de informes.
- Automatizacion con herramientas: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs internas, bases de datos o sistemas de ticketing, con el modo thinking activado para planificacion y desactivado para pasos mecanicos de bajo coste.
- Razonamiento asistido en estacion de trabajo: con thinking activado por defecto, el modelo encaja en tareas de analisis paso a paso (depuracion de configuraciones, revision de planes) donde el usuario puede permitirse latencia a cambio de trazas de razonamiento.
- Prototipado en entornos sin CUDA: para equipos con hardware AMD, este paquete evita depender de la pila NVIDIA y permite validar aplicaciones LLM localmente antes de migrar a infraestructura mayor.
- Evaluacion comparativa de runtimes: las puertas de correccion definidas (comparacion token a token contra llama.cpp, consistencia bajo concurrencia, muestreo) sirven como base para validar el propio runtime Loom frente a llama.cpp sobre el mismo GGUF.
- Servicio de baja concurrencia en produccion interna: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, es adecuado para herramientas internas de equipo pequeno, no para cargas de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin medir en ambas GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de 9B, por lo que el peso de los pesos ronda los 5-6 GB, mas el proyector F16 y el pool de memoria del preset; el autor no publica cifras.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta generado solo para las dos arquitecturas AMD citadas. No se menciona soporte para GPU NVIDIA ni para otras Radeon.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch huggingface:loom-draft/startlux-models-StartLux-Decision-v1.1-9B-AutoThink-loom:chat --materialize=copy` y servicio con `loom-serve --model=... '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Notas de configuracion: `completion_spin_ns=4294967295` activa espera activa de finalizaciones en GPU (consume CPU mientras hay trabajo en vuelo); `--pool_backing=fixed` reserva el pool de memoria del preset por adelantado; `--parameter_mode=preload` solo cambia la carga de pesos en host.
- Latencia y throughput: no disponibles (no re-medidos).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas comparables de 9B multimodales, y el paquete Loom no publica cifras propias. La unica comparacion mencionada es metodologica: las puertas de correccion toman llama.cpp como referencia sobre el mismo GGUF, pero sin resultados publicados.

## Limitaciones y advertencias

- Paquete de despliegue, no modelo nuevo: cualquier evaluacion de calidad debe hacerse sobre el checkpoint base `startlux-models/StartLux-Decision-v1.1-9B-AutoThink-GGUF`, cuya model card no se incluye aqui.
- Cero validacion publicada: las puertas de correccion y rendimiento estan sin re-medir en ambas GPU; no hay garantia documentada de que la salida coincida con llama.cpp en este paquete.
- Cobertura de hardware muy estrecha: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). Sin soporte declarado para NVIDIA, otras Radeon ni CPU.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por preset; insuficiente para cargas de alta demanda o generaciones largas.
- Sin decodificacion especulativa ni control de esfuerzo de razonamiento; el unico control es activar o desactivar thinking.
- Idiomas soportados no documentados: no se puede asumir calidad en castellano ni en otros idiomas sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no documentados por el autor; aplican los del modelo base, que no se detallan.
- Madurez y adopcion: 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; sin senales de uso comunitario.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base por separado.
- Dependencia de una version fija del runtime (`hrx-loom[hf]==0.2.0`) y de un ecosistema (Loom) poco extendido.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/startlux-models-StartLux-Decision-v1.1-9B-AutoThink-loom
- Modelo base (GGUF): https://huggingface.co/startlux-models/StartLux-Decision-v1.1-9B-AutoThink-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
