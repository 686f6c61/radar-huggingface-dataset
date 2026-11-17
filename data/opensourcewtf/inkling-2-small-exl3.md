# OpensourceWTF/Inkling-2-Small-exl3

## Resumen

Inkling-2-Small-exl3 es un conjunto de cuantizaciones EXL3 del modelo base thinkingmachines/Inkling-2-Small, publicadas por el usuario OpensourceWTF. El modelo original es un transformer de arquitectura MoE (mezcla de expertos) desarrollado por Thinking Machines, con 384 expertos enrutados por capa y un cabezal MTP (multi-token prediction) adicional, además de una torre de visión. Las cuantizaciones se han generado con la herramienta exllamav3 y se distribuyen en tres ramas con distintas tasas de bits por peso (bpw): 2.99, 1.99 y 1.02.

El interés de esta ficha radica en que permite ejecutar un modelo MoE de gran tamano en hardware mas modesto, a costa de una perdida de calidad medible. La model card reporta metricas de divergencia (KLD), perplejidad y puntuaciones en tareas cortas (GSM8K, HumanEval y chat), lo que facilita evaluar el compromiso entre tamano y fidelidad. Sin embargo, el propio autor advierte de que las pruebas son cortas y con el modo de razonamiento desactivado, y que no se han validado contextos largos, conversaciones multi-turno ni uso de herramientas.

Un punto critico es que exllamav3 estándar no soporta la arquitectura `inkling2`; el autor incluye un parche no upstream que permite conversión, medición y generación greedy simple, pero sin soporte de paged-cache ni de servidores como TabbyAPI. El modelo completo supera los 96 GB de VRAM, por lo que las pruebas se hicieron con streaming de capas o paginación de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados por capa, torre de visión y cabezal MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 con tasas de 2.99 bpw, 1.99 bpw y 1.02 bpw (expertos en 2.958, 1.958 y 1.000 bpw respectivamente) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); formato EXL3 y exllamav3 bajo MIT |
| Formato de pesos | EXL3 (shards), con vision.safetensors y mtp.safetensors en bf16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos con 384 expertos enrutados por capa y un router que selecciona los expertos activos. Incluye además una torre de visión y un cabezal MTP (multi-token prediction) que se conservan sin cuantizar en bf16 dentro de cada rama. La cuantización EXL3 se aplica a los expertos enrutados, al tronco (proyecciones de atención) y al cabezal, mientras que quedan sin cuantizar el embedding de tokens, el router, los attention sinks, las convoluciones cortas, las normas y las consultas de atención residual.

El proceso de cuantización utilizó el pipeline de autocalibración de exllamav3: se muestreó una traza de calibración del modelo original en OpenRouter (374 respuestas, 697.822 tokens, empaquetados en 250 filas de hasta 2048 tokens), se midió la sensibilidad de los expertos por capa con `sc_measure.py --streaming --shaped`, y se optimizó la asignación de bits con `sc_optimize.py -mink 1 -maxk 4`. El tronco y el cabezal reciben K = K máximo de expertos + 2. La conversión usó `convert.py -rcp <recipe> -cd <trace> -cb mcg -mae 0.01`, que asigna a cada experto su propia matriz Hessiana y redujo el error de capa entre un 27% y un 34% en las primeras capas.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Inkling-2-Small.
- Procesamiento de imágenes mediante la torre de visión conservada en bf16.
- Predicción multi-token (MTP) gracias al cabezal específico incluido.
- Soporte de plantilla de chat con modo de razonamiento (thinking) activable o desactivable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no validado en las pruebas del autor.

## Casos de uso

- Despliegue en una sola GPU de 24-48 GB: la rama de 1.02 bpw ocupa 82,5 GB en total, pero puede ejecutarse con paginación de expertos o streaming de capas, lo que permite probar el modelo en hardware consumer de gama alta con suficiente RAM del sistema.
- Evaluación comparativa de cuantizaciones: las tres ramas permiten medir el impacto de la tasa de bits en KLD, perplejidad y tareas cortas, útil para decidir el compromiso calidad/tamano en un pipeline propio.
- Generación de código en entornos controlados: la rama de 2.99 bpw mantiene 48/50 en HumanEval frente a 49/50 del original, adecuada para asistentes de código donde se acepta una ligera degradación.
- Razonamiento matemático de nivel básico: GSM8K se mantiene en 95-96/100 en las ramas de 2.99 y 1.99 bpw, suficiente para tareas de aritmética y problemas escolares.
- Investigación sobre cuantización de MoE: el recetario por capas y las métricas de KLD publicadas sirven como referencia para estudiar la asignación de bits en modelos con muchos expertos.
- Prototipado de asistentes conversacionales: con la plantilla de chat y el modo thinking desactivado, las ramas de 2.99 y 1.99 bpw obtienen 18-19/20 en las pruebas de chat del autor, adecuadas para demos internas.
- Experimentación con visión: la torre de visión se conserva en bf16, por lo que se puede evaluar el comportamiento multimodal sin recuantizar esa parte.

## Benchmarks y rendimiento

| Rama | KLD | Top-1 | PPL | GSM8K (de 100) | HumanEval (de 50) | Chat (de 20) | Tamano (GB) |
|---|---:|---:|---:|---:|---:|---:|---:|
| source (referencia) | 0 | 100% | 3,56 | 98 | 49 | 18 | 393,5 |
| 2.99 bpw | 0,297 | 82,5% | 4,87 | 95 | 48 | 19 | 228,4 |
| 1.99 bpw | 0,527 | 74,4% | 6,20 | 96 | 49 | 18 | 154,3 |
| 1.02 bpw | 1,215 | 59,2% | 12,36 | 90 | 48 | 18 | 82,5 |

Las metricas KLD, top-1 y PPL se calcularon sobre 8.192 tokens de test de wikitext-2. Las tareas GSM8K, HumanEval y chat usan decodificación greedy, plantilla de chat y modo thinking desactivado. El autor advierte de que una diferencia de 2-3 puntos en GSM8K está dentro del ruido con 100 problemas.

## Requisitos de hardware

- VRAM estimada: la rama de 2.99 bpw ocupa 228,4 GB, la de 1.99 bpw 154,3 GB y la de 1.02 bpw 82,5 GB (incluyendo 4,1 GB de torre de visión y cabezal MTP sin cuantizar).
- El modelo completo supera una GPU de 96 GB; el autor probó con streaming de capas o manteniendo el tronco en GPU y paginando los expertos enrutados bajo demanda.
- GPU recomendadas: no disponibles de forma explícita; por tamano, se requieren configuraciones multi-GPU o GPUs con gran cantidad de memoria (A100 80 GB, H100 80 GB) combinadas con paginación.
- En GPU consumer: la rama de 1.02 bpw (82,5 GB) no cabe en una RTX 4090 (24 GB) sin paginación agresiva a RAM del sistema; requiere al menos 96 GB de RAM y almacenamiento NVMe rápido.
- Opciones de despliegue: exllamav3 con el parche `exllamav3-inkling2` incluido; no funciona en TabbyAPI ni en otros servidores exllamav3 por falta de paged-cache y soporte de Generator.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small-exl3 (2.99 bpw) | no disponible (MoE, 384 expertos/capa) | no disponible | Apache-2.0 | EXL3 | 228,4 GB, GSM8K 95, HumanEval 48 |
| Inkling-2-Small (original) | no disponible | no disponible | Apache-2.0 | safetensors (NVFP4/MXFP8) | 393,5 GB, GSM8K 98, HumanEval 49 |
| Otras cuantizaciones EXL3 de MoE | no disponible | no disponible | variable | EXL3 | no disponible |

No se dispone de información sobre modelos alternativos comparables en la misma categoría y tamano dentro de la documentación proporcionada.

## Limitaciones y advertencias

- La rama de 1.02 bpw está degradada: pierde 8 puntos en GSM8K y su KLD supera 1, por lo que no se recomienda para producción.
- El KLD muestra deriva real en todas las tasas de bits, incluso cuando las puntuaciones de tareas parecen correctas.
- Las tareas de evaluación son cortas y fáciles, con thinking desactivado; no se probaron razonamiento largo, contexto largo, chat multi-turno ni uso de herramientas.
- La asignación de bits del asignador dio K bajo a las capas tardías, lo que concentra la mayor parte del KLD: en 2.99 bpw, las nueve capas K1 causan aproximadamente el 75% del KLD, y todas las capas K1 y K2 juntas cerca del 94%.
- El parche de exllamav3 no es upstream, no soporta paged-cache ni Generator, y no funciona en TabbyAPI u otros servidores exllamav3.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el formato EXL3 y exllamav3 son MIT; verificar compatibilidad en despliegues derivados.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá del comportamiento del modelo base.
- El modelo completo no cabe en una GPU de 96 GB; el despliegue requiere streaming o paginación, lo que afecta a la latencia.

## Enlaces

- Hugging Face: https://huggingface.co/OpensourceWTF/Inkling-2-Small-exl3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Parche de carga: https://huggingface.co/OpensourceWTF/Inkling-2-Small-exl3/tree/main/exllamav3-inkling2
- Rama 2.99 bpw: https://huggingface.co/OpensourceWTF/Inkling-2-Small-exl3/tree/2.99bpw
- Rama 1.99 bpw: https://huggingface.co/OpensourceWTF/Inkling-2-Small-exl3/tree/1.99bpw
- Rama 1.02 bpw: https://huggingface.co/OpensourceWTF/Inkling-2-Small-exl3/tree/1.02bpw
