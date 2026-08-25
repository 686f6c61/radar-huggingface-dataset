# moonshotai/Kimi-Linear-48B-A3B-Instruct

## Resumen

Kimi Linear es una arquitectura de atención lineal híbrida desarrollada por MoonshotAI, la empresa detrás de los modelos Kimi. Este modelo de 48B parámetros totales con 3B activos (MoE) introduce Kimi Delta Attention (KDA), una evolución del Gated DeltaNet que optimiza el uso de memoria RNN de estado finito mediante un mecanismo de gating más eficiente. El modelo se publica en dos versiones, base e instruct, entrenadas con 5,7 billones de tokens.

La relevancia de Kimi Linear radica en su capacidad para mantener un rendimiento comparable al de la atención completa mientras reduce el uso de KV cache hasta un 75% y acelera la decodificación hasta 6 veces en contextos de 1M tokens. Su arquitectura híbrida combina una proporción de 3:1 entre capas de atención lineal KDA y capas globales MLA (Multi-head Latent Attention), lo que le permite superar a la atención completa en tareas de contexto largo y en regímenes de escalado de aprendizaje por refuerzo. El modelo se distribuye con licencia MIT y es compatible con el ecosistema Transformers y vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Kimi Delta Attention (KDA) + Multi-head Latent Attention (MLA), MoE |
| Parámetros totales | 49.122.681.728 |
| Parámetros activos | 3B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (presumiblemente multilingüe, incluyendo inglés y chino, pero no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi Linear emplea una arquitectura híbrid de atención lineal con una proporción de 3:1 entre capas KDA y capas globales de MLA. KDA refina el Gated DeltaNet introduciendo un mecanismo de gating más fino que optimiza el uso de la memoria de estado finito de la RNN, permitiendo almacenar información relevante de forma más selectiva. Esta combinación reduce el tamaño de la KV cache en hasta un 75% y mejora el throughput de decodificación hasta 6 veces en secuencias largas de 1M tokens, manteniendo un rendimiento comparable o superior a la atención completa en tareas de contexto corto y largo.

El modelo se entrenó con 5.7 billones de tokens. La versión Instruct ha sido sometida a un proceso de alineación adicional (no se especifica si fue RLHF o DPO en la información disponible). El kernel KDA se ha publicado en la librería FLA (Flash Linear Attention), lo que facilita su integración en proyectos de investigación y producción. El modelo está disponible en versiones Base e Instruct, ambas con la misma arquitectura y contexto de 1M tokens.

## Capacidades

- Generación de texto y razonamiento en tareas de lenguaje natural con calidad competitiva frente a modelos de atención completa de tamaño similar.
- Procesamiento de contextos extremadamente largos (hasta 1M tokens) con un consumo de memoria reducido gracias a la KV cache compacta.
- Soporte de tool calling y function calling a través de la integración con vLLM y el formato de chat de Transformers.
- Capacidad para tareas de razonamiento multi-paso y aprendizaje por refuerzo, con buenos resultados en benchmarks de estilo RL.
- Decodificación de alta velocidad en secuencias largas, con un TPOT (tiempo por token de salida) hasta 6.3 veces más rápido que MLA en contextos de 1M tokens.
- Soporte de despliegue en API compatible con OpenAI mediante vLLM, lo que facilita su uso en aplicaciones de producción.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 1M tokens, lo que permite mantener el historial completo de interacciones largas y referencias a documentación extensa sin pérdida de información.
- Análisis de documentos legales o financieros: su capacidad de procesar miles de páginas en una sola pasada permite extraer cláusulas, identificar riesgos y resumir contratos o informes anuales completos.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código en repositorios de gran tamaño, manteniendo el contexto del proyecto completo.
- Sistemas RAG (Retrieval-Augmented Generation) sobre bases de conocimiento grandes: la KV cache eficiente permite consultar y razonar sobre corpus extensos sin degradación de rendimiento.
- Asistentes de investigación científica: puede leer y sintetizar artículos de investigación completos, comparar metodologías y extraer conclusiones de documentos técnicos de decenas de miles de tokens.
- Agentes autónomos de razonamiento multi-step: gracias a su buen comportamiento en tareas de RL y su capacidad de mantener el estado de la conversación durante largos episodios, es adecuado para agentes que planifican y ejecutan acciones secuenciales.

## Benchmarks y rendimiento

La información disponible incluye los siguientes resultados:

| Benchmark | Resultado |
|---|---|
| MMLU-Pro (4k contexto) | 51.0 |
| RULER (128k contexto) | 84.3 |
| Speedup en RULER vs atención completa | 3.98x |
| Speedup TPOT vs MLA (1M tokens) | 6.3x |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar como HumanEval, GSM8K o MMLU completo. Los datos indican que Kimi Linear es Pareto-óptimo en RULER con contexto de 128k, superando a la atención completa en velocidad y manteniendo un rendimiento competitivo en MMLU-Pro.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 49.1B parámetros en safetensors (98.5 GB). Con cuantización de 4 bits, se estima que requiere al menos 40-50 GB de VRAM; con cuantización de 8 bits, entre 80-100 GB. En FP16/FP32, más de 100 GB.
- GPU recomendadas: para inferencia en producción se requiere al menos una A100 80GB o H100 80GB, o múltiples GPUs en paralelo (por ejemplo, 4x A100 80GB para contexto completo de 1M). En consumer, una RTX 4090 (24 GB) solo es viable con cuantización agresiva y contexto reducido.
- Opciones de despliegue: vLLM (recomendado, con tensor-parallel-size 4 para 1M de contexto), Transformers con trust_remote_code, y potencialmente llama.cpp si se publican pesos GGUF (no disponibles actualmente).
- Latencia y throughput: el modelo ofrece un TPOT hasta 6.3 veces más rápido que MLA en contextos de 1M tokens, lo que se traduce en una latencia de deco muy reducida en secuencias largas. El throughput en generación depende del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información publicada. Sin embargo, Kimi Linear se posiciona como una alternativa a modelos de atención completa de tamaño similar (48B totales, 3B activos) como Qwen2.5-72B-A3B o DeepSeek-V2-Lite. La principal diferencia es su arquitectura de atención lineal, que le permite mantener un rendimiento competitivo en contexto largo con un coste de memoria muy inferior. A falta de benchmarks públicos comparables, se recomienda evaluar el modelo en las tareas específicas de interés.

## Limitaciones y advertencias

- Sesgos desconocidos: no se han publicado estudios de sesgos para este modelo. Al ser entrenado con datos web, puede presentar sesgos socioculturales que deben evaluarse antes de su uso en producción.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar contenido falso o no verificado, especialmente en contextos largos donde la información se comprime en la memoria de estado.
- Limitaciones de idioma: no se ha publicado la lista de idiomas soportados. Aunque probablemente el modelo es bilingüe (inglés/chino), su rendimiento en otros idiomas no está confirmado.
- Restricciones de licencia: aunque la licencia MIT permite uso comercial, es importante verificar que el uso de los kernels KDA de FLA cumpla con las condiciones de la licencia de la librería.
- Dependencia de código personalizado: el modelo requiere trust_remote_code y la librería fla-core para funcionar, lo que puede generar problemas de compatibilidad en entornos restringidos.
- Rendimiento en contexto corto: aunque el modelo es competitivo en tareas de contexto corto, su principal ventaja está en secuencias largas; en tareas de contexto corto puede no superar a modelos de atención completa optimizados.

## Enlaces

- [HuggingFace - Kimi-Linear-48B-A3B-Instruct](https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct)
- [HuggingFace - Kimi-Linear-48B-A3B-Base](https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Base)
- [GitHub - MoonshotAI/Kimi-Linear](https://github.com/MoonshotAI/Kimi-Linear)
- [Paper en ArXiv (2510.26692)](https://huggingface.co/papers/2510.26692)
- [Paper Gated DeltaNet (2412.06464)](https://arxiv.org/abs/2412.06464)
- [vLLM Recipes - Kimi-Linear](https://recipes.vllm.ai/moonshotai/Kimi-Linear-48B-A3B-Instruct)
