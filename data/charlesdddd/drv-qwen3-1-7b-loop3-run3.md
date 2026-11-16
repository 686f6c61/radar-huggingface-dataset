# CharlesDDDD/DRV-Qwen3-1.7B-loop3-run3

## Resumen

DRV-Qwen3-1.7B-loop3-run3 es un modelo de lenguaje de tipo transformer con recurrencia en profundidad (looped transformer), desarrollado por el usuario CharlesDDDD a partir de Qwen/Qwen3-1.7B-Base. La innovación principal consiste en reutilizar un bloque de 12 capas (capas 8-19 de las 28 totales) que se ejecuta tres veces consecutivas con los mismos pesos, de modo que el modelo realiza más computación por token sin incrementar el número de parámetros. El resultado es un modelo de 1.720.577.024 parámetros (aproximadamente 1,7B) que mantiene el tamaño de Qwen3-1.7B pero con mayor profundidad efectiva.

El modelo se ha obtenido mediante continued pretraining sobre aproximadamente 20.000 millones de tokens, con una mezcla de web, PDF, código y trayectorias de agente, secuencias de 16K tokens y optimizador AdamW con learning rate máximo de 3e-4 y decaimiento coseno. Forma parte de la colección Depth Recurrent Vector del mismo autor, que explora distintas configuraciones de recurrencia en profundidad, y su modelo de referencia sin bucle es CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop.

Es relevante ahora porque propone una vía para aumentar la capacidad de cómputo por token en modelos pequeños sin aumentar el coste de memoria de parámetros, un área activa de investigación (looped transformers, depth recurrence). No obstante, es un modelo base sin instruction tuning, con soporte limitado en motores de serving y con cero descargas en el momento de la consulta, lo que lo sitúa como material de investigación más que como candidato de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (looped transformer); bloque de 12 capas (8-19) repetido 3 veces |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K tokens (longitud de secuencia de entrenamiento); no se especifica contexto máximo de inferencia |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de 28 capas. La modificación consiste en convertir las capas 8-19 (12 capas) en un bloque recurrente que se ejecuta varias veces seguidas con los mismos pesos; las capas 0-7 se ejecutan una vez antes del bloque y las capas 20-27 una vez después. La conexión entre pasadas se realiza mediante una compuerta aprendida por canal oculto (`model.loop_gate`): la primera pasada lee la salida `e` de la capa 7, y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`. Con `g = 0` el modelo equivale exactamente al Qwen3 original. Esta configuración concreta (loop3-run3) repite el bloque 3 veces y usa la misma configuración que loop3-run1 con una semilla aleatoria distinta.

El entrenamiento consistió en continued pretraining sobre unos 20.000 millones de tokens en una única pasada por una mezcla de web, PDF, código y trayectorias de agente, con secuencias de 16K tokens, AdamW y peak LR 3e-4 con decaimiento coseno. Se añadió una pérdida auxiliar (peso 0,0555) sobre la predicción tras cada pasada intermedia, de forma que detener el bucle antes de tiempo sigue produciendo salidas razonables. La implementación de Hugging Face reproduce el código de entrenamiento con una diferencia de hasta 0,003 nats de pérdida en cada número de pasadas. Cada pasada mantiene su propia caché KV, por lo que con 3 pasadas la caché es aproximadamente 1,9 veces la de un Qwen3-1.7B estándar.

## Capacidades

- Generación de texto autoregresiva como modelo base (sin instruction tuning ni alineamiento conversacional).
- Razonamiento y conocimiento general heredados de Qwen3-1.7B-Base, reforzados por el continued pretraining sobre mezcla web, PDF y código.
- Generación de código, dado que la mezcla de entrenamiento incluye datos de código.
- Procesamiento de trayectorias de agente en el entrenamiento (datos de agent-trajectory), aunque el modelo no está ajustado para tool calling explícito.
- Número de pasadas configurable en inferencia mediante el parámetro `num_loops` (por ejemplo, `num_loops=4`), lo que permite un compromiso entre coste y calidad.
- Salidas razonables con parada temprana del bucle gracias a la pérdida auxiliar sobre pasadas intermedias.
- Capacidades multilingües: no disponible (el autor no documenta idiomas).
- Sin modo thinking, visión ni audio documentados.

## Casos de uso

- Investigación en arquitecturas recurrentes en profundidad: el modelo sirve como punto de comparación directo frente a CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop para medir el efecto del bucle sobre la pérdida y la calidad, con la tabla de pérdida por número de pasadas ya publicada.
- Experimentos de cómputo adaptativo en inferencia: ajustar `num_loops` por petición permite gastar más cómputo en tokens difíciles y menos en tokens fáciles, sin cambiar los pesos ni la memoria de parámetros.
- Continued pretraining sobre dominio específico: al ser un modelo base con licencia Apache 2.0, se puede afinar sobre corpus propios (legal, médico, técnico) partiendo de un modelo de 1,7B que cabe en GPUs de consumo.
- Generación de código en pipelines internos: la mezcla de entrenamiento incluye código, por lo que puede usarse como base para fine-tuning supervisado en tareas de autocompletado o generación de tests.
- Estudio de eficiencia memoria-calidad: comparar la caché KV de 1,9x frente a Qwen3-1.7B estándar con la ganancia de pérdida (1,1183 frente a 1,1460 en test) permite evaluar si el intercambio compensa en despliegues con contexto largo.
- Reproducción de experimentos de la colección Depth Recurrent Vector: el modelo documenta la semilla y la configuración exacta (loop3-run3), lo que facilita la reproducibilidad de resultados en publicaciones o tesis.
- Prototipado de bajo coste en investigación académica: 1,7B parámetros y pesos safetensors permiten ejecutarlo en una sola GPU consumer para validar hipótesis antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor solo publica la pérdida en el conjunto de test retenido de la mezcla de entrenamiento, no benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible.

| passes | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| loss | 1,1957 | 1,1479 | 1,1183 | 1,1304 | 1,1229 | 1,1312 | 1,1262 | 1,1321 |

Control sin bucle (DRV-Qwen3-1.7B-midtrain-noloop): 1,1460. El mínimo se alcanza con 3 pasadas (configuración de entrenamiento), con 1,1183.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos (1,72B parámetros x 2 bytes), más caché KV y activaciones. La caché KV con 3 pasadas es unas 1,9 veces la de Qwen3-1.7B estándar.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en contexto corto; A100 o H100 para contextos largos (16K) y lotes mayores.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y similares con 16-24 GB de VRAM, especialmente en contextos moderados.
- Opciones de despliegue: transformers con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan esta arquitectura todavía; llama.cpp, Ollama y TGI no están documentados como compatibles.
- Latencia y throughput: no disponibles. El coste computacional por token es aproximadamente el de 3 pasadas por el bloque recurrente, superior al de un Qwen3-1.7B estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida test (mezcla propia) | Licencia | Serving |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop3-run3 | 1,72B | 16K (entrenamiento) | 1,1183 (3 pasadas) | Apache 2.0 | Solo transformers con trust_remote_code |
| DRV-Qwen3-1.7B-midtrain-noloop | ~1,72B | 16K (entrenamiento) | 1,1460 | Apache 2.0 | transformers |
| Qwen/Qwen3-1.7B-Base | ~1,72B | no disponible en la información | no disponible | Apache 2.0 | transformers, vLLM, llama.cpp, Ollama |

La comparación se limita a la pérdida sobre la mezcla de entrenamiento del propio autor; no hay datos de benchmarks estándar que permitan comparar con Qwen3-1.7B-Base ni con otros modelos de 1-2B en tareas downstream. La ventaja de serving de Qwen3-1.7B-Base (compatibilidad con vLLM y llama.cpp) es un factor relevante frente a este modelo.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no sigue instrucciones de forma fiable ni mantiene conversaciones alineadas sin fine-tuning posterior.
- No compatible con vLLM ni otros motores de serving habituales; el despliegue en producción requiere transformers con código remoto, lo que añade riesgo de seguridad y mantenimiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- La caché KV es aproximadamente 1,9 veces la de Qwen3-1.7B estándar con 3 pasadas, lo que reduce el contexto efectivo alcanzable en GPUs con VRAM limitada.
- Mayor coste computacional por token que un modelo de 1,7B estándar (varias pasadas por el bloque recurrente).
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Sesgos y riesgo de alucinación: no documentados por el autor; al derivar de Qwen3-1.7B-Base y datos web, hereda los sesgos y la propensión a la alucinación de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B-Base debe cumplir también su propia licencia (Apache 2.0 según la información disponible).
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Solo se publica pérdida sobre la mezcla de entrenamiento propia; no hay benchmarks estándar que permitan evaluar calidad en tareas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop3-run3
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
