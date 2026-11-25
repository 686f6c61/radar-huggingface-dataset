# gatilin/hy4-vision-encoder

## Resumen

`gatilin/hy4-vision-encoder` es un componente extraído del modelo multimodal Tencent Hy4, publicado por el usuario gatilin. No se trata de un modelo completo, sino del codificador visual (vision encoder) y el proyector del sistema multimodal original: conserva los tensores `vit.*`, el patch embedding, 40 bloques transformer, el merger espacial y el embedding de salto de línea de imagen. El modelo de lenguaje, el tokenizador y el decodificador especulativo no están incluidos.

El interés de esta publicación es práctico: permite reutilizar el front-end visual de Hy4 de forma aislada para extracción de características de imagen, sin necesidad de cargar el modelo multimodal completo. Con 1.235 millones de parámetros y 649 tensores en BF16, el módulo es manejable en CPU y GPU de consumo para tareas de visión.

La relevancia es acotada pero clara para investigadores que quieran estudiar o reutilizar la torre visual de Hy4, comparar representaciones visuales o integrar el codificador en pipelines propios. La licencia subyacente es la Tencent Hy License, con términos comerciales adicionales, y el componente no funciona como un `AutoModel` estándar: requiere el código de implementación `HYV4VL` de una revisión concreta de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) con 40 bloques, patch embedding y merger espacial 2×2 |
| Parametros totales | 1.235.126.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (es un codificador visual, no un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; el autor no documenta cuantizaciones) |
| Idiomas soportados | No disponible (componente visual, sin capacidades lingüísticas) |
| Licencia | Tencent Hy License (license_name: tencent-hy-license), con términos comerciales adicionales |
| Formato de pesos | safetensors (`model.safetensors`) |

Especificaciones adicionales del componente:

| Parametro | Valor |
|---|---|
| Hidden size de vision | 1536 |
| Cabezas de atencion | 16 |
| Tamano de patch | 16 |
| Bloques transformer | 40 |
| Dimension de proyeccion del merger | 6144 |
| Tensores | 649 (BF16) |
| SHA-256 de `model.safetensors` | `3ea4256e1d4fdf0deed37a4147279a74481d14f867fd049b94f3f76c1b773254` |
| Tamano del repo | 2.5 GB |
| Modelo base | `tencent/Hy4` (revision `c10c0de5b6f850703fb0a90e65d1c32b558b9167`) |
| Pipeline | image-feature-extraction |

## Arquitectura y entrenamiento

El componente es la torre visual de Tencent Hy4, un ViT con patch size 16, hidden size 1536 y 16 cabezas de atención distribuido en 40 bloques transformer. Incluye el patch embedding, el merger espacial 2×2 que proyecta las características a 6144 dimensiones y el embedding nativo de salto de línea de imagen. La salida se ofrece en dos formas: `last_hidden_state` con las características por parche y `pooler_output` con los tokens proyectados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO, ya que la model card no lo detalla.

La extracción se realizó a partir del espejo oficial en ModelScope, verificando que los SHA-256 declarados por el proveedor coincidían para las ocho shards de origen. El autor indica que comparó las cabeceras safetensors de Hugging Face y del espejo byte a byte, así como los rangos seleccionados y los tensores resultantes, aunque no descargó ni hasheó de forma independiente las shards completas. La validación incluida es un smoke test en CPU con dos imágenes reales de COCO128, carga estricta de los 649 tensores y comprobación de que la atención explícita coincide con SDPA en las capas 0, 19 y 39. No se trata de una validación de equivalencia con el modelo completo ni de precisión downstream.

## Capacidades

- Extracción de características visuales a nivel de parche mediante `last_hidden_state`.
- Obtención de tokens visuales proyectados a 6144 dimensiones mediante `pooler_output`, incluyendo los embeddings nativos de salto de línea de imagen.
- Procesamiento de imágenes RGB con preprocesador propio (`load_processor`) que devuelve `pixel_values` y `image_grid_thw`.
- Integración como front-end visual dentro de arquitecturas multimodales que usen la implementación `HYV4VL`.
- Ejecución en CPU y GPU; el autor valida el forward en CPU con `float32`.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es un módulo puramente visual.
- No soporta `AutoModel` ni carga estándar de Transformers sin el wrapper `component.py` y la revisión fijada del código fuente.

## Casos de uso

- Extracción de embeddings visuales para búsqueda y recuperación de imágenes: el codificador produce características por parche y un vector pooled de 6144 dimensiones que puede indexarse en bases vectoriales para similitud visual.
- Preprocesamiento de imágenes en pipelines multimodales propios: si se dispone del modelo de lenguaje de Hy4 y del decodificador, este componente actúa como la etapa visual previa a la fusión con tokens de texto.
- Investigación sobre representaciones visuales: al estar aislado y con tensores originales preservados, permite analizar las activaciones de los 40 bloques y comparar la atención explícita con SDPA.
- Clasificación de imágenes por transferencia: usando `pooler_output` como entrada a una cabeza lineal ligera para tareas de clasificación o detección de atributos.
- Segmentación o agrupamiento espacial: las características por parche de `last_hidden_state` permiten clustering o segmentación débil sobre la rejilla de parches.
- Auditoría y reproducibilidad de modelos abiertos: la publicación documenta hashes, procedencia y script de validación, lo que facilita verificar la integridad del componente en entornos de investigación.
- Prototipado en CPU: con 1.235 millones de parámetros en BF16 y validación en CPU float32, sirve para pruebas de concepto sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta validación funcional (carga estricta de los 649 tensores, forward en CPU con dos imágenes COCO128 y coincidencia entre atención explícita y SDPA en las capas 0, 19 y 39), sin métricas de precisión, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 2,5 GB en BF16 (1.235 millones de parámetros × 2 bytes). En float32 la huella ronda los 4,9 GB. La memoria de activaciones depende de la resolución y del número de parches por imagen.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia en BF16 con imágenes de resolución moderada; una RTX 4090 o A100/H100 ofrecen margen amplio para lotes mayores.
- GPU de consumo: cabe en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, etc.) en BF16 o float16; en CPU funciona pero con latencia mayor.
- Despliegue: no es compatible con vLLM, TGI u Ollama, ya que no es un modelo de lenguaje. Requiere el wrapper `component.py` incluido y una revisión fijada de Transformers (`1097d1570e6208063fa49575bb2b6e756a50c2f6`), además de `torch`, `safetensors` y `Pillow`.
- Latencia y throughput: no disponibles. El autor solo confirma un smoke test en CPU float32; no se documentan tiempos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros codificadores visuales (por ejemplo, CLIP ViT, SigLIP o los encoders de otros modelos multimodales), ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo completo: no genera texto ni mantiene conversaciones; es únicamente un codificador visual con proyector.
- No es un checkpoint `AutoModel`: requiere el wrapper `component.py` y una revisión concreta del código fuente de Transformers, cuya instalación completa no fue probada de forma independiente por el autor.
- La validación es un smoke test en CPU, no una verificación de equivalencia con el modelo completo ni de precisión downstream.
- La procedencia se basa en el espejo de ModelScope, cuya rama `master` puede cambiar; el autor no descargó ni hasheó de forma independiente las shards completas.
- Licencia Tencent Hy License con términos comerciales adicionales: es imprescindible revisar `LICENSE` antes de cualquier uso comercial. Los ficheros de código de Transformers incluidos mantienen avisos Apache-2.0.
- Riesgo de sesgos y alucinación: no aplica directamente al no generar texto, pero las representaciones visuales heredan los sesgos del dataset de entrenamiento de Hy4, no documentado en esta ficha.
- Idiomas: no disponible; el componente no procesa texto.
- Advertencia de producción: al ser un componente extraído y con validación limitada, no se recomienda su uso en sistemas críticos sin una verificación propia de equivalencia y precisión.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/hy4-vision-encoder
- Modelo base: https://huggingface.co/tencent/Hy4
- Espejo oficial en ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- Revisión fijada de Transformers: https://github.com/huggingface/transformers.git@1097d1570e6208063fa49575bb2b6e756a50c2f6
- Ficheros de referencia citados en la model card: `LICENSE`, `LICENSE-APACHE-2.0`, `component.py`, `validation.json`, `validate_local_reference.py`, `mirror_comparison.json`, `extraction.json`, `native_source/source_manifest.json` (disponibles en el repositorio de Hugging Face).
