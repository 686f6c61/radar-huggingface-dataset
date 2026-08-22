# Shangy/browsecomp-base-worker-judge-rl

## Resumen

`Shangy/browsecomp-base-worker-judge-rl` es un checkpoint de la campaña de aprendizaje por refuerzo (RL) del orquestador BrowseComp, publicado como liberación de archivo privado por el autor Shangy. Se trata de un modelo de rol de sistema (system-role checkpoint) basado en Qwen3-8B, entrenado con RL para actuar como "worker" dentro de un protocolo orquestador/trabajador de doble agente: el orquestador descompone tareas complejas de navegación web y el worker ejecuta pasos de búsqueda, recuperación y razonamiento. El nombre "worker-judge" indica que el juicio de corrección durante el entrenamiento lo realiza un modelo juez, no una etiqueta humana.

El modelo se publica en dos revisiones, `iter19` e `iter29`, con resultados sostenidos en el benchmark BrowseComp de OpenAI (1,266 problemas de navegación persistente). En tres ejecuciones de 150 preguntas, `iter19` alcanza 0.5933 y `iter29` 0.5991, superando al ancla base de Qwen3-8B (0.5575) en 3.6 y 4.2 puntos respectivamente, con significancia estadística (prueba de signos pareada, p=0.0036 y p=0.0183). La relevancia del modelo radica en que demuestra que el RL con juez integrado mejora las capacidades de navegación de un modelo de 8B parámetros sin necesidad de modelos de mayor tamaño, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parámetros totales | 8.000 millones (8B) |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el modelo; el base Qwen3-8B soporta 32.768 tokens nativos |
| Tipos de cuantización | No disponibles |
| Idiomas soportados | No disponibles en la model card; el base Qwen3-8B soporta inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio de 32.8 GB; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de Qwen3-8B: 36 capas, atención multi-cabeza con RoPE y QK-Norm, y un vocabulario de aproximadamente 151.000 tokens. No se han publicado detalles adicionales sobre el diseño específico del modelo base en esta liberación.

El entrenamiento se enmarca en una campaña de RL orquestador/trabajador para BrowseComp, con configuración "base + worker judge + hybrid search", tamaño de grupo 4 y identificador de trabajo 1576. El proceso combina refuerzo sobre trayectorias de navegación con un modelo juez que evalúa la corrección de las respuestas del worker, y búsqueda híbrida (probablemente una mezcla de búsqueda textual y navegación estructurada). No se especifica el algoritmo concreto (PPO, GRPO, etc.), el número de pasos, ni el dataset de entrenamiento. La documentación de origen se cita como `docs/experiments/orch-worker-rl-campaign.md` en el repositorio del autor.

Una característica destacable es que el checkpoint se evalúa de forma específica a través del protocolo orquestador/worker de BrowseComp, no como modelo de chat genérico. Esto implica que el rendimiento reportado depende del orquestador que lo acompaña, y no es comparable directamente con métricas de modelos conversacionales estándar.

## Capacidades

- Navegación web autónoma: ejecuta tareas de búsqueda persistente y recuperación de información en internet, siguiendo instrucciones del orquestador.
- Razonamiento multi-paso: mantiene estado durante tareas largas y se recupera de errores (requisito del benchmark BrowseComp).
- Uso de herramientas de navegación: integrado con el protocolo de búsqueda híbrida (hybrid search) del sistema.
- Evaluación interna: el rol de juez (worker-judge) permite la autoevaluación durante el entrenamiento, mejorando la selección de respuestas.
- Capacidades multilingües: no documentadas en esta liberación; el base Qwen3-8B soporta inglés y chino, pero el entrenamiento específico no especifica idiomas.
- Generación de texto: hereda las capacidades de texto del base, aunque el uso previsto es como agente de navegación, no como chat.

## Casos de uso

- Investigación de mercado automatizada: el modelo puede navegar por múltiples fuentes web para recopilar datos de competidores, precios o tendencias, siguiendo un plan definido por un orquestador. Su ventaja es la persistencia en tareas de búsqueda prolongada, algo que los modelos de chat estándar no mantienen.
- Extracción de información de documentos web dinámicos: útil para extraer datos de páginas con contenido cambiante o enlazado en profundidad, como informes financieros o noticias en portales, donde la navegación multi-paso es necesaria.
- Verificación de hechos y citas: el worker puede buscar y validar afirmaciones en fuentes primarias, un caso donde la precisión por encima de la velocidad es crítica, y donde el entrenamiento con juez reduce la alucinación.
- Generación de informes de inteligencia competitiva: el sistema orquestador/worker puede recopilar y sintetizar información dispersa en la web, generando resúmenes estructurados con referencias a las fuentes consultadas.
- Asistencia en investigación académica: el modelo puede localizar artículos, datos y resultados en repositorios web, gestionando tareas de búsqueda de múltiples pasos que requieren mantener el estado entre consultas.
- Automatización de monitorización de cambios en la web: el worker puede seguir cambios en páginas o portales, comparando versiones y notificando diferencias, un caso de uso que aprovecha la persistencia del estado de la tarea.

## Benchmarks y rendimiento

El modelo se evalúa exclusivamente en el benchmark BrowseComp de OpenAI (1.266 problemas de navegación persistente). Los resultados reportados en la model card son:

| Modelo | Resultado en BrowseComp (150 preguntas) | Diferencia vs. ancla base | Significación |
|---|---|---|---|
| Qwen3-8B base (ancla) | 0.5575 | - | - |
| `iter19` (worker-judge RL) | 0.5933 | +3.6 puntos | p=0.0036 |
| `iter29` (worker-judge RL) | 0.5991 | +4.2 puntos | p=0.0183 |

Los resultados provienen de tres ejecuciones de 150 preguntas cada una. El modelo hermano SFT `browsecomp-worker-sft-core-v256` alcanza 0.620 en el mismo conjunto de test, y el modelo mix `browsecomp-worker-sft-mix-v256` llega a 0.720 (techo del worker MiniMax). El líder del leaderboard de BrowseComp, Kimi K3, obtiene 0.912, aunque se trata de un modelo de tamaño muy superior. No se han publicado resultados en benchmarks de texto genéricos (MMLU, HumanEval, GSM8K) para este checkpoint.

## Requisitos de hardware

- VRAM estimada: ~16 GB en BF16 para los pesos de 8B parámetros; ~8 GB con cuantización de 4 bits (GGUF/Q4_K_M).
- GPU recomendadas: RTX 4090 (24 GB) o superior para ejecución en BF16 sin cuantizar; A100/H100 para despliegue en producción con múltiples instancias.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 4090, RTX 3090 (24 GB) y GPUs de 16 GB con cuantización de 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (con conversión a GGUF), todos compatibles con arquitectura Qwen3-8B.
- Latencia y throughput: no disponibles en la información del modelo; en hardware similar, un modelo de 8B en BF16 suele generar entre 30-60 tokens/s en una RTX 4090 con vLLM, pero no se ha medido para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BrowseComp (150 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shangy/browsecomp-base-worker-judge-rl (`iter29`) | 8B | no disponible | 0.5991 | Apache 2.0 | Hugging Face |
| Shangy/browsecomp-worker-sft-core-v256 | 8B | no disponible | 0.620 | Apache 2.0 | Hugging Face |
| Shangy/browsecomp-worker-sft-mix-v256 | 8B | no disponible | 0.720 | Apache 2.0 | Hugging Face |
| Qwen3-8B (base) | 8B | 32K | 0.5575 | Apache 2.0 | Hugging Face |
| Kimi K3 (referencia líder) | >1T | no disponible | 0.912 | no disponible | propietario |

El modelo RL supera al base en 3.6-4.2 puntos, pero es inferior al modelo SFT con mix de datos (0.720), lo que sugiere que el RL con juez aún no alcanza el techo del SFT en este dominio. La comparación con Kimi K3 es indicativa de la diferencia de escala, no de calidad del enfoque.

## Limitaciones y advertencias

- El modelo es un checkpoint de sistema (system-role) y no debe evaluarse ni usarse como modelo de chat genérico; su rendimiento depende del protocolo orquestador/worker de BrowseComp.
- Los resultados de BrowseComp se basan en 150 preguntas (tres ejecuciones), no en el conjunto completo de 1.266; la variabilidad entre ejecuciones no se reporta explícitamente, aunque la prueba sign test indica significación.
- El entrenamiento con RL con juez puede introducir sesgos del propio juez: si el juez tiene errores sistemáticos, el modelo los hereda.
- Riesgo de alucinación en tareas de navegación: no se han evaluado tasas de alucinación específicas para este checkpoint.
- Limitaciones de idioma: no documentadas; el base Qwen3-8B está optimizado para inglés y chino, y no se conoce el comportamiento en otros idiomas.
- Sin datos de contexto: la ventana de 32K del base puede ser insuficiente para tareas de navegación muy largas; no se ha probado con extensiones tipo YaRN.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo depende de Qwen3-8B, que también es Apache 2.0; no hay restricciones adicionales.
- Reproducibilidad: el autor indica que es una "liberación de archivo privado" y que el snapshot de emergencia es `ys-2020/miles@5ed731544`; la documentación de entrenamiento no es pública, por lo que la reproducibilidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shangy/browsecomp-base-worker-judge-rl
- Modelo hermano SFT (core): https://huggingface.co/Shangy/browsecomp-worker-sft-core-v256
- Benchmark BrowseComp (OpenAI): https://openai.com/index/browsecomp/
- Leaderboard BrowseComp en llm-stats: https://llm-stats.com/benchmarks/browsecomp
- BenchmarkList BrowseComp: https://benchmarklist.com/benchmarks/browsecomp/
- Comparativa de modelos en BenchLM: https://benchlm.ai/
