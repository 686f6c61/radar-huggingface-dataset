# burakhanpn/MyGemmaNPC

## Resumen

MyGemmaNPC es un modelo de lenguaje de 268 millones de parámetros, resultado de un fine-tuning con Supervised Fine-Tuning (SFT) sobre el modelo base `google/gemma-3-270m-it` de Google. El autor, burakhanpn, ha publicado este checkpoint en Hugging Face con la librería Transformers, utilizando el framework TRL para el entrenamiento. Se trata de un modelo de generación de texto conversacional, pensado para responder a instrucciones y mantener diálogos.

El modelo es relevante por su tamaño reducido: con 268M de parámetros y una ventana de contexto de 32K tokens (según datos de LLM Explorer), puede ejecutarse en hardware modesto, incluyendo GPUs de consumo y CPU. Esto lo hace adecuado para prototipos, aplicaciones educativas o despliegues en entornos con recursos limitados. Sin embargo, la documentación oficial es muy escasa: no se especifica el dataset de entrenamiento, la licencia ni los idiomas soportados, lo que limita su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3, con atención local y global) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K tokens (según LLM Explorer; no confirmado por el autor) |
| Tipos de cuantizacion | No disponible (se puede cuantizar con GPTQ, AWQ o GGUF, pero no hay versiones publicadas) |
| Idiomas soportados | No disponible (el modelo base Gemma 3 soporta múltiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | No disponible (el modelo base tiene licencia Gemma, pero este checkpoint no indica la suya) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 270M instruct, un transformer decoder con mecanismos de atención local y global, diseñado para manejar contextos largos de manera eficiente. El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL, con el framework Transformers en su versión 5.15.0 y PyTorch 2.11.0. No se proporciona información sobre el dataset utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje ni otras hiperparámetros. Tampoco se indica si se emplearon técnicas adicionales como RLHF o DPO; la model card solo menciona SFT.

Dado que es un fine-tune de un modelo instructivo ya entrenado con RLHF, se espera que herede las capacidades conversacionales del base, pero el entrenamiento adicional podría haber alterado su comportamiento en ciertas tareas. La falta de detalles sobre el proceso de entrenamiento impide evaluar la calidad del ajuste.

## Capacidades

- Generación de texto conversacional: responde a instrucciones y mantiene diálogos multi-turno, como se muestra en el ejemplo de la model card.
- Razonamiento básico: al estar basado en Gemma 3 270M instruct, puede resolver tareas sencillas de lógica y comprensión, aunque con limitaciones propias de su tamaño.
- Soporte de contexto largo: la ventana de 32K tokens permite manejar conversaciones extensas o documentos de tamaño medio.
- Multilingüismo potencial: el modelo base Gemma 3 soporta varios idiomas, pero no se confirma que este fine-tune los preserve.
- No se documenta soporte explícito para tool calling, function calling, agentes o capacidades multimodales.

## Casos de uso

- Chatbot para atención al cliente en entornos de bajo coste: el modelo puede gestionar consultas frecuentes y preguntas frecuentes en un sitio web, gracias a su tamaño reducido que permite desplegarlo en una sola GPU de gama baja o incluso en CPU.
- Asistente educativo para prácticas de programación: puede generar explicaciones de conceptos básicos y responder a preguntas de estudiantes, integrándose en una aplicación de tutoría con un presupuesto limitado.
- Prototipado rápido de aplicaciones conversacionales: los desarrolladores pueden usar este modelo para validar ideas de producto antes de invertir en modelos más grandes, gracias a su facilidad de carga con `pipeline` de Transformers.
- Generación de respuestas en sistemas de soporte técnico de nivel 1: con una ventana de contexto de 32K tokens, puede manejar historiales de conversación largos y extraer información relevante de documentos de ayuda.
- Análisis de sentimiento en redes sociales: aunque no está específicamente entrenado para ello, puede clasificar textos cortos si se le proporcionan instrucciones adecuadas, aprovechando su capacidad de seguir prompts.
- Generación de contenido creativo breve: puede producir historias cortas, poemas o ideas para nombres de productos, siendo útil en herramientas de brainstorming automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. La ausencia de métricas impide comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en cuantización FP16 según LLM Explorer, lo que permite ejecutarlo en GPUs con 2 GB o menos.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con suficiente RAM (alrededor de 1-2 GB).
- Compatibilidad con GPU de consumo: sí, es ideal para hardware de gama baja y portátiles.
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama y Text Generation Inference (TGI), según las etiquetas del repositorio.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño, se espera una latencia baja en GPU moderna, del orden de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MyGemmaNPC (este) | 268M | 32K | No disponible | Hugging Face |
| google/gemma-3-270m-it | 268M | 32K | Gemma Terms of Use | Hugging Face |
| Qwen2.5-0.5B-Instruct | 500M | 32K | Apache 2.0 | Hugging Face |
| Microsoft Phi-3-mini | 3.8B | 128K | MIT | Hugging Face |

MyGemmaNPC es un fine-tune del modelo base Gemma 3 270M instruct, por lo que su arquitectura y tamaño son idénticos. La diferencia radica en el entrenamiento adicional con SFT, que podría mejorar su comportamiento en tareas conversacionales específicas, aunque no hay benchmarks que lo demuestren. En comparación con Qwen2.5-0.5B, que tiene el doble de parámetros, o Phi-3-mini, mucho más grande, MyGemmaNPC es más ligero pero probablemente menos capaz. La licencia incierta es una desventaja frente a alternativas con licencias permisivas como Apache 2.0 o MIT.

## Limitaciones y advertencias

- Falta de documentación: no se especifica el dataset de entrenamiento, las hiperparámetros ni el proceso de evaluación, lo que dificulta reproducir o validar el modelo.
- Licencia no clara: la model card indica "licence: license" sin especificar los términos. Esto impide su uso comercial sin consultar al autor, y podría entrar en conflicto con la licencia del modelo base Gemma.
- Riesgo de alucinación: como todo LLM pequeño, puede generar información falsa o inventada, especialmente en temas especializados.
- Sesgos heredados: el modelo base Gemma 3 puede contener sesgos de género, raza o cultura, que el fine-tuning no corrige necesariamente.
- Idiomas no confirmados: aunque Gemma 3 soporta varios idiomas, este fine-tune podría haber sido entrenado solo en inglés, limitando su utilidad en otros idiomas.
- Sin soporte para tool calling: no se documenta capacidad para usar herramientas externas, lo que limita su uso en agentes autónomos.
- Tamaño del repositorio: 3,3 GB para un modelo de 268M parámetros sugiere que los pesos están en FP32 o con algún padding, lo que aumenta los requisitos de almacenamiento y memoria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/burakhanpn/MyGemmaNPC)
- [Modelo gemelo de arunchan](https://huggingface.co/arunchan/MyGemmaNPC)
- [Modelo gemelo de allanctan-ai](https://huggingface.co/allanctan-ai/MyGemmaNPC)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/Kaballas%2FMyGemmaNPC,eA0JMl8jbVV7Ogj38E13D)
- [Página de FriendliAI para inferencia](https://friendli.ai/models/arunchan/MyGemmaNPC)
- [Página en Bytez](https://bytez.com/model/vmhdaica/MyGemmaNPC)
