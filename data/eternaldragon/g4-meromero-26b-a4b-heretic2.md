# EternalDragon/G4-MeroMero-26B-A4B-Heretic2

## Resumen

G4-MeroMero-26B-A4B-Heretic2 es un fine-tune derivado del modelo zerofata/G4-MeroMero-26B-A4B, que a su vez parte de Google Gemma 4 26B-A4B instruct. Lo desarrolla el usuario EternalDragon y aplica una ablación de rechazos (refusal ablation) mediante la herramienta Heretic 2.0.0 sobre el checkpoint MeroMero original, sin introducir una etapa adicional de SFT convencional. El resultado es un modelo multimodal image-text-to-text orientado a roleplay y conversación sin restricciones de rechazo, publicado bajo licencia Apache 2.0.

El repositorio empaqueta tres variantes: un checkpoint BF16 completo fusionado (51,61 GB en 11 archivos safetensors), un GGUF Q4_0 estándar (14,49 GB) y un GGUF Q4_0 experimental con scale-QAT (14,49 GB). El modelo declara 25.805.936.206 parámetros totales y una arquitectura Gemma 4 con mezcla de expertos (la nomenclatura A4B sugiere aproximadamente 4B parámetros activos, aunque el dato exacto de parámetros activos no está confirmado en la información disponible). Los GGUFs son exportaciones solo de texto y no incluyen el proyector de visión.

La relevancia actual del modelo reside en su enfoque técnico: la ablación arbitraria de rango 50 sobre proyecciones de salida de atención y proyecciones down del MLP compartido, con una búsqueda extendida de hiperparámetros, más una variante QAT experimental que entrena únicamente las escalas de bloque manteniendo congelados los códigos de cuantización. Es un caso de estudio útil para quienes investigan técnicas de modificación de comportamiento en modelos abiertos y su impacto en la fidelidad tras cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 con mezcla de expertos (MoE), transformer multimodal image-text-to-text |
| Parametros totales | 25.805.936.206 |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint completo), Q4_0 (GGUF estándar), Q4_0 scale-QAT (GGUF experimental) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 11 shards) y GGUF (Q4_0 y Q4_0-QAT) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B instruct de Google, una arquitectura transformer con mezcla de expertos que en el checkpoint base combina pesos de visión y de texto. Sobre esa base, zerofata produjo el fine-tune MeroMero orientado a roleplay, y EternalDragon aplicó posteriormente Heretic 2.0.0 con ablación de rango arbitrario (rank 50, seed 42). La ablación se aplicó sobre las proyecciones de salida de atención y las proyecciones down del MLP compartido, en las capas 15 a 26, con pesos de preservación de buen comportamiento de 0,3274, de dirección de mal comportamiento de 0,0005 y de sobrecorrección relativa de 0,6647, usando 15 vecinos. La revisión base fue `475ecf2da8d4e758343541832b3b129b9d4f93da`.

El merge BF16 resultante obtuvo 9/100 en el conjunto de rechazos de optimización de Heretic, con una KL de primer token de 0,014121; el autor advierte que esos prompts se usaron para la optimización y no constituyen un benchmark independiente. La variante scale-QAT es una destilación por activaciones capa a capa (no QAT completo): el profesor es el modelo BF16 final, los códigos de cuantización Q4 nativos permanecen congelados y solo se entrenan las escalas de bloque en FP16, incluidos los expertos MoE fusionados. El piloto entrenó 30 capas durante 24 pasos por capa con 64 conversaciones de 128 tokens de contexto, calibrando con particiones fijadas de `HuggingFaceH4/no_robots`. La imatrix original de MeroMero contiene 295 entradas estructuralmente emparejadas, con recuentos cero en algunos expertos de capas tempranas, y sus estadísticas se recogieron antes de la ablación.

## Capacidades

- Generación de texto conversacional y roleplay multi-turno, con plantillas de chat incluidas (`chat_template.jinja`) y perfiles `Gemma4-Think.json` y `Gemma4-NoThink.json`.
- Procesamiento de imagen y texto (pipeline image-text-to-text) en el checkpoint BF16 raíz, que conserva los pesos de visión originales.
- Comportamiento sin rechazos por diseño: la ablación Heretic elimina parte de las respuestas de negativa del modelo base.
- Modo de razonamiento explícito (think) y modo sin razonamiento (no-think) mediante perfiles de prompt.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está afinado específicamente para mantener personajes y estilo conversacional en diálogos multi-turno, con perfiles think/no-think para controlar el razonamiento visible.
- Investigación sobre alineación y refusal ablation: sirve como sujeto de estudio para medir cómo la ablación de rango 50 afecta a la tasa de rechazos, usando el conjunto de optimización de Heretic y los probes de comportamiento documentados.
- Evaluación de técnicas de cuantización: la pareja Q4_0 frente a Q4_0 scale-QAT permite comparar fidelidad (KL de 1,768927 frente a 1,139501 en el probe corto) y comportamiento en un mismo modelo, útil para estudiar el impacto de entrenar solo escalas de bloque.
- Despliegue local en consumer GPU: el GGUF Q4_0 de 14,49 GB cabe en GPUs de 16 GB o más, lo que permite ejecutar un modelo de ~26B totales en hardware de gama alta de consumo mediante llama.cpp.
- Generación de datos sintéticos conversacionales: al no rechazar peticiones, puede emplearse para producir diálogos de entrenamiento en dominios donde los modelos alineados estándar se niegan, con revisión humana posterior.
- Análisis de sesgos y contenido dañino: los probes de 55 prompts dañinos (7/55 marcados por palabras clave, 28/55 por clasificador semántico en BF16) ofrecen una base para estudiar la relación entre ablación y clasificadores de seguridad.
- Prototipado de asistentes multimodales: el checkpoint BF16 con visión permite experimentar con entrada de imagen y texto en entornos de investigación, aunque los GGUFs no incluyen el proyector visual.

## Benchmarks y rendimiento

Los únicos datos publicados son los probes internos del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K no están disponibles).

| Variante | KL a BF16 en probe corto (↓) | Probe de conocimiento (456 preguntas) | Flags por palabra clave (55 prompts dañinos) | Flags por clasificador (55 prompts dañinos) |
|---|---|---|---|---|
| BF16 referencia | 0 (autocomprobación) | 374/456 | 7/55 | 28/55 |
| Q4_0 | 1,768927 | 365/456 | 7/55 | 25/55 |
| Q4_0 scale-QAT | 1,139501 | 366/456 | 7/55 | 31/55 |

El autor señala que la variante scale-QAT redujo la KL medida un 35,6 % en el probe corto, que la diferencia de una pregunta en conocimiento no establece una mejora general y que las columnas de flags no son tasas verificadas de rechazo real. Las respuestas de comportamiento se limitaron a 256 tokens y cuatro casos de roleplay de dos turnos fueron solo comprobaciones cualitativas. El merge BF16 obtuvo 9/100 en el conjunto de optimización de rechazos de Heretic (KL de primer token 0,014121), dato que no es un benchmark independiente.

## Requisitos de hardware

- VRAM para BF16: aproximadamente 52 GB solo de pesos, más overhead de activaciones y caché KV; requiere múltiples GPUs o una GPU de 80 GB.
- VRAM para GGUF Q4_0: aproximadamente 14,5 GB de pesos; con contexto y overhead, se recomienda 16-24 GB de VRAM.
- GPUs recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB), RTX 3090 (24 GB) o GPUs de 16 GB para el GGUF Q4_0.
- Cabe en consumer GPU: sí, en el formato Q4_0 de 14,49 GB, en tarjetas de 16 GB o superiores.
- Opciones de despliegue: transformers con una versión compatible con Gemma 4 para el checkpoint BF16; llama.cpp para los GGUF; vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-Heretic2 | 25,8B totales (activos no disponibles) | no disponible | Apache 2.0 | safetensors, GGUF | Ablación Heretic 2.0, variante QAT experimental |
| zerofata/G4-MeroMero-26B-A4B | no disponible | no disponible | no disponible | no disponible | Modelo base del fine-tune, orientado a roleplay |
| google/gemma-4-26B-A4B-it | no disponible | no disponible | no disponible | no disponible | Modelo fundacional instruct de Google |
| Heretic 1.2 (release anterior) | no disponible | no disponible | no disponible | no disponible | Release previa de ablación, no redistribuida en este repo |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación de rechazos elimina parte de las negativas de seguridad del modelo base; no debe desplegarse en producción orientada al público sin filtros externos.
- Riesgo elevado de alucinación: el autor advierte explícitamente que las predicciones pueden ser incorrectas y que las evaluaciones no establecen fiabilidad factual.
- Los resultados de conocimiento (456 preguntas) son un probe de desarrollo, no MMLU completo ni independiente.
- Los flags de palabras clave y del clasificador semántico de CPU incluyen falsos positivos evidentes según revisión del autor; no son tasas verificadas de rechazo.
- La variante QAT es experimental: entrena solo escalas de bloque, no es el checkpoint QAT oficial de Google y no transfiere un adaptador a otro modelo base.
- La imatrix original tiene recuentos cero en algunos expertos de capas tempranas y se calculó antes de la ablación, lo que puede afectar a la cuantización de esas capas.
- Los GGUFs no incluyen el proyector de visión; solo el checkpoint BF16 raíz conserva las capacidades multimodales.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en aplicaciones sensibles.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- Modelo base MeroMero: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Modelo fundacional Gemma 4 26B-A4B instruct: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Resultados numéricos y protocolo: evaluation.json (incluido en el repositorio del modelo)
- GGUF Q4_0: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2/blob/main/gguf/Q4_0/G4-MeroMero-26B-A4B-Heretic2-Q4_0.gguf
- GGUF Q4_0 scale-QAT: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2/blob/main/gguf/Q4_0-QAT/G4-MeroMero-26B-A4B-Heretic2-QAT-Q4_0.gguf
