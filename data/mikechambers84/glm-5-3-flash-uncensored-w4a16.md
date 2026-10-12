# mikechambers84/GLM-5.3-Flash-Uncensored-W4A16

## Resumen
GLM-5.3-Flash-Uncensored-W4A16 es una compilación cuantizada del checkpoint GLM-5.3-Flash-Uncensored-FP8, a su vez una versión "abliterated" (con los mecanismos de rechazo eliminados) del modelo GLM-5.3-Flash de Z.ai. Lo publica el usuario mikechambers84 en Hugging Face y su valor principal es el tamaño: reduce el repositorio de los 306 GiB del original en FP8 a unos 179 GiB, manteniendo intactos todos los tensores que no son expertos MoE enrutados.

El modelo es un transformer MoE híbrido de 321.323.031.390 parámetros, con 288 expertos enrutados con top-8, atención lineal KDA en 34 capas y atención dispersa MLA en 11, además de una capa MTP para decodificación especulativa. Soporta entrada de imagen y vídeo (image-text-to-text), function calling y modo de razonamiento, con una ventana de contexto declarada de 1 millón de tokens y soporte de inglés y chino.

Es relevante ahora porque demuestra una vía práctica de servir un modelo de clase 300B en hardware más asequible: al cuantizar solo los expertos enrutados a INT4 y dejar el resto en FP8/BF16, se preserva la precisión de las partes sensibles (atención, enrutadores, torre de visión) mientras se recorta el grueso del peso. La licencia MIT y la compatibilidad con endpoints lo hacen atractivo para despliegues self-hosted, aunque su naturaleza "uncensored" exige controles de seguridad externos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 34 capas de atención lineal KDA, 11 capas de atención dispersa MLA (más la capa MTP), 42 capas MoE con 288 expertos enrutados top-8, expertos compartidos, hyper-connections residuales mHC 4-wide |
| Parámetros totales | 321.323.031.390 (~321,3 B) |
| Parámetros activos | no disponible (se conoce el enrutamiento top-8 sobre 288 expertos, pero no el recuento exacto de parámetros activos) |
| Longitud de contexto | 1.000.000 tokens (1M, según los distintivos de la model card) |
| Tipos de cuantización | Expertos enrutados: INT4 simétrico, grupo de 32, escalas BF16 (W4A16). Expertos compartidos, MLP densas (capas 0-2) y proyecciones MLA: FP8 e4m3 con escalas de bloque 128x128. Resto: BF16/FP32 sin cambios |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (mixed-precision, dos grupos de configuración: `pack-quantized` y `float-quantized`) |

## Arquitectura y entrenamiento
La arquitectura combina dos mecanismos de atención: 34 capas de atención lineal KDA (`self_attn.*`, almacenadas en BF16) y 11 capas de atención dispersa MLA (`q_a_proj`, `q_b_proj`, `kv_a_proj_with_mqa`, `o_proj`, mantenidas en FP8 e4m3 con escalas de bloque 128x128, más `kv_b_proj` en BF16). El componente MoE ocupa 42 capas más la capa MTP, con 288 expertos por capa y enrutamiento top-8, más expertos compartidos y tres MLP densas en las capas 0, 1 y 2. Incorpora un indexador de atención dispersa, hyper-connections residuales mHC 4-wide y proyecciones MTP (`eh_proj`, `enorm`, `hnorm`, `shared_head`) para decodificación especulativa. Los embeddings y el `lm_head` están desacoplados (untied).

Sobre el entrenamiento del modelo base no se aportan datos en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es el proceso de cuantización de este checkpoint: es data-free, con redondeo al más cercano (round-to-nearest) y sin datos de calibración, sin GPTQ ni AWQ. Cada peso FP8 se descompone primero con sus escalas de bloque 128x128 en FP32; después se aplica `q × scale` con `q` en [-8, 7]. Para cada grupo de 32 pesos la escala se elige con un observador MSE similar al de llm-compressor: se reduce el máximo absoluto del grupo entre un 0 % y un 19 % en pasos del 1 % y se conserva la escala con el menor Σ|error|^2.4, deteniéndose tras 5 pasos sin mejora. Las activaciones de los expertos son de 16 bits (cuantización solo de pesos) y el checkpoint no define ninguna cuantización de la caché KV.

## Capacidades
- Generación de texto conversacional en inglés y chino.
- Razonamiento multi-paso, con soporte declarado de "reasoning" y modo de pensamiento.
- Vision-language e image-text-to-text: incluye torre de visión (`visual.*`, BF16, 1,1 GiB) y los distintivos de la model card anuncian soporte de visión y vídeo.
- Function calling y tool calling, con la etiqueta `function-calling` y compatibilidad con endpoints (`endpoints_compatible`).
- Uso como agente: apto para flujos multi-paso con herramientas gracias al contexto de 1M tokens.
- Decodificación especulativa mediante la capa MTP, que permite acelerar la generación.
- Capacidad de procesamiento de contextos muy largos (1M tokens) en una sola pasada.
- Modelo "abliterated"/uncensored: los mecanismos de rechazo están eliminados deliberadamente, orientado a red teaming e investigación en seguridad de IA.

## Casos de uso
- Red teaming y auditoría de seguridad: al haber sido abliterado, responde sin negativas, lo que lo hace útil para generar casos adversarios y evaluar la robustez de filtros y moderadores de contenido antes de desplegarlos.
- Investigación sobre alineación y comportamiento de rechazo: permite estudiar experimentalmente qué información se codifica en las direcciones de rechazo y cómo afecta la eliminación de estas al resto de capacidades del modelo.
- Análisis de documentación técnica extensa: con 1M tokens de contexto puede ingerir manuales completos, normativas o expedientes enteros y responder preguntas cruzadas sin fragmentación.
- Revisión de bases de código grandes: la ventana de 1M tokens permite cargar módulos completos de un repositorio y pedir refactorizaciones o detección de vulnerabilidades con visión global del proyecto.
- Agentes autónomos con herramientas: el soporte de function calling y su contexto largo lo hacen adecuado para orquestar flujos multi-paso que consultan APIs, bases de datos y sistemas internos.
- Asistencia multilingüe en/zh: atención al cliente o soporte técnico bilingüe para mercados chino y angloparlante, con conversaciones multi-turno que mantienen el hilo durante miles de tokens.
- Análisis de vídeo e imagen: dado el componente de visión, sirve para descripción automática de material audiovisual, moderación asistida o extracción de información estructurada a partir de fotogramas.
- Generación de contenido sin restricciones para ficción y guiones: escritura creativa en dominios donde los modelos alineados suelen bloquear temáticas adultas o violentas, siempre que se cumplan los requisitos legales aplicables.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Peso en disco de los pesos: ~179 GiB con el esquema W4A16, frente a los 306 GiB del checkpoint FP8 de origen y los 192 GB del repositorio.
- VRAM estimada para inferencia: como mínimo unos 200-220 GiB contando pesos, activaciones y caché KV a contexto largo; el checkpoint no define cuantización de KV, por lo que la caché se gestiona en 16 bits (estimación, no dato del autor).
- GPU recomendadas: 4× H100 80 GB (320 GB) o 2× H200 141 GB (282 GB) para servir el modelo completo.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo ni en su configuración más agresiva documentada; 8× RTX 4090 (192 GB) queda por debajo del umbral recomendado y sería inviable en la práctica.
- Opciones de despliegue: vLLM, ya que su modelo GLM-5-Next desquantiza las proyecciones MLA en FP8 a 16 bits en tiempo de carga; el formato compressed-tensors es el esperado por ese runtime. Para llama.cpp, Ollama o TGI no hay confirmación en la información disponible (no se publican pesos GGUF de este checkpoint).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mikechambers84/GLM-5.3-Flash-Uncensored-W4A16 | 321,3 B | 1M | W4A16 en expertos + FP8/BF16 mixto, ~179 GiB | MIT | Hugging Face, 11 descargas, 0 likes |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | no disponible | 1M | Bloque FP8 (checkpoint de origen) | MIT (según la model card citada) | Hugging Face |
| zai-org/GLM-5.3-Flash (base) | no disponible | 1M | no disponible | no disponible | Hugging Face |
| Anbeeld/GLM-5.3-Flash-DFlash2-GGUF | no disponible | no disponible | GGUF | no disponible | Hugging Face |
| incoai/GLM-5.3-Flash-DFlash2 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias
- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede producir contenido dañino, ilegal o inseguro sin filtros propios. No debe exponerse a usuarios finales sin una capa de moderación externa.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar datos, referencias o resultados; el contexto de 1M tokens no elimina este problema y puede incluso facilitar respuestas que mezclan información de partes distantes del contexto.
- La cuantización es data-free (round-to-nearest sin calibración), lo que implica que no hay garantía de que la degradación de calidad respecto al checkpoint FP8 sea mínima; el autor no publica evaluaciones comparativas.
- Idiomas limitados a en y zh: no hay soporte declarado para español ni para otras lenguas, lo que degrada el rendimiento en castellano.
- El checkpoint no define cuantización de la caché KV, de modo que el coste de memoria a contexto largo (hasta 1M tokens) recae íntegramente en el despliegue.
- La licencia MIT permite uso comercial y modificación, pero no exime de responsabilidad legal por el contenido generado; el usuario asume el cumplimiento normativo.
- Señales de validación muy débiles: 11 descargas, 0 likes y creación y actualización el mismo día, lo que sugiere que el checkpoint no ha sido probado ampliamente por la comunidad.
- No hay datos publicados sobre sesgos, evaluación de seguridad ni comportamiento en dominios sensibles.
- La procedencia del ajuste "uncensored" (método concreto de abliteración, dataset usado) no se documenta en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/mikechambers84/GLM-5.3-Flash-Uncensored-W4A16
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint FP8 de origen: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Lista de fine-tunes del modelo base: https://huggingface.co/models?other=base_model%3Afinetune%3Azai-org%2FGLM-5.3-Flash
- Lista de modelos con function calling en Hugging Face: https://huggingface.co/models?other=function-calling&p=95&sort=trending
- Variante GGUF comunitaria: https://huggingface.co/Anbeeld/GLM-5.3-Flash-DFlash2-GGUF
- Repositorio compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- OrcaRouter (sitio citado en la model card): https://www.orcarouter.ai
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
