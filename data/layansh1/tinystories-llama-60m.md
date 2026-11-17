# LayanSh1/tinystories-llama-60m

## Resumen

TinyStories Llama 60M es un modelo de lenguaje causal de estilo Llama entrenado desde inicialización aleatoria por LayanSh1 como trabajo de curso sobre leyes de escala. Con 60.247.552 parámetros, 19 capas, anchura oculta de 512 y 8 cabezas de atención (4 cabezas KV con grouped-query attention), está diseñado para generar texto narrativo sencillo en inglés a partir del corpus TinyStories, un conjunto de historias cortas sintéticas generadas con GPT-3.5 y GPT-4 usando vocabulario restringido.

Su relevancia es fundamentalmente didáctica y experimental: ilustra el proceso completo de planificación mediante la regla de Chinchilla (D ≈ 20N), tokenización BPE propia, entrenamiento y evaluación en una única GPU T4. El autor documenta explícitamente que el modelo está fuertemente infraentrenado respecto a la ley de escala: procesó 29,49 millones de tokens frente a los 1,2 mil millones planificados, es decir, un 2,45 % del presupuesto teórico y 0,49 tokens por parámetro en lugar de los ~20 recomendados.

No es un modelo para producción generalista: su ventana de contexto es de solo 256 tokens, su vocabulario de 8.192 entradas y su licencia CDLA-Sharing-1.0 impone condiciones de compartición. Resulta útil como referencia educativa de arquitectura Llama a pequeña escala, para experimentos de generación de cuentos simples y para estudiar el efecto del infraentrenamiento en modelos diminutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (causal LM), con RMSNorm, RoPE, SwiGLU y GQA |
| Parametros totales | 60.247.552 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (longitud de bloque de entrenamiento) |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas; al ser safetensors FP32/FP16 es convertible a GGUF/INT8/INT4 con herramientas estándar) |
| Idiomas soportados | Inglés (en) |
| Licencia | CDLA-Sharing-1.0 |
| Formato de pesos | safetensors (librería transformers) |

Detalle adicional de arquitectura: 19 capas, hidden size 512, 8 cabezas de atención con dimensión de cabeza 64, 4 cabezas KV (GQA), intermediate size 1.408 con SwiGLU, vocabulario de 8.192, RMSNorm con eps 1e-5, RoPE con θ = 10.000, sin biases y embeddings de entrada/salida atados. Desglose de parámetros: feed-forward SwiGLU 41,1M (68,2 %), atención 14,9M (24,8 %), embedding/cabeza LM compartida 4,2M (7,0 %), normalización 20K.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con las convenciones de Llama: normalización RMSNorm previa a cada subcapa, embeddings rotatorios RoPE, activación SwiGLU en el bloque feed-forward y atención con grouped-query attention (8 cabezas de consulta, 4 de clave/valor), lo que reduce el tamaño de la caché KV y el número de parámetros de atención frente a atención multi-cabeza completa. Los embeddings de entrada y la cabeza de lenguaje están atados, ahorrando 4,2M de parámetros. La elección de 19 capas × 512 de anchura se justifica en la model card como el punto más cercano al objetivo de ~60M entre las alternativas consideradas (36 × 384 resulta más lento en GPU por secuencialidad de capas; 13 × 640 supera los 64M y vería menos tokens por parámetro).

El entrenamiento se realizó sobre el split de entrenamiento de roneneldan/TinyStories: 300.000 historias únicas tras normalización de espacios y deduplicación por SHA-256, divididas en train/validación/test (90/5/5) por historia completa antes de tokenizar. Se entrenó un tokenizador BPE a nivel de byte con vocabulario de 8.192 y frecuencia mínima 2 solo sobre el split de entrenamiento, con tokens especiales `<pad>`, `<bos>`, `<eos>` y `<unk>`. El conjunto resultante contiene 56.836.863 tokens de entrenamiento (222.018 bloques de 256), 3.177.577 de validación y 3.146.434 de test.

La tirada real usó 1 GPU NVIDIA Tesla T4 (16 GB) en Google Colab, precisión mixta FP16 con escalado de gradiente y pesos FP32, optimizador AdamW (β = 0,9/0,95, weight decay 0,1, clipping 1,0), LR pico 5e-4 con 100 pasos de warmup lineal y decaimiento coseno, micro-lote de 16 secuencias × 256 tokens con 4 pasos de acumulación (lote efectivo de 16.384 tokens), 1.800 actualizaciones y semilla 42. El pico de memoria GPU fue de 4,47 GiB y el throughput medido de 5.398 tokens/s, procesando 29.491.200 tokens de entrada en unos 91 minutos. No se documenta RLHF, DPO ni ajuste por instrucciones; es un modelo base de continuación de texto.

## Capacidades

- Generación de texto narrativo en inglés: continuación de historias cortas con vocabulario y gramática simples, el dominio para el que fue entrenado.
- Modelado de lenguaje causal: predicción del siguiente token, útil como base para experimentos de fine-tuning.
- Generación condicionada por prompt: acepta un inicio de cuento y continúa en el mismo registro lingüístico.
- Manejo de tokens especiales `<bos>`, `<eos>`, `<pad>` y `<unk>` para delimitar secuencias.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene modo de pensamiento (thinking), visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés; el tokenizador se entrenó solo con texto inglés de TinyStories.
- No está ajustado por instrucciones (no es un modelo instruct/chat).

## Casos de uso

- Docencia sobre leyes de escala: reproducir el cálculo N = √(C/120), comparar el presupuesto planificado con el ejecutado y discutir el efecto del infraentrenamiento en la pérdida, usando el modelo como caso de estudio real.
- Generación de cuentos infantiles cortos: dado un prompt de una o dos frases, el modelo continúa historias simples en inglés con estructuras repetitivas típicas de TinyStories, adecuado para demostraciones de generación de texto en el aula.
- Referencia base para fine-tuning: al ser un checkpoint safetensors compatible con transformers de solo 0,2 GB, sirve como punto de partida para experimentos de ajuste en dominios muy restringidos (por ejemplo, descripciones de productos con vocabulario controlado).
- Pruebas de pipelines de inferencia: su tamaño permite validar integraciones con text-generation-inference, endpoints compatibles y servidores ligeros en entornos con recursos mínimos.
- Estudio de tokenizadores BPE pequeños: el tokenizador de 8.192 entradas permite analizar cómo afecta un vocabulario reducido a la compresión y a la calidad en corpus simples.
- Experimentos de cuantización y eficiencia: al caber holgadamente en cualquier GPU consumer, se puede usar para medir latencia y perplejidad en FP16, INT8 e INT4 sin coste de infraestructura.
- Comparación de arquitecturas a pequeña escala: variantes con y sin GQA, con embeddings atados o no, para cuantificar el impacto en parámetros y calidad en un presupuesto de cómputo fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: throughput de 5.398 tokens/s en una T4, pico de memoria de 4,47 GiB, 29.491.200 tokens procesados en 1.800 actualizaciones y una pérdida que seguía decreciendo al final del entrenamiento. No se proporcionan valores de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,15 GB para los pesos (60,2M × 2 bytes) más la caché KV y activaciones; en la práctica cabe en cualquier GPU con 1 GB o más.
- VRAM estimada en FP32: aproximadamente 0,25 GB para los pesos.
- VRAM estimada en cuantización INT8: unos 0,07 GB; en INT4, unos 0,04 GB (estimaciones teóricas a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU; el entrenamiento se realizó en una NVIDIA Tesla T4 de 16 GB con 4,47 GiB de pico.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de VRAM; también en Apple Silicon y en CPU.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo declara compatibilidad con endpoints), y conversión a GGUF para llama.cpp u Ollama mediante herramientas estándar (no se publican ficheros GGUF en el repositorio).
- Latencia y throughput: el autor reporta 5.398 tokens/s durante el entrenamiento en una T4 con lote efectivo de 16.384 tokens; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyStories Llama 60M (este) | 60,2M | 256 | 29,5M tokens vistos (0,49 tok/param), desde cero, TinyStories | CDLA-Sharing-1.0 | Hugging Face, safetensors |
| Modelos TinyStories del paper original (Eldan y Li, 2023) | Rangos de 1M a 33M (según el paper) | No disponible en la información proporcionada | Entrenados sobre TinyStories | No disponible en la información proporcionada | Publicados por los autores del paper; detalles concretos no verificados aquí |
| Llama 3.2 1B | 1.240M | 128K | No disponible en la información proporcionada | Llama 3.2 Community License | Hugging Face, safetensors, GGUF |

La comparación con los modelos del paper de TinyStories es la más pertinente por dominio y escala, pero esta ficha no dispone de sus especificaciones exactas verificadas; se indica por tanto de forma cualitativa. Frente a Llama 3.2 1B, este modelo es unas 20 veces menor, tiene un contexto 500 veces más corto y carece de ajuste por instrucciones, por lo que no son intercambiables en aplicaciones reales.

## Limitaciones y advertencias

- Infraentrenamiento severo: procesó el 2,45 % del presupuesto de tokens planificado y 0,49 tokens por parámetro frente a los ~20 de Chinchilla; la pérdida seguía bajando al terminar, por lo que la calidad es muy inferior a la que permitiría su tamaño.
- Contexto muy corto: 256 tokens limitan cualquier conversación multi-turno o documento largo; no admite prompts extensos.
- Dominio restringido: entrenado solo con TinyStories, genera cuentos simples; fuera de ese registro producirá texto incoherente o repetitivo.
- Solo inglés y vocabulario de 8.192 entradas: el rendimiento en otros idiomas es esencialmente nulo y la cobertura léxica es muy limitada incluso en inglés.
- Riesgo de alucinación y de contenido sin sentido: al ser un modelo base pequeño y poco entrenado, no hay garantía de coherencia factual; no debe usarse para información veraz.
- Sin ajuste por instrucciones ni salvaguardas: no sigue instrucciones de forma fiable y no incorpora filtros de seguridad; puede generar contenido inapropiado si se le induce.
- Sesgos: los datos provienen de historias sintéticas generadas por GPT-3.5 y GPT-4, por lo que hereda los sesgos de esos modelos y los del proceso de generación, sin que el autor documente evaluaciones de sesgo.
- Licencia CDLA-Sharing-1.0: permite uso y modificación con obligaciones de compartición de obras derivadas bajo la misma licencia; conviene revisar los términos antes de un uso comercial.
- Sin datos de benchmarks: no hay métricas publicadas de calidad, por lo que cualquier evaluación comparativa debe realizarse por el usuario.
- Fecha de creación en el repositorio (2026-11-15) y software declarado (PyTorch 2.14.1) poco habituales; verificar la integridad del checkpoint antes de usarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LayanSh1/tinystories-llama-60m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de leyes de escala (Kaplan et al., 2020): https://arxiv.org/abs/2203.15556 (referenciado en los tags como arxiv:2203.15556)
- Paper de TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759 (referenciado en los tags como arxiv:2305.07759)
