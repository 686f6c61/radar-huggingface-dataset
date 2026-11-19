# iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage2

## Resumen

Qwen2.5-Scratch-EN-0.5B-PT-stage2 es un modelo de lenguaje decoder-only de tipo base, desarrollado por el usuario iamtatsuki05 dentro del proyecto MIREI, que continúa el preentrenamiento del checkpoint stage1 de la misma familia. Está construido sobre la arquitectura Qwen2.5 con 630.167.424 parámetros reales (etiquetado comercialmente como "0.5B"), dimensión de embedding de 896 y un tokenizador Qwen2.5 con vocabulario de 151.936 tokens. Su propósito es servir como backbone generativo en inglés tras observar aproximadamente 1.000 millones de tokens del corpus google/wiki40b.

La relevancia de este checkpoint es fundamentalmente metodológica: forma parte de una serie controlada que compara recetas de preentrenamiento idénticas sobre arquitecturas distintas (Mistral y Qwen2.5), lo que lo convierte en una pieza útil para investigación comparativa de arquitecturas y para experimentos de embedding y generación, no para despliegues de producción. No ha pasado por fases de ajuste fino supervisado, RLHF ni DPO, por lo que es un modelo estrictamente de continuación de texto.

El modelo se distribuye con licencia MIT, pesos en safetensors y compatibilidad con transformers, text-generation-inference y endpoints. Su ventana máxima de secuencia es de 32.768 tokens según la model card, aunque el preentrenamiento se realizó con contextos de 8.192 tokens. Con solo 3 descargas registradas, se trata de un artefacto de investigación de nicho y no de un modelo con adopción comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder-only, atención causal con RoPE) |
| Parametros totales | 630.167.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (máximo según model card); preentrenado con ventanas de 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 896 |
| Tamano del vocabulario | 151.936 (tokenizador Qwen2.5) |
| Codificacion posicional | RoPE |
| Tamano del repositorio | 1,3 GB |
| Libreria | transformers (>=4.51.0), accelerate (>=1.6.0), sentencepiece (>=0.2.0), flash-attn (>=2.7.3) |
| Dataset de entrenamiento | google/wiki40b |
| Modelo base | iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage1 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2.5, un transformer decoder-only con atención causal, codificación posicional rotatoria (RoPE) y una dimensión oculta de 896. El tokenizador es el nativo de Qwen2.5, con un vocabulario de 151.936 entradas, lo que permite reutilizar infraestructura y herramientas del ecosistema Qwen. El checkpoint declara una longitud máxima de secuencia de 32.768 tokens, si bien el entrenamiento se llevó a cabo con ventanas de contexto de 8.192 tokens, por lo que el rendimiento más allá de esa longitud no está validado por el autor.

El entrenamiento consiste en una continuación de preentrenamiento (stage2) sobre el checkpoint stage1, usando el corpus google/wiki40b y observando aproximadamente 1.000 millones de tokens. No se documenta en la información disponible la composición exacta del dataset más allá del nombre del corpus, ni el número total de tokens de la fase stage1, ni si hubo fases de ajuste supervisado, RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. La receta de entrenamiento es compartida con el checkpoint Mistral-EN-0.5B-PT-stage2 de la misma serie, lo que sugiere un diseño experimental orientado a comparar arquitecturas bajo condiciones idénticas.

## Capacidades

- Generación de texto en inglés: continuación de prompts y generación libre con decodificación por muestreo (temperature, top_p).
- Modelo base sin instrucciones: no está ajustado para seguir instrucciones, responder preguntas ni mantener formato conversacional.
- Razonamiento y matemáticas: capacidad emergente limitada por el tamaño (630 M de parámetros) y por el volumen de preentrenamiento (aproximadamente 1.000 millones de tokens); no se documentan evaluaciones.
- Código: no se documenta soporte específico ni evaluación en tareas de programación.
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no ha sido entrenado para ello.
- Capacidades multilingües: únicamente inglés según la model card.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), visión ni audio.
- Infraestructura: compatible con transformers, text-generation-inference y endpoints; soporta flash-attention 2 y carga en bfloat16 con device_map automático.

## Casos de uso

- Investigación comparativa de arquitecturas: al compartir receta de entrenamiento con el checkpoint Mistral de la misma serie, permite aislar el efecto de la arquitectura (Qwen2.5 frente a Mistral) sobre las mismas 1.000 millones de tokens de wiki40b, útil para estudios académicos de análisis arquitectural.
- Experimentos de embedding y representaciones internas: la dimensión de 896 y el vocabulario de 151.936 tokens lo hacen adecuado para analizar cómo se estructuran las representaciones en modelos pequeños, tal como sugiere la propia cita del proyecto MIREI sobre embeddings encoder/decoder.
- Prototipado rápido de pipelines de generación: con 630 M de parámetros y pesos en safetensors, se puede cargar en una GPU de consumo para validar código de inferencia, tokenización y formateo antes de escalar a modelos mayores.
- Generación de texto de dominio general en inglés: continuación de artículos, párrafos descriptivos o texto enciclopédico, aprovechando el entrenamiento sobre wiki40b, que proviene de Wikipedia en inglés.
- Baseline en experimentos de ajuste fino: sirve como punto de partida para SFT o DPO en tareas concretas en inglés, dado que es un checkpoint base limpio sin sesgo de instrucciones.
- Evaluación de técnicas de cuantización y despliegue: permite medir latencia, throughput y degradación de calidad al cuantizar un modelo de 630 M en distintos formatos y compararlo con el checkpoint Mistral equivalente.
- Docencia y formación: ejemplo reproducible de preentrenamiento desde cero y continuación de preentrenamiento con contextos de 8.192 tokens, útil en cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3 GB solo para pesos (630 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,7 GB para pesos; en 4 bits, alrededor de 0,4 GB (estimaciones teóricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en bfloat16; A100, H100, L40S o RTX 4090 para mayor throughput; RTX 3060, RTX 4060 o RTX 4090 para uso en consumer.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM en bfloat16, y en GPUs de 2-4 GB con cuantización.
- Opciones de despliegue: transformers con accelerate y flash-attention 2 (soporte documentado), text-generation-inference y endpoints (según los tags del repositorio). Para llama.cpp, Ollama o vLLM no hay confirmación en la información disponible, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles; no se documentan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Scratch-EN-0.5B-PT-stage2 (este) | 630.167.424 | 32.768 (entrenado a 8.192) | en | MIT | Base preentrenado sobre wiki40b, ~1B tokens |
| iamtatsuki05/Mistral-EN-0.5B-PT-stage2 | no disponible en la informacion | 8.192 (misma receta) | en | no disponible en la informacion | Misma receta y dataset, arquitectura Mistral; comparación directa de arquitecturas |
| Qwen2.5-0.5B (oficial de Alibaba) | ~0,49 B | 32.768 | multilingüe | Apache 2.0 | Modelo instructivo y base oficial, con fases de alineamiento y amplia adopción |
| SmolLM-135M / SmolLM-360M (Hugging Face) | 135 M / 360 M | 2.048 | en | Apache 2.0 | Alternativas pequeñas para prototipado; menor contexto |

La comparación con Qwen2.5-0.5B oficial es la más relevante: este checkpoint comparte arquitectura y tokenizador, pero se ha reentrenado desde cero sobre un corpus distinto y sin fases de alineamiento, por lo que no es un sustituto directo del modelo oficial en tareas de instrucción.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo: no sigue instrucciones, no responde preguntas de forma fiable y puede generar continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinación: con 630 M de parámetros y aproximadamente 1.000 millones de tokens vistos, la cobertura factual es muy limitada.
- Sesgos: el entrenamiento sobre Wikipedia en inglés puede introducir sesgos de dominio, de género y de perspectiva occidental; no se documentan análisis de sesgo.
- Limitación de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto: aunque la model card declara 32.768 tokens, el entrenamiento se realizó con 8.192, por lo que el rendimiento en secuencias más largas no está validado.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Adopción mínima: 3 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni evaluaciones independientes.
- Sin datos de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas, por lo que no debe asumirse rendimiento competitivo frente a modelos oficiales de tamaño similar.
- Requiere versiones específicas de dependencias (transformers >= 4.51.0, flash-attn >= 2.7.3), lo que puede complicar la integración en entornos con versiones fijadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage2
- Modelo base (stage1): https://huggingface.co/iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage1
- Checkpoint Mistral de la misma serie: https://huggingface.co/iamtatsuki05/Mistral-EN-0.5B-PT-stage2
- Colección MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto: https://github.com/iamtatsuki05/MIREI
- Dataset google/wiki40b: https://huggingface.co/datasets/google/wiki40b
- Licencia MIT: https://opensource.org/license/mit/
