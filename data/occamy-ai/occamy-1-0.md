# occamy-ai/occamy-1.0

## Resumen

Occamy-35B (identificado como occamy-ai/occamy-1.0) es un modelo de lenguaje agéntico desarrollado por Occamy AI, diseñado específicamente para tareas de decisión de largo horizonte, uso coordinado de múltiples herramientas y flujos de trabajo empresariales complejos. Se trata de un modelo post-entrenado a partir de Qwen3.6-35B-A3B, lo que le confiere una arquitectura de mezcla de expertos (MoE) con 35.107 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Su ventana de contexto alcanza los 262.144 tokens, lo que lo hace apto para razonamiento con documentos extensos y conversaciones multi-turno prolongadas.

La principal innovación del modelo es el framework **Data RSI (Data Recursive Self-Improvement)**, un sistema de evolución de datos dirigida por el propio modelo: cada rollout genera nuevas tareas ejecutables combinando persona, herramientas, fixtures, habilidades, restricciones y evaluadores, y los resultados se retroalimentan al generador de datos para ajustar las tareas a la frontera de capacidades del modelo. Según los datos publicados por el autor, Occamy-35B iguala o supera en varios benchmarks agénticos a modelos sustancialmente mayores como GLM-5.2 y DeepSeek-V4 Pro, lo que lo sitúa como una opción relevante para investigación y despliegue de agentes en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe_text (Transformer MoE con GQA) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | ~3 B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Occamy-35B emplea una arquitectura Transformer con mezcla de expertos (MoE) basada en Qwen3.6-35B-A3B. Según el grafo de arquitectura disponible, el modelo tiene 40 capas transformer, un tamaño oculto de 2048, 16 cabezas de consulta y 2 cabezas clave/valor (grouped-query attention), y una capa feed-forward con 256 expertos de los cuales 8 se activan por token. Esta configuración permite un coste de inferencia relativamente bajo en comparación con modelos densos de tamaño similar, manteniendo una alta capacidad de representación.

El entrenamiento se realizó mediante un proceso de post-entrenamiento sobre el modelo base Qwen3.6-35B-A3B, con un enfoque novedoso denominado Data RSI. Este framework genera dinámicamente tareas de entrenamiento combinando distintos componentes (persona, herramientas, fixtures, habilidades, restricciones y evaluadores), y utiliza los resultados de cada rollout para identificar brechas de capacidad y patrones de comportamiento exitosos. Esta retroalimentación guía la generación de nuevas tareas hacia la frontera de capacidades del modelo, creando un bucle cerrado de evolución de datos adaptativa. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Razonamiento agéntico de largo horizonte: capaz de mantener objetivos complejos a lo largo de múltiples pasos y decisiones.
- Uso coordinado de múltiples herramientas: integra llamadas a funciones (tool calling) de forma secuencial o paralela, con parser compatible con Qwen3-Coder.
- Generación de código y resolución de tareas de ingeniería de software (SWE-bench, Terminal-Bench).
- Manejo de contextos largos de hasta 256K tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidad de seguir instrucciones en inglés y mantener coherencia en diálogos multi-turno.
- Compatible con pipelines de agente tipo Claw (entornos interactivos con herramientas) y flujos de trabajo de negocio como e-commerce.
- Soporte de modo de razonamiento (reasoning parser Qwen3) y generación de respuestas con pasos intermedios.

## Casos de uso

- Automatización de flujos de trabajo empresariales: el modelo puede orquestar secuencias de acciones que involucran múltiples herramientas (bases de datos, APIs, hojas de cálculo) gracias a su capacidad de tool calling y su ventana de 256K tokens para mantener el estado de la tarea.
- Agentes de atención al cliente en e-commerce: puede gestionar conversaciones multi-turno con contexto largo, consultar catálogos, procesar devoluciones y escalar a un humano cuando sea necesario, como se refleja en los benchmarks RealReplicaBench y τ³-Bench.
- Desarrollo de software asistido: integrado en pipelines de CI/CD, puede resolver issues de repositorios, generar parches y ejecutar comandos en terminal, con resultados reportados en SWE-bench Pro y Terminal-Bench 2.1.
- Investigación en agentes autónomos: su framework Data RSI y la publicación de datos derivados de escenarios reales permiten a los investigadores estudiar la evolución de datos y el entrenamiento de agentes.
- Asistentes de razonamiento con herramientas: puede actuar como un copiloto que combina búsqueda web, ejecución de código y análisis de documentos en un solo hilo conversacional.
- Simulación de usuarios y evaluadores en benchmarks: el modelo puede emplearse como simulador de usuario (como se hace en τ³-Bench) o como evaluador automático de agentes en entornos controlados.
- Despliegue de APIs de generación de texto compatibles con OpenAI: gracias a su soporte en SGLang y vLLM, puede servir peticiones de chat y completions en producción con alta concurrencia.

## Benchmarks y rendimiento

Los siguientes resultados han sido reportados por el equipo de Occamy AI en la model card del modelo. Se presentan tal cual, sin verificación independiente. La marca "—" indica que el modelo no fue evaluado en ese benchmark.

| Benchmark | Occamy-35B-A3B | Qwen3.6-35B-A3B | Gemma 4 31B | Qwen3.6-27B | KAT-Coder-V2.5-Dev | Muse-Glimmer-30B | Claude Opus 4.6 | GLM-5.2 | GPT-5.6 Sol | DeepSeek-V4 Pro | Claude Opus 4.8 | GPT-5.4 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claw-Eval Avg | **84.3** | 68.7 | 48.5 | 72.4 | — | — | 80.4 | 81.6 | — | 77.2 | — | 78.4 |
| Claw-Eval Pass³ | **71.3** | 50.0 | 25.0 | 60.6 | — | — | 70.4 | 68.3 | — | 59.8 | — | 60.3 |
| WildClawBench | **50.1** | 40.4 | 37.6 | 43.2 | — | 47.6 | 51.6 | 54.2 | 67.2 | 43.7 | 64.7 | 50.3 |
| τ³-Bench Pass¹ | **31.2** | 11.9 | — | — | — | — | 27.3 | 29.6 | 46.9 | — | 39.7 | 39.4 |
| RealReplicaBench | **37.3** | 19.6 | — | — | — | — | 43.9 | 39.3 | 49.5 | 33.6 | 51.4 | 42.1 |
| Terminal-Bench 2.1 | **59.0** | 49.5 | — | — | 41.0 | 51.7 | — | 82.7 | 88.8 | 67.9 | 78.9 | — |
| SWE-bench Pro | **43.5** | 40.4 | — | 53.5 | 46.0 | 51.2 | — | 62.1 | 64.6 | 55.4 | 69.2 | 57.5 |

Nota: los resultados de Terminal-Bench 2.1 se obtuvieron con el harness Harbor/Terminus-2, timeout de 3 horas, 32 CPU/48 GB RAM, temperatura 1.0, top_p 0.95, top_k 20, max_tokens 80K y contexto 256K (promedio de dos ejecuciones). SWE-bench Pro se evaluó con un scaffold interno con herramientas bash y str_replace_edit, temperatura 1.0, top_p 0.95 y contexto 200K, re-evaluando todos los modelos bajo el mismo entorno. τ³-Bench se reporta sobre Banking Knowledge con AllTools retrieval y GPT-5.2 como simulador de usuario.

## Requisitos de hardware

- El tamaño del repositorio es de 70,2 GB en safetensors, lo que sugiere que los pesos están en precisión FP16/BF16. En esta precisión, la VRAM necesaria para cargar el modelo completo supera los 70 GB, por lo que no cabe en una GPU de consumo estándar (RTX 4090 con 24 GB, por ejemplo).
- Los comandos de despliegue recomendados por el autor utilizan tensor parallelism de 8 (tp-size 8 o tensor-parallel-size 8), lo que implica al menos 8 GPUs de alta gama (por ejemplo, A100 80 GB o H100) para servir el modelo con la ventana de contexto completa de 262K tokens.
- Con cuantización (por ejemplo, FP8 o INT4), sería posible reducir la huella de VRAM, pero no se han publicado cifras oficiales ni archivos cuantizados en el repositorio.
- Opciones de despliegue recomendadas: SGLang (>=0.5.10) y vLLM (>=0.19.0), ambos exponiendo una API compatible con OpenAI. También se menciona compatibilidad con FriendliAI para inferencia de baja latencia.
- La latencia y el throughput dependen del hardware y la configuración; no se han publicado mediciones oficiales. Con 8 GPUs y contexto largo, se espera un rendimiento adecuado para tareas agénticas, pero es recomendable realizar pruebas de carga propias.

## Comparativa con modelos similares

Occamy-35B comparte arquitectura y tamaño con su modelo base Qwen3.6-35B-A3B, y se posiciona frente a otros modelos abiertos de tamaño similar o mayor. La siguiente comparativa se basa en los datos de la model card.

| Modelo | Parametros totales | Parametros activos | Contexto | Claw-Eval Avg | SWE-bench Pro | Licencia |
|---|---|---|---:|---:|---:|---|
| Occamy-35B-A3B | 35,1 B | ~3 B | 262K | **84.3** | 43.5 | no disponible |
| Qwen3.6-35B-A3B | 35,1 B | ~3 B | 262K (estimado) | 68.7 | 40.4 | no disponible |
| Gemma 4 31B | ~31 B (denso) | 31 B | no disponible | 48.5 | — | no disponible |
| Qwen3.6-27B | ~27 B (denso) | 27 B | no disponible | 72.4 | 53.5 | no disponible |

Occamy-35B supera claramente a su modelo base en los benchmarks agénticos (Claw-Eval, WildClawBench, τ³-Bench, RealReplicaBench), lo que demuestra la efectividad del post-entrenamiento con Data RSI. Frente a modelos densos como Qwen3.6-27B, Occamy obtiene mejores resultados en Claw-Eval pero peores en SWE-bench Pro, lo que sugiere un enfoque más orientado a tareas de agente que a ingeniería de software pura. En comparación con modelos propietarios mucho mayores (GLM-5.2, DeepSeek-V4 Pro, Claude Opus 4.6), Occamy compite favorablemente en varios benchmarks, aunque queda por detrás en Terminal-Bench 2.1 y SWE-bench Pro frente a los modelos más grandes.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que genera incertidumbre sobre su uso comercial y la redistribución. Es imprescindible contactar con el autor antes de utilizarlo en producción.
- El modelo declara únicamente inglés como idioma soportado; no se garantiza un rendimiento adecuado en otros idiomas, incluido el español.
- Los benchmarks publicados han sido reportados por el propio equipo de Occamy AI, sin verificación externa independiente. Algunos resultados (marcados con asterisco) fueron evaluados internamente, lo que puede introducir sesgos en la comparación.
- No se han publicado datos sobre sesgos, alucinaciones o comportamientos no deseados. Como modelo post-entrenado a partir de Qwen3.6, es probable que herede sesgos del modelo base, pero no hay documentación al respecto.
- El despliegue en producción requiere hardware sustancial (mínimo 8 GPUs de alta gama) y una configuración cuidadosa de SGLang o vLLM. No se proporcionan guías para cuantización ni despliegue en entornos con menos recursos.
- El framework Data RSI y los datos publicados (occamy-data-1.0) son un subconjunto de los datos reales; los detalles completos del entrenamiento no están disponibles, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/occamy-ai/occamy-1.0
- Dataset asociado: https://huggingface.co/datasets/occamy-ai/occamy-data-1.0
- Blog de Occamy AI: https://occamy-ai.github.io/
- Perfil de la organización: https://huggingface.co/occamy-ai
- Página en LLM Explorer: https://llm-explorer.com/model/occamy-ai%2Foccamy-1.0,2B1xmmC0EgaUYpxEyhqCzB
- Despliegue en FriendliAI: https://friendli.ai/models/occamy-ai/occamy-1.0
