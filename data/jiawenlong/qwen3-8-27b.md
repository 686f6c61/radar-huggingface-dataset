# Jiawenlong/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (visión y texto) desarrollado por el equipo Qwen de Alibaba, y representa la generación más reciente de la familia Qwen3.8. Con 27 mil millones de parámetros, este modelo está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo alcance, manteniendo un tamaño compacto que lo hace viable en hardware local de alta gama. Su arquitectura híbrida de atención (lineal y completa) permite una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 millón, lo que lo posiciona como una opción relevante para aplicaciones que requieren procesamiento de documentos largos, conversaciones multi-turno y análisis de imágenes y vídeos.

El modelo destaca por su flexibilidad en el control del razonamiento: el modo de pensamiento está activado por defecto y puede desactivarse por petición, con ajustes finos de esfuerzo de razonamiento (`reasoning_effort`) y retención de contexto de razonamiento histórico (`preserve_thinking`). Su naturaleza nativa vision-language le permite entender imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración. Con licencia Apache 2.0, es un modelo de código abierto que se puede integrar con transformers, vLLM, SGLang y otras herramientas populares.

La arquitectura interna combina 48 capas con atención lineal (Gated DeltaNet) y 16 capas con atención completa (Gated Attention), una mezcla que reduce el coste computacional mientras mantiene la capacidad de atender a contextos largos. El modelo se entrena con múltiples pasos de predicción de tokens (MTP) y ha sido post-entrenado para mejorar la fiabilidad en tareas de agente y automatización de oficina. Su rendimiento se evalúa en benchmarks como Terminal Bench 2.1 y MathVision, aunque los valores numéricos no están disponibles en la información pública consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, atención híbrida (16 capas Gated Attention + 48 capas Gated DeltaNet) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (no se especifica en la información; se esperan cuantizaciones estándar como FP16, BF16, INT8, INT4) |
| Idiomas soportados | No disponible (no se detalla en la model card; presumiblemente multilingüe, pero no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de lenguaje con un codificador visual integrado. La arquitectura de atención es híbrida: de las 64 capas totales, solo 16 utilizan atención completa (Gated Attention) con 24 cabezas de consulta y 4 de clave-valor, mientras que las otras 48 emplean atención lineal (Gated DeltaNet) con 48 cabezas lineales para V y 16 para QK. Esta mezcla reduce el coste computacional en comparación con un modelo de atención completa del mismo tamaño, manteniendo una capacidad razonable para capturar dependencias de largo alcance. La dimensión oculta es 5120, la intermedia del FFN es 17.408, y el embedding de tokens es de 248.320 (con padding).

El modelo se ha entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. La post-entrenamiento incluye técnicas de ajuste fino supervisado y refuerzo, aunque no se especifican los detalles exactos (por ejemplo, si se usó RLHF o DPO). Se menciona que el modelo fue entrenado con múltiples pasos de predicción de tokens (MTP), lo que mejora la eficiencia del entrenamiento y la calidad de las predicciones. La ventana de contexto nativa es de 262.144 tokens, extensible a 1M mediante técnicas de interpolación de posiciones, aunque no se detalla el método exacto.

La innovación clave de esta generación es la combinación de atención lineal recurrente con atención completa intercalada, un diseño que ya apareció en Qwen3.5 y se mantiene en Qwen3.8. Este enfoque permite manejar secuencias muy largas con un coste de memoria inferior al de la atención cuadrática estándar, lo que facilita el despliegue en hardware local.

## Capacidades

- Generación de texto y razonamiento complejo: soporta tareas de codificación, matemáticas, investigación y trabajo profesional.
- Razonamiento flexible: modo de pensamiento activado por defecto, desactivable por petición; ajuste de `reasoning_effort` para controlar la profundidad del razonamiento.
- Visión-lenguaje: entiende imágenes y vídeos, incluyendo diagramas STEM, documentos escaneados y vídeos de larga duración (hasta una hora).
- Tareas agentes: planificación autónoma y manejo de feedback del entorno, lo que permite completar tareas de varios pasos de forma fiable.
- Soporte de herramientas (tool calling): no se menciona explícitamente, pero la naturaleza de tareas agénticas y la compatibilidad con vLLM y SGLang sugieren que es compatible con llamadas a funciones.
- Multilingüe: no se especifica, pero al ser un modelo de la familia Qwen, es probable que soporte múltiples idiomas, aunque no hay confirmación.
- Integración con ecosistemas: compatible con transformers, vLLM, SGLang, TokenSpeed, y se espera soporte en Qwen Cloud.

## Casos de uso

- Automatización de oficina: puede procesar documentos largos (contratos, informes) y generar resúmenes, extraer datos o redactar respuestas basadas en el contexto completo, gracias a su ventana de 262K tokens.
- Asistencia de codificación en producción: integrado en pipelines de CI/CD, puede generar y revisar código, explicar cambios, y manejar tareas de refactorización con razonamiento multi-paso.
- Agentes autónomos de soporte al cliente: gestiona conversaciones multi-turno con memoria de contexto largo y puede ejecutar acciones (por ejemplo, consultar una base de datos) mediante tool calling.
- Análisis de imágenes y vídeos: aplicaciones de visión artificial, como inspección de diagramas, lectura de documentos escaneados o análisis de vídeo de vigilancia, con razonamiento sobre el contenido visual.
- Investigación científica: asistente para lectura de papers, extracción de información, generación de hipótesis y resumen de literatura, apoyado en el contexto largo y el razonamiento.
- Generación de contenido creativo: creación de historias, artículos, guiones, con control de estilo y profundidad de razonamiento, ajustable mediante `reasoning_effort`.

## Benchmarks y rendimiento

La información disponible incluye una tabla de benchmarks en la model card, pero los valores numéricos no se han extraído de forma completa. Se mencionan las siguientes evaluaciones:

- **Terminal Bench 2.1 (Terminus)**: evalúa la capacidad de codificación agéntica en terminal.
- **MathVision**: evaluación de razonamiento matemático con prompts específicos.

Sin embargo, no se han proporcionado los resultados numéricos concretos. En el sitio BenchLM.ai se indica que el modelo ocupa el puesto #14 de 225 modelos en el leaderboard público BenchAlign con una puntuación de 72.37/100, pero no se detalla qué benchmarks componen esa puntuación.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con el tamaño de 27B parámetros y 55,6 GB de pesos en safetensors (presumiblemente en FP16), se necesita alrededor de 60 GB de VRAM para cargar el modelo completo en FP16. Con cuantizaciones típicas (INT8 o INT4), la VRAM necesaria se reduce a aproximadamente 30 GB (INT8) o 15-18 GB (INT4), aunque el modelo puede no estar aún cuantizado.
- GPU recomendadas: para FP16 se requiere una GPU de 80 GB (A100, H100) o dos GPUs de 40 GB. Para cuantización a 8 bits, una RTX 4090 (24 GB) puede ser suficiente; para 4 bits, una RTX 3090 (24 GB) o RTX 4090 serían adecuadas.
- Si cabe en GPU de consumo: con cuantización a 4 bits, es viable en GPUs de 24 GB (RTX 3090/4090), aunque con contexto largo puede ser necesario gestionar la memoria de caché KV.
- Opciones de despliegue: compatible con vLLM, SGLang, Transformers, TokenSpeed, y se espera soporte en Ollama y llama.cpp (aunque no se menciona explícitamente). Para producción, se recomienda vLLM o SGLang por su eficiencia.
- Latencia y throughput: no se han publicado datos específicos. Como referencia para un modelo denso de 27B, se puede esperar una velocidad de generación de 20-50 tokens/s en una A100 con vLLM, pero depende de la cuantización y la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Arquitectura | Rendimiento (referencia) |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262k (ext. 1M) | Apache 2.0 | Híbrida (lineal + atención completa) | No disponible |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Similar (probablemente híbrida) | No disponible |
| Qwen3.7-Plus | No especificado | No disponible | Propietaria (?) | No especificado | No disponible |

La tabla de la model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se han extraído los valores numéricos de rendimiento. Qwen3.8-27B es el modelo más reciente y se posiciona como superior a Qwen3.6-27B en tareas de codificación y agente, según la descripción. La licencia Apache 2.0 permite uso comercial libre, mientras que Qwen3.7-Plus podría ser propietaria.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo específicas para este modelo. Al ser un modelo de lenguaje grande, es probable que herede sesgos de los datos de entrenamiento, aunque no se confirma.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o no verídica, especialmente en tareas de razonamiento complejo. Se recomienda verificación humana en aplicaciones críticas.
- Limitaciones de contexto: aunque la ventana nativa es de 262k tokens, la extensión a 1M puede requerir técnicas adicionales (interpolación de posición) y podría degradar el rendimiento en contextos muy largos.
- Limitaciones de idioma: no se ha especificado el conjunto de idiomas soportados. Si el modelo está optimizado para inglés y chino, podría tener un rendimiento inferior en otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero hay que cumplir con los términos de la licencia (incluida la atribución).
- Consideraciones de producción: al ser un modelo multimodal, requiere una gestión cuidadosa de la memoria para vídeo e imágenes. La integración con herramientas como vLLM o SGLang es recomendable para producción, pero se debe validar la compatibilidad con la versión del modelo.
- El repositorio en HuggingFace bajo el usuario `Jiawenlong` es un espejo del modelo oficial `Qwen/Qwen3.8-27B`; se recomienda descargar el modelo desde la fuente oficial para garantizar integridad.

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/Jiawenlong/Qwen3.8-27B
- Repositorio HuggingFace oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Benchmarks y velocidad en BenchLM: https://benchlm.ai/models/qwen3-8-27b

Nota: los enlaces del espejo y el oficial son el mismo modelo, pero el oficial es el mantenido por el equipo Qwen.</think>## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (visión-lenguaje) desarrollado por el equipo Qwen de Alibaba, y representa la generación más reciente de la familia Qwen3.8. Con 27 mil millones de parámetros, está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo alcance, manteniendo un tamaño que permite su despliegue en hardware de alta gama. Su arquitectura híbrida de atención (lineal y completa) le otorga una ventana de contexto nativa de 262.144 tokens, extensible hasta 1 millón, lo que lo hace relevante para aplicaciones que requieren procesamiento de documentos extensos, conversaciones multi-turno y comprensión de imágenes y vídeo.

El modelo destaca por su control flexible del razonamiento: el modo de pensamiento está activado por defecto, puede desactivarse por solicitud, y se puede ajustar la profundidad de razonamiento mediante `reasoning_effort` y la retención del contexto de razonamiento histórico con `preserve_thinking`. Su capacidad nativa de visión-lenguaje permite entender imágenes, diagramas STEM, documentos y vídeos de hasta una hora de duración. Con licencia Apache 2.0, es totalmente de código abierto y compatible con herramientas como transformers, vLLM, SGLang y TokenSpeed, lo que facilita su integración en flujos de producción.

La arquitectura combina 16 capas de atención completa (Gated Attention) con 48 capas de atención lineal (Gated DeltaNet), un diseño que reduce el coste computacional frente a la atención cuadrática estándar y permite escalar a contextos largos de forma eficiente. El modelo ha sido entrenado con múltiples pasos de predicción de tokens (MTP) y post-entrenado para mejorar la fiabilidad en tareas de agente y automatización de oficina. Los benchmarks publicados incluyen evaluaciones de codificación agéntica y razonamiento matemático, aunque los valores numéricos no están disponibles en la información consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, atención híbrida (16 capas Gated Attention + 48 capas Gated DeltaNet) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (se esperan cuantizaciones estándar: FP16, BF16, INT8, INT4, pero no se han publicado oficialmente) |
| Idiomas soportados | No disponible (no se detalla en la model card; presumiblemente multilingüe, pero no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso con un codificador de visión integrado. La arquitectura del modelo de lenguaje es híbrida: de las 64 capas totales, solo 16 utilizan atención completa (Gated Attention) con 24 cabezas de consulta y 4 de clave-valor, mientras que las otras 48 emplean atención lineal (Gated DeltaNet) con 48 cabezas de valor y 16 de consulta-clave. Esta combinación reduce el coste de memoria y computación en secuencias largas, manteniendo la capacidad de capturar dependencias globales a través de las capas de atención completa intercaladas. La dimensión oculta es 5120, la dimensión intermedia de la FFN es 17.408, y el embedding de tokens es de 250.320 (con padding).

El entrenamiento se divide en dos fases: pre-entrenamiento y post-entrenamiento. Durante el pre-entrenamiento se utilizan datos de texto e imágenes, aunque no se especifica el tamaño ni la composición del dataset. La post-entrenamiento incluye técnicas de ajuste fino supervisado y posiblemente aprendizaje por refuerzo, pero los detalles exactos (RLHF, DPO, etc.) no se han revelado. El modelo fue entrenado con múltiples pasos de predicción de tokens (MTP), una técnica que predice varias palabras siguientes a la vez, lo que mejora la eficiencia del entrenamiento y la coherencia del texto generado. La ventana de contexto nativa de 262.144 tokens se puede extender a 1 millón mediante interpolación de posiciones, aunque no se detalla el método exacto.

La innovación principal es la mezcla de atención lineal con atención completa, un enfoque que permite manejar contextos muy largos con un coste de memoria razonable, similar a lo que se ha visto en modelos como Qwen3.5 y Qwen3.6. Esta arquitectura hace que el modelo sea especialmente adecuado para aplicaciones que requieren procesamiento de documentos extensos o agentes de largo horizonte.

## Capacidades

- Generación de texto y razonamiento complejo: sobresale en codificación, matemáticas, trabajo profesional e investigación.
- Razonamiento flexible: modo de pensamiento activado por defecto, desactivable por petición; ajuste de `reasoning_effort` para controlar la profundidad del razonamiento; `preserve_thinking` para retener el contexto de razonamiento en conversaciones.
- Comprensión de visión-lenguaje: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos escaneados y vídeos de larga duración (hasta una hora).
- Tareas agénticas: planificación autónoma y manejo de la respuesta del entorno para completar tareas de varios pasos de forma fiable.
- Integración con herramientas: compatible con tool calling (aunque no se menciona explícitamente en la model card, su naturaleza agéntica y compatibilidad con vLLM y SGLang lo sugieren).
- Multilingüismo: no se especifica, pero como modelo de la familia Qwen, es probable que soporte múltiples idiomas, aunque no hay confirmación.
- Flexibilidad de despliegue: compatible con transformers, vLLM, SGLang, TokenSpeed y se espera soporte en Qwen Cloud.

## Casos de uso

- Automatización de oficina: procesa documentos extensos (informes, contratos, artículos) y genera resúmenes, extrae datos o redacta respuestas basadas en el contexto completo, gracias a la ventana de 262k tokens.
- Asistente de codificación en producción: integrado en pipelines de CI/CD, puede generar código, revisar cambios, refactorizar y explicar errores, con razonamiento multi-paso y soporte de tool calling para ejecutar comandos.
- Agentes de atención al cliente: gestiona conversaciones multi-turno con memoria de contexto largo, puede consultar bases de datos o APIs mediante tool calling y resolver problemas complejos de forma autónoma.
- Análisis de documentos visuales: procesa imágenes de diagramas, gráficos o documentos escaneados, extrae información estructurada y responde preguntas sobre su contenido, útil en entornos legales o financieros.
- Investigación científica: lectura de papers largos, síntesis de literatura, generación de hipótesis y análisis de datos con razonamiento profundo y contexto extenso.
- Generación de contenido creativo: creación de historias, artículos, guiones o guiones, con control de estilo y profundidad de razonamiento, y capacidad de procesar referencias visuales.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados de benchmarks, pero los valores numéricos no se han extraído en la información de referencia. Se mencionan las siguientes evaluaciones:

- **Terminal Bench 2.1 (Terminus)**: benchmark de codificación agéntica en terminal.
- **MathVision**: evaluación de razonamiento matemático con prompts específicos.

En la página de BenchLM.ai se indica que el modelo ocupa el puesto #11 de 225 modelos en el leaderboard público BenchAlign con una puntuación de 72.37/100, pero no se detalla la composición de ese índice. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27B parámetros y pesos en FP16 (55,6 GB en el repo), se necesitan aproximadamente 60-65 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits se reduce a ~30-35 GB, y a 4 bits a ~16-18 GB, aunque estas cuantizaciones no se han confirmado oficialmente.
- GPU recomendadas: para FP16 se requiere una GPU con al menos 80 GB (A100, H100) o dos GPUs de 48 GB (A6000, L40S). Para cuantización a 8 bits, una RTX 4090 (24 GB) es suficiente; para 4 bits, una RTX 3090 (24 GB) o RTX 4090 pueden ser viables.
- ¿Cabe en una GPU de consumo? Con cuantización a 4 bits, es posible en una RTX 3090/4090 de 24 GB, pero la gestión de la memoria para contextos largos (KV cache) puede ser un cuello de botella.
- Opciones de despliegue: compatible con vLLM, SGLang, Transformers, TokenSpeed, y probablemente con llama.cpp y Ollama (no confirmado). Para producción, se recomienda vLLM o SGLang por su eficiencia.
- Latencia y throughput: no hay datos publicados. Como referencia, un modelo denso de 27B en A100 con vLLM puede generar entre 20 y 50 tokens por segundo, pero depende de la cuantización, el contexto y el hardware.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Arquitectura | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262k (ext. 1M) | Apache 2.0 | Híbrida (lineal + completa) | No disponible |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Probablemente híbrida | No disponible |
| Qwen3.7-Plus | No especificado | No disponible | No especificada | No especificado | No disponible |

La tabla de la model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se han extraído los valores numéricos. Qwen3.8-27B es la versión más reciente y se posiciona como superior a Qwen3.6-27B en tareas de codificación y agentes, según la descripción. La licencia Apache 2.0 permite uso comercial libre, mientras que Qwen3.7-Plus podría tener una licencia restrictiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo específicas. Como modelo de lenguaje grande, es probable que herede sesgos de los datos de entrenamiento, lo que puede afectar a la equidad en aplicaciones sensibles.
- Riesgo de alucinación: el modelo puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo o conocimiento factual. Se recomienda verificación humana en aplicaciones críticas.
- Limitaciones de contexto: aunque la ventana nativa es de 262k tokens, la extensión a 1M puede degradar el rendimiento si no se aplica correctamente la interpolación de posiciones. Además, la atención lineal puede tener dificultades para acceder a información en posiciones muy distantes.
- Limitaciones de idioma: no se especifica el conjunto de idiomas soportados. Si el modelo está optimizado para inglés y chino, el rendimiento en otros idiomas podría ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero requiere incluir la atribución y el aviso de licencia en los productos derivados.
- Caveats de producción: la integración con herramientas como vLLM o SGLang es necesaria para un rendimiento óptimo, pero la compatibilidad con versiones específicas de estas librerías debe validarse. La carga de imágenes y vídeos aumenta el uso de memoria, lo que debe tenerse en cuenta en el dimensionamiento del hardware.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/Jiawenlong/Qwen3.8-27B
- Repositorio Hugging Face oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Benchmarks y velocidad en BenchLM: https://benchlm.ai/models/qwen3-8-27b

Nota: el repositorio `Jiawenlong/Qwen3.8-27B` es un espejo del modelo oficial `Qwen/Qwen3.8-27B`. Se recomienda usar el repositorio oficial para garantizar la integridad de los pesos y recibir actualizaciones.</think>## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (visión-lenguaje) desarrollado por el equipo Qwen de Alibaba, y representa la generación más reciente de la familia Qwen3.8. Con 27 mil millones de parámetros, está diseñado para tareas de codificación, trabajo profesional, investigación y automatización agéntica de largo alcance, manteniendo un tamaño que permite su despliegue en hardware de alta gama. Su arquitectura híbrida de atención (lineal y completa) le otorga una ventana de contexto nativa de 262.144 tokens, extensible hasta 1 millón, lo que lo hace relevante para aplicaciones que procesan documentos extensos, conversaciones multi-turno y comprensión de imágenes y vídeos.

El modelo destaca por un control flexible del razonamiento: el modo de pensamiento está activado por defecto, puede desactivarse por petición, y permite ajustar la profundidad de razonamiento con `reasoning_effort`, además de retener el contexto de razonamiento histórico con `preserve_thinking`. Su capacidad de visión-lenguaje nativa permite comprender imágenes, diagramas STEM, documentos y vídeos de hasta una hora de duración. Con licencia Apache 2.0, es totalmente de código abierto y se integra con herramientas como transformers, vLLM, SGLang y TokenSpeed, lo que facilita su adopción en entornos de producción.

La arquitectura combina 16 capas de atención completa (Gated Attention) con 48 capas de atención lineal (Gated DeltaNet), un diseño que reduce el coste computacional frente a la atención cuadrática estándar y permite escalar a contextos largos de forma eficiente. El modelo se ha entrenado con múltiples pasos de predicción de tokens (MTP) y se ha post-entrenado para mejorar la fiabilidad en tareas de agente y automatización de oficina. Aunque se han evaluado benchmarks como Terminal-Bench 2.1 y MathVision, los valores numéricos no están disponibles en la información de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, atención híbrida (16 capas Gated Attention + 48 capas Gated DeltaNet) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (no se especifican oficialmente; se esperan FP16, BF16, INT8, INT4) |
| Idiomas soportados | No disponible (no se detalla en la model card; presumiblemente multilingüe, pero no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso con un codificador de visión integrado. La arquitectura del modelo de lenguaje es híbrida: de las 64 capas totales, solo 16 utilizan atención completa (Gated Attention) con 24 cabezas de consulta y 4 de clave-valor, mientras que las otras 48 emplean atención lineal (Gated DeltaNet) con 48 cabezas de atención para V y 16 para QK. Esta combinación reduce el coste
