# Arki05/Qwen3.8-27B-GGUF-shards

## Resumen

El repositorio `Arki05/Qwen3.8-27B-GGUF-shards` no contiene un único archivo GGUF, sino un **almacén de cuantizaciones byte-addressable** (formato `qalloc store-v2`) para el modelo base `Qwen/Qwen3.8-27B`, desarrollado por el equipo Qwen de Alibaba. Este modelo es un transformer denso multimodal (visión y lenguaje) de 27 000 millones de parámetros, orientado a tareas de codificación, flujos de trabajo agénticos y automatización de oficina. El repositorio ofrece alrededor de 41 tipos de cuantización GGUF (familias mainline de llama.cpp e ik_llama.cpp), cada uno como un archivo directamente ejecutable, además de un manifiesto que permite ensamblar asignaciones de precisión mixta mediante solicitudes HTTP Range.

La relevancia de este repositorio radica en su enfoque innovador: en lugar de publicar un único quant, proporciona un índice de bytes por tensor y tipo, lo que permite a clientes como `qalloc` construir mezclas de precisión personalizadas sin necesidad de procesamiento en el servidor. Esto facilita la ejecución local del modelo en hardware variado, optimizando el equilibrio entre calidad y uso de memoria. El modelo base, Qwen3.8-27B, destaca por su rendimiento en tareas de programación y productividad, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ~41 tipos GGUF (Q2, Q3, Q4, Q5, Q6, Q8 y variantes ik_llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos por tipo + manifiesto para precisión mixta) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso que integra un codificador visual para procesar imágenes junto con texto. Según la descripción oficial de QwenCloud, se construye sobre la versión 3.6-27B e incorpora mejoras específicas en codificación y productividad de oficina, tanto en modalidad textual como visual. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset o los métodos de alineación (RLHF/DPO) en los datos proporcionados.

El repositorio de Arki05 añade una capa técnica destacable: el formato `qalloc store-v2` organiza los tensores cuantizados en archivos por tipo, con un manifiesto que indexa los rangos de bytes de cada tensor para cada tipo. Esto permite a herramientas externas ensamblar modelos de precisión mixta (por ejemplo, cuantizar solo ciertas capas) mediante peticiones HTTP Range, sin necesidad de descargar el modelo completo. Los archivos `types/<TYPE>.gguf` son cuantizaciones uniformes y directamente ejecutables con llama.cpp (o ik_llama.cpp para los tipos ik).

## Capacidades

- Generación de texto y razonamiento complejo en múltiples dominios.
- Comprensión de imágenes: el modelo acepta entradas visuales y puede responder preguntas sobre ellas, describir contenido o extraer información.
- Generación de código: soporta tareas de programación, depuración y explicación de código, con mejoras específicas frente a versiones anteriores.
- Flujos de trabajo agénticos: puede encadenar múltiples pasos de razonamiento y utilizar herramientas externas (tool calling) para completar tareas.
- Automatización de oficina: procesamiento de documentos, generación de informes, resúmenes y extracción de datos de capturas o PDFs.
- Conversación multimodal: mantiene diálogos multi-turno combinando texto e imágenes.

## Casos de uso

- Asistente de programación con soporte visual: el desarrollador puede subir una captura de pantalla de un error o un diagrama de arquitectura y el modelo sugiere correcciones o explica el flujo, gracias a su capacidad de visión y generación de código.
- Automatización de tareas administrativas: procesar facturas o formularios escaneados, extraer campos clave y generar resúmenes estructurados, reduciendo el trabajo manual en entornos de oficina.
- Agente de atención al cliente multimodal: gestionar consultas que incluyen imágenes (fotos de productos, capturas de pantalla) y mantener conversaciones contextuales de varios turnos, desplegado localmente con cuantización GGUF para proteger la privacidad.
- Análisis técnico de diagramas y esquemas: interpretar diagramas de red, planos o gráficos científicos a partir de imágenes, y producir explicaciones o código asociado.
- Generación de documentación a partir de capturas: convertir capturas de pantalla de interfaces o logs en documentación técnica detallada, integrable en pipelines de CI/CD.
- Despliegue en edge con precisión mixta: gracias al almacén de cuantizaciones, un equipo puede seleccionar una combinación de tipos (por ejemplo, Q4 para capas de atención y Q8 para embeddings) para ejecutar el modelo en GPUs de consumo con memoria limitada, manteniendo una calidad aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye carpetas `calib/` y `eval/` con corpus de calibración y evaluación utilizados por el programa de daño que guía la asignación de precisión, pero no se proporcionan métricas numéricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 27B en GGUF, los requisitos dependen del tipo de cuantización. Como orientación, una cuantización Q4_K_M suele ocupar entre 16 y 18 GB, mientras que Q8 puede superar los 27 GB. Estos valores son estimaciones basadas en el tamaño del modelo y no se han verificado con datos oficiales.
- GPU recomendadas: para ejecutar el modelo completo en Q4, se necesitan GPUs con al menos 16-20 GB de VRAM, como RTX 4090, A6000 o A100 (40 GB). Para Q8, se recomienda A100 80 GB o H100.
- En consumer GPU: es posible ejecutar cuantizaciones Q2 o Q3 en GPUs de 12 GB (por ejemplo, RTX 3080/4070), aunque con pérdida de calidad.
- Opciones de despliegue: los archivos GGUF son compatibles con llama.cpp, Ollama, LM Studio y servidores como vLLM (con adaptador GGUF). El manifiesto permite usar herramientas del proyecto `qalloc` para ensamblar precisiones mixtas.
- Latencia y throughput: no se proporcionan datos específicos. Dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base Qwen3.8-27B podría compararse con otros modelos densos multimodales de ~30B (como Qwen2.5-32B o Llama-3.2-30B), pero no se han encontrado datos de rendimiento en las fuentes consultadas. Se indica "no disponible".

## Limitaciones y advertencias

- El repositorio es un almacén de cuantizaciones, no el modelo original. Para usos que requieran los pesos originales, debe acudirse al repositorio base `Qwen/Qwen3.8-27B`.
- No se dispone de información sobre sesgos específicos del modelo. Como todo LLM multimodal, puede presentar alucinaciones visuales o textuales, especialmente en imágenes ambiguas o de baja calidad.
- La longitud de contexto no está documentada en la información proporcionada; se recomienda verificar la ficha del modelo base antes de usarlo en tareas que requieran ventanas largas.
- Los tipos de cuantización de la familia `ik_llama.cpp` requieren una versión modificada de llama.cpp; usar el archivo equivocado con el runtime estándar puede provocar errores.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales (consultar la documentación oficial de Qwen).
- El tamaño del repositorio (908 GB) implica que la descarga completa no es práctica; se recomienda usar el manifiesto y las peticiones HTTP Range para obtener solo los tensores necesarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Arki05/Qwen3.8-27B-GGUF-shards
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Blog sobre cuantizaciones de Qwen3.8-27B: https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
