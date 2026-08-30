# Cruciator/bert2bert-dialogsum

## Resumen

Cruciator/bert2bert-dialogsum es un modelo encoder-decoder de tipo BERT2BERT, desarrollado por Cruciator, especializado en la tarea de resumen de diálogos multiusuario en inglés. El modelo se construye a partir de dos instancias de `bert-base-uncased` (una como encoder y otra como decoder) a las que se añade una capa de cross-attention inicializada aleatoriamente, siguiendo la receta de warm-start descrita en el artículo "Leveraging Pre-trained Checkpoints" (arXiv:1907.12461). El resultado se afina sobre el dataset DialogSum, compuesto por más de 12.000 diálogos cortos con resúmenes escritos por humanos.

El modelo genera un resumen conciso (de estilo frase única) a partir de una conversación de entrada. Con 247 millones de parámetros y una ventana de contexto de 256 tokens de entrada y 64 de salida, está pensado para diálogos cortos e informales. Su relevancia radica en que demuestra cómo reutilizar checkpoints preentrenados de BERT para construir un sistema de summarization ligero y entrenable en hardware modesto (una GPU T4 de Google Colab fue suficiente), lo que lo convierte en una opción accesible para prototipos y aplicaciones de bajo coste.

La licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales, aunque el modelo presenta limitaciones claras en cuanto a longitud de entrada y dominio de aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder BERT2BERT (bert-base-uncased warm-started en ambos lados, con cross-attention añadida) |
| Parametros totales | 247.363.386 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de entrada, 64 tokens de salida (límites de tokenización) |
| Tipos de cuantizacion | no disponible (pesos en F32, safetensors) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT2BERT: tanto el encoder como el decoder se inicializan desde `bert-base-uncased`, un transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. Para permitir que el decoder atienda al encoder, se añade un módulo de cross-attention con pesos inicializados aleatoriamente. Esta estrategia de warm-start, descrita en el paper de Rothe et al. (2019), reduce significativamente el coste de entrenamiento en comparación con la inicialización desde cero.

El entrenamiento se realizó sobre el dataset DialogSum, con 12.460 ejemplos de entrenamiento y 500 de validación. Los diálogos se tokenizaron con un máximo de 256 tokens y los resúmenes objetivo con un máximo de 64. Se empleó teacher forcing estándar con decoder inputs desplazados a la derecha. Los hiperparámetros principales fueron: 3 épocas, batch size de 16 por dispositivo, precisión mixta fp16 y generación por beam search (num_beams=2 en validación; num_beams=4, length_penalty=2.0, no_repeat_ngram_size=3 y early_stopping=True en inferencia). El entrenamiento se ejecutó en una GPU NVIDIA T4 de Google Colab.

## Capacidades

- Generación de resúmenes de diálogos multiusuario en inglés, con salida de estilo frase única.
- Manejo de conversaciones informales (chats, reuniones breves, soporte al cliente) siempre que no superen los 256 tokens.
- Soporte de generación condicionada mediante beam search con parámetros configurables (num_beams, length_penalty, no_repeat_ngram).
- Integración sencilla con la API `EncoderDecoderModel` de Hugging Face Transformers.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de transformación de texto.
- Capacidad multilingüe nula: solo inglés.

## Casos de uso

- Resumen de conversaciones de atención al cliente: el modelo puede condensar un hilo de soporte técnico en un resumen breve que permita al agente captar rápidamente el problema y la solución acordada. Su límite de 256 tokens es adecuado para interacciones típicas de chat de soporte.
- Actas de reuniones breves: a partir de la transcripción de una reunión de equipo (máximo 256 tokens), el modelo genera un resumen ejecutivo, útil para integrarse en herramientas de productividad como Slack o Notion.
- Resumen de conversaciones de redes sociales: para moderar o analizar hilos de comentarios o mensajes directos, el modelo extrae la idea principal del intercambio.
- Preprocesamiento para sistemas de análisis de sentimiento o clasificación: el resumen generado puede servir como entrada compacta para otros modelos, reduciendo el coste computacional de procesar conversaciones largas.
- Generación de subtítulos o descripciones de podcasts cortos: si se transcribe un fragmento de diálogo de menos de 256 tokens, el modelo produce un titular descriptivo.
- Prototipos de asistentes virtuales que necesiten resumir el historial de conversación antes de pasar el contexto a un LLM más grande: el resumen compacto evita exceder la ventana de contexto del modelo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, dado que se trata de un modelo de summarization específico de dominio. La model card reporta la evolución de la pérdida y la métrica ROUGE-2 F-measure sobre el conjunto de validación de DialogSum (500 ejemplos) durante el entrenamiento:

| Época | Pérdida de entrenamiento | Pérdida de validación | ROUGE-2 F-measure |
|:-----:|:------------------------:|:---------------------:|:-----------------:|
| 1     | 2.489                    | 2.257                 | 0.0612            |
| 2     | 2.072                    | 2.091                 | 0.0884            |
| 3     | 1.734                    | 2.070                 | 0.1069            |

El autor observa que ROUGE-2 seguía mejorando en la última época, lo que sugiere que más entrenamiento podría mejorar el resultado. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: viable para uso puntual, con latencia del orden de cientos de milisegundos a pocos segundos según la longitud del diálogo y el hardware.
- Inferencia en GPU consumer: cabe en GPUs con 2 GB de VRAM o más (por ejemplo, GTX 1650, RTX 2060, RTX 3060) en fp16; en fp32 requiere aproximadamente 1 GB.
- GPU recomendada para entrenamiento: NVIDIA T4 (como se usó) o cualquier GPU con al menos 8 GB de VRAM para fine-tuning adicional.
- Opciones de despliegue: biblioteca Transformers de Hugging Face (Python), ONNX Runtime para exportación, o servidores de inferencia como TGI o vLLM (aunque no es el uso típico para un modelo tan pequeño).
- Throughput estimado: en una GPU T4, con batch size 16 y beam search de 2, se pueden procesar decenas de ejemplos por segundo; en CPU, el throughput cae a unos pocos ejemplos por segundo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas que incluyan este modelo concreto. Como referencia, otros modelos de summarization de diálogos de tamaño similar serían:

- **BART-base** (139M parámetros): también encoder-decoder, preentrenado con denoising, suele obtener mejores resultados en summarization general que un BERT warm-started, aunque requiere fine-tuning específico.
- **T5-small** (60M parámetros): arquitectura encoder-decoder, versátil para múltiples tareas, pero con menor capacidad que este modelo.
- **Pegasus-base** (223M parámetros): diseñado específicamente para summarization, con masking de frases importantes, pero no está especializado en diálogos.

Estas alternativas tienen licencias similares (Apache 2.0) y están disponibles en Hugging Face, pero no hay datos comparativos de ROUGE frente a bert2bert-dialogsum en DialogSum.

## Limitaciones y advertencias

- Entrenado con un dataset reducido (12.460 ejemplos) y solo 3 épocas; la calidad del resumen y la fidelidad factual no están garantizadas.
- Ventana de contexto limitada: los diálogos de más de 256 tokens se truncan, perdiendo información relevante; los resúmenes de más de 64 tokens se cortan.
- Solo soporta inglés; cualquier otro idioma produce resultados incorrectos.
- Sesgos potenciales heredados de `bert-base-uncased` y de los diálogos crowd-sourced de DialogSum, que pueden reflejar estereotipos o lenguaje ofensivo.
- No apto para dominios especializados (legal, médico, técnico) sin fine-tuning adicional.
- El entrenamiento se detuvo antes de que ROUGE-2 convergiera; es probable que con más épocas se obtenga mejor rendimiento.
- En producción, se recomienda revisar manualmente los resúmenes generados antes de su uso en flujos críticos.

## Enlaces

- [Hugging Face - Cruciator/bert2bert-dialogsum](https://huggingface.co/Cruciator/bert2bert-dialogsum)
- [Dataset DialogSum](https://huggingface.co/datasets/knkarthick/dialogsum)
- [Paper "Leveraging Pre-trained Checkpoints" (arXiv:1907.12461)](https://arxiv.org/abs/1907.12461)
- [Paper "bert2BERT: Towards Reusable Pretrained Language Models" (arXiv:2110.07143)](https://arxiv.org/abs/2110.07143)
- [Versión ACL 2022 del paper bert2BERT](https://aclanthology.org/2022.acl-long.151/)
