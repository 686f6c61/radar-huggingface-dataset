# Oursdesvosges/coilstellaration-phys-resnet-loopfree-universal

## Resumen

PhysResNet-LoopFree v2.3 (Universal) es un modelo ONNX de inferencia en CPU especializado en el diseno inverso de bobinas para reactores de fusión de tipo stellarator, desarrollado por el usuario Oursdesvosges para el benchmark CoilStellaration de Proxima Fusion. No es un modelo de lenguaje: resuelve un problema de optimización geometrica y fisica, prediciendo la geometria de las bobinas (coordenadas normalizadas y corrientes) a partir de la forma del plasma de frontera y de una serie de requisitos fisicos.

La arquitectura combina una red ResNet fisicamente informada (physics-informed neural network) con dos etapas diferenciables de corrección, un selector ligero de inicialización dual y un paso desenrollado de Gauss-Newton con Jacobiano analitico que se activa condicionalmente mediante una compuerta discreta. El grafo ONNX exportado es aciclico (loop-free), lo que garantiza una latencia predecible en CPU sin bucles de control.

Su relevancia radica en que cubre las 17 topologias posibles de `(NFP, N_c)` del benchmark, tanto en la pista `fixed_shape` como en `variable_shape`, en un unico fichero de 36,54 MiB que cabe en el limite de 50 MiB impuesto por la competición. Segun la model card, alcanza un `overall_score` oficial de 0,5160 sobre el `split="eval"`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet fisicamente informada (physics-informed) + selector Dual-Init + paso Gauss-Newton desenrollado con Jacobiano analitico, todo exportado como grafo ONNX aciclico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo geometrico, no secuencial) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX float32) |
| Idiomas soportados | no aplica (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 17, fichero unico de 36,54 MiB, sin sidecars `.data`) |

## Arquitectura y entrenamiento

El modelo se estructura en tres bloques segun la model card. Primero, un `PhysResNet` multi-topologia de etapa E con dos `CorrectorStage` diferenciables. Segundo, un selector Dual-Init con rejilla `16x16x64` y `pdist_cov=1.2` que elige entre la prediccion de la red (`x_net`) y una plantilla (`x_tmpl`) como punto de partida. Tercero, una etapa de Gauss-Newton con Jacobiano analitico desenrollada sobre una rejilla LM de `14x14x48`, con `cg_iters = 14` y `col_eps = 1e-2`, que se ejecuta solo cuando el warm-start falla una compuerta discreta implementada como nodo `If` en el grafo ONNX. La exportación garantiza `Loop = 0`, es decir, ningun bucle dinamico en el grafo.

El entrenamiento y la seleccion de hiperparametros se realizaron estrictamente sobre `val_holdout_suite.pkl`, con `N = 360` fronteras de la pista `fixed_shape` y `N = 450` de `variable_shape`, muestreadas del `split="train"` del dataset `proxima-fusion/coilstellaration` (revision `f505cc890ff2f5cf24a6d68f4b5156d0a3fecb5c`, `bench_version=1.0`). Segun el autor, no se toco ningun dato del `split="eval"` durante el entrenamiento ni la seleccion de hiperparametros. El modelo soporta las 17 combinaciones de `NFP in {2..5}` y `N_c in {4..8}`.

## Capacidades

- Prediccion de geometria de bobinas: devuelve `coil_x_n`, `coil_y_n`, `coil_z_n` (coordenadas normalizadas) y `currents` a partir de la frontera del plasma (`boundary_r_cos`, `boundary_z_sin`).
- Condicionamiento por requisitos fisicos: acepta un vector `requirement_metrics` de cuatro componentes que modula la solucion.
- Soporte multi-topologia: cubre las 17 combinaciones de numero de periodos de campo (`NFP`) y numero de bobinas por medio periodo (`N_c`).
- Soporte de dos pistas del benchmark: `fixed_shape` y `variable_shape`.
- Inferencia en CPU pura mediante `CPUExecutionProvider` de ONNX Runtime, sin dependencia de GPU.
- Grafo aciclico sin bucles, con una unica rama condicional `If` para el refinamiento Gauss-Newton.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingues, al no ser un modelo linguistico.

## Casos de uso

- Diseno exploratorio de stellarators: dado un contorno de plasma y unos requisitos fisicos, generar rapidamente una geometria de bobinas factible como punto de partida para un optimizador de mayor fidelidad.
- Filtrado masivo de configuraciones: con latencias medias de 126-141 ms en 8 vCPU, permite evaluar miles de candidatos en paralelo para descartar regiones inviables antes de simulaciones costosas.
- Barrido de topologias: comparar sistematicamente las 17 combinaciones de `(NFP, N_c)` para identificar cuales ofrecen mejor factibilidad bajo un conjunto dado de requisitos.
- Integración en pipelines de CI o validacion: al ser un unico fichero ONNX de 36,54 MiB, se puede versionar y desplegar en entornos sin GPU para pruebas de regresion geometrica.
- Prototipado educativo o de investigacion: servir como baseline reproducible del benchmark CoilStellaration en articulos o comparativas.
- Precalentamiento (warm-start) de optimizadores clasicos: usar la salida como inicializacion para metodos de optimizacion de mayor coste computacional en el diseno de bobinas.
- Analisis de sensibilidad: variar `requirement_metrics` y observar como cambia la geometria propuesta, util para estudiar compromisos entre metricas fisicas.

## Benchmarks y rendimiento

Resultados oficiales sobre `split="eval"` (`bench_version=1.0`, `overall_score=0.5160`), segun la model card:

| Pista / estrato | N | Score medio | Mediana | p10 | Feas >= 0,9 | Strict Feas |
|---|---:|---:|---:|---:|---:|---:|
| `fixed_shape` | 2.771 | 0,5176 | 0,4149 | 0,0237 | 36,45 % | 33,31 % |
| `fixed_shape/loose` | 1.026 | 0,9458 | 1,0000 | 0,8086 | 86,65 % | 81,29 % |
| `fixed_shape/medium` | 861 | 0,4049 | 0,3187 | 0,0536 | 13,94 % | 10,22 % |
| `fixed_shape/tight` | 884 | 0,1303 | 0,0800 | 0,0049 | 0,11 % | 0,11 % |
| `variable_shape` | 8.058 | 0,5144 | 0,4328 | 0,0257 | 33,36 % | 29,32 % |
| `variable_shape/loose` | 2.697 | 0,9294 | 1,0000 | 0,7149 | 82,28 % | 74,94 % |
| `variable_shape/medium` | 2.660 | 0,4703 | 0,4126 | 0,0692 | 17,26 % | 12,78 % |
| `variable_shape/tight` | 2.701 | 0,1434 | 0,0871 | 0,0041 | 0,37 % | 0,07 % |

Validacion sobre holdout de `split="train"`:

| Pista | N | Score medio | p10 | Feas >= 0,9 | Strict Feas |
|---|---:|---:|---:|---:|---:|
| `fixed_shape` | 360 | 0,4808 | 0,0276 | 31,67 % | 28,33 % |
| `variable_shape` | 450 | 0,5263 | 0,0319 | 36,00 % | 31,33 % |

Latencia medida en 8 vCPU con `CPUExecutionProvider` e `intra_op=8`, `N = 200` por pista:

| Pista | Media | Mediana | p90 | Max |
|---|---:|---:|---:|---:|
| `fixed_shape` | 125,9 ms | 123,5 ms | 166,7 ms | 249,3 ms |
| `variable_shape` | 141,0 ms | 128,5 ms | 206,6 ms | 353,1 ms |

## Requisitos de hardware

- Inferencia exclusivamente en CPU: no requiere GPU ni VRAM dedicada.
- Memoria: el fichero ONNX ocupa 36,54 MiB; el consumo de RAM en ejecucion es del orden de cientos de MiB, aunque no se ha publicado una cifra exacta.
- CPU recomendada: configuracion de 8 vCPU con `intra_op=8` es la que reporta las latencias anteriores (126-141 ms de media).
- No cabe plantearse consumer GPU: el modelo esta pensado para `CPUExecutionProvider`; no se documenta soporte CUDA o TensorRT.
- Opciones de despliegue: ONNX Runtime (Python u otros bindings) con `CPUExecutionProvider`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput estimado: aproximadamente 7-8 inferencias por segundo por instancia de 8 vCPU segun la latencia media reportada, sin contabilizar paralelizacion entre procesos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables del benchmark CoilStellaration en la documentacion proporcionada. La model card no incluye comparaciones con baselines ni con otras submissions.

| Modelo | Parametros | Contexto | Score eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhysResNet-LoopFree v2.3 | no disponible | no aplica | 0,5160 | Apache 2.0 | ONNX en HF |
| Alternativas del benchmark | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy desigual por estrato: en los estratos `tight` el score medio cae a 0,13-0,14 y la factibilidad estricta es practicamente nula (0,11 % en `fixed_shape/tight`, 0,07 % en `variable_shape/tight`).
- En estratos `medium` la factibilidad estricta ronda el 10-13 %, lo que limita su uso como solucion final sin refinamiento posterior.
- Modelo de un unico autor con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso independiente ni replicacion externa de los resultados.
- Depende de la version exacta del benchmark (`bench_version=1.0`) y de la revision del dataset (`f505cc...`); cambios en el benchmark pueden invalidar los scores reportados.
- El modelo no es linguistico: no ofrece generacion de texto, razonamiento simbolico general ni capacidades multilingues.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero si existe el riesgo de sobreajuste a la distribucion del `split="train"` del dataset CoilStellaration, lo que puede degradar el rendimiento fuera de esa distribucion.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia sobre la validez fisica de las geometrias generadas; cualquier uso en diseno real de reactores requiere validacion con simulaciones de alta fidelidad.
- No se han publicado detalles sobre cuantizacion ni sobre el numero de parametros, lo que dificulta estimar el coste de reentrenamiento o de adaptacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oursdesvosges/coilstellaration-phys-resnet-loopfree-universal
- Dataset del benchmark: https://huggingface.co/datasets/proxima-fusion/coilstellaration
- Referencia arXiv citada en la model card: arXiv:2611.12689 (no se proporciona URL directa en la informacion disponible)
