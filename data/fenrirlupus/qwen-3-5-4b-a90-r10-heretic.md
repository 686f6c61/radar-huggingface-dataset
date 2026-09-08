# FenrirLupus/Qwen-3.5-4B-A90-R10-Heretic

## Resumen

El modelo FenrirLupus/Qwen-3.5-4B-A90-R10-Heretic es una adaptación del modelo Qwen/Qwen3.5-4B, publicada en Hugging Face el 7 de septiembre de 2026 por el usuario FenrirLupus. Se trata de una variante "abliterated" que aplica la técnica Heretic, cuyo objetivo es suprimir los mecanismos de rechazo (refusal suppression) presentes en el modelo base alineado. Según los resultados de la búsqueda web, la técnica Heretic v1.2.0 emplea una supresión de rechazos multidireccional, lo que permite que el modelo responda a solicitudes que el modelo original probablemente rechazaría.

El modelo cuenta con 4.539.265.536 parámetros, se distribuye bajo licencia Apache-2.0 y está disponible en formatos safetensors y GGUF, con un tamaño total de repositorio de 17,7 GB. Pertenece a la familia Qwen3.5, que según el repositorio GitHub de Qwen3.5 es una serie de modelos de lenguaje de gran tamaño desarrollada por Alibaba Cloud, integrable con plataformas como Model Studio y compatible con múltiples especificaciones de API. Su relevancia actual radica en el creciente interés por modelos open source sin restricciones de seguridad, utilizados para investigación en alineación, generación creativa y experimentación, aunque su uso conlleva riesgos importantes en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se ha indicado si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors, GGUF (sin información sobre niveles de bits) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo de lenguaje de gran tamaño de la familia Qwen3.5. La serie Qwen3.5, según la documentación pública encontrada, es una línea de modelos LLM desarrollada por Alibaba Cloud, con soporte oficial a través de Alibaba Cloud Model Studio y compatibilidad con especificaciones API de tipo OpenAI y Anthropic. No se han proporcionado detalles sobre la arquitectura interna (número de capas, tipo de atención, mecanismos de decodificación) ni sobre el proceso de entrenamiento del modelo base.

La modificación específica de este repositorio consiste en la aplicación de la técnica "Heretic", un método de abliteración que reduce o elimina los comportamientos de rechazo típicos de los modelos alineados. Según la información de la búsqueda web, la técnica utiliza supresión de rechazos multidireccional. No se dispone de datos sobre los datos de entrenamiento, el número de tokens utilizados, ni sobre la aplicación de RLHF o DPO en esta versión concreta. La etiqueta "endpoints_compatible" sugiere que el modelo se puede servir mediante APIs compatibles con Hugging Face Endpoints, pero no se han publicado detalles adicionales de implementación.

## Capacidades

- Generación de texto y conversación: el tag "conversational" en Hugging Face indica que el modelo está orientado a interacciones de chat, aunque no se especifican límites ni calidad de las respuestas.
- Supresión de rechazos: la técnica Heretic aplicada reduce los rechazos del modelo, lo que puede permitir respuestas a temas que el modelo base alineado rechazaría. Esta característica es la principal diferenciación del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento (thinking mode): las variantes documentadas de modelos Qwen3.5-4B-Heretic, como TheCluster/Qwen3.5-4B-Heretic-MLX-mxfp8, indican que el modelo base soporta un modo de pensamiento, aunque deshabilitado por defecto. No se confirma si esta versión mantiene dicha capacidad.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite comparar el comportamiento entre una versión alineada y una versión abliterada, útil para estudiar los efectos del rechazo en modelos pequeños de 4B y desarrollar técnicas de moderación posteriores.
- Generación de contenido creativo sin restricciones temáticas: escritores y creadores pueden usar el modelo para generar historias, diálogos o guiones que el modelo base rechazaría por su contenido, con la responsabilidad de aplicar filtros adicionales en la aplicación final.
- Asistentes de rol (roleplay) con libertad temática: debido a su carácter "uncensored", es adecuado para juegos de rol o simulaciones de personajes en los que los usuarios esperan respuestas sin limitaciones morales impuestas por el sistema.
- Experimentación en entornos controlados: laboratorios y desarrolladores pueden desplegar el modelo en entornos aislados para probar hipótesis sobre el efecto de la abliteración en la calidad, coherencia y alucinación, sin riesgo de afectar servicios de producción.
- Prototipado de aplicaciones conversacionales con requisitos de neutralidad en temas controvertidos: en aplicaciones donde se requieren respuestas directas sobre temas sensibles sin el rechazo típico de modelos alineados, este modelo ofrece una alternativa, siempre que se implemente una capa de moderación de salida.
- Fine-tuning para dominios específicos: al ser un modelo de 4B con licencia Apache-2.0, es viable para fine-tuning en tareas concretas (por ejemplo, análisis de textos con jerga especializada) donde el coste computacional es moderado y el usuario desea un modelo sin los filtros de seguridad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para el formato sin cuantizar en FP16, los pesos del modelo ocupan aproximadamente 9 GB, por lo que se recomienda una GPU con al menos 12 GB de VRAM para un margen de seguridad. Con cuantización GGUF en 4 bits, la VRAM requerida se reduce a aproximadamente 3-4 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o RTX 4070 pueden ejecutar la versión FP16. Para la cuantización GGUF en 4 bits, bastan GPUs con 6 GB u 8 GB de VRAM, como una RTX 3050 o RTX 4060. En entornos de producción, se recomiendan A10G, A100 o H100 para mayor throughput.
- Compatibilidad con consumer GPUs: sí, el modelo se puede ejecutar en GPUs de gama media, especialmente con cuantización. Con FP16, el consumo de VRAM es alto para tarjetas de menos de 12 GB, por lo que se recomienda usar GGUF cuantizado.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y Hugging Face Text Generation Inference (TGI) son opciones compatibles con los formatos safetensors y GGUF. La etiqueta "endpoints_compatible" indica que puede servirse mediante la infraestructura de Hugging Face Endpoints.
- Latencia y throughput: no disponible; no se han publicado mediciones de rendimiento para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FenrirLupus/Qwen-3.5-4B-A90-R10-Heretic | 4,54 B | no disponible | Apache-2.0 | Hugging Face |
| TheCluster/Qwen3.5-4B-Heretic-MLX-mxfp8 | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Al ser un modelo abliterado, puede generar contenido dañino, ilegal, ofensivo o sesgado sin los filtros automáticos del modelo base. El uso en aplicaciones públicas exige implementar mecanismos de moderación de salida.
- Riesgo de alucinación inherente a un modelo de 4B; no se ha verificado su calidad de respuesta mediante benchmarks públicos, por lo que la fiabilidad de las salidas es desconocida.
- No hay información sobre los datos de entrenamiento, composición del dataset ni sesgos específicos. Los sesgos del modelo base Qwen3.5 podrían persistir y verse amplificados por la eliminación de rechazos.
- La ausencia de documentación sobre la longitud de contexto, los idiomas soportados y las capacidades técnicas (tool calling, agentes, modo de pensamiento) dificulta evaluar su idoneidad para casos de uso concretos.
- La licencia Apache-2.0 permite el uso comercial, pero el usuario debe revisar los términos del modelo base y los atributos de uso aceptables para asegurar que la modificación no infrinja ninguna restricción adicional.

## Enlaces

- https://huggingface.co/FenrirLupus/Qwen-3.5-4B-A90-R10-Heretic
- https://huggingface.co/TheCluster/Qwen3.5-4B-Heretic-MLX-mxfp8
- https://github.com/ABDtmx/Qwen3.5
