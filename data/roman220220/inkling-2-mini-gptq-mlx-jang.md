# roman220220/Inkling-2-Mini-gptq-mlx-jang

## Resumen

Inkling 2 Mini GPTQ JANG 8/3 (MLX) es una cuantización del modelo `thinkingmachines/Inkling-2-Mini`, un transformer de mezcla de expertos (MoE) de 26.400 millones de parámetros con 3.400 millones activos por token, desarrollado por Thinking Machines Lab. Esta versión, publicada por el usuario `roman220220`, aplica GPTQ con una receta de bits por componente sobre la rejilla afín de MLX para reducir el peso de 19,5 GB (release en NVFP4) a 13,1 GB, manteniendo la torre de visión en bf16 y añadiendo el borrador DSpark para decodificación especulativa.

El modelo base incorpora una innovación estructural relevante: un tramo central "en bucle" (capas 6 a 17 que se ejecutan tres veces compartiendo pesos) y una torre de visión, lo que lo sitúa en la categoría de modelos multimodales imagen-texto con razonamiento multi-paso. La cuantización está pensada para ejecución local en Apple Silicon mediante MLX, con un fork específico de `mlx-lm` que implementa la decodificación especulativa de Inkling 2 (la versión estándar de `mlx-lm` no soporta este modelo).

La relevancia práctica es doble: por un lado, permite ejecutar un MoE multimodal de 26 B en hardware de consumo Apple con aproximadamente 14 GB de memoria GPU; por otro, documenta con mediciones reproducibles el coste de la cuantización (incremento de perplejidad del 3,4 % en texto y 2,4 % en código frente al release), lo que facilita evaluar el compromiso calidad/tamaño antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tramo central en bucle (capas 6-17 ejecutadas 3 veces con pesos compartidos) y torre de visión |
| Parametros totales | 26.706.454.912 (26,4 B) |
| Parametros activos | 3,4 B por token (128 expertos enrutados por capa, 8 activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con receta por componente: atención 8 bits, expertos enrutados 3 bits, router/sinks/gates en bf16/fp32, embeddings y cabeza de salida 8 bits, torre de visión bf16, borrador DSpark 8 bits (grupo 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizado GPTQ; borrador DSpark en `model-mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos enrutados por capa (8 activos por token) y un tramo intermedio en bucle: las capas 6 a 17 se ejecutan tres veces compartiendo un único conjunto de pesos, lo que incrementa la profundidad efectiva sin aumentar el recuento de parámetros. Incorpora además una torre de visión que procesa imágenes junto al texto, y un mecanismo de "attention sinks" y compuertas de mensaje del bucle que se mantienen en bf16/fp32 en esta cuantización. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

La cuantización de esta ficha se calibró con 128 fragmentos de 512 tokens (mitad wikitext-2 de entrenamiento y mitad código fuente Python), capa por capa, sobre una A100 en 12 minutos, aplicando compensación de error de Hessian sobre la rejilla afín de MLX. Cada experto enrutado se calibró con los tokens que el router le asigna. Las capas en bucle se calibraron sobre las entradas de la primera pasada, y las capas posteriores al bucle sobre la salida de las capas cuantizadas. Los archivos MLX conservan los códigos, escalas y sesgos propios de GPTQ en lugar de recuantizar (la recuantización de MLX habría alterado el 18,8 % de las palabras de código empaquetadas). El release incluye un borrador DSpark de tres capas densas pequeñas que propone siete tokens en una pasada a partir de los estados ocultos del modelo, más una cabeza recurrente que los encadena.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas (capacidades heredadas del modelo base; sin benchmarks re-ejecutados en esta cuantización).
- Generación de código: la calibración incluyó código Python y las mediciones de perplejidad se hicieron sobre la biblioteca estándar de Python.
- Comprensión de imágenes (pipeline `image-text-to-text`): la torre de visión en bf16 alcanza coseno 0,9988 frente a HF transformers en la media de tokens de imagen.
- Decodificación especulativa mediante el borrador DSpark incluido (`model-mtp.safetensors`, 342 MB), con verificación en una pasada y conservación del prefijo correcto más largo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el tramo en bucle sugiere capacidad de cómputo iterativo, pero no se documenta explícitamente).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional local en macOS: el modelo se ejecuta con LLMTray o `mlx_lm.server` (API compatible con OpenAI) consumiendo unos 14 GB de memoria GPU en Apple Silicon, sin que los datos salgan del equipo; adecuado para chat privado con imágenes adjuntas.
- Descripción y análisis de imágenes en local: la torre de visión en bf16 permite tareas de captioning y respuesta a preguntas visuales (el autor verifica la descripción correcta de una imagen de prueba) sin depender de servicios en la nube.
- Generación de código en estación de trabajo: con perplejidad de 2,526 sobre la biblioteca estándar de Python, es viable para autocompletado y generación de funciones (por ejemplo, parseo de fechas ISO-8601, caso del ejemplo de uso) en entornos de desarrollo con Apple Silicon.
- Aceleración de inferencia interactiva: el borrador DSpark logra 1,80 tokens por paso de verificación en wikitext-2 y 3,63 en código Python en modo greedy, lo que reduce la latencia percibida en generación de código, donde la tasa de aceptación es mayor.
- Prototipado de pipelines multimodales: al exponer una API compatible con OpenAI vía `mlx_lm.server`, se puede integrar en aplicaciones existentes que esperan ese contrato sin reescribir el cliente.
- Evaluación de compromiso calidad/tamaño: los datos de perplejidad publicados (+3,4 % texto, +2,4 % código frente al release NVFP4) permiten decidir si la reducción de 19,5 GB a 13,1 GB compensa en un despliegue concreto.
- Investigación sobre cuantización extrema de MoE: la receta por componente y el pipeline reproducible (`rromenskyi/quant-ternary`, `inkling2-quant/`) sirven como referencia metodológica para cuantizar modelos con capas en bucle y torres de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el autor indica explícitamente que los benchmarks de la model card del modelo base son de Thinking Machines y no se re-ejecutaron sobre esta cuantización. Las únicas mediciones publicadas son de perplejidad y de decodificación especulativa:

| Metrica | Release (HF transformers, NVFP4) | Esta cuantizacion (MLX) | Variacion |
|---|---|---|---|
| Tamano | 19,5 GB | 13,1 GB | -32,8 % |
| Perplejidad texto (wikitext-2 test, 40 x 512 tokens) | 8,985 | 9,292 | +3,4 % |
| Perplejidad codigo (biblioteca estandar Python) | 2,466 | 2,526 | +2,4 % |

| Metrica de decodificacion especulativa (greedy, 7 borradores) | Valor |
|---|---|
| Tokens por paso de verificacion en wikitext-2 test | 1,80 |
| Tokens por paso de verificacion en biblioteca estandar Python | 3,63 |
| Similitud de caracteristicas de vision vs HF transformers (coseno medio) | 0,9988 |

El autor indica que la velocidad y el consumo de memoria en Mac no se han medido todavía para este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 GB de memoria GPU en Apple Silicon, más la caché de prompt.
- GPU recomendadas: Apple Silicon (requisito de MLX); el pipeline de cuantización se ejecutó en una A100, pero la inferencia de esta release está orientada a Mac.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada (14 GB para pesos y caché); no está pensado para GPUs NVIDIA de consumo en este formato.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.server` mediante el fork `ipsupport-llc/mlx-lm` (obligatorio: la versión estándar de `mlx-lm` no soporta Inkling 2); aplicación LLMTray para macOS con API compatible con OpenAI.
- Latencia y throughput: no medidos en Mac según el autor; la decodificación especulativa aporta 1,80 tokens por paso en texto y 3,63 en código, con selección adaptativa de 0 a 7 borradores por paso según lo que resulte más rápido en cada momento.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (release original, NVFP4) | 26,4 B | 3,4 B | no disponible | Apache 2.0 | safetensors, HF transformers (19,5 GB) |
| Esta cuantizacion (GPTQ JANG 8/3, MLX) | 26,4 B | 3,4 B | no disponible | Apache 2.0 | safetensors MLX (13,1 GB) |
| Alternativas de tamano y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos de la misma categoría (MoE multimodal de ~26 B con licencia Apache 2.0) con los que establecer una comparación cuantitativa; los únicos datos de referencia son los del release original del propio modelo base.

## Limitaciones y advertencias

- La cuantización introduce una pérdida medible de calidad: +3,4 % de perplejidad en texto y +2,4 % en código frente al release NVFP4; no debe asumirse equivalencia con el modelo original.
- Los benchmarks de la model card del modelo base no se re-ejecutaron sobre esta cuantización, por lo que el rendimiento en tareas concretas (razonamiento, matemáticas, visión compleja) no está verificado.
- En bf16, un paso de verificación sobre varios tokens redondea de forma ligeramente distinta a los pasos individuales; en caso de empate casi exacto, la salida greedy puede diferir de la decodificación simple (el autor documenta un caso con logits 29,30 frente a 29,25).
- Requiere un fork específico de `mlx-lm`; la versión estándar no soporta Inkling 2, lo que añade una dependencia de mantenimiento externo.
- La velocidad y el consumo de memoria en Mac no están medidos, así que las expectativas de latencia en producción no están respaldadas por datos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.
- Sesgos conocidos, riesgos de alucinación y limitaciones idiomáticas: no disponibles en la información proporcionada; el autor remite a la model card del modelo base, cuyas limitaciones aplican sin cambios.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución y las condiciones de la licencia; verificar la licencia del modelo base por si impone términos adicionales.
- El modelo tiene 0 descargas, por lo que no hay evidencia pública de estabilidad en despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roman220220/Inkling-2-Mini-gptq-mlx-jang
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del pipeline de cuantización: https://github.com/rromenskyi/quant-ternary
- Fork de mlx-lm con soporte de Inkling 2: https://github.com/ipsupport-llc/mlx-lm
- LLMTray (app macOS): https://www.ipsupport.us/llmtray/
- Releases de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- GitHub de LLMTray: https://github.com/ipsupport-llc/llmtray
- IPSupport: https://www.ipsupport.us
