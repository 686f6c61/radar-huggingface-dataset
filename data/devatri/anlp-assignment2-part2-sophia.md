# Devatri/anlp-assignment2-part2-sophia

## Resumen

`Devatri/anlp-assignment2-part2-sophia` es un checkpoint de un modelo de lenguaje denso (transformer denso) entrenado con el optimizador Sophia, publicado por el usuario Devatri como parte de una asignatura (ANLP Assignment 2, parte 2). El modelo se ha entrenado con una unica pasada sobre el corpus `browndw/human-ai-parallel-corpus`, dividiendo el split de entrenamiento por familia de documentos. Se trata, por tanto, de un artefacto de investigacion y reproducibilidad academica mas que de un modelo pensado para produccion.

El repositorio tiene un tamano de 0,4 GB e incluye un fichero `checkpoint.pt` que almacena el state dict del modelo (`model`), la configuracion del modelo (`model_configuration`), el estado del optimizador (`optimizer`), el escalador de gradiente (`grad_scaler`) y contadores de tokens y pasos. El propio autor indica que el modelo se puede reconstruir con `DenseTransformer(ModelConfig(**checkpoint['model_configuration']))` a partir de `model.py`.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto, los idiomas soportados, la licencia ni resultados de evaluacion. La relevancia actual de esta ficha es documentar el artefacto y advertir de sus limitaciones antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`DenseTransformer`, definido en `model.py` del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint.pt`, serializado con el state dict del modelo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso implementado en `model.py` bajo la clase `DenseTransformer`, con una clase de configuracion `ModelConfig`. No se especifican en la informacion disponible el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el tipo de normalizacion o activacion. El checkpoint contiene el state dict completo del modelo, lo que permite inspeccionar su estructura real cargandolo con PyTorch.

El entrenamiento consiste en una unica pasada sobre el corpus `browndw/human-ai-parallel-corpus`, con el split de entrenamiento dividido por familia de documentos. El rasgo tecnico mas relevante es el uso del optimizador Sophia para el entrenamiento; el repositorio incluye el estado del optimizador y un escalador de gradiente, lo que sugiere entrenamiento en precision mixta. El fichero `metrics.csv` recoge checkpoints de cada optimizador en el rango 0,1-1,0, lo que apunta a un experimento comparativo entre varios optimizadores, no a un unico entrenamiento aislado. No se documentan datos sobre numero de tokens de entrenamiento, composicion detallada del dataset ni fases de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generacion de texto basica: al ser un modelo de lenguaje entrenado de forma causal, se le presupone capacidad de continuar texto, aunque no hay evaluacion publica que lo confirme.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento citado (`human-ai-parallel-corpus`) es en ingles, pero esto no se confirma en la ficha como idioma final del modelo.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades de codigo o matematicas.

## Casos de uso

- Reproducibilidad de experimentos con optimizadores: cargar `checkpoint.pt` y reconstruir el modelo con `DenseTransformer(ModelConfig(...))` para replicar las curvas registradas en `metrics.csv` y comparar Sophia frente a otros optimizadores.
- Investigacion sobre optimizadores de segundo orden: el artefacto permite analizar el estado del optimizador y el escalador de gradiente guardados para estudiar el comportamiento de Sophia en un transformer denso pequeno.
- Docencia y asignaturas de PLN: sirve como ejemplo completo de pipeline de entrenamiento (dataset, configuracion, checkpoint, metricas) para clases practicas.
- Punto de partida para fine-tuning controlado: al incluir la configuracion del modelo, se puede cargar y continuar el ajuste sobre tareas pequenas, siempre verificando primero la arquitectura real.
- Analisis del corpus human-AI: usar el modelo y las metricas asociadas para estudiar como un LM aprende sobre un corpus paralelo humano-IA en una sola pasada.
- Pruebas de herramientas de inferencia: emplearlo como banco de pruebas minimo para validar scripts de carga de checkpoints PyTorch antes de pasar a modelos mayores.
- Auditoria de artefactos academicos: verificar la integridad del checkpoint mediante el sha256 publicado y evaluar buenas practicas de publicacion.

Nota: ninguno de estos casos debe plantearse como uso de produccion sin una evaluacion previa, dado que no hay datos de rendimiento ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, ya que no se conoce el numero de parametros ni la precision de los pesos.
- El repositorio completo ocupa 0,4 GB, pero incluye el state dict, el estado del optimizador, el escalador de gradiente y contadores; el modelo por si solo es presumiblemente bastante menor, aunque esta cifra no puede confirmarse con los datos aportados.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmable sin conocer el tamano real del modelo; dado el reducido tamano del repositorio, es plausible que quepa en GPUs de consumo, pero se trata de una suposicion no verificada.
- Opciones de despliegue: el formato es PyTorch nativo (`checkpoint.pt`), por lo que la via directa es cargarlo con el codigo del repositorio (`model.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos en GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de datos de parametros, contexto ni rendimiento que permitan establecer una comparacion fiable con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia explicita: no se especifica ninguna licencia, lo que impide determinar si se permite uso comercial. Debe tratarse como uso restringido hasta aclaracion.
- Artefacto academico: es un checkpoint de asignatura, no un modelo validado ni mantenido.
- Sin evaluacion publicada: no hay benchmarks, evaluaciones de sesgo ni pruebas de robustez.
- Riesgo de alucinacion: previsiblemente alto en un modelo de este tipo, aunque no cuantificado.
- Contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados, lo que limita cualquier uso multilingue o de contexto largo.
- Un solo epoch: el entrenamiento consta de una unica pasada sobre el corpus, lo que sugiere un nivel de ajuste bajo de los pesos.
- Datos de entrenamiento poco documentados: no se detalla la composicion, filtrado ni posibles sesgos del corpus `browndw/human-ai-parallel-corpus`.
- Recomendacion para produccion: no emplear en entornos productivos sin una evaluacion exhaustiva previa, verificacion de licencia y comprobacion de la arquitectura real cargando el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devatri/anlp-assignment2-part2-sophia
- Dataset de entrenamiento: `browndw/human-ai-parallel-corpus` (referenciado en la model card; enlace directo no proporcionado)
- `model.py` y `metrics.csv`: incluidos en el repositorio del modelo (enlace directo no proporcionado)
