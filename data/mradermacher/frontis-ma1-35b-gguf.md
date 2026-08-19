# mradermacher/Frontis-MA1-35B-GGUF

## Resumen

Frontis-MA1-35B es un modelo de lenguaje de 35 505 millones de parámetros desarrollado por FrontisAI, una iniciativa que busca avanzar en la inteligencia artificial de código abierto. El modelo se enmarca en el proyecto OpenRSI, cuyo objetivo es entrenar modelos orientados a la auto-mejora recursiva (AI4AI), es decir, sistemas capaces de mejorar sus propias capacidades de razonamiento y generación mediante técnicas de aprendizaje por refuerzo y optimización de trayectorias. El repositorio aquí descrito contiene las cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo original, lo que permite su ejecución en entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque experimental hacia el auto-mejoramiento y en la publicación de su stack de entrenamiento (OpenMLE) junto con datasets de tareas y trazas de ajuste supervisado. Aunque la información pública es todavía escasa, el modelo se posiciona como una alternativa open source para investigación en aprendizaje por refuerzo aplicado a modelos de lenguaje. La arquitectura interna, la longitud de contexto y los idiomas soportados no han sido publicados en los repositorios consultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 35 505 251 456 (35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas del modelo original en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo (número de capas, tipo de atención, etc.) en los repositorios consultados. El artículo de arXiv titulado "Frontis-MA1: Training an AI4AI Model towards Recursive Self-Improvement" (arXiv:2607.28568) describe el entrenamiento del modelo principal de 35B y de un compañero de 30B, pero el contenido completo no está accesible en los resultados de búsqueda. Según el repositorio GitHub de OpenRSI, el entrenamiento utiliza el stack OpenMLE que incluye componentes de Gym, RL y Evo, así como datasets de tareas (OpenMLE Tasks) y de trazas de ajuste supervisado (OpenMLE SFT Traces). Se menciona que el modelo se somete a un post-entrenamiento que busca mejorar el rendimiento en sistemas, trayectorias y transferencia, pero no se especifican los detalles técnicos (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO).

## Capacidades

La información pública no detalla las capacidades específicas del modelo más allá de su etiqueta "conversational" en HuggingFace. Según el artículo y el repositorio, el modelo está orientado a tareas de auto-mejora y razonamiento, pero no se enumeran capacidades concretas como generación de código, soporte de tool calling o capacidades multimodales. No se ha confirmado si el modelo soporta function calling o razonamiento multi-paso. El idioma principal de trabajo no se ha especificado, aunque la documentación está en inglés.

## Casos de uso

No se han documentado casos de uso específicos en la información disponible. Dado su tamaño (35,5B) y su formato GGUF, el modelo podría emplearse en tareas de generación de texto y conversación en entornos con GPU de gama media, pero no hay confirmación oficial. El enfoque AI4AI sugiere aplicaciones en investigación de auto-mejora de modelos, pero no se dispone de ejemplos prácticos validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 21,9 GB, que corresponde al conjunto de todas las cuantizaciones. Cada archivo GGUF individual tiene un peso variable según la cuantización (por ejemplo, Q4_K_M suele ocupar alrededor de 20 GB para un modelo de 35B, mientras que Q8_0 ronda los 35 GB).
- Para las cuantizaciones más pequeñas (Q2_K, Q3_K_S, Q3_K_M) se necesitan aproximadamente 12-16 GB de VRAM, lo que permite su ejecución en GPUs de consumo como la RTX 3090 o RTX 4090 (24 GB).
- Las cuantizaciones Q4_K_M y superiores requieren al menos 24 GB de VRAM; las Q5 y Q6 pueden necesitar 28-32 GB.
- La cuantización f16 completa requeriría alrededor de 70 GB de VRAM, solo viable en GPUs profesionales como A100 (80 GB) o H100.
- Para inferencia se recomienda utilizar llama.cpp, Ollama o servidores compatibles con GGUF. vLLM no soporta GGUF de forma nativa, aunque existen adaptaciones.
- La latencia y el throughput no se han publicado; dependerán de la GPU y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El modelo no tiene benchmarks publicados ni se han identificado alternativas directas con el mismo enfoque AI4AI. Se recomienda consultar el repositorio original de FrontisAI para futuras actualizaciones.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial es incierto y requiere contacto con los autores.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- Al ser una cuantización GGUF, puede haber una ligera pérdida de precisión respecto al modelo original en safetensors, especialmente en las cuantizaciones más agresivas (Q2_K, Q3_K).
- El modelo es muy reciente (creado en agosto de 2026) y no cuenta con evaluaciones independientes ni documentación exhaustiva.
- No se ha confirmado el soporte de idiomas distintos del inglés.

## Enlaces

- Repositorio HuggingFace del modelo original: https://huggingface.co/FrontisAI/Frontis-MA1-35B
- Repositorio HuggingFace con GGUF oficiales: https://huggingface.co/FrontisAI/Frontis-MA1-35B-GGUF
- Repositorio HuggingFace con las cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Frontis-MA1-35B-GGUF
- Repositorio GitHub del proyecto OpenRSI: https://github.com/FrontisAI/OpenRSI
- Artículo arXiv: https://arxiv.org/pdf/2607.28568
- Visualización de arquitectura (hfviewer): https://hfviewer.com/FrontisAI/Frontis-MA1-35B
