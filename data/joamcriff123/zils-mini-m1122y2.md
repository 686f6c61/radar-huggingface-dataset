# joamCriff123/zils-mini-m1122y2

## Resumen

zils-mini-m1122y2 es un modelo de decisión (decision-model) publicado por el usuario joamCriff123 en Hugging Face, construido como un fine-tuning del modelo base Qwen/Qwen3.5-4B. Según la model card, está destinado al "Zils subnet 127 mini pool", un contexto de despliegue que el autor no detalla. El modelo se distribuye con la librería transformers, pesos en safetensors y licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales más allá de las atribuciones del modelo base.

Con 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) y un repositorio de 9,1 GB, se sitúa en la categoría de modelos pequeños-mediados, adecuados para inferencia en una sola GPU. La arquitectura declarada en los tags es qwen3_5, correspondiente a la familia Qwen3.5, aunque la model card no aporta detalles sobre la arquitectura interna, la longitud de contexto efectiva ni el proceso de entrenamiento.

El pipeline declarado es feature-extraction, lo que sugiere que el modelo se emplea para producir representaciones o puntuaciones internas más que para generación de texto abierta, coherente con su etiqueta de decision-model. La información pública es muy escasa: no hay benchmarks, no se especifican idiomas y el modelo registra cero descargas y cero likes en el momento de la consulta, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tuning de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con aproximadamente 4,54 mil millones de parámetros. Los tags incluyen `custom_code`, lo que indica que la carga del modelo requiere código personalizado incluido en el repositorio y no basta con una clase estándar de transformers. También aparece la etiqueta `feature-extraction` como pipeline, lo que apunta a un uso orientado a extracción de representaciones o a la emisión de decisiones/puntuaciones en lugar de generación libre de texto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). La model card únicamente indica que se trata de un "d3-mini decision body" para el "Zils subnet 127 mini pool", sin especificar qué tarea de decisión resuelve ni cómo se evaluó. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa.

## Capacidades

- Extracción de características y representaciones: el pipeline declarado es feature-extraction, por lo que su uso previsto es generar embeddings o estados internos a partir de texto.
- Modelo de decisión: la etiqueta decision-model sugiere que produce decisiones o puntuaciones en el contexto del "Zils subnet 127 mini pool", aunque la naturaleza exacta de la decisión no está documentada.
- Herencia del modelo base: al derivar de Qwen3.5-4B, podría conservar parte de las capacidades del base (comprensión de lenguaje, multilingüismo), pero no hay confirmación en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: el pipeline feature-extraction permite usar el modelo para vectorizar documentos y consultas en un motor de recuperación, siempre que se valide la calidad de los embeddings en el dominio objetivo.
- Clasificación o filtrado en pipelines de datos: como modelo de decisión, puede integrarse como componente de puntuación en un pipeline que necesite aceptar, rechazar o priorizar elementos, previa evaluación empírica.
- Prototipado de sistemas de decisión ligeros: sus ~4,54 B de parámetros permiten desplegarlo en una GPU de gama media o alta para experimentar con arquitecturas de decisión antes de escalar a modelos mayores.
- Investigación sobre fine-tunings de Qwen3.5-4B: sirve como punto de comparación para estudiar cómo un fine-tuning específico altera las representaciones del modelo base.
- Componente interno en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 facilita su incorporación en productos comerciales, sujeto a las atribuciones del modelo base.
- Evaluación de modelos de la comunidad: útil para quienes investigan modelos publicados con poca documentación y quieren medir su comportamiento real frente al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y contexto; se recomienda al menos 12-16 GB para trabajar con comodidad.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,5-5 GB para pesos, más overhead; viable en GPUs de 8-12 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB para pesos; cabe en GPUs consumer de 6-8 GB, aunque no se publican variantes GGUF/GPTQ/AWQ oficiales.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16; RTX 3090/4080 o superiores para cuantización.
- Cabe en GPU consumer: sí, especialmente con cuantización; en fp16 requiere GPUs de 16 GB o más.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible y requerirían conversión o adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m1122y2 | 4,54 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tuning de Qwen3.5-4B, pipeline feature-extraction |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en esta ficha | según modelo base | Hugging Face (modelo base) | Modelo original del que deriva; documentación y benchmarks propios del autor |
| Alternativas de ~4 B de la familia Qwen | ~4 B | no disponible | variable | Hugging Face | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe la tarea de decisión, el dataset de entrenamiento ni los criterios de evaluación, lo que dificulta validar su idoneidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinación y sesgos: no evaluado; al ser un fine-tuning sobre Qwen3.5-4B, puede heredar sesgos del base, pero no hay análisis disponible.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto efectiva; no debe asumirse el contexto del modelo base sin verificación.
- Código personalizado: el tag `custom_code` implica dependencia de código del repositorio; conviene auditar `trust_remote_code` antes de ejecutarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones del modelo base Qwen3.5-4B indicadas en LICENSE y NOTICE.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento por parte del autor.
- Uso previsto restringido: está pensado para el "Zils subnet 127 mini pool"; emplearlo fuera de ese contexto requiere validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1122y2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del autor en Hugging Face: https://huggingface.co/joamCriff123
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
