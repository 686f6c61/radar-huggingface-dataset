# boldlab/tworoom-planning-128x5-5k

## Resumen

`boldlab/tworoom-planning-128x5-5k` es un checkpoint de modelo del mundo (world model) entrenado para planificación en el entorno sintético TwoRoom, desarrollado por el usuario `boldlab` y derivado por ajuste fino del modelo base `quentinll/lewm-tworooms`. No es un modelo de lenguaje: es un modelo predictivo de dinámica de entorno que, dado un estado y una secuencia de acciones, estima la evolución del sistema y permite seleccionar acciones mediante planificación con el método CEM (Cross-Entropy Method). Se distribuye a través de la librería `stable-worldmodel` y ocupa aproximadamente 0,1 GB en el repositorio.

El checkpoint corresponde al estado final tras 5.000 actualizaciones EGGROLL, con un presupuesto de planificación durante el entrenamiento de 128 candidatos CEM por 5 iteraciones. El entrenamiento se realizó sobre una suite fija de 10.000 tareas de entrenamiento y 1.000 de validación, con una población de 1.024 y 8 GPUs por ejecución. El tamaño reducido del repositorio y la ausencia de pesos en formatos estándar de LLM (safetensors, GGUF) confirman que se trata de un artefacto de investigación en aprendizaje por refuerzo y modelos del mundo, no de un modelo generativo de texto.

Su relevancia es acotada y experimental: sirve como referencia reproducible para estudiar cómo afecta el presupuesto de planificación (número de candidatos e iteraciones CEM) al rendimiento de un world model en una tarea de navegación con dos habitaciones. No hay información pública sobre licencia, idiomas ni benchmarks estándar de NLP, por lo que su evaluación debe hacerse exclusivamente en el contexto del entorno TwoRoom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo (world model) para planificacion; arquitectura concreta no disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | `weights.pt` (PyTorch state dict) |
| Modelo base | `quentinll/lewm-tworooms` |
| Libreria | `stable-worldmodel` |
| Tamano del repositorio | ~0,1 GB |
| Entorno | TwoRoom |
| Presupuesto de planificacion (entrenamiento) | 128 candidatos CEM x 5 iteraciones |
| Actualizaciones de entrenamiento | 5.000 (EGGROLL) |
| Poblacion | 1.024 |
| GPUs por ejecucion | 8 |
| Tareas de entrenamiento | 10.000 |
| Tareas de validacion | 1.000 |
| Learning rate | 0,004114155739091268 |
| Sigma | 0,002174092466593994 |
| Semilla | 3072 |
| Action chunk size | 5 |
| Commit de origen | `8bdcb97` en `fracapuano/evolving-wm` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de red, numero de capas, dimensiones ocultas ni mecanismo de atencion). Lo que si se documenta es el procedimiento de entrenamiento: se parte del modelo base `quentinll/lewm-tworooms` y se aplica un ajuste fino con el algoritmo EGGROLL durante 5.000 actualizaciones, con una poblacion de 1.024 y 8 GPUs por ejecucion. El entrenamiento utiliza una suite fija de 10.000 tareas de entrenamiento y 1.000 de validacion en el entorno TwoRoom, con un `action chunk size` de 5, es decir, el modelo predice o consume bloques de 5 acciones consecutivas.

La innovacion metodologica destacable es la incorporacion de un presupuesto de planificacion CEM durante el propio entrenamiento: 128 candidatos por 5 iteraciones. Esto implica que el modelo se optimiza en un regimen de planificacion concreto, y el checkpoint resultante esta etiquetado explicitamente con ese presupuesto. El autor advierte que los ajustes del planificador en evaluacion pueden cambiarse de forma independiente, de modo que el checkpoint puede evaluarse con otros presupuestos CEM distintos de los usados en entrenamiento. El repositorio incluye `config.json` (arquitectura), `planner_config.json` (planificador de entrenamiento) y `provenance.json` (reproducibilidad), ademas de los protocolos de tareas.

## Capacidades

- Prediccion de dinamica de entorno: estima la evolucion del estado en el entorno TwoRoom dado un estado y una secuencia de acciones.
- Planificacion basada en modelo: selecciona acciones mediante el Cross-Entropy Method con un presupuesto configurable de candidatos e iteraciones.
- Procesamiento de bloques de accion: opera con `action chunk size` de 5, es decir, secuencias de 5 acciones por paso de planificacion.
- Ajuste fino sobre un world model preentrenado (`quentinll/lewm-tworooms`), lo que permite heredar las capacidades de representacion del modelo base.
- Reproducibilidad experimental: incluye configuracion de arquitectura, planificador y procedencia para replicar el entrenamiento.
- No dispone de capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes linguisticos ni multilingueismo, al no ser un modelo de lenguaje.

## Casos de uso

- Investigacion en modelos del mundo: sirve como checkpoint de referencia para estudiar el efecto del presupuesto de planificacion CEM (128x5) sobre el rendimiento en TwoRoom, comparandolo con otros checkpoints del mismo barrido.
- Reproduccion de experimentos: gracias a `provenance.json`, `config.json` y `planner_config.json`, permite replicar el entrenamiento de 5.000 actualizaciones EGGROLL con los mismos hiperparametros (learning rate 0,004114, sigma 0,002174, semilla 3072).
- Barrido de planificadores en evaluacion: el autor indica que los ajustes del planificador en evaluacion pueden cambiarse de forma independiente, por lo que el checkpoint se puede usar para medir sensibilidad del rendimiento a distintos presupuestos CEM sin reentrenar.
- Estudio de algoritmos evolutivos: al emplear EGGROLL con poblacion de 1.024, el checkpoint es util para analizar la convergencia de metodos evolutivos aplicados a world models.
- Navegacion en entornos con dos habitaciones: el modelo puede integrarse en un bucle de planificacion para tareas de navegacion en el entorno TwoRoom, seleccionando secuencias de 5 acciones que maximicen la recompensa estimada.
- Baseline para comparativas de world models: al ser un ajuste fino de `quentinll/lewm-tworooms`, permite aislar el efecto del entrenamiento adicional con planificacion CEM frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento, tasas de exito en TwoRoom ni comparaciones numericas con otros checkpoints. El autor advierte ademas que se trata de checkpoints de una sola semilla de entrenamiento, por lo que los resultados de evaluacion entre semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa ~0,1 GB, lo que sugiere un modelo de pequeno tamano, pero no se especifica el numero de parametros ni la VRAM necesaria.
- GPU recomendadas: no disponible. El entrenamiento se realizo con 8 GPUs por ejecucion, pero no se indica el modelo concreto (A100, H100, etc.).
- Compatibilidad con GPU de consumo: no disponible. Por el tamano del repositorio (~0,1 GB) es plausible que quepa en GPU de consumo, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: la libreria indicada es `stable-worldmodel`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entorno | Planificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `boldlab/tworoom-planning-128x5-5k` | no disponible | no aplica | TwoRoom | CEM 128x5 en entrenamiento | no disponible | Hugging Face |
| `quentinll/lewm-tworooms` (modelo base) | no disponible | no aplica | TwoRoom | no disponible | no disponible | Hugging Face |
| Otros checkpoints del barrido `uwp4wk77` | no disponible | no aplica | TwoRoom | presupuestos CEM variables | no disponible | WandB (referencia) |

No se dispone de datos suficientes para comparar parametros, rendimiento ni licencia con alternativas de la misma categoria. La unica comparacion documentada es con el modelo base `quentinll/lewm-tworooms`, del que este checkpoint es un ajuste fino, pero no se aportan metricas diferenciales.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al operar en un entorno sintetico (TwoRoom), los sesgos relevantes serian los del propio simulador, no sesgos sociales o linguisticos.
- Riesgo de alucinacion: no aplica en el sentido linguistico; sin embargo, como modelo predictivo, puede generar trayectorias o estados estimados que divergen de la dinamica real del entorno.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural ni tiene ventana de contexto textual.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- Variabilidad entre semillas: el autor advierte explicitamente que son checkpoints de una sola semilla de entrenamiento; los resultados de evaluacion entre semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento.
- Especificidad del entorno: el modelo esta entrenado exclusivamente en TwoRoom y no se ha validado en otros entornos; su generalizacion es desconocida.
- Ausencia de benchmarks publicados: no hay metricas de rendimiento que permitan evaluar su calidad frente a alternativas.
- Formato de pesos propietario de la libreria: `weights.pt` requiere `stable-worldmodel` para su carga; no hay conversion documentada a otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boldlab/tworoom-planning-128x5-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio de codigo (evolving-wm): https://github.com/fracapuano/evolving-wm
- Ejecucion de entrenamiento en WandB: https://wandb.ai/francescocapuano/evolving-wm/runs/zw3yow3p
- Barrido de presupuesto de planificacion en WandB: https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
