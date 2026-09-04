# schneewolflabs/B0-27B-GGUF

# B0-27B GGUF

## Resumen
El modelo B0-27B, desarrollado por schneewolflabs, es un modelo de lenguaje multimodal de 27 320 millones de parámetros distribuido en formato GGUF. Se trata de una cuantización Q8_0 del modelo original B0-27B, con soporte para tareas de imagen-texto a texto y capacidades de agentes y tool use, tal y como indican las etiquetas del repositorio en Hugging Face.

La versión GGUF incorpora un archivo de proyecto multimodal (mmproj) en f16 y conserva los tensores MTP, lo que permite activar decodificación especulativa en llama.cpp mediante la opción `--spec-type draft-mtp`. Está publicado bajo licencia Apache 2.0 y permite un despliegue local con llama-server u otras herramientas compatibles. No se dispone de información pública sobre la arquitectura interna, los datos de entrenamiento ni la longitud de contexto máxima.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 27 320 697 856 (27 320 M) |
| Longitud de contexto | no disponible (en el ejemplo de uso se configura 16 384) |
| Tipos de cuantización | Q8_0 (GGUF); mmproj en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj en f16) |

## Arquitectura y entrenamiento
No hay detalles públicos sobre la arquitectura subyacente ni el proceso de entrenamiento. El único dato técnico disponible es que esta versión es una cuantización Q8_0 del modelo schneewolflabs/B0-27B, y que el proyecto multimodal (encoder de visión) se distribuye en f16. Los tensores MTP se mantienen intactos, lo que significa que el modelo puede usarse con la decodificación especulativa de MTP en llama.cpp. No se ha publicado información sobre la composición del dataset, el número de tokens o técnicas de alineación como RLHF o DPO.

## Capacidades
- Procesamiento de entradas multimodales: puede recibir imágenes y texto y generar respuestas de texto, gracias al pipeline image-text-to-text y al mmproj incluido.
- Soporte de tool use / function calling: las etiquetas del repositorio indican que el modelo está preparado para usarse en agentes que necesiten invocar herramientas.
- Generación conversacional: diseñado para interacciones tipo chat.
- Decodificación especulativa: los tensores MTP permiten usar `--spec-type draft-mtp` con llama-server y reducir la latencia de generación.
- Integración local: el formato GGUF facilita el despliegue con llama.cpp, ollama, o interfaces compatibles.
- Capacidades multilingües: no disponibles en la información facilitada.
- Soporte de agentes y razonamiento multi-paso: no hay datos concretos más allá del tag "agents".

## Casos de uso
- Asistencia visual en local: un usuario puede subir una captura de pantalla o fotografía y hacer preguntas en lenguaje natural; el modelo responderá sin necesidad de servicios en la nube.
- Agentes con tool calling: el modelo puede integrarse en un pipeline de automatización donde recibe solicitudes, decide qué herramienta usar (por ejemplo, una API de búsqueda o una calculadora) y ejecuta la llamada.
- Análisis de documentación con imágenes: el modelo procesa informes con gráficos, diagramas o capturas para extraer información y generar resúmenes.
- Soporte técnico con evidencia visual: un agente de helpdesk puede usar el modelo para interpretar errores en la pantalla del usuario y sugerir soluciones.
- RAG multimodal: el modelo puede combinarse con un sistema de recuperación de documentos que incluya tanto texto como imágenes, para responder preguntas sobre informes técnicos o manuales.
- Despliegue en entornos sin GPUs dedicadas: gracias al formato GGUF y la cuantización Q8_0, el modelo puede ejecutarse en CPU con una cuantización agresiva o en GPU de gama alta, permitiendo inferencia privada en infraestructuras locales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el peso cuantizado Q8_0 ocupa aproximadamente 27,3 GB (27 320 697 856 bytes). Con el mmproj en f16 (tamaño desconocido) y la memoria para KV cache, se necesita una GPU con al menos 30 GB de VRAM en configuraciones a plena descarga (`-ngl 99`).
- GPU recomendadas: NVIDIA A100 40 GB o 80 GB, H100, o GPUs de estación de trabajo con 48 GB (por ejemplo, RTX A6000). En GPUs consumer con 24 GB no cabe el modelo completo en Q8_0 sin reducir la capa en GPU o usar cuantizaciones adicionales.
- Ejecución en CPU: es posible ejecutar en CPU con suficiente memoria RAM (más de 32 GB) y velocidad limitada.
- Opciones de despliegue: llama.cpp / llama-server, ollama (si se importa el GGUF), y bibliotecas basadas en GGUF que soporten multimodales y MTP.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de información suficiente para una comparativa fiable con modelos equivalentes. El repositorio no publica datos de rendimiento ni se conocen alternativas directas de la misma categoría y tamaño con licencia Apache 2.0.

## Limitaciones y advertencias
- La información pública es muy limitada: no se han publicado detalles sobre sesgos, calidad de las respuestas ni comportamiento en tareas complejas.
- La etiqueta "qwen3.8" sugiere una posible relación con esa familia, pero no hay documentación que lo confirme.
- La cuantización Q8_0 puede introducir una pérdida de calidad frente al modelo original en precisión completa.
- La fecha de creación de los metadatos (4 de septiembre de 2026) es posterior a la fecha de esta consulta, lo que podría indicar un error en los metadatos o un proyecto experimental; conviene verificar la disponibilidad y estabilidad antes de usarlo en producción.
- No se especifican idiomas soportados, por lo que el comportamiento en lenguas distintas de las de entrenamiento es incierto.
- Para el uso de la funcionalidad multimodal, es obligatorio incluir el archivo mmproj y usar un runtime compatible con GGUF y vision.

## Enlaces
- https://huggingface.co/schneewolflabs/B0-27B-GGUF
- https://huggingface.co/schneewolflabs/B0-27B
