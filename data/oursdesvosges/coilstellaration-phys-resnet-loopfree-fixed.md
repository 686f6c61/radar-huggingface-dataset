# Oursdesvosges/coilstellaration-phys-resnet-loopfree-fixed

## Resumen

PhysResNet-LoopFree v2 (Fixed-Shape) es un modelo ONNX autocontenido desarrollado por el usuario Oursdesvosges para el benchmark CoilStellaration de Proxima Fusion, centrado en el diseno de bobinas para reactores de fusion de tipo stellarator. El modelo resuelve el problema inverso de generar geometrias de bobinas (`coil_x_n`, `coil_y_n`, `coil_z_n`) y corrientes a partir de una frontera de plasma (`boundary_r_cos`, `boundary_z_sin`) y unos requisitos de metricas fisicas, para la variante de forma fija con `NFP = 3` y `N_c = 5`.

Tecnicamente combina una red ResNet feedforward con condicionamiento FiLM (denominada `PhysResNetBackbone`) con tres bloques `CorrectorStage` diferenciables y seis pasos desenrollados de Gauss-Newton con jacobiano analitico, todo exportado como un grafo ONNX sin bucles (`Loop = 0`). El artefacto pesa 36,34 MiB, usa opset 17 y se ejecuta en CPU mediante `CPUExecutionProvider`, lo que lo hace desplegable sin GPU.

Su relevancia radica en que aborda un problema de fisica de plasmas con un enfoque hibrido aprendizaje-profisica, alcanzando un `overall_score` de 0,7158 en el split oficial `eval` del benchmark, con una latencia media de 572,9 ms en 8 vCPU. La licencia Apache 2.0 facilita su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet feedforward con condicionamiento FiLM + 3 bloques `CorrectorStage` + 6 pasos desenrollados de Gauss-Newton (grafo ONNX sin bucles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada estructurada: matrices `5x9` de frontera y vector de 4 metricas) |
| Tipos de cuantizacion | no disponible (artefacto ONNX en float32) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 17, sin sidecars `.data` externos) |

## Arquitectura y entrenamiento

El modelo es una red puramente feedforward sin recurrencia ni atencion: un backbone ResNet condicionado por FiLM (Stage-E) que procesa la frontera del plasma y las metricas de requisito, seguido de tres bloques `CorrectorStage` diferenciables. Sobre esa salida se aplica un selector Dual-Init que compara la prediccion de red (`x_net`) con una plantilla de filamentos conforme al plasma (`x_tmpl`) mediante una comparacion `36x36x144`, y despues seis pasos de Gauss-Newton desenrollados en linea recta con jacobiano analitico (Rank-6, GEMM centrado, malla LM `22x22x96`, `K = 8`, `cg_iters = 24`, `col_eps = 1e-2`, `reg_to_zero = True` para `k >= 5`). Todo el pipeline se exporta como un unico grafo ONNX sin bucles.

El entrenamiento y el ajuste de hiperparametros (incluida la profundidad de los pasos desenrollados) se realizaron exclusivamente sobre `val_holdout_suite.pkl` con `N = 360` fronteras muestreadas de `split="train"`. Segun la model card, no se toco ningun dato de `split="eval"` durante el entrenamiento ni el tuning. El dataset de referencia es `proxima-fusion/coilstellaration` (revision `f505cc890ff2f5cf24a6d68f4b5156d0a3fecb5c`, `bench_version=1.0`). No se especifican en la informacion disponible el numero de tokens ni la composicion detallada del dataset de entrenamiento, ni si se empleo RLHF o DPO (no aplica en un modelo de fisica).

## Capacidades

- Generacion de geometrias de bobinas (`coil_x_n`, `coil_y_n`, `coil_z_n`) y corrientes para stellarators en la variante `fixed_shape` (`NFP = 3`, `N_c = 5`).
- Resolucion del problema inverso a partir de la frontera de plasma (`boundary_r_cos`, `boundary_z_sin`) y un vector de cuatro metricas de requisito.
- Refinamiento fisico mediante pasos de Gauss-Newton desenrollados con jacobiano analitico.
- Seleccion adaptativa entre prediccion de red y plantilla de filamentos conforme al plasma (Dual-Init).
- Inferencia en CPU sin GPU mediante ONNX Runtime (`CPUExecutionProvider`).
- No soporta tool calling, agentes, razonamiento multi-step generico ni capacidades multilingues: es un modelo de dominio especifico de fisica de plasmas.

## Casos de uso

- Exploracion de disenos de bobinas en stellarators: dado un contorno de plasma y unos requisitos de metricas, el modelo devuelve una geometria de bobinas y corrientes inicial que puede servir como punto de partida para optimizacion numerica posterior.
- Prototipado rapido en entornos sin GPU: al ejecutarse en CPU con ONNX Runtime y una latencia media de unos 573 ms, permite iterar sobre configuraciones en portatiles o nodos sin acelerador.
- Filtrado previo en pipelines de optimizacion: usar el modelo como generador de candidatos iniciales (surrogate) antes de lanzar simulaciones fisicas costosas, reduciendo el espacio de busqueda.
- Docencia e investigacion en fusion: permite experimentar con problemas inversos de configuracion magnetica sin infraestructura de simulacion pesada.
- Integracion en herramientas de diseno asistido: al ser un unico archivo ONNX autocontenido, se puede embeber en aplicaciones de escritorio o web (via runtime ONNX) para previsualizar configuraciones de bobinas.
- Benchmarking de metodos fisica-IA: sirve como referencia reproducible (score 0,7158 en `eval`) para comparar enfoques alternativos en el track `fixed_shape` de CoilStellaration.

## Benchmarks y rendimiento

Resultados oficiales en `split="eval"` (`bench_version=1.0`, `overall_score = 0,7158`):

| Track / Estrato | N | Score medio | Mediana | p10 | Feas >= 0,9 | Strict Feas |
|---|---:|---:|---:|---:|---:|---:|
| `fixed_shape` | 2.771 | 0,7158 | 0,8987 | 0,1561 | 49,95% | 44,14% |
| `fixed_shape/loose` | 1.026 | 0,9541 | 1,0000 | 0,9103 | 90,06% | 87,43% |
| `fixed_shape/medium` | 861 | 0,6709 | 0,7793 | 0,1682 | 37,17% | 27,87% |
| `fixed_shape/tight` | 884 | 0,4830 | 0,4598 | 0,0376 | 15,84% | 9,73% |

Validacion en holdout (`split="train"`, `N = 360`):

| Track | N | Score medio | p10 | Feas >= 0,9 | Strict Feas |
|---|---:|---:|---:|---:|---:|
| `fixed_shape` | 360 | 0,7165 | 0,1369 | 48,33% | 41,94% |

Latencia en 8 vCPU con ONNX Runtime (`CPUExecutionProvider`, `intra_op=8`, `N = 200`): media 572,9 ms, mediana 549,7 ms, p90 612,7 ms, maximo 1167,3 ms.

## Requisitos de hardware

- VRAM: no requiere GPU; el artefacto es un ONNX de 36,34 MiB pensado para CPU.
- GPU recomendadas: no aplica (el modelo declara `CPUExecutionProvider`); no se han publicado datos de rendimiento en GPU.
- Cabe en cualquier CPU moderna; el rendimiento medido usa 8 vCPU con `intra_op=8`.
- Despliegue: ONNX Runtime (Python u otros bindings), con `CPUExecutionProvider`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: media 572,9 ms, mediana 549,7 ms, p90 612,7 ms, maximo 1167,3 ms en 8 vCPU. Throughput no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El benchmark CoilStellaration evalua multiples envios, pero no se incluyen en la informacion los resultados de otros participantes ni sus especificaciones, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Score `fixed_shape` | Licencia | Formato |
|---|---|---|---|---|---|
| PhysResNet-LoopFree v2 (Fixed-Shape) | no disponible | no aplica | 0,7158 | Apache 2.0 | ONNX |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta restringido al track `fixed_shape` con `NFP = 3` y `N_c = 5`; no generaliza a otras configuraciones sin reentrenamiento.
- Rendimiento degradado en el estrato `tight`: score medio 0,4830 y solo 9,73% de strict feasibility, frente al 87,43% en `loose`. No es fiable para requisitos fisicos exigentes.
- La cola inferior es pronunciada: p10 de 0,1561 en `eval`, lo que indica que una fraccion apreciable de casos obtiene resultados pobres.
- El modelo no es linguistico ni conversacional; no debe usarse fuera del dominio de diseno de bobinas para stellarators.
- Riesgo de alucinacion en sentido fisico: puede producir geometrias que no satisfagan las restricciones reales; los resultados deben validarse con simulacion.
- No se han publicado analisis de sesgos (no aplica en el sentido habitual, pero el dataset puede introducir sesgos de muestreo en la distribucion de fronteras).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del dataset `proxima-fusion/coilstellaration` y del benchmark asociado.
- No hay informacion publica sobre el numero de parametros, composicion exacta del entrenamiento ni comportamiento fuera de la distribucion de `fixed_shape`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oursdesvosges/coilstellaration-phys-resnet-loopfree-fixed
- Dataset CoilStellaration: https://huggingface.co/datasets/proxima-fusion/coilstellaration
- Paper de referencia: arXiv:2611.12689 (https://arxiv.org/abs/2611.12689)
