# sjakek/slimder-qwen38-reap384-s0

## Resumen

El modelo `sjakek/slimder-qwen38-reap384-s0` es una publicación en Hugging Face de los pesos de **Qwen3.8-Flash-Next**, un modelo experimental de la familia Qwen que sirve como previsualización de la arquitectura que sustentará a Qwen4. Desarrollado por el equipo de Qwen (Alibaba), este modelo introduce un diseño híbrido que combina atención lineal (Gated DeltaNet) con atención sparse (Qwen Sparse Attention, QSA), junto con innovaciones como Gated Residual y N-gram Embedding. El objetivo declarado es mejorar la eficiencia en contextos largos y en cargas de trabajo agénticas, reduciendo la latencia sin sacrificar calidad.

El modelo cuenta con aproximadamente 147 mil millones de parámetros totales (según los safetensors), de los cuales solo 6 mil millones se activan por token gracias a su arquitectura MoE con 512 expertos. Incluye un codificador de visión, por lo que es multimodal (imagen-texto). Su longitud de contexto nativa es de 262 144 tokens, extensible hasta 1 000 000. La licencia es `qwen-community-1.0`, que permite uso comercial con restricciones. El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE + Gated Residual + N-gram Embedding |
| Parametros totales | 147 178 113 171 (según safetensors); desglose: 125B LM + 51B n-gram embedding + 4B MTP |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262 144 nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia personalizada, no OSI) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next presenta una arquitectura híbrida que abandona la atención densa tradicional. El bloque base se organiza en 12 grupos de 3 capas de Gated DeltaNet (atención lineal recurrente) seguidas de una capa de Qwen Sparse Attention (QSA). QSA opera a nivel de micro-bloques en lugar de tokens individuales, con un presupuesto de 512 bloques o 2048 tokens, lo que reduce significativamente la latencia en contextos largos. El modelo incorpora Gated Residual, que modula el flujo de información a través de streams residuales ensanchados mediante puertas de lectura dependientes de datos y puertas de escritura escalares por rama. La capa de embedding usa n-gramas (bigramas/trigramas) en la capa 2, con 20 millones de entradas, lo que permite escalar parámetros de forma más eficiente que MoE y facilita la descarga a memoria en aceleradores con VRAM limitada.

El entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, y elimina el warmup de batch size, comenzando directamente con el tamaño objetivo. No se especifican el número de tokens de entrenamiento ni la composición del dataset en la información disponible. El modelo ha pasado por etapas de pre-entrenamiento y post-entrenamiento, pero no se detallan métodos como RLHF o DPO.

## Capacidades

- Generación de texto causal con soporte multimodal: incluye un codificador de visión, por lo que puede procesar entradas de imagen y texto (pipeline `image-text-to-text`).
- Razonamiento de contexto largo: con 262K tokens nativos y extensión a 1M, está diseñado para tareas que requieren mantener información a lo largo de secuencias muy extensas.
- Arquitectura MoE con 6B parámetros activos: eficiencia computacional en inferencia, ya que solo se activa una fracción de los parámetros totales por token.
- Soporte de agentes: el README menciona explícitamente que la reducción de latencia en contexto largo es crítica para cargas de trabajo agénticas, lo que sugiere capacidades para razonamiento multi-paso y uso de herramientas, aunque no se detallan funciones específicas de tool calling.
- MTP (Multi-Token Prediction): incluye una capa de predicción multi-token entrenada con multi-steps, lo que puede mejorar la velocidad de decodificación.
- Compatibilidad con múltiples motores de inferencia: Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Agentes autónomos con memoria extensa: el modelo puede mantener conversaciones o razonamientos que abarcan cientos de miles de tokens, permitiendo a un agente procesar documentos completos, historiales de interacción o bases de código enteras antes de tomar decisiones.
- Análisis de documentos largos multimodales: al combinar visión y contexto largo, puede procesar informes extensos con figuras, tablas y texto, extrayendo información relevante para resúmenes o respuestas a preguntas específicas.
- Generación de código en repositorios grandes: con 262K tokens de contexto, puede analizar un proyecto completo y generar código coherente con las convenciones existentes, o refactorizar múltiples archivos de una sola vez.
- Asistentes de investigación científica: capaz de leer y sintetizar decenas de artículos académicos (cada uno de 10-20K tokens) en una sola pasada, identificando relaciones y contradicciones entre fuentes.
- Sistemas de atención al cliente con historial completo: puede mantener el contexto de una conversación de varios días sin truncamiento, mejorando la coherencia y personalización de las respuestas.
- Razonamiento matemático y lógico de largo alcance: la combinación de MoE y atención híbrida permite mantener cadenas de razonamiento extensas sin degradación, útil para problemas de demostración formal o verificación de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye una sección de benchmarks, pero el contenido no fue extraído en los datos proporcionados. No se dispone de cifras de MMLU, HumanEval, GSM8K ni otros estándares para este modelo.

## Requisitos de hardware

- VRAM estimada: con 147B parámetros en precisión FP16, se necesitarían aproximadamente 294 GB de VRAM (el tamaño del repositorio es 294.4 GB). Con cuantización de 4 bits, la huella se reduciría a unos 74 GB, lo que permitiría ejecutarlo en una GPU de 80 GB (como A100 o H100) o en configuraciones multi-GPU.
- GPU recomendadas: para FP16, se requieren múltiples GPUs (por ejemplo, 4× A100 80GB o 8× RTX 4090 24GB). Con cuantización 4-bit, una sola A100 80GB o H100 80GB podría ser suficiente, aunque la latencia dependerá del número de parámetros activos.
- En consumer GPU: no es viable en una sola GPU de consumo (máximo 24 GB en RTX 4090). Se necesitarían al menos 4 GPUs de 24 GB con cuantización agresiva (2-3 bits) para intentar la inferencia, con rendimiento limitado.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Transformers. Para cuantización, se podría usar GPTQ, AWQ o GGUF si se generan, aunque no se proporcionan oficialmente.
- Latencia y throughput: no disponibles. La arquitectura MoE con 6B activos debería ofrecer un throughput superior a un modelo denso de 147B, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo. Dentro de la familia Qwen3.8, existen otros modelos como Qwen3.8-27B (denso, 27B) y Qwen3.8-Max (2.4T parámetros, no abierto). Sin embargo, no hay benchmarks públicos que permitan comparar directamente con Qwen3.8-Flash-Next. La arquitectura de este modelo es única en su combinación de Gated DeltaNet, QSA y N-gram Embedding, por lo que no hay alternativas directas con el mismo diseño. Modelos como Mixtral 8x7B o DeepSeek-V3 comparten el enfoque MoE, pero difieren en atención y embeddings.

## Limitaciones y advertencias

- Modelo experimental: es una previsualización de la arquitectura de Qwen4, no una versión estable. Puede contener comportamientos impredecibles o no estar optimizado para producción.
- Licencia `qwen-community-1.0`: es una licencia personalizada que permite uso comercial, pero con restricciones específicas (por ejemplo, no usar para servicios que compitan con Qwen Cloud). Es necesario revisar el texto completo de la licencia antes de su uso comercial.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos ni de fiabilidad factual. Al ser un modelo de 147B con entrenamiento no documentado, el riesgo de alucinación es desconocido.
- Idiomas: no se especifican los idiomas soportados. Aunque Qwen suele tener buen soporte multilingüe, no hay confirmación para esta versión.
- Requisitos de hardware elevados: incluso con cuantización, la inferencia requiere hardware de gama alta, lo que limita su uso a entornos con GPUs profesionales.
- Sin benchmarks públicos: no hay datos objetivos de rendimiento, lo que dificulta evaluar su calidad frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes indican que no ha sido validado por la comunidad; podría contener errores en los pesos o la configuración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sjakek/slimder-qwen38-reap384-s0
- Blog oficial de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico (PDF): https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Colección Qwen3.8 en Hugging Face: https://huggingface.co/collections/Qwen/qwen38
- Modelo Qwen3.8-27B (referencia de la familia): https://huggingface.co/Qwen/Qwen3.8-27B
- Página de OpenLM sobre Qwen3.8: https://openlm.ai/qwen3.8/
