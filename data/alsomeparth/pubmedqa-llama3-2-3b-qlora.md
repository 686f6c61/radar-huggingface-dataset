# AlsoMeParth/pubmedqa-llama3.2-3b-qlora

## Resumen

Este modelo es un fine-tuning de tipo QLoRA sobre el modelo base Llama 3.2 3B de Meta, realizado por el usuario de HuggingFace "AlsoMeParth". El nombre del repositorio indica que el ajuste se ha realizado sobre el conjunto de datos **PubMedQA**, un benchmark de respuesta a preguntas biomédicas, con el objetivo de especializar el modelo en el dominio de la literatura médica y científica. La arquitectura es un transformer denso de 3.000 millones de parámetros con ventana de contexto de 128.000 tokens, heredada del modelo base.

La relevancia de este modelo reside en su enfoque práctico: combina la eficiencia del ajuste por QLoRA en 4 bits con la especialización en un dominio concreto (medicina), lo que permite a desarrolladores e investigadores desplegar un asistente de preguntas biomédicas en hardware de consumo. Sin embargo, la model card es muy incompleta: no se especifican datos de entrenamiento, hiperparámetros, licencia ni resultados de evaluación, por lo que cualquier uso en producción requiere validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B base) |
| Parametros totales | 3.224.906.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.2 3B) |
| Tipos de cuantizacion | No disponible (los tags sugieren 4-bit con bitsandbytes durante el entrenamiento) |
| Idiomas soportados | No disponible para el fine-tune; el modelo base soporta inglés, alemán, frances, italiano, portugues, hindi y tailandes |
| Licencia | No disponible en el repo; el modelo base usa la Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es **Llama 3.2 3B**, un transformer decoder-only con atención por ventana deslizante y 128.000 tokens de contexto. El fine-tuning se realizó con **QLoRA** (Quantized Low-Rank Adaptation), una técnica que reduce el coste de entrenamiento al cuantizar los pesos base en 4 bits y añadir adaptadores de bajo rango. Los tags del repositorio (`trl`, `sft`, `conversational`, `4-bit`, `bitsandbytes`) indican que se usó el framework TRL con entrenamiento supervisado (SFT) y cuantización de 4 bits.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, el número de pasos, la tasa de aprendizaje ni el resto de hiperparámetros. Tampoco se indica si se aplicaron técnicas como DPO o RLHF. El dataset PubMedQA contiene preguntas biomédicas con respuestas de tipo sí/no/quizás, pero no se especifica cómo se estructuró el prompt de entrenamiento.

## Capacidades

- Generación de texto y respuesta a preguntas en el dominio biomédico (PubMedQA).
- Conversación multi-turno (el tag `conversational` sugiere ajuste para diálogo).
- Capacidad de razonamiento básico heredada del modelo base Llama 3.2 3B.
- Soporte de contexto largo (hasta 128.000 tokens) para documentos médicos extensos.
- No se especifica soporte de tool calling, function calling ni agentes en este fine-tune.
- El modelo base soporta multilingüismo, pero no se ha verificado el rendimiento del fine-tune en otros idiomas distintos del inglés (idioma principal de PubMedQA).
- No se indica capacidad de visión ni audio; es un modelo de texto.

## Casos de uso

- **Sistema de apoyo a la decisión médica**: dado un resumen clínico o una pregunta sobre evidencia científica, el modelo puede extraer y razonar sobre información de artículos biomédicos, ayudando a profesionales a localizar respuestas rápidas basadas en PubMed.
- **Búsqueda semántica en artículos biomédicos**: con su contexto de 128.000 tokens, puede procesar documentos largos y generar respuestas resumidas sobre estudios concretos, útil para revisores y investigadores.
- **Chatbot educativo para estudiantes de medicina**: el modelo puede responder preguntas de exámenes o dudas sobre fisiología, farmacología o patología, con un tono conversacional gracias al ajuste SFT.
- **Extracción de información de registros médicos**: aunque no está validado para datos clínicos reales, puede usarse para extraer entidades relevantes de textos biomédicos, como síntomas o tratamientos.
- **Generación de resúmenes de abstracts**: el modelo puede resumir abstracts de PubMed en un formato conciso, útil para alertas de nuevas publicaciones.
- **Prototipado de asistentes virtuales en salud**: al ser un modelo pequeño (3B), puede integrarse en aplicaciones de bajo coste para demostraciones o pilotos de atención al paciente (siempre con supervisión humana).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de PubMedQA (como exact match o F1), ni comparaciones con otros modelos. El modelo base Llama 3.2 3B tiene resultados conocidos en MMLU, HumanEval y otros, pero no se han reportado aquí y no se pueden atribuir al fine-tune.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización de 4 bits, el modelo ocupa aproximadamente 1.6-2.3 GB en memoria, por lo que cabe en GPUs consumer de 4 GB o más. En 8 bits, necesitaría alrededor de 3.2-4 GB. En fp16, ocuparía ~6.4 GB.
- **GPU recomendadas**: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), o cualquier GPU con al menos 8 GB para cuantización 4-bit. Para fp16, se recomienda al menos 8 GB.
- **Opciones de despliegue**: es compatible con `transformers` y `text-generation-inference` (tag `endpoints_compatible`). Puede desplegarse con vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su compatibilidad con estas herramientas.
- **Latencia y throughput**: no disponible. En una RTX 4090 con 4-bit, un modelo de 3B puede generar entre 50 y 100 tokens por segundo, pero este dato no se ha medido para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso biomedico |
|---|---|---|---|---|
| **Este modelo** | 3.2B | 128k | No disponible (base: Llama 3.2) | Fine-tune en PubMedQA |
| **Llama 3.2 3B Instruct** | 3.2B | 128k | Llama 3.2 Community | Generalista, no especializado |
| **BioMistral 7B** | 7B | 32k | Apache 2.0 | Fine-tune en biomedicina |

No se dispone de datos comparativos de rendimiento (benchmarks) entre estos modelos. La comparación es solo estructural. BioMistral es una alternativa conocida en biomedicina, pero es mayor y con contexto menor. El modelo base Llama 3.2 3B tiene mejores capacidades generales, pero no está especializado.

## Limitaciones y advertencias

- **Model card incompleta**: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones específicas. Esto impide conocer el alcance real del modelo.
- **Sesgos y alucinaciones**: al ser un fine-tune de un modelo base con potenciales alucinaciones, puede generar respuestas médicas incorrectas o inventadas. No debe usarse como sistema de diagnóstico sin supervisión humana.
- **Dominio limitado**: el fine-tuning en PubMedQA puede hacer que el modelo se comporte bien en preguntas de estilo de opción múltiple, pero mal en tareas fuera de ese formato o dominio.
- **Idiomas**: no se ha verificado el rendimiento en otros idiomas distintos del inglés; PubMedQA está en inglés.
- **Licencia**: la licencia del repo no está definida. El uso comercial debe verificar la licencia del modelo base Llama 3.2 Community License, que permite uso comercial con restricciones (por ejemplo, no usarlo para generar contenido ilegal o dañino, y requerir atribución).
- **Riesgo de sobreajuste**: al ser un fine-tune pequeño, es posible que el modelo esté sobreajustado al dataset PubMedQA y falle en datos externos.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/AlsoMeParth/pubmedqa-llama3.2-3b-qlora)
- [Modelo base Llama 3.2 3B en HuggingFace](https://huggingface.co/meta-llama/Llama-3.2-3B)
- [Colección de modelos Llama 3.2 de Meta](https://huggingface.co/collections/meta-llama/llama-32)
- [Model card de Llama 3.2 en GitHub](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md)
- [Documentación de Llama 3.2 en developer.meta.com](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/)
- [Página de llama3.2:3b en Ollama](https://ollama.com/library/llama3.2:3b)
