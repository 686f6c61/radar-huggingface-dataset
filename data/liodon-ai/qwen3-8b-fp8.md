# liodon-ai/Qwen3-8B-FP8

## Resumen

Qwen3-8B-FP8 es una versión cuantizada en FP8 del modelo Qwen/Qwen3-8B, publicada por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del transformer denso de 8.190.735.360 parámetros de Qwen al formato FP8 (E4M3), realizada con la herramienta llm-compressor bajo el esquema `FP8_DYNAMIC`. El objetivo es reducir el peso del modelo de 16,4 GB a 9,4 GB y acelerar la inferencia en GPUs con soporte nativo de FP8, manteniendo una calidad prácticamente idéntica al original.

La cuantización es puramente de pesos y activaciones: los pesos se convierten a FP8 por canal de forma anticipada y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. El esquema no requiere dataset de calibración, de modo que los pesos resultantes son esencialmente una conversión directa del modelo original, sin sesgo introducido por un conjunto de calibración. La capa `lm_head` se deja sin cuantizar, práctica habitual por su impacto desproporcionado en la calidad frente a su tamaño reducido.

Es relevante para desarrolladores que quieran desplegar Qwen3-8B en producción con menor huella de memoria y mayor throughput en hardware Ada/Hopper/Blackwell, usando vLLM, TGI o SGLang. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia figura como "other", heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), cuantizado en FP8 E4M3 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 (E4M3) dinamica: pesos por canal, activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de Qwen/Qwen3-8B) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM, TGI y SGLang |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de aproximadamente 8,19 mil millones de parámetros. Esta ficha no dispone de datos sobre la composición del dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO; esa información corresponde a la model card de Qwen/Qwen3-8B, no incluida en la información proporcionada.

La innovación técnica de esta publicación es la cuantización. Se aplicó el esquema `FP8_DYNAMIC` de llm-compressor: los pesos se convierten a FP8 E4M3 por canal de forma offline y las activaciones se cuantizan dinámicamente por token durante la inferencia. Al no necesitar calibración, no hay sesgo de conjunto de calibración. La ejecución FP8 nativa requiere GPU NVIDIA con compute capability ≥ 8,9 (Ada, Hopper o Blackwell: RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10). En GPUs anteriores, vLLM y TGI de-cuantizan para ejecutar, perdiendo la ventaja de velocidad y memoria.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada de Qwen3-8B.
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas de forma independiente en esta cuantización.
- Generación de código: capacidades del modelo base.
- Tool calling / function calling: no confirmado en la información proporcionada para esta versión cuantizada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles; los idiomas no se listan en la ficha.
- Modo thinking: no confirmado en la información proporcionada.
- Visión y audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Despliegue de inferencia de texto a gran escala en vLLM: el modelo se sirve con `vllm serve liodon-ai/Qwen3-8B-FP8` y aprovecha FP8 nativo en GPUs Ada/Hopper para reducir memoria y aumentar throughput frente al modelo en BF16.
- Servicio de chat conversacional con TGI: se lanza con la imagen oficial de Text Generation Inference y se expone como API HTTP, adecuado para backends de asistentes con múltiples usuarios concurrentes.
- Serving de baja latencia con SGLang: `python -m sglang.launch_server --model-path liodon-ai/Qwen3-8B-FP8` para cargas que requieren decodificación rápida y gestión eficiente de peticiones.
- Sustitución directa del modelo base en pipelines existentes: al mantener la interfaz de transformers y el formato compressed-tensors, se puede reemplazar Qwen/Qwen3-8B por esta versión sin cambiar el código de aplicación, reduciendo el consumo de VRAM.
- Prototipado en una sola GPU profesional: con 9,4 GB de pesos en FP8, cabe en GPUs como L4 o L40S y deja margen para caché KV, lo que permite montar entornos de desarrollo y pruebas en hardware de gama media-alta.
- Evaluación comparativa de calidad de cuantización: útil para medir la degradación de FP8 E4M3 dinámico frente al original en tareas concretas antes de adoptarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,4 GB solo para pesos en FP8; hay que añadir la memoria de caché KV, cuyo tamaño depende de la longitud de contexto y del número de secuencias concurrentes (no disponible en la información proporcionada).
- GPUs recomendadas: H100/H200, B100/B200/GB10, L4/L40S y RTX 40-series, todas con compute capability ≥ 8,9 para FP8 nativo.
- GPUs consumer: sí cabe en RTX 40-series (por ejemplo, RTX 4090 con 24 GB), dejando margen para contexto y batching.
- GPUs anteriores a Ada: el modelo se puede ejecutar, pero vLLM/TGI de-cuantizan y se pierde la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang, según la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Qwen3-8B-FP8 | 8,19 B | no disponible | FP8 E4M3 dinamica | other | Hugging Face (0 descargas) |
| Qwen/Qwen3-8B | 8,19 B | no disponible | BF16 (original) | otra (Qwen) | Hugging Face |
| Alternativas de 7-8 B en FP8 | no disponible | no disponible | FP8 | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-8B.
- Riesgo de alucinación: no evaluado para esta cuantización; se asume similar al del modelo original.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la ficha.
- Licencia "other": es necesario revisar los términos de Qwen/Qwen3-8B antes de cualquier uso comercial; la ficha no aclara las condiciones exactas.
- Requiere hardware con compute capability ≥ 8,9 para beneficiarse de FP8; en GPUs antiguas la de-cuantización anula la ventaja.
- Repositorio sin tracción (0 descargas, 0 likes) y creado recientemente: no hay evidencia comunitaria de calidad ni validación independiente.
- No se han publicado benchmarks que confirmen la fidelidad de la cuantización frente al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/Qwen3-8B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Perfil del autor: https://huggingface.co/liodon-ai
