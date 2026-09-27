# Jahirrrr/Klyra-64M-Reasoning-Fundamentals

## Resumen

Klyra-64M-Reasoning-Fundamentals es un checkpoint de la familia Klyra-64M, un proyecto de investigación de modelos de lenguaje compactos desarrollado por un estudiante de Ingeniería Informática del Politeknik Negeri Jakarta (Politécnico Estatal de Yakarta). El modelo parte del checkpoint Klyra-64M-Instruct y añade una etapa de ajuste supervisado (SFT) orientada a razonamiento básico, con el objetivo de mejorar la capacidad de resolver problemas aritméticos y de lógica sencilla sin sacrificar la capacidad de instrucción general.

Se trata de un modelo decoder-only compatible con la arquitectura MiniMind, entrenado desde inicialización aleatoria mediante un pipeline por etapas. Cuenta con aproximadamente 63,9 millones de parámetros únicos en tiempo de ejecución (con embeddings de entrada y salida atados), 8 capas transformer, tamaño oculto de 768, 8 cabezas de atención con 4 cabezas KV y una longitud de contexto de 1.024 tokens. El vocabulario es reducido (~6,4K tokens) y el modelo está orientado únicamente al inglés.

Su relevancia radica en ser un experimento académico de razonamiento y post-entrenamiento por etapas a escala sub-100M, una franja poco explorada frente a los modelos grandes. Con 0 descargas y 1 like en el momento de la consulta, es un artefacto de investigación temprano más que un modelo listo para producción. La licencia Apache 2.0 permite su uso, modificación y redistribución, incluido el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer, compatible con MiniMind |
| Parametros totales | 68.827.392 en safetensors; ~63.912.192 únicos en runtime tras atar embeddings |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (compatible con cuantización estándar vía transformers/GGUF derivado) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas transformer | 8 |
| Tamano oculto | 768 |
| Cabezas de atencion / KV | 8 / 4 |
| Vocabulario | ~6,4K tokens |
| MoE | No |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas con tamaño oculto 768, 8 cabezas de atención y 4 cabezas KV (lo que implica una relación de grupo GQA de 2:1). El vocabulario es de aproximadamente 6,4K tokens. El modelo usa embeddings de entrada y salida atados (weight tying) en tiempo de ejecución, de modo que el número efectivo de parámetros únicos es de 63.912.192, aunque algunos ficheros safetensors exportados contengan `model.embed_tokens.weight` y `lm_head.weight` como tensores separados. La arquitectura es compatible con MiniMind, lo que facilita reutilizar herramientas y pipelines de esa familia.

El entrenamiento se realizó desde inicialización aleatoria mediante un pipeline por etapas. El checkpoint parte de Klyra-64M-Instruct y añade una etapa de SFT conservadora centrada en razonamiento. El conjunto de datos de esta etapa consta de 30.000 ejemplos en total: 18.000 ejemplos de razonamiento y 12.000 ejemplos de repetición de instrucciones generales (replay) para preservar la capacidad de instrucción previa. Las áreas de foco declaradas incluyen aritmética, razonamiento corto de varios pasos, problemas de tasas unitarias, lógica básica, fundamentos de ciencias y algoritmos simples. No se documenta el uso de RLHF o DPO en este checkpoint, ni el número total de tokens de preentrenamiento.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento aritmético básico y de varios pasos cortos (problemas de tipo tasa unitaria y algoritmos simples).
- Razonamiento lógico elemental y fundamentos de ciencias.
- Instrucción general (heredada del checkpoint Klyra-64M-Instruct mediante replay de 12.000 ejemplos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso encadenado: no disponible; el foco es razonamiento corto.
- Capacidades multilingües: no; únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ajuste fino posterior y experimentos de RL o destilación: soportados como caso de uso previsto por el autor.

## Casos de uso

- Experimentación académica en razonamiento a escala sub-100M: sirve como banco de pruebas para estudiar si un modelo de ~64M parámetros puede mejorar en tareas de lógica y aritmética tras SFT selectivo, comparando con su checkpoint base Instruct.
- Fine-tuning posterior para dominios concretos: al ser Apache 2.0 y compatible con transformers, se puede reentrenar sobre datasets propios pequeños (por ejemplo, preguntas frecuentes técnicas) con requisitos de cómputo mínimos.
- Investigación en destilación de modelos: el modelo puede actuar como estudiante sobre trazas generadas por modelos mayores, aprovechando su bajo coste de entrenamiento e inferencia.
- Razonamiento aritmético básico embebido: útil para prototipos de cálculo simple y problemas de tasas unitarias en inglés, siempre con supervisión humana dado su escaso contexto (1.024 tokens).
- Generación de texto conversacional ligera en inglés: chatbots de dominio muy acotado y respuestas cortas donde el coste por inferencia deba ser mínimo (CPU o GPU de gama baja).
- Educación y divulgación: demostración de un pipeline completo de entrenamiento de un LLM desde cero (preentrenamiento, SFT e instrucción) para docencia en cursos de machine learning.
- Pruebas de despliegue en hardware limitado: permite validar pipelines de serving (transformers, endpoints compatibles) en entornos sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card (media de cinco tareas = 36,92):

| Tarea | Resultado |
|---|---:|
| ARC-Easy | 32,37 |
| PIQA | 58,98 |
| OpenBookQA | 28,60 |
| HellaSwag | 28,73 |
| Social-IQA | 35,93 |
| Media (5 tareas) | 36,92 |

El autor indica que este es el checkpoint con la media más alta de cinco tareas entre los checkpoints Klyra publicados. No se han publicado en la información disponible resultados de MMLU, GSM8K, HumanEval ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (según 63,9M parámetros únicos; estimaciones derivadas del tamaño, no datos oficiales):
  - FP32: ~256 MB de pesos.
  - FP16/BF16: ~128 MB de pesos.
  - INT8: ~64 MB de pesos.
  - INT4: ~32 MB de pesos.
- Memoria de caché KV: con 8 capas, 4 cabezas KV y dimensión de cabeza 96, el caché por token es de ~6.144 elementos; para 1.024 tokens supone del orden de 12 MB en FP16. Es despreciable frente a los pesos.
- Cabe en cualquier GPU de consumo, y también en CPU: el modelo completo ocupa menos de 1 GB en cualquier precisión habitual. GPUs como RTX 3060, RTX 4090 o incluso integradas son más que suficientes.
- GPU recomendadas: no requiere GPU dedicada. Para entrenamiento o fine-tuning, una RTX 3060/4090 o superior acelera el proceso; para producción, cualquier acelerador moderno sirve.
- Opciones de despliegue: transformers (librería declarada y con tag `endpoints_compatible`), más cualquier runtime que soporte safetensors. No se confirma soporte oficial de vLLM, llama.cpp, Ollama o TGI en la información disponible, aunque por tamaño el modelo es candidato trivial para todos ellos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por número de parámetros, la inferencia es de milisegundos por respuesta corta en hardware moderno.

## Comparativa con modelos similares

Comparativa de especificaciones frente a alternativas de tamaño comparable (datos de conocimiento general; los benchmarks no son directamente comparables por diferencias de evaluación):

| Modelo | Parametros | Contexto | Licencia | Idiomas |
|---|---:|---:|---|---|
| Klyra-64M-Reasoning-Fundamentals | ~63,9M | 1.024 | Apache 2.0 | Inglés |
| MiniMind-64M | ~64M (familia base) | No disponible | No disponible | No disponible |
| SmolLM2-135M-Instruct | 135M | 8.192 | Apache 2.0 | Inglés (multilingüe limitado) |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Apache 2.0 | Multilingüe |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | Apache 2.0 | Inglés |

El principal punto diferencial de Klyra es su foco explícito en razonamiento a 64M con licencia permisiva; sus competidores directos por tamaño son mucho más pequeños en número (MiniMind) o notablemente mayores (SmolLM2, Qwen2.5), con ventanas de contexto muy superiores. No se dispone de comparativas de rendimiento publicadas entre Klyra y estos modelos.

## Limitaciones y advertencias

- Ventana de contexto muy corta (1.024 tokens): no apto para conversaciones largas, documentos extensos ni agentes multi-paso con estado prolongado.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Rendimiento de razonamiento bajo en términos absolutos: la media de cinco tareas es 36,92, con HellaSwag en 28,73 y OpenBookQA en 28,60, por debajo del azar en varias tareas. No debe usarse para tareas que exijan precisión alta.
- Riesgo elevado de alucinación: al tratarse de un modelo de 64M con vocabulario de ~6,4K tokens, la generación de hechos puede ser incorrecta con frecuencia.
- Posibles sesgos derivados de los datos de entrenamiento: no se documenta la composición del dataset de preentrenamiento ni medidas de mitigación de sesgos.
- Vocabulario reducido (~6,4K): puede degradar la tokenización de términos técnicos, nombres propios y palabras poco frecuentes.
- Parámetros duplicados en safetensors: si el fichero contiene `lm_head.weight` y `model.embed_tokens.weight` por separado, hay que atar pesos al cargar para reproducir el modelo de 63,9M; de lo contrario se cargan 68,8M con tensores redundantes.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se atribuya. No impone restricciones adicionales, pero tampoco ofrece garantías.
- Proyecto de investigación con 0 descargas y 1 like: no ha sido validado por la comunidad; no se recomienda su uso en producción crítica.
- Nota de desambiguación: los resultados de búsqueda de "Klyra AI" (klyralabs.io, github.com/klyra-ai/docs) corresponden a una plataforma comercial aparentemente no relacionada con este proyecto académico; no deben mezclarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jahirrrr/Klyra-64M-Reasoning-Fundamentals
- Proyecto principal Klyra-64M: https://huggingface.co/Jahirrrr/Klyra-64M
- Artículo del autor (dev.to): https://dev.to/jahirrrr/bisakah-model-64-juta-parameter-belajar-bernalar-membangun-model-bahasa-64m-parameter-dari-nol-kn
- Klyra AI (plataforma, aparentemente no relacionada): https://www.klyralabs.io/
- Documentación Klyra AI (GitHub): https://github.com/klyra-ai/docs
- Leaderboard de razonamiento (contexto, no específico del modelo): https://llm-stats.com/leaderboards/best-ai-for-reasoning
