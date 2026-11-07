# bambocher/Qwen3.5-2B-heretic-LoRA

## Resumen

`bambocher/Qwen3.5-2B-heretic-LoRA` es una adaptación "decensored" (también etiquetada como *abliterated*) del modelo multimodal `Qwen/Qwen3.5-2B` de Alibaba, generada por el usuario bambocher mediante la herramienta Heretic v2.0.0. El objetivo del autor es eliminar el comportamiento de rechazo del modelo original (las negativas a responder ciertas peticiones) preservando al máximo el resto de capacidades, mediante una técnica de ablación de rango arbitrario (ARA) aplicada sobre un rango concreto de capas.

El modelo base Qwen3.5-2B es un modelo causal de lenguaje con codificador de visión, de 2.000 millones de parámetros, con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y atención con compuertas, además de una FFN densa. Su contexto nativo es de 262.144 tokens y está entrenado para tareas de razonamiento, código, agentes y comprensión visual, con soporte declarado de 201 idiomas y dialectos en el modelo original.

La relevancia de esta ficha radica en que se trata de una modificación no oficial orientada a eliminar filtros de seguridad, publicada bajo licencia Apache 2.0 y con un pipeline declarado de image-text-to-text. El repositorio es de pequeño tamaño (0,1 GB) y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; mezcla de Gated DeltaNet (atención lineal) y Gated Attention, con FFN densa |
| Parametros totales | 2B (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no se indica que sea MoE en el modelo base de 2B) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en esta ficha; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos técnicos del modelo base recogidos en la model card: dimensión oculta 2048, embedding de tokens 248.320 (con padding), 24 capas, layout oculto 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 16 cabezas de atención lineal para V y 16 para QK con dimensión 128, 8 cabezas de atención para Q y 2 para KV con dimensión 256, dimensión de RoPE 64, FFN con dimensión intermedia 6144, salida LM de 248.320 atada al embedding de tokens y entrenamiento con MTP multi-paso.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida: intercala bloques de Gated DeltaNet (una forma de atención lineal con estado recurrente) con bloques de Gated Attention clásica, manteniendo una FFN densa en cada bloque. Esta combinación busca alto throughput y baja latencia en inferencia manteniendo calidad en razonamiento. El modelo incluye además un codificador de visión, lo que le permite procesar entradas de imagen y texto de forma conjunta (early fusion sobre tokens multimodales, según la model card del base). El contexto nativo es de 262.144 tokens.

Sobre el proceso de modificación: la variante heretic se ha generado con Heretic v2.0.0 aplicando Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 22 (start_layer_index = 9, end_layer_index = 22). Los hiperparámetros declarados son `preserve_good_behavior_weight = 0.0472`, `steer_bad_behavior_weight = 0.0004`, `overcorrect_relative_weight = 0.4344` y `neighbor_count = 15`. El autor indica que el proceso es reproducible y que los materiales se encuentran en el directorio `reproduce` del repositorio. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base ni la composición exacta del dataset, más allá de las menciones genéricas a preentrenamiento y postentrenamiento con RL a gran escala.

## Capacidades

- Generación de texto y razonamiento en modo instruct (no-thinking) y, presumiblemente, con modos de pensamiento heredados del base (no confirmado en la información disponible para esta variante).
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al codificador de visión del modelo base.
- Generación de código y matemáticas, según los benchmarks del modelo base.
- Soporte de tool calling y function calling, heredado del base (no verificado específicamente en esta variante).
- Capacidades de agente y razonamiento multi-paso, según las características declaradas del base.
- Multilingüismo amplio (201 idiomas y dialectos en el modelo base; no confirmado el grado de preservación tras la ablación).
- Comportamiento "decensored": reducción drástica de rechazos (1/100 frentes a 97/100 del original, según la model card).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado para medir cómo una ablación ARA sobre capas 9-22 afecta a la tasa de rechazos y a la divergencia KL (0,2088 declarada), útil en trabajos de *red teaming* y evaluación de robustez.
- Prototipado de asistentes multimodales sin filtros: para experimentos internos donde se necesita que el modelo responda a entradas de imagen y texto sin negativas, por ejemplo en generación de descripciones de imágenes o análisis de documentos visuales en entornos de investigación.
- Generación de código en pipelines de desarrollo: al heredar las capacidades de código del base y un contexto de 262.144 tokens, puede emplearse para autocompletar, refactorizar o explicar fragmentos en un IDE o en CI/CD, aunque conviene validar la calidad tras la ablación.
- Fine-tuning específico de dominio: al ser un modelo de 2B con licencia Apache 2.0 y pesos en safetensors, es adecuado como punto de partida para ajuste supervisado en tareas concretas (clasificación, extracción, resumen) donde el comportamiento de rechazo del base resulta un obstáculo.
- Evaluación comparativa de técnicas de decensoring: permite reproducir el proceso Heretic v2.0.0 con los parámetros publicados y comparar con otras variantes (por ejemplo, `bambocher/Qwen3.5-0.8B-heretic-LoRA`).
- Despliegue en entornos con recursos limitados: con 2B parámetros y contexto largo, puede ejecutarse en una sola GPU consumer para tareas de generación de texto e imagen-texto en prototipos y demos.

## Benchmarks y rendimiento

La model card de esta variante solo publica métricas del proceso de ablación, no benchmarks estándar de capacidad.

| Metrica | Este modelo | Modelo original (Qwen3.5-2B) |
|---|---|---|
| Rechazos (refusals) | 1/100 | 97/100 |
| Divergencia KL | 0,2088 | 0 (por definición) |

Del modelo base Qwen3.5-2B se recogen en la model card los siguientes resultados parciales en modo instruct (no-thinking), comparados con Qwen3-4B-2507 y Qwen3-1.7B:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84 (dato truncado en la fuente) | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks para esta variante heretic.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 2B parámetros, en FP16 se requieren aproximadamente 4-5 GB de VRAM; en cuantizaciones de 8 bits, en torno a 2-3 GB; en 4 bits, alrededor de 1,5-2 GB. Estas cifras son estimaciones orientativas, no datos publicados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090, y en GPUs de datacenter como A100, H100 o L40S para despliegues con mayor concurrencia.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más en cuantización, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers (librería declarada), y según la model card del base, también vLLM, SGLang y KTransformers. No se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-LoRA | 2B | 262.144 | Apache 2.0 | Variante decensored con ablación ARA; 1/100 rechazos, KL 0,2088 |
| Qwen/Qwen3.5-2B | 2B | 262.144 | Apache 2.0 | Modelo base multimodal; 97/100 rechazos; MMLU-Pro 55,3 |
| bambocher/Qwen3.5-0.8B-heretic-LoRA | 0,8B | no disponible | Apache 2.0 (presumible) | Variante heretic del modelo de 0,8B del mismo autor |
| Qwen3-4B-2507 | 4B | no disponible | Apache 2.0 (presumible) | Referencia de la model card; MMLU-Pro 69,6 |
| Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 (presumible) | Referencia de la model card; MMLU-Pro 40,2 |

## Limitaciones y advertencias

- Modelo modificado no oficial: no ha sido validado por Alibaba ni por Qwen; el comportamiento tras la ablación puede degradarse en tareas distintas a las evaluadas.
- Riesgo elevado de contenido dañino: el objetivo explícito es reducir los rechazos (de 97/100 a 1/100), por lo que puede generar contenido que el modelo original bloquearía. No es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Divergencia KL de 0,2088 respecto al original: indica que la distribución de salida se ha alterado de forma medible; pueden aparecer regresiones en razonamiento, código o multilingüismo no cuantificadas en la información disponible.
- Idiomas soportados no confirmados para esta variante: aunque el base declara 201 idiomas, no hay datos de preservación tras la ablación.
- Sesgos: no se han publicado análisis de sesgo para esta variante; los sesgos del base persisten y pueden amplificarse.
- Alucinación: no se han publicado métricas de factualidad para esta variante.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento normativo y de las políticas de contenido aplicables en su jurisdicción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria; conviene auditar los pesos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Heretic: https://heretic-project.org
- Variante relacionada: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-LoRA
