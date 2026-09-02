# mercor/Qwen3.5-397B-A17B-Mercor

## Resumen

El modelo `mercor/Qwen3.5-397B-A17B-Mercor` es un ajuste posterior (post-training) mediante aprendizaje por refuerzo (RL) del modelo base Qwen3.5-397B-A17B, desarrollado por Mercor. El objetivo es mejorar las capacidades del modelo como agente de trabajo de conocimiento (knowledge work agent), es decir, tareas complejas que requieren razonamiento multi-paso, uso de herramientas y planificación. Para ello, Mercor ha utilizado los datasets de su serie APEX-Agents y ha publicado el script de entrenamiento completo en su blog.

El modelo base subyacente, Qwen3.5-397B-A17B, es un modelo de visión-lenguaje de gran escala con arquitectura Mixture-of-Experts (MoE), con 397 mil millones de parámetros totales y 17 mil millones de parámetros activos. Soporta entrada multimodal (texto e imagen) y está diseñado para razonamiento, codificación y flujos de trabajo agénticos. La versión de Mercor mantiene estas capacidades y las refuerza específicamente para entornos de agentes, mediante RL con datos de expertos.

La relevancia de este modelo radica en que demuestra cómo un ajuste RL dirigido puede mejorar las capacidades agénticas de un modelo MoE de gran tamaño, y publica el proceso completo para que otros equipos puedan reproducirlo. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación, aunque el tamaño del repositorio (793,6 GB) implica requisitos de hardware considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, nativa visión-lenguaje |
| Parametros totales | 396.802.360.816 (396,8 B) |
| Parametros activos | 17 B (según el nombre del modelo base, no confirmado en la ficha de Mercor) |
| Longitud de contexto | no disponible (el modelo base soporta 256 K según documentación de Qwen, pero no se especifica en esta ficha) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | no disponibles (el modelo base soporta múltiples idiomas, pero no se detalla en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B es un transformer MoE con 397 B parámetros totales y 17 B activos, diseñado como modelo nativo de visión-lenguaje. Incorpora atención con ventana deslizante y atención completa, junto con mecanismos de razonamiento híbrido (modo pensamiento y modo no pensamiento). El ajuste de Mercor consiste en un post-training con aprendizaje por refuerzo (RL) sobre datasets de la serie APEX-Agents, que contienen trayectorias de agentes expertos resolviendo tareas de trabajo de conocimiento. El proceso RL se realizó con la infraestructura SkyRL, desarrollada por Mercor, y se publicó el script de entrenamiento completo. No se especifican detalles sobre el número de pasos de RL, el tamaño del dataset ni la metodología exacta de recompensa, pero el blog de Mercor indica que es la tercera entrega de una serie sobre post-training de modelos abiertos con datos de expertos.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo base ya es competente en tareas de razonamiento complejo, y el RL adicional busca mejorar la planificación y ejecución de tareas agénticas.
- Procesamiento de imágenes: al ser un modelo de visión-lenguaje, puede interpretar imágenes y responder preguntas sobre ellas, integrándolas en el razonamiento.
- Soporte de tool calling y function calling: el modelo base está diseñado para agentes que invocan herramientas; el ajuste RL refuerza esta capacidad.
- Capacidades agénticas: el post-training con APEX-Agents está orientado a entornos donde el modelo debe tomar decisiones secuenciales, usar APIs, navegar por documentos y ejecutar acciones.
- Razonamiento híbrido: el modelo base soporta modos de pensamiento explícito (chain-of-thought) y respuesta directa, que se mantienen en esta versión.
- Multilingüe: el modelo base soporta varios idiomas, aunque no se detalla la lista en la información proporcionada.

## Casos de uso

- Automatización de tareas de investigación y análisis: el modelo puede leer documentos, extraer información relevante, razonar sobre ella y generar informes estructurados, gracias a su capacidad de procesar texto e imágenes y su razonamiento multi-paso.
- Asistentes de soporte técnico avanzado: con tool calling, puede consultar bases de conocimiento, ejecutar diagnósticos y escalar problemas complejos, manteniendo contexto largo en conversaciones.
- Generación y revisión de código en entornos CI/CD: puede integrarse en pipelines que requieran análisis de código, generación de parches y ejecución de pruebas, aunque su tamaño exige infraestructura dedicada.
- Agentes de extracción de datos estructurados: dadas consultas en lenguaje natural, el modelo puede navegar por páginas web o documentos, extraer datos y devolverlos en formato JSON o similar.
- Análisis de documentos multimodales: combina texto e imágenes para tareas como revisión de contratos con anexos escaneados, informes con gráficos o capturas de pantalla de errores.
- Entrenamiento y evaluación de otros modelos: al ser un modelo de gran tamaño con licencia Apache-2.0, puede usarse como generador de datos sintéticos o como modelo profesor para destilar conocimiento en modelos más pequeños.
- Investigación en RL y agencia: el script de entrenamiento publicado permite reproducir el proceso y estudiar cómo el RL mejora las capacidades agénticas en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo `mercor/Qwen3.5-397B-A17B-Mercor` en la información disponible. El blog de Mercor menciona mejoras sobre el modelo base, pero no se proporcionan cifras concretas. Para el modelo base Qwen3.5-397B-A17B, los resultados oficiales de Qwen incluyen rendimiento destacado en razonamiento, codificación y benchmarks de agentes, pero estos datos no corresponden a la versión ajustada por Mercor y no deben atribuirse a ella.

## Requisitos de hardware

- VRAM estimada: el modelo en precisión fp32 ocupa aproximadamente 793,6 GB en disco. Para inferencia en fp16 o bf16, se necesitan al menos 800 GB de VRAM (varios GPUs). Con cuantización a 8 bits, se podría reducir a ~400 GB, y a 4 bits a ~200 GB, pero no se han publicado cuantizaciones oficiales para esta versión.
- GPUs recomendadas: se requieren nodos multi-GPU con GPUs de alta capacidad, como NVIDIA H100 (80 GB) o A100 (80 GB). Por ejemplo, 10 H100 para fp16 sin cuantización. No cabe en una GPU de consumo.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TensorRT-LLM o TGI, siempre que el hardware lo permita. También se puede usar con llama.cpp si se convierten los pesos a GGUF, pero no se ha publicado dicha conversión.
- Latencia y throughput: no se han publicado cifras para este modelo. Dado su tamaño, la latencia será alta (segundos por token en inferencia batch) y el throughput dependerá del número de GPUs y de la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (base) | 396,8 B | 17 B | 256 K (según Qwen) | Apache-2.0 | Hugging Face |
| mercor/Qwen3.5-397B-A17B-Mercor | 396,8 B | 17 B | no disponible | Apache-2.0 | Hugging Face |
| DeepSeek-V3 | 671 B | 37 B | 128 K | MIT | Hugging Face |
| Llama 3.1 405B | 405 B | 405 B (denso) | 128 K | Llama 3.1 Community License | Hugging Face |

La comparativa muestra que el modelo de Mercor se sitúa en la misma escala que otros gigantes, pero con la ventaja de ser MoE con solo 17 B activos, lo que reduce el coste de inferencia frente a modelos densos como Llama 3.1 405B. Frente a DeepSeek-V3, tiene menos parámetros activos pero un contexto potencialmente mayor. La diferencia clave es el ajuste específico para agentes que ha realizado Mercor, que no está presente en los otros modelos de la tabla.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos para este ajuste concreto. El modelo base puede presentar sesgos presentes en sus datos de entrenamiento, y el RL con datos de expertos podría amplificarlos o reducirlos, pero no hay datos al respecto.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos. El ajuste RL no elimina este riesgo.
- Limitaciones de idioma: aunque el modelo base es multilingüe, no se ha verificado el rendimiento del ajuste de Mercor en idiomas distintos del inglés. Es probable que los datasets APEX-Agents estén principalmente en inglés, lo que podría degradar el rendimiento en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los usuarios deben cumplir con las atribuciones requeridas y no utilizar marcas comerciales sin permiso. No hay restricciones adicionales conocidas.
- Requisitos de hardware: el tamaño del modelo hace inviable su despliegue en infraestructuras modestas. El coste de inferencia es alto incluso con cuantización.
- Falta de documentación sobre el proceso RL: no se especifican los hiperparámetros, la función de recompensa ni el número de pasos, lo que dificulta la reproducibilidad completa más allá del script publicado.
- Posible desalineación con casos de uso específicos: el ajuste está orientado a agentes de trabajo de conocimiento; en otras tareas generales puede no superar al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mercor/Qwen3.5-397B-A17B-Mercor
- Blog de Mercor sobre el entrenamiento RL: https://www.mercor.com/blog/training-frontier-knowledge-work-agents-a-397b-rl-training-guide-with-skyrl
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Blog oficial de Qwen sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página de NVIDIA NIM para Qwen3.5-397B-A17B: https://build.nvidia.com/qwen/qwen3.5-397b-a17b
- Guía de Qwen3.5-397B-A17B (tercero): https://www.qubrid.com/blog/qwen-3-5-397b-a17b-complete-guide-to-architecture-capabilities-and-real-world-applications
