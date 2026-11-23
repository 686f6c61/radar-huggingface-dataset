# CrowdMind/Blueberry-base

## Resumen

Blueberry-base es un modelo de lenguaje de tipo decoder-only con 125,8 millones de parámetros, desarrollado por Dustin Loring y publicado bajo el identificador CrowdMind/Blueberry-base. Su particularidad arquitectónica es que combina ocho bloques Transformer distintos, de los cuales los cuatro centrales se ejecutan tres veces reutilizando los mismos pesos, lo que da lugar a 16 ejecuciones de bloque en total. En cada frontera del bucle, una compuerta aprendida por token mezcla el estado que entra en la iteración con el de la pasada anterior. Esta variante de peso compartido con gate aprendido lo sitúa en la familia de modelos con "looped transformer" o razonamiento iterativo latente, una línea de investigación activa para aumentar la profundidad efectiva sin incrementar el número de parámetros.

El modelo es un checkpoint preentrenado de completado de texto, entrenado hasta el paso 1.280 sobre aproximadamente 336 millones de tokens y con una longitud de contexto de 2.048 tokens. Registró una pérdida de validación de 0,9651 bits por byte en esta etapa. Existe una versión afinada para chat publicada como CrowdMind/Blueberry.

Por su escala y su contexto, Blueberry-base no compite con los modelos de propósito general actuales: es una pieza de investigación y experimentación, útil para estudiar arquitecturas con reutilización de bloques, para tareas de completado cortas y para servir como base de fine-tuning en entornos con recursos muy limitados. Su relevancia ahora radica en que demuestra que es posible implementar mecanismos de profundidad recurrente en modelos pequeños y entrenables en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con 8 bloques distintos; los 4 centrales se ejecutan 3 veces con pesos compartidos (16 ejecuciones de bloque); compuerta aprendida por token en cada frontera del bucle |
| Parametros totales | 125.830.379 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,5 GB); requiere `trust_remote_code=True` y Transformers 5.24.0 |

## Arquitectura y entrenamiento

Blueberry-base es un transformer decoder-only con ocho bloques Transformer diferenciados. Los cuatro bloques intermedios se reutilizan tres veces cada uno, compartiendo pesos, de modo que el cómputo total equivale a 16 ejecuciones de bloque aunque solo existan ocho conjuntos de parámetros. Para evitar que la repetición degrade la representación, en cada frontera del bucle se aplica una compuerta aprendida por token que mezcla el estado de entrada a la iteración con el estado de la pasada anterior. Este diseño es una forma de profundidad recurrente con conexión residual condicionada, orientada a aumentar la capacidad efectiva del modelo sin multiplicar el número de parámetros.

El entrenamiento se realizó sobre aproximadamente 336 millones de tokens con un contexto de 2.048 tokens, hasta el paso 1.280, y alcanzó una pérdida de validación de 0,9651 bits por byte. No se documenta en la información disponible la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni detalles sobre tokenizador o vocabulario. El código de entrenamiento está disponible en el repositorio del proyecto Blueberry, que se apoya en NanoChat de Andrej Karpathy. La implementación del modelo se distribuye dentro del propio repositorio de Hugging Face mediante código personalizado, por lo que es necesario cargarlo con `trust_remote_code=True`.

## Capacidades

- Generación de texto y completado de secuencias cortas, que es la tarea para la que fue preentrenado.
- Razonamiento iterativo latente gracias a la reutilización de bloques con compuerta por token, que permite múltiples pasadas de cómputo sobre la misma representación.
- Base para fine-tuning: al ser un checkpoint preentrenado, está pensado como punto de partida para ajuste supervisado o para la versión de chat ya publicada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito más allá de la recurrencia interna.
- Capacidades multilingües: no disponible; no se especifican idiomas de entrenamiento.
- No se documentan capacidades de visión, audio, thinking mode explícito ni decodificación especulativa.

## Casos de uso

- Investigación en arquitecturas recurrentes: el modelo sirve para estudiar cómo afecta la reutilización de bloques con compuerta por token al rendimiento frente a un transformer de profundidad equivalente con pesos independientes, gracias a que el código de entrenamiento es público.
- Fine-tuning experimental en hardware de consumo: con 125,8 millones de parámetros y pesos en safetensors de 0,5 GB, es viable ajustarlo en una única GPU de gama media para tareas de clasificación o generación acotada.
- Completado de texto en dominios restringidos: tras un ajuste supervisado sobre un corpus específico (por ejemplo, documentación técnica o descripciones de producto), puede emplearse para autocompletar frases con un contexto de hasta 2.048 tokens.
- Docencia y reproducción de resultados: al estar construido sobre NanoChat y con código de entrenamiento disponible, es adecuado para cursos y talleres que expliquen el entrenamiento de modelos de lenguaje desde cero.
- Prototipado de pipelines de generación: sirve como modelo de prueba en entornos de desarrollo para validar integraciones con Transformers 5.24.0 antes de migrar a modelos mayores, dado su bajo coste de inferencia.
- Generación de texto creativo breve: cuentos cortos, eslóganes o descripciones de hasta unas pocas decenas de tokens, donde el contexto de 2.048 tokens es suficiente y la latencia importa más que la calidad absoluta.
- Base para la versión de chat: la variante CrowdMind/Blueberry permite experimentar con diálogo conversacional sin partir del preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación reportado por el autor es la pérdida de validación de 0,9651 bits por byte en el paso 1.280 del preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 0,5 GB para los pesos, más overhead de activaciones y del código personalizado; en la práctica, menos de 2 GB en total.
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB para los pesos, más overhead; cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU para inferencia puntual, dado el reducido tamaño.
- Cabe en GPU de consumo: sí, en todas las GPU consumer con al menos 4 GB de VRAM; incluso en iGPU y en CPU con suficiente RAM.
- Opciones de despliegue: Transformers 5.24.0 con `trust_remote_code=True` es la vía documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF o de una arquitectura estándar en la librería dificulta su uso en esos motores sin conversión manual.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por el tamaño, se espera una latencia de milisegundos por token en GPU consumer, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blueberry-base | 125,8 M | 2.048 | Decoder-only con 4 bloques reutilizados 3 veces y gate por token | no disponible | Hugging Face, safetensors, código personalizado |
| GPT-2 small | 124 M | 1.024 | Transformer decoder-only estándar | MIT (según publicación original) | Ampliamente disponible, incluido GGUF |
| SmolLM-135M | 135 M | 2.048 | Transformer decoder-only estándar | Apache 2.0 | Hugging Face, múltiples formatos |
| Pythia-160M | 160 M | 2.048 | Transformer decoder-only estándar | Apache 2.0 | Hugging Face, múltiples formatos |

La comparación se limita a la escala de parámetros, ya que no se han publicado benchmarks de Blueberry-base que permitan contrastar su rendimiento con estas alternativas. Frente a GPT-2 small, SmolLM-135M y Pythia-160M, Blueberry-base se diferencia por su arquitectura con reutilización de bloques, pero carece de la documentación de licencia, idiomas y formatos de cuantización que sí ofrecen los otros tres.

## Limitaciones y advertencias

- Es un modelo pequeño (125,8 millones de parámetros) y el propio autor advierte que puede generar texto inexacto o sesgado.
- Riesgo elevado de alucinación en tareas de conocimiento factual, coherente con su escala y con los 336 millones de tokens de entrenamiento.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- No se especifican los idiomas de entrenamiento; el rendimiento fuera del inglés es incierto y no está documentado.
- La licencia no está disponible, lo que impide determinar si se permite el uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- Requiere `trust_remote_code=True` y una versión concreta de Transformers (5.24.0), lo que implica ejecutar código del repositorio y añade riesgo de seguridad y de compatibilidad.
- No hay pesos cuantizados publicados ni soporte documentado en motores de inferencia estándar como vLLM, llama.cpp u Ollama, lo que complica el despliegue en producción.
- El checkpoint corresponde al paso 1.280 de preentrenamiento; no ha pasado por un proceso de alineación documentado (RLHF, DPO), por lo que puede producir contenido inapropiado.
- No se han publicado benchmarks estándar, por lo que no es posible evaluar su calidad frente a alternativas de tamaño similar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrowdMind/Blueberry-base
- Versión de chat: https://huggingface.co/CrowdMind/Blueberry
- Repositorio del proyecto Blueberry: https://github.com/blueberry-llm/blueberry
- NanoChat de Andrej Karpathy: https://github.com/karpathy/nanochat
