# Panga-Azazia/LFM2.5-350M-MTL

## Resumen

LFM2.5-350M-MTL es un modelo de lenguaje de 382 millones de parámetros desarrollado por Panga-Azazia, que parte del modelo base LFM2.5-350M-TTS de Liquid AI y ha sido ajustado mediante fine-tuning supervisado (SFT) para tareas multi-tarea (MTL, Multi-Task Learning). El modelo base, LFM2.5-350M, es una versión mejorada del modelo compacto de Liquid AI, con pre-entrenamiento ampliado de 10T a 28T tokens y refuerzo a gran escala, construido sobre la arquitectura LFM2 que ofrece inferencia excepcionalmente rápida y puede ejecutarse desde GPUs en la nube hasta CPUs económicas.

Este fine-tune específico se ha entrenado con la librería TRL y Unsloth, y está orientado a conversación y generación de texto. Su relevancia radica en ofrecer un modelo compacto con capacidades de tool use, extracción de datos y salidas estructuradas, pensado para flujos de trabajo agénticos ligeros y procesamiento de datos a gran escala, aunque no está diseñado para tareas complejas de matemáticas, código o escritura creativa. El acceso al modelo está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2, basada en transformadores con atención lineal) |
| Parametros totales | 382.682.880 (382M) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M emplea la arquitectura LFM2 de Liquid AI, que se basa en transformadores con mecanismos de atención lineal (linear attention) en lugar de la atención softmax tradicional. Esto permite una inferencia más rápida y un menor coste computacional, especialmente en secuencias largas, manteniendo un rendimiento competitivo en tareas de razonamiento y extracción de información. El pre-entrenamiento del modelo base se realizó con 28T tokens (frente a los 10T de la versión anterior) e incluyó un pipeline de aprendizaje por refuerzo a gran escala.

El modelo MTL es un fine-tune supervisado (SFT) del modelo base LFM2.5-350M-TTS, realizado con las librerías TRL y Unsloth. El dataset de fine-tuning no está especificado en la información disponible, pero el tag "conversational" sugiere que se ha optimizado para diálogo y tareas conversacionales. No se menciona el uso de RLHF o DPO en este fine-tune concreto.

## Capacidades

- Generación de texto conversacional: el modelo está ajustado para mantener diálogos multi-turno, aunque no se especifican métricas concretas de calidad.
- Tool use y function calling: el modelo base LFM2.5-350M está diseñado para tool use y extracción de datos estructurados, capacidades que probablemente se mantienen en el fine-tune.
- Extracción de datos y salidas estructuradas: adecuado para tareas de procesamiento de información que requieren formatos JSON o similares.
- Inferencia rápida en CPU y GPU: gracias a la arquitectura LFM2, el modelo puede ejecutarse en hardware modesto, incluyendo CPUs.
- Multilingüismo: no disponible (no se especifican idiomas soportados).
- No está optimizado para matemáticas avanzadas, generación de código complejo ni escritura creativa, según la documentación del modelo base.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con un contexto razonable, aunque la longitud de contexto no está especificada. Su capacidad de tool use permite integrarlo con sistemas de ticketing o bases de conocimiento.
- Extracción de datos de documentos: dado su enfoque en salidas estructuradas, es útil para convertir texto libre en JSON o tablas, por ejemplo, en facturas, formularios o correos electrónicos.
- Clasificación y etiquetado de texto: puede asignar categorías o etiquetas a textos cortos, como comentarios de usuarios o tickets de soporte, con baja latencia.
- Agentes ligeros en edge devices: su tamaño compacto y la inferencia rápida permiten desplegarlo en dispositivos con recursos limitados, como Raspberry Pi o portátiles sin GPU.
- Preprocesamiento de datos para pipelines de IA: puede normalizar o estructurar texto antes de pasarlo a modelos más grandes, reduciendo costes de inferencia.
- Asistentes de productividad: integrado en herramientas de correo o gestión de tareas, puede resumir conversaciones o extraer acciones pendientes, aunque no está pensado para tareas creativas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo Panga-Azazia/LFM2.5-350M-MTL en la información disponible. El modelo base LFM2.5-350M de Liquid AI ha sido evaluado en tareas de tool use, extracción de datos y salidas estructuradas, pero no se proporcionan cifras concretas en los resultados de búsqueda. Se recomienda consultar el blog oficial de Liquid AI para obtener métricas detalladas del modelo base.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 382M parámetros, en FP32 ocuparía aproximadamente 1,5 GB de memoria. Con cuantización a 8 bits (si estuviera disponible) se reduciría a ~0,4 GB, y a 4 bits a ~0,2 GB. Sin embargo, no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo en FP32. En CPUs, es viable en procesadores modernos con 8 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no se dispone de datos medidos para este fine-tune. El modelo base promete inferencia rápida, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Panga-Azazia/LFM2.5-350M-MTL | 382M | no disponible | no disponible | Gated en HuggingFace |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible | Abierto en HuggingFace |
| Qwen2.5-0.5B | 494M | 32K | Apache 2.0 | Abierto |
| SmolLM2-360M | 360M | 2K | Apache 2.0 | Abierto |

El modelo MTL es un fine-tune del LFM2.5-350M, por lo que hereda la arquitectura LFM2. Comparado con Qwen2.5-0.5B o SmolLM2-360M, ofrece una arquitectura de atención lineal que puede ser más eficiente en inferencia, pero carece de información pública sobre contexto y licencia, lo que limita su adopción en producción.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos para este modelo, pero al ser un fine-tune de un modelo base entrenado con datos web, puede heredar sesgos presentes en el corpus de pre-entrenamiento.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de extracción de datos si el texto de entrada es ambiguo.
- Limitaciones de contexto: la longitud de contexto no está especificada; se recomienda probar con secuencias cortas para evitar degradación.
- Restricciones de licencia: la licencia no está disponible, y el acceso es restringido (gated). Esto impide su uso comercial sin una revisión legal previa.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base de Liquid AI está principalmente entrenado en inglés, por lo que el rendimiento en otros idiomas puede ser limitado.
- No apto para tareas de razonamiento matemático avanzado, generación de código complejo o escritura creativa, según la documentación del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Panga-Azazia/LFM2.5-350M-MTL
- Modelo base LFM2.5-350M-TTS: https://huggingface.co/Panga-Azazia/LFM2.5-350M-TTS
- Modelo base LFM2.5-350M de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Visualización de arquitectura del modelo base: https://hfviewer.com/Panga-Azazia/LFM2.5-350M-TTS
