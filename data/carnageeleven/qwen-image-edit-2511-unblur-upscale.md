# carnageeleven/Qwen-Image-Edit-2511-Unblur-Upscale

## Resumen

Qwen-Image-Edit-2511-Unblur-Upscale es un adaptador LoRA para el modelo de edición de imagen Qwen-Image-Edit-2511, desarrollado para la tarea de desenfocar (unblur) y reescalar (upscale) imágenes a alta resolución. El adaptador se carga sobre el pipeline de image-to-image del modelo base y se activa con el prompt fijo "unblur and upscale". Su objetivo es recuperar detalle fino, reducir el desenfoque y mejorar la nitidez preservando texturas naturales y colores realistas, evitando el aspecto sobreprocesado típico de otros pipelines de reescalado.

El repositorio consultado pertenece al usuario carnageeleven y declara licencia apache-2.0, idioma inglés y compatibilidad con la librería diffusers. Sin embargo, la model card y los enlaces de descarga apuntan al repositorio prithivMLmods/Qwen-Image-Edit-2511-Unblur-Upscale, lo que sugiere que se trata de una copia o réplica de un adaptador original de otro autor. Esta discrepancia de autoría es relevante antes de reutilizar los pesos en producción.

Según el propio autor, el adaptador es experimental y fue entrenado específicamente para recuperar patrones faciales en imágenes parcialmente desenfocadas: el modelo base produce mejor calidad global, pero no conserva esos patrones. Se entrenó en ModelScope.cn y el repositorio ocupa 0,9 GB, con ficheros safetensors recomendados (_20 y _15). No hay métricas cuantitativas publicadas ni evaluación por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el transformer de difusión del modelo base Qwen-Image-Edit-2511 (la arquitectura interna no se detalla en la información proporcionada) |
| Parámetros totales | No disponible (el repositorio de 0,9 GB contiene pesos de adaptador, no del modelo completo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de edición de imagen); no se especifica límite de tokens |
| Tipos de cuantización | No disponible; el ejemplo oficial carga el modelo base en `torch.bfloat16` |
| Idiomas soportados | en (inglés), según las etiquetas del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`Qwen-Image-Edit-Unblur-Upscale_20.safetensors` y `Qwen-Image-Edit-Unblur-Upscale_15.safetensors`, recomendados por el autor) |

Datos adicionales declarados: pipeline `image-to-image`, librería `diffusers`, modelo base `Qwen/Qwen-Image-Edit-2511`, prompt de activación `unblur and upscale`, compatibilidad indicada con las versiones 2509 y 2511 del modelo base, tamaño del repositorio 0,9 GB, fecha de creación 2026-09-13.

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) que se acopla mediante `pipe.load_lora_weights()` a un pipeline `DiffusionPipeline` de diffusers. No se especifica en la información disponible la arquitectura concreta del modelo base (tipo de transformer de difusión, número de bloques, mecanismo de condicionamiento de la imagen de entrada), el rango del adaptador, ni qué módulos se han adaptado. Tampoco se detalla el número de parámetros del adaptador ni del modelo base.

El autor indica que el adaptador se entrenó en ModelScope.cn y que fue un experimento orientado a recuperar patrones faciales de imágenes parcialmente desenfocadas. No se publican el volumen de datos de entrenamiento, la composición del dataset, la resolución de entrenamiento, el número de pasos ni si hubo etapas de ajuste fino adicionales (RLHF/DPO no aplican en este dominio). La innovación destacable, según la model card, es la preservación de consistencia visual en iluminación, bordes y tonos de color, con un resultado fotográficamente creíble en lugar de sobreprocesado.

## Capacidades

- Edición de imagen image-to-image: recibe una imagen y devuelve una versión modificada, integrada en el pipeline de diffusers del modelo base.
- Desenfoque (unblur): reducción del desenfoque y recuperación de detalle fino en imágenes de baja calidad.
- Reescalado (upscale): aumento de resolución con mejora de nitidez.
- Recuperación de patrones faciales: capacidad específica para la que fue entrenado el adaptador, según el autor.
- Preservación de texturas naturales y colores realistas: mantiene la apariencia fotográfica y evita el aspecto sobreprocesado.
- Consistencia visual: coherencia declarada en iluminación, bordes y tonos de color entre entrada y salida.
- Compatibilidad con dos versiones del modelo base (2509 y 2511) mediante el mismo fichero de adaptador.
- Control mediante prompt: se activa con la frase fija `unblur and upscale`.
- No hay evidencia de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, generación de texto, código, matemáticas ni capacidades de audio. Es un modelo exclusivamente de imagen.
- No se documentan capacidades multilingües más allá de la etiqueta `en`.

## Casos de uso

- Restauración de fotografía antigua o degradada: el adaptador reduce el desenfoque y recupera detalle en imágenes escaneadas de baja calidad, manteniendo la textura y el color originales en lugar de generar una apariencia plástica.
- Recuperación de retratos con rostros parcialmente desenfocados: es el caso para el que fue entrenado explícitamente; útil en archivos familiares, fotografía documental o material de prensa donde el rostro es el elemento crítico.
- Preparación de imágenes para impresión en alta resolución: el pipeline reescala y aumenta la nitidez, lo que permite generar versiones aptas para formatos de impresión mayores que la resolución nativa del original.
- Mejora de catálogos de producto y comercio electrónico: imágenes de producto capturadas con móvil y ligeramente borrosas se pueden convertir en versiones nítidas y de mayor resolución antes de publicarlas.
- Preprocesado de datasets de visión por computador: limpiar y homogeneizar la nitidez de imágenes antes de etiquetarlas o de entrenar otros modelos de detección o clasificación, reduciendo el ruido de baja calidad en el conjunto de datos.
- Rehabilitación de material de archivo periodístico o documental: recuperar imágenes históricas digitalizadas con desenfoque parcial para su publicación digital, siempre que se respete la licencia apache-2.0 declarada.
- Integración en flujos creativos con diffusers: al cargarse con `load_lora_weights()` sobre Qwen-Image-Edit-2511, puede encadenarse con otros adaptadores o etapas de edición dentro del mismo pipeline de image-to-image.
- Automatización por lotes de procesos de mejora de imagen: al ser un adaptador sobre un pipeline estándar de diffusers, se puede invocar en scripts de procesamiento por lote, aunque no se publican cifras de latencia o throughput que permitan dimensionar el coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente ejemplos visuales de entrada y salida; no aporta métricas objetivas como PSNR, SSIM, LPIPS ni comparaciones cuantitativas con otros adaptadores de desenfoque o reescalado.

## Requisitos de hardware

- Tamaño del adaptador: 0,9 GB en disco. A esta cifra hay que sumar el peso del modelo base Qwen-Image-Edit-2511, cuyo tamaño no se especifica en la información proporcionada.
- El ejemplo oficial carga el pipeline con `device_map="cuda"` y `dtype=torch.bfloat16`, por lo que se recomienda una GPU con soporte de BF16 (arquitecturas Ampere o posteriores) para un rendimiento razonable.
- Soporte de Apple Silicon: la model card indica cambiar el device a `"mps"` para dispositivos Apple.
- VRAM estimada: no disponible.
- GPU recomendadas concretas (A100, H100, RTX 4090, etc.): no disponibles en la información proporcionada.
- Encaje en GPU de consumo: no se puede determinar sin conocer el tamaño del modelo base; el adaptador por sí solo no es suficiente para inferir.
- Opciones de despliegue documentadas: Diffusers (`DiffusionPipeline` + `load_lora_weights`), con las dependencias `diffusers`, `transformers` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no serían aplicables según la información disponible al tratarse de un pipeline de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| carnageeleven/Qwen-Image-Edit-2511-Unblur-Upscale | Adaptador LoRA image-to-image | Qwen/Qwen-Image-Edit-2511 | Desenfoque + reescalado | apache-2.0 | Repositorio en HuggingFace; 0 descargas y 0 likes en la fecha de consulta |
| prithivMLmods/Qwen-Image-Edit-2511-Unblur-Upscale | Adaptador LoRA image-to-image | Qwen/Qwen-Image-Edit-2511 | Desenfoque + reescalado | apache-2.0 (declarada en la model card, no verificada de forma independiente) | Referenciado en la model card y en el enlace de descarga; parece el origen del adaptador |
| Qwen/Qwen-Image-Edit-2511 (base, sin adaptador) | Modelo de edición de imagen | No aplica | Edición general de imagen | No disponible en la información proporcionada | Modelo base en HuggingFace; el autor indica que da mejor calidad global pero no preserva los patrones faciales que sí recupera el adaptador |
| Otros adaptadores de desenfoque o reescalado para Qwen-Image-Edit | LoRA | Qwen/Qwen-Image-Edit-2511 o versiones previas | Unblur / upscale | No disponible | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de rendimiento cuantitativos que permitan una comparación objetiva entre estas opciones.

## Limitaciones y advertencias

- Adaptador experimental: el propio autor lo describe como experimental y acota su utilidad a la recuperación de patrones faciales.
- Compromiso de calidad: según la model card, el modelo base produce mejor calidad global que el adaptador, pero no conserva los patrones faciales; el adaptador prioriza la fidelidad facial a costa de la calidad general.
- Riesgo de errores: el autor advierte explícitamente de que el modelo puede cometer errores y remite a la sección "Important Info".
- Sin benchmarks ni evaluación independiente: no hay métricas objetivas de PSNR, SSIM o LPIPS, ni validación por parte de la comunidad (0 descargas, 0 likes).
- Discrepancia de autoría y procedencia: el repositorio consultado es de carnageeleven, mientras que la model card, los ejemplos y el enlace de descarga apuntan a prithivMLmods. Conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Idiomas: solo se declara inglés como idioma; el prompt de activación está en inglés y no se documenta comportamiento con prompts en otros idiomas.
- Licencia del modelo base: la licencia apache-2.0 se declara para este repositorio, pero no se detalla en la información proporcionada la licencia del modelo base Qwen-Image-Edit-2511, que hay que verificar por separado antes de un uso comercial.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede inventar detalle que no existe en la imagen original al recuperar zonas muy degradadas; no se documentan mecanismos de control de fidelidad más allá del prompt fijo.
- Sin datos de VRAM, latencia ni throughput: dificulta el dimensionamiento de infraestructura para producción.
- Metadatos anómalos: la fecha de creación y de actualización registradas (2026-09-13) son idénticas y no se acompanan de historial de versiones; el repositorio no muestra actividad posterior.
- No apto para tareas de texto, código, razonamiento o agentes: es un adaptador exclusivamente de imagen.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/carnageeleven/Qwen-Image-Edit-2511-Unblur-Upscale
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repositorio referenciado en la model card (origen aparente del adaptador): https://huggingface.co/prithivMLmods/Qwen-Image-Edit-2511-Unblur-Upscale
- Enlace de descarga de ficheros indicado en la model card: https://huggingface.co/prithivMLmods/Qwen-Image-Edit-2511-Unblur-Upscale/tree/main
- Plataforma de entrenamiento indicada por el autor: https://modelscope.cn
- Ejemplos visuales incluidos en la model card:
  - https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/lEN5BbhpVuqc1wakDqxve.png
  - https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/SCRoOl9I3aYE7bEOohWNN.png
  - https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/G6B1u8i1lIY7xYvW5ep1Q.png
- Resultados de la búsqueda web: no se ha recuperado ninguna fuente técnica relevante (papers, blogs o repos) sobre este adaptador; los resultados devueltos corresponden a páginas genéricas de buscadores y no aportan información sobre el modelo.
