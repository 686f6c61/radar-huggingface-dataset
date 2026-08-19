# jk797/Qwen3.8-27B-oQ5e-mtp

## Resumen

El modelo `jk797/Qwen3.8-27B-oQ5e-mtp` es una cuantización de 5 bits (formato oQ5e) del modelo Qwen3.8-27B, un transformer denso multimodal de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Esta versión cuantizada ha sido generada con la librería oMLX 0.6.0 y está pensada para ejecutarse en hardware con memoria unificada (Apple Silicon) o en GPUs con VRAM limitada, manteniendo los componentes de visión y los pesos de MTP (multi-token prediction) del modelo original.

Qwen3.8-27B es un modelo de visión y lenguaje (image-text-to-text) que destaca en tareas de codificación, flujos de trabajo agénticos y automatización de oficina, con una ventana de contexto nativa de 262 000 tokens y razonamiento configurable. Esta cuantización oQ5e ofrece una alternativa eficiente en memoria sin sacrificar las capacidades multimodales, lo que la hace relevante para desarrolladores que necesitan desplegar un modelo de alto rendimiento en entornos locales o con recursos acotados.

El repositorio incluye los pesos en formato safetensors (MLX) y está etiquetado con `image-text-to-text`, `mlx`, `oQ5e` y `mtp`, confirmando que se preservan tanto el encoder de visión como el mecanismo de predicción multi-token. Aunque la ficha de HuggingFace no especifica licencia ni idiomas, el modelo base Qwen3.8-27B se distribuye bajo Apache 2.0 y soporta múltiples idiomas, según la documentación oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) |
| Parametros totales | 27 000 millones (modelo base); el archivo cuantizado reporta 5 756 598 512 en metadatos, posible error de medición |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativo) |
| Tipos de cuantizacion | oQ5e (5 bits, affine, group size 64) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se confirma en esta ficha) |
| Licencia | Apache 2.0 (modelo base, según fuentes externas); no disponible en la ficha de HuggingFace |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con arquitectura multimodal que procesa tanto texto como imágenes (y posiblemente video). Utiliza atención de tiempo completo y una ventana de contexto nativa de 262 000 tokens, lo que permite manejar documentos largos y conversaciones extensas. El modelo incorpora un mecanismo de MTP (multi-token prediction) que mejora la eficiencia de decodificación, y soporta razonamiento configurable (modo de pensamiento activable o desactivable).

La cuantización oQ5e, producida con oMLX 0.6.0, aplica una cuantización de 5 bits con esquema affine y grupo de tamaño 64, basada en un modelo de sensibilidad obtenido de una versión de 8 bits (`mlx-community/Qwen3.8-27B-8bit`). Esta técnica preserva los pesos de MTP y los componentes de visión, lo que significa que las capacidades multimodales y de predicción multi-token del modelo original se mantienen en la versión cuantizada. No se dispone de detalles específicos sobre el dataset de entrenamiento o el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para modo de pensamiento configurable (reasoning mode).
- Comprensión de imágenes y video (entrada multimodal), incluyendo análisis de capturas de pantalla, diagramas y documentos escaneados.
- Generación de código y asistencia en tareas de programación, con buen rendimiento en benchmarks de agentes de software (DeepSWE 42.2).
- Soporte para tool calling y function calling, permitiendo integración con APIs y herramientas externas.
- Capacidad de ejecutar flujos de trabajo agénticos de larga duración, manejando feedback de herramientas y entornos (Terminal Bench 73.0, OSWorld 84.3).
- Multilingüe (presumiblemente, dado el modelo base, aunque no se confirma en esta ficha).
- MTP (multi-token prediction) integrado, que acelera la decodificación especulativa.

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos, correos y hojas de cálculo, extrayendo información y generando resúmenes o respuestas automáticas gracias a su contexto de 262K tokens y su capacidad multimodal para leer imágenes de pantallas.
- Asistente de codigo en producción: con soporte para tool calling y razonamiento, puede integrarse en pipelines de CI/CD para revisar código, generar tests o resolver issues, utilizando su capacidad de entender repositorios completos dentro de la ventana de contexto.
- Agente de automatizacion de tareas en escritorio: gracias a su rendimiento en OSWorld (84.3), puede controlar interfaces gráficas, hacer clic en botones y navegar por aplicaciones para completar tareas administrativas.
- Analisis de imagenes medicas o tecnicas: su entrada visual permite interpretar radiografías, diagramas de circuitos o capturas de pantalla de errores, proporcionando descripciones o diagnósticos preliminares.
- Chatbot de atencion al cliente con contexto largo: puede mantener conversaciones multi-turno con historial extenso, recordando detalles de interacciones previas y manejando múltiples temas simultáneamente.
- Investigacion academica: su capacidad de razonamiento y procesamiento de documentos largos lo hace útil para resumir artículos, extraer conclusiones y comparar información de múltiples fuentes.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwen3.8-27B, según fuentes externas (blog de Lovable App y AMD). No se dispone de benchmarks específicos para la versión cuantizada oQ5e.

| Benchmark | Resultado |
|---|---|
| DeepSWE (software engineering) | 42.2 |
| Terminal Bench (tareas de terminal) | 73.0 |
| OSWorld (automatización de escritorio) | 84.3 |

No se han publicado resultados de benchmarks en la información disponible para la cuantización oQ5e. Se recomienda evaluar el modelo en el hardware objetivo para verificar el impacto de la cuantización en el rendimiento.

## Requisitos de hardware

- Tamaño del archivo: 20.3 GB (cuantización 5 bits). Para cargar el modelo completo en memoria se estima un requisito mínimo de VRAM de aproximadamente 20 GB, aunque el uso real puede variar según la implementación.
- GPU recomendadas: tarjetas con 24 GB de VRAM o más, como NVIDIA RTX 4090, A100 40GB o H100. En GPUs con menos memoria, se podría usar offloading o cuantización adicional, pero no está garantizado.
- En Apple Silicon, la librería MLX permite ejecutar el modelo en memoria unificada; un Mac con 32 GB o más de RAM unificada sería adecuado.
- Opciones de despliegue: al ser un modelo MLX, se puede ejecutar con oMLX, LM Studio (con soporte para AMD y Apple Silicon), o mediante conversión a otros formatos (GGUF) para usar con llama.cpp u Ollama.
- Latencia y throughput: no se dispone de datos específicos. La cuantización 5 bits reduce el uso de memoria y puede mejorar la velocidad de inferencia en comparación con el modelo de 16 bits, pero depende del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Sí | Apache 2.0 | HuggingFace |
| Qwen2.5-27B | 27B | 32K | No (solo texto) | Apache 2.0 | HuggingFace |
| InternVL2.5-26B | 26B | 64K | Sí | MIT | HuggingFace |

La cuantización oQ5e de Qwen3.8-27B ofrece una ventaja en eficiencia de memoria frente al modelo base, manteniendo las capacidades multimodales y el contexto largo. Comparado con Qwen2.5-27B, añade visión y un contexto significativamente mayor. InternVL2.5-26B es una alternativa multimodal similar, pero con contexto menor y licencia MIT. No se dispone de comparativas de rendimiento directas entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La cuantización oQ5e puede introducir una ligera pérdida de precisión en comparación con el modelo de 16 bits, especialmente en tareas que requieren alta exactitud numérica o razonamiento fino.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta cuantización; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado.
- El contexto de 262K tokens es nativo, pero el uso efectivo de ventanas tan largas puede degradar el rendimiento si no se gestiona adecuadamente la memoria.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero es necesario verificar si la cuantización oMLX tiene restricciones adicionales; la ficha de HuggingFace no especifica licencia.
- El modelo está optimizado para MLX y puede requerir conversión para otros entornos de inferencia (por ejemplo, a GGUF), lo que podría afectar a la fidelidad de la cuantización.
- No se dispone de información sobre la composición del dataset de entrenamiento, por lo que no se pueden evaluar posibles sesgos culturales o de idioma.

## Enlaces

- [HuggingFace - jk797/Qwen3.8-27B-oQ5e-mtp](https://huggingface.co/jk797/Qwen3.8-27B-oQ5e-mtp)
- [Modelo base - Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub - Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog AMD - Run Qwen 3.8 27B on AMD Ryzen AI Max](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Guía completa - Qwen3.8-27B](https://lovableapp.org/blog/qwen3-8-27b)
- [LM Studio - Qwen3.8](https://lmstudio.ai/models/qwen3.8)
- [Jetson AI Lab - Qwen3.8 27B](https://www.jetson-ai-lab.com/models/qwen3-8-27b/)
