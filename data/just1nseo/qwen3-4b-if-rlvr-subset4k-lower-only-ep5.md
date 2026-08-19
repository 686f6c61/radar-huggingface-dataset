# just1nseo/qwen3-4b-if-rlvr-subset4k-lower-only-ep5

## Resumen
Este repositorio contiene los checkpoints de un experimento de fine-tuning sobre el modelo base Qwen/Qwen3-4B mediante RLVR (Reinforcement Learning with Verifiable Rewards). El autor, just1nseo, publica cuatro variantes de un mismo experimento de cinco épocas, todas ellas orientadas a estudiar el efecto del anclaje inferior (lower anchor) en la recompensa de instruction following. El modelo resultante es un transformer de 4.000 millones de parámetros con capacidad de razonamiento (thinking mode) heredada de Qwen3, y una ventana de contexto de 32.768 tokens. La relevancia de este trabajo radica en su carácter exploratorio: no es un modelo de producción, sino una herramienta para investigar cómo distintas estrategias de anclaje en RLVR afectan al comportamiento del modelo en tareas de seguimiento de instrucciones.

El fine-tuning se realizó sobre un subconjunto de 4.096 filas, con 8 rollouts por muestra, 2.048 tokens de prompt y 8.192 tokens de respuesta. Los cuatro experimentos difieren en la definición del extremo inferior del intervalo de recompensa y en el manejo de pares invertidos (flipped pairs). Todos los checkpoints se exportan en BF16 y están disponibles para su descarga. Dado que el repositorio no incluye métricas de evaluación ni benchmarks, su uso principal es la reproducción de experimentos y el análisis de metodologías de RL.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B base) |
| Parametros totales | 4.000 millones |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen3-4B) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints BF16) |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta multiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo base es Qwen3-4B, un transformer denso con 4.000 millones de parámetros y una ventana de contexto de 32.768 tokens. Qwen3 incorpora un mecanismo de "thinking mode" que permite al modelo generar una cadena de razonamiento antes de la respuesta final, activable o desactivable según el prompt. El fine-tuning se realiza mediante RLVR, una variante de aprendizaje por refuerzo que utiliza recompensas verificables (por ejemplo, corrección de formato o de contenido) en lugar de recompensas aprendidas. En este experimento, la recompensa se define sobre el seguimiento de instrucciones y se aplica un intervalo de confianza (95%) para el anclaje inferior.

El entrenamiento usa 4.096 filas, batch de 256, 16 pasos por época y 5 épocas, con una tasa de aprendizaje de 1e-6. Se generan 8 rollouts por muestra con temperatura 1.0, top-p 0.95 y top-k 20. Los cuatro experimentos varían en el cálculo del extremo inferior del intervalo de recompensa: dos usan una distribución t de Student con 95% de confianza y dos usan una ampliación del 10% sobre la media del NLL. Además, dos variantes aplican "anchor abstention", es decir, los pares invertidos que persisten tras el anclaje no reciben ni la acción de suelo inferior ni el bonus de intervalo, manteniendo la recompensa original de instruction following. Los checkpoints se exportan en los pasos 16, 32, 48, 64 y 80.

## Capacidades
- Generacion de texto y razonamiento: al estar basado en Qwen3-4B, hereda la capacidad de generar texto coherente y de razonar en modo thinking.
- Seguimiento de instrucciones: el fine-tuning se centra en mejorar la adherencia a instrucciones, aunque no hay métricas publicadas que lo confirmen.
- Multilingue: el modelo base Qwen3 soporta multiples idiomas, pero no se especifica si el fine-tuning preserva esta capacidad.
- Tool calling y function calling: el modelo base Qwen3-4B soporta estas funciones, pero no se ha verificado en este fine-tuning.
- Sin soporte de vision ni audio: el modelo es exclusivamente de texto.

## Casos de uso
- Investigacion en RLVR: este modelo es util para estudiar el impacto de diferentes estrategias de anclaje en el aprendizaje por refuerzo con recompensas verificables. Los checkpoints permiten reproducir los experimentos y comparar variantes.
- Evaluacion de metodos de alineacion: los cuatro experimentos ofrecen un banco de pruebas para analizar como el anclaje inferior afecta a la estabilidad del entrenamiento y a la calidad final del modelo.
- Desarrollo de modelos de instruction following: aunque no hay benchmarks, el fine-tuning podria aplicarse a tareas de generacion de respuestas a instrucciones en entornos controlados.
- Analisis de robustez: los pares invertidos (flipped pairs) y su manejo (strict vs. abstention) permiten estudiar la sensibilidad del modelo a datos ambiguos o contradictorios.
- Reproducibilidad academica: al publicar los checkpoints y la configuracion de entrenamiento, el repositorio sirve como referencia para otros investigadores que trabajen con RLVR.
- Prototipado rapido: si el fine-tuning funciona correctamente, el modelo podria usarse como base para prototipos de asistentes conversacionales con requisitos de bajo coste computacional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni otros conjuntos estandar.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 8 GB (4B parametros en precision BF16 ocupan ~8 GB).
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100, H100. En consumer GPU con 8 GB o mas de VRAM es posible ejecutar el modelo sin cuantizacion.
- Opciones de despliegue: el modelo es compatible con Transformers (pipeline text-generation), vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante importacion).
- Latencia y throughput: no se dispone de datos especificos. Para un modelo de 4B en una GPU moderna, la generacion suele ser de 50-100 tokens/segundo en cuantizacion de 4 bits, y de 20-40 tokens/segundo en BF16.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B (base) | 4B | 32.768 | Apache-2.0 | Modelo original sin fine-tuning, disponible en Hugging Face |
| Qwen3-4B-2507 (Instruct) | 4B | 32.768 | Apache-2.0 | Version actualizada con mejoras en modo no-thinking |
| Llama-3.2-3B | 3B | 128.000 | Llama 3.2 Community License | Modelo de Meta, contexto mayor pero licencia restrictiva |
| Qwen2.5-3B | 3B | 32.768 | Apache-2.0 | Version anterior de Qwen, sin modo thinking |

Este fine-tuning no introduce cambios arquitectonicos respecto a Qwen3-4B, por lo que la comparativa se limita a la licencia y al contexto, que son identicos al modelo base. No hay datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias
- Modelo experimental: no ha sido validado en benchmarks estandar ni en escenarios de produccion. Su uso en aplicaciones reales no esta recomendado sin una evaluacion exhaustiva.
- Sobreajuste potencial: el entrenamiento se realizo sobre un subconjunto de 4.096 filas, lo que puede provocar sobreajuste a ese conjunto y una generalizacion limitada.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en temas especializados.
- Sesgos: el modelo base Qwen3 puede contener sesgos derivados de sus datos de entrenamiento; el fine-tuning no los corrige.
- Limitaciones de idioma: no se especifica si el fine-tuning preserva las capacidades multilingues del modelo base.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero al ser un experimento sin garantias, el usuario asume la responsabilidad de su evaluacion.
- Reproducibilidad: la configuracion de entrenamiento esta documentada, pero no se incluyen los datos de entrenamiento originales (solo el subconjunto de 4.096 filas), lo que puede dificultar la reproduccion exacta.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/just1nseo/qwen3-4b-if-rlvr-subset4k-lower-only-ep5
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Technical Report de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
