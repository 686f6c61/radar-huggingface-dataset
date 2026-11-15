# Oursdesvosges/coilstellaration-phys-resnet-lm-fixed

## Resumen

PhysResNet-LM v2.1 (Fixed-Shape) es un modelo de inferencia en ONNX desarrollado por el usuario Oursdesvosges para el benchmark CoilStellaration de Proxima Fusion, centrado en el diseno de bobinas para reactores de fusion de tipo stellarator. El modelo resuelve el problema inverso de generar geometrias de bobinas y corrientes a partir de una frontera de plasma dada y unos requisitos de metrica, combinando una red ResNet condicionada por FiLM con un solver analitico de Gauss-Newton / Levenberg-Marquardt embebido directamente en el grafo ONNX.

La arquitectura no es un transformer de lenguaje, sino una ResNet fisicamente informada (physics-informed) que opera sobre una rejilla discreta de 44x44x192. El modelo selecciona entre una prediccion neuronal y una plantilla parametrica de filamentos conformes al plasma, y despues refina las bobinas y corrientes mediante jacobianos analiticos calculados con GEMM centrado de rango 6. El artefacto es un unico fichero `model.onnx` de 35,21 MiB (por debajo del limite de 50 MiB del benchmark), con opset 17 y ejecucion en CPU mediante `CPUExecutionProvider`.

Su relevancia radica en que obtiene una puntuacion global de 0,9773 en el split oficial de evaluacion del benchmark, con un 87,15% de factibilidad estricta, ejecutandose exclusivamente en CPU. Esto lo posiciona como una solucion autocontenida y desplegable sin GPU para un problema de optimizacion fisica de alta dimensionalidad en el contexto de la fusion por confinamiento magnetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FiLM-conditioned physics ResNet + Dual-Init warm-start + solver ONNX Loop (Gauss-Newton / Levenberg-Marquardt) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo no generativo de texto; opera sobre rejilla 44x44x192) |
| Tipos de cuantizacion | no disponible (artefacto ONNX float32; sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, fichero unico `model.onnx`, sin sidecars `.data`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia "FiLM-conditioned physics ResNet". La etapa E (`PhysResNet`, con `NFP = 3` y `N_c = 5`) decide entre la salida de la red (`x_net`) y una plantilla parametrica de filamentos conformes al plasma (`x_tmpl`) sobre una rejilla fisica discreta de 44x44x192. A continuacion, un modulo `LMRefinerModule` embebido en el grafo ONNX (con `Loop = 1` e `If = 27`) refina las bobinas y las corrientes mediante jacobianos analiticos de GEMM centrado de rango 6, con `K = 8`, `max_iters = 46`, `cg_iters = 24`, rejilla LM de 28x28x128, normalizacion de columnas de Marquardt (`col_eps = 1e-2`), `mu_min = 8e-4`, regularizacion a cero para modos `k >= 5` (`reg_to_zero = True`), una guarda de optimismo de salto de comprobacion de +0,25 y una puerta de salida temprana sobre la rejilla 44x44x192.

La disciplina de entrenamiento y ajuste se realizo estrictamente sobre `val_holdout_suite.pkl` (`N = 360` fronteras muestreadas de `split="train"`). Segun la model card, ningun dato de `split="eval"` se utilizo para entrenamiento ni para ajuste de hiperparametros. El dataset de referencia es `proxima-fusion/coilstellaration` (revision `f505cc890ff2f5cf24a6d68f4b5156d0a3fecb5c`, `bench_version=1.0`), asociado al paper arXiv:2611.12689. No se detalla en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento, dado que no es un modelo de lenguaje.

## Capacidades

- Prediccion de geometrias de bobinas (`coil_x_n`, `coil_y_n`, `coil_z_n`) y corrientes (`currents`) a partir de una frontera de plasma (`boundary_r_cos`, `boundary_z_sin`) y unos requisitos de metrica (`requirement_metrics`).
- Seleccion adaptativa entre prediccion neuronal y plantilla parametrica de filamentos conformes al plasma.
- Refinamiento iterativo mediante solver analitico de Gauss-Newton / Levenberg-Marquardt embebido en ONNX.
- Ejecucion exclusiva en CPU mediante `CPUExecutionProvider` (sin necesidad de GPU).
- Soporte de configuracion de periodos de campo (`n_field_periods`) y bobinas por medio periodo (`n_coils_per_half_period`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step en lenguaje natural ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Diseno de bobinas para stellarators: el modelo genera geometrias de bobinas y corrientes a partir de una frontera de plasma y requisitos de metrica, lo que permite explorar configuraciones de campo magnetico sin resolver manualmente el problema inverso.
- Optimizacion de factibilidad en pipelines de diseno: con un 87,15% de factibilidad estricta en el split oficial, puede integrarse como etapa de generacion inicial en flujos de optimizacion de reactores de fusion.
- Evaluacion comparativa de benchmarks: sirve como submission de referencia en el benchmark CoilStellaration (`fixed_shape`), permitiendo comparar metodos de diseno de bobinas bajo una misma metrica.
- Despliegue en entornos sin GPU: al ejecutarse con ONNX Runtime en CPU (latencia media de 1900,6 ms en 8 vCPU), es adecuado para servidores sin aceleradores o para prototipado en estaciones de trabajo.
- Generacion de warm-starts para solvers externos: la salida del modelo puede usarse como punto de partida para optimizadores fisicos mas costosos, reduciendo el numero de iteraciones necesarias.
- Investigacion en metodos physics-informed: la combinacion de ResNet condicionada por FiLM con jacobianos analiticos embebidos sirve como referencia reproducible para investigacion en aprendizaje fisicamente informado aplicado a fusion.
- Validacion de plantillas parametricas: la seleccion entre `x_net` y `x_tmpl` permite estudiar cuando una plantilla fisica supera a la prediccion neuronal en distintos estratos de dificultad (`loose`, `medium`, `tight`).

## Benchmarks y rendimiento

Resultados oficiales en `split="eval"` (`bench_version=1.0`, `overall_score=0.9773`):

| Track / Estrato | N | Puntuacion media | Mediana | p10 | Factibilidad >= 0.9 | Factibilidad estricta |
|---|---:|---:|---:|---:|---:|---:|
| `fixed_shape` | 2.771 | 0,9773 | 1,0000 | 0,9737 | 94,37% | 87,15% |
| `fixed_shape/loose` | 1.026 | 0,9814 | 1,0000 | 1,0000 | 96,39% | 95,91% |
| `fixed_shape/medium` | 861 | 0,9727 | 1,0000 | 0,9550 | 93,50% | 83,39% |
| `fixed_shape/tight` | 884 | 0,9770 | 1,0000 | 0,9337 | 92,87% | 80,66% |

Holdout de validacion (`split="train"`, `N = 360`):

| Track | N | Puntuacion media | p10 | Factibilidad >= 0.9 | Factibilidad estricta |
|---|---:|---:|---:|---:|---:|
| `fixed_shape` | 360 | 0,9801 | 0,9845 | 94,72% | 88,33% |

Latencia en 8 vCPU con ONNX Runtime (`CPUExecutionProvider`, `intra_op=8`, `N = 200`):

| Metrica | Valor |
|---|---|
| Media | 1900,6 ms |
| Mediana | 1206,8 ms |
| p90 | 6522,3 ms |
| Maximo | 6985,2 ms |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU mediante `CPUExecutionProvider`.
- GPU recomendadas: no aplica (el artefacto esta disenado para CPU). No se documenta soporte de `CUDAExecutionProvider`.
- Cabe en GPU consumer: no aplica; no requiere GPU.
- Opciones de despliegue: ONNX Runtime (probado con `CPUExecutionProvider`, `intra_op=8`). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: media de 1900,6 ms, mediana de 1206,8 ms, p90 de 6522,3 ms y maximo de 6985,2 ms en una asignacion de 8 vCPU inactivas, medidas separadas del array de scoring Slurm de 384 workers.
- Tamano del artefacto: 35,21 MiB (por debajo del limite de 50 MiB del benchmark), fichero unico sin sidecars `.data`.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables en la informacion proporcionada. El benchmark CoilStellaration define un track `fixed_shape` con una metrica comun, pero no se incluyen resultados de otras submissions en la documentacion disponible.

| Modelo | Parametros | Contexto | Puntuacion `fixed_shape` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhysResNet-LM v2.1 (Fixed-Shape) | no disponible | no aplica | 0,9773 | Apache 2.0 | ONNX en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio especifico (diseno de bobinas para stellarators); no es un modelo de lenguaje ni un modelo generativo de proposito general.
- La puntuacion se ha medido exclusivamente en el track `fixed_shape`; no se documentan resultados para otros tracks del benchmark.
- El rendimiento depende del solver LM embebido y de hiperparametros fijados (`K = 8`, `max_iters = 46`, `mu_min = 8e-4`, etc.); cambios en la configuracion pueden alterar la factibilidad.
- Latencia con alta variabilidad: la diferencia entre mediana (1206,8 ms) y p90 (6522,3 ms) es de mas de 5x, lo que puede afectar a despliegues con requisitos de latencia estricta.
- No se documentan sesgos conocidos ni riesgo de alucinacion en el sentido de modelos de lenguaje; el riesgo principal es la generacion de geometrias de bobinas no factibles en estratos dificiles (factibilidad estricta del 80,66% en `tight`).
- No se documentan limitaciones de idioma ni de contexto (no aplicables).
- Licencia Apache 2.0: permite uso comercial con atribucion y sin garantias; revisar los terminos del dataset `proxima-fusion/coilstellaration` para uso de datos derivados.
- No se documenta soporte para GPU ni para otros execution providers de ONNX Runtime; el despliegue esta limitado a CPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oursdesvosges/coilstellaration-phys-resnet-lm-fixed
- Dataset CoilStellaration: https://huggingface.co/datasets/proxima-fusion/coilstellaration
- Paper de referencia: arXiv:2611.12689 (https://arxiv.org/abs/2611.12689)
- Proxima Fusion: https://huggingface.co/proxima-fusion
