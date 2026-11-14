# loom-fun-staging/ggml-org-Qwen3-Coder-30B-A3B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf`, publicado por `ggml-org`. El paquete lo genera el flujo de trabajo `loom-skills` y lo distribuye la cuenta `loom-fun-staging`, orientado específicamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) de Qwen, con 30B parámetros totales y 3B activos por token, especializado en código y con 262.144 tokens de contexto nativo.

La relevancia de este artefacto es de infraestructura más que de modelado: permite servir un modelo de código de 30B en hardware AMD consumer y de estación de trabajo mediante un servidor compatible con la API de OpenAI (`/v1/chat/completions`), con decodificación especulativa activada por defecto (DFlash, profundidad 1) y soporte de tool calling. Frente a llama.cpp ROCm, la model card reporta cifras de roofline teóricas del hardware, pero deja sin medir los valores reales de Loom y de llama.cpp en esta compilación, por lo que las comparativas de rendimiento no son verificables con los datos publicados.

La licencia del paquete es Apache 2.0, heredada del modelo base. No hay métricas de adopción (0 descargas, 0 likes) ni resultados de benchmarks de calidad publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el modelo base Qwen3-Coder-30B-A3B-Instruct; detalles internos no disponibles en esta ficha |
| Parametros totales | 30B (según el nombre del checkpoint base) |
| Parametros activos | 3B (según el nombre del checkpoint base) |
| Longitud de contexto | 262.144 tokens por petición; en Radeon AI PRO R9700 limitado a 139.264 tokens por restricción de memoria del pool |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no detalladas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo subyante. Por el nombre del checkpoint base se trata de Qwen3-Coder-30B-A3B-Instruct, un transformer MoE con 30B parámetros totales y 3B activos, ajustado para instrucciones y orientado a generación de código. Los detalles de composición del dataset, número de tokens, fases de RLHF/DPO y posibles innovaciones de atención no están disponibles en la información proporcionada.

La contribución técnica de este repositorio es el empaquetado para el runtime Loom: kernels generados para gfx1151 y gfx1201, un servidor HTTP con API compatible con OpenAI, decodificación especulativa DFlash con profundidad 1 usando el drafter `Anbeeld/Qwen3-Coder-30B-A3B-DFlash-GGUF`, y control del pool de memoria mediante `--memory_bytes`. La model card incluye puertas de corrección (`kernel_tests`, `golden`, `compare`) que en esta versión no se han vuelto a ejecutar; la última pasada registrada corresponde a una compilación anterior con sha256 `ebdc2b6`.

## Capacidades

- Generación de texto y código, con especialización declarada en tareas de programación por el modelo base Qwen3-Coder.
- Tool calling en formato OpenAI (`tools` y `tool_calls`).
- Servidor compatible con `/v1/chat/completions`, lo que facilita integración con clientes y SDK existentes.
- Decodificación especulativa DFlash activada por defecto (profundidad 1) con drafter dedicado.
- Concurrencia de hasta 4 peticiones simultáneas.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Contexto largo de hasta 262.144 tokens por petición (139.264 en R9700).
- Modo de razonamiento/thinking: no aplicable según la model card.
- Entrada de imagen o audio: no aplicable.

## Casos de uso

- Asistente de código en estación de trabajo AMD: servir el modelo con `loom-serve` en una Radeon AI PRO R9700 y conectarlo a un IDE mediante la API compatible con OpenAI, aprovechando el tool calling para consultas al repositorio y ejecución de comandos.
- Revisión de pull requests con contexto largo: procesar diffs extensos y varios ficheros relacionados en una sola petición gracias a la ventana de hasta 262.144 tokens, útil para revisiones de cambios que abarcan múltiples módulos.
- Generación de tests y refactorizaciones: usar el modelo en pipelines de CI/CD para proponer pruebas unitarias o parches, con límite de 4.096 tokens de salida por petición y hasta 4 peticiones concurrentes.
- Despliegue local en hardware consumer de gama alta: ejecutar en Ryzen AI Max+ 395 "Strix Halo" con `--memory_bytes=62000000000`, útil para equipos sin GPU de datacenter que necesitan un modelo de código de 30B MoE.
- Documentación técnica automatizada: generar documentación de API o comentarios de código a partir de ficheros fuente largos, con contexto suficiente para cubrir módulos completos.
- Prototipado de agentes de programación: combinar tool calling con contexto largo para construir agentes que consultan documentación, ejecutan herramientas y mantienen estado multi-turno dentro de la ventana disponible.
- Evaluación de runtimes alternativos: usar el paquete como banco de pruebas para comparar Loom frente a llama.cpp ROCm en el mismo GGUF y el mismo hardware, con las puertas de corrección incluidas en la model card.

## Benchmarks y rendimiento

La model card publica únicamente cifras de roofline (techo teórico del hardware) para Strix Halo, no mediciones reales de Loom ni de llama.cpp en esta compilación. Los valores medidos aparecen como "—" (no medidos).

| Métrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 82,9 |
| Decode tok/s, contexto 2k | no medido | no medido | 86,5 |
| Decode tok/s, contexto 32k | no medido | no medido | 39,2 |
| Prefill tok/s, documento 1k | no medido | no medido | 10.078,2 |
| Prefill tok/s, documento 2k | no medido | no medido | 9.443,9 |
| Prefill tok/s, documento 8k | no medido | no medido | 6.855,1 |
| Prefill tok/s, documento 16k | no medido | no medido | 5.020,2 |
| Prefill tok/s, documento 32k | no medido | no medido | 3.269,8 |
| 4 streams, decode agregado tok/s | no medido | no medido | 332,4 |
| Tokens especulativos aceptados | n/a | no medido (aceptación reportada: 27 % en decode, 41 % a 2k) | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" según la propia model card.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el paquete Q4_K_M se sirve con `--memory_bytes=62000000000` en Strix Halo (memoria unificada) y con `--memory_bytes=34000000000` en Radeon AI PRO R9700 (32 GB).
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para RTX 4090 ni otras GPU NVIDIA; el paquete está orientado a AMD.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.1.0`, `loom-fetch`, `loom-serve`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Concurrencia: 4 peticiones simultáneas.
- Latencia y throughput reales: no medidos en esta compilación; solo se publican techos de roofline (ver sección anterior).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este paquete (Qwen3-Coder-30B-A3B-Instruct Q4_K_M, Loom) | 30B | 3B | 262.144 (139.264 en R9700) | Apache 2.0 | GGUF + Loom | Hugging Face, runtime Loom |
| ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF | 30B | 3B | no disponible en esta ficha | Apache 2.0 (según el paquete) | GGUF | Hugging Face, runtime GGUF genérico |
| Anbeeld/Qwen3-Coder-30B-A3B-DFlash-GGUF (drafter) | no disponible | no disponible | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación con modelos de otras familias (por ejemplo, otros modelos de código de tamaño similar) no está disponible.

## Limitaciones y advertencias

- El repositorio es un empaquetado de despliegue, no un modelo nuevo; cualquier limitación del checkpoint base Qwen3-Coder-30B-A3B-Instruct aplica sin cambios.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`) no se han vuelto a ejecutar en esta compilación; la última pasada corresponde al sha256 `ebdc2b6`. No hay garantía verificada de equivalencia token a token con llama.cpp en esta versión.
- Las cifras de rendimiento publicadas son techos de roofline, no mediciones; no deben usarse para estimar latencia o throughput en producción.
- En Radeon AI PRO R9700 el contexto por petición queda limitado a 139.264 tokens por el pool de memoria configurado, no por el modelo.
- El límite de salida es de 4.096 tokens por petición (preset `max_tokens`), lo que puede ser insuficiente para generaciones largas.
- Solo se documentan 4 peticiones concurrentes; no se han publicado pruebas de escalado más allá de ese valor.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en esta ficha; deben consultarse en la documentación de Qwen3-Coder.
- El soporte de hardware está limitado a las GPU AMD indicadas; no se documenta compatibilidad con NVIDIA ni con otras GPU AMD.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del drafter por separado.
- El repositorio tiene 0 descargas y 0 likes, y la cuenta es de staging; la madurez y el soporte del paquete no están contrastados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-Qwen3-Coder-30B-A3B-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Drafter de decodificación especulativa: https://huggingface.co/Anbeeld/Qwen3-Coder-30B-A3B-DFlash-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de empaquetado loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
