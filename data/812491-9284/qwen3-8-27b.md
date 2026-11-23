# 812491-9284/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado por el usuario 812491-9284 en Hugging Face, que se presenta como parte de la familia Qwen3.8 de Alibaba (aunque el repositorio pertenece a un tercero, no a la organización oficial de Qwen). Se trata de un modelo denso de aproximadamente 27.780 millones de parámetros (27,78 B), con una arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention), y que incorpora un codificador visual para tareas de imagen-texto-a-texto. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

El modelo se posiciona como una alternativa compacta y desplegable de la generación Qwen3.8, con mejoras declaradas en programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Incluye control flexible del modo de razonamiento (thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`), además de comprensión nativa de imágenes y vídeos, incluyendo vídeos de hasta una hora de duración.

Es relevante ahora porque ofrece capacidades multimodales y agénticas en un tamaño que cabe en una sola GPU de 80 GB en precisión reducida, con licencia Apache 2.0 y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. No obstante, conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que la model card incluye afirmaciones de marketing (comparativas con modelos propietarios) que no pueden verificarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Vision Encoder; mezcla de Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (la model card no detalla cuantizaciones publicadas; el repo contiene safetensors en precisión completa) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

Otros datos técnicos declarados: dimensión oculta 5120, 64 capas, embedding de tokens de 248.320 (con padding), layout oculto 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), FFN con dimensión intermedia 17.408, Gated DeltaNet con 48 cabezas lineales para V y 16 para QK (dimensión de cabeza 128), Gated Attention con 24 cabezas para Q y 4 para KV (dimensión de cabeza 256, RoPE de 64), y Multi-Token Prediction (MTP) entrenado con múltiples pasos.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión, que combina dos tipos de capas de atención en un patrón repetido: por cada bloque de cuatro capas, tres usan Gated DeltaNet (una forma de atención lineal con estado recurrente) y una usa Gated Attention (atención completa con compuertas). Este diseño híbrido busca reducir el coste computacional en contextos largos manteniendo la capacidad de recuperación de información de la atención completa. El modelo incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa y puede acelerar la inferencia autoregresiva.

El modelo ha pasado por preentrenamiento y postentrenamiento, aunque la model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Sí se declara soporte nativo de imágenes y vídeos (incluyendo vídeos de escala horaria), lo que implica un entrenamiento multimodal del que no se ofrecen detalles. La innovación técnica más destacable es la combinación de atención lineal con atención completa y el control flexible del razonamiento (thinking mode configurable por petición).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`reasoning_effort`, `preserve_thinking`).
- Comprensión nativa de imágenes: diagramas STEM, documentos, capturas y gráficos.
- Comprensión de vídeo, incluyendo vídeos de hasta una hora de duración.
- Programación y tareas de coding agéntico (terminal, edición de código, resolución de bugs).
- Planificación autónoma y ejecución de tareas agénticas de largo horizonte, con manejo de feedback del entorno.
- Soporte declarado de harnesses y herramientas de desarrollo populares (compatibilidad downstream).
- Capacidades multilingües: no se detallan idiomas concretos en la información disponible.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el enfoque agéntico y la mención de "official built-in tools" en la versión alojada sugieren soporte.

## Casos de uso

- Asistencia de programación en terminal: el modelo puede operar en entornos de línea de comandos para tareas de coding agéntico (benchmark Terminal Bench 2.1), planificando pasos y ejecutando comandos con feedback del entorno.
- Análisis de documentos técnicos con imágenes: gracias a su codificador visual, puede interpretar diagramas STEM, tablas y documentos escaneados, extrayendo información estructurada para pipelines de investigación.
- Procesamiento de vídeo de larga duración: con contexto de 262 K tokens y soporte de vídeos de hasta una hora, puede resumir reuniones, generar actas o extraer eventos de grabaciones extensas.
- Agentes autónomos de investigación: el modo de razonamiento configurable y la retención de contexto histórico permiten cadenas multi-paso de búsqueda, lectura y síntesis de fuentes.
- Automatización de tareas profesionales multi-paso: tareas de ofimática, análisis de datos y generación de informes donde el modelo debe mantener estado a lo largo de muchas interacciones.
- Despliegue en infraestructura propia: al ser denso de 27 B y Apache 2.0, puede servirse con vLLM o SGLang en una GPU de 80 GB, útil para equipos que requieren soberanía de datos.
- Evaluación comparativa de modelos multimodales: su tamaño compacto y su licencia permisiva lo hacen adecuado como baseline en experimentos de investigación reproducibles.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero en la información proporcionada solo se muestra el encabezado de la sección "Coding" y la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)" sin los valores numéricos correspondientes. No se han podido extraer cifras concretas del resto de benchmarks.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16 los pesos ocupan aproximadamente 55,6 GB (tamaño del repo), por lo que se necesitan al menos 64 GB de VRAM para inferencia sin cuantizar; con cuantización a 8 bits se reduciría a ~28 GB y a 4 bits a ~14 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con 64 GB o más para precisión completa; para cuantización 4/8 bits, RTX 4090 (24 GB) o RTX 6000 Ada podrían ser suficientes.
- Cabe en consumer GPU: sí, en RTX 4090 (24 GB) o superiores, siempre que se aplique cuantización; en precisión completa no cabe en GPUs de consumo.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (declarados por el autor); llama.cpp y Ollama no se mencionan explícitamente.
- Latencia y throughput: no disponibles. La presencia de MTP (Multi-Token Prediction) sugiere que la decodificación especulativa puede mejorar el throughput, pero no se ofrecen cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repo) | ~27,78 B (denso) | 262 K (ext. 1 M) | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face (repo de tercero) |
| Qwen3.6-27B | ~27 B (denso, según nomenclatura) | No disponible | No disponible | No disponible | Referenciado en la model card |
| Muse Glimmer-30B | ~30 B | No disponible | No disponible | No disponible | Referenciado en la model card |
| Qwen3.7-Plus | No disponible | No disponible | Propietaria (servicio) | No disponible | API (Qwen Cloud) |

La comparativa se limita a los modelos citados en la propia model card, de los que no se dispone de especificaciones independientes. No se dispone de datos de rendimiento verificables para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Repositorio de tercero: el ID `812491-9284/Qwen3.8-27B` no pertenece a la organización oficial de Qwen, por lo que la procedencia de los pesos no está garantizada por el desarrollador original. Verificar integridad antes de usar en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación independiente.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no se documentan sesgos conocidos ni medidas de mitigación.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas.
- Contexto largo: aunque se declaran 262 K nativos y 1 M extensibles, el rendimiento real en contextos extremos no está verificado.
- Licencia Apache 2.0: permisiva para uso comercial, pero al tratarse de un repo de tercero conviene confirmar que los pesos no incorporan material con restricciones adicionales.
- Afirmaciones de marketing: la model card incluye comparativas con modelos propietarios (Opus4.6 Max) sin datos visibles en la información proporcionada; tratarlas con cautela.
- Producción: sin benchmarks verificables ni informes de latencia/throughput, el despliegue en producción requiere evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/812491-9284/Qwen3.8-27B
- Qwen Cloud (servicio alojado mencionado): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
