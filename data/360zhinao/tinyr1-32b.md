# 360ZhiNao/TinyR1-32B

## Resumen

TinyR1-32B es un ajuste fino (SFT) del modelo DeepSeek-R1-Distill-Qwen-32B desarrollado por el equipo 360 (Qihoo 360) en colaboración con la Universidad de Pekín (PKU). El modelo parte de la arquitectura Qwen2 de 32.763.876.352 parámetros y se entrena sobre el destilado de razonamiento de DeepSeek-R1, con el objetivo de resolver el compromiso clásico entre utilidad (helpfulness) y seguridad (harmlessness) en modelos de razonamiento.

La innovación principal es el denominado método de "Control Token" o "Magic-Token-Guided Co-Training": se introducen señales de control en los datos de entrenamiento que permiten al modelo conmutar dinámicamente entre modos de comportamiento (razonamiento matemático/científico, adherencia estricta a instrucciones y modo de seguridad positiva) según el tipo de tarea. Según el autor, con solo 20.000 muestras de alta calidad y tres rondas de SFT, el modelo supera a Qwen3-32B en las dimensiones evaluadas y alcanza el 94 % del rendimiento de DeepSeek-R1-0528 en tareas de razonamiento, con una puntuación de seguridad constructiva cercana a 90.

El modelo es relevante porque demuestra que un ajuste fino pequeño y selectivo sobre un destilado de 32B puede mejorar simultáneamente razonamiento, seguimiento de instrucciones y seguridad, sin necesidad de reentrenar desde cero ni de recurrir a modelos de centenares de miles de millones de parámetros. Se distribuye con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basada en DeepSeek-R1-Distill-Qwen-32B |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2-32B; el autor no la especifica) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar; al ser Qwen2 es compatible con cuantizaciones habituales tipo GGUF/AWQ, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal estándar, heredado directamente de DeepSeek-R1-Distill-Qwen-32B, que a su vez es un destilado de razonamiento de DeepSeek-R1 sobre la base Qwen2-32B. No se trata de un modelo MoE ni de una arquitectura híbrida: son 32.763.876.352 parámetros densos. El entrenamiento realizado por el equipo 360 consiste en tres rondas de SFT sobre 20.000 muestras de alta calidad, sin que se documenten en la información disponible detalles sobre el volumen total de tokens, la composición exacta del dataset ni el uso de RLHF o DPO.

La innovación técnica destacable es el método de Control Token (referenciado en el paper arXiv:2508.14904, "Efficient Switchable Safety Control in LLMs via Magic-Token-Guided Co-Training"). Se introducen tokens de control en los datos de entrenamiento que actúan como señales de modo, de forma que el modelo puede alternar entre comportamiento de razonamiento, de adherencia estricta a instrucciones y de seguridad positiva. El autor indica que el modelo soporta además un modo "no_think" que se activa añadiendo `/no_think` en el contenido del usuario, lo que permite desactivar la cadena de razonamiento extendida cuando no es necesaria.

## Capacidades

- Razonamiento matemático y científico paso a paso, con salida de la respuesta final dentro de `\boxed{}` cuando se usa el system prompt correspondiente.
- Razonamiento de código, evaluado en LiveCodeBench (LCB V5) con una puntuación de 70,4.
- Seguimiento estricto de instrucciones (IFEval Prompt Strict) con una puntuación de 89,2.
- Modo de seguridad positiva ("Safety Mode: Positive") orientado a respuestas constructivas y no meramente de rechazo.
- Modo de adherencia estricta a instrucciones ("Adherence mode: Strict adherence") para tareas de formato y restricciones.
- Modo "no_think" mediante la inserción de `/no_think` en el mensaje del usuario, para respuestas sin cadena de razonamiento extendida.
- Conmutación dinámica entre modos mediante el mecanismo de Control Token.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada (el razonamiento paso a paso está documentado, pero no un framework de agentes).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado para razonar paso a paso y entregar la respuesta final en `\boxed{}`, lo que lo hace adecuado para asistentes de estudio, generación de soluciones verificables y tutoría automatizada en cálculo, álgebra o física.
- Generación y revisión de código con razonamiento: con una puntuación de 70,4 en LiveCodeBench V5, puede emplearse en tareas de resolución de problemas algorítmicos, explicación de código y generación de parches razonados en entornos de desarrollo.
- Cumplimiento estricto de formato e instrucciones: gracias al modo "Adherence mode: Strict adherence" y su 89,2 en IFEval, es adecuado para pipelines que exigen salidas con formato fijo (JSON, plantillas, restricciones de longitud o de estructura).
- Moderación y asistencia con seguridad constructiva: el modo "Safety Mode: Positive" permite construir sistemas de atención al usuario que no solo rechazan contenido dañino, sino que ofrecen alternativas positivas, útil en plataformas comunitarias y chatbots de soporte.
- Asistentes de razonamiento con latencia controlada: el modo `/no_think` permite desactivar la cadena de razonamiento larga en consultas simples, reduciendo el coste de generación en aplicaciones interactivas donde no se requiere razonamiento profundo.
- Evaluación comparativa de modelos de razonamiento: al ser un ajuste fino pequeño y reproducible sobre un destilado conocido, sirve como referencia para estudiar el efecto del SFT selectivo sobre razonamiento y seguridad en entornos de investigación.
- Despliegue en infraestructura propia: al ser un modelo denso de 32B con licencia Apache 2.0, puede alojarse en clústeres de GPU de gama alta para aplicaciones internas que requieran control total sobre los datos y el comportamiento del modelo.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Tamano | AIME24 | AIME25 | GPQA-Diamond | LCB (V5) | IFEval (Prompt Strict) | OpenSource Safety | InHouse Safety |
|---|---|---|---|---|---|---|---|---|
| DeepSeek R1-0528 | 671B | 91,4 | 87,5 | 81,0 | 73,3 | 80,9 | 73,0 | 69,3 |
| Qwen3-235B-A22B-Thinking-2507 | 235B | - | 92,3 | 81,1 | 74,1 | 87,7 | 65,5 | 56,2 |
| Qwen3-32B | 32B | 81,4 | 72,9 | 68,4 | 65,7 | 85,0 | 64,5 | 55,8 |
| TinyR1-32B (Ours) | 32B | 90,9 | 82,7 | 69,4 | 70,4 | 89,2 | 89,5 | 86,5 |

Notas del autor: "Constructive Safety" se evalúa como media en Harmbench, JBB-Behaviors, S-Eval_attack y WildJailbreak; "InHouse" es un benchmark interno de seguridad adversarial; LCB corresponde a LiveCodeBench. El autor afirma que el modelo alcanza el 94 % del rendimiento de DeepSeek-R1-0528 en matemáticas, ciencia y código.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 65,5 GB de pesos, por lo que se necesitan al menos 2 GPU de 40 GB o una GPU de 80 GB (A100 80GB, H100 80GB) para cargar el modelo sin cuantizar.
- Cuantización a 8 bits: en torno a 33-35 GB de VRAM, viable en una A100 40GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: en torno a 17-20 GB de VRAM, lo que permite ejecución en una única RTX 4090 (24 GB) o RTX 3090, con margen limitado para el contexto.
- GPU recomendadas: A100 80GB o H100 80GB para BF16; A100 40GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 para 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en RTX 4090/3090; en 8 bits requiere dos GPU de consumo o una GPU profesional de 40 GB.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. No se documentan en la información disponible integraciones específicas con vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo Qwen2 en safetensors es compatible con los runners habituales que soportan dicha arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME25 | GPQA-Diamond | LCB (V5) | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| TinyR1-32B | 32B | no disponible | 82,7 | 69,4 | 70,4 | 89,2 | Apache 2.0 | Hugging Face |
| Qwen3-32B | 32B | no disponible en la informacion | 72,9 | 68,4 | 65,7 | 85,0 | no disponible en la informacion | Hugging Face |
| DeepSeek R1-0528 | 671B | no disponible en la informacion | 87,5 | 81,0 | 73,3 | 80,9 | no disponible en la informacion | Hugging Face |
| Qwen3-235B-A22B-Thinking-2507 | 235B (22B activos) | no disponible en la informacion | 92,3 | 81,1 | 74,1 | 87,7 | no disponible en la informacion | Hugging Face |

Frente a Qwen3-32B, TinyR1-32B mejora en AIME25 (+9,8), GPQA-Diamond (+1,0), LCB V5 (+4,7), IFEval (+4,2) y seguridad (OpenSource 89,5 frente a 64,5). Frente a DeepSeek-R1-0528, se queda por debajo en AIME24 (-0,5), AIME25 (-4,8), GPQA-Diamond (-11,6) y LCB (-2,9), pero supera claramente en IFEval (+8,3) y en seguridad (89,5 frente a 73,0). La ventaja principal es la relación rendimiento/tamaño: ofrece cifras cercanas a modelos de 235B y 671B con solo 32B de parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al derivar de Qwen2 y DeepSeek-R1, puede heredar sesgos de sus datasets de entrenamiento originales.
- Riesgo de alucinación: no se cuantifica en la información disponible; como todo modelo generativo de razonamiento, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente fuera de dominios matemáticos y científicos.
- Limitaciones de contexto e idioma: el autor no especifica la longitud de contexto efectiva ni los idiomas soportados; la ficha no puede confirmar el rendimiento multilingüe.
- Dependencia de system prompts: el rendimiento reportado depende de usar los system prompts específicos ("Please reason step by step...", "Adherence mode: Strict adherence", "Safety Mode: Positive"); sin ellos, el comportamiento puede diferir del evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias del modelo base (DeepSeek-R1-Distill-Qwen-32B) y de los datos de destilado, ya que podrían imponer condiciones adicionales.
- Madurez del artefacto: el repositorio se creó y actualizó el 2026-11-14, con 0 descargas y 0 likes en el momento de la consulta; es un lanzamiento reciente con poca validación externa.
- Trazabilidad de benchmarks: las puntuaciones de seguridad "OpenSource" e "InHouse" proceden del propio autor y no se detallan las metodologías completas en la model card.
- Modo "no_think": requiere insertar `/no_think` manualmente; no se documenta su comportamiento en todos los tipos de consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/360ZhiNao/TinyR1-32B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- Modelo relacionado de seguridad (TinyR1-Safety-8B): https://huggingface.co/qihoo360/TinyR1-Safety-8B
- Paper del método de Control Token: https://arxiv.org/abs/2508.14904
- Repositorio alternativo referenciado en el código de ejemplo: https://huggingface.co/qihoo360/TinyR1-32B
