# FSCCS/Qwen3.5-4B-MMFlash

## Resumen

Qwen3.5-4B-MMFlash es un modelo borrador (*draft model*) para decodificación especulativa sobre el modelo multimodal Qwen/Qwen3.5-4B, desarrollado por FSCCS. No es un modelo de lenguaje autónomo: se empareja con el modelo objetivo dentro de un servidor de decodificación especulativa (SGLang con backend DFLASH) para acelerar la inferencia sobre entradas de imagen y texto. Su propósito es proponer bloques de tokens que el modelo objetivo verifica en un solo paso, reduciendo la latencia de generación en cargas de trabajo visión-lenguaje.

El modelo sigue la arquitectura DFlash de *block diffusion drafting*: lee estados ocultos de cinco capas del modelo objetivo y propone un bloque de 16 tokens en un único forward pass, que el target verifica también en un único forward pass. La innovación de MMFlash respecto a DFlash es el entrenamiento sobre datos multimodales con una pérdida ponderada por puntuaciones de *visual-grounding* (visual-KL) por token. Con 537 millones de parámetros y licencia Apache 2.0, está pensado para despliegues de producción que ya sirven Qwen3.5-4B y necesitan reducir la latencia sin cambiar el modelo generador.

Es relevante ahora porque la decodificación especulativa se ha consolidado como técnica estándar para abaratar inferencia, y hasta la fecha la mayoría de drafters publicados se centraban en texto puro. MMFlash traslada esa ventaja al dominio multimodal, donde el coste de prefill y verificación visual es especialmente alto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash block-diffusion draft (transformer lector de estados ocultos, propuesta de bloques de 16 tokens) |
| Parametros totales | 537.427.200 (537M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MMFlash hereda la arquitectura DFlash de *block diffusion drafting*. El borrador consume los estados ocultos de cinco capas del modelo objetivo Qwen3.5-4B y genera en un solo forward pass un bloque de 16 tokens candidatos; el modelo objetivo verifica ese bloque en un único forward pass, aceptando el prefijo correcto y corrigiendo el resto. Este esquema reduce el número de pasos secuenciales del decoding autorregresivo clásico, que es donde se concentra la latencia en modelos multimodales.

La diferencia respecto a DFlash es el régimen de entrenamiento: MMFlash se entrena sobre datos multimodales (imagen y texto) con una función de pérdida ponderada por puntuaciones de *visual-grounding* (visual-KL) calculadas por token. Es decir, los tokens con mayor dependencia de la información visual reciben un peso mayor en el ajuste del borrador, lo que debería mejorar la tasa de aceptación en tareas que requieren grounding sobre la imagen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (en un draft model esto sería inusual, pero no se documenta).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.5-4B, en modalidad imagen-texto y texto.
- Propuesta de bloques de 16 tokens por forward pass, verificados por el modelo objetivo.
- Aprovechamiento de estados ocultos de cinco capas del target para condicionar la propuesta.
- Entrenamiento específico para grounding visual, con ponderación por token según dependencia de la imagen.
- Integración con SGLang mediante el backend DFLASH.
- No soporta uso autónomo: no genera respuestas finales por sí mismo, no tiene tool calling propio ni capacidades de agente independientes.
- Capacidades multilingües: no disponibles (heredadas del target, pero no documentadas para el drafter).

## Casos de uso

- Aceleración de asistentes visuales en producción: desplegar Qwen3.5-4B con MMFlash en SGLang para reducir la latencia de respuestas sobre imágenes en aplicaciones de chat multimodal, manteniendo la calidad del modelo objetivo gracias a la verificación por bloque.
- Análisis de documentos escaneados y capturas: en pipelines de extracción de información donde el prefill visual domina el coste, el drafter reduce el número de pasos de decoding y mejora el throughput por GPU.
- Respuestas sobre gráficos y tablas (estilo MathVista): el entrenamiento con ponderación visual-KL está orientado a tokens dependientes de la imagen, lo que encaja con preguntas que requieren leer valores concretos del gráfico.
- Atención al cliente con soporte de imágenes: conversaciones multi-turno donde el usuario adjunta capturas o fotos; el drafter acelera la generación sin alterar el modelo que decide la respuesta.
- Servicios de accesibilidad (descripción de imágenes en tiempo real): la reducción de latencia por bloque hace viable la generación de descripciones en flujos interactivos.
- Evaluación comparativa de técnicas de speculative decoding: usar MMFlash como referencia reproducible para medir tasas de aceptación en cargas multimodales frente a drafters de texto.
- Despliegue en clústeres con SGLang: sustituir el decoding autorregresivo estándar de Qwen3.5-4B por el par target+drafter para aumentar tokens por segundo por nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del drafter: 537M parámetros en safetensors, aproximadamente 1,1 GB en precisión de entrenamiento (el tamaño del repo es de 1,1 GB); en fp16/bf16 rondaría 1,1 GB adicionales sobre el modelo objetivo.
- VRAM total: debe sumarse a la del target Qwen3.5-4B (no disponible el detalle exacto de su huella, pero un 4B en bf16 requiere del orden de 8 GB de pesos más caché KV).
- GPU recomendadas: la demo del autor se grabó en una NVIDIA H200 con SGLang; el drafter es pequeño y no impone requisitos propios de memoria más allá de los del target.
- GPU de consumo: el drafter por sí solo cabría en cualquier GPU consumer moderna; la viabilidad del conjunto depende de si el target Qwen3.5-4B cabe en la VRAM disponible (posible en RTX 4090 de 24 GB en bf16, no confirmado en la información).
- Opciones de despliegue: SGLang con backend DFLASH (soporte documentado). No se documentan vLLM, llama.cpp, Ollama ni TGI para este drafter.
- Latencia y throughput: no disponibles de forma numérica; el autor solo indica que la demo está grabada en tiempo real con decoding greedy en una H200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Uso |
|---|---|---|---|---|---|
| FSCCS/Qwen3.5-4B-MMFlash | 537M | no disponible | imagen-texto (drafter) | Apache 2.0 | Draft para Qwen3.5-4B en SGLang |
| DFlash (z-lab) | no disponible | no disponible | texto (drafter) | no disponible | Draft de bloques para modelos de texto |
| Drafters EAGLE / Medusa (genéricos) | variable | no disponible | texto | variable | Decodificación especulativa en texto |

No se dispone de datos de rendimiento comparativos entre MMFlash y otros drafters en la información proporcionada; la comparativa se limita a categoría y modalidad.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Qwen3.5-4B y un servidor SGLang con DFLASH; no puede usarse con vLLM, llama.cpp u otros runtimes sin adaptación.
- Solo sirve para su modelo objetivo exacto (Qwen/Qwen3.5-4B); no es portable a otros targets.
- La calidad final depende de la tasa de aceptación del bloque; si el borrador falla, el coste puede superar al decoding estándar.
- Riesgo de alucinación: aunque el target verifica cada bloque, un drafter mal calibrado puede degradar el throughput sin mejorar la calidad.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado más allá del target.
- Sesgos: no documentados; al heredar el comportamiento del target, arrastra los sesgos de Qwen3.5-4B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- Contexto máximo no especificado; no se puede planificar despliegue con ventanas largas sin validación empírica.
- El repo tiene pocas descargas (243) y likes (2); madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/FSCCS/Qwen3.5-4B-MMFlash
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper (arXiv 2611.18482): https://huggingface.co/papers/2611.18482
- Project page: https://fscdc.github.io/MMFlash/
- Código: https://github.com/fscdc/MMFlash
- DFlash (z-lab): https://github.com/z-lab/dflash
- Demo (vídeo): https://huggingface.co/FSCCS/Qwen3.5-4B-MMFlash/resolve/main/assets/demo.mp4
