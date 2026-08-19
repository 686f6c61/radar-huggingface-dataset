# eemin/GLM-5.2-MXFP8-NVFP4-NF3-Hybrid

## Resumen

GLM-5.2-MXFP8-NVFP4-NF3-Hybrid es un checkpoint cuantizado del modelo GLM-5.2 de Z-AI, un transformador de mezcla de expertos (MoE) de aproximadamente 753 000 millones de parámetros con 256 expertos enrutados por capa. El modelo original, desarrollado por Z-AI (zai-org), es la última iteración de la serie GLM-5 y destaca por su ventana de contexto extremadamente larga y su soporte de predicción multitoken (MTP) ampliado a cinco tokens de borrador. Esta versión híbrida, creada por el usuario eemin, comprime el modelo completo sin podar expertos mediante una estrategia de cuantización mixta: 64 de los 256 expertos por capa se almacenan en NVFP4 (4 bits), los 192 restantes en NF3 (3 bits), mientras que atención, capas densas y expertos compartidos permanecen en BF16. Los tensores lineales elegibles se convierten a MXFP8 en tiempo de carga. El resultado ocupa 340,9 GiB y cabe en cuatro GPU de 96 GiB de arquitectura Blackwell (SM120), con longitudes de contexto validadas de hasta 775 000 tokens. La relevancia de este modelo radica en que permite ejecutar un LLM de 753B en hardware relativamente asequible sin sacrificar la integridad estructural del modelo original, algo poco habitual en cuantizaciones extremas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 256 expertos enrutados por capa, atención con MLA (Multi-head Latent Attention) y RoPE |
| Parametros totales | 318 162 511 872 (checkpoint cuantizado); modelo original ~753B |
| Parametros activos | No disponible (el modelo original GLM-5.2 tiene ~39B activos, pero no se confirma para este checkpoint) |
| Longitud de contexto | Hasta 775 000 tokens (validado con perfil NVFP4 KV calibrado y FP8 RoPE); otros perfiles: 400K (FP8), 450K (FP8+MTP3), 700K (NVFP4) |
| Tipos de cuantizacion | Híbrida: BF16 (atención, denso, expertos compartidos), MXFP8 (lineales en carga), NVFP4 (64 expertos por capa), NF3 (192 expertos por capa); KV cuantizable en FP8 o NVFP4 |
| Idiomas soportados | No disponible (el modelo base GLM-5.2 es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | MIT |
| Formato de pesos | Safetensors (184 shards de máximo 2 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 es un transformador MoE con 256 expertos enrutados por capa y atención con MLA (Multi-head Latent Attention), que reduce el coste de memoria del KV-cache. Incorpora predicción multitoken (MTP) ampliada a cinco tokens de borrador, lo que mejora el rendimiento en tareas de razonamiento, codificación y flujos agénticos. Este checkpoint concreto no modifica la arquitectura del modelo original: mantiene todos los expertos y las capas sin podar. La innovación principal es la cuantización híbrida: se seleccionan 64 ranuras de experto por capa (basadas en un criterio de "daño" o damage-selected) que conservan los tensores NVFP4 de la versión de Luke Alonso (lukealonso/GLM-5.2-NVFP4), mientras que los 192 restantes usan el formato NF3 con un kernel específico para GPU SM120 (Grid188). Los tensores de atención, densos y expertos compartidos se mantienen en BF16, y los lineales elegibles se convierten a MXFP8 en tiempo de carga según el perfil de servicio. El checkpoint incluye también un sidecar con escalas de KV calibradas para los perfiles NVFP4. No se dispone de información detallada sobre el entrenamiento original (composición del dataset, número de tokens, fases de RLHF/DPO), ya que la model card solo documenta el proceso de cuantización y validación.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo base GLM-5.2 está diseñado para tareas de razonamiento, codificación y flujos agénticos, según la documentación de vLLM Recipes.
- Predicción multitoken (MTP): soporta hasta 5 tokens de borrador, lo que acelera la generación en cargas de trabajo de razonamiento y código.
- Ventana de contexto ultralarga: validado hasta 775 000 tokens en el perfil NVFP4 con KV calibrado, y 450 000 tokens en el perfil FP8 con MTP3. Esto permite procesar documentos extensos, bases de código completas o conversaciones de larga duración.
- Cuantización híbrida optimizada para Blackwell: los pesos se distribuyen entre NVFP4, NF3 y MXFP8, con kernels específicos para SM120, lo que permite ejecutar el modelo completo en 4 GPU de 96 GiB.
- Capacidades del modelo base (heredadas): al ser una cuantización del GLM-5.2 original, conserva las capacidades de razonamiento, codificación y agénticas del modelo de Z-AI, aunque no se documentan explícitamente en esta model card.
- Sin poda de expertos: a diferencia de otras versiones reducidas, este checkpoint mantiene los 256 expertos por capa, preservando la capacidad expresiva del modelo original.

## Casos de uso

- Procesamiento de documentos legales o técnicos extensos: gracias a la ventana de contexto de hasta 775 000 tokens, el modelo puede analizar contratos, patentes o informes de cientos de páginas en una sola pasada, extrayendo cláusulas, resumiendo secciones o respondiendo preguntas sobre el contenido completo.
- Asistente de programación sobre repositorios grandes: con 450 000 tokens de contexto en el perfil FP8, puede cargar un repositorio completo de código y generar sugerencias, explicaciones o refactorizaciones coherentes con el estilo y las dependencias del proyecto.
- Razonamiento científico y matemático: el modelo base GLM-5.2 destaca en tareas de razonamiento (GPQA-Diamond 88,89 en esta versión), por lo que es adecuado para asistencia en investigación, resolución de problemas complejos o generación de demostraciones formales.
- Agentes autónomos con memoria extendida: la combinación de MTP y contexto largo permite construir agentes que mantienen conversaciones de larga duración, ejecutan múltiples pasos de razonamiento y gestionan herramientas externas sin perder el hilo de la interacción.
- Generación de código en producción con revisión humana: el modelo puede integrarse en pipelines de CI/CD para generar pruebas unitarias, documentación o parches, siempre con supervisión humana, gracias a su capacidad de manejar grandes bloques de código y su licencia MIT que permite uso comercial.
- Análisis de series de datos y generación de informes: con contexto amplio, puede procesar logs de sistemas, métricas de negocio o resultados de experimentos, y generar informes narrativos o resúmenes ejecutivos con referencias precisas a los datos de entrada.

## Benchmarks y rendimiento

La model card reporta el resultado en GPQA-Diamond (temperatura 1.0, top-p 0.95, máximo esfuerzo de razonamiento) para este checkpoint y para las versiones de referencia. También incluye métricas KLD (divergencia de Kullback-Leibler) como indicador de desviación de distribución respecto al modelo BF16 original, aunque se advierte que KLD no es una medida de inteligencia.

| Modelo | GPQA Diamond |
|---|---|
| GLM-5.2 oficial FP8 (referencia) | 89,52 |
| GLM-5.2 NVFP4 completo (referencia) | 89,39 |
| **GLM-5.2-MXFP8-NVFP4-NF3-Hybrid (v3.6)** | **88,89 (176/198)** |
| Revisión híbrida anterior | 88,38 (175/198) |
| REAP-594B podado (para contraste) | 86,87 |

Además, se reportan valores KLD para los distintos perfiles de servicio, todos por debajo de 0,14, lo que indica una desviación mínima respecto al modelo de referencia BF16. No se proporcionan resultados en otros benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 340,9 GiB en disco. Para inferencia se requieren 4 GPU con 96 GiB de VRAM cada una (total 384 GiB), según los perfiles Compose incluidos.
- GPU recomendadas: arquitectura Blackwell SM120 (por ejemplo, B200, RTX PRO 6000 Blackwell). El repositorio de GitHub asociado también lo porta a 4× DGX Spark (GB10, sm_121a, aarch64) con 67,4 tok/s agregados y 800K de contexto.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.) debido al tamaño del modelo y la necesidad de memoria unificada de 96 GiB por GPU.
- Opciones de despliegue: se incluyen perfiles Docker Compose para vLLM (imagen inmutable `voipmonitor/vllm:gilded-gnosis-v20-vllm0c79e41-sie603f74-fi801d57a-cu132-20260726`). También se puede usar vLLM directamente con los archivos de lanzamiento incluidos. El repositorio de GitHub documenta un despliegue alternativo con 4× DGX Spark.
- Rendimiento: el perfil FP8 alcanza 2 291/2 247 tokens por segundo en prompts de 64k/128k en una configuración A/B con 4 GPU. El repositorio de GitHub reporta 67,4 tok/s agregados en DGX Spark. No se especifican latencias por token individual.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión GPQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **GLM-5.2-MXFP8-NVFP4-NF3-Hybrid** | 318B cuantizado (753B original) | Hasta 775K | 88,89 | MIT | Hugging Face |
| GLM-5.2 oficial FP8 | ~753B | No especificado | 89,52 | MIT | zai-org/GLM-5.2 |
| GLM-5.2 NVFP4 completo (lukealonso) | ~753B | No especificado | 89,39 | MIT | lukealonso/GLM-5.2-NVFP4 |
| REAP-594B (podado) | 594B | No especificado | 86,87 | No disponible | No disponible |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de benchmarks para otros MoE de tamaño similar (como DeepSeek-V3 o Qwen-MoE) en la información proporcionada. Este checkpoint destaca por su menor huella de memoria (340,9 GiB frente a los ~1,5 TB del BF16 original) y por mantener un rendimiento muy cercano al de las referencias FP8 y NVFP4 completas, con una pérdida de solo 0,63 puntos en GPQA-Diamond respecto al FP8 oficial.

## Limitaciones y advertencias

- La cuantización NF3 (3 bits) en 192 de los 256 expertos por capa puede introducir degradación de precisión en tareas sensibles a pequeños detalles numéricos, aunque la métrica GPQA-Diamond sugiere una pérdida mínima.
- El perfil de contexto máximo (775 000 tokens) es "ajustado" según la model card: requiere un margen de memoria libre de al menos 94 MiB por GPU y se recomienda reducir `MAX_MODEL_LEN` si el hardware no tiene suficiente headroom. El techo real probado es 785 000 tokens, pero no se anuncia por falta de robustez.
- Los kernels NF3 y MXFP8 están optimizados exclusivamente para arquitectura Blackwell SM120; no funcionarán en GPUs de generaciones anteriores (Ampere, Ada Lovelace, etc.).
- No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K para este checkpoint concreto; solo se dispone de GPQA-Diamond y KLD.
- La model card advierte que KLD es una medida de desviación de distribución, no una puntuación de inteligencia, por lo que no debe interpretarse como un indicador de calidad absoluta.
- El modelo es una cuantización no oficial creada por un tercero (eemin); aunque la licencia es MIT y el modelo base es de Z-AI, no hay garantía de soporte oficial ni de mantenimiento por parte del desarrollador original.
- No se especifican los idiomas soportados ni posibles sesgos del modelo base; se recomienda evaluar el comportamiento en el dominio de aplicación antes de usarlo en producción.

## Enlaces

- [Modelo en Hugging Face (eemin/GLM-5.2-MXFP8-NVFP4-NF3-Hybrid)](https://huggingface.co/eemin/GLM-5.2-MXFP8-NVFP4-NF3-Hybrid)
- [Modelo base original (zai-org/GLM-5.2)](https://huggingface.co/zai-org/GLM-5.2)
- [Versión NVFP4 completa (lukealonso/GLM-5.2-NVFP4)](https://huggingface.co/lukealonso/GLM-5.2-NVFP4)
- [Repositorio de despliegue en 4× DGX Spark (GitHub)](https://github.com/tonyd2wild/GLM-5.2-NF3-Hybrid-4x-DGX-Spark-800kctx)
- [Receta de vLLM para GLM-5.2](https://recipes.vllm.ai/zai-org/GLM-5.2)
