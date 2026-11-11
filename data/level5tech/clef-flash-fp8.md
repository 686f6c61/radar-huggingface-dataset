# Level5Tech/clef-flash-FP8

## Resumen

clef-flash-FP8 es una compilación cuantizada en FP8 (W8A8) del modelo Cloudflare/clef-flash, un modelo de 9B parámetros desarrollado por Cloudflare. La cuantización ha sido realizada por Level5Tech (Aleks Blagojevich y Trevor Sunderland) con la herramienta llm-compressor y está optimizada para su despliegue en vLLM. No se trata de un lanzamiento oficial de Cloudflare, sino de un artefacto derivado con fines de evaluación comparativa de cuantizaciones.

El modelo conserva en BF16 componentes críticos para el rendimiento: la cabeza de esquema conjunta (joint schema head), la torre de visión, las capas de normalización y las proyecciones de puerta del mecanismo Gated DeltaNet. Esta decisión de diseño busca preservar la precisión en partes sensibles del modelo mientras se reduce el coste computacional y de memoria en las capas lineales.

Con 9.409.813.744 parámetros totales y un repositorio de 12,2 GB, el modelo se posiciona en la gama de 9B, adecuado para despliegue en GPUs de gama alta y potencialmente en consumer de gama alta con cuantizaciones adicionales. Su relevancia actual radica en que forma parte de un estudio sistemático de cuantización ("The Noise Floor of a Quantization Comparison") que publica recetas y mediciones por registro, lo que permite evaluar el impacto real de FP8 frente a otras precisiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (según referencias del README a proyecciones de puerta) y torre de visión |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 W8A8 (pesos y activaciones en FP8); componentes selectivos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Cloudflare/clef-flash combina un transformer con mecanismos de atención lineal tipo Gated DeltaNet, tal como se deduce de la mención explícita a las "Gated DeltaNet gate projections" que se mantienen en BF16 en esta cuantización. Además, incorpora una torre de visión y una "joint schema head", lo que sugiere capacidades multimodales (texto e imagen) y posiblemente un cabezal especializado para salidas estructuradas o esquemas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta ficha es la receta de cuantización: se aplica FP8 W8A8 a las capas lineales mediante llm-compressor, pero se preservan en BF16 la cabeza de esquema conjunta, la torre de visión, las normas y las proyecciones de puerta de Gated DeltaNet. Esta estrategia de cuantización selectiva busca minimizar la degradación en componentes sensibles, especialmente en tareas multimodales y de razonamiento estructurado. Las recetas completas y las mediciones por registro están disponibles en el repositorio de GitHub del proyecto.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base de 9B.
- Procesamiento de visión: la torre de visión se mantiene en BF16, por lo que se conservan las capacidades multimodales del modelo original.
- Salidas estructuradas: la joint schema head en BF16 sugiere soporte para generación con esquemas o formatos predefinidos.
- Razonamiento multi-paso y agentes: presumiblemente soportado por el modelo base, aunque no se detalla en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Evaluación comparativa de cuantizaciones: el modelo sirve como artefacto de referencia en el estudio "The Noise Floor of a Quantization Comparison", permitiendo a investigadores medir la degradación de FP8 frente a BF16 en tareas de texto y visión con las recetas publicadas.
- Despliegue en producción con vLLM: al estar construido específicamente para vLLM, se puede integrar en pipelines de inferencia de alta concurrencia donde el ahorro de memoria de FP8 permite servir más réplicas por GPU.
- Asistentes multimodales con salidas estructuradas: gracias a la torre de visión y la joint schema head en BF16, es adecuado para tareas como extracción de información de imágenes a JSON o formularios.
- Análisis de documentos con imágenes: el modelo puede procesar capturas, diagramas o documentos escaneados y generar descripciones o datos estructurados, manteniendo la precisión de la torre de visión.
- Investigación en eficiencia de modelos: como parte de un benchmark abierto con recetas y mediciones, es útil para estudiar el impacto de la cuantización selectiva en arquitecturas híbridas con Gated DeltaNet.
- Prototipado de agentes con contexto multimodal: aunque no se detalla la ventana de contexto, el modelo base de 9B y la preservación de componentes críticos lo hacen apto para experimentar con agentes que combinan texto e imagen en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub del proyecto (clef-quant-bench) contiene mediciones y salidas por registro, pero no se han incluido cifras concretas en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 10-12 GB para los pesos (9,4B parámetros a 1 byte por parámetro) más overhead de activaciones y caché KV; se recomienda un mínimo de 16-24 GB para contexto moderado.
- GPU recomendadas: NVIDIA H100, A100 (80 GB), L40S y GPUs con soporte nativo de FP8 (arquitectura Hopper o Ada Lovelace). Para FP8 W8A8 en vLLM se requiere compute capability 8.9 o superior.
- ¿Cabe en consumer GPU? Sí, en GPUs como RTX 4090 (24 GB) o RTX 4080 (16 GB) con contexto limitado; en RTX 3090 (24 GB) probablemente sea necesario reducir la longitud de contexto o usar cuantizaciones adicionales.
- Opciones de despliegue: vLLM es el destino principal (formato compressed-tensors). No se mencionan llama.cpp, Ollama ni TGI, y el formato FP8 W8A8 no es directamente compatible con llama.cpp sin conversión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-flash-FP8 (este) | 9,4B | no disponible | FP8 W8A8 | Apache-2.0 | Hugging Face |
| Cloudflare/clef-flash (base) | 9B (aprox.) | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Alternativas de 9B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos alternativos de la misma categoría (por ejemplo, Qwen, Llama o Mistral de tamaño similar) en términos de rendimiento, ya que no se han publicado benchmarks en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Cloudflare: los pesos han sido modificados mediante cuantización y el autor lo indica explícitamente en el NOTICE.
- La cuantización FP8 puede introducir degradación en tareas sensibles, aunque se mitiga manteniendo en BF16 la torre de visión, las normas, la joint schema head y las proyecciones de Gated DeltaNet.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el LICENSE y el NOTICE de modificación incluidos en el repositorio.
- El formato compressed-tensors y la orientación a vLLM limitan la portabilidad a otros motores de inferencia sin conversión adicional.
- No se especifica la longitud de contexto soportada, lo que impide garantizar su comportamiento en aplicaciones que requieran ventanas largas.
- Al ser un modelo derivado con 0 descargas y 0 likes en el momento de la consulta, no hay validación comunitaria ni reportes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Level5Tech/clef-flash-FP8
- Repositorio de benchmarks y recetas: https://github.com/Level5Tech/clef-quant-bench
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
