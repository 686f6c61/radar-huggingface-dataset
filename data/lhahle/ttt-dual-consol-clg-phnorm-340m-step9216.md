# lhahle/ttt-dual-consol-clg-phnorm-340M-step9216

## Resumen

El modelo `lhahle/ttt-dual-consol-clg-phnorm-340M-step9216` es un checkpoint parcial de un modelo de lenguaje basado en Test-Time Training (TTT), desarrollado por el investigador lhahle. Se trata de una variante de 340 millones de parámetros (372,5 M en pesos reales) con arquitectura TTT de memoria dual, 22 capas, 8 cabezas de atención y dimensión oculta 1024. El modelo incorpora un flujo lento consolidado, una puerta de mezcla de bucle cerrado y normalización QK por cabeza, según la configuración `dual_consol_clg_phnorm_340M.json`.

Este checkpoint se publica como registro de evaluación, no como modelo final. El entrenamiento se detuvo en el paso 9216 de 28620 (aproximadamente 4.800 millones de tokens de un presupuesto total de 15.000 millones), usando el dataset `flame` y una muestra de `fineweb-edu` de 100B tokens, con un batch global de 524.288 tokens. El autor indica que el checkpoint completo de 28620 pasos supera a este para todos los usos excepto la reproducción de las evaluaciones del 28 de agosto de 2026. Su relevancia radica en ser un punto de referencia para la familia de modelos TTT dual-memory, mostrando resultados de recuperación de aguja en pajar (NIAH) superiores a modelos comparables con un tercio del coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTT (Test-Time Training) con memoria dual, 22 capas, 8 cabezas, dimension 1024 |
| Parametros totales | 372.507.248 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea capas TTT, donde el estado oculto es un modelo de aprendizaje automatico que se actualiza mediante un paso de aprendizaje autosupervisado en tiempo de prueba, en lugar de un vector fijo como en las RNN clasicas. La variante aqui presentada introduce una memoria dual: un flujo lento (slow stream) que consolida informacion a lo largo de chunks (16/16) con un `slow_eta_bias_init` de 20 (anclaje de retencion) y una tasa de aprendizaje base de 0.125, junto con un flujo rapido. Una puerta de mezcla de bucle cerrado (closed-loop blend gate) combina ambas memorias, y se aplica normalizacion QK por cabeza (per-head qk-norm). El entrenamiento se realizo con el dataset `flame` y una muestra de `fineweb-edu` de 100B tokens, con un batch global de 524.288 tokens y un programa de tasa de aprendizaje que se interrumpio a mitad de camino. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva basada en la arquitectura TTT.
- Razonamiento y recuperacion de informacion contextual, evidenciado por los resultados en tareas NIAH (needle in a haystack).
- Evaluacion general de lenguaje mediante lm-eval, con una media de 42.97 en el checkpoint parcial.
- Capacidad de manejo de contexto largo (hasta 4k tokens en las evaluaciones NIAH reportadas), aunque la longitud maxima no esta documentada.
- No se reportan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en arquitecturas de estado oculto expresivo: el modelo sirve como banco de pruebas para estudiar el comportamiento de capas TTT con memoria dual y puerta de mezcla, especialmente en tareas de recuperacion de informacion de contexto largo.
- Reproduccion de evaluaciones: es el checkpoint de referencia para las evaluaciones del 28 de agosto de 2026, permitiendo a otros investigadores replicar los resultados NIAH y lm-eval publicados.
- Comparacion de eficiencia computacional: al lograr resultados competitivos con un tercio del presupuesto de entrenamiento, puede usarse para analizar la relacion entre coste de entrenamiento y rendimiento en modelos TTT.
- Desarrollo de metodos de consolidacion de memoria: la configuracion de flujo lento con anclaje de retencion es un caso de estudio para disenar memorias a largo plazo en modelos recurrentes.
- Validacion de tecnicas de normalizacion: la normalizacion QK por cabeza y la puerta de mezcla de bucle cerrado pueden evaluarse en tareas de comprension lectora y respuesta a preguntas.
- Educacion y divulgacion: como ejemplo de checkpoint parcial documentado, es util para ensenar practicas de publicacion de modelos en investigacion abierta.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el checkpoint parcial (paso 9216), obtenidos el 28 de agosto de 2026. Se advierte que la metrica NIAH EM esta confundida por el formato de evaluacion; consultar las notas del repositorio antes de citar.

| Tarea | Resultado |
|---|---|
| NIAH 1 @ 1k | 0.978 |
| NIAH 1 @ 2k | 0.882 |
| NIAH 1 @ 4k | 0.354 |
| lm-eval promedio | 42.97 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada. El autor indica que este checkpoint logro el mejor NIAH de su familia en ese momento, con un tercio del coste computacional de las filas de comparacion, pero no se detallan los modelos comparados.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1.5 GB en safetensors, lo que sugiere pesos en FP32 (372M parametros * 4 bytes ≈ 1.49 GB). En FP16 ocuparia aproximadamente 750 MB, y en int8 unos 375 MB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP32, o 1 GB para FP16. Modelos como RTX 3060, RTX 4060 o superiores son suficientes. No se requieren GPUs de datacenter.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un checkpoint de investigacion sin formato estandarizado (solo safetensors), no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. Probablemente requiera un codigo de inferencia personalizado para la arquitectura TTT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros modelos. El modelo pertenece a la familia TTT, cuyo articulo de referencia (arXiv 2407.04620) describe capas TTT como alternativa a las RNN y Transformers. Modelos comparables en tamano serian GPT-2 medium (355M) o Llama-3.2-1B, pero no hay datos de rendimiento comparados en la informacion proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Checkpoint parcial: el modelo no esta completamente entrenado (32% del presupuesto de pasos), por lo que su rendimiento no refleja el modelo final y puede tener comportamientos erraticos.
- Licencia no especificada: al no indicarse licencia, no se permite uso comercial ni redistribucion sin autorizacion explicita del autor.
- Sesgos y alucinaciones: no se han evaluado sesgos; como modelo de lenguaje, existe riesgo de alucinacion, especialmente en tareas generativas.
- Limitaciones de contexto: la longitud de contexto no esta documentada; las evaluaciones NIAH solo cubren hasta 4k tokens.
- Confusion en metricas: el autor advierte que la metrica NIAH EM esta confundida por el formato de evaluacion, por lo que los numeros deben interpretarse con cautela.
- No apto para produccion: es un artefacto de investigacion, no un modelo listo para aplicaciones reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lhahle/ttt-dual-consol-clg-phnorm-340M-step9216
- Articulo de referencia sobre TTT: https://arxiv.org/html/2407.04620v1
