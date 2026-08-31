# luisastellet/tucano_metaphor

## Resumen

El modelo `luisastellet/tucano_metaphor` es un modelo de generación de texto de 490 millones de parámetros publicado en Hugging Face por Luisa Muniz Stellet, estudiante de informática de la Universidad Federal Fluminense (UFF). El nombre sugiere que se trata de un ajuste fino de un modelo de la familia Tucano (desarrollado por TucanoBR para el portugués) orientado a la tarea de metáforas, aunque no se dispone de documentación oficial que lo confirme. La model card es una plantilla genérica sin información técnica, y el repositorio contiene únicamente pesos en formato safetensors.

A pesar de la escasez de datos, el modelo es relevante por su tamaño compacto (490M parámetros) y su posible especialización en un dominio lingüístico concreto, lo que podría interesar a desarrolladores que buscan modelos ligeros para tareas de generación de texto en portugués o para experimentación con metáforas. Sin embargo, la falta de documentación y de benchmarks limita su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags mencionan "qwen3", pero no se confirma) |
| Parametros totales | 490.799.104 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente portugues, por el nombre y el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las técnicas de optimización. El tag "qwen3" en Hugging Face podría indicar que el modelo se basa en la arquitectura Qwen3, pero no hay evidencia concluyente. El nombre "tucano_metaphor" sugiere un ajuste fino de un modelo de la serie Tucano (entrenado con el corpus TucanoBR para portugués), pero no se dispone de detalles sobre el dataset de metáforas ni sobre el método de entrenamiento (por ejemplo, si se usó RLHF o DPO). Toda esta información se considera no disponible.

## Capacidades

- Generación de texto: al ser un modelo de tipo text-generation, puede producir texto, pero no se especifican sus capacidades exactas.
- Especialización en metáforas: el nombre del modelo y la existencia de otro modelo del mismo autor (`bert_metaphor_melhor_hp`) sugieren que podría estar orientado a la detección o generación de metáforas, aunque no hay confirmación.
- Tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales: no disponible.

## Casos de uso

Dada la falta de información, los casos de uso son hipotéticos y deben validarse con pruebas propias:

- Generación de texto creativo en portugués: el modelo podría emplearse para redactar contenido literario o publicitario con un enfoque en metáforas, si efectivamente está especializado en ello.
- Investigación académica sobre metáforas: podría servir como base para experimentos de clasificación o generación de metáforas en portugués, aunque se necesitaría evaluar su rendimiento.
- Prototipos de asistentes conversacionales: su tamaño compacto permite desplegarlo en entornos con recursos limitados, pero sin conocer su calidad conversacional, no se recomienda para producción.
- Fine-tuning adicional: al ser un modelo pequeño, puede utilizarse como punto de partida para tareas específicas con datasets propios, siempre que se documente su comportamiento.
- Educación y aprendizaje: útil para estudiantes que quieran explorar el ajuste fino de modelos de lenguaje en portugués.
- Evaluación comparativa de modelos pequeños: puede incluirse en benchmarks de modelos de menos de 1B parámetros, aunque no hay resultados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se han comparado sus capacidades con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 490M parámetros, en fp16 se necesitan aproximadamente 1 GB de VRAM; en int8, unos 0,5 GB; en cuantización de 4 bits, alrededor de 0,25 GB. Estas cifras son estimaciones orientativas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o incluso CPU con suficiente RAM) puede ejecutar el modelo en cuantización ligera.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con bibliotecas como vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con Hugging Face Transformers. También es compatible con text-generation-inference (TGI) según los tags.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo podría compararse con otros modelos de tamaño similar como Tucano-630m (630M parámetros) o BERT (110M), pero no hay datos de rendimiento que permitan una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún sesgo específico, pero al ser un modelo entrenado con datos web, es probable que herede sesgos presentes en el corpus.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios no cubiertos por su entrenamiento.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto y los idiomas soportados; el nombre sugiere portugués, pero no está confirmado.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- Carencia de documentación: la model card no aporta información técnica, lo que dificulta su evaluación y despliegue responsable.
- Adecuación para producción: sin benchmarks ni detalles de entrenamiento, no se recomienda su uso en aplicaciones críticas sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/tucano_metaphor
- Perfil del autor en Hugging Face: https://huggingface.co/luisastellet/models
- Perfil del autor en GitHub: https://github.com/luisastellet
- Modelo Tucano-630m (referencia de la familia Tucano): https://huggingface.co/TucanoBR/Tucano-630m
- Paper de Tucano (arXiv): https://arxiv.org/html/2411.07854v1
- Paper de Tucano 2 (arXiv): https://arxiv.org/pdf/2603.03543
