# LiquidAI/LFM3-1.7B-FP8

## Resumen

LFM3-1.7B-FP8 es la versión cuantizada en FP8 del modelo LFM3-1.7B desarrollado por Liquid AI, una empresa especializada en modelos de lenguaje de arquitectura no convencional. Se trata de un modelo de generación de texto de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) que emplea la arquitectura propietaria "Liquid" de la compañía, con soporte para tool calling y razonamiento multi-paso.

Esta variante FP8 está diseñada específicamente para inferencia en GPU. Según la model card, las capas feed-forward y los pesos de atención del modelo de lenguaje usan FP8 con bloques de 128×128 y cuantización dinámica de activaciones, mientras que los embeddings, la cabeza de salida, las convoluciones, las puertas de atención y las normalizaciones permanecen en BF16. Los ajustes de ventana deslizante y RoPE no se modifican respecto al modelo original.

El modelo resulta relevante para desarrolladores que necesitan desplegar un LLM compacto en infraestructura con memoria limitada manteniendo buena parte de la calidad del modelo base, y para quienes quieren experimentar con la arquitectura Liquid de Liquid AI. El repositorio ocupa 2,2 GB y se distribuye bajo licencia lfm1.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid (arquitectura propietaria de Liquid AI, no disponible el detalle completo en la informacion proporcionada) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (bloques 128×128 con cuantizacion dinamica de activaciones); embeddings, cabeza de salida, convoluciones, puertas de atencion y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (formato compressed-tensors) |

## Arquitectura y entrenamiento

La informacion disponible confirma que LFM3-1.7B-FP8 es una cuantizacion del modelo base LiquidAI/LFM3-1.7B, que emplea la arquitectura "Liquid" de Liquid AI. La model card de esta variante no detalla la arquitectura interna (tipo de mezcla de expertos, mecanismos de atención lineal, capas recurrentes o hibridaciones), ni los datos de entrenamiento, el numero de tokens, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto ni los idiomas de entrenamiento.

La innovacion tecnica documentada en esta version es el esquema de cuantizacion: pesos de feed-forward y atención en FP8 con bloques de 128×128 y cuantizacion dinamica de activaciones, manteniendo en BF16 los componentes sensibles a la precision (embeddings, cabeza de salida, convoluciones, puertas de atención y normalizaciones). Los ajustes de ventana deslizante y RoPE se conservan sin cambios respecto al modelo original, lo que sugiere que el modelo base emplea atención con ventana deslizante. Para detalles de arquitectura y entrenamiento, la model card remite a la ficha del modelo original.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y la pipeline `text-generation`.
- Soporte de razonamiento con parser de tipo thinking, segun el ejemplo de despliegue con SGLang que usa `--reasoning-parser qwen3-thinking`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Capacidades especiales (vision, audio): no disponible.

## Casos de uso

- Despliegue de un asistente conversacional ligero en GPU: el modelo, con 1,7 mil millones de parametros en FP8, ocupa aproximadamente 2,2 GB de pesos, lo que permite servirlo en GPUs de gama media o incluso consumer con memoria suficiente para el contexto y el estado de inferencia.
- Prototipado rapido de aplicaciones de generacion de texto: su tamano reducido y su integracion con transformers permiten iterar rapidamente en entornos de desarrollo sin infraestructura de gran escala.
- Experimentacion con la arquitectura Liquid: util para investigadores que quieran evaluar el comportamiento de la familia LFM3 de Liquid AI en tareas de generacion y razonamiento.
- Inferencia de bajo coste en produccion con SGLang: la model card proporciona un comando de lanzamiento con SGLang y parser de razonamiento, orientado a servir el modelo con requisitos moderados de VRAM.
- Evaluacion comparativa de tecnicas de cuantizacion FP8: sirve como caso de estudio de cuantizacion por bloques con cuantizacion dinamica de activaciones sobre un modelo base BF16.
- Integracion en pipelines de generacion de texto con la libreria transformers: el formato safetensors y la compatibilidad con transformers facilitan su inclusion en flujos existentes de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 1,73 GB (1.728.801.536 parametros a 1 byte por parametro); el repositorio completo pesa 2,2 GB. A esto hay que sumar la memoria para el contexto, el estado de inferencia y las capas que permanecen en BF16, por lo que se recomienda al menos 4-6 GB de VRAM en funcion de la longitud de contexto.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4070 o superiores con memoria suficiente; tambien en GPUs de datacenter (A100, H100) para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, previsiblemente en modelos con 6 GB o mas de VRAM, aunque la cifra exacta depende de la longitud de contexto y del backend.
- Opciones de despliegue: transformers (libreria declarada) y SGLang (soporte en revision en sgl-project/sglang#46858, con comando de lanzamiento documentado). Otros backends como vLLM, llama.cpp o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-FP8 | 1.728.801.536 | no disponible | lfm1.0 | safetensors (FP8) | Version cuantizada del LFM3-1.7B |
| LFM3-1.7B (base) | 1.728.801.536 (segun modelo base) | no disponible | lfm1.0 | safetensors | Modelo original sin cuantizar; referencia de calidad y precision |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de cualquier despliegue en produccion.
- La cuantizacion FP8 puede introducir una degradacion de calidad respecto al modelo base BF16, especialmente en tareas sensibles a la precision numerica; no se han publicado evaluaciones comparativas en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se documentan tasas especificas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto: no disponible, lo que limita la planificacion de casos de uso con documentos largos.
- Soporte de SGLang en revision: el backend SGLang aun no tiene una release que soporte LFM3 segun la model card, por lo que el despliegue con ese motor puede no funcionar hasta que se publique.
- Detalles de arquitectura y entrenamiento no documentados en esta variante: para evaluar sesgos y capacidades reales conviene consultar la ficha del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-FP8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
- Pull request de soporte en SGLang: https://github.com/sgl-project/sglang/pull/46858
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B-FP8/blob/main/LICENSE
