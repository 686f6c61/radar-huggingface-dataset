# Algohash-inc/DeepHash-V5

## Resumen

DeepHash-V5 es un modelo multimodal de tipo image-text-to-text desarrollado por Algohash-inc, distribuido bajo licencia Apache 2.0 y publicado en Hugging Face con acceso restringido (gated). Con 14.404.786.224 parámetros totales (aproximadamente 14,4 mil millones) según los pesos en safetensors, se posiciona en la franja de modelos de tamaño medio que pueden desplegarse en infraestructura de una o pocas GPU. La model card lo etiqueta como MoE (mixture of experts) y lo orienta a casos de uso de agentes y tool calling, aunque no se especifican en la información disponible el número de parámetros activos ni la arquitectura exacta del enrutado.

El modelo se sirve mediante vLLM y se distribuye con cuantización de 8 bits generada con ModelOpt (NVIDIA), además de etiquetas que apuntan a NVFP4, lo que sugiere soporte para formatos de cuantización de baja precisión orientados a aceleradores modernos. El repositorio ocupa 19,2 GB. Soporta los idiomas chino e inglés según los metadatos, y declara capacidades conversacionales y de invocación de herramientas, lo que lo sitúa en la categoría de modelos preparados para flujos agénticos.

La relevancia actual del modelo radica en su combinación de tamaño contenido, licencia permisiva, soporte multimodal y orientación a tool calling, un perfil habitual en despliegues de agentes que necesitan razonamiento multi-paso con entrada de imágenes. No obstante, la información pública disponible es escasa: no hay resultados de benchmarks, no se detalla la composición del dataset de entrenamiento y el acceso requiere aceptar condiciones, lo que limita la evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); detalles del enrutado no disponibles |
| Parámetros totales | 14.404.786.224 (~14,4 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (ModelOpt); etiqueta NVFP4; pesos safetensors |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,2 GB) |

## Arquitectura y entrenamiento

DeepHash-V5 se presenta como un modelo de mezcla de expertos (MoE) con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text). Los metadatos no detallan el número de expertos, el mecanismo de enrutado, la dimensión oculta ni la longitud de contexto, por lo que no es posible describir la topología interna con precisión. La presencia de etiquetas como `modelopt`, `8-bit` y `nvfp4` indica que el checkpoint publicado incorpora cuantización realizada con herramientas de NVIDIA, orientada a reducir la huella de memoria y aprovechar formatos de baja precisión en GPU compatibles.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, la proporción de datos multimodales ni las etapas de alineación (RLHF, DPO u otras). Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o mecanismos de atención lineal. La model card referencia varios identificadores arXiv (2510.06303, 2509.24389, 2508.15487, 2502.09992, 2505.19223), pero en la información proporcionada no se incluye su contenido ni se confirma qué técnicas describen; cualquier afirmación sobre metodología de entrenamiento sería especulativa y no se incluye aquí.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Procesamiento de entrada multimodal imagen-texto (pipeline image-text-to-text).
- Soporte de tool calling / function calling, según las etiquetas del modelo.
- Orientación a flujos agénticos y razonamiento multi-paso (etiqueta `agent`).
- Arquitectura MoE con cuantización de 8 bits para inferencia eficiente.
- Compatibilidad declarada con vLLM como motor de servicio.
- No se documentan capacidades de audio, vídeo ni modos de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Agentes con invocación de herramientas: el modelo declara soporte de tool calling, por lo que puede integrarse en bucles de agente que consultan APIs, bases de datos o servicios externos y encadenan varias llamadas para resolver una tarea.
- Automatización de soporte técnico con capturas de pantalla: al aceptar entrada de imagen y texto, puede interpretar capturas de errores o interfaces junto con la consulta del usuario y generar respuestas contextualizadas en inglés o chino.
- Extracción de datos de documentos escaneados: en pipelines de digitalización, el modelo puede recibir una imagen de factura, formulario o recibo y devolver campos estructurados mediante function calling hacia un sistema de gestión.
- Asistentes de desarrollo integrados en IDE: con tool calling puede consultar documentación, ejecutar búsquedas en el repositorio o invocar linters a través de funciones expuestas por el entorno de desarrollo.
- Moderación y clasificación de contenido multimodal: análisis de publicaciones con imagen y texto para etiquetar categorías o detectar contenido no permitido, aprovechando la ventana de entrada combinada.
- Despliegue en infraestructura propia con vLLM: al publicarse con pesos safetensors cuantizados a 8 bits y compatibilidad con vLLM, encaja en servicios internos que requieren control de datos y latencia predecible sin depender de APIs de terceros.
- Enrutado y triaje en atención al cliente: clasificación de tickets con adjuntos de imagen y derivación al equipo adecuado mediante llamadas a funciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14,4 B parámetros en 8 bits, los pesos ocupan aproximadamente 14,4 GB; en fp16 serían unos 28,8 GB. La VRAM total necesaria depende de la longitud de contexto y del tamaño de la caché KV, no disponible.
- GPU recomendadas: para la versión de 8 bits, una GPU con 24 GB o más (RTX 4090, L40S, A6000) permite cargar los pesos con margen para contexto moderado; para contextos largos o mayor paralelismo, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más para la variante de 8 bits; en 16 GB no cabría la versión de 8 bits sin cuantización adicional.
- Opciones de despliegue: vLLM es el motor declarado por el modelo; no se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Tool calling | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepHash-V5 | ~14,4 B (MoE) | no disponible | Apache 2.0 | Sí (imagen-texto) | Sí | Gated en Hugging Face |
| Alternativas de ~14 B densas | ~14 B | variable | variable | no disponible | variable | no disponible |
| Alternativas MoE de tamaño medio | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Idiomas limitados: solo chino e inglés declarados; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineación no puede estimarse su magnitud.
- Sesgos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Contexto desconocido: la ausencia de longitud de contexto documentada impide planificar despliegues con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated y las licencias de las herramientas de cuantización (ModelOpt) empleadas.
- Cuantización de 8 bits: puede degradar ligeramente la calidad frente a los pesos originales en precisión completa; no se publican comparativas.
- MoE sin parámetros activos documentados: no es posible estimar el coste computacional real por token.

## Enlaces

- Hugging Face: https://huggingface.co/Algohash-inc/DeepHash-V5
- Paper arXiv 2510.06303: https://arxiv.org/abs/2510.06303
- Paper arXiv 2509.24389: https://arxiv.org/abs/2509.24389
- Paper arXiv 2508.15487: https://arxiv.org/abs/2508.15487
- Paper arXiv 2502.09992: https://arxiv.org/abs/2502.09992
- Paper arXiv 2505.19223: https://arxiv.org/abs/2505.19223
