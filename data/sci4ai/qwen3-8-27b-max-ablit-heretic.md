# sci4ai/Qwen3.8-27B-Max-Ablit-Heretic

## Resumen

sci4ai/Qwen3.8-27B-Max-Ablit-Heretic es una versión "decensored" (abliterated) del modelo multimodal denso Qwen3.8-27B de Alibaba, publicada por el usuario sci4ai mediante la herramienta Heretic v2.0.0.dev0. El proceso aplica una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 31 a 60 de las 64 que componen el transformer, con el objetivo de eliminar la conducta de rechazo del modelo original: según la propia ficha, las negativas bajan de 99/100 a 0/100 en el conjunto de evaluación del autor, a cambio de una divergencia KL de 0,5523 respecto al modelo base.

La arquitectura subyacente es un modelo causal denso con codificador de visión, con 27.356.728.560 parámetros reales (unos 27,36 mil millones, según los pesos en safetensors), dimensión oculta de 5120 y un diseño híbrido de atención: 16 bloques que alternan tres capas de Gated DeltaNet (atención lineal) por cada capa de Gated Attention completa. Soporta de forma nativa comprensión de imagen y vídeo, y su ventana de contexto es de 262.144 tokens, ampliable hasta 1.000.000.

Su relevancia es doble. Por un lado, es un ejemplo práctico de ablación selectiva sobre un modelo multimodal grande con licencia Apache 2.0, útil para investigar alineación, rechazo y robustez. Por otro, carece por completo del entrenamiento de seguridad del modelo original, lo que lo hace inadecuado para despliegues comerciales sin filtros externos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en un intervalo de dos minutos, por lo que no existe validación independiente de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; capas híbridas Gated DeltaNet (atención lineal) + Gated Attention |
| Parámetros totales | 27.356.728.560 (≈27,36 B), medidos sobre los pesos safetensors |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantización | no disponible en la ficha; el repositorio solo publica safetensors sin cuantizar. Existen conversiones GGUF de terceros para llama.cpp mencionadas en tutoriales externos, no verificadas en este repositorio |
| Idiomas soportados | no disponible (la ficha no declara cobertura de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers) |
| Autor | sci4ai (modelo base: equipo Qwen de Alibaba) |
| Pipeline declarado | image-text-to-text |
| Librería | transformers |
| Tamaño del repositorio | 54,8 GB |
| Fecha de publicación | 2026-10-12 |
| Método de modificación | Heretic v2.0.0.dev0, Arbitrary-Rank Ablation (ARA) |
| Capas ablacionadas | 31 a 60 (de 64) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con codificador de visión, con 64 capas y dimensión oculta de 5120. Su rasgo arquitectónico principal es un patrón híbrido repetido 16 veces: tres bloques de Gated DeltaNet (atención lineal, 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidos de un bloque de Gated Attention completa (24 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 256, dimensión de RoPE 64). El FFN tiene una dimensión intermedia de 17.408 y el vocabulario está fijado en 248.320 entradas con padding. Incluye Multi-Token Prediction (MTP) entrenado con varios pasos, lo que habilita decodificación especulativa nativa. Este diseño híbrido implica que solo 16 de las 64 capas mantienen caché KV de atención completa, lo que reduce el crecimiento de memoria con el contexto frente a un transformer totalmente atencional del mismo tamaño (estimación derivada de la arquitectura, no publicada por el autor).

Sobre el entrenamiento del modelo base solo se indica que pasó por pre-entrenamiento y post-entrenamiento; no se detallan el número de tokens, la composición del dataset ni el uso de RLHF o DPO, por lo que esos datos figuran como no disponibles. La modificación de esta variante es puramente de pesos: la ficha documenta los parámetros de la ablación ARA con `start_layer_index` 31, `end_layer_index` 60, `preserve_good_behavior_weight` 0,9411, `steer_bad_behavior_weight` 0,0091, `overcorrect_relative_weight` 1,0111 y `neighbor_count` 2. No hay evidencia de re-entrenamiento posterior a la ablación.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imagen y vídeo (pipeline image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de hasta una hora según la ficha del modelo base.
- Generación y análisis de código, con mejoras declaradas en tareas de programación y trabajo profesional.
- Ejecución de agentes y tareas de horizonte largo: planificación autónoma y manejo de retroalimentación del entorno.
- Soporte de decodificación especulativa mediante MTP (Multi-Token Prediction).
- Compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed.
- Capacidades multilingües: no disponibles (no declaradas en la información proporcionada).
- Tool calling / function calling: no confirmado explícitamente en la ficha del modelo abliterado; la ficha del modelo base menciona herramientas integradas solo para la versión alojada en Qwen Cloud.
- La ablación elimina la conducta de rechazo, de modo que el modelo responde a peticiones que el original rechazaría; esto es una capacidad funcional pero también un riesgo (véase "Limitaciones y advertencias").

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar experimentalmente cómo la ablación de un rango concreto de capas (31-60) afecta a la conducta de negativa y a la distribución de salida, usando la divergencia KL de 0,5523 como métrica de deriva respecto al original.
- Red-teaming y evaluación de seguridad: sirve como modelo "sin filtros" de referencia para probar clasificadores de contenido, guardarraíles y sistemas de moderación en pipelines propios, al no bloquear internamente las peticiones.
- Escritura creativa y narrativa sin restricciones temáticas: con 262.144 tokens de contexto puede mantener arcos narrativos largos y coherentes, y el modo thinking permite planificar tramas complejas.
- Procesamiento de documentos con visión en local: digitalización de PDFs, informes técnicos, diagramas y tablas mediante el codificador de visión, sin enviar datos a servicios externos.
- Análisis de vídeo de larga duración: la ventana de 262.144 tokens y el soporte de vídeo permiten resumir o extraer eventos de grabaciones extensas, por ejemplo revisiones de incidencias o material de formación.
- Análisis de bases de código grandes: la ventana extensible a 1.000.000 tokens permite cargar repositorios completos para refactorización, búsqueda de dependencias o generación de pruebas, integrándose en pipelines de CI/CD mediante Transformers o vLLM.
- Asistente de oficina y automatización documental: generación de borradores, extracción estructurada de datos y resúmenes sobre documentación corporativa, aprovechando el soporte multimodal.
- Despliegue local en hardware de gama alta para datos sensibles: al ser un modelo denso de 27 B con licencia Apache 2.0, puede ejecutarse en una estación de trabajo con GPU de 24-32 GB en cuantización de 4 bits, sin dependencia de APIs externas.

## Benchmarks y rendimiento

La ficha del modelo abliterado solo publica las métricas del proceso de ablación, no resultados en benchmarks estándar. La tabla de rendimiento en texto de la model card original está referenciada en la información disponible pero sus cifras no aparecen en el contenido proporcionado, por lo que no se reproducen aquí.

| Métrica | Este modelo (abliterado) | Modelo original |
|---|---|---|
| Rechazos (Refusals) | 0/100 | 99/100 |
| Divergencia KL | 0,5523 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K u otros conjuntos equivalentes. La model card original incluye una tabla comparativa frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores no están disponibles en los datos recuperados.

## Requisitos de hardware

- VRAM en bf16/fp16: los pesos ocupan unos 54,8 GB; con caché KV y activaciones conviene reservar entre 64 y 80 GB (estimación).
- VRAM en int8/fp8: aproximadamente 27,4 GB solo para pesos; con contexto largo, del orden de 32-40 GB (estimación).
- VRAM en cuantización de 4 bits: del orden de 14-16 GB de pesos; viable en GPU de 24 GB con contexto moderado (estimación).
- GPU recomendadas en precisión completa: NVIDIA H100 80 GB, A100 80 GB, o dos A100 40 GB / L40S 48 GB en paralelo.
- GPU recomendadas en 8 bits: A100 40 GB, L40S 48 GB, RTX 5090 32 GB (contexto corto).
- Cabe en GPU de consumo: sí, únicamente con cuantización de 4 bits en RTX 4090, RTX 3090, RTX 5090 o equivalentes. En 8 bits no cabe en tarjetas de 24 GB.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed según la ficha del modelo base. Para equipos sin GPU de gran capacidad existen conversiones GGUF de terceros para llama.cpp, Ollama y LM Studio; el soporte en AMD Ryzen AI Max y Radeon aparece documentado en el blog de AMD para la familia Qwen3.8-27B, no específicamente para esta variante ablacionada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rechazos | Disponibilidad |
|---|---|---|---|---|---|
| sci4ai/Qwen3.8-27B-Max-Ablit-Heretic | 27,36 B (denso) | 262.144 (hasta 1 M) | apache-2.0 | 0/100 | Repositorio Hugging Face con 0 descargas |
| Qwen/Qwen3.8-27B (original) | 27 B (denso) | 262.144 (hasta 1 M) | no disponible en la información | 99/100 | Modelo oficial, ampliamente distribuido |
| sci4ai/Qwen3.8-27B-Med-Ablit-Heretic | no disponible | no disponible | no disponible | no disponible | Repositorio Hugging Face del mismo autor |
| Qwen3.6-27B / Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Citados como referencia en la tabla de la model card, sin datos recuperados |
| Muse Glimmer-30B / Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Citados en la model card, sin datos recuperados |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay resultados de benchmarks publicados para esta variante ni cifras recuperables de los modelos de referencia.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: la ablación elimina la conducta de rechazo (0/100 negativas), por lo que el modelo puede generar contenido dañino, ilegal o sensible sin filtro interno.
- Divergencia KL de 0,5523 respecto al modelo original: indica una desviación apreciable en la distribución de salida, con riesgo de degradación en capacidades generales, coherencia o adherencia a instrucciones. No se han publicado evaluaciones que cuantifiquen ese posible deterioro.
- Riesgo de alucinación: no se han publicado mediciones de fidelidad factual ni tasas de alucinación para esta variante.
- Idiomas soportados: no declarados. No hay confirmación de cobertura multilingüe ni de calidad por idioma.
- Sesgos: no documentados. La ablación no elimina sesgos sociales; puede incluso aflorar contenido sesgado que el modelo original rechazaba.
- Licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial, pero el responsable del despliegue asume la totalidad del cumplimiento legal y normativo sobre el contenido generado (por ejemplo, en la Unión Europea, el Reglamento de IA).
- Falta de validación comunitaria: 0 descargas y 0 likes, publicación y actualización separadas por dos minutos y ausencia de benchmarks propios. No debe considerarse un artefacto probado en producción.
- Compatibilidad: la model card no confirma soporte de tool calling para esta variante; las herramientas integradas mencionadas corresponden a la versión alojada en Qwen Cloud del modelo original.
- Requisitos de memoria: 54,8 GB de pesos en precisión completa implican hardware de centro de datos o cuantización agresiva en hardware de consumo, con la pérdida de calidad asociada.
- Uso responsable: conviene combinarlo con moderación externa, registro de auditoría y políticas de uso aceptable si se despliega en entornos con usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sci4ai/Qwen3.8-27B-Max-Ablit-Heretic
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante relacionada del mismo autor: https://huggingface.co/sci4ai/Qwen3.8-27B-Med-Ablit-Heretic
- Proyecto Heretic: https://heretic-project.org
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Tutorial de despliegue local con llama.cpp: https://aiindigo.com/tutorials/getting-started-with-qwen3-8-27b-heretic-unrestricted-local-llm-deployment
- Soporte en hardware AMD Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
