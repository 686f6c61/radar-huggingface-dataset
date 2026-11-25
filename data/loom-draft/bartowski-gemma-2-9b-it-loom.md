# loom-draft/bartowski-gemma-2-9b-it-loom

## Resumen

`loom-draft/bartowski-gemma-2-9b-it-loom` es un paquete de despliegue para el runtime Loom de AMD, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `bartowski/gemma-2-9b-it-GGUF` (concretamente la variante `gemma-2-9b-it-Q4_K_M-fp16.gguf`) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` (sin LLM en el bucle). El objetivo es servir Gemma 2 9B Instruct sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Gemma 2 9B Instruct de Google DeepMind, un transformer decoder-only de aproximadamente 9.000 millones de parametros con atencion alternada local/global y destilacion de un modelo mayor durante el entrenamiento. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`) con un contexto de 8.192 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida.

Su relevancia es de nicho pero clara: permite ejecutar Gemma 2 9B cuantizado en Q4_K_M sobre hardware AMD de consumo y profesional sin pasar por llama.cpp, con verificacion de kernels y comparacion contra la referencia de llama.cpp previstas en su bateria de gates. En el momento de la ficha, el repositorio tiene 0 descargas, 0 likes y un tamano de 0,0 GB, y las mediciones de rendimiento y correccion figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), empaquetado como programas Loom para runtime propio |
| Parametros totales | ~9.000 millones (modelo base Gemma 2 9B Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por peticion (segun la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M con capa de salida en fp16 (`gemma-2-9b-it-Q4_K_M-fp16.gguf`) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base Gemma 2) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF de origen, transformado a `weights.loom` y programas `program/*.loom` |
| Modelo base | bartowski/gemma-2-9b-it-GGUF |
| Generador | loom-next (generador sin LLM en el bucle) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Concurrencia | 4 peticiones concurrentes |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Tool calling | no aplicable segun la tarjeta |
| Modo razonamiento | no aplicable |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen / audio | no aplicable |
| Muestreo | "not determined" en la tarjeta |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2 9B Instruct, un transformer decoder-only de Google DeepMind con atencion alternada entre capas locales y globales, disenado para reducir el coste de atencion en contexto largo. Se entreno con destilacion de conocimiento desde un modelo Gemma 2 de mayor tamano y se ajusto con tecnicas de alineacion (RLHF) para seguir instrucciones. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion del dataset.

El paquete Loom no reentrena ni modifica los pesos: toma el GGUF de bartowski y genera kernels y programas especificos para las arquitecturas AMD gfx1151 y gfx1201. La tarjeta describe una bateria de gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, con tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k. En la version publicada, todos los gates figuran como "not yet re-measured", por lo que no hay evidencia registrada de correccion en esta ficha.

El despliegue usa `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de completaciones en GPU), `--pool_backing=fixed` (pool de memoria reservado por adelantado) y `--parameter_mode=preload` (carga de pesos en host). La descarga del paquete se hace con `loom-fetch` usando `--materialize=copy` y verificacion sha256 de los ficheros fijados en `model.json.lock`.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Instrucciones y dialogo en el estilo de Gemma 2 9B Instruct (modelo base de Google DeepMind).
- Contexto de 8.192 tokens por peticion, suficiente para conversaciones largas y documentos medianos.
- Hasta 4 peticiones concurrentes servidas por el mismo proceso `loom-serve`.
- Salida de hasta 4.096 tokens por respuesta (limite del preset).
- Tool calling: no soportado segun la tarjeta ("not applicable").
- Razonamiento / thinking mode: no soportado ("not applicable").
- Decodificacion especulativa: no soportada ("not applicable").
- Entrada de imagen o audio: no soportada ("not applicable").
- Muestreo (temperature, top_k, seed): estado "not determined" en la tarjeta.
- Capacidades multilingues: no documentadas en la informacion disponible; dependen del modelo base.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: servir Gemma 2 9B Instruct en una Radeon AI PRO R9700 o en una APU Strix Halo mediante `loom-serve` y consumirlo con cualquier cliente compatible con la API de OpenAI, sin dependencia de CUDA ni de llama.cpp.
- Prototipado de aplicaciones de chat sobre hardware AMD: el endpoint `http://127.0.0.1:8080/v1/chat/completions` permite integrar el modelo en frameworks que ya hablan el protocolo OpenAI, con contexto de 8.192 tokens por peticion.
- Evaluacion de runtimes alternativos: util para comparar el rendimiento y la correccion de Loom frente a llama.cpp sobre el mismo GGUF, usando los gates de la tarjeta (`golden`, `compare`, `logits`) cuando esten registrados.
- Procesamiento de documentos de extension media: resumen, extraccion y reescritura de textos de hasta ~8k tokens en un solo turno, adecuado para informes, correos largos o transcripciones.
- Generacion de texto en entornos con GPU AMD de 32 GB: la Radeon AI PRO R9700 permite mantener el modelo Q4_K_M en memoria dedicada y servir hasta 4 peticiones concurrentes.
- Laboratorio y docencia: desplegar un modelo de 9B en una APU Strix Halo para practicas de inferencia local, con instrucciones de instalacion reproducibles (`pipx install "hrx-loom[hf]==0.2.0"`).
- Base para experimentos de cuantizacion: al estar empaquetado desde un GGUF Q4_K_M concreto, sirve como referencia para medir el impacto de la cuantizacion en la calidad de salida frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todos los gates de correccion figuran como "not yet re-measured".

| Metrica | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| Rendimiento vs llama.cpp | no medido | no medido |
| `kernel_tests` | no medido | no medido |
| `golden` | no medido | no medido |
| `compare` | no medido | no medido |
| `consistency` | no medido | no medido |
| `sampling` | no medido | no medido |
| `logits` | no medido | no medido |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la tarjeta. Un Gemma 2 9B en Q4_K_M ocupa del orden de 5-6 GB de pesos, mas overhead de contexto y buffers del runtime; el paquete esta pensado para GPUs de 32 GB (R9700) y para la memoria unificada de Strix Halo.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU en la informacion disponible.
- GPU de consumo: no se indica compatibilidad con GPUs consumer AMD o NVIDIA; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Opciones de despliegue: `loom-fetch` para descargar el paquete y `loom-serve` para servirlo, con `hrx-loom[hf]==0.2.0` instalado via pipx. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en este paquete.
- Latencia y throughput: no disponibles; las mediciones de rendimiento no se han vuelto a realizar segun la tarjeta.
- Configuracion de servido: `--pool_backing=fixed` y `--parameter_mode=preload`; `completion_spin_ns=4294967295` activa espera activa de completaciones en GPU (consume CPU mientras hay trabajo en vuelo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-draft/bartowski-gemma-2-9b-it-loom | ~9B | 8.192 tokens por peticion | GGUF empaquetado en `.loom`, runtime Loom | Gemma | Hugging Face, 0 descargas |
| bartowski/gemma-2-9b-it-GGUF | ~9B | segun configuracion del runtime (Gemma 2 soporta hasta 8k) | GGUF para llama.cpp y derivados | Gemma | Hugging Face, ampliamente usado |
| google/gemma-2-9b-it | ~9B | 8.192 tokens | safetensors para transformers | Gemma | Hugging Face, modelo oficial |

La comparativa se limita al mismo modelo base en distintos formatos, ya que no se dispone de datos de rendimiento del paquete Loom frente a alternativas. Las diferencias practicas son el runtime (Loom frente a llama.cpp o transformers), el hardware objetivo (GPUs AMD gfx1151/gfx1201 frente a soporte mas amplio) y la madurez (el paquete Loom no tiene mediciones ni gates registrados).

## Limitaciones y advertencias

- Paquete sin evidencia de correccion: todos los gates de la tarjeta figuran como "not yet re-measured"; no hay comparacion registrada contra la referencia de llama.cpp.
- Rendimiento no medido: no hay cifras de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la ficha, con un tamano de 0,0 GB, lo que sugiere que los artefactos pueden no estar materializados o que el paquete es un borrador.
- Tool calling, modo razonamiento, decodificacion especulativa y entrada multimodal no estan soportados segun la tarjeta ("not applicable").
- Contexto limitado a 8.192 tokens por peticion, inferior al que ofrecen otros despliegues de Gemma 2 con extension de contexto.
- Muestreo no determinado: temperature, top_k y seed no estan verificados, lo que afecta a la reproducibilidad en produccion.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Google, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de desplegar.
- Riesgo de alucinacion y sesgos: inherentes al modelo base Gemma 2 9B Instruct; no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Idiomas soportados no documentados en la tarjeta; dependen del modelo base y no hay evaluacion especifica.
- Hardware restringido: el paquete esta generado para gfx1151 y gfx1201; no se garantiza funcionamiento en otras GPUs.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`) y de la herramienta `loom-next` para regenerar los programas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-gemma-2-9b-it-loom
- Modelo base GGUF: https://huggingface.co/bartowski/gemma-2-9b-it-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
