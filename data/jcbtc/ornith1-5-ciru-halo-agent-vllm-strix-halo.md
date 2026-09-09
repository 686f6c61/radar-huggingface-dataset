# jcbtc/Ornith1.5-Ciru-Halo-Agent-vllm-strix-halo

## Resumen

Ornith1.5 Ciru Halo Agent es una compilación de inferencia local creada por jcbtc, que combina una cuantización personalizada del modelo Ornith-1.5-35B-A3B (un mixture-of-experts de 35 mil millones de parámetros con 3 mil millones activos) con un runtime vLLM/ROCm optimizado para AMD Strix Halo. El objetivo es ejecutar agentes de código y tool calling de alta velocidad en hardware AMD de gama alta, aprovechando la memoria unificada de la APU Ryzen AI Max+ 395 (Radeon 8060S, gfx1151). Incluye decodificación especulativa DFlash2 adaptativa, prefijado en caché y un pool de estado KV compartido de 44 GiB, lo que permite hasta 8 solicitudes concurrentes con una ventana de contexto de 262.144 tokens. Según las mediciones del autor, alcanza 178 tok/s de decodificación en una sola solicitud y 295 tok/s agregados con 8 concurrentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformador |
| Parámetros totales | 35 mil millones (según nombre del modelo base) |
| Parámetros activos | 3 mil millones (según sufijo A3B del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Cuantización personalizada 4-bit (pesos y rutas de activación) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 24.5 GB |
| Requests concurrentes | Hasta 8 (los adicionales entran en cola) |
| Pool de estado compartido | 44 GiB (KV/estado recurrente) |
| Runtime | vLLM/ROCm personalizado para AMD gfx1151 |

## Arquitectura y entrenamiento

El modelo base es Ornith-1.5-35B-A3B, un modelo de mezcla de expertos (MoE) de 35 mil millones de parámetros con 3 mil millones activos por token. La compilación Ciru Halo Agent aplica una cuantización personalizada de pesos y activaciones a 4 bits y un runtime vLLM/ROCm específico para AMD gfx1151 (Strix Halo). Incorpora decodificación especulativa adaptativa DFlash2 (drafter entrenado por jzinno) que alterna entre 15, 7 y 0 tokens según la longitud del contexto, además de prefijado en caché y reutilización de estado recurrente. No se dispone de datos sobre el dataset de entrenamiento, composición de tokens ni procesos de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con comportamiento de chat preservado del modelo Ornith.
- Soporte de tool calling / function calling a través de API compatible con OpenAI.
- Soporte de agentes multi-paso y razonamiento en cadena.
- Contexto largo de 262.144 tokens con prefijado en caché.
- Hasta 8 solicitudes concurrentes con pool de estado compartido.
- Decodificación especulativa adaptativa DFlash2 para reducir latencia.
- Optimizado para código asistido, según los tests de velocidad con HumanEval 0-9.

## Casos de uso

- Asistente de programación en local: puede analizar archivos de código con contexto largo (hasta 256K tokens) y generar o modificar código con baja latencia, gracias al runtime optimizado para Strix Halo.
- Agente autónomo de desarrollo: con tool calling, se integra en entornos de edición o pipelines de integración continua para ejecutar comandos, consultar APIs y completar tareas de manera encadenada.
- API interna de chat para equipos: sirve hasta 8 usuarios simultáneos con 262K de ventana de contexto, lo que permite mantener conversaciones largas y reutilizar historiales mediante prefijado en caché.
- Análisis de logs y documentación extensa: el prefill en frío a 64K alcanza 1.287 tok/s, lo que permite ingerir rápidamente grandes volúmenes de texto o registros antes de generar respuestas.
- Automatización de flujos de trabajo con herramientas: el soporte de tool calling permite conectar el modelo con sistemas externos, bases de datos o servicios internos para automatizar procesos multi-paso.
- Prototipado y evaluación en hardware AMD: sirve como banco de pruebas para técnicas de cuantización 4-bit y decodificación especulativa en APUs con memoria unificada, útil para investigadores que evalúan rendimiento en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval como evaluación de capacidades) en la información disponible. Los datos existentes son métricas de velocidad y concurrencia medidas en AMD Strix Halo:

| Workload | Métrica | Valor |
|---|---|---|
| HumanEval 0-9, 1 request | Decodificación media | 178.17 tok/s |
| HumanEval 0-9, 1 request | Latencia primer token | 0.166 s |
| HumanEval 0-9, 8 requests | Decodificación media | 55.84 tok/s |
| HumanEval 0-9, 8 requests | Latencia primer token | 0.709 s |
| HumanEval 0-9, 8 requests | Throughput agregado | 294.89 tok/s |
| Cold prefill a 64K | Tokens por segundo | 1.287 tok/s |
| Cold prefill cerca de 256K | Tokens por segundo | 668 tok/s |
| Cached C1 decode a 63K historial | Tokens por segundo | 123 tok/s |

Se reportan 60/60 comprobaciones de salud (health checks) superadas. La comparación con otros modos de la misma infraestructura se presenta en la sección de comparativa.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional. La APU utiliza memoria unificada; el pico observado durante la campaña de producción fue de 95.35 GB del sistema, incluyendo otros procesos del host.
- GPU recomendada: AMD Radeon 8060S (gfx1151) integrada en Ryzen AI Max+ 395. El modelo está diseñado específicamente para este hardware, no para GPUs dedicadas estándar como A100 o H100.
- Memoria total del sistema: se recomienda 128 GB de memoria unificada para reproducir el perfil medido.
- Opciones de despliegue: runtime vLLM/ROCm personalizado incluido en el repositorio. No se menciona soporte para llama.cpp ni Ollama.
- Latencia estimada: primer token en 0.166 s con una solicitud, 0.709 s con 8 solicitudes concurrentes.
- Throughput estimado: 178 tok/s en una solicitud, 295 tok/s agregado con 8 solicitudes concurrentes.

## Comparativa con modelos similares

No se dispone de datos de modelos externos de la misma categoría en la información proporcionada. La única comparación disponible es entre los diferentes modos y cuantizaciones de la misma infraestructura, medida sobre el mismo lote de 10 preguntas de HumanEval:

| Configuración | Batch 10 preguntas | Decodificación media | Latencia primer token |
|---|---|---|---|
| Ciru Halo Agent (1 request) | 10.65 s | 178.17 tok/s | 0.166 s |
| Q4_K_XL + DFlash2 (7 tokens) | 17.32 s | 131.65 tok/s | 0.351 s |
| ROCmFP4 C1 MTP4 | 19.56 s | 113.31 tok/s | no disponible |

La compilación Ciru Halo Agent completa el lote 1.63× más rápido que Q4_K_XL + DFlash2 y 1.84× más rápido que ROCmFP4 C1 MTP4.

## Limitaciones y advertencias

- Diseñado exclusivamente para AMD Strix Halo (gfx1151). No se garantiza su funcionamiento en otro hardware.
- Requiere el runtime personalizado incluido en el repositorio; instalar vLLM estándar no reproduce la build ni el rendimiento descrito.
- La memoria pico observada (95.35 GB) es un valor de sistema completo, no el tamaño del modelo ni una garantía de memoria mínima.
- El pool compartido de 44 GiB no permite 8 historias completas de 256K tokens simultáneamente; las solicitudes adicionales entran en cola.
- No se han publicado evaluaciones de calidad (MMLU, GSM8K, HumanEval como benchmark de capacidades) en la información disponible.
- La licencia MIT cubre el modelo y su build; sin embargo, no hay datos sobre sesgos, riesgos de alucinación o limitaciones de idioma en la documentación proporcionada.
- Es un checkpoint cuantizado de terceros, no un release oficial del modelo Ornith.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jcbtc/Ornith1.5-Ciru-Halo-Agent-vllm-strix-halo
- Página de investigación y benchmarks: https://llm.ciru.ai/research/ornith-strix/
- Código fuente e instrucciones de build: https://github.com/ciru-ai/ornith-ciru-halo-agent
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Paper arXiv (según tags): arxiv:2602.06036
