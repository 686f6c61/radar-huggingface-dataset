# DennisKoshta/upbringing-qwen2.5-3b-countdown-grpo

## Resumen

`upbringing-qwen2.5-3b-countdown-grpo` es un artefacto de investigación publicado por DennisKoshta dentro del proyecto Upbringing, un experimento divulgativo sobre post-entrenamiento de modelos de lenguaje. Se trata de un ajuste fino del modelo base Qwen2.5-3B (3.397.103.616 parámetros reales según safetensors) obtenido tras 900 pasos de GRPO (Group Relative Policy Optimization) con verificación programática sobre puzles de tipo Countdown, una tarea de aritmética combinatoria en la que hay que alcanzar un número objetivo combinando una lista de operandos con las cuatro operaciones básicas.

El objetivo del modelo no es el uso generalista, sino demostrar de forma reproducible cómo el aprendizaje por refuerzo con recompensas verificables (RLVR) puede transformar la capacidad de razonamiento aritmético de un modelo pequeño. El autor reporta una precisión por muestra en el conjunto de retención del 55,7 %, frente al 1,3 % del modelo base en la misma tarea, lo que supone una mejora de más de 40 puntos absolutos con un presupuesto de cómputo reducido.

Su relevancia actual es doble: por un lado, sirve como referencia práctica de que las recetas de RL con verificador funcionan incluso a escala de 3B parámetros; por otro, forma parte de un conjunto de materiales (sitio web, repositorio y configuraciones) pensados para que otros equipos reproduzcan y auditen el pipeline. Es un modelo de investigación, no un modelo listo para producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), derivado de Qwen/Qwen2.5-3B |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-3B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B: un transformer decoder-only con atención causal, normalización RMSNorm, embeddings rotatorios (RoPE) y sesgo de atención (QKV bias) característico de la familia Qwen2. El ajuste no modifica la topología de la red, sino únicamente los pesos mediante post-entrenamiento.

El entrenamiento consiste en 900 pasos de GRPO (una variante de optimización de política sin modelo crítico que estima ventajas relativas dentro de un grupo de respuestas muestreadas) aplicados sobre puzles de Countdown con un verificador programático. El verificador comprueba de forma determinista si la expresión generada alcanza el objetivo usando exactamente los operandos proporcionados, lo que convierte la tarea en un entorno RLVR (Reinforcement Learning with Verifiable Rewards) sin necesidad de modelo de recompensa aprendido. El autor califica el run como "budget-scaled" y remite al README del repositorio para los detalles de configuración, las desviaciones respecto a las recetas de referencia y las licencias de los modelos y datos de origen. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases previas de SFT o DPO.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-3B y marcada con el tag `conversational`.
- Razonamiento aritmético y combinatorio específicamente reforzado sobre puzles de Countdown: alcanzar un objetivo numérico combinando operandos con sumas, restas, multiplicaciones y divisiones.
- Capacidad de producir cadenas de razonamiento paso a paso antes de la respuesta final, inducida por el entrenamiento con recompensa verificable.
- Búsqueda exhaustiva dentro del espacio de expresiones aritméticas, con precisión reportada del 55,7 % por muestra en retención.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el único dominio documentado es Countdown.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking explícito, visión, audio): no disponible.

## Casos de uso

- Reproducción de pipelines RLVR: el modelo sirve como punto de comparación directo para validar implementaciones propias de GRPO con verificador programático, ya que el autor publica configuración y evaluación junto a los pesos.
- Investigación en post-entrenamiento a bajo presupuesto: permite estudiar cómo evoluciona la precisión en una tarea verificable a lo largo de 900 pasos de RL sin necesidad de clústeres grandes, dado el tamaño de 3,4B parámetros.
- Generación de datos sintéticos de razonamiento: se pueden muestrear soluciones correctas de Countdown para construir datasets de cadenas de razonamiento verificadas y usarlas después para entrenar o evaluar modelos mayores.
- Estudio de mecánicas de recompensa: al ser un entorno con verificador determinista, es un banco de pruebas controlado para analizar colapso de entropía, longitud de cadena de razonamiento y recompensa por formato.
- Desarrollo de tutores aritméticos acotados: en un dominio restringido de puzles numéricos, el modelo puede generar soluciones y explicaciones paso a paso, siempre con verificación externa obligatoria dado su 55,7 % de acierto.
- Evaluación comparativa de recetas: al existir variantes públicas equivalentes (por ejemplo, versiones basadas en Qwen2.5-3B-Instruct entrenadas con TRL), permite aislar el efecto de la receta y del modelo de partida.
- Docencia y material divulgativo: el sitio y el repositorio asociados lo convierten en un ejemplo autocontenido para explicar qué es RLVR y cómo se mide.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Qwen2.5-3B (base) |
|---|---|---|
| Countdown, precisión por muestra (conjunto de retención) | 55,7 % | 1,3 % |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K u otras evaluaciones estandar. El único dato numérico reportado por el autor es el de la tabla anterior. Del resto de modelos comparables encontrados en la búsqueda web no se dispone de cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: alrededor de 6,8 GB solo de pesos, más activaciones y caché KV; en la práctica unos 8-10 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada en cuantización de 4 bits (si se generan pesos GGUF, no publicados por el autor): en torno a 2-2,5 GB de pesos.
- GPU recomendadas para fp16: NVIDIA RTX 3090, RTX 4090, A10G, L4, A100 o H100. Cualquier GPU con 12 GB o más de memoria dedicada debería ser suficiente.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) usando fp16 o cuantización.
- Opciones de despliegue: al estar etiquetado con `transformers`, `text-generation-inference` y `endpoints_compatible`, es desplegable con la librería Transformers y con TGI. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa. vLLM no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modelo base | Entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DennisKoshta/upbringing-qwen2.5-3b-countdown-grpo | 3,4B | Qwen/Qwen2.5-3B | 900 pasos de GRPO (RLVR) sobre Countdown | no disponible en la model card | no disponible | HuggingFace |
| philschmid/qwen-2.5-3b-r1-countdown | ~3,1B | Qwen/Qwen2.5-3B-Instruct | TRL + GRPO sobre Countdown | no disponible en la busqueda | no disponible | HuggingFace |
| leon2k2k2k/qwen2.5-3b-countdown-grpo | no disponible | Qwen2.5-3B (presumiblemente) | GRPO sobre Countdown | no disponible | no disponible | HuggingFace |
| binghe2727/qwen-2.5-3b-r1-countdown | ~3,1B | Qwen/Qwen2.5-3B-Instruct | TRL + GRPO sobre Countdown | no disponible | no disponible | HuggingFace y Featherless |

No se dispone de resultados de benchmarks comparables publicados en la información proporcionada para ninguno de los modelos alternativos, por lo que la comparación queda limitada a procedencia, tamaño y receta de entrenamiento.

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- La licencia no está declarada en la model card. Al derivar de Qwen2.5-3B, conviene verificar la licencia del modelo base (Qwen2.5-3B se distribuye habitualmente bajo Apache 2.0 para este tamaño, aunque el autor remite al repositorio para las licencias de los modelos y datos de origen). Sin confirmación explícita, no se debe asumir uso comercial libre.
- La precisión reportada del 55,7 % implica que casi la mitad de los intentos sobre puzles de retención son incorrectos: requiere verificación externa en cualquier uso real.
- El entrenamiento está especializado en Countdown; no hay datos que indiquen transferencia a otras tareas aritméticas, de código o de razonamiento general, y el ajuste intensivo en un dominio estrecho puede degradar capacidades generales del modelo base.
- Riesgo de alucinación elevado fuera del dominio entrenado: el modelo puede generar soluciones plausibles pero no verificables, especialmente si se le pide resolver problemas distintos de Countdown.
- Idiomas soportados no especificados; el entrenamiento con verificador programático probablemente se realizó en un único idioma, sin garantías multilingües.
- Longitud de contexto no especificada en la model card; la ventana efectiva heredada del modelo base puede verse alterada según la configuración de entrenamiento.
- Sesgos: no documentados por el autor. Al derivar de Qwen2.5-3B, hereda los sesgos del corpus de preentrenamiento de Qwen, no evaluados aquí.
- Ausencia de pesos cuantizados publicados: cada usuario debe generar sus propias conversiones (por ejemplo, a GGUF) si quiere desplegar en entornos de baja VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DennisKoshta/upbringing-qwen2.5-3b-countdown-grpo
- Sitio del proyecto Upbringing: https://denniskoshta.github.io/upbringing/
- Repositorio con código, configuraciones y evaluación: https://github.com/DennisKoshta/upbringing
- Plan del proyecto: https://github.com/DennisKoshta/upbringing/blob/main/PLAN.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Alternativa comparable (philschmid/qwen-2.5-3b-r1-countdown): https://huggingface.co/philschmid/qwen-2.5-3b-r1-countdown
- Alternativa comparable (leon2k2k2k/qwen2.5-3b-countdown-grpo): https://huggingface.co/leon2k2k2k/qwen2.5-3b-countdown-grpo
- Ficha en Toolify de philschmid/qwen-2.5-3b-r1-countdown: https://www.toolify.ai/ai-model/philschmid-qwen-2-5-3b-r1-countdown
- Despliegue de binghe2727/qwen-2.5-3b-r1-countdown en Featherless: https://featherless.ai/models/binghe2727/qwen-2.5-3b-r1-countdown
