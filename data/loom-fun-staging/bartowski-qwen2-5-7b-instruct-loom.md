# loom-fun-staging/bartowski-Qwen2.5-7B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Qwen2.5-7B-Instruct-Q4_K_M.gguf` de `bartowski/Qwen2.5-7B-Instruct-GGUF`. El autor, `loom-fun-staging`, distribuye esta conversión para su uso con el runtime Loom (paquete `hrx-loom`) sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es Qwen2.5-7B-Instruct, un transformer denso de 7.000 millones de parámetros de la familia Qwen2.5 de Alibaba, ajustado para instrucciones.

La relevancia de este paquete es de infraestructura, no de modelado: permite servir Qwen2.5-7B-Instruct en cuantización Q4_K_M mediante `loom-serve` con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, contexto de 32.768 tokens por petición y 4 peticiones concurrentes. La model card incluye una tabla comparativa frente a llama.cpp ROCm, aunque la mayoría de las celdas de resultados aparecen como "no medidas" (`—`) y los datos de roofline se presentan como techo teórico de hardware, no como rendimiento medido.

No se dispone de información sobre licencia, idiomas ni pipeline en los metadatos del repositorio, y los resultados de benchmarks del modelo base no se incluyen en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-7B-Instruct); paquete de despliegue Loom sobre GGUF |
| Parámetros totales | 7.000 millones (modelo base Qwen2.5-7B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens por petición (según la model card del paquete) |
| Tipos de cuantización | Q4_K_M (GGUF); el paquete referencia únicamente `Qwen2.5-7B-Instruct-Q4_K_M.gguf` |
| Idiomas soportados | no disponible en los metadatos del repositorio |
| Licencia | no disponible en los metadatos del repositorio |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer denso de 7.000 millones de parámetros con atención completa, publicado por Alibaba como parte de la familia Qwen2.5. El checkpoint utilizado aquí es la conversión GGUF Q4_K_M realizada por bartowski, sin modificaciones ("unmodified GGUF checkpoint") según la model card. No se proporcionan detalles sobre el número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO del modelo base en la información disponible.

La innovación técnica de este repositorio es el empaquetado Loom: kernels generados para los objetivos AMD gfx1151 (Strix Halo) y gfx1201 (R9700), servidos mediante `loom-serve` con espera activa (`completion_spin_ns=4294967295`) y un límite de memoria de 15.000.000.000 bytes (`--memory_bytes=15000000000`). La model card documenta puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`) frente a una referencia de llama.cpp sobre el mismo GGUF, pero indica que en este paquete no se han vuelto a ejecutar (el último pase fue sobre una build previa, sha256 `eccc134`). No hay decodificación especulativa: la model card indica que no existe cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.

## Capacidades

- Generación de texto conversacional con API compatible OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: parámetros `tools` y respuestas `tool_calls`.
- Bucles de tool calling multi-turno (puerta `agent` documentada, pendiente de re-ejecución en este paquete).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Contexto de 32.768 tokens por petición y hasta 4.096 tokens de salida (preset `max_tokens`).
- Concurrencia de 4 peticiones simultáneas.
- Modo de razonamiento/thinking: no aplicable en este paquete.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada/salida de audio: no aplicable.
- Capacidades multilingües: no disponibles en la información del repositorio.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: servir Qwen2.5-7B-Instruct Q4_K_M con `loom-serve` en una Ryzen AI Max+ 395 o R9700 y consumirlo desde clientes que hablan la API de OpenAI, sin dependencia de servicios en la nube.
- Automatización de agentes con tool calling: el soporte de `tools`/`tool_calls` y la puerta `agent` (renderizado exacto del prompt, reutilización de historial, llamadas válidas) permiten construir bucles multi-paso sobre herramientas locales.
- Procesamiento de documentos largos: con 32.768 tokens de contexto por petición se pueden resumir o extraer información de contratos, informes o transcripciones de hasta decenas de miles de tokens en una sola pasada.
- Prototipado de aplicaciones compatibles con OpenAI: al exponer `/v1/chat/completions`, los SDK oficiales de OpenAI pueden apuntar a `127.0.0.1:8080` para desarrollo y pruebas sin coste de API.
- Evaluación de rendimiento en hardware AMD: la model card incluye una metodología de comparación frente a llama.cpp ROCm (mismo GGUF, mismos prompts, mismo runner DevLab), útil para banco de pruebas de inferencia local en gfx1151 y gfx1201.
- Despliegue en GPU de 32 GB: en la Radeon AI PRO R9700 el paquete está pensado para ejecutarse con el mismo límite de memoria de 15 GB, dejando margen para el runtime y peticiones concurrentes.
- Servicio multiusuario ligero: con 4 peticiones concurrentes y la puerta `consistency` (misma salida en concurrencia que en ejecución aislada) puede atender pequeñas herramientas internas de equipo.

## Benchmarks y rendimiento

La model card presenta una tabla de rendimiento frente a llama.cpp ROCm para Strix Halo (gfx1151), pero las columnas de llama.cpp y Loom aparecen como no medidas (`—`). Los únicos valores numéricos publicados son los techos de roofline del hardware (216 GB/s y 59 TFLOP/s), que no constituyen resultados medidos del modelo:

| Métrica | Roofline Strix Halo (gfx1151) | Loom medido | llama.cpp medido |
|---|---|---|---|
| Decode tok/s, prompt corto | 49,4 | — | — |
| Decode tok/s, contexto 2k | 48,2 | — | — |
| Decode tok/s, contexto 32k | 34,8 | — | — |
| Prefill tok/s, documento 1k | 4452,4 | — | — |
| Prefill tok/s, documento 2k | 4386,0 | — | — |
| Prefill tok/s, documento 8k | 4025,6 | — | — |
| Prefill tok/s, documento 16k | 3628,1 | — | — |
| Prefill tok/s, documento 32k | 3029,8 | — | — |
| 4 streams, decode agregado tok/s | 191,7 | — | — |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados "no se han vuelto a medir". No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el paquete se sirve con `--memory_bytes=15000000000` (15 GB) tanto en Strix Halo como en R9700; el GGUF Q4_K_M de un modelo de 7.000 millones ocupa aproximadamente 4,5–5 GB, por lo que el límite de 15 GB incluye margen para el runtime, caché KV y concurrencia.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU consumer: no se documentan objetivos consumer NVIDIA; el paquete está generado específicamente para los objetivos AMD indicados. Para GPU consumer convencionales sería necesario usar el GGUF base con llama.cpp u otro runtime.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir en `127.0.0.1:8080`. Alternativamente, el GGUF base puede servirse con llama.cpp, Ollama o vLLM (este último requiere conversión a safetensors, no incluida en el paquete).
- Latencia y throughput: no medidos en este paquete; solo se publican techos de roofline (ver sección anterior). La model card advierte que los runners DevLab varían entre sesiones y que el margen de ruido del mismo runner es ±3 %.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct (este paquete Loom) | 7.000 M | 32.768 tokens por petición | GGUF Q4_K_M empaquetado Loom; `loom-serve` en gfx1151/gfx1201 | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct GGUF (bartowski) | 7.000 M | no disponible en la información | GGUF; llama.cpp, Ollama y similares | no disponible en la información | Hugging Face |
| Qwen2.5-7B-Instruct (checkpoint original) | 7.000 M | no disponible en la información | safetensors; vLLM, TGI, transformers | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo medido entre estas variantes en la información proporcionada; la comparativa se limita a formato, runtime objetivo y disponibilidad.

## Limitaciones y advertencias

- El repositorio es un empaquetado de despliegue, no un modelo entrenado: cualquier limitación del Qwen2.5-7B-Instruct original (sesgos, alucinaciones, conocimiento con fecha de corte) aplica igualmente aquí.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`) no se han re-ejecutado sobre este paquete; el último pase corresponde a una build previa (sha256 `eccc134`). No debe asumirse equivalencia verificada con llama.cpp en esta build concreta.
- Los resultados de rendimiento de la tabla comparativa no están medidos (`—`); solo hay techos de roofline. No hay datos de latencia reales publicados para este paquete.
- En Radeon AI PRO R9700 los resultados "no se han vuelto a medir"; el soporte para gfx1201 está declarado pero no verificado en esta build.
- El paquete está generado exclusivamente para objetivos AMD gfx1151 y gfx1201; no está pensado para GPU NVIDIA ni para CPU.
- Contexto limitado a 32.768 tokens por petición y salida máxima de 4.096 tokens (preset); no admite modo thinking, visión, audio ni decodificación especulativa.
- Licencia no disponible en los metadatos: antes de uso comercial es imprescindible verificar la licencia del modelo base Qwen2.5-7B-Instruct y del checkpoint GGUF de bartowski en sus repositorios originales.
- Idiomas soportados no declarados en el repositorio; no debe asumirse cobertura multilingüe sin verificación.
- Repositorio de "staging" con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de mantenimiento continuado.
- La model card indica que los argumentos del servidor llama.cpp ROCm de referencia "no se registraron" y que el número de rondas de medida "no se registró", lo que impide reproducir la comparación tal como está documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-Qwen2.5-7B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
