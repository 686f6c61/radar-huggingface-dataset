# max0789/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino (finetune) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es una destilación de DeepSeek-V4-Pro sobre la base Qwen3.5-9B. Lo publica el usuario max0789 en Hugging Face bajo licencia Apache 2.0. El objetivo declarado es eliminar los comportamientos de rechazo del modelo original mediante la herramienta Heretic v2.0.0.dev0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre capas concretas del transformer.

El modelo conserva la orientación del original hacia razonamiento matemático y STEM, entrenado sobre aproximadamente 250.000 muestras de matemáticas y ciencia destiladas de DeepSeek-V4-Pro en modo Max Effect. Con 9.409.813.744 parámetros reales en safetensors, se posiciona en la clase de 9B, lo que permite despliegue en GPU de consumo con cuantización. La model card reporta una reducción de rechazos de 100/100 a 3/100 sobre un conjunto de evaluación de 100 peticiones, con una divergencia KL de 0,0422 respecto al modelo base.

La relevancia actual radica en dos frentes: por un lado, la posibilidad de obtener un modelo de razonamiento compacto sin las restricciones de alineación del original; por otro, la documentación explícita de los parámetros de ablación y de las rutas de despliegue evaluadas (vLLM con NVFP4 y llama.cpp con MTP-Q8_0), lo que facilita la reproducibilidad técnica. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B), ajuste fino con destilación de DeepSeek-V4-Pro |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; se mencionan evaluaciones con NVFP4 (vLLM) y MTP-Q8_0 (llama.cpp) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB); compatible con transformers |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-9B, un transformer denso de aproximadamente 9,4 mil millones de parámetros, y se ajusta mediante destilación de las respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El conjunto de entrenamiento se centra en matemáticas y STEM, con alrededor de 250.000 muestras. La model card menciona técnicas de SFT (supervised fine-tuning) y RL (reinforcement learning) con GSPO (Group Sequence Policy Optimization), aunque no detalla la composición exacta del dataset ni el número total de tokens de entrenamiento.

La innovación principal de esta variante concreta es la aplicación de Heretic v2.0.0.dev0, que realiza una ablación de rangos arbitrarios (ARA) sobre las capas 9 a 24 del modelo. Los parámetros reportados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta intervención busca preservar el comportamiento útil mientras se suprime la tendencia a rechazar peticiones. La model card también indica que se evaluaron rutas de despliegue con MTP (multi-token prediction) y NVFP4, aunque no se especifican los detalles de implementación.

## Capacidades
- Generación de texto y razonamiento multi-paso, con énfasis en descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM, gracias al entrenamiento sobre aproximadamente 250.000 muestras específicas.
- Soporte de tool calling y function calling, según las etiquetas del repositorio.
- Capacidades de agente y razonamiento multi-paso, aunque no se detallan en la model card.
- Multilingüismo limitado a seis idiomas: inglés, chino, coreano, japonés, español y ruso.
- Capacidad de entrada image-text-to-text según la etiqueta del pipeline, aunque la model card no describe módulo de visión ni se detalla su funcionamiento.
- Modo "uncensored" o "abliterated": reducción drástica de rechazos (3/100 frente a 100/100 del original) según la evaluación del autor.
- No se menciona soporte de audio ni de pensamiento explícito (thinking mode) en la información disponible.

## Casos de uso
- Resolución de problemas matemáticos y científicos en entornos educativos o de investigación: el modelo puede descomponer ejercicios de cálculo, álgebra o física paso a paso, aprovechando las 250.000 muestras de entrenamiento centradas en STEM. Es adecuado para generar explicaciones detalladas y verificar derivaciones.
- Generación de código en pipelines de CI/CD: aunque no recibió SFT específico de código, la model card reporta pequeñas mejoras en programación por transferencia cruzada. Puede integrarse como asistente de revisión de parches o generación de tests unitarios, con la cautela de validar la salida.
- Automatización de atención al cliente con restricciones mínimas de rechazo: al haber reducido los rechazos a 3/100, el modelo puede gestionar conversaciones multi-turno sobre temas sensibles o ambiguos sin bloquear respuestas, siempre que se implementen salvaguardas externas.
- Herramientas de análisis de documentos técnicos en varios idiomas: con soporte para inglés, chino, coreano, japonés, español y ruso, puede resumir o extraer información de documentación multilingüe, aunque la longitud de contexto no está especificada.
- Experimentación en investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para evaluar el impacto de la ablación ARA en el comportamiento, comparando la divergencia KL (0,0422) y la tasa de rechazos con el modelo base.
- Desarrollo de agentes con tool calling: las etiquetas indican soporte de function calling, por lo que puede integrarse en frameworks de agentes para tareas de recuperación de información o ejecución de acciones, aunque no se documentan ejemplos concretos.
- Generación de contenido creativo sin filtros: para aplicaciones de escritura narrativa o guiones donde se requiera explorar temas controvertidos, el modelo ofrece menor tasa de rechazo, aunque con los riesgos asociados a la ausencia de alineación.

## Benchmarks y rendimiento
La model card solo reporta dos métricas de comportamiento, no benchmarks estándar de razonamiento o código:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 9,4B parámetros, una estimación orientativa sería de aproximadamente 19 GB en FP16, 10-11 GB en Q8, 6-7 GB en Q4 y 5-6 GB en Q3, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría en GPU de consumo como RTX 4090 (24 GB) en FP16 o cuantizaciones altas, y en RTX 3090/4080 con cuantización Q8 o inferior. Para despliegue en servidor, A100 o H100 serían adecuadas, pero no hay datos de rendimiento.
- Compatibilidad con GPU de consumo: probable en cuantizaciones Q8, Q4 y Q3 en GPU con 8-12 GB de VRAM, aunque no verificado.
- Opciones de despliegue: la model card menciona evaluaciones con vLLM (NVFP4) y llama.cpp (MTP-Q8_0). También es compatible con transformers y text-generation-inference según las etiquetas. No se menciona Ollama ni TGI de forma explícita, aunque la etiqueta text-generation-inference sugiere compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante sin censura, 3/100 rechazos, KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B (estimado) | no disponible | Apache 2.0 | Modelo base, 100/100 rechazos |
| Qwen3.5-9B (base original) | ~9B | no disponible | no disponible en la información | Modelo base de la familia Qwen3.5 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión de 4B del mismo proceso, mencionada en la model card |

No se dispone de datos de benchmarks comparativos para establecer diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias
- La eliminación de rechazos (3/100) implica que el modelo puede generar contenido dañino, sesgado o ilegal sin filtros. No debe desplegarse en producción sin salvaguardas externas.
- Riesgo elevado de alucinación en dominios fuera de matemáticas y STEM, dado que el entrenamiento se centró en esas áreas y no se reportan benchmarks de fidelidad.
- La longitud de contexto no está especificada, lo que impide planificar su uso en tareas de contexto largo.
- El soporte multilingüe se limita a seis idiomas; no se garantiza calidad en otros.
- Aunque la licencia es Apache 2.0, el modelo base y los datos de destilación pueden tener restricciones adicionales no documentadas. Se recomienda revisar la licencia del modelo original y de DeepSeek-V4-Pro.
- El modelo tiene cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad. No hay evidencia independiente de su calidad.
- La técnica de ablación ARA puede degradar capacidades generales no medidas; la divergencia KL de 0,0422 sugiere un cambio moderado, pero no se evalúa en tareas estándar.
- No se especifican los detalles del dataset de entrenamiento ni el número de tokens, lo que dificulta evaluar la reproducibilidad.

## Enlaces
- Hugging Face: https://huggingface.co/max0789/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión de 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Heretic: https://heretic-project.org
