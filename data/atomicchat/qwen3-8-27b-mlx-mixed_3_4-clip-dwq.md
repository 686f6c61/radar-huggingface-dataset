# AtomicChat/Qwen3.8-27B-MLX-mixed_3_4-CLIP-DWQ

## Resumen

AtomicChat/Qwen3.8-27B-MLX-mixed_3_4-CLIP-DWQ es una conversión del modelo multimodal Qwen3.8-27B de Alibaba al formato MLX, cuantizado con una mezcla de precisión de 3 y 4 bits. El modelo original es un LLM denso de 27.800 millones de parámetros con visión nativa, diseñado para tareas de codificación, flujos de trabajo agénticos y automatización de ofimática, tanto en texto como en imagen. Esta versión MLX está pensada para ejecutarse de forma eficiente en hardware de Apple (Apple Silicon) y en GPUs con poca memoria, ya que el repositorio ocupa 13,4 GB y cabe en tarjetas de 24 GB.

La relevancia de esta ficha radica en que se trata de un modelo de código abierto con una ventana de contexto de 256.000 tokens, lo que lo hace apto para procesar documentos extensos, conversaciones largas y análisis de imágenes complejas. La conversión a MLX con cuantización mixta 3/4-bit permite desplegarlo en entornos con recursos limitados, aunque la licencia exacta de esta versión no está especificada en la tarjeta del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con vision encoder (CLIP) |
| Parámetros totales | 27.800 M (modelo base); el archivo safetensors del repo reporta 3.994.946.800 (3,99B), dato inconsistente con el tamaño anunciado |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | 4-bit (mixta 3/4-bit, según el nombre "mixed_3_4") |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base es multilingüe |
| Licencia | No disponible en el repo; el modelo base Qwen3.8-27B se publica bajo Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso multimodal de 27.800 millones de parámetros, desarrollado por el equipo Qwen de Alibaba. Es una evolución de Qwen3.6-27B, con mejoras específicas en codificación y automatización de ofimática, tanto en modalidad de texto como visual. La arquitectura combina un transformer de lenguaje con un vision encoder (el nombre "CLIP" en la versión MLX indica el uso de un codificador de imágenes similar a CLIP) y un adaptador multimodal que alinea las representaciones visuales con el espacio de texto. El modelo es denso, es decir, no emplea mezcla de expertos (MoE), lo que simplifica el despliegue en hardware uniforme.

La variante MLX de AtomicChat aplica cuantización mixta de 3 y 4 bits sobre los pesos originales, optimizada para la librería MLX de Apple. No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; la documentación del repo base solo menciona mejoras incrementales sobre la versión 3.6-27B en tareas de código y ofimática.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto, respondiendo a preguntas sobre el contenido visual.
- Codificación: genera, revisa y depura código en varios lenguajes, con mejoras específicas en tareas de programación.
- Flujos de trabajo agénticos: capaz de ejecutar secuencias de pasos múltiples, útil para automatización de tareas complejas.
- Automatización de ofimática: interpreta documentos, hojas de cálculo y presentaciones a partir de imágenes o texto.
- Conversación multi-turno: mantiene contexto largo gracias a la ventana de 256.000 tokens.
- Tool calling: el modelo base soporta invocación de herramientas, aunque la conversión MLX no documenta explícitamente esta capacidad.
- Multilingüe (base): el modelo original de Alibaba soporta numerosos idiomas, aunque la model card de esta conversión declara solo inglés.

## Casos de uso

- Asistente de documentación técnica: el modelo puede procesar manuales extensos y capturas de pantalla de interfaces, respondiendo preguntas sobre configuración o troubleshooting. Su contexto de 256.000 tokens permite ingerir un manual completo sin truncamiento.
- Análisis de facturas y recibos: con la capacidad de leer texto en imágenes (OCR), puede extraer campos clave de facturas escaneadas y estructurarlos en JSON para integración en sistemas contables.
- Automatización de ofimática: dado un documento de texto o una imagen de una tabla, puede generar resúmenes, convertir formatos o rellenar plantillas, reduciendo tareas manuales.
- Generación y revisión de código en pipelines CI/CD: su capacidad de codificación y su ventana de contexto permiten usarlo en repositorios grandes para revisar pull requests, detectar errores y sugerir parches.
- Agente de soporte al cliente con visión: integrado en un chatbot, puede recibir capturas de pantalla de errores del usuario y proporcionar soluciones paso a paso, manteniendo el historial de la conversación.
- Procesamiento de informes financieros: a partir de imágenes de tablas y gráficos, extrae valores, calcula tendencias y genera resúmenes ejecutivos en formato de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros tests comparativos para esta conversión MLX. La documentación del modelo base menciona mejoras en codificación y ofimática sobre Qwen3.6-27B, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 13,4 GB, por lo que cabe en GPUs con 16 GB de VRAM en cuantización 4-bit. La web de Atomic Chat indica que es apto para una GPU de 24 GB.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra o superior) para MLX; en PC, una RTX 4090 o similar con 24 GB de VRAM.
- Consumer GPU: sí, se puede ejecutar en tarjetas de gama alta de consumo (RTX 3090/4090) con cuantización 4-bit.
- Opciones de despliegue: MLX (con `mlx-lm`), vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama (con conversión previa).
- Latencia y throughput: no disponibles. En MLX, el rendimiento depende del chip; en vLLM con GPU de 24 GB, se espera un throughput razonable para 27B cuantizado, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8B | 256K | Sí | Apache 2.0 | HuggingFace |
| Qwen3.6-27B | 27,8B | 256K | Sí | Apache 2.0 | HuggingFace |
| Qwen2.5-VL-32B | 32B | 128K | Sí | Apache 2.0 | HuggingFace |
| AtomicChat MLX (este) | 27,8B (base) | 256K | Sí | No disponible | HuggingFace |

La conversión MLX no altera las capacidades del modelo base, solo el formato y la cuantización. La principal diferencia con Qwen2.5-VL-32B es el contexto mayor (256K frente a 128K) y la orientación a ofimática y agentes. El modelo base de Qwen3.8-27B es el mismo que esta conversión, por lo que la comparativa relevante es frente a otras variantes cuantizadas en MLX o GGUF.

## Limitaciones y advertencias

- La licencia de esta conversión no está especificada en la model card; aunque el modelo base es Apache 2.0, conviene verificar antes de uso comercial.
- No hay datos de benchmarks ni de rendimiento publicados, por lo que es necesario evaluar el modelo en la tarea específica.
- La cifra de parámetros en el archivo safetensors (3,99B) no coincide con el tamaño anunciado (27,8B), lo que puede indicar un error en la subida o una cuantización parcial. Se recomienda verificar la integridad del repositorio antes de usarlo en producción.
- El modelo puede presentar alucinaciones en tareas visuales complejas, como cualquier modelo multimodal.
- La model card declara solo inglés, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está garantizado.
- No se documentan restricciones de sesgo o contenido dañino; se recomienda aplicar medidas de mitigación al desplegarlo en entornos públicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-mixed_3_4-CLIP-DWQ
- Página del modelo en Atomic Chat: https://atomic.chat/models/qwen3-8-27b
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
