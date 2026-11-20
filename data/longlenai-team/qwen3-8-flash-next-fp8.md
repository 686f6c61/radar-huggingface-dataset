# longlenai-team/Qwen3.8-Flash-Next-FP8

## Resumen

Qwen3.8-Flash-Next-FP8 es la versión cuantizada en FP8 del modelo Qwen3.8-Flash-Next, desarrollado por el equipo Qwen (Alibaba). Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura experimental que servirá de base para Qwen4, publicado como preview de pesos abiertos. El modelo combina atención híbrida (Gated DeltaNet más Qwen Sparse Attention), un esquema MoE con 512 expertos, embeddings de n-gramas y Gated Residual, lo que suma 180.000 millones de parámetros totales según los safetensors del repositorio.

El problema que aborda es la eficiencia en contextos largos y cargas agénticas: QSA opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, reduciendo la latencia en ventanas de contexto extensas. La versión FP8, publicada por longlenai-team, aplica cuantización fina por bloques de 128 y mantiene, según el autor, métricas de rendimiento casi idénticas al modelo original. Es relevante ahora porque permite desplegar un modelo de 180B en infraestructura más modesta y porque su contexto nativo de 262.144 tokens es extensible hasta 1.000.000.

La ficha se centra en los artefactos FP8 alojados en Hugging Face, compatibles con Transformers, vLLM, SGLang y TokenSpeed. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con vision encoder; híbrida Gated DeltaNet + Qwen Sparse Attention, MoE con 512 expertos, Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 (180B); desglose del autor: 125B LM (6B activos) + 51B n-gram embedding + 4B MTP |
| Parametros activos | 6B en el LM; 10 expertos enrutados + 1 compartido por token |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 con cuantización fina por bloques de tamaño 128 (artefacto de este repo); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (transformers); tamaño del repo 185,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión. Su capa oculta mide 2560 y tiene 48 capas organizadas en un layout híbrido de 12 bloques, cada uno compuesto por 3 subcapas (Gated DeltaNet → MoE) seguidas de 1 subcapa (Qwen Sparse Attention → MoE). Gated DeltaNet usa 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Qwen Sparse Attention emplea 24 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de dimensión 64 y un indexador MQA con 4 cabezas de query y 1 cabeza de clave compartida; su presupuesto es de 512 bloques o 2048 tokens. El MoE tiene 512 expertos con dimensión intermedia 640, activando 10 enrutados más 1 compartido. El Gated Residual usa 4 ramas con rango de cuello de botella 320. Los embeddings de n-gramas indexan bigramas y trigramas en la capa 2 con 20.000.000 de entradas, y el vocabulario de tokens es de 248.320 (padded). Incluye una capa MTP entrenada con múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento. El autor aplica Muon y AdamW a categorías de pesos específicas, elimina los warmups de batch-size tradicionales (arrancando directamente en el tamaño objetivo) y ajusta las leyes de escala para soportar learning rates mayores con convergencia estable. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La cuantización FP8 del repositorio usa bloques de 128 y, según el autor, mantiene métricas casi idénticas al original.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Razonamiento matemático y generación de código (capacidades propias de la familia Qwen, no cuantificadas en la información disponible).
- Procesamiento de contexto largo: 262.144 tokens nativos, extensible a 1.000.000, orientado a cargas agénticas.
- MTP (multi-token prediction) de una capa entrenada con múltiples pasos, útil para decodificación especulativa.
- Compatibilidad con Transformers, vLLM, SGLang y TokenSpeed para despliegue.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; la versión oficial Qwen3.8-Flash en Qwen Cloud sí incluye herramientas integradas.
- Idiomas: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a sus 262.144 tokens de contexto nativo, manteniendo coherencia en sesiones largas sin truncar el historial.
- Análisis de documentos largos con imágenes: al ser image-text-to-text, permite procesar informes, contratos o manuales con figuras y tablas en una sola pasada, extrayendo respuestas sobre el contenido combinado.
- Agentes autónomos multi-paso: la arquitectura QSA reduce la latencia en contextos largos, lo que lo hace adecuado para bucles agénticos donde cada paso reinyecta el estado acumulado.
- Generación de código en producción: puede integrarse en pipelines de CI/CD para revisión, generación de tests o explicación de diffs, aprovechando el contexto largo para incluir repositorios completos.
- Asistencia sobre bases de código con visión: combinación de capturas de UI y código fuente para tareas de depuración frontend o generación de componentes a partir de mockups.
- Procesamiento batch de documentación técnica: con FP8 y 180B totales pero solo 6B activos, el coste por token es contenido, lo que permite procesar grandes volúmenes en GPUs de datacenter.
- Investigación en arquitecturas híbridas: al ser un preview de la arquitectura de Qwen4, sirve como banco de pruebas para estudiar Gated DeltaNet, QSA y N-gram Embedding en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original incluye una tabla de benchmarks con estilos CSS, pero los valores numéricos no están presentes en el extracto proporcionado, por lo que no se reproducen.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 180 GB solo para pesos (180B parámetros × 1 byte), más overhead de activaciones, KV cache y buffers. Con contexto de 262.144 tokens el KV cache crece de forma significativa, por lo que se recomienda planificar con margen amplio.
- GPU recomendadas: nodos multi-GPU de datacenter, como 3× H100 80 GB o 4× A100 80 GB en FP8 para cubrir pesos y overhead. Para 1M de contexto se necesita más memoria o técnicas de offloading.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones de 2× 24 GB. Requiere al menos 3 GPUs de 80 GB o equivalentes.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según el autor. llama.cpp y Ollama no están confirmados para este artefacto FP8.
- Latencia y throughput: no disponibles. El autor afirma que QSA reduce la latencia en contexto largo y que la cuantización FP8 mantiene métricas casi idénticas al original, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 (este) | 180B | 6B | 262.144 (ext. 1M) | qwen-community-1.0 | safetensors FP8 |
| Qwen3.8-Flash-Next (base) | 180B | 6B | 262.144 (ext. 1M) | qwen-community-1.0 | safetensors (BF16 presumiblemente) |
| Qwen3.8-Flash (Qwen Cloud) | no disponible | no disponible | 1M por defecto | servicio gestionado | API |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores de otros fabricantes en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo experimental: es un preview de la arquitectura de Qwen4, no un modelo de producción estable; el autor lo presenta como paso concreto hacia AGI, no como release final.
- Licencia qwen-community-1.0: es necesario revisar los términos del archivo LICENSE antes de cualquier uso comercial; la etiqueta "other" en Hugging Face indica condiciones específicas no resumidas aquí.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni calidad por idioma.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- Cuantización FP8: aunque el autor afirma métricas casi idénticas, la cuantización puede degradar tareas sensibles a precisión (matemáticas, código) sin que se aporten evaluaciones comparativas.
- Contexto de 1M: es una extensión sobre los 262.144 nativos; el rendimiento real en ventanas extremas no está cuantificado.
- Repositorio con 0 descargas y 0 likes: es un artefacto recién publicado por un tercero (longlenai-team), no por el equipo oficial de Qwen, lo que añade un riesgo de procedencia que conviene verificar frente al repositorio original.
- Tool calling y function calling: no confirmados para este artefacto; la versión con herramientas integradas es la de Qwen Cloud.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/longlenai-team/Qwen3.8-Flash-Next-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-flash
