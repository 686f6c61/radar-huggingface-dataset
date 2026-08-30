# shimbaaa/shifu-smart

## Resumen

shifu-smart es un modelo de lenguaje de 268 millones de parámetros desarrollado por el usuario shimbaaa, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino (finetune) del modelo base `unsloth/functiongemma-270m-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 3 de Google, especializada en generación de texto y soporte de function calling. El modelo está orientado a tareas conversacionales y de generación de texto en inglés, y fue entrenado con las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que el estándar.

A pesar de su tamaño reducido, shifu-smart puede resultar atractivo para desarrolladores que buscan un modelo ligero y desplegable en entornos con recursos limitados, especialmente para prototipos o aplicaciones de chat simples. Sin embargo, la documentación disponible es muy escasa: la model card apenas incluye metadatos básicos y no se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento. Esto limita la evaluación objetiva de sus capacidades y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 3, variante text) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, probablemente en fp16 o bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Gemma 3, concretamente en la variante de 270 millones de parámetros orientada a generación de texto. El modelo base `functiongemma-270m-it` incorpora soporte para function calling, lo que sugiere que shifu-smart hereda esta capacidad, aunque no se ha confirmado explícitamente en la documentación. El ajuste fino se realizó con Unsloth, una librería que optimiza el entrenamiento de modelos de lenguaje, y con la librería TRL de Hugging Face, que proporciona herramientas para fine-tuning con técnicas como RLHF o DPO. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni las técnicas de alineación aplicadas.

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir respuestas coherentes en conversaciones de texto, según su propósito declarado.
- Soporte de function calling: al derivar de `functiongemma-270m-it`, es probable que el modelo pueda invocar funciones externas, aunque no hay evidencia documentada.
- Conversación multi-turno: su etiqueta "conversational" indica que está diseñado para mantener diálogos, aunque no se especifica la longitud máxima de contexto.
- No se han documentado capacidades adicionales como razonamiento avanzado, generación de código, visión o audio.

## Casos de uso

- Prototipado de chatbots: al ser un modelo pequeño, se puede integrar rápidamente en entornos de desarrollo para crear asistentes conversacionales básicos sin necesidad de infraestructura potente.
- Aplicaciones educativas: un modelo de 268M parámetros puede servir para generar explicaciones sencillas o responder preguntas frecuentes en dominios acotados, siempre que se ajuste con datos específicos.
- Automatización de tareas de texto: generación de resúmenes, reescritura de frases o clasificación de texto en inglés, aprovechando su capacidad de generación.
- Pruebas de concepto de function calling: si se confirma su soporte, se puede usar para experimentar con agentes que llaman a APIs o herramientas en entornos de baja latencia.
- Despliegue en dispositivos edge: su tamaño reducido permite ejecutarlo en CPUs o GPUs de gama baja, lo que lo hace adecuado para aplicaciones embebidas o móviles.
- Fine-tuning adicional: al ser un modelo base compacto, se puede ajustar con datos propios para tareas específicas, como atención al cliente o análisis de sentimiento, con costes de entrenamiento moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han comparado sus métricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 268M parámetros, en fp16 el modelo ocupa aproximadamente 0,5 GB; en cuantización de 4 bits podría reducirse a unos 0,2 GB. Estas son estimaciones basadas en el tamaño de parámetros, no en datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con suficiente RAM (alrededor de 1-2 GB).
- Compatibilidad con GPUs de consumo: sí, cabe en prácticamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con la librería transformers de Hugging Face. También es compatible con text-generation-inference (TGI) según los tags.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva. El modelo base `functiongemma-270m-it` es su referencia más directa, pero no se han publicado métricas comparativas. Otros modelos de tamaño similar como Gemma 2 2B o Qwen2.5 0.5B podrían ser alternativas, pero no hay datos de rendimiento de shifu-smart para contrastar.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no incluye detalles sobre el proceso de entrenamiento, dataset, hiperparámetros ni evaluación, lo que dificulta su uso en producción con garantías.
- Tamaño reducido: con 268M parámetros, su capacidad de razonamiento complejo, generación de código o manejo de contextos largos es limitada en comparación con modelos más grandes.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Idioma limitado: solo se declara soporte para inglés; su rendimiento en otros idiomas no está garantizado.
- Sin garantías de function calling: aunque el modelo base lo soporta, no hay confirmación de que el finetune haya preservado esta capacidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de cualquier uso indebido o daño derivado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shimbaaa/shifu-smart)
- [Perfil del autor en Hugging Face](https://huggingface.co/shimbaaa)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo base functiongemma-270m-it](https://huggingface.co/unsloth/functiongemma-270m-it-unsloth-bnb-4bit)
