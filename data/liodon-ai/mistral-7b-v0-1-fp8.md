# liodon-ai/Mistral-7B-v0.1-FP8

## Resumen

Mistral-7B-v0.1-FP8 es una cuantización en precisión FP8 (E4M3) del modelo base Mistral-7B-v0.1, publicada por Liodon AI. El modelo original, desarrollado por Mistral AI, es un transformer decoder de 7.240 millones de parámetros con una ventana de contexto de 8.000 tokens, entrenado sobre un corpus extenso en inglés y código. Esta versión cuantizada reduce el tamaño de los pesos de 14,5 GB a 7,5 GB, manteniendo la misma arquitectura y comportamiento del modelo original, pero con un menor consumo de memoria y una inferencia más rápida en hardware compatible con FP8.

La cuantización utiliza el esquema `FP8_DYNAMIC` de la librería `llm-compressor`: los pesos se convierten a FP8 por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este enfoque no requiere dataset de calibración, por lo que los pesos cuantizados son numéricamente una conversión directa de los originales, sin sesgo introducido por datos de calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar para preservar la calidad de la salida.

La relevancia de este modelo radica en su capacidad para desplegar un LLM de 7B en entornos con recursos limitados, aprovechando las GPUs modernas con soporte FP8 (Ada, Hopper, Blackwell). Es una opción práctica para producción cuando se necesita un equilibrio entre rendimiento y eficiencia, y su compatibilidad con vLLM, TGI y SGLang facilita su integración en infraestructuras existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Mistral-7B) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base tiene 8.000 tokens, pero no se especifica en esta cuantización) |
| Tipos de cuantizacion | FP8 (E4M3) dinámica, esquema `FP8_DYNAMIC` |
| Idiomas soportados | No disponible |
| Licencia | other (según la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del Mistral-7B-v0.1 original, por lo que hereda su arquitectura: un transformer decoder con atención multi-cabeza, normalización RMSNorm, y activación SiLU. No se ha realizado ningún entrenamiento adicional; la cuantización se aplica directamente sobre los pesos del modelo base mediante la herramienta `llm-compressor` de vLLM. El esquema `FP8_DYNAMIC` convierte los pesos a FP8 por canal de forma estática y cuantiza las activaciones dinámicamente por token en tiempo de inferencia, sin necesidad de calibración. La capa `lm_head` se mantiene en BF16/FP16 para evitar una degradación desproporcionada de la calidad.

Al ser una conversión directa, no hay cambios en los datos de entrenamiento ni en el proceso de optimización. El modelo base fue entrenado por Mistral AI con un enfoque supervisado y posteriormente refinado con instrucciones (aunque esta versión base no incluye el ajuste instructivo). La cuantización no introduce innovaciones arquitectónicas, pero sí una optimización de despliegue relevante para entornos de producción.

## Capacidades

- Generación de texto: el modelo produce texto coherente y contextualmente relevante, heredando las capacidades del Mistral-7B-v0.1 base.
- Razonamiento y comprensión: puede resolver tareas de razonamiento lógico, responder preguntas y seguir instrucciones generales.
- Generación de código: el modelo base fue entrenado con una proporción significativa de código, por lo que puede completar y generar fragmentos de código en varios lenguajes.
- Multilingüe: aunque el modelo base está principalmente entrenado en inglés, puede manejar otras lenguas con menor fluidez; no se especifican idiomas concretos en esta cuantización.
- Tool calling y agentes: no se documenta soporte explícito para function calling en esta versión; el modelo base no incluye esta capacidad de forma nativa.
- Modo de pensamiento: no disponible; es un modelo de generación directa sin modo de razonamiento explícito.

## Casos de uso

- Inferencia de bajo coste en producción: gracias a la cuantización FP8, el modelo puede desplegarse en GPUs con 8-12 GB de VRAM, reduciendo el coste de infraestructura frente al modelo original en BF16.
- Chatbots y asistentes conversacionales: con una ventana de contexto de 8.000 tokens (heredada del base), puede mantener conversaciones multi-turno de longitud media, adecuado para atención al cliente o asistentes virtuales.
- Generación y autocompletado de código: su entrenamiento en código permite integrarlo en IDEs o pipelines de CI/CD para sugerencias de código, aunque sin tool calling nativo.
- Resumen de documentos: puede resumir artículos, informes o correos electrónicos, aprovechando su capacidad de comprensión de texto largo.
- Análisis de sentimiento y clasificación de texto: útil para tareas de procesamiento de lenguaje natural en entornos con restricciones de memoria.
- Prototipado rápido de aplicaciones LLM: al ser compatible con vLLM, TGI y SGLang, permite levantar un servidor de inferencia en minutos para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento específicas para esta cuantización. Se recomienda consultar los benchmarks del modelo base Mistral-7B-v0.1 para una referencia cualitativa, aunque los resultados pueden variar ligeramente debido a la cuantización.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 7,5 GB en FP8; con overhead de activaciones y KV cache, se recomienda al menos 10-12 GB de VRAM para inferencia con contexto completo.
- GPUs compatibles: se requiere compute capability ≥ 8.9 (Ada, Hopper, Blackwell) para ejecución FP8 nativa. Ejemplos: RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10.
- GPUs más antiguas: en GPUs con compute capability inferior, vLLM/TGI dequantizan los pesos a BF16/FP16, perdiendo la ventaja de memoria y velocidad, pero el modelo sigue siendo funcional.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang, todos soportados según la model card.
- Latencia y throughput: no se proporcionan datos específicos; en hardware FP8, se espera una mejora significativa frente a la versión BF16, pero depende de la GPU y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-v0.1 (base) | 7,24B | 8k | BF16/FP16 | Apache 2.0 | HuggingFace |
| Mistral-7B-v0.1-FP8 (este) | 7,24B | No disponible | FP8 dinámica | other | HuggingFace |
| Mistral-7B-Instruct-v0.1 | 7,24B | 8k | BF16/FP16 | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa con otras cuantizaciones (GPTQ, AWQ) o modelos de tamaño similar.

## Limitaciones y advertencias

- La licencia "other" no especifica los términos exactos; se recomienda revisar la documentación del autor antes de uso comercial.
- Al ser una cuantización, puede existir una ligera pérdida de precisión en tareas sensibles, aunque el esquema dinámico sin calibración minimiza este efecto.
- El modelo base tiene sesgos conocidos y riesgo de alucinación, heredados en esta versión; no se han aplicado medidas adicionales de seguridad.
- La ventana de contexto no se especifica en la model card; se asume la del modelo base (8k), pero no está confirmada.
- En GPUs sin soporte FP8, la cuantización se dequantiza, perdiendo los beneficios de memoria y velocidad, y el modelo puede no caber en GPUs de gama baja.
- No se documenta soporte para tool calling ni funciones de agente, lo que limita su uso en pipelines de automatización complejas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/liodon-ai/Mistral-7B-v0.1-FP8)
- [Modelo base Mistral-7B-v0.1](https://huggingface.co/mistralai/Mistral-7B-v0.1)
- [Modelo base instructivo Mistral-7B-Instruct-v0.1](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1)
- [Repositorio de referencia de Mistral (GitHub)](https://github.com/taylorai/mistral)
