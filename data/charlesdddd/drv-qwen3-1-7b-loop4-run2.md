# CharlesDDDD/DRV-Qwen3-1.7B-loop4-run2

## Resumen

DRV-Qwen3-1.7B-loop4-run2 es un modelo de lenguaje de 1.720.577.024 parámetros desarrollado por el usuario CharlesDDDD como parte de la colección Depth Recurrent Vector. Se trata de un fine-tuning por continuación de preentrenamiento sobre Qwen/Qwen3-1.7B-Base en el que se introduce recurrencia en profundidad: las capas 8 a 19 (12 de las 28 capas del transformer original) forman un bloque que se ejecuta cuatro veces consecutivas con los mismos pesos, de modo que el modelo obtiene más cómputo por token sin incrementar el número de parámetros.

El modelo se entrenó durante aproximadamente 20.000 millones de tokens sobre una mezcla de web, PDF, código y trayectorias de agente, con secuencias de 16K tokens, optimizador AdamW y LR pico de 3e-4 con decaimiento coseno. La conexión entre pasadas se realiza mediante una compuerta aprendida por canal (`model.loop_gate`): la primera pasada lee la salida de la capa 7 y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`, de forma que con `g = 0` el modelo equivale exactamente al Qwen3 original.

Su relevancia es experimental: explora si la recurrencia en profundidad permite mejorar la pérdida de un modelo pequeño sin aumentar los parámetros, y publica una ablación de pérdida por número de pasadas. Es un modelo base, sin ajuste por instrucciones, y su arquitectura no está soportada por motores de servicio como vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (bloque de capas 8-19 repetido 4 veces) |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 16K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer de 28 capas. En esta variante, las capas 0-7 se ejecutan una vez, las capas 8-19 se ejecutan cuatro veces seguidas compartiendo pesos y las capas 20-27 se ejecutan una vez al final. La conexión entre pasadas usa una compuerta escalar aprendida por canal oculto (`model.loop_gate`), que interpola la salida de la pasada anterior con la entrada original del bloque. Además, durante el entrenamiento se aplicó una pérdida auxiliar de peso 0,0555 sobre la predicción tras cada pasada intermedia, de modo que detener el bucle antes de tiempo sigue produciendo salidas razonables.

El entrenamiento consistió en un preentrenamiento continuado de unos 20.000 millones de tokens (una pasada sobre una mezcla de web, PDF, código y trayectorias de agente), con secuencias de 16K tokens, AdamW y LR pico de 3e-4 con decaimiento coseno. No se menciona RLHF ni DPO. La implementación de Hugging Face reproduce el código de entrenamiento con una diferencia máxima de 0,003 nats de pérdida en cada número de pasadas.

## Capacidades

- Generación de texto autoregresiva como modelo base (sin ajuste por instrucciones).
- Razonamiento y conocimiento general heredados del preentrenamiento de Qwen3-1.7B-Base.
- Generación de código, dado que la mezcla de entrenamiento incluye código.
- Procesamiento de trayectorias de agente, presentes en el corpus de entrenamiento.
- Control del número de pasadas en inferencia mediante el parámetro `num_loops`.
- Salida válida con parada temprana gracias a la pérdida auxiliar en pasadas intermedias.
- No dispone de tool calling, function calling ni modo thinking documentados.
- No dispone de capacidades de visión ni audio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre recurrencia en profundidad: sirve como punto de comparación frente al modelo sin bucle (`DRV-Qwen3-1.7B-midtrain-noloop`) para medir el efecto del número de pasadas sobre la pérdida en un conjunto de test held-out.
- Experimentos de eficiencia parámetro-cómputo: permite estudiar si repetir un bloque de 12 capas ofrece mejor rendimiento que un modelo denso del mismo tamaño, manteniendo fijos los 1.720 millones de parámetros.
- Ajuste fino posterior para tareas concretas: al ser un modelo base con licencia Apache 2.0, puede servir de inicialización para SFT o DPO en dominios específicos.
- Generación de texto en pipelines de investigación con `transformers`: se integra con `AutoModelForCausalLM` y `trust_remote_code=True`, lo que facilita su uso en scripts de evaluación académica.
- Estudio de compuertas de conexión entre pasadas: el parámetro `model.loop_gate` permite analizar cómo aprende el modelo a mezclar la información de pasadas sucesivas, un fenómeno relevante para el diseño de arquitecturas recurrentes.
- Evaluación de estrategias de parada temprana: la pérdida auxiliar por pasada intermedia permite comparar la calidad de salida con 1, 2, 3 o 4 pasadas y calibrar el coste computacional en despliegues con restricciones de latencia.
- Reproducción de experimentos de preentrenamiento continuado: la model card documenta hiperparámetros (LR, AdamW, 16K de secuencia, 20B tokens) que permiten replicar el procedimiento sobre otras bases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica la pérdida en el conjunto de test held-out de la mezcla de entrenamiento según el número de pasadas:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida | 1,2027 | 1,1489 | 1,1405 | 1,1180 | 1,1296 | 1,1351 | 1,1198 | 1,1299 |

El control sin bucle obtiene 1,1460. El mínimo se alcanza con 4 pasadas (1,1180), que es el número con el que se entrenó.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos, más la caché KV. Dado que cada pasada mantiene su propia caché KV, con 3 pasadas la caché es unas 1,9 veces la de un Qwen3-1.7B estándar.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabe en GPUs de consumo con al menos 8 GB de VRAM en bfloat16 para contextos cortos, aunque el multiplicador de caché KV por pasada puede exigir más memoria en contextos largos.
- Cabe en GPU de consumo: previsiblemente sí, en modelos con 8-12 GB de VRAM o más, sin datos oficiales confirmados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de servicio no soportan esta arquitectura todavía.
- Latencia y throughput estimados: no disponibles. El coste computacional crece con el número de pasadas, ya que el bloque de 12 capas se ejecuta cuatro veces.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop4-run2 | 1.720.577.024 | no disponible (entrenado a 16K) | Pérdida test 1,1180 con 4 pasadas | Apache 2.0 | Hugging Face, requiere `trust_remote_code` |
| Qwen/Qwen3-1.7B-Base | 1,7B (aprox.) | no disponible en esta ficha | Pérdida test de referencia 1,1460 (control sin bucle) | Apache 2.0 | Hugging Face, soporte amplio en transformers |
| CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop | 1,7B (aprox.) | no disponible | Modelo de referencia sin bucle de la misma colección | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no está pensado para seguir instrucciones ni para uso conversacional directo sin SFT adicional.
- vLLM y otros motores de servicio no soportan esta arquitectura, lo que limita su despliegue en producción a `transformers` con código remoto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el código antes de usarlo en entornos sensibles.
- La caché KV se multiplica por el número de pasadas (aproximadamente 1,9x con 3 pasadas respecto a Qwen3-1.7B), lo que incrementa los requisitos de memoria en contextos largos.
- No hay datos publicados sobre sesgos, tasas de alucinación ni comportamiento multilingüe.
- Los idiomas soportados no están documentados; el comportamiento fuera del inglés es incierto.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-1.7B-Base conviene verificar las condiciones de la licencia del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de su comportamiento.
- El número de pasadas óptimo es 4 según la pérdida de test; usar otros valores puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop4-run2
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
