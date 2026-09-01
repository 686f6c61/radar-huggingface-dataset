# N14QM/DeepSeek-R1-1.5B-Heretic-GGUF

## Resumen

DeepSeek-R1-1.5B-Heretic-GGUF es una variante cuantizada en formato GGUF del modelo de razonamiento DeepSeek-R1-Distill-Qwen-1.5B, desarrollada por el usuario N14QM. El modelo original, creado por DeepSeek, es una destilación del modelo de razonamiento R1 sobre la arquitectura Qwen2.5 de 1.5B de parámetros. Esta versión concreta ha sido sometida a un proceso de "abliteration" (eliminación de los mecanismos de rechazo de contenido) por parte de huihui-ai, y posteriormente fine-tuneada por N14QM con un corpus adicional de aproximadamente 2 GB de datos procesados.

El resultado es un modelo conversacional de 1.5B de parámetros, cuantizado en Q4_K_M, con un tamaño de archivo de aproximadamente 1,1 GB, diseñado para ejecutarse en hardware modesto. Su relevancia radica en ofrecer una alternativa ligera y sin restricciones de contenido para tareas de generación de texto y razonamiento, aunque con limitaciones importantes en cuanto a idiomas soportados (inglés y chino principalmente) y sin soporte oficial para otros idiomas como el vietnamita, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (Transformer) |
| Parametros totales | 1.777.088.000 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DeepSeek-R1-Distill-Qwen-1.5B soporta 32.768 tokens, pero no se confirma en esta variante) |
| Tipos de cuantizacion | Q4_K_M (única disponible en este repo) |
| Idiomas soportados | Ingles, chino (sin soporte oficial para otros idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar. El proceso de entrenamiento de esta variante parte del modelo DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es una destilación del modelo de razonamiento DeepSeek-R1 sobre la base Qwen2.5-1.5B. Sobre este modelo base se aplicó una técnica de "abliteration" (realizada por huihui-ai) que elimina los mecanismos de rechazo de contenido, dando lugar a una versión sin censura. Posteriormente, N14QM realizó un fine-tuning adicional con un corpus de aproximadamente 2 GB de datos procesados, aunque no se especifica la composición exacta de dicho corpus ni el método de entrenamiento (SFT, RLHF, etc.). No se dispone de información sobre el número total de tokens de entrenamiento ni sobre técnicas como DPO o RLHF en esta variante.

## Capacidades

- Generación de texto y razonamiento: al ser una destilación de DeepSeek-R1, conserva capacidades de razonamiento paso a paso, aunque limitadas por su tamaño de 1,5B.
- Conversación multi-turno: soporta plantilla de chat ChatML, adecuada para aplicaciones conversacionales.
- Sin censura: el proceso de abliteration elimina los rechazos de contenido, permitiendo generar respuestas sobre temas que el modelo base podría rechazar.
- Multilingüe limitado: entrenado principalmente en inglés y chino; el fine-tuning adicional solo mejora marginalmente la comprensión de otros idiomas, sin soporte oficial.
- No se especifican capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional ligero: puede desplegarse en entornos con recursos limitados (Raspberry Pi, portátiles antiguos) para mantener conversaciones multi-turno en inglés o chino, gracias a su tamaño reducido y formato GGUF.
- Generación de texto creativo sin restricciones: útil para proyectos de escritura o roleplay donde se requiere evitar rechazos temáticos, siempre que el contenido no infrinja la legalidad.
- Prototipado rápido de aplicaciones de chat: al ser un modelo pequeño y cuantizado, permite iterar rápidamente en el desarrollo de chatbots sin necesidad de infraestructura costosa.
- Educación e investigación sobre modelos de razonamiento: sirve como ejemplo práctico de destilación, abliteration y fine-tuning para estudiantes o investigadores que quieran estudiar el comportamiento de modelos pequeños.
- Pruebas de integración con frameworks de inferencia local: compatible con llama.cpp, Ollama y otros motores que soporten GGUF, ideal para validar pipelines de despliegue en edge computing.
- Generación de código básico: aunque no está especializado, puede asistir en tareas simples de programación, especialmente en inglés, gracias a su entrenamiento en datos de código del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta variante específica. Se recomienda consultar los benchmarks del modelo base DeepSeek-R1-Distill-Qwen-1.5B para una referencia aproximada, aunque el fine-tuning y la abliteration pueden alterar el rendimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB para inferencia con cuantización Q4_K_M (el archivo pesa ~1,1 GB, más overhead de contexto y activaciones).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060, o incluso iGPUs con suficiente memoria compartida.
- Compatible con consumer GPU de gama baja; también puede ejecutarse en CPU con razonable velocidad gracias a su tamaño reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o cualquier framework que soporte GGUF.
- Latencia y throughput: no disponibles en la información proporcionada, pero en una GPU moderna (p. ej., RTX 3060) se espera una generación de decenas de tokens por segundo; en CPU, varios tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-1.5B-Heretic-GGUF (este) | 1,5B | no disponible | MIT | GGUF Q4_K_M | Abliterated + fine-tune adicional |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,5B | 32.768 (según documentación oficial) | MIT | safetensors, GGUF | Modelo original de razonamiento |
| huihui-ai/DeepSeek-R1-Distill-Qwen-1.5B-abliterated | 1,5B | 32.768 (heredado) | MIT | safetensors, GGUF | Versión abliterated sin fine-tune adicional |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo instruct general, sin enfoque en razonamiento |

La comparativa se basa en datos públicos de los modelos base; no se dispone de benchmarks específicos para esta variante.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una destilación de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento originales, especialmente en inglés y chino.
- Riesgo de alucinación: como todo modelo pequeño, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: no soporta oficialmente otros idiomas más allá del inglés y chino; el fine-tuning adicional no garantiza calidad en otros idiomas.
- Contenido sin censura: la abliteration elimina los mecanismos de rechazo, lo que puede llevar a generar contenido inapropiado, ofensivo o peligroso. El usuario es responsable del uso.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero se debe conservar el aviso de copyright y atribución.
- Sin garantías de producción: no hay información sobre evaluación de seguridad, robustez o rendimiento en entornos productivos. Se recomienda validar exhaustivamente antes de cualquier despliegue real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/N14QM/DeepSeek-R1-1.5B-Heretic-GGUF
- Modelo base (DeepSeek-R1-Distill-Qwen-1.5B): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Versión abliterated de huihui-ai: https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-1.5B-abliterated
- Repositorio oficial de DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
