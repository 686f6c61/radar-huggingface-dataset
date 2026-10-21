# liana313/tokengate-niah-qwen3-1.7b

## Resumen

TokenGate NIAH Qwen3-1.7B es un artefacto de investigación publicado por liana313 que combina el modelo denso Qwen3-1.7B con una gate aprendida de poda de tokens de la KV-cache y un adaptador LoRA. No es un modelo completo listo para chat: el repositorio contiene dos checkpoints PyTorch (`gate_step3000.pt` y `lora_step3000.pt`) que deben cargarse juntos mediante la librería TokenGate. Su objetivo es reducir el coste de memoria y cómputo en inferencia de contexto largo, decidiendo qué tokens de la KV-cache conservar.

El entrenamiento se centra en la tarea needle-in-a-haystack (NIAH) de Kamradt, con haystacks compuestos por ensayos de Project Gutenberg y un tramo de ~16k tokens; el autor afirma que generaliza a los tramos de prueba de 32k, 64k y 128k. El checkpoint corresponde al paso 3000 de una receta denominada "converged iso" y, según la model card, es exactamente el usado en los benchmarks del paper arXiv:2610.26754.

Es relevante para quien investiga eficiencia de KV-cache y recuperación en contextos largos, no como sustituto de un modelo general: no se publican cifras de rendimiento, idiomas ni cuantizaciones, y el repositorio tiene 0 descargas. La licencia del adaptador es Apache-2.0 y el modelo base Qwen3-1.7B también es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-1.7B) + gate de poda de KV-cache en la capa 1 + adaptador LoRA r16/alpha32 en proyecciones q/v de todas las capas |
| Parámetros totales | 1,7 mil millones del modelo base Qwen3-1.7B; el adaptador LoRA y la gate no publican recuento exacto |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos del modelo base Qwen3-1.7B; la model card declara evaluación en los tramos 32k, 64k y 128k |
| Tipos de cuantización | No disponible; solo se publican checkpoints PyTorch `.pt`, no pesos cuantizados |
| Idiomas soportados | No disponible; la model card no declara idiomas. El base Qwen3-1.7B es multilingüe, pero este adaptador no se evalúa por idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`gate_step3000.pt` y `lora_step3000.pt`); no safetensors ni GGUF |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | text-generation |
| Autor | liana313 |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-1.7B, un transformer decoder-only denso de 1,7 mil millones de parámetros. Sobre él se añade una gate aprendida end-to-end que decide qué tokens de la KV-cache se conservan o se podan en la capa 1, junto con un adaptador LoRA de rango 16 y alpha 32 aplicado a las proyecciones q/v de todas las capas. El entrenamiento se realiza de forma conjunta para la tarea NIAH, de modo que la gate y el adaptador se ajustan para mantener la recuperación del needle con una KV-cache reducida. No se detalla la arquitectura interna de la gate ni la tasa de poda alcanzada
