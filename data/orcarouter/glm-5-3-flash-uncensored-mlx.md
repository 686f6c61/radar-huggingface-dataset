# orcarouter/GLM-5.3-Flash-Uncensored-MLX

## Resumen

OrcaRouter publica una versión "uncensored" (abliterated) del modelo GLM-5.3-Flash de Z.ai, adaptada al ecosistema MLX para Apple Silicon y cuantizada a 4 bits. El modelo base es un mixture-of-experts (MoE) de 320 mil millones de parámetros totales y 18 mil millones activos, con licencia MIT, lanzado en agosto de 2026 como parte del proyecto "Ox Alpha". La versión de OrcaRouter elimina los mecanismos de rechazo directamente en los pesos, sin emplear LoRA ni jailbreak, mediante una edición de los pesos FP8 originales. El repositorio MLX contiene un archivo safetensors con 58.243.415.870 parámetros, lo que sugiere una cuantización agresiva o una selección parcial de pesos, aunque el modelo base conserva su arquitectura completa. Esta variante está pensada para tareas de red-teaming, investigación de seguridad y generación de contenido sin restricciones, manteniendo las capacidades multimodales (imagen-texto), function calling y razonamiento del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, multimodal (imagen-texto) |
| Parametros totales | 58.243.415.870 (según safetensors del repo MLX; el modelo base GLM-5.3-Flash tiene 320B totales / 18B activos) |
| Parametros activos | 18B (del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX), FP8 nativo (modelo base) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE con 320B parámetros totales y 18B activos por token, desarrollado por Z.ai. Incorpora capacidades de visión-lenguaje (procesa imágenes y texto), function calling, razonamiento multi-paso y decodificación con MTP (Multi-Token Prediction). El entrenamiento original incluye datos multilingües (principalmente inglés y chino) y técnicas de alineación estándar. La versión de OrcaRouter aplica un proceso de "abliteration" que modifica los pesos FP8 del modelo para eliminar los comportamientos de rechazo (refusals) sin necesidad de adaptadores externos ni instrucciones de jailbreak. Posteriormente, el modelo se convierte a formato MLX y se cuantiza a 4 bits para su ejecución eficiente en hardware Apple Silicon. No se han publicado detalles sobre el dataset de entrenamiento específico de esta variante.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Comprensión y generación multimodal: acepta imágenes como entrada y produce texto (image-text-to-text).
- Function calling / tool calling: puede invocar herramientas externas de forma estructurada.
- Razonamiento multi-paso y planificación de agentes.
- Soporte de decodificación MTP (Multi-Token Prediction) para mayor velocidad de inferencia.
- Sin restricciones de contenido: el modelo no rechaza peticiones sobre temas sensibles (por diseño, orientado a red-teaming).
- Cuantización 4-bit optimizada para MLX, lo que permite ejecución en Apple Silicon con uso eficiente de memoria.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo permite probar sistemas de moderación y detectar vulnerabilidades en pipelines de IA generativa, al no aplicar filtros de contenido.
- Investigación académica sobre alineación y sesgos: estudiar el comportamiento de un modelo sin restricciones ayuda a entender los límites de la alineación estándar.
- Generación de contenido creativo sin censura: escritura de ficción, guiones o material que requiera explorar temas tabú sin bloqueos automáticos.
- Desarrollo de agentes autónomos: gracias al function calling y al razonamiento multi-paso, puede integrarse en sistemas de automatización que requieran tomar decisiones complejas.
- Análisis de documentos multimodales: procesar imágenes con texto (capturas, diagramas) para extraer información o generar descripciones.
- Pruebas de robustez de modelos: comparar el comportamiento de la versión uncensored frente a la original para medir el impacto de la ablación de rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión MLX uncensored en la informacion disponible. El modelo base GLM-5.3-Flash de Z.ai cuenta con métricas propias, pero no se incluyen en los materiales consultados. Se recomienda consultar el repositorio oficial de Z.ai para datos de rendimiento del modelo original.

## Requisitos de hardware

- Al ser un modelo MLX, requiere Apple Silicon (M1, M2, M3, M4 o posteriores) con memoria unificada.
- VRAM estimada para la versión 4-bit: aproximadamente 29 GB (58B parámetros × 0,5 bytes), aunque el tamaño real del repo (780,7 GB) sugiere que incluye múltiples archivos o precisiones adicionales.
- Se recomienda un Mac con al menos 32 GB de RAM unificada para cargar el modelo en memoria.
- Para inferencia, se puede usar el framework MLX (mlx-lm) o herramientas compatibles como llama.cpp con backend MLX.
- No es adecuado para GPUs NVIDIA o AMD sin conversión previa a otros formatos (GGUF, etc.).
- La latencia y el throughput dependen del chip; en un M2 Max se pueden esperar decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B total / 18B activo | no disponible | MIT | HuggingFace (gated) |
| OrcaRouter GLM-5.3-Flash-Uncensored-MLX | 58B (según safetensors) | no disponible | MIT | HuggingFace (gated) |
| Llama 3.1 405B | 405B denso | 128K | Llama 3.1 Community | HuggingFace |
| Mixtral 8x22B | 141B total / 39B activo | 64K | Apache 2.0 | HuggingFace |

La comparativa es orientativa; no se dispone de datos de rendimiento directos para la versión MLX. El modelo base destaca por su licencia MIT y su arquitectura MoE eficiente, mientras que la variante uncensored añade la eliminación de rechazos.

## Limitaciones y advertencias

- El modelo está diseñado para eliminar rechazos, lo que implica un alto riesgo de generar contenido dañino, ilegal o éticamente problemático. Su uso debe limitarse a entornos controlados de investigación y red-teaming.
- Puede presentar sesgos heredados del entrenamiento original, especialmente en idiomas distintos de inglés y chino.
- Riesgo de alucinación: como todo modelo generativo, puede inventar información, especialmente en dominios especializados.
- La longitud de contexto no está documentada en la información disponible; se desconoce si mantiene la ventana del modelo base.
- El acceso al repositorio es restringido (gated) y requiere aceptar condiciones en HuggingFace, a pesar de la licencia MIT.
- La cuantización 4-bit puede degradar ligeramente la calidad de salida en comparación con el modelo FP8 original.
- No se garantiza soporte para producción; es un conjunto de pesos de investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-MLX
- Blog de ExplainX sobre el lanzamiento: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Página de API de OrcaRouter para GLM 5.3 Flash: https://www.orcarouter.ai/models/z-ai/glm-5.3-flash
- Publicación en LinkedIn: https://www.linkedin.com/posts/orcarouter_glm-53-flash-uncensored-native-fp8-activity-7499733012641742848-kb30
- Publicación en X: https://x.com/OrcaRouter/status/2093612518396871075
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.3-Flash
