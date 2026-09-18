# humanlong/improving-self-evolution-mbpp

## Resumen

El repositorio `humanlong/improving-self-evolution-mbpp` publica los checkpoints finales fusionados de un experimento de auto-evolucion (*self-training* y auto-destilacion) de cinco rondas completas, realizado por el usuario humanlong sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`. No se trata de un modelo nuevo entrenado desde cero, sino de tres variantes de un modelo de 1,5B parametros (etiquetadas `plain`, `spd_hard` y `spectral_soft`) obtenidas tras cinco ciclos de generacion de candidatos, ajuste LoRA, fusion del adaptador y evaluacion sobre MBPP.

El problema que aborda es metodologico: como se comporta la auto-evolucion con modelos pequenos cuando el entrenamiento incluye candidatos incorrectos sin filtrar, y como afectan distintas variantes de seleccion o ponderacion de candidatos (`spd_hard` frente a `spectral_soft`) a metricas de correccion y de diversidad de implementaciones. El interés actual reside en que cuantifica empiricamente un fenomeno conocido: la mejora de `pass@1` a costa de una perdida sistematica de diversidad de implementaciones, con intervalos de confianza y comparaciones pareadas.

El repositorio (9,3 GB) contiene los tres checkpoints fusionados en safetensors, el informe compacto de evaluacion con 64 muestras por tarea (`eval64/`) y las metricas por ronda. Se declara explicitamente que son artefactos de investigacion y que no deben tratarse como modelos de generacion de codigo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, familia Qwen2.5; adaptadores LoRA fusionados sobre el modelo base |
| Parametros totales | ~1.500 millones (1,5B), heredados del modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`; no se detalla en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; el modelo base Qwen2.5-Coder-1.5B-Instruct declara 32.768 tokens, pero este dato no se verifica en la ficha publicada |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos safetensors sin cuantizar; no incluye GGUF, AWQ, GPTQ ni variantes de 8/4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, en tres subcarpetas: `plain/`, `spd_hard/`, `spectral_soft/` |
| Tamano del repositorio | 9,3 GB (tres checkpoints mas artefactos de evaluacion) |
| Libreria | transformers |
| Dataset de entrenamiento | `google-research-datasets/mbpp` (291 tareas de entrenamiento) |
| Metodo de ajuste | LoRA de una epoca por ronda, posteriormente fusionado en los pesos |
| Semilla | 43 (unica semilla de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only causal con atencion por grupos (GQA) y tokenizador propio de Qwen. Sobre el se aplica un ciclo de auto-evolucion repetido cinco veces de forma independiente para cada metodo: (1) generar 16 candidatos brutos para cada una de las 291 tareas de entrenamiento de MBPP, lo que produce 4.656 candidatos por ronda; (2) entrenar una epoca de LoRA sobre los 4.656 candidatos, incluyendo los incorrectos, sin filtrado por correccion; (3) fusionar el adaptador en el modelo; (4) evaluar 16 muestras sobre las 500 tareas retenidas de MBPP. Cada ronda parte del checkpoint fusionado de la ronda anterior.

Las tres variantes finales corresponden a distintas estrategias de tratamiento de los candidatos: `plain` (entrenamiento estandar sobre todos los candidatos), `spd_hard` y `spectral_soft`. El informe final anade una evaluacion complementaria con 64 muestras por tarea (32.000 muestras por modelo) sobre las mismas 500 tareas. La innovacion tecnica destacable no esta en la arquitectura, sino en la instrumentacion experimental: metricas pareadas con intervalos de confianza del 95 %, huellas AST (*AST fingerprints*) como proxy de diversidad de implementaciones y una metrica de cobertura condicionada a las tareas que generan suficientes candidatos correctos (`correct-matched AST coverage`). No se menciona uso de RLHF, DPO ni decodificacion especulativa. Los diagnosticos de politica de generacion se desactivaron durante el experimento.

## Capacidades

- Generacion de codigo Python: el modelo esta especializado y evaluado exclusivamente en tareas de programacion de MBPP, con funcion objetivo de producir funciones que superen tests unitarios.
- Razonamiento de un solo turno orientado a codigo: no se documentan capacidades de razonamiento multi-paso explicito ni modo *thinking*.
- Generacion de multiples candidatos: el diseno experimental se apoya en muestrear 16 o 64 candidatos por tarea, lo que implica capacidad de producir soluciones alternativas.
- Diversidad de implementaciones: los checkpoints conservan cierta cobertura AST, pero menor que la del modelo base (ver benchmarks); `spectral_soft` retiene mas que los otros dos metodos.
- Evaluacion de codigo: no es una capacidad del modelo, pero el repositorio incluye el utillaje de evaluacion por ejecucion de candidatos y comparacion de AST.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; no se documenta.
- Capacidades multilingues: solo se declara ingles (`en`); no hay evidencia de soporte de otros idiomas.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Reproduccion de experimentos de auto-evolucion: el repositorio incluye configuracion exacta, metricas por ronda, sumas SHA-256 y el enlace al codigo de resultados, lo que permite reejecutar el ciclo de cinco rondas con semilla 43 y comparar contra los checkpoints publicados.
- Estudio del colapso de diversidad: comparar la cobertura AST del modelo base (12,802 en cobertura total @64) frente a la de los checkpoints auto-evolucionados (8,388-11,510) para cuantificar cuanta variedad de implementaciones se pierde al entrenar con candidatos propios sin filtrado por correccion.
- Linea base para metodos de seleccion de candidatos: `spectral_soft` y `spd_hard` sirven como referencia controlada en experimentos que propongan nuevas estrategias de ponderacion o filtrado, con sus deltas pareados ya calculados.
- Desarrollo y validacion de harness de evaluacion de codigo: el utillaje del repositorio (ejecucion de candidatos, huellas AST, intervalos de confianza pareados, criterio de no inferioridad del 1 %) es reutilizable para montar evaluaciones de `pass@k` y cobertura en otros modelos pequenos.
- Docencia e investigacion sobre LoRA: el ciclo generar-puntuar-entrenar-fusionar con 4.656 candidatos y una epoca por ronda es un caso de estudio asequible para explicar ajuste eficiente de parametros en modelos de 1,5B.
- Analisis estadistico de experimentos de auto-mejora: los informes con deltas pareados (por ejemplo, +0,293 de cobertura a favor de `spectral_soft` frente a `spd_hard` en 251 tareas compartidas) permiten estudiar como se comportan los criterios de no inferioridad cuando la metrica principal y la metrica de diversidad apuntan en direcciones opuestas.
- Prototipado local de generacion de codigo: con ~3 GB de pesos en bf16, un checkpoint puede cargarse en una GPU de consumo para explorar generacion de funciones Python en local, siempre como experimento y no como servicio en produccion.

## Benchmarks y rendimiento

Resultados de la ronda 5, con 16 muestras por tarea sobre 500 tareas retenidas de MBPP:

| Modelo | pass@1 | IC 95 % | Cobertura AST emparejada por correccion (4 extracciones correctas) | Tareas elegibles |
|---|---:|---|---:|---:|
| Base | 0,3793 | [0,3469, 0,4140] | 3,310 | 262/500 |
| Plain | 0,4131 | [0,3794, 0,4495] | 2,747 | 268/500 |
| SPD-hard | 0,4135 | [0,3785, 0,4510] | 2,690 | 262/500 |
| Spectral-soft | 0,4017 | [0,3681, 0,4376] | 2,997 | 263/500 |

Evaluacion final con 64 muestras por tarea (32.000 muestras por modelo sobre las mismas 500 tareas):

| Modelo | pass@1 | pass@64 | Cobertura AST total @64 | Cobertura emparejada por correccion @4 (elegibles) |
|---|---:|---:|---:|---:|
| Base | 0,379 | 0,720 | 12,802 | 3,358 (322/500) |
| Plain | 0,414 | 0,704 | 8,506 | 2,856 (321/500) |
| SPD-hard | 0,418 | 0,702 | 8,388 | 2,810 (321/500) |
| Spectral-soft | 0,403 | 0,726 | 11,510 | 3,143 (323/500) |

Deltas declarados por el autor: `spectral_soft` frente a `spd_hard` mejora la cobertura total @64 en +3,122 [2,686, 3,596], `pass@64` en +0,024 [0,006, 0,044] y la cobertura emparejada por correccion @4 en +0,334 [0,290, 0,379]; sin embargo, su `pass@1` es inferior en -0,0143 [-0,0189, -0,0098], por lo que no se cumple el criterio declarado de no inferioridad del 1 %. En la ronda 5 el delta de cobertura emparejada de `spectral_soft` frente a `spd_hard` fue de +0,293 [0,233, 0,353] en 251 tareas compartidas elegibles, con un delta de `pass@1` de -0,0118 [-0,0190, -0,0048]. Los tres metodos perdieron diversidad de implementaciones respecto al modelo base a lo largo de las cinco rondas.

## Requisitos de hardware

- VRAM estimada para inferencia (un unico checkpoint):
  - bf16/fp16: aproximadamente 3,1 GB de pesos mas cache KV y activaciones; en la practica, 4-6 GB para contextos moderados, y mas si se agota la ventana larga del modelo base.
  - int8 (si se convierte externamente): aproximadamente 1,6 GB de pesos.
  - int4 (si se convierte externamente): aproximadamente 0,9-1,2 GB de pesos.
- GPU recomendadas: al ser un modelo de 1,5B, cualquier GPU con 8 GB o mas es suficiente en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10). En configuraciones con muchas peticiones concurrentes o contextos largos conviene una A100 o H100, pero no son necesarias por tamano de pesos.
- Cabe en GPU de consumo: si. En 4 bits cabria en GPUs de 6 GB; en bf16 requiere al menos 6-8 GB, mas margen para la cache KV.
- Opciones de despliegue: carga directa con transformers usando el parametro `subfolder` (`plain`, `spd_hard` o `spectral_soft`) con `torch_dtype="auto"` y `device_map="auto"`, tal como documenta el autor. vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion proporcionada; para usarlos habria que convertir los pesos a los formatos correspondientes (GGUF o equivalentes), conversion que no esta incluida en el repositorio.
- Latencia y throughput: no disponibles; el autor no publica mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 en MBPP (16 muestras) | Cobertura AST total @64 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| spectral_soft (este repositorio) | ~1,5B | no disponible | 0,4017 | 11,510 | apache-2.0 | safetensors en HF |
| spd_hard (mismo repositorio) | ~1,5B | no disponible | 0,4135 | 8,388 | apache-2.0 | safetensors en HF |
| plain (mismo repositorio) | ~1,5B | no disponible | 0,4131 | 8,506 | apache-2.0 | safetensors en HF |
| Qwen2.5-Coder-1.5B-Instruct (modelo base) | ~1,5B | no disponible en este informe | 0,3793 | 12,802 | apache-2.0 | safetensors en HF |
| Otros modelos de codigo de 1-3B (por ejemplo, familias tipo StarCoder2 o DeepSeek-Coder) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion significativa en la informacion disponible es contra el propio modelo base y contra los otros dos metodos del mismo experimento: los tres checkpoints mejoran `pass@1` respecto al base (0,4017-0,4135 frente a 0,3793) pero reducen la diversidad de implementaciones, y ninguno alcanza el criterio de no inferioridad del 1 % declarado por el autor. No se han publicado en la informacion proporcionada resultados comparativos con modelos de terceros.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que estos checkpoints no deben tratarse como modelos de generacion de codigo para produccion.
- Una sola semilla de entrenamiento (43): los resultados no permiten estimar variabilidad entre semillas.
- Evaluacion limitada: 16 muestras por tarea en las rondas y 64 en la evaluacion final; la cobertura emparejada por correccion solo es elegible en 24-53 tareas por modelo con presupuesto 64, lo que restringe la potencia estadistica.
- Entrenamiento sin filtrado por correccion: se entrenan candidatos incorrectos, lo que puede reforzar patrones erroneos y contribuye a la perdida de diversidad observada.
- Perdida de diversidad: los tres metodos reducen la cobertura AST respecto al modelo base; `pass@1` mas alto no implica mas variedad de soluciones ni mejor cobertura de casos limite.
- Criterio de no inferioridad no cumplido: `spectral_soft` mejora diversidad y `pass@64`, pero su `pass@1` cae por debajo del umbral del 1 %, de modo que no puede presentarse como sustituto estrictamente mejor que `spd_hard` o `plain`.
- Proxies de evaluacion: las huellas AST son un proxy de implementacion, no algoritmos anotados independientemente.
- Entorno de ejecucion no aislado: los candidatos se ejecutaron con un evaluador local explicitamente habilitado, no con un evaluador Docker aislado, lo que reduce la reproducibilidad del entorno y aumenta el riesgo de efectos del sistema anfitrion.
- Diagnosticos desactivados: los diagnosticos de politica de generacion no se registraron, por lo que no hay trazabilidad de como la politica de muestreo evoluciono entre rondas.
- Idioma y dominio: solo ingles declarado y evaluacion exclusivamente sobre MBPP, un benchmark de funciones Python de dificultad moderada; el comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: no se documenta, pero un modelo de 1,5B ajustado sobre candidatos autogenerados sin filtrado es propenso a producir codigo sintacticamente plausible y funcionalmente incorrecto.
- Licencia: apache-2.0, por lo que el uso comercial esta permitido por la licencia, aunque la idoneidad tecnica para produccion no esta respaldada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/humanlong/improving-self-evolution-mbpp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/google-research-datasets/mbpp
- Codigo y resultados completos del experimento: https://github.com/yuhanlydia/improving/tree/main/results/retention_5round_train16_eval16_seed43
- Informe de la evaluacion de 64 muestras: https://huggingface.co/humanlong/improving-self-evolution-mbpp/blob/main/eval64/REPORT.md
- Paper o publicacion asociada: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
