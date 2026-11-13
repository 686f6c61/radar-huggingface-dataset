# mrminjae/qwen3p6-35b-a3b-2p10bit-r151-lowbit

## Resumen

Qwen3.6-35B-A3B (2.10-bit, r151) es un checkpoint de investigación derivado del modelo Qwen/Qwen3.6-35B-A3B, publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización extrema de los expertos enrutados de un modelo MoE: los expertos quedan almacenados en un promedio de 2,10 bits con un kernel de bajo bit propio, mientras que el resto de pesos se mantienen en BF16. El objetivo es reducir drásticamente el peso en disco y en memoria de un modelo de 35B parámetros totales con activación de 3B, manteniendo la fidelidad del resto de la red.

El modelo hereda la arquitectura y las capacidades del base: un transformer de tipo mixture-of-experts con etiqueta `qwen3_5_moe` en transformers, pipeline de `image-text-to-text` y `text-generation`, lo que indica soporte multimodal de imagen y texto además de generación conversacional. El repositorio ocupa 14,6 GB, un tamaño compatible con el empaquetado de bajo bit de los expertos descrito en la model card.

La relevancia de este checkpoint es doble: por un lado, explora los límites prácticos de la cuantización sub-3-bit en modelos MoE, un área activa de investigación para el despliegue en hardware limitado; por otro, al ser un checkpoint interno de investigación sin resultados publicados ni licencia explícita, su uso en producción requiere validación propia. No dispone de descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), etiqueta `qwen3_5_moe` en transformers; multimodal image-text-to-text |
| Parametros totales | 35B (según el nombre del modelo base) |
| Parametros activos | 3B (según el nombre del modelo base, sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits en promedio, almacenados empaquetados con kernel de bajo bit propio; resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | no disponible (repositorio de 14,6 GB, librería transformers; no se detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 35B parámetros totales y aproximadamente 3B activos por token, según la nomenclatura del nombre. La variante publicada no reentrena el modelo: aplica una cuantización selectiva sobre los expertos enrutados, dejándolos en un promedio de 2,10 bits y almacenados de forma empaquetada mediante un kernel de bajo bit personalizado. El resto de los pesos (atención, embeddings, capas densas y posiblemente el router) permanece en BF16, lo que preserva la precisión de las partes más sensibles a la cuantización.

La model card no documenta el proceso de calibración, el dataset utilizado para la cuantización ni el error de reconstrucción introducido. Tampoco se especifican detalles del entrenamiento original del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal. Toda esa información debe consultarse en la model card oficial de Qwen/Qwen3.6-35B-A3B, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), lo que sugiere capacidades de visión y descripción de imágenes.
- Razonamiento y matemáticas: presumiblemente heredadas del base, aunque sin benchmarks publicados para esta variante.
- Generación de código: presumiblemente heredada del base, sin validación específica en esta cuantización.
- Soporte de tool calling y function calling: no confirmado en la información disponible; depende de las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Investigación en cuantización de modelos MoE: el checkpoint permite estudiar el impacto de 2,10 bits en los expertos enrutados sobre la calidad de salida, comparando contra el modelo base en BF16 con el mismo prompt y configuración de muestreo.
- Despliegue en hardware con VRAM limitada: con 14,6 GB de pesos, el modelo puede cargarse en GPUs de consumo de gama alta (24 GB) o en configuraciones multi-GPU pequeñas, algo inviable con el base en BF16. Adecuado para prototipos y pruebas de concepto.
- Evaluación de kernels de bajo bit: sirve como banco de pruebas para validar el kernel personalizado de expertos empaquetados en entornos transformers y medir latencia y throughput frente a alternativas como GPTQ o AWQ.
- Experimentación multimodal en local: al conservar el pipeline image-text-to-text, permite probar tareas de descripción de imágenes y preguntas sobre imágenes en una máquina de un solo usuario, con la advertencia de validar la degradación por cuantización.
- Generación de texto conversacional en entornos de investigación: útil para estudiar la degradación de coherencia en diálogos multi-turno cuando los expertos están fuertemente cuantizados.
- Comparación de pipelines de inferencia: al ser compatible con transformers y endpoints, permite medir diferencias de rendimiento entre backends (transformers nativo, vLLM si el kernel lo soporta) sobre un mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 14,6 GB en el repositorio; en carga se debe sumar el overhead de activaciones, KV cache y buffers del kernel. Estimación orientativa: 18-22 GB para contexto corto, más para contextos largos (no confirmado por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue con contexto amplio; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia con contexto moderado.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB como RTX 4090, RTX 3090 o RTX 4080 Super (16 GB) con contexto muy limitado y posible offload.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada y depende de que el kernel de bajo bit personalizado esté integrado en cada backend.
- Latencia y throughput estimados: no disponibles. El rendimiento real depende de la implementación del kernel de expertos empaquetados y de si el backend soporta la cuantización de forma nativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r151-lowbit | 35B totales / 3B activos | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | BF16 | no disponible en esta ficha | Hugging Face (modelo oficial) |
| Alternativas de cuantización estándar (GPTQ/AWQ 4-bit del mismo base) | 35B totales / 3B activos | no disponible | 4 bits | según base | no disponible en esta ficha |

La comparativa se limita al modelo base y a esquemas de cuantización estándar, ya que no se dispone de datos de rendimiento ni de otros checkpoints de bajo bit comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la model card lo describe explícitamente como "internal research checkpoint", sin validación pública ni benchmarks.
- Cuantización extrema: 2,10 bits en los expertos enrutados puede degradar la calidad de forma significativa en tareas de razonamiento, código y matemáticas; se recomienda evaluar contra el base antes de cualquier uso.
- Kernel personalizado: el empaquetado de bajo bit requiere un kernel específico; la compatibilidad con backends estándar (vLLM, llama.cpp, TGI) no está confirmada y puede fallar o ser lenta.
- Licencia no disponible: la model card indica que sigue la licencia del base, pero no se especifica; no se puede confirmar el uso comercial.
- Idiomas no documentados: no se puede garantizar el rendimiento multilingüe ni en castellano.
- Riesgo de alucinación: no evaluado en esta variante; la cuantización puede aumentar la tasa de errores factuales.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentación externa.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r151-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
