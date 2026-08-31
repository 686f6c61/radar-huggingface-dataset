# nkkbr2/Kimi-K3-decensored-experimental-r4

## Resumen

Kimi K3 es un modelo de lenguaje de gran escala desarrollado por Moonshot AI, con 2,8 billones de parámetros totales y 104 mil millones de parámetros activos bajo una arquitectura de mezcla de expertos (MoE). Se presenta como el primer modelo abierto de la clase de 3 billones de parámetros, diseñado para tareas de agente de largo alcance, codificación extensa, razonamiento y trabajo de conocimiento. Su arquitectura combina Kimi Delta Attention (KDA), un mecanismo de atención lineal híbrida, con Attention Residuals (AttnRes), y ofrece capacidades multimodales nativas (texto, imagen y vídeo) junto con una ventana de contexto de 1 millón de tokens.

La variante aquí descrita, `nkkbr2/Kimi-K3-decensored-experimental-r4`, es una modificación comunitaria (autor nkkbr2) que elimina la censura y los mecanismos de alineación de seguridad del modelo original. Se trata de una versión experimental (r4) que conserva las mismas especificaciones técnicas del Kimi K3 base, pero con un comportamiento menos restringido. Esta versión resulta relevante para investigadores que necesitan explorar los límites del modelo sin filtros de seguridad, aunque con los riesgos asociados a su uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,78 billones) |
| Parametros activos | 104 mil millones (16 de 896 expertos activos por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (indicado en tags), otros formatos no disponibles |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifican en la información) |
| Licencia | Kimi K3 License (licencia propietaria de Moonshot AI, categoría "other") |
| Formato de pesos | safetensors (tamaño del repositorio: 1561 GB) |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 93 capas, de las cuales 69 utilizan Kimi Delta Attention (KDA) y 24 utilizan Gated Multi-Latent Attention (Gated MLA). La dimensión de atención oculta es de 7168, con 96 cabezas de atención. El modelo integra un marco "Stable LatentMoE" que activa 16 de los 896 expertos por token, logrando una mejora de eficiencia de escalado de aproximadamente 2,5 veces respecto a su predecesor Kimi K2. La dimensión del espacio latente MoE es de 3584 y la dimensión oculta por experto es de 3072.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO en la documentación proporcionada. La variante "decensored" no especifica el método de modificación empleado (fine-tuning, eliminación de capas de rechazo, etc.), por lo que se desconoce si se ha realizado un entrenamiento adicional o una modificación de pesos.

## Capacidades

- Generación de texto y razonamiento complejo de largo alcance, con capacidad para mantener sesiones de trabajo extensas con supervisión humana mínima.
- Codificación avanzada: navegación en repositorios masivos, orquestación de herramientas de terminal, optimización de kernels GPU, desarrollo de compiladores y diseño de chips.
- Multimodalidad nativa: comprensión de texto, imágenes y vídeo dentro del mismo modelo, sin módulos separados.
- Soporte de agentes y razonamiento multi-paso: puede ejecutar tareas de agente con uso de herramientas (tool calling) y planificación secuencial.
- Trabajo de conocimiento de extremo a extremo: generación de informes de investigación con visualizaciones interactivas, widgets, paneles y edición de vídeo.
- Capacidad de extracción de características (feature extraction) según los tags del repositorio.
- En esta variante específica, ausencia de censura o filtros de contenido, lo que permite respuestas sin restricciones de seguridad.

## Casos de uso

- Desarrollo de software a largo plazo: el modelo puede mantener sesiones de codificación de horas o días, gestionando repositorios grandes, ejecutando comandos de terminal y depurando errores de forma autónoma, gracias a su contexto de 1M tokens y su capacidad de agente.
- Investigación profunda automatizada: genera informes de investigación con gráficos, tablas y visualizaciones interactivas, integrando datos de múltiples fuentes y presentando resultados en formatos listos para publicar.
- Análisis de documentos extensos: con su ventana de 1M tokens, puede procesar libros completos, expedientes legales o documentación técnica de gran volumen en una sola pasada, extrayendo información relevante y resumiendo.
- Asistente de diseño asistido por ordenador (CAD) y desarrollo de juegos: su capacidad de visión en el bucle permite iterar sobre diseños visuales, generar código para motores gráficos y validar resultados visualmente.
- Creación de contenido multimedia: edición de vídeo y motion design mediante instrucciones en lenguaje natural, aprovechando su comprensión multimodal de secuencias visuales.
- Automatización de infraestructura: orquestación de herramientas de terminal y scripts de despliegue, con capacidad de razonar sobre logs y errores del sistema en tiempo real.
- Investigación en seguridad y alineación: esta variante sin censura permite estudiar el comportamiento del modelo sin restricciones, útil para analizar sesgos, riesgos de contenido dañino o mecanismos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante "decensored" en la información disponible. El modelo base Kimi K3 ha sido comparado en fuentes externas con GPT-5.6 y Claude, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros estándares en los materiales consultados. Se recomienda consultar el reporte técnico oficial de Moonshot AI para obtener datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada: el modelo completo en precisión de 8 bits ocupa aproximadamente 1561 GB, por lo que se requiere un clúster de GPUs con al menos 2 TB de memoria agregada para inferencia en precisión completa.
- GPUs recomendadas: clústeres de NVIDIA H100 (80 GB) o A100 (80 GB). Se necesitarían al menos 20 H100 para cargar los pesos en 8 bits, y más para activaciones y memoria intermedia.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) ni en estaciones de trabajo individuales.
- Opciones de despliegue: vLLM, TensorRT-LLM o TGI son las opciones habituales para modelos de esta escala, aunque no se confirma compatibilidad específica en la documentación. También podría usarse llama.cpp con cuantización extrema, pero la latencia sería muy alta.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera un throughput de decenas de tokens por segundo en clústeres optimizados, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Kimi K3 (base) | 2,8 billones | 104 mil millones | 1M tokens | Sí (texto, imagen, vídeo) | Kimi K3 License |
| DeepSeek V3 | 671 mil millones | 37 mil millones | 128K tokens | No | MIT |
| Llama 4 Maverick | 400 mil millones | 17 mil millones | 1M tokens | Sí (texto, imagen) | Llama 4 Community License |
| Qwen3-Max | No disponible (propietario) | No disponible | 256K tokens | No | Propietaria |

Kimi K3 destaca por su escala sin precedentes en modelos abiertos, superando ampliamente a DeepSeek V3 y Llama 4 en parámetros totales. Su contexto de 1M tokens iguala al de Llama 4, pero su multimodalidad nativa y su arquitectura híbrida KDA le confieren ventajas en tareas de agente de largo alcance. Sin embargo, su licencia propietaria (Kimi K3 License) restringe ciertos usos comerciales, a diferencia de la licencia MIT de DeepSeek V3.

## Limitaciones y advertencias

- Variante sin censura: al eliminar los mecanismos de seguridad, el modelo puede generar contenido dañino, ilegal o éticamente problemático. Su uso debe restringirse a entornos de investigación controlados.
- Licencia Kimi K3: es una licencia propietaria con condiciones específicas. No se detallan los términos exactos en la información disponible, pero es probable que incluya restricciones de uso comercial y obligaciones de atribución. Se recomienda revisar el texto completo de la licencia antes de cualquier despliegue.
- Tamaño y coste: la inferencia requiere infraestructura de nivel centro de datos, con costes energéticos y económicos muy elevados. No es viable para despliegues en edge o en entornos con recursos limitados.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento largo. La ausencia de alineación puede aumentar la confianza en respuestas incorrectas.
- Experimental: la versión r4 es un trabajo comunitario no oficial, sin garantías de estabilidad, reproducibilidad o soporte. Puede contener artefactos de modificación que afecten al rendimiento.
- Idiomas: no se especifican los idiomas soportados en esta variante. El modelo base probablemente soporta chino e inglés, pero no se confirma.
- Sesgos: al ser una modificación sin censura, los sesgos del modelo base pueden amplificarse, incluyendo sesgos de género, raza o ideología presentes en los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace de la variante: https://huggingface.co/nkkbr2/Kimi-K3-decensored-experimental-r4
- Organización de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Blog técnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Reporte técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Página oficial de Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
- Documentación de la API de Kimi K3: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
