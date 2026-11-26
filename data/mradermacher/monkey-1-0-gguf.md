# mradermacher/Monkey-1.0-GGUF

## Resumen

Monkey-1.0 es un modelo de lenguaje conversacional desarrollado por Little-AI, distribuido originalmente en formato Transformers y cuantizado a GGUF por mradermacher para facilitar su ejecución en hardware de consumo. Con 9.197.093.888 parámetros totales (aproximadamente 9,2 mil millones), se posiciona en la franja de modelos de tamano medio, un segmento especialmente interesante para despliegues locales y entornos con recursos limitados.

La versión aquí documentada es una cuantización estática del modelo base Little-AI/Monkey-1.0, publicada el 26 de noviembre de 2026. El repositorio incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta f16, además de dos variantes mmproj que sugieren capacidades multimodales), lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. El modelo está etiquetado como conversacional y orientado al idioma inglés.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 9B en GPUs de consumo mediante llama.cpp u Ollama, con opciones que van desde los 4,1 GB de la cuantización Q2_K hasta los 18,5 GB de f16. No obstante, la información pública disponible sobre el modelo base es muy limitada: no se detallan arquitectura interna, datos de entrenamiento, benchmarks ni licencia, lo que condiciona la evaluación rigurosa del mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors según metadatos de parámetros |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base Little-AI/Monkey-1.0. Los metadatos de Hugging Face indican que es compatible con la librería Transformers y que el recuento de parámetros se ha obtenido de los pesos en safetensors (9.197.093.888 parámetros). No se especifica si emplea atención estándar, atención lineal, mezcla de expertos (MoE) u otra variante, ni el número de capas, dimensiones ocultas o cabezas de atención.

Tampoco se han publicado detalles sobre el corpus de entrenamiento (número de tokens, composición del dataset, proporción de código, matemáticas o datos multilingües), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. La presencia de ficheros mmproj en la cuantización sugiere que el modelo base podría tener capacidades multimodales (visión), pero este extremo no está confirmado en la documentación disponible. La única innovación técnica documentada por el cuantizador es el uso de cuantizaciones estáticas, sin variantes ponderadas/imatrix en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Posible soporte multimodal (visión) inferido de la existencia de ficheros mmproj-Q8_0 y mmproj-f16; no confirmado en la model card.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan capacidades de código, matemáticas o thinking mode.
- Capacidades multilingües limitadas al inglés según el campo `language`.

## Casos de uso

- Asistentes conversacionales locales en inglés: con cuantizaciones Q4_K_M (5,9 GB) o Q5_K_M (6,8 GB) el modelo cabe en GPUs de consumo de 8-12 GB, permitiendo desplegar un chatbot privado sin dependencia de la nube.
- Prototipado rápido de aplicaciones de chat: la disponibilidad de formatos GGUF y la compatibilidad con llama.cpp u Ollama permiten integrar el modelo en una aplicación en minutos, ideal para validar flujos conversacionales antes de invertir en infraestructura mayor.
- Evaluación de modelos de 9B en investigación: sirve como punto de comparación frente a otros modelos de tamano similar en tareas de generación de texto y diálogo, aunque la ausencia de benchmarks publicados limita la comparación objetiva.
- Despliegue en entornos con recursos restringidos: la cuantización Q2_K (4,1 GB) permite ejecutar el modelo en GPUs de 6 GB o incluso en CPU con RAM suficiente, útil para demos y entornos educativos.
- Experimentación multimodal (si se confirma la visión): los ficheros mmproj permitirían, en teoría, procesar imágenes junto con texto en llama.cpp, aunque esta capacidad no está documentada por el autor del modelo base.
- Integración en pipelines de inferencia compatibles con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante APIs estándar, facilitando su uso en arquitecturas de microservicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~4,1 GB de pesos; ~5-6 GB de VRAM total con contexto moderado.
  - Q3_K_M: ~4,9 GB de pesos; ~6-7 GB de VRAM.
  - Q4_K_S / Q4_K_M: ~5,6-5,9 GB de pesos; ~7-8 GB de VRAM.
  - Q5_K_M: ~6,8 GB de pesos; ~8-9 GB de VRAM.
  - Q6_K: ~7,7 GB de pesos; ~9-10 GB de VRAM.
  - Q8_0: ~9,9 GB de pesos; ~11-12 GB de VRAM.
  - f16: ~18,5 GB de pesos; ~20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones Q4-Q8; A100/H100 para f16 o despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6 GB hasta Q8_0 en GPUs de 12 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI si se dispone de los pesos originales en safetensors.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Monkey-1.0 (esta ficha) | ~9,2 B | no disponible | no disponible | GGUF, safetensors | Conversacional, inglés, posible multimodal |
| Alternativas de ~7-9B | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificada de modelos comparables en la documentación proporcionada |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos de la misma categoría. Se recomienda consultar repositorios de referencia de modelos de 7-9B con licencias y benchmarks publicados antes de tomar una decisión de adopción.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con Little-AI antes de un despliegue en producción.
- No se han publicado benchmarks, lo que impide evaluar su calidad frente a alternativas.
- Idiomas limitados al inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin datos de alineación (RLHF/DPO) no se puede estimar su magnitud.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza o ideológicos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; se recomienda Q4_K_M o superior para uso real.
- La capacidad multimodal es una inferencia a partir de los ficheros mmproj y no está confirmada por el autor del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción nula y ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/Monkey-1.0-GGUF
- Modelo base: https://huggingface.co/Little-AI/Monkey-1.0
- Página de descargas del cuantizador: https://hf.tst.eu/model#Monkey-1.0-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
