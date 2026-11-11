# Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA

## Resumen

TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA es un adaptador LoRA (PEFT) sobre el modelo base Mistral-Nemo-Instruct-2407 (12B parámetros) desarrollado por Kamyar Zeinalipour y colaboradores. Su función concreta es la clasificación de sentimiento en diálogos teatrales en farsi (persa), asignando cada diálogo a una de tres clases: negativo, neutro o positivo. El adaptador se publica junto al benchmark TalkFa, presentado en el paper *TalkFa: A Unified Benchmark for Farsi Dialogue Generation and Understanding* (arXiv:2609.01810).

El modelo resuelve un problema acotado pero poco cubierto: el análisis de sentimiento sobre texto dialógico y teatral en farsi, un registro lingüístico con convenciones distintas al texto periodístico o de redes sociales sobre el que se entrenan la mayoría de los clasificadores. El adaptador se entrenó sobre el split de entrenamiento de PlayDial-Fa (1.867 diálogos) del dataset TalkFa, verificado por anotadores humanos.

La relevancia del modelo es doble. Por un lado, aporta un punto de referencia reproducible para una tarea y un idioma con escasa cobertura instrumental. Por otro, forma parte de una familia de adaptadores TalkFa que cubren varios tamaños de modelo base (1B, 3B, 7B, 8B, 12B y 24B) y dos tareas (generación Wiki-FaDial y sentimiento PlayDial-Fa), lo que permite comparar el efecto del tamaño del modelo base sobre una misma tarea en farsi. Las ganancias reportadas sobre el modelo base son modestas: F1 macro pasa de 0,53 a 0,57 en el conjunto de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral-Nemo-Instruct-2407) con adaptador LoRA (PEFT) |
| Parámetros totales | No disponible (el modelo base Mistral-Nemo-Instruct-2407 tiene 12B; el adaptador LoRA añade un número no especificado de parámetros entrenables) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización del modelo base fusionado no se documenta) |
| Idiomas soportados | Farsi (fa); el modelo base es multilingüe pero el adaptador está entrenado solo para farsi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12B parámetros. La técnica de ajuste es LoRA mediante la librería PEFT: se congelan los pesos del modelo base y se entrenan matrices de bajo rango insertadas en las capas. El adaptador se puede fusionar con el modelo base (`merge_and_unload()`) para obtener un modelo único, tal como muestra el ejemplo de uso de la model card.

El entrenamiento se realizó sobre el split de entrenamiento de PlayDial-Fa del dataset TalkFa, compuesto por 1.867 diálogos teatrales en farsi con etiquetas de sentimiento verificadas por humanos. La configuración exacta de entrenamiento (rango LoRA, alpha, tasa de aprendizaje, épocas) está publicada en el repositorio de GitHub del proyecto, en el fichero `configs/train_sentiment.json`, pero no se reproduce en la model card. La tarea se plantea como generación: el modelo recibe el diálogo como conversación con plantilla de chat y debe responder nombrando exactamente la etiqueta correcta; una respuesta se considera correcta solo si coincide de forma exacta con la etiqueta de referencia. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Clasificación de sentimiento en farsi sobre diálogos teatrales en tres clases: negativo, neutro y positivo.
- Procesamiento de conversaciones multi-turno mediante la plantilla de chat del modelo base (lista de mensajes con roles).
- Generación de texto libre heredada del modelo base Mistral-Nemo-Instruct-2407, aunque el adaptador está especializado en la tarea de clasificación.
- Comprensión de texto dialógico en registro teatral y coloquial en farsi.
- Salida en formato de etiqueta textual (el modelo responde nombrando la etiqueta), lo que facilita el parseo en pipelines de evaluación.
- No se documenta soporte específico de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para este adaptador.

## Casos de uso

- Análisis de sentimiento en obras de teatro y guiones en farsi: el adaptador está entrenado específicamente sobre diálogos teatrales de PlayDial-Fa, por lo que es adecuado para analizar la evolución emocional de personajes a lo largo de una escena o una obra completa.
- Investigación en procesamiento de lenguaje natural en lenguas de bajos recursos: sirve como línea base reproducible para experimentos de clasificación de sentimiento en farsi, con métricas publicadas y código de evaluación disponible en GitHub.
- Etiquetado asistido de corpus dialógicos: puede preetiquetar grandes volúmenes de diálogos en farsi para su posterior revisión humana, reduciendo el coste de anotación en proyectos de creación de datasets.
- Moderación de contenido en plataformas de ficción interactiva o narrativa en farsi: permite detectar tono negativo en diálogos generados o enviados por usuarios.
- Análisis de recepción de guiones y doblajes: evaluación del tono emocional de diálogos antes de su producción o localización.
- Comparación de arquitecturas sobre una misma tarea en farsi: al existir adaptadores equivalentes para Llama-3.2-1B/3B, Mistral-7B, Llama-3.1-8B y Mistral-Small-24B, el modelo permite estudiar el efecto del tamaño del modelo base sobre el rendimiento en clasificación de sentimiento en farsi.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de PlayDial-Fa (104 diálogos). Una respuesta se considera correcta solo si nombra exactamente la etiqueta de referencia. Métricas macro:

| Métrica (macro) | Modelo base | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| Precisión | 0,58 | 0,63 | +0,06 |
| Recall | 0,54 | 0,57 | +0,03 |
| F1 | 0,53 | 0,57 | +0,04 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador. La model card solo reporta las métricas de la tarea específica de clasificación de sentimiento.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 2,9 GB en el repositorio, aunque el peso real del adaptador es una fracción de esa cifra; el modelo base Mistral-Nemo-Instruct-2407 (12B) debe descargarse por separado y está sujeto a acceso restringido (gated) con aceptación de términos.
- VRAM estimada para inferencia con el modelo base en bfloat16: en torno a 24 GB, lo que requiere GPUs como A100 40GB, H100, L40S o RTX 4090 (24 GB, al límite).
- Con cuantización de 8 bits, el modelo base cabría en GPUs de 16 GB (RTX 4080, A4000); con cuantización de 4 bits, en GPUs de 8-12 GB (RTX 3060 12GB, RTX 4070). Estas estimaciones son orientativas y no están documentadas en la model card.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft` y `merge_and_unload()`. El modelo fusionado podría servirse con vLLM o TGI, aunque no se documenta compatibilidad explícita. Para cuantización en consumer, sería necesario convertir el modelo fusionado a GGUF para llama.cpp u Ollama, paso no documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card publica una familia de adaptadores TalkFa comparables sobre la misma tarea y dataset. No se dispone de métricas de sentimiento para todos ellos en la información proporcionada, por lo que la comparación se limita a parámetros del modelo base y disponibilidad.

| Modelo base | Parámetros | Adaptador de sentimiento PlayDial-Fa | Licencia |
|---|---:|---|---|
| Llama-3.2-1B-Instruct | 1B | TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA | No disponible en la información |
| Llama-3.2-3B-Instruct | 3B | TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA | No disponible en la información |
| Mistral-7B-Instruct-v0.3 | 7B | TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA | No disponible en la información |
| Llama-3.1-8B-Instruct | 8B | TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA | No disponible en la información |
| Mistral-Nemo-Instruct-2407 | 12B | Este modelo | Apache 2.0 |
| Mistral-Small-24B-Instruct-2501 | 24B | TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA | No disponible en la información |

No se han publicado en la información disponible comparaciones con clasificadores de sentimiento en farsi ajenos a la familia TalkFa (por ejemplo, modelos BERT multilingües ajustados). No se dispone de datos de rendimiento de los adaptadores alternativos de la tabla, por lo que no es posible ordenarlos por calidad.

## Limitaciones y advertencias

- Las ganancias sobre el modelo base son modestas: F1 macro de 0,57 frente a 0,53, con una precisión de 0,63. El rendimiento absoluto es bajo para uso en producción sin revisión humana.
- El conjunto de test es pequeño (104 diálogos), por lo que las métricas tienen alta varianza y deben interpretarse con cautela.
- El adaptador está entrenado exclusivamente sobre diálogos teatrales en farsi; su generalización a otros registros (redes sociales, prensa, conversación espontánea) o a otros dialectos del persa no está documentada.
- La tarea se evalúa como generación con coincidencia exacta de etiqueta; respuestas con variaciones de formato pueden contarse como incorrectas, lo que puede infraestimar el rendimiento real en un pipeline con parseo robusto.
- Riesgo de alucinación inherente al modelo base generativo: el adaptador puede producir texto libre en lugar de una etiqueta si la generación no se restringe.
- El modelo base Mistral-Nemo-Instruct-2407 está sujeto a acceso restringido en Hugging Face; es necesario aceptar sus términos e iniciar sesión con `huggingface-cli login` antes de usarlo.
- La licencia del adaptador es Apache 2.0, pero el uso comercial está condicionado por la licencia del modelo base, que debe verificarse por separado.
- No se documentan sesgos específicos del adaptador ni evaluaciones de robustez frente a texto adversarial o irónico.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Colección TalkFa: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Configuración de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_sentiment.json
