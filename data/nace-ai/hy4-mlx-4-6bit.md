# nace-ai/Hy4-MLX-4.6bit

## Resumen

Hy4-MLX-4.6bit es una cuantización del modelo Hy4 de Tencent, publicada por Nace.AI. Se trata de una versión comprimida del modelo original que reduce el peso de los pesos de texto hasta un promedio de 4,6 bits por peso, manteniendo los 78 decodificadores y los 256 expertos enrutados de cada capa MoE. El resultado es un conjunto de pesos de 447,3 GB (456,3 GB de descarga completa incluyendo pesos no de texto), lo que facilita el despliegue en hardware más modesto que el modelo original.

El modelo base Hy4 es un transformer con arquitectura Mixture-of-Experts (MoE) y capacidades de visión y lenguaje (etiqueta hy_v4_vl). Con 774.434.002.142 parámetros totales, es un modelo de escala muy grande orientado a generación de texto, conversación y tareas multimodales. Esta cuantización está pensada para inferencia en Apple Silicon mediante la librería MLX, aunque la model card incluye también un runner para Linux con CUDA 13 probado en una NVIDIA A40.

La relevancia de esta ficha radica en que permite evaluar una alternativa cuantizada de un modelo frontera de Tencent con licencia propia, útil para equipos que necesitan desplegar un MoE de gran tamaño en infraestructura limitada. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y la información publicada sobre arquitectura, entrenamiento y benchmarks es muy escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), 78 capas decodificadoras, 256 expertos enrutados por capa MoE; etiqueta hy_v4_vl (visión-lenguaje) |
| Parámetros totales | 774.434.002.142 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización de pesos con precisión mixta: expertos enrutados a 4 bits, matrices troncales elegibles a 8 bits, routers, expansión KV y parámetros sensibles en mayor precisión; promedio de 4,6 bits por peso en el modelo de texto |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License, Version 1.0), con términos comerciales de la Sección 10 para grandes operadores de Model-as-a-Service |
| Formato de pesos | safetensors (librería MLX); incluye runner para Linux CUDA 13 |

## Arquitectura y entrenamiento

El modelo base Hy4 emplea una arquitectura transformer con capas de Mixture-of-Experts: 78 capas decodificadoras y 256 expertos enrutados en cada capa MoE. La cuantización de Nace.AI conserva todos los expertos enrutados y asigna precisión por clase de peso: los expertos enrutados se almacenan a 4 bits, las matrices troncales elegibles a 8 bits, y los routers, la expansión KV y los parámetros sensibles mantienen mayor precisión. El modelo de texto promedia 4,6 bits por peso y el conjunto completo de pesos de texto ocupa 447,3 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones técnicas del modelo base como decodificación especulativa o atención lineal. La model card se centra exclusivamente en el proceso de cuantización y en las instrucciones de ejecución.

## Capacidades

- Generación de texto y conversación multi-turno, según la etiqueta de pipeline text-generation y conversational.
- Capacidades de visión y lenguaje, derivadas de la etiqueta hy_v4_vl del modelo base.
- Razonamiento y matemáticas: no confirmado explícitamente en la información disponible.
- Generación de código: no confirmado explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de un MoE de gran escala en Apple Silicon: gracias al formato MLX y a la cuantización a 4,6 bits, el modelo puede ejecutarse en equipos con memoria unificada amplia, reduciendo la barrera de entrada frente al modelo original de 774.000 millones de parámetros.
- Inferencia en servidores con GPU NVIDIA: la model card incluye un runner para Linux con CUDA 13 probado en una A40, lo que permite desplegar el modelo en infraestructura CUDA existente sin depender del ecosistema Apple.
- Investigación sobre cuantización de precisión mixta: el esquema de Nace Weight Space Quantization, con expertos a 4 bits y tronco a 8 bits, sirve como caso de estudio para evaluar el impacto de distintas precisiones por clase de peso en modelos MoE.
- Prototipado de asistentes conversacionales: al ser un modelo de generación de texto y conversacional, puede usarse para construir chatbots y asistentes en entornos de desarrollo y pruebas.
- Experimentación multimodal texto-visión: la etiqueta hy_v4_vl sugiere capacidades de visión-lenguaje, útiles para tareas que combinen imagen y texto, aunque la documentación no detalla el alcance exacto.
- Evaluación comparativa de modelos frontera cuantizados: útil para equipos que quieran medir el compromiso entre tamaño, precisión y calidad frente al Hy4 original u otros MoE de escala similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el conjunto de pesos de texto ocupa 447,3 GB y la descarga completa 456,3 GB, por lo que se requiere memoria unificada o VRAM del orden de cientos de GB.
- GPU recomendadas: NVIDIA A40 probada según la model card; no se especifican otras GPU recomendadas.
- ¿Cabe en GPU de consumo? No se dispone de datos que lo confirmen; el tamaño de los pesos (más de 400 GB) excede la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: librería MLX y runner incluido para Linux con CUDA 13; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-MLX-4.6bit (esta ficha) | 774.434.002.142 | no disponible | 4,6 bits por peso (mixta) | tencent-hy-license | Hugging Face, 0 descargas |
| tencent/Hy4 (modelo base) | no disponible en la información | no disponible | pesos originales | tencent-hy-license | Hugging Face |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros modelos MoE de escala similar (por ejemplo, alternativas de otros proveedores) en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta sesgos del modelo base ni de la cuantización.
- Riesgo de alucinación: no documentado; al ser un modelo de generación de texto de gran escala, el riesgo existe pero no se cuantifica en la información disponible.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide garantizar su comportamiento en lenguas distintas del inglés o en ventanas de contexto largas.
- Restricciones de licencia: la Tencent Hy License, Version 1.0, incluye términos comerciales específicos en su Sección 10 para grandes operadores de Model-as-a-Service; es imprescindible revisar LICENSE, NOTICE y MODIFICATIONS.md antes de un uso comercial.
- Caveat de producción: el repositorio no tiene descargas ni likes, y la documentación sobre arquitectura, entrenamiento y evaluación es mínima; se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo.
- Requisitos de hardware: el tamaño de los pesos (más de 400 GB) limita su despliegue a infraestructura con memoria muy amplia; el runner probado es específico para Linux con CUDA 13.
- La cuantización a 4,6 bits puede degradar la calidad respecto al modelo original; no se publican métricas que cuantifiquen esa pérdida.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Hy4-MLX-4.6bit
- Modelo base: https://huggingface.co/tencent/Hy4
- Nace.AI: https://www.nace.ai/
- Licencia (LICENSE en el repositorio): https://huggingface.co/nace-ai/Hy4-MLX-4.6bit/blob/main/LICENSE
- NOTICE: https://huggingface.co/nace-ai/Hy4-MLX-4.6bit/blob/main/NOTICE
- Modificaciones: https://huggingface.co/nace-ai/Hy4-MLX-4.6bit/blob/main/MODIFICATIONS.md
