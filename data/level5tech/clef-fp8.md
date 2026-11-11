# Level5Tech/clef-FP8

## Resumen

clef-FP8 es una versión cuantizada en FP8 (W8A8) del modelo Clef de Cloudflare, un modelo de 27.356.728.560 parámetros (aproximadamente 27B) publicado por Level5Tech. La cuantización se ha realizado con llm-compressor y está optimizada para su despliegue en vLLM. No se trata de una release oficial de Cloudflare, sino de una build de terceros creada para el trabajo "The Noise Floor of a Quantization Comparison" de Aleks Blagojevich y Trevor Sunderland (Level5).

El modelo base, Cloudflare/clef, emplea una arquitectura etiquetada como qwen3_5 en Hugging Face, e incorpora componentes poco habituales: una cabeza de esquema conjunta (joint schema head), un torre de visión (vision tower) y proyecciones de compuerta Gated DeltaNet. La receta de cuantización preserva explícitamente estos componentes en BF16, cuantizando únicamente las capas lineales principales en FP8.

Su relevancia radica en que permite ejecutar un modelo multimodal de 27B con pesos de 8 bits en infraestructura de inferencia estándar (vLLM), reduciendo el footprint de memoria respecto a la versión BF16 a cambio de una posible degradación de calidad que el propio repositorio de benchmarks del autor documenta registro a registro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con vision tower, joint schema head y Gated DeltaNet (tag qwen3_5) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 (pesos y activaciones); vision tower, norms, joint schema head y compuertas Gated DeltaNet en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los componentes citados en la model card. El modelo base Cloudflare/clef se etiqueta con la arquitectura qwen3_5, lo que sugiere una familia derivada de Qwen 3.5, e incluye un torre de visión, lo que lo convierte en un modelo multimodal. También incorpora una "joint schema head" y proyecciones de compuerta Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que aparece en arquitecturas híbridas recientes.

Esta build concreta no ha sido reentrenada: es una cuantización post-entrenamiento FP8 W8A8 generada con llm-compressor para vLLM. La receta mantiene en BF16 la torre de visión, las normas, la joint schema head y las proyecciones de compuerta de Gated DeltaNet, y cuantiza el resto de matrices lineales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento en un modelo de aproximadamente 27B parámetros.
- Procesamiento de visión: el modelo base incluye un torre de visión, preservado en BF16 en esta build.
- Soporte de una joint schema head, componente estructural del modelo base cuyo propósito concreto no se detalla en la información disponible.
- Arquitectura con Gated DeltaNet, orientada a eficiencia en secuencias largas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal de 27B en vLLM con pesos FP8: permite servir el modelo en una GPU de 80 GB con margen para KV cache, algo ajustado en BF16. Adecuado para entornos de producción que ya usan el stack de vLLM.
- Evaluación de cuantización: el repositorio clef-quant-bench del autor publica mediciones y salidas por registro, lo que permite comparar la degradación de calidad de FP8 frente a BF16 en tareas concretas antes de adoptar la build en producción.
- Prototipado de pipelines visión-lenguaje: al conservar la torre de visión en BF16, se puede usar para tareas de descripción de imágenes o extracción de información de documentos sin reentrenar.
- Investigación sobre arquitecturas híbridas: la presencia de Gated DeltaNet y una joint schema head lo hace útil para estudiar el comportamiento de estos componentes bajo cuantización de 8 bits.
- Benchmarking reproducido: sirve como referencia para comparar recetas de cuantización (FP8 frente a otras) sobre un mismo modelo base, usando las recetas publicadas en el repositorio del autor.
- Inferencia con requisitos de memoria reducidos: para equipos con GPUs de 40-80 GB que necesitan ejecutar un modelo de 27B multimodal sin recurrir a cuantizaciones de 4 bits, a costa de la pérdida de precisión inherente a FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a https://github.com/Level5Tech/clef-quant-bench para mediciones, recetas y salidas por registro, pero esos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 de 27.356.728.560 parámetros ocupan aproximadamente 27,4 GB; con overhead de activaciones, KV cache y componentes en BF16, se recomienda un mínimo de 40 GB y, para contextos largos, 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB; en GPUs de 40 GB puede requerir límites de contexto o tensor parallelism.
- GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090) con FP8 nativo; sería necesario recurrir a cuantizaciones adicionales o a la versión BF16 con offloading, no documentado en la información disponible.
- Opciones de despliegue: vLLM es el destino explícito de esta build (formato compressed-tensors). Otros motores (llama.cpp, Ollama, TGI) no están documentados para estos pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-FP8 (este) | ~27,4B | no disponible | FP8 W8A8 | Apache-2.0 | Hugging Face, 0 descargas |
| Cloudflare/clef (base) | ~27,4B | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (multimodales de ~27B con arquitecturas híbridas) en los datos proporcionados, por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Es una build no oficial: no procede de Cloudflare y no debe presentarse como release oficial del modelo base.
- La cuantización FP8 W8A8 introduce degradación de precisión respecto a BF16; el grado exacto no está documentado en la información disponible y debe consultarse en el repositorio de benchmarks del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan los idiomas soportados ni el contexto máximo, lo que dificulta planificar su uso en aplicaciones multilingües o de contexto largo.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; deben evaluarse sobre el modelo base Cloudflare/clef.
- Licencia Apache-2.0 permite uso comercial, pero el NOTICE indica que los pesos han sido modificados por cuantización; conviene conservar LICENSE y NOTICE al redistribuir.
- El despliegue está pensado para vLLM con compressed-tensors; otros motores de inferencia no están soportados de forma documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Level5Tech/clef-FP8
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio de benchmarks y recetas: https://github.com/Level5Tech/clef-quant-bench
