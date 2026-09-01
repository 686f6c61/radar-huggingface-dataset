# mercor/Qwen3.5-397B-A17B-AARecipe-Mercor

## Resumen

El modelo `mercor/Qwen3.5-397B-A17B-AARecipe-Mercor` es un post-entrenamiento por refuerzo (RL) del modelo base Qwen3.5-397B-A17B, desarrollado por Mercor. Se trata de un modelo multimodal (imagen-texto) con arquitectura híbrida de mezcla de expertos (MoE) y atención lineal, diseñado para tareas de agente de conocimiento, chat, recuperación aumentada (RAG) y razonamiento visual. El post-entrenamiento se realizó con el framework SkyRL sobre datasets APEX-Agents, y el resultado se publica como una receta abierta para entrenar agentes de trabajo de conocimiento de frontera.

Con aproximadamente 397 mil millones de parámetros totales (396.802.360.816) y una arquitectura MoE que activa 17 mil millones por token (según la nomenclatura del modelo base), este modelo se posiciona en la gama alta de los modelos abiertos. Su tamaño de repositorio de 793,6 GB en formato safetensors implica requisitos de hardware considerables, pero su diseño híbrido con atención lineal busca mejorar la eficiencia de inferencia frente a arquitecturas transformer densas. La relevancia actual radica en que demuestra un pipeline completo de RL post-entrenamiento para modelos de gran escala, con potencial para aplicaciones empresariales de automatización de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal y fusión temprana visión-lenguaje |
| Parametros totales | 396.802.360.816 (aprox. 397B) |
| Parametros activos | 17B (según nomenclatura del modelo base, no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B emplea una arquitectura híbrida que combina atención lineal con un mecanismo de mezcla de expertos (MoE) dispersa. Esta combinación busca reducir el coste computacional de la atención sobre secuencias largas y activar solo una fracción de los parámetros por token (17B de 397B), mejorando el rendimiento de inferencia. Además, integra fusión temprana de visión y lenguaje, lo que permite procesar entradas multimodales (imagen y texto) de forma conjunta desde las primeras capas.

El post-entrenamiento realizado por Mercor aplica aprendizaje por refuerzo (RL) con el framework SkyRL sobre datasets APEX-Agents, un conjunto de datos diseñado para tareas de agente de conocimiento. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas adicionales como DPO o RLHF. La receta completa se documenta en el blog de Mercor, orientada a reproducir el entrenamiento de agentes de trabajo de conocimiento de frontera.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo lógica y matemáticas, gracias a la escala de 397B parámetros.
- Comprensión de imágenes y diálogo multimodal (image-text-to-text), con capacidad para responder preguntas sobre contenido visual.
- Soporte de recuperación aumentada (RAG), integrando conocimiento externo en las respuestas.
- Capacidades agénticas: planificación multi-paso, uso de herramientas y ejecución de tareas de conocimiento, potenciadas por el RL post-entrenamiento.
- Soporte de conversación multi-turno y chat, con manejo de contexto largo (longitud exacta no disponible).
- Multilingüismo probable (heredado del modelo base Qwen), aunque los idiomas concretos no se especifican en la ficha.

## Casos de uso

- Agentes de investigación automatizada: el modelo puede buscar, resumir y sintetizar información de múltiples fuentes, gracias a su capacidad de RAG y razonamiento multi-paso, ideal para entornos de consultoría o análisis de mercado.
- Asistencia en atención al cliente de alto nivel: con su capacidad de diálogo multimodal y contexto largo, puede gestionar consultas complejas que incluyan capturas de pantalla o documentos, reduciendo la escalada a humanos.
- Generación y revisión de código en entornos empresariales: su razonamiento lógico y soporte de tool calling permiten integrarlo en pipelines de CI/CD para revisión de código, generación de tests y documentación automática.
- Análisis de documentos técnicos y legales: al combinar visión y texto, puede extraer información de contratos escaneados, informes financieros o patentes, y responder preguntas específicas sobre ellos.
- Automatización de tareas de back-office: como agente de conocimiento, puede ejecutar flujos de trabajo que requieren consultar bases de datos, generar informes y enviar comunicaciones, reduciendo la carga manual.
- Prototipado de asistentes virtuales multimodales: su capacidad de procesar imagen y texto lo hace adecuado para aplicaciones de realidad aumentada, asistencia en soporte técnico remoto o educación interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.5-397B-A17B ha sido evaluado por Qwen en tareas de lenguaje, visión y agentes, pero los datos concretos no se incluyen en la ficha de Mercor. Se recomienda consultar la documentación oficial de Qwen para obtener métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 397B parámetros en precisión FP16, se necesitan aproximadamente 794 GB de VRAM solo para los pesos. Con cuantización a 8 bits, se reduce a ~400 GB; a 4 bits, ~200 GB. Estas cifras son estimaciones orientativas, ya que no se han publicado requisitos oficiales.
- GPU recomendadas: para ejecución en FP16 se requieren clústeres de GPUs como 8× H100 (80 GB) o 8× A100 (80 GB). Con cuantización 4-bit, podría caber en 4× RTX 4090 (24 GB) o 2× A100 80GB, aunque con limitaciones de velocidad.
- En consumer GPU: no es viable en una sola GPU de consumo; se necesitan múltiples GPUs o servicios en la nube.
- Opciones de despliegue: compatible con transformers, vLLM, TGI y llama.cpp (si se generan pesos GGUF). También está disponible en NVIDIA NIM y Alibaba Cloud Model Studio.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia alta en generación, mitigada parcialmente por la atención lineal y la activación dispersa (17B activos).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (base) | 397B | 17B | no disponible | no disponible | Hugging Face, NVIDIA NIM |
| mercor/Qwen3.5-397B-A17B-AARecipe-Mercor | 397B | 17B | no disponible | no disponible | Hugging Face |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | Hugging Face |
| Qwen3-235B-A22B | 235B | 22B | 128K | Apache 2.0 | Hugging Face |

La comparativa se basa en características estructurales, ya que no hay datos de rendimiento disponibles para el modelo de Mercor. DeepSeek-V3 y Qwen3-235B-A22B son alternativas MoE de gran escala con licencias más permisivas y contextos más largos documentados.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial. Se debe contactar con Mercor antes de desplegarlo en producción.
- Tamaño y requisitos de hardware: con 793,6 GB de pesos, la inferencia requiere infraestructura de alto coste, inaccesible para la mayoría de equipos.
- Riesgo de alucinación: como todo modelo de lenguaje grande, puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo.
- Sesgos potenciales: al estar entrenado sobre datasets de agentes (APEX-Agents), puede heredar sesgos presentes en esos datos, aunque no se han documentado.
- Longitud de contexto no especificada: se desconoce el límite de tokens de entrada, lo que dificulta planificar su uso en tareas con documentos largos.
- Idiomas no documentados: aunque el modelo base Qwen soporta múltiples idiomas, no se confirma qué idiomas mantiene el post-entrenamiento.
- Sin benchmarks publicados: no hay métricas objetivas que permitan evaluar su rendimiento frente a alternativas, lo que añade incertidumbre para su adopción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mercor/Qwen3.5-397B-A17B-AARecipe-Mercor
- Modelo base Qwen3.5-397B-A17B: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Blog de Mercor sobre la receta con SkyRL: https://www.mercor.com/blog/training-frontier-knowledge-work-agents-a-397b-open-recipe-with-skyrl
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/qwen/qwen3.5-397b-a17b
- Documentación de Alibaba Cloud Model Studio: https://www.alibabacloud.com/help/en/model-studio/qwen3-5-397b-a17b
