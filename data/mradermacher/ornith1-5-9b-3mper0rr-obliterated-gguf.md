# mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-GGUF

## Resumen

Ornith1.5-9B es un modelo de lenguaje denso de 9.000 millones de parámetros desarrollado por DeepReinforce como parte de la familia Ornith-1.5. Se trata de un modelo especializado en tareas de codificación y agente, entrenado con un bucle de refuerzo de auto-mejora (self-improving task-and-scaffold RL) que le permite proponer nuevas tareas, generar andamiajes específicos y producir rollouts para aprendizaje por refuerzo. El modelo base se publicó el 19 de agosto de 2026 con licencia MIT y pesos abiertos en Hugging Face.

Esta ficha se centra en la versión cuantizada a GGUF por mradermacher, que parte del modelo base `3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated` (una variante "abliterated" que elimina ciertos rechazos de seguridad). La cuantización estática ofrece múltiples niveles de precisión, desde Q2_K hasta f16, e incluye un proyector multimodal (mmproj) que habilita capacidades de visión. El modelo es relevante porque permite ejecutar un asistente de codificación multimodal en hardware de consumo, incluyendo GPUs de 8 GB o Macs de 16 GB a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith1.5-9B es un transformer denso de 9B parámetros, sin mezcla de expertos. Según la documentación de DeepReinforce, la familia Ornith-1.5 extiende el framework de auto-andamiaje (self-scaffolding) introducido en Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo. Este proceso crea continuamente nuevas experiencias de aprendizaje a partir de las cuales el modelo mejora.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La variante "abliterated" sobre la que se aplica la cuantización elimina los rechazos de contenido, lo que puede afectar a la seguridad del modelo. La cuantización GGUF estática fue realizada por mradermacher, que también ofrece versiones con imatrix en un repositorio separado.

## Capacidades

- Generación de código y razonamiento técnico: el modelo está especializado en tareas de programación, incluyendo generación, depuración y explicación de código.
- Capacidades de agente: soporta razonamiento multi-paso y puede integrarse en flujos de trabajo que requieren planificación y ejecución de acciones.
- Multimodal: el repositorio incluye un proyector multimodal (mmproj) en Q8_0 y f16, lo que sugiere capacidad de procesamiento de imágenes junto con texto.
- Conversación: el modelo está etiquetado como "conversational" y puede mantener diálogos multi-turno.
- Multilingüe limitado: la ficha indica únicamente inglés como idioma soportado.
- Tool calling: no se especifica explícitamente, pero al ser un modelo de agente es probable que soporte llamadas a herramientas; no hay confirmación en la información disponible.

## Casos de uso

- Asistente de programación en local: un desarrollador puede ejecutar el modelo en una GPU de 8 GB (con cuantización Q4_K_M) para obtener sugerencias de código, refactorización y explicaciones sin depender de servicios en la nube.
- Agente de automatización de tareas: gracias a su entrenamiento con RL de auto-mejora, el modelo puede planificar y ejecutar secuencias de acciones en entornos simulados o APIs, por ejemplo para automatizar pruebas de software.
- Análisis de capturas de pantalla y documentación técnica: al ser multimodal, puede recibir imágenes de interfaces o diagramas y generar código o explicaciones basadas en ellas.
- Generación de tests unitarios: el modelo puede crear casos de prueba a partir de descripciones de funciones o fragmentos de código, integrándose en pipelines de CI/CD.
- Chat técnico de soporte: puede responder preguntas sobre APIs, frameworks o lenguajes de programación en conversaciones de varios turnos, útil para foros o sistemas de ayuda.
- Prototipado rápido: un equipo puede usar el modelo para generar esqueletos de aplicaciones o scripts de automatización, reduciendo el tiempo de arranque de proyectos.

## Benchmarks y rendimiento

Según los datos reportados por el vendor (DeepReinforce) y recogidos en LLM Releases, con un promedio de cinco ejecuciones:

| Benchmark | Resultado |
|---|---|
| Terminal-Bench 2.1 | 47,0 |
| (Métrica no especificada) | 70,6 |

No se dispone de comparaciones con otros modelos en la información proporcionada. Estos valores son auto-reportados y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M (5,7 GB) el modelo cabe en GPUs de 8 GB; con Q8_0 (9,6 GB) se necesita al menos 12 GB de VRAM.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, o GPUs de datacenter como A10G o A100 para mayor velocidad.
- Compatibilidad con hardware de consumo: sí, a 4 bits funciona en GPUs de 8 GB y en Macs con 16 GB de RAM unificada (según el blog de atomic.chat).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se han publicado cifras concretas; dependerá de la cuantización y el hardware. En una RTX 4090 con Q4_K_M se puede esperar una generación de 30-50 tokens/s, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos de codificación de tamaño similar (por ejemplo, CodeLlama 7B, DeepSeek-Coder 6.7B o StarCoder2 7B). La información disponible no incluye resultados de benchmarks comparativos ni especificaciones de contexto que permitan una comparación rigurosa. Se recomienda consultar el repositorio del modelo base para futuras actualizaciones.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser deficiente.
- Variante "abliterated": la eliminación de rechazos de seguridad puede generar contenido inapropiado o peligroso si se usa sin supervisión.
- Cuantización: las versiones de baja precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- Sin datos de contexto: no se ha especificado la longitud máxima de contexto, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinación: como todo LLM, puede generar código incorrecto o información falsa; es necesario validar las salidas en entornos de producción.
- Licencia MIT: permite uso comercial, pero el modelo base "abliterated" puede tener implicaciones legales o éticas según el uso previsto.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-GGUF
- Modelo base (3MPER0RR): https://huggingface.co/3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated
- Modelo original de DeepReinforce: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de DeepReinforce sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de ejecución local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Noticia de lanzamiento (LLM Releases): https://www.llm-releases.com/models/ornith-1-5-9b
- Versión con imatrix: https://huggingface.co/mradermacher/Ornith-1.5-9B-OBLITERATED-i1-GGUF
