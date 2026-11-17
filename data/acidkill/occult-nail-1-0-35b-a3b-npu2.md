# acidkill/Occult-Nail-1.0-35B-A3B-NPU2

## Resumen

Occult-Nail-1.0-35B-A3B-NPU2 es una conversión cuantizada del modelo GGUF `peculiar-ragdoll/Occult-Nail-1.0-35B-A3B-GGUF`, preparada por el usuario acidkill para su ejecución sobre NPU AMD XDNA2 mediante el runtime OpenFlowLM. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor ha empaquetado los pesos en formato Q4NX con expertos en Q4_1 y proyecciones no-expertas en Q8, junto con el tokenizador, la plantilla de chat y los pesos de visión. La estirpe declarada remite a `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic`, derivado de Qwen3.6-35B-A3B, una arquitectura MoE con 35B parámetros totales y 3B activos.

El interés del artefacto es acotado pero técnico: demuestra que un MoE de 35B con capacidades multimodales y tool calling puede ejecutarse en una NPU de consumo (Ryzen AI 7 350, XDNA2) con un consumo de memoria medido de aproximadamente 25,77 GB en el cgroup del proceso, sobre una máquina de 32 GB con uso de swap. La validación local reportada cubre texto, visión y llamadas a herramientas, con 13 de 14 casos superados.

Es relevante para quienes exploran inferencia en hardware no-GPU (NPUs integradas) y para evaluar el estado del ecosistema OpenFlowLM. No aporta mejoras de calidad sobre el modelo base: la conversión es declarada como lossy y las capacidades heredadas dependen enteramente del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (familia Qwen3.6-35B-A3B) |
| Parametros totales | 35B |
| Parametros activos | 3B |
| Longitud de contexto | 4096 tokens (configurado y validado en el runtime de prueba) |
| Tipos de cuantizacion | Q4NX con expertos Q4_1 y tensores no-expertos Q8; el modelo base GGUF ofrece UD-Q8_K_XL y UD-Q2_K_XL |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (contenedor propio de OpenFlowLM); origen GGUF |
| Tamano de pesos | 24,244 GB en total (23,235 GB lenguaje + 1,009 GB visión) |
| Vision | Sí, incluye pesos de proyector visual (mmproj-F16 en origen) |
| Audio | No soportado (los IDs de audio del tokenizador no están implementados) |
| Hardware objetivo | NPU AMD XDNA2 |
| Runtime | OpenFlowLM 0.1.0 con kernels Qwen3.6-MoE abiertos |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.6, con 35B parámetros totales y 3B activos por token, lo que reduce el coste computacional de decodificación a cambio de un footprint de memoria elevado. La variante "heretic" y la etiqueta "uncensored" indican un ajuste fino orientado a eliminar restricciones de rechazo del modelo original, aunque no se dispone de detalles sobre el dataset, el número de tokens de entrenamiento ni la composición del corpus en la información proporcionada.

Este artefacto concreto no introduce entrenamiento nuevo: es una conversión de cuantización del GGUF `Occult-Nail-1.0-35B-A3B-UD-Q8_K_XL.gguf` con el proyector visual `mmproj-F16.gguf`, revisión `3fdd9b72fc54083a6c8959b259011366a0b1571b`. La innovación técnica reside en el empaquetado: contenedor Q4NX con repacking en tiempo de ejecución de las proyecciones Q8 no-expertas para el motor Q4_1, verificación de hash de kernels y preservación de la plantilla de chat y el system prompt originales. El tokenizador mantiene el EOS id 248046 con un vocabulario en runtime de 248.070 ids; 250 ids finales del origen (7 de audio y 243 PAD sin uso) no están implementados.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat y system prompt embebidos.
- Razonamiento con modo "thinking" conmutable (la validación lo desactivó explícitamente).
- Comprensión de imágenes (image-text-to-text) mediante pesos de visión incluidos.
- Tool calling / function calling validado en el runtime (2/2 casos superados).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin soporte de audio, a pesar de que el tokenizador de origen contenga ids reservados para ello.
- Ejecución en NPU AMD XDNA2 mediante OpenFlowLM, con API compatible con OpenAI (`/v1/chat/completions`).

## Casos de uso

- Despliegue de un MoE de 35B en portátiles con NPU XDNA2: permite servir un modelo grande en hardware sin GPU dedicada, con un consumo de memoria medido de ~25,77 GB y uso de swap, adecuado para entornos de desarrollo y demos locales.
- Asistentes conversacionales con contexto moderado: la ventana de 4096 tokens configurada cubre diálogos multi-turno típicos de atención al usuario o soporte interno, siempre que no se requieran documentos largos.
- Procesamiento de documentos con OCR ligero: la capacidad de visión permite extraer texto de imágenes, aunque la validación reportó un fallo de precisión OCR (leyó "NFU2" en lugar de "NPU2"), por lo que requiere verificación humana en flujos críticos.
- Agentes con llamadas a herramientas: el tool calling validado habilita pipelines de automatización que consultan APIs o ejecutan acciones estructuradas desde el modelo.
- Prototipado de aplicaciones multimodales en local: útil para equipos que quieren iterar sobre un endpoint compatible con OpenAI sin depender de servicios en la nube.
- Evaluación comparativa de backends NPU frente a GPU: el artefacto incluye métricas de prefill, decode y TTFT que permiten medir el rendimiento relativo en el mismo host.
- Investigación sobre cuantización y empaquetado para NPUs: sirve como referencia de conversión Q4NX con repacking de proyecciones y verificación de kernels.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento de runtime, no de calidad de modelo. La validación local con OpenFlowLM 0.1.0 sobre Ryzen AI 7 350 / Krackan1 XDNA2 (firmware 1.1.2.64, XRT 2.21.75, kernel Linux 7.2.15-2-omarchy, contexto 4096, temperatura 0, salida máxima 512 tokens, thinking desactivado) reportó:

| Prueba | Resultado NPU Q4 | Umbral requerido |
|---|---:|---:|
| Texto | 8/8 | 7 |
| Visión | 3/4 | 3 |
| Tool calls | 2/2 | 2 |
| Total | 13/14 | — |

Comparativa secuencial con GPU en el mismo host (GGUF UD-Q2_K_XL + proyector F16, LlamaStash 0.11.0, llama.cpp c1304d7, ROCm0):

| Perfil de texto fijo | NPU Q4 | GPU UD-Q2_K_XL |
|---|---:|---:|
| Prefill, mediana de 3 | 156,84 tok/s | 165,40 tok/s |
| Decode, mediana de 3 | 13,85 tok/s | 20,31 tok/s |
| Extremo a extremo, mediana de 3 | 18,120 s | 14,923 s |
| TTFT observado por cliente, n=1 | 9,082 s | 8,576 s |

Cada perfil generó exactamente 128 tokens; se contaron 1418 tokens de entrada en NPU frente a 1422 en GPU. En fixtures pequeños en caliente, la mediana de tiempo de pared fue 2,504 s en NPU frente a 0,629 s en GPU. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: los pesos suman 24,244 GB; el proceso NPU medido alcanzó ~25,77 GB en su cgroup sobre una máquina de 32 GB, con uso de swap. Planificar al menos 32 GB de RAM.
- NPU: AMD XDNA2 obligatoria (probado en Ryzen AI 7 350 / Krackan1), con firmware 1.1.2.64 y XRT 2.21.75.
- GPU: no es el objetivo del artefacto; la comparativa usó ROCm0 en el mismo host con el GGUF UD-Q2_K_XL.
- Consumer GPU: no aplica a esta conversión; el modelo base GGUF en Q2_K_XL podría caber en GPUs de 24 GB, pero no se aportan mediciones de VRAM en la información disponible.
- Despliegue: OpenFlowLM 0.1.0 con kernels Qwen3.6-MoE abiertos y hash de kernel verificado (`sha256:32e980528551df6ae76741cce159c2e79a7a7daa6b0d01d78f665a1164b9f780`). Variables obligatorias: `OPEN_KERNELS_FORCE_Q4_1=1` y `OFLM_QWEN36_ENGINE=open`.
- Latencia y throughput: prefill 156,84 tok/s, decode 13,85 tok/s, TTFT 9,082 s y extremo a extremo 18,120 s para 128 tokens de salida en el perfil probado.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Occult-Nail-1.0-35B-A3B-NPU2 | 35B | 3B | 4096 (configurado) | Q4NX | Apache 2.0 | Conversión NPU, validación 13/14 |
| Occult-Nail-1.0-35B-A3B-GGUF (origen) | 35B | 3B | no disponible | GGUF (UD-Q8_K_XL, UD-Q2_K_XL) | Apache 2.0 | Modelo base del que deriva; ejecutable en GPU/CPU |
| Qwen3.6-35B-A3B (familia) | 35B | 3B | no disponible | safetensors/GGUF | no disponible | Linaje original; sin datos de calidad en la información |

No se dispone de comparativas de calidad frente a otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Conversión lossy: el autor declara explícitamente que no es un modelo nuevo y que la cuantización introduce pérdida.
- Fallo de OCR observado: en la fixture sintética "NPU2" el modelo devolvió "NFU2"; la precisión de lectura de imágenes no es fiable sin verificación.
- La validación es de un único host y configuración; no constituye certificación de hardware ni garantía de precisión general.
- Contexto limitado a 4096 tokens en la prueba; no se establece soporte para contextos mayores.
- Idiomas soportados no documentados; no asumir cobertura multilingüe.
- Modelo de origen etiquetado como "uncensored": mayor riesgo de generar contenido no filtrado, con implicaciones de moderación en producción.
- Riesgo de alucinación inherente al modelo base; no hay benchmarks de calidad publicados que lo acoten.
- Dependencia estricta de OpenFlowLM 0.1.0, kernels con hash concreto y NPU XDNA2; no es portable a otros runtimes sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero las restricciones del modelo de origen (Qwen3.6-35B-A3B y el ajuste "heretic") deben verificarse por separado.
- Los ids de audio del tokenizador no están implementados: no interpretar como soporte de audio.
- Uso de swap en el host probado: el rendimiento puede degradarse en máquinas con menos RAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acidkill/Occult-Nail-1.0-35B-A3B-NPU2
- Modelo base GGUF: https://huggingface.co/peculiar-ragdoll/Occult-Nail-1.0-35B-A3B-GGUF
- Linaje declarado: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Repositorio OpenFlowLM: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
