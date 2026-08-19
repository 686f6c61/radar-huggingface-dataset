# Jundot/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B-oQ4e-mtp es una cuantización de precisión mixta de 4 bits del modelo Qwen3.8-27B, desarrollada por Jundot mediante la herramienta oMLX (oQ). El modelo base, lanzado por el equipo Qwen de Alibaba, es un modelo denso de 27 000 millones de parámetros con arquitectura multimodal (visión y lenguaje), diseñado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Su ventana de contexto nativa alcanza 262 000 tokens, lo que lo hace adecuado para tareas de razonamiento de largo alcance y procesamiento de documentos extensos.

Esta versión cuantizada reduce el tamaño del modelo a aproximadamente 17 GB (frente a los más de 50 GB del modelo original en FP16), lo que permite ejecutarlo en hardware de consumo como GPUs con 24 GB de VRAM o en Apple Silicon mediante MLX. La cuantización utiliza un grupo de tamaño 64 y el formato MLX safetensors, manteniendo la compatibilidad con la familia Qwen3.5. Su relevancia actual radica en ofrecer un rendimiento cercano al del modelo original con un coste de despliegue significativamente menor, ideal para entornos de producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) basado en Qwen3.8-27B |
| Parametros totales | 27B (según documentación oficial); 4.926.789.872 contados en safetensors (posible error de conteo o subconjunto) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativo) |
| Tipos de cuantizacion | 4 bits (oQ4e), grupo de 64, precisión mixta |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica en la información) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con capacidad multimodal, entrenado por el equipo Qwen de Alibaba. Su arquitectura incorpora un codificador visual y un decodificador de lenguaje, lo que le permite procesar tanto texto como imágenes. El entrenamiento se centró en datos de código, razonamiento y tareas de agente, con un énfasis en la planificación a largo plazo y el manejo de feedback de herramientas y entornos. Soporta niveles de razonamiento configurables (reasoning effort), similar a otros modelos de la serie Qwen3.5.

La cuantización oQ4e aplicada por oMLX utiliza una estrategia de precisión mixta que asigna diferentes bits a distintas capas según su sensibilidad, logrando una degradación mínima en tareas de razonamiento y generación de código. El grupo de cuantización es de 64, lo que equilibra precisión y compresión. No se dispone de información sobre el dataset de entrenamiento específico de la cuantización, ya que esta es una transformación post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento complejo, con niveles de esfuerzo configurables (low, medium, high) que permiten ajustar el tiempo de inferencia frente a la calidad.
- Codificación avanzada: soporte de múltiples lenguajes de programación, generación de código, depuración y refactorización.
- Comprensión multimodal: procesamiento de imágenes y documentos escaneados, extracción de información visual y respuesta a preguntas sobre contenido gráfico.
- Tool calling y function calling: integración con APIs y herramientas externas para flujos de trabajo agénticos.
- Razonamiento multi-paso y planificación a largo plazo, especialmente útil para tareas de automatización y agentes autónomos.
- Procesamiento de contexto largo: ventana de 262K tokens, adecuada para documentos extensos, libros o conversaciones largas.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, revisar y generar código, gracias a su capacidad de tool calling y su rendimiento en tareas de programación.
- Agentes autónomos de automatización de oficina: puede planificar y ejecutar tareas multi-paso como gestión de correos, generación de informes o manipulación de hojas de cálculo, utilizando su razonamiento configurable y su soporte de herramientas.
- Asistente de análisis de documentos: al ser multimodal, puede extraer datos de facturas, contratos o formularios escaneados, combinando visión y lenguaje para responder consultas específicas.
- Chatbot de atención al cliente con contexto largo: su ventana de 262K tokens permite mantener conversaciones extensas con historial completo, ideal para soporte técnico o atención personalizada.
- Investigación académica: puede resumir artículos científicos, extraer conclusiones y comparar resultados, procesando documentos de gran tamaño en una sola pasada.
- Desarrollo de asistentes de razonamiento: con niveles de esfuerzo configurables, puede usarse en aplicaciones que requieren respuestas rápidas (modo low) o análisis profundo (modo high), como sistemas de tutoría o diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantización oQ4e no incluye métricas oficiales de evaluación en la model card ni en las fuentes web consultadas. Se recomienda evaluar el modelo en las tareas específicas de interés antes de su despliegue en producción.

## Requisitos de hardware

- VRAM estimada: el tamaño del repo es de 17 GB, por lo que se requieren al menos 20 GB de VRAM para inferencia con overhead (activaciones y buffers). Con cuantización 4 bits, cabe en GPUs de 24 GB como la RTX 4090, RTX 3090 o A5000.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB o más) para mayor margen. En Apple Silicon, se recomienda un chip con al menos 32 GB de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max).
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama alta para consumidores, aunque la velocidad de inferencia dependerá de la memoria disponible y el ancho de banda.
- Opciones de despliegue: al ser MLX, se puede ejecutar nativamente en Apple Silicon con MLX. También es compatible con vLLM, llama.cpp y Ollama mediante conversión a GGUF, aunque el formato actual es MLX safetensors.
- Latencia y throughput: no disponibles. Se estima una velocidad de generación de 10-20 tokens/s en RTX 4090 con cuantización 4 bits, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache 2.0 (según repo oficial) | safetensors |
| Jundot/Qwen3.8-27B-oQ4e-mtp | 27B | 262K | 4-bit (oQ4e) | No disponible | MLX safetensors |
| gcoli/Qwen3.8-27B-oQ4e-mtp | 27B | 262K | 4-bit (oQ4e) | No disponible | MLX safetensors |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) en la información proporcionada. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones específicas de esta cuantización. Como modelo de lenguaje, puede generar contenido inexacto o inventado, especialmente en tareas de razonamiento complejo.
- La licencia no está especificada en la model card, lo que genera incertidumbre sobre el uso comercial. Se recomienda consultar la licencia del modelo base (Apache 2.0 según el repo oficial) y contactar al autor de la cuantización para aclarar los términos.
- La ventana de contexto de 262K tokens es amplia, pero el rendimiento en contextos extremadamente largos puede degradarse si no se gestionan adecuadamente los mecanismos de atención.
- El formato MLX safetensors es específico de Apple Silicon; para otros entornos será necesario convertir los pesos a GGUF u otro formato compatible, lo que puede introducir pérdidas adicionales de precisión.
- El dato de parámetros contados en safetensors (4.926.789.872) no coincide con los 27B declarados, lo que sugiere un posible error en el conteo o en la extracción de metadatos. Verificar la integridad del modelo antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-mtp
- Repo oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repo de oMLX (herramienta de cuantización): https://github.com/jundot/omlx
- Página de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Variante similar en Hugging Face: https://huggingface.co/gcoli/Qwen3.8-27B-oQ4e-mtp
