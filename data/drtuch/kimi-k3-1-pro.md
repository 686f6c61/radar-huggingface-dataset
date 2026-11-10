# drtuch/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de pesos abiertos, nativamente multimodal y orientado a tareas agénticas, desarrollado por Moonshot AI. Según su model card, es el modelo "clase 3T" más capaz de la compañía hasta la fecha y el primero de la serie K3.1. Se obtiene mediante post-entrenamiento sobre Kimi K3 con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios, e incorpora una ventana de contexto de un millón de tokens.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104 mil millones de parámetros activos por token, distribuidos en 93 capas. La composición de atención combina 69 capas KDA (Kimi Delta Attention) con 24 capas Gated DSA (DeepSeek Sparse Attention), una hibridación poco habitual que busca equilibrar eficiencia en contexto largo y capacidad de recuperación selectiva de información.

La relevancia de esta ficha radica en que el repositorio publicado por el usuario `drtuch` es una réplica (mirror) del modelo original de Moonshot AI, con pesos en formato `safetensors` y cuantización de 8 bits mediante `compressed-tensors`. El tamaño del repositorio, 1.561,4 GB, y sus 2,78 billones de parámetros lo sitúan en la categoría de modelos que solo pueden desplegarse en infraestructura de múltiples nodos con GPUs de centro de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida KDA + Gated DSA |
| Parámetros totales | 2.780.110.363.392 (2,8 T) |
| Parámetros activos | 104 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | 8 bits (compressed-tensors); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other) |
| Formato de pesos | safetensors (con `compressed-tensors`), código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 93 capas, de las cuales una es densa. La dimensión oculta de atención es 7.168 con 96 cabezas de atención. El bloque de atención se compone de 69 capas KDA y 24 capas Gated DSA; la DSA utiliza 32 cabezas de índice con dimensión 128 y un top-k de 2.048, lo que sugiere un mecanismo de selección dispersa de tokens clave para reducir el coste cuadrático en contextos de un millón de tokens.

La capa MoE tiene una dimensión latente de 3.584 y una dimensión oculta por experto de 3.072, con 896 expertos en total, 16 expertos seleccionados por token y 2 expertos compartidos. El vocabulario es de 160.000 tokens. Según la model card, el post-entrenamiento se basa en aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, partiendo de Kimi K3. No se detalla en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni si se aplicaron técnicas como DPO o decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento de propósito general en modo conversacional.
- Procesamiento de imagen y texto de forma nativa (pipeline `image-text-to-text`), lo que permite entrada multimodal.
- Capacidades de codificación reforzadas mediante RL, según la model card.
- Creación 3D y investigación financiera como dominios destacados en el post-entrenamiento.
- Mejora en precisión factual y capacidades agénticas declaradas por el autor.
- Soporte de contexto de hasta un millón de tokens para documentos y conversaciones extensas.
- Compatibilidad con endpoints (`endpoints_compatible`) según los tags del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica extensa: con una ventana de un millón de tokens, el modelo puede ingerir repositorios completos, manuales o expedientes y responder preguntas que requieran correlacionar información distribuida a lo largo de cientos de miles de tokens.
- Investigación financiera asistida: la model card cita la investigación financiera como dominio reforzado; el modelo puede resumir informes anuales, comparar estados financieros y extraer métricas de documentos largos en una sola pasada.
- Generación y revisión de código en pipelines: su especialización en codificación permite integrarlo en flujos de revisión de pull requests, generación de tests o migración de código, siempre que la infraestructura soporte el coste de inferencia.
- Creación 3D asistida: dado el énfasis del post-entrenamiento en creación 3D, puede emplearse para generar descripciones estructuradas, scripts de modelado procedural o asistencia en herramientas de diseño 3D a partir de instrucciones e imágenes.
- Agentes multi-paso con entrada visual: al ser nativamente multimodal y agéntico, puede operar en tareas que combinen capturas de pantalla, documentos escaneados e instrucciones textuales, como automatización de flujos de trabajo de oficina.
- Asistentes conversacionales de largo alcance: conversaciones multi-turno con memoria efectiva sobre historiales muy largos, útil en soporte técnico especializado donde el contexto acumulado es crítico.
- Extracción de información de archivos multimedia: al aceptar imagen y texto, puede procesar lotes de documentos escaneados y producir salidas estructuradas, aunque el rendimiento real dependerá de la implementación de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,78 billones de parámetros en 8 bits, el peso del modelo ronda los 2,8 TB, por lo que se requiere un clúster multi-nodo. No cabe en una sola GPU.
- GPU recomendadas: H100, H200 o B200 en configuraciones multi-nodo; A100 de 80 GB en agregados de decenas de unidades como mínimo.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer, ni siquiera con cuantizaciones agresivas, dado el tamaño del repositorio (1.561,4 GB).
- Opciones de despliegue: `transformers` con `custom_code` y `compressed-tensors`; vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro (este) | 2,8 T | 104 B | 1.000.000 | kimi-k3.1-pro (other) | Hugging Face (mirror `drtuch`) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Hugging Face (Moonshot AI) |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como modelo generativo de gran escala, es esperable, pero no hay datos publicados en la información disponible.
- Limitaciones de contexto o idioma: el contexto es de un millón de tokens, pero no se especifican los idiomas soportados ni su calidad relativa.
- Restricciones de licencia: la licencia es `other` con nombre `kimi-k3.1-pro`; es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- El repositorio es un mirror de un tercero (`drtuch`), no la publicación oficial de Moonshot AI; conviene verificar la integridad de los pesos frente al repositorio original.
- El tamaño de 1.561,4 GB y los 2,78 T de parámetros hacen inviable el despliegue en hardware de consumo y exigen planificación de almacenamiento y red.
- La model card está truncada en la información disponible; faltan secciones como benchmarks, instrucciones de uso y limitaciones declaradas por el autor.
- El pipeline declarado es `image-text-to-text`, pero no se detallan las capacidades de audio o vídeo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/drtuch/Kimi-K3.1-Pro
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
