# smllms/HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.8

## Resumen

HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.8 es un modelo de lenguaje generativo en coreano, desarrollado por el equipo MISHULTA como parte de su participación en el K-DATA Science Hackathon (NIA). Se trata de un fine-tuning LoRA sobre el modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B` de NAVER Cloud, seguido de una fusión de los adaptadores. El objetivo del ajuste es especializar el modelo en tareas de razonamiento de opción múltiple en coreano, incluyendo preguntas de conocimiento general, razonamiento multi-paso y cuestiones administrativas y legales.

El modelo base, HyperCLOVAX-SEED-Think-14B, es un Transformer de 14,74 mil millones de parámetros con una ventana de contexto de 32 000 tokens, que incorpora Peri-Layer Normalization y Maximal Update Parameterization (μP). El fine-tuning utiliza datos generados por el modelo teacher Upstage Solar Pro 4 (con permiso especial de Upstage para fines no comerciales de hackathon) y por DeepSeek-R1-0528, junto con conjuntos de datos públicos coreanos. El resultado es un modelo orientado a producir respuestas razonadas con un formato de salida estable (`정답: X`), pensado para benchmarks como KMMLU-Pro y CLIcK.

La relevancia de este modelo radica en su enfoque específico para el razonamiento en coreano, un ámbito con menos recursos que el inglés, y en su demostración de que es posible adaptar un modelo base de gran tamaño mediante LoRA con datos de alta calidad y verificación de solapamiento con conjuntos de evaluación. No obstante, su licencia restringe el uso comercial y la distribución, y su aplicabilidad fuera del coreano es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Peri-Layer Normalization y Maximal Update Parameterization (μP) |
| Parametros totales | 14 748 112 896 (14,7 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | HyperCLOVA X SEED Model License Agreement (licencia personalizada, no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del HyperCLOVAX-SEED-Think-14B, un Transformer autoregresivo con 14,74 B parámetros, que emplea Peri-Layer Normalization y μP para estabilizar el entrenamiento a gran escala. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation) sobre este modelo base, y posteriormente se fusionaron los adaptadores con los pesos originales, dando lugar al modelo final. El proceso de entrenamiento se centró en alinear el modelo con tareas de razonamiento de opción múltiple en coreano, enseñándole a generar una cadena de pensamiento (CoT) antes de emitir la respuesta final en el formato `정답: X`.

Los datos de entrenamiento provienen de varias fuentes: el conjunto de entrenamiento de KMMLU (HAERAE-HUB/KMMLU), datos generados por el teacher model Upstage Solar Pro 4 (con autorización expresa de Upstage para uso no comercial en hackathon) y por DeepSeek-R1-0528, datos de consultas públicas de AI Hub sobre administración y legislación coreana, y conjuntos propios de preguntas sobre cultura y lengua coreanas, así como razonamiento sintético. También se utilizó una versión coreanizada del split de entrenamiento de Com2, excluyendo previamente cualquier solapamiento con los conjuntos de evaluación KMMLU-Pro y CLIcK, tanto a nivel de pregunta como de opciones. No se empleó el split de test de los benchmarks de evaluación.

## Capacidades

- Generación de texto en coreano con razonamiento de opción múltiple: el modelo recibe una pregunta con varias opciones y produce una respuesta razonada que concluye con la opción correcta en formato `정답: X`.
- Razonamiento multi-paso: entrenado para desglosar problemas complejos en pasos intermedios antes de dar la respuesta final, especialmente en tareas de conocimiento y lógica.
- Conocimiento administrativo y legal coreano: ajustado con datos de consultas públicas de AI Hub, lo que le permite responder sobre trámites, normativas y procedimientos administrativos de Corea del Sur.
- Conversación estructurada: soporta el formato de chat ChatML, con un template que por defecto desactiva el modo "think" (razonamiento explícito), aunque puede activarse si se solicita.
- Estabilidad de generación: alineado para terminar la generación de forma controlada mediante tokens de parada (`<|endofturn|>`, `<|stop|>`), evitando respuestas truncadas o inconclusas.
- Capacidades heredadas del modelo base: al estar basado en HyperCLOVAX-SEED-Think-14B, conserva el soporte de function calling y el modo de razonamiento dual (think/no-think) del modelo original, aunque el fine-tuning no los modifica explícitamente.

## Casos de uso

- Preparación de exámenes de certificación en coreano: el modelo puede generar explicaciones paso a paso para preguntas de opción múltiple de exámenes como el TOEIC, el Korean Language Proficiency Test (KLPT) o certificaciones profesionales, ayudando a los estudiantes a comprender el razonamiento detrás de cada respuesta.
- Asistente de consultas administrativas: gracias a su entrenamiento con datos de AI Hub sobre administración pública, puede responder a preguntas sobre trámites, requisitos y procedimientos legales en Corea del Sur, ofreciendo respuestas estructuradas y citando la normativa aplicable.
- Tutoría de razonamiento lógico: el modelo puede descomponer problemas de lógica o matemáticas de opción múltiple en pasos intermedios, sirviendo como herramienta de apoyo para estudiantes que necesitan practicar estrategias de resolución.
- Evaluación automática de conocimiento en coreano: empresas o instituciones pueden usar el modelo para generar preguntas de opción múltiple y verificar la coherencia de las respuestas en sistemas de evaluación interna, aprovechando su capacidad de razonamiento multi-paso.
- Chatbot de atención al cliente con conocimiento legal: integrado en un sistema de atención al cliente, puede resolver dudas sobre derechos del consumidor, contratos o normativas sectoriales, proporcionando respuestas razonadas y enlazando con la legislación coreana.
- Investigación académica en PNL coreana: el modelo sirve como punto de partida para estudiar técnicas de distillation y fine-tuning en coreano, dado que su proceso de entrenamiento está documentado y utiliza datos públicos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo fue desarrollado para el K-DATA Science Hackathon y su rendimiento en conjuntos como KMMLU-Pro o CLIcK no ha sido divulgado en la model card ni en los resultados de búsqueda web. Se recomienda evaluar el modelo en estos benchmarks de forma independiente antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 14,7 B parámetros en bfloat16, lo que supone aproximadamente 29,5 GB de pesos. Con overhead de activaciones y memoria intermedia, se recomienda al menos 32 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: para ejecutar el modelo en bfloat16 se necesitan GPUs de datacenter como A100 (40 GB o 80 GB), H100 (80 GB) o A6000 (48 GB). En GPUs de consumo, una RTX 4090 (24 GB) no es suficiente para bfloat16 completo, pero podría funcionar con cuantización de 8 bits o 4 bits (no documentada en la información disponible).
- Opciones de despliegue: el modelo es compatible con el ecosistema Hugging Face Transformers, por lo que puede servirse con vLLM, TGI (Text Generation Inference) o llama.cpp si se convierte a formato GGUF. También es posible usar Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 14,7 B en una A100 puede alcanzar un throughput de 20-40 tokens/s con batch de 1, pero estos valores son estimaciones genéricas y no han sido verificados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.8 | 14,7 B | 32k | coreano | HyperCLOVA X SEED (no comercial) | Fine-tuning LoRA del modelo base, especializado en opción múltiple |
| HyperCLOVAX-SEED-Think-14B (base) | 14,74 B | 32k | coreano, inglés (parcial) | HyperCLOVA X SEED | Modelo original de NAVER, con razonamiento dual y function calling |
| HyperCLOVA-X-SEED-MISHULTA-v1 (versión sin Solar Distilled) | 14,7 B | 32k | coreano | HyperCLOVA X SEED | Misma base, pero sin distillation con Solar Pro 4 |

La comparativa se limita a las variantes del mismo equipo y al modelo base, ya que no se dispone de datos de otros modelos coreanos de tamaño similar con los que comparar directamente. El fine-tuning introduce una especialización en razonamiento de opción múltiple que el modelo base no tiene, pero a costa de una licencia más restrictiva y un ámbito de aplicación más reducido.

## Limitaciones y advertencias

- Licencia no comercial: el modelo se distribuye bajo la HyperCLOVA X SEED Model License Agreement, que restringe el uso comercial. Cualquier aplicación en producción con fines lucrativos queda excluida.
- Restricciones de distillation: el uso de Upstage Solar Pro 4 como teacher model fue autorizado excepcionalmente para el hackathon. La distillation con Solar no está permitida en los términos generales de Upstage, por lo que este modelo no debe tomarse como precedente para replicar el proceso.
- Idioma limitado: el modelo está entrenado exclusivamente en coreano. No es adecuado para tareas en otros idiomas, y su rendimiento en inglés u otros idiomas será muy deficiente.
- Sesgos potenciales: al estar entrenado con datos de consultas administrativas y culturales coreanas, puede reflejar sesgos propios de la sociedad coreana o de los conjuntos de datos utilizados. No se ha realizado una evaluación de sesgos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios fuera de su entrenamiento. La verificación de hechos es imprescindible en aplicaciones de asesoramiento legal o administrativo.
- Sin datos de rendimiento publicados: no se han divulgado resultados de benchmarks, por lo que no es posible comparar su calidad con otros modelos de forma objetiva.
- Dependencia del modelo base: cualquier limitación del HyperCLOVAX-SEED-Think-14B (por ejemplo, en razonamiento matemático avanzado o en contextos muy largos) se hereda en este fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.8
- Modelo base (HyperCLOVAX-SEED-Think-14B): https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Licencia del modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B/blob/main/LICENSE
- Documentación de Transformers para HyperCLOVA X SEED: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/hyperclovax.md
- Página de HyperCLOVA X en CLOVA: https://clova.ai/en/hyperclova
- Versión v1.7 del mismo equipo: https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.7
- Versión v1 (sin Solar Distilled): https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-v1
