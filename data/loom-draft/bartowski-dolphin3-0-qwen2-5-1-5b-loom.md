# loom-draft/bartowski-Dolphin3.0-Qwen2.5-1.5B-loom

## Resumen
El paquete `loom-draft/bartowski-Dolphin3.0-Qwen2.5-1.5B-loom` es una distribucion empaquetada del checkpoint GGUF `Dolphin3.0-Qwen2.5-1.5B-Q4_K_M.gguf`, publicado por bartowski, preparada por el usuario `loom-draft` para el runtime Loom (ecosistema AMD HRX/ROCm). No se trata de un modelo nuevo: los pesos son los del checkpoint original sin modificar; lo que anade el paquete son programas `.loom`, un `model.json` y un tokenizador listos para ejecutarse con `loom-serve` sobre GPUs AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Dolphin 3.0 sobre Qwen2.5-1.5B, un transformer denso de 1.500 millones de parametros afinado por Cognitive Computations a partir de la familia Qwen2.5, con licencia Apache 2.0. El paquete fija el contexto a 32.768 tokens por peticion, admite 4 peticiones concurrentes, un maximo de 4.096 tokens de salida y expone una API compatible con OpenAI (`/v1/chat/completions`) con soporte de tool calling.

Su relevancia es acotada: no aporta mejoras de calidad respecto al GGUF original, sino una via de despliegue nativa en hardware AMD consumer y profesional mediante Loom, con un formato de paquete reproducible y verificable (hashes sha256 en `model.json.lock`). Es util para quien quiera servir el modelo en Strix Halo o R9700 sin pasar por llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5), pesos originales sin modificar; empaquetado para runtime Loom |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Dolphin3.0-Qwen2.5-1.5B-Q4_K_M.gguf`) mas programas `.loom` y `weights.loom` generados |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible OpenAI (`/v1/chat/completions`) |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Thinking / reasoning | No aplicable |
| Decodificacion especulativa | No aplicable |
| Entrada de imagen / audio | No aplicable |
| GPU objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento
El modelo subyacente es un transformer denso de la familia Qwen2.5 con 1.500 millones de parametros, afinado por Cognitive Computations en la linea Dolphin 3.0 a partir del checkpoint Qwen2.5-1.5B. La model card del paquete no documenta el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF, DPO u otras etapas de alineamiento; esa informacion corresponde al modelo original y no se incluye aqui.

La aportacion tecnica del paquete es de infraestructura, no de modelado. `loom-next` genera automaticamente los programas `.loom` y `weights.loom` a partir del GGUF y de `llm_config.json`, sin intervencion de un LLM en el bucle. El paquete fija el pool de memoria con `--pool_backing=fixed` y permite `--parameter_mode=preload` para precargar pesos en el host. La opcion `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU, lo que consume CPU mientras hay trabajo en vuelo. Incluye ademas una bateria de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) contra la referencia de llama.cpp.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles y otros idiomas (la lista concreta de idiomas no esta disponible en la informacion proporcionada).
- Razonamiento y respuesta a instrucciones heredados del afinado Dolphin 3.0 sobre Qwen2.5.
- Tool calling / function calling con esquema estilo OpenAI (`tools` y `tool_calls`), validado por la puerta `agent` del benchmark de Loom.
- Bucles de agente multi-turno con reutilizacion de historial y renderizado exacto del prompt (sujeto a las puertas `agent` y `agent_think_off`).
- Servicio HTTP compatible con OpenAI en `127.0.0.1:8080/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia verificada entre peticiones concurrentes y aisladas.
- Sin modo thinking, sin entrada de imagen, sin audio y sin decodificacion especulativa (marcados como no aplicables en la model card).
- Muestreo: la model card indica que el comportamiento de `temperature`, `top_k` y `seed` esta pendiente de determinacion («?»).

## Casos de uso
- Asistente conversacional local en estacion de trabajo AMD: servir el modelo con `loom-serve` en una Radeon AI PRO R9700 o un Strix Halo para un chatbot interno con contexto de hasta 32.768 tokens, sin depender de la nube.
- Prototipado de agentes con tool calling: usar la API compatible OpenAI para conectar el modelo a herramientas (busqueda, calculo, acceso a ficheros) en bucles multi-turno; la puerta `agent` de Loom valida el renderizado del prompt y la validez de las llamadas.
- Evaluacion de la pila Loom frente a llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `logits`, `decision`) que permiten comparar token a token la salida del runtime Loom contra la referencia de llama.cpp sobre el mismo GGUF.
- Pruebas de integracion en CI: al ser un paquete reproducible con hashes sha256 fijados en `model.json.lock`, sirve para validar regresiones del runtime o de los kernels generados en pipelines automatizados.
- Despliegue de bajo coste en hardware consumer: con 1.5B parametros en Q4_K_M, el modelo cabe holgadamente en GPUs de 32 GB y en iGPUs con memoria unificada, lo que permite ofrecer inferencia local a varios usuarios con 4 peticiones concurrentes.
- Generacion de texto y resumenes de documentos de hasta 32k tokens: gracias a la ventana de contexto por peticion, se pueden procesar articulos, informes o hilos de correo completos en una sola pasada.
- Base para fine-tuning o destilacion: al ser Apache 2.0 y partir de un checkpoint ampliamente usado (Qwen2.5-1.5B), sirve como punto de partida para ajustes especificos de dominio.

## Benchmarks y rendimiento
La model card del paquete no incluye resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) ni mediciones de rendimiento: tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201) indica explicitamente que «the results for this package are not yet re-measured». Todas las puertas de correccion aparecen como «not yet re-measured».

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el paquete se distribuye unicamente en Q4_K_M, lo que en un modelo de 1.5B ocupa del orden de 1 GB de pesos, mas overhead de contexto y pool de memoria del runtime.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no confirmada en la informacion proporcionada; el paquete esta generado y probado para las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa solo como referencia de correccion).
- Opciones de servicio relevantes: `--pool_backing=fixed` (pool de memoria fijo), `--parameter_mode=preload` (precarga de pesos en host), `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU).
- Latencia y throughput: no disponibles; la model card indica que las mediciones aun no se han repetido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Dolphin3.0-Qwen2.5-1.5B (Loom, este paquete) | 1.5B denso | 32.768 tokens | GGUF Q4_K_M + programas `.loom`, runtime Loom | Apache 2.0 | Solo GPUs AMD gfx1151 y gfx1201; sin benchmarks publicados |
| bartowski/Dolphin3.0-Qwen2.5-1.5B-GGUF (original) | 1.5B denso | no disponible en la informacion proporcionada | GGUF, multiples cuantizaciones | Apache 2.0 | Ejecutable con llama.cpp y derivados; referencia de correccion del paquete Loom |
| Qwen2.5-1.5B (base) | 1.5B denso | no disponible en la informacion proporcionada | safetensors, GGUF | Apache 2.0 | Modelo base sin el afinado Dolphin; comparacion cualitativa no disponible |
| Otros modelos de ~1.5B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias
- El paquete no modifica los pesos: cualquier sesgo, alucinacion o limitacion del checkpoint Dolphin3.0-Qwen2.5-1.5B original se hereda integramente.
- Modelo de 1.5B parametros: capacidad de razonamiento y conocimiento factual limitados en comparacion con modelos de mayor tamano; riesgo de alucinacion en dominios especializados.
- La lista de idiomas soportados no esta disponible en la informacion proporcionada; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- El contexto esta fijado a 32.768 tokens por peticion y la salida a 4.096 tokens; no se documenta configuracion alternativa.
- Concurrencia limitada a 4 peticiones simultaneas.
- No dispone de modo thinking, vision, audio ni decodificacion especulativa.
- El comportamiento del muestreo (`temperature`, `top_k`, `seed`) figura como no determinado («?») en la model card.
- La correccion frente a llama.cpp no esta verificada para este paquete: todas las puertas aparecen como «not yet re-measured», por lo que no hay evidencia registrada de equivalencia numerica.
- El rendimiento real en Strix Halo y R9700 no se ha medido para este paquete.
- Dependencia del runtime Loom (`hrx-loom==0.2.0`) y de GPUs AMD de las familias gfx1151/gfx1201; no se documenta soporte para NVIDIA ni para otras GPUs AMD.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion correspondiente.

## Enlaces
- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Dolphin3.0-Qwen2.5-1.5B-loom
- Checkpoint GGUF original: https://huggingface.co/bartowski/Dolphin3.0-Qwen2.5-1.5B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
