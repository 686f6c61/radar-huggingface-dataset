# loom-fun-staging/ggml-org-Qwen2.5-VL-7B-Instruct-loom

## Resumen

`loom-fun-staging/ggml-org-Qwen2.5-VL-7B-Instruct-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf` de `ggml-org`. El modelo subyacente es Qwen2.5-VL-7B-Instruct, un transformer multimodal (texto e imagen) de 7 mil millones de parametros desarrollado por Alibaba Qwen, aqui cuantizado a Q4_K_M para inferencia en GPUs AMD.

El paquete esta generado con el flujo `loom-skills` y esta dirigido especificamente a dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Su relevancia es de nicho: demuestra que el stack Loom puede servir un modelo vision-lenguaje de 7B en hardware AMD consumer y profesional, con una API compatible con OpenAI y comparaciones de rendimiento frente a llama.cpp ROCm.

La ficha tecnica del modelo base (arquitectura, entrenamiento, benchmarks) no se detalla en la informacion proporcionada; los datos disponibles se centran en el empaquetado, el rendimiento medido en Strix Halo y las capacidades del servidor Loom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + lenguaje), modelo base Qwen2.5-VL-7B-Instruct; el detalle de capas y atencion no esta disponible en la informacion proporcionada |
| Parametros totales | 7B (segun el nombre del checkpoint base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en f16 (`mmproj-Qwen2.5-VL-7B-Instruct-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa Loom (`.loom`) con tarjeta `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-VL-7B-Instruct, un transformer multimodal de 7B parametros que procesa texto e imagenes. En este paquete concreto, los pesos se distribuyen como GGUF cuantizado a Q4_K_M, con un proyector de vision separado en f16 que se encarga de mapear las representaciones visuales al espacio del modelo de lenguaje. La informacion proporcionada no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion tecnica de este paquete no esta en el modelo, sino en el runtime: Loom compila y sirve el GGUF en GPUs AMD mediante kernels generados, expone una API estilo OpenAI (`/v1/chat/completions`) y soporta entrada de imagenes mediante partes `image_url`. El servidor admite 4 peticiones concurrentes, muestreo con `temperature`, `top_p`, `top_k` y `seed`, y un maximo de 4.096 tokens de salida por peticion. No hay decodificacion especulativa: el GGUF no incluye cabeza MTP y no se ha publicado un drafter para este modelo exacto.

## Capacidades

- Generacion de texto conversacional e instrucciones en formato chat (`-Instruct`).
- Comprension de imagenes: acepta partes `image_url` en peticiones estilo OpenAI, procesadas por el proyector `mmproj-Qwen2.5-VL-7B-Instruct-f16.gguf`.
- Respuesta multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Contexto largo de hasta 128.000 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Limite de salida de 4.096 tokens (preset `max_tokens`).
- Tool calling: no aplicable segun la model card.
- Razonamiento o thinking mode: no aplicable segun la model card.
- Entrada o salida de audio: no aplicable segun la model card.
- Decodificacion especulativa: no aplicable segun la model card.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos escaneados con contexto largo: el modelo puede recibir una imagen de pagina y un prompt extenso (hasta 128k tokens) para extraer campos, resumir o responder preguntas sobre el contenido, aprovechando la ventana de contexto completa.
- Descripcion y etiquetado de imagenes en lote: con 4 peticiones concurrentes y una API compatible con OpenAI, se puede montar un pipeline que clasifique o describa imagenes en un servidor AMD Radeon AI PRO R9700.
- Asistente visual en estacion de trabajo local: sobre un Ryzen AI Max+ 395, el paquete permite servir un VLM de 7B en el propio equipo sin depender de la nube, util para prototipos de privacidad o entornos sin conectividad.
- Preguntas y respuestas sobre capturas de pantalla o diagramas: el soporte de `image_url` permite enviar una captura y pedir explicaciones o extraccion de texto estructurado.
- Evaluacion comparativa de runtimes en AMD: el paquete incluye mediciones frente a llama.cpp ROCm, por lo que sirve para validar el rendimiento de Loom en gfx1151 o gfx1201 antes de adoptarlo en produccion.
- Backend de chat multimodal compatible con clientes OpenAI: cualquier cliente que hable el protocolo `/v1/chat/completions` puede apuntar a `127.0.0.1:8080` y usar el modelo sin cambios de codigo, lo que facilita integrarlo en herramientas existentes.

## Benchmarks y rendimiento

La model card solo publica cifras de roofline (techo teorico del hardware) para Strix Halo; las columnas de llama.cpp y Loom aparecen como no medidas ("—"). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 49,4 |
| Decode tok/s, contexto 2k | no medido | no medido | 48,2 |
| Decode tok/s, contexto 32k | no medido | no medido | 34,8 |
| Prefill tok/s, documento 1k | no medido | no medido | 4452,4 |
| Prefill tok/s, documento 2k | no medido | no medido | 4386,0 |
| Prefill tok/s, documento 8k | no medido | no medido | 4025,6 |
| Prefill tok/s, documento 16k | no medido | no medido | 3628,1 |
| Prefill tok/s, documento 32k | no medido | no medido | 3029,8 |
| 4 streams, decode agregado tok/s | no medido | no medido | 191,7 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

El roofline se calcula para el Ryzen AI Max+ 395 a 216 GB/s de ancho de banda y 59 TFLOP/s, segun `loom-roofline`. Para la Radeon AI PRO R9700 (gfx1201, 32 GB), la model card indica que los resultados "no se han vuelto a medir todavia".

## Requisitos de hardware

- VRAM estimada: el comando de servicio usa `--memory_bytes=21000000000` (aproximadamente 21 GB) tanto en Strix Halo como en R9700.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete esta pensado para el APU Strix Halo, no para GPUs NVIDIA consumer; no se documenta soporte para RTX 4090, A100 o H100.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch` y servicio con `loom-serve`; el servidor escucha en `127.0.0.1:8080`.
- Runtime alternativo: llama.cpp ROCm se usa como referencia de comparacion, pero no se registran sus argumentos de servidor.
- Latencia y throughput: solo se dispone de los valores roofline de la tabla anterior; las cifras reales de Loom y llama.cpp no se midieron en esta version del paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct (este paquete Loom) | 7B | 128k | si | no disponible | GGUF Q4_K_M + proyector f16 |
| ggml-org/Qwen2.5-VL-7B-Instruct-GGUF (base) | 7B | 128k (heredado) | si | no disponible | GGUF |
| llama.cpp ROCm (runtime de referencia) | n/a | n/a | si (mismo GGUF) | n/a | n/a |

No se dispone de datos de rendimiento de calidad ni de otros modelos comparables en la informacion proporcionada; la comparativa se limita al checkpoint base y al runtime de referencia.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de un uso comercial hay que verificar la licencia del modelo base Qwen2.5-VL-7B-Instruct.
- El paquete es un artefacto de despliegue, no un modelo nuevo: cualquier limitacion del checkpoint base (sesgos, alucinaciones, calidad en idiomas distintos del entrenado) se hereda sin cambios.
- Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) no se han vuelto a ejecutar en este paquete; la ultima pasada fue sobre una build anterior (sha256 `3924e0b`).
- Para la Radeon AI PRO R9700 no hay mediciones de rendimiento ni de correctitud.
- No hay soporte de tool calling, thinking mode, audio ni decodificacion especulativa.
- El limite de salida es de 4.096 tokens por peticion, independientemente de la ventana de contexto de 128k.
- El soporte de hardware esta restringido a las dos GPUs AMD indicadas; no se documenta compatibilidad con CUDA.
- El repositorio tiene 0 descargas y 0 likes, y esta en un espacio de staging (`loom-fun-staging`), lo que sugiere que no es un artefacto estable de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-Qwen2.5-VL-7B-Instruct-loom
- Checkpoint base GGUF: https://huggingface.co/ggml-org/Qwen2.5-VL-7B-Instruct-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
