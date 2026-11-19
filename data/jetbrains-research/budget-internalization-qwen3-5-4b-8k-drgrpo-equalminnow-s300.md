# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-drgrpo-equalminnow-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-drgrpo-equalminnow-s300` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su proposito es internalizar un presupuesto fijo de generacion de 8.192 tokens para tareas de razonamiento matematico, de modo que el modelo aprenda a producir respuestas correctas dentro de ese limite en lugar de depender de un escalado de computo en tiempo de inferencia. El checkpoint publicado corresponde al paso 300 de entrenamiento, con nombre de ejecucion `equalminnow`.

El modelo se enmarca en la linea de investigacion presentada en el articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia como el aprendizaje por refuerzo con recompensa verificable (RLVR) bajo un presupuesto fijo puede sustituir parte del beneficio que normalmente se obtiene generando cadenas de razonamiento mas largas. La relevancia practica esta en reducir coste y latencia en produccion: si el modelo resuelve problemas matematicos dentro de un presupuesto acotado, se evita el escalado dinamico de tokens en tiempo de inferencia.

El modelo tiene 4.539.265.536 parametros (aproximadamente 4,54 mil millones) en precision BF16, un repositorio de 9,1 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base. La pipeline declarada es `image-text-to-text`, lo que refleja la modalidad del modelo base Qwen3.5, aunque el ajuste fino se ha centrado exclusivamente en razonamiento matematico textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-4B); no se detalla la variante concreta en la informacion disponible |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (presupuesto de generacion de 8.192 tokens; la ventana de contexto del modelo base no se especifica) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y aplica un ajuste fino con Dr. GRPO (GRPO sin normalizacion por desviacion estandar de la recompensa y con un normalizador de longitud constante). El presupuesto de generacion se fija en `max_new_tokens = 8.192`. El entrenamiento usa el dataset DeepScaleR (agentica-org/DeepScaleR-Preview-Dataset) con un maximo de 3 epocas, lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante un total de 300 pasos. La recompensa es binaria segun la correccion de la respuesta extraida de las etiquetas `\boxed{}`.

La plantilla de prompt de entrenamiento es: `Think step-by-step to solve the following problem. Output your answer inside of \boxed{} tags.: {problem}\n\nLet's think step-by-step`. La innovacion principal es la internalizacion del presupuesto: en lugar de premiar cadenas de razonamiento mas largas (escalado en tiempo de prueba), el RL empuja al modelo a alcanzar la respuesta correcta dentro de un limite fijo de tokens, lo que traslada el coste del razonamiento al entrenamiento y no a la inferencia.

## Capacidades

- Razonamiento matematico paso a paso con formato de respuesta en `\boxed{}`.
- Generacion de cadenas de razonamiento acotadas a un presupuesto de 8.192 tokens (internalizacion de presupuesto).
- Resolucion de problemas de matematicas tipo competicion, derivada del dataset DeepScaleR.
- Modalidad image-text-to-text declarada en la pipeline, heredada del modelo base Qwen3.5-4B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de investigacion en RLVR: usar el checkpoint para reproducir o comparar el efecto de la internalizacion de presupuesto frente a modelos que escalan tokens en tiempo de inferencia, midiendo precision dentro de 8.192 tokens.
- Generacion de soluciones matematicas en pipelines educativos: el modelo produce razonamientos paso a paso con respuesta final en `\boxed{}`, lo que facilita la extraccion automatica y la validacion por parte de un corrector.
- Servicio de resolucion de problemas con coste acotado: al estar entrenado para un presupuesto fijo, permite dimensionar la VRAM y el tiempo de generacion por peticion de forma predecible en lugar de usar limites dinamicos.
- Benchmarking de tecnicas de RL: sirve como referencia (paso 300, Dr. GRPO, LR 5e-7) para estudiar la estabilidad del entrenamiento y la evolucion de la recompensa binaria.
- Fine-tuning posterior sobre dominios matematicos especificos: al ser un checkpoint intermedio de 4,54 B con licencia Apache 2.0, puede servir de inicializacion para ajustes con presupuestos distintos.
- Prototipado de asistentes de razonamiento en local: con 4,54 B de parametros en BF16, es viable en GPUs de gama alta para pruebas de concepto de razonamiento acotado.
- Investigacion sobre calibracion de longitud: permite analizar si el modelo respeta el presupuesto de 8.192 tokens y como se distribuye la longitud de las cadenas generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 9,1 GB (coincide con el tamano del repositorio), por lo que la inferencia en BF16 requiere del orden de 10-12 GB de VRAM incluyendo overhead de activaciones y cache KV.
- Cuantizacion a 8 bits: estimacion de 5-6 GB de VRAM; a 4 bits: estimacion de 3-4 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin cuantizar con margen. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite BF16 con holgura; una RTX 4080 (16 GB) o 4070 Ti (16 GB) es suficiente en BF16 ajustado o en 8 bits.
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad con safetensors, vLLM, TGI o llama.cpp tras conversion a GGUF. No se confirma soporte explicito de estas herramientas en la informacion disponible.
- Latencia y throughput: no disponibles. El presupuesto de 8.192 tokens de generacion implica un coste de decodificacion considerable por peticion en comparacion con modelos de razonamiento corto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-8k-drgrpo-equalminnow-s300 | 4,54 B | No disponible (presupuesto de generacion 8.192) | Dr. GRPO sobre DeepScaleR, 300 pasos | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4 B | No disponible | Preentrenamiento + postentrenamiento del autor original | Segun modelo base | Hugging Face |
| Otros checkpoints de la misma familia JetBrains-Research | No disponible | No disponible | Variantes de presupuesto y algoritmo | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint intermedio (paso 300) de un experimento de RL, no un modelo listo para produccion.
- Especializado en matematicas: el ajuste fino usa exclusivamente DeepScaleR, por lo que su rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar razonamientos plausibles con respuestas incorrectas; la recompensa binaria no garantiza correccion fuera de la distribucion de entrenamiento.
- Presupuesto fijo: el comportamiento esta optimizado para 8.192 tokens de generacion; con presupuestos mayores o menores el rendimiento puede degradarse.
- Idiomas: no se declaran idiomas soportados; el prompt de entrenamiento esta en ingles.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar los terminos de Qwen/Qwen3.5-4B.
- Sin datos de benchmarks ni de descargas: no hay evidencia publica de rendimiento ni de adopcion.
- Sin citation publicada: la model card indica `TODO` en la seccion de citacion, lo que dificulta la trazabilidad academica.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-drgrpo-equalminnow-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Organizacion JetBrains-Research: https://huggingface.co/JetBrains-Research
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin enlace disponible en la informacion proporcionada.
