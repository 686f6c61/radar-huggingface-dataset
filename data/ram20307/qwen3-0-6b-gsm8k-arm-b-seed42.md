# Ram20307/qwen3-0.6b-gsm8k-arm-b-seed42

## Resumen

Ram20307/qwen3-0.6b-gsm8k-arm-b-seed42 es un modelo de lenguaje pequeño (SLM) de 596 millones de parámetros, resultado de un experimento de investigación dentro del proyecto SLM Reasoning Research, cuyo objetivo es estudiar qué tipo de supervisión de razonamiento ayuda realmente a que un modelo de 0.6B aprenda a razonar. El modelo se obtiene mediante un fine-tuning del modelo base Qwen3-0.6B-Base sobre el dataset de problemas de matemáticas GSM8K, usando un subconjunto filtrado de 7435 ejemplos.

La particularidad de este modelo es el "brazo B" del experimento: un formato de razonamiento conciso que comprime la lógica en pasos cortos, en contraposición a otros formatos más extensos. Esta ficha documenta una SFT sin RLHF ni DPO, entrenada durante tres épocas con optimizador AdamW y una tasa de aprendizaje de 2e-5. El modelo está pensado para la investigación de técnicas de supervision de razonamiento en modelos pequeños, no para un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-0.6B-Base) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificado en la informacion disponible; el entrenamiento utilizo max_length de 768 |
| Tipos de cuantizacion | No especificado (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No especificado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer denso decoder-only. En este caso no se aplica ninguna modificacion arquitectonica; el cambio se produce en el ajuste fino supervisado (SFT). El dataset de entrenamiento esta compuesto por 7435 pares de problemas de GSM8K con razonamientos concisos filtrados (brazo B). La configuracion de entrenamiento incluye 3 epocas, tasa de aprendizaje de 2e-05, batch efectivo de 16, longitud maxima de 768 tokens y perdida final de 0,3718.

El entrenamiento se ejecuto en una NVIDIA RTX A5000 Laptop GPU durante aproximadamente 45 minutos, con precision fp32 master amp fp16 y Python 3.10.12, PyTorch 2.5.1 y Transformers 5.3.0. No se emplearon tecnicas de RLHF ni DPO. La innovacion del experimento radica en el diseno de los distintos "brazos" de razonamiento; el brazo B implementa una version comprimida del razonamiento, con el objetivo de medir si la concision influye en la precision del modelo.

## Capacidades

- Resolucion de problemas de matematicas aritmeticas del estilo GSM8K, con generacion de razonamientos en pasos cortos y concisos.
- Generacion de texto de razonamiento en formato de cadena de pensamiento comprimida, pensada para tareas de calculo numerico sencillo.
- No se ha documentado soporte de tool calling ni function calling.
- No presenta capacidades multimodales (vision, audio ni video).
- No se ha verificado su rendimiento en tareas de agentes o razonamiento multi-paso complejo.
- El idioma predominante en el dataset de entrenamiento es el ingles, pero no se han publicado pruebas de soporte multilingue.

## Casos de uso

- Investigacion en supervision de razonamiento: sirve para comparar el rendimiento del formato conciso (brazo B) frente a otros formatos de razonamiento mas extensos dentro del proyecto SLM Reasoning Research.
- Evaluacion de tecnicas de compresion de razonamiento: permite analizar como reducir la longitud de las cadenas de pensamiento afecta a la precision en un modelo de 0.6B.
- Prototipos de tutores de matematicas basicas: puede integrarse en aplicaciones educativas que generen explicaciones paso a paso para problemas de aritmetica, con una latencia muy baja.
- Benchmark de robustez de razonamiento: util para medir la consistencia de un SLM cuando se le presentan variaciones en el formato de respuesta inducido por la SFT.
- Experimentos de scaling laws en modelos pequenos: proporciona datos sobre como un dataset reducido de 7435 ejemplos modifica el comportamiento de un modelo base de 0.6B.
- Evaluacion de sesgos de oclusion en datasets pequenos: al ser un experimento con un subconjunto de evaluacion de 100 muestras, permite estudiar la variabilidad de resultados en muestras pequenas.

## Benchmarks y rendimiento

El unico resultado publicado en la model card es la precision en un subconjunto de 100 muestras del test de GSM8K. No se han publicado mas benchmarks ni comparaciones con otros modelos en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| GSM8K test accuracy (n=100) | 47% (47/100) |

No se dispone de resultados adicionales como MMLU, HumanEval, GSM8K completo ni otras metricas de razonamiento.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,2 GB (596M parametros × 2 bytes), mas cache y activaciones.
- VRAM estimada en cuantizacion 4-bit (si se genera un GGUF): aproximadamente 0,6 GB.
- GPU recomendada para inferencia: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3060, RTX 4070 o superior. El entrenamiento se realizo en una NVIDIA RTX A5000 Laptop.
- Es un modelo de tamano muy pequeno; cabe en GPUs de consumo, incluso en integrated graphics con suficiente RAM.
- Opciones de despliegue: HuggingFace Transformers (PyTorch), vLLM, llama.cpp mediante conversion a GGUF, y Ollama si se importa en su formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El modelo es un fine-tuning de Qwen3-0.6B-Base, por lo que la comparacion natural es con ese modelo base. La informacion conocida es la siguiente:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3-0.6B-Base | 596.049.920 | No especificado | Apache-2.0 | Base |
| Ram20307/qwen3-0.6b-gsm8k-arm-b-seed42 | 596.049.920 | No especificado | Apache-2.0 | Fine-tuning (investigacion) |

No se dispone de datos de benchmarks comparativos, por lo que no es posible establecer una comparacion de rendimiento con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental creado con fines de investigacion; no esta validado para uso en produccion.
- La precision reportada (47% en 100 muestras) se basa en un subconjunto muy pequeno y no es representativa de la precision real en el conjunto completo de GSM8K.
- El dataset de entrenamiento es reducido (7435 ejemplos) y esta especializado en problemas de matematicas; existe un riesgo elevado de sobreajuste al estilo de razonamiento conciso.
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez ante entradas fuera de distribucion.
- La longitud maxima de entrenamiento de 768 tokens limita la complejidad de los razonamientos que el modelo puede generar de forma coherente.
- No se ha verificado el soporte multilingue ni el comportamiento fuera del dominio de matematicas aritmeticas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no se ha optimizado para ello y su rendimiento en tareas reales puede ser limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ram20307/qwen3-0.6b-gsm8k-arm-b-seed42
- Repositorio del proyecto SLM Reasoning Research: https://github.com/sarvadnya2030/Rsearch_Experiments_SLM
