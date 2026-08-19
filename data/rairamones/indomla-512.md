# RaiRamones/indomla-512

## Resumen

IndoMLA-512 es un modelo de lenguaje base (base model) de tipo decoder-only, desarrollado por RaiRamones como parte de un proyecto de investigación denominado *IndoChat-Scratch*. Se trata de un checkpoint temprano de preentrenamiento (paso 30.000 de 178.000 planificados) de un modelo de 142,8 millones de parámetros entrenado completamente desde cero, incluido su tokenizador, sobre un corpus centrado en indonesio. Su objetivo principal es estudiar el comportamiento de la atención multi-cabeza con latencia latente (MLA-inspired) en modelos pequeños entrenados con recursos de GPU de consumo.

El modelo implementa una arquitectura Transformer con atención inspirada en Multi-Head Latent Attention (MLA), comprimiendo las claves y valores en una representación latente compartida, junto con embeddings rotatorios desacoplados (decoupled RoPE). Con una ventana de contexto de 512 tokens y un vocabulario BPE de 16.000 entradas, está pensado para investigación sobre modelado del lenguaje indonesio y comparación de arquitecturas de atención eficientes. Su licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo reside en que es un experimento controlado que compara atención estándar (MHA) con atención MLA-inspired bajo condiciones de entrenamiento idénticas, con el objetivo de evaluar si la compresión latente ofrece ventajas reales en calidad, memoria o velocidad en modelos pequeños. Es un checkpoint intermedio, por lo que su rendimiento no es representativo de un modelo completamente entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención MLA-inspired y RoPE desacoplado |
| Parametros totales | 142.825.088 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16) |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer decoder-only estándar con 14 capas, cada una compuesta por RMSNorm, atención MLA-inspired con RoPE desacoplado, red feed-forward SwiGLU y conexiones residuales pre-norm. La atención MLA comprime las claves y valores en un espacio latente de rango 448 (la mitad del tamaño oculto de 896), y las consultas también pasan por un cuello de botella de rango 448. Cada cabeza tiene una dimensión de 64, dividida en 32 dimensiones de contenido (NoPE) y 32 de posición (RoPE). La clave rotatoria se comparte entre las 14 cabezas, lo que reduce el tamaño de la caché KV a 480 valores por token y capa (448 latentes + 32 rotatorios).

El entrenamiento se realizó desde cero con un tokenizador BPE byte-level personalizado de 16.000 entradas, sobre un corpus indonesio compuesto por CulturaX y Wikipedia. Se procesaron aproximadamente 1.970 millones de tokens en el checkpoint actual, lo que representa un 16,9% del plan total de entrenamiento (178.000 pasos). No se menciona el uso de RLHF, DPO ni ningún ajuste por instrucciones; es un modelo base puramente causal. La implementación está hecha manualmente en PyTorch, no derivada de un modelo preentrenado existente.

## Capacidades

- Generación de texto causal en indonesio: dado un prompt, produce continuación de texto autoregresiva.
- Modelado del lenguaje: puede usarse para calcular perplexidad o extraer representaciones ocultas para tareas de PLN.
- Investigación en arquitecturas de atención: permite comparar directamente MHA vs MLA-inspired bajo configuraciones controladas.
- Entrenamiento desde cero: incluye tokenizador propio, útil para estudiar el impacto del vocabulario en el rendimiento.
- Soporte de tool calling: no disponible (modelo base sin entrenamiento para funciones).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin ajuste por instrucciones).
- Capacidades multilingües: no, está especializado en indonesio.
- Modo de pensamiento, visión o audio: no aplica.

## Casos de uso

- Investigación académica sobre eficiencia de atención: el modelo permite analizar si la compresión latente de MLA reduce el uso de memoria de la caché KV y si afecta a la calidad del lenguaje en modelos pequeños, comparándolo con un gemelo MHA del mismo tamaño.
- Estudio de tokenización para indonesio: al entrenar un tokenizador BPE desde cero, se puede evaluar cómo el vocabulario de 16K entradas afecta a la compresión y al modelado del idioma.
- Generación de texto experimental en indonesio: aunque es un checkpoint temprano, puede generar texto coherente en frases cortas, útil para prototipos de demostración o análisis cualitativo.
- Fine-tuning para tareas específicas en indonesio: al ser un modelo base, puede ajustarse para clasificación de texto, análisis de sentimiento o generación de respuestas, siempre que se respete el límite de 512 tokens.
- Evaluación de escalabilidad de MLA: sirve como punto de referencia para determinar si las ventajas de MLA observadas en modelos grandes (como DeepSeek) se mantienen en la escala de 150M parámetros.
- Desarrollo de modelos de lenguaje eficientes para GPU de consumo: el proyecto documenta cómo entrenar un modelo desde cero en hardware limitado, lo que puede servir de guía para otros investigadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un checkpoint intermedio al 16,9% del entrenamiento planificado, por lo que cualquier métrica de rendimiento sería prematura y no representativa de su capacidad final.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Dado el tamaño del modelo (142,8M parámetros), se pueden hacer estimaciones orientativas:

- VRAM estimada para inferencia: con precisión bfloat16, los pesos ocupan aproximadamente 286 MB. Con la caché KV latente (480 valores por token y capa) y overhead de activaciones, la VRAM total necesaria sería inferior a 1 GB para contexto de 512 tokens.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM sería suficiente (por ejemplo, GTX 1650, RTX 3050, etc.). También funciona en CPU con llama.cpp, aunque más lento.
- Opciones de despliegue: al ser un modelo estándar de PyTorch, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se indica compatibilidad explícita, pero la arquitectura es convencional.
- Latencia y throughput: no disponibles. En una GPU moderna, se espera una latencia baja dado el pequeño tamaño, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de tamaño similar entrenados específicamente para indonesio. El proyecto menciona un gemelo con atención MHA estándar (IndoMHA-512, presumiblemente) pero no se proporcionan datos de rendimiento comparativo en la información disponible. Modelos generales de ~150M como GPT-2 pequeño o Pythia-160M existen, pero no están especializados en indonesio y no son comparables directamente por licencia, tokenizador o arquitectura.

## Limitaciones y advertencias

- Checkpoint temprano: solo ha completado el 16,9% del entrenamiento planificado, por lo que su calidad de generación es limitada y puede producir texto incoherente o repetitivo.
- Contexto muy corto: 512 tokens, insuficiente para tareas que requieran contexto largo como resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Idioma limitado: solo indonesio; no soporta otros idiomas.
- Modelo base sin instrucciones: no está ajustado para seguir instrucciones ni para tareas de chat; requiere fine-tuning para uso práctico.
- Riesgo de alucinación y sesgos: al ser un modelo pequeño entrenado en una fracción de los datos, puede generar afirmaciones falsas o reflejar sesgos presentes en el corpus de CulturaX y Wikipedia.
- Sin garantías de producción: es un modelo de investigación, no validado para entornos productivos.
- Formato de pesos no confirmado: no se especifica si los pesos están en safetensors, binario de PyTorch u otro formato, lo que puede afectar a la compatibilidad con herramientas de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RaiRamones/indomla-512
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- Dataset Wikipedia (wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Proyecto de investigación mencionado: "IndoChat-Scratch: A Consumer-GPU Study of MHA and MLA-Inspired 150M-Parameter Decoder-Only Language Models for Indonesian" (sin URL pública en la información disponible).
