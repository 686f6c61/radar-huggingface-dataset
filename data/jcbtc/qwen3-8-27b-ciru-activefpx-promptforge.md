# jcbtc/Qwen3.8-27B-CIRU-ActiveFPX-PromptForge

## Resumen

Qwen3.8-27B-CIRU-ActiveFPX-PromptForge es una versión optimizada del modelo base Qwen/Qwen3.8-27B, publicada por el usuario jcbtc, diseñada específicamente para sistemas AMD ROCm. El modelo base es un LLM de 27.320.697.856 parámetros (~27.3B) con arquitectura híbrida de atención y capas Gated DeltaNet, y aunque la arquitectura original es multimodal (28B), esta release se centra exclusivamente en generación de texto y no incluye proyector de visión.

La optimización combina tres elementos técnicos: ActiveFPX, que aplica asignación de tensores consciente del runtime, ecualización y restauración selectiva de precisión para reducir memoria y ancho de banda manteniendo la calidad; PromptForge, una ruta de preprocesamiento de prompts acelerada con proyecciones preempaquetadas y ejecución fusionada; y un módulo nativo de multi-token prediction (MTP) de profundidad 4 para aumentar el throughput de generación. El resultado es una release pensada para servir texto en producción con contexto de 64K tokens, cache de prompts y batching continuo, manteniendo compatibilidad con la arquitectura original de Qwen3.8.

La relevancia de este modelo radica en que aborda el despliegue eficiente de modelos grandes en hardware AMD, tradicionalmente menos soportado que NVIDIA, ofreciendo mejoras medibles de rendimiento en prefill y generación sin sacrificar calidad de forma significativa. Los benchmarks publicados muestran un incremento de hasta un 21,54% en throughput de prefill en prompts de 2.048 tokens y una reducción del 2,55% en tiempo total de pared en cargas end-to-end, con una degradación de perplexidad de solo +2,53% respecto a BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida attention/Gated DeltaNet (base Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (~27.3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 64.000 tokens (configuración por defecto en serving) |
| Tipos de cuantizacion | No especificada (archivo GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF + archivos complementarios .pfs (PromptForge FFN y Gated DeltaNet) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura híbrida que combina mecanismos de atención tradicional con capas Gated DeltaNet, una variante de atención lineal con estado recurrente. Esta release conserva esa arquitectura, incluyendo el módulo nativo de multi-token prediction (MTP) de profundidad 4, que permite predecir varios tokens futuros simultáneamente durante la generación para aumentar el throughput sin sustituir la ruta de generación original.

Las optimizaciones introducidas por CIRU (el runtime propietario) son a nivel de ejecución, no de arquitectura. ActiveFPX realiza una asignación de tensores consciente del runtime, ecualización y restauración selectiva de precisión en los tensores de la ruta residual más sensibles, mientras que embeddings, comportamiento de salida y el módulo MTP permanecen compatibles con la arquitectura Qwen3.8. PromptForge, por su parte, acelera el preprocesamiento de prompts mediante vistas de proyección preempaquetadas, fusión de proyecciones, ejecución FFN fusionada y empaquetado SwiGLU-to-down fusionado. No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni sobre el proceso de ajuste de esta release.

## Capacidades

- Generación de texto autoregresiva con soporte de contexto largo (64K tokens) y multi-token prediction nativo (MTP de profundidad 4).
- Razonamiento y resolución de tareas de agente: obtuvo 98/100 en el benchmark HermesAgent-20, que evalúa 20 tareas variadas de agentes y herramientas con cache activa, temperatura 0.7 y top-p 0.95.
- Generación de código: alcanzó 95,73% pass@1 en HumanEval y 90,24% en HumanEval+ (versión ampliada con 164 problemas, ejecución determinista adaptada a chat).
- Tool calling y function calling: el resultado de HermesAgent-20 indica capacidad para usar herramientas en flujos multi-paso.
- Capacidades multilingües: no especificadas en la documentación disponible.
- Sin capacidades de visión: esta release no incluye proyector de visión, a diferencia del modelo base multimodal.
- Modo de razonamiento (thinking) desactivado por defecto en la configuración de serving recomendada.

## Casos de uso

- Servicio de inferencia en producción sobre hardware AMD ROCm: el modelo está específicamente optimizado para GPUs AMD con el runtime CIRU ROCmFPX, ofreciendo mejoras de prefill de hasta +21,54% en prompts de 2K tokens y reducción de tiempo total de pared del 2,55% en cargas mixtas.
- Generación de código asistida en entornos de desarrollo: con 95,73% pass@1 en HumanEval, puede integrarse en IDEs o pipelines de CI/CD para autocompletado y revisión de código, aprovechando el contexto de 64K tokens para incluir archivos completos.
- Agentes conversacionales con tool calling: el rendimiento en HermesAgent-20 (98/100) lo hace adecuado para sistemas de agentes que necesitan llamar a APIs, consultar bases de datos o ejecutar acciones en múltiples pasos.
- Análisis y resumen de documentos largos: la ventana de 64K tokens permite procesar informes extensos, contratos o logs de sistema en una sola pasada, con cache de prompts para consultas recurrentes.
- Asistencia al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto persistente gracias a la cache de prompts y al batching continuo, soportando temperaturas bajas para respuestas consistentes.
- Despliegue en entornos con restricciones de memoria: ActiveFPX reduce el coste de memoria y ancho de banda, permitiendo servir el modelo en GPUs con VRAM limitada (aunque no se especifican cifras exactas) sin renunciar a la calidad en los tensores críticos.

## Benchmarks y rendimiento

Los siguientes resultados fueron medidos en un sistema AMD Ryzen AI Max+ 395 / Radeon 8060S con el runtime CIRU ROCmFPX (tag `qwen3.8-activefpx-promptforge-v1`). Son específicos de esa configuración de hardware y no deben considerarse generalizables.

| Evaluación | Resultado | Notas |
|---|---|---|
| HermesAgent-20 | 98 / 100 | 20 tareas de agente/herramienta; cache activa; temp 0.7; top-p 0.95; thinking off; sin reintentos |
| HumanEval pass@1 | 157 / 164 (95,73%) | Ejecución determinista adaptada a chat (EvalPlus); thinking off |
| HumanEval+ pass@1 | 148 / 164 (90,24%) | Misma ejecución completa de 164 problemas |
| Perplexidad vs BF16 (target compacto) | +2,53% | Corpus fijo de calibración pareado |

Rendimiento en servicio real (workload HermesAgent-20, cache activa, producción):

| Workload | PP (tok/s) | TG servido (tok/s) | Aceptación MTP nativo |
|---|---|---|---|
| HermesAgent-20, cache-on | 310,24 | 33,68 | 77,43% |
| Perfil compacto previo equivalente | 303,62 | 33,09 | 74,31% |

Rendimiento de PromptForge (ruta de prefill acelerada):

| Workload de prompt | Release CIRU | Perfil compacto equivalente | Cambio |
|---|---|---|---|
| 2.048 tokens | 395,28 PP tok/s | 325,22 PP tok/s | +21,54% |
| 8.192 tokens | 356,98 PP tok/s | 296,23 PP tok/s | +20,51% |
| 3.524 tokens + 128 generados | 353,54 PP tok/s, 38,33 TG tok/s | 334,66 PP tok/s, 40,95 TG tok/s | +5,64% PP, -6,40% TG, -2,55% tiempo total |

Nota: las filas aisladas de prompt muestran las mayores ganancias de prefill de PromptForge; la fila end-to-end incluye generación con MTP nativo y es la comparación de latencia más representativa.

## Requisitos de hardware

- Plataforma: AMD ROCm, validado en AMD Ryzen AI Max+ 395 / Radeon 8060S.
- VRAM estimada: no especificada en la documentación. El archivo GGUF pesa aproximadamente 37 GB (tamaño del repositorio), por lo que se recomienda al menos 40-48 GB de VRAM para cargarlo completo con contexto de 64K; esta cifra es una estimación basada en el tamaño del archivo, no un dato oficial.
- GPU recomendadas: GPUs AMD compatibles con ROCm (Radeon 8060S, series RX 7000, MI300, etc.). No se mencionan GPUs NVIDIA.
- Opciones de despliegue: llama-server (llama.cpp) con flags específicos para ROCm y el runtime CIRU ROCmFPX. Se requiere el runtime pinneado y los archivos complementarios `.pfs` para la ruta acelerada.
- Latencia y throughput: los benchmarks indican PP de hasta 395 tok/s y TG servido de ~34 tok/s en el hardware de referencia, con una tasa de aceptación MTP del 77,43%.
- El runtime exige la versión `qwen3.8-activefpx-promptforge-v1` de ROCmFPX (commit `a71e6c8a`) y un commit específico de AMD Composable Kernel (`fdf4bb7f`).

## Comparativa con modelos similares

La información disponible no incluye comparaciones directas con otros modelos de la misma categoría (p. ej., Llama-3.1-8B, Mistral-7B, etc.). La comparativa publicada se limita al propio modelo frente a su perfil compacto anterior y a la ruta nativa sin PromptForge, como se muestra en las tablas de benchmarks. Se puede considerar que el modelo base Qwen3.8-27B es el punto de referencia natural, y esta release añade optimizaciones de rendimiento sin cambiar la arquitectura subyacente. No se dispone de datos para comparar con otros modelos de 27B en tareas estándar.

## Limitaciones y advertencias

- No incluye proyector de visión: aunque el modelo base es multimodal, esta release está limitada a texto.
- Requiere un runtime específico (CIRU ROCmFPX) y archivos complementarios `.pfs` para la ruta acelerada; sin ellos, el modelo solo puede ejecutarse a través de una ruta nativa compatible, perdiendo las ganancias de PromptForge.
- Los benchmarks son específicos del hardware AMD Ryzen AI Max+ 395 / Radeon 8060S y no deben extrapolarse a otras plataformas.
- La degradación de calidad en el target compacto es de +2,53% de perplexidad respecto a BF16; aunque es pequeña, puede ser relevante en aplicaciones sensibles a la precisión.
- El modo de razonamiento (thinking) está desactivado por defecto; si se necesita razonamiento explícito, debe configurarse manualmente.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en idiomas distintos del inglés (los benchmarks son en inglés).
- La licencia Apache-2.0 permite uso comercial, pero el runtime propietario CIRU puede tener términos adicionales que deben revisarse antes de desplegar en producción.
- El número de descargas es 0 y el modelo se creó en agosto de 2026; se trata de una release muy reciente con adopción aún no demostrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jcbtc/Qwen3.8-27B-CIRU-ActiveFPX-PromptForge
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del runtime CIRU ROCmFPX: https://github.com/ciru-ai/ROCmFPX
- Tag del runtime: https://github.com/ciru-ai/ROCmFPX/tree/qwen3.8-activefpx-promptforge-v1
- Commit del runtime: https://github.com/ciru-ai/ROCmFPX/commit/a71e6c8a63ab947399a315095e08c8d8ad043dda
- Documentación de build y dependencias: https://github.com/ciru-ai/ROCmFPX/blob/release/qwen3.8-activefpx-promptforge-v1/docs/activefpx-promptforge-qwen38.md
