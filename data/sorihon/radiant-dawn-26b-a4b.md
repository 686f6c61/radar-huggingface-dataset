# Sorihon/Radiant-Dawn-26B-A4B

## Resumen

Radiant-Dawn-26B-A4B es un modelo de lenguaje multimodal (image-text-to-text) publicado por el usuario Sorihon en Hugging Face. No se trata de un entrenamiento desde cero, sino de una fusión (merge) de pesos realizada con la herramienta mergekit, empleando el método Karcher Mean sobre dos modelos: Naphula/Erebus-RP-Engine-26B-A4B y una ruta local del autor (/home/sorihon/Documents/R9/) de la que no se ofrece información pública.

El modelo cuenta con 26.544.133.710 parámetros totales según los pesos en safetensors, y su etiqueta "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4B de parámetros activos, aunque este dato no está confirmado en la información disponible. La etiqueta "gemma4" en los metadatos apunta a que la arquitectura subyacente deriva de la familia Gemma 4, y el pipeline declarado es image-text-to-text, lo que implica capacidades de visión.

Su relevancia es limitada por el momento: el repositorio no tiene descargas ni likes, la licencia no está especificada y la model card es prácticamente el texto automático generado por mergekit. Es un modelo experimental orientado, por el nombre del base model (Erebus-RP-Engine), a conversación y roleplay, más que a tareas de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); etiqueta "gemma4" en metadatos; probable MoE segun el sufijo A4B (no confirmado) |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 53,1 GB |
| Modelo base | Naphula/Erebus-RP-Engine-26B-A4B |
| Metodo de fusion | Karcher Mean (mergekit) |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado de forma directa: es el resultado de una fusión de pesos con mergekit usando el método Karcher Mean, que calcula una media geométrica (en el sentido de la métrica de Karcher) sobre los parámetros de los modelos de entrada. Los dos modelos fusionados son Naphula/Erebus-RP-Engine-26B-A4B y un checkpoint local del autor identificado solo como /home/sorihon/Documents/R9/, sin referencia pública. La fusión se realizó en precisión bfloat16.

La arquitectura heredada corresponde a la del modelo base, que por las etiquetas ("gemma4", "image-text-to-text") apunta a un transformer multimodal de la familia Gemma 4 con capacidad de procesar imágenes y texto. El sufijo A4B del nombre sugiere una configuración de mezcla de expertos con alrededor de 4B de parámetros activos sobre 26B totales, pero no hay documentación que lo confirme. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si hubo etapas de RLHF o DPO en los modelos de origen.

## Capacidades

- Generación de texto conversacional, presumiblemente orientada a diálogo y roleplay por herencia del modelo base Erebus-RP-Engine.
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text), lo que permitiría entrada multimodal.
- Razonamiento multi-turno en conversaciones, en la medida en que lo soporte el modelo base.
- Capacidades de tool calling o function calling: no disponibles documentadas.
- Capacidades de agente y razonamiento multi-paso: no disponibles documentadas.
- Soporte multilingüe: no disponible documentado.
- Modo thinking, audio u otras capacidades especiales: no disponibles documentadas.

## Casos de uso

- Prototipado de asistentes conversacionales de rol: el modelo puede emplearse para generar respuestas de personaje en aplicaciones de chat, dado que su linaje (Erebus-RP-Engine) está orientado a roleplay. Requiere validación previa porque no hay benchmarks publicados.
- Experimentación con fusiones de modelos: sirve como caso de estudio de mergekit y del método Karcher Mean para investigadores que analicen cómo afecta la fusión de pesos al comportamiento conversacional.
- Investigación sobre modelos multimodales de 26B: útil para probar pipelines image-text-to-text con transformers en entornos de laboratorio, siempre que se verifique la compatibilidad real de la arquitectura.
- Evaluación comparativa de merges frente al modelo base: permite medir empíricamente si la fusión mejora o degrada las capacidades del Erebus-RP-Engine original.
- Generación de descripciones de imágenes en contextos creativos: si la capacidad de visión funciona correctamente, podría emplearse para narrativa asistida a partir de imágenes.
- Base para fine-tuning posterior: al publicarse en safetensors y con licencia no especificada, podría servir como punto de partida para ajustes, siempre que se aclare antes la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 53 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 60-70 GB, lo que exige múltiples GPU o una GPU de gran memoria.
- En cuantización de 8 bits: alrededor de 27 GB de pesos, viable en una A100 40GB o H100.
- En cuantización de 4 bits: alrededor de 14-15 GB de pesos, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no hay GGUF publicado y habría que generarlo.
- GPU recomendadas: H100 80GB, A100 80GB para bfloat16; A100 40GB o L40S para 8 bits; RTX 4090/3090 para cuantizaciones agresivas.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Radiant-Dawn-26B-A4B | 26,5B totales (¿~4B activos?) | no disponible | no disponible | Hugging Face, 0 descargas |
| Naphula/Erebus-RP-Engine-26B-A4B (base) | 26B aprox. (¿A4B?) | no disponible | no disponible | Hugging Face |
| Gemma 4 (familia referenciada por el tag) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; es un bloqueo para producción.
- Model card mínima: sin información sobre datos de entrenamiento, idiomas, contexto ni evaluación.
- Riesgo elevado de alucinación y comportamiento impredecible al ser una fusión de pesos sin validación publicada.
- El segundo modelo de la fusión es una ruta local sin referencia pública, lo que impide auditar la composición real del merge.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Orientación probable a roleplay y conversación creativa, no a tareas de precisión (código, matemáticas, extracción de datos).
- Posible incompatibilidad o comportamiento degradado en tooling estándar (vLLM, llama.cpp) al no estar verificada la arquitectura.
- El tag "gemma4" y el sufijo A4B son indicios, no confirmaciones; conviene inspeccionar config.json antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sorihon/Radiant-Dawn-26B-A4B
- Modelo base: https://huggingface.co/Naphula/Erebus-RP-Engine-26B-A4B
- mergekit: https://github.com/cg123/mergekit
- Paper del método Karcher Mean: https://arxiv.org/abs/2603.04972
