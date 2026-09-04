# liodon-ai/LFM2.5-8B-A1B-FP8

## Resumen

LFM2.5-8B-A1B-FP8 es una cuantización FP8 dinámica del modelo LFM2.5-8B-A1B, desarrollada por Liodon AI. El modelo base, creado por Liquid AI, es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 8.467 millones de parámetros totales y una longitud de contexto de 128.000 tokens, diseñado específicamente para ejecutarse en dispositivos locales. Esta versión FP8 reduce el tamaño del modelo de 16,9 GB a 8,7 GB, lo que facilita su despliegue en GPUs de consumo con menor memoria.

La cuantización utiliza el esquema `FP8_DYNAMIC` de `llm-compressor`: los pesos se convierten a FP8 (E4M3) por canal antes de la inferencia, mientras que las activaciones se cuantizan dinámicamente por token. Al no requerir dataset de calibración, la conversión es una transformación directa de los pesos originales, sin introducir sesgos adicionales. El `lm_head` se mantiene sin cuantizar para preservar la calidad de la salida.

La relevancia de este modelo radica en que combina la eficiencia de un MoE con solo 1.000 millones de parámetros activos (según su nomenclatura) y la ventaja de la cuantización FP8, permitiendo inferencia rápida y memoria reducida en hardware NVIDIA reciente. Es una opción práctica para aplicaciones on-device, agentes con tool calling y escenarios donde el tamaño del modelo es crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 8.467.856.832 |
| Parametros activos | no disponible (la nomenclatura A1B sugiere ~1.000 millones, no confirmado en la documentación) |
| Longitud de contexto | 128.000 tokens (según el blog de Liquid AI) |
| Tipos de cuantizacion | FP8 dinamico (E4M3) por canal para pesos; activaciones FP8 dinamicas por token; lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B es un transformer con arquitectura Mixture of Experts. Cada token activa un subconjunto de los expertos, lo que permite mantener un coste computacional bajo a pesar de los 8.467 millones de parámetros totales. El nombre del modelo indica que aproximadamente 1.000 millones de parámetros son activos por token, aunque la documentación no lo confirma explícitamente.

Esta versión FP8 es una cuantización post-entrenamiento realizada con `llm-compressor` de vLLM. El esquema `FP8_DYNAMIC` convierte los pesos a FP8 por canal de forma anticipada y cuantiza las activaciones dinámicamente por token durante la inferencia. No se necesita dataset de calibración, por lo que los pesos cuantizados son una conversión directa de los originales, sin sesgos introducidos por el proceso de calibración. El `lm_head` se deja en precisión original por su tamaño reducido y su impacto desproporcionado en la calidad final.

No se han publicado datos sobre el proceso de entrenamiento del modelo base, como número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO).

## Capacidades

- Generación de texto y conversación: el modelo base es un modelo de lenguaje conversacional, capaz de mantener diálogos multi-turno.
- Tool calling / function calling: el blog de Liquid AI destaca "fast tool calling", lo que indica soporte nativo para invocación de funciones y APIs.
- Razonamiento y benchmarks: el blog menciona "strong AI benchmarks", pero no se proporcionan cifras concretas en la información disponible.
- Ejecución on-device: el modelo base está diseñado para funcionar en dispositivos locales, y la cuantización FP8 lo hace más viable en GPUs de consumo.
- Soporte para agentes: la combinación de tool calling rápido y contexto largo de 128K permite construir agentes que realicen razonamiento multi-paso.
- Capacidades multilingües: no especificadas en la documentación.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en dispositivos locales: gracias a su tamaño reducido (8,7 GB en FP8) y a los ~1.000 millones de parámetros activos, el modelo puede ejecutarse en portátiles o estaciones de trabajo con GPU NVIDIA recientes, ofreciendo un asistente privado sin dependencia de servicios en la nube.
- Agentes autónomos con tool calling: el soporte rápido de function calling permite integrar el modelo en pipelines donde debe invocar APIs externas, consultar bases de datos o ejecutar acciones en sistemas de información, manteniendo un contexto largo para razonamiento multi-paso.
- Generación de código en entornos de desarrollo: la ventana de contexto de 128K tokens es suficiente para analizar repositorios completos o fragmentos de código extensos, y el modelo puede actuar como asistente de programación en IDEs, sugiriendo implementaciones y refactorizaciones.
- Automatización de documentos y reportes: el modelo puede redactar resúmenes, informes técnicos o correos a partir de entradas largas, aprovechando su capacidad de procesar documentos extensos sin perder información relevante.
- Chatbots de atención al cliente on-premise: para empresas que necesitan mantener los datos de clientes dentro de su infraestructura, este modelo permite desplegar un chatbot con contexto largo y tool calling sin enviar información a servicios externos, cumpliendo requisitos de privacidad.
- Investigación en modelos MoE y cuantización FP8: al ser un modelo abierto con una cuantización bien documentada, resulta útil para experimentar con técnicas de compresión, evaluar el impacto de FP8 en la calidad y comparar estrategias de despliegue en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño de pesos: 8,7 GB en FP8 (frente a 16,9 GB del modelo original sin cuantizar).
- VRAM estimada: no disponible oficialmente. Considerando el tamaño de los pesos y el overhead de la cache KV, se recomienda al menos 12 GB de VRAM para inferencia con contexto corto; el contexto largo de 128K requerirá memoria adicional significativa.
- GPU recomendadas: cualquier GPU NVIDIA con compute capability ≥ 8.9, es decir, arquitecturas Ada, Hopper o Blackwell. Incluye RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10.
- En GPUs más antiguas (compute capability < 8.9), vLLM y TGI des-cuantizan automáticamente el modelo, perdiendo las ventajas de velocidad y memoria de FP8.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang. La model card incluye comandos de arranque para los tres.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Tamano de pesos | Licencia |
|---|---|---|---|---|---|---|
| LFM2.5-8B-A1B (base) | 8.467.856.832 | ~1.000 millones (segun nomenclatura) | 128K | Sin cuantizar | 16,9 GB | other |
| LFM2.5-8B-A1B-FP8 | 8.467.856.832 | ~1.000 millones (segun nomenclatura) | 128K | FP8 dinamico | 8,7 GB | other |

No se dispone de datos de rendimiento para comparar con otros modelos de la misma categoría. La comparación con el modelo base muestra la principal ventaja de esta versión: la reducción del tamaño en un 48,5% sin cambios en la arquitectura ni en la longitud de contexto.

## Limitaciones y advertencias

- Licencia "other": la licencia no está especificada en la model card, lo que puede implicar restricciones desconocidas para uso comercial o redistribución. Es necesario revisar la licencia del modelo base en LiquidAI/LFM2.5-8B-A1B antes de usarlo en producción.
- Requisitos de hardware estrictos: la ejecución eficiente en FP8 solo es posible en GPUs NVIDIA con compute capability ≥ 8.9. En hardware más antiguo, el modelo se des-cuantiza y pierde las ventajas de memoria y velocidad.
- Sin evaluación de seguridad: no se han publicado estudios sobre sesgos, alucinaciones o comportamientos de riesgo. Como todo modelo de lenguaje, existe riesgo de alucinación y de generar contenido no deseado.
- Limitaciones de idioma: los idiomas soportados no están documentados, lo que puede afectar a aplicaciones multilingües.
- Contexto largo y memoria: la ventana de 128K tokens puede requerir una cache KV muy grande, lo que incrementa el consumo de VRAM y puede degradar el rendimiento en hardware de consumo.
- Ausencia de benchmarks: no se han publicado resultados de evaluación, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Enlaces

- Modelo cuantizado: https://huggingface.co/liodon-ai/LFM2.5-8B-A1B-FP8
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Repositorio de llm-compressor (mencionado en la model card): https://github.com/vllm-project/llm-compressor
