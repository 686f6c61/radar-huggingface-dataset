# JScharp/IT344-Homework

## Resumen

El modelo `JScharp/IT344-Homework` es un ajuste fino (fine-tune) del modelo `microsoft/Phi-3-mini-4k-instruct`, desarrollado por el usuario JScharp. Se trata de un modelo de lenguaje instructivo entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de HuggingFace. El nombre sugiere que fue creado como parte de una tarea o proyecto académico (posiblemente relacionado con el curso IT344 de la Universidad Electrónica Saudita, aunque no hay confirmación en la documentación).

El modelo hereda la arquitectura y capacidades del Phi-3-mini-4k-instruct, un transformer decoder-only de 3.800 millones de parámetros con una ventana de contexto de 4.096 tokens. Al ser un fine-tune, su objetivo es especializar el comportamiento del modelo base en tareas concretas, aunque la model card no especifica el dataset de entrenamiento ni los hiperparámetros utilizados. Su relevancia radica en ser un ejemplo de ajuste fino accesible y reproducible, útil para desarrolladores que quieran experimentar con SFT sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Phi-3-mini-4k-instruct) |
| Parametros totales | 3.800 millones (aprox., heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision completa) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles; no se especifican otros) |
| Licencia | no disponible (la model card indica "license" sin detallar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Phi-3-mini-4k-instruct, un transformer decoder-only con atención causal, optimizado para inferencia eficiente en dispositivos con recursos limitados. El modelo base fue entrenado por Microsoft con un enfoque en razonamiento y generación de texto instructivo, utilizando un dataset curado de alta calidad. El fine-tune `IT344-Homework` se realizó mediante SFT con la librería TRL, lo que implica un ajuste supervisado sobre un dataset de instrucciones y respuestas. No se proporcionan detalles sobre el tamaño del dataset, el número de épocas, la tasa de aprendizaje ni otras configuraciones de entrenamiento. Tampoco se menciona el uso de técnicas como RLHF o DPO; solo se indica SFT.

## Capacidades

- Generación de texto instructivo: al ser un fine-tune de Phi-3-mini-4k-instruct, conserva la capacidad de seguir instrucciones y generar respuestas coherentes en formato chat.
- Razonamiento básico: el modelo base tiene competencias en tareas de razonamiento lógico y matemático, aunque no hay benchmarks específicos para este fine-tune.
- Soporte de tool calling: no documentado; el modelo base no tiene soporte nativo de function calling, por lo que se asume que no lo tiene.
- Capacidades multilingües: no especificadas; el modelo base está principalmente entrenado en inglés, aunque puede generar texto en otros idiomas con menor calidad.
- Sin capacidades multimodales: no soporta visión ni audio.

## Casos de uso

- Asistente de chat educativo: el modelo puede utilizarse como un chatbot de propósito general para responder preguntas en entornos académicos, gracias a su formato instructivo y su tamaño reducido que permite ejecutarlo en hardware modesto.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo pequeño (3.8B), es adecuado para pruebas de concepto y demos donde se requiera un asistente de texto sin necesidad de GPUs de alta gama.
- Experimentación con SFT: sirve como ejemplo práctico para desarrolladores que quieran aprender a realizar fine-tuning con TRL sobre un modelo base conocido, ya que el repositorio incluye el código de entrenamiento implícito en los tags.
- Generación de respuestas a preguntas de opción múltiple o tareas de comprensión lectora: el modelo base tiene buen rendimiento en tareas de razonamiento, y el fine-tune podría haberlo especializado en dominios concretos (aunque no se especifica cuáles).
- Integración en pipelines de generación de texto con Transformers: se puede cargar fácilmente con la API de `pipeline` de HuggingFace, como muestra el ejemplo de la model card.
- Evaluación de modelos instructivos pequeños: útil para comparar el comportamiento de un fine-tune frente a su modelo base en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este fine-tune. El rendimiento dependerá del modelo base Phi-3-mini-4k-instruct, que en su versión original reporta resultados competitivos para su tamaño, pero no se pueden extrapolar sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.800 millones de parámetros en precisión FP16, se requieren aproximadamente 7-8 GB de VRAM. Con cuantización a 4 bits (si se aplicara), podría reducirse a unos 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070/4060, o GPUs de datacenter como A10 o T4. Para una inferencia más rápida, una RTX 4090 o A100 sería adecuada.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como la RTX 3060 de 12 GB o la RTX 4070.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se cuantiza), o mediante la API de Transformers con `pipeline`. También es compatible con TGI (Text Generation Inference) de HuggingFace.
- Latencia y throughput: no disponibles; dependerán del hardware y de la implementación. En una RTX 4090, un modelo de 3.8B en FP16 puede generar decenas de tokens por segundo, pero no hay datos medidos para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| JScharp/IT344-Homework | 3.8B | 4.096 | no disponible | Fine-tune de Phi-3-mini-4k-instruct |
| microsoft/Phi-3-mini-4k-instruct | 3.8B | 4.096 | MIT | Modelo base, con benchmarks publicados |
| Qwen2.5-3B-Instruct | 3.1B | 32.768 | Apache 2.0 | Alternativa con contexto más largo y soporte multilingüe |
| Llama-3.2-3B-Instruct | 3.2B | 8.192 | Llama 3.2 Community License | Alternativa de Meta, con buen rendimiento en razonamiento |

No se dispone de datos de rendimiento comparativo para el fine-tune, por lo que la comparación se limita a características técnicas. El modelo base Phi-3-mini-4k-instruct tiene benchmarks conocidos (por ejemplo, MMLU 68.8%, HumanEval 62.2%), pero no se pueden atribuir a este fine-tune.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento de Phi-3-mini, aunque no hay análisis específicos para este modelo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: la ventana de 4.096 tokens es corta para tareas que requieran documentos largos o conversaciones extensas.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base está optimizado para inglés, por lo que su rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia no está claramente definida en la model card (solo dice "license"). Esto puede generar incertidumbre para uso comercial; se recomienda contactar al autor o revisar el modelo base (MIT) para aclarar.
- Falta de documentación: no se proporcionan detalles sobre el dataset de entrenamiento, lo que dificulta evaluar su calidad y posibles sesgos adicionales.
- Adecuación para producción: al ser un proyecto aparentemente académico, no hay garantías de mantenimiento, soporte o robustez para entornos productivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JScharp/IT344-Homework
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Librería TRL: https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers/index
