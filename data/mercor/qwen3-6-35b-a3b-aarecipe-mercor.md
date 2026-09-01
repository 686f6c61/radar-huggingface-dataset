# mercor/Qwen3.6-35B-A3B-AARecipe-Mercor

## Resumen

El modelo `mercor/Qwen3.6-35B-A3B-AARecipe-Mercor` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base `Qwen/Qwen3.6-35B-A3B`, desarrollado por la empresa Mercor. El objetivo es especializar el modelo en tareas de agentes de conocimiento (knowledge work agents), utilizando el framework SkyRL y datasets de la familia APEX-Agents. Se trata de un modelo multimodal (imagen, vídeo y texto) con arquitectura MoE híbrida, que combina atención lineal Gated DeltaNet con atención Gated estándar, y que incorpora un codificador visual para comprensión de imágenes y vídeo.

Con 35 107 millones de parámetros totales y solo 3 000 millones activos por token, este modelo ofrece un equilibrio entre capacidad y eficiencia computacional. Su ventana de contexto de 262 144 tokens lo hace adecuado para tareas de razonamiento de largo alcance, generación de código agéntico y procesamiento de documentos extensos. El ajuste con RL busca mejorar la capacidad del modelo para planificar, usar herramientas y ejecutar flujos de trabajo multi-paso, manteniendo las capacidades multimodales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet (atención lineal) + Gated Attention, con 256 expertos totales (8 enrutados + 1 compartido) y codificador visual |
| Parametros totales | 35 107 181 936 (35,1 B) |
| Parametros activos | 3 000 millones (3 B) por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | BF16, FP8, NVFP4 (disponibles para el modelo base; no confirmado para este fine-tune) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen3.6-35B-A3B es open source, pero la licencia específica de este fine-tune no se ha publicado) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención Gated estándar. Esta combinación reduce el coste computacional en contextos largos manteniendo la calidad de atención. El modelo incluye 256 expertos en total, de los cuales 8 son enrutados por token y 1 es compartido, lo que permite activar solo 3 000 millones de parámetros por token. Además, incorpora un codificador visual que procesa imágenes y vídeo, lo que lo convierte en un modelo multimodal.

El fine-tune realizado por Mercor aplica aprendizaje por refuerzo (RL) sobre el modelo base utilizando el framework SkyRL y datasets de la familia APEX-Agents. Según la model card, se trata de un "RL post-trained" que busca mejorar las capacidades del modelo para tareas de agentes de conocimiento, como planificación, uso de herramientas y ejecución de flujos de trabajo complejos. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta de los datasets ni las técnicas de RL específicas (PPO, GRPO, etc.) en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas, lógica y análisis.
- Comprensión multimodal: procesa imágenes y vídeo además de texto, gracias al codificador visual integrado.
- Generación de código y soporte para agentic coding: puede escribir, depurar y refactorizar código en múltiples lenguajes.
- Razonamiento de largo alcance: con 262 144 tokens de contexto, puede manejar documentos extensos, conversaciones multi-turno y tareas que requieren memoria a largo plazo.
- Soporte para tool calling y function calling: el modelo base está optimizado para agentes que necesitan invocar herramientas externas.
- Capacidades multilingües: no se han especificado los idiomas soportados, pero el modelo base Qwen3.6 suele cubrir un amplio rango de idiomas.
- Modo agéntico: el ajuste con RL sobre datasets APEX-Agents busca mejorar la capacidad de planificación y ejecución de tareas multi-paso.

## Casos de uso

- Agentes de conocimiento para investigación: el modelo puede analizar grandes volúmenes de documentos, extraer información relevante y generar informes estructurados, gracias a su contexto de 262k tokens y su capacidad de razonamiento.
- Automatización de tareas administrativas: puede gestionar correos, redactar respuestas, resumir reuniones y organizar información, integrado en flujos de trabajo con tool calling.
- Asistente de programación agéntico: el modelo puede recibir una descripción de una tarea, planificar los pasos, escribir el código necesario, ejecutarlo y depurarlo, todo dentro de una misma sesión de contexto largo.
- Análisis de documentos legales o financieros: su capacidad multimodal permite procesar contratos escaneados, facturas o informes con gráficos, extrayendo datos clave y respondiendo preguntas específicas.
- Chatbot de atención al cliente con contexto amplio: puede mantener conversaciones largas con historial completo, resolviendo incidencias complejas sin perder el hilo.
- Generación de contenido multimedia: combina entrada de imagen o vídeo con instrucciones de texto para producir descripciones, subtítulos o guiones.
- Investigación académica: puede leer artículos científicos completos, comparar metodologías y sugerir experimentos, gracias a su capacidad de razonamiento y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base Qwen3.6-35B-A3B ha sido evaluado en tareas de agentic coding y razonamiento, pero no se dispone de cifras concretas en los resultados de búsqueda. Se recomienda consultar la documentación del modelo base o el blog de Mercor para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros totales y 3B activos, el modelo puede ejecutarse en GPUs consumer con cuantización. En BF16, la memoria necesaria ronda los 70 GB (pesos + overhead), por lo que se requiere una GPU profesional o múltiples GPUs. Con cuantización FP8 o NVFP4, la memoria se reduce a aproximadamente 35-40 GB, lo que permite ejecutarlo en una RTX 4090 (24 GB) con técnicas de offloading o en GPUs de 48 GB como la A6000.
- GPUs recomendadas: A100 80GB, H100 80GB, RTX 4090 (con cuantización y offloading), A6000 48GB, o configuraciones multi-GPU.
- Si cabe en consumer GPU: sí, con cuantización FP8 o NVFP4 y usando herramientas como llama.cpp o vLLM con offloading, aunque la velocidad será limitada. Para un uso fluido se recomienda al menos 48 GB de VRAM.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se publica en GGUF), y transformers con accelerate.
- Latencia y throughput: no disponible. Al ser un MoE con solo 3B activos, el throughput es significativamente mayor que un modelo denso de 35B, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262k | Sí | Open source |
| mercor/Qwen3.6-35B-A3B-AARecipe-Mercor | 35B | 3B | 262k | Sí | No disponible |
| Qwen3-30B-A3B (generación anterior) | 30B | 3B | 128k | No | Apache 2.0 |

El fine-tune de Mercor se diferencia del modelo base por su entrenamiento adicional con RL orientado a agentes de conocimiento. No se dispone de datos de rendimiento comparativo entre ambos. La comparación con Qwen3-30B-A3B es orientativa, ya que es un modelo MoE de tamaño similar pero sin capacidades multimodales y con menor contexto.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones específicas de este fine-tune. Al ser un modelo derivado de Qwen, puede heredar los sesgos del modelo base.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con Mercor antes de utilizarlo en producción.
- El modelo tiene pocas descargas (5) y no cuenta con validación comunitaria, por lo que su estabilidad y calidad no están contrastadas.
- Al ser un fine-tune reciente (agosto 2026), puede presentar problemas de sobreajuste a los datasets de entrenamiento (APEX-Agents) y rendir peor en tareas fuera de ese dominio.
- El contexto de 262k tokens es amplio, pero el rendimiento en longitudes extremas puede degradarse si no se utiliza la atención lineal correctamente.
- No se han publicado detalles sobre el proceso de RL (recompensas, seguridad, alineación), por lo que no se puede evaluar su robustez frente a instrucciones maliciosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mercor/Qwen3.6-35B-A3B-AARecipe-Mercor
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Mercor sobre el entrenamiento con SkyRL: https://www.mercor.com/blog/training-frontier-knowledge-work-agents-a-397b-open-recipe-with-skyrl
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Recetas vLLM para Qwen3.6-35B-A3B: https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B
- Referencia del modelo en LLM Reference: https://www.llmreference.com/model/qwen3.6-35b-a3b
