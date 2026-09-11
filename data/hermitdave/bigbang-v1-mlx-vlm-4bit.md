# hermitdave/BigBang-v1-MLX-VLM-4bit

## Resumen

BigBang-v1-MLX-VLM-4bit es una conversión al formato MLX del modelo multimodal endless-frontier/BigBang-v1, publicada por el usuario hermitdave. Se trata de un modelo de imagen-a-texto (image-text-to-text) que combina un decodificador de lenguaje con arquitectura MoE y un codificador de visión, empaquetado en cuantización uniforme de 4 bits con tamaño de grupo 64 mediante la librería mlx_vlm (versión 0.6.17). El repositorio ocupa 20,4 GB y declara 35.107.181.936 parámetros totales.

La arquitectura corresponde a qwen3_5_moe: 35.000 millones de parámetros totales, 3.000 millones activos por token, 256 expertos con enrutado de 8 expertos por token y atención híbrida (lineal más atención completa) con una ventana de contexto de 262.000 tokens. El componente de visión es un ViT de la familia Qwen3.5 MoE, con parches de 16 píxeles, 27 capas y dimensión oculta de 1152.

Su relevancia práctica es doble: por un lado, permite ejecutar un MoE multimodal de 35B en hardware Apple Silicon gracias a la cuantización de 4 bits y al bajo número de parámetros activos; por otro, su contexto de 262K tokens habilita tareas de análisis documental y RAG multimodal sobre corpus extensos sin fragmentación agresiva. La licencia es Apache 2.0, lo que facilita el uso comercial, aunque conviene tener en cuenta que el repositorio no incluye resultados de evaluación ni datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE transformer multimodal, atención híbrida lineal + completa) |
| Parámetros totales | 35.107.181.936 (~35B) |
| Parámetros activos | ~3B por token (8 expertos de 256 por token) |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantización | 4 bits uniforme, group size 64 (esta variante); en la familia existen también mixed_4_6 (Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Copyright 2026 Alibaba Cloud, modelo base original) |
| Formato de pesos | safetensors (formato MLX, librería mlx_vlm) |
| Codificador de visión | Qwen3.5 MoE ViT, patch 16, 27 capas, hidden 1152 |
| Modelo base | endless-frontier/BigBang-v1 |
| Librería de conversión | mlx_vlm 0.6.17 |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 20,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el patrón de un transformer con mezcla de expertos (MoE) y capacidades multimodales. El decodificador de lenguaje emplea 256 expertos con activación dispersa de 8 expertos por token, lo que da lugar a ~3B parámetros activos sobre un total de ~35B, una ratio de activación en torno al 8,5 %. La atención es híbrida: combina capas de atención lineal con capas de atención completa, un esquema habitual para reducir el coste de memoria de la caché KV en contextos muy largos, en este caso hasta 262.000 tokens. El componente visual es un ViT de la familia Qwen3.5 MoE con parches de 16 píxeles, 27 capas y dimensión oculta 1152, integrado en el pipeline image-text-to-text.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias; tampoco se documentan innovaciones de decodificación (por ejemplo decodificación especulativa). Lo que sí se especifica es el proceso de conversión: los pesos originales de endless-frontier/BigBang-v1 se transformaron a formato MLX con mlx_vlm 0.6.17 aplicando cuantización uniforme de 4 bits con tamaño de grupo 64. La atribución de copyright a Alibaba Cloud en la licencia y la nomenclatura qwen3_5_moe sugieren que el modelo base deriva de la familia Qwen, si bien esto no se confirma explícitamente en la model card.

## Capacidades

- Generación de texto conversacional a partir de entradas multimodales (texto e imagen), según el pipeline declarado image-text-to-text.
- Comprensión de imágenes: descripción, interpretación y respuesta a preguntas sobre contenido visual, mediante el codificador ViT integrado.
- Procesamiento de contexto muy largo: hasta 262.000 tokens, adecuado para documentos extensos, múltiples imágenes en una misma conversación o corpus completos.
- Inferencia eficiente por activación dispersa: al activar ~3B parámetros por token, el coste computacional por token es muy inferior al de un modelo denso de 35B.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de servicios en la nube.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), audio u otras modalidades: no disponibles.

## Casos de uso

- Análisis de informes financieros con gráficos y tablas: el modelo puede recibir el documento completo (o sus páginas renderizadas como imagen) y responder preguntas sobre cifras y tendencias. Los 262K tokens de contexto permiten ingerir informes anuales enteros sin troceado agresivo.
- Extracción estructurada de facturas y albaranes en local: a partir de la imagen del documento, generar JSON con campos clave (emisor, importe, fecha, líneas). Al ejecutarse con MLX sobre Apple Silicon, los datos no salen del equipo, lo que simplifica el cumplimiento de normativa de protección de datos.
- RAG multimodal sobre manuales técnicos: indexar texto y diagramas de manuales de producto, recuperar los fragmentos relevantes y usar el modelo para responder consultas que requieren interpretar tanto el texto como los esquemas.
- Generación de texto alternativo y descripciones accesibles: procesar lotes de imágenes para producir descripciones en lenguaje natural destinadas a lectores de pantalla o catálogos de producto.
- Revisión visual de interfaces y control de calidad de UI: comparar capturas de pantalla con especificaciones y detectar discrepancias de maquetación, etiquetas o estados, en un flujo de trabajo de QA previo a despliegue.
- Inspección visual en entornos con requisitos de privacidad: análisis de imágenes industriales (defectos, etiquetado, inventario) en instalaciones sin conexión a servicios externos, aprovechando la ejecución local.
- Prototipado e investigación sobre MoE multimodal en Apple Silicon: servir de base para experimentos de cuantización, comparación de variantes (4-bit uniforme frente a mixed_4_6) y estudios de coste de caché KV en contextos largos.
- Asistente documental para equipos jurídicos o de compliance: revisión de contratos escaneados junto con documentación adjunta, con la posibilidad de mantener varias imágenes y textos en la misma ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, MMMU ni otras), y las búsquedas web realizadas no devolvieron datos contrastables sobre el modelo base endless-frontier/BigBang-v1.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos en 4 bits ocupan 20,4 GB. A ello hay que sumar la caché KV y las activaciones; con 262K tokens de contexto, la caché KV puede crecer de forma significativa (no se dispone del número de capas, cabezas ni dimensión de cabeza necesarios para estimarla).
- Memoria mínima razonable: 32 GB de memoria unificada en un equipo Apple Silicon, aunque el margen es estrecho; 64 GB o más es la configuración recomendada para contextos largos o procesamiento de imágenes en lote.
- GPUs compatibles: MLX está diseñado para Apple Silicon (familias M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). El modelo no se distribuye en un formato ejecutable directamente sobre CUDA, por lo que A100, H100 o RTX 4090 requerirían una conversión a otro formato (por ejemplo safetensors de transformers o GGUF), no incluida en este repositorio.
- ¿Cabe en GPU de consumo? En su formato actual, no aplica a GPU de consumo tipo RTX por la dependencia de MLX. En Apple Silicon, cabe en equipos con 32 GB o más de memoria unificada, con 64 GB como recomendación práctica.
- Opciones de despliegue: mlx-vlm (opción natural, la librería usada para la conversión), mlx-lm para la variante solo texto; conversión adicional a GGUF para llama.cpp u Ollama si se desea otro runtime; vLLM y TGI no soportan MLX de forma nativa y requerirían reconvertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye benchmarks, por lo que la comparación se limita a especificaciones de la propia familia y a la variante base.

| Modelo | Cuantización | Tamaño | Modalidad | Caso de uso declarado |
|---|---|---|---|---|
| BigBang-v1-MLX-VLM-4bit (este) | uniforme 4-bit | ~20,4 GB | Multimodal | Multimodal, rápido |
| BigBang-v1-MLX-VLM-Q4_K_M | mixed_4_6 | ~22,0 GB | Multimodal | Multimodal, mayor calidad |
| BigBang-v1-MLX-4bit | uniforme 4-bit | ~19,5 GB | Solo texto | Texto, rápido |
| BigBang-v1-MLX-Q4_K_M | mixed_4_6 | ~21,0 GB | Solo texto | Texto, mayor calidad |
| endless-frontier/BigBang-v1 (base) | sin cuantizar | no disponible | Multimodal | Modelo de referencia |

No se dispone de datos de benchmarks que permitan comparar este modelo con alternativas externas de la misma categoría (MoE de ~30-35B con ~3B activos y capacidades multimodales). Los parámetros totales, la longitud de contexto y la licencia sí son comparables a nivel declarativo: 35B totales, 3B activos, 262K tokens de contexto y Apache 2.0.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, ni comparativas, ni resultados de calidad reportados por el autor de la conversión ni por el autor del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos, y potencialmente acentuado en una cuantización de 4 bits uniforme con group size 64, más agresiva que la variante mixed_4_6.
- Degradación potencial de la percepción visual: la cuantización de 4 bits aplicada también al codificador de visión puede reducir la precisión en tareas de OCR fino, lectura de tablas densas o detección de detalles pequeños.
- Idiomas soportados no documentados: no se puede asumir un rendimiento uniforme en castellano ni en otros idiomas distintos del inglés.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Inconsistencia en la model card: el ejemplo de código carga el identificador `mlx-community/BigBang-v1-MLX-VLM-4bit`, mientras que el repositorio consultado es `hermitdave/BigBang-v1-MLX-VLM-4bit`. Conviene ajustar el identificador al repositorio que se vaya a usar y verificar que el contenido coincide.
- Conversión de terceros: la cuantización la realiza hermitdave a partir del modelo base de endless-frontier; no es una publicación oficial del autor original.
- Dependencia de plataforma: los pesos en formato MLX solo se ejecutan con la pila MLX sobre Apple Silicon. No hay garantía de equivalencia numérica si se reconvierten a otros formatos.
- Metadatos temporales llamativos: las fechas de creación y actualización que figuran en HuggingFace (10 de septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificarlas antes de citar el modelo.
- Licencia: Apache 2.0 permite uso comercial, pero la model card atribuye el copyright del modelo base original a Alibaba Cloud. Es recomendable revisar la licencia del repositorio base endless-frontier/BigBang-v1 antes de un despliegue en producción.
- Contexto de 262K tokens: aunque declarado, no se documenta la degradación de calidad en función de la posición del contexto ni el coste real de memoria de la caché KV.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hermitdave/BigBang-v1-MLX-VLM-4bit
- Modelo base: https://huggingface.co/endless-frontier/BigBang-v1
- Variante solo texto, 4-bit uniforme: https://huggingface.co/mlx-community/BigBang-v1-MLX-4bit
- Variante solo texto, Q4_K_M: https://huggingface.co/mlx-community/BigBang-v1-MLX-Q4_K_M
- Variante multimodal, Q4_K_M: https://huggingface.co/mlx-community/BigBang-v1-MLX-VLM-Q4_K_M
- Librería de conversión e inferencia: mlx-vlm (versión 0.6.17 citada en la model card; URL del proyecto no incluida en la información proporcionada)
- Paper, blog o demo oficial: no disponibles
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre el modelo; los únicos resultados obtenidos correspondían a sitios de música sin relación con la consulta.
