# CharlesDDDD/DRV-Qwen3-1.7B-loop3-run2

## Resumen

DRV-Qwen3-1.7B-loop3-run2 es un modelo de lenguaje de 1.720.577.024 parámetros derivado de Qwen/Qwen3-1.7B-Base mediante *continued pretraining* con una arquitectura de transformer recurrente en profundidad (*looped transformer*). Lo desarrolla el usuario CharlesDDDD dentro de la colección Depth Recurrent Vector, y su propósito es explorar si repetir un bloque de capas con los mismos pesos —sin incrementar el número de parámetros— aporta capacidad de cómputo adicional por token.

El modelo mantiene las 28 capas de Qwen3-1.7B, pero las capas 8-19 (12 capas) forman un bloque que se ejecuta tres veces consecutivas. Las capas 0-7 se ejecutan una vez antes del bloque y las 20-27 una vez después. La conexión entre pasadas usa una compuerta aprendida por canal (`model.loop_gate`), de modo que con la compuerta a cero el modelo equivale exactamente al Qwen3 original.

Es relevante como pieza de investigación reproducible: `loop3-run2` es una repetición exacta de `loop3-run1` (mismos ajustes, misma semilla) y sirve para medir la variabilidad introducida por la aritmética no determinista de GPU. Se distribuye como modelo base sin ajuste de instrucciones, bajo licencia Apache 2.0, y requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con recurrencia en profundidad (bloque de capas 8-19 repetido 3 veces); `qwen3_looped` |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenado con secuencias de 16K tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-1.7B-Base (28 capas, decoder-only) y aplica recurrencia en profundidad sobre el bloque central: las capas 8-19 se ejecutan tres veces con los mismos pesos, mientras que las capas 0-7 y 20-27 se ejecutan una sola vez. La primera pasada del bloque lee la salida `e` de la capa 7; cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`, donde `g` es un escalar aprendido por canal oculto (`model.loop_gate`). Este diseño permite ajustar cuánta información nueva aporta cada iteración y degrada de forma exacta al Qwen3 original si `g = 0`.

El entrenamiento consistió en *continued pretraining* de aproximadamente 20.000 millones de tokens en una única pasada sobre una mezcla de web, PDF, código y trayectorias de agente, con secuencias de 16K tokens, optimizador AdamW y LR pico de 3e-4 con decaimiento coseno. Además, se aplicó una pérdida auxiliar de peso 0,0555 sobre la predicción de cada pasada intermedia, de modo que detener la recurrencia antes de tiempo sigue produciendo salidas razonables. La implementación de Hugging Face reproduce el código de entrenamiento con una diferencia de 0,003 nats de pérdida en cada número de pasadas.

## Capacidades

- Generación de texto autoregresiva como modelo base (sin ajuste de instrucciones ni alineación conversacional).
- Razonamiento y modelado de lenguaje general heredados del preentrenamiento de Qwen3-1.7B-Base.
- Cómputo adaptativo en inferencia: el parámetro `num_loops` permite ejecutar cualquier número de pasadas del bloque, no solo las tres de entrenamiento.
- Salidas válidas con parada temprana gracias a la pérdida auxiliar sobre pasadas intermedias.
- Soporte de *tool calling* / *function calling*: no disponible (modelo base, sin post-entrenamiento).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada; el corpus de entrenamiento incluye trayectorias de agente, pero no hay ajuste específico.
- Capacidades multilingües: no disponibles como dato documentado.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Investigación sobre recurrencia en profundidad: comparar `loop3-run2` con `loop3-run1` para cuantificar la variabilidad entre ejecuciones con idénticos ajustes y semilla, aislando el efecto de la aritmética no determinista de GPU.
- Estudio de asignación de cómputo en inferencia: variar `num_loops` de 1 a 8 y medir la curva de pérdida (1,1944 con 1 pasada frente a 1,1176 con 3) para analizar el equilibrio entre cómputo y calidad.
- *Continued pretraining* como base: al ser un modelo base de 1,7B con licencia Apache 2.0, sirve como punto de partida para ajuste supervisado o DPO en dominios concretos.
- Experimentos de destilación o *early exit*: la pérdida auxiliar por pasada intermedia permite evaluar la calidad de salidas truncadas y diseñar estrategias de salida temprana.
- Reproducción de resultados académicos: la model card documenta hiperparámetros, mezcla de datos y curva de pérdida, lo que facilita replicar el experimento en otros tamaños de Qwen3.
- Prototipado en un solo GPU: con 1,72B parámetros y pesos en bfloat16, el modelo cabe en GPUs de consumo para pruebas de generación de texto a pequeña escala.
- Análisis de arquitecturas alternativas a MoE: comparar el coste de cómputo extra por recurrencia frente al de aumentar parámetros activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pérdida en un conjunto de test reservado de la mezcla de entrenamiento:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida | 1,1944 | 1,1471 | 1,1176 | 1,1299 | 1,1220 | 1,1305 | 1,1252 | 1,1312 |

El control sin recurrencia (`DRV-Qwen3-1.7B-midtrain-noloop`) obtiene 1,1460. El mínimo se alcanza con 3 pasadas, el número usado en entrenamiento; a partir de ahí la pérdida se estanca en torno a 1,12-1,13.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos, más activaciones y caché KV.
- La caché KV es mayor que en Qwen3-1.7B estándar: cada pasada mantiene su propia caché, de modo que con 3 pasadas ocupa aproximadamente 1,9 veces la de un Qwen3-1.7B convencional.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en contexto corto; A100 o H100 para contextos largos o lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090) para inferencia en bfloat16 con contexto moderado.
- Opciones de despliegue: únicamente `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan todavía esta arquitectura.
- Latencia y throughput: no disponibles. Cabe esperar un coste de cómputo superior al de Qwen3-1.7B proporcional al número de pasadas del bloque.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop3-run2 | 1,72B | no disponible (entrenado a 16K) | Apache 2.0 | solo transformers con código remoto | Bloque de 12 capas repetido 3 veces; pérdida de test 1,1176 |
| DRV-Qwen3-1.7B-midtrain-noloop | 1,72B | no disponible | Apache 2.0 | transformers | Referencia sin recurrencia; pérdida de test 1,1460 |
| Qwen/Qwen3-1.7B-Base | 1,72B | no disponible en la informacion proporcionada | Apache 2.0 | transformers, vLLM, llama.cpp, Ollama | Modelo base original; soporte amplio de motores de inferencia |
| DRV-Qwen3-1.7B-loop3-run1 | 1,72B | no disponible | Apache 2.0 | solo transformers con código remoto | Ejecución previa con idénticos ajustes y semilla |

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin post-entrenamiento adicional.
- No es compatible con vLLM ni con otros motores de serving habituales; el despliegue en producción requiere `transformers` con `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- La caché KV crece con el número de pasadas (unas 1,9 veces la de Qwen3-1.7B con 3 pasadas), lo que reduce el contexto efectivo alcanzable con la misma VRAM.
- Riesgo de alucinación inherente a un modelo base de 1,7B; no hay evaluación de sesgos ni de seguridad publicada.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- No hay resultados de benchmarks estándar que permitan validar la calidad fuera del conjunto de test de la mezcla de entrenamiento.
- `run2` difiere de `run1` solo por aritmética no determinista de GPU; las diferencias entre ambos no deben interpretarse como mejoras o degradaciones reales.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo base sin alineación exige evaluación propia de riesgos y filtros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop3-run2
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin recurrencia: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base original: https://huggingface.co/Qwen/Qwen3-1.7B-Base
