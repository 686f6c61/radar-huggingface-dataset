# pathilabs/Pathi-Lite-Instruct-1.7B

## Resumen

Pathi-Lite-Instruct-1.7B es un modelo de lenguaje ligero desarrollado por Pathi Labs LLP, obtenido mediante fine-tuning con LoRA (Low-Rank Adaptation) sobre el modelo base Qwen/Qwen3-1.7B. Está diseñado para tareas de seguimiento de instrucciones y asistencia conversacional en inglés, con un tamaño reducido que facilita su despliegue en entornos con recursos limitados.

El modelo se publica bajo licencia Apache 2.0, con un total de 1.720.574.976 parámetros y pesos en formato safetensors. Al tratarse de un fine-tuning LoRA sobre Qwen3, hereda la arquitectura causal decoder-only de su base, pero no se especifican datos adicionales sobre la longitud de contexto, el dataset de entrenamiento ni el número de tokens utilizados. Su relevancia radica en ofrecer una opción accesible y ligera para experimentación e integración en aplicaciones de bajo consumo, manteniendo la flexibilidad de la licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal decoder-only transformer (basada en Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo fusionado) |

## Arquitectura y entrenamiento

Pathi-Lite-Instruct-1.7B parte del modelo Qwen/Qwen3-1.7B, un transformer causal decoder-only. El proceso de adaptación se realizó mediante LoRA, una técnica de fine-tuning eficiente en parámetros que congela los pesos del modelo base y entrena matrices de descomposición de bajo rango en capas seleccionadas. El resultado se publica como un modelo fusionado, listo para cargarse con Hugging Face Transformers.

No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens empleados ni si se utilizaron técnicas como RLHF o DPO. La innovación principal es el uso de LoRA para reducir el coste computacional del fine-tuning, manteniendo un tamaño de modelo ligero.

## Capacidades

- Generación de texto en inglés para seguimiento de instrucciones y conversación general.
- Soporte de chat template mediante `apply_chat_template`, lo que permite estructurar conversaciones multi-turno.
- Despliegue ligero en entornos con recursos limitados gracias a su tamaño de ~1.7B.
- Base para fine-tuning posterior o experimentación en investigación.
- No se documenta soporte de tool calling, function calling, visión, audio, razonamiento avanzado (thinking mode) ni capacidades multilingües más allá del inglés.

## Casos de uso

- Atención al cliente automatizada en inglés: el modelo puede gestionar consultas frecuentes y conversaciones multi-turno en aplicaciones de soporte, gracias a su entrenamiento de instrucción y su tamaño ligero que reduce costes de inferencia.
- Asistente interno para documentación técnica: puede generar respuestas a preguntas sobre manuales o FAQs, siempre que el contenido esté en inglés y no se requiera precisión factual garantizada.
- Despliegue en dispositivos edge o móviles: su tamaño de 1.7B y su formato safetensors permiten integrarlo en aplicaciones con recursos computacionales limitados, especialmente mediante frameworks de inferencia optimizados.
- Prototipado rápido de chatbots: los desarrolladores pueden usar el modelo para validar flujos conversacionales antes de escalar a modelos más grandes, gracias a su licencia Apache 2.0 y su facilidad de carga con Transformers.
- Base para fine-tuning en dominios específicos: al ser un modelo LoRA sobre Qwen3, puede adaptarse a tareas concretas (por ejemplo, soporte técnico interno) con un coste de entrenamiento reducido.
- Automatización de tareas de texto en inglés: clasificación de correos, resumen de artículos o extracción de información en pipelines de procesamiento de lenguaje natural donde se requiera un modelo ligero y de fácil integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información oficial. Como referencia técnica, un modelo de 1.720.574.976 parámetros en bfloat16 requiere aproximadamente 3,44 GB solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: probablemente sí, dado el tamaño de ~1.7B, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: no disponible; el autor documenta su carga mediante Hugging Face Transformers con `AutoModelForCausalLM` y `trust_remote_code=True`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pathi-Lite-Instruct-1.7B | 1.720.574.976 | No disponible | Apache 2.0 | HuggingFace |
| Qwen3-1.7B (base) | ~1.7B | No disponible | Apache 2.0 | HuggingFace |
| Mistral 7B Instruct | 7B | No disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks para comparar el rendimiento entre estos modelos. Mistral 7B Instruct se incluye como referencia en tarea (instruction following), aunque es de mayor tamaño.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados específicamente; el modelo hereda los sesgos del modelo base Qwen3-1.7B.
- Riesgo de alucinación: mayor que en modelos de mayor tamaño, como advierte el propio autor; los resultados deben revisarse antes de su uso en producción.
- Limitaciones de idioma: el modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse los términos de la licencia del modelo base Qwen3-1.7B.
- Caveat para producción: no apto para decisiones de alto riesgo (médicas, legales, financieras) sin supervisión humana, ni para casos que requieran garantías de exactitud factual.
- El fine-tuning LoRA adapta el comportamiento pero no elimina las limitaciones inherentes del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/pathilabs/Pathi-Lite-Instruct-1.7B
- Sitio web de Pathi Labs: https://www.pathilabs.com
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Contacto: Info@pathilabs.com
