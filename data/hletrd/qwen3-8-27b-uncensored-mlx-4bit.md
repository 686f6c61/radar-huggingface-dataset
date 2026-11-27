# hletrd/Qwen3.8-27B-Uncensored-MLX-4bit

## Resumen

Qwen3.8-27B-Uncensored-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el usuario hletrd. El modelo base ha sido sometido a una edición de tipo "abliterated": se ha eliminado de los pesos la dirección de rechazo (refusal direction), de modo que el modelo responde a solicitudes que el original declina. Posteriormente se convirtió a MLX para su uso con `mlx-lm` y se cuantizó de forma afín con tamaño de grupo 32.

La conversión es exclusivamente de texto: se han omitido la torre de visión y la capa MTP (multi-token prediction) del modelo original. El resultado es un conjunto de pesos de 16,81 GB con 26.895.993.856 parámetros totales, pensado para ejecutarse en hardware Apple Silicon mediante el framework MLX. La licencia declarada es Apache 2.0.

Este modelo es relevante para quienes necesitan ejecutar un modelo de ~27B en un Mac con memoria unificada moderada (a partir de 36 GB) manteniendo un nivel de fidelidad respecto a los pesos BF16 originales razonablemente alto: la model card reporta una divergencia KL de 0,0397 en WikiText-2 y un acuerdo top-1 del 90,82 %. No obstante, la pérdida de capacidades multimodales y el sesgo introducido por la eliminación de rechazos son factores a considerar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); sin torre de visión ni capa MTP en esta conversión |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K según hardware (121K con 36 GB; 80K con 48 GB; 256K con 64 GB o más) |
| Tipos de cuantizacion | MLX 4-bit (esta publicación) y MLX 8-bit (publicación hermana); cuantización afín, group size 32, escalas y sesgos en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); repo de 16,8 GB |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B pertenece a la familia Qwen3.5 y es un transformer de aproximadamente 26,9 mil millones de parámetros. La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo base, que no se ha proporcionado.

La innovación técnica de esta publicación es el proceso de edición y cuantización. Primero se aplicó sobre Qwen/Qwen3.8-27B la misma edición "uncensored" publicada previamente en hletrd/Qwen3.8-27B-Uncensored-GGUF, que elimina la dirección de rechazo de los pesos. Después se convirtió a MLX para `mlx-lm`, descartando la torre de visión y la capa MTP, y se cuantizaron a 4 bits todas las capas lineales, el embedding de tokens y la LM head, manteniendo normas y otros tensores sin cuantizar en float16 (salvo `A_log`, en bfloat16). La model card reporta métricas de fidelidad frente a los pesos BF16: KL de 0,039687 y top-1 del 90,82 % en WikiText-2; KL de 0,045670 y top-1 del 91,76 % en el conjunto de chat; KL de 0,040544 y top-1 del 89,25 % en held-out. La versión 8-bit alcanza KL de 0,000354 y top-1 del 99,26 % en WikiText-2.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Modo "thinking" activado por defecto: el modelo razona antes de responder; puede desactivarse con `--chat-template-config '{"enable_thinking": false}'`.
- Respuestas a solicitudes que el modelo original rechaza, gracias a la eliminación de la dirección de rechazo.
- Razonamiento multi-turno y conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidades multimodales: no disponibles en esta conversión (torre de visión omitida).
- Predicción multi-token (MTP): no disponible en esta conversión (capa MTP omitida).
- Tool calling / function calling: no confirmado en la información disponible para esta conversión.
- Capacidades multilingües: no disponibles (idiomas no declarados).

## Casos de uso

- Inferencia local en Apple Silicon: ejecutar un modelo de ~27B en un Mac Studio con 36 GB de memoria unificada usando `mlx-lm`, aprovechando la cuantización 4-bit para ajustar el uso de memoria a 16,81 GB.
- Experimentación con modelos sin rechazos: estudiar el comportamiento de un modelo abliterated en tareas de investigación sobre alineación, seguridad y sesgos, comparándolo con el original.
- Generación de texto creativo sin restricciones temáticas: redacción de ficción, guiones o contenido donde el modelo original declina peticiones por políticas de contenido.
- Asistentes conversacionales de contexto largo: con 64 GB o más de memoria unificada se puede desplegar con ventana de 256K tokens para conversaciones multi-turno extensas o análisis de documentos largos.
- Prototipado rápido en local: usar `mlx_lm.chat` para iterar sobre prompts y plantillas de chat sin depender de infraestructura GPU en la nube.
- Evaluación de cuantización: comparar la fidelidad de la versión 4-bit (16,81 GB) frente a la 8-bit (28,58 GB) en tareas propias, usando las métricas KL y top-1 publicadas como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de fidelidad de cuantización frente a los pesos BF16 del propio modelo:

| Metrica | MLX 8-bit | MLX 4-bit |
|---|---:|---:|
| Tamano | 28,58 GB | 16,81 GB |
| WikiText-2 KL | 0,000354 | 0,039687 |
| WikiText-2 top-1 | 99,26 % | 90,82 % |
| Chat KL | 0,000327 | 0,045670 |
| Chat top-1 | 99,31 % | 91,76 % |
| Held-out KL | 0,000250 | 0,040544 |
| Held-out top-1 | 99,06 % | 89,25 % |
| Verificación de 7 preguntas | 7/7 (BF16: 7/7) | 7/7 (BF16: 7/7) |

## Requisitos de hardware

- VRAM/memoria unificada: 16,81 GB para los pesos 4-bit; la model card indica 36 GB de memoria unificada para contexto de 121K, 48 GB para 80K con la versión 8-bit, y 64 GB o más para 256K.
- GPU recomendadas: Apple Silicon exclusivamente (formato MLX). La model card cita Mac Studio M5 Max (32 o 40 núcleos GPU) y Mac Studio M5 Ultra (80 núcleos GPU).
- GPU NVIDIA (A100, H100, RTX 4090): no compatibles directamente con este formato; sería necesario usar la versión GGUF del mismo autor o los pesos originales.
- Cabe en consumer GPU: no aplica en el sentido habitual; requiere hardware Apple Silicon con memoria unificada de al menos 36 GB.
- Opciones de despliegue: `mlx-lm==0.32.2` (comandos `mlx_lm.generate` y `mlx_lm.chat`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| hletrd/Qwen3.8-27B-Uncensored-MLX-4bit | ~26,9B | hasta 256K (según RAM) | MLX safetensors 4-bit | Apache 2.0 | Solo texto; sin visión ni MTP |
| hletrd/Qwen3.8-27B-Uncensored-MLX-8bit | ~26,9B | hasta 256K | MLX safetensors 8-bit | Apache 2.0 | Mayor fidelidad (KL 0,000354), 28,58 GB |
| hletrd/Qwen3.8-27B-Uncensored-GGUF | ~26,9B | no disponible | GGUF | Apache 2.0 | Edición uncensored previa; compatible con llama.cpp |
| Qwen/Qwen3.8-27B (base) | ~26,9B | no disponible | safetensors | Apache 2.0 | Modelo original con rechazos y capacidades completas |

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo reduce las negativas del modelo, lo que puede producir contenido inapropiado, dañino o no alineado con políticas de uso; no es apto para aplicaciones orientadas al público sin filtros adicionales.
- Pérdida de capacidades del modelo base: no incluye torre de visión ni capa MTP, por lo que no puede procesar imágenes ni aprovechar la predicción multi-token.
- La cuantización 4-bit introduce degradación medible: KL de 0,0397 y top-1 de 90,82 % en WikiText-2 frente a BF16; para tareas sensibles a la fidelidad conviene evaluar la versión 8-bit.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de veracidad para esta conversión.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingüe equiparable al del modelo base.
- Formato MLX exclusivo: no se puede desplegar en GPUs NVIDIA ni en la mayoría de infraestructuras de servidor sin reconvertir los pesos.
- Aunque la licencia es Apache 2.0, el autor indica que ha modificado los pesos; conviene revisar el archivo `NOTICE` para conocer los términos exactos de la redistribución.
- El repositorio no tiene descargas ni likes y fue publicado en noviembre de 2026; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.8-27B-Uncensored-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF uncensored del mismo autor: https://huggingface.co/hletrd/Qwen3.8-27B-Uncensored-GGUF
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de herramientas de cuantización del autor (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq
