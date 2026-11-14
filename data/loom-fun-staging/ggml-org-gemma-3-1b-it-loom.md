# loom-fun-staging/ggml-org-gemma-3-1b-it-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` y un fichero `model.json`) que empaqueta el checkpoint GGUF `gemma-3-1b-it-Q4_K_M.gguf` de `ggml-org/gemma-3-1b-it-GGUF` sin modificar sus pesos. El autor del repositorio es `loom-fun-staging`, dentro del ecosistema Loom de AMD (repositorio `ROCm/hrx-system` y flujo de trabajo `loom-skills`), y su objetivo es ejecutar Gemma 3 1B Instruct sobre las GPU integradas AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el servidor `loom-serve`.

El modelo subyacente es Gemma 3 1B Instruct, un transformer decoder-only de Google con aproximadamente 1.000 millones de parámetros, ajustado con instrucciones y cuantizado a Q4_K_M. Loom aporta kernels generados específicamente para las arquitecturas AMD citadas y una API compatible con OpenAI (`/v1/chat/completions`), de modo que el valor diferencial del paquete está en el motor de inferencia y en la portabilidad del artefacto, no en el modelo en sí.

Es relevante ahora porque demuestra la viabilidad de servir modelos pequeños en hardware AMD de consumo y estación de trabajo sin depender de CUDA, con métricas de roofline publicadas para Strix Halo (216 GB/s de ancho de banda y 59 TFLOP/s) y una ventana de contexto de 32.768 tokens por petición. No obstante, el repositorio está vacío (0,0 GB), no registra descargas ni likes, y las tablas de rendimiento y corrección del model card tienen los valores de Loom y de llama.cpp sin rellenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), empaquetado como paquete Loom sobre GGUF |
| Parametros totales | ~1.000 millones (Gemma 3 1B Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por petición (límite del servidor Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible (los idiomas del modelo base no se detallan en la información proporcionada) |
| Licencia | Gemma (términos de uso de Google Gemma) |
| Formato de pesos | GGUF (`gemma-3-1b-it-Q4_K_M.gguf`) más artefactos `.loom` y `model.json` |
| Modelo base | ggml-org/gemma-3-1b-it-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Servidor | `loom-serve`, API OpenAI en `127.0.0.1:8080` |
| Concurrencia | 4 peticiones simultáneas |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Muestreo | `temperature`, `top_p`, `top_k`, `seed` |
| Memoria reservada | `--memory_bytes=7000000000` (7 GB) en los comandos de ejemplo |
| Tamaño del repo | 0,0 GB |
| Fecha de creación | 2026-11-14 |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 1B Instruct de Google, un transformer decoder-only de aproximadamente 1.000 millones de parámetros. El paquete Loom no modifica los pesos: toma el GGUF oficial de `ggml-org` ya cuantizado a Q4_K_M y genera kernels específicos para gfx1151 y gfx1201 mediante el flujo `loom-skills`, junto con una tarjeta `model.json` que describe el grafo y los parámetros de ejecución. El servidor `loom-serve` expone esos kernels a través de una API compatible con OpenAI.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni las etapas de alineación (RLHF, DPO) del modelo base; esos datos corresponden a la documentación oficial de Gemma 3 y no se reproducen aquí. Tampoco se documenta ninguna innovación de decodificación en este paquete: el model card indica explícitamente que la decodificación especulativa no es aplicable porque el GGUF no incluye cabeza MTP ni se ha publicado un drafter para este modelo exacto.

## Capacidades

- Generación de texto conversacional en formato chat mediante `/v1/chat/completions` con esquema OpenAI.
- Instrucciones multi-turno: el servidor acepta historiales de conversación y renderiza la plantilla de chat de Gemma 3.
- Contexto largo de hasta 32.768 tokens por petición, con pruebas de prefill documentadas hasta 16k en la tabla de roofline.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed` reproducibles.
- Concurrencia de 4 peticiones simultáneas con una compuerta de consistencia declarada (misma salida en concurrencia que en ejecución aislada).
- Tool calling: no aplicable según el model card.
- Modo razonamiento o thinking: no aplicable.
- Entrada de imagen: no aplicable en este paquete (la compuerta `vision` figura como no aplicable).
- Entrada o salida de audio: no aplicable.
- Decodificación especulativa: no aplicable.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: servir Gemma 3 1B Instruct con `loom-serve` en una Radeon AI PRO R9700 permite tener un chatbot con API OpenAI en `127.0.0.1:8080` sin depender de servicios en la nube, útil en entornos con requisitos de confidencialidad.
- Clasificación y extracción de información sobre documentos largos: con 32.768 tokens de contexto por petición se pueden procesar informes, contratos o transcripciones completas y pedir resúmenes estructurados o extracción de campos.
- Prototipado rápido de aplicaciones LLM en hardware AMD: al exponer un endpoint compatible con OpenAI, cualquier cliente escrito para la API de OpenAI (SDKs, LangChain, LlamaIndex) puede apuntarse a `127.0.0.1:8080` sin cambios de código, lo que acelera la validación de ideas antes de migrar a modelos mayores.
- Procesamiento por lotes de texto en local: con 4 peticiones concurrentes y una compuerta de consistencia declarada, es adecuado para tareas de etiquetado, reescritura o moderación de contenido en volúmenes moderados donde la privacidad impide usar APIs externas.
- Evaluación comparativa de motores de inferencia: el paquete incluye tablas de rendimiento frente a llama.cpp ROCm y una metodología de roofline, por lo que sirve como banco de pruebas reproducible para medir decodificación y prefill en Strix Halo y R9700.
- Educación y demostraciones de despliegue en GPU AMD: los comandos `loom-fetch` y `loom-serve` documentados permiten montar una demo funcional en pocos minutos en un equipo con Ryzen AI Max+ 395, sin configuración de CUDA.
- Generación de borradores y autocompletado en editores: al ser un modelo de 1B en Q4_K_M, la latencia esperada es baja y permite sugerencias de texto en tiempo casi real dentro de herramientas de escritura.

## Benchmarks y rendimiento

El model card incluye tablas de rendimiento frente a llama.cpp ROCm, pero los valores medidos de Loom y de llama.cpp están sin rellenar («—»). Solo se publican los valores de roofline (techo teórico del hardware) para Strix Halo:

| Métrica | llama.cpp | Loom | Roofline (Strix Halo) |
|---|---|---|---|
| Decode tok/s, prompt corto | — | — | 270,2 |
| Decode tok/s, contexto 2k | — | — | 263,7 |
| Decode tok/s, contexto 32k | — | — | — |
| Prefill tok/s, documento 1k | — | — | 40.724,2 |
| Prefill tok/s, documento 2k | — | — | 40.465,1 |
| Prefill tok/s, documento 8k | — | — | 39.145,5 |
| Prefill tok/s, documento 16k | — | — | 37.514,3 |
| Prefill tok/s, documento 32k | — | — | — |
| 4 streams, decode agregado tok/s | — | — | 1.009,9 |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

El roofline se calcula para el Ryzen AI Max+ 395 «Strix Halo» (gfx1151) con 216 GB/s de ancho de banda y 59 TFLOP/s, según `loom-roofline` (`roofline.py`, loom-skills `acd9ac7`). Para la Radeon AI PRO R9700 (gfx1201, 32 GB) el model card indica que los resultados «no se han vuelto a medir». No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los comandos de ejemplo reservan `--memory_bytes=7000000000` (7 GB), holgado para un GGUF Q4_K_M de 1B más el contexto de 32k.
- GPU compatibles: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU de consumo: el paquete está orientado a las dos plataformas AMD citadas; no se documenta soporte para RTX 4090, A100, H100 ni otras GPU NVIDIA en la información proporcionada.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch` y servicio con `loom-serve`; el servidor escucha en `127.0.0.1:8080` y responde a peticiones estilo OpenAI.
- Alternativas de despliegue: llama.cpp ROCm se usa como referencia de comparación, pero el paquete Loom no documenta integración con vLLM, Ollama ni TGI.
- Latencia y throughput: los valores medidos no están publicados; solo se dispone del techo de roofline (270,2 tok/s de decode en prompt corto y 40.724,2 tok/s de prefill en documento de 1k para Strix Halo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 3 1B Instruct (este paquete Loom) | ~1.000 M | 32.768 tokens (servidor Loom) | Gemma | Paquete Loom para gfx1151 y gfx1201; repo de 0,0 GB, sin descargas |
| ggml-org/gemma-3-1b-it-GGUF | ~1.000 M | no disponible en la información | Gemma | GGUF oficial, ejecutable con llama.cpp en múltiples plataformas |
| llama.cpp ROCm (motor, no modelo) | n/a | n/a | MIT (no confirmado en la información) | Motor de referencia usado en la comparación del model card |

No se dispone de datos de rendimiento medidos para establecer una comparación cuantitativa con alternativas de la misma categoría; el model card solo aporta el roofline teórico. Cualquier comparación con otros modelos de 1B (por ejemplo, variantes de Llama o Qwen) requeriría datos que no están en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0,0 GB y 0 descargas: el artefacto puede no estar materializado o ser un staging incompleto; conviene verificar la integridad antes de usarlo en producción.
- Las tablas de rendimiento y corrección del model card están sin rellenar; las compuertas `kernel_tests`, `golden`, `compare`, `consistency`, `sampling` y `needle` figuran como «no re-ejecutadas en este paquete» (la última pasada fue sobre el build `1464cb6`).
- Para la Radeon AI PRO R9700 no hay ninguna medición: todas las filas indican «no se ha vuelto a medir».
- Tool calling, modo thinking, entrada de imagen, audio y decodificación especulativa no son aplicables en este paquete, lo que limita su uso en pipelines de agentes.
- El modelo base es de 1B parámetros: la calidad en razonamiento complejo, matemáticas y código será inferior a la de modelos mayores; no se han publicado benchmarks de calidad que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, agravado por la cuantización Q4_K_M.
- Idiomas soportados no documentados en la información proporcionada; no se puede garantizar un rendimiento multilingüe homogéneo.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Google Gemma, que imponen restricciones y obligaciones de atribución; es necesario revisarlos antes de desplegar.
- Dependencia del ecosistema Loom (`hrx-loom==0.1.0`) y de las arquitecturas AMD gfx1151/gfx1201; no hay soporte documentado para otras GPU.
- Los enlaces de búsqueda web encontrados corresponden a Loom (la herramienta de grabación de pantalla de Atlassian) y a la marca de ropa Loom, no al proyecto de inferencia; no deben usarse como referencia técnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-gemma-3-1b-it-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
