# loom-draft/bartowski-Dolphin3.0-Qwen2.5-3b-loom

## Resumen

`loom-draft/bartowski-Dolphin3.0-Qwen2.5-3b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Dolphin3.0-Qwen2.5-3b-Q4_K_M.gguf` de bartowski, a su vez derivado del modelo Dolphin 3.0 sobre Qwen2.5-3B. No se trata de un modelo nuevo ni de un fine-tuning: el autor (loom-draft) no altera los pesos, sino que genera los programas de inferencia necesarios para ejecutar ese GGUF sobre las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se realizó con la herramienta `loom-next`, según la model card sin ningún LLM en el bucle.

El interés del paquete es, por tanto, de infraestructura más que de modelado: permite servir un modelo conversacional de 3B parámetros cuantizado a Q4_K_M mediante una API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD con ROCm, usando el stack `hrx-loom` 0.2.0. El repositorio declara soporte de tool calling estilo OpenAI, una ventana de contexto de 32.768 tokens por petición, concurrencia de 4 peticiones y un máximo de 4.096 tokens de salida por preset.

La relevancia es acotada y experimental: el paquete tiene 0 descargas y 0 likes en el momento de la consulta, y la propia model card indica que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, entre otras) «no se han vuelto a medir» para este paquete en ninguna de las dos GPU objetivo. Es, en la práctica, un artefacto de borrador dentro del ecosistema Loom, no una distribución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base Qwen2.5-3B; el paquete Loom no la documenta) |
| Parametros totales | aproximadamente 3.000 millones (por el identificador del modelo base; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada; requiere consultar la licencia del modelo base) |
| Formato de pesos | GGUF (`Dolphin3.0-Qwen2.5-3b-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generacion | loom-next (sin LLM en el bucle) |
| Version del runtime | hrx-loom 0.2.0 |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre la arquitectura interna ni sobre el entrenamiento del modelo subyacente. Lo unico documentado es la cadena de derivacion: Dolphin 3.0 sobre Qwen2.5-3B, cuantizado a Q4_K_M por bartowski y empaquetado sin modificaciones por loom-draft. Cualquier dato sobre numero de tokens de entrenamiento, composicion del dataset, RLHF/DPO o innovaciones de atencion corresponde al modelo base y no se incluye en la informacion proporcionada.

La innovacion tecnica del artefacto es el propio formato Loom: la herramienta `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) y un fichero `weights.loom` a partir de la configuracion del modelo (`llm_config.json`), junto con el tokenizador (`tokenizer.json`) y un `model.json` con los ficheros fuente fijados por sha256. El despliegue se realiza con `loom-fetch` para materializar el paquete y `loom-serve` para servirlo, con opciones como `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, que consume CPU mientras hay trabajo en vuelo). Segun la model card, no hay decodificacion especulativa, modo de razonamiento ni entrada de imagen o audio en este paquete.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling / function calling estilo OpenAI, con campos `tools` y `tool_calls`.
- Bucles de agente con tool calling multi-turno (la model card incluye puertas de correccion especificas para `agent` y `agent_think_off`).
- Contexto de 32.768 tokens por peticion, suficiente para documentos largos o historiales extensos.
- Concurrencia de hasta 4 peticiones simultaneas con la puerta de consistencia declarada.
- Sin modo de razonamiento o «thinking» (marcado como no aplicable).
- Sin decodificacion especulativa (no aplicable).
- Sin entrada de imagen ni de audio (no aplicable).
- Soporte multilingue: no disponible en la informacion proporcionada.
- Comportamiento de muestreo (`temperature`, `top_k`, `seed`): marcado como «not determined» en la tabla de caracteristicas, aunque existe una puerta de correccion `sampling` pendiente de medicion.

## Casos de uso

- Asistente conversacional local sobre GPU AMD: el paquete permite levantar un endpoint `/v1/chat/completions` en una Radeon AI PRO R9700 o en un Ryzen AI Max+ 395 y consumirlo desde cualquier cliente compatible con OpenAI, sin depender de servicios en la nube.
- Agentes con herramientas en prototipos: el soporte de `tools` y `tool_calls` permite construir bucles de agente (consulta de APIs, calculo, recuperacion de datos) y validarlos contra las puertas `agent` del ecosistema Loom antes de llevarlos a produccion.
- Procesamiento de documentos de hasta 32k tokens: resumen, extraccion de entidades o preguntas y respuestas sobre contratos, informes o transcripciones que quepan en la ventana declarada.
- Evaluacion de hardware AMD con ROCm: util para comparar el rendimiento de `loom-serve` frente a llama.cpp sobre el mismo GGUF, una vez se publiquen las mediciones pendientes.
- Laboratorio de investigacion en inferencia: al ser un paquete generado por `loom-next` con puertas de correccion reproducibles (comparacion token a token contra llama.cpp, lectura de logits, consistencia bajo concurrencia), sirve para estudiar la fidelidad de kernels generados automaticamente.
- Generacion de codigo asistida en local: un modelo de 3B cuantizado a Q4_K_M es viable para autocompletado y explicacion de fragmentos en estaciones de trabajo con GPU AMD integrada, siempre que se acepte la calidad propia de ese tamano.
- Chat de soporte interno de bajo volumen: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, encaja en equipos pequenos o entornos de demostracion, no en atencion al cliente a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured». No se dispone de cifras de MMLU, HumanEval, GSM8K, latencia ni throughput para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un checkpoint de aproximadamente 3B parametros en Q4_K_M ocupa del orden de 2 GB de pesos, pero el pool de memoria real depende de la configuracion de `loom-serve` (`--pool_backing=fixed`) y del contexto solicitado, y no se documenta en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no disponible; el paquete solo lista hardware AMD profesional/integrado de gama alta y no menciona RTX 4090, A100 ni H100.
- Opciones de despliegue: `loom-fetch` + `loom-serve` del stack `hrx-loom[hf]==0.2.0` (instalable con pipx), con API compatible con OpenAI. El GGUF subyacente podria servirse con otras herramientas (llama.cpp, Ollama, vLLM), pero la informacion proporcionada no lo confirma para este artefacto.
- Latencia y throughput: no disponibles; las mediciones estan pendientes de repetir para ambas GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-draft/bartowski-Dolphin3.0-Qwen2.5-3b-loom | ~3B (segun base) | 32.768 tokens | Loom (.loom + GGUF Q4_K_M) | other | Hugging Face, 0 descargas |
| bartowski/Dolphin3.0-Qwen2.5-3b-GGUF | ~3B (segun base) | no disponible en la informacion proporcionada | GGUF (multiples cuantizaciones) | other | Hugging Face (modelo base directo) |
| Dolphin3.0-Qwen2.5-3b (modelo original) | ~3B | no disponible en la informacion proporcionada | safetensors (presumiblemente) | no disponible | no disponible en la informacion proporcionada |

La comparativa se limita a la cadena de derivacion porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoria. No es posible comparar calidad, latencia ni throughput con otras alternativas sin inventar cifras.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-19), sin evidencia de uso real.
- Sin mediciones de rendimiento ni de correccion: todas las puertas y las tablas de rendimiento figuran como «not yet re-measured» para ambas GPU objetivo.
- Dependencia de hardware muy especifico: solo se documenta para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay garantia de funcionamiento en otras GPU AMD, NVIDIA o CPU.
- Licencia «other»: es imprescindible revisar los terminos del modelo base (Dolphin 3.0 / Qwen2.5-3B) antes de cualquier uso comercial; la informacion proporcionada no aclara las condiciones.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Riesgo de alucinacion inherente a un modelo de ~3B parametros cuantizado a Q4_K_M; la cuantizacion puede degradar ligeramente la fidelidad respecto al checkpoint original.
- Muestreo no determinado: la tabla de caracteristicas marca la fila `sampling` como «?», por lo que el comportamiento de `temperature`, `top_k` y `seed` no esta verificado.
- Limites operativos fijos: 4 peticiones concurrentes y 4.096 tokens de salida maxima por preset, insuficientes para cargas de produccion de alto volumen.
- Sin modo de razonamiento, sin vision, sin audio y sin decodificacion especulativa: no apto para tareas que requieran estas capacidades.
- La busqueda web no devolvio informacion relevante sobre este modelo (los resultados corresponden a productos no relacionados); todos los datos proceden de la model card y de los metadatos de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Dolphin3.0-Qwen2.5-3b-loom
- Modelo base (GGUF de bartowski): https://huggingface.co/bartowski/Dolphin3.0-Qwen2.5-3b-GGUF
- Repositorio del stack Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
