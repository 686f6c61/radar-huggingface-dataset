# AlinaGonch/granite41-3b-squad-ratio-0.50-seed-43

## Resumen

El modelo `AlinaGonch/granite41-3b-squad-ratio-0.50-seed-43` es un fine-tune del modelo base Granite 4.1 de 3B parámetros, especializado en el dataset SQuAD (Stanford Question Answering Dataset). El nombre del repositorio sugiere que se ha ajustado con una proporción de datos de SQuAD de 0.50 y una semilla de entrenamiento de 43. La autora, AlinaGonch, ha publicado este modelo en Hugging Face con el objetivo de adaptar un modelo de lenguaje general a tareas de respuesta a preguntas extractivas.

La relevancia de este modelo radica en que Granite 4.1, desarrollado por IBM, es una familia de modelos densos de 3B, 8B y 30B parámetros con mejoras en tool calling, seguimiento de instrucciones, generación de código y razonamiento matemático. Este fine-tune concreto busca aprovechar esas capacidades base para el dominio específico de comprensión lectora y extracción de respuestas. Sin embargo, la model card publicada es genérica y no proporciona detalles técnicos específicos sobre el entrenamiento, los datos utilizados o el rendimiento obtenido.

El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que los pesos están en formato safetensors y probablemente en precisión fp16 o bf16. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer denso basado en Granite 4.1 3B) |
| Parametros totales | 3B (inferido del nombre del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la familia Granite 4.1 soporta hasta 512K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, probablemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura exacta de este modelo. El nombre del repositorio indica que se trata de un fine-tune de Granite 4.1 en su variante de 3B parámetros. La familia Granite 4.1 de IBM utiliza una arquitectura transformer densa decoder-only, con atención de ventana deslizante y atención global periódica para manejar contextos largos. El entrenamiento base de Granite 4.1 se realizó con 15 billones de tokens e incluyó fases de pre-entrenamiento, ajuste supervisado (SFT) y refuerzo con GRPO.

Para este fine-tune concreto, el nombre sugiere que se ha utilizado el dataset SQuAD con una proporción de 0.50 (posiblemente el 50% de los datos de entrenamiento) y una semilla de 43 para la reproducibilidad. No se especifican los hiperparámetros de entrenamiento, el número de épocas, la tasa de aprendizaje ni el régimen de precisión. Tampoco se indica si se aplicaron técnicas como LoRA o ajuste completo.

## Capacidades

- Respuesta a preguntas extractivas: el modelo está diseñado para extraer respuestas literales de un texto dado, típico del dataset SQuAD.
- Comprensión lectora: puede procesar pasajes de texto y responder preguntas basadas en el contenido.
- Generación de texto: al estar basado en Granite 4.1, conserva capacidades generales de generación de lenguaje, aunque el fine-tune puede reducir su rendimiento en tareas fuera del dominio.
- Tool calling: la familia Granite 4.1 soporta tool calling, pero no se confirma si este fine-tune conserva esa capacidad.
- Razonamiento y código: las capacidades base de Granite 4.1 incluyen razonamiento matemático y generación de código, pero el fine-tune en SQuAD puede degradarlas.

## Casos de uso

- Extracción de respuestas en documentos técnicos: el modelo puede localizar y extraer respuestas concretas de manuales, especificaciones o artículos, facilitando la búsqueda de información en grandes corpus.
- Sistemas de preguntas y respuestas sobre bases de conocimiento: integrable en pipelines de QA donde se proporciona un pasaje y se espera una respuesta exacta.
- Asistentes de lectura para estudiantes: puede ayudar a verificar la comprensión de un texto generando preguntas y respuestas a partir de un pasaje.
- Análisis de contratos o documentos legales: extracción de cláusulas específicas o respuestas a preguntas sobre términos contractuales.
- Chatbots de soporte con respuestas basadas en documentación: el modelo puede seleccionar la respuesta correcta de un manual de producto cuando se le da el fragmento relevante.
- Evaluación de modelos de comprensión lectora: sirve como baseline para comparar otros modelos en tareas de QA extractiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de SQuAD (EM o F1) para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 3B parámetros en fp16 requiere aproximadamente 6 GB de VRAM. En cuantización int8, unos 3 GB; en int4, unos 2 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10. Para despliegue en producción, una A100 o H100 ofrecería mayor throughput.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3090, RTX 4090, o incluso en tarjetas con 8 GB si se usa cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 3B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms por token y un throughput de 100-500 tokens/s dependiendo del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparativa se limita a características generales de la familia Granite 4.1 frente a otros modelos de 3B.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Granite 4.1 3B (base) | 3B | 512K | Apache 2.0 (según IBM) | Hugging Face |
| AlinaGonch/granite41-3b-squad-ratio-0.50-seed-43 | 3B | no disponible | no disponible | Hugging Face |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Hugging Face |
| Qwen 2.5 3B | 3B | 32K | Apache 2.0 | Hugging Face |

La comparativa de rendimiento no es posible sin datos de benchmarks. Se recomienda evaluar el modelo en SQuAD u otros datasets de QA antes de usarlo en producción.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas. Se desconoce si el fine-tune introduce sesgos adicionales a los del modelo base.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar respuestas incorrectas o inventadas cuando no encuentra la respuesta en el pasaje.
- Limitaciones de contexto: no se conoce la longitud de contexto efectiva de este fine-tune. Si se reduce respecto al modelo base, podría fallar en documentos largos.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con la autora antes de utilizarlo en proyectos comerciales.
- El modelo está especializado en QA extractiva y puede degradar su rendimiento en otras tareas como generación creativa o diálogo abierto.
- No se han publicado evaluaciones independientes, por lo que su calidad real es desconocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AlinaGonch/granite41-3b-squad-ratio-0.50-seed-43
- Documentación de Granite 4.1 de IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Video sobre Granite 4.1 (15T tokens, 512K contexto, GRPO): https://www.youtube.com/watch?v=pI-C2banehg
- Repositorio relacionado (ratio 0.90): https://huggingface.co/AlinaGonch/granite41-3b-squad-ratio-0.90-seed-43
- Repositorio relacionado (ratio 0.50, seed 42): https://huggingface.co/AlinaGonch/granite41-3b-squad-ratio-0.50-seed-42
