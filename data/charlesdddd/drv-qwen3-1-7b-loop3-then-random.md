# CharlesDDDD/DRV-Qwen3-1.7B-loop3-then-random

## Resumen

DRV-Qwen3-1.7B-loop3-then-random es un modelo de lenguaje de 1.720.577.024 parámetros derivado de Qwen/Qwen3-1.7B-Base mediante continued pretraining con recurrencia en profundidad. Lo desarrolla el usuario CharlesDDDD dentro de la colección Depth Recurrent Vector (DRV), y su innovación central es que un bloque de 12 capas (capas 8 a 19 de las 28 totales) se ejecuta varias veces consecutivas con los mismos pesos, de modo que el modelo obtiene más cómputo por token sin incrementar el número de parámetros.

El entrenamiento consistió en aproximadamente 20.000 millones de tokens sobre una mezcla de web, PDF, código y trayectorias de agente, con secuencias de 16K tokens, optimizador AdamW y LR pico de 3e-4 con decaimiento coseno. Durante el primer 80% del entrenamiento se usaron 3 pasadas del bloque recurrente; en el tramo final se alternó aleatoriamente entre 2, 3 y 4 pasadas, lo que da al modelo flexibilidad para operar con distintos presupuestos de cómputo en inferencia.

Es relevante ahora porque explora una vía poco habitual para escalar capacidad efectiva sin escalar parámetros: la recurrencia en profundidad. El modelo es una base (sin instruction tuning), con licencia Apache 2.0 y pesos en safetensors, y requiere `trust_remote_code=True` para cargarse en transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (looped transformer); bloque de capas 8-19 ejecutado varias veces |
| Parámetros totales | 1.720.577.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 16K tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso de 28 capas. La modificación consiste en convertir las capas 8 a 19 (12 capas) en un bloque que se ejecuta varias veces seguidas con pesos compartidos; las capas 0-7 se ejecutan una sola vez antes del bloque y las 20-27 una sola vez después. La conexión entre pasadas se realiza mediante una compuerta aprendida por canal oculto (`model.loop_gate`): la primera pasada lee la salida `e` de la capa 7, y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`. Con `g = 0` el modelo equivale exactamente al Qwen3 original.

El entrenamiento consistió en un continued pretraining de unos 20.000 millones de tokens (una pasada sobre una mezcla de web, PDF, código y trayectorias de agente) con secuencias de 16K tokens, AdamW y LR pico de 3e-4 con decaimiento coseno. Durante el 80% inicial se usaron 3 pasadas; en el tramo final se muestreó aleatoriamente entre 2, 3 y 4 pasadas, de ahí el sufijo "loop3-then-random". Se aplicó además una pérdida auxiliar (peso 0.0555) sobre la predicción de cada pasada intermedia, de forma que detener la recurrencia antes de tiempo sigue produciendo salidas razonables. La implementación de Hugging Face reproduce el código de entrenamiento con una diferencia de 0,003 nats de pérdida en cada número de pasadas.

## Capacidades

- Generación de texto autoregresiva (modelo base, sin instruction tuning).
- Razonamiento y conocimiento general heredados del continued pretraining sobre Qwen3-1.7B-Base.
- Generación de código, dado que la mezcla de entrenamiento incluye código.
- Procesamiento de trayectorias de agente (el dataset de entrenamiento incluye agent-trajectory), aunque sin tool calling nativo documentado.
- Profundidad de cómputo configurable en inferencia mediante el parámetro `num_loops` (2, 3, 4 o cualquier otro número de pasadas).
- Predicciones válidas con parada temprana gracias a la pérdida auxiliar sobre pasadas intermedias.
- Capacidades multilingües: no disponibles (no se documentan los idiomas cubiertos).
- Sin modo thinking, visión ni audio documentados.

## Casos de uso

- Investigación sobre recurrencia en profundidad: el modelo sirve como banco de pruebas para estudiar cómo afecta el número de pasadas a la pérdida (de 1,1937 con 1 pasada a 1,1221 con 3-4 pasadas) y para comparar arquitecturas looped frente a densas equivalentes.
- Generación de texto en dominios técnicos: al haberse entrenado con mezcla de web, PDF y código, es adecuado para completar documentación técnica y fragmentos de código en pipelines de generación asistida.
- Ajuste fino posterior (SFT/DPO): siendo un modelo base Apache 2.0, puede servir de punto de partida para fine-tuning orientado a instrucciones conservando la flexibilidad de profundidad.
- Experimentos de eficiencia computacional: permite evaluar el compromiso entre calidad y coste ajustando `num_loops` en tiempo de inferencia sin recargar pesos.
- Prototipado de agentes: el entrenamiento con trayectorias de agente lo hace candidato para experimentos de razonamiento multi-paso, siempre que se añada el andamiaje de tool calling por fuera del modelo.
- Ablaciones controladas: la colección DRV incluye el modelo de referencia sin looping (`DRV-Qwen3-1.7B-midtrain-noloop`), lo que facilita comparaciones experimentales directas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica la pérdida en el conjunto de test retenido según el número de pasadas:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida | 1,1937 | 1,1326 | 1,1221 | 1,1221 | 1,1234 | 1,1243 | 1,1249 | 1,1253 |

El control sin looping obtiene 1,1460. El óptimo se sitúa en 3-4 pasadas, con degradación suave a partir de 5.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos, más caché KV; el autor indica que con 3 pasadas la caché KV es unas 1,9 veces la de un Qwen3-1.7B estándar, por lo que el consumo total supera al de un 1.7B convencional.
- Cabe en GPUs de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente con margen amplio; también en GPUs de 8-12 GB con cuantización, aunque no se documentan pesos cuantizados oficiales.
- GPUs de datacenter recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: transformers (probado con la versión 5.14) con `trust_remote_code=True`. vLLM y otros motores de serving no soportan todavía esta arquitectura.
- Latencia y throughput: no disponibles. Cabe esperar un coste de cómputo proporcional al número de pasadas del bloque recurrente (3 pasadas por defecto).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Recurrencia | Serving estándar |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop3-then-random | 1,72B | no disponible (entrenado a 16K) | Apache 2.0 | Sí (12 capas, 2-4 pasadas) | No (solo transformers con trust_remote_code) |
| Qwen/Qwen3-1.7B-Base | 1,7B | no disponible en esta ficha | Apache 2.0 | No | Sí (vLLM, TGI, llama.cpp) |
| CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop | 1,7B | no disponible | Apache 2.0 | No (control del mismo entrenamiento) | No documentado |

La comparación con alternativas de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no sigue instrucciones de forma fiable sin un ajuste posterior.
- No soportado por vLLM ni por otros motores de serving habituales, lo que limita su uso en producción a transformers con código remoto.
- La caché KV crece con el número de pasadas (unas 1,9 veces la de Qwen3-1.7B con 3 pasadas), lo que encarece la inferencia con contextos largos.
- Riesgo de alucinación inherente a un modelo de 1,7B entrenado principalmente con datos web; no se documentan evaluaciones de factualidad.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Sesgos conocidos: no documentados por el autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar dicho código antes de usarlo en entornos sensibles.
- Aunque la licencia es Apache 2.0, la procedencia de los datos de continued pretraining no se detalla más allá de la mezcla web/PDF/código/agente, lo que puede plantear dudas de compliance en uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop3-then-random
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin looping: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
