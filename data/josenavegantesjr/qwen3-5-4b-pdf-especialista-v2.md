# josenavegantesjr/qwen3.5-4b-pdf-especialista-v2

## Resumen

El modelo `josenavegantesjr/qwen3.5-4b-pdf-especialista-v2` es un adaptador de tipo PEFT (Parameter-Efficient Fine-Tuning) obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `josenavegantesjr/qwen3.5-4b-pdf-especialista`, que a su vez deriva de la familia Qwen3.5-4B. El nombre sugiere una especialización en el procesamiento de documentos PDF, aunque no se proporcionan detalles sobre el dataset de entrenamiento ni las tareas concretas abordadas.

El adaptador fue entrenado con la librería TRL (Transformer Reinforcement Learning) y PEFT, y el repositorio contiene únicamente los pesos del adaptador (1.0 GB), no el modelo completo. Esto implica que para su uso es necesario cargar el modelo base y aplicar el adaptador. La ficha oficial es mínima y no incluye especificaciones técnicas, benchmarks ni instrucciones de uso detalladas, por lo que gran parte de la información relevante no está disponible públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador PEFT sobre Qwen3.5-4B) |
| Parametros totales | no disponible (el adaptador pesa 1.0 GB; el modelo base Qwen3.5-4B tiene 4B parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato safetensors) |
| Idiomas soportados | no disponible |
| Licencia | "license" (sin especificar; probablemente hereda la del modelo base Qwen3.5) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador de tipo PEFT, lo que indica que se ha aplicado una técnica de fine-tuning eficiente en parámetros (posiblemente LoRA o similar) sobre el modelo base `josenavegantesjr/qwen3.5-4b-pdf-especialista`. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL, con las versiones PEFT 0.15.2, TRL 0.22.0, Transformers 5.16.1 y PyTorch 2.8.0+cu128. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El modelo base pertenece a la familia Qwen3.5, de la cual se sabe que incluye arquitecturas densas y MoE, pero no se dispone de detalles concretos sobre la variante de 4B utilizada aquí.

## Capacidades

- Generación de texto: el adaptador está diseñado para tareas de generación, como indica el ejemplo de uso con `pipeline("text-generation")`.
- Especialización en PDF: el nombre del modelo sugiere que ha sido entrenado para tareas relacionadas con documentos PDF, aunque no se detallan las capacidades específicas (extracción, resumen, análisis, etc.).
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Extracción de información de documentos PDF: el modelo podría utilizarse para extraer campos concretos (fechas, nombres, cifras) de facturas, contratos o informes en PDF, aprovechando su especialización declarada.
- Resumen automático de documentos extensos: dado su enfoque en PDF, podría generar resúmenes de artículos, informes o manuales en formato PDF.
- Conversión de PDF a texto estructurado: podría ayudar a transformar contenido no estructurado de PDF en formatos como JSON o Markdown.
- Asistencia en revisión de documentos legales: podría identificar cláusulas relevantes o anomalías en contratos y acuerdos.
- Generación de respuestas basadas en contenido de PDF: integrado en un chatbot, podría responder preguntas sobre el contenido de un documento específico.
- Automatización de tareas de back-office: procesamiento de formularios, solicitudes o certificados en PDF dentro de flujos empresariales.

Nota: estos casos son hipotéticos, basados en el nombre del modelo, ya que no se ha publicado documentación que los confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base Qwen3.5-4B y de la cuantización elegida. Un modelo de 4B parámetros en FP16 requiere aproximadamente 8 GB de VRAM, y en cuantización 4-bit alrededor de 4 GB.
- GPU recomendadas: no disponible. Para el modelo base de 4B, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, o superiores) sería suficiente para inferencia en FP16.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del modelo base (4B), pero no confirmado.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto con el modelo base. Se puede usar con Transformers, vLLM, Ollama (si se exporta a GGUF) u otras herramientas que soporten PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen3.5-4B es un LLM de 4B parámetros de la familia Qwen, pero no se conocen sus especificaciones exactas (contexto, arquitectura, rendimiento). Alternativas genéricas de tamaño similar incluyen Llama 3.2 3B, Phi-3.5-mini (3.8B) o Gemma 2 2B, pero no se pueden establecer comparaciones cuantitativas sin datos de benchmarks.

## Limitaciones y advertencias

- Información técnica muy limitada: la model card no proporciona detalles sobre arquitectura, datos de entrenamiento, licencia real ni rendimiento, lo que dificulta su evaluación para uso en producción.
- Licencia ambigua: el campo de licencia indica "license" sin especificar términos. Es necesario verificar la licencia del modelo base Qwen3.5 para conocer las restricciones de uso comercial.
- Dependencia del modelo base: el adaptador no es autónomo; requiere cargar `josenavegantesjr/qwen3.5-4b-pdf-especialista` (y a su vez el modelo Qwen3.5-4B original), lo que añade complejidad de despliegue.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido falso o inexacto, especialmente en tareas de extracción de datos de PDF.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos.
- Sin garantías de calidad: al no haber benchmarks ni evaluaciones publicadas, no se puede asegurar su idoneidad para tareas críticas.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/josenavegantesjr/qwen3.5-4b-pdf-especialista-v2
- Modelo base (adaptador previo): https://huggingface.co/josenavegantesjr/qwen3.5-4b-pdf-especialista
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Modelo Qwen3.5-4B (referencia): https://huggingface.co/Qwen/Qwen3.5-4B
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Technical Report de Qwen3: https://arxiv.org/abs/2505.09388
