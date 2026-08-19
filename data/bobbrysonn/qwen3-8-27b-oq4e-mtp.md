# bobbrysonn/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal multimodal (imagen-texto) presentado como la última generación de la familia Qwen open-source. Según su model card, está desarrollado sobre la base arquitectónica de Qwen3.5 e incorpora mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. El modelo combina un encoder de visión con un modelo de lenguaje denso de 27.000 millones de parámetros declarados, aunque los pesos reales en safetensors del repositorio muestran aproximadamente 4.900 millones de parámetros, lo que supone una discrepancia significativa que debe tenerse en cuenta al evaluar el modelo.

La relevancia actual de este modelo radica en su naturaleza híbrida (atención lineal Gated DeltaNet combinada con atención completa Gated Attention), su soporte nativo para comprensión de imágenes y vídeo, y su control flexible del modo de razonamiento (thinking mode). Ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y está diseñado para ejecutar tareas agénticas multi-paso con mayor fiabilidad. El repositorio en HuggingFace ha sido publicado por el usuario "bobbrysonn" y no por el equipo oficial de Qwen, por lo que se recomienda verificar su procedencia antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27B (según model card) / 4.926.789.872 (~4,9B) según pesos safetensors (discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | 4-bit (según tag del repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la model card, Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. La arquitectura del modelo de lenguaje es híbrida y se organiza en 64 capas con una dimensión oculta de 5.120. El layout interno es de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet (atención lineal) seguidos de FFN, y 1 sub-bloque de Gated Attention (atención completa) seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 17.408. Se incluye además un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos para mejorar la eficiencia de decodificación.

El modelo incorpora un encoder de visión para procesar imágenes y vídeo, aunque no se especifican detalles sobre su arquitectura ni los datos de entrenamiento. La model card menciona que el modelo fue entrenado con pre-entrenamiento y post-entrenamiento, pero no se proporcionan cifras sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá de la arquitectura híbrida y el MTP.

## Capacidades

- Generación de texto y razonamiento multi-paso con control flexible del modo de pensamiento (thinking mode activado por defecto, desactivable por petición).
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Soporte para tareas agénticas de horizonte largo: planificación autónoma y manejo de feedback del entorno para completar tareas de principio a fin.
- Ajuste del esfuerzo de razonamiento mediante el parámetro `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Compatibilidad con herramientas de desarrollo populares y harnesses de evaluación, según la model card.
- Capacidades multilingües no especificadas explícitamente en la información disponible.

## Casos de uso

- Asistencia en programación y terminal: el modelo puede ejecutar tareas de codificación agéntica en terminal (según el benchmark Terminal Bench 2.1 mencionado), lo que permite automatizar flujos de desarrollo como generación de código, corrección de errores y refactorización en entornos de línea de comandos.
- Análisis de documentos técnicos y científicos: gracias a su comprensión de imágenes y diagramas STEM, puede extraer información de papers, figuras y tablas en investigaciones académicas.
- Automatización de tareas agénticas multi-paso: su capacidad de planificación autónoma y manejo de feedback lo hace adecuado para pipelines de automatización que requieren razonamiento encadenado, como orquestación de APIs o gestión de flujos de trabajo complejos.
- Procesamiento de vídeo de larga duración: puede resumir o extraer información de vídeos de hasta una hora, útil para análisis de vigilancia, revisión de contenido o generación de subtítulos descriptivos.
- Soporte conversacional con contexto extendido: con 262K tokens de contexto nativo, puede mantener conversaciones largas con historial completo, adecuado para asistentes virtuales en atención al cliente o tutoría.
- Desarrollo de agentes con tool calling: aunque no se menciona explícitamente, su arquitectura agéntica y compatibilidad con vLLM y SGLang sugiere que puede integrarse en sistemas que requieran llamadas a funciones externas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos, pero la información proporcionada está incompleta y truncada. Se mencionan las siguientes comparaciones, aunque sin valores numéricos disponibles:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados completos de benchmarks en la información disponible. La tabla se interrumpe antes de mostrar los valores numéricos, por lo que no es posible presentar datos concretos de rendimiento.

## Requisitos de hardware

- El repositorio tiene un tamaño de 17,0 GB, lo que sugiere que los pesos en safetensors ocupan aproximadamente esa cantidad (incluyendo posiblemente archivos de configuración y otros artefactos).
- Con los parámetros reales de ~4,9B en cuantización 4-bit, la VRAM estimada para inferencia sería de aproximadamente 3-4 GB solo para pesos, más overhead de activaciones y KV cache. Sin embargo, el tamaño del repo de 17 GB indica que podría haber más archivos o que la cuantización no es uniforme.
- Si el modelo real es de 27B (como afirma la model card), en 4-bit necesitaría ~13,5 GB de VRAM, lo que cabría en GPUs de 24 GB como RTX 3090, RTX 4090 o A10G.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para la versión 4-bit, o A100/H100 para despliegue con contexto largo completo.
- Opciones de despliegue: la model card indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan datos numéricos de rendimiento. Basándonos en la información disponible:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (este repo) | 27B declarados / ~4,9B reales | 262K nativo, 1M extensible | Apache-2.0 | HuggingFace (no oficial) |
| Qwen3.6-27B | 27B | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para una comparativa técnica rigurosa. Se recomienda consultar las fichas oficiales de los modelos mencionados para obtener datos verificables.

## Limitaciones y advertencias

- Discrepancia grave entre los parámetros declarados en la model card (27B) y los pesos reales en safetensors (~4,9B). Esto sugiere que el repositorio podría contener un modelo distinto al descrito, o que la model card es incorrecta o copiada de otro modelo.
- El repositorio ha sido publicado por un usuario no oficial ("bobbrysonn") y no por el equipo de Qwen. La fecha de creación (2026-08-14) es posterior a los modelos conocidos de Qwen, lo que añade incertidumbre sobre su autenticidad.
- No se especifican los idiomas soportados, lo que limita la evaluación de su cobertura multilingüe.
- No se proporcionan datos sobre sesgos, riesgos de alucinación ni limitaciones específicas de contexto o idioma.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de un repositorio no oficial, se recomienda verificar la procedencia de los pesos antes de su uso en producción.
- Los benchmarks mencionados en la model card no están completos, por lo que no se puede validar el rendimiento declarado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bobbrysonn/Qwen3.8-27B-oQ4e-mtp
- Servicio oficial Qwen Cloud (mencionado en la model card): https://www.qwencloud.com
- Página del modelo Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b

No se han encontrado papers, blogs o repositorios adicionales en la información proporcionada.
