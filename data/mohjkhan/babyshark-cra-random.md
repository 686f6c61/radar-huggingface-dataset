# mohjkhan/babyshark-cra-random

## Resumen

babyshark-cra-random es un adaptador LoRA de rango 8 entrenado sobre el modelo base Qwen/Qwen2.5-1.5B para clasificación de sentimiento (3 clases) en texto hinglish romanizado (hindi-inglés code-mixed). Lo desarrolla el usuario mohjkhan en el marco del proyecto InterpAdapt del equipo BabyShark (IIIT Hyderabad), centrado en interpretabilidad y enrutado de circuitos («circuit routing adapter», CRA) para el ajuste fino de adaptadores LoRA guiado por cabezas de atención relevantes.

El modelo no es un adaptador PEFT estándar: utiliza una superficie de enrutado propia denominada MaskedLoRALinear, en la que se enmascaran bloques de cabezas de atención. En esta variante concreta la máscara es aleatoria (mask:random), por lo que funciona como brazo de control de presupuesto equivalente (matched-budget) frente a las variantes guiadas por trazas causales. Se entrenó con el dataset SAIL-2017 Romanized, stagio 2, y se evaluó sobre 1260 ejemplos de validación en fp16.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 «likes» en el momento de la consulta, sin licencia declarada y sin pipeline asignado. Su interés principal es metodológico (comparación de estrategias de enmascarado de cabezas para adaptación LoRA en code-mixing), no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8) con enrutado MaskedLoRALinear sobre transformer decoder Qwen2.5-1.5B |
| Parámetros totales | No disponible para el adaptador; modelo base Qwen2.5-1.5B (1,5 B aproximadamente). LoRA sobre q_proj y o_proj, alpha 16, dropout 0,05 |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B; el adaptador se entrenó con max_len 256 |
| Tipos de cuantización | No disponible; el checkpoint publicado está en fp16 (los números de evaluación son fp16) |
| Idiomas soportados | hi, en (hindi e inglés, con evaluación en hinglish romanizado) |
| Licencia | No disponible |
| Formato de pesos | ckpt.pt (payload de torch.save con el state dict del adaptador, más optimizador, scheduler, step y RNG para reanudar). No se publican safetensors ni GGUF |

Otros metadatos: máscara en modo random, 224 bloques de cabezas activos, 600 pasos de entrenamiento, lr 1e-4, seed 0. Tamaño del repositorio: 0,0 GB según HuggingFace.

## Arquitectura y entrenamiento

El adaptador se inyecta sobre Qwen2.5-1.5B, un transformer decoder de tipo causal con atención de consultas agrupadas (GQA) y 32.768 tokens de contexto en su versión base. La innovación del proyecto no está en el modelo base, sino en la superficie de adaptación: en lugar de un LoRA convencional, se utiliza MaskedLoRALinear, que enruta el adaptador a través de un subconjunto de bloques de cabezas de atención definido por una máscara. En esta variante, la máscara se genera de forma aleatoria con el mismo presupuesto de cabezas que las variantes guiadas (224 bloques activos), lo que permite aislar el efecto del criterio de selección de cabezas frente al simple hecho de enmascarar.

El entrenamiento se realizó durante 600 pasos con rango 8 en q_proj y o_proj, alpha 16, dropout 0,05, learning rate 1e-4, longitud máxima de secuencia 256 y seed 0. Las puntuaciones de cabezas de las variantes guiadas provienen de una traza causal de etapa 1 v2 (recuperación media en en_hi-latn). Los brazos CRA comparten seed y orden de datos, de modo que la única diferencia entre ellos es la máscara de cabezas. Los datos de entrenamiento corresponden al dataset satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2, derivado de SAIL-2017 en su variante romanizada y code-mixed. No se documenta en la información disponible el uso de RLHF, DPO ni un recuento de tokens de entrenamiento.

## Capacidades

- Clasificación de sentimiento en 3 clases sobre texto hinglish romanizado (hindi-inglés code-mixed), que es la tarea para la que se entrenó y evaluó.
- Comprensión de texto code-mixed con alternancia de idiomas dentro de la misma frase, incluyendo transliteración latina del hindi.
- Generación de texto y razonamiento básico heredados del modelo base Qwen2.5-1.5B, si bien el adaptador no fue entrenado para generación.
- Capacidades multilingües limitadas a hindi e inglés (con foco en la mezcla de ambos); no hay evidencia de soporte de otros idiomas.
- No se documenta soporte de tool calling ni de function calling específico para este adaptador.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo «thinking», visión, audio ni otras capacidades multimodales.
- Función metodológica: sirve como control de referencia (máscara aleatoria, presupuesto de 224 bloques de cabezas) para comparar con adaptadores CRA guiados por interpretabilidad.

## Casos de uso

- Análisis de sentimiento de comentarios en redes sociales para el mercado indio: el adaptador clasifica en 3 clases texto romanizado que mezcla hindi e inglés, un registro muy frecuente en Twitter/X y YouTube y mal cubierto por modelos entrenados solo en inglés.
- Monitorización de reputación de marca en comunidades hinglish: permite agregar opiniones de usuarios sobre productos o campañas sin necesidad de traducir previamente el texto, evitando la pérdida de matices que introduce la traducción automática.
- Moderación y triaje de contenido generado por usuarios: clasificar el tono de comentarios code-mixed para enrutar los negativos a revisión humana, usando el modelo como primera etapa de un pipeline.
- Analítica de encuestas y formularios con respuestas abiertas: procesar respuestas en hinglish romanizado de clientes o empleados y obtener etiquetas de sentimiento agregables a nivel de producto o región.
- Investigación en interpretabilidad: emplear este brazo de control con máscara aleatoria como referencia experimental frente a adaptadores guiados por trazas causales, comparando accuracy y macro-F1 con el mismo presupuesto de cabezas y la misma semilla.
- Estudio académico de code-mixing: utilizar el adaptador como punto de partida para analizar cómo la selección de cabezas de atención afecta al rendimiento en tareas de sentimiento sobre lengua mezclada.
- Base para ampliaciones con datos propios: al ser un LoRA de rango bajo sobre Qwen2.5-1.5B, puede servir de inicialización en experimentos de ajuste fino adicional en dominios concretos (por ejemplo, opiniones de producto o atención al cliente).

## Benchmarks y rendimiento

Evaluación en validación (n = 1260, fp16, NVIDIA GeForce GTX 1080 Ti):

| Métrica | Qwen2.5-1.5B base | + adaptador (babyshark-cra-random) |
|---|---|---|
| Accuracy | 0,3571 | 0,6230 |
| Macro-F1 | 0,3188 | 0,5977 |

No se han publicado otros resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni comparaciones con los demás brazos CRA del proyecto). Las cifras corresponden a una única partición de validación de 1260 ejemplos y a una tarea de clasificación de sentimiento de 3 clases.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-1.5B en fp16 requiere aproximadamente 3,1 GB solo para pesos; con caché KV y activaciones conviene reservar del orden de 4-6 GB para secuencias cortas (256 tokens, que es la longitud de entrenamiento).
- GPU utilizadas por los autores: NVIDIA GeForce GTX 1080 Ti (11 GB) para la evaluación en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090), e incluso en 4 GB con cuantización si se convirtiera el modelo base.
- GPU de centro de datos (A100, H100) no son necesarias para este tamaño, aunque permitirían mayor throughput por batch.
- Opciones de despliegue: no es compatible directamente con vLLM, Ollama, llama.cpp ni TGI, porque el adaptador usa la superficie custom MaskedLoRALinear y se carga mediante el código del proyecto (build + inject_masked_lora, load_checkpoint). El formato publicado es ckpt.pt, no safetensors ni GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| babyshark-cra-random | Qwen2.5-1.5B + LoRA r=8 | 32.768 (entrenado a 256) | No disponible | 0 descargas; requiere código del proyecto para cargar |
| Qwen2.5-1.5B (base) | 1,5 B | 32.768 | Apache 2.0 | Pesos oficiales, descarga directa |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | Apache 2.0 | Pesos oficiales, compatible con vLLM, TGI y Ollama |
| Llama-3.2-1B | 1,24 B | 128.000 | Llama 3.2 Community License | Pesos oficiales, ecosistema amplio (llama.cpp, Ollama) |

No se dispone de datos de rendimiento comparables entre estos modelos en la tarea de sentimiento hinglish, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. El adaptador se distingue por su naturaleza experimental y por la ausencia de licencia declarada, no por superioridad de rendimiento frente a alternativas genéricas.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, por lo que su uso en producción entraña riesgo legal.
- Es un brazo de control: la máscara aleatoria se diseñó como referencia metodológica, no como la mejor variante del proyecto; los adaptadores guiados por circuitos pueden superarlo.
- Carga no estándar: no funciona con PEFT, vLLM, TGI, Ollama ni llama.cpp sin adaptar el código; requiere el repositorio InterpAdapt-Hinglish-finetuning y la clase MaskedLoRALinear.
- Entrenamiento a 256 tokens: aunque el modelo base soporta 32.768 tokens de contexto, el adaptador se ajustó con secuencias de 256, por lo que el comportamiento más allá de esa longitud no está validado.
- Evaluación limitada: una sola partición de validación de 1260 ejemplos, una única semilla (seed 0) y una sola tarea (sentimiento de 3 clases en hinglish).
- Idiomas restringidos: hindi e inglés en registro romanizado; no hay evidencia de buen rendimiento en hindi nativo (devanagari) ni en otros idiomas.
- Sesgos potenciales: el dataset SAIL-2017 procede de texto de redes sociales, con posibles sesgos de género, región, religión y registro, además de sobrerrepresentación de determinados temas virales.
- Riesgo de alucinación: el modelo base es generativo y podría producir texto plausible pero incorrecto si se usa fuera de la tarea de clasificación; el adaptador no corrige ese comportamiento.
- Cifras no reproducibles de forma independiente: el repositorio tiene 0 descargas y 0 «likes», sin validación externa, y las fechas de creación y actualización registradas (2026) resultan inconsistentes.
- Sin metadatos operativos: no se publican cuantizaciones, pipeline declarado ni métricas de latencia o throughput, lo que dificulta planificar un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohjkhan/babyshark-cra-random
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2
- Repositorio del proyecto InterpAdapt-Hinglish-finetuning: https://github.com/bala-skv/InterpAdapt-Hinglish-finetuning
- Paper o publicación técnica: no disponible
- Demo o espacio interactivo: no disponible
