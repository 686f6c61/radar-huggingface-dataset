# mradermacher/WePocketModel1.0-4B-i1-GGUF

## Resumen

WePocketModel1.0-4B es un modelo multimodal de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado originalmente por Tencent. Está diseñado para despliegue en dispositivo (on-device) y combina capacidades de generación conversacional con embeddings multimodales, representación multi-resolución (MRL) y decisión estructurada. La ficha que nos ocupa documenta la versión cuantizada en GGUF publicada por mradermacher, un conocido autor de cuantizaciones del ecosistema llama.cpp.

El modelo aborda el problema de ejecutar tareas multimodales y de razonamiento estructurado en hardware con recursos limitados, un escenario cada vez más demandado para asistentes locales, agentes embebidos y pipelines de recuperación multimodal. Su tamaño compacto y su licencia Apache 2.0 lo hacen atractivo para integraciones comerciales sin fricción legal.

Esta versión concreta (i1-GGUF) ofrece cuantizaciones ponderadas con imatrix en el rango de 1,6 GB a 3,6 GB, lo que permite ejecutar el modelo en GPUs de consumo e incluso en CPU. Es relevante ahora porque el ecosistema GGUF y llama.cpp permite desplegar modelos multimodales de forma portable, y porque la familia WePocketModel apunta a un nicho específico: modelos pequeños con capacidades de embedding y decisión estructurada, no solo generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte de embeddings y decisión estructurada; detalles de la arquitectura base no publicados en la información disponible) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de cuantizaciones estáticas en el repo hermano) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en safetensors vía transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base tencent/WePocketModel1.0-4B. Los tags indican que se trata de un modelo multimodal con capacidades de embedding multimodal, representación multi-resolución (MRL) y decisión estructurada, orientado a despliegue on-device. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable en esta publicación no reside en el modelo base, sino en el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (i1) usando un fichero imatrix propio, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. Se incluyen tanto cuantizaciones K-quant como IQ-quant, con recomendaciones explícitas del autor (por ejemplo, i1-Q4_K_M como opción "rápida y recomendada", e i1-IQ4_XS como preferible a IQ4_NL). Los ficheros mmproj para la parte visual, si existen, se alojan en el repositorio estático hermano.

## Capacidades

- Generación de texto conversacional en inglés (tag "conversational").
- Procesamiento multimodal: el modelo es de visión según la model card, con soporte de embeddings multimodales.
- Embeddings multimodales: útil para tareas de recuperación y búsqueda semántica que combinen texto e imagen.
- Representación multi-resolución (MRL): permite truncar la dimensionalidad de los embeddings para ajustar coste y precisión.
- Decisión estructurada (structured-decision): orientado a tareas de clasificación o selección con salida estructurada.
- Despliegue on-device: diseñado para ejecución local con recursos limitados.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.

## Casos de uso

- Asistentes locales en dispositivo: el modelo puede ejecutarse en un portátil o mini-PC con GPU de consumo gracias a sus cuantizaciones de 2-3 GB, sirviendo como asistente conversacional sin conexión a la nube.
- Búsqueda semántica multimodal: al generar embeddings multimodales con MRL, puede indexar y recuperar imágenes y textos en un mismo espacio vectorial, permitiendo búsquedas del tipo "encuentra imágenes parecidas a esta descripción".
- Clasificación y decisión estructurada: su capacidad de structured-decision lo hace adecuado para enrutamiento de consultas, etiquetado automático o selección entre opciones predefinidas en pipelines de backend.
- Procesamiento de documentos con imágenes: extracción de información de capturas, formularios o facturas escaneadas combinando la parte visual y la textual del modelo.
- Prototipado rápido de aplicaciones de visión: al estar en GGUF, se puede integrar en llama.cpp u Ollama para validar ideas sin infraestructura GPU dedicada.
- Filtrado y moderación de contenido local: clasificación de imágenes y texto en el propio dispositivo para reducir latencia y preservar privacidad.
- Aplicaciones de privacidad estricta: al ejecutarse on-device, los datos no salen del equipo, lo que encaja en entornos sanitarios, legales o industriales con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre ~1,6 GB (i1-IQ1_S) y ~3,6 GB (i1-Q6_K) para los pesos cuantizados; hay que sumar el espacio del contexto KV y, en su caso, el proyector visual (mmproj) alojado en el repositorio estático.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las cuantizaciones medias (por ejemplo, RTX 3060, RTX 4060, RTX 4090 para mayor throughput). Para las cuantizaciones Q5/Q6 se recomienda 6-8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más; las cuantizaciones IQ2/IQ3 permiten incluso GPUs de 2-3 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base también es utilizable con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WePocketModel1.0-4B (i1-GGUF) | ~4,2 B | no disponible | Apache 2.0 | GGUF | Multimodal, embeddings, MRL, on-device |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan sesgos específicos, pero al no publicarse detalles del dataset de entrenamiento no es posible evaluar su comportamiento en dominios sensibles.
- Alucinación: como todo modelo generativo, puede producir contenido incorrecto; su tamaño compacto incrementa el riesgo en tareas de conocimiento factual.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar conversaciones multi-turno largas.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- Parte visual: los ficheros mmproj, si existen, no están en este repositorio sino en el estático; hay que descargarlos por separado para usar la funcionalidad de visión.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Tencent.
- Producción: al no haber benchmarks publicados, se recomienda evaluar el modelo en el dominio concreto antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face (esta versión): https://huggingface.co/mradermacher/WePocketModel1.0-4B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/WePocketModel1.0-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WePocketModel1.0-4B
- Página de resumen del autor: https://hf.tst.eu/model#WePocketModel1.0-4B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
