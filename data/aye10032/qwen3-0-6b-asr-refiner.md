# Aye10032/Qwen3-0.6B-ASR-Refiner

## Resumen

Qwen3-ASR-Refiner es un modelo de lenguaje desarrollado por Aye10032 que convierte transcripciones de reconocimiento de voz (ASR) en chino, así como cualquier texto en estilo hablado, en un registro escrito formal y natural, preservando el significado original. Se trata de una familia de modelos que incluye variantes de 0.6B, 1.7B y 4B parámetros; esta ficha se centra en la versión de 0.6B, que parte del modelo base Qwen/Qwen3-0.6B. El modelo está pensado para el post-procesamiento de salidas de ASR, una etapa crítica en pipelines de transcripción donde la salida cruda suele contener muletillas, repeticiones y estructuras orales que dificultan su lectura o su uso en documentos formales.

La relevancia actual radica en que los sistemas ASR modernos, como los de la familia Qwen3-ASR, generan transcripciones con estilo oral, y este modelo ofrece una solución ligera y específica para normalizarlas a texto escrito. Al estar basado en un modelo de solo 0.6B parámetros, es adecuado para despliegues con recursos limitados, manteniendo una calidad aceptable para la tarea concreta. El modelo se distribuye con pesos completos en BF16, lo que facilita su integración directa en pipelines de transformers sin necesidad de PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basada en Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16 safetensors) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base Qwen3-0.6B, un transformer causal con atención estándar, entrenado originalmente por Alibaba Cloud. El proceso de ajuste consistió en aplicar LoRA (Low-Rank Adaptation) sobre la arquitectura base, seguido de la fusión de los adaptadores en los pesos finales. El entrenamiento se realizó sobre el dataset `Aye10032/WenetSpeech-Formal-Text`, que contiene pares de transcripciones en estilo hablado (típicas de ASR) y su correspondiente versión escrita formal. No se menciona el número de tokens de entrenamiento ni el uso de RLHF o DPO; se trata de un fine-tuning supervisado estándar. El modelo está diseñado para ser usado con el prompt de sistema en chino que se indica en la documentación, que pide convertir el texto hablado en escrito manteniendo el significado original y sin añadir información nueva.

## Capacidades

- Convierte transcripciones de ASR en chino (mandarín) a texto escrito formal y natural.
- Normaliza muletillas, repeticiones, estructuras orales y expresiones coloquiales.
- Preserva el significado original sin añadir información no presente en la entrada.
- Genera texto con un registro más conciso y adecuado para documentos, subtítulos o publicaciones.
- Soporta el formato de chat de Qwen3 (con system prompt y user message) y puede usarse con `enable_thinking=False` para generar respuestas directas.
- No incluye capacidades multimodales ni de audio; es un modelo puramente de texto.

## Casos de uso

- Limpieza de transcripciones de entrevistas: un sistema de ASR produce la transcripción bruta de una entrevista; el modelo la convierte en texto limpio y legible para su posterior análisis o publicación en prensa.
- Generación de actas de reuniones: las salidas de ASR de reuniones grabadas se refinan para obtener actas formales y estructuradas, eliminando muletillas y redundancias.
- Preparación de subtítulos para vídeos: los subtítulos generados por ASR en tiempo real se pueden post-procesar con este modelo para lograr un texto más fluido y profesional, mejorando la experiencia del espectador.
- Normalización de contenido de podcasts o vídeos: transcripciones de podcasts o canales de vídeo se convierten en artículos escritos o notas de blog, con un estilo editorial.
- Integración en pipelines de ASR para empresas: empresas que despliegan sistemas de reconocimiento de voz pueden añadir este modelo como etapa posterior para generar registros de llamadas o atención al cliente en formato escrito limpio.
- Preprocesamiento de datos de entrenamiento: se puede usar para normalizar textos hablados en corpus de entrenamiento de otros modelos de NLP, mejorando la calidad de los datos antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como BLEU, ROUGE o evaluaciones humanas que permitan comparar este modelo con alternativas similares. La ausencia de benchmarks es común en modelos de fine-tune específicos para tareas de post-procesamiento.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~596M parámetros y los pesos BF16 ocupan aproximadamente 1.2 GB en disco. La VRAM necesaria para inferencia con batch pequeño es de al menos 2-3 GB, dependiendo de la longitud de entrada y la configuración de generación.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060, GTX 1660) puede ejecutar el modelo cómodamente. También funciona en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI, o mediante la API de HuggingFace Inference Endpoints. También se puede cargar con `AutoModelForCausalLM` en un entorno Python estándar.
- Latencia y throughput: no se disponen de datos concretos, pero al ser un modelo pequeño, se esperan tiempos de generación de unos pocos cientos de milisegundos por respuesta en GPU moderna. En CPU, puede tardar varios segundos.

## Comparativa con modelos similares

No se han encontrado modelos comparables de la misma categoría (post-procesamiento de ASR para chino) con información pública disponible. La alternativa más cercana sería usar el modelo base Qwen3-0.6B directamente con un prompt de instrucción, pero sin el fine-tune específico, el rendimiento en la tarea de formalización sería inferior. Otras opciones como GPT-4 o Claude podrían hacer la tarea, pero no son open source y no son comparables en tamaño. Por tanto, la comparativa se limita a indicar que no hay alternativas directas de código abierto con el mismo propósito.

## Limitaciones y advertencias

- Solo soporta chino (mandarín); no funciona con otros idiomas.
- El modelo se ha entrenado específicamente para transformar texto hablado en formal, pero puede fallar en textos con jerga muy técnica o dialectos regionales no representados en el dataset.
- Riesgo de alucinación: aunque el prompt de sistema pide no añadir información, el modelo puede generar contenido no presente en la entrada en casos de entradas muy ambiguas o ruidosas.
- La longitud de contexto heredada del modelo base no se especifica en la ficha; se recomienda mantener entradas cortas (menos de 2000 tokens) para evitar degradación del rendimiento.
- No se ha evaluado el modelo en tareas fuera del dominio de formalización de ASR; no es un modelo de propósito general.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento (WenetSpeech-Formal-Text) está bajo CC BY 4.0, lo que puede implicar obligaciones de atribución si se redistribuye el modelo o se usa en productos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aye10032/Qwen3-0.6B-ASR-Refiner
- Dataset de entrenamiento: https://huggingface.co/datasets/Aye10032/WenetSpeech-Formal-Text
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Familia de modelos ASR Refiner (0.6B, 1.7B, 4B): enlaces en la model card
- Repositorio de Qwen3-ASR (relacionado pero no idéntico): https://github.com/QwenLM/Qwen3-ASR
