# CharlesDDDD/DRV-Qwen3-1.7B-loop-random234

## Resumen

DRV-Qwen3-1.7B-loop-random234 es un modelo de lenguaje de 1.720.577.024 parámetros derivado de Qwen/Qwen3-1.7B-Base mediante un proceso de preentrenamiento continuado de aproximadamente 20.000 millones de tokens. Lo desarrolla el usuario CharlesDDDD dentro de la colección Depth Recurrent Vector, y su rasgo distintivo es la recurrencia en profundidad: doce de las 28 capas del transformer original forman un bloque que se ejecuta varias veces seguidas con los mismos pesos, de modo que el modelo obtiene más cómputo por token sin incrementar el número de parámetros.

La innovación clave es el entrenamiento con un número aleatorio de pasadas (2, 3 o 4 con probabilidades del 20, 60 y 20 por ciento), lo que permite seleccionar el número de pasadas en tiempo de inferencia. Según la model card, la pérdida se mantiene prácticamente constante entre 3 y 8 pasadas (1,1223 en 3 pasadas frente a 1,1245 en 8), por lo que el valor por defecto es 3. El modelo de control sin bucle alcanza 1,1460 en el mismo conjunto de test, lo que sitúa la mejora en torno a 0,024 nats.

Se trata de un modelo base, sin ajuste por instrucciones, publicado bajo licencia Apache 2.0 y orientado a investigación sobre arquitecturas recurrentes en profundidad más que a despliegue inmediato en producción, dado que ni vLLM ni otros motores de servicio soportan todavía esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (qwen3_looped); capas 8-19 (12 de 28) forman un bloque que se repite |
| Parametros totales | 1.720.577.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el entrenamiento usó secuencias de 16K tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer de 28 capas, y lo convierte en un modelo con recurrencia en profundidad: las capas 0-7 se ejecutan una vez, las capas 8-19 se ejecutan varias veces en secuencia reutilizando los mismos pesos y las capas 20-27 se ejecutan una vez al final. La conexión entre pasadas se realiza mediante la fórmula `e + g * (previous pass output - e)`, donde `e` es la salida de la capa 7 y `g` es un escalar aprendido por canal oculto (`model.loop_gate`). Con `g = 0` el modelo equivale exactamente al Qwen3 original, lo que convierte el bucle en una modificación aditiva y controlable.

El preentrenamiento continuado consumió unos 20.000 millones de tokens en una única pasada sobre una mezcla de web, PDF, código y trayectorias de agentes, con secuencias de 16K tokens, optimizador AdamW, LR máximo de 3e-4 con decaimiento coseno y un número aleatorio de pasadas por paso (2, 3 o 4 con probabilidad 20/60/20 por ciento). Además se aplicó una pérdida auxiliar de peso 0,0555 sobre la predicción de cada pasada intermedia, de forma que detener el bucle antes de tiempo sigue produciendo salidas razonables. La implementación de Hugging Face reproduce el código de entrenamiento con una diferencia de 0,003 nats de pérdida en todos los números de pasadas.

## Capacidades

- Generación de texto autoregresiva sobre modelos base, sin ajuste por instrucciones ni formato conversacional entrenado.
- Razonamiento y conocimiento general heredados de Qwen3-1.7B-Base tras el preentrenamiento continuado.
- Generación de código, dado que la mezcla de entrenamiento incluye código.
- Procesamiento de documentos PDF y texto web, presentes en el corpus de entrenamiento.
- Trayectorias de agentes: el corpus incluye datos de este tipo, aunque no se documenta soporte explícito de tool calling.
- Control del cómputo en inferencia mediante el parámetro `num_loops`, que permite elegir entre 1 y 8 pasadas (valor por defecto 3).
- Capacidades multilingües: no documentadas explícitamente; dependen del modelo base.
- No se documenta modo thinking, visión, audio ni function calling nativo.

## Casos de uso

- Investigación sobre recurrencia en profundidad: el modelo sirve como banco de pruebas para estudiar cómo afecta el número de pasadas a la pérdida y a la calidad de generación, con una curva de pérdida publicada de 1 a 8 pasadas.
- Experimentos de eficiencia computacional: permite comparar el coste de aumentar pasadas frente a aumentar parámetros, ya que el bloque recurrente reutiliza pesos y solo crece la caché KV (unas 1,9 veces la de Qwen3-1.7B con 3 pasadas).
- Generación de texto en dominios técnicos: el corpus de preentrenamiento incluye PDF y código, por lo que es adecuado para continuar texto técnico o completar fragmentos de documentación.
- Base para ajuste fino posterior: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para SFT o DPO en tareas concretas, aprovechando la ganancia de pérdida frente al control sin bucle.
- Estudio de estabilidad de salidas con pasadas variables: la pérdida auxiliar sobre pasadas intermedias permite analizar la calidad de las predicciones cuando se interrumpe el bucle antes de tiempo.
- Prototipado de pipelines de agentes: el corpus incluye trayectorias de agentes, lo que lo hace útil para experimentar con generación de planes o secuencias de acciones, siempre con validación adicional.
- Comparación de arquitecturas en entornos de investigación con una sola GPU: con 1,72 mil millones de parámetros en bfloat16 (unos 3,4 GB de pesos) cabe en GPUs de consumo para experimentación.

## Benchmarks y rendimiento

La model card solo publica la pérdida en el conjunto de test de la mezcla de entrenamiento según el número de pasadas:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida | 1,1896 | 1,1324 | 1,1223 | 1,1221 | 1,1230 | 1,1237 | 1,1242 | 1,1245 |

El modelo de control sin bucle obtiene 1,1460 en el mismo conjunto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 3,4 GB, según el tamaño del repositorio.
- VRAM estimada para inferencia en bfloat16: en torno a 4-6 GB incluyendo caché KV y overhead, aunque la caché KV con 3 pasadas es aproximadamente 1,9 veces la de Qwen3-1.7B estándar, lo que incrementa el consumo en contextos largos.
- Cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090; también en A100 y H100 sin problema de memoria.
- Despliegue: únicamente mediante `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM, llama.cpp, Ollama y TGI no soportan esta arquitectura todavía.
- Latencia y throughput: no disponibles. Cabe esperar un coste de cómputo proporcional al número de pasadas (3 por defecto), superior al de Qwen3-1.7B estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida test | Licencia | Servicio |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop-random234 | 1,72B | 16K en entrenamiento | 1,1223 (3 pasadas) | Apache 2.0 | Solo transformers |
| Qwen/Qwen3-1.7B-Base | 1,72B | No disponible en esta ficha | No disponible | Apache 2.0 | vLLM, TGI, llama.cpp, Ollama |
| CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop | 1,72B | 16K en entrenamiento | 1,1460 | Apache 2.0 | Solo transformers |

La comparación con otros modelos de 1-2B de la familia Qwen3 o Llama no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales sin ajuste adicional.
- No soportado por vLLM, llama.cpp, Ollama ni TGI, lo que limita su uso en producción y obliga a servir con transformers.
- La caché KV crece con el número de pasadas (unas 1,9 veces la de Qwen3-1.7B con 3 pasadas), lo que encarece la inferencia en contextos largos.
- Riesgo de alucinación inherente a los modelos base de 1,7B; no se documentan evaluaciones de fidelidad factual.
- Sesgos no documentados: la model card no incluye análisis de sesgos ni de composición del corpus más allá de la descripción general (web, PDF, código, trayectorias de agentes).
- Idiomas soportados no especificados; el rendimiento fuera del inglés y del chino puede ser inferior.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene revisarlo antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de soporte en motores de servicio desaconseja su uso en producción sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop-random234
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
