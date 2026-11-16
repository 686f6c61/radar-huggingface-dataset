# CharlesDDDD/DRV-Qwen3-1.7B-loop2

## Resumen

DRV-Qwen3-1.7B-loop2 es un modelo de lenguaje de 1.720.577.024 parámetros derivado de Qwen/Qwen3-1.7B-Base mediante *continued pretraining* con una arquitectura de transformer recurrente en profundidad (*looped transformer*). Lo desarrolla el usuario CharlesDDDD dentro de la colección Depth Recurrent Vector, y su innovación central consiste en repetir un bloque de 12 capas (capas 8-19 de las 28 totales) dos veces con los mismos pesos, de modo que el modelo realiza más cómputo por token sin incrementar el número de parámetros.

El modelo parte de la base Qwen3-1.7B-Base y se ha entrenado durante aproximadamente 20.000 millones de tokens sobre una mezcla de web, PDF, código y trayectorias de agente, con secuencias de 16K tokens, optimizador AdamW y un LR máximo de 3e-4 con decaimiento coseno. La conexión entre pasadas se controla mediante una compuerta aprendida por canal (`model.loop_gate`), de forma que con `g = 0` el modelo equivale exactamente al Qwen3 original.

Es relevante porque explora una vía alternativa al escalado horizontal: aumentar la profundidad efectiva mediante recurrencia de pesos en lugar de añadir parámetros. La pérdida de test con 2 pasadas (1,1242) mejora a la del control sin bucle (1,1460), y el modelo mantiene un comportamiento razonable incluso con pasadas distintas a la de entrenamiento. No obstante, es un modelo base sin ajuste por instrucciones y su arquitectura no está soportada aún por motores de serving estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con recurrencia en profundidad (looped transformer), basado en Qwen3-1.7B |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 28 capas en el que las capas 8-19 (12 capas) forman un bloque que se ejecuta dos veces consecutivas con los mismos pesos. Las capas 0-7 se ejecutan una vez antes del bloque y las capas 20-27 una vez después. La primera pasada del bloque lee la salida `e` de la capa 7; cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`, donde `g` es un único valor aprendido por canal oculto almacenado en `model.loop_gate`. Este diseño permite ajustar de forma continua cuánto se reutiliza la representación de la pasada previa, y con `g = 0` colapsa al Qwen3 original.

El entrenamiento consistió en *continued pretraining* sobre aproximadamente 20.000 millones de tokens (una pasada sobre una mezcla de web, PDF, código y trayectorias de agente), con secuencias de 16K tokens, AdamW y LR máximo 3e-4 con decaimiento coseno. Además, se aplicó una pérdida auxiliar de peso 0,0555 sobre la predicción de cada pasada intermedia, de modo que detener el bucle antes de tiempo sigue produciendo salidas coherentes. La implementación de Hugging Face reproduce el código de entrenamiento con una discrepancia inferior a 0,003 nats de pérdida en cualquier número de pasadas.

## Capacidades

- Generación de texto autoregresiva en modo *base* (sin ajuste por instrucciones ni formato conversacional entrenado de forma explícita).
- Razonamiento y conocimiento general heredados del *continued pretraining* sobre web, PDF y código.
- Generación de código, al incluir código en la mezcla de entrenamiento.
- Procesamiento de trayectorias de agente en los datos de entrenamiento (no implica soporte nativo de *tool calling* en inferencia).
- Número de pasadas configurable en inferencia mediante el parámetro `num_loops` (entrenado con 2).
- Salidas razonables con parada temprana gracias a la pérdida auxiliar sobre pasadas intermedias.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Sin soporte de visión, audio ni *thinking mode* documentado.

## Casos de uso

- Investigación sobre recurrencia en profundidad: el modelo sirve como banco de pruebas controlado para estudiar cómo afecta el número de pasadas a la perplejidad, ya que permite variar `num_loops` de 1 a 8 y comparar con el control sin bucle.
- Experimentos de eficiencia paramétrica: útil para medir si el cómputo extra por token compensa frente a un modelo denso del mismo tamaño, dado que no añade parámetros respecto a Qwen3-1.7B.
- *Continued pretraining* sobre dominio específico: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para ajuste supervisado en dominios concretos (legal, médico, código interno).
- Generación de texto en pipelines de investigación: con `transformers` y `trust_remote_code=True` puede integrarse en *scripts* de evaluación y generación por lotes en entornos controlados.
- Estudio de compuertas adaptativas: el parámetro `model.loop_gate` permite analizar qué canales ocultos aprovechan la información de pasadas previas, con valor para interpretabilidad.
- Prototipado de decodificación con parada temprana: la pérdida auxiliar por pasada intermedia permite evaluar estrategias de *early exit* en el bucle sin reentrenar.
- Comparación de esquemas de conexión entre pasadas: junto con los modelos `ablation-loop3-chained*` de la misma colección, permite aislar el efecto del mecanismo de conexión (`e + g * (...)` frente a alternativas encadenadas).

## Benchmarks y rendimiento

Pérdida de test sobre el conjunto reservado de la mezcla de entrenamiento (menor es mejor), según la model card:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida | 1,1832 | 1,1242 | 1,1295 | 1,1333 | 1,1368 | 1,1387 | 1,1399 | 1,1407 |

Control sin bucle (`DRV-Qwen3-1.7B-midtrain-noloop`): 1,1460.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda un mínimo de 6-8 GB.
- La caché KV crece con el número de pasadas: cada pasada mantiene su propia caché, de modo que con 3 pasadas ocupa aproximadamente 1,9 veces la de un Qwen3-1.7B estándar.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; RTX 4090, A100 o H100 para mayor margen y throughput. Cabe en GPU de consumo como RTX 3060 de 12 GB o RTX 4070.
- Opciones de despliegue: únicamente `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan esta arquitectura todavía; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Cabe esperar un coste proporcional al número de pasadas, dado que el bloque de 12 capas se ejecuta dos veces por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida de test | Licencia | Serving estándar |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop2 | 1.720.577.024 | 16.384 | 1,1242 (2 pasadas) | Apache 2.0 | No (solo transformers con código remoto) |
| DRV-Qwen3-1.7B-midtrain-noloop | no disponible | no disponible | 1,1460 | Apache 2.0 | no disponible |
| Qwen/Qwen3-1.7B-Base | no disponible en la información | no disponible en la información | no disponible | no disponible en la información | Sí (transformers, vLLM) |

La comparación con alternativas de la misma categoría (modelos de ~1,7B parámetros) no está disponible en la información proporcionada más allá del control sin bucle de la propia colección.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin ajuste posterior.
- No soportado por vLLM ni otros motores de serving, lo que limita su uso en producción a `transformers` con `trust_remote_code=True`.
- La caché KV se multiplica por el número de pasadas (aproximadamente 1,9x con 3 pasadas), lo que encarece la inferencia con contextos largos.
- Riesgo de alucinación inherente a un modelo base entrenado sobre web, PDF y código, sin datos de evaluación de fidelidad.
- Sesgos conocidos: no documentados; al derivar de Qwen3-1.7B-Base y de una mezcla web, es previsible que herede sesgos de esos datos, pero no se cuantifican.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- El número de pasadas óptimo en entrenamiento es 2; con otras configuraciones la pérdida empeora ligeramente (1,1295 con 3 pasadas, 1,1407 con 8).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de soporte en motores de serving desaconseja su despliegue en producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop2
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
