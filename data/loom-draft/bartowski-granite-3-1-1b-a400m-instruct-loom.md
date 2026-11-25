# loom-draft/bartowski-granite-3.1-1b-a400m-instruct-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `granite-3.1-1b-a400m-instruct-Q4_K_M.gguf` de bartowski. El modelo subyacente es Granite 3.1 1B-A400M Instruct de IBM, un transformer denso de aproximadamente 1.000 millones de parametros totales con unos 400 millones activos en su configuracion, disenado para instrucciones y tareas de generacion de texto.

El paquete esta orientado especificamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), y expone una API compatible con OpenAI (`/v1/chat/completions`) mediante el servidor `loom-serve` del ecosistema HRX Loom. Su relevancia es de nicho: sirve como artefacto de referencia para ejecutar un GGUF cuantizado en Q4_K_M sobre hardware AMD con una pila de ejecucion propia, no como modelo de proposito general.

La informacion publicada es muy limitada: cero descargas, cero likes, sin pipeline declarado, sin idiomas declarados y con todas las puertas de correccion (kernel_tests, golden, compare, sampling, etc.) marcadas como "not yet re-measured". La licencia del paquete es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Granite 3.1 1B-A400M Instruct); el paquete es un artefacto de despliegue Loom, no una arquitectura nueva |
| Parametros totales | Aproximadamente 1.000 millones (segun el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens por peticion (declarado en la tarjeta) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Estilo OpenAI `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generacion | loom-next (generador, sin LLM en el bucle) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente es Granite 3.1 1B-A400M Instruct de IBM, un transformer denso de aproximadamente 1.000 millones de parametros. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; estos datos corresponden a la model card original de IBM, que no forma parte del material disponible.

Lo relevante tecnicamente de este repositorio es la capa de despliegue: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) y `weights.loom` a partir del GGUF de bartowski, junto con `tokenizer.json`, `llm_config.json` y `model.json` con hashes sha256 fijados que `loom-fetch` verifica. El servidor `loom-serve` admite opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `pool_backing=fixed` (pool de memoria precomprometido) y `parameter_mode=preload` (carga anticipada de pesos en host). No se declaran innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento; de hecho, la tabla de caracteristicas marca tool calling, reasoning, speculative decoding, image input y audio como "not applicable".

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Instrucciones de un solo turno y multiturno dentro de la ventana de contexto.
- Contexto de hasta 131.072 tokens por peticion, adecuado para documentos largos.
- Hasta 4 peticiones concurrentes con salida maxima de 4.096 tokens por peticion.
- Tool calling / function calling: no soportado ("not applicable" en la tarjeta).
- Razonamiento explicito o modo thinking: no soportado.
- Vision: no soportada. Audio: no soportado.
- Decodificacion especulativa: no soportada.
- Capacidades multilingues: no disponibles en la informacion.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tarjeta.

## Casos de uso

- Despliegue de referencia en hardware AMD Strix Halo: usar `loom-fetch` y `loom-serve` para levantar un endpoint compatible con OpenAI en un Ryzen AI Max+ 395, util para validar la pila HRX Loom en equipos de escritorio con GPU integrada.
- Pruebas de integracion en Radeon AI PRO R9700: servir el modelo en una GPU profesional de 32 GB para verificar flujos de trabajo con `pool_backing=fixed` y `parameter_mode=preload` antes de migrar a modelos mayores.
- Sustitucion de endpoint OpenAI en desarrollos internos: al exponer `/v1/chat/completions`, permite apuntar clientes existentes al servidor local sin cambiar el codigo de la aplicacion.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto por peticion, se pueden resumir o consultar documentos extensos sin salir del equipo, aunque la calidad real del modelo base de 1B limita la profundidad del razonamiento.
- Banco de pruebas de kernels generados: el paquete incluye compuertas de correccion (`kernel_tests`, `golden`, `compare`, `sampling`, `logits`) que sirven para validar la generacion automatica de kernels frente a la referencia de llama.cpp, aunque en esta publicacion todas aparecen sin re-medir.
- Escenarios de baja concurrencia con presupuesto de memoria ajustado: la cuantizacion Q4_K_M y el pool de memoria fijo permiten reservar recursos de forma determinista en entornos de demostracion o CI con hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las compuertas de correccion figuran como "not yet re-measured" o sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un GGUF Q4_K_M de un modelo de aproximadamente 1B parametros ocupa del orden de 0,7-1 GB en pesos, pero el pool de memoria real depende del preset de Loom y no se documenta.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se confirma compatibilidad con GPUs de consumo; solo se listan los dos aceleradores AMD anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete (llama.cpp solo aparece como referencia de correccion).
- Latencia y throughput: no disponibles; las mediciones de rendimiento no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/bartowski-granite-3.1-1b-a400m-instruct-loom | ~1B | 131.072 tokens | GGUF empaquetado en `.loom` | Apache 2.0 | Paquete de despliegue para AMD Strix Halo y R9700; sin benchmarks publicados |
| bartowski/granite-3.1-1b-a400m-instruct-GGUF | ~1B | No disponible en la informacion | GGUF | Apache 2.0 (heredada) | Checkpoint base sin empaquetar; ejecutable con llama.cpp y derivados |
| Granite 3.1 1B-A400M Instruct (IBM) | ~1B | No disponible en la informacion | safetensors y otros | Apache 2.0 | Modelo original; datos de entrenamiento y benchmarks no incluidos en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de aproximadamente 1B parametros: capacidad de razonamiento y conocimiento factual limitados en comparacion con modelos mayores; riesgo elevado de alucinacion en tareas de dominio especifico.
- Sin tool calling, sin modo de razonamiento, sin vision y sin audio: no apto para flujos agenticos ni multimodales.
- Idiomas soportados no declarados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles sin validacion previa.
- Sin benchmarks ni compuertas de correccion re-medidas: no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en esta publicacion.
- Estado de muestreo "not determined": el comportamiento de temperature, top_k y seed no esta verificado.
- Dependencia de hardware muy especifico (gfx1151 y gfx1201) y de la version `hrx-loom[hf]==0.2.0`; la compatibilidad con otras GPU AMD o con CUDA no se declara.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y del GGUF de origen deben verificarse en sus respectivos repositorios.
- Repositorio con cero descargas y cero likes: sin validacion por parte de la comunidad.
- El nombre "loom" puede confundirse con el servicio de grabacion de pantalla Loom; los resultados de busqueda web no aportan informacion tecnica sobre este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-granite-3.1-1b-a400m-instruct-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/granite-3.1-1b-a400m-instruct-GGUF
- Runtime HRX Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
