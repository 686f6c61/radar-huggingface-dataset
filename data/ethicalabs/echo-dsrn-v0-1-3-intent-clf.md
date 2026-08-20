# ethicalabs/Echo-DSRN-v0.1.3-Intent-CLF

## Resumen

Echo-DSRN-v0.1.3-Intent-CLF es un modelo de clasificación de secuencias de 98 millones de parámetros desarrollado por ethicalabs, diseñado específicamente para el enrutamiento de intenciones (intent routing) en tareas estrechas y bien definidas. Forma parte de la familia Echo-DSRN, una arquitectura recurrente híbrida orientada a despliegues con recursos limitados. El modelo se ha entrenado sobre el dataset Amazon MASSIVE, que cubre 60 intents en 51 idiomas, lo que lo convierte en una opción interesante para asistentes virtuales multilingües y sistemas de atención al cliente.

El modelo se obtiene mediante la fusión del modelo base Echo-DSRN-114M-v0.1.2 con un adaptador PEFT específico para clasificación de intenciones. Está liberado bajo licencia Apache-2.0 y sus pesos están en formato safetensors. Aunque el repositorio incluye una advertencia explícita de que se trata de un modelo experimental y no debe usarse en entornos de producción, su tamaño compacto y su alto rendimiento de inferencia (más de 1200 muestras por segundo en el benchmark de evaluación) lo hacen atractivo para prototipos y estudios académicos.

La relevancia actual de este modelo radica en su capacidad multilingüe (51 lenguas) y su eficiencia computacional, lograda mediante una arquitectura recurrente híbrida que combina recurrencia con mecanismos de atención. Esto permite ejecutarlo en GPUs convencionales y en entornos con memoria limitada, manteniendo una precisión global del 67,71% en el conjunto de validación de MASSIVE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EchoForClassification (Echo-DSRN, recurrente híbrida) |
| Parametros totales | 98.294.844 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (nativo); no se especifican otros |
| Idiomas soportados | 51 lenguas (ver tabla de evaluación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Echo-DSRN es una arquitectura recurrente híbrida diseñada para tareas de clasificación y etiquetado en entornos con restricciones de cómputo. Combina capas recurrentes con mecanismos de atención para capturar dependencias secuenciales sin el coste de un transformer completo. El modelo base (Echo-DSRN-114M-v0.1.2) tiene 114 millones de parámetros, pero al añadir la cabeza de clasificación y fusionar el adaptador PEFT, el número total se reduce a 98 millones. El entrenamiento se realizó sobre el dataset Amazon MASSIVE, que incluye 60 intents y 51 idiomas, utilizando un adaptador PEFT sobre el modelo base. No se especifican el número de tokens de entrenamiento ni técnicas de alineación como RLHF o DPO. El modelo se entrenó en una GPU AMD (Radeon AI PRO R9700) con ROCm 7.2, lo que demuestra su compatibilidad con hardware no NVIDIA.

## Capacidades

- Clasificación de intenciones (intent classification) en 51 idiomas, con etiquetas del dataset Amazon MASSIVE (60 intents).
- Clasificación zero-shot: el tag del repositorio indica soporte para zero-shot classification, aunque no se detallan los procedimientos exactos.
- Inferencia de alta velocidad: 1259 muestras por segundo en el benchmark de evaluación (batch 256), con una latencia estimada por petición de 0,79 ms.
- Bajo consumo de memoria: el perfil de VRAM se mantiene estable durante la inferencia (crecimiento de KV cache del 0,00%).
- No incluye generación de texto, tool calling ni capacidades de agente; es exclusivamente un clasificador de secuencias.

## Casos de uso

- Enrutamiento de intenciones en asistentes virtuales multilingües: el modelo puede clasificar consultas de usuarios en 51 idiomas y dirigirlas al flujo de diálogo adecuado, gracias a su amplia cobertura lingüística y baja latencia.
- Sistemas de atención al cliente automatizada: permite categorizar tickets o mensajes entrantes en intents predefinidos (reclamaciones, devoluciones, información de producto, etc.) con una precisión aceptable en la mayoría de idiomas.
- Clasificación semántica de consultas en motores de búsqueda o sistemas de recomendación: al identificar la intención del usuario, se puede optimizar la respuesta o el filtrado de resultados.
- Análisis de intención en redes sociales o encuestas: permite detectar la intención detrás de comentarios o respuestas abiertas, útil para estudios de mercado o moderación de contenido.
- Preprocesamiento para pipelines de NLP: como etapa inicial en sistemas más complejos, el modelo puede filtrar o etiquetar grandes volúmenes de texto de forma rápida y con bajo coste computacional.
- Prototipado de asistentes de voz o texto en idiomas de baja representación: su soporte para lenguas como el javanés, el cingalés o el amárico facilita la experimentación en mercados emergentes.

## Benchmarks y rendimiento

Accuracy por idioma en el conjunto de validación de Amazon MASSIVE (51 lenguas):

| Idioma | Accuracy | Aciertos/Total |
|---|---|---|
| en-US | 81,14% | 4949/6099 |
| id-ID | 76,90% | 4690/6099 |
| it-IT | 76,57% | 4670/6099 |
| da-DK | 75,60% | 4611/6099 |
| es-ES | 75,50% | 4605/6099 |
| fr-FR | 74,95% | 4571/6099 |
| pt-PT | 73,82% | 4502/6099 |
| zh-CN | 73,57% | 4487/6099 |
| lv-LV | 73,47% | 4481/6099 |
| ca-ES | 73,44% | 2986/4066 |
| nb-NO | 73,18% | 4463/6099 |
| ms-MY | 73,13% | 4460/6099 |
| af-ZA | 73,04% | 4455/6099 |
| nl-NL | 72,86% | 4444/6099 |
| tl-PH | 72,77% | 4438/6099 |
| sv-SE | 72,16% | 4401/6099 |
| ja-JP | 72,06% | 4395/6099 |
| de-DE | 72,03% | 4393/6099 |
| jv-ID | 71,86% | 4383/6099 |
| pl-PL | 71,65% | 4370/6099 |
| zh-TW | 71,29% | 4348/6099 |
| is-IS | 70,63% | 4308/6099 |
| ko-KR | 70,60% | 4306/6099 |
| az-AZ | 69,86% | 4261/6099 |
| mn-MN | 69,77% | 4255/6099 |
| ro-RO | 69,42% | 4234/6099 |
| sq-AL | 68,81% | 4197/6099 |
| cy-GB | 68,49% | 4177/6099 |
| fi-FI | 68,21% | 4160/6099 |
| fa-IR | 67,83% | 4137/6099 |
| hu-HU | 67,52% | 4118/6099 |
| vi-VN | 67,40% | 4111/6099 |
| tr-TR | 67,14% | 4095/6099 |
| sl-SL | 66,24% | 4040/6099 |
| sw-KE | 65,73% | 4009/6099 |
| el-GR | 65,54% | 3997/6099 |
| hy-AM | 65,37% | 3987/6099 |
| ru-RU | 64,37% | 3926/6099 |
| hi-IN | 63,27% | 3859/6099 |
| ml-IN | 63,27% | 3859/6099 |
| ur-PK | 61,93% | 3777/6099 |
| he-IL | 61,80% | 3769/6099 |
| ar-SA | 60,52% | 3691/6099 |
| th-TH | 60,39% | 3683/6099 |
| bn-BD | 59,94% | 3656/6099 |
| ta-IN | 59,42% | 3624/6099 |
| my-MM | 57,70% | 3519/6099 |
| ka-GE | 57,26% | 3492/6099 |
| kn-IN | 56,85% | 3467/6099 |
| am-ET | 53,68% | 3274/6099 |
| te-IN | 51,53% | 3143/6099 |
| km-KH | 51,52% | 3142/6099 |
| **OVERALL** | **67,71%** | **213375/315115** |

Serving benchmark con vLLM (Eager mode, bfloat16), prompt de evaluación "voglio una pizza":

| Concurrencia | Throughput (req/s) | p50 Latencia | p95 Latencia | Latencia media | Errores |
|---|---|---|---|---|---|
| 1 | 80,34 | 12 ms | 15 ms | 12 ms | 0 |
| 2 | 96,39 | 20 ms | 25 ms | 20 ms | 0 |
| 4 | 182,24 | 20 ms | 29 ms | 21 ms | 0 |
| 8 | 356,53 | 20 ms | 28 ms | 21 ms | 0 |
| 16 | 612,88 | 21 ms | 37 ms | 23 ms | 0 |

## Requisitos de hardware

- VRAM: el pico de VRAM observado en el benchmark fue de 13.332,67 MB con batch size 256 y dtype bfloat16. Para inferencia con batch menor, el consumo será significativamente inferior (el perfil de VRAM por batch se mantuvo en ~280 MB).
- GPU recomendada: se utilizó una AMD Radeon AI PRO R9700 con ROCm 7.2. Dado el tamaño del modelo (98M parámetros), es viable en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en hardware AMD equivalente.
- Despliegue: compatible con vLLM (modo Eager) y con la librería transformers estándar. No se menciona soporte para llama.cpp u Ollama, pero al ser un modelo de clasificación, la integración con frameworks de serving como TorchServe o FastAPI es directa.
- Latencia y throughput: en el benchmark de vLLM, con concurrencia 1 se obtienen 80,34 peticiones/s con latencia p50 de 12 ms; con concurrencia 16, el throughput alcanza 612,88 peticiones/s con p95 de 37 ms.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de clasificación de intenciones en la información disponible. No obstante, por su tamaño y arquitectura, podría situarse en la misma categoría que clasificadores basados en BERT mini o DistilBERT, aunque no se dispone de datos para una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio incluye una advertencia explícita: se trata de un modelo experimental, diseñado únicamente para evaluación académica e investigación. No debe desplegarse en entornos comerciales, empresariales o de misión crítica bajo ninguna circunstancia.
- La precisión varía considerablemente entre idiomas: desde el 81,14% en inglés hasta el 51,52% en jemer (km-KH). Para idiomas con menor representación, el rendimiento puede ser insuficiente en aplicaciones reales.
- No se especifican sesgos conocidos ni se han realizado estudios de sesgo sobre el modelo.
- Al ser un clasificador, el riesgo de alucinación es bajo, pero puede producir etiquetas incorrectas en entradas ambiguas o fuera del dominio de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el aviso del autor desaconseja su uso en producción. Esta contradicción debe tenerse en cuenta antes de cualquier implementación.
- No se proporciona información sobre la longitud máxima de contexto soportada, lo que limita su uso en textos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethicalabs/Echo-DSRN-v0.1.3-Intent-CLF
- Repositorio GitHub: https://github.com/ethicalabs-ai/Echo-DSRN/
- Colección de modelos Echo-DSRN: https://huggingface.co/collections/ethicalabs/echo-dsrn
- Working paper: https://github.com/ethicalabs-ai/Echo-DSRN/blob/main/PAPER.md
- Modelo base: https://huggingface.co/ethicalabs/Echo-DSRN-114M-v0.1.2
- Adaptador PEFT: https://huggingface.co/ethicalabs/Echo-DSRN-v0.1.3-Intent-CLF-PEFT
