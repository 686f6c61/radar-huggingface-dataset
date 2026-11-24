# AnesNT2026/Genisi-5-Nexus

## Resumen

Genisi-5-Nexus es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario AnesNT2026 bajo la librería transformers. Por sus dimensiones reales (2.780.110.363.392 parámetros según los pesos en safetensors, es decir, aproximadamente 2,8 billones) y por la información de su model card, se trata de una redistribución o reempaquetado del modelo Kimi K3.1 Pro de Moonshot AI, un modelo MoE de clase 3T con 104B parámetros activos y una ventana de contexto de un millón de tokens.

El modelo se presenta como nativamente multimodal y orientado a tareas agénticas, con mejoras declaradas en programación, creación 3D, investigación financiera y precisión factual respecto a Kimi K3. Incorpora una arquitectura híbrida de atención con 69 capas KDA y 24 capas Gated DSA, además de un MoE con 896 expertos y 16 expertos seleccionados por token.

Su relevancia radica en que, de confirmarse, sería uno de los pocos modelos abiertos de escala 3T con contexto de 1M tokens y capacidades multimodales. No obstante, el repositorio no incluye información verificable sobre el proceso de conversión, los idiomas soportados ni resultados de benchmarks, y la licencia es una licencia propia ("kimi-k3.1-pro") que no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida: 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2,8 billones (2.780.110.363.392 según safetensors) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag compressed-tensors); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (licencia propia, condiciones no disponibles) |
| Formato de pesos | safetensors (repo de 1.561,4 GB) |

Otros datos técnicos declarados en la model card: 93 capas (1 densa), dimensión de atención 7168, 96 cabezas de atención, dimensión de cabeza del índice DSA 128 con 32 cabezas y top-K 2048, dimensión latente MoE 3584, dimensión oculta por experto 3072, 896 expertos con 16 seleccionados por token y 2 expertos compartidos, y vocabulario de 160K tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención híbrida. Combina capas KDA (Kimi Delta Attention, una variante de atención lineal con estado recurrente) con capas Gated DSA (DeepSeek Sparse Attention con compuerta), lo que permite manejar contextos de un millón de tokens reduciendo el coste cuadrático de la atención densa. El MoE emplea 896 expertos en dimensión latente de 3584, activando 16 por token más 2 expertos compartidos, lo que da lugar a los 104B parámetros activos sobre los 2,8T totales.

Según la model card, el modelo se obtiene mediante post-entrenamiento a partir de Kimi K3 con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. No se especifican el número de tokens de preentrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO de forma explícita más allá de la mención al RL. Tampoco se documenta en la información disponible el proceso de conversión que dio lugar a este repositorio concreto.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text).
- Razonamiento agéntico multi-paso y ejecución de tareas encadenadas.
- Programación y generación de código, con mejoras declaradas respecto a Kimi K3.
- Creación 3D.
- Investigación financiera y análisis de documentos extensos.
- Precisión factual mejorada según el autor.
- Ventana de contexto de hasta 1.000.000 tokens para documentos y conversaciones muy largas.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de código extensas y responder preguntas sobre arquitectura, dependencias y deuda técnica sin fragmentar el código en trozos.
- Investigación financiera sobre informes anuales: permite cargar decenas de documentos financieros en una sola ventana y extraer comparativas, riesgos y cifras con trazabilidad al texto original.
- Asistentes de creación 3D: generación y edición de escenas o descripciones estructuradas a partir de instrucciones en lenguaje natural e imágenes de referencia.
- Agentes autónomos de larga duración: su orientación agéntica y contexto extendido lo hacen adecuado para pipelines que requieren mantener estado y memoria de acciones previas durante muchas iteraciones.
- Automatización de soporte técnico multimodal: el modelo puede recibir capturas de pantalla o diagramas junto con texto y responder consultas técnicas que requieran interpretar ambos.
- Revisión de documentación legal o científica: carga de contratos o artículos completos para resumen, detección de cláusulas contradictorias o extracción de metadatos.
- Generación de código en producción: integración en pipelines de CI/CD para revisión automática de pull requests, siempre que se validen previamente latencia y coste de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Con 2,8T parámetros, incluso en 8 bits el modelo requeriría del orden de 2,8 TB de memoria, lo que excede cualquier GPU individual y exige despliegue multi-nodo.
- GPU recomendadas: no disponible en la información proporcionada; por escala, un despliegue realista requeriría clústeres de H100/H200 o B200 con interconexión de alta velocidad.
- Cabe en GPU consumer: no. Ninguna GPU consumer (RTX 4090, 5090, etc.) dispone de memoria suficiente para alojar los pesos.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Genisi-5-Nexus (Kimi K3.1 Pro) | 2,8T / 104B | 1M tokens | kimi-k3.1-pro (propia) | Hugging Face, 1.561 GB |
| Kimi K3 | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia "kimi-k3.1-pro" es una licencia propia cuyos términos no se detallan; es imprescindible revisar el archivo LICENSE del repositorio original de Moonshot AI antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y no documenta el proceso de conversión ni validación del reempaquetado; la integridad y fidelidad respecto al modelo original no están verificadas.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano es desconocido.
- Riesgo de alucinación inherente a los modelos de gran escala; la model card declara mejoras en precisión factual, pero no aporta métricas que lo respalden.
- El tamaño del repositorio (1.561,4 GB) y los 2,8T parámetros hacen inviable el despliegue en infraestructura convencional; requiere clústeres multi-nodo.
- No hay información sobre sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad.
- La etiqueta compressed-tensors y 8-bit sugiere pesos cuantizados, pero no se detalla el esquema exacto ni la pérdida de calidad asociada.

## Enlaces

- Hugging Face: https://huggingface.co/AnesNT2026/Genisi-5-Nexus
- Modelo original de referencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Página de Moonshot AI: https://www.moonshot.ai
- Chat: https://www.kimi.ai
- Organización en Hugging Face: https://huggingface.co/moonshotai
- ModelScope: https://modelscope.cn/organization/moonshotai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
