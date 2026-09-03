# darioooooo0o/Spark-X2.5-1.7B-Abliterated-GGUF

## Resumen

Spark-X2.5-1.7B-Abliterated-GGUF es una versión cuantizada y "abliterada" (sin rechazos) del modelo base XHToken/Spark-X2.5-1.7B, publicada por el usuario darioooooo0o. El proceso de ablación elimina la dirección de rechazo del modelo mediante una técnica de ablación de rango 1 sobre un pool multilingüe de 6292 prompts, logrando una reducción drástica de las respuestas de rechazo (de 186/300 a 0/300 en conjuntos sellados) sin daño aparente en las capacidades generales. El modelo se distribuye en formato GGUF con cuatro niveles de cuantización, pensado para ejecución local eficiente con llama.cpp.

Este modelo es relevante para desarrolladores que necesitan un LLM compacto (1.7B parámetros) con capacidades de razonamiento, tool use y agénticas, pero sin las restricciones de seguridad que limitan la generación de contenido sensible. La versión ablacionada mantiene el rendimiento en tareas como HermesBench (5/6 tareas efectivas) y ofrece una ventana de contexto de 65536 tokens, lo que lo hace adecuado para aplicaciones de conversación de largo recorrido y agentes autónomos. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifican detalles en la información disponible) |
| Parametros totales | 1.976.092.672 (aprox. 1.97B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65536 tokens (según configuración de servidor recomendada) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ4_XS |
| Idiomas soportados | No especificados (el pool de entrenamiento incluye 7 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Spark-X2.5-1.7B es un LLM compacto de propósito general desarrollado por XHToken, diseñado para tareas de conversación, escritura, traducción, razonamiento, codificación, tool use y flujos agénticos. La versión ablacionada se obtiene mediante una ablación de dirección de rechazo de rango 1 (técnica "heretic") sobre un pool balanceado de 6292 prompts multilingües (7 idiomas) con sobremuestreo de AdvBench. El proceso incluye una búsqueda Optuna de 50 trials (20 iniciales + 30 TPE) con co-optimización de KL, seleccionando el trial 33 que logra 4/500 rechazos en el conjunto de selección con KL 0.016. La exportación se realiza mediante adapter-save, fusión en CPU y relleno de embeddings atados.

El entrenamiento del modelo base no está detallado en la información disponible, pero se sabe que es un modelo denso de 1.7B parámetros con capacidades de razonamiento (thinking mode) y tool calling. La versión ablacionada mantiene estas capacidades, como demuestra el resultado de 5/6 tareas efectivas en HermesBench.

## Capacidades

- Generación de texto y conversación multilingüe (7 idiomas en el pool de entrenamiento, aunque no se especifican cuáles).
- Razonamiento de múltiples pasos con modo "thinking" que genera trazas de razonamiento antes de la respuesta final (presupuesto de razonamiento configurable).
- Tool calling y function calling, validado con HermesBench (5/6 tareas efectivas).
- Capacidades agénticas para flujos de trabajo autónomos.
- Codificación y asistencia en programación.
- Traducción y escritura creativa.
- Sin rechazos: el modelo no se niega a responder a prompts sensibles o controvertidos, lo que lo hace útil para investigación de seguridad y generación de contenido sin restricciones.

## Casos de uso

- Atención al cliente automatizada: con 65536 tokens de contexto, puede gestionar conversaciones multi-turno largas y mantener el historial completo, respondiendo sin rechazos a consultas delicadas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de no rechazar peticiones de código potencialmente sensible.
- Agentes autónomos de razonamiento: su modo thinking y la capacidad de tool use permiten construir agentes que planifican y ejecutan tareas complejas, como búsqueda de información o automatización de procesos.
- Investigación en seguridad y alineación: al ser una versión sin rechazos, es útil para estudiar comportamientos de modelos, generar adversarial examples o evaluar riesgos de contenido.
- Traducción y localización: su entrenamiento multilingüe (7 idiomas) lo hace adecuado para traducción automática y adaptación de contenido a diferentes mercados.
- Asistente de escritura creativa: puede generar narrativas, guiones o contenido literario sin restricciones temáticas, útil para autores que exploran temas controvertidos.
- Chatbots para nichos específicos: en dominios como salud, finanzas o legal, donde las respuestas directas son necesarias, el modelo puede proporcionar información sin evasivas, aunque con el riesgo de alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de calidad y rendimiento propias:

| Metrica | Base | Ablacionado (t33) |
|---|---|---|
| PPL (calib corpus, 512 ctx, BF16) | 3.8598 ± 0.0097 | 3.9492 ± 0.0099 (+2.3%) |
| Agentic tool-use (HermesBench, 6 tareas) | 5/6 efectivas | 5/6 efectivas |
| KL divergence (objetivo de búsqueda) | — | 0.016 |
| Velocidad de decodificación (RTX 3060, Q6_K) | 171 t/s | 171 t/s (misma arquitectura) |

Además, se reportan resultados de rechazo: 0 rechazos reales en 300 generaciones selladas (frente a 186/300 en el base), y una reducción del 51.5% al 6.7% en el conjunto completo de 3911 prompts dañinos.

## Requisitos de hardware

- VRAM estimada para inferencia: según cuantización, aproximadamente 1.8 GB (Q8_0), 1.4 GB (Q6_K), 1.0 GB (Q4_K_M) y 0.9 GB (IQ4_XS). Se recomienda al menos 2 GB de VRAM para Q8_0 y 1 GB para las versiones más pequeñas.
- GPU recomendadas: cualquier GPU con soporte CUDA o Vulkan, desde tarjetas de consumo como RTX 3060 (probada a 171 t/s con Q6_K) hasta GPUs integradas con suficiente VRAM.
- Cabe en GPUs de consumo: sí, incluso en tarjetas con 2-4 GB de VRAM usando cuantizaciones Q4_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp (llama-server), compatible con el fork de Spark para la arquitectura `spark2_5`. También puede usarse con vLLM o TGI si se convierte a safetensors, aunque no se menciona explícitamente.
- Latencia y throughput: 171 t/s en RTX 3060 con Q6_K, lo que indica un rendimiento adecuado para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (tamaño ~1.7B). El modelo base Spark-X2.5-1.7B es la referencia directa, pero no se han publicado comparativas con alternativas como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B. Se recomienda consultar el repositorio de XHToken para posibles benchmarks comparativos.

## Limitaciones y advertencias

- Aumento de perplejidad: el proceso de ablación incrementa la PPL en un 2.3% respecto al modelo base, lo que puede afectar ligeramente la fluidez en algunos contextos.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- Contenido dañino: al ser "uncensored", el modelo puede generar contenido ilegal, peligroso o éticamente cuestionable. Los desarrolladores deben implementar sus propias capas de filtrado si lo despliegan en producción.
- Consumo de contexto por razonamiento: el modo thinking genera trazas largas (mediana de 1500+ tokens, cola >4000), lo que puede agotar la ventana de contexto si no se limita con `--reasoning-budget`.
- Limitaciones de idioma: aunque el pool de entrenamiento incluye 7 idiomas, no se especifican cuáles, por lo que el rendimiento en idiomas no representados puede ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes aplicables.
- Dependencia del fork de llama.cpp: la arquitectura `spark2_5` requiere un fork específico, lo que puede limitar la portabilidad a otros frameworks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/Spark-X2.5-1.7B-Abliterated-GGUF
- Repo hermano (model card base y notas de arquitectura): https://huggingface.co/darioooooo0o/Spark-X2.5-1.7B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Repositorio GitHub de XHToken/Spark-X2.5: https://github.com/XHToken/Spark-X2.5
