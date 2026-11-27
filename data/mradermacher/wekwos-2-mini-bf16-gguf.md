# mradermacher/wekwos-2-mini-bf16-GGUF

## Resumen

wekwos-2-mini-bf16-GGUF es una conversión a formato GGUF del modelo wekwos-2-mini-bf16, publicado por el usuario mradermacher en Hugging Face. Se trata de una cuantización estática generada automáticamente a partir de los pesos originales en bf16 del modelo base alojado en el repositorio disinfozone/wekwos-2-mini-bf16. El modelo cuenta con 26.070.385.152 parámetros totales (aproximadamente 26.000 millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande, apto para despliegue en GPUs de gama alta o configuraciones multi-GPU.

La relevancia de esta publicación radica en que facilita el uso del modelo mediante llama.cpp y herramientas compatibles con GGUF, permitiendo inferencia en CPU y GPU con distintos niveles de cuantización (desde Q2_K hasta Q8_0 e incluso f16). El repositorio ocupa 27,9 GB e incluye múltiples variantes de cuantización, lo que ofrece flexibilidad entre calidad y requisitos de memoria. No se dispone de información pública sobre el pipeline, la licencia, los idiomas soportados ni la arquitectura interna del modelo base.

Dado que la model card del repositorio es mínima y solo documenta metadatos de la conversión (versión de cuantización, tipo de conversión hf, lista de cuantizaciones generadas), la mayor parte de las especificaciones técnicas del modelo original no están disponibles en la información proporcionada. Esta ficha se limita, por tanto, a los datos verificables extraídos del repositorio y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (aproximadamente 26,07 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio); el modelo base está en bf16 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base wekwos-2-mini-bf16 en la documentación proporcionada. Los metadatos de conversión indican `convert_type: hf`, lo que sugiere que el modelo original está en formato Hugging Face (probablemente safetensors con pesos en bf16) y fue convertido a GGUF mediante el flujo estándar de llama.cpp. El campo `output_tensor_quantised: 1` y `quantize_version: 2` confirman que se trata de una cuantización estática generada con una versión reciente de la herramienta de cuantización.

No hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, arquitecturas híbridas, etc.). Tampoco se confirma si el modelo emplea una arquitectura transformer densa o Mixture of Experts; el recuento de parámetros totales (26,07 mil millones) es el único dato estructural verificable.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` en los metadatos de Hugging Face indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse mediante la infraestructura de inference endpoints de Hugging Face.
- Inferencia en llama.cpp y derivados: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otras herramientas que consumen este formato.
- Cuantización flexible: permite elegir entre 12 variantes de cuantización para ajustar el equilibrio entre calidad y uso de memoria.
- Capacidades adicionales (razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo, modo thinking): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM o en configuraciones con offloading parcial a CPU, lo que facilita prototipado sin infraestructura cloud.
- Chat conversacional autoalojado: la etiqueta `conversational` y el formato GGUF permiten montar un servicio de chat privado con llama.cpp server u Ollama, manteniendo los datos en la propia infraestructura.
- Evaluación comparativa de cuantizaciones: al incluir desde Q2_K hasta f16, el repositorio sirve para medir la degradación de calidad frente al modelo original en bf16 en tareas concretas del dominio del usuario.
- Integración en pipelines de inferencia con endpoints: la etiqueta `endpoints_compatible` permite desplegarlo en Hugging Face Inference Endpoints para aplicaciones que requieran una API gestionada.
- Experimentación en investigación: con 26.000 millones de parámetros, es un tamaño manejable para estudios de comportamiento, análisis de sesgos o evaluación de técnicas de prompting en entornos con recursos limitados.
- Generación de texto por lotes en CPU: las variantes Q2_K y Q3_K_S reducen el peso a un rango que puede procesarse en servidores sin GPU, útil para tareas de generación offline donde la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximaciones según el tamaño del repositorio y el número de parámetros; no confirmadas por el autor):
  - f16: aproximadamente 52 GB (no cabe en una sola GPU de consumo).
  - Q8_0: aproximadamente 28 GB.
  - Q6_K: aproximadamente 21-22 GB.
  - Q5_K_M: aproximadamente 18-19 GB.
  - Q4_K_M: aproximadamente 15-16 GB.
  - Q3_K_M: aproximadamente 12-13 GB.
  - Q2_K: aproximadamente 9-10 GB.
- GPU recomendadas: para f16 y Q8_0 se requieren GPUs de数据中心 como A100 80 GB, H100 o configuraciones multi-GPU (2x RTX 4090 de 24 GB). Para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 es suficiente.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M o inferiores con 16-24 GB de VRAM (RTX 4080, RTX 4090, RTX 3090). Las variantes Q2_K y Q3_K_S podrían ejecutarse con offloading parcial en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere también Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. Dependerán de la cuantización, el hardware y el backend; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye detalles sobre la arquitectura, el rendimiento ni la licencia del modelo base, lo que impide establecer una comparación rigurosa con alternativas de la misma categoría. Como referencia de tamaño, el modelo se sitúa en el rango de 26.000 millones de parámetros, comparable en escala a modelos densos de 24-27B, pero sin datos que permitan contrastar calidad, contexto o licencia.

## Limitaciones y advertencias

- Licencia no especificada: al no indicarse la licencia del modelo base ni de la conversión, no puede confirmarse el uso comercial. Es imprescindible consultar el repositorio original disinfozone/wekwos-2-mini-bf16 antes de cualquier despliegue en producción.
- Información técnica ausente: no se conocen la arquitectura, el contexto máximo, los idiomas soportados ni los datos de entrenamiento, lo que dificulta evaluar su idoneidad para tareas específicas.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay datos publicados sobre tasas de alucinación ni sobre técnicas de mitigación aplicadas.
- Sesgos: no disponibles; no se ha publicado información sobre la composición del dataset ni sobre evaluaciones de sesgo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria y de reportes de calidad.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_S pueden degradar notablemente la calidad respecto al modelo en bf16; se recomienda validar en el dominio de uso antes de adoptarlas.
- Modelo base de origen desconocido: el repositorio disinfozone/wekwos-2-mini-bf16 no cuenta con información pública verificable en los datos proporcionados, por lo que se desconoce su procedencia y metodología de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/wekwos-2-mini-bf16-GGUF
- Modelo base: https://huggingface.co/disinfozone/wekwos-2-mini-bf16
- Perfil del autor de la conversión: https://huggingface.co/mradermacher
