# KreatixLabs/moderation-modernbert-en

## Resumen

moderation-modernbert-en es un clasificador de moderación de contenido para texto generado por usuarios en inglés, desarrollado por KreatixLabs. Se trata de un fine-tuning de ModernBERT-base (149,6 millones de parámetros) configurado como tarea multi-etiqueta con 13 categorías independientes: toxic, severe_toxic, obscene, insult, threat, hate, sexual, sexual_minors, harassment, self_harm, violence, illegal y spam. Cada etiqueta dispone de un umbral de decisión propio, calibrado para maximizar F1 sobre validación, y un mensaje se marca como infractor si supera cualquiera de ellos.

El modelo resuelve un problema acotado pero crítico en producción: la clasificación rápida y barata de mensajes de usuario para tareas de seguridad (moderación de foros, comentarios, chats y filtros anti-spam). Al estar basado en ModernBERT, incorpora atención con rotdory flash attention, lo que le permite procesar secuencias de hasta 8.192 tokens, aunque el autor limita la inferencia recomendada a 256 tokens. El entrenamiento fue deliberadamente corto (10,5 minutos sobre 2x T4 en Kaggle), lo que sugiere un ajuste ligero sobre el modelo base más que un entrenamiento profundo.

Su relevancia actual radica en la combinación de tamaño contenido, licencia Apache 2.0 y disponibilidad de pesos en safetensors y ONNX (fp32 e int8), lo que facilita el despliegue en CPU. No obstante, el modelo es exclusivamente inglés y varias de sus etiquetas críticas (sexual_minors, self_harm, harassment) cuentan con muy pocos positivos de entrenamiento, por lo que debe tratarse como señal de revisión y no como automatismo de bloqueo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), clasificación multi-etiqueta con sigmoide |
| Parametros totales | 149.614.861 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en el modelo base; el autor recomienda max_length=256 para inferencia |
| Tipos de cuantizacion | ONNX fp32 (601 MB) y ONNX int8 (269 MB); pesos PyTorch en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder transformer de 149 millones de parámetros que moderniza la familia BERT con atención de ventana local combinada con capas globales, RoPE y flash attention, lo que reduce el coste computacional en secuencias largas. Sobre esa base se añade una cabeza de clasificación con 13 salidas y activación sigmoide, de modo que las etiquetas no son mutuamente excluyentes: un mismo mensaje puede marcarse simultáneamente como toxic, insult y hate.

El entrenamiento utilizó 234.572 filas en inglés, todas con etiquetado humano extraído del Hub, y una pérdida BCE enmascarada: cada fuente solo supervisa las etiquetas que anota. Las fuentes son Jigsaw Toxic Comment (toxic, severe_toxic, obscene, insult, threat, hate), Civil Comments (toxic, obscene, insult, threat, hate, sexual con puntuación media de anotadores >= 0,5), Aegis-AI-Content-Safety-Dataset-2.0 (obscene, threat, hate, sexual, sexual_minors, harassment, self_harm, violence, illegal), lmsys/toxic-chat 0124 (toxic), Enron y SMS Spam (spam). Los datasets de comentarios y prompts se tratan como no-spam. La configuración fue de 0,5 épocas, batch efectivo 64, learning rate 2e-05 y max length 256, con una segunda pasada corta a lr 2e-05 y positivos de etiquetas débiles multiplicados por 3. No se menciona RLHF ni DPO; es un ajuste supervisado puro.

## Capacidades

- Clasificación multi-etiqueta de texto en inglés con 13 categorías independientes y umbrales por etiqueta en `thresholds.json`.
- Detección de toxicidad general: toxic, severe_toxic, obscene, insult, threat, hate.
- Detección de contenido sexual y sexual con menores (sexual, sexual_minors).
- Detección de acoso (harassment), autolesión (self_harm), violencia (violence) e illegal.
- Detección de spam entrenada con correo de Enron y SMS.
- Salida probabilística por etiqueta, útil para priorizar revisión humana o aplicar umbrales de auto-acción.
- Inferencia en CPU mediante ONNX (fp32 e int8) y en GPU/CPU con transformers.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de comentarios en foros y medios: el modelo clasifica cada comentario en las 13 categorías y permite auto-ocultar solo las puntuaciones altas, derivando casos límite a revisión humana. Adecuado por su latencia de 17,6 ms en CPU con int8 y su coste bajo.
- Filtro de spam en formularios de contacto y reseñas: la etiqueta spam obtuvo un F1 de 0,980 en test in-distribution, por lo que puede integrarse como primera barrera antes de la moderación manual.
- Pre-filtrado en chats de comunidad: con contexto de 256 tokens, procesa mensajes individuales en tiempo real y marca toxic, insult o hate para colas de revisión.
- Señalización de riesgo en plataformas educativas o infantiles: las etiquetas sexual_minors y self_harm pueden usarse como alerta de revisión prioritaria, nunca como bloqueo automático, dado el bajo número de positivos de entrenamiento.
- Enriquecimiento de pipelines de análisis: las probabilidades por etiqueta se pueden registrar y agregar para monitorizar tendencias de toxicidad por canal, comunidad o franja horaria y reajustar umbrales.
- Despliegue en entornos sin GPU: la versión ONNX int8 (269 MB) corre en CPU con 17,6 ms por mensaje, lo que permite moderar volúmenes moderados en servidores modestos o en el borde.
- Evaluación comparativa de sistemas de moderación: sirve como baseline ligero y reproducible frente a APIs comerciales, con licencia Apache 2.0 y pesos abiertos.

## Benchmarks y rendimiento

Resultados del autor en test held-out in-distribution:

| Etiqueta | n | Positivos | AUROC | AUPRC | F1 | Precision | Recall | Umbral |
|---|---|---|---|---|---|---|---|---|
| toxic | 23894 | 2355 | 0,959 | 0,749 | 0,678 | 0,607 | 0,767 | 0,83 |
| severe_toxic | 3811 | 73 | 0,985 | 0,570 | 0,598 | 0,538 | 0,671 | 0,31 |
| obscene | 19926 | 583 | 0,993 | 0,869 | 0,777 | 0,722 | 0,840 | 0,45 |
| insult | 18811 | 1281 | 0,971 | 0,739 | 0,663 | 0,570 | 0,793 | 0,64 |
| threat | 19926 | 59 | 0,986 | 0,355 | 0,373 | 0,308 | 0,475 | 0,79 |
| hate | 19926 | 292 | 0,978 | 0,552 | 0,543 | 0,580 | 0,510 | 0,91 |
| sexual | 16115 | 99 | 0,989 | 0,618 | 0,548 | 0,741 | 0,434 | 0,95 |
| sexual_minors | 1115 | 7 | 0,984 | 0,747 | 0,769 | 0,833 | 0,714 | 0,44 |
| harassment | 1115 | 73 | 0,923 | 0,569 | 0,551 | 0,518 | 0,589 | 0,43 |
| self_harm | 1115 | 25 | 0,994 | 0,950 | 0,902 | 0,885 | 0,920 | 0,80 |
| violence | 1115 | 99 | 0,957 | 0,729 | 0,706 | 0,750 | 0,667 | 0,49 |
| illegal | 1115 | 336 | 0,974 | 0,945 | 0,869 | 0,858 | 0,881 | 0,33 |
| spam | 27809 | 1113 | 0,999 | 0,995 | 0,980 | 0,984 | 0,976 | 0,55 |

Resultados out-of-distribution sobre el conjunto de evaluación de la API de moderación de OpenAI (nunca usado en entrenamiento):

| Etiqueta | n | Positivos | AUROC | AUPRC | F1 | Precision | Recall | Umbral |
|---|---|---|---|---|---|---|---|---|
| hate | 771 | 162 | 0,907 | 0,706 | 0,563 | 0,789 | 0,438 | 0,91 |
| sexual | 984 | 237 | 0,965 | 0,892 | 0,693 | 0,905 | 0,561 | 0,95 |
| sexual_minors | 994 | 85 | 0,894 | 0,364 | 0,000 | 0,000 | 0,000 | 0,44 |
| harassment | 1444 | 76 | 0,918 | 0,430 | 0,477 | 0,468 | 0,487 | 0,43 |
| self_harm | 1447 | 51 | 0,956 | 0,557 | 0,591 | 0,703 | 0,510 | 0,80 |
| violence | 1450 | 94 | 0,930 | 0,468 | 0,516 | 0,443 | 0,617 | 0,49 |

Rendimiento ONNX en CPU:

| Fichero | Tamano | Latencia CPU (1 mensaje) | Acuerdo de decisión vs PyTorch | Diferencia maxima de probabilidad |
|---|---|---|---|---|
| fp32 | 601 MB | 28,1 ms | 1,0000 | 0,0000 |
| int8 | 269 MB | 17,6 ms | 0,6695 | 0,9863 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo. La comparación con modelos similares no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB de pesos más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: alrededor de 0,3 GB; en int8 ONNX, 0,27 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 4090, A100 y H100 no suponen ningún problema por tamaño. El modelo está pensado para CPU.
- Cabe holgadamente en GPU consumer y también en CPU: la versión ONNX int8 procesa un mensaje en 17,6 ms en CPU según el autor.
- Opciones de despliegue: ONNX Runtime (recomendado por el autor para servidores), transformers con PyTorch, text-embeddings-inference (etiqueta del repo) y endpoints compatibles. No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a un encoder de clasificación.
- Throughput: no se publica una cifra agregada; con 17,6 ms por mensaje en CPU int8 se puede estimar del orden de decenas de mensajes por segundo por núcleo, aunque el dato exacto no está disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparativas con otros clasificadores de moderación (por ejemplo, modelos de la familia Detoxify, toxic-bert o clasificadores basados en DeBERTa). Los datos disponibles permiten comparar únicamente contra el propio modelo base y sus variantes de despliegue:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moderation-modernbert-en | 149,6 M | 8.192 (uso recomendado 256) | Clasificación multi-etiqueta, 13 categorías | Apache 2.0 | Hugging Face, ONNX fp32/int8 |
| answerdotai/ModernBERT-base | 149 M | 8.192 | Modelo base encoder, sin cabeza de moderación | Apache 2.0 | Hugging Face |
| Alternativas de moderación | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: el autor advierte que otros idiomas serán poco fiables.
- Los datos de spam provienen de correo electrónico y SMS; el spam específico de plataformas (criptomonedas, enlaces, SEO) puede requerir más datos.
- sexual_minors, self_harm y harassment tienen pocos positivos de entrenamiento; deben usarse como señales de revisión, no para acciones automáticas. En el conjunto OOD de OpenAI, sexual_minors obtuvo F1 de 0,000 pese a un AUROC de 0,894, lo que evidencia una calibración frágil fuera de distribución.
- Los datasets de toxicidad arrastran sesgos conocidos sobre términos de identidad: las menciones a grupos identitarios tienden a puntuar más alto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos; el modelo no explica sus decisiones.
- La cuantización int8 reduce el tamaño a 269 MB pero solo mantiene un acuerdo de decisión del 66,95 % respecto a PyTorch, con diferencias de probabilidad de hasta 0,9863; no es equivalente a fp32 para umbrales finos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos a los de entrenamiento.
- Recomendación del autor: auto-ocultar solo con puntuaciones altas, enviar casos límite a revisión humana y registrar decisiones para reajustar umbrales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KreatixLabs/moderation-modernbert-en
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset Jigsaw Toxic Comment: https://huggingface.co/datasets/tasksource/jigsaw_toxicity
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset Aegis-AI-Content-Safety-Dataset-2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset SetFit/enron_spam: https://huggingface.co/datasets/SetFit/enron_spam
- Dataset ucirvine/sms_spam: https://huggingface.co/datasets/ucirvine/sms_spam
- Dataset mmathys/openai-moderation-api-evaluation: https://huggingface.co/datasets/mmathys/openai-moderation-api-evaluation
