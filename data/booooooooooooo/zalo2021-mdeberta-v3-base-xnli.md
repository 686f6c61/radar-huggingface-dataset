# Booooooooooooo/zalo2021-mdeberta-v3-base-xnli

## Resumen

El modelo `zalo2021-mdeberta-v3-base-xnli` es un cross-encoder de clasificación de pares de secuencias (NLI) especializado en verificación de evidencia para recuperación de información jurídica en vietnamita. Lo publica el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de carrera sobre sistemas de recuperación de información legal, y se entrena sobre el conjunto de datos ZALO2021. Su función concreta es recibir una consulta y un fragmento de evidencia candidato y decidir si ese fragmento respalda la consulta (entailment) o no (contradicción o irrelevancia).

Técnicamente parte de la familia DeBERTa-v2 (la etiqueta del repositorio indica `deberta-v2`, y el nombre apunta a una base multilingüe mDeBERTa-v3-base), con 278.810.882 parámetros y pesos en formato safetensors. Es un encoder de clasificación, no un modelo generativo: no produce texto, sino una puntuación de relevancia sobre un par (pregunta, evidencia), lo que lo sitúa como reordenador o verificador dentro de un pipeline RAG legal.

Su relevancia es acotada pero clara: el dominio jurídico vietnamita carece de verificadores NLI abiertos, y este modelo ofrece una licencia MIT sobre un checkpoint pequeño (0,6 GB) que puede ejecutarse en hardware modesto para filtrar recuperaciones antes de pasarlas a un modelo generador. No obstante, no dispone de descargas ni validación pública en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa-v2 (cross-encoder de clasificación de pares) |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un encoder transformer de la familia DeBERTa-v2 configurado como cross-encoder para clasificación de pares: la consulta y la evidencia se concatenan y se procesan conjuntamente, y la cabeza de clasificación emite dos logits (clase 0: contradicción o no relevante; clase 1: entailment o evidencia de apoyo). La model card indica explícitamente `Base Model: None` y `Kiến trúc Verifier: encoder`, sin detallar la inicialización exacta de los pesos ni el número de capas y dimensiones ocultas.

El entrenamiento se realiza sobre el conjunto de datos ZALO2021, en el contexto de un sistema de recuperación de información jurídica. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste fino supervisado adicionales, RLHF o DPO. Tampoco documenta innovaciones técnicas como decodificación especulativa o atención lineal; es un ajuste fino estándar de clasificación de secuencias.

## Capacidades

- Clasificación binaria de pares (consulta, evidencia) en vietnamita: entailment frente a contradicción o no relevancia.
- Puntuación de relevancia mediante `sigmoid(logit_1 - logit_0)`, tal como muestra la model card.
- Verificación de evidencia en pipelines de recuperación de información jurídica (legal IR).
- Funciona como cross-encoder reordenador tras una etapa de recuperación densa o léxica.
- No genera texto, no razona de forma multi-paso y no soporta tool calling ni function calling.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; la model card declara únicamente vietnamita.

## Casos de uso

- Verificación de evidencia en RAG jurídico: dado un fragmento recuperado de una base de normativa vietnamita, el modelo puntúa si respalda la consulta del usuario antes de pasarlo al generador, reduciendo respuestas sin fundamento.
- Reordenación de resultados de búsqueda legal: tras una primera fase de recuperación por similitud, el cross-encoder reordena los candidatos según la probabilidad de entailment, mejorando la precisión en las primeras posiciones.
- Filtrado de citas normativas: en la generación de dictámenes o resúmenes, comprobar que cada artículo citado respalda efectivamente la afirmación redactada.
- Asistencia a la consulta ciudadana: clasificar pares pregunta-respuesta de un chatbot legal para descartar respuestas no sustentadas por la norma vigente.
- Construcción de datasets de evaluación legal: etiquetar automáticamente pares consulta-evidencia como apoyo o no apoyo para entrenar o validar otros componentes del sistema.
- Detección de contradicciones en documentación jurídica: comparar afirmaciones de borradores o contratos con el texto normativo de referencia y marcar discrepancias.
- Moderación de contenido legal: descartar respuestas de un asistente que no estén respaldadas por ninguna evidencia recuperada, como paso previo a la publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278,8 M de parámetros); en fp16, alrededor de 0,56 GB.
- VRAM total recomendada: 2-4 GB en fp16 para cubrir pesos, activaciones y lote pequeño, dado que es un encoder de 0,6 GB en repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A10G o L4.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650 4 GB, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (según la model card), exportación a ONNX Runtime para inferencia por CPU, y servidores de inferencia compatibles con modelos de clasificación de Hugging Face.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zalo2021-mdeberta-v3-base-xnli | 278,8 M | no disponible (ejemplo a 512) | vi | MIT | Hugging Face, 0 descargas |
| mDeBERTa-v3-base (base genérica) | ~278 M | 512 tokens típico | multilingüe | MIT | Hugging Face, ampliamente usado |
| XLM-RoBERTa-base (NLI multilingüe) | ~278 M | 512 tokens típico | multilingüe | MIT | Hugging Face, ampliamente usado |

La comparación concreta de rendimiento frente a alternativas no está disponible, ya que el autor no publica métricas. Las alternativas genéricas multilingües pueden usarse como verificadores NLI, pero no están ajustadas al dominio jurídico vietnamita ni al corpus ZALO2021.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni métricas de validación publicadas; el rendimiento real es desconocido.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad.
- El modelo solo declara soporte para vietnamita; su comportamiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación no aplicable en sentido generativo (no produce texto), pero sí de falsos positivos y falsos negativos en la clasificación de evidencia.
- Sesgos conocidos: no documentados; al entrenarse sobre un corpus jurídico concreto (ZALO2021), puede heredar sesgos de ese corpus y generalizar mal fuera de él.
- La model card no especifica la longitud máxima de contexto real; el ejemplo trunca a 512 tokens, por lo que evidencias más largas pueden perder información.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del corpus ZALO2021 subyacente, no detalladas en la model card.
- Para producción, es imprescindible evaluar el modelo sobre un conjunto propio del dominio antes de integrarlo en un pipeline RAG.

## Enlaces

- Hugging Face: https://huggingface.co/Booooooooooooo/zalo2021-mdeberta-v3-base-xnli
