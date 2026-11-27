# Fafagmon/lfm3-1.7b-ru-v5-bf16

## Resumen

lfm3-1.7b-ru-v5-bf16 es un ajuste fino en ruso del modelo base LiquidAI/LFM3-1.7B, publicado por el usuario Fafagmon en Hugging Face. Se trata de un modelo de generacion de texto conversacional de 1.728.801.536 parametros (1,7B) entrenado mediante LoRA sobre la base de Liquid AI, con el objetivo de mejorar el conocimiento factual, el razonamiento, las matematicas y la fluidez dialogica en ruso. La personalidad o el caracter no se entrenaron de forma deliberada.

El modelo se distribuye en formato GGUF con cuantizacion bf16 (aproximadamente 3,47 GB) y esta pensado para su uso en LM Studio y llama.cpp, con una longitud de contexto de hasta 32768 tokens. El repositorio ocupa 3,5 GB e incluye tambien pesos en formato transformers (safetensors), segun los metadatos del repo.

Su relevancia radica en que adapta un modelo pequeno y eficiente a un idioma concreto (ruso) mediante un ajuste LoRA ligero, manteniendo la licencia original LFM 1.0. Ademas, parchea la plantilla de chat para desactivar el modo de razonamiento (`enable_thinking = false`), de modo que las respuestas llegan siempre en el campo `content` y no en `reasoning_content`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; familia LFM3) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | bf16 (GGUF); pesos transformers en safetensors |
| Idiomas soportados | ruso (ru) |
| Licencia | LFM 1.0 (license: other) |
| Formato de pesos | safetensors y GGUF (bf16, ~3,47 GB) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base LiquidAI/LFM3-1.7B en la informacion proporcionada (no se especifica si es transformer, MoE, SSM o hibrida). El ajuste se realizo mediante LoRA con rango `r=128` y `alpha=256`, aplicado a todas las proyecciones lineales de las 24 capas del modelo. Se entrenaron 131.749.888 parametros, aproximadamente el 7,6% del total.

El entrenamiento consto de dos etapas secuenciales con el mismo adaptador. La primera, orientada a conocimiento y habla, uso 66.699 ejemplos (~19,7 millones de tokens) en 6033 pasos, con fuentes como Wikipedia-RU, preguntas de "Que? Donde? Cuando?", tareas logicas y adivinanzas rusas, y los datasets `ru_turbo_saiga`, `russian-reasoning`, `GrandMaster-PRO-MAX`, `ru_turbo_alpaca` y matematicas. La segunda etapa, de pulido de estilo, uso 26.359 pares de un solo turno (~3,8 millones de tokens) durante una epoca con lr 5e-6, generando respuestas cortas (<=300 caracteres), sin etiquetas de servicio y con algunas replicas prefijadas con el nombre. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ruso con respuestas breves y naturales.
- Conocimiento factual en ruso (entrenado con Wikipedia-RU y datasets rusos).
- Razonamiento logico basico y resolucion de tareas de logica y adivinanzas.
- Matematicas elementales (incluida en el dataset de entrenamiento).
- Dialogo multi-turno dentro de la ventana de 32768 tokens.
- Modo de razonamiento desactivado por defecto (`enable_thinking = false`): las respuestas se entregan en `content`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- Capacidad multilingue limitada al ruso segun los metadatos (idioma: ru).

## Casos de uso

- Asistente conversacional en ruso: el modelo mantiene dialogos multi-turno gracias a su contexto de 32768 tokens y a un entrenamiento orientado a respuestas cortas y naturales.
- Atencion al cliente automatizada en ruso: adecuado para respuestas breves y directas (<=300 caracteres) en entornos de soporte de bajo coste.
- Generacion de respuestas a preguntas factuales en ruso: util como base para sistemas de FAQ o consulta sobre conocimiento general, con verificacion posterior por sus limitaciones.
- Resolucion de acertijos y tareas de logica sencillas: entrenado con "Que? Donde? Cuando?" y tareas logicas rusas, puede emplearse en aplicaciones educativas o de entretenimiento.
- Ejercicios de matematicas basicas en ruso: soporte para tutoria o generacion de problemas elementales.
- Despliegue local en equipos de consumo: al ser un modelo de 1,7B en GGUF bf16 (~3,47 GB), puede ejecutarse en LM Studio o llama.cpp en hardware modesto.
- Prototipado rapido de chatbots en ruso: su tamano reducido permite iterar y desplegar en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos bf16 (~3,47 GB) se requiere al menos ese espacio mas overhead de contexto y cache KV.
- GPU recomendadas: no especificadas en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1,7B en bf16, aunque no se detalla que modelos concretos.
- Opciones de despliegue: LM Studio y llama.cpp (llama-server), segun la model card; compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| lfm3-1.7b-ru-v5-bf16 | 1.728.801.536 | 32768 | ru | LFM 1.0 (other) | safetensors, GGUF |
| LiquidAI/LFM3-1.7B (base) | 1,7B (segun nombre) | no disponible | no disponible | LFM 1.0 (other) | no disponible |

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno (1,7B): puede cometer errores factuales y fallar en tareas de logica sutiles; se recomienda verificar la informacion en cuestiones criticas.
- Entrenado exclusivamente en ruso: no se garantiza un rendimiento adecuado en otros idiomas.
- No se entreno una persona o caracter deliberado, por lo que el estilo puede resultar generico.
- La plantilla de chat esta parcheada con `enable_thinking = false`; no se debe esperar salida en `reasoning_content`.
- Licencia LFM 1.0 (license: other), heredada del modelo base; es necesario revisar los terminos del LICENSE de LiquidAI/LFM3-1.7B antes de un uso comercial.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Fafagmon/lfm3-1.7b-ru-v5-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
