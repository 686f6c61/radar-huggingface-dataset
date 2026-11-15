# dnhkng/RYS-Qwen3.5-27B-FP8-L

## Resumen

RYS-Qwen3.5-27B-FP8-L es una cuantización en FP8 del modelo multimodal Qwen3.5-27B, publicada por el usuario dnhkng bajo licencia Apache 2.0. Se trata de un modelo causal con codificador de visión orientado a tareas image-text-to-text, pensado para inferencia eficiente en entornos de producción sin renunciar a la calidad del modelo original. La cuantización emplea FP8 de grano fino con tamaño de bloque de 128, un esquema que, según el autor, mantiene métricas de rendimiento prácticamente idénticas a las del modelo sin cuantizar.

El modelo base Qwen3.5-27B, desarrollado por el equipo Qwen de Alibaba, introduce una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuertas y una red feed-forward de tipo Mixture-of-Experts dispersa. Cuenta con 27 000 millones de parámetros (29 690 millones según los pesos en safetensors del repositorio) y una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 010 000. Incorpora además un módulo MTP (multi-token prediction) entrenado con múltiples pasos.

La relevancia de esta ficha radica en que ofrece el modelo en un formato cuantizado listo para desplegar con Transformers, vLLM, SGLang y KTransformers, reduciendo los requisitos de memoria frente a los pesos en BF16. El repositorio tiene un tamaño de 32,8 GB y, en el momento de la consulta, registra 15 descargas y 5 likes, lo que lo sitúa como una publicación reciente y de nicho dentro del ecosistema Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention + FFN (MoE dispersa) |
| Parametros totales | 29 686 775 920 (según safetensors); 27B según model card |
| Parametros activos | no disponible (la model card no detalla el número de expertos activos) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 |
| Tipos de cuantizacion | FP8 de grano fino con block size de 128 |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer híbrido con 64 capas organizadas en un patrón de 16 bloques, cada uno compuesto por tres secuencias de (Gated DeltaNet → FFN) seguidas de una (Gated Attention → FFN). La dimensión oculta es de 5120 y el embedding de tokens de 248 320 (con padding). Las Gated DeltaNet emplean 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17 408 y se organiza como Mixture-of-Experts dispersa. El modelo incluye un módulo MTP entrenado con múltiples pasos, orientado a decodificación especulativa y aceleración de inferencia.

Según la model card del modelo base, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales, lo que permite paridad cross-generacional con Qwen3 y supera a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual. El entrenamiento por refuerzo se escaló a entornos de millones de agentes con distribuciones de tareas progresivamente complejas. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. La cuantización FP8 del repositorio se aplicó sobre los pesos post-entrenados, con bloques de 128 elementos, y el autor afirma que las métricas de rendimiento son casi idénticas a las del modelo original.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline image-text-to-text permite entrada conjunta de imagen y texto, con paridad declarada frente a Qwen3 en razonamiento, código y agentes.
- Comprensión visual: codificador de visión integrado mediante fusión temprana de tokens multimodales, con rendimiento superior a Qwen3-VL según la model card del modelo base.
- Generación de código y matemáticas: incluida en los benchmarks de lenguaje del modelo base (categorías Knowledge, Reasoning, Coding, Alignment).
- Soporte de tool calling y function calling: el modelo base Qwen3.5 está orientado a agentes y entornos de herramientas; la model card menciona explícitamente capacidades de agentes.
- Razonamiento multi-paso y agentes: entrenamiento RL escalado a entornos de millones de agentes, con orquestación de scaffolds masivos.
- Capacidades multilingües: cobertura de 201 idiomas y dialectos según la model card del modelo base.
- Decodificación especulativa: módulo MTP entrenado con múltiples pasos, que habilita aceleración de inferencia.
- Contexto largo: ventana nativa de 262 144 tokens extensible a 1 010 000, adecuada para documentos extensos y conversaciones multi-turno prolongadas.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262 144 tokens de ventana nativa, manteniendo el hilo de la conversación y recuperando información de interacciones previas sin truncamientos agresivos.
- Análisis de documentos con imágenes: al ser image-text-to-text, permite procesar facturas, informes escaneados o capturas de pantalla junto con texto, extrayendo y razonando sobre la información combinada en un único pase.
- Generación de código en producción: el soporte de tool calling y las capacidades de agentes permiten integrarlo en pipelines de CI/CD para revisión de código, generación de tests o resolución de incidencias con acceso a herramientas externas.
- Asistentes de investigación multimodal: con contexto extensible hasta 1 010 000 tokens, puede ingerir artículos completos con figuras y tablas, resumir y responder preguntas cruzando texto e imágenes.
- Despliegue en infraestructura con memoria limitada: la cuantización FP8 con block size de 128 reduce el peso del repositorio a 32,8 GB, lo que facilita servirlo con vLLM o SGLang en GPUs de 40-48 GB frente a los requisitos de los pesos en BF16.
- Agentes autónomos multi-paso: el entrenamiento RL en entornos de millones de agentes y el módulo MTP lo hacen adecuado para orquestación de tareas complejas con múltiples llamadas a herramientas y planificación secuencial.
- Traducción y localización multilingüe: la cobertura de 201 idiomas y dialectos permite construir pipelines de traducción con matices culturales y regionales, aunque la lista concreta de idiomas no está disponible en el repositorio.

## Benchmarks y rendimiento

Los datos de benchmarks corresponden al modelo base Qwen3.5-27B publicados en su model card. No se han publicado resultados específicos de la versión FP8 en la información disponible; el autor afirma que las métricas son casi idénticas a las del modelo original.

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83,7 | 80,8 | 84,4 | 86,7 | 86,1 | 85,3 |
| MMLU-Redux | 93,7 | 91,0 | no disponible | no disponible | no disponible | no disponible |

Los datos de MMLU-Redux para el resto de modelos no están completos en la información proporcionada. La model card del modelo base incluye una figura adicional de resultados (`qwen3.5_middle_size_score.png`) con benchmarks de razonamiento, código, agentes y comprensión visual, pero los valores numéricos no se detallan en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 32,8 GB en FP8, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos completos, más overhead de activaciones y caché KV. Con contexto largo, la caché KV puede añadir varios GB adicionales.
- GPU recomendadas: H100 (80 GB), A100 (80 GB) y A100 (40 GB) para despliegue completo con contexto extendido; GPUs de 48 GB como L40S o RTX 6000 Ada pueden ser suficientes para contextos moderados.
- Cabe en consumer GPU: no de forma completa en GPUs de 24 GB (RTX 4090, 3090) sin offloading o cuantización adicional; sí en GPUs de 48 GB o superiores.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card. No se menciona compatibilidad con llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet y el módulo MTP están orientados a alto throughput y baja latencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RYS-Qwen3.5-27B-FP8-L | 29,7B (27B nominales) | 262 144 (ext. 1 010 000) | Apache 2.0 | safetensors FP8 | Cuantización FP8 del Qwen3.5-27B |
| Qwen3.5-27B | 27B | 262 144 (ext. 1 010 000) | Apache 2.0 | safetensors BF16 | Modelo base sin cuantizar |
| Qwen3.5-35B-A3B | 35B totales (3B activos según nomenclatura) | no disponible | Apache 2.0 | safetensors | MoE dispersa, mayor tamaño total |
| Qwen3.5-122B-A10B | 122B totales (10B activos según nomenclatura) | no disponible | Apache 2.0 | safetensors | MoE de mayor escala, MMLU-Pro 86,7 |
| GPT-OSS-120B | 120B | no disponible | no disponible | no disponible | MMLU-Pro 80,8 |

La comparativa se limita a los modelos presentes en la tabla de benchmarks de la model card. No se dispone de datos de contexto, licencia o formato para GPT-OSS-120B ni para los modelos Qwen3.5 de mayor tamaño más allá de lo indicado.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible; al ser un modelo entrenado con datos web a gran escala, es previsible que herede sesgos presentes en esos datos, pero no se documentan sesgos específicos.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de gran escala, existe riesgo de generar información plausible pero incorrecta, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto o idioma: aunque se declaran 201 idiomas, la lista concreta no está disponible y el rendimiento puede variar notablemente entre idiomas. El contexto extensible a 1 010 000 tokens puede degradar la calidad si no se gestiona adecuadamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia enlazada apunta al fichero LICENSE del repositorio Qwen/Qwen3.5-27B-FP8; conviene verificar los términos exactos del modelo base antes de un despliegue comercial.
- Caveats para producción: la cuantización FP8 puede introducir degradaciones menores no cuantificadas; el autor afirma que son casi idénticas, pero no publica métricas comparativas. El repositorio tiene muy pocas descargas (15) y likes (5), lo que limita la validación comunitaria. No se especifican los parámetros activos del MoE, lo que dificulta estimar el coste real de inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dnhkng/RYS-Qwen3.5-27B-FP8-L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio FP8 del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B-FP8
- Blog del autor sobre RYS-II: https://dnhkng.github.io/posts/rys-ii/
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-27B-FP8/blob/main/LICENSE
