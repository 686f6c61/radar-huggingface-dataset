# nebulette/mnn-pocket-0.3b-vision

## Resumen

MNN 0.3B Vision es un modelo de lenguaje de pequeño tamaño (375 millones de parámetros reales en safetensors) desarrollado por el usuario nebulette como un fine-tuning del modelo base taobao-mnn/MNN-Pocket-0.3B, que a su vez se apoya en la arquitectura Qwen3. La particularidad principal es la incorporación de módulos de visión mediante la técnica denominada "in-fusion", que permite procesar parches de imagen intercalados con texto dentro de la misma secuencia de entrada, usando tokens especiales `<|vision_start|>` y `<|vision_end|>`.

El modelo está orientado a la generación de texto condicionada por imagen, y su dataset de entrenamiento se construyó a partir de 50.000 etiquetas (tags) comunes de la plataforma booru (gelbooru), donde cada muestra incluye al menos una etiqueta única. Esto lo posiciona como una herramienta muy específica para tareas de etiquetado y descripción de imágenes dentro del ecosistema de arte digital y comunidades booru.

Es relevante ahora por su tamaño reducido (apto para despliegue en hardware modesto), su licencia Apache 2.0 permisiva y su enfoque en un caso de uso de nicho pero con demanda real: la anotación automática de imágenes con vocabulario booru. No obstante, la información pública disponible es muy escasa: no se documentan idiomas soportados, benchmarks ni detalles completos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3, con módulos de visión "in-fusion" |
| Parametros totales | 375.314.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 del modelo base taobao-mnn/MNN-Pocket-0.3B, sobre el que se añaden módulos de visión mediante la técnica "in-fusion". Esta aproximación intercala representaciones de parches de imagen directamente en la secuencia de tokens de texto, delimitadas por los tokens especiales `<|vision_start|>` y `<|vision_end|>`, de modo que el modelo procesa imagen y texto en un único flujo autorregresivo en lugar de usar un codificador visual separado con proyección posterior.

El entrenamiento se realizó sobre 50.000 etiquetas comunes de booru extraídas de gelbooru, con la restricción de que cada imagen de muestra contiene al menos una etiqueta única. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la resolución de imagen soportada ni el número de parches por imagen.

## Capacidades

- Generación de texto condicionada por imagen mediante intercalado de parches visuales en la secuencia de entrada.
- Etiquetado y descripción de imágenes con vocabulario booru (tags de gelbooru).
- Procesamiento multimodal en un único flujo autorregresivo (texto e imagen en la misma secuencia).
- Generación de texto conversacional (tag `conversational` en el repositorio).
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Etiquetado automático de imágenes booru: el modelo puede generar tags de gelbooru a partir de una imagen introducida entre `<|vision_start|>` y `<|vision_end|>`, aprovechando que fue entrenado específicamente sobre 50.000 etiquetas comunes de esa plataforma.
- Moderación y clasificación de contenido en comunidades de arte digital: dado su conocimiento del vocabulario booru, puede usarse para detectar y clasificar imágenes según sus etiquetas antes de publicarlas.
- Asistencia a artistas para metadatos: generación de descripciones y tags para catalogar obras en galerías personales o repositorios, reduciendo el trabajo manual de anotación.
- Búsqueda semántica en bases de datos de imágenes: los tags generados por el modelo pueden indexarse para habilitar búsquedas por contenido visual en catálogos de arte.
- Prototipado rápido de pipelines multimodales: su tamaño de 375 millones de parámetros permite integrarlo en entornos de desarrollo con recursos limitados para validar flujos de imagen-texto antes de escalar a modelos mayores.
- Despliegue en entornos con hardware modesto: al ser un modelo de 0,3B, puede ejecutarse en GPUs de consumo o incluso CPU, lo que facilita su uso en herramientas locales de anotación.
- Generación de texto conversacional general: aunque su foco es la visión, el modelo base Qwen3 le permite mantener conversaciones de texto, útil como componente auxiliar en asistentes ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de 375 millones de parámetros, en fp16 requeriría aproximadamente 0,75 GB solo para pesos, y en cuantizaciones de 8 o 4 bits podría situarse por debajo de 0,5 GB, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 2 GB de VRAM debería ser suficiente en precisión completa, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: previsiblemente sí en la mayoría de GPUs modernas (RTX 3060, RTX 4060, etc.), aunque no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (según tags) y endpoints compatibles. Soporte de vLLM, llama.cpp u Ollama: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebulette/mnn-pocket-0.3b-vision | 375.314.688 | no disponible | Sí (in-fusion) | Apache 2.0 | Hugging Face |
| taobao-mnn/MNN-Pocket-0.3B (base) | ~0,3B | no disponible | No (modelo base de texto) | no disponible | Hugging Face |
| Alternativas multimodales de ~0,3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; los datos de rendimiento y contexto del modelo base tampoco están confirmados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento sobre etiquetas de gelbooru puede heredar sesgos del vocabulario y las convenciones de esa comunidad, incluyendo tags de contenido adulto o estigmatizante.
- Riesgo de alucinación: como modelo generativo de pequeño tamaño, puede producir tags inexistentes o incorrectos, especialmente en imágenes fuera de la distribución booru.
- Limitaciones de contexto o idioma: no se documentan la longitud de contexto ni los idiomas soportados; el vocabulario de entrenamiento está centrado en tags booru, mayoritariamente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base taobao-mnn/MNN-Pocket-0.3B, que no se detalla en la información disponible.
- Caveat para producción: la información pública es muy escasa (sin benchmarks, sin detalles de entrenamiento, sin resolución de imagen), lo que dificulta evaluar su robustez; se recomienda validación empírica antes de desplegarlo.
- El repositorio tiene un tamaño de 4,3 GB, notablemente superior a lo esperado para 375 millones de parámetros, lo que sugiere pesos en múltiples precisiones o artefactos adicionales no documentados.

## Enlaces

- [Hugging Face: nebulette/mnn-pocket-0.3b-vision](https://huggingface.co/nebulette/mnn-pocket-0.3b-vision)
- [Modelo base: taobao-mnn/MNN-Pocket-0.3B](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B)
- [Referencia técnica in-fusion (placement)](https://unbundling.github.io/#placement)
- Referencia arXiv citada en la model card: 2611.17334 (no verificable en la información disponible)
