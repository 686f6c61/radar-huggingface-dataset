# ManuelR12/beto-sarcasmo-bs16

## Resumen

beto-sarcasmo-bs16 es un modelo de clasificación de texto en español especializado en detectar sarcasmo. Lo desarrolla ManuelR12 y parte de dccuchile/bert-base-spanish-wwm-cased, el conocido BETO (BERT entrenado sobre un corpus masivo de español con enmascarado de palabras completas y distinción de mayúsculas). El modelo resuelve una tarea binaria concreta: decidir si un texto en español es sarcástico (`SARCASMO`) o no (`NO_SARCASMO`).

Se trata de un ajuste fino clásico de BERT base, con 109.852.418 parámetros y una arquitectura transformer encoder de 12 capas. No incorpora decodificación generativa ni razonamiento multi-paso: es un clasificador discriminativo que devuelve una etiqueta y una puntuación de confianza. Su relevancia radica en la escasez de modelos públicos y ligeros para análisis de sarcasmo en español, una tarea que resulta crítica para moderación de comentarios, análisis de opinión y sistemas de atención al cliente que necesitan interpretar correctamente el tono del usuario.

El modelo se publicó en el Hub en noviembre de 2026 bajo licencia Apache 2.0, con un tamaño de repositorio de 0,4 GB y pesos en formato safetensors. El entrenamiento se realizó sobre un dataset local de 12.145 frases de entrenamiento y 3.037 de validación, equilibrado al 50/50 y compuesto mayoritariamente por titulares de prensa. Alcanza un F1 macro de 0,9154 en validación, aunque el autor advierte que el modelo puede apoyarse en el tema o el medio de la noticia más que en la ironía real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, BETO) |
| Parametros totales | 109.852.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantización dinámica de PyTorch) |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de dccuchile/bert-base-spanish-wwm-cased, un BERT base con 12 capas de encoder, atención multi-cabeza estándar y enmascarado de palabras completas (whole word masking) sobre texto en español con distinción de mayúsculas y minúsculas. La cabeza de clasificación es una capa lineal sobre el token `[CLS]` que produce dos logits, correspondientes a las etiquetas `SARCASMO` y `NO_SARCASMO`.

El entrenamiento se realizó con batch size de 16, learning rate de 2e-05 y un máximo de 10 épocas con early stopping (paciencia 2, monitorizando el F1 de validación). Se ejecutaron las 10 épocas y la mejor fue la décima, con un F1 macro de 0,9154. La longitud máxima de secuencia fue de 128 tokens con padding. El dataset es local y no está publicado en el Hub: 12.145 frases de entrenamiento y 3.037 de validación, equilibradas al 50/50, compuestas mayoritariamente por titulares de prensa. No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos. La pérdida de validación asciende a partir de la época 2 (de 0,2972 a 0,7932 en la época 10) mientras el F1 sigue mejorando ligeramente, lo que indica sobreajuste en términos de calibración de probabilidades pero no en capacidad discriminativa; el autor justifica la selección del checkpoint por F1 en lugar de por pérdida.

## Capacidades

- Clasificación binaria de sarcasmo en español: devuelve la etiqueta `SARCASMO` o `NO_SARCASMO` con una puntuación de confianza.
- Procesamiento de textos cortos y medianos: entrenado con secuencias de hasta 128 tokens, adecuado para frases, titulares y comentarios breves.
- Integración directa con la pipeline `text-classification` de Hugging Face Transformers.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al español; no se ha entrenado ni evaluado en otros idiomas.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede etiquetar automáticamente comentarios sarcásticos para priorizar revisión humana o para ajustar la respuesta automática, aprovechando su bajo coste computacional y su capacidad de procesar grandes volúmenes en batch.
- Análisis de opinión y sentimiento en prensa digital: al estar entrenado con titulares, es adecuado para detectar ironía en titulares y entradillas, ayudando a separar opinión crítica de información neutra en pipelines de monitorización de medios.
- Atención al cliente automatizada: integrado como preprocesador en un sistema de tickets, permite detectar cuándo un cliente está siendo sarcástico y derivar el caso a un agente humano o ajustar el tono de la respuesta generada por otro modelo.
- Investigación en lingüística computacional: sirve como baseline reproducible para experimentos de detección de sarcasmo en español, con métricas de validación documentadas y un checkpoint público bajo licencia permisiva.
- Filtrado de reseñas en comercio electrónico: puede marcar reseñas irónicas (por ejemplo, "qué maravilla, se rompió a los dos días") para que los sistemas de análisis de sentimiento no las clasifiquen erróneamente como positivas.
- Enriquecimiento de datasets para entrenamiento: el modelo puede usarse para pre-etiquetar grandes corpus de texto en español y generar datos adicionales de entrenamiento para modelos más grandes o para otras tareas de comprensión del lenguaje.
- Detección de toxicidad encubierta: el sarcasmo a menudo acompaña a comentarios pasivo-agresivos; el modelo puede actuar como señal auxiliar en sistemas de moderación que combinan varios clasificadores.

## Benchmarks y rendimiento

Resultados en validación del conjunto local del autor (mejor época, época 10):

| Metrica | Valor |
|---|---|
| F1 macro | 0.9154 |
| F1 ponderado | 0.9154 |
| Accuracy | 0.9154 |

Evolución por época (extracto):

| Epoca | Perdida entrenamiento | Perdida validacion | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 0.4314 | 0.3538 | 0.8634 | 0.8627 |
| 2 | 0.2239 | 0.2972 | 0.9012 | 0.9012 |
| 5 | 0.0220 | 0.6162 | 0.9124 | 0.9123 |
| 10 | 0.0021 | 0.7932 | 0.9154 | 0.9154 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos de detección de sarcasmo en español.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (109,8 M de parámetros), menos de 0,3 GB con cuantización dinámica a int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100, aunque el modelo es tan pequeño que la CPU es suficiente para muchos escenarios.
- Cabe en cualquier GPU consumer actual e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: Hugging Face Transformers (pipeline `text-classification`), TorchScript, ONNX Runtime, vLLM (soporte de modelos encoder para clasificación), TGI (Text Generation Inference no aplica porque no es generativo), llama.cpp no soporta BERT de clasificación de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en batch sobre GPU y latencia de milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ManuelR12/beto-sarcasmo-bs16 | 109,8 M | 128 tokens | Clasificación de sarcasmo (es) | Apache 2.0 | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased | 109,8 M | 512 tokens | Modelo base (es) | Apache 2.0 | Hugging Face |
| Modelos de análisis de sentimiento en español (p. ej. finetunes de BETO) | ~110 M | 512 tokens | Sentimiento (positivo/negativo/neutro) | Varía | Hugging Face |

No se dispone de información sobre otros modelos públicos especializados en detección de sarcasmo en español con los que comparar métricas directamente. La comparación con BETO base es estructural (mismo backbone), no de rendimiento en la tarea.

## Limitaciones y advertencias

- El modelo se entrenó casi exclusivamente con titulares de prensa, por lo que puede aprender correlaciones espurias con el tema o el medio de la noticia en lugar de con la ironía real.
- Puede fallar con sarcasmo conversacional, jerga regional, modismos o textos largos que superen los 128 tokens.
- La pérdida de validación aumenta desde la época 2, lo que sugiere sobreajuste y probabilidades mal calibradas; las puntuaciones de confianza no deben interpretarse como probabilidades fiables sin recalibración.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- El dataset de entrenamiento no es público, lo que dificulta la reproducibilidad y la evaluación independiente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de los titulares de prensa.
- El modelo solo soporta español; no se ha evaluado en otras variedades dialectales ni en textos multilingües.
- No debe usarse como único criterio en sistemas de moderación o decisiones automatizadas con impacto en usuarios; se recomienda combinar con revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManuelR12/beto-sarcasmo-bs16
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
