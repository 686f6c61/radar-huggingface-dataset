# rickybrent/GLM-5.3-Flash-HYPERFLARE-TP2

## Resumen

GLM-5.3-Flash-HYPERFLARE-TP2 es un paquete de ejecución precompilado (runtime package) para el modelo GLM-5.3-Flash de NVIDIA, empaquetado por el usuario rickybrent para su uso con el motor de inferencia Hyperflare. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue que contiene los pesos del checkpoint base `nvidia/GLM-5.3-Flash-FP4-Local` (commit `76348ddb`) en formato NVFP4, junto con los metadatos y gráficos CUDA necesarios para servirlo directamente en hardware Blackwell.

El paquete está específicamente preparado para dos tarjetas RTX PRO 6000 Blackwell (arquitectura GB202, SM120, 96 GB cada una) en configuración tensor-parallel TP2, con soporte de visión, especulación MTP y la ventana de contexto completa de 1.048.576 tokens. Resuelve el problema de desplegar un modelo multimodal de contexto largo en hardware de gama profesional sin necesidad de un clúster de datacenter, eliminando las dependencias de Python en tiempo de servicio.

Su relevancia radica en que demuestra el flujo completo de preparación y despliegue de Hyperflare sobre GPUs consumer/prosumer de arquitectura Blackwell, con métricas de rendimiento medidas y validación de casos de uso (tool calling, recuperación en contexto largo, visión). El repositorio pesa 180,3 GB y la carga en frío ronda los 43 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del checkpoint base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por petición |
| Tipos de cuantizacion | NVFP4 (FP4) en el checkpoint base; el paquete es un formato packed propietario de Flare |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement |
| Formato de pesos | safetensors empaquetado (packed package de Flare, ~180,3 GB); revision `gb202` contiene el payload |

## Arquitectura y entrenamiento

El paquete no incluye información sobre la arquitectura interna ni el proceso de entrenamiento del checkpoint base GLM-5.3-Flash, más allá de que se trata de un modelo multimodal (pipeline `image-text-to-text`) cuantizado en NVFP4 y distribuido en dos rangos tensor-parallel. La información de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no está disponible en la documentación proporcionada.

La innovación técnica destacable está en el runtime: ejecución sin Python, ABI de ejecución 6 y contrato de modelo preparado 3, decodificación especulativa MTP con 5 tokens draft por defecto (anchos 1–6 y verificación adaptativa), captura de 71 gráficos CUDA y 5.664 kernels, y una caché KV precargada de 1.405.952 tokens distribuida en 54 slots de snapshot compartidos (9,6 GiB totales). Cada GPU carga entre 88,94 y 88,97 GiB con un presupuesto de caché de 4,82–4,88 GiB.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto).
- Ventana de contexto de 1.048.576 tokens, validada con recuperación a 70K, 350K y ~960K tokens.
- Tool calling / function calling: validado con 6/6 llamadas correctas en las pruebas del autor.
- Decodificación especulativa MTP con verificación adaptativa para acelerar la generación.
- Capacidades de visión: prueba de imagen correcta según la validación del paquete.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`).
- Concurrencia preparada de 4 y chunk de prefill de 4096 tokens.
- Idiomas soportados: no disponible.

## Casos de uso

- Análisis de documentos extensos: con 1.048.576 tokens de contexto, el modelo puede procesar libros completos, expedientes o bases de código en una sola petición, lo que lo hace adecuado para resumen y extracción de información sobre corpus de gran tamaño.
- Recuperación en contexto largo (long-context retrieval): validado a 350K y ~960K tokens, sirve para sistemas RAG que necesitan razonar sobre múltiples documentos completos sin truncar.
- Asistentes con visión: al aceptar image-text-to-text, puede integrarse en flujos de análisis de capturas, diagramas o documentos escaneados combinados con texto.
- Automatización con agentes: el soporte validado de tool calling (6/6) permite construir agentes multi-paso que invocan APIs externas y encadenan razonamiento.
- Despliegue on-premise en hardware profesional: dos RTX PRO 6000 Blackwell (96 GB cada una) bastan para servir el modelo completo con contexto de 1M, útil en entornos con requisitos de soberanía de datos.
- Inferencia de baja latencia en producción: con un throughput de decodificación agregado de hasta 386,1 tok/s en C4 y prefill de ~4.000 tok/s, es viable para aplicaciones interactivas con concurrencia moderada.
- Procesamiento por lotes de alto volumen: la caché KV precargada y los gráficos CUDA capturados reducen la latencia de arranque (carga en frío ~43 s) y permiten reinicios rápidos en pipelines batch.

## Benchmarks y rendimiento

Datos medidos por el autor el 2026-11-09 con el banco LIL (celdas de 30 s, concurrencia 1/2/4 a contextos 0/16K/128K):

| Prefill | 8K | 16K | 64K | 128K |
|---|---:|---:|---:|---:|
| tok/s | 3.965 | 4.094 | 4.160 | 4.019 |

| Decodificación, tok/s agregados | C1 | C2 | C4 |
|---|---:|---:|---:|
| 0K | 185,7 | 319,4 | 364,8 |
| 16K | 184,6 | 307,3 | 377,2 |
| 128K | 194,0 | 293,5 | 386,1 |

Frente al mismo paquete preparado desde el upstream `68bbd6dd` sin los PRs de preparación, C2 mejoró +17% / +6% / +4% a 0K/16K/128K, mientras C1 y C4 se mantuvieron planos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 88,94–88,97 GiB cargados por GPU, más 4,82–4,88 GiB de presupuesto de caché; se requieren dos GPUs.
- GPU obligatorias: 2 × RTX PRO 6000 Blackwell (GB202, SM120, 96 GB). El replay exige exactamente la misma arquitectura en la que se preparó el paquete.
- No cabe en GPUs consumer convencionales (RTX 4090, etc.); requiere el hardware Blackwell profesional especificado.
- Despliegue: Hyperflare (`flare run`), compilado desde `NVIDIA/hyperflare-inference` en el commit `68bbd6dd` o posterior (ABI de ejecución 6). No requiere Python para servir.
- Latencia y throughput: carga en frío ~43 s (35,7 s leyendo el paquete); prefill ~4.000 tok/s; decodificación 185,7–386,1 tok/s según concurrencia y contexto.
- Descarga: soporta descarga resumible vía Xet (`hf download ... --revision gb202`).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El paquete es un artefacto de despliegue específico de hardware (GB202, TP2) y no un checkpoint genérico, por lo que la comparación directa con otros modelos requeriría datos del checkpoint base GLM-5.3-Flash que no están disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3-Flash-HYPERFLARE-TP2 | no disponible | 1.048.576 | nvidia-open-model-agreement | Paquete Flare para GB202 TP2 |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete solo se reproduce en hardware GB202 (RTX PRO 6000 Blackwell, SM120) y exactamente dos rangos; no es portable a otras GPUs.
- Requiere Hyperflare en el commit `68bbd6dd` o posterior (ABI de ejecución 6); versiones anteriores rechazan el paquete.
- La licencia `nvidia-open-model-agreement` impone condiciones de uso comercial que deben revisarse antes de producción; el paquete incluye un aviso de editor con huella de clave de firma que hay que aceptar en la primera carga.
- La verificación de identidad descarga `publisher.json` del repositorio en cada carga online; en entornos sin red puede requerir el flag `--dangerously-approve-key`.
- Riesgo de alucinación y sesgos: no disponible en la documentación proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Los PRs de preparación (#217, #218, #231) están sin fusionar en upstream; la reproducibilidad depende de ramas locales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/rickybrent/GLM-5.3-Flash-HYPERFLARE-TP2
- Checkpoint base: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Repositorio Hyperflare: https://github.com/NVIDIA/hyperflare-inference
- Licencia: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
