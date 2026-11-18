# KomorAI/Ai_that_dont_like_real_madrid

## Resumen

Ai_that_dont_like_real_madrid es un modelo de lenguaje en miniatura de tipo GPT-2 entrenado desde cero por el usuario KomorAI y publicado en Hugging Face. Se trata de un experimento de vocabulario personalizado: el modelo emplea un tokenizador propio con un vocabulario definido por el autor, cuyo contenido literal es una secuencia de palabras en polaco. Con 104.448 parámetros totales, es un modelo de juguete, varios órdenes de magnitud por debajo de cualquier LLM utilizable en producción.

El modelo se distribuye en formato safetensors, declara el pipeline de text-generation y el idioma polaco (código `pl`), y no cuenta con descargas ni valoraciones en el momento de la consulta. No se ha publicado información sobre el dataset de entrenamiento, la longitud de contexto, la licencia ni resultados de evaluación.

Su relevancia es exclusivamente didáctica o de curiosidad técnica: sirve como ejemplo mínimo de cómo se publica un modelo GPT-2 con tokenizador propio en el ecosistema Transformers, pero no es apto para ninguna tarea real de generación de texto, razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), según los tags del repositorio |
| Parametros totales | 104.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un GPT-2 en miniatura entrenado desde cero ("wytrenowany od zera"), con un vocabulario propio ("custom-vocab"). No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención, la longitud de contexto ni el volumen o composición del corpus de entrenamiento. Tampoco se documenta si hubo fases de ajuste fino supervisado, RLHF o DPO.

El único detalle técnico concreto es el vocabulario del tokenizador, que el autor enuncia como la secuencia `Real głogówno nielubięrealu realgówno`. Con 104.448 parámetros totales, el modelo es compatible con un entrenamiento en CPU en cuestión de segundos o minutos, lo que sugiere un ejercicio de demostración más que un desarrollo orientado a capacidades.

## Capacidades

- Generación de texto autoregresiva según el pipeline declarado (`text-generation`), limitada por el tamaño extremo del modelo y su vocabulario restringido.
- Manejo del vocabulario personalizado definido por el autor; fuera de ese conjunto de tokens la cobertura es incierta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; solo se declara polaco.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Demostración didáctica de publicación de un modelo GPT-2 con tokenizador propio: sirve para ilustrar el flujo completo de subida a Hugging Face con `safetensors` y un pipeline de `text-generation`.
- Pruebas de integración de la librería Transformers: al cargarse en milisegundos y ocupar menos de 1 MB, es útil para validar entornos, versiones de `transformers` y scripts de inferencia sin coste de recursos.
- Experimentos de tokenización con vocabulario reducido: permite estudiar el comportamiento de un tokenizador ad hoc y sus efectos en la generación con modelos de juguete.
- Pruebas unitarias de pipelines de CI: puede actuar como modelo simulado en tests que verifiquen el cableado de una API de generación de texto.
- Ejemplo educativo sobre limitaciones de escala: útil en docencia para contrastar qué produce un modelo de 104.448 parámetros frente a un LLM real.
- Reproducción de un caso de estudio sobre nomenclatura y metadatos en Hugging Face (tags, idioma, licencia ausente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precisión original; cabe en cualquier GPU, e incluso en CPU, sin cuantización.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU y en GPUs de consumo como GTX 1050, RTX 3060 o superiores.
- Cabe en cualquier GPU de consumo, así como en entornos sin GPU.
- Opciones de despliegue: `transformers` con el pipeline `text-generation`; no se han publicado pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles; por el tamaño, la latencia esperada es de milisegundos por token en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KomorAI/Ai_that_dont_like_real_madrid | 104.448 | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente replicado |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |

La comparación se limita a la categoría de modelos GPT-2 de pequeño tamaño; no se dispone de datos de rendimiento del modelo evaluado para contrastar calidad.

## Limitaciones y advertencias

- Con 104.448 parámetros, la capacidad de generar texto coherente es prácticamente nula; no debe emplearse en producción.
- El vocabulario personalizado y reducido limita severamente la cobertura léxica y la generalización.
- Riesgo de alucinación y de salidas sin sentido: inherente a un modelo de este tamaño y a la ausencia de datos de entrenamiento documentados.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Solo se declara polaco; el soporte de otros idiomas, incluido el castellano, no está documentado.
- Longitud de contexto no documentada; no se puede planificar su uso en conversaciones multi-turno.
- Ausencia de descargas y valoraciones: no hay evidencia de uso ni de validación por parte de la comunidad.
- El contenido del vocabulario incluye términos vulgares en polaco, lo que puede resultar inadecuado en contextos profesionales o públicos.
- Sin datos de sesgos, evaluación de seguridad ni filtros de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KomorAI/Ai_that_dont_like_real_madrid
- Documentación de Transformers (pipeline text-generation): https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextGenerationPipeline
- Documentación de safetensors: https://huggingface.co/docs/safetensors
