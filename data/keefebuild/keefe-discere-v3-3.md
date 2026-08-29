# KeefeBuild/Keefe-Discere-v3.3

## Resumen

Keefe-Discere-v3.3 es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado por KeefeBuild, basado en la arquitectura Qwen2 y publicado bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo KeefeBuild/Keefe-Discere-v3.3 (aunque la model card indica que el propio modelo es su base, lo que sugiere un posible error en la documentación) y ha sido entrenado con las librerías Unsloth y TRL de Hugging Face, lo que permite un entrenamiento aproximadamente dos veces más rápido que los métodos convencionales.

El modelo está orientado a la generación de texto conversacional en inglés, con pipeline de text-generation y formato de pesos safetensors. Su relevancia radica en ser un ejemplo de fine-tuning eficiente sobre Qwen2, aunque la documentación pública es muy escasa: no se especifican datos de entrenamiento, longitud de contexto, ni resultados de benchmarks. A pesar de ello, su tamaño y arquitectura lo sitúan en la categoría de modelos de 7B útiles para tareas de generación de texto y diálogo en entornos con recursos moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (basada en transformer) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de múltiples cabezas y normalización RMSNorm, típico de la familia Qwen. El fine-tuning se realizó utilizando Unsloth, una librería que optimiza el entrenamiento mediante kernels personalizados y reducción de memoria, y la librería TRL de Hugging Face para el ajuste fino supervisado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que el entrenamiento fue dos veces más rápido gracias a Unsloth, sin aportar más detalles técnicos.

## Capacidades

- Generación de texto conversacional en inglés, orientado a diálogos y respuestas coherentes.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas al inglés, según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

Dado que la documentación no especifica casos de uso concretos, se proponen aplicaciones razonables basadas en las capacidades típicas de un modelo de 7B conversacional, aunque deben considerarse como hipótesis no verificadas:

- Asistentes conversacionales en inglés: el modelo puede integrarse en chatbots para atención al cliente o asistentes virtuales, aprovechando su naturaleza conversacional y su licencia permisiva para uso comercial.
- Generación de contenido textual: redacción de correos, resúmenes o borradores de documentos en inglés, donde un modelo de 7B ofrece un equilibrio entre calidad y requisitos de hardware.
- Prototipado rápido de aplicaciones de NLP: al ser un fine-tune de Qwen2, puede servir como base para experimentos de generación de texto en entornos de investigación o desarrollo.
- Fine-tuning adicional sobre dominios específicos: su licencia Apache 2.0 permite modificarlo y redistribuirlo, por lo que puede adaptarse a tareas concretas como clasificación de texto o generación estructurada.
- Integración en pipelines de inferencia con TGI o vLLM: al ser compatible con text-generation-inference, puede desplegarse en entornos de producción con frameworks estándar.
- Evaluación comparativa de fine-tunes de Qwen2: dado que es un ejemplo de entrenamiento con Unsloth, puede utilizarse para estudiar el impacto de estas técnicas en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,6 mil millones de parámetros, en FP16 se requieren aproximadamente 15 GB de VRAM (el tamaño del repositorio es de 15,2 GB, lo que sugiere pesos en FP16). Con cuantización a 8 bits se reduciría a unos 8 GB, y a 4 bits a unos 4-5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con 16 GB o más, como RTX 4090, A100 (40 GB) o H100. Para cuantización 4-bit, podría ejecutarse en GPUs de 8 GB como RTX 3070/3080 o RTX 4060 Ti.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización, aunque no se han proporcionado archivos GGUF ni guías de uso con llama.cpp.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, TGI, Ollama (si se convierte a GGUF) y llama.cpp, aunque no hay instrucciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, por su arquitectura y tamaño, se puede situar en la misma categoría que otros modelos de 7-8B basados en Qwen2 o similares:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Keefe-Discere-v3.3 | 7,6B | no disponible | Apache 2.0 | Hugging Face |
| Qwen2-7B | 7,6B | 32K (típico) | Apache 2.0 | Hugging Face |
| Llama-3-8B | 8B | 8K | Llama 3 license | Hugging Face |
| Mistral-7B | 7,3B | 32K | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros y licencia; no hay datos de rendimiento para Keefe-Discere-v3.3.

## Limitaciones y advertencias

- Documentación muy escasa: no se especifican datos de entrenamiento, contexto, ni metodología, lo que dificulta evaluar su idoneidad para producción.
- Idioma limitado: solo inglés, sin soporte multilingüe declarado.
- Riesgo de alucinación: al ser un modelo de 7B sin información sobre su entrenamiento, es probable que presente alucinaciones en tareas factuales, como es común en esta categoría.
- Sesgos desconocidos: no se ha publicado información sobre sesgos o evaluación de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no se especifican restricciones adicionales.
- Posible confusión en la model card: el campo `base_model` apunta al propio modelo, lo que sugiere un error en la documentación; el modelo base real podría ser otro Qwen2, pero no se confirma.

## Enlaces

- Hugging Face: https://huggingface.co/KeefeBuild/Keefe-Discere-v3.3
- Versión anterior Keefe-Discere: https://huggingface.co/KeefeBuild/Keefe-Discere
- Versión anterior Keefe-Discere-v3.0-Final: https://huggingface.co/KeefeBuild/Keefe-Discere-v3.0-Final
- Página de FriendliAI para Keefe-Discere-v3.0-Final: https://friendli.ai/models/KeefeBuild/Keefe-Discere-v3.0-Final
- Página de FriendliAI para Keefe-Discere: https://friendli.ai/models/KeefeBuild/Keefe-Discere
