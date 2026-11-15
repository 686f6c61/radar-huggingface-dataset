# Oursdesvosges/coilstellaration-phys-resnet-lm-universal

## Resumen

PhysResNet-LM v2.1 (Universal) es un modelo de optimización física, no un modelo de lenguaje, publicado por el usuario Oursdesvosges como participación en el benchmark CoilStellaration de Proxima Fusion. Resuelve el problema inverso de diseño de bobinas para reactores de fusión de tipo stellarator: dado un contorno de plasma (armónicos de Fourier del boundary) y un conjunto de requisitos de rendimiento, predice la geometría 3D de las bobinas y las corrientes necesarias para generarla. Se distribuye como un único fichero ONNX autocontenido de 41,01 MiB, diseñado para ejecutarse en CPU sin dependencias externas.

La arquitectura combina una red ResNet con física incorporada (physics-informed) que puntúa tanto la solución de la red como una plantilla paramétrica de filamentos, seguida de un solver Gauss-Newton / Levenberg-Marquardt con Jacobiano analítico embebido directamente en el grafo ONNX mediante operadores `Loop` e `If`. El modelo cubre las 17 topologías posibles del benchmark (NFP de 2 a 5, N_c de 4 a 8) en las dos pistas oficiales, `fixed_shape` y `variable_shape`, lo que justifica la etiqueta "universal".

Es relevante en el contexto de la optimización de stellarators porque demuestra que un modelo compacto de 41 MiB puede alcanzar una puntuación global de 0,9712 en el conjunto de evaluación oficial, con una tasa de factibilidad estricta del 87,15% en `fixed_shape` y del 84,85% en `variable_shape`, ejecutándose íntegramente en CPU en tiempos de mediana de 1,4 a 1,5 segundos por instancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet physics-informed multi-topologia + solver GN/LM con Jacobiano analitico embebido en ONNX (`Loop`, `If`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada = armonicos de Fourier del boundary y metricas de requisitos) |
| Tipos de cuantizacion | no disponible (pesos en precision original dentro del ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), fichero unico `model.onnx` de 41,01 MiB, sin sidecars `.data` |

## Arquitectura y entrenamiento

El modelo se estructura en dos etapas. La primera es una ResNet universal (denominada Stage-D `PhysResNet`) que evalúa simultáneamente la predicción de la red (`x_net`) y una plantilla paramétrica de filamentos (`x_tmpl`) sobre una rejilla de verificación de 44x44x192. La segunda etapa es un módulo de refinamiento `LMRefinerModule` que ejecuta un solver Gauss-Newton / Levenberg-Marquardt con Jacobiano analítico, escalado de columnas de Marquardt y parámetros concretos: `K = 8`, `max_iters = 46`, `cg_iters = 24`, rejilla LM de 28x28x128, `col_eps = 1e-2`, `mu_min = 8e-4`, regularización a cero para `k >= 5` y guarda de omisión de comprobación de +0,25. El warm-start se realiza mediante una inicialización dual sobre una rejilla de 44x44x192.

El entrenamiento y el ajuste de hiperparámetros se seleccionaron estrictamente sobre `val_holdout_suite.pkl`, con 360 fronteras fijas y 450 variables muestreadas de `split="train"`. El autor declara explícitamente que ningún dato de `split="eval"` se utilizó en entrenamiento ni en tuning. El dataset de referencia es `proxima-fusion/coilstellaration` (revisión `f505cc890ff2f5cf24a6d68f4b5156d0a3fecb5c`, `bench_version=1.0`, `arXiv:2611.12689`). No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO, por tratarse de un dominio físico y no lingüístico.

## Capacidades

- Predicción de geometría 3D de bobinas (`coil_x_n`, `coil_y_n`, `coil_z_n`) y corrientes a partir del contorno de plasma y métricas de requisitos.
- Cobertura de las 17 topologías del benchmark: `NFP in {2..5}` y `N_c in {4..8}`.
- Soporte de las dos pistas oficiales: `fixed_shape` y `variable_shape`.
- Refinamiento físico interno mediante solver GN/LM con Jacobiano analítico, sin dependencias externas.
- Ejecución autocontenida en CPU vía `onnxruntime` con `CPUExecutionProvider`.
- Entrada de requisitos de rendimiento como vector de cuatro métricas (`requirement_metrics`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso lingüístico, multilingüismo, visión ni audio: es un modelo de optimización física.

## Casos de uso

- Diseño inverso de bobinas en stellarators: dado un boundary de plasma y requisitos de rendimiento, el modelo devuelve geometría y corrientes de bobina listas para evaluación, sustituyendo iteraciones de optimización numérica costosas por una inferencia de ~1,5 s de mediana en CPU.
- Exploración de topologías en fase de pre-diseño: al cubrir las 17 combinaciones de `(NFP, N_c)`, permite barrer configuraciones de campo periódico y número de bobinas por medio periodo sin reentrenar.
- Generación de warm-starts para solvers de mayor fidelidad: las salidas pueden inicializar códigos de equilibrio magnetohidrodinámico o de optimización de bobinas, reduciendo el número de iteraciones necesarias.
- Evaluación comparativa en el benchmark CoilStellaration: el modelo sirve como baseline reproducible en las pistas `fixed_shape` y `variable_shape` con la revisión de dataset fijada.
- Despliegue en entornos sin GPU: al ser un ONNX de 41 MiB ejecutable en CPU, encaja en clústeres de validación, contenedores ligeros o estaciones de trabajo sin acelerador.
- Filtrado rápido de candidatos en pipelines de optimización: la tasa de factibilidad estricta (87,15% en `fixed_shape`, 84,85% en `variable_shape`) permite descartar configuraciones inviables antes de lanzar simulaciones caras.
- Integración en flujos de CI para regresión de modelos físicos: el fichero único ONNX y la licencia Apache 2.0 facilitan pruebas automatizadas de reproducibilidad.

## Benchmarks y rendimiento

Resultados oficiales en `split="eval"` (`bench_version=1.0`, `overall_score=0.9712`):

| Pista / estrato | N | Media | Mediana | p10 | Fact. >= 0,9 | Fact. estricta |
|---|---:|---:|---:|---:|---:|---:|
| `fixed_shape` | 2.771 | 0,9772 | 1,0000 | 0,9728 | 94,12% | 87,15% |
| `fixed_shape/loose` | 1.026 | 0,9957 | 1,0000 | 1,0000 | 98,93% | 98,44% |
| `fixed_shape/medium` | 861 | 0,9657 | 1,0000 | 0,9377 | 92,22% | 82,00% |
| `fixed_shape/tight` | 884 | 0,9668 | 1,0000 | 0,9193 | 90,38% | 79,07% |
| `variable_shape` | 8.058 | 0,9653 | 1,0000 | 0,9402 | 91,86% | 84,85% |
| `variable_shape/loose` | 2.697 | 0,9926 | 1,0000 | 1,0000 | 98,48% | 97,66% |
| `variable_shape/medium` | 2.660 | 0,9648 | 1,0000 | 0,9330 | 91,62% | 83,35% |
| `variable_shape/tight` | 2.701 | 0,9385 | 1,0000 | 0,8130 | 85,49% | 73,53% |

Validación sobre holdout de `split="train"`:

| Pista | N | Media | p10 | Fact. >= 0,9 | Fact. estricta |
|---|---:|---:|---:|---:|---:|
| `fixed_shape` | 360 | 0,9783 | 0,9790 | 93,89% | 86,67% |
| `variable_shape` | 450 | 0,9562 | 0,8974 | 89,33% | 82,00% |

Latencia medida en 8 vCPU con `CPUExecutionProvider` e `intra_op=8`, N = 200 por pista:

| Pista | Media (ms) | Mediana (ms) | p90 (ms) | Max (ms) |
|---|---:|---:|---:|---:|
| `fixed_shape` | 1.897,4 | 1.421,6 | 5.688,3 | 6.599,2 |
| `variable_shape` | 2.623,0 | 1.496,2 | 6.590,1 | 15.851,8 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos del mismo benchmark.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU con `CPUExecutionProvider`.
- GPU recomendadas: no aplica; no se documenta soporte de ejecución en GPU.
- Cabe en cualquier CPU moderna: fichero ONNX de 41,01 MiB, sin necesidad de GPU de consumo.
- Despliegue: `onnxruntime` (opset 17), `CPUExecutionProvider`, `intra_op=8` en la medición de referencia; descarga vía `huggingface_hub.hf_hub_download`.
- Latencia: mediana de 1.421,6 ms en `fixed_shape` y 1.496,2 ms en `variable_shape` sobre 8 vCPU; p90 de 5.688,3 ms y 6.590,1 ms respectivamente; máximo de 15.851,8 ms en `variable_shape`.
- Throughput: no disponible más allá de las latencias por instancia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre otros modelos del benchmark CoilStellaration con los que comparar parámetros, contexto, rendimiento o licencia. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhysResNet-LM v2.1 (Universal) | no disponible | no aplica | overall_score 0,9712 | Apache 2.0 | ONNX en Hugging Face |
| Alternativas del benchmark | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de optimización física, no un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- El rendimiento cae en el estrato `tight`: media de 0,9385 y factibilidad estricta del 73,53% en `variable_shape`, frente al 97,66% del estrato `loose`.
- La cola de latencia es alta: máximo de 15.851,8 ms en `variable_shape`, lo que puede ser problemático en pipelines con plazos estrictos.
- El modelo está acoplado a la versión del benchmark (`bench_version=1.0`) y a la revisión concreta del dataset; cambios en el benchmark pueden invalidar las métricas declaradas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del dataset `proxima-fusion/coilstellaration`, cuyas condiciones de uso deben verificarse por separado.
- No se documentan sesgos en el sentido lingüístico; sin embargo, el rendimiento depende de la distribución de topologías y estratos del benchmark y puede degradarse fuera de ella.
- El autor declara que no se tocó `split="eval"` en entrenamiento ni tuning, pero no se dispone de verificación independiente en la información proporcionada.
- No se documentan cuantizaciones alternativas ni soporte de GPU; el despliegue está pensado para CPU con `onnxruntime`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oursdesvosges/coilstellaration-phys-resnet-lm-universal
- Dataset del benchmark: https://huggingface.co/datasets/proxima-fusion/coilstellaration
- Paper de referencia: https://arxiv.org/abs/2611.12689
- Repositorio de ONNX Runtime: https://github.com/microsoft/onnxruntime
- Documentación de `huggingface_hub`: https://huggingface.co/docs/huggingface_hub
