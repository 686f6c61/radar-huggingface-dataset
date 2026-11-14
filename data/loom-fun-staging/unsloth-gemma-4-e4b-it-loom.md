# loom-fun-staging/unsloth-gemma-4-E4B-it-loom

## Resumen

`loom-fun-staging/unsloth-gemma-4-E4B-it-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `unsloth/gemma-4-E4B-it-GGUF` en su cuantizacion `Q4_K_M`. El modelo subyacente es Gemma 4 E4B en su variante instruida (it), un modelo multimodal texto-imagen de Google distribuido originalmente por Unsloth en formato GGUF. Este repositorio no contiene pesos propios: es una capa de empaquetado y optimizacion de inferencia para hardware AMD concreto.

El objetivo del paquete es habilitar la inferencia del modelo sobre las GPU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime Loom, que expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, entrada de imagenes y decodificacion especulativa con un drafter auxiliar. Incluye gates de correccion (kernel_tests, golden, compare, vision, consistency) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF.

Es relevante para quienes operan inferencia local en hardware AMD de gama alta y buscan una alternativa a llama.cpp ROCm con decodificacion especulativa activada por defecto y validacion de equivalencia numerica. El repositorio es de staging (`loom-fun-staging`), sin descargas ni likes, creado el 14 de noviembre de 2026, y su tamano de repo registrado es 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E4B; arquitectura no detallada en la informacion) |
| Parametros totales | no disponible (denominacion E4B del modelo base; cifra no confirmada en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision `mmproj-F16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint `gemma-4-E4B-it-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Gemma 4 E4B ni su proceso de entrenamiento (composicion del dataset, numero de tokens, fases de RLHF/DPO). Lo que si se documenta es la capa de despliegue: Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 y sirve el GGUF original sin modificarlo, con un proyector de vision separado en F16 para la entrada de imagenes.

La innovacion tecnica destacable del paquete es la decodificacion especulativa mediante un drafter auxiliar (`AtomicChat/gemma-4-E4B-it-assistant-GGUF`) con profundidad 3, activada por defecto. La model card reporta tasas de aceptacion de tokens draft de 30 % en decodificacion de contexto corto, 36 % a 2k de contexto y 31 % a 32k. Tambien se documenta un modo de razonamiento (`enable_thinking`) desactivado por defecto y activable via `chat_template_kwargs`. El paquete incluye gates de correccion que comparan tokens greedy y top-5 log-probs contra una referencia de llama.cpp sobre el mismo GGUF, con divergencias tratadas como near-ties.

## Capacidades

- Generacion de texto y razonamiento con modo thinking opcional (`chat_template_kwargs: {"enable_thinking": true}`); desactivado por defecto.
- Entrada de imagenes multimodal (pipeline `image-text-to-text`), con partes `image_url` estilo OpenAI y proyector `mmproj-F16.gguf`.
- Tool calling estilo OpenAI: acepta `tools` y emite `tool_calls`.
- Decodificacion especulativa con drafter auxiliar, profundidad 3, activada por defecto.
- API compatible con OpenAI en `/v1/chat/completions`, escuchando en `127.0.0.1:8080`.
- Parametros de muestreo: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens (preset `max_tokens`).
- Audio de entrada y salida no soportado por Loom (aunque el modelo upstream lo tenga, segun la model card).
- Reasoning effort: no aplicable.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo admite 131.072 tokens por peticion, lo que permite mantener historiales extensos o adjuntar documentacion completa en una sola conversacion sin truncar.
- Procesamiento de documentos con imagenes: gracias al pipeline `image-text-to-text` y al proyector F16, se pueden enviar capturas, diagramas o paginas escaneadas junto con instrucciones de texto para extraccion o resumen.
- Automatizacion con herramientas: el soporte de `tools` y `tool_calls` estilo OpenAI permite integrar el modelo en flujos que consultan APIs externas, bases de datos o sistemas de ficheros desde un cliente compatible con OpenAI.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para Ryzen AI Max+ 395 (Strix Halo) y Radeon AI PRO R9700 de 32 GB, con un unico comando `loom-serve` y un presupuesto de memoria de 31.000.000.000 bytes.
- Servicio multi-cliente ligero: con 4 peticiones concurrentes y un agregado de decodificacion de hasta 266,7 tok/s en Strix Halo (techo roofline, sin drafting), es adecuado para equipos pequenos o entornos de desarrollo internos.
- Evaluacion y validacion de motores de inferencia: los gates de correccion (`golden`, `compare`, `vision`, `consistency`) permiten verificar que la salida de Loom coincide con la referencia de llama.cpp token a token, util para pipelines de CI que validen actualizaciones del runtime.
- Prototipado de agentes multi-paso: el modo thinking opcional y el tool calling permiten construir bucles de razonamiento con llamadas a herramientas, aunque el limite de 4.096 tokens de salida acota la longitud de cada respuesta.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa Loom vs llama.cpp ROCm para Strix Halo, pero las columnas de Loom y llama.cpp estan marcadas como no medidas ("—"). Solo se publican los valores de roofline (techo teorico del hardware a 216 GB/s y 59 TFLOP/s):

| Metrica | Roofline (Strix Halo) | Loom | llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 134,7 | no medido | no medido |
| Decode tok/s, contexto 2k | 144,1 | no medido | no medido |
| Decode tok/s, contexto 32k | 105,0 | no medido | no medido |
| Prefill tok/s, documento 1k | 7146,0 | no medido | no medido |
| Prefill tok/s, documento 2k | 7093,8 | no medido | no medido |
| Prefill tok/s, documento 8k | 6812,0 | no medido | no medido |
| Prefill tok/s, documento 16k | 6469,3 | no medido | no medido |
| Prefill tok/s, documento 32k | 5878,0 | no medido | no medido |
| 4 streams, decode agregado tok/s | 266,7 | no medido | no medido |
| Tokens draft aceptados (speculative) | n/a | 30 % (corto), 36 % (2k), 31 % (32k) | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados "no se han vuelto a medir todavia". No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el comando de servicio usa `--memory_bytes=31000000000` (aproximadamente 31 GB), valido tanto para Strix Halo como para Radeon AI PRO R9700 de 32 GB.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con GPU de consumo tipo RTX 4090 ni con CUDA; el paquete esta orientado a AMD via ROCm.
- Despliegue: runtime Loom (`pip install "hrx-loom[hf]==0.1.0"`), descarga con `loom-fetch` y servicio con `loom-serve`; API compatible con OpenAI en `127.0.0.1:8080`.
- Opciones alternativas de despliegue (llama.cpp, vLLM, Ollama, TGI) no se detallan para este paquete; llama.cpp ROCm aparece unicamente como referencia de comparacion.
- Latencia y throughput: solo se dispone de los techos roofline indicados en la seccion anterior; las cifras reales de Loom y llama.cpp no estan medidas en esta version del paquete.
- El flag `completion_spin_ns=4294967295` en la cadena de dispositivo indica espera activa (active wait) durante la generacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento medidos de este paquete frente a alternativas, por lo que la comparacion se limita a caracteristicas estructurales:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Runtime |
|---|---|---|---|---|---|
| gemma-4-E4B-it (este paquete, Q4_K_M) | no disponible | 131.072 | texto + imagen | Apache 2.0 | Loom (AMD gfx1151/gfx1201) |
| unsloth/gemma-4-E4B-it-GGUF (base) | no disponible | no disponible | texto + imagen | Apache 2.0 | llama.cpp y otros runners GGUF |
| AtomicChat/gemma-4-E4B-it-assistant-GGUF | no disponible (drafter) | no disponible | no disponible | no disponible | drafter para decodificacion especulativa |

No se identifican en la informacion proporcionada otros modelos de la misma categoria con datos comparables de rendimiento, contexto y licencia; la comparativa cuantitativa figura como no disponible.

## Limitaciones y advertencias

- Repositorio de staging: pertenece a la organizacion `loom-fun-staging`, con 0 descargas y 0 likes en el momento del registro; no debe tratarse como una publicacion estable.
- Los benchmarks de Loom y llama.cpp en Strix Halo estan sin medir; solo hay techos roofline. Las cifras de rendimiento real no estan disponibles.
- Los resultados para Radeon AI PRO R9700 no se han vuelto a medir; no hay datos de rendimiento para esa GPU.
- Los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) no se han vuelto a ejecutar sobre este paquete; el ultimo pase corresponde a una build anterior (sha256 `1ba4b24`).
- La metodologia de comparacion reconoce asimetrias: Loom usa drafting con profundidad 3 mientras llama.cpp ROCm no usa drafting en las filas de un solo stream, por lo que no es una comparacion equivalente.
- El limite de salida es de 4.096 tokens por peticion, lo que restringe respuestas largas y algunos flujos de agente.
- Audio no soportado por Loom, aunque el modelo upstream lo tenga.
- Idiomas soportados no documentados en la informacion disponible; no se puede confirmar cobertura multilingue.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 declarada en el repositorio; conviene verificar las condiciones del modelo base y del drafter auxiliar antes de uso comercial.
- Dependencia de hardware AMD especifico (gfx1151, gfx1201) y de la version `hrx-loom[hf]==0.1.0`; no se documenta portabilidad a otras plataformas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-gemma-4-E4B-it-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/AtomicChat/gemma-4-E4B-it-assistant-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
