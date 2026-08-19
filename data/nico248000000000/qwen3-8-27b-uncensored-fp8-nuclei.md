# nico248000000000/Qwen3.8-27B-Uncensored-FP8-nuclei

## Resumen

El modelo `nico248000000000/Qwen3.8-27B-Uncensored-FP8-nuclei` es un fine-tune LoRA/QLoRA del checkpoint `orcarouter/Qwen3.8-27B-Uncensored-FP8`, una versión abliterada (refusal-removed) y cuantizada en FP8 de Qwen3.8-27B, el modelo denso de 27B parámetros de Alibaba con atención híbrida (Gated DeltaNet linear + full attention) y capacidades nativas de visión y vídeo. El fine-tune está especializado en la generación de scripts de nuclei a partir de descripciones de CVEs o exploits, un dominio concreto de seguridad ofensiva.

El entrenamiento se realizó con Unsloth sobre un dataset SFT de 919 ejemplos (10 de validación), con contexto de 2048 tokens, en una NVIDIA RTX PRO 6000 durante 16,7 minutos. El resultado es un asistente conversacional que mantiene las torres de visión y vídeo congeladas del modelo base, aunque el fine-tune solo afecta a las capas de texto. Su relevancia radica en ofrecer una herramienta especializada para automatizar la redacción de plantillas de detección de vulnerabilidades, un paso crítico en los flujos de seguridad modernos, partiendo de un modelo base ya optimizado para inferencia en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet linear + full attention) y torres de visión/vídeo (heredado de Qwen3.8-27B) |
| Parametros totales | 27B (modelo base) + adaptador LoRA (rank 8, sin especificar número exacto) |
| Parametros activos | 27B (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (modelo base); 2048 tokens usados en entrenamiento |
| Tipos de cuantizacion | FP8 (modelo base) y bf16 (adaptador LoRA) |
| Idiomas soportados | Inglés, francés (según model card) |
| Licencia | other (hereda la del modelo base `orcarouter/Qwen3.8-27B-Uncensored-FP8`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `orcarouter/Qwen3.8-27B-Uncensored-FP8` es una variante de Qwen3.8-27B, un transformer denso de 27B parámetros que combina atención lineal Gated DeltaNet con atención full attention en capas alternas, lo que reduce el coste computacional en contextos largos. Incluye un cabezal MTP (Multi-Token Prediction) para decodificación especulativa y soporte nativo de tool-calling. La versión "Uncensored" ha sido sometida a un proceso de abliteración (eliminación de rechazos) y cuantización offline a FP8, lo que reduce el tamaño a unos 27 GB y facilita su despliegue en GPUs de consumo.

El fine-tune se realizó con LoRA/QLoRA (Unsloth) con rank 8 y alpha 16, sobre las proyecciones q, k, v, o, out, gate, up y down. Se entrenó durante 1 época con learning rate 0.0002, warmup 0.05, batch efectivo 8, optimizador adamw_8bit y packing de secuencias. El dataset `dataset_nuclei.jsonl` contiene 919 ejemplos de entrenamiento y 10 de validación, en formato chat templated. Las torres de visión y vídeo se mantuvieron congeladas; solo se actualizaron los pesos de texto. La evaluación en el holdout arroja una pérdida de 14.0907, que no es comparable a benchmarks públicos.

## Capacidades

- Generación de scripts de nuclei (plantillas YAML) a partir de descripciones de CVEs o exploits, su tarea principal.
- Comprensión de contexto de seguridad: CVEs, exploits, técnicas de ataque y controles de mitigación.
- Razonamiento conversacional multi-turno para aclarar requisitos de detección.
- Mantiene las torres de visión y vídeo del modelo base (congeladas), por lo que puede procesar imágenes o vídeos si se usa el checkpoint fusionado con el proyector multimodal adecuado.
- Hereda del modelo base la capacidad de tool-calling y decodificación especulativa (MTP), aunque el fine-tune no las ha validado explícitamente.
- Soporte de chat en inglés y francés, según la model card.

## Casos de uso

- Generación automatizada de plantillas nuclei para nuevos CVEs: un analista de seguridad introduce la descripción de una vulnerabilidad y el modelo produce un script YAML listo para probar, acelerando la respuesta ante amenazas.
- Asistente en auditorías de seguridad: ayuda a redactar reglas de detección para infraestructuras críticas, partiendo de informes técnicos o advisories.
- Creación de PoC (proof-of-concept) para entornos controlados: el modelo puede esbozar scripts de nuclei para validar la exposición de servicios internos.
- Documentación de vulnerabilidades: genera explicaciones legibles de cómo funciona un exploit y qué controles implementar, combinando el conocimiento del dominio con el razonamiento del modelo.
- Integración en pipelines de CI/CD de seguridad: mediante tool-calling, el modelo podría conectarse a APIs de gestión de vulnerabilidades y generar automáticamente plantillas para su revisión.
- Formación y capacitación: como ejemplo didáctico para enseñar a redactar plantillas de nuclei, mostrando estructuras correctas y patrones comunes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este fine-tune. El único dato disponible es la pérdida de evaluación sobre el holdout del dataset de entrenamiento:

| Métrica | Valor |
|---|---|
| Eval loss (holdout, 10 ejemplos) | 14.0907 |

Este valor no es comparable con otros modelos y no debe interpretarse como una medida de calidad general. El autor indica que no se trata de un leaderboard público.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP8 ocupa aproximadamente 27 GB, por lo que se necesita al menos 30 GB de VRAM para cargarlo completo. Con cuantizaciones adicionales (GGUF Q4_K_M, Q5_K_M) puede caber en GPUs de 16-24 GB.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) con cuantización 4-bit; A100 40 GB o H100 para FP8 completo; RTX PRO 6000 (usada en entrenamiento) para mayor margen.
- Puede ejecutarse en GPUs de consumo (RTX 3090/4090) si se aplica cuantización adicional o se usa offloading de capas.
- Opciones de despliegue: vLLM, TGI, llama.cpp (con conversión a GGUF), Ollama, o Transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles; dependen de la GPU, cuantización y longitud de contexto. En una RTX 4090 con cuantización 4-bit, se espera una generación de 20-40 tokens/s para contexto corto, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Generalista, visión-lenguaje | Apache 2.0 (según Alibaba) |
| Qwen3.8-27B-Uncensored-FP8 (base) | 27B | 262K | Generalista, abliterado, FP8 | other (heredada) |
| Este fine-tune (nuclei) | 27B + LoRA | 262K (base) | Generación de scripts nuclei | other (heredada) |

No se dispone de benchmarks comparativos entre estos modelos. La diferencia principal es el ajuste fino al dominio de seguridad y la eliminación de rechazos en el base, lo que puede afectar a la seguridad de las respuestas fuera del dominio.

## Limitaciones y advertencias

- Dominio limitado: la calidad cae significativamente fuera de los temas del SFT (seguridad, CVEs, nuclei). No debe usarse para tareas generales sin validación.
- Riesgo de alucinación: al ser un fine-tune pequeño (919 ejemplos), puede generar scripts con sintaxis incorrecta o lógica errónea; requiere revisión humana experta antes de su uso en entornos reales.
- Sesgo de abliteración: el modelo base ha sido modificado para eliminar rechazos, lo que puede producir respuestas inapropiadas o peligrosas si se usa fuera del contexto de seguridad.
- Licencia restrictiva: la licencia `other` heredada del base puede limitar el uso comercial o la redistribución; es imprescindible revisar la licencia de `orcarouter/Qwen3.8-27B-Uncensored-FP8` antes de cualquier despliegue.
- Contexto de entrenamiento corto (2048 tokens): aunque el modelo base soporta 262K, el fine-tune no ha sido entrenado para manejar contextos largos; puede degradarse con entradas extensas.
- Idiomas limitados: solo se declaran inglés y francés; el rendimiento en otros idiomas no está garantizado.
- Evaluación insuficiente: el único dato de rendimiento es la pérdida en 10 ejemplos de validación; no hay pruebas de robustez, sesgos ni seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nico248000000000/Qwen3.8-27B-Uncensored-FP8-nuclei
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Modelo original Qwen3.8-27B (Kaggle): https://www.kaggle.com/models/noillum123/qwen3-8-27b-uncensored-fp8
- Artículo sobre Qwen3.8-27B (OpenLM): https://openlm.ai/qwen3.8/
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
- Noticia sobre el lanzamiento: https://cybernews.com/tech/qwen-38-27b-ai-model-debuts-with-million-downloads/
