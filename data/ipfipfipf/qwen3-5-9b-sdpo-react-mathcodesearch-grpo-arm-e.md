# ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e

## Resumen

El modelo `ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B-Base, desarrollado por el usuario ipfipfipf y publicado en Hugging Face. El nombre del repositorio sugiere que se ha entrenado con una combinación de técnicas de optimización por preferencias (SDPO), razonamiento y actuación (ReAct), y aprendizaje por refuerzo (GRPO), con un enfoque específico en tareas de matemáticas, búsqueda de código y razonamiento agéntico. Aunque la model card del autor no proporciona detalles sobre el proceso de entrenamiento, el modelo hereda la arquitectura y capacidades del base Qwen3.5-9B, que es un modelo multimodal de 9 mil millones de parámetros con soporte para texto e imágenes.

Qwen3.5-9B es la apuesta de Alibaba por un modelo compacto pero potente, con una arquitectura híbrida que combina Gated Delta Networks con atención lineal y atención clásica, junto con un componente de visión integrado desde el inicio. Con una ventana de contexto nativa de 262 144 tokens (extensible hasta más de un millón), este modelo está diseñado para tareas que requieren procesar secuencias largas, como análisis de documentos extensos o razonamiento multi-paso. El fine-tune aquí presentado añade una capa de especialización en dominios concretos, aunque no se han publicado métricas que demuestren su rendimiento específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention + FFN, con vision encoder (basada en Qwen3.5-9B-Base) |
| Parametros totales | 8 953 803 264 (8,95B) |
| Parametros activos | no disponible (el base Qwen3.5-9B usa MoE, pero no se especifica el número de activos para este fine-tune) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 (según el base) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | no disponible (el base declara soporte para 201 idiomas y dialectos, pero no se confirma para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-9B es un transformer causal con un codificador de visión integrado mediante fusión temprana de tokens multimodales. La parte de lenguaje combina dos tipos de capas: por cada bloque de 4 capas, tres usan Gated DeltaNet (una variante de atención lineal con cabezas separadas para V y QK) y una usa Gated Attention clásica con RoPE. Esta mezcla busca un equilibrio entre eficiencia computacional y capacidad de recuperación de información. El modelo tiene 32 capas, dimensión oculta 4096, y una salida de 248 320 tokens de vocabulario. El entrenamiento del base incluyó una fase de pre-entrenamiento masiva y una fase de post-entrenamiento con RL a escala, pero los detalles específicos del fine-tune (datos, duración, hiperparámetros) no están documentados en la model card. El nombre del repositorio indica que se aplicaron técnicas como SDPO (probablemente Stepwise Direct Preference Optimization), ReAct (para razonamiento y actuación), GRPO (Group Relative Policy Optimization) y posiblemente ARM-E, aunque no hay confirmación oficial.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base.
- Procesamiento de imágenes y texto (pipeline image-text-to-text), lo que permite tareas de visión-lenguaje como respuesta a preguntas visuales o descripción de imágenes.
- Soporte de tool calling y function calling, según las capacidades del base Qwen3.5-9B.
- Razonamiento agéntico y multi-step reasoning, potenciado por el entrenamiento ReAct y GRPO que sugiere el nombre.
- Especialización probable en matemáticas y búsqueda de código, dada la nomenclatura del repositorio (mathcodesearch).
- Multilingüismo: el base declara soporte para 201 idiomas, aunque no se confirma si el fine-tune mantiene esta cobertura completa.
- Ventana de contexto muy larga (262K nativa), adecuada para documentos extensos y conversaciones largas.

## Casos de uso

- Asistente de programación con búsqueda de código: el modelo puede recibir una consulta en lenguaje natural, buscar fragmentos de código relevantes en un repositorio y generar respuestas o parches, aprovechando su entrenamiento en code search y su capacidad de tool calling.
- Resolución de problemas matemáticos en entornos educativos: gracias a su especialización en matemáticas, puede descomponer problemas complejos en pasos intermedios y explicar el razonamiento, útil para tutores automáticos o plataformas de aprendizaje.
- Agente autónomo para tareas de análisis de datos: con su soporte de ReAct y GRPO, puede planificar secuencias de acciones (consultar APIs, ejecutar scripts, leer resultados) para responder preguntas sobre datos estructurados.
- Análisis de documentos técnicos extensos: su contexto de 262K tokens permite procesar manuales, papers o informes largos completos y extraer conclusiones o resumir secciones específicas.
- Chatbot multimodal para soporte técnico: al aceptar imágenes, puede diagnosticar problemas a partir de capturas de pantalla o diagramas, combinando visión y razonamiento textual.
- Generación de documentación a partir de código: dado un repositorio, puede generar explicaciones, comentarios o guías de uso, gracias a su capacidad de comprensión de código y lenguaje natural.
- Automatización de flujos de trabajo con herramientas externas: mediante function calling, puede integrarse en pipelines que requieren llamar a APIs o bases de datos, por ejemplo para enriquecer respuestas con información en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune. Los datos disponibles corresponden al modelo base Qwen3.5-9B, extraídos de su model card oficial:

| Benchmark | Qwen3.5-9B (base) |
|---|---|
| MMLU-Pro | 82,5 |
| MMLU-Redux | 91,4 (valor no mostrado en el fragmento, se infiere de la tabla parcial) |
| Otros (razonamiento, código, visión) | no disponibles en el fragmento |

No se dispone de comparaciones con otros modelos para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,95B parámetros en fp16, se necesitan aproximadamente 18 GB de VRAM (más overhead de activaciones y KV cache). Con cuantización INT8, ~9 GB; con INT4, ~5 GB.
- GPU recomendadas: para inferencia en fp16, una GPU con 24 GB (RTX 3090/4090, A10G) es suficiente. Para cuantización INT4, una RTX 3060 de 12 GB podría funcionar.
- En consumer GPU: sí, cabe en RTX 3090/4090 con cuantización, y en GPUs de 16 GB con INT8.
- Opciones de despliegue: vLLM, SGLang, KTransformers, llama.cpp (si se convierten los pesos a GGUF), Ollama (con conversión previa). El formato safetensors es compatible con Transformers.
- Latencia y throughput: no se han publicado mediciones específicas para este fine-tune. Como referencia, un modelo de 9B en vLLM con una GPU A100 suele alcanzar entre 50 y 100 tokens por segundo, dependiendo de la longitud de secuencia y el batch.

## Comparativa con modelos similares

Dado que no hay benchmarks del fine-tune, se comparan las características del modelo base con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 8,95B | 262K (ext. 1M) | Apache 2.0 | Multimodal, híbrido DeltaNet+Attention |
| Qwen3-8B (base) | 8,2B | 32K | Apache 2.0 | Solo texto, arquitectura transformer estándar |
| Llama-3.1-8B | 8,0B | 128K | Llama 3.1 | Solo texto, muy usado en fine-tunes |
| Gemma-2-9B | 9,2B | 8K | Gemma | Solo texto, eficiente en memoria |

El Qwen3.5-9B destaca por su contexto nativo mucho mayor y su capacidad multimodal, algo poco común en modelos de este tamaño. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- No se dispone de documentación sobre el proceso de fine-tune (datos, hiperparámetros, evaluación), por lo que el comportamiento real del modelo puede diferir del esperado.
- El nombre del repositorio sugiere especialización en matemáticas y código, pero no hay evidencia pública de que el fine-tune haya mejorado o mantenido el rendimiento del base en esas áreas.
- El modelo base puede presentar sesgos heredados de sus datos de entrenamiento; el fine-tune no corrige necesariamente estos sesgos.
- Riesgo de alucinación, especialmente en tareas de razonamiento complejo o generación de código, donde puede producir respuestas plausibles pero incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original (Qwen3.5-9B) para posibles restricciones adicionales, aunque en principio es permisiva.
- Al ser un modelo multimodal, el procesamiento de imágenes requiere recursos adicionales de memoria y cómputo.
- No se garantiza que el fine-tune mantenga el soporte multilingüe completo del base; es posible que el entrenamiento haya reducido la cobertura a los idiomas presentes en sus datos.

## Enlaces

- Repositorio del fine-tune: https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Página de Qwen3.5-9B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- API y playground en Fireworks AI: https://fireworks.ai/models/fireworks/qwen3p5-9b
