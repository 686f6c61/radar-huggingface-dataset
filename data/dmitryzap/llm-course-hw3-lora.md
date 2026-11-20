# DmitryZap/llm-course-hw3-lora

## Resumen

`DmitryZap/llm-course-hw3-lora` es un ajuste fino mediante LoRA del modelo `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder-only de 134,5 millones de parámetros. El modelo resultante está especializado en una única tarea: clasificación de sentimiento de tuits en inglés en tres etiquetas (`negative`, `neutral`, `positive`). No es un modelo de propósito general, sino un artefacto académico de un curso de LLM que demuestra el flujo completo de fine-tuning con PEFT sobre un dataset público.

El autor entrenó el adaptador LoRA (rango 8, alpha 16) durante dos épocas sobre 12.000 tuits de `cardiffnlp/tweet_eval` y una tercera época con 9.000 ejemplos adicionales balanceados (3.000 por clase). Antes de publicar, fusionó el adaptador con los pesos base, de modo que el repositorio contiene un checkpoint completo y no un adaptador separado, pese a la etiqueta `lora` en los metadatos.

Su relevancia es limitada en producción: se trata de un ejercicio educativo con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks estándar publicados y con un único idioma soportado (inglés). Resulta útil como referencia de cómo estructurar un fine-tuning LoRA sobre un modelo pequeño y de cómo evaluar con F1 ponderada, pero no como componente serio de un sistema de análisis de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA fusionado |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de SmolLM2-135M-Instruct) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors de precision original |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.3 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | cardiffnlp/tweet_eval (sentiment) |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Configuracion LoRA | rango 8, alpha 16 |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros desarrollado por HuggingFaceTB, orientado a generación de texto ligera y despliegue en entornos con recursos limitados. Sobre él se aplicó un adaptador LoRA de rango 8 y alpha 16, entrenado en dos fases: primero dos épocas sobre 12.000 tuits del split de entrenamiento de `cardiffnlp/tweet_eval`, y después una tercera época con 9.000 ejemplos adicionales balanceados a 3.000 por clase. Tras el entrenamiento, el adaptador se fusionó con los pesos base antes de guardar, por lo que el checkpoint publicado ya incorpora la actualización y no requiere cargar el adaptador por separado.

No se documenta el número total de tokens vistos, la composición exacta del dataset más allá de la fuente, ni si hubo etapas de RLHF o DPO (el proceso descrito es supervisado puro sobre pares tuit-etiqueta). La innovación técnica es mínima: se trata de un fine-tuning estándar con PEFT, sin decodificación especulativa, atención lineal ni modificaciones arquitectónicas. El prompt de sistema utilizado fuerza al modelo a responder con una única etiqueta en minúsculas, sin puntuación ni explicación, lo que convierte la generación libre en una tarea de clasificación restringida.

## Capacidades

- Clasificación de sentimiento en tres clases (`negative`, `neutral`, `positive`) sobre tuits en inglés.
- Generación de texto autoregresiva heredada del modelo base, aunque el ajuste la restringe en la práctica a la tarea de clasificación.
- Interpretación de jerga y sarcasmo dentro del prompt de sistema, según declara el autor, aunque sin evaluación específica publicada.
- Seguimiento de instrucciones vía `apply_chat_template` con rol `system` y `user`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento de tuits en inglés en pipelines de monitorización de marca: el modelo devuelve una de tres etiquetas con un formato estricto, lo que facilita el parseo directo y su integración en un ETL.
- Etiquetado de datasets de redes sociales a pequeña escala: al ser un modelo de 135M, puede ejecutarse en CPU y procesar lotes sin GPU dedicada, útil para prototipos académicos.
- Filtrado previo en sistemas de moderación: clasificar respuestas de usuarios como negativas para priorizar revisión humana, aunque con la cautela de que el F1 global es moderado (0,5115).
- Docencia y reproducción de experimentos: el repositorio incluye el notebook `HSU_hw3_peft.ipynb` y `metrics.json`, lo que lo convierte en un ejemplo reproducible de fine-tuning LoRA con evaluación por F1.
- Baseline para comparar estrategias de fine-tuning: sirve como referencia mínima frente a adaptadores de mayor rango o modelos base más grandes en la misma tarea.
- Clasificación en entornos con restricciones de memoria: al ocupar 0,3 GB en safetensors, cabe en dispositivos de borde o en contenedores con poca RAM, siempre que se acepte la pérdida de precisión respecto a modelos mayores.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación del autor sobre el split de test de `cardiffnlp/tweet_eval` (12.284 tuits), con la métrica F1 definida en el enunciado del curso (que incluye la clase `invalid` para respuestas sin etiqueta válida).

| Metrica | Antes (base) | Despues (fine-tuned) |
|---|---:|---:|
| F1 formula del enunciado (con `invalid`) | 0,1628 | 0,5115 |
| F1 media solo sobre 3 clases | no disponible | 0,6820 |

| Etiqueta | F1 |
|---|---:|
| `negative` | 0,7263 |
| `neutral` | 0,6290 |
| `positive` | 0,6907 |
| `invalid` | 0,0000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un modelo de 134,5M de parámetros; en la práctica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3050, etc.) es suficiente. No se justifica el uso de A100 o H100.
- Cabe en GPU consumer: sí, en prácticamente todas las tarjetas modernas y en muchas integradas.
- Opciones de despliegue: `transformers` (documentado por el autor), `text-generation-inference` (etiqueta presente en los metadatos), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta dicha conversión.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera decodificación en milisegundos por token en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DmitryZap/llm-course-hw3-lora | 134,5M | no disponible | Clasificacion de sentimiento (3 clases, EN) | apache-2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | Generacion de texto general | apache-2.0 | Hugging Face, ampliamente usado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125M | 512 tokens (RoBERTa) | Clasificacion de sentimiento (3 clases, EN) | no verificada en esta ficha | Hugging Face, muy usado como baseline |
| Modelos de sentimiento basados en BERT/RoBERTa fine-tuned | 110M-340M | 512 tokens tipicamente | Clasificacion de sentimiento | variable | Hugging Face |

La comparación directa con alternativas de la misma categoría (clasificadores de sentimiento sobre tuits) es desfavorable en madurez: los modelos basados en RoBERTa fine-tuned sobre TweetEval suelen superar F1 de 0,70 en la tarea, mientras que este checkpoint reporta 0,5115 en la fórmula del curso y 0,6820 en la media de tres clases. No se dispone de datos de contexto ni de benchmarks comparables publicados por el autor más allá de los indicados.

## Limitaciones y advertencias

- El modelo solo soporta inglés; cualquier entrada en otro idioma queda fuera de su dominio declarado.
- El F1 global reportado (0,5115) es moderado y está calculado con una fórmula específica del curso que penaliza respuestas inválidas; la media de tres clases (0,6820) no es directamente comparable con métricas estándar de la literatura.
- La clase `neutral` obtiene el F1 más bajo (0,6290), lo que sugiere confusión con las otras dos clases en tuits ambiguos.
- Riesgo de alucinación: al ser un modelo generativo, puede producir texto libre fuera de las etiquetas esperadas si el prompt no se aplica con el formato exacto documentado.
- Sesgos: no se documenta ningún análisis de sesgos; el dataset TweetEval tiene sesgos conocidos de dominio (redes sociales, inglés, período temporal concreto) que se transfieren al modelo.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base SmolLM2-135M-Instruct también es apache-2.0, por lo que no hay conflicto conocido; aun así, conviene verificar la licencia del dataset `cardiffnlp/tweet_eval` para usos derivados.
- Es un artefacto académico con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación independiente.
- No se documenta la longitud de contexto efectiva del checkpoint fusionado; se hereda del base pero no se confirma en la ficha.
- El adaptador LoRA ya está fusionado, por lo que no es posible separar el ajuste del modelo base sin volver a entrenar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DmitryZap/llm-course-hw3-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Notebook de entrenamiento y evaluacion: https://huggingface.co/DmitryZap/llm-course-hw3-lora/blob/main/HSU_hw3_peft.ipynb
- Metricas: https://huggingface.co/DmitryZap/llm-course-hw3-lora/blob/main/metrics.json
