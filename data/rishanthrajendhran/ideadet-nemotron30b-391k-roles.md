# rishanthrajendhran/ideadet-nemotron30b-391k-roles

## Resumen

El modelo `rishanthrajendhran/ideadet-nemotron30b-391k-roles` es un adaptador LoRA (entrenado con la librería PEFT) desarrollado por Rishanth Rajendhran sobre la base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo de lenguaje de NVIDIA con arquitectura de mezcla de expertos (MoE) de 30 mil millones de parámetros totales y 3 mil millones activos. El adaptador está orientado a la detección de texto generado por inteligencia artificial (etiqueta `ai-detection`) y, según su nombre, ha sido entrenado con un conjunto de datos que incluye 391.000 roles, lo que sugiere una especialización en la clasificación de textos según su origen o autoría.

Este tipo de adaptadores resulta relevante en un contexto donde la diferenciación entre contenido humano y generado por IA es crítica para la moderación de contenidos, la verificación de autenticidad y el control de calidad editorial. Al tratarse de un adaptador LoRA, ofrece una alternativa ligera y eficiente para ajustar un modelo base de gran tamaño sin necesidad de reentrenar todos los parámetros, lo que facilita su integración en flujos de producción con recursos limitados. El acceso al modelo está restringido (gated) en Hugging Face, por lo que requiere aceptar las condiciones de uso del creador.

No se dispone de documentación adicional sobre el proceso de entrenamiento, los datos utilizados ni los resultados de evaluación, por lo que gran parte de las especificaciones técnicas y de rendimiento deben considerarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (MoE, 30B totales, 3B activos) |
| Parametros totales | No disponible (el adaptador pesa 1,5 GB en disco, pero no se indica el número de parámetros del adaptador) |
| Parametros activos | No disponible (depende del adaptador; el modelo base tiene 3B activos) |
| Longitud de contexto | No disponible (depende del modelo base, no especificada) |
| Tipos de cuantizacion | No especificados; el adaptador se distribuye en formato `safetensors` (probablemente BF16 según el nombre del base) |
| Idiomas soportados | No disponibles |
| Licencia | `openmdw-1.1` (licencia de NVIDIA para modelos open source; se debe revisar el texto completo) |
| Formato de pesos | `safetensors` (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo de lenguaje de NVIDIA con arquitectura de mezcla de expertos (MoE): 30 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token, lo que permite una inferencia eficiente en comparación con un modelo denso de tamaño equivalente. El nombre "Lightning" sugiere una variante optimizada para velocidad, aunque no se dispone de detalles oficiales sobre su arquitectura interna (número de expertos, atención, etc.) en la información proporcionada.

El adaptador LoRA (Low-Rank Adaptation) añade matrices de bajo rango a las capas del modelo base, de modo que solo se actualizan estos parámetros durante el entrenamiento. Esto reduce drásticamente el coste computacional y el espacio de almacenamiento respecto a un fine-tuning completo. No se ha publicado información sobre el conjunto de datos de entrenamiento, la cantidad de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. La etiqueta `ai-detection` indica que la tarea objetivo es la clasificación binaria o multiclase de textos generados por IA, y el sufijo `391k-roles` apunta a que el dataset de entrenamiento incluye 391.000 ejemplos etiquetados con roles (posiblemente autor, contexto o tipo de generador).

## Capacidades

- Detección de texto generado por inteligencia artificial: es la función principal declarada en las etiquetas del repositorio.
- Clasificación por roles: el nombre del modelo sugiere que puede distinguir entre diferentes roles o fuentes de generación (por ejemplo, distintos modelos de IA o estilos de escritura).
- Adaptación ligera: al ser un adaptador LoRA, se puede cargar sobre el modelo base sin necesidad de reentrenar todos los parámetros, lo que facilita su uso en entornos con recursos limitados.
- No se han documentado capacidades adicionales como generación de código, razonamiento matemático, tool calling o soporte multilingüe. Estas dependen del modelo base, pero no se confirma que el adaptador las preserve o mejore.

## Casos de uso

- Moderación de contenidos en plataformas sociales: el modelo puede clasificar automáticamente si una publicación o comentario fue escrito por un humano o por una IA, ayudando a aplicar políticas de transparencia o a filtrar contenido automatizado.
- Verificación de autenticidad en medios y editoriales: antes de publicar un artículo o una noticia, se puede analizar el texto para detectar si fue generado por IA, lo que resulta útil para mantener estándares editoriales y evitar desinformación.
- Auditoría de respuestas en sistemas de atención al cliente: las empresas pueden supervisar las interacciones de sus chatbots y detectar si el texto final fue generado por el sistema o por un humano, para control de calidad.
- Investigación académica sobre detección de IA: el adaptador puede servir como base para estudios comparativos sobre la eficacia de diferentes técnicas de detección, especialmente en textos de distintos dominios.
- Análisis forense de textos en entornos legales: en disputas sobre autoría o plagio, el modelo puede ayudar a identificar si un documento fue redactado por una IA, aunque siempre debería combinarse con otras evidencias.
- Filtrado de contenido en foros y comunidades técnicas: para evitar que respuestas generadas por IA se hagan pasar por respuestas humanas en foros de soporte, el modelo puede marcar automáticamente los mensajes sospechosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K para este adaptador específico. Tampoco se dispone de comparativas con otros modelos de detección de IA.

## Requisitos de hardware

- Al ser un adaptador LoRA, es necesario cargar el modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` para realizar inferencia. Este modelo, al ser MoE con 3B parámetros activos, requiere aproximadamente 60 GB de VRAM en BF16 para los pesos completos (30B × 2 bytes), aunque con cuantización (por ejemplo, FP8 o INT4) se puede reducir a unos 30-40 GB.
- El adaptador en sí ocupa 1,5 GB en disco, pero se combina con el modelo base en memoria durante la inferencia.
- GPU recomendadas: para una inferencia fluida se necesitaría al menos una GPU con 40 GB de VRAM (por ejemplo, A100 40GB, A6000, o una RTX 4090 con 24 GB si se usa cuantización adicional y se limita el contexto). Para uso en producción, se recomienda una A100 80GB o H100.
- No cabe en GPUs de consumo de gama baja (por ejemplo, RTX 3060 o 4060 con 8-16 GB) sin cuantización extrema y reducción del contexto.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con frameworks como Hugging Face Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se ha confirmado compatibilidad específica con Ollama.
- Latencia y throughput: no disponibles. Dependerán del hardware, la cuantización y la longitud de los textos a analizar.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de detección de IA. No hay datos públicos de rendimiento ni listas de alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones de uso en Hugging Face, lo que puede limitar su adopción en entornos corporativos.
- Licencia `openmdw-1.1`: es una licencia de NVIDIA que permite uso comercial con restricciones (por ejemplo, no usar el modelo para mejorar otros modelos de IA sin permiso). Se debe revisar el texto completo antes de su uso en producción.
- Sesgos desconocidos: al no disponer de información sobre los datos de entrenamiento, no se pueden evaluar posibles sesgos de género, raza o idioma.
- Riesgo de alucinación en la clasificación: como cualquier modelo de detección, puede producir falsos positivos o negativos, especialmente en textos cortos, muy formales o con estilos mixtos.
- Dependencia del modelo base: el rendimiento del adaptador está limitado por el modelo base de NVIDIA; si este tiene sesgos o errores, el adaptador los heredará.
- Sin documentación técnica: no se han publicado detalles sobre el proceso de entrenamiento, hiperparámetros, ni métricas de evaluación, lo que dificulta replicar o validar los resultados.
- Fecha de creación inusual: el repositorio indica una fecha de creación de agosto de 2026, que es futura en el momento de esta ficha; podría tratarse de un error en los metadatos o de una fecha de publicación planificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rishanthrajendhran/ideadet-nemotron30b-391k-roles
- Perfil del autor: https://huggingface.co/rishanthrajendhran
- Página del modelo base (NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16): no se ha encontrado una URL directa en la búsqueda web, pero se puede acceder a través del catálogo de NVIDIA (https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b/modelcard) — nótese que esta URL corresponde al modelo "Nano", no al "Lightning", por lo que se debe verificar la existencia del modelo base exacto en Hugging Face.
