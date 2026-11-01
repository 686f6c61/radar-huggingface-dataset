# OneScience-Group/PseudoTimePINN-BackwardFacingStep

## Resumen

PseudoTimePINN-BackwardFacingStep es un paquete de reproduccion experimental publicado por OneScience-Group que implementa una red neuronal informada por la fisica (PINN) con avance adaptativo en pseudo-tiempo para resolver el campo de flujo estacionario en un escalon de cara posterior (*backward-facing step*) a numero de Reynolds 800. El modelo predice velocidad y presion a partir de coordenadas espaciales `(x, y)` y se evalua contra un campo de referencia generado con SU2, sin usar ese campo para actualizar parametros supervisados.

El modelo acompana al articulo *When PINNs Go Wrong: Pseudo-Time Stepping Against Spurious Solutions* (arXiv:2604.23528), cuyo objetivo es demostrar que el avance en pseudo-tiempo evita soluciones espurias que aparecen en formulaciones PINN estandar. La red es un MLP con caracteristicas de Fourier (Fourier-feature MLP) entrenado con el optimizador SOAP durante 100.000 pasos en una unica DCU.

El paquete incluye los pesos (`best_model.pth` seleccionado en el paso 47.200 y `last_model.pth`), scripts de entrenamiento, inferencia y evaluacion, y depende de un dataset externo de referencia alojado en ModelScope. Su relevancia es metodologica: sirve como caso reproducible para estudiar convergencia, seleccion de checkpoints y validacion fisica no supervisada en PINNs aplicadas a mecanica de fluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con caracteristicas de Fourier (Fourier-feature MLP), formulacion PINN con avance adaptativo en pseudo-tiempo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada puntual `(x, y)`, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en `.pth` de PyTorch, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | en (documentacion y model card) |
| Licencia | other (terminos no detallados en la model card; el dataset de referencia se distribuye aparte y remite a los terminos del repositorio original) |
| Formato de pesos | PyTorch `.pth` (`weight/best_model.pth`, `weight/last_model.pth`) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa con codificacion de caracteristicas de Fourier que aproxima las componentes de velocidad y presion como funciones de las coordenadas `(x, y)`. La perdida combina residuales de las ecuaciones de Navier-Stokes con condiciones de contorno, sin termino de ajuste supervisado a datos: el campo SU2 de referencia se reserva exclusivamente para evaluacion. El entrenamiento incorpora un esquema de avance adaptativo en pseudo-tiempo, que es precisamente el mecanismo propuesto en el articulo para evitar que el optimizador converja a soluciones espurias.

El run incluido completo 100.000 pasos de entrenamiento en una unica DCU, empleando el optimizador SOAP. El checkpoint `best_model.pth` se selecciono en el paso 47.200 mediante una puntuacion de validacion fisica no etiquetada, mientras que `last_model.pth` se conserva porque la inferencia por defecto compara ambos checkpoints. Los puntos de entrenamiento de EDP y de contorno se generan por codigo; el unico fichero externo necesario es el campo SU2 de 31.265 puntos (`data/flow.vtu`, SHA256 `004f10b2b9ce1e38542537da648c1221730308310f1f7fa675dc7a92b4900d8a`).

## Capacidades

- Prediccion de campos de flujo estacionario bidimensional (velocidad `u` y presion) en la geometria de escalon de cara posterior a Re=800.
- Evaluacion de residuales fisicos y comparacion cuantitativa contra un campo de referencia SU2.
- Seleccion de checkpoint mediante validacion fisica no supervisada (sin etiquetas).
- Entrenamiento reproducible de PINNs con pseudo-tiempo adaptativo sobre GPU o acelerador DCU.
- Generacion de puntos de colocacion de EDP y de contorno a partir del codigo incluido.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo numerico de dominio especifico.

## Casos de uso

- Validacion de metodologia PINN: reproducir el experimento de Re=800 y comparar el error relativo L2 en `u` con la Tabla 1 del articulo, util para grupos que evaluan tecnicas anti-soluciones-espurias.
- Estudio de pseudo-tiempo adaptativo: analizar como varia la convergencia y la seleccion de checkpoint al modificar el esquema de avance en pseudo-tiempo sobre un caso con solucion de referencia conocida.
- Benchmark interno de optimizadores: el paquete usa SOAP y proporciona un pipeline completo de entrenamiento, evaluacion e inferencia para comparar optimizadores en PINNs.
- Docencia en mecanica de fluidos computacional: caso autocontenido de flujo separado tras un escalon con datos SU2 de referencia y scripts listos para ejecutar.
- Investigacion en seleccion de checkpoints sin etiquetas: el contraste entre `best_model.pth` (error L2 0.003582) y `last_model.pth` (0.093482) ilustra el impacto de la estrategia de validacion fisica.
- Desarrollo de surrogates para CFD: servir como punto de partida para PINNs que aproximen campos estacionarios en geometrias con recirculacion, siempre que se valide contra simulacion numerica.
- Reproducibilidad en infraestructura DCU: referencia para equipos que despliegan entrenamiento PyTorch en aceleradores DCU con DTK y Slurm.

## Benchmarks y rendimiento

| Metrica | Este paquete | Articulo (Tabla 1) |
|---|---|---|
| Error relativo L2 en `u` (mejor checkpoint, paso 47.200) | 0.003582 | 0.002320 |
| Error relativo L2 en `u` (checkpoint final, paso 100.000) | 0.093482 | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es un modelo de lenguaje. La comparacion con el articulo corresponde a una unica ejecucion y no constituye una afirmacion de reproduccion exacta a nivel de paper.

## Requisitos de hardware

- Entrenamiento completo: una GPU o DCU con soporte PyTorch compatible; el run de referencia se ejecuto en una unica DCU con DTK y entorno Conda.
- El entrenamiento completo requiere un nodo de computo Slurm asignado; la configuracion incluida no recurre silenciosamente a CPU.
- Inferencia: carga de un MLP pequeno (repo de 0,1 GB) en GPU o CPU; no se especifica VRAM minima.
- VRAM estimada para inferencia: no disponible; por el tamano del repositorio y la naturaleza del modelo, es previsible que quepa en GPUs de consumo, aunque el autor no lo confirma.
- GPUs recomendadas: no disponible. El autor solo documenta una DCU.
- Opciones de despliegue: scripts `scripts/train.py`, `scripts/inference.py` y `scripts/result.py` sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PseudoTimePINN-BackwardFacingStep | PINN con pseudo-tiempo adaptativo, Fourier-feature MLP | no disponible | no aplica | Error L2 en `u` 0.003582 (mejor checkpoint) | other | HuggingFace + ModelScope |
| PINN estandar para BFS Re=800 (formulacion clasica) | PINN sin pseudo-tiempo | no disponible | no aplica | No disponible en la informacion proporcionada | no disponible | no disponible |
| JAXPI2 backward-facing-step | PINN en JAX con datos de referencia BFS | no disponible | no aplica | No disponible en la informacion proporcionada | consultar repositorio original | GitHub (sifanexisted/jaxpi2) |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; el unico contraste numerico documentado es frente a la Tabla 1 del propio articulo.

## Limitaciones y advertencias

- Dominio muy restringido: solo aproxima el campo estacionario del escalon de cara posterior a Re=800; no es un modelo de proposito general ni un modelo de lenguaje.
- El checkpoint final es sustancialmente peor que el mejor (0.093482 frente a 0.003582 en error L2 de `u`); en aplicaciones debe usarse `best_model.pth`.
- La reproduccion no alcanza el resultado del articulo (0.003582 frente a 0.002320) y corresponde a una unica ejecucion; no debe interpretarse como validacion exacta del paper.
- Riesgo de soluciones espurias: el propio articulo que motiva el paquete documenta que las PINN pueden converger a soluciones fisicamente incorrectas; la validacion contra SU2 es imprescindible.
- Dependencia de un dataset externo alojado en ModelScope con SHA256 fijado; sin ese fichero no puede ejecutarse la evaluacion.
- Licencia `other` sin terminos detallados en la model card: es necesario consultar el repositorio original antes de cualquier uso comercial o redistribucion. El campo de referencia remite a los terminos del repositorio JAXPI2.
- Entrenamiento completo dependiente de Slurm y de un acelerador DCU con DTK; no se garantiza funcionamiento en otras configuraciones.
- Idioma de documentacion unicamente en ingles; no hay soporte multilingue.
- Sin datos publicados sobre sesgos, latencia, throughput ni requisitos minimos de VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/PseudoTimePINN-BackwardFacingStep
- Articulo: https://arxiv.org/abs/2604.23528
- Dataset de referencia SU2 en ModelScope: https://www.modelscope.cn/datasets/OneScience/BackwardFacingStep-SU2-Re800
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneSkills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
- Datos de referencia JAXPI2 (backward-facing-step): https://github.com/sifanexisted/jaxpi2/tree/main/examples/bfs_flow/data
