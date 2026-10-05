# AryanK123/Llama-3.2-1B-GRPO-DeepMath-01-berta

## Resumen

Llama-3.2-1B-GRPO-DeepMath-01-berta es un ajuste fino del modelo AryanK123/Llama-3.2-1B-Instruct_SFT_Math-220kv00.04, que a su vez deriva de Llama 3.2 1B Instruct de Meta. El autor es el usuario AryanK123, que lo publica en HuggingFace como un experimento de entrenamiento con GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo presentada en el artículo DeepSeekMath. El objetivo declarado por la nomenclatura es mejorar el razonamiento matemático de un modelo pequeno de 1B parámetros mediante RL sobre respuestas verificables, no mediante ajuste supervisado adicional.

El modelo tiene un interés fundamentalmente experimental: es un ejemplo de cómo aplicar GRPO a un modelo de 1B parámetros usando la librería TRL, un caso que hasta hace poco se limitaba a modelos de 7B o superiores. Para desarrolladores e investigadores, resulta relevante como referencia reproducible de un pipeline de RL ligero, no como modelo listo para producción: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no documenta los datos de entrenamiento ni hiperparámetros, y no publica ninguna evaluación.

La arquitectura es la de Llama 3.2 1B, un transformer decoder-only denso de aproximadamente 1,24 mil millones de parámetros con ventana de contexto de 128 000 tokens en el modelo base. El autor no documenta ningún cambio estructural, por lo que se asume que el ajuste con GRPO sólo modifica los pesos. La model card se limita a indicar el modelo base, la librería de entrenamiento y las versiones de framework (TRL 1.14.1, Transformers 5.18.0, PyTorch 2.13.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso; arquitectura Llama 3.2 1B heredada del modelo base, sin modificaciones documentadas |
| Parametros totales | Aproximadamente 1,24 mil millones (valor del modelo base Llama 3.2 1B; la model card no lo confirma) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama 3.2 1B; no confirmado tras el ajuste con GRPO |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos en precisión de entrenamiento); no hay GGUF ni AWQ publicados por el autor |
| Idiomas soportados | No disponible. El modelo base Llama 3.2 1B declara oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible. La model card indica `licence: license` sin especificar términos; al derivar de Llama 3.2 se aplicaría presumiblemente la Llama 3.2 Community License |
| Formato de pesos | safetensors (etiqueta `safetensors` y `transformers`) |
| Modelo base | AryanK123/Llama-3.2-1B-Instruct_SFT_Math-220kv00.04 |
| Método de entrenamiento | GRPO mediante TRL |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-05 (según metadatos de HuggingFace) |
| Etiquetas | transformers, tensorboard, safetensors, generated_from_trainer, trl, grpo, arxiv:2402.03300, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B: un transformer decoder-only denso con 16 capas, dimensión de embedding de 2048, 32 cabezas de atención y 8 cabezas de clave/valor (GQA, Grouped Query Attention), dimensión de feed-forward de 8192 y vocabulario de 128 256 tokens. La atención usa RoPE y el modelo base fue entrenado por Meta con una ventana de contexto de 128 000 tokens. El autor no documenta ninguna variación sobre esta arquitectura; el repositorio se limita a publicar los pesos resultantes del proceso de RL.

El entrenamiento se realizó con GRPO, técnica introducida en DeepSeekMath (arXiv:2402.03300). GRPO estima la ventaja de cada respuesta dentro de un grupo de muestras generadas para la misma pregunta, evitando así la necesidad de un modelo crítico independiente como en PPO. Se ejecutó a través de TRL 1.14.1 sobre Transformers 5.18.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2. La model card no especifica el conjunto de datos empleado, el número de tokens de entrenamiento, la función de recompensa, la tasa de aprendizaje, el tamaño de grupo de GRPO ni la duración del entrenamiento. Tampoco se indica si hubo una fase posterior de DPO o de ajuste de instrucciones, ni si se aplicaron técnicas de decodificación especulativa.

El nombre del repositorio incluye el sufijo "berta" y la referencia "DeepMath", lo que sugiere el uso de un corpus de matemáticas, pero esto es una inferencia a partir de la nomenclatura y no un dato documentado por el autor.

## Capacidades

- Generación de texto conversacional: el modelo base es de tipo instruct y el ejemplo de uso de la model card emplea el pipeline de `text-generation` con mensajes en formato de rol (`{"role": "user", "content": ...}`).
- Razonamiento matemático: es la capacidad objetivo del ajuste con GRPO, orientado a problemas de tipo DeepMath. No hay evaluación publicada que cuantifique la mejora.
- Razonamiento multi-paso: GRPO se aplica sobre cadenas de razonamiento, por lo que el modelo está entrenado para producir pasos intermedios antes de la respuesta final.
- Tool calling / function calling: no documentado. El modelo base Llama 3.2 1B soporta llamadas a herramientas en su formato oficial de prompt, pero no hay confirmación de que esta capacidad se conserve tras el ajuste con GRPO.
- Uso como agente: no documentado.
- Capacidades multilingües: no documentadas para este ajuste. El modelo base declara 8 idiomas, pero un entrenamiento de RL centrado en matemáticas puede degradar el rendimiento en otras lenguas.
- Visión: no soportada. La variante de 1B de Llama 3.2 es exclusivamente texto; las capacidades de imagen se limitan a los tamaños 11B y 90B.
- Modo "thinking" explícito, audio o cualquier otra modalidad: no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como artefacto de estudio para reproducir un pipeline GRPO completo con TRL sobre un modelo de 1B parámetros, útil en entornos con un solo GPU.
- Ajuste de modelos pequeños para dominios verficables: sirve de plantilla para aplicar GRPO a tareas con recompensa automática (matemáticas, código con tests, extracción estructurada) sin necesidad de un modelo crítico.
- Prototipado con recursos limitados: con menos de 3 GB en FP16, permite experimentar con RL y con generación de texto matemático en portátiles con GPU de consumo.
- Generación de borradores de resolución de problemas matemáticos: puede emplearse como generador de cadenas de razonamiento candidatas que después se filtran con un verificador simbólico (por ejemplo, SymPy) antes de mostrarlas al usuario.
- Destilación y generación de datos sintéticos: al ser un modelo de 1B, es viable generar grandes volúmenes de razonamientos matemáticos a bajo coste para filtrarlos y usarlos en el entrenamiento de modelos mayores.
- Evaluación comparativa de métodos de RL: sirve como punto de comparación frente a otros ajustes del mismo modelo base (SFT, DPO, PPO) para medir el efecto de GRPO en modelos por debajo de 2B.
- Despliegue en el borde (edge): cuantizado a 4 bits ocupa menos de 1 GB de pesos, lo que permite ejecutarlo en dispositivos con memoria limitada para tareas de asistencia aritmética sencilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluación, no se han publicado métricas de GSM8K, MATH, MMLU, HumanEval ni de ningún otro conjunto, y el repositorio no tiene descargas ni discusiones que permitan contrastar cifras de terceros.

## Requisitos de hardware

- VRAM para pesos en FP16/BF16: aproximadamente 2,5 GB (1,24 B parámetros x 2 bytes).
- VRAM para pesos en INT8: aproximadamente 1,3 GB.
- VRAM para pesos en 4 bits: aproximadamente 0,7-0,9 GB.
- Caché KV: con GQA de 8 cabezas de clave/valor y dimensión de cabeza 64 en 16 capas, el coste es de unos 32 KB por token en FP16, es decir, unos 256 MB para 8 000 tokens de contexto y unos 4 GB para los 128 000 tokens máximos del modelo base. La memoria total escala de forma casi lineal con la longitud de contexto, no con el número de parámetros.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en contextos cortos. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes, pero en este rango de tamaño la GPU no es el cuello de botella.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 6-8 GB o más, incluso en FP16. También es viable en CPU con llama.cpp, aunque con latencia mucho mayor.
- Opciones de despliegue: la model card usa `transformers.pipeline` con `device_map="auto"`. El repositorio no publica pesos GGUF, por lo que su uso con llama.cpp u Ollama requiere una conversión manual. vLLM y TGI son compatibles al ser un modelo de arquitectura Llama, siempre que la versión instalada reconozca la arquitectura del modelo base.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.
- Nota: la librería Ollama ofrece el modelo base `llama3.2:1b`, que sirve como referencia de rendimiento en el mismo tamaño, pero no corresponde a este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Llama-3.2-1B-GRPO-DeepMath-01-berta | ~1,24 B | 128 000 (base) | No disponible | HuggingFace, 0 descargas | Sin datos publicados |
| Llama 3.2 1B Instruct (Meta) | 1,24 B | 128 000 | Llama 3.2 Community License | HuggingFace, Ollama, vLLM, TGI, llama.cpp | Evaluado por Meta en su model card oficial |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 | Apache 2.0 | HuggingFace, Ollama, vLLM | Evaluado por el equipo de Qwen |
| Gemma 2 2B-it | 2,61 B | 8 000 | Gemma Terms of Use | HuggingFace, Ollama, vLLM | Evaluado por Google DeepMind |

La diferencia principal entre este modelo y las alternativas comerciales no está en el rendimiento documentado, sino en el propósito: es un experimento de RL sobre matemáticas sin licencia ni evaluación, frente a modelos con licencia clara, contextos definidos y resultados publicados. Para uso en producción en tareas matemáticas en el rango de 1-3B, Qwen2.5-1.5B-Instruct y Gemma 2 2B-it ofrecen garantías legales y técnicas que este repositorio no proporciona.

## Limitaciones y advertencias

- Licencia no especificada: la model card declara `licence: license` sin texto. Esto impide determinar si el uso comercial está permitido. Al derivar de Llama 3.2, lo más probable es que se aplique la Llama 3.2 Community License, pero no está confirmado por el autor y el repositorio no incluye el archivo de licencia correspondiente.
- Sin evaluación: no hay benchmarks, ni comparación con el modelo base, ni validación de que GRPO haya mejorado realmente el razonamiento matemático. La mejora es un supuesto, no un dato.
- Riesgo alto de alucinación: un modelo de 1B parámetros tiene una capacidad limitada de razonamiento formal. Es esperable que produzca pasos matemáticos plausibles pero incorrectos, y que falle en problemas de varios pasos.
- Degradación potencial del modelo base: el RL sobre un dominio estrecho puede reducir la calidad de las respuestas generales y de la instrucción en tareas ajenas a las matemáticas. No hay evaluación que lo descarte.
- Falta de reproducibilidad: no se documentan el dataset, la función de recompensa, los hiperparámetros ni la duración del entrenamiento, por lo que el resultado no es reproducible.
- Idiomas: no hay información sobre el comportamiento multilingüe tras el ajuste. El entrenamiento matemático suele realizarse mayoritariamente en inglés.
- Tool calling y agentes: no documentados. Si un pipeline depende de llamadas a funciones, no debe asumirse que funcionan.
- Madurez del repositorio: 0 descargas, 0 likes, tamaño de repositorio de 0,0 GB según HuggingFace y etiqueta `generated_from_trainer` sin métricas. Conviene verificar que los pesos están completos antes de integrarlo.
- Metadatos anómalos: la fecha de creación indicada (2026-10-05) es posterior a la fecha habitual de publicación de ajustes de Llama 3.2, lo que puede indicar un error o una modificación manual de los metadatos.
- Contexto real de uso desconocido: aunque el modelo base soporta 128 000 tokens, no se sabe si el ajuste con GRPO conserva esa ventana sin degradación.
- Sin garantía de soporte: es un repositorio personal, sin mantenimiento ni canal de soporte documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AryanK123/Llama-3.2-1B-GRPO-DeepMath-01-berta
- Modelo base: https://huggingface.co/AryanK123/Llama-3.2-1B-Instruct_SFT_Math-220kv00.04
- Repositorio relacionado del mismo autor: https://huggingface.co/AryanK123/Llama-3.2-1B-GRPO-DeepMath-01
- Repositorio relacionado del mismo autor: https://huggingface.co/AryanK123/Llama-3.2-1B-GRPO-DeepMath
- Artículo de DeepSeekMath (GRPO): https://huggingface.co/papers/2402.03300
- Librería TRL: https://github.com/huggingface/trl
- Modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- Model cards y formatos de prompt de Llama 3.2: https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama3_2
- Modelo base Llama 3.2 1B en Ollama: https://ollama.com/library/llama3.2:1b
