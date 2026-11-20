# nace-ai/Hy4-flash-MLX-3.8bit

## Resumen

Hy4-flash MLX 3.8-bit es una cuantización del modelo Hy4-flash de Tencent, publicada por Nace.AI en formato MLX para su uso en hardware Apple Silicon. El modelo base es un transformer de gran escala con 218.938.886.165 parámetros totales (datos reales de los safetensors), empaquetado a 3,8 bits por peso, lo que reduce el repositorio a 103,7 GB. La cuantización emplea un esquema con soporte de "packed-expert" y tablas Engram en formato GGUF, lo que sugiere una arquitectura con componentes de mezcla de expertos (MoE) y mecanismos de memoria tipo Engram.

El modelo está orientado a generación de texto y conversación, con licencia HY Community License (tencent-hy-license) y declaración de idioma únicamente en inglés. Su relevancia radica en permitir ejecutar un modelo de más de 200.000 millones de parámetros en equipos Apple Silicon con memoria unificada, algo inviable con cuantizaciones estándar de 4 bits o superiores.

La ficha se basa exclusivamente en los metadatos y la model card disponibles; no se han publicado detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componentes packed-expert y tablas Engram (según requisitos de runtime); detalles no disponibles |
| Parametros totales | 218.938.886.165 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3,8 bits por peso (MLX); 4-bit según tags |
| Idiomas soportados | en (inglés) |
| Licencia | tencent-hy-license (HY Community License) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Hy4-flash de Tencent. Los requisitos de runtime de la cuantización ("packed-expert and GGUF Engram-table support") indican la presencia de expertos empaquetados, compatible con un diseño de mezcla de expertos (MoE), y de tablas Engram, un mecanismo de memoria asociativa. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La cuantización a 3,8 bits por peso es la innovación técnica destacable de esta publicación: reduce un modelo de más de 218.000 millones de parámetros a 103,7 GB, un tamaño manejable en configuraciones de memoria unificada de gama alta de Apple Silicon. No se dispone de información sobre el proceso de calibración de la cuantización ni sobre la pérdida de calidad respecto al modelo original.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, tag conversational).
- Ejecución en hardware Apple Silicon mediante la librería MLX.
- Capacidades de razonamiento, código y matemáticas: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Inferencia local en Mac de gama alta: el formato MLX y los 103,7 GB permiten ejecutar un modelo de más de 218.000 millones de parámetros en equipos Apple Silicon con memoria unificada suficiente, sin depender de GPUs dedicadas.
- Prototipado de asistentes conversacionales en inglés: el pipeline text-generation y el tag conversational lo hacen adecuado para construir chatbots de prueba en local antes de migrar a infraestructura de producción.
- Investigación sobre cuantización extrema: sirve como referencia para estudiar el impacto de 3,8 bits por peso en un modelo de gran escala, comparando salidas con el modelo base de Tencent.
- Desarrollo de aplicaciones offline con requisitos de privacidad: al ejecutarse en local, evita el envío de datos a servicios externos, útil en entornos con datos sensibles.
- Evaluación de runtimes MLX: permite probar el soporte de packed-expert y tablas Engram en la pila MLX para quienes desarrollan o mantienen dichos runtimes.
- Generación de texto en inglés para tareas de redacción y resumen: uso directo mediante la librería MLX en scripts o aplicaciones de escritorio para macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 103,7 GB; se necesita memoria unificada algo superior para cargar el modelo y el contexto (estimación no confirmada en la información disponible).
- GPU recomendadas: hardware Apple Silicon con memoria unificada de gama alta (Mac Studio, MacBook Pro con chip Max/Ultra); no se especifican modelos concretos.
- Compatibilidad con GPU consumer NVIDIA (RTX 4090, etc.): no disponible; el formato es MLX, específico de Apple.
- Opciones de despliegue: librería MLX; requiere un runtime con soporte de packed-expert y tablas Engram en formato GGUF. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash MLX 3.8-bit (nace-ai) | 218,9 B | no disponible | safetensors MLX | tencent-hy-license | Hugging Face, 0 descargas |
| Hy4-flash (tencent, base) | no disponible en la información | no disponible | no disponible | tencent-hy-license | Hugging Face (referenciado como base) |
| Otras cuantizaciones de Hy4-flash | no disponible | no disponible | no disponible | tencent-hy-license | no disponible |

No se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos de gran escala; no se han publicado evaluaciones específicas.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: HY Community License (tencent-hy-license) con restricciones de uso comercial que deben revisarse en el archivo LICENSE antes de cualquier despliegue en producción.
- Cuantización agresiva: 3,8 bits por peso puede degradar la calidad respecto al modelo original; no se han publicado comparativas de fidelidad.
- Dependencia de runtime: requiere soporte específico de packed-expert y tablas Engram en MLX/GGUF; sin él, el modelo no se carga.
- Ecosistema limitado: formato MLX restringe el despliegue a Apple Silicon; no hay soporte documentado para GPUs NVIDIA o servidores convencionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-MLX-3.8bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sitio del autor: https://www.nace.ai/
