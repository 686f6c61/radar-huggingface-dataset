# Nbighir/Huihui-GLM-5.3-Flash-abliterated-GGUF

# Nbighir/Huihui-GLM-5.3-Flash-abliterated-GGUF: ficha de modelo

## Resumen

Huihui-GLM-5.3-Flash-abliterated-GGUF es una versión sin rechazos ("abliterated") del modelo multimodal zai-org/GLM-5.3-Flash, publicada en formato GGUF por el usuario Nbighir. GLM-5.3-Flash es un modelo de lenguaje y visión desarrollado por Zhipu AI (organización zai-org) con aproximadamente 320.759 millones de parámetros totales y una arquitectura de mezcla de expertos (MoE). La abliteración es una técnica de edición de pesos que localiza y suprime las direcciones de activación asociadas a las respuestas de rechazo, de modo que el modelo deja de negarse a responder a determinadas peticiones.

La relevancia de esta ficha está en que permite evaluar con rapidez una variante sin filtros de seguridad de un modelo de gran tamaño, algo útil en investigación sobre alineación, red-teaming y análisis de sesgos. El autor advierte de que se trata de una implementación "cruda" y de prueba de concepto, en la que solo se han ablacionado las capas 15 a 35 (indexación desde 0), mientras que el resto de capas y todos los módulos de expertos permanecen intactos.

Los pesos GGUF proceden de unsloth/GLM-5.3-Flash-GGUF y se ejecutan con una rama específica de llama.cpp. El modelo soporta inglés y chino, declara licencia MIT y, según el ejemplo de ejecución del autor, admite una ventana de contexto de 262.144 tokens (256K).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer multimodal; la model card menciona módulos de expertos, pero no detalla la configuración |
| Parámetros totales | 320.759.404.382 (~320,7 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K), según el ejemplo de ejecución del autor |
| Tipos de cuantización | GGUF; variante UD-Q4_K_XL confirmada y cuantización con imatrix; el resto de variantes no está detallado |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (el UD-Q4_K_XL se reparte en 6 fragmentos); la etiqueta de librería indica además transformers |

## Arquitectura y entrenamiento

GLM-5.3-Flash es un modelo multimodal de tipo image-text-to-text, lo que implica que procesa entradas de imagen y texto y genera texto. La mención explícita a "expert modules" en la model card confirma que la arquitectura subyacente es una mezcla de expertos (MoE), aunque no se detalla el número de expertos, la dimensionalidad ni los parámetros activos por token. Tampoco se documenta el mecanismo de atención empleado ni si existe decodificación especulativa u otra innovación de inferencia.

El proceso de abliteración aplicado es parcial: solo se han ablacionado las capas 15 a 35 (indexación desde 0) y los módulos de expertos no se han tocado. El autor no documenta el conjunto de datos de calibración ni los prompts usados para calcular las direcciones de rechazo, ni aporta información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO). Los pesos GGUF se han generado a partir de unsloth/GLM-5.3-Flash-GGUF.

## Capacidades

- Procesamiento multimodal de imagen y texto: el pipeline declarado es image-text-to-text, de modo que el modelo acepta imágenes junto a texto y genera texto.
- Generación de texto conversacional: la etiqueta conversational indica uso en diálogo multi-turno.
- Respuestas sin filtros de rechazo en las capas 15 a 35: reduce la probabilidad de negativas ante peticiones que el modelo base rechazaría.
- Capacidades multilingües limitadas a inglés y chino; no hay soporte declarado de español.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.
- Razonamiento, código y matemáticas: no se documentan capacidades específicas ni resultados que las confirmen.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas del modelo abliterado con las del base zai-org/GLM-5.3-Flash para medir cuánto cambia el comportamiento de rechazo tras ablacionar las capas 15 a 35.
- Red-teaming y evaluación de robustez: someter el modelo a baterías de prompts adversarios en un entorno aislado para identificar qué tipos de contenido genera cuando se eliminan los filtros.
- Análisis multimodal en laboratorio: aprovechar la capacidad image-text-to-text para tareas internas de descripción o extracción de información a partir de imágenes y texto en inglés o chino.
- Generación de texto técnico en inglés y chino: redacción de documentación o resúmenes en los dos idiomas soportados, siempre con revisión humana por la ausencia de filtros.
- Estudio de arquitecturas MoE de gran escala: analizar el comportamiento de un modelo de ~320,7 mil millones de parámetros en formato GGUF cuantizado y con contexto de 256K.
- Base para fine-tuning de investigación: partir de los pesos GGUF o del modelo base para ajustes posteriores en estudios académicos controlados.
- Despliegue en entornos aislados: ejecutar el modelo con llama.cpp en infraestructura local sin conexión, útil cuando no se puede llamar a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 450,8 GB en total, repartidos entre las distintas variantes GGUF y sus fragmentos; el UD-Q4_K_XL se divide en 6 archivos.
- VRAM estimada (solo pesos, a partir de 320,7 mil millones de parámetros): ~180 GB para una cuantización de ~4,5 bits por peso (tipo Q4_K_XL), ~105 GB para ~2,6 bits (tipo Q2_K) y ~340 GB para ~8,5 bits (tipo Q8_0). Son estimaciones; los tamaños reales por archivo no están publicados.
- Memoria adicional para la caché KV: con una ventana de 262.144 tokens, la caché KV puede exigir decenas o cientos de GB extra según el número de capas activas; no se dispone de cifras concretas.
- GPU recomendadas: varias NVIDIA A100 de 80 GB o H100 de 80 GB en paralelo (al menos 3 para Q4_K_XL). No cabe en GPUs de consumo como la RTX 4090 (24 GB) ni en una sola GPU profesional de 80 GB.
- Despliegue: llama.cpp, concretamente la rama del PR de unslothai (rama glm5next/upstream). El autor no confirma compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nbighir/Huihui-GLM-5.3-Flash-abliterated-GGUF | ~320,7 mil millones (MoE) | 262.144 tokens | MIT | GGUF | Abliteración parcial (capas 15-35) |
| zai-org/GLM-5.3-Flash | ~320,7 mil millones (MoE) | no disponible | no disponible | no disponible | Modelo base, con filtros de seguridad |
| unsloth/GLM-5.3-Flash-GGUF | ~320,7 mil millones (MoE) | no disponible | no disponible | GGUF | Cuantizaciones sin abliterar; origen de los pesos de esta ficha |

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la abliteración de las capas 15 a 35 puede producir contenido sensible, controvertido o inapropiado; el autor recomienda revisar manualmente las salidas.
- Abliteración incompleta: solo se han modificado las capas 15 a 35 y ningún módulo de expertos, por lo que el comportamiento de rechazo puede seguir apareciendo de forma inconsistente.
- Prueba de concepto: el propio autor describe el método como "crudo" y orientado a investigación, no a producción.
- Riesgo de alucinación: no se han publicado métricas de fidelidad; como todo modelo generativo puede inventar datos y aquí no hay evaluación que lo cuantifique.
- Idiomas: solo inglés y chino; no hay soporte declarado de español.
- Licencia: la model card declara MIT, pero al derivar de zai-org/GLM-5.3-Flash conviene verificar las condiciones del modelo base antes de un uso comercial. El autor desaconseja el uso en producción o en aplicaciones comerciales de cara al público.
- Dependencia de una rama específica de llama.cpp: el modelo requiere el fork de unslothai (rama glm5next/upstream), lo que añade fricción al despliegue y puede limitar el soporte en herramientas estándar.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 0 "me gusta", y no incluye benchmarks, por lo que su calidad no está contrastada por terceros.
- Discrepancia de autoría: el identificador del repositorio es Nbighir, mientras que el título de la model card hace referencia a huihui-ai, lo que sugiere una re-subida; conviene confirmar el origen real de los pesos.
- Responsabilidad legal: el usuario es responsable del contenido generado y de su adecuación a la legislación aplicable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nbighir/Huihui-GLM-5.3-Flash-abliterated-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizaciones GGUF de origen: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Repositorio de abliteración de referencia: https://github.com/Sumandora/remove-refusals-with-transformers
- Fork de llama.cpp con soporte para GLM-5.3-Flash (rama glm5next/upstream): https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
- Página de huihui-ai (autor citado en la model card): https://huggingface.co/huihui-ai
- Apoyo al autor (Ko-fi): https://ko-fi.com/huihuiai
