# SergiioB/Ornith-1.5-35B-A3B-AutoRound-W4A16-sym-G128-MTP-BF16

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje multimodal de código abierto desarrollado por ornith-ai, que forma parte de la familia Ornith-1.5. Se trata de un modelo de mezcla de expertos (MoE) con 35 000 millones de parámetros totales, de los cuales solo se activan aproximadamente 3 000 millones por token, lo que permite un rendimiento de inferencia elevado con un coste computacional contenido. El modelo integra capacidades de visión, texto y agente, y destaca por su mecanismo de auto-mejora basado en "self-scaffolding", donde el propio modelo genera tareas y soluciones para entrenamiento por refuerzo.

Su relevancia actual radica en que ofrece un equilibrio entre tamaño, eficiencia y capacidades avanzadas, superando en benchmarks de código y tareas agénticas a modelos densos de tamaño similar como Gemma 4-31B o Muse Glimmer-30B, según los datos disponibles. Con una ventana de contexto de 262 000 tokens, está orientado a aplicaciones que requieren razonamiento de largo alcance, generación de código y uso de herramientas en entornos de producción. La versión cuantizada analizada en esta ficha (AutoRound W4A16) está optimizada para ejecutarse en hardware Intel Arc Pro B70 mediante vLLM, aunque el modelo base está disponible en formatos GGUF y MLX para otros despliegues.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 MoE |
| Parámetros totales | 35 000 millones (35B) |
| Parámetros activos | 3 000 millones (3B) por token |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantización | W4A16 (AutoRound), GPTQ Int4, GGUF (varias), MLX |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con un total de 35 000 millones de parámetros, de los cuales solo se activan 3 000 millones por cada token procesado. Esta configuración sigue la línea de los modelos Qwen3.5 MoE, lo que permite un balance entre capacidad de razonamiento y eficiencia computacional. El modelo incorpora un mecanismo de predicción de múltiples tokens (MTP) que acelera la generación, así como un módulo de visión integrado que lo convierte en un modelo multimodal de texto e imagen.

El entrenamiento se basa en el marco de "self-scaffolding" introducido en Ornith-1.0, extendido a un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para el aprendizaje por refuerzo. Este proceso crea continuamente nuevas experiencias de aprendizaje a partir de las cuales el modelo puede mejorar. No se han publicado datos detallados sobre el corpus de entrenamiento ni el número total de tokens, pero la arquitectura está optimizada para razonamiento multi-paso, uso de herramientas y tareas agéntica.

## Capacidades

- Generación de texto y razonamiento avanzado, con soporte para tareas de código, matemáticas y lógica.
- Razonamiento multi-paso y uso de herramientas (tool calling), integrado en el diseño de la familia Ornith.
- Capacidades de agente: puede planificar y ejecutar secuencias de acciones de forma autónoma.
- Multimodalidad de texto e imagen: acepta entradas de imagen (pipeline image-text-to-text) y genera respuestas textuales.
- Predicción de múltiples tokens (MTP) para acelerar la decodificación, con una capa MTP1 que alcanza velocidades de generación de hasta 96,3 tokens por segundo en hardware Intel Arc Pro B70 (medición auto-reportada).
- Soporte de contexto largo de 262 144 tokens, adecuado para documentos extensos y conversaciones de múltiples turnos.
- Multilingüe: aunque los idiomas soportados no están especificados en la documentación disponible, la arquitectura base de Qwen3.5 sugiere soporte para múltiples idiomas, aunque no se puede confirmar.

## Casos de uso

- **Asistente de programación en producción**: con soporte de tool calling y una ventana de contexto de 262K tokens, puede integrarse en entornos de desarrollo para generar código, refactorizar, explicar fragmentos y gestionar repositorios completos en una sola conversación.
- **Automatización de atención al cliente multimodal**: al aceptar imágenes y texto, puede gestionar tickets de soporte que incluyan capturas de pantalla o diagramas, manteniendo contexto de la conversación completa gracias a la ventana de 262K tokens.
- **Análisis de documentos técnicos extensos**: su contexto largo permite resumir o extraer información de manuales, informes o contratos de cientos de páginas en una sola pasada, sin necesidad de truncar.
- **Agente de automatización de tareas**: con soporte de tool calling y razonamiento multi-paso, puede orquestar workflows como consultas a APIs, generación de informes y ejecución de scripts, integrado en frameworks de agentes.
- **Sistema de tutoría interactiva**: su capacidad de razonamiento y generación de código lo hace adecuado para plataformas educativas que expliquen ejercicios de programación o matemáticas con explicaciones paso a paso.
- **Búsqueda y extracción de información en imágenes**: combinando visión y texto, puede procesar documentos escaneados o fotografías de pizarras y convertir su contenido en texto estructurado o resúmenes.
- **Generación de documentación técnica**: a partir de código fuente o especificaciones, el modelo puede redactar documentación coherente y detallada, reduciendo el tiempo de mantenimiento de proyectos.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks (como MMLU, HumanEval o GSM8K) en la información disponible. La fuente BenchLM.ai indica que el modelo ocupa el puesto 137 de 224 en su leaderboard público con una puntuación de 49.22/100, y que supera a su par de tamaño similar Qwen 3.6-35B en todos los benchmarks de código y agéntica, así como a modelos densos como Gemma 4-31B y Muse Glimmer-30B, aunque no se han especificado los valores numéricos concretos.

La información de la conversión AutoRound (repo cuantizado) reporta mediciones de velocidad en hardware Intel Arc Pro B70: aproximadamente 70,1 tokens/s en el modo de generación estándar, y 92,4-96,3 tokens/s con el modo MTP1 activado. Estas mediciones son auto-reportadas y no han sido reproducidas de forma independiente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base con 35B parámetros en BF16 requeriría aproximadamente 70 GB de VRAM; con cuantización Int4 (W4A16) se reduce a unos 18-20 GB, aunque no se ha confirmado oficialmente el valor exacto.
- **GPU recomendadas**: el modelo está optimizado para Intel Arc Pro B70 (24 GB de VRAM) según el repositorio de cuantización, que reporta velocidades de ~70 t/s con vLLM XPU. También puede ejecutarse en GPUs NVIDIA con al menos 24 GB (como RTX 3090/4090) o GPUs de data center como A100/H100 con las versiones GGUF o MLX.
- **Consumer GPU**: sí, con cuantización GGUF o Int4, puede caber en GPU consumer de 16-24 GB (por ejemplo RTX 4080/4090), aunque la velocidad será inferior a la de hardware Intel específico.
- **Opciones de despliegue**: vLLM (con soporte XPU para Intel), llama.cpp para GGUF, MLX para Apple Silicon, y Hugging Face Transformers para uso directo.
- **Latencia y throughput**: el repositorio reporta ~70 t/s en Intel Arc Pro B70 con vLLM, y 92-96 t/s con MTP activo. Estos datos son auto-reportados y no verificados de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Tipo |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35B | 3B | 262K | Apache-2.0 | MoE multimodal |
| Qwen 3.6-35B | 35B | no disponible | no disponible | Apache-2.0 | MoE |
| Gemma 4-31B | 31B | 31B (denso) | no disponible | Gemma License | Denso |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible | MoE |

Según la información disponible, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de código y agentes, y a Gemma 4-31B y Muse Glimmer-30B con amplia ventaja, aunque no se han publicado los valores numéricos exactos. La ventaja principal del modelo es su combinación de eficiencia (3B activos) con capacidades multimodales y contexto muy largo.

## Limitaciones y advertencias

- **Sesgos y alucinación**: no se han publicado estudios específicos sobre sesgos o tasas de alucinación para este modelo. Como cualquier modelo de lenguaje grande, puede generar contenido inexacto o inventado, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- **Limitaciones de idioma**: la documentación no especifica los idiomas soportados; aunque la arquitectura base Qwen3 sugiere soporte multilingüe, no se ha confirmado el rendimiento en idiomas distintos del inglés y chino.
- **Licencia**: la licencia Apache-2.0 permite uso comercial y modificación, pero se deben cumplir las condiciones de la licencia del modelo base `ornith-ai/Ornith-1.5-35B-A3B`, que puede incluir términos adicionales.
- **Despliegue en producción**: la versión cuantizada AutoRound está diseñada específicamente para Intel Arc Pro B70; en otras plataformas (NVIDIA, AMD) el rendimiento puede variar significativamente. El modelo base no está optimizado para todos los backends.
- **Datos de rendimiento no verificados**: las mediciones de velocidad y calidad de la cuantización son auto-reportadas por el autor del repo (SergiioB) y no han sido reproducidas de forma independiente. Se recomienda validar el rendimiento en el entorno de producción antes de su despliegue.
- **Multimodalidad**: aunque el modelo acepta imágenes, la calidad del procesamiento de visión no está documentada en detalle; la versión cuantizada mantiene el tower de visión en BF16, lo que puede limitar la memoria disponible para el contexto de texto en GPUs de menor capacidad.

## Enlaces

- [Repositorio del modelo base (ornith-ai/Ornith-1.5-35B-A3B)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Versión cuantizada AutoRound W4A16 (SergiioB)](https://huggingface.co/SergiioB/Ornith-1.5-35B-A3B-AutoRound-W4A16-sym-G128-MTP-BF16)
- [Versión GGUF oficial](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF)
- [Versión MLX oficial](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX)
- [Página del modelo en ModelScope](https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B)
- [Benchmarks y contexto (BenchLM.ai)](https://benchlm.ai/models/ornith-1-5-35b-a3b)
- [Artículo oficial de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Recetario de despliegue en Intel Arc Pro B70 (GitHub)](https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/ornith15-35a3/ORNITH-VLLM-XPU.md)
