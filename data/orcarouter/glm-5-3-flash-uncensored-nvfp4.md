# orcarouter/GLM-5.3-Flash-Uncensored-NVFP4

## Resumen

El modelo `orcarouter/GLM-5.3-Flash-Uncensored-NVFP4` es una versión modificada del modelo base `zai-org/GLM-5.3-Flash` de Z.ai, un modelo de lenguaje multimodal de arquitectura mixta (MoE) con 313.890.438.974 parámetros totales (aproximadamente 314B) y unos 18B parámetros activos. La modificación, realizada por OrcaRouter, elimina los rechazos del modelo (refusal removal) directamente en los pesos, sin emplear LoRA ni técnicas de jailbreak, según la descripción del autor. El resultado es un modelo "uncensored" que mantiene las capacidades originales de razonamiento, visión, function calling y multi-token prediction (MTP).

Esta versión concreta está cuantizada en NVFP4 (4 bits), un formato de precisión reducida basado en FP4 y compatible con la librería compressed-tensors de vLLM. El modelo se distribuye bajo licencia MIT y con acceso restringido (gated) en HuggingFace. Su relevancia radica en ofrecer una alternativa sin censura para tareas de investigación, red-teaming y generación creativa, manteniendo un rendimiento similar al original en un tamaño de archivo reducido (190 GB frente a los más de 600 GB que ocuparía el modelo en FP16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención lineal y MTP (multi-token prediction) |
| Parametros totales | 313.890.438.974 (aprox. 314B) |
| Parametros activos | 18B (según Z.ai) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) sobre la versión FP8 original |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base `GLM-5.3-Flash` de Z.ai es un transformer de tipo MoE con 320B parámetros totales (según la comunicación oficial de Z.ai) y 18B activos por token. Incluye capacidades multimodales (procesa imagen y texto), function calling, razonamiento multi-paso y MTP (predicción de múltiples tokens), lo que acelera la decodificación. La versión uncensored de OrcaRouter modifica los pesos del modelo original para eliminar los patrones de rechazo aprendidos durante el entrenamiento con RLHF. Según el autor, el proceso de edición se realiza directamente sobre los pesos, sin necesidad de adaptadores adicionales. La cuantización NVFP4 se aplica sobre la versión FP8 del modelo, reduciendo el tamaño de almacenamiento y los requisitos de memoria para inferencia.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el método exacto de edición de pesos utilizado por OrcaRouter. La fecha de creación (agosto de 2026) sugiere que se trata de un modelo reciente, y la versión original fue publicada bajo licencia MIT tres días antes de la aparición de esta variante.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo matemáticas, lógica y análisis.
- Comprensión de imágenes (image-text-to-text) con entrada multimodal.
- Function calling / tool calling para integración en agentes y APIs.
- Razonamiento multi-step y planificación de tareas complejas.
- MTP (multi-token prediction) para decodificación más rápida.
- Soporte multilingüe limitado a inglés y chino.
- Ausencia de rechazos: el modelo no se niega a responder a peticiones que el modelo original rechazaría (contenido explícito, violencia, etc.), lo que lo hace útil para red-teaming y análisis de seguridad.
- Sin modo de pensamiento oculto (thinking mode) visible, aunque el razonamiento se genera de forma explícita.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo permite probar sistemas de moderación y detectar vulnerabilidades en pipelines de IA, al generar respuestas sin filtros que pueden revelar sesgos o comportamientos peligrosos.
- Investigación académica sobre alineación: estudiar cómo la eliminación de rechazos afecta al rendimiento en tareas estándar y cuantificar el trade-off entre utilidad y seguridad.
- Generación de contenido creativo sin restricciones: escritura de ficción, poesía, guiones o diálogos que requieran explorar temas tabú o extremos sin limitaciones impuestas por el modelo.
- Desarrollo de agentes autónomos: su soporte de function calling y razonamiento multi-paso lo hace adecuado para construir asistentes que interactúan con APIs, bases de datos o herramientas externas.
- Análisis de imágenes y documentos: al ser multimodal, puede extraer información de imágenes y combinarla con texto para tareas de descripción, resumen o extracción de datos.
- Evaluación de modelos cuantizados: probar el rendimiento de NVFP4 frente a FP8 o FP16 en tareas de generación y razonamiento, para decidir si esta cuantización es viable en producción.
- Despliegue de API de bajo coste: gracias a la cuantización de 4 bits, el modelo puede ejecutarse en infraestructura más modesta que la necesaria para el modelo original, reduciendo el coste por token (según OrcaRouter, $0.07 / $0.25 por 1M tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página del modelo en HuggingFace no incluye métricas de evaluación, y la búsqueda web no proporciona datos comparativos con el modelo original o con alternativas. Se recomienda consultar la documentación de Z.ai para obtener resultados del modelo base `GLM-5.3-Flash` en tareas como MMLU, HumanEval o GSM8K, aunque no se garantiza que la versión uncensored mantenga el mismo rendimiento tras la edición de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 190.2 GB, lo que sugiere que los pesos en NVFP4 ocupan aproximadamente 157 GB (314B × 0.5 bytes). Con overhead de activaciones y KV cache, se necesitaría al menos 200 GB de VRAM.
- GPU recomendadas: no se especifica, pero para ejecutar el modelo completo se requerirían múltiples GPUs de alta gama, por ejemplo 4× A100 80GB, 4× H100 80GB o 8× RTX 4090 24GB (aunque el ancho de banda sería limitante).
- No cabe en una GPU de consumo estándar (RTX 4090 24GB, RTX 5080 16GB, etc.) debido al tamaño de los pesos.
- Opciones de despliegue: vLLM con soporte para compressed-tensors (NVFP4), TensorRT-LLM, o frameworks personalizados que soporten FP4. También es posible usar llama.cpp si se convierte a GGUF, aunque no se ha confirmado compatibilidad.
- Latencia y throughput: no disponibles. Dado el tamaño y la cuantización, se espera un throughput moderado en comparación con modelos más pequeños, pero la decodificación MTP puede mejorar la velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Cuantización | Acceso |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (original) | 320B | 18B | no disponible | MIT | FP8 | abierto |
| GLM-5.3-Flash-Uncensored-NVFP4 (este) | 314B | 18B | no disponible | MIT | NVFP4 (4 bits) | restringido (gated) |
| DeepSeek-V3 (MoE) | 671B | 37B | 128K | MIT | FP8 | abierto |
| Qwen2.5-Max | 200B+ (no confirmado) | no disponible | 128K | Apache 2.0 | FP8 | abierto |

La comparativa se basa en características generales, ya que no hay datos de rendimiento publicados para esta variante. El modelo se diferencia por su naturaleza uncensored y su cuantización de 4 bits, que reduce los requisitos de memoria frente a DeepSeek-V3 o Qwen2.5-Max.

## Limitaciones y advertencias

- Al ser una versión uncensored, el modelo puede generar contenido dañino, ofensivo o ilegal. No debe utilizarse en producción sin un sistema de moderación robusto.
- La edición de pesos puede degradar el rendimiento en tareas que requieren juicio ético o seguridad, aunque no se han medido los efectos.
- El acceso está restringido en HuggingFace; es necesario aceptar condiciones adicionales, lo que puede limitar su uso en entornos automatizados.
- La cuantización NVFP4 puede introducir pérdida de precisión en comparación con FP8 o FP16, especialmente en tareas de razonamiento complejo o matemáticas.
- Solo soporta inglés y chino, lo que limita su uso en aplicaciones multilingües.
- No se dispone del contexto máximo, lo que impide planificar cargas de trabajo con ventanas largas.
- El modelo base fue lanzado en agosto de 2026 y esta variante es experimental; no hay garantías de mantenimiento o soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-NVFP4
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de ExplainX sobre el lanzamiento: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Publicación en X (OrcaRouter): https://x.com/OrcaRouter/status/2093612518396871075
- Publicación en LinkedIn: https://www.linkedin.com/posts/orcarouter_glm-53-flash-uncensored-native-fp8-activity-7499733012641742848-kb30
- Página de precios y API de OrcaRouter: https://www.orcarouter.ai/models/z-ai/glm-5.3-flash
- Repositorio alternativo con el mismo nombre: https://huggingface.co/ericlewis/GLM-5.3-Flash-OrcaRouter-Uncensored-NVFP4
