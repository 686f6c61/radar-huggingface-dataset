# aclava/Qwen3.8-27B-Q4_K_M-GGUF

## Resumen

El modelo `aclava/Qwen3.8-27B-Q4_K_M-GGUF` es una conversión al formato GGUF del modelo original `Qwen/Qwen3.8-27B`, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo denso de 27.320 millones de parámetros con arquitectura transformer multimodal (visión y lenguaje), diseñado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. La conversión GGUF permite ejecutarlo de forma eficiente en hardware local mediante llama.cpp, con una cuantización Q4_K_M que reduce el tamaño a unos 16,8 GB.

El modelo base incorpora una ventana de contexto nativa de aproximadamente 256K tokens (según documentación de Unsloth y LM Studio) y capacidades de razonamiento configurable (modo "thinking"). Su licencia Apache-2.0 facilita su uso comercial y su despliegue en entornos de producción. Esta ficha se centra en la versión GGUF, que es la que se distribuye en este repositorio, y hace referencia a las especificaciones del modelo original cuando la información de la conversión no aporta datos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, multimodal (vision-language) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (según Unsloth y LM Studio; 262K según LM Studio) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3.8-27B es multilingüe, pero no se especifican los idiomas concretos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo .gguf); el modelo original usa safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.320 millones de parámetros con módulo de visión integrado, lo que le permite procesar tanto texto como imágenes. Según la documentación oficial, es un modelo "nativo multimodal" que destaca en tareas de codificación, agentes y automatización de oficina. No se han publicado detalles específicos sobre la composición del dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en la información disponible. La versión GGUF se generó mediante la herramienta GGUF-my-repo de ggml.ai, que convierte los pesos originales al formato de llama.cpp, permitiendo su uso con llama-cli y llama-server.

El modelo admite razonamiento configurable (modo "thinking") y una ventana de contexto de 256K tokens, lo que lo hace adecuado para tareas que requieren procesar documentos largos o mantener conversaciones extensas. La cuantización Q4_K_M reduce el tamaño del modelo de aproximadamente 54 GB (en FP16) a 16,8 GB, manteniendo un equilibrio entre calidad y requisitos de memoria.

## Capacidades

- Generación de texto y razonamiento complejo, incluido modo "thinking" configurable.
- Comprensión de imágenes (visión) y respuesta a preguntas visuales.
- Generación de código y soporte para tareas de programación (según el repositorio oficial, destaca en coding).
- Soporte para flujos de trabajo agénticos y automatización de oficina (procesamiento de documentos, correos, etc.).
- Capacidad de tool calling / function calling (implícita en su orientación a agentes, aunque no se detalla en la model card).
- Multilingüe (el modelo base lo es, aunque no se especifican idiomas concretos).

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y explicar código en múltiples lenguajes. Con la cuantización Q4_K_M y llama.cpp, se puede ejecutar en una estación de trabajo con GPU de 16-24 GB, ofreciendo una alternativa privada a servicios en la nube.
- Automatización de oficina: gracias a su capacidad de procesar imágenes y texto, puede extraer información de capturas de pantalla, PDFs escaneados o documentos, y generar resúmenes o informes.
- Agente conversacional de largo recorrido: con 256K tokens de contexto, puede mantener conversaciones multi-turno extensas sin perder el hilo, útil para atención al cliente o asistentes virtuales.
- Análisis de documentos técnicos: puede leer manuales, papers o especificaciones extensas y responder preguntas concretas sobre ellos, aprovechando la ventana de contexto amplia.
- Generación de contenido multimodal: dado que acepta imágenes como entrada, puede describir imágenes, crear alt-text o generar metadatos para catálogos visuales.
- Desarrollo de agentes autónomos: su orientación a agentic workflows permite integrarlo en pipelines que requieren planificación, uso de herramientas y ejecución de múltiples pasos, como automatización de pruebas o scraping inteligente.

## Benchmarks y rendimiento

Según el artículo de Yottalabs (2026), el modelo base Qwen3.8-27B alcanza una puntuación de 61,7 en SWE-bench Pro, un benchmark orientado a tareas de ingeniería de software. No se han publicado en la información disponible resultados de otros benchmarks estándar como MMLU, HumanEval o GSM8K para esta versión GGUF. La cuantización Q4_K_M puede introducir una ligera degradación en el rendimiento respecto al modelo en precisión completa, pero no se dispone de datos cuantitativos al respecto.

## Requisitos de hardware

- VRAM estimada: según Unsloth, el modelo puede ejecutarse en configuraciones de 17 GB de RAM/VRAM con la cuantización Q4_K_M. Esto permite su uso en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 4080 (16 GB, aunque con margen ajustado).
- GPU recomendadas: NVIDIA RTX 4090, RTX 4080, A100 (40 GB o 80 GB) para mayor comodidad y velocidad. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Despliegue: compatible con llama.cpp (llama-cli y llama-server), Ollama (si se convierte al formato adecuado), vLLM (si se usa el modelo en safetensors) y TGI (con conversión a TensorRT o similar). Para la versión GGUF, llama.cpp es la opción más directa.
- Latencia y throughput: no se dispone de datos medidos en la información proporcionada. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo para modelos de este tamaño, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente este modelo con otras alternativas de tamaño similar en la documentación proporcionada. Como referencia, se puede comparar con el propio modelo base Qwen3.8-27B (misma arquitectura, sin cuantizar) y con el modelo Qwen3.8-2.4T-A95B (MoE de 2,4 billones de parámetros, 95B activos), que es la versión de mayor tamaño de la misma familia. La comparativa se limita a parámetros y contexto, ya que no hay datos de benchmarks comparables.

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | 256K | Denso, multimodal | Apache-2.0 |
| aclava/Qwen3.8-27B-Q4_K_M-GGUF | 27,3 B | 256K | Denso, multimodal (GGUF) | Apache-2.0 |
| Qwen3.8-2.4T-A95B | 2,4 T (95B activos) | No disponible | MoE, multimodal | Apache-2.0 (según la familia Qwen) |

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado con datos de internet, puede reflejar sesgos presentes en esos datos. No se han publicado evaluaciones específicas de sesgo para este modelo.
- Riesgo de alucinación: como todo LLM, puede generar información plausible pero incorrecta, especialmente en tareas de razonamiento o hechos poco comunes. Se recomienda verificar salidas críticas.
- Limitaciones de contexto: aunque la ventana es de 256K tokens, el rendimiento puede degradarse en contextos muy largos; además, el uso de cuantización Q4_K_M puede afectar la precisión en tareas que requieren alta fidelidad numérica o lógica.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente y mantener los avisos de copyright.
- Idioma: aunque el modelo base es multilingüe, no se especifican los idiomas soportados en esta conversión; se recomienda probar en el idioma objetivo antes de desplegarlo en producción.
- Requisitos de hardware: aunque puede ejecutarse en 17 GB, el uso de contexto largo (256K) aumenta significativamente el consumo de memoria; en configuraciones con poca VRAM, puede ser necesario reducir la longitud de contexto o usar offloading.

## Enlaces

- Repositorio HuggingFace de la conversión GGUF: https://huggingface.co/aclava/Qwen3.8-27B-Q4_K_M-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Artículo de Yottalabs sobre Qwen3.8-27B (specs y hardware): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Página de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
